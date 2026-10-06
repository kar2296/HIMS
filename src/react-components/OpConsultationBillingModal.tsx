import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { apiFetch } from './utils/api';

export interface BillingServiceRow {
  ServiceId?: number;
  ServiceCode?: string;
  ServiceName?: string;
  Quantity: number;
  Rate: number;
  Amount: number;
  DiscountAmount: number;
  GSTAmount: number;
  NetAmount: number;
  ExecDoctorId?: number;
  SelectedItem?: any;
  PatientBillStatusId?: number;
  [key: string]: any;
}

export interface ServiceCatalogItem {
  ServiceItemId: number;
  ItemCode: string;
  Name: string;
  Rate: number;
  DepartmentId?: number;
  [key: string]: any;
}

const COMMON_SERVICES: ServiceCatalogItem[] = [];

export interface OpConsultationBillingModalProps {
  reactProps?: {
    item?: any;
    currentcontext?: any;
    currentfilter?: any;
    selectedPatient?: any;
    PatientBillDetails?: BillingServiceRow[];
    lookup?: {
      ServiceRateCategory?: Array<{ Id: number; Text: string }>;
      GuarantorType?: Array<{ Id: number; Text: string }>;
      DiscountMode?: Array<{ Id: number; Text: string }>;
      PatientType?: Array<{ Id: number; Text: string }>;
      Guarantor?: Array<{ Id: number; Text: string }>;
      PaymentType?: Array<{ Id: number; Text: string }>;
      Doctor?: Array<{ Id: number; Text: string }>;
      DiscountApprover?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    PaymentInfoDetails?: any[];
    canShowSaveBtn?: boolean;
    canShowSaveapproveBtn?: boolean;
    isModal?: boolean;
    [key: string]: any;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OpConsultationBillingModal: React.FC<OpConsultationBillingModalProps> = ({
  reactProps,
  onAction
}) => {
  const isModal = reactProps?.isModal !== false;

  // Header & Filter State
  const [rateCategoryId, setRateCategoryId] = useState<number>(
    reactProps?.currentfilter?.ServiceRateCategoryId || 1
  );

  const defaultDoctorId = reactProps?.currentcontext?.did || reactProps?.item?.DoctorId || 6;

  // Patient / Payer Details State
  const selectedPatient = reactProps?.selectedPatient || {};
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>(() => {
    if (selectedPatient.FirstName) {
      return `${selectedPatient.Title?.Description ? selectedPatient.Title.Description + ' ' : ''}${selectedPatient.FirstName} ${selectedPatient.LastName || ''}`.trim();
    }
    return reactProps?.item?.PatientName || 'TEST ONE';
  });

  const [doctorName, setDoctorName] = useState<string>(
    reactProps?.currentcontext?.DoctorName || reactProps?.item?.DoctorName || 'Dr. SUNIL CHOUDHARY'
  );
  const [guarantorTypeId, setGuarantorTypeId] = useState<number>(
    reactProps?.currentfilter?.GuarantorTypeId || 1 // SELF
  );
  const [discountModeId, setDiscountModeId] = useState<number>(
    reactProps?.currentfilter?.DiscountModeId || 1 // %
  );
  const [patientTypeId, setPatientTypeId] = useState<number>(
    reactProps?.item?.PatientTypeId || 1 // OPD
  );
  const [guarantorId, setGuarantorId] = useState<number>(
    reactProps?.currentfilter?.GuarantorId || 1 // CASH
  );
  const [discountCategoryId, setDiscountCategoryId] = useState<number>(
    reactProps?.currentfilter?.GuarantorTypeId || 1
  );

  // Sync patient and filter states from props
  useEffect(() => {
    if (reactProps?.selectedPatient?.FirstName) {
      setPatientSearchQuery(
        `${reactProps.selectedPatient.Title?.Description ? reactProps.selectedPatient.Title.Description + ' ' : ''}${reactProps.selectedPatient.FirstName} ${reactProps.selectedPatient.LastName || ''}`.trim()
      );
    } else if (reactProps?.item?.PatientName) {
      setPatientSearchQuery(reactProps.item.PatientName);
    }
  }, [reactProps?.selectedPatient, reactProps?.item?.PatientName]);

  useEffect(() => {
    if (reactProps?.currentcontext?.DoctorName) {
      setDoctorName(reactProps.currentcontext.DoctorName);
    } else if (reactProps?.item?.DoctorName) {
      setDoctorName(reactProps.item.DoctorName);
    }
  }, [reactProps?.currentcontext?.DoctorName, reactProps?.item?.DoctorName]);

  useEffect(() => {
    if (reactProps?.currentfilter?.GuarantorTypeId) {
      setGuarantorTypeId(reactProps.currentfilter.GuarantorTypeId);
      setDiscountCategoryId(reactProps.currentfilter.GuarantorTypeId);
    }
  }, [reactProps?.currentfilter?.GuarantorTypeId]);

  useEffect(() => {
    if (reactProps?.currentfilter?.GuarantorId) {
      setGuarantorId(reactProps.currentfilter.GuarantorId);
    }
  }, [reactProps?.currentfilter?.GuarantorId]);

  useEffect(() => {
    if (reactProps?.currentfilter?.ServiceRateCategoryId) {
      setRateCategoryId(reactProps.currentfilter.ServiceRateCategoryId);
    }
  }, [reactProps?.currentfilter?.ServiceRateCategoryId]);

  useEffect(() => {
    if (reactProps?.item?.PatientTypeId) {
      setPatientTypeId(reactProps.item.PatientTypeId);
    }
  }, [reactProps?.item?.PatientTypeId]);

  // Default initial service row (empty by default)
  const defaultInitialRow: BillingServiceRow = useMemo(() => ({
    ServiceId: 0,
    ServiceCode: '',
    ServiceName: '',
    Quantity: 1,
    Rate: 0,
    Amount: 0,
    DiscountAmount: 0,
    GSTAmount: 0,
    NetAmount: 0,
    ExecDoctorId: defaultDoctorId
  }), [defaultDoctorId]);

  // Services Table State
  const [serviceRows, setServiceRows] = useState<BillingServiceRow[]>(() => {
    if (reactProps?.PatientBillDetails && reactProps.PatientBillDetails.length > 0) {
      const validRows = reactProps.PatientBillDetails.filter(
        r => (r.ServiceName && r.ServiceName.trim().length > 0) || (r.ServiceId && r.ServiceId > 0 && r.ServiceId !== -1)
      );
      if (validRows.length > 0) {
        return validRows.map(r => ({
          ...r,
          Quantity: Number(r.Quantity) || 1,
          Rate: Number(r.Rate) || 0,
          Amount: Number(r.Amount) || 0,
          NetAmount: Number(r.NetAmount) || 0,
          ExecDoctorId: r.ExecDoctorId || defaultDoctorId
        }));
      }
    }
    return [{ ...defaultInitialRow }];
  });

  // Sync rows from props
  useEffect(() => {
    if (reactProps?.PatientBillDetails && reactProps.PatientBillDetails.length > 0) {
      const validRows = reactProps.PatientBillDetails.filter(
        r => (r.ServiceName && r.ServiceName.trim().length > 0) || (r.ServiceId && r.ServiceId > 0 && r.ServiceId !== -1)
      );
      if (validRows.length > 0) {
        const mapped: BillingServiceRow[] = validRows.map(r => {
          const sName = r.SelectedItem?.ServiceName || r.SelectedItem?.Name || r.ServiceName || r.ItemDescription || r.ServiceItem?.ServiceName || '';
          const sCode = r.SelectedItem?.ItemCode || r.ServiceCode || '';
          const qty = Number(r.Quantity) || 1;
          const rate = Number(r.Rate) || (r.Amount ? Number(r.Amount) / qty : 0);
          const amount = Number(r.Amount) || (qty * rate);
          const disc = Number(r.DiscountAmount) || 0;
          const tax = Number(r.GSTAmount) || 0;
          const net = Number(r.NetAmount) || (amount - disc + tax);
          return {
            ...r,
            ServiceId: r.ServiceId || r.SelectedItem?.ServiceItemId || r.SelectedItem?.Id || 0,
            ServiceName: sName,
            ServiceCode: sCode,
            Quantity: qty,
            Rate: rate,
            Amount: amount,
            DiscountAmount: disc,
            GSTAmount: tax,
            NetAmount: net,
            ExecDoctorId: r.ExecDoctorId || defaultDoctorId
          };
        });

        // Always keep a blank row at the end so the user can easily enter the next service
        const lastRow = mapped[mapped.length - 1];
        if (lastRow && (lastRow.ServiceName || (lastRow.ServiceId && lastRow.ServiceId > 0))) {
          mapped.push({ ...defaultInitialRow });
        }

        setServiceRows(mapped);
      } else {
        // If all rows in PatientBillDetails are empty/unselected, ensure we show one clean empty row
        setServiceRows(prev => {
          if (prev.length === 0 || (prev.length === 1 && !prev[0].ServiceName)) {
            return prev.length === 1 ? prev : [{ ...defaultInitialRow }];
          }
          return prev;
        });
      }
    }
  }, [reactProps?.PatientBillDetails, defaultDoctorId, defaultInitialRow]);

  // Autocomplete Dropdown & Service Master State
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [serviceMasterList, setServiceMasterList] = useState<ServiceCatalogItem[]>([]);
  const [searchResults, setSearchResults] = useState<ServiceCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Auto-scroll highlighted dropdown item into view
  useEffect(() => {
    if (activeDropdownIndex !== null && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest'
      });
    }
  }, [highlightedIndex, activeDropdownIndex]);

  // Reset highlight index when search results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchResults, activeDropdownIndex]);

  // Helper to extract tariff rate based on selected rateCategoryId
  const getTariffRate = useCallback((item: any, catId: number): number => {
    if (item?.ServiceItemTariffDetails && Array.isArray(item.ServiceItemTariffDetails) && item.ServiceItemTariffDetails.length > 0) {
      const match = item.ServiceItemTariffDetails.find(
        (t: any) => Number(t.ServiceRateCategoryId) === Number(catId)
      ) || item.ServiceItemTariffDetails[0];
      if (match && match.Rate !== undefined && match.Rate !== null) {
        return Number(match.Rate);
      }
    }
    if (item?.Rate !== undefined && item?.Rate !== null) return Number(item.Rate);
    if (item?.ServiceItemRate !== undefined && item?.ServiceItemRate !== null) return Number(item.ServiceItemRate);
    return 0;
  }, []);

  // Fetch items from Service Master API
  const fetchServiceMaster = useCallback(async (query?: string) => {
    try {
      setIsSearching(true);
      const facilityId = reactProps?.currentcontext?.FacilityId || 1;
      const params: Array<{ Key: number; Value: any }> = [
        { Key: 4, Value: 2 }, // Active status = Active
        { Key: 8, Value: facilityId } // Facility
      ];
      if (query && query.trim().length > 0) {
        params.push({ Key: 1, Value: query.trim() });
      }
      const res = await apiFetch<any>('ClinicalMaster/ServiceItem/GetServiceItems', {
        Params: params,
        PageContext: { PageSize: 100, PageNumber: 1 }
      });

      if (res?.Data && Array.isArray(res.Data)) {
        const mapped: ServiceCatalogItem[] = res.Data.map((item: any) => ({
          ServiceItemId: item.ServiceItemId || item.Id,
          ItemCode: item.ItemCode || item.ServiceCode || '',
          Name: item.Name || item.ServiceName || '',
          Rate: getTariffRate(item, rateCategoryId),
          DepartmentId: item.DepartmentId,
          DepartmentName: item.Department?.DepartmentName,
          ServiceItemTariffDetails: item.ServiceItemTariffDetails,
          rawItem: item
        }));

        if (!query) {
          setServiceMasterList(mapped);
        }
        setSearchResults(mapped);
      }
    } catch (err) {
      console.warn('Failed to load Service Master items:', err);
    } finally {
      setIsSearching(false);
    }
  }, [rateCategoryId, reactProps?.currentcontext?.FacilityId, getTariffRate]);

  // Initial load of Service Master catalog
  useEffect(() => {
    fetchServiceMaster();
  }, [fetchServiceMaster]);

  // Update rates when rate category changes
  useEffect(() => {
    setSearchResults(prev => prev.map(item => ({
      ...item,
      Rate: getTariffRate(item.rawItem || item, rateCategoryId)
    })));
    setServiceMasterList(prev => prev.map(item => ({
      ...item,
      Rate: getTariffRate(item.rawItem || item, rateCategoryId)
    })));
  }, [rateCategoryId, getTariffRate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter or search services dynamically from Service Master
  const searchServices = useCallback((query: string) => {
    const q = query.trim().toLowerCase();
    setDropdownSearch(query);

    if (!q) {
      if (serviceMasterList.length > 0) {
        setSearchResults(serviceMasterList);
      } else {
        fetchServiceMaster();
      }
      return;
    }

    // Instant local filter against loaded Service Master items
    const localMatches = serviceMasterList.filter(
      s => s.Name.toLowerCase().includes(q) || s.ItemCode.toLowerCase().includes(q)
    );
    setSearchResults(localMatches);

    // Query backend Service Master for broader match if query has 2+ characters
    if (q.length >= 2) {
      fetchServiceMaster(q);
    }
  }, [serviceMasterList, fetchServiceMaster]);

  const handleServiceSelect = (index: number, service: ServiceCatalogItem) => {
    const updated = [...serviceRows];
    const currentRow = updated[index] || { ...defaultInitialRow };
    const qty = currentRow.Quantity || 1;
    const rate = getTariffRate(service.rawItem || service, rateCategoryId);
    const amount = qty * rate;
    const disc = Number(currentRow.DiscountAmount) || 0;
    const tax = Number(currentRow.GSTAmount) || 0;
    const net = amount - disc + tax;

    const updatedRow: BillingServiceRow = {
      ...currentRow,
      ServiceId: service.ServiceItemId,
      ServiceCode: service.ItemCode,
      ServiceName: service.Name,
      Rate: rate,
      Amount: amount,
      NetAmount: net,
      ExecDoctorId: currentRow.ExecDoctorId && currentRow.ExecDoctorId > 0 ? currentRow.ExecDoctorId : defaultDoctorId,
      SelectedItem: service.rawItem || service
    };

    updated[index] = updatedRow;

    // Automatically append a blank row at the end so the user can easily add another service
    if (index === updated.length - 1) {
      updated.push({
        ServiceId: 0,
        ServiceCode: '',
        ServiceName: '',
        Quantity: 1,
        Rate: 0,
        Amount: 0,
        DiscountAmount: 0,
        GSTAmount: 0,
        NetAmount: 0,
        ExecDoctorId: defaultDoctorId
      });
    }

    setServiceRows(updated);
    setActiveDropdownIndex(null);

    if (onAction) {
      onAction('selectService', { index, service: service.rawItem || service, rate });
    }
  };

  // Payment & Discount State
  const [isMultiplePayment, setIsMultiplePayment] = useState<boolean>(
    Boolean(reactProps?.item?.IsMultiplePayment)
  );
  const [headerDiscount, setHeaderDiscount] = useState<number>(
    reactProps?.currentcontext?.BillDiscount || 0
  );
  const [remarks, setRemarks] = useState<string>(
    reactProps?.item?.Comments || ''
  );
  const [paymentTypeId, setPaymentTypeId] = useState<number>(
    reactProps?.currentcontext?.PaymentTypeId || 1 // Cash
  );
  const [receiptAmount, setReceiptAmount] = useState<string>(
    reactProps?.item?.Received !== undefined && reactProps.item.Received !== null
      ? String(reactProps.item.Received)
      : (reactProps?.currentcontext?.ReceiptAmt !== undefined && reactProps.currentcontext.ReceiptAmt !== null
        ? String(reactProps.currentcontext.ReceiptAmt)
        : '')
  );
  const [tenderAmount, setTenderAmount] = useState<string>(
    reactProps?.currentcontext?.TenderAmount !== undefined ? String(reactProps.currentcontext.TenderAmount) : '0'
  );

  // Sync receiptAmount if updated from parent
  useEffect(() => {
    if (reactProps?.currentcontext?.ReceiptAmt !== undefined && reactProps.currentcontext.ReceiptAmt !== null && reactProps.currentcontext.ReceiptAmt > 0) {
      setReceiptAmount(String(reactProps.currentcontext.ReceiptAmt));
    }
  }, [reactProps?.currentcontext?.ReceiptAmt]);

  // Lookups with fallbacks
  const rateCategoryOptions = reactProps?.lookup?.ServiceRateCategory || [
    { Id: 1, Text: 'OPD' },
    { Id: 2, Text: 'Special' },
    { Id: 3, Text: 'General' }
  ];

  const guarantorTypeOptions = reactProps?.lookup?.GuarantorType || [
    { Id: 1, Text: 'SELF' },
    { Id: 2, Text: 'INSURANCE' },
    { Id: 3, Text: 'CORPORATE' }
  ];

  const discountModeOptions = reactProps?.lookup?.DiscountMode || [
    { Id: 1, Text: '%' },
    { Id: 2, Text: 'Fixed' }
  ];

  const patientTypeOptions = reactProps?.lookup?.PatientType || [
    { Id: 1, Text: 'OPD' },
    { Id: 2, Text: 'IPD' },
    { Id: 3, Text: 'DayCare' }
  ];

  const guarantorOptions = reactProps?.lookup?.Guarantor || [
    { Id: 1, Text: 'CASH' },
    { Id: 2, Text: 'Star Health' },
    { Id: 3, Text: 'HDFC Ergo' }
  ];

  const paymentTypeOptions = reactProps?.lookup?.PaymentType || [
    { Id: 1, Text: 'Cash' },
    { Id: 2, Text: 'Credit Card' },
    { Id: 3, Text: 'Debit Card' },
    { Id: 4, Text: 'UPI / QR' },
    { Id: 5, Text: 'Cheque' }
  ];

  const doctorOptions = useMemo(() => {
    const list = reactProps?.lookup?.Doctor ? [...reactProps.lookup.Doctor] : [];
    if (reactProps?.currentcontext?.DoctorName && reactProps?.item?.DoctorId) {
      if (!list.some(d => d.Id === reactProps.item.DoctorId)) {
        list.push({ Id: reactProps.item.DoctorId, Text: reactProps.currentcontext.DoctorName });
      }
    }
    if (list.length === 0) {
      list.push({ Id: 6, Text: 'Dr. SUNIL CHOUDHARY' });
    }
    return list;
  }, [reactProps?.lookup?.Doctor, reactProps?.currentcontext?.DoctorName, reactProps?.item?.DoctorId]);

  // Financial calculations
  const grossAmount = useMemo(() => {
    return serviceRows.reduce((sum, r) => sum + (Number(r.Amount) || 0), 0);
  }, [serviceRows]);

  const totalDiscount = useMemo(() => {
    const rowDisc = serviceRows.reduce((sum, r) => sum + (Number(r.DiscountAmount) || 0), 0);
    return rowDisc + (Number(headerDiscount) || 0);
  }, [serviceRows, headerDiscount]);

  const totalTax = useMemo(() => {
    return serviceRows.reduce((sum, r) => sum + (Number(r.GSTAmount) || 0), 0);
  }, [serviceRows]);

  const netAmount = useMemo(() => {
    const calc = grossAmount - totalDiscount + totalTax;
    return calc > 0 ? calc : 0;
  }, [grossAmount, totalDiscount, totalTax]);

  const paidAmount = Number(receiptAmount) || 0;
  const returnAmount = useMemo(() => {
    const tender = Number(tenderAmount) || 0;
    return tender > netAmount ? tender - netAmount : 0;
  }, [tenderAmount, netAmount]);

  const balanceAmount = useMemo(() => {
    return netAmount > paidAmount ? netAmount - paidAmount : 0;
  }, [netAmount, paidAmount]);

  // Load full bill amount helper (matches legacy AngularJS updateReceiptAmt behavior)
  const handleLoadFullBillAmount = useCallback(() => {
    if (netAmount > 0) {
      const fullAmt = Number(netAmount).toFixed(2);
      setReceiptAmount(fullAmt);
      if (onAction) {
        onAction('receiptAmountChange', fullAmt);
      }
    }
  }, [netAmount, onAction]);

  // Auto-fill full bill amount on click/focus if empty or zero (or remaining balance)
  const handleReceiptAmountClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if ((!receiptAmount || Number(receiptAmount) === 0 || balanceAmount > 0) && netAmount > 0) {
      const fullAmt = Number(netAmount).toFixed(2);
      setReceiptAmount(fullAmt);
      if (onAction) {
        onAction('receiptAmountChange', fullAmt);
      }
    }
    e.currentTarget.select();
  };

  const handleReceiptAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if ((!receiptAmount || Number(receiptAmount) === 0 || balanceAmount > 0) && netAmount > 0) {
      const fullAmt = Number(netAmount).toFixed(2);
      setReceiptAmount(fullAmt);
      if (onAction) {
        onAction('receiptAmountChange', fullAmt);
      }
    }
    e.currentTarget.select();
  };

  // Service row change handlers
  const handleRowChange = (index: number, field: keyof BillingServiceRow, value: any) => {
    const updated = [...serviceRows];
    const row = { ...updated[index], [field]: value };

    if (field === 'Quantity' || field === 'Rate') {
      const q = Number(field === 'Quantity' ? value : row.Quantity) || 0;
      const r = Number(field === 'Rate' ? value : row.Rate) || 0;
      row.Amount = q * r;
      row.NetAmount = row.Amount - (row.DiscountAmount || 0) + (row.GSTAmount || 0);
    } else if (field === 'DiscountAmount') {
      const disc = Number(value) || 0;
      row.NetAmount = (row.Amount || 0) - disc + (row.GSTAmount || 0);
    }

    updated[index] = row;
    setServiceRows(updated);

    if (onAction) {
      onAction('serviceRowChange', { index, row, allRows: updated });
    }
  };

  const handleAddRow = () => {
    const updated = [
      ...serviceRows,
      {
        ServiceId: 0,
        ServiceCode: '',
        ServiceName: '',
        Quantity: 1,
        Rate: 0,
        Amount: 0,
        DiscountAmount: 0,
        GSTAmount: 0,
        NetAmount: 0,
        ExecDoctorId: defaultDoctorId
      }
    ];
    setServiceRows(updated);
    if (onAction) {
      onAction('addNewLineItem');
      onAction('serviceRowChange', { index: updated.length - 1, row: updated[updated.length - 1], allRows: updated });
    }
    setTimeout(() => {
      const nextInput = document.getElementById(`service-input-${updated.length - 1}`);
      if (nextInput) nextInput.focus();
    }, 100);
  };

  const handleCloneRow = (index: number) => {
    const source = serviceRows[index];
    if (!source) return;
    const cloned = { ...source, Id: 0 };
    const updated = [...serviceRows];
    updated.splice(index + 1, 0, cloned);
    setServiceRows(updated);
    if (onAction) {
      onAction('serviceRowChange', { index: index + 1, row: cloned, allRows: updated });
    }
  };

  const handleDeleteRow = (index: number) => {
    if (serviceRows.length <= 1) {
      setServiceRows([{
        ServiceId: 0,
        ServiceCode: '',
        ServiceName: '',
        Quantity: 1,
        Rate: 0,
        Amount: 0,
        DiscountAmount: 0,
        GSTAmount: 0,
        NetAmount: 0,
        ExecDoctorId: defaultDoctorId
      }]);
    } else {
      const filtered = serviceRows.filter((_, idx) => idx !== index);
      setServiceRows(filtered);
    }
    if (onAction) {
      onAction('deleteService', { index });
    }
  };

  const handleRateCategoryChange = (newCatId: number) => {
    setRateCategoryId(newCatId);
    setServiceRows(prevRows => prevRows.map(row => {
      if (row.SelectedItem && row.ServiceId) {
        const newRate = getTariffRate(row.SelectedItem, newCatId);
        const qty = row.Quantity || 1;
        const amount = qty * newRate;
        const disc = Number(row.DiscountAmount) || 0;
        const tax = Number(row.GSTAmount) || 0;
        return {
          ...row,
          Rate: newRate,
          Amount: amount,
          NetAmount: amount - disc + tax
        };
      }
      return row;
    }));
    if (onAction) {
      onAction('rateCategoryChange', newCatId);
    }
  };

  const handleClose = () => {
    if (onAction) {
      onAction('close');
    }
  };

  const handleSaveDraft = () => {
    if (onAction) {
      onAction('save', {
        serviceRows,
        receiptAmount,
        remarks,
        paymentTypeId,
        netAmount,
        grossAmount
      });
    }
  };

  const handleSaveAndApprove = () => {
    if (onAction) {
      onAction('saveAndApprove', {
        serviceRows,
        receiptAmount,
        remarks,
        paymentTypeId,
        netAmount,
        grossAmount
      });
    }
  };

  const formatCurrency = (val?: number) => {
    const n = Number(val) || 0;
    return `₹${n.toFixed(2)}`;
  };

  // Resolved patient display fields
  const patTitle = selectedPatient.Title?.Description || '';
  const patFirstName = selectedPatient.FirstName || reactProps?.item?.PatientName || '';
  const patLastName = selectedPatient.LastName || '';
  const patFullName = `${patTitle ? patTitle + ' ' : ''}${patFirstName} ${patLastName}`.trim();
  const patMrn = selectedPatient.MRN || reactProps?.item?.PatientMrn || reactProps?.item?.MRN || '';
  const patAge = selectedPatient.Age || reactProps?.currentcontext?.Age || '';
  const patGender = selectedPatient.Gender?.Description || '';
  const patReferral = selectedPatient.Referrer?.ReferralName || reactProps?.currentcontext?.ReferralName || '';

  return (
    <div style={{
      position: isModal ? 'relative' : 'static',
      width: '100%',
      maxWidth: 1240,
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: radii.xl,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      fontFamily: typography.fontFamily,
      color: '#0f172a',
      boxSizing: 'border-box',
      overflow: 'visible'
    }}>
      {/* Top Header Toolbar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Title */}
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.01em'
        }}>
          OP Billing
        </h2>

        {/* Filters & Actions Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Rate Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Rate Type</span>
            <select
              value={rateCategoryId}
              onChange={e => handleRateCategoryChange(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                backgroundColor: '#ffffff',
                fontWeight: 500,
                outline: 'none',
                minWidth: 100
              }}
            >
              {rateCategoryOptions.map(opt => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>

          {/* Patient Search Input */}
          <div style={{ position: 'relative', width: 220 }}>
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: 13
            }}>
              🔍
            </span>
            <input
              type="text"
              value={patientSearchQuery}
              onChange={e => setPatientSearchQuery(e.target.value)}
              placeholder="Search Patient..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: radii.md,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => onAction?.('outstandingBill')}
              title="Outstanding Bills"
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13
              }}
            >
              D
            </button>
            <button
              type="button"
              onClick={() => onAction?.('findBill')}
              title="Find Previous Bills"
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13
              }}
            >
              🔍
            </button>
            <button
              type="button"
              onClick={() => onAction?.('addNewBill')}
              title="Add New Bill"
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div style={{ padding: '16px 20px' }}>
        {/* Patient / Payer Details Card (3 Columns) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 16,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: radii.lg,
          padding: '14px 18px',
          marginBottom: 16
        }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #f1f5f9', paddingRight: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Patient Name/UHID</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>
                  {patFullName || patMrn ? `: ${patFullName} / ${patMrn}` : ': /'}
                </span>
                <span
                  style={{ color: '#0284c7', cursor: 'pointer', fontSize: 14 }}
                  title="Patient Comments"
                >
                  💬
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Doctor</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {doctorName}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Referral Name</div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {patReferral ? `: ${patReferral}` : ':'}
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #f1f5f9', paddingRight: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Age / Sex</div>
              <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                {patAge || patGender ? `: ${patAge} / ${patGender}` : ': /'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                Payer Type<span style={{ color: '#ef4444' }}>*</span>
              </div>
              <select
                value={guarantorTypeId}
                onChange={e => setGuarantorTypeId(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {guarantorTypeOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Discount Type</div>
              <select
                value={discountModeId}
                onChange={e => setDiscountModeId(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {discountModeOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Patient Type</div>
              <select
                value={patientTypeId}
                onChange={e => setPatientTypeId(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {patientTypeOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                Payer<span style={{ color: '#ef4444' }}>*</span>
              </div>
              <select
                value={guarantorId}
                onChange={e => setGuarantorId(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {guarantorOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Discount Category</div>
              <select
                value={discountCategoryId}
                onChange={e => setDiscountCategoryId(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '5px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {guarantorTypeOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: radii.lg,
          overflow: 'visible',
          marginBottom: 14
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '10px 12px', minWidth: 260 }}>BILLING SERVICES <span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '10px 12px', width: 65, textAlign: 'center' }}>QTY <span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '10px 12px', width: 85, textAlign: 'right' }}>RATE <span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '10px 12px', width: 95, textAlign: 'right' }}>AMOUNT <span style={{ color: '#ef4444' }}>*</span></th>
                <th style={{ padding: '10px 12px', width: 75, textAlign: 'right' }}>DISCOUNT</th>
                <th style={{ padding: '10px 12px', width: 75, textAlign: 'right' }}>TAX AMOUNT</th>
                <th style={{ padding: '10px 12px', width: 95, textAlign: 'right' }}>NET AMOUNT</th>
                <th style={{ padding: '10px 12px', width: 150 }}>EXE. DOCTOR</th>
                <th style={{ padding: '10px 12px', width: 85, textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Service input with Autocomplete */}
                  <td style={{ padding: '8px 12px', position: 'relative' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        id={`service-input-${idx}`}
                        type="text"
                        placeholder="Select service from Service Master..."
                        value={row.ServiceName || ''}
                        onFocus={() => {
                          setActiveDropdownIndex(idx);
                          setHighlightedIndex(0);
                          setDropdownSearch(row.ServiceName || '');
                          searchServices(row.ServiceName || '');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (activeDropdownIndex !== idx) {
                              setActiveDropdownIndex(idx);
                              setHighlightedIndex(0);
                              searchServices(row.ServiceName || '');
                            } else if (searchResults.length > 0) {
                              setHighlightedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
                            }
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (activeDropdownIndex === idx && searchResults.length > 0) {
                              setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
                            }
                          } else if (e.key === 'Enter') {
                            if (activeDropdownIndex === idx && searchResults.length > 0 && highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
                              e.preventDefault();
                              e.stopPropagation();
                              handleServiceSelect(idx, searchResults[highlightedIndex]);
                            }
                          } else if (e.key === 'Escape') {
                            setActiveDropdownIndex(null);
                          }
                        }}
                        onChange={e => {
                          const val = e.target.value;
                          if (!val) {
                            handleRowChange(idx, 'ServiceName', '');
                            handleRowChange(idx, 'ServiceCode', '');
                            handleRowChange(idx, 'Rate', 0);
                            handleRowChange(idx, 'Amount', 0);
                            handleRowChange(idx, 'NetAmount', 0);
                            handleRowChange(idx, 'SelectedItem', null);
                          } else {
                            handleRowChange(idx, 'ServiceName', val);
                          }
                          setDropdownSearch(val);
                          searchServices(val);
                          setHighlightedIndex(0);
                          setActiveDropdownIndex(idx);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 26px 6px 8px',
                          borderRadius: radii.md,
                          border: '1px solid #cbd5e1',
                          backgroundColor: row.ServiceName ? '#f0fdf4' : '#ffffff',
                          fontSize: 12,
                          fontWeight: row.ServiceName ? 600 : 400,
                          color: '#0f172a',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 11,
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (activeDropdownIndex === idx) {
                            setActiveDropdownIndex(null);
                          } else {
                            setActiveDropdownIndex(idx);
                            setHighlightedIndex(0);
                            searchServices(row.ServiceName || '');
                          }
                        }}
                      >
                        ▼
                      </span>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {activeDropdownIndex === idx && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 12,
                          right: 12,
                          zIndex: 9999,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: radii.md,
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                          maxHeight: 260,
                          overflowY: 'auto'
                        }}
                      >
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'sticky',
                          top: 0,
                          zIndex: 1
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>SERVICE MASTER</span>
                            <span style={{ backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: 10, fontSize: 10, color: '#475569' }}>
                              {isSearching ? 'Loading...' : `${searchResults.length} services`}
                            </span>
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            ↑/↓ navigate, Enter select
                          </span>
                        </div>
                        {isSearching && searchResults.length === 0 ? (
                          <div style={{ padding: '16px', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                            Loading services from Service Master...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div style={{ padding: '16px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                            No services found in Service Master matching &ldquo;{dropdownSearch}&rdquo;
                          </div>
                        ) : (
                          searchResults.map((item, itemIdx) => {
                            const isHighlighted = highlightedIndex === itemIdx;
                            return (
                              <div
                                key={item.ServiceItemId}
                                ref={el => { itemRefs.current[itemIdx] = el; }}
                                onClick={() => handleServiceSelect(idx, item)}
                                onMouseEnter={() => setHighlightedIndex(itemIdx)}
                                style={{
                                  padding: '8px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  borderLeft: isHighlighted ? '4px solid #0284c7' : '4px solid transparent',
                                  backgroundColor: isHighlighted ? '#e0f2fe' : '#ffffff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'background 0.1s ease, border-left 0.1s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: isHighlighted ? '#0284c7' : '#0369a1',
                                    backgroundColor: isHighlighted ? '#bae6fd' : '#e0f2fe',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.ItemCode}
                                  </span>
                                  <span style={{
                                    fontSize: 12,
                                    fontWeight: isHighlighted ? 700 : 500,
                                    color: isHighlighted ? '#0369a1' : '#0f172a',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden'
                                  }}>
                                    {item.Name}
                                  </span>
                                  {item.DepartmentName && (
                                    <span style={{
                                      fontSize: 10,
                                      color: '#64748b',
                                      backgroundColor: '#f1f5f9',
                                      padding: '1px 5px',
                                      borderRadius: 3,
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {item.DepartmentName}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginLeft: 8, whiteSpace: 'nowrap' }}>
                                  {formatCurrency(item.Rate)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="number"
                      min={1}
                      value={row.Quantity}
                      onChange={e => handleRowChange(idx, 'Quantity', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: radii.md,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                  </td>

                  {/* Rate */}
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="number"
                      value={row.Rate}
                      onChange={e => handleRowChange(idx, 'Rate', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 6px',
                        borderRadius: radii.md,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        textAlign: 'right',
                        boxSizing: 'border-box'
                      }}
                    />
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                    {formatCurrency(row.Amount)}
                  </td>

                  {/* Discount */}
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="number"
                      value={row.DiscountAmount || 0}
                      onChange={e => handleRowChange(idx, 'DiscountAmount', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: radii.md,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        textAlign: 'right',
                        boxSizing: 'border-box'
                      }}
                    />
                  </td>

                  {/* Tax Amount */}
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                    {row.GSTAmount || 0}
                  </td>

                  {/* Net Amount */}
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                    {formatCurrency(row.NetAmount)}
                  </td>

                  {/* Executing Doctor */}
                  <td style={{ padding: '8px 12px' }}>
                    <select
                      value={row.ExecDoctorId || defaultDoctorId}
                      onChange={e => handleRowChange(idx, 'ExecDoctorId', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: radii.md,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {doctorOptions.map(doc => (
                        <option key={doc.Id} value={doc.Id}>{doc.Text}</option>
                      ))}
                    </select>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleCloneRow(idx)}
                        title="Duplicate row"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0284c7', fontSize: 13 }}
                      >
                        📄
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        title="Delete service"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13 }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Service Option Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            borderBottomLeftRadius: radii.lg,
            borderBottomRightRadius: radii.lg
          }}>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #0284c7',
                borderRadius: radii.md,
                color: '#0284c7',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0284c7';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#0284c7';
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700 }}>+</span> Add Service
            </button>

            <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              Keyboard: <kbd style={{ padding: '2px 5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, fontWeight: 600 }}>↓</kbd> <kbd style={{ padding: '2px 5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, fontWeight: 600 }}>↑</kbd> to navigate services, <kbd style={{ padding: '2px 5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, fontWeight: 600 }}>Enter</kbd> to select
            </span>
          </div>
        </div>

        {/* Pending Orders & Overall Due Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          padding: '4px 2px',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              onClick={() => onAction?.('pendingOrders')}
              style={{ fontSize: 13, color: '#ea580c', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
            >
              PendingOrders(0)
            </span>
            <span
              onClick={() => onAction?.('pendingBills')}
              style={{ fontSize: 13, color: '#ea580c', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
            >
              PendingBills(0)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
              Overall Due : ₹0.00
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
              Balance : {formatCurrency(balanceAmount)}
            </div>
          </div>
        </div>

        {/* Lower Form & Calculation Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 20
        }}>
          {/* Column 1: Discount & Remarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Discount Type
                </label>
                <select
                  value={discountModeId}
                  onChange={e => setDiscountModeId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: radii.md,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    backgroundColor: '#ffffff'
                  }}
                >
                  {discountModeOptions.map(opt => (
                    <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 18 }}>
                <input
                  type="checkbox"
                  id="multiPay"
                  checked={isMultiplePayment}
                  onChange={e => setIsMultiplePayment(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="multiPay" style={{ fontSize: 12, color: '#475569', cursor: 'pointer' }}>
                  Is Multiple Payment
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Discount
              </label>
              <input
                type="number"
                value={headerDiscount}
                onChange={e => setHeaderDiscount(Number(e.target.value))}
                style={{
                  width: 140,
                  padding: '6px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Remarks
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Column 2: Payment Type & Receipt Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Payment Type<span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={paymentTypeId}
                onChange={e => setPaymentTypeId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: radii.md,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  backgroundColor: '#ffffff'
                }}
              >
                {paymentTypeOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, width: 160 }}>
                <label
                  onClick={handleLoadFullBillAmount}
                  style={{ fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  title="Click to load full bill amount"
                >
                  Receipt Amount<span style={{ color: '#ef4444' }}>*</span>
                </label>
                {netAmount > 0 && (
                  <button
                    type="button"
                    onClick={handleLoadFullBillAmount}
                    style={{
                      fontSize: 11,
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 500,
                      textDecoration: 'underline'
                    }}
                    title="Fill full net bill amount"
                  >
                    Full Amount
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={receiptAmount}
                placeholder="Enter amount..."
                onClick={handleReceiptAmountClick}
                onFocus={handleReceiptAmountFocus}
                onDoubleClick={handleLoadFullBillAmount}
                onChange={e => {
                  setReceiptAmount(e.target.value);
                  if (onAction) {
                    onAction('receiptAmountChange', e.target.value);
                  }
                }}
                style={{
                  width: 160,
                  padding: '6px 8px',
                  borderRadius: radii.md,
                  border: receiptAmount ? '1px solid #cbd5e1' : '1px solid #ef4444',
                  fontSize: 12
                }}
              />
            </div>

            {/* Payment Receipt Box */}
            <div style={{
              marginTop: 10,
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: radii.md,
              backgroundColor: '#f8fafc',
              minHeight: 60
            }}>
              <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>Payment Receipt</span>
              {reactProps?.PaymentInfoDetails && reactProps.PaymentInfoDetails.length > 0 ? (
                <div style={{ marginTop: 6, fontSize: 11, color: '#475569' }}>
                  {reactProps.PaymentInfoDetails.map((p, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', gap: 6 }}>
                      <span>{p.ReceiptType}</span>/
                      <span>{p.ReceiptNumber}</span>/
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(p.AmountPaid)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>No receipt generated yet</div>
              )}
            </div>
          </div>

          {/* Column 3: Totals Summary Table */}
          <div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              border: '1px solid #e2e8f0',
              borderRadius: radii.md,
              overflow: 'hidden'
            }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Available Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹0.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Gross Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(grossAmount)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Discount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalDiscount)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Tax Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalTax)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fef2f2' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#dc2626' }}>Net Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(netAmount)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Paid Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(paidAmount)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Refund</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹0.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>Tender Amt</td>
                  <td style={{ padding: '4px 12px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={tenderAmount}
                      onChange={e => setTenderAmount(e.target.value)}
                      style={{
                        width: 80,
                        padding: '4px 6px',
                        border: '1px solid #cbd5e1',
                        borderRadius: radii.sm,
                        textAlign: 'right',
                        fontSize: 12
                      }}
                    />
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#fef2f2' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#dc2626' }}>Return Amt</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(returnAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16
        }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '9px 18px',
              borderRadius: radii.md,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              padding: '9px 20px',
              borderRadius: radii.md,
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0369a1'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0284c7'}
          >
            Save (Alt+S)
          </button>

          <button
            type="button"
            onClick={handleSaveAndApprove}
            style={{
              padding: '9px 20px',
              borderRadius: radii.md,
              border: 'none',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
          >
            Save & Approve (Alt+A)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpConsultationBillingModal;
