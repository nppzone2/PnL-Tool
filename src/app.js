// ---- Phân quyền (ROLE do trang đăng nhập gán: "admin" | "npp")
const ROLE=window.__ROLE||"npp",IS_ADMIN=ROLE==="admin",NPP_TABS=["pl","price","ops"];
const tabOk=t=>IS_ADMIN||NPP_TABS.includes(t);
const GIS_SKUS=[["BVC","Bia Viet Can 24s (330)"],["BVP","Bia Viet Bottle 20s (355)"],["H025","Heineken 0.0 MalBev Sleek Can 4x6s (250)"],["HP","Heineken Bottle 24s (330)"],["HS","Heineken Sleek Can 24s (330)"],["HS2","Heineken Silver Sleek Can 24s (250)"],["HSB","Heineken Silver Bottle 24s (330)"],["HSC","Heineken Silver Sleek Can 24s (330)"],["HSD","Heineken Silver Draught Keg (20L)"],["SB6","Strongbow Berries Sleek Can 4x6s (320)"],["SD6","SB Dark Fruit Sleek Can 4x6s (320)"],["SM32","Strongbow Mixed Sleek Can 24s (320)"],["TC25","Tiger Sleek Can 24s (250)"],["TCS","Tiger Sleek Can 24s (330)"],["TD","Tiger Draught Keg (20L)"],["TMC","Tiger Smooth Can 24s (330)"],["TP","Tiger Bottle 24s (330)"],["TS","Tiger Crystal Bottle 24s (330)"],["TS25","Tiger Crystal Sleek Can 24s (250)"],["TSS","Tiger Crystal Sleek Can 24s (330)"]];
const EXTRA_NAMES={HA12:"Heineken Silver 12 chai nhôm 330",LC:"Larue thùng 24 lon 330",BIX:"Bivina Export thùng 24 lon 330",SG6:"SB táo khay 4x6 lon 320",SPB:"SB Dứa Lựu thùng 24 chai 330"};
const SKU_NAME=Object.assign({},EXTRA_NAMES,Object.fromEntries(GIS_SKUS));
const ON_FORM=new Set(GIS_SKUS.map(s=>s[0]));
const DEFAULT_CHAN={"Grocery Store":"OFF","Sub Distributor":"SDIS","Wholesaler":"OFF","Quan Nhau Mainstream":"ON","Grocery Store - Home Delivery":"OFF","Beverage Retail Store":"OFF","Group Social":"ON","Quan Nhau Top":"ON","Quan An":"ON","Quan Nhau Economy":"ON","Food Caterer":"ON","Independent Minimart":"OFF","Beer Café":"OFF","Quan Nhau":"ON"};
const CH=["SDIS","OFF","ON"];
const OPS=[["depTruck","Depreciation truck/3 wheels","Khấu hao xe tải, 3 bánh","tr"],["depFork","Depreciation Forklift","Khấu hao xe nâng","wh"],["depTools","Depreciation/Tools","Khấu hao thiết bị văn phòng","mg"],["petro","Transport Petro fees (truck)","Phí xăng dầu xe tải, 3 bánh","tr"],["bike","Transport fees (Bike)","Phí giao hàng xe máy","tr"],["trOther","Transporation other fee","Chi phí khác cho giao hàng","tr"],["hireWh","Hiring Warehouse","Thuê kho (m² × chi phí/m²)","wh"],["driver","Delivery & Driver","Tài xế & giao hàng (Qty = số người, VND = tổng tiền)","tr"],["whKeeper","WH Keeper, FLT driver & Accountant","Thủ kho, tài xế FL, kế toán","mg"],["dsm","DSM cost","Nhân viên DSM","mg"],["mgmt","Management cost","Nhân viên quản lý","mg"],["office","Office expenses","Điện / nước / văn phòng phẩm","mg"],["otherFee","Other fees","Chi phí phát sinh, giao tế…","mg"]];
const MKS=[["mkWs","Wholesales","Chiết khấu khách hàng sỉ","mk"],["mkRt","Retailers","Chiết khấu khách hàng lẻ","mk"],["mkOt","Others","CK bán hàng khác / chương trình","mk"],["capInt","Interest expenses","Lãi vay (số tiền & % lãi suất/tháng)","cap"],["capBad","Bad debt provision","Dự phòng nợ xấu","cap"],["capOt","Others","Chi phí vốn khác","cap"]];
const OIS=[["cdAmt","CD Amount","Hệ thống HVN","Detail"],["cdInt","CD Interest","Hệ thống HVN","Detail"],["dip","DIP Amount","Hệ thống HVN","Detail"],["oiOther","Other (Increase price/Promotion)","Thu nhập từ tăng giá, KM","GIS"],["cit","Income Tax (CIT) %","Thuế thu nhập DN","GIS"]];
const ICS=[["curAcc","Current account","Tài khoản thanh toán","GIS"],["credit","Credit for Outlets","Công nợ thị trường","GIS"],["fixed","Remaining value fixed assets","Giá trị TS còn lại theo tỉ trọng","Detail"],["inv","Inventory","Tồn kho","Detail"],["cdHold","CD hold","Hệ thống HVN","Detail"],["deposit","Cash deposit & DMF","Hệ thống HVN","Detail"]];
const GRP={wh:"Warehouse",tr:"Transportation",mg:"Management",mk:"Market investment",cap:"Capital cost"};
const GRPKEYS={wh:["hireWh","depFork"],tr:["depTruck","petro","bike","trOther","driver"],mg:["whKeeper","dsm","mgmt","office","otherFee","depTools"],mk:["mkWs","mkRt","mkOt"],cap:["capInt","capBad","capOt"]};

const $=s=>document.querySelector(s);
const fmt=(n,d=0)=>(n!=null&&isFinite(n))?n.toLocaleString("vi-VN",{maximumFractionDigits:d,minimumFractionDigits:d}):"–";
const inp=(id,ph)=>`<input class="v" id="${id}" inputmode="decimal"${ph?` placeholder="${ph}"`:""}>`;
const mLbl=m=>"T"+(+m.slice(5))+"/"+m.slice(0,4);
const addM=(m,k)=>{let y=+m.slice(0,4),mo=+m.slice(5)+k;while(mo<1){mo+=12;y--}while(mo>12){mo-=12;y++}return y+"-"+String(mo).padStart(2,"0")};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LS={get(k,d){try{const v=localStorage.getItem("npppl:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("npppl:"+k,JSON.stringify(v))}catch(e){}}};

// ---- state
const S={tmsSum:LS.get("tmsSum",{}),fuel:LS.get("fuel",{}),fuelW:LS.get("fuelW",50),soSum:LS.get("soSum",{}),si:LS.get("si",null)||SI_DEFAULT,so:LS.get("so",null)||SO_DEFAULT,gis:LS.get("gis",{file:null,prices:{}}),chan:LS.get("chan",null)||{...DEFAULT_CHAN},prices:LS.get("prices",{})};

// ---- benchmarks (closed months only)
const gsum=(m,g)=>GRPKEYS[g].reduce((a,k)=>a+(m[k]||0),0);
function agg(list){const V=list.reduce((a,m)=>a+m.vol,0),s=k=>list.reduce((a,m)=>a+m[k],0);
  const o={V,pat:s("pat")/V,gc:(s("rev")-s("cogs")-s("disc"))/V,oi:(s("cdAmt")+s("cdInt")+s("dip")+s("oiOther"))/V,roi:list.reduce((a,m)=>a+m.roi,0)/list.length*100,patPct:s("pat")/s("rev")*100};
  for(const g in GRPKEYS)o[g]=list.reduce((a,m)=>a+gsum(m,g),0)/V;o.opex=o.wh+o.tr+o.mg+o.mk+o.cap;return o}
const closed=n=>Object.entries(n.months).filter(([k,m])=>!m.open);
const BM=agg(NPP.flatMap(n=>closed(n).map(e=>e[1])));
NPP.forEach(n=>{n.avg=agg(closed(n).map(e=>e[1]));const c=closed(n).sort((a,b)=>a[0]<b[0]?1:-1)[0][1];n.lastSell=c.rev/c.vol});

const daysIn=m=>new Date(+m.slice(0,4),+m.slice(5),0).getDate();
NPP.forEach(n=>{const c=closed(n).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,3);n.credHist=c.map(([k,m])=>[k,m.credit/(m.rev/daysIn(k))]).reverse();n.credDays=n.credHist.reduce((a,x)=>a+x[1],0)/n.credHist.length;
  const [lk,lm]=c[0];n.curCheck={m:lk,act:lm.curAcc,est:lm.rev/26*1.5}});
const GRP_CRED=NPP.reduce((a,n)=>a+n.credDays,0)/NPP.length;
// ---- helpers
const cur=()=>NPP[+$("#selNpp").value];
const mon=()=>$("#selMon").value;
const parseNum=v=>{if(typeof v==="number")return v;let s=String(v??"").replace(/[^\d.,-]/g,"");if(!s)return 0;
  if(/^-?\d{1,3}([.,]\d{3})+$/.test(s))s=s.replace(/[.,]/g,"");else if(s.includes(",")&&s.includes("."))s=s.lastIndexOf(",")>s.lastIndexOf(".")?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");else s=s.replace(",",".");
  const n=parseFloat(s);return isFinite(n)?n:0};
const parse=s=>{s=String(s??"").replace(/\s/g,"").replace(/\./g,"").replace(",",".");const n=parseFloat(s);return isFinite(n)?n:0};
const isBlank=id=>{const el=$("#"+id);return !el||el.value.trim()===""};
const set=(id,n)=>{const el=$("#"+id);if(el)el.value=(n===""||n==null||!isFinite(n))?"":fmt(n,Math.abs(n%1)>1e-9?2:0)};
const val=id=>{const el=$("#"+id);if(!el)return 0;if(el.value.trim()===""&&el.dataset.ref)return parse(el.dataset.ref);return parse(el.value)};
document.addEventListener("focusout",e=>{const el=e.target;if(el.id&&el.matches&&el.matches("input.v[inputmode]")&&el.value.trim()!=="")set(el.id,parse(el.value))});
document.addEventListener("focusin",e=>{if(e.target.matches&&e.target.matches("input.v"))e.target.select()});

// SO volume by sku × channel for current NPP & month
function soFor(dis,m){
  if(!S.so||S.so.month!==m)return null;const d=S.so.data[dis];if(!d)return {};
  const out={};for(const sku in d){const r=out[sku]={SDIS:0,OFF:0,ON:0,NA:0};for(const t in d[sku]){const c=S.chan[t];r[c&&CH.includes(c)?c:"NA"]+=d[sku][t]}}
  return out}
// reference prices: collected prices of earlier months first, then GIS input (pnl-month keyed)
function refPrice(dis,m,sku){
  for(let k=1;k<=3;k++){const mm=addM(m,-k),c=(S.prices[dis+"|"+mm]||{})[sku];
    if(c&&(c.SDIS||c.OFF||c.ON))return {SDIS:c.SDIS||null,OFF:c.OFF||null,ON:c.ON||null,lag:k,month:mm,src:"Collect"};
    const g=((S.gis.prices[dis]||{})[mm]||{})[sku];if(g)return {SDIS:g.ws||null,OFF:g.rt||null,ON:g.rt||null,lag:k,month:mm,src:"GIS"}}
  return null}
const pkey=()=>cur().id+"|"+mon();
function typed(sku,ch){const p=S.prices[pkey()];return p&&p[sku]&&p[sku][ch]?p[sku][ch]:null}
function effPrice(sku,ch){const t=typed(sku,ch);if(t)return {v:t,src:"input"};
  const r=refPrice(cur().id,mon(),sku);if(r&&r[ch])return {v:r[ch],src:"ref"}
  return {v:cur().lastSell,src:"avg"}}
function skuList(so,all){const set=new Set();if(so)Object.keys(so).forEach(k=>set.add(k));if(all)GIS_SKUS.forEach(s=>set.add(s[0]));
  const order=GIS_SKUS.map(s=>s[0]);return [...set].sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib)||a.localeCompare(b)})}
const soSkus=so=>skuList(so,false).filter(k=>{const r=so[k];return r.SDIS+r.OFF+r.ON+r.NA>0});
function retailBlend(sku,so){const r=so&&so[sku]||{OFF:0,ON:0};let wo=r.OFF,wn=r.ON;
  if(wo+wn<=0){wo=0;wn=0;for(const k in so||{}){wo+=so[k].OFF;wn+=so[k].ON}}
  const off=typed(sku,"OFF"),on=typed(sku,"ON");if(!off&&!on)return {v:null,share:wo+wn?wo/(wo+wn):NaN};
  if(off&&!on)return {v:off,share:1};if(on&&!off)return {v:on,share:0};
  const sh=wo+wn?wo/(wo+wn):.5;return {v:off*sh+on*(1-sh),share:sh}}

// ---- static form
const zoneOf=n=>n.region||"Khác",zoneOfDis=id=>{const n=NPP.find(x=>x.id===id);return n?zoneOf(n):"Khác"};
const ZONES=[...new Set(NPP.map(zoneOf))].sort();
[$("#selZone"),$("#subZone")].forEach(el=>{el.innerHTML=`<option value="">Tất cả khu vực</option>`+ZONES.map(z=>`<option value="${esc(z)}">${esc(z)}</option>`).join("")});
function fillNpp(keep){const z=$("#selZone").value,list=NPP.map((n,i)=>[n,i]).filter(([n])=>IS_ADMIN?(!z||zoneOf(n)===z):n.id===window.__USER);
  $("#selNpp").innerHTML=list.map(([n,i])=>`<option value="${i}">${n.code} · ${n.area}</option>`).join("");
  $("#selNpp").value=list.some(([,i])=>i===keep)?keep:(list[0]?list[0][1]:0);
  if(!IS_ADMIN){$("#selZone").closest("div").hidden=true;$("#selNpp").disabled=true}}
fillNpp(0);
function setNpp(i){$("#selZone").value=zoneOf(NPP[i]);fillNpp(i)}
$("#opT tbody").innerHTML=OPS.map(o=>`<tr><td class="lbl">${o[1]}<small>${o[2]} · ${GRP[o[3]]}</small></td><td>${inp(o[0]+"_q")}</td><td>${inp(o[0]+"_v")}</td><td>${inp(o[0]+"_s")}</td></tr>`).join("");
$("#mkT tbody").innerHTML=MKS.map(o=>`<tr><td class="lbl">${o[1]}<small>${o[2]}</small></td><td>${inp(o[0]+"_v")}</td><td>${inp(o[0]+"_p")}</td></tr>`).join("");
const row=o=>`<div class="row2"><label for="${o[0]}">${o[1]}<small>${o[2]} <span class="src">${o[3]==="GIS"?"GIS Input":"PnL Detail"}</span></small></label>${inp(o[0])}</div>`;
$("#oiB").innerHTML=OIS.map(row).join("");$("#icB").innerHTML=`<details class="autosec"${IS_ADMIN?" open":" hidden"}><summary>Tự tính Current account · Credit for Outlets</summary><div class="autobox">
  <div class="arow"><label class="sw"><input type="checkbox" id="autoCur"><span>Tự tính <b>Current account</b></span></label>
    <div class="f">Giá trị mua hàng SI ÷ ${inp("wDays")} ngày làm việc × ${inp("bufDays")} ngày dự phòng <label class="sw" style="font-size:12.5px"><input type="checkbox" id="siVat">+ VAT 10%</label></div></div>
  <div class="arow"><label class="sw"><input type="checkbox" id="autoCred"><span>Tự tính <b>Credit for Outlets</b></span></label>
    <div class="f">Sản lượng × giá bán BQ ÷ số ngày trong tháng × ${inp("credDays")} ngày công nợ</div></div>
  <p class="hint" id="autoHint"></p></div></details>`+ICS.map(row).join("");
["autoCur","autoCred","siVat"].forEach(id=>$("#"+id).addEventListener("change",()=>render(calc())));

function fillMonths(keep){const n=cur(),ms=Object.keys(n.months).sort();
  $("#selMon").innerHTML=ms.map(m=>`<option value="${m}">${mLbl(m)}${n.months[m].open?" · chưa chốt":""}</option>`).join("");
  $("#selMon").value=keep&&ms.includes(keep)?keep:(S.so&&ms.includes(S.so.month)?S.so.month:ms[ms.length-1])}

function loadNpp(){
  const n=cur(),m=n.months[mon()],V=m.vol;
  set("totVol",V);set("totBuy",m.cogs/V);set("totSell",m.rev/V);set("discWs",m.disc/V);
  OPS.forEach(o=>{const v=m[o[0]]||0;set(o[0]+"_q",v?1:"");set(o[0]+"_v",v||"");set(o[0]+"_s",v?100:"")});
  MKS.forEach(o=>{set(o[0]+"_v",m[o[0]]||"");set(o[0]+"_p","")});
  ["cdAmt","cdInt","dip","oiOther"].forEach(k=>set(k,m[k]));set("cit",m.cit);
  ICS.forEach(o=>set(o[0],m[o[0]]));
  set("wDays",26);set("bufDays",1.5);set("credDays",Math.round(n.credDays*100)/100);
  $("#autoCur").checked=!!m.open&&siAmount(n.id,mon())!=null;$("#autoCred").checked=false;$("#autoCred").closest(".arow").hidden=true;
  document.querySelectorAll("input[data-ref]").forEach(el=>{delete el.dataset.ref;el.placeholder=""});
  if(m.open){const r=n.months[addM(mon(),-1)],lb=mLbl(addM(mon(),-1));
    ["depTruck","depFork","depTools"].forEach(k=>{const v=r?r[k]||0:0;[["_q",v?1:0],["_v",v],["_s",v?100:0]].forEach(([x,rv])=>{const el=$("#"+k+x);el.value="";el.dataset.ref=String(rv);el.placeholder=fmt(rv)})});
    const ef=$("#fixed");ef.value="";ef.dataset.ref=String(r?r.fixed:0);ef.placeholder=fmt(r?r.fixed:0)}
  const so=soFor(n.id,mon());
  $("#modeSo").disabled=!so||!Object.keys(so).length;
  (so&&Object.keys(so).length?$("#modeSo"):$("#modeTot")).checked=true;toggleMode();
  $("#costHint").textContent=m.open?`${mLbl(mon())} chưa chốt trên PnL Detail: chi phí và vốn đang lấy theo ${mLbl(addM(mon(),-1))}, CD/DIP và Inventory lấy theo ${mLbl(mon())}.`:"Số nạp sẵn là chi phí tháng thực tế (Qty = 1, share 100%). Market investment = VND + % × doanh thu. Capital cost = VND × % (bỏ trống % thì lấy nguyên VND).";
  $("#meta").innerHTML=`<span>DisID <b>${n.id}</b></span><span>${n.region||"Ngoài phạm vi GIS export"} · <b>${n.area}</b></span>`+
    (n.gisLast?`<span>GIS nhập gần nhất <b>${n.gisLast}</b>${n.ddt?" · "+esc(n.ddt):""}</span>`:"")+
    `<span>SO: <b>${so?(Object.keys(so).length?fmt(Object.values(so).reduce((a,r)=>a+r.SDIS+r.OFF+r.ON+r.NA,0))+" thùng":"không có dòng của NPP"):"chưa có file "+mLbl(mon())}</b></span>`;
  refreshAll();
}
function toggleMode(){const so=$("#modeSo").checked;$("#soBox").hidden=!so;$("#totBox").hidden=so;$("#volTag").textContent=so?"SO × Giá bán":"PnL Detail"}
document.querySelectorAll("input[name=mode]").forEach(r=>r.addEventListener("change",()=>{toggleMode();render(calc())}));

// ---- revenue from SO
function soRevenue(){const so=soFor(cur().id,mon())||{};let V=0,rev=0;const ch={SDIS:0,OFF:0,ON:0,NA:0},src={input:0,ref:0,avg:0};
  for(const sku in so){const r=so[sku];for(const c of [...CH,"NA"]){const q=r[c];if(!q)continue;const p=effPrice(sku,c==="NA"?"OFF":c);V+=q;ch[c]+=q;rev+=q*p.v;src[p.src]+=q}}
  return {V,rev,ch,src}}
function renderSoSummary(){const r=soRevenue();const pct=k=>r.V?fmt(r.src[k]/r.V*100,0)+"%":"–";
  $("#soSummary").innerHTML=`<div class="stats">${CH.map(c=>`<div class="stat"><div class="k"><span class="chip ${c}">${c}</span></div><div class="v">${fmt(r.ch[c])}</div></div>`).join("")}
  <div class="stat"><div class="k">Giá bán BQ / thùng</div><div class="v">${fmt(r.V?r.rev/r.V:NaN)}</div></div></div>
  <p class="hint">Tổng ${fmt(r.V)} thùng${r.ch.NA?`, trong đó ${fmt(r.ch.NA)} thùng chưa gán Channel (tạm tính giá OFF)`:""}. Nguồn giá theo sản lượng: đã collect ${pct("input")}, giá tham chiếu ${pct("ref")}, giá BQ tháng gần nhất ${pct("avg")}. Nhập giá ở tab <b>Collect price</b>.</p>`}

function calc(){
  let V,rev,cogs;const soMode=$("#modeSo").checked&&!$("#modeSo").disabled;
  if(soMode){const r=soRevenue();V=r.V;rev=r.rev}else{V=val("totVol");rev=V*val("totSell")}
  cogs=V*val("totBuy");
  const disc=V*val("discWs"),gc=rev-cogs-disc,g={wh:0,tr:0,mg:0,mk:0,cap:0};
  OPS.forEach(o=>{const sh=isBlank(o[0]+"_s")?100:val(o[0]+"_s"),q=o[0]==="driver"?1:val(o[0]+"_q");g[o[3]]+=q*val(o[0]+"_v")*sh/100});
  MKS.forEach(o=>{const v=val(o[0]+"_v"),p=val(o[0]+"_p");g[o[3]]+=o[3]==="mk"?v+rev*p/100:(p?v*p/100:v)});
  const opex=g.wh+g.tr+g.mg+g.mk+g.cap,oi=val("cdAmt")+val("cdInt")+val("dip")+val("oiOther");
  const D=daysIn(mon()),amt=siAmount(cur().id,mon());const base=amt==null?null:amt*($("#siVat").checked?1.1:1);let autoInfo={amt,base,D};
  const ac=$("#autoCur").checked,ar=$("#autoCred").checked;$("#curAcc").readOnly=ac;$("#credit").readOnly=ar;
  if(ac&&val("wDays")>0&&base!=null)set("curAcc",Math.round(base/val("wDays")*val("bufDays")/1e3)*1e3);
  if(ar)set("credit",Math.round(rev/D*val("credDays")/1e3)*1e3);
  renderAutoHint(autoInfo,rev);
  const pbt=gc-opex+oi,cit=val("cit"),tax=pbt>0?pbt*cit/100:0,pat=pbt-tax,invest=ICS.reduce((a,o)=>a+val(o[0]),0);
  return{soMode,V,rev,cogs,disc,gc,g,opex,oi,pbt,cit,tax,pat,invest,roi:invest?pat/invest*100:NaN,patPct:rev?pat/rev*100:NaN};
}
const pc=(n,V)=>V?n/V:NaN;
function pill(v,bm,hi=true){if(!isFinite(v)||!bm)return"";const r=hi?v/bm:bm/v;const c=r>=1?"ok":r>=.85?"warn":"bad";
  return `<span class="pill ${c}">${r>=1?"Tốt hơn BM":r>=.85?"Sát BM":"Dưới BM"}</span>`}
function suggestions(r){
  const n=cur(),A=n.avg,V=r.V,out=[];if(!V)return out;
  if(r.roi<BM.roi){const need=(BM.roi/100*r.invest-r.pat)/(1-r.cit/100)/V;
    out.push(["bad","!",`ROI ${fmt(r.roi,2)}% thấp hơn BM nhóm ${fmt(BM.roi,2)}%. Để chạm BM cần thêm khoảng <b>${fmt(need)} đ/thùng</b> lợi nhuận trước thuế (tăng giá bán hoặc giảm chi phí), tương đương ${fmt(need*V/1e6,1)} tr/tháng.`]);}
  else out.push(["ok","✓",`ROI ${fmt(r.roi,2)}% đang trên BM nhóm ${fmt(BM.roi,2)}%.`]);
  [["tr","Transportation"],["wh","Warehouse"],["mg","Management"]].forEach(([k,nm])=>{const v=pc(r.g[k],V),b=BM[k];
    if(v>b*1.1)out.push(["warn","↓",`${nm} ${fmt(v)} đ/thùng, cao hơn BM ${fmt(b)} đ. Kéo về BM tiết kiệm khoảng <b>${fmt((v-b)*V/1e6,1)} tr/tháng</b>.`])});
  const invDays=r.cogs?val("inv")/r.cogs*30:NaN,credDays=r.rev?val("credit")/r.rev*30:NaN;
  if(invDays>12)out.push(["warn","↓",`Tồn kho tương đương <b>${fmt(invDays,1)} ngày</b> giá vốn. Giảm về 10 ngày giải phóng khoảng ${fmt((invDays-10)/30*r.cogs/1e6,0)} tr vốn.`]);
  if(credDays>3)out.push(["warn","↓",`Công nợ thị trường ≈ <b>${fmt(credDays,1)} ngày</b> doanh thu, nên siết thu hồi nợ.`]);
  if(val("cdHold")>.4*r.invest)out.push(["warn","i",`CD hold chiếm ${fmt(val("cdHold")/r.invest*100,0)}% vốn đầu tư, là nguyên nhân chính kéo ROI xuống.`]);
  if(r.soMode){const s=soRevenue();if(s.src.avg/s.V>.2)out.push(["warn","i",`${fmt(s.src.avg/s.V*100,0)}% sản lượng chưa có giá nhập và chưa có tham chiếu GIS, đang tạm dùng giá bán BQ ${fmt(n.lastSell)} đ. Collect giá ở tab Collect price để số chính xác hơn.`])}
  const pcs=pc(r.pat,V);out.push([pcs>=A.pat?"ok":"warn",pcs>=A.pat?"✓":"i",`So với chính NPP bình quân các tháng đã chốt: PAT ${fmt(pcs)} vs ${fmt(A.pat)} đ/thùng.`]);
  return out}

function render(r){
  const V=r.V,M=n=>fmt(n/1e6,1),sgn=n=>n<0?' class="neg"':"",n=cur(),mm=mon(),act=n.months[mm];
  const costs=[["Warehouse","wh"],["Transportation","tr"],["Management","mg"],["Market investment","mk"],["Capital cost","cap"]];
  const maxC=Math.max(...costs.map(c=>pc(r.g[c[1]],V)||0),BM.tr,1);
  const front=pc(r.gc,V),back=pc(r.oi,V),fb=Math.max(r.gc,0)+Math.max(r.oi,0)||1;
  const ms=Object.keys(n.months).sort(),vals=ms.map(m=>n.months[m].open?null:n.months[m].pat/n.months[m].vol),mx=Math.max(...vals.filter(v=>v!=null),pc(r.pat,V)||0,1);
  const Sg=suggestions(r);
  const chk=act.open?`${mLbl(mm)} chưa có số chốt trên PnL Detail, đây là số dự phóng từ SO và giá bán.`:
    (Math.abs(r.pat-act.pat)<Math.max(1000,Math.abs(act.pat)*.0005)?`✓ Khớp PnL Detail ${mLbl(mm)}: PAT ${M(act.pat)} tr, ROI ${fmt(act.roi*100,2)}%.`:`Chênh so với thực tế ${mLbl(mm)}: PAT ${r.pat-act.pat>0?"+":""}${M(r.pat-act.pat)} tr (thực tế ${M(act.pat)} tr, ROI ${fmt(act.roi*100,2)}%).`);
  $("#out").innerHTML=`
  <h2>${n.code} · ${mLbl(mm)}</h2><div class="stamp">${r.soMode?"Sản lượng SO × giá bán":"Theo PnL Detail"} · ${fmt(V)} thùng · BM = bình quân ${NPP.length} NPP, các tháng đã chốt</div>
  ${checklist()}
  <div class="kpis">
    <div class="kpi hero-k"><div class="k">ROI (tháng)</div><div class="v num">${fmt(r.roi,2)}%</div><div class="s">≈ ${fmt(r.roi*12,1)}%/năm ${pill(r.roi,BM.roi)}</div></div>
    <div class="kpi"><div class="k">PAT</div><div class="v num"${sgn(r.pat)}>${M(r.pat)} tr</div><div class="s">${fmt(r.patPct,2)}% doanh thu ${pill(r.patPct,BM.patPct)}</div></div>
    <div class="kpi"><div class="k">PAT / thùng</div><div class="v num"${sgn(r.pat)}>${fmt(pc(r.pat,V))} đ</div><div class="s">BM ${fmt(BM.pat)} đ ${pill(pc(r.pat,V),BM.pat)}</div></div>
    <div class="kpi"><div class="k">Cost / thùng</div><div class="v num">${fmt(pc(r.opex,V))} đ</div><div class="s">BM ${fmt(BM.opex)} đ ${pill(pc(r.opex,V),BM.opex,false)}</div></div>
  </div>
  <div class="block"><h3>PAT/thùng theo tháng · ${n.code}</h3>
    <div class="trend">${ms.map((m,i)=>{const v=m===mm?pc(r.pat,V):vals[i];return `<span class="${m===mm?"on":vals[i]==null?"open":""}" style="height:${Math.max(v||0,0)/mx*100}%" title="${mLbl(m)}: ${fmt(v)} đ"></span>`}).join("")}</div>
    <div class="trendlbl">${ms.map(m=>`<i>T${+m.slice(5)}</i>`).join("")}</div></div>
  <div class="block"><h3>Front margin vs Back margin</h3>
    <div class="margin">
      <div class="mcard"><div class="k">Front margin <small>· giá bán − giá mua</small></div><div class="v num"${sgn(front)}>${fmt(front)} đ/thùng</div><div class="s">${M(r.gc)} tr · BM ${fmt(BM.gc)} đ</div></div>
      <div class="mcard"><div class="k">Back margin <small>· CD, DIP, KM</small></div><div class="v num">${fmt(back)} đ/thùng</div><div class="s">${M(r.oi)} tr · BM ${fmt(BM.oi)} đ</div></div>
    </div>
    <div class="bar" aria-hidden="true"><span style="width:${Math.max(r.gc,0)/fb*100}%;background:var(--green)"></span><span style="width:${Math.max(r.oi,0)/fb*100}%;background:var(--red)"></span></div></div>
  <div class="block"><h3>Chi phí vận hành / thùng (BM nhóm)</h3>
    ${costs.map(c=>`<div class="costrow"><span>${c[0]} <small style="color:var(--muted)">· BM ${fmt(BM[c[1]])}</small></span><span class="r">${fmt(pc(r.g[c[1]],V))} đ</span><span class="r"><small>${M(r.g[c[1]])} tr</small></span><div class="track"><i style="width:${(pc(r.g[c[1]],V)||0)/maxC*100}%"></i></div></div>`).join("")}
    <div class="costrow total"><span>Tổng Operating cost</span><span class="r">${fmt(pc(r.opex,V))} đ</span><span class="r"><small>${M(r.opex)} tr</small></span></div></div>
  <div class="sugg"><h3>Gợi ý cho ${n.code}</h3>${Sg.map(s=>`<div class="sitem"><span class="dot ${s[0]}">${s[1]}</span><span>${s[2]}</span></div>`).join("")}</div>
  <div class="block"><h3>Bảng P&amp;L (triệu VND)</h3>
  <table class="pl">
    <tr><td>1. Total Volume (thùng)</td><td class="n">${fmt(V)}</td><td class="pc"></td></tr>
    <tr><td>2. Sales revenue</td><td class="n">${M(r.rev)}</td><td class="pc">${fmt(pc(r.rev,V))}/th</td></tr>
    <tr class="ind"><td>3. COGS</td><td class="n">${M(r.cogs)}</td><td class="pc">${fmt(pc(r.cogs,V))}/th</td></tr>
    <tr class="ind"><td>4. Discount for WholeSales</td><td class="n">${M(r.disc)}</td><td class="pc"></td></tr>
    <tr class="strong"><td>5. Gross Contribution</td><td class="n"${sgn(r.gc)}>${M(r.gc)}</td><td class="pc">${fmt(front)}/th</td></tr>
    <tr class="ind"><td>6. Operating cost</td><td class="n">${M(r.opex)}</td><td class="pc">${fmt(pc(r.opex,V))}/th</td></tr>
    <tr class="ind"><td>7. Other incomes</td><td class="n">${M(r.oi)}</td><td class="pc">${fmt(back)}/th</td></tr>
    <tr class="strong"><td>8. Profit before tax</td><td class="n"${sgn(r.pbt)}>${M(r.pbt)}</td><td class="pc"></td></tr>
    <tr class="ind"><td>9. Income tax (CIT ${fmt(r.cit)}%)</td><td class="n">${M(r.tax)}</td><td class="pc"></td></tr>
    <tr class="strong"><td>10. Profit after tax</td><td class="n"${sgn(r.pat)}>${M(r.pat)}</td><td class="pc">${fmt(pc(r.pat,V))}/th</td></tr>
    <tr><td>14. Investment capital</td><td class="n">${M(r.invest)}</td><td class="pc"></td></tr>
  </table><div class="check">${chk}</div></div>
  <div class="conclusion"><h3>Kết luận</h3><ul>
    <li>${n.code} ${mLbl(mm)} đạt ROI <b>${fmt(r.roi,2)}%/tháng</b>, mỗi thùng lãi <b>${fmt(pc(r.pat,V))} đ</b> sau thuế.</li>
    <li>Back margin đóng góp <b>${fmt(Math.max(r.oi,0)/fb*100,0)}%</b> nguồn thu biên, ${Math.max(r.oi,0)/fb>.25?"NPP phụ thuộc đáng kể vào hỗ trợ CD/DIP.":"phần lớn lợi nhuận đến từ chênh lệch giá bán."}</li>
    ${Sg.filter(s=>s[0]!=="ok").length?`<li>Có ${Sg.filter(s=>s[0]!=="ok").length} điểm cần xử lý trong phần gợi ý.</li>`:""}
  </ul></div>`;
}

// ---- Collect price tab
S.buyVat=LS.get("buyVat",true);
const vatOf=sku=>/^H0\d/.test(sku)?0.08:0.10; // Heineken 0.0 (không cồn) 8%, bia 10%
function buyPrice(sku){const t=typed(sku,"BUY");if(t)return {v:t,src:"input"};const a=S.si;
  if(a&&a.month===mon()&&a.sku&&a.sku[cur().id]&&a.sku[cur().id][sku])return {v:Math.round(a.sku[cur().id][sku]*(S.buyVat?1+vatOf(sku):1)),src:"SI"};return null}
const fT=v=>v==null||!isFinite(v)?"–":fmt(v/1e9,2)+" tỷ";
function renderPriceKpi(buyT,rv){const el=$("#priceKpi");if(!el)return;const c=calc(),tr=CH.reduce((x,k)=>x+(rv[k]||0),0);
  const tile=(k,v,s)=>`<div><div class="k">${k}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
  el.innerHTML=tile("Tổng giá nhập",fT(buyT),"Sản lượng SO × giá nhập")+tile("Tổng doanh thu",fT(tr),"Sản lượng × giá bán theo kênh")+tile("Đầu tư thị trường",fT(c.g&&c.g.mk),"Market Invest")+tile("COGS",fT(c.cogs),"Giá vốn theo P&amp;L")}
function renderPrice(){
  const n=cur(),so=soFor(n.id,mon()),list=soSkus(so);
  let tot={SDIS:0,OFF:0,ON:0},rv={SDIS:0,OFF:0,ON:0},buyT=0;
  $("#skuCount").textContent=so?`${list.length} SKU có sản lượng SO trong ${mLbl(mon())}`:"";
  let below=0;
  const rows=list.map(sku=>{const r=so&&so[sku]||{SDIS:0,OFF:0,ON:0,NA:0},ref=refPrice(n.id,mon(),sku),bp=buyPrice(sku);CH.forEach(c=>{tot[c]+=r[c];const p=typed(sku,c);if(p&&r[c])rv[c]+=r[c]*p});buyT+=(bp?bp.v:0)*CH.reduce((x,c)=>x+(r[c]||0),0);
    const ph=c=>ref&&ref[c]?fmt(ref[c]):"";const lo=c=>bp&&typed(sku,c)&&typed(sku,c)<bp.v;const anyLo=CH.some(lo);if(anyLo)below++;
    return `<tr${anyLo?' class="hotrow"':""}><td class="l"><b>${sku}${ON_FORM.has(sku)?"":' <span class="chip">ngoài form GIS</span>'}</b><small>${esc(SKU_NAME[sku]||"")}</small></td>
      ${CH.map(c=>`<td>${r[c]?fmt(r[c]):'<span class="muted">–</span>'}</td>`).join("")}
      <td><input class="v buy" inputmode="decimal" id="p_${sku}_BUY" data-sku="${sku}" data-ch="BUY" placeholder="nhập" value="${bp?fmt(bp.v):""}" title="${bp&&bp.src==="SI"?`Từ file SI by Amount${S.buyVat?`, cộng VAT ${vatOf(sku)*100}%`:""}`:"Nhập tay"}"></td>
      ${CH.map(c=>`<td><input class="v${lo(c)?" lowp":""}" inputmode="decimal" id="p_${sku}_${c}" data-sku="${sku}" data-ch="${c}" placeholder="${ph(c)}" value="${typed(sku,c)?fmt(typed(sku,c)):""}"${lo(c)?` title="Thấp hơn giá nhập ${fmt(bp.v)} đ"`:""}></td>`).join("")}
</tr>`}).join("");
  $("#priceT").innerHTML=`<thead><tr class="grp"><th class="l"></th><th colspan="3">Sản lượng SO (thùng)</th><th>Giá nhập</th><th colspan="3">Giá bán / thùng</th></tr>
    <tr><th class="l">SKU</th>${CH.map(c=>`<th><span class="chip ${c}">${c}</span></th>`).join("")}<th>${S.buyVat?"Gồm VAT":"Chưa VAT"}</th><th>Giá Sdis</th><th>Giá OFF</th><th>Giá ON</th></tr></thead>
    <tbody>${rows||`<tr><td class="l" colspan="8">${so?`${cur().code} không có dòng nào trong file SO ${mLbl(mon())}.`:`Chưa có file SO cho ${mLbl(mon())}. Nạp file SO ở tab Dữ liệu nguồn hoặc chọn tháng có dữ liệu SO.`}</td></tr>`}</tbody>
    <tfoot><tr><td class="l">Tổng sản lượng</td>${CH.map(c=>`<td>${fmt(tot[c])}</td>`).join("")}<td colspan="4"></td></tr><tr class="revrow"><td class="l">Doanh thu theo kênh (đ)</td><td colspan="4"></td>${CH.map(c=>`<td>${fmt(rv[c])}</td>`).join("")}</tr></tfoot>`;
  renderPriceKpi(buyT,rv);
  $("#skuCount").innerHTML=so?`${list.length} SKU có sản lượng SO trong ${mLbl(mon())}${below?` · <b style="color:var(--red)">${below} SKU có giá bán thấp hơn giá nhập</b>`:""}`:"";
}
$("#priceT").addEventListener("change",e=>{const el=e.target;if(!el.dataset.sku)return;const k=pkey();S.prices[k]=S.prices[k]||{};S.prices[k][el.dataset.sku]=S.prices[k][el.dataset.sku]||{};
  const v=parse(el.value);if(v)S.prices[k][el.dataset.sku][el.dataset.ch]=v;else delete S.prices[k][el.dataset.sku][el.dataset.ch];LS.set("prices",S.prices);renderPrice();refreshDerived()});
$("#buyVat").checked=S.buyVat;$("#buyVat").addEventListener("change",e=>{S.buyVat=e.target.checked;LS.set("buyVat",S.buyVat);renderPrice()});
$("#fillRef").onclick=()=>{const n=cur(),k=pkey();S.prices[k]=S.prices[k]||{};let c=0;
  skuList(soFor(n.id,mon()),true).forEach(sku=>{const ref=refPrice(n.id,mon(),sku);if(!ref)return;const p=S.prices[k][sku]=S.prices[k][sku]||{};
    CH.forEach(ch=>{if(!p[ch]){const v=ref[ch];if(v){p[ch]=v;c++}}})});
  LS.set("prices",S.prices);refreshAll();if(!c)$("#fillRef").textContent="Chưa có giá tham chiếu tháng trước";};
$("#clearPrice").onclick=()=>{delete S.prices[pkey()];LS.set("prices",S.prices);refreshAll()};

// ---- GIS input tab (reference sheet, same layout as company form)
function gisRows(){const n=cur(),so=soFor(n.id,mon());
  return skuList(so,true).filter(s=>ON_FORM.has(s)||(so&&so[s])).map(sku=>{const ws=typed(sku,"SDIS"),b=retailBlend(sku,so),r=so&&so[sku]||{};
    return {sku,name:`${sku} - ${SKU_NAME[sku]||""}`,ws:finPrice(sku,"ws")??ws,rt:finPrice(sku,"rt")??rt1k(b.v),share:b.share,vol:(r.SDIS||0)+(r.OFF||0)+(r.ON||0)}})}
const GIS_OPS=[["Total Depreciation / Tổng khấu hao",["depTruck","depFork","depTools"]],["Total Transportation - Tổng CP vận chuyển",["petro","bike","trOther"]],["Total management cost - Chi phí nhân sự",["hireWh","driver","whKeeper","dsm","mgmt","office","otherFee"]]];
const GIS_MK=[["Total market investment - Chi phí đầu tư thị trường",["mkWs","mkRt","mkOt"]],["Capital cost - Chi phí vốn",["capInt","capBad","capOt"]]];
const opName=k=>{const o=OPS.find(x=>x[0]===k)||MKS.find(x=>x[0]===k);return `${o[1]} - ${o[2]}`};
function gisSheet(){const rows=gisRows(),L=[];const v=id=>{const el=$("#"+id);return isBlank(id)&&!(el&&el.dataset.ref)?null:val(id)};
  L.push({h:"1. Giá Bán Sales out",cols:["Wholesale","Retail"]});
  rows.forEach(r=>L.push({n:r.name,c:[r.ws,r.rt],extra:ON_FORM.has(r.sku)?"":"ngoài form",miss:!r.ws||!r.rt}));
  L.push({h:"2. Sale revenue - Doanh thu",cols:["Wholesale","Retail"]});
  L.push({n:"Discount for WholeSales - Chiết khấu bán hàng (Toàn bộ outlet)",c:[v("discWs"),v("discWs")]});
  L.push({h:"3. Operation cost - Chi phí cho HVN",cols:["Qty","VND","% share"]});
  GIS_OPS.forEach(([g,ks])=>{L.push({g});ks.forEach(k=>L.push({n:opName(k),k,c:[v(k+"_q"),v(k+"_v"),v(k+"_s")]}))});
  GIS_MK.forEach(([g,ks])=>{L.push({g,cols:["","VND","%"]});ks.forEach(k=>L.push({n:opName(k),c:[null,v(k+"_v"),v(k+"_p")]}))});
  L.push({h:"4. Other incomes - Thu nhập khác từ kinh doanh HVN",cols:["","","VND / %"]});
  L.push({n:"Other (Increase price/Promotion) - Thu nhập từ tăng giá, KM",c:[null,null,v("oiOther")]});
  L.push({n:"Income Tax (CIT) - Thuế thu nhập DN (%)",c:[null,null,v("cit")]});
  L.push({h:"5. Investment Capital / Vốn đầu tư",cols:["","","VND"]});
  [["curAcc","Current account - Tài khoản thanh toán"],["credit","Credit for Outlets - Công nợ thị trường"],["fixed","Remaing value fixed assets - Giá trị tài sản còn lại theo tỉ trọng"]].forEach(([k,n])=>L.push({n,c:[null,null,v(k)]}));
  return L}
function renderGis(){const L=gisSheet();let cols=3,html="";
  L.forEach(x=>{if(x.h){const c=x.cols;html+=`<tr class="sech"><th class="l" colspan="${4-c.length}">${esc(x.h)}</th>${c.map(t=>`<th>${t}</th>`).join("")}</tr>`}
    else if(x.g){html+=`<tr class="subh"><td class="l" colspan="4">${esc(x.g)}</td></tr>`}
    else{const c=x.c;const cells=c.length===2?[null,...c]:c;
      html+=`<tr${x.miss?' class="miss"':""}><td class="l">${esc(x.n)}${x.extra?` <span class="chip">${x.extra}</span>`:""}</td>${cells.map((z,i)=>x.k&&i===2?`<td><input class="v" inputmode="decimal" data-gshare="${x.k}" value="${z!=null?fmt(z,Math.abs(z%1)>1e-9?2:0):""}" placeholder="%" style="max-width:90px;min-width:70px"></td>`:`<td>${z==null?(c.length===2&&i===0?"":'<span class="muted">–</span>'):fmt(z,Math.abs(z%1)>1e-9?2:0)}</td>`).join("")}</tr>`}});
  $("#gisT").innerHTML=`<tbody>${html}</tbody>`;
  const miss=L.filter(x=>x.miss).length;$("#gisMiss").textContent=miss?`${miss} SKU chưa đủ giá, bổ sung ở tab Giá bán.`:"Đã đủ giá cho tất cả SKU.";}
$("#copyGis").onclick=async()=>{const t=gisSheet().map(x=>x.h?[x.h,...(x.cols.length===2?["",...x.cols]:x.cols)].join("\t"):x.g?x.g:[x.n,...x.c.map(z=>z==null?"":Math.round(z*100)/100)].join("\t")).join("\n");
  try{await navigator.clipboard.writeText(t);$("#copyMsg").textContent="Đã copy, dán vào Excel."}catch(e){$("#copyMsg").textContent="Trình duyệt chặn copy, hãy bôi đen bảng và copy thủ công."}};

// ---- Compare tab
const TH=2000;
const rt1k=v=>v?Math.round(v/1000)*1000:null;
// reference Wholesale / Retail: GIS input first (the system source), then earlier collected prices; M-1 → M-3
function refWR(dis,m,sku,share){
  for(let k=1;k<=3;k++){const mm=addM(m,-k);
    const g=((S.gis.prices[dis]||{})[mm]||{})[sku];if(g&&(g.ws||g.rt))return {ws:g.ws||null,rt:g.rt||null,lag:k,month:mm,src:"GIS"};
    const c=(S.prices[dis+"|"+mm]||{})[sku];
    if(c&&(c.SDIS||c.OFF||c.ON)){const sh=isFinite(share)?share:.5;const rt=c.OFF&&c.ON?c.OFF*sh+c.ON*(1-sh):(c.OFF||c.ON||null);
      return {ws:c.SDIS||null,rt:rt1k(rt),lag:k,month:mm,src:"Collect"}}}
  return null}
function cmpRows(){const n=cur(),so=soFor(n.id,mon());
  return soSkus(so||{}).map(sku=>{const b=retailBlend(sku,so),bp=buyPrice(sku),buy=bp?bp.v:null;
    const cws=typed(sku,"SDIS"),crt=rt1k(b.v),fws=finPrice(sku,"ws"),frt=finPrice(sku,"rt"),ws=fws??cws,rt=frt??crt;
    const mW=buy&&ws?ws-buy:null,mR=buy&&rt?rt-buy:null,loW=mW!=null&&mW<0,loR=mR!=null&&mR<0;
    const r=so[sku];return {sku,buy,off:typed(sku,"OFF"),on:typed(sku,"ON"),share:b.share,cws,crt,fws,frt,ws,rt,mW,mR,loW,loR,lo:loW||loR,vol:r.SDIS+r.OFF+r.ON+r.NA}})}
const mcell=x=>x==null?'<td class="muted">–</td>':`<td class="${x<0?"hot":""}">${x>0?"+":""}${fmt(x)}<br><small class="muted">${""}</small></td>`;
function renderCmp(){const rows=cmpRows(),lo=rows.filter(r=>r.lo);
  $("#cmpCnt").hidden=!lo.length;$("#cmpCnt").textContent=lo.length;
  $("#cmpLead").innerHTML=`Giá bán ${mLbl(mon())} sau tính toán: Wholesale = giá Sdis, Retail = OFF và ON bình quân theo tỷ lệ sản lượng, làm tròn 1.000 đ. Bạn sửa trực tiếp ở 2 cột Giá bán nếu cần chốt số khác; GIS Input lấy theo 2 cột này. Giá bán thấp hơn giá nhập tô đỏ.`;
  const vol=rows.reduce((a,r)=>a+r.vol,0),wm=(k)=>{let s=0,v=0;rows.forEach(r=>{if(r[k]!=null){s+=r[k]*r.vol;v+=r.vol}});return v?s/v:null};
  $("#cmpStats").innerHTML=`<div class="stat"><div class="k">SKU bán dưới giá nhập</div><div class="v d-dn">${lo.length}</div></div><div class="stat"><div class="k">Lợi nhuận BQ Wholesale</div><div class="v">${wm("mW")!=null?fmt(wm("mW"))+" đ":"–"}</div></div><div class="stat"><div class="k">Lợi nhuận BQ Retail</div><div class="v">${wm("mR")!=null?fmt(wm("mR"))+" đ":"–"}</div></div><div class="stat"><div class="k">SKU chưa có giá bán</div><div class="v">${rows.filter(r=>!r.ws&&!r.rt).length}</div></div>`;
  $("#cmpT").innerHTML=`<thead><tr class="grp"><th class="l"></th><th>Giá nhập</th><th colspan="2">Giá bán sau tính toán</th><th colspan="2">Lợi nhuận / thùng</th></tr>
  <tr><th class="l">SKU</th><th>${S.buyVat?"Gồm VAT":"Chưa VAT"}</th><th>Wholesale</th><th>Retail</th><th>Wholesale</th><th>Retail</th></tr></thead>
  <tbody>${rows.length?rows.map(r=>`<tr${r.lo?' class="hotrow"':""}><td class="l"><b>${r.sku}</b><small>${fmt(r.vol)} thùng${isFinite(r.share)?` · OFF:ON ${fmt(r.share*100,0)}:${fmt((1-r.share)*100,0)}`:""}</small></td>
    <td>${r.buy?fmt(r.buy):"–"}</td>
    <td><input class="v${r.loW?" lowp":""}" inputmode="decimal" data-fws="${r.sku}" value="${r.ws?fmt(r.ws):""}" style="min-width:110px"${r.fws!=null?' title="Đã chỉnh tay"':""}></td>
    <td><input class="v${r.loR?" lowp":""}" inputmode="decimal" data-frt="${r.sku}" value="${r.rt?fmt(r.rt):""}" style="min-width:110px"${r.frt!=null?' title="Đã chỉnh tay"':""}></td>
    ${[r.mW,r.mR].map(x=>x==null?'<td class="muted">–</td>':`<td class="${x<0?"hot":""}">${x>0?"+":""}${fmt(x)}</td>`).join("")}</tr>`).join(""):`<tr><td class="l" colspan="6">Chưa có SKU có sản lượng SO cho ${cur().code} ở ${mLbl(mon())}.</td></tr>`}</tbody>`}

// ---- Channel tab
function soTypeVol(dis){const out={};if(!S.so)return out;const src=dis?{[dis]:S.so.data[dis]||{}}:S.so.data;
  for(const d in src)for(const sku in src[d])for(const t in src[d][sku])out[t]=(out[t]||0)+src[d][sku][t];return out}
function renderChan(){const mine=soTypeVol(cur().id),all=soTypeVol(null);const types=[...new Set([...Object.keys(S.chan),...Object.keys(all)])].sort((a,b)=>(all[b]||0)-(all[a]||0));
  const un=types.filter(t=>!S.chan[t]&&all[t]);$("#chanCnt").hidden=!un.length;$("#chanCnt").textContent=un.length;
  $("#chanT").innerHTML=`<thead><tr><th class="l">Outlet type</th><th class="l">Channel</th><th>SL ${cur().code}</th><th>SL toàn vùng</th><th></th></tr></thead><tbody>${types.map(t=>`<tr>
    <td class="l">${esc(t)}${S.chan[t]?"":' <span class="pill bad">chưa gán</span>'}</td>
    <td class="l"><select class="ch" data-type="${esc(t)}"><option value="">—</option>${CH.map(c=>`<option${S.chan[t]===c?" selected":""}>${c}</option>`).join("")}</select></td>
    <td>${mine[t]?fmt(mine[t]):"–"}</td><td>${all[t]?fmt(all[t]):"–"}</td>
    <td>${DEFAULT_CHAN[t]||all[t]?"":`<button type="button" class="del" data-type="${esc(t)}" style="padding:4px 10px;font-size:12px">Xoá</button>`}</td></tr>`).join("")}</tbody>`}
$("#chanT").addEventListener("change",e=>{const t=e.target.dataset.type;if(t==null)return;if(e.target.value)S.chan[t]=e.target.value;else delete S.chan[t];LS.set("chan",S.chan);refreshAll()});
$("#chanT").addEventListener("click",e=>{const t=e.target.dataset&&e.target.dataset.type;if(!e.target.classList.contains("del"))return;delete S.chan[t];LS.set("chan",S.chan);refreshAll()});
$("#addType").onclick=()=>{const t=$("#newType").value.trim();if(!t)return;S.chan[t]=$("#newCh").value;$("#newType").value="";LS.set("chan",S.chan);refreshAll()};
$("#resetChan").onclick=()=>{S.chan={...DEFAULT_CHAN};LS.set("chan",S.chan);refreshAll()};

function siAmount(dis,m){const a=S.si;return a&&a.month===m&&a.data[dis]!=null?a.data[dis]:null}
function renderAutoHint(a,rev){const n=cur();
  $("#autoHint").innerHTML=`Giá trị mua hàng (SI) tháng ${mLbl(mon())}: ${a.amt!=null?`<b>${fmt(a.base/1e9,2)} tỷ</b>${$("#siVat").checked?" (đã cộng VAT 10%)":" (chưa VAT)"} từ file ${esc(S.si.file)} → bình quân ${fmt(a.base/val("wDays")/1e6,0)} tr/ngày`:`<b>chưa có</b> trong file SI by Amount, Current account giữ số đang nhập`}.<br>
  Ngày công nợ của ${n.code} các tháng gần nhất: ${n.credHist.map(([k,v])=>`${mLbl(k)} ${fmt(v,2)}`).join(" · ")} ngày. Bình quân nhóm ${fmt(GRP_CRED,2)} ngày.`}
// ---- uploads
let xlsxP=null;
const XLSX_SRC=["xlsx.bundle.js","https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"];
const loadXlsx=()=>xlsxP||(xlsxP=new Promise((ok,no)=>{const tryAt=i=>{if(i>=XLSX_SRC.length){xlsxP=null;return no(new Error("Không tải được thư viện đọc Excel"))}
  const s=document.createElement("script");s.src=XLSX_SRC[i];s.onload=()=>window.XLSX?ok(window.XLSX):tryAt(i+1);s.onerror=()=>{s.remove();tryAt(i+1)};document.head.appendChild(s)};tryAt(0)}));
async function readRows(file){if(/\.(txt|tsv)$/i.test(file.name)){return (await file.text()).split(/\r?\n/).map(l=>l.split("\t"))}
  const X=await loadXlsx(),wb=X.read(await file.arrayBuffer(),{type:"array",dense:true});return X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:null})}
const findHdr=(rows,must)=>rows.findIndex(r=>r&&must.every(k=>r.includes(k)));
const toDate=v=>{if(v instanceof Date)return v;if(typeof v==="number")return new Date(Math.round((v-25569)*864e5));if(v==null||v==="")return null;const t=String(v).trim();
  if(/^\d+(\.\d+)?$/.test(t))return new Date(Math.round((+t-25569)*864e5));
  const m=t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);if(m)return new Date(Date.UTC(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0)));
  const d=new Date(t);return isNaN(d)?null:d};
const ym=d=>d&&!isNaN(d)?d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0"):null;
function status(el,cls,msg){el.className="status "+cls;el.innerHTML=msg}
$("#fileSo").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;const st=$("#soStatus");status(st,"","Đang đọc file, file lớn có thể mất 10–30 giây…");
  try{const rows=await readRows(f),h=findHdr(rows,["Seller_ID","ShortCode","Quantity"]);if(h<0)throw new Error("Không thấy các cột Seller_ID, ShortCode, Quantity");
    const H=rows[h],ix=k=>H.indexOf(k),iS=ix("Seller_ID"),iK=ix("ShortCode"),iO=ix("Outlet_Segment"),iQ=ix("Quantity"),iD=ix("FullDelivDateTime"),iDoc=ix("DIS DocNo")>=0?ix("DIS DocNo"):ix("Source DocNo");
    const data={},mc={},docs={},cs={};let n=0;
    for(let i=h+1;i<rows.length;i++){const r=rows[i];if(!r||r[iS]==null)continue;const s=String(r[iS]),k=r[iK],o=r[iO]||"(trống)",q=parseNum(r[iQ]);
      ((data[s]=data[s]||{})[k]=data[s][k]||{})[o]=(data[s][k][o]||0)+q;n++;cs[s]=(cs[s]||0)+q;if(iDoc>=0&&r[iDoc]!=null)(docs[s]=docs[s]||new Set).add(r[iDoc]);const m=ym(toDate(r[iD]));if(m)mc[m]=(mc[m]||0)+1}
    const month=Object.entries(mc).sort((a,b)=>b[1]-a[1])[0]?.[0];if(!month)throw new Error("Không xác định được tháng từ FullDelivDateTime");
    const sum={};for(const s in cs)sum[s]={cases:cs[s],orders:docs[s]?docs[s].size:null};S.soSum=S.soSum||{};S.soSum[month]=sum;LS.set("soSum",S.soSum);
    const latest=!S.so||month>=S.so.month;if(latest){S.so={month,file:f.name,data};LS.set("so",S.so)}status(st,"ok",`Đã nạp ${fmt(n)} dòng, tháng ${mLbl(month)}${latest?"":" (lưu sản lượng và số đơn để tính định mức Petro fee)"}.`);fillMonths(latest?month:mon());loadNpp();
  }catch(err){status(st,"bad",esc(err.message))}});
$("#fileGis").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;const st=$("#gisStatus");status(st,"","Đang đọc file…");
  try{const rows=await readRows(f),h=findHdr(rows,["Discode","Name","Val01"]);if(h<0)throw new Error("Không thấy các cột Discode, Name, Val01");
    const H=rows[h],ix=k=>H.indexOf(k),iD=ix("Discode"),iN=ix("Name"),i1=ix("Val01"),i2=ix("Val02"),iT=ix("InputDate"),iG=ix("GroupLvl01");
    const prices={},fuelG={};let n=0,nf=0;const i3=ix("Val03");
    for(let i=h+1;i<rows.length;i++){const r=rows[i];if(!r||!r[iN])continue;const name=String(r[iN]),m=name.match(/^\s*([A-Z0-9]+)\s+-\s+/);
      const fk=/^\s*Transport Petro fees/i.test(name)?"petro":/^\s*Transport fees \(Bike\)/i.test(name)?"bike":null;
      if(fk){const d=toDate(r[iT]),pm=d&&ym(d)?addM(ym(d),-1):null;if(pm){const q=parseNum(r[i1]),p=parseNum(r[i2]),sh=i3>=0&&r[i3]!=null&&r[i3]!==""?parseNum(r[i3]):100;
        if(q||p){const slot=((fuelG[String(r[iD])]=fuelG[String(r[iD])]||{})[pm]=fuelG[String(r[iD])][pm]||{});if(!slot[fk]||slot[fk].t<=+d){slot[fk]={q,p,s:sh||100,t:+d};nf++}}}continue}
      const g=iG>=0?String(r[iG]||""):"";if(!m||!(g.startsWith("1")||/gi[aá]/i.test(g)||!g))continue;
      if(/ - (Khấu|Chi phí|Thuế|Thu nhập|Tài khoản|Công nợ|Giá trị)/.test(name))continue;
      const d=toDate(r[iT]),pm=d&&ym(d)?addM(ym(d),-1):null;if(!pm)continue;
      const dis=String(r[iD]),sku=m[1],ws=parseNum(r[i1]),rt=parseNum(r[i2]);if(!ws&&!rt)continue;
      const slot=((prices[dis]=prices[dis]||{})[pm]=prices[dis][pm]||{});const t=+d;if(!slot[sku]||slot[sku].t<=t)slot[sku]={ws,rt,t};n++}
    if(!n&&!nf)throw new Error("File không có dòng giá bán (Name dạng “HS - Heineken…”, có Val01/Val02). Hãy export đầy đủ, không giới hạn 1.000 dòng.");
    S.gis={file:f.name,prices,fuel:fuelG};LS.set("gis",S.gis);status(st,"ok",`Đã nạp ${fmt(n)} dòng giá của ${Object.keys(prices).length} NPP, ${fmt(nf)} dòng Petro fee (số lít × giá).`);refreshAll();
  }catch(err){status(st,"bad",esc(err.message))}});
$("#fileAmt").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;const st=$("#amtStatus");status(st,"","Đang đọc file…");
  try{const rows=await readRows(f),h=rows.findIndex(r=>r&&r.map(String).some(x=>/^(Distributor_ID|Seller_ID)$/.test(x)));if(h<0)throw new Error("Không thấy cột Distributor_ID");
    const H=rows[h].map(x=>String(x??"")),iS=H.findIndex(x=>/^(Distributor_ID|Seller_ID)$/.test(x));
    let iA=H.indexOf("Sales_Amount");if(iA<0)iA=H.findIndex(x=>/amount|thành tiền|doanh số/i.test(x));if(iA<0)throw new Error("Không thấy cột Sales_Amount");
    const iD=["Date_ID","InvoiceDate","OrderDate","FullDelivDateTime"].map(k=>H.indexOf(k)).find(i=>i>=0);
    const data={},mc={},sv={};let n=0;const iK=H.indexOf("ShortCode"),iV=H.indexOf("Sales_Volume");
    for(let i=h+1;i<rows.length;i++){const r=rows[i];if(!r||r[iS]==null||r[iS]==="")continue;const s=String(r[iS]);data[s]=(data[s]||0)+parseNum(r[iA]);n++;
      if(iK>=0&&iV>=0&&r[iK]){const x=((sv[s]=sv[s]||{})[r[iK]]=sv[s][r[iK]]||[0,0]);x[0]+=parseNum(r[iV]);x[1]+=parseNum(r[iA])}
      if(iD!=null&&r[iD]!=null){const v=String(r[iD]);const m=/^\d{8}$/.test(v)?v.slice(0,4)+"-"+v.slice(4,6):ym(toDate(r[iD]));if(m)mc[m]=(mc[m]||0)+1}}
    const month=Object.entries(mc).sort((a,b)=>b[1]-a[1])[0]?.[0]||mon();
    const sku={};for(const s in sv)for(const k in sv[s])if(sv[s][k][0]>0)(sku[s]=sku[s]||{})[k]=Math.round(sv[s][k][1]/sv[s][k][0]);
    S.si={month,file:f.name,col:H[iA],data,sku};LS.set("si",S.si);status(st,"ok",`Đã nạp ${fmt(n)} dòng, cột ${esc(H[iA])}, tháng ${mLbl(month)}.`);refreshAll();
  }catch(err){status(st,"bad",esc(err.message))}});
$("#fileTms").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;const st=$("#tmsStatus");status(st,"","Đang đọc file…");
  try{const rows=await readRows(f),h=findHdr(rows,["TenantName","PlanNumber"]);if(h<0)throw new Error("Không thấy cột TenantName, PlanNumber");
    const H=rows[h],ix=k=>H.indexOf(k),iT=ix("TenantName"),iP=ix("PlanNumber"),iU=ix("username"),iQ=ix("Assigned_Quantity"),iS=ix("Status"),iD=ix("Date")>=0?ix("Date"):ix("DeliverDate"),iK=ix("TMS_Planned_Distance"),iC=ix("TruckCategory"),iDr=ix("DriverName");
    const code2id=Object.fromEntries(NPP.map(n=>[n.code,n.id])),A={};let n=0;
    for(let i=h+1;i<rows.length;i++){const r=rows[i];if(!r||!r[iT])continue;if(iS>=0&&/cancel/i.test(String(r[iS]||"")))continue;
      const dis=code2id[String(r[iT]).trim()],m=ym(toDate(r[iD]));if(!dis||!m)continue;
      const a=((A[m]=A[m]||{})[dis]=A[m][dis]||{t:new Set,dt:new Set,o:0,q:0,dq:0,km:0,ck:{},dv:{}});
      const dsa=/DSA/i.test(String(iU>=0?r[iU]||"":"")),q=parseNum(r[iQ]);
      if(dsa){a.dt.add(r[iP]);a.dq+=q}else{a.t.add(r[iP]);a.o++;a.q+=q;const km=(iK>=0?parseNum(r[iK]):0)/1000,c=iC>=0?String(r[iC]||"Khác"):"Khác";a.km+=km;a.ck[c]=(a.ck[c]||0)+km;if(iDr>=0){const dn=String(r[iDr]||"").trim();if(dn){const dd=toDate(r[iD]);(a.dv[dn]=a.dv[dn]||new Set).add(dd?dd.toISOString().slice(0,10):"")}}}n++}
    const ms=Object.keys(A).sort();if(!ms.length)throw new Error("Không đọc được dòng nào có ngày và NPP hợp lệ");
    S.tmsSum=S.tmsSum||{};ms.forEach(m=>{const sum={};for(const d in A[m]){const a=A[m][d];sum[d]={trips:a.t.size,orders:a.o,cases:a.q,km:a.km,dsaTrips:a.dt.size,dsaCases:a.dq,catKm:a.ck,drivers:Object.keys(a.dv).length,driverDays:Object.values(a.dv).reduce((x,s)=>x+s.size,0)}}S.tmsSum[m]=sum});
    LS.set("tmsSum",S.tmsSum);status(st,"ok",`Đã nạp ${fmt(n)} dòng TMS các tháng ${ms.map(mLbl).join(", ")}.`);refreshAll();
  }catch(err){status(st,"bad",esc(err.message))}});
$("#tmsReset").onclick=()=>{S.tmsSum={};LS.set("tmsSum",{});refreshAll()};
$("#amtReset").onclick=()=>{S.si=SI_DEFAULT;LS.set("si",null);refreshAll()};
$("#soReset").onclick=()=>{S.so=SO_DEFAULT;LS.set("so",null);fillMonths(S.so.month);loadNpp()};
$("#gisReset").onclick=()=>{S.gis={file:null,prices:{}};LS.set("gis",S.gis);refreshAll()};
function renderSrc(){
  const so=S.so;status($("#soStatus"),so?"ok":"",so?`Đang dùng: <b>${esc(so.file)}</b> · tháng ${mLbl(so.month)} · ${Object.keys(so.data).length} NPP`:"Chưa có file SO");
  const tm=Object.keys(Object.assign({},TMS_SUM_DEFAULT,S.tmsSum||{})).sort();status($("#tmsStatus"),"ok",`Đã có số chuyến các tháng: ${tm.map(mLbl).join(", ")} (T6–T9 nạp sẵn từ file bạn gửi).`);
  const A=S.si;status($("#amtStatus"),A?"ok":"",A?`Đang dùng: <b>${esc(A.file)}</b> · cột ${esc(A.col)} · tháng ${mLbl(A.month)} · ${Object.keys(A.data).length} NPP`:"Chưa nạp file SI by Amount.");
  const g=S.gis,nd=Object.keys(g.prices||{}).length,nf=Object.keys(g.fuel||{}).length;status($("#gisStatus"),nd||nf?"ok":"bad",nd||nf?`Đang dùng: <b>${esc(g.file)}</b> · giá bán của ${nd} NPP · số lít Petro fee của ${nf} NPP`:"Chưa nạp file GIS có dòng giá. Hãy nạp file .xlsx gốc (giá dạng text vẫn đọc được).")}

// ---- Export Excel
let DL=null;
(async()=>{try{DL=window.claude&&window.claude.use?await window.claude.use("downloads"):null}catch(e){DL=null}
  document.querySelectorAll(".xbtn").forEach(b=>b.hidden=false)})();
// Ngoài claude.ai: tải file trực tiếp bằng trình duyệt
function saveBlob(name,blob){if(DL)return DL.save({filename:name,data:blob});
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},1500);return Promise.resolve({status:"saved"})}
const HEAD={font:{bold:true,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"00843D"}},alignment:{vertical:"center",wrapText:true}};
const SEC={font:{bold:true,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"5F6B66"}}};
const SUB={font:{bold:true,color:{rgb:"B86E00"}},fill:{fgColor:{rgb:"EEF3EF"}}};
const HOT={font:{bold:true,color:{rgb:"D81E2C"}},fill:{fgColor:{rgb:"FDE6E8"}}};
const COOL={font:{bold:true,color:{rgb:"C2560C"}},fill:{fgColor:{rgb:"FFE8D1"}}};
const BOLD={font:{bold:true}};
const NUM="#,##0",NUM2="#,##0.00",PCT="0.00%";
function mkSheet(X,rows,widths){const ws=X.utils.aoa_to_sheet(rows.map(r=>r.map(c=>c&&typeof c==="object"&&"v" in c?c.v:c)));
  rows.forEach((r,i)=>{r.forEach((c,j)=>{const a=X.utils.encode_cell({r:i,c:j});if(!ws[a])return;
    if(typeof ws[a].v==="number"&&!(c&&c.z))ws[a].z=Math.abs(ws[a].v%1)>1e-9?NUM2:NUM;
    if(c&&typeof c==="object"&&"v" in c){if(c.s)ws[a].s=c.s;if(c.z)ws[a].z=c.z}
    if(r.style&&!(c&&c.s))ws[a].s=r.style})});
  ws["!cols"]=widths.map(w=>({wch:w}));return ws}
const xrow=(cells,style)=>{cells.style=style;return cells};
const n0=v=>v==null||!isFinite(v)?null:v;
async function exportExcel(btn){
  if(isOpen()&&!creditOk()){$("#xMsg").textContent="Chưa thể xuất: công nợ thị trường ở tab Chi phí vận hành phải được nhập và lớn hơn 100 triệu.";return}
  const msg=$("#xMsg");msg.textContent="Đang tạo file…";btn.disabled=true;
  try{const X=await loadXlsx(),wb=X.utils.book_new(),n=cur(),m=mon(),r=calc(),V=r.V,M=x=>n0(x);
    // 1. P&L
    const S1=[xrow([`P&L ${n.code} · ${mLbl(m)}`],{font:{bold:true,sz:14,color:{rgb:"0B4F2A"}}}),
      [`DisID ${n.id} · ${n.area} · ${r.soMode?"Sản lượng SO × giá collect":"Theo PnL Detail"} · xuất lúc ${new Date().toLocaleString("vi-VN")}`],[],
      xrow(["Chỉ số","Giá trị","Benchmark nhóm"],HEAD),
      ["ROI (tháng)",{v:n0(r.roi/100),z:PCT},{v:BM.roi/100,z:PCT}],["PAT (VND)",M(r.pat),null],["PAT / thùng",M(r.pat/V),BM.pat],
      ["PAT % doanh thu",{v:n0(r.patPct/100),z:PCT},{v:BM.patPct/100,z:PCT}],["Front margin / thùng",M(r.gc/V),BM.gc],["Back margin / thùng",M(r.oi/V),BM.oi],
      ["Cost / thùng",M(r.opex/V),BM.opex],["Warehouse / thùng",M(r.g.wh/V),BM.wh],["Transportation / thùng",M(r.g.tr/V),BM.tr],["Management / thùng",M(r.g.mg/V),BM.mg],
      ["Market investment / thùng",M(r.g.mk/V),BM.mk],["Capital cost / thùng",M(r.g.cap/V),BM.cap],[],
      xrow(["Khoản mục P&L","VND","VND / thùng"],HEAD),
      ["1. Total Volume (thùng)",M(V),null],["2. Sales revenue",M(r.rev),M(r.rev/V)],["3. COGS",M(r.cogs),M(r.cogs/V)],["4. Discount for WholeSales",M(r.disc),M(r.disc/V)],
      xrow(["5. Gross Contribution",M(r.gc),M(r.gc/V)],BOLD),["6. Operating cost",M(r.opex),M(r.opex/V)],
      ["   6.1 Warehouse",M(r.g.wh),M(r.g.wh/V)],["   6.2 Transportation",M(r.g.tr),M(r.g.tr/V)],["   6.3 Management",M(r.g.mg),M(r.g.mg/V)],["   6.4 Market investment",M(r.g.mk),M(r.g.mk/V)],["   6.5 Capital cost",M(r.g.cap),M(r.g.cap/V)],
      ["7. Other incomes",M(r.oi),M(r.oi/V)],xrow(["8. Profit before tax",M(r.pbt),null],BOLD),[`9. Income tax (CIT ${r.cit}%)`,M(r.tax),null],
      xrow(["10. Profit after tax",M(r.pat),M(r.pat/V)],BOLD),["14. Investment capital",M(r.invest),null],[],
      xrow(["Gợi ý"],HEAD),...suggestions(r).map(s=>[s[2].replace(/<[^>]+>/g,"")])];
    X.utils.book_append_sheet(wb,mkSheet(X,S1,[46,20,18]),"P&L");
    if(IS_ADMIN){
    // 2. GIS Input
    const S2=[xrow([`GIS Input ${n.code} · ${mLbl(m)}`],{font:{bold:true,sz:14,color:{rgb:"0B4F2A"}}}),[]];
    gisSheet().forEach(x=>{if(x.h)S2.push(xrow([x.h,...(x.cols.length===2?["",...x.cols]:x.cols)],SEC));else if(x.g)S2.push(xrow([x.g],SUB));
      else S2.push([x.n,...(x.c.length===2?[null,...x.c]:x.c).map(n0)])});
    X.utils.book_append_sheet(wb,mkSheet(X,S2,[62,14,18,14]),"GIS Input");
    }
    // 3. Collect price
    const so=soFor(n.id,m),S3=[xrow(["SKU","Tên","SL SDIS","SL OFF","SL ON","Giá nhập","Giá Sdis","Giá OFF","Giá ON","Retail OFF-ON (làm tròn 1.000)"],HEAD)];
    soSkus(so).forEach(sku=>{const q=so&&so[sku]||{};S3.push([sku,SKU_NAME[sku]||"",n0(q.SDIS)||null,n0(q.OFF)||null,n0(q.ON)||null,buyPrice(sku)?buyPrice(sku).v:null,...CH.map(c=>{const v=typed(sku,c),bp=buyPrice(sku);return v&&bp&&v<bp.v?{v,s:HOT}:v}),n0(rt1k(retailBlend(sku,so).v))])});
    X.utils.book_append_sheet(wb,mkSheet(X,S3,[8,40,11,11,11,13,13,13,14]),"Gia ban");
    if(IS_ADMIN){
    // 4. So sánh giá
    const S4=[xrow(["SKU","SL SO","Giá nhập","Giá bán Wholesale","Giá bán Retail","Lợi nhuận Wholesale","Lợi nhuận Retail"],HEAD)];
    cmpRows().forEach(c=>{const h=(v,lo)=>v==null?null:lo?{v,s:HOT}:v;S4.push([c.sku,c.vol,c.buy,h(c.ws,c.loW),h(c.rt,c.loR),h(c.mW,c.loW),h(c.mR,c.loR)])});
    S4.push([],["Ô đỏ: giá bán thấp hơn giá nhập."]);
    X.utils.book_append_sheet(wb,mkSheet(X,S4,[8,18,9,12,12,12,13,13,13,10,10,10,18]),"Verify gia ban");
    // 5. Channel
    const tv=soTypeVol(n.id),S5=[xrow(["Outlet type","Channel",`SL ${n.code}`],HEAD),...Object.keys({...S.chan,...tv}).sort().map(t=>[t,S.chan[t]||"chưa gán",tv[t]||null])];
    X.utils.book_append_sheet(wb,mkSheet(X,S5,[32,12,14]),"Channel");
    }
    const buf=X.write(wb,{bookType:"xlsx",type:"array"});
    await saveBlob(`PnL_${n.code}_${m.replace("-","")}.xlsx`,new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
    msg.textContent="Đã lưu file.";
  }catch(e){msg.textContent=e&&e.code==="declined"?"Đã huỷ lưu file.":e&&e.code==="rate_limited"?"Đang có hộp thoại lưu file, thử lại sau giây lát.":"Không tạo được file: "+(e&&e.message||e)}
  finally{btn.disabled=false}}
document.querySelectorAll(".xbtn").forEach(b=>b.addEventListener("click",()=>exportExcel(b)));

// ---- shared data helpers (SO / TMS / fuel)
const SO_SUM_DEFAULT={"2026-09":SO_SEP_SUM};
function soSum(m){const all=Object.assign({},SO_SUM_DEFAULT,S.soSum||{});return all[m]||null}
const TMS_SUM_DEFAULT=TMS_SUM_EMB;
function tmsSum(m){const all=Object.assign({},TMS_SUM_DEFAULT,S.tmsSum||{});return all[m]||null}
const fuel=(v,m)=>((S.fuel||{})[v]||{})[m]||null;
const NORM_DEFAULT={"Truck 1 Ton":12,"Truck 1.25 Ton":12.5,"Truck 1.5 Ton":13,"Truck 2 Ton":14.5,"Truck 2.5 Ton":16,"Truck 3.5 Ton":18,"Truck 5 Ton":21,"Truck 8 Ton":26,"Truck 10 Ton":29,"Truck 15 Ton":35};
S.norm=Object.assign({},NORM_DEFAULT,LS.get("norm2",{}));S.kmF=LS.get("kmF",1.3);
const normOf=c=>S.norm[c]??15;
function truckLitres(t){if(!t)return null;let L=0;for(const c in t.catKm||{})L+=t.catKm[c]*S.kmF*normOf(c)/100;return {L,km:(t.km||0)*S.kmF}}
function hist(n,m){return Object.keys(n.months).filter(k=>k<m&&!n.months[k].open).sort().slice(-3)}

// ---- workflow state
S.ops=LS.get("ops",{});S.fin=LS.get("fin",{});
const okey=()=>cur().id+"|"+mon();
const OPV=k=>(S.ops[okey()]||{})[k];
const FIN=k=>(S.fin[okey()]||{})[k];
const refM=()=>cur().months[addM(mon(),-1)]||null;
const isOpen=()=>!!cur().months[mon()].open;
const CREDIT_MIN=100e6;
const OPS_UI=[
  {id:"petro",t:"Chi phí xăng dầu xe tải",f:[["petroT","Tổng tiền (VND)"]],tot:o=>o.petroT,ref:m=>m.petro},
  {id:"bike",t:"Chi phí xăng dầu xe máy",f:[["bikeT","Tổng tiền (VND)"]],tot:o=>o.bikeT,ref:m=>m.bike},
  {id:"rent",t:"Chi phí thuê xe ngoài",f:[["rent","Chi phí thuê (VND)"]],tot:o=>o.rent,ref:m=>m.trOther},
  {id:"wh",t:"Phí thuê kho",f:[["whArea","Diện tích (m²)"],["whPrice","Đơn giá (đ/m²)"]],tot:o=>o.whArea*o.whPrice,ref:m=>m.hireWh},
  {id:"drv",t:"Lương thưởng tài xế",f:[["drvN","Số người"],["drvBase","Lương căn bản"],["drvAllow","Phụ cấp"],["drvBonus","Thưởng"]],tot:o=>o.drvN*((o.drvBase||0)+(o.drvAllow||0)+(o.drvBonus||0)),ref:m=>m.driver,refNote:"Đơn vị: VND"},
  {id:"asst",t:"Lương thưởng phụ xế",f:[["asstN","Số người"],["asstBase","Lương căn bản"],["asstAllow","Phụ cấp"],["asstBonus","Thưởng"]],tot:o=>o.asstN*((o.asstBase||0)+(o.asstAllow||0)+(o.asstBonus||0)),ref:()=>null,opt:true,refNote:"Đơn vị: VND"},
  {id:"promo",t:"Chi phí thúc đẩy bán ra",refNote:"Chi phí dùng để làm chương trình bán hàng (ví dụ: chương trình cho SKU slow moving, chương trình cho mùa thấp điểm…)",f:[["promo","Chi phí (VND)"]],tot:o=>o.promo,ref:m=>(m.mkWs||0)+(m.mkRt||0)+(m.mkOt||0)},
  {id:"credit",t:"Công nợ thị trường",f:[["credit","Số dư công nợ (VND)"]],tot:o=>o.credit,ref:m=>m.credit,req:true}];
function opsTotal(u){const o=S.ops[okey()]||{};if(u.f.some(([k])=>o[k]==null||o[k]===""))return null;return u.tot(o)}
const creditOk=()=>{const c=OPV("credit");return c!=null&&c>CREDIT_MIN};
function opsMissing(){const o=S.ops[okey()]||{};return OPS_UI.filter(u=>!u.opt&&opsTotal(u)==null).map(u=>u.t)}

const OP_SLOT={"petroT": "t", "bikeT": "t", "rent": "t", "promo": "t", "credit": "t", "whArea": "q", "whPrice": "p", "drvN": "q", "drvBase": "p", "drvAllow": "a", "drvBonus": "b", "asstN": "q", "asstBase": "p", "asstAllow": "a", "asstBonus": "b"};
const OP_PH={whArea:"m²",whPrice:"đ/m²",drvN:"người",asstN:"người",drvBase:"VND",asstBase:"VND",drvAllow:"VND",asstAllow:"VND",drvBonus:"VND",asstBonus:"VND"};
function renderOps(){const n=cur(),m=mon(),r=refM(),o=S.ops[okey()]||{},V=r?r.vol:0,SV=soTotal()||V;
  if(!isOpen()){$("#opsOut").innerHTML=`<p class="lead">${mLbl(m)} đã chốt trên PnL Detail. Chọn tháng cần làm P&amp;L (M-1) để nhập chi phí vận hành.</p>`;return}
  const inp=(k,bad)=>`<input class="v${bad?" lowp":""}" inputmode="decimal" data-op="${k}" value="${o[k]!=null&&o[k]!==""?fmt(o[k]):""}" placeholder="${OP_PH[k]||"VND"}">`;
  $("#opsOut").innerHTML=`<div class="scroll"><table class="dt ops"><thead><tr><th class="l">Hạng mục</th><th>Số lượng</th><th>Đơn giá / Lương căn bản</th><th>Phụ cấp</th><th>Thưởng</th><th>Tổng tiền ${mLbl(m)}</th><th>Tham chiếu M-2</th><th>Chênh lệch</th></tr></thead><tbody>
  ${OPS_UI.map(u=>{const t=opsTotal(u),rv=r?u.ref(r):null,bad=u.req&&!creditOk(),d=t!=null&&rv?t-rv:null,cell={};u.f.forEach(([k])=>cell[OP_SLOT[k]]=k);
    const totIsInput=!!cell.t;
    return `<tr class="${bad?"badrow":""}"><td class="l"><b>${u.t}</b>${u.req?'<span class="req" title="Bắt buộc nhập">*</span>':""}${u.refNote?`<small>${u.refNote}</small>`:""}</td>
      ${["q","p","a","b"].map(c=>`<td>${cell[c]?inp(cell[c]):""}</td>`).join("")}
      <td>${totIsInput?inp(cell.t,bad):`<b>${t!=null?fmt(t):'<span class="muted">chưa đủ</span>'}</b>`}${t!=null&&!u.req&&SV?`<small class="muted">${fmt(t/SV)} đ/thùng</small>`:""}</td>
      <td>${rv!=null?fmt(rv):"–"}${rv&&!u.req&&V?`<small class="muted">${fmt(rv/V)} đ/thùng</small>`:""}</td>
      <td>${d!=null?`<span class="${Math.abs(d)/rv>.1?"d-dn":""}">${d>0?"+":""}${fmt(d/rv*100,1)}%</span>`:"–"}</td></tr>`}).join("")}</tbody></table></div>
`;
  const miss=opsMissing();$("#opsMsg").innerHTML=!creditOk()?(OPV("credit")==null?"":`<span class="errtxt">Công nợ thị trường phải lớn hơn 100 triệu đồng.</span>`):miss.length?`<span class="muted">Còn thiếu: ${miss.join(", ")}.</span>`:`<span class="d-up">Đã nhập đủ. Bấm Hoàn tất để chuyển sang Verify data.</span>`;
  $("#opsSubmit").disabled=!creditOk();
}
const soTotal=()=>{const so=soFor(cur().id,mon());return so?Object.values(so).reduce((a,r)=>a+r.SDIS+r.OFF+r.ON+r.NA,0):0};
$("#opsOut").addEventListener("change",e=>{const k=e.target.dataset.op;if(!k)return;const key=okey();S.ops[key]=S.ops[key]||{};const v=e.target.value.trim()===""?null:parse(e.target.value);
  if(v==null)delete S.ops[key][k];else S.ops[key][k]=v;LS.set("ops",S.ops);renderOps();refreshDerived()});
$("#opsSubmit").addEventListener("click",async()=>{if(!creditOk()){renderOps();$("#opsMsg").scrollIntoView({block:"center"});return}
  const key=okey(),btn=$("#opsSubmit");S.ops[key]=S.ops[key]||{};S.ops[key].done=true;LS.set("ops",S.ops);
  btn.disabled=true;btn.textContent="Đang gửi…";
  try{const j=await api("submit",{sub:buildSubmission()});S.ops[key].sentAt=j.at;S.ops[key]._at=j.at;LS.set("ops",S.ops);
    flash(`Đã gửi về hệ thống lúc ${tLbl(j.at)} (lần ${j.n}). Admin đã xem được số liệu.`,"ok");
    if(IS_ADMIN)loadSubs();goTab(IS_ADMIN?"verify":"pl")}
  catch(e){flash("Chưa gửi được về hệ thống: "+e.message+" Số liệu vẫn lưu trên máy này, bấm Hoàn tất để gửi lại.","bad");$("#opsMsg").scrollIntoView({block:"center"})}
  finally{btn.textContent="Hoàn tất";refreshDerived()}});

// push ops + verify finals into the P&L engine fields (open month only)
const ENG_KEYS=["petro","bike","trOther","hireWh","driver"];
S.gshare=LS.get("gshare",{});
function applyShares(){const g=S.gshare[okey()]||{};for(const k in g)set(k+"_s",g[k])}
$("#gisT").addEventListener("change",e=>{const k=e.target.dataset.gshare;if(!k)return;const key=okey();S.gshare[key]=S.gshare[key]||{};
  const v=e.target.value.trim()===""?null:parse(e.target.value);if(v==null)delete S.gshare[key][k];else S.gshare[key][k]=Math.min(Math.max(v,0),100);LS.set("gshare",S.gshare);refreshDerived()});
function applyOps(){const open=isOpen();
  ENG_KEYS.forEach(k=>["_q","_v","_s"].forEach(x=>{const el=$("#"+k+x);if(el)el.readOnly=open}));["mkWs_v","mkRt_v","mkOt_v","mkWs_p","mkRt_p","mkOt_p","credit"].forEach(id=>$("#"+id).readOnly=open);
  if(!open)return;const o=S.ops[okey()]||{};
  const put=(k,q,v)=>{set(k+"_q",q??"");set(k+"_v",v??"");set(k+"_s",v!=null?100:"")};
  const fp=FIN("petro"),fb=FIN("bike"),fd=FIN("driver");
  put("petro",fp!=null||o.petroT!=null?1:null,fp??o.petroT);
  put("bike",fb!=null||o.bikeT!=null?1:null,fb??o.bikeT);
  put("trOther",o.rent!=null?1:null,o.rent);put("hireWh",o.whArea,o.whPrice);
  const dT=opsTotal(OPS_UI[4]),aT=opsTotal(OPS_UI[5])||0,heads=(o.drvN||0)+(o.asstN||0);
  put("driver",heads||null,fd!=null?fd:dT!=null?dT+aT:null);
  set("mkWs_v",o.promo??"");set("mkRt_v","");set("mkOt_v","");["mkWs_p","mkRt_p","mkOt_p"].forEach(id=>set(id,""));
  set("credit",o.credit??"");}

// ---- Verify: fuel
function fuelMonths(n,m){const all=Object.keys(Object.assign({},TMS_SUM_DEFAULT,S.tmsSum||{})).sort().filter(k=>k<=m&&(tmsSum(k)||{})[n.id]);return all.slice(-2)}
function renderVerify(){const n=cur(),m=mon(),o=S.ops[okey()]||{},r=refM();
  if(!isOpen()){$("#vFuel").innerHTML=$("#vStaff").innerHTML=`<p class="lead">${mLbl(m)} đã chốt, không cần verify.</p>`;return}
  const ms=fuelMonths(n,m),npp=opsTotal(OPS_UI[0]);
  const rows=ms.map(k=>{const t=tmsSum(k)[n.id],l=truckLitres(t),p=fuel("truck",k),c=p?l.L*p:null,mm=n.months[k];
    const act=k===m?npp:(mm&&!mm.open?mm.petro:null);return {k,t,l,p,c,act}});
  const cur9=rows.find(x=>x.k===m),fp=FIN("petro"),outs=hist(n,m).every(k=>!(n.months[k].petro>0))&&hist(n,m).some(k=>n.months[k].trOther>0);
  $("#vFuel").innerHTML=`${outs?`<p class="hint"><b style="color:var(--amber)">${n.code} thuê ngoài vận chuyển</b>, chi phí xăng dầu nằm trong mục Thuê xe ngoài. Số tính từ TMS chỉ để tham khảo.</p>`:""}
  <div class="scroll"><table class="dt"><thead><tr><th class="l">Tháng</th><th>Chuyến</th><th>Thùng</th><th>Km</th><th>Số lít (TMS)</th><th>Giá DO (đ/lít)</th><th>Chi phí theo TMS</th><th>Chi phí NPP / PnL</th><th>% NPP / TMS</th><th>Chênh lệch</th></tr></thead><tbody>
  ${rows.map(x=>{const d=x.c!=null&&x.act?x.act-x.c:null;return `<tr${x.k===m?' style="background:var(--green-soft)"':""}><td class="l"><b>${mLbl(x.k)}</b>${x.k===m?"<small>tháng làm P&amp;L</small>":""}</td><td>${fmt(x.t.trips)}</td><td>${fmt(x.t.cases)}</td><td>${fmt(x.l.km)}</td><td>${fmt(x.l.L)}</td>
    <td><input class="v" inputmode="decimal" data-fuel="truck" data-m="${x.k}" value="${x.p?fmt(x.p):""}" placeholder="nhập giá" style="max-width:110px"></td>
    <td>${x.c!=null?fmt(x.c):"–"}</td><td>${x.act!=null?fmt(x.act):'<span class="muted">chưa nhập</span>'}</td><td>${x.c&&x.act!=null?`<b class="${Math.abs(x.act/x.c-1)>.15?"d-dn":""}">${fmt(x.act/x.c*100,1)}%</b>`:"–"}</td><td>${d!=null?`<span class="${Math.abs(d)/x.c>.15?"d-dn":""}">${d>0?"+":""}${fmt(d)} (${d>0?"+":""}${fmt(d/x.c*100,1)}%)</span>`:"–"}</td></tr>`}).join("")}
  </tbody></table></div>
  <div class="vfinal"><span>Final xăng dầu xe tải ${mLbl(m)}</span><input class="v" inputmode="decimal" data-fin="petro" value="${fp!=null?fmt(fp):""}" placeholder="${npp!=null?fmt(npp):"nhập số final"}">
    <span class="muted">Để trống = dùng số NPP nhập${cur9&&cur9.c!=null?` · theo TMS: ${fmt(Math.round(cur9.c))}`:""}</span></div>
  <div class="vfinal"><span>Final xăng dầu xe máy ${mLbl(m)}</span><input class="v" inputmode="decimal" data-fin="bike" value="${FIN("bike")!=null?fmt(FIN("bike")):""}" placeholder="${opsTotal(OPS_UI[1])!=null?fmt(opsTotal(OPS_UI[1])):"nhập số final"}">
    <span class="muted">NPP nhập: ${opsTotal(OPS_UI[1])!=null?fmt(opsTotal(OPS_UI[1])):"–"} · Tham chiếu M-2: ${r?fmt(r.bike||0):"–"}</span></div>
  <details class="sec" style="margin-top:10px"><summary><span class="t">Định mức tiêu hao &amp; hệ số quãng đường</span><span class="tag">lít / 100 km</span></summary><div class="body">
    <div class="toolbar"><label class="chk" for="kmF">Hệ số quãng đường</label><input class="v" id="kmF" inputmode="decimal" value="${fmt(S.kmF,2)}" style="max-width:80px"><span class="muted">× km kế hoạch TMS (TMS_Planned_Distance), bù đường về kho</span></div>
    <div class="scroll"><table class="dt"><tbody>${Object.keys(S.norm).map(c=>`<tr><td class="l">${esc(c)}</td><td><input class="v" inputmode="decimal" data-norm="${esc(c)}" value="${fmt(S.norm[c],1)}" style="max-width:90px"></td></tr>`).join("")}</tbody></table></div>
    <p class="hint">Định mức cho xe chở nặng, chạy nội thành, dừng đỗ nhiều điểm. Số lít = km × hệ số × định mức theo loại xe, đã loại chuyến DSA.</p></div></details>`;
  // staff
  const dT=opsTotal(OPS_UI[4]),aT=opsTotal(OPS_UI[5]),tot=dT!=null?dT+(aT||0):null,heads=(o.drvN||0)+(o.asstN||0),rD=r?r.driver:null;
  const tM=(tmsSum(m)||{})[n.id],tR=r?(tmsSum(addM(m,-1))||{})[n.id]:null,fd=FIN("driver");
  const line=(lbl,N,b,a,bo,t)=>`<tr><td class="l"><b>${lbl}</b></td><td>${N!=null?fmt(N):"–"}</td><td>${b!=null?fmt(b):"–"}</td><td>${a!=null?fmt(a):"–"}</td><td>${bo!=null?fmt(bo):"–"}</td><td><b>${t!=null?fmt(t):"–"}</b></td><td>${t!=null&&N?fmt(t/N):"–"}</td></tr>`;
  $("#vStaff").innerHTML=`<div class="scroll"><table class="dt"><thead><tr><th class="l">${mLbl(m)} · NPP nhập</th><th>Số người</th><th>Lương căn bản</th><th>Phụ cấp</th><th>Thưởng</th><th>Tổng</th><th>BQ / người</th></tr></thead><tbody>
    ${line("Tài xế",o.drvN,o.drvBase,o.drvAllow,o.drvBonus,dT)}${line("Phụ xế",o.asstN,o.asstBase,o.asstAllow,o.asstBonus,aT)}
    <tr style="background:var(--surface-2)"><td class="l"><b>Tổng ${mLbl(m)}</b></td><td>${heads?fmt(heads):"–"}</td><td colspan="3"></td><td><b>${tot!=null?fmt(tot):"–"}</b></td><td>${tot!=null&&heads?fmt(tot/heads):"–"}</td></tr>
    <tr><td class="l"><b>${r?mLbl(addM(m,-1)):"M-2"} · PnL Detail</b><small>Delivery &amp; Driver</small></td><td>${tR?fmt(tR.drivers)+" <small class=\"muted\">TMS</small>":"–"}</td><td colspan="3"></td><td><b>${rD!=null?fmt(rD):"–"}</b></td><td>${rD&&tR&&tR.driverDays?fmt(rD/(tR.driverDays/26)):"–"}<small class="muted"> /FTE</small></td></tr>
    <tr><td class="l"><b>Chênh lệch</b></td><td></td><td colspan="3"></td><td>${tot!=null&&rD?`<span class="${Math.abs(tot-rD)/rD>.1?"d-dn":""}">${tot-rD>0?"+":""}${fmt(tot-rD)} (${tot-rD>0?"+":""}${fmt((tot-rD)/rD*100,1)}%)</span>`:"–"}</td><td></td></tr>
  </tbody></table></div>
  <p class="hint">Tài xế có giao hàng trên TMS: ${tR?`${mLbl(addM(m,-1))} ${fmt(tR.drivers)} người (${fmt(tR.driverDays/26,1)} FTE)`:"–"} · ${tM?`${mLbl(m)} ${fmt(tM.drivers)} người (${fmt(tM.driverDays/26,1)} FTE)`:"–"}. Chi phí/thùng ${mLbl(m)}: ${tot!=null&&tM?fmt(tot/tM.cases):"–"} đ · ${r?mLbl(addM(m,-1)):"M-2"}: ${rD&&tR?fmt(rD/tR.cases):"–"} đ.</p>
  <div class="vfinal"><span>Final chi phí nhân sự giao hàng ${mLbl(m)}</span><input class="v" inputmode="decimal" data-fin="driver" value="${fd!=null?fmt(fd):""}" placeholder="${tot!=null?fmt(tot):"nhập số final"}"><span class="muted">Để trống = dùng số NPP nhập</span></div>`;
}
document.addEventListener("change",e=>{const el=e.target;if(!el.closest||!el.closest("#tab-verify"))return;
  if(el.dataset.fin){const k=okey();S.fin[k]=S.fin[k]||{};const v=el.value.trim()===""?null:parse(el.value);if(v==null)delete S.fin[k][el.dataset.fin];else S.fin[k][el.dataset.fin]=v;LS.set("fin",S.fin);refreshDerived();return}
  if(el.dataset.fuel){S.fuel=S.fuel||{};S.fuel[el.dataset.fuel]=S.fuel[el.dataset.fuel]||{};const v=parse(el.value);if(v)S.fuel[el.dataset.fuel][el.dataset.m]=v;else delete S.fuel[el.dataset.fuel][el.dataset.m];LS.set("fuel",S.fuel);refreshDerived();return}
  if(el.dataset.norm){S.norm[el.dataset.norm]=parse(el.value)||0;LS.set("norm2",S.norm);refreshDerived();return}
  if(el.id==="kmF"){S.kmF=parse(el.value)||1;LS.set("kmF",S.kmF);refreshDerived();return}
  if(el.dataset.fws||el.dataset.frt){const k=okey();S.fin[k]=S.fin[k]||{};const P=S.fin[k].prices=S.fin[k].prices||{};const sku=el.dataset.fws||el.dataset.frt,f=el.dataset.fws?"ws":"rt";P[sku]=P[sku]||{};
    const v=el.value.trim()===""?null:parse(el.value);if(v==null)delete P[sku][f];else P[sku][f]=v;LS.set("fin",S.fin);refreshDerived()}});
const finPrice=(sku,f)=>(((FIN("prices")||{})[sku])||{})[f]??null;

// ---- P&L checklist
function checklist(){if(!isOpen())return "";const so=soRevenue(),miss=opsMissing(),items=[];
  const pc=so.V?so.src.input/so.V*100:0;
  items.push([pc>=95?"ok":"warn",`Giá bán: đã collect ${fmt(pc,0)}% sản lượng SO`]);
  items.push([miss.length?"warn":"ok",miss.length?`Chi phí vận hành còn thiếu: ${miss.join(", ")}`:"Chi phí vận hành: đã nhập đủ"]);
  items.push([creditOk()?"ok":"bad",creditOk()?`Công nợ thị trường: ${fmt(OPV("credit"))} đ`:(OPV("credit")==null?"Chưa nhập công nợ thị trường (bắt buộc)":"Công nợ thị trường chưa đạt mức tối thiểu 100 triệu")]);
  const fc=["petro","bike","driver"].filter(k=>FIN(k)!=null).length;if(IS_ADMIN)items.push([fc===3?"ok":"warn",`Verify data: đã chốt ${fc}/3 mục chi phí (xăng xe tải, xe máy, nhân sự)`]);
  const sent=(S.ops[okey()]||{}).sentAt;items.push([sent?"ok":"warn",sent?`Đã gửi về hệ thống lúc ${tLbl(sent)}`:"Chưa gửi về hệ thống: bấm Hoàn tất ở tab Chi phí vận hành"]);
  const usingRef=["depTruck_v","depFork_v","depTools_v","fixed"].filter(id=>isBlank(id)&&$("#"+id).dataset.ref);
  if(usingRef.length)items.push(["warn",`Khấu hao / tài sản còn lại đang lấy số ${mLbl(addM(mon(),-1))}: nhập số tháng này ở mục 2 và 4`]);
  return `<div class="sugg" style="margin:12px 0 0"><h3>Tiến độ hoàn thiện ${mLbl(mon())}</h3>${items.map(i=>`<div class="sitem"><span class="dot ${i[0]}">${i[0]==="ok"?"✓":"!"}</span><span>${i[1]}</span></div>`).join("")}</div>`}

// ---- orchestration
function refreshDerived(){renderOps();applyOps();applyShares();renderVerify();renderSoSummary();renderGis();renderCmp();render(calc())}
function refreshAll(){renderPrice();renderChan();renderSrc();refreshDerived()}
function goTab(t){if(!tabOk(t))t="pl";document.querySelectorAll(".tabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.tab===t));
  document.querySelectorAll(".tabpane").forEach(p=>p.hidden=p.id!=="tab-"+t);window.scrollTo({top:0})}
// Giữ con trỏ khi bảng được vẽ lại sau khi đổi giá trị: nhấn Tab sang ô kế tiếp thì không bị đưa về đầu trang
// Ô nằm trong mục đang đóng (details chưa mở) không nhận được focus nên bỏ qua
const tabStop=x=>!x.disabled&&!x.readOnly&&x.type!=="hidden"&&x.type!=="file"&&x.offsetParent!==null&&!x.closest("details:not([open])");
const paneInputs=pane=>[...pane.querySelectorAll("input")].filter(tabStop);
let _tabNext=null;
document.addEventListener("change",e=>{const el=e.target;if(!el||el.tagName!=="INPUT")return;const pane=el.closest(".tabpane");if(!pane)return;
  _tabNext={pane,i:paneInputs(pane).indexOf(el)};setTimeout(restoreTabFocus,0)},true);
function restoreTabFocus(){const s=_tabNext;_tabNext=null;if(!s||s.i<0)return;
  const a=document.activeElement;if(a&&a!==document.body&&a.isConnected)return;
  const next=paneInputs(s.pane)[s.i+1];if(next)next.focus();}
// Nhấn Tab ở phần tử cuối của tab thì sang tab kế tiếp (ô trống đầu tiên); hết tab thì quay vòng về tab đầu, không rơi về đầu trang
const paneFocusables=pane=>[...pane.querySelectorAll("input,select,textarea,button")].filter(tabStop);
const tabHasInputs=t=>{const p2=document.getElementById("tab-"+t);return !!(p2&&p2.querySelector("input:not([readonly]):not([disabled]):not([type=hidden]):not([type=file])"))};
// Enter trong ô nhập hoạt động như Tab: chuyển sang ô kế tiếp
document.addEventListener("keydown",e=>{const el=e.target;if(!el||!el.closest)return;
  const isTab=e.key==="Tab"&&!e.shiftKey;
  const isEnter=e.key==="Enter"&&el.tagName==="INPUT"&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.shiftKey;
  if(!isTab&&!isEnter)return;
  const pane=el.closest(".tabpane");if(!pane)return;const f=paneFocusables(pane),idx=f.indexOf(el);if(idx<0)return;
  // Ô giữa tab: tự chuyển focus sau khi bảng vẽ lại (ô kế tiếp có thể bị thay thế khi đổi giá trị)
  if(idx<f.length-1){e.preventDefault();el.blur();setTimeout(()=>{const g=paneFocusables(pane);const t=g[idx+1]||g[g.length-1];if(t)t.focus()},0);return}
  const btns=[...document.querySelectorAll(".tabs button")].filter(b=>!b.hidden);
  const ci=btns.findIndex(b=>b.dataset.tab===pane.id.replace("tab-",""));
  const order=[...btns.slice(ci+1),...btns.slice(0,ci+1)];
  const nb=order.find(b=>b.dataset.tab!==pane.id.replace("tab-","")&&tabHasInputs(b.dataset.tab));
  if(!nb)return;e.preventDefault();el.blur();nb.click()});
// Chuyển tab bằng chuột: con trỏ nhảy vào ô trống đầu tiên của tab đó
function focusNext(t){const pane=document.getElementById("tab-"+t);if(!pane)return;
  const els=[...pane.querySelectorAll("input.v,input[type=text],input[type=number]")].filter(tabStop);
  const target=els.find(e=>e.value.trim()==="")||els[0];if(target)try{target.focus({preventScroll:true});target.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){}}
document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>{goTab(b.dataset.tab);focusNext(b.dataset.tab)}));
$("#selNpp").addEventListener("change",()=>{fillMonths(mon());loadNpp()});
$("#selZone").addEventListener("change",()=>{fillNpp(+$("#selNpp").value);fillMonths(mon());loadNpp()});
$("#selMon").addEventListener("change",loadNpp);
$("#f").addEventListener("submit",e=>{e.preventDefault();render(calc());const o=$("#out");o.classList.remove("flash");void o.offsetWidth;o.classList.add("flash");
  if(window.innerWidth<900)o.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})});
$("#reset").onclick=loadNpp;
fillMonths();loadNpp();

// ---- Đồng bộ bài nộp với hệ thống (Google Apps Script → Google Sheet)
const tLbl=t=>new Date(t).toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"});
function flash(msg,kind){const el=$("#opsMsg"),x=$("#xMsg"),h=`<span class="${kind==="bad"?"errtxt":""}">${esc(msg)}</span>`;if(el)el.innerHTML=h;if(x)x.textContent=msg}
async function api(action,body){
  if(!API_URL)throw new Error("Hệ thống chưa được cấu hình (thiếu API_URL).");
  if(!window.__AUTH)throw new Error("Phiên đăng nhập cũ, hãy đăng xuất và đăng nhập lại.");
  const r=await fetch(API_URL,{method:"POST",body:JSON.stringify({action,auth:window.__AUTH,...body})});
  if(!r.ok)throw new Error("Máy chủ trả lỗi "+r.status+".");
  const j=await r.json();if(!j.ok)throw new Error(j.error||"Lỗi máy chủ.");return j}
function buildSubmission(){const n=cur(),key=okey(),o=S.ops[key]||{},r=calc(),costs={},pr=S.prices[pkey()]||{};
  OPS_UI.forEach(u=>{if(u.id!=="credit")costs[u.id]=u.f.some(([k])=>o[k]==null||o[k]==="")?null:u.tot(o)});
  const ops={...o};delete ops.sentAt;delete ops._at;
  return{key,disId:n.id,code:n.code,area:n.area,month:mon(),
    summary:{vol:r.V,rev:r.rev,opex:r.opex,pat:r.pat,roi:r.roi,credit:o.credit,costs,skus:Object.keys(pr).length},
    data:{ops,prices:pr}}}
// Nạp bài nộp vào state cục bộ (chỉ khi mới hơn bản đang có)
function applySub(x,force){const loc=S.ops[x.key]||{},seen=Math.max(loc._at||0,loc.sentAt||0);
  if(!force&&x.at<=seen)return false;
  S.ops[x.key]={...(x.data.ops||{}),done:true,_at:x.at,sentAt:x.at};S.prices[x.key]=x.data.prices||{};return true}
let SUBS=[];
async function loadSubs(){if(!IS_ADMIN)return;const msg=$("#subMsg");msg.textContent="Đang tải…";
  try{const j=await api("list",{});SUBS=j.items||[];let k=0;SUBS.forEach(x=>{if(applySub(x))k++});
    if(k){LS.set("ops",S.ops);LS.set("prices",S.prices);refreshAll()}
    msg.textContent=`${SUBS.length} bài nộp · cập nhật lúc ${tLbl(Date.now())}${k?` · vừa nạp ${k} bài mới vào tool`:""}`}
  catch(e){msg.innerHTML=`<span class="errtxt">${esc(e.message)}</span>`}
  renderSubs()}
function renderSubs(){if(!IS_ADMIN)return;const sel=$("#subMon"),ms=[...new Set(SUBS.map(x=>x.month).concat([mon()]))].sort().reverse();
  const keep=sel.value||ms[0]||"";sel.innerHTML=ms.length?ms.map(m=>`<option value="${m}">${mLbl(m)}</option>`).join(""):`<option value="">Chưa có</option>`;
  sel.value=ms.includes(keep)?keep:(ms[0]||"");const m=sel.value,z=$("#subZone")?$("#subZone").value:"",rows=SUBS.filter(x=>x.month===m&&(!z||zoneOfDis(x.disId)===z)).sort((a,b)=>b.at-a.at);
  const sent=new Set(rows.map(x=>x.disId)),pending=NPP.filter(n=>n.months[m]&&n.months[m].open&&!sent.has(n.id)&&(!z||zoneOf(n)===z));
  const c=$("#subCnt");c.textContent=rows.length;c.hidden=!rows.length;
  const f=v=>v===""||v==null?"–":fmt(v);
  const tot=rows.length+pending.length;
  $("#subT").innerHTML=`${tot?`<caption class="l" style="text-align:left;font-weight:700;padding:6px 0 10px">${rows.length}/${tot} NPP đã nộp ${mLbl(m)}</caption>`:""}<thead><tr><th class="l">NPP</th><th>Gửi lúc</th><th>Lần</th><th>Sản lượng</th><th>Chi phí vận hành</th><th>PAT</th><th>ROI</th><th>Công nợ</th><th></th></tr></thead><tbody>${
    rows.map(x=>`<tr><td class="l"><b>${esc(x.code)}</b> <span class="muted">${esc(x.area||"")}</span>${x.by==="admin"?' <span class="pill warn">Admin sửa</span>':""}</td>
      <td>${tLbl(x.at)}</td><td>${x.n}</td><td>${f(x.summary.vol)}</td><td>${f(x.summary.opex)}</td><td>${f(x.summary.pat)}</td>
      <td>${x.summary.roi===""||x.summary.roi==null?"–":fmt(x.summary.roi,2)+"%"}</td><td>${f(x.summary.credit)}</td>
      <td><button type="button" data-sub="${esc(x.key)}">Xem</button></td></tr>`).join("")}${
    pending.map(n=>`<tr class="miss"><td class="l"><b>${esc(n.code)}</b> <span class="muted">${esc(n.area||"")}</span></td><td colspan="8" class="l muted">Chưa nộp</td></tr>`).join("")}</tbody>`}
$("#subT").addEventListener("click",e=>{const k=e.target.dataset&&e.target.dataset.sub;if(!k)return;const x=SUBS.find(s=>s.key===k);if(!x)return;
  applySub(x,true);LS.set("ops",S.ops);LS.set("prices",S.prices);
  const i=NPP.findIndex(n=>n.id===x.disId);if(i<0)return;setNpp(i);fillMonths(x.month);loadNpp();refreshAll();goTab("pl")});
$("#subRefresh").onclick=loadSubs;$("#subMon").onchange=renderSubs;$("#subZone").onchange=renderSubs;
if(IS_ADMIN&&API_URL)loadSubs();else if(IS_ADMIN)$("#subMsg").textContent="Chưa cấu hình API_URL nên chưa nhận được bài nộp.";

// Ẩn tab ngoài phạm vi quyền
document.querySelectorAll(".tabs button").forEach(b=>{if(!tabOk(b.dataset.tab))b.hidden=true});
goTab("pl");
