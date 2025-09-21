// Script to clear localStorage and sessionStorage
(function() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    if (window.localStorage) {
      window.localStorage.clear();
      console.log('localStorage cleared');
    }
    
    // Clear sessionStorage
    if (window.sessionStorage) {
      window.sessionStorage.clear();
      console.log('sessionStorage cleared');
    }
    
    // Reload the page
    window.location.reload();
    console.log('Page reloaded');
  } else {
    console.log('Not running in a browser environment');
  }
})();