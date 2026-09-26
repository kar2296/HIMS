import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  VITAL_ELEMENTS_CATALOG,
  DEFAULT_SELECTED_VITAL_ELEMENTS,
  type ConfiguredVitalElement,
  type VitalBasis,
  type VitalElementDef,
  loadConfiguredVitalElements,
  saveConfiguredVitalElements,
} from '../emr-workspace/vitalElementsCatalog';
import { alert } from '../utils/alert';

export const EditEmrVitalScreen: React.FC = () => {
  const navigate = useNavigate();
  const { formId = '1' } = useParams<{ formId?: string; panelId?: string }>();

  // Configured (Selected) elements on Left Table
  const [selectedElements, setSelectedElements] = useState<ConfiguredVitalElement[]>(() =>
    loadConfiguredVitalElements(formId),
  );

  // Search filter for Available Elements on Right Table
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  // Available elements = All 46 elements minus currently selected ones
  const availableElements = useMemo(() => {
    const selectedIds = new Set(selectedElements.map((e) => e.elementId));
    return VITAL_ELEMENTS_CATALOG.filter((el) => {
      if (selectedIds.has(el.elementId)) return false;
      if (categoryFilter !== 'all' && el.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          el.name.toLowerCase().includes(term) ||
          el.category.toLowerCase().includes(term) ||
          (el.description && el.description.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [selectedElements, searchTerm, categoryFilter]);

  // Handle adding an element from Available -> Selected
  const handleAddElement = (def: VitalElementDef) => {
    const next: ConfiguredVitalElement = {
      code: def.code,
      elementId: def.elementId,
      name: def.name,
      basis: def.defaultBasis,
      isRequired: def.defaultRequired,
      order: selectedElements.length + 1,
    };
    setSelectedElements((prev) => [...prev, next]);
  };

  // Handle removing an element from Selected -> Available
  const handleRemoveElement = (code: string) => {
    setSelectedElements((prev) => prev.filter((e) => e.code !== code));
  };

  // Handle updating basis (Visit 'V', Time 'T', Patient 'P')
  const handleUpdateBasis = (code: string, basis: VitalBasis) => {
    setSelectedElements((prev) =>
      prev.map((e) => (e.code === code ? { ...e, basis } : e)),
    );
  };

  // Handle toggling Is Required
  const handleToggleRequired = (code: string) => {
    setSelectedElements((prev) =>
      prev.map((e) => (e.code === code ? { ...e, isRequired: !e.isRequired } : e)),
    );
  };

  // Save changes
  const handleSave = () => {
    setSaving(true);
    try {
      saveConfiguredVitalElements(formId, selectedElements);
      alert.showSuccessMsg(`Saved ${selectedElements.length} Vital Elements successfully.`);
    } catch {
      alert.showErrorMsg('Failed to save vital elements configuration.');
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  // Reset to default 12 elements
  const handleResetDefaults = () => {
    if (window.confirm('Reset selected vital elements to the standard 12 reference defaults?')) {
      setSelectedElements(DEFAULT_SELECTED_VITAL_ELEMENTS);
      saveConfiguredVitalElements(formId, DEFAULT_SELECTED_VITAL_ELEMENTS);
      alert.showSuccessMsg('Reset to standard 12 vital elements.');
    }
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '16px 24px', fontFamily: 'inherit' }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3182ce',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
              marginBottom: 4,
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Back to EMR Form Builder
          </button>
          <h2 style={{ margin: 0, fontSize: 20, color: '#2d3748', fontWeight: 700 }}>
            EMR Standard Panel Element Master
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              padding: '7px 14px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              background: '#fff',
              color: '#4a5568',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '7px 18px',
              fontSize: 13,
              borderRadius: 6,
              border: 'none',
              background: '#2b6cb0',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(43,108,176,0.3)',
            }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Save & Assign'}
          </button>
        </div>
      </div>

      {/* Brown Header Banner matching Simplex HIMES v9.3 */}
      <div
        style={{
          background: 'linear-gradient(90deg, #795548, #5d4037)',
          borderRadius: 8,
          padding: '14px 20px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.3 }}>
            Edit EMR Standard Panel Element
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
            Standard Panel Name : <strong style={{ color: '#ffecb3' }}>VITALS</strong>
          </div>
        </div>
        <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: 20 }}>
          {selectedElements.length} Selected · {availableElements.length} Available
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Left Column: Selected Elements Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: '#edf2f7',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: 14,
              color: '#2d3748',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              <i className="fa-solid fa-list-check" style={{ color: '#2b6cb0', marginRight: 8 }} />
              Selected Elements ({selectedElements.length})
            </span>
            <span style={{ fontSize: 11, color: '#718096', fontWeight: 500 }}>
              Drag or remove elements to configure panel layout
            </span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0', color: '#4a5568' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: 44 }}>Remove</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Element Names</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: 85 }} title="Visit Based">Visit (V)</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: 85 }} title="Time Based">Time (T)</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: 85 }} title="Patient Based">Patient (P)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: 95 }}>Is Required</th>
                </tr>
              </thead>
              <tbody>
                {selectedElements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>
                      No elements selected. Add elements from the Available Elements panel on the right.
                    </td>
                  </tr>
                ) : (
                  selectedElements.map((el, idx) => (
                    <tr
                      key={el.code}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        background: idx % 2 === 0 ? '#fff' : '#fafafa',
                      }}
                    >
                      {/* Remove Button */}
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveElement(el.code)}
                          title={`Remove ${el.name}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </td>

                      {/* Element Name */}
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#2d3748' }}>
                        <span style={{ color: '#718096', fontSize: 11, marginRight: 6 }}>{idx + 1}.</span>
                        {el.name}
                      </td>

                      {/* Visit Based (V) */}
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`basis_${el.code}`}
                          checked={el.basis === 'V'}
                          onChange={() => handleUpdateBasis(el.code, 'V')}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Time Based (T) */}
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`basis_${el.code}`}
                          checked={el.basis === 'T'}
                          onChange={() => handleUpdateBasis(el.code, 'T')}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Patient Based (P) */}
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`basis_${el.code}`}
                          checked={el.basis === 'P'}
                          onChange={() => handleUpdateBasis(el.code, 'P')}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Is Required (Yes/No switch) */}
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleRequired(el.code)}
                          style={{
                            border: 'none',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: el.isRequired ? '#e6fffa' : '#edf2f7',
                            color: el.isRequired ? '#234e52' : '#718096',
                          }}
                        >
                          {el.isRequired ? 'Yes' : 'No'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Available Elements Pool (All 46) */}
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: '#edf2f7',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: 14,
              color: '#2d3748',
            }}
          >
            <i className="fa-solid fa-layer-group" style={{ color: '#dd6b20', marginRight: 8 }} />
            Available Elements ({availableElements.length})
          </div>

          {/* Search & Filter Bar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #edf2f7', display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0', fontSize: 12 }}
              />
              <input
                type="text"
                placeholder="Search available elements…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 12,
                color: '#4a5568',
                background: '#fff',
              }}
            >
              <option value="all">All Types</option>
              <option value="vital">General Vitals</option>
              <option value="anthropometry">Anthropometry</option>
              <option value="triage">Triage / ED</option>
              <option value="hemodialysis">Hemodialysis</option>
              <option value="respiratory">Respiratory</option>
              <option value="screening">Screening</option>
              <option value="pain">Pain</option>
            </select>
          </div>

          {/* Available Elements List */}
          <div style={{ maxHeight: 'calc(100vh - 330px)', overflowY: 'auto', padding: 8 }}>
            {availableElements.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#a0aec0', fontSize: 13 }}>
                All matching elements are already selected.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                {availableElements.map((el) => (
                  <div
                    key={el.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#f7fafc',
                      borderRadius: 6,
                      border: '1px solid #edf2f7',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {el.icon && <i className={el.icon} style={{ color: '#718096', fontSize: 12 }} />}
                        <span>{el.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>
                        {el.category.toUpperCase()} {el.uom ? `· ${el.uom}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddElement(el)}
                      title={`Add ${el.name} to panel`}
                      style={{
                        background: '#3182ce',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <i className="fa-solid fa-plus" /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
