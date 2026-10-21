import React, { useState, useMemo, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface RadiologyReportsScreenProps {
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: any) => void;
  reactProps?: any;
}

interface ReportItem {
  id: string;
  name: string;
  category: 'Operational' | 'Clinical & TAT' | 'Statistical' | 'Revenue';
  code: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  description: string;
  stateName: string;
  lastGenerated?: string;
}

export const RadiologyReportsScreen: React.FC<RadiologyReportsScreenProps> = ({
  onAction,
  onNavigate,
  reactProps,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const facilityName = sessionHelper.getCurrentFacilityName() || 'SHUVADARSINI HOSPITAL';

  const reports: ReportItem[] = useMemo(
    () => [
      {
        id: 'order_detail',
        name: 'Radiology Order Detail Report',
        category: 'Operational',
        code: 'RAD-RPT-01',
        icon: 'fa-list-alt',
        iconColor: '#0284c7',
        bgColor: '#f0f9ff',
        description:
          'Comprehensive chronological breakdown of all radiology requisitions, imaging accession numbers, modality details, and patient encounters.',
        stateName: 'app.radiologyorderdetailreport',
        lastGenerated: 'Today, 09:15 AM',
      },
      {
        id: 'tat_report',
        name: 'Radiology Turnaround Time (TAT) Analytics',
        category: 'Clinical & TAT',
        code: 'RAD-RPT-02',
        icon: 'fa-clock-o',
        iconColor: '#7c3aed',
        bgColor: '#f5f3ff',
        description:
          'Diagnostic TAT benchmarks measuring duration between order placement, scan capture, radiologist dictation, and report authorization.',
        stateName: 'app.radtatreport',
        lastGenerated: 'Today, 08:30 AM',
      },
      {
        id: 'summary_by_test',
        name: 'Radiology Volume Summary by Investigation',
        category: 'Statistical',
        code: 'RAD-RPT-03',
        icon: 'fa-pie-chart',
        iconColor: '#059669',
        bgColor: '#ecfdf5',
        description:
          'Aggregated modality study volumes across CT, MRI, Digital X-Ray, Ultrasound, Mammography, and Interventional procedures.',
        stateName: 'app.radiologysummarybytest',
        lastGenerated: 'Yesterday',
      },
      {
        id: 'statistics_summary',
        name: 'Radiology Department Statistics Summary',
        category: 'Statistical',
        code: 'RAD-RPT-04',
        icon: 'fa-bar-chart',
        iconColor: '#d97706',
        bgColor: '#fffbeb',
        description:
          'Executive statistical review of inpatient vs outpatient scans, emergency STAT requisitions, contrast vs non-contrast studies, and scanner utilization.',
        stateName: 'app.radiologystatisticssummaryreport',
        lastGenerated: '15 Oct 2026',
      },
      {
        id: 'radiologist_stats',
        name: 'Radiologist Productivity & Sign-off Statistics',
        category: 'Clinical & TAT',
        code: 'RAD-RPT-05',
        icon: 'fa-user-md',
        iconColor: '#2563eb',
        bgColor: '#eff6ff',
        description:
          'Audited report review volume, average reporting turnaround, critical finding flags, and sign-offs categorized per consultant radiologist.',
        stateName: 'app.orderstatisticsradiologistreport',
        lastGenerated: '14 Oct 2026',
      },
      {
        id: 'revenue_report',
        name: 'Radiology Revenue & Billing Schedule Audit',
        category: 'Revenue',
        code: 'RAD-RPT-06',
        icon: 'fa-inr',
        iconColor: '#16a34a',
        bgColor: '#f0fdf4',
        description:
          'Financial reconciliation of department revenue, payer wise billing, cash receipts, corporate credit orders, and outsource referral pricing.',
        stateName: 'app.radiologyrevenuereport',
        lastGenerated: 'Today, 07:00 AM',
      },
    ],
    []
  );

  const categories = ['all', 'Operational', 'Clinical & TAT', 'Statistical', 'Revenue'];

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [reports, selectedCategory, searchQuery]);

  const handleLaunchReport = useCallback(
    (report: ReportItem) => {
      if (onAction) {
        onAction(report.id, report);
      } else if (onNavigate) {
        onNavigate(report.stateName);
      } else {
        try {
          const el = document.querySelector('[ng-controller]') || document.body;
          const $injector = (window as any).angular?.element(el)?.injector();
          const $state = $injector?.get('$state');
          if ($state) {
            $state.go(report.stateName);
            return;
          }
        } catch {
          // ignore
        }
        window.location.hash = `#/${report.stateName.replace(/\./g, '/')}`;
      }
    },
    [onAction, onNavigate]
  );

  const handleBackToDashboard = useCallback(() => {
    if (onAction) {
      onAction('back');
    } else if (onNavigate) {
      onNavigate('app.ris_dashboard');
    } else {
      try {
        const el = document.querySelector('[ng-controller]') || document.body;
        const $injector = (window as any).angular?.element(el)?.injector();
        const $state = $injector?.get('$state');
        if ($state) {
          $state.go('app.ris_dashboard');
          return;
        }
      } catch {
        // ignore
      }
      window.location.hash = '#/app/ris_dashboard';
    }
  }, [onAction, onNavigate]);

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '24px 32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Workstation Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={handleBackToDashboard}
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
            <i className="fa fa-arrow-left" /> RIS Hub
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                Radiology Reports & Clinical Analytics
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                {reports.length} Official Reports
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
              Facility: <b>{facilityName}</b> &bull; Turnaround audits, scan statistics, revenue & radiologist workload
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <i
              className="fa fa-search"
              style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Search reports by title, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid #0284c7' : '1px solid #e2e8f0',
              backgroundColor: selectedCategory === cat ? '#0284c7' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: cat === 'all' ? 'capitalize' : 'none',
            }}
          >
            {cat === 'all' ? 'All Diagnostic Reports' : cat}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredReports.map((report) => (
          <div
            key={report.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: report.bgColor,
                      color: report.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    <i className={`fa ${report.icon}`} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      {report.code}
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '10px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {report.category}
                    </span>
                  </div>
                </div>
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {report.name}
              </h3>
              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.5',
                }}
              >
                {report.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Last Run: <b style={{ color: '#475569' }}>{report.lastGenerated}</b>
              </span>

              <button
                type="button"
                onClick={() => handleLaunchReport(report)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                }}
              >
                Open Report <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
