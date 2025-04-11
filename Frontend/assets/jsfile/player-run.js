

import {checkAdminAccess,sendNotification,showDynamicAlert}  from "../js/initial.js"

  
  var rankList = [];
  var array = [];
  var array_length = 0;
  var table_size = 10;
  var start_index = 1;
  var end_index = 0;
  var current_index = 1;
  var max_index = 0;
 
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');
  let NumberId = Number(id);
  console.log(typeof NumberId, NumberId, "NumberId");
  let teamData
  let matchName

  let user_match_data
  let totalMoney
  let matchIdData
  async function apiCall() {
    try {
      console.log("Starting API calls...");
  
      // Using Promise.all to execute all requests concurrently
      const [data, data1] = await Promise.all([
        $.ajax({ url: `https://krinik.in/match_get/`, method: "GET" }),
        $.ajax({ url: `https://krinik.in/player_get/`, method: "GET" }),
        // $.ajax({ url: `https://krinik.in/user_match_get/`, method: "GET" })
      ]);
  
      
      // // Accessing data properties if available
      // console.log(matchData.data);
      // console.log(userMatchData.data);
  
      // const teamData = playerData.data;
      teamData = data1.data
      console.log(teamData,"uio")
        //  let matchCheck = user_match.data
        //  console.log(matchCheck,"dataCheck");
     
  
      fetchData(NumberId,data,teamData)
  
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }
  
 
  
  // async function fetchData(NumberId,data,teamData,matchCheck) {
  //   try {    
    
        
  //     if (data && data.status === "success") {
  //       console.log(data.data);
  //       console.log(NumberId, "fit");
  
  //       // Log all IDs in the response data
  //     if(matchCheck.length > 0){
  //       console.log(matchCheck,"yes")
  //       user_match_data1 = matchCheck.filter((p) => p.match.id === NumberId )
  //       if(user_match_data1){
  //         console.log(user_match_data1)
  //         matchIdData = user_match_data1[0].match.id
  //         console.log(user_match_data1,"user_match_data1")
  //         console.log(matchIdData,"oplopl")

  //       }
  //       user_match_data = user_match_data1.filter((p)=> p.user_data.status == "block")
  //     }
  //     console.log(user_match_data,"user_match_data")

  //     if(matchCheck.length > 0){
  //     totalMoney = user_match_data.reduce((accumulator, userMatch) => {
  //         return userMatch.invest_amount + accumulator;
  //       }, 0);
  //     }
  //     console.log("Total Money:", totalMoney);
  //       // Compare the values directly
  //       let filtermatchview = data.data.find((p) => p.id === NumberId);
  //       matchName = filtermatchview.match_display_name
  //       console.log(filtermatchview,"matchName")
  //       let Players1 = filtermatchview.select_player_A.map((p)=>p)
  //       let Players2 = filtermatchview.select_player_B.map((p)=>p)
  
  //       let AllPlayers = [...Players1,...Players2]
  //       console.log(AllPlayers,"Allplayers")
  
  //       let Players12 = filtermatchview.player_list
        
  //       if (filtermatchview) {
  //         let filteredPlayers = Players12
  //    .filter(playerId => AllPlayers.some(player => player.id === playerId)) // Check if playerId exists in AllPlayers
  //    .map(playerId => teamData.find(player => player.id === playerId)); // Map to actual player data from teamData
  
  
  //         console.log(filteredPlayers, "Filtered team players (Order matches Players12)");
  //         let sortfiltereplayers = [...new Set(filteredPlayers)]
        
  //         rankList = sortfiltereplayers;
  
  //         array = rankList;
  //         filterAndDisplay();
  //       } else {
  //         console.error("No match found for the given ID.");
  //       }
  //     } else {
  //       console.error("Error: Invalid data format");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data", error);
  //   }
  // }
  async function fetchData(NumberId, data, teamData, matchCheck) {
    try {
      if (data && data.status === "success") {
        console.log(data.data);
        console.log(NumberId, "fit");
  
        // Log all IDs in the response data
        // if (matchCheck && matchCheck.length > 0) {
        //   console.log(matchCheck, "yes");
  
        //   // Filter user_match_data1 based on match.id === NumberId
        //   let user_match_data1 = matchCheck.filter((p) => p.match && p.match.id === NumberId);
          
        //   if (user_match_data1.length > 0) {
        //     console.log(user_match_data1);
        //      matchIdData = user_match_data1[0].match.id;
        //     console.log(matchIdData, "matchIdData");
  
        //     user_match_data = user_match_data1.filter((p) => p.user_data && p.user_data.status === "block");
        //   } else {
        //     console.log("No matching data found in matchCheck for the given match ID.");
        //     user_match_data = [];
        //   }
  
        //   console.log(user_match_data, "user_match_data");
  
        //   if (user_match_data.length > 0) {
        //     totalMoney = user_match_data.reduce((accumulator, userMatch) => {
        //       return userMatch.invest_amount + accumulator;
        //     }, 0);
        //   } else {
        //     totalMoney = 0;
        //   }
  
        //   console.log("Total Money:", totalMoney);
  
          // Compare the values directly to find the match in the data
          let filtermatchview = data.data.find((p) => p.id === NumberId);
          if (filtermatchview) {
            let matchName = filtermatchview.match_display_name;
            console.log(matchName, "matchName");
  
            let Players1 = filtermatchview.select_player_A.map((p) => p);
            let Players2 = filtermatchview.select_player_B.map((p) => p);
  
            let AllPlayers = [...Players1, ...Players2];
            console.log(AllPlayers, "AllPlayers");
  
            let Players12 = filtermatchview.player_list;
  
            // Filter players based on their presence in AllPlayers
            let filteredPlayers = Players12
              .filter(playerId => AllPlayers.some(player => player.id === playerId))
              .map(playerId => teamData.find(player => player.id === playerId));
  
            console.log(filteredPlayers, "Filtered team players (Order matches Players12)");
  
            // Remove duplicates (if any) and sort the players
            let sortfiltereplayers = [...new Set(filteredPlayers)];
            rankList = sortfiltereplayers;
  
            array = rankList;
            filterAndDisplay();
        //   } else {
        //     console.error("No match found for the given ID.");
        //   }
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
  
      console.log(showdata, "showData");
  
      var tr = $("<tr></tr>")
        .attr("data-player-id", showdata["id"]) // Store playerId in a data attribute
        .attr("data-match-id", showdata["team_name"].id); // Store matchId in a data attribute
  
      var noCell = $("<td></td>").text(i + 1);
      var fullNameCell = $("<td colspan='2'></td>").text(showdata["player_name"] || "");
      var shortNameCell = $("<td colspan='2'></td>").text(showdata["team_name"].team_name || "");
  
      // Use .html() to properly render the input element
    //   var inputField = $("<input>")
    //     .attr("type", "text")
    //     .attr("placeholder", "Enter Run")
    //     .addClass("run-input p-2 text-center")
    //     .on("input", function () {
    //       // Allow only digits
    //       this.value = this.value.replace(/[^0-9]/g, "");
    //     })
    //     .on("keydown", function (e) {
    //       // Check if the Enter key was pressed
    //       if (e.key === "Enter") {
    //         e.preventDefault(); // Prevent form submission
    //         // Find the next input field
    //         var nextInput = $(this).closest('tr').next('tr').find('.run-input');
    //         if (nextInput.length > 0) {
    //           nextInput.focus(); // Focus on the next input field
    //         } else{
    //           $("#submitButton").click()
    //         }
    //       }
    //     });
  
      var enterRun = $("<td class='responsive-td'></td>").append(showdata["run"] || 0);
  
      tr.append(noCell)
        .append(fullNameCell)
        .append(shortNameCell)
        .append(enterRun);
  
      $("table tbody").append(tr);
    }
  }

  window.onload = checkAdminAccess();