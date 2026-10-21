/**
 * Voice Translator Service
 * Provides Speech Recognition, Multi-Language Translation,
 * Text-to-Speech (TTS), and Medical Clinical Dictionaries.
 */

export interface SupportedLanguage {
  code: string;       // e.g., 'en', 'hi', 'ta', 'te'
  speechCode: string; // SpeechRecognition language tag e.g. 'en-US', 'hi-IN'
  name: string;       // English name e.g. 'Hindi'
  nativeName: string; // Native script e.g. 'हिन्दी'
  flag?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', speechCode: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-IN', speechCode: 'en-IN', name: 'English (India)', nativeName: 'Indian English', flag: '🇮🇳' },
  { code: 'hi', speechCode: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', speechCode: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', speechCode: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', speechCode: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', speechCode: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', speechCode: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', speechCode: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', speechCode: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', speechCode: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', speechCode: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'es', speechCode: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', speechCode: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', speechCode: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', speechCode: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', speechCode: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'pt', speechCode: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', speechCode: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

/**
 * Common medical phrases for one-click dictation & clinical note authoring
 */
export interface MedicalPhrase {
  category: 'General' | 'Symptoms' | 'Examination' | 'Plan' | 'Discharge';
  english: string;
}

export const COMMON_MEDICAL_PHRASES: MedicalPhrase[] = [
  { category: 'General', english: 'Patient is conscious, coherent, and oriented to time, place, and person.' },
  { category: 'General', english: 'Vitals stable: Blood pressure 120/80 mmHg, Pulse 76 bpm regular, Afebrile, SpO2 99% on room air.' },
  { category: 'General', english: 'No known drug allergies reported by the patient or attendant.' },
  { category: 'Symptoms', english: 'Patient presented with complaints of high-grade fever, dry cough, and generalized fatigue for 3 days.' },
  { category: 'Symptoms', english: 'Mild shortness of breath on moderate exertion. No chest pain, orthopnea, or pedal edema.' },
  { category: 'Symptoms', english: 'Reports mild epigastric discomfort, nausea, and loss of appetite.' },
  { category: 'Examination', english: 'Systemic Examination: S1 S2 heard, no murmurs. Respiratory system: Bilateral air entry equal, clear lungs, no wheezing or crepitations.' },
  { category: 'Examination', english: 'Abdomen soft, non-tender, non-distended. Bowel sounds normal. No organomegaly detected.' },
  { category: 'Examination', english: 'Surgical wound site inspected: Clean, dry, and healthy. Sutures intact with no signs of erythema, induration, or discharge.' },
  { category: 'Plan', english: 'Continue prescribed medications as advised. Monitor vitals twice daily and report any warning signs.' },
  { category: 'Plan', english: 'Advised adequate oral hydration, high-protein balanced diet, and strict avoidance of heavy lifting.' },
  { category: 'Discharge', english: 'Condition at discharge: Hemodynamically stable, ambulatory, tolerating oral diet well.' },
  { category: 'Discharge', english: 'Review in Outpatient Department (OPD) after 5 days with follow-up lab investigations.' },
  { category: 'Discharge', english: 'Emergency warning: If patient develops persistent fever, severe pain, vomiting, or dyspnea, report to Emergency immediately.' },
];

/**
 * Built-in Medical Phrase Translation Dictionary (offline fallback)
 */
const OFFLINE_MEDICAL_DICTIONARY: Record<string, Record<string, string>> = {
  'patient is conscious': {
    hi: 'रोगी होश में है और उन्मुख है',
    ta: 'நோயாளி சுயநினைவுடன் உள்ளார்',
    te: 'రోగి స్పృహలో ఉన్నారు',
    es: 'El paciente está consciente y orientado',
    fr: 'Le patient est conscient et orienté',
    ar: 'المريض واعي ومدرك',
  },
  'vitals stable': {
    hi: 'महत्वपूर्ण लक्षण (वाइटल्स) स्थिर हैं',
    ta: 'உயிர் அறிகுறிகள் சீராக உள்ளன',
    te: 'ప్రాణాధార సంకేతాలు స్థిరంగా ఉన్నాయి',
    es: 'Signos vitales estables',
    fr: 'Signes vitaux stables',
    ar: 'العلامات الحيوية مستقرة',
  },
  'discharge summary': {
    hi: 'डिस्चार्ज सारांश',
    ta: 'டிஸ்சார்ஜ் சுருக்கம்',
    te: 'డిశ్చార్జ్ సారాంశం',
    es: 'Resumen de alta médica',
    fr: 'Résumé de sortie',
    ar: 'ملخص الخروج',
  },
  'blood pressure': {
    hi: 'रक्तचाप (ब्लड प्रेशर)',
    ta: 'இரத்த அழுத்தம்',
    te: 'రక్తపోటు',
    es: 'Presión arterial',
    fr: 'Pression artérielle',
    ar: 'ضغط الدم',
  },
};

/**
 * Clean up language code (e.g. 'en-IN' -> 'en', 'zh-CN' -> 'zh')
 */
export function normalizeLangCode(code: string): string {
  if (code.includes('-')) {
    return code.split('-')[0].toLowerCase();
  }
  return code.toLowerCase();
}

/**
 * Translates a single text chunk using MyMemory API with Google Translate fallback.
 */
export async function translateText(
  text: string,
  fromLangCode: string,
  toLangCode: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const src = normalizeLangCode(fromLangCode);
  const tgt = normalizeLangCode(toLangCode);

  if (src === tgt) {
    return text;
  }

  // Check offline dictionary for exact or partial medical phrase match
  const lower = trimmed.toLowerCase();
  for (const [key, translations] of Object.entries(OFFLINE_MEDICAL_DICTIONARY)) {
    if (lower === key && translations[tgt]) {
      return translations[tgt];
    }
  }

  // 1. Try MyMemory Translation API (Free public endpoint)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${src}|${tgt}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let translated = data.responseData.translatedText;
        // Check if MyMemory returned a quota error text
        if (!translated.toLowerCase().includes('my memory has detected warning') &&
            !translated.toLowerCase().includes('quota exceeded')) {
          return translated;
        }
      }
    }
  } catch (err) {
    // Fall through to backup
    console.warn('MyMemory translation skipped or timed out, trying fallback...');
  }

  // 2. Try Google Translate Public Endpoint
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const gRes = await fetch(gUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData) && Array.isArray(gData[0])) {
        const fullTranslation = gData[0].map((item: any) => item[0]).join('');
        if (fullTranslation) {
          return fullTranslation;
        }
      }
    }
  } catch (gErr) {
    console.warn('Google Translate API fallback failed:', gErr);
  }

  // 3. Graceful offline translation fallback: returns clean text
  return trimmed;
}

/**
 * Translates HTML content while preserving tags like <p>, <b>, <ul>, <li>, <table>, etc.
 */
export async function translateHtml(
  htmlContent: string,
  fromLangCode: string,
  toLangCode: string
): Promise<string> {
  if (!htmlContent || !htmlContent.trim()) return '';

  const src = normalizeLangCode(fromLangCode);
  const tgt = normalizeLangCode(toLangCode);
  if (src === tgt) return htmlContent;

  // Create temporary DOM node to parse
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Extract all text nodes
  const textNodes: Node[] = [];
  const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walk.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim().length > 0) {
      textNodes.push(node);
    }
  }

  // Translate text in batches of up to 10 nodes to preserve performance
  for (let i = 0; i < textNodes.length; i += 5) {
    const batch = textNodes.slice(i, i + 5);
    await Promise.all(
      batch.map(async (n) => {
        const orig = n.nodeValue?.trim();
        if (orig) {
          try {
            const translated = await translateText(orig, fromLangCode, toLangCode);
            n.nodeValue = n.nodeValue?.replace(orig, translated) || translated;
          } catch (e) {
            // Keep original on failure
          }
        }
      })
    );
  }

  return tempDiv.innerHTML;
}

/**
 * Text-to-Speech playback using window.speechSynthesis
 */
export function speakText(text: string, speechCode: string): void {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Stop any active utterance
  window.speechSynthesis.cancel();

  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText) return;

  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.lang = speechCode;
  utterance.rate = 0.95; // slightly slower for clinical clarity
  utterance.pitch = 1.0;

  // Try matching voice by speechCode
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang === speechCode || v.lang.startsWith(speechCode.slice(0, 2))
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop active speech synthesis
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if Speech Recognition is supported in this browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Proactively verifies microphone permissions without blocking audio stream.
 */
export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  if (typeof navigator === 'undefined') {
    return { granted: true };
  }

  // 1. Fast check with Permissions API if supported
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as any });
      if (status.state === 'denied') {
        return {
          granted: false,
          error:
            'Microphone access is blocked. Please click the lock or camera/mic icon in your browser address bar to allow microphone access.',
        };
      }
      if (status.state === 'granted') {
        return { granted: true };
      }
    } catch (e) {
      // Permissions API for 'microphone' might not be supported in all browsers
    }
  }

  return { granted: true };
}

/**
 * Audio Level Monitor to show real-time microphone volume feedback
 */
export function createAudioLevelMeter(
  onLevelChange: (level: number) => void
): { stop: () => void } | null {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let micStream: MediaStream | null = null;
  let animId: number | null = null;
  let isStopped = false;

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      if (isStopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      micStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (isStopped || !analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize to 0 - 100 with sensitivity curve
        const level = Math.min(100, Math.round((avg / 128) * 100));
        onLevelChange(level);
        animId = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    })
    .catch((e) => {
      console.warn('AudioLevelMeter setup skipped:', e);
    });

  return {
    stop: () => {
      isStopped = true;
      if (animId) cancelAnimationFrame(animId);
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    },
  };
}

/**
 * Continuous Speech Dictation Session
 * Provides resilient, uninterrupted dictation for 5+ minutes or unlimited duration,
 * seamlessly auto-reconnecting whenever the browser engine cycles on silence pauses.
 */
export interface ContinuousSpeechSessionOptions {
  lang: string;
  minDurationSeconds?: number; // default: 300 (5 minutes)
  onInterimText: (interim: string) => void;
  onFinalText: (finalText: string) => void;
  onAudioLevel?: (level: number) => void;
  onTick?: (secondsElapsed: number, formattedTime: string) => void;
  onStatusChange?: (status: {
    isActive: boolean;
    statusText: string;
    errorText?: string;
  }) => void;
}

export class ContinuousSpeechSession {
  private isDesired: boolean = false;
  private options: ContinuousSpeechSessionOptions;
  private currentRecognition: any = null;
  private audioMeter: { stop: () => void } | null = null;
  private startTime: number = 0;
  private tickTimer: any = null;
  private restartTimer: any = null;
  private lastCycleStartTime: number = 0;

  constructor(options: ContinuousSpeechSessionOptions) {
    this.options = { minDurationSeconds: 300, ...options };
  }

  public get isActive(): boolean {
    return this.isDesired;
  }

  public async start(): Promise<{ success: boolean; error?: string }> {
    if (!isSpeechRecognitionSupported()) {
      return {
        success: false,
        error:
          'Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.',
      };
    }

    const perm = await requestMicrophonePermission();
    if (!perm.granted) {
      return { success: false, error: perm.error || 'Microphone access is blocked.' };
    }

    this.isDesired = true;
    this.startTime = Date.now();

    // Always start background audio keep-alive (and audio meter if callback provided)
    this.audioMeter = createAudioLevelMeter((lvl) => {
      if (this.isDesired && this.options.onAudioLevel) {
        this.options.onAudioLevel(lvl);
      }
    });

    this.startTickTimer();
    this.spawnRecognition();
    return { success: true };
  }

  public setLanguage(speechCode: string) {
    this.options.lang = speechCode;
    if (this.isDesired) {
      this.spawnRecognition();
    }
  }

  public stop() {
    this.isDesired = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.audioMeter) {
      this.audioMeter.stop();
      this.audioMeter = null;
    }
    if (this.currentRecognition) {
      try {
        this.currentRecognition.onstart = null;
        this.currentRecognition.onend = null;
        this.currentRecognition.onerror = null;
        this.currentRecognition.onresult = null;
        this.currentRecognition.stop();
      } catch (e) {}
      this.currentRecognition = null;
    }
    this.options.onInterimText('');
    this.options.onStatusChange?.({
      isActive: false,
      statusText: '',
    });
  }

  private startTickTimer() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      if (!this.isDesired) {
        clearInterval(this.tickTimer);
        return;
      }
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      this.options.onTick?.(elapsedSec, formatted);
    }, 1000);
  }

  private spawnRecognition() {
    if (!this.isDesired) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (this.currentRecognition) {
      try {
        this.currentRecognition.onstart = null;
        this.currentRecognition.onend = null;
        this.currentRecognition.onerror = null;
        this.currentRecognition.onresult = null;
        this.currentRecognition.abort();
      } catch (e) {}
      this.currentRecognition = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.options.lang;
    this.lastCycleStartTime = Date.now();

    recognition.onstart = () => {
      if (!this.isDesired) {
        try {
          recognition.abort();
        } catch (e) {}
        return;
      }
      this.options.onStatusChange?.({
        isActive: true,
        statusText: `Continuous dictation active (5+ mins)... Speak anytime`,
      });
    };

    recognition.onresult = (event: any) => {
      if (!this.isDesired) return;
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcript + ' ';
        } else {
          interimStr += transcript;
        }
      }

      this.options.onInterimText(interimStr);

      if (finalStr.trim()) {
        this.options.onFinalText(finalStr.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Silence timeout: keep session active!
        this.options.onStatusChange?.({
          isActive: true,
          statusText: 'Listening continuously... (Paused / Waiting for speech)',
        });
        return;
      }
      if (event.error === 'not-allowed') {
        this.stop();
        this.options.onStatusChange?.({
          isActive: false,
          statusText: '',
          errorText:
            'Microphone permission blocked. Please click the lock or camera icon in your address bar to allow.',
        });
        return;
      }
      if (event.error === 'network') {
        this.options.onStatusChange?.({
          isActive: true,
          statusText: 'Speech server reconnecting...',
        });
        return;
      }
    };

    recognition.onend = () => {
      if (!this.isDesired) {
        this.options.onStatusChange?.({
          isActive: false,
          statusText: '',
        });
        return;
      }

      // Automatically reconnect with a fresh instance
      const cycleDuration = Date.now() - this.lastCycleStartTime;
      const delay = cycleDuration < 1000 ? 500 : 150;

      if (this.restartTimer) clearTimeout(this.restartTimer);
      this.restartTimer = setTimeout(() => {
        if (this.isDesired) {
          this.spawnRecognition();
        }
      }, delay);
    };

    this.currentRecognition = recognition;

    try {
      recognition.start();
    } catch (err: any) {
      if (err.name !== 'InvalidStateError') {
        console.warn('Recognition start caught error, retrying:', err);
      }
      if (this.restartTimer) clearTimeout(this.restartTimer);
      this.restartTimer = setTimeout(() => {
        if (this.isDesired) {
          this.spawnRecognition();
        }
      }, 400);
    }
  }
}


