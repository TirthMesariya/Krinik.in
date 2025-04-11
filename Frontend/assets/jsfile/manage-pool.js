import {getAdminType,createOTPModal,showDynamicAlert}  from "../js/initial.js"
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
let totaldatapool = document.querySelector("#total-pool-data");
const otpModalInstance = createOTPModal();


let addNewBtn = document.getElementById("addNewBtn")

function showOTP() {

    otpModalInstance.show()
    
}
const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";

addNewBtn.addEventListener("click",()=>{
  if (isSuperAdmin && isStatusTrue) {
    showOTP()

}else{
  window.location.href = "./add-pool.html"
}
})

async function fetchData() {
  try {
    const response = await fetch("https://krinik.in/add_pool_get/", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    //           const otpapi = await $.ajax({
    //           url: "https://krinik.in/send_otp_get/",
    //           method: "GET"
    //         });
    //         if (otpapi && otpapi.status === "success") {
    //     // Access the first item in the data array
    //     let otpApi1 = otpapi.data[0];

    //     // Get the phone_number from the first item
    //      otpApi = otpApi1.phone_number;
    //      otpApi2 = otpApi1.otp
    //     console.log(otpApi);
    // }

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "success") {
        rankList = data.data;
        array = rankList; // Initialize array with fetched data
        totaldatapool.innerHTML = array.length;
        console.log(array);
        displayIndexButtons();
      } else {
        console.error("Error: Invalid data format");
      }
    } else {
      console.error("Error fetching data", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
}
fetchData()


function preLoadCalculations() {
  array_length = array.length;
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
  $selectedStatus.on('click', function () {
    toggleDropdown();
  });

  // Click event for the arrow to toggle the dropdown
  $arrow.on('click', function () {
    toggleDropdown();
  });

  // Click event for selecting an item from the dropdown
  $dropdownContent3.on('click', 'a', function () {
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
  $clearStatus.on('click', function () {
    $selectedStatus.text('All Status').data('value', 'All Status');
    $arrow.show();
    $clearStatus.hide();
    $dropdownContent3.removeClass('show'); // Hide the dropdown content
    $dropdownBtn3.attr('aria-expanded', 'false'); // Ensure dropdown button is collapsed
    filterRankList(); // Filter with the reset status
  });

  // Click event for closing the dropdown if clicked outside
  $(document).on('click', function (event) {
    if (!$selectedStatus.is(event.target) && !$selectedStatus.has(event.target).length && !$dropdownContent3.has(event.target).length && !$arrow.is(event.target) && !$clearStatus.is(event.target)) {
      $dropdownContent3.removeClass('show');
      $dropdownBtn3.attr('aria-expanded', 'false');
    }
  });

  $('#tab_filter_text').on('input', filterRankList);

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

  // $('#tab_filter_text').on('input', function () {
  //   filterRankList();
  // });

  // $('#datefilter').on('apply.daterangepicker', function (ev, picker) {
  //   $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
  //   $('#clearDateBtn').show();
  //   filterRankList();
  // });

  // $('#datefilter').on('cancel.daterangepicker', function (ev, picker) {
  //   $(this).val('');
  //   $('#clearDateBtn').hide();
  //   filterRankList();
  // });

  // $('#clearDateBtn').click(function () {
  //   $('#datefilter').val('start & end date');
  //   $(this).hide();
  //   filterRankList();
  // });

  $('#statusDropdown').change(function () {
    filterRankList();
  });

  fetchData();
});

function filterRankList() {
  var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
  // var datefilter = $('#datefilter').val();
  var datefilter = $('#rangePicker').text().trim();
  const statusFilter = $("#selectedStatus").data('value') || '';
  var startDate, endDate;

  // if (datefilter !== '' && datefilter !== 'start & end date') {
  //     var dates = datefilter.split(' - ');
  //     startDate = parseDate(dates[0] + ' 00:00');
  //     endDate = parseDate(dates[1] + ' 23:59');
  // }
  if (datefilter !== '' && datefilter !== 'Start & End Date') {
    var dates = datefilter.split(' - ');
    startDate = moment(dates[0], 'DD-MM-YYYY').toDate();
    console.log(startDate)
    endDate = moment(dates[1], 'DD-MM-YYYY').toDate();
  }

  var filteredArray = rankList.filter(function (object) {
    var matchDisplayName = object.select_match.match_display_name;
    var parts = matchDisplayName.split(" ");
    var dateAndTime = parts.slice(-2).join(" ");
var canceled  = object.select_match.match_end_status === "canceled" ? "canceled" : "" 

    var matchesText = true, matchesStatus = true, matchesDate = true;

    if (tab_filter_text !== '') {
      matchesText = (object.pool_name && object.pool_name.toLowerCase().includes(tab_filter_text)) || (object.pool_type && object.pool_type.toLowerCase().includes(tab_filter_text)) ||
        (object.select_match.match_display_name && object.select_match.match_display_name.toLowerCase().includes(tab_filter_text));
    }


    // if (statusFilter !== '') {
    //   const status = getStatus(object.match_start_date, object.match_end_date);
    //   matchesStatus = (status.toLowerCase() === statusFilter);
    // }
    if (statusFilter !== 'All Status') {
      const status = getStatus(object.fantacy_start_date, dateAndTime,canceled);
      console.log(status)
      matchesStatus = (status === statusFilter);
      // console.log(matchesStatus ,"okli")
    }

    // if (datefilter !== '' && datefilter !== 'start & end date') {
    //     matchesDate = (parseDate(object.start_league_date) >= startDate && parseDate(object.end_league_date) <= endDate);
    // }
    if (startDate && endDate) {
      matchesDate = (moment(object.fantacy_start_date, 'DD-MM-YYYY').toDate() >= startDate &&
        moment(object.fantacy_start_date, 'DD-MM-YYYY').toDate() <= endDate);
    }

    return matchesText && matchesStatus && matchesDate;
  });

  array = filteredArray;
  current_index = 1;
  displayIndexButtons();
  displayTableRows(); // Add this line to refresh the table
}

function getStatus(start_date, end_date,canceled) {
  var currentDate = new Date();
  var startDate = moment(start_date, "DD-MM-YYYY HH:mm:ss").toDate();
  var endDate = moment(end_date, "DD-MM-YYYY HH:mm:ss").toDate();

  if(canceled === "canceled"){
    return "Canceled";
  }
  else if (startDate < currentDate && currentDate <= endDate) {
    return "Running";
  } else if (startDate < currentDate && endDate < currentDate) {
    return "Completed";
  } else if (startDate > currentDate && endDate > currentDate) {
    return "Upcoming";
  } else {
    return "unknown";
  }
}

// Function to get status based on start and end dates
// function getStatus(start_date, end_date) {
//   var currentDate = new Date();
//   var startDate = parseDate(start_date);
//   // var endDate = parseDate(end_date);
//   var endDate = end_date;


//   if (startDate < currentDate && currentDate <= endDate) {
//     return "Running";
//   } else if (startDate < currentDate && endDate < currentDate) {
//     return "Completed";
//   } else if (startDate > currentDate && endDate > currentDate) {
//     return "Upcoming";
//   } else {
//     return "Unknown";
//   }
// }
function parseDate(dateStr) {
  var parts = dateStr.split(/[- :]/);
  return new Date(parts[2], parts[1] - 1, parts[0], parts[3] || 0, parts[4] || 0);
}
window.parseDate = parseDate;
window.prev = prev;
window.next = next;
window.indexPagination = indexPagination;

window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.handleView = handleView;
function displayIndexButtons() {
  preLoadCalculations();
  $(".index_buttons ul").empty();

  // Check if the current page is not the first page
  if (current_index > 1) {
    $(".index_buttons ul").append('<button class="paginate_button page-item previous" onclick="prev()">Previous</button>');
  }

  // Display the first two pages
  $(".index_buttons ul").append('<button class="paginate_button page-item" onclick="indexPagination(1)" data-index="1">1</button>');
  if (max_index > 1) {
    $(".index_buttons ul").append('<button class="paginate_button page-item" onclick="indexPagination(2)" data-index="2">2</button>');
  }

  if (max_index > 3) {
    // Add ellipsis if there are pages between the second and the current page
    // if (current_index > 3) {
    //     $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    // }
    if (current_index > 3 && current_index < max_index - 2) {
      $(".index_buttons ul").append('<span class="ellipsis">...</span>');
      $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    } else if (current_index > 3) {
      $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    } else if (current_index < max_index - 2) {
      $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    }
    // Display the current page if it's not one of the first two pages or the last page
    if (current_index > 2 && current_index < max_index) {
      $(".index_buttons ul").append('<button class="paginate_button page-item" onclick="indexPagination(' + current_index + ')" data-index="' + current_index + '">' + current_index + '</button>');
    }

    // Add ellipsis if there are pages between the current page and the last page
    // if (current_index < max_index - 2) {
    //     $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    // }

    // Display the last page
    $(".index_buttons ul").append('<button class="paginate_button page-item" onclick="indexPagination(' + max_index + ')" data-index="' + max_index + '">' + max_index + '</button>');
  } else if (max_index == 3) {
    $(".index_buttons ul").append('<button class="paginate_button page-item" onclick="indexPagination(3)" data-index="3">3</button>');
  }

  // Check if the current page is not the last page
  if (current_index < max_index) {
    $(".index_buttons ul").append('<button class="paginate_button page-item next" onclick="next()">Next</button>');
  }

  highlightIndexButton();
}

function highlightIndexButton() {
  start_index = (current_index - 1) * table_size + 1;
  end_index = Math.min(start_index + table_size - 1, array_length);
  $("#datatable_info").text("Showing " + start_index + " to " + end_index + " of " + array_length + " pools");
  $(".index_buttons ul button").removeClass("active");
  $('.index_buttons ul button').each(function () {
    if ($(this).text() == current_index) {
      $(this).addClass("active");
    }
  });
  displayTableRows();
}

function displayTableRows() {
  // Clear existing table rows
  $("table tbody").empty();

  var tab_start = (current_index - 1) * table_size;
  var tab_end = Math.min(current_index * table_size, array.length);

  // Log the length of the array for debugging
  console.log("Array length:", array.length);

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
  console.log("Items to display:", array.slice(tab_start, tab_end));
  // Loop through the array and display rows
  array.slice(tab_start, tab_end).map((object, index) => {
    // console.log('Processing row:', index + tab_start);  // Debugging each row

    // Check if select_match is defined
    if (!object || !object.select_match) {
      console.warn("Skipping object with undefined select_match at index", index + tab_start);
      return;  // Skip this item and move to the next one
    }

    // Process the valid object
    var matchDisplayName = object?.select_match?.match_display_name || "N/A";
    var parts = matchDisplayName.split(" ");
    var dateAndTime = parts.slice(-2).join(" ");
    // console.log(dateAndTime);
var canceled  = object.select_match.match_end_status === "canceled" ? "canceled" : "" 

    var poolType = object?.pool_type || "Unknown";

    // Create table row
    var tr = $("<tr></tr>");

    // Populate table cells with match data
    var noCell = $("<td></td>").text(index + 1 + tab_start);
    var teamNameCell = $("<td colspan='4'></td>").text(`${poolType} - ${object.pool_name}`);
    var totalPoolCell = $("<td colspan='2'></td>").text(object.select_match.match_display_name);
    var fantacyStartCell = $("<td colspan='2'></td>").text(object.fantacy_start_date);
    var fantacyEndCell = $("<td colspan='2'></td>").text(dateAndTime);
    var totalAmountCell = $("<td colspan='3'></td>").text("Your Total Amount");
    var totalPlayersCell = $("<td></td>").text(object.select_match.select_player_A.length + object.select_match.select_player_B.length);
    var statusCell = $("<td colspan='2'></td>").text(getStatus(object.fantacy_start_date, dateAndTime,canceled));

    // Handle statusType
    var viewCell, editCell, deleteCell;

    
      viewCell = $("<td></td>").html(
        '<span class="sortable" onclick="handleView(' + object["id"] + ')"><i class="far fa-eye"></i></span>'
      );
      editCell = $("<td></td>").html(
        '<span class="sortable" onclick="handleEdit(' + object["id"] + ')"><i class="far fa-edit"></i></span>'
      );
      deleteCell = $("<td></td>").html(
        '<span class="sortable" onclick="handleDelete(' + object["id"] + ')"><i class="far fa-trash-alt"></i></span>'
      );

      if (statusCell.text() == "Completed" || statusCell.text() == "Canceled") {
        // Disable the edit button
        editCell.find("button").prop("disabled", true);
  
        // Apply dull background and reduced opacity
        [
          noCell,
          teamNameCell,
          totalPoolCell,
          fantacyStartCell,
          totalAmountCell,
          totalPlayersCell,
          statusCell,
          editCell,
        ].forEach(function (cell) {
          cell.css({
            "pointer-events": "none",
            "background-color": "#f0f0f0", // Light gray background
            color: "#999", // Dull text color
            opacity: "1", // Make it slightly transparent
          });
        });
      } else {
        [
          noCell,
          teamNameCell,
          totalPoolCell,
          fantacyStartCell,
          totalAmountCell,
          totalPlayersCell,
          statusCell,
          editCell,
          deleteCell,
          viewCell,
        ].forEach(function (cell) {
          cell.css({
            // "pointer-events": "none",
            // Light gray background
            color: "black", // Dull text color
            // Make it slightly transparent
          });
        });
      }
    

    // Append cells to the row
    tr.append(noCell)
      .append(teamNameCell)
      .append(totalPoolCell)
      .append(fantacyStartCell)
      .append(fantacyEndCell)
      // .append(totalAmountCell)
      .append(totalPlayersCell)
      .append(statusCell)
      .append(viewCell)
      .append(editCell)
      .append(deleteCell);

    return tr;  // Return the table row
  }).forEach(tr => {
    // Append each generated table row to the table body
    $("table tbody").append(tr);
  });
}

async function handleDelete(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()


  } else {
    if (confirm("Are you sure you want to delete this match?")) {

      const url = `https://krinik.in/add_pool_get/pool_id/${id}/`;
      try {
        const response = await fetch(url, {
          method: "DELETE",
        });

        if (response.ok) {
          // Fetch the updated list of leagues after deletion
          showDynamicAlert("Pool Deleted Successfully !!")
          await fetchData();
        } else {
          console.error("Failed to delete the league");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }

  }
}


async function handleView(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()


  } else {
    const url = `https://krinik.in/add_pool_get/pool_id/${id}/`;
    try {
      const response = await fetch(url);

      if (response.ok) {
        window.location.href = `view-pool-details.html?id=${id}`;
      } else {
        console.error("Failed to fetch the league data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

async function handleEdit(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()


  } else {
    const url = `https://krinik.in/add_pool_get/pool_id/${id}/`;
    try {
      const response = await fetch(url);

      if (response.ok) {
        window.location.href = `edit-pool.html?id=${id}`;
      } else {
        console.error("Failed to fetch the league data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

function prev() {
  if (current_index > 1) {
    current_index--;
    displayIndexButtons();
    // Add logic to display the previous page of items
    highlightIndexButton();
  }
}

function next() {
  if (current_index < max_index) {
    current_index++;
    displayIndexButtons();
    // Add logic to display the next page of items
    highlightIndexButton();
  }
}

function indexPagination(index) {
  current_index = index;
  displayIndexButtons();
  highlightIndexButton();
}

// Get the table element
const table = document.getElementById('matchTable');
const downloadBtn = document.getElementById('download-btn');

// downloadBtn.addEventListener('click', () => {
//   const workbook = XLSX.utils.table_to_book(table, { sheet: 'Pool Data' });
//   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//   const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   const url = URL.createObjectURL(data);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'pool_data.xlsx';
//   a.click();

//   URL.revokeObjectURL(url);
//   a.remove();
// });


downloadBtn.addEventListener('click', () => {
  // Ensure the full data array is used, not just the paginated display
  if (array.length === 0) {
      alert("No data available to download.");
      return;
  }

  // Create a new table element dynamically in memory
  const tempTable = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Add the table header
  const headerRow = `
      <tr>
          <th>No.</th>
          <th>Pool Name</th>
          <th>Team vs Team</th>
          <th>Fantasy Start</th>
          <th>Fantasy End</th>
          <th>Total Players</th>
          <th>Status</th>
      </tr>`;
  thead.innerHTML = headerRow;

  // Add table rows from the full data array
  array.forEach((object, index) => {
      // Extract values
      const poolType = object?.pool_type || "Unknown";
      const poolName = `${poolType} - ${object.pool_name || "N/A"}`;
      const teamVsTeam = object.select_match?.match_display_name || "N/A";
      const fantasyStart = object.fantacy_start_date || "N/A";

      const matchDisplayName = object?.select_match?.match_display_name || "N/A";
      const parts = matchDisplayName.split(" ");
      const fantasyEnd = parts.slice(-2).join(" "); // Extract fantasy end date & time

      const totalPlayers = (object?.select_match?.select_player_A?.length || 0) +
                           (object?.select_match?.select_player_B?.length || 0);
      const status = getStatus(object.fantacy_start_date, fantasyEnd, object.select_match?.match_end_status);

      // Create table row
      const row = `
          <tr>
              <td>${index + 1}</td>
              <td>${poolName}</td>
              <td>${teamVsTeam}</td>
              <td>${fantasyStart}</td>
              <td>${fantasyEnd}</td>
              <td>${totalPlayers}</td>
              <td>${status}</td>
          </tr>`;
      tbody.innerHTML += row;
  });

  // Append the thead and tbody to the tempTable
  tempTable.appendChild(thead);
  tempTable.appendChild(tbody);

  // Use XLSX to export the complete table with some formatting
  const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "Pool Data" });

  // Apply some basic formatting
  const sheet = workbook.Sheets['Pool Data'];

  // Adjust column widths for better readability
  sheet['!cols'] = [
      { wch: 5 },   // No.
      { wch: 25 },  // Pool Name
      { wch: 30 },  // Team vs Team
      { wch: 20 },  // Fantasy Start
      { wch: 20 },  // Fantasy End
      { wch: 15 },  // Total Players
      { wch: 15 }   // Status
  ];

  // Export as an Excel file
  XLSX.writeFile(workbook, "pool_data.xlsx");
});

history.pushState(null, null, window.location.href);
