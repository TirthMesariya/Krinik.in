import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}]/u;
const alphanumericRegex = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;
const defaultImageSrc = 'assets/images/default_team.png';
let existingTeams = [];
let existingLeagues = [];

async function fetchData(url, type, updateData) {
    try {
        const response = await fetch(url, {
            method: type,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const responseData = await response.json();
        updateData(responseData.data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function populateSelect(data) {
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


function isValidTeamName1(value) {
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}]/u;
const alphanumericRegex = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;

// Check for emoji
if (emojiRegex.test(value)) {
return false; // Invalid if emoji found
}

// Check for alphanumeric and spaces
if (!alphanumericRegex.test(value)) {
return false; // Invalid if non-alphanumeric characters found
}

// Check for purely numeric input
if (/^\d+$/.test(value)) {
return false; // Invalid if input is purely numeric
}

return true; // Valid input
}

function checkTeamOverlap(teamName, shortTeamName, leagueName, existingTeams) {
    console.log("Checking overlap for:", teamName, shortTeamName, leagueName);
    console.log("Existing teams:", existingTeams);

    if (!existingTeams || existingTeams.length === 0) {
        return { teamNameOverlap: false, shortTeamNameOverlap: false };
    }

    const normalizedTeamName = teamName.trim().toLowerCase();
    const normalizedShortName = shortTeamName.trim().toLowerCase();
    const normalizedLeagueName = leagueName.trim().toLowerCase();

    const teamNameOverlap = existingTeams.some(team => {
        const normalizedExistingTeamName = team.team_name.trim().toLowerCase();
        const normalizedExistingLeagueName = team.league_name.trim().toLowerCase();
        console.log(`Comparing team name: ${normalizedTeamName} with ${normalizedExistingTeamName} and league: ${normalizedLeagueName} with ${normalizedExistingLeagueName}`);
        return normalizedExistingTeamName === normalizedTeamName && normalizedExistingLeagueName === normalizedLeagueName;
    });

    const shortTeamNameOverlap = existingTeams.some(team => {
        const normalizedExistingShortName = team.team_short_name.trim().toLowerCase();
        const normalizedExistingLeagueName = team.league_name.trim().toLowerCase();
        console.log(`Comparing short team name: ${normalizedShortName} with ${normalizedExistingShortName} and league: ${normalizedLeagueName} with ${normalizedExistingLeagueName}`);
        return normalizedExistingShortName === normalizedShortName && normalizedExistingLeagueName === normalizedLeagueName;
    });

    console.log("Team Name Overlap:", teamNameOverlap);
    console.log("Short Team Name Overlap:", shortTeamNameOverlap);

    return { teamNameOverlap, shortTeamNameOverlap };
}

function validateLeagueSelection() {
    const leagueSelect = document.getElementById('league-name');
    const errorSpan = document.getElementById('error-league-name');

    function validate() {
        if (leagueSelect.value === '') {
            errorSpan.innerHTML = 'Please select a league';
            errorSpan.style.display = 'inline';
            return false;
        } else {
            errorSpan.style.display = 'none';
            return true;
        }
    }

    leagueSelect.addEventListener('change', validate);
    return validate();
}



async function handleFormSubmission(event) {
    event.preventDefault();

    const leagueName = document.getElementById('league-name').value;
    const teamName = document.getElementById('team-name').value;
    const shortTeamName = document.getElementById('short-team-name').value;

    const isValidLeagueName = validateLeagueSelection();
    const isValidTeamName = validateInput(
        'team-name',
        'error-team-name',
        isValidTeamName1,
        'Please enter a team name',
        'Please enter a valid team name'
    );
    const isValidShortTeamName = validateInput(
        'short-team-name',
        'error-short-team-name',
        isValidTeamName1,
        'Please enter a short team name',
        'Please enter a valid short team name'
    );





    const overlapResult = checkTeamOverlap(teamName, shortTeamName, leagueName, existingTeams);

    if (isValidLeagueName && isValidTeamName && isValidShortTeamName) {

        if(overlapResult.teamNameOverlap && overlapResult.shortTeamNameOverlap){
            document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
            document.getElementById('error-team-name').style.display = 'inline';
            document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
            document.getElementById('error-short-team-name').style.display = 'inline';

        }else if (overlapResult.teamNameOverlap) {
            document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
            document.getElementById('error-team-name').style.display = 'inline';
        } else if (overlapResult.shortTeamNameOverlap) {
            document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
            document.getElementById('error-short-team-name').style.display = 'inline';
        } else {

            // setTimeout(() => {
            //     showLoader(); // Show the loader with a delay (optional)
            // }, 100);
      
            // Perform the redirect and handle loader visibility
            Promise.resolve()
                .then(async() => {
                    if (confirm('Are you sure you want to add this team?')) {
                        showLoader()
                        try {
                            const form = document.getElementById('team-form');
                            const formData = new FormData(form);
                            const fileInput = document.getElementById('file-input');
        
                            if (fileInput.files.length > 0) {
                                formData.append('team_image', fileInput.files[0]);
                            } else {
                                const defaultImageBlob = await fetch(defaultImageSrc).then(res => res.blob());
                                formData.append('team_image', defaultImageBlob, 'default_team.png');
                            }
        
                            formData.append('league_name', leagueName);
                            formData.append('team_name', teamName);
                            formData.append('team_short_name', shortTeamName);
        
                            const response = await fetch('https://krinik.in/team_get/', {
                                method: 'POST',
                                body: formData
                            });
        
                            if (response.ok) {
                                console.log('Team added successfully!');
                                const responseData = await response.json();
                                showDynamicAlert("Team Added Successfully !!")
        
                                    setTimeout(() => {
                                        window.location.href = 'manage-team.html';
                                    }, 2000);
                            } else {
                                console.error('Failed to add team.');
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
}

document.addEventListener('DOMContentLoaded', async function () {
    await fetchData('https://krinik.in/league_get/', 'GET', data => {
        existingLeagues = data;
        populateSelect(data);
    });

    await fetchData('https://krinik.in/team_get/', 'GET', data => {
        existingTeams = data;
    });

    const form = document.getElementById('team-form');
    form.addEventListener('submit', handleFormSubmission);

    document.getElementById('league-name').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('team-name').focus();
        }
    });

    document.getElementById('team-name').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('short-team-name').focus();
        }
    });

    document.getElementById('short-team-name').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('file-input').focus();
        }
    });

    document.getElementById('file-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleFormSubmission(event);
        }
    });
    function toCapitalizeCase(str) {
return str.replace(/\b\w/g, function(char) {
return char.toUpperCase();
});
}

document.getElementById('team-name').addEventListener('input', function (event) {
this.value = toCapitalizeCase(this.value);
});

    document.getElementById('short-team-name').addEventListener('input', function (event) {
        this.value = this.value.toUpperCase();
    });

    document.getElementById('file-input').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('preview-team-image').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
        // Reload the page only once
        window.location.reload();
    }
  });
window.onload = checkAdminAccess();