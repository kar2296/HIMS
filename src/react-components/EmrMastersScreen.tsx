import React, { useState } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from './Button';
import { Input } from '../components/ui/Input';

export type MasterCatalogType = 'ALLERGENS' | 'VACCINES' | 'LINES_TUBES' | 'ASSESSMENT_SCALES';

export interface AllergenMasterItem {
  id: string;
  code: string;
  name: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'CONTRAST';
  snomedCode?: string;
  commonReactions: string[];
  isActive: boolean;
}

export interface VaccineMasterItem {
  id: string;
  code: string;
  vaccineName: string;
  targetDisease: string;
  recommendedAge: string;
  route: string;
  doseVolume: string;
  isActive: boolean;
}

export interface LineTubeMasterItem {
  id: string;
  code: string;
  deviceType: 'CATHETER' | 'DRAIN' | 'CENTRAL_LINE' | 'TUBE' | 'CVC';
  deviceName: string;
  insertionSites: string[];
  recommendedMaxDays: number;
  isActive: boolean;
}

export interface AssessmentScaleMasterItem {
  id: string;
  scaleCode: string;
  scaleName: string;
  clinicalDomain: string;
  minScore: number;
  maxScore: number;
  highRiskThreshold: string;
  isActive: boolean;
}

export interface EmrMastersScreenProps {
  initialCatalog?: MasterCatalogType;
  onSaveItem?: (catalog: MasterCatalogType, item: any) => void;
}

export const EmrMastersScreen: React.FC<EmrMastersScreenProps> = ({
  initialCatalog = 'ALLERGENS',
  onSaveItem,
}) => {
  const [currentCatalog, setCurrentCatalog] = useState<MasterCatalogType>(initialCatalog);
  const [searchQuery, setSearchQuery] = useState('');

  const [allergens] = useState<AllergenMasterItem[]>([
    {
      id: '1',
      code: 'ALG-001',
      name: 'Penicillin G / V',
      category: 'DRUG',
      snomedCode: '764146007',
      commonReactions: ['Anaphylaxis', 'Urticaria', 'Angioedema'],
      isActive: true,
    },
    {
      id: '2',
      code: 'ALG-002',
      name: 'Amoxicillin / Clavulanate',
      category: 'DRUG',
      snomedCode: '372687004',
      commonReactions: ['Maculopapular Rash', 'Pruritus'],
      isActive: true,
    },
    {
      id: '3',
      code: 'ALG-003',
      name: 'Sulfa / Trimethoprim-Sulfamethoxazole',
      category: 'DRUG',
      snomedCode: '91936005',
      commonReactions: ['Stevens-Johnson Syndrome', 'Skin Rash'],
      isActive: true,
    },
    {
      id: '4',
      code: 'ALG-004',
      name: 'Iodinated Radiocontrast Media',
      category: 'CONTRAST',
      snomedCode: '293637006',
      commonReactions: ['Bronchospasm', 'Hypotension', 'Flushing'],
      isActive: true,
    },
    {
      id: '5',
      code: 'ALG-005',
      name: 'Peanuts / Groundnuts',
      category: 'FOOD',
      snomedCode: '91935009',
      commonReactions: ['Severe Anaphylaxis', 'Laryngeal Edema'],
      isActive: true,
    },
    {
      id: '6',
      code: 'ALG-006',
      name: 'Latex / Natural Rubber',
      category: 'ENVIRONMENTAL',
      snomedCode: '300916003',
      commonReactions: ['Contact Dermatitis', 'Wheezing'],
      isActive: true,
    },
  ]);

  const [vaccines] = useState<VaccineMasterItem[]>([
    {
      id: '1',
      code: 'VAC-BCG',
      vaccineName: 'BCG Vaccine',
      targetDisease: 'Tuberculosis',
      recommendedAge: 'At Birth',
      route: 'Intradermal',
      doseVolume: '0.05 mL',
      isActive: true,
    },
    {
      id: '2',
      code: 'VAC-HEPB',
      vaccineName: 'Hepatitis B Recombinant',
      targetDisease: 'Hepatitis B',
      recommendedAge: 'Birth, 2m, 6m',
      route: 'Intramuscular',
      doseVolume: '0.5 mL',
      isActive: true,
    },
    {
      id: '3',
      code: 'VAC-HEXA',
      vaccineName: 'Hexavalent (DTaP-IPV-Hib-HepB)',
      targetDisease: 'Diphtheria, Tetanus, Pertussis, Polio, Hib, HepB',
      recommendedAge: '2, 4, 6 Months',
      route: 'Intramuscular',
      doseVolume: '0.5 mL',
      isActive: true,
    },
    {
      id: '4',
      code: 'VAC-MMR',
      vaccineName: 'MMR (Measles, Mumps, Rubella)',
      targetDisease: 'Measles, Mumps, Rubella',
      recommendedAge: '12 Months & 5 Years',
      route: 'Subcutaneous',
      doseVolume: '0.5 mL',
      isActive: true,
    },
    {
      id: '5',
      code: 'VAC-COVID',
      vaccineName: 'COVID-19 mRNA Vaccine (Updated Booster)',
      targetDisease: 'SARS-CoV-2',
      recommendedAge: '>= 6 Months',
      route: 'Intramuscular',
      doseVolume: '0.3 mL',
      isActive: true,
    },
  ]);

  const [linesTubes] = useState<LineTubeMasterItem[]>([
    {
      id: '1',
      code: 'DEV-FOL',
      deviceType: 'CATHETER',
      deviceName: 'Foley Indwelling Urinary Catheter',
      insertionSites: ['Urethral', 'Suprapubic'],
      recommendedMaxDays: 14,
      isActive: true,
    },
    {
      id: '2',
      code: 'DEV-CVC',
      deviceType: 'CENTRAL_LINE',
      deviceName: 'Central Venous Catheter (Triple Lumen)',
      insertionSites: ['Right Internal Jugular', 'Subclavian', 'Femoral'],
      recommendedMaxDays: 7,
      isActive: true,
    },
    {
      id: '3',
      code: 'DEV-NGT',
      deviceType: 'TUBE',
      deviceName: 'Nasogastric (NG) Feeding / Decompression Tube',
      insertionSites: ['Left Nares', 'Right Nares'],
      recommendedMaxDays: 30,
      isActive: true,
    },
    {
      id: '4',
      code: 'DEV-CHEST',
      deviceType: 'DRAIN',
      deviceName: 'Intercostal Chest Tube (UWSD)',
      insertionSites: ['4th-5th Intercostal Mid-Axillary'],
      recommendedMaxDays: 5,
      isActive: true,
    },
  ]);

  const [scales] = useState<AssessmentScaleMasterItem[]>([
    {
      id: '1',
      scaleCode: 'BRADEN',
      scaleName: 'Braden Scale for Pressure Injury Risk',
      clinicalDomain: 'Nursing / Skin Integrity',
      minScore: 6,
      maxScore: 23,
      highRiskThreshold: '<= 12 (High Risk)',
      isActive: true,
    },
    {
      id: '2',
      scaleCode: 'MORSE',
      scaleName: 'Morse Fall Risk Scale (MFS)',
      clinicalDomain: 'Patient Safety / Inpatient',
      minScore: 0,
      maxScore: 125,
      highRiskThreshold: '>= 45 (High Fall Risk)',
      isActive: true,
    },
    {
      id: '3',
      scaleCode: 'GCS',
      scaleName: 'Glasgow Coma Scale',
      clinicalDomain: 'Neurology / Critical Care',
      minScore: 3,
      maxScore: 15,
      highRiskThreshold: '<= 8 (Severe Brain Injury / Coma)',
      isActive: true,
    },
    {
      id: '4',
      scaleCode: 'MEWS',
      scaleName: 'Modified Early Warning Score (MEWS)',
      clinicalDomain: 'Clinical Deterioration',
      minScore: 0,
      maxScore: 14,
      highRiskThreshold: '>= 4 (Call Rapid Response)',
      isActive: true,
    },
  ]);

  const catalogs: Array<{ id: MasterCatalogType; label: string; icon: string; count: number }> = [
    { id: 'ALLERGENS', label: 'Allergen Masters', icon: 'fa-exclamation-triangle', count: allergens.length },
    { id: 'VACCINES', label: 'Vaccination Schedules', icon: 'fa-shield', count: vaccines.length },
    { id: 'LINES_TUBES', label: 'Lines, Drains & Tubes (LDT)', icon: 'fa-stethoscope', count: linesTubes.length },
    { id: 'ASSESSMENT_SCALES', label: 'Clinical Assessment Scales', icon: 'fa-line-chart', count: scales.length },
  ];

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
          flexWrap: 'wrap',
          gap: spacing.sm,
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: spacing.sm,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, color: colors.primary }}>⚙️</span>
            <h2
              style={{
                ...typography.sectionHeading,
                color: colors.textMain,
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              EMR Clinical Masters & Knowledge Catalogs
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
            Manage hospital master catalogs for allergens, vaccines, medical lines/tubes, and risk assessment scoring systems.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button variant="primary" size="md" icon="fa-plus">
            Add Master Entry
          </Button>
        </div>
      </div>

      {/* Catalog Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: spacing.md,
          backgroundColor: '#ffffff',
          padding: '4px 8px 0',
          borderRadius: `${radii.md} ${radii.md} 0 0`,
          flexWrap: 'wrap',
        }}
      >
        {catalogs.map((cat) => {
          const isActive = currentCatalog === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCurrentCatalog(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: `3px solid ${isActive ? colors.primary : 'transparent'}`,
                background: 'transparent',
                color: isActive ? colors.primary : colors.textMuted,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={`fa ${cat.icon}`} />
              {cat.label}
              <span
                style={{
                  backgroundColor: isActive ? colors.primaryLight : colors.surfaceSunken,
                  color: isActive ? colors.primary : colors.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: radii.full,
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Master Items Table Card */}
      <Card padding={spacing.md}>
        <div style={{ marginBottom: spacing.md, maxWidth: 360 }}>
          <Input
            label=""
            placeholder="Filter catalog items..."
            leftIcon="fa fa-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {currentCatalog === 'ALLERGENS' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Allergen Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>SNOMED CT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Common Reactions</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allergens
                  .filter(
                    (a) =>
                      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((a, idx) => (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: colors.primary }}>{a.code}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textMain }}>{a.name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={a.category === 'DRUG' ? 'danger' : 'info'}>{a.category}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px', color: colors.textMuted }}>{a.snomedCode}</td>
                      <td style={{ padding: '10px 12px' }}>{a.commonReactions.join(', ')}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={a.isActive ? 'success' : 'neutral'}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {currentCatalog === 'VACCINES' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Vaccine Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Target Disease</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Recommended Age</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Route & Volume</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {vaccines
                  .filter((v) => v.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((v, idx) => (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: colors.primary }}>{v.code}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textMain }}>{v.vaccineName}</td>
                      <td style={{ padding: '10px 12px' }}>{v.targetDisease}</td>
                      <td style={{ padding: '10px 12px', color: colors.textMuted }}>{v.recommendedAge}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {v.route} ({v.doseVolume})
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={v.isActive ? 'success' : 'neutral'}>
                          {v.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {currentCatalog === 'LINES_TUBES' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Device / Line Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Insertion Sites</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Max Indwelling Days</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {linesTubes
                  .filter((l) => l.deviceName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((l, idx) => (
                    <tr
                      key={l.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: colors.primary }}>{l.code}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textMain }}>{l.deviceName}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone="info">{l.deviceType}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{l.insertionSites.join(', ')}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{l.recommendedMaxDays} Days</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={l.isActive ? 'success' : 'neutral'}>
                          {l.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {currentCatalog === 'ASSESSMENT_SCALES' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Scale Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Scale Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Domain</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Score Range</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>High Risk Cutoff</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {scales
                  .filter((s) => s.scaleName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s, idx) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: colors.primary }}>{s.scaleCode}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: colors.textMain }}>{s.scaleName}</td>
                      <td style={{ padding: '10px 12px' }}>{s.clinicalDomain}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {s.minScore} - {s.maxScore}
                      </td>
                      <td style={{ padding: '10px 12px', color: colors.danger, fontWeight: 600 }}>
                        {s.highRiskThreshold}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={s.isActive ? 'success' : 'neutral'}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
