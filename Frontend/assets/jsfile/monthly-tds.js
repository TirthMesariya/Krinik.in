import {checkAdminAccess}  from "../js/initial.js"
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
let userNameSpan = document.querySelector("#user-name-span");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
console.log(id);




async function fetchUserData() {
  try {
    // Fetch both data in parallel
    const [data] = await Promise.all([
      $.ajax({
        url: "https://krinik.in/withdraw_amount_get/",
        method: "GET"
      }),
    
    ]);

    // Check if both requests were successful
    if (data && data.status === "success" ) {
      // Combine both data responses into one array
      const combinedData = data.data;
      
      let  filteredArray = combinedData.filter((item) => item.withdraw_status === "approved");
      // Sort combined data by timestamp (assuming it's in "YYYY-MM-DD HH:mm:ss" format)
      filteredArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Descending order

      console.log(filteredArray);
      rankList = filteredArray
      if (rankList.length > 0) {
        array = rankList;
        console.log(array,"plo")
        filterAndDisplay(); // Call the function to filter and display data
      } else {
        console.error("No matching data found for the given ID");
      }
      // Call your filter and display function with sorted data
      filterAndDisplay();
      // Optionally, update your UI with the combined data
      // totaldataleague.innerHTML = combinedData.length;
    } else {
      console.error("Error: Invalid data format");
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
}





fetchUserData();

function filterAndDisplay() {
//   filterRankList();
  preLoadCalculations();
  displayIndexButtons();
  displayTableRows();
  highlightIndexButton();
}

function preLoadCalculations(filteredArrayLength) {
  array_length = filteredArrayLength || array.length;
  max_index = Math.ceil(array_length / table_size);
}

// $(document).ready(function () {
// const $dropdownBtn3 = $('#dropdownBtn3');
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
// $arrow.show();
// $clearStatus.hide();
// } else {
// $arrow.hide();
// $clearStatus.show();
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
// $dropdownContent3.removeClass('show');
// $dropdownBtn3.attr('aria-expanded', 'false');
// }
// });



// // Initialize Flatpickr
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

// // Show or hide clear buttons based on input values
// if (startAmount !== '' && endAmount === '') {
// $('#clearAmountStart').show();
// $('#clearAmountEnd').hide();
// } else if (startAmount !== '' && endAmount !== '') {
// $('#clearAmountStart').show();
// $('#clearAmountEnd').show();
// } else if (startAmount === '' && endAmount === '') {
// $('#clearAmountStart').hide();
// $('#clearAmountEnd').hide();
// } else if (startAmount === '' && endAmount !== '') {
// $('#clearAmountStart').hide();
// $('#clearAmountEnd').show();
// }

// // Always call filterRankList to apply the filter
// filterRankList();
// }

// $('#startAmountRange').on('input', function () {
// updateAmountFilters();
// });

// // Event listeners for the end amount range input
// $('#endAmountRange').on('input', function () {
// updateAmountFilters();
// });

// // Event listener for clearing the start amount range
// $('#clearAmountStart').click(function () {
// $('#startAmountRange').val('');
// updateAmountFilters(); // Call the update function to handle the UI changes
// });

// // Event listener for clearing the end amount range
// $('#clearAmountEnd').click(function () {
// $('#endAmountRange').val('');
// updateAmountFilters(); // Call the update function to handle the UI changes
// });

// // Initial call to update filters and hide/show clear buttons on page load
// updateAmountFilters();
// $('#tab_filter_text').on('input', function () {
// filterRankList();
// });
// });
window.prev = prev
window.next = next
window.indexPagination = indexPagination

// function filterRankList() {
//   var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
// console.log('Search Text:', tab_filter_text);
// var datefilter = $('#rangePicker').text().trim();
// const statusFilter = $("#selectedStatus").data('value') || ''; 
//   var startDate, endDate;
//   var startAmount = parseFloat($('#startAmountRange').val().trim()) || 0;
// var endAmount = parseFloat($('#endAmountRange').val().trim()) || Infinity;

// if (datefilter !== '' && datefilter !== 'Start & End Date') {
//   var dates = datefilter.split(' - ');
//   startDate = moment(dates[0], 'D-M-YYYY').startOf('day').toDate();
//   endDate = moment(dates[1], 'D-M-YYYY').endOf('day').toDate();
//   // console.log('Parsed Start Date:', startDate);
//   // console.log('Parsed End Date:', endDate);
// }


//   var filteredArray = rankList.filter(function (object) {
//     var matchesText = true, matchesStatus = true, matchesDate = true, matchesAmount = true;

//     if (tab_filter_text !== '') {
//         matchesText = (object.paid_amount && object.paid_amount.toString().toLowerCase().includes(tab_filter_text)) ||
//         (object.amount_without_tds && object.amount_without_tds.toString().toLowerCase().includes(tab_filter_text)) ||
//         (object.user_data.mobile_no && object.user_data.mobile_no.toString().toLowerCase().includes(tab_filter_text))
//       }

//     if (statusFilter !== 'All Status') {
//         let status;

//         // Default status check
//         if (object.payment_status && object.payment_status.toLowerCase() === "approved") {
//             status = "credit"; // Set status to "credit" if payment_status is approved
//         } else if (object.withdraw_status && object.withdraw_status.toLowerCase() === "approved") {
//             status = "debit"; // Set status to "debit" if withdraw_status is approved
//         }

//         // Check if status matches the filter
//         matchesStatus = (status && status === statusFilter.toLowerCase());
//     }
      




//     // if (startDate && endDate) {
//     //   matchesDate = (moment(object.start_league_date, 'DD/MM/YYYY').toDate() >= startDate &&
//     //     moment(object.end_league_date, 'DD/MM/YYYY').toDate() <= endDate);
//     // }
//     if (startDate && endDate) {
//     const objectDate = moment(object.timestamp, 'YYYY-MM-DD HH:mm:ss').toDate();
//     matchesDate = (objectDate >= startDate && objectDate <= endDate);
//     // console.log('Object Date:', objectDate, 'Matches Date:', matchesDate);
//   }

//   // Filter based on amount range
//   if (!isNaN(object.paid_amount) || !isNaN(object.amount_without_tds)) {
//     const paidAmount = parseFloat(object.paid_amount); // Parse paid_amount
//     const amountWithoutTDS = parseFloat(object.amount_without_tds); // Parse amount_without_tds
    
//     // Compare both amounts to the range (using paidAmount or amountWithoutTDS as needed)
//     matchesAmount = (paidAmount >= startAmount && paidAmount <= endAmount) || (amountWithoutTDS >= startAmount && amountWithoutTDS <= endAmount);

//     console.log('Paid Amount:', paidAmount, 'Amount Without TDS:', amountWithoutTDS, 'Matches Amount:', matchesAmount);
// } else {
//     console.log('Invalid or missing amounts for object:', object);
// }


//   return matchesText && matchesStatus && matchesDate && matchesAmount;
//   });

//   array = filteredArray;
//   preLoadCalculations();
//   current_index = 1;
//   displayIndexButtons();
//   highlightIndexButton()
//   displayTableRows();
// }

function getStatus(status) {
if (status === "success" || status === "Success") {
  return `<span class="material-symbols-outlined" style="color:green">check_circle</span>`;
} else if (status === "fail" || status === "Fail") {
  return `<span class="material-symbols-outlined" style="color:red">error</span>`;
} else if (status === "pending" || status === "Pending") {
  return `<span class="material-symbols-outlined" style="color:#fbde08">schedule</span>`;
} else {
  return "unknown";
}
}
window.getStatus = getStatus
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
    $("#table-scrolling").empty(); // Clear existing tables
  
    if (array.length === 0) {
      $("#noDataFound").show();
      $("#pagination").hide();
      return;
    } else {
      $("#noDataFound").hide();
      $("#pagination").show();
    }
  
    const groupedData = array.reduce((acc, item) => {
      const monthYear = moment(item.timestamp, "YYYY-MM-DD HH:mm:ss").format(
        "MMMM YYYY"
      );
      if (!acc[monthYear]) acc[monthYear] = { data: [], totalTDS: 0 };
      const tdsAmount =
        (item.amount_without_tds || 0) - (item.amount_with_tds || 0);
      acc[monthYear].data.push(item);
      acc[monthYear].totalTDS += tdsAmount;
      return acc;
    }, {});
  
    Object.keys(groupedData).forEach((monthYear, index) => {
      const tableWrapper = $("<div></div>").addClass("table-wrapper");
  
      const tableId = `dynamic-table-${index}`; // Unique ID for each table
  
      const table = $(`
        <table id="${tableId}" class="table table-striped text-center align-items-center fixed-table">
          <thead class="align-items-center">
            <tr>
              <th colspan="14">${monthYear}</th>
            </tr>
            <tr>
              <th>No.</th>
              <th colspan="3">Name</th>
              <th colspan="3">Mobile No.</th>
              <th colspan="2">Date & Time</th>
              <th colspan="2">Status</th>
              <th colspan="3">Amount</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `);
  
      const tbody = table.find("tbody");
      groupedData[monthYear].data.forEach((showdata, idx) => {
        const tdsAmount =
          (showdata.amount_without_tds || 0) - (showdata.amount_with_tds || 0);
        const noCell = $("<td></td>").text(idx + 1);
        const mobileCell = $("<td colspan='3'></td>").text(
          showdata.user_data["mobile_no"] || ""
        );
        const userName = $("<td colspan='3'></td>").text(showdata.user_data.name); 
        const dateCell = $("<td colspan='2'></td>").text(
          moment(showdata.timestamp, "YYYY-MM-DD HH:mm:ss").format(
            "DD-MM-YYYY HH:mm:ss"
          )
        );
        const statusCell = $("<td colspan='2'></td>").html(
          `<span class="material-symbols-outlined" style="color:green">check_circle</span>`
        );
        const amountCell = $("<td colspan='3'></td>").html(
          `<span font-weight:600">${tdsAmount}</span>`
        );
  
        const row = $("<tr></tr>")
          .append(noCell)
          .append(userName)
          .append(mobileCell)
          .append(dateCell)
          .append(statusCell)
          .append(amountCell);
  
        tbody.append(row);
      });
  
      const totalTDSRow = $("<tr></tr>").append(
        $("<td colspan='13' style='text-align: right; font-weight: bold;'></td>").text(
          "Total TDS:"
        ),
        $("<td style='font-weight: bold;color: green;'></td>").text(
          groupedData[monthYear].totalTDS.toFixed(2)
        )
      );
  
      tbody.append(totalTDSRow);
  
      tableWrapper.append(table);
      $("#table-scrolling").append(tableWrapper);
    });
  }
  

// $("#download-btn").on("click", () => {
//     const allTables = document.querySelectorAll("#table-scrolling table");
  
//     if (allTables.length === 0) {
//       alert("No data available to download!");
//       return;
//     }
  
//     const updatedData = array.map(item => {
//         const monthYear = moment(item.timestamp, "YYYY-MM-DD HH:mm:ss").format("MMMM YYYY");
//         return { ...item, monthYear };
//       });
//     const workbook = XLSX.utils.book_new();
  
//     allTables.forEach((table, index) => {
//       const sheet = XLSX.utils.table_to_sheet(table);
//       XLSX.utils.book_append_sheet(workbook, sheet, table.monthYear);
//     });

    
   
    
//     //   updatedData.forEach(item => {
//     //     const worksheet = XLSX.utils.json_to_sheet([item]); // Assuming data is structured as JSON
//     //     XLSX.utils.book_append_sheet(workbook, worksheet, item.monthYear);
//     //   });
  
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
  
//     const url = URL.createObjectURL(data);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "Monthly_User_data.xlsx";
//     a.click();
  
//     URL.revokeObjectURL(url);
//     a.remove();
//   });


$("#download-btn").on("click", () => {
  const allTables = document.querySelectorAll("#table-scrolling table");

  if (allTables.length === 0) {
    alert("No data available to download!");
    return;
  }

  // Prepare the data for the Excel file from the array
  const updatedData = array.map(item => {
    const monthYear = moment(item.timestamp, "YYYY-MM-DD HH:mm:ss").format("MMMM YYYY");
    return { ...item, monthYear };
  });

  console.log(updatedData,"updata")
  // const workbook = XLSX.utils.book_new();

  // Iterate through the tables and add each to the Excel workbook
  // allTables.forEach((table, index) => {
  //   const sheet = XLSX.utils.table_to_sheet(table);
  //   const monthYear = table.getAttribute('data-month-year') || `Sheet-${index + 1}`;
  //   XLSX.utils.book_append_sheet(workbook, sheet, monthYear);
  // });

  // Create a separate sheet for the user data (based on the updatedData)
  const excelData = updatedData.map((object, index) => {
    const nameUser = object.user_data?.name || "Unknown User";
    const matchDetails = object.user_data?.mobile_no || "N/A";
    const formattedMobileNo = matchDetails.toString(); // Force Excel to treat as text
console.log(formattedMobileNo)
    const amountCell = object.tds;
    
    const statusCell = object["payment_status"]?.toLowerCase() || object["withdraw_status"]?.toLowerCase() || "null";
    let statusText = "Null";
    if (statusCell === "approved") statusText = "Approved";
    if (statusCell === "rejected") statusText = "Rejected";
    if (statusCell === "pending") statusText = "Pending";
    

    // Explicitly format date as string (DD-MM-YYYY HH:mm:ss)
    const dateCell = moment(object["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss');
console.log(dateCell)
    return {
      No: index + 1,
      "Name": nameUser,
      "Mobile No": `${formattedMobileNo}`,  // Now treated as text to prevent scientific notation
      "Date & Time": dateCell,         // Ensure correct date formatting
      Status: statusText,
      "Amount": amountCell
    };
  });
  const totalTds = updatedData.reduce((sum, item) => sum + (item.tds || 0), 0);

  excelData.push({
    No: "",
    "Name": "",
    "Mobile No": "",
    "Date & Time": "",
    Status: "TotalTDS",
    "Amount": totalTds
  });
  // Create a worksheet from the updated data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Adjust column widths for better spacing
  const columnWidths = [
    { wpx: 50 },  // No (narrow column)
    { wpx: 250 }, // Name (wide column)
    { wpx: 150 }, // Mobile No (medium column)
    { wpx: 100 }, // Amount (narrow column)
    { wpx: 150 }, // Status (medium column)
    { wpx: 150 }, // Date & Time (medium column)
  ];
  worksheet["!cols"] = columnWidths; // Apply column widths

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Match Data");

  // Write the workbook to a file and trigger the download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "display_match_data.xlsx";
  a.click();

  // Clean up the created object URL and remove the link element
  URL.revokeObjectURL(url);
  a.remove();
});



  
  


  



  
  
  
window.onload = checkAdminAccess();
