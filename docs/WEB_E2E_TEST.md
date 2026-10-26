# End-to-End Test Checklist (Web)

Test full flow: auth -> ask -> compute via model -> workspace -> save artifact -> reopen.

## Prerequisites
- Model: http://127.0.0.1:8000 (healthy)
- API: http://localhost:4000
- Web: http://localhost:3000
- Postgres/Redis running (or docker compose)

## Steps
1. **Auth**
   - [ ] Go to /auth/sign-up or /auth/sign-in
   - [ ] Create/login account
   - [ ] Session persists

2. **Ask questions (all engines)**
   - [ ] Crop: "what crop should I plant in Musanze?" -> decision/crop_choice
   - [ ] Career: "should I study software developer or civil engineer?" -> decision/career_choice
   - [ ] NEET: "what factors predict youth NEET rate?" -> regression with metrics
   - [ ] Trends: "employment trends by sector" -> forecasting with charts/tables
   - [ ] Clusters: "which districts have labour underutilization?" -> clustering with map/table

3. **Workspace rendering**
   - [ ] Metrics, charts, tables, map (if applicable) render
   - [ ] Sources/caveats visible
   - [ ] No console errors

4. **Save & reopen**
   - [ ] Save artifact (if prompted/button exists)
   - [ ] Go to history/artifacts and reopen
   - [ ] Same result/spec loads correctly

## Notes
- If API falls back to local engine, check MODEL_URL and model service
- requestId required by model schema
