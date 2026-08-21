import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Tabs, type TabItem } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { colors, spacing, radii, typography } from '../components/ui/tokens';

// Configuration interface for each module
export interface ModuleBarcodeConfig {
  printerName: string;
  autoPrintOnAction: boolean;
  printMethod: 'browser' | 'thermal_raw' | 'print_service';
  preset: '50x30' | '38x25' | '74x38' | '100x50' | 'custom';
  widthMm: number;
  heightMm: number;
  fontSize: 'small' | 'medium' | 'large';
  borderStyle: 'solid' | 'dashed' | 'none';
  alignment: 'left' | 'center';
  barcodeHeight: number;
  barcodeType: 'CODE128' | 'CODE39' | 'QR';
  customHeader: string;
  // Field toggles
  fields: Record<string, boolean>;
}

export interface MasterBarcodeSettings {
  registration: ModuleBarcodeConfig;
  labSample: ModuleBarcodeConfig;
  inventory: ModuleBarcodeConfig;
}

const COMMON_PRINTER_LIST = [
  'Zebra ZD220 / ZD230 (Thermal)',
  'Zebra GK420t / GX430t',
  'TSC TTP-244 Pro / TE200',
  'TSC DA210 / DA220 Direct Thermal',
  'Godex G500 / RT700',
  'Citizen CL-S621',
  'Argox CP-2140 / OS-214',
  'Dymo LabelWriter 450',
  'Bixolon SLP-TX400',
  'Generic / System Default Printer',
];

// Presentational option lists for the design-system Select controls below --
// same option data/values the legacy <option> elements rendered, just moved
// out of JSX. No new values were introduced.
const PRINTER_OPTIONS: SelectOption[] = [
  ...COMMON_PRINTER_LIST.map((p) => ({ value: p, label: p })),
  { value: 'CUSTOM', label: '-- Custom Printer Name --' },
];

const PRESET_OPTIONS: SelectOption[] = [
  { value: '50x30', label: '50mm × 30mm (Standard Thermal)' },
  { value: '38x25', label: '38mm × 25mm (Compact Vial / Tube)' },
  { value: '74x38', label: '74mm × 38mm (Medium Card / Tag)' },
  { value: '100x50', label: '100mm × 50mm (Large IP Folder Tag)' },
  { value: 'custom', label: 'Custom Dimensions' },
];

const FONT_SIZE_OPTIONS: SelectOption[] = [
  { value: 'small', label: 'Small (Compact)' },
  { value: 'medium', label: 'Medium (Standard)' },
  { value: 'large', label: 'Large (High-Visibility)' },
];

const BORDER_STYLE_OPTIONS: SelectOption[] = [
  { value: 'solid', label: 'Solid Line' },
  { value: 'dashed', label: 'Dashed Line' },
  { value: 'none', label: 'No Border' },
];

const MODULE_TAB_ITEMS: TabItem[] = [
  { key: 'registration', label: '1. Registration & Patient ID Label' },
  { key: 'labSample', label: '2. Lab Sample Collection Label' },
  { key: 'inventory', label: '3. Inventory & Pharmacy Batch Label' },
];

export const DEFAULT_MASTER_SETTINGS: MasterBarcodeSettings = {
  registration: {
    printerName: 'Zebra ZD220 / ZD230 (Thermal)',
    autoPrintOnAction: true,
    printMethod: 'browser',
    preset: '50x30',
    widthMm: 50,
    heightMm: 30,
    fontSize: 'medium',
    borderStyle: 'solid',
    alignment: 'left',
    barcodeHeight: 36,
    barcodeType: 'CODE128',
    customHeader: '',
    fields: {
      showHospitalName: true,
      showMRN: true,
      showPatientName: true,
      showAgeGender: true,
      showVisitDate: true,
      showDoctorName: true,
      showDepartment: false,
      showTokenNo: true,
      showMobile: false,
      showAddress: false,
      showBarcodeGraphic: true,
      showBarcodeText: true,
    },
  },
  labSample: {
    printerName: 'TSC TTP-244 Pro / TE200',
    autoPrintOnAction: true,
    printMethod: 'browser',
    preset: '38x25',
    widthMm: 38,
    heightMm: 25,
    fontSize: 'small',
    borderStyle: 'solid',
    alignment: 'left',
    barcodeHeight: 28,
    barcodeType: 'CODE128',
    customHeader: 'CENTRAL CLINICAL LAB',
    fields: {
      showLabHeader: true,
      showSampleId: true,
      showSampleType: true,
      showTestNames: true,
      showPatientName: true,
      showMRN: true,
      showCollectionDate: true,
      showContainerColor: true,
      showBarcodeGraphic: true,
      showBarcodeText: true,
    },
  },
  inventory: {
    printerName: 'Godex G500 / RT700',
    autoPrintOnAction: false,
    printMethod: 'browser',
    preset: '50x30',
    widthMm: 50,
    heightMm: 30,
    fontSize: 'medium',
    borderStyle: 'solid',
    alignment: 'left',
    barcodeHeight: 34,
    barcodeType: 'CODE128',
    customHeader: 'PHARMACY & MEDICAL STORES',
    fields: {
      showStoreHeader: true,
      showItemCode: true,
      showItemName: true,
      showBatchNo: true,
      showExpiryDate: true,
      showMfgDate: false,
      showPrice: true,
      showBarcodeGraphic: true,
      showBarcodeText: true,
    },
  },
};

// Code 128 patterns for realistic preview
const CODE128_PATTERNS: number[][] = [
  [2, 1, 2, 2, 2, 2], [2, 2, 2, 1, 2, 2], [2, 2, 2, 2, 2, 1], [1, 2, 1, 2, 2, 3],
  [1, 2, 1, 3, 2, 2], [1, 3, 1, 2, 2, 2], [1, 2, 2, 2, 1, 3], [1, 2, 2, 3, 1, 2],
  [1, 3, 2, 2, 1, 2], [2, 2, 1, 2, 1, 3], [2, 2, 1, 3, 1, 2], [2, 3, 1, 2, 1, 2],
  [1, 1, 2, 2, 3, 2], [1, 2, 2, 1, 3, 2], [1, 2, 2, 2, 3, 1], [1, 1, 3, 2, 2, 2],
  [1, 2, 3, 1, 2, 2], [1, 2, 3, 2, 2, 1], [2, 2, 3, 2, 1, 1], [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 2, 3, 1], [2, 1, 3, 2, 1, 2], [2, 2, 3, 1, 1, 2], [3, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 2, 2], [3, 2, 1, 1, 2, 2], [3, 2, 1, 2, 2, 1], [3, 1, 2, 2, 1, 2],
  [3, 2, 2, 1, 1, 2], [3, 2, 2, 2, 1, 1], [2, 1, 2, 1, 2, 3], [2, 1, 2, 3, 2, 1],
  [2, 3, 2, 1, 2, 1], [1, 1, 1, 3, 2, 3], [1, 3, 1, 1, 2, 3], [1, 3, 1, 3, 2, 1],
  [1, 1, 2, 3, 1, 3], [1, 3, 2, 1, 1, 3], [1, 3, 2, 3, 1, 1], [2, 1, 1, 3, 1, 3],
  [2, 3, 1, 1, 1, 3], [2, 3, 1, 3, 1, 1], [1, 1, 2, 1, 3, 3], [1, 1, 2, 3, 3, 1],
  [1, 3, 2, 1, 3, 1], [1, 1, 3, 1, 2, 3], [1, 1, 3, 3, 2, 1], [1, 3, 3, 1, 2, 1],
  [3, 1, 3, 1, 2, 1], [2, 1, 1, 3, 3, 1], [2, 3, 1, 1, 3, 1], [2, 1, 3, 1, 1, 3],
  [2, 1, 3, 3, 1, 1], [2, 1, 3, 1, 3, 1], [3, 1, 1, 1, 2, 3], [3, 1, 1, 3, 2, 1],
  [3, 3, 1, 1, 2, 1], [3, 1, 2, 1, 1, 3], [3, 1, 2, 3, 1, 1], [3, 3, 2, 1, 1, 1],
  [3, 1, 4, 1, 1, 1], [2, 2, 1, 4, 1, 1], [4, 3, 1, 1, 1, 1], [1, 1, 1, 2, 2, 4],
  [1, 1, 1, 4, 2, 2], [1, 2, 1, 1, 2, 4], [1, 2, 1, 4, 2, 1], [1, 4, 1, 1, 2, 2],
  [1, 4, 1, 2, 2, 1], [1, 1, 2, 2, 1, 4], [1, 1, 2, 4, 1, 2], [1, 2, 2, 1, 1, 4],
  [1, 2, 2, 4, 1, 1], [1, 4, 2, 1, 1, 2], [1, 4, 2, 2, 1, 1], [2, 4, 1, 2, 1, 1],
  [2, 2, 1, 1, 1, 4], [4, 1, 3, 1, 1, 1], [2, 4, 1, 1, 1, 2], [1, 3, 4, 1, 1, 1],
  [1, 1, 1, 2, 4, 2], [1, 2, 1, 1, 4, 2], [1, 2, 1, 2, 4, 1], [1, 1, 4, 2, 1, 2],
  [1, 2, 4, 1, 1, 2], [1, 2, 4, 2, 1, 1], [4, 1, 1, 2, 1, 2], [4, 2, 1, 1, 1, 2],
  [4, 2, 1, 2, 1, 1], [2, 1, 2, 1, 4, 1], [2, 1, 4, 1, 2, 1], [4, 1, 2, 1, 2, 1],
  [1, 1, 1, 1, 4, 3], [1, 1, 1, 3, 4, 1], [1, 3, 1, 1, 4, 1], [1, 1, 4, 1, 1, 3],
  [1, 1, 4, 3, 1, 1], [4, 1, 1, 1, 1, 3], [4, 1, 1, 3, 1, 1], [1, 1, 3, 1, 4, 1],
  [1, 1, 4, 1, 3, 1], [3, 1, 1, 1, 4, 1], [4, 1, 1, 1, 3, 1], [2, 1, 1, 4, 1, 2],
  [2, 1, 1, 2, 1, 4], [2, 1, 1, 2, 3, 2], [2, 3, 3, 1, 1, 1, 2]
];

function generateCode128Svg(text: string, height: number = 32): React.ReactNode {
  if (!text) return null;
  const charCodes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) charCodes.push(code);
  }
  let checksum = 104;
  for (let i = 0; i < charCodes.length; i++) {
    checksum += charCodes[i] * (i + 1);
  }
  const sequence = [104, ...charCodes, checksum % 103, 106];
  const rects: { x: number; width: number }[] = [];
  let currentX = 6;
  sequence.forEach((patternIdx) => {
    const pattern = CODE128_PATTERNS[patternIdx] || CODE128_PATTERNS[0];
    pattern.forEach((width, index) => {
      if (index % 2 === 0) rects.push({ x: currentX, width: width * 1.5 });
      currentX += width * 1.5;
    });
  });
  return (
    <svg viewBox={`0 0 ${currentX + 6} ${height}`} style={{ width: '100%', height: `${height}px`, display: 'block' }}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.width} height={height} fill="#000000" />
      ))}
    </svg>
  );
}

export const BarcodeMasterSettingsComponent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'registration' | 'labSample' | 'inventory'>('registration');
  const [settings, setSettings] = useState<MasterBarcodeSettings>(() => {
    try {
      const saved = localStorage.getItem('HIMS_MASTER_BARCODE_CONFIG');
      if (saved) {
        return { ...DEFAULT_MASTER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load master barcode settings', e);
    }
    return DEFAULT_MASTER_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [customPrinterInput, setCustomPrinterInput] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  const currentConfig = settings[activeModule];

  const updateCurrentConfig = (updates: Partial<ModuleBarcodeConfig>) => {
    setSettings((prev) => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        ...updates,
      },
    }));
  };

  const toggleField = (fieldKey: string, val: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        fields: {
          ...prev[activeModule].fields,
          [fieldKey]: val,
        },
      },
    }));
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem('HIMS_MASTER_BARCODE_CONFIG', JSON.stringify(settings));
      // Also update legacy key for backward compatibility
      localStorage.setItem('HIMS_BARCODE_MASTER_CONFIG', JSON.stringify(settings.registration));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save master barcode settings', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all barcode configurations to system defaults?')) {
      setSettings(DEFAULT_MASTER_SETTINGS);
      try {
        localStorage.removeItem('HIMS_MASTER_BARCODE_CONFIG');
        localStorage.removeItem('HIMS_BARCODE_MASTER_CONFIG');
      } catch (e) {}
    }
  };

  const handleTestPrint = () => {
    const printContent = previewRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=500,height=450');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Print - ${activeModule.toUpperCase()} (${currentConfig.printerName})</title>
          <style>
            @page { size: ${currentConfig.widthMm}mm ${currentConfig.heightMm}mm; margin: 0; }
            body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 4px; box-sizing: border-box; -webkit-print-color-adjust: exact; }
            .label-page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="label-page">${printContent.innerHTML}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: spacing.xl, backgroundColor: colors.surfaceSunken, minHeight: '100vh', fontFamily: typography.fontFamily }}>
      {/* Top Header */}
      <PageHeader
        title="Barcode & Label Master Configuration"
        subtitle="System-wide master setup for Registration, Lab Sample Collection, and Inventory Barcode Labels & Target Printers"
        actions={
          <>
            <Button variant="secondary" size="md" onClick={handleReset}>
              <i className="fa fa-undo" style={{ marginRight: '6px' }}></i> Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAll}
              style={{ fontWeight: 600, boxShadow: '0 4px 14px rgba(33, 0, 141, 0.35)' }}
            >
              <i className="fa fa-save" style={{ marginRight: '8px' }}></i> Save All Configurations
            </Button>
          </>
        }
      />

      {/* Success Banner */}
      {savedSuccess && (
        <div style={{ marginBottom: spacing.xl }}>
          <Alert tone="success">
            Master Barcode settings saved successfully! All registration, lab, and inventory prints will now target their assigned printers automatically.
          </Alert>
        </div>
      )}

      {/* Module Tabs */}
      <Tabs
        items={MODULE_TAB_ITEMS}
        activeKey={activeModule}
        onChange={(key) => setActiveModule(key as 'registration' | 'labSample' | 'inventory')}
      />

      {/* Main Grid Content: Settings Column + Live Preview Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: spacing.xl, marginTop: spacing.lg }}>
        {/* LEFT: Configuration Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {/* Card 1: Printer Assignment */}
          <Card title="Target Barcode Printer Assignment">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
              <Select
                label="Select Barcode / Thermal Printer"
                options={PRINTER_OPTIONS}
                value={currentConfig.printerName}
                onChange={(value) => updateCurrentConfig({ printerName: String(value) })}
              />

              <Input
                label="Custom Printer Hardware Name"
                type="text"
                placeholder="e.g. Zebra_ZD220_Registration"
                value={currentConfig.printerName === 'CUSTOM' ? customPrinterInput : currentConfig.printerName}
                onChange={(e) => {
                  setCustomPrinterInput(e.target.value);
                  updateCurrentConfig({ printerName: e.target.value });
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.lg,
                backgroundColor: colors.surfaceMuted,
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Checkbox
                checked={currentConfig.autoPrintOnAction}
                onChange={(checked) => updateCurrentConfig({ autoPrintOnAction: checked })}
                label="Auto-Trigger Print (Send to printer automatically on Save/Complete)"
              />
            </div>
          </Card>

          {/* Card 2: Dimensions & Size Presets */}
          <Card title="Label Size & Dimension Specifications">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
              <Select
                label="Size Preset"
                options={PRESET_OPTIONS}
                value={currentConfig.preset}
                onChange={(value) => {
                  const preset = value as any;
                  const dimMap: any = {
                    '50x30': { widthMm: 50, heightMm: 30, font: 'medium', bHeight: 36 },
                    '38x25': { widthMm: 38, heightMm: 25, font: 'small', bHeight: 28 },
                    '74x38': { widthMm: 74, heightMm: 38, font: 'medium', bHeight: 44 },
                    '100x50': { widthMm: 100, heightMm: 50, font: 'large', bHeight: 52 },
                  };
                  if (dimMap[preset]) {
                    updateCurrentConfig({
                      preset,
                      widthMm: dimMap[preset].widthMm,
                      heightMm: dimMap[preset].heightMm,
                      fontSize: dimMap[preset].font,
                      barcodeHeight: dimMap[preset].bHeight,
                    });
                  } else {
                    updateCurrentConfig({ preset: 'custom' });
                  }
                }}
              />

              <Input
                label="Width (mm)"
                type="number"
                value={currentConfig.widthMm}
                onChange={(e) => updateCurrentConfig({ preset: 'custom', widthMm: Number(e.target.value) || 50 })}
              />

              <Input
                label="Height (mm)"
                type="number"
                value={currentConfig.heightMm}
                onChange={(e) => updateCurrentConfig({ preset: 'custom', heightMm: Number(e.target.value) || 30 })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md }}>
              <Select
                label="Font Size"
                options={FONT_SIZE_OPTIONS}
                value={currentConfig.fontSize}
                onChange={(value) => updateCurrentConfig({ fontSize: value as any })}
              />

              <Input
                label="Barcode Height (px)"
                type="number"
                value={currentConfig.barcodeHeight}
                onChange={(e) => updateCurrentConfig({ barcodeHeight: Number(e.target.value) || 32 })}
              />

              <Select
                label="Border Style"
                options={BORDER_STYLE_OPTIONS}
                value={currentConfig.borderStyle}
                onChange={(value) => updateCurrentConfig({ borderStyle: value as any })}
              />
            </div>
          </Card>

          {/* Card 3: Inside Content Toggles */}
          <Card
            title={`Inside Content Fields Configuration (${
              activeModule === 'registration' ? 'Registration' : activeModule === 'labSample' ? 'Lab Sample' : 'Inventory'
            })`}
          >
            <div style={{ marginBottom: spacing.md }}>
              <Input
                label="Header / Title Override (e.g. Hospital or Department Name)"
                type="text"
                value={currentConfig.customHeader}
                onChange={(e) => updateCurrentConfig({ customHeader: e.target.value })}
                placeholder="Leave blank to use default facility name..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
              {Object.keys(currentConfig.fields).map((fieldKey) => {
                const labelMap: Record<string, string> = {
                  showHospitalName: 'Hospital / Facility Name',
                  showMRN: 'UHID / Patient MRN',
                  showPatientName: 'Patient Full Name',
                  showAgeGender: 'Age & Gender',
                  showVisitDate: 'Visit Date & Time',
                  showDoctorName: 'Doctor / Consultant',
                  showDepartment: 'Department Name',
                  showTokenNo: 'Queue / Token Number',
                  showMobile: 'Patient Phone / Mobile',
                  showAddress: 'Patient Address',
                  showBarcodeGraphic: 'Barcode Graphic Stripes',
                  showBarcodeText: 'Barcode Human-Readable Digits',
                  showLabHeader: 'Lab Header / Department',
                  showSampleId: 'Sample ID / Barcode No',
                  showSampleType: 'Specimen / Sample Type (e.g. EDTA Blood)',
                  showTestNames: 'Test Names / Profile (e.g. CBC, LFT)',
                  showCollectionDate: 'Collection Date & Time',
                  showContainerColor: 'Tube Cap / Container Color',
                  showStoreHeader: 'Pharmacy / Store Header',
                  showItemCode: 'Item Code / SKU',
                  showItemName: 'Item Name & Strength',
                  showBatchNo: 'Batch / Lot Number',
                  showExpiryDate: 'Expiry Date (EXP: MM/YYYY)',
                  showMfgDate: 'Manufacturing Date (MFG)',
                  showPrice: 'MRP / Unit Price (Rs.)',
                };

                const isChecked = Boolean(currentConfig.fields[fieldKey]);

                return (
                  <div
                    key={fieldKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: `${spacing.xs} ${spacing.sm}`,
                      borderRadius: radii.sm,
                      background: isChecked ? colors.primaryLight : colors.surfaceMuted,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(checked) => toggleField(fieldKey, checked)}
                      label={labelMap[fieldKey] || fieldKey}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT: Live Realistic Preview & Test Print */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <Card
            title="Live Master Label Preview"
            actions={<Badge tone="info">{activeModule.toUpperCase()}</Badge>}
            style={{ position: 'sticky', top: spacing.xl }}
          >
            <div style={{ marginBottom: spacing.md }}>
              <span style={{ ...typography.caption, color: colors.textMuted }}>
                {currentConfig.widthMm}mm &times; {currentConfig.heightMm}mm &bull; {currentConfig.printerName}
              </span>
            </div>

            {/* Label Card Box (chrome/wrapper around the live preview -- restyled with tokens) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: colors.surfaceMuted,
                padding: `${spacing.xl} ${spacing.lg}`,
                borderRadius: radii.md,
                border: `1px dashed ${colors.borderStrong}`,
                marginBottom: spacing.lg,
              }}
            >
              {/* Live label render -- intentionally left untouched (structure, styles,
                  and generateCode128Svg calls) since this mirrors the actual print
                  output used by handleTestPrint via previewRef.current.innerHTML. */}
              <div
                ref={previewRef}
                style={{
                  backgroundColor: '#ffffff',
                  border: currentConfig.borderStyle === 'none' ? 'none' : `1.5px ${currentConfig.borderStyle} #000000`,
                  borderRadius: '6px',
                  padding: '10px 14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  color: '#000000',
                  width: '100%',
                  maxWidth: `${Math.min(380, currentConfig.widthMm * 5.5)}px`,
                  textAlign: currentConfig.alignment,
                  boxSizing: 'border-box',
                }}
              >
                {/* 1. REGISTRATION PREVIEW */}
                {activeModule === 'registration' && (
                  <>
                    {currentConfig.fields.showHospitalName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '5px' }}>
                        <strong style={{ fontSize: currentConfig.fontSize === 'small' ? '11px' : currentConfig.fontSize === 'large' ? '15px' : '13px' }}>
                          {currentConfig.customHeader || 'SHUVADARSINI HOSPITAL'}
                        </strong>
                        {currentConfig.fields.showTokenNo && (
                          <span style={{ fontSize: '10px', fontWeight: 700, background: '#eee', padding: '1px 4px' }}>Q-04</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px', fontSize: currentConfig.fontSize === 'small' ? '10px' : currentConfig.fontSize === 'large' ? '13px' : '11.5px', lineHeight: 1.3 }}>
                      {currentConfig.fields.showMRN && <div><strong>MRN:</strong> SH0002941</div>}
                      {currentConfig.fields.showVisitDate && <div><strong>Date:</strong> 17/08/2026</div>}
                      {currentConfig.fields.showPatientName && <div style={{ gridColumn: 'span 2' }}><strong>Name:</strong> Mr. Rajesh Kumar</div>}
                      {currentConfig.fields.showAgeGender && <div><strong>Age/Sex:</strong> 34Y / Male</div>}
                      {currentConfig.fields.showMobile && <div><strong>Ph:</strong> +91 9876543210</div>}
                      {currentConfig.fields.showDoctorName && <div style={{ gridColumn: 'span 2' }}><strong>Dr:</strong> Dr. Anand Sharma (Cardiology)</div>}
                      {currentConfig.fields.showAddress && <div style={{ gridColumn: 'span 2' }}><strong>Addr:</strong> 12, MG Road, Bangalore</div>}
                    </div>

                    {currentConfig.fields.showBarcodeGraphic && (
                      <div style={{ marginTop: '5px', textAlign: 'center' }}>
                        {generateCode128Svg('SH0002941', currentConfig.barcodeHeight)}
                        {currentConfig.fields.showBarcodeText && (
                          <div style={{ fontSize: '10px', letterSpacing: '2.5px', fontWeight: 700, marginTop: '2px' }}>SH0002941</div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 2. LAB SAMPLE PREVIEW */}
                {activeModule === 'labSample' && (
                  <>
                    {currentConfig.fields.showLabHeader && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '11.5px' }}>{currentConfig.customHeader || 'CENTRAL CLINICAL LAB'}</strong>
                        {currentConfig.fields.showContainerColor && <span style={{ fontSize: '9px', fontWeight: 700, color: '#6b21a8' }}>[EDTA Tube - Purple]</span>}
                      </div>
                    )}

                    <div style={{ fontSize: '10.5px', lineHeight: 1.3 }}>
                      {currentConfig.fields.showPatientName && <div><strong>Pt:</strong> Rajesh Kumar (34Y/M)</div>}
                      {currentConfig.fields.showMRN && <div><strong>MRN:</strong> SH0002941 | <strong>Sample:</strong> EDTA Blood</div>}
                      {currentConfig.fields.showTestNames && <div><strong>Tests:</strong> CBC, Hemogram, Blood Group</div>}
                      {currentConfig.fields.showCollectionDate && <div><strong>Coll:</strong> 17-Aug-2026 10:30 AM</div>}
                    </div>

                    {currentConfig.fields.showBarcodeGraphic && (
                      <div style={{ marginTop: '4px', textAlign: 'center' }}>
                        {generateCode128Svg('SMP-2026-9481', currentConfig.barcodeHeight)}
                        {currentConfig.fields.showBarcodeText && (
                          <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>SMP-2026-9481</div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 3. INVENTORY PREVIEW */}
                {activeModule === 'inventory' && (
                  <>
                    {currentConfig.fields.showStoreHeader && (
                      <div style={{ borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px', textAlign: 'center' }}>
                        <strong style={{ fontSize: '12px' }}>{currentConfig.customHeader || 'MAIN PHARMACY STORE'}</strong>
                      </div>
                    )}

                    <div style={{ fontSize: '11px', lineHeight: 1.35 }}>
                      {currentConfig.fields.showItemName && <div><strong style={{ fontSize: '12px' }}>Paracetamol 650mg Tab</strong></div>}
                      {currentConfig.fields.showItemCode && <div><strong>SKU:</strong> MED-PCM-650</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {currentConfig.fields.showBatchNo && <span><strong>Batch:</strong> BT2026X9</span>}
                        {currentConfig.fields.showExpiryDate && <span><strong>EXP:</strong> 08/2028</span>}
                      </div>
                      {currentConfig.fields.showPrice && <div><strong>MRP:</strong> Rs. 32.50 (Incl. Taxes)</div>}
                    </div>

                    {currentConfig.fields.showBarcodeGraphic && (
                      <div style={{ marginTop: '5px', textAlign: 'center' }}>
                        {generateCode128Svg('8901234567890', currentConfig.barcodeHeight)}
                        {currentConfig.fields.showBarcodeText && (
                          <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 700, marginTop: '2px' }}>8901234567890</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Test Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <Button
                variant="primary"
                size="md"
                onClick={handleTestPrint}
                style={{ width: '100%', fontWeight: 600, boxShadow: '0 4px 12px rgba(33, 0, 141, 0.25)' }}
              >
                <i className="fa fa-print" style={{ marginRight: '6px' }}></i> Test Print to {currentConfig.printerName.split(' ')[0]}
              </Button>
              <span style={{ ...typography.caption, color: colors.textMuted, textAlign: 'center' }}>
                Sends test job with current master dimensions &amp; fields to test formatting.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
