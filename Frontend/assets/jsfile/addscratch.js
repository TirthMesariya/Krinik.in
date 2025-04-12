import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js";
import { refreshpage,showLoader,hideLoader } from "./pagerefresh.js";

  let isFileUploadedCoupon = false;

  const fileInput1 = document.getElementById('fileInput1');
  const fileInput2 = document.getElementById('fileInput2');
  const responseMessage1 = document.getElementById('responseMessage1');
  const responseMessage2 = document.getElementById('responseMessage2');
  const uploadForm1 = document.getElementById('uploadForm1');

  uploadForm1.addEventListener('submit', function (e) {
  e.preventDefault();

  if (typeof refreshpage === "function") {
        setTimeout(() => {
            showLoader(); // Show the loader with a delay (optional)
        }, 100);
  
        // Perform the redirect and handle loader visibility
        Promise.resolve()
            .then(() => {
                
  responseMessage1.innerHTML = '';

  if (!fileInput1.files.length) {
      responseMessage1.innerHTML = '<div class="alert alert-danger">Please select a file before submitting.</div>';
      return;
  }

  const selectedFile1 = fileInput1.files[0];
  const textInput = fileInput2.value.trim();

  if (selectedFile1 && textInput) {
      uploadCouponFile(selectedFile1, textInput);
  } else {
      responseMessage2.innerHTML = '<div class="alert alert-danger">Please fill out both fields.</div>';
  }// Redirect to the new page
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


});

function uploadCouponFile(file, textInput) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('coupon_point', textInput);

  fetch('https://krinik.in/scratch_coupon_get/', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      console.log("Response data:", data); // Debugging: Check if data contains "status" and "data"
      if (data.status === 'success') {
          isFileUploadedCoupon = true;
           showDynamicAlert("Scratch coupon added successfully!")
        //   alert("Scratch coupon uploaded successfully!");

          setTimeout(()=>{
            window.location.href = "manage-scratch.html"
          },1000)
      } else {
          responseMessage1.innerHTML = '<div class="alert alert-danger">File upload failed.</div>';
      }
  })
  .catch(error => {
      responseMessage1.innerHTML = '<div class="alert alert-danger">Error: ' + error.message + '</div>';
  });
}

 

  fileInput1.addEventListener('change', function () {
      responseMessage1.innerHTML = '';
  });

  fileInput2.addEventListener('input', function () {
      responseMessage2.innerHTML = '';
  });

  window.onload = checkAdminAccess();

  let fetchdata = async () => {
    try {
        let response = await fetch('https://krinik.in/scratch_coupon_get/');
        
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data1 = await response.json();
        let data = data1.data;

        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchdata();