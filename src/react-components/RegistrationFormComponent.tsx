import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export interface RegistrationFormData {
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number | string;
  gender?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  ethnicity?: string;
  attenderInfo?: string;
  nationality?: string;
  address?: string;
  paymentType?: string;
  discountType?: string;
  discount?: number | string;
  remarks?: string;
  emergency?: boolean;
  noBill?: boolean;
  isOPD?: boolean;
}

export interface RegistrationFormComponentProps {
  reactProps?: {
    item?: RegistrationFormData;
    readOnly?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onChange?: (formData: RegistrationFormData) => void;
}

const extractActualProps = (p: any) => {
  let curr = p;
  while (curr && curr.reactProps) {
    curr = curr.reactProps;
  }
  return curr || p;
};

export const RegistrationFormComponent: React.FC<RegistrationFormComponentProps> = (props: any) => {
  const actualProps = extractActualProps(props);
  const onAction = props.onAction || actualProps.onAction || props.reactProps?.onAction;
  const onChangeProp = props.onChange || actualProps.onChange;

  const [formData, setFormData] = useState<RegistrationFormData>({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    dob: '',
    age: '',
    gender: 'Male',
    mobile: '',
    alternateMobile: '',
    email: '',
    ethnicity: 'General',
    attenderInfo: '',
    nationality: 'Indian',
    address: '',
    paymentType: 'Cash',
    discountType: '%',
    discount: 0,
    remarks: '',
    emergency: false,
    noBill: false,
    isOPD: true,
    ...actualProps.item
  });

  useEffect(() => {
    if (actualProps.item) {
      setFormData((prev) => ({ ...prev, ...actualProps.item }));
    }
  }, [actualProps.item]);

  const handleChange = (field: keyof RegistrationFormData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChangeProp) {
      onChangeProp(updated);
    }
    if (onAction) {
      onAction('fieldChange', { field, value, formData: updated });
    }
  };

  const handleAction = (actionName: string) => {
    if (onAction) {
      onAction(actionName, formData);
    }
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const inputStyle: React.CSSProperties = {
    height: '38px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: '13px',
    padding: '6px 12px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      padding: '24px',
      margin: '16px 0'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '17px',
        fontWeight: 700,
        color: '#1e293b',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Patient Registration Details</span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
          * Required fields
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Title & First Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            First Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              style={{ ...inputStyle, width: '80px', flexShrink: 0 }}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            >
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Master">Master</option>
              <option value="Baby">Baby</option>
            </select>
            <input
              type="text"
              style={inputStyle}
              placeholder="FIRST NAME"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
        </div>

        {/* Last Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Last Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            style={inputStyle}
            placeholder="LAST NAME"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>

        {/* DOB & Age */}
        <div style={fieldStyle}>
          <label style={labelStyle}>DOB / Age <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="date"
              style={{ ...inputStyle, flex: 1 }}
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
            />
            <input
              type="number"
              style={{ ...inputStyle, width: '70px' }}
              placeholder="AGE"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </div>
        </div>

        {/* Mobile */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Mobile <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            style={inputStyle}
            placeholder="MOBILE NUMBER"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
          />
        </div>

        {/* Alternate Mobile */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Alternate Mobile#</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="ALT MOBILE NUMBER"
            value={formData.alternateMobile}
            onChange={(e) => handleChange('alternateMobile', e.target.value)}
          />
        </div>

        {/* Email */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={inputStyle}
            placeholder="EMAIL ADDRESS"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        {/* Ethnicity */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Ethnicity</label>
          <select
            style={inputStyle}
            value={formData.ethnicity}
            onChange={(e) => handleChange('ethnicity', e.target.value)}
          >
            <option value="General">General</option>
            <option value="Asian">Asian</option>
            <option value="Caucasian">Caucasian</option>
            <option value="African">African</option>
            <option value="Hispanic">Hispanic</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Attender Information */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Attender Information</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="ATTENDER NAME / CONTACT"
            value={formData.attenderInfo}
            onChange={(e) => handleChange('attenderInfo', e.target.value)}
          />
        </div>

        {/* Nationality */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Nationality <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            style={inputStyle}
            placeholder="NATIONALITY"
            value={formData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
          />
        </div>

      </div>

      {/* Address Textarea */}
      <div style={{ ...fieldStyle, marginTop: '8px' }}>
        <label style={labelStyle}>Address <span style={{ color: '#ef4444' }}>*</span></label>
        <textarea
          style={{ ...inputStyle, height: '70px', padding: '8px 12px' }}
          placeholder="ENTER FULL RESIDENTIAL ADDRESS"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      {/* Billing & OPD Options Section */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>Payment Type</label>
          <select
            style={inputStyle}
            value={formData.paymentType}
            onChange={(e) => handleChange('paymentType', e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Credit">Credit</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Discount</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              style={{ ...inputStyle, width: '70px' }}
              value={formData.discountType}
              onChange={(e) => handleChange('discountType', e.target.value)}
            >
              <option value="%">%</option>
              <option value="Amt">Amt</option>
            </select>
            <input
              type="number"
              style={inputStyle}
              placeholder="0"
              value={formData.discount}
              onChange={(e) => handleChange('discount', e.target.value)}
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Remarks</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="REMARKS"
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={formData.emergency}
              onChange={(e) => handleChange('emergency', e.target.checked)}
            />
            Emergency
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={formData.noBill}
              onChange={(e) => handleChange('noBill', e.target.checked)}
            />
            No Bill
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={formData.isOPD}
              onChange={(e) => handleChange('isOPD', e.target.checked)}
            />
            Is OPD
          </label>
        </div>

      </div>

      {/* Form Bottom Action Toolbar */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon="fa-upload"
            onClick={() => handleAction('uploadPhoto')}
          >
            Upload
          </Button>

          <Button
            variant="primary"
            icon="fa-camera"
            onClick={() => handleAction('webcamPhoto')}
          >
            Web Camera
          </Button>

          <Button
            variant="danger"
            icon="fa-trash"
            onClick={() => handleAction('clearPhoto')}
          >
            Remove
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="warning"
            size="md"
            onClick={() => handleAction('saveDraft')}
          >
            Save Draft
          </Button>

          <Button
            variant="success"
            size="md"
            onClick={() => handleAction('saveAndActivate')}
            style={{ fontWeight: 700 }}
          >
            Save &amp; Activate
          </Button>
        </div>
      </div>
    </div>
  );
};
