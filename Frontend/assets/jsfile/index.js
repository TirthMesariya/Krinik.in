// index.js
import { redirectToPage } from './loader.js';
import { refreshpage,showLoader,hideLoader } from './pagerefresh.js';

import {createOTPModal1,createOTPModal2} from "../js/initial.js"



const loginForm = document.getElementById("login-form");
const forgetPassword = document.getElementById("forget-password");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminTypeInput = document.getElementById("admin-type");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
const errorAdminType = document.getElementById("error-admin-type");
const errorMessage = document.getElementById("error-message");


let otpModal = createOTPModal1()
let otpModal2 = createOTPModal2()


const ADMIN_TYPE_COOKIE_NAME = "adminType";

const STATUS_ADMIN = "true";
const STATUS_ADMIN1 = "false";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /.{6,}/;
const adminTypeRegex = /^(super admin|admin)$/;

function setsessionStorage(key, value, status) {
  sessionStorage.setItem(key, JSON.stringify({ value, status }));
}

function getsessionStorage(key) {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item).value : null;
}

function checksessionStorageExpiration() {
  const adminType = getsessionStorage(ADMIN_TYPE_COOKIE_NAME);

  console.log("Checking session storage:");
  console.log("Admin Type:", adminType);
  console.log("Redirected flag:", sessionStorage.getItem("redirected"));

  if (!adminType && !sessionStorage.getItem("redirected")) {
    console.log("Redirecting to index.html");
    sessionStorage.setItem("redirected", "true");
    window.location.replace("./index.html");
  } else {
    console.log("User is authenticated, removing 'redirected' flag.");
    sessionStorage.removeItem("redirected");
  }
}
function validateInput(inputId, errorId, regex, emptyMessage, invalidMessage) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  function validate() {
    const value = input.value.trim();
    if (value === "") {
      error.innerHTML = emptyMessage;
      error.style.display = "inline";
      error.style.color = "red";
      return false;
    } else if (!regex.test(value)) {
      error.innerHTML = invalidMessage;
      error.style.display = "inline";
      error.style.color = "red";
      return false;
    } else {
      error.style.display = "none";
      return true;
    }
  }

  input.addEventListener("input", validate);
  input.addEventListener("change", validate);

  return validate;
}


adminTypeInput.addEventListener("change", () => {
  if (adminTypeInput.value === "super admin") {
    document.getElementById("LoginOTP").textContent = "Login";
    document.getElementById("forget-div").style = "display:none";    

  } else {
    document.getElementById("LoginOTP").textContent = "Next";
    document.getElementById("forget-div").style = "display:block";
  }
});


let loginApi = async () => {
  try {
    const response = await fetch("https://krinik.in/login/");
    let data1 = await response.json();
    // console.log("API Data:", data1.data); // Log the fetched data for debugging
    return data1.data; // return the data array for validation
  } catch (error) {
    console.error("Error during loginApi:", error);
    return null; // Handle error and return null if API call fails
  }
};

forgetPassword.addEventListener("click", ()=>{
  otpModal2.show();
})



loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent form from submitting by default

  // setTimeout(() => {
    showLoader(); // Show the loader with a delay (optional, you can adjust the delay time)
  // }, 1000);
  // Get form inputs
  let email = document.getElementById("email").value.trim(); // Trim to avoid extra spaces
  let password = document.getElementById("password").value.trim();
  let adminType = document.getElementById("admin-type").value.trim();


  // Form validation
  const validateEmail = validateInput(
    "email",
    "error-email",
    emailRegex,
    "Email is required",
    "Invalid email address"
  );
  const validatePassword = validateInput(
    "password",
    "error-password",
    passwordRegex,
    "Password is required",
    "Password must be at least 6 characters long"
  );
  const validateAdminType = validateInput(
    "admin-type",
    "error-admin-type",
    adminTypeRegex,
    "Admin type is required",
    "Invalid admin type"
  );

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isAdminTypeValid = validateAdminType();

  // Stop submission if any validation fails
  if (!isEmailValid || !isPasswordValid || !isAdminTypeValid) {
    console.log("Validation failed: Check the form inputs");
    hideLoader();
    return;
  }

  // Fetch login data from API
  const loginData = await loginApi();
  if (!loginData) {
    console.error("Unable to fetch login data from the API");
    hideLoader();
    return;
  }

 
  const matchingEmail = loginData.find(user => user.email == email);
const matchingPassword = loginData.find(user => user.password == password && user.email == email );
const matchingAdminType = loginData.find(user => user.admin_type == adminType && user.email == email);



  if (!matchingEmail && !matchingPassword && !matchingAdminType) {
    document.getElementById("error-email").textContent = "Invalid email";
    document.getElementById("error-email").style = "display:inline; color:red";
    document.getElementById("error-password").textContent = "Invalid password";
    document.getElementById("error-password").style = "display:inline; color:red";
    document.getElementById("error-admin-type").textContent = "Invalid admin type";
    document.getElementById("error-admin-type").style = "display:inline; color:red";
  
  // Condition 2: Email and password don't match, but admin type matches
  } else if (!matchingEmail && !matchingPassword && matchingAdminType) {
    document.getElementById("error-email").textContent = "Invalid email or password";
    document.getElementById("error-email").style = "display:inline; color:red";
    document.getElementById("error-password").textContent = "Invalid email or password";
    document.getElementById("error-password").style = "display:inline; color:red";
  
  // Condition 3: Email doesn't match, but password and admin type match
  } else if (!matchingEmail && matchingPassword && matchingAdminType) {
    document.getElementById("error-email").textContent = "Invalid email";
    document.getElementById("error-email").style = "display:inline; color:red";
  
  // Condition 4: Email matches, but password and admin type don't match
  } else if (matchingEmail && !matchingPassword && !matchingAdminType) {
    document.getElementById("error-password").textContent = "Invalid password";
    document.getElementById("error-password").style = "display:inline; color:red";
    document.getElementById("error-admin-type").textContent = "Invalid admin type";
    document.getElementById("error-admin-type").style = "display:inline; color:red";
  
  // Condition 5: Email and admin type match, but password doesn't match
  } else if (matchingEmail && !matchingPassword && matchingAdminType) {
    document.getElementById("error-password").textContent = "Invalid password";
    document.getElementById("error-password").style = "display:inline; color:red";
  
  // Condition 6: Email and password match, but admin type doesn't match
  } else if (matchingEmail && matchingPassword && !matchingAdminType) {
    document.getElementById("error-admin-type").textContent = "Invalid admin type";
    document.getElementById("error-admin-type").style = "display:inline; color:red";
  
  // Condition 7: All fields match (successful login)
  } else if (matchingEmail && matchingPassword && matchingAdminType) {
  console.log("Login successful!");
  // sessionStorage.setItem("isLoggedIn", "true");
  try {
    if (adminType === "super admin") {
  hideLoader();

      // setsessionStorage(COOKIE_NAME, email, COOKIE_EXPIRATION_HOURS_SUPER_ADMIN, STATUS_ADMIN);
      setsessionStorage(ADMIN_TYPE_COOKIE_NAME, adminType, STATUS_ADMIN);
      redirectToPage("dashboard.html");
    } else {
  hideLoader();

      otpModal.show();
      
      // setsessionStorage(COOKIE_NAME, email, null, STATUS_ADMIN1);
      // setsessionStorage(ADMIN_TYPE_COOKIE_NAME, adminType, STATUS_ADMIN1);
      // redirectToPage("dashboard.html");

    }
  hideLoader();

  } catch (error) {
    console.error("Error during login:", error);
  }
}

hideLoader();
 
});
function erasesessionStorage(key) {
  sessionStorage.removeItem(key);
}
// Call checksessionStorageExpiration after page load to avoid premature redirects
window.addEventListener("load", () => {
  checksessionStorageExpiration();
  refreshpage()
});
  window.addEventListener('pageshow', function (event) {
  if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
  window.location.reload();  
  erasesessionStorage(ADMIN_TYPE_COOKIE_NAME);
  }
  
  });
    
  // Prevent back navigation by trapping the popstate event
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
  window.history.pushState(null, null, window.location.href);
};

// Optionally, prevent forward navigation by continuously manipulating history
// setInterval(() => {
//   window.history.pushState(null, null, window.location.href);
// }, 100);



