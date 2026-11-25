let API="", PIN="", PAGE="dashboard", CACHE={dashboard:{},customers:[],quotations:[],invoices:[],jobs:[],services:[]};
const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(window.__wfToast);window.__wfToast=setTimeout(()=>t.classList.remove("show"),2800)}
function money(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0))}
function dateText(s){if(!s)return "Belum ditentukan";const d=new Date(s);return isNaN(d.getTime())?String(s):d.toLocaleString("id-ID",{dateStyle:"medium",timeStyle:String(s).length>10?"short":undefined})}
function inputDateTime(v){return String(v||"").replace(" ","T").slice(0,16)}
function customerName(id){return CACHE.customers.find(c=>String(c.id)===String(id))?.name||"Pelanggan tidak ditemukan"}
function apiJSONP(params){
 return new Promise((resolve,reject)=>{
  if(!API)return reject(new Error("URL Apps Script belum diatur."));
  const cb="wfp_"+Date.now()+"_"+Math.floor(Math.random()*1e6),script=document.createElement("script");
  const timer=setTimeout(()=>{cleanup();reject(new Error("Koneksi timeout. Periksa URL Apps Script."))},20000);
  function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
  window[cb]=data=>{cleanup();if(!data||!data.ok)reject(new Error(data?.error||"Permintaan gagal"));else resolve(data)};
  script.onerror=()=>{cleanup();reject(new Error("Tidak dapat menghubungi Apps Script."))};
  script.src=API+"?"+new URLSearchParams({...params,callback:cb}).toString();
  document.body.appendChild(script);
 });
}
async function call(action,data={}){return apiJSONP({action,pin:PIN,...data})}
$("apiUrl").value=localStorage.getItem("wf_api")||((window.WFP_API_URL&&!String(window.WFP_API_URL).includes("PASTE_"))?window.WFP_API_URL:"");
$("pin").value=sessionStorage.getItem("wf_pin")||"";
$("connect").onclick=async()=>{
 API=$("apiUrl").value.trim();PIN=$("pin").value.trim();
 if(!API||!PIN){$("loginError").textContent="URL Apps Script dan PIN wajib diisi.";return}
 if(!/\/exec$/.test(API)){$("loginError").textContent="URL harus berakhiran /exec.";return}
 $("connect").disabled=true;$("connect").textContent="Menghubungkan…";
 try{
  await call("bootstrap");
  localStorage.setItem("wf_api",API);sessionStorage.setItem("wf_pin",PIN);
  $("login").classList.add("hidden");$("app").classList.remove("hidden");
  await loadAll();
 }catch(e){$("loginError").textContent=e.message}
 finally{$("connect").disabled=false;$("connect").innerHTML='Masuk ke WorkFlow Pro <span>→</span>'}
};
$("disconnect").onclick=()=>{sessionStorage.removeItem("wf_pin");PIN="";$("app").classList.add("hidden");$("login").classList.remove("hidden")};
$("closeModal").onclick=closeModal;
$("refresh").onclick=loadAll;
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("primaryAction").onclick=()=>createForPage();
if($("apiUrl").value&&$("pin").value){API=$("apiUrl").value;PIN=$("pin").value;$("connect").click()}

function go(page){PAGE=page;render()}
function closeModal(){$("modal").classList.add("hidden");$("modalForm").onsubmit=null}
function openModal(title,html,submitHandler){
 $("modalTitle").textContent=title;$("modalForm").innerHTML=html;$("modal").classList.remove("hidden");
 $("modalForm").onsubmit=submitHandler;
}
async function loadAll(){
 try{
  const actions=["dashboard","listCustomers","listQuotations","listInvoices","listJobs","listServices"];
  const [d,c,q,i,j,s]=await Promise.all(actions.map(a=>call(a)));
  CACHE={dashboard:d.data||{},customers:c.data||[],quotations:q.data||[],invoices:i.data||[],jobs:j.data||[],services:s.data||[]};
  render();
 }catch(e){toast(e.message)}
}
function render(){
 const meta={
  dashboard:["Beranda","OVERVIEW","Ringkasan aktivitas bisnis dan pekerjaan hari ini."],
  jobs:["Work Order","OPERASIONAL","Atur jadwal, teknisi, prioritas, dan progres pekerjaan."],
  quotations:["Penawaran","DOKUMEN PENJUALAN","Buat dan kelola penawaran harga pelanggan."],
  invoices:["Invoice","PEMBAYARAN","Pantau tagihan dan status pembayaran."],
  customers:["Pelanggan","DATABASE PELANGGAN","Kelola data pelanggan dan kontak."],
  services:["Katalog jasa","LAYANAN","Kelola jenis layanan dan harga standar."]
 }[PAGE]||["Beranda","WORKSPACE","Kelola operasional bisnis."];
 $("pageName").textContent=meta[0];$("heading").textContent=meta[0];$("pageEyebrow").textContent=meta[1];$("pageSubtitle").textContent=meta[2];
 document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===PAGE));
 const actionLabels={dashboard:"＋ Buat work order",jobs:"＋ Buat work order",quotations:"＋ Buat penawaran",invoices:"＋ Buat invoice",customers:"＋ Tambah pelanggan",services:"＋ Tambah layanan"};
 $("primaryAction").textContent=actionLabels[PAGE]||"＋ Tambah data";
 $("pageBody").innerHTML=({
  dashboard:dashboardHTML,jobs:jobsHTML,quotations:quotationsHTML,invoices:invoicesHTML,customers:customersHTML,services:servicesHTML
 }[PAGE]||dashboardHTML)();
}
function dashboardHTML(){
 const d=CACHE.dashboard||{},jobs=CACHE.jobs.filter(j=>!["Selesai","Dibatalkan"].includes(j.status)).slice(0,4);
 const due=CACHE.invoices.filter(x=>!["Lunas","Dibatalkan"].includes(x.status)).reduce((n,x)=>n+Math.max(0,Number(x.total||0)-Number(x.paid||0)),0);
 return `
 <section class="welcome-card">
  <div><span class="welcome-kicker">WORKSPACE AKTIF</span><h2>Halo, Admin! 👋</h2><p>Semua pekerjaan bisnis kamu, lebih rapi dalam satu tempat.</p></div>
  <div class="welcome-art"><span>W</span><i>✦</i></div>
  <button class="welcome-cta" onclick="go('jobs')">Lihat jadwal pekerjaan <b>→</b></button>
 </section>
 <section class="quick-section"><div class="section-heading"><h2>Akses cepat</h2><small>Yang sering kamu gunakan</small></div>
  <div class="quick-grid">
   <button class="quick-action" onclick="go('jobs')"><span class="quick-icon green">▦</span><b>Work Order</b><small>Jadwal teknisi</small></button>
   <button class="quick-action" onclick="go('quotations')"><span class="quick-icon blue">▤</span><b>Penawaran</b><small>Buat quotation</small></button>
   <button class="quick-action" onclick="go('invoices')"><span class="quick-icon orange">▧</span><b>Invoice</b><small>Tagihan pelanggan</small></button>
   <button class="quick-action" onclick="go('customers')"><span class="quick-icon purple">♙</span><b>Pelanggan</b><small>Data kontak</small></button>
   <button class="quick-action" onclick="go('services')"><span class="quick-icon teal">◇</span><b>Katalog jasa</b><small>Layanan & harga</small></button>
   <a class="quick-action quick-link" href="booking.html" target="_blank" rel="noopener"><span class="quick-icon mint">＋</span><b>Booking online</b><small>Halaman pelanggan</small></a>
  </div>
 </section>
 <section class="stats-grid">
  <div class="stat-card"><span class="stat-symbol green">♙</span><small>Total pelanggan</small><strong>${d.customers||CACHE.customers.length}</strong></div>
  <div class="stat-card"><span class="stat-symbol blue">▤</span><small>Penawaran</small><strong>${d.quotations||CACHE.quotations.length}</strong></div>
  <div class="stat-card"><span class="stat-symbol orange">▧</span><small>Invoice</small><strong>${d.invoices||CACHE.invoices.length}</strong></div>
  <div class="stat-card"><span class="stat-symbol purple">▦</span><small>Pekerjaan aktif</small><strong>${d.activeJobs||jobs.length}</strong></div>
 </section>
 <section class="dashboard-grid">
  <div class="app-panel"><div class="section-heading"><div><h2>Prioritas pekerjaan</h2><small>Urutan pengerjaan otomatis</small></div><button class="text-action" onclick="go('jobs')">Lihat semua →</button></div>
   ${jobs.length?jobs.map((j,i)=>jobMiniHTML(j,i)).join(""):'<div class="empty">Belum ada pekerjaan aktif.</div>'}
  </div>
  <div class="app-panel finance-panel"><div class="section-heading"><div><h2>Ringkasan keuangan</h2><small>Posisi tagihan saat ini</small></div><span class="finance-icon">↗</span></div>
   <div class="finance-total">${money(due)}</div><small class="muted">Total sisa tagihan</small>
   <div class="finance-line"><span>Sudah diterima</span><b>${money(d.revenue||0)}</b></div>
   <div class="finance-line"><span>Tagihan berjalan</span><b>${money(due)}</b></div>
   <button class="btn soft-green full" onclick="go('invoices')">Buka invoice</button>
  </div>
 </section>`;
}
function jobMiniHTML(j,i){return `<div class="job-mini"><div class="job-order">${i+1}</div><div class="job-mini-info"><b>${escapeHTML(j.title)}</b><small>${escapeHTML(j.number)} · ${escapeHTML(customerName(j.customerId))}</small><small>◷ ${escapeHTML(dateText(j.scheduledStart))}</small></div><span class="status-chip ${priorityClass(j.priority)}">${escapeHTML(j.priority||"Normal")}</span></div>`}
function priorityClass(p){return p==="Urgent"?"urgent":p==="Tinggi"?"high":p==="Selesai"?"done":""}
function actionButton(label,fn,kind="soft"){return `<button class="btn ${kind}" onclick="${fn}">${label}</button>`}
function customersHTML(){
 return `<div class="list-toolbar"><div class="search-box">⌕ <input id="listSearch" placeholder="Cari nama, telepon, perusahaan…" oninput="filterCards()"></div><span class="count-label">${CACHE.customers.length} pelanggan</span></div>
 <div class="entity-list" id="entityList">${CACHE.customers.map(c=>`<article class="entity-card" data-search="${escapeHTML([c.name,c.company,c.phone,c.whatsapp,c.email].join(" ").toLowerCase())}">
  <div class="entity-avatar">${escapeHTML((c.name||"P").trim().charAt(0).toUpperCase())}</div><div class="entity-main"><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.company||"Pelanggan")}</small><small>${escapeHTML(c.whatsapp||c.phone||c.email||"Belum ada kontak")}</small></div>
  <div class="entity-actions"><button class="mini-btn" onclick="editRecord('customer','${c.id}')">Edit</button><button class="mini-btn danger" onclick="deleteRecord('customer','${c.id}')">Hapus</button></div>
 </article>`).join("")||'<div class="empty">Belum ada pelanggan. Tambahkan pelanggan pertama kamu.</div>'}</div>`;
}
function quotationsHTML(){
 return `<div class="list-toolbar"><div class="search-box">⌕ <input id="listSearch" placeholder="Cari nomor atau judul penawaran…" oninput="filterCards()"></div><span class="count-label">${CACHE.quotations.length} dokumen</span></div>
 <div class="document-list" id="entityList">${CACHE.quotations.map(q=>`<article class="document-card" data-search="${escapeHTML((q.number+" "+q.title+" "+customerName(q.customerId)).toLowerCase())}">
  <div class="document-top"><span class="doc-type quotation-type">PENAWARAN</span><span class="status-chip">${escapeHTML(q.status)}</span></div>
  <div class="document-number">${escapeHTML(q.number)}</div><h3>${escapeHTML(q.title)}</h3><p>${escapeHTML(customerName(q.customerId))} · ${escapeHTML(q.date||"")}</p>
  <div class="document-total"><small>Total penawaran</small><b>${money(q.total)}</b></div>
  <div class="document-actions"><button class="btn soft-green" onclick="editRecord('quotation','${q.id}')">Edit dokumen</button><button class="btn soft" onclick="pdfDoc('quotation','${q.id}')">Unduh PDF</button><button class="btn soft danger-text" onclick="deleteRecord('quotation','${q.id}')">Hapus</button></div>
 </article>`).join("")||'<div class="empty">Belum ada quotation. Buat penawaran pertamamu.</div>'}</div>`;
}
function invoicesHTML(){
 return `<div class="list-toolbar"><div class="search-box">⌕ <input id="listSearch" placeholder="Cari nomor atau judul invoice…" oninput="filterCards()"></div><span class="count-label">${CACHE.invoices.length} dokumen</span></div>
 <div class="document-list" id="entityList">${CACHE.invoices.map(x=>`<article class="document-card" data-search="${escapeHTML((x.number+" "+x.title+" "+customerName(x.customerId)).toLowerCase())}">
  <div class="document-top"><span class="doc-type invoice-type">INVOICE</span><span class="status-chip ${x.status==="Lunas"?"paid":""}">${escapeHTML(x.status)}</span></div>
  <div class="document-number">${escapeHTML(x.number)}</div><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(customerName(x.customerId))} · Jatuh tempo ${escapeHTML(x.dueDate||"—")}</p>
  <div class="document-total"><small>Total tagihan</small><b>${money(x.total)}</b></div>
  <div class="invoice-paid-line"><span>Dibayar ${money(x.paid||0)}</span><span>Sisa ${money(Math.max(0,Number(x.total||0)-Number(x.paid||0)))}</span></div>
  <div class="document-actions"><button class="btn soft-green" onclick="editRecord('invoice','${x.id}')">Edit dokumen</button><button class="btn soft" onclick="pdfDoc('invoice','${x.id}')">PDF</button><button class="btn soft" onclick="shareInvoice('${x.publicToken||''}')">Link bayar</button><button class="btn soft" onclick="payment('${x.id}')">Catat bayar</button><button class="btn soft danger-text" onclick="deleteRecord('invoice','${x.id}')">Hapus</button></div>
 </article>`).join("")||'<div class="empty">Belum ada invoice. Buat invoice pertamamu.</div>'}</div>`;
}
function jobsHTML(){
 const jobs=CACHE.jobs||[];
 return `<div class="jobs-banner"><div><b>Kapasitas harian</b><small>Maksimal 2 pekerjaan per hari</small></div><a href="booking.html" target="_blank" rel="noopener">Lihat kalender booking ↗</a></div>
 <div class="list-toolbar"><div class="search-box">⌕ <input id="listSearch" placeholder="Cari work order atau pelanggan…" oninput="filterCards()"></div><span class="count-label">${jobs.length} work order</span></div>
 <div class="job-list" id="entityList">${jobs.map((j,i)=>`<article class="work-card" data-search="${escapeHTML((j.number+" "+j.title+" "+customerName(j.customerId)).toLowerCase())}">
  <div class="work-card-head"><div class="work-rank">#${j.sequence||i+1}</div><div class="work-title"><b>${escapeHTML(j.title)}</b><small>${escapeHTML(j.number)} · ${escapeHTML(customerName(j.customerId))}</small></div><span class="status-chip ${priorityClass(j.priority)}">${escapeHTML(j.priority||"Normal")}</span></div>
  <div class="work-meta"><span>◷ ${escapeHTML(dateText(j.scheduledStart))}</span><span>♙ ${escapeHTML(j.assignedTo||"Belum ditugaskan")}</span></div>
  <div class="progress-label"><span>${escapeHTML(j.status)}</span><b>${Number(j.progress||0)}%</b></div><div class="progress-track"><i style="width:${Math.max(0,Math.min(100,Number(j.progress||0)))}%"></i></div>
  <div class="work-actions"><button class="btn soft-green" onclick="editRecord('job','${j.id}')">Edit work order</button><button class="btn soft" onclick="confirmWorkOrder('${j.id}')">Konfirmasi</button><button class="btn soft" onclick="manageChecklist('${j.id}')">Checklist & foto</button><button class="btn soft danger-text" onclick="deleteRecord('job','${j.id}')">Hapus</button></div>
 </article>`).join("")||'<div class="empty">Belum ada pekerjaan. Buat work order atau tunggu booking pelanggan.</div>'}</div>`;
}
function servicesHTML(){
 return `<div class="list-toolbar"><div class="search-box">⌕ <input id="listSearch" placeholder="Cari layanan…" oninput="filterCards()"></div><span class="count-label">${CACHE.services.length} layanan</span></div>
 <div class="service-grid" id="entityList">${CACHE.services.map(s=>`<article class="service-card" data-search="${escapeHTML((s.name+" "+s.description).toLowerCase())}"><span class="service-symbol">◇</span><div><b>${escapeHTML(s.name)}</b><small>${escapeHTML(s.description||s.unit||"Layanan teknis")}</small></div><strong>${money(s.price)}</strong><div class="service-actions"><span class="status-chip ${String(s.active)==="FALSE"?"":"paid"}">${String(s.active)==="FALSE"?"Nonaktif":"Aktif"}</span><button class="mini-btn" onclick="editRecord('service','${s.id}')">Edit</button><button class="mini-btn danger" onclick="deleteRecord('service','${s.id}')">Hapus</button></div></article>`).join("")||'<div class="empty">Belum ada katalog layanan.</div>'}</div>`;
}
window.filterCards=()=>{const q=($("listSearch")?.value||"").toLowerCase();$("entityList")?.querySelectorAll("[data-search]").forEach(el=>el.style.display=el.dataset.search.includes(q)?"":"none")};
function createForPage(){const type=({dashboard:"job",jobs:"job",quotations:"quotation",invoices:"invoice",customers:"customer",services:"service"})[PAGE]||"job";openEditor(type,null)}

function fieldHTML(label,name,value="",type="text",required=false,placeholder=""){
 return `<label class="field">${label}<input name="${name}" type="${type}" value="${escapeHTML(value)}" ${required?"required":""} ${placeholder?`placeholder="${escapeHTML(placeholder)}"`:""}></label>`;
}
function textareaHTML(label,name,value="",rows=3){return `<label class="field">${label}<textarea name="${name}" rows="${rows}">${escapeHTML(value)}</textarea></label>`}
function selectHTML(label,name,options,value="",required=true){
 return `<label class="field">${label}<select name="${name}" ${required?"required":""}>${options.map(o=>`<option value="${escapeHTML(o[0])}" ${String(o[0])===String(value)?"selected":""}>${escapeHTML(o[1])}</option>`).join("")}</select></label>`;
}
function customerOptions(selected){return [["","Pilih pelanggan"],...CACHE.customers.map(c=>[c.id,c.name])]}
function itemHTML(item={},index=0){
 return `<div class="document-item" data-index="${index}">
  <div class="item-heading"><b>Item ${index+1}</b><button type="button" class="remove-item" onclick="this.closest('.document-item').remove()">Hapus item</button></div>
  <label class="field item-description">Deskripsi pekerjaan / barang<input data-field="description" value="${escapeHTML(item.description||"")}" required placeholder="Contoh: Instalasi CCTV 4 channel"></label>
  <div class="item-fields">
   <label class="field">Jumlah<input data-field="qty" type="number" min="0.01" step="0.01" value="${escapeHTML(item.qty??1)}" required></label>
   <label class="field">Satuan<input data-field="unit" value="${escapeHTML(item.unit||"unit")}" required></label>
   <label class="field">Harga satuan<input data-field="unitPrice" type="number" min="0" step="1" value="${escapeHTML(item.unitPrice??0)}" required></label>
   <div class="item-subtotal"><small>Jumlah</small><b>${money(Number(item.qty||0)*Number(item.unitPrice||0))}</b></div>
  </div>
 </div>`;
}
function openEditor(type,id=null){
 const collections={customer:CACHE.customers,service:CACHE.services,job:CACHE.jobs,quotation:CACHE.quotations,invoice:CACHE.invoices};
 const row=id?(collections[type]||[]).find(x=>String(x.id)===String(id)):null;
 if(id&&!row){toast("Data tidak ditemukan.");return}
 const edit=!!row,customerOpts=customerOptions(row?.customerId||"");
 let title="",html="";
 if(type==="customer"){
  title=edit?"Edit seluruh data pelanggan":"Tambah pelanggan";
  html=`<div class="editor-section"><h3>Informasi pelanggan</h3><div class="form-grid">
   ${fieldHTML("Nama pelanggan *","name",row?.name||"","text",true)}
   ${fieldHTML("Perusahaan","company",row?.company||"")}
   ${fieldHTML("Email","email",row?.email||"","email")}
   ${fieldHTML("Nomor telepon","phone",row?.phone||"","tel")}
   ${fieldHTML("WhatsApp","whatsapp",row?.whatsapp||"","tel")}
   ${fieldHTML("Alamat","address",row?.address||"")}
  </div>${textareaHTML("Catatan","notes",row?.notes||"")}</div>`;
 }
 if(type==="service"){
  title=edit?"Edit seluruh data layanan":"Tambah layanan";
  html=`<div class="editor-section"><h3>Informasi layanan</h3><div class="form-grid">
   ${fieldHTML("Nama layanan *","name",row?.name||"","text",true)}
   ${fieldHTML("Satuan","unit",row?.unit||"paket")}
   ${fieldHTML("Harga standar (Rp)","price",row?.price??0,"number")}
   ${selectHTML("Status layanan","active",[["TRUE","Aktif"],["FALSE","Nonaktif"]],String(row?.active??"TRUE"))}
  </div>${textareaHTML("Deskripsi layanan","description",row?.description||"")}</div>`;
 }
 if(type==="job"){
  title=edit?"Edit seluruh work order":"Buat work order";
  html=`<div class="editor-section"><h3>Informasi pekerjaan</h3><div class="form-grid">
   ${fieldHTML("Nomor work order *","number",row?.number||"","text",false,"Otomatis jika dikosongkan")}
   ${selectHTML("Pelanggan *","customerId",customerOpts,row?.customerId||"")}
   ${fieldHTML("Judul pekerjaan *","title",row?.title||"","text",true)}
   ${fieldHTML("Tanggal & jam mulai *","scheduledStart",inputDateTime(row?.scheduledStart),"datetime-local",true)}
   ${fieldHTML("Tanggal & jam selesai","scheduledEnd",inputDateTime(row?.scheduledEnd),"datetime-local")}
   ${fieldHTML("Nama teknisi","assignedTo",row?.assignedTo||"")}
   ${fieldHTML("Email teknisi","assignedEmail",row?.assignedEmail||"","email")}
   ${selectHTML("Prioritas","priority",[["Urgent","Urgent"],["Tinggi","Tinggi"],["Normal","Normal"],["Rendah","Rendah"]],row?.priority||"Normal")}
   ${selectHTML("Status pekerjaan","status",[["Menunggu konfirmasi","Menunggu konfirmasi"],["Terjadwal","Terjadwal"],["Teknisi dalam perjalanan","Teknisi dalam perjalanan"],["Sedang dikerjakan","Sedang dikerjakan"],["Menunggu material","Menunggu material"],["Selesai","Selesai"],["Dibatalkan","Dibatalkan"]],row?.status||"Menunggu konfirmasi")}
   ${fieldHTML("Lokasi pekerjaan","location",row?.location||"")}
   ${fieldHTML("Estimasi durasi (menit)","estimatedMinutes",row?.estimatedMinutes??60,"number")}
   ${fieldHTML("Progress manual (%)","progress",row?.progress??0,"number")}
   ${selectHTML("Quotation terkait","quotationId",[["","Tidak ada"],...CACHE.quotations.map(q=>[q.id,q.number+" — "+q.title])],row?.quotationId||"",false)}
   ${selectHTML("Invoice terkait","invoiceId",[["","Tidak ada"],...CACHE.invoices.map(q=>[q.id,q.number+" — "+q.title])],row?.invoiceId||"",false)}
  </div>${textareaHTML("Deskripsi / catatan pekerjaan","description",row?.description||"")}</div>`;
 }
 if(type==="quotation"||type==="invoice"){
  const isQ=type==="quotation",items=row?.items?.length?row.items:[{description:"",qty:1,unit:"unit",unitPrice:0}];
  title=edit?(isQ?"Edit seluruh dokumen penawaran":"Edit seluruh dokumen invoice"):(isQ?"Buat penawaran baru":"Buat invoice baru");
  const statusOpts=isQ?[["Draft","Draft"],["Dikirim","Dikirim"],["Disetujui","Disetujui"],["Ditolak","Ditolak"],["Kedaluwarsa","Kedaluwarsa"]]:[["Belum dibayar","Belum dibayar"],["Kedaluwarsa","Kedaluwarsa"],["Dibatalkan","Dibatalkan"]];
  html=`<div class="editor-section"><h3>Identitas dokumen</h3><div class="form-grid">
   ${fieldHTML("Nomor dokumen *","number",row?.number||"","text",false,isQ?"Otomatis jika dikosongkan":"Otomatis jika dikosongkan")}
   ${selectHTML("Pelanggan *","customerId",customerOpts,row?.customerId||"")}
   ${fieldHTML("Judul dokumen *","title",row?.title||"","text",true)}
   ${fieldHTML("Tanggal dokumen","date",row?.date||new Date().toISOString().slice(0,10),"date")}
   ${isQ?fieldHTML("Berlaku sampai","validUntil",row?.validUntil||"","date"):fieldHTML("Jatuh tempo","dueDate",row?.dueDate||"","date")}
   ${isQ?selectHTML("Status penawaran","status",statusOpts,row?.status||"Draft"):((Number(row?.paid||0)>0)?`<div class="field readonly-field">Status pembayaran<strong>${escapeHTML(row.status||"Belum dibayar")}</strong><small>Status mengikuti pembayaran yang tercatat.</small></div>`:selectHTML("Status invoice","status",statusOpts,row?.status||"Belum dibayar"))}
   ${!isQ?selectHTML("Quotation terkait","quotationId",[["","Tidak ada"],...CACHE.quotations.map(q=>[q.id,q.number+" — "+q.title])],row?.quotationId||"",false):""}
   ${fieldHTML("Diskon (Rp)","discount",row?.discount??0,"number")}
   ${fieldHTML("Pajak (%)","taxPercent",row?.taxPercent??0,"number")}
  </div></div>
  <div class="editor-section"><div class="section-heading"><div><h3>Rincian dokumen</h3><small>Semua item dapat ditambah, diubah, atau dihapus.</small></div><button type="button" class="btn soft-green" id="addDocumentItem">＋ Tambah item</button></div>
   <div id="documentItems">${items.map((x,i)=>itemHTML(x,i)).join("")}</div>
  </div>
  <div class="editor-section">${textareaHTML("Catatan / syarat dan ketentuan","notes",row?.notes||"",4)}
   ${!isQ&&edit?`<div class="payment-lock"><span>Sudah dibayar</span><b>${money(row.paid||0)}</b><small>Riwayat pembayaran tidak diedit dari form dokumen.</small></div>`:""}
  </div>`;
 }
 html+=`<div class="editor-footer"><button type="button" class="btn soft" onclick="closeModal()">Batal</button><button type="submit" class="btn primary">Simpan seluruh perubahan</button></div>`;
 openModal(title,html,async e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd);
  try{
   if(type==="customer")await call("saveCustomer",{...v,id:row?.id||""});
   else if(type==="service")await call("saveService",{...v,id:row?.id||"",price:Number(v.price||0),active:v.active==="TRUE"});
   else if(type==="job")await call("saveJob",{...v,id:row?.id||"",estimatedMinutes:Number(v.estimatedMinutes||60),progress:Number(v.progress||0)});
   else{
    const items=[...e.currentTarget.querySelectorAll(".document-item")].map(el=>({
     description:el.querySelector('[data-field="description"]').value.trim(),
     qty:Number(el.querySelector('[data-field="qty"]').value),
     unit:el.querySelector('[data-field="unit"]').value.trim(),
     unitPrice:Number(el.querySelector('[data-field="unitPrice"]').value)
    }));
    if(!items.length)throw new Error("Dokumen harus memiliki minimal satu item.");
    if(items.some(x=>!x.description||x.qty<=0||x.unitPrice<0))throw new Error("Periksa kembali deskripsi, jumlah, dan harga item.");
    v.items=JSON.stringify(items);v.id=row?.id||"";
    await call(isQType(type)?"saveQuotation":"saveInvoice",v);
   }
   closeModal();toast("Seluruh isi dokumen berhasil disimpan.");await loadAll();
  }catch(err){toast(err.message)}
 });
 if(type==="quotation"||type==="invoice"){
  let nextIndex=items.length;
  $("addDocumentItem").onclick=()=>{
   $("documentItems").insertAdjacentHTML("beforeend",itemHTML({description:"",qty:1,unit:"unit",unitPrice:0},nextIndex++));
  };
  $("documentItems").addEventListener("input",e=>{
   if(e.target.matches("input")){const card=e.target.closest(".document-item");if(card){const q=Number(card.querySelector('[data-field="qty"]').value||0),p=Number(card.querySelector('[data-field="unitPrice"]').value||0);card.querySelector(".item-subtotal b").textContent=money(q*p)}}
  });
 }
}
function isQType(type){return type==="quotation"}
window.openEditor=openEditor;
window.editRecord=(type,id)=>openEditor(type,id);
window.editJob=id=>openEditor("job",id);

window.createForPage=createForPage;
window.deleteRecord=async(type,id)=>{
 const action={customer:"deleteCustomer",service:"deleteService",quotation:"deleteQuotation",invoice:"deleteInvoice",job:"deleteJob"}[type];
 if(!action)return;
 if(!confirm("Hapus data ini? Tindakan ini tidak dapat dibatalkan."))return;
 try{await call(action,{id});toast("Data berhasil dihapus.");await loadAll()}catch(e){toast(e.message)}
};
window.pdfDoc=async(type,id)=>{
 try{const r=await call(type==="quotation"?"pdfQuotation":"pdfInvoice",{id});if(r.url)window.open(r.url,"_blank","noopener");else toast("URL PDF tidak tersedia.")}catch(e){toast(e.message)}
};
window.shareInvoice=token=>{
 if(!token){toast("Token invoice tidak tersedia.");return}
 const url=new URL("invoice.html",location.href);url.searchParams.set("token",token);
 const value=url.toString();
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>toast("Link invoice berhasil disalin.")).catch(()=>prompt("Salin link invoice:",value));
 else prompt("Salin link invoice:",value);
};
window.payment=async id=>{
 const amount=prompt("Nominal pembayaran yang diterima (Rp):");if(amount===null||amount==="")return;
 try{await call("recordPayment",{id,amount});toast("Pembayaran berhasil dicatat.");await loadAll()}catch(e){toast(e.message)}
};
window.confirmWorkOrder=async id=>{
 const j=CACHE.jobs.find(x=>String(x.id)===String(id));if(!j)return;
 const day=String(j.scheduledStart||"").slice(0,10)||new Date().toISOString().slice(0,10);
 const start=prompt("Konfirmasi tanggal dan jam mulai (YYYY-MM-DDTHH:mm)",day+"T09:00");if(!start)return;
 const end=prompt("Perkiraan selesai (YYYY-MM-DDTHH:mm)",day+"T10:00");if(end===null)return;
 const technician=prompt("Nama teknisi",j.assignedTo||"");if(!technician)return;
 const email=prompt("Email teknisi (opsional)",j.assignedEmail||"")||"";
 try{await call("confirmJob",{id,scheduledStart:start,scheduledEnd:end,assignedTo:technician,assignedEmail:email,location:j.location||""});toast("Jadwal dikonfirmasi.");await loadAll()}catch(e){toast(e.message)}
};
window.changeStatus=id=>openEditor("job",id);

window.manageChecklist=async id=>{
 try{
  const response=await call("listJobDetails",{id}),data=response.data||{},items=data.checklist||[];
  const html=`<div class="editor-section"><h3>${escapeHTML(data.job?.number||"Work Order")} · Checklist pekerjaan</h3><div class="checklist-editor">
   ${items.map(it=>`<div class="checklist-row"><label class="check-label"><input type="checkbox" data-check-id="${it.id}" ${String(it.isDone)==="TRUE"||it.isDone===true?"checked":""}><span>${escapeHTML(it.label)}</span></label><input class="check-note" data-note-id="${it.id}" value="${escapeHTML(it.note||"")}" placeholder="Catatan (opsional)"></div>`).join("")}
  </div><div class="progress-preview">Progress saat ini <b>${Number(data.job?.progress||0)}%</b></div></div>
  <div class="editor-section"><h3>Dokumentasi foto</h3><label class="field">Pilih foto<input id="jobPhoto" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="field">Keterangan foto<input id="jobPhotoCaption" placeholder="Contoh: Hasil instalasi setelah selesai"></label><small class="muted">JPG, PNG, WebP maksimal 4 MB.</small></div>
  <div class="editor-footer"><button type="button" class="btn soft" onclick="closeModal()">Tutup</button><button type="button" id="saveChecklist" class="btn primary">Simpan progress</button></div>`;
  openModal("Checklist & dokumentasi",html,null);
  $("saveChecklist").onclick=async()=>{
   const button=$("saveChecklist");button.disabled=true;button.textContent="Menyimpan…";
   try{
    for(const checkbox of $("modalForm").querySelectorAll("[data-check-id]")){
     const itemId=checkbox.dataset.checkId,note=$("modalForm").querySelector(`[data-note-id="${itemId}"]`)?.value||"";
     await call("updateChecklist",{id:itemId,isDone:checkbox.checked,note});
    }
    const file=$("jobPhoto").files[0];
    if(file){
     if(file.size>4*1024*1024)throw new Error("Ukuran foto maksimal 4 MB.");
     const base64=await fileToBase64(file);
     await uploadPhotoPost({id,mimeType:file.type,fileName:file.name,base64,caption:$("jobPhotoCaption").value||""});
    }
    closeModal();toast("Progress dan dokumentasi berhasil diperbarui.");await loadAll();
   }catch(e){toast(e.message);button.disabled=false;button.textContent="Simpan progress"}
  };
 }catch(e){toast(e.message)}
};
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=()=>reject(new Error("Gagal membaca foto."));reader.readAsDataURL(file)})}
function uploadPhotoPost(data){
 return new Promise((resolve,reject)=>{
  const frame=document.createElement("iframe");frame.name="wfpPhotoFrame"+Date.now();frame.style.display="none";document.body.appendChild(frame);
  const form=document.createElement("form");form.method="POST";form.action=API;form.target=frame.name;form.enctype="application/x-www-form-urlencoded";form.style.display="none";
  const values={action:"uploadJobPhoto",pin:PIN,...data};
  Object.entries(values).forEach(([k,v])=>{const input=document.createElement("input");input.type="hidden";input.name=k;input.value=String(v??"");form.appendChild(input)});
  document.body.appendChild(form);form.submit();form.remove();
  setTimeout(async()=>{frame.remove();try{const check=await call("listJobDetails",{id:data.id});if((check.data.photos||[]).length)resolve(true);else reject(new Error("Foto belum terverifikasi tersimpan. Periksa Drive dan Apps Script."))}catch(e){reject(e)}},6500);
 });
};
setInterval(()=>{if(API&&PIN&&!document.hidden&&!$("modal").classList.contains("hidden"))return;if(API&&PIN&&!document.hidden)loadAll()},15000);
