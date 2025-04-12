import { checkAdminAccess, showDynamicAlert } from "../js/initial.js";
import {showLoader,hideLoader} from "./pagerefresh.js"

document.addEventListener("DOMContentLoaded", async () => {
  const noNumberOrWhitespaceRegex =
    /^(?!.*[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/u;

  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  const defaultImageSrc = "././assets/images/default_league_2.png";
  let existingLeagues = [];

  try {
    const response = await fetch("https://krinik.in/league_get/");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let existingLeagues1 = await response.json();
    existingLeagues = existingLeagues1.data;
    console.log(existingLeagues, "olpol");
    if (!Array.isArray(existingLeagues)) {
      throw new Error(
        "Expected array from API, but received:",
        existingLeagues
      );
    }

    console.log("Existing leagues:", existingLeagues);
  } catch (error) {
    console.error("Error fetching or processing existing leagues:", error);
  }

  let initialData = {}; // Variable to store initial data

  $(function () {
    let startPicker = flatpickr("#startDate", {
      dateFormat: "d-m-Y",
      minDate: "today", // Disable past dates
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
          endPicker.set("minDate", selectedDates[0]);
        }
      },
    });

    let endPicker = flatpickr("#end-league-date", {
      dateFormat: "d-m-Y",
      onOpen: function (selectedDates, dateStr, instance) {
        const startDate = startPicker.selectedDates[0];
        if (startDate) {
          instance.set("minDate", startDate);
        }
      },
    });

    // Open Flatpickr on calendar icon click
    $("#calendarIconStart").click(function () {
      startPicker.open();
    });
    $("#calendarIconEnd").click(function () {
      endPicker.open();
    });
  });

  function editplayerdata(response) {
    const leagueName = document.getElementById("league-name");
    const shortLeagueName = document.getElementById("short-league-name");
    const startLeagueDate = document.getElementById("startDate");
    const endLeagueDate = document.getElementById("end-league-date");
    const imageFile = document.getElementById("preview-image");

    if (response) {
      // Populate form fields
      imageFile.src = `https://krinik.in${response.league_image}`;
      leagueName.value = response.league_name;
      shortLeagueName.value = response.short_league_name;
      startLeagueDate.value = convertDateFormat(response.start_league_date);
      endLeagueDate.value = convertDateFormat(response.end_league_date);
      // Store initial data
      initialData = {
        league_name: leagueName.value,
        short_league_name: shortLeagueName.value,
        start_league_date: startLeagueDate.value,
        end_league_date: endLeagueDate.value,
        league_image: imageFile.src,
      };

      console.log("Initial data set:", initialData);
    } else {
      console.error("Data is not in the expected format:", response);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  if (id) {
    try {
      const response = await fetch(`https://krinik.in/league_get/${id}/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch league data");
      }

      const leagueData = await response.json();
      editplayerdata(leagueData.data);
    } catch (error) {
      console.error("Error fetching league data:", error);
    }
  } else {
    console.error("No id parameter found in the URL.");
  }

  async function myFetch(url, type, data) {
    try {
      let responseData;
      const res = await fetch(url, {
        method: type,
        headers: {
          "Content-Type": "application/json",
        },
        body: type === "POST" || type === "PATCH" ? JSON.stringify(data) : null,
      });
      if (res.ok) {
        responseData = await res.json();
      } else {
        console.error("HTTP request unsuccessful");
      }
      return responseData;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  function validateInput(
    inputId,
    errorId,
    regex,
    emptyMessage,
    invalidMessage
  ) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    function validate() {
      const value = input.value.trim();
      console.log(`Validating ${inputId}: `, value); // Added for debugging
      if (value === "") {
        error.innerHTML = emptyMessage;
        error.style.display = "inline";
        return false;
      } else if (!regex.test(value)) {
        error.innerHTML = invalidMessage;
        error.style.display = "inline";
        return false;
      } else {
        error.style.display = "none";
        return true;
      }
    }

    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
    return validate();
  }

  function convertDateFormat(dateString) {
    const parts = dateString.split("-");
    return parts.length === 3
      ? `${parts[0]}-${parts[1]}-${parts[2]}`
      : dateString;
  }

  function checkLeagueOverlap(leagueName, shortLeagueName, existingLeagues) {
    if (!existingLeagues || existingLeagues.length === 0) {
      return false;
    }

    const normalizedName = leagueName.trim().toLowerCase();
    const normalizedShortName = shortLeagueName.trim().toLowerCase();

    const leagueNameOverlap = existingLeagues.some((league) => {
      const normalizedExistingName = league.league_name.trim().toLowerCase();
      return normalizedExistingName === normalizedName;
    });

    const shortLeagueNameOverlap = existingLeagues.some((league) => {
      const normalizedExistingShortName = league.short_league_name
        .trim()
        .toLowerCase();
      return normalizedExistingShortName === normalizedShortName;
    });

    return leagueNameOverlap && shortLeagueNameOverlap;
  }

  async function submitFormData(data, method) {
    showLoader()
    const formData = new FormData();

    formData.append("league_name", data.league_name);
    formData.append("short_league_name", data.short_league_name);
    formData.append("start_league_date", data.start_league_date);
    formData.append("end_league_date", data.end_league_date);

    if (data.league_image instanceof File) {
      formData.append("league_image", data.league_image);
    }

    try {
      const response = await fetch(`https://krinik.in/league_get/${id}/`, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to edit league");
      }

      console.log(response);
      // alert('League edited successfully!');
      // document.getElementById('league-form').reset();
      // document.getElementById('preview-image').src = defaultImageSrc;
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while editing the league.");
    }
    hideLoader()
  }

  document.getElementById("league-form").addEventListener("submit", async function (event) {
      event.preventDefault();

      const leagueNameInput = document.getElementById("league-name");
      const shortLeagueNameInput = document.getElementById("short-league-name");
      const startLeagueDateInput = document.getElementById("startDate");
      const endLeagueDateInput = document.getElementById("end-league-date");
      const imageFileInput = document.getElementById("file-input");
      const previewImage = document.getElementById("preview-image");

      const isValidLeagueName = validateInput(
        "league-name",
        "error-league-name",
        noNumberOrWhitespaceRegex,
        "Please enter league name",
        "Please enter valid league name"
      );

      const isValidShortLeagueName = validateInput(
        "short-league-name",
        "error-short-league-name",
        noNumberOrWhitespaceRegex,
        "Please enter short league name",
        "Please enter valid short league name"
      );

      const isValidStartLeagueDate = validateInput(
        "startDate",
        "error-startDate",
        dateFormatRegex,
        "Please select start league date",
        "Please select valid start league date"
      );

      const isValidEndLeagueDate = validateInput(
        "end-league-date",
        "error-end-league-date",
        dateFormatRegex,
        "Please select end league date",
        "Please select valid end league date"
      );

      if (
        isValidLeagueName &&
        isValidShortLeagueName &&
        isValidStartLeagueDate &&
        isValidEndLeagueDate
      ) {
        const currentData = {
          league_name: leagueNameInput.value.trim(),
          short_league_name: shortLeagueNameInput.value.trim(),
          start_league_date: startLeagueDateInput.value.trim(),
          end_league_date: endLeagueDateInput.value.trim(),
          league_image: previewImage.src,
        };
        const imageFile = imageFileInput.files[0];
        if (imageFile) {
          currentData.league_image = imageFile;
        }
        const errorLeagueName = document.getElementById("error-league-name");
        const errorShortLeagueName = document.getElementById(
          "error-short-league-name"
        );
        const hasImageChanged =
          currentData.league_image !== initialData.league_image;
        const hasDateChanged =
          currentData.start_league_date !== initialData.start_league_date ||
          currentData.end_league_date !== initialData.end_league_date;
        const hasLeagueNameChanged =
          currentData.league_name !== initialData.league_name;
        const hasShortLeagueNameChanged =
          currentData.short_league_name !== initialData.short_league_name;

        // setTimeout(() => {
        //   showLoader(); // Show the loader with a delay (optional)
        // }, 100);

        // Perform the redirect and handle loader visibility
        // Promise.resolve()
        //   .then(async () => {
            if (hasImageChanged || hasDateChanged) {
              if (!confirm("are you confirm to edit it?")) {
                hideLoader(); // Hide loader if user cancels
                return;
              }
                await submitFormData(currentData, "PATCH");
                showDynamicAlert("League updated Successfully !!");

                setTimeout(() => {
                  window.location.href = "manage-league.html";
                }, 2000);
              
            
            } else {
              if (hasLeagueNameChanged) {
                const leagueNameOverlap = checkLeagueOverlap(
                  currentData.league_name,
                  initialData.short_league_name,
                  existingLeagues
                );
                if (leagueNameOverlap) {
                  errorLeagueName.innerHTML = "League name already exists";
                  errorLeagueName.style.display = "inline";
                } else {
                  if (hasShortLeagueNameChanged) {
                    const shortLeagueNameOverlap = checkLeagueOverlap(
                      initialData.league_name,
                      currentData.short_league_name,
                      existingLeagues
                    );
                    if (shortLeagueNameOverlap) {
                      errorShortLeagueName.innerHTML =
                        "League short name already exists";
                      errorShortLeagueName.style.display = "inline";
                    } else {
                      if (!confirm("are you confirm to edit it?")) {
                        hideLoader(); // Hide loader if user cancels
                        return;
                      }
                        await submitFormData(currentData, "PATCH");
                        showDynamicAlert("League updated Successfully !!");

                        setTimeout(() => {
                          window.location.href = "manage-league.html";
                        }, 3000);
                      
              
                      
                    }
                  } else {
                    if (!confirm("are you confirm to edit it?")) {
                      hideLoader(); // Hide loader if user cancels
                      return;
                    }
                    
                      await submitFormData(currentData, "PATCH");
                      showDynamicAlert("League updated Successfully !!");

                      setTimeout(() => {
                        window.location.href = "manage-league.html";
                      }, 3000);
                    
             

                  }
                }
              } else if (hasShortLeagueNameChanged) {
                const shortLeagueNameOverlap = checkLeagueOverlap(
                  initialData.league_name,
                  currentData.short_league_name,
                  existingLeagues
                );
                if (shortLeagueNameOverlap) {
                  errorShortLeagueName.innerHTML =
                    "League short name already exists";
                  errorShortLeagueName.style.display = "inline";
                } else {
                  if (!confirm("are you confirm to edit it?")) {
                    hideLoader(); // Hide loader if user cancels
                    return;
                  }
               
                    await submitFormData(currentData, "PATCH");
                    showDynamicAlert("League updated Successfully !!");

                    setTimeout(() => {
                      window.location.href = "manage-league.html";
                    }, 3000);
                 
             

                }
              } else {
                if (!confirm("are you confirm to edit it?")) {
                  hideLoader(); // Hide loader if user cancels
                  return;
                }
                
                  await submitFormData(initialData, "PATCH");
                  window.location.href = "manage-league.html";
               
            

              }
            }
          // })
          // .then(() => {
          //   hideLoader(); // Hide the loader after the redirect
          // })
          // .catch((err) => {
          //   console.error("An error occurred during the redirect:", err);
          //   hideLoader(); // Ensure loader hides if an error occurs
          // });
        // } else {
        // console.error("No redirect function provided.");
        // hideLoader();
      } else {
        console.log("Form validation failed. Please check all fields.");
      }
    });

  function toCapitalizeCase(str) {
    return str.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  document
    .getElementById("league-name")
    .addEventListener("input", function (event) {
      this.value = toCapitalizeCase(this.value);
    });

  document
    .getElementById("short-league-name")
    .addEventListener("input", function (event) {
      this.value = this.value.toUpperCase();
    });

  // Event listener for file input change (to update preview image)
  document
    .getElementById("file-input")
    .addEventListener("change", function (event) {
      const imageFile = event.target.files[0];
      const previewImage = document.getElementById("preview-image");

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
      }
    });

    window.addEventListener('pageshow', function (event) {
      if (event.persisted || (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD)) {
          // Reload the page only once
          window.location.reload();
      }
    });
  window.onload = checkAdminAccess();
});
