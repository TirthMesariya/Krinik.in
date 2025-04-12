import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}]/u;
        const alphanumericRegex = /^[a-zA-Z0-9._]+(?: [a-zA-Z0-9._]+)*$/u;

        // Default image source
        const defaultImageSrc = '/assets/images/default_player.png';

        // Array to store existing players fetched from API
        let existingPlayers = [];

        // Function to fetch leagues from API
        async function fetchLeagues() {
            try {
                const response = await fetch('https://krinik.in/league_get/');
                if (!response.ok) {
                    throw new Error('Failed to fetch leagues'); 

                }
                const data = await response.json();
                console.log(data,"data is there")
                if (data.status === 'success' && Array.isArray(data.data)) {
                    populateSelect1(data.data);
                    document.getElementById('league-name').addEventListener('change', function () {
                        const leagueName = this.value;
                        fetchTeams(leagueName);
                    });
                } else {
                    console.error('Invalid data format for leagues:', data);
                }
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        }
        async function fetchPlayers() {
            try {
                const response = await fetch('https://krinik.in/player_get/');
                if (!response.ok) {
                    throw new Error('Failed to fetch leagues');
                }
                const data = await response.json();
                if (data.status === 'success' && Array.isArray(data.data)) {
                    existingPlayers = data.data;
                    console.log(existingPlayers)
                } else {
                    console.error('Invalid data format for leagues:', data);
                }
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        }

        // Function to fetch teams based on the selected league
        async function fetchTeams(leagueName) {
            try {
                const response = await fetch(`https://krinik.in/team_get/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch teams');
                }
                const data = await response.json();
                if (data.status === 'success' && Array.isArray(data.data)) {
                   
                    const teams = data.data.filter(team => team.league_name === leagueName);
                    console.log(teams)
                    populateSelect(document.getElementById('team-name'), teams, 'team_name', 'Select Team');
                } else {
                    console.error('Invalid data format for teams:', data);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        }

        // Function to populate select dropdown with fetched data
        function populateSelect(selectElement, data, key, defaultOptionText) {
            selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[key];
                option.textContent = item[key];
                selectElement.appendChild(option);
            });
        }

        function populateSelect1(data) {
            const selectElement = document.getElementById('league-name');
            selectElement.innerHTML = '<option value="">Select League</option>';
        
            const currentDate = moment().toDate(); // Get the current date as a Date object
            console.log("Current Date: ", currentDate);
        
            data.forEach(league => {
                const leagueEndDate = moment(league.end_league_date, 'DD-MM-YYYY').toDate(); // Convert end_league_date to a Date object
                console.log("League End Date: ", leagueEndDate);
        
                // Compare Date objects directly
                if (currentDate < leagueEndDate) {
                    const option = document.createElement('option');
                    option.value = league.league_name;
                    option.textContent = league.league_name;
                    selectElement.appendChild(option);
                }
            });
        }

        // Function to validate input fields
        function validateInput(inputId, errorId, validationFunction, emptyMessage, invalidMessage) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);

    function validate() {
        const value = inputElement.value.trim();
        if (value === '') {
            errorElement.innerHTML = emptyMessage;
            errorElement.style.display = 'inline';
            return false;
        } else if (!validationFunction(value)) {
            errorElement.innerHTML = invalidMessage;
            errorElement.style.display = 'inline';
            return false;
        } else {
            errorElement.style.display = 'none';
            return true;
        }
    }

    inputElement.addEventListener('input', validate);
    inputElement.addEventListener('change', validate);

    return validate();
}

        
        function toCapitalizeCase(str) {
        return str.replace(/\b\w/g, function(char) {
            return char.toUpperCase();
        });
    }

    document.getElementById('player-name').addEventListener('input', function (event) {
        this.value = toCapitalizeCase(this.value);
    });

        // Event listener to convert short team name to uppercase
        document.getElementById('short-player-name').addEventListener('input', function (event) {
            this.value = this.value.toUpperCase();
        });

        // Event listener for file input to preview image
        document.getElementById('file-input').addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('preview-player-image').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Function to check if there is overlap in player names or short names within the same league and team
        async function checkPlayerOverlap(playerName, shortPlayerName, leagueName, teamName, existingPlayers) {
    console.log("Checking overlap for:", playerName, shortPlayerName, leagueName, teamName);
    console.log("Existing players:", existingPlayers);

    if (!existingPlayers || existingPlayers.length === 0) {
        return { playerNameOverlap: false, shortPlayerNameOverlap: false };
    }

    const normalizedPlayerName = playerName.trim().toLowerCase();
    const normalizedShortName = shortPlayerName.trim().toLowerCase();
// console.log(normalizedPlayerName)
    const playerNameOverlap = existingPlayers.some(player => {
        const normalizedExistingPlayerName = (player.player_name || '').trim().toLowerCase();
        const normalizedExistingLeagueName = (player.league_name || '').trim().toLowerCase();
        const normalizedExistingTeamName = (player.team_name.team_name || '').trim().toLowerCase();
        console.log(normalizedExistingPlayerName)
        return normalizedExistingPlayerName === normalizedPlayerName &&
            normalizedExistingLeagueName === leagueName.trim().toLowerCase() &&
            normalizedExistingTeamName === teamName.trim().toLowerCase();
    });

    const shortPlayerNameOverlap = existingPlayers.some(player => {
        const normalizedExistingShortName = (player.player_short_name || '').trim().toLowerCase();
        const normalizedExistingLeagueName = (player.league_name || '').trim().toLowerCase();
        const normalizedExistingTeamName = (player.team_name.team_name || '').trim().toLowerCase();
        return normalizedExistingShortName === normalizedShortName &&
            normalizedExistingLeagueName === leagueName.trim().toLowerCase() &&
            normalizedExistingTeamName === teamName.trim().toLowerCase();
    });

    console.log("Player Name Overlap:", playerNameOverlap);
    console.log("Short Player Name Overlap:", shortPlayerNameOverlap);

    return { playerNameOverlap, shortPlayerNameOverlap };
}

function isValidTeamName1(value) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}]/u;
    const alphanumericRegex = /^[a-zA-Z0-9._]+(?: [a-zA-Z0-9._]+)*$/u;
    
    // Check for emoji
    if (emojiRegex.test(value)) {
        return false; // Invalid if emoji found
    }
    
    // Check for alphanumeric, ., _ and spaces
    if (!alphanumericRegex.test(value)) {
        return false; // Invalid if non-alphanumeric characters found
    }
    
    // Check for purely numeric input
    if (/^\d+$/.test(value)) {
        return false; // Invalid if input is purely numeric
    }
    
    return true; // Valid input
}

        // Event listener when DOM is fully loaded
        document.addEventListener('DOMContentLoaded', async function () {
            fetchLeagues();
        fetchPlayers()


            const form = document.getElementById('player-form');
            form.addEventListener('submit', async function (event) {
                event.preventDefault();

                const leagueName = document.getElementById('league-name').value;
                const teamName = document.getElementById('team-name').value;
                const playerName = document.getElementById('player-name').value;
                const shortPlayerName = document.getElementById('short-player-name').value;

                const isValidLeagueName = validateInput(
                    'league-name',
                    'error-start-league',
                    value => value !== '',
                    'Please select a league',
                    'Please select a valid league'
                );

                const isValidTeamName = validateInput(
                    'team-name',
                    'error-team-name',
                    value => value !== '',
                    'Please select a team name',
                    'Please select a valid team name'
                );

                const isValidPlayerName = validateInput(
                    'player-name',
                    'error-player-name',
                    isValidTeamName1,
                    'Please enter a player name',
                    'Please enter a valid player name'
                );

                const isValidShortPlayerName = validateInput(
                    'short-player-name',
                    'error-short-player-name',
                    isValidTeamName1,
                    'Please enter a short player name',
                    'Please enter a valid short player name'
                );

                const overlapResult = await checkPlayerOverlap(playerName, shortPlayerName, leagueName, teamName, existingPlayers);

                if (isValidLeagueName && isValidTeamName && isValidPlayerName && isValidShortPlayerName) {
                    if (overlapResult.playerNameOverlap && overlapResult.shortPlayerNameOverlap) {
                        document.getElementById('error-player-name').innerHTML = 'Player with same name already exists in this team.';
                        document.getElementById('error-player-name').style.display = 'inline';
                        document.getElementById('error-short-player-name').innerHTML = 'Player with short name already exists in this team.';
                        document.getElementById('error-short-player-name').style.display = 'inline';
                    } 
                    else if(overlapResult.playerNameOverlap ){
                        document.getElementById('error-player-name').innerHTML = 'Player with same name already exists in this team.';
                        document.getElementById('error-player-name').style.display = 'inline';
                    }else if(overlapResult.shortPlayerNameOverlap){
                        document.getElementById('error-short-player-name').innerHTML = 'Player with short name already exists in this team.';
                        document.getElementById('error-short-player-name').style.display = 'inline';
                    }
                    else {                    
                        
                        
                        // Perform the redirect and handle loader visibility
                        Promise.resolve()
                        .then(async() => {
                            if (confirm('Are you sure you want to add this player?')) {
                                    showLoader(); // Show the loader with a delay (optional)
                                    try {
                                        const formData = new FormData();
                                        const fileInput = document.getElementById('file-input');
        
                                        formData.append('league_name', leagueName);
                                        formData.append('team_name', teamName);
                                        formData.append('player_name', playerName);
                                        formData.append('player_short_name', shortPlayerName);
        
                                        if (fileInput.files.length > 0) {
                                            formData.append('player_image', fileInput.files[0]);
                                        } else {
                                            const defaultImageBlob = await fetch(defaultImageSrc).then(res => res.blob());
                                            formData.append('player_image', defaultImageBlob, 'default_player.png');
                                        }
                                        formData.append('total_run', 0); // Append null for total_run
                                        formData.append('status', "enable");
                                        console.log('Form data before sending:');
                                        formData.forEach((value, key) => {
                                            console.log(key, value);
                                        });
        
                                        const response = await fetch('https://krinik.in/player_get/', {
                                            method: 'POST',
                                            body: formData,
                                        });
        
                                        console.log(response);
                                        if (response.ok) {
                                            console.log('Player added successfully!');
                                            const responseData = await response.json();
                                            console.log('Response data:', responseData);
                                            showDynamicAlert("Player Added Successfully !!")
        
                                            setTimeout(() => {         
                                    
                                                window.location.href = 'manage-player.html';
                                            }, 2000);
                                        } else {
                                            console.error('Failed to add player:', response.status, response.statusText);
                                        }
                                    } catch (error) {
                                        console.error('Fetch error:', error);
                                    }
                                    hideLoader()
                                }
                            })
                            .then(() => {
                                hideLoader(); // Hide the loader after the redirect
                            })
                            .catch((err) => {
                                console.error("An error occurred during the redirect:", err);
                                hideLoader(); // Ensure loader hides if an error occurs
                            });
                    // } else {
                        // console.error("No redirect function provided.");
                        // hideLoader()

                        
                    }
                } else {
                    console.log('Form validation failed. Please check all fields.');
                }
            });

            window.addEventListener('pageshow', function (event) {
                if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
                    // Reload the page only once
                    window.location.reload();
                }
              });
         
        });
        window.onload = checkAdminAccess();