import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import {showLoader,hideLoader} from "./pagerefresh.js"

$(function () {
    let startPicker = flatpickr('#startDate', {
        dateFormat: 'd-m-Y',
        minDate: 'today', // Disable past dates
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                endPicker.set('minDate', selectedDates[0]);
            }
        }
    });

    let endPicker = flatpickr('#end-league-date', {
        dateFormat: 'd-m-Y',
        onOpen: function (selectedDates, dateStr, instance) {
            const startDate = startPicker.selectedDates[0];
            if (startDate) {
                instance.set('minDate', startDate);
            }
        }
    });

    // Open Flatpickr on calendar icon click
    $('#calendarIconStart').click(function () {
        startPicker.open();
    });
    $('#calendarIconEnd').click(function () {
        endPicker.open();
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const noNumberOrWhitespaceRegex = /^(?!.*[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;


    const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/; // Adjusted to match DD/MM/YYYY format
    const defaultImageSrc = '/assets/images/default_league_2.png'; // Default image path

    let existingLeagues = []; // Define an empty array to store fetched leagues

    async function myFetch(url, type, data) {
        try {
            let responseData;

            if (type === "GET") {
                const res = await fetch(url, {
                    method: type,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    console.log("HTTP request successful");
                } else {
                    console.log("HTTP request unsuccessful");
                }

                responseData = await res.json();
                return responseData.data; // Assuming the API returns data array
            } else if (type === "DELETE") {
                const res = await fetch(url, {
                    method: type,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    console.log("HTTP request successful");
                } else {
                    console.log("HTTP request unsuccessful");
                }

                return res;
            } else if (type === "POST" || type === "PUT") {
                const res = await fetch(url, {
                    method: type,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    console.log("HTTP request successful");
                } else {
                    console.log("HTTP request unsuccessful");
                }

                responseData = await res.json();
                return responseData;
            }
        } catch (error) {
            console.error("Fetch error:", error);
            throw error; // Re-throw the error to handle it where myFetch is called
        }
    }
   
   
    myFetch("https://krinik.in/league_get/", "GET")

    function validateInput(inputId, errorId, regex, emptyMessage, invalidMessage) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);

        function validate() {
            const value = input.value.trim();
            if (value === '') {
                error.innerHTML = emptyMessage;
                error.style.display = 'inline';
                return false;
            } else if (!regex.test(value)) {
                error.innerHTML = invalidMessage;
                error.style.display = 'inline';
                return false;
            } else {
                error.style.display = 'none';
                return true;
            }
        }

        input.addEventListener('input', validate);
        input.addEventListener('change', validate);

        return validate();
    }

    function checkLeagueOverlap(leagueName, shortLeagueName, existingLeagues) {
        if (!existingLeagues || existingLeagues.length === 0) {
            return { leagueNameOverlap: false, shortLeagueNameOverlap: false };
        }

        const normalizedName = leagueName.trim().toLowerCase();
        const normalizedShortName = shortLeagueName.trim().toLowerCase();

        const leagueNameOverlap = existingLeagues.some(league => {
            const normalizedExistingName = league.league_name.trim().toLowerCase();
            return normalizedExistingName === normalizedName;
        });

        const shortLeagueNameOverlap = existingLeagues.some(league => {
            const normalizedExistingShortName = league.short_league_name.trim().toLowerCase();
            return normalizedExistingShortName === normalizedShortName;
        });

        return { leagueNameOverlap, shortLeagueNameOverlap };
    }

    function convertDateFormat(dateString) {
        const parts = dateString.split('/');
        return parts.length === 3 ? `${parts[0]}/${parts[1]}/${parts[2]}` : dateString;
    }

    // // Enter key navigation between fields
    document.getElementById('league-name').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('short-league-name').focus();
        }
    });

    document.getElementById('short-league-name').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('startDate').focus();
        }
    });

    document.getElementById('startDate').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('end-league-date').focus();
        }
    });
    document.getElementById('end-league-date').addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const isValidLeagueName = validateInput(
                'league-name',
                'error-league-name',
                noNumberOrWhitespaceRegex,
                'Please enter a league name',
                'Please enter a valid league name'
            );

            const isValidShortLeagueName = validateInput(
                'short-league-name',
                'error-short-league-name',
                noNumberOrWhitespaceRegex,
                'Please enter a short league name',
                'Please enter a valid short league name'
            );

            const isValidStartLeagueDate = validateInput(
                'startDate',
                'error-startDate',
                dateFormatRegex,
                'Please select start league date',
                'Please select valid start league date'
            );

            const isValidEndLeagueDate = validateInput(
                'end-league-date',
                'error-end-league-date',
                dateFormatRegex,
                'Please select end league date',
                'Please select valid end league date'
            );

            const leagueName = document.getElementById('league-name').value.trim();
            const shortLeagueName = document.getElementById('short-league-name').value.trim();
            const startDate1 = document.getElementById('startDate').value.trim();
            const endDate = document.getElementById('end-league-date').value.trim();

            const dateOverlap = checkLeagueOverlap(leagueName, shortLeagueName, existingLeagues);

            if (isValidLeagueName && isValidShortLeagueName && isValidStartLeagueDate && isValidEndLeagueDate) {
                if (dateOverlap) {
                    console.log('League overlap exists. Data not added.');
                    alert('League already exists!');
                } else {
                    if (confirm('Are you sure you want to add this league?')) {
                        let formData = new FormData();
                        formData.append('league_name', leagueName);
                        formData.append('short_league_name', shortLeagueName);
                        formData.append('start_league_date', convertDateFormat(startDate1));
                        formData.append('end_league_date', convertDateFormat(endDate));

                        const imageFile = document.getElementById('file-input').files[0];
                        if (imageFile) {
                            formData.append('league_image', imageFile);
                        } else {
                            const defaultImageBlob = await fetch(defaultImageSrc).then(res => res.blob());
                            formData.append('league_image', defaultImageBlob, 'default_league.png');
                        }

                        try {
                            const response = await fetch('https://krinik.in/league_get/', {
                                method: 'POST',
                                body: formData
                            });

                            if (!response.ok) {
                                throw new Error('Failed to add league');
                            }
                            window.location.href = 'manage-league.html';
                        } catch (error) {
                            console.error('Error:', error);
                            alert('An error occurred while adding the league.');
                        }


                    }
                }
            } else {
                console.log('Form validation failed. Please check all fields.');
            }

        } else {
            console.log('Form validation failed. Please check all fields.');
        }

    });

    try {
        existingLeagues = await myFetch("https://krinik.in/league_get/", "GET");
        // existingLeagues = existingLeagues1.data
        console.log(existingLeagues)
        function toCapitalizeCase(str) {
return str.replace(/\b\w/g, function(char) {
    return char.toUpperCase();
});
}

document.getElementById('league-name').addEventListener('input', function (event) {
this.value = toCapitalizeCase(this.value);
});



        document.getElementById('league-form').addEventListener('submit', async function (event) {
            event.preventDefault();

            const isValidLeagueName = validateInput(
                'league-name',
                'error-league-name',
                noNumberOrWhitespaceRegex,
                'Please enter a league name',
                'Please enter a valid league name'
            );

            const isValidShortLeagueName = validateInput(
                'short-league-name',
                'error-short-league-name',
                noNumberOrWhitespaceRegex,
                'Please enter a short league name',
                'Please enter a valid short league name'
            );

            const isValidStartLeagueDate = validateInput(
                'startDate',
                'error-startDate',
                dateFormatRegex,
                'Please select start league date',
                'Please select valid start league date '
            );

            const isValidEndLeagueDate = validateInput(
                'end-league-date',
                'error-end-league-date',
                dateFormatRegex,
                'Please select end league date',
                'Please select a valid end league date'
            );
            const errorLeagueName = document.getElementById('error-league-name');
            const errorShortLeagueName = document.getElementById('error-short-league-name');

            const leagueName = document.getElementById('league-name').value.trim();
            const shortLeagueName = document.getElementById('short-league-name').value.trim();
            const startDate1 = document.getElementById('startDate').value.trim();
            const endDate = document.getElementById('end-league-date').value.trim();

            const overlapResult = checkLeagueOverlap(leagueName, shortLeagueName, existingLeagues);

            if (isValidLeagueName && isValidShortLeagueName && isValidStartLeagueDate && isValidEndLeagueDate) {
                if(overlapResult.leagueNameOverlap && overlapResult.shortLeagueNameOverlap){
                    document.getElementById('error-league-name').innerHTML = 'League name already exists.';
                    document.getElementById('error-league-name').style.display = 'inline';
                    document.getElementById('error-short-league-name').innerHTML = 'Short league name already exists.';
             
                    document.getElementById('error-short-league-name').style.display = 'inline';

                }else if (overlapResult.leagueNameOverlap) {
                    document.getElementById('error-league-name').innerHTML = 'League name already exists.';
                    document.getElementById('error-league-name').style.display = 'inline';
                } else if (overlapResult.shortLeagueNameOverlap) {
                    document.getElementById('error-short-league-name').innerHTML = 'Short league name already exists.';
                    document.getElementById('error-short-league-name').style.display = 'inline';
                } else {
                    if (confirm('Are you sure you want to add this league?')) {
                        let formData = new FormData();
                        formData.append('league_name', leagueName);
                        formData.append('short_league_name', shortLeagueName);
                        formData.append('start_league_date', convertDateFormat(startDate1));
                        formData.append('end_league_date', convertDateFormat(endDate));

                        const imageFile = document.getElementById('file-input').files[0];
                        if (imageFile) {
                            formData.append('league_image', imageFile);
                        } else {
                            const defaultImageBlob = await fetch(defaultImageSrc).then(res => res.blob());
                            formData.append('league_image', defaultImageBlob, 'default_league.png');
                        }
                        // if (typeof refreshpage === "function") {
                            setTimeout(() => {
                                showLoader(); // Show the loader with a delay (optional)
                            }, 100);
                      
                            // Perform the redirect and handle loader visibility
                            Promise.resolve()
                                .then(async() => {
                                    try {
                                        const response = await fetch('https://krinik.in/league_get/', {
                                            method: 'POST',
                                            body: formData
                                        });
                                        // console.log(response)
                                        if (!response.ok) {
                                            throw new Error('Failed to add league');
                                        }
                                        showDynamicAlert("League Added Successfully !!")
            
                                        setTimeout(() => {
                                            window.location.href = 'manage-league.html';
                                        }, 2000);
                                    } catch (error) {
                                        console.error('Error:', error);
                                        alert('An error occurred while adding the league.');
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
                            hideLoader(); // Ensure loader hides if no redirect function is provided
                        }
                        
                    // }
                }
            } else {
                console.log('Form validation failed. Please check all fields.');
            }
       
             
        });

  

        document.getElementById('short-league-name').addEventListener('input', function (event) {
            this.value = this.value.toUpperCase();
        });

        document.getElementById('file-input').addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('preview-image').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });


    } catch (error) {
        console.error('Error fetching existing leagues:', error);
    }

});

function browserback() {
// Add an entry to the history stack

// Redirect to the match-league page
window.location.replace('./manage-league.html');
history.pushState(null, null, window.location.href = ('./manage-league.html'));
}

window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
        // Reload the page only once
        window.location.reload();
    }
  });
window.onload = checkAdminAccess();