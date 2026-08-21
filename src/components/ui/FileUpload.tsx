import React, { useRef, useState } from 'react';
import { colors, radii, spacing, typography } from './tokens';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: FileList) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Global file-picker control (drag-and-drop chrome over the native file
 * input). Purely presentational: it hands the browser's real FileList to
 * `onFilesSelected`, which the caller wires to its existing upload
 * handler/API call exactly as before -- no new upload mechanism is
 * introduced here.
 */
export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, multiple, onFilesSelected, hint, error, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length) onFilesSelected(files);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {label && <label style={{ ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily }}>{label}</label>}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!disabled) handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${error ? colors.danger : dragOver ? colors.primary : colors.border}`,
          borderRadius: radii.md, padding: spacing.lg, textAlign: 'center',
          backgroundColor: dragOver ? colors.infoBg : disabled ? colors.surfaceMuted : colors.surface,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '22px', color: colors.textSubtle, marginBottom: spacing.xs }} />
        <div style={{ ...typography.body, color: colors.textMuted, fontFamily: typography.fontFamily }}>
          Click to browse or drag a file here
        </div>
        {hint && <div style={{ ...typography.helper, color: colors.textSubtle, marginTop: 2 }}>{hint}</div>}
        <input
          ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>
      {error && <span style={{ ...typography.helper, color: colors.danger }}>{error}</span>}
    </div>
  );
};
