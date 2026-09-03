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
.side{background:#0e0f12;border-right:1px solid var(--line);display:flex;flex-direction:column;padding:16px 12px;gap:4px}
.logo{font-size:19px;font-weight:800;letter-spacing:-.03em;padding:4px 8px 16px}
.logo b{color:var(--red)}
.nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;color:var(--mut);font-weight:600;font-size:13px;cursor:pointer}
.nav a:hover{background:var(--elev);color:var(--ink2);text-decoration:none}
.nav a.active{background:var(--red-dim);color:var(--red-h)}
.side .foot{margin-top:auto;padding:8px 6px;display:flex;flex-direction:column;gap:10px}
.side .foot .lang{display:flex;align-items:center;gap:7px}
.side .foot select{flex:1;height:30px}
.side .foot .ver{display:flex;justify-content:space-between;align-items:center;color:var(--mut);font-size:11px}
.side .foot .dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}
.main{overflow:auto}
.view{display:none;padding:20px 24px 60px;max-width:1500px}
.view.on{display:block}
.phead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.phead h1{margin:0;font-size:20px;letter-spacing:-.02em}
.phead .sub{color:var(--mut);font-size:12.5px;margin-top:2px}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px}
.pad{padding:14px}
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
.searchbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.searchbar .term{flex:1 1 170px;min-width:150px}
.w-sm{width:120px}.w-xs{width:82px}
.bar{height:2px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--red),var(--amber));transition:width .25s}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:14px 0}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.kpi b{display:block;font-size:22px;font-weight:800;letter-spacing:-.02em}
.kpi span{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.kpi.red b{color:var(--red)}.kpi.green b{color:var(--green)}
.toolbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.chip{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink2);cursor:pointer;user-select:none}
.sep{flex:1}
.exp{height:32px;padding:0 11px;border-radius:7px;border:1px solid var(--line);background:var(--elev);color:var(--ink2);font-size:12px;font-weight:600;cursor:pointer}
.exp:hover{border-color:var(--red-bd);color:var(--ink)}
.status{font-size:11.5px;color:var(--mut)}
.count{font-weight:700;color:var(--ink2);white-space:nowrap;font-size:12px}
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
.set-grid{display:grid;grid-template-columns:1fr;gap:14px;max-width:640px}
.set-card h3{margin:0 0 3px;font-size:14px}.set-card p{margin:0 0 12px;color:var(--mut);font-size:12px}
.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin-bottom:5px}
.row{display:flex;gap:8px;margin-bottom:10px}.row input{flex:1}
.ok{color:var(--green)}.bad{color:var(--red-h)}
.hint{font-size:11px;color:var(--mut);line-height:1.45}.m0{margin:0}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:70}
.scrim.on{display:flex}
.modal{width:440px;max-width:92vw;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.modal h3{margin:0 0 10px;font-size:16px}
.modal .big{font-size:13px;color:var(--ink2);line-height:1.6}
.modal .foot{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.res{max-height:220px;overflow:auto;margin-top:10px;font-size:12px}.res div{padding:3px 0;border-bottom:1px solid var(--line)}
.mtop{display:none;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line);background:#0e0f12;position:sticky;top:0;z-index:40}
.burger{width:36px;height:36px;display:grid;place-items:center;background:var(--elev);border:1px solid var(--line);border-radius:9px;cursor:pointer;padding:0}
.burger span{display:block;width:16px;height:2px;background:var(--ink);box-shadow:0 -5px 0 var(--ink),0 5px 0 var(--ink)}
.mtop .logo{padding:0;font-size:17px}
.side-scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:44}
@media(max-width:880px){
  .app{display:block;height:auto}
  .side{position:fixed;top:0;left:0;height:100%;width:236px;transform:translateX(-100%);transition:transform .22s ease;z-index:50;overflow:auto}
  .side.open{transform:none;box-shadow:0 0 40px rgba(0,0,0,.5)}
  .mtop{display:flex}.side-scrim.on{display:block}
  .main{height:auto}.view{padding:16px 14px 60px}.twrap{max-height:none}
  .phead{flex-direction:column;gap:10px}.acts{width:100%}.acts .btn{flex:1;justify-content:center}
  .searchbar .term,.searchbar .w-sm,.searchbar .w-xs{flex:1 1 100%;width:100%}
  .searchbar .btn{width:100%;justify-content:center}
}
</style></head><body>
<div class="app">
  <aside class="side" id="side">
    <div class="logo">lead<b>jet</b></div>
    <nav class="nav">
      <a data-view="leads" class="active" data-i18n="nav_leads">Leads</a>
      <a data-view="jump">Join-Jump</a>
      <a data-view="settings" data-i18n="nav_settings">Réglages</a>
    </nav>
    <div class="foot">
      <div class="lang"><span class="ic">&#127760;</span><select id="lang" title="language">
        <option value="en">English</option><option value="fr">Français</option><option value="es">Español</option>
        <option value="de">Deutsch</option><option value="it">Italiano</option><option value="pt">Português</option>
      </select></div>
      <div class="ver"><span>v0.1.0</span><span class="dot" title="server"></span></div>
    </div>
  </aside>
  <main class="main">
    <div class="mtop"><button class="burger" id="burger"><span></span></button><div class="logo">lead<b>jet</b></div></div>

    <section class="view on" id="v-leads">
      <div class="phead">
        <div><h1 data-i18n="h_leads">Leads</h1><div class="sub" data-i18n="sub_leads">Trouver, qualifier, sélectionner, exporter</div></div>
        <div class="acts">
          <button class="btn red" id="jjExport" data-i18n="btn_jjexport">Exporter vers Join-Jump</button>
          <button class="btn red-o" id="cvUse">cvcrush</button>
          <button class="btn red-o" id="cvExport" data-i18n="btn_cvexport">Export cvcrush</button>
        </div>
      </div>
      <div class="card pad searchbar">
        <input class="term" name="term" data-ph="ph_niche" placeholder="niche" value="restaurants">
        <select name="source" class="w-sm"><option value="osm">OpenStreetMap</option><option value="places" id="optPlaces">Google Places</option></select>
        <input class="w-sm" name="city" data-ph="ph_city" placeholder="ville" value="Lyon">
        <input class="w-sm" name="region" data-ph="ph_region" placeholder="région">
        <input class="w-xs" name="country" data-ph="ph_country" placeholder="pays" value="France">
        <input class="w-xs mono" name="limit" type="number" value="30" min="1" max="200">
        <select name="category" class="w-sm">
          <option value="" data-i18n="cat_ph">catégorie</option><option value="any" data-i18n="cat_any">tout</option>
          <option value="food" data-i18n="cat_food">restauration</option><option value="shops" data-i18n="cat_shops">commerces</option>
          <option value="craft" data-i18n="cat_craft">artisans</option><option value="services" data-i18n="cat_services">services</option>
          <option value="beauty" data-i18n="cat_beauty">beauté</option>
        </select>
        <label class="tog"><input type="checkbox" name="owner" checked> <span data-i18n="tog_owner">propriétaire</span></label>
        <label class="tog"><input type="checkbox" name="audit" checked> <span data-i18n="tog_audit">audit</span></label>
        <button class="btn red" id="go" data-i18n="btn_generate">Générer</button>
      </div>
      <div class="bar"><i id="prog"></i></div>
      <div class="stats">
        <div class="kpi"><b id="sTotal">0</b><span data-i18n="kpi_leads">leads</span></div>
        <div class="kpi red"><b id="sHot">0</b><span data-i18n="kpi_hot">chaud</span></div>
        <div class="kpi"><b id="sTel">0</b><span data-i18n="kpi_phone">téléphone</span></div>
        <div class="kpi"><b id="sMail">0</b><span data-i18n="kpi_email">email</span></div>
        <div class="kpi green"><b id="sSel">0</b><span data-i18n="kpi_selected">sélectionnés</span></div>
      </div>
      <div class="toolbar">
        <input type="search" id="q" data-ph="ph_filter" placeholder="filtrer..." style="width:170px">
        <select id="pr"><option value="" data-i18n="pr_ph">priorité</option><option value="Chaud">Chaud</option><option value="Tiède">Tiède</option><option value="Froid">Froid</option></select>
        <select id="st"><option value="" data-i18n="st_ph">site</option><option value="aucun" data-i18n="st_none">sans site</option><option value="hors" data-i18n="st_dead">site mort</option><option value="en" data-i18n="st_online">en ligne</option></select>
        <label class="chip"><input type="checkbox" id="fp"> <span data-i18n="f_tel">tél</span></label>
        <label class="chip"><input type="checkbox" id="fe"> <span data-i18n="f_email">email</span></label>
        <label class="chip"><input type="checkbox" id="fo"> <span data-i18n="f_owner">propriétaire</span></label>
        <button class="btn" id="selTopBtn">Top <input id="topN" class="mono" type="number" value="20" min="1" style="width:56px;height:26px;margin:0 2px;padding:2px 6px"></button>
        <button class="btn" id="selClear" data-i18n="btn_clearsel">Vider</button>
        <span class="sep"></span>
        <span class="status" id="statusLine"></span>
        <button class="exp" data-f="csv">CSV</button><button class="exp" data-f="json">JSON</button><button class="exp" data-f="html">HTML</button>
        <span class="count" id="cnt">0</span>
      </div>
      <div class="card tablecard"><div class="twrap"><table>
        <thead><tr>
          <th class="nocur" style="width:34px"><input type="checkbox" id="selAll"></th>
          <th data-k="score" data-i18n="th_score">Score</th><th data-k="name" data-i18n="th_company">Entreprise</th>
          <th data-k="activity" data-i18n="th_activity">Activité</th><th data-k="owner" data-i18n="th_owner">Propriétaire</th>
          <th data-k="phone" data-i18n="th_phone">Tél</th><th data-k="email" data-i18n="th_email">Email</th>
          <th data-k="opportunity" data-i18n="th_opportunity">Opportunité</th><th data-k="location" data-i18n="th_place">Lieu</th>
        </tr></thead>
        <tbody id="tb"></tbody>
      </table>
      <div class="empty" id="empty" data-i18n="empty_text">Choisis une niche et une ville, puis Générer.</div>
      </div></div>
    </section>

    <section class="view" id="v-jump">
      <div class="phead"><div><h1>Join-Jump</h1><div class="sub" data-i18n="sub_jump">Transformer les leads en clients, sans doublon</div></div></div>
      <div class="card pad" style="max-width:640px">
        <div id="jjState" class="big">...</div>
        <div class="hint" style="margin-top:12px" data-i18n="jump_hint">Sélectionne des leads dans Leads, puis Exporter vers Join-Jump. Les clients existants sont détectés et jamais recréés.</div>
      </div>
    </section>

    <section class="view" id="v-settings">
      <div class="phead"><div><h1 data-i18n="h_settings">Réglages</h1><div class="sub" data-i18n="sub_settings">Clés et connexions, stockées localement</div></div></div>
      <div class="set-grid">
        <div class="card pad set-card">
          <h3 data-i18n="set_places_h">Google Places</h3><p data-i18n="set_places_p">Optionnel. Sans clé, OpenStreetMap est gratuit.</p>
          <div class="lbl" data-i18n="key_label">Clé API</div>
          <div class="row"><input type="password" id="key" placeholder="AIza..."><button class="btn red" id="saveKey" data-i18n="btn_save">Enregistrer</button><button class="btn" id="clearKey" data-i18n="btn_clear">Effacer</button></div>
          <div class="mut m0" id="keyStat">...</div>
        </div>
        <div class="card pad set-card">
          <h3 data-i18n="set_jump_h">Compte Join-Jump</h3><p data-i18n="set_jump_p">Connecte ton compte pour exporter les leads en clients.</p>
          <div class="lbl" data-i18n="email_label">Email</div>
          <div class="row"><input id="jEmail" placeholder="email@exemple.com"></div>
          <div class="lbl" data-i18n="pass_label">Mot de passe</div>
          <div class="row"><input type="password" id="jPass" placeholder="••••••••"><button class="btn red" id="jSave" data-i18n="btn_connect">Connecter</button></div>
          <div class="mut m0" id="jStat">...</div>
        </div>
        <div class="card pad set-card">
          <h3 data-i18n="set_cv_h">cvcrush</h3><p data-i18n="set_cv_p">Identifiant unique de cette installation.</p>
          <div class="lbl" data-i18n="appid_label">App ID</div>
          <div class="row"><input id="cvId" class="mono" readonly><button class="btn" id="cvCopy" data-i18n="btn_copy">Copier</button></div>
        </div>
      </div>
    </section>
  </main>
</div>
<div class="side-scrim" id="sideScrim"></div>
<div class="scrim" id="scrim"><div class="modal" id="modal"></div></div>
<script src="/app.js"></script>
</body></html>`;

/** Browser logic, served at /app.js. */
export const APP_JS = `
var DATA=[], SEL={}, sk="score", sd=-1, CFG={}, LANG="en";
function el(i){return document.getElementById(i)}
function nm(n){return document.querySelector("[name="+n+"]")}
function esc(s){return (s==null?"":String(s)).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function tel(p){return p?'<a class="mono" href="tel:'+String(p).replace(/\\s/g,"")+'">'+esc(p)+'</a>':'<span class="mut">\\u2014</span>'}
function mail(e){return e?'<a href="mailto:'+esc(e)+'">'+esc(e)+'</a>':'<span class="mut">\\u2014</span>'}
function tier(s){return s>=70?"hot":s>=45?"warm":"cold"}
function keyOf(r){return r.place_id||(r.name+"|"+r.location)}
var COLS=["name","legal","activity","owner","role","phone","email","score","priority","opportunity","approach","location","regCity","regCp","website","siteStatus","naf","legalForm","created","size","siren","confidence","source"];

/* ---- i18n ---- */
var I18N={
 fr:{nav_leads:"Leads",nav_settings:"Réglages",h_leads:"Leads",sub_leads:"Trouver, qualifier, sélectionner, exporter",sub_jump:"Transformer les leads en clients, sans doublon",jump_hint:"Sélectionne des leads dans Leads, puis Exporter vers Join-Jump. Les clients existants sont détectés et jamais recréés.",h_settings:"Réglages",sub_settings:"Clés et connexions, stockées localement",btn_jjexport:"Exporter vers Join-Jump",btn_cvexport:"Export cvcrush",ph_niche:"niche (restaurants, plombiers...)",ph_city:"ville",ph_region:"région",ph_country:"pays",ph_filter:"filtrer...",cat_ph:"catégorie",cat_any:"tout",cat_food:"restauration",cat_shops:"commerces",cat_craft:"artisans",cat_services:"services",cat_beauty:"beauté",tog_owner:"propriétaire",tog_audit:"audit",btn_generate:"Générer",kpi_leads:"leads",kpi_hot:"chaud",kpi_phone:"téléphone",kpi_email:"email",kpi_selected:"sélectionnés",pr_ph:"priorité",st_ph:"site",st_none:"sans site",st_dead:"site mort",st_online:"en ligne",f_tel:"tél",f_email:"email",f_owner:"propriétaire",btn_clearsel:"Vider",th_score:"Score",th_company:"Entreprise",th_activity:"Activité",th_owner:"Propriétaire",th_phone:"Tél",th_email:"Email",th_opportunity:"Opportunité",th_place:"Lieu",empty_text:"Choisis une niche et une ville, puis Générer.",set_places_h:"Google Places",set_places_p:"Optionnel. Sans clé, OpenStreetMap est gratuit.",key_label:"Clé API",btn_save:"Enregistrer",btn_clear:"Effacer",set_jump_h:"Compte Join-Jump",set_jump_p:"Connecte ton compte pour exporter les leads en clients.",email_label:"Email",pass_label:"Mot de passe",btn_connect:"Connecter",set_cv_h:"cvcrush",set_cv_p:"Identifiant unique de cette installation.",appid_label:"App ID",btn_copy:"Copier",m_connected:"Connecté",m_notconn:"Non connecté",m_clients:"client(s)"},
 en:{nav_leads:"Leads",nav_settings:"Settings",h_leads:"Leads",sub_leads:"Find, qualify, select, export",sub_jump:"Turn leads into clients, no duplicates",jump_hint:"Select leads in Leads, then Export to Join-Jump. Existing clients are detected and never recreated.",h_settings:"Settings",sub_settings:"Keys and connections, stored locally",btn_jjexport:"Export to Join-Jump",btn_cvexport:"Export to cvcrush",ph_niche:"niche (restaurants, plumbers...)",ph_city:"city",ph_region:"region",ph_country:"country",ph_filter:"filter...",cat_ph:"category",cat_any:"all",cat_food:"food",cat_shops:"shops",cat_craft:"craft",cat_services:"services",cat_beauty:"beauty",tog_owner:"owner",tog_audit:"audit",btn_generate:"Generate",kpi_leads:"leads",kpi_hot:"hot",kpi_phone:"phone",kpi_email:"email",kpi_selected:"selected",pr_ph:"priority",st_ph:"site",st_none:"no site",st_dead:"dead site",st_online:"online",f_tel:"phone",f_email:"email",f_owner:"owner",btn_clearsel:"Clear",th_score:"Score",th_company:"Company",th_activity:"Activity",th_owner:"Owner",th_phone:"Phone",th_email:"Email",th_opportunity:"Opportunity",th_place:"Location",empty_text:"Pick a niche and a city, then Generate.",set_places_h:"Google Places",set_places_p:"Optional. Without a key, OpenStreetMap is free.",key_label:"API key",btn_save:"Save",btn_clear:"Clear",set_jump_h:"Join-Jump account",set_jump_p:"Connect your account to export leads as clients.",email_label:"Email",pass_label:"Password",btn_connect:"Connect",set_cv_h:"cvcrush",set_cv_p:"Unique id of this install.",appid_label:"App ID",btn_copy:"Copy",m_connected:"Connected",m_notconn:"Not connected",m_clients:"client(s)"},
 es:{nav_leads:"Leads",nav_settings:"Ajustes",h_leads:"Leads",sub_leads:"Encontrar, calificar, seleccionar, exportar",sub_jump:"Convertir leads en clientes, sin duplicados",jump_hint:"Selecciona leads en Leads, luego Exportar a Join-Jump. Los clientes existentes se detectan y nunca se recrean.",h_settings:"Ajustes",sub_settings:"Claves y conexiones, guardadas localmente",btn_jjexport:"Exportar a Join-Jump",btn_cvexport:"Exportar a cvcrush",ph_niche:"nicho (restaurantes, fontaneros...)",ph_city:"ciudad",ph_region:"región",ph_country:"país",ph_filter:"filtrar...",cat_ph:"categoría",cat_any:"todo",cat_food:"restauración",cat_shops:"comercios",cat_craft:"artesanos",cat_services:"servicios",cat_beauty:"belleza",tog_owner:"propietario",tog_audit:"auditoría",btn_generate:"Generar",kpi_leads:"leads",kpi_hot:"caliente",kpi_phone:"teléfono",kpi_email:"email",kpi_selected:"seleccionados",pr_ph:"prioridad",st_ph:"sitio",st_none:"sin sitio",st_dead:"sitio muerto",st_online:"en línea",f_tel:"tel",f_email:"email",f_owner:"propietario",btn_clearsel:"Vaciar",th_score:"Puntuación",th_company:"Empresa",th_activity:"Actividad",th_owner:"Propietario",th_phone:"Tel",th_email:"Email",th_opportunity:"Oportunidad",th_place:"Lugar",empty_text:"Elige un nicho y una ciudad, luego Generar.",set_places_h:"Google Places",set_places_p:"Opcional. Sin clave, OpenStreetMap es gratis.",key_label:"Clave API",btn_save:"Guardar",btn_clear:"Borrar",set_jump_h:"Cuenta Join-Jump",set_jump_p:"Conecta tu cuenta para exportar leads como clientes.",email_label:"Email",pass_label:"Contraseña",btn_connect:"Conectar",set_cv_h:"cvcrush",set_cv_p:"Id único de esta instalación.",appid_label:"App ID",btn_copy:"Copiar",m_connected:"Conectado",m_notconn:"No conectado",m_clients:"cliente(s)"},
 de:{nav_leads:"Leads",nav_settings:"Einstellungen",h_leads:"Leads",sub_leads:"Finden, qualifizieren, auswählen, exportieren",sub_jump:"Leads in Kunden verwandeln, ohne Duplikate",jump_hint:"Wähle Leads unter Leads, dann Export zu Join-Jump. Bestehende Kunden werden erkannt und nie neu erstellt.",h_settings:"Einstellungen",sub_settings:"Schlüssel und Verbindungen, lokal gespeichert",btn_jjexport:"Zu Join-Jump exportieren",btn_cvexport:"Zu cvcrush exportieren",ph_niche:"Nische (Restaurants, Klempner...)",ph_city:"Stadt",ph_region:"Region",ph_country:"Land",ph_filter:"filtern...",cat_ph:"Kategorie",cat_any:"alle",cat_food:"Gastronomie",cat_shops:"Geschäfte",cat_craft:"Handwerk",cat_services:"Dienste",cat_beauty:"Beauty",tog_owner:"Inhaber",tog_audit:"Audit",btn_generate:"Generieren",kpi_leads:"Leads",kpi_hot:"heiß",kpi_phone:"Telefon",kpi_email:"E-Mail",kpi_selected:"ausgewählt",pr_ph:"Priorität",st_ph:"Website",st_none:"keine Website",st_dead:"tote Website",st_online:"online",f_tel:"Tel",f_email:"E-Mail",f_owner:"Inhaber",btn_clearsel:"Leeren",th_score:"Score",th_company:"Firma",th_activity:"Tätigkeit",th_owner:"Inhaber",th_phone:"Tel",th_email:"E-Mail",th_opportunity:"Chance",th_place:"Ort",empty_text:"Nische und Stadt wählen, dann Generieren.",set_places_h:"Google Places",set_places_p:"Optional. Ohne Schlüssel ist OpenStreetMap gratis.",key_label:"API-Schlüssel",btn_save:"Speichern",btn_clear:"Löschen",set_jump_h:"Join-Jump Konto",set_jump_p:"Verbinde dein Konto, um Leads als Kunden zu exportieren.",email_label:"E-Mail",pass_label:"Passwort",btn_connect:"Verbinden",set_cv_h:"cvcrush",set_cv_p:"Eindeutige ID dieser Installation.",appid_label:"App ID",btn_copy:"Kopieren",m_connected:"Verbunden",m_notconn:"Nicht verbunden",m_clients:"Kunde(n)"},
 it:{nav_leads:"Leads",nav_settings:"Impostazioni",h_leads:"Leads",sub_leads:"Trovare, qualificare, selezionare, esportare",sub_jump:"Trasformare i lead in clienti, senza duplicati",jump_hint:"Seleziona i lead in Leads, poi Esporta su Join-Jump. I clienti esistenti vengono rilevati e mai ricreati.",h_settings:"Impostazioni",sub_settings:"Chiavi e connessioni, salvate localmente",btn_jjexport:"Esporta su Join-Jump",btn_cvexport:"Esporta su cvcrush",ph_niche:"nicchia (ristoranti, idraulici...)",ph_city:"città",ph_region:"regione",ph_country:"paese",ph_filter:"filtra...",cat_ph:"categoria",cat_any:"tutto",cat_food:"ristorazione",cat_shops:"negozi",cat_craft:"artigiani",cat_services:"servizi",cat_beauty:"bellezza",tog_owner:"titolare",tog_audit:"audit",btn_generate:"Genera",kpi_leads:"leads",kpi_hot:"caldo",kpi_phone:"telefono",kpi_email:"email",kpi_selected:"selezionati",pr_ph:"priorità",st_ph:"sito",st_none:"senza sito",st_dead:"sito morto",st_online:"online",f_tel:"tel",f_email:"email",f_owner:"titolare",btn_clearsel:"Svuota",th_score:"Punteggio",th_company:"Azienda",th_activity:"Attività",th_owner:"Titolare",th_phone:"Tel",th_email:"Email",th_opportunity:"Opportunità",th_place:"Luogo",empty_text:"Scegli una nicchia e una città, poi Genera.",set_places_h:"Google Places",set_places_p:"Opzionale. Senza chiave, OpenStreetMap è gratis.",key_label:"Chiave API",btn_save:"Salva",btn_clear:"Cancella",set_jump_h:"Account Join-Jump",set_jump_p:"Collega il tuo account per esportare i lead come clienti.",email_label:"Email",pass_label:"Password",btn_connect:"Connetti",set_cv_h:"cvcrush",set_cv_p:"ID unico di questa installazione.",appid_label:"App ID",btn_copy:"Copia",m_connected:"Connesso",m_notconn:"Non connesso",m_clients:"cliente/i"},
 pt:{nav_leads:"Leads",nav_settings:"Definições",h_leads:"Leads",sub_leads:"Encontrar, qualificar, selecionar, exportar",sub_jump:"Transformar leads em clientes, sem duplicados",jump_hint:"Seleciona leads em Leads, depois Exportar para Join-Jump. Os clientes existentes são detetados e nunca recriados.",h_settings:"Definições",sub_settings:"Chaves e ligações, guardadas localmente",btn_jjexport:"Exportar para Join-Jump",btn_cvexport:"Exportar para cvcrush",ph_niche:"nicho (restaurantes, canalizadores...)",ph_city:"cidade",ph_region:"região",ph_country:"país",ph_filter:"filtrar...",cat_ph:"categoria",cat_any:"tudo",cat_food:"restauração",cat_shops:"comércios",cat_craft:"artesãos",cat_services:"serviços",cat_beauty:"beleza",tog_owner:"proprietário",tog_audit:"auditoria",btn_generate:"Gerar",kpi_leads:"leads",kpi_hot:"quente",kpi_phone:"telefone",kpi_email:"email",kpi_selected:"selecionados",pr_ph:"prioridade",st_ph:"site",st_none:"sem site",st_dead:"site morto",st_online:"online",f_tel:"tel",f_email:"email",f_owner:"proprietário",btn_clearsel:"Limpar",th_score:"Pontuação",th_company:"Empresa",th_activity:"Atividade",th_owner:"Proprietário",th_phone:"Tel",th_email:"Email",th_opportunity:"Oportunidade",th_place:"Local",empty_text:"Escolhe um nicho e uma cidade, depois Gerar.",set_places_h:"Google Places",set_places_p:"Opcional. Sem chave, o OpenStreetMap é grátis.",key_label:"Chave API",btn_save:"Guardar",btn_clear:"Apagar",set_jump_h:"Conta Join-Jump",set_jump_p:"Liga a tua conta para exportar leads como clientes.",email_label:"Email",pass_label:"Palavra-passe",btn_connect:"Ligar",set_cv_h:"cvcrush",set_cv_p:"ID único desta instalação.",appid_label:"App ID",btn_copy:"Copiar",m_connected:"Ligado",m_notconn:"Não ligado",m_clients:"cliente(s)"}
};
/* enum value translation (priority / site / approach / opportunity) */
var ENUM={
 en:{"Chaud":"Hot","Tiède":"Warm","Froid":"Cold","aucun site":"no site","hors ligne":"offline","réseau social":"social only","en ligne":"online","Téléphone":"Phone","Email":"Email","Prospection physique":"On-site visit","Création site":"Build a site","Création site (juste réseau social)":"Build a site (social only)","Site mort - refonte":"Dead site - rebuild","Refonte (pas responsive)":"Rebuild (not responsive)","Refonte (pas HTTPS)":"Rebuild (no HTTPS)","Site correct":"Decent site","déjà client":"already a client"},
 es:{"Chaud":"Caliente","Tiède":"Templado","Froid":"Frío","aucun site":"sin sitio","hors ligne":"fuera de línea","réseau social":"solo red social","en ligne":"en línea","Téléphone":"Teléfono","Email":"Email","Prospection physique":"Visita presencial","Création site":"Crear un sitio","Création site (juste réseau social)":"Crear un sitio (solo red social)","Site mort - refonte":"Sitio muerto - rehacer","Refonte (pas responsive)":"Rehacer (no responsive)","Refonte (pas HTTPS)":"Rehacer (sin HTTPS)","Site correct":"Sitio correcto","déjà client":"ya es cliente"},
 de:{"Chaud":"Heiß","Tiède":"Warm","Froid":"Kalt","aucun site":"keine Website","hors ligne":"offline","réseau social":"nur Social","en ligne":"online","Téléphone":"Telefon","Email":"E-Mail","Prospection physique":"Vor-Ort-Besuch","Création site":"Website erstellen","Création site (juste réseau social)":"Website erstellen (nur Social)","Site mort - refonte":"Tote Website - Neubau","Refonte (pas responsive)":"Neubau (nicht responsive)","Refonte (pas HTTPS)":"Neubau (kein HTTPS)","Site correct":"Website ok","déjà client":"bereits Kunde"},
 it:{"Chaud":"Caldo","Tiède":"Tiepido","Froid":"Freddo","aucun site":"nessun sito","hors ligne":"offline","réseau social":"solo social","en ligne":"online","Téléphone":"Telefono","Email":"Email","Prospection physique":"Visita in loco","Création site":"Creare un sito","Création site (juste réseau social)":"Creare un sito (solo social)","Site mort - refonte":"Sito morto - rifacimento","Refonte (pas responsive)":"Rifacimento (non responsive)","Refonte (pas HTTPS)":"Rifacimento (senza HTTPS)","Site correct":"Sito ok","déjà client":"già cliente"},
 pt:{"Chaud":"Quente","Tiède":"Morno","Froid":"Frio","aucun site":"sem site","hors ligne":"offline","réseau social":"só rede social","en ligne":"online","Téléphone":"Telefone","Email":"Email","Prospection physique":"Visita presencial","Création site":"Criar um site","Création site (juste réseau social)":"Criar um site (só rede social)","Site mort - refonte":"Site morto - refazer","Refonte (pas responsive)":"Refazer (não responsivo)","Refonte (pas HTTPS)":"Refazer (sem HTTPS)","Site correct":"Site ok","déjà client":"já é cliente"}
};
function t(k){var l=I18N[LANG]||I18N.fr;return l[k]!=null?l[k]:(I18N.fr[k]||k)}
function tr(v){ if(!v)return v; if(LANG==="fr")return v; var m=ENUM[LANG]; if(m&&m[v]!=null)return m[v];
  if(m&&/^Refonte \\(builder/.test(v)){ var word=(m["Site mort - refonte"]||"").split(" ")[0]||v; return v.replace("Refonte",word.replace(/[^A-Za-zÀ-ÿ]/g,"")||"Refonte"); }
  if(m&&/^en ligne \\(/.test(v))return (m["en ligne"]||"online")+v.slice(8); return v; }
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(function(e){e.textContent=t(e.getAttribute("data-i18n"))});
  document.querySelectorAll("[data-ph]").forEach(function(e){e.setAttribute("placeholder",t(e.getAttribute("data-ph")))});
  document.documentElement.lang=LANG;
}
function setLang(l){LANG=l;try{localStorage.setItem("lj_lang",l)}catch(e){}applyI18n();loadCfg();render();if(el("v-jump").classList.contains("on"))jumpState();}
el("lang").onchange=function(){setLang(this.value)};

/* ---- mobile drawer ---- */
function drawer(o){el("side").classList.toggle("open",o);el("sideScrim").classList.toggle("on",o)}
el("burger").onclick=function(){drawer(!el("side").classList.contains("open"))};
el("sideScrim").onclick=function(){drawer(false)};

/* ---- nav ---- */
Array.prototype.forEach.call(document.querySelectorAll(".nav a"),function(a){a.onclick=function(){
  document.querySelectorAll(".nav a").forEach(function(x){x.classList.remove("active")});a.classList.add("active");
  var v=a.getAttribute("data-view");document.querySelectorAll(".view").forEach(function(s){s.classList.remove("on")});el("v-"+v).classList.add("on");
  drawer(false); if(v==="jump")jumpState();
}});

/* ---- config ---- */
function loadCfg(){
  fetch("/api/config").then(function(r){return r.json()}).then(function(c){
    CFG=c;var ks=el("keyStat");
    if(c.hasPlacesKey){ks.textContent="\\u2713 "+c.keyHint;ks.className="ok m0";el("optPlaces").textContent="Google Places \\u2713"}
    else{ks.textContent=t("set_places_p");ks.className="mut m0"}
    var d=c.defaults||{};
    if(d.city&&!nm("city").value)nm("city").value=d.city;
    if(d.region&&!nm("region").value)nm("region").value=d.region;
    if(d.country&&!nm("country").value)nm("country").value=d.country;
    if(d.source)nm("source").value=d.source;
    var j=c.jump||{};
    el("jStat").innerHTML=j.configured?('<span class="ok">'+t("m_connected")+(j.email?" ("+esc(j.email)+")":"")+'</span>'):('<span class="mut">'+t("m_notconn")+'</span>');
    if(j.email&&!el("jEmail").value)el("jEmail").value=j.email;
    if(c.cvcrush&&c.cvcrush.appId)el("cvId").value=c.cvcrush.appId;
  }).catch(function(){});
}
el("saveKey").onclick=function(){fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":el("key").value.trim()})}).then(function(r){return r.json()}).then(function(){el("key").value="";loadCfg()})};
el("clearKey").onclick=function(){fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"places-key":""})}).then(function(r){return r.json()}).then(function(){el("key").value="";loadCfg()})};
el("jSave").onclick=function(){el("jStat").textContent="...";
  fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({"jump-email":el("jEmail").value.trim(),"jump-password":el("jPass").value})})
   .then(function(r){return r.json()}).then(function(){el("jPass").value="";return fetch("/api/joinjump/test",{method:"POST"})}).then(function(r){return r.json()})
   .then(function(x){el("jStat").innerHTML=x.ok?('<span class="ok">'+t("m_connected")+" \\u2713 "+x.count+" "+t("m_clients")+'</span>'):('<span class="bad">'+esc(x.error||"")+'</span>');loadCfg()})
   .catch(function(e){el("jStat").innerHTML='<span class="bad">'+esc(e.message)+'</span>'})};
el("cvCopy").onclick=function(){el("cvId").select();try{document.execCommand("copy")}catch(e){}};

/* ---- table + selection ---- */
function viewRows(){
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
function selectedLeads(){var s=DATA.filter(function(r){return SEL[keyOf(r)]});return s.length?s:viewRows()}
function render(){
  var rows=viewRows();
  el("cnt").textContent=rows.length+" / "+DATA.length;
  el("empty").style.display=DATA.length?"none":"block";
  el("sTotal").textContent=DATA.length;
  el("sHot").textContent=DATA.filter(function(r){return r.priority==="Chaud"}).length;
  el("sTel").textContent=DATA.filter(function(r){return r.phone}).length;
  el("sMail").textContent=DATA.filter(function(r){return r.email}).length;
  el("sSel").textContent=Object.keys(SEL).length;
  el("tb").innerHTML=rows.map(function(r){
    var ti=tier(r.score),k=keyOf(r),on=SEL[k]?" checked":"",selc=SEL[k]?" class=sel":"";
    var already=r.__already?'<span class="tag">'+tr("déjà client")+'</span>':"";
    return '<tr'+selc+' data-k="'+esc(k)+'"><td><input type="checkbox" class="rowsel"'+on+'></td>'
      +'<td><span class="sc '+ti+' mono">'+r.score+'</span></td>'
      +'<td><span class="name">'+esc(r.name)+'</span>'+already+((r.legal&&r.legal.toLowerCase()!==String(r.name).toLowerCase())?'<div class="mut">'+esc(r.legal)+'</div>':'')+'</td>'
      +'<td>'+esc(r.activity)+(r.size?'<div class="mut">'+esc(r.size)+(r.created?" \\u00b7 "+esc(r.created):"")+'</div>':'')+'</td>'
      +'<td>'+(r.owner?'<span class="name">'+esc(r.owner)+'</span><div class="mut">'+esc(r.role)+'</div>':'<span class="mut">\\u2014</span>')+'</td>'
      +'<td>'+tel(r.phone)+'</td><td>'+mail(r.email)+'</td>'
      +'<td><span class="pill">'+esc(tr(r.opportunity))+'</span></td>'
      +'<td class="mut">'+esc(r.location)+'</td></tr>';
  }).join("");
  Array.prototype.forEach.call(document.querySelectorAll("#tb tr"),function(tr2){var k=tr2.getAttribute("data-k");tr2.querySelector(".rowsel").onclick=function(e){e.stopPropagation();if(this.checked)SEL[k]=1;else delete SEL[k];render()}});
  el("selAll").checked=rows.length>0&&rows.every(function(r){return SEL[keyOf(r)]});
}
el("selAll").onclick=function(){var rows=viewRows();if(this.checked)rows.forEach(function(r){SEL[keyOf(r)]=1});else rows.forEach(function(r){delete SEL[keyOf(r)]});render()};
el("selClear").onclick=function(){SEL={};render()};
el("selTopBtn").onclick=function(e){if(e.target.id==="topN")return;var n=Number(el("topN").value)||20;SEL={};viewRows().slice(0,n).forEach(function(r){SEL[keyOf(r)]=1});render()};
Array.prototype.forEach.call(document.querySelectorAll("thead th[data-k]"),function(th){th.onclick=function(){var k=th.getAttribute("data-k");sd=(sk===k)?-sd:(k==="score"?-1:1);sk=k;render()}});
["q","pr","st","fp","fe","fo"].forEach(function(i){el(i).addEventListener("input",render)});

/* ---- search ---- */
function run(){
  var body={source:nm("source").value,term:nm("term").value,city:nm("city").value,region:nm("region").value,country:nm("country").value,limit:Number(nm("limit").value)||30,category:nm("category").value,owner:nm("owner").checked,audit:nm("audit").checked};
  DATA=[];SEL={};render();el("go").disabled=true;el("prog").style.width="3%";el("statusLine").textContent="...";
  var total=0;
  fetch("/api/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(res){
    var rd=res.body.getReader(),dec=new TextDecoder(),buf="";
    function pump(){return rd.read().then(function(x){
      if(x.done){fin();return}
      buf+=dec.decode(x.value,{stream:true});var ls=buf.split("\\n");buf=ls.pop();
      ls.forEach(function(ln){if(!ln.trim())return;var m;try{m=JSON.parse(ln)}catch(e){return}
        if(m.t==="meta")total=m.total;
        else if(m.t==="lead"){DATA.push(m.lead);if(DATA.length%2===0)render();el("prog").style.width=Math.min(98,DATA.length/(total||1)*100)+"%";el("statusLine").textContent=DATA.length+(total?" / "+total:"")}
        else if(m.t==="error")el("statusLine").textContent="Erreur: "+m.message;
      });return pump();
    })}
    return pump();
  }).catch(function(e){el("statusLine").textContent="Erreur: "+e.message;fin()});
  function fin(){el("go").disabled=false;el("prog").style.width="100%";render();setTimeout(function(){el("prog").style.width="0"},700)}
}
el("go").onclick=run;

/* ---- file export ---- */
function download(name,text,type){var b=new Blob([text],{type:type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function csvCell(v){v=(v==null?"":String(v));return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCsv(rows){var h=COLS.join(",");var b=rows.map(function(r){return COLS.map(function(c){return csvCell(r[c])}).join(",")}).join("\\n");return h+"\\n"+b}
Array.prototype.forEach.call(document.querySelectorAll(".exp"),function(btn){btn.onclick=function(){
  var rows=selectedLeads();if(!rows.length){el("statusLine").textContent="-";return}
  var f=btn.getAttribute("data-f"),st=new Date().toISOString().slice(0,10);
  if(f==="json")download("leads-"+st+".json",JSON.stringify(rows,null,2),"application/json");
  else if(f==="csv")download("leads-"+st+".csv",toCsv(rows),"text/csv");
  else if(f==="html")download("leads-"+st+".html",exportHtml(rows),"text/html");
}});
function exportHtml(rows){var th="<tr><th>Score</th><th>"+t("th_company")+"</th><th>"+t("th_activity")+"</th><th>"+t("th_owner")+"</th><th>"+t("th_phone")+"</th><th>Email</th><th>"+t("th_opportunity")+"</th><th>"+t("th_place")+"</th></tr>";var tr2=rows.map(function(r){return "<tr><td>"+r.score+"</td><td>"+esc(r.name)+"</td><td>"+esc(r.activity)+"</td><td>"+esc(r.owner)+" "+esc(r.role)+"</td><td>"+esc(r.phone)+"</td><td>"+esc(r.email)+"</td><td>"+esc(tr(r.opportunity))+"</td><td>"+esc(r.location)+"</td></tr>"}).join("");return "<!doctype html><meta charset=utf-8><title>leads</title><style>body{font:13px sans-serif;margin:20px;background:#0b0c0e;color:#eceef1}table{border-collapse:collapse;width:100%}th,td{border:1px solid #23262d;padding:7px;text-align:left}th{background:#131418}</style><table>"+th+tr2+"</table>"}

/* ---- modal ---- */
function modal(html){el("modal").innerHTML=html;el("scrim").classList.add("on")}
function closeModal(){el("scrim").classList.remove("on")}
el("scrim").onclick=function(e){if(e.target===el("scrim"))closeModal()};

/* ---- Join-Jump ---- */
function jumpState(){fetch("/api/config").then(function(r){return r.json()}).then(function(c){var j=c.jump||{};el("jjState").innerHTML=j.configured?('<span class="ok">\\u25cf '+t("m_connected")+(j.email?" ("+esc(j.email)+")":"")+'</span>'):('<span class="bad">\\u25cf '+t("m_notconn")+'</span>')})}
el("jjExport").onclick=function(){
  var rows=selectedLeads();
  if(!rows.length){modal('<div class="big">'+t("empty_text")+'</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>');return}
  modal('<h3>Join-Jump</h3><div class="big">...</div>');
  fetch("/api/joinjump/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({leads:rows,confirm:false})}).then(function(r){return r.json()}).then(function(p){
    if(p.error){modal('<h3>Join-Jump</h3><div class="big bad">'+esc(p.error)+'</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>');return}
    var already={};(p.skipped||[]).forEach(function(s){already[s.name]=1});DATA.forEach(function(r){if(already[r.name])r.__already=1});render();
    modal('<h3>Join-Jump</h3><div class="big"><b class="ok">'+p.toCreate+'</b> + <b>'+p.alreadyClients+'</b> '+tr("déjà client")+'</div><div class="foot"><button class="btn" onclick="closeModal()">Annuler</button><button class="btn red" id="jjConfirm">OK ('+p.toCreate+')</button></div>');
    if(p.toCreate>0)el("jjConfirm").onclick=function(){doExport(rows)};else el("jjConfirm").disabled=true;
  }).catch(function(e){modal('<div class="big bad">'+esc(e.message)+'</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>')});
};
function doExport(rows){modal('<h3>...</h3><div class="big">...</div>');
  fetch("/api/joinjump/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({leads:rows,confirm:true})}).then(function(r){return r.json()}).then(function(o){
    if(o.error){modal('<div class="big bad">'+esc(o.error)+'</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>');return}
    var lines=(o.created||[]).map(function(x){return '<div class="ok">\\u2713 '+esc(x.name)+'</div>'}).join("")+(o.errors||[]).map(function(x){return '<div class="bad">\\u2717 '+esc(x.name)+' \\u2014 '+esc(x.message||"")+'</div>'}).join("");
    modal('<h3>\\u2713</h3><div class="big"><b class="ok">'+(o.created||[]).length+'</b>'+((o.errors||[]).length?' / <b class="bad">'+o.errors.length+'</b>':'')+'</div><div class="res">'+lines+'</div><div class="foot"><button class="btn red" onclick="closeModal()">OK</button></div>');
  }).catch(function(e){modal('<div class="big bad">'+esc(e.message)+'</div><div class="foot"><button class="btn" onclick="closeModal()">OK</button></div>')});
}

/* ---- cvcrush ---- */
function cvBase(kind){var id=(CFG.cvcrush&&CFG.cvcrush.appId)||"";var redir=encodeURIComponent(location.origin+"/cvcrush/callback");return "https://cvcrush.co/"+kind+"?app=leadjet&app_id="+encodeURIComponent(id)+"&redirect_uri="+redir}
el("cvUse").onclick=function(){window.open(cvBase("connect"),"_blank")};
el("cvExport").onclick=function(){
  var rows=selectedLeads();if(!rows.length){el("statusLine").textContent="-";return}
  var b64=btoa(unescape(encodeURIComponent(toCsv(rows))));
  var url=cvBase("import")+"&count="+rows.length+"&format=csv&data="+encodeURIComponent(b64);
  if(url.length>60000)url=cvBase("import")+"&count="+rows.length+"&format=csv&file="+encodeURIComponent("data:text/csv;base64,"+b64);
  window.open(url,"_blank");
};

/* ---- init ---- */
try{var sv=localStorage.getItem("lj_lang");if(sv&&I18N[sv])LANG=sv;else{var nv=(navigator.language||"en").slice(0,2);LANG=I18N[nv]?nv:"en"}}catch(e){}
el("lang").value=LANG;applyI18n();loadCfg();render();
`;
