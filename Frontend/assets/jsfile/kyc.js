
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
      url: "https://krinik.in/user_get/",
      method: "GET"
    });

    if (data && data.status === "success") {
     let rankList1 = data.data;
      const approvedRows = rankList1.filter((row) => row["profile_status"] == "approved");
      const rejectedRows = rankList1.filter((row) => row["profile_status"] == "rejected"); // Corrected typo here
      const pendingRows = rankList1.filter((row) => row["profile_status"] === "pending").toReversed()  // const pendingRows =  pendingRows1
      // Reorder array: Pending rows first, then approved, then rejected
      console.log(pendingRows,"pending")
      let newArray = [...pendingRows, ...approvedRows, ...rejectedRows];
      rankList = newArray
      array = rankList;
      filterAndDisplay();
      // totaldataleague.innerHTML = array.length;
      console.log(array)
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

  function updateAmountFilters() {
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
filterRankList();
}


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
updateAmountFilters();
$('#tab_filter_text').on('input', function () {
filterRankList();
});


});


function filterRankList() {
  var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
//   console.log('Search Text:', tab_filter_text);
  // var datefilter = $('#rangePicker').text().trim();
  const statusFilter = $("#selectedStatus").data('value') || ''; // Get the selected status value
//   console.log('Selected Status:', statusFilter);
//   var startDate, endDate;

  // Parse amount range
//   var startAmount = parseFloat($('#startAmountRange').val().trim()) || -Infinity;
//   var endAmount = parseFloat($('#endAmountRange').val().trim()) || Infinity;

  // console.log('Start Amount:', startAmount);
  // console.log('End Amount:', endAmount);

  // Parse the date range from the range picker
  // if (datefilter !== '' && datefilter !== 'Start & End Date') {
    // var dates = datefilter.split(' - ');
    // startDate = moment(dates[0], 'D-M-YYYY').startOf('day').toDate();
    // endDate = moment(dates[1], 'D-M-YYYY').endOf('day').toDate();
    // console.log('Parsed Start Date:', startDate);
    // console.log('Parsed End Date:', endDate);
  // }

  // Filter the rankList based on text, status, date range, and amount range
  var filteredArray = rankList.filter(function (object) {
    var matchesText = true, matchesStatus = true  

    // Filter based on text input
    if (tab_filter_text !== '') {
      matchesText = (object.name && object.name.toLowerCase().includes(tab_filter_text)) ||
        (object.mobile_no && object.mobile_no.toString().includes(tab_filter_text)) ||
        (object.email && object.email.toLowerCase().includes(tab_filter_text))   ;
    }

    let status = object.profile_status.toLowerCase();


// // Filter based on status dropdown
if (statusFilter !== 'All Status') {
  matchesStatus = (status === statusFilter.toLowerCase());
}

    // Filter based on date range
    // if (startDate && endDate) {
      // const objectDate = moment(object.date_time, 'YYYY-MM-DD HH:mm:ss').toDate();
      // matchesDate = (objectDate >= startDate && objectDate <= endDate);
      // console.log('Object Date:', objectDate, 'Matches Date:', matchesDate);
    // }

    // Filter based on amount range
//     if (!isNaN(object.wallet_amount)) {
//       const amount = parseFloat(object.wallet_amount);
//       matchesAmount = (amount >= startAmount && amount <= endAmount);
//       // console.log('Object Amount:', amount, 'Matches Amount:', matchesAmount);
//     }
//     if (!isNaN(object.winning_amount )) {
//       const amount = parseFloat(object.winning_amount);
//       matchesAmount1 = (amount >= startAmount && amount <= endAmount);
//       // console.log('Object Amount:', amount, 'Matches Amount:', matchesAmount);
//     }

    return matchesText && matchesStatus ;
  });

  // Update the table with filtered data
  array = filteredArray;
  preLoadCalculations(array.length);
  current_index = 1;
  displayIndexButtons();
  highlightIndexButton();
  displayTableRows();
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

function disableButton(element) {
if (element instanceof HTMLElement) {
console.log("Disabling element:", element); // Debug line
element.classList.add("disabled");
element.setAttribute("disabled", true);
element.style.pointerEvents = "none";
element.style.opacity = "0.5";
} else {
console.error("Invalid element:", element); // Debug line
}
}
function getLocalStorage1(key) {
const item = localStorage.getItem(key);
console.log("Retrieved item from localStorage:", item); // Log the raw item

if (item) {
try {
  const parsedItem = JSON.parse(item);
  console.log("Parsed item:", parsedItem); // Log the parsed item

  // const currentTime = Date.now();
  // if (parsedItem.expirationTime && currentTime > parsedItem.expirationTime) {
  //   console.log("Item has expired. Removing from localStorage.");
  //   localStorage.removeItem(key);
  //   return null;
  // }
  
  return parsedItem.value;
} catch (e) {
  console.error("Error parsing item from localStorage:", e);
  return null;
}
}

return null;
}

  function displayTableRows() {
    $("table tbody").empty();
    var tab_start = start_index -1;
    var tab_end = end_index;
    // let newArray = array.filter()

// console.log(tab_start)
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
    // const admintype = getLocalStorage1("adminType");
    console.log(array,"okok")

    for (var i = tab_start; i < tab_end; i++) {
      var showdata = array[i];
      // var status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);
      // if (showdata["profile_status"] !== "pending" && showdata["profile_status"] !== "approved") {
      //   continue;
      // }
  
      var tr = $("<tr></tr>");

      var noCell = $("<td></td>").text(i+1);
      var fullNameCell = $("<td colspan='2'></td>").text(showdata["name"] || "");
      var shortNameCell = $("<td colspan='2'> </td>").text(showdata["mobile_no"] || "");
      var emailCell = $("<td colspan='3'> </td>").text(showdata["email"] || "");
    //   var walletCell = $("<td colspan='3'> </td>").text(showdata["wallet_amount"] || "");
    //   var winningCell = $("<td colspan='3'> </td>").text(showdata["winning_amount"] || "");
      var statushow = toCapitalizeCase(showdata["status"])
      
        
        var statusCell = $("<td colspan='2'></td>").text(toCapitalizeCase(showdata["profile_status"] || ""));
     
      
    
      var viewCell = $("<td class='otp-exempt' style='border:none'></td>").html(
        '<span class="sortable" onclick="handleView(\'' + showdata['user_id'] + '\')"><i class="far fa-eye"></i></span>'
      );
      
//       if (admintype  == "super admin") {
//         viewCell.hide()
//       }else{
//   viewCell.show();
// }
      // var editCell = $("<td></td>").html(
      //   '<span class="sortable" onclick="handleEdit(' + showdata["id"] + ')"><i class="far fa-edit"></i></span>'
      // );
      // var deleteCell = $("<td></td>").html(
      //   '<span class="sortable" onclick="handleDelete(' + showdata["id"] + ')"><i class="far fa-trash-alt"></i></span>'
      // );
      if (statushow === "block") {
        // noCell.addClass("disabled-row");
        // fullNameCell.addClass("disabled-row");
        // shortNameCell.addClass("disabled-row");
        // emailCell.addClass("disabled-row");
        // walletCell.addClass("disabled-row");
        // winningCell.addClass("disabled-row");
        // statusCell.addClass("disabled-row");
        disableButton(noCell);
        disableButton(fullNameCell);
        disableButton(shortNameCell);
        disableButton(emailCell);
        disableButton(walletCell);
        disableButton(winningCell);
        disableButton(statusCell)
      }

      tr.append(noCell)
        .append(fullNameCell)
        .append(shortNameCell)
        .append(emailCell)
        // .append(walletCell)
        // .append(winningCell)
        .append(statusCell)
        .append(viewCell)
        // .append(deleteCell);
        
    
      

      $("table tbody").append(tr);
    }
    // lazyLoadImages(); // Call the lazy loading function after adding rows
  }

function toCapitalizeCase(str) {
  return str.replace(/\b\w/g, function(char) {
      return char.toUpperCase();
  });
}

async function handleView(id) {
  
  const url = `https://krinik.in/user_get/${id}/`;
  try {
    const response = await fetch(url);

    if (response.ok) {
      window.location.href = `user-kyc-view.html?id=${id}`;
    } else {
      console.error("Failed to fetch the league data");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


window.addEventListener('pageshow', function (event) {
  if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
      // Reload the page only once
      window.location.reload();
  }
});

fetchData();
