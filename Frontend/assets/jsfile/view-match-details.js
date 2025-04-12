import {checkAdminAccess,showDynamicAlert,sendNotification}  from "../js/initial.js"
  var rankList = [];
  var array = [];
  var array_length = 0;
  var table_size = 10;
  var start_index = 1;
  var end_index = 0;
  var current_index = 1;
  var max_index = 0;// Define end_index or calculate based on data length
  // Define end_index or calculate based on data length
  let disablePlayersA = []
  let disablePlayersB = []
 let disableplayersA
 let disableplayersB
 let selectingPlayerA
 let selectingPlayerB
  const urlParams = new URLSearchParams(window.location.search);
  const id = Number(urlParams.get('id'));
  let remainTiming = document.querySelector('#remainTiming')
  let statusShow = document.getElementById('statusShow')
  let declareResult = document.getElementById('declareResult')
  let matchCancel = document.getElementById('matchCancel')

  let matchResult = document.getElementById('matchResult')
  let totalAmountData = document.getElementById('total-amount-data')
let addingplayer1 = document.getElementById("addingplayer1")
let addingplayer2 = document.getElementsByClassName("addingplayer2")
let playerRunShow = document.getElementById("playerRun")
let userMatchData3
let userData
let userMoney
let matchId1
let matchStartDate
let defaultTime1 = new Date(); 
  let urlpooltime
  let arr = [];  // Declare arr globally if you need to use it outside the function
let userId
async function fetchUserData() {
  try {
    if (!id) {
      console.warn('No player ID found in URL.');
      return;
    }

    const urls = {
      playerData: `https://krinik.in/match_get/${id}/`,
      poolData: `https://krinik.in/pool_declare/match_id/${id}/`,
      userMatchData: `https://krinik.in/user_match_get/`,
    };

    // Fetch all data concurrently
    const [playerResponse, poolResponse, userMatchResponse] = await Promise.all([
      fetch(urls.playerData),
      fetch(urls.poolData),
      fetch(urls.userMatchData),
    ]);

    // Check if the responses are OK, otherwise throw errors
    if (!playerResponse.ok) throw new Error('Failed to fetch player data');
    if (!poolResponse.ok) {
      console.warn('No pool data found for this match ID'); // Log the warning for pool data
    }
    if (!userMatchResponse.ok) throw new Error('Failed to fetch user match data');
    playerRunShow.style = "display:none";

    // Parse the JSON data
    const playerData = await playerResponse.json();
    const poolData = poolResponse.ok ? await poolResponse.json() : null; // Only parse if successful
    const userMatchData = await userMatchResponse.json();

    const playerDataList = playerData.data;
    matchId1 = playerData.data
    // console.log(matchId,"okmatch")
    const poolDataList = poolData ? poolData.data : [];
    const userMatchList = userMatchData.data;
console.log(playerDataList,"player")
    // Process pool data if it exists
    if (poolDataList) {
      const urlpool1 = poolDataList.find((p) => p.select_match ? p.select_match.match_id == id : null);
      if (urlpool1) {
         urlpooltime = urlpool1.date_time;
        console.log('Pool Time:', urlpooltime);
      }
    }

    // Call the next function to handle player data
    fetchUserData1(playerDataList);
    userId = playerDataList.id;

    // Filter user match data
    const userMatchData2 = userMatchList.filter((p) => p.match.id ? p.match.id === id : null);
    
    userMatchData3 = userMatchData2.filter((p) => p.user_data.status === "unblock");
console.log(userMatchData3,"okok1")
    let userMatchData4 = userMatchData3.every((p)=> p.invest_amount === 0)
    if(userMatchData4){
     document.getElementById('declareResult').classList.add("disabled-row")
    //  document.getElementById('matchCancel').classList.add("disabled-row")

    }
    // If blocked data exists, call fetchData function
    if (userMatchData3) {
      
      fetchData(userMatchData3);
    }

    // Calculate user money from the blocked match data
    if (userMatchData3) {
      const userMoney = userMatchData3.reduce((total, curr) => total + curr.invest_amount, 0);
      totalAmountData.textContent = userMoney;
    }

    // Edit player data
    editPlayerData(playerDataList, urlpooltime,playerDataList);

  } catch (error) {
    console.error('Error fetching player data:', error);
  }
}


  fetchUserData();




  function editPlayerData(response,urlpooltime,playerDataList) {
    console.log(urlpooltime,"urlpooldata")
    const teamLogo1 = document.getElementById("team-logo-1");
    const teamLogo2 = document.getElementById("team-logo-2");
    const teamLogoName1 = document.getElementById("team-logo-name-1");
    const teamLogoName2 = document.getElementById("team-logo-name-2");
    const cancelMatch = playerDataList.match_end_status
    
    if (response) {
      teamLogo1.src = `https://krinik.in${response.select_team_A.team_image}`;
      teamLogo2.src = `https://krinik.in${response.select_team_B.team_image}`;

      teamLogoName1.textContent = response.select_team_A.team_name;
      teamLogoName2.textContent = response.select_team_B.team_name;

      let defaultTime = new Date();  // Current date and time
   
       matchStartDate = response.match_start_date;  // Example: "11-09-2024 17:15"
      const matchEndDate = urlpooltime ? urlpooltime : null;  // If urlpooltime is available, use it; otherwise, it's null.

      const matchDateTimeStr = matchStartDate.replace("/", "-"); // Ensures compatibility with Date parsing
    

      let matchDateTimeStrEnd = null;
      if (matchEndDate) {
        matchDateTimeStrEnd = matchEndDate.replace("/", "-"); // Ensures compatibility with Date parsing
     
      }

      // Use moment.js to parse the match start and end dates
      const formattedMatchDate = moment(matchDateTimeStr, 'DD-MM-YYYY HH:mm');  // Match start as a moment object
      let formattedMatchEndDate = null;
      if (matchDateTimeStrEnd) {
        formattedMatchEndDate = moment(matchDateTimeStrEnd, 'YYYY-MM-DD HH:mm:ss');  // Match end as a moment object
   
      }

statusShow.style.pointerEvents = "none"
      // Function to update the live countdown and status
      function updateCountdown() {
        // Get the current time
        let currentTime = moment();  // Current time as a moment object
       
        // Calculate the remaining time until match start
        let remainingTimeStart = formattedMatchDate.diff(currentTime);
        let remainingTimeEnd = formattedMatchEndDate ? formattedMatchEndDate.diff(currentTime) : null;

        // Check the current status
        if(cancelMatch == "canceled"){
          remainTiming.textContent = "Canceled";
          statusShow.textContent = "Canceled";
          matchResult.style = "display:none";
          declareResult.style = "display:none";
          matchCancel.classList.add("disabled-row");
          playerRunShow.style = "display:none";
        }
        else if (remainingTimeStart > 0) {
          // Match hasn't started yet
          statusShow.textContent = "Upcoming";
          declareResult.style = "display:none";
          matchResult.style = "display:none";
          matchCancel.classList.remove("disabled-row");
          playerRunShow.style = "display:none";

          // Convert the remaining time to a human-readable format for the countdown
          let duration = moment.duration(remainingTimeStart);
          let formattedRemainingTime = `${duration.months()} months, ${duration.days()} days, ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
          remainTiming.textContent = formattedRemainingTime;

        } else if (remainingTimeStart <= 0 && (!remainingTimeEnd || remainingTimeEnd > 0)) {
          // Match is live if either:
          // - It has started and the end time is not provided, OR
          // - It has started and the current time is between the start and end time
          matchCancel.classList.remove("disabled-row");
          statusShow.textContent = "Live";
          remainTiming.textContent = "Live";
          matchResult.style = "display:none";
          declareResult.style = "display:block";
          playerRunShow.style = "display:none";

          
        } else if (remainingTimeEnd && remainingTimeEnd <= 0) {
          // Match has ended if we have the end date and the current time is past the end date
          statusShow.textContent = "Completed";
          remainTiming.textContent = "Completed";
          declareResult.style = "display:none";
          matchResult.style = "display:block";
          matchCancel.classList.add("disabled-row");
          playerRunShow.style = "display: block";

          // document.getElementById("declareResult").addEventListener("click", () => redirectToHistoryPage('declare-result'));
          // declareResult.style = "display:none"
          document.getElementById("matchResult").addEventListener("click", () => redirectToHistoryPage('match-name'));
          document.getElementById("playerRun").addEventListener("click", () => redirectToHistoryPage('player-run'));
          
          // Stop the countdown as the match is completed
          clearInterval(countdownInterval);
        }
      }

      // Start the countdown and update every second (1000 ms)
      let countdownInterval = setInterval(updateCountdown, 1000);

      // Initial call to display countdown immediately
      updateCountdown();


     let  selectingPlayerA1 = response.select_player_A
     let selectingPlayerB1 = response.select_player_B
      // selectingPlayerA = selectingPlayerA1.map
      // selectingPlayerB = response.select_player_B
 
      // disablePlayersA = response.disable_player_A
      // disablePlayersB = response.disable_player_B
      disablePlayersA = (response.disable_player_A || []).map(player => ({
        ...player,
        disable: "disable"
      }))
    
      disablePlayersB = (response.disable_player_B || []).map(player => ({
        ...player,
        disable: "disable"
      }))
      arr = response.player_list
      console.log(arr,"arr cheb")
      selectingPlayerA = selectingPlayerA1.filter(player => 
        !disablePlayersA.some(disabledPlayer => disabledPlayer.id === player.id)
      );
      
      // Filter out disabled players from selectingPlayerB
      selectingPlayerB = selectingPlayerB1.filter(player => 
        !disablePlayersB.some(disabledPlayer => disabledPlayer.id === player.id)
      );

      let aPlayer = [...disablePlayersA, ...selectingPlayerA,]
      let bPlayer = [...disablePlayersB, ...selectingPlayerB,]

      
      displayTableRows(aPlayer, "tbody1");
      displayTableRows(bPlayer, "tbody2");
    } else {
      console.error("Data is not in the expected format:", response);
    }
  }



async function updateInvestAmount(userMatchData3, matchId) {
  console.log(userMatchData3, "okok");

  // Data to update the match status
  const updatedMatchStatus = {
      match_end_status: "canceled"
  };

  try {
      // Group data by user_id and calculate total invest_amount
      const groupedUsers = userMatchData3.reduce((acc, item) => {
          const userId = item.user_data.user_id;
          if (!acc[userId]) {
              acc[userId] = { user_id: userId, totalInvestAmount: 0, bonusAmount: 0,totalWallet : 0 };
          }
          acc[userId].totalInvestAmount += item.invest_amount || 0;
          acc[userId].bonusAmount = item.user_data.bonus_amount || 0;
          acc[userId].totalWallet = item.user_data.wallet_amount || 0;

          return acc;
      }, {});

      console.log("Grouped Users:", groupedUsers);

      // Loop through grouped users and update bonus amounts
      for (const userId in groupedUsers) {
          const userData = groupedUsers[userId];

          // Fetch current user data
//           const userResponse = await fetch(`https://krinik.in/user_get/${userId}/`);
//           const user = await userResponse.json();
// console.log(user,"userget")
          // Calculate updated bonus amount
          const updatedBonus = (userData.totalInvestAmount || 0) + (userData.bonusAmount);
          const updatedWallet = (userData.totalInvestAmount || 0) + (userData.totalWallet);

          console.log(`User ID ${userId}: Total Invest Amount = ${userData.totalInvestAmount}, Updated Bonus = ${updatedBonus}`);

          const updatedUserData = { bonus_amount: updatedBonus,wallet_amount : updatedWallet };

          // PATCH request to update user's bonus_amount
          const patchResponse = await fetch(`https://krinik.in/user_get/${userId}/`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedUserData),
          });

          const patchData = await patchResponse.json();

          if (patchData.status === 'success') {
              console.log(`Successfully updated bonus_amount for user ID ${userId}:`, patchData);
          } else {
              console.error(`Failed to update bonus_amount for user ID ${userId}:`, patchData);
          }
      }

      // Update match status to "canceled"
      const matchResponse = await fetch(`https://krinik.in/match_get/${matchId}/`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMatchStatus),
      });

      const matchData = await matchResponse.json();

      if (matchData.status === 'success') {
       
        // fetchUserData();
          console.log(`Successfully canceled the match:`, matchData);
      } else {
          console.error(`Failed to cancel the match:`, matchData);
      }

      // Fetch updated data after all updates
      console.log("All updates completed. Fetching updated data...");
     
        
     

  } catch (error) {
      console.error("An error occurred during the update process:", error);
  }
}






  document.getElementById("declareResult").addEventListener("click", () => redirectToHistoryPage('declare-result'));
 



  function displayTableRows(players, tbodyId) {
    $("#" + tbodyId).empty();

    players.forEach((player, index) => {
      const tr = $("<tr></tr>");

      const noCell = $("<td></td>").text(index + 1);
      const playerNameCell = $("<td colspan='3'></td>").text(player.player_name);
      const logoCell = $("<td class='team-logo1'></td>").html(
        player.player_image
          ? `<img src="https://krinik.in${player.player_image}" alt="" />`
          : ""
      );
      const disableCell = $("<td></td>").html(`
            <span class="material-symbols-outlined" style="color:#E20101; cursor:pointer;" onclick="handleDisable(${player.id})">
                block
            </span>
        `);
      const dis = player.disable
    

      if (dis == "disable") {
        noCell.addClass("disabled-row")
        playerNameCell.addClass("disabled-row")
        logoCell.addClass("disabled-row")
        disableCell.addClass("disabled-row")

      }
// console.log(matchStartDate,"startdate")
const [datePart, timePart] = matchStartDate.split(' ');  // ['09-01-2025', '13:35']

// Split the date part into day, month, and year
const [day, month, year] = datePart.split('-');  // ['09', '01', '2025']

// Now build the date in the YYYY-MM-DD format (ISO 8601 format)
const isoDateString = `${year}-${month}-${day}T${timePart}:00`;  // '2025-01-09T13:35:00'

// Convert the ISO string to a JavaScript Date object
const matchStartDateObj = new Date(isoDateString);
console.log(matchStartDate,"matchStartDate")
console.log(matchStartDateObj,"matchStartDateObj")
console.log(defaultTime1,"defaultTime1")

// Check if the match start date is today or in the past
if (matchStartDateObj <= defaultTime1) { 
    // noCell.addClass("disabled-row");
    // playerNameCell.addClass("disabled-row");
    // logoCell.addClass("disabled-row");
    disableCell.addClass("disabled-row");
    // addingplayer1.addClass("disabled-row")
    // addingplayer2.addClass("disabled-row")

}
if (matchStartDateObj <= defaultTime1) { 
  console.log("work")
  // Disable the button
  $("#addingplayer1").prop("disabled", true);
  $("#addingplayer2").prop("disabled", true);

} else {
  // Enable the button (in case it was previously disabled)
  $("#addingplayer1").prop("disabled", false);
  $("#addingplayer2").prop("disabled", false);

}
      tr.append(noCell)
        .append(playerNameCell)
        .append(logoCell)
        .append(disableCell);

      $("#" + tbodyId).append(tr);
    });
  }
window.handleDisable = handleDisable
//   async function handleDisable(playerId) {
//     if (confirm('Are you sure you want to disable this player?')) {
//       const matchUrl = `https://krinik.in/match_get/${id}/`;
//       try {
//         // Fetch existing match data
//         const matchResponse = await fetch(matchUrl);
//         if (!matchResponse.ok) {
//           throw new Error('Failed to fetch match data');
//         }
//         const matchData = await matchResponse.json();

//         const existingPlayersA = matchData.data.select_player_A || [];
//         const existingPlayersB = matchData.data.select_player_B || [];
//         let disablePlayersA = matchData.data.disable_player_A || [];
//         let disablePlayersB = matchData.data.disable_player_B || [];

//         const playerIndexA = existingPlayersA.findIndex(player => player.id === playerId);
//         const playerIndexB = existingPlayersB.findIndex(player => player.id === playerId);

//         if (playerIndexA !== -1) {
//           // Remove the player from existingPlayersA and update disablePlayersA
//           // const updatedPlayersA = [...existingPlayersA];
//           // const disabledPlayerA = updatedPlayersA[playerIndexA];
          


//           // disablePlayersA = [...disablePlayersA, ...disabledPlayerA];
//           const updatedPlayersA = [...existingPlayersA]; // Create a copy of existingPlayersA
// const disabledPlayerA = updatedPlayersA[playerIndexA]; // Get the player at the specified index

// // Add the player to disablePlayersA (no need to spread 'disabledPlayerA')
// disablePlayersA = [...disablePlayersA, disabledPlayerA]; // Append the player to the disablePlayersA array

// console.log(disablePlayersA, "disablePlayersA");


//           // Filter out disabled players from arr
//           const disabledIdsA = disablePlayersA.map(p => p.id);
//           arr = arr.filter(id => !disabledIdsA.includes(id));

//           // Patch the updated players list
//           const response = await fetch(matchUrl, {
//             method: 'PATCH',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               select_player_A: updatedPlayersA.map(p => p.id),
//               select_player_B: existingPlayersB.map(p => p.id),
//               disable_player_A: disablePlayersA.map(p => p.id),
//               disable_player_B: disablePlayersB.map(p => p.id),
//             }),
//           });

//           if (response.ok) {
        
//             fetchUserData();
//           } else {
//             const errorText = await response.text();
//             console.error('Failed to update player data. Status:', response.status, errorText);
//           }
//         } else if (playerIndexB !== -1) {


// // Add the player to disablePlayersA (no need to spread 'disabledPlayerA')
//           // Remove the player from existingPlayersB and update disablePlayersB
//           const updatedPlayersB = [...existingPlayersB];
//           const disabledPlayerB = updatedPlayersB[playerIndexB];

//           disablePlayersB = [...disablePlayersB, disabledPlayerB];
//           console.log(disablePlayersB, "disablePlayersB");

//           // Filter out disabled players from arr
//           const disabledIdsB = disablePlayersB.map(p => p.id);
//           arr = arr.filter(id => !disabledIdsB.includes(id));

//           // Patch the updated players list
//           const response = await fetch(matchUrl, {
//             method: 'PATCH',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               select_player_B: updatedPlayersB.map(p => p.id),
//               select_player_A: existingPlayersA.map(p => p.id),
//               disable_player_A: disablePlayersA.map(p => p.id),
//               disable_player_B: disablePlayersB.map(p => p.id),
//             }),
//           });

//           if (response.ok) {
          
//             fetchUserData();
//           } else {
//             const errorText = await response.text();
//             console.error('Failed to update player data. Status:', response.status, errorText);
//           }
//         } else {
//           console.error('Player not found in existing players');
//         }
//       } catch (error) {
//         console.error('Error removing player:', error);
//       }
//     }
//   }
async function handleDisable(playerId) {
  if (confirm('Are you sure you want to disable this player?')) {
    const matchUrl = `https://krinik.in/match_get/${id}/`; // Ensure `id` is defined or fetched

    try {
      // Fetch existing match data
      const matchResponse = await fetch(matchUrl);
      if (!matchResponse.ok) {
        throw new Error('Failed to fetch match data');
      }
      const matchData = await matchResponse.json();

      const existingPlayersA = matchData.data.select_player_A || [];
      const existingPlayersB = matchData.data.select_player_B || [];
      let disablePlayersA = matchData.data.disable_player_A || [];
      let disablePlayersB = matchData.data.disable_player_B || [];

      const playerIndexA = existingPlayersA.findIndex(player => player.id === playerId);
      const playerIndexB = existingPlayersB.findIndex(player => player.id === playerId);

      // Handle disabling player in Team A
      if (playerIndexA !== -1) {
        const updatedPlayersA = [...existingPlayersA]; // Create a copy of existingPlayersA
        const disabledPlayerA = updatedPlayersA[playerIndexA]; // Get the player at the specified index
console.log(disabledPlayerA ,"disablePlayerA")
        // Add the player to disablePlayersA
        disablePlayersA = [...disablePlayersA, disabledPlayerA]; 
        console.log(disablePlayersA, "disablePlayersA");

        // Filter out disabled players from arr (assuming 'arr' refers to some list of active player IDs)
        
        const disabledIdsA1 = disablePlayersA.map(p => p.id);
        const disabledIdsB1 = disablePlayersB.map(p => p.id);
        const disabledIdsCommon1 = [...disabledIdsA1,...disabledIdsB1]

        console.log(disabledIdsA1,"disabledIdsA1")

        // console.log()
        arr = arr.filter(id => !disabledIdsCommon1.includes(id)); // Update 'arr' properly
        // arr = arr.splice(playerIndexA, 1)
console.log(arr,"arr hai")
        // Patch the updated players list
        const response = await fetch(matchUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            select_player_A: updatedPlayersA.map(p => p.id),
            select_player_B: existingPlayersB.map(p => p.id),
            disable_player_A: disablePlayersA.map(p => p.id),
            disable_player_B: disablePlayersB.map(p => p.id),
            player_list: arr
          }),
        });

        if (response.ok) {
          await sendNotification(null, {
            title: `${disabledPlayerA.player_name} Disabled!`,
            body: `${disabledPlayerA.player_name} has been disabled for the ${matchData.data.match_display_name
} match. Stay tuned for updates.`,
          });
          fetchUserData(); // Ensure fetchUserData is defined to handle UI updates
        } else {
          const errorText = await response.text();
          console.error('Failed to update player data. Status:', response.status, errorText);
        }
      } 
      // Handle disabling player in Team B
      else if (playerIndexB !== -1) {
        const updatedPlayersB = [...existingPlayersB];
        const disabledPlayerB = updatedPlayersB[playerIndexB];

        // Add the player to disablePlayersB
        disablePlayersB = [...disablePlayersB, disabledPlayerB];
        console.log(disablePlayersB, "disablePlayersB");

        // Filter out disabled players from arr
        // const disabledIdsB = disablePlayersB.map(p => p.id);
        // console.log(disabledIdsB,"disabledIdsB")
        const disabledIdsA2 = disablePlayersA.map(p => p.id);
        const disabledIdsB2 = disablePlayersB.map(p => p.id);
        const disabledIdsCommon2 = [...disabledIdsA2,...disabledIdsB2]

        console.log(disabledIdsA2,"disabledIdsA2")

        arr = arr.filter(id => !disabledIdsCommon2.includes(id)); // Update 'arr' properly
        // arr = arr.splice(playerIndexB, 1)
        console.log(arr ,"arr")
        // Patch the updated players list
        const response = await fetch(matchUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            select_player_B: updatedPlayersB.map(p => p.id),
            select_player_A: existingPlayersA.map(p => p.id),
            disable_player_A: disablePlayersA.map(p => p.id),
            disable_player_B: disablePlayersB.map(p => p.id),
            player_list: arr
          }),
        });

        if (response.ok) {
          await sendNotification(null, {
            title: `${disabledPlayerB.player_name} Disabled!`,
            body: `${disabledPlayerB.player_name} has been disabled for the ${matchData.data.match_display_name
} match. Stay tuned for updates.`,
          });
          fetchUserData(); // Ensure fetchUserData is defined to handle UI updates
        } else {
          const errorText = await response.text();
          console.error('Failed to update player data. Status:', response.status, errorText);
        }
      } else {
        console.error('Player not found in existing players');
      }
    } catch (error) {
      console.error('Error disabling player:', error);
    }
  }
}

  async function fetchUserData1(playerDataList) {
    try {

      // userId = playerDataList.id;

      const leagueNameData = playerDataList.select_league.league_name

      const teamA = playerDataList.select_team_A.id;
      const teamB = playerDataList.select_team_B.id;
      const playersA = playerDataList.select_player_A;
      const playersB = playerDataList.select_player_B;
      disableplayersA = playerDataList.disable_player_A;
      disableplayersB = playerDataList.disable_player_B

//    

      await fetchPlayer(teamA, playersA, disableplayersA, 'playerCheckboxesA', leagueNameData); // Fetch players for Team A
      await fetchPlayer(teamB, playersB, disableplayersB, 'playerCheckboxesB', leagueNameData);
      


    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  }


   function fetchData(userdataId) {
    try {
      const result = userdataId.reduce((acc, item) => {
        const userId = item.user_data.user_id;
    
        if (!acc[userId]) {
            acc[userId] = {
                user: item.user_data,
                poolCount: 0,
                totalAmount: 0
            };
        }
    
        acc[userId].poolCount += 1;
        acc[userId].totalAmount += item.invest_amount;
    
        return acc;
    }, {});
    array = Object.values(result); 
    console.log(array,"usermoney")
       
        if (array.length) {

          filterAndDisplay(array)
        } else {
         
        }
    
      
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

  function filterAndDisplay() {
    // filterRankList();
    preLoadCalculations();
    displayIndexButtons();
    // displayTableRows();
    displayTableRows1();

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
    $("#datatable_info").text("Showing " + start_index + " to " + end_index + " of " + array_length + "users");
    $(".index_buttons ul a").removeClass("active");
    $('.index_buttons ul a').each(function () {
      if ($(this).text() == current_index) {
        $(this).addClass("active");
      }
    });
    displayTableRows1();
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

  window.prev = prev
  window.next = next
  window.indexPagination = indexPagination

  function displayTableRows1() {
    
        $("table #tbody12").empty();
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
    
        for (var i = tab_start; i < tab_end; i++) {
          var showdata = array[i];
          // var status = getStatus(showdata["start_league_date"], showdata["end_league_date"]);
    
          var tr = $("<tr></tr>");
    
           const noCell = $("<td></td>").text(i + 1);
        const userNameCell = $("<td ></td>").text(showdata.user.name || "");
        const totalAmountCell = $("<td > </td>").text(showdata.totalAmount || 0);
        const poolCountCell = $("<td ></td>").text(showdata.poolCount || 0);
    
        // Append cells to row
        tr.append(noCell)
          .append(userNameCell)
          .append(totalAmountCell)
          .append(poolCountCell);
    
    
    
          $("table #tbody12").append(tr);
        }
      }

  function redirectToHistoryPage(page) {
    const urlParams = new URLSearchParams(window.location.search);
    // const name = urlParams.get('name');

    if (id) {
      window.location.href = `${page}.html?id=${id}`;
    } else {
      console.error('No player ID found in URL.');
    }
  }


  async function fetchPlayer(teamName, playersName, disablePlayers, checkboxContainerId, leagueNameData) {
    try {
      const response = await fetch('https://krinik.in/player_get/');
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }

      const userData1 = await response.json();

      if (userData1 && userData1.status === "success" && userData1.data) {
        const rankList = userData1.data;


        // Filter players by team name
        const matchingData = rankList.filter(item => item.team_name.id === teamName && item.league_name === leagueNameData);
       
        if (matchingData.length > 0) {
          // Filter out players already in playersName and those in disablePlayers
          const playerFilters = matchingData.filter(play =>
            !playersName.some(p => p.id === play.id) &&
            !disablePlayers.some(p => p.id === play.id)
          );

          const playerCheckboxes = document.getElementById(checkboxContainerId);
          playerCheckboxes.innerHTML = ''; // Clear previous checkboxes

          playerFilters.forEach(player => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            const checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            checkboxInput.className = 'form-check-input';
            checkboxInput.id = `player-${player.id}`;
            checkboxInput.value = player.id;

            const checkboxLabel = document.createElement('label');
            checkboxLabel.className = 'form-check-label';
            checkboxLabel.htmlFor = `player-${player.id}`;
            checkboxLabel.textContent = player.player_name;

            checkboxDiv.appendChild(checkboxInput);
            checkboxDiv.appendChild(checkboxLabel);

            playerCheckboxes.appendChild(checkboxDiv);

          });
        } else {
         
        }
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  }

  async function saveSelectedPlayersA() {
  // Collect selected players for Team A
  const selectedPlayersA = Array.from(document.querySelectorAll('#playerCheckboxesA input[type="checkbox"]:checked'))
    .map(checkbox => ({
      id: checkbox.value,
      player_name: checkbox.nextElementSibling.textContent
    }));

 
  // Fetch existing match data
  const matchUrl = `https://krinik.in/match_get/${id}/`;
  try {
    const matchResponse = await fetch(matchUrl);
    if (!matchResponse.ok) {
      throw new Error('Failed to fetch match data');
    }

    const matchData = await matchResponse.json();
    const existingPlayersA = matchData.data.select_player_A || [];
    const existingPlayersB = matchData.data.select_player_B || [];
    disableplayersA = matchData.data.disable_player_A;
    disableplayersB = matchData.data.disable_player_B;

    const filteredExistingPlayersA = existingPlayersA.filter(p => !disableplayersA.includes(p.id));

    // Merge existing players with new selected players (keeping order)
    const updatedPlayersA = [...filteredExistingPlayersA, ...selectedPlayersA];

    // Update arr with selected player IDs (ensure no duplicates and maintain order)
    selectedPlayersA.forEach(player => {
      // Add player ID to arr only if it's not already in arr
      if (!arr.includes(Number(player.id))) {
        arr.push(Number(player.id)); // Ensure the player ID is converted to a number before pushing
      }
    });

    // Save the updated players list for Team A
    const response = await fetch(matchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        select_player_A: updatedPlayersA.map(p => p.id),
        select_player_B: existingPlayersB.map(p => p.id),
        disable_player_A: disableplayersA.map(p => p.id),
        disable_player_B: disableplayersB.map(p => p.id),
        player_list: arr // Send the entire updated arr
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      throw new Error('Failed to save selected players for Team A');
    }

    const result = await response.json();
   


    fetchUserData();
    
  } catch (error) {
    console.error('Error saving selected players for Team A:', error);
    alert('Failed to save selected players for Team A.');
  }
}

async function saveSelectedPlayersB() {
  // Collect selected players for Team B
  const selectedPlayersB = Array.from(document.querySelectorAll('#playerCheckboxesB input[type="checkbox"]:checked'))
    .map(checkbox => ({
      id: checkbox.value,
      player_name: checkbox.nextElementSibling.textContent
    }));


  // Fetch existing match data
  const matchUrl = `https://krinik.in/match_get/${id}/`;
  try {
    const matchResponse = await fetch(matchUrl);
    if (!matchResponse.ok) {
      throw new Error('Failed to fetch match data');
    }

    const matchData = await matchResponse.json();
    const existingPlayersA = matchData.data.select_player_A || [];
    const existingPlayersB = matchData.data.select_player_B || [];
    disableplayersA = matchData.data.disable_player_A;
    disableplayersB = matchData.data.disable_player_B;

    const filteredExistingPlayersB = existingPlayersB.filter(p => !disableplayersB.includes(p.id));

    // Merge existing players with new selected players (keeping order)
    const updatedPlayersB = [...filteredExistingPlayersB, ...selectedPlayersB];

    // Update arr with selected player IDs (ensure no duplicates and maintain order)
    selectedPlayersB.forEach(player => {
      // Add player ID to arr only if it's not already in arr
      if (!arr.includes(Number(player.id))) {
        arr.push(Number(player.id)); // Ensure the player ID is converted to a number before pushing
      }
    });

   
    // Save the updated players list for Team B
    const response = await fetch(matchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        select_player_B: updatedPlayersB.map(p => p.id),
        select_player_A: existingPlayersA.map(p => p.id),
        disable_player_A: disableplayersA.map(p => p.id),
        disable_player_B: disableplayersB.map(p => p.id),
        player_list: arr // Send the entire updated arr
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save selected players for Team B');
    }

    const result = await response.json();
   

    fetchUserData();
    
  } catch (error) {
    console.error('Error saving selected players for Team B:', error);
    alert('Failed to save selected players for Team B.');
  }
}

  document.getElementById("saveSelectedPlayersBtnA").addEventListener("click", saveSelectedPlayersA);
  document.getElementById("saveSelectedPlayersBtnB").addEventListener("click", saveSelectedPlayersB);

  document.getElementById("matchCancel").addEventListener("click", async () => {
    if (userMatchData3 && confirm("Are you sure you want to cancel the match?")) {
      await sendNotification(null, {
        title: `${matchId1.match_display_name} Match Canceled!`,
  body: `A ${matchId1.match_display_name} match has been canceled. Stay tuned for updates.`,
      });
        await updateInvestAmount(userMatchData3,id);
        // fetchUserData()
        showDynamicAlert("Match Cancelled Successfully !")
        
        setTimeout(()=>(
          location.href = "manage-match.html"

        ),1000)
    } else {
        console.error("Error: userMatchData3 is not defined or empty.");
    }
});

  window.onload = checkAdminAccess();

