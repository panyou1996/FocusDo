if (typeof window !== 'undefined') {
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.reload();
  } catch (error) {
    console.error('Error clearing storage', error);
  }
}