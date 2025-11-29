/* Graduation Vaults UI — docs/app.js */

const PROXY_BASE = ""; 
// later set to your Worker domain, e.g. "https://gv-proxy.selfdefi.workers.dev"

let students = [];
let vaults = [];      // enriched vault data
let poolSummary = {};

const els = {
  totalVaults: document.getElementById("totalVaults"),
  totalBalance: document.getElementById("totalBalance"),
  totalBalanceUsd: document.getElementById("totalBalanceUsd"),
  officialSigners: document.getElementById("officialSigners"),
  lastSync: document.getElementById("lastSync"),
  searchInput: document.getElementById("searchInput"),
  typeahead: document.getElementById("typeahead"),
  vaultGrid: document.getElementById("vaultGrid"),
  vaultPanel: document.getElementById("vaultPanel"),
  panelContent: document.getElementById("panelContent"),
  panelClose: document.getElementById("panelClose"),
};

// ---------- Utilities ----------
const shortAddr = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : "—";
const fmt = (n, d=2) => (n ?? 0).toLocaleString(undefined,{maximumFractionDigits:d});
const usd = (n) => `$${fmt(n,2)}`;

function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

// ---------- Data loading ----------
async function loadStudents(){
  const res = await fetch("./data/students.json");
  students = await res.json();
}

async function loadPoolData(){
  if (!PROXY_BASE) {
    // MOCK MODE (until proxy is live)
    vaults = students.map(s => ({
      ...s,
      polBalance: Math.random() * 250 + 10,
      usdBalance: Math.random() * 250 + 10 * 0.25,
      status: "Locked",
      signers: {
        parentGuardian: "0xaaaa…1111",
        schoolRep: "0xbbbb…2222",
        staffOrCounselor: "0xcccc…3333",
        independentTrustee: "0xdddd…4444",
        threshold: "3 of 4 (Parent Required)"
      },
      lastActivity: new Date().toISOString()
    }));

    poolSummary = {
      totalVaults: vaults.length,
      totalPol: vaults.reduce((a,v)=>a+v.polBalance,0),
      totalUsd: vaults.reduce((a,v)=>a+v.usdBalance,0),
      signersGlobal: [
        "Parent/Guardian (required)",
        "School Representative",
        "Counselor/Staff",
        "Independent Trustee"
      ],
      lastSync: new Date().toLocaleString()
    };
    return;
  }

  // REAL MODE (Worker endpoints)
  const [sumRes, vaultRes] = await Promise.all([
    fetch(`${PROXY_BASE}/api/poolSummary`),
    fetch(`${PROXY_BASE}/api/vaults`)
  ]);

  poolSummary = await sumRes.json();
  vaults = await vaultRes.json();
}

// ---------- Render summary ----------
function renderSummary(){
  els.totalVaults.textContent = poolSummary.totalVaults ?? vaults.length;
  els.totalBalance.textContent = `${fmt(poolSummary.totalPol)} POL`;
  els.totalBalanceUsd.textContent = usd(poolSummary.totalUsd);

  // even if API doesn't send signersGlobal yet, show the standard set
  els.officialSigners.textContent =
    "Parent/Guardian (required) • School Representative • Counselor/Staff • Independent Trustee";

  els.lastSync.textContent = poolSummary.lastSync ?? "—";
}

// ---------- Render vault grid ----------
function renderVaults(list=vaults){
  els.vaultGrid.innerHTML = "";
  list.forEach(v=>{
    const card = document.createElement("div");
    card.className = "vault-card";
    card.innerHTML = `
      <div class="vault-name">${v.displayName} <span class="mono">(${v.studentId})</span></div>
      <div class="vault-meta">${shortAddr(v.safeAddress)}</div>
      <div class="vault-balance">${fmt(v.polBalance)} POL</div>
      <div class="vault-meta">${usd(v.usdBalance)}</div>
      <div class="badge ${v.status !== "Locked" ? "warn":""}">${v.status}</div>
      <button class="btn">View Vault</button>
    `;
    card.querySelector("button").onclick = ()=>openPanel(v.studentId);
    els.vaultGrid.appendChild(card);
  });
}

// ---------- Search / typeahead ----------
function updateTypeahead(q){
  const query = q.trim().toLowerCase();
  if (!query) return hide(els.typeahead);

  const matches = students
    .filter(s => s.displayName.toLowerCase().includes(query))
    .slice(0,8);

  if (!matches.length) return hide(els.typeahead);

  els.typeahead.innerHTML = "";
  matches.forEach(m=>{
    const item = document.createElement("div");
    item.className = "typeahead-item";
    item.innerHTML = `
      <div>${m.displayName}</div>
      <div class="mono">${m.studentId}</div>
    `;
    item.onclick = ()=>{
      els.searchInput.value = m.displayName;
      hide(els.typeahead);
      openPanel(m.studentId);
    };
    els.typeahead.appendChild(item);
  });

  show(els.typeahead);
}

els.searchInput.addEventListener("input", e=>updateTypeahead(e.target.value));
els.searchInput.addEventListener("keydown", e=>{
  if (e.key === "Enter"){
    const q = els.searchInput.value.trim().toLowerCase();
    const hit = students.find(s=>s.displayName.toLowerCase()===q)
             || students.find(s=>s.displayName.toLowerCase().includes(q));
    if (hit) openPanel(hit.studentId);
    hide(els.typeahead);
  }
});

document.addEventListener("click", e=>{
  if (!els.typeahead.contains(e.target) && e.target !== els.searchInput) {
    hide(els.typeahead);
  }
});

// ---------- Panel ----------
function openPanel(studentId){
  const v = vaults.find(x=>x.studentId===studentId);
  if (!v) return;

  const s = v.signers || {};

  els.panelContent.innerHTML = `
    <h3>${v.displayName} <span class="mono">(${v.studentId})</span></h3>
    <div class="mono">Safe: ${v.safeAddress} <button class="btn mono" id="copyAddr">Copy</button></div>

    <div class="section">
      <div class="kv"><div class="k">Graduation Year</div><div>${v.gradYear}</div></div>
      <div class="kv"><div class="k">Status</div><div>${v.status}</div></div>
    </div>

    <div class="section">
      <div class="kv"><div class="k">POL Balance</div><div>${fmt(v.polBalance)} POL</div></div>
      <div class="kv"><div class="k">USD Equivalent</div><div>${usd(v.usdBalance)}</div></div>
    </div>

    <div class="section">
      <div class="kv"><div class="k">Threshold</div><div>${s.threshold || "3 of 4 (Parent Required)"}</div></div>
      <div class="kv"><div class="k">Parent/Guardian</div><div class="mono">${s.parentGuardian || "—"}</div></div>
      <div class="kv"><div class="k">School Representative</div><div class="mono">${s.schoolRep || "—"}</div></div>
      <div class="kv"><div class="k">Counselor/Staff</div><div class="mono">${s.staffOrCounselor || "—"}</div></div>
      <div class="kv"><div class="k">Independent Trustee</div><div class="mono">${s.independentTrustee || "—"}</div></div>
    </div>

    <div class="section">
      <div class="kv"><div class="k">Last Activity</div><div>${new Date(v.lastActivity).toLocaleString()}</div></div>
    </div>
  `;

  show(els.vaultPanel);

  const copyBtn = document.getElementById("copyAddr");
  copyBtn?.addEventListener("click", async ()=>{
    await navigator.clipboard.writeText(v.safeAddress);
    copyBtn.textContent = "Copied";
    setTimeout(()=>copyBtn.textContent="Copy",1200);
  });

  history.replaceState({}, "", `#/vault/${studentId}`);
}

els.panelClose.onclick = ()=> {
  hide(els.vaultPanel);
  history.replaceState({}, "", "#/");
};

// ---------- Boot ----------
(async function init(){
  await loadStudents();
  await loadPoolData();
  renderSummary();
  renderVaults();
})();
