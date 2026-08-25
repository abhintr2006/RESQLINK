# RESQLINK: AI-Powered Citizen-Centric Emergency Assistance and Dispatch System

> **Evaluating Equity, Efficacy and Governance in Urban India**  
> Department of Computer Science and Business Systems, K S School of Engineering and Management (KSSEM), Bengaluru, India  
> Aligned with **UN SDG 3 (Good Health and Well-being)** & **UN SDG 11 (Sustainable Cities and Communities)**

---

## 📌 Overview

**RESQLINK** is an AI-powered emergency assistance and dispatch mobile web application designed to bridge critical gaps in urban emergency response networks (specifically tailored for Bengaluru, India). It empowers citizens—especially the elderly, differently-abled, and low-literacy users—to trigger emergency dispatch with a zero-learning-curve single tap.

### 🌟 Key Architecture & Capabilities
1. **Client Application Layer**: 1-Tap SOS trigger, high-contrast accessibility mode, and speech synthesis voice assistance in **English**, **ಕನ್ನಡ (Kannada)**, and **हिन्दी (Hindi)**.
2. **Location-Lock Safety Protocol**: Dual-reading temporal verification algorithm ensuring consecutive GPS fixes within $\le 25\text{m}$ to reject accidental triggers and signal jitter.
3. **AI-Assisted Dispatch Engine**: Optimal nearest-responder allocation matching ALS/BLS ambulances & hospital trauma centers with live Bengaluru traffic indexes and peripheral ward equity weighting.
4. **Dispatcher CAD Portal**: Live command center with real-time incident queue, live Leaflet fleet tracking map with route polylines, and unit status controls.
5. **Twilio 2G / Low-Connectivity SMS Fallback**: Transmits compressed 160-char SMS payloads (`RESQ#ID#LOC#ACC#TYPE#USR#TIME`) over GSM 2G towers when mobile broadband fails.
6. **Equity, Efficacy & Governance (EEG) Dashboard**: Quantitative evaluation suite assessing 2G vs 5G parity, SOS-to-confirm latency (~8.4s vs 195s traditional CAD), DPDP Act 2023 compliance, and a cryptographically hashed immutable audit ledger.

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Clone or extract the repository
git clone <your-repo-url>
cd resqlink-app

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🌐 Deploy to Netlify

### Option 1: Drag & Drop Deploy (Fastest)
1. Run `npm run build`
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder directly onto the page.

### Option 2: Connect via GitHub
- Build Command: `npm run build`
- Publish Directory: `dist`
- *(The included `netlify.toml` and `_redirects` handle all SPA routing automatically)*.

---

## 📄 Academic Reference & Governance Grounding
- **Digital Personal Data Protection (DPDP) Act, 2023** – India
- **MeitY AI Governance Guidelines (2025)** – 'Understandable by Design' & 'People First'
- **Jesus et al. (2024)** – Dual-channel resilience under common cause failures
- **Arora et al. (2026)** – Rural-urban digital divide and 2G equity mitigation
