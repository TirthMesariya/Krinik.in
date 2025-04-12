
import {getAdminType,createOTPModal,showDynamicAlert}  from "../js/initial.js"
import {refreshpage,showLoader,hideLoader} from "./pagerefresh.js"
// Firebase Configuration
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyBMIXxBISZnryQeOgKRs73TqVRXkshd0KM",
//     authDomain: "krinkin-309ee.firebaseapp.com",
//     projectId: "krinkin-309ee",
//     storageBucket: "krinkin-309ee.appspot.com",
//     messagingSenderId: "397386970252",
//     appId: "1:397386970252:web:9655f412b4280a036d77a9"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// const otpModalInstance = createOTPModal(auth, RecaptchaVerifier, signInWithPhoneNumber);
const otpModalInstance = createOTPModal();


let addNewBtn = document.getElementById("addNewBtn")

function showOTP() {

    otpModalInstance.show()
    
}
    // const otpModalInstance = createOTPModal();
var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
// var otpApi 
// var otpApi2 
const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";

let totaldataleague = document.querySelector("#total-league-data");
// let otpAdd = document.querySelector("#add-new-btn");
async function fetchData() {
  try {
    const data = await $.ajax({
      url: "https://krinik.in/league_get/",
      method: "GET"
    });
  

    if (data && data.status === "success") {
      rankList = data.data;
      console.log(rankList)
      array = rankList;
      filterAndDisplay();
      totaldataleague.innerHTML = array.length;
    } else {
      console.error("Error: Invalid data format");
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
}

// async function postPhoneNumber() {
// try {
// const response = await $.ajax({
//   url: "https://krinik.in/send_otp_get/", // Change this to your POST endpoint
//   method: "POST",
//   contentType: "application/json",
//   data: JSON.stringify({ phone_number: "7801804996"})
// });

// if (response ) {
//   console.log("Phone number posted successfully");
// } else {
//   console.error("Failed to post phone number", response);
// }
// } catch (error) {
// console.error("Error posting phone number:", error);
// }
// }

// async function phoneNumber() {
// try {
// const otpapi = await $.ajax({
//       url: "https://krinik.in/send_otp_get/",
//       method: "GET"
//     });

 
//     if (otpapi && otpapi.status === "success") {
// // Access the first item in the data array
// let otpApi1 = otpapi.data[0];

// // Get the phone_number from the first item
//  otpApi = otpApi1.phone_number;
//  otpApi2 = otpApi1.otp
// console.log(otpApi);

//   console.log("Phone number posted successfully");
// } else {
//   console.error("Failed to post phone number", response);
// }
// } catch (error) {
// console.error("Error posting phone number:", error);
// }
// }

// console.log(otpApi)

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

  $('#statusDropdown').change(filterRankList);
  fetchData();
});

function filterRankList() {
    var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
    var datefilter = $('#rangePicker').text().trim();
    const statusFilter = $("#selectedStatus").data('value') || '';
    var startDate, endDate;

    if (datefilter !== '' && datefilter !== 'Start & End Date') {
        var dates = datefilter.split(' - ');
        startDate = moment(dates[0], 'DD-MM-YYYY').toDate();
        console.log(startDate)
        endDate = moment(dates[1], 'DD-MM-YYYY').toDate();
    }

    var filteredArray = rankList.filter(function (object) {
        var matchesText = true, matchesStatus = true, matchesDate = true;

        if (tab_filter_text !== '') {
            matchesText = (object.league_name && object.league_name.toLowerCase().includes(tab_filter_text)) ||
                (object.short_league_name && object.short_league_name.toLowerCase().includes(tab_filter_text)) ||
                (object.start_league_date && object.start_league_date.toLowerCase().includes(tab_filter_text)) ||
                (object.end_league_date && object.end_league_date.toLowerCase().includes(tab_filter_text));
        }

        // if (statusFilter !== '') {
        //     const status = getStatus(object.start_league_date, object.end_league_date);
        //     matchesStatus = (status === statusFilter);
        // }
        if (statusFilter !== 'All Status') {
          const status = getStatus(object.start_league_date, object.end_league_date)
    console.log(status)
    matchesStatus = (status === statusFilter);
    // console.log(matchesStatus ,"okli")
  }

        if (startDate && endDate) {
            matchesDate = (moment(object.start_league_date, 'DD-MM-YYYY').toDate() >= startDate &&
                moment(object.end_league_date, 'DD-MM-YYYY').toDate() <= endDate);
        }

        return matchesText && matchesStatus && matchesDate;
    });

    array = filteredArray;
    preLoadCalculations();
    current_index = 1;
    displayIndexButtons();
    highlightIndexButton()
    displayTableRows();
}
function getStatus(start_date, end_date) {
  var currentDate = new Date();
  var startDate = moment(start_date, "DD-MM-YYYY HH:mm:ss").toDate();
  var endDate = moment(end_date, "DD-MM-YYYY HH:mm:ss").toDate();

  if (startDate < currentDate && currentDate <= endDate) {
    return "Running";
  } else if (startDate < currentDate && endDate < currentDate) {
    return "Completed";
  } else if (startDate > currentDate && endDate > currentDate) {
    return "Upcoming";
  } else {
    return "unknown";
  }
}
addNewBtn.addEventListener("click",()=>{
  if (isSuperAdmin && isStatusTrue) {
    showOTP()

}else{
  // if (typeof refreshpage === "function") {
    setTimeout(() => {
        showLoader(); // Show the loader with a delay (optional)
    }, 100);

    // Perform the redirect and handle loader visibility
    Promise.resolve()
        .then(() => {
  window.location.href = "./addleague.html"

            // window.location.href = "./addscratch.html"; // Redirect to the new page
            // window.location.href = `view-team-details.html?scratchId=${encodeURIComponent(teamName)}`;
        })
        .then(() => {
            hideLoader(); // Hide the loader after the redirect
        })
        .catch((err) => {
            console.error("An error occurred during the redirect:", err);
            hideLoader(); // Ensure loader hides if an error occurs
        });
// } else {
//     console.error("No redirect function provided.");
    hideLoader(); // Ensure loader hides if no redirect function is provided
// }


}
})

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
    $("#datatable_info").text("Showing " + start_index + " to " + end_index + " of " + array_length + " leagues");
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
window.prev = prev;
window.next = next;
window.indexPagination = indexPagination;

const columnWidths = [
  "5%",   // Column for serial number
  "15%",  // Column for full league name
  "15%",  // Column for short league name
  "10%",  // Column for logo
  "15%",  // Column for dates
  "8%",  // Column for status
  "5%",   // Column for view action
  "5%",   // Column for edit action
  "5%"    // Column for delete action
];

function displayTableRows() {
  $("table tbody").empty();
  var tab_start = start_index - 1;
  var tab_end = end_index;

  if (array.length === 0) {
      $("#noDataFound").show();
      $("#pagination").hide();
      return;
  } else {
      $("#noDataFound").hide();
      $("#pagination").show();
  }

  for (var i = tab_start; i < tab_end; i++) {
      var showdata = array[i];
      var status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);

      var tr = $("<tr></tr>");
      var noCell = $("<td></td>").text(i + 1).css("width", columnWidths[0]);
      var fullNameCell = $("<td></td>").text(showdata["league_name"] || "").css("width", columnWidths[1]);
      var shortNameCell = $("<td></td>").text(showdata["short_league_name"] || "").css("width", columnWidths[2]);

      var logoCell = $("<td></td>").html(
          showdata["league_image"]
              ? `<img src="https://krinik.in${showdata["league_image"]}" alt="" class="team-logo" />`
              : ""
      ).css("width", columnWidths[3]);

      var dateCell = $("<td></td>").text(
          (showdata["start_league_date"] || "") +
          " - " +
          (showdata["end_league_date"] || "")
      ).css("width", columnWidths[4]);

      var statusCell = $("<td></td>").text(status).css("width", columnWidths[5]);

      var viewCell = $("<td></td>").html(
          `<span onclick="viewLeagueDetails('${showdata["league_name"]}')"><i class="far fa-eye"></i></span>`
      ).css("width", columnWidths[6]);

      var editCell = $("<td></td>").html(
          `<span class="otp-exempt3" onclick="handleEdit(${showdata["id"]})"><i class="far fa-edit"></i></span>`
      ).css("width", columnWidths[7]);

      var deleteCell = $("<td></td>").html(
          `<span onclick="handleDelete(${showdata["id"]})"><i class="far fa-trash-alt"></i></span>`
      ).css("width", columnWidths[8]);

      tr.append(noCell)
        .append(fullNameCell)
        .append(shortNameCell)
        .append(logoCell)
        .append(dateCell)
        .append(statusCell)
        .append(viewCell)
        .append(editCell)
        .append(deleteCell);

      $("table tbody").append(tr);
  }
}





async function handleDelete(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()

}else{

  // if (typeof refreshpage === "function") {
    // setTimeout(() => {
        // Show the loader with a delay (optional)
    // }, 100);

    // Perform the redirect and handle loader visibility
    Promise.resolve()
        .then(async() => {
          if (confirm('Are you sure you want to delete this league?')) {
            showLoader();
            const url = `https://krinik.in/league_get/${id}/`;
            try {
              const response = await fetch(url, { method: "DELETE" });
        
              if (response.ok) {
                showDynamicAlert("League Deleted Successfully !!")
                await fetchData();
              } else {
                console.error("Failed to delete the league");
              }
            } catch (error) {
              console.error("Error deleting data:", error);
            }
            hideLoader();
          }

            // window.location.href = "./addscratch.html"; // Redirect to the new page
            // window.location.href = `view-team-details.html?scratchId=${encodeURIComponent(teamName)}`;
        })
        .then(() => {
            hideLoader(); // Hide the loader after the redirect
        })
        .catch((err) => {
            console.error("An error occurred during the redirect:", err);
            hideLoader(); // Ensure loader hides if an error occurs
        });
// } else {
//     console.error("No redirect function provided.");
    // Ensure loader hides if no redirect function is provided
// }

  
}
}
function viewLeagueDetails(leagueName) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()

}else{
  // if (typeof refreshpage === "function") {
    setTimeout(() => {
        showLoader(); // Show the loader with a delay (optional)
    }, 100);

    // Perform the redirect and handle loader visibility
    Promise.resolve()
        .then(() => {
  // Encode league name for URL
var encodedLeagueName = encodeURIComponent(leagueName);
// Redirect to view league details page with league name as query parameter
window.location.href = 'view-league-details.html?leagueName=' + encodedLeagueName;

            // window.location.href = "./addscratch.html"; // Redirect to the new page
            // window.location.href = `view-team-details.html?scratchId=${encodeURIComponent(teamName)}`;
        })
        .then(() => {
            hideLoader(); // Hide the loader after the redirect
        })
        .catch((err) => {
            console.error("An error occurred during the redirect:", err);
            hideLoader(); // Ensure loader hides if an error occurs
        });
// } else {
//     console.error("No redirect function provided.");
    hideLoader(); // Ensure loader hides if no redirect function is provided
// }



}
}

async function handleEdit(id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()
  } else {
    // if (typeof refreshpage === "function") {
      setTimeout(() => {
          showLoader(); // Show the loader with a delay (optional)
      }, 100);
  
      // Perform the redirect and handle loader visibility
      Promise.resolve()
          .then(async() => {
            const url = `https://krinik.in/league_get/${id}/`;
            try {
              const response = await fetch(url);
        
              if (response.ok) {
                window.location.href = `editleague.html?id=${id}`;
               
              } else {
                console.error("Failed to fetch the league data");
              }
            } catch (error) {
              console.error("Error fetching data:", error);
            }
  
              // window.location.href = "./addscratch.html"; // Redirect to the new page
              // window.location.href = `view-team-details.html?scratchId=${encodeURIComponent(teamName)}`;
          })
          .then(() => {
              hideLoader(); // Hide the loader after the redirect
          })
          .catch((err) => {
              console.error("An error occurred during the redirect:", err);
              hideLoader(); // Ensure loader hides if an error occurs
          });
  // } else {
  //     console.error("No redirect function provided.");
      hideLoader(); // Ensure loader hides if no redirect function is provided
  // }


   
  }
}

// Make handleEdit accessible in the global scope
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.viewLeagueDetails = viewLeagueDetails;

const table = document.getElementById('tech-companies-1');
const downloadBtn = document.getElementById('download-btn');

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
            <th>League Full Name</th>
            <th>League Short Name</th>
           
            <th>Start & End Date</th>
            <th>Status</th>
            
        </tr>`;
    thead.innerHTML = headerRow;

    // Add table rows from the full data array
    array.forEach((showdata, index) => {
        const status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${showdata["league_name"] || ""}</td>
                <td>${showdata["short_league_name"] || ""}</td>
               
                <td>${(showdata["start_league_date"] || "") + " - " + (showdata["end_league_date"] || "")}</td>
                <td>${status}</td>
               
            </tr>`;
        tbody.innerHTML += row;
    });

    // Append the thead and tbody to the tempTable
    tempTable.appendChild(thead);
    tempTable.appendChild(tbody);

    // Use XLSX to export the complete table with some formatting
    const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "League Data" });

    // Apply some basic formatting
    const sheet = workbook.Sheets['League Data'];
    const range = XLSX.utils.decode_range(sheet['!ref']); // Get sheet range

    // Adjust column widths for better readability
    sheet['!cols'] = [
        { wch: 5 }, // No.
        { wch: 20 }, // League Full Name
        { wch: 15 }, // League Short Name
        // { wch: 30 }, // Logo (URL)
        { wch: 25 }, // Start & End Date
        { wch: 15 }, // Status
      
    ];

    // Export as an Excel file
    XLSX.writeFile(workbook, "league_data.xlsx");
});


history.pushState(null, null, window.location.href);
window.addEventListener('pageshow', function (event) {
  if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
      // Reload the page only once
      // window.location.reload();
      hideLoader()

  }
});

fetchData();
// hideLoader();
