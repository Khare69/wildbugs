# 🪲 WildBugs — Citizen Science Biodiversity Tracker

> **A full-stack, research-grade citizen-science platform empowering nature explorers, researchers, and communities to catalog regional insects, identify species using AI vision, combat misidentification with lookalike diagnostics, listen to bio-acoustic calls, and map biodiversity in real time.**

[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20TypeScript-blue)](https://vitejs.dev/)
[![Backend Engine](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Prisma%20ORM-green)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-SQLite%20via%20Prisma-orange)](https://www.prisma.io/)
[![Tests Passing](https://img.shields.io/badge/Tests-29%2F29%20Passed%20(100%25)-brightgreen)](./test_suite.mjs)

---

## 🚀 Quick Start (Local Setup in 2 Minutes)

### 1. Backend Server
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
* **API Base**: `http://localhost:3001`
* **Health Check**: `http://localhost:3001/api/health`

### 2. Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
* **Application URL**: `http://localhost:5173`

---

## 🔑 Demo Account Credentials (For Hackathon Judges)

| Field | Value |
|---|---|
| **Email** | `demo@wildbugs.org` |
| **Password** | `password123` |
| **Convenience** | Click **"⚡ Auto-fill Demo Account"** directly on the Login page |
| **Expert Switch** | Click **"Become Expert"** on the [Expert Portal](http://localhost:5173/admin) to test scientific review features |

---

## 🌟 Key Features & Capabilities

### 1. 🔬 AI Vision Insect Identification (Hybrid Engine)
* Drag-and-drop or direct mobile camera field capture.
* Automatic browser GPS geolocation with 1-click **↻ Refresh GPS**.
* **Top-3 Taxonomic Candidate Predictions** with animated probability distribution meters.
* **Hybrid Multimodal Gemini Vision**: If `GEMINI_API_KEY` is present, uses Google Gemini 1.5 Flash for vision classification with entomological reasoning notes; seamlessly falls back to the edge heuristic neural engine if offline.
* **Offline Wilderness Mode**: Local queue storage when observing in remote forests with 1-click auto-sync when network returns.

### 2. 🗺️ Geospatial Biodiversity Map & Density Heatmap
* Interactive Leaflet geospatial canvas with OpenStreetMap tiles.
* **Density Heatmap Mode**: Toggle between individual taxonomic markers `[📍 Markers]` and radiant radial density gradients `[🔥 Heatmap]`.
* **Temporal Horizon Filtering**: Filter observations by `All Time`, `Past 30 Days`, or `Past 7 Days`.
* **Taxonomic Family color-coded markers** (Nymphalidae, Apidae, Coccinellidae, Aeshnidae, Mantidae).
* Specimen detail popups with observer name, verification status, and direct links.

### 3. ⚖️ Lookalike Species Spotter Matrix
* Side-by-side diagnostic comparison tool (`/species/compare`) designed to solve the critical citizen-science problem of insect misidentification.
* Visual trait breakdown: **Morphology & Pile**, **Wings & Aerodynamics**, **Defense / Stings / Venom**, **Habitat**, **Diet**, and **Activity Rhythms**.
* Curated 1-click lookalike presets:
  - *Honeybee vs. Buff-Tailed Bumblebee* (Slender hive pollinator vs. fuzzy buzz-pollinator)
  - *Luna Moth vs. Atlas Moth* (Lime-green leafy tails vs. cobra-head wingtips)
  - *Praying Mantis vs. Indian Stick Insect* (Raptorial ambush hunter vs. twig mimic)
  - *Seven-Spotted Ladybug vs. Eastern Firefly* (Aphid predator dome vs. bioluminescent beetle)

### 4. 🎧 Bio-Acoustic Synthesizer Field Guide
* Integrated Web Audio API sound generator on species detail pages.
* Synthesizes authentic acoustic frequencies:
  - 235Hz saw-wave low frequency bee flight buzz with tremolo flutter.
  - 4400Hz high-frequency oscillating cicada AM pulse bursts.
  - 4800Hz orthopteran stridulation grasshopper chirps.
* Animated equalizer bars with synchronized sound wave feedback.

### 5. 🛡️ Expert Entomologist & Governance Dashboard (`/admin`)
* Comprehensive platform health analytics: Total observations, pending review backlog, research-grade verification rate, and community engagement.
* **Taxonomic Review Queue**: Filter by review status (`pending`, `community_verified`, `expert_verified`).
* **Expert Certify**: 1-click scientific stamp elevating citizen sightings to research grade.
* **Moderation Actions**: Instant purge of erroneous or violating records with cascading clean-up.
* **Dynamic Role Switcher**: Frictionless evaluation tool allowing evaluators to switch between Citizen Naturalist, Expert Naturalist, and Platform Administrator.

### 6. ❤️ Social Reactions & Peer Verification
* **Heart Reactions**: Real-time optimistic upvote/heart button on sightings with instant counter update.
* **Peer Verification**: 1-Click **"👍 Agree with ID"** peer review.
* Auto-promotion to **`✓ Community Verified`** upon community consensus.
* Nested community discussion and field observations thread.

### 7. 🏆 Gamification & Milestone Badges
* Automated badge engine (*Pioneer Explorer*, *Pollinator Ally*, *Biodiversity Maestro*, *Eagle Eye*, *Nocturnal Naturalist*).
* Community Leaderboard with 1st, 2nd, and 3rd place podium.
* Seasonal bio-blitz conservation challenges with progress tracking.

### 8. 🌙 "Night Explorer" Dark Mode
* Specially tuned for nocturnal field expeditions (blacklight moth sheet baiting, firefly observation) to preserve night vision.
* Smooth toggle in navbar (`🌙 Night Mode` / `☀️ Day Mode`) with persistent preference storage and OS `prefers-color-scheme` support.

### 9. 📥 Global Research Dataset Export (CSV)
* Global research export (`GET /api/sightings/export/csv`) formatted for GBIF (Global Biodiversity Information Facility) data pipelines.
* Personal Field Journal CSV export from the user profile.

---

## 🛠️ Architecture & Tech Stack

```
Frontend:   React 18 · Vite · TypeScript · Leaflet · Zustand · TanStack Query
Backend:    Node.js · Express · TypeScript · Prisma ORM · SQLite · JWT · Multer
AI/ML:      Google Gemini 1.5 Flash Vision (Multimodal) + Edge Entomological Classifier
Audio:      Web Audio API (Custom Frequency Oscillator & LFO Synthesis)
Testing:    ESM Automated Integration Test Suite (29/29 Passing)
```

---

## 🧪 Running the Automated Test Suite

```bash
node test_suite.mjs
```
Runs 29 comprehensive integration test vectors against the live backend server.
