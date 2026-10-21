import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quill from 'quill';

// Import Quill CSS (will be included in the Vite bundle)
import 'quill/dist/quill.snow.css';

import { colors, radii, shadows } from '../components/ui/tokens';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  isSpeechRecognitionSupported,
  ContinuousSpeechSession,
} from '../services/voiceTranslatorService';

interface RichTextEditorProps {
  /** The current HTML content (two-way bound via AngularJS) */
  richtext?: string;
  /** Optional initial content passed from AngularJS */
  initialContent?: string;
  /** Called whenever the editor content changes */
  onContentChange?: (html: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Height of the editor body (default 350px) */
  height?: number | string;
  /** Optional HTML payload to insert at cursor */
  insertHtml?: string;
  /** Callback fired after insertHtml is processed */
  onInsertHtmlDone?: () => void;
  /** Whether the editor is read-only */
  readonly?: boolean;
}

/**
 * RichTextEditor — a modern Word-like rich-text editor built on Quill v2.
 * Includes Voice-to-Text capabilities (5+ min uninterrupted continuous listening) and HTML Source editing.
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  richtext = '',
  initialContent,
  onContentChange,
  insertHtml,
  onInsertHtmlDone,
  placeholder = 'Start typing or use the microphone to dictate…',
  height = 380,
  readonly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  // Track last value sent out to avoid infinite loops
  const lastEmittedRef = useRef<string>('');
  // Flag to block the watch effect while the user is typing
  const isUserEditing = useRef<boolean>(false);

  // Voice Recording & 5+ Min Continuous Session State
  const [isRecording, setIsRecording] = useState(false);
  const speechSessionRef = useRef<ContinuousSpeechSession | null>(null);
  const [voiceElapsed, setVoiceElapsed] = useState<string>('00:00');
  const [voiceDurationMins, setVoiceDurationMins] = useState<number>(5);

  const [selectedVoiceLang, setSelectedVoiceLang] = useState<SupportedLanguage>(
    SUPPORTED_LANGUAGES.find((l) => l.code === 'en-IN') || SUPPORTED_LANGUAGES[0]
  );
  const selectedVoiceLangRef = useRef<SupportedLanguage>(selectedVoiceLang);
  selectedVoiceLangRef.current = selectedVoiceLang;

  const [voiceInterim, setVoiceInterim] = useState<string>('');
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string>('');

  // HTML Source Mode State
  const [isSourceMode, setIsSourceMode] = useState(false);
  const sourceTextRef = useRef<string>('');

  /* ─────────────── Stop Speech Recognition ─────────────── */
  const stopRecording = useCallback(() => {
    if (speechSessionRef.current) {
      speechSessionRef.current.stop();
      speechSessionRef.current = null;
    }
    setIsRecording(false);
    setVoiceInterim('');
    setVoiceStatusText('');
  }, []);

  /* ─────────────── Voice to Text Toggle (5+ Min Continuous) ─────────────── */
  const toggleRecording = useCallback(async () => {
    if (!isSpeechRecognitionSupported()) {
      const msg =
        'Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.';
      setVoiceError(msg);
      return;
    }

    // If currently recording, stop it
    if (speechSessionRef.current && speechSessionRef.current.isActive) {
      stopRecording();
      return;
    }

    setVoiceError('');
    setVoiceStatusText(`Starting continuous dictation (5+ mins active)...`);

    const session = new ContinuousSpeechSession({
      lang: selectedVoiceLangRef.current.speechCode,
      minDurationSeconds: voiceDurationMins * 60,
      onInterimText: (interim) => {
        setVoiceInterim(interim);
      },
      onFinalText: (finalText) => {
        if (quillRef.current) {
          isUserEditing.current = true;
          const quill = quillRef.current;
          quill.focus();

          const selection = quill.getSelection(true);
          const insertIndex =
            selection && typeof selection.index === 'number'
              ? selection.index
              : Math.max(0, quill.getLength() - 1);

          const prevChar = insertIndex > 0 ? quill.getText(insertIndex - 1, 1) : '';
          const prefix = insertIndex > 0 && prevChar !== ' ' && prevChar !== '\n' ? ' ' : '';
          const formatted = prefix + finalText.charAt(0).toUpperCase() + finalText.slice(1) + ' ';

          quill.insertText(insertIndex, formatted);
          quill.setSelection(insertIndex + formatted.length, 0);

          const newHtml = quill.getSemanticHTML();
          lastEmittedRef.current = newHtml;
          onContentChange?.(newHtml);

          setVoiceInterim('');
          setVoiceStatusText('Spoken words added to note');

          setTimeout(() => {
            isUserEditing.current = false;
          }, 50);
        }
      },
      onTick: (_sec, formattedTime) => {
        setVoiceElapsed(formattedTime);
      },
      onStatusChange: (status) => {
        setIsRecording(status.isActive);
        setVoiceStatusText(status.statusText);
        if (status.errorText) {
          setVoiceError(status.errorText);
        }
      },
    });

    const startRes = await session.start();
    if (!startRes.success) {
      setVoiceError(startRes.error || 'Could not start microphone');
      setVoiceStatusText('');
      return;
    }

    speechSessionRef.current = session;
    setIsRecording(true);
  }, [stopRecording, voiceDurationMins, onContentChange]);

  // Stable ref for toolbar handlers so Quill never holds stale closures
  const toggleRecordingRef = useRef(toggleRecording);
  toggleRecordingRef.current = toggleRecording;

  /* ─────────────── Source Mode Toggle ─────────────── */
  const toggleSourceMode = useCallback(() => {
    setIsSourceMode((prev) => {
      const nextMode = !prev;
      if (nextMode) {
        // Switching TO source mode: grab latest HTML from Quill
        sourceTextRef.current = quillRef.current?.getSemanticHTML() || '';
      } else {
        // Switching FROM source mode: paste HTML back to Quill
        isUserEditing.current = true;
        quillRef.current?.clipboard.dangerouslyPasteHTML(sourceTextRef.current);
        onContentChange?.(sourceTextRef.current);
        lastEmittedRef.current = sourceTextRef.current;
        setTimeout(() => {
          isUserEditing.current = false;
        }, 0);
      }
      return nextMode;
    });
  }, [onContentChange]);

  const toggleSourceModeRef = useRef(toggleSourceMode);
  toggleSourceModeRef.current = toggleSourceMode;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSessionRef.current) {
        speechSessionRef.current.stop();
        speechSessionRef.current = null;
      }
    };
  }, []);


  /* ─────────────── Mount Quill once ─────────────── */
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const icons = Quill.import('ui/icons') as any;
    // 1. Register custom voice icon
    icons['voice'] = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>`;

    // 2. Register custom html icon
    icons['html'] = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>`;

    // 3. Setup toolbar configuration
    const toolbarOptions = {
      container: [
        [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }, { header: 3 }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }, { align: [] }],
        ['link', 'image', 'video', 'formula'],
        ['voice', 'html'], // Custom voice and html buttons
        ['clean'],
      ],
      handlers: {
        voice: function (this: any) {
          toggleRecordingRef.current();
        },
        html: function (this: any) {
          toggleSourceModeRef.current();
        },
      },
    };

    const editorDiv = document.createElement('div');
    containerRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: 'snow',
      modules: { toolbar: toolbarOptions },
      placeholder,
      readOnly: readonly,
    });

    quillRef.current = quill;

    // Set initial content
    const content = initialContent ?? richtext;
    if (content) {
      quill.clipboard.dangerouslyPasteHTML(content);
      lastEmittedRef.current = content;
    }

    // Listen for changes and emit via callback
    quill.on('text-change', () => {
      isUserEditing.current = true;
      const html = quill.getSemanticHTML();
      if (html !== lastEmittedRef.current) {
        lastEmittedRef.current = html;
        onContentChange?.(html);
      }
      // Reset flag after AngularJS digest has had time to run
      setTimeout(() => {
        isUserEditing.current = false;
      }, 0);
    });

    return () => {
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Sync external `richtext` prop changes into the editor ───── */
  useEffect(() => {
    if (isSourceMode) return; // Do not overwrite source mode manually yet

    const quill = quillRef.current;
    if (!quill || isUserEditing.current) return;
    if (richtext === lastEmittedRef.current) return;

    // Only update if the content actually changed externally
    const currentHtml = quill.getSemanticHTML();
    if (richtext !== currentHtml) {
      const selection = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(richtext ?? '');
      lastEmittedRef.current = richtext ?? '';
      if (selection) {
        quill.setSelection(selection);
      }
    }
  }, [richtext, isSourceMode]);

  /* ─── Sync external `insertHtml` prop into the editor ───── */
  useEffect(() => {
    if (!insertHtml) return;
    const quill = quillRef.current;
    if (!quill) return;

    if (isSourceMode) {
      // In source mode, just append the HTML text at the end
      sourceTextRef.current += insertHtml;
      onContentChange?.(sourceTextRef.current);
      lastEmittedRef.current = sourceTextRef.current;
    } else {
      // In rich text mode, insert at cursor
      const selection = quill.getSelection() || { index: quill.getLength(), length: 0 };
      quill.clipboard.dangerouslyPasteHTML(selection.index, insertHtml);
      // Wait for mutation observers to catch up
      setTimeout(() => {
         const newHtml = quill.getSemanticHTML();
         lastEmittedRef.current = newHtml;
         onContentChange?.(newHtml);
      }, 0);
    }

    if (onInsertHtmlDone) {
      // Clear the trigger after processing
      setTimeout(() => onInsertHtmlDone(), 10);
    }
  }, [insertHtml, isSourceMode, onContentChange, onInsertHtmlDone]);

  /* ─── Sync readonly prop ───────────────────────────────────────── */
  useEffect(() => {
    quillRef.current?.enable(!readonly);
  }, [readonly]);

  /* ─────────────── Styles ──────────────────────────────────────── */
  const editorHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', border: `1px solid ${colors.border}`, borderRadius: radii.lg, overflow: 'hidden', boxShadow: shadows.sm, background: colors.surface }}>
      {/* Live Voice Dictation Status Banner */}
      {isRecording && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            fontSize: 12,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 999,
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.04em',
                animation: 'pulse-recording 1.5s infinite',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffffff' }} />
              LIVE DICTATION
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '2px 8px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 11,
                fontFamily: 'monospace',
                border: '1px solid #fca5a5',
              }}
              title="Continuous dictation stays active for minimum 5 minutes without dropping on pauses"
            >
              <i className="fas fa-clock" style={{ fontSize: 10 }} />
              {voiceElapsed} / {voiceDurationMins}m+
            </span>

            <span style={{ color: '#991b1b', fontWeight: 600 }}>
              {voiceInterim ? (
                <span>
                  Hearing: <em style={{ color: '#b91c1c' }}>"{voiceInterim}"</em>
                </span>
              ) : (
                voiceStatusText || 'Listening... Speak into microphone'
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#7f1d1d', fontWeight: 500, fontSize: 11 }}>Limit:</span>
            <select
              value={voiceDurationMins}
              onChange={(e) => setVoiceDurationMins(Number(e.target.value))}
              title="Target session duration"
              style={{
                height: 26,
                borderRadius: 4,
                border: '1px solid #fca5a5',
                backgroundColor: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                color: '#7f1d1d',
                padding: '0 4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={5}>Min 5 mins</option>
              <option value={10}>Min 10 mins</option>
              <option value={15}>Min 15 mins</option>
              <option value={30}>Min 30 mins</option>
            </select>

            <span style={{ color: '#7f1d1d', fontWeight: 500, fontSize: 11 }}>Lang:</span>
            <select
              value={selectedVoiceLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) {
                  setSelectedVoiceLang(found);
                  if (speechSessionRef.current) {
                    speechSessionRef.current.setLanguage(found.speechCode);
                  }
                }
              }}
              style={{
                height: 26,
                borderRadius: 4,
                border: '1px solid #fca5a5',
                backgroundColor: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                color: '#1f2937',
                padding: '0 6px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={stopRecording}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 4,
                border: '1px solid #ef4444',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done Dictating
            </button>
          </div>
        </div>
      )}

      {/* Voice Error Banner */}
      {voiceError && !isRecording && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            fontSize: 12,
            color: '#92400e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-exclamation-triangle" style={{ color: '#d97706' }} />
            <span>{voiceError}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceError('')}
            style={{
              border: 'none',
              background: 'none',
              color: '#b45309',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        style={{ flex: 1 }}
        className={`rte-quill-host ${isRecording ? 'is-recording' : ''}`}
      />

      {/* HTML Source Mode Textarea */}
      {isSourceMode && (
        <textarea
          style={{
            width: '100%',
            height: editorHeight,
            border: 'none',
            borderTop: `1px solid ${colors.border}`,
            padding: '16px 20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            background: '#1e1e1e',
            color: '#d4d4d4',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          defaultValue={sourceTextRef.current}
          onChange={(e) => {
            sourceTextRef.current = e.target.value;
            // Emit change so Angular models stay in sync even while typing in source
            onContentChange?.(e.target.value);
            lastEmittedRef.current = e.target.value;
          }}
        />
      )}

      {/* Inline style overrides to set editor body height & animations */}
      <style>{`
        .rte-quill-host .ql-container {
          height: ${editorHeight};
          font-size: 14px;
          font-family: 'Segoe UI', Arial, sans-serif;
          border: none !important;
          border-top: 1px solid #e5e7eb !important;
        }
        .rte-quill-host .ql-toolbar {
          background: #f8f9fa;
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 8px 12px;
          flex-wrap: wrap;
        }
        .rte-quill-host .ql-toolbar button,
        .rte-quill-host .ql-toolbar .ql-picker {
          color: #374151;
        }
        .rte-quill-host .ql-toolbar button:hover,
        .rte-quill-host .ql-toolbar .ql-picker:hover {
          color: #2563eb;
        }
        .rte-quill-host .ql-editor {
          min-height: ${editorHeight};
          padding: 16px 20px;
          line-height: 1.7;
        }
        .rte-quill-host .ql-editor p {
          margin-bottom: 6px;
        }
        .rte-quill-host .ql-snow .ql-stroke {
          stroke: #6b7280;
        }
        .rte-quill-host .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rte-quill-host .ql-snow .ql-toolbar button:focus .ql-stroke {
          stroke: #2563eb;
        }

        /* HTML Toggle Active State */
        ${isSourceMode ? `
        .rte-quill-host .ql-container {
          display: none !important;
        }
        .rte-quill-host .ql-toolbar button.ql-html {
          color: #2563eb !important;
          background: rgba(37, 99, 235, 0.1);
          border-radius: 4px;
        }
        .rte-quill-host .ql-toolbar button.ql-html .ql-stroke {
          stroke: #2563eb !important;
        }
        .rte-quill-host .ql-toolbar button:not(.ql-html) {
          opacity: 0.4;
          pointer-events: none;
        }
        .rte-quill-host .ql-toolbar .ql-picker {
          opacity: 0.4;
          pointer-events: none;
        }
        ` : ''}

        /* Voice Button Customizations */
        .rte-quill-host .ql-toolbar button.ql-voice,
        .rte-quill-host .ql-toolbar button.ql-html {
          width: 32px;
          position: relative;
        }
        .rte-quill-host.is-recording .ql-toolbar button.ql-voice {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }
        .rte-quill-host.is-recording .ql-toolbar button.ql-voice .ql-stroke {
          stroke: #ef4444 !important;
        }
        .rte-quill-host.is-recording .ql-toolbar button.ql-voice::after {
          content: '';
          position: absolute;
          top: 3px;
          right: 3px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse-recording 1.5s infinite;
        }
        @keyframes pulse-recording {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
