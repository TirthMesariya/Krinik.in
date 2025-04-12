import {checkAdminAccess}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

    document.addEventListener('DOMContentLoaded', async function () {
        const tripletsInputContainer = document.getElementById('tripletsInputContainer');
        const addTripletButton = document.getElementById('addTripletButton');
        const submitTripletsButton = document.getElementById('submitTripletsButton');
        const tableBody = document.getElementById('tripletsTableBody');
        const urlParams = new URLSearchParams(window.location.search);
        const matchName = urlParams.get('match');
        const poolName = urlParams.get('pool_name');
        const poolId = urlParams.get('id');

        let allPlayers = [];
        let createdTriplets = [];
        let createdTripletsToPost = [];


        let getPairsDataFromAPi = async () => {
            try {
                // Fetch the data from the API
                const response = await fetch('https://krinik.in/pair_captain_v_get/');
                const data = await response.json();
                const pairsData = data.data;

                // Filter pairs based on the poolId (replace poolId with your actual poolId variable)
                const filteredPairs = pairsData.filter(pair => pair.pool_name.id == poolId);
                // Map the fetched data to createdTriplets for displaying the 3 players and the limit
                createdTriplets = filteredPairs.map(pair => ({
                    player_1: pair.player_1.player_name,
                    player_2: pair.player_2.player_name,
                    player_3: pair.player_3.player_name,
                    limit: pair.limit,
                    id: pair.id,// Keeping the id for future reference



                }));

                // Now, you can use the createdTriplets variable to populate your UI or perform further actions
                console.log(createdTriplets); // For debugging purposes, log the createdTriplets
                displayTripletsInTable()

            } catch (error) {
                console.error('Error fetching pairs:', error);
            }
        };

        function displayTripletsInTable() {
            tableBody.innerHTML = ''; // Clear the existing table

            createdTriplets.forEach((triplet, index) => {
                const row = document.createElement('tr');

                const rowNum = document.createElement('td');
                rowNum.textContent = index + 1;
                row.appendChild(rowNum);

                const player1Cell = document.createElement('td');
                player1Cell.textContent = triplet.player_1;
                row.appendChild(player1Cell);

                const player2Cell = document.createElement('td');
                player2Cell.textContent = triplet.player_2;
                row.appendChild(player2Cell);

                const player3Cell = document.createElement('td');
                player3Cell.textContent = triplet.player_3;
                row.appendChild(player3Cell);

                const limitCell = document.createElement('td');
                limitCell.textContent = triplet.limit;
                row.appendChild(limitCell);

                // Add Edit and Delete buttons
                const actionsCell = document.createElement('td');

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'btn btn-primary btn-sm';
                editButton.addEventListener('click', function () {
                    openEditModal(triplet);  // Open modal for editing
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.onclick = function () {
                    deleteTriplet(triplet);
                };

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);

                tableBody.appendChild(row);
            });
        }


        let currentEditingPairId = null; // Store the ID of the pair being edited

        // Function to open the modal with the current limit value
        function openEditModal(pair) {
            const editModal = document.getElementById('editLimitModal');
            const newLimitInput = document.getElementById('newLimitInput');
            newLimitInput.value = pair.limit; // Set the current limit in the input

            currentEditingPairId = pair.id; // Save the pair ID to know which one is being edited

            // Display the modal
            editModal.style.display = 'block';
        }

        // Close the modal when clicking "Close"
        document.getElementById('closeModalButton').addEventListener('click', function () {
            document.getElementById('editLimitModal').style.display = 'none';
        });

        // Save the new limit when clicking "Save"
        async function deleteTriplet(triplet) {
            // For static triplets, use the byD property to remove them
            if (triplet.byD) {
                createdTriplets = createdTriplets.filter(item => item.byD !== triplet.byD);
            }

            // For server triplets, use the id property to remove them
            if (triplet.id) {
                try {
                    // Send DELETE request to the server
                    const response = await fetch(`https://krinik.in/pair_captain_v_get/${triplet.id}/`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete triplet from the server');
                    }

                    console.log('Triplet deleted from the server.');
                } catch (error) {
                    console.error('Error deleting triplet:', error);
                    return; // Exit if there's an error
                }

                // Remove the deleted server triplet from the createdTriplets array
                createdTriplets = createdTriplets.filter(item => item.id !== triplet.id);
            }

            // Re-render the table to remove the deleted triplet
            displayTripletsInTable();
        }



        document.getElementById('saveLimitButton').addEventListener('click', async function () {
            const newLimit = document.getElementById('newLimitInput').value;

            if (currentEditingPairId && newLimit) {
                const pair = createdTriplets.find(pair => pair.id === currentEditingPairId);
                if (pair) {
                    pair.limit = newLimit; // Update limit locally

                    // Make the API request to update the limit on the server
                    try {
                        const response = await fetch(`https://krinik.in/pair_captain_v_get/${pair.id}/`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ limit: newLimit }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to update limit');
                        }

                        // Successfully updated
                        document.getElementById('editLimitModal').style.display = 'none'; // Close the modal
                        getPairsDataFromAPi()
                    } catch (error) {
                        console.error('Error updating limit:', error);
                    }
                }
            } else {
                alert('Please enter a valid limit.');
            }
        });


        getPairsDataFromAPi();

        try {

            const response = await fetch('https://krinik.in/match_get/');
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const matchData = data.data;
            const selectedMatch = matchData.find(match => match.match_display_name.includes(matchName));

            if (selectedMatch) {
                allPlayers = [
                    ...selectedMatch.select_player_A.map(player => player.player_name),
                    ...selectedMatch.select_player_B.map(player => player.player_name)
                ];

                createPlayerTripletDropdowns(allPlayers);
                addTripletButton.addEventListener('click', function () {
                    // Get the last input group (if exists) and its limit input field
                    const lastInputGroup = tripletsInputContainer.querySelector('.input-group:last-child');

                    // Check if the last input group exists and if its limit input field has a value
                    if (lastInputGroup) {
                        const lastLimitInput = lastInputGroup.querySelector('input[type="text"]');

                        if (!lastLimitInput.value) {
                            // If the last limit input is empty, prevent adding a new triplet
                            alert('Please enter a limit for the current triplet before adding a new one.');
                            return;
                        }
                    }

                    // If there is a valid limit in the last input group, create a new triplet dropdown
                    createPlayerTripletDropdowns(allPlayers);
                });




                function createPlayerTripletDropdowns(players) {
                    const inputGroup = document.createElement('div');
                    inputGroup.className = 'input-group mb-3';

                    const selectA = createPlayerDropdown(players);
                    const selectB = createPlayerDropdown(players);
                    const selectC = createPlayerDropdown(players);

                    const limitInput = document.createElement('input');
                    limitInput.type = 'text';
                    limitInput.className = 'form-control';
                    limitInput.placeholder = 'Limit';

                    inputGroup.appendChild(selectA);
                    inputGroup.appendChild(selectB);
                    inputGroup.appendChild(selectC);
                    inputGroup.appendChild(limitInput);
                    tripletsInputContainer.appendChild(inputGroup);

                    limitInput.addEventListener('change', function () {
                        updateCreatedTriplets(selectA, selectB, selectC, limitInput);
                    });
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

                function updateCreatedTriplets(selectA, selectB, selectC, limitInput) {
                    const playerA = selectA.value;
                    const playerB = selectB.value;
                    const playerC = selectC.value;
                    const limit = limitInput.value;

                    // Check if the players are unique
                    if (playerA === playerB || playerA === playerC || playerB === playerC) {
                        alert('Players must be unique.');
                        return;
                    }

                    // Check if this triplet already exists (to avoid duplicates)
                    const existingTriplet = createdTriplets.some(triplet =>
                        (triplet.player_1 === playerA && triplet.player_2 === playerB && triplet.player_3 === playerC) ||
                        (triplet.player_1 === playerA && triplet.player_2 === playerC && triplet.player_3 === playerB) ||
                        (triplet.player_1 === playerB && triplet.player_2 === playerA && triplet.player_3 === playerC) ||
                        (triplet.player_1 === playerB && triplet.player_2 === playerC && triplet.player_3 === playerA) ||
                        (triplet.player_1 === playerC && triplet.player_2 === playerA && triplet.player_3 === playerB) ||
                        (triplet.player_1 === playerC && triplet.player_2 === playerB && triplet.player_3 === playerA)
                    );

                    if (existingTriplet) {
                        alert('This triplet already exists.');
                        return;
                    }

                    if (playerA && playerB && playerC && limit) {
                        // Assign a temporary unique identifier for static triplets
                        const uniqueId = 'static_' + Math.random().toString(36).substr(2, 9);

                        // Add the triplet to createdTriplets with a unique identifier
                        createdTriplets.push({
                            player_1: playerA,
                            player_2: playerB,
                            player_3: playerC,
                            limit: limit,
                            byD: uniqueId // Unique identifier for static triplet
                        });

                        createdTripletsToPost.push({
                            player_1: playerA,
                            player_2: playerB,
                            player_3: playerC,
                            limit: limit
                        });

                        displayTripletsInTable();
                    } else {
                        alert('Please select three players and enter a limit.');
                    }
                }





                submitTripletsButton.addEventListener('click', async function () {
                    if (createdTriplets.length === 0) {
                        alert('Please create at least one triplet before submitting.');
                        return;
                    }
                    showLoader()

                    for (const triplet of createdTripletsToPost) {
                        const payload = {
                            pool_name: poolName,
                            select_match: matchName,
                            player_1: triplet.player_1,
                            player_2: triplet.player_2,
                            player_3: triplet.player_3,
                            limit: triplet.limit,
                            pool_type: "Platinum"
                        };

                        try {
                            const response = await fetch('https://krinik.in/pair_captain_v_get/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(payload),
                            });

                            if (!response.ok) {
                                console.error('Network response was not ok. Status:', response.status, 'Status Text:', response.statusText);
                                throw new Error('Network response was not ok');
                            }

                            const data = await response.json();
                            console.log('Success:', data);
                            window.location.href = "./manage-pool.html"
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                    hideLoader()
                });

            } else {
                console.error('Selected match not found.');
            }
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
        window.onload = checkAdminAccess();
    });
