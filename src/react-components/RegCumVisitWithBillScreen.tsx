import React, { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";
import { Button } from "./Button";

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(225,235,255,0.6) 100%)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        zIndex: 200,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          borderRadius: "var(--radius-lg)",
          maxWidth: "1200px",
          width: "100%",
          padding: "32px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--premium-blue)",
              fontWeight: 700,
              fontSize: "24px",
            }}
          >
            Registration • Cumulative Visits • Bill
          </h2>
          <Button variant="secondary" onClick={onClose} style={{ minWidth: "80px" }}>
            Close
          </Button>
        </div>

        {/* Loading / Error handling */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#21008d" }} />
          </div>
        )}
        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />
            {error}
          </div>
        )}

        {/* Data table */}
        {!loading && !error && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead style={{ backgroundColor: "var(--premium-blue)", color: "#fff" }}>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Reg. No.</th>
                  <th style={thStyle}>Patient</th>
                  <th style={thStyle}>Age / Gender</th>
                  <th style={thStyle}>Visit Date</th>
                  <th style={thStyle}>Bill</th>
                  <th style={thStyle}>Paid</th>
                  <th style={thStyle}>Due</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={row.RegistrationId}
                    style={{
                      backgroundColor: idx % 2 ? "#f9fafc" : "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--premium-bg-light)")}
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor = idx % 2 ? "var(--premium-bg-light)" : "#fff")
                    }
                  >
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{row.RegistrationNumber}</td>
                    <td style={tdStyle}>{row.PatientName}</td>
                    <td style={tdStyle}>
                      {row.Age} / {row.Gender}
                    </td>
                    <td style={tdStyle}>{formatDate(row.VisitDate)}</td>
                    <td style={tdStyle}>{formatCurrency(row.BillAmount)}</td>
                    <td style={tdStyle}>{formatCurrency(row.PaidAmount)}</td>
                    <td style={tdStyle}>{formatCurrency(row.DueAmount)}</td>
                    <td style={tdStyle}>{row.Status}</td>
                  </tr>
                ))}

                {data.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                      No records found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom action bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
          <Button
            variant="primary"
            style={{ backgroundColor: "#0056b3", marginRight: "12px" }}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

/* Table cell styles – shared across the component */
const thStyle: React.CSSProperties = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 8px",
  textAlign: "left",
  borderBottom: "1px solid #eaeaea",
};
