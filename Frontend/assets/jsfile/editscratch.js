import {checkAdminAccess,showDynamicAlert}  from "../js/initial.js"
import {refreshpage,showLoader,hideLoader} from "./pagerefresh.js"

document.addEventListener('DOMContentLoaded', async () => {
    const fileInput = document.getElementById('fileInput1'); // File input
    const filePathPreview = document.getElementById('filePathPreview'); // Span to show the file path
    const couponPointInput = document.getElementById('fileInput2'); // Coupon points input
    const urlParams = new URLSearchParams(window.location.search);
    const id = Number(urlParams.get('scratchId'));

    console.log(id);
    if (id) {
        try {
            const response = await fetch(`https://krinik.in/scratch_coupon_get/${id}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch team data');
            }
            const teamData1 = await response.json();
            const teamData = teamData1.data;
            console.log(teamData);
            editTeamData(teamData);
        } catch (error) {
            console.error('Error fetching team data:', error);
        }
    }

    function editTeamData(response) {
        if (response) {
            // Display the file path as text
            filePathPreview.textContent = `File Path: ${response.image}`; // e.g., "/user_doc/bp.jpg"

            // Set the coupon points in the text input
            couponPointInput.value = response.coupon_point;
        }
    }
    
    async function submitFormData(method1) {
        const formData = new FormData();
        
        // Always append coupon_point to FormData
        formData.append('coupon_point', couponPointInput.value);
        
        const fileInputFile = fileInput.files[0];
        if (fileInputFile) {
            // If a file is selected, append the actual file object to FormData
            formData.append('image', fileInputFile);
        }     
        // Log coupon point and FormData for debugging
        console.log('Coupon Point:', couponPointInput.value);
        for (let [key, value] of formData.entries()) {
            console.log(key, typeof value);
        }
    
        try {
            const response = await fetch(`https://krinik.in/scratch_coupon_get/${id}/`, {
                method: method1,
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('Failed to edit team');
            }
    
            // Parse and log the response from the server
            const responseData = await response.json();
            console.log('Response from server:', responseData);
            
            // Show success message
            showDynamicAlert('Scratch edited successfully!');
            
            // Optionally redirect after success
            setTimeout(()=>{
                window.location.href = "manage-scratch.html"
              },1000)
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while editing the team.');
        }
    }
    
    

    document.getElementById('uploadForm1').addEventListener('submit', async function (event) {
        event.preventDefault();

         if (typeof refreshpage === "function") {
                setTimeout(() => {
                    showLoader(); // Show the loader with a delay (optional)
                }, 100);
          
                // Perform the redirect and handle loader visibility
                Promise.resolve()
                    .then(async() => {
                        if (confirm("Are you sure you want to edit it?")) {
                            await submitFormData('PATCH');
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

        
    });
});



window.onload = checkAdminAccess();