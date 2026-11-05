# Mind Mirror AI chatbot — setup

## Turn on AI replies

1. Keep a backup of your existing `data/db.json`. When installing this updated project, copy your existing database into its `data` folder so your accounts and results remain available.
2. Use Node.js 22 or newer. Open a terminal in the folder containing `server.js` and run `npm ci`.
3. Copy `.env.example` to `.env`. On Windows PowerShell: `Copy-Item .env.example .env`. On macOS/Linux: `cp .env.example .env`.
4. Open `.env` in a local editor and fill in your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Create/manage the key in your OpenAI API account: https://platform.openai.com/api-keys
The API account must have access to the selected model and available API billing/quota. The chatbot uses your server's API credentials. Do not paste the key into the website, client JavaScript, screenshots or chat messages. `.env` is excluded from Git and the supplied ZIP contains only the blank example.

5. Run `npm start`. Restart the server after changing `.env`.
6. Sign in, open the chat bubble and check its label. **AI conversation** means the key is configured, not that a live API request has already succeeded. Send “I am preparing for exams”, then “Help me choose my first step” to check multi-turn replies.

If the label says **Basic guide · AI key not configured**, the chatbot uses the local keyword helper until a key is supplied. This is not an LLM response. No external request is made in basic mode.

## What changed

- OpenAI Responses API generates conversational replies with warm, concise language and relevant follow-up questions.
- The prompt asks it to follow the user's language, including English, Hindi or Hinglish. Output quality depends on the model; it is not clinically evaluated.
- The most recent six user/assistant exchanges are held in server memory. They survive page navigation in the same login session but expire after 30 minutes of inactivity or server restart. Older turns drop out of context. New chat clears that conversation; it does not remove information already processed by the provider.
- Enter sends; Shift+Enter adds a new line. Starter prompts, a thinking indicator, retry-friendly errors and New chat make the widget easier to use.
- Chat is available on assessment and sample-test pages too.
- The assistant has no tools, browsing or automatic access to saved test results. Users can type the relevant result details if they choose.

## Privacy and limits

The API key stays on the server. AI mode sends the user's typed message and recent chat text to OpenAI. Account details, database contents, saved questionnaires and music history are not automatically attached. The chat is not written to `data/db.json` and provider error bodies and chat content are not logged by this integration.

Requests set `store:false` to avoid storing Responses for later retrieval through the API. This is not a promise of zero provider retention; applicable provider data policies still apply. See https://developers.openai.com/api/docs/guides/your-data

Users must sign in. Existing CSRF protection applies. The server limits each account to 10 messages per minute, one active reply per session, 2,000 characters per message and 650 output tokens. It aborts a provider request after 30 seconds. Failed turns do not enter model context. These limits and the in-memory session store are intended for the existing local prototype, not a production deployment.

The assistant identifies itself as AI and is prompted not to diagnose, prescribe or infer health from music or test results. Prompt instructions do not guarantee safe behaviour. A clinical or public release needs qualified review, safety evaluation and the existing project's production/privacy work.

## Troubleshooting

- **Please sign in:** log in, then open the chatbot again.
- **Session expired:** reload the page and retry.
- **AI service unavailable:** check API billing, key permissions, model access and internet access to `api.openai.com`.
- **Timeout:** try a shorter message later.
- **Wait a minute:** the per-account request limit has been reached. New chat does not bypass it.
- Model can be changed with `OPENAI_MODEL`; it must support text input/output through the Responses API.

## Code map and validation

`utils/llm-chat.js`: instructions, Responses API call, recent conversation state, limits, timeouts and error handling.
`utils/chatbot.js`: clearly labelled basic-mode fallback when no key is configured.
`server.js`: loads `.env`, checks login, exposes POST `/chatbot`, GET `/chatbot/history` and POST `/chatbot/reset`.
`views/partials/chatbot.ejs`: accessible widget and data-sharing notice.
`public/js/chatbot.js`: history loading, sending, keyboard controls and UI states; responses are rendered with `textContent`, never raw HTML.
`tests/llm-chat.test.js`: mocked API contract, context, isolation, bounded history, expiry, reset, concurrency and outage tests. Route tests cover login and CSRF.

Run `npm test`. Fourteen automated tests pass. The API path has been tested with a mock provider; live LLM output has not been tested with a real key in this delivery.

Official implementation references:
https://developers.openai.com/api/docs/guides/text
https://developers.openai.com/api/docs/guides/conversation-state
https://developers.openai.com/api/docs/models/gpt-4.1-mini
