/** The single-page web UI served by `leadjet serve`. Self-contained, no deps. */
export const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>leadjet</title>
<style>
:root{--bg:#faf8f5;--card:#fff;--ink:#2b2622;--mut:#8a817a;--line:#e9ded2;--acc:#b5622f;--acc2:#9c5228}
*{box-sizing:border-box}body{margin:0;font:13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{padding:14px 20px;border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0;z-index:9}
.brand{font-size:18px;font-weight:700;letter-spacing:-.02em}.brand span{color:var(--acc)}
.form{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px}
input,select{padding:7px 10px;border:1px solid var(--line);border-radius:7px;font-size:12px;background:#fff;color:var(--ink)}
input:focus,select:focus{outline:none;border-color:var(--acc)}
.form input[name=term]{min-width:180px}
label.c{display:flex;gap:5px;align-items:center;font-size:12px;cursor:pointer;user-select:none;color:var(--ink)}
button{padding:8px 16px;border:0;border-radius:7px;background:var(--acc);color:#fff;font-size:13px;font-weight:600;cursor:pointer}
button:hover{background:var(--acc2)}button:disabled{opacity:.5;cursor:default}
.bar{height:3px;background:var(--line);border-radius:2px;overflow:hidden;margin-top:10px}
.bar > i{display:block;height:100%;width:0;background:var(--acc);transition:width .2s}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px 20px;border-bottom:1px solid var(--line);background:#fdfbf8;position:sticky;top:104px;z-index:8}
.toolbar .count{margin-left:auto;color:var(--mut);font-weight:600;white-space:nowrap}
.exp{background:#efe6da;color:var(--ink);padding:6px 11px;font-weight:600}.exp:hover{background:#e6d9c8}
.wrap{padding:0 20px 60px;overflow-x:auto}
table{width:100%;border-collapse:collapse;margin-top:8px;background:var(--card);border:1px solid var(--line);border-radius:9px;overflow:hidden}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#f4ede4;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--mut);cursor:pointer;white-space:nowrap}
th:hover{color:var(--acc)}tr:last-child td{border-bottom:0}tr:hover td{background:#fcf9f5}
.owner{font-weight:600}.mut{color:var(--mut);font-size:11px}
.sc{font-weight:700;font-variant-numeric:tabular-nums;padding:2px 8px;border-radius:6px;display:inline-block;min-width:30px;text-align:center}
.hot{background:#fde3dc;color:#b23a1e}.warm{background:#fdf0d8;color:#8a5a12}.cold{background:#e9edf0;color:#5a6b76}
.pill{display:inline-block;padding:2px 7px;border-radius:20px;font-size:10.5px;white-space:nowrap;background:#f0e7db;color:#6a5a48}
.ph{font-variant-numeric:tabular-nums;white-space:nowrap}a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
.empty{padding:60px 20px;text-align:center;color:var(--mut)}
</style></head><body>
<header>
<div class="brand">lead<span>jet</span></div>
<div class="form">
<input name="term" placeholder="niche (ex: restaurants, plombiers)" value="restaurants">
<select name="source"><option value="osm">OpenStreetMap (gratuit)</option><option value="places">Google Places (clé)</option></select>
<input name="city" placeholder="ville" value="Lyon">
<input name="region" placeholder="région" value="">
<input name="country" placeholder="pays" value="France" style="width:90px">
<input name="limit" type="number" value="30" min="1" max="200" style="width:70px" title="nombre de leads">
<label class="c"><input type="checkbox" name="owner" checked> propriétaire</label>
<label class="c"><input type="checkbox" name="audit" checked> audit site</label>
<button id="go">Générer</button>
</div>
<div class="bar"><i id="prog"></i></div>
</header>
<div class="toolbar">
<input id="q" placeholder="filtrer..." style="min-width:180px">
<select id="pr"><option value="">Priorité</option><option>Chaud</option><option>Tiède</option><option>Froid</option></select>
<select id="st"><option value="">Site</option><option value="aucun">Sans site</option><option value="hors">Site mort</option><option value="en">En ligne</option></select>
<label class="c"><input type="checkbox" id="fp"> Tél</label>
<label class="c"><input type="checkbox" id="fe"> Email</label>
<label class="c"><input type="checkbox" id="fo"> Propriétaire</label>
<button class="exp" data-f="csv">CSV</button>
<button class="exp" data-f="json">JSON</button>
<button class="exp" data-f="html">HTML</button>
<span class="count" id="cnt">0 / 0</span>
</div>
<div class="wrap"><table><thead><tr>
<th data-k="score">Score</th><th data-k="name">Entreprise</th><th data-k="activity">Activité</th><th data-k="owner">Propriétaire</th><th data-k="phone">Tél</th><th data-k="email">Email</th><th data-k="opportunity">Opportunité</th><th data-k="location">Lieu</th><th data-k="siteStatus">Site</th>
</tr></thead><tbody id="tb"></tbody></table>
<div class="empty" id="empty">Choisis une niche et une ville, puis clique sur Générer.</div>
</div>
<script src="/app.js"></script>
</body></html>`;

/** Browser logic, served at /app.js (kept out of the HTML to dodge escaping). */
export const APP_JS = `
var DATA = [], sk = "score", sd = -1;
function el(i){ return document.getElementById(i); }
function esc(s){ return (s==null?"":String(s)).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]}); }
function tel(p){ return p ? '<a class="ph" href="tel:'+String(p).replace(/\\s/g,"")+'">'+esc(p)+'</a>' : ""; }
function mail(e){ return e ? '<a href="mailto:'+esc(e)+'">'+esc(e)+'</a>' : ""; }
function scls(s){ return s>=70?"hot":s>=45?"warm":"cold"; }
var COLS = ["name","legal","activity","owner","role","phone","email","score","priority","opportunity","approach","location","regCity","regCp","website","siteStatus","naf","legalForm","created","size","siren","confidence","source"];

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
  el("tb").innerHTML=rows.map(function(r){
    return '<tr><td><span class="sc '+scls(r.score)+'">'+r.score+'</span></td>'
      +'<td><strong>'+esc(r.name)+'</strong>'+((r.legal&&r.legal.toLowerCase()!==String(r.name).toLowerCase())?'<div class="mut">'+esc(r.legal)+'</div>':'')+'</td>'
      +'<td>'+esc(r.activity)+(r.size?'<div class="mut">'+esc(r.size)+(r.created?" \\u00b7 "+esc(r.created):"")+'</div>':'')+'</td>'
      +'<td>'+(r.owner?'<span class="owner">'+esc(r.owner)+'</span><div class="mut">'+esc(r.role)+'</div>':'<span class="mut">\\u2014</span>')+'</td>'
      +'<td>'+tel(r.phone)+'</td><td>'+mail(r.email)+'</td>'
      +'<td><span class="pill">'+esc(r.opportunity)+'</span></td>'
      +'<td class="mut">'+esc(r.location)+'</td><td class="mut">'+esc(r.siteStatus)+'</td></tr>';
  }).join("");
}
Array.prototype.forEach.call(document.querySelectorAll("th"),function(th){
  th.onclick=function(){ var k=th.getAttribute("data-k"); sd=(sk===k)?-sd:(k==="score"?-1:1); sk=k; render(); };
});
["q","pr","st","fp","fe","fo"].forEach(function(i){ el(i).addEventListener("input",render); });

function run(){
  var body={
    source: document.querySelector("[name=source]").value,
    term: document.querySelector("[name=term]").value,
    city: document.querySelector("[name=city]").value,
    region: document.querySelector("[name=region]").value,
    country: document.querySelector("[name=country]").value,
    limit: Number(document.querySelector("[name=limit]").value)||30,
    owner: document.querySelector("[name=owner]").checked,
    audit: document.querySelector("[name=audit]").checked
  };
  DATA=[]; render(); el("go").disabled=true; el("go").textContent="..."; el("prog").style.width="2%";
  fetch("/api/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(res){
    var reader=res.body.getReader(), dec=new TextDecoder(), buf="";
    function pump(){ return reader.read().then(function(x){
      if(x.done){ finish(); return; }
      buf+=dec.decode(x.value,{stream:true});
      var lines=buf.split("\\n"); buf=lines.pop();
      lines.forEach(function(ln){ if(!ln.trim())return; var m; try{m=JSON.parse(ln)}catch(e){return;}
        if(m.t==="meta"){ el("prog").dataset.total=m.total; }
        else if(m.t==="lead"){ DATA.push(m.lead); if(DATA.length%3===0)render(); var tot=Number(el("prog").dataset.total)||m.total||1; el("prog").style.width=Math.min(98,DATA.length/tot*100)+"%"; }
        else if(m.t==="error"){ alert("Erreur: "+m.message); }
      });
      return pump();
    }); }
    return pump();
  }).catch(function(e){ alert("Erreur reseau: "+e.message); }).finally(function(){});
  function finish(){ el("go").disabled=false; el("go").textContent="Générer"; el("prog").style.width="100%"; render(); setTimeout(function(){el("prog").style.width="0"},600); }
}
el("go").onclick=run;

function download(name,text,type){ var b=new Blob([text],{type:type}); var u=URL.createObjectURL(b); var a=document.createElement("a"); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); }
function csvCell(v){ v=(v==null?"":String(v)); return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
Array.prototype.forEach.call(document.querySelectorAll(".exp"),function(btn){
  btn.onclick=function(){
    var rows=view(); if(!rows.length){ alert("Rien a exporter"); return; }
    var f=btn.getAttribute("data-f"), stamp=new Date().toISOString().slice(0,10);
    if(f==="json"){ download("leads-"+stamp+".json",JSON.stringify(rows,null,2),"application/json"); }
    else if(f==="csv"){ var head=COLS.join(","); var body=rows.map(function(r){return COLS.map(function(c){return csvCell(r[c])}).join(",")}).join("\\n"); download("leads-"+stamp+".csv",head+"\\n"+body,"text/csv"); }
    else if(f==="html"){ download("leads-"+stamp+".html",exportHtml(rows),"text/html"); }
  };
});
function exportHtml(rows){
  var th="<tr><th>Score</th><th>Entreprise</th><th>Activite</th><th>Proprietaire</th><th>Tel</th><th>Email</th><th>Opportunite</th><th>Lieu</th><th>Site</th></tr>";
  var tr=rows.map(function(r){ return "<tr><td>"+r.score+"</td><td>"+esc(r.name)+"</td><td>"+esc(r.activity)+"</td><td>"+esc(r.owner)+" "+esc(r.role)+"</td><td>"+esc(r.phone)+"</td><td>"+esc(r.email)+"</td><td>"+esc(r.opportunity)+"</td><td>"+esc(r.location)+"</td><td>"+esc(r.siteStatus)+"</td></tr>"; }).join("");
  return "<!doctype html><meta charset=utf-8><title>leads</title><style>body{font:13px sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#f4ede4}</style><table>"+th+tr+"</table>";
}
render();
`;
