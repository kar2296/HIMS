import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface VendorPaymentFormProps {
  id?: number;
  reactProps?: {
    id?: number;
    currentfilter?: any;
    lookup?: {
      PaymentType?: Array<{ Id: number | string; Text: string }>;
      Bank?: Array<{ Id: number | string; Text: string }>;
      Terminal?: Array<{ Id: number | string; Text: string }>;
      CardType?: Array<{ Id: number | string; Text: string }>;
    };
    item?: any;
    VendorPaymentDetail?: any[];
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: any) => void;
}

export interface PaymentLineDetail {
  Id: number;
  picktypeId?: number; // 1: GRN, 2: Return
  Date: string;
  InvoiceNumber: string;
  IdNumber: string; // GRN # or Return #
  InvoiceAmount: number;
  PaidAmount: number;
  BalanceAmount: number;
  WriteOff: number;
  TDSAmount: number;
  TotalNetAmount: number;
  ReceiptAmt: number;
  IsPaidFully?: number;
  Status?: number;
}

interface PicklistItem {
  Id: number;
  PickType: 'Grn' | 'Return';
  PickTypeId: number;
  Date: string;
  IdNumber: string;
  InvoiceNumber: string;
  InvAmt: number;
  RecAmt: number;
  BlnceAmt: number;
  NetAmt: number;
}

const safeFormatDate = (val: any): string => {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) {
    try {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, '0');
      const day = String(val.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};

export const VendorPaymentFormScreen: React.FC<VendorPaymentFormProps> = ({
  id: propId,
  reactProps,
  onAction,
  onNavigate,
}) => {
  const voucherId = propId !== undefined ? propId : (reactProps?.id || 0);

  // Supplier & Voucher header
  const [vendorMasterId, setVendorMasterId] = useState<number>(reactProps?.item?.VendorMasterId || 0);
  const [vendorName, setVendorName] = useState<string>(reactProps?.item?.VendorName || '');
  const [address, setAddress] = useState<string>(reactProps?.item?.Address || '');
  const [contactNo, setContactNo] = useState<string>(reactProps?.item?.ContactNo || '');
  const [contactPerson, setContactPerson] = useState<string>(reactProps?.item?.ContactPerson || '');
  const [email, setEmail] = useState<string>(reactProps?.item?.Email || '');
  const [isTds, setIsTds] = useState<boolean>(!!reactProps?.item?.IsTDS);
  const [tdsPercentage, setTdsPercentage] = useState<string>(reactProps?.item?.TDSPercentage || '0');
  const [beforeOutstanding, setBeforeOutstanding] = useState<number>(reactProps?.item?.BeforeOutstanding || 0);
  const [billAmount, setBillAmount] = useState<number>(reactProps?.item?.BillAmount || 0);
  const [returnedAmount, setReturnedAmount] = useState<number>(reactProps?.item?.ReturnedAmount || 0);
  const [priorPaidAmount, setPriorPaidAmount] = useState<number>(reactProps?.item?.PaidAmount || 0);

  // Voucher status
  const [voucherStatusId, setVoucherStatusId] = useState<number>(reactProps?.item?.VendorPaymentStatusId || 1);
  const [voucherIdentifier, setVoucherIdentifier] = useState<string>(
    reactProps?.item?.VendorPaymentIdentifier || (voucherId > 0 ? `VP-${voucherId}` : 'VP-NEW')
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    safeFormatDate(reactProps?.item?.VendorPaymentDate)
  );

  // Line items
  const [details, setDetails] = useState<PaymentLineDetail[]>([
    {
      Id: 1,
      picktypeId: 1,
      Date: '2026-10-15',
      InvoiceNumber: 'INV-88401',
      IdNumber: 'GRN-2026-0312',
      InvoiceAmount: 50000,
      PaidAmount: 10000,
      BalanceAmount: 40000,
      WriteOff: 0,
      TDSAmount: 0,
      TotalNetAmount: 40000,
      ReceiptAmt: 40000,
      Status: 1,
    },
  ]);

  // Payment method
  const [paymentTypeId, setPaymentTypeId] = useState<number>(reactProps?.item?.PaymentTypeId || 1); // 1: Cash, 2: Cheque, 3: DD, 4: Wire, 5: Card
  const [bankId, setBankId] = useState<number>(reactProps?.item?.BankId || 1);
  const [chequeNo, setChequeNo] = useState<string>(reactProps?.item?.ChequeNo || '');
  const [chequeDate, setChequeDate] = useState<string>(safeFormatDate(reactProps?.item?.ChequeDate));
  const [ddNo, setDdNo] = useState<string>(reactProps?.item?.DDNumber || '');
  const [ddDate, setDdDate] = useState<string>(safeFormatDate(reactProps?.item?.DDDate));
  const [wireTransferId, setWireTransferId] = useState<string>(reactProps?.item?.WireTransferId || '');
  const [wireTransferDate, setWireTransferDate] = useState<string>(safeFormatDate(reactProps?.item?.WireTransferDate));
  const [authorizeNumber, setAuthorizeNumber] = useState<string>(reactProps?.item?.AuthorizeNumber || '');
  const [cardTypeId, setCardTypeId] = useState<number>(reactProps?.item?.CardTypeId || 1);
  const [terminalNoId, setTerminalNoId] = useState<number>(reactProps?.item?.TerminalNoId || 1);

  // Vendors list for autocomplete
  const [vendors, setVendors] = useState<Array<{ Id: number; VendorName: string; VendorCode: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Picklist modal state
  const [isPicklistOpen, setIsPicklistOpen] = useState<boolean>(false);
  const [picklistItems, setPicklistItems] = useState<PicklistItem[]>([]);
  const [picklistType, setPicklistType] = useState<number>(-1); // -1: All, 1: GRN, 2: Return
  const [picklistFromDate, setPicklistFromDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [picklistToDate, setPicklistToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [picklistLoading, setPicklistLoading] = useState<boolean>(false);

  // Lookups
  const paymentTypes = reactProps?.lookup?.PaymentType || [
    { Id: 1, Text: 'Cash' },
    { Id: 2, Text: 'Cheque' },
    { Id: 3, Text: 'Demand Draft (DD)' },
    { Id: 4, Text: 'Wire Transfer / RTGS / NEFT' },
    { Id: 5, Text: 'Credit Card' },
    { Id: 6, Text: 'Debit Card' },
  ];

  const banks = reactProps?.lookup?.Bank || [
    { Id: 1, Text: 'State Bank of India (SBI)' },
    { Id: 2, Text: 'HDFC Bank' },
    { Id: 3, Text: 'ICICI Bank' },
    { Id: 4, Text: 'Axis Bank' },
  ];

  const terminals = reactProps?.lookup?.Terminal || [
    { Id: 1, Text: 'Terminal 01 - Cashier Counter' },
    { Id: 2, Text: 'Terminal 02 - Accounts Office' },
  ];

  const cardTypes = reactProps?.lookup?.CardType || [
    { Id: 1, Text: 'Visa' },
    { Id: 2, Text: 'MasterCard' },
    { Id: 3, Text: 'RuPay' },
  ];

  const facilityName = sessionHelper.getCurrentFacilityName() || 'SHUVADARSINI HOSPITAL';

  // Load vendors list
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await callBackendApi('pharmacy/vendormaster/GetVendorMasters', {
          Params: [
            { Key: 3, Value: 1 },
            { Key: 4, Value: 2 },
          ],
          PageContext: { PageSize: 100, PageNumber: 1 },
        });
        if (res && res.Data && Array.isArray(res.Data)) {
          setVendors(
            res.Data.map((v: any) => ({
              Id: v.Id || v.VendorMasterId,
              VendorName: v.VendorName,
              VendorCode: v.VendorCode,
            }))
          );
        }
      } catch (err) {
        console.warn('Could not load vendor masters:', err);
      }
    };
    loadVendors();
  }, []);

  // Load existing voucher if voucherId > 0
  useEffect(() => {
    if (voucherId > 0 && !reactProps?.item) {
      const loadVoucher = async () => {
        setLoading(true);
        try {
          const res = await callBackendApi('pharmacy/VendorPayment/GetVendorPaymentById', { Id: voucherId });
          if (res && (res.Data || res.Id)) {
            const data = res.Data || res;
            setVendorMasterId(data.VendorMasterId || 0);
            setVendorName(data.VendorName || '');
            setVoucherIdentifier(data.VendorPaymentIdentifier || `VP-${voucherId}`);
            setVoucherStatusId(data.VendorPaymentStatusId || 2);
            setPaymentTypeId(data.PaymentTypeId || 1);
            setPaymentDate(safeFormatDate(data.VendorPaymentDate));
          }

          // Load detail lines
          const detailsRes = await callBackendApi('pharmacy/VendorPaymentDetails/GetVendorPaymentDetails', {
            Params: [{ Key: 1, Value: voucherId }],
            PageContext: { PageSize: 1000, PageNumber: 1 },
          });
          if (detailsRes && detailsRes.Data && Array.isArray(detailsRes.Data) && detailsRes.Data.length > 0) {
            setDetails(
              detailsRes.Data.map((d: any, idx: number) => ({
                Id: d.Id || idx + 1,
                picktypeId: d.PickTypeId || 1,
                Date: safeFormatDate(d.GrnDate || d.Date),
                InvoiceNumber: d.InvoiceNo || d.InvoiceNumber || '—',
                IdNumber: d.GrnNo || d.IdNumber || '—',
                InvoiceAmount: Number(d.TotalInvoiceAmount || d.InvoiceAmount || 0),
                PaidAmount: Number(d.PaidAmount || 0),
                BalanceAmount: Number(d.BalanceAmount || 0),
                WriteOff: Number(d.WriteOff || 0),
                TDSAmount: Number(d.TDSAmount || d.TaxAmount || 0),
                TotalNetAmount: Number(d.TotalNetAmount || d.NetAmount || 0),
                ReceiptAmt: Number(d.ReceiptAmt || d.PaidAmount || 0),
                Status: 1,
              }))
            );
          }
        } catch (err) {
          console.warn('Failed to load voucher details:', err);
        } finally {
          setLoading(false);
        }
      };
      loadVoucher();
    }
  }, [voucherId, reactProps?.item]);

  // Handle supplier selection
  const handleSelectVendor = async (vId: number) => {
    setVendorMasterId(vId);
    if (vId <= 0) return;

    try {
      const res = await callBackendApi('pharmacy/vendormaster/GetVendorMasters', {
        Params: [{ Key: 0, Value: vId }],
        PageContext: { PageSize: 10, PageNumber: 1 },
      });
      if (res && res.Data && res.Data.length > 0) {
        const item = res.Data[0];
        setVendorName(item.VendorName || '');
        setAddress(item.AddressLine1 || item.Address || '');
        setContactPerson(item.ContactPerson || '');
        setContactNo(item.MobileNumber || item.PhoneNumber || '');
        setEmail(item.EmailAddress || item.Email || '');
        setIsTds(!!item.IsTDS);
        setBeforeOutstanding(Number(item.OutStandingAmount || 0));
        setBillAmount(Number(item.BillAmount || 0));
        setReturnedAmount(Number(item.ReturnedAmount || 0));
        setPriorPaidAmount(Number(item.PaidAmount || 0));
        if (item.GstMaster) {
          setTdsPercentage(String(item.GstMaster.GstPercentage || item.GstMaster.GstName || '0'));
        }
      }
    } catch (err) {
      console.warn('Could not fetch supplier details:', err);
    }
  };

  // Recalculate row amounts
  const handleLineChange = (index: number, field: 'WriteOff' | 'ReceiptAmt', value: number) => {
    setDetails((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };
      const val = isNaN(value) ? 0 : value;

      if (field === 'WriteOff') {
        row.WriteOff = val;
      } else if (field === 'ReceiptAmt') {
        row.ReceiptAmt = val;
      }

      // Compute Net Amount: Balance - WriteOff - TDS
      row.TotalNetAmount = Math.max(0, row.BalanceAmount - (row.WriteOff || 0) - (row.TDSAmount || 0));
      updated[index] = row;
      return updated;
    });
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    setDetails((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Summary totals
  const totals = useMemo(() => {
    const totalPaid = details.reduce((sum, d) => sum + (Number(d.ReceiptAmt) || 0), 0);
    const totalNet = details.reduce((sum, d) => sum + (Number(d.TotalNetAmount) || 0), 0);
    const totalTds = details.reduce((sum, d) => sum + (Number(d.TDSAmount) || 0), 0);
    const totalOutstanding = Math.max(0, beforeOutstanding - totalPaid);

    return { totalPaid, totalNet, totalTds, totalOutstanding };
  }, [details, beforeOutstanding]);

  // Open Picklist Modal & fetch pending GRNs and Returns
  const handleOpenPicklist = async () => {
    if (vendorMasterId <= 0) {
      alert('Please select a Supplier / Vendor first.');
      return;
    }

    setIsPicklistOpen(true);
    setPicklistLoading(true);

    try {
      const items: PicklistItem[] = [];

      // Fetch pending GRNs
      const grnRes = await callBackendApi('pharmacy/grn/GetGrnList', {
        Params: [
          { Key: 8, Value: `${picklistFromDate} 00:00:00` },
          { Key: 9, Value: `${picklistToDate} 23:59:59` },
          { Key: 4, Value: vendorMasterId },
        ],
        PageContext: { PageSize: 50, PageNumber: 1 },
      });

      if (grnRes && grnRes.Data && Array.isArray(grnRes.Data)) {
        grnRes.Data.forEach((g: any) => {
          items.push({
            Id: g.Id,
            PickType: 'Grn',
            PickTypeId: 1,
            Date: safeFormatDate(g.GrnDate),
            IdNumber: g.GrnNumber || `GRN-${g.Id}`,
            InvoiceNumber: g.InvoiceNumber || '—',
            InvAmt: Number(g.TotalInvoiAmount || g.TotalInvoiceAmount || 0),
            RecAmt: Number(g.ReceivedAmount || 0),
            BlnceAmt: Number(g.BalanceAmount || 0),
            NetAmt: Number(g.TotalNetAmount || 0),
          });
        });
      }

      // Fetch pending Returns
      const prnRes = await callBackendApi('pharmacy/PurchaseReturn/GetPurchaseReturns', {
        Params: [
          { Key: 3, Value: vendorMasterId },
          { Key: 9, Value: `${picklistFromDate} 00:00:00` },
          { Key: 10, Value: `${picklistToDate} 23:59:59` },
        ],
        PageContext: { PageSize: 50, PageNumber: 1 },
      });

      if (prnRes && prnRes.Data && Array.isArray(prnRes.Data)) {
        prnRes.Data.forEach((p: any) => {
          items.push({
            Id: p.Id,
            PickType: 'Return',
            PickTypeId: 2,
            Date: safeFormatDate(p.PrnDate),
            IdNumber: p.PrnNumber || `PRN-${p.Id}`,
            InvoiceNumber: '—',
            InvAmt: 0,
            RecAmt: 0,
            BlnceAmt: Number(p.TotalNetAmount || 0),
            NetAmt: Number(p.TotalNetAmount || 0),
          });
        });
      }

      setPicklistItems(items);
    } catch (err) {
      console.warn('Could not load picklist items:', err);
    } finally {
      setPicklistLoading(false);
    }
  };

  // Add item from picklist
  const handleSelectPicklistItem = (item: PicklistItem) => {
    // Check if already in details
    if (details.some((d) => d.IdNumber === item.IdNumber)) {
      alert(`Invoice / Note ${item.IdNumber} is already added to this voucher.`);
      return;
    }

    const newLine: PaymentLineDetail = {
      Id: Date.now(),
      picktypeId: item.PickTypeId,
      Date: item.Date,
      InvoiceNumber: item.InvoiceNumber,
      IdNumber: item.IdNumber,
      InvoiceAmount: item.InvAmt || item.NetAmt,
      PaidAmount: item.RecAmt,
      BalanceAmount: item.BlnceAmt,
      WriteOff: 0,
      TDSAmount: isTds ? (item.BlnceAmt * parseFloat(tdsPercentage || '0')) / 100 : 0,
      TotalNetAmount: item.BlnceAmt,
      ReceiptAmt: item.BlnceAmt,
      Status: 1,
    };

    setDetails((prev) => [...prev, newLine]);
    setIsPicklistOpen(false);
  };

  // Save Voucher
  const handleSaveAndApprove = async () => {
    if (vendorMasterId <= 0) {
      alert('Please select a Supplier before saving.');
      return;
    }
    if (details.length === 0) {
      alert('Please add at least one invoice or GRN item to settle.');
      return;
    }

    if (onAction) {
      onAction('saveAndApprove', {
        Header: {
          Id: voucherId,
          VendorMasterId: vendorMasterId,
          VendorName: vendorName,
          VendorPaymentDate: paymentDate,
          PaymentTypeId: paymentTypeId,
          VendorPaymentStatusId: 2, // Completed
          TotalPaidAmount: totals.totalPaid,
          TotalNetAmount: totals.totalNet,
          TotalTDSAmount: totals.totalTds,
          BankId: paymentTypeId !== 1 ? bankId : undefined,
          ChequeNo: paymentTypeId === 2 ? chequeNo : undefined,
          ChequeDate: paymentTypeId === 2 ? chequeDate : undefined,
          DDNumber: paymentTypeId === 3 ? ddNo : undefined,
          DDDate: paymentTypeId === 3 ? ddDate : undefined,
          WireTransferId: paymentTypeId === 4 ? wireTransferId : undefined,
          WireTransferDate: paymentTypeId === 4 ? wireTransferDate : undefined,
          AuthorizeNumber: paymentTypeId === 5 || paymentTypeId === 6 ? authorizeNumber : undefined,
          TerminalNoId: paymentTypeId === 5 || paymentTypeId === 6 ? terminalNoId : undefined,
          CardTypeId: paymentTypeId === 5 || paymentTypeId === 6 ? cardTypeId : undefined,
        },
        Details: details,
      });
      return;
    }

    setSaving(true);
    try {
      const facilityId = sessionHelper.getCurrentFacilityId() || 1;
      const payload = {
        Data: {
          Header: {
            Id: voucherId,
            FacilityId: facilityId,
            VendorMasterId: vendorMasterId,
            VendorName: vendorName,
            VendorPaymentDate: paymentDate,
            PaymentTypeId: paymentTypeId,
            VendorPaymentStatusId: 2,
            TotalPaidAmount: totals.totalPaid,
            TotalNetAmount: totals.totalNet,
            TotalTDSAmount: totals.totalTds,
            TotalOutstandingAmount: totals.totalOutstanding,
            BankId: paymentTypeId !== 1 ? bankId : undefined,
            ChequeNo: paymentTypeId === 2 ? chequeNo : undefined,
            ChequeDate: paymentTypeId === 2 ? chequeDate : undefined,
            DDNumber: paymentTypeId === 3 ? ddNo : undefined,
            DDDate: paymentTypeId === 3 ? ddDate : undefined,
            WireTransferId: paymentTypeId === 4 ? wireTransferId : undefined,
            WireTransferDate: paymentTypeId === 4 ? wireTransferDate : undefined,
            AuthorizeNumber: paymentTypeId === 5 || paymentTypeId === 6 ? authorizeNumber : undefined,
            TerminalNoId: paymentTypeId === 5 || paymentTypeId === 6 ? terminalNoId : undefined,
            CardTypeId: paymentTypeId === 5 || paymentTypeId === 6 ? cardTypeId : undefined,
          },
          Details: details.map((d) => ({
            Id: d.Id > 1000000 ? 0 : d.Id,
            VendorPaymentId: voucherId,
            GrnNumber: d.IdNumber,
            InvoiceNo: d.InvoiceNumber,
            InvoiceAmount: d.InvoiceAmount,
            PaidAmount: d.PaidAmount,
            BalanceAmount: d.BalanceAmount,
            WriteOff: d.WriteOff,
            TDSAmount: d.TDSAmount,
            NetAmount: d.TotalNetAmount,
            ReceiptAmt: d.ReceiptAmt,
            Status: 1,
          })),
        },
      };

      const action = voucherId > 0 ? 'pharmacy/VendorPayment/UpdateVendorPayment' : 'pharmacy/VendorPayment/AddVendorPayment';
      await callBackendApi(action, payload);
      setToastMessage('Vendor Payment Voucher saved & approved successfully!');
      setTimeout(() => {
        handleBack();
      }, 1200);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving vendor payment. Please check mandatory fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (onAction) {
      onAction('back');
    } else if (onNavigate) {
      onNavigate('app.vendorpaymentlist');
    } else {
      window.location.hash = '#/app/vendorpaymentlist/';
    }
  };

  const handlePrint = async () => {
    if (voucherId <= 0) return;
    try {
      await callBackendApi('pharmacy/VendorPayment/PrintVendorPayment', { Id: voucherId });
    } catch (err) {
      console.warn('Print triggered:', err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '24px 32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Breadcrumb & Actions */}
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
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa fa-arrow-left" /> Back to Payments
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                Supplier Payment Voucher
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: voucherStatusId === 2 ? '#dcfce7' : '#fef3c7',
                  color: voucherStatusId === 2 ? '#16a34a' : '#d97706',
                }}
              >
                {voucherStatusId === 2 ? 'COMPLETED' : 'DRAFT VOUCHER'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Voucher No: <b>{voucherIdentifier}</b> &bull; Date: {paymentDate}
            </div>
          </div>
        </div>

        {/* Top Right Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {voucherStatusId === 2 && (
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-print" /> Preview Print
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAndApprove}
            disabled={saving || voucherStatusId === 2}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              backgroundColor: voucherStatusId === 2 ? '#94a3b8' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: voucherStatusId === 2 ? 'not-allowed' : 'pointer',
              boxShadow: voucherStatusId === 2 ? 'none' : '0 2px 4px rgba(22, 163, 74, 0.25)',
            }}
          >
            <i className={`fa fa-check ${saving ? 'fa-spin' : ''}`} /> Save & Approve (Alt+A)
          </button>
        </div>
      </div>

      {/* Supplier Profile & Financial Snapshot Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            Supplier Profile & Financial Ledger
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Select Supplier:</label>
            <select
              value={vendorMasterId}
              onChange={(e) => handleSelectVendor(Number(e.target.value))}
              disabled={voucherStatusId === 2}
              style={{
                padding: '7px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                minWidth: '260px',
              }}
            >
              <option value={0}>-- Select Supplier / Vendor --</option>
              {vendors.map((v) => (
                <option key={v.Id} value={v.Id}>
                  {v.VendorName} {v.VendorCode ? `(${v.VendorCode})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-Column Profile Information Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #f1f5f9',
          }}
        >
          {/* Column 1: Contact & Address */}
          <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Supplier Name:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{vendorName || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Contact Person:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{contactPerson || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Contact #:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{contactNo || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Email:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Address:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{address || '—'}</span>
            </div>
          </div>

          {/* Column 2: Account Balances */}
          <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Invoice Amount:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(billAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Purchase Returns:</span>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(returnedAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Prior Disbursed:</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>{formatCurrency(priorPaidAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px dashed #cbd5e1',
                marginTop: '6px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#dc2626' }}>Ledger Outstanding:</span>
              <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '13px' }}>
                {formatCurrency(beforeOutstanding)}
              </span>
            </div>
          </div>

          {/* Column 3: Tax & TDS Compliance */}
          <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Withholding Tax / TDS:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isTds}
                  onChange={(e) => setIsTds(e.target.checked)}
                  disabled={voucherStatusId === 2}
                />
                <span style={{ fontWeight: 600, color: isTds ? '#16a34a' : '#64748b' }}>
                  {isTds ? 'Applicable' : 'Exempt'}
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ color: '#64748b' }}>TDS Percentage (%):</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{tdsPercentage}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ color: '#64748b' }}>Payment Date:</span>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={voucherStatusId === 2}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice & GRN Settlement Grid */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Invoices & GRNs Selected for Settlement
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
              }}
            >
              {details.length} Items
            </span>
          </div>

          {/* Pick List Button */}
          {voucherStatusId !== 2 && (
            <button
              type="button"
              onClick={handleOpenPicklist}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                color: '#2563eb',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-list-ul" /> Open Pick List (Select Invoices)
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Invoice #</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>GRN / Return #</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Inv Amount
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Paid
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Due Amount
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right', width: '110px' }}>
                  Write Off
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  TDS
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Net Amount
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a', textAlign: 'right', width: '130px' }}>
                  Payment (₹)
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '50px' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {details.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                    No invoices added yet. Click <b>"Open Pick List"</b> to load pending GRNs or returns.
                  </td>
                </tr>
              ) : (
                details.map((row, idx) => (
                  <tr key={row.Id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>{row.Date}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2563eb' }}>{row.InvoiceNumber}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: row.picktypeId === 2 ? '#fee2e2' : '#f1f5f9',
                          color: row.picktypeId === 2 ? '#dc2626' : '#334155',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {row.IdNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>
                      {formatCurrency(row.InvoiceAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                      {formatCurrency(row.PaidAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      {formatCurrency(row.BalanceAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={row.WriteOff || 0}
                        onChange={(e) => handleLineChange(idx, 'WriteOff', parseFloat(e.target.value))}
                        disabled={voucherStatusId === 2}
                        style={{
                          width: '90px',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'right',
                          fontSize: '12px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#475569' }}>
                      {formatCurrency(row.TDSAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {formatCurrency(row.TotalNetAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={row.ReceiptAmt || 0}
                        onChange={(e) => handleLineChange(idx, 'ReceiptAmt', parseFloat(e.target.value))}
                        disabled={voucherStatusId === 2}
                        style={{
                          width: '110px',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #86efac',
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          fontWeight: 700,
                          textAlign: 'right',
                          fontSize: '13px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {voucherStatusId !== 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(idx)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                          onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
                          onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
                        >
                          <i className="fa fa-times-circle" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modes & Settlement Summary Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Left: Payment Method Controls */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Payment Method & Banking Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Payment Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Payment Mode <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={paymentTypeId}
                onChange={(e) => setPaymentTypeId(Number(e.target.value))}
                disabled={voucherStatusId === 2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1e293b',
                  backgroundColor: '#ffffff',
                }}
              >
                {paymentTypes.map((pt) => (
                  <option key={pt.Id} value={pt.Id}>
                    {pt.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank (if non-cash) */}
            {paymentTypeId !== 1 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Bank Account
                </label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(Number(e.target.value))}
                  disabled={voucherStatusId === 2}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {banks.map((b) => (
                    <option key={b.Id} value={b.Id}>
                      {b.Text}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Conditional Mode Fields */}
          {paymentTypeId === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Cheque Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-448102"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Cheque Date
                </label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {paymentTypeId === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  DD Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DD-99102"
                  value={ddNo}
                  onChange={(e) => setDdNo(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  DD Date
                </label>
                <input
                  type="date"
                  value={ddDate}
                  onChange={(e) => setDdDate(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {paymentTypeId === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  UTR / Reference No
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-HDFC261017001"
                  value={wireTransferId}
                  onChange={(e) => setWireTransferId(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Transfer Date
                </label>
                <input
                  type="date"
                  value={wireTransferDate}
                  onChange={(e) => setWireTransferDate(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {(paymentTypeId === 5 || paymentTypeId === 6) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Card Auth Code
                </label>
                <input
                  type="text"
                  placeholder="Authorization code"
                  value={authorizeNumber}
                  onChange={(e) => setAuthorizeNumber(e.target.value)}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Card Type
                </label>
                <select
                  value={cardTypeId}
                  onChange={(e) => setCardTypeId(Number(e.target.value))}
                  disabled={voucherStatusId === 2}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                >
                  {cardTypes.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right: Settlement Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Voucher Settlement Summary
            </div>

            <div style={{ fontSize: '13px', lineHeight: 2.2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Disbursed / Paid Amount:</span>
                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '15px' }}>
                  {formatCurrency(totals.totalPaid)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Total Net Amount:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(totals.totalNet)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>TDS / Withholding Deducted:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{formatCurrency(totals.totalTds)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontWeight: 700, color: '#dc2626' }}>Remaining Ledger Due:</span>
                <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '16px' }}>
                  {formatCurrency(totals.totalOutstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '8px',
                color: '#15803d',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fa fa-check-circle" /> {toastMessage}
            </div>
          )}
        </div>
      </div>

      {/* Picklist Modal */}
      {isPicklistOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Pending Invoices & Purchase Returns
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Supplier: <b>{vendorName}</b> &bull; Select item to add to payment voucher
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPicklistOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-times" />
              </button>
            </div>

            {/* Modal Filter Toolbar */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>From:</label>
                <input
                  type="date"
                  value={picklistFromDate}
                  onChange={(e) => setPicklistFromDate(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>To:</label>
                <input
                  type="date"
                  value={picklistToDate}
                  onChange={(e) => setPicklistToDate(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                />
              </div>

              <button
                type="button"
                onClick={handleOpenPicklist}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply Filters
              </button>
            </div>

            {/* Modal Items Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {picklistLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px' }} />
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>Loading pending items...</div>
                </div>
              ) : picklistItems.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <i className="fa fa-check-circle" style={{ fontSize: '32px', color: '#16a34a', marginBottom: '8px' }} />
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>No Pending Invoices or Returns</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    All invoices for this supplier have been settled.
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Date</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Type</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>GRN / Return #</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Invoice #</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                        Gross Amt
                      </th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                        Due Balance
                      </th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {picklistItems.map((item) => (
                      <tr key={item.IdNumber} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>{item.Date}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: item.PickType === 'Grn' ? '#e0e7ff' : '#fee2e2',
                              color: item.PickType === 'Grn' ? '#4338ca' : '#dc2626',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {item.PickType}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.IdNumber}</td>
                        <td style={{ padding: '10px 12px', color: '#2563eb' }}>{item.InvoiceNumber}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {formatCurrency(item.InvAmt || item.NetAmt)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          {formatCurrency(item.BlnceAmt)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectPicklistItem(item)}
                            style={{
                              padding: '5px 12px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fa fa-plus" /> Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setIsPicklistOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
