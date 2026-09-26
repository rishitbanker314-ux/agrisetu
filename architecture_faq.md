# AgriCrate: Architecture FAQ & Scaling Roadmap

This document serves as the official response to architectural critiques and scaling concerns regarding the AgriCrate codebase. It outlines the precise rationale behind current MVP design decisions and defines the definitive roadmap for addressing identified bottlenecks.

---

## Part 1: Resolving Architectural Ambiguities

### 1. The `coordSeed` Determinism vs. Real Soil APIs
**Critique**: Soil moisture and pH are simulated deterministically from coordinates. Does the UI label these as estimates? Was free real data (ISRIC SoilGrids/NASA SMAP) ruled out?
*   **Current State**: The UI currently presents these as live local conditions without an explicit "estimated" disclaimer. Deterministic modeling was chosen to guarantee sub-second response times, ensure offline functionality, and completely eliminate external API dependency risk during the prototype phase.
*   **The Resolution**: We acknowledge the liability risk of presenting modeled pH as absolute truth. Before commercial deployment, we will either (A) add a clear UI disclaimer indicating these are algorithmic estimates, or (B) integrate ISRIC SoilGrids/NASA SMAP. These APIs fit our zero-cost constraint and will be added as a progressive enhancement.

### 2. Earth Engine & NDVI Anchoring
**Critique**: Earth Engine is mentioned in the vision, but where is it in the architecture? Is NDVI anchored to a real satellite observation ($N_0$)?
*   **Current State**: Yes. When a farmer draws a physical boundary, the `generateFieldIntelligence` module POSTs the GeoJSON to the AgroMonitoring API. AgroMonitoring acts as our free-tier, developer-friendly proxy for raw Sentinel-2/Earth Engine data. 
*   **The Resolution**: The most recent satellite pass is fetched and becomes the exact starting anchor ($N_0$) for our logistic growth curve. Only if a boundary is missing does the system fall back to pure synthetic modeling. Because AgroMonitoring manages the satellite ingestion pipeline for us, it perfectly satisfies our "zero-infrastructure" constraint.

### 3. Dual Backends: Next.js API vs. Edge Functions
**Critique**: If `market-insights`, `diagnostic-module`, and `fusion-engine` are unused by the Next API routes, which path is live, and how do we reason about load?
*   **Current State**: The **Next.js App Router API routes** (`/api/diagnose`, `/api/ndvi`) are the strictly active, live production paths handling all UI requests. 
*   **The Resolution**: The Supabase Edge Functions are explicitly retained as decoupled microservices. `fusion-engine` is designed to be an aggregator for fetching from multiple APIs simultaneously. They exist as architectural insurance for future asynchronous tasks that exceed Vercel's strict serverless timeout limits (e.g., long-running market data aggregation).

### 4. Hugging Face Space (`rishit0311/agricrate-api`)
**Critique**: Free HF Spaces sleep after 48h and cold-start in 30-60s. Real field photos drop accuracy.
*   **Current State**: The cold-start delay is a known, accepted tradeoff to maintain the strict zero-cost constraint during the MVP phase. 
*   **The Resolution**: The definitive scaling plan is to convert the PyTorch/FastAI model to ONNX format. This will allow the model to run *entirely* client-side in the browser via WebAssembly (Wasm). This eliminates cold starts, bypasses the HF Space entirely, and solves the patchy 3G connectivity issue for remote farmers.

### 5. Market Insights Data Source
**Critique**: Where does the market data actually come from?
*   **Current State**: It is currently simulated using the hardcoded `CROP_BASELINES` dictionary, combined with the local `coordSeed` to generate realistic, deterministic ±15% localized price fluctuations.
*   **The Resolution**: This approach avoids brittle web scrapers during the MVP. The scaling plan involves creating a scheduled Supabase Cron job to fetch daily official data from Agmarknet / data.gov.in and store it in a `market_rates` Postgres table.

---

## Part 2: Overcoming the Scaling Walls

### Wall 1: Data Volume (Open-Meteo Limits)
**Critique**: The free tier of 10k calls/day is a hard ceiling if every field load hits Open-Meteo.
*   **The Blueprint**: A caching layer is mandatory. We will implement a `weather_cache` table in Supabase. The primary key will be a rounded lat/lng coordinate pair (e.g., to 2 decimal places, representing a ~1km grid) combined with the date. This will multiply our capacity by a massive factor for minimal code overhead.

### Wall 2: Database Schema & Historical Tracking
**Critique**: The `reports` table lacks `field_id`, image references, and timestamps. There is no historical time-series data.
*   **The Blueprint**: This is the highest-priority schema migration. The `reports` table will be updated to include:
    *   `field_id` (Foreign Key)
    *   `created_at` (Timestamp)
    *   `image_path` (Supabase Storage reference)
    This enables critical features like "your field vs. three weeks ago" and allows us to accumulate a proprietary, labeled dataset for future model fine-tuning.

### Wall 3: Hardcoded Agronomy Rules
**Critique**: Hardcoding weather×crop conditionals doesn't scale linearly beyond 10 crops.
*   **The Blueprint**: The `advisoryRules.ts` matrix will be migrated into a declarative Postgres table. Thresholds will exist as database rows rather than TypeScript code, transforming agronomic expansion into a simple data entry task that non-developers can manage.

### Note on Prop-Drilling vs. Context
**Critique**: Is React Context banned?
*   **The Blueprint**: React Context is natively built into React and does NOT violate the "no external dependencies" rule. However, prop-drilling is currently maintained for simplicity. We will adopt React Context strictly when the component tree depth requires it, avoiding premature abstraction.
