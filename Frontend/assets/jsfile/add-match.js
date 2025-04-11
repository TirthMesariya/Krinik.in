import { refreshpage } from "./pagerefresh.js";
import { showLoader,hideLoader } from "./pagerefresh.js";

import {  checkAdminAccess, sendNotificationAllUser,  showDynamicAlert,showDynamicAlert1,sendNotification} from "../js/initial.js";
document.addEventListener("DOMContentLoaded", async function () {
  // window.onload = checkAdminAccess();
  // let leagueName1 = document.getElementById('league-name').value
  let leaguestartDate;
  let leagueendDate;
  let startPicker;
  let tokens, allUsers;
  let existingMatches = [];
  existingMatches = await myFetch("https://krinik.in/match_get/", "GET");
  console.log(existingMatches, "ok");
  $(function () {
    // Initialize Flatpickr
    startPicker = flatpickr("#match-start-date", {
      dateFormat: "d-m-Y H:i",
      enableTime: true,
      minDate: leaguestartDate, // Set the initial minDate
      maxDate: leagueendDate, // Set the initial maxDate
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
          // No endPicker, so no need to set minDate or maxDate for another picker.
        }
      },
      onReady: function (selectedDates, dateStr, instance) {
        addCustomButtons(instance, "#match-start-date");
      },
    });

    // Open Flatpickr on calendar icon click
    $("#calendarIconStart").click(function () {
      startPicker.open();
    });

    let okButtonClicked = false;

    function addCustomButtons(instance, inputSelector) {
      // Ensure the calendarContainer is available
      if (!instance || !instance.calendarContainer) {
        console.error("Flatpickr instance or calendar container not found.");
        return;
      }

      // Check if the footer already exists and remove it
      let existingFooter =
        instance.calendarContainer.querySelector(".flatpickr-footer");
      if (existingFooter) {
        existingFooter.remove();
      }

      // Create footer and buttons
      const footer = document.createElement("div");
      footer.className = "flatpickr-footer";

      const okButton = document.createElement("button");
      okButton.type = "button";
      okButton.className = "flatpickr-ok-button";
      okButton.textContent = "OK";
      okButton.addEventListener("click", function () {
        okButtonClicked = true;
        instance.close(); // Close the picker
      });

      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear-button";
      clearButton.textContent = "Clear";
      clearButton.addEventListener("click", function () {
        document.querySelector(inputSelector).value = ""; // Clear input value
        instance.clear(); // Clear picker
      });

      footer.appendChild(okButton);
      footer.appendChild(clearButton);

      // Append the footer to the calendar container
      instance.calendarContainer.appendChild(footer);
    }

    // Modify the onChange event handler to only update the input value when the OK button is clicked
    startPicker.config.onChange = function (selectedDates, dateStr, instance) {
      if (okButtonClicked) {
        document.querySelector("#match-start-date").value = dateStr;
        okButtonClicked = false; // Reset the flag
      }
    };
  });

  let arr = [];
  console.log(arr);
  let teams = [];
  let allPlayers = {
    "dropdown-players-A": [],
    "dropdown-players-B": [],
  };

  let leaguedata;

  // function populateSelect(selectElement, data, key, defaultOptionText, exclude = "") {
  //     selectElement.innerHTML = '';
  //     const defaultOption = document.createElement('option');
  //     defaultOption.value = '';
  //     defaultOption.textContent = defaultOptionText;
  //     selectElement.appendChild(defaultOption);

  //     data.forEach(item => {
  //         if (item[key] !== exclude) {
  //             const option = document.createElement('option');
  //             option.value = item[key];
  //             option.textContent = item[key];
  //             selectElement.appendChild(option);
  //         }
  //     });
  // }
  function populateSelect(
    selectElement,
    data,
    key,
    defaultOptionText,
    exclude = ""
  ) {
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultOptionText;
    selectElement.appendChild(defaultOption);

    data.forEach((item) => {
      if (item[key] !== exclude) {
        const option = document.createElement("option");
        option.value = item[key];
        option.textContent = item[key];
        selectElement.appendChild(option);
      }
    });

    // Re-enable the select if it was disabled
    selectElement.disabled = false;
  }
  function populateSelect1(data) {
    const selectElement = document.getElementById("league-name");
    selectElement.innerHTML = '<option value="">Select League</option>';

    const currentDate = moment().format("DD-MM-YYYY"); // Get the current date in 'DD-MM-YYYY' format
    console.log(currentDate, "currentDate");

    data.forEach((league) => {
      const leagueEndDate = moment(league.end_league_date, "DD-MM-YYYY").format(
        "DD-MM-YYYY"
      ); // Format league end date
      console.log(leagueEndDate, "leagueEndDate");

      // Compare the formatted currentDate and leagueEndDate
      if (
        moment(currentDate, "DD-MM-YYYY").isBefore(
          moment(leagueEndDate, "DD-MM-YYYY")
        )
      ) {
        const option = document.createElement("option");
        option.value = league.league_name;
        option.textContent = league.league_name;
        selectElement.appendChild(option);
        console.log(selectElement, "selec");
      }
    });
  }

  // Function to fetch user data and extract tokens and user IDs
  const fetchUserData = async () => {
    try {
      // Fetch the user data
      const userResponse = await fetch("https://krinik.in/user_get/");

      // Check if the response is successful
      if (!userResponse.ok) {
        console.error("Failed to fetch users. Status:", userResponse.status);
        return null; // Return null if fetching fails
      }

      // Parse the response JSON
      const userData = await userResponse.json();

      // Extract tokens and user IDs and assign them to global variables
      tokens = userData.data
        .map((user) => user.device_token)
        .filter((token) => token); // Only include valid tokens

      allUsers = userData.data.map((user) => user.user_id);

      console.log("Tokens:", tokens);
      console.log("All User IDs:", allUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  async function fetchLeagues() {
    try {
      const response = await fetch("https://krinik.in/league_get/");
      if (!response.ok) throw new Error("Failed to fetch leagues");
      let leaguedata = await response.json();
      if (leaguedata.status === "success" && Array.isArray(leaguedata.data)) {
        console.log(leaguedata.data, "leaguedata1");
        let leaguedata1 = leaguedata.data;
        populateSelect1(leaguedata.data);

        document
          .getElementById("league-name")
          .addEventListener("change", function () {
            const leagueName = this.value;
            let leagueInfo = leaguedata1.find(
              (p) => p.league_name === leagueName
            );

            if (leagueInfo) {
              const leagueStartDate = moment(
                leagueInfo.start_league_date,
                "DD-MM-YYYY"
              ).toDate(); // Parse league start date
              const leagueEndDate = moment(
                leagueInfo.end_league_date,
                "DD-MM-YYYY"
              ).toDate(); // Parse league end date
              const currentDate = new Date(); // Current Date as JavaScript Date object

              console.log(
                {
                  start: leagueStartDate,
                  end: leagueEndDate,
                  current: currentDate,
                },
                "Selected League Dates"
              );

              // Update the Flatpickr instance minDate and maxDate
              if (currentDate >= leagueStartDate) {
                // If the current date is within the league date range, use current date as min
                startPicker.set("minDate", currentDate);
              } else {
                // Otherwise, use league's start date as min
                startPicker.set("minDate", leagueStartDate);
              }
              startPicker.set("maxDate", leagueEndDate);

              // Fetch teams for the selected league and clear player selections
              fetchTeams(leagueName);
              clearAllSelectedPlayers();

              // Reset team dropdowns
              document.getElementById("team-A").value = "";
              document.getElementById("team-B").value = "";
            }
          });
      } else {
        console.error("Invalid data format for leagues:", leaguedata);
      }
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  }
  async function fetchTeams(leagueName) {
    try {
      const response = await fetch(`https://krinik.in/team_get/`);
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        teams = data.data.filter((team) => team.league_name === leagueName);
        updateTeamSelects();
      } else {
        console.error("Invalid data format for teams:", data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }
  updatePlayerSelectionEnabled();

  function updateTeamSelects() {
    const teamASelected = document.getElementById("team-A").value;
    const teamBSelected = document.getElementById("team-B").value;

    if (teams.length === 0) {
      // No teams available
      document.getElementById("error-team-A").innerHTML = "Create team first";
      document.getElementById("error-team-A").style.display = "inline";
      document.getElementById("error-team-B").innerHTML = "Create team first";
      document.getElementById("error-team-B").style.display = "inline";
      document.getElementById("error-dropdown-players-A").style.display =
        "none";
      document.getElementById("error-dropdown-players-B").style.display =
        "none";
      // Disable both dropdowns
      document.getElementById("team-A").disabled = true;
      document.getElementById("team-B").disabled = true;
    } else if (teams.length === 1) {
      // Only one team available
      // Populate team-A dropdown and show error for team-B
      populateSelect(
        document.getElementById("team-A"),
        teams,
        "team_name",
        "Select Team A",
        teamBSelected
      );
      document.getElementById("error-team-A").style.display = "none"; // Hide error for team-A
      document.getElementById("error-team-B").innerHTML =
        "Only one team available. Please create another team.";
      document.getElementById("error-team-B").style.display = "inline";
      // Disable team-B dropdown
      document.getElementById("team-B").disabled = true;
    } else {
      // showPlayerError(dropdownId, 'No players available for this team.');

      // At least two teams available
      // Populate both dropdowns
      populateSelect(
        document.getElementById("team-A"),
        teams,
        "team_name",
        "Select Team A",
        teamBSelected
      );
      populateSelect(
        document.getElementById("team-B"),
        teams,
        "team_name",
        "Select Team B",
        teamASelected
      );

      // Hide errors and enable both dropdowns
      document.getElementById("error-team-A").style.display = "none";
      document.getElementById("error-team-B").style.display = "none";
      document.getElementById("error-dropdown-players-A").style.display =
        "none";
      document.getElementById("error-dropdown-players-B").style.display =
        "none";
      document.getElementById("team-A").disabled = false;
      document.getElementById("team-B").disabled = false;
    }

    // Re-assign previous selections if available
    document.getElementById("team-A").value = teamASelected;
    document.getElementById("team-B").value = teamBSelected;

    // Re-enable player selection logic
    updatePlayerSelectionEnabled();
  }

  async function fetchPlayers(teamName, dropdownId, leagueSelected) {
    try {
      const response = await fetch("https://krinik.in/player_get/");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      console.log(leagueSelected, "leagueSelected");
      if (data.status === "success" && Array.isArray(data.data)) {
        const players = data.data.filter(
          (player) =>
            player.team_name.team_name === teamName &&
            player.league_name === leagueSelected
        );
        allPlayers[dropdownId] = players;

        if (players.length === 0) {
          // No players for this team, show an error and disable the dropdown
          showPlayerError(dropdownId, "No players available for this team.");
        } else {
          // Populate normally if there are multiple players
          populatePlayerDropdown(players, dropdownId);

          hidePlayerError(dropdownId);
        }
      } else {
        console.error("Invalid data format for players:", data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }

  function populatePlayerDropdown(players, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = "";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search players...";
    searchInput.className = "search-input";
    searchInput.addEventListener("input", function (event) {
      filterPlayers(event.target.value, dropdownId);
    });
    dropdown.appendChild(searchInput);

    const playerContainer = document.createElement("div");
    playerContainer.className = "player-container";

    players.forEach((player, index) => {
      if (index < 6) {
        const playerOption = document.createElement("a");
        playerOption.href = "#";
        playerOption.className = "player-option";
        playerOption.dataset.id = player.id;
        playerOption.textContent = player.player_name;
        playerOption.addEventListener("click", function (event) {
          event.preventDefault();
          const playerId = player.id;
          const playerName = player.player_name;
          const selectedPlayersDiv =
            dropdownId === "dropdown-players-A"
              ? "selected-players-A"
              : "selected-players-B";

          if (
            !document.querySelector(
              `#${selectedPlayersDiv} .player-option[data-id="${playerId}"]`
            )
          ) {
            document.getElementById(selectedPlayersDiv).insertAdjacentHTML(
              "beforeend",
              `
                <div class="col-md-6 d-flex align-items-center justify-content-between player-wrapper">
                  <p class="form-control p-3 d-flex align-content-center justify-content-between player-option" data-id="${playerId}">
                    ${playerName} <span class="remove-player" data-id="${playerId}"><i class="bi bi-x"></i></span>
                  </p>
                </div>
            `
            );
          }

          // Check if the player ID is already in the array
          if (!arr.includes(playerId)) {
            arr.push(playerId); // Push player ID into the array when added
          }

          console.log(arr, "arrr");

          playerOption.remove(); // Remove the selected player from the dropdown list
          dropdown.style.display = "none";
        });
        playerContainer.appendChild(playerOption);
      }
    });

    if (players.length > 6) {
      playerContainer.style.maxHeight = "200px";
      playerContainer.style.overflowY = "auto";
    }

    dropdown.appendChild(playerContainer);

    dropdown.addEventListener("click", function (event) {
      if (event.target.classList.contains("player-option")) {
        event.preventDefault();
        const playerId = event.target.dataset.id;
        const playerName = event.target.textContent;
        const selectedPlayersDiv =
          dropdownId === "dropdown-players-A"
            ? "selected-players-A"
            : "selected-players-B";

        if (
          !document.querySelector(
            `#${selectedPlayersDiv} .player-option[data-id="${playerId}"]`
          )
        ) {
          document.getElementById(selectedPlayersDiv).insertAdjacentHTML(
            "beforeend",
            `
            <div class="col-md-6 d-flex align-items-center justify-content-between player-wrapper">
                <p class="form-control p-3 d-flex align-content-center justify-content-between player-option" data-id="${playerId}">
                    ${playerName} <span class="remove-player" data-id="${playerId}"><i class="bi bi-x"></i></span>
                </p>
            </div>
        `
          );
        }

        // Check if the player ID is already in the array
        if (!arr.includes(playerId)) {
          arr.push(playerId); // Push player ID into the array when added
        }

        console.log(arr, "arrr");

        dropdown.style.display = "none";
      }
    });
  }

  function showPlayerError(dropdownId, message) {
    const errorElement = document.getElementById(`error-${dropdownId}`);
    errorElement.innerHTML = message;
    errorElement.style.display = "inline";
    document.getElementById(dropdownId).disabled = true;
  }

  function hidePlayerError(dropdownId) {
    const errorElement = document.getElementById(`error-${dropdownId}`);
    errorElement.style.display = "none";
    document.getElementById(dropdownId).disabled = false;
  }

  function filterPlayers(searchText, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const players = allPlayers[dropdownId];
    const selectedPlayers = Array.from(
      document.querySelectorAll(
        `#${
          dropdownId === "dropdown-players-A"
            ? "selected-players-A"
            : "selected-players-B"
        } .player-option`
      )
    ).map((player) => player.dataset.id);
    const filteredPlayers = players.filter(
      (player) =>
        !selectedPlayers.includes(player.id) &&
        player.player_name.toLowerCase().includes(searchText.toLowerCase())
    );

    dropdown.innerHTML = "";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search players...";
    searchInput.className = "search-input";
    searchInput.value = searchText;
    searchInput.addEventListener("input", function (event) {
      filterPlayers(event.target.value, dropdownId);
    });
    dropdown.appendChild(searchInput);
    searchInput.focus(); // Keep the input field focused

    filteredPlayers.forEach((player) => {
      const playerOption = document.createElement("a");
      playerOption.href = "#";
      playerOption.className = "player-option";
      playerOption.dataset.id = player.id;
      playerOption.textContent = player.player_name;
      dropdown.appendChild(playerOption);
    });
  }

  function clearAllSelectedPlayers() {
    document.getElementById("selected-players-A").innerHTML = "";
    document.getElementById("selected-players-B").innerHTML = "";
  }

  function clearSelectedPlayers(teamId) {
    if (teamId === "team-A") {
      document.getElementById("selected-players-A").innerHTML = "";
    } else if (teamId === "team-B") {
      document.getElementById("selected-players-B").innerHTML = "";
    }
  }

  function updatePlayerSelectionEnabled() {
    const leagueSelected = document.getElementById("league-name").value;
    const teamASelected = document.getElementById("team-A").value;
    const teamBSelected = document.getElementById("team-B").value;

    if (leagueSelected && teamASelected) {
      fetchPlayers(teamASelected, "dropdown-players-A", leagueSelected);
      document.getElementById("select-player-A").disabled = false;
    } else {
      document.getElementById("select-player-A").disabled = true;
    }

    if (leagueSelected && teamBSelected) {
      fetchPlayers(teamBSelected, "dropdown-players-B", leagueSelected);
      document.getElementById("select-player-B").disabled = false;
    } else {
      document.getElementById("select-player-B").disabled = true;
    }
  }

  document.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("remove-player") ||
      event.target.closest(".remove-player")
    ) {
      const parentDiv = event.target.closest(".player-wrapper");
      const playerId =
        event.target.dataset.id ||
        event.target.closest(".remove-player").dataset.id;
      parentDiv.remove();
      arr = arr.filter((id) => id !== playerId);
      console.log(arr, "ploplo");
    }

    const dropdownA = document.getElementById("dropdown-players-A");
    const dropdownB = document.getElementById("dropdown-players-B");

    if (
      !event.target.closest("#dropdown-players-A") &&
      !event.target.closest("#select-player-A")
    ) {
      dropdownA.style.display = "none";
    }

    if (
      !event.target.closest("#dropdown-players-B") &&
      !event.target.closest("#select-player-B")
    ) {
      dropdownB.style.display = "none";
    }
  });
  document.getElementById("team-A").addEventListener("change", function () {
    clearSelectedPlayers("team-A");
    updateTeamSelects();
  });

  document.getElementById("team-B").addEventListener("change", function () {
    clearSelectedPlayers("team-B");
    updateTeamSelects();
  });

  await fetchLeagues()
  await fetchUserData();
  function checkOverlap(teamA, teamB, startDate1, existingMatches) {
    // console.log(leagueExist, "leagueche");
    const startDate = document.getElementById("match-start-date").value;

    if (!existingMatches || existingMatches.length === 0) {
      return { teamAOverlap: false, teamBOverlap: false, dateOverlap: false };
    }

    // Log team names for debugging
    // const leagueOverlap = existingMatches.some(match => match.select_league.league_name === leagueExist);
    // console.log('league Overlap:', leagueOverlap);

    const teamAOverlap = existingMatches.some(
      (match) =>
        match.select_team_A.team_name === teamA ||
        match.select_team_B.team_name === teamA
    );
    console.log("Team A Overlap:", teamAOverlap);

    const teamBOverlap = existingMatches.some(
      (match) =>
        match.select_team_A.team_name === teamB ||
        match.select_team_B.team_name === teamB
    );
    console.log("Team B Overlap:", teamBOverlap);

    const dateOverlap = existingMatches.some((match) => {
      const matchStartDateStr = match.match_start_date;
      const [year, month, day] = matchStartDateStr.split(/[- ]+/); // Assuming date is in "YYYY-MM-DD"
      const matchStartDate = `${year}-${month}-${day}`;

      const [startYear, startMonth, startDay] = startDate.split(/[- ]+/);
      const startDateObj = `${startYear}-${startMonth}-${startDay}`;

      // Check if dates and teams overlap
      const teamsOverlap =
        match.select_team_A.team_name === teamA ||
        match.select_team_B.team_name === teamA ||
        match.select_team_A.team_name === teamB ||
        match.select_team_B.team_name === teamB;

      return startDateObj === matchStartDate && teamsOverlap;
    });
    console.log("Date and Teams Overlap:", dateOverlap);

    return { teamAOverlap, teamBOverlap, dateOverlap };
  }

  document.getElementById("select-player-A").addEventListener("click", function () {
      const dropdown = document.getElementById("dropdown-players-A");
      if (!dropdown.disabled) {
        dropdown.style.display =
          dropdown.style.display === "none" ? "block" : "none";
        if (dropdown.style.display === "block") {
          const searchInput = dropdown.querySelector(".search-input");
          if (searchInput) {
            searchInput.value = ""; // Clear input field
            filterPlayers("", "dropdown-players-A"); // Reset player list
            searchInput.focus();
          }
        }
      }
    });

  document.getElementById("select-player-B").addEventListener("click", function () {
      const dropdown = document.getElementById("dropdown-players-B");
      if (!dropdown.disabled) {
        dropdown.style.display =
          dropdown.style.display === "none" ? "block" : "none";
        if (dropdown.style.display === "block") {
          const searchInput = dropdown.querySelector(".search-input");
          if (searchInput) {
            searchInput.value = ""; // Clear input field
            filterPlayers("", "dropdown-players-B"); // Reset player list
            searchInput.focus();
          }
        }
      }
    });

  // Initial fetch of leagues when DOM content is loaded

  function validateLeagueSelection() {
    const leagueSelect = document.getElementById("league-name");
    const errorSpan = document.getElementById("error-league-name");
    if (!leagueSelect || !errorSpan) {
      console.error("League selection elements not found");
      return false;
    }

    function validate() {
      if (leagueSelect.value === "") {
        errorSpan.innerHTML = "Please select a league";
        errorSpan.style.display = "inline";
        return false;
      } else {
        errorSpan.style.display = "none";
        return true;
      }
    }

    leagueSelect.addEventListener("change", validate);
    return validate();
  }

  // Validate team selection
  function validateTeamSelection() {
    const teamSelectA = document.getElementById("team-A");
    const teamSelectB = document.getElementById("team-B");
    const errorSpanA = document.getElementById("error-team-A");
    const errorSpanB = document.getElementById("error-team-B");

    function validateTeam(teamSelect, errorSpan) {
      if (!teamSelect || !errorSpan) {
        console.error("Team selection elements not found");
        return false;
      }

      function validate() {
        if (teamSelect.value === "") {
          errorSpan.innerHTML = "Please select a team";
          errorSpan.style.display = "inline";
          return false;
        } else {
          errorSpan.style.display = "none";
          return true;
        }
      }

      teamSelect.addEventListener("change", validate);
      return validate();
    }

    const validTeamA = validateTeam(teamSelectA, errorSpanA);
    const validTeamB = validateTeam(teamSelectB, errorSpanB);

    return validTeamA && validTeamB;
  }

  // Validate player selection
  // Validate player selection
  function validatePlayerSelection() {
    const teamASelected = document.getElementById("team-A").value;
    const teamBSelected = document.getElementById("team-B").value;
    const errorSpanA = document.getElementById("error-players-A");
    const errorSpanB = document.getElementById("error-players-B");

    function validatePlayers(teamSelect, errorSpan, teamId) {
      if (!teamSelect || !errorSpan) {
        console.error("Team selection elements not found");
        return false;
      }

      function validate() {
        const selectedPlayers = document.querySelectorAll(
          `#selected-players-${teamId} .player-option`
        );
        if (selectedPlayers.length === 0) {
          errorSpan.innerHTML = `Please select at least one player for Team ${teamId}`;
          errorSpan.style.display = "inline";
          return false;
        } else {
          errorSpan.style.display = "none";
          return true;
        }
      }

      const playerSelect = document.getElementById(`select-player-${teamId}`);
      playerSelect.addEventListener("change", validate);
      return validate();
    }

    const validTeamA = validatePlayers(teamASelected, errorSpanA, "A");
    const validTeamB = validatePlayers(teamBSelected, errorSpanB, "B");

    return validTeamA && validTeamB;
  }

  // Validate match dates
  function validateMatchDates() {
    const startDate = document.getElementById("match-start-date");
    // const endDate = document.getElementById('match-end-date');
    const errorSpanStart = document.getElementById("error-match-start-date");
    // const errorSpanEnd = document.getElementById('error-match-end-date');

    function validateDate(dateInput, errorSpan) {
      if (!dateInput || !errorSpan) {
        console.error("Date input elements not found");
        return false;
      }

      function validate() {
        if (!dateInput.value) {
          errorSpan.innerHTML = "Please select a date";
          errorSpan.style.display = "inline";
          return false;
        } else {
          errorSpan.style.display = "none";
          return true;
        }
      }

      dateInput.addEventListener("change", validate);
      return validate();
    }

    const validStartDate = validateDate(startDate, errorSpanStart);
    // const validEndDate = validateDate(endDate, errorSpanEnd);

    return validStartDate;
  }
  function validateForm() {
    const leagueValid = validateLeagueSelection();
    const teamValid = validateTeamSelection();
    const playerValid = validatePlayerSelection();
    const datesValid = validateMatchDates();

    return leagueValid && teamValid && playerValid && datesValid;
  }
  // Fetch initial data

  async function myFetch(url, type, data) {
    try {
      let responseData;

      if (type === "GET") {
        const res = await fetch(url, {
          method: type,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          console.log("HTTP request successful");
        } else {
          console.log("HTTP request unsuccessful");
        }

        responseData = await res.json();
        return responseData.data; // Assuming the API returns data array
      } else if (type === "DELETE") {
        const res = await fetch(url, {
          method: type,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          console.log("HTTP request successful");
        } else {
          console.log("HTTP request unsuccessful");
        }

        return res;
      } else if (type === "POST" || type === "PUT") {
        const res = await fetch(url, {
          method: type,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          console.log("HTTP request successful");
        } else {
          console.log("HTTP request unsuccessful");
        }

        responseData = await res.json();
        return responseData;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      throw error; // Re-throw the error to handle it where myFetch is called
    }
  }
 

  // Function to handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();

    // Collect all necessary form data
    const leagueName = document.getElementById("league-name").value;
    const teamA = document.getElementById("team-A").value;
    const teamB = document.getElementById("team-B").value;
    const startDate = document.getElementById("match-start-date").value;


    const uniquePlayerIds = new Set(arr);
  

    // Collect selected players' names for Team A
    const selectedPlayersA = Array.from(
      document.querySelectorAll("#selected-players-A .player-option")
    ).map((player) => player.dataset.id.trim());
    console.log(selectedPlayersA, "playernameche");

    // Collect selected players' names for Team B
    const selectedPlayersB = Array.from(
      document.querySelectorAll("#selected-players-B .player-option")
    ).map((player) => player.dataset.id.trim());

    // FormData object to send via fetch
    // const formData = new FormData();
    // formData.append("select_league", leagueName);
    // formData.append("select_team_A", teamA);
    // formData.append("select_team_B", teamB);

    // newarr.forEach((playerId) => {
    //   formData.append("player_list", playerId);
    // });

    // selectedPlayersA.forEach((player) => {
    //   formData.append("select_player_A", player);
    // });
    // console.log("playernamewithid", selectedPlayersA);

    // selectedPlayersB.forEach((player) => {
    //   formData.append("select_player_B", player);
    // });

    // formData.append("match_start_date", startDate);

    const overlapResult = checkOverlap(
      teamA,
      teamB,
      startDate,
      existingMatches
    );

    // Log form data for verification
    console.log("Form data before sending:");
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });

    // Check if the form is valid
    if (validateForm()) {
     await handleOverlapAndSubmit(overlapResult, {
      select_league: leagueName,
      select_team_A: teamA,
      select_team_B: teamB,
      select_player_A: selectedPlayersA,
      select_player_B: selectedPlayersB,
      match_start_date: startDate,
      player_list: Array.from(uniquePlayerIds),
    });
    } else {
      console.log("Form validation failed. Please check all fields.");
    }
  }

  // Function to handle overlap errors and submission
  async function handleOverlapAndSubmit(overlapResult, payload) {
    console.log(overlapResult, "overlapresult");
    if (
      overlapResult.teamAOverlap &&
      overlapResult.teamBOverlap &&
      overlapResult.dateOverlap
    ) {
      document.getElementById("error-team-A").innerHTML =
        "Team-A name already exists";
      document.getElementById("error-team-A").style.display = "inline";
      document.getElementById("error-team-B").innerHTML =
        "Team-B name already exists";
      document.getElementById("error-team-B").style.display = "inline";
    } else if (overlapResult.teamAOverlap && overlapResult.dateOverlap) {
      document.getElementById("error-team-A").innerHTML =
        "Team-A name already exists";
      document.getElementById("error-team-A").style.display = "inline";
    } else if (overlapResult.teamBOverlap && overlapResult.dateOverlap) {
      document.getElementById("error-team-B").innerHTML =
        "Team-B name already exists";
      document.getElementById("error-team-B").style.display = "inline";
    } else {
      // Proceed with form submission if there are no overlap errors
      if (confirm("Are you sure you want to add this match?")) {
        showLoader()
        
        try {
          const response = await fetch("https://krinik.in/match_get/", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            // body:formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to submit match data: ${response.status} ${response.statusText} - ${errorText}`
            );
          }
          showDynamicAlert("Match Added Successfully !!")
          if (response.ok) {
            await sendNotification(null, {
              title: "New Match Added!",
              body: "New match is live in the app. Check it out and join now!",
            });
            const responseData = await response.json();
            console.log("Response data:", responseData);
        }
        window.location.href = "./manage-match.html"; // Redirect on successful submission
        hideLoader()
        } catch (error) {
          console.error("Error:", error);
          showDynamicAlert1("An error occurred while submitting the match data.");
        hideLoader()

        }
      }
    }
  }

  // Add event listener to the form

  // try {
     ; // Fetch leagues initially
     
    // console.log(allUsers,"allusers")
    const form = document.querySelector("form");
    form.addEventListener("submit", handleFormSubmit);
  // } catch (error) {
  //   console.error("Error during DOMContentLoaded event:", error);
  // }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
        // Reload the page only once
        window.location.reload();
    }
  });
  refreshpage();
  window.onload = checkAdminAccess();
});

