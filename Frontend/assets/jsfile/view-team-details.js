import {checkAdminAccess}  from "../js/initial.js"

// document.addEventListener("DOMContentLoaded", async function () {
//   try {
//     // Get the team name from the URL query parameters
//     const urlParams = new URLSearchParams(window.location.search);
//     const teamName = Number(urlParams.get("teamName"));

//     // Fetch team data
//     const teamResponse = await fetch(
//       `https://krinik.in/team_get/`
//     );
//     // const teamResponse1 = await fetch(
//     //   `https://krinik.in/league_get/`
//     // );
//     const teamResponse2 = await fetch(
//       `https://krinik.in/player_get/`
//     );

//     // const [data, data1, user_match,admin_wallet] = await Promise.all([
//     //   $.ajax({ url: `https://krinik.in/match_get/`, method: "GET" }),
//     //   $.ajax({ url: `https://krinik.in/player_get/`, method: "GET" }),
     
//     // ]);

//     const teamData = (await teamResponse.json()).data;
//     // const leagueData = (await teamResponse1.json()).data;
//     const playerData = (await teamResponse2.json()).data;
//     console.log(playerData,"playDta")
    
//     // Find the team data with matching team name
//     const specificTeam = teamData.find((team) => team.id === teamName);
//     console.log(specificTeam);
//     // Filter players based on the team and league
//     const filteredPlayers = playerData.filter((player) => {
//       return (
//         player.team_name.id === specificTeam.id 
//       );
//     });
//     console.log(filteredPlayers);
//     // Find the league data with the matching team name

//     if (filteredPlayers) {
//       const leagueName = specificTeam.team_name;

//       const teamImagePreview = document.getElementById("leagueImagePreview");
//       const teamNameHeading = document.getElementById("leagueNameHeading");
//       const startTeamDateInput = document.getElementById("startLeagueDate");
//       const endTeamDateInput = document.getElementById("endLeagueDate");

//       teamNameHeading.textContent = specificTeam.team_name;

//       // Display team image
//       if (specificTeam.team_image) {
//         teamImagePreview.src =
//           "https://krinik.in" + specificTeam.team_image;
//       } else {
//         teamImagePreview.src = ""; // Clear image source if no image available
//       }

//       startTeamDateInput.value = moment(
//         specificTeam.team_date,
//         "YYYY-MM-DD"
//       ).format("DD-MM-YYYY");

//       // Get reference to the tbody where players will be appended
//       const playerListBody = document.getElementById("playerList");

//       // Clear existing content
//       playerListBody.innerHTML = "";

//       if (filteredPlayers.length === 0) {
//         $("#noDataFound").show();
//         $("#pagination").hide();
//         $("#table-scrolling").css("overflow-x", "hidden"); // Add this line
//         return;
//       } else {
//         $("#noDataFound").hide();
//         $("#pagination").show();
//         $("#table-scrolling").css("overflow-x", "auto"); // Add this line
//       }

//       // Iterate over filtered players and create rows in the table
//       filteredPlayers.forEach((player, index) => {
        
//         const row = document.createElement("tr");
//         row.innerHTML = `
//                               <td>${index + 1}</td>
//                               <td colspan"3"">${player.player_name}</td>
//                           `;
//         playerListBody.appendChild(row);
//       });
//     } else {
//       console.error("Team details not found for team name:", teamName);
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
//   // window.onload = checkAdminAccess();
// });





// import { checkAdminAccess } from "../js/initial.js"
document.addEventListener('DOMContentLoaded', function () {
    // Get the league name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const teamName = Number(urlParams.get("teamName"));
   
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

async function fetchData(teamName) {
  try {
    const teamResponse = await fetch(`https://krinik.in/team_get/`);
    if (teamResponse.ok) {
      const teamData = (await teamResponse.json()).data;
console.log(teamData,"okk")
      // Find the team data with the matching team name
      const specificTeam = teamData.find((team) => team.id === teamName);

      if (specificTeam) {
        console.log("Specific Team:", specificTeam);
        await fetchPlayerData(specificTeam); // Pass specificTeam to fetchPlayerData
      } else {
        console.error("Team not found:", teamName);
      }
    } else {
      console.error("Error fetching team data:", teamResponse.status);
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
  }
}

async function fetchPlayerData(specificTeam) {
  try {
    const teamResponse = await fetch("https://krinik.in/player_get/");
    if (teamResponse.ok) {
      const playerData = (await teamResponse.json()).data;

      // Filter players belonging to the specific team
      const filteredPlayers = playerData.filter(
        (player) => player.team_name.id === specificTeam.id
      );
      console.log("Filtered Players:", filteredPlayers);

      // Update HTML elements with team and player details
      updateTeamDetails(specificTeam);
      rankList = filteredPlayers;
            console.log(rankList)
            array = rankList;
      filterAndDisplay()
      // Additional logic for filtered players can go here
    } else {
      console.error("Error fetching player data:", teamResponse.status);
    }
  } catch (error) {
    console.error("Error in fetchPlayerData:", error);
  }
}

function updateTeamDetails(specificTeam) {
  const teamImagePreview = document.getElementById("leagueImagePreview");
  const teamNameHeading = document.getElementById("leagueNameHeading");
  const startTeamDateInput = document.getElementById("startLeagueDate");
  const endTeamDateInput = document.getElementById("endLeagueDate");

  // Update team details in the DOM
  teamNameHeading.textContent = specificTeam.team_name;

  if (specificTeam.team_image) {
    teamImagePreview.src = "https://krinik.in" + specificTeam.team_image;
  } else {
    teamImagePreview.src = ""; // Clear image if none exists
  }

  startTeamDateInput.value = moment(
    specificTeam.team_date,
    "YYYY-MM-DD"
  ).format("DD-MM-YYYY");

  // Add additional updates as needed
}

// Example usage
// fetchData("ExampleTeamName");


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
      console.log(showdata,"plpl")
        var tr = $("<tr></tr>");
        var noCell = $("<td></td>").text(i + 1).css("width", columnWidths[0]);
        var fullNameCell = $("<td></td>").text(showdata["player_name"] || "").css("width", columnWidths[1]);
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
                <td>${showdata["player_name"] || ""}</td>
               
               
            </tr>`;
        tbody.innerHTML += row;
    });

    // Append the thead and tbody to the tempTable
    tempTable.appendChild(thead);
    tempTable.appendChild(tbody);

    // Use XLSX to export the complete table with some formatting
    const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "View-Player-Team Data" });

    // Apply some basic formatting
    const sheet = workbook.Sheets['View-Player-Team Data'];
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
    XLSX.writeFile(workbook, "view_player_in_team.xlsx");
});


history.pushState(null, null, window.location.href);


fetchData(teamName);
// hideLoader();
});