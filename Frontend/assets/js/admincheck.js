import { initializePage} from './initial.js';


  const LOCAL_STORAGE_KEY = 'adminType'; // Renamed to match the key used in session storage

  // Function to get a value from session storage
  function getsessionStorage(key) {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item).value : null;
  }
  
  // Function to remove a key from session storage
  // function erasesessionStorage(key) {
  //   sessionStorage.removeItem(key);
  // }
 
  function checksessionStorageExpiration() {
    const adminType = getsessionStorage(LOCAL_STORAGE_KEY); // Use LOCAL_STORAGE_KEY constant
  
    console.log("Checking session storage:");
    console.log("Admin Type:", adminType);
    console.log("Redirected flag:", sessionStorage.getItem("redirected"));
  
    // Redirect if not logged in and 'redirected' flag is not set
    if (!adminType && !sessionStorage.getItem("redirected")) {
      console.log("Redirecting to index.html");
      sessionStorage.setItem("redirected", "true");
      window.location.replace("./index.html");
    } else if (adminType) {
      // If user is logged in, clear any previous 'redirected' flag
      sessionStorage.removeItem("redirected");
      console.log("User is authenticated, removing 'redirected' flag.");
    }}
    
    

  function startLogoutTimer() {
 
  
    const adminType = getsessionStorage('adminType');
   
      if(adminType === 'admin'){
        initializePage();
      }
      // if (adminType === 'super admin') {
       
      //   initializePage2()
      // }
  
  }
  
  window.onload = () => {
    checksessionStorageExpiration();
    startLogoutTimer()
  };
  




  //  function initializePage() {

    //   const elements = document.querySelectorAll("button, input, select, textarea, a,li,div,th,td,span,i");
     
    
    //   elements.forEach(element => {
    
    
    //       if (element.classList.contains("otp-exempt") ) {
             
    //           element.style.display = "block";
    //       } 
    
          
    //   });
    // }