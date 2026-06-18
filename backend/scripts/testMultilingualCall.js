import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAYA_BASE = process.env.RAYA_CALLING_BASE_URL || "https://v1.getraya.app/api";
const API_KEY = process.env.RAYA_API_KEY;
const AGENT_ID =
  process.env.RAYA_AGENT_ID_TAMIL
  || process.env.RAYA_CALL_AGENT_ID_TAMIL
  || process.env.RAYA_CALL_AGENT_ID;
const OUT_DID = process.env.RAYA_OUT_DID;
const DEFAULT_TEST_NUMBER = process.env.RAYA_TEST_CALL_NUMBER;
const DEFAULT_CONTACT_NAME = process.env.RAYA_TEST_CONTACT_NAME || "Candidate";

const headers = {
  "X-API-Key": API_KEY,
  "Content-Type": "application/json",
};

function buildMultilingualInstructions(contactName) {
  return `You are Priya, a warm and friendly recruitment coordinator calling on behalf of Record Studio.

LANGUAGE: Listen carefully to how the person greets you. Immediately match and speak in their language for the entire call - Tamil, Kannada, Hindi, Telugu, English, Marathi, Punjabi, Bengali, or Malayalam. Never mix languages mid-sentence.

PERSONALITY: Speak like a real human. Be warm, natural, and conversational. Use natural reactions like:
- English: "Oh great!", "That's wonderful!", "Perfect!", "I see, no worries!", "Sure, absolutely!"
- Tamil: "அருமை!", "சரி சரி!", "நல்லது!", "ஓ, பரவாயில்லை!"
- Kannada: "ಒಳ್ಳೆಯದು!", "ಸರಿ ಸರಿ!", "ಚೆನ್ನಾಗಿದೆ!"
- Hindi: "बहुत अच्छा!", "अरे वाह!", "ठीक है ठीक है!", "कोई बात नहीं!"
- Telugu: "చాలా బాగుంది!", "సరే సరే!", "అలాగే!"
- Marathi: "छान!", "बरं बरं!", "अरे वा!", "ठीक आहे!"
- Punjabi: "ਬਹੁਤ ਵਧੀਆ!", "ਠੀਕ ਹੈ ਠੀਕ ਹੈ!", "ਅਰੇ ਵਾਹ!"
- Bengali: "খুব ভালো!", "ঠিক আছে!", "আরে বাহ!", "কোনো সমস্যা নেই!"
- Malayalam: "നന്നായി!", "ശരി ശരി!", "അതൊക്കെ ഠീക്കാണ്!"

CONVERSATION FLOW:
1. Greet warmly - "Hello! Am I speaking with ${contactName}?"
2. Introduce yourself - "I'm Priya calling from Record Studio."
3. Tell them - "We've sent you a job opportunity message on your WhatsApp. Did you get a chance to see it?"
4. If YES - React naturally ("Oh great! So did you get to reply to it?"), encourage them to reply YES on WhatsApp
5. If NO - "No worries at all! It's a really good opportunity. Can you please check your WhatsApp when you're free and reply YES or NO?"
6. If they ask about the job - give a brief friendly answer, then bring back to WhatsApp
7. Wrap up naturally - "Perfect! Thank you so much for your time. Have a wonderful day!"

Keep responses short and natural. Pause after each question. Listen actively. Sound like a real person, not a robot.`;
}

async function testMultilingualCall(toNumber, contactName = DEFAULT_CONTACT_NAME) {
  ensureConfig();

  console.log("\nPatching agent with multilingual interactive instructions...");

  await axios.patch(
    `${RAYA_BASE}/agent/${AGENT_ID}`,
    {
      instructions: buildMultilingualInstructions(contactName),
      say_hello: true,
      allow_interruption: true,
      max_call_duration_mins: 5,
      required_silence_after_speech: 1.5,
      call_duration_exceed_message: "Thank you for your time. Please check your WhatsApp. Goodbye.",
    },
    { headers },
  );

  const payload = {
    agent_id: AGENT_ID,
    to_number: normalizeIndianMobile(toNumber),
    country_code: process.env.RAYA_CALL_COUNTRY_CODE || "91",
    timezone: process.env.RAYA_CALL_TIMEZONE || "Asia/Kolkata",
    agent_args: {
      contact_name: contactName,
      time_now: new Date().toISOString(),
      day_of_week: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    },
  };

  if (OUT_DID) {
    payload.out_did = OUT_DID;
  }

  console.log(`Agent patched. Initiating call to ${payload.to_number}...`);

  const { data } = await axios.post(`${RAYA_BASE}/call`, payload, { headers });

  console.log("\nCall initiated!");
  console.log(`UUID: ${data.uuid}`);
  console.log(`Track at: https://app.getraya.com/calls/${data.uuid}`);
  return data.uuid;
}

function ensureConfig() {
  const missing = [];
  if (!API_KEY) missing.push("RAYA_API_KEY");
  if (!AGENT_ID) missing.push("RAYA_AGENT_ID_TAMIL or RAYA_CALL_AGENT_ID_TAMIL");

  if (missing.length) {
    throw new Error(`Missing required env var(s): ${missing.join(", ")}`);
  }
}

function normalizeIndianMobile(phoneNumber = "") {
  const digits = String(phoneNumber).replace(/\D/g, "");
  return digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
}

const testNumber = process.argv[2] || DEFAULT_TEST_NUMBER;
const testContactName = process.argv[3] || DEFAULT_CONTACT_NAME;

if (!testNumber) {
  console.error("Failed:", "Pass a phone number as an argument or set RAYA_TEST_CALL_NUMBER.");
  process.exit(1);
}

testMultilingualCall(testNumber, testContactName)
  .then((uuid) => console.log(`\nDone. UUID: ${uuid}`))
  .catch((error) => {
    console.error("Failed:", formatAxiosError(error));
    process.exitCode = 1;
  });

function formatAxiosError(error) {
  if (!error.response) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  return {
    status: error.response.status,
    statusText: error.response.statusText,
    data: error.response.data,
  };
}
