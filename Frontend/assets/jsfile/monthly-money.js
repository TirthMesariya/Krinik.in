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
let groupedData 



async function fetchUserData() {
  try {
    // Fetch both data in parallel
    const [data] = await Promise.all([
    //   $.ajax({
    //     url: "https://krinik.in/withdraw_amount_get/",
    //     method: "GET"
    //   }),
      $.ajax({
        url: "https://krinik.in/payment/",
        method: "GET"
      })
    ]);

    // Check if both requests were successful
    if (data && data.status === "success" ) {
      // Combine both data responses into one array
      const combinedData = data.data;
      console.log(combinedData,"combinedData")
      
      let  filteredArray = combinedData.filter((item) => item.
      payment_status  === "approved");
      // Sort combined data by timestamp (assuming it's in "YYYY-MM-DD HH:mm:ss" format)
      filteredArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Descending order

      console.log(filteredArray,"f");
      rankList = filteredArray
      if (rankList.length > 0) {
        array = rankList;
         groupedData = array.reduce((acc, item) => {
            const monthYear = moment(item.timestamp, "YYYY-MM-DD HH:mm:ss").format(
              "MMMM YYYY"
            );
            if (!acc[monthYear]) acc[monthYear] = { data: [], totalTDS: 0 };
            const tdsAmount =
              // (item.amount_without_tds || 0) - (item.amount_with_tds || 0);
              item.paid_amount || 0
            acc[monthYear].data.push(item);
            acc[monthYear].totalTDS += tdsAmount;
            return acc;
          }, {});
          console.log(groupedData,"klo")
        // console.log(array,"plo")
        filterAndDisplay(); // Call the function to filter and display data
      } else {
        console.error("No matching data found for the given ID");
      }
      // Call your filter and display function with sorted data
    //   filterAndDisplay();
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

$(document).ready(function () {
  const currentYear = new Date().getFullYear();
  const startYear = 2025; // Adjust as needed
  const endYear = currentYear ; // Future years (adjust as needed)

  const yearDropdown = $("#yearDropdown");
  yearDropdown.empty(); // Clear any existing options
  yearDropdown.append(`<option value="">Select Year</option>`); // Default option

  for (let year = endYear; year >= startYear; year--) {
      yearDropdown.append(`<option value="${year}">${year}</option>`);
  }
});



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
  
renderTables(groupedData);

}
  
  function renderTables(data) {
    Object.keys(data).forEach((monthYear, index) => {
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
        data[monthYear].data.forEach((showdata, idx) => {
            const tdsAmount = showdata.paid_amount || 0;

            const row = $("<tr></tr>")
                .append($("<td></td>").text(idx + 1))
                .append($("<td colspan='3'></td>").text(showdata.user_data.name))
                .append($("<td colspan='3'></td>").text(showdata.user_data["mobile_no"] || ""))
                .append($("<td colspan='2'></td>").text(
                    moment(showdata.timestamp, "YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY HH:mm:ss")
                ))
                .append($("<td colspan='2'></td>").html(
                    `<span class="material-symbols-outlined" style="color:green">check_circle</span>`
                ))
                .append($("<td colspan='3'></td>").html(`<span font-weight:600">${tdsAmount}</span>`));

            tbody.append(row);
        });

        const totalTDSRow = $("<tr></tr>").append(
            $("<td colspan='13' style='text-align: right; font-weight: bold;'></td>").text("Total Money:"),
            $("<td style='font-weight: bold;color: green;'></td>").text(data[monthYear].totalTDS.toFixed(2))
        );

        tbody.append(totalTDSRow);
        tableWrapper.append(table);
        $("#table-scrolling").append(tableWrapper);
    });
}
function applyFilter() {
    const selectedMonth = $("#monthDropdown").val();
    const selectedYear = $("#yearDropdown").val();

    // Clear existing tables
    $("#table-scrolling").empty();

    // If no month or year is selected, show all data
    if (!selectedMonth || !selectedYear) {
        renderTables(groupedData);
        return;
    }

    // Construct the key in "Month Year" format (e.g., "March 2025")
    const key = `${selectedMonth} ${selectedYear}`;

    // Ensure filteredData is always an object
    const filteredData = groupedData[key] ? { [key]: groupedData[key] } : {};

    // Debugging: Log values
    console.log("Filtering for:", key);
    console.log("Filtered Data:", filteredData);

    // Only render if data exists
    if (Object.keys(filteredData).length > 0) {
        renderTables(filteredData);
    } else {
        $("#table-scrolling").html(`<p style="color:red; text-align:center;">No data available for ${key}</p>`);
    }
}

document.querySelector("#filterbtn").addEventListener("click", function (event) {
    event.preventDefault()
    applyFilter();
});





// $("#download-btn").on("click", () => {
//   const allTables = document.querySelectorAll("#table-scrolling table");

//   if (allTables.length === 0) {
//     alert("No data available to download!");
//     return;
//   }

//   // Prepare the data for the Excel file from the array
//   const updatedData = groupedData.map(item => {
//     const monthYear = moment(item.timestamp, "YYYY-MM-DD HH:mm:ss").format("MMMM YYYY");
//     return { ...item, monthYear };
//   });

//   console.log(updatedData,"updata")
//   // const workbook = XLSX.utils.book_new();

//   // Iterate through the tables and add each to the Excel workbook
//   // allTables.forEach((table, index) => {
//   //   const sheet = XLSX.utils.table_to_sheet(table);
//   //   const monthYear = table.getAttribute('data-month-year') || `Sheet-${index + 1}`;
//   //   XLSX.utils.book_append_sheet(workbook, sheet, monthYear);
//   // });

//   // Create a separate sheet for the user data (based on the updatedData)
//   const excelData = updatedData.map((object, index) => {
//     const nameUser = object.user_data?.name || "Unknown User";
//     const matchDetails = object.user_data?.mobile_no || "N/A";
//     const formattedMobileNo = matchDetails.toString(); // Force Excel to treat as text
// console.log(formattedMobileNo)
//     const amountCell = object.paid_amount;
    
//     const statusCell = object["payment_status"]?.toLowerCase() || object["withdraw_status"]?.toLowerCase() || "null";
//     let statusText = "Null";
//     if (statusCell === "approved") statusText = "Approved";
//     if (statusCell === "rejected") statusText = "Rejected";
//     if (statusCell === "pending") statusText = "Pending";
    

//     // Explicitly format date as string (DD-MM-YYYY HH:mm:ss)
//     const dateCell = moment(object["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss');
// console.log(dateCell)
//     return {
//       No: index + 1,
//       "Name": nameUser,
//       "Mobile No": `${formattedMobileNo}`,  // Now treated as text to prevent scientific notation
//       "Date & Time": dateCell,         // Ensure correct date formatting
//       Status: statusText,
//       "Amount": amountCell
//     };
//   });
//   const totalTds = updatedData.reduce((sum, item) => sum + (item.paid_amount || 0), 0);

//   excelData.push({
//     No: "",
//     "Name": "",
//     "Mobile No": "",
//     "Date & Time": "",
//     Status: "TotalTDS",
//     "Amount": totalTds
//   });
//   // Create a worksheet from the updated data
//   const worksheet = XLSX.utils.json_to_sheet(excelData);

//   // Adjust column widths for better spacing
//   const columnWidths = [
//     { wpx: 50 },  // No (narrow column)
//     { wpx: 250 }, // Name (wide column)
//     { wpx: 150 }, // Mobile No (medium column)
//     { wpx: 100 }, // Amount (narrow column)
//     { wpx: 150 }, // Status (medium column)
//     { wpx: 150 }, // Date & Time (medium column)
//   ];
//   worksheet["!cols"] = columnWidths; // Apply column widths

//   // Create a new workbook and append the worksheet
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Match Data");

//   // Write the workbook to a file and trigger the download
//   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//   const data = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   // Create a download link and trigger the download
//   const url = URL.createObjectURL(data);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "display_match_data.xlsx";
//   a.click();

//   // Clean up the created object URL and remove the link element
//   URL.revokeObjectURL(url);
//   a.remove();
// });

$("#download-btn").on("click", () => {
  const allTables = document.querySelectorAll("#table-scrolling table");

  if (allTables.length === 0) {
    alert("No data available to download!");
    return;
  }

  const workbook = XLSX.utils.book_new();

  allTables.forEach((table, index) => {
    const sheetData = [];
    const monthYear = table.querySelector("th[colspan='14']").innerText.trim();

    // Extract headers (Merged row structure)
    sheetData.push([monthYear]);
    sheetData.push(["No.", "Name", "Mobile No.", "Date & Time", "Amount",]);

    // Extract row data
    const rows = table.querySelectorAll("tbody tr");
 
rows.forEach(row => {
  const cells = row.querySelectorAll("td");
  const rowData = Array.from(cells)
    .filter((_, index) => index !== 4) // Exclude the 4th column (Date & Time)
    .map(cell => {
      let text = cell.innerText.trim();
      return text === "check_circle" ? "" : text; // Remove "check_circle"
    });

  sheetData.push(rowData);
});


    // Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge the required headers
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    // Adjust column widths
    worksheet["!cols"] = [
      { wpx: 50 }, // No.
      { wpx: 150 }, // Name
      { wpx: 120 }, // Mobile No.
      { wpx: 180 }, // Date & Time
      { wpx: 100 } // Amount
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, monthYear);
  });

  // Save the file
  XLSX.writeFile(workbook, "monthly-money.xlsx");
});





  
  


  



  
  
  
window.onload = checkAdminAccess();
