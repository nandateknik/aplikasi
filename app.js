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
function customersHTML(){return `<div class="panel"><div class="toolbar"><h2>Daftar pelanggan</h2><input id="filter" placeholder="Cari pelanggan..." oninput="filterRows()"></div><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Perusahaan</th><th>Telepon</th><th>Email</th><th>Alamat</th><th>Aksi</th></tr></thead><tbody id="rows">${CACHE.customers.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.company)}</td><td>${esc(c.whatsapp||c.phone)}</td><td>${esc(c.email)}</td><td>${esc(c.address)}</td><td><button class="btn secondary" onclick="editRecord('customer','${c.id}')">Edit</button> <button class="btn secondary" onclick="deleteRecord('customer','${c.id}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>${CACHE.customers.length?"":'<div class="empty">Belum ada pelanggan.</div>'}</div>`}
function quotationsHTML(){return `<div class="panel"><h2>Daftar quotation</h2><div class="table-wrap"><table><thead><tr><th>Nomor</th><th>Judul</th><th>Pelanggan</th><th>Tanggal</th><th>Berlaku sampai</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${CACHE.quotations.map(q=>`<tr><td><b>${esc(q.number)}</b></td><td>${esc(q.title)}</td><td>${esc(customerName(q.customerId))}</td><td>${esc(q.date)}</td><td>${esc(q.validUntil)}</td><td>${money(q.total)}</td><td><span class="pill">${esc(q.status)}</span></td><td><button class="btn secondary" onclick="editRecord('quotation','${q.id}')">Edit</button> <button class="btn secondary" onclick="pdfDoc('quotation','${q.id}')">PDF</button> <button class="btn secondary" onclick="deleteRecord('quotation','${q.id}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>${CACHE.quotations.length?"":'<div class="empty">Belum ada quotation.</div>'}</div>`}
function invoicesHTML(){return `<div class="panel"><h2>Daftar invoice</h2><div class="table-wrap"><table><thead><tr><th>Nomor</th><th>Judul</th><th>Pelanggan</th><th>Jatuh tempo</th><th>Total</th><th>Dibayar</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${CACHE.invoices.map(x=>`<tr><td><b>${esc(x.number)}</b></td><td>${esc(x.title)}</td><td>${esc(customerName(x.customerId))}</td><td>${esc(x.dueDate)}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td><span class="pill ${x.status==="Lunas"?"green":"orange"}">${esc(x.status)}</span></td><td><button class="btn secondary" onclick="payment('${x.id}')">Catat bayar</button> <button class="btn secondary" onclick="pdfDoc('invoice','${x.id}')">PDF</button> <button class="btn secondary" onclick="shareInvoice('${x.publicToken||''}')">Link</button> <button class="btn secondary" onclick="shareInvoice('${x.publicToken||''}')">Link</button> <button class="btn secondary" onclick="editRecord('invoice','${x.id}')">Edit</button> <button class="btn secondary" onclick="deleteRecord('invoice','${x.id}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>${CACHE.invoices.length?"":'<div class="empty">Belum ada invoice.</div>'}</div>`}
function jobsHTML(){const jobs=CACHE.jobs||[];return `<div class="panel"><div class="toolbar"><h2>Prioritas & jadwal kerja</h2><span class="pill">Nomor urut otomatis</span></div><div class="table-wrap"><table><thead><tr><th>Urutan</th><th>No. pekerjaan</th><th>Pekerjaan</th><th>Pelanggan</th><th>Jadwal</th><th>Teknisi</th><th>Prioritas</th><th>Status / Progress</th><th>Aksi</th></tr></thead><tbody>${jobs.map((j,i)=>`<tr><td><b>#${i+1}</b></td><td>${esc(j.number)}</td><td><b>${esc(j.title)}</b><br><small>${esc(j.location)}</small></td><td>${esc(customerName(j.customerId))}</td><td>${date(j.scheduledStart)}</td><td>${esc(j.assignedTo)}</td><td><span class="pill ${j.priority==="Urgent"?"red":j.priority==="Tinggi"?"orange":""}">${esc(j.priority)}</span></td><td><span class="pill">${esc(j.status)}</span><br><small>${Number(j.progress||0)}%</small></td><td><button class="btn secondary" onclick="confirmWorkOrder('${j.id}')">Konfirmasi</button> <button class="btn secondary" onclick="manageChecklist('${j.id}')">Checklist / Foto</button> <button class="btn secondary" onclick="changeStatus('${j.id}')">Status</button> <button class="btn secondary" onclick="editJob('${j.id}')">Edit</button> <button class="btn secondary" onclick="deleteRecord('job','${j.id}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>${jobs.length?"":'<div class="empty">Belum ada pekerjaan terjadwal.</div>'}</div>`}
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


// V2 actions: editable records, delete, PDFs, and progress updates.
window.editRecord=async(type,id)=>{
 const map={customer:['Customers','saveCustomer'],quotation:['Quotations','saveQuotation'],invoice:['Invoices','saveInvoice']};
 const row=(CACHE[map[type][0].toLowerCase()]||[]).find(x=>x.id===id);
 if(!row){toast('Data tidak ditemukan.');return;}
 try{
  if(type==='customer'){
   const name=prompt('Nama pelanggan',row.name);if(name===null)return;
   const company=prompt('Perusahaan',row.company||'');if(company===null)return;
   const phone=prompt('Nomor telepon',row.phone||'');if(phone===null)return;
   const whatsapp=prompt('WhatsApp',row.whatsapp||'');if(whatsapp===null)return;
   const email=prompt('Email',row.email||'');if(email===null)return;
   const address=prompt('Alamat',row.address||'');if(address===null)return;
   await call('saveCustomer',{id,name,company,phone,whatsapp,email,address});
  } else {
   const title=prompt('Judul dokumen',row.title);if(title===null)return;
   const discount=prompt('Diskon (Rp)',row.discount||0);if(discount===null)return;
   const taxPercent=prompt('Pajak (%)',row.taxPercent||0);if(taxPercent===null)return;
   const notes=prompt('Catatan',row.notes||'');if(notes===null)return;
   const items=JSON.stringify((row.items||[]).map(x=>({description:x.description,qty:x.qty,unit:x.unit,unitPrice:x.unitPrice})));
   await call(map[type][1],{id,customerId:row.customerId,title,discount,taxPercent,notes,items,date:row.date,validUntil:row.validUntil,dueDate:row.dueDate,quotationId:row.quotationId});
  }
  toast('Perubahan tersimpan.');await loadAll();
 }catch(e){toast(e.message)}
};
window.editJob=async id=>{const j=CACHE.jobs.find(x=>x.id===id);if(!j)return;const title=prompt('Judul pekerjaan',j.title);if(title===null)return;const scheduledStart=prompt('Tanggal dan waktu (YYYY-MM-DDTHH:mm)',String(j.scheduledStart||'').slice(0,16));if(scheduledStart===null)return;const assignedTo=prompt('Teknisi',j.assignedTo||'');if(assignedTo===null)return;const priority=prompt('Prioritas: Urgent / Tinggi / Normal / Rendah',j.priority||'Normal');if(priority===null)return;try{await call('saveJob',{...j,title,scheduledStart,assignedTo});toast('Jadwal diperbarui.');await loadAll()}catch(e){toast(e.message)}};
window.deleteRecord=async(type,id)=>{if(!confirm('Yakin ingin menghapus data ini?'))return;const action={customer:'deleteCustomer',quotation:'deleteQuotation',invoice:'deleteInvoice',job:'deleteJob',service:'deleteService'}[type];try{await call(action,{id});toast('Data dihapus.');await loadAll()}catch(e){toast(e.message)}};
window.pdfDoc=async(type,id)=>{try{const r=await call(type==='quotation'?'pdfQuotation':'pdfInvoice',{id});window.open(r.url,'_blank');}catch(e){toast(e.message)}};
window.shareInvoice=token=>{if(!token){toast('Token invoice belum tersedia.');return}const url=location.origin+location.pathname.replace(/index\.html$/,'')+'invoice.html?token='+encodeURIComponent(token);navigator.clipboard.writeText(url).then(()=>toast('Link invoice disalin.')).catch(()=>prompt('Salin link invoice ini:',url))};
window.changeStatus=async id=>{const j=CACHE.jobs.find(x=>x.id===id);if(!j)return;const status=prompt('Status: Permintaan baru / Menunggu konfirmasi / Terjadwal / Teknisi dalam perjalanan / Sedang dikerjakan / Menunggu material / Selesai / Dibatalkan',j.status||'Terjadwal');if(status===null)return;const progress=prompt('Progress pekerjaan 0–100',j.progress||0);if(progress===null)return;try{await call('updateJobStatus',{id,status,progress,note:'Progress diperbarui dari admin'});toast('Progress diperbarui.');await loadAll()}catch(e){toast(e.message)}};
// Live refresh: near-realtime polling for shared operational changes.
setInterval(()=>{if(API&&PIN&&!document.hidden)loadAll()},10000);


// V2.1 — Admin confirms customer-requested date, exact time and technician.
window.confirmWorkOrder=async id=>{
 const j=CACHE.jobs.find(x=>x.id===id);if(!j)return;
 const d=String(j.scheduledStart||"").slice(0,10);
 const start=prompt("Konfirmasi tanggal dan jam (YYYY-MM-DDTHH:mm)",d+"T09:00");if(!start)return;
 const end=prompt("Perkiraan selesai (YYYY-MM-DDTHH:mm)",d+"T10:00");if(end===null)return;
 const tech=prompt("Nama teknisi yang ditugaskan",j.assignedTo||"");if(!tech)return;
 const email=prompt("Email teknisi untuk reminder",j.assignedEmail||"")||"";
 try{await call("confirmJob",{id,scheduledStart:start,scheduledEnd:end,assignedTo:tech,assignedEmail:email,location:j.location||""});toast("Jadwal dikonfirmasi. Email dan Telegram diproses.");await loadAll()}catch(e){toast(e.message)}
};

// Checklist is the source of truth for work progress.
window.manageChecklist=async id=>{
 try{
  const r=await call("listJobDetails",{id}),items=r.data.checklist||[];
  if(!items.length){toast("Checklist belum tersedia.");return}
  for(const item of items){
   const current=String(item.isDone)==="TRUE"||item.isDone===true;
   const answer=prompt((current?"[SELESAI] ":"[BELUM] ")+item.label+"\nKetik Y untuk selesai, N untuk belum, Enter untuk lewati:",current?"Y":"N");
   if(answer===null)break;
   if(answer.trim().toUpperCase()==="Y"||answer.trim().toUpperCase()==="N"){
    const note=prompt("Catatan untuk: "+item.label,item.note||"")||"";
    await call("updateChecklist",{id:item.id,isDone:answer.trim().toUpperCase()==="Y",note});
   }
  }
  const addPhoto=confirm("Apakah ingin mengunggah foto dokumentasi pekerjaan?");
  if(addPhoto){
   const input=document.createElement("input");input.type="file";input.accept="image/jpeg,image/png,image/webp";
   input.onchange=async()=>{
    const file=input.files[0];if(!file)return;
    if(file.size>4*1024*1024){toast("Foto maksimal 4 MB.");return}
    const reader=new FileReader();reader.onload=async()=>{
     try{
      const base64=String(reader.result).split(",")[1];
      const caption=prompt("Keterangan foto","Dokumentasi pekerjaan")||"";
      // Apps Script accepts form POST without CORS preflight. The iframe response is cross-origin,
      // so verify the result by refreshing the authenticated job-detail endpoint.
      const frame=document.createElement("iframe");frame.name="wfpPhotoUpload";frame.style.display="none";document.body.appendChild(frame);
      const form=document.createElement("form");form.method="POST";form.action=API;form.target=frame.name;form.enctype="application/x-www-form-urlencoded";
      const fields={action:"uploadJobPhoto",pin:PIN,id,mimeType:file.type,fileName:file.name,base64,caption};
      Object.entries(fields).forEach(([k,v])=>{const input=document.createElement("input");input.type="hidden";input.name=k;input.value=v;form.appendChild(input)});
      document.body.appendChild(form);form.submit();form.remove();
      toast("Foto dikirim. Memverifikasi upload…");
      setTimeout(async()=>{try{const check=await call("listJobDetails",{id});toast((check.data.photos||[]).length?"Foto dokumentasi tersimpan.":"Upload belum terverifikasi.");await loadAll()}catch(err){toast(err.message)}frame.remove()},7000);
     }catch(e){toast(e.message)}
    };reader.readAsDataURL(file);
   };input.click();
  }
  await loadAll();
 }catch(e){toast(e.message)}
};


// ===== V2.2: FULL-FIELD EDITORS + SETTINGS PAGE =====
function valEsc(v){return esc(v===undefined||v===null?"":String(v));}
function formField(label,name,value="",type="text",required=false){
 return `<label class="field">${label}<input name="${name}" type="${type}" value="${valEsc(value)}" ${required?"required":""}></label>`;
}
function formSelect(label,name,options,value=""){
 return `<label class="field">${label}<select name="${name}">${options.map(o=>`<option value="${valEsc(o[0])}" ${String(o[0])===String(value)?"selected":""}>${valEsc(o[1])}</option>`).join("")}</select></label>`;
}
function openFullEditor(type,row=null){
 const isEdit=!!row, customers=CACHE.customers.map(c=>[c.id,c.name]);
 let title="",html="", itemCount=0;
 const customerOptions=[["","Pilih pelanggan"],...customers];
 if(type==="customer"){
  title=isEdit?"Edit seluruh data pelanggan":"Tambah pelanggan";
  html=`<div class="form-grid">
   ${formField("Nama pelanggan *","name",row?.name,"text",true)}
   ${formField("Nama perusahaan","company",row?.company)}
   ${formField("Email","email",row?.email,"email")}
   ${formField("Telepon","phone",row?.phone)}
   ${formField("WhatsApp","whatsapp",row?.whatsapp)}
   ${formField("Alamat","address",row?.address)}
  </div><label class="field">Catatan<textarea name="notes" rows="3">${valEsc(row?.notes)}</textarea></label>
  <div class="actions"><button type="button" class="btn secondary" onclick="closeFullEditor()">Batal</button><button class="btn primary">Simpan semua perubahan</button></div>`;
 }
 if(type==="service"){
  title=isEdit?"Edit katalog jasa":"Tambah katalog jasa";
  html=`<div class="form-grid">${formField("Nama jasa *","name",row?.name,"text",true)}${formField("Satuan","unit",row?.unit||"paket")}${formField("Harga default (Rp)","price",row?.price||0,"number")}${formSelect("Status","active",[["TRUE","Aktif"],["FALSE","Nonaktif"]],row?.active||"TRUE")}</div>
  <label class="field">Deskripsi<textarea name="description" rows="3">${valEsc(row?.description)}</textarea></label>
  <div class="actions"><button type="button" class="btn secondary" onclick="closeFullEditor()">Batal</button><button class="btn primary">Simpan katalog jasa</button></div>`;
 }
 if(type==="job"){
  title=isEdit?"Edit seluruh data work order":"Buat work order";
  html=`<div class="form-grid">
   ${formSelect("Pelanggan *","customerId",customerOptions,row?.customerId||"")}
   ${formField("Judul pekerjaan *","title",row?.title,"text",true)}
   ${formField("Mulai (tanggal & jam) *","scheduledStart",String(row?.scheduledStart||"").slice(0,16),"datetime-local",true)}
   ${formField("Selesai (tanggal & jam)","scheduledEnd",String(row?.scheduledEnd||"").slice(0,16),"datetime-local")}
   ${formField("Nama teknisi","assignedTo",row?.assignedTo)}
   ${formField("Email teknisi","assignedEmail",row?.assignedEmail,"email")}
   ${formSelect("Prioritas","priority",[["Urgent","Urgent"],["Tinggi","Tinggi"],["Normal","Normal"],["Rendah","Rendah"]],row?.priority||"Normal")}
   ${formSelect("Status","status",[["Menunggu konfirmasi","Menunggu konfirmasi"],["Terjadwal","Terjadwal"],["Teknisi dalam perjalanan","Teknisi dalam perjalanan"],["Sedang dikerjakan","Sedang dikerjakan"],["Menunggu material","Menunggu material"],["Selesai","Selesai"],["Dibatalkan","Dibatalkan"]],row?.status||"Menunggu konfirmasi")}
   ${formField("Lokasi","location",row?.location)}
   ${formField("Estimasi (menit)","estimatedMinutes",row?.estimatedMinutes||60,"number")}
   ${formField("Progress (%)","progress",row?.progress||0,"number")}
  </div><label class="field">Deskripsi pekerjaan<textarea name="description" rows="3">${valEsc(row?.description)}</textarea></label>
  <div class="actions"><button type="button" class="btn secondary" onclick="closeFullEditor()">Batal</button><button class="btn primary">Simpan seluruh data pekerjaan</button></div>`;
 }
 if(type==="quotation"||type==="invoice"){
  title=isEdit?(type==="quotation"?"Edit seluruh quotation":"Edit seluruh invoice"):(type==="quotation"?"Buat quotation":"Buat invoice");
  const items=row?.items?.length?row.items:[{description:"",qty:1,unit:"unit",unitPrice:0}];
  itemCount=items.length;
  html=`<div class="form-grid">
   ${formSelect("Pelanggan *","customerId",customerOptions,row?.customerId||"")}
   ${formField("Judul *","title",row?.title,"text",true)}
   ${formField("Tanggal","date",row?.date||new Date().toISOString().slice(0,10),"date")}
   ${type==="quotation"?formField("Berlaku sampai","validUntil",row?.validUntil,"date"):formField("Jatuh tempo","dueDate",row?.dueDate,"date")}
   ${type==="invoice"?formField("Referensi quotation ID","quotationId",row?.quotationId):""}
   ${formField("Diskon (Rp)","discount",row?.discount||0,"number")}
   ${formField("Pajak (%)","taxPercent",row?.taxPercent||0,"number")}
   ${type==="quotation"?formSelect("Status","status",[["Draft","Draft"],["Dikirim","Dikirim"],["Disetujui","Disetujui"],["Ditolak","Ditolak"],["Kedaluwarsa","Kedaluwarsa"]],row?.status||"Draft"):""}
  </div>
  <div class="toolbar"><h3>Rincian item</h3><button type="button" class="btn secondary" id="fullAddItem">＋ Tambah item</button></div>
  <div id="fullItems">${items.map((x,i)=>fullItemHTML(x,i)).join("")}</div>
  ${type==="invoice"?`<p class="hint">Pembayaran diterima (${money(row?.paid||0)}) dikelola melalui catatan pembayaran/webhook, bukan diedit manual agar riwayat transaksi tetap akurat.</p>`:""}
  <label class="field">Catatan<textarea name="notes" rows="3">${valEsc(row?.notes)}</textarea></label>
  <div class="actions"><button type="button" class="btn secondary" onclick="closeFullEditor()">Batal</button><button class="btn primary">Simpan seluruh perubahan</button></div>`;
 }
 $("modalTitle").textContent=title;
 $("modalForm").innerHTML=html;
 $("modal").classList.remove("hidden");
 const add=$("fullAddItem");
 if(add)add.onclick=()=>{const i=itemCount++;$("fullItems").insertAdjacentHTML("beforeend",fullItemHTML({description:"",qty:1,unit:"unit",unitPrice:0},i));};
 $("modalForm").onsubmit=async e=>{
  e.preventDefault();
  const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd);
  try{
   if(type==="customer")await call("saveCustomer",{...v,id:row?.id||""});
   else if(type==="service")await call("saveService",{...v,id:row?.id||"",price:Number(v.price||0),active:v.active==="TRUE"});
   else if(type==="job")await call("saveJob",{...v,id:row?.id||"",progress:Number(v.progress||0),estimatedMinutes:Number(v.estimatedMinutes||60)});
   else {
    const items=[];
    for(let i=0;i<itemCount;i++){
     const description=v["desc_"+i];
     if(description)items.push({description,qty:Number(v["qty_"+i]||0),unit:v["unit_"+i]||"unit",unitPrice:Number(v["price_"+i]||0)});
    }
    const payload={...v,id:row?.id||"",items:JSON.stringify(items)};
    await call(type==="quotation"?"saveQuotation":"saveInvoice",payload);
   }
   closeFullEditor();toast("Seluruh data berhasil disimpan.");await loadAll();
  }catch(err){toast(err.message);}
 };
}
function fullItemHTML(x,i){
 return `<div class="item-line form-grid" style="border:1px solid #e8edf4;border-radius:8px;padding:10px;margin:8px 0;position:relative">
 ${formField("Deskripsi item","desc_"+i,x.description,"text",true)}
 ${formField("Jumlah","qty_"+i,x.qty||1,"number",true)}
 ${formField("Satuan","unit_"+i,x.unit||"unit")}
 ${formField("Harga satuan","price_"+i,x.unitPrice||0,"number",true)}
 <div style="grid-column:1/-1;text-align:right"><button type="button" class="btn secondary" onclick="this.closest('.item-line').remove()">Hapus baris item</button></div>
 </div>`;
}
window.closeFullEditor=()=> $("modal").classList.add("hidden");
window.editRecord=(type,id)=>{
 const map={customer:CACHE.customers,quotation:CACHE.quotations,invoice:CACHE.invoices,job:CACHE.jobs,service:CACHE.services};
 const row=(map[type]||[]).find(x=>String(x.id)===String(id));
 if(!row){toast("Data tidak ditemukan.");return;}
 openFullEditor(type,row);
};
window.editJob=id=>window.editRecord("job",id);
openForm=function(type){openFullEditor(type,null);};
window.openFullEditor=openFullEditor;

// Full editable list renderers (including catalogue and configuration).
const _renderV22=render;
render=function(){
 if(PAGE==="settings"){
  $("pageName").textContent="Pengaturan";$("heading").textContent="Pengaturan integrasi";
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page==="settings"));
  $("primaryAction").style.display="none";$("pageBody").innerHTML=settingsHTML();loadSettingsStatus();return;
 }
 $("primaryAction").style.display="";
 if(PAGE==="services"){
  $("pageName").textContent="Katalog jasa";$("heading").textContent="Katalog jasa";
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page==="services"));
  $("primaryAction").textContent="＋ Tambah jasa";
  $("pageBody").innerHTML=servicesHTML();return;
 }
 _renderV22();
};
function servicesHTML(){return `<div class="panel"><div class="toolbar"><h2>Daftar katalog jasa</h2></div><div class="table-wrap"><table><thead><tr><th>Nama jasa</th><th>Deskripsi</th><th>Satuan</th><th>Harga default</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${CACHE.services.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.description)}</td><td>${esc(x.unit)}</td><td>${money(x.price)}</td><td>${esc(x.active)}</td><td><button class="btn secondary" onclick="editRecord('service','${x.id}')">Edit</button> <button class="btn secondary" onclick="deleteRecord('service','${x.id}')">Hapus</button></td></tr>`).join("")}</tbody></table></div>${CACHE.services.length?"":'<div class="empty">Belum ada katalog jasa.</div>'}</div>`;}
function settingsHTML(){return `<div class="panel"><h2>Konfigurasi integrasi</h2><p class="muted">Simpan konfigurasi langsung ke Apps Script Script Properties. Secret hanya dikirim melalui POST body dan tidak pernah dibaca kembali ke browser.</p><div id="configStatus" class="config-status">Memeriksa konfigurasi…</div><form id="settingsForm">
 <div class="form-grid">
 ${formField("Email admin untuk notifikasi","ADMIN_EMAIL","","email")}
 ${formField("Kapasitas work order per hari","MAX_JOBS_PER_DAY","2","number")}
 ${formField("Telegram Bot Token","TELEGRAM_BOT_TOKEN","","password")}
 ${formField("Telegram Chat ID","TELEGRAM_CHAT_ID","","text")}
 ${formField("Midtrans Server Key","MIDTRANS_SERVER_KEY","","password")}
 ${formField("Midtrans Client Key","MIDTRANS_CLIENT_KEY","","password")}
 ${formSelect("Mode Midtrans","MIDTRANS_IS_PRODUCTION",[["false","Sandbox"],["true","Production"]],"false")}
 ${formField("Ganti APP_PIN (opsional, min. 20 karakter)","APP_PIN","","password")}
 </div><p class="hint">Kosongkan field secret jika tidak ingin mengubah nilai yang sudah tersimpan. APP_PIN baru akan mengganti PIN admin yang sedang dipakai.</p>
 <div class="actions"><button type="button" class="btn secondary" onclick="testTelegramUI()">Tes Telegram</button><button class="btn primary">Simpan pengaturan</button></div></form>
 <iframe name="wfpSettingsFrame" id="wfpSettingsFrame" style="display:none"></iframe>
 </div>
 <div class="panel"><h2>Daftar Script Properties</h2><p class="muted">Status di bawah hanya menunjukkan apakah konfigurasi tersedia. Nilai token/key tidak ditampilkan demi keamanan.</p><div id="configChecklist" class="config-status">Memuat…</div></div>`;}
async function loadSettingsStatus(){
 try{
  const r=await call("getConfigStatus"),d=r.data;
  $("configStatus").innerHTML=`<b>Mode Midtrans:</b> ${esc(d.midtransMode)} · <b>Kapasitas:</b> ${d.capacity} work order/hari`;
  const items=[["ADMIN_EMAIL",d.adminEmail],["TELEGRAM_BOT_TOKEN",d.telegramBot],["TELEGRAM_CHAT_ID",d.telegramChat],["MIDTRANS_SERVER_KEY",d.midtransServer],["MIDTRANS_CLIENT_KEY",d.midtransClient],["JOB_PHOTO_FOLDER_ID",d.photoFolder]];
  $("configChecklist").innerHTML=items.map(([k,v])=>`<div class="priority-item"><b>${k}</b><span class="pill ${v?"green":"red"}">${v?"Tersimpan":"Belum diatur"}</span></div>`).join("");
  $("settingsForm").onsubmit=e=>{
   e.preventDefault();
   const fd=new FormData(e.currentTarget),values=Object.fromEntries(fd);
   if(values.APP_PIN&&values.APP_PIN.length<20){toast("APP_PIN minimal 20 karakter.");return;}
   const frame=$("wfpSettingsFrame"),form=document.createElement("form");
   form.method="POST";form.action=API;form.target=frame.name;form.style.display="none";
   const payload={action:"saveSettings",pin:PIN,...values};
   Object.entries(payload).forEach(([k,v])=>{const input=document.createElement("input");input.type="hidden";input.name=k;input.value=String(v??"");form.appendChild(input)});
   document.body.appendChild(form);form.submit();form.remove();
   toast("Pengaturan dikirim ke Apps Script…");
   if(values.APP_PIN){PIN=values.APP_PIN;sessionStorage.setItem("wf_pin",PIN);}
   setTimeout(async()=>{try{await loadSettingsStatus();toast("Pengaturan tersimpan. Cek status konfigurasi.");}catch(err){toast("Belum terverifikasi: "+err.message)}},3500);
  };
 }catch(e){$("configStatus").textContent=e.message;}
}
window.testTelegramUI=async()=>{try{await call("testTelegram");toast("Permintaan tes Telegram dikirim.");}catch(e){toast(e.message)}};

// Replace primary action handler so every module has a proper create form.
$("primaryAction").onclick=()=>openFullEditor(PAGE==="customers"?"customer":PAGE==="quotations"?"quotation":PAGE==="invoices"?"invoice":PAGE==="services"?"service":"job",null);
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{PAGE=b.dataset.page;render()});
