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
- [x] **Trust footer** + **File a complaint**
- [x] **Action bottom sheets** — "Mark as Cleaned" / "This isn't right" → camera → Supabase Storage upload → `pending_review` (verified live end-to-end)
- [x] **Review queue** (`/review`) — approve/reject cleanups & flags
- [x] **Leaderboard** (`/leaderboard`) — city stats, ward rankings, sort modes
- [x] **Official profile pages** (`/official/[slug]`)
- [x] **About page** (`/about`) — mission, live stats, how-it-works, accountability
- [x] Map: **tap report dot → detail**, **wired filter chips**, exclude flag-approved reports
- [x] Bottom nav: **About → "More" popup** (About + Review Queue)
- [x] Header: **auto-flipping brand-colored social icon** (IG/X/Telegram), removed dead `⋯` menu
- [x] Supabase: cleanup/flag columns, `report-photos` bucket, anon update + storage policies
- [x] **Cluster demo** (`/cluster-demo`) — severity-aware MarkerClusterer sample (standalone, parked)

---

## 🚀 LAUNCH ROADMAP (pending — ordered by dependency)

### Phase A — Real-time data layer ✅ DONE
- [x] `ReportsProvider` context = single source of truth + `useReports()` hook
- [x] Supabase Realtime enabled on `reports` (verified live INSERT + UPDATE push)
- [x] One Realtime channel: subscribe to INSERT / UPDATE / DELETE, merge into shared state
- [x] Refactor Map / List / Leaderboard / Official / About / Review to consume context (dropped per-page fetches)
- [x] Optimistic insert on submit + reconnect-refetch guard

### Phase B — Security hardening *(LAUNCH BLOCKERS)*
- [x] **Admin auth** (magic-link + allow-list) — `AuthProvider`/`useAdmin`, `/login`, `data/admins.js` + DB `is_admin()`
- [x] Move cleanup/flag to insert-only `report_actions` table; soft-remove (`is_removed`) + admin override (Remove/Restore/Edit); `report_seen` for "I've seen this"
- [x] **`/review` locked** behind admin auth
- [x] RLS lockdown — anon is insert-only on reports; **verified anon UPDATE blocked** (0 rows) and `report_actions` hidden from anon, while public reads still work
- [ ] Storage policy audit (scoped paths, file type/size limits)
- [ ] Anti-spam / rate limiting on submissions (per-device throttle)

### Phase C — Data integrity & moderation
- [ ] ⭐ **Refine all 22 ward polygons** (source real DMC ward boundaries / GIS shapefile) — only 3, 6, 14 hand-refined; rest are rough quads with junction gaps. Detection logic is fixed (point-in-polygon + nearest-edge fallback), so this is now purely a **data-quality** task — but it's what locks in 100% ward accuracy for real reports. MUST be done before launch.
- [ ] **Delete test seed data**
- [ ] Citizen-count / duplicate-report aggregation (nearby same-category → bump `citizen_count`)
- [ ] Admin notification when items hit the review queue

### Phase D — Launch infrastructure
- [ ] ⭐ **PRIORITY — Register + connect domain `xakkhi.in`** (registrar purchase → Vercel DNS → auto-SSL → www/apex redirect)
- [ ] **Configure custom SMTP for auth emails** (Resend / Brevo / SES) — Supabase's built-in email is rate-limited (~few/hr) and "not for production"; magic-link admin logins need real SMTP. Usually wants a verified sending domain, so pair with the domain task.
- [ ] **Google Maps API key restriction** (HTTP referrer lock to domain) — security **and** cost control
- [ ] Production env vars separated from preview
- [ ] Supabase production readiness (tier, backups, connection pooling)
- [ ] Error monitoring (Sentry/Vercel) + uptime
- [ ] Secure matching social handles (`@xakkhi` IG/X/Telegram) + wire real links in `Header.js`

### Phase E — Analytics & metrics
- [ ] Baseline web analytics — **Vercel Web Analytics** (pageviews, referrers, geo, devices; cookieless)
- [ ] Product event tracking — **PostHog** (or similar) via a small `track(event, props)` helper
- [ ] Event taxonomy:
  - views: map / list / leaderboard / report-detail / official / about
  - map: map_load, ward_tap, dot_tap, cluster_tap, locate_me, zoom
  - report funnel: report_started → photo_added → location_captured → category_selected → report_submitted → report_success
  - engagement: seen_this, share, get_directions, call_official, file_complaint
  - filters: filter_applied (category/severity/status)
  - social: social_icon_click, social_link_opened
  - moderation: cleanup_submitted, flag_submitted, review_approved/rejected
- [ ] **Impact dashboard** (`/stats` or `/admin`, behind admin auth): reports/day, resolution rate, avg time-to-resolve, ward leaderboard, category mix, verification & flag rates, new vs returning
- [ ] Privacy-respecting config: no PII, IP/city-level geo only, cookieless (no consent banner) — **DPDP Act 2023** aware

### Phase F — Trust, legal & polish
- [ ] Privacy + Terms page; verify "All reports are anonymous" is literally true (no IP/identity stored with reports, or disclose)
- [ ] Real official data verification, real photos (currently avatar/initials fallback)
- [ ] Empty / error / loading states; loading skeletons
- [ ] Accessibility pass (focus, aria, contrast)
- [ ] OG / share cards per report; PWA "add to home screen"

### Phase G — Go-live & growth
- [ ] Soft launch (beta testers / few wards) → full launch
- [ ] **DMC / official outreach** (accountability model needs official engagement)
- [ ] Feedback loop + iteration

---

## 🧊 BACKLOG (non-blocking)
- [ ] Adopt **MarkerClusterer** in real map (demo built; choose heat-overlay coexistence) — or delete `/cluster-demo`
- [ ] **City boundary outline** (overall Dibrugarh border)
- [ ] Migrate `google.maps.Marker` → `AdvancedMarkerElement` (deprecation warnings)
- [ ] Verify true DMC executive officer roles/names (currently standard ULB placeholders)
- [ ] Wire "File a complaint" beyond `tel:` (escalation flow)

---

## Tech stack
- **Framework:** Next.js (App Router, JavaScript only)
- **Map:** Google Maps JavaScript API
- **Database/Storage/Auth:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Analytics (planned):** Vercel Web Analytics + PostHog
- **Domain (planned):** xakkhi.in
- **Wards:** 22 wards of Dibrugarh Municipal Corporation (DMC)
