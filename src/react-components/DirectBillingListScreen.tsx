import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors, spacing, typography, radii, shadows, transitions } from '../components/ui/tokens';
import { Button } from './Button';
import { Modal } from '../components/ui/Modal';
import { FindBillModalComponent } from './FindBillModalComponent';
import { apiFetch } from './utils/api';

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
  DiscountAmount?: number | string;
  DiscountModeId?: number;
  GSTAmount?: number;
  NetAmount?: number;
  ExecDoctorId?: number;
  DoctorShare?: number;
  Status?: number;
  RdoServiceId?: boolean;
  SelectedItem?: any;
  [key: string]: any;
}

export interface DirectBillingListScreenProps {
  reactProps?: {
    item?: any;
    currentfilter?: any;
    currentcontext?: any;
    patientBillDetails?: PatientBillDetailRow[];
    paymentInfoDetails?: any[];
    patientPaymentDetails?: any[];
    refundInfoDetails?: any[];
    lookup?: {
      Doctor?: LookupItem[];
      Department?: LookupItem[];
      ServiceItem?: LookupItem[];
      PaymentType?: LookupItem[];
      Bank?: LookupItem[];
      CardType?: LookupItem[];
      Terminal?: LookupItem[];
      Gender?: LookupItem[];
      Referral?: LookupItem[];
      DiscountMode?: LookupItem[];
      DiscountApprover?: LookupItem[];
      [key: string]: any;
    };
    privileges?: {
      canViewPreviousBills?: boolean;
      canSave?: boolean;
      canSaveApprove?: boolean;
      canCancel?: boolean;
      canDiscount?: boolean;
      [key: string]: boolean | undefined;
    };
    flags?: {
      context?: string;
      canShowCancelBtn?: boolean;
      canShowSaveBtn?: boolean;
      canShowSaveapproveBtn?: boolean;
      canShowClearBtn?: boolean;
      isDue?: boolean;
      disallowMultiplePay?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
  [key: string]: any;
}

// Currency Formatter
const fmtCur = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Date Display Formatter
const fmtDisplayDate = (d?: string | Date | null): string => {
  if (!d) return '-';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

// Reusable Discount Toggle matching OP Billing: % on left, ₹ on right
export const DiscountToggle: React.FC<{
  mode: number; // 2 = %, 1 = ₹
  onChange: (mode: number) => void;
  disabled?: boolean;
}> = ({ mode, onChange, disabled }) => {
  const isPercent = mode !== 1;

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
          backgroundColor: !isPercent ? colors.primary : 'transparent',
          color: !isPercent ? '#ffffff' : colors.textMuted,
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
    const rMode = (r.DiscountModeId && r.DiscountModeId > 0) ? r.DiscountModeId : (billMode > 0 ? billMode : 2);
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

export const DirectBillingListScreen: React.FC<DirectBillingListScreenProps> = (props) => {
  const actualReactProps = props.reactProps || props;
  const rawItem = actualReactProps.item || {};
  const rawCurrentfilter = actualReactProps.currentfilter || {};
  const rawCurrentcontext = actualReactProps.currentcontext || {};
  const rawPatientBillDetails: PatientBillDetailRow[] = actualReactProps.patientBillDetails || [];
  const rawLookup = actualReactProps.lookup || {};
  const privileges = actualReactProps.privileges || {};
  // Payment and refund audit history (matching OpBillingListScreen direct derivation)
  const paymentInfoDetails: any[] = (actualReactProps.paymentInfoDetails && actualReactProps.paymentInfoDetails.length > 0)
    ? actualReactProps.paymentInfoDetails
    : (Array.isArray(actualReactProps.patientPaymentDetails) && actualReactProps.patientPaymentDetails.length > 0
        ? actualReactProps.patientPaymentDetails.map((p: any) => ({
            ReceiptNumber: p.ReceiptNumber || p.ReceiptNr || ('REC-' + p.Id),
            ReceiptType: (p.ReceiptType && p.ReceiptType.Description) ? p.ReceiptType.Description : (p.ReceiptType || 'Receipt'),
            ReceiptDateTime: p.ReceiptDateTime || p.CollectedOn || p.CreatedAt,
            AmountPaid: parseFloat(p.AmountPaid) || 0,
            PaymentInfo: p.PaymentInfo || (p.PaymentTypeId === 1 ? 'Cash' : (p.PaymentTypeId === 2 ? 'Cheque' : (p.PaymentTypeId === 5 || p.PaymentTypeId === 6 ? 'Card' : (p.PaymentTypeId === 11 || p.PaymentTypeId === 12 ? 'UPI' : 'Settled'))))
          }))
        : []);
  const refundInfoDetails: any[] = actualReactProps.refundInfoDetails || [];


  // Form states for Direct Patient Info (No patient search, direct inline creation)
  const [patientName, setPatientName] = useState<string>(rawCurrentfilter.FirstName || rawItem.PatientName || '');
  const [genderId, setGenderId] = useState<number>(rawCurrentfilter.GenderId || 1);
  const [referralId, setReferralId] = useState<number>(rawCurrentfilter.ReferralId || -1);
  const [age, setAge] = useState<string>(rawCurrentfilter.Age != null ? String(rawCurrentfilter.Age) : '');
  const [mobile, setMobile] = useState<string>(rawCurrentfilter.Mobile || '');
  const [headerDiscountModeId, setHeaderDiscountModeId] = useState<number>(
    rawCurrentfilter.DiscountModeId && rawCurrentfilter.DiscountModeId > 0 ? rawCurrentfilter.DiscountModeId : 2
  );

  // Bill header & metadata
  const [billNumber, setBillNumber] = useState<string>(rawItem.BillNumber || '');
  const [patientBillStatusId, setPatientBillStatusId] = useState<number>(
    rawItem.PatientBillStatusId || rawCurrentcontext.PatientBillStatusId || 1
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(rawItem.isCompleted));
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<number>(rawItem.PatientId || rawCurrentfilter.PatientId || 0);

  // Lookups with fallbacks
  const [genderLookup, setGenderLookup] = useState<LookupItem[]>(rawLookup.Gender || [
    { Id: 1, Text: 'Male' },
    { Id: 2, Text: 'Female' },
    { Id: 3, Text: 'Other' },
  ]);
  const [doctorLookup, setDoctorLookup] = useState<LookupItem[]>(rawLookup.Doctor || rawLookup.Referral || []);
  const [serviceLookup, setServiceLookup] = useState<LookupItem[]>(rawLookup.ServiceItem || []);
  const [paymentTypeLookup, setPaymentTypeLookup] = useState<LookupItem[]>(rawLookup.PaymentType || [
    { Id: 1, Text: 'Cash' },
    { Id: 2, Text: 'Cheque' },
    { Id: 5, Text: 'Credit Card' },
    { Id: 6, Text: 'Debit Card' },
    { Id: 11, Text: 'UPI' },
  ]);
  const [bankLookup, setBankLookup] = useState<LookupItem[]>(rawLookup.Bank || []);
  const [discountApproverLookup, setDiscountApproverLookup] = useState<LookupItem[]>(rawLookup.DiscountApprover || []);
  const [privateDueApproverLookup, setPrivateDueApproverLookup] = useState<LookupItem[]>(rawLookup.PrivateDueApprover || []);

  // Services line items
  const [billDetails, setBillDetails] = useState<PatientBillDetailRow[]>(() => {
    if (rawPatientBillDetails && rawPatientBillDetails.length > 0) {
      return rawPatientBillDetails;
    }
    return [
      {
        ServiceId: -1,
        ServiceCode: '',
        ServiceName: '',
        Quantity: 1,
        UnitPrice: 0,
        Rate: 0,
        Amount: 0,
        DiscountAmount: 0,
        DiscountModeId: 2,
        NetAmount: 0,
        Status: 1,
      },
    ];
  });

  // Payment settlement states
  const [paymentTypeId, setPaymentTypeId] = useState<number>(rawCurrentcontext.PaymentTypeId || 1);
  const [receiptAmt, setReceiptAmt] = useState<number>(rawCurrentcontext.ReceiptAmt || 0);
  const [headerDiscount, setHeaderDiscount] = useState<number>(rawCurrentcontext.BillDiscount || 0);
  const [bankId, setBankId] = useState<number>(rawItem.BankId || 0);
  const [chequeNo, setChequeNo] = useState<string>(rawItem.ChequeNo || '');
  const [upiRefNumber, setUpiRefNumber] = useState<string>(rawItem.UPIRefNumber || '');
  const [cardNumber, setCardNumber] = useState<string>(rawItem.CardNumber || '');
  const [comments, setComments] = useState<string>(rawItem.Comments || '');
  const [discountApprovedBy, setDiscountApprovedBy] = useState<number>(rawCurrentcontext.DiscountApprovedBy || 0);
  const [privateDueApproverId, setPrivateDueApproverId] = useState<number | ''>(
    rawItem.PrivateDueId || rawItem.GuarantorDueId || rawCurrentcontext.PrivateDueId || ''
  );
  const [isMultiplePayment, setIsMultiplePayment] = useState<boolean>(Boolean(rawItem.IsMultiplePayment));
  const [tenderAmt, setTenderAmt] = useState<number>(rawCurrentcontext.TenderAmount || 0);

  // Status & error tracking
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');
  const [highlightedServiceIdx, setHighlightedServiceIdx] = useState<number>(0);
  const [serviceSearchResults, setServiceSearchResults] = useState<any[]>([]);
  const [isSearchingService, setIsSearchingService] = useState<boolean>(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  const [showFindBill, setShowFindBill] = useState<boolean>(false);
  const userEditedReceiptRef = useRef<boolean>(false);
  const prevNetRef = useRef<number>(0);

  // Autonomous lookup hydration on mount to ensure doctor, referral, gender, payment types are always available
  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      try {
        const inputData = [
          { Key: 'Gender' },
          { Key: 'DiscountMode' },
          { Key: 'PaymentType' },
          { Key: 'Bank' },
          { Key: 'CardType' },
          { Key: 'Terminal' },
          { Key: 'DiscountApprover' },
          { Key: 'PrivateDueApprover' },
          {
            Key: 'Referral',
            Request: {
              Params: [{ Key: 7, Value: [1] }],
              PageContext: { PageSize: -1, PageNumber: 1 },
            },
          },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 33, Value: [-1, 1] }],
            },
          },
        ];
        const res = await apiFetch('General/Options/getoptions', inputData);
        if (isMounted && res && typeof res === 'object') {
          if (res.Gender && Array.isArray(res.Gender) && res.Gender.length > 0) {
            setGenderLookup(res.Gender);
          }
          if (res.PaymentType && Array.isArray(res.PaymentType) && res.PaymentType.length > 0) {
            setPaymentTypeLookup(res.PaymentType);
          }
          if (res.Bank && Array.isArray(res.Bank) && res.Bank.length > 0) {
            setBankLookup(res.Bank);
          }
          if (res.DiscountApprover && Array.isArray(res.DiscountApprover) && res.DiscountApprover.length > 0) {
            setDiscountApproverLookup(res.DiscountApprover);
          }
          if (res.PrivateDueApprover && Array.isArray(res.PrivateDueApprover) && res.PrivateDueApprover.length > 0) {
            setPrivateDueApproverLookup(res.PrivateDueApprover);
          }
          const combinedDocs = [
            ...(res.Referral || []),
            ...(res.Doctor || []),
          ];
          if (combinedDocs.length > 0) {
            setDoctorLookup(combinedDocs);
          }
        }
      } catch (err) {
        console.warn('Autonomous options hydration failed:', err);
      }
    };
    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced Service Item Search API via ClinicalMaster/ServiceItem/GetServiceItems
  useEffect(() => {
    if (activeSearchIndex === null) {
      setServiceSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingService(true);
        const raw = (serviceSearchTerm || '').trim();
        const clean = raw.replace(/[%*]/g, '').trim();

        const params: any[] = [{ Key: 4, Value: 2 }];
        if (clean.length > 0) {
          params.push({ Key: 1, Value: clean });
        }

        const res = await apiFetch('ClinicalMaster/ServiceItem/GetServiceItems', {
          Params: params,
          PageContext: { PageSize: 50, PageNumber: 1 },
        });

        const rawList = res?.Data || res?.data || (Array.isArray(res) ? res : []);
        const list = rawList.map((s: any) => {
          let rate = s.Rate ?? s.ServiceItemRate ?? s.UnitPrice ?? 0;
          if (Array.isArray(s.ServiceItemTariffDetails) && s.ServiceItemTariffDetails.length > 0) {
            const tariff = s.ServiceItemTariffDetails[0];
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
            UnitPrice: rate,
            ItemCode: s.ItemCode || s.Code || s.ShortCode || '',
            Name: s.Name || s.ServiceName || s.Text || '',
            ServiceName: s.Name || s.ServiceName || s.Text || '',
            Text: s.Name || s.ServiceName || s.Text || '',
            Code: s.ItemCode || s.Code || s.ShortCode || '',
          };
        });

        setServiceSearchResults(list);
        setHighlightedServiceIdx(0);
      } catch (err) {
        console.warn('Direct Billing Service Search error:', err);
        const clean = (serviceSearchTerm || '').replace(/[%*]/g, '').toLowerCase().trim();
        const filtered = (serviceLookup || []).filter((s: any) => {
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
  }, [serviceSearchTerm, activeSearchIndex]);

  // Click outside listener for service dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target as Node) &&
        !target?.closest?.('.service-search-container') &&
        (!target || !target.id || !target.id.startsWith('txtServiceItem_'))
      ) {
        setActiveSearchIndex(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Determine if bill is generated / finalized (Locked mode)
  const isBillGenerated = useMemo(() => {
    return Boolean(
      (billNumber && String(billNumber).trim().length > 0 && patientBillStatusId !== 1) ||
      patientBillStatusId === 2 ||
      patientBillStatusId === 3 ||
      isCompleted ||
      isApproved
    );
  }, [billNumber, patientBillStatusId, isCompleted, isApproved]);

  // Synchronize incoming props if parent angular controller updates
  useEffect(() => {
    if (actualReactProps.item) {
      if (actualReactProps.item.BillNumber) setBillNumber(actualReactProps.item.BillNumber);
      if (actualReactProps.item.PatientBillStatusId) setPatientBillStatusId(actualReactProps.item.PatientBillStatusId);
      if (actualReactProps.item.isCompleted != null) setIsCompleted(Boolean(actualReactProps.item.isCompleted));
      if (actualReactProps.item.PatientId) setPatientId(actualReactProps.item.PatientId);
      if (actualReactProps.item.PatientName) setPatientName(actualReactProps.item.PatientName);
      if (actualReactProps.item.Comments) setComments(actualReactProps.item.Comments);
      if (actualReactProps.item.IsMultiplePayment != null) setIsMultiplePayment(Boolean(actualReactProps.item.IsMultiplePayment));
      if (actualReactProps.item.PrivateDueId || actualReactProps.item.GuarantorDueId) {
        setPrivateDueApproverId(actualReactProps.item.PrivateDueId || actualReactProps.item.GuarantorDueId);
      }
      if (actualReactProps.item.DiscountApprovedBy) {
        setDiscountApprovedBy(actualReactProps.item.DiscountApprovedBy);
      }
    }
    if (actualReactProps.currentfilter) {
      if (actualReactProps.currentfilter.FirstName) setPatientName(actualReactProps.currentfilter.FirstName);
      if (actualReactProps.currentfilter.GenderId) setGenderId(actualReactProps.currentfilter.GenderId);
      if (actualReactProps.currentfilter.ReferralId) setReferralId(actualReactProps.currentfilter.ReferralId);
      if (actualReactProps.currentfilter.Age != null) setAge(String(actualReactProps.currentfilter.Age));
      if (actualReactProps.currentfilter.Mobile) setMobile(actualReactProps.currentfilter.Mobile);
      if (actualReactProps.currentfilter.DiscountModeId && actualReactProps.currentfilter.DiscountModeId > 0) {
        setHeaderDiscountModeId(actualReactProps.currentfilter.DiscountModeId);
      }
    }
    if (actualReactProps.currentcontext) {
      if (actualReactProps.currentcontext.PaymentTypeId) setPaymentTypeId(actualReactProps.currentcontext.PaymentTypeId);
      if (actualReactProps.currentcontext.ReceiptAmt !== undefined) {
        if (!userEditedReceiptRef.current || receiptAmt === 0) {
          setReceiptAmt(actualReactProps.currentcontext.ReceiptAmt);
        }
      }
      if (actualReactProps.currentcontext.BillDiscount !== undefined) setHeaderDiscount(actualReactProps.currentcontext.BillDiscount);
      if (actualReactProps.currentcontext.DiscountApprovedBy !== undefined) {
        setDiscountApprovedBy(actualReactProps.currentcontext.DiscountApprovedBy);
      }
    }
    if (actualReactProps.patientBillDetails && actualReactProps.patientBillDetails.length > 0) {
      const incoming = actualReactProps.patientBillDetails;
      if (!isBillGenerated && !incoming.some((r: any) => Number(r.ServiceId) <= 0 || !r.ServiceId)) {
        setBillDetails([
          ...incoming,
          {
            ServiceId: -1,
            ServiceCode: '',
            ServiceName: '',
            Quantity: 1,
            UnitPrice: 0,
            Rate: 0,
            Amount: 0,
            DiscountAmount: 0,
            DiscountModeId: headerDiscountModeId || 2,
            NetAmount: 0,
            Status: 1,
          },
        ]);
      } else {
        setBillDetails(incoming);
      }
    }
    if (actualReactProps.lookup) {
      if (actualReactProps.lookup.Doctor || actualReactProps.lookup.Referral) {
        const combined = [
          ...(actualReactProps.lookup.Referral || []),
          ...(actualReactProps.lookup.Doctor || []),
        ];
        if (combined.length > 0) setDoctorLookup(combined);
      }
      if (actualReactProps.lookup.Gender && actualReactProps.lookup.Gender.length > 0) {
        setGenderLookup(actualReactProps.lookup.Gender);
      }
      if (actualReactProps.lookup.ServiceItem && actualReactProps.lookup.ServiceItem.length > 0) {
        setServiceLookup(actualReactProps.lookup.ServiceItem);
      }
      if (actualReactProps.lookup.PaymentType && actualReactProps.lookup.PaymentType.length > 0) {
        setPaymentTypeLookup(actualReactProps.lookup.PaymentType);
      }
      if (actualReactProps.lookup.PrivateDueApprover && actualReactProps.lookup.PrivateDueApprover.length > 0) {
        setPrivateDueApproverLookup(actualReactProps.lookup.PrivateDueApprover);
      }
      if (actualReactProps.lookup.Bank && actualReactProps.lookup.Bank.length > 0) {
        setBankLookup(actualReactProps.lookup.Bank);
      }
      if (actualReactProps.lookup.DiscountApprover && actualReactProps.lookup.DiscountApprover.length > 0) {
        setDiscountApproverLookup(actualReactProps.lookup.DiscountApprover);
      }
    }
  }, [actualReactProps.item, actualReactProps.currentfilter, actualReactProps.currentcontext, actualReactProps.patientBillDetails, actualReactProps.lookup]);



  // Previous amount paid on this bill (if already generated)
  const prevPaidAmt = parseFloat(
    (actualReactProps.item && (actualReactProps.item.PaidAmount ?? actualReactProps.item.TotalPaidAmount)) ??
    (actualReactProps.currentcontext && actualReactProps.currentcontext.PaidAmt) ??
    0
  ) || 0;

  // Compute bill financial totals matching OP Billing
  const totals = useMemo(() => {
    const activeRows = billDetails.filter((r) => r.Status !== 2 && (Number(r.ServiceId) > 0 || !isBillGenerated));
    let gross = 0;
    let lineDiscount = 0;

    activeRows.forEach((r) => {
      const rowRate = parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0;
      const rowQty = parseFloat(r.Quantity as any) || 1;
      const rowAmt = rowRate * rowQty;
      const rowDiscVal = parseFloat(r.DiscountAmount as any) || 0;
      const rowDiscMode = (r.DiscountModeId && r.DiscountModeId > 0) ? r.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2);
      const clampedDiscVal = rowDiscMode === 2
        ? Math.min(Math.max(0, rowDiscVal), 100)
        : Math.min(Math.max(0, rowDiscVal), rowAmt);
      const rowDiscAmt = rowDiscMode === 2 ? (clampedDiscVal / 100) * rowAmt : clampedDiscVal;

      gross += rowAmt;
      lineDiscount += rowDiscAmt;
    });

    // Total discount matching OP Billing:
    // If headerDiscount (Bill Discount in Bill Discount & Approvals) > 0:
    // header discount applies on gross!
    // Otherwise, total discount is sum of line discounts!
    let totalDiscount = 0;
    if (headerDiscount > 0) {
      if (headerDiscountModeId === 2) {
        const clampedHeaderDisc = Math.min(Math.max(0, headerDiscount), 100);
        totalDiscount = (clampedHeaderDisc / 100) * gross;
      } else {
        totalDiscount = Math.min(headerDiscount, gross);
      }
    } else {
      totalDiscount = Math.min(lineDiscount, gross);
    }
    totalDiscount = Math.min(totalDiscount, gross);

    const net = Math.max(0, Math.round(gross - totalDiscount));
    const returnAmt = Math.max(0, tenderAmt - (receiptAmt || 0));

    // Base outstanding due for this bill:
    // If bill is already generated, use OutStandingAmount / TotalDueAmount / PendingAmt / (net - prevPaidAmt)
    // If draft bill, baseDue is net
    const baseDue = isBillGenerated
      ? Math.max(
          0,
          parseFloat(
            actualReactProps.item?.OutStandingAmount ??
            actualReactProps.item?.TotalDueAmount ??
            actualReactProps.currentcontext?.PendingAmt ??
            (net - prevPaidAmt)
          ) || 0
        )
      : net;

    // Remaining due balance after current receiptAmt collection
    const balance = Math.max(0, baseDue - (receiptAmt || 0));

    return { gross, lineDiscount, totalDiscount, net, baseDue, balance, returnAmt };
  }, [
    billDetails,
    headerDiscount,
    headerDiscountModeId,
    receiptAmt,
    tenderAmt,
    isBillGenerated,
    prevPaidAmt,
    actualReactProps.item?.OutStandingAmount,
    actualReactProps.item?.TotalDueAmount,
    actualReactProps.currentcontext?.PendingAmt,
  ]);

  const discountValidation = useMemo(() => {
    const activeRows = billDetails.filter((r) => r.Status !== 2 && (Number(r.ServiceId) > 0 || !isBillGenerated));
    return validateDiscountState(headerDiscount, headerDiscountModeId, totals.gross, activeRows);
  }, [headerDiscount, headerDiscountModeId, totals.gross, billDetails, isBillGenerated]);

  const billOutstandingDue = isBillGenerated ? totals.baseDue : totals.net;
  const isFullyPaid = isBillGenerated && billOutstandingDue <= 0 && (actualReactProps.item?.IsPaidFully === true || prevPaidAmt > 0);
  const isSettlementLocked = isBillGenerated && (billOutstandingDue <= 0 || isFullyPaid);

  // Autofill receipt amount:
  // - If draft bill: autofill with net amount and keep synchronized unless user entered custom partial payment
  // - If generated bill with outstanding due: autofill with remaining due
  useEffect(() => {
    if (!isBillGenerated) {
      const prevNet = prevNetRef.current;
      prevNetRef.current = totals.net;

      if (!userEditedReceiptRef.current || !receiptAmt || receiptAmt === 0 || receiptAmt === prevNet) {
        if (totals.net >= 0 && receiptAmt !== totals.net) {
          setReceiptAmt(totals.net);
          if (props.onAction) {
            props.onAction('receiptAmtChange', { value: totals.net });
          }
        }
      }
    } else if (isBillGenerated && billOutstandingDue > 0) {
      if (!userEditedReceiptRef.current || !receiptAmt || receiptAmt === 0) {
        setReceiptAmt(billOutstandingDue);
        if (props.onAction) {
          props.onAction('receiptAmtChange', { value: billOutstandingDue });
        }
      }
    }
  }, [totals.net, isBillGenerated, billOutstandingDue]);

  // When loading a different generated bill with outstanding due, default receiptAmt to due
  useEffect(() => {
    if (isBillGenerated && billOutstandingDue > 0) {
      setReceiptAmt(billOutstandingDue);
    }
  }, [billNumber]);

  // Dispatch action to bridge if connected
  const dispatchAction = (actionName: string, payload?: any) => {
    if (props.onAction) {
      props.onAction(actionName, payload);
    }
  };

  // Open Previous Bills (F8)
  const handleOpenFindBill = () => {
    if (props.onAction) {
      dispatchAction('findBill');
    } else {
      setShowFindBill(true);
    }
  };

  // Direct patient field changes with bridge sync
  const handleNameChange = (val: string) => {
    const upper = val.toUpperCase();
    setPatientName(upper);
    dispatchAction('directPatientUpdate', { FirstName: upper });
  };

  const handleGenderChange = (val: number) => {
    setGenderId(val);
    dispatchAction('directPatientUpdate', { GenderId: val });
  };

  const handleAgeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setAge(cleaned);
    let approxDob = '';
    if (cleaned && Number(cleaned) > 0) {
      const yr = new Date().getFullYear() - Number(cleaned);
      approxDob = new Date(yr, 0, 1).toISOString();
    }
    dispatchAction('directPatientUpdate', { Age: cleaned, DOB: approxDob });
  };

  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
    dispatchAction('directPatientUpdate', { Mobile: cleaned });
  };

  const handleReferralChange = (val: number) => {
    setReferralId(val);
    dispatchAction('directPatientUpdate', { ReferralId: val });
  };

  // Line item change handlers (guarded against generated bills)
  const handleServiceSelect = (index: number, item: LookupItem) => {
    if (isBillGenerated) return;

    setBillDetails((prev) => {
      const next = [...prev];
      const rate = item.Rate || item.UnitPrice || item.Price || 100;
      const qty = next[index]?.Quantity || 1;
      const amt = qty * rate;

      next[index] = {
        ...next[index],
        ServiceId: item.Id,
        ServiceCode: item.Code || '',
        ServiceName: item.Text || item.ServiceName || '',
        UnitPrice: rate,
        Rate: rate,
        Quantity: qty,
        Amount: amt,
        DiscountAmount: 0,
        DiscountModeId: headerDiscountModeId || 2,
        NetAmount: amt,
        SelectedItem: item,
      };

      // Automatically append empty row if on last row
      if (index === next.length - 1) {
        next.push({
          ServiceId: -1,
          ServiceCode: '',
          ServiceName: '',
          Quantity: 1,
          UnitPrice: 0,
          Rate: 0,
          Amount: 0,
          DiscountAmount: 0,
          DiscountModeId: headerDiscountModeId || 2,
          NetAmount: 0,
          Status: 1,
        });
      }

      return next;
    });

    setActiveSearchIndex(null);
    setServiceSearchTerm('');
    dispatchAction('serviceItemChange', { index, item });
  };

  const calcRowNet = (rate: number, qty: number, disc: number, mode: number) => {
    const gross = rate * qty;
    const clamped = mode === 2 ? Math.min(Math.max(0, disc), 100) : Math.min(Math.max(0, disc), gross);
    const discAmt = mode === 2 ? (clamped / 100) * gross : clamped;
    return Math.max(0, gross - discAmt);
  };

  const handleQtyChange = (index: number, newQtyStr: string) => {
    if (isBillGenerated) return;
    const newQty = parseInt(newQtyStr, 10) || 1;

    setBillDetails((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      const rate = parseFloat(row.Rate as any) || parseFloat(row.UnitPrice as any) || 0;
      const amt = newQty * rate;
      const disc = parseFloat(row.DiscountAmount as any) || 0;
      const mode = (row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2);
      const net = calcRowNet(rate, newQty, disc, mode);

      next[index] = {
        ...row,
        Quantity: newQty,
        Amount: amt,
        NetAmount: net,
      };
      return next;
    });
    dispatchAction('qtyChange', { index, quantity: newQty });
  };

  const handleRateChange = (index: number, newRateStr: string) => {
    if (isBillGenerated) return;
    const newRate = parseFloat(newRateStr) || 0;

    setBillDetails((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      const qty = parseFloat(row.Quantity as any) || 1;
      const amt = qty * newRate;
      const disc = parseFloat(row.DiscountAmount as any) || 0;
      const mode = (row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2);
      const net = calcRowNet(newRate, qty, disc, mode);

      next[index] = {
        ...row,
        Rate: newRate,
        Amount: amt,
        NetAmount: net,
      };
      return next;
    });
    dispatchAction('rateChange', { index, rate: newRate });
  };

  const handleDiscountChange = (index: number, newDiscStr: string) => {
    if (isBillGenerated) return;
    const newDisc = newDiscStr === '' ? 0 : (parseFloat(newDiscStr) || 0);
    const row = billDetails[index];
    const mode = (row && row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2);

    setBillDetails((prev) => {
      const next = [...prev];
      const curRow = next[index];
      if (!curRow) return prev;
      const rate = parseFloat(curRow.Rate as any) || parseFloat(curRow.UnitPrice as any) || 0;
      const qty = parseFloat(curRow.Quantity as any) || 1;
      const amt = rate * qty;
      const net = calcRowNet(rate, qty, newDisc, mode);

      next[index] = {
        ...curRow,
        DiscountAmount: newDiscStr === '' ? '' : newDisc,
        DiscountModeId: mode,
        NetAmount: net,
      };
      return next;
    });
    dispatchAction('lineDiscountChange', {
      index,
      discount: newDisc,
      discountAmount: newDisc,
      discountModeId: mode,
    });
  };

  const handleRowDiscountModeChange = (index: number, newMode: number) => {
    if (isBillGenerated) return;
    setBillDetails((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      const rate = parseFloat(row.Rate as any) || parseFloat(row.UnitPrice as any) || 0;
      const qty = parseFloat(row.Quantity as any) || 1;
      const disc = parseFloat(row.DiscountAmount as any) || 0;
      const net = calcRowNet(rate, qty, disc, newMode);

      next[index] = {
        ...row,
        DiscountModeId: newMode,
        NetAmount: net,
      };
      return next;
    });

    const targetRow = billDetails[index];
    const discVal = targetRow ? (parseFloat(targetRow.DiscountAmount as any) || 0) : 0;
    dispatchAction('lineDiscountChange', {
      index,
      discount: discVal,
      discountAmount: discVal,
      discountModeId: newMode,
    });
  };

  const handleDiscountModeChange = (newMode: number) => {
    if (isBillGenerated) return;
    setHeaderDiscountModeId(newMode);

    setBillDetails((prev) =>
      prev.map((r) => {
        const rate = parseFloat(r.Rate as any) || parseFloat(r.UnitPrice as any) || 0;
        const qty = parseFloat(r.Quantity as any) || 1;
        const disc = parseFloat(r.DiscountAmount as any) || 0;
        const net = calcRowNet(rate, qty, disc, newMode);
        return {
          ...r,
          DiscountModeId: newMode,
          NetAmount: net,
        };
      })
    );

    dispatchAction('headerDiscountChange', {
      discountModeId: newMode,
      value: headerDiscount,
    });
  };

  const handleDeleteRow = (index: number) => {
    if (isBillGenerated) return;

    setBillDetails((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        next.push({
          ServiceId: -1,
          ServiceCode: '',
          ServiceName: '',
          Quantity: 1,
          UnitPrice: 0,
          Rate: 0,
          Amount: 0,
          DiscountAmount: 0,
          DiscountModeId: 2,
          NetAmount: 0,
          Status: 1,
        });
      }
      return next;
    });
    dispatchAction('deleteRow', { index });
  };

  // Validation
  const validateForm = (): boolean => {
    setErrorMessage('');
    if (!discountValidation.isValid) {
      setErrorMessage(discountValidation.errorMessage || 'Please correct discount errors before proceeding.');
      return false;
    }
    if (totals.totalDiscount > 0 && (!discountApprovedBy || discountApprovedBy <= 0)) {
      setErrorMessage('Please select a Discount Approver before saving when discount is applied.');
      return false;
    }
    if (!patientName.trim()) {
      setErrorMessage('Please enter Patient Name.');
      return false;
    }
    if (!genderId || genderId <= 0) {
      setErrorMessage('Please select Sex / Gender.');
      return false;
    }
    if (!age || parseInt(age, 10) <= 0) {
      setErrorMessage('Please enter valid Age in years.');
      return false;
    }
    if (!mobile || mobile.trim().length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Mobile number.');
      return false;
    }

    const validServices = billDetails.filter((r) => r.Status !== 2 && Number(r.ServiceId) > 0);
    if (validServices.length === 0) {
      setErrorMessage('Please add at least one Service Code / Name.');
      return false;
    }

    return true;
  };

  // Save / Approve Flow: Automatically creates patient inline if new, then generates bill
  const handleSave = async (isApprove: boolean) => {
    if (isBillGenerated) return;
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      // If connected to parent bridge, trigger bridge save directly
      if (props.onAction) {
        props.onAction(isApprove ? 'saveAndApprove' : 'saveDraft', {
          FirstName: patientName.trim(),
          GenderId: genderId,
          Age: parseInt(age, 10),
          Mobile: mobile.trim(),
          ReferralId: referralId > 0 ? referralId : undefined,
          DiscountModeId: headerDiscountModeId,
          DiscountApprovedBy: discountApprovedBy > 0 ? discountApprovedBy : undefined,
          BillDiscount: headerDiscount,
          ReceiptAmt: receiptAmt,
          PaymentTypeId: paymentTypeId,
          Comments: comments,
          billDetails: billDetails,
        });
        setIsSaving(false);
        return;
      }

      let resolvedPatientId = patientId;

      // Standalone mode fallback: create patient then save bill
      if (!resolvedPatientId || resolvedPatientId <= 0) {
        const patientPayload = {
          FirstName: patientName.trim(),
          GenderId: genderId,
          Age: parseInt(age, 10),
          Mobile: mobile.trim(),
          ReferralId: referralId > 0 ? referralId : undefined,
          DiscountModeId: headerDiscountModeId,
          OverrideDuplicate: true,
          MRNTypeId: 1,
          PatientStatus: 'Active',
          GuarantorId: 1,
          GuarantorTypeId: 1,
          GuarantorName: 'SELF',
        };

        const patientRes = await apiFetch('registration/patient/AddPatient', {
          method: 'POST',
          body: JSON.stringify({ Data: patientPayload, file: null }),
        });

        if (patientRes && (typeof patientRes === 'number' || patientRes.Data)) {
          resolvedPatientId = typeof patientRes === 'number' ? patientRes : patientRes.Data;
          setPatientId(resolvedPatientId);
        }
      }

      const billPayload = {
        PatientId: resolvedPatientId,
        PatientBillStatusId: isApprove ? 2 : 1,
        PaymentTypeId: paymentTypeId,
        ReceiptAmt: receiptAmt,
        BankId: bankId,
        ChequeNo: chequeNo,
        UPIRefNumber: upiRefNumber,
        CardNumber: cardNumber,
        Comments: comments,
        TotBillAmount: totals.gross,
        TotDiscAmount: totals.totalDiscount,
        TotNetAmt: totals.net,
        TotBalanceAmt: totals.balance,
        PrivateDueId: privateDueApproverId || undefined,
        GuarantorDueId: privateDueApproverId || undefined,
        PatientBillDetails: billDetails.filter((r) => Number(r.ServiceId) > 0),
      };

      const billRes = await apiFetch(
        isApprove ? 'billing/patientbilling/SaveandApprove' : 'billing/patientbilling/SavePatientBill',
        {
          method: 'POST',
          body: JSON.stringify(billPayload),
        }
      );

      if (billRes) {
        const assignedBNum = billRes.BillNumber || billRes.Data?.BillNumber || `DB-${Date.now().toString().slice(-6)}`;
        setBillNumber(assignedBNum);
        setPatientBillStatusId(isApprove ? 2 : 1);
        if (isApprove) setIsApproved(true);
        setSuccessMessage(`Bill ${assignedBNum} successfully ${isApprove ? 'approved' : 'saved as draft'}!`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while saving bill.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset / Clear form
  const handleClear = () => {
    setPatientName('');
    setGenderId(1);
    setReferralId(-1);
    setAge('');
    setMobile('');
    setBillNumber('');
    setPatientBillStatusId(1);
    setIsCompleted(false);
    setIsApproved(false);
    setPatientId(0);
    setReceiptAmt(0);
    setHeaderDiscount(0);
    setPrivateDueApproverId('');
    setComments('');
    setErrorMessage('');
    setSuccessMessage('');
    setBillDetails([
      {
        ServiceId: -1,
        ServiceCode: '',
        ServiceName: '',
        Quantity: 1,
        UnitPrice: 0,
        Rate: 0,
        Amount: 0,
        DiscountAmount: 0,
        DiscountModeId: 2,
        NetAmount: 0,
        Status: 1,
      },
    ]);
    dispatchAction('clear');
  };

  const hasEnteredServices = useMemo(() => {
    return billDetails.some((r) => r.Status !== 2 && Number(r.ServiceId) > 0);
  }, [billDetails]);

  const canSave = useMemo(() => {
    return (
      !isBillGenerated &&
      !isSaving &&
      patientName.trim().length > 0 &&
      hasEnteredServices &&
      discountValidation.isValid
    );
  }, [isBillGenerated, isSaving, patientName, hasEnteredServices, discountValidation.isValid]);

  // Keyboard shortcut listener matching OP Billing screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canSave) {
          handleSave(false);
        }
      } else if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (canSave) {
          handleSave(true);
        }
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isBillGenerated || billNumber) {
          dispatchAction('print');
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (canSave) {
          handleSave(false);
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (canSave) {
          handleSave(true);
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleOpenFindBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSave, isBillGenerated, billNumber, handleSave, handleOpenFindBill]);

  return (
    <div
      className="direct-billing-container"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: colors.textMain,
        padding: '12px 16px 24px 16px',
        backgroundColor: colors.background.primary,
        minHeight: '100vh',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER TOOLBAR MATCHING OP BILLING
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.sm,
          padding: '8px 12px',
          marginBottom: spacing.xs,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.md,
              backgroundColor: colors.primary,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: shadows.sm,
            }}
          >
            <i className="fas fa-file-invoice-dollar" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.textMain,
                  letterSpacing: '-0.01em',
                }}
              >
                Direct (DG) Billing
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: '#ede9fe',
                  color: '#7c3aed',
                }}
              >
                Direct / DG Counter
              </span>
              {billNumber && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: radii.full,
                    fontSize: '10.5px',
                    fontWeight: 700,
                    backgroundColor: isBillGenerated ? '#dcfce7' : '#fef9c3',
                    color: isBillGenerated ? '#15803d' : '#854d0e',
                  }}
                >
                  Bill #: {billNumber}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>
              Hospital Information Management System • Walk-in Diagnostic &amp; Direct Invoicing
            </p>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            icon="fa-plus-circle"
            title="Start a new direct bill"
            onClick={handleClear}
          >
            New
          </Button>

          <Button
            variant="secondary"
            icon="fa-history"
            title="View Previous Bills (Date-wise History - F8)"
            onClick={handleOpenFindBill}
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

      {/* Alerts */}
      {(errorMessage || discountValidation.errorMessage) && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: radii.md,
            padding: '8px 12px',
            marginBottom: spacing.xs,
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="fas fa-exclamation-circle" /> {errorMessage || discountValidation.errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            borderRadius: radii.md,
            padding: '8px 12px',
            marginBottom: spacing.xs,
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="fas fa-check-circle" /> {successMessage}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TOP 3 CARDS: WALK-IN PATIENT CREATION (NO PATIENT SEARCH)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {/* Panel 1: Patient Information */}
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
            <i className="fas fa-user" /> Patient Information
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {/* Field: Patient Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
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
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '12px',
                  }}
                />
                <input
                  type="text"
                  id="txtDirectPatientName"
                  value={patientName}
                  disabled={isBillGenerated}
                  placeholder="ENTER PATIENT NAME"
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px 0 30px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
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

            {/* Row 2: Sex & Age side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Sex / Gender <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="selDirectPatientGender"
                  value={genderId}
                  disabled={isBillGenerated}
                  onChange={(e) => handleGenderChange(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {genderLookup.map((g) => (
                    <option key={g.Id} value={g.Id}>
                      {g.Text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: colors.textMuted,
                    marginBottom: '2px',
                  }}
                >
                  Age (Yrs) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="txtDirectPatientAge"
                  value={age}
                  maxLength={3}
                  disabled={isBillGenerated}
                  placeholder="Yrs"
                  onChange={(e) => handleAgeChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Referral & Clinical Context */}
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
            <i className="fas fa-user-md" /> Referral &amp; Clinical Context
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {/* Field: Referred By with Add Referral Button */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: '2px',
                }}
              >
                Referred By
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <select
                  id="selDirectPatientReferral"
                  value={referralId}
                  disabled={isBillGenerated}
                  onChange={(e) => handleReferralChange(parseInt(e.target.value, 10))}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <option value="-1">-- Self / Direct --</option>
                  {doctorLookup.map((doc, dIdx) => (
                    <option key={doc.Id ? `${doc.Id}-${dIdx}` : dIdx} value={doc.Id}>
                      {doc.Text || doc.DoctorName || doc.ReferralName || doc.Name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  id="btnAddReferralDirect"
                  title="Add Referral / Doctor"
                  disabled={isBillGenerated}
                  onClick={() => dispatchAction('openAddReferral')}
                  style={{
                    height: 36,
                    width: 36,
                    padding: 0,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.primary,
                    color: isBillGenerated ? colors.textMuted : '#ffffff',
                    border: `1px solid ${isBillGenerated ? colors.border : colors.primary}`,
                    borderRadius: radii.md,
                    cursor: isBillGenerated ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    flexShrink: 0,
                    transition: transitions.fast,
                  }}
                >
                  <i className="fas fa-plus" />
                </button>
              </div>
            </div>

            {/* Field: Mobile Number */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: '2px',
                }}
              >
                Mobile Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fas fa-phone-alt"
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '12px',
                  }}
                />
                <input
                  type="text"
                  id="txtDirectPatientMobile"
                  value={mobile}
                  maxLength={10}
                  disabled={isBillGenerated}
                  placeholder="10-digit Mobile #"
                  onChange={(e) => handleMobileChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px 0 30px',
                    borderRadius: radii.md,
                    border: `1px solid ${mobile.length === 10 ? '#8b5cf6' : colors.border}`,
                    fontSize: '13px',
                    color: colors.textMain,
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Tariff & Classification */}
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
            <i className="fas fa-tags" /> Tariff &amp; Classification
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {/* Field: Discount Mode Toggle */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>
                  Header Discount Type
                </label>
                <DiscountToggle
                  mode={headerDiscountModeId}
                  disabled={isBillGenerated}
                  onChange={handleDiscountModeChange}
                />
              </div>
              <input
                type="text"
                readOnly
                value={headerDiscountModeId === 2 ? 'Percentage (%) Mode' : 'Fixed Rupee (₹) Mode'}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  color: colors.textMuted,
                  backgroundColor: colors.surfaceSunken,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Field: Document Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: colors.textMuted,
                  marginBottom: '2px',
                }}
              >
                Document / Visit Date
              </label>
              <div
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textMain,
                  backgroundColor: colors.surfaceSunken,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxSizing: 'border-box',
                }}
              >
                <i className="fas fa-calendar-day" style={{ color: colors.primary }} />
                <span>{fmtDisplayDate(rawCurrentfilter.DocumentDate || new Date())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SERVICE LINE ITEMS TABLE CARD (NO "ADD SERVICE" BUTTON)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          marginBottom: spacing.md,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {/* Table Header Bar */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.textMain }}>
              Service Line Items ({billDetails.filter((r) => r.Status !== 2 && (Number(r.ServiceId) > 0 || !isBillGenerated)).length})
            </span>
            <span style={{ fontSize: '11px', color: colors.textMuted }}>
              • Walk-in diagnostic, laboratory, or direct procedure items
            </span>
          </div>

          {isBillGenerated && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: radii.sm,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <i className="fas fa-lock" /> Services Locked (Bill Generated)
            </span>
          )}
        </div>

        {/* Services Table */}
        <div
          style={{
            overflowX: 'auto',
            overflowY: 'visible',
            minHeight: activeSearchIndex !== null ? 360 : undefined,
            transition: 'min-height 0.15s ease',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: `1px solid ${colors.border}`, textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', width: '40px', textAlign: 'center', fontWeight: 700, color: colors.textMuted }}>
                  #
                </th>
                <th style={{ padding: '8px 12px', minWidth: '260px', fontWeight: 700, color: colors.textMuted }}>
                  Service Item <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ padding: '8px 12px', width: '80px', fontWeight: 700, color: colors.textMuted }}>
                  Qty <span style={{ color: '#ef4444' }}>*</span>
                </th>
                <th style={{ padding: '8px 12px', width: '100px', fontWeight: 700, color: colors.textMuted }}>
                  Base Rate
                </th>
                <th style={{ padding: '8px 12px', width: '110px', textAlign: 'right', fontWeight: 700, color: colors.textMuted }}>
                  Gross Amt
                </th>
                <th style={{ padding: '8px 6px', width: '150px', textAlign: 'center', fontWeight: 700, color: colors.textMuted }}>
                  Discount (% / ₹)
                </th>
                <th style={{ padding: '8px 12px', width: '110px', textAlign: 'right', fontWeight: 700, color: colors.textMuted }}>
                  Net Amt
                </th>
                <th style={{ padding: '8px 12px', width: '80px', textAlign: 'center', fontWeight: 700, color: colors.textMuted }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {billDetails
                .filter((r) => r.Status !== 2 && (Number(r.ServiceId) > 0 || !isBillGenerated))
                .map((row, idx) => {
                  const grossAmt = (parseFloat(row.Quantity as any) || 1) * (parseFloat(row.Rate as any) || 0);
                  const rowDiscVal = parseFloat(row.DiscountAmount as any) || 0;
                  const rowDiscMode = (row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2);
                  const clampedRowDisc = rowDiscMode === 2
                    ? Math.min(Math.max(0, rowDiscVal), 100)
                    : Math.min(Math.max(0, rowDiscVal), grossAmt);
                  const rowDiscAmt = rowDiscMode === 2 ? (clampedRowDisc / 100) * grossAmt : clampedRowDisc;
                  const netAmt = Math.max(0, grossAmt - rowDiscAmt);

                  return (
                    <tr
                      key={idx}
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
                        <div className="service-search-container" style={{ position: 'relative' }}>
                          <input
                            type="text"
                            id={`txtServiceItem_${idx}`}
                            disabled={isBillGenerated}
                            value={row.ServiceName || ''}
                            placeholder={isBillGenerated ? '' : 'Type service name, code, or % to search...'}
                            onFocus={() => {
                              if (!isBillGenerated) {
                                setActiveSearchIndex(idx);
                                setServiceSearchTerm(row.ServiceName || '');
                              }
                            }}
                            onClick={() => {
                              if (!isBillGenerated) {
                                setActiveSearchIndex(idx);
                                setServiceSearchTerm(row.ServiceName || '');
                              }
                            }}
                            onChange={(e) => {
                              if (isBillGenerated) return;
                              setActiveSearchIndex(idx);
                              setServiceSearchTerm(e.target.value);
                              setBillDetails((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], ServiceName: e.target.value };
                                return next;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (activeSearchIndex === idx && serviceSearchResults.length > 0) {
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
                                    handleServiceSelect(idx, selected);
                                  }
                                } else if (e.key === 'Escape') {
                                  setActiveSearchIndex(null);
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              height: 32,
                              padding: '0 8px',
                              borderRadius: radii.sm,
                              border: `1px solid ${activeSearchIndex === idx ? colors.primary : colors.border}`,
                              fontSize: '12px',
                              color: isBillGenerated ? colors.textMuted : colors.textMain,
                              backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                              boxSizing: 'border-box',
                              outline: 'none',
                            }}
                          />

                          {/* Autocomplete Suggestions Menu */}
                          {activeSearchIndex === idx && !isBillGenerated && (
                            <div
                              ref={serviceDropdownRef}
                              style={{
                                position: 'absolute',
                                top: '36px',
                                left: 0,
                                minWidth: 'max(100%, 420px)',
                                backgroundColor: colors.surface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: radii.md,
                                boxShadow: shadows.xl,
                                maxHeight: 260,
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
                                    ? 'Searching services...'
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
                                    Type <strong>%</strong> to browse all available services.
                                  </div>
                                </div>
                              )}
                              {!isSearchingService &&
                                serviceSearchResults.map((item, srvIdx) => (
                                  <div
                                    key={item.Id ? `${item.Id}-${srvIdx}` : srvIdx}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleServiceSelect(idx, item);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleServiceSelect(idx, item);
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: `1px solid ${colors.surfaceSunken}`,
                                      fontSize: '12px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      backgroundColor: highlightedServiceIdx === srvIdx ? '#f1f5f9' : 'transparent',
                                    }}
                                    onMouseEnter={() => setHighlightedServiceIdx(srvIdx)}
                                  >
                                    <div>
                                      <strong style={{ color: colors.textMain }}>{item.Text || item.Name || item.ServiceName}</strong>
                                      {(item.Code || item.ItemCode) && (
                                        <span style={{ fontSize: '10.5px', color: colors.textMuted, marginLeft: 6 }}>
                                          ({item.Code || item.ItemCode})
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#059669' }}>
                                      {fmtCur(item.Rate || item.UnitPrice || 0)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Qty Input */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.Quantity || 1}
                          disabled={isBillGenerated || Number(row.ServiceId) <= 0}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          style={{
                            width: '100%',
                            height: 32,
                            padding: '0 8px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border}`,
                            fontSize: '12px',
                            textAlign: 'center',
                            backgroundColor: isBillGenerated || Number(row.ServiceId) <= 0 ? colors.surfaceSunken : colors.surface,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>

                      {/* Base Rate */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          value={row.Rate || 0}
                          disabled={isBillGenerated || Number(row.ServiceId) <= 0}
                          onChange={(e) => handleRateChange(idx, e.target.value)}
                          style={{
                            width: '100%',
                            height: 32,
                            padding: '0 8px',
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border}`,
                            fontSize: '12px',
                            backgroundColor: isBillGenerated || Number(row.ServiceId) <= 0 ? colors.surfaceSunken : colors.surface,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>

                      {/* Gross Amt */}
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: colors.textMain }}>
                        {fmtCur(grossAmt)}
                      </td>

                      {/* Line Discount with per-service DiscountToggle matching OP Billing */}
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <DiscountToggle
                            mode={(row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2)}
                            disabled={isBillGenerated || Number(row.ServiceId) <= 0}
                            onChange={(newMode) => handleRowDiscountModeChange(idx, newMode)}
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.DiscountAmount !== undefined && row.DiscountAmount !== null ? row.DiscountAmount : 0}
                            disabled={isBillGenerated || Number(row.ServiceId) <= 0}
                            onChange={(e) => handleDiscountChange(idx, e.target.value)}
                            style={{
                              width: 64,
                              height: 30,
                              textAlign: 'right',
                              borderRadius: radii.sm,
                              border: discountValidation.invalidRowIndices.includes(idx) ? '1.5px solid #dc2626' : `1px solid ${colors.border}`,
                              padding: '0 4px',
                              fontSize: '12px',
                              color: discountValidation.invalidRowIndices.includes(idx) ? '#dc2626' : (isBillGenerated ? colors.textMuted : '#b91c1c'),
                              fontWeight: 600,
                              boxSizing: 'border-box',
                              backgroundColor: discountValidation.invalidRowIndices.includes(idx) ? '#fef2f2' : (isBillGenerated || Number(row.ServiceId) <= 0 ? colors.surfaceSunken : colors.surface),
                              cursor: (isBillGenerated || Number(row.ServiceId) <= 0) ? 'not-allowed' : 'text',
                              outline: 'none',
                            }}
                            title={discountValidation.invalidRowIndices.includes(idx) ? ((((row.DiscountModeId && row.DiscountModeId > 0) ? row.DiscountModeId : (headerDiscountModeId > 0 ? headerDiscountModeId : 2))) === 1 ? 'Discount exceeds item amount' : 'Discount cannot exceed 100%') : ''}
                          />
                        </div>
                      </td>

                      {/* Net Amt */}
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: colors.primary }}>
                        {fmtCur(netAmt)}
                      </td>

                      {/* Actions: Locked icon if generated, Delete trash button if draft */}
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {isBillGenerated ? (
                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <i className="fas fa-lock" /> Locked
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            title="Delete Row"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '13px',
                              padding: '4px',
                            }}
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {billDetails.filter((r) => r.Status !== 2 && (Number(r.ServiceId) > 0 || !isBillGenerated)).length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: colors.textMuted }}>
                    No service items recorded. Use the row above to search and add services.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sub-bar below table matching OP Bill */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: colors.textMuted }}>Pending Bills ( 0 )</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>
              Overall Due: <strong style={{ color: totals.balance > 0 ? '#dc2626' : '#059669' }}>{fmtCur(totals.balance)}</strong>
            </span>
            <span>
              Account Balance: <strong style={{ color: colors.primary }}>{fmtCur(0)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM 3-PANEL FOOTER LAYOUT (IDENTICAL TO OP BILLING)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {/* Panel 1: Bill Discount & Approvals */}
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
                    mode={headerDiscountModeId}
                    disabled={isBillGenerated}
                    onChange={handleDiscountModeChange}
                  />
                </div>
                <input
                  id="txtDirectBillDiscount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={headerDiscount !== undefined && headerDiscount !== null ? headerDiscount : ''}
                  placeholder="0.00"
                  disabled={isBillGenerated}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0);
                    setHeaderDiscount(val);
                    dispatchAction('headerDiscountChange', { value: val, discountModeId: headerDiscountModeId });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: discountValidation.isBillDiscountInvalid ? '1.5px solid #dc2626' : `1px solid ${colors.border}`,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: discountValidation.isBillDiscountInvalid ? '#dc2626' : colors.textMain,
                    backgroundColor: discountValidation.isBillDiscountInvalid ? '#fef2f2' : (isBillGenerated ? colors.surfaceSunken : colors.surface),
                    boxSizing: 'border-box',
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
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  Discount Approver {totals.totalDiscount > 0 && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <select
                  value={discountApprovedBy}
                  disabled={isBillGenerated}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDiscountApprovedBy(val);
                    dispatchAction('discountApproverChange', { id: val });
                    dispatchAction('fieldChange', { DiscountApprovedBy: val });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: totals.totalDiscount > 0 && (!discountApprovedBy || discountApprovedBy <= 0)
                      ? '1.5px solid #f59e0b'
                      : `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    color: colors.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="0">-- Select Approver --</option>
                  {discountApproverLookup.map((da) => (
                    <option key={da.Id} value={da.Id}>
                      {da.Text}
                    </option>
                  ))}
                </select>
                {totals.totalDiscount > 0 && (!discountApprovedBy || discountApprovedBy <= 0) && (
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 500, marginTop: 4 }}>
                    Approver required for discount
                  </div>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                Remarks / Notes
              </label>
              <textarea
                value={comments}
                disabled={isBillGenerated}
                placeholder="Enter Remarks / Notes"
                rows={2}
                onChange={(e) => {
                  setComments(e.target.value);
                  dispatchAction('fieldChange', { Comments: e.target.value });
                }}
                style={{
                  width: '100%',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: colors.textMain,
                  backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Panel 2: Payment Settlements */}
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
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-credit-card" /> Payment Settlements
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: colors.primary }}>
                {isBillGenerated ? `Due Balance: ${fmtCur(billOutstandingDue)}` : `Net Payable: ${fmtCur(totals.net)}`}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm, marginBottom: spacing.sm }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  Payment Mode
                </label>
                <select
                  value={paymentTypeId}
                  disabled={isSettlementLocked}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPaymentTypeId(val);
                    dispatchAction('paymentTypeChange', { id: val });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    color: colors.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {paymentTypeLookup.map((pt) => (
                    <option key={pt.Id} value={pt.Id}>
                      {pt.Text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  Receipt Amount
                </label>
                <input
                  id="txtDirectReceiptAmt"
                  type="number"
                  step="0.01"
                  value={receiptAmt !== undefined && receiptAmt !== null ? receiptAmt : ''}
                  disabled={isSettlementLocked}
                  placeholder="Receipt Amount"
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    if (rawVal === '') {
                      userEditedReceiptRef.current = false;
                      setReceiptAmt(0);
                      dispatchAction('receiptAmtChange', { value: 0 });
                      return;
                    }
                    userEditedReceiptRef.current = true;
                    const val = parseFloat(rawVal) || 0;
                    const maxVal = isBillGenerated ? billOutstandingDue : totals.net;
                    const clampedVal = Math.min(val, maxVal);
                    setReceiptAmt(clampedVal);
                    dispatchAction('receiptAmtChange', { value: clampedVal });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain,
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Dynamic payment details (UPI / Cheque / Card) */}
            {(paymentTypeId === 11 || paymentTypeId === 12) && (
              <div style={{ marginBottom: spacing.sm }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  UPI Ref Number
                </label>
                <input
                  type="text"
                  value={upiRefNumber}
                  disabled={isSettlementLocked}
                  placeholder="Enter UPI Ref #"
                  onChange={(e) => {
                    setUpiRefNumber(e.target.value);
                    dispatchAction('fieldChange', { UPIRefNumber: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {(paymentTypeId === 5 || paymentTypeId === 6) && (
              <div style={{ marginBottom: spacing.sm }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  Card # (Last 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardNumber}
                  disabled={isSettlementLocked}
                  placeholder="XXXX"
                  onChange={(e) => {
                    setCardNumber(e.target.value);
                    dispatchAction('fieldChange', { CardNumber: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {paymentTypeId === 2 && (
              <div style={{ marginBottom: spacing.sm }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
                  Cheque Number
                </label>
                <input
                  type="text"
                  value={chequeNo}
                  disabled={isSettlementLocked}
                  placeholder="Cheque #"
                  onChange={(e) => {
                    setChequeNo(e.target.value);
                    dispatchAction('fieldChange', { ChequeNo: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    height: 36,
                    padding: '0 10px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Multiple Pay checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input
                type="checkbox"
                id="chkMultiplePay"
                checked={isMultiplePayment}
                disabled={isSettlementLocked}
                onChange={(e) => {
                  setIsMultiplePayment(e.target.checked);
                  dispatchAction('fieldChange', { IsMultiplePayment: e.target.checked });
                }}
              />
              <label htmlFor="chkMultiplePay" style={{ fontSize: '12px', fontWeight: 600, color: colors.textMain, cursor: 'pointer' }}>
                Multiple Pay
              </label>
            </div>

            {/* Due Approval / Credit Authorization Section */}
            <div
              style={{
                marginTop: spacing.sm,
                padding: '10px',
                borderRadius: radii.md,
                backgroundColor: totals.balance > 0 ? '#fffbeb' : colors.surfaceSunken,
                border: `1px solid ${totals.balance > 0 ? '#fde68a' : colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textMain, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="fas fa-file-invoice-dollar" style={{ color: totals.balance > 0 ? '#d97706' : colors.primary }} />
                  Due Approval
                </span>
                {totals.balance > 0 ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: privateDueApproverId ? '#dcfce7' : '#fee2e2',
                      color: privateDueApproverId ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {privateDueApproverId ? '✓ Authorized' : '! Due Approval Required'}
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

              {totals.balance > 0 && !privateDueApproverId && (
                <div style={{ fontSize: '11px', color: '#b45309', marginBottom: 6, lineHeight: 1.3 }}>
                  Remaining due of <strong>{fmtCur(totals.balance)}</strong> requires an authorized Due Approver.
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: 2 }}>
                  Credit / Due Approver
                </label>
                <select
                  value={privateDueApproverId}
                  disabled={isBillGenerated}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : '';
                    setPrivateDueApproverId(val);
                    dispatchAction('fieldChange', { PrivateDueId: val || undefined, GuarantorDueId: val || undefined });
                  }}
                  style={{
                    width: '100%',
                    height: 32,
                    borderRadius: radii.sm,
                    border: `1px solid ${totals.balance > 0 && !privateDueApproverId ? '#f59e0b' : colors.border}`,
                    padding: '0 8px',
                    fontSize: '12px',
                    backgroundColor: isBillGenerated ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                  }}
                >
                  <option value="">-- Select Credit / Due Approver --</option>
                  {(privateDueApproverLookup || []).map((p) => (
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
        </div>

        {/* Panel 3: Bill Summary & Balance */}
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
              <i className="fas fa-receipt" /> Bill Summary &amp; Balance
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted }}>
                <span>Gross Amount</span>
                <strong style={{ color: colors.textMain }}>{fmtCur(totals.gross)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted }}>
                <span>Discount</span>
                <strong style={{ color: '#ef4444' }}>{fmtCur(totals.totalDiscount)}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '6px 0',
                  borderTop: `1px dashed ${colors.border}`,
                  borderBottom: `1px dashed ${colors.border}`,
                  margin: '4px 0',
                }}
              >
                <span style={{ color: colors.textMain }}>Net Amount</span>
                <span style={{ color: colors.primary }}>{fmtCur(totals.net)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted }}>
                <span>{isBillGenerated ? 'Previously Paid' : 'Paid Amount'}</span>
                <strong style={{ color: '#059669' }}>{fmtCur(isBillGenerated ? prevPaidAmt : (receiptAmt || 0))}</strong>
              </div>

              {isBillGenerated && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted }}>
                  <span>Current Collection</span>
                  <strong style={{ color: '#059669' }}>{fmtCur(receiptAmt || 0)}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textMuted }}>
                <span>Refund</span>
                <strong style={{ color: colors.textMuted }}>{fmtCur(0)}</strong>
              </div>

              {/* Tender Amt & Return Amt for Cash counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: colors.textMuted }}>
                <span>Tender Amt</span>
                <input
                  type="number"
                  step="0.01"
                  value={tenderAmt || ''}
                  disabled={isSettlementLocked}
                  placeholder="0.00"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setTenderAmt(val);
                    dispatchAction('tenderAmtChange', { value: val });
                  }}
                  style={{
                    width: 90,
                    height: 28,
                    textAlign: 'right',
                    padding: '0 6px',
                    borderRadius: radii.sm,
                    border: `1px solid ${colors.border}`,
                    fontSize: '12px',
                    backgroundColor: isSettlementLocked ? colors.surfaceSunken : colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  backgroundColor: totals.balance > 0 ? '#fef2f2' : '#f0fdf4',
                  borderRadius: radii.sm,
                  color: totals.balance > 0 ? '#dc2626' : '#15803d',
                }}
              >
                <span>Return / Due Amt</span>
                <span>{totals.balance > 0 ? fmtCur(totals.balance) : fmtCur(totals.returnAmt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. PAYMENT RECEIPTS & REFUND HISTORY (MATCHING OP BILLING)
      ───────────────────────────────────────────────────────────── */}
      {(paymentInfoDetails.length > 0 || refundInfoDetails.length > 0) && (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.sm,
            padding: spacing.md,
            marginTop: spacing.md,
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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-file-invoice" /> Payment Receipts &amp; Refund History
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {paymentInfoDetails.map((pay: any, idx: number) => {
              const rNumber = pay.ReceiptNumber || pay.ReceiptNr || (pay.Id ? `REC-${pay.Id}` : 'REC');
              const rType = (typeof pay.ReceiptType === 'object' && pay.ReceiptType?.Description)
                ? pay.ReceiptType.Description
                : (pay.ReceiptType || 'Receipt');
              const rDate = pay.ReceiptDateTime || pay.CollectedOn || pay.CreatedAt;
              const rAmt = parseFloat(pay.AmountPaid) || 0;
              const rInfo = pay.PaymentInfo || 'Settled';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px 14px',
                    borderRadius: radii.md,
                    backgroundColor: colors.surfaceMuted || '#f8fafc',
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <strong>{rType}</strong> • #{rNumber} • {fmtDisplayDate(rDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#15803d', fontSize: '13px' }}>{fmtCur(rAmt)}</span>
                    <span style={{ color: colors.textMuted }}>({rInfo})</span>
                  </div>
                </div>
              );
            })}

            {refundInfoDetails.map((ref: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '8px 14px',
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
          5. INLINE ACTION BAR (MATCHING OP BILLING FORMAT)
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
            onClick={() => {
              if (props.onAction) {
                dispatchAction('backtoList');
              } else if (window.history && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.hash = '#/app/directbilling/0/DG';
              }
            }}
          >
            Back
          </Button>

          {billNumber && !isBillGenerated && (
            <Button
              variant="danger"
              icon="fa-trash-alt"
              title="Delete complete bill"
              disabled={isSaving}
              onClick={() => dispatchAction('deleteBill')}
            >
              Delete Bill
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          {/* Standard Bill Print (Enabled only once bill is generated) */}
          <Button
            variant="info"
            icon="fa-print"
            title={
              !isBillGenerated && !billNumber
                ? 'Print is enabled only after bill is generated'
                : 'Print Full Bill (Alt+P)'
            }
            disabled={!isBillGenerated && !billNumber}
            onClick={() => dispatchAction('print')}
          >
            Print (Alt+P)
          </Button>

          {/* Unapproved Draft Bills: Show Save Draft and Save & Collect */}
          {!isBillGenerated && (
            <>
              <Button
                variant="warning"
                icon="fa-save"
                title={
                  !discountValidation.isValid
                    ? `Cannot save: ${discountValidation.errorMessage}`
                    : !canSave
                    ? 'Please enter patient name and at least one service'
                    : 'Save as Draft (Alt+S)'
                }
                disabled={isBillGenerated || isSaving || !canSave}
                onClick={() => handleSave(false)}
              >
                Save Draft (Alt+S)
              </Button>

              <Button
                variant="success"
                icon="fa-check-circle"
                title={
                  !discountValidation.isValid
                    ? `Cannot save: ${discountValidation.errorMessage}`
                    : !canSave
                    ? 'Please enter patient name and at least one service'
                    : 'Save Bill & Collect Payment (Alt+A)'
                }
                disabled={isBillGenerated || isSaving || !canSave}
                onClick={() => handleSave(true)}
              >
                Save &amp; Collect (Alt+A)
              </Button>
            </>
          )}

          {/* Approved bill with remaining balance: Support collecting balance */}
          {isBillGenerated && billOutstandingDue > 0 && !isFullyPaid && (
            <Button
              variant="success"
              icon="fa-money-bill-wave"
              title="Collect remaining due balance"
              onClick={() => {
                const amountToCollect = receiptAmt > 0 ? receiptAmt : billOutstandingDue;
                dispatchAction('collectDue', {
                  amount: amountToCollect,
                  paymentTypeId,
                  upiRefNumber,
                  cardNumber,
                  chequeNo,
                  bankId,
                });
              }}
            >
              Collect Due ({fmtCur(receiptAmt > 0 ? receiptAmt : billOutstandingDue)})
            </Button>
          )}

          {/* Fully paid indicator */}
          {isBillGenerated && (billOutstandingDue <= 0 || isFullyPaid) && (
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
      {showFindBill && (
        <Modal
          title="Previous Bills"
          isOpen={showFindBill}
          onClose={() => setShowFindBill(false)}
          width="1100px"
          portal
        >
          <FindBillModalComponent
            reactProps={{
              context: 'DG',
              modalParams: {
                id: rawCurrentfilter?.PatientId || -1,
                context: 'DG',
              },
              facilityId: rawItem?.FacilityId || 1,
            }}
            onSelect={(data: any) => {
              setShowFindBill(false);
              dispatchAction('findBillSelect', data);
            }}
            onClose={() => setShowFindBill(false)}
          />
        </Modal>
      )}
    </div>
  );
};
