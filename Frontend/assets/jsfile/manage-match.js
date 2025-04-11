import { getAdminType, createOTPModal, showDynamicAlert } from "../js/initial.js";
import { refreshpage } from "./pagerefresh.js";
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
let totaldatamatch = document.querySelector("#total-match-data");
const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";
const otpModalInstance = createOTPModal();
let matchendDate

let addNewBtn = document.getElementById("addNewBtn");
async function fetchData() {
  try {
    const response = await fetch("https://krinik.in/match_get/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "success") {
        rankList = data.data;
        array = rankList; // Initialize array with fetched data
        totaldatamatch.innerHTML = array.length;
      
        console.log(array);
        displayIndexButtons();

      
      } else {
        console.error("Error: Invalid data format");
      }
    } else {
      console.error("Error fetching data", response.statusText);
    }
    // const responseurl = await fetch("https://krinik.in/pool_declare/", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // // const responseurl = await fetch(url1);
    // const urlpool = await responseurl.json();
    // const urlpooldata = urlpool.data;
    // if(urlpooldata){
    //   matchendDate = urlpooldata
    // }
// console.log(urlpooldata,"okl")
  } catch (error) {
    console.error("Error fetching data", error);
  }
}

function preLoadCalculations() {
  array_length = array.length;
  max_index = Math.ceil(array_length / table_size);
}

$(document).ready(function () {
  const $dropdownBtn3 = $("#dropdownBtn3");
  const $dropdownContent3 = $("#dropdownContent3");
  const $selectedStatus = $("#selectedStatus");
  const $arrow = $("#arrowBar"); // Ensure this selector matches your HTML
  const $clearStatus = $("#clearStatus");

  function toggleDropdown() {
    const isExpanded = $dropdownContent3.toggleClass("show").hasClass("show");
    $dropdownBtn3.attr("aria-expanded", isExpanded);
  }

  // Click event for the selected status element to toggle the dropdown
  $selectedStatus.on("click", function () {
    toggleDropdown();
  });

  // Click event for the arrow to toggle the dropdown
  $arrow.on("click", function () {
    toggleDropdown();
  });

  // Click event for selecting an item from the dropdown
  $dropdownContent3.on("click", "a", function () {
    const selectedValue = $(this).data("value");
    $selectedStatus.text(selectedValue).data("value", selectedValue);
    $dropdownContent3.removeClass("show");

    if (selectedValue === "All Status") {
      $arrow.show();
      $clearStatus.hide();
    } else {
      $arrow.hide();
      $clearStatus.show();
    }
    filterRankList(); // Filter based on the selected status
  });

  // Click event for clearing the selected status
  $clearStatus.on("click", function () {
    $selectedStatus.text("All Status").data("value", "All Status");
    $arrow.show();
    $clearStatus.hide();
    $dropdownContent3.removeClass("show"); // Hide the dropdown content
    $dropdownBtn3.attr("aria-expanded", "false"); // Ensure dropdown button is collapsed
    filterRankList(); // Filter with the reset status
  });

  // Click event for closing the dropdown if clicked outside
  $(document).on("click", function (event) {
    if (
      !$selectedStatus.is(event.target) &&
      !$selectedStatus.has(event.target).length &&
      !$dropdownContent3.has(event.target).length &&
      !$arrow.is(event.target) &&
      !$clearStatus.is(event.target)
    ) {
      $dropdownContent3.removeClass("show");
      $dropdownBtn3.attr("aria-expanded", "false");
    }
  });

  // $('#tab_filter_text').on('input', function () {
  //     filterRankList();
  // });

  // $('#datefilter').on('apply.daterangepicker', function (ev, picker) {
  //     $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
  //     $('#clearDateBtn').show();
  //     filterRankList();
  // });

  // $('#datefilter').on('cancel.daterangepicker', function (ev, picker) {
  //     $(this).val('');
  //     $('#clearDateBtn').hide();
  //     filterRankList();
  // });

  // $('#clearDateBtn').click(function () {
  //     $('#datefilter').val('start & end date');
  //     $(this).hide();
  //     filterRankList();
  // });
  $("#tab_filter_text").on("input", filterRankList);
  let picker = flatpickr("#rangePicker", {
    mode: "range",
    dateFormat: "d-m-Y",
    onClose: function (selectedDates, dateStr, instance) {
      if (!selectedDates || selectedDates.length === 0) {
        instance.clear();
        $("#rangePicker").text("Start & End Date").removeClass("has-dates");
        $("#clearDates").hide();
        $("#calendarIcon").show();
      } else {
        $("#rangePicker")
          .text(
            selectedDates
              .map((date) => instance.formatDate(date, "d-m-Y"))
              .join(" - ")
          )
          .addClass("has-dates");
        $("#clearDates").show();
        $("#calendarIcon").hide();
      }
      filterRankList();
    },
    clickOpens: false,
    allowInput: false,
  });

  $("#rangePicker, #calendarIcon").click(function () {
    if (!$("#rangePicker").hasClass("has-dates")) {
      picker.open();
    }
  });

  $("#clearDates").click(function () {
    picker.clear();
    $("#rangePicker").text("Start & End Date").removeClass("has-dates");
    $("#clearDates").hide();
    $("#calendarIcon").show();
    filterRankList();
  });

  $("#statusDropdown").change(function () {
    filterRankList();
  });

  fetchData();
});

function filterRankList() {
  var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
  // var datefilter = $('#datefilter').val();
  var datefilter = $("#rangePicker").text().trim();
  const statusFilter = $("#selectedStatus").data("value") || "";
  var startDate, endDate;

  // if (datefilter !== '' && datefilter !== 'start & end date') {
  //     var dates = datefilter.split(' - ');
  //     startDate = parseDate(dates[0] + ' 00:00');
  //     endDate = parseDate(dates[1] + ' 23:59');
  // }
  if (datefilter !== "" && datefilter !== "Start & End Date") {
    var dates = datefilter.split(" - ");
    startDate = moment(dates[0], "DD-MM-YYYY").toDate();
    console.log(startDate);
    endDate = moment(dates[1], "DD-MM-YYYY").toDate();
  }

  var filteredArray = rankList.filter(function (object) {
    var matchesText = true,
      matchesStatus = true,
      matchesDate = true;

    if (tab_filter_text !== "") {
      matchesText =
        object.match_display_name &&
        object.match_display_name.toLowerCase().includes(tab_filter_text);
    }

    // if (statusFilter !== '') {
    //     const status = getStatus(object.match_start_date, object.match_end_date);
    //     matchesStatus = (status.toLowerCase() === statusFilter);
    // }
    if (statusFilter !== "All Status") {
      const status = getStatus(object.match_start_date, object.match_end_status);
      console.log(status,"ok");
      matchesStatus = status === statusFilter;
      // console.log(matchesStatus ,"okli")
    }
    // if (datefilter !== '' && datefilter !== 'start & end date') {
    //     matchesDate = (parseDate(object.start_league_date) >= startDate && parseDate(object.end_league_date) <= endDate);
    // }

    if (startDate && endDate) {
      matchesDate =
        moment(object.match_start_date, "DD-MM-YYYY").toDate() >= startDate &&
        moment(object.match_start_date, "DD-MM-YYYY").toDate() <= endDate;
    }

    return matchesText && matchesStatus && matchesDate;
  });

  array = filteredArray;
  current_index = 1;
  displayIndexButtons();
  displayTableRows(); // Add this line to refresh the table
}

function showOTP() {
  otpModalInstance.show();
}

// Function to get status based on start and end dates
//       function getStatus(start_date, end_date) {
//     var currentDate = new Date();
//     var startDate = parseDate(start_date);
//     var endDate = parseDate(end_date);

//     if (startDate < currentDate && currentDate <= endDate) {
//         return "Running";
//     } else if (startDate < currentDate && endDate < currentDate) {
//         return "Completed";
//     } else if (startDate > currentDate && endDate > currentDate) {
//         return "Upcoming";
//     } else {
//         return "Unknown";
//     }
// }
function getStatus(start_date, match_end_status) {
  var currentDate = new Date(); // Get the current date and time
  var startDate = moment(start_date, "DD-MM-YYYY HH:mm:ss").toDate(); // Parse start date
  
  // Determine status
  if (match_end_status.toLowerCase() === "canceled") {
    return "Canceled"; // Match is currently running
  } 
  if (match_end_status.toLowerCase() === "completed") {
    return "Completed"; // Match is completed
  } 
  if (currentDate < startDate) {
    return "Upcoming"; // Match hasn't started yet
  } 
  if (match_end_status.toLowerCase() === "live") {
    return "Running"; // Match is currently running
  } 
  
  // Default fallback
  return "Unknown"; 
}



window.prev = prev;
window.next = next;
window.indexPagination = indexPagination;
window.parseDate = parseDate;

function parseDate(dateStr) {
  var parts = dateStr.split(/[- :]/);
  return new Date(
    parts[2],
    parts[1] - 1,
    parts[0],
    parts[3] || 0,
    parts[4] || 0
  );
}
function displayIndexButtons() {
  preLoadCalculations();
  $(".index_buttons ul").empty();

  // Check if the current page is not the first page
  if (current_index > 1) {
    $(".index_buttons ul").append(
      '<button class="paginate_button page-item previous" onclick="prev()">Previous</button>'
    );
  }

  // Display the first two pages
  $(".index_buttons ul").append(
    '<button class="paginate_button page-item" onclick="indexPagination(1)" data-index="1">1</button>'
  );
  if (max_index > 1) {
    $(".index_buttons ul").append(
      '<button class="paginate_button page-item" onclick="indexPagination(2)" data-index="2">2</button>'
    );
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
      $(".index_buttons ul").append(
        '<button class="paginate_button page-item" onclick="indexPagination(' +
          current_index +
          ')" data-index="' +
          current_index +
          '">' +
          current_index +
          "</button>"
      );
    }

    // Add ellipsis if there are pages between the current page and the last page
    // if (current_index < max_index - 2) {
    //     $(".index_buttons ul").append('<span class="ellipsis">...</span>');
    // }

    // Display the last page
    $(".index_buttons ul").append(
      '<button class="paginate_button page-item" onclick="indexPagination(' +
        max_index +
        ')" data-index="' +
        max_index +
        '">' +
        max_index +
        "</button>"
    );
  } else if (max_index == 3) {
    $(".index_buttons ul").append(
      '<button class="paginate_button page-item" onclick="indexPagination(3)" data-index="3">3</button>'
    );
  }

  // Check if the current page is not the last page
  if (current_index < max_index) {
    $(".index_buttons ul").append(
      '<button class="paginate_button page-item next" onclick="next()">Next</button>'
    );
  }

  highlightIndexButton();
}

function highlightIndexButton() {
  start_index = (current_index - 1) * table_size + 1;
  end_index = Math.min(start_index + table_size - 1, array_length);
  $("#datatable_info").text(
    "Showing " +
      start_index +
      " to " +
      end_index +
      " of " +
      array_length +
      " matches"
  );
  $(".index_buttons ul button").removeClass("active");
  $(".index_buttons ul button").each(function () {
    if ($(this).text() == current_index) {
      $(this).addClass("active");
    }
  });
  displayTableRows();
}

addNewBtn.addEventListener("click", () => {
  if (isSuperAdmin && isStatusTrue) {
    showOTP();
  } else {
    window.location.href = "./add-match.html";
  }
});

function displayTableRows() {
  // Clear existing table rows
  $("table tbody").empty();
  var tab_start = (current_index - 1) * table_size;
  var tab_end = Math.min(current_index * table_size, array.length);

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
    var object = array[i];
    var tr = $("<tr></tr>");
    var match_end_date = object.match_end_status
    console.log(match_end_date)
    // Populate table cells with match data
    var noCell = $("<td></td>").text(i + 1);
    var teamNameCell = $("<td colspan='3'></td>").text(
      object.match_display_name
    );
    var totalPoolCell = $("<td colspan='2'></td>").text("Your Total Pool");
    var fantacyStartCell = $("<td colspan='2'></td>").text(
      object.match_start_date
    );
    // var fantacyEndCell = $("<td colspan='2'></td>").text(object.match_end_date);
    var totalAmountCell = $("<td colspan='3'></td>").text("Your Total Amount");
    var totalPlayersCell = $("<td></td>").text(
      object.select_player_A.length + object.select_player_B.length
    );
    var statusCell = $("<td colspan='2'></td>").text(
      getStatus(object.match_start_date,match_end_date)
    );
    console.log(statusCell.text());

    // var statusCell = "completed"

    var viewCell = $("<td></td>").html(
      '<span class="sortable" onclick="handleView(' +
        object["id"] +
        ')"><i class="far fa-eye"></i></span>'
    );
    var editCell = $("<td></td>").html(
      '<span class="sortable" onclick="handleEdit(' +
        object["id"] +
        ')"><i class="far fa-edit"></i></span>'
    );
    var deleteCell = $("<td></td>").html(
      '<span class="sortable" onclick="handleDelete(' +
        object["id"] +
        ')"><i class="far fa-trash-alt"></i></span>'
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
      // .append(totalPoolCell)
      .append(fantacyStartCell)
      // .append(fantacyEndCell)
      // .append(totalAmountCell)
      .append(totalPlayersCell)
      .append(statusCell)
      .append(viewCell)
      .append(editCell)
      .append(deleteCell);

    // Append the row to the table body
    $("table tbody").append(tr);
  }
}

async function handleDelete(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP();
  } else {
   
    if (confirm("Are you sure you want to delete this match? after deleting a match, the user's game history and transaction history related to the match will also be deleted !!")) {
      const url = `https://krinik.in/match_get/${id}/`;
      try {
        const response = await fetch(url, {
          method: "DELETE",
        });

        if (response.ok) {
          // Fetch the updated list of leagues after deletion
          showDynamicAlert("Match Deleted Successfully !!")

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
    showOTP();
  } else {
    const url = `https://krinik.in/match_get/${id}/`;
    try {
      const response = await fetch(url);

      if (response.ok) {
        window.location.href = `view-match-details.html?id=${id}`;
      } else {
        console.error("Failed to fetch the league data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.handleView = handleView;
async function handleEdit(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP();
  } else {
    const url = `https://krinik.in/match_get/${id}/`;
    try {
      const response = await fetch(url);

      if (response.ok) {
        window.location.href = `edit-match.html?id=${id}`;
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

// const table = document.getElementById("matchTable");
// const downloadBtn = document.getElementById("download-btn");

// downloadBtn.addEventListener("click", () => {
//   const workbook = XLSX.utils.table_to_book(table, { sheet: "Match Data" });
//   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//   const data = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = URL.createObjectURL(data);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "match_data.xlsx";
//   a.click();

//   URL.revokeObjectURL(url);
//   a.remove();
// });

const table = document.getElementById("matchTable");
const downloadBtn = document.getElementById("download-btn");

downloadBtn.addEventListener("click", () => {
  // Prepare the data for Excel
  const excelData = array.map((object, index) => {
    const matchDetails = object.match_display_name || "N/A"; // Fallback for missing match names
    const totalPlayers =
      (object.select_player_A?.length || 0) + (object.select_player_B?.length || 0); // Safe calculation of total players
    const status = getStatus(object.match_start_date, object.match_end_status); // Get match status
    const fantasyStart = object.match_start_date || "N/A"; // Fallback for missing dates

    // Return structured data for each row
    return {
      No: index + 1,                        // Row number
      "Match Name": matchDetails,           // Match display name
      "Fantasy Start": fantasyStart,        // Match start date
      "Total Players": totalPlayers,        // Total players
      Status: status || "Unknown",          // Match status
    };
  });

  // Create a worksheet from the JSON data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Adjust column widths for better spacing
  const columnWidths = [
    { wpx: 50 },  // No (narrow column)
    { wpx: 250 }, // Match Name (wide column for full names)
    { wpx: 150 }, // Fantasy Start (medium column for date/time)
    { wpx: 100 }, // Total Players (narrow column)
    { wpx: 150 }, // Status (medium column)
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





history.pushState(null, null, window.location.href);
refreshpage()

