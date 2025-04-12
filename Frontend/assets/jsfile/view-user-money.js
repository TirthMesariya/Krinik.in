import {checkAdminAccess,sendNotification,showDynamicAlert}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const user_id = urlParams.get("user_id");

    let updateWinning = 0;
    let array;
    var array_length = 0;
    var table_size = 10;
    var start_index = 1;
    var end_index = 0;
    var current_index = 1;
    var max_index = 0;
    let totalDeposit
    // let userData5
    // const Approvebtn = document.getElementById("Approvebtn");
    // const Rejectbtn = document.getElementById("Rejectbtn");

    const userFullName = document.getElementById("user-fullname");
    const userImageView = document.getElementById("user-image-view");
    const userMob = document.getElementById("user-mob");
    const userEmail = document.getElementById("user-email");

    const depositAmount = document.getElementById("deposit-amount");
    // const bonusAmount = document.getElementById("bonus-amount");
    // const referAmount = document.getElementById("refer-amount");
    // const winningAmount = document.getElementById("winning-amount");
    const totalAmount = document.getElementById("total-amount");
    // const withdrawAmount = document.getElementById("withdraw-amount");
//     const giftBonusButton = document.getElementById("gift-bonus-btn");
    
//     const defaultBonusBtn = document.getElementById('defaultBonusBtn');
//   const manualBonusInput = document.getElementById('manualBonusInput');
//   const giftBonusForm = document.getElementById('gift-bonus-form');
//   const giftBonusModal = document.getElementById('giftBonusModal');
  
  // When "Default Bonus" is clicked, set the value in the input field
 
  // Prevent the modal from closing when the form is submitted and close it manually



    async function fetchUserData() {
        try {
            if (!user_id) {
                console.warn("No player ID found in URL.");
                return;
            }

            const url = `https://krinik.in/user_get/${user_id}/`;
            const url1 = `https://krinik.in/payment/user_id/${user_id}/`;
            console.log("Fetching player data from:", url);
            console.log("Fetching withdrawal data from:", url1);

            const [response, response1] = await Promise.all([fetch(url), fetch(url1)]);

            if (!response.ok || !response1.ok) {
                throw new Error("Failed to fetch data");
            }

            const userData1 = await response.json();
            const userData2 = await response1.json();

            const userData = userData1.data;
            console.log(userData,"userdata")
            const userData3 = userData2.data;
            if(userData){
                totalDeposit = userData.total_deposited_amount
                console.log(totalDeposit,"totaldeposit")

            }

            // userData5 = Number(userData3.amount);

            //  if (userData5 === 0) {
            //     Approvebtn.disabled = true;
            //     Approvebtn.style.pointerEvents = "none";
            //     Rejectbtn.disabled = true;
            //     Rejectbtn.style.pointerEvents = "none";
            // } else {
            //     Approvebtn.disabled = false;
            //     Rejectbtn.disabled = false;

                // Approvebtn.style.pointerEvents = "auto";
            // }
            editPlayerData(userData, userData3);
        } catch (error) {
            console.error("Error fetching player data:", error);
        }
    }

    function editPlayerData(response, userdetails) {
        if (response) {
            userImageView.src = `https://krinik.in${response.image}`;
            userFullName.textContent = response.name;
            userMob.textContent = response.mobile_no;
            userEmail.textContent = response.email;
            depositAmount.textContent = response.deposit_amount;
            // bonusAmount.textContent = response.bonus_amount;
            // referAmount.textContent = response.referral_amount;
            // winningAmount.textContent = response.winning_amount;
            
            totalAmount.textContent = response.wallet_amount;
            // withdrawAmount.textContent = amount;
            const userWithdrawData = userdetails; // Store in a separate variable

            // Assuming 'userWithdrawData' is the data for the table
            array = userWithdrawData;

            filterAndDisplay()
            // updateWinning = response.winning_amount - amount;

            // const giftBonusButton = document.getElementById("gift-bonus-btn");
        // if (amount >= 5000) {
        //     giftBonusButton.style.display = "block"; // Show button
        // } else {
        //     giftBonusButton.style.display = "none"; // Hide button
        // }
        } else {
            console.error("Data is not in the expected format:", response);
        }
    }
 
    

    async function patchData( walletAmountValue,idCell,newDepositAmount ,TotDepo,amountWithTDS) {
        try {
            const apiUrl1 = `https://krinik.in/payment/${idCell}/`;
            const apiUrl2 = `https://krinik.in/user_get/${user_id}/`;

            // First PATCH request to update `winning_amount` and `wallet_amount`
            const response1 = await fetch(apiUrl2, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    
                    wallet_amount: walletAmountValue,
                    deposit_amount : newDepositAmount,
                    total_deposited_amount : TotDepo,
                })
            });

            if (!response1.ok) {
                throw new Error("Failed to patch winning_amount and wallet_amount in first API");
            }
            console.log("Patch for winning_amount and wallet_amount successful:", await response1.json());

            // Second PATCH request to update `amount`
            const response2 = await fetch(apiUrl1, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({payment_status: "approved"  })
            });

            if (!response2.ok) {
                throw new Error("Failed to patch amount in second API");
            }
           
            if(response1.ok && response2.ok){
                showDynamicAlert("Deposit Request Approved Successfully !!")

                await sendNotification(user_id, {
                    title: "Deposit Successful!",
                    body: `Your deposit request has been successfully processed, and an amount of ${amountWithTDS} has been credited to your wallet!`
                  });
                  setTimeout(()=>{

                      fetchUserData();
                      editPlayerData()
                  },2000)
            }
            console.log("Patch for amount successful:", await response2.json());

            // Re-fetch data to update `totalAmount` and other fields
            // alert("Approved successfully!");
           

        } catch (error) {
            console.error("Error patching data:", error);
        }
    }


    function filterAndDisplay() {
        console.log(array,"nitin")
        console.log(array.length)
        // filterRankList();
        preLoadCalculations();
        displayIndexButtons();
        displayTableRows();
        highlightIndexButton();
      }
      
      function preLoadCalculations(filteredArrayLength) {
        array_length = filteredArrayLength || array.length;
        max_index = Math.ceil(array_length / table_size);
      }
      
    //   $(document).ready(function () {
      //   const $dropdownBtn3 = $('#dropdownBtn3');
      // const $dropdownContent3 = $('#dropdownContent3');
      // const $selectedStatus = $('#selectedStatus');
      // const $arrow = $('#arrowBar'); // Ensure this selector matches your HTML
      // const $clearStatus = $('#clearStatus');
      
      // function toggleDropdown() {
      // const isExpanded = $dropdownContent3.toggleClass('show').hasClass('show');
      // $dropdownBtn3.attr('aria-expanded', isExpanded);
      // }
      
      // // Click event for the selected status element to toggle the dropdown
      // $selectedStatus.on('click', function() {
      // toggleDropdown();
      // });
      
      // // Click event for the arrow to toggle the dropdown
      // $arrow.on('click', function() {
      // toggleDropdown();
      // });
      
      // // Click event for selecting an item from the dropdown
      // $dropdownContent3.on('click', 'a', function() {
      // const selectedValue = $(this).data('value');
      // $selectedStatus.text(selectedValue).data('value', selectedValue);
      // $dropdownContent3.removeClass('show');
      
      // if (selectedValue === 'All Status') {
      //   $arrow.show();
      //   $clearStatus.hide();
      // } else {
      //   $arrow.hide();
      //   $clearStatus.show();
      // }
      // filterRankList(); // Filter based on the selected status
      // });
      
      // // Click event for clearing the selected status
      // $clearStatus.on('click', function() {
      // $selectedStatus.text('All Status').data('value', 'All Status');
      // $arrow.show();
      // $clearStatus.hide();
      // $dropdownContent3.removeClass('show'); // Hide the dropdown content
      // $dropdownBtn3.attr('aria-expanded', 'false'); // Ensure dropdown button is collapsed
      // filterRankList(); // Filter with the reset status
      // });
      
      // // Click event for closing the dropdown if clicked outside
      // $(document).on('click', function(event) {
      // if (!$selectedStatus.is(event.target) && !$selectedStatus.has(event.target).length && !$dropdownContent3.has(event.target).length && !$arrow.is(event.target) && !$clearStatus.is(event.target)) {
      //   $dropdownContent3.removeClass('show');
      //   $dropdownBtn3.attr('aria-expanded', 'false');
      // }
      // });
      
      
      
        // Initialize Flatpickr
        // let picker = flatpickr('#rangePicker', {
        //   mode: 'range',
        //   dateFormat: 'd-m-Y',
        //   onClose: function (selectedDates, dateStr, instance) {
        //     if (!selectedDates || selectedDates.length === 0) {
        //       instance.clear();
        //       $('#rangePicker').text('Start & End Date').removeClass('has-dates');
        //       $('#clearDates').hide();
        //       $('#calendarIcon').show();
        //     } else {
        //       $('#rangePicker').text(selectedDates.map(date => instance.formatDate(date, 'd-m-Y')).join(' - ')).addClass('has-dates');
        //       $('#clearDates').show();
        //       $('#calendarIcon').hide();
        //     }
        //     filterRankList();
        //   },
        //   clickOpens: false,
        //   allowInput: false
        // });
      
        // $('#rangePicker, #calendarIcon').click(function () {
        //   if (!$('#rangePicker').hasClass('has-dates')) {
        //     picker.open();
        //   }
        // });
      
        // $('#clearDates').click(function () {
        //   picker.clear();
        //   $('#rangePicker').text('Start & End Date').removeClass('has-dates');
        //   $('#clearDates').hide();
        //   $('#calendarIcon').show();
        //   filterRankList();
        // });
      
        // function updateAmountFilters() {
      // const startAmount = $('#startAmountRange').val().trim();
      // const endAmount = $('#endAmountRange').val().trim();
      
      // Show or hide clear buttons based on input values
      // if (startAmount !== '' && endAmount === '') {
      //   $('#clearAmountStart').show();
      //   $('#clearAmountEnd').hide();
      // } else if (startAmount !== '' && endAmount !== '') {
      //   $('#clearAmountStart').show();
      //   $('#clearAmountEnd').show();
      // } else if (startAmount === '' && endAmount === '') {
      //   $('#clearAmountStart').hide();
      //   $('#clearAmountEnd').hide();
      // } else if (startAmount === '' && endAmount !== '') {
      //   $('#clearAmountStart').hide();
      //   $('#clearAmountEnd').show();
      // }
      
      // Always call filterRankList to apply the filter
      // filterRankList();
      // }
      
      
      // $('#startAmountRange').on('input', function () {
      // updateAmountFilters();
      // });
      
      // Event listeners for the end amount range input
      // $('#endAmountRange').on('input', function () {
      // updateAmountFilters();
      // });
      
      // Event listener for clearing the start amount range
      // $('#clearAmountStart').click(function () {
      // $('#startAmountRange').val('');
      // updateAmountFilters(); // Call the update function to handle the UI changes
      // });
      
      // Event listener for clearing the end amount range
      // $('#clearAmountEnd').click(function () {
      // $('#endAmountRange').val('');
      // updateAmountFilters(); // Call the update function to handle the UI changes
      // });
      
      // Initial call to update filters and hide/show clear buttons on page load
      // updateAmountFilters();
      // $('#tab_filter_text').on('input', function () {
      // filterRankList();
      // });
      
      
    //   });
      
      
    //   function filterRankList() {
    //     var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
    //   //   console.log('Search Text:', tab_filter_text);
    //     // var datefilter = $('#rangePicker').text().trim();
    //     // const statusFilter = $("#selectedStatus").data('value') || ''; // Get the selected status value
    //   //   console.log('Selected Status:', statusFilter);
    //   //   var startDate, endDate;
      
    //     // Parse amount range
    //   //   var startAmount = parseFloat($('#startAmountRange').val().trim()) || -Infinity;
    //   //   var endAmount = parseFloat($('#endAmountRange').val().trim()) || Infinity;
      
    //     // console.log('Start Amount:', startAmount);
    //     // console.log('End Amount:', endAmount);
      
    //     // Parse the date range from the range picker
    //     // if (datefilter !== '' && datefilter !== 'Start & End Date') {
    //       // var dates = datefilter.split(' - ');
    //       // startDate = moment(dates[0], 'D-M-YYYY').startOf('day').toDate();
    //       // endDate = moment(dates[1], 'D-M-YYYY').endOf('day').toDate();
    //       // console.log('Parsed Start Date:', startDate);
    //       // console.log('Parsed End Date:', endDate);
    //     // }
      
    //     // Filter the rankList based on text, status, date range, and amount range
    //     var filteredArray = array.filter(function (object) {
    //       var matchesText = true 
      
    //       // Filter based on text input
    //       if (tab_filter_text !== '') {
    //         matchesText = (object.user_data.user_id && object.user_data.user_id.toLowerCase().includes(tab_filter_text)) ||
    //           (object.user_data.name && object.user_data.name.toString().toLowerCase().includes(tab_filter_text)) ||
    //           (object.user_data.email && object.user_data.email.toLowerCase().includes(tab_filter_text)) ||
    //           (object.user_data.mobile_no && object.user_data.mobile_no.toString().includes(tab_filter_text)) ||
    //           (object.user_data.user_doc.account_number && object.user_data.user_doc.account_number.toString().toLowerCase().includes(tab_filter_text)) ||
    //           (object.user_data.user_doc.bank_name && object.user_data.user_doc.bank_name.toLowerCase().includes(tab_filter_text)) ||
    //           (object.user_data.user_doc.ifsc_code && object.user_data.user_doc.ifsc_code.toLowerCase().includes(tab_filter_text))    ;
    //       }
      
    //       // let status = object.profile_status.toLowerCase();
      
      
    //   // // Filter based on status dropdown
    //   // if (statusFilter !== 'All Status') {
    //   //   matchesStatus = (status === statusFilter.toLowerCase());
    //   // }
      
    //       // Filter based on date range
    //       // if (startDate && endDate) {
    //         // const objectDate = moment(object.date_time, 'YYYY-MM-DD HH:mm:ss').toDate();
    //         // matchesDate = (objectDate >= startDate && objectDate <= endDate);
    //         // console.log('Object Date:', objectDate, 'Matches Date:', matchesDate);
    //       // }
      
    //       // Filter based on amount range
    //   //     if (!isNaN(object.wallet_amount)) {
    //   //       const amount = parseFloat(object.wallet_amount);
    //   //       matchesAmount = (amount >= startAmount && amount <= endAmount);
    //   //       // console.log('Object Amount:', amount, 'Matches Amount:', matchesAmount);
    //   //     }
    //   //     if (!isNaN(object.winning_amount )) {
    //   //       const amount = parseFloat(object.winning_amount);
    //   //       matchesAmount1 = (amount >= startAmount && amount <= endAmount);
    //   //       // console.log('Object Amount:', amount, 'Matches Amount:', matchesAmount);
    //   //     }
      
    //       return matchesText ;
    //     });
      
    //     // Update the table with filtered data
    //     array = filteredArray;
    //     preLoadCalculations(array.length);
    //     current_index = 1;
    //     displayIndexButtons();
    //     highlightIndexButton();
    //     displayTableRows();
    //   }
      
      
      
      function displayIndexButtons() {
      $(".index_buttons ul").empty();
      
      if (array_length <= table_size) {
          // If there are 10 or fewer items, do not show pagination
          return;
      }
      
      if (current_index > 1) {
          $(".index_buttons ul").append('<li><button class="paginate_button page-item previous" onclick="prev()">Previous</button></li>');
      }
      
      const show_page = getElidedPageRange(current_index, max_index);
      
      show_page.forEach(i => {
          if (i === current_index) {
              $(".index_buttons ul").append('<li><button class="paginate_button page-item active">' + i + '</button></li>');
          } else if (i === "...") {
              $(".index_buttons ul").append('<li><button class="paginate_button page-item">...</button></li>');
          } else {
              $(".index_buttons ul").append('<li><button class="paginate_button page-item" onclick="indexPagination(' + i + ')">' + i + '</button></li>');
          }
      });
      
      if (current_index < max_index) {
          $(".index_buttons ul").append('<li><button class="paginate_button page-item next" onclick="next()">Next</button></li>');
      }
      
      highlightIndexButton();
      }
      
      
      function getElidedPageRange(current, total) {
          const delta = 1;
          const range = [];
          const left = current - delta;
          const right = current + delta + 1;
          let last = 0;
      
          for (let i = 1; i <= total; i++) {
              if (i === 1 || i === total || (i >= left && i < right)) {
                  if (last + 1 !== i) {
                      range.push("...");
                  }
                  range.push(i);
                  last = i;
              }
          }
      
          return range;
      }
      
      function highlightIndexButton() {
          start_index = (current_index - 1) * table_size + 1;
          end_index = Math.min(start_index + table_size - 1, array_length);
          $("#datatable_info").text("Showing " + start_index + " to " + end_index + " of " + array_length + " items");
          $(".index_buttons ul a").removeClass("active");
          $('.index_buttons ul a').each(function () {
              if ($(this).text() == current_index) {
                  $(this).addClass("active");
              }
          });
          displayTableRows();
      }
      function prev() {
          if (current_index > 1) {
              current_index--;
              displayIndexButtons();
              highlightIndexButton();
          }
      }
      
      function next() {
          if (current_index < max_index) {
              current_index++;
              displayIndexButtons();
              highlightIndexButton();
          }
      }
      
      function indexPagination(index) {
          current_index = index;
          displayIndexButtons();
          highlightIndexButton();
      }
      
    
     
      
      function displayTableRows() {
        console.log(array, "oklp");
        $("table tbody").empty();
        const approvedRows = array.filter((row) => row["payment_status"] == "approved");
        const rejectedRows = array.filter((row) => row["payment_status"] == "rejected"); // Corrected typo here
        const pendingRows = array.filter((row) => row["payment_status"] !== "approved" && row["payment_status"] !== "rejected").reverse();
    // const pendingRows =  pendingRows1
        // Reorder array: Pending rows first, then approved, then rejected
        let array1 = [...pendingRows, ...approvedRows, ...rejectedRows];
    console.log(array1,"array")
        var tab_start = start_index - 1;
        var tab_end = end_index;
    
        if (array.length === 0) {
            $("#noDataFound").show();
            $("#pagination").hide();
            $("#table-scrolling").css("overflow-x", "hidden");
            return;
        } else {
            $("#noDataFound").hide();
            $("#pagination").show();
            $("#table-scrolling").css("overflow-x", "auto");
        }
    
        for (var i = tab_start; i < tab_end; i++) {
            const showdata = array1[i];
            let isDisabled = "";
    
    // Disable the row if the status is "approved" or "rejected", but not for the first row
   
    
            const tr = $("<tr></tr>").attr("data-index", i);
    
            const noCell = $("<td></td>").text(i + 1);
            const idCell = showdata.id
            const fullNameCell = $("<td colspan='2'></td>").text(showdata["paid_amount"] || 0);
            // const shortNameCell = $("<td colspan='2'></td>").text(showdata["tds"] || 0);
            // const emailCell = $("<td colspan='2'></td>").text(showdata["amount_with_tds"] || 0);
            const statusCell = $("<td colspan='2'></td>").text(
                toCapitalizeCase(showdata["payment_status"] || "Pending")
            );
            const paymentScreenshot = showdata["payment_screenshot"];
            const viewCell = $("<td></td>").html(
                `<span class="sortable view-btn" data-id="${i}" data-set="${showdata.id}" data-screenshot="${paymentScreenshot}" ><i class="far fa-eye"></i></span>`
            );
            console.log(idCell,"idcell")
            const timeCell = $("<td colspan='3'></td>").text(moment(showdata["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'));
    
            const approveCell = $("<td></td>").html(
                `<span class="sortable approve-btn" data-id="${i}" data-set="${idCell}" style="${isDisabled}">✔</span>`
            );
    
            const rejectCell = $("<td></td>").html(
                `<span class="sortable reject-btn" data-id="${i}" data-set="${idCell}" style="${isDisabled}">❌</span>`
            );

            if (i === 0 && (showdata["payment_status"] === "approved" || showdata["payment_status"] == "rejected")) {
                isDisabled = "pointer-events: none; opacity: 0.5;";
                approveCell.find(".approve-btn").css({
                   "font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                viewCell.find(".view-btn").css({
                    "color": "black","font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                [
                    noCell,
                    fullNameCell,
                    // shortNameCell,
                    timeCell,
                    statusCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      "pointer-events": "none",
                      "background-color": "#f0f0f0", // Light gray background
                      color: "#999", // Dull text color
                      opacity: "1", // Make it slightly transparent
                    });
                  });
            }else if(i !== 0){
                approveCell.find(".approve-btn").css({
                    "font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                viewCell.find(".view-btn").css({
                    "color": "black","font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                [
                    noCell,
                    fullNameCell,
                    // shortNameCell,
                    timeCell,
                    statusCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      "pointer-events": "none",
                      "background-color": "#f0f0f0", // Light gray background
                      color: "#999", // Dull text color
                      opacity: "1", // Make it slightly transparent
                    });
                  });
        
            }else{
                approveCell.find(".approve-btn").css({
                    "color": "green","font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                viewCell.find(".view-btn").css({
                    "color": "black","font-size": "18px",    /* Larger font size */
                    "font-weight": "bold"  // This ensures green color for the checkmark
                });
                [
                    noCell,
                    fullNameCell,
                    timeCell,
                    viewCell,
                    statusCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      // "pointer-events": "none",
                      // Light gray background
                      color: "black", // Dull text color
                      // Make it slightly transparent
                    });
                  });
            }
    
           
            tr.append(noCell)
              .append(fullNameCell)
              .append(statusCell)
              .append(timeCell)
            .append(viewCell)
              .append(approveCell)
              .append(rejectCell);
    
            $("table tbody").append(tr);
        }
    }
    $("table").on("click", ".view-btn", async function () {
        const paymentScreenshot = $(this).data("screenshot"); // Retrieve the screenshot URL
        const modalImage = document.querySelector("#imageModal img");
    
        if (paymentScreenshot) {
            // Remove the zoomed class from any previously zoomed image
            modalImage.classList.remove("zoomed");
    
            // Update the modal image source and open the modal
            showImage(paymentScreenshot, "Payment Screenshot");
        } else {
            alert("No screenshot available.");
        }
    });
    
    
    // Event delegation for buttons
    $("table").on("click", ".approve-btn",async function () {
        const index = $(this).data("id");
        const idCell = $(this).data("set");
    
        // Only allow approval for the first row
        if (index !== 0) return alert("Only the first row can be approved.");
    
        const userData = array[index];
        const userData1 = array.find((p)=>p.id == idCell)
        const amountWithTDS = parseFloat(userData1.paid_amount) || 0;
        const currentWalletAmount = Number(parseFloat(totalAmount.textContent)) || 0;       
        const depositAmount1 = Number(parseFloat(depositAmount.textContent))
        // const newWinningAmount = winningAmount1 - amountWithTDS;
            const newWalletAmount = currentWalletAmount + amountWithTDS;
            const newDepositAmount =  depositAmount1 + amountWithTDS
            const TotDepo = Number(totalDeposit) + amountWithTDS
        // console.log(winningAmount1,"winningAmount")
        console.log(currentWalletAmount,"winningAmount")
        console.log(newDepositAmount,"newDepositAmount")


       
        console.log(idCell,"idcell") 
        // setTimeout(() => {
             // Show the loader with a delay (optional)
        // }, 100);
  
        // Perform the redirect and handle loader visibility
        Promise.resolve()
            .then(async() => {
                if (confirm("Are you sure you want to approve it?")) {
                    // Mark as approved
                    showLoader();
                    await patchData( newWalletAmount, idCell,newDepositAmount,TotDepo,amountWithTDS );
                    fetchUserData();
                    editPlayerData()
            
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
    
        
    });

   
    // function addViewImageListener(elementId, imageSrc, title) {
    //     console.log("working")
    //     const element = document.querySelector(`[data-id="${elementId}"]`);
    //     if (element) {
    //         element.addEventListener("click", () => {
    //             showImage(imageSrc, title);
    //         });
    //     }
    // }
    // Function to show the image and update modal title
function showImage(imageSrc, title) {
    console.log(imageSrc,"okok")
    const imageElement = document.getElementById("preview-image");
 // Reset any previous zoom state
 imageElement.classList.remove('zoomed')
    // Set the image source and title for the modal
    imageElement.src = `https://krinik.in/${imageSrc}`;
    document.getElementById("imageModalLabel").innerText = title;

    const imageModal = new bootstrap.Modal(document.getElementById("imageModal"));
    imageModal.show();
   
}

document.querySelector(".modal-body img").addEventListener("click", function () {
    this.classList.toggle("zoomed"); // Toggle zoomed state
});

// Remove zoomed state when the modal is closed
document.getElementById("imageModal").addEventListener("hidden.bs.modal", function () {
    const modalImage = document.querySelector(".modal-body img");
    modalImage.classList.remove("zoomed");
});

// document.getElementById("imageModal").addEventListener('hidden.bs.modal', function () {
//     imageElement.classList.remove('zoomed'); // Remove the zoom effect when modal is closed
// });

    
    $("table").on("click", ".reject-btn",async function () {
        const index = $(this).data("id");
        const idCell = $(this).data("set");
        const userData = array[index];
        const userData1 = array.find((p)=>p.id == idCell)
        // const userData = array[index]; // Get the data for the clicked row
        // const idCell = userData.id; 

        const amountWithTDS = parseFloat(userData1.paid_amount) || 0;
        if (index !== 0) return alert("Only the first row can be approved.");
        if (Number(userData1.amount) === 0) {
            showDynamicAlert("Cannot reject this request. Amount is 0.");
            return;
        }

        // setTimeout(() => {
            // }, 100);
            
            // Perform the redirect and handle loader visibility
            Promise.resolve()
            .then(async() => {
                if (confirm("Are you sure you want to reject it?")) {
                    showLoader(); // Show the loader with a delay (optional)
                    try {
                        const apiUrl1 = `https://krinik.in/payment/${idCell}/`;
                       
                        // Second PATCH request to update `amount`
                        const response2 = await fetch(apiUrl1, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ payment_status: "rejected"  })
                        });
            
                        if (!response2.ok) {
                            throw new Error("Failed to patch amount in second API");
                        }
                        if(response2.ok){
                        showDynamicAlert("Deposit Request Rejected Successfully !!")
                            
                            await sendNotification(user_id, {
                                title: "Deposit Rejected!",
                            body: `Your deposit request for the amount of ${amountWithTDS} has been rejected.`
                              });
                              
                        }
            
                        console.log("Patch for amount successful:", await response2.json());
            
                        // Re-fetch data to update `totalAmount` and other fields
                        setTimeout(()=>{
        
                            fetchUserData();
                        editPlayerData()
                        },2000)
            
                    } catch (error) {
                        console.error("Error patching data:", error);
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

       
    });
      
      function toCapitalizeCase(str) {
        return str.replace(/\b\w/g, function(char) {
            return char.toUpperCase();
        });
      }
      window.toCapitalizeCase = toCapitalizeCase;
      window.indexPagination = indexPagination;
      
      window.prev = prev;
      window.next = next;
      window.indexPagination = indexPagination;
     
    
      
      
   
      
      
      window.addEventListener('pageshow', function (event) {
        if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
            // Reload the page only once
            window.location.reload();
        }
      });
      
   

    fetchUserData();
    window.onload = checkAdminAccess();
});
