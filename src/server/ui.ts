/** The single-page web UI served by `leadjet serve`. Self-contained, no deps. */
export const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>leadjet</title>
<style>
:root{
  --bg:#0d0e12;--panel:#14161c;--elev:#191c23;--line:#262a33;--line2:#2f343e;
  --ink:#e7e9ee;--ink2:#c3c7d0;--mut:#7f8592;--acc:#7c6cf0;--acc-h:#8e80f5;
  --green:#34d39a;--amber:#e6b23c;--red:#f2683f;--cold:#6b7280;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;font:13px/1.5 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
.mono{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
button{font-family:inherit}
::selection{background:rgba(124,108,240,.35)}
/* top bar */
.top{position:sticky;top:0;z-index:20;background:linear-gradient(180deg,#14161c,#111319);border-bottom:1px solid var(--line);padding:10px 16px}
.toprow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.brand{font-size:15px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:7px;padding-right:6px}
.brand .dot{width:9px;height:9px;border-radius:50%;background:var(--acc);box-shadow:0 0 10px var(--acc)}
.brand b{color:var(--acc)}
input,select{background:var(--elev);border:1px solid var(--line);border-radius:7px;color:var(--ink);font-size:12.5px;padding:7px 9px;height:32px}
input::placeholder{color:var(--mut)}
input:focus,select:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 3px rgba(124,108,240,.18)}
select{cursor:pointer}
.i-term{min-width:150px;flex:1 1 150px}.i-sm{width:104px}.i-xs{width:74px}
.tog{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink2);cursor:pointer;user-select:none;white-space:nowrap}
.tog input{width:14px;height:14px;height:auto;accent-color:var(--acc)}
.go{background:var(--acc);color:#fff;border:0;height:32px;padding:0 16px;border-radius:7px;font-weight:600;font-size:12.5px;cursor:pointer;white-space:nowrap}
.go:hover{background:var(--acc-h)}.go:disabled{opacity:.5;cursor:default}
.icon-btn{width:32px;height:32px;display:grid;place-items:center;background:var(--elev);border:1px solid var(--line);border-radius:7px;color:var(--mut);cursor:pointer}
.icon-btn:hover{color:var(--ink);border-color:var(--line2)}
.bar{height:2px;margin-top:9px;background:var(--line);border-radius:2px;overflow:hidden}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--acc),var(--green));transition:width .25s}
/* toolbar */
.tools{position:sticky;top:53px;z-index:15;display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:8px 16px;background:rgba(13,14,18,.92);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
.tools input[type=search]{min-width:160px}
.chip{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink2);cursor:pointer;user-select:none}
.chip input{accent-color:var(--acc)}
.stat{display:flex;align-items:baseline;gap:5px;padding:0 8px;border-left:1px solid var(--line)}
.stat b{font-size:14px;font-weight:700}.stat.g b{color:var(--green)}.stat span{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.sep{flex:1}
.exp{background:var(--elev);border:1px solid var(--line);color:var(--ink2);height:30px;padding:0 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.exp:hover{border-color:var(--acc);color:var(--ink)}
.status{font-size:11.5px;color:var(--mut);white-space:nowrap}
.count{font-weight:700;color:var(--ink2);white-space:nowrap}
/* table */
.wrap{padding:0 8px 60px;overflow:auto}
table{width:100%;border-collapse:separate;border-spacing:0}
thead th{position:sticky;top:0;z-index:5;background:#0f1116;color:var(--mut);font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;text-align:left;font-weight:600;padding:8px 10px;border-bottom:1px solid var(--line);cursor:pointer;white-space:nowrap}
thead th:hover{color:var(--ink2)}
tbody td{padding:7px 10px;border-bottom:1px solid #1b1e24;vertical-align:middle}
tbody tr:hover td{background:var(--panel)}
.name{font-weight:600;color:var(--ink)}
.mut{color:var(--mut);font-size:11px}
.sc{font-weight:700;padding:2px 7px;border-radius:6px;font-size:12px;min-width:32px;display:inline-block;text-align:center}
.sc.hot{background:rgba(52,211,154,.14);color:var(--green)}
.sc.warm{background:rgba(230,178,60,.14);color:var(--amber)}
.sc.cold{background:rgba(107,114,128,.16);color:#9aa1ad}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}
.dot.hot{background:var(--green)}.dot.warm{background:var(--amber)}.dot.cold{background:var(--cold)}
.pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10.5px;white-space:nowrap;background:#1e2129;color:var(--ink2);border:1px solid var(--line)}
.pill.op{background:rgba(124,108,240,.12);color:#b3aaf7;border-color:rgba(124,108,240,.3)}
a{color:var(--acc-h);text-decoration:none}a:hover{text-decoration:underline}
.empty{padding:80px 20px;text-align:center;color:var(--mut)}
.empty .k{color:var(--ink2);font-weight:600}
/* settings drawer */
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .2s;z-index:30}
.scrim.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;height:100%;width:340px;max-width:90vw;background:var(--panel);border-left:1px solid var(--line);transform:translateX(100%);transition:transform .22s;z-index:31;padding:18px;display:flex;flex-direction:column;gap:14px}
.drawer.open{transform:none}
.drawer h3{margin:0;font-size:14px;display:flex;align-items:center;justify-content:space-between}
.drawer .x{cursor:pointer;color:var(--mut);font-size:18px;line-height:1}
.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin-bottom:5px}
.keyrow{display:flex;gap:6px}.keyrow input{flex:1}
.btn{background:var(--elev);border:1px solid var(--line);color:var(--ink2);height:32px;padding:0 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer}
.btn:hover{border-color:var(--line2);color:var(--ink)}
.btn.pri{background:var(--acc);border-color:var(--acc);color:#fff}.btn.pri:hover{background:var(--acc-h)}
.keystat{font-size:11.5px;color:var(--mut)}.keystat.ok{color:var(--green)}
.hint{font-size:11px;color:var(--mut);line-height:1.45}
@media(max-width:720px){.i-sm,.i-xs{flex:1 1 auto;width:auto}}
</style></head><body>
<header class="top">
  <div class="toprow">
    <div class="brand"><span class="dot"></span>lead<b>jet</b></div>
    <input class="i-term" name="term" placeholder="niche (restaurants, plombiers...)" value="restaurants">
    <select name="source" class="i-sm"><option value="osm">OpenStreetMap</option><option value="places" id="optPlaces">Google Places</option></select>
    <input class="i-sm" name="city" placeholder="ville" value="Lyon">
    <input class="i-sm" name="region" placeholder="région">
    <input class="i-xs" name="country" placeholder="pays" value="France">
    <input class="i-xs mono" name="limit" type="number" value="30" min="1" max="200" title="nombre">
    <select name="category" class="i-sm"><option value="">catégorie: auto</option><option value="any">tout</option><option value="food">restauration</option><option value="shops">commerces</option><option value="craft">artisans</option><option value="services">services</option><option value="beauty">beauté</option></select>
    <label class="tog"><input type="checkbox" name="owner" checked> propriétaire</label>
    <label class="tog"><input type="checkbox" name="audit" checked> audit</label>
    <button class="go" id="go">Générer</button>
    <button class="icon-btn" id="gear" title="Réglages">&#9881;</button>
  </div>
  <div class="bar"><i id="prog"></i></div>
</header>

<div class="tools">
  <input type="search" id="q" placeholder="filtrer...">
  <select id="pr"><option value="">priorité</option><option>Chaud</option><option>Tiède</option><option>Froid</option></select>
  <select id="st"><option value="">site</option><option value="aucun">sans site</option><option value="hors">site mort</option><option value="en">en ligne</option></select>
  <label class="chip"><input type="checkbox" id="fp"> tél</label>
  <label class="chip"><input type="checkbox" id="fe"> email</label>
  <label class="chip"><input type="checkbox" id="fo"> propriétaire</label>
  <div class="stat g"><b id="sTotal">0</b><span>leads</span></div>
  <div class="stat"><b id="sHot">0</b><span>chaud</span></div>
  <div class="stat"><b id="sTel">0</b><span>tél</span></div>
  <span class="sep"></span>
  <span class="status" id="statusLine"></span>
  <button class="exp" data-f="csv">CSV</button>
  <button class="exp" data-f="json">JSON</button>
  <button class="exp" data-f="html">HTML</button>
  <span class="count" id="cnt">0</span>
</div>

<div class="wrap"><table><thead><tr>
<th data-k="score">Score</th><th data-k="name">Entreprise</th><th data-k="activity">Activité</th><th data-k="owner">Propriétaire</th><th data-k="phone">Tél</th><th data-k="email">Email</th><th data-k="opportunity">Opportunité</th><th data-k="location">Lieu</th><th data-k="siteStatus">Site</th>
</tr></thead><tbody id="tb"></tbody></table>
<div class="empty" id="empty">Choisis une niche et une ville, puis <span class="k">Générer</span>.</div>
</div>

<div class="scrim" id="scrim"></div>
<div class="drawer" id="drawer">
  <h3>Réglages <span class="x" id="closeSet">&times;</span></h3>
  <div>
    <div class="lbl">Clé Google Places</div>
    <div class="keyrow"><input type="password" id="key" placeholder="AIza..."><button class="btn pri" id="saveKey">OK</button></div>
    <div class="keystat" id="keyStat" style="margin-top:6px">chargement...</div>
  </div>
  <div class="hint">Sans clé, OpenStreetMap fonctionne gratuitement et sans limite. La clé sert uniquement à Google Places et reste stockée localement sur ta machine.</div>
  <button class="btn" id="clearKey">Effacer la clé</button>
</div>
<script src="/app.js"></script>
</body></html>`;

/** Browser logic, served at /app.js (kept out of the HTML to dodge escaping). */
export const APP_JS = `
var DATA = [], sk = "score", sd = -1;
function el(i){ return document.getElementById(i); }
function nm(n){ return document.querySelector("[name="+n+"]"); }
function esc(s){ return (s==null?"":String(s)).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]}); }
function tel(p){ return p ? '<a class="mono" href="tel:'+String(p).replace(/\\s/g,"")+'">'+esc(p)+'</a>' : '<span class="mut">\\u2014</span>'; }
function mail(e){ return e ? '<a href="mailto:'+esc(e)+'">'+esc(e)+'</a>' : '<span class="mut">\\u2014</span>'; }
function tier(s){ return s>=70?"hot":s>=45?"warm":"cold"; }
var COLS = ["name","legal","activity","owner","role","phone","email","score","priority","opportunity","approach","location","regCity","regCp","website","siteStatus","naf","legalForm","created","size","siren","confidence","source"];

/* settings drawer */
function openSet(o){ el("drawer").classList.toggle("open",o); el("scrim").classList.toggle("open",o); }
el("gear").onclick=function(){ openSet(true); };
el("closeSet").onclick=function(){ openSet(false); };
el("scrim").onclick=function(){ openSet(false); };
function loadCfg(){
  fetch("/api/config").then(function(r){return r.json()}).then(function(c){
    var ks=el("keyStat");
    if(c.hasPlacesKey){ ks.textContent="Clé configurée ("+c.keyHint+")"; ks.className="keystat ok"; el("optPlaces").textContent="Google Places \\u2713"; }
    else{ ks.textContent="Aucune clé. OpenStreetMap reste gratuit."; ks.className="keystat"; }
    var d=c.defaults||{};
    if(d.city && !nm("city").value) nm("city").value=d.city;
    if(d.region && !nm("region").value) nm("region").value=d.region;
    if(d.country && !nm("country").value) nm("country").value=d.country;
    if(d.source) nm("source").value=d.source;
  }).catch(function(){});
}
el("saveKey").onclick=function(){
  var v=el("key").value.trim(); el("keyStat").textContent="enregistrement...";
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":v})}).then(function(r){return r.json()}).then(function(){ el("key").value=""; loadCfg(); }).catch(function(){ el("keyStat").textContent="échec"; });
};
el("clearKey").onclick=function(){
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":""})}).then(function(r){return r.json()}).then(function(){ el("key").value=""; loadCfg(); }).catch(function(){});
};

/* table */
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
    var t=tier(r.score);
    var opCls=/Cr\\u00e9ation|mort|Refonte/.test(r.opportunity)?"pill op":"pill";
    return '<tr><td><span class="sc '+t+' mono">'+r.score+'</span></td>'
      +'<td><span class="dot '+t+'"></span><span class="name">'+esc(r.name)+'</span>'+((r.legal&&r.legal.toLowerCase()!==String(r.name).toLowerCase())?'<div class="mut">'+esc(r.legal)+'</div>':'')+'</td>'
      +'<td>'+esc(r.activity)+(r.size?'<div class="mut">'+esc(r.size)+(r.created?" \\u00b7 "+esc(r.created):"")+'</div>':'')+'</td>'
      +'<td>'+(r.owner?'<span class="name">'+esc(r.owner)+'</span><div class="mut">'+esc(r.role)+'</div>':'<span class="mut">\\u2014</span>')+'</td>'
      +'<td>'+tel(r.phone)+'</td><td>'+mail(r.email)+'</td>'
      +'<td><span class="'+opCls+'">'+esc(r.opportunity)+'</span></td>'
      +'<td class="mut">'+esc(r.location)+'</td><td class="mut">'+esc(r.siteStatus)+'</td></tr>';
  }).join("");
}
Array.prototype.forEach.call(document.querySelectorAll("thead th"),function(th){
  th.onclick=function(){ var k=th.getAttribute("data-k"); sd=(sk===k)?-sd:(k==="score"?-1:1); sk=k; render(); };
});
["q","pr","st","fp","fe","fo"].forEach(function(i){ el(i).addEventListener("input",render); });

/* search streaming */
function run(){
  var body={ source:nm("source").value, term:nm("term").value, city:nm("city").value, region:nm("region").value, country:nm("country").value, limit:Number(nm("limit").value)||30, category:nm("category").value, owner:nm("owner").checked, audit:nm("audit").checked };
  DATA=[]; render(); el("go").disabled=true; el("go").textContent="..."; el("prog").style.width="3%"; el("statusLine").textContent="recherche...";
  var total=0;
  fetch("/api/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(res){
    var reader=res.body.getReader(), dec=new TextDecoder(), buf="";
    function pump(){ return reader.read().then(function(x){
      if(x.done){ finish(); return; }
      buf+=dec.decode(x.value,{stream:true});
      var lines=buf.split("\\n"); buf=lines.pop();
      lines.forEach(function(ln){ if(!ln.trim())return; var m; try{m=JSON.parse(ln)}catch(e){return;}
        if(m.t==="meta"){ total=m.total; }
        else if(m.t==="lead"){ DATA.push(m.lead); if(DATA.length%2===0)render(); el("prog").style.width=Math.min(98,DATA.length/(total||1)*100)+"%"; el("statusLine").textContent=DATA.length+(total?" / "+total:"")+" enrichis"; }
        else if(m.t==="error"){ el("statusLine").textContent="Erreur: "+m.message; }
      });
      return pump();
    }); }
    return pump();
  }).catch(function(e){ el("statusLine").textContent="Erreur: "+e.message; finish(); });
  function finish(){ el("go").disabled=false; el("go").textContent="Générer"; el("prog").style.width="100%"; render(); if(DATA.length)el("statusLine").textContent=DATA.length+" leads"; setTimeout(function(){el("prog").style.width="0"},700); }
}
el("go").onclick=run;

/* export */
function download(name,text,type){ var b=new Blob([text],{type:type}); var u=URL.createObjectURL(b); var a=document.createElement("a"); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); }
function csvCell(v){ v=(v==null?"":String(v)); return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
Array.prototype.forEach.call(document.querySelectorAll(".exp"),function(btn){
  btn.onclick=function(){
    var rows=view(); if(!rows.length){ el("statusLine").textContent="rien à exporter"; return; }
    var f=btn.getAttribute("data-f"), stamp=new Date().toISOString().slice(0,10);
    if(f==="json"){ download("leads-"+stamp+".json",JSON.stringify(rows,null,2),"application/json"); }
    else if(f==="csv"){ var head=COLS.join(","); var b=rows.map(function(r){return COLS.map(function(c){return csvCell(r[c])}).join(",")}).join("\\n"); download("leads-"+stamp+".csv",head+"\\n"+b,"text/csv"); }
    else if(f==="html"){ download("leads-"+stamp+".html",exportHtml(rows),"text/html"); }
  };
});
function exportHtml(rows){
  var th="<tr><th>Score</th><th>Entreprise</th><th>Activite</th><th>Proprietaire</th><th>Tel</th><th>Email</th><th>Opportunite</th><th>Lieu</th><th>Site</th></tr>";
  var tr=rows.map(function(r){ return "<tr><td>"+r.score+"</td><td>"+esc(r.name)+"</td><td>"+esc(r.activity)+"</td><td>"+esc(r.owner)+" "+esc(r.role)+"</td><td>"+esc(r.phone)+"</td><td>"+esc(r.email)+"</td><td>"+esc(r.opportunity)+"</td><td>"+esc(r.location)+"</td><td>"+esc(r.siteStatus)+"</td></tr>"; }).join("");
  return "<!doctype html><meta charset=utf-8><title>leads</title><style>body{font:13px sans-serif;margin:20px;background:#0d0e12;color:#e7e9ee}table{border-collapse:collapse;width:100%}th,td{border:1px solid #262a33;padding:7px;text-align:left}th{background:#14161c}</style><table>"+th+tr+"</table>";
}
loadCfg();
render();
`;
