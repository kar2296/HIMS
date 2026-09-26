import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, typography, radii, shadows } from '../../components/ui/tokens';
import {
  type PaperSize,
  type Orientation,
  type HeaderStyle,
  type FontSizeScale,
  type PrintPanelSectionConfig,
  type EmrPrintMasterSettings,
  DEFAULT_PRINT_MASTER_SETTINGS,
  PRINT_PRESETS,
  getPrintMasterSettings,
  savePrintMasterSettings,
  resetPrintMasterSettings,
} from '../emr-workspace/emrPrintConfig';

export const EmrPrintMasterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<EmrPrintMasterSettings>(() => getPrintMasterSettings());
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'panels' | 'page' | 'header' | 'footer'>('panels');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [showGuides, setShowGuides] = useState<boolean>(true);

  useEffect(() => {
    setSettings(getPrintMasterSettings());
  }, []);

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleSave = () => {
    savePrintMasterSettings(settings);
    showNotification('Print configuration saved successfully! All EMR printouts will now use these settings.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all print settings, margins, and panel orders to factory defaults?')) {
      const def = resetPrintMasterSettings();
      setSettings({ ...def });
      showNotification('Settings have been reset to factory defaults.');
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = PRINT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    showNotification(`Applied preset: ${preset.name}`);
  };

  const handleTestPrint = () => {
    // Generate a temporary print stylesheet and trigger print
    window.print();
  };

  // Panel reordering and toggling
  const toggleSection = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  };

  const updateSectionTitle = (id: string, customTitle: string) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, customTitle } : s)),
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.sections.length) return;

    const list = [...settings.sections];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Update order numbers
    const updated = list.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSettings((prev) => ({ ...prev, sections: updated }));
  };

  const enableAllSections = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => ({ ...s, enabled })),
    }));
  };

  const sortedSections = useMemo(() => {
    return [...settings.sections].sort((a, b) => a.order - b.order);
  }, [settings.sections]);

  const enabledCount = useMemo(() => {
    return settings.sections.filter((s) => s.enabled).length;
  }, [settings.sections]);

  // Dimension aspect ratios for paper sizes (in mm)
  const paperDimensions = useMemo(() => {
    const dimMap: Record<PaperSize, { w: number; h: number }> = {
      A4: { w: 210, h: 297 },
      A5: { w: 148, h: 210 },
      Letter: { w: 216, h: 279 },
      Legal: { w: 216, h: 356 },
    };
    const base = dimMap[settings.paperSize] || dimMap.A4;
    return settings.orientation === 'portrait' ? base : { w: base.h, h: base.w };
  }, [settings.paperSize, settings.orientation]);

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '16px 24px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Dynamic Print CSS for Test Print / window.print() */}
      <style>{`
        @media print {
          @page {
            size: ${settings.paperSize.toLowerCase()} ${settings.orientation};
            margin: ${settings.topMarginMm}mm ${settings.rightMarginMm}mm ${settings.bottomMarginMm}mm ${settings.leftMarginMm}mm;
          }
          body * {
            visibility: hidden !important;
          }
          #print-master-sheet-preview, #print-master-sheet-preview * {
            visibility: visible !important;
          }
          #print-master-sheet-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: ${settings.contentPaddingMm}mm !important;
            box-shadow: none !important;
            border: 0 !important;
            transform: none !important;
          }
          .print-master-no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {saveToast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 24,
            zIndex: 9999,
            background: '#0f172a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: radii.md,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: 16 }} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div
        className="print-master-no-print"
        style={{
          background: '#fff',
          borderRadius: radii.lg,
          padding: '16px 24px',
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
            }}
          >
            <i className="fa-solid fa-print" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: colors.textMain }}>
                EMR Print Configuration Master
              </h1>
              <span
                style={{
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  textTransform: 'uppercase',
                }}
              >
                Global Print Engine
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
              Configure paper size, stationery headers, margins, padding, and clinical panel order for all consultation sheets & prescriptions.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/emr/masters')}
            style={{
              background: '#f8fafc',
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: radii.md,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: colors.textBody,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Back to Masters
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: radii.md,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa-solid fa-rotate-left" /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleTestPrint}
            style={{
              background: '#0284c7',
              border: 'none',
              borderRadius: radii.md,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fa-solid fa-file-pdf" /> Test Browser Print
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: radii.md,
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            }}
          >
            <i className="fa-solid fa-check" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div
        className="print-master-no-print"
        style={{
          background: '#fff',
          borderRadius: radii.md,
          padding: '12px 20px',
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: colors.textMain }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: colors.primary }} />
          <span>Quick Presets:</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {PRINT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              style={{
                background:
                  settings.paperSize === p.settings.paperSize && settings.headerStyle === p.settings.headerStyle
                    ? '#eff6ff'
                    : '#f8fafc',
                border:
                  settings.paperSize === p.settings.paperSize && settings.headerStyle === p.settings.headerStyle
                    ? '1.5px solid #2563eb'
                    : '1px solid #e2e8f0',
                borderRadius: radii.sm,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color:
                  settings.paperSize === p.settings.paperSize && settings.headerStyle === p.settings.headerStyle
                    ? '#1d4ed8'
                    : colors.textBody,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
              title={p.description}
            >
              <i
                className={
                  p.id.includes('preprinted')
                    ? 'fa-solid fa-newspaper'
                    : p.id.includes('a5')
                    ? 'fa-solid fa-file-medical'
                    : 'fa-solid fa-file-lines'
                }
              />
              {p.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          Active: <strong>{enabledCount} / {settings.sections.length}</strong> panels enabled
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 480px) 1fr',
          gap: spacing.lg,
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Configuration Controls */}
        <div className="print-master-no-print" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {/* Settings Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#e2e8f0',
              borderRadius: radii.md,
              padding: 3,
              gap: 2,
            }}
          >
            {[
              { id: 'panels', label: 'Clinical Panels', icon: 'fa-layer-group', badge: `${enabledCount}/${settings.sections.length}` },
              { id: 'page', label: 'Paper & Margins', icon: 'fa-ruler-combined' },
              { id: 'header', label: 'Header Style', icon: 'fa-heading' },
              { id: 'footer', label: 'Footer & Sign', icon: 'fa-signature' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: radii.sm,
                  fontSize: 12,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? colors.primary : colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: activeTab === tab.id ? shadows.xs : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <i className={`fa-solid ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    style={{
                      background: activeTab === tab.id ? '#dbeafe' : '#cbd5e1',
                      color: activeTab === tab.id ? '#1e40af' : '#475569',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 8,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: CLINICAL PANELS SELECTOR & ORDER */}
          {activeTab === 'panels' && (
            <div
              style={{
                background: '#fff',
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.sm,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${colors.border}`,
                  background: colors.surfaceMuted,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textMain }}>
                    Select Panels to Print
                  </h3>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    Toggle panels on/off, reorder sequence, and customize heading labels.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => enableAllSections(true)}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      color: '#16a34a',
                      cursor: 'pointer',
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => enableAllSections(false)}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      color: '#dc2626',
                      cursor: 'pointer',
                    }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Panel List */}
              <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', padding: '10px 14px' }}>
                {sortedSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      marginBottom: 8,
                      borderRadius: radii.md,
                      background: sec.enabled ? '#fff' : '#f8fafc',
                      border: sec.enabled ? '1px solid #cbd5e1' : '1px dashed #e2e8f0',
                      boxShadow: sec.enabled ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.15s ease',
                      opacity: sec.enabled ? 1 : 0.65,
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      id={`chk-${sec.id}`}
                      checked={sec.enabled}
                      onChange={() => toggleSection(sec.id)}
                      style={{
                        width: 17,
                        height: 17,
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                      }}
                    />

                    {/* Order indicator */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: sec.enabled ? '#e0f2fe' : '#f1f5f9',
                        color: sec.enabled ? '#0369a1' : '#94a3b8',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Details & Title Editor */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <i className={`fa-solid ${sec.icon}`} style={{ fontSize: 13, color: sec.enabled ? '#2563eb' : '#94a3b8' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>{sec.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: '#f1f5f9',
                            color: '#64748b',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sec.category}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={sec.customTitle}
                        disabled={!sec.enabled}
                        onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                        placeholder="Custom print heading"
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          fontSize: 11,
                          border: '1px solid #e2e8f0',
                          borderRadius: 4,
                          background: sec.enabled ? '#fff' : '#f8fafc',
                          color: colors.textBody,
                        }}
                      />
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sec.description}
                      </div>
                    </div>

                    {/* Up / Down Reorder buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        style={{
                          width: 24,
                          height: 20,
                          padding: 0,
                          fontSize: 10,
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 3,
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          color: idx === 0 ? '#cbd5e1' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Move Up"
                      >
                        <i className="fa-solid fa-chevron-up" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedSections.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        style={{
                          width: 24,
                          height: 20,
                          padding: 0,
                          fontSize: 10,
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 3,
                          cursor: idx === sortedSections.length - 1 ? 'not-allowed' : 'pointer',
                          color: idx === sortedSections.length - 1 ? '#cbd5e1' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Move Down"
                      >
                        <i className="fa-solid fa-chevron-down" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PAPER & MARGINS CONFIGURATION */}
          {activeTab === 'page' && (
            <div
              style={{
                background: '#fff',
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.sm,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Paper Size */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 8 }}>
                  Paper Size:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(['A4', 'A5', 'Letter', 'Legal'] as PaperSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSettings((p) => ({ ...p, paperSize: sz }))}
                      style={{
                        padding: '10px 8px',
                        borderRadius: radii.md,
                        border: settings.paperSize === sz ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: settings.paperSize === sz ? '#eff6ff' : '#fff',
                        color: settings.paperSize === sz ? '#1d4ed8' : colors.textBody,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {sz}
                      <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b', marginTop: 2 }}>
                        {sz === 'A4' ? '210×297mm' : sz === 'A5' ? '148×210mm' : sz === 'Letter' ? '8.5×11"' : '8.5×14"'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 8 }}>
                  Page Orientation:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { id: 'portrait', label: 'Portrait (Standard)', icon: 'fa-file' },
                    { id: 'landscape', label: 'Landscape (Wide)', icon: 'fa-file-code' },
                  ].map((ori) => (
                    <button
                      key={ori.id}
                      type="button"
                      onClick={() => setSettings((p) => ({ ...p, orientation: ori.id as Orientation }))}
                      style={{
                        padding: '10px 14px',
                        borderRadius: radii.md,
                        border: settings.orientation === ori.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: settings.orientation === ori.id ? '#eff6ff' : '#fff',
                        color: settings.orientation === ori.id ? '#1d4ed8' : colors.textBody,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <i className={`fa-solid ${ori.icon}`} />
                      {ori.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins Configuration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>
                    Page Margins (mm):
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setSettings((p) => ({ ...p, topMarginMm: 8, bottomMarginMm: 8, leftMarginMm: 8, rightMarginMm: 8 }))}
                      style={{ fontSize: 11, padding: '2px 6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Narrow (8mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((p) => ({ ...p, topMarginMm: 14, bottomMarginMm: 14, leftMarginMm: 14, rightMarginMm: 14 }))}
                      style={{ fontSize: 11, padding: '2px 6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Standard (14mm)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Top Margin */}
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
                      <span>Top Margin</span>
                      <strong style={{ color: '#2563eb' }}>{settings.topMarginMm} mm</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={1}
                      value={settings.topMarginMm}
                      onChange={(e) => setSettings((p) => ({ ...p, topMarginMm: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>
                      {settings.headerStyle === 'without_header' ? 'Critical for pre-printed letterhead gap (e.g. 35-40mm)' : 'Standard top gap'}
                    </div>
                  </div>

                  {/* Bottom Margin */}
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
                      <span>Bottom Margin</span>
                      <strong style={{ color: '#2563eb' }}>{settings.bottomMarginMm} mm</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={1}
                      value={settings.bottomMarginMm}
                      onChange={(e) => setSettings((p) => ({ ...p, bottomMarginMm: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Space for footer notes & signature</div>
                  </div>

                  {/* Left Margin */}
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
                      <span>Left Margin</span>
                      <strong style={{ color: '#2563eb' }}>{settings.leftMarginMm} mm</strong>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      step={1}
                      value={settings.leftMarginMm}
                      onChange={(e) => setSettings((p) => ({ ...p, leftMarginMm: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Left filing/binding edge</div>
                  </div>

                  {/* Right Margin */}
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
                      <span>Right Margin</span>
                      <strong style={{ color: '#2563eb' }}>{settings.rightMarginMm} mm</strong>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      step={1}
                      value={settings.rightMarginMm}
                      onChange={(e) => setSettings((p) => ({ ...p, rightMarginMm: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Right outer page boundary</div>
                  </div>
                </div>
              </div>

              {/* Content Padding & Font Scaling */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
                    <span>Content Padding</span>
                    <strong style={{ color: '#2563eb' }}>{settings.contentPaddingMm} mm</strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={settings.contentPaddingMm}
                    onChange={(e) => setSettings((p) => ({ ...p, contentPaddingMm: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Inner breathing space inside content cards</div>
                </div>

                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 6 }}>
                    Font Scaling
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['compact', 'standard', 'large'] as FontSizeScale[]).map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => setSettings((p) => ({ ...p, fontSizeScale: scale }))}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: 4,
                          border: settings.fontSizeScale === scale ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: settings.fontSizeScale === scale ? '#eff6ff' : '#fff',
                          color: settings.fontSizeScale === scale ? '#1d4ed8' : colors.textBody,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEADER STYLE CONFIGURATION */}
          {activeTab === 'header' && (
            <div
              style={{
                background: '#fff',
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.sm,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {/* Header Mode Radio Buttons */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 8 }}>
                  Header Print Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, headerStyle: 'with_header' }))}
                    style={{
                      padding: '12px 14px',
                      borderRadius: radii.md,
                      border: settings.headerStyle === 'with_header' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: settings.headerStyle === 'with_header' ? '#eff6ff' : '#fff',
                      color: settings.headerStyle === 'with_header' ? '#1d4ed8' : colors.textBody,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fa-solid fa-hospital" />
                      <span>With Hospital Header</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>
                      Prints hospital logo, facility name, department, address, and blue header bar on plain paper.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings((p) => ({
                        ...p,
                        headerStyle: 'without_header',
                        topMarginMm: p.topMarginMm < 25 ? 38 : p.topMarginMm,
                      }))
                    }
                    style={{
                      padding: '12px 14px',
                      borderRadius: radii.md,
                      border: settings.headerStyle === 'without_header' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: settings.headerStyle === 'without_header' ? '#eff6ff' : '#fff',
                      color: settings.headerStyle === 'without_header' ? '#1d4ed8' : colors.textBody,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fa-solid fa-file-blank" />
                      <span>Without Header (Pre-Printed)</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>
                      Omits digital header; leaves configured top margin gap for pre-printed letterhead stationery pads.
                    </span>
                  </button>
                </div>
              </div>

              {/* Informational callout for without header */}
              {settings.headerStyle === 'without_header' && (
                <div
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: radii.md,
                    padding: '12px 14px',
                    display: 'flex',
                    gap: 10,
                    fontSize: 12,
                    color: '#92400e',
                  }}
                >
                  <i className="fa-solid fa-circle-info" style={{ fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Pre-Printed Stationery Mode Active</strong>
                    <div style={{ marginTop: 2 }}>
                      Digital header is hidden. Current Top Margin is set to <strong>{settings.topMarginMm}mm</strong> to match your physical pre-printed letterhead height.
                    </div>
                  </div>
                </div>
              )}

              {/* Header Details (Enabled when With Header) */}
              <div style={{ opacity: settings.headerStyle === 'with_header' ? 1 : 0.45, pointerEvents: settings.headerStyle === 'with_header' ? 'auto' : 'none' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 4 }}>
                  Hospital / Facility Name:
                </label>
                <input
                  type="text"
                  value={settings.customHospitalTitle || ''}
                  onChange={(e) => setSettings((p) => ({ ...p, customHospitalTitle: e.target.value }))}
                  placeholder="e.g. SHUVADARSINI HOSPITAL & RESEARCH CENTRE"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    marginBottom: 12,
                  }}
                />

                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 4 }}>
                  Sub-heading / Document Title:
                </label>
                <input
                  type="text"
                  value={settings.customSubTitle || ''}
                  onChange={(e) => setSettings((p) => ({ ...p, customSubTitle: e.target.value }))}
                  placeholder="e.g. Outpatient Consultation & Clinical Assessment Record"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    marginBottom: 12,
                  }}
                />

                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.showFacilityLogo}
                      onChange={(e) => setSettings((p) => ({ ...p, showFacilityLogo: e.target.checked }))}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Print Facility Logo</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.showHeaderDivider}
                      onChange={(e) => setSettings((p) => ({ ...p, showHeaderDivider: e.target.checked }))}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Show Blue Header Divider</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOOTER & SIGNATURE CONFIGURATION */}
          {activeTab === 'footer' && (
            <div
              style={{
                background: '#fff',
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.sm,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 6 }}>
                  Doctor Signature Line:
                </label>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.showDoctorSignature}
                      onChange={(e) => setSettings((p) => ({ ...p, showDoctorSignature: e.target.checked }))}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Include Authorized Signature Block</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'right', label: 'Right Aligned', icon: 'fa-align-right' },
                    { id: 'dual', label: 'Doctor & Patient Dual', icon: 'fa-user-doctor' },
                    { id: 'simple', label: 'Simple Line', icon: 'fa-signature' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      disabled={!settings.showDoctorSignature}
                      onClick={() => setSettings((p) => ({ ...p, signatureStyle: st.id as any }))}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: settings.signatureStyle === st.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: settings.signatureStyle === st.id ? '#eff6ff' : '#fff',
                        color: settings.signatureStyle === st.id ? '#1d4ed8' : colors.textBody,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <i className={`fa-solid ${st.icon}`} style={{ display: 'block', marginBottom: 4 }} />
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, display: 'block', marginBottom: 4 }}>
                  Custom Footer Note / Notice:
                </label>
                <input
                  type="text"
                  value={settings.customFooterNote || ''}
                  onChange={(e) => setSettings((p) => ({ ...p, customFooterNote: e.target.value }))}
                  placeholder="e.g. Keep this document safe for future reference and follow-up consultations."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.showPageNumbers}
                    onChange={(e) => setSettings((p) => ({ ...p, showPageNumbers: e.target.checked }))}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>Show Page Numbers & Timestamp</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.showBarcode}
                    onChange={(e) => setSettings((p) => ({ ...p, showBarcode: e.target.checked }))}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>Show UHID Barcode on Sheet</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Live Visual Sheet Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {/* Preview Toolbar */}
          <div
            className="print-master-no-print"
            style={{
              background: '#fff',
              borderRadius: radii.md,
              padding: '10px 16px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: colors.textMain }}>
              <i className="fa-solid fa-eye" style={{ color: colors.primary }} />
              <span>Real-Time Print Sheet Preview</span>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                }}
              >
                {settings.paperSize} ({paperDimensions.w}×{paperDimensions.h}mm) &bull; {settings.orientation}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textMuted, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  style={{ accentColor: '#2563eb' }}
                />
                <span>Margin Guides</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(70, z - 10))}
                  style={{ padding: '3px 8px', fontSize: 11, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(130, z + 10))}
                  style={{ padding: '3px 8px', fontSize: 11, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Scaled Sheet Container */}
          <div
            style={{
              background: '#475569',
              borderRadius: radii.lg,
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
              overflowX: 'auto',
            }}
          >
            {/* The Actual Sheet */}
            <div
              id="print-master-sheet-preview"
              style={{
                width: `${paperDimensions.w * 3.4}px`,
                minHeight: `${paperDimensions.h * 3.4}px`,
                backgroundColor: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                color: '#0f172a',
                fontFamily: 'Inter, -apple-system, sans-serif',
                fontSize:
                  settings.fontSizeScale === 'compact' ? '11px' : settings.fontSizeScale === 'large' ? '14px' : '12.5px',
                lineHeight: 1.45,
                position: 'relative',
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
                paddingTop: `${settings.topMarginMm * 3.4}px`,
                paddingBottom: `${settings.bottomMarginMm * 3.4}px`,
                paddingLeft: `${settings.leftMarginMm * 3.4}px`,
                paddingRight: `${settings.rightMarginMm * 3.4}px`,
                boxSizing: 'border-box',
              }}
            >
              {/* Margin Guide Outlines */}
              {showGuides && (
                <div
                  className="print-master-no-print"
                  style={{
                    position: 'absolute',
                    top: `${settings.topMarginMm * 3.4}px`,
                    bottom: `${settings.bottomMarginMm * 3.4}px`,
                    left: `${settings.leftMarginMm * 3.4}px`,
                    right: `${settings.rightMarginMm * 3.4}px`,
                    border: '1px dashed #38bdf8',
                    pointerEvents: 'none',
                    opacity: 0.7,
                    zIndex: 10,
                  }}
                >
                  <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 9, color: '#0284c7', background: '#e0f2fe', padding: '1px 4px', borderRadius: 2 }}>
                    Printable Content Boundary ({settings.topMarginMm}mm top, {settings.leftMarginMm}mm left)
                  </span>
                </div>
              )}

              {/* Inner Content Area */}
              <div
                style={{
                  padding: `${settings.contentPaddingMm * 3.4}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header Style Render */}
                {settings.headerStyle === 'with_header' ? (
                  <div
                    style={{
                      textAlign: 'center',
                      borderBottom: settings.showHeaderDivider ? '2.5px solid #2563eb' : 'none',
                      paddingBottom: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {settings.showFacilityLogo && (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb',
                            fontSize: 18,
                            fontWeight: 800,
                          }}
                        >
                          <i className="fa-solid fa-hospital-user" />
                        </div>
                      )}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2
                          style={{
                            margin: '0 0 2px 0',
                            fontSize: settings.paperSize === 'A5' ? '16px' : '20px',
                            fontWeight: 800,
                            color: '#1e3a8a',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {settings.customHospitalTitle || 'SHUVADARSINI HOSPITAL & DIABETIC CARE'}
                        </h2>
                        <div style={{ fontSize: settings.paperSize === 'A5' ? '10px' : '11px', color: '#475569' }}>
                          {settings.customSubTitle || 'Outpatient Consultation & Clinical Assessment Record'}
                        </div>
                      </div>
                      {settings.showBarcode && (
                        <div style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>
                          <i className="fa-solid fa-barcode" style={{ fontSize: 28, color: '#0f172a', display: 'block' }} />
                          <span>*UHID-002847*</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 4,
                      padding: '8px 12px',
                      textAlign: 'center',
                      fontSize: 11,
                      color: '#64748b',
                      marginBottom: 6,
                    }}
                  >
                    <i className="fa-solid fa-print" style={{ marginRight: 6 }} />
                    <strong>Pre-Printed Stationery Gap:</strong> Digital header suppressed. Content starts directly at {settings.topMarginMm}mm from sheet top.
                  </div>
                )}

                {/* Render Enabled Clinical Panels in Configured Order */}
                {sortedSections
                  .filter((sec) => sec.enabled)
                  .map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 6 }}>
                      {/* Section Title Header */}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: settings.paperSize === 'A5' ? '11px' : '12px',
                          color: '#1e40af',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '3px',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <i className={`fa-solid ${sec.icon}`} style={{ fontSize: 11, opacity: 0.8 }} />
                        <span>{sec.customTitle || sec.defaultTitle}</span>
                      </div>

                      {/* Mock Data based on panel category and id */}
                      {sec.id === 'demographics' && (
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 10px', backgroundColor: '#f8fafc' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 12px', fontSize: '11px' }}>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', display: 'block' }}>Patient Name</span>
                              <strong>RAJESH SHARMA</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', display: 'block' }}>UHID / MRN</span>
                              <strong style={{ fontFamily: 'monospace' }}>MRN-847291</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', display: 'block' }}>Age / Gender</span>
                              <strong>42 Yrs / Male</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase', display: 'block' }}>Visit Date</span>
                              <strong>27-Sep-2026 10:30 AM</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {sec.id === 'vitals' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: '11px', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px' }}>
                          <div><span style={{ color: '#64748b' }}>BP:</span> <strong>120/80 mmHg</strong></div>
                          <div><span style={{ color: '#64748b' }}>Pulse:</span> <strong>76 bpm</strong></div>
                          <div><span style={{ color: '#64748b' }}>Temp:</span> <strong>98.4 °F</strong></div>
                          <div><span style={{ color: '#64748b' }}>SpO2:</span> <strong>99 %</strong></div>
                          <div><span style={{ color: '#64748b' }}>Weight:</span> <strong>68 kg</strong></div>
                          <div><span style={{ color: '#64748b' }}>BMI:</span> <strong>23.5 kg/m²</strong></div>
                        </div>
                      )}

                      {sec.id === 'allergies' && (
                        <div style={{ fontSize: '11px', color: '#16a34a', padding: '2px 4px' }}>
                          <strong>No Known Drug Allergies (NKDA) verified.</strong>
                        </div>
                      )}

                      {sec.id === 'complaints' && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '11px' }}>
                          <li><strong>Fever and mild dry cough</strong> &bull; Duration: 3 Days &bull; Low grade, intermittent</li>
                          <li><strong>Throat irritation and body ache</strong> &bull; Duration: 2 Days</li>
                        </ul>
                      )}

                      {sec.id === 'hpi' && (
                        <div style={{ fontSize: '11px', color: '#334155', background: '#fff', padding: '2px 4px' }}>
                          Patient presents with 3-day history of intermittent low-grade fever with throat irritation. No history of chills, shortness of breath, or chest pain.
                        </div>
                      )}

                      {sec.id === 'diagnoses' && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '11px' }}>
                          <li><strong>[J06.9] Acute upper respiratory tract infection, unspecified</strong> &bull; Primary</li>
                          <li><strong>[I10] Essential (primary) hypertension</strong> &bull; Stable, on medication</li>
                        </ul>
                      )}

                      {sec.id === 'conditions' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          Type 2 Diabetes Mellitus (Diagnosed 2021, controlled) &bull; Primary Hypertension (Controlled)
                        </div>
                      )}

                      {sec.id === 'prescriptions' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '5%' }}>#</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '38%' }}>Medicine</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '15%' }}>Dose</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '18%' }}>Frequency</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '14%' }}>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '3px 6px' }}>1</td>
                              <td style={{ padding: '3px 6px', fontWeight: 600 }}>Paracetamol 650mg Tab</td>
                              <td style={{ padding: '3px 6px' }}>1 Tab</td>
                              <td style={{ padding: '3px 6px' }}>TDS (After food)</td>
                              <td style={{ padding: '3px 6px' }}>3 Days</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '3px 6px' }}>2</td>
                              <td style={{ padding: '3px 6px', fontWeight: 600 }}>Levocetirizine 5mg Tab</td>
                              <td style={{ padding: '3px 6px' }}>1 Tab</td>
                              <td style={{ padding: '3px 6px' }}>HS (At bedtime)</td>
                              <td style={{ padding: '3px 6px' }}>5 Days</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {sec.id === 'orders' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '20%' }}>Test Code</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px' }}>Investigation / Service</th>
                              <th style={{ textAlign: 'left', padding: '3px 6px', width: '30%' }}>Department</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '3px 6px', fontFamily: 'monospace' }}>LAB-CBC-01</td>
                              <td style={{ padding: '3px 6px', fontWeight: 600 }}>Complete Blood Count (CBC with ESR)</td>
                              <td style={{ padding: '3px 6px', color: '#475569' }}>Clinical Pathology</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {sec.id === 'examination' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          General: Conscious, oriented, febrile. Throat: Pharyngeal congestion (+), tonsils not enlarged. Chest: Bilateral clear air entry, no ronchi. CVS: S1 S2 heard, no murmurs.
                        </div>
                      )}

                      {sec.id === 'history' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          Past Medical: Known hypertensive for 4 years on Telmisartan 40mg. Non-smoker, non-alcoholic.
                        </div>
                      )}

                      {sec.id === 'procedures' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          Nebulization with Salbutamol administered in OP procedure room at 10:45 AM.
                        </div>
                      )}

                      {sec.id === 'treatment_plan' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          Supportive hydration, warm saline gargles twice daily, continue regular antihypertensive medication.
                        </div>
                      )}

                      {sec.id === 'advice' && (
                        <div style={{ fontSize: '11px', color: '#334155', padding: '2px 4px' }}>
                          Adequate rest, drink warm fluids. Report to ER immediately if high fever persists &gt; 102°F or breathlessness occurs.
                        </div>
                      )}

                      {sec.id === 'followup' && (
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e3a8a', padding: '2px 4px' }}>
                          Review after 5 days on 02-Oct-2026 with CBC report, or SOS if symptoms worsen.
                        </div>
                      )}

                      {sec.id === 'signature' && settings.showDoctorSignature && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              settings.signatureStyle === 'dual' ? 'space-between' : 'flex-end',
                            marginTop: '20px',
                            paddingTop: '10px',
                            borderTop: '1px dashed #cbd5e1',
                          }}
                        >
                          {settings.signatureStyle === 'dual' && (
                            <div style={{ textAlign: 'center', width: '160px' }}>
                              <div style={{ borderBottom: '1px solid #94a3b8', height: '24px', marginBottom: '3px' }} />
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Patient / Attendant Signature</div>
                            </div>
                          )}
                          <div style={{ textAlign: 'center', width: '180px' }}>
                            <div style={{ borderBottom: '1px solid #0f172a', height: '24px', marginBottom: '3px' }} />
                            <strong style={{ fontSize: '11px', display: 'block' }}>Dr. A. K. Rath, MD</strong>
                            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Reg No: MCI-2018-94819</div>
                            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Consulting Physician</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Footer Notes & Page Number */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '10px',
                    color: '#64748b',
                  }}
                >
                  <div>{settings.customFooterNote || 'MediFlow EMR Consultation Record'}</div>
                  {settings.showPageNumbers && <div>Page 1 of 1 &bull; 27-Sep-2026</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
