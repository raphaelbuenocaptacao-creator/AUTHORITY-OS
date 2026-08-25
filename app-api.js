/* Authority OS — AI/API bridge (safe for GitHub Pages + Vercel)
   - On Vercel, /api/* runs server-side and can use secrets.
   - On GitHub Pages, the UI keeps working in demo/local mode until API_BASE is configured.
*/
(function () {
  const KEY = 'authority_os_api_base';
  const defaultBase = location.hostname.endsWith('vercel.app') ? '' : (localStorage.getItem(KEY) || '');

  function getBase(){
    return localStorage.getItem(KEY) || defaultBase;
  }

  async function request(path, options={}) {
    const base = getBase();
    if (!base && location.hostname.includes('github.io')) {
      return { ok: false, demo: true, error: 'API não conectada', needsApiBase: true };
    }
    const response = await fetch(`${base}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  function post(path, payload) {
    return request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
  }

  window.AuthorityAPI = {
    setBase(url) {
      const clean = String(url || '').trim().replace(/\/$/, '');
      if (!clean) localStorage.removeItem(KEY); else localStorage.setItem(KEY, clean);
      return clean;
    },
    getBase,
    health() {
      const base = getBase();
      if (!base && location.hostname.includes('github.io')) return Promise.resolve({ ok: false, demo: true });
      return request('/api/health');
    },
    status() {
      const base = getBase();
      if (!base && location.hostname.includes('github.io')) return Promise.resolve({ ok: false, demo: true, mode: 'local' });
      return request('/api/status');
    },
    strategy(input) { return post('/api/agent', { input }); },
    content(input) { return post('/api/content', input); },
    audit(input) { return post('/api/audit', input); },
    automate(action, payload) { return post('/api/n8n', { action, payload }); },
    publish({ approved, channels, content, scheduledFor }) {
      return post('/api/publish', { approved, channels, content, scheduledFor });
    }
  };
})();
