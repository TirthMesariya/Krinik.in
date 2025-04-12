import { checkAdminAccess } from "../js/initial.js"
document.addEventListener('DOMContentLoaded', function () {
    // Get the league name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const leagueName = urlParams.get('leagueName');
   
    window.onload = checkAdminAccess();

var rankList = [];
var array = [];
var array_length = 0;
var table_size = 10;
var start_index = 1;
var end_index = 0;
var current_index = 1;
var max_index = 0;
const leagueNameHeading = document.getElementById('leagueNameHeading');
const startLeagueDateInput = document.getElementById('startLeagueDate');
const endLeagueDateInput = document.getElementById('endLeagueDate');
const leagueImagePreview = document.getElementById('leagueImagePreview');

async function fetchData() {
    try {
        const data = await $.ajax({
            url: "https://krinik.in/league_get/",
            method: "GET"
        });


        if (data && data.status === "success") {
            const leagueData = data.data;

            // Find the league data with matching league name
            const filteredLeague = leagueData.find(league => league.league_name === leagueName);

            if (filteredLeague) {
                // Update HTML elements with league details
                leagueNameHeading.textContent = filteredLeague.league_name;
                startLeagueDateInput.value = filteredLeague.start_league_date;
                endLeagueDateInput.value = filteredLeague.end_league_date;

                // Display league image
                if (filteredLeague.league_image) {
                    leagueImagePreview.src = 'https://krinik.in' + filteredLeague.league_image;
                } else {
                    leagueImagePreview.src = ''; // Clear image source if no image available
                }
            } else {
                console.error('League details not found for league name:', leagueName);
            }
            fetchTeamData()
        } else {
            console.error("Error: Invalid data format");
        }
    } catch (error) {
        console.error("Error fetching data", error);
    }
}

async function fetchTeamData() {
    try {
        const data = await $.ajax({
            url: "https://krinik.in/team_get/",
            method: "GET"
        });


        if (data && data.status === "success") {

            const teamData = data.data;
       
        // Filter the team data based on the league name
        const filteredTeams = teamData.filter(team => team.league_name === leagueName);
            rankList = filteredTeams;
            console.log(rankList)
            array = rankList;
            filterAndDisplay();
            // totaldataleague.innerHTML = array.length;
        } else {
            console.error("Error: Invalid data format");
        }
    } catch (error) {
        console.error("Error fetching data", error);
    }
}

function filterAndDisplay() {
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
        // var status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);

        var tr = $("<tr></tr>");
        var noCell = $("<td></td>").text(i + 1).css("width", columnWidths[0]);
        var fullNameCell = $("<td></td>").text(showdata["team_name"] || "").css("width", columnWidths[1]);
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
            // .append(shortNameCell)
            // .append(logoCell)
            // .append(dateCell)
            // .append(statusCell)
            // .append(viewCell)
            // .append(editCell)
            // .append(deleteCell);

        $("table tbody").append(tr);
    }
}



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
            <th>Team Name</th>
            
            
        </tr>`;
    thead.innerHTML = headerRow;

    // Add table rows from the full data array
    array.forEach((showdata, index) => {
        // const status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${showdata["team_name"] || ""}</td>
               
               
            </tr>`;
        tbody.innerHTML += row;
    });

    // Append the thead and tbody to the tempTable
    tempTable.appendChild(thead);
    tempTable.appendChild(tbody);

    // Use XLSX to export the complete table with some formatting
    const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "View-Team-League Data" });

    // Apply some basic formatting
    const sheet = workbook.Sheets['View-Team-League Data'];
    const range = XLSX.utils.decode_range(sheet['!ref']); // Get sheet range

    // Adjust column widths for better readability
    sheet['!cols'] = [
        { wch: 5 }, // No.
        { wch: 30 }, // League Full Name
        // { wch: 15 }, // League Short Name
        // // { wch: 30 }, // Logo (URL)
        // { wch: 25 }, // Start & End Date
        // { wch: 15 }, // Status

    ];

    // Export as an Excel file
    XLSX.writeFile(workbook, "view_team_in_league.xlsx");
});


history.pushState(null, null, window.location.href);


fetchData();
// hideLoader();
});