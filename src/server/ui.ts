/** The single-page web UI served by `leadjet serve`. Self-contained, no deps. */
export const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>leadjet</title>
<style>
:root{
  --bg:#f1ebe1;--panel:#fbf8f3;--card:#fff;--ink:#2c2620;--mut:#8f8578;--line:#e6dccd;
  --acc:#bd5d2e;--acc-d:#a44e23;--ok:#3f7d54;--shadow:0 1px 2px rgba(60,40,20,.05),0 6px 20px rgba(60,40,20,.05);
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;font:13.5px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
.app{display:grid;grid-template-columns:312px 1fr;height:100vh}
/* sidebar */
.side{background:var(--panel);border-right:1px solid var(--line);padding:20px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.brand{font-size:21px;font-weight:800;letter-spacing:-.03em}
.brand b{color:var(--acc)}
.brand .tag{display:block;font-size:11.5px;font-weight:500;color:var(--mut);letter-spacing:0;margin-top:1px}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--mut)}
.field input,.field select{padding:9px 11px;border:1px solid var(--line);border-radius:9px;font-size:13px;background:#fff;color:var(--ink);width:100%}
.field input:focus,.field select:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 3px rgba(189,93,46,.1)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.toggles{display:flex;flex-direction:column;gap:8px;padding:2px 0}
.tog{display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;user-select:none}
.tog input{width:15px;height:15px;accent-color:var(--acc)}
.go{padding:11px;border:0;border-radius:10px;background:var(--acc);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s}
.go:hover{background:var(--acc-d)}.go:disabled{opacity:.55;cursor:default}
.bar{height:4px;background:var(--line);border-radius:3px;overflow:hidden}
.bar > i{display:block;height:100%;width:0;background:var(--acc);transition:width .25s}
.status{font-size:12px;color:var(--mut);min-height:16px}
.stats{display:flex;gap:7px}
.stat{flex:1;background:#fff;border:1px solid var(--line);border-radius:9px;padding:8px 6px;text-align:center}
.stat b{display:block;font-size:17px;font-weight:800;font-variant-numeric:tabular-nums}
.stat span{font-size:10px;text-transform:uppercase;letter-spacing:.03em;color:var(--mut)}
.stat.hot b{color:#b03f1f}
details.settings{border-top:1px solid var(--line);padding-top:14px;margin-top:auto}
details.settings summary{cursor:pointer;font-size:12px;font-weight:700;color:var(--ink);list-style:none;display:flex;align-items:center;gap:7px}
details.settings summary::-webkit-details-marker{display:none}
.gear{width:15px;height:15px;opacity:.6}
.set-body{margin-top:12px;display:flex;flex-direction:column;gap:9px}
.keyrow{display:flex;gap:7px}
.keyrow input{flex:1}
.btn{padding:8px 12px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:12px;font-weight:600;cursor:pointer;color:var(--ink)}
.btn:hover{background:#f3ece2}
.btn.pri{background:var(--acc);color:#fff;border-color:var(--acc)}.btn.pri:hover{background:var(--acc-d)}
.keystat{font-size:11.5px;color:var(--mut)}.keystat.ok{color:var(--ok);font-weight:600}
.hint{font-size:11px;color:var(--mut);line-height:1.4}
/* main */
.main{display:flex;flex-direction:column;overflow:hidden}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 20px;border-bottom:1px solid var(--line);background:var(--panel)}
.toolbar input[type=search],.toolbar select{padding:8px 11px;border:1px solid var(--line);border-radius:9px;font-size:12.5px;background:#fff;color:var(--ink)}
.toolbar input[type=search]{min-width:200px}
.toolbar .chk{display:flex;gap:5px;align-items:center;font-size:12px;cursor:pointer;user-select:none}
.toolbar .chk input{accent-color:var(--acc)}
.sep{flex:1}
.exp{background:#efe6da;color:var(--ink);border:0;padding:8px 12px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer}
.exp:hover{background:#e6d9c8}
.count{font-weight:700;color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums;padding-left:4px}
.tablewrap{flex:1;overflow:auto;padding:0 20px 40px}
table{width:100%;border-collapse:separate;border-spacing:0;margin-top:12px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
thead th{background:#f4ede3;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);cursor:pointer;position:sticky;top:0;white-space:nowrap;z-index:1}
thead th:hover{color:var(--acc)}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover td{background:#fcf9f5}
.owner{font-weight:600}.mut{color:var(--mut);font-size:11.5px}
.sc{font-weight:800;font-variant-numeric:tabular-nums;padding:3px 9px;border-radius:7px;display:inline-block;min-width:34px;text-align:center;font-size:12.5px}
.hot{background:#f6ddd2;color:#b03f1f}.warm{background:#f5ebcd;color:#8a5c14}.cold{background:#e6eaec;color:#5c6870}
.pill{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;white-space:nowrap;background:#f0e7db;color:#6a5a48}
.pill.op{background:#f6ddd2;color:#a3421d}
.ph{font-variant-numeric:tabular-nums;white-space:nowrap}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
.empty{padding:70px 20px;text-align:center;color:var(--mut);font-size:14px}
.empty svg{opacity:.35;margin-bottom:10px}
@media(max-width:820px){.app{grid-template-columns:1fr;height:auto}.side{border-right:0;border-bottom:1px solid var(--line)}.main{height:auto}}
</style></head><body>
<div class="app">
<aside class="side">
  <div class="brand">lead<b>jet</b><span class="tag">Trouver, qualifier, contacter.</span></div>

  <div class="field"><label>Niche</label><input name="term" placeholder="restaurants, plombiers, coiffeurs..." value="restaurants"></div>
  <div class="field"><label>Source</label><select name="source"><option value="osm">OpenStreetMap (gratuit)</option><option value="places" id="optPlaces">Google Places (clé requise)</option></select></div>
  <div class="field"><label>Ville</label><input name="city" placeholder="Lyon" value="Lyon"></div>
  <div class="row2">
    <div class="field"><label>Région</label><input name="region" placeholder="Île-de-France"></div>
    <div class="field"><label>Pays</label><input name="country" placeholder="France" value="France"></div>
  </div>
  <div class="row2">
    <div class="field"><label>Nombre</label><input name="limit" type="number" value="30" min="1" max="200"></div>
    <div class="field"><label>Catégorie</label><select name="category"><option value="">auto</option><option value="any">tout</option><option value="food">restauration</option><option value="shops">commerces</option><option value="craft">artisans</option><option value="services">services</option><option value="beauty">beauté</option></select></div>
  </div>
  <div class="toggles">
    <label class="tog"><input type="checkbox" name="owner" checked> Trouver le propriétaire</label>
    <label class="tog"><input type="checkbox" name="audit" checked> Auditer le site web</label>
  </div>
  <button class="go" id="go">Générer les leads</button>
  <div class="bar"><i id="prog"></i></div>
  <div class="status" id="statusLine"></div>
  <div class="stats">
    <div class="stat"><b id="sTotal">0</b><span>leads</span></div>
    <div class="stat hot"><b id="sHot">0</b><span>chaud</span></div>
    <div class="stat"><b id="sTel">0</b><span>tél</span></div>
  </div>

  <details class="settings">
    <summary><svg class="gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg> Réglages</summary>
    <div class="set-body">
      <div class="field"><label>Clé Google Places</label>
        <div class="keyrow"><input type="password" id="key" placeholder="AIza..."><button class="btn pri" id="saveKey">Enregistrer</button></div>
        <div class="keystat" id="keyStat">chargement...</div>
      </div>
      <div class="hint">Sans clé, la source OpenStreetMap fonctionne gratuitement et sans limite. La clé n'est utilisée que pour Google Places et reste stockée localement sur ta machine.</div>
      <button class="btn" id="clearKey">Effacer la clé</button>
    </div>
  </details>
</aside>

<main class="main">
  <div class="toolbar">
    <input type="search" id="q" placeholder="filtrer...">
    <select id="pr"><option value="">Priorité</option><option>Chaud</option><option>Tiède</option><option>Froid</option></select>
    <select id="st"><option value="">Site</option><option value="aucun">Sans site</option><option value="hors">Site mort</option><option value="en">En ligne</option></select>
    <label class="chk"><input type="checkbox" id="fp"> Tél</label>
    <label class="chk"><input type="checkbox" id="fe"> Email</label>
    <label class="chk"><input type="checkbox" id="fo"> Propriétaire</label>
    <span class="sep"></span>
    <button class="exp" data-f="csv">CSV</button>
    <button class="exp" data-f="json">JSON</button>
    <button class="exp" data-f="html">HTML</button>
    <span class="count" id="cnt">0 / 0</span>
  </div>
  <div class="tablewrap">
    <table><thead><tr>
    <th data-k="score">Score</th><th data-k="name">Entreprise</th><th data-k="activity">Activité</th><th data-k="owner">Propriétaire</th><th data-k="phone">Tél</th><th data-k="email">Email</th><th data-k="opportunity">Opportunité</th><th data-k="location">Lieu</th><th data-k="siteStatus">Site</th>
    </tr></thead><tbody id="tb"></tbody></table>
    <div class="empty" id="empty">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <div>Choisis une niche et une ville, puis clique sur <b>Générer les leads</b>.</div>
    </div>
  </div>
</main>
</div>
<script src="/app.js"></script>
</body></html>`;

/** Browser logic, served at /app.js (kept out of the HTML to dodge escaping). */
export const APP_JS = `
var DATA = [], sk = "score", sd = -1;
function el(i){ return document.getElementById(i); }
function nm(n){ return document.querySelector("[name="+n+"]"); }
function esc(s){ return (s==null?"":String(s)).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]}); }
function tel(p){ return p ? '<a class="ph" href="tel:'+String(p).replace(/\\s/g,"")+'">'+esc(p)+'</a>' : ""; }
function mail(e){ return e ? '<a href="mailto:'+esc(e)+'">'+esc(e)+'</a>' : ""; }
function scls(s){ return s>=70?"hot":s>=45?"warm":"cold"; }
var COLS = ["name","legal","activity","owner","role","phone","email","score","priority","opportunity","approach","location","regCity","regCp","website","siteStatus","naf","legalForm","created","size","siren","confidence","source"];

/* ---- settings / config ---- */
function loadCfg(){
  fetch("/api/config").then(function(r){return r.json()}).then(function(c){
    var ks=el("keyStat");
    if(c.hasPlacesKey){ ks.textContent="Clé configurée ("+c.keyHint+")"; ks.className="keystat ok"; el("optPlaces").textContent="Google Places"; }
    else{ ks.textContent="Aucune clé. OpenStreetMap reste gratuit."; ks.className="keystat"; }
    var d=c.defaults||{};
    if(d.city && !nm("city").value) nm("city").value=d.city;
    if(d.region && !nm("region").value) nm("region").value=d.region;
    if(d.country && !nm("country").value) nm("country").value=d.country;
    if(d.source) nm("source").value=d.source;
  }).catch(function(){});
}
function saveKey(){
  var v=el("key").value.trim(); el("keyStat").textContent="enregistrement...";
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":v})})
    .then(function(r){return r.json()}).then(function(){ el("key").value=""; loadCfg(); }).catch(function(){ el("keyStat").textContent="échec de l'enregistrement"; });
}
function clearKey(){
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":""})})
    .then(function(r){return r.json()}).then(function(){ el("key").value=""; loadCfg(); }).catch(function(){});
}
el("saveKey").onclick=saveKey; el("clearKey").onclick=clearKey;

/* ---- table ---- */
function view(){
  var q=el("q").value.toLowerCase().trim(), pr=el("pr").value, st=el("st").value;
  var fp=el("fp").checked, fe=el("fe").checked, fo=el("fo").checked;
  var rows=DATA.filter(function(r){
    if(pr && r.priority!==pr) return false;
    if(st==="aucun" && r.siteStatus!=="aucun site") return false;
    if(st==="hors" && r.siteStatus!=="hors ligne") return false;
    if(st==="en" && String(r.siteStatus).indexOf("en ligne")<0) return false;
    if(fp && !r.phone) return false;
    if(fe && !r.email) return false;
    if(fo && !r.owner) return false;
    if(q){ var h=(r.name+" "+r.activity+" "+r.owner+" "+r.location+" "+r.opportunity+" "+r.legal).toLowerCase(); if(h.indexOf(q)<0) return false; }
    return true;
  });
  rows.sort(function(a,b){ var x=a[sk],y=b[sk]; if(typeof x==="string"){x=(x||"").toLowerCase();y=(y||"").toLowerCase();} return x<y?-sd:x>y?sd:0; });
  return rows;
}
function render(){
  var rows=view();
  el("cnt").textContent=rows.length+" / "+DATA.length;
  el("empty").style.display=DATA.length?"none":"block";
  el("sTotal").textContent=DATA.length;
  el("sHot").textContent=DATA.filter(function(r){return r.priority==="Chaud"}).length;
  el("sTel").textContent=DATA.filter(function(r){return r.phone}).length;
  el("tb").innerHTML=rows.map(function(r){
    var opCls = /Cr\\u00e9ation|mort|Refonte/.test(r.opportunity) ? "pill op" : "pill";
    return '<tr><td><span class="sc '+scls(r.score)+'">'+r.score+'</span></td>'
      +'<td><strong>'+esc(r.name)+'</strong>'+((r.legal&&r.legal.toLowerCase()!==String(r.name).toLowerCase())?'<div class="mut">'+esc(r.legal)+'</div>':'')+'</td>'
      +'<td>'+esc(r.activity)+(r.size?'<div class="mut">'+esc(r.size)+(r.created?" \\u00b7 "+esc(r.created):"")+'</div>':'')+'</td>'
      +'<td>'+(r.owner?'<span class="owner">'+esc(r.owner)+'</span><div class="mut">'+esc(r.role)+'</div>':'<span class="mut">\\u2014</span>')+'</td>'
      +'<td>'+tel(r.phone)+'</td><td>'+mail(r.email)+'</td>'
      +'<td><span class="'+opCls+'">'+esc(r.opportunity)+'</span></td>'
      +'<td class="mut">'+esc(r.location)+'</td><td class="mut">'+esc(r.siteStatus)+'</td></tr>';
  }).join("");
}
Array.prototype.forEach.call(document.querySelectorAll("thead th"),function(th){
  th.onclick=function(){ var k=th.getAttribute("data-k"); sd=(sk===k)?-sd:(k==="score"?-1:1); sk=k; render(); };
});
["q","pr","st","fp","fe","fo"].forEach(function(i){ el(i).addEventListener("input",render); });

/* ---- search (streaming) ---- */
function run(){
  var body={
    source:nm("source").value, term:nm("term").value, city:nm("city").value,
    region:nm("region").value, country:nm("country").value, limit:Number(nm("limit").value)||30,
    category:nm("category").value, owner:nm("owner").checked, audit:nm("audit").checked
  };
  DATA=[]; render(); el("go").disabled=true; el("go").textContent="Recherche..."; el("prog").style.width="3%"; el("statusLine").textContent="Recherche en cours...";
  var total=0;
  fetch("/api/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(res){
    var reader=res.body.getReader(), dec=new TextDecoder(), buf="";
    function pump(){ return reader.read().then(function(x){
      if(x.done){ finish(); return; }
      buf+=dec.decode(x.value,{stream:true});
      var lines=buf.split("\\n"); buf=lines.pop();
      lines.forEach(function(ln){ if(!ln.trim())return; var m; try{m=JSON.parse(ln)}catch(e){return;}
        if(m.t==="meta"){ total=m.total; }
        else if(m.t==="lead"){ DATA.push(m.lead); if(DATA.length%2===0)render(); el("prog").style.width=Math.min(98,DATA.length/(total||1)*100)+"%"; el("statusLine").textContent=DATA.length+(total?" / "+total:"")+" enrichis..."; }
        else if(m.t==="error"){ el("statusLine").textContent="Erreur: "+m.message; }
      });
      return pump();
    }); }
    return pump();
  }).catch(function(e){ el("statusLine").textContent="Erreur réseau: "+e.message; finish(); });
  function finish(){ el("go").disabled=false; el("go").textContent="Générer les leads"; el("prog").style.width="100%"; render(); if(DATA.length)el("statusLine").textContent=DATA.length+" leads générés."; setTimeout(function(){el("prog").style.width="0"},700); }
}
el("go").onclick=run;

/* ---- export ---- */
function download(name,text,type){ var b=new Blob([text],{type:type}); var u=URL.createObjectURL(b); var a=document.createElement("a"); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); }
function csvCell(v){ v=(v==null?"":String(v)); return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
Array.prototype.forEach.call(document.querySelectorAll(".exp"),function(btn){
  btn.onclick=function(){
    var rows=view(); if(!rows.length){ el("statusLine").textContent="Rien à exporter."; return; }
    var f=btn.getAttribute("data-f"), stamp=new Date().toISOString().slice(0,10);
    if(f==="json"){ download("leads-"+stamp+".json",JSON.stringify(rows,null,2),"application/json"); }
    else if(f==="csv"){ var head=COLS.join(","); var b=rows.map(function(r){return COLS.map(function(c){return csvCell(r[c])}).join(",")}).join("\\n"); download("leads-"+stamp+".csv",head+"\\n"+b,"text/csv"); }
    else if(f==="html"){ download("leads-"+stamp+".html",exportHtml(rows),"text/html"); }
  };
});
function exportHtml(rows){
  var th="<tr><th>Score</th><th>Entreprise</th><th>Activite</th><th>Proprietaire</th><th>Tel</th><th>Email</th><th>Opportunite</th><th>Lieu</th><th>Site</th></tr>";
  var tr=rows.map(function(r){ return "<tr><td>"+r.score+"</td><td>"+esc(r.name)+"</td><td>"+esc(r.activity)+"</td><td>"+esc(r.owner)+" "+esc(r.role)+"</td><td>"+esc(r.phone)+"</td><td>"+esc(r.email)+"</td><td>"+esc(r.opportunity)+"</td><td>"+esc(r.location)+"</td><td>"+esc(r.siteStatus)+"</td></tr>"; }).join("");
  return "<!doctype html><meta charset=utf-8><title>leads</title><style>body{font:13px sans-serif;margin:20px;color:#2c2620}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e6dccd;padding:7px;text-align:left}th{background:#f4ede3}</style><table>"+th+tr+"</table>";
}
loadCfg();
render();
`;
