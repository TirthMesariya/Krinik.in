import { getAdminType } from "../js/initial.js";
let todaysUserCount;
let totalUserCount;
let totalPaidAmount,totalPaidAmount1;
let totalAmountWithTds;
let totalAmountWithTds1;

let totalwalletAmount;
const adminInfo = getAdminType();
const isSuperAdmin = adminInfo?.value === "super admin";

// Change the HTML title based on the adminInfo value
if (isSuperAdmin) {
  document.title = "Super Admin Dashboard";
} else {
  document.title = "Admin Dashboard";
}
async function fetchData() {
  try {
    // Fetch user data
    const userData = await $.ajax({
      url: "https://krinik.in/user_get/",
      method: "GET",
    });

    if (userData && userData.status === "success") {
      const rankList = userData.data;
      console.log(rankList, "ranklist")
      // Get today's date in "YYYY-MM-DD" format
      // Assuming moment.js is included in your project

// Ensure moment.js is loaded

// Ensure moment.js is loaded

const today = moment();
console.log("Today's Date:", today.format("YYYY-MM-DD"));

// Calculate the start and end dates for the current week
const startOfCurrentWeek = today.clone().startOf('week'); // Current week's Sunday
const endOfCurrentWeek = today.clone().endOf('week'); // Current week's Saturday

console.log("Start of Current Week:", startOfCurrentWeek.format("YYYY-MM-DD"));
console.log("End of Current Week:", endOfCurrentWeek.format("YYYY-MM-DD"));

// Filter users based on the `date_time` field for the current week
const currentWeekUsers = rankList.filter((user) => {
  // Parse the user date using moment, considering the full "YYYY-MM-DD HH:mm:ss" format
  const userDate = moment(user.date_time, "YYYY-MM-DD HH:mm:ss");

  console.log("Parsed user date:", userDate.format("YYYY-MM-DD"));

  // Check if the userDate is within the current week range
  return userDate.isBetween(startOfCurrentWeek, endOfCurrentWeek, null, '[]');
});

console.log("Users within current week:", currentWeekUsers);

const todaysUsers = rankList.filter((user) => {
  // Parse the user date using moment, considering the full "YYYY-MM-DD HH:mm:ss" format
  const userDate = moment(user.date_time, "YYYY-MM-DD HH:mm:ss");

  console.log("Parsed user date:", userDate.format("YYYY-MM-DD"));

  // Check if the userDate is today's date, ignoring time
  return userDate.isSame(today, 'day');
});



      // Sort rankList by `date_time` in descending order (most recent first)
      const recentUsers = currentWeekUsers.sort(
        (a, b) => new Date(b.date_time) - new Date(a.date_time)
      );

      console.log(recentUsers, "okokpl");

      // Display counts
      todaysUserCount = todaysUsers.length;
      totalUserCount = rankList.length;

      // Render cards (initial without `totalPaidAmount`)
      renderCards();
      renderRecentUsersTable(recentUsers);
    } else {
      console.error("Error: Invalid user data format");
    }

    // Fetch payment data
    const paymentResponse = await fetch("https://krinik.in/payment/");
    const paymentData = await paymentResponse.json();

    if (paymentData && Array.isArray(paymentData.data)) {
      const payments = paymentData.data;
      console.log(payments)
      // Sum all `paid_amount` values
      // totalPaidAmount = payments.reduce(
         
      //   (sum, payment) => sum + payment.paid_amount,
      //   0
      // );

      totalPaidAmount1 = payments.reduce((sum, payment) => {
        return payment.payment_status === "approved" ? sum + payment.paid_amount : sum;
      }, 0);

      // console.log("Total Paid Amount:", totalPaidAmount);
      // Re-render cards to update `totalPaidAmount`

    } else {
      console.error("Error: Invalid payment data format");
    }

    const withdrawResponse = await fetch("https://krinik.in/withdraw_amount_get/");
    // const withdrawResponse1 = await fetch("https://krinik.in/user_match_get/");

    const withdrawData = await withdrawResponse.json();
    // const withdrawData1 = await withdrawResponse1.json();

    console.log("Withdraw Data:", withdrawData);
    if (withdrawData && Array.isArray(withdrawData.data)) {
      let approvedWithdrawals = withdrawData.data.filter(item => item.withdraw_status === "approved");
      console.log(approvedWithdrawals,"approvedWithdraw")
      // Sum all amount_with_tds for approved withdrawals
      if (approvedWithdrawals) {
        totalAmountWithTds = approvedWithdrawals.reduce((sum, item) => {
          return sum + (item.amount_without_tds || 0); // Handle null values
        }, 0);
        console.log(totalAmountWithTds,"approvedWithdraw")
      }
      //             console.log(withdrawData1.data)
      //             let approvedWithdrawals1 = withdrawData1.data.filter(item => item.match.match_end_status === "canceled" ).map(p => p.invest_amount).reduce((acc,curr)=> acc+ curr,0);
      // console.log(approvedWithdrawals1)
      // let 

      totalAmountWithTds1 = approvedWithdrawals.reduce((sum, item) => {
        return sum + ((item.amount_without_tds || 0) - (item.amount_with_tds || 0)); // Handle null values
      }, 0);

      // totalAmountWithTds1 = totalAmountWithTds12 + approvedWithdrawals1
      // console.log(totalAmountWithTds1)
      console.log("Total Amount with TDS (Approved Withdrawals):", totalAmountWithTds);
    } else {
      console.error("Error: Invalid withdraw data format");
    }

    // Fetch wallet data
    const walletResponse = await fetch("https://krinik.in/admin_wallet/");
    const walletData = await walletResponse.json();

    if (walletData && Array.isArray(walletData.data) && walletData.data.length > 0) {
      // Extract wallet data safely
      let totalAmount = walletData.data[0].total_amount;
      totalwalletAmount = parseFloat(totalAmount ? totalAmount : 0).toFixed(2);
      
      console.log("Total Wallet Amount:", totalwalletAmount);
    } else {
      console.error("Error: Invalid wallet data format", walletData);
    }
    
    renderCards()
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderCards() {
  const cardData = [
    { title: "Todays Register User", value: todaysUserCount || 0 },
    { title: "Total Register User", value: totalUserCount || 0 },
    { title: "Total Credits", value: totalPaidAmount1 || 0 },
    { title: "Total Debits", value: totalAmountWithTds || 0 },
    { title: "Total Wallet Amount", value: totalwalletAmount || 0 },
    { title: "Total Transactions", value: (totalPaidAmount1 || 0) + (totalAmountWithTds || 0) },
    { title: "Total TDS", value: totalAmountWithTds1 || 0 },

  ];

  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = ""; // Clear existing cards, if any

  cardData.forEach((card) => {
    const cardHTML = createCard(card.title, card.value, false); // Assume `false` for `isAdmin`
    cardContainer.innerHTML += cardHTML;
  });
}

function renderRecentUsersTable(recentUsers) {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = ""; // Clear existing rows, if any

  recentUsers.forEach((user, index) => {
    const rowHTML = createRow(
      {
        regNo: index + 1,
        regName: user.name || "N/A",
        regMobile: user.mobile_no || "N/A",
        // depNo: "N/A", // Update based on your data structure
        // depMobile: "N/A", // Update based on your data structure
        // depAmount: "N/A", // Update based on your data structure
        // depStatus: "N/A", // Update based on your data structure
        // withNo: "N/A", // Update based on your data structure
        // withMobile: "N/A", // Update based on your data structure
        // withAmount: "N/A", // Update based on your data structure
        // withStatus: "N/A", // Update based on your data structure
      },
      false
    );
    tableBody.innerHTML += rowHTML;
  });
}

function createCard(title, value, isAdmin) {
  const extraClass = isAdmin ? "blur" : ""; // Add 'blur' if it's super admin
  return `
    <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 mb-1">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-12">
              <h5 class="text-center">${title}</h5>
              <div class="mt-2 d-flex align-items-center justify-content-center">
                <span href="#" class="btn btn-primary btn-sm data-padding btn-font ${extraClass}">${value}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createRow(data, isAdmin) {
  const rowClass = isAdmin ? "blur" : ""; // Add 'blur' if it's super admin
  return `
    <tr class="${rowClass}">
      <td>${data.regNo}</td>
      <td>${data.regName}</td>
      <td>${data.regMobile}</td>
     
    </tr>
  `;
}

// Fetch data on page load
fetchData();

const style = document.createElement("style");
style.innerHTML = `
  .blur {
    filter: blur(4px);
  }
`;
document.head.appendChild(style);

// <td>${data.depNo}</td>
// <td>${data.depMobile}</td>
// <td>${data.depAmount}</td>
// <td class="status">${data.depStatus}</td>
// <td>${data.withNo}</td>
// <td>${data.withMobile}</td>
// <td>${data.withAmount}</td>
// <td class="status">${data.withStatus}</td>
