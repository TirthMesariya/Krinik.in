
import {checkAdminAccess}  from "../js/initial.js"


let isFileUploadedAd = false;


const fileInput = document.getElementById('fileInput');
const responseMessage = document.getElementById('responseMessage');
const uploadForm = document.getElementById('uploadForm');


async function fetchAdId() {
    try {
        const response = await fetch('https://krinik.in/ad_get/');
        const data = await response.json();
        return data.data[0]?.id || null;
    } catch (error) {
        console.error("Error fetching ad ID:", error);
    }
}

uploadForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    responseMessage.innerHTML = '';

    if (!fileInput.files.length) {
        responseMessage.innerHTML = '<div class="alert alert-danger">Please select a file before submitting.</div>';
        return;
    }

    if (!isFileUploadedAd) {
        const selectedFile = fileInput.files[0];
        const adId = await fetchAdId();
        if (adId) uploadAdFile(adId, selectedFile);
    }
});

async function uploadAdFile(Id, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type);

    fetch(`https://krinik.in/ad_get/${Id}/`, {
        method: 'PATCH',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            isFileUploadedAd = true;
            alert("Advertisement uploaded successfully!");
            location.reload();
        } else {
            responseMessage.innerHTML = '<div class="alert alert-danger">File upload failed.</div>';
        }
    })
    .catch(error => {
        responseMessage.innerHTML = '<div class="alert alert-danger">Error: ' + error.message + '</div>';
    });
}



fileInput.addEventListener('change', function () {
    responseMessage.innerHTML = '';
});

window.onload = checkAdminAccess();