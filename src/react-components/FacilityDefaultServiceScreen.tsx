import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface DefaultServiceItem {
  Id?: number;
  FacilityId?: number;
  ServiceItemId?: number;
  ServiceName?: string;
  ItemCode?: string;
  Quantity?: number;
  PatientTypeId?: number;
  VisitTypeId?: number;
  GuarantorTypeId?: number;
  GuarantorId?: number;
  EligibleDaysFromId?: number;
  EligibleDays?: number;
  Status?: number; // 1 = Active, 2 = Deleted
  [key: string]: any;
}

export interface FacilityDefaultServiceScreenProps {
  facilityId?: number;
  onAction?: (actionName: string, payload?: any) => void;
}

export const FacilityDefaultServiceScreen: React.FC<FacilityDefaultServiceScreenProps> = ({
  facilityId = 0,
  onAction
}) => {
  const [items, setItems] = useState<DefaultServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingRowIdx, setSearchingRowIdx] = useState<number | null>(null);

  const [lookups, setLookups] = useState<{
    EncounterType: Array<{ Id: number; Text: string }>;
    VisitType: Array<{ Id: number; Text: string }>;
    GuarantorType: Array<{ Id: number; Text: string }>;
    PatientGuarantor: Array<{ Id: number; Text: string; GuarantorTypeId?: number }>;
    EligibleDaysFrom: Array<{ Id: number; Text: string }>;
  }>({
    EncounterType: [],
    VisitType: [],
    GuarantorType: [],
    PatientGuarantor: [],
    EligibleDaysFrom: [
      { Id: 1, Text: 'Admission Date' },
      { Id: 2, Text: 'Discharge Date' },
      { Id: 3, Text: 'Bill Date' }
    ]
  });

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Lookups
        const lookupRes = await apiFetch('General/Options/getoptions', [
          { Key: 'EncounterType' },
          { Key: 'VisitType' },
          { Key: 'GuarantorType' },
          { Key: 'PatientGuarantor' },
          { Key: 'EligibleDaysFrom' }
        ]);

        if (isMounted && lookupRes) {
          setLookups(prev => ({
            ...prev,
            EncounterType: lookupRes.EncounterType || [],
            VisitType: lookupRes.VisitType || [],
            GuarantorType: lookupRes.GuarantorType || [],
            PatientGuarantor: lookupRes.PatientGuarantor || [],
            EligibleDaysFrom: lookupRes.EligibleDaysFrom?.length ? lookupRes.EligibleDaysFrom : prev.EligibleDaysFrom
          }));
        }

        // 2. Default services list
        if (facilityId > 0) {
          const res = await apiFetch('SystemSettings/facilitydefaultservice/GetFacilityDefaultServices', {
            Params: [{ Key: 1, Value: facilityId }],
            PageContext: { PageSize: 500, PageNumber: 1 }
          });
          if (isMounted && res && res.Data) {
            const list = res.Data.map((d: any) => ({
              ...d,
              Status: d.Status ?? 1,
              ServiceName: d.ServiceName || d.ServiceItem?.Name || '',
              ItemCode: d.ItemCode || d.ServiceItem?.ItemCode || ''
            }));
            setItems(list.length > 0 ? list : [createEmptyLine()]);
          } else if (isMounted) {
            setItems([createEmptyLine()]);
          }
        } else if (isMounted) {
          setItems([createEmptyLine()]);
        }
      } catch (err) {
        console.error('Failed to load facility default services', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [facilityId]);

  const createEmptyLine = (): DefaultServiceItem => ({
    FacilityId: facilityId,
    ServiceItemId: undefined,
    ServiceName: '',
    ItemCode: '',
    Quantity: 1,
    PatientTypeId: undefined,
    VisitTypeId: undefined,
    GuarantorTypeId: undefined,
    GuarantorId: undefined,
    EligibleDaysFromId: 1,
    EligibleDays: 0,
    Status: 1
  });

  const handleAddNewRow = () => {
    setItems(prev => [...prev, createEmptyLine()]);
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteRow = (index: number) => {
    setItems(prev => {
      const copy = [...prev];
      if (copy[index].Id) {
        // Mark for deletion on save
        copy[index] = { ...copy[index], Status: 2 };
      } else {
        // Newly added unsaved row
        copy.splice(index, 1);
      }
      return copy.length > 0 ? copy : [createEmptyLine()];
    });
  };

  // Autocomplete service item search
  const handleServiceSearch = async (query: string, rowIndex: number) => {
    setSearchQuery(query);
    setSearchingRowIdx(rowIndex);
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await apiFetch('ClinicalMaster/ServiceItem/GetServiceItems', {
        Params: [
          { Key: 4, Value: 2 },
          { Key: 34, Value: [-1, facilityId] },
          { Key: 1, Value: query }
        ],
        PageContext: { PageSize: 20, PageNumber: 1 }
      });
      if (res && res.Data) {
        setSearchResults(res.Data);
      }
    } catch (e) {
      console.warn('Search service items failed', e);
    }
  };

  const selectServiceItem = (rowIndex: number, item: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        ServiceItemId: item.Id,
        ServiceName: item.Name,
        ItemCode: item.ItemCode
      };
      return copy;
    });
    setSearchingRowIdx(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const activeRows = items.filter(i => i.Status === 1 && i.ServiceItemId);
      if (activeRows.length === 0 && !items.some(i => i.Status === 2)) {
        setMsg({ type: 'error', text: 'Please add at least one service item before saving.' });
        setSaving(false);
        return;
      }

      // Check validations
      for (const row of activeRows) {
        if (!row.ServiceItemId) {
          setMsg({ type: 'error', text: 'Service item is required for each line.' });
          setSaving(false);
          return;
        }
        if (!row.Quantity || row.Quantity < 1) {
          setMsg({ type: 'error', text: 'Quantity must be at least 1.' });
          setSaving(false);
          return;
        }
      }

      const payload = items.map(item => ({
        ...item,
        FacilityId: facilityId
      }));

      await apiFetch('SystemSettings/facilitydefaultservice/ManageFacilityDefaultService', { Data: payload });
      setMsg({ type: 'success', text: 'Default services saved successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to save default services.' });
    } finally {
      setSaving(false);
    }
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textBody,
    background: colors.surfaceMuted,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap'
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: '13px',
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'top'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    fontSize: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    boxSizing: 'border-box',
    fontFamily: typography.fontFamily
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    background: '#ffffff'
  };

  const visibleRows = items.map((item, idx) => ({ item, idx })).filter(({ item }) => item.Status === 1);

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
        <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary }} />
        <div style={{ marginTop: spacing.sm, fontSize: 13 }}>Loading default services...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.textMain }}>
            Facility Default Services
          </h4>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            Configure automatic default billing items for patients visiting this facility.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddNewRow}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: radii.md,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <i className="fa fa-plus" />
          <span>Add Service Line</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: radii.md,
            marginBottom: spacing.md,
            fontSize: 13,
            fontWeight: 500,
            background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: msg.type === 'success' ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <i className={`fa ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid Table */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          overflow: 'visible',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: spacing.lg
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
            <thead>
              <tr>
                <th style={{ ...tableHeaderStyle, width: '22%' }}>Service Name *</th>
                <th style={{ ...tableHeaderStyle, width: '8%' }}>Qty *</th>
                <th style={{ ...tableHeaderStyle, width: '14%' }}>Patient Type *</th>
                <th style={{ ...tableHeaderStyle, width: '13%' }}>Visit Type</th>
                <th style={{ ...tableHeaderStyle, width: '13%' }}>Guarantor Type *</th>
                <th style={{ ...tableHeaderStyle, width: '14%' }}>Guarantor Name</th>
                <th style={{ ...tableHeaderStyle, width: '11%' }}>Eligible Days</th>
                <th style={{ ...tableHeaderStyle, width: '5%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ item, idx }) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? colors.surface : colors.surfaceMuted }}>
                  {/* Service Autocomplete */}
                  <td style={tableCellStyle}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder="Search service item..."
                        value={searchingRowIdx === idx ? searchQuery : (item.ServiceName ? `${item.ItemCode ? item.ItemCode + ' - ' : ''}${item.ServiceName}` : '')}
                        onFocus={() => {
                          setSearchingRowIdx(idx);
                          setSearchQuery(item.ServiceName || '');
                        }}
                        onChange={(e) => handleServiceSearch(e.target.value, idx)}
                      />
                      {searchingRowIdx === idx && searchResults.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#fff',
                            border: `1px solid ${colors.borderStrong}`,
                            borderRadius: radii.md,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            maxHeight: 200,
                            overflowY: 'auto'
                          }}
                        >
                          {searchResults.map((sr) => (
                            <div
                              key={sr.Id}
                              onClick={() => selectServiceItem(idx, sr)}
                              style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${colors.border}`
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryLight)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                              <div style={{ fontWeight: 600, color: colors.textMain }}>{sr.Name}</div>
                              <div style={{ fontSize: 11, color: colors.textMuted }}>Code: {sr.ItemCode}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      min={1}
                      style={inputStyle}
                      value={item.Quantity ?? 1}
                      onChange={(e) => handleRowChange(idx, 'Quantity', parseInt(e.target.value, 10))}
                    />
                  </td>

                  {/* Patient Type */}
                  <td style={tableCellStyle}>
                    <select
                      style={selectStyle}
                      value={item.PatientTypeId || ''}
                      onChange={(e) => handleRowChange(idx, 'PatientTypeId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    >
                      <option value="">Select Type</option>
                      {lookups.EncounterType.map((et) => (
                        <option key={et.Id} value={et.Id}>{et.Text}</option>
                      ))}
                    </select>
                  </td>

                  {/* Visit Type */}
                  <td style={tableCellStyle}>
                    <select
                      style={selectStyle}
                      value={item.VisitTypeId || ''}
                      onChange={(e) => handleRowChange(idx, 'VisitTypeId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    >
                      <option value="">Select Visit</option>
                      {lookups.VisitType.map((vt) => (
                        <option key={vt.Id} value={vt.Id}>{vt.Text}</option>
                      ))}
                    </select>
                  </td>

                  {/* Guarantor Type */}
                  <td style={tableCellStyle}>
                    <select
                      style={selectStyle}
                      value={item.GuarantorTypeId || ''}
                      onChange={(e) => handleRowChange(idx, 'GuarantorTypeId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    >
                      <option value="">Select Guarantor</option>
                      {lookups.GuarantorType.map((gt) => (
                        <option key={gt.Id} value={gt.Id}>{gt.Text}</option>
                      ))}
                    </select>
                  </td>

                  {/* Guarantor Name */}
                  <td style={tableCellStyle}>
                    <select
                      style={selectStyle}
                      value={item.GuarantorId || ''}
                      onChange={(e) => handleRowChange(idx, 'GuarantorId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    >
                      <option value="">Select Payer</option>
                      {lookups.PatientGuarantor
                        .filter(pg => !item.GuarantorTypeId || pg.GuarantorTypeId === item.GuarantorTypeId)
                        .map((pg) => (
                          <option key={pg.Id} value={pg.Id}>{pg.Text}</option>
                        ))}
                    </select>
                  </td>

                  {/* Eligible Days */}
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      min={0}
                      style={inputStyle}
                      value={item.EligibleDays ?? 0}
                      onChange={(e) => handleRowChange(idx, 'EligibleDays', parseInt(e.target.value, 10))}
                    />
                  </td>

                  {/* Action */}
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      title="Delete Line"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: 14
                      }}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 24px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#ffffff',
            background: colors.primary,
            border: 'none',
            borderRadius: radii.md,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
          }}
        >
          {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />}
          <span>Save Default Services</span>
        </button>
      </div>
    </div>
  );
};
