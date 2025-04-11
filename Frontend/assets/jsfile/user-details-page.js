import {getAdminType,sendNotification,showDynamicAlert,checkAdminAccess}  from "../js/initial.js"
import { refreshpage,showLoader,hideLoader } from "./pagerefresh.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  // const userUnlockText = document.getElementById("user-unlock-text");
let userScratchData
  console.log(id);
  const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";
const isStatusTrue = adminInfo?.status === "true";
const manualBonusInput = document.getElementById('manualBonusInput');
const giftBonusForm = document.getElementById('gift-bonus-form');
const giftBonusModal = document.getElementById('giftBonusModal');
const walletAmount = document.getElementById("wallet-amount");
const bonusAmount = document.getElementById("bonus-amount")
const depositAmount = document.getElementById("deposit-amount");
;
let userUnlockText = document.getElementById("user-unlock-text");

let statusUpdated 
  async function fetchUserData() {
    try {
      if (!id) {
        console.warn("No player ID found in URL.");
        return;
      }

      const url = `https://krinik.in/user_get/${id}/`;
      console.log("Fetching player data from:", url);

     

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch player data");
      }

      const userData1 = await response.json();
      const userData = userData1.data;
      statusUpdated = userData.status
      userScratchData = userData.scrach_list.map(p=>p.value.id);

      // const userData5 = userData.user_id;
      const newState1 = statusUpdated === "block" ? "unblock" : "block";
      userUnlockText.textContent = toCapitalizeCase(newState1);

      console.log(statusUpdated, "id che nathi");
      editPlayerData(userData);
      // const newAmounts = await addAmount(userData5);
      //  console.log(newAmounts ,"id che")
      // if (newAmounts) {
      //   document.getElementById("wallet-amount").textContent =
      //     newAmounts.totalPlayCoin;
      //   document.getElementById("winning-amount").textContent =
      //     newAmounts.totalWinningCoin;
      // }
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  }
  async function handleDeleteUser(id) {
    
    if (confirm('Are you sure you want to delete this user?')) {
      const url = `https://krinik.in/user_get/${id}/`;
      try {
        const response = await fetch(url, { method: "DELETE" });
  
        if (response.ok) {
          showDynamicAlert("User Deleted Successfully !!")
          fetchUserData();
          setTimeout(() => {
            window.location.href = "user.html";
        }, 2000); 
        } else {
          console.error("Failed to delete the league");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  }
  async function lock() {
  
    if (!userUnlockText) {
      console.error("Element with ID user-unlock-text not found");
      return;
    }
  
    // Toggle the user status
    const newState = statusUpdated === "block" ? "unblock" : "block";
    const newState1 = newState === "block" ? "unblock" : "block";
  console.log(newState,"newstate")
  console.log(newState1,"newstate1")

    try {
      const url = `https://krinik.in/user_get/${id}/`; // Updated URL
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newState }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
  
      userUnlockText.textContent = toCapitalizeCase(newState1);
      console.log(`User status updated to: ${newState1}`);
  
      const notificationMessage = newState === "block"
      ? "You have been blocked from accessing your account."
        : "You have been unblocked and can now access your account."
  
      showDynamicAlert(`User ${toCapitalizeCase(newState)} Successfully `);
  
      // Send notification to the user
      await sendNotification(id, {
        title: `${toCapitalizeCase(newState)} Alert!`,
        body: notificationMessage
      });
  
      // Refresh user data to reflect changes
      await fetchUserData();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  }
  

  async function assignRandomCouponToUser(userId) {
    if (typeof refreshpage === "function") {
      // setTimeout(() => {
          // Show the loader with a delay (optional)
      // }, 100);

      // Perform the redirect and handle loader visibility
      
            if(confirm("Are you sure to gift coupon to user?")){
              showLoader();
              const coupon = await getRandomCoupon();
              console.log(coupon,"coupon")
              if (coupon) {
                  await assignCouponToUser(userId, coupon);
              } else {
                  console.error('No coupon available to assign.');
              }
              hideLoader()
            }
         
          
  } else {
      console.error("No redirect function provided.");
      hideLoader(); // Ensure loader hides if no redirect function is provided
  }   
   
}

async function getRandomCoupon() {
  try {
      const response = await fetch('https://krinik.in/scratch_coupon_get/');
      const result = await response.json();

      if (result.status === 'success' && result.data.length > 0) {
          // Get the list of ids from the data
          const ids = result.data.map(item => item.id);

          // Generate a random index from the ids array
          const randomIndex = Math.floor(Math.random() * ids.length);

          const randomId = ids[randomIndex];  // Get the random ID
          
          // Find the coupon object with the random ID
          // const coupon = result.data.find(item => item.id === randomId);
          // console.log(coupon,"cou")
          console.log(randomId);  // Log to verify the random ID
          return randomId;  // Return the coupon with the random ID
      }
  } catch (error) {
      console.error('Error fetching scratch coupons:', error);
  }
}

async function assignCouponToUser(userId, newCoupon) {
 
  const userEndpoint = `https://krinik.in/user_get/${userId}/`;
  console.log(userEndpoint,"data cheche")

  try {
     
      // Step 3: Add the new coupon to the existing scrach_list
       userScratchData.push(newCoupon);
      
      // Step 4: Prepare the PATCH request data with the updated scratch list
      const patchData = {
          scrach_list: userScratchData
      };

      // Step 5: Send the PATCH request to update the user's scrach_list
      const response = await fetch(userEndpoint, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(patchData)
      });

      if (response.ok) {
        showDynamicAlert('Scratch Coupon assigned successfully!');
        await sendNotification(userId, {
          title: "Congratulations! 🎉",
          body: `You've received a new scratch coupon. Check your account now to reveal the surprise!`
      });
          console.log('Coupon assigned successfully!');
          const updatedUserData = await response.json();
          console.log("Updated User Data:", updatedUserData);  // log updated user data for verification
      } else {
          console.error('Failed to assign coupon:', response.statusText);
      }
  } catch (error) {
      console.error('Error assigning coupon:', error);
  }
}

async function patchData( walletAmountValue,bonusAddAmount ) {
  try {
      // const apiUrl1 = `https://krinik.in/withdraw_amount_get/user_id/${user_id}/id/${idCell}/`;
      const apiUrl2 = `https://krinik.in/user_get/${id}/`;

      // First PATCH request to update `winning_amount` and `wallet_amount`
      const response1 = await fetch(apiUrl2, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              // winning_amount: winningAmountValue,
              wallet_amount: walletAmountValue,
              bonus_amount : bonusAddAmount,
          })
      });

      if (!response1.ok) {
          throw new Error("Failed to patch winning_amount and wallet_amount in first API");
      }
      console.log("Patch for winning_amount and wallet_amount successful:", await response1.json());

  
      fetchUserData();

  } catch (error) {
      console.error("Error patching data:", error);
  }
}


  function editPlayerData(response) {
    const userFullName = document.getElementById("user-fullname");
    const userImageView = document.getElementById("user-image-view");
    const userMob = document.getElementById("user-mob");
    const userEmail = document.getElementById("user-email");
    const regTime = document.getElementById("reg-time");
   
    const referAmount = document.getElementById("refer-amount");
    // const userUnlock = document.getElementById("user-unlock-text");
    const userDelete = document.getElementById("user-delete");
    const userTransactionHistory = document.getElementById(
      "user-transaction-history"
    );
    // const userDeduction = document.getElementById("user-deduction");
    const userAddAmount = document.getElementById("user-add-amount");
    const userScratch = document.getElementById("user-scratch-gift");

    const userGameHistory = document.getElementById("user-game-history");
    const userWithdraw = document.getElementById("user-withdraw");
    // let mainId

    if (response) {
      // Update image source
      userImageView.src = `https://krinik.in${response.image}`;

      // Set form field values
      userFullName.textContent = response.name;
      userMob.textContent = `+${response.mobile_no}`;
      userEmail.textContent = response.email;
      regTime.textContent = response.date_time;
      walletAmount.textContent = response.wallet_amount;
      bonusAmount.textContent = response.bonus_amount;
      referAmount.textContent = response.referral_amount;
      depositAmount.textContent = response.deposit_amount
      // Update button states based on userUnlock text
      if (userUnlockText.textContent === "Unblock") {
        disableButton(userTransactionHistory);
        // disableButton(userDeduction);
        disableButton(userAddAmount);
        disableButton(userScratch);
        
        disableButton(userGameHistory);
        disableButton(userWithdraw);
        enableButton(userDelete);
      } else if (userUnlockText.textContent === "Block") {
        disableButton(userDelete);
        enableButton(userScratch);
        enableButton(userTransactionHistory);
        // enableButton(userDeduction);
        enableButton(userAddAmount);
        enableButton(userGameHistory);
        enableButton(userWithdraw);
      }
      if (isSuperAdmin && isStatusTrue) {
    disableButton(userTransactionHistory);
        // disableButton(userDeduction);
        // disableButton(userAddAmount);
        disableButton(userScratch);

        disableButton(userGameHistory);
        disableButton(userWithdraw);

      }

      console.log(userFullName.textContent);
    } else {
      console.error("Data is not in the expected format:", response);
    }
  }

 
  function disableButton(button) {
    button.classList.add("disabled");
    button.setAttribute("disabled", true);
    button.style.pointerEvents = "none"; // Prevent interaction
  }

  function enableButton(button) {
    button.classList.remove("disabled");
    button.removeAttribute("disabled");
    button.style.pointerEvents = "auto"; // Allow interaction
  }
  function toCapitalizeCase(str) {
    return str.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }
 
  function redirectToHistoryPage(page) {

    if (typeof refreshpage === "function") {
      setTimeout(() => {
          showLoader(); // Show the loader with a delay (optional)
      }, 100);

      // Perform the redirect and handle loader visibility
      Promise.resolve()
          .then(async() => {
            const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get("name");

    if (id) {
      window.location.href = `${page}.html?id=${id}`;
    } else {
      console.error("No player ID found in URL.");
    }
          })
          .then(() => {
              hideLoader(); // Hide the loader after the redirect
          })
          .catch((err) => {
              console.error("An error occurred during the redirect:", err);
              hideLoader(); // Ensure loader hides if an error occurs
          });
  } else {
      console.error("No redirect function provided.");
      hideLoader(); // Ensure loader hides if no redirect function is provided
  }


    
  }
  document
    .getElementById("user-unlock")
    .addEventListener("click", () => lock());
    document
    .getElementById("user-delete")
    .addEventListener("click", () => handleDeleteUser(id));
  // Event handlers for buttons
  document
    .getElementById("user-transaction-history")
    .addEventListener("click", () =>
      redirectToHistoryPage("user-transaction-history")
    );
    document
    .getElementById("user-scratch-gift")
    .addEventListener("click", () => assignRandomCouponToUser(id));
  document
    .getElementById("user-game-history")
    .addEventListener("click", () =>
      redirectToHistoryPage("user-pool-history")
    );
  document
    .getElementById("user-withdraw")
    .addEventListener("click", () =>
      redirectToHistoryPage("user-withdraw-history")
    );

 
  giftBonusForm.addEventListener('submit',async function(e) {
    e.preventDefault(); // Prevent the form from submitting normally
    // Close the modal after submitting the form
    if (typeof refreshpage === "function") {
      // setTimeout(() => {
          // Show the loader with a delay (optional)
      // }, 100);

      // Perform the redirect and handle loader visibility
      Promise.resolve()
          .then(async() => {
            if (confirm("Are you sure you want to approve it?")) {
              showLoader();
              const currentWalletAmount = parseFloat(walletAmount.textContent);
              // const amountWithTDS = parseFloat(userData.amount_with_tds) || 0;
             
              // const newWalletAmount1 = currentWalletAmount - parseFloat(withdrawAmount.textContent) ;
              // const newWalletAmount1 = currentWalletAmount - amountWithTDS;
              // const newWinningAmount2 = winningAmount1 - amountWithTDS;
           
              const newWalletAmount = Number(currentWalletAmount) + Number(manualBonusInput.value)
           
              
              const bonusAddAmount = parseFloat(bonusAmount.textContent) + Number(manualBonusInput.value)
              
        
              await patchData(newWalletAmount,bonusAddAmount);
              fetchUserData();
              showDynamicAlert("Bonus Added Successfully !!")
              await sendNotification(id, {
                title: "Bonus Alert!",
                body: "Congratulations! A bonus amount has been credited to your wallet. Check it out now!"
              });
              hideLoader();
              
          }
        
        
          const modal = new bootstrap.Modal(giftBonusModal);
          modal.hide();
          })
          // .then(() => {
          //     hideLoader(); // Hide the loader after the redirect
          // })
          // .catch((err) => {
          //     console.error("An error occurred during the redirect:", err);
          //     hideLoader(); // Ensure loader hides if an error occurs
          // });
  } else {
      console.error("No redirect function provided.");
      hideLoader(); // Ensure loader hides if no redirect function is provided
  } 


    
    // Optionally, you can handle the bonus submission here
    console.log('Bonus submitted:', manualBonusInput.value);
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
        // Reload the page only once
        window.location.reload();
        hideLoader()
  
    }
  });
  fetchUserData();
  window.onload = checkAdminAccess();
});
