import React, { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";
import { Button } from "./Button";
import { Modal } from "../components/ui/Modal";
import { DataTable, type DataTableColumn } from "../components/ui/DataTable";
import { Loading } from "../components/ui/Loading";
import { Alert } from "../components/ui/Alert";
import { StatusBadge } from "../components/ui/Badge";

/**
 * Types for the data returned by the backend endpoint.
 * Adjust fields as needed to match the actual API response.
 */
interface RegistrationInfo {
  RegistrationId: number;
  RegistrationNumber: string;
  PatientName: string;
  Age: number;
  Gender: string;
  VisitDate: string; // ISO date string
  BillAmount: number;
  PaidAmount: number;
  DueAmount: number;
  Status: string; // e.g. "Open", "Closed"
  // Add any additional fields that exist in your backend response
}

// ---------------------------------------------------------------------------
// UI-MODERNIZATION RETROFIT: this is a standalone React overlay that fetches
// its own data via apiFetch("Registration/RegCumVisitWithBill/GetData") -- it
// is NOT a wrapper dispatching to the (still-deferred, ~304KB) Angular
// regcumvisitwithbill controller, and no dispatch/onAction contract exists
// here to preserve. Only the visual chrome changed: the hand-rolled
// backdrop+panel+header (title bar with its own Close button) now renders
// through the shared Modal shell, the raw <table> now renders through
// DataTable, the spinner/error blocks now render through Loading/Alert, and
// the plain-text Status cell now renders through StatusBadge (same real
// Status string from the API, just tone-colored per the shared convention).
// Data fetching, field names, formatDate/formatCurrency logic, the Print
// (window.print()) and Cancel/Close (onClose) actions are all unchanged.
// ---------------------------------------------------------------------------
export const RegCumVisitWithBillScreen: React.FC<{
  /** Context passed from the dashboard (facility, dates, etc.) */
  context?: any;
  /** Called when the user clicks the Close button */
  onClose?: () => void;
}> = ({ context, onClose }) => {
  const [data, setData] = useState<RegistrationInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /* ---------------------------------------------------------- */
  /* Fetch data on mount – keep the same request pattern you already */
  /* use elsewhere in the app (apiFetch).                         */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch(
          "Registration/RegCumVisitWithBill/GetData",
          {
            Params: [
              { Key: 1, Value: context?.FacilityId ?? 0 },
              { Key: 2, Value: context?.FromDate ?? "" },
              { Key: 3, Value: context?.ToDate ?? "" },
            ],
            PageContext: { PageSize: 100, PageNumber: 1 },
          }
        );
        // Assume the API returns an array under `Data`
        const items: RegistrationInfo[] = response?.Data ?? [];
        setData(items);
      } catch (err: any) {
        console.error("RegCumVisitWithBill fetch error:", err);
        setError(err?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [context]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(val);

  // Column order/labels mirror the original <table> header exactly; only the
  // "#" and "Status" cells changed in presentation (index lookup / StatusBadge
  // instead of plain text) -- same values, same source fields throughout.
  const columns: DataTableColumn<RegistrationInfo>[] = [
    { key: "idx", header: "#", render: (row) => data.indexOf(row) + 1 },
    { key: "regno", header: "Reg. No.", field: "RegistrationNumber" },
    { key: "patient", header: "Patient", field: "PatientName" },
    { key: "agegender", header: "Age / Gender", render: (row) => `${row.Age} / ${row.Gender}` },
    { key: "visitdate", header: "Visit Date", render: (row) => formatDate(row.VisitDate) },
    { key: "bill", header: "Bill", render: (row) => formatCurrency(row.BillAmount) },
    { key: "paid", header: "Paid", render: (row) => formatCurrency(row.PaidAmount) },
    { key: "due", header: "Due", render: (row) => formatCurrency(row.DueAmount) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.Status} /> },
  ];

  return (
    <Modal
      isOpen
      title="Registration • Cumulative Visits • Bill"
      onClose={() => onClose?.()}
      width="1200px"
      footer={
        <>
          <Button variant="primary" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      {/* Loading / Error handling */}
      {loading && <Loading text="Loading..." />}
      {error && <Alert tone="danger">{error}</Alert>}

      {/* Data table */}
      {!loading && !error && (
        <DataTable<RegistrationInfo>
          columns={columns}
          rows={data}
          rowKey={(row) => row.RegistrationId}
          emptyText="No records found for the selected period."
        />
      )}
    </Modal>
  );
};
