import {getAdminType,createOTPModal,showDynamicAlert}  from "../js/initial.js"
import {refreshpage,showLoader,hideLoader} from "./pagerefresh.js"

   var rankList = [];
    var array = [];
    var array_length = 0;
    var table_size = 10;
    var start_index = 1;
    var end_index = 0;
    var current_index = 1;
    var max_index = 0;
  let totaldatateam = document.querySelector("#total-team-data");
  const otpModalInstance = createOTPModal();

  let addNewBtn = document.getElementById("addNewBtn")
  const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";
  function showOTP() {
  
      otpModalInstance.show()
      
  }

  async function fetchData() {
      try {
          // Fetch teams data
          const teamsResponse = await fetch("https://krinik.in/team_get/", {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          // Fetch leagues data
          const leaguesResponse = await fetch("https://krinik.in/league_get/", {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json'
              }
          });


          if (teamsResponse.ok && leaguesResponse.ok) {
              const teamsData = await teamsResponse.json();
              const leaguesData = await leaguesResponse.json();

              if (teamsData.status === "success" && leaguesData.status === "success") {
                  rankList = teamsData.data; // Update rankList with fetched teams data
                  array = rankList.slice(); // Initialize array with fetched teams data (make a copy)
                  totaldatateam.innerHTML = rankList.length;
                  // Populate league dropdown options
                  populateLeagueDropdown(leaguesData.data);

                  // Perform initial filtering and display
                  filterRankList();
              } else {
                  console.error("Error: Invalid data format");
              }
          } else {
              console.error("Error fetching data");
          }
      } catch (error) {
          console.error("Error fetching data", error);
      }
  }

 


  $(document).ready(function () {

    const $dropdownBtn3 = $('#dropdownBtn3');
  const $dropdownContent3 = $('#leagueDropdown'); // Fixed ID selector
  const $selectedStatus = $('#selectedStatus');
  const $arrow = $('#arrowBar');
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

    if (selectedValue === 'All Leagues') {
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
    $selectedStatus.text('All Leagues').data('value', 'All Leagues');
    $arrow.show();
    $clearStatus.hide();
    $dropdownContent3.removeClass('show'); // Hide the dropdown content
    $dropdownBtn3.attr('aria-expanded', 'false'); // Ensure dropdown button is collapsed
    filterRankList(); // Filter with the reset status
  });

  // Click event for closing the dropdown if clicked outside
  $(document).on('click', function(event) {
    if (!$selectedStatus.is(event.target) && !$selectedStatus.has(event.target).length &&
        !$dropdownContent3.has(event.target).length && !$arrow.is(event.target) &&
        !$clearStatus.is(event.target)) {
      $dropdownContent3.removeClass('show');
      $dropdownBtn3.attr('aria-expanded', 'false');
    }
  });

      // Event handler for search input
      $('#tab_filter_text').on('input', function () {
          filterRankList(); // Trigger filtering when search text changes
      });

      // Event handler for date range picker
      $('#datefilter').on('apply.daterangepicker', function (ev, picker) {
          $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
          $('#clearDateBtn').show();
          filterRankList(); // Trigger filtering when date range is applied
      });

      // Event handler for clearing date range
      $('#clearDateBtn').click(function () {
          $('#datefilter').val('');
          $(this).hide();
          filterRankList(); // Trigger filtering when date range is cleared
      });

      // Initial call to fetch data
      fetchData();
  });

  function preLoadCalculations(filteredArrayLength) {
      array_length = filteredArrayLength || array.length;
      max_index = Math.ceil(array_length / table_size);
    }
  // Function to populate league dropdown
  function populateLeagueDropdown(leagues) {
  var dropdown = document.getElementById('leagueDropdown');
  dropdown.innerHTML = ''; // Clear existing options

  // Create a default "All Leagues" item
  // var defaultItem = document.createElement('a');
  // defaultItem.textContent = 'All Leagues';
  // defaultItem.setAttribute('data-value', 'All Leagues');
  // dropdown.appendChild(defaultItem);

  // Create items for each league
  leagues.forEach(league => {
    var item = document.createElement('a');
    item.textContent = league.league_name; // Display league name
    item.setAttribute('data-value', league.league_name); // Set data-value attribute
    dropdown.appendChild(item);
  });
}


  // Function to filter and display team list based on search and league selection
  function filterRankList() {
    var tab_filter_text = $("#tab_filter_text").val().toLowerCase().trim();
    // var selectedLeague = $('#leagueDropdown').val();
    const selectedLeague = $("#selectedStatus").data('value') || '';

    var filteredArray = rankList.filter(function (object) {
        var matchesText = true;

        if (tab_filter_text !== '') {
            matchesText = (object.team_name && object.team_name.toLowerCase().includes(tab_filter_text)) ||
                            (object.team_short_name && object.team_short_name.toLowerCase().includes(tab_filter_text)) ||
                            (object.league_name && object.league_name.toLowerCase().includes(tab_filter_text)) ||
                            (object.team_date && object.team_date.toLowerCase().includes(tab_filter_text));
        }

        if (selectedLeague && selectedLeague !== 'All Leagues') {
      matchesText = matchesText && object.league_name === selectedLeague; // Compare league_name with selectedLeague
    }

        return matchesText;
    });

    array = filteredArray;
        preLoadCalculations();
        current_index = 1;
        displayIndexButtons();
        highlightIndexButton()
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
        $("#datatable_info").text("Showing " + start_index + " to " + end_index + " of " + array_length + " teams");
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
      var tab_start = (current_index - 1) * table_size;
      var tab_end = Math.min(current_index * table_size, array.length);

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
          var object = array[i];

          var tr = $("<tr></tr>");

          var noCell = $("<td></td>").text(i + 1);
          var teamNameCell = $("<td colspan='2'></td>").text(object["team_name"] || "");
          var shortNameCell = $("<td colspan='2'></td>").text(object["team_short_name"] || "");
          var leagueCell = $("<td colspan='2'></td>").text(object["league_name"] || "");
          var logoCell = $("<td></td>").html(
              object["team_image"] ?
                  '<img src="https://krinik.in' + object["team_image"] + '" alt="' + object["team_image"] + '" class="team-logo lazyload">' :
                  ''
          );
          var dateCell = $("<td></td>").text(convertDateFormat(object["team_date"] || ""));

         
            var viewCell = $("<td class='otp-exempt3'></td>").html(
                `<span class="sortable otp-exempt3" onclick="viewTeamDetails('${object["id"]}')"><i class="far fa-eye otp-exempt3"></i></span>`
            )
          var editCell = $("<td class='otp-exempt3'></td>").html(
              '<span class="sortable otp-exempt3" onclick="handleEdit(' + object["id"] + ')"><i class="far fa-edit otp-exempt3"></i></span>'
          );
          var deleteCell = $("<td class='otp-exempt3'></td>").html(
              '<span class="sortable otp-exempt3" onclick="handleDelete(' + object["id"] + ')"><i class="far fa-trash-alt otp-exempt3"></i></span>'
          );
          
          
         

          tr.append(noCell)
              .append(teamNameCell)
              .append(shortNameCell)
              .append(leagueCell)
              .append(logoCell)
              .append(dateCell)
              .append(viewCell)
              .append(editCell)
              .append(deleteCell);

          $("table tbody").append(tr);
      }
      // lazyLoadImages(); // Lazy load images after table rows are appended
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
    //   window.location.href = "./addleague.html"
      window.location.href = "./addteam.html"
    
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

  function viewTeamDetails(teamName) {
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
                window.location.href = `view-team-details.html?teamName=${encodeURIComponent(teamName)}`;
    //   window.location.href = "./addleague.html"
    
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
                if (confirm('Are you sure you want to delete this team?')) {
                    showLoader();
                    const url = `https://krinik.in/team_get/${id}/`;
                    try {
                        const response = await fetch(url, {
                            method: "DELETE"
                        });
          
                        if (response.ok) {
                            // Fetch the updated list of teams after deletion
                            showDynamicAlert("Team Deleted Successfully !!")
                            await fetchData();
                        } else {
                            console.error("Failed to delete the team");
                        }
                    } catch (error) {
                        console.error("Error deleting team:", error);
                    }
                    hideLoader()
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
        ; // Ensure loader hides if no redirect function is provided
    // }


     
  }
}

  // Ensure the edit functionality is working properly with appropriate URL handling
  async function handleEdit(id) {
    if (isSuperAdmin && isStatusTrue) {
      showOTP()

}else{
    // if (typeof refreshpage === "function") {
        setTimeout(() => {
            showLoader(); // Show the loader with a delay (optional)
        }, 100);
    
        // Perform the redirect and handle loader visibility
        Promise.resolve()
            .then(async() => {
                const url = `https://krinik.in/team_get/${id}/`;
                try {
                    const response = await fetch(url);
          
                    if (response.ok) {
                        // Redirect to edit page with the team ID
                        window.location.href = `editteam.html?id=${id}`;
                    } else {
                        console.error("Failed to fetch team data");
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
        // console.error("No redirect function provided.");
        hideLoader(); // Ensure loader hides if no redirect function is provided
    // }

     
  }
  }
  window.prev = prev;
  window.next = next;
  window.indexPagination = indexPagination;

  window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.viewTeamDetails = viewTeamDetails;
  // Function to convert date format from YYYY-MM-DD to DD-MM-YYYY
  function convertDateFormat(dateString) {
      // Assuming dateString is in the format YYYY-MM-DD
      var parts = dateString.split('-');
      if (parts.length === 3) {
          var formattedDate = parts[2] + '-' + parts[1] + '-' + parts[0]; // Change format to DD-MM-YYYY
          return formattedDate;
      }
      return dateString; // Return original if format is unexpected
  }

  // Lazy load images function
  function lazyLoadImages() {
      var lazyloadImages = document.querySelectorAll(".team-logo");

      lazyloadImages.forEach(function (img) {
          img.addEventListener('load', function () {
              img.classList.add('fade-in');
          });

          img.addEventListener('error', function () {
              console.error('Error loading image:', img.src);
          });

          if (img.complete) {
              img.classList.add('fade-in');
          }
      });
  }

  const table = document.getElementById('teamTable');
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
            <th>Short Name</th>
            <th>League Name</th>
            
            <th>Date</th>
              
          </tr>`;
      thead.innerHTML = headerRow;
  
      // Add table rows from the full data array
      array.forEach((object, i) => {
        //   const status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);
  
          const row = `
              <tr>
                  <td>${i + 1}</td>
                <td>${object["team_name"] || ""}</td>
                <td>${object["team_short_name"] || ""}</td>
                <td>${object["league_name"] || ""}</td>
                
                <td>${convertDateFormat(object["team_date"] || "")}</td>
                 
              </tr>`;
          tbody.innerHTML += row;
      });
  
      // Append the thead and tbody to the tempTable
      tempTable.appendChild(thead);
      tempTable.appendChild(tbody);
  
      // Use XLSX to export the complete table with some formatting
      const workbook = XLSX.utils.table_to_book(tempTable, { sheet: "Team Data" });
  
      // Apply some basic formatting
      const sheet = workbook.Sheets['Team Data'];
      const range = XLSX.utils.decode_range(sheet['!ref']); // Get sheet range
  
      // Adjust column widths for better readability
      sheet['!cols'] = [
          { wch: 5 }, // No.
          { wch: 25 }, // League Full Name
          { wch: 15 }, // League Short Name
          // { wch: 30 }, // Logo (URL)
          { wch: 25 }, // Start & End Date
          { wch: 20 }, // Status
        
      ];
  
      // Export as an Excel file
      XLSX.writeFile(workbook, "team_data.xlsx");
  });


history.pushState(null, null, window.location.href);