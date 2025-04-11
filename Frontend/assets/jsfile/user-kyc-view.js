import {checkAdminAccess,sendNotification,showDynamicAlert}  from "../js/initial.js"

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

// const aadharFront = document.getElementById("aadharFront");
// const aadharBack = document.getElementById("aadharBack");
// const panFront = document.getElementById("panFront");
const rejectionMessageSelect = document.getElementById("RejectionMessage");
const errorMessageSpan = document.getElementById("error-message");
const rejectionMessageButton = document.getElementById("rejectionMessageButton");
const ApproveMessageButton = document.getElementById("ApproveMessageButton");
const aadharFrontDownloadBtn = document.getElementById("aadharFrontDownload");
const aadharBackDownloadBtn = document.getElementById("aadharBackDownload");
const panFrontDownloadBtn = document.getElementById("panFrontDownload");
const account_number = document.getElementById("account_number");
const ifsc_code = document.getElementById("ifsc_code");
const bank_name = document.getElementById("bank_name");
const branch_name = document.getElementById("branch_name");
const state = document.getElementById("state");

let apiData = {};
// const items = [
//   "aadhar_card_front",
//   "aadhar_card_back",
//   "pan_card_front",
//   "account_number",
//   "ifsc_code",
//   "bank_name",
//   "branch_name",
//   "state",
// ];
let userApproved;
// ApproveMessageButton.classList.add("clickbtn1");
//       rejectionMessageButton.classList.add("clickbtn1");

async function fetchUserData() {
  try {
    if (!id) {
      console.warn("No player ID found in URL.");
      return;
    }

    const apiUrl = `https://krinik.in/user_get/${id}/`;
    console.log("Fetching player data from:", apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch player data");
    }

    const userData1 = await response.json();
    const userData = userData1.data;
    userApproved = userData1.data.profile_status;
    if (userApproved === "pending") {
      rejectionMessageButton.disabled = false; // Enable the reject button
      ApproveMessageButton.disabled = false;  // Enable the approve button
      ApproveMessageButton.classList.add("clickbtn1");
      rejectionMessageButton.classList.add("clickbtn1");
      rejectionMessageButton.style = "border:1px solid black";
      ApproveMessageButton.style = "border:1px solid black;opacity:0.7";
    } else {
      rejectionMessageButton.disabled = true; // Disable the reject button
      ApproveMessageButton.disabled = true;  // Disable the approve button
      ApproveMessageButton.classList.remove("clickbtn1");
      rejectionMessageButton.classList.remove("clickbtn1");
      rejectionMessageButton.textContent = ""; // Reset styles
      ApproveMessageButton.textContent = "";
      rejectionMessageButton.style = ""
    }
    

    console.log(userData);

    editPlayerData(userData);
    setupImageEventListeners(); // Set up image listeners only after data is fetched
  } catch (error) {
    console.error("Error fetching player data:", error);
  }
}

function editPlayerData(response) {
  const userFullName = document.getElementById("user-fullname");
  const userImageView = document.getElementById("user-image-view");
  const userMob = document.getElementById("user-mob");
  const userEmail = document.getElementById("user-email");

  if (response) {
    // Update image source
    userImageView.src = `https://krinik.in/${response.image}`;

    // Set form field values
    userFullName.textContent = response.name || "N/A";
    userMob.textContent = response.mobile_no || "N/A";
    userEmail.textContent = response.email || "N/A";

    apiData = {
      aadhar_front: `https://krinik.in/${
        response.user_doc?.aadhar_card_front || ""
      }`,
      aadhar_back: `https://krinik.in/${
        response.user_doc?.aadhar_card_back || ""
      }`,
      pan_card: `https://krinik.in/${
        response.user_doc?.pan_card_front || ""
      }`,
    };
   
    account_number.value = response.user_doc?.account_number || "";
    ifsc_code.value =  response.user_doc?.ifsc_code || "";
    bank_name.value =  response.user_doc?.bank_name || "";
    branch_name.value =  response.user_doc?.branch_name || "";
    state.value = response.user_doc?.state || "";
    if (account_number.value == "" && ifsc_code.value == "" && bank_name.value == "" && branch_name.value == "" && state.value == ""  ) {
      
      ApproveMessageButton.disabled = true;
      ApproveMessageButton.classList.remove("clickbtn1");
      rejectionMessageButton.classList.remove("clickbtn1");
      ApproveMessageButton.style = "border:2px solid black;opacity:0.7";
    } 
  } else {
    console.error("Data is not in the expected format:", response);
  }
}

// Sets up event listeners for viewing and downloading images
function setupImageEventListeners() {
  addViewImageListener("aadharFront", apiData.aadhar_front, "Aadhar Front");
  addViewImageListener("aadharBack", apiData.aadhar_back, "Aadhar Back");
  addViewImageListener("panFront", apiData.pan_card, "PAN Card Front");

  aadharFrontDownloadBtn.addEventListener("click", () => {
    downloadImageAsPDF(apiData.aadhar_front, "Aadhar Front");
  });

  aadharBackDownloadBtn.addEventListener("click", () => {
    downloadImageAsPDF(apiData.aadhar_back, "Aadhar Back");
  });
  panFrontDownloadBtn.addEventListener("click", () => {
    downloadImageAsPDF(apiData.pan_card, "PAN Card Front");
  });
  // setupRejectionMessageOptions();

  // Inside setupImageEventListeners function
  rejectionMessageButton.addEventListener("click", async(e) => {
    e.preventDefault(); // Prevent the default action of the button

    // Check if the selected value is "Select Message"
    if (rejectionMessageSelect.value === "") {
      errorMessageSpan.style = "text-align:Start;color:red";
      errorMessageSpan.textContent = "Please write a rejection message."; // Show error message
    } else {
      errorMessageSpan.textContent = ""; // Clear any previous error messages
      // Proceed with patching the rejection reason
     
      await patchData("profile_status", "rejected");
      showDynamicAlert("Rejected Successfully !")
      fetchUserData()
      await sendNotification(id, {
        title: "KYC Rejected",
        body: `${rejectionMessageSelect.value}`,
    });
    window.location.href = "./kyc.html";
    }
  });

  // Move this part outside of the rejectionMessageButton event listener
  ApproveMessageButton.addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent the default action of the button
    if (account_number.value === "" && ifsc_code.value === "" && bank_name.value === "" && branch_name.value === "" && state.value === "") {
      ApproveMessageButton.disabled = true;
      ApproveMessageButton.style = "border:1px solid black; opacity:0.7";
      ApproveMessageButton.classList.remove("clickbtn1");
      rejectionMessageButton.classList.remove("clickbtn1");
      // Early return to prevent further actions
      return; // This will stop the execution here, preventing the redirect
  }
  
  // Check if user is not approved and redirect if necessary
  if (userApproved !== "approved") {
    
    await patchData("profile_status", "approved");
    showDynamicAlert("KYC Approved Successfully !")
    fetchUserData()
    await sendNotification(id, {
      title: "KYC Approved!",
      body: "Congratulations! Your KYC has been successfully verified. You can now enjoy full access to all features."
  });
  
    window.location.href = "./kyc.html";
      // return; // Optional: return here as well to ensure no further code runs
  }
    // Proceed with patching the profile status
  });
}

// Reusable function to add event listener for viewing images
function addViewImageListener(elementId, imageSrc, title) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener("click", () => {
      showImage(imageSrc, title);
    });
  }
}

// Function to show the image and update modal title
function showImage(imageSrc, title) {
  console.log(imageSrc,"imagesrc")
  document.getElementById("preview-image").src = imageSrc;
  document.getElementById("imageModalLabel").innerText = title;

  const imageModal = new bootstrap.Modal(document.getElementById("imageModal"));
  imageModal.show();
}

async function downloadImageAsPDF(imageSrc, title) {
  if (!imageSrc) {
    console.warn(`No image found for ${title}`);
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const margin = 10;

  // Create an image element to load the image
  const imgElement = new Image();
  imgElement.crossOrigin = "anonymous"; // Enable CORS
  imgElement.src = imageSrc;

  imgElement.onload = async () => {
    // Set canvas dimensions to the original image dimensions
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);

    // Use the original image quality for the PDF
    const imgData = canvas.toDataURL("image/png", 1.0); // Quality set to 1.0 for full quality

    // Add title and image to the PDF
    pdf.setFontSize(12);
    pdf.text(title, margin, margin + 5);

    // Maintain original image dimensions for PDF
    const imgWidth = pdf.internal.pageSize.getWidth() - 2 * margin; // Full page width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
    pdf.addImage(imgData, "PNG", margin, margin + 10, imgWidth, imgHeight);

    // Save the PDF with a filename based on the title
    pdf.save(`${title}.pdf`);
  };

  imgElement.onerror = () => {
    console.error(`Failed to load image: ${imageSrc}`);
  };

  // Append the image to the document body (not shown on screen)
  document.body.appendChild(imgElement);
  imgElement.style.display = "none"; // Hide the image element
}

// function generateCombinations(array) {
//   const results = [];

//   const f = (start, combination) => {
//     // Only add combinations if the current combination is not empty
//     if (combination.length > 0) {
//       results.push(combination.join(" & "));
//     }
//     for (let i = start; i < array.length; i++) {
//       f(i + 1, combination.concat(array[i]));
//     }
//   };

//   f(0, []);
//   return results;
// }

// Populate the select dropdown with rejection message options

// function setupRejectionMessageOptions() {
  // const rejectionMessages = generateCombinations(items);
  // Add "Select Message" as the default option
  // rejectionMessageSelect.innerHTML = `<option value="Select Message">Select Message</option>`;
  // rejectionMessages.forEach((message) => {
  //   const option = document.createElement("option");
  //   option.value = message;
  //   option.textContent = message; // No prefix needed
  //   rejectionMessageSelect.appendChild(option);
  // });
// }

async function patchData(field, value) {
  try {
    const apiUrl = `https://krinik.in/user_get/${id}/`; // Adjust the endpoint as needed

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [field]: value, // Use dynamic field name
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to patch data");
    }

    const result = await response.json();
    console.log("Patch successful:", result);
    // Optionally, refresh the user data after patching
    fetchUserData();
   
  } catch (error) {
    console.error("Error patching data:", error);
  }
}

// Fetch the user data on page load
fetchUserData();
// window.onload = checkAdminAccess();