(async () => {
  document.documentElement.style.visibility = 'hidden';
  try {
    const response = await fetch('/api/session', {
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const session = await response.json();
    if (!session.unlocked) {
      window.location.replace('/');
      return;
    }
    document.documentElement.style.visibility = '';
  } catch {
    window.location.replace('/');
  }
})();
