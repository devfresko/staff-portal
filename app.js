// ════════════════════════════════════════════════════════════════════════════
// app.js — Fresko Staff Portal v4.1
// ─────────────────────────────────────────────────────────────────────────
// Core utilities extracted from index.html.
// Load order: appconfig.js → app.js → index.html (inline script)
//
// NOTE: index.html ke inline <script> mein _U, _D, GAS_URL defined hain.
//       app.js window scope mein yeh functions define karta hai jo baad mein
//       index.html ke inline code ke saath share hote hain.
// ════════════════════════════════════════════════════════════════════════════

(function(W) {
  'use strict';

  // ── GAS URL: appconfig.js se milta hai ───────────────────────────────────
  // window.GAS_URL appconfig.js mein set hota hai — yahan override mat karo

  // ════════════════════════════════════════════════════════════════════════
  // DATE / TIME UTILITIES
  // ════════════════════════════════════════════════════════════════════════

  // Universal date parser — sab formats handle karta hai:
  // "2026-08-10", "2026-08-10T14:30:00", "dd/MM/yyyy HH:mm:ss",
  // "Apr 01 2026 00:00:00 GMT+0530 (India Standard Time)"
  W._parseAnyDate = function(s) {
    if (!s) return null;
    var str = String(s).trim();
    if (!str || str === '-' || str === 'undefined' || str === 'null') return null;

    // Raw JS Date.toString(): "Apr 01 2026 00:00:00 GMT+0530..."
    var gmtMatch = str.match(/([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{2}:\d{2}:\d{2})/);
    if (gmtMatch) {
      var moMap = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
      var d = new Date(parseInt(gmtMatch[3]), moMap[gmtMatch[1]], parseInt(gmtMatch[2]));
      var tp = gmtMatch[4].split(':');
      d.setHours(parseInt(tp[0]), parseInt(tp[1]), parseInt(tp[2]));
      return isNaN(d.getTime()) ? null : d;
    }
    // dd/MM/yyyy HH:mm:ss (GAS / AppSheet format)
    var ddmm = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{2}:\d{2})(?::\d{2})?)?/);
    if (ddmm) {
      var d2 = new Date(parseInt(ddmm[3]), parseInt(ddmm[2])-1, parseInt(ddmm[1]));
      if (ddmm[4]) { var t2=ddmm[4].split(':'); d2.setHours(parseInt(t2[0]),parseInt(t2[1])); }
      return isNaN(d2.getTime()) ? null : d2;
    }
    // ISO / standard
    var normalized = str.length === 10 ? str + 'T00:00:00' : str.replace(' ','T');
    var d3 = new Date(normalized);
    return isNaN(d3.getTime()) ? null : d3;
  };

  W._today = function() { return new Date().toISOString().slice(0, 10); };
  W._currMonth = function() { return new Date().toISOString().slice(0, 7); };
  W._daysAgo = function(n) { var d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  W._daysLater = function(n) { var d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  W._fmtDate = function(s) {
    if (!s || s==='-'||s==='undefined'||s==='null') return '—';
    try {
      var d=W._parseAnyDate(s); if (!d) return String(s).substring(0,16);
      // Always show year: "8 Aug 2026"
      return d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear();
    } catch(e){return s;}
  };
  W._fmtDateShort = function(s) {
    if (!s||s==='-') return '—';
    try {
      var d=W._parseAnyDate(s); if (!d) return String(s).substring(0,10);
      // With year always: "8 Aug 2026"
      return d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear();
    } catch(e){return s;}
  };
  W._fmtDateTime = function(s) {
    if (!s||s==='-') return '—';
    try {
      var d=W._parseAnyDate(s); if (!d) return String(s).substring(0,16);
      // "8 Aug 2026 11:00 AM"
      var mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var h=d.getHours(), mi=d.getMinutes();
      var ap=h>=12?'PM':'AM', h12=h%12||12;
      var mStr=(mi<10?'0':'')+mi;
      return d.getDate()+' '+mn[d.getMonth()]+' '+d.getFullYear()+' '+h12+':'+mStr+' '+ap;
    } catch(e){return s;}
  };
  W._fmtTimestamp = function(s) {
    if (!s) return '—';
    try {
      var d=W._parseAnyDate(s); if (!d) return String(s).substring(0,16);
      var now=new Date(), diff=now-d;
      if (diff<60000) return 'Just now';
      if (diff<3600000) return Math.floor(diff/60000)+'m ago';
      if (diff<86400000) return Math.floor(diff/3600000)+'h ago';
      if (diff<604800000) return Math.floor(diff/86400000)+'d ago';
      return W._fmtDate(s);
    } catch(e){return s;}
  };

  // Smart short timestamp: "Today 10:30 AM", "Yesterday 2:05 PM", "8 Aug 9:00 AM"
  W._tsShort = function(ts) {
    if (!ts) return '';
    var s = String(ts).trim();
    if (s==='-'||s==='undefined'||s==='null'||s==='') return '—';
    var d = W._parseAnyDate(s);
    if (!d||isNaN(d.getTime())) return s.substring(0,16);

    // Extract time from original string
    var hhmm='';
    var spaceIdx = s.search(/\s+\d{2}:\d{2}/);
    if (spaceIdx>-1) hhmm = s.substring(spaceIdx).trim().substring(0,5);
    var tIdx = s.indexOf('T');
    if (!hhmm && tIdx>0) hhmm = s.substring(tIdx+1,tIdx+6);
    if (!hhmm) { var gm=s.match(/(\d{2}:\d{2}):\d{2}\s*(?:GMT|$)/); if(gm) hhmm=gm[1]; }

    function _to12(hm) {
      if (!hm||hm==='00:00') return '';
      var p=hm.split(':'),h=parseInt(p[0],10),m=parseInt(p[1],10);
      var ap=h>=12?'PM':'AM', h12=h%12||12;
      return h12+':'+(m<10?'0':'')+m+' '+ap;
    }
    var timeStr = _to12(hhmm);
    var today0=new Date(); today0.setHours(0,0,0,0);
    var yest0=new Date(today0); yest0.setDate(today0.getDate()-1);
    var d0=new Date(d); d0.setHours(0,0,0,0);
    var mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var prefix;
    if (d0.getTime()===today0.getTime()) prefix='Today';
    else if (d0.getTime()===yest0.getTime()) prefix='Yesterday';
    else prefix=d.getDate()+' '+mn[d.getMonth()]+' '+d.getFullYear();  // always show year
    return timeStr ? prefix+' '+timeStr : prefix;
  };

  W._dl = function(dateStr) {
    if (!dateStr) return null;
    var diff = new Date(dateStr+'T00:00:00') - new Date(W._today()+'T00:00:00');
    return Math.round(diff/86400000);
  };
  W._dayName = function(dateStr) {
    try { return new Date(dateStr+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long'}); } catch(e){return '';}
  };
  W._isoWeek = function(d) {
    d = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
    d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
    var ys=new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d-ys)/86400000)+1)/7);
  };
  W._currentWeek = function() { return W._isoWeek(new Date()); };

  // ════════════════════════════════════════════════════════════════════════
  // STRING UTILITIES
  // ════════════════════════════════════════════════════════════════════════
  W._esc = function(s) {
    if (s===null||s===undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  };
  W._req = function(v, label) {
    if (!v || !String(v).trim()) { W._toast((label||'Field')+' is required','warn'); return false; }
    return true;
  };

  // ════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════
  var SESSION_KEY = (W.APP_CONFIG && W.APP_CONFIG.SESSION_KEY) || 'fk_session_v2';
  var SESSION_HOURS = (W.APP_CONFIG && W.APP_CONFIG.SESSION_HOURS) || 12;

  W._saveSession = function(user, token) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        user: user, token: token,
        exp: Date.now() + SESSION_HOURS * 3600000
      }));
    } catch(e) {}
  };
  W._loadSession = function() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.user || !s.token || Date.now() >= (s.exp||0)) return null;
      return s;
    } catch(e) { return null; }
  };
  W._clearSession = function() {
    try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
  };

  // ════════════════════════════════════════════════════════════════════════
  // GAS API BRIDGE
  // ════════════════════════════════════════════════════════════════════════
  // _U (logged-in user) is defined in index.html inline script.
  // _gas/_gasX use window._U so they work after index.html sets it.

  W._gas = function _gas(fn, args, onOk, onErr, _retryCount) {
    if (typeof W._lbShow === 'function') W._lbShow();
    var GAS_URL = W.GAS_URL || (W.APP_CONFIG && W.APP_CONFIG.GAS_URL) || '';
    var sendArgs = (args || []).concat([W._U || null]);
    var cb  = '_cb' + Date.now() + Math.floor(Math.random()*9999);
    var payload = encodeURIComponent(JSON.stringify({action:fn, args:sendArgs}));
    var url = GAS_URL + '?callback=' + cb + '&payload=' + payload;
    var done=false, script=document.createElement('script');
    var retries=_retryCount||0;
    var timer = setTimeout(function(){
      if(done) return; done=true;
      if (typeof W._lbHide==='function') W._lbHide();
      script.remove(); delete W[cb];
      if (retries<1) { setTimeout(function(){ W._gas(fn,args,onOk,onErr,1); },1000); return; }
      if (onErr) onErr({message:'Network error. Check connection.'});
      else if (typeof W._toast==='function') W._toast('Connection error — tap to retry','err');
    }, 25000);
    W[cb] = function(data){
      if(done) return; done=true;
      if (typeof W._lbHide==='function') W._lbHide();
      clearTimeout(timer); script.remove(); delete W[cb];
      if (data&&data.success===false&&data.error) { if(onErr) onErr({message:data.error}); else if(typeof W._toast==='function') W._toast('Error: '+data.error,'err'); }
      else { if(onOk) onOk(data); }
    };
    script.onerror=function(){
      if(done) return; done=true; clearTimeout(timer); script.remove(); delete W[cb];
      if(onErr) onErr({message:'Network error.'}); else if(typeof W._toast==='function') W._toast('Network error.','err');
    };
    script.src=url; document.head.appendChild(script);
  };

  W._gasX = function(fn, args, timeout, onOk, onErr) {
    var GAS_URL = W.GAS_URL || (W.APP_CONFIG && W.APP_CONFIG.GAS_URL) || '';
    var sendArgs = (args||[]).concat([W._U||null]);
    var cb = '_cb'+Date.now()+Math.floor(Math.random()*9999);
    var payload = encodeURIComponent(JSON.stringify({action:fn,args:sendArgs}));
    var url = GAS_URL+'?callback='+cb+'&payload='+payload;
    var done=false, script=document.createElement('script');
    var timer=setTimeout(function(){
      if(done) return; done=true; script.remove(); delete W[cb];
      if(onErr) onErr({message:'Request timeout after '+(timeout/1000)+'s'});
    }, timeout||15000);
    W[cb]=function(data){
      if(done) return; done=true; clearTimeout(timer); script.remove(); delete W[cb];
      if(data&&data.success===false&&data.error){ if(onErr) onErr({message:data.error}); }
      else { if(onOk) onOk(data); }
    };
    script.onerror=function(){
      if(done) return; done=true; clearTimeout(timer); script.remove(); delete W[cb];
      if(onErr) onErr({message:'Network error'});
    };
    script.src=url; document.head.appendChild(script);
  };

  // ════════════════════════════════════════════════════════════════════════
  // CSV DOWNLOAD HELPER
  // ════════════════════════════════════════════════════════════════════════
  W._downloadCSV = function(filename, rows) {
    var csv = rows.map(function(r){
      return r.map(function(c){ return '"'+String(c===null||c===undefined?'':c).replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
    var a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
    a.download = filename; a.style.display='none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

})(window);
