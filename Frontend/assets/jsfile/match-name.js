import {checkAdminAccess } from "../js/initial.js";
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
let totaldatamatch = document.querySelector("#total-match-data");
const urlParams = new URLSearchParams(window.location.search);
let id =Number(urlParams.get('id'));
let totalMoney = 0
let noOfWinners = 0;
// let addNewBtn = document.getElementById("addNewBtn");
async function fetchData() {
  try {
    const response = await fetch(`https://krinik.in/user_match_get/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response1 = await fetch(`https://krinik.in/match_get/${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const data1 = await response1.json();

      if (data && data.status === "success") {

        let userMatchData1 = data.data
       let  user_match_data = userMatchData1.filter((p) => p.match.id === id && p.user_data.status == "unblock" )
       console.log(user_match_data,"okk")
       let user_match_data1 = data1.data
       console.log(user_match_data1,"object")
       if(user_match_data){

         rankList = user_match_data;
         array = rankList; // Initialize array with fetched data
       }
        // totaldatamatch.innerHTML = array.length;
      
        console.log(array);
        displayIndexButtons();

        editPlayerData(user_match_data1,user_match_data)
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




function editPlayerData(user_match_data1, user_match_data = null) {
  const teamlogo1 = document.getElementById("teamlogo1");
  const teamlogo2 = document.getElementById("teamlogo2");
  const teamshortname1 = document.getElementById("teamshortname1");
  const teamshortname2 = document.getElementById("teamshortname2");
  const matchName = document.getElementById("match-name");
  const totWinnAmount = document.getElementById("totWinnAmount");
  const totWin = document.getElementById("totWin");

  let totalMoney = 0; // Default value
  let noOfWinners = 0; // Default value
console.log(user_match_data1,"ononon")
  // Check if user_match_data exists
  if (user_match_data) {
     totalMoney = user_match_data.reduce((accumulator, userMatch) => {
      // Check if the user is a winner
      if (userMatch.winning_status && userMatch.winning_status.toLowerCase() === "winner") {
        // Increment the number of winners
        noOfWinners++;
  
        // Add the winning amount to the total money
        return (userMatch.invest_amount * userMatch.multi_x) + accumulator;
      }
      // Return accumulator unchanged if not a winner
      return accumulator;
    }, 0);
  
    // totalMoney now holds the total investment amount for all winners
  }
  

  // Check if user_match_data1 exists
  if (user_match_data1) {
    // const match = user_match_data1.match || {};
    const teamA = user_match_data1.select_team_A || {};
    const teamB = user_match_data1.select_team_B || {};

    // Update image source and text content
    teamlogo1.src = teamA.team_image ? `https://krinik.in${teamA.team_image}` : "";
    teamlogo2.src = teamB.team_image ? `https://krinik.in${teamB.team_image}` : "";
    teamshortname1.textContent = teamA.team_short_name || "N/A";
    teamshortname2.textContent = teamB.team_short_name || "N/A";
    matchName.textContent = user_match_data1.match_display_name || "No Match Name";
    totWinnAmount.textContent = totalMoney || "0";
    totWin.textContent = noOfWinners || "0";

    console.log("Total Money:", totalMoney);
    console.log("Number of Winners:", noOfWinners);
  } else {
    console.error("Data is not in the expected format:", user_match_data1);
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
  // let picker = flatpickr("#rangePicker", {
  //   mode: "range",
  //   dateFormat: "d-m-Y",
  //   onClose: function (selectedDates, dateStr, instance) {
  //     if (!selectedDates || selectedDates.length === 0) {
  //       instance.clear();
  //       $("#rangePicker").text("Start & End Date").removeClass("has-dates");
  //       $("#clearDates").hide();
  //       $("#calendarIcon").show();
  //     } else {
  //       $("#rangePicker")
  //         .text(
  //           selectedDates
  //             .map((date) => instance.formatDate(date, "d-m-Y"))
  //             .join(" - ")
  //         )
  //         .addClass("has-dates");
  //       $("#clearDates").show();
  //       $("#calendarIcon").hide();
  //     }
  //     filterRankList();
  //   },
  //   clickOpens: false,
  //   allowInput: false,
  // });

  // $("#rangePicker, #calendarIcon").click(function () {
  //   if (!$("#rangePicker").hasClass("has-dates")) {
  //     picker.open();
  //   }
  // });

  // $("#clearDates").click(function () {
  //   picker.clear();
  //   $("#rangePicker").text("Start & End Date").removeClass("has-dates");
  //   $("#clearDates").hide();
  //   $("#calendarIcon").show();
  //   filterRankList();
  // });

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
      const status = getStatus(object.match_start_date, object.match_end_date);
      console.log(status);
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




function getStatus(start_date, match_end_status) {
  var currentDate = new Date(); // Get the current date and time
  var startDate = moment(start_date, "DD-MM-YYYY HH:mm:ss").toDate(); // Parse start date
  
  // Determine status
  if (currentDate < startDate) {
    return "Upcoming"; // Match hasn't started yet
  } 
  if (match_end_status.toLowerCase() === "completed") {
    return "Completed"; // Match is completed
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
      " users"
  );
  $(".index_buttons ul button").removeClass("active");
  $(".index_buttons ul button").each(function () {
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
 
  


  array.sort((a, b) => {
    // If both a and b are "winner" and have invest_amount, sort by invest_amount
    if (a.winning_status.toLowerCase() === "winner" && b.winning_status.toLowerCase() === "winner") {
      if (a.invest_amount && b.invest_amount) {
        return b.invest_amount - a.invest_amount; // Sort by invest_amount in descending order
      }
    }
    
    // If a is a "winner" and b is not, a should come first
    if (a.winning_status.toLowerCase() === "winner" && b.winning_status.toLowerCase() !== "winner") {
      return -1;
    }
    
    // If b is a "winner" and a is not, b should come first
    if (a.winning_status.toLowerCase() !== "winner" && b.winning_status.toLowerCase() === "winner") {
      return 1;
    }
  
    // If both are non-winners or no `invest_amount`, keep the original order
    return 0;
  });
  
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
    // var userId, participationCount;
   
    
    // Populate table cells with match data
    var noCell = $("<td></td>").text(i + 1);
    var imageCell = $("<td></td>").html(
      `<img src="https://krinik.in${object.user_data.image}" alt="User Image" style="width:50px; height:50px; border-radius:5px; border-radius:50%">`
    );
    var nameCell = $("<td colspan='3'></td>").text(object.user_data["name"]);
    var statusCell = $("<td colspan='2'></td>").text(toCapitalizeCase(object.winning_status));
    // var numberContestCell = $("<td colspan='2'></td>").text(participationCount);
    var poolNameCell = $("<td></td>").text(object.pool_name);
    var poolTypeCell = $("<td></td>").text(object.pool_type);
    var scoreCell = $("<td colspan='2'></td>").text(object.score);
    var investAmountCell = $("<td></td>").text(object.invest_amount);

    var multiXCell = $("<td colspan='2'></td>").text(object.multi_x);
    var betAmountCell = $("<td colspan='2'></td>").text(object.multi_x * object.invest_amount);
    var totalAmountCell = $("<td colspan='2'></td>").text(
      object.winning_status.toLowerCase() === "winner" ? object.total_amount : "--"
    );

    // console.log(statusCell.text());

   
    // Append cells to the row
    tr.append(noCell)
      .append(imageCell)
      // .append(totalPoolCell)
      .append(nameCell)
      .append(statusCell)
      .append(poolNameCell)
      .append(poolTypeCell)

      .append(scoreCell)
      .append(investAmountCell)
      .append(multiXCell)
      .append(betAmountCell)
      .append(totalAmountCell);

    // Append the row to the table body
    $("table tbody").append(tr);
  }
}

function toCapitalizeCase(str) {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
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

const table = document.getElementById('matchTable');
// const downloadBtn = document.getElementById('download-btn');

// downloadBtn.addEventListener('click', () => {
// const workbook = XLSX.utils.table_to_book(table, { sheet: 'Match Data' });
// const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
// const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
// const url = URL.createObjectURL(data);
// const a = document.createElement('a');
// a.href = url;
// a.download = 'Match_data.xlsx';
// a.click();

// URL.revokeObjectURL(url);
// a.remove();
// });

const downloadBtn = document.getElementById("download-btn");
downloadBtn.addEventListener("click", () => {
  const tempTable = document.createElement("table");
  tempTable.className = "table table-striped text-center align-items-center fixed-table";
  const header = `
    <thead>
      <tr>
        <th>No</th>
        <th>Image</th>
        <th colspan="3">Username</th>
        <th colspan="2">Status</th>
        <th>Pool Name</th>
        <th>Pool Type</th>
        <th colspan="2">Score</th>
        <th>Inv. Amt</th>
        <th>Multi X</th>
        <th colspan="2">Bet Amount</th>
        <th colspan="2">Won Amount</th>
      </tr>
    </thead>`;
  tempTable.innerHTML = header;

  const tbody = document.createElement("tbody");
  array.forEach((object, index) => {
    const totalAmount = object.winning_status.toLowerCase() === "winner" ? object.total_amount : "--";
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img src="https://krinik.in${object.user_data.image}" alt="User Image" style="width:50px; height:50px; border-radius:50%;"></td>
      <td colspan="3">${object.user_data.name}</td>
      <td colspan="2">${toCapitalizeCase(object.winning_status)}</td>
      <td>${object.pool_name}</td>
      <td>${object.pool_type}</td>
      <td colspan="2">${object.score}</td>
      <td>${object.invest_amount}</td>
      <td>${object.multi_x}</td>
      <td colspan="2">${object.multi_x * object.invest_amount}</td>
      <td colspan="2">${totalAmount}</td>
    `;
    tbody.appendChild(row);
  });

  tempTable.appendChild(tbody);
  const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "Match Data" });
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Match_data.xlsx";
  a.click();

  URL.revokeObjectURL(url);
  a.remove();
});




history.pushState(null, null, window.location.href);


history.pushState(null, null, window.location.href);
window.onload = checkAdminAccess();