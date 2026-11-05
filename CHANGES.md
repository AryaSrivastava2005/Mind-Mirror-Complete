## 1.5.0

- Replaced assessment result tables and repeated question lists with labelled bar graphs, response-based descriptions and separate stress/mental-health situation tips.
- Server-rendered charts work without JavaScript or external chart services. Saved reports retain their timeframe and data. Skipped areas are explicitly unavailable, not scored as zero symptoms.

## 1.4.5

- Converted all 120 stress and mental-health questions and situations to present tense; all 15 personality statements already use present tense.
- Instructions and new report timeframe now refer to current daily experience. Assessment content version is 1.1; existing saved reports retain their original wording and timeframe.

## 1.4.4

- Removed the Tele-MANAS paragraph and Sources and limits disclosure shown in the screenshot from the shared assessment support panel.

## 1.4.3

- Replaced the dashboard top-navigation test link with a randomly selected quote and author on each page load; attribution sources are in data/motivation.json.

- Dashboard and Personality Test now fill the available page width with small outer gutters.
- Five single-line personality answer choices share a row on desktop; compact full-width choices stack below 1200px.
- Reduced answer-box height while preserving square content containers.

# Refinements

- Extracted scoring and chatbot logic into separate modules.
- Corrected tied highest categories; retained existing thresholds with agreement labels.
- Removed unsupported AI and emotional-analysis claims from the home/about wording.
- Validated all answers on the server and retained selections after an invalid submission.
- Added live questionnaire progress, mobile viewport, document language and character encoding.
- Fixed result-hero contrast and selected-answer contrast; restored keyboard-focusable radio controls.
- Added reduced-motion support and prevented hidden sidebar links from receiving focus.
- Added CSRF protection, POST logout, regenerated login sessions and safer cookie defaults.
- Added basic per-IP account throttling, generic login errors and request limits.
- Normalized account fields and validated usernames, email and password length.
- Used UUID record IDs, atomic JSON replacement and a fresh database read after password hashing.
- Added error handling, localhost binding, dependency lockfile and isolated integration tests.
- Added CODE_GUIDE.md. Existing pages and the 15-question flow are retained.

Limitations: local JSON and in-memory sessions remain; no external AI, working contact service, account recovery, counsellor scheduling or new music features were added. Existing result records are not rescored. CSS retains the original design and overrides rather than receiving a full redesign. Visual browser QA remains pending.

## Version 1.2 — Music & Mood
- Added song entry, optional artist, starter catalog lookup and unknown-song handling.
- Separated suggested musical tone from explicitly selected personal feeling.
- Added opt-in saving, per-user history and owner-only deletion.
- Added menu/dashboard links and extended functional checks.
- Works offline after package installation; no API key required.

## Version 1.3 — Online song and genre search
- Replaced the local catalog with the Apple iTunes Search API.
- Added region selection, recording confirmation, source links and listed genres.
- Added rule-based genre reflection prompts, separate from self-reported mood.
- Added timeouts, bounded caching, provider request limits and graceful failures.
- Validated selected IDs against expiring session search results.
- Preserved old history and extended tests with mocked provider responses.
- Live API request timed out here; deployment connectivity remains to be checked.

## Version 1.4 — Two 60-item assessments
- Added Stress Analysis and Mental Health Analysis, each with 30 questions and 30 lived-situation prompts.
- Made mental wellbeing prominent on the homepage and added assessment navigation/history.
- Added six-section navigation, progress, accessible controls and no-JavaScript fallback.
- Added optional saving, owner-only viewing/deletion and skip-aware descriptive summaries.
- Included support signposting and explicit non-clinical scope; no invented diagnostic thresholds.
- Added content, summary, persistence and access-isolation tests.

## Version 1.4.1 — Layout and Tests submenu
- Fixed clipped answer options with a grid that wraps based on available card width.
- Added a native expandable Tests submenu containing Personality Test, Stress Analysis Test and Mental Health Analysis Test.
- Renamed the existing strengths questionnaire to Personality Test, retaining its informal/self-report scope and scoring.
- Kept the submenu open on test pages and made long sidebar labels wrap.

## Version 1.4.2 — Square containers
- Removed the dashboard’s “Newest first” badge.
- Removed corner radius from content cards, forms, question containers, report panels and support containers across the website.


## 1.6.0 — Sample Tests
The sidebar groups Personality Test and Basic Psychological Test under Sample Tests. Stress and Mental Health remain under Tests. GET /sample-tests displays the hub. GET/POST /sample-tests/basic-psychological displays and processes the 15 supplied statements. data/basic-psychological.json holds exact wording plus answer-specific reflections and prompts. utils/basic-psychological.js validates all 15 string answers against agree/disagree and builds literal response counts. No aggregate psychological score or inferred mental-state label is generated. Server-rendered graphs show counts out of 15; each item explains the selected answer. New results are not persisted. Existing personality scoring and saving are unchanged. Login and CSRF protections apply to the new routes.


## 1.6.1 — Leadership, Stress & Teamwork sample test
Removed the Explore Sample Tests sidebar option; the hub remains reachable from result pages. Added a third sample test with the 15 supplied statements and their original three sections. GET/POST /sample-tests/leadership-teamwork use existing login and CSRF protection. data/leadership-teamwork.json contains the questions and section guidance; utils/leadership-teamwork.js validates scalar agree/disagree answers and returns per-section counts. Results are unsaved, server-rendered charts with explicit counts and reflection prompts. No overall ability score, diagnosis or mental-state inference is generated.


## 1.7.0 — Matching sample result design and unified dashboard
Sample results now reuse the personality result’s purple hero, donut, category bars, summary blocks and coloured reflection cards. Percentages are literal agreement, not health or ability measures. utils/sample-results.js creates snapshot reports and merges personality, sample, stress and mental-health histories by user and date. Completed tests automatically save; form text explains this before submission. New sample reports use sampleResults in the existing database and owner-checked GET/POST result/delete routes. Existing saved assessment reports appear without migration. Sample question wording, reflections and tips are saved as a versioned snapshot. Results previously completed without saving cannot be recovered.


## 1.7.1 — Consistent question cards
All five tests render questions through views/partials/test-question.ejs: full-width square cards, gradient top edge, numbered badge, large rounded answer buttons, purple selection and cyan outline. Each test retains its existing answer scale. Native required radio inputs and fieldset legends remain accessible. Stress and mental-health section navigation still uses the same fieldsets. Desktop answer rows wrap responsively on smaller screens to prevent clipping.


## 1.8.0 — Required answers and expanded music reflection
Removed the skip/not-applicable answer from current stress and mental-health forms and server validation. All tests require an available answer for every question; historic saved skipped responses still display correctly. Music results add emotional-theme, listening-reason, user-described track-type and reflection-tip cards. Catalog genre remains source metadata; track type is optional user input, not an audio or lyric classifier. No personal emotional state or clinical inference is made. Check-ins save the chosen type and guidance snapshot alongside the user's reported mood.


## 1.9.0 — Optional LLM conversational chatbot
Added server-side OpenAI Responses API integration with six recent exchanges of in-memory context, 30-minute expiry, a New chat action, natural language system instructions, and a labelled no-key fallback. Updated accessible widget adds starter prompts, thinking state, keyboard controls, error recovery and disclosure of external message processing. Login, CSRF, character/token limits, per-account throttling and per-session concurrency protection apply. Saved accounts and results are not automatically sent. See CHATBOT_SETUP.md for activation, privacy boundaries and testing. API integration is mock-tested; no real-key live test was performed.
