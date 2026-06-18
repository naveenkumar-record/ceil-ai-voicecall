# AI Interview Demo

Browser-based AI interview demo with a React + Vite frontend and Node.js + Express backend. The app lets candidates complete a three-question voice interview, transcribes microphone responses through Raya STT, speaks AI interviewer responses through Raya TTS, and generates a final evaluation.

## Features

- Candidate information form
- Voice interview with exactly 3 technical questions
- English, Tamil, and mixed Tamil-English interview flow
- Live transcript with speaker labels
- Interview status indicator
- Audio visualizer
- Automatic AI response playback
- Final evaluation scores and summary
- Placeholder backend services for Raya STT, Raya TTS, and LLM integration

## Project Structure

```text
ai-interview-demo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CandidateForm.jsx
│   │   │   ├── VoiceInterview.jsx
│   │   │   ├── TranscriptPanel.jsx
│   │   │   └── EvaluationPanel.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   │   ├── interview.js
│   │   ├── stt.js
│   │   └── tts.js
│   ├── services/
│   │   ├── rayaService.js
│   │   └── interviewService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `.env`:

```env
PORT=5000
RAYA_API_KEY=your_raya_api_key
RAYA_BASE_URL=https://hub.getraya.app
RAYA_TTS_VOICE_ID=fed6231c-7e35-4fbe-bbca-254f566e5dd5
RAYA_ENGLISH_TTS_VOICE_ID=0f24fb66-e495-4781-9e84-1224aa7dacde
RAYA_TTS_MODEL=standard
CLIENT_ORIGIN=http://localhost:5173
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
RAYA_CALLING_BASE_URL=https://v1.getraya.app/api
RAYA_CALL_AGENT_ID=
RAYA_CALL_COUNTRY_CODE=91
RAYA_CALL_TIMEZONE=Asia/Kolkata
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

## API Placeholders

The backend currently includes production-shaped placeholder methods:

- `startInterview()`
- `generateQuestion()`
- `speechToText()`
- `textToSpeech()`
- `evaluateCandidate()`

The backend is wired to the Litwiz/Raya documented endpoints:

- STT: `POST https://hub.getraya.app/transcribe`
- TTS: `POST https://hub.getraya.app/v1/text-to-speech`
- Auth: `X-API-Key`

Questions are generated through `backend/services/llmService.js` when `LLM_BASE_URL` and `LLM_API_KEY` are configured. The endpoint should be OpenAI-compatible, ending at the API root, for example `https://api.openai.com/v1`. If no LLM is configured, the app uses a generic role-aware fallback question template.

Raya calling endpoints:

- List agents: `GET /api/calls/agents`
- Initiate call: `POST /api/calls/initiate`

Example call payload:

```json
{
  "phoneNumber": "6374811669",
  "agentId": "your_raya_agent_id",
  "countryCode": "91",
  "timezone": "Asia/Kolkata"
}
```

## Notes

- Browser microphone access requires HTTPS or localhost.
- If Raya TTS is not configured, the backend returns text only and the UI continues gracefully.
- The demo keeps interview state on the client for simplicity. For production, persist session state server-side.
