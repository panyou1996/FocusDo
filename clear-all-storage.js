if (typeof window !== 'undefined') {
  console.log('Clearing all storage...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('Storage cleared, reloading page...');
  window.location.reload();
}