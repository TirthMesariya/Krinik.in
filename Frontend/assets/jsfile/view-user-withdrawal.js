import {checkAdminAccess,sendNotification,showDynamicAlert,showDynamicAlert1}  from "../js/initial.js"
import { showLoader,hideLoader } from "./pagerefresh.js";
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const user_id = urlParams.get("user_id");

    let updateWinning = 0;
    let array;
    var array_length = 0;
    var table_size = 10;
    var start_index = 1;
    var end_index = 0;
    var current_index = 1;
    var max_index = 0;
    let userData5
    const Approvebtn = document.getElementById("Approvebtn");
    const Rejectbtn = document.getElementById("Rejectbtn");

    const userFullName = document.getElementById("user-fullname");
    const userImageView = document.getElementById("user-image-view");
    const userMob = document.getElementById("user-mob");
    const userEmail = document.getElementById("user-email");

    const depositAmount = document.getElementById("deposit-amount");
    const bonusAmount = document.getElementById("bonus-amount");
    const referAmount = document.getElementById("refer-amount");
    const winningAmount = document.getElementById("winning-amount");
    const totalAmount = document.getElementById("total-amount");
    // const withdrawAmount = document.getElementById("withdraw-amount");
    const giftBonusButton = document.getElementById("gift-bonus-btn");
    
    const defaultBonusBtn = document.getElementById('defaultBonusBtn');
  const manualBonusInput = document.getElementById('manualBonusInput');
  const giftBonusForm = document.getElementById('gift-bonus-form');
  const giftBonusModal = document.getElementById('giftBonusModal');
  let withdrawalAmount1
  
  // When "Default Bonus" is clicked, set the value in the input field
//   defaultBonusBtn.addEventListener('click', function() {    
//     manualBonusInput.value = 1000; // Set the input value to 1000
//   });

  // Prevent the modal from closing when the form is submitted and close it manually
//   giftBonusForm.addEventListener('submit',async function(e) {
//      // Prevent the form from submitting normally
//     // Close the modal after submitting the form
//     if (confirm("Are you sure you want to approve it?")) {
//         const currentWalletAmount = parseFloat(totalAmount.textContent);
//         const amountWithTDS = parseFloat(userData.amount_with_tds) || 0;
       
//         // const newWalletAmount1 = currentWalletAmount - parseFloat(withdrawAmount.textContent) ;
//         const newWalletAmount1 = currentWalletAmount - amountWithTDS;
//         // const newWinningAmount2 = winningAmount1 - amountWithTDS;
     
//         const newWalletAmount = Number(newWalletAmount1) + Number(manualBonusInput.value)
     
        
//         const bonusAddAmount = parseFloat(bonusAmount.textContent) + Number(manualBonusInput.value)
        

//         await patchData(updateWinning, 0, newWalletAmount,bonusAddAmount);
//         await sendNotification(user_id, {
//             title: "Bonus Alert!",
//             body: "Congratulations! A bonus amount has been credited to your wallet. Check it out now!"
//           });
//         fetchUserData();
//     }


  
//     // Optionally, you can handle the bonus submission here
//     console.log('Bonus submitted:', manualBonusInput.value);
//   });


    async function fetchUserData() {
        try {
            if (!user_id) {
                console.warn("No player ID found in URL.");
                return;
            }

            const url = `https://krinik.in/user_get/${user_id}/`;
            const url1 = `https://krinik.in/withdraw_amount_get/user_id/${user_id}/`;
            console.log("Fetching player data from:", url);
            console.log("Fetching withdrawal data from:", url1);

            const [response, response1] = await Promise.all([fetch(url), fetch(url1)]);

            if (!response.ok || !response1.ok) {
                throw new Error("Failed to fetch data");
            }

            const userData1 = await response.json();
            const userData2 = await response1.json();

            const userData = userData1.data;
            const userData3 = userData2.data;

           
            // userData5 = Number(userData3.amount);

            //  if (userData5 === 0) {
            //     Approvebtn.disabled = true;
            //     Approvebtn.style.pointerEvents = "none";
            //     Rejectbtn.disabled = true;
            //     Rejectbtn.style.pointerEvents = "none";
            // } else {
            //     Approvebtn.disabled = false;
            //     Rejectbtn.disabled = false;

                // Approvebtn.style.pointerEvents = "auto";
            // }
            editPlayerData(userData, userData3);
        } catch (error) {
            console.error("Error fetching player data:", error);
        }
    }

    function editPlayerData(response, userdetails) {
        if (response) {
            userImageView.src = `https://krinik.in${response.image}`;
            userFullName.textContent = response.name;
            userMob.textContent = response.mobile_no;
            userEmail.textContent = response.email;
            depositAmount.textContent = response.deposit_amount;
            bonusAmount.textContent = response.bonus_amount;
            referAmount.textContent = response.referral_amount;
            winningAmount.textContent = response.winning_amount;
            totalAmount.textContent = response.wallet_amount;
            withdrawalAmount1 = response.total_withdrawal_amount
            // withdrawAmount.textContent = amount;
            const userWithdrawData = userdetails; // Store in a separate variable

            // Assuming 'userWithdrawData' is the data for the table
            array = userWithdrawData;

            filterAndDisplay()
            // updateWinning = response.winning_amount - amount;

            // const giftBonusButton = document.getElementById("gift-bonus-btn");
        // if (amount >= 5000) {
            // giftBonusButton.style.display = "block"; // Show button
        // } else {
        //     giftBonusButton.style.display = "none"; // Hide button
        // }
        } else {
            console.error("Data is not in the expected format:", response);
        }
    }
 
    

    async function patchData(winningAmountValue, walletAmountValue, idCell,bonusAddAmount,withdrawalAmount ) {
        try {
            const apiUrl1 = `https://krinik.in/withdraw_amount_get/user_id/${user_id}/id/${idCell}/`;
            const apiUrl2 = `https://krinik.in/user_get/${user_id}/`;

            // First PATCH request to update `winning_amount` and `wallet_amount`
            const response1 = await fetch(apiUrl2, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    winning_amount: winningAmountValue,
                    wallet_amount: walletAmountValue,
                    bonus_amount : bonusAddAmount,
                    total_withdrawal_amount : withdrawalAmount,
                })
            });

            if (!response1.ok) {
                throw new Error("Failed to patch winning_amount and wallet_amount in first API");
            }
            console.log("Patch for winning_amount and wallet_amount successful:", await response1.json());

            // Second PATCH request to update `amount`
            const response2 = await fetch(apiUrl1, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ withdraw_status: "approved"  })
            });

            if (!response2.ok) {
                throw new Error("Failed to patch amount in second API");
            }
            

            console.log("Patch for amount successful:", await response2.json());

            // Re-fetch data to update `totalAmount` and other fields
            fetchUserData();

        } catch (error) {
            console.error("Error patching data:", error);
        }
    }


    function filterAndDisplay() {
        console.log(array,"nitin")
        console.log(array.length)
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
        console.log(array, "oklp");
        $("table tbody").empty();
        const approvedRows = array.filter((row) => row["withdraw_status"] == "approved");
        const rejectedRows = array.filter((row) => row["withdraw_status"] == "rejected"); // Corrected typo here
        const pendingRows = array.filter((row) => row["withdraw_status"] !== "approved" && row["withdraw_status"] !== "rejected").reverse();
    
        // Reorder array: Pending rows first, then approved, then rejected
        let array1 = [...pendingRows, ...approvedRows, ...rejectedRows];
    
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
    
        for (var i = tab_start; i < tab_end; i++) {
            const showdata = array1[i];
            let isDisabled = "";
    
    // Disable the row if the status is "approved" or "rejected", but not for the first row
   
    
            const tr = $("<tr></tr>").attr("data-index", i);
    
            const noCell = $("<td></td>").text(i + 1);
            const idCell = showdata.id
            const fullNameCell = $("<td colspan='2'></td>").text(showdata["amount_without_tds"] || 0);
            const shortNameCell = $("<td colspan='2'></td>").text(showdata["tds"] || 0);
            const emailCell = $("<td colspan='2'></td>").text(showdata["amount_with_tds"] || 0);
            const statusCell = $("<td colspan='2'></td>").text(
                toCapitalizeCase(showdata["withdraw_status"] || "Pending")
            );
            const timeCell = $("<td colspan='3'></td>").text(moment(showdata["timestamp"], 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss'));
            const approveCell = $("<td></td>").html(
                `<span class="sortable approve-btn" data-id="${i}" data-set="${idCell}" style="${isDisabled}">✔</span>`
            );
    
            const rejectCell = $("<td></td>").html(
                `<span class="sortable reject-btn" data-id="${i}" data-set="${idCell}" style="${isDisabled}">❌</span>`
            );

            if (i === 0 && (showdata["withdraw_status"] === "approved" || showdata["withdraw_status"] == "rejected")) {
                isDisabled = "pointer-events: none; opacity: 0.5;";
                [
                    noCell,
                    fullNameCell,
                    shortNameCell,
                    emailCell,
                    statusCell,
                    timeCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      "pointer-events": "none",
                      "background-color": "#f0f0f0", // Light gray background
                      color: "#999", // Dull text color
                      opacity: "1", // Make it slightly transparent
                    });
                  });
            }else if(i !== 0){
                [
                    noCell,
                    fullNameCell,
                    shortNameCell,
                    emailCell,
                    statusCell,
                    timeCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      "pointer-events": "none",
                      "background-color": "#f0f0f0", // Light gray background
                      color: "#999", // Dull text color
                      opacity: "1", // Make it slightly transparent
                    });
                  });
        
            }else{
                [
                    noCell,
                    fullNameCell,
                    shortNameCell,
                    emailCell,
                    statusCell,
                    timeCell,
                    approveCell,
                    rejectCell,
                    
                  ].forEach(function (cell) {
                    cell.css({
                      // "pointer-events": "none",
                      // Light gray background
                      color: "black", // Dull text color
                      // Make it slightly transparent
                    });
                  });
            }
    
            tr.append(noCell)
              .append(fullNameCell)
              .append(shortNameCell)
              
              .append(emailCell)
              .append(timeCell)
              .append(statusCell)
              .append(approveCell)
              .append(rejectCell);
    
            $("table tbody").append(tr);
        }
    }
    
    // Event delegation for buttons
    $("table").on("click", ".approve-btn",async function () {
        const index = $(this).data("id");
        const idCell = $(this).data("set")
    console.log(idCell,"idcellnn")
        // Only allow approval for the first row
        if (index !== 0) return alert("Only the first row can be approved.");
    
        const userData = array[index];
        const userData1 = array.find((p)=>p.id == idCell)
        const amountWithTDS = parseFloat(userData1.amount_without_tds) || 0;
        const currentWalletAmount = Number(parseFloat(totalAmount.textContent)) || 0;       
        const winningAmount1 = Number(parseFloat(winningAmount.textContent))
        const manualBonus = 1000;
        console.log(withdrawalAmount1,"withdrawalAmount1")
    const withdrawalAmount2 = withdrawalAmount1
        // const withdrawalAmount1 = Number(parseFloat(userData1.total_withdrawal_amount)|| 0)
        const withdrawalAmount = Number(withdrawalAmount2) + Number(amountWithTDS)
        console.log(withdrawalAmount,"withdrawalAmount")
        console.log(amountWithTDS,"amountWithTDS")

        const newWinningAmount = winningAmount1 - amountWithTDS;
            const newWalletAmount1 = currentWalletAmount - amountWithTDS;
            const newWalletAmount2 = Number(newWalletAmount1) + manualBonus
            const newWalletAmount = amountWithTDS >= 5000 ? newWalletAmount2 : newWalletAmount1
            const bonusAddAmount1 = Number(parseFloat(bonusAmount.textContent))
            console.log(bonusAddAmount1,"bonusAddAmount1")
            const bonusAddAmount2 = bonusAddAmount1 + manualBonus
            console.log(bonusAddAmount2,"bonusAddAmount2")

            const bonusAddAmount = amountWithTDS >= 5000 ? bonusAddAmount2 : bonusAddAmount1
            console.log(bonusAddAmount,"bonusAddAmount")
        

        // const idCell = userData.id;  
        if (amountWithTDS > winningAmount1) {
            showDynamicAlert1("Withdraw amount exceeds the winning amount. Approval denied.");
            return;
        }
        if(amountWithTDS >= 5000){
            // e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('giftBonusModal'));
        modal.show();

        $("#gift-bonus-form").off("submit").on("submit", async function (e) {
            e.preventDefault(); 

            // setTimeout(() => {
                 // Show the loader with a delay (optional)
            // }, 100);
            
            // Perform the redirect and handle loader visibility
            // Promise.resolve()
            //     .then(async() => {
                    if (confirm("Are you sure you want to approve it?")) {
                        showLoader();
                        console.log(Number(manualBonusInput.value))
                      console.log(bonusAddAmount,"bonus",newWalletAmount,"newwalletAmount",newWinningAmount ,"newWinningAmount")
                        await patchData(newWinningAmount, newWalletAmount, idCell,bonusAddAmount,withdrawalAmount );
                
                        // await patchData(updateWinning, 0, newWalletAmount,bonusAddAmount);
                        showDynamicAlert("Approved Successfully !!")
        
        
                        await sendNotification(user_id, {
                            title: "Withdrawal Request Accepted!",
                            body: `Your withdrawal request has been successfully accepted, and an amount of ${amountWithTDS} has been credited to your wallet!`
                          });
                        await sendNotification(user_id, {
                            title: "Bonus Alert!",
                            body: `Congratulations! A bonus amount of ${manualBonus} has been credited to your wallet. Check it out now!`
                          });
                          fetchUserData();
                          modal.hide();
                          hideLoader()
                    }
                // })
                // .then(() => {
                //     hideLoader(); // Hide the loader after the redirect
                // })
                // .catch((err) => {
                //     console.error("An error occurred during the redirect:", err);
                //     hideLoader(); // Ensure loader hides if an error occurs
                // });
            // } else {
            // console.error("No redirect function provided.");
            // hideLoader()         


        })

            
        }

        if(amountWithTDS < 5000){
            // setTimeout(() => {
                // }, 100);
                
                // Perform the redirect and handle loader visibility
                Promise.resolve()
                .then(async() => {
                    if (confirm("Are you sure you want to approve it?")) {
                        showLoader(); // Show the loader with a delay (optional)
                        // Mark as approved
                      console.log(bonusAddAmount,"bonus",newWalletAmount,"newwalletAmount",newWinningAmount ,"newWinningAmount")
        
                        await patchData(newWinningAmount, newWalletAmount, idCell,bonusAddAmount ,withdrawalAmount);
                        // alert("Approved successfully!");
                      showDynamicAlert("Approved Successfully !!")
            
                      await sendNotification(user_id, {
                          title: "Withdrawal Request Accepted!",
                          body: "Your withdrawal request has been successfully accepted. The amount is credited to your wallet!."
                        });
                        fetchUserData();
                        hideLoader()
                              
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
            // hideLoader()


           
        }
    
    });

    // $("table").on("click", ".approve-btn", async function () {
    //     const index = $(this).data("id");
    //     const idCell = $(this).data("set");
    //     console.log(idCell, "idCell");
    
    //     if (index !== 0) return alert("Only the first row can be approved.");
    
    //     const userData1 = array.find((p) => p.id == idCell);
    //     const amountWithTDS = parseFloat(userData1.amount_without_tds) || 0;
    //     const currentWalletAmount = Number(parseFloat(totalAmount.textContent)) || 0;
    //     const winningAmount1 = Number(parseFloat(winningAmount.textContent));
    //     const manualBonus = 1000;
    
    //     const newWinningAmount = winningAmount1 - amountWithTDS;
    //     const newWalletAmount1 = currentWalletAmount - amountWithTDS;
    //     const newWalletAmount = amountWithTDS >= 5000
    //         ? newWalletAmount1 + manualBonus
    //         : newWalletAmount1;
    
    //     const bonusAddAmount1 = Number(parseFloat(bonusAmount.textContent));
    //     const bonusAddAmount = amountWithTDS >= 5000
    //         ? bonusAddAmount1 + manualBonus
    //         : bonusAddAmount1;
    
    //     console.log({ amountWithTDS, newWinningAmount, newWalletAmount, bonusAddAmount });
    
    //     if (amountWithTDS > winningAmount1) {
    //         alert("Withdraw amount exceeds the winning amount. Approval denied.");
    //         return;
    //     }
    
    //     if (amountWithTDS >= 5000) {
    //         const modal = new bootstrap.Modal(document.getElementById("giftBonusModal"));
    //         modal.show();
    
    //         $("#gift-bonus-form").off("submit").on("submit", async function (e) {
    //             e.preventDefault();
    //             if (confirm("Are you sure you want to approve it?")) {
    //                 console.log("Bonus:", bonusAddAmount, "New Wallet Amount:", newWalletAmount, "New Winning Amount:", newWinningAmount);
    
    //                 await patchData(newWinningAmount, newWalletAmount, idCell, bonusAddAmount);
    
    //                 showDynamicAlert("Approved Successfully !!");
    
    //                 await sendNotification(user_id, {
    //                     title: "Withdrawal Request Accepted!",
    //                     body: "Your withdrawal request has been successfully accepted. The amount is credited to your wallet!"
    //                 });
    //                 await sendNotification(user_id, {
    //                     title: "Bonus Alert!",
    //                     body: "Congratulations! A bonus amount has been credited to your wallet. Check it out now!"
    //                 });
    //                 fetchUserData();
    //                 modal.hide();
    //             }
    //         });
    //     } else {
    //         if (confirm("Are you sure you want to approve it?")) {
    //             console.log("Bonus:", bonusAddAmount, "New Wallet Amount:", newWalletAmount, "New Winning Amount:", newWinningAmount);
    
    //             await patchData(newWinningAmount, newWalletAmount, idCell, bonusAddAmount);
    
    //             showDynamicAlert("Approved Successfully !!");
    
    //             await sendNotification(user_id, {
    //                 title: "Withdrawal Request Accepted!",
    //                 body: "Your withdrawal request has been successfully accepted. The amount is credited to your wallet!"
    //             });
    //             fetchUserData();
    //         }
    //     }
    // });
    
    
    $("table").on("click", ".reject-btn",async function () {
        const index = $(this).data("id");
        const userData = array[index];
        // const userData = array[index]; // Get the data for the clicked row
        const idCell = $(this).data("set")

        const userData1 = array.find((p)=>p.id == idCell)
        const amountWithTDS = parseFloat(userData1.amount_without_tds) || 0;
        if (index !== 0) return alert("Only the first row can be approved.");
        if (Number(userData.amount) === 0) {
            showDynamicAlert("Cannot reject this request. Amount is 0.");
            return;
        }
        // setTimeout(() => {
            // Show the loader with a delay (optional)
        // }, 100);
        
        // Perform the redirect and handle loader visibility
        Promise.resolve()
            .then(async() => {
                if (confirm("Are you sure you want to reject it?")) {
                    showLoader();
                    try {
                        const apiUrl1 = `https://krinik.in/withdraw_amount_get/user_id/${user_id}/id/${idCell}/`;
                       
                        // Second PATCH request to update `amount`
                        const response2 = await fetch(apiUrl1, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ withdraw_status: "rejected"  })
                        });
            
                        if (!response2.ok) {
                            throw new Error("Failed to patch amount in second API");
                        }
                        if(response2.ok){
                            // alert(" Rejected Successfully !!")
                            showDynamicAlert("Rejected Successfully !!")
        
                            fetchUserData();
            
                            await sendNotification(user_id, {
                                title: "Withdrawal Request Rejected!",
                                body: `Your withdrawal request for the amount of ${amountWithTDS} has been rejected.`
                              });
                              
                        }
            
                        console.log("Patch for amount successful:", await response2.json());
            
                        // Re-fetch data to update `totalAmount` and other fields
                        
            
                    } catch (error) {
                        console.error("Error patching data:", error);
                    }
            
            hideLoader()
                    // showDynamicAlert("Rejected successfully!");
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

        
    });
      
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
     
    
      
      
   
      
      
      window.addEventListener('pageshow', function (event) {
        if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
            // Reload the page only once
            window.location.reload();
        }
      });
      
    

    fetchUserData();
    window.onload = checkAdminAccess();
});


