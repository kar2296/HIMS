import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { Button } from './Button';

interface IdentityItem {
  Id?: number;
  PatientId?: number;
  PatientIdentityTypeId?: number | null;
  IDNumber?: string;
  Comments?: string;
  PatientIdentityType?: { Description?: string; IdentityName?: string };
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; }
interface Lookup {
  PatientIdentityType?: LookupOption[];
}

interface ReactPropsShape {
  item?: IdentityItem;
  lookup?: Lookup;
  canUpdatePatientInfo?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

export const PatientIdentityFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneLookup, setStandaloneLookup] = useState<Lookup>({});
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [localItem, setLocalItem] = useState<IdentityItem>(reactProps?.item || {});
  const [existingIdentities, setExistingIdentities] = useState<IdentityItem[]>([]);
  const [validationError, setValidationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Read patientId from URL search param if present (e.g. ?patientId=123 or ?id=123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patientId') || params.get('id');
    if (pid) {
      const parsedId = parseInt(pid, 10);
      setSelectedPatientId(parsedId);
      setLocalItem((prev) => ({ ...prev, PatientId: parsedId }));
    }
  }, []);

  // Self-load lookups if not supplied by host
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [{ Key: 'PatientIdentityType' }],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookup(res?.Data || res || {});
          }
        }).catch((err) => console.error('Error fetching identity lookups:', err));
      });
    }
  }, [reactProps]);

  const loadIdentities = async (pid: number) => {
    try {
      const { callBackendApi } = await import('../services/apiService');
      const res: any = await callBackendApi({
        action: 'Registration/PatientIdentity/GetPatientIdentitys',
        data: { Params: [{ Key: 1, Value: pid }] },
        type: 'post'
      });
      if (res?.Data) {
        setExistingIdentities(Array.isArray(res.Data) ? res.Data : [res.Data]);
      }
    } catch (err) {
      console.error('Error fetching patient identities:', err);
    }
  };

  // Load patient details & identities if selectedPatientId is present
  useEffect(() => {
    if (selectedPatientId) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'Registration/Patient/GetPatientById',
          data: { Id: selectedPatientId },
          type: 'post'
        }).then((res: any) => {
          if (res?.Data) setPatientRecord(res.Data);
        }).catch((err) => console.error('Error fetching patient:', err));
      });
      loadIdentities(selectedPatientId);
    }
  }, [selectedPatientId]);

  const activeLookup = reactProps?.lookup || standaloneLookup;
  const currentItem = reactProps?.item || localItem;
  const canUpdate = reactProps?.canUpdatePatientInfo ?? true;

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const updateItemField = (field: string, value: any) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
    dispatch('itemFieldChange', { field, value });
  };

  const handleSave = async () => {
    if (!currentItem.PatientIdentityTypeId) {
      setValidationError('Identity Type is required.');
      return;
    }
    if (!currentItem.IDNumber || !currentItem.IDNumber.trim()) {
      setValidationError('ID Number is required.');
      return;
    }

    setValidationError('');
    setSuccessMessage('');
    setIsSaving(true);

    if (onAction) {
      dispatch('saveItem');
      setIsSaving(false);
      return;
    }

    try {
      const { callBackendApi } = await import('../services/apiService');
      const isUpdate = !!currentItem.Id;
      const payload = {
        Data: {
          ...currentItem,
          PatientId: selectedPatientId || currentItem.PatientId || 1
        }
      };
      await callBackendApi({
        action: isUpdate ? 'Registration/PatientIdentity/UpdatePatientIdentity' : 'Registration/PatientIdentity/AddPatientIdentity',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setSuccessMessage('Patient Identity record saved successfully.');
      setLocalItem({ PatientId: selectedPatientId || undefined });
      if (selectedPatientId) loadIdentities(selectedPatientId);
    } catch (err: any) {
      setIsSaving(false);
      setValidationError(err?.message || 'Error saving patient identity.');
    }
  };

  const handleDeleteIdentity = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this identity record?')) {
      try {
        const { callBackendApi } = await import('../services/apiService');
        await callBackendApi({
          action: 'Registration/PatientIdentity/DeletePatientIdentity',
          data: { Id: id },
          type: 'post'
        });
        setSuccessMessage('Patient Identity deleted successfully.');
        if (selectedPatientId) loadIdentities(selectedPatientId);
      } catch (err: any) {
        setValidationError(err?.message || 'Error deleting patient identity.');
      }
    }
  };

  const bannerPatient = patientRecord || currentItem;
  const currentPid = selectedPatientId || currentItem.PatientId || '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {/* Registration Tab Navigation Strip */}
      <div style={{ display: 'flex', gap: spacing.xs, borderBottom: `2px solid ${colors.border}`, marginBottom: spacing.lg }}>
        <button
          type="button"
          onClick={() => { window.location.href = `/registration/new${currentPid ? `?patientId=${currentPid}` : ''}`; }}
          style={{
            border: 'none', background: 'none', padding: '10px 16px', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: colors.textMuted,
            borderBottom: '2px solid transparent', marginBottom: -2
          }}
        >
          Basic Information
        </button>
        <button
          type="button"
          style={{
            border: 'none', background: 'none', padding: '10px 16px', cursor: 'default',
            fontSize: 14, fontWeight: 600, color: colors.primary,
            borderBottom: `2px solid ${colors.primary}`, marginBottom: -2
          }}
        >
          Patient Identity
        </button>
        <button
          type="button"
          onClick={() => { window.location.href = `/registration/kin${currentPid ? `?patientId=${currentPid}` : ''}`; }}
          style={{
            border: 'none', background: 'none', padding: '10px 16px', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: colors.textMuted,
            borderBottom: '2px solid transparent', marginBottom: -2
          }}
        >
          Next of Kin
        </button>
      </div>

      {/* Patient Banner */}
      {bannerPatient && (bannerPatient.FirstName || bannerPatient.Name || bannerPatient.MRN) && (
        <div style={{
          display: 'flex', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.lg,
          padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: radii.md,
          border: `1px solid ${colors.border}`, color: colors.textMain
        }}>
          <span><em style={{ color: colors.primary, fontStyle: 'normal', fontWeight: 600 }}>Patient: </em><strong>{[bannerPatient.FirstName, bannerPatient.MiddleName, bannerPatient.LastName].filter(Boolean).join(' ') || bannerPatient.Name}</strong></span>
          {bannerPatient.MRN && <span><em style={{ color: colors.primary, fontStyle: 'normal', fontWeight: 600 }}>MRN: </em><strong>{bannerPatient.MRN}</strong></span>}
        </div>
      )}

      {validationError && (
        <div id="identityValidationAlert" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
          {validationError}
        </div>
      )}

      {successMessage && (
        <div id="identitySuccessAlert" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#f0fdf4', color: '#166534', borderRadius: 6, fontSize: 13 }}>
          {successMessage}
        </div>
      )}

      {/* Identity Form */}
      <div style={{ backgroundColor: '#fff', border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.xl }}>
        <h4 style={{ ...typography.h4, color: colors.textMain, marginBottom: spacing.md }}>
          {currentItem.Id ? 'Edit Patient Identity' : 'Add Patient Identity'}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
          <Select
            id="ddlPatientIdentityType"
            label="Identity Type"
            required
            options={toOptions(activeLookup.PatientIdentityType)}
            value={currentItem.PatientIdentityTypeId ?? ''}
            onChange={(v) => updateItemField('PatientIdentityTypeId', v ? parseInt(String(v), 10) : null)}
          />
          <Input
            id="txtPatientIdentityIDNumber"
            label="ID Number"
            required
            value={currentItem.IDNumber ?? ''}
            onChange={(e) => updateItemField('IDNumber', e.target.value)}
            placeholder="e.g. Passport / National ID / Driving License"
          />
          <Input
            id="txtPatientIdentityComments"
            label="Comments"
            value={currentItem.Comments ?? ''}
            onChange={(e) => updateItemField('Comments', e.target.value)}
            placeholder="Optional remarks"
          />
        </div>

        <div style={{ marginTop: spacing.lg, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          {canUpdate && (
            <Button id="btnSaveIdentity" variant="primary" text="Save Identity" onClick={handleSave} disabled={isSaving} />
          )}
          <Button id="btnCancelIdentity" variant="secondary" text="Cancel" onClick={() => dispatch('backToList')} />
        </div>
      </div>

      {/* Existing Identities List */}
      {existingIdentities.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: spacing.lg }}>
          <h4 style={{ ...typography.h4, color: colors.textMain, marginBottom: spacing.md }}>
            Existing Identities
          </h4>
          <table id="tblPatientIdentities" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, color: colors.textMuted }}>Type</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, color: colors.textMuted }}>ID Number</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, color: colors.textMuted }}>Comments</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, color: colors.textMuted }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {existingIdentities.map((ident) => (
                <tr key={ident.Id} data-identity-id={ident.Id}>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13 }}>{ident.PatientIdentityType?.Description || ident.PatientIdentityType?.IdentityName || 'Identity'}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, fontWeight: 600 }}>{ident.IDNumber}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13, color: colors.textMuted }}>{ident.Comments || '-'}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, fontSize: 13 }}>
                    <button
                      className="btn-delete-identity"
                      type="button"
                      onClick={() => { if (ident.Id) handleDeleteIdentity(ident.Id); }}
                      style={{ border: 'none', background: 'none', color: colors.danger, cursor: 'pointer', padding: 4 }}
                      title="Delete"
                      aria-label={`Delete identity ${ident.IDNumber}`}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
