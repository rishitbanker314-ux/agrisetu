# AgriCrate: Strict AI Context & Architecture Rules

<purpose>
CRITICAL DIRECTIVE: This document is the absolute, definitive architectural rulebook for ANY AI agent operating on the AgriCrate codebase. 
When instructed to read this file, you MUST strictly adhere to every constraint, schema, and design pattern outlined below. 
FAILURE TO FOLLOW THESE RULES constitutes a direct violation of user instructions. Do NOT deviate from this architecture. Do NOT suggest alternatives. Do NOT make assumptions outside these bounds.
</purpose>

<project_vision>
AgriCrate is a zero-infrastructure, free-to-use Digital Public Good (DPG) designed to democratize precision agriculture for smallholder farmers.
- **The Core Problem**: Farmers lack hyper-local, actionable data on their crops and cannot afford expensive proprietary SaaS subscriptions.
- **The Solution**: AgriCrate provides live crop health monitoring, disease diagnosis, and market insights using ONLY algorithmic modeling, free satellite data (Earth Engine), and open-source models (Hugging Face).
- **The AI's Role**: Your job as an AI assistant is to maintain this purity. Never add bloated dependencies, never add paid APIs, and ensure the app remains lightweight and accessible.
</project_vision>

<critical_constraints>
1. **HARD BAN ON PROPRIETARY LLMs**: YOU MUST NOT integrate Gemini, OpenAI, Anthropic, or any other paid LLM into the backend. The intelligence engine relies strictly on deterministic algorithms and the specific open-source Hugging Face models defined below.
2. **ZERO-COST INFRASTRUCTURE**: The platform MUST remain a zero-cost DPG. You are restricted to using free-tier, open-source, or non-commercial services (e.g., Open-Meteo, Leaflet, Supabase, Hugging Face Spaces).
3. **STRICT RLS ENFORCEMENT**: All Supabase database tables MUST maintain Row Level Security (RLS). YOU MUST NOT create backend endpoints that bypass RLS using a `service_role` key unless explicitly authorized by the user for a highly specific webhook.
</critical_constraints>

<frontend_architecture>
<stack>
- **Framework**: Next.js App Router (React Server Components + Client Components).
- **Styling**: Tailwind CSS ONLY. Do not introduce alternative styling libraries.
- **Mapping**: Leaflet.js (`react-leaflet` + `@geoman-io/leaflet-geoman-free`). Google Maps is BANNED.
- **PWA/i18n**: `next-pwa` for offline capabilities; `next-intl` for localization.
</stack>

<state_management>
- **BANNED**: Do NOT introduce Redux, Zustand, Jotai, or any external state managers.
- **ALLOWED**: `src/components/Dashboard.tsx` acts as the master orchestrator. Shared state (e.g., `center`, `fieldId`, `crop`, `dateOffset`) MUST be passed down to children (`MapWorkspace`, `BottomDrawer`, `AppHeader`) via props.
- Data fetching MUST be handled by custom hooks (`useFieldData`, `useAdvisory`) which respond reactively to state changes.
</state_management>
</frontend_architecture>

<backend_architecture>
<database_schema>
The primary database is Supabase PostgreSQL. Core tables:
1. `profiles`: `id` (UUID, auth.users FK), `name`, `country`, `role`
2. `fields`: `id`, `owner_id` (UUID), `name`, `crop`, `lat`, `lng`, `boundary` (JSONB GeoJSON)
3. `reports`: `id`, `owner_id`, `disease_label`, `confidence`
</database_schema>

<edge_functions>
Deno-based functions located in `supabase/functions/`. 
**MANDATORY RULE**: YOU MUST NOT delete or alter `market-insights`, `diagnostic-module`, `fusion-engine`, or `_shared`. Even if they appear redundant or unused by the current Next.js API routes, their presence is strictly required by the user.
</edge_functions>
</backend_architecture>

<intelligence_engine>
<algorithmic_core>
Located in `src/lib/fieldIntelligence.ts`. This engine prevents the need for LLMs by mathematically calculating crop health.
- **Weather**: Fetches 16-day forecasts from the free Open-Meteo API.
- **Determinism**: Uses a `coordSeed` derived from `lat/lng` to simulate deterministic, hyper-local variations in soil moisture and pH.
- **NDVI Growth**: Projects future vegetation health using a biological logistic growth curve (`dN = r * N * (1 - N/K)`).
- **Disease Radar**: Triggers hardcoded warnings based on exact weather/crop overlaps (e.g., Wheat + Temp > 32°C + Humidity > 60% = Wheat Rust Risk).
</algorithmic_core>

<computer_vision>
Located in `/api/diagnose/route.ts`.
- Instead of cloud vision APIs, it connects to a dedicated Hugging Face Space (`rishit0311/agricrate-api`) using the `@gradio/client`.
- Maps the returned prediction (e.g., `bean_rust`) to static treatment advice in `src/lib/encyclopedia.ts`.
</computer_vision>
</intelligence_engine>
