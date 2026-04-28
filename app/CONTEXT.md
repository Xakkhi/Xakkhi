# Xakkhi — Full Project Context for Claude Code

## About the Platform
Xakkhi (সাক্ষী) means "Witness" in Assamese/Sanskrit.
A citizen-first civic reporting platform for Dibrugarh, Assam.
Inspired by NammaKasa (nammakasa.in) — adopting the same proven UX flow but adapted for Dibrugarh with 5 categories and three-layer accountability.
Vision: Start in Dibrugarh → expand to Assam → pan-India.
No mobile app. Web only. Works from a shared link.
Anonymous, free, mobile-first.

## Brand Identity
- Name: Xakkhi সাক্ষী (bilingual wordmark — no separate logo icon)
- Tagline: Dibrugarh's Civic Eye
- Primary: #1C1C1C (Pure Ink)
- Accent/CTA: #F77F00 (Saffron)
- Critical/Urgent: #DC2626 (Report Red)
- Resolved/Success: #16A34A (Clean Green)
- Moderate: #D97706 (Amber)
- Background: #FAFAF8 (Near White)
- Display Font: Fraunces (Google Fonts)
- Body Font: DM Sans (Google Fonts)
- Assamese Script Font: Noto Sans Bengali (Google Fonts)

## Tech Stack
- Framework: Next.js (App Router, JavaScript only — NO TypeScript, Tailwind CSS)
- Map: Leaflet.js + OpenStreetMap tiles
- Database: Supabase (PostgreSQL + PostGIS)
- Image Storage: Cloudflare R2 (free tier)
- Hosting: Vercel
- Analytics: Vercel Analytics + Plausible
- Language: JavaScript (NOT TypeScript)

## Repository
- GitHub: https://github.com/Xakkhi/Xakkhi
- Vercel URL: xakkhi-be1dl6wdp-xakkhi-officials-projects.vercel.app
- Domain (planned): xakkhi.in

## City Context
- City: Dibrugarh, Assam, India
- Governing Body: Dibrugarh Municipal Corporation (DMC)
- Total Wards: 22
- City Center Coordinates: 27.4728, 94.9120
- Brahmaputra river runs along the northern boundary
- MLA Dibrugarh: Prasanta Phukan (BJP)
- MP Dibrugarh: Sarbananda Sonowal (BJP — Lok Sabha)

## Issue Categories (5 Main Types)

### 1. Garbage 🗑️
Color: #DC2626 (red)
Sub-types: Household Waste, Construction Debris, Mixed Waste, E-Waste, Biomedical
Severity:
- Minor — A few bags or scattered litter (under 1m²)
- Moderate — Noticeable heap, size of an auto-rickshaw (1-5m²)
- Severe — Sidewalk blocked or road edge piled up (5-20m²)
- Critical — Major illegal dumpsite, vacant plot or full road (20m²+)

### 2. Pothole / Bad Road 🕳️
Color: #EA580C (deep orange)
Sub-types: Crack, Single Pothole, Multiple Potholes, Road Sinking, Surface Damage
Severity:
- Minor — Small surface crack or shallow hole (under 30cm wide)
- Moderate — Pothole that catches bike tires (30cm-1m wide)
- Severe — Multiple potholes or large hole (1-3m wide)
- Critical — Road completely broken / unusable (3m+ or full lane)

### 3. Drain Blockage 💧
Color: #0891B2 (cyan blue)
Sub-types: Slow Drainage, Fully Blocked, Backflow, Sewage Mix, Mosquito Breeding
Severity:
- Minor — Slow water flow but functional
- Moderate — Standing water, partial blockage
- Severe — Fully blocked, overflowing onto road
- Critical — Sewage backflow, severe public health risk

### 4. Open Drain ⚠️
Color: #D97706 (amber)
Sub-types: Cover Missing, Partial Cover, Damaged Slab, Children's Hazard
Severity:
- Minor — Slab cracked but in place
- Moderate — One cover missing in non-busy area
- Severe — Multiple covers missing or near schools/markets
- Critical — Long stretch fully open, immediate fall hazard

### 5. Streetlight 💡
Color: #CA8A04 (yellow-amber)
Sub-types: Flickering, Single Light Out, Multiple Out, Pole Damaged, Wires Exposed
Severity:
- Minor — One light flickering
- Moderate — One streetlight completely off
- Severe — Multiple lights out (entire street section)
- Critical — Whole road dark, exposed wires (electrocution risk)

## V1 Features (Must Ship)

### Map & Discovery
1. Live Dibrugarh map with cluster markers (color-coded by category)
2. Ward boundary overlays with dashed outlines
3. List view (toggle from Map view)
4. Filter chips: All Categories ▾ / Severity ▾ / Status ▾
5. Stats overlay top-left (Active / Total Reports)
6. Floating ward info card when ward tapped
7. Resolved map view with GREEN cluster markers (positive layer)
8. Loading state with bilingual Xakkhi সাক্ষী logo
9. Social media icon dropdown (Instagram / Twitter / Telegram)

### Report Submission Flow
10. Anti-fraud: rear camera + GPS verification REQUIRED
11. Desktop users see QR code modal → forced to scan with phone
12. "How to enable on Android" inline expandable help guide
13. Photo upload (live capture only, no gallery)
14. Issue category selection (5 main types as buttons)
15. Sub-category selection (specific to chosen category)
16. Severity with category-specific descriptions
17. Landmark/address text field
18. Auto GPS detection → auto-assigns ward
19. Anonymous submission (no login, no name, no phone)
20. "Use your phone to report" fallback CTA

### Report Detail Page
21. Status badges: Critical/Severe/Moderate/Minor + Unresolved/Resolved
22. Photo with "Reported" status badge overlay (when fresh)
23. BEFORE/AFTER photo comparison for resolved reports
24. "Cleaned up after X days · Verified by citizen" success card
25. Stats trio: Reports count / Days old / Sub-type badge
26. THREE-LAYER ACCOUNTABILITY TREE (Xakkhi's key differentiator):
    - Top: "Your Ward · Ward #X · [Area Name]" pink badge
    - Branch 1: DMC (Garbage Authority/Roads/Drainage based on category)
    - Branch 2: Ward Commissioner (with name, photo, phone)
    - Vertical chain: Special Commissioner → Zonal Commissioner
    - Bottom: ELECTED REPRESENTATIVES card row:
      - MLA card (photo + name + party)
      - MP card (photo + name + party)
27. "Tap any card for contact options" helper text
28. "All reports are anonymous" privacy badge (green)
29. "I've seen this" social validation button (👍)
30. "It is Cleaned Up — Verify" button (white outline)
31. Share icon → native browser share sheet
32. Pre-filled share message format: "[Category emoji] [Issue] at [landmark], [ward], Dibrugarh — xakkhi.in/[id]"

### Mark as Cleaned Flow
33. Bottom sheet modal: "Mark as Cleaned"
34. "Take a Verification Photo" big dashed green box
35. "We'll review it within 24 hours" assurance
36. "Submit for Review" button

### Leaderboard
37. Stats trio at top:
    - Total Unresolved (red)
    - Total Resolved (green)
    - Fix Rate % (grey)
38. "Worst Wards by Reports" — ranked 1 to 22
39. Each ward shows: rank, area name, ward #, progress bar, count
40. Progress bars use red→saffron gradient
41. Top 3 ranks highlighted in red, rest in grey
42. "Top 5 Ward Commissioners by Open Complaints"
43. Elected Representatives section (MLA + MP cards with counts)

### System Features
44. All reports stored permanently in Supabase
45. Vercel Analytics tracking visitors
46. Plausible Analytics for traffic sources
47. Time stamps: "Today", "Yesterday", "Xd ago"
48. Vacant position callouts ("Vacant since YYYY")
49. Mobile-first responsive design
50. Optimized for Indian 4G/low-bandwidth conditions

## Features Deferred to V2 (Post-Launch)
- Assamese language toggle (অসমীয়া)
- Weekly automated email to DMC authorities
- Comment threads on reports
- Weekly auto-generated ward report cards (PDF)
- PWA offline support
- Push notifications
- Authority response feature
- Heat map overlay
- CSV data export
- Public API

## Map Design Specifications

### Base Map
- Light/muted OpenStreetMap tiles
- Ward boundaries: dashed ink (#1C1C1C) outlines
- Light pink/cream fill for ward areas

### Markers (by status)
- Critical clusters: dark ink (#1C1C1C) with white numbers
- Severe markers: red (#DC2626)
- Moderate markers: saffron (#F77F00)
- Minor markers: amber (#D97706)
- Resolved markers: green (#16A34A) — only in Resolved view
- Single dots when zoomed in
- Cluster bubbles when zoomed out

### Map Controls
- Zoom +/- buttons (bottom right)
- "Locate me" button (bottom right, above zoom)
- Stats overlay (top left)

### Bottom CTA
- Full-width saffron "+ Report an Issue" button
- Floating stats button to right (📊 with count)

## Database Schema (Supabase)

### Table: reports
- id: uuid (primary key)
- created_at: timestamp
- updated_at: timestamp
- photo_url: text
- before_photo_url: text
- after_photo_url: text (nullable)
- category: text (garbage/pothole/drain/openDrain/streetlight)
- sub_category: text
- severity: text (minor/moderate/severe/critical)
- description: text (optional, landmark/address)
- lat: float
- lng: float
- ward_number: integer
- status: text (default: 'unresolved')
- resolved_at: timestamp (nullable)
- resolved_by_citizen: boolean (default: false)
- seen_count: integer (default: 0)
- report_id_short: text (e.g., "XK-2026-0001")

### Table: wards
- ward_number: integer (primary key)
- area_name: text
- area_name_local: text (Assamese script)
- commissioner_name: text
- commissioner_phone: text
- commissioner_photo_url: text
- commissioner_party: text
- commissioner_position: text (Chairman/Vice-Chairman/Member)
- center_lat: float
- center_lng: float
- mla_name: text
- mla_party: text
- mla_constituency: text
- mp_name: text
- mp_party: text

### Table: report_seen
- report_id: uuid
- device_fingerprint: text
- created_at: timestamp

## Ward Coordinates (Verified Centroids — All 22 Wards)

Format: Ward Number | Area Name | Latitude | Longitude

Ward 1 | East Barbari | 27.4887 | 94.9341
Ward 2 | Nizkadamani | 27.4744 | 94.9350
Ward 3 | Kadamoni | 27.4724 | 94.9244
Ward 4 | Central Chowkidinghee | 27.4703 | 94.9170
Ward 5 | Milan Nagar | 27.4595 | 94.9086
Ward 6 | Mancotta | 27.4699 | 94.9026
Ward 7 | South Amolapatty | 27.4747 | 94.8909
Ward 8 | Chapori / Santipara | 27.4744 | 94.8985
Ward 9 | Ubi / Sadar Thana | 27.4802 | 94.8981
Ward 10 | North Amolapatty | 27.4824 | 94.8997
Ward 11 | Jail Area | 27.4822 | 94.9028
Ward 12 | West Santipara | 27.4733 | 94.9032
Ward 13 | West Chowkidinghee | 27.4736 | 94.9054
Ward 14 | East Chowkidinghee | 27.4740 | 94.9084
Ward 15 | Khalihamari | 27.4811 | 94.9117
Ward 16 | Police Reserve | 27.4836 | 94.9091
Ward 17 | Graham Bazar | 27.4885 | 94.9154
Ward 18 | Gabharupathar | 27.4832 | 94.9201
Ward 19 | Railway Colony / Nalipool | 27.4841 | 94.9292
Ward 20 | Barbari | 27.4867 | 94.9252
Ward 21 | Jyotinagar | 27.4886 | 94.9259
Ward 22 | Paltan Bazar | 27.4935 | 94.9255

City Center: 27.4728, 94.9120
City Bounding Box: Lat 27.4595 to 27.4935 | Lng 94.8909 to 94.9350

## Ward Commissioners — All 22 Wards

Format: Ward Number | Commissioner Name | Phone | Position

Ward 1 | Gautam Dutta | 7896009989 | Member
Ward 2 | Darshan Das | 8638149615 | Member
Ward 3 | Vacant | — | Vacant
Ward 4 | Pranab Kalita | 9085789411 | Member
Ward 5 | Dibyajyoti Hazarika | 6002380649 | Member
Ward 6 | Hemlata Saikia | 9854305567 | Member
Ward 7 | Binuma Das | 6001637472 | Member
Ward 8 | Ratan Paul | 9401102045 | Member
Ward 9 | Sraban Kumar Das | 9954732909 | Member
Ward 10 | Samsun Nahar Hussain Ahmed | 9954567151 | Member
Ward 11 | Ujjal Phukan | 9954388449 | Vice Chairman
Ward 12 | Pompi Roy Chowdhury | 9435636369 | Member
Ward 13 | Topa Dey | 9101283921 | Member
Ward 14 | Dr. Saikat Patra | 7002184138 | Chairman
Ward 15 | Sikha Chowdhury | 7002847427 | Member
Ward 16 | Mamun Gogoi Mitra | 8638159194 | Member
Ward 17 | Nirupa Dutta | 9706172642 | Member
Ward 18 | Simanta Baruah | 9401512129 | Member
Ward 19 | Moonmoon Das | 8486717137 | Member
Ward 20 | Dipali Dey | 9101893837 | Member
Ward 21 | Bratish Kanti Das | 6001575981 | Member
Ward 22 | Sima Das | 9707256139 | Member

## Page Structure (App Router)

```
xakkhi/
├── app/
│   ├── page.js                    → Homepage (Map View)
│   ├── list/page.js               → List View
│   ├── report/page.js             → Report submission form
│   ├── report-success/page.js     → Success confirmation
│   ├── reports/[id]/page.js       → Individual report detail
│   ├── ward/[number]/page.js      → Ward detail page (22 of these)
│   ├── leaderboard/page.js        → Worst wards + officials
│   ├── officials/page.js          → All commissioners + MLAs + MPs
│   ├── about/page.js              → About Xakkhi
│   ├── how-to-use/page.js         → Quick guide
│   └── layout.js                  → Root layout with header + bottom nav
├── components/
│   ├── Header.js
│   ├── BottomNav.js
│   ├── ReportCard.js
│   ├── WardMarker.js
│   ├── AccountabilityTree.js
│   ├── ReportForm.js
│   ├── QRCodeModal.js
│   ├── LocationHelp.js
│   ├── BeforeAfterCompare.js
│   ├── StatusBadge.js
│   ├── ShareSheet.js
│   └── FilterChips.js
├── data/
│   ├── wards.js
│   ├── officials.js
│   ├── categories.js
│   └── severityScales.js
├── lib/
│   ├── supabase.js
│   ├── ward-detector.js
│   └── share-helper.js
└── public/
    ├── officials/
    └── icons/
```

## Bottom Navigation Bar
4 items, always visible on mobile:
1. 🗺️ Map (homepage)
2. 📋 List (list view)
3. 🏆 Leaders (leaderboard)
4. ℹ️ About (about page)

## Top Header (every page)
- Bilingual logo: Xakkhi সাক্ষী
- Right side: notification bell + menu (⋯) icon
- Black ink (#1C1C1C) background

## Filter Bar (Map/List pages)
Three dropdown chips + view toggle:
- All Categories ▾
- All Severity ▾
- All Status ▾
- Map | List toggle (right side)

## Anti-Fraud System (Critical)
1. Camera permission required → MUST be rear camera
2. Geolocation permission required → MUST be live GPS
3. Desktop users CANNOT upload — they see QR code only
4. Photo metadata checked for capture timestamp
5. Location must be within Dibrugarh bounding box
6. Inline "How to enable" help when permissions denied

## Naming Conventions
- File names: kebab-case (e.g., report-form.js)
- Component names: PascalCase (e.g., ReportForm)
- Variables: camelCase (e.g., wardNumber)
- CSS classes: Tailwind utilities only

## Current Build Status (Day 1 Complete)
- Next.js project created and running locally
- Homepage live with bilingual Xakkhi সাক্ষী logo
- Brand colors applied (Ink + Saffron)
- Code pushed to GitHub (Xakkhi/Xakkhi)
- Deployed live on Vercel
- All 22 ward centroids verified
- All 22 ward commissioners documented
- Next: Build map page with Leaflet.js (Day 2)

## How to Run Locally
```
cd C:\Users\ANNWESHA\Desktop\xakkhi
npm run dev
# Open: localhost:3000
```

## Build Order (for Claude Code)

Day 2: Map page with Leaflet.js + 22 ward markers
Day 3: Report submission form (anti-fraud + photo + GPS)
Day 4: Supabase database connection (reports save)
Day 5: Leaderboard + ward detail pages
Day 6: Resolution flow (Mark as Cleaned + before/after)
Day 7: Polish, deploy, share

## Critical Rules for Claude Code
1. Always use JavaScript, never TypeScript
2. Always use Tailwind CSS for styling
3. Mobile-first design — assume Android phone, 4G connection
4. No login system — everything anonymous
5. Saffron (#F77F00) is always primary CTA color
6. Red is RESERVED for critical alerts only — never use as primary
7. Bilingual logo "Xakkhi সাক্ষী" must appear on every page header
8. Three-layer accountability is non-negotiable on report detail
9. All photos must compress client-side before upload (under 500KB)
10. Test on slow 4G simulation before pushing