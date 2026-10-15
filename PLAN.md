# 🪲 WildBugs — 5-Hour Advanced Sprint Plan

> **Start**: ~3:05 PM · **Target Finish**: ~8:05 PM · **Total Time**: 5h 00m  
> **Hard Deadline**: 11:59 PM (Leaves nearly 4 hours of safety buffer)  
> **Model**: Gemini 3.8 Flash (High) — Ultra-rapid implementation  
> **Strategy**: 4 concentrated 60-minute sprints + 60-minute demo prep buffer  

---

## ⏱️ Master 5-Hour Schedule — STATUS: 100% COMPLETED ✅

```
✅ SPRINT 1: Map Density Heatmap + Time Filter + Insect Audio Player  ─── DONE
✅ SPRINT 2: Lookalike Species Spotter + Sighting Heart Reactions    ─── DONE
✅ SPRINT 3: Admin & Expert Governance Dashboard + Platform Metrics  ─── DONE
✅ SPRINT 4: "Night Explorer" Dark Mode + Hybrid Gemini Vision       ─── DONE
🏆 BUFFER: Verification, Full Build (Code 0), and Demo Readiness     ─── READY
```

---

## 🎯 Implementation Status Table

| Sprint | Status | Core Shipments | Hackathon Edge |
|---|---|---|---|
| **Sprint 1** | **COMPLETED** ✅ | • Density Heatmap layer toggle on Map<br>• Temporal filter (7d / 30d / All Time)<br>• Species Audio Field Guide (synthesized calls & audio waves) | 🎧 Rare sonic feature + GIS depth |
| **Sprint 2** | **COMPLETED** ✅ | • "Lookalike Spotter" diagnostic comparison tool (`/species/compare`)<br>• Sighting Heart/Like reactions with real-time counters (`POST /api/sightings/:id/like`)<br>• Fast curated lookalike presets (Honeybee/Bumblebee, Luna/Atlas Moth, etc.) | 🦋 Solves misidentification pain point |
| **Sprint 3** | **COMPLETED** ✅ | • Admin & Expert Dashboard (`/admin`)<br>• Pending review queue with 1-click "Expert Certify"<br>• Moderation actions & platform analytics (`/api/admin/metrics`)<br>• 1-click role switcher for frictionless judge evaluation | 🛡️ Fulfills missing governance requirements |
| **Sprint 4** | **COMPLETED** ✅ | • "Night Explorer" Dark Mode theme toggle (🌙 / ☀️)<br>• Hybrid Gemini Vision API multimodal hook with local heuristic fallback<br>• AI Model & reasoning notes badges | 🌙 Aesthetic wow + AI integration |
| **Buffer** | **COMPLETED** ✅ | • End-to-end smoke test passed<br>• Frontend & backend typechecked & built (`npm run build` exit code 0)<br>• Ready for immediate live demo & presentation | 🏆 Stress-free submission with huge time buffer |

---

## 🚀 Prompts for Gemini 3.8 Flash

### 🔹 Sprint 1 (3:05 → 4:05 PM): Heatmap + Temporal Filter + Audio Calls
```
Add Heatmap layer, temporal filter, and species audio to WildBugs:

BACKEND:
- In src/routes/sightings.ts:
  Support ?timeframe= (7d, 30d, all). Filter by createdAt >= now - X days.

FRONTEND:
1. In src/pages/MapPage.tsx:
   - Add toggle: [📍 Markers] | [🔥 Density Heatmap]
   - Add Time Filter pill buttons: [All Time] [Past 30 Days] [Past 7 Days]
   - When Heatmap is selected, render weighted glowing circular heat gradients representing biodiversity density.
   
2. In src/pages/SpeciesDetailPage.tsx:
   - Add an "Insect Audio & Sound Call" card.
   - Synthesize or play species sound frequencies with Web Audio API (e.g., oscillating cricket chirp at 4.5kHz, low bee hum at 250Hz, or rhythmic cicada bursts).
   - Show an animated sound wave canvas with a Play/Pause button.
```

---

### 🔹 Sprint 2 (4:05 → 5:05 PM): Lookalike Spotter + Heart Likes
```
Add Lookalike Species Comparison and Sighting Likes:

BACKEND:
- Create Like model in Prisma: SightingLike(id, sightingId, userId, createdAt, @@unique([sightingId, userId]))
- Endpoint: POST /api/sightings/:id/like (authenticate, toggle like, return count + hasLiked)
- In GET /api/sightings/:id, return likeCount and hasLiked.

FRONTEND:
1. Add Like heart button (❤️ X) to SightingDetailPage and recent discoveries cards with instant optimistic update.
2. Create src/pages/CompareSpeciesPage.tsx:
   - Side-by-side dropdown selectors (Species A vs Species B).
   - Side-by-side photo, family, diet, size, and a bulleted "Key Diagnostic Differences" comparison table.
   - Add "Compare with Lookalikes" button on SpeciesDetailPage.
```

---

### 🔹 Sprint 3 (5:05 → 6:05 PM): Admin & Expert Dashboard
```
Create an Admin & Expert Moderation Dashboard:

BACKEND:
- Create src/routes/admin.ts:
  - GET /api/admin/metrics: return userCount, totalSightings, verifiedCount, topFamily
  - GET /api/admin/pending-verifications: return sightings where status is 'pending'
  - POST /api/admin/sightings/:id/expert-verify: set status to 'expert_verified'
  - DELETE /api/admin/sightings/:id: remove flagged sighting
  (Protect with role check: req.user.role === 'admin' || 'expert')

FRONTEND:
- Create src/pages/AdminDashboardPage.tsx:
  - Metric stat counters (Platform Users, Total Discoveries, Verification Rate)
  - Table of pending sightings with thumbnail, user, AI confidence, and [✓ Expert Verify] [🗑️ Remove] actions.
  - Mount at /admin with role gate.
  - Add Admin link in Navbar when logged-in user is admin/expert.
```

---

### 🔹 Sprint 4 (6:05 → 7:05 PM): Dark Mode + Gemini Vision
```
Add "Night Explorer" Dark Mode and optional Real Gemini Vision integration:

BACKEND:
- In src/services/identification.ts:
  If process.env.GEMINI_API_KEY is present, call Google Generative AI (gemini-1.5-flash) with the image base64 to identify commonName, scientificName, and confidence.
  If no key or error, use existing mock candidate service.

FRONTEND:
- Add Dark Mode toggle (🌙 / ☀️) in Navbar.
- Add CSS tokens for data-theme="dark" in index.css (dark charcoal background, high-contrast typography, emerald highlights).
```
