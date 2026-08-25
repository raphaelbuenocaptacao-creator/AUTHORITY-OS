/* Authority OS — AI/API bridge (safe for GitHub Pages + Vercel)
   - On Vercel, /api/* runs server-side and can use secrets.
   - On GitHub Pages, the UI keeps working in demo/local mode until API_BASE is configured.
*/
(function () {
  const KEY = 'authority_os_api_base';
  const defaultBase = location.hostname.endsWith('vercel.app') ? '' : (localStorage.getItem(KEY) || '');

  async function post(path, payload) {
    const base = localStorage.getItem(KEY) || defaultBase;
    if (!base && location.hostname.includes('github.io')) {
      return { ok: false, demo: true, error: 'API não conectada', needsApiBase: true };
    }
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  window.AuthorityAPI = {
    setBase(url) {
      const clean = String(url || '').trim().replace(/\/$/, '');
      if (!clean) localStorage.removeItem(KEY); else localStorage.setItem(KEY, clean);
      return clean;
    },
    getBase() { return localStorage.getItem(KEY) || defaultBase; },
    health() {
      const base = localStorage.getItem(KEY) || defaultBase;
      if (!base && location.hostname.includes('github.io')) return Promise.resolve({ ok: false, demo: true });
      return fetch(`${base}/api/health`).then(r => r.json());
    },
    strategy(input) { return post('/api/agent', { input }); },
    automate(action, payload) { return post('/api/n8n', { action, payload }); }
  };
})();
