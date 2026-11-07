/*
 * Aurora sleep timer (experimental on Samsung TV).
 * System alarms schedule an app launch, NOT a system TV sleep timer.
 * The TV remote-control WebSocket is undocumented for in-TV web apps.
 * Explicit validation is required before enabling automatic power-off.
 */
var AuroraSleep = (function () {
  'use strict';
  var KEY = 'aurora.sleep.deadline', ALARM = 'aurora.sleep.alarm';
  var overlay, selected = 0, buttons = [], deadline = 0;
  var supported = !!(window.tizen && tizen.alarm && tizen.application);
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k,v) { try { localStorage.setItem(k,String(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function ensure() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'aurora-timer';
    overlay.style.display = 'none';
    overlay.innerHTML = '<div class="aurora-timer-box"><div class="aurora-timer-kicker">AURORA BOREALIS</div>'+
      '<div class="aurora-timer-title">Spegnimento automatico</div>'+
      '<p class="aurora-timer-description">Programma 60 o 120 minuti senza aprire Smart Hub.</p>'+
      '<div class="aurora-timer-actions">'+
      '<button data-duration="60">60 minuti</button><button data-duration="120">120 minuti</button>'+
      '<button data-duration="0">Annulla timer</button><button data-duration="-1">Chiudi</button></div>'+
      '<p class="aurora-timer-status"></p>'+
      '<p class="aurora-timer-warning">Funzione sperimentale. Lo spegnimento dipende dalla compatibilità del controllo remoto locale; non è ancora verificato sulla Q74T.</p></div>';
    document.getElementById('stage').appendChild(overlay);
    buttons = [].slice.call(overlay.querySelectorAll('button'));
    for (var i = 0; i < buttons.length; i++) (function(index) {
      buttons[index].onclick = function () { select(index); };
    })(i);
    refresh();
  }
  function status(message) {
    if (!overlay) return;
    overlay.querySelector('.aurora-timer-status').textContent = message;
  }
  function refresh() {
    if (!overlay) return;
    deadline = parseInt(read(KEY),10) || 0;
    var now = Date.now();
    if (deadline > now) status('Timer impostato: mancano circa ' + Math.ceil((deadline-now)/60000) + ' minuti.');
    else if (deadline) status('Timer scaduto: spegnimento non confermato.');
    else status(supported ? 'Nessun timer attivo.' : 'Anteprima: programmazione disponibile soltanto sulla TV Samsung.');
  }
  function focus(index) {
    selected = (index + buttons.length) % buttons.length;
    for (var i=0;i<buttons.length;i++) buttons[i].className = i===selected ? 'selected':'';
  }
  function cancel() {
    if (supported) {
      var alarmId = read(ALARM);
      if (alarmId) try { tizen.alarm.remove(alarmId); } catch(e) {}
    }
    drop(ALARM);drop(KEY);refresh();
  }
  function schedule(minutes) {
    if (!supported) { status('Il timer richiede Tizen: il browser mostra soltanto l’anteprima.'); return; }
    try {
      cancel();
      var seconds = minutes*60;
      var alarm = new tizen.AlarmRelative(seconds);
      var appId = tizen.application.getCurrentApplication().appInfo.id;
      tizen.alarm.add(alarm,appId);
      write(KEY,Date.now()+seconds*1000);
      write(ALARM,alarm.id);
      refresh();
    } catch(e) {
      cancel();
      status('Impossibile programmare il timer su questa TV: ' + (e.message||e));
    }
  }
  function select(i) {
    if (i===0) schedule(60);
    if (i===1) schedule(120);
    if (i===2) cancel();
    if (i===3) close();
  }
  function open() {
    ensure();
    overlay.style.display='block';
    focus(0);refresh();
  }
  function close() { if (overlay) overlay.style.display='none'; }
  function visible() { return !!(overlay && overlay.style.display==='block'); }
  function onKey(e) {
    if (!visible()) return;
    var k=e.keyCode;
    if (k===37 || k===38) focus(selected-1);
    else if (k===39 || k===40) focus(selected+1);
    else if (k===13) select(selected);
    else if (k===10009 || k===27 || k===8) close();
    else return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }
  document.addEventListener('keydown',onKey,true);
  // Never send an unvalidated power command automatically. An alarm may reopen this
  // app above a playing video; scheduling alone is not equivalent to TV power-off.
  function inspectExpiry() {
    var expiry=parseInt(read(KEY),10)||0;
    if(expiry && expiry<=Date.now()) {
      // Preserve the state and announce it on the next visit rather than claiming the TV is off.
      if (window.console) console.warn('Aurora sleep alarm expired: TV power command not yet verified on device.');
    }
  }
  inspectExpiry();
  return {open:open,close:close,visible:visible};
})();
