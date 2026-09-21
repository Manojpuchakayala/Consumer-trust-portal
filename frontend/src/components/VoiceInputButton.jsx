import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop, FaLanguage } from "react-icons/fa";
import "./VoiceInputButton.css";

const VOICE_LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "हिंदी (Hindi)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)" },
];

export default function VoiceInputButton({ onTranscript, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [statusText, setStatusText] = useState("");
  const recognitionRef = useRef(null);
  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatusText("Listening... Speak your dispute facts clearly.");
    };

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (fullTranscript.trim() && onTranscript) {
        onTranscript(fullTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        setStatusText("Microphone access blocked. Please allow mic permissions in browser settings.");
      } else {
        setStatusText("Voice recognition paused.");
      }
      setTimeout(() => setStatusText(""), 4000);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setStatusText("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [selectedLang, onTranscript, isSupported]);

  const toggleRecording = () => {
    if (!isSupported) {
      alert("Voice input is supported in Google Chrome, Edge, and modern Chromium browsers.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setStatusText("");
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLang;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    setLangMenuOpen(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return null; // Graceful fallback
  }

  return (
    <div className="voice-input-control-wrap">
      <div className="voice-buttons-row">
        <button
          type="button"
          className={`btn-voice-record ${isRecording ? "recording" : ""}`}
          onClick={toggleRecording}
          disabled={disabled}
          title={isRecording ? "Stop voice recording" : "Dictate your grievance using voice input"}
        >
          {isRecording ? (
            <>
              <FaStop className="voice-stop-icon" />
              <span>Stop Dictation</span>
              <span className="mic-pulse-ring" />
            </>
          ) : (
            <>
              <FaMicrophone className="voice-mic-icon" />
              <span>Voice Dictation</span>
            </>
          )}
        </button>

        {/* Language selector for voice input */}
        <div className="voice-lang-picker">
          <button
            type="button"
            className="btn-voice-lang"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            title="Select speech recognition language"
          >
            <FaLanguage />
            <span>{VOICE_LANGUAGES.find((l) => l.code === selectedLang)?.label.split(" ")[0]}</span>
          </button>

          {langMenuOpen && (
            <div className="voice-lang-dropdown">
              <div className="dropdown-label">Choose Speech Language:</div>
              {VOICE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-opt ${selectedLang === lang.code ? "selected" : ""}`}
                  onClick={() => handleLangSelect(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {statusText && <div className="voice-status-hint">{statusText}</div>}
    </div>
  );
}
