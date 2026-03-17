

# PANOPTICON × ANIMUS × BSAT V94.0 — Implementation Plan

## Overview
A forensic intelligence platform with a dark tactical HUD interface, dual operating modes (I.S.A.C./A.N.N.A.), 25+ forensic capabilities, and rich data visualizations. Starting frontend-only with hardcoded sample data; Supabase backend added in a later phase.

---

## Phase 1: Foundation — Design System + Layout Shell
**Goal:** Establish the visual identity and structural skeleton.

- **Global Theming:** Custom CSS properties for ISAC/ANNA color palettes, JetBrains Mono + Inter fonts, scan-line overlay, 0-2px border radius enforcement
- **Zustand Store:** Core store with operating mode (ISAC/ANNA), active view, sample events, CLI history, feed state, mark/execute state
- **Design System Components:** EmberBackground (canvas particles), ScorchedCard (corner marks, glow hover), MagmaButton (angled clip-path), GlitchText (RGB split glitch), TacticalBadge, ScanLineOverlay, CornerMarks
- **4-Panel Tactical Grid Layout:** Header (56px), Left Sidebar (320px), Center Stage (flex), Right Sidebar (360px), CLI Footer (180px) — CSS Grid, 100vh, no page scroll
- **ISAC/ANNA Mode Toggle:** Header toggle that swaps all CSS custom properties and Zustand state, with transition flash effect

## Phase 2: Header + Sidebars — Data Panels
**Goal:** Populate the HUD panels with interactive content using sample data.

- **Header Bar:** Glitching title, system status indicators (event count, date range, connection dot), live EST clock, mode toggle, fullscreen button
- **Left Sidebar:** Subject Profile Card (hexagonal avatar, codename, baseline metrics), Context Injection accordion forms (4 forms: Temporal Anchors, Known Entities, External Targets, Relational Baseline), Threat Category toggles (A–F), Quick Action buttons
- **Right Sidebar (Event Feed):** Scrollable feed of sample forensic events with threat-colored borders, intensity meters, platform icons, category badges. Search/filter controls, pause/resume button. Framer Motion entry animations.
- **CLI Terminal Footer:** Matrix-green terminal with blinking cursor, command history, functional commands (help, status, mode, clear, mark, execute), auto-scrolling log output

## Phase 3: Center Stage — Visualizations (Recharts + Leaflet + Three.js)
**Goal:** Build all 6 main visualization tabs with sample data.

- **Tab 1 — Radar View:** Three.js scene with rotating sweep line, concentric rings, event dots color-coded by threat level, hover tooltips, bloom post-processing
- **Tab 2 — Timeline View:** Recharts-based horizontal timeline with event markers, zoom controls (day/week/month/year), anomaly highlighting, swim lanes by platform
- **Tab 3 — Map View:** Leaflet with CartoDB Dark Matter tiles, tactical markers (diamonds/squares by mode), marker clustering, GPS track polylines, heatmap toggle
- **Tab 4 — Network Graph:** D3 force-directed graph of contacts, sized by interaction frequency, colored by classification, click to see communication history
- **Tab 5 — ECHO (3D Point Cloud):** Three.js scene with event particles mapped by time/threat/platform, orbit controls, hover raycasting, bloom glow
- **Tab 6 — Psych Dashboard:** Gottman gauges (4 radial gauges + magic ratio bar), Recidivism gauge (0-100%), Sentiment timeline, Deception tracker, Social Performance split panel, LDA Topic bars — all using Recharts

## Phase 4: Sample Data + Polish
**Goal:** Make it look fully populated and impressive on first load.

- **50+ Sample Events:** Realistic mix across categories (searches, locations, messages, app usage, adult content, vault apps, tradecraft indicators)
- **Sample Subject Profile:** Full baseline metrics, circadian rhythm data, source distribution
- **Sample Analysis Results:** Gottman scores, recidivism 73.4%, deception index, social performance delta, target fixation data
- **Mark & Execute System:** Right-click to mark events (red chevron), execute correlation with camera snap animation and tether lines
- **Responsive Layout:** Desktop (full HUD), Tablet (slide-out drawers), Mobile (bottom tab navigation with 5 tabs)

## Phase 5: Advanced Features + Reporting
**Goal:** Remaining forensic capabilities and export.

- **Ingestion Modal:** Drag-and-drop file upload UI with progress bars, platform detection display (processing is mocked without backend)
- **Report Generation Panel:** Report type selector, preview with sections (Executive Summary, Timeline, Behavioral, Risk, Evidence Index), PDF export via html2canvas + jspdf
- **Integrity Seal:** Hexagonal SHA-512 badge (green/red state)
- **Alibi Breaker Panel, Tradecraft Panel, Enabler Cards, Media Gallery** — all populated with sample data
- **Audio Debrief Mode:** Dimmed background with timeline highlight sync (TTS via browser SpeechSynthesis API)

---

**Libraries to install:** zustand, framer-motion, @react-three/fiber@^8.18, @react-three/drei@^9.122.0, three@^0.133, leaflet, react-leaflet, d3, @types/leaflet, @types/d3, fflate (for future ZIP extraction), jspdf, html2canvas

**TypeScript types** defined upfront for ForensicEvent, SubjectProfile, AnalysisResults, ContextInjection, and store interfaces.

