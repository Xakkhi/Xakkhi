# Xakkhi সাক্ষী — Project Progress Checklist

Dibrugarh's Civic Eye — citizen-run civic issue reporting & accountability platform.
Last updated: 2026-06-11.

---

## ✅ COMPLETED

### Day 1 — Project foundation
- [x] Next.js App Router project scaffolded (JavaScript, **no TypeScript**)
- [x] Custom Next.js setup per `AGENTS.md` conventions
- [x] Tailwind/PostCSS + ESLint config
- [x] Fonts wired (Fraunces, DM Sans, Noto Sans Bengali)
- [x] Bilingual brand identity "Xakkhi সাক্ষী"
- [x] Root layout: fixed header + scrollable main + bottom nav, `100dvh` flex shell

### Day 2 — Map & shell
- [x] Map page with 22 ward markers (initially Leaflet)
- [x] Header component (wordmark + actions)
- [x] Bottom navigation
- [x] Filter bar (Category / Severity / Status) — all 4 items in one mobile row
- [x] Stats overlay (Active / Total) + bottom CTA
- [x] Fixed StrictMode "map container already initialized" bug
- [x] Fixed z-index layering (overlay/CTA above tiles)

### Day 3 — Report submission
- [x] Report form with GPS capture + photo capture
- [x] Anti-fraud measures (location within Dibrugarh bounds, mandatory landmark)
- [x] `lib/ward-detector.js` — `isWithinDibrugarh()` + nearest-ward `detectWard()`
- [x] `lib/upload-photo.js` — photo compression + Supabase Storage upload
- [x] Category/sub-category/severity selection with severity definitions
- [x] Required-field UX (red `*`), compact layout
- [x] Report success page
- [x] `LocationHelp` + `QRCodeModal` components

### Map provider migration (resolved)
- [x] Leaflet → CARTO → Mappls/MapMyIndia → **Google Maps JavaScript API** (final)
- [x] Custom minimal map styling (hidden POIs/transit, muted roads, soft water)
- [x] Production rendering fixes (Vercel), loading-screen polish

### Day 4 — Database
- [x] Supabase connected; `reports` table + `wards` data
- [x] `supabase/schema.sql` — reports table, auto short-ID trigger (`XK-2026-0001`), `updated_at` trigger
- [x] Removed misleading notification claims from success page

### Ward boundaries & visualization
- [x] `data/wardBoundaries.js` — polygon coordinates for all 22 wards
- [x] Ward heat overlay (cream→pink→red by unresolved density)
- [x] Severity-colored report dots (amber/orange/red/maroon + green resolved), size-scaled
- [x] Subtle tint-matched ward borders; removed ward-number markers
- [x] Tap ward polygon → highlight + compact ward card
- [x] Fixed polygon shapes (ward 14 bowtie, ward 6 overlap via shared-boundary routing)
- [x] `scripts/seed-test-reports.cjs` — ~133 test reports across all wards

### Views & pages
- [x] **List view** — ward accordion, stats bar, working Category/Severity/Status filters, rows link to detail
- [x] **Report detail page** — badges, photo, "I've seen this", stats trio, ward info, directions, share
- [x] **Redesigned accountability tree** (NammaKasa-style): Your Ward pill → DMC Sanitation + Ward Commissioner branch → executive officer chain (COMM→AC→EE→JE→SI) → Elected Board → MLA/MP/Commissioner photo cards
- [x] **BEFORE/AFTER** photos + resolution banner for resolved reports
- [x] **Trust footer** ("Reported Xd ago · N citizens", "All reports anonymous") + **File a complaint**
- [x] **Action bottom sheets** — "Mark as Cleaned" / "This isn't right" → camera → Supabase Storage upload → `pending_review` (verified live end-to-end)
- [x] **Review queue** (`/review`) — approve/reject cleanups & flags; approve cleanup → resolved + after-photo; approve flag → removed from public
- [x] **Leaderboard** (`/leaderboard`) — city stats, ward rankings, sort modes (Worst/Best/Most)
- [x] **Official profile pages** (`/official/[slug]`) — ward commissioners + city officials, stats, top issues, recent reports
- [x] **About page** (`/about`) — mission, live stats, how-it-works, categories, accountability, CTA
- [x] Map: **tap report dot → detail**, **wired filter chips**, exclude flag-approved reports
- [x] Bottom nav: **About → "More" popup** (About + Review Queue)
- [x] Header: **auto-flipping brand-colored social icon** (IG/X/Telegram), removed dead `⋯` menu
- [x] Supabase: cleanup/flag columns, `report-photos` bucket, anon update + storage policies
- [x] **Cluster demo** (`/cluster-demo`) — severity-aware MarkerClusterer sample (standalone, parked for decision)

---

## ⏳ PENDING / REMAINING

### 🔴 Pre-launch BLOCKERS
- [ ] Replace wide-open `anon update reports` RLS policy (column-scoped or insert-only `report_actions` table)
- [ ] Add **admin auth** to `/review` and lock the route
- [ ] Re-audit `report-photos` storage policies (open insert/read/delete)
- [ ] **Delete test seed data** before production

### 🗺️ Map enhancements
- [ ] Decide on & adopt **MarkerClusterer** (demo built; choose heat-overlay coexistence)
- [ ] **City boundary outline** (overall Dibrugarh border)
- [ ] **Refine remaining ward polygons** (only 3, 6, 14 adjusted; ~19 still rough)
- [ ] Optional: migrate `google.maps.Marker` → `AdvancedMarkerElement` (deprecation warnings)

### 🔧 Functional gaps
- [ ] Wire **"File a complaint"** beyond tel: (escalation flow?)
- [ ] Citizen-count / duplicate-report aggregation logic (currently manual `citizen_count`)
- [ ] Real **official photos** (currently avatar/initials fallback)
- [ ] Real **social media links** (currently placeholder handles in `Header.js`)
- [ ] Decide fate of `/cluster-demo` (adopt / keep / delete)
- [ ] Verify true DMC executive officer roles/names (currently standard ULB placeholders)

### 🎨 Polish / nice-to-have
- [ ] Empty/error states across pages
- [ ] Loading skeletons (vs. "Loading…" text)
- [ ] Share-card / OG image per report
- [ ] Accessibility pass (focus states, aria, contrast)
- [ ] PWA / installability
- [ ] Notifications (explicitly removed earlier — revisit if wanted)

---

## Tech stack
- **Framework:** Next.js (App Router, JavaScript only)
- **Map:** Google Maps JavaScript API
- **Database/Storage/Auth:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Wards:** 22 wards of Dibrugarh Municipal Corporation (DMC)
