import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

// $(document).on("contentLoaded", function () {
  
// });
document.addEventListener('DOMContentLoaded', async function () {
  const matchSelect = document.getElementById('matchSelect');
  const priceInput = document.getElementById('priceInput');
  const addPriceButton = document.getElementById('addPriceButton');
  const priceList = document.getElementById('priceList');
  const errorPrice = document.getElementById('error-price');
  let prices = [];
  let existingPool = []
  let initialData
  let matchValue,fixedDate,fantasyStartDate
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

      // Populate the select dropdown with match display names
      matchData.forEach(match => {
        const option = document.createElement('option');
        option.value = match.match_display_name; // Use match display name as the value
        option.textContent = match.match_display_name;
        matchSelect.appendChild(option);
      });
      
    } catch (error) {
      console.error('Error fetching match data:', error);
    }
  }

  await fetchMatchData();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log(id, "id che")
  if (id) {
    try {
      const response = await fetch(`https://krinik.in/add_pool_get/pool_id/${id}/`, { method: "GET" });
      if (!response.ok) {
        throw new Error('Failed to fetch league data');
      }

      let leagueData = await response.json();
      console.log(leagueData.data)
      editplayerdata(leagueData.data);
      
    } catch (error) {
      console.error('Error fetching league data:', error);
    }
  } else {
    console.error("No id parameter found in the URL.");
  }


  function editplayerdata(response) {
    const selectMatch = document.getElementById('matchSelect'); // Get selected match display name
    const poolType = document.getElementById('poolTypeSelect');
    const poolName = document.getElementById('poolNameInput');
    const priceValues1 = document.getElementById('priceList');
    const winningPrize = document.getElementById('winningPrizeInput');
     fantasyStartDate = document.getElementById('fantasyStartDate');
    // const fantasyEndDate = document.getElementById('fantasyEndDate');

    if (response) {
      // Populate form fields
      selectMatch.value = response.select_match.match_display_name // Get selected match display name
      console.log(selectMatch.value)
      poolType.value = response.pool_type
      poolName.value = response.pool_name
      priceValues1.values = response.price.map((price, index) => {
        const div = document.createElement('div');
        div.className = 'price-item';
        div.innerHTML = `${price} <span onclick="removePrice(${index})">&times;</span>`;
        priceList.appendChild(div);
        return price;
      });

      prices = [...priceValues1.values]; // Initialize prices array with fetched prices
      console.log("Initialized prices array:", prices);
      // console.log(prices.value)
      winningPrize.value = `${response.winning_price}x`

      fantasyStartDate.value = response.fantacy_start_date
      // fantasyEndDate.value = response.fantacy_end_date
      fixedDate = fantasyStartDate.value
      matchValue = selectMatch.value
      initializeDatePickers(matchValue,fixedDate,fantasyStartDate);
      // Store initial data
      initialData = {

        select_match: matchSelect.value,
        pool_type: poolType.value,
        pool_name: poolName.value,
        price: prices, // Ensure this variable is defined
        winning_price: parseFloat(winningPrize.value),
        fantacy_start_date: fantasyStartDate.value,
        // fantacy_end_date: fantasyEndDate.value
      };

      console.log('Initial data set:', initialData);
    } else {
      console.error("Data is not in the expected format:", response);
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



  function initializeDatePickers(matchValue,fixedDate,fantasyStartDate) {
    const matchDisplayName = matchValue; // Get the selected match display name
    const matchDate = getMatchEndDate(matchDisplayName); // Assuming this function extracts end date
    // console.log(matchDate,matchDisplayName,"okoklp")
    let okButtonClicked = false;

    // Initialize the start date picker
    const startPicker = flatpickr(fantasyStartDate, {
      dateFormat: 'd-m-Y H:i',
      enableTime: true,
      minDate: 'today', // Disable past dates
      maxDate: matchDate, // Set the max date to the match date
      onChange: function (selectedDates, dateStr, instance) {
        if (okButtonClicked) {
          document.querySelector(fantasyStartDate).value = dateStr;
        }else{
          document.querySelector(fantasyStartDate).value = fixedDate;
          
        }
      },
      onReady: function (selectedDates, dateStr, instance) {
        addCustomButtons(instance, fantasyStartDate);
      },
    });
    $("#calendarIconStart").click(function () {
      startPicker.open();
    });
  

    // Add custom buttons to the picker
    

    // $(document).on("click", function (event) {
    //   if (
    //     !$(event.target).closest("#match-start-date").length &&
    //     !$(event.target).closest(".flatpickr-calendar").length
    //   ) {
    //     // If clicked outside the datepicker, don't update the input
    //     if (!okButtonClicked) {
    //       startPicker.setDate(document.querySelector("#match-start-date").value, false); // Reset the date if no OK button click
    //     }
    //   }
    // });
  }
function addCustomButtons(instance, fantasyStartDate) {
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
        document.querySelector(fantasyStartDate).value = '';
        instance.clear();
      });

      footer.appendChild(okButton);
      footer.appendChild(clearButton);

      instance.calendarContainer.appendChild(footer);
    }

  function getMatchEndDate(matchDisplayName) {
    // Assuming the end date is part of the matchDisplayName and needs to be extracted
    const parts = matchDisplayName.split(" ");
    const matchDateStr = parts.slice(-2).join(" ");
    return flatpickr.parseDate(matchDateStr, "d-m-Y H:i");
  }

  // Handle match selection change
  // matchSelect.addEventListener('change', function () {
  //   const matchDisplayName = this.value;
  //   const matchDateTime = getMatchEndDateTime(matchDisplayName);

  //   // Update Flatpickr configurations
  //   const startPicker = flatpickr('#fantasyStartDate', {
  //     dateFormat: 'd-m-Y H:i',
  //     enableTime: true,
  //     minDate: 'today',
  //     maxDate: matchDateTime.date,
  //     maxTime: matchDateTime.time,
  //   });
  // });
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
      let value = this.value.replace(/[^0-9.]/g, '');  // Remove any non-digit characters
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

  function updatePriceList() {
    priceList.innerHTML = '';
    prices.forEach((price, index) => {
      const div = document.createElement('div');
      div.className = 'price-item';
      div.innerHTML = `${price} <span onclick="removePrice(${index})">&times;</span>`;
      priceList.appendChild(div);
    });
  }

  // Function to add a new price
  addPriceButton.addEventListener('click', function () {
    const price = parseFloat(priceInput.value);
    if (!isNaN(price) && !prices.includes(price)) {
      prices.push(price); // Add the new price to the prices array
      updatePriceList();
      priceInput.value = '';
      if (checkPriceValidation()) {
        checkPriceValidation();
      }
    }
  });





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


  function checkPoolOverlap(selectMatch, poolName, startDate1, existingPool) {
    const startDate = document.getElementById('fantasyStartDate').value;
    if (!existingPool || existingPool.length === 0) {
      return { matchNameOverlap: false, poolNameOverlap: false, };
    }

    const normalizedName = selectMatch.trim().toLowerCase();
    const normalizedShortName = poolName.trim().toLowerCase();

    const matchNameOverlap = existingPool.some(match => {
      const normalizedExistingName = match.select_match.match_display_name.trim().toLowerCase();
      return normalizedExistingName === normalizedName;
    });

    const poolNameOverlap = existingPool.some(league => {
      const normalizedExistingShortName = league.pool_name.trim().toLowerCase();
      return normalizedExistingShortName === normalizedShortName;
    });

    // const dateOverlap = existingPool.some(match => {
    //   const matchStartDateStr1 = match.fantacy_start_date;
    //   ;
    //   const [day, month, year] = matchStartDateStr1.split(/[- ]+/);
    //   const matchStartDateStr = `${day}-${month}-${year}`;

    //   const startDateStr = startDate;
    //   const [startDay, startMonth, startYear] = startDateStr.split(/[- ]+/);
    //   const startDateObj = `${startDay}-${startMonth}-${startYear}`;

    //   return startDateObj === matchStartDateStr;
    // });
    // console.log('Date Overlap:', dateOverlap);
    console.log(matchNameOverlap, "okkk2")
    return { matchNameOverlap, poolNameOverlap, };
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

   let isPriceAdd = checkPriceValidation()
    // const teamValid = validateTeamSelection();
    // const playerValid = validatePlayerSelection();
    const datesValid = validateMatchDates();

    return MatchValid && datesValid && PoolValid && isValidPoolName && isPriceAdd && isValidWinningPrice;
  }

  async function submitPoolData(data, method) {
    const formData = new FormData();


    formData.append('select_match', data.select_match);
    formData.append('pool_type', data.pool_type);
    formData.append('pool_name', data.pool_name);

    // Append each price individually
    data.price.map(price => {
      formData.append('price', [price]);
    });

    formData.append('winning_price', data.winning_price);
    formData.append('fantacy_start_date', data.fantacy_start_date);
    // formData.append('fantacy_end_date', data.fantacy_end_date);

    // Log formData keys and values
    formData.forEach((value, key) => {
      console.log(key, value);
    });
    try {
      const response = await fetch(`https://krinik.in/add_pool_get/pool_id/${id}/`, {
        method: method,
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add pool');
      }

      const responseData = await response.json();
      console.log('Success1:', responseData.data);
      // window.location.href = './manage-pool.html';
      const urlParams = new URLSearchParams({
        match: data.select_match,
        pool_name: data.pool_name,
        pool_type: data.pool_type,
        id: id
      });
      switch (data.pool_type) {
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
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the pool. Please try again later.');
    }
  }


  document.getElementById('submitButton').addEventListener('click', async function () {
    // const selectMatch = matchSelect.value; // Get selected match display name
    const selectMatch = document.getElementById('matchSelect').value;
    //  const priceValues1 = document.getElementById('priceList');
    const poolType = document.getElementById('poolTypeSelect').value;
    const poolName = document.getElementById('poolNameInput').value;
    const winningPrize = parseFloat(document.getElementById('winningPrizeInput').value);
    const fantasyStartDate = document.getElementById('fantasyStartDate').value;
    // const fantasyEndDate = document.getElementById('fantasyEndDate').value;
    const startDate1 = fantasyStartDate;

    // const currentData = {
    //   select_match: matchSelect.value,
    //   pool_type: document.getElementById('poolTypeSelect').value,
    //   pool_name: document.getElementById('poolNameInput').value,
    //   price: prices, // Ensure this variable is defined
    //   winning_price: parseFloat(document.getElementById('winningPrizeInput').value),
    //   fantacy_start_date: document.getElementById('fantasyStartDate').value,
    //   fantacy_end_date: document.getElementById('fantasyEndDate').value
    // };



    const currentData = {
      select_match: selectMatch,
      pool_type: poolType,
      pool_name: poolName,
      price: prices,
      winning_price: winningPrize,
      fantacy_start_date: fantasyStartDate,
      // fantacy_end_date: fantasyEndDate
    };

    // currentData.forEach(play =>{
    //   console.log(currentData)
    // })
    console.log(currentData, "ok")
    const overlapResult = checkPoolOverlap(selectMatch, poolName, startDate1, existingPool);


    if (validateForm()) {

      const hasMatchChanged = currentData.select_match !== initialData.select_match;
      const hasDateChanged = currentData.fantacy_start_date !== initialData.fantacy_start_date;


      const hasPoolTypeChanged = currentData.pool_type !== initialData.pool_type;
      const hasPoolNameChanged = currentData.pool_name !== initialData.pool_name;
      const hasWinningPriceChanged = currentData.winning_price !== initialData.winning_price;
      const hasPriceChanged = currentData.price !== initialData.price;

      if (hasPoolNameChanged || hasWinningPriceChanged || hasPriceChanged || hasDateChanged) {
        if (confirm("Are you sure you want to edit this pool?")) {
          showLoader()
          try {
           await submitPoolData(currentData, 'PATCH');
            showDynamicAlert("Pool Updated Successfully !!")
            // await sendNotification(null, {
            //     title: "Pool Updated!",
            //     body: "Place your bets! A new pool is live in the app. Check it out and join now!"
            //   })
          } catch (error) {
            console.error('Error:', error);
          }
          hideLoader()
        }
       
      }
      else {
        if (confirm("Are you sure you want to edit this pool?")) {
          showLoader()
          try {
           await submitPoolData(initialData, 'PATCH');
          } catch (error) {
            console.error('Error:', error);
          }
          hideLoader()
        }
      }
    } else {
      console.log('Form validation failed. Please check all fields.');
    }

  });
  window.onload = checkAdminAccess();
  
});

