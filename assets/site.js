(() => {
  const nav = document.querySelector('#nav');
  const form = document.querySelector('#passkey-form');
  const input = document.querySelector('#passkey');
  const message = document.querySelector('#message');
  const lockButton = document.querySelector('#lock-button');
  const transition = document.querySelector('#transition');
  const submitButton = form ? form.querySelector('button') : null;

  const publicRows = [
    ['001', '/001/'],
    ['002', '/002/'],
    ['003', '#unlock', true]
  ];
  const privateRows = [
    ['001', '/001/'],
    ['002', '/002/'],
    ['003', '/003/'],
    ['003.1', '/003.1/'],
    ['003.2', '/003.2/']
  ];

  function renderRows(unlocked) {
    const rows = unlocked ? privateRows : publicRows;
    nav.innerHTML = rows.map(([number, href, locked]) => (
      `<a class="row" href="${href}"${locked ? ' data-locked="true"' : ''}>` +
      `<span>${number}</span>${locked ? '<span class="lock-mark" aria-label="locked">●</span>' : ''}</a>`
    )).join('');
  }

  function setUnlocked(unlocked) {
    renderRows(unlocked);
    form.hidden = unlocked;
    lockButton.hidden = !unlocked;
  }

  async function getSession() {
    const response = await fetch('/api/session', {
      credentials: 'same-origin',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Session request failed');
    return response.json();
  }

  async function refresh() {
    renderRows(false);
    try {
      const session = await getSession();
      setUnlocked(Boolean(session.unlocked));
    } catch {
      setUnlocked(false);
    }
  }

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('[data-locked="true"]');
    if (!link) return;
    event.preventDefault();
    input.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    submitButton.disabled = true;
    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ passkey: input.value.trim() })
      });
      if (!response.ok) {
        message.textContent = 'not for everybody.';
        return;
      }
      transition.hidden = false;
      window.setTimeout(async () => {
        transition.hidden = true;
        input.value = '';
        await refresh();
      }, 21500);
    } catch {
      message.textContent = 'try again.';
    } finally {
      submitButton.disabled = false;
    }
  });

  lockButton.addEventListener('click', async () => {
    try {
      await fetch('/api/lock', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setUnlocked(false);
    }
  });

  refresh();
})();
