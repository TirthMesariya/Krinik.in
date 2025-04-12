// const COOKIE_NAME = 'userEmail';

//         function eraseCookie(name) {
//             document.cookie = `${name}=; Max-Age=-99999999; path=/`;
//         }

//         function showLogoutModal(event) {
//             // Prevent the default action (e.g., form submission)
//             event.preventDefault();

//             // Create the modal container
//             const modal = document.createElement('div');
//             modal.id = 'logoutModal';
//             modal.classList.add('modal');

//             // Create the modal content container
//             const modalContent = document.createElement('div');
//             modalContent.classList.add('modal-content');

//             // Create the modal header
//             const header = document.createElement('h2');
//             header.textContent = 'Are you sure you want to logout?';

//             // Create the modal buttons
//             const modalButtons = document.createElement('div');
//             modalButtons.classList.add('modal-buttons');

//             const confirmButton = document.createElement('button');
//             confirmButton.id = 'confirmLogout';
//             confirmButton.textContent = 'Yes, Logout';
//             confirmButton.onclick = () => {
//                 // Erase the cookie
//                 eraseCookie(COOKIE_NAME);

//                 // Redirect to the index page
//                 window.location.href = './index.html';
//             };

//             const cancelButton = document.createElement('button');
//             cancelButton.id = 'cancelLogout';
//             cancelButton.textContent = 'Cancel';
//             cancelButton.onclick = () => modal.style.display = 'none';

//             // Append elements
//             modalButtons.appendChild(confirmButton);
//             modalButtons.appendChild(cancelButton);
//             modalContent.appendChild(header);
//             modalContent.appendChild(modalButtons);
//             modal.appendChild(modalContent);

//             // Append modal to the body
//             document.body.appendChild(modal);

//             // Show the modal
//             modal.style.display = 'block';
//         }

//         // Example usage
//         document.getElementById('logoutButton').addEventListener('click', showLogoutModal);

//         // Function to hide the modal when clicking outside of it
//         window.onclick = function(event) {
//             const modal = document.getElementById('logoutModal');
//             if (event.target === modal) {
//                 modal.style.display = 'none';
//             }
//         };


// let LOCAL_STORAGE_KEY = 'userEmail';
let LOCAL_STORAGE_KEY1 = 'adminType';

// Function to remove a session storage key
function erasesessionStorage(key) {
  sessionStorage.removeItem(key);
}

// Function to show the logout confirmation modal
function showLogoutModal(event) {
  event.preventDefault(); // Prevent default behavior to stop potential form submissions

  // Check if the modal already exists, if so, don't create a new one
  if (document.getElementById('logoutModal')) {
    document.getElementById('logoutModal').style.display = 'block'; // Show existing modal
    return;
  }

  // Create modal structure if it doesn't exist
  const modal = document.createElement('div');
  modal.id = 'logoutModal';
  modal.classList.add('modal');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  const header = document.createElement('h2');
  header.textContent = 'Are you sure you want to logout?';

  const modalButtons = document.createElement('div');
  modalButtons.classList.add('modal-buttons');

  const confirmButton = document.createElement('button');
  confirmButton.id = 'confirmLogout';
  confirmButton.textContent = 'Yes, Logout';

  // On confirm, erase session storage and redirect
  confirmButton.onclick = () => {
    erasesessionStorage(LOCAL_STORAGE_KEY1);
    sessionStorage.setItem("redirected", "true"); // Prevent loop on redirect
    window.location.href = './index.html'; // Redirect to login page
    modal.style.display = 'none'; // Hide modal
  };

  const cancelButton = document.createElement('button');
  cancelButton.id = 'cancelLogout';
  cancelButton.textContent = 'Cancel';

  // On cancel, close the modal
  cancelButton.onclick = () => modal.style.display = 'none';

  // Append elements to the modal
  modalButtons.appendChild(confirmButton);
  modalButtons.appendChild(cancelButton);
  modalContent.appendChild(header);
  modalContent.appendChild(modalButtons);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
  modal.style.display = 'block'; // Show modal
}

// Bind showLogoutModal to logout button click
document.getElementById('logoutButton').addEventListener('click', showLogoutModal);

// Close modal if user clicks outside of it
window.onclick = function(event) {
  const modal = document.getElementById('logoutModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Function to check session storage expiration and handle redirects
function checkLocalStorageExpiration() {
  const adminType = sessionStorage.getItem('adminType');

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
