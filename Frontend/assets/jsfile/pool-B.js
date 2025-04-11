import {checkAdminAccess}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

  document.addEventListener('DOMContentLoaded', async function () {
    const playerPairsContainer = document.getElementById('createdPairsContainer');
    const submitPairsButton = document.getElementById('submitPairsButton');
    const pairsInputContainer = document.getElementById('pairsInputContainer');
    const pairsTableBody = document.getElementById('pairsTableBody'); // Table body reference
    const matchHeading = document.getElementById('matchHeading');
    const addPairButton = document.getElementById('addPairButton');
    const urlParams = new URLSearchParams(window.location.search);
    const matchName = urlParams.get('match');
    const poolName = urlParams.get('pool_name');
    const poolId = urlParams.get('id');

    let allPlayers = [];
    let createdPairs = [];

    // Fetch the pair data for "Gold" pool from the API
    try {
      const response = await fetch('https://krinik.in/pair_captain_get/');
      const data = await response.json();
      const pairsData = data.data;

      // Filter pairs that belong to the "Gold" pool
      // const filteredPairs = pairsData.filter(pair => pair.pool_name.pool_type === "Gold" && pair.pool_name.pool_name === poolName);
      const filteredPairs = pairsData.filter(pair => pair.pool_name.id == poolId);

      // Map the fetched data to createdPairs to display them
      createdPairs = filteredPairs.map(pair => ({
        player_1: pair.player_1.player_name,
        player_2: pair.player_2.player_name,
        limit: pair.limit,
        id: pair.id // For backend pairs
      }));

      displayCreatedPairs(); // Display pairs on the page

      // Fetch match data (this part is to show teams and players in the dropdowns)
      fetchMatchData(matchName);

    } catch (error) {
      console.error('Error fetching pairs:', error);
    }

    // Function to fetch match data and populate player lists
    async function fetchMatchData(matchName) {
      try {
        const response = await fetch('https://krinik.in/match_get/');
        const data = await response.json();
        const matchData = data.data.find(match => match.match_display_name.includes(matchName));

        if (matchData) {
          const teamAName = matchData.select_team_A.team_name;
          const teamBName = matchData.select_team_B.team_name;
          matchHeading.textContent = `${teamAName} vs ${teamBName}`;

          allPlayers = [
            ...matchData.select_player_A.map(player => player.player_name),
            ...matchData.select_player_B.map(player => player.player_name)
          ];

          createPlayerPairDropdown(); // Initialize the player dropdown
          addPairButton.addEventListener('click', function () {
            // Get the last input group (if exists) and its limit input field
            const lastInputGroup = pairsInputContainer.querySelector('.input-group:last-child');

            // Check if the last input group exists and if its limit input field has a value
            if (lastInputGroup) {
              const lastLimitInput = lastInputGroup.querySelector('input[type="text"]');

              if (!lastLimitInput.value) {
                // If the last limit input is empty, prevent adding a new pair
                alert('Please enter a limit for the current pair before adding a new one.');
                return;
              }
            }

            // If there is a valid limit in the last input group, create a new pair dropdown
            createPlayerPairDropdown();
          });

        }
      } catch (error) {
        console.error('Error fetching match data:', error);
      }
    }

    // Function to display the list of created pairs in a table
    function displayCreatedPairs() {
      pairsTableBody.innerHTML = ''; // Clear previous table rows

      createdPairs.forEach((pair, index) => {
        const row = document.createElement('tr');

        const noCell = document.createElement('td');
        noCell.textContent = index + 1;

        const player1Cell = document.createElement('td');
        player1Cell.textContent = pair.player_1;

        const player2Cell = document.createElement('td');
        player2Cell.textContent = pair.player_2;

        const limitCell = document.createElement('td');
        limitCell.textContent = pair.limit;

        // Edit button
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-primary btn-sm';
        editButton.addEventListener('click', function () {
          openEditModal(pair);  // Function to open modal for editing
        });

        // Remove button
        const removeCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger btn-sm';
        removeButton.addEventListener('click', function () {
          deletePair(pair.id, pair.byD);  // Call delete function with pair id or byD
        });
        editCell.appendChild(editButton);

        editCell.appendChild(removeButton);

        // Append cells to row
        row.appendChild(noCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        row.appendChild(limitCell);
        row.appendChild(editCell);
        // row.appendChild(removeCell);

        // Append row to table body
        pairsTableBody.appendChild(row);
      });
    }

    // Add modal opening and saving logic for both backend and static data
    let currentEditingPairId = null;
    let currentEditingByD = null; // For static pairs

    function openEditModal(pair) {
      const editModal = document.getElementById('editModal');
      const editLimitInput = document.getElementById('editLimitInput');
      editLimitInput.value = pair.limit;

      editModal.style.display = 'block';
      currentEditingPairId = pair.id ? pair.id : null;  // Store pair id for backend pairs
      currentEditingByD = pair.byD ? pair.byD : null;  // Store byD for static pairs
    }

    document.getElementById('closeEditButton').addEventListener('click', function () {
      document.getElementById('editModal').style.display = 'none';
    });

    // Save changes functionality
    document.getElementById('saveEditButton').addEventListener('click', function () {
      const newLimit = document.getElementById('editLimitInput').value;

      if (currentEditingPairId) {
        // Backend pair update
        const pair = createdPairs.find(pair => pair.id === currentEditingPairId);
        if (pair) {
          pair.limit = newLimit;
          fetch(`https://krinik.in/pair_captain_get/${pair.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ limit: newLimit }),
          })
            .then(response => response.json())
            .then(() => {
              displayCreatedPairs();  // Refresh after update
              document.getElementById('editModal').style.display = 'none';
            })
            .catch(error => console.error('Error updating pair:', error));
        }
      } else if (currentEditingByD) {
        // Static pair update
        const pair = createdPairs.find(pair => pair.byD === currentEditingByD);
        if (pair) {
          pair.limit = newLimit; // Update locally for static pairs
          displayCreatedPairs();  // Refresh the table
          document.getElementById('editModal').style.display = 'none';
        }
      }
    });

    // Delete function for both backend and static data
    function deletePair(pairId, byD) {
      if (!pairId) {
        // Static pair deletion: remove from createdPairs and remove associated input group
        createdPairs = createdPairs.filter((pair) => pair.byD !== byD);

        // Find the input group with the matching byD and remove it
        const inputGroup = document.querySelector(`[data-byd="${byD}"]`);
        if (inputGroup) {
          inputGroup.remove(); // Remove the dropdown from the DOM
        }

        // Update the table
        displayCreatedPairs();
      } else {
        // Backend pair deletion
        fetch(`https://krinik.in/pair_captain_get/${pairId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete pair');
            }
            return response.json();
          })
          .then(() => {
            // Remove the pair from the createdPairs array and update the table
            createdPairs = createdPairs.filter(pair => pair.id !== pairId);
            displayCreatedPairs(); // Update table
          })
          .catch(error => console.error('Error deleting pair:', error));
      }
    }


    // Function to dynamically create dropdowns for new player pairs
    function createPlayerPairDropdown() {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group mb-3';

      // Generate a unique byD for each static pair and associate it with the input group
      const byD = 'staticPair-' + Math.random().toString(36).substr(2, 9);
      inputGroup.setAttribute('data-byd', byD);  // Store byD for easy removal later

      const selectA = createPlayerDropdown(allPlayers);
      const selectB = createPlayerDropdown(allPlayers);

      const limitInput = document.createElement('input');
      limitInput.type = 'text';
      limitInput.className = 'form-control';
      limitInput.placeholder = 'Limit';

      selectA.addEventListener('change', function () {
        handleSelectionChange(selectA, selectB, limitInput);
      });

      selectB.addEventListener('change', function () {
        handleSelectionChange(selectA, selectB, limitInput);
      });

      limitInput.addEventListener('input', function () {
        updateCreatedPairs(selectA, selectB, limitInput, byD);
      });

      inputGroup.appendChild(selectA);
      inputGroup.appendChild(selectB);
      inputGroup.appendChild(limitInput);
      pairsInputContainer.appendChild(inputGroup);
    }


    // Helper function to create a dropdown with player options
    function createPlayerDropdown(players) {
      const selectElement = document.createElement('select');
      selectElement.className = 'form-control player-dropdown';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Player';
      selectElement.appendChild(defaultOption);

      players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        selectElement.appendChild(option);
      });

      return selectElement;
    }

    // Handle the selection of players and prevent duplicates
    function handleSelectionChange(selectA, selectB, limitInput) {
      const playerA = selectA.value;
      const playerB = selectB.value;

      if (playerA && playerB) {
        if (playerA === playerB) {
          alert('Player A and Player B cannot be the same.');
          selectA.value = '';
          selectB.value = '';
        } else if (pairExists(playerA, playerB)) {
          alert('This pair already exists.');
          selectA.value = '';
          selectB.value = '';
        } else {
          limitInput.value = '';
          createdPairs = createdPairs.filter(pair => !(pair.player_1 === playerA && pair.player_2 === playerB || pair.player_1 === playerB && pair.player_2 === playerA));
          displayCreatedPairs();
        }
      }
    }
    function updateCreatedPairs(selectA, selectB, limitInput, byD) {
      const playerA = selectA.value;
      const playerB = selectB.value;
      const limit = limitInput.value;

      if (playerA && playerB && limit) {
        const existingPairIndex = createdPairs.findIndex(pair => (pair.player_1 === playerA && pair.player_2 === playerB) || (pair.player_1 === playerB && pair.player_2 === playerA));

        if (existingPairIndex !== -1) {
          createdPairs[existingPairIndex].limit = parseInt(limit, 10);
        } else {
          createdPairs.push({
            player_1: playerA,
            player_2: playerB,
            limit: parseInt(limit, 10),
            byD: byD,  // Assign byD to the new pair
            isNew: true // Mark as new for future submissions
          });
        }
        displayCreatedPairs();
      }
    }

    // Check if the pair already exists
    function pairExists(playerA, playerB) {
      return createdPairs.some(pair => {
        return (pair.player_1 === playerA && pair.player_2 === playerB) ||
          (pair.player_1 === playerB && pair.player_2 === playerA);
      });
    }

    // Submit the created pairs to the server
    submitPairsButton.addEventListener('click', async function () {
      // Filter out pairs that are not new
      const newPairs = createdPairs.filter(pair => pair.isNew);

      if (newPairs.length === 0) {
        alert('No new pairs created.');
        return;
      }
showLoader()
      // Submit new pairs to the server
      try {
        for (const pair of newPairs) {
          const payload = {
            pool_name: poolName,
            select_match: matchName,
            player_1: pair.player_1,
            player_2: pair.player_2,
            limit: pair.limit,
            pool_type: "Gold" // Change this to Gold for the current pool
          };

          const response = await fetch('https://krinik.in/pair_captain_get/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            console.error('Network response was not ok.');
            throw new Error('Network response was not ok.');
          }
        }
        window.location.href = './manage-pool.html';
      } catch (error) {
        console.error('Error submitting pairs:', error);
      }
      hideLoader()
    });

    window.onload = checkAdminAccess();
  });
