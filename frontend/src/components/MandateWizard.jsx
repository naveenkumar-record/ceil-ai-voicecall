import { useEffect, useMemo, useState } from "react";
import { getBatchStatus, initiateBatchCalls, initiateCall } from "../services/api.js";
import { Button } from "./ui/Button.jsx";
import { Checkbox } from "./ui/Checkbox.jsx";
import { Input } from "./ui/Input.jsx";
import { Radio } from "./ui/Radio.jsx";
import { Select } from "./ui/Select.jsx";
import { Textarea } from "./ui/Textarea.jsx";

const steps = ["Mandate name", "Job summary", "Candidate data", "AI screening"];
const WIZARD_STORAGE_KEY = "record-mandate-wizard-state";

const roleOptions = ["Driver", "Plumber", "Electrician"];
const languageOptions = ["English", "Tamil", "Hindi", "Kannada", "Telugu"];

const rolePresets = {
  Driver: {
    jobTitle: "Driver",
    keySkills: "Driving, valid license, route knowledge, safety awareness",
  },
  Plumber: {
    jobTitle: "Plumber",
    keySkills: "Pipe fitting, leakage repair, bathroom installation, plumbing tools",
  },
  Electrician: {
    jobTitle: "Electrician",
    keySkills: "Domestic wiring, commercial wiring, electrical tools, safety checks",
  },
};

const verificationFlows = {
  Driver: [
    "Please confirm your full name and current location.",
    "How many years have you worked as a driver?",
    "Which vehicles have you driven regularly?",
    "Do you currently hold a valid driving license?",
    "Are you comfortable using Google Maps and navigating new routes?",
    "What would you do if your vehicle breaks down during a delivery?",
    "Are you comfortable with rotational shifts and long-distance travel?",
    "Can you travel daily to the work location?",
  ],
  Plumber: [
    "Please confirm your name and current area.",
    "How many years have you worked as a plumber?",
    "Which plumbing work have you performed regularly?",
    "Which plumbing tools do you use regularly?",
    "A customer reports a hidden water leak inside a wall. How would you identify the issue?",
    "What precautions do you take before starting plumbing work?",
    "Are you comfortable working at customer sites and construction locations?",
    "Can you travel to nearby project locations daily?",
  ],
  Electrician: [
    "Please confirm your name and current location.",
    "How many years of electrical work experience do you have?",
    "What type of electrical work have you performed?",
    "Which electrical tools do you use regularly?",
    "Before repairing a live electrical circuit, what safety checks would you perform?",
    "A circuit breaker trips repeatedly. What could be the reasons?",
    "Do you hold any electrical certification or license?",
    "Are you comfortable attending emergency breakdown calls and working shifts?",
  ],
};

const localizedVerificationFlows = {
  Tamil: {
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
  },
  Hindi: {
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
  },
  Kannada: {
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
  },
  Telugu: {
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
  },
};

const csvHeaders = [
  "Name",
  "Email ID",
  "Phone Number",
  "Gender",
  "Date of Birth",
  "Curr. Company Designation",
  "Curr. Company name",
  "Department",
  "Industry",
  "Current Location",
  "Preferred Locations",
];

const defaultMandate = {
  mandateName: "",
  role: "",
  callLanguage: "English",
  jobTitle: "",
  industry: "",
  department: "",
  workLocation: "",
  locationType: "",
  experienceMin: "",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  noticePeriod: "",
  ageMin: "18",
  ageMax: "",
  keySkills: "",
  recruiterEmail: "",
  jobSummary: "",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultBatchConfig = {
  startTime: "03:00",
  endTime: "06:00",
  days: [getTodayLabel()],
  timezone: "Asia/Kolkata (IST)",
  statusFilters: ["Pending"],
  maxRetries: "0",
  retryAfterMinutes: "2",
  concurrencyMode: "Shared",
  maxConcurrentCalls: "5",
};

export default function MandateWizard() {
  const savedState = useMemo(loadSavedWizardState, []);
  const [step, setStep] = useState(savedState.step);
  const [mandate, setMandate] = useState(savedState.mandate);
  const [candidates, setCandidates] = useState(savedState.candidates);
  const [fileName, setFileName] = useState(savedState.fileName);
  const [callResult, setCallResult] = useState(savedState.callResult);
  const [isCalling, setIsCalling] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [message, setMessage] = useState(savedState.message);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(mandate.mandateName.trim());
    if (step === 1) {
      return Boolean(
        mandate.jobTitle.trim()
          && mandate.industry.trim()
          && mandate.department.trim()
          && mandate.keySkills.trim()
          && mandate.recruiterEmail.trim(),
      );
    }
    if (step === 2) {
      return candidates.length > 0
        && Boolean(mandate.role.trim())
        && Boolean(mandate.callLanguage.trim());
    }
    return true;
  }, [candidates.length, mandate, step]);

  useEffect(() => {
    if (!callResult?.id) return undefined;

    let isMounted = true;

    async function refreshBatch() {
      try {
        const latestBatch = await getBatchStatus(callResult.id);
        if (isMounted) {
          console.table((latestBatch.contacts || []).map((contact) => ({
            name: contact.candidate?.candidateName || "Candidate",
            phone: contact.candidate?.phoneNumber || "-",
            status: contact.status,
            answered: contact.answered ? "YES" : "NO",
            interest: contact.interested ? "YES" : contact.notInterested ? "NO" : "UNKNOWN",
          })));
          setCallResult(latestBatch);
        }
      } catch (error) {
        if (error?.response?.status === 404 && isMounted) {
          setCallResult(null);
          setMessage("Previous batch was not found on the backend. Start a new calling round.");
        }
      }
    }

    refreshBatch();
    const intervalId = window.setInterval(refreshBatch, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [callResult?.id]);

  useEffect(() => {
    saveWizardState({
      step,
      mandate,
      candidates,
      fileName,
      callResult,
      message,
    });
  }, [callResult, candidates, fileName, mandate, message, step]);

  function updateMandate(field, value) {
    setMandate((current) => ({ ...current, [field]: value }));
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();
    reader.onload = () => {
      const parsedCandidates = parseCandidateCsv(String(reader.result || ""));
      setCandidates(parsedCandidates);
      setMessage(parsedCandidates.length > 0
        ? "Sheet uploaded successfully. Ready for calling round."
        : "No valid candidates found. CSV must include Name and Phone Number.");
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const csv = `${csvHeaders.join(",")}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "candidates-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function openBatchModal() {
    setIsBatchModalOpen(true);
  }

  async function callNow() {
    setIsCalling(true);
    setMessage("Starting direct call.");

    try {
      const contacts = [];

      for (const candidate of candidates) {
        try {
          const result = await initiateCall({
            phoneNumber: candidate.phoneNumber,
            candidate: {
              ...candidate,
              mandateName: mandate.mandateName,
              role: mandate.role,
              callLanguage: mandate.callLanguage || "English",
            },
          });

          contacts.push({
            id: extractCallId(result) || `${candidate.phoneNumber}-${Date.now()}`,
            candidate,
            status: "initiated",
            attempts: 1,
            callId: extractCallId(result),
            result,
          });
        } catch (error) {
          contacts.push({
            id: `${candidate.phoneNumber}-${Date.now()}`,
            candidate,
            status: "failed",
            attempts: 1,
            lastError: getErrorMessage(error),
          });
        }
      }

      const failed = contacts.filter((contact) => contact.status === "failed").length;
      const initiated = contacts.length - failed;

      setCallResult({
        id: "",
        status: failed === contacts.length ? "failed" : "initiated",
        mode: "direct",
        total: contacts.length,
        called: initiated,
        initiated,
        failed,
        pending: 0,
        answered: 0,
        interested: 0,
        notInterested: 0,
        contacts,
      });
      setMessage(initiated > 0
        ? `Direct call initiated for ${initiated} candidate${initiated === 1 ? "" : "s"}.`
        : "Direct call could not be initiated.");
      setStep(3);
    } finally {
      setIsCalling(false);
    }
  }

  async function startCallingRound(batchConfig = defaultBatchConfig) {
    setIsCalling(true);
    setMessage("Calling round started.");

    try {
      const result = await initiateBatchCalls({
        mandate,
        candidates,
        batchConfig,
      });

      setCallResult(result);
      setMessage("Calling round processed. Review status below.");
      setIsBatchModalOpen(false);
      setStep(3);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsCalling(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto flex w-full align-center justify-center max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              24x7 Virtual Recruiter
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Ai Assessment
            </h1>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {mandate.mandateName || "Untitled mandate"}
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white shadow-soft my-5">
          <div className="grid min-h-[620px] lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Create Mandate
              </p>
              <ol className="space-y-5">
                {steps.map((label, index) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        index < step
                          ? "bg-emerald-600 text-white"
                          : index === step
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {index < step ? "✓" : index + 1}
                    </span>
                    <span className={index === step ? "font-semibold text-slate-900" : "text-slate-500"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ol>
            </aside>

            <div className="p-6 md:p-8">
              {step === 0 && (
                <MandateNameStep mandate={mandate} updateMandate={updateMandate} />
              )}

              {step === 1 && (
                <JobSummaryStep mandate={mandate} updateMandate={updateMandate} />
              )}

              {step === 2 && (
                <CandidateUploadStep
                  candidates={candidates}
                  fileName={fileName}
                  message={message}
                  mandate={mandate}
                  updateMandate={updateMandate}
                  onDownloadTemplate={downloadTemplate}
                  onFileUpload={handleFileUpload}
                  onStartCalling={openBatchModal}
                  onCallNow={callNow}
                  isCalling={isCalling}
                />
              )}

              {step === 3 && (
                <AIScreeningStep
                  candidates={candidates}
                  callResult={callResult}
                  onStartCalling={openBatchModal}
                  onCallNow={callNow}
                  isCalling={isCalling}
                />
              )}

              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
                <Button
                  type="button"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0}
                  variant="outline"
                >
                  Back
                </Button>
                {step < 3 && (
                  <Button
                    type="button"
                    onClick={() => setStep((current) => Math.min(3, current + 1))}
                    disabled={!canContinue}
                    size="lg"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      {isBatchModalOpen && (
        <BatchConfigModal
          isCalling={isCalling}
          onClose={() => setIsBatchModalOpen(false)}
          onStart={startCallingRound}
        />
      )}
    </main>
  );
}

function MandateNameStep({ mandate, updateMandate }) {
  const examples = [
    "Field Sales Executive - Swiggy - Mumbai",
    "Warehouse Associate - Amazon - Pune",
    "Telecaller - Customer Support - Bangalore",
  ];

  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-slate-950">Name this mandate</h2>
      <p className="mt-2 text-sm text-slate-500">
        Give it a clear, recognisable name. You will see this on your mandates list and screening outputs.
      </p>
      <label className="mt-8 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Mandate name</span>
        <Input
          value={mandate.mandateName}
          onChange={(event) => updateMandate("mandateName", event.target.value)}
          placeholder="Field Sales Executive - Swiggy - Mumbai"
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Try:</span>
        {examples.map((example) => (
          <Button
            type="button"
            key={example}
            onClick={() => updateMandate("mandateName", example)}
            variant="secondary"
            size="sm"
            className="rounded-full border border-slate-200"
          >
            {example}
          </Button>
        ))}
      </div>
    </section>
  );
}

function JobSummaryStep({ mandate, updateMandate }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-950">Fill the job summary</h2>
      <p className="mt-2 text-sm text-slate-500">
        Provide the mandate requirements. Phone calls use the static role script selected after CSV upload.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <TextField label="Job title" required value={mandate.jobTitle} onChange={(value) => updateMandate("jobTitle", value)} placeholder="e.g. Field Sales Executive" />
        <TextField label="Industry" required value={mandate.industry} onChange={(value) => updateMandate("industry", value)} placeholder="e.g. Q-Commerce, Retail" />
        <TextField label="Department" required value={mandate.department} onChange={(value) => updateMandate("department", value)} placeholder="e.g. Sales, Operations" />
        <TextField label="Work location" value={mandate.workLocation} onChange={(value) => updateMandate("workLocation", value)} placeholder="e.g. Mumbai" />
        <SelectField label="Location type" value={mandate.locationType} onChange={(value) => updateMandate("locationType", value)} options={["", "On-site", "Hybrid", "Remote"]} />
        <TextField label="Allowed notice period (days)" value={mandate.noticePeriod} onChange={(value) => updateMandate("noticePeriod", value)} placeholder="e.g. 60" />
        <RangeField label="Expected work experience (years)" min={mandate.experienceMin} max={mandate.experienceMax} onMin={(value) => updateMandate("experienceMin", value)} onMax={(value) => updateMandate("experienceMax", value)} />
        <RangeField label="Salary range (CTC LPA)" min={mandate.salaryMin} max={mandate.salaryMax} onMin={(value) => updateMandate("salaryMin", value)} onMax={(value) => updateMandate("salaryMax", value)} />
        <RangeField label="Age limit (years)" min={mandate.ageMin} max={mandate.ageMax} onMin={(value) => updateMandate("ageMin", value)} onMax={(value) => updateMandate("ageMax", value)} />
        <TextField label="Assign this mandate to (Recruiter)" required value={mandate.recruiterEmail} onChange={(value) => updateMandate("recruiterEmail", value)} placeholder="rc1@gmail.com" />
      </div>

      <div className="mt-5">
        <TextField label="Required key skills" required value={mandate.keySkills} onChange={(value) => updateMandate("keySkills", value)} placeholder="e.g. Field sales, Customer handling, English/Hindi" />
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Job summary</span>
        <Textarea
          value={mandate.jobSummary}
          onChange={(event) => updateMandate("jobSummary", event.target.value)}
          rows={5}
          placeholder="Detailed role description - responsibilities, success criteria, reporting structure..."
        />
      </label>
    </section>
  );
}

function CandidateUploadStep({
  candidates,
  fileName,
  message,
  mandate,
  updateMandate,
  onDownloadTemplate,
  onFileUpload,
  onStartCalling,
  onCallNow,
  isCalling,
}) {
  function handleRoleChange(role) {
    updateMandate("role", role);

    const preset = rolePresets[role];
    if (!preset) return;

    if (!mandate.jobTitle.trim()) updateMandate("jobTitle", preset.jobTitle);
    if (!mandate.keySkills.trim()) updateMandate("keySkills", preset.keySkills);
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-950">Upload candidate data</h2>
      <p className="mt-2 text-sm text-slate-500">
        Upload a CSV file with candidate names and phone numbers. Duplicates and empty rows are ignored.
      </p>

      <div className="mt-7 rounded-md border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Need a starter file?</p>
            <p className="mt-1 text-sm text-slate-600">Download the CSV template with all mandatory columns predefined.</p>
          </div>
          <Button
            type="button"
            onClick={onDownloadTemplate}
            variant="outline"
          >
            Download CSV template
          </Button>
        </div>
      </div>

      <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-blue-300 hover:bg-blue-50">
        <span className="text-sm font-semibold text-slate-800">
          {fileName || "Drop your filled template here"}
        </span>
        <span className="mt-2 text-sm text-slate-500">.csv - required columns: Name, Phone Number</span>
        <Input type="file" accept=".csv,text/csv" onChange={onFileUpload} className="hidden" />
      </label>

      {message && (
        <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {message}
        </div>
      )}

      {candidates.length > 0 && (
        <>
          <div className="mt-4 rounded-md border border-slate-200">
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <span>Name</span>
              <span>Phone</span>
              <span>Location</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {candidates.map((candidate, index) => (
                <div key={`${candidate.phoneNumber}-${index}`} className="grid grid-cols-3 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">{candidate.candidateName}</span>
                  <span>{candidate.phoneNumber}</span>
                  <span>{candidate.currentLocation || "-"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField label="Role" required value={mandate.role} onChange={handleRoleChange} options={["", ...roleOptions]} />
            <SelectField label="Language" required value={mandate.callLanguage} onChange={(value) => updateMandate("callLanguage", value)} options={languageOptions} />
          </div>

          <VerificationFlowPreview role={mandate.role} language={mandate.callLanguage} />

          <div className="mt-5 flex flex-col gap-4 rounded-md border border-amber-100 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">Sheet uploaded successfully</p>
              <p className="mt-1 text-sm text-amber-800">Call candidates directly or configure a batch schedule.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={onCallNow}
                disabled={isCalling || !mandate.role || !mandate.callLanguage}
                variant="amber"
              >
                {isCalling ? "Calling..." : "Call now"}
              </Button>
              <Button
                type="button"
                onClick={onStartCalling}
                disabled={isCalling || !mandate.role || !mandate.callLanguage}
                variant="outline"
              >
                Configure batch
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function AIScreeningStep({ candidates, callResult, onStartCalling, onCallNow, isCalling }) {
  const called = callResult?.called || callResult?.initiated || 0;
  const answered = callResult?.answered || 0;
  const interested = callResult?.interested || 0;
  const notInterested = callResult?.notInterested || 0;
  const pending = callResult?.pending || 0;
  const failed = callResult?.failed || 0;
  const runLabel = callResult?.mode === "direct" ? "Direct call" : "Batch";
  const runStatus = callResult?.status || "not started";
  const contacts = callResult?.contacts || [];

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-950">AI screening</h2>
      <p className="mt-2 text-sm text-slate-500">
        Calling results are shown here. Run AI screening after candidates are reached.
      </p>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <StatCard label="Called" value={called} helper="All candidates reached out to" tone="blue" />
        <StatCard label="Answered" value={answered} helper="Picked up and responded" tone="teal" />
        <StatCard label="Interested" value={interested} helper="Confirmed interest in the role" tone="pink" />
        <StatCard label="Not interested" value={notInterested} helper="Declined the opportunity" tone="amber" />
        <StatCard label="Pending" value={pending} helper="Waiting for schedule or retry" />
        <StatCard label="Failed" value={failed} helper="Could not initiate" />
      </div>

      <div className="mt-6 rounded-md border border-slate-200">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          <span>Name</span>
          <span>Phone</span>
          <span>Status</span>
          <span>Interest</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {(contacts.length > 0 ? contacts : candidates.map((candidate) => ({ candidate, status: "not started" }))).map((contact, index) => (
            <div key={contact.id || `${contact.candidate?.phoneNumber}-${index}`} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 text-sm text-slate-700">
              <span className="font-medium">{contact.candidate?.candidateName || "-"}</span>
              <span>{contact.candidate?.phoneNumber || "-"}</span>
              <span className="capitalize">{String(contact.status || "pending").replace("_", " ")}</span>
              <span>{contact.interested ? "Yes" : contact.notInterested ? "No" : contact.answered ? "Answered" : "-"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">{runLabel}:</span> {runStatus}
        {callResult?.id ? <span className="ml-2 text-slate-400">({callResult.id})</span> : null}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          onClick={onCallNow}
          disabled={isCalling || candidates.length === 0}
          size="lg"
        >
          {isCalling ? "Calling..." : "Call now"}
        </Button>
        <Button
          type="button"
          onClick={onStartCalling}
          disabled={isCalling || candidates.length === 0}
          variant="outline"
          size="lg"
        >
          Configure batch
        </Button>
      </div>
    </section>
  );
}

function BatchConfigModal({ isCalling, onClose, onStart }) {
  const [config, setConfig] = useState(defaultBatchConfig);
  const allDaysSelected = config.days.length === weekDays.length;

  function updateConfig(field, value) {
    setConfig((current) => ({ ...current, [field]: value }));
  }

  function toggleListValue(field, value) {
    setConfig((current) => {
      const values = current[field];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return { ...current, [field]: nextValues };
    });
  }

  function toggleAllDays() {
    updateConfig("days", allDaysSelected ? [] : weekDays);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-slate-200 bg-white text-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">Start batch</h2>
            <p className="mt-1 text-sm text-slate-500">Configure when and how this batch should run.</p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            disabled={isCalling}
            variant="ghost"
            size="icon"
            className="text-xl leading-none"
            aria-label="Close batch configuration"
          >
            ×
          </Button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <DarkInput label="Start time" type="time" value={config.startTime} onChange={(value) => updateConfig("startTime", value)} />
            <DarkInput label="End time" type="time" value={config.endTime} onChange={(value) => updateConfig("endTime", value)} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Days</p>
              <DarkCheckbox label="Select all days" checked={allDaysSelected} onChange={toggleAllDays} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-7">
              {weekDays.map((day) => (
                <DarkCheckbox
                  key={day}
                  label={day}
                  checked={config.days.includes(day)}
                  onChange={() => toggleListValue("days", day)}
                />
              ))}
            </div>
          </div>

          <DarkSelect
            label="Time zone"
            value={config.timezone}
            onChange={(value) => updateConfig("timezone", value)}
            options={["Asia/Kolkata (IST)", "UTC", "Asia/Dubai (GST)", "Asia/Singapore (SGT)"]}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Status filter</p>
            <div className="flex flex-wrap gap-5">
              {["Pending", "Unanswered"].map((status) => (
                <DarkCheckbox
                  key={status}
                  label={status}
                  checked={config.statusFilters.includes(status)}
                  onChange={() => toggleListValue("statusFilters", status)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DarkInput label="Maximum retries per contact" type="number" min="0" value={config.maxRetries} onChange={(value) => updateConfig("maxRetries", value)} />
            <DarkInput label="Retry after (minutes)" type="number" min="1" value={config.retryAfterMinutes} onChange={(value) => updateConfig("retryAfterMinutes", value)} />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Concurrency mode</p>
            <div className="flex gap-5">
              {["Shared", "Reserved"].map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm text-slate-700">
                  <Radio
                    checked={config.concurrencyMode === mode}
                    onChange={() => updateConfig("concurrencyMode", mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Channels: total 3, reserved 1, shared available 2</p>
          </div>

          <DarkInput label="Maximum concurrent calls" type="number" min="1" value={config.maxConcurrentCalls} onChange={(value) => updateConfig("maxConcurrentCalls", value)} />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={isCalling}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onStart(config)}
            disabled={isCalling || config.days.length === 0 || config.statusFilters.length === 0}
          >
            {isCalling ? "Starting..." : "Start batch"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function DarkInput({ label, value, onChange, type = "text", min }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <Input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function DarkSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Select>
    </label>
  );
}

function DarkCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <Checkbox
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function TextField({ label, required, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function VerificationFlowPreview({ role, language }) {
  const questions = getPreviewQuestions(role, language);

  if (!role) {
    return (
      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Select a role to lock the calling script.
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{role} static verification script</p>
          <p className="mt-1 text-sm text-slate-600">
            Raya asks this script in {language || "English"} after: This call is from Record. Can we continue?
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
          {questions.length} questions
        </span>
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-2">
        {questions.map((question, index) => (
          <li key={question} className="rounded-md border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700">
            <span className="mr-2 font-semibold text-blue-700">Q{index + 1}</span>
            {question}
          </li>
        ))}
      </ol>
    </div>
  );
}

function getPreviewQuestions(role, language = "English") {
  return localizedVerificationFlows[language]?.[role] || verificationFlows[role] || [];
}

function SelectField({ label, required, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "Select..."}
          </option>
        ))}
      </Select>
    </label>
  );
}

function RangeField({ label, min, max, onMin, onMax }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Input value={min} onChange={(event) => onMin(event.target.value)} placeholder="Min" />
        <span className="text-slate-400">-</span>
        <Input value={max} onChange={(event) => onMax(event.target.value)} placeholder="Max" />
      </div>
    </label>
  );
}

function StatCard({ label, value, helper, tone = "slate" }) {
  const toneClasses = {
    blue: "border-l-blue-600",
    teal: "border-l-teal-600",
    pink: "border-l-pink-600",
    amber: "border-l-amber-600",
    slate: "border-l-slate-300",
  };

  return (
    <div className={`rounded-md border border-l-4 border-slate-200 bg-white p-4 ${toneClasses[tone] || toneClasses.slate}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function parseCandidateCsv(csvText) {
  const rows = parseCsvRows(csvText).filter((row) => row.some(Boolean));
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const seenPhones = new Set();

  return rows.slice(1).reduce((acc, row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
    const phoneNumber = normalizePhone(record.phone_number || record.phone || record.mobile);
    const candidateName = record.name || record.candidate_name || record.username || record.user_name;

    if (!candidateName || !phoneNumber || seenPhones.has(phoneNumber)) return acc;
    seenPhones.add(phoneNumber);

    acc.push({
      candidateName,
      phoneNumber,
      email: record.email_id || record.email || "",
      gender: record.gender || "",
      dateOfBirth: record.date_of_birth || "",
      designation: record.curr_company_designation || "",
      companyName: record.curr_company_name || "",
      department: record.department || "",
      industry: record.industry || "",
      currentLocation: record.current_location || "",
      preferredLocations: record.preferred_locations || "",
    });
    return acc;
  }, []);
}

function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === "\"" && nextChar === "\"") {
      cell += "\"";
      index += 1;
    } else if (char === "\"") {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message || "";

  if (message.includes("unrecognized_keys") || message.includes("agent_args")) {
    return "Raya rejected the agent update payload. Please restart the backend and try again.";
  }

  return message || "Could not start calling round.";
}

function extractCallId(result = {}) {
  return result.uuid
    || result.call_id
    || result.callId
    || result.id
    || result.data?.uuid
    || result.data?.call_id
    || result.data?.id
    || result.call?.uuid
    || result.call?.call_id
    || result.call?.id
    || "";
}

function getTodayLabel() {
  const jsDay = new Date().getDay();
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][jsDay];
}

function loadSavedWizardState() {
  const fallback = {
    step: 0,
    mandate: defaultMandate,
    candidates: [],
    fileName: "",
    callResult: null,
    message: "",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const saved = JSON.parse(window.localStorage.getItem(WIZARD_STORAGE_KEY) || "null");
    if (!saved) return fallback;

    return {
      step: Number.isInteger(saved.step) ? saved.step : fallback.step,
      mandate: { ...defaultMandate, ...(saved.mandate || {}) },
      candidates: Array.isArray(saved.candidates) ? saved.candidates : fallback.candidates,
      fileName: saved.fileName || fallback.fileName,
      callResult: saved.callResult || fallback.callResult,
      message: saved.message || fallback.message,
    };
  } catch {
    return fallback;
  }
}

function saveWizardState(state) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
}
