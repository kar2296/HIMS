import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { colors, spacing, radii, shadows, typography } from '../components/ui/tokens';

export interface PatientBarcodeData {
  mrn?: string;
  patientName?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
  dob?: string;
  mobile?: string;
  visitNo?: string;
  visitDate?: string;
  visitTime?: string;
  department?: string;
  doctorName?: string;
  tokenNo?: string;
  facilityName?: string;
  address?: string;
}

export interface BarcodeModalProps {
  isOpen?: boolean;
  data: PatientBarcodeData;
  onClose?: () => void;
  onRawPrint?: () => void;
}

// Code 128-B patterns for sharp SVG barcode
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

function generateCode128Svg(text: string, height: number = 22): React.ReactNode {
  if (!text) return null;

  const charCodes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      charCodes.push(code);
    }
  }

  let checksum = 104;
  for (let i = 0; i < charCodes.length; i++) {
    checksum += charCodes[i] * (i + 1);
  }
  const checkDigit = checksum % 103;

  const sequence = [104, ...charCodes, checkDigit, 106];

  const rects: { x: number; width: number }[] = [];
  let currentX = 6;

  sequence.forEach((patternIdx) => {
    const pattern = CODE128_PATTERNS[patternIdx] || CODE128_PATTERNS[0];
    pattern.forEach((width, index) => {
      const isBar = index % 2 === 0;
      if (isBar) {
        rects.push({ x: currentX, width: width * 1.3 });
      }
      currentX += width * 1.3;
    });
  });

  const totalWidth = currentX + 6;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.width} height={height} fill="#000000" />
      ))}
    </svg>
  );
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen = true,
  data,
  onClose,
}) => {
  const [copies, setCopies] = useState<number>(1);
  const printRef = useRef<HTMLDivElement>(null);

  // Load registration configuration from Master Settings
  const masterConfig = (() => {
    try {
      const master = localStorage.getItem('HIMS_MASTER_BARCODE_CONFIG');
      if (master) {
        const parsed = JSON.parse(master);
        if (parsed.registration) {
          return {
            printerName: parsed.registration.printerName || 'Zebra ZD220',
            widthMm: parsed.registration.widthMm || 50,
            heightMm: parsed.registration.heightMm || 30,
            fontSize: parsed.registration.fontSize || 'medium',
            borderStyle: parsed.registration.borderStyle || 'solid',
            alignment: parsed.registration.alignment || 'left',
            barcodeHeight: 22,
            customHeader: parsed.registration.customHeader || '',
            fields: parsed.registration.fields || {
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
          };
        }
      }
    } catch (e) {}

    // Fallback defaults
    return {
      printerName: 'Zebra ZD220',
      widthMm: 50,
      heightMm: 30,
      fontSize: 'medium',
      borderStyle: 'solid',
      alignment: 'left',
      barcodeHeight: 22,
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
    };
  })();

  if (!isOpen) return null;

  const fullName =
    data.patientName ||
    `${data.title || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim() ||
    'Unknown Patient';

  const mrn = data.mrn || 'N/A';
  const hospital = masterConfig.customHeader || data.facilityName || 'SHUVADARSINI HOSPITAL';

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=450,height=380');
    if (!printWindow) return;

    const widthMm = masterConfig.widthMm;
    const heightMm = masterConfig.heightMm;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Label - ${mrn}</title>
          <style>
            @page {
              size: ${widthMm}mm ${heightMm}mm;
              margin: 0;
            }
            body {
              font-family: 'Poppins', Arial, sans-serif;
              margin: 0;
              padding: 2px;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
            }
            .label-page {
              page-break-after: always;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${Array.from({ length: copies })
            .map(() => `<div class="label-page">${printContent.innerHTML}</div>`)
            .join('')}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 350);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fontSizes = {
    small: { title: '9.5px', text: '9px', bold: '9.5px' },
    medium: { title: '11px', text: '9.5px', bold: '10.5px' },
    large: { title: '12px', text: '10.5px', bold: '11.5px' },
  }[masterConfig.fontSize as 'small' | 'medium' | 'large'] || { title: '11px', text: '9.5px', bold: '10.5px' };

  // NOTE: This is a genuinely React-owned dialog (isOpen/onClose props, no
  // utl.Modal.open native call) but its outer chrome is intentionally kept as
  // hand-rolled markup rather than the design-system `Modal`: the shared
  // `Modal` shell hard-codes a string-only `title`, spacing.lg body padding,
  // and zIndex.modal (1030) -- all of which would break this component's
  // deliberately "ultra-compact" label-preview layout and its very high
  // z-index (needed to stack above legacy AngularJS-rendered chrome). Only
  // tokens + Button are applied to the existing header/body/footer structure.
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontFamily: typography.fontFamily,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          width: '350px',
          maxWidth: '92%',
          boxShadow: shadows.lg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ultra-Compact Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
            color: '#ffffff',
            padding: `${spacing.sm} ${spacing.md}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa fa-barcode" style={{ fontSize: '13px', color: '#93c5fd' }}></i>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
              Barcode Label
            </span>
            <span style={{ fontSize: '9.5px', color: colors.borderStrong, marginLeft: '4px' }}>
              ({masterConfig.widthMm}&times;{masterConfig.heightMm}mm &bull; <strong style={{ color: '#86efac' }}>{masterConfig.printerName.split(' ')[0]}</strong>)
            </span>
          </div>

          <Button
            variant="icon"
            size="xs"
            onClick={onClose}
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.borderStrong,
              fontSize: '15px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
              boxShadow: 'none',
            }}
          >
            &times;
          </Button>
        </div>

        {/* Ultra-Compact Body */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.surfaceMuted,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Label Preview Card */}
          {/*
            The div below (ref=printRef) is mirrored verbatim via
            `printContent.innerHTML` into the physical print window in
            handlePrint() -- its structure, inline styles and colors drive
            the actual printed barcode label, so it is intentionally left
            completely untouched (no design-system components/tokens) to
            avoid any risk to print output fidelity.
          */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              ref={printRef}
              style={{
                backgroundColor: '#ffffff',
                border:
                  masterConfig.borderStyle === 'none'
                    ? 'none'
                    : `1.2px ${masterConfig.borderStyle} #000000`,
                borderRadius: '4px',
                padding: '6px 8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                color: '#000000',
                width: '100%',
                maxWidth: '320px',
                textAlign: masterConfig.alignment as any,
                boxSizing: 'border-box',
              }}
            >
              {/* Hospital & Token */}
              {masterConfig.fields.showHospitalName && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #000000',
                    paddingBottom: '2px',
                    marginBottom: '3px',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: fontSizes.title,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {hospital}
                  </span>
                  {masterConfig.fields.showTokenNo && data.tokenNo && (
                    <span
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        padding: '1px 3px',
                        borderRadius: '2px',
                      }}
                    >
                      Q:{data.tokenNo}
                    </span>
                  )}
                </div>
              )}

              {/* Patient Info Rows */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1px 4px',
                  fontSize: fontSizes.text,
                  marginBottom: '2px',
                  lineHeight: 1.25,
                }}
              >
                {masterConfig.fields.showMRN && (
                  <div>
                    <span style={{ color: '#475569', fontWeight: 600 }}>MRN:</span>{' '}
                    <strong style={{ color: '#0f172a', fontSize: fontSizes.bold }}>{mrn}</strong>
                  </div>
                )}

                {masterConfig.fields.showVisitDate && (
                  <div>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Date:</span>{' '}
                    <span>{data.visitDate || new Date().toLocaleDateString()}</span>
                  </div>
                )}

                {masterConfig.fields.showPatientName && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Name:</span>{' '}
                    <strong style={{ fontSize: fontSizes.bold, color: '#0f172a' }}>{fullName}</strong>
                  </div>
                )}

                {masterConfig.fields.showAgeGender && (
                  <div>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Age/Sex:</span>{' '}
                    <span>
                      {data.age ? `${data.age}Y` : ''} {data.gender ? `/ ${data.gender}` : ''}
                    </span>
                  </div>
                )}

                {masterConfig.fields.showMobile && data.mobile && (
                  <div>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Ph:</span>{' '}
                    <span>{data.mobile}</span>
                  </div>
                )}

                {masterConfig.fields.showDoctorName && data.doctorName && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Dr:</span>{' '}
                    <span>{data.doctorName}</span>
                  </div>
                )}

                {masterConfig.fields.showDepartment && data.department && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Dept:</span>{' '}
                    <span>{data.department}</span>
                  </div>
                )}

                {masterConfig.fields.showAddress && data.address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Addr:</span>{' '}
                    <span>{data.address}</span>
                  </div>
                )}
              </div>

              {/* Barcode SVG Visual */}
              {masterConfig.fields.showBarcodeGraphic && (
                <div
                  style={{
                    marginTop: '2px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    padding: '0px',
                  }}
                >
                  {generateCode128Svg(mrn !== 'N/A' ? mrn : '00000000', masterConfig.barcodeHeight)}
                  {masterConfig.fields.showBarcodeText && (
                    <div
                      style={{
                        fontSize: '8.5px',
                        letterSpacing: '1.8px',
                        fontWeight: 700,
                        marginTop: '1px',
                        color: '#000000',
                        lineHeight: 1,
                      }}
                    >
                      {mrn}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integrated Footer: Copies on Left + Close & Print on Right */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderTop: `1px solid ${colors.surfaceSunken}`,
          }}
        >
          {/* Inline Copies Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
              Copies:
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: radii.sm,
                overflow: 'hidden',
                background: colors.surface,
              }}
            >
              <Button
                variant="icon"
                size="xs"
                onClick={() => setCopies(Math.max(1, copies - 1))}
                title="Decrease copies"
                style={{
                  border: 'none',
                  borderRadius: 0,
                  background: 'transparent',
                  width: 'auto',
                  minHeight: 'auto',
                  padding: '2px 7px',
                  fontWeight: 700,
                  color: colors.textMuted,
                  fontSize: '11px',
                  boxShadow: 'none',
                }}
              >
                -
              </Button>
              <span
                style={{
                  padding: '2px 6px',
                  fontWeight: 700,
                  fontSize: '11px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}
              >
                {copies}
              </span>
              <Button
                variant="icon"
                size="xs"
                onClick={() => setCopies(copies + 1)}
                title="Increase copies"
                style={{
                  border: 'none',
                  borderRadius: 0,
                  background: 'transparent',
                  width: 'auto',
                  minHeight: 'auto',
                  padding: '2px 7px',
                  fontWeight: 700,
                  color: colors.textMuted,
                  fontSize: '11px',
                  boxShadow: 'none',
                }}
              >
                +
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button variant="secondary" size="xs" onClick={onClose} style={{ minWidth: '60px', padding: '4px 10px', fontSize: typography.helper.fontSize }}>
              Close
            </Button>

            <Button
              variant="primary"
              size="xs"
              onClick={handlePrint}
              autoFocus
              style={{ minWidth: '90px', padding: '4px 12px', fontSize: typography.helper.fontSize, fontWeight: 600 }}
            >
              <i className="fa fa-print" style={{ marginRight: '4px' }}></i> Print ({copies})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
