// Import required functions
import { checkAdminAccess } from "../js/initial.js";

// Element references
const loginForm = document.getElementById("login-pwd");
const oldPwdInput = document.getElementById("oldpd");
const errorOldInput = document.getElementById("errorOldpwd");
const newPwdInput = document.getElementById("newpd");
const errorNewInput = document.getElementById("errorNewpwd");
const newConPwdInput = document.getElementById("confirmpd");
const errorConPwdInput = document.getElementById("errorConNewpwd");
const adminTypeInput = document.getElementById("admin-type");
const adminOldPassSection = document.getElementById("adminOldPass");

// Regular expressions
const adminTypeRegex = /^(super admin|admin)$/;
const passwordRegex = /.{6,}/;

// State variables
let loginData;
let matchId;

/**
 * Function to validate input fields
 */
function setupValidation(inputId, errorId, regex, emptyMessage, invalidMessage) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  function validate() {
    const value = input.value.trim();
    if (value === "") {
      showError(error, emptyMessage);
      return false;
    } else if (!regex.test(value)) {
      showError(error, invalidMessage);
      return false;
    } else {
      hideError(error);
      return true;
    }
  }

  input.addEventListener("input", validate);
  input.addEventListener("change", validate);

  return validate;
}

/**
 * Function to show error messages
 */
function showError(errorElement, message) {
  errorElement.innerHTML = message;
  errorElement.style.display = "inline";
  errorElement.style.color = "red";
}

/**
 * Function to hide error messages
 */
function hideError(errorElement) {
  errorElement.style.display = "none";
}

/**
 * Fetch login data from the server
 */
async function fetchLoginData() {
  try {
    const response = await fetch("https://krinik.in/login/");
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

    const data = await response.json();
    loginData = data?.data || [];
    console.log("Fetched login data:", loginData);
  } catch (error) {
    console.error("Error fetching login data:", error);
  }
}

/**
 * Handle password update logic
 */
async function updatePassword(matchId, newPassword) {
  try {
    const response = await fetch(`https://krinik.in/login/${matchId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!response.ok) throw new Error(`PATCH request failed with status: ${response.status}`);

    const data = await response.json();
    console.log("Password update successful:", data);

    // Clear form inputs
    clearForm();
    location.reload();
  } catch (error) {
    console.error("Error updating password:", error);
  }
}

/**
 * Clear all form inputs
 */
function clearForm() {
  adminTypeInput.value = "";
  oldPwdInput.value = "";
  newPwdInput.value = "";
  newConPwdInput.value = "";
}

/**
 * Validate all fields
 */
function validateAllFields(requireOldPassword) {
  const validateNewPwd = setupValidation(
    "newpd",
    "errorNewpwd",
    passwordRegex,
    "Please enter new password",
    "Password must be at least 6 characters long"
  );

  const validateConNewPwd = setupValidation(
    "confirmpd",
    "errorConNewpwd",
    passwordRegex,
    "Please enter confirm password",
    "Password must be at least 6 characters long"
  );

  const validateAdminType = setupValidation(
    "admin-type",
    "error-admin-type",
    adminTypeRegex,
    "Admin type is required",
    "Invalid admin type"
  );

  const isOldPwdValid = requireOldPassword
    ? setupValidation(
        "oldpd",
        "errorOldpwd",
        passwordRegex,
        "Please enter old password",
        "Password must be at least 6 characters long"
      )()
    : true;

  return (
    isOldPwdValid &&
    validateNewPwd() &&
    validateConNewPwd() &&
    validateAdminType()
  );
}

/**
 * Form submission handler
 */
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isAdmin = adminTypeInput.value === "admin";

  if (!validateAllFields(isAdmin)) return;

  const newPwd = newPwdInput.value;
  const newConPwd = newConPwdInput.value;

  if (newPwd !== newConPwd) {
    showError(errorConPwdInput, "Passwords do not match");
    return;
  }

  if (isAdmin) {
    const adminData = loginData.find((p) => p.admin_type === "admin");

    if (!adminData) {
      console.error("Admin data not found");
      return;
    }

    matchId = adminData.id;

    if (oldPwdInput.value !== adminData.password) {
      showError(errorOldInput, "Old password is incorrect");
      return;
    }
  } else {
    const superAdminData = loginData.find((p) => p.admin_type === "super admin");

    if (!superAdminData) {
      console.error("Super admin data not found");
      return;
    }

    matchId = superAdminData.id;
  }

  await updatePassword(matchId, newPwd);
});

// Initialize on page load
adminTypeInput.addEventListener("change", () => {
  adminOldPassSection.style.display = adminTypeInput.value === "super admin" ? "none" : "block";
});

fetchLoginData();
window.onload = checkAdminAccess;
