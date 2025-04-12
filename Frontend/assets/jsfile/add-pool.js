



import { refreshpage } from "./pagerefresh.js";
import {checkAdminAccess,sendNotification,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

document.addEventListener('DOMContentLoaded', async function () {
  const matchSelect = document.getElementById('matchSelect');
  const priceInput = document.getElementById('priceInput');
  const addPriceButton = document.getElementById('addPriceButton');
  const priceList = document.getElementById('priceList');
  const errorPrice = document.getElementById('error-price');
  const prices = [];
  let existingPool = []

  const noNumberOrWhitespaceRegex = /^(?!.*[\uD83C-\uDBFF\uDC00-\uDFFF])^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+(?: [a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+)*$/;
  const noNumberOrWhitespaceRegex1 = /^(?!.*[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;
  const alphanumericRegex = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;
  existingPool = await myFetch("https://krinik.in/add_pool_get/", "GET")
  // existingPool = existingPool1

  console.log(existingPool)
  // Fetch match data from the API
  async function fetchMatchData() {
    try {
      const response = await fetch('https://krinik.in/match_get/');
      if (!response.ok) {
        console.error('Network response was not ok. Status:', response.status, 'Status Text:', response.statusText);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const matchData = data.data;
      console.log(matchData, "matchdata1");
      const currentDate1 = new Date();
      const currentDate = moment(currentDate1, 'YYYY-MM-DD HH:mm'); // Keep as moment object with full date and time
      console.log(currentDate.format('DD-MM-YYYY HH:mm')); // Log the current date and time

      // Populate the select dropdown with match display names
      matchData.forEach(match => {
        // Split the match_start_date into date and time
        const [datePart, timePart] = match.match_start_date.split(' '); // ["15-10-2024", "13:00"]

        // Create a moment object from the split date and time parts
        let matchStartDate = moment(`${datePart} ${timePart}`, 'DD-MM-YYYY HH:mm'); // Create moment object with the correct format

        console.log(currentDate.format('DD-MM-YYYY HH:mm'), matchStartDate.format('DD-MM-YYYY HH:mm'));

        // Compare both date and time (including hours and minutes)
        if (matchStartDate.isAfter(currentDate)) {
          const option = document.createElement('option');
          option.value = match.match_display_name; // Use match display name as the value
          option.textContent = match.match_display_name;
          matchSelect.appendChild(option);
        }
      });




      initializeDatePickers();
    } catch (error) {
      console.error('Error fetching match data:', error);
    }
  }




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


  function initializeDatePickers() {
    const matchDisplayName = matchSelect.value; // Get the selected match display name
    const matchDate = getMatchEndDate(matchDisplayName); // Assuming this function extracts end date

    // Initialize the start date picker
    const startPicker = flatpickr('#fantasyStartDate', {
      dateFormat: 'd-m-Y H:i',
      enableTime: true,
      minDate: 'today', // Disable past dates
      maxDate: matchDate, // Set the max date to the match date
      onReady: function (selectedDates, dateStr, instance) {
        addCustomButtons(instance, '#fantasyStartDate');
      }
    });

    // Add custom buttons to the picker
    function addCustomButtons(instance, inputSelector) {
      if (!instance || !instance.calendarContainer) {
        console.error('Flatpickr instance or calendar container not found.');
        return;
      }

      let existingFooter = instance.calendarContainer.querySelector('.flatpickr-footer');
      if (existingFooter) {
        existingFooter.remove();
      }

      const footer = document.createElement('div');
      footer.className = 'flatpickr-footer';

      const okButton = document.createElement('button');
      okButton.type = 'button';
      okButton.className = 'flatpickr-ok-button';
      okButton.textContent = 'OK';
      okButton.addEventListener('click', function () {
        instance.close();
      });

      const clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'flatpickr-clear-button';
      clearButton.textContent = 'Clear';
      clearButton.addEventListener('click', function () {
        document.querySelector(inputSelector).value = '';
        instance.clear();
      });

      footer.appendChild(okButton);
      footer.appendChild(clearButton);

      instance.calendarContainer.appendChild(footer);
    }
  }


  function getMatchEndDate(matchDisplayName) {
    // Assuming the end date is part of the matchDisplayName and needs to be extracted
    const parts = matchDisplayName.split(" ");
    const matchDateStr = parts.slice(-2).join(" ");
    return flatpickr.parseDate(matchDateStr, "d-m-Y H:i");
  }

  // Handle match selection change
  matchSelect.addEventListener('change', function () {
    const matchDisplayName = this.value;
    const matchDate = getMatchEndDate(matchDisplayName);

    // Update Flatpickr configurations
    const startPicker = flatpickr('#fantasyStartDate', {
      dateFormat: 'd-m-Y H:i',
      enableTime: true,
      minDate: 'today',
      maxDate: matchDate,
    });

    document.getElementById('fantasyStartDate').value = '';
  });

  // Call fetchMatchData to initialize dropdown and date picker

  // Add other event listeners and validation functions
  // ...
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
  function isValidTeamName2(value) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}]/u;
    const alphanumericRegex = /^[a-zA-Z0-9.]+(?: [a-zA-Z0-9.]+)*$/u;

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
  function sanitizePriceInput(inputElement) {
    inputElement.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, ''); // Remove any non-digit characters
      this.value = value; // Optionally, you can update the input value
    });
  }
  sanitizePriceInput(priceInput);

  priceInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { // Check if Enter key is pressed
      const price = parseFloat(priceInput.value);
      if (!isNaN(price) && !prices.includes(price)) {
        prices.push(price);
        updatePriceList();
        priceInput.value = '';
        if (checkPriceValidation()) {
          checkPriceValidation();
        }
      }
    }
  });

  addPriceButton.addEventListener('click', function () {
    const price = parseFloat(priceInput.value);
    if (!isNaN(price) && !prices.includes(price)) {
      prices.push(price);
      updatePriceList();
      priceInput.value = '';
      if (checkPriceValidation()) {
        checkPriceValidation()
      }
    }
  });
  // priceInput.addEventListener('input', function () {
  //   const price = parseFloat(priceInput.value);
  //   if (!isNaN(price) && !prices.includes(price)) {
  //     prices.push(price);
  //     updatePriceList();
  //     priceInput.value = '';
  //     if (checkPriceValidation()) {
  //       checkPriceValidation();
  //     }
  //   }
  // });
  


  function updatePriceList() {
    priceList.innerHTML = '';
    prices.forEach((price, index) => {
      const div = document.createElement('div');
      div.className = 'price-item';
      div.innerHTML = `${price} <span onclick="removePrice(${index})">&times;</span>`;
      priceList.appendChild(div);
    });
  }

  function checkPriceValidation() {
    if (prices.length === 0) {
      errorPrice.innerHTML = 'Price list cannot be empty';
      errorPrice.style.display = 'block';
      return false
    } else {
      errorPrice.style.display = 'none';
      return true
    }
  }


  window.removePrice = function (index) {
    prices.splice(index, 1);
    updatePriceList();
    // if (checkPriceValidation()) {
    //   checkPriceValidation()
    // }
  }


  await fetchMatchData();

  document.getElementById('winningPrizeInput').addEventListener('keydown', function (event) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      let value = this.value.replace('x', ''); // Remove 'X' if present
      value = value.slice(0, -1); // Remove the last digit

      if (value) {
        this.value = `${value}x`; // Append 'X' at the end
      } else {
        this.value = ''; // Ensure the input is empty when value is empty
      }

      // Prevent the default backspace action
      event.preventDefault();
    }
  });

  document.getElementById('winningPrizeInput').addEventListener('input', function (event) {
    let value = this.value.replace('x', '').replace(/[^0-9.]/g, ''); // Remove 'X' and any non-numeric characters except the decimal point

    // Ensure there's only one decimal point and limit it to one digit after the decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = `${parts[0]}.${parts[1]}`; // Allow only one decimal point
    } else if (parts.length === 2) {
      value = `${parts[0]}.${parts[1].slice(0, 1)}`; // Limit to one digit after the decimal
    }

    if (value) {
      this.value = `${value}x`; // Append 'X' at the end
    } else {
      this.value = ''; // Ensure the input is empty when value is empty
    }
  });


  // function checkPoolOverlap(selectMatch, poolName,startDate1, existingPool) {
  function checkPoolOverlap(selectMatch, poolName, poolType, existingPool) {

    // const startDate = document.getElementById('fantasyStartDate').value;
    if (!existingPool || existingPool.length === 0) {
      return { matchNameOverlap: false };
    }

    const normalizedName = selectMatch.trim().toLowerCase();
    const normalizedShortName = poolName.trim().toLowerCase();
    const normalizedShortType = poolType.trim().toLowerCase();


    const matchNameOverlap = existingPool.some(match => {
      const normalizedExistingName = match?.select_match?.match_display_name?.trim().toLowerCase();
      const normalizedExistingShortName = match.pool_name.trim().toLowerCase();
      const normalizedExistingShortType = match.pool_type.trim().toLowerCase();
      return normalizedExistingName === normalizedName && normalizedExistingShortName === normalizedShortName && normalizedExistingShortType === normalizedShortType;
    });

    // const poolNameOverlap = existingPool.some(league => {
    //   const normalizedExistingShortName = league.pool_name.trim().toLowerCase() ;
    //   const normalizedExistingShortType = league.pool_type.trim().toLowerCase();
    //   return normalizedExistingShortName === normalizedShortName && normalizedExistingShortType === normalizedShortType;
    // });

    // const poolTypeOverlap = existingPool.some(league => {
    //     const normalizedExistingShortType = league.pool_type.trim().toLowerCase();
    //     return normalizedExistingShortType === normalizedShortType;
    //   });

    //                 const dateOverlap = existingPool.some(match => {
    //                     const matchStartDateStr1 = match.fantacy_start_date;
    // ;
    //                     const [day, month, year] = matchStartDateStr1.split(/[- ]+/);
    //                     const matchStartDateStr = `${day}-${month}-${year}`;

    //                     const startDateStr = startDate;
    //                     const [startDay, startMonth, startYear] = startDateStr.split(/[- ]+/);
    //                     const startDateObj = `${startDay}-${startMonth}-${startYear}`;

    //                     return startDateObj === matchStartDateStr;
    //                 });
    //                 console.log('Date Overlap:', dateOverlap);
    // console.log(matchNameOverlap,poolNameOverlap,poolTypeOverlap,"jsj")
    // return { matchNameOverlap, poolNameOverlap,dateOverlap };
    return { matchNameOverlap };


  }

  function validateMatchSelection() {
    const matchSelect = document.getElementById('matchSelect');
    const errorSpan = document.getElementById('error-match');

    if (!matchSelect || !errorSpan) {
      console.error('Match selection elements not found');
      return false;
    }



    function validate() {
      if (matchSelect.value === '') {
        errorSpan.innerHTML = 'Please select a match';
        errorSpan.style.display = 'inline';
        return false;
      } else {
        errorSpan.style.display = 'none';
        return true;
      }
    }


    matchSelect.addEventListener('change', validate);
    // poolSelect.addEventListener('change', validate1);
    return validate()
  }


  function validateoPoolSelection() {

    const poolSelect = document.getElementById('poolTypeSelect');
    const errorpoolSpan = document.getElementById('error-pool');


    if (!poolSelect || !errorpoolSpan) {
      console.error('Pool selection elements not found');
      return false;
    }


    function validate() {
      if (poolSelect.value === '') {
        errorpoolSpan.innerHTML = 'Please select a pool';
        errorpoolSpan.style.display = 'inline';
        return false;
      } else {
        errorpoolSpan.style.display = 'none';
        return true;
      }
    }

    poolSelect.addEventListener('change', validate);
    return validate()
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



  function validateMatchDates() {
    const startDate = document.getElementById('fantasyStartDate');
    // const endDate = document.getElementById('fantasyEndDate');
    const errorSpanStart = document.getElementById('error-fantacy-start-date');
    // const errorSpanEnd = document.getElementById('error-fantacy-end-date');

    function validateDate(dateInput, errorSpan) {
      if (!dateInput || !errorSpan) {
        console.error('Date input elements not found');
        return false;
      }

      function validate() {
        if (!dateInput.value) {
          errorSpan.innerHTML = 'Please select a date';
          errorSpan.style.display = 'inline';
          return false;
        } else {
          errorSpan.style.display = 'none';
          return true;
        }
      }

      dateInput.addEventListener('change', validate);
      return validate();
    }

    const validStartDate = validateDate(startDate, errorSpanStart);
    // const validEndDate = validateDate(endDate, errorSpanEnd);

    // return validStartDate && validEndDate;
    return validStartDate;

  }


  function validateForm() {
    const MatchValid = validateMatchSelection();
    const PoolValid = validateoPoolSelection();

    const isValidPoolName = validateInput(
      'poolNameInput',
      'error-pool-name',
      isValidTeamName1,
      'Please enter a pool name',
      'Please enter a valid pool name'
    );

    const isValidWinningPrice = validateInput(
      'winningPrizeInput',
      'error-win-price',
      isValidTeamName2,
      'Please enter a winning price',
      'Please enter a valid winning price'
    );

    const isPriceAdd = checkPriceValidation()
    // const teamValid = validateTeamSelection();
    // const playerValid = validatePlayerSelection();
    const datesValid = validateMatchDates();

    return MatchValid && datesValid && PoolValid && isValidPoolName && isPriceAdd && isValidWinningPrice;
    // return MatchValid  && PoolValid && isValidPoolName && isPriceAdd && isValidWinningPrice;

  }


  // let sendNotificatoin = async () => {
  //   let response = await fetch('https://krinik.in/user_get/')
  //   let data = await response.json()
  //   let tokens = []
  //   data.data.map((x) => {
  //     tokens.push(x.device_token)
  //   })
  //   let payload = {
  //     "tokens": tokens,
  //     "title": "New Poll Added!",
  //     "body": "Place your bets! A new poll is live in the app. Check it out and join the action now!",

  //   }
  //   try {
  //     const response2 = await fetch('https://fcm-notification-u6yp.onrender.com/send-notifications', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response2.ok) {
  //       console.error('Network response was not ok. Status:', response2.status, 'Status Text:', response2.statusText);
  //       throw new Error('Network response was not ok');
  //     }

  //     return response2

  //   } catch (error) {
  //     console.error('Error:', error);


  //   }


  // }


  document.getElementById('submitButton').addEventListener('click', async function () {



    const selectMatch = matchSelect.value; // Get selected match display name
    const poolType = document.getElementById('poolTypeSelect').value;
    const poolName = document.getElementById('poolNameInput').value;
    const winningPrize = parseFloat(document.getElementById('winningPrizeInput').value);
    const fantasyStartDate = document.getElementById('fantasyStartDate').value;
    // const fantasyEndDate = document.getElementById('fantasyEndDate').value;
    const startDate1 = fantasyStartDate;

    const payload = {
      select_match: selectMatch,
      pool_type: poolType,
      pool_name: poolName,
      price: prices,
      winning_price: winningPrize,
      fantacy_start_date: fantasyStartDate,
      // fantacy_end_date: fantasyEndDate
    };
    // if (!validateForm()) {

    // } else {
    //   try {
    //     const response = await fetch('https://krinik.in/add_pool_get/', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(payload)
    //     });

    //     if (!response.ok) {
    //       console.error('Network response was not ok. Status:', response.status, 'Status Text:', response.statusText);
    //       throw new Error('Network response was not ok');
    //     }

    //     const data = await response.json();
    //     console.log('Success:', data);

    //     // Redirect based on pool_type and pass select_match and pool_name in the URL
    //     // 



    //   } catch (error) {
    //     console.error('Error:', error);


    //   }
    // }
    // const overlapResult = checkPoolOverlap(selectMatch, poolName,startDate1, existingPool);
    const overlapResult = checkPoolOverlap(selectMatch, poolName, poolType, existingPool);


    if (validateForm()) {


      // Handle overlap errors
      // if (overlapResult.matchNameOverlap && overlapResult.poolNameOverlap && overlapResult.dateOverlap) {
      if (overlapResult.matchNameOverlap) {

        document.getElementById('error-match').innerHTML = 'Match already exists';
        document.getElementById('error-match').style.display = 'inline';
        document.getElementById('error-pool-name').innerHTML = 'Pool name already exists';
        document.getElementById('error-pool-name').style.display = 'inline';

      } else {
        // Proceed with form submission if there are no overlap errors
        if (confirm("Are you sure you want to add this match?")) {
          showLoader()
          try {
            const response = await fetch('https://krinik.in/add_pool_get/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              console.error('Network response was not ok. Status:', response.status, 'Status Text:', response.statusText);
              throw new Error('Network response was not ok');
            }
            showDynamicAlert("Pool Added Successfully !!")
            await sendNotification(null, {
                title: "New Pool Added!",
                body: "Place your bets! A new pool is live in the app. Check it out and join now!"
              })
            const data = await response.json();
            console.log('Success:', data);
            // window.location.href = "./manage-pool.html"
            // Redirect based on pool_type and pass select_match and pool_name in the URL
            // Redirect based on pool_type and pass select_match and pool_name in the URL
            const urlParams = new URLSearchParams({
              match: selectMatch,
              pool_name: poolName,
              pool_type: poolType
            });
            switch (payload.pool_type) {
              case 'Silver':
                window.location.href = 'pool-A.html?' + urlParams.toString();
                break;
              case 'Gold':
                window.location.href = 'pool-B.html?' + urlParams.toString();
                break;
              case 'Platinum':
                window.location.href = 'pool-C.html?' + urlParams.toString();
                break;
              default:
                // Redirect to a default page or handle unexpected cases
                console.log('Unknown pool type:', payload.pool_type);
                break;
            }
          hideLoader()

          } catch (error) {
            console.error('Error:', error);
          }
        }
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


refreshpage()
window.onload = checkAdminAccess();