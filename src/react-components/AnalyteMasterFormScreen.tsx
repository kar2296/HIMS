import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { callBackendApi } from '../services/apiService';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  Name?: string;
  [key: string]: any;
}

export interface AnalyteMasterFormData {
  Id?: number;
  Code?: string;
  Name?: string;
  Description?: string;
  Mnemonics?: string;
  AnalyteTypeId?: number;
  AnalyteuomId?: string | number;
  Valuetype_e?: number;
  Listofvalue?: string;
  Formula?: string;
  Displayorder?: number | string;
  Printorder?: number | string;
  Methodology?: string;
  SampletypeId?: number;
  IsActive?: boolean;
  IsWrapResult?: boolean;
  IsTemplates?: boolean;
  Observation?: string;
  ActiveStatusId?: number;
  FacilityId?: number;
  OrganizationId?: number;
  Activefrom?: string | Date;
  [key: string]: any;
}

export interface AnalyteMasterFormScreenProps {
  reactProps?: {
    id?: number;
    item?: AnalyteMasterFormData;
    lookup?: Record<string, LookupOption[]>;
    isModal?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// All Result Types / Value Types supported in previous LIS codebase (ANALYTEVALUETYPE / ValueType)
export const DEFAULT_VALUE_TYPES: LookupOption[] = [
  { Id: 5, Text: 'Numeric (Quantitative)' },
  { Id: 4, Text: 'Dropdown (List of Values)' },
  { Id: 2, Text: 'Text (Free Text / Single Line)' },
  { Id: 1, Text: 'Notes (Multiline Clinical Notes)' },
  { Id: 3, Text: 'Word Editor (Rich Text / Narrative / CKEditor)' },
  { Id: 7, Text: 'Calculation (Auto Formula Expression)' },
  { Id: 6, Text: 'OrdQuant (Ordinal / Quantitative)' },
];

export const COMMON_UOM_LIST: string[] = [
  'mg/dl',
  'g/dl',
  'mmol/L',
  'µmol/L',
  'IU/L',
  'mEq/L',
  '%',
  'cells/cumm',
  'mg/L',
  'ng/mL',
  'pg/mL',
  'µg/dL',
  'U/L',
  'sec',
  'fl',
  'gm%',
  'cell/cumm',
  '/hpf',
  '/cumm',
  'Index',
  'KIU/L',
  'm/l',
];

export const DEFAULT_ANALYTE_TYPES: LookupOption[] = [
  { Id: 1, Text: 'Lab' },
  { Id: 2, Text: 'Radiology' },
  { Id: 3, Text: 'Ambulatory' },
  { Id: 4, Text: 'Endoscopy' },
  { Id: 5, Text: 'Nuclear Medicine' },
];

export const DEFAULT_SAMPLE_TYPES: LookupOption[] = [
  { Id: 15, Text: 'Blood' },
  { Id: 80, Text: 'Serum' },
  { Id: 2, Text: 'Urine' },
  { Id: 3, Text: '24 hrs Urine & Serum' },
  { Id: 4, Text: '24 hrs Urine with 6N HCL' },
  { Id: 5, Text: 'Tissue' },
  { Id: 12, Text: 'Ascitic Fluid' },
  { Id: 14, Text: 'BAL / Tracheal Sample' },
  { Id: 17, Text: 'BM Smears' },
  { Id: 19, Text: 'Body Fluid' },
  { Id: 21, Text: 'CSF' },
  { Id: 22, Text: 'Plasma' },
  { Id: 23, Text: 'Stool' },
  { Id: 24, Text: 'Sputum' },
  { Id: 25, Text: 'Swab' },
  { Id: 26, Text: 'Synovial Fluid' },
  { Id: 27, Text: 'Pleural Fluid' },
  { Id: 28, Text: 'Peritoneal Fluid' },
  { Id: 6, Text: 'Any Sample' },
];

export const AnalyteMasterFormScreen: React.FC<AnalyteMasterFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const analyteId = useMemo(() => {
    if (reactProps?.id && Number(reactProps.id) > 0) return Number(reactProps.id);
    if (reactProps?.item?.Id && Number(reactProps.item.Id) > 0) return Number(reactProps.item.Id);
    // Fallback: parse from hash path or query string
    const match = window.location.hash.match(/analytemaster\/(\d+)/) || window.location.hash.match(/[?&]id=(\d+)/);
    if (match && match[1]) {
      const parsed = parseInt(match[1]);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }, [reactProps?.id, reactProps?.item?.Id]);

  const isNew = analyteId === 0 || analyteId === -1;

  // Form State
  const [formData, setFormData] = useState<AnalyteMasterFormData>({
    Id: isNew ? 0 : analyteId,
    Code: '',
    Name: '',
    Mnemonics: '',
    AnalyteTypeId: 1,
    AnalyteuomId: '',
    Valuetype_e: 5, // Default Numeric
    Listofvalue: '',
    Formula: '',
    Displayorder: '',
    Printorder: '',
    Methodology: '',
    SampletypeId: 80, // Default Serum
    IsActive: true,
    IsWrapResult: false,
    IsTemplates: false,
    Observation: '',
    ActiveStatusId: 2,
    FacilityId: 1,
    OrganizationId: 1,
  });

  // Lookups state with resilient fallbacks
  const [lookups, setLookups] = useState<Record<string, LookupOption[]>>({
    ANALYTETYPE: DEFAULT_ANALYTE_TYPES,
    ANALYTEVALUETYPE: DEFAULT_VALUE_TYPES,
    ANALYTEUOM: [],
    SampleMaster: DEFAULT_SAMPLE_TYPES,
    GRAPHTYPE: [],
    ...(reactProps?.lookup || {}),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);

  // Sync from reactProps if provided by Angular
  useEffect(() => {
    const item = reactProps?.item;
    if (item) {
      setFormData((prev) => ({
        ...prev,
        ...item,
        IsActive: item.IsActive !== undefined ? Boolean(item.IsActive) : true,
        IsWrapResult: Boolean(item.IsWrapResult),
        IsTemplates: Boolean(item.IsTemplates),
      }));
    }
  }, [reactProps?.item]);

  useEffect(() => {
    if (reactProps?.lookup && Object.keys(reactProps.lookup).length > 0) {
      setLookups((prev) => ({
        ...prev,
        ...reactProps.lookup,
      }));
    }
  }, [reactProps?.lookup]);

  // Load lookups if missing
  const fetchLookups = useCallback(async () => {
    try {
      const optionsInput = [
        { Key: 'Organization' },
        { Key: 'Facility', Request: { Params: [{ Key: 4, Value: true }] } },
        { Key: 'ANALYTETYPE' },
        { Key: 'ANALYTEUOM' },
        { Key: 'ANALYTEVALUETYPE' },
        { Key: 'SampleMaster', Request: { Params: [{ Key: 3, Value: 2 }] } },
        { Key: 'GRAPHTYPE' },
      ];
      const res = await apiFetch('General/Options/getoptions', optionsInput);
      if (res && typeof res === 'object') {
        setLookups((prev) => ({
          ...prev,
          ...res,
          ANALYTETYPE: (res.ANALYTETYPE && res.ANALYTETYPE.length > 0) ? res.ANALYTETYPE : prev.ANALYTETYPE,
          ANALYTEVALUETYPE: (res.ANALYTEVALUETYPE && res.ANALYTEVALUETYPE.length > 0) ? res.ANALYTEVALUETYPE : prev.ANALYTEVALUETYPE,
          SampleMaster: (res.SampleMaster && res.SampleMaster.length > 0) ? res.SampleMaster : prev.SampleMaster,
        }));
      }
    } catch (err) {
      console.warn('Failed to load analytemaster lookups via API, using defaults:', err);
    }
  }, []);

  // Compute finalized options for selects (combines backend items with descriptive labels)
  const availableValueTypes = useMemo(() => {
    const raw = lookups.ANALYTEVALUETYPE?.length ? lookups.ANALYTEVALUETYPE : DEFAULT_VALUE_TYPES;
    // Map with descriptive texts from DEFAULT_VALUE_TYPES if raw item has short description
    const merged = DEFAULT_VALUE_TYPES.map((def) => {
      const existing = raw.find((r) => r.Id === def.Id);
      return existing ? { ...existing, Text: def.Text } : def;
    });
    // Add any extra items from API not in defaults
    raw.forEach((r) => {
      if (!merged.some((m) => m.Id === r.Id)) {
        merged.push({ Id: r.Id, Text: r.Text || r.Description || `Type #${r.Id}` });
      }
    });
    return merged;
  }, [lookups.ANALYTEVALUETYPE]);

  const availableAnalyteTypes = useMemo(() => {
    return (lookups.ANALYTETYPE && lookups.ANALYTETYPE.length > 0)
      ? lookups.ANALYTETYPE
      : DEFAULT_ANALYTE_TYPES;
  }, [lookups.ANALYTETYPE]);

  const availableSampleTypes = useMemo(() => {
    return (lookups.SampleMaster && lookups.SampleMaster.length > 0)
      ? lookups.SampleMaster
      : DEFAULT_SAMPLE_TYPES;
  }, [lookups.SampleMaster]);

  // Load existing analyte or auto-generate code
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      await fetchLookups();

      // If Edit mode, load item
      if (analyteId > 0 && (!reactProps?.item || reactProps.item.Id !== analyteId)) {
        try {
          const res = await apiFetch('lis/analytemaster/GetAnalytemasterById', { Id: analyteId });
          if (isMounted && res) {
            setFormData({
              ...res,
              IsActive: res.IsActive !== undefined ? Boolean(res.IsActive) : true,
              IsWrapResult: Boolean(res.IsWrapResult),
              IsTemplates: Boolean(res.IsTemplates),
            });
          }
        } catch (err) {
          console.error('Failed to load analyte details:', err);
          if (isMounted) {
            setToastMessage({ text: 'Unable to load analyte details.', type: 'error' });
          }
        }
      } else if (isNew && !formData.Code) {
        // Auto-generate next code
        try {
          const maxIdRes = await apiFetch('lis/analytemaster/GetMaxId', { Id: 0 });
          if (isMounted && maxIdRes) {
            const rawNum = String(maxIdRes);
            const padded = rawNum.padStart(4, '0');
            let prefix = '';
            try {
              const utl = (window as any).angular?.element(document.body).injector()?.get('utl');
              const cfgPrefix = utl?.FacilitySetting?.getFacilitySettingValue('autogenerationcode', 'analytemastercodeprefix');
              if (cfgPrefix) prefix = cfgPrefix;
            } catch {
              // fallback
            }
            setFormData((prev) => ({
              ...prev,
              Code: `${prefix}${padded}`,
            }));
          }
        } catch (err) {
          console.warn('Could not auto-generate analyte code:', err);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [analyteId, isNew, fetchLookups]);

  // Form field change handler
  const handleChange = (field: keyof AnalyteMasterFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.Code?.trim()) newErrors.Code = 'Parameter Code is required';
    if (!formData.Name?.trim()) newErrors.Name = 'Parameter Name is required';
    if (!formData.Valuetype_e) newErrors.Valuetype_e = 'Result Type is required';

    // Conditional validations
    if (formData.Valuetype_e === 4 && !formData.Listofvalue?.trim()) {
      newErrors.Listofvalue = 'List of Values is required for Dropdown Result Type';
    }
    if (formData.Valuetype_e === 7 && !formData.Formula?.trim()) {
      newErrors.Formula = 'Formula expression is required for Auto Calculation';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setToastMessage({ text: 'Please fill in required fields (Code and Name).', type: 'error' });
      return false;
    }
    return true;
  };

  // Save execution
  const executeSave = async () => {
    setConfirmDialog(false);
    if (!validate()) return;

    setIsSaving(true);
    const targetId = analyteId > 0 ? analyteId : (formData.Id && formData.Id > 0 ? formData.Id : 0);
    const payload: AnalyteMasterFormData = {
      ...formData,
      Id: targetId,
      ActiveStatusId: formData.IsActive ? 2 : 3,
    };

    if (onAction) {
      onAction('saveAndApprove', payload);
      setToastMessage({
        text: 'Saving analyte parameter changes...',
        type: 'info',
      });
      setTimeout(() => setIsSaving(false), 600);
      return;
    }

    try {
      const endpoint = targetId > 0 ? 'lis/analytemaster/UpdateAnalytemaster' : 'lis/analytemaster/AddAnalytemaster';
      const res = await callBackendApi(endpoint, { Data: payload });
      setIsSaving(false);
      setToastMessage({
        text: 'Analyte parameter saved successfully!',
        type: 'success',
      });

      if (res && typeof res === 'number') {
        window.location.hash = `#/app/analytetab/${res}/analytemaster/${res}`;
      } else if (res && typeof res === 'object' && res.Data?.Id) {
        window.location.hash = `#/app/analytetab/${res.Data.Id}/analytemaster/${res.Data.Id}`;
      } else {
        setTimeout(() => {
          window.location.hash = '#/app/analytemasters';
        }, 1200);
      }
    } catch (err: any) {
      setIsSaving(false);
      console.error('Save analyte master failed:', err);
      const errMsg = err?.Error?.Message || 'Failed to save analyte parameter. Please check details.';
      setToastMessage({ text: errMsg, type: 'error' });
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      window.location.hash = '#/app/analytemasters';
    }
  };

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Listen for global actions dispatched from header/tab bars
  useEffect(() => {
    const handleTriggerSave = () => {
      setConfirmDialog(true);
    };
    const handleTriggerBack = () => {
      handleBackToList();
    };
    window.addEventListener('analyteMaster:triggerSave', handleTriggerSave);
    window.addEventListener('analyteMaster:triggerBack', handleTriggerBack);
    return () => {
      window.removeEventListener('analyteMaster:triggerSave', handleTriggerSave);
      window.removeEventListener('analyteMaster:triggerBack', handleTriggerBack);
    };
  }, [formData, analyteId]);

  const isAutoCalculation = formData.Valuetype_e === 7;
  const isListOfValues = formData.Valuetype_e === 4;

  const parsedListOfValues = (formData.Listofvalue || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="am-page-container"
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0 4px 60px 4px',
      }}
    >
      <style>{`
        /* Suppress obstructive legacy copyright footer to keep Save and Back action bars fully visible */
        footer.ng-scope, .footer-content, #main-footer {
          display: none !important;
        }
        .am-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.015);
          transition: box-shadow 0.2s ease;
        }
        .am-card:hover {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
        }
        .am-card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 14px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .am-field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .am-label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
        }
        .am-required {
          color: #ef4444;
          font-weight: 700;
        }
        .am-input, .am-select {
          width: 100%;
          height: 34px;
          padding: 0 10px;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease-in-out;
        }
        .am-textarea {
          width: 100%;
          height: 56px;
          padding: 6px 10px;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
          transition: all 0.15s ease-in-out;
        }
        .am-input:focus, .am-select:focus, .am-textarea:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 2.5px rgba(2, 132, 199, 0.15);
        }
        .am-input-error {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
        .am-error-msg {
          font-size: 11px;
          color: #dc2626;
          font-weight: 500;
          margin-top: 2px;
        }
        /* Grid Layouts - Supporting both .am-grid-* and legacy .tm-grid-* classes */
        .am-grid-4, .tm-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px 16px;
        }
        .am-grid-3, .tm-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px 16px;
        }
        .am-grid-2, .tm-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 16px;
        }
        @media (max-width: 1024px) {
          .am-grid-4, .tm-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .am-grid-4, .tm-grid-4, .am-grid-3, .tm-grid-3, .am-grid-2, .tm-grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .am-toggle-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .am-toggle-card:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .am-toggle-card.active {
          background-color: #f0f9ff;
          border-color: #bae6fd;
        }
      `}</style>

      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '25px',
            zIndex: 9999,
            padding: '10px 18px',
            borderRadius: radii.md,
            backgroundColor:
              toastMessage.type === 'success'
                ? '#059669'
                : toastMessage.type === 'error'
                ? '#dc2626'
                : '#0284c7',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <i
            className={`fa-solid ${
              toastMessage.type === 'success'
                ? 'fa-circle-check'
                : toastMessage.type === 'error'
                ? 'fa-circle-exclamation'
                : 'fa-circle-info'
            }`}
          />
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              marginLeft: '8px',
              padding: '2px',
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              padding: '22px 26px',
              maxWidth: '430px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: radii.full,
                  backgroundColor: '#eff6ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                }}
              >
                <i className="fa-solid fa-badge-check" />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.textMain }}>
                Confirm Parameter Approval
              </h3>
            </div>

            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5 }}>
              Are you sure you want to approve and save analyte &quot;{formData.Name || formData.Code}&quot;?
              This parameter will be available across all linked laboratory tests and result entry screens.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                }}
              >
                Yes, Save & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Actions Bar (Save & Back Options) ── */}
      <div
        id="analyteFormTopBar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: radii.xl,
          padding: '12px 20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <button
          type="button"
          id="btnBackTop"
          onClick={handleBackToList}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: radii.md,
            backgroundColor: '#f8fafc',
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = colors.borderStrong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = colors.border;
          }}
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Parameter List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            id="btnSaveTop"
            disabled={isSaving}
            onClick={() => setConfirmDialog(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 22px',
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.35)';
              }
            }}
          >
            <i className="fa-solid fa-circle-check" />
            <span>{isSaving ? 'Saving...' : 'Save & Approve'}</span>
          </button>
        </div>
      </div>

      {/* ── CARD 1: Analyte Definition & Identity ── */}
      <div className="am-card">
        <div className="am-card-title">
          <i className="fa-solid fa-dna" style={{ color: '#0284c7' }} />
          <span>Analyte Definition & Identity</span>
        </div>

        <div className="am-grid-4">
          {/* Analyte Type */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Analyte Type</span>
              <span className="am-required">*</span>
            </label>
            <select
              className="am-select"
              value={formData.AnalyteTypeId || 1}
              onChange={(e) => handleChange('AnalyteTypeId', Number(e.target.value))}
            >
              {availableAnalyteTypes.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Parameter Code */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Parameter Code</span>
              <span className="am-required">*</span>
            </label>
            <input
              type="text"
              className={`am-input ${errors.Code ? 'am-input-error' : ''}`}
              value={formData.Code || ''}
              onChange={(e) => handleChange('Code', e.target.value)}
              placeholder="e.g. BC0003"
            />
            {errors.Code && <span className="am-error-msg">{errors.Code}</span>}
          </div>

          {/* Parameter Name */}
          <div className="am-field-group" style={{ gridColumn: 'span 2' }}>
            <label className="am-label">
              <span>Parameter Name</span>
              <span className="am-required">*</span>
            </label>
            <input
              type="text"
              className={`am-input ${errors.Name ? 'am-input-error' : ''}`}
              value={formData.Name || ''}
              onChange={(e) => handleChange('Name', e.target.value)}
              placeholder="e.g. SERUM - CREATININE"
            />
            {errors.Name && <span className="am-error-msg">{errors.Name}</span>}
          </div>
        </div>

        <div className="am-grid-3" style={{ marginTop: '14px' }}>
          {/* Mnemonic */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Mnemonic (Short Code)</span>
              <span className="am-required">*</span>
            </label>
            <input
              type="text"
              className={`am-input ${errors.Mnemonics ? 'am-input-error' : ''}`}
              value={formData.Mnemonics || ''}
              onChange={(e) => handleChange('Mnemonics', e.target.value)}
              placeholder="e.g. CR-SE"
            />
            {errors.Mnemonics && <span className="am-error-msg">{errors.Mnemonics}</span>}
          </div>

          {/* UOM */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Unit of Measure (UOM)</span>
            </label>
            <input
              type="text"
              list="common-uom-list"
              className="am-input"
              value={formData.AnalyteuomId || ''}
              onChange={(e) => handleChange('AnalyteuomId', e.target.value)}
              placeholder="e.g. mg/dl, mmol/L, %"
            />
            <datalist id="common-uom-list">
              {COMMON_UOM_LIST.map((uom) => (
                <option key={uom} value={uom} />
              ))}
            </datalist>
          </div>

          {/* Result Type (Value Type) */}
          <div className="am-field-group">
            <label className="am-label">
              <i className="fa-solid fa-list-check" style={{ color: '#0284c7', fontSize: '11px' }} />
              <span>Result Type (Value Type)</span>
              <span className="am-required">*</span>
            </label>
            <select
              className={`am-select ${errors.Valuetype_e ? 'am-input-error' : ''}`}
              value={formData.Valuetype_e || ''}
              onChange={(e) => handleChange('Valuetype_e', Number(e.target.value))}
            >
              <option value="">-- Select Result Type --</option>
              {availableValueTypes.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
            {errors.Valuetype_e && <span className="am-error-msg">{errors.Valuetype_e}</span>}
          </div>
        </div>
      </div>

      {/* ── CARD 2: Specimen & Analytical Methodology ── */}
      <div className="am-card">
        <div className="am-card-title">
          <i className="fa-solid fa-microscope" style={{ color: '#0284c7' }} />
          <span>Specimen & Analytical Methodology</span>
        </div>

        <div className="am-grid-2">
          {/* Sample Type */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Sample Type (Specimen)</span>
              <span className="am-required">*</span>
            </label>
            <select
              className={`am-select ${errors.SampletypeId ? 'am-input-error' : ''}`}
              value={formData.SampletypeId || ''}
              onChange={(e) => handleChange('SampletypeId', Number(e.target.value))}
            >
              <option value="">-- Select Specimen / Sample --</option>
              {availableSampleTypes.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Name}
                </option>
              ))}
            </select>
            {errors.SampletypeId && <span className="am-error-msg">{errors.SampletypeId}</span>}
          </div>

          {/* Methodology */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Methodology</span>
              <span className="am-required">*</span>
            </label>
            <input
              type="text"
              className={`am-input ${errors.Methodology ? 'am-input-error' : ''}`}
              value={formData.Methodology || ''}
              onChange={(e) => handleChange('Methodology', e.target.value)}
              placeholder="e.g. Jaff's Method, Enzymatic, UV-Hexokinase"
            />
            {errors.Methodology && <span className="am-error-msg">{errors.Methodology}</span>}
          </div>
        </div>

        {/* Conditional Field: Dropdown List of Values */}
        {isListOfValues && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
            }}
          >
            <div className="am-field-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <label className="am-label">
                  <i className="fa-solid fa-caret-down" style={{ color: '#0284c7' }} />
                  <span>Preset List of Values (Dropdown Options for Result Entry)</span>
                  <span className="am-required">*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>Quick Presets:</span>
                  {[
                    'Positive, Negative',
                    'Reactive, Non-Reactive',
                    'Present, Absent',
                    'Nil, Trace, +, ++, +++, ++++',
                    'Clear, Slightly Turbid, Cloudy, Turbid',
                    'Normal, Abnormal'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleChange('Listofvalue', preset)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: radii.sm,
                        color: '#0284c7',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Click to set "${preset}"`}
                    >
                      {preset.length > 20 ? preset.substring(0, 18) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                className={`am-input ${errors.Listofvalue ? 'am-input-error' : ''}`}
                value={formData.Listofvalue || ''}
                onChange={(e) => handleChange('Listofvalue', e.target.value)}
                placeholder="e.g. Positive, Negative, Equivocal, Indeterminate"
              />
              {errors.Listofvalue && <span className="am-error-msg">{errors.Listofvalue}</span>}

              {/* Live Preview Chips */}
              {parsedListOfValues.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>Result Entry Dropdown Preview:</span>
                  <select
                    disabled
                    style={{
                      height: '28px',
                      padding: '0 8px',
                      fontSize: '12px',
                      borderRadius: radii.sm,
                      border: '1px solid #94a3b8',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="">Select Result Value...</option>
                    {parsedListOfValues.map((v, i) => (
                      <option key={i} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {parsedListOfValues.map((v, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: radii.full,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 500,
                          border: '1px solid #bae6fd',
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conditional Field: Formula */}
        {isAutoCalculation && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              backgroundColor: '#f0f9ff',
              borderRadius: radii.md,
              border: '1px solid #bae6fd',
            }}
          >
            <div className="am-field-group">
              <label className="am-label">
                <i className="fa-solid fa-calculator" style={{ color: '#0284c7' }} />
                <span>Auto-Calculation Formula Expression</span>
                <span className="am-required">*</span>
              </label>
              <input
                type="text"
                className={`am-input ${errors.Formula ? 'am-input-error' : ''}`}
                value={formData.Formula || ''}
                onChange={(e) => handleChange('Formula', e.target.value)}
                placeholder="e.g. ([TotalCholesterol] - [HDL]) / [Triglycerides]"
              />
              {errors.Formula && <span className="am-error-msg">{errors.Formula}</span>}
              <span style={{ fontSize: '11px', color: '#0369a1' }}>
                Use analyte mnemonic keys inside brackets (e.g. [HGB] * 3). Calculation executes automatically during result entry.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD 3: Display Sequence & Observations ── */}
      <div className="am-card">
        <div className="am-card-title">
          <i className="fa-solid fa-arrow-down-1-9" style={{ color: '#0284c7' }} />
          <span>Display Sequence & Clinical Observations</span>
        </div>

        <div className="am-grid-2">
          {/* Display Order */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Display Order</span>
            </label>
            <input
              type="number"
              className="am-input"
              value={formData.Displayorder || ''}
              onChange={(e) => handleChange('Displayorder', e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          {/* Print Order */}
          <div className="am-field-group">
            <label className="am-label">
              <span>Print Order</span>
            </label>
            <input
              type="number"
              className="am-input"
              value={formData.Printorder || ''}
              onChange={(e) => handleChange('Printorder', e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
        </div>

        {/* Observation */}
        <div className="am-field-group" style={{ marginTop: '12px' }}>
          <label className="am-label">
            <span>Clinical Observation / Interpretation Notes</span>
          </label>
          <textarea
            className="am-textarea"
            value={formData.Observation || ''}
            onChange={(e) => handleChange('Observation', e.target.value)}
            placeholder="Default observation template, clinical interpretation, or diagnostic notes for this parameter."
          />
        </div>
      </div>

      {/* ── CARD 4: Configuration & Output Flags ── */}
      <div className="am-card">
        <div className="am-card-title">
          <i className="fa-solid fa-toggle-on" style={{ color: '#0284c7' }} />
          <span>Output Formatting & Status Flags</span>
        </div>

        <div className="am-grid-3">
          {/* Is Active */}
          <div
            className={`am-toggle-card ${formData.IsActive ? 'active' : ''}`}
            onClick={() => handleChange('IsActive', !formData.IsActive)}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMain }}>Active in Catalog</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Enabled for laboratory testing</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsActive}
              onChange={(e) => handleChange('IsActive', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is Wrap Result */}
          <div
            className={`am-toggle-card ${formData.IsWrapResult ? 'active' : ''}`}
            onClick={() => handleChange('IsWrapResult', !formData.IsWrapResult)}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMain }}>Wrap Result Text</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Auto-wrap long findings in reports</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsWrapResult}
              onChange={(e) => handleChange('IsWrapResult', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is Templates */}
          <div
            className={`am-toggle-card ${formData.IsTemplates ? 'active' : ''}`}
            onClick={() => handleChange('IsTemplates', !formData.IsTemplates)}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMain }}>Template Supported</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Allows rich formatted text reports</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsTemplates}
              onChange={(e) => handleChange('IsTemplates', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Actions Bar (In-Flow & Sticky) ── */}
      <div
        id="analyteFormBottomBar"
        style={{
          position: 'sticky',
          bottom: '12px',
          backgroundColor: '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: radii.xl,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.08)',
          padding: '12px 24px',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
        }}
      >
        <button
          type="button"
          id="btnBackBottom"
          onClick={handleBackToList}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: radii.md,
            backgroundColor: '#f8fafc',
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = colors.borderStrong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = colors.border;
          }}
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Parameter List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            id="btnSaveBottom"
            disabled={isSaving}
            onClick={() => setConfirmDialog(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 24px',
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.35)';
              }
            }}
          >
            <i className="fa-solid fa-circle-check" />
            <span>{isSaving ? 'Saving...' : 'Save & Approve'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyteMasterFormScreen;
