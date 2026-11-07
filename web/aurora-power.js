/*
 * Samsung on-device local remote controller, EXPERIMENTAL.
 * No public Tizen TV PowerOff API exists. This uses Samsung MSF virtual remote
 * over localhost; firmware may block loopback, reject WebSocket origin, or pair.
 * Only call powerOff on explicit test or after user has verified a test.
 */
var AuroraPower = (function () {
  'use strict';
  var VERIFIED = 'aurora.power.verified';
  function trusted() { try { return localStorage.getItem(VERIFIED)==='yes'; } catch(e){return false;} }
  function trust() { try { localStorage.setItem(VERIFIED,'yes'); } catch(e){} }
  function revoke() { try { localStorage.removeItem(VERIFIED); } catch(e){} }
  function powerOff(done) {
    if (!window.tizen) { done(false,'Disponibile solo sulla TV Samsung.'); return; }
    var ws,ended=false,timeout;
    function finish(ok,message) {
      if(ended)return;
      ended=true;
      clearTimeout(timeout);
      try { if(ws)ws.close(); }catch(e){}
      if(done)done(ok,message);
    }
    try {
      // Port 8001 avoids an invalid self-signed TLS certificate on port 8002;
      // both endpoints may be unavailable to an in-TV Tizen Web app.
      var name=window.btoa('AuroraTV');
      ws=new WebSocket('ws://127.0.0.1:8001/api/v2/channels/samsung.remote.control?name='+name);
      timeout=setTimeout(function(){finish(false,'Connessione al controllo remoto locale scaduta.');},9000);
      ws.onmessage=function(ev) {
        var data;
        try { data=JSON.parse(ev.data); }catch(e){return;}
        if(data.event==='ms.channel.connect') {
          try {
            ws.send(JSON.stringify({method:'ms.remote.control',params:{Cmd:'Click',DataOfCmd:'KEY_POWEROFF',Option:'false',TypeOfRemote:'SendRemoteKey'}}));
            finish(true,'Comando inviato: verifica che la TV si sia spenta.');
          }catch(e){finish(false,'Comando rifiutato: '+e.message);}
        }
        if(data.event==='ms.channel.unauthorized') finish(false,'Autorizzazione telecomando negata.');
      };
      ws.onerror=function(){finish(false,'WebSocket locale non disponibile su questa TV.');};
      ws.onclose=function(){if(!ended)finish(false,'Connessione telecomando chiusa.');};
    } catch(e){finish(false,'Controllo remoto non supportato: '+e.message);}
  }
  return {powerOff:powerOff,trusted:trusted,trust:trust,revoke:revoke};
})();
