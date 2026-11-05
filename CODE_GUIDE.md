# Mind Mirror — How the Code Works

## Purpose
Mind Mirror is a self-reflection prototype. Users create an account, answer 15 questions about personal strengths, and revisit saved response summaries. The questionnaire is not a validated psychological instrument. Scores are agreement scores, not mental-health ratings, diagnostic results, or measured ability. There is no machine-learning model or external AI service.

## Start locally
Install Node.js (tested with Node 24), open a terminal in this folder, then run:

```bash
npm ci
npm start
```

Open http://localhost:3000. Stop with Ctrl+C. Run `npm test` for the automated checks. Internet is needed to install packages and to search songs online. The application does not send questionnaire answers or reported mood to an external AI service.

Optional environment variables:
- `PORT`: defaults to 3000.
- `HOST`: defaults to 127.0.0.1, so other computers cannot reach it by default.
- `SESSION_SECRET`: set to a long random private value. If omitted, a fresh random secret is generated on every start.
- `DATA_FILE`: optional absolute path to an alternative JSON database.

The default is local/pilot operation. `NODE_ENV=production` deliberately stops startup: shared database/session storage and deployment controls must be configured before public launch. This is not a production-ready counselling service.

## File map
| File | Responsibility |
|---|---|
| `server.js` | Starts Express, security middleware, sessions, routes, registration/login, page rendering and result access checks |
| `questions.js` | Question wording, five categories and answer values |
| `utils/scoring.js` | Answer validation, category totals, tie handling and response summaries |
| `utils/chatbot.js` | Keyword-based website assistance and fixed replies |
| `utils/database.js` | Loads JSON, validates its basic structure and saves using temporary-file replacement |
| `data/db.json` | User records and saved results; starts empty |
| `views/*.ejs` | HTML templates for each page, populated on the server |
| `views/partials/` | Shared sidebar and chatbot markup |
| `public/css/style.css` | Layout, colors, charts, responsive rules and themes |
| `public/js/questionnaire.js` | Counts answered questions and updates progress |
| `public/js/sidebar.js` | Opens/closes the menu; Escape support and hidden-menu focus handling |
| `public/js/darkmode.js` | Remembers the theme in browser local storage |
| `public/js/chatbot.js` | Sends chat requests and displays replies safely as text |
| `tests/flow.test.js` | Scoring and HTTP integration checks using an isolated temporary database |
| `package-lock.json` | Records the installed dependency versions for repeatable installation |

## A user's journey
1. The browser requests `/`. Express renders `index.ejs`.
2. Registration sends name, username, email, password and a security token to `/register`.
3. The server validates fields, checks duplicates, hashes the password with bcrypt and saves the user. It re-reads the database after hashing to avoid overwriting another registration that completed during the asynchronous operation.
4. A new session is created. The browser receives a session cookie; the server keeps the user identity in memory.
5. `/questionnaire` checks login and renders the questions from `questions.js`.
6. Browser JavaScript shows how many questions are answered. This is a convenience; the server independently validates all 15 answers.
7. On submission, scoring adds the answers, saves the result with the current user's ID and redirects to `/result/:id`.
8. The result route matches both the result ID and user ID. Another account cannot retrieve that result through this route.
9. `/dashboard` shows only the current user's results, newest first.
10. Logout is a token-protected POST request and destroys the session.

## Scoring explained
Each response is an integer from 1 (strongly disagree) to 5 (strongly agree). Each category has three questions: its score is 3–15. Total score is 15–75. The displayed percentage is `round(total / 75 * 100)`, so the valid minimum is 20%, not zero. It is neither a percentile nor a probability.

Example: all Neutral responses give 45/75 = 60%. Every category receives 9/15, so the report lists all five as shared highest areas rather than arbitrarily selecting thinking.

The original thresholds are retained but labelled as agreement: at least 80% is Very high agreement; at least 65% is High agreement; at least 45% is Moderate agreement; below 45% is Lower agreement. These thresholds are illustrative, not scientifically established cutoffs. A highest category indicates the highest self-rating within this questionnaire, not an independently verified strength. Older saved results retain their original stored descriptions and labels; new submissions use scoring version 2.

## Chatbot explained
The browser sends the message to `/chatbot`. `getChatbotReply()` checks keywords and returns a prepared sentence. It has no conversation memory, model, personal-result lookup, or music analysis. It includes a basic urgent-distress response, but keyword coverage is limited and must not be treated as crisis detection or a clinical service. Chat messages are not saved in the JSON database.

## Data and security
Passwords are hashed; user details and responses are stored in readable JSON on the server. The data file is outside the public assets folder. Treat it and its backups as private.

This refinement adds input validation, CSRF tokens, session regeneration after sign-in, HttpOnly/SameSite cookies, basic account-attempt throttling, generic login errors, response security headers, request-size limits, no-store responses and centralized error handling. Session and rate-limit state remain process-local and reset on restart. Atomic file replacement reduces partially-written JSON, but it is not a transactional, multi-process database or backup solution. Run one application process only.

Before public use, implement a transactional database, persistent session store, HTTPS and deployment cookie/proxy settings, shared abuse controls, account recovery, appropriate consent/privacy/deletion workflows, backup/restore checks and qualified review of assessment content. The current app intentionally does not promise clinical assessment or counselling.

## Where to add later features
- New reflection questions: `questions.js`; update scoring and the per-category maximum currently fixed at 15 in result/dashboard templates when question counts change.
- New report rules: `utils/scoring.js`, plus result templates and tests.
- New pages: add a server route, EJS template and sidebar link.
- Better assistance: replace `utils/chatbot.js` behind the existing route; define privacy and safety boundaries first.
- Music-and-mood journal: add a separate user-owned journal model, routes and page; keep self-reported moods distinct from questionnaire scores.
- Career and wellbeing pathways: separate question sets and report definitions rather than combining both into one overall number.
- Real storage: replace `utils/database.js` and adapt route operations to transactions.

## Verification completed
Automated tests passed for neutral-score ties, invalid answers, CSRF rejection, registration, login, dashboard, questionnaire submission, result rendering, cross-user result isolation, chat, logout, informational pages and password hashing. Tests use a temporary database, not your real users. Browser visual and assistive-technology testing have not been completed in this environment.


## Online Music & Mood (version 1.3)

The fixed 12-song catalog has been removed. The app searches the online Apple iTunes catalog via `https://itunes.apple.com/search`, with URL-encoded song and optional artist, `entity=song`, `media=music`, a region (IN/US/GB) and a 12-result limit. No API key is needed for this implementation. Internet access from the Node server is required. This is an online catalog lookup, not a general Google/webpage crawl, and does not guarantee every song is available.

### User flow
1. Open Music & Mood after login. Enter the song, optionally its artist, and a search region.
2. Click Search online. The server retrieves possible recordings, artists, albums and `primaryGenreName` from the provider.
3. Choose the right version. Results are not automatically treated as exact matches. If no result fits, refine the search or change region.
4. View the source-provided genre and a short genre-based reflection prompt.
5. Optionally select your actual feeling and consent to save. Your feeling is never prefilled from the genre.

### Logic and data
`utils/music.js` exports `searchSongs`, `createMusicSearch` for testing, `genreReflection`, moods and input validation. Genre-to-reflection rules are developer-written prompts about possible reasons for listening; they are not externally supplied descriptions, scientific predictions, clinical findings or audio/lyric analysis. Broad categories such as Bollywood, Soundtrack or World receive an explicitly non-specific explanation. Missing genres stay unavailable; none are invented.

POST `/music/analyse` calls the provider, validates its JSON and stores bounded search results with a random search ID in the current server-side session. POST `/music/select` requires a track ID belonging to that session search, displays the selected genre and reflection, and creates no database entry. Selections expire after 30 minutes. POST `/music/save` again validates the session search and uses trusted server-held metadata, ignoring browser-supplied genre or title fields. A check-in stores source, source URL, retrieval time, region, genre, reflection and separately self-reported mood. Existing older tone-based history remains readable. Deletion remains owner-only and CSRF-protected.

The service has a 10-second request timeout, a maximum of 18 outgoing requests per rolling minute and a bounded 100-query cache with a 10-minute lifetime. Network failure, provider failure, malformed results and empty results have distinct handling: no fabricated fallback songs. Search links are restricted to HTTPS Apple Music/iTunes hosts. Rate limits and caching are per process; the prototype supports one server process only.

### Privacy and source
Only song/artist search terms and region are sent to Apple. Account identity, questionnaire answers and selected moods are not included. Provider requests use the server's network connection. The page explains this before search. Queries/results may remain temporarily in the process cache and session; saved check-ins are stored locally in JSON only on consent. No artwork, lyrics, audio previews or playback are included.

Provider documentation: https://performance-partners.apple.com/search-api
The documentation describes song searches, regions, `primaryGenreName`, caching and approximate request limits. Review current provider terms and deployment requirements before commercial launch.

### Verification and limits
Automated tests cover request encoding, response filtering, deduplication, caching, missing genres, empty results, malformed/provider/network failures, rate limiting, recording selection, forged metadata, save consent, cross-account access and deletion, plus previous account/questionnaire behavior. Provider responses are mocked for deterministic checks. A live request from this execution environment timed out, so live provider connectivity has not been verified here. Verify from your deployment machine by searching a known song. No browser visual QA was performed for this update.


## Version 1.4 — Stress Analysis and Mental Health Analysis
Start at `/assessments`. Mental Health Analysis is the primary wellbeing module; Stress Analysis is separate. Each has exactly 60 original items: six areas containing five direct questions and five situation prompts each. Both ask about current daily experience. Situations refer to lived experiences, not hypothetical predictions. Users can select Never, Rarely, Sometimes, Often, Almost always, or Not applicable / prefer not to answer. Skips count towards form completion, but never as a numeric answer.

These custom questions have NOT been clinically validated. They are not PSS, PHQ, GAD, DASS or other established instruments and must not be advertised as such. There are no diagnostic, low/medium/high severity or percentage-health outputs. No aggregate score combines stress and mental health, and neither is linked to musical taste. The adult acknowledgement is a self-attestation, not age verification.

The report gives a five-bin frequency count per area and lists items answered Often or Almost always. “Frequent” is a literal grouping of those two response labels, not a clinical threshold. All-skipped and partly skipped results are explicitly marked. A low count does not rule out illness, and physical experiences cannot establish stress as their cause. This exercise does not comprehensively screen for mental-health disorders, substance use, abuse or suicide risk. Always-visible support information does not constitute active monitoring or crisis detection.

Question bank: `data/assessments.json`. Validation/summary: `utils/assessments.js`. Routes: `server.js`. Templates: `assessments.ejs`, `assessment-form.ejs`, `assessment-result.ejs`. Shared support and page header are in `views/partials`. Styling and section navigation are in `public/css/assessments.css` and `public/js/assessments.js`.

With JavaScript, questions display in six sections with completion progress and previous/next controls. Without JavaScript, all sections remain available and server-side validation still applies. Missing/invalid answers or acknowledgements return an error with the supplied choices retained. There is no persistent draft; leaving/refreshing may lose answers.

Submitting without the Save checkbox renders the summary without adding it to the database. Opt-in saving appends to `assessmentResults` in the existing JSON database without altering users, old results or music history. The report stores counts, answered/skipped totals, version, time window and item wording/labels for frequent experiences; it does not store every raw answer. This is sensitive information in readable JSON accessible to server administrators. Results are protected by session login, user ownership checks and CSRF protection. Owner-only deletion removes the report from the active JSON file; it does not erase independent backups. The source project’s local/pilot and production-startup restrictions remain.

References checked September 30, 2026: WHO Stress https://www.who.int/news-room/questions-and-answers/item/stress ; NIMH help-seeking information https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help ; official Tele-MANAS listing https://telemanas.mohfw.gov.in/home (14416). These sources support general context and support signposting, not validation or endorsement of our questions. The official Tele-MANAS page was discoverable in search but returned a fetch error here.

Automated checks cover all 120 items, question/situation counts, uniqueness, response validation, skip calculations, absent totals/clinical labels, both assessment flows, opt-in persistence, all-skipped reports, cross-account read/delete rejection and legacy account/questionnaire/music flows. Browser visual QA remains pending. The existing online music provider’s live connectivity also remains unverified in this environment.

Before a public mental-health service launch, obtain qualified clinical review and choose validated, properly licensed tools for any actual screening claims. Keep original instrument wording/scoring intact if adding such tools; do not inflate a validated short questionnaire to 60 items and keep its name. This prototype and these custom questions do not replace professional assessment.

## Version 1.4.1 navigation/layout
The sidebar now uses native HTML details/summary for an accessible Tests submenu. It contains Personality Test (`/questionnaire`), Stress Analysis Test (`/assessments/stress`) and Mental Health Analysis Test (`/assessments/mental-health`). It opens by default on test/report pages. The Personality Test is the same existing 15-item strengths reflection with unchanged scoring; renaming does not establish clinical or psychometric validity. Answer options use an auto-fit grid with shrink-safe minimums so options wrap instead of clipping.


### Visual results and practical guidance (1.5.0)
`utils/assessment-guidance.js` decorates reports at display time; it does not modify saved responses. It matches section titles to test-specific explanations and everyday self-care examples. Descriptions use the exact count of Often/Almost always answers and identify partial or empty sections. These rules are editorial, not validated clinical interpretations.

`assessment-result.ejs` displays an overview and per-section bar graphs on a fixed 0–10 item scale. Text labels expose the same counts without relying on colour. There is no diagnostic score or severity ranking. Both new and existing reports use this layout, including original stored timeframes. Tips are general examples, not treatment plans or promises of relief.

General self-care guidance consulted September 30, 2026:
- WHO, Stress: https://www.who.int/news-room/questions-and-answers/item/stress
- NIMH, Caring for Your Mental Health: https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health
These sources support general self-care principles; they do not validate or endorse the questionnaires, chart rules, or custom situation examples.


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
