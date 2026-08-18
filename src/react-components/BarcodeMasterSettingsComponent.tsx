import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

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
    <div style={{ padding: '24px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: "'Poppins', 'Montserrat', sans-serif" }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #00005c 0%, #1a0070 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '20px 26px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 92, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            <i className="fa fa-barcode"></i>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '0.3px', color: '#ffffff' }}>
              Barcode &amp; Label Master Configuration
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
              System-wide master setup for Registration, Lab Sample Collection, and Inventory Barcode Labels &amp; Target Printers
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
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
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}
        >
          <i className="fa fa-check-circle" style={{ fontSize: '18px' }}></i>
          <span>Master Barcode settings saved successfully! All registration, lab, and inventory prints will now target their assigned printers automatically.</span>
        </div>
      )}

      {/* Module Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          backgroundColor: '#ffffff',
          padding: '6px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        {[
          { id: 'registration', label: '1. Registration & Patient ID Label', icon: 'fa fa-user-tag', badge: 'Active' },
          { id: 'labSample', label: '2. Lab Sample Collection Label', icon: 'fa fa-vial', badge: 'Active' },
          { id: 'inventory', label: '3. Inventory & Pharmacy Batch Label', icon: 'fa fa-boxes', badge: 'Active' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveModule(tab.id as any)}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeModule === tab.id ? 'linear-gradient(135deg, #00005c 0%, #1a0070 100%)' : 'transparent',
              color: activeModule === tab.id ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              boxShadow: activeModule === tab.id ? '0 4px 12px rgba(0, 0, 92, 0.2)' : 'none',
            }}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid Content: Settings Column + Live Preview Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* LEFT: Configuration Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Card 1: Printer Assignment */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '18px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-print" style={{ color: '#21008d' }}></i>
              Target Barcode Printer Assignment
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Select Barcode / Thermal Printer
                </label>
                <select
                  value={currentConfig.printerName}
                  onChange={(e) => updateCurrentConfig({ printerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: 500 }}
                >
                  {COMMON_PRINTER_LIST.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="CUSTOM">-- Custom Printer Name --</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Custom Printer Hardware Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zebra_ZD220_Registration"
                  value={currentConfig.printerName === 'CUSTOM' ? customPrinterInput : currentConfig.printerName}
                  onChange={(e) => {
                    setCustomPrinterInput(e.target.value);
                    updateCurrentConfig({ printerName: e.target.value });
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={currentConfig.autoPrintOnAction}
                  onChange={(e) => updateCurrentConfig({ autoPrintOnAction: e.target.checked })}
                />
                <span>Auto-Trigger Print (Send to printer automatically on Save/Complete)</span>
              </label>
            </div>
          </div>

          {/* Card 2: Dimensions & Size Presets */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '18px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-ruler-combined" style={{ color: '#21008d' }}></i>
              Label Size &amp; Dimension Specifications
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Size Preset
                </label>
                <select
                  value={currentConfig.preset}
                  onChange={(e) => {
                    const preset = e.target.value as any;
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="50x30">50mm × 30mm (Standard Thermal)</option>
                  <option value="38x25">38mm × 25mm (Compact Vial / Tube)</option>
                  <option value="74x38">74mm × 38mm (Medium Card / Tag)</option>
                  <option value="100x50">100mm × 50mm (Large IP Folder Tag)</option>
                  <option value="custom">Custom Dimensions</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={currentConfig.widthMm}
                  onChange={(e) => updateCurrentConfig({ preset: 'custom', widthMm: Number(e.target.value) || 50 })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={currentConfig.heightMm}
                  onChange={(e) => updateCurrentConfig({ preset: 'custom', heightMm: Number(e.target.value) || 30 })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Font Size
                </label>
                <select
                  value={currentConfig.fontSize}
                  onChange={(e) => updateCurrentConfig({ fontSize: e.target.value as any })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="small">Small (Compact)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="large">Large (High-Visibility)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Barcode Height (px)
                </label>
                <input
                  type="number"
                  value={currentConfig.barcodeHeight}
                  onChange={(e) => updateCurrentConfig({ barcodeHeight: Number(e.target.value) || 32 })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Border Style
                </label>
                <select
                  value={currentConfig.borderStyle}
                  onChange={(e) => updateCurrentConfig({ borderStyle: e.target.value as any })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="solid">Solid Line</option>
                  <option value="dashed">Dashed Line</option>
                  <option value="none">No Border</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Inside Content Toggles */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '18px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-list-check" style={{ color: '#21008d' }}></i>
              Inside Content Fields Configuration ({activeModule === 'registration' ? 'Registration' : activeModule === 'labSample' ? 'Lab Sample' : 'Inventory'})
            </h4>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Header / Title Override (e.g. Hospital or Department Name)
              </label>
              <input
                type="text"
                value={currentConfig.customHeader}
                onChange={(e) => updateCurrentConfig({ customHeader: e.target.value })}
                placeholder="Leave blank to use default facility name..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

                return (
                  <label
                    key={fieldKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#334155',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: currentConfig.fields[fieldKey] ? 'rgba(33, 0, 141, 0.04)' : '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig.fields[fieldKey])}
                      onChange={(e) => toggleField(fieldKey, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{labelMap[fieldKey] || fieldKey}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Realistic Preview & Test Print */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              position: 'sticky',
              top: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  Live Master Label Preview
                </h4>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {currentConfig.widthMm}mm &times; {currentConfig.heightMm}mm &bull; {currentConfig.printerName}
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#21008d', background: 'rgba(33, 0, 141, 0.08)', padding: '3px 8px', borderRadius: '10px' }}>
                {activeModule.toUpperCase()}
              </span>
            </div>

            {/* Label Card Box */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                padding: '24px 16px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                marginBottom: '16px',
              }}
            >
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="primary"
                size="md"
                onClick={handleTestPrint}
                style={{ width: '100%', fontWeight: 600, boxShadow: '0 4px 12px rgba(33, 0, 141, 0.25)' }}
              >
                <i className="fa fa-print" style={{ marginRight: '6px' }}></i> Test Print to {currentConfig.printerName.split(' ')[0]}
              </Button>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                Sends test job with current master dimensions &amp; fields to test formatting.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
