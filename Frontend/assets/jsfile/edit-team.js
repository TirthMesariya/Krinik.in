import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

document.addEventListener('DOMContentLoaded', async () => {
    const noNumberOrWhitespaceRegex = /^(?!.*[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;


    const defaultImageSrc = '././assets/images/default_team.png';
    let existingTeams = [];
    let existingLeagues = [];
    let initialData = {};

    async function fetchExistingLeagues() {
        try {
            const response = await fetch("https://krinik.in/league_get/");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const existingLeagues1 = await response.json();
            existingLeagues = existingLeagues1.data;
            populateSelect(existingLeagues); // Populate league dropdown
        } catch (error) {
            console.error('Error fetching or processing existing leagues:', error);
        }
    }

    async function fetchExistingTeams() {
        try {
            const response = await fetch("https://krinik.in/team_get/");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const existingTeams1 = await response.json();
            existingTeams = existingTeams1.data;
        } catch (error) {
            console.error('Error fetching or processing existing teams:', error);
        }
    }

    await fetchExistingLeagues();
    await fetchExistingTeams();

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



    function editTeamData(response, allLeagues) {
        const teamName = document.getElementById('team-name');
        const shortTeamName = document.getElementById('short-team-name');
        const imageFile = document.getElementById('preview-team-image');
        const leagueSelect = document.getElementById('league-name');

        if (!teamName || !shortTeamName || !imageFile || !leagueSelect) {
            console.error('Form elements not found');
            return;
        }

        if (response) {
            imageFile.src = `https://krinik.in${response.team_image}`;
            teamName.value = response.team_name;
            shortTeamName.value = response.team_short_name;

            const leagueOption = allLeagues.find(league => league.league_name === response.league_name);
            if (leagueOption) {
                leagueSelect.value = leagueOption.league_name;
            }

            initialData = {
                team_name: teamName.value,
                team_short_name: shortTeamName.value,
                team_image: imageFile.src,
                league_name: leagueSelect.value
            };
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        try {
            const response = await fetch(`https://krinik.in/team_get/${id}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch team data');
            }
            const teamData1 = await response.json();
            const teamData = teamData1.data;

            editTeamData(teamData, existingLeagues);
        } catch (error) {
            console.error('Error fetching team data:', error);
        }
    }

    async function submitFormData(data, method) {
        showLoader()
        const formData = new FormData();
        formData.append('team_name', data.team_name);
        formData.append('team_short_name', data.team_short_name);
        formData.append('league_name', data.league_name);
        if (data.team_image instanceof File) {
            formData.append('team_image', data.team_image);
        }

        try {
            const response = await fetch(`https://krinik.in/team_get/${id}/`, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to edit team');
            }

           

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while editing the team.');
        }
        hideLoader()
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

    document.getElementById('team-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const teamNameInput = document.getElementById('team-name');
        const shortTeamNameInput = document.getElementById('short-team-name');
        const leagueSelect = document.getElementById('league-name');
        const imageFileInput = document.getElementById('file-input');
        const previewImage = document.getElementById('preview-team-image');

        if (!teamNameInput || !shortTeamNameInput || !leagueSelect || !imageFileInput || !previewImage) {
            console.error('Form elements not found');
            return;
        }

        const isValidTeamName = validateInput(
            'team-name',
            'error-team-name',
            isValidTeamName1,
            'Please enter team name',
            'Please enter valid team name'
        );

        const isValidShortTeamName = validateInput(
            'short-team-name',
            'error-short-team-name',
            isValidTeamName1,
            'Please enter short team name',
            'Please enter valid short team name'
        );

        const isValidLeagueSelection = validateLeagueSelection();

        if (isValidTeamName && isValidShortTeamName && isValidLeagueSelection) {
            const currentData = {
                team_name: teamNameInput.value.trim(),
                team_short_name: shortTeamNameInput.value.trim(),
                league_name: leagueSelect.value,
                team_image: imageFileInput.files[0] || previewImage.src
            };

            const hasTeamNameChanged = currentData.team_name !== initialData.team_name;
            const hasShortTeamNameChanged = currentData.team_short_name !== initialData.team_short_name;
            const hasLeagueChanged = currentData.league_name !== initialData.league_name;
            const hasImageChanged = currentData.team_image !== initialData.team_image;

            const overlapResult = checkTeamOverlap(teamNameInput, shortTeamNameInput, leagueSelect.value, existingTeams);

            // setTimeout(() => {
            //     showLoader(); // Show the loader with a delay (optional)
            // }, 100);
      
            // Perform the redirect and handle loader visibility
            // Promise.resolve()
            //     .then(async() => {
                    if (hasLeagueChanged && hasTeamNameChanged && hasShortTeamNameChanged) {
                        if (overlapResult.teamNameOverlap || overlapResult.shortTeamNameOverlap) {
                            if (overlapResult.teamNameOverlap) {
                                document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
                                document.getElementById('error-team-name').style.display = 'inline';
                            }
                            if (overlapResult.shortTeamNameOverlap) {
                                document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
                                document.getElementById('error-short-team-name').style.display = 'inline';
                            }
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasLeagueChanged && hasTeamNameChanged) {
                        if (overlapResult.teamNameOverlap) {
                            document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
                            document.getElementById('error-team-name').style.display = 'inline';
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasLeagueChanged && hasShortTeamNameChanged) {
                        if (overlapResult.shortTeamNameOverlap) {
                            document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
                            document.getElementById('error-short-team-name').style.display = 'inline';
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasTeamNameChanged && hasShortTeamNameChanged) {
                        if (overlapResult.teamNameOverlap || overlapResult.shortTeamNameOverlap) {
                            if (overlapResult.teamNameOverlap) {
                                document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
                                document.getElementById('error-team-name').style.display = 'inline';
                            }
                            if (overlapResult.shortTeamNameOverlap) {
                                document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
                                document.getElementById('error-short-team-name').style.display = 'inline';
                            }
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasLeagueChanged) {
                        if (overlapResult.teamNameOverlap || overlapResult.shortTeamNameOverlap) {
                            if (overlapResult.teamNameOverlap) {
                                document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
                                document.getElementById('error-team-name').style.display = 'inline';
                            }
                            if (overlapResult.shortTeamNameOverlap) {
                                document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
                                document.getElementById('error-short-team-name').style.display = 'inline';
                            }
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasTeamNameChanged) {
                        if (overlapResult.teamNameOverlap) {
                            document.getElementById('error-team-name').innerHTML = 'Team name already exists in this league.';
                            document.getElementById('error-team-name').style.display = 'inline';
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasShortTeamNameChanged) {
                        if (overlapResult.shortTeamNameOverlap) {
                            document.getElementById('error-short-team-name').innerHTML = 'Short team name already exists in this league.';
                            document.getElementById('error-short-team-name').style.display = 'inline';
                        } else {
                            if (confirm("are you confirm to edit it?")) {
        
                                await submitFormData(currentData, 'PATCH');
                                showDynamicAlert("Team updated Successfully !!")
        
                                setTimeout(() => {         
                                    window.location.href = "manage-team.html"
                                }, 2000);
                            }
                        }
                    } else if (hasImageChanged) {
                        if (confirm("are you confirm to edit it?")) {
        
                            await submitFormData(currentData, 'PATCH');
                            showDynamicAlert("Team updated Successfully !!")
        
                            setTimeout(() => {         
                                window.location.href = "manage-team.html"
                            }, 2000);
                        }
                    } else {
                        if (confirm("are you confirm to edit it?")) {
        
                            await submitFormData(initialData, 'PATCH');
                            window.location.href = "manage-team.html"
                        }
                    }
                // })
                // .then(() => {
                //     hideLoader(); // Hide the loader after the redirect
                // })
                // .catch((err) => {
                //     console.error("An error occurred during the redirect:", err);
                //     hideLoader(); // Ensure loader hides if an error occurs
                // });
        // } else {
            // console.error("No redirect function provided.");
            // hideLoader()
            // Check all possible combinations
            
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

    document.getElementById('short-team-name').addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

    document.getElementById('file-input').addEventListener('change', function (event) {
        const file = event.target.files[0];
        const previewImage = document.getElementById('preview-team-image');

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

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


    function checkTeamOverlap(teamNameInput, shortTeamNameInput, leagueName, existingTeams) {
        const teamName = teamNameInput.value.trim();
        const shortTeamName = shortTeamNameInput.value.trim();
        const teamNameOverlap = existingTeams.some(team => team.team_name === teamName && team.league_name === leagueName);
        const shortTeamNameOverlap = existingTeams.some(team => team.team_short_name === shortTeamName && team.league_name === leagueName);
        return { teamNameOverlap, shortTeamNameOverlap };
    }


    function validateLeagueSelection() {
        const leagueSelect = document.getElementById('league-name');
        const errorSpan = document.getElementById('error-league-name');

        if (!leagueSelect || !errorSpan) {
            console.error('League selection elements not found');
            return false;
        }

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
});
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
        // Reload the page only once
        window.location.reload();
    }
  });
window.onload = checkAdminAccess();