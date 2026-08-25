/* Optional bootstrap for Authority OS API integration.
   Add <script src="app-api.js"></script><script src="integration-loader.js"></script> to index.html when the UI is ready to consume the server endpoints. */
(function(){
  if (!window.AuthorityAPI) return;
  window.AuthorityOSIntegration = {
    async status(){
      try {
        const base = window.AuthorityAPI.getBase();
        if (!base && location.hostname.includes('github.io')) return {ok:false, demo:true, reason:'backend-not-configured'};
        const r = await fetch(`${base}/api/status`);
        return await r.json();
      } catch (e) {
        return {ok:false, error:e.message};
      }
    },
    async runStrategy(profile){
      return window.AuthorityAPI.strategy(profile);
    },
    async runAutomation(action,payload){
      return window.AuthorityAPI.automate(action,payload);
    }
  };
})();
