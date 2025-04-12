// import {checkAdminAccess}  from "../js/initial.js"
import {getAdminType,createOTPModal}  from "../js/initial.js"
let rankList = [];
var array;
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
// let totaldataleague = document.querySelector("#total-league-data");
// const uniqueUsers = {};
const otpModalInstance = createOTPModal();



function showOTP() {

    otpModalInstance.show()
    
}
const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";

async function fetchData() {
  try {
    const data = await $.ajax({
      url: "https://krinik.in/payment/",
      method: "GET",
    });

    if (data && data.status === "success" && Array.isArray(data.data)) {
      const rankList1 = data.data;
      console.log(rankList, "Fetched Data");

      // Filter the data
      const withdrawdata = getFirstRecordPerUser(rankList1);
      console.log(withdrawdata, "Filtered Data (First Record Per User)");

      if (withdrawdata) {
        rankList = withdrawdata
        array = withdrawdata;
        console.log(array, "Final Array");

        // Call your display function
        filterAndDisplay();
      }
    } else {
      console.error("Error: Invalid data format or status");
    }
  } catch (error) {
    console.error("Error fetching data", error);
  }
}

function getFirstRecordPerUser(data) {
  console.log(data, "Original Data");
  const uniqueUsers = {};
  return data.filter((record) => {
    const userId = record?.user_data?.user_id;
    if (userId && !uniqueUsers[userId]) {
      uniqueUsers[userId] = true;
      return true; // Include the first occurrence of this user
    }
    return false; // Exclude subsequent occurrences
  });
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

$('#tab_filter_text').on('input', function () {
filterRankList();
});


});


function filterRankList() {
  var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();

  // Filter the rankList based on text, status, date range, and amount range
  var filteredArray = rankList.filter(function (object) {
    var matchesText = true;
    console.log("object", object);
  
    // Filter based on text input
    if (tab_filter_text !== '') {
      matchesText = 
        (object.user_data?.user_id && object.user_data.user_id.toLowerCase().includes(tab_filter_text)) ||
        (object.user_data?.name && object.user_data.name.toString().toLowerCase().includes(tab_filter_text)) ||
        (object.user_data?.mobile_no && object.user_data.mobile_no.toString().includes(tab_filter_text)) ||
        (object.user_data?.user_doc && object.user_data.user_doc.bank_name &&  object.user_data.user_doc.bank_name.toLowerCase().includes(tab_filter_text));
    }
  
    // Ensure objects with `user_data.user_doc` as null are not filtered out
    // if (object.user_data?.user_doc === null) {
    //   return true; // Include this object
    // }
  
    return matchesText;
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
// console.log("Retrieved item from localStorage:", item); // Log the raw item

if (item) {
try {
  const parsedItem = JSON.parse(item);
  // console.log("Parsed item:", parsedItem); // Log the parsed item

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
    console.log(array,"oklp")
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
    const statusOrder = ["pending", "approved", "rejected"];
    const sortedArray = array.sort((a, b) => {
      const statusA = a.payment_status ? a.payment_status.toLowerCase() : "";
      const statusB = b.payment_status ? b.payment_status.toLowerCase() : "";
      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
    });

    for (var i = tab_start; i < tab_end; i++) {
      var showdata = sortedArray[i];
   

      var tr = $("<tr></tr>");

      var noCell = $("<td></td>").text(i + 1);
      var userIdCell = $("<td colspan='2'></td>").text(showdata.user_data["user_id"] || "");
// console.log(userIdCell,"DATA")
      var fullNameCell = $("<td colspan='2'></td>").text(showdata.user_data["name"] || "");
      var shortNameCell = $("<td colspan='2'> </td>").text(showdata.user_data["mobile_no"] || "");
      // var emailCell = $("<td colspan='3'> </td>").text(showdata.user_data["email"] || "");
      var bankNameCell = $("<td colspan='2'></td>").text(showdata.user_data?.user_doc?.bank_name || "KYC Not Submitted"  );
      
      const timeCell = $("<td colspan='3'></td>").text(moment(showdata["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'));
      var statusCell = $("<td colspan='2'></td>").text(toCapitalizeCase(showdata["payment_status"] || ""));
    
      var viewCell = $("<td class='otp-exempt' style='border:none'></td>").html(
        '<span class="sortable" onclick="handleView(\'' + showdata.user_data['user_id'] + '\',\'' + showdata['id'] + '\')"><i class="far fa-eye"></i></span>'
      );
      

      tr.append(noCell)
      .append(userIdCell)
        .append(fullNameCell)
        .append(shortNameCell)
        // .append(emailCell)
        .append(bankNameCell)
        .append(timeCell)
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
window.toCapitalizeCase = toCapitalizeCase;
window.indexPagination = indexPagination;

window.prev = prev;
window.next = next;
window.indexPagination = indexPagination;
window.disableButton = disableButton;
window.handleView = handleView;


async function handleView(user_id,id) {
  if (isSuperAdmin && isStatusTrue) {
    showOTP()

}else{



  setTimeout(() => {
    showLoader(); // Show the loader with a delay (optional)
}, 100);

// Perform the redirect and handle loader visibility
Promise.resolve()
    .then(async() => {
      const url = `https://krinik.in/user_get/${user_id}/`;
      try {
        const response = await fetch(url);
    
        if (response.ok) {
          window.location.href = `view-user-money.html?id=${id}&user_id=${user_id}`;
        } else {
          console.error("Failed to fetch the league data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
hideLoader()
  
}
}

const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
  if (array.length === 0) {
      alert("No data available to download.");
      return;
  }

  // Create a temporary table
  const tempTable = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Add the table header
  thead.innerHTML = `
      <tr>
         <th>No.</th>
         <th>UserId</th>
         <th>Name</th>
         <th>Mobile No.</th>
         <th>Bank Name</th>
         <th>Request Time</th>
         <th>Status</th>
      </tr>`;

  // Add table rows
  array.forEach((object, i) => {
      const formattedMobileNo = object.user_data.mobile_no ? `${object.user_data.mobile_no}` : "N/A"; 
      const formattedBank = object.user_data.user_doc ? `${object.user_data.user_doc.bank_name}` : "KYC Not Submitted"; 
      const formattedTime = object["timestamp"] 
          ? moment(object["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss') 
          : "N/A";

      const row = `
          <tr>
             <td>${i + 1}</td>
             <td>${object.user_data["user_id"] || ""}</td>
             <td>${object.user_data["name"] || ""}</td>
             <td>${formattedMobileNo}</td> <!-- Ensures Excel treats it as text -->
             <td>${formattedBank}</td>
             <td>'${formattedTime}'</td> <!-- Prevents Excel from auto-formatting date -->
             <td>${object["payment_status"] || 0}</td>
          </tr>`;
      tbody.innerHTML += row;
  });

  tempTable.appendChild(thead);
  tempTable.appendChild(tbody);

  // Convert table to workbook
  const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "Player Data" });
  const sheet = workbook.Sheets['Player Data'];

  // Ensure Request Time Column is Treated as Text
  const range = XLSX.utils.decode_range(sheet['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const mobileNoCell = XLSX.utils.encode_cell({ r: R, c: 3 }); // Mobile No. column
      const requestTimeCell = XLSX.utils.encode_cell({ r: R, c: 5 }); // Request Time column
  
      if (sheet[mobileNoCell]) {
          sheet[mobileNoCell].z = "@"; // Format as text
          sheet[mobileNoCell].t = "s"; // Ensure it's a string
      }
  
      if (sheet[requestTimeCell]) {
          sheet[requestTimeCell].z = "@"; // Format as text
          sheet[requestTimeCell].t = "s"; // Ensure it's a string
      }
  }
  

  // Adjust column widths
  sheet['!cols'] = [
      { wch: 5 },   // No.
      { wch: 15 },  // User ID
      { wch: 25 },  // Name
      { wch: 15 },  // Mobile No.
      { wch: 25 },  // Bank Name
      { wch: 20 },  // Request Time
      { wch: 15 },  // Status
  ];

  // Export as Excel file
  XLSX.writeFile(workbook, "add_user_money_data.xlsx");
});


window.addEventListener('pageshow', function (event) {
  if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
      // Reload the page only once
      window.location.reload();
  }
});

fetchData();
window.onload = checkAdminAccess();
