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

  window.addEventListener('load', () => {
    const originalCreateContent = window.createContent;
    const originalRecalculateScore = window.recalculateScore;
    const originalRenderContent = window.renderContent;

    if (typeof originalCreateContent === 'function') {
      window.createContent = async function createContentWithAI(){
        const type = document.getElementById('contentType')?.value || 'Reel';
        const objective = document.getElementById('contentObjective')?.value || 'Autoridade';
        const theme = document.getElementById('contentTheme')?.value?.trim() || '';
        const base = window.AuthorityAPI.getBase();

        if (!base && location.hostname.includes('github.io')) return originalCreateContent();

        try {
          const button = document.querySelector('#contentModal .btn.primary');
          if (button) { button.classList.add('loading'); button.textContent = 'Criando com IA...'; }
          const result = await window.AuthorityAPI.content({
            ...(typeof state !== 'undefined' ? state.profile : {}),
            format: type,
            objective,
            theme
          });

          if (!result?.ok || !result?.content) return originalCreateContent();
          const c = result.content;
          const copy = [
            c.hook ? `GANCHO: ${c.hook}` : '',
            c.script ? `ROTEIRO:\n${c.script}` : '',
            c.caption ? `LEGENDA:\n${c.caption}` : '',
            c.cta ? `CTA: ${c.cta}` : ''
          ].filter(Boolean).join('\n\n');

          state.content.unshift({
            id: Date.now(),
            type: c.format || type,
            objective: c.objective || objective,
            theme: c.title || theme || 'Conteúdo estratégico',
            copy,
            status: 'Rascunho IA',
            provider: result.provider || 'demo',
            date: new Date().toLocaleDateString('pt-BR')
          });
          state.score = Math.min(98, Number(state.score || 0) + 1);
          save();
          closeModal('contentModal');
          showView('content');
          toast(result.provider === 'gemini' ? 'Conteúdo criado com Gemini.' : 'Conteúdo criado em modo demonstração.');
        } catch (error) {
          console.error(error);
          toast('IA indisponível; usando gerador local.');
          originalCreateContent();
        } finally {
          const button = document.querySelector('#contentModal .btn.primary');
          if (button) { button.classList.remove('loading'); button.textContent = 'Gerar roteiro'; }
        }
      };
    }

    if (typeof originalRecalculateScore === 'function') {
      window.recalculateScore = async function recalculateScoreWithAI(){
        const base = window.AuthorityAPI.getBase();
        if (!base && location.hostname.includes('github.io')) return originalRecalculateScore();

        try {
          const result = await window.AuthorityAPI.audit({
            ...(typeof state !== 'undefined' ? state.profile : {}),
            metrics: typeof state !== 'undefined' ? state.metrics : {},
            recentContent: typeof state !== 'undefined' ? state.content.slice(0,5) : []
          });
          if (!result?.ok || !result?.audit) return originalRecalculateScore();
          const audit = result.audit;
          if (Number.isFinite(Number(audit.score))) state.score = Math.max(0, Math.min(100, Number(audit.score)));
          state.lastAudit = audit;
          save();
          toast(result.provider === 'gemini' ? 'Authority Score recalculado com IA.' : 'Diagnóstico atualizado em modo demonstração.');
        } catch (error) {
          console.error(error);
          originalRecalculateScore();
        }
      };
    }

    if (typeof originalRenderContent === 'function') {
      window.renderContent = function renderContentWithPublish(){
        originalRenderContent();
        document.querySelectorAll('#contentList .contentCard').forEach((card, index) => {
          if (card.querySelector('[data-publish]')) return;
          const item = state.content[index];
          if (!item || !['Pronto','Rascunho IA'].includes(item.status)) return;
          const actions = card.querySelector('div:last-child');
          if (!actions) return;
          const btn = document.createElement('button');
          btn.className = 'btn';
          btn.dataset.publish = '1';
          btn.textContent = 'Enviar para aprovação';
          btn.onclick = async () => {
            try {
              const channels = ['instagram'];
              const r = await window.AuthorityAPI.publish({ approved: true, channels, content: item, scheduledFor: null });
              if (r?.ok) {
                item.status = r.demo ? 'Aprovado (demo)' : 'Enviado ao n8n';
                save();
                toast(r.demo ? 'Aprovado em modo demonstração.' : 'Conteúdo enviado para publicação.');
              }
            } catch (e) {
              toast('Não foi possível enviar para publicação.');
            }
          };
          actions.appendChild(document.createTextNode(' '));
          actions.appendChild(btn);
        });
      };
    }
  });
})();
