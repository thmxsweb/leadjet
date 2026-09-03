/** The single-page web UI served by `leadjet serve`. Self-contained, no deps. */
export const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>leadjet</title>
<style>
:root{
  --bg:#0b0c0e;--panel:#131418;--elev:#1a1c22;--elev2:#20232a;--line:#23262d;--line2:#2d313a;
  --ink:#eceef1;--ink2:#c4c8d0;--mut:#7d828d;
  --red:#e5484d;--red-h:#f05a5f;--red-dim:rgba(229,72,77,.13);--red-bd:rgba(229,72,77,.4);
  --green:#34b37a;--amber:#d99b32;--cold:#6b7280;
}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font:13px/1.5 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
::selection{background:var(--red-dim)}
a{color:var(--red-h);text-decoration:none}a:hover{text-decoration:underline}
.app{display:grid;grid-template-columns:216px 1fr;height:100vh}
/* sidebar */
.side{background:#0e0f12;border-right:1px solid var(--line);display:flex;flex-direction:column;padding:16px 12px;gap:4px}
.logo{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:800;letter-spacing:-.02em;padding:6px 8px 14px}
.logo .m{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,var(--red),#b5262b);display:grid;place-items:center;color:#fff;font-size:13px;font-weight:900;box-shadow:0 2px 10px rgba(229,72,77,.4)}
.logo b{color:var(--red)}
.nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;color:var(--mut);font-weight:600;font-size:13px;cursor:pointer}
.nav a .ic{width:16px;height:16px;opacity:.9}
.nav a:hover{background:var(--elev);color:var(--ink2);text-decoration:none}
.nav a.active{background:var(--red-dim);color:var(--red-h)}
.side .foot{margin-top:auto;padding:8px;color:var(--mut);font-size:11px;display:flex;justify-content:space-between;align-items:center}
.side .foot .dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}
/* main */
.main{overflow:auto}
.view{display:none;padding:20px 24px 60px;max-width:1500px}
.view.on{display:block}
.phead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.phead h1{margin:0;font-size:20px;letter-spacing:-.02em}
.phead .sub{color:var(--mut);font-size:12.5px;margin-top:2px}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px}
.pad{padding:14px}
/* inputs / buttons */
input,select{background:var(--elev);border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:12.5px;padding:8px 10px;height:34px;font-family:inherit}
input::placeholder{color:var(--mut)}
input:focus,select:focus{outline:none;border-color:var(--red-bd);box-shadow:0 0 0 3px var(--red-dim)}
select{cursor:pointer}
.btn{height:34px;padding:0 14px;border-radius:8px;border:1px solid var(--line);background:var(--elev);color:var(--ink2);font-weight:600;font-size:12.5px;cursor:pointer;font-family:inherit;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
.btn:hover{border-color:var(--line2);color:var(--ink)}
.btn.red{background:var(--red);border-color:var(--red);color:#fff}.btn.red:hover{background:var(--red-h)}
.btn.red-o{background:transparent;border-color:var(--red-bd);color:var(--red-h)}.btn.red-o:hover{background:var(--red-dim)}
.btn:disabled{opacity:.5;cursor:default}
.tog{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2);cursor:pointer;user-select:none;white-space:nowrap}
.tog input,.chip input{accent-color:var(--red);width:15px;height:15px}
/* search bar */
.searchbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.searchbar .term{flex:1 1 170px;min-width:150px}
.w-sm{width:120px}.w-xs{width:82px}
.bar{height:2px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--red),var(--amber));transition:width .25s}
/* stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:14px 0}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.kpi b{display:block;font-size:22px;font-weight:800;letter-spacing:-.02em}
.kpi span{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.kpi.red b{color:var(--red)}.kpi.green b{color:var(--green)}
/* toolbar */
.toolbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.chip{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink2);cursor:pointer;user-select:none}
.sep{flex:1}
.exp{height:32px;padding:0 11px;border-radius:7px;border:1px solid var(--line);background:var(--elev);color:var(--ink2);font-size:12px;font-weight:600;cursor:pointer}
.exp:hover{border-color:var(--red-bd);color:var(--ink)}
.status{font-size:11.5px;color:var(--mut)}
.count{font-weight:700;color:var(--ink2);white-space:nowrap;font-size:12px}
/* table */
.tablecard{overflow:hidden}
.twrap{overflow:auto;max-height:calc(100vh - 340px)}
table{width:100%;border-collapse:separate;border-spacing:0}
thead th{position:sticky;top:0;z-index:3;background:#101116;color:var(--mut);font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;text-align:left;font-weight:700;padding:9px 10px;border-bottom:1px solid var(--line);cursor:pointer;white-space:nowrap}
thead th:hover{color:var(--ink2)}
thead th.nocur{cursor:default}
tbody td{padding:8px 10px;border-bottom:1px solid #191b21;vertical-align:middle}
tbody tr:hover td{background:var(--elev)}
tbody tr.sel td{background:var(--red-dim)}
.name{font-weight:600}.mut{color:var(--mut);font-size:11px}
.sc{font-weight:800;padding:2px 7px;border-radius:6px;font-size:12px;min-width:32px;display:inline-block;text-align:center}
.sc.hot{background:var(--red-dim);color:var(--red-h)}.sc.warm{background:rgba(217,155,50,.15);color:var(--amber)}.sc.cold{background:rgba(107,114,128,.18);color:#9aa1ad}
.pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10.5px;white-space:nowrap;background:var(--elev2);color:var(--ink2);border:1px solid var(--line)}
.tag{display:inline-block;padding:1px 7px;border-radius:5px;font-size:10px;font-weight:700;background:rgba(52,179,122,.16);color:var(--green);margin-left:6px}
.empty{padding:70px 20px;text-align:center;color:var(--mut)}.empty .k{color:var(--red-h);font-weight:700}
/* settings */
.set-grid{display:grid;grid-template-columns:1fr;gap:14px;max-width:640px}
.set-card h3{margin:0 0 3px;font-size:14px}.set-card p{margin:0 0 12px;color:var(--mut);font-size:12px}
.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin-bottom:5px}
.row{display:flex;gap:8px;margin-bottom:10px}.row input{flex:1}
.ok{color:var(--green)}.bad{color:var(--red-h)}
.hint{font-size:11px;color:var(--mut);line-height:1.45}
.m0{margin:0}
/* modal */
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:50}
.scrim.on{display:flex}
.modal{width:440px;max-width:92vw;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.modal h3{margin:0 0 10px;font-size:16px}
.modal .big{font-size:13px;color:var(--ink2);line-height:1.6}
.modal .foot{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.res{max-height:220px;overflow:auto;margin-top:10px;font-size:12px}
.res div{padding:3px 0;border-bottom:1px solid var(--line)}
@media(max-width:820px){.app{grid-template-columns:1fr}.side{flex-direction:row;overflow:auto;height:auto}.nav{display:flex;gap:4px}.side .foot{display:none}}
</style></head><body>
<div class="app">
  <aside class="side">
    <div class="logo"><span class="m">L</span>lead<b>jet</b></div>
    <nav class="nav">
      <a data-view="leads" class="active"><span class="ic">&#9678;</span> Leads</a>
      <a data-view="jump"><span class="ic">&#8644;</span> Join-Jump</a>
      <a data-view="settings"><span class="ic">&#9881;</span> Réglages</a>
    </nav>
    <div class="foot"><span>v0.1.0</span><span class="dot" title="serveur actif"></span></div>
  </aside>
  <main class="main">
    <!-- LEADS -->
    <section class="view on" id="v-leads">
      <div class="phead">
        <div><h1>Leads</h1><div class="sub">Trouver, qualifier, sélectionner, exporter</div></div>
        <div class="acts">
          <button class="btn red" id="jjExport">&#8644; Exporter vers Join-Jump</button>
          <button class="btn red-o" id="cvUse">cvcrush</button>
          <button class="btn red-o" id="cvExport">Export cvcrush</button>
        </div>
      </div>
      <div class="card pad searchbar">
        <input class="term" name="term" placeholder="niche (restaurants, plombiers...)" value="restaurants">
        <select name="source" class="w-sm"><option value="osm">OpenStreetMap</option><option value="places" id="optPlaces">Google Places</option></select>
        <input class="w-sm" name="city" placeholder="ville" value="Lyon">
        <input class="w-sm" name="region" placeholder="région">
        <input class="w-xs" name="country" placeholder="pays" value="France">
        <input class="w-xs mono" name="limit" type="number" value="30" min="1" max="200" title="nombre">
        <select name="category" class="w-sm"><option value="">catégorie</option><option value="any">tout</option><option value="food">restauration</option><option value="shops">commerces</option><option value="craft">artisans</option><option value="services">services</option><option value="beauty">beauté</option></select>
        <label class="tog"><input type="checkbox" name="owner" checked> propriétaire</label>
        <label class="tog"><input type="checkbox" name="audit" checked> audit</label>
        <button class="btn red" id="go">Générer</button>
      </div>
      <div class="bar"><i id="prog"></i></div>
      <div class="stats">
        <div class="kpi"><b id="sTotal">0</b><span>leads</span></div>
        <div class="kpi red"><b id="sHot">0</b><span>chaud</span></div>
        <div class="kpi"><b id="sTel">0</b><span>téléphone</span></div>
        <div class="kpi"><b id="sMail">0</b><span>email</span></div>
        <div class="kpi green"><b id="sSel">0</b><span>sélectionnés</span></div>
      </div>
      <div class="toolbar">
        <input type="search" id="q" placeholder="filtrer..." class="w-sm" style="width:170px">
        <select id="pr"><option value="">priorité</option><option>Chaud</option><option>Tiède</option><option>Froid</option></select>
        <select id="st"><option value="">site</option><option value="aucun">sans site</option><option value="hors">site mort</option><option value="en">en ligne</option></select>
        <label class="chip"><input type="checkbox" id="fp"> tél</label>
        <label class="chip"><input type="checkbox" id="fe"> email</label>
        <label class="chip"><input type="checkbox" id="fo"> propriétaire</label>
        <button class="btn" id="selTopBtn" title="sélectionner les meilleurs">Top <input id="topN" class="mono" type="number" value="20" min="1" style="width:56px;height:26px;margin:0 2px;padding:2px 6px"></button>
        <button class="btn" id="selClear">Vider sélection</button>
        <span class="sep"></span>
        <span class="status" id="statusLine"></span>
        <button class="exp" data-f="csv">CSV</button>
        <button class="exp" data-f="json">JSON</button>
        <button class="exp" data-f="html">HTML</button>
        <span class="count" id="cnt">0</span>
      </div>
      <div class="card tablecard"><div class="twrap"><table>
        <thead><tr>
          <th class="nocur" style="width:34px"><input type="checkbox" id="selAll"></th>
          <th data-k="score">Score</th><th data-k="name">Entreprise</th><th data-k="activity">Activité</th>
          <th data-k="owner">Propriétaire</th><th data-k="phone">Tél</th><th data-k="email">Email</th>
          <th data-k="opportunity">Opportunité</th><th data-k="location">Lieu</th>
        </tr></thead>
        <tbody id="tb"></tbody>
      </table>
      <div class="empty" id="empty">Choisis une niche et une ville, puis <span class="k">Générer</span>.</div>
      </div></div>
    </section>

    <!-- JOIN-JUMP -->
    <section class="view" id="v-jump">
      <div class="phead"><div><h1>Join-Jump</h1><div class="sub">Transformer les leads en clients, sans doublon</div></div></div>
      <div class="card pad" style="max-width:640px">
        <div id="jjState" class="big" style="font-size:13px">Vérification de la connexion...</div>
        <div class="hint" style="margin-top:12px">Sélectionne des leads dans l'onglet <b>Leads</b> (ou aucun = tous les leads filtrés), puis clique <b>Exporter vers Join-Jump</b>. leadjet vérifie d'abord tes clients existants et ne recrée jamais un doublon (tag <span class="tag">déjà client</span>).</div>
      </div>
    </section>

    <!-- SETTINGS -->
    <section class="view" id="v-settings">
      <div class="phead"><div><h1>Réglages</h1><div class="sub">Clés et connexions, stockées localement sur ta machine</div></div></div>
      <div class="set-grid">
        <div class="card pad set-card">
          <h3>Google Places</h3><p>Optionnel. Sans clé, OpenStreetMap fonctionne gratuitement.</p>
          <div class="lbl">Clé API</div>
          <div class="row"><input type="password" id="key" placeholder="AIza..."><button class="btn red" id="saveKey">Enregistrer</button><button class="btn" id="clearKey">Effacer</button></div>
          <div class="keystat mut m0" id="keyStat">chargement...</div>
        </div>
        <div class="card pad set-card">
          <h3>Compte Join-Jump</h3><p>Connecte ton compte pour exporter les leads en clients.</p>
          <div class="lbl">Email</div>
          <div class="row"><input id="jEmail" placeholder="email@exemple.com"></div>
          <div class="lbl">Mot de passe</div>
          <div class="row"><input type="password" id="jPass" placeholder="••••••••"><button class="btn red" id="jSave">Connecter</button></div>
          <div class="mut m0" id="jStat">chargement...</div>
        </div>
        <div class="card pad set-card">
          <h3>cvcrush</h3><p>Identifiant unique de cette installation, pour la connexion cvcrush.</p>
          <div class="lbl">App ID</div>
          <div class="row"><input id="cvId" class="mono" readonly><button class="btn" id="cvCopy">Copier</button></div>
          <div class="hint m0">Le bouton <b>cvcrush</b> ouvre cvcrush.co avec cet App ID et une redirect URI vers ce dashboard.</div>
        </div>
      </div>
    </section>
  </main>
</div>

<div class="scrim" id="scrim"><div class="modal" id="modal"></div></div>
<script src="/app.js"></script>
</body></html>`;

/** Browser logic, served at /app.js. */
export const APP_JS = `
var DATA=[], SEL={}, sk="score", sd=-1, CFG={};
function el(i){return document.getElementById(i)}
function nm(n){return document.querySelector("[name="+n+"]")}
function esc(s){return (s==null?"":String(s)).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function tel(p){return p?'<a class="mono" href="tel:'+String(p).replace(/\\s/g,"")+'">'+esc(p)+'</a>':'<span class="mut">\\u2014</span>'}
function mail(e){return e?'<a href="mailto:'+esc(e)+'">'+esc(e)+'</a>':'<span class="mut">\\u2014</span>'}
function tier(s){return s>=70?"hot":s>=45?"warm":"cold"}
function keyOf(r){return r.place_id||(r.name+"|"+r.location)}
var COLS=["name","legal","activity","owner","role","phone","email","score","priority","opportunity","approach","location","regCity","regCp","website","siteStatus","naf","legalForm","created","size","siren","confidence","source"];

/* nav */
Array.prototype.forEach.call(document.querySelectorAll(".nav a"),function(a){
  a.onclick=function(){
    document.querySelectorAll(".nav a").forEach(function(x){x.classList.remove("active")});
    a.classList.add("active");
    var v=a.getAttribute("data-view");
    document.querySelectorAll(".view").forEach(function(s){s.classList.remove("on")});
    el("v-"+v).classList.add("on");
    if(v==="jump") jumpState();
  };
});

/* config */
function loadCfg(){
  fetch("/api/config").then(function(r){return r.json()}).then(function(c){
    CFG=c;
    var ks=el("keyStat");
    if(c.hasPlacesKey){ks.textContent="Clé configurée ("+c.keyHint+")";ks.className="ok m0";el("optPlaces").textContent="Google Places \\u2713";}
    else{ks.textContent="Aucune clé. OpenStreetMap reste gratuit.";ks.className="mut m0";}
    var d=c.defaults||{};
    if(d.city&&!nm("city").value)nm("city").value=d.city;
    if(d.region&&!nm("region").value)nm("region").value=d.region;
    if(d.country&&!nm("country").value)nm("country").value=d.country;
    if(d.source)nm("source").value=d.source;
    var j=c.jump||{};
    el("jStat").innerHTML=j.configured?('<span class="ok">Connecté'+(j.email?" ("+esc(j.email)+")":"")+'</span>'):'<span class="mut">Non connecté</span>';
    if(j.email&&!el("jEmail").value)el("jEmail").value=j.email;
    if(c.cvcrush&&c.cvcrush.appId)el("cvId").value=c.cvcrush.appId;
  }).catch(function(){});
}
el("saveKey").onclick=function(){el("keyStat").textContent="...";fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":el("key").value.trim()})}).then(function(r){return r.json()}).then(function(){el("key").value="";loadCfg()})};
el("clearKey").onclick=function(){fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":""})}).then(function(r){return r.json()}).then(function(){el("key").value="";loadCfg()})};
el("jSave").onclick=function(){
  el("jStat").textContent="connexion...";
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"jump-email":el("jEmail").value.trim(),"jump-password":el("jPass").value})})
   .then(function(r){return r.json()}).then(function(){el("jPass").value="";return fetch("/api/joinjump/test",{method:"POST"})}).then(function(r){return r.json()})
   .then(function(t){el("jStat").innerHTML=t.ok?('<span class="ok">Connecté \\u2713 '+t.count+' client(s)</span>'):('<span class="bad">Échec: '+esc(t.error||"")+'</span>');loadCfg()})
   .catch(function(e){el("jStat").innerHTML='<span class="bad">Erreur: '+esc(e.message)+'</span>'});
};
el("cvCopy").onclick=function(){el("cvId").select();try{document.execCommand("copy")}catch(e){}};

/* table + selection */
function view(){
  var q=el("q").value.toLowerCase().trim(),pr=el("pr").value,st=el("st").value,fp=el("fp").checked,fe=el("fe").checked,fo=el("fo").checked;
  var rows=DATA.filter(function(r){
    if(pr&&r.priority!==pr)return false;
    if(st==="aucun"&&r.siteStatus!=="aucun site")return false;
    if(st==="hors"&&r.siteStatus!=="hors ligne")return false;
    if(st==="en"&&String(r.siteStatus).indexOf("en ligne")<0)return false;
    if(fp&&!r.phone)return false;if(fe&&!r.email)return false;if(fo&&!r.owner)return false;
    if(q){var h=(r.name+" "+r.activity+" "+r.owner+" "+r.location+" "+r.opportunity+" "+r.legal).toLowerCase();if(h.indexOf(q)<0)return false}
    return true;
  });
  rows.sort(function(a,b){var x=a[sk],y=b[sk];if(typeof x==="string"){x=(x||"").toLowerCase();y=(y||"").toLowerCase()}return x<y?-sd:x>y?sd:0});
  return rows;
}
function selectedLeads(){ var s=DATA.filter(function(r){return SEL[keyOf(r)]}); return s.length?s:view(); }
function render(){
  var rows=view();
  el("cnt").textContent=rows.length+" / "+DATA.length;
  el("empty").style.display=DATA.length?"none":"block";
  el("sTotal").textContent=DATA.length;
  el("sHot").textContent=DATA.filter(function(r){return r.priority==="Chaud"}).length;
  el("sTel").textContent=DATA.filter(function(r){return r.phone}).length;
  el("sMail").textContent=DATA.filter(function(r){return r.email}).length;
  el("sSel").textContent=Object.keys(SEL).length;
  el("tb").innerHTML=rows.map(function(r){
    var t=tier(r.score),k=keyOf(r),on=SEL[k]?" checked":"",selc=SEL[k]?" class=sel":"";
    var opCls=/Cr\\u00e9ation|mort|Refonte/.test(r.opportunity)?"pill":"pill";
    var already=r.__already?'<span class="tag">déjà client</span>':"";
    return '<tr'+selc+' data-k="'+esc(k)+'"><td><input type="checkbox" class="rowsel"'+on+'></td>'
      +'<td><span class="sc '+t+' mono">'+r.score+'</span></td>'
      +'<td><span class="name">'+esc(r.name)+'</span>'+already+((r.legal&&r.legal.toLowerCase()!==String(r.name).toLowerCase())?'<div class="mut">'+esc(r.legal)+'</div>':'')+'</td>'
      +'<td>'+esc(r.activity)+(r.size?'<div class="mut">'+esc(r.size)+(r.created?" \\u00b7 "+esc(r.created):"")+'</div>':'')+'</td>'
      +'<td>'+(r.owner?'<span class="name">'+esc(r.owner)+'</span><div class="mut">'+esc(r.role)+'</div>':'<span class="mut">\\u2014</span>')+'</td>'
      +'<td>'+tel(r.phone)+'</td><td>'+mail(r.email)+'</td>'
      +'<td><span class="'+opCls+'">'+esc(r.opportunity)+'</span></td>'
      +'<td class="mut">'+esc(r.location)+'</td></tr>';
  }).join("");
  Array.prototype.forEach.call(document.querySelectorAll("#tb tr"),function(tr){
    var k=tr.getAttribute("data-k");
    tr.querySelector(".rowsel").onclick=function(e){e.stopPropagation();if(this.checked)SEL[k]=1;else delete SEL[k];render()};
  });
  el("selAll").checked=rows.length>0&&rows.every(function(r){return SEL[keyOf(r)]});
}
el("selAll").onclick=function(){var rows=view();if(this.checked)rows.forEach(function(r){SEL[keyOf(r)]=1});else rows.forEach(function(r){delete SEL[keyOf(r)]});render()};
el("selClear").onclick=function(){SEL={};render()};
el("selTopBtn").onclick=function(e){if(e.target.id==="topN")return;var n=Number(el("topN").value)||20;SEL={};view().slice(0,n).forEach(function(r){SEL[keyOf(r)]=1});render()};
Array.prototype.forEach.call(document.querySelectorAll("thead th[data-k]"),function(th){th.onclick=function(){var k=th.getAttribute("data-k");sd=(sk===k)?-sd:(k==="score"?-1:1);sk=k;render()}});
["q","pr","st","fp","fe","fo"].forEach(function(i){el(i).addEventListener("input",render)});

/* search stream */
function run(){
  var body={source:nm("source").value,term:nm("term").value,city:nm("city").value,region:nm("region").value,country:nm("country").value,limit:Number(nm("limit").value)||30,category:nm("category").value,owner:nm("owner").checked,audit:nm("audit").checked};
  DATA=[];SEL={};render();el("go").disabled=true;el("go").textContent="...";el("prog").style.width="3%";el("statusLine").textContent="recherche...";
  var total=0;
  fetch("/api/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(res){
    var rd=res.body.getReader(),dec=new TextDecoder(),buf="";
    function pump(){return rd.read().then(function(x){
      if(x.done){fin();return}
      buf+=dec.decode(x.value,{stream:true});var ls=buf.split("\\n");buf=ls.pop();
      ls.forEach(function(ln){if(!ln.trim())return;var m;try{m=JSON.parse(ln)}catch(e){return}
        if(m.t==="meta")total=m.total;
        else if(m.t==="lead"){DATA.push(m.lead);if(DATA.length%2===0)render();el("prog").style.width=Math.min(98,DATA.length/(total||1)*100)+"%";el("statusLine").textContent=DATA.length+(total?" / "+total:"")+" enrichis"}
        else if(m.t==="error")el("statusLine").textContent="Erreur: "+m.message;
      });return pump();
    })}
    return pump();
  }).catch(function(e){el("statusLine").textContent="Erreur: "+e.message;fin()});
  function fin(){el("go").disabled=false;el("go").textContent="Générer";el("prog").style.width="100%";render();if(DATA.length)el("statusLine").textContent=DATA.length+" leads";setTimeout(function(){el("prog").style.width="0"},700)}
}
el("go").onclick=run;

/* export files */
function download(name,text,type){var b=new Blob([text],{type:type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function csvCell(v){v=(v==null?"":String(v));return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
Array.prototype.forEach.call(document.querySelectorAll(".exp"),function(btn){btn.onclick=function(){
  var rows=selectedLeads();if(!rows.length){el("statusLine").textContent="rien à exporter";return}
  var f=btn.getAttribute("data-f"),st=new Date().toISOString().slice(0,10);
  if(f==="json")download("leads-"+st+".json",JSON.stringify(rows,null,2),"application/json");
  else if(f==="csv"){var h=COLS.join(","),b=rows.map(function(r){return COLS.map(function(c){return csvCell(r[c])}).join(",")}).join("\\n");download("leads-"+st+".csv",h+"\\n"+b,"text/csv")}
  else if(f==="html")download("leads-"+st+".html",exportHtml(rows),"text/html");
}});
function exportHtml(rows){var th="<tr><th>Score</th><th>Entreprise</th><th>Activite</th><th>Proprietaire</th><th>Tel</th><th>Email</th><th>Opportunite</th><th>Lieu</th></tr>";var tr=rows.map(function(r){return "<tr><td>"+r.score+"</td><td>"+esc(r.name)+"</td><td>"+esc(r.activity)+"</td><td>"+esc(r.owner)+" "+esc(r.role)+"</td><td>"+esc(r.phone)+"</td><td>"+esc(r.email)+"</td><td>"+esc(r.opportunity)+"</td><td>"+esc(r.location)+"</td></tr>"}).join("");return "<!doctype html><meta charset=utf-8><title>leads</title><style>body{font:13px sans-serif;margin:20px;background:#0b0c0e;color:#eceef1}table{border-collapse:collapse;width:100%}th,td{border:1px solid #23262d;padding:7px;text-align:left}th{background:#131418}</style><table>"+th+tr+"</table>"}

/* modal */
function modal(html){el("modal").innerHTML=html;el("scrim").classList.add("on")}
function closeModal(){el("scrim").classList.remove("on")}
el("scrim").onclick=function(e){if(e.target===el("scrim"))closeModal()};

/* Join-Jump */
function jumpState(){
  fetch("/api/config").then(function(r){return r.json()}).then(function(c){
    var j=c.jump||{};
    el("jjState").innerHTML=j.configured?('<span class="ok">\\u25cf Connecté'+(j.email?" ("+esc(j.email)+")":"")+'</span>'):('<span class="bad">\\u25cf Non connecté.</span> Va dans <b>Réglages</b> pour connecter ton compte Join-Jump.');
  });
}
el("jjExport").onclick=function(){
  var rows=selectedLeads();
  if(!rows.length){modal('<h3>Aucun lead</h3><div class="big">Génère des leads d\\'abord.</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>');return}
  modal('<h3>Export Join-Jump</h3><div class="big">Vérification des clients existants pour '+rows.length+' lead(s)...</div>');
  fetch("/api/joinjump/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({leads:rows,confirm:false})}).then(function(r){return r.json()}).then(function(p){
    if(p.error){modal('<h3>Join-Jump</h3><div class="big bad">'+esc(p.error)+'</div><div class="foot"><button class="btn" onclick="closeModal()">Fermer</button></div>');return}
    // tag already-clients in table
    var already={};(p.skipped||[]).forEach(function(s){already[s.name]=1});
    DATA.forEach(function(r){if(already[r.name])r.__already=1});render();
    modal('<h3>Export vers Join-Jump</h3><div class="big"><b class="ok">'+p.toCreate+'</b> nouveau(x) client(s) à créer.<br><b>'+p.alreadyClients+'</b> déjà client(s), ignoré(s) (anti-doublon).</div><div class="foot"><button class="btn" onclick="closeModal()">Annuler</button><button class="btn red" id="jjConfirm">Créer '+p.toCreate+' client(s)</button></div>');
    if(p.toCreate>0)el("jjConfirm").onclick=function(){doExport(rows)};else el("jjConfirm").disabled=true;
  }).catch(function(e){modal('<h3>Erreur</h3><div class="big bad">'+esc(e.message)+'</div><div class="foot"><button class="btn" onclick="closeModal()">Fermer</button></div>')});
};
function doExport(rows){
  modal('<h3>Création en cours...</h3><div class="big">Création des clients sur Join-Jump.</div>');
  fetch("/api/joinjump/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({leads:rows,confirm:true})}).then(function(r){return r.json()}).then(function(o){
    if(o.error){modal('<h3>Erreur</h3><div class="big bad">'+esc(o.error)+'</div><div class="foot"><button class="btn" onclick="closeModal()">Fermer</button></div>');return}
    var lines=(o.created||[]).map(function(x){return '<div class="ok">\\u2713 '+esc(x.name)+'</div>'}).join("")+(o.errors||[]).map(function(x){return '<div class="bad">\\u2717 '+esc(x.name)+' \\u2014 '+esc(x.message||"")+'</div>'}).join("");
    modal('<h3>Terminé</h3><div class="big"><b class="ok">'+(o.created||[]).length+'</b> client(s) créé(s)'+((o.errors||[]).length?', <b class="bad">'+o.errors.length+'</b> erreur(s)':'')+'.</div><div class="res">'+lines+'</div><div class="foot"><button class="btn red" onclick="closeModal()">Fermer</button></div>');
  }).catch(function(e){modal('<h3>Erreur</h3><div class="big bad">'+esc(e.message)+'</div><div class="foot"><button class="btn" onclick="closeModal()">Fermer</button></div>')});
}

/* cvcrush */
function cvUrl(kind){var id=(CFG.cvcrush&&CFG.cvcrush.appId)||"";var redir=encodeURIComponent(location.origin+"/cvcrush/callback");return "https://cvcrush.co/"+kind+"?app=leadjet&app_id="+encodeURIComponent(id)+"&redirect_uri="+redir}
el("cvUse").onclick=function(){window.open(cvUrl("connect"),"_blank")};
el("cvExport").onclick=function(){var rows=selectedLeads();window.open(cvUrl("import")+"&count="+rows.length,"_blank")};

loadCfg();render();
`;
