export const verificationFlows = {
  driver: {
    label: "Driver",
    questions: [
      {
        stage: "Identity Verification",
        question: "Please confirm your full name and current location.",
        questionTa: "உங்கள் முழு பெயர் மற்றும் தற்போதைய இடத்தை உறுதிப்படுத்தவும்.",
        parameter: "Identity Verification",
        expected: ["Strong: Full name + location", "Weak: Unable to provide details"],
      },
      {
        stage: "Driving Experience",
        question: "How many years have you worked as a driver?",
        questionTa: "நீங்கள் எத்தனை ஆண்டுகள் ஓட்டுநராக வேலை செய்துள்ளீர்கள்?",
        parameter: "Experience Validation",
        expected: ["3+ years", "1-3 years", "Fresher"],
      },
      {
        stage: "Vehicle Type Verification",
        question: "Which vehicles have you driven regularly?",
        questionTa: "நீங்கள் வழக்கமாக எந்த வாகனங்களை ஓட்டியுள்ளீர்கள்?",
        parameter: "Vehicle Handling Skill",
        expected: ["Two-wheeler", "Car", "Van", "Truck", "Heavy Vehicle"],
      },
      {
        stage: "License Validation",
        question: "Do you currently hold a valid driving license?",
        questionTa: "உங்களிடம் தற்போது செல்லுபடியாகும் ஓட்டுநர் உரிமம் உள்ளதா?",
        parameter: "Compliance",
        expected: ["Yes (LMV)", "Yes (HMV)", "Expired", "No"],
      },
      {
        stage: "Route Knowledge",
        question: "Are you comfortable using Google Maps and navigating new routes?",
        questionTa: "Google Maps பயன்படுத்தி புதிய வழிகளில் செல்ல உங்களுக்கு வசதியாக உள்ளதா?",
        parameter: "Navigation Skill",
        expected: ["Daily use", "Basic use", "Never used"],
      },
      {
        stage: "Safety Assessment",
        question: "What would you do if your vehicle breaks down during a delivery?",
        questionTa: "டெலிவரி நேரத்தில் உங்கள் வாகனம் பழுதானால் நீங்கள் என்ன செய்வீர்கள்?",
        parameter: "Safety Awareness",
        expected: ["AI evaluates response."],
      },
      {
        stage: "Availability",
        question: "Are you comfortable with rotational shifts and long-distance travel?",
        questionTa: "மாறும் ஷிப்ட்கள் மற்றும் நீண்ட தூர பயணத்திற்கு நீங்கள் தயாராக உள்ளீர்களா?",
        parameter: "Availability",
        expected: ["Yes", "Local only", "Day shift only"],
      },
      {
        stage: "Location Match",
        question: "Can you travel daily to the work location?",
        questionTa: "வேலை இடத்துக்கு தினமும் பயணம் செய்ய முடியுமா?",
        parameter: "Location Match",
        expected: [],
      },
    ],
  },
  plumber: {
    label: "Plumber",
    questions: [
      {
        stage: "Identity Verification",
        question: "Please confirm your name and current area.",
        questionTa: "உங்கள் பெயர் மற்றும் தற்போதைய பகுதியை உறுதிப்படுத்தவும்.",
        parameter: "Identity Verification",
        expected: [],
      },
      {
        stage: "Experience Verification",
        question: "How many years have you worked as a plumber?",
        questionTa: "நீங்கள் எத்தனை ஆண்டுகள் பிளம்பராக வேலை செய்துள்ளீர்கள்?",
        parameter: "Experience",
        expected: [],
      },
      {
        stage: "Plumbing Skill Validation",
        question: "Which plumbing work have you performed regularly?",
        questionTa: "நீங்கள் வழக்கமாக எந்த பிளம்பிங் பணிகளை செய்துள்ளீர்கள்?",
        parameter: "Core Skill",
        expected: ["Pipe fitting", "Leakage repair", "Bathroom installation", "Commercial plumbing"],
      },
      {
        stage: "Tool Familiarity",
        question: "Which plumbing tools do you use regularly?",
        questionTa: "நீங்கள் வழக்கமாக எந்த பிளம்பிங் கருவிகளை பயன்படுத்துகிறீர்கள்?",
        parameter: "Tool Knowledge",
        expected: ["Pipe wrench", "Threading machine", "Pipe cutter", "Pressure testing equipment"],
      },
      {
        stage: "Scenario Question",
        question: "A customer reports a hidden water leak inside a wall. How would you identify the issue?",
        questionTa: "ஒரு வாடிக்கையாளர் சுவருக்குள் மறைந்த நீர் கசிவு இருப்பதாக சொன்னால், பிரச்சனையை எப்படி கண்டுபிடிப்பீர்கள்?",
        parameter: "Problem Solving",
        expected: ["AI evaluates response."],
      },
      {
        stage: "Safety Compliance",
        question: "What precautions do you take before starting plumbing work?",
        questionTa: "பிளம்பிங் வேலை தொடங்குவதற்கு முன் நீங்கள் என்ன பாதுகாப்பு முன்னெச்சரிக்கைகள் எடுப்பீர்கள்?",
        parameter: "Safety Awareness",
        expected: [],
      },
      {
        stage: "Job Readiness",
        question: "Are you comfortable working at customer sites and construction locations?",
        questionTa: "வாடிக்கையாளர் இடங்கள் மற்றும் கட்டுமான இடங்களில் வேலை செய்ய உங்களுக்கு வசதியாக உள்ளதா?",
        parameter: "Work Readiness",
        expected: [],
      },
      {
        stage: "Location Availability",
        question: "Can you travel to nearby project locations daily?",
        questionTa: "அருகிலுள்ள project இடங்களுக்கு தினமும் பயணம் செய்ய முடியுமா?",
        parameter: "Location Match",
        expected: [],
      },
    ],
  },
  electrician: {
    label: "Electrician",
    questions: [
      {
        stage: "Identity Verification",
        question: "Please confirm your name and current location.",
        questionTa: "உங்கள் பெயர் மற்றும் தற்போதைய இடத்தை உறுதிப்படுத்தவும்.",
        parameter: "Identity Verification",
        expected: [],
      },
      {
        stage: "Experience Verification",
        question: "How many years of electrical work experience do you have?",
        questionTa: "உங்களுக்கு எத்தனை ஆண்டுகள் மின்சார வேலை அனுபவம் உள்ளது?",
        parameter: "Experience",
        expected: [],
      },
      {
        stage: "Electrical Skill Validation",
        question: "What type of electrical work have you performed?",
        questionTa: "நீங்கள் எந்த வகையான மின்சார பணிகளை செய்துள்ளீர்கள்?",
        parameter: "Skill Verification",
        expected: ["Domestic wiring", "Commercial wiring", "Industrial maintenance", "Panel installation"],
      },
      {
        stage: "Tool Knowledge",
        question: "Which electrical tools do you use regularly?",
        questionTa: "நீங்கள் வழக்கமாக எந்த மின்சார கருவிகளை பயன்படுத்துகிறீர்கள்?",
        parameter: "Tool Literacy",
        expected: ["Multimeter", "Tester", "Clamp meter", "Crimping tools"],
      },
      {
        stage: "Safety Scenario",
        question: "Before repairing a live electrical circuit, what safety checks would you perform?",
        questionTa: "மின்சாரம் ஓடிக்கொண்டிருக்கும் circuit-ஐ சரி செய்வதற்கு முன் என்ன பாதுகாப்பு சோதனைகள் செய்வீர்கள்?",
        parameter: "Safety Awareness",
        expected: ["AI evaluates response."],
      },
      {
        stage: "Fault Diagnosis",
        question: "A circuit breaker trips repeatedly. What could be the reasons?",
        questionTa: "ஒரு circuit breaker அடிக்கடி trip ஆனால் அதற்கான காரணங்கள் என்ன இருக்கலாம்?",
        parameter: "Technical Knowledge",
        expected: ["AI evaluates response."],
      },
      {
        stage: "Certification Validation",
        question: "Do you hold any electrical certification or license?",
        questionTa: "உங்களிடம் ஏதேனும் மின்சார சான்றிதழ் அல்லது உரிமம் உள்ளதா?",
        parameter: "Compliance",
        expected: [],
      },
      {
        stage: "Shift & Travel Availability",
        question: "Are you comfortable attending emergency breakdown calls and working shifts?",
        questionTa: "அவசர breakdown calls attend செய்வதற்கும் shifts-ல் வேலை செய்வதற்கும் உங்களுக்கு வசதியாக உள்ளதா?",
        parameter: "Availability",
        expected: [],
      },
    ],
  },
};

const hindiQuestionText = {
  Driver: [
    "Kripya apna poora naam aur current location confirm kijiye.",
    "Aapne driver ke roop mein kitne saal kaam kiya hai?",
    "Aapne regular kaun se vehicles chalaye hain? Two-wheeler, car, van, truck, ya heavy vehicle?",
    "Kya aapke paas abhi valid driving license hai? LMV, HMV, expired, ya nahi?",
    "Kya aap Google Maps use karke naye routes navigate karne mein comfortable hain?",
    "Delivery ke dauran vehicle breakdown ho jaye to aap kya karenge?",
    "Kya aap rotational shifts aur long-distance travel ke liye comfortable hain?",
    "Kya aap daily work location tak travel kar sakte hain?",
  ],
  Plumber: [
    "Kripya apna naam aur current area confirm kijiye.",
    "Aapne plumber ke roop mein kitne saal kaam kiya hai?",
    "Aapne regular kaun sa plumbing work kiya hai? Pipe fitting, leakage repair, bathroom installation, ya commercial plumbing?",
    "Aap regular kaun se plumbing tools use karte hain? Pipe wrench, threading machine, pipe cutter, ya pressure testing equipment?",
    "Agar customer batata hai ki wall ke andar hidden water leak hai, to aap issue kaise identify karenge?",
    "Plumbing work start karne se pehle aap kaun se safety precautions lete hain?",
    "Kya aap customer sites aur construction locations par kaam karne mein comfortable hain?",
    "Kya aap nearby project locations tak daily travel kar sakte hain?",
  ],
  Electrician: [
    "Kripya apna naam aur current location confirm kijiye.",
    "Aapke paas electrical work ka kitne saal ka experience hai?",
    "Aapne kis type ka electrical work kiya hai? Domestic wiring, commercial wiring, industrial maintenance, ya panel installation?",
    "Aap regular kaun se electrical tools use karte hain? Multimeter, tester, clamp meter, ya crimping tools?",
    "Live electrical circuit repair karne se pehle aap kaun se safety checks karenge?",
    "Agar circuit breaker baar-baar trip hota hai, to uske kya reasons ho sakte hain?",
    "Kya aapke paas koi electrical certification ya license hai?",
    "Kya aap emergency breakdown calls attend karne aur shifts mein kaam karne ke liye comfortable hain?",
  ],
};

const colloquialTamilQuestionText = {
  Driver: [
    "உங்க முழு பெயரும், இப்போ நீங்க இருக்குற இடமும் சொல்லுங்க.",
    "நீங்க எத்தனை வருஷமா driver-ah வேலை பண்ணிருக்கீங்க?",
    "நீங்க regular-ah எந்த vehicles ஓட்டிருக்கீங்க? Two-wheeler, car, van, truck, இல்ல heavy vehicle?",
    "உங்ககிட்ட இப்போ valid driving license இருக்கா? LMV, HMV, expired, இல்ல license இல்லையா?",
    "Google Maps use பண்ணி புதிய routes போக உங்களுக்கு comfortable-ah இருக்கா?",
    "Delivery போகும்போது vehicle breakdown ஆயிடுச்சுன்னா நீங்க என்ன பண்ணுவீங்க?",
    "Rotational shifts-க்கும் long-distance travel-க்கும் நீங்க okay-ah?",
    "Work location-ku daily travel பண்ண முடியுமா?",
  ],
  Plumber: [
    "உங்க பெயரும், இப்போ நீங்க இருக்குற area-வும் சொல்லுங்க.",
    "நீங்க எத்தனை வருஷமா plumber-ah வேலை பண்ணிருக்கீங்க?",
    "நீங்க regular-ah எந்த plumbing work பண்ணிருக்கீங்க? Pipe fitting, leakage repair, bathroom installation, இல்ல commercial plumbing?",
    "நீங்க regular-ah எந்த plumbing tools use பண்ணுவீங்க? Pipe wrench, threading machine, pipe cutter, இல்ல pressure testing equipment?",
    "Customer wall-kulla hidden water leak இருக்குன்னு சொன்னா, issue-a எப்படி கண்டுபிடிப்பீங்க?",
    "Plumbing work start பண்ணறதுக்கு முன்னாடி என்ன safety precautions எடுப்பீங்க?",
    "Customer sites-லும் construction locations-லும் வேலை பண்ண உங்களுக்கு comfortable-ah இருக்கா?",
    "Nearby project locations-ku daily travel பண்ண முடியுமா?",
  ],
  Electrician: [
    "உங்க பெயரும், இப்போ நீங்க இருக்குற location-மும் சொல்லுங்க.",
    "Electrical work-la உங்களுக்கு எத்தனை வருஷம் experience இருக்கு?",
    "நீங்க எந்த type electrical work பண்ணிருக்கீங்க? Domestic wiring, commercial wiring, industrial maintenance, இல்ல panel installation?",
    "நீங்க regular-ah எந்த electrical tools use பண்ணுவீங்க? Multimeter, tester, clamp meter, இல்ல crimping tools?",
    "Live electrical circuit repair பண்ணறதுக்கு முன்னாடி என்ன safety checks பண்ணுவீங்க?",
    "Circuit breaker அடிக்கடி trip ஆகுதுன்னா, அதுக்கு என்ன reasons இருக்கலாம்?",
    "உங்ககிட்ட ஏதாவது electrical certification இல்ல license இருக்கா?",
    "Emergency breakdown calls attend பண்ணவும் shifts-la வேலை பண்ணவும் உங்களுக்கு comfortable-ah இருக்கா?",
  ],
};

const kannadaQuestionText = {
  Driver: [
    "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ.",
    "ನೀವು ಚಾಲಕರಾಗಿ ಎಷ್ಟು ವರ್ಷ ಕೆಲಸ ಮಾಡಿದ್ದೀರಿ?",
    "ನೀವು ನಿಯಮಿತವಾಗಿ ಯಾವ ವಾಹನಗಳನ್ನು ಓಡಿಸಿದ್ದೀರಿ? Two-wheeler, car, van, truck, ಅಥವಾ heavy vehicle?",
    "ನಿಮ್ಮ ಬಳಿ ಈಗ ಮಾನ್ಯವಾದ driving license ಇದೆಯೇ? LMV, HMV, expired, ಅಥವಾ ಇಲ್ಲವೇ?",
    "Google Maps ಬಳಸಿ ಹೊಸ ಮಾರ್ಗಗಳಲ್ಲಿ ಹೋಗಲು ನಿಮಗೆ ಅನುಕೂಲವಾಗುತ್ತದೆಯೇ?",
    "Delivery ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ವಾಹನ breakdown ಆದರೆ ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?",
    "Rotational shifts ಮತ್ತು long-distance travel ಗೆ ನೀವು comfortable ಆಗಿದ್ದೀರಾ?",
    "ನೀವು ಪ್ರತಿದಿನ work location ಗೆ ಪ್ರಯಾಣ ಮಾಡಬಹುದೇ?",
  ],
  Plumber: [
    "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಪ್ರಸ್ತುತ area ಅನ್ನು ದೃಢೀಕರಿಸಿ.",
    "ನೀವು plumber ಆಗಿ ಎಷ್ಟು ವರ್ಷ ಕೆಲಸ ಮಾಡಿದ್ದೀರಿ?",
    "ನೀವು ನಿಯಮಿತವಾಗಿ ಯಾವ plumbing work ಮಾಡಿದ್ದೀರಿ? Pipe fitting, leakage repair, bathroom installation, ಅಥವಾ commercial plumbing?",
    "ನೀವು ನಿಯಮಿತವಾಗಿ ಯಾವ plumbing tools ಬಳಸುತ್ತೀರಿ? Pipe wrench, threading machine, pipe cutter, ಅಥವಾ pressure testing equipment?",
    "Customer wall ಒಳಗೆ hidden water leak ಇದೆ ಎಂದು ಹೇಳಿದರೆ, issue ಅನ್ನು ನೀವು ಹೇಗೆ identify ಮಾಡುತ್ತೀರಿ?",
    "Plumbing work ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ನೀವು ಯಾವ safety precautions ತೆಗೆದುಕೊಳ್ಳುತ್ತೀರಿ?",
    "Customer sites ಮತ್ತು construction locations ನಲ್ಲಿ ಕೆಲಸ ಮಾಡಲು ನಿಮಗೆ comfortable ಆಗಿದೆಯೇ?",
    "Nearby project locations ಗೆ ಪ್ರತಿದಿನ travel ಮಾಡಬಹುದೇ?",
  ],
  Electrician: [
    "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಪ್ರಸ್ತುತ location ಅನ್ನು ದೃಢೀಕರಿಸಿ.",
    "ನಿಮಗೆ electrical work ನಲ್ಲಿ ಎಷ್ಟು ವರ್ಷ experience ಇದೆ?",
    "ನೀವು ಯಾವ type electrical work ಮಾಡಿದ್ದೀರಿ? Domestic wiring, commercial wiring, industrial maintenance, ಅಥವಾ panel installation?",
    "ನೀವು ನಿಯಮಿತವಾಗಿ ಯಾವ electrical tools ಬಳಸುತ್ತೀರಿ? Multimeter, tester, clamp meter, ಅಥವಾ crimping tools?",
    "Live electrical circuit repair ಮಾಡುವ ಮೊದಲು ನೀವು ಯಾವ safety checks ಮಾಡುತ್ತೀರಿ?",
    "Circuit breaker ಮರುಮರು trip ಆದರೆ ಅದರ ಕಾರಣಗಳು ಏನಿರಬಹುದು?",
    "ನಿಮ್ಮ ಬಳಿ ಯಾವುದಾದರೂ electrical certification ಅಥವಾ license ಇದೆಯೇ?",
    "Emergency breakdown calls attend ಮಾಡಲು ಮತ್ತು shifts ನಲ್ಲಿ ಕೆಲಸ ಮಾಡಲು ನಿಮಗೆ comfortable ಆಗಿದೆಯೇ?",
  ],
};

const teluguQuestionText = {
  Driver: [
    "దయచేసి మీ పూర్తి పేరు మరియు ప్రస్తుత స్థానాన్ని నిర్ధారించండి.",
    "మీరు డ్రైవర్‌గా ఎన్ని సంవత్సరాలు పని చేశారు?",
    "మీరు రెగ్యులర్‌గా ఏ వాహనాలు నడిపారు? Two-wheeler, car, van, truck, లేదా heavy vehicle?",
    "మీ దగ్గర ప్రస్తుతం valid driving license ఉందా? LMV, HMV, expired, లేదా లేదు?",
    "Google Maps ఉపయోగించి కొత్త routes navigate చేయడం మీకు comfortable గా ఉందా?",
    "Delivery సమయంలో మీ vehicle breakdown అయితే మీరు ఏమి చేస్తారు?",
    "Rotational shifts మరియు long-distance travel కు మీరు comfortable గా ఉన్నారా?",
    "మీరు daily work location కు travel చేయగలరా?",
  ],
  Plumber: [
    "దయచేసి మీ పేరు మరియు ప్రస్తుత area ను నిర్ధారించండి.",
    "మీరు plumber గా ఎన్ని సంవత్సరాలు పని చేశారు?",
    "మీరు రెగ్యులర్‌గా ఏ plumbing work చేశారు? Pipe fitting, leakage repair, bathroom installation, లేదా commercial plumbing?",
    "మీరు రెగ్యులర్‌గా ఏ plumbing tools ఉపయోగిస్తారు? Pipe wrench, threading machine, pipe cutter, లేదా pressure testing equipment?",
    "Customer wall లో hidden water leak ఉందని చెబితే, issue ను మీరు ఎలా identify చేస్తారు?",
    "Plumbing work ప్రారంభించే ముందు మీరు ఏ safety precautions తీసుకుంటారు?",
    "Customer sites మరియు construction locations లో పని చేయడానికి మీరు comfortable గా ఉన్నారా?",
    "Nearby project locations కు daily travel చేయగలరా?",
  ],
  Electrician: [
    "దయచేసి మీ పేరు మరియు ప్రస్తుత location ను నిర్ధారించండి.",
    "మీకు electrical work లో ఎన్ని సంవత్సరాల experience ఉంది?",
    "మీరు ఏ type electrical work చేశారు? Domestic wiring, commercial wiring, industrial maintenance, లేదా panel installation?",
    "మీరు రెగ్యులర్‌గా ఏ electrical tools ఉపయోగిస్తారు? Multimeter, tester, clamp meter, లేదా crimping tools?",
    "Live electrical circuit repair చేసే ముందు మీరు ఏ safety checks చేస్తారు?",
    "Circuit breaker తరచుగా trip అయితే దానికి కారణాలు ఏమై ఉండవచ్చు?",
    "మీ దగ్గర ఏదైనా electrical certification లేదా license ఉందా?",
    "Emergency breakdown calls attend చేయడానికి మరియు shifts లో పని చేయడానికి మీరు comfortable గా ఉన్నారా?",
  ],
};

export function buildConsentIntro() {
  return "This call is from Record. Can we continue?";
}

export function getVerificationFlow(role = "") {
  return verificationFlows[normalizeRole(role)] || null;
}

export function getVerificationFlowLabel(role = "") {
  return getVerificationFlow(role)?.label || "";
}

export function getStaticQuestionCount(role = "") {
  return getVerificationFlow(role)?.questions.length || 0;
}

export function getStaticQuestionText(role = "", questionIndex = 0, language = "English") {
  const flow = getVerificationFlow(role);
  const item = flow?.questions[questionIndex];
  if (!flow || !item) return "";

  return getQuestionText(flow, item, questionIndex, normalizeLanguage(language));
}

export function buildQuestionScript(role = "", callLanguage = "English") {
  const flow = getVerificationFlow(role);
  if (!flow) return "";

  const languageCode = normalizeLanguage(callLanguage);
  const selectedQuestions = buildNumberedQuestions(flow, languageCode);

  return [
    `Role: ${flow.label}`,
    `Call language: ${getLanguageLabel(languageCode)}`,
    "Ask only the following static questions, one at a time, in this exact order and in the selected call language.",
    "Do not create extra questions, dynamic questions, LLM-generated questions, or follow-up questions.",
    "After each candidate answer, move to the next listed question.",
    "First say the consent line. If the candidate says yes or agrees, continue to question 1. If the candidate says no, is busy, or does not want to continue, politely end the call immediately.",
    `${getLanguageLabel(languageCode)} script:`,
    selectedQuestions,
  ].join("\n");
}

export function buildStaticAgentInstructions(role = "", callLanguage = "English") {
  const flow = getVerificationFlow(role);
  if (!flow) return "";

  const languageCode = normalizeLanguage(callLanguage);
  const languageLabel = getLanguageLabel(languageCode);
  const selectedQuestions = buildNumberedQuestions(flow, languageCode);

  return [
    "You are Record's phone verification voice agent.",
    "This is a static scripted verification call. Do not act as an adaptive interviewer.",
    "Do not create questions. Do not ask LLM-generated questions. Do not ask follow-up questions.",
    "Use the runtime contact_name only for the candidate name.",
    "The Raya agent must be configured with Call language = Multilingual and a multilingual voice.",
    `Selected call language: ${languageLabel}.`,
    `Speak only in ${languageLabel} for this call.`,
    ...(languageCode === "ta"
      ? ["Use colloquial spoken Tamil. Keep common job/tool words in simple Tamil-English when natural."]
      : []),
    `If the candidate speaks another language, politely continue in ${languageLabel} and repeat the same static question in ${languageLabel}.`,
    "Do not switch languages during the call.",
    "Do not translate freely. Use only the selected static script below.",
    "",
    "Opening consent step:",
    `Say exactly: "${buildConsentIntro()}"`,
    "If the candidate agrees, says yes, okay, ready, or similar, continue to Q1.",
    ...(languageCode === "ta"
      ? [
        "For Tamil consent, treat these as YES and continue to Q1: ஆம், ஆமா, சரி, seri, sari, okay, ok, பேசலாம், pesalam, paesalam, sollunga, continue pannunga, start pannunga, ready.",
        "Do not end the call for short Tamil agreement words like sari, seri, pesalam, or paesalam.",
      ]
      : []),
    "If the candidate says no, busy, later, not interested, or refuses, say: \"No problem. Thank you for your time. Goodbye.\" Then end the call immediately.",
    ...(languageCode === "ta"
      ? [
        "For Tamil refusal, end only for clear refusal or busy intent such as: வேண்டாம், venam, vendaam, ippo mudiyathu, busy, later, apram pesalam, interest illa.",
      ]
      : []),
    "",
    `Selected flow: ${flow.label}`,
    `${languageLabel} static script. Use only this script:`,
    selectedQuestions,
    "",
    "After each candidate answer, briefly acknowledge and move to the next numbered question.",
    "After Q8 is answered, say: \"Thank you. We have recorded your responses. Our team will review and get back to you. Goodbye.\" Then end the call.",
    "Never reveal scores or evaluation during the call.",
    "Save the candidate answer for each question in the matching answer field.",
  ].join("\n");
}

export function buildStaticOutputFields(role = "") {
  const flow = getVerificationFlow(role);
  if (!flow) return [];

  return flow.questions.flatMap((item, index) => {
    const questionNumber = index + 1;

    return [
      {
        key: `question_${questionNumber}`,
        description: `Static question ${questionNumber}: ${item.question}`,
      },
      {
        key: `answer_${questionNumber}`,
        description: `Candidate's answer to static question ${questionNumber} for ${item.parameter}`,
      },
    ];
  }).concat([
    {
      key: "consent_status",
      description: "One of: agreed, refused, busy, no_response",
    },
    {
      key: "locked_language",
      description: "The selected language used for the call. One of: English, Tamil, Hindi, Kannada, Telugu",
    },
    {
      key: "call_summary",
      description: "Short factual summary of the candidate responses. Do not add questions that were not asked.",
    },
  ]);
}

export function buildStaticOutputInstructions(role = "") {
  const flow = getVerificationFlow(role);
  if (!flow) return "";

  return [
    `Extract answers only for the fixed ${flow.label} verification script.`,
    "Do not invent missing answers.",
    "For question_1 through question_8, copy the exact static question text that was asked.",
    "For answer_1 through answer_8, save the candidate response for that exact question.",
    "Set consent_status to agreed, refused, busy, or no_response.",
    "Set locked_language to the selected call language used by the agent.",
    "In call_summary, summarize only what the candidate said.",
  ].join("\n");
}

function normalizeRole(role = "") {
  return String(role).trim().toLowerCase();
}

function normalizeLanguage(language = "English") {
  const normalized = String(language).trim().toLowerCase();
  if (normalized === "ta" || normalized === "tamil") return "ta";
  if (normalized === "hi" || normalized === "hindi") return "hi";
  if (normalized === "kn" || normalized === "kannada" || normalized === "kanada") return "kn";
  if (normalized === "te" || normalized === "telugu") return "te";
  return "en";
}

function getLanguageLabel(language = "en") {
  if (language === "ta") return "Tamil";
  if (language === "hi") return "Hindi";
  if (language === "kn") return "Kannada";
  if (language === "te") return "Telugu";
  return "English";
}

function buildNumberedQuestions(flow, language = "en") {
  return flow.questions
    .map((item, index) => {
      const expected = item.expected.length > 0
        ? ` Expected/allowed answer signals: ${item.expected.join(", ")}.`
        : "";
      const question = getQuestionText(flow, item, index, language);

      return `Q${index + 1}: ${question} Parameter: ${item.parameter}.${expected}`;
    })
    .join("\n");
}

function getQuestionText(flow, item, index, language) {
  if (language === "ta") return colloquialTamilQuestionText[flow.label]?.[index] || item.questionTa || item.question;
  if (language === "hi") return hindiQuestionText[flow.label]?.[index] || item.question;
  if (language === "kn") return kannadaQuestionText[flow.label]?.[index] || item.question;
  if (language === "te") return teluguQuestionText[flow.label]?.[index] || item.question;
  return item.question;
}
