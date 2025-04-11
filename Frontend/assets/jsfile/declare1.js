import {checkAdminAccess,sendNotification,showDynamicAlert}  from "../js/initial.js"

  
  var rankList = [];
  var array = [];
  var array_length = 0;
  var table_size = 10;
  var start_index = 1;
  var end_index = 0;
  var current_index = 1;
  var max_index = 0;
  var otpApi 
  var otpApi2 
  let totaldataleague = document.querySelector("#total-league-data");
  let otpAdd = document.querySelector("#add-new-btn");
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');
  let NumberId = Number(id);
  let teamData
  let matchName
  let userplayerdata = []
  let user_match_data1
  let user_match_data
  let totalMoney
  let matchIdData
  async function apiCall() {
    try {
   
  
      // Using Promise.all to execute all requests concurrently
      const [data, data1, user_match] = await Promise.all([
        $.ajax({ url: `https://krinik.in/match_get/`, method: "GET" }),
        $.ajax({ url: `https://krinik.in/player_get/`, method: "GET" }),
        $.ajax({ url: `https://krinik.in/user_match_get/`, method: "GET" })
      ]);
  
      teamData = data1.data
   
         let matchCheck = user_match.data
        
     
  
      fetchData(NumberId,data,teamData,matchCheck)
  
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  async function fetchData(NumberId, data, teamData, matchCheck) {
    try {
      if (data && data.status === "success") {
       
  
        // Log all IDs in the response data
        if (matchCheck && matchCheck.length > 0) {
        
  
          // Filter user_match_data1 based on match.id === NumberId
          let user_match_data1 = matchCheck.filter((p) => p.match && p.match.id === NumberId);
          
          if (user_match_data1.length > 0) {
          
             matchIdData = user_match_data1[0].match.id;
         
  
            user_match_data = user_match_data1.filter((p) => p.user_data && p.user_data.status === "block");
          } else {
           
            user_match_data = [];
          }
  
       
  
          if (user_match_data.length > 0) {
            totalMoney = user_match_data.reduce((accumulator, userMatch) => {
              return userMatch.invest_amount + accumulator;
            }, 0);
          } else {
            totalMoney = 0;
          }
  
  
          // Compare the values directly to find the match in the data
          let filtermatchview = data.data.find((p) => p.id === NumberId);
          if (filtermatchview) {
            let matchName = filtermatchview.match_display_name;
           
  
            let Players1 = filtermatchview.select_player_A.map((p) => p);
            let Players2 = filtermatchview.select_player_B.map((p) => p);
  
            let AllPlayers = [...Players1, ...Players2];
           
  
            let Players12 = filtermatchview.player_list;
  
            // Filter players based on their presence in AllPlayers
            let filteredPlayers = Players12
              .filter(playerId => AllPlayers.some(player => player.id === playerId))
              .map(playerId => teamData.find(player => player.id === playerId));
  
            
  
            // Remove duplicates (if any) and sort the players
            let sortfiltereplayers = [...new Set(filteredPlayers)];
            rankList = sortfiltereplayers;
  
            array = rankList;
            filterAndDisplay();
          } else {
            console.error("No match found for the given ID.");
          }
        } else {
          console.error("Error: matchCheck is empty or invalid");
        }
      } else {
        console.error("Error: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }
  
  
  
  apiCall()
  
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
  
  function filterRankList() {
    
  
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
  window.prev = prev;
  window.next = next;
  window.indexPagination = indexPagination;

  
 

  function displayTableRows() {
    $("table tbody").empty();
    var tab_start = start_index - 1;
    var tab_end = end_index;
  
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
  
    // Loop through the array for the specified range
    for (var i = tab_start; i < tab_end && i < array.length; i++) {
      var showdata = array[i];
  
  
      var tr = $("<tr></tr>")
        .attr("data-player-id", showdata["id"]) // Store playerId in a data attribute
        .attr("data-match-id", showdata["team_name"].id); // Store matchId in a data attribute
  
      var noCell = $("<td></td>").text(i + 1);
      var fullNameCell = $("<td colspan='2'></td>").text(showdata["player_name"] || "");
      var shortNameCell = $("<td colspan='2'></td>").text(showdata["team_name"].team_name || "");
  
      // Use .html() to properly render the input element
      var inputField = $("<input>")
        .attr("type", "text")
        .attr("placeholder", "Enter Run")
        .addClass("run-input p-2 text-center")
        .on("input", function () {
          // Allow only digits
          this.value = this.value.replace(/[^0-9]/g, "");
        })
        .on("keydown", function (e) {
          // Check if the Enter key was pressed
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission
            // Find the next input field
            var nextInput = $(this).closest('tr').next('tr').find('.run-input');
            if (nextInput.length > 0) {
              nextInput.focus(); // Focus on the next input field
            } else{
              $("#submitButton").click()
            }
          }
        });
  
      var enterRun = $("<td class='responsive-td'></td>").append(inputField);
  
      tr.append(noCell)
        .append(fullNameCell)
        .append(shortNameCell)
        .append(enterRun);
  
      $("table tbody").append(tr);
    }
  }
  
  

  
  let matchScores = []; 
  const processPlayerData = () => {
    // Initialize arrays to store player data
    const dataToPost = [];
    const userplayerdata = [];
  
    // Get all rows from the table body
    const rows = document.querySelectorAll("table tbody tr");
  
    rows.forEach((row) => {
      // Get the run value and convert it to a number
      const runInput = row.querySelector(".run-input");
      const runValue = runInput && runInput.value ? Number(runInput.value) : 0;
  
      // Get playerId and matchId from the data attributes
      const playerId = Number(row.getAttribute("data-player-id"));
      const matchId = row.getAttribute("data-match-id");
  
      // Get matchName from a data attribute or an input field
      const matchIdData1 = Number(matchIdData) ;
  
      // Create the player data objects
      const playerData = {
        player_declare: playerId,
        team_declare: matchId,
        total_run: runValue,
        select_match: matchIdData1,
      };
  
      const playerData1 = {
        player_id: playerId,
        run: runValue,
      };
  
      // Push the player data objects into their respective arrays
      dataToPost.push(playerData);
      userplayerdata.push(playerData1);
    });
 
  
    // Return or use the arrays as needed
    return { dataToPost, userplayerdata };
  };  
  
  const postAndUpdateRuns = async (dataToPost) => {
    dataToPost.forEach((data) => {
      // POST request to submit the run data to the pool_declare endpoint
      fetch('https://krinik.in/pool_declare/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Convert the playerData object to JSON string
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to post data for ${data.player_declare}`);
          }
          // let datashowing1 =  response.json();
          // let datashowing = datashowing1.data
          // console.log(datashowing,"pool_declare")

        })
        .catch((error) => {
          console.error(`Error posting data for player ${data.player_declare}:`, error);
        });
  
      // GET request to fetch the current total_run value for the player
      fetch(`https://krinik.in/player_get/${data.player_declare}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch total_run for player ${data.player_declare}`);
        }
        return response.json();
      })
      .then((responseData) => {
    
        const currentRun = responseData?.data?.total_run;
        if (typeof currentRun === 'number') {
          const updatedRun = currentRun + data.total_run;
          const playerRun = data.total_run;
    
    
          return fetch(`https://krinik.in/player_get/${data.player_declare}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total_run: updatedRun, run: playerRun }),
          });
        } else {
          console.error(`Error: Invalid total_run for player ${data.player_declare}`);
          alert(`Could not update runs for player ${data.player_declare}. Invalid data received.`);
          return Promise.reject(new Error('Invalid total_run'));
        }
      })
      .then((patchResponse) => {
        if (!patchResponse.ok) {
          throw new Error(`Failed to update total_run for player ${data.player_declare}`);
        }

      })
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        alert(error.message);
      });
    
    });
  };
  
  const updatePlayerScores = async (user_match_data, userplayerdata) => {
    try {
      // Loop through each match in user_match_data
      for (const match of user_match_data) {
        const players_score = [];
  
        // Loop through the players in the match
        for (const player of match.player) {
          // Find the corresponding player in userplayerdata using player_id
          const matchedPlayer = userplayerdata.find(p => p.player_id === player.id);
  
          if (matchedPlayer) {
            // Push the matched player data to the players_score array
            players_score.push(matchedPlayer);
          }
        }
  
        // Prepare the data object with players_score array
        const updatedData = {
          players_score: players_score  // Set players_score with the filtered players
        };
  
        // Send a PATCH request to update the players_score field
        const response = await $.ajax({
          url: `https://krinik.in/user_match_get/${match.id}`,  // API endpoint with match ID
          type: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify(updatedData),  // Send the players_score field as an array
        });
  
      }
    } catch (error) {
      console.error("Error posting player scores:", error);
      alert("Failed to submit player scores. Please try again.");
    }
  };
  
  
  const updateMatchScores = async (user_match_data1, userplayerdata) => {
      // Array to store match scores
      matchScores = [];
  
  
      // Map through matches and calculate scores asynchronously
      const matchPromises = user_match_data1.map(async (match) => {
          let totalMatchScore = 0; // Reset totalMatchScore for each match
  
          // Loop through players in the match
          match.player.forEach(player => {
              // Find corresponding player in userplayerdata using player_id
              const matchedPlayer = userplayerdata.find(p => p.player_id === player.id);
            
              if (matchedPlayer) {
                console.log(matchedPlayer,"mp")
                  // Get player's run or default to 0
                  const playerRun = matchedPlayer.run || 0;
                  let finalRun = playerRun;
  
                  // Adjust runs for captain and vice-captain
                  if (player.match_captain) {
                      finalRun = playerRun * 2; // Double the runs for captain
                  } else if (player.match_vice_captain ) {
                      finalRun = playerRun * 1.5; // 1.5x runs for vice-captain
                  }
  
                  // Add adjusted run to the total match score
                  console.log(typeof finalRun,finalRun,"final run")
                  totalMatchScore += finalRun;
              }
          });
  
         
  
          // Store the total score for this match
          matchScores.push({
              matchId: match.id,
              userIdName: match.user_data.user_id,
              pool_name: match.pool_name,
              score: totalMatchScore
          });
          // console.log(matchScores,"okok")
  
          // PATCH the total match score to the API
          try {
              await $.ajax({
                  url: `https://krinik.in/user_match_get/${match.id}`, // Update using match ID
                  type: 'PATCH',
                  contentType: 'application/json',
                  data: JSON.stringify({
                      score: totalMatchScore // Send the calculated total score
                  }),
                  success: function(response) {
                    console.log(response,"res")
                  },
                  error: function(error) { // Error handling for the AJAX call
                      console.error(`Error updating match score for match ${match.id}:`, error);
                  }
              });
          } catch (error) {
              console.error(`Failed to update score for match ${match.id}:`, error);
          }
      });
  
      // Wait for all asynchronous operations to complete
      await Promise.all(matchPromises);
  console.log(matchScores,"matchScores")
      return matchScores;
  };
  
  const matchScoring = async (user_match_data, userplayerdata) => {
    // Create an empty array to store match scores
    
  
    // Iterate over each match in user_match_data
    await Promise.all(user_match_data.map(async (match) => {
      let players_score1 = [];  // Store player details for this match
  
      // Iterate over userplayerdata to match players with the current match
      await Promise.all(userplayerdata.map(async (player) => {
        // Find the matching player in the current match
        const matchedPlayer = match.player.find(p => p.id === player.player_id);
  
        // If a match is found, push relevant details to players_score1
        if (matchedPlayer) {
          players_score1.push({
            playerId: matchedPlayer.id,
            playerName: matchedPlayer.player_name,
            isCaptain: matchedPlayer.match_captain,
            isViceCaptain: matchedPlayer.match_vice_captain
          });
    // Debugging log
        }
      }));
  
      // Check if this match already exists in matchScores
      const existingMatchScore = matchScores.find(score => score.matchId === match.id);
  
      if (existingMatchScore) {
        // If it exists, update the existing entry
        existingMatchScore.pool_name = match.pool_name;
        existingMatchScore.pool_type = match.pool_type;
        existingMatchScore.price = match.invest_amount;
        existingMatchScore.multiX = match.multi_x;
        existingMatchScore.players_details = players_score1;

  
        // Add additional data to the existing match score
        existingMatchScore.additionalData = "Updated additional data"; // Update additional field
       
      }
    }));
  
    // Return the matchScores array after processing all matches
    return matchScores;
  };
  
  const updateMatchWinningStatus = async (matchScores) => {
    // Group match scores by `pool_name`, `pool_type`, and `price`
    const groupedScores = matchScores.reduce((acc, match) => {
      const key = `${match.pool_name}-${match.pool_type}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(match);
      return acc;
    }, {});
  
  
  
    // Iterate over each group to determine the winning status
    for (const poolKey in groupedScores) {
      const poolMatches = groupedScores[poolKey];
  
      // Find the maximum score for the group
      const maxScore = Math.max(...poolMatches.map((match) => match.score));
  
      for (const match of poolMatches) {
        const winningStatus = match.score === maxScore ? "Winner" : "Contestant";
  
        // Update the local matchScores array
        const existingMatch = matchScores.find((m) => m.matchId === match.matchId);
        if (existingMatch) {
          existingMatch.winning_status = winningStatus;
        }
  
        // Send AJAX PATCH request to update the backend
        await $.ajax({
          url: `https://krinik.in/user_match_get/${match.matchId}`,
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify({ winning_status: winningStatus }),
          success: function (response) {
            // console.log(`Winning status updated successfully for match ${match.matchId}`, response);
          },
          error: function (error) {
            console.error(`Error updating winning status for match ${match.matchId}:`, error);
          },
        });
      }
    }
  
    // Return the updated match scores
    return matchScores;
  };
  
 

  const allocateMoneyToWinners = async (matchScores, totalMoney) => {

    try {
      // Step 1: Group matches by pool, type, price, and multiX
      const MoneyPay = matchScores.reduce((acc, match) => {
        if (match.winning_status === "Winner") {
          const key = `${match.pool_name}-${match.pool_type}-winner`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(match);
        }
        return acc;
      }, {});
  
    
  
      // Step 2: Identify identical player groups, including price, pool_name, and pool_type
      // let identicalPlayerGroups = Object.keys(MoneyPay).reduce((acc, poolKey) => {
      //   const matches = MoneyPay[poolKey];
  
      //   matches.forEach(match => {
      //     const matchPlayersDetails = match.players_details;
  
      //     // Create a unique identifier for player details (sorted list of playerIds)
      //     const sortedPlayerIds = matchPlayersDetails
      //       .map(player => player.playerId)
      //       .sort()
      //       .join("-"); // Create a sorted string of player IDs
  
      //     const groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}`; // Include additional properties in the unique identifier
  
      //     if (!acc[groupKey]) {
      //       acc[groupKey] = [];
      //     }
      //     acc[groupKey].push(match);
      
      //   });
      //   return acc;


      // }, {});

      // let identicalPlayerGroups = Object.keys(MoneyPay).reduce((acc, poolKey) => {
      //   const matches = MoneyPay[poolKey];
      
      //   matches.forEach(match => {
      //     const matchPlayersDetails = match.players_details;
      
      //     // Create a unique identifier for player details (sorted list of playerIds)
      //     const sortedPlayerIds = matchPlayersDetails
      //       .map(player => player.playerId)
      //       .sort()
      //       .join("-"); // Create a sorted string of player IDs
      
      //     // Identify captain and vice-captain
      //     const captains = matchPlayersDetails
      //       .filter(player => player.isCaptain)
      //       .map(player => player.playerId)
      //       .join("-");
      //     const viceCaptains = matchPlayersDetails
      //       .filter(player => player.isViceCaptain)
      //       .map(player => player.playerId)
      //       .join("-");
      
      //     // Build the groupKey based on pool type
      //     let groupKey;
      //     if (match.pool_type === "Gold") {
      //       groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}-${captains}`;
      //     } else if (match.pool_type === "Platinum") {
      //       groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}-${captains}-${viceCaptains}`;
      //     } else {
      //       groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}`;
      //     }
      
      //     // Group matches by the groupKey
      //     if (!acc[groupKey]) {
      //       acc[groupKey] = [];
      //     }
      //     acc[groupKey].push(match);
      //   });
      
      //   return acc;
      // }, {});
      
      let identicalPlayerGroups = Object.keys(MoneyPay).reduce((acc, poolKey) => {
        const matches = MoneyPay[poolKey];
    
        matches.forEach(match => {
            const matchPlayersDetails = match.players_details;
    
            // Separate players into captains, vice-captains, and others
            const captains = matchPlayersDetails
                .filter(player => player.isCaptain)
                .map(player => player.playerId)
                .sort(); // Sort captain IDs
            const viceCaptains = matchPlayersDetails
                .filter(player => player.isViceCaptain)
                .map(player => player.playerId)
                .sort(); // Sort vice-captain IDs
            const otherPlayers = matchPlayersDetails
                .filter(player => !player.isCaptain && !player.isViceCaptain)
                .map(player => player.playerId)
                .sort(); // Sort other player IDs
    
            // Combine sorted arrays into a single sorted list for uniqueness
            const sortedPlayerIds = [...captains, ...viceCaptains, ...otherPlayers].join("-");
    
            // Build the groupKey based on pool type
            let groupKey;
            if (match.pool_type === "Gold") {
                groupKey = `${match.pool_name}-${match.pool_type}-${captains.join("-")}-${otherPlayers.join("-")}`;
            } else if (match.pool_type === "Platinum") {
                groupKey = `${match.pool_name}-${match.pool_type}-${captains.join("-")}-${viceCaptains.join("-")}-${otherPlayers.join("-")}`;
            } else {
                groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}`;
            }
    
            // Group matches by the groupKey
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(match);
        });
    
        return acc;
    }, {});
    
      

        console.log(identicalPlayerGroups,"Identical player")

        const separatedPools = {
          Gold: [],
          Platinum: [],
          Silver: [],
          // Other: [] // Add other pool types as needed
      };
      
      // Step 1: Separate matches by pool type
      Object.values(identicalPlayerGroups).forEach(group => {
          group.forEach(match => {
              const poolType = match.pool_type;
      
              // Add the match to the appropriate pool type
              if (poolType === "Gold") {
                  separatedPools.Gold.push(match);
              } else if (poolType === "Platinum") {
                  separatedPools.Platinum.push(match);
              } else if (poolType === "Silver") {
                  separatedPools.Silver.push(match);
              } else {
                  separatedPools.Other.push(match);
              }
          });
      });
      
      // Step 2: Function to group matches by identical groups
      function groupMatchesByIdenticalPlayers(matches) {
          return matches.reduce((acc, match) => {
              const matchPlayersDetails = match.players_details;
      
              // Separate players into captains, vice-captains, and others
              const captains = matchPlayersDetails
                  .filter(player => player.isCaptain)
                  .map(player => player.playerId)
                  .sort(); // Sort captain IDs
              const viceCaptains = matchPlayersDetails
                  .filter(player => player.isViceCaptain)
                  .map(player => player.playerId)
                  .sort(); // Sort vice-captain IDs
              const otherPlayers = matchPlayersDetails
                  .filter(player => !player.isCaptain && !player.isViceCaptain)
                  .map(player => player.playerId)
                  .sort(); // Sort other player IDs
      
              // Combine sorted arrays into a single sorted list for uniqueness
              const sortedPlayerIds = [...captains, ...viceCaptains, ...otherPlayers].join("-");
      
              // Build the groupKey based on pool type
              let groupKey;
              if (match.pool_type === "Gold") {
                  groupKey = `${match.pool_name}-${match.pool_type}-${captains.join("-")}-${otherPlayers.join("-")}`;
              } else if (match.pool_type === "Platinum") {
                  groupKey = `${match.pool_name}-${match.pool_type}-${captains.join("-")}-${viceCaptains.join("-")}-${otherPlayers.join("-")}`;
              } else {
                  groupKey = `${sortedPlayerIds}-${match.pool_name}-${match.pool_type}`;
              }
      
              // Group matches by the groupKey
              if (!acc[groupKey]) {
                  acc[groupKey] = [];
              }
              acc[groupKey].push(match);
      
              return acc;
          }, {});
      }
      
      // Step 3: Apply grouping within each pool type
      const finalSeparatedPools = {
          Gold: groupMatchesByIdenticalPlayers(separatedPools.Gold),
          Platinum: groupMatchesByIdenticalPlayers(separatedPools.Platinum),
          Silver: groupMatchesByIdenticalPlayers(separatedPools.Silver),
          // Other: groupMatchesByIdenticalPlayers(separatedPools.Other)
      };
      
      console.log(finalSeparatedPools,"final separated");
      
        
        // Step 2: Declare and process prize money based on pool groups
        let usersData = {};
        const matchMoneyDeclare = Object.keys(finalSeparatedPools).map(async (poolType) => {
          const poolGroups = finalSeparatedPools[poolType]; // Get the groups for the pool type
          console.log(poolGroups, "poolGroups");
      
          const groupMatchesKeys = Object.keys(poolGroups); // Matches in the current group
          console.log(groupMatchesKeys, "groupMatches1");
      
          const groupMatchesLength = groupMatchesKeys.length;
          console.log(groupMatchesLength, "Group length for pool:", poolType);
      
          const groupMatches = Object.values(poolGroups);
          console.log(groupMatches, "groupMatches");
      
          // let totalMoney = 0;
      
          const matchPromises = groupMatches.map(async (matchGroup) => {
            console.log("Processing match group:", matchGroup);
      
            const matchDataPromises = matchGroup.map(async (match) => {
              let totalInvestedMoney;
      
              if (groupMatchesLength > 1) {
                totalInvestedMoney = Math.round((match.price * match.multiX) / 2);
              } else {
                totalInvestedMoney = Math.round(match.price * match.multiX);
              }
      
              console.log(`Total invested money for match ${match.matchId}:`, totalInvestedMoney);
      
              try {
                await $.ajax({
                  url: `https://krinik.in/user_match_get/${match.matchId}`,
                  type: "PATCH",
                  contentType: "application/json",
                  data: JSON.stringify({ total_amount: totalInvestedMoney }),
                });
                console.log(`Successfully patched total_amount for match ${match.matchId}`);
              } catch (error) {
                console.error(`Error patching total_amount for match ${match.matchId}:`, error);
                return;
              }
      
              try {
                const getResponse = await $.ajax({
                  url: `https://krinik.in/user_get/${match.userIdName}/`,
                  type: "GET",
                });
      
                const currentWinningAmount = Number(getResponse?.data?.winning_amount ?? 0);
                const walletAmountValue = Number(getResponse?.data?.wallet_amount ?? 0);
                const totalProfitAmount = Number(getResponse?.data?.total_profit_amount ?? 0);
      
                console.log(
                  currentWinningAmount,
                  "current wallet",
                  walletAmountValue,
                  "walletAmount",
                  totalProfitAmount,
                  "totalProfitAmount"
                );
      
                if (!usersData[match.userIdName]) {
                  usersData[match.userIdName] = {
                    currentWinningAmount,
                    walletAmountValue,
                    totalProfitAmount,
                  };
                }
      
                usersData[match.userIdName].currentWinningAmount += totalInvestedMoney;
                usersData[match.userIdName].walletAmountValue += totalInvestedMoney;
                usersData[match.userIdName].totalProfitAmount += totalInvestedMoney;
      
                console.log(
                  `Accumulated data for user ${match.userIdName}:`,
                  usersData[match.userIdName]
                );
      
                totalMoney -= totalInvestedMoney;
                console.log(`Remaining total money after processing:`, totalMoney);
              } catch (error) {
                console.error(`Error fetching user data for ${match.userIdName}:`, error);
              }
            });
      
            await Promise.all(matchDataPromises);
          });
      
          await Promise.all(matchPromises);
      
         
        });
      
        try {
          await Promise.all(matchMoneyDeclare);
          const updatePromises = Object.keys(usersData).map(async (userId) => {
            const userData = usersData[userId];
            try {
              const response = await $.ajax({
                url: `https://krinik.in/user_get/${userId}/`,
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify({
                  winning_amount: userData.currentWinningAmount,
                  wallet_amount: userData.walletAmountValue,
                  total_profit_amount: userData.totalProfitAmount,
                }),
              });
              console.log(`Updated user ${userId} successfully:`, response);
            } catch (error) {
              console.error(`Error updating user ${userId}:`, error);
            }
          });
      
          await Promise.all(updatePromises);
          console.log("All matches processed and users updated successfully!");
        } catch (error) {
          console.error("Error processing matches:", error);
        }
        
      // const matchMoneyDeclare = Object.keys(finalSeparatedPools).map(async (poolType) => {
      //   const poolGroups = finalSeparatedPools[poolType];
      //   console.log(poolGroups, "poolGroups");
      //   const groupMatches1 = Object.keys(poolGroups);
      //   console.log(groupMatches1, "groupMatches1");
      
      //   const groupMatchesLength = groupMatches1.length;
      //   console.log(groupMatchesLength, "Group length for pool:", poolType);
      
      //   const groupMatches = Object.values(poolGroups);
      
      //   // Process each group of matches
      //   const processGroupMatches = groupMatches.map(async (match1) => {
      //     console.log("Processing group match:", match1);
      
      //     // Process each match in the group
      //     const processIndividualMatches = match1.map(async (match) => {
      //       let totalInvestedMoney;
      
      //       // Calculate total invested money
      //       if (groupMatchesLength > 1) {
      //         totalInvestedMoney = Math.round((match.price * match.multiX) / 2);
      //       } else {
      //         totalInvestedMoney = Math.round(match.price * match.multiX);
      //       }
      //       console.log(`Total invested money for match ${match.matchId}:`, totalInvestedMoney);
      
      //       try {
      //         // Update match data
      //         const patchResponse = await $.ajax({
      //           url: `https://krinik.in/user_match_get/${match.matchId}`,
      //           type: "PATCH",
      //           contentType: "application/json",
      //           data: JSON.stringify({ total_amount: totalInvestedMoney }),
      //         });
      //         console.log(`Successfully patched total_amount for match ${match.matchId}:`, patchResponse);
      //       } catch (error) {
      //         console.error(`Error patching total_amount for match ${match.matchId}:`, error);
      //         return; // Skip to the next match
      //       }
      
      //       try {
      //         // Fetch user data
      //         const getResponse = await $.ajax({
      //           url: `https://krinik.in/user_get/${match.userIdName}/`,
      //           type: "GET",
      //         });
      //         console.log(`Fetched data for user ${match.userIdName}:`, getResponse);
      
      //         const currentWinningAmount = Number(getResponse?.data?.winning_amount ?? 0);
      //         const walletAmountValue = Number(getResponse?.data?.wallet_amount ?? 0);
      //         const totalProfitAmount = Number(getResponse?.data?.total_profit_amount ?? 0);
      
      //         console.log(
      //           currentWinningAmount, "currentWallet:",
      //           walletAmountValue, "walletAmount:",
      //           totalProfitAmount, "totalProfitAmount:"
      //         );
      
      //         // Calculate updated values
      //         const updatedWinningAmount = currentWinningAmount + totalInvestedMoney;
      //         const walletAmount1 = walletAmountValue + totalInvestedMoney;
      //         const totProfitAmount = totalProfitAmount + totalInvestedMoney;
      
      //         console.log(
      //           `Updated values for user ${match.userIdName}:`,
      //           updatedWinningAmount, totProfitAmount
      //         );
      
      //         // Update user data
      //         try {
      //           const updateResponse = await $.ajax({
      //             url: `https://krinik.in/user_get/${match.userIdName}/`,
      //             type: "PATCH",
      //             contentType: "application/json",
      //             data: JSON.stringify({
      //               winning_amount: updatedWinningAmount,
      //               wallet_amount: walletAmount1,
      //               total_profit_amount: totProfitAmount,
      //             }),
      //           });
      //           console.log(`Successfully updated user ${match.userIdName}:`, updateResponse);
      //         } catch (error) {
      //           console.error(`Error updating user ${match.userIdName}:`, error);
      //         }
      //       } catch (error) {
      //         console.error(`Error fetching user data for ${match.userIdName}:`, error);
      //         return; // Skip to the next match
      //       }
      
      //       // Deduct the total invested money
      //       totalMoney -= totalInvestedMoney;
      //       console.log(`Remaining total money:`, totalMoney);
      //     });
      
      //     // Wait for all individual matches in the group to complete
      //     await Promise.all(processIndividualMatches);
      //   });
      
      //   // Wait for all groups in the pool to complete
      //   await Promise.all(processGroupMatches);
      // });
      
      // // Wait for all pools to complete
      // await Promise.all(matchMoneyDeclare);
      
      // console.log("All matches and pools have been processed successfully.");
      
    
      
  
    
  
      // Step 7: Fetch the current balance in admin wallet
      let currentWalletBalance = 0;
      let currentAdminId;
      await $.ajax({
        url: `https://krinik.in/admin_wallet/`,
        type: "GET",
        success: (response) => {
          if (response.status === "success" && response.data?.length > 0) {
            currentAdminId = response.data[0].id;
            currentWalletBalance = response.data[0].total_amount;
 
          } else {
            console.error("Invalid response format or no data available in admin wallet response.");
          }
        },
        error: (error) => {
          console.error("Error fetching current admin wallet balance:", error);
        },
      });
  
      // Step 8: Calculate and update the new admin wallet balance
      const updatedWalletBalance = currentWalletBalance + totalMoney;
      await $.ajax({
        url: `https://krinik.in/admin_wallet/${currentAdminId}/`,
        type: "PATCH",
        contentType: "application/json",
        data: JSON.stringify({
          total_amount: updatedWalletBalance,
        }),
        success: (response) => {

        },
        error: (error) => {
          console.error("Error updating admin wallet balance:", error);
        },
      });
      
     
    } catch (error) {
      console.error("Error during money allocation process:", error);
    }
  };
  
  

  // const fetchUserMatchData = async () => {
  //   try {
  //     const response = await fetch(`https://krinik.in/user_match_get/`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch match data");
  //     }
  //     return await response.json(); // Returns the user match data
  //   } catch (error) {
  //     console.error("Error fetching match data:", error);
  //     return null;
  //   }
  // };

  function handleSubmitButton(submitButtonSelector, inputSelector, postDataCallback) {
    $(submitButtonSelector).on("click", function (e) {
      e.preventDefault();
  
      // Check if all input fields are filled
      let allFilled = true;
  
      $(inputSelector).each(function () {
        if ($(this).val().trim() === "") {
          allFilled = false;
          return false; // Exit the loop early if a field is empty
        }
      });
  
      if (!allFilled) {
        alert("Please fill in all the run inputs before submitting.");
        return; // Do not proceed with the submission
      }
  
      // Show loader
      // postDataCallback()
      showDynamicAlert("Match result declare successfully");
      
      // Call the postData callback if validation passes
      if (typeof postDataCallback === "function") {
        setTimeout(() => {
          showLoader();
      }, 2000);
        
        // Execute the callback and handle the loader visibility
        Promise.resolve(postDataCallback())
          .then(() => {
            hideLoader(); // Hide the loader on success
          })
          .catch((err) => {
            console.error("An error occurred:", err);
            hideLoader(); // Ensure loader hides even on error
          });
      } else {
        console.error("No postData callback function provided.");
        hideLoader(); // Ensure loader hides if no callback is provided
      }
    });
  }
  
  // Loader control functions
  function showLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('content').style.display = 'none';

}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}
  
  
  
  const postData = async () => {
    // Step 1: Process player data
    const { dataToPost, userplayerdata } = processPlayerData(); // Get dataToPost and userplayerdata
  
    if (dataToPost.length > 0) {
    // Step 2: Post and update runs
    await postAndUpdateRuns(dataToPost); // Pass dataToPost to postAndUpdateRuns
  
    // Step 3: Fetch user match data from API
    try {
      const response = await fetch(`https://krinik.in/user_match_get/`); // Adjust API URL
      if (!response.ok) {
        throw new Error("Failed to fetch match data");
      }
  
      const userMatchData = await response.json(); // Assume it returns an array of matches
     
      // let user_match_data1 = [];
      // if (userMatchData && Array.isArray(userMatchData.data)) {
      //  let user_match_data2 = userMatchData.data.filter((match) => match.match.id === NumberId);
      //   user_match_data1 = user_match_data2.filter((p)=> p.user_data.status == "unblock")
      // }
      let user_match_data1 = [];

if (userMatchData?.data?.length) {
  user_match_data1 = userMatchData.data.filter(
    (match) => match.match.id === NumberId && match.user_data.status === "unblock"
  );
}
  
      // Step 5: Update match scores
      if (user_match_data1) {
        
        await updatePlayerScores(user_match_data1, userplayerdata); 
        const matchScores = await updateMatchScores(user_match_data1, userplayerdata);
         
  
          // Step 5.2: Call matchScoring to update global matchScores and perform additional processing
          if (matchScores) {
            const updatedMatchScores = await matchScoring(user_match_data1, userplayerdata);
           
            if(updateMatchScores){
  
             const updatedWinner =  await updateMatchWinningStatus(updatedMatchScores); // Use updatedMatchScores from the previous step
             
  
              if(updatedWinner){
                await allocateMoneyToWinners(updatedWinner, totalMoney); // Pass the updated match scores and totalMoney to allocate
               
                await sendNotification(null, {
                   title: "Result Declared!",
                   body: "The results are out! Check the app to see if you’re a winner!"
               });
                 // window.location.href = "./match-name.html"
                 window.location.href = `match-name.html?id=${id}`
              }
            }
          }
        } else {
          console.error("Invalid match data fetched from API");
        }
     
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    } else {
      console.error("No data to post");
    }
  };
  
 
  
  window.onload = checkAdminAccess();
  $(document).ready(function() {
    
    handleSubmitButton("#submitButton", ".run-input", postData);
  });
  
  // $("#submitButton").on("click", function(e) {
  //   e.preventDefault();

  //   // Check if all input fields are filled
  //   var allFilled = true;

  //   $(".run-input").each(function() {
  //     if ($(this).val().trim() === "") {
  //       allFilled = false;
  //       return false; // Exit the loop early if a field is empty
  //     }
  //   });

  //   if (!allFilled) {
  //     alert("Please fill in all the run inputs before submitting.");
  //     return; // Do not proceed with the submission
  //   }
  //   // postRunData(); // Call the function to post data
  //   postData()
  // });
  
  