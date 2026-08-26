# RESQLINK: AI-Powered Citizen-Centric Emergency Assistance and Dispatch System

**Evaluating Equity, Efficacy, and Governance in Urban India**

Department of Computer Science and Business Systems
K S School of Engineering and Management (KSSEM)
Bengaluru, India

Aligned with **UN SDG 3: Good Health and Well-being** and **UN SDG 11: Sustainable Cities and Communities**

---

## Overview

**RESQLINK** is an AI-powered emergency assistance and dispatch mobile web application designed to address critical gaps in urban emergency response systems, with a specific focus on Bengaluru, India.

The platform enables citizens to request emergency assistance through a single-tap interface designed with accessibility and ease of use as core principles. It is particularly intended to support elderly users, differently-abled individuals, and users with limited digital literacy.

RESQLINK combines location verification, AI-assisted emergency dispatch, real-time fleet tracking, low-connectivity communication, and governance-oriented analytics into an integrated emergency response platform.

## Key Architecture and Capabilities

### 1. Client Application Layer

The client application provides a simplified emergency interface with:

* One-tap SOS activation
* High-contrast accessibility mode
* Speech synthesis and voice assistance
* Multilingual support for:

  * English
  * Kannada (ಕನ್ನಡ)
  * Hindi (हिन्दी)
* Responsive mobile-first interface

### 2. Location-Lock Safety Protocol

RESQLINK implements a dual-reading temporal location verification mechanism to improve the reliability of emergency triggers.

The protocol validates consecutive GPS readings within a maximum distance of **25 metres** to help distinguish genuine emergency requests from accidental activations and GPS signal jitter.

### 3. AI-Assisted Dispatch Engine

The dispatch engine supports responder allocation by evaluating multiple operational factors, including:

* Responder proximity
* Ambulance capability, including ALS and BLS units
* Hospital trauma-centre availability
* Live Bengaluru traffic conditions
* Estimated response time
* Peripheral ward equity weighting

The objective is to improve response efficiency while considering equitable access to emergency services across different geographic areas.

### 4. Dispatcher CAD Portal

The Computer-Aided Dispatch (CAD) portal provides emergency operators with a centralized command interface featuring:

* Real-time incident queues
* Live Leaflet-based fleet tracking
* Route polylines
* Responder location monitoring
* Unit status management
* Incident and dispatch information

### 5. Low-Connectivity SMS Fallback

To maintain emergency communication during mobile broadband outages or low-connectivity conditions, RESQLINK provides a Twilio-based SMS fallback mechanism.

The system transmits a compressed emergency payload designed for GSM/2G communication:

```text
RESQ#ID#LOC#ACC#TYPE#USR#TIME
```

The payload is designed to remain within the standard 160-character SMS constraint while retaining essential emergency information.

### 6. Equity, Efficacy, and Governance Dashboard

The EEG Dashboard provides a quantitative evaluation framework for assessing system performance, accessibility, and governance.

Key evaluation areas include:

* 2G versus 5G service parity
* SOS-to-confirmation latency
* Emergency dispatch performance
* Geographic equity
* Digital accessibility
* Data protection and privacy considerations
* Auditability and accountability

The project evaluates a target SOS-to-confirmation latency of approximately **8.4 seconds**, compared with approximately **195 seconds** for the traditional CAD workflow used as a comparison benchmark.

The platform also incorporates cryptographic hashing for an immutable audit ledger and considers compliance requirements under India's **Digital Personal Data Protection (DPDP) Act, 2023**.

---

## Technology and Architecture

The system is designed around the following technology components:

* **Frontend:** React / TypeScript
* **Build Tooling:** Vite
* **Mapping:** Leaflet
* **Emergency Communication:** Twilio SMS
* **Geolocation:** Browser Geolocation APIs
* **Deployment:** Netlify
* **Dependency Management:** pnpm

The architecture is designed to support real-time emergency workflows while maintaining accessibility, resilience, and auditability as primary design considerations.

---

## Local Development

### Prerequisites

Ensure that the following are installed:

* Node.js
* pnpm
* Git

### Installation

Clone the repository:

```bash
git clone https://github.com/abhintr2006/resqlink-app.git
cd resqlink-app
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm run dev
```

Open the local application at:

```text
http://localhost:3000
```

> The development server port may vary depending on the Vite configuration.

---

## Production Build

Create a production build using:

```bash
pnpm run build
```

The generated production files are placed in the `dist` directory.

To preview the production build locally:

```bash
pnpm run preview
```

---

## Deployment

### Netlify

RESQLINK can be deployed to Netlify using either of the following approaches.

#### Option 1: Manual Deployment

1. Build the application:

```bash
pnpm run build
```

2. Open the Netlify deployment interface.
3. Deploy the generated `dist` directory.

#### Option 2: GitHub Integration

Connect the repository to Netlify and configure:

```text
Build command: pnpm run build
Publish directory: dist
```

The included `netlify.toml` and `_redirects` configuration can be used to support SPA routing.

---

## Project Objectives

RESQLINK focuses on four primary objectives:

1. **Accessibility**
   Provide an emergency interface that can be used with minimal digital literacy.

2. **Response Efficiency**
   Reduce the time between emergency activation, verification, and responder allocation.

3. **Resilience**
   Maintain emergency communication capabilities during periods of poor mobile broadband connectivity.

4. **Equity and Governance**
   Evaluate emergency response performance across geographic and connectivity disparities while supporting privacy, transparency, and auditability.

---

## Academic and Governance Context

The project is grounded in the following academic and policy references:

* **Digital Personal Data Protection Act, 2023** — Government of India
* **MeitY AI Governance Guidelines, 2025** — including principles such as "Understandable by Design" and "People First"
* **Jesus et al. (2024)** — Research concerning dual-channel resilience under common-cause failures
* **Arora et al. (2026)** — Research concerning the rural-urban digital divide and 2G-based equity mitigation

---

## UN Sustainable Development Goals

RESQLINK aligns with the following United Nations Sustainable Development Goals:

### SDG 3 — Good Health and Well-being

The project aims to improve access to emergency assistance and support faster emergency response.

### SDG 11 — Sustainable Cities and Communities

The system addresses urban emergency-response accessibility, resilience, and equitable service delivery.

---

## Project Status

RESQLINK is an academic and research-oriented prototype intended to demonstrate the integration of AI-assisted dispatch, emergency communication resilience, accessibility, and governance evaluation within an urban emergency-response context.

Performance figures and system capabilities should be interpreted within the scope of the project's experimental evaluation and prototype implementation.

---

## Repository

**GitHub:** `https://github.com/abhintr2006/resqlink-app`

## Python Server

The frontend is now connected to a FastAPI server under `server/`. Start it in a separate terminal before launching the Vite app:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The frontend uses `http://localhost:8000/api` by default. To point it at another backend, set `VITE_API_BASE_URL` before running the frontend, for example `VITE_API_BASE_URL=https://api.example.com/api npm run dev`. See [`server/README.md`](server/README.md) for the endpoint map, environment variables, test commands, and production hardening notes.

## Academic Reference & Governance Grounding
- **Digital Personal Data Protection (DPDP) Act, 2023** – India
- **MeitY AI Governance Guidelines (2025)** – 'Understandable by Design' & 'People First'
- **Jesus et al. (2024)** – Dual-channel resilience under common cause failures
- **Arora et al. (2026)** – Rural-urban digital divide and 2G equity mitigation

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
