// loader.js
export function redirectToPage(targetUrl, maxWaitTime = 10000) {
  // Show the loader
  document.getElementById("loader").style.display = "block";
  document.getElementById("content").style.display = "none";

  // Set a timeout as a fallback in case the page takes too long to load
  let fallbackTimeout = setTimeout(function() {
      console.warn("Redirecting due to timeout...");
      window.location.href = targetUrl;
  }, maxWaitTime);

  // Perform your async tasks or checks here
  // Once done, redirect and clear the timeout
  // This is just an example. Replace with your actual async logic.
  setTimeout(() => {
      clearTimeout(fallbackTimeout); // Clear the fallback timeout
      window.location.href = targetUrl; // Redirect after your logic is done
  }, 100


); // Example: Wait for 3 seconds before redirecting
}
