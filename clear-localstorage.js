// Script to clear localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  window.localStorage.clear();
  console.log('localStorage cleared successfully');
} else {
  console.log('localStorage not available');
}