import {checkAdminAccess}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

  document.addEventListener('DOMContentLoaded', function () {
    const playerPairsContainer = document.getElementById('createdPairsContainer');
    const submitPairsButton = document.getElementById('submitPairsButton');
    const pairsInputContainer = document.getElementById('pairsInputContainer');
    const matchHeading = document.getElementById('matchHeading');
    const addPairButton = document.getElementById('addPairButton');
    const urlParams = new URLSearchParams(window.location.search);
    const matchName = urlParams.get('match');
    const poolName = urlParams.get('pool_name');
    var id = urlParams.get('id');

    let allPlayers = [];
    let createdPairs = [];

    // Fetch existing pairs for the pool
    fetch(`https://krinik.in/pair_get/`)
      .then(response => response.json())
      .then(data => {
        const pairs = data.data.filter((x) => x.pool_name.id == id);
        createdPairs = pairs.map(pair => ({
          id: pair.id, // Save the id for deleting the pair later
          player_1: pair.player_1.player_name,
          player_2: pair.player_2.player_name,
          limit: pair.limit,
          isFetched: true  // Mark pairs fetched from the backend
        }));
        displayCreatedPairs(); // Display the pairs on the page
      })
      .catch(error => console.error('Error fetching pairs:', error));

    function deletePair(pairId, pairDiv) {
      if (!pairId) {
        // Remove the static pair from createdPairs
        createdPairs = createdPairs.filter((x) => x.byD !== pairDiv);

        // Remove the corresponding inputGroup from the DOM
        const inputGroup = document.querySelector(`.input-group[data-byd="${pairDiv}"]`);
        if (inputGroup) {
          inputGroup.remove(); // Remove the dropdown container
        }

        // Re-render pairs to reflect changes
        displayCreatedPairs();
      } else {
        // Backend pair deletion
        fetch(`https://krinik.in/pair_get/${pairId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete pair from the server');
            }
            // Remove the pair from createdPairs array
            createdPairs = createdPairs.filter(pair => pair.id !== pairId);

            // Update the display
            displayCreatedPairs();
          })
          .catch(error => console.error('Error deleting pair:', error));
      }
    }


    fetch('https://krinik.in/match_get/')
      .then(response => response.json())
      .then(data => {
        const matchData = data.data;
        const selectedMatch = matchData.find(match => match.match_display_name.includes(matchName));
        if (selectedMatch) {
          const teamAName = selectedMatch.select_team_A.team_name;
          const teamBName = selectedMatch.select_team_B.team_name;
          matchHeading.textContent = `${teamAName} vs ${teamBName}`;

          allPlayers = [
            ...selectedMatch.select_player_A.map(player => player.player_name),
            ...selectedMatch.select_player_B.map(player => player.player_name)
          ];

          createPlayerPairDropdown();
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
      })
      .catch(error => console.error('Error fetching match data:', error));

    function createPlayerPairDropdown() {
      const inputGroup = document.createElement('div');
      const byD = 'jatssdev' + Math.random() * 100000; // Unique identifier for static pairs
      inputGroup.className = 'input-group mb-3';
      inputGroup.setAttribute('data-byd', byD); // Add a unique identifier to the input group

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

      if (!playerA || !playerB || !limit) {
        return;
      }

      const existingPairIndex = createdPairs.findIndex(pair =>
        (pair.player_1 === playerA && pair.player_2 === playerB) ||
        (pair.player_1 === playerB && pair.player_2 === playerA)
      );

      if (existingPairIndex !== -1) {
        createdPairs[existingPairIndex].limit = parseInt(limit, 10);
      } else {
        createdPairs.push({
          player_1: playerA,
          player_2: playerB,
          limit: parseInt(limit, 10),
          byD: byD,
          isFetched: false
        });
      }

      displayCreatedPairs();
    }

    function pairExists(playerA, playerB) {
      return createdPairs.some(pair => {
        return (pair.player_1 === playerA && pair.player_2 === playerB) ||
          (pair.player_1 === playerB && pair.player_2 === playerA);
      });
    }

    function displayCreatedPairs() {
      const tableBody = document.querySelector('#tech-companies-1 tbody');
      tableBody.innerHTML = '';

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

        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-primary btn-sm';
        editButton.addEventListener('click', function () {
          openEditModal(pair);
        });
        editCell.appendChild(editButton);

        const removeCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger btn-sm';
        removeButton.addEventListener('click', function () {
          deletePair(pair.id, pair.byD);
        });
        removeCell.appendChild(removeButton);

        row.appendChild(noCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        row.appendChild(limitCell);
        row.appendChild(editCell);
        row.appendChild(removeCell);

        tableBody.appendChild(row);
      });
    }

    let currentEditingPairId = null;
    let currentEditingByD = null;

    function openEditModal(pair) {
      const editModal = document.getElementById('editModal');
      const editLimitInput = document.getElementById('editLimitInput');
      editLimitInput.value = pair.limit;

      editModal.style.display = 'block';
      currentEditingPairId = pair.id ? pair.id : null;
      currentEditingByD = pair.byD ? pair.byD : null;
    }

    document.getElementById('closeEditButton').addEventListener('click', function () {
      document.getElementById('editModal').style.display = 'none';
    });

    document.getElementById('saveEditButton').addEventListener('click', function () {
      const newLimit = document.getElementById('editLimitInput').value;

      if (currentEditingPairId) {
        const pair = createdPairs.find(pair => pair.id === currentEditingPairId);
        if (pair) {
          pair.limit = newLimit;

          fetch(`https://krinik.in/pair_get/${pair.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ limit: newLimit }),
          })
            .then(response => response.json())
            .then(() => {
              displayCreatedPairs();
              document.getElementById('editModal').style.display = 'none';
            })
            .catch(error => {
              console.error('Error updating pair:', error);
            });
        }
      } else if (currentEditingByD) {
        const pair = createdPairs.find(pair => pair.byD === currentEditingByD);
        if (pair) {
          pair.limit = newLimit;
          displayCreatedPairs();
          document.getElementById('editModal').style.display = 'none';
        }
      }
    });

    submitPairsButton.addEventListener('click', function () {
      const newPairs = createdPairs.filter(pair => !pair.isFetched);

      if (newPairs.length === 0) {
        alert('No new pairs created.');
        return;
      }
      showLoader()
      newPairs.forEach(pair => {
        const payload = {
          pool_name: poolName,
          select_match: matchName,
          player_1: pair.player_1,
          player_2: pair.player_2,
          limit: pair.limit,
          pool_type: "Silver"
        };
// console.log(payload,"payload")
        fetch('https://krinik.in/pair_get/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log('Success:', data);
            window.location.href = "./manage-pool.html";
          })
          .catch(error => {
            console.error('Error:', error);
          });
      });
      hideLoader()
    });
    window.onload = checkAdminAccess();
  });