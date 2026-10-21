import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors, spacing, typography, radii, shadows, transitions } from '../components/ui/tokens';
import { Button } from './Button';
import { Modal } from '../components/ui/Modal';
import { FindBillModalComponent } from './FindBillModalComponent';
import { apiFetch } from './utils/api';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface LookupItem {
  Id: number;
  Text: string;
  Code?: string;
  [key: string]: any;
}

export interface PatientBillDetailRow {
  Id?: number;
  ServiceId?: number | string;
  ServiceCode?: string;
  ServiceName?: string;
  Quantity?: number;
  UnitPrice?: number;
  Rate?: number;
  Amount?: number;
  AgreementDiscountRate?: number;
  SchemeDiscountRate?: number;
  SchemeDiscountAmt?: number;
  DiscountAmount?: number;
  DiscountModeId?: number;
  GSTAmount?: number;
  TaxCode?: string;
  NetAmount?: number;
  ExecDoctorId?: number;
  DoctorShare?: number;
  Status?: number;
  RdoServiceId?: boolean;
  SelectedItem?: any;
  [key: string]: any;
}

export interface SelectedPatientShape {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  PatientMrn?: string;
  PatientName?: string;
  Age?: number | string;
  Gender?: { Description?: string } | string;
  GenderId?: number;
  Title?: { Description?: string } | string;
  IsVip?: boolean;
  Mobile?: string;
  [key: string]: any;
}

export interface OpBillingListScreenProps {
  reactProps?: {
    item?: any;
    currentfilter?: any;
    currentcontext?: any;
    selectedPatient?: SelectedPatientShape;
    encounter?: any;
    orderInfo?: any;
    patientBillDetails?: PatientBillDetailRow[];
    paymentInfoDetails?: any[];
    refundInfoDetails?: any[];
    lookup?: {
      Doctor?: LookupItem[];
      Department?: LookupItem[];
      Guarantor?: LookupItem[];
      GuarantorType?: LookupItem[];
      ServiceRateCategory?: LookupItem[];
      ServiceItem?: LookupItem[];
      PaymentType?: LookupItem[];
      Bank?: LookupItem[];
      CardType?: LookupItem[];
      Terminal?: LookupItem[];
      DiscountMode?: LookupItem[];
      DiscountApprover?: LookupItem[];
      PrivateDueApprover?: LookupItem[];
      PatientType?: LookupItem[];
      [key: string]: any;
    };
    privileges?: {
      canViewPreviousBills?: boolean;
      canViewOutstandingBills?: boolean;
      canAttachment?: boolean;
      canSave?: boolean;
      canSaveApprove?: boolean;
      canCancel?: boolean;
      canPartialCancel?: boolean;
      canDiscount?: boolean;
      canThermalPrint?: boolean;
      [key: string]: boolean | undefined;
    };
    flags?: {
      context?: string;
      ipIsBillLock?: boolean;
      ipBillListEnabled?: boolean;
      canShowCancelBtn?: boolean;
      canShowSaveBtn?: boolean;
      canShowSaveapproveBtn?: boolean;
      canShowClearBtn?: boolean;
      showVAT?: boolean;
      showDoctorShare?: boolean;
      canShowScheme?: boolean;
      isDue?: boolean;
      disRateType?: boolean;
      disallowMultiplePay?: boolean;
      canDelete?: boolean;
      hidePrintBtn?: boolean;
      isMomentPay?: boolean;
      isSaving?: boolean;
      canSelectPatients?: boolean;
      showThermalPrint?: boolean;
      canThermalPrint?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Format currency
const fmtCur = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Format date display
const fmtDisplayDate = (d?: string | Date | null): string => {
  if (!d) return '-';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

export interface PaymentSplitLine {
  id: number;
  receiptId?: number;
  paymentTypeId: number;
  amount: number;
  bankId?: number;
  cardTypeId?: number;
  terminalNoId?: number;
  chequeNo?: string;
  chequeDate?: string;
  upiRefNumber?: string;
  cardNumber?: string;
  authorizeNumber?: string;
}

// Reusable two-position discount toggle: % (Percentage) on the left, ₹ (Rupees) on the right
export const DiscountToggle: React.FC<{
  mode: number; // 2 = %, 1 = ₹
  onChange: (mode: number) => void;
  disabled?: boolean;
}> = ({ mode, onChange, disabled }) => {
  const isPercent = mode === 2 || mode === undefined || mode === null;
  const isRupees = mode === 1;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.surfaceSunken,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.sm,
        padding: '2px',
        gap: '2px',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        title="Percentage (%)"
        onClick={(e) => {
          e.stopPropagation();
          onChange(2);
        }}
        style={{
          border: 'none',
          backgroundColor: isPercent ? colors.primary : 'transparent',
          color: isPercent ? '#ffffff' : colors.textMuted,
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: radii.xs,
          cursor: 'pointer',
          lineHeight: '14px',
          transition: transitions.fast,
        }}
      >
        %
      </button>
      <button
        type="button"
        title="Rupees (₹)"
        onClick={(e) => {
          e.stopPropagation();
          onChange(1);
        }}
        style={{
          border: 'none',
          backgroundColor: isRupees ? colors.primary : 'transparent',
          color: isRupees ? '#ffffff' : colors.textMuted,
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: radii.xs,
          cursor: 'pointer',
          lineHeight: '14px',
          transition: transitions.fast,
        }}
      >
        ₹
      </button>
    </div>
  );
};

export interface DiscountValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  billError: string | null;
  lineError: string | null;
  isBillDiscountInvalid: boolean;
  invalidRowIndices: number[];
}

export const validateDiscountState = (
  billDisc: any,
  billMode: number,
  grossAmt: number,
  rows: PatientBillDetailRow[]
): DiscountValidationResult => {
  const billDiscVal = parseFloat(billDisc) || 0;
  let billError: string | null = null;
  if (billDiscVal < 0) {
    billError = 'Bill discount cannot be negative.';
  } else if (billMode === 2 && billDiscVal > 100) {
    billError = 'Bill discount cannot exceed 100% when Percentage (%) is selected.';
  } else if (billMode === 1 && grossAmt > 0 && billDiscVal > grossAmt) {
    billError = `Bill discount of ₹${billDiscVal.toFixed(2)} exceeds the bill amount of ₹${grossAmt.toFixed(2)} when Rupees (₹) is selected.`;
  } else if (billMode === 1 && grossAmt <= 0 && billDiscVal > 0) {
    billError = 'Cannot apply rupee discount when bill amount is zero.';
  }

  let lineError: string | null = null;
  const invalidRowIndices: number[] = [];

  rows.forEach((r, idx) => {
    const rDiscVal = parseFloat(r.DiscountAmount as any) || 0;
    if (rDiscVal <= 0) return;
    const rMode = r.DiscountModeId || billMode || 2;
    const rGross = (parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0) * (parseFloat(r.Quantity as any) || 1);
    const sName = r.ServiceName || `Item #${idx + 1}`;

    if (rDiscVal < 0) {
      lineError = lineError || `${sName} discount cannot be negative.`;
      invalidRowIndices.push(idx);
    } else if (rMode === 2 && rDiscVal > 100) {
      lineError = lineError || `${sName} discount cannot exceed 100% when Percentage (%) is selected.`;
      invalidRowIndices.push(idx);
    } else if (rMode === 1 && rGross > 0 && rDiscVal > rGross) {
      lineError = lineError || `${sName} discount of ₹${rDiscVal.toFixed(2)} exceeds the item amount of ₹${rGross.toFixed(2)} when Rupees (₹) is selected.`;
      invalidRowIndices.push(idx);
    } else if (rMode === 1 && rGross <= 0 && rDiscVal > 0) {
      lineError = lineError || `${sName} cannot have discount when item amount is zero.`;
      invalidRowIndices.push(idx);
    }
  });

  const errorMessage = billError || lineError;
  return {
    isValid: !errorMessage,
    errorMessage,
    billError,
    lineError,
    isBillDiscountInvalid: Boolean(billError),
    invalidRowIndices,
  };
};

export const OpBillingListScreen: React.FC<OpBillingListScreenProps> = (props: any) => {
  // Support both direct props and wrapped reactProps
  const actualReactProps = props.reactProps?.reactProps || props.reactProps || {};
  const onAction = props.onAction || actualReactProps.onAction || props.reactProps?.onAction;

  // Extract raw models with fallbacks
  const rawItem = actualReactProps.item || {};
  const rawCurrentfilter = actualReactProps.currentfilter || {};
  const rawCurrentcontext = actualReactProps.currentcontext || {};
  const rawSelectedPatient = actualReactProps.selectedPatient || {};
  const encounter = actualReactProps.encounter || {};
  const orderInfo = actualReactProps.orderInfo || {};
  const rawPatientBillDetails: PatientBillDetailRow[] = actualReactProps.patientBillDetails || [];
  const paymentInfoDetails = actualReactProps.paymentInfoDetails || [];
  const refundInfoDetails = actualReactProps.refundInfoDetails || [];
  const rawLookup = actualReactProps.lookup || {};
  const privileges = actualReactProps.privileges || {};
  const flags = actualReactProps.flags || {};

  let routeTp = '';
  try {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const match = hash.match(/\/([^\/?#]+)\/([^\/?#]+)$/);
    if (match && match[2]) {
      routeTp = match[2];
    }
  } catch (e) {}

  const context =
    props.context ||
    flags.context ||
    actualReactProps.context ||
    (routeTp === 'DG' ? 'DG' : (typeof window !== 'undefined' && (
      window.location.hash.includes('/DG') ||
      window.location.hash.includes('directbilling') ||
      window.location.pathname.includes('directbilling')
    ) ? 'DG' : 'OP'));

  const isDG =
    context === 'DG' ||
    Boolean(
      props.context === 'DG' ||
      flags.context === 'DG' ||
      actualReactProps.context === 'DG' ||
      routeTp === 'DG' ||
      (typeof window !== 'undefined' && (
        window.location.hash.includes('/DG') ||
        window.location.hash.includes('directbilling') ||
        window.location.pathname.includes('directbilling')
      ))
    );

  // Direct patient state for DG / Walk-In registrations
  const [directPatient, setDirectPatient] = useState<{
    FirstName: string;
    GenderId: number;
    ReferralId: number;
    Age: string;
    DOB: string;
    Mobile: string;
    DiscountModeId: number;
  }>({
    FirstName: rawCurrentfilter.FirstName || rawSelectedPatient.FirstName || '',
    GenderId: rawCurrentfilter.GenderId || rawSelectedPatient.GenderId || 1,
    ReferralId: rawCurrentfilter.ReferralId || -1,
    Age: rawCurrentfilter.Age != null ? String(rawCurrentfilter.Age) : (rawSelectedPatient.Age != null ? String(rawSelectedPatient.Age) : ''),
    DOB: rawCurrentfilter.DOB || rawSelectedPatient.DOB || '',
    Mobile: rawCurrentfilter.Mobile || rawSelectedPatient.Mobile || '',
    DiscountModeId: rawCurrentfilter.DiscountModeId || 2,
  });

  useEffect(() => {
    if (rawCurrentfilter && Object.keys(rawCurrentfilter).length > 0) {
      setDirectPatient((prev) => ({
        FirstName: rawCurrentfilter.FirstName ?? rawSelectedPatient?.FirstName ?? prev.FirstName,
        GenderId: rawCurrentfilter.GenderId ?? rawSelectedPatient?.GenderId ?? prev.GenderId,
        ReferralId: rawCurrentfilter.ReferralId ?? prev.ReferralId,
        Age: rawCurrentfilter.Age != null ? String(rawCurrentfilter.Age) : (rawSelectedPatient?.Age != null ? String(rawSelectedPatient.Age) : prev.Age),
        DOB: rawCurrentfilter.DOB ?? rawSelectedPatient?.DOB ?? prev.DOB,
        Mobile: rawCurrentfilter.Mobile ?? rawSelectedPatient?.Mobile ?? prev.Mobile,
        DiscountModeId: rawCurrentfilter.DiscountModeId ?? prev.DiscountModeId,
      }));
    }
  }, [rawCurrentfilter, rawSelectedPatient]);

  const handleDirectNameChange = (val: string) => {
    const upper = val.toUpperCase();
    setDirectPatient((prev) => ({ ...prev, FirstName: upper }));
    setLocalCurrentFilter((prev: any) => ({ ...prev, FirstName: upper }));
    if (onAction) {
      onAction('directPatientUpdate', { FirstName: upper });
    }
  };

  const handleDirectGenderChange = (val: number) => {
    setDirectPatient((prev) => ({ ...prev, GenderId: val }));
    setLocalCurrentFilter((prev: any) => ({ ...prev, GenderId: val }));
    if (onAction) {
      onAction('directPatientUpdate', { GenderId: val });
    }
  };

  const handleDirectAgeChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 3);
    let approxDob = '';
    if (cleaned && Number(cleaned) > 0) {
      const yr = new Date().getFullYear() - Number(cleaned);
      approxDob = new Date(yr, 0, 1).toISOString();
    }
    setDirectPatient((prev) => ({ ...prev, Age: cleaned, DOB: approxDob }));
    setLocalCurrentFilter((prev: any) => ({ ...prev, Age: cleaned, DOB: approxDob }));
    if (onAction) {
      onAction('directPatientUpdate', { Age: cleaned, DOB: approxDob });
    }
  };

  const handleDirectMobileChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 10);
    setDirectPatient((prev) => ({ ...prev, Mobile: cleaned }));
    setLocalCurrentFilter((prev: any) => ({ ...prev, Mobile: cleaned }));
    if (onAction) {
      onAction('directPatientUpdate', { Mobile: cleaned });
    }
  };

  const handleDirectReferralChange = (val: number) => {
    setDirectPatient((prev) => ({ ...prev, ReferralId: val }));
    setLocalCurrentFilter((prev: any) => ({ ...prev, ReferralId: val }));
    if (onAction) {
      onAction('directPatientUpdate', { ReferralId: val });
    }
  };

  // Local state for autonomous operation & hydration
  const [localLookup, setLocalLookup] = useState<Record<string, LookupItem[]>>({});
  const [localPatient, setLocalPatient] = useState<any>(null);
  const [localBillDetails, setLocalBillDetails] = useState<PatientBillDetailRow[]>([
    {
      Id: 0,
      ServiceId: -1,
      ServiceName: '',
      Quantity: 1,
      Rate: 0,
      Amount: 0,
      DiscountAmount: 0,
      GSTAmount: 0,
      NetAmount: 0,
      ExecDoctorId: -1,
      DoctorShare: 0,
      Status: 1,
    }
  ]);
  const [localItem, setLocalItem] = useState<any>({});
  const [localCurrentFilter, setLocalCurrentFilter] = useState<any>({});
  const [localCurrentContext, setLocalCurrentContext] = useState<any>({});
  const [isApprovedLocally, setIsApprovedLocally] = useState<boolean>(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string>('');
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplitLine[]>([
    {
      id: 1,
      receiptId: 0,
      paymentTypeId: rawCurrentcontext.PaymentTypeId || rawItem.PaymentTypeId || 1,
      amount: parseFloat(rawCurrentcontext.ReceiptAmt) || 0,
    }
  ]);
  const userEditedSplitRef = useRef<boolean>(false);

  // Synchronize paymentSplits when reactProps.patientPaymentDetails arrives
  useEffect(() => {
    if (Array.isArray(actualReactProps.patientPaymentDetails) && actualReactProps.patientPaymentDetails.length > 0) {
      setPaymentSplits(actualReactProps.patientPaymentDetails.map((p: any, idx: number) => ({
        id: idx + 1,
        receiptId: (p.Id && p.ReceiptNumber) ? p.Id : 0,
        paymentTypeId: p.PaymentTypeId || 1,
        amount: parseFloat(p.AmountPaid) || 0,
        bankId: p.BankId,
        cardTypeId: p.CardTypeId,
        terminalNoId: p.TerminalNoId,
        chequeNo: p.ChequeNo || '',
        chequeDate: p.ChequeDate,
        upiRefNumber: p.UPIRefNumber || '',
        cardNumber: p.CardNumber || '',
        authorizeNumber: p.AuthorizedCode || p.AuthorizeNumber || '',
      })));
    }
  }, [actualReactProps.patientPaymentDetails]);


  // Merge lookups: preference to props, fallback to autonomously loaded localLookup
  const effectiveLookup = useMemo(() => {
    const merged: Record<string, LookupItem[]> = { ...localLookup };
    if (rawLookup) {
      for (const k of Object.keys(rawLookup)) {
        if (Array.isArray(rawLookup[k]) && rawLookup[k].length > 0) {
          merged[k] = rawLookup[k];
        }
      }
    }
    return merged;
  }, [rawLookup, localLookup]);

  // Autonomous lookup hydration from database when props lookup is empty
  useEffect(() => {
    const hasSufficientLookups =
      Boolean(rawLookup.Doctor?.length) &&
      Boolean(rawLookup.ServiceRateCategory?.length) &&
      Boolean(rawLookup.PaymentType?.length);

    if (hasSufficientLookups) return;

    let isMounted = true;
    const fetchOptions = async () => {
      try {
        const inputData = [
          { Key: 'Department' },
          {
            Key: 'ServiceRateCategory',
            Request: {
              Params: [
                { Key: 5, Value: [-1, 1] },
                { Key: 7, Value: 1 }
              ]
            },
            Default: false
          },
          {
            Key: 'Guarantor',
            Request: {
              Params: [{ Key: 7, Value: [-1, 1] }]
            }
          },
          { Key: 'DiscountMode' },
          { Key: 'GuarantorType' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 33, Value: [-1, 1] }]
            }
          },
          { Key: 'PaymentType' },
          { Key: 'Bank' },
          { Key: 'CardType' },
          { Key: 'Terminal' },
          { Key: 'PrivateDueApprover' },
          { Key: 'DiscountApprover' },
          {
            Key: 'Referral',
            Request: {
              Params: [{ Key: 7, Value: [1] }],
              PageContext: { PageSize: -1, PageNumber: 1 }
            }
          },
          { Key: 'PatientType' }
        ];

        const res = await apiFetch('General/Options/getoptions', inputData);
        if (isMounted && res && typeof res === 'object') {
          setLocalLookup(res);
        }
      } catch (err) {
        console.warn('Autonomous lookup hydration failed:', err);
      }
    };

    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, [rawLookup.Doctor?.length, rawLookup.ServiceRateCategory?.length, rawLookup.PaymentType?.length]);

  // Load patient from URL if route has :id > 0 and no patient selected yet
  useEffect(() => {
    if (rawSelectedPatient?.Id || localPatient?.Id) return;
    const hash = window.location.hash || '';
    const match = hash.match(/opbilling-list\/(\d+)/);
    const routePatientId = match ? parseInt(match[1], 10) : 0;
    if (routePatientId > 0) {
      apiFetch('registration/patient/GetPatientById', { Id: routePatientId })
        .then((patRes: any) => {
          const pat = patRes?.Data || patRes?.data || patRes;
          if (pat && (pat.Id || pat.MRN)) {
            setLocalPatient(pat);
            if (onAction) {
              onAction('patientSelect', { patientId: pat.Id, patient: pat });
            }
          }
        })
        .catch(console.warn);
    }
  }, [rawSelectedPatient?.Id, localPatient?.Id, onAction]);

  // Merge selected patient
  const effectivePatient = useMemo(() => {
    if (rawSelectedPatient && (rawSelectedPatient.Id || rawSelectedPatient.MRN || rawSelectedPatient.FirstName)) {
      return rawSelectedPatient;
    }
    return localPatient || {};
  }, [rawSelectedPatient, localPatient]);

  // Merge filters and item
  const effectiveCurrentFilter = useMemo(() => {
    return {
      ...localCurrentFilter,
      ...rawCurrentfilter,
      PatientId: rawCurrentfilter.PatientId || effectivePatient.Id || localCurrentFilter.PatientId
    };
  }, [rawCurrentfilter, localCurrentFilter, effectivePatient]);

  const effectiveItem = useMemo(() => {
    return {
      ...rawItem,
      ...localItem
    };
  }, [rawItem, localItem]);

  const effectiveCurrentContext = useMemo(() => {
    return {
      ...rawCurrentcontext,
      ...localCurrentContext
    };
  }, [rawCurrentcontext, localCurrentContext]);

  const effectiveBillDetails: PatientBillDetailRow[] = useMemo(() => {
    const rawHasServices = rawPatientBillDetails && rawPatientBillDetails.some(r => (r.ServiceId && Number(r.ServiceId) > 0) || (r.ServiceName && r.ServiceName.trim().length > 0));
    if (rawHasServices) {
      return rawPatientBillDetails;
    }
    const localHasServices = localBillDetails.some(r => (r.ServiceId && Number(r.ServiceId) > 0) || (r.ServiceName && r.ServiceName.trim().length > 0));
    if (localHasServices) {
      return localBillDetails;
    }
    if (rawPatientBillDetails && rawPatientBillDetails.length > 0) {
      return rawPatientBillDetails;
    }
    return localBillDetails;
  }, [rawPatientBillDetails, localBillDetails]);

  const genderOptions = useMemo(() => {
    if (effectiveLookup.Gender && effectiveLookup.Gender.length > 0) return effectiveLookup.Gender;
    return [
      { Id: 1, Text: 'Male' },
      { Id: 2, Text: 'Female' },
      { Id: 3, Text: 'Other' },
    ];
  }, [effectiveLookup.Gender]);

  const referralOptions = useMemo(() => {
    if (effectiveLookup.Referral && effectiveLookup.Referral.length > 0) return effectiveLookup.Referral;
    if (effectiveLookup.Doctor && effectiveLookup.Doctor.length > 0) return effectiveLookup.Doctor;
    return [
      { Id: 1, Text: 'Self / Direct Walk-In' },
    ];
  }, [effectiveLookup.Referral, effectiveLookup.Doctor]);

  // Dual-mode dispatch: calls parent Angular action AND updates local state autonomously
  const dispatch = (action: string, payload?: any) => {
    const sId = Number(effectiveItem.PatientBillStatusId || effectiveCurrentContext.PatientBillStatusId || 0);
    const hasBNum = Boolean(effectiveItem.BillNumber && String(effectiveItem.BillNumber).trim().length > 0);
    const isCurrentBillGenerated = Boolean(
      (hasBNum && sId !== 1) ||
      sId === 2 ||
      sId === 3 ||
      effectiveItem.isCompleted ||
      isApprovedLocally
    );

    // Prevent any service modifications, additions, or line deletions once bill is generated
    if (isCurrentBillGenerated && [
      'addServiceRow',
      'serviceItemChange',
      'qtyChange',
      'qtyBlur',
      'rateChange',
      'lineDiscountChange',
      'deleteRow',
      'editDocShare',
      'execDoctorChange',
      'doctorShareChange',
      'editPatientBillDetails'
    ].includes(action)) {
      return;
    }

    // Direct Billing Walk-in Validation & Bridge Sync
    if (
      isDG &&
      ['saveDraft', 'saveAndDraft', 'saveAndApprove'].includes(action) &&
      (!effectiveItem.PatientId || Number(effectiveItem.PatientId) <= 0) &&
      (!effectiveCurrentFilter.PatientId || Number(effectiveCurrentFilter.PatientId) <= 0)
    ) {
      if (!directPatient.FirstName || !directPatient.FirstName.trim()) {
        setLocalErrorMessage('Please enter Patient Name.');
        return;
      }
      if (!directPatient.GenderId || Number(directPatient.GenderId) <= 0) {
        setLocalErrorMessage('Please select Sex / Gender.');
        return;
      }
      if (!directPatient.Age || Number(directPatient.Age) <= 0) {
        setLocalErrorMessage('Please enter Age.');
        return;
      }
      if (!directPatient.Mobile || String(directPatient.Mobile).trim().length !== 10) {
        setLocalErrorMessage('Please enter a valid 10-digit Mobile number.');
        return;
      }
      if (onAction) {
        onAction('directPatientUpdate', {
          FirstName: directPatient.FirstName.trim(),
          GenderId: directPatient.GenderId,
          ReferralId: directPatient.ReferralId,
          Age: directPatient.Age,
          DOB: directPatient.DOB,
          Mobile: directPatient.Mobile,
          DiscountModeId: directPatient.DiscountModeId,
        });
      }
    }

    // Intercept save actions if discount exceeds allowed limit or payment splits exceed net
    if (action === 'saveDraft' || action === 'saveAndDraft' || action === 'saveAndApprove') {
      const rows = effectiveBillDetails.filter(r => r.Status !== 2);
      const gross = rows.reduce((sum, r) => sum + ((parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0) * (parseFloat(r.Quantity as any) || 1)), 0);
      const mode = effectiveCurrentFilter.DiscountModeId ?? 2;
      const validation = validateDiscountState(effectiveCurrentContext.BillDiscount, mode, gross, rows);
      if (!validation.isValid) {
        setLocalErrorMessage(validation.errorMessage || 'Discount exceeds allowed limit.');
        return;
      }
      const splitsTotal = paymentSplits.reduce((sum, p) => sum + (p.amount || 0), 0);
      const currentNet = parseFloat(effectiveItem.TotNetAmount || effectiveCurrentContext.TotNetAmount || gross) || gross;
      if (currentNet > 0 && splitsTotal > currentNet && action === 'saveAndApprove') {
        setLocalErrorMessage(`Total payment splits (${fmtCur(splitsTotal)}) cannot exceed Net Payable (${fmtCur(currentNet)}).`);
        return;
      }

      // When saving as Draft, do not collect receipts or promote to approve - preserve pure draft behavior
      if (action === 'saveDraft' || action === 'saveAndDraft') {
        if (onAction) {
          onAction('syncPaymentLines', {
            isMultiplePayment: false,
            payments: [],
          });
          onAction('receiptAmtChange', { value: 0 });
        }
      } else {
        // saveAndApprove: Explicit pre-sync payment splits to bridge before executing save
        if (onAction && paymentSplits.length > 0) {
          const isMulti = paymentSplits.length > 1 || Boolean(effectiveItem.IsMultiplePayment);
          const newTotal = paymentSplits.reduce((sum, p) => sum + (p.amount || 0), 0);
          onAction('syncPaymentLines', {
            isMultiplePayment: isMulti,
            payments: paymentSplits.map((s) => ({
              Id: s.receiptId || 0,
              PaymentTypeId: s.paymentTypeId,
              AmountPaid: s.amount,
              BankId: s.bankId,
              CardTypeId: s.cardTypeId,
              TerminalNoId: s.terminalNoId,
              ChequeNo: s.chequeNo,
              ChequeDate: s.chequeDate,
              UPIRefNumber: s.upiRefNumber,
              AuthorizedCode: s.authorizeNumber,
              CardNumber: s.cardNumber,
            })),
          });
          onAction('receiptAmtChange', { value: newTotal });
        }
      }
    }

    if (action === 'findBill') {
      if (onAction) {
        onAction('findBill');
      } else {
        setShowPreviousBillsModal(true);
      }
      return;
    }

    if (action === 'collectDueBalance') {
      const dueVal = (payload && payload.amount !== undefined) ? payload.amount : billOutstandingDue;
      if (onAction) {
        onAction('syncPaymentLines', {
          isMultiplePayment: false,
          payments: [{
            Id: 0,
            PaymentTypeId: paymentSplits[0]?.paymentTypeId || 1,
            AmountPaid: dueVal,
            BankId: paymentSplits[0]?.bankId,
            CardTypeId: paymentSplits[0]?.cardTypeId,
            TerminalNoId: paymentSplits[0]?.terminalNoId,
            ChequeNo: paymentSplits[0]?.chequeNo,
            ChequeDate: paymentSplits[0]?.chequeDate,
            UPIRefNumber: paymentSplits[0]?.upiRefNumber,
            AuthorizedCode: paymentSplits[0]?.authorizeNumber,
            CardNumber: paymentSplits[0]?.cardNumber,
          }],
        });
        onAction('receiptAmtChange', { value: dueVal });
      }
    }

    if (onAction) {
      onAction(action, payload);
    }

    switch (action) {
      case 'patientSelect':
        if (payload?.patient) {
          setLocalPatient(payload.patient);
          setLocalCurrentFilter((prev: any) => ({ ...prev, PatientId: payload.patientId || payload.patient.Id }));
        }
        if (payload?.patientId) {
          apiFetch('registration/patient/GetPatientById', { Id: payload.patientId })
            .then((res: any) => {
              const full = res?.Data || res?.data || res;
              if (full && (full.Id || full.MRN)) {
                setLocalPatient(full);
              }
            })
            .catch(console.warn);
        }
        break;

      case 'findBillSelect':
        if (payload?.BillId) {
          apiFetch('billing/patientbills/GetPatientBillsById', { Id: payload.BillId })
            .then((res: any) => {
              const b = res?.Data || res?.data || res;
              if (b) {
                setLocalItem(b);
                if (b.PatientBillDetails) {
                  setLocalBillDetails(b.PatientBillDetails);
                }
                if (b.Patient) {
                  setLocalPatient(b.Patient);
                }
              }
            })
            .catch(console.warn);
        }
        break;

      case 'doctorChange':
        setLocalItem((prev: any) => ({ ...prev, DoctorId: payload?.id }));
        break;

      case 'serviceRateCatChange':
        setLocalCurrentFilter((prev: any) => ({ ...prev, ServiceRateCategoryId: payload?.id }));
        break;

      case 'guarantorTypeChange':
        setLocalCurrentFilter((prev: any) => ({ ...prev, GuarantorTypeId: payload?.id }));
        break;

      case 'guarantorChange':
        setLocalCurrentFilter((prev: any) => ({ ...prev, GuarantorId: payload?.id, GuarantorName: payload?.text }));
        break;

      case 'patientTypeChange':
        setLocalItem((prev: any) => ({ ...prev, PatientTypeId: payload?.id }));
        break;

      case 'discountModeChange':
      case 'discountModeHeaderChange':
      case 'discountModeFooterChange':
        setLocalCurrentFilter((prev: any) => ({ ...prev, DiscountModeId: payload?.id }));
        break;

      case 'discountApproverChange':
        setLocalCurrentContext((prev: any) => ({ ...prev, DiscountApprovedBy: payload?.id }));
        break;

      case 'creditApproverChange':
        setLocalItem((prev: any) => ({ ...prev, PrivateDueId: payload?.id, GuarantorDueId: payload?.id }));
        break;

      case 'paymentTypeChange':
        setLocalCurrentContext((prev: any) => ({ ...prev, PaymentTypeId: payload?.id }));
        break;

      case 'receiptAmtChange':
      case 'updateReceiptAmt':
      case 'receiptAmtFocus':
        setLocalCurrentContext((prev: any) => ({ ...prev, ReceiptAmt: payload?.value }));
        break;

      case 'tenderAmtChange':
        setLocalCurrentContext((prev: any) => ({ ...prev, TenderAmount: payload?.value }));
        break;

      case 'bankChange':
        setLocalItem((prev: any) => ({ ...prev, BankId: payload?.id }));
        break;

      case 'cardTypeChange':
        setLocalItem((prev: any) => ({ ...prev, CardTypeId: payload?.id }));
        break;

      case 'terminalChange':
        setLocalItem((prev: any) => ({ ...prev, TerminalNoId: payload?.id }));
        break;

      case 'addServiceRow':
        setLocalBillDetails((prev) => [
          ...prev,
          {
            Id: 0,
            ServiceId: -1,
            ServiceName: '',
            Quantity: 1,
            Rate: 0,
            Amount: 0,
            DiscountAmount: 0,
            GSTAmount: 0,
            NetAmount: 0,
            ExecDoctorId: effectiveItem.DoctorId || -1,
            DoctorShare: 0,
            Status: 1,
          }
        ]);
        break;

      case 'deleteRow':
        if (payload?.index !== undefined) {
          setLocalBillDetails((prev) => {
            const next = prev.filter((_, i) => i !== payload.index);
            if (next.length === 0) {
              return [
                {
                  Id: 0,
                  ServiceId: -1,
                  ServiceName: '',
                  Quantity: 1,
                  Rate: 0,
                  Amount: 0,
                  DiscountAmount: 0,
                  GSTAmount: 0,
                  NetAmount: 0,
                  ExecDoctorId: effectiveItem.DoctorId || -1,
                  DoctorShare: 0,
                  Status: 1,
                }
              ];
            }
            return next;
          });
        }
        break;

      case 'serviceItemChange':
        if (payload?.index !== undefined && payload?.selectedItem) {
          const s = payload.selectedItem;
          const rate = parseFloat(s.ServiceItemRate || s.Rate || s.UnitPrice || 0) || 0;
          setLocalBillDetails((prev) => {
            const next = [...prev];
            const currentItem = next[payload.index] || { Quantity: 1 };
            const qty = currentItem.Quantity || 1;
            const gross = rate * qty;
            const disc = currentItem.DiscountAmount || 0;
            const gst = currentItem.GSTAmount || 0;
            next[payload.index] = {
              ...currentItem,
              ServiceId: s.Id || s.ServiceItemId || s.ServiceId,
              ServiceCode: s.ItemCode || s.ServiceCode || '',
              ServiceName: s.Name || s.ServiceName || s.Text || '',
              Rate: rate,
              UnitPrice: rate,
              Amount: gross,
              NetAmount: Math.max(0, gross - disc + gst),
              ExecDoctorId: currentItem.ExecDoctorId || effectiveItem.DoctorId || -1,
              DoctorShare: s.DoctorShare || 0,
              SelectedItem: s,
            };
            // Automatically append next empty row if this was the last row and bill is not generated
            if (!isCurrentBillGenerated && payload.index === next.length - 1) {
              next.push({
                Id: 0,
                ServiceId: -1,
                ServiceName: '',
                Quantity: 1,
                Rate: 0,
                Amount: 0,
                DiscountAmount: 0,
                GSTAmount: 0,
                NetAmount: 0,
                ExecDoctorId: effectiveItem.DoctorId || -1,
                DoctorShare: 0,
                Status: 1,
              });
            }
            return next;
          });
        }
        break;

      case 'qtyChange':
        if (payload?.index !== undefined) {
          const qty = parseFloat(payload.quantity) || 1;
          setLocalBillDetails((prev) => {
            const next = [...prev];
            if (next[payload.index]) {
              const r = next[payload.index].Rate || 0;
              const disc = next[payload.index].DiscountAmount || 0;
              const gst = next[payload.index].GSTAmount || 0;
              const gross = r * qty;
              next[payload.index] = {
                ...next[payload.index],
                Quantity: qty,
                Amount: gross,
                NetAmount: Math.max(0, gross - disc + gst),
              };
            }
            return next;
          });
        }
        break;

      case 'rateChange':
        if (payload?.index !== undefined) {
          const rate = parseFloat(payload.rate) || 0;
          setLocalBillDetails((prev) => {
            const next = [...prev];
            if (next[payload.index]) {
              const qty = next[payload.index].Quantity || 1;
              const disc = next[payload.index].DiscountAmount || 0;
              const gst = next[payload.index].GSTAmount || 0;
              const gross = rate * qty;
              next[payload.index] = {
                ...next[payload.index],
                Rate: rate,
                UnitPrice: rate,
                Amount: gross,
                NetAmount: Math.max(0, gross - disc + gst),
              };
            }
            return next;
          });
        }
        break;

      case 'lineDiscountChange':
        if (payload?.index !== undefined) {
          const disc = payload.discountAmount !== undefined ? (payload.discountAmount === '' ? 0 : (parseFloat(payload.discountAmount) || 0)) : undefined;
          const mode = payload.discountModeId !== undefined ? payload.discountModeId : undefined;
          setLocalBillDetails((prev) => {
            const next = [...prev];
            if (next[payload.index]) {
              const cur = next[payload.index];
              const r = cur.Rate || 0;
              const q = cur.Quantity || 1;
              const gross = r * q;
              const nextDisc = disc !== undefined ? disc : (cur.DiscountAmount || 0);
              const nextMode = mode !== undefined ? mode : (cur.DiscountModeId || 2);
              const clampedDisc = nextMode === 2 ? Math.min(Math.max(0, nextDisc), 100) : Math.min(Math.max(0, nextDisc), gross);
              const discAmt = nextMode === 2 ? (clampedDisc / 100) * gross : clampedDisc;
              const gst = cur.GSTAmount || 0;
              next[payload.index] = {
                ...cur,
                DiscountAmount: nextDisc,
                DiscountModeId: nextMode,
                NetAmount: Math.max(0, gross - discAmt + gst),
              };
            }
            return next;
          });
        }
        break;

      case 'headerDiscountChange':
        if (payload) {
          const val = payload.value !== undefined ? (payload.value === '' ? '' : (parseFloat(payload.value) || 0)) : 0;
          const mode = payload.discountModeId !== undefined ? payload.discountModeId : undefined;
          setLocalCurrentContext((prev: any) => ({ ...prev, BillDiscount: val }));
          if (mode !== undefined) {
            setLocalCurrentFilter((prev: any) => ({ ...prev, DiscountModeId: mode }));
          }
        }
        break;

      case 'syncPaymentLines':
        if (payload?.payments) {
          setPaymentSplits(payload.payments.map((p: any, idx: number) => ({
            id: p.Id || p.id || idx + 1,
            paymentTypeId: p.PaymentTypeId || p.paymentTypeId || 1,
            amount: parseFloat(p.AmountPaid !== undefined ? p.AmountPaid : p.amount) || 0,
            bankId: p.BankId || p.bankId,
            cardTypeId: p.CardTypeId || p.cardTypeId,
            terminalNoId: p.TerminalNoId || p.terminalNoId,
            chequeNo: p.ChequeNo || p.chequeNo || '',
            chequeDate: p.ChequeDate || p.chequeDate,
            upiRefNumber: p.UPIRefNumber || p.upiRefNumber || '',
            cardNumber: p.CardNumber || p.cardNumber || '',
            authorizeNumber: p.AuthorizedCode || p.authorizeNumber || '',
          })));
        }
        break;

      case 'clearBillingError':
        setLocalErrorMessage('');
        break;

      case 'execDoctorChange':
        if (payload?.index !== undefined) {
          setLocalBillDetails((prev) => {
            const next = [...prev];
            if (next[payload.index]) {
              next[payload.index] = {
                ...next[payload.index],
                ExecDoctorId: payload.execDoctorId,
              };
            }
            return next;
          });
        }
        break;

      case 'saveAndApprove':
        // Do NOT prematurely set isApprovedLocally to true. Wait for server confirmation with a generated bill number.
        break;

      case 'clear':
      case 'addNewBill':
        setLocalBillDetails([]);
        setLocalPatient(null);
        setLocalItem({});
        setLocalCurrentFilter({});
        setLocalCurrentContext({});
        setIsApprovedLocally(false);
        setLocalErrorMessage('');
        setPaymentSplits([{ id: 1, receiptId: 0, paymentTypeId: 1, amount: 0 }]);
        break;
    }
  };

  // Direct unified accessors
  const lookup = effectiveLookup;
  const currentfilter = effectiveCurrentFilter;
  const currentcontext = effectiveCurrentContext;
  const selectedPatient = effectivePatient;
  const item = effectiveItem;
  const patientBillDetails = effectiveBillDetails;

  // Local state for interactive patient search dropdown
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [highlightedPatientIdx, setHighlightedPatientIdx] = useState<number>(0);
  const isSelectingPatientRef = useRef(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Standalone/fallback Previous Bills modal state
  const [showPreviousBillsModal, setShowPreviousBillsModal] = useState(false);

  // Local state for active service search dropdown per row
  const [activeRowSearchIdx, setActiveRowSearchIdx] = useState<number | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceSearchResults, setServiceSearchResults] = useState<any[]>([]);
  const [isSearchingService, setIsSearchingService] = useState(false);
  const [highlightedServiceIdx, setHighlightedServiceIdx] = useState<number>(0);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target as Node) &&
        !target?.closest?.('.service-search-container')
      ) {
        setActiveRowSearchIdx(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);



  // Sync search input with effective patient on initial load or change
  useEffect(() => {
    if (effectivePatient && !patientSearchQuery) {
      const name = `${effectivePatient.FirstName || effectivePatient.PatientName || ''} ${effectivePatient.LastName || ''}`.trim();
      const mrn = effectivePatient.MRN ? ` (${effectivePatient.MRN})` : '';
      if (name || mrn) {
        setPatientSearchQuery(`${name}${mrn}`);
      }
    }
  }, [effectivePatient]);

  // Debounced Patient Search API with dual endpoint fallback
  useEffect(() => {
    if (isDG) {
      setPatientSearchResults([]);
      return;
    }
    if (isSelectingPatientRef.current) {
      isSelectingPatientRef.current = false;
      return;
    }
    if (!patientSearchQuery || patientSearchQuery.trim().length < 2) {
      setPatientSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingPatient(true);
        let list: any[] = [];
        try {
          const res = await apiFetch('registration/Patient/GetMinPatientSearch', {
            Params: [
              { Key: 1, Value: patientSearchQuery.trim() },
              { Key: 7, Value: 2 },
              { Key: 37, Value: 2 }
            ],
            PageContext: { PageSize: 10, PageNumber: 1 }
          });
          list = res?.Data || res?.data || (Array.isArray(res) ? res : []);
        } catch {
          const res2 = await apiFetch('registration/patient/GetPatientSearch', {
            Params: [
              { Key: 1, Value: patientSearchQuery.trim() },
              { Key: 4, Value: isDG ? 'dg' : 'op' }
            ],
            PageContext: { PageSize: 10, PageNumber: 1 }
          });
          list = res2?.Data || res2?.data || (Array.isArray(res2) ? res2 : []);
        }
        setPatientSearchResults(list);
        setHighlightedPatientIdx(0);
        setShowPatientDropdown(true);
      } catch (err) {
        console.warn('Patient search fetch failed, falling back', err);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearchQuery, isDG]);

  // Debounced Service Item Search API - supports %%, %, empty query on-focus, and text search
  useEffect(() => {
    if (activeRowSearchIdx === null) {
      setServiceSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingService(true);
        const raw = (serviceSearchQuery || '').trim();
        const clean = raw.replace(/[%*]/g, '').trim();

        // If query is empty or wildcard (%%, %, *), load all active services without filter (Key: 4 = 2)
        // If clean has text, pass { Key: 1, Value: clean }
        const params: any[] = [{ Key: 4, Value: 2 }];
        if (clean.length > 0) {
          params.push({ Key: 1, Value: clean });
        }

        const res = await apiFetch('ClinicalMaster/ServiceItem/GetServiceItems', {
          Params: params,
          PageContext: { PageSize: 50, PageNumber: 1 }
        });

        const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
        const list = rawList.map((s: any) => {
          let rate = s.Rate ?? s.ServiceItemRate ?? s.UnitPrice ?? 0;
          if (Array.isArray(s.ServiceItemTariffDetails) && s.ServiceItemTariffDetails.length > 0) {
            const tariff = s.ServiceItemTariffDetails.find(
              (t: any) => (currentfilter.ServiceRateCategoryId ? t.ServiceRateCategoryId === currentfilter.ServiceRateCategoryId : true)
            ) || s.ServiceItemTariffDetails[0];
            if (tariff && tariff.Rate !== undefined) {
              rate = tariff.Rate;
            }
          }
          return {
            ...s,
            Id: s.Id || s.ServiceItemId,
            ServiceId: s.Id || s.ServiceItemId,
            Rate: rate,
            ServiceItemRate: rate,
            ItemCode: s.ItemCode || s.Code || s.ShortCode || '',
            Name: s.Name || s.ServiceName || s.Text || '',
            ServiceName: s.Name || s.ServiceName || s.Text || '',
          };
        });

        setServiceSearchResults(list);
        setHighlightedServiceIdx(0);
      } catch (err) {
        // Fallback to client-side filter of lookup.ServiceItem
        const clean = (serviceSearchQuery || '').replace(/[%*]/g, '').toLowerCase().trim();
        const filtered = (lookup.ServiceItem || []).filter((s: any) => {
          if (!clean) return true;
          return (
            (s.Text || s.Name || '').toLowerCase().includes(clean) ||
            (s.Code || s.ItemCode || '').toLowerCase().includes(clean)
          );
        });
        setServiceSearchResults(filtered);
        setHighlightedServiceIdx(0);
      } finally {
        setIsSearchingService(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [serviceSearchQuery, activeRowSearchIdx, currentfilter.ServiceRateCategoryId]);

  // Derived patient details
  const patientTitle = selectedPatient.Title?.Description || selectedPatient.Title || item.Title || '';
  const patientName = selectedPatient.FirstName
    ? `${patientTitle} ${selectedPatient.FirstName} ${selectedPatient.LastName || ''}`.trim()
    : (selectedPatient.PatientName || item.PatientName || (isDG ? directPatient.FirstName : ''));
  const patientMRN = selectedPatient.MRN || item.PatientMrn || selectedPatient.PatientMrn || '';
  const patientAge = selectedPatient.Age || currentcontext.Age || item.Age || (isDG ? directPatient.Age : '-');
  const patientGender = typeof selectedPatient.Gender === 'object'
    ? selectedPatient.Gender?.Description
    : (selectedPatient.Gender || item.Gender || (isDG ? (genderOptions.find(g => g.Id === directPatient.GenderId)?.Text || 'Male') : '-'));
  const isVip = selectedPatient.IsVip || item.IsVip || false;
  const hasPatientSelected = Boolean(
    (currentfilter.PatientId && Number(currentfilter.PatientId) > 0) ||
    (selectedPatient && (Number(selectedPatient.Id) > 0 || (selectedPatient.MRN && String(selectedPatient.MRN).trim().length > 0))) ||
    (isDG && directPatient.FirstName && directPatient.FirstName.trim().length > 0 && directPatient.Age && String(directPatient.Age).trim().length > 0)
  );

  // Bill status: Draft (1) vs Completed/Approved (2 or 3)
  const billStatusId = Number(item.PatientBillStatusId || currentcontext.PatientBillStatusId || 0);
  const hasBillNumber = Boolean(item.BillNumber && String(item.BillNumber).trim().length > 0);
  const isBillApproved = Boolean(
    (hasBillNumber && (billStatusId === 2 || billStatusId === 3 || item.isCompleted || isApprovedLocally)) ||
    isApprovedLocally ||
    item.isCompleted ||
    billStatusId === 2 ||
    billStatusId === 3
  );
  const isBillGenerated = Boolean(
    isBillApproved ||
    (hasBillNumber && billStatusId !== 1) ||
    billStatusId === 2 ||
    billStatusId === 3 ||
    item.isCompleted ||
    isApprovedLocally
  );

  // Visible rows (filter out soft-deleted status: 2, and unfilled rows when bill is generated)
  const visibleBillRows = useMemo(() => {
    const active = patientBillDetails.filter((r) => r.Status !== 2);
    if (isBillGenerated) {
      // Once bill is generated, only show saved/billed line items, do not show empty pending add rows
      return active.filter(
        (r) =>
          (r.ServiceId && Number(r.ServiceId) > 0) ||
          (r.ServiceName && r.ServiceName.trim().length > 0 && r.ServiceName !== '-- Select Service --')
      );
    }
    return active;
  }, [patientBillDetails, isBillGenerated]);

  // Validation & Workflow Enablement state matching legacy enterprise logic:
  // 1. Service entered check: at least one row has a valid ServiceId, ServiceItem, or non-empty ServiceName
  const hasEnteredServices = useMemo(() => {
    return visibleBillRows.some(
      (r) =>
        (r.ServiceId && Number(r.ServiceId) > 0) ||
        (r.ServiceItem && Number(r.ServiceItem.Id) > 0) ||
        (r.ServiceName && r.ServiceName.trim().length > 0 && r.ServiceName !== '-- Select Service --')
    );
  }, [visibleBillRows]);

  // 2. Bill identification (saved draft or approved bill)
  const hasBillId = Boolean(
    (currentcontext.id && Number(currentcontext.id) > 0) ||
    (item.Id && Number(item.Id) > 0) ||
    (item.BillNumber && String(item.BillNumber).trim().length > 0)
  );

  // 3. Screen empty check: no patient, no services entered, and no existing bill loaded
  const isScreenEmpty = !hasPatientSelected && !hasEnteredServices && !hasBillId;

  // Local totals calculation if AngularJS has not populated currentcontext
  const computedGrossAmt = useMemo(() => {
    return visibleBillRows.reduce((sum, r) => sum + ((parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0) * (parseFloat(r.Quantity as any) || 1)), 0);
  }, [visibleBillRows]);

  // Discount validation rules:
  // - Percentage (%): discount must not exceed 100%
  // - Rupees (₹): discount must not exceed bill amount (or item amount for row discounts)
  const discountValidation = useMemo(() => {
    const gross = parseFloat(item.GrossAmount || currentcontext.GrossAmt) || computedGrossAmt;
    const mode = currentfilter.DiscountModeId ?? 2;
    return validateDiscountState(currentcontext.BillDiscount, mode, gross, visibleBillRows);
  }, [currentcontext.BillDiscount, currentfilter.DiscountModeId, item.GrossAmount, currentcontext.GrossAmt, computedGrossAmt, visibleBillRows]);

  const computedDiscountAmt = useMemo(() => {
    const rawBillDiscVal = parseFloat(currentcontext.BillDiscount as any) || 0;
    const billDiscMode = currentfilter.DiscountModeId || 2;
    if (rawBillDiscVal > 0) {
      const clampedBillDiscVal = billDiscMode === 2 ? Math.min(Math.max(0, rawBillDiscVal), 100) : Math.min(Math.max(0, rawBillDiscVal), computedGrossAmt);
      return billDiscMode === 2 ? (clampedBillDiscVal / 100) * computedGrossAmt : clampedBillDiscVal;
    }
    const lineDiscounts = visibleBillRows.reduce((sum, r) => {
      const gross = ((parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0) * (parseFloat(r.Quantity as any) || 1));
      const mode = r.DiscountModeId || currentfilter.DiscountModeId || 2;
      const rawDiscVal = parseFloat(r.DiscountAmount as any) || 0;
      const clampedDiscVal = mode === 2 ? Math.min(Math.max(0, rawDiscVal), 100) : Math.min(Math.max(0, rawDiscVal), gross);
      const d = mode === 2 ? (clampedDiscVal / 100) * gross : clampedDiscVal;
      return sum + d;
    }, 0);
    return Math.min(lineDiscounts, computedGrossAmt);
  }, [visibleBillRows, computedGrossAmt, currentcontext.BillDiscount, currentfilter.DiscountModeId]);

  const computedGstAmt = useMemo(() => {
    return visibleBillRows.reduce((sum, r) => sum + (parseFloat(r.GSTAmount as any) || 0), 0);
  }, [visibleBillRows]);

  const computedNetAmt = useMemo(() => {
    return Math.max(0, Math.round(computedGrossAmt - computedDiscountAmt + computedGstAmt));
  }, [computedGrossAmt, computedDiscountAmt, computedGstAmt]);

  const grossAmtDisplay = currentcontext.GrossAmt !== undefined && currentcontext.GrossAmt !== 0
    ? currentcontext.GrossAmt
    : computedGrossAmt;

  const discountAmtDisplay = currentcontext.TotDiscountAmt !== undefined && currentcontext.TotDiscountAmt !== 0
    ? currentcontext.TotDiscountAmt
    : (currentcontext.DiscountAmt !== undefined && currentcontext.DiscountAmt !== 0 ? currentcontext.DiscountAmt : computedDiscountAmt);

  const netAmtDisplay = currentcontext.TotNetAmount !== undefined && currentcontext.TotNetAmount !== 0
    ? currentcontext.TotNetAmount
    : (currentcontext.NetAmt !== undefined && currentcontext.NetAmt !== 0 ? currentcontext.NetAmt : computedNetAmt);

  const totalBillNetAmount = parseFloat(item.TotNetAmount || currentcontext.TotNetAmount || currentcontext.NetAmt || netAmtDisplay) || 0;
  const prevPaidAmt = isBillApproved ? (parseFloat(item.PaidAmount || currentcontext.PaidAmt) || 0) : 0;

  // Total collected from payment splits
  const totalCollectedFromSplits = useMemo(() => {
    return paymentSplits.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [paymentSplits]);

  // Total outstanding due on the bill
  const billOutstandingDue = isBillApproved
    ? Math.max(0, parseFloat(item.OutStandingAmount !== undefined && item.OutStandingAmount !== null ? item.OutStandingAmount : (totalBillNetAmount - prevPaidAmt)) || 0)
    : Math.max(0, totalBillNetAmount - totalCollectedFromSplits);

  const isFullyPaid = isBillApproved && (item.IsPaidFully === true || billOutstandingDue === 0);
  const netPayableForCurrentPayment = isBillApproved ? billOutstandingDue : totalBillNetAmount;
  const outstandingDueAmount = Math.max(0, netPayableForCurrentPayment - totalCollectedFromSplits);
  const effectiveRemainingDue = isBillApproved ? billOutstandingDue : outstandingDueAmount;
  const isPaymentSplitExceeded = totalBillNetAmount > 0 && totalCollectedFromSplits > totalBillNetAmount;

  // Synchronize payment splits to bridge and AngularJS context
  const syncSplitsToBridge = (splits: PaymentSplitLine[], isMulti: boolean) => {
    const newTotal = splits.reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = Math.max(0, netPayableForCurrentPayment - newTotal);

    setLocalCurrentContext((prev: any) => ({
      ...prev,
      ReceiptAmt: newTotal,
      TotBalanceAmt: balance,
    }));

    dispatch('syncPaymentLines', {
      isMultiplePayment: isMulti,
      payments: splits.map((s) => ({
        Id: s.receiptId || 0,
        PaymentTypeId: s.paymentTypeId,
        AmountPaid: s.amount,
        BankId: s.bankId,
        CardTypeId: s.cardTypeId,
        TerminalNoId: s.terminalNoId,
        ChequeNo: s.chequeNo,
        ChequeDate: s.chequeDate,
        UPIRefNumber: s.upiRefNumber,
        AuthorizedCode: s.authorizeNumber,
        CardNumber: s.cardNumber,
      })),
    });
    dispatch('receiptAmtChange', { value: newTotal });
  };

  // Keep single payment split amount aligned with bill net amount if not manually customized
  useEffect(() => {
    if (!isBillApproved && paymentSplits.length === 1 && !item.IsMultiplePayment) {
      if (!userEditedSplitRef.current || paymentSplits[0].amount === 0) {
        if (totalBillNetAmount > 0 && paymentSplits[0].amount !== totalBillNetAmount) {
          const updatedSplits: PaymentSplitLine[] = [
            {
              ...paymentSplits[0],
              amount: totalBillNetAmount,
            },
          ];
          setPaymentSplits(updatedSplits);
          syncSplitsToBridge(updatedSplits, false);
        }
      }
    }
  }, [totalBillNetAmount, isBillApproved, item.IsMultiplePayment]);

  // 5. Button enable / disable rules:
  // - Save Draft & Save & Collect: only enabled once service is entered on an unapproved bill AND discount limits are valid AND splits do not exceed net
  const canSaveDraft = Boolean(
    !isScreenEmpty &&
    hasPatientSelected &&
    hasEnteredServices &&
    !isBillApproved &&
    discountValidation.isValid &&
    !isPaymentSplitExceeded &&
    flags.canShowSaveBtn !== false &&
    privileges.canSave !== false
  );

  const canSaveApprove = Boolean(
    !isScreenEmpty &&
    hasPatientSelected &&
    hasEnteredServices &&
    !isBillApproved &&
    discountValidation.isValid &&
    !isPaymentSplitExceeded &&
    flags.canShowSaveapproveBtn !== false &&
    privileges.canSaveApprove !== false
  );

  // - Print option: only enabled once bill is approved (or completed)
  const canPrint = Boolean(
    !isScreenEmpty &&
    isBillApproved &&
    flags.hidePrintBtn !== true
  );

  // - Thermal print option: only enabled once bill is approved AND allowed by option / privilege
  const hasThermalOption = Boolean(
    privileges.canThermalPrint !== false &&
    flags.showThermalPrint !== false
  );

  const canThermalPrint = Boolean(
    !isScreenEmpty &&
    isBillApproved &&
    flags.hidePrintBtn !== true &&
    hasThermalOption
  );

  // Keep local approval state in sync with server status updates
  useEffect(() => {
    const status = Number(item.PatientBillStatusId || currentcontext.PatientBillStatusId || 0);
    const hasNum = Boolean(item.BillNumber && String(item.BillNumber).trim().length > 0);
    if (status === 1) {
      setIsApprovedLocally(false);
    } else if ((status === 2 || status === 3) && hasNum) {
      setIsApprovedLocally(true);
    }
  }, [item.PatientBillStatusId, currentcontext.PatientBillStatusId, item.BillNumber]);

  // Keyboard shortcut listener strictly respecting button enablement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canSaveDraft) {
          dispatch('saveDraft');
        }
      } else if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (canSaveApprove) {
          dispatch('saveAndApprove');
        }
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (canPrint) {
          dispatch('print');
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        dispatch('findBill');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSaveDraft, canSaveApprove, canPrint, dispatch]);

  // Tender amount & change return
  const tenderAmt = parseFloat(currentcontext.TenderAmount) || 0;
  const returnAmt = tenderAmt > 0 && tenderAmt >= totalCollectedFromSplits ? tenderAmt - totalCollectedFromSplits : 0;

  // Split management handlers
  const handleSplitAmountChange = (splitIdx: number, val: number | string) => {
    userEditedSplitRef.current = true;
    const rawVal = val === '' ? '' : (typeof val === 'number' ? val : (parseFloat(val) || 0));
    const numVal = rawVal === '' ? 0 : Math.max(0, Number(rawVal));

    const nextSplits = paymentSplits.map((p, i) => (i === splitIdx ? { ...p, amount: numVal } : p));
    setPaymentSplits(nextSplits);

    const isMulti = nextSplits.length > 1 || Boolean(item.IsMultiplePayment);
    syncSplitsToBridge(nextSplits, isMulti);
  };

  const handleSplitTypeChange = (splitIdx: number, typeId: number) => {
    const nextSplits = paymentSplits.map((p, i) => (i === splitIdx ? { ...p, paymentTypeId: typeId } : p));
    setPaymentSplits(nextSplits);
    if (splitIdx === 0) {
      dispatch('paymentTypeChange', { id: typeId });
    }
    const isMulti = nextSplits.length > 1 || Boolean(item.IsMultiplePayment);
    syncSplitsToBridge(nextSplits, isMulti);
  };

  const handleAddPaymentSplit = () => {
    userEditedSplitRef.current = true;
    if (paymentSplits.length >= 6) return;
    const currentSum = paymentSplits.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remaining = Math.max(0, netPayableForCurrentPayment - currentSum);

    const usedTypes = new Set(paymentSplits.map((p) => p.paymentTypeId));
    let defaultType = 11; // UPI / QR Code
    if (usedTypes.has(11)) defaultType = 1; // Cash
    if (usedTypes.has(1) && usedTypes.has(11)) defaultType = 5; // Credit Card

    const newSplit: PaymentSplitLine = {
      id: Date.now(),
      receiptId: 0,
      paymentTypeId: defaultType,
      amount: remaining > 0 ? remaining : 0,
    };
    const nextSplits = [...paymentSplits, newSplit];
    setPaymentSplits(nextSplits);
    setLocalItem((prev: any) => ({ ...prev, IsMultiplePayment: true }));
    dispatch('fieldChange', { IsMultiplePayment: true });
    syncSplitsToBridge(nextSplits, true);
  };

  const handleRemovePaymentSplit = (splitIdx: number) => {
    userEditedSplitRef.current = true;
    if (paymentSplits.length <= 1) return;
    const nextSplits = paymentSplits.filter((_, i) => i !== splitIdx);
    const isMulti = nextSplits.length > 1;
    setPaymentSplits(nextSplits);
    setLocalItem((prev: any) => ({ ...prev, IsMultiplePayment: isMulti }));
    dispatch('fieldChange', { IsMultiplePayment: isMulti });
    syncSplitsToBridge(nextSplits, isMulti);
  };

  const handleSplitFieldChange = (splitIdx: number, field: string, val: any) => {
    const nextSplits = paymentSplits.map((p, i) => (i === splitIdx ? { ...p, [field]: val } : p));
    setPaymentSplits(nextSplits);
    const isMulti = nextSplits.length > 1 || Boolean(item.IsMultiplePayment);
    syncSplitsToBridge(nextSplits, isMulti);
  };

  const handleToggleMultiplePayment = (enabled: boolean) => {
    userEditedSplitRef.current = true;
    setLocalItem((prev: any) => ({ ...prev, IsMultiplePayment: enabled }));
    dispatch('fieldChange', { IsMultiplePayment: enabled });

    if (enabled && paymentSplits.length === 1) {
      const currentSum = paymentSplits[0].amount || 0;
      const remaining = Math.max(0, netPayableForCurrentPayment - currentSum);
      const newSplit: PaymentSplitLine = {
        id: Date.now(),
        receiptId: 0,
        paymentTypeId: paymentSplits[0].paymentTypeId === 1 ? 11 : 1,
        amount: remaining,
      };
      const nextSplits = [...paymentSplits, newSplit];
      setPaymentSplits(nextSplits);
      syncSplitsToBridge(nextSplits, true);
    } else if (!enabled && paymentSplits.length > 1) {
      const firstSplit: PaymentSplitLine = {
        ...paymentSplits[0],
        amount: Math.min(totalCollectedFromSplits, netPayableForCurrentPayment),
      };
      const nextSplits = [firstSplit];
      setPaymentSplits(nextSplits);
      syncSplitsToBridge(nextSplits, false);
    }
  };

  // Active payment mode
  const currentPayTypeId = paymentSplits[0]?.paymentTypeId || currentcontext.PaymentTypeId || item.PaymentTypeId || 1;

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: colors.surfaceSunken,
        minHeight: '100vh',
        padding: `${spacing.sm} ${spacing.md} ${spacing.lg} ${spacing.md}`,
        boxSizing: 'border-box',
      }}
    >
      {/* Scoped styles for search input and professional micro-interactions */}
      <style>{`
        .hims-patient-search-input {
          height: 36px !important;
          padding: 0 32px 0 38px !important;
          border-radius: 8px !important;
          border: 1.5px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          font-size: 13px !important;
          color: #0f172a !important;
          box-sizing: border-box !important;
          transition: all 0.15s ease !important;
        }
        .hims-patient-search-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
          outline: none !important;
        }
        .hims-patient-search-input::placeholder {
          color: #94a3b8 !important;
          font-size: 12.5px !important;
          font-weight: 400 !important;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & TOP ACTION TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.sm,
          padding: `${spacing.xs} ${spacing.md}`,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          marginBottom: spacing.sm,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              backgroundColor: isDG ? '#8b5cf6' : colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '15px',
            }}
          >
            <i className={isDG ? 'fas fa-flask' : 'fas fa-file-invoice-dollar'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: '-0.01em',
                }}
              >
                {isDG ? 'Direct Billing' : 'Outpatient (OP) Billing'}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 6px',
                  borderRadius: radii.full,
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: isDG ? '#ede9fe' : colors.primaryLight,
                  color: isDG ? '#7c3aed' : colors.primary,
                }}
              >
                {isDG ? 'Direct / DG Counter' : 'OP Counter'}
              </span>
              {flags.isDue && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '1px 6px',
                    borderRadius: radii.full,
                    fontSize: '10px',
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                  }}
                >
                  Due Settlement
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>
              Hospital Information Management System • Real-Time Patient Invoicing
            </p>
          </div>
        </div>

        {/* Cleaned-Up Quick Actions Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            icon="fa-plus-circle"
            title="Start a new bill (clear current form)"
            onClick={() => dispatch('addNewBill')}
          >
            New
          </Button>

          <Button
            variant="secondary"
            icon="fa-history"
            title="View Previous Bills (Date-wise History - F8)"
            onClick={() => dispatch('findBill')}
          >
            Previous Bills
          </Button>

          <Button
            variant="outline"
            icon="fa-check-square-o"
            title="Due / Credit Approvals Workstation"
            onClick={() => {
              window.location.hash = '#/app/creditapproval';
            }}
          >
            Due Approval
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. PATIENT SEARCH & ACTIVE BILL BANNER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 50,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          padding: '6px 10px',
          marginBottom: spacing.xs,
        }}
      >
        {isDG ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
                paddingBottom: 4,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radii.sm,
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  <i className="fas fa-user-plus" />
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6d28d9', letterSpacing: '0.02em' }}>
                    Walk-In / Direct Patient Details
                  </span>
                  <span style={{ fontSize: '10.5px', color: colors.textMuted, marginLeft: 6 }}>
                    (Patient record will be created on bill generation)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: '10.5px',
                    fontWeight: 700,
                    backgroundColor: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <i className="fas fa-flask" /> Direct Billing (DG)
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                  <i className="fas fa-calendar-day" style={{ marginRight: 4, color: '#8b5cf6' }} />
                  {fmtDisplayDate(currentfilter.DocumentDate || new Date())}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 6,
                alignItems: 'flex-start',
              }}
            >
              {/* Field 1: Patient Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Patient Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="fas fa-user"
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: '11px',
                    }}
                  />
                  <input
                    type="text"
                    id="txtDirectPatientName"
                    value={directPatient.FirstName}
                    disabled={isBillGenerated}
                    placeholder="ENTER PATIENT NAME"
                    onChange={(e) => handleDirectNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      height: 28,
                      padding: '0 8px 0 26px',
                      borderRadius: radii.sm,
                      border: `1.5px solid ${directPatient.FirstName ? '#8b5cf6' : colors.borderStrong}`,
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: colors.textMain,
                      backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Field 2: Sex / Gender */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Sex / Gender <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="selDirectPatientGender"
                  value={directPatient.GenderId}
                  disabled={isBillGenerated}
                  onChange={(e) => handleDirectGenderChange(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: 28,
                    padding: '0 8px',
                    borderRadius: radii.sm,
                    border: `1.5px solid ${colors.borderStrong}`,
                    fontSize: '12px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {genderOptions.map((g: any) => (
                    <option key={g.Id} value={g.Id}>
                      {g.Text || g.Description || g.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Age */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Age (Yrs) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="txtDirectPatientAge"
                    value={directPatient.Age}
                    disabled={isBillGenerated}
                    maxLength={3}
                    placeholder="Age in Yrs"
                    onChange={(e) => handleDirectAgeChange(e.target.value)}
                    style={{
                      width: '100%',
                      height: 28,
                      padding: '0 8px',
                      borderRadius: radii.sm,
                      border: `1.5px solid ${directPatient.Age ? '#8b5cf6' : colors.borderStrong}`,
                      fontSize: '12px',
                      color: colors.textMain,
                      backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {directPatient.DOB && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '9.5px',
                        color: colors.textMuted,
                        pointerEvents: 'none',
                      }}
                    >
                      DOB: {new Date(directPatient.DOB).getFullYear()}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 4: Mobile No */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Mobile No <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="fas fa-phone-alt"
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: '11px',
                    }}
                  />
                  <input
                    type="text"
                    id="txtDirectPatientMobile"
                    value={directPatient.Mobile}
                    disabled={isBillGenerated}
                    maxLength={10}
                    placeholder="10-digit Mobile #"
                    onChange={(e) => handleDirectMobileChange(e.target.value)}
                    style={{
                      width: '100%',
                      height: 28,
                      padding: '0 8px 0 26px',
                      borderRadius: radii.sm,
                      border: `1.5px solid ${directPatient.Mobile?.length === 10 ? '#8b5cf6' : colors.borderStrong}`,
                      fontSize: '12px',
                      color: colors.textMain,
                      backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Field 5: Referred By */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Referred By
                </label>
                <select
                  id="selDirectPatientReferral"
                  value={directPatient.ReferralId}
                  disabled={isBillGenerated}
                  onChange={(e) => handleDirectReferralChange(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: 28,
                    padding: '0 8px',
                    borderRadius: radii.sm,
                    border: `1.5px solid ${colors.borderStrong}`,
                    fontSize: '12px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="-1">-- Self / Select Referral --</option>
                  {referralOptions.map((r: any) => (
                    <option key={r.Id} value={r.Id}>
                      {r.Text || r.ReferralName || r.DoctorName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 6: Rate Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Rate Type
                </label>
                <select
                  value={currentfilter.ServiceRateCategoryId ?? 1}
                  disabled={!!flags.disRateType || isBillGenerated}
                  onChange={(e) =>
                    dispatch('serviceRateCatChange', { id: parseInt(e.target.value, 10) })
                  }
                  style={{
                    width: '100%',
                    height: 28,
                    borderRadius: radii.sm,
                    border: `1.5px solid ${colors.borderStrong}`,
                    padding: '0 8px',
                    fontSize: '12px',
                    color: colors.textMain,
                    backgroundColor: flags.disRateType ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {(lookup.ServiceRateCategory || []).map((o: LookupItem) => (
                    <option key={o.Id} value={o.Id}>
                      {o.Text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(200px, 0.8fr) minmax(200px, 0.8fr)',
              gap: spacing.sm,
              alignItems: 'center',
            }}
          >
          {/* Patient Search Input */}
          <div ref={searchContainerRef} style={{ position: 'relative', zIndex: 100 }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.textMuted,
                marginBottom: '4px',
              }}
            >
              Search Patient (UHID / Name / Mobile)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <i
                className={isSearchingPatient ? 'fas fa-spinner fa-spin' : 'fas fa-search'}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isSearchingPatient ? colors.primary : '#94a3b8',
                  fontSize: '13px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
              <input
                type="text"
                className="hims-patient-search-input"
                value={patientSearchQuery}
                placeholder="Type MRN / Patient Name / Mobile No..."
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => {
                  if (patientSearchResults.length > 0) {
                    setShowPatientDropdown(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (!showPatientDropdown || patientSearchResults.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedPatientIdx((prev) => Math.min(prev + 1, patientSearchResults.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedPatientIdx((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const selected = patientSearchResults[highlightedPatientIdx] || patientSearchResults[0];
                    if (selected) {
                      isSelectingPatientRef.current = true;
                      dispatch('patientSelect', { patientId: selected.Id, patient: selected });
                      setShowPatientDropdown(false);
                      const name = `${selected.FirstName || selected.PatientName || ''} ${selected.LastName || ''}`.trim();
                      setPatientSearchQuery(`${name} (${selected.MRN})`);
                    }
                  } else if (e.key === 'Escape') {
                    setShowPatientDropdown(false);
                  }
                }}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 32px 0 38px',
                  borderRadius: radii.md,
                  border: `1.5px solid ${colors.borderStrong}`,
                  fontSize: '13px',
                  color: colors.textMain,
                  backgroundColor: colors.surface,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: transitions.fast,
                }}
              />
              {patientSearchQuery && (
                <button
                  type="button"
                  title="Clear patient search"
                  onClick={() => {
                    setPatientSearchQuery('');
                    setPatientSearchResults([]);
                    setShowPatientDropdown(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: colors.textSubtle,
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <i className="fas fa-times-circle" />
                </button>
              )}
            </div>

            {/* Patient Search Results Dropdown */}
            {showPatientDropdown && patientSearchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.lg,
                  maxHeight: 280,
                  overflowY: 'auto',
                  zIndex: 9999,
                }}
              >
                {patientSearchResults.map((pat: any, pIdx: number) => {
                  const isHighlighted = pIdx === highlightedPatientIdx;
                  return (
                    <div
                      key={pat.Id || pat.MRN || pIdx}
                      className="patient-search-result-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        isSelectingPatientRef.current = true;
                        dispatch('patientSelect', { patientId: pat.Id, patient: pat });
                        setShowPatientDropdown(false);
                        const name = `${pat.FirstName || pat.PatientName || ''} ${pat.LastName || ''}`.trim();
                        setPatientSearchQuery(`${name} (${pat.MRN})`);
                      }}
                      onClick={() => {
                        isSelectingPatientRef.current = true;
                        dispatch('patientSelect', { patientId: pat.Id, patient: pat });
                        setShowPatientDropdown(false);
                        const name = `${pat.FirstName || pat.PatientName || ''} ${pat.LastName || ''}`.trim();
                        setPatientSearchQuery(`${name} (${pat.MRN})`);
                      }}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderBottom: `1px solid ${colors.surfaceSunken}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: transitions.fast,
                        backgroundColor: isHighlighted ? colors.primaryLight : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        setHighlightedPatientIdx(pIdx);
                        e.currentTarget.style.backgroundColor = colors.surfaceMuted;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isHighlighted ? colors.primaryLight : 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: colors.textMain }}>
                          {pat.FirstName || pat.PatientName} {pat.LastName || ''}
                          {pat.IsVip && (
                            <span
                              style={{
                                marginLeft: 6,
                                padding: '1px 5px',
                                borderRadius: radii.sm,
                                fontSize: '10px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 700,
                              }}
                            >
                              VIP
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>
                          MRN: <strong style={{ color: colors.primary }}>{pat.MRN}</strong> • Mobile:{' '}
                          {pat.Mobile || '-'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '11px', color: colors.textMuted }}>
                        {pat.Age ? `${pat.Age} Y` : ''} {pat.Gender?.Description || pat.Gender || ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showPatientDropdown && !isSearchingPatient && patientSearchResults.length === 0 && patientSearchQuery.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.md,
                  padding: `${spacing.sm} ${spacing.md}`,
                  fontSize: '12px',
                  color: colors.textMuted,
                  zIndex: 9999,
                }}
              >
                No patients found matching "{patientSearchQuery.trim()}"
              </div>
            )}
          </div>

          {/* Rate Type Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.textMuted,
                marginBottom: '2px',
              }}
            >
              Rate Type
            </label>
            <select
              value={currentfilter.ServiceRateCategoryId ?? ''}
              disabled={!!flags.disRateType}
              onChange={(e) =>
                dispatch('serviceRateCatChange', { id: parseInt(e.target.value, 10) })
              }
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1.5px solid ${colors.borderStrong}`,
                padding: '0 10px',
                fontSize: '13px',
                color: colors.textMain,
                backgroundColor: flags.disRateType ? colors.surfaceSunken : colors.surface,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="">-- Select Rate Type --</option>
              {(lookup.ServiceRateCategory || []).map((o: LookupItem) => (
                <option key={o.Id} value={o.Id}>
                  {o.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Date */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.textMuted,
                marginBottom: '4px',
              }}
            >
              Document / Visit Date
            </label>
            <div
              style={{
                height: 36,
                borderRadius: radii.md,
                border: `1.5px solid ${colors.borderStrong}`,
                backgroundColor: colors.surfaceSunken,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                fontSize: '13px',
                color: colors.textMain,
                fontWeight: 600,
                boxSizing: 'border-box',
              }}
            >
              <i className="fas fa-calendar-day" style={{ marginRight: 8, color: colors.primary }} />
              {fmtDisplayDate(currentfilter.DocumentDate || new Date())}
            </div>
          </div>
        </div>
      )}

        {/* Selected Patient Identity Hero Card */}
        {hasPatientSelected && (!isDG || Boolean(patientMRN || item.BillNumber)) && (
          <div
            style={{
              marginTop: spacing.xs,
              padding: '6px 12px',
              backgroundColor: colors.primaryLight,
              borderRadius: radii.md,
              border: `1px solid ${colors.primaryMid}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.full,
                  backgroundColor: colors.primary,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                {patientName.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: colors.textMain }}>
                    {patientName}
                  </span>
                  {isVip && (
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: radii.sm,
                        fontSize: '10px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 700,
                      }}
                    >
                      VIP
                    </span>
                  )}
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: radii.full,
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: colors.primary,
                      border: `1px solid ${colors.primaryMid}`,
                    }}
                  >
                    UHID: {patientMRN}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 1 }}>
                  <span>Age/Sex: {patientAge} / {patientGender}</span>
                  {encounter.VisitIdentifier && (
                    <span style={{ marginLeft: 10 }}>
                      Encounter: <strong>{encounter.VisitIdentifier}</strong>
                    </span>
                  )}
                  {currentcontext.ReferralName && (
                    <span style={{ marginLeft: 10 }}>
                      Referral: <strong>{currentcontext.ReferralName}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <Button
                variant="ghost"
                icon="fa-comments"
                title="View/Add Patient Comments"
                onClick={() => dispatch('patcmnts')}
              >
                Comments
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2.1 BILLING OPERATION ERROR BANNER
      ───────────────────────────────────────────────────────────── */}
      {Boolean(discountValidation.errorMessage || localErrorMessage || actualReactProps.billingErrorMessage) && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: radii.md,
            padding: '8px 12px',
            marginBottom: spacing.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#991b1b',
            boxShadow: shadows.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '18px', color: '#dc2626' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Billing Error
              </div>
              <div style={{ fontSize: '12px', marginTop: 2 }}>
                {discountValidation.errorMessage || localErrorMessage || actualReactProps.billingErrorMessage}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalErrorMessage('');
              dispatch('clearBillingError');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '15px',
              padding: '2px 6px',
            }}
            title="Dismiss Error"
          >
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. EXISTING BILL STATUS BANNER (if loaded)
      ───────────────────────────────────────────────────────────── */}
      {item.BillNumber && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            borderRadius: radii.lg,
            border: '1px solid #fde68a',
            padding: `${spacing.sm} ${spacing.md}`,
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', fontWeight: 700 }}>
                Bill Number:
              </span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#78350f' }}>
                {item.BillNumber} {orderInfo.OrderNumber ? ` / ${orderInfo.OrderNumber}` : ''}
              </div>
            </div>

            {item.BillDateTime && (
              <div>
                <span style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Bill Date:
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>
                  {fmtDisplayDate(item.BillDateTime)}
                </div>
              </div>
            )}

            {encounter.VisitIdentifier && (
              <div>
                <span style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Encounter:
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>
                  {encounter.VisitIdentifier}
                </div>
              </div>
            )}

            <div>
              <span style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', fontWeight: 700 }}>
                Status:
              </span>
              <div>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: radii.sm,
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: item.PatientBillStatusId === 2 ? '#fee2e2' : '#dcfce7',
                    color: item.PatientBillStatusId === 2 ? '#b91c1c' : '#15803d',
                  }}
                >
                  {item.PatientBillStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {flags.canShowCancelBtn && privileges.canCancel !== false && (
              <Button
                variant="danger"
                icon="fa-file-excel"
                title="Cancel Bill"
                onClick={() => dispatch('saveCancelled')}
              >
                Cancel Bill
              </Button>
            )}

            {flags.canShowCancelBtn && privileges.canPartialCancel !== false && (
              <Button
                variant="warning"
                icon="fa-hand-holding-usd"
                title="Itemwise Refund / Partial Cancel"
                onClick={() => dispatch('saveItemwiseCancelled')}
              >
                Partial Refund
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BILLING & CLINICAL CONTEXT PANELS
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {/* Panel 1: Doctor & Department */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-user-md" /> Clinical Context
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Consultant Doctor <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={item.DoctorId ?? ''}
                onChange={(e) => dispatch('doctorChange', { id: parseInt(e.target.value, 10) })}
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: colors.surface,
                  color: colors.textMain,
                  outline: 'none',
                }}
              >
                <option value="-1">-- Select Doctor --</option>
                {(lookup.Doctor || []).map((d: LookupItem) => (
                  <option key={d.Id} value={d.Id}>
                    {d.Text}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Referral Name
              </label>
              <input
                type="text"
                value={currentcontext.ReferralName || ''}
                readOnly
                placeholder="Self / Direct"
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: colors.surfaceSunken,
                  color: colors.textMuted,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Panel 2: Payer & Patient Classification */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-shield-alt" /> Payer &amp; Classification
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Payer Type
              </label>
              <select
                value={currentfilter.GuarantorTypeId ?? 1}
                disabled={isDG}
                onChange={(e) =>
                  dispatch('guarantorTypeChange', { id: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: isDG ? colors.surfaceSunken : colors.surface,
                  color: colors.textMain,
                  outline: 'none',
                }}
              >
                {(lookup.GuarantorType || [
                  { Id: 1, Text: 'Cash' },
                  { Id: 2, Text: 'Insurance' },
                  { Id: 3, Text: 'Corporate' },
                ]).map((gt: LookupItem) => (
                  <option key={gt.Id} value={gt.Id}>
                    {gt.Text}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Patient Type
              </label>
              <select
                value={item.PatientTypeId ?? ''}
                onChange={(e) =>
                  dispatch('patientTypeChange', { id: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: colors.surface,
                  color: colors.textMain,
                  outline: 'none',
                }}
              >
                <option value="">General</option>
                {(lookup.PatientType || []).map((pt: LookupItem) => (
                  <option key={pt.Id} value={pt.Id}>
                    {pt.Text}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Payer / Guarantor
              </label>
              <select
                value={currentfilter.GuarantorId ?? ''}
                disabled={currentfilter.GuarantorTypeId === 1}
                onChange={(e) =>
                  dispatch('guarantorChange', { id: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: currentfilter.GuarantorTypeId === 1 ? colors.surfaceSunken : colors.surface,
                  color: colors.textMain,
                  outline: 'none',
                }}
              >
                <option value="-1">-- Direct Patient Payment --</option>
                {(lookup.Guarantor || []).map((g: LookupItem) => (
                  <option key={g.Id} value={g.Id}>
                    {g.Text}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Panel 3: Discount & Employee Association */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-tags" /> Tariff &amp; Staff Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Emp / Staff ID
              </label>
              <input
                type="text"
                value={item.EmployeeId || ''}
                placeholder="Staff ID"
                onChange={(e) => dispatch('fieldChange', { EmployeeId: e.target.value })}
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                Staff Member Name
              </label>
              <input
                type="text"
                value={item.StaffName || ''}
                placeholder="e.g. John Doe"
                onChange={(e) => dispatch('fieldChange', { StaffName: e.target.value })}
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 10px',
                  fontSize: '13px',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BILLING ITEMS GRID
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          overflow: 'visible',
          position: 'relative',
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: colors.textMain }}>
              Service Line Items ({visibleBillRows.length})
            </span>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              • Consultation, diagnostic, or clinical procedure items
            </span>
          </div>
        </div>

        <div
          style={{
            overflowX: 'auto',
            overflowY: 'visible',
            minHeight: activeRowSearchIdx !== null ? 360 : undefined,
            transition: 'min-height 0.15s ease',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: typography.fontFamily,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 40, color: colors.textMuted }}>#</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', minWidth: 260, color: colors.textMuted }}>
                  Service Item <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70, color: colors.textMuted }}>
                  Qty <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ padding: '10px 10px', textAlign: 'right', width: 90, color: colors.textMuted }}>Base Rate</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', width: 100, color: colors.textMuted }}>Adj Rate</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', width: 100, color: colors.textMuted }}>Gross Amt</th>
                <th style={{ padding: '10px 6px', textAlign: 'center', width: 150, color: colors.textMuted }}>Discount (% / ₹)</th>
                {flags.showVAT && (
                  <th style={{ padding: '10px 10px', textAlign: 'right', width: 80, color: colors.textMuted }}>GST</th>
                )}
                <th style={{ padding: '10px 12px', textAlign: 'right', width: 110, color: colors.textMuted }}>Net Amt</th>
                <th style={{ padding: '10px 10px', textAlign: 'left', minWidth: 160, color: colors.textMuted }}>Exe. Doctor</th>
                <th style={{ padding: '10px 10px', textAlign: 'center', width: 90, color: colors.textMuted }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBillRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={flags.showVAT ? 11 : 10}
                    style={{
                      textAlign: 'center',
                      padding: '48px 16px',
                      color: colors.textMuted,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <i className="fas fa-file-invoice" style={{ fontSize: '32px', color: colors.textSubtle, marginBottom: 8, display: 'block' }} />
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, fontSize: '14px', color: colors.textMain }}>
                      {isBillGenerated ? 'No service line items recorded' : 'No service items added yet'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px' }}>
                      {isBillGenerated
                        ? 'This generated bill does not contain active line items.'
                        : 'Select a service item from the row above to insert line items for this bill.'}
                    </p>
                  </td>
                </tr>
              ) : (
                visibleBillRows.map((row, idx) => {
                  const isRowActiveSearch = activeRowSearchIdx === idx;
                  const grossAmount = (row.Rate || row.UnitPrice || 0) * (row.Quantity || 1);
                  const netAmount = row.NetAmount ?? (grossAmount - (row.DiscountAmount || 0) + (row.GSTAmount || 0));

                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.surfaceSunken}`,
                        backgroundColor: idx % 2 === 0 ? colors.surface : colors.surfaceMuted,
                        transition: transitions.fast,
                      }}
                    >
                      {/* Sl # */}
                      <td style={{ textAlign: 'center', padding: '8px', color: colors.textMuted, fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      {/* Service Item Select / Autosearch */}
                      <td style={{ padding: '8px 12px', position: 'relative' }}>
                        <div
                          className="service-search-container"
                          ref={isRowActiveSearch ? serviceDropdownRef : undefined}
                          style={{ position: 'relative' }}
                        >
                          <input
                            type="text"
                            disabled={isBillGenerated}
                            readOnly={isBillGenerated}
                            value={
                              isRowActiveSearch
                                ? serviceSearchQuery
                                : (row.ServiceName ? `${row.ServiceName}${row.ServiceCode ? ` (${row.ServiceCode})` : ''}` : '')
                            }
                            placeholder={isBillGenerated ? '' : 'Type service name, code, or %% for all...'}
                            onFocus={(e) => {
                              if (isBillGenerated) return;
                              setActiveRowSearchIdx(idx);
                              setServiceSearchQuery(row.ServiceName || '');
                              setHighlightedServiceIdx(0);
                              try { e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch {}
                            }}
                            onClick={(e) => {
                              if (isBillGenerated) return;
                              if (activeRowSearchIdx !== idx) {
                                setActiveRowSearchIdx(idx);
                                setServiceSearchQuery(row.ServiceName || '');
                                setHighlightedServiceIdx(0);
                              }
                              try { e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch {}
                            }}
                            onChange={(e) => {
                              if (isBillGenerated) return;
                              setActiveRowSearchIdx(idx);
                              setServiceSearchQuery(e.target.value);
                              setHighlightedServiceIdx(0);
                            }}
                            onKeyDown={(e) => {
                              if (isBillGenerated) return;
                              if (isRowActiveSearch && serviceSearchResults.length > 0) {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setHighlightedServiceIdx((prev) => Math.min(prev + 1, serviceSearchResults.length - 1));
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setHighlightedServiceIdx((prev) => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const selected = serviceSearchResults[highlightedServiceIdx] || serviceSearchResults[0];
                                  if (selected) {
                                    dispatch('serviceItemChange', {
                                      index: idx,
                                      serviceId: selected.Id || selected.ServiceItemId || selected.ServiceId,
                                      selectedItem: selected,
                                    });
                                    setActiveRowSearchIdx(null);
                                    setServiceSearchQuery('');
                                  }
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setActiveRowSearchIdx(null);
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              height: 32,
                              padding: '0 8px',
                              borderRadius: radii.sm,
                              border: `1px solid ${isRowActiveSearch ? colors.primary : colors.border}`,
                              fontSize: '12px',
                              color: isBillGenerated ? colors.textMuted : colors.textMain,
                              backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                              cursor: isBillGenerated ? 'not-allowed' : 'text',
                              boxSizing: 'border-box',
                              outline: 'none',
                              boxShadow: isRowActiveSearch ? `0 0 0 2px ${colors.primary}20` : 'none',
                            }}
                          />

                          {/* Row Service Item Autocomplete Popup */}
                          {!isBillGenerated && isRowActiveSearch && (
                            <div
                              ref={serviceDropdownRef}
                              className="service-search-container"
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                minWidth: 'max(100%, 480px)',
                                backgroundColor: colors.surface,
                                borderRadius: radii.md,
                                border: `1px solid ${colors.border}`,
                                boxShadow: shadows.xl,
                                maxHeight: 280,
                                overflowY: 'auto',
                                zIndex: 99999,
                              }}
                            >
                              <div
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: colors.surfaceMuted,
                                  borderBottom: `1px solid ${colors.border}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '11px',
                                  color: colors.textMuted,
                                  fontWeight: 600,
                                }}
                              >
                                <span>
                                  {isSearchingService
                                    ? 'Searching service catalog...'
                                    : `Available Services (${serviceSearchResults.length})`}
                                </span>
                                <span style={{ fontSize: '10px', color: colors.textSubtle }}>
                                  Use ↑↓ arrows to navigate, Enter to select
                                </span>
                              </div>

                              {isSearchingService && (
                                <div style={{ padding: '16px', fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
                                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8, color: colors.primary }} />
                                  Loading services from database...
                                </div>
                              )}

                              {!isSearchingService && serviceSearchResults.length === 0 && (
                                <div style={{ padding: '16px', fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
                                  <div style={{ marginBottom: 4, fontWeight: 500, color: colors.textMain }}>
                                    No services found
                                  </div>
                                  <div style={{ fontSize: '11px', color: colors.textSubtle }}>
                                    Type <strong>%%</strong> to show all available active services.
                                  </div>
                                </div>
                              )}

                              {!isSearchingService &&
                                serviceSearchResults.map((srv: any, srvIdx: number) => {
                                  const isHighlighted = srvIdx === highlightedServiceIdx;
                                  return (
                                    <div
                                      key={srv.Id || srv.ServiceItemId || srv.ItemCode || srvIdx}
                                      className="service-result-item"
                                      data-service-id={srv.Id || srv.ServiceItemId}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        dispatch('serviceItemChange', {
                                          index: idx,
                                          serviceId: srv.Id || srv.ServiceItemId || srv.ServiceId,
                                          selectedItem: srv,
                                        });
                                        setActiveRowSearchIdx(null);
                                        setServiceSearchQuery('');
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        dispatch('serviceItemChange', {
                                          index: idx,
                                          serviceId: srv.Id || srv.ServiceItemId || srv.ServiceId,
                                          selectedItem: srv,
                                        });
                                        setActiveRowSearchIdx(null);
                                        setServiceSearchQuery('');
                                      }}
                                      onMouseEnter={() => setHighlightedServiceIdx(srvIdx)}
                                      style={{
                                        padding: '8px 12px',
                                        borderBottom: `1px solid ${colors.surfaceSunken}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        backgroundColor: isHighlighted ? `${colors.primary}10` : 'transparent',
                                        borderLeft: isHighlighted ? `3px solid ${colors.primary}` : '3px solid transparent',
                                        transition: 'background-color 0.1s ease',
                                      }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <strong style={{ color: isHighlighted ? colors.primary : colors.textMain }}>
                                            {srv.ServiceName || srv.Name || srv.Text}
                                          </strong>
                                          {(srv.ServiceCode || srv.ItemCode) && (
                                            <span
                                              style={{
                                                padding: '1px 5px',
                                                borderRadius: radii.sm,
                                                backgroundColor: colors.surfaceSunken,
                                                color: colors.textMuted,
                                                fontSize: '10px',
                                                fontFamily: typography.fontFamilyMono,
                                              }}
                                            >
                                              {srv.ServiceCode || srv.ItemCode}
                                            </span>
                                          )}
                                        </div>
                                        {srv.Department?.DepartmentName && (
                                          <span style={{ fontSize: '11px', color: colors.textMuted }}>
                                            Dept: {srv.Department.DepartmentName}
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: colors.primary, fontSize: '13px' }}>
                                          {fmtCur(srv.ServiceItemRate ?? srv.Rate ?? 0)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          disabled={isBillGenerated}
                          readOnly={isBillGenerated}
                          value={row.Quantity ?? 1}
                          onChange={(e) => {
                            if (isBillGenerated) return;
                            dispatch('qtyChange', { index: idx, quantity: parseInt(e.target.value, 10) || 1 });
                          }}
                          onBlur={() => {
                            if (isBillGenerated) return;
                            dispatch('qtyBlur', { index: idx });
                          }}
                          style={{
                            width: 54,
                            height: 32,
                            textAlign: 'center',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border}`,
                            fontSize: '12px',
                            color: isBillGenerated ? colors.textMuted : colors.textMain,
                            backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                            cursor: isBillGenerated ? 'not-allowed' : 'text',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>

                      {/* Base Rate */}
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: colors.textMuted }}>
                        {fmtCur(row.UnitPrice ?? row.Rate ?? 0)}
                      </td>

                      {/* Adjusted Rate */}
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={row.Rate ?? 0}
                          disabled={isBillGenerated || !row.SelectedItem?.IsRateEditable}
                          readOnly={isBillGenerated || !row.SelectedItem?.IsRateEditable}
                          onChange={(e) => {
                            if (isBillGenerated) return;
                            dispatch('rateChange', { index: idx, rate: parseFloat(e.target.value) || 0 });
                          }}
                          style={{
                            width: 80,
                            height: 32,
                            textAlign: 'right',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border}`,
                            padding: '0 6px',
                            fontSize: '12px',
                            backgroundColor: (isBillGenerated || !row.SelectedItem?.IsRateEditable) ? colors.surfaceSunken : colors.surface,
                            color: isBillGenerated ? colors.textMuted : colors.textMain,
                            cursor: (isBillGenerated || !row.SelectedItem?.IsRateEditable) ? 'not-allowed' : 'text',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>

                      {/* Gross Amount */}
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: colors.textMain }}>
                        {fmtCur(row.Amount ?? grossAmount)}
                      </td>

                      {/* Discount Mode Toggle & Amount */}
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <DiscountToggle
                            mode={row.DiscountModeId || currentfilter.DiscountModeId || 2}
                            disabled={isBillGenerated || isBillApproved}
                            onChange={(newMode) => {
                              if (isBillGenerated || isBillApproved) return;
                              dispatch('lineDiscountChange', {
                                index: idx,
                                discountAmount: row.DiscountAmount ?? 0,
                                discountModeId: newMode,
                              });
                            }}
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.DiscountAmount !== undefined && row.DiscountAmount !== null ? row.DiscountAmount : 0}
                            disabled={isBillGenerated || isBillApproved}
                            readOnly={isBillGenerated || isBillApproved}
                            onChange={(e) => {
                              if (isBillGenerated || isBillApproved) return;
                              dispatch('lineDiscountChange', {
                                index: idx,
                                discountAmount: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                                discountModeId: row.DiscountModeId || currentfilter.DiscountModeId || 2,
                              });
                            }}
                            style={{
                              width: 60,
                              height: 30,
                              textAlign: 'right',
                              borderRadius: radii.sm,
                              border: discountValidation.invalidRowIndices.includes(idx) ? '1.5px solid #dc2626' : `1px solid ${colors.border}`,
                              padding: '0 4px',
                              fontSize: '12px',
                              color: discountValidation.invalidRowIndices.includes(idx) ? '#dc2626' : (isBillGenerated ? colors.textMuted : '#b91c1c'),
                              fontWeight: 600,
                              boxSizing: 'border-box',
                              backgroundColor: discountValidation.invalidRowIndices.includes(idx) ? '#fef2f2' : (isBillGenerated || isBillApproved) ? colors.surfaceSunken : colors.surface,
                              cursor: (isBillGenerated || isBillApproved) ? 'not-allowed' : 'text',
                            }}
                            title={discountValidation.invalidRowIndices.includes(idx) ? ((row.DiscountModeId || currentfilter.DiscountModeId || 2) === 1 ? 'Discount exceeds item amount' : 'Discount cannot exceed 100%') : ''}
                          />
                        </div>
                      </td>

                      {/* GST / Tax */}
                      {flags.showVAT && (
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: colors.textMuted }}>
                          {fmtCur(row.GSTAmount ?? 0)}
                        </td>
                      )}

                      {/* Net Amount */}
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: colors.primary }}>
                        {fmtCur(netAmount)}
                      </td>

                      {/* Executing Doctor */}
                      <td style={{ padding: '8px 10px' }}>
                        <select
                          value={row.ExecDoctorId ?? -1}
                          disabled={isBillGenerated}
                          onChange={(e) => {
                            if (isBillGenerated) return;
                            dispatch('execDoctorChange', { index: idx, execDoctorId: parseInt(e.target.value, 10) });
                          }}
                          style={{
                            width: '100%',
                            height: 32,
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border}`,
                            fontSize: '12px',
                            color: isBillGenerated ? colors.textMuted : colors.textMain,
                            backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                            cursor: isBillGenerated ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="-1">Default Consultant</option>
                          {(lookup.Doctor || []).map((d: LookupItem) => (
                            <option key={d.Id} value={d.Id}>
                              {d.Text}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {isBillGenerated ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: colors.textMuted, fontSize: '11px' }}>
                            <i className="fas fa-lock" title="Service line items locked after bill generation" />
                            <span>Locked</span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <button
                              type="button"
                              title="Edit Doctor Share"
                              onClick={() => dispatch('editDocShare', { index: idx })}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: colors.primary,
                                cursor: 'pointer',
                                padding: 4,
                              }}
                            >
                              <i className="fas fa-user-tag" />
                            </button>
                            <button
                              type="button"
                              title="Delete Line Item"
                              onClick={() => dispatch('deleteRow', { index: idx })}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#dc2626',
                                cursor: 'pointer',
                                padding: 4,
                              }}
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. CLINICAL WORKSTATION QUICK COUNTERS (PENDING BADGES)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.sm,
          padding: `${spacing.sm} ${spacing.md}`,
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => dispatch('pendingOrder')}
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceSunken,
              borderRadius: radii.full,
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.textMain,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-stethoscope" style={{ color: colors.primary }} />
            Pending Orders (<strong>{item.PatientPendingOrdersCount || 0}</strong>)
          </button>

          <button
            type="button"
            onClick={() => dispatch('pendingProcedures')}
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceSunken,
              borderRadius: radii.full,
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.textMain,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-procedures" style={{ color: '#8b5cf6' }} />
            Pending Procedures (<strong>{item.ProceduresCount || 0}</strong>)
          </button>

          <button
            type="button"
            onClick={() => dispatch('pendingBill')}
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceSunken,
              borderRadius: radii.full,
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.textMain,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-receipt" style={{ color: '#d97706' }} />
            Pending Bills (<strong>{item.Count || 0}</strong>)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
            Overall Due: <strong style={{ color: '#dc2626' }}>{fmtCur(item.OverallDue || 0)}</strong>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
            Account Balance: <strong style={{ color: colors.primary }}>{fmtCur(currentcontext.TotBalanceAmt || 0)}</strong>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. PAYMENT & FINANCIAL SETTLEMENT CLUSTER
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr) minmax(300px, 1.1fr)',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {/* Settlement Panel 1: Discounts & Remarks */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: colors.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: spacing.sm,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fas fa-percent" /> Bill Discount &amp; Approvals
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm, marginBottom: spacing.sm }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                    Bill Discount
                  </label>
                  <DiscountToggle
                    mode={currentfilter.DiscountModeId ?? 2}
                    disabled={isBillApproved || !!currentcontext.RdoBillDiscount}
                    onChange={(newMode) =>
                      dispatch('headerDiscountChange', {
                        value: currentcontext.BillDiscount || 0,
                        discountModeId: newMode,
                      })
                    }
                  />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentcontext.BillDiscount !== undefined && currentcontext.BillDiscount !== null ? currentcontext.BillDiscount : ''}
                  placeholder="0.00"
                  disabled={isBillApproved || !!currentcontext.RdoBillDiscount}
                  onChange={(e) =>
                    dispatch('headerDiscountChange', {
                      value: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0),
                      discountModeId: currentfilter.DiscountModeId ?? 2,
                    })
                  }
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: discountValidation.isBillDiscountInvalid ? '1.5px solid #dc2626' : `1px solid ${colors.border}`,
                    padding: '0 10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: discountValidation.isBillDiscountInvalid ? '#dc2626' : '#b91c1c',
                    boxSizing: 'border-box',
                    backgroundColor: discountValidation.isBillDiscountInvalid ? '#fef2f2' : (isBillApproved || !!currentcontext.RdoBillDiscount) ? colors.surfaceSunken : colors.surface,
                    outline: discountValidation.isBillDiscountInvalid ? 'none' : undefined,
                  }}
                />
                {discountValidation.billError && (
                  <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, marginTop: 4, lineHeight: '14px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }} />
                    {discountValidation.billError}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                  Discount Approver
                </label>
                <select
                  value={currentcontext.DiscountApprovedBy ?? ''}
                  onChange={(e) =>
                    dispatch('discountApproverChange', { id: parseInt(e.target.value, 10) })
                  }
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 8px',
                    fontSize: '12px',
                    backgroundColor: colors.surface,
                    color: colors.textMain,
                    outline: 'none',
                  }}
                >
                  <option value="">-- Select Approver --</option>
                  {(lookup.DiscountApprover || []).map((da: LookupItem) => (
                    <option key={da.Id} value={da.Id}>
                      {da.Text}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: spacing.sm }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.textMain,
                  cursor: flags.disallowMultiplePay || isFullyPaid ? 'not-allowed' : 'pointer',
                  opacity: flags.disallowMultiplePay ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(item.IsMultiplePayment || paymentSplits.length > 1)}
                  disabled={Boolean(flags.disallowMultiplePay || isFullyPaid)}
                  onChange={(e) => handleToggleMultiplePayment(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: flags.disallowMultiplePay || isFullyPaid ? 'not-allowed' : 'pointer' }}
                />
                Enable Multiple Payment Modes
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
              Billing Remarks / Clinical Notes
            </label>
            <textarea
              rows={3}
              value={item.Comments || ''}
              placeholder="Enter remarks or authorization details..."
              onChange={(e) => dispatch('fieldChange', { Comments: e.target.value })}
              style={{
                width: '100%',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '8px 10px',
                fontSize: '12px',
                color: colors.textMain,
                boxSizing: 'border-box',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Settlement Panel 2: Payment Details & Multi-Split Collection */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: colors.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fas fa-credit-card" /> Payment Settlements
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
              Net Payable: <strong style={{ color: colors.primary }}>{fmtCur(netPayableForCurrentPayment)}</strong>
            </div>
          </div>

          {/* Payment Splits List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {paymentSplits.map((split, sIdx) => {
              const otherSplitsSum = paymentSplits.reduce((acc, p, i) => i === sIdx ? acc : acc + (p.amount || 0), 0);
              const maxAllowedForThisSplit = Math.max(0, netPayableForCurrentPayment - otherSplitsSum);
              const isCheque = split.paymentTypeId === 2 || split.paymentTypeId === 3 || split.paymentTypeId === 4;
              const isCard = split.paymentTypeId === 5 || split.paymentTypeId === 6;
              const isUpi = split.paymentTypeId === 11 || split.paymentTypeId === 12;

              return (
                <div
                  key={split.id || sIdx}
                  style={{
                    backgroundColor: colors.surfaceMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr auto', gap: spacing.xs, alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>
                        Mode #{sIdx + 1}
                      </label>
                      <select
                        value={split.paymentTypeId}
                        disabled={isFullyPaid}
                        onChange={(e) => handleSplitTypeChange(sIdx, parseInt(e.target.value, 10))}
                        style={{
                          width: '100%',
                          height: 32,
                          borderRadius: radii.sm,
                          border: `1px solid ${colors.border}`,
                          padding: '0 6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: colors.surface,
                          color: colors.textMain,
                          outline: 'none',
                        }}
                      >
                        {(lookup.PaymentType || [
                          { Id: 1, Text: 'Cash' },
                          { Id: 2, Text: 'Cheque' },
                          { Id: 3, Text: 'Demand Draft' },
                          { Id: 4, Text: 'Wire Transfer / NEFT' },
                          { Id: 5, Text: 'Credit Card' },
                          { Id: 6, Text: 'Debit Card' },
                          { Id: 7, Text: 'Advance Adjustment' },
                          { Id: 11, Text: 'UPI / QR Code' },
                        ]).map((pt: LookupItem) => (
                          <option key={pt.Id} value={pt.Id}>
                            {pt.Text}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                          Amount (₹)
                        </label>
                        <span style={{ fontSize: '9px', color: colors.textSubtle }}>
                          Max: {fmtCur(netPayableForCurrentPayment)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={split.amount !== undefined && split.amount !== null ? split.amount : ''}
                        disabled={isFullyPaid}
                        placeholder="0.00"
                        onChange={(e) => handleSplitAmountChange(sIdx, e.target.value)}
                        style={{
                          width: '100%',
                          height: 32,
                          borderRadius: radii.sm,
                          border: `1px solid ${colors.border}`,
                          padding: '0 8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: colors.primary,
                          boxSizing: 'border-box',
                          backgroundColor: colors.surface,
                        }}
                      />
                    </div>

                    <div style={{ paddingTop: 14 }}>
                      {paymentSplits.length > 1 && !isFullyPaid && (
                        <button
                          type="button"
                          onClick={() => handleRemovePaymentSplit(sIdx)}
                          title="Remove this split"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '13px',
                          }}
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mode-specific detail inputs */}
                  {isUpi && (
                    <div style={{ marginTop: 6 }}>
                      <input
                        type="text"
                        placeholder="UPI Ref / Transaction ID"
                        value={split.upiRefNumber || (sIdx === 0 ? item.UPIRefNumber || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          handleSplitFieldChange(sIdx, 'upiRefNumber', e.target.value);
                          if (sIdx === 0) dispatch('fieldChange', { UPIRefNumber: e.target.value });
                        }}
                        style={{
                          width: '100%',
                          height: 28,
                          borderRadius: radii.sm,
                          border: `1px solid ${colors.border}`,
                          padding: '0 8px',
                          fontSize: '11px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  {isCard && (
                    <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                      <select
                        value={split.cardTypeId || (sIdx === 0 ? item.CardTypeId || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleSplitFieldChange(sIdx, 'cardTypeId', val);
                          if (sIdx === 0) dispatch('cardTypeChange', { id: val });
                        }}
                        style={{ height: 28, fontSize: '11px', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}
                      >
                        <option value="">-- Card Type --</option>
                        {(lookup.CardType || []).map((c: LookupItem) => (
                          <option key={c.Id} value={c.Id}>{c.Text}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Last 4"
                        value={split.cardNumber || (sIdx === 0 ? item.CardNumber || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          handleSplitFieldChange(sIdx, 'cardNumber', e.target.value);
                          if (sIdx === 0) dispatch('fieldChange', { CardNumber: e.target.value });
                        }}
                        style={{ height: 28, fontSize: '11px', borderRadius: radii.sm, border: `1px solid ${colors.border}`, padding: '0 6px', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="Auth Code"
                        value={split.authorizeNumber || (sIdx === 0 ? item.AuthorizeNumber || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          handleSplitFieldChange(sIdx, 'authorizeNumber', e.target.value);
                          if (sIdx === 0) dispatch('fieldChange', { AuthorizeNumber: e.target.value });
                        }}
                        style={{ height: 28, fontSize: '11px', borderRadius: radii.sm, border: `1px solid ${colors.border}`, padding: '0 6px', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {isCheque && (
                    <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 4 }}>
                      <select
                        value={split.bankId || (sIdx === 0 ? item.BankId || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleSplitFieldChange(sIdx, 'bankId', val);
                          if (sIdx === 0) dispatch('bankChange', { id: val });
                        }}
                        style={{ height: 28, fontSize: '11px', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}
                      >
                        <option value="">-- Select Bank --</option>
                        {(lookup.Bank || []).map((b: LookupItem) => (
                          <option key={b.Id} value={b.Id}>{b.Text}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Cheque No"
                        value={split.chequeNo || (sIdx === 0 ? item.ChequeNo || '' : '')}
                        disabled={isFullyPaid}
                        onChange={(e) => {
                          handleSplitFieldChange(sIdx, 'chequeNo', e.target.value);
                          if (sIdx === 0) dispatch('fieldChange', { ChequeNo: e.target.value });
                        }}
                        style={{ height: 28, fontSize: '11px', borderRadius: radii.sm, border: `1px solid ${colors.border}`, padding: '0 6px', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Split & Auto-fill buttons */}
          {!isFullyPaid && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, gap: spacing.xs }}>
              <button
                type="button"
                onClick={handleAddPaymentSplit}
                disabled={paymentSplits.length >= 6}
                style={{
                  border: `1px dashed ${colors.primary}`,
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  borderRadius: radii.sm,
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: paymentSplits.length >= 6 ? 'not-allowed' : 'pointer',
                  opacity: paymentSplits.length >= 6 ? 0.5 : 1,
                }}
              >
                <i className="fas fa-plus" style={{ marginRight: 4 }} /> Add Payment Split
              </button>

              {outstandingDueAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const lastIdx = paymentSplits.length - 1;
                    handleSplitAmountChange(lastIdx, (paymentSplits[lastIdx]?.amount || 0) + outstandingDueAmount);
                  }}
                  style={{
                    border: 'none',
                    backgroundColor: `${colors.primary}18`,
                    color: colors.primary,
                    borderRadius: radii.sm,
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Auto-fill balance to settle in full"
                >
                  Auto-fill {fmtCur(outstandingDueAmount)}
                </button>
              )}
            </div>
          )}

          {/* Warning when payment splits exceed Net Payable */}
          {isPaymentSplitExceeded && (
            <div
              style={{
                marginTop: spacing.xs,
                padding: '6px 10px',
                borderRadius: radii.sm,
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fas fa-exclamation-circle" />
              <span>
                Total payments ({fmtCur(totalCollectedFromSplits)}) exceed Net Payable ({fmtCur(netPayableForCurrentPayment)}). Please adjust amounts.
              </span>
            </div>
          )}

          {/* Collection Status Summary */}
          <div
            style={{
              marginTop: spacing.sm,
              padding: '8px 10px',
              borderRadius: radii.md,
              backgroundColor: isFullyPaid
                ? '#ecfdf5'
                : ((isBillApproved ? billOutstandingDue : outstandingDueAmount) > 0 ? '#fffbeb' : colors.surfaceSunken),
              border: `1px solid ${isFullyPaid ? '#10b981' : ((isBillApproved ? billOutstandingDue : outstandingDueAmount) > 0 ? '#fde68a' : colors.border)}`,
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: colors.textMuted }}>Total Collected:</span>
              <strong style={{ color: '#15803d' }}>
                {fmtCur(isBillApproved ? (prevPaidAmt || totalCollectedFromSplits) : totalCollectedFromSplits)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textMuted }}>Outstanding Balance:</span>
              <strong style={{ color: (isBillApproved ? billOutstandingDue : outstandingDueAmount) > 0 ? '#b91c1c' : '#15803d' }}>
                {fmtCur(isBillApproved ? billOutstandingDue : outstandingDueAmount)}
              </strong>
            </div>
          </div>

          {/* Due Approval / Credit Authorization Section */}
          <div
            style={{
              marginTop: spacing.sm,
              padding: '10px',
              borderRadius: radii.md,
              backgroundColor: (effectiveRemainingDue > 0 && !isFullyPaid) ? '#fffbeb' : colors.surfaceSunken,
              border: `1px solid ${(effectiveRemainingDue > 0 && !isFullyPaid) ? '#fde68a' : colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textMain, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="fas fa-file-invoice-dollar" style={{ color: (effectiveRemainingDue > 0 && !isFullyPaid) ? '#d97706' : colors.primary }} />
                Due Approval
              </span>
              {(effectiveRemainingDue > 0 && !isFullyPaid) ? (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: (item.PrivateDueId || item.GuarantorDueId) ? '#dcfce7' : '#fee2e2',
                    color: (item.PrivateDueId || item.GuarantorDueId) ? '#15803d' : '#b91c1c',
                  }}
                >
                  {(item.PrivateDueId || item.GuarantorDueId) ? '✓ Authorized' : '! Due Approval Required'}
                </span>
              ) : isFullyPaid ? (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  Paid in Full
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                  }}
                >
                  Nil Due
                </span>
              )}
            </div>

            {(effectiveRemainingDue > 0 && !isFullyPaid && !(item.PrivateDueId || item.GuarantorDueId)) && (
              <div style={{ fontSize: '11px', color: '#b45309', marginBottom: 6, lineHeight: 1.3 }}>
                Outstanding due of <strong>{fmtCur(effectiveRemainingDue)}</strong> requires an authorized Due Approver.
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 2 }}>
                Credit / Due Approver
              </label>
              <select
                value={item.PrivateDueId ?? item.GuarantorDueId ?? ''}
                disabled={isFullyPaid}
                onChange={(e) =>
                  dispatch('creditApproverChange', { id: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  height: 32,
                  borderRadius: radii.sm,
                  border: `1px solid ${(effectiveRemainingDue > 0 && !isFullyPaid && !(item.PrivateDueId || item.GuarantorDueId)) ? '#f59e0b' : colors.border}`,
                  padding: '0 8px',
                  fontSize: '12px',
                  backgroundColor: isFullyPaid ? colors.surfaceSunken : colors.surface,
                }}
              >
                <option value="">-- Select Credit / Due Approver --</option>
                {(lookup.PrivateDueApprover || []).map((p: LookupItem) => (
                  <option key={p.Id} value={p.Id}>
                    {p.Text}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 6, textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => { window.location.hash = '#/app/creditapproval'; }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '10px',
                  color: colors.primary,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Open Due Approval Workstation ↗
              </button>
            </div>
          </div>
        </div>

        {/* Settlement Panel 3: Financial Summary & Return Calculator Card */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-calculator" /> Bill Summary &amp; Balance
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
              <span>Available / Advance Amt:</span>
              <span>{fmtCur(item.TotalAvailableAmount || 0)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
              <span>Gross Total:</span>
              <span style={{ fontWeight: 600, color: colors.textMain }}>{fmtCur(item.GrossAmount || currentcontext.GrossAmt || grossAmtDisplay)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
              <span>Total Discount:</span>
              <span>- {fmtCur(Math.min(
                parseFloat(item.TotDiscAmount || currentcontext.TotDiscountAmt || currentcontext.DiscountAmt) || discountAmtDisplay,
                parseFloat(item.GrossAmount || currentcontext.GrossAmt) || grossAmtDisplay
              ))}</span>
            </div>

            {item.AgreementDiscountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                <span>MOU Discount:</span>
                <span>- {fmtCur(item.AgreementDiscountAmt || 0)}</span>
              </div>
            )}

            {flags.showVAT && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                <span>Tax / GST:</span>
                <span>+ {fmtCur(item.GSTAmount || computedGstAmt || 0)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                paddingBottom: 8,
                borderTop: `1px solid ${colors.border}`,
                borderBottom: `2px solid ${colors.border}`,
                fontSize: '16px',
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              <span>Net Amount:</span>
              <span>{fmtCur(item.TotNetAmount || currentcontext.TotNetAmount || currentcontext.NetAmt || netAmtDisplay)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
              <span>Paid / Received:</span>
              <span style={{ fontWeight: 600, color: '#15803d' }}>
                {fmtCur(isBillApproved ? (prevPaidAmt || totalCollectedFromSplits) : (totalCollectedFromSplits > 0 ? totalCollectedFromSplits : (item.Received || currentcontext.ReceiptAmt || 0)))}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: (isBillApproved ? billOutstandingDue : outstandingDueAmount) > 0 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
              <span>Outstanding Due:</span>
              <span>
                {fmtCur(isBillApproved ? billOutstandingDue : outstandingDueAmount)}
              </span>
            </div>

            {/* Tender Amount Input & Change Return Box */}
            <div
              style={{
                marginTop: 6,
                padding: '8px 10px',
                backgroundColor: colors.surfaceSunken,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                  Tender Cash:
                </span>
                <input
                  type="number"
                  step="1"
                  value={currentcontext.TenderAmount || ''}
                  placeholder="e.g. 500"
                  onChange={(e) =>
                    dispatch('tenderAmtChange', { value: parseFloat(e.target.value) || 0 })
                  }
                  style={{
                    width: 100,
                    height: 28,
                    textAlign: 'right',
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border}`,
                    padding: '0 6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 4,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                  Change to Return:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#15803d' }}>
                  {fmtCur(returnAmt || currentcontext.ReturnAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. PAYMENT RECEIPTS & REFUND AUDIT LOG (if available)
      ───────────────────────────────────────────────────────────── */}
      {(paymentInfoDetails.length > 0 || refundInfoDetails.length > 0) && (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing.sm,
            }}
          >
            Payment Receipts &amp; Refund History
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {paymentInfoDetails.map((pay: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: radii.md,
                  backgroundColor: colors.surfaceMuted,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <div>
                  <strong>{pay.ReceiptType || 'Receipt'}</strong> • #{pay.ReceiptNumber} •{' '}
                  {fmtDisplayDate(pay.ReceiptDateTime)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>{fmtCur(pay.AmountPaid)}</span>
                  <span style={{ color: colors.textMuted }}>({pay.PaymentInfo || 'Settled'})</span>
                </div>
              </div>
            ))}

            {refundInfoDetails.map((ref: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: radii.md,
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#b91c1c',
                }}
              >
                <div>
                  <strong>Refund</strong> • #{ref.ReceiptNumber} • {fmtDisplayDate(ref.ReceiptDateTime)}
                </div>
                <div>
                  <strong>- {fmtCur(ref.AmountPaid)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. INLINE ACTION BAR (Inside screen below payment section, scrolls with page)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: spacing.md,
          marginBottom: spacing.lg,
          padding: `${spacing.sm} ${spacing.md}`,
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button
            variant="ghost"
            icon="fa-arrow-left"
            title="Go back to previous screen"
            onClick={() => dispatch('backtoList')}
          >
            Back
          </Button>

          {flags.canDelete && hasBillId && !isBillApproved && (
            <Button
              variant="danger"
              icon="fa-trash-alt"
              title="Delete complete bill"
              disabled={isScreenEmpty || !hasBillId}
              onClick={() => dispatch('deleteCompleteBill')}
            >
              Delete Bill
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          {/* Thermal Print (Enabled only once bill is approved, and shown only based on thermal option) */}
          {hasThermalOption && (
            <Button
              variant="secondary"
              icon="fa-receipt"
              title={
                !isBillApproved
                  ? 'Thermal Print is enabled only after bill is approved'
                  : 'Thermal Slip Print'
              }
              disabled={!canThermalPrint}
              onClick={() => dispatch('thermalPrint')}
            >
              Thermal Print
            </Button>
          )}

          {/* Standard Bill Print (Enabled only once bill is approved) */}
          <Button
            variant="info"
            icon="fa-print"
            title={
              !isBillApproved
                ? 'Print is enabled only after bill is approved'
                : 'Print Full Bill (Alt+P)'
            }
            disabled={!canPrint}
            onClick={() => dispatch('print')}
          >
            Print (Alt+P)
          </Button>

          {/* Unapproved Draft Bills: Show Save Draft and Save & Collect */}
          {!isBillApproved && (
            <>
              {flags.canShowSaveBtn !== false && privileges.canSave !== false && (
                <Button
                  variant="warning"
                  icon="fa-save"
                  title={
                    !discountValidation.isValid
                      ? `Cannot save: ${discountValidation.errorMessage}`
                      : isScreenEmpty
                      ? 'Please select a patient and add a service'
                      : !hasEnteredServices
                      ? 'Please enter at least one service to save draft'
                      : 'Save as Draft (Alt+S)'
                  }
                  disabled={!canSaveDraft}
                  onClick={() => dispatch('saveDraft')}
                >
                  Save Draft (Alt+S)
                </Button>
              )}

              {flags.canShowSaveapproveBtn !== false && privileges.canSaveApprove !== false && (
                <Button
                  variant="success"
                  icon="fa-check-circle"
                  title={
                    !discountValidation.isValid
                      ? `Cannot approve: ${discountValidation.errorMessage}`
                      : isScreenEmpty
                      ? 'Please select a patient and add a service'
                      : !hasEnteredServices
                      ? 'Please enter at least one service to approve bill'
                      : 'Save Bill & Collect Payment (Alt+A)'
                  }
                  disabled={!canSaveApprove}
                  onClick={() => dispatch('saveAndApprove')}
                >
                  Save &amp; Collect (Alt+A)
                </Button>
              )}
            </>
          )}

          {/* Approved bill with remaining balance: Support collecting balance */}
          {isBillApproved && billOutstandingDue > 0 && (
            <Button
              variant="success"
              icon="fa-money-bill-wave"
              title="Collect remaining due balance"
              onClick={() => {
                const due = billOutstandingDue;
                const updatedSplits: PaymentSplitLine[] = [
                  {
                    ...paymentSplits[0],
                    amount: due,
                  },
                ];
                setPaymentSplits(updatedSplits);
                syncSplitsToBridge(updatedSplits, false);
                dispatch('collectDueBalance', { amount: due });
              }}
            >
              Collect Due ({fmtCur(billOutstandingDue)})
            </Button>
          )}

          {/* Fully paid indicator */}
          {isBillApproved && billOutstandingDue === 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: radii.md,
                backgroundColor: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <i className="fas fa-check-circle" style={{ color: '#10b981' }} /> Fully Paid
            </div>
          )}
        </div>
      </div>

      {/* Previous Bills Modal (Date-wise) */}
      {showPreviousBillsModal && (
        <Modal
          title="Previous Bills"
          isOpen={showPreviousBillsModal}
          onClose={() => setShowPreviousBillsModal(false)}
          width="1100px"
          portal
        >
          <FindBillModalComponent
            reactProps={{
              context: isDG ? 'DG' : 'OP',
              modalParams: {
                id: effectivePatient?.Id || currentfilter?.PatientId || -1,
                context: isDG ? 'DG' : 'OP',
              },
              facilityId: effectiveItem?.FacilityId || 1,
            }}
            onSelect={(data: any) => {
              setShowPreviousBillsModal(false);
              dispatch('findBillSelect', data);
            }}
            onClose={() => setShowPreviousBillsModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};
