# Methodology and Implementation Plan

## 1. Project Overview
**Team Name:** Team Nirvana (S0051)
**Problem Statement ID:** SIH26193
**Problem Statement:** Developing solutions to enhance the primary sector of India (Agriculture) and to manage and process agricultural produce.
**Project Name:** AgriCrate 

AgriCrate is an AI-powered, mobile-first unified dashboard designed to empower Indian farmers with enterprise-level agricultural intelligence. It prevents crop loss and maximizes market profits through data-driven insights.

---

## 2. Core Methodology
Our solution is built on a three-tier architectural methodology, ensuring scalability, accuracy, and ease of use for the end user.

### A. Data Aggregation & Context Layer
*   **Hyper-Local Profiling:** Users define their farm via an interactive GPS minimap in the "My Fields" module. 
*   **Satellite Telemetry:** Integration with Google Earth Engine (Sentinel-2 satellite) to continuously monitor the Normalized Difference Vegetation Index (NDVI) of the registered fields.
*   **Real-time Weather:** Fetching hyper-local weather parameters based on exact farm coordinates to feed into the AI Advisory system.

### B. Artificial Intelligence & Analytics Layer
*   **Computer Vision Diagnostics:** Utilizing advanced image processing and CNN-based anomaly detection to scan user-uploaded photos of crops. The system isolates necrotic/diseased tissue using bounding boxes and generates highly accurate diagnoses (e.g., Apple Black Rot).
*   **Predictive Market Modeling:** Applying Exponential Moving Average (EMA) algorithms and time-series analysis to historical crop pricing data. This generates forward-looking price trend lines to help farmers time the market.
*   **Automated Agronomist:** A rule-based AI engine that synthesizes weather, soil, and diagnostic data to generate actionable, scientifically-backed treatment reports and daily advisories.

### C. Application & Presentation Layer
*   **Unified Dashboard:** A Next.js-powered web application that consolidates disparate agricultural data streams into a single, intuitive interface.
*   **Responsive Visualization:** Using optimized charting libraries to render 15-day satellite health trends and market futures natively on mobile devices without scroll-hijacking.

---

## 3. Implementation Plan

The project was executed in five structured phases:

### Phase 1: Research & Prototyping
*   **Objective:** Identify critical pain points for Indian farmers (unpredictable weather, unknown diseases, market volatility).
*   **Action:** Designed mobile-first UI/UX wireframes focusing on high readability and intuitive navigation (minimaps, large tap targets, unified dashboard).

### Phase 2: Core Architecture & Database Setup
*   **Objective:** Establish the backend structure and knowledge base.
*   **Action:** Scaffolded the Next.js application. Built the `cropKnowledgeBase` and botanical encyclopedia containing detailed anatomical data, environmental triggers, and chemical treatments for various crop diseases.

### Phase 3: AI & API Integrations
*   **Objective:** Connect the intelligence engines.
*   **Action:** 
    *   Linked the Earth Engine API to fetch dynamic NDVI surface reflectance data.
    *   Developed the predictive market logic for futures forecasting.
    *   Built the AI diagnostic endpoint to process image data and return structured confidence scores and anomaly bounding boxes.

### Phase 4: Frontend Development & State Management
*   **Objective:** Build the interactive UI.
*   **Action:** Developed the core modules: `My Fields`, `Market Futures`, `Diagnostics`, and `Reports`. Implemented Chart.js for smooth data visualization and built the interactive multi-step diagnostic loading sequences to provide visual feedback during complex backend processing.

### Phase 5: Testing, Polish, & Deployment
*   **Objective:** Ensure a production-ready, highly stable application.
*   **Action:** Refined mobile responsiveness (fixing chart zoom interference on touchscreens). Clamped data limits for accurate representation (e.g., locking NDVI values between 0.0 and 1.0). Deployed the final application via Vercel for continuous integration and delivery.

---

## 4. Future Scope
*   **Hardware IoT Integration:** Linking on-site soil moisture and NPK sensors directly into the dashboard to augment the satellite data.
*   **Expanded Botanical Database:** Scaling the AI vision model to recognize hundreds of regional crop varieties and rare localized pathogens.
*   **Direct-to-Buyer Marketplace:** Expanding the "Market Futures" tab to allow farmers to directly execute smart contracts with buyers when the price reaches optimal prediction peaks.
