import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from './Button';
import { CountryControl } from './CountryControl';
import { StateControl } from './StateControl';
import { DistrictControl } from './DistrictControl';
import { CityControl } from './CityControl';

interface KinItem {
  Id?: number;
  PatientId?: number;
  RelationshipId?: number | null;
  TitleId?: number | null;
  GenderId?: number | null;
  Name?: string;
  ApproxAgeDays?: string | number;
  ApproxAgeMonths?: string | number;
  Age?: string | number;
  DOB?: string;
  LandLine?: string;
  Mobile?: string;
  BloodGroupId?: number | null;
  Comments?: string;
  SameAddress?: boolean;
  AddressLine1?: string;
  AddressLine2?: string;
  CountryId?: number | null;
  Country?: string;
  StateId?: number | null;
  State?: string;
  DistrictId?: number | null;
  District?: string;
  CityId?: number | null;
  City?: string;
  Ward?: string;
  WardId?: number | null;
  PinCodeId?: number | null;
  Pincode?: string;
  FirstName?: string; MiddleName?: string; LastName?: string; MRN?: string;
  Gender?: { Description?: string };
  [key: string]: any;
}

interface LookupOption { Id: number; Text: string; }
interface Lookup {
  Relationship?: LookupOption[];
  Title?: LookupOption[];
  Gender?: LookupOption[];
  BloodGroup?: LookupOption[];
}

interface ReactPropsShape {
  item?: KinItem;
  lookup?: Lookup;
  canShowPatientBanner?: boolean;
  canShowApproxAge?: boolean;
  canUpdatePatientInfo?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (items?: LookupOption[]): SelectOption[] => (items || []).map((i) => ({ value: i.Id, label: i.Text }));

export const PatientKinFormScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneLookup, setStandaloneLookup] = useState<Lookup>({});
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [localItem, setLocalItem] = useState<KinItem>(reactProps?.item || { SameAddress: false });
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
          data: [
            { Key: 'Relationship' },
            { Key: 'Title' },
            { Key: 'Gender' },
            { Key: 'BloodGroup' }
          ],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookup(res?.Data || res || {});
          }
        }).catch((err) => console.error('Error fetching kin lookups:', err));
      });
    }
  }, [reactProps]);

  // Load patient details if selectedPatientId is present
  useEffect(() => {
    if (selectedPatientId && !patientRecord) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'Registration/Patient/GetPatientById',
          data: { Id: selectedPatientId },
          type: 'post'
        }).then((res: any) => {
          if (res?.Data) {
            setPatientRecord(res.Data);
          }
        }).catch((err) => console.error('Error fetching patient data:', err));
      });
    }
  }, [selectedPatientId, patientRecord]);

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

  // Same Address toggle
  const handleSameAddressChange = async (checked: boolean) => {
    updateItemField('SameAddress', checked);
    dispatch('sameAddressChange', { value: checked });

    if (checked) {
      let patientData = patientRecord;
      if (!patientData && selectedPatientId) {
        try {
          const { callBackendApi } = await import('../services/apiService');
          const res: any = await callBackendApi({
            action: 'Registration/Patient/GetPatientById',
            data: { Id: selectedPatientId },
            type: 'post'
          });
          patientData = res?.Data;
          if (patientData) setPatientRecord(patientData);
        } catch (err) {
          console.error('Error loading patient address:', err);
        }
      }

      if (patientData) {
        setLocalItem((prev) => ({
          ...prev,
          AddressLine1: patientData.AddressLine1 || '',
          AddressLine2: patientData.AddressLine2 || '',
          CountryId: patientData.CountryId || null,
          Country: patientData.Country || '',
          StateId: patientData.StateId || null,
          State: patientData.State || '',
          DistrictId: patientData.DistrictId || null,
          District: patientData.District || '',
          CityId: patientData.CityId || null,
          City: patientData.City || '',
          Ward: patientData.Area || '',
          Pincode: patientData.Pincode || ''
        }));
      }
    }
  };

  const handleSave = async () => {
    if (!currentItem.RelationshipId) {
      setValidationError('Relationship is required.');
      return;
    }
    if (!currentItem.TitleId) {
      setValidationError('Title is required.');
      return;
    }
    if (!currentItem.GenderId) {
      setValidationError('Gender is required.');
      return;
    }
    if (!currentItem.Name || !currentItem.Name.trim()) {
      setValidationError('Name is required.');
      return;
    }
    if (!currentItem.Mobile && !currentItem.LandLine) {
      setValidationError('At least one contact number (Mobile or Landline) is required.');
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
        action: isUpdate ? 'Registration/PatientKin/UpdatePatientKin' : 'Registration/PatientKin/AddPatientKin',
        data: payload,
        type: 'post'
      });
      setIsSaving(false);
      setSuccessMessage('Next-of-Kin record saved successfully.');
    } catch (err: any) {
      setIsSaving(false);
      setValidationError(err?.message || 'Error saving Next-of-Kin record.');
    }
  };

  const bannerPatient = patientRecord || currentItem;
  const currentPid = selectedPatientId || currentItem.PatientId || '';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
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
          onClick={() => { window.location.href = `/registration/identity${currentPid ? `?patientId=${currentPid}` : ''}`; }}
          style={{
            border: 'none', background: 'none', padding: '10px 16px', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: colors.textMuted,
            borderBottom: '2px solid transparent', marginBottom: -2
          }}
        >
          Patient Identity
        </button>
        <button
          type="button"
          style={{
            border: 'none', background: 'none', padding: '10px 16px', cursor: 'default',
            fontSize: 14, fontWeight: 600, color: colors.primary,
            borderBottom: `2px solid ${colors.primary}`, marginBottom: -2
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
          {bannerPatient.Gender?.Description && <span><em style={{ color: colors.primary, fontStyle: 'normal', fontWeight: 600 }}>Gender: </em><strong>{bannerPatient.Gender.Description}</strong></span>}
        </div>
      )}

      {validationError && (
        <div id="kinValidationAlert" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 6, fontSize: 13 }}>
          {validationError}
        </div>
      )}

      {successMessage && (
        <div id="kinSuccessAlert" style={{ padding: '8px 12px', marginBottom: spacing.md, backgroundColor: '#f0fdf4', color: '#166534', borderRadius: 6, fontSize: 13 }}>
          {successMessage}
        </div>
      )}

      {/* Main Kin Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
        <Select
          id="ddlKinRelationship"
          label="Relationship"
          required
          options={toOptions(activeLookup.Relationship)}
          value={currentItem.RelationshipId ?? ''}
          onChange={(v) => updateItemField('RelationshipId', v ? parseInt(String(v), 10) : null)}
        />
        <Select
          id="ddlKinTitle"
          label="Title"
          required
          options={toOptions(activeLookup.Title)}
          value={currentItem.TitleId ?? ''}
          onChange={(v) => {
            const titleId = v ? parseInt(String(v), 10) : null;
            updateItemField('TitleId', titleId);
            dispatch('titleChange', { value: titleId });
            // Common title-to-gender mapping
            if (titleId === 1) updateItemField('GenderId', 1); // Mr -> Male
            else if (titleId === 2 || titleId === 3) updateItemField('GenderId', 2); // Mrs/Ms -> Female
          }}
        />
        <Select
          id="ddlKinGender"
          label="Gender"
          required
          options={toOptions(activeLookup.Gender)}
          value={currentItem.GenderId ?? ''}
          onChange={(v) => updateItemField('GenderId', v ? parseInt(String(v), 10) : null)}
        />
        <Input
          id="txtKinName"
          label="Name"
          required
          value={currentItem.Name ?? ''}
          onChange={(e) => updateItemField('Name', e.target.value)}
        />

        <Input
          id="txtKinAge"
          label="Age (Years)"
          value={currentItem.Age ?? ''}
          onChange={(e) => updateItemField('Age', e.target.value)}
        />
        <DatePicker
          label="DOB"
          value={currentItem.DOB ? String(currentItem.DOB).slice(0, 10) : ''}
          onChange={(value) => {
            updateItemField('DOB', value);
            dispatch('dobChange', { value });
          }}
        />

        <Input
          id="txtKinLandline"
          label="Landline"
          value={currentItem.LandLine ?? ''}
          maxLength={10}
          onChange={(e) => updateItemField('LandLine', e.target.value.replace(/\D/g, ''))}
        />
        <Input
          id="txtKinMobile"
          label="Mobile"
          value={currentItem.Mobile ?? ''}
          maxLength={10}
          onChange={(e) => updateItemField('Mobile', e.target.value.replace(/\D/g, ''))}
        />
        <Select
          id="ddlKinBloodGroup"
          label="Blood Group"
          options={toOptions(activeLookup.BloodGroup)}
          value={currentItem.BloodGroupId ?? ''}
          onChange={(v) => updateItemField('BloodGroupId', v ? parseInt(String(v), 10) : null)}
        />
        <Input
          id="txtKinComments"
          label="Comments"
          value={currentItem.Comments ?? ''}
          onChange={(e) => updateItemField('Comments', e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: spacing.xs }}>
          <Checkbox
            id="chkKinSameAddress"
            label="Same Address"
            checked={!!currentItem.SameAddress}
            onChange={handleSameAddressChange}
          />
        </div>
      </div>

      {/* Pure React Address Composite Section (replacing AngularJS <address> directive) */}
      <div style={{ marginTop: spacing.xl, borderTop: `1px solid ${colors.border}`, paddingTop: spacing.lg }}>
        <h4 style={{ ...typography.h4, color: colors.textMain, marginBottom: spacing.md }}>
          Address Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.md }}>
          <Input
            id="txtKinAddressLine1"
            label="Address Line 1"
            value={currentItem.AddressLine1 ?? ''}
            onChange={(e) => updateItemField('AddressLine1', e.target.value)}
            placeholder="Street Address, Building"
          />
          <Input
            id="txtKinAddressLine2"
            label="Address Line 2"
            value={currentItem.AddressLine2 ?? ''}
            onChange={(e) => updateItemField('AddressLine2', e.target.value)}
            placeholder="Apartment, Suite, Unit"
          />
          <div>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Country</label>
            <CountryControl
              id="ddlKinCountry"
              countryid={currentItem.CountryId}
              onUpdate={(u) => {
                updateItemField('CountryId', u.countryid ?? null);
                updateItemField('Country', u.country ?? '');
                updateItemField('StateId', null);
                updateItemField('DistrictId', null);
                updateItemField('CityId', null);
              }}
            />
          </div>
          <div>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>State</label>
            <StateControl
              id="ddlKinState"
              stateid={currentItem.StateId}
              countryid={currentItem.CountryId}
              onUpdate={(u) => {
                updateItemField('StateId', u.stateid ?? null);
                updateItemField('State', u.state ?? '');
                updateItemField('DistrictId', null);
                updateItemField('CityId', null);
              }}
            />
          </div>
          <div>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>District</label>
            <DistrictControl
              id="ddlKinDistrict"
              districtid={currentItem.DistrictId}
              countryid={currentItem.CountryId}
              stateid={currentItem.StateId}
              onUpdate={(u) => {
                updateItemField('DistrictId', u.districtid ?? null);
                updateItemField('District', u.district ?? '');
                updateItemField('CityId', null);
              }}
            />
          </div>
          <div>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>City</label>
            <CityControl
              id="ddlKinCity"
              cityid={currentItem.CityId}
              countryid={currentItem.CountryId}
              stateid={currentItem.StateId}
              districtid={currentItem.DistrictId}
              onUpdate={(u) => {
                updateItemField('CityId', u.cityid ?? null);
                updateItemField('City', u.city ?? '');
              }}
            />
          </div>
          <Input
            id="txtKinWardArea"
            label="Area / Ward"
            value={currentItem.Ward ?? ''}
            onChange={(e) => updateItemField('Ward', e.target.value)}
            placeholder="Area or Ward name"
          />
          <Input
            id="txtKinPincode"
            label="Pincode"
            maxLength={6}
            value={currentItem.Pincode ?? ''}
            onChange={(e) => updateItemField('Pincode', e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit pincode"
          />
        </div>
      </div>

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {canUpdate && (
          <Button id="btnSaveKin" variant="primary" text="Save Next of Kin" onClick={handleSave} disabled={isSaving} />
        )}
      </div>
    </div>
  );
};
