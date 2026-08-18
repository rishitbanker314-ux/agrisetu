# AgriSetu — Full Build Blueprint (Supabase + Free-Tier Google AI)
**Build with AI: Code for Communities 2 (BRICS) · Cooperation Track — Agriculture / AgriN**
**Deadline: August 24, 2026 · Built in Antigravity IDE · $0 infrastructure cost**

---

## 0. Quick reference

| | |
|---|---|
| Today | Aug 18, 2026 — **7 days to deadline** |
| Deadline | Aug 24, 2026 (confirm exact cutoff time on the portal) |
| Track | Cooperation — Agriculture (BRICS AgriN–inspired) |
| Real initiative this maps to | BRICS Network on Digital Agriculture, coordinated by IIT Delhi — see §1 |
| Build tool | Antigravity IDE |
| **What stays Google (both genuinely free, no card)** | Gemini API via **Google AI Studio** (not Vertex AI) · Google Earth Engine, registered **noncommercial** |
| **What moves to free-tier alternatives** | Firestore → **Supabase Postgres** · Firebase Auth → **Supabase Auth** · Cloud Storage → **Supabase Storage** · Cloud Functions/Run → **Supabase Edge Functions** · BigQuery → **Postgres materialized views** · Firebase Hosting → **Vercel/Netlify** · Google Maps Platform → **Leaflet.js + OpenStreetMap** · Cloud Translation API → **Gemini (same call)** · Cloud Speech-to-Text → **Gemini audio input (same call)** · Cloud Text-to-Speech → **browser Web Speech API**, gTTS fallback |
| Second BRICS demo country | Brazil |
| **Critical risk to manage** | Supabase free projects pause after 7 days idle — set up a keep-alive ping (§7) |

---

## 1. The pitch, and why it's grounded in something real

**AgriSetu** (*setu* = bridge) gives a farmer a personalized crop and health advisory — by voice, text, or photo, in their own language — built from real satellite, soil, and weather data instead of guesswork. The same pipeline runs for any BRICS country because every data source underneath it is global.

**The research hook for your deck:** the challenge says "inspired by BRICS AgriN," but real AgriN (from India's actual BRICS Agriculture Ministers' meeting in Indore, June 2026) is about cooperation on seeds and genetic resources — not satellite data or disease diagnosis. What this challenge actually describes is a different real initiative announced the same day: the **BRICS Network on Digital Agriculture**, focused on AI, geospatial tech, and data-driven agricultural solutions, coordinated by **IIT Delhi**. Open your deck with this.

**Users:** farmers (primary) and policymakers (secondary, via an aggregated dashboard).

---

## 2. System architecture & full tech stack

Four layers: **data sources** → **ingestion/fusion (country adapter)** → **AI core (Gemini)** → **delivery (farmer app + policymaker dashboard)**.

| Layer | Component | Service | Cost |
|---|---|---|---|
| Data | Satellite NDVI | Google Earth Engine + Sentinel-2 (noncommercial registration) | Free, no billing account |
| Data | Soil properties | SoilGrids via the **GEE community catalog** (not the standalone REST API — it's had extended outages) | Free, same EE project |
| Data | Weather + forecast | Open-Meteo | Free, no API key |
| Data | Historical crop context | FAOSTAT API | Free, no auth |
| AI | Advisory generation + translation | **Gemini Flash via Google AI Studio API key** | Free tier (~1,500 req/day) |
| AI | Disease diagnosis | Same Gemini Flash endpoint, multimodal image input | Same free quota |
| AI | Voice input | Same Gemini Flash endpoint, multimodal audio input — replaces Cloud Speech-to-Text entirely | Same free quota |
| AI | Voice output | Browser **Web Speech API** (primary, zero setup) or **gTTS** (fallback for stronger Gujarati coverage) | Free |
| Database | Structured data | **Supabase Postgres** | Free, 500MB |
| Auth | Farmer/policymaker accounts | **Supabase Auth** | Free, 50k MAU |
| Storage | Crop photos | **Supabase Storage** | Free, 1GB |
| Backend logic | Fusion + orchestration | **Supabase Edge Functions** | Free, 500k invocations/mo |
| Analytics | Regional aggregation | **Postgres materialized view** — replaces BigQuery | Free, same DB |
| Hosting | Frontend | **Vercel or Netlify** | Free tier |
| Maps | Location picker | **Leaflet.js + OpenStreetMap tiles** — replaces Google Maps Platform | Free, no key |

**Important distinction:** use **ai.google.dev / Google AI Studio** for your Gemini API key, not the Vertex AI console. Different URL, different auth (API key vs. GCP service account), different billing. Mixing them up is the most common mistake developers make with Gemini's free tier — pick AI Studio and don't touch Vertex AI at all.

---

## 3. Feature list, mapped to how you're actually graded

(Unchanged from the GCP version — the *features* are identical, only the services underneath differ.)

Judging weights: AI/Technical Execution 25%, Problem-Solution Fit 20%, Cross-Border Applicability 20%, Deployability & Scalability 20%, Impact Potential 10%, Presentation 5%.

| Feature | Grading criterion it serves |
|---|---|
| Live GEE/Open-Meteo/FAOSTAT data (not mocked) | Problem-Solution Fit, Technical Execution |
| Working end-to-end flow: request in → advisory out | Technical Execution (25%) |
| Country-adapter architecture, demoed with India + Brazil | Cross-Border Applicability (20%) |
| Gemini multimodal diagnosis validated against PlantVillage | Technical Execution, credible accuracy claim |
| Open-source repo, RLS-enforced privacy, SDG tagging | Deployability & Scalability |
| Postgres-aggregated policymaker dashboard | Impact Potential, Deployability |
| Voice interface for low-literacy farmers | Impact Potential |
| A **live link that's actually still up** when judges check it | Deployability & Scalability — see §7 |

---

## 4. Postgres data model (replaces Firestore)

```sql
create table profiles (
  id uuid references auth.users primary key,
  role text check (role in ('farmer','policymaker')),
  name text, phone text, preferred_language text, country text, region text
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  country text, lat float8, lng float8,
  crop_history jsonb default '[]',
  created_at timestamptz default now()
);

create table health_profiles (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  ndvi float8, soil_properties jsonb, weather_forecast jsonb,
  generated_at timestamptz default now()
);

create table advisories (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  profile_id uuid references health_profiles(id),
  recommendation_text text, language text, voice_url text,
  created_at timestamptz default now()
);

create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  image_url text, disease_label text, confidence float8, treatment_advice text,
  created_at timestamptz default now()
);

-- Row Level Security: farmers see only their own fields.
-- Policymakers query the aggregated view below, never raw farmer data — this is your DPG "do no harm" story.
alter table fields enable row level security;
create policy "farmers see own fields" on fields for select using (auth.uid() = owner_id);

-- Replaces BigQuery for the policymaker dashboard
create materialized view regional_trends as
select country, region, avg(ndvi) as avg_ndvi, count(*) as request_volume
from health_profiles hp join fields f on hp.field_id = f.id
group by country, region;
-- Refresh this on a schedule (a small Edge Function on a cron, or trigger it after each new health_profile insert)
```

---

## 5. The 17-phase build blueprint

Mode = Fast for mechanical phases, Planning for architecturally significant ones. Phases 3, 4, 5, and 7 are **unchanged from the GCP version** — they were never dependent on paid infrastructure to begin with.

**Phase 1 — Project foundation.** *(Planning mode)*
Create a Supabase project (free tier — this uses 1 of your 2 free project slots, so don't spin up throwaway test projects). Register a Google Earth Engine Cloud project as **noncommercial/educational** (select the Community tier — no billing account needed). Generate a Gemini API key from **Google AI Studio** (ai.google.dev), not Vertex AI. Initialize the Antigravity workspace and check its integrations panel for a Supabase connector.

**Phase 2 — Country-adapter interface design.** *(Planning mode)*
Unchanged: define `getSatelliteData`, `getSoilData`, `getWeatherData`, `getHistoricalCropData(countryCode, crop)`, `getLocale(countryCode)`.

**Phase 3 — Earth Engine integration.** *(Fast mode — parallel to Phase 5)* Unchanged.

**Phase 4 — SoilGrids-on-GEE integration.** *(Fast mode)* Unchanged.

**Phase 5 — Open-Meteo integration.** *(Fast mode — parallel to Phase 3)* Unchanged.

**Phase 6 — Field health profile fusion engine.** *(Planning mode)*
Build this as a **Supabase Edge Function**. Call the three data sources with `Promise.all` (parallel, not sequential) — Edge Functions are meant for lightweight logic, so keep total execution time well under any timeout by not chaining slow calls one after another.

**Phase 7 — FAOSTAT historical context.** *(Fast mode)* Unchanged.

**Phase 8 — Gemini advisory engine.** *(Planning mode)*
Field health profile + historical crop data → Gemini Flash (via your AI Studio key) → structured recommendation. Fold translation directly into this same prompt ("respond in Gujarati") instead of calling a separate Translation API — one fewer service to integrate.

**Phase 9 — Crop disease diagnostic module.** *(Fast mode — parallel to Phase 10)*
Photo → Supabase Storage → Gemini Flash multimodal (image input, same API key as Phase 8) → diagnosis + confidence + treatment. Validate a sample against PlantVillage for a real accuracy number.

**Phase 10 — Multilingual voice & text interface.** *(Fast mode — parallel to Phase 9)*
**Voice in:** send the audio file straight to the same Gemini Flash endpoint (multimodal audio input) — no separate speech-to-text service. **Voice out:** browser Web Speech API (`SpeechSynthesis`) as the zero-cost default; fall back to gTTS if Gujarati/regional coverage on-device is weak. Text: Hindi, English, Gujarati, Portuguese minimum.

**Phase 11 — Data model, auth & RLS.** *(Fast mode)*
Implement the schema in §4, Supabase Auth for farmer/policymaker roles, and the Row Level Security policy so a farmer only ever reads their own data.

**Phase 12 — Farmer-facing frontend.** *(Planning mode)*
Mobile-first UI. Location picker via **Leaflet.js + OpenStreetMap** (no API key). Voice/text/photo input, advisory + diagnosis display, language switcher. Deploy target: Vercel or Netlify.

**Phase 13 — Cross-border proof point (Brazil).** *(Planning mode)*
Activate the country adapter for a real Brazilian coordinate, FAOSTAT queried with Brazil's country code, Portuguese output. This is what actually earns the 20% Cross-Border score — it needs to run live, not just be claimed in the deck.

**Phase 14 — Policymaker dashboard.** *(Fast mode)*
Query `regional_trends` (the materialized view from §4). Set up a refresh trigger or scheduled Edge Function so it doesn't go stale. Simple charts, not raw tables.

**Phase 15 — Digital Public Good compliance layer.** *(Fast mode)*
OSS license (MIT/Apache 2.0), SDG-alignment note (SDG 2, SDG 13) in the README, confirm the Phase 11 RLS policy actually blocks cross-farmer data access — test it, don't assume it.

**Phase 16 — Testing, deployment & hardening.** *(Planning mode)*
Full run-through for both countries. Deploy to Vercel/Netlify, confirm the live link works from a fresh incognito session. **Set up the Supabase keep-alive ping now** (see §7) — do this before you get busy with the deck and forget.

**Phase 17 — Submission assets.** *(Fast mode)*
Demo video (3–5 min, both countries), 10–12 slide deck (open with §1's AgriN distinction), 2–3 line description, final QA on all five required pieces.

---

## 6. Antigravity execution notes

- **Manager View parallelization:** Phases 3+5 (satellite, weather) and Phases 9+10 (diagnosis, voice) are your clearest opportunities to run agents in parallel rather than sequentially.
- **Mode selection:** Planning mode for phases 1, 2, 6, 8, 12, 13, 16. Fast mode for the rest.
- **Known stability issue:** longer Antigravity sessions have had context-memory problems on extended tasks — keep each phase to one clear prompt, restart the agent window between phases.
- Check Antigravity's integrations panel for a Supabase connector before Phase 1; if there isn't one, Supabase's client library is standard and well-documented enough that Antigravity won't need one to write clean code against it.

---

## 7. Critical: keeping Supabase alive through judging

Free Supabase projects pause automatically after **7 days with no API request**. Your pipeline from submission to the in-person Demo Day spans up to 11 days (Aug 24 submit → Aug 25–28 shortlisting → Aug 29 virtual finale → Sept 4 in-person Demo Day). If your app goes quiet for a week at any point in there, a judge could click your "live" link and find it offline.

**Fix, takes about 10 minutes (Phase 16):**
- Set up a free scheduled ping using **cron-job.org** (no signup complexity) or a **GitHub Action on a cron schedule**, hitting any endpoint on your Supabase project (e.g. a lightweight Edge Function that just returns `200 OK`) every 3–4 days.
- Keep it running through **at least September 4**.
- This costs nothing and takes minutes — it's the single easiest failure mode to eliminate on this whole build.

---

## 8. Digital Public Good compliance checklist

- [ ] Open-source license in the repo (MIT or Apache 2.0)
- [ ] SDG alignment statement (SDG 2, SDG 13) in the README
- [ ] RLS policy tested and confirmed: a farmer cannot read another farmer's data; policymakers only ever see the aggregated `regional_trends` view
- [ ] No hardcoded secrets/API keys in the public repo (Gemini key and Supabase keys in environment variables)

---

## 9. Submission checklist

- [ ] Source code — public or access-granted GitHub repo
- [ ] Demo video (3–5 min) — end-to-end walkthrough, both countries
- [ ] Pitch deck (10–12 slides) — lead with the AgriN vs. Digital Agriculture Network distinction
- [ ] Brief description (2–3 lines)
- [ ] Deployed live link — tested from a fresh session, **and kept alive per §7**
