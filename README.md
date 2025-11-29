# Graduation Vaults  
A transparent, non-custodial, read-only dashboard and API layer for student Graduation Vaults.

Graduation Vaults are donation-based, time-locked multi-signature wallets created for students at partner microschools.  
Each vault is viewable through a public dashboard and governed by a **3-of-4 Multi-Sig SAFE account**, ensuring that  
funds cannot be withdrawn without the Parent/Guardian and at least two oversight signatures.  
(Self-Defi never holds keys, never initiates withdrawals, and never takes custody.)

This repository includes:

- A static GitHub Pages UI (`/docs`)  
- A Cloudflare Worker proxy (`/worker`)  
- Local mock data for development  
- A fully documented signer governance model  
- A real-time SAFE API–ready architecture  

White Paper reference: _Graduation Vaults — Governance, Timelock, and Oversight Architecture_  [oai_citation:0‡White Paper 11:29:25.pdf](sediment://file_00000000eeb0720c838fa4376ff3ab6f)

---

## 🌐 Live Dashboard
GitHub Pages Deployment:  
https://self-defi.github.io/Graduation-Vaults/

The dashboard is **public, read-only**, and displays:

- Total number of student vaults  
- Total pool balance (POL + USD equivalent)  
- Global signer set  
- Vault-specific balances  
- Masked student identifiers  
- Vault status (e.g., “Locked”)  
- Last synchronization timestamp  

No private keys or privileged functions are exposed.

---

## 🔐 Governance Model: 3-of-4 Multi-Sig (Parent Required)

Each student vault is a SAFE account enforced by:

### **Signers**
1. **Parent / Guardian** — Required signer for *all* withdrawals  
2. **School Representative** — Admin or principal  
3. **Teacher / Staff / Counselor**  
4. **Independent Trustee / Community Oversight**

### **Threshold**
- **3 signatures required**, AND  
- **Parent/Guardian must be one of them**

### **Self-Defi’s Role**
- Provides UI and infrastructure **only**  
- Holds **zero keys**  
- Not a custodian  
- Cannot approve, initiate, or process withdrawals  
- Cannot modify vaults or access funds  

This structure ensures parental authority, shared oversight, and complete transparency.

---

## 📁 Project Structure
Graduation-Vaults/
│
├── docs/                  # Static front-end served by GitHub Pages
│   ├── index.html         # Main Dashboard UI
│   ├── how-it-works.html  # Governance + Architecture explainer
│   ├── app.js             # UI logic, mock data, SAFE-ready hooks
│   ├── styles.css         # Visual theme
│   ├── assets/            # Logos and images
│   └── data/students.json # Local mock student dataset
│
├── worker/                # Cloudflare Worker API
│   └── index.js           # Endpoints: poolSummary, vaults, vault/:address
│
├── .gitignore
├── LICENSE
└── README.md
---

## 🧩 How the UI Works

The front-end (`/docs`) is a simple, static dashboard:

- Pulls data from the Worker API  
- Displays vault cards (masked student names + balances)  
- Renders a detail panel with signer information  
- Shows governance and timelock rules  
- Provides a clean, mobile-responsive interface  
- Contains no privileged actions (view-only)

### Features
- Real-time balance aggregation  
- Automatic currency conversion  
- Type-ahead student search  
- Vault detail sidebar  
- Last sync timestamps  
- Works in full mock mode (no API required)

---

## ☁️ API Layer (Cloudflare Worker)

The Worker (`/worker/index.js`) provides three read-only endpoints:

### `GET /api/poolSummary`
Returns:
- Total vaults  
- Total POL and USD balances  
- Global signer set  
- Last sync timestamp  

### `GET /api/vaults`
Returns a list of all vaults with:

- Student ID  
- Masked name  
- Safe address  
- Balances  
- Signer set  
- Status  
- Last activity  

### `GET /api/vault/:safeAddress`
Returns a single vault by SAFE address.

### Modes
- **Mock Mode** — used automatically when no SAFE list is provided  
- **Live Mode** — uses SAFE API via environment variables and SAFE_LIST

---

## 🛠 SAFE Integration (Future Expansion)

When the school decides to onboard real signers:

1. A SAFE is created for each student  
2. Parent + 3 oversight roles are added as owners  
3. Threshold is set to **3 of 4 (Parent Required)**  
4. Worker API is connected to the SAFE Gateway  
5. UI switches from mock → live mode automatically

The system is designed to handle:

- Per-vault signer lists  
- Real SAFE balances  
- On-chain events  
- Full auditability

---

## 🔧 Local Development

No build system is required.

Simply clone and open:

```bash
git clone https://github.com/Self-Defi/Graduation-Vaults.git
cd Graduation-Vaults/docs
open index.html
