# 🏆 WildBugs — Devfolio Hackathon Submission Kit

Use the pre-filled fields below to copy-paste directly into your **Devfolio Project Submission Form**.

---

## 📌 Basic Information

* **Project Name**: `WildBugs`
* **Tagline**: `Citizen-science biodiversity tracker with AI vision, lookalike diagnostics, bio-acoustic calls, density heatmaps, and expert governance.`
* **Category**: Citizen Science / AI & ML / Environment & Sustainability / Social Impact

---

## 📝 The Problem It Solves

> Invertebrate populations are declining globally at alarming rates, yet insects represent over 80% of all animal species on Earth. Citizen-science biodiversity projects are essential for tracking ecological health, but existing platforms face three critical bottlenecks:
> 
> 1. **High Misidentification Rates**: Casual observers frequently mistake deceptive lookalikes and mimics (e.g., Honeybees vs. Bumblebees, Viceroy vs. Monarch butterflies, Mantises vs. Stick Insects), leading to corrupted biodiversity datasets.
> 2. **Silent Catalogs Without Acoustic Learning**: Many key invertebrates (cicadas, grasshoppers, bees) are primarily identified by sound and wing frequency, yet field apps remain entirely visual.
> 3. **The Amateur-Expert Disconnect**: Observations languish without formal peer review, lacking the governance tools needed for academic or conservation researchers to filter research-grade occurrences.
> 
> **How WildBugs Solves This**:
> * **Hybrid Multimodal AI Vision**: Classifies specimens from mobile camera uploads, providing Top-3 candidate probability distributions and diagnostic reasoning.
> * **Lookalike Species Spotter Matrix**: Side-by-side diagnostic comparison tool breaking down anatomy, wing aerodynamics, stinger/venom traits, diet, and activity rhythms.
> * **Bio-Acoustic Audio Field Guide**: Uses the browser's Web Audio API to synthesize authentic species flight buzzes, cicada AM pulse chirps, and grasshopper stridulations with animated equalizers.
> * **Interactive Geospatial Density Heatmap**: Toggle between family-coded pins and radiant concentration heatmaps with 7-day, 30-day, and all-time temporal horizons.
> * **Tiered Scientific Peer Review & Expert Dashboard**: Sighting statuses elevate from `pending` to `community_verified` through peer consensus, with an Expert Entomologist Portal for scientific certification and moderation.
> * **Offline Wilderness Mode**: Allows naturalists in remote forests without cellular coverage to queue observations locally and auto-sync when back in range.
> * **1-Click Research Export**: Generates standard GBIF-compatible CSV biodiversity datasets for conservation researchers.

---

## 💡 How We Built It (Architecture & Technologies)

* **Frontend**: Built with **React 18**, **Vite**, and **TypeScript**, styled with a tailored Vanilla CSS design system supporting an ambient **"Night Explorer" Dark Mode** for nocturnal field expeditions.
* **Geospatial Mapping**: Powered by **Leaflet** and **React-Leaflet**, featuring custom SVG div-markers and layered radial density circles with temporal windowing.
* **State & Data Caching**: Managed with **Zustand** (auth session and theme stores) and **TanStack React Query** (optimistic caching and background revalidation).
* **Bio-Acoustic Synthesizer**: Implemented purely in the client with **Web Audio API** oscillators, gain nodes, and low-frequency oscillator (LFO) tremolo modulators.
* **Backend Engine**: Built with **Node.js**, **Express**, and **TypeScript**, adhering to strict MVC separation with token-based JWT authentication, bcrypt password hashing, and Multer multipart processing.
* **ORM & Database**: Powered by **Prisma ORM** over **SQLite**, utilizing foreign key cascades, unique compound indexes, and automated migrations.
* **Hybrid Multimodal Vision**: Integrates Google **Gemini 1.5 Flash Vision** with a resilient zero-failure local heuristic neural fallback for complete offline resilience.
* **Testing**: 29 automated end-to-end integration test vectors (`test_suite.mjs`) covering all authentication, observation lifecycles, and edge cases.

---

## 🧗 Challenges We Ran Into

1. **Geospatial Heatmap Rendering**: Creating smooth, responsive density heatmaps in Leaflet without heavy external GIS dependencies required crafting weighted concentric SVG radial paths with opacity falloffs.
2. **Browser Autoplay & AudioContext Policies**: Modern browsers strictly suspend audio contexts until an explicit user gesture occurs; we engineered an asynchronous resume lifecycle to ensure seamless bio-acoustic playback across all devices.
3. **Dual Online/Offline Vision Pipeline**: Balancing real multimodal cloud AI with wilderness offline requirements led us to architect an adaptive hybrid pipeline that never crashes or leaves an explorer stranded without an identification.
4. **Prisma Windows File Locking**: Navigating SQLite engine file handles on Windows during hot-reloads taught us valuable lessons in process management and automated build scripts.

---

## 🏷️ Tech Stack Tags for Devfolio

`React` · `TypeScript` · `Vite` · `Leaflet` · `Node.js` · `Express` · `Prisma` · `SQLite` · `Web Audio API` · `Gemini Vision` · `Zustand` · `TanStack Query` · `JWT` · `Citizen Science`

---

## 🔑 Demo Account Credentials (For Judges)

* **Email**: `demo@wildbugs.org`
* **Password**: `password123`
* **Quick Demo Feature**: Click **"⚡ Auto-fill Demo Account"** on the Login page.
* **Role Switcher**: Click **"Become Expert"** on the [Expert Portal](http://localhost:5173/admin) to demonstrate governance and certification workflows.

---

## 🎬 2-Minute Judge Walkthrough Script

1. **0:00 - 0:25 (The Hook)**: Show the Home Page and live **Biodiversity Map**. Toggle from `[📍 Markers]` to `[🔥 Heatmap]` and switch from `All Time` to `Past 7d` to show seasonal insect activity.
2. **0:25 - 0:50 (AI & Offline Field Logging)**: Navigate to `/upload`. Show auto-detected GPS coordinates. Upload an insect photo, show the **Top-3 AI Candidates distribution**, and point out the **Offline Wilderness Queue** toggle.
3. **0:50 - 1:15 (Lookalike Spotter & Bio-Acoustics)**: Go to `/species/compare`. Click preset *"Honeybee vs Bumblebee"* to showcase the anatomical difference matrix. Click into a species page and press ▶ to play the synthesized **Bio-Acoustic Flight Buzz**.
4. **1:15 - 1:45 (Community & Expert Governance)**: Open an observation, click the ❤️ heart reaction and 👍 agree verification. Navigate to `/admin`, show the live **Expert Entomologist Dashboard**, and click `✓ Certify` to grant scientific verification.
5. **1:45 - 2:00 (Night Explorer Mode & Export)**: Toggle the navbar 🌙 **Night Explorer** dark mode. Go to the profile page and click `📥 Export Journal (CSV)` to demonstrate researcher data export.
