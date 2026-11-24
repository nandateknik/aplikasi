let API="", PIN="", PAGE="dashboard", CACHE={customers:[],quotations:[],invoices:[],jobs:[],services:[]};
const $=id=>document.getElementById(id);
function toast(s){const t=$("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function jsonp(params){
 return new Promise((resolve,reject)=>{
  const cb="wfpcb_"+Date.now()+"_"+Math.floor(Math.random()*1e6),script=document.createElement("script");
  const timer=setTimeout(()=>{cleanup();reject(new Error("Koneksi timeout. Periksa URL Apps Script."))},20000);
  function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
  window[cb]=data=>{cleanup();if(!data||!data.ok)reject(new Error(data?.error||"Request gagal"));else resolve(data)};
  const q=new URLSearchParams({...params,callback:cb});
  script.src=API+"?"+q.toString();script.onerror=()=>{cleanup();reject(new Error("Tidak bisa menghubungi Apps Script"))};
  document.body.appendChild(script);
 });
}
async function call(action,data={}){return jsonp({action,pin:PIN,...data})}
$("connect").onclick=async()=>{
 API=$("apiUrl").value.trim();PIN=$("pin").value.trim();
 if(!API||!PIN){$("loginError").textContent="URL dan PIN wajib diisi.";return}
 if(!/\/exec$/.test(API)){ $("loginError").textContent="Gunakan URL deployment yang berakhiran /exec.";return}
 try{await call("bootstrap");localStorage.setItem("wf_api",API);sessionStorage.setItem("wf_pin",PIN);$("login").classList.add("hidden");$("app").classList.remove("hidden");await loadAll()}
 catch(e){$("loginError").textContent=e.message}
};
$("disconnect").onclick=()=>{sessionStorage.removeItem("wf_pin");$("app").classList.add("hidden");$("login").classList.remove("hidden")};
$("apiUrl").value=localStorage.getItem("wf_api")||"";
$("pin").value=sessionStorage.getItem("wf_pin")||"";
if($("apiUrl").value&&$("pin").value){API=$("apiUrl").value;PIN=$("pin").value;$("connect").click()}
async function loadAll(){
 try{
  const [d,c,q,i,j,s]=await Promise.all(["dashboard","listCustomers","listQuotations","listInvoices","listJobs","listServices"].map(a=>call(a)));
  CACHE={dashboard:d.data,customers:c.data,quotations:q.data,invoices:i.data,jobs:j.data,services:s.data};render();
 }catch(e){toast(e.message)}
}
function money(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0))}
function date(s){if(!s)return "—";const d=new Date(s);return isNaN(d)?s:d.toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})}
function customerName(id){return CACHE.customers.find(c=>c.id===id)?.name||"Pelanggan dihapus"}
function render(){
 const names={dashboard:"Dashboard",customers:"Pelanggan",quotations:"Quotation",invoices:"Invoice",jobs:"Jadwal pekerjaan"};
 $("pageName").textContent=names[PAGE];$("heading").textContent=names[PAGE];
 document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===PAGE));
 $("primaryAction").textContent=PAGE==="dashboard"||PAGE==="jobs"?"＋ Tambah pekerjaan":PAGE==="customers"?"＋ Tambah pelanggan":PAGE==="quotations"?"＋ Buat quotation":"＋ Buat invoice";
 $("pageBody").innerHTML=PAGE==="dashboard"?dashboardHTML():PAGE==="customers"?customersHTML():PAGE==="quotations"?quotationsHTML():PAGE==="invoices"?invoicesHTML():jobsHTML();
}
function dashboardHTML(){
 const d=CACHE.dashboard||{};
 return `<div class="cards"><div class="card"><span>Pelanggan</span><strong>${d.customers||0}</strong><small>Database pelanggan</small></div><div class="card"><span>Quotation</span><strong>${d.quotations||0}</strong><small>Penawaran tercatat</small></div><div class="card"><span>Invoice</span><strong>${d.invoices||0}</strong><small>Total invoice</small></div><div class="card"><span>Piutang</span><strong>${money(d.receivable)}</strong><small>Belum dibayar</small></div></div>
 <div class="grid2"><div class="panel"><h2>Urutan pekerjaan berikutnya</h2>${priorityHTML(d.priorityJobs||[])}</div><div class="panel"><h2>Ringkasan keuangan</h2><div class="priority-item"><div><small>Total pembayaran tercatat</small><b>${money(d.revenue)}</b></div></div><div class="priority-item"><div><small>Total piutang berjalan</small><b>${money(d.receivable)}</b></div></div><p class="muted">Urutan kerja dihitung berdasarkan prioritas, lalu waktu mulai paling awal.</p></div></div>`;
}
function priorityHTML(jobs){if(!jobs.length)return `<div class="empty">Belum ada pekerjaan aktif.</div>`;return `<div class="priority-list">${jobs.map((j,i)=>`<div class="priority-item"><div class="rank">${i+1}</div><div><b>${esc(j.title)}</b><small>${esc(j.number)} · ${esc(customerName(j.customerId))} · ${date(j.scheduledStart)}</small></div><span class="pill ${j.priority==="Urgent"?"red":j.priority==="Tinggi"?"orange":""}">${esc(j.priority)}</span></div>`).join("")}</div>`}
function customersHTML(){return `<div class="panel"><div class="toolbar"><h2>Daftar pelanggan</h2><input id="filter" placeholder="Cari pelanggan..." oninput="filterRows()"></div><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Perusahaan</th><th>Telepon</th><th>Email</th><th>Alamat</th></tr></thead><tbody id="rows">${CACHE.customers.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.company)}</td><td>${esc(c.whatsapp||c.phone)}</td><td>${esc(c.email)}</td><td>${esc(c.address)}</td></tr>`).join("")}</tbody></table></div>${CACHE.customers.length?"":'<div class="empty">Belum ada pelanggan.</div>'}</div>`}
function quotationsHTML(){return `<div class="panel"><h2>Daftar quotation</h2><div class="table-wrap"><table><thead><tr><th>Nomor</th><th>Judul</th><th>Pelanggan</th><th>Tanggal</th><th>Berlaku sampai</th><th>Total</th><th>Status</th></tr></thead><tbody>${CACHE.quotations.map(q=>`<tr><td><b>${esc(q.number)}</b></td><td>${esc(q.title)}</td><td>${esc(customerName(q.customerId))}</td><td>${esc(q.date)}</td><td>${esc(q.validUntil)}</td><td>${money(q.total)}</td><td><span class="pill">${esc(q.status)}</span></td></tr>`).join("")}</tbody></table></div>${CACHE.quotations.length?"":'<div class="empty">Belum ada quotation.</div>'}</div>`}
function invoicesHTML(){return `<div class="panel"><h2>Daftar invoice</h2><div class="table-wrap"><table><thead><tr><th>Nomor</th><th>Judul</th><th>Pelanggan</th><th>Jatuh tempo</th><th>Total</th><th>Dibayar</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${CACHE.invoices.map(x=>`<tr><td><b>${esc(x.number)}</b></td><td>${esc(x.title)}</td><td>${esc(customerName(x.customerId))}</td><td>${esc(x.dueDate)}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td><span class="pill ${x.status==="Lunas"?"green":"orange"}">${esc(x.status)}</span></td><td><button class="btn secondary" onclick="payment('${x.id}')">Catat bayar</button></td></tr>`).join("")}</tbody></table></div>${CACHE.invoices.length?"":'<div class="empty">Belum ada invoice.</div>'}</div>`}
function jobsHTML(){const jobs=CACHE.jobs||[];return `<div class="panel"><div class="toolbar"><h2>Prioritas & jadwal kerja</h2><span class="pill">Nomor urut otomatis</span></div><div class="table-wrap"><table><thead><tr><th>Urutan</th><th>No. pekerjaan</th><th>Pekerjaan</th><th>Pelanggan</th><th>Jadwal</th><th>Teknisi</th><th>Prioritas</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${jobs.map((j,i)=>`<tr><td><b>#${i+1}</b></td><td>${esc(j.number)}</td><td><b>${esc(j.title)}</b><br><small>${esc(j.location)}</small></td><td>${esc(customerName(j.customerId))}</td><td>${date(j.scheduledStart)}</td><td>${esc(j.assignedTo)}</td><td><span class="pill ${j.priority==="Urgent"?"red":j.priority==="Tinggi"?"orange":""}">${esc(j.priority)}</span></td><td><span class="pill">${esc(j.status)}</span></td><td><button class="btn secondary" onclick="changeStatus('${j.id}')">Update</button></td></tr>`).join("")}</tbody></table></div>${jobs.length?"":'<div class="empty">Belum ada pekerjaan terjadwal.</div>'}</div>`}
window.filterRows=()=>{const q=$("filter").value.toLowerCase();$("rows").querySelectorAll("tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?"":"none")};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{PAGE=b.dataset.page;render()});
$("refresh").onclick=loadAll;
$("primaryAction").onclick=()=>openForm(PAGE==="customers"?"customer":PAGE==="quotations"?"quotation":PAGE==="invoices"?"invoice":"job");
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
function field(label,name,type="text",required=false,extra=""){return `<label class="field">${label}<input name="${name}" type="${type}" ${required?"required":""} ${extra}></label>`}
function selectField(label,name,opts,required=true){return `<label class="field">${label}<select name="${name}" ${required?"required":""}>${opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join("")}</select></label>`}
function openForm(type){
 const customers=CACHE.customers.map(c=>[c.id,c.name]);
 let title="",html="";
 if(type==="customer"){title="Tambah pelanggan";html=field("Nama pelanggan *","name","text",true)+field("Perusahaan","company")+field("Email","email","email")+field("Telepon","phone")+field("WhatsApp","whatsapp")+field("Alamat","address")+`<div class="actions"><button class="btn primary">Simpan pelanggan</button></div>`}
 if(type==="job"){title="Buat jadwal pekerjaan";html=`<div class="form-grid">${selectField("Pelanggan *","customerId",customers)}${field("Judul pekerjaan *","title","text",true)}${field("Mulai *","scheduledStart","datetime-local",true)}${field("Selesai","scheduledEnd","datetime-local")}${field("Nama teknisi","assignedTo")}${field("Email teknisi (reminder)","assignedEmail","email")}${selectField("Prioritas","priority",[["Normal","Normal"],["Rendah","Rendah"],["Tinggi","Tinggi"],["Urgent","Urgent"]])}${selectField("Status","status",[["Terjadwal","Terjadwal"],["Dalam proses","Dalam proses"],["Menunggu material","Menunggu material"]])}${field("Lokasi","location")}${field("Estimasi (menit)","estimatedMinutes","number",false,'value="60"')}</div>${field("Deskripsi","description")}<div class="actions"><button class="btn primary">Simpan jadwal</button></div>`}
 if(type==="quotation"||type==="invoice"){title=type==="quotation"?"Buat quotation":"Buat invoice";html=`<div class="form-grid">${selectField("Pelanggan *","customerId",customers)}${field("Judul *","title","text",true)}${field("Tanggal","date","date",false,`value="${new Date().toISOString().slice(0,10)}"`)}${field(type==="quotation"?"Berlaku sampai":"Jatuh tempo",type==="quotation"?"validUntil":"dueDate","date")}${field("Diskon (Rp)","discount","number",false,'value="0"')}${field("Pajak (%)","taxPercent","number",false,'value="0"')}</div><div id="items"><div class="item-line form-grid">${field("Deskripsi item","desc_0","text",true)}${field("Qty","qty_0","number",true,'value="1"')}${field("Satuan","unit_0")}${field("Harga satuan","price_0","number",true,'value="0"')}</div></div><button type="button" class="btn secondary" id="addItem">＋ Tambah item</button>${field("Catatan","notes")}<div class="actions"><button class="btn primary">Simpan ${type==="quotation"?"quotation":"invoice"}</button></div>`}
 $("modalTitle").textContent=title;$("modalForm").innerHTML=html;$("modal").classList.remove("hidden");
 let itemCount=1;
 const add=$("addItem");if(add)add.onclick=()=>{const i=itemCount++;$("items").insertAdjacentHTML("beforeend",`<div class="item-line form-grid">${field("Deskripsi item","desc_"+i,"text",true)}${field("Qty","qty_"+i,"number",true,'value="1"')}${field("Satuan","unit_"+i)}${field("Harga satuan","price_"+i,"number",true,'value="0"')}</div>`)};
 $("modalForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd);try{
  if(type==="customer")await call("saveCustomer",v);
  if(type==="job")await call("saveJob",v);
  if(type==="quotation"||type==="invoice"){
   const items=[];for(let i=0;i<itemCount;i++){if(v["desc_"+i])items.push({description:v["desc_"+i],qty:v["qty_"+i],unit:v["unit_"+i],unitPrice:v["price_"+i]})}
   v.items=JSON.stringify(items);await call(type==="quotation"?"saveQuotation":"saveInvoice",v);
  }
  $("modal").classList.add("hidden");toast("Data berhasil disimpan.");await loadAll();
 }catch(err){toast(err.message)}};
}
window.payment=async id=>{const amount=prompt("Masukkan nominal pembayaran (Rp):");if(!amount)return;try{await call("recordPayment",{id,amount});toast("Pembayaran dicatat.");loadAll()}catch(e){toast(e.message)}};
window.changeStatus=async id=>{const status=prompt("Status baru: Terjadwal / Dalam proses / Menunggu material / Selesai / Dibatalkan","Dalam proses");if(!status)return;try{await call("updateJobStatus",{id,status,note:"Update dari dashboard"});toast("Status pekerjaan diperbarui.");loadAll()}catch(e){toast(e.message)}};
