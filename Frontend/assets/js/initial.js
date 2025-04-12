export function initializePage() {
  console.log("Initializing page...");
  const elements = document.querySelectorAll(
    "button, input, select, textarea, a, li, div, th, td, span, i"
  );
  console.log("Elements found:", elements);
  const adminType = JSON.parse(sessionStorage.getItem("adminType"));
  // console.log(adminType.value)

  if (adminType.value === "admin") {
    elements.forEach((element) => {
      if (element.classList.contains("otp-exempt")) {
        element.style.display = "block";
      }
    });
  } else {
    elements.forEach((element) => {
      if (element.classList.contains("otp-exempt")) {
        element.style.display = "none";
      }
    });
  }

}

// export function showDynamicAlert(message) {
//   // Create alert element dynamically
//   const alertBox = document.createElement('div');
//   alertBox.className = 'custom-alert';
//   alertBox.textContent = message;

//   // Append alert to the body
//   document.body.appendChild(alertBox);

//   // Remove the alert after 5 seconds
//   setTimeout(() => {
//     alertBox.remove();
//   }, 5000);
// }

export function showDynamicAlert(message) {
  Swal.fire({
    position: "center", // Default: top-end
    icon: "success", // Default: success
    title: message, // Default: Operation completed
    showConfirmButton: false,
    timer: 2000,
    zindex: 2001,
  });
}
export function showDynamicAlert1(message) {
  Swal.fire({
    position: "center",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 2000,
    // zindex: 5000,
  });
}
export function showDynamicAlert2(message) {
  Swal.fire({
    position: "center",
    icon: "info",
    title: message,
    showConfirmButton: false,
    timer: 2000,
    // zindex: 5000,
  });
}



// Function to check if the user is a super admin
export function getAdminType() {
  const adminType = JSON.parse(sessionStorage.getItem("adminType"));

  // Check if adminType exists and return the adminType object
  if (adminType) {
    return {
      key: Object.keys(adminType),
      value: adminType.value,
      status: adminType.status,
    };
  }

  return { key: null, value: null, status: null }; // Return null if adminType does not exist
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMIXxBISZnryQeOgKRs73TqVRXkshd0KM",
  authDomain: "krinkin-309ee.firebaseapp.com",
  projectId: "krinkin-309ee",
  storageBucket: "krinkin-309ee.appspot.com",
  messagingSenderId: "397386970252",
  appId: "1:397386970252:web:9655f412b4280a036d77a9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export function createOTPModal() {
  // Modal HTML structure
  const otpModalHTML = `
  <div id="otpModal" class="modal" style="display:none;z-index:2000">
      <div class="modal-content">
          <div class="col-md-12 d-flex justify-content-between align-items-center">
              <h2 class="headermodal1">OTP Verification</h2>
              <span class="close">&times;</span>
          </div>
          
          <div class="col-md-12 d-flex justify-content-between align-items-center">
              <div class="form-group ">
                    <select class="" id="mobilenum" style="text-align: center;">
                        <option value="" disabled selected>Select mobile number</option>
                        <option value="9601484862">9601484862</option>
                        <option value="9586902520">9586902520</option>
                        <option value="9601961611">9601961611</option>
                        <option value="7801804996">7801804996</option>
                        <option value="9998835620">9998835620</option>
                        <option value="9106876925">9106876925</option>
                        <option value="7201922521">7201922521</option>
                        

                    </select>
                </div>
              <div class="text-center">
                  <button class="btn btn-primary" id="get-otp-btn">Get OTP</button>
              </div>
          </div>
          
          <p id="mobileError" style="color:red;display:none;">Please enter a valid 10-digit mobile number.</p>
          
          <div id="showotptimer" style="display:none;">
              <div class="otp-inputs text-center">
                  <input type="text" maxlength="1" class="otp-input" />
                  <input type="text" maxlength="1" class="otp-input" />
                  <input type="text" maxlength="1" class="otp-input" />
                  <input type="text" maxlength="1" class="otp-input" />
                  <input type="text" maxlength="1" class="otp-input" />
                  <input type="text" maxlength="1" class="otp-input" />
              </div>
              <p class="resend-timer text-end">
                  Resend in <span id="timer">30</span> sec
                  <button id="resend-otp-btn" style="display:none;">Resend OTP</button>
              </p>
              <button id="submitOTP" class="btn btn-primary">Submit</button>
              <p id="otpError" style="color:red;display:none;">Invalid OTP. Please try again.</p>
          </div>
      </div>
      <div id="otpOverlay" class="overlay" style="display:none;"></div>
  </div>`;


  // Append the modal HTML to the body
  document.body.insertAdjacentHTML("beforeend", otpModalHTML);
  function initializeOtpInputNavigation(otpInputClass = '.otp-input', verifyCallback = verifyOTP) {
    const otpInputs = document.querySelectorAll(otpInputClass);

    otpInputs.forEach((input, index, inputs) => {
      // Navigate to the next input on character entry
      input.addEventListener('input', () => {
        console.log(`Input ${index + 1} value: ${input.value}`); // Print the current input value
        if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      // Handle Backspace and Enter key events
      input.addEventListener('keydown', (e) => {
        console.log(`Input ${index + 1} value on keydown: ${input.value}`); // Print the value on keydown
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        } else if (e.key === 'Enter') {
          const allFilled = Array.from(otpInputs).every((input) => input.value.trim() === "");
          console.log("All input values:", allFilled); // Print all input values
          if (!allFilled) {
            verifyCallback();
            return; // Exit if any field is empty
          } else {
            showDynamicAlert2("Please fill in all OTP fields before proceeding.");

          }
        }
      });
    });
  }
  // Call the function to initialize OTP input navigation



  const otpModal = document.getElementById("otpModal");
  const otpOverlay = document.getElementById("otpOverlay");
  const closeModal = otpModal.querySelector(".close");
  const submitOTP = document.getElementById("submitOTP");
  const getOTPbtn = document.getElementById("get-otp-btn");

  const otpError = document.getElementById("otpError");
  const timerElement = document.getElementById("timer");
  const timerContainer = document.getElementById("showotptimer");
  const resendOtpButton = document.getElementById("resend-otp-btn");
  const mobileError = document.getElementById("mobileError");
  const mobileInput = document.getElementById("mobilenum");
  let timerIntervalId = null;
  let confirmationResult = null;
  let recaptchaVerifier;
  // Private function to start the OTP timer
  let recaptchaRendered = false;  // Flag to check if reCAPTCHA has been rendered
  function startTimer() {
    clearInterval(timerIntervalId);
    let time = 30;
    timerIntervalId = setInterval(() => {
      time--;
      timerElement.textContent = time;
      if (time <= 0) {
        clearInterval(timerIntervalId);
        timerElement.textContent = "0";
        resendOtpButton.style.display = "inline-block";
      }
    }, 1000);
  }

  // Private function to reset the OTP timer
  function resetTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerElement.textContent = "30";
    resendOtpButton.style.display = "none";
  }

  // Private function to hide the OTP modal
  function hideOTPModal() {
    otpModal.style.display = "none";
    otpOverlay.style.display = "none";
    mobileInput.value = "";
    mobileInput.readOnly = false;
    timerContainer.style.display = "none";
    getOTPbtn.style.display = "block";
    submitOTP.style.display = "none";
    recaptchaRendered = false
    resetTimer();
  }

  // Global recaptchaVerifier variable

  // Initialize invisible reCAPTCHA
  function initializeRecaptcha() {
    if (!recaptchaRendered) {
      recaptchaVerifier = new RecaptchaVerifier(
        "get-otp-btn", // Button ID that triggers the reCAPTCHA
        {
          size: "invisible", // Make it invisible
          callback: () => {
            console.log("reCAPTCHA verified");
          },
        },
        auth
      );
      recaptchaVerifier.render().then(function () {
        recaptchaRendered = true; // Mark as rendered to avoid re-rendering
      });
    }
  }


  function sendOTP() {
    // document.getElementById("mobilenum").addEventListener("input", validateMobile);
    let phoneNumber = document.getElementById("mobilenum").value.trim();


    if (!/^\d{10}$/.test(phoneNumber)) {
      mobileError.style.display = "block";
      mobileError.innerText = "Please enter a valid mobile number.";
      return;
    } else {
      mobileError.style.display = "none";
    }

    // Ensure the number starts with +91
    if (!phoneNumber.startsWith("+91")) {
      phoneNumber = "+91" + phoneNumber;
    }
    const authorizedNumbers = ["+919106876925", "+919586902520", "+917801804996", "+919601961611", "+919998835620", "+919601484862","+917201922521"]; // Add authorized numbers here
    if (!authorizedNumbers.includes(phoneNumber)) {
      hideOTPModal();
      showDynamicAlert1("You are not authorized to receive an OTP.");

      // Delay the page reload to allow the alert to display for 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2000 milliseconds = 2 seconds

      return;
    }

    else {
      if (!recaptchaVerifier) {
        initializeRecaptcha();
      }
      mobileInput.readOnly = true;
      const appVerifier = recaptchaVerifier;
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
          startTimer();
          timerContainer.style.display = "block";
          initializeOtpInputNavigation();
          getOTPbtn.style.display = "none";
          submitOTP.style.display = "block";
        })
        .catch(function (error) {
          console.log(error)
          handleError(error);
        });
    }


    // if (phoneNumber) {
    //     if (!recaptchaVerifier) {
    //         initializeRecaptcha();
    //     }
    //     mobileInput.readOnly = true;
    //     const appVerifier = recaptchaVerifier;
    //     signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    //         .then(function (confirmationResult) {
    //             window.confirmationResult = confirmationResult;
    //             startTimer();
    //             timerContainer.style.display = "block";
    //             initializeOtpInputNavigation();
    //             getOTPbtn.style.display = "none";
    //             submitOTP.style.display = "block";
    //         })
    //         .catch(function (error) {
    //           handleError(error)
    //         });
    // } else {
    //   showDynamicAlert("Please enter a valid phone number.");
    // }
  }
  function handleError(error) {
    if (error.code === "auth/too-many-requests") {
      showDynamicAlert1("Too many requests. Please try again later.");
    } else if (error.code === "auth/invalid-email") {
      showDynamicAlert1("Invalid email address. Please enter a email address.");
    } else {
      console.error("Error during sendSignInLinkToEmail", error);
      showDynamicAlert1("An error occurred. Please try again.");
    }
    setTimeout(() => {
      hideOTPModal();
      window.location.reload();
    }, 2000);
  }

  // Private function to setup reCAPTCHA

  // Private function to verify OTP
  function verifyOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    console.log("Verifying OTP:", otp);

    if (otp) {
      window.confirmationResult
        .confirm(otp)
        .then(function (result) {
          showDynamicAlert("Phone number verified successfully!");
          const user = result.user;
          console.log(user);
          const adminType = JSON.parse(sessionStorage.getItem("adminType"));
          if (adminType) {
            adminType.status = false; // Set status to false
            sessionStorage.setItem("adminType", JSON.stringify(adminType));
          }
          hideOTPModal()
          window.location.reload();
        })
        .catch(function (error) {
          console.error("Error verifying OTP", error);
        });
    } else {
      showDynamicAlert("Please enter the OTP code.");
    }
  }

  // Private function to handle resend OTP
  function resendOTP() {
    sendOTP();
    resendOtpButton.style.display = "none";
    resetTimer();
    startTimer();
  }

  // Public function to show the OTP modal
  function showOTPModal() {
    otpModal.style.display = "block";
    otpOverlay.style.display = "block";

  }

  // Event Listeners
  closeModal.addEventListener("click", hideOTPModal);
  otpOverlay.addEventListener("click", hideOTPModal);
  submitOTP.addEventListener("click", verifyOTP);
  resendOtpButton.addEventListener("click", resendOTP);
  document.getElementById("get-otp-btn").addEventListener("click", sendOTP);

  // Return an object with functions to interact with the OTP modal
  return {
    show: showOTPModal,
    hide: hideOTPModal,
  };
}


export function checkAdminAccess() {
  // Retrieve the adminType object from sessionStorage
  const adminType = JSON.parse(sessionStorage.getItem("adminType"));

  // Check if the adminType object exists and has the correct values
  if (adminType && adminType.value === "super admin" && adminType.status === "true") {
    // Allow access if adminType is "super admin" and status is "true"
    window.location.href = "./dashboard.html"; // Update this URL to match your dashboard's path
    console.log("Access granted.");
  } else {
    // If not, redirect to the dashboard
    initializePage()
    console.log("Access denied. Redirecting to dashboard...");
  }
}


export let sendNotification = async (userId = null, customPayload = {}) => {
  try {
    let tokens = [];
    let allUser = []

    // If a specific userId is provided, fetch only that user's data
    if (userId) {
      console.log(userId, "id che ok")
      let response = await fetch(`https://krinik.in/user_get/${userId}/`);
      if (!response.ok) {
        console.error(`Failed to fetch user data for ID ${userId}. Status:`, response.status);
        return;
      }
      let data1 = await response.json();
      let data = data1.data
      if (data.device_token) {

        tokens.push(data.device_token);
      } else {
        console.error(`No device token found for user ID ${userId}`);
        return;
      }
    } else {
      // Fetch all users if no specific userId is provided
      let response = await fetch('https://krinik.in/user_get/');
      if (!response.ok) {
        console.error('Failed to fetch users. Status:', response.status);
        return;
      }
      let data = await response.json();
      tokens = data.data.map((user) => user.device_token);
      allUser = data.data.map((user) => user.user_id)
      console.log(allUser, "alluser")
    }

    // Define the notification payload
    let payload = {
      tokens: tokens,
      title: customPayload.title || "",
      body: customPayload.body || "",

    };

    // Send the notification request
    const response2 = await fetch(' https://krinik.in/send_notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    https://krinik.in/send_notification
    // https://fcm-notification-u6yp.onrender.com/send-notifications
    if (!response2.ok) {
      console.error('Network response was not ok. Status:', response2.status, 'Status Text:', response2.statusText);
      throw new Error('Network response was not ok');
    }

    // Patch the notification data to the endpoint
    const patchPayload = {
      title: customPayload.title,
      message: customPayload.body,
      user_data: userId ? [userId] : allUser,  // Use userId if provided, otherwise use allUser
      // read: false, // Assuming the notification starts as unread
    };

    // Patch URL based on whether a user ID is provided
    const patchUrl = userId
      ? `https://krinik.in/notification_get/`
      : 'https://krinik.in/notification_get/';
    // console.log(patchUrl,"pcatc")
    const postResponse = await fetch(patchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchPayload)
    });

    if (!postResponse.ok) {
      console.error('Failed to patch notification data. Status:', postResponse.status);
      throw new Error('Failed to patch notification data');
    }

    console.log('Notification sent and data patched successfully');
    return { notificationResponse: response2, postResponse: postResponse };

  } catch (error) {
    console.error('Error:', error);
  }
};




export let sendNotificationAllUser = async (tokens, allUsers, customPayload = {}) => {
  try {
    if (tokens.length === 0) {
      console.error('No valid tokens found.');
      return;
    }

    // Define notification payload
    const payload = {
      tokens: tokens,
      title: customPayload.title || "",
      body: customPayload.body || "",
    };

    // Create promises for sending notifications and patching data
    const notificationPromise = fetch('https://fcm-notification-u6yp.onrender.com/send-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const patchPayload = {
      title: customPayload.title,
      message: customPayload.body,
      user_data: allUsers, // Send to all users
    };

    const patchPromise = fetch('https://krinik.in/notification_get/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchPayload),
    });

    // Execute both promises in parallel
    const [notificationResponse, patchResponse] = await Promise.all([notificationPromise, patchPromise]);

    // Handle responses
    if (!notificationResponse.ok) {
      console.error('Failed to send notifications. Status:', notificationResponse.status);
    }
    if (!patchResponse.ok) {
      console.error('Failed to patch notification data. Status:', patchResponse.status);
    }

    if (notificationResponse.ok && patchResponse.ok) {
      console.log('Notification sent and data patched successfully');
    }

    return { notificationResponse, patchResponse };
  } catch (error) {
    console.error('Error:', error);
  }
};


export function createOTPModal1() {

  const otpModalHTML = `
    <div id="otpModal" class="modal" style="display:none;z-index:2000">
        <div class="modal-content">
            <div class="col-md-12 d-flex justify-content-between align-items-center">
                <h2 class="headermodal1">OTP Verification</h2>
                <span class="close">&times;</span>
            </div>
            
            <div class="col-md-12 d-flex justify-content-between align-items-center">
                <div class="form-group ">
                    <select class="" id="mobilenum" style="text-align: center;">
                        <option value="" disabled selected>Select mobile number</option>
                        <option value="9601484862">9601484862</option>
                        <option value="9106876925">9106876925</option>
                        <option value="9586902520">9586902520</option>
                        <option value="9601961611">9601961611</option>
                        <option value="7801804996">7801804996</option>
                        <option value="9998835620">9998835620</option>
                        <option value="9664753223">9664753223</option>
                        
                        

                    </select>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary" id="get-otp-btn">Get OTP</button>
                </div>
            </div>
            
            <p id="mobileError" style="color:red;display:none;">Please select a mobile number.</p>
            
            <div id="showotptimer" style="display:none;">
                <div class="otp-inputs text-center">
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                </div>
                <p class="resend-timer text-end">
                    Resend in <span id="timer">30</span> sec
                    <button id="resend-otp-btn" style="display:none;">Resend OTP</button>
                </p>
                <button id="submitOTP" class="btn btn-primary">Submit</button>
                <p id="otpError" style="color:red;display:none;">Invalid OTP. Please try again.</p>
            </div>
        </div>
        <div id="otpOverlay" class="overlay" style="display:none;"></div>
    </div>`;


  // Append the modal HTML to the body
  document.body.insertAdjacentHTML("beforeend", otpModalHTML);
  function initializeOtpInputNavigation(otpInputClass = '.otp-input', verifyCallback = verifyOTP) {
    const otpInputs = document.querySelectorAll(otpInputClass);

    otpInputs.forEach((input, index, inputs) => {
      // Navigate to the next input on character entry
      input.addEventListener('input', () => {
        console.log(`Input ${index + 1} value: ${input.value}`); // Print the current input value
        if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      // Handle Backspace and Enter key events
      input.addEventListener('keydown', (e) => {
        console.log(`Input ${index + 1} value on keydown: ${input.value}`); // Print the value on keydown
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        } else if (e.key === 'Enter') {
          const allFilled = Array.from(otpInputs).every((input) => input.value.trim() === "");
          console.log("All input values:", allFilled); // Print all input values
          if (!allFilled) {
            verifyCallback();
            return; // Exit if any field is empty
          } else {
            showDynamicAlert2("Please fill in all OTP fields before proceeding.");

          }
        }
      });
    });
  }



  // Call the function to initialize OTP input navigation

  const ADMIN_TYPE_COOKIE_NAME = "adminType";
  const adminType = "admin"

  // const STATUS_ADMIN = "true";
  const STATUS_ADMIN1 = "false";

  const otpModal = document.getElementById("otpModal");
  const otpOverlay = document.getElementById("otpOverlay");
  const closeModal = otpModal.querySelector(".close");
  const submitOTP = document.getElementById("submitOTP");
  const getOTPbtn = document.getElementById("get-otp-btn");

  const otpError = document.getElementById("otpError");
  const timerElement = document.getElementById("timer");
  const timerContainer = document.getElementById("showotptimer");
  const resendOtpButton = document.getElementById("resend-otp-btn");
  const mobileError = document.getElementById("mobileError");
  const mobileInput = document.getElementById("mobilenum");
  let timerIntervalId = null;
  let confirmationResult = null;
  let recaptchaVerifier;
  // Private function to start the OTP timer
  let recaptchaRendered = false;
  console.log(recaptchaRendered) // Flag to check if reCAPTCHA has been rendered
  function startTimer() {
    clearInterval(timerIntervalId);
    let time = 30;
    timerIntervalId = setInterval(() => {
      time--;
      timerElement.textContent = time;
      if (time <= 0) {
        clearInterval(timerIntervalId);
        timerElement.textContent = "0";
        resendOtpButton.style.display = "inline-block";
      }
    }, 1000);
  }

  // Private function to reset the OTP timer
  function resetTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerElement.textContent = "30";
    resendOtpButton.style.display = "none";
  }

  // Private function to hide the OTP modal
  function hideOTPModal() {
    otpModal.style.display = "none";
    otpOverlay.style.display = "none";
    mobileInput.value = "";
    mobileInput.readOnly = false;
    timerContainer.style.display = "none";
    getOTPbtn.style.display = "block";
    submitOTP.style.display = "none";
    recaptchaRendered = false
    resetTimer();
  }

  // Global recaptchaVerifier variable

  // Initialize invisible reCAPTCHA
  function initializeRecaptcha() {
    if (!recaptchaRendered) {
      recaptchaVerifier = new RecaptchaVerifier(
        "get-otp-btn", // Button ID that triggers the reCAPTCHA
        {
          size: "invisible", // Make it invisible
          callback: () => {
            console.log("reCAPTCHA verified");
          },
        },
        auth
      );
      recaptchaVerifier.render().then(function () {
        recaptchaRendered = true; // Mark as rendered to avoid re-rendering
      });
    }
  }


  function sendOTP() {
    // document.getElementById("mobilenum").addEventListener("input", validateMobile);
    let phoneNumber = document.getElementById("mobilenum").value.trim();


    if (!/^\d{10}$/.test(phoneNumber)) {
      mobileError.style.display = "block";
      mobileError.innerText = "Please enter a valid mobile number.";
      return;
    } else {
      mobileError.style.display = "none";
    }

    // Ensure the number starts with +91
    if (!phoneNumber.startsWith("+91")) {
      phoneNumber = "+91" + phoneNumber;
    }

    const authorizedNumbers = ["+919106876925", "+919586902520", "+917801804996", "+919601961611", "+919998835620", "+919664753223", "+919601484862"]; // Add authorized numbers here
    if (!authorizedNumbers.includes(phoneNumber)) {
      hideOTPModal();
      showDynamicAlert1("You are not authorized to receive an OTP.");

      // Delay the page reload to allow the alert to display for 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2000 milliseconds = 2 seconds

      return;
    }

    else {
      if (!recaptchaVerifier) {
        initializeRecaptcha();
      }
      mobileInput.readOnly = true;
      const appVerifier = recaptchaVerifier;
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
          startTimer();
          timerContainer.style.display = "block";
          initializeOtpInputNavigation();
          getOTPbtn.style.display = "none";
          submitOTP.style.display = "block";
        })
        .catch(function (error) {
          console.log(error)
          handleError(error);
        });
    }
  }



  function handleError(error) {
    if (error.code === "auth/too-many-requests") {
      showDynamicAlert1("Too many OTP requests. Please try again later.");
    } else if (error.code === "auth/invalid-phone-number") {
      showDynamicAlert1("Invalid phone number. Please enter a valid number.");
    } else {
      console.error("Error during signInWithPhoneNumber", error);
      showDynamicAlert1("An error occurred. Please try again.");
    }
    setTimeout(() => {
      hideOTPModal();
      window.location.reload();
    }, 2000);
  }


  function setsessionStorage(key, value, status) {
    sessionStorage.setItem(key, JSON.stringify({ value, status }));
  }
  // Private function to setup reCAPTCHA

  // Private function to verify OTP
  function verifyOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");

    // Combine the values of OTP input fields into one string
    const otp = Array.from(otpInputs)
      .map((input) => input.value.trim())
      .join("");

    if (!otp) {
      showDynamicAlert2("Please enter the OTP code.");
      return;
    }

    console.log("Verifying OTP:", otp);

    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        showDynamicAlert("Phone number verified successfully!");
        const user = result.user;
        console.log(user);

        // Redirect after successful verification
        showDynamicAlert("Login successful!");
        setTimeout(() => {
          setsessionStorage(ADMIN_TYPE_COOKIE_NAME, adminType, STATUS_ADMIN1);
          hideOTPModal();
          window.location.href = "dashboard.html";
        }, 2000);
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error);
        showDynamicAlert1("Invalid OTP");
        setTimeout(() => hideOTPModal(), 2000);
      });
  }

  // Private function to handle resend OTP
  function resendOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");

    // Clear all OTP input fields
    otpInputs.forEach(input => {
      input.value = "";
    });

    sendOTP();
    resendOtpButton.style.display = "none";
    resetTimer();
    startTimer();
  }

  // Public function to show the OTP modal
  function showOTPModal() {
    otpModal.style.display = "block";
    otpOverlay.style.display = "block";

  }

  // Event Listeners
  closeModal.addEventListener("click", hideOTPModal);
  otpOverlay.addEventListener("click", hideOTPModal);
  submitOTP.addEventListener("click", verifyOTP);
  resendOtpButton.addEventListener("click", resendOTP);
  document.getElementById("get-otp-btn").addEventListener("click", sendOTP);

  // Return an object with functions to interact with the OTP modal
  return {
    show: showOTPModal,
    hide: hideOTPModal,
  };
}



export function createOTPModal2() {



  // Modal HTML structure
  const otpModalHTML1 = `
    <div id="otpModal1" class="modal" style="display:none;z-index:2000">
        <div class="modal-content">
            <div class="col-md-12 d-flex justify-content-between align-items-center">
                <h2 class="headermodal1">OTP Verification</h2>
                <span class="close">&times;</span>
            </div>
            
            <div class="col-md-12 d-flex justify-content-around align-items-center">
                <div class="form-group ">
                    <input type="email" class="form-control" id="mobilenum1" style="text-align: center;" placeholder="Enter your email address" />
                </div>
                <div class="text-center">
                    <button class="btn btn-primary" id="get-otp-btn1">Get OTP</button>
                </div>
            </div>
            
            <p id="mobileError" style="color:red;display:none;">Please enter a valid 10-digit mobile number.</p>
            
            <div id="showotptimer" style="display:none;">
                <div class="otp-inputs text-center">
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                    <input type="text" maxlength="1" class="otp-input" />
                </div>
                <p class="resend-timer text-end">
                    Resend in <span id="timer">30</span> sec
                    <button id="resend-otp-btn1" style="display:none;">Resend OTP</button>
                </p>
                <button id="submitOTP" class="btn btn-primary">Submit</button>
                <p id="otpError" style="color:red;display:none;">Invalid OTP. Please try again.</p>
            </div>
        </div>
        <div id="otpOverlay" class="overlay" style="display:none;"></div>
    </div>`;


  // Append the modal HTML to the body
  document.body.insertAdjacentHTML("beforeend", otpModalHTML1);
  // function initializeOtpInputNavigation() {
  //   const otpInputs = document.querySelectorAll('.otp-input');

  //   otpInputs.forEach((input, index, inputs) => {
  //     input.addEventListener('input', () => {
  //       // Move focus to the next input if it's not the last input
  //       if (input.value.length === 1 && index < inputs.length - 1) {
  //         inputs[index + 1].focus();
  //       }
  //     });

  //     input.addEventListener('keydown', (e) => {
  //       if (e.key === 'Backspace' && !input.value && index > 0) {
  //         // Move focus to the previous input if Backspace is pressed and current input is empty
  //         inputs[index - 1].focus();
  //       }

  //       if (e.key === 'Enter') {
  //         // Trigger verification if Enter is pressed
  //         verifyOTP();
  //       }
  //     });
  //   });
  // }

  // Call the function to initialize OTP input navigation

  const ADMIN_TYPE_COOKIE_NAME = "adminType";
  const adminType = "admin"

  // const STATUS_ADMIN = "true";
  const STATUS_ADMIN1 = "false";

  const otpModal = document.getElementById("otpModal1");
  const otpOverlay = document.getElementById("otpOverlay");
  const closeModal = otpModal.querySelector(".close");
  const submitOTP = document.getElementById("submitOTP");
  const getOTPbtn = document.getElementById("get-otp-btn");

  const otpError = document.getElementById("otpError");
  const timerElement = document.getElementById("timer");
  const timerContainer = document.getElementById("showotptimer");
  const resendOtpButton = document.getElementById("resend-otp-btn");
  const mobileError = document.getElementById("mobileError");
  const mobileInput = document.getElementById("mobilenum");
  let timerIntervalId = null;
  let confirmationResult = null;
  let recaptchaVerifier;
  let userId = null;
  // Private function to start the OTP timer
  let recaptchaRendered = false;  // Flag to check if reCAPTCHA has been rendered
  function startTimer() {
    clearInterval(timerIntervalId);
    let time = 30;
    timerIntervalId = setInterval(() => {
      time--;
      timerElement.textContent = time;
      if (time <= 0) {
        clearInterval(timerIntervalId);
        timerElement.textContent = "0";
        resendOtpButton.style.display = "inline-block";
      }
    }, 1000);
  }

  // Private function to reset the OTP timer
  function resetTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerElement.textContent = "30";
    resendOtpButton.style.display = "none";
  }

  // Private function to hide the OTP modal
  function hideOTPModal() {
    otpModal.style.display = "none";
    otpOverlay.style.display = "none";
    mobileInput.value = "";
    mobileInput.readOnly = false;
    timerContainer.style.display = "none";
    getOTPbtn.style.display = "block";
    submitOTP.style.display = "none";
    recaptchaRendered = false
    resetTimer();
  }

  // Global recaptchaVerifier variable

  // Initialize invisible reCAPTCHA
  function initializeRecaptcha() {
    if (!recaptchaRendered) {
      recaptchaVerifier = new RecaptchaVerifier(
        "get-otp-btn", // Button ID that triggers the reCAPTCHA
        {
          size: "invisible", // Make it invisible
          callback: () => {
            console.log("reCAPTCHA verified");
          },
        },
        auth
      );
      recaptchaVerifier.render().then(function () {
        recaptchaRendered = true; // Mark as rendered to avoid re-rendering
      });
    }
  }

  async function getUserIdByEmail(email) {
    try {
      const response = await fetch('https://krinik.in/login/');
      const data = await response.json();
      const user = data.data.find(user => user.email === email);
      return user ? user : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async function sendOTP() {
    let email = document.getElementById("mobilenum1").value; // Ensure this matches the ID of the email input field
    console.log("Email entered:", email); // Debugging step

    // if (!email) {
    //     showDynamicAlert2("Please enter a valid email address.");
    //     return;
    // }

    userId = await getUserIdByEmail(email);

    if (!userId) {
      showDynamicAlert2("Please enter a registered email address.");
      return;
    }

    const actionCodeSettings = {
      url: `https://krinikin-admin.netlify.app/forgot-password.html?email=${email}`,
      handleCodeInApp: true
    };


    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(function () {
        showDynamicAlert("Email verification link sent successfully."); // Debugging step
        // window.localStorage.setItem('emailForSignIn', email); // Store email locally to verify later
        // startTimer();
        setTimeout(() => {
          hideOTPModal();
          window.location.reload();
        }, 2000);
        // timerContainer.style.display = "block";
        // initializeOtpInputNavigation();
        // getOTPbtn.style.display = "none";
        // submitOTP.style.display = "block";
      })
      .catch(function (error) {
        console.error("Error during sendSignInLinkToEmail:", error);
        handleError(error);
      });
  }




  function handleError(error) {
    if (error.code === "auth/too-many-requests") {
      showDynamicAlert1("Too many requests. Please try again later.");
    } else if (error.code === "auth/invalid-email") {
      showDynamicAlert1("Invalid email address. Please enter a email address.");
    } else {
      console.error("Error during sendSignInLinkToEmail", error);
      showDynamicAlert1("An error occurred. Please try again.");
    }
    setTimeout(() => {
      hideOTPModal();
      window.location.reload();
    }, 2000);
  }


  function setsessionStorage(key, value, status) {
    sessionStorage.setItem(key, JSON.stringify({ value, status }));
  }
  // Private function to setup reCAPTCHA

  // Private function to verify OTP
  function verifyOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    console.log("Verifying OTP:", otp);

    if (otp) {
      window.confirmationResult
        .confirm(otp)
        .then(function (result) {
          showDynamicAlert("Phone number verified successfully!");
          const user = result.user;
          console.log(user);
          showDynamicAlert("Login successful!")
          setTimeout(() => {
            setsessionStorage(ADMIN_TYPE_COOKIE_NAME, adminType, STATUS_ADMIN1);
            hideOTPModal()
            window.location.href = "dashboard.html"
          }, 2000);
          ;
        })
        .catch(function (error) {
          console.error("Error verifying OTP", error);
        });
    } else {
      showDynamicAlert2("Please enter the OTP code.");
    }
  }

  // Private function to handle resend OTP
  function resendOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");

    // Clear all OTP input fields
    otpInputs.forEach(input => {
      input.value = "";
    });

    sendOTP();
    resendOtpButton.style.display = "none";
    resetTimer();
    startTimer();
  }

  // Public function to show the OTP modal
  function showOTPModal() {
    otpModal.style.display = "block";
    otpOverlay.style.display = "block";

  }

  // Event Listeners
  closeModal.addEventListener("click", hideOTPModal);
  otpOverlay.addEventListener("click", hideOTPModal);
  // submitOTP.addEventListener("click", verifyOTP);
  // resendOtpButton.addEventListener("click", resendOTP);
  document.getElementById("get-otp-btn1").addEventListener("click", sendOTP);

  // Return an object with functions to interact with the OTP modal
  return {
    show: showOTPModal,
    hide: hideOTPModal,
  };
}