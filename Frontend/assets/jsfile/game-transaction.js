import {checkAdminAccess}  from "../js/initial.js"
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
// let totaldataleague = document.querySelector("#total-league-data");

async function fetchData() {
  try {
    const data = await $.ajax({
      url: "https://krinik.in/game_amount_get/",
      method: "GET"
    });

    if (data && data.status === "success") {
      rankList = data.data;
      array = rankList;
      filterAndDisplay();
      console.log(array)
      //   totaldataleague.innerHTML = array.length;
    } else {
      console.error("Error: Invalid data format");
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
}

fetchData();

function filterAndDisplay() {
  filterRankList();
  preLoadCalculations();
  displayIndexButtons();
  displayTableRows();
  highlightIndexButton();
}

function preLoadCalculations(filteredArrayLength) {
  array_length = filteredArrayLength || array.length;
  max_index = Math.ceil(array_length / table_size);
}


$(document).ready(function () {
const $dropdownBtn3 = $('#dropdownBtn3');
const $dropdownContent3 = $('#dropdownContent3');
const $selectedStatus = $('#selectedStatus');
const $arrow = $('#arrowBar'); // Ensure this selector matches your HTML
const $clearStatus = $('#clearStatus');

function toggleDropdown() {
const isExpanded = $dropdownContent3.toggleClass('show').hasClass('show');
$dropdownBtn3.attr('aria-expanded', isExpanded);
}

// Click event for the selected status element to toggle the dropdown
$selectedStatus.on('click', function() {
toggleDropdown();
});

// Click event for the arrow to toggle the dropdown
$arrow.on('click', function() {
toggleDropdown();
});

// Click event for selecting an item from the dropdown
$dropdownContent3.on('click', 'a', function() {
const selectedValue = $(this).data('value');
$selectedStatus.text(selectedValue).data('value', selectedValue);
$dropdownContent3.removeClass('show');

if (selectedValue === 'All Status') {
$arrow.show();
$clearStatus.hide();
} else {
$arrow.hide();
$clearStatus.show();
}
filterRankList(); // Filter based on the selected status
});

// Click event for clearing the selected status
$clearStatus.on('click', function() {
$selectedStatus.text('All Status').data('value', 'All Status');
$arrow.show();
$clearStatus.hide();
$dropdownContent3.removeClass('show'); // Hide the dropdown content
$dropdownBtn3.attr('aria-expanded', 'false'); // Ensure dropdown button is collapsed
filterRankList(); // Filter with the reset status
});

// Click event for closing the dropdown if clicked outside
$(document).on('click', function(event) {
if (!$selectedStatus.is(event.target) && !$selectedStatus.has(event.target).length && !$dropdownContent3.has(event.target).length && !$arrow.is(event.target) && !$clearStatus.is(event.target)) {
$dropdownContent3.removeClass('show');
$dropdownBtn3.attr('aria-expanded', 'false');
}
});



// Initialize Flatpickr
let picker = flatpickr('#rangePicker', {
  mode: 'range',
  dateFormat: 'd-m-Y',
  onClose: function (selectedDates, dateStr, instance) {
    if (!selectedDates || selectedDates.length === 0) {
      instance.clear();
      $('#rangePicker').text('Start & End Date').removeClass('has-dates');
      $('#clearDates').hide();
      $('#calendarIcon').show();
    } else {
      $('#rangePicker').text(selectedDates.map(date => instance.formatDate(date, 'd-m-Y')).join(' - ')).addClass('has-dates');
      $('#clearDates').show();
      $('#calendarIcon').hide();
    }
    filterRankList();
  },
  clickOpens: false,
  allowInput: false
});

$('#rangePicker, #calendarIcon').click(function () {
  if (!$('#rangePicker').hasClass('has-dates')) {
    picker.open();
  }
});

$('#clearDates').click(function () {
  picker.clear();
  $('#rangePicker').text('Start & End Date').removeClass('has-dates');
  $('#clearDates').hide();
  $('#calendarIcon').show();
  filterRankList();
});

function updateAmountFilters() {
const startAmount = $('#startAmountRange').val().trim();
const endAmount = $('#endAmountRange').val().trim();

// Show or hide clear buttons based on input values
if (startAmount !== '' && endAmount === '') {
$('#clearAmountStart').show();
$('#clearAmountEnd').hide();
} else if (startAmount !== '' && endAmount !== '') {
$('#clearAmountStart').show();
$('#clearAmountEnd').show();
} else if (startAmount === '' && endAmount === '') {
$('#clearAmountStart').hide();
$('#clearAmountEnd').hide();
} else if (startAmount === '' && endAmount !== '') {
$('#clearAmountStart').hide();
$('#clearAmountEnd').show();
}

// Always call filterRankList to apply the filter
filterRankList();
}


$('#startAmountRange').on('input', function () {
updateAmountFilters();
});

// Event listeners for the end amount range input
$('#endAmountRange').on('input', function () {
updateAmountFilters();
});

// Event listener for clearing the start amount range
$('#clearAmountStart').click(function () {
$('#startAmountRange').val('');
updateAmountFilters(); // Call the update function to handle the UI changes
});

// Event listener for clearing the end amount range
$('#clearAmountEnd').click(function () {
$('#endAmountRange').val('');
updateAmountFilters(); // Call the update function to handle the UI changes
});

// Initial call to update filters and hide/show clear buttons on page load
updateAmountFilters();
$('#tab_filter_text').on('input', function () {
filterRankList();
});


});





function filterRankList() {
var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
console.log('Search Text:', tab_filter_text);
var datefilter = $('#rangePicker').text().trim();
const statusFilter = $("#selectedStatus").data('value') || ''; // Get the selected status value
console.log('Selected Status:', statusFilter);
var startDate, endDate;

// Parse amount range
var startAmount = parseFloat($('#startAmountRange').val().trim()) || -Infinity;
var endAmount = parseFloat($('#endAmountRange').val().trim()) || Infinity;

// console.log('Start Amount:', startAmount);
// console.log('End Amount:', endAmount);

// Parse the date range from the range picker
if (datefilter !== '' && datefilter !== 'Start & End Date') {
  var dates = datefilter.split(' - ');
  startDate = moment(dates[0], 'D-M-YYYY').startOf('day').toDate();
  endDate = moment(dates[1], 'D-M-YYYY').endOf('day').toDate();
  // console.log('Parsed Start Date:', startDate);
  // console.log('Parsed End Date:', endDate);
}

// Filter the rankList based on text, status, date range, and amount range
var filteredArray = rankList.filter(function (object) {
  var matchesText = true, matchesStatus = true, matchesDate = true, matchesAmount = true;

  // Filter based on text input
  if (tab_filter_text !== '') {
    matchesText = (object.pool.pool_name && object.pool.pool_name.toLowerCase().includes(tab_filter_text)) ||
      (object.pool.pool_type && object.pool.pool_type.toLowerCase().includes(tab_filter_text)) ||
      (object.username.name && object.username.name.toLowerCase().includes(tab_filter_text)) ||
      (object.username.mobile_no  && object.username.mobile_no.toString().includes(tab_filter_text)) ||
      (object.transactions_id && object.transactions_id.toLowerCase().toString().includes(tab_filter_text))  ;
  }

  // Filter based on status dropdown
  if (statusFilter !== 'All Status') {
  const status = object.status.toLowerCase()
  console.log(status)
  matchesStatus = (status === statusFilter);
  // console.log(matchesStatus ,"okli")
}

  // Filter based on date range
  if (startDate && endDate) {
    const objectDate = moment(object.date_time, 'YYYY-MM-DD HH:mm:ss').toDate();
    matchesDate = (objectDate >= startDate && objectDate <= endDate);
    // console.log('Object Date:', objectDate, 'Matches Date:', matchesDate);
  }

  // Filter based on amount range
  if (!isNaN(object.amount)) {
    const amount = parseFloat(object.amount);
    matchesAmount = (amount >= startAmount && amount <= endAmount);
    // console.log('Object Amount:', amount, 'Matches Amount:', matchesAmount);
  }

  return matchesText && matchesStatus && matchesDate && matchesAmount;
});

// Update the table with filtered data
array = filteredArray;
preLoadCalculations(array.length);
current_index = 1;
displayIndexButtons();
highlightIndexButton();
displayTableRows();
}


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
  $("table tbody").empty();
  var tab_start = start_index - 1;
  var tab_end = end_index;

  if (array.length === 0) {
    $("#noDataFound").show();
    $("#pagination").hide();
    $("#table-scrolling").css("overflow-x", "hidden"); // Add this line
    return;
  } else {
    $("#noDataFound").hide();
    $("#pagination").show();
    $("#table-scrolling").css("overflow-x", "auto"); // Add this line
  }

  for (var i = tab_start; i < tab_end; i++) {
    var showdata = array[i];
    var status = getStatus(showdata["status"]);
  var status1 = showdata["status"].toLowerCase()
  var credit_debit = showdata["credit_debit"].toLowerCase()
  console.log(status1)
  console.log(credit_debit) 

    var tr = $("<tr></tr>");

    var noCell = $("<td></td>").text(i + 1);
    var poolNameCell = $("<td colspan='3'></td>").text(showdata.pool["pool_name"] || "");
    var poolTypeCell = $("<td colspan='3'> </td>").text(showdata.pool["pool_type"] || "");
    var userNameCell = $("<td colspan='3'> </td>").text(showdata.username["name"] || "");
    var mobileCell = $("<td colspan='3'> </td>").text(showdata.username["mobile_no"] || "");

    var transactionId = $("<td colspan='3'> </td>").text(showdata["transactions_id"] || "");
    var credit_debitCell = $("<td colspan='2'> </td>").text(showdata["credit_debit"] || "");
    var amountCell = $("<td colspan='3'> </td>"); // Initialize amountCell

try {
if (credit_debit === "credit" && status1 === "success") {
amountCell.html(`<span style="color: green; font-weight: 600">&#x2b;${showdata["amount"] || ""}</span>`);
} else if (credit_debit === "debit" && status1 === "success") {
amountCell.html(`<span style="color: red; font-weight: 600">&#x2212;${showdata["amount"] || ""}</span>`);
} else if (credit_debit === "credit" && status1 === "fail") {
amountCell.html(`<span>${showdata["amount"] || ""}</span>`); // Default display
} else if (credit_debit === "debit" && status1 === "fail") {
amountCell.html(`<span>${showdata["amount"] || ""}</span>`); // Default display
} else if (credit_debit === "credit" && status1 === "pending") {
amountCell.html(`<span>${showdata["amount"] || ""}</span>`); // Default display
} else if (credit_debit === "debit" && status1 === "pending") {
amountCell.html(`<span>${showdata["amount"] || ""}</span>`); // Default display
}
} catch (error) {
console.error("Error updating amountCell:", error);
amountCell.html("<span>Error displaying amount</span>");
}


     var statusCell = $("<td colspan='2'></td>").html(status);

     var dateCell = $("<td colspan='2'></td>").text(moment(showdata["date_time"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'));

    // var viewCell = $("<td></td>").html(
    //   // '<span class="sortable" onclick="window.location.href=\'view-league-details.html\'"><i class="far fa-eye"></i></span>'
    //     '<span class="sortable" onclick="viewLeagueDetails(\'' + showdata["league_name"] + '\')"><i class="far fa-eye"></i></span>'
    // );
    // var editCell = $("<td></td>").html(
    //   '<span class="sortable" onclick="handleEdit(' + showdata["id"] + ')"><i class="far fa-edit"></i></span>'
    // );
    // var deleteCell = $("<td></td>").html(
    //   '<span class="sortable" onclick="handleDelete(' + showdata["id"] + ')"><i class="far fa-trash-alt"></i></span>'
    // );
   
    tr.append(noCell)
      .append(poolNameCell)
      .append(poolTypeCell)
      .append(userNameCell)
      .append(mobileCell)
      .append(transactionId)
      .append(credit_debitCell)
      .append(amountCell)
      .append(statusCell)
      .append(dateCell)
    // .append(deleteCell);

    if (credit_debitCell === "credit" || credit_debitCell === "Credit") {

    }

    $("table tbody").append(tr);
  }

}


const table = document.getElementById('tech-companies-1');
const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
const workbook = XLSX.utils.table_to_book(table, { sheet: 'Game Transaction Data' });
const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
const url = URL.createObjectURL(data);
const a = document.createElement('a');
a.href = url;
a.download = 'game_transaction_data.xlsx';
a.click();

URL.revokeObjectURL(url);
a.remove();
});

window.onload = checkAdminAccess();