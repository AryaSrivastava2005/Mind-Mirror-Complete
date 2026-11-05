# Mind Mirror — Refined Prototype

A Node.js/Express self-reflection website with accounts, a 15-question questionnaire, saved results, light/dark mode, sidebar and an optional LLM-powered conversational guide.

## Run
```bash
npm ci
npm start
```
Open http://localhost:3000. Node 24 was used for verification.

## Test
```bash
npm test
```

Read **CODE_GUIDE.md** for the complete explanation, setup options, scoring and extension points. Read **CHANGES.md** for this revision.

This is a local/pilot prototype with JSON storage and in-memory sessions. It is not a validated assessment, clinical service, or production-ready deployment. Production mode is intentionally blocked pending the changes documented in the guide.

## Online Music & Mood
After login, select **Music & Mood**. Enter a song and optional artist, search the online Apple iTunes catalog, choose a recording, then view its listed genre and a brief reflection prompt. You can separately record how you actually feel, save the check-in and delete it later.

- No fixed song list or API key; internet access required.
- India, US and UK search regions; coverage varies.
- Missing genres and unavailable search are shown honestly.
- Genre prompts do not determine personal mood or mental health.
- Automated tests passed with mocked provider responses. The live provider request timed out in this environment, so test online connectivity on your machine.

For startup, use Node 24, then `npm ci` and `npm start`. Open http://localhost:3000/music after login.

## Mental Health & Stress assessments
After login, choose **Mental Health & Stress**. Each assessment contains 60 items (30 questions + 30 situations) in six sections. Answer every item about your current daily experience. Results show your response patterns, not diagnostic scores. Completed reports save automatically and appear on the dashboard; they can be viewed and deleted in Assessments. These original adult reflection tools are not clinically validated. Read CODE_GUIDE.md for content, privacy, limitations and implementation details.


## AI chatbot
Read **CHATBOT_SETUP.md**. Copy `.env.example` to `.env`, set `OPENAI_API_KEY`, then restart the server. The default model is `gpt-4.1-mini`; `OPENAI_MODEL` can override it. Without a key, the widget explicitly runs in basic-guide mode. Do not overwrite your existing `data/db.json` when updating.
