import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './utils/api';
import { sessionHelper } from '../services/sessionHelper';

export interface DoctorPaymentItem {
  Id?: number;
  slno?: number;
  DoctorId?: number;
  DoctorName?: string;
  PatientBill?: {
    Id?: number;
    BillNumber?: string;
    BillDateTime?: string;
    Patient?: {
      Id?: number;
      MRN?: string;
      FirstName?: string;
      LastName?: string;
      Title?: { Description?: string };
    };
  };
  Doctor?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  ServiceName?: string;
  ServiceId?: number;
  NetAmount?: number | string;
  DoctorShare?: number | string;
  DiscountAmount?: number | string;
  Remarks?: string;
  [key: string]: any;
}

export interface DoctorPaymentModifyScreenProps {
  reactProps?: {
    currentfilter?: {
      BillTypeId?: number;
      DoctorId?: number;
      PatientId?: number;
      BillNumber?: string;
      FromBillDate?: string | Date;
      ToBillDate?: string | Date;
    };
    lookup?: {
      BillType?: Array<{ Id: number; Text: string }>;
    };
    gridData?: DoctorPaymentItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateToInput(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getTodayString(): string {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplayDateTime(d?: string): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()} ${time}`;
}

function drShareNumberOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const keyCode = e.keyCode;
  if (
    [46, 8, 9, 27, 13, 110, 190].indexOf(keyCode) !== -1 ||
    (keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    (keyCode >= 35 && keyCode <= 40)
  ) {
    return;
  }
  if (e.shiftKey || keyCode < 48 || keyCode > 57) {
    e.preventDefault();
  }
}

export const DoctorPaymentModifyScreen: React.FC<DoctorPaymentModifyScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isBridged = Boolean(onAction || (reactProps && reactProps.gridData !== undefined));

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    reactProps?.currentfilter?.DoctorId && reactProps.currentfilter.DoctorId > 0
      ? reactProps.currentfilter.DoctorId
      : null
  );
  const [selectedDoctorName, setSelectedDoctorName] = useState<string>('');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');
  const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState<boolean>(false);

  // Patient Filter
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    reactProps?.currentfilter?.PatientId && reactProps.currentfilter.PatientId > 0
      ? reactProps.currentfilter.PatientId
      : null
  );
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState<boolean>(false);

  // Service Filter
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState<boolean>(false);

  // Bill No & Dates
  const [billNumber, setBillNumber] = useState<string>(reactProps?.currentfilter?.BillNumber || '');
  const [fromDate, setFromDate] = useState<string>(
    formatDateToInput(reactProps?.currentfilter?.FromBillDate) || getTodayString()
  );
  const [toDate, setToDate] = useState<string>(
    formatDateToInput(reactProps?.currentfilter?.ToBillDate) || getTodayString()
  );

  // Bill Type Lookup
  const [billTypeId, setBillTypeId] = useState<number>(reactProps?.currentfilter?.BillTypeId ?? -1);
  const [billTypeLookup, setBillTypeLookup] = useState<Array<{ Id: number; Text: string }>>(
    reactProps?.lookup?.BillType || []
  );

  // Table Data
  const [gridData, setGridData] = useState<DoctorPaymentItem[]>(reactProps?.gridData || []);
  const [loading, setLoading] = useState<boolean>(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{
    Id?: number;
    patientbilldetail?: DoctorPaymentItem;
    oldDrName?: string;
    DoctorId?: number | null;
    DoctorName?: string;
    NetAmount?: number | string;
    DoctorShare?: number | string;
    Remarks?: string;
  } | null>(null);

  // Modal Doctor Search
  const [modalDoctorQuery, setModalDoctorQuery] = useState<string>('');
  const [modalDoctorOptions, setModalDoctorOptions] = useState<any[]>([]);
  const [modalDoctorDropdownOpen, setModalDoctorDropdownOpen] = useState<boolean>(false);
  const [modalSaving, setModalSaving] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync from reactProps if bridged
  useEffect(() => {
    if (reactProps) {
      if (reactProps.gridData !== undefined) setGridData(reactProps.gridData);
      if (reactProps.lookup?.BillType) setBillTypeLookup(reactProps.lookup.BillType);
      if (reactProps.currentfilter?.BillTypeId !== undefined) setBillTypeId(reactProps.currentfilter.BillTypeId);
      if (reactProps.currentfilter?.BillNumber !== undefined) setBillNumber(reactProps.currentfilter.BillNumber);
      if (reactProps.currentfilter?.FromBillDate) {
        setFromDate(formatDateToInput(reactProps.currentfilter.FromBillDate));
      }
      if (reactProps.currentfilter?.ToBillDate) {
        setToDate(formatDateToInput(reactProps.currentfilter.ToBillDate));
      }
    }
  }, [reactProps]);

  // Load BillType Lookup if not provided
  useEffect(() => {
    if (billTypeLookup.length > 0) return;
    apiFetch('General/Options/getoptions', [{ Key: 'BillType' }])
      .then((res) => {
        if (res && res.BillType) {
          setBillTypeLookup(res.BillType);
        }
      })
      .catch((err) => console.error('Failed to load BillType options:', err));
  }, []);

  // Doctor search effect
  useEffect(() => {
    if (doctorSearchQuery.trim().length <= 1) {
      setDoctorOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const inputData = {
          Params: [
            { Key: 3, Value: 2 },
            { Key: 5, Value: 2 },
            { Key: 1, Value: doctorSearchQuery.trim() },
          ],
          PageContext: { PageSize: 20, PageNumber: 1 },
        };
        const res = await apiFetch('SystemSettings/User/GetUsers', inputData);
        if (res && res.Data) {
          const list = res.Data.map((d: any) => ({
            Id: d.Id,
            DoctorName: `${d.Title?.Description ? d.Title.Description + ' ' : ''}${d.FirstName || ''} ${d.LastName || ''}`.trim(),
            Department: d.Department?.DepartmentName || '',
          }));
          setDoctorOptions(list);
          setDoctorDropdownOpen(true);
        }
      } catch (err) {
        console.error('Doctor search failed:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [doctorSearchQuery]);

  // Modal Doctor search effect
  useEffect(() => {
    if (modalDoctorQuery.trim().length <= 1) {
      setModalDoctorOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const inputData = {
          Params: [
            { Key: 3, Value: 2 },
            { Key: 5, Value: 2 },
            { Key: 1, Value: modalDoctorQuery.trim() },
          ],
          PageContext: { PageSize: 20, PageNumber: 1 },
        };
        const res = await apiFetch('SystemSettings/User/GetUsers', inputData);
        if (res && res.Data) {
          const list = res.Data.map((d: any) => ({
            Id: d.Id,
            DoctorName: `${d.Title?.Description ? d.Title.Description + ' ' : ''}${d.FirstName || ''} ${d.LastName || ''}`.trim(),
            Department: d.Department?.DepartmentName || '',
          }));
          setModalDoctorOptions(list);
          setModalDoctorDropdownOpen(true);
        }
      } catch (err) {
        console.error('Modal doctor search failed:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [modalDoctorQuery]);

  // Service search effect
  useEffect(() => {
    if (serviceSearchQuery.trim().length <= 1) {
      setServiceOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const inputData = {
          Params: [{ Key: 0, Value: serviceSearchQuery.trim() }],
          PageContext: { PageSize: 20, PageNumber: 1 },
        };
        const res = await apiFetch('ClinicalMaster/ServiceItem/GetServiceItems', inputData);
        if (res && res.Data) {
          setServiceOptions(res.Data);
          setServiceDropdownOpen(true);
        }
      } catch (err) {
        console.error('Service search failed:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [serviceSearchQuery]);

  // Patient search effect
  useEffect(() => {
    if (patientSearchQuery.trim().length <= 1) {
      setPatientOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const inputData = {
          Params: [{ Key: 0, Value: patientSearchQuery.trim() }],
          PageContext: { PageSize: 20, PageNumber: 1 },
        };
        const res = await apiFetch('registration/patient/GetPatients', inputData);
        if (res && res.Data) {
          setPatientOptions(res.Data);
          setPatientDropdownOpen(true);
        }
      } catch (err) {
        console.error('Patient search failed:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [patientSearchQuery]);

  // Fetch List Data
  const handleFetch = async () => {
    if (!selectedDoctorId) {
      showToast('Please Select Doctor First..!', 'error');
      return;
    }

    if (isBridged && onAction) {
      onAction('fetch');
    }

    setLoading(true);
    try {
      const fromDateTime = fromDate ? `${fromDate} 00:00:00` : null;
      const toDateTime = toDate ? `${toDate} 23:59:59` : null;

      const inputData = {
        Params: [
          { Key: 4, Value: 3 },
          { Key: 5, Value: selectedDoctorId },
          { Key: 0, Value: fromDateTime },
          { Key: 1, Value: toDateTime },
          { Key: 2, Value: billTypeId === -1 ? null : billTypeId },
          { Key: 3, Value: selectedPatientId || null },
          { Key: 6, Value: billNumber.trim() || null },
          { Key: 7, Value: selectedServiceId || null },
        ],
        PageContext: {
          PageSize: -1,
          PageNumber: 1,
        },
      };

      const res = await apiFetch('billing/patientbilldetails/GetPatientBillDetails', inputData);
      if (res && res.Data) {
        let vslno = 1;
        const processed = res.Data.map((row: any) => {
          let patientname = '';
          const p = row.PatientBill?.Patient;
          if (p?.Title?.Description) patientname += p.Title.Description;
          if (p?.FirstName) patientname += ' ' + p.FirstName;
          if (p?.LastName) patientname += ' ' + p.LastName;

          return {
            ...row,
            slno: vslno++,
            patientFullName: patientname.trim() || p?.FirstName || '-',
          };
        });
        setGridData(processed);
      } else {
        setGridData([]);
      }
    } catch (err: any) {
      console.error('Error loading patient bill details:', err);
      showToast(err?.message || 'Failed to fetch doctor payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedDoctorId(null);
    setSelectedDoctorName('');
    setDoctorSearchQuery('');
    setSelectedPatientId(null);
    setPatientSearchQuery('');
    setSelectedServiceId(null);
    setServiceSearchQuery('');
    setBillNumber('');
    setBillTypeId(-1);
    setFromDate(getTodayString());
    setToDate(getTodayString());
    setGridData([]);

    if (onAction) {
      onAction('reset');
    }
  };

  const handleOpenEdit = (item: DoctorPaymentItem) => {
    let drName = '';
    if (item.Doctor?.Title?.Description) drName += item.Doctor.Title.Description + ' ';
    if (item.Doctor?.FirstName) drName += item.Doctor.FirstName + ' ';
    if (item.Doctor?.LastName) drName += item.Doctor.LastName;
    drName = drName.trim() || item.DoctorName || '';

    setEditingItem({
      Id: item.Id,
      patientbilldetail: item,
      oldDrName: drName,
      DoctorId: item.DoctorId || null,
      DoctorName: drName,
      NetAmount: item.NetAmount ?? '',
      DoctorShare: item.DoctorShare ?? '',
      Remarks: item.Remarks || '',
    });
    setModalDoctorQuery('');
    setEditModalOpen(true);

    if (onAction) {
      onAction('edit', { entity: item });
    }
  };

  const handleSaveModal = async () => {
    if (!editingItem) return;

    if (!editingItem.DoctorId) {
      showToast('Please select a doctor', 'error');
      return;
    }

    const net = parseFloat(String(editingItem.NetAmount || 0));
    const share = parseFloat(String(editingItem.DoctorShare || 0));

    if (isNaN(share) || share < 0) {
      showToast('Dr. Share Amount should be a valid number', 'error');
      return;
    }

    if (share > net) {
      showToast('Dr. Share Amount should not greater than Amount', 'error');
      return;
    }

    setModalSaving(true);
    try {
      const payload = {
        Id: editingItem.Id,
        DoctorId: editingItem.DoctorId,
        DoctorName: editingItem.DoctorName,
        DoctorShare: editingItem.DoctorShare,
        Remarks: editingItem.Remarks || '',
      };

      await apiFetch('billing/patientbilldetails/UpdatePatientBillDetails', payload);

      showToast('Doctor payment updated successfully', 'success');
      setEditModalOpen(false);
      setEditingItem(null);
      handleFetch();
    } catch (err: any) {
      console.error('Error updating doctor payment:', err);
      showToast(err?.message || 'Failed to update doctor payment', 'error');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '6px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Screen Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            📄
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Doctor payment Update
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Modify and approve doctor consultation shares and service billing distributions
            </p>
          </div>
        </div>

        {/* Top Header Doctor & Patient Autosearches */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Doctor Autosearch */}
          <div style={{ position: 'relative', width: 240 }}>
            <input
              type="text"
              placeholder="Search doctor..."
              value={selectedDoctorName || doctorSearchQuery}
              onChange={(e) => {
                setSelectedDoctorName('');
                setSelectedDoctorId(null);
                setDoctorSearchQuery(e.target.value);
              }}
              onFocus={() => {
                if (doctorOptions.length > 0) setDoctorDropdownOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
            {doctorDropdownOpen && doctorOptions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {doctorOptions.map((doc) => (
                  <div
                    key={doc.Id}
                    onClick={() => {
                      setSelectedDoctorId(doc.Id);
                      setSelectedDoctorName(doc.DoctorName);
                      setDoctorSearchQuery('');
                      setDoctorDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '13px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{doc.DoctorName}</div>
                    {doc.Department && <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.Department}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Autosearch */}
          <div style={{ position: 'relative', width: 240 }}>
            <input
              type="text"
              placeholder="Search patient UHID/name..."
              value={patientSearchQuery}
              onChange={(e) => {
                setSelectedPatientId(null);
                setPatientSearchQuery(e.target.value);
              }}
              onFocus={() => {
                if (patientOptions.length > 0) setPatientDropdownOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
            {patientDropdownOpen && patientOptions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {patientOptions.map((pat) => (
                  <div
                    key={pat.Id}
                    onClick={() => {
                      setSelectedPatientId(pat.Id);
                      setPatientSearchQuery(`${pat.MRN || ''} - ${pat.FirstName || ''}`);
                      setPatientDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '13px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {pat.MRN} - {pat.FirstName} {pat.LastName || ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-Box Filter Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Box 1: Service Name & Bill No */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Service Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search service..."
                value={serviceSearchQuery}
                onChange={(e) => {
                  setSelectedServiceId(null);
                  setServiceSearchQuery(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              {serviceDropdownOpen && serviceOptions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {serviceOptions.map((svc) => (
                    <div
                      key={svc.Id}
                      onClick={() => {
                        setSelectedServiceId(svc.Id);
                        setServiceSearchQuery(svc.ServiceName || svc.Text || '');
                        setServiceDropdownOpen(false);
                      }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {svc.ServiceName || svc.Text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Bill No
            </label>
            <input
              type="text"
              placeholder="Bill No"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetch();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Box 2: Dates (From Date, To Date) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Box 3: Billing Type & Action Buttons */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Billing Type
            </label>
            <select
              value={billTypeId}
              onChange={(e) => setBillTypeId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            >
              <option value={-1}>Please Select</option>
              {billTypeLookup.map((opt) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>🔄</span>
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleFetch}
              disabled={loading}
              style={{
                flex: 1.5,
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                <th style={{ padding: '10px 14px' }}>S. No.</th>
                <th style={{ padding: '10px 14px' }}>Bill Nr.</th>
                <th style={{ padding: '10px 14px' }}>Bill Date</th>
                <th style={{ padding: '10px 14px' }}>UHID</th>
                <th style={{ padding: '10px 14px' }}>Patient Name</th>
                <th style={{ padding: '10px 14px' }}>Service Name</th>
                <th style={{ padding: '10px 14px' }}>Doctor Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Dr. Share</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Disc.</th>
                <th style={{ padding: '10px 14px' }}>Remarks</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Loading doctor payments...
                  </td>
                </tr>
              ) : gridData.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No records found. Select a doctor and click Fetch.
                  </td>
                </tr>
              ) : (
                gridData.map((row) => (
                  <tr
                    key={row.Id || row.slno}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{row.slno}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#2563eb' }}>
                      {row.PatientBill?.BillNumber || '-'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {formatDisplayDateTime(row.BillDateTime || row.PatientBill?.BillDateTime)}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>
                      {row.PatientBill?.Patient?.MRN || '-'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>
                      {row.patientFullName || row.PatientBill?.Patient?.FirstName || '-'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>{row.ServiceName || '-'}</td>
                    <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>
                      {row.Doctor?.Title?.Description ? row.Doctor.Title.Description + ' ' : ''}
                      {row.Doctor?.FirstName || ''} {row.Doctor?.LastName || ''}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {row.NetAmount ?? '-'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                      {row.DoctorShare ?? '-'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b' }}>
                      {row.DiscountAmount ?? '0'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{row.Remarks || '-'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#FFFFFF',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Doctor Payment Modal */}
      {editModalOpen && editingItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              width: '100%',
              maxWidth: 580,
              padding: '24px',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Change Doctor & Share
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{
                  border: 'none',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  width: 28,
                  height: 28,
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Current Doctor Name
                </label>
                <input
                  type="text"
                  disabled
                  value={editingItem.oldDrName || ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Change Doctor <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search replacement doctor..."
                    value={editingItem.DoctorName || modalDoctorQuery}
                    onChange={(e) => {
                      setEditingItem({ ...editingItem, DoctorId: null, DoctorName: '' });
                      setModalDoctorQuery(e.target.value);
                    }}
                    onFocus={() => {
                      if (modalDoctorOptions.length > 0) setModalDoctorDropdownOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {modalDoctorDropdownOpen && modalDoctorOptions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        zIndex: 50,
                        maxHeight: 180,
                        overflowY: 'auto',
                      }}
                    >
                      {modalDoctorOptions.map((doc) => (
                        <div
                          key={doc.Id}
                          onClick={() => {
                            setEditingItem({
                              ...editingItem,
                              DoctorId: doc.Id,
                              DoctorName: doc.DoctorName,
                            });
                            setModalDoctorQuery('');
                            setModalDoctorDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '13px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                        >
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{doc.DoctorName}</div>
                          {doc.Department && <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.Department}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Net Amount
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingItem.NetAmount ?? ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Dr. Share <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.DoctorShare ?? ''}
                    onKeyDown={drShareNumberOnlyKeyDown}
                    onChange={(e) => setEditingItem({ ...editingItem, DoctorShare: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Enter remarks..."
                  value={editingItem.Remarks || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, Remarks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                disabled={modalSaving}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={modalSaving}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: modalSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {modalSaving ? 'Saving...' : 'Approve & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPaymentModifyScreen;
