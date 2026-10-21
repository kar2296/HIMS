import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  Volume?: number | string;
  SampleUnits?: {
    Description?: string;
  };
  [key: string]: any;
}

export interface TestMasterFormData {
  Id?: number;
  TestmasterId?: number;
  Code?: string;
  Name?: string;
  Mnemonics?: string;
  Description?: string;
  TESTMASTERTYPId?: number;
  DepartmentId?: number;
  SubDepartmentId?: number;
  TestFromLocationId?: number;
  SampletypeId?: number;
  ResourceId?: number;
  ContainertypeId?: number;
  SampleVolume?: string;
  Methodology?: string;
  DisplayOrder?: number | string;
  PrintOrder?: number | string;
  Observation?: string;
  TATInHours?: number | string;
  IsProfile?: boolean;
  IsDirectBill?: boolean;
  IsCulture?: boolean;
  IsActive?: boolean;
  IsNABLTest?: boolean;
  IsRISSync?: boolean;
  ActiveStatusId?: number;
  FacilityId?: number;
  OrganizationId?: number;
  ScheduleALL?: boolean;
  ScheduleSU?: boolean;
  ScheduleMO?: boolean;
  ScheduleTU?: boolean;
  ScheduleWE?: boolean;
  ScheduleTH?: boolean;
  ScheduleFR?: boolean;
  ScheduleSA?: boolean;
  [key: string]: any;
}

export interface TestMasterFormScreenProps {
  reactProps?: {
    id?: number;
    item?: TestMasterFormData;
    lookup?: Record<string, LookupOption[]>;
    isModal?: boolean;
    facilityName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const TestMasterFormScreen: React.FC<TestMasterFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && (reactProps.item !== undefined || reactProps.lookup !== undefined));
  const testId = reactProps?.id ?? reactProps?.item?.Id ?? 0;
  const isNew = testId === 0 || testId === -1;

  // Form State
  const [formData, setFormData] = useState<TestMasterFormData>({
    Id: isNew ? 0 : testId,
    Code: '',
    Name: '',
    Mnemonics: '',
    TESTMASTERTYPId: 1,
    DepartmentId: undefined,
    SubDepartmentId: undefined,
    TestFromLocationId: undefined,
    SampletypeId: undefined,
    ResourceId: undefined,
    ContainertypeId: undefined,
    SampleVolume: '',
    Methodology: '',
    DisplayOrder: '',
    PrintOrder: '',
    Observation: '',
    TATInHours: '',
    IsProfile: false,
    IsDirectBill: false,
    IsCulture: false,
    IsActive: true,
    IsNABLTest: false,
    IsRISSync: false,
    ActiveStatusId: 1,
    FacilityId: 1,
    OrganizationId: 1,
    ScheduleALL: true,
    ScheduleSU: true,
    ScheduleMO: true,
    ScheduleTU: true,
    ScheduleWE: true,
    ScheduleTH: true,
    ScheduleFR: true,
    ScheduleSA: true,
  });

  // Lookups state
  const [lookups, setLookups] = useState<Record<string, LookupOption[]>>({
    TESTMASTERTYP: [],
    Department: [],
    SubDepartment: [],
    LOCATION: [],
    SampleMaster: [],
    ContainterMaster: [],
    ResourceMaster: [],
    ...(reactProps?.lookup || {}),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'save' | 'approve' } | null>(null);

  // Sync from reactProps if provided by Angular
  useEffect(() => {
    const item = reactProps?.item;
    if (item) {
      setFormData((prev) => ({
        ...prev,
        ...item,
        IsActive: item.IsActive !== undefined ? Boolean(item.IsActive) : true,
        IsProfile: Boolean(item.IsProfile),
        IsDirectBill: Boolean(item.IsDirectBill),
        IsCulture: Boolean(item.IsCulture),
        IsNABLTest: Boolean(item.IsNABLTest),
        IsRISSync: Boolean(item.IsRISSync),
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
        { Key: 'TESTMASTERTYP' },
        { Key: 'Department' },
        { Key: 'SubDepartment' },
        { Key: 'LOCATION' },
        { Key: 'SampleMaster', Request: { Params: [{ Key: 3, Value: 2 }] } },
        { Key: 'ContainterMaster', Request: { Params: [{ Key: 4, Value: 2 }] } },
        { Key: 'ResourceMaster' },
        { Key: 'TATGROUP' },
        { Key: 'Side', Default: false },
        { Key: 'TestMasterPosition', Default: false },
      ];
      const res = await apiFetch('General/Options/getoptions', optionsInput);
      if (res && typeof res === 'object') {
        setLookups((prev) => ({
          ...prev,
          ...res,
        }));
      }
    } catch (err) {
      console.warn('Failed to load testmaster lookups via API:', err);
    }
  }, []);

  // Fetch subdepartments when department changes
  const handleDepartmentChange = useCallback(async (deptId: number) => {
    setFormData((prev) => ({
      ...prev,
      DepartmentId: deptId,
      SubDepartmentId: undefined, // reset subdepartment
    }));

    if (onAction) {
      onAction('getsubdeptUsers', { DepartmentId: deptId });
    }

    try {
      const res = await apiFetch('General/Options/getoptions', [
        {
          Key: 'SubDepartment',
          Request: {
            Params: [{ Key: 6, Value: deptId || -1 }],
          },
        },
      ]);
      if (res && res.SubDepartment) {
        setLookups((prev) => ({
          ...prev,
          SubDepartment: res.SubDepartment,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch filtered subdepartments:', err);
    }
  }, [onAction]);

  // Load existing test or auto-generate code
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      await fetchLookups();

      // If Edit mode, load item
      if (testId > 0 && (!reactProps?.item || reactProps.item.Id !== testId)) {
        try {
          const res = await apiFetch('lis/testmaster/GetTestmasterById', { Id: testId });
          if (isMounted && res) {
            setFormData({
              ...res,
              IsActive: res.IsActive !== undefined ? Boolean(res.IsActive) : true,
              IsProfile: Boolean(res.IsProfile),
              IsDirectBill: Boolean(res.IsDirectBill),
              IsCulture: Boolean(res.IsCulture),
              IsNABLTest: Boolean(res.IsNABLTest),
              IsRISSync: Boolean(res.IsRISSync),
            });
          }
        } catch (err) {
          console.error('Failed to load test details:', err);
          if (isMounted) {
            setToastMessage({ text: 'Unable to load test master details.', type: 'error' });
          }
        }
      } else if (isNew && !formData.Code) {
        // Auto-generate next code
        try {
          const maxIdRes = await apiFetch('lis/testmaster/GetMaxId', { Id: 0 });
          if (isMounted && maxIdRes) {
            const rawNum = String(maxIdRes);
            const padded = rawNum.padStart(4, '0');
            // Try reading prefix from window or default to TEST
            let prefix = 'TEST';
            try {
              const utl = (window as any).angular?.element(document.body).injector()?.get('utl');
              const cfgPrefix = utl?.FacilitySetting?.getFacilitySettingValue('autogenerationcode', 'testmasertcodeprefix');
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
          console.warn('Could not auto-generate code:', err);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [testId, isNew, fetchLookups]);

  // Auto-fill volume when sample type selected
  const handleSampleTypeChange = (sampleId: number) => {
    const selected = lookups.SampleMaster?.find((s) => s.Id === sampleId);
    let vol = '';
    if (selected && selected.Volume) {
      vol = `${selected.Volume} ${selected.SampleUnits?.Description || 'mL'}`.trim();
    }
    setFormData((prev) => ({
      ...prev,
      SampletypeId: sampleId,
      SampleVolume: vol || prev.SampleVolume,
    }));
    if (onAction && selected) {
      onAction('getSampleVolume', { selected });
    }
  };

  // Form field change handler
  const handleChange = (field: keyof TestMasterFormData, value: any) => {
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
    if (!formData.Code?.trim()) newErrors.Code = 'Test Code is required';
    if (!formData.Mnemonics?.trim()) newErrors.Mnemonics = 'Mnemonic code is required';
    if (!formData.Name?.trim()) newErrors.Name = 'Test Name is required';
    if (!formData.DepartmentId) newErrors.DepartmentId = 'Department is required';
    if (!formData.SubDepartmentId) newErrors.SubDepartmentId = 'Sub Department is required';
    if (!formData.Methodology?.trim()) newErrors.Methodology = 'Methodology is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setToastMessage({ text: 'Please fill in all required fields indicated in red.', type: 'error' });
      return false;
    }
    return true;
  };

  // Save execution
  const executeSave = async (isApprove: boolean) => {
    setConfirmDialog(null);
    if (!validate()) return;

    setIsSaving(true);
    const activeStatusId = isApprove ? (formData.IsActive ? 2 : 3) : 1;
    const payload: TestMasterFormData = {
      ...formData,
      ActiveStatusId: activeStatusId,
      ScheduleALL: true,
      ScheduleSU: true,
      ScheduleMO: true,
      ScheduleTU: true,
      ScheduleWE: true,
      ScheduleTH: true,
      ScheduleFR: true,
      ScheduleSA: true,
    };

    if (onAction) {
      onAction(isApprove ? 'saveAndApprove' : 'save', payload);
      setIsSaving(false);
      return;
    }

    try {
      const endpoint = testId > 0 ? 'lis/testmaster/UpdateTestmaster' : 'lis/testmaster/AddTestmaster';
      const res = await apiFetch(endpoint, { Data: payload });
      setIsSaving(false);
      setToastMessage({
        text: isApprove ? 'Test master saved and approved successfully!' : 'Test master draft saved successfully!',
        type: 'success',
      });

      if (res && typeof res === 'number') {
        window.location.hash = `#/app/testmastertab/${res}/testmaster`;
      } else if (res && typeof res === 'object' && res.Data?.Id) {
        window.location.hash = `#/app/testmastertab/${res.Data.Id}/testmaster`;
      } else {
        setTimeout(() => {
          window.location.hash = '#/app/testmasters';
        }, 1200);
      }
    } catch (err: any) {
      setIsSaving(false);
      console.error('Save test master failed:', err);
      const errMsg = err?.Error?.Message || 'Failed to save test master. Please check details.';
      setToastMessage({ text: errMsg, type: 'error' });
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      window.location.hash = '#/app/testmasters';
    }
  };

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        paddingBottom: '80px',
      }}
    >
      <style>{`
        .tm-card {
          background: #ffffff;
          border: 1px solid ${colors.border};
          border-radius: ${radii.xl};
          padding: 20px 24px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 2px 8px rgba(0, 0, 0, 0.015);
          transition: box-shadow 0.2s ease;
        }
        .tm-card:hover {
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }
        .tm-card-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .tm-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tm-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tm-required {
          color: #ef4444;
          font-weight: 700;
        }
        .tm-input, .tm-select {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: ${radii.md};
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease-in-out;
        }
        .tm-input:focus, .tm-select:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }
        .tm-input-error {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
        .tm-error-msg {
          font-size: 11.5px;
          color: #dc2626;
          font-weight: 500;
        }
        .tm-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px 22px;
        }
        .tm-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px 22px;
        }
        .tm-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px 22px;
        }
        @media (max-width: 900px) {
          .tm-grid-3, .tm-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .tm-grid-3, .tm-grid-4, .tm-grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .tm-toggle-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: ${radii.lg};
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .tm-toggle-card:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .tm-toggle-card.active {
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
            padding: '12px 20px',
            borderRadius: radii.lg,
            backgroundColor:
              toastMessage.type === 'success'
                ? '#059669'
                : toastMessage.type === 'error'
                ? '#dc2626'
                : '#0284c7',
            color: '#ffffff',
            fontSize: '13.5px',
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
              marginLeft: '10px',
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
              padding: '24px 28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: radii.full,
                  backgroundColor: confirmDialog.type === 'approve' ? '#eff6ff' : '#f8fafc',
                  color: confirmDialog.type === 'approve' ? '#0284c7' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i className={`fa-solid ${confirmDialog.type === 'approve' ? 'fa-badge-check' : 'fa-floppy-disk'}`} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: colors.textMain }}>
                {confirmDialog.type === 'approve' ? 'Confirm Approval' : 'Save Test Draft'}
              </h3>
            </div>

            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: colors.textSecondary, lineHeight: 1.5 }}>
              {confirmDialog.type === 'approve'
                ? `Are you sure you want to approve and publish "${formData.Name || formData.Code}"? Approved tests are immediately active for clinical ordering and billing.`
                : `Do you want to save "${formData.Name || formData.Code}" as a draft? You can modify and approve it later.`}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeSave(confirmDialog.type === 'approve')}
                style={{
                  padding: '8px 20px',
                  borderRadius: radii.md,
                  border: 'none',
                  background:
                    confirmDialog.type === 'approve'
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                {confirmDialog.type === 'approve' ? 'Yes, Approve' : 'Yes, Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD 1: Test Identity & Classification ── */}
      <div className="tm-card">
        <div className="tm-card-title">
          <i className="fa-solid fa-id-card" style={{ color: '#0284c7' }} />
          <span>Test Identity & Classification</span>
        </div>

        <div className="tm-grid-4">
          {/* Code */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Test Code</span>
              <span className="tm-required">*</span>
            </label>
            <input
              type="text"
              className={`tm-input ${errors.Code ? 'tm-input-error' : ''}`}
              value={formData.Code || ''}
              onChange={(e) => handleChange('Code', e.target.value)}
              placeholder="e.g. LAB-00001"
              autoFocus
            />
            {errors.Code && <span className="tm-error-msg">{errors.Code}</span>}
          </div>

          {/* Mnemonic */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Mnemonic (Short Code)</span>
              <span className="tm-required">*</span>
            </label>
            <input
              type="text"
              className={`tm-input ${errors.Mnemonics ? 'tm-input-error' : ''}`}
              value={formData.Mnemonics || ''}
              onChange={(e) => handleChange('Mnemonics', e.target.value)}
              placeholder="e.g. 17-OHP"
            />
            {errors.Mnemonics && <span className="tm-error-msg">{errors.Mnemonics}</span>}
          </div>

          {/* Name */}
          <div className="tm-field-group" style={{ gridColumn: 'span 2' }}>
            <label className="tm-label">
              <span>Full Test Name</span>
              <span className="tm-required">*</span>
            </label>
            <input
              type="text"
              className={`tm-input ${errors.Name ? 'tm-input-error' : ''}`}
              value={formData.Name || ''}
              onChange={(e) => handleChange('Name', e.target.value)}
              placeholder="e.g. 17 HYDROXYPROGESTERONE (17- OHP)"
            />
            {errors.Name && <span className="tm-error-msg">{errors.Name}</span>}
          </div>
        </div>

        <div className="tm-grid-3" style={{ marginTop: '16px' }}>
          {/* Test Type */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Test Type</span>
            </label>
            <select
              className="tm-select"
              value={formData.TESTMASTERTYPId || 1}
              onChange={(e) => handleChange('TESTMASTERTYPId', Number(e.target.value))}
            >
              {lookups.TESTMASTERTYP?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Description}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Department</span>
              <span className="tm-required">*</span>
            </label>
            <select
              className={`tm-select ${errors.DepartmentId ? 'tm-input-error' : ''}`}
              value={formData.DepartmentId || ''}
              onChange={(e) => handleDepartmentChange(Number(e.target.value))}
            >
              <option value="">-- Select Department --</option>
              {lookups.Department?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.DepartmentName}
                </option>
              ))}
            </select>
            {errors.DepartmentId && <span className="tm-error-msg">{errors.DepartmentId}</span>}
          </div>

          {/* Sub Department */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Sub Department</span>
              <span className="tm-required">*</span>
            </label>
            <select
              className={`tm-select ${errors.SubDepartmentId ? 'tm-input-error' : ''}`}
              value={formData.SubDepartmentId || ''}
              onChange={(e) => handleChange('SubDepartmentId', Number(e.target.value))}
            >
              <option value="">-- Select Sub Department --</option>
              {lookups.SubDepartment?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.DepartmentName}
                </option>
              ))}
            </select>
            {errors.SubDepartmentId && <span className="tm-error-msg">{errors.SubDepartmentId}</span>}
          </div>
        </div>
      </div>

      {/* ── CARD 2: Specimen, Methodology & Equipment ── */}
      <div className="tm-card">
        <div className="tm-card-title">
          <i className="fa-solid fa-vial-circle-check" style={{ color: '#0284c7' }} />
          <span>Specimen, Methodology & Equipment</span>
        </div>

        <div className="tm-grid-4">
          {/* Sample Type */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Sample Type</span>
            </label>
            <select
              className="tm-select"
              value={formData.SampletypeId || ''}
              onChange={(e) => handleSampleTypeChange(Number(e.target.value))}
            >
              <option value="">-- Select Sample Type --</option>
              {lookups.SampleMaster?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Sample Volume */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Sample Volume</span>
            </label>
            <input
              type="text"
              className="tm-input"
              value={formData.SampleVolume || ''}
              onChange={(e) => handleChange('SampleVolume', e.target.value)}
              placeholder="e.g. 5 mL or 10 mL"
            />
          </div>

          {/* Container Type */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Container Type</span>
            </label>
            <select
              className="tm-select"
              value={formData.ContainertypeId || ''}
              onChange={(e) => handleChange('ContainertypeId', Number(e.target.value))}
            >
              <option value="">-- Select Container --</option>
              {lookups.ContainterMaster?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Methodology */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Methodology</span>
              <span className="tm-required">*</span>
            </label>
            <input
              type="text"
              className={`tm-input ${errors.Methodology ? 'tm-input-error' : ''}`}
              value={formData.Methodology || ''}
              onChange={(e) => handleChange('Methodology', e.target.value)}
              placeholder="e.g. CLIA, EIA, HPLC"
            />
            {errors.Methodology && <span className="tm-error-msg">{errors.Methodology}</span>}
          </div>
        </div>

        <div className="tm-grid-2" style={{ marginTop: '16px' }}>
          {/* Test Location */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Processing Location</span>
            </label>
            <select
              className="tm-select"
              value={formData.TestFromLocationId || ''}
              onChange={(e) => handleChange('TestFromLocationId', Number(e.target.value))}
            >
              <option value="">-- Select Location --</option>
              {lookups.LOCATION?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.LocationName}
                </option>
              ))}
            </select>
          </div>

          {/* Resource / Machine */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Resource / Equipment</span>
            </label>
            <select
              className="tm-select"
              value={formData.ResourceId || ''}
              onChange={(e) => handleChange('ResourceId', Number(e.target.value))}
            >
              <option value="">-- Select Equipment --</option>
              {lookups.ResourceMaster?.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Turnaround Time, Ordering & Observation ── */}
      <div className="tm-card">
        <div className="tm-card-title">
          <i className="fa-solid fa-clock-rotate-left" style={{ color: '#0284c7' }} />
          <span>Turnaround Time, Sequence & Observations</span>
        </div>

        <div className="tm-grid-4">
          {/* TAT in Hours */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>TAT (Hours)</span>
            </label>
            <input
              type="number"
              className="tm-input"
              value={formData.TATInHours || ''}
              onChange={(e) => handleChange('TATInHours', e.target.value)}
              placeholder="e.g. 24 or 48"
            />
          </div>

          {/* Display Order */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Display Order</span>
            </label>
            <input
              type="number"
              className="tm-input"
              value={formData.DisplayOrder || ''}
              onChange={(e) => handleChange('DisplayOrder', e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          {/* Print Order */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Print Order</span>
            </label>
            <input
              type="number"
              className="tm-input"
              value={formData.PrintOrder || ''}
              onChange={(e) => handleChange('PrintOrder', e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          {/* Observation Instructions */}
          <div className="tm-field-group">
            <label className="tm-label">
              <span>Special Instructions / Observation</span>
            </label>
            <input
              type="text"
              className="tm-input"
              value={formData.Observation || ''}
              onChange={(e) => handleChange('Observation', e.target.value)}
              placeholder="Clinical observation notes"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 4: Clinical Settings & System Flags ── */}
      <div className="tm-card">
        <div className="tm-card-title">
          <i className="fa-solid fa-sliders" style={{ color: '#0284c7' }} />
          <span>Clinical Workflow & Integration Flags</span>
        </div>

        <div className="tm-grid-3">
          {/* Is Profile */}
          <div
            className={`tm-toggle-card ${formData.IsProfile ? 'active' : ''}`}
            onClick={() => handleChange('IsProfile', !formData.IsProfile)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>Test Profile / Panel</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Combines multiple child analytes</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsProfile}
              onChange={(e) => handleChange('IsProfile', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Direct Billing */}
          <div
            className={`tm-toggle-card ${formData.IsDirectBill ? 'active' : ''}`}
            onClick={() => handleChange('IsDirectBill', !formData.IsDirectBill)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>Direct Billing Enabled</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Allow walk-in direct billing</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsDirectBill}
              onChange={(e) => handleChange('IsDirectBill', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is Culture */}
          <div
            className={`tm-toggle-card ${formData.IsCulture ? 'active' : ''}`}
            onClick={() => handleChange('IsCulture', !formData.IsCulture)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>Microbiology Culture</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Culture & sensitivity workflow</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsCulture}
              onChange={(e) => handleChange('IsCulture', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is Active */}
          <div
            className={`tm-toggle-card ${formData.IsActive ? 'active' : ''}`}
            onClick={() => handleChange('IsActive', !formData.IsActive)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>Active in Catalog</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Available for doctors to prescribe</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsActive}
              onChange={(e) => handleChange('IsActive', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is NABL Test */}
          <div
            className={`tm-toggle-card ${formData.IsNABLTest ? 'active' : ''}`}
            onClick={() => handleChange('IsNABLTest', !formData.IsNABLTest)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>NABL Accredited</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Complies with NABL standards</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsNABLTest}
              onChange={(e) => handleChange('IsNABLTest', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>

          {/* Is RIS Sync */}
          <div
            className={`tm-toggle-card ${formData.IsRISSync ? 'active' : ''}`}
            onClick={() => handleChange('IsRISSync', !formData.IsRISSync)}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: colors.textMain }}>Radiology (RIS) Sync</div>
              <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Sync orders to PACS/RIS system</div>
            </div>
            <input
              type="checkbox"
              checked={!!formData.IsRISSync}
              onChange={(e) => handleChange('IsRISSync', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Actions Bar ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: `1px solid ${colors.border}`,
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
          padding: '12px 28px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={handleBackToList}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: radii.md,
            backgroundColor: '#f8fafc',
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: '13.5px',
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
          <span>Back to Test List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setConfirmDialog({ open: true, type: 'save' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: radii.md,
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.borderStrong}`,
              color: colors.textMain,
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ color: '#64748b' }} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => setConfirmDialog({ open: true, type: 'approve' })}
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
            <span>{isSaving ? 'Processing...' : 'Save & Approve'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestMasterFormScreen;
