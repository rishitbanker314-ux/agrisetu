# AgriCrate (AgriCrate) — Comprehensive Project Context
> [!NOTE]
> This document serves as the master context file for AgriCrate. It is highly detailed and optimized for ingestion by AI databases, search systems, and LLMs to understand the project's vision, architecture, and feature implementations.
> **Last updated**: 2026-09-10.

## 1. Project Overview & Vision
* **Project Name**: AgriCrate (product brand displayed in the UI is **AgriCrate**).
* **Target Event / Initiative**: Built for the **SIH (Smart India Hackathon)**.
* **Core Problem Solved**: 
  * Farmers lack access to real-time, data-driven agricultural advice personalized to their specific field conditions.
  * Agricultural decisions are predominantly made on guesswork rather than leveraging satellite, soil, and weather intelligence.
* **Target Audience**: Primary users are small to middle-scale farmers, though the platform can accommodate any agricultural user.
* **Meaning of "Setu"**: "Setu" means *bridge* in Hindi. The project name symbolizes bridging the gap between farmers and advanced AI-driven agricultural intelligence.

## 2. Complete Technology Stack
### Frontend
* **Framework**: Next.js 16.3 (App Router) with React 19.
* **Styling**: Tailwind CSS v4 for utility-first styling.
* **State Management**: Zustand (v5).
* **Maps & GIS**: Leaflet and `react-leaflet` for interactive mapping.
* **Charting**: Chart.js (via `react-chartjs-2`) with `chartjs-plugin-zoom` for pan & zoom NDVI charts. The 7-day forecast chart is a custom dependency-free bar chart.
* **Animations**: Framer Motion.
* **Internationalization (i18n)**: `next-intl` (v4) — supporting **4 locales**: English (`en`), Hindi (`hi`), Portuguese (`pt`), and Chinese (`zh`).
* **Icons**: Lucide React.
* **Markdown Rendering**: `react-markdown` with `remark-gfm` for rendering AI advisory output.
* **PDF Generation**: `jsPDF` + `html-to-image` for client-side report PDF export.
* **Email Delivery**: Nodemailer (Gmail SMTP) via a Next.js API route for emailing PDF reports.
* **Toast Notifications**: Sonner.
* **PWA**: `@ducanh2912/next-pwa` — the app is a Progressive Web App with offline caching for Supabase API and map tiles.
* **Utility Libraries**: `clsx`, `tailwind-merge` (installed but lightly used).
* **Unused Dependencies** (in `package.json` but not imported in `src/`): `@google/earthengine`, `googleapis`, `ws`. These are vestigial from earlier prototypes.
* **Design Aesthetic**: Playfair Display (`font-serif`) for headings, **Geist** (`font-sans`) for body text, and Geist Mono (`font-mono`) — loaded via `next/font/google`. Custom CSS design tokens (Tailwind v4 `@theme inline`): `paper-ivory`, `deep-forest`, `ink`, `sage`, `moss`, `terracotta`, `marigold`, `soft-line`. The `@tailwindcss/typography` plugin is used for rich prose formatting.

### Backend & Database (Decoupled Architecture)
* **Hosting**: Frontend hosted on Vercel; Backend hosted on Supabase.
* **Database**: Supabase PostgreSQL.
* **Serverless Compute**: Supabase Edge Functions (Deno).
* **Storage**: Supabase Storage (for image uploads like crop diseases).
* **Authentication**: Supabase Auth.
* **Real-time**: Supabase Realtime subscriptions are enabled for the `notifications` table.
* **Security**: Row Level Security (RLS) is heavily implemented across all tables to ensure "do-no-harm" privacy, a key requirement for Digital Public Good (DPG) compliance.

### AI & External Data
* **AI Provider**: Google AI Studio (Free Tier) — specifically utilizing the **Gemini 2.5 Flash** model via the `@google/generative-ai` SDK. Vertex AI is explicitly avoided.
* **Weather & Environmental Data**: **Open-Meteo API** (used for fetching real-time temperature, humidity, soil moisture, precipitation, and **16-day forecasts**).
* **Satellite NDVI**: **AgroMonitoring API** — when the user draws a polygon boundary, real satellite NDVI data is fetched from the latest available pass (10-day window).
* **Indian Mandi Market Prices**: **data.gov.in** API (Government of India Open Data Platform) — fetches real-time spot prices for commodities from Indian agricultural markets (mandis).
* **Global Commodity Futures**: **Yahoo Finance** API — fetches 12-month historical futures data for corn (`ZC=F`), wheat (`KE=F`), soy (`ZS=F`), cotton (`CT=F`), sugar (`SB=F`), coffee (`KC=F`), rice (`ZR=F`), and oats (`ZO=F`).
* **Geocoding & Location Search**: **OpenStreetMap Nominatim** API for location search autocomplete (`LocationSearch.tsx`).
* **Reverse Geocoding (Crop Validation)**: **BigDataCloud** free reverse-geocoding API — used in the `useCropValidation` hook to determine country code and region for crop suitability checks.

## 3. Core Features & Technical Implementations

### Interactive Map & Field Management
* **Implementation**: Uses Leaflet with a togglable map style — **OpenStreetMap** (street view, default) and **Esri World Imagery** (satellite). The toggle persists the user's preference in `localStorage`.
* **Capabilities**: Users can draw polygon boundaries to outline exact field shapes. The map overlays an NDVI (Normalized Difference Vegetation Index) color scale on fields (green = healthy, red = drought stress). Multiple fields per user are stored in the Supabase database and can be switched via the dashboard UI. Fields have metadata: name, crop, area, status, and drawn boundary coordinates. Custom SVG map markers replace the default Leaflet pins.

### Location Search
* **Implementation (`LocationSearch.tsx`)**: A debounced search input that queries the Nominatim (OpenStreetMap) API. It provides autocomplete suggestions with map-pin icons. Selecting a result pans the map to those coordinates.

### Live Field Data & Weather Integration
* **Implementation (`fieldIntelligence.ts` + `useFieldData.ts` hook)**: The core intelligence module (`src/lib/fieldIntelligence.ts`) fetches live weather data (temperature, humidity, soil moisture, 16-day forecast) from the Open-Meteo API using the field's coordinates. The React hook (`src/hooks/useFieldData.ts`) wraps this as a stateful hook re-exporting the `LiveFieldData` type.
* **Hardware Simulation**: Because the project lacks physical IoT sensors, the system uses a **pseudo-random seed algorithm based on the field's latitude and longitude**. This seed simulates distinct, realistic soil pH and baseline moisture values for every unique coordinate on Earth.

### Real Satellite NDVI via AgroMonitoring
* **Implementation (`fieldIntelligence.ts`)**: When a user has drawn a polygon boundary, the system:
  1. Creates a polygon on the AgroMonitoring API.
  2. Fetches the last 10 days of satellite NDVI history for that polygon.
  3. Uses the most recent satellite pass's mean NDVI as the live value.
  4. Falls back to an algorithmic weather-based NDVI prediction if no satellite data is available.

### 16-Day Temporal Simulation
* **Implementation (`fieldIntelligence.ts` / `TemporalSlider.tsx`)**: Uses the actual **16-day Open-Meteo forecast** (not a synthetic 90-day extrapolation).
* **Logic**: The NDVI is adjusted day-by-day based on actual forecast precipitation (boost NDVI) and high temperatures (drought stress). This produces a realistic 16-day NDVI progression.
* **Temporal Data also includes**:
  * **Disease Risk Radar**: Fungal/blight risk classification (Low/Medium/High/CRITICAL) based on humidity, temperature, and rainfall conditions for each forecast day.
  * **Economic Yield Optimizer**: Estimated crop value per day, calculated from a crop-specific baseline yield/price database (`CROP_BASELINES`), field area, and NDVI efficiency factor.

### Crop Viability Validation Engine
* **Implementation (`cropKnowledgeBase.ts` + `cropViability.ts`)**: A local knowledge base of 14 major crops (Apple, Wheat, Rice, Sugarcane, Cotton, Maize, Soybean, Tea, Coffee, Potato, Mango, Mustard, Tomato, Onion) with temperature ranges, altitude constraints, suitable/unsuitable regions, and Hindi aliases.
* **Logic**: Before any dashboard data is displayed, the system evaluates whether the selected crop is biologically viable at the field's location by checking temperature vs. survival thresholds, elevation limits, and regional suitability. If the crop is non-viable, the entire dashboard drawer shows a "Cultivation Not Viable" block with an agronomic assessment instead of analytics tabs.
* **Validation also includes an ocean/water-body check** — if the geocoded coordinates return no country code, it flags the location as a body of water.

### NDVI Chart with Zoom & Pan
* **Implementation (`NDVIChartClient.tsx`)**: An interactive Chart.js Line chart displaying the NDVI forecast progression (labelled "15-Day" in the UI; data from 16-day Open-Meteo forecast). Uses `chartjs-plugin-zoom` for scroll-to-zoom and drag-to-pan functionality. Displays the current live NDVI value in a badge.

### AI Advisory Engine
* **Implementation**: A Supabase Edge Function (`advisory-engine`) calls the **Gemini 2.5 Flash** API.
* **Logic**: Contains a built-in **crop cultivation guide database** (12 crops: wheat, rice, corn, cotton, sugarcane, soybean, potato, tomato, onion, apple, grapes, coffee) with detailed step-by-step guides embedded directly in the function. Gemini is prompted with real-time field data (NDVI, soil pH, moisture, weather) to generate a comprehensive agronomic report with 5 sections: Cultivation Guide, Field Health Assessment, Precision Irrigation & Nutrient Management, Disease & Pest Forecasting, and Yield Optimization. Includes a **location arable-check** — Gemini validates that the coordinates are not an ocean, desert, or urban center before advising.
* **Voice Query Support**: The function also accepts a `voice_query` parameter for conversational text-to-speech-optimized responses (no markdown, under 3 sentences).
* **Rendering**: The advisory response is rendered as formatted Markdown (via `react-markdown` + `remark-gfm`) in the dashboard advisory panel.

### Crop Disease Diagnosis
* **Implementation (`DiagnosisUpload.tsx`)**: Users upload a photo of a crop (read as base64 client-side).
* **Logic**: The base64 image is passed to the `diagnostic-module` Edge Function, which utilizes **Gemini 2.5 Flash**'s multimodal vision capabilities to analyze the image, label the disease with a confidence score, and provide treatment advice. Includes a **non-agricultural image guard** — if the image is not of a plant/crop, it returns an "Invalid Image" response instead of a false diagnosis.

### Market Futures & Scenario Simulation
* **Implementation (`MarketScenarios.tsx`)**: Calls the `market-insights` Edge Function.
* **Real Data Sources**: The edge function fetches **real Indian Mandi spot prices** from the **data.gov.in** API (Government of India open data) and **Yahoo Finance** global commodity futures (ticker symbols for corn, wheat, soy, cotton, sugar, coffee, rice, oats). If Mandi API fails, it derives an estimated INR price from global futures.
* **Logic**: The real market data plus crop/coordinates are fed to Gemini 2.5 Flash to generate localized market price analysis, 12-month historical trend charts (ASCII), and future price scenarios. The `MarketInsights.tsx` component also exists but is currently not wired into the dashboard tabs.

### Acoustic Biosphere Monitor
* **Implementation (`AcousticBiosphere.tsx`)**: A highly unique, visual feature simulating subsurface acoustic monitoring of root cavitation events.
* **UI**: Features a radar-style interface with animated sweeps, pulsing blips, and a mycelial network visualization. Stress levels and acoustic events are derived mathematically from the live soil moisture data.

### Climate Alerts & Notification System
* **Implementation (`ClimateAlerts.tsx`)**: Analyzes the 7-day forecast data to detect frost, heatwave, and flood risk thresholds.
* **Persistent Notifications**: A `notifications` table in the database (with Supabase Realtime enabled) stores per-user notifications. Users can toggle app-level notifications on/off via the `app_notifications` column on their profile.

### 7-Day Forecast Chart
* **Implementation (`ForecastChart.tsx`)**: A custom-built, dependency-free bar chart using standard React and Tailwind CSS.
* **UI**: Renders side-by-side vertical bars representing Max Temperature and Rainfall for each of the 7 days, complete with custom CSS-based tooltips on hover.

### Reports & PDF Export
* **Implementation (`reports/` route + `send-report` API route)**: Users can generate and view field reports. Reports are stored in the `reports` table (owner-scoped via RLS).
* **PDF Export**: Client-side PDF generation using `jsPDF` and `html-to-image`.
* **Email Delivery**: A Next.js API route (`/api/send-report`) uses Nodemailer with Gmail SMTP to email PDF reports as attachments.

### Field Notes
* **Implementation (`FieldNotes.tsx` editorial landing section + `field-notes/` route)**: A journal feature for farmers to write and manage notes linked to specific fields. Full CRUD with RLS.

### Progressive Web App (PWA)
* **Implementation**: `@ducanh2912/next-pwa` wraps the Next.js config. The app ships with a `manifest.json` and service worker for offline caching of Supabase API responses (NetworkFirst, 24h) and OpenStreetMap tiles (StaleWhileRevalidate, 7 days).

## 4. Architecture & Data Model

### Database Schema (Supabase)
1. **`profiles`**: User identity (id, name, phone), role (`farmer`/`policymaker`), preferred language, country, region, `app_notifications` boolean, `whatsapp_alerts` boolean, `email_summary` boolean.
2. **`fields`**: Geospatial locations (lat, lng), crop type, name, area, status, drawn boundary coordinates, crop history (JSONB), linked to owner.
3. **`health_profiles`**: NDVI, simulated soil properties (JSONB), and weather forecast (JSONB) linked per field.
4. **`advisories`**: AI-generated recommendation text, language metadata, voice URL.
5. **`diagnoses`**: Uploaded image URLs, disease labels, confidence scores, and treatment advice.
6. **`reports`**: User-generated reports with title, type, date, size, and `metadata` (JSONB).
7. **`field_notes`**: User journal entries linked to specific fields (title, content, timestamps). Full CRUD with RLS.
8. **`notifications`**: Real-time notifications (title, message, is_hidden). Enabled for Supabase Realtime via `supabase_realtime` publication.
9. **`regional_trends`** *(materialized view)*: Aggregated NDVI statistics and request volume per country/region for policymakers.

### Edge Functions (Deno)
1. **`advisory-engine`**: AI crop recommendations with built-in crop guides and voice query support. Uses Gemini 2.5 Flash.
2. **`diagnostic-module`**: AI multimodal vision analysis for crop diseases with non-agricultural image guard. Uses Gemini 2.5 Flash.
3. **`fusion-engine`**: Fuses satellite, soil, and weather data in parallel via a **country adapter pattern** (`getAdapterForCountry`). Inserts results into `health_profiles`.
4. **`market-insights`**: Real Indian Mandi prices (data.gov.in) + Yahoo Finance commodity futures + AI scenario generation. Uses Gemini 2.5 Flash.

### Next.js API Routes
1. **`/api/send-report`**: POST endpoint — accepts email + base64 PDF, sends via Nodemailer/Gmail SMTP.

### Client-Side Intelligence Modules (`src/lib/`)
1. **`fieldIntelligence.ts`**: Core data-fusion module. Fetches Open-Meteo weather, AgroMonitoring NDVI, and computes temporal NDVI progression, disease risk, and yield economics.
2. **`cropKnowledgeBase.ts`**: Static crop profile database (14 crops) with climatic and regional suitability data.
3. **`cropViability.ts`**: Evaluates crop-field suitability using temperature, elevation, and regional checks.
4. **`gemini.ts`**: Google Generative AI client initialization.
5. **`supabase.ts`**: Supabase client initialization.

### React Hooks (`src/hooks/`)
1. **`useFieldData.ts`**: Wraps `generateFieldIntelligence()` in a React hook with loading/error state. Re-exports `LiveFieldData` type.
2. **`useAdvisory.ts`**: Invokes the `advisory-engine` Edge Function with field data, crop, and language. Returns the AI recommendation text.
3. **`useCropValidation.ts`**: Debounced hook that fetches current temperature (Open-Meteo) and reverse-geocoding (BigDataCloud), then evaluates crop viability via `evaluateCropSuitability()`.

## 5. Application Structure & UX
* **Main Routes (`src/app/[locale]/`)**:
  * `/` (landing page), `/about`, `/dashboard`, `/field-notes`, `/fields`, `/login`, `/platform`, `/privacy`, `/reports`, `/reports/[id]`, `/settings`, `/solution`, `/terms`
* **Landing Page Components (`src/components/editorial/`)**:
  * `PageLoader`: Animated entry loader with branding.
  * `SiteHeader`: Global site header with navigation.
  * `EditorialHero`: Parallax farmland imagery.
  * `FieldAtlasReveal`: Animated demonstration of the field atlas.
  * `SignalTranslation`: Explanation of the data pipeline.
  * `CropCycleTimeline`: Visualization of crop growth stages.
  * `FieldNotes`: Landing page teaser for the field notes feature.
  * `FinalCTA`: Call-to-action section ("Stop guessing. Start knowing.").
  * `SiteFooter`: Global footer.
* **Dashboard Components (`src/components/dashboard/`)**:
  * `AppHeader`: Dashboard header with hamburger menu, user avatar, sign-out.
  * `MapWorkspace`: Full-screen map workspace with overlays.
  * `BottomDrawer`: Slide-up analytics drawer.
  * `DrawerTabs`: Tabbed interface with 6 tabs — Advisory, Forecast, Market Futures, NDVI Trends, Diagnostics, Acoustic Biosphere.
  * `AdvisoryPanel`: Renders AI advisory Markdown.
* **Shared Components (`src/components/`)**:
  * `Dashboard.tsx`: Root dashboard orchestrator.
  * `Map.tsx`: Leaflet map with polygon drawing and NDVI overlay.
  * `LocationSearch.tsx`: Nominatim-powered search.
  * `WeatherWidget.tsx`: Compact temperature/humidity/soil widget.
  * `TemporalSlider.tsx`: Day slider for temporal simulation.
  * `ForecastChart.tsx`: Custom 7-day forecast bar chart.
  * `NDVIChart.tsx` / `NDVIChartClient.tsx`: Chart.js NDVI trend chart with zoom.
  * `MarketInsights.tsx` / `MarketScenarios.tsx`: AI market analysis.
  * `DiagnosisUpload.tsx`: Crop disease image upload & analysis.
  * `AcousticBiosphere.tsx`: Radar-style biosphere monitor.
  * `ClimateAlerts.tsx`: Weather threshold alert engine.
  * `NavigationSidebar.tsx`: Slide-out navigation drawer (Home, Dashboard, My Fields, Field Notes, Reports, Settings).
* **Navigation Sidebar Links**: Home, Dashboard, My Fields, Field Notes, Reports, Settings.
* **Cross-Border Functionality**: All data sources (Open-Meteo, Gemini, AgroMonitoring) are inherently global, meaning the exact same pipeline functions seamlessly across any geographic coordinate (e.g., India to Brazil).

## 6. Infrastructure, Cost & Compliance
* **Total Infrastructure Cost**: **$0** (The entire project is architected to run strictly on free tiers).
* **Judging Period Keep-Alive**: Because Supabase pauses free-tier projects after 7 days of inactivity, a keep-alive ping is set up via cron-job.org or GitHub Actions every 3-4 days to ensure the database is awake for judges.
* **Digital Public Good (DPG) Compliance**: 
  * Open-source licensed (MIT or Apache 2.0).
  * Strict Row Level Security (RLS) implementation guarantees privacy and data protection.

## 7. Removed / Deprecated Features
* **Voice Copilot**: Was previously present; has been removed from the project.
* **Sustainability / ESG Score**: The `SustainabilityScore.tsx` component has been removed. Carbon credit calculations are no longer part of the dashboard.
* **90-Day Temporal Simulation**: Replaced by the real 16-day Open-Meteo forecast-based temporal model.
