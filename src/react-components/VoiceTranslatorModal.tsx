import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors, radii, shadows, spacing, typography } from '../components/ui/tokens';
import {
  SUPPORTED_LANGUAGES,
  COMMON_MEDICAL_PHRASES,
  type SupportedLanguage,
  type MedicalPhrase,
  translateText,
  translateHtml,
  speakText,
  stopSpeech,
  requestMicrophonePermission,
  isSpeechRecognitionSupported,
  createAudioLevelMeter,
  ContinuousSpeechSession,
} from '../services/voiceTranslatorService';

export interface VoiceTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateHtml?: string;
  onInsertAtCursor: (textOrHtml: string) => void;
  onAppendToTemplate: (textOrHtml: string) => void;
  onReplaceTemplate: (textOrHtml: string) => void;
}

export const VoiceTranslatorModal: React.FC<VoiceTranslatorModalProps> = ({
  isOpen,
  onClose,
  currentTemplateHtml = '',
  onInsertAtCursor,
  onAppendToTemplate,
  onReplaceTemplate,
}) => {
  // Tabs: 'voice' (Live Voice Dictation), 'full-template' (Translate Template), 'phrases' (Medical Phrases)
  const [activeTab, setActiveTab] = useState<'voice' | 'full-template' | 'phrases'>('voice');

  // Languages: Default Spoken to Indian English (or English US)
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>(
    SUPPORTED_LANGUAGES.find((l) => l.code === 'en-IN') || SUPPORTED_LANGUAGES[0]
  );
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(
    SUPPORTED_LANGUAGES.find((l) => l.code === 'hi') || SUPPORTED_LANGUAGES[2] // Hindi or selected
  );

  // Voice Dictation States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [sessionElapsed, setSessionElapsed] = useState<string>('00:00');
  const [targetDurationMins, setTargetDurationMins] = useState<number>(5);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');

  // Continuous Speech Session & Audio Meter
  const speechSessionRef = useRef<ContinuousSpeechSession | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Template Translation States
  const [translatedTemplate, setTranslatedTemplate] = useState<string>('');
  const [isTranslatingTemplate, setIsTranslatingTemplate] = useState<boolean>(false);

  // Category filter for Phrases
  const [phraseCategory, setPhraseCategory] = useState<string>('All');

  // Feedback Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const sourceLangRef = useRef<SupportedLanguage>(sourceLang);
  sourceLangRef.current = sourceLang;

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);

    // If currently running, update recognition language
    if (speechSessionRef.current && speechSessionRef.current.isActive) {
      speechSessionRef.current.setLanguage(targetLang.speechCode);
    }

    // Swap texts if available
    const tempText = spokenTranscript;
    setSpokenTranscript(translatedText);
    setTranslatedText(tempText);
  };

  // Perform Translation of Spoken Text
  const performTranslation = useCallback(
    async (textToTranslate: string) => {
      if (!textToTranslate || !textToTranslate.trim()) {
        setTranslatedText('');
        return;
      }
      setIsTranslating(true);
      try {
        const result = await translateText(textToTranslate, sourceLang.code, targetLang.code);
        setTranslatedText(result);
      } catch (err) {
        console.error('Translation error:', err);
        showNotification('Translation encountered an error, falling back to original text.', 'error');
        setTranslatedText(textToTranslate);
      } finally {
        setIsTranslating(false);
      }
    },
    [sourceLang.code, targetLang.code]
  );

  // Stop Continuous Speech Session
  const stopListening = useCallback(() => {
    if (speechSessionRef.current) {
      speechSessionRef.current.stop();
      speechSessionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    setAudioLevel(0);
    setVoiceStatusText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSessionRef.current) {
        speechSessionRef.current.stop();
        speechSessionRef.current = null;
      }
      stopSpeech();
    };
  }, []);

  // Toggle Microphone (5+ Min Resilient Continuous Session)
  const handleToggleListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      showNotification(
        'Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.',
        'error'
      );
      return;
    }

    if (speechSessionRef.current && speechSessionRef.current.isActive) {
      stopListening();
      showNotification('Voice dictation stopped.', 'info');
      return;
    }

    const session = new ContinuousSpeechSession({
      lang: sourceLang.speechCode,
      minDurationSeconds: targetDurationMins * 60,
      onAudioLevel: (lvl) => {
        setAudioLevel(lvl);
      },
      onTick: (_sec, formatted) => {
        setSessionElapsed(formatted);
      },
      onInterimText: (interim) => {
        setInterimTranscript(interim);
      },
      onFinalText: (phrase) => {
        if (!phrase.trim()) return;
        setSpokenTranscript((prev) => {
          const updated = (prev ? prev.trim() + ' ' : '') + phrase.trim();
          performTranslation(updated);
          return updated;
        });
      },
      onStatusChange: (status) => {
        setIsListening(status.isActive);
        setVoiceStatusText(status.statusText);
        if (status.errorText) {
          showNotification(status.errorText, 'error');
        }
      },
    });

    const startRes = await session.start();
    if (!startRes.success) {
      showNotification(startRes.error || 'Could not start microphone.', 'error');
      return;
    }

    speechSessionRef.current = session;
    setIsListening(true);
    showNotification(`Microphone active for continuous dictation (min ${targetDurationMins} mins).`, 'success');
  };

  // Listen to translated text using TTS
  const handlePlayAudio = (text: string, langCode: string) => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(text, langCode);
      // Auto reset playing indicator after speech duration estimate
      const durationMs = Math.max(2000, text.split(' ').length * 400);
      setTimeout(() => setIsPlayingAudio(false), durationMs);
    }
  };

  // Full Template Translation Handler
  const handleTranslateTemplate = async () => {
    if (!currentTemplateHtml || !currentTemplateHtml.trim()) {
      showNotification('No template content available to translate.', 'info');
      return;
    }
    setIsTranslatingTemplate(true);
    try {
      const translated = await translateHtml(currentTemplateHtml, sourceLang.code, targetLang.code);
      setTranslatedTemplate(translated);
      showNotification('Template successfully translated into ' + targetLang.name, 'success');
    } catch (err) {
      console.error('Template translation failed:', err);
      showNotification('Template translation failed.', 'error');
    } finally {
      setIsTranslatingTemplate(false);
    }
  };

  // Phrase click handler
  const handleSelectPhrase = async (phrase: MedicalPhrase) => {
    setSpokenTranscript(phrase.english);
    setIsTranslating(true);
    try {
      const translated = await translateText(phrase.english, 'en', targetLang.code);
      setTranslatedText(translated);
      showNotification(`Loaded phrase: "${phrase.english.slice(0, 30)}..."`, 'info');
    } catch (err) {
      setTranslatedText(phrase.english);
    } finally {
      setIsTranslating(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px 20px 20px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopListening();
          stopSpeech();
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: radii.xl,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Toast Notification Banner ── */}
        {notification && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10060,
              backgroundColor:
                notification.type === 'error'
                  ? '#ef4444'
                  : notification.type === 'info'
                  ? '#0284c7'
                  : '#10b981',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: radii.full,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: shadows.lg,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'slideDown 0.25s ease-out',
            }}
          >
            <i
              className={`fas fa-${
                notification.type === 'error'
                  ? 'exclamation-circle'
                  : notification.type === 'info'
                  ? 'info-circle'
                  : 'check-circle'
              }`}
            />
            <span>{notification.message}</span>
          </div>
        )}

        {/* ── Header ── */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: radii.lg,
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <i className="fas fa-microphone-alt" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff', letterSpacing: -0.2 }}>
                  Clinical Voice Translator
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  AI Multilingual
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Speak in your preferred language &amp; instantly translate into clinical note templates
              </div>
            </div>
          </div>

          <button
            id="btn-close-voice-translator"
            type="button"
            onClick={() => {
              stopListening();
              stopSpeech();
              onClose();
            }}
            title="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: 34,
              height: 34,
              borderRadius: radii.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* ── Mode Navigation Tabs ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderBottom: `1px solid ${colors.border}`,
            padding: `0 ${spacing.xl}`,
          }}
        >
          <button
            id="tab-voice-dictation"
            type="button"
            onClick={() => setActiveTab('voice')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'voice' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'voice' ? '#2563eb' : colors.textMuted,
              fontWeight: activeTab === 'voice' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-microphone" />
            <span>Voice Dictation &amp; Translate</span>
          </button>

          <button
            id="tab-translate-template"
            type="button"
            onClick={() => setActiveTab('full-template')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'full-template' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'full-template' ? '#2563eb' : colors.textMuted,
              fontWeight: activeTab === 'full-template' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-language" />
            <span>Translate Whole Template</span>
          </button>

          <button
            id="tab-clinical-phrases"
            type="button"
            onClick={() => setActiveTab('phrases')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'phrases' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'phrases' ? '#2563eb' : colors.textMuted,
              fontWeight: activeTab === 'phrases' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fas fa-notes-medical" />
            <span>Clinical Phrases</span>
          </button>
        </div>

        {/* ── Language Selection Bar ── */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.xl}`,
            backgroundColor: '#ffffff',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {/* Source Voice Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, whiteSpace: 'nowrap' }}>
              <i className="fas fa-microphone" style={{ color: '#2563eb', marginRight: 4 }} />
              Spoken Language:
            </span>
            <select
              value={sourceLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) {
                  setSourceLang(found);
                  if (speechSessionRef.current && speechSessionRef.current.isActive) {
                    speechSessionRef.current.setLanguage(found.speechCode);
                  }
                }
              }}
              style={{
                flex: 1,
                height: 34,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 8px',
                fontSize: 13,
                fontWeight: 600,
                color: colors.textMain,
                backgroundColor: '#f8fafc',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwapLanguages}
            title="Swap Languages"
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.full,
              border: `1px solid ${colors.border}`,
              backgroundColor: '#f1f5f9',
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <i className="fas fa-exchange-alt" />
          </button>

          {/* Target Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, whiteSpace: 'nowrap' }}>
              <i className="fas fa-file-alt" style={{ color: '#10b981', marginRight: 4 }} />
              Target Language:
            </span>
            <select
              value={targetLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) {
                  setTargetLang(found);
                  if (spokenTranscript) {
                    translateText(spokenTranscript, sourceLang.code, found.code).then(setTranslatedText);
                  }
                }
              }}
              style={{
                flex: 1,
                height: 34,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 8px',
                fontSize: 13,
                fontWeight: 600,
                color: colors.textMain,
                backgroundColor: '#f8fafc',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {/* TAB 1: Voice Dictation & Live Translation */}
          {activeTab === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {/* Mic Dictation Trigger Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: '#ffffff',
                  borderRadius: radii.lg,
                  border: isListening ? '2px solid #ef4444' : `1px solid ${colors.border}`,
                  boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.2)' : shadows.sm,
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                  <button
                    id="btn-toggle-mic-recording"
                    type="button"
                    onClick={handleToggleListening}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: radii.full,
                      border: 'none',
                      background: isListening
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isListening
                        ? '0 0 0 6px rgba(239, 68, 68, 0.25)'
                        : '0 4px 12px rgba(37, 99, 235, 0.35)',
                      transition: 'all 0.2s ease',
                      animation: isListening ? 'pulseMic 1.4s infinite' : 'none',
                    }}
                  >
                    <i className={`fas fa-${isListening ? 'stop' : 'microphone'}`} />
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: colors.textMain }}>
                        {isListening ? 'Listening Continuously...' : 'Click to start voice dictation'}
                      </div>
                      {isListening && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 8px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            border: '1px solid #fca5a5',
                          }}
                        >
                          <i className="fas fa-clock" style={{ fontSize: 10 }} />
                          {sessionElapsed} / {targetDurationMins}m+
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {isListening
                        ? (voiceStatusText || `Continuous session active (min ${targetDurationMins} mins). Detecting ${sourceLang.name} → ${targetLang.name}`)
                        : `Ready to dictate continuously in ${sourceLang.name}. Stays active >= 5 mins without stopping on pauses.`}
                    </div>
                  </div>
                </div>

                {/* Right controls: Duration Selector & Audio Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>Duration:</span>
                    <select
                      value={targetDurationMins}
                      onChange={(e) => setTargetDurationMins(Number(e.target.value))}
                      style={{
                        height: 28,
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '0 6px',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        color: colors.textMain,
                        outline: 'none',
                      }}
                    >
                      <option value={5}>Min 5 mins</option>
                      <option value={10}>Min 10 mins</option>
                      <option value={15}>Min 15 mins</option>
                      <option value={30}>Min 30 mins</option>
                    </select>
                  </div>

                  {/* Audio Waveform Indicator with Real-Time Level */}
                  {isListening && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, paddingRight: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
                        {[0.5, 1.2, 0.8, 1.4, 0.9, 1.3, 0.7].map((mult, idx) => {
                          const calculatedHeight = Math.max(4, Math.min(24, Math.round((audioLevel * mult) / 3)));
                          return (
                            <span
                              key={idx}
                              style={{
                                width: 3,
                                height: `${calculatedHeight}px`,
                                backgroundColor: audioLevel > 5 ? '#ef4444' : '#f87171',
                                borderRadius: 2,
                                transition: 'height 0.08s ease',
                              }}
                            />
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: audioLevel > 5 ? '#dc2626' : colors.textMuted }}>
                        {audioLevel > 5 ? 'Sound detected' : 'Waiting for voice...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dual Panels: Original Speech vs Translated Result */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.md,
                }}
              >
                {/* Left Panel: Original Spoken Text */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: radii.lg,
                    border: `1px solid ${colors.border}`,
                    padding: spacing.md,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: shadows.xs,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{sourceLang.flag}</span>
                      <span>Original Speech ({sourceLang.name})</span>
                    </div>
                    {spokenTranscript && (
                      <button
                        type="button"
                        onClick={() => {
                          setSpokenTranscript('');
                          setTranslatedText('');
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: colors.textMuted,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        <i className="fas fa-trash-alt" style={{ marginRight: 4 }} />
                        Clear
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    placeholder={`Spoken transcript in ${sourceLang.name} will appear here, or you can type here...`}
                    value={spokenTranscript}
                    onChange={(e) => {
                      setSpokenTranscript(e.target.value);
                      performTranslation(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      border: `1px solid ${colors.border}`,
                      borderRadius: radii.md,
                      padding: 10,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: colors.textMain,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: typography.fontFamily,
                      backgroundColor: '#f8fafc',
                    }}
                  />

                  {/* Real-Time Live Interim Speech Bubble */}
                  {interimTranscript && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: radii.md,
                        backgroundColor: '#eff6ff',
                        border: '1px dashed #93c5fd',
                        fontSize: 12,
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <i className="fas fa-microphone" style={{ color: '#2563eb' }} />
                      <span>
                        Hearing now: <strong>"{interimTranscript}..."</strong>
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 6 }}>
                    <button
                      id="btn-perform-translation"
                      type="button"
                      onClick={() => performTranslation(spokenTranscript)}
                      disabled={isTranslating || !spokenTranscript}
                      style={{
                        padding: '6px 12px',
                        borderRadius: radii.md,
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: spokenTranscript ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        opacity: spokenTranscript ? 1 : 0.6,
                      }}
                    >
                      <i className={`fas fa-${isTranslating ? 'spinner fa-spin' : 'sync-alt'}`} />
                      <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel: Translated Output */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: radii.lg,
                    border: '1px solid #10b981',
                    padding: spacing.md,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: shadows.xs,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{targetLang.flag}</span>
                      <span>Translated Output ({targetLang.name})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {translatedText && (
                        <>
                          <button
                            id="btn-listen-audio"
                            type="button"
                            onClick={() => handlePlayAudio(translatedText, targetLang.speechCode)}
                            title="Listen to pronunciation"
                            style={{
                              border: 'none',
                              background: isPlayingAudio ? '#ecfdf5' : 'none',
                              color: '#059669',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '2px 6px',
                              borderRadius: radii.sm,
                            }}
                          >
                            <i className={`fas fa-${isPlayingAudio ? 'stop-circle' : 'volume-up'}`} style={{ marginRight: 4 }} />
                            {isPlayingAudio ? 'Stop' : 'Listen'}
                          </button>

                          <button
                            id="btn-copy-translation"
                            type="button"
                            onClick={() => handleCopyToClipboard(translatedText)}
                            title="Copy translation"
                            style={{
                              border: 'none',
                              background: 'none',
                              color: colors.textMuted,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fas fa-copy" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    placeholder={`Translated clinical text in ${targetLang.name} will appear here automatically...`}
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #a7f3d0',
                      borderRadius: radii.md,
                      padding: 10,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: colors.textMain,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: typography.fontFamily,
                      backgroundColor: '#f0fdf4',
                    }}
                  />

                  {/* Actions to Insert into Note Template */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                    <button
                      id="btn-insert-at-cursor"
                      type="button"
                      onClick={() => {
                        onInsertAtCursor(translatedText);
                        showNotification('Inserted translation at cursor position!', 'success');
                      }}
                      disabled={!translatedText}
                      title="Insert translation at cursor in the rich text editor"
                      style={{
                        padding: '6px 12px',
                        borderRadius: radii.md,
                        border: '1px solid #10b981',
                        background: '#ffffff',
                        color: '#059669',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: translatedText ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        opacity: translatedText ? 1 : 0.6,
                      }}
                    >
                      <i className="fas fa-paste" />
                      <span>Insert at Cursor</span>
                    </button>

                    <button
                      id="btn-append-to-template"
                      type="button"
                      onClick={() => {
                        onAppendToTemplate(`<p>${translatedText}</p>`);
                        showNotification('Appended translation to template!', 'success');
                      }}
                      disabled={!translatedText}
                      title="Add as a new paragraph to the note template"
                      style={{
                        padding: '6px 14px',
                        borderRadius: radii.md,
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: translatedText ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        opacity: translatedText ? 1 : 0.6,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <i className="fas fa-plus" />
                      <span>Append to Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Translate Whole Template */}
          {activeTab === 'full-template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: radii.lg,
                  border: `1px solid ${colors.border}`,
                  padding: spacing.lg,
                  boxShadow: shadows.sm,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                      Translate Full Template into {targetLang.name}
                    </h4>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                      Converts all clinical headings, discharge notes, and instructions into {targetLang.name} while preserving HTML structure.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTranslateTemplate}
                    disabled={isTranslatingTemplate || !currentTemplateHtml}
                    style={{
                      padding: '8px 18px',
                      borderRadius: radii.md,
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: currentTemplateHtml ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                      opacity: currentTemplateHtml ? 1 : 0.6,
                    }}
                  >
                    <i className={`fas fa-${isTranslatingTemplate ? 'spinner fa-spin' : 'globe-americas'}`} />
                    <span>{isTranslatingTemplate ? 'Translating Template...' : `Translate into ${targetLang.name}`}</span>
                  </button>
                </div>

                {/* Preview side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, marginBottom: 6 }}>
                      Current Template Content
                    </div>
                    <div
                      style={{
                        height: 220,
                        overflowY: 'auto',
                        padding: 12,
                        backgroundColor: '#f8fafc',
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                      dangerouslySetInnerHTML={{ __html: currentTemplateHtml || '<p style="color:#94a3b8">Template is currently empty.</p>' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
                      Translated Preview ({targetLang.name})
                    </div>
                    <div
                      style={{
                        height: 220,
                        overflowY: 'auto',
                        padding: 12,
                        backgroundColor: '#f0fdf4',
                        borderRadius: radii.md,
                        border: '1px solid #a7f3d0',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          translatedTemplate ||
                          '<p style="color:#94a3b8">Click "Translate into ' + targetLang.name + '" to generate translation.</p>',
                      }}
                    />
                  </div>
                </div>

                {translatedTemplate && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.md, gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        onAppendToTemplate(translatedTemplate);
                        showNotification('Appended translated template content!', 'success');
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: radii.md,
                        border: '1px solid #10b981',
                        background: '#ffffff',
                        color: '#059669',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <i className="fas fa-plus" />
                      <span>Append Translated Section</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onReplaceTemplate(translatedTemplate);
                        showNotification('Replaced template with translated content!', 'success');
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: radii.md,
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <i className="fas fa-check-circle" />
                      <span>Replace Template Content</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Clinical Phrases Quick Dictation */}
          {activeTab === 'phrases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted }}>Filter:</span>
                {['All', 'General', 'Symptoms', 'Examination', 'Plan', 'Discharge'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPhraseCategory(cat)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: radii.full,
                      border: phraseCategory === cat ? '1px solid #2563eb' : `1px solid ${colors.border}`,
                      backgroundColor: phraseCategory === cat ? '#eff6ff' : '#ffffff',
                      color: phraseCategory === cat ? '#2563eb' : colors.textMain,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Phrases Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.md }}>
                {COMMON_MEDICAL_PHRASES.filter(
                  (p) => phraseCategory === 'All' || p.category === phraseCategory
                ).map((phrase, idx) => (
                  <div
                    key={idx}
                    id={`card-phrase-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSelectPhrase(phrase);
                      setActiveTab('voice');
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: radii.lg,
                      border: `1px solid ${colors.border}`,
                      padding: spacing.md,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: shadows.xs,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = shadows.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = shadows.xs;
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#2563eb',
                          backgroundColor: '#eff6ff',
                          padding: '2px 6px',
                          borderRadius: radii.sm,
                        }}
                      >
                        {phrase.category}
                      </span>
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: colors.textMain, lineHeight: 1.4 }}>
                        {phrase.english}
                      </p>
                    </div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="fas fa-language" />
                      <span>Translate into {targetLang.name} &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: '#ffffff',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            Medical translation supported for 19+ languages with Web Speech Recognition &amp; TTS.
          </div>

          <button
            type="button"
            onClick={() => {
              stopListening();
              stopSpeech();
              onClose();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              backgroundColor: '#f8fafc',
              color: colors.textMain,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>

        {/* CSS Keyframes for Waveform & Mic Pulse */}
        <style>{`
          @keyframes pulseMic {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          @keyframes waveAnim {
            0%, 100% { height: 6px; }
            50% { height: 26px; }
          }
          .wave-bar {
            width: 4px;
            background: #ef4444;
            border-radius: 2px;
            display: inline-block;
            animation: waveAnim 0.9s ease-in-out infinite;
          }
          @keyframes slideDown {
            from { transform: translate(-50%, -16px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};
