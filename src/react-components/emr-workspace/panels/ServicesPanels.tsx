/**
 * SERVICES and SERVICE DELIVERY panels.
 *
 * SERVICES          : this visit's lab / radiology / procedure orders grouped by order,
 *                     read from emr/patientorder/GetPatientOrders (Key 2 = PatientId, Key 18 = EncounterId).
 *                     Allows filtering by "All Services", "Laboratory / Investigations",
 *                     "Radiology & Imaging", and "Procedures & Other".
 *                     Also provides an "All Services & Investigations Catalog" browser with
 *                     instant search, category filters, and quick ordering.
 * SERVICE DELIVERY  : one flat, filterable list (All / Service / Prescription) of everything ordered
 *                     for the visit, with its delivery and billing status -- like the reference screen.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Button } from '../../Button';
import { Input } from '../../../components/ui/Input';
import { SkeletonRows } from '../../../components/ui/Loading';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import { colors, radii, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, EmrWorkspaceContext } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, Segmented, SimpleTable } from '../EmrUi';

export interface OrderDetail {
  Id: number;
  TestCode?: string;
  TestName?: string;
  CategoryName?: string;
  Quantity?: number;
  TestPrice?: number;
  DoctorName?: string;
  RequestDate?: string;
  ScheduleDate?: string;
  OrderStatusId?: number;
  OrderStatus?: { DisplayName?: string; Description?: string };
  OrderToLocation?: { DepartmentName?: string };
  IsCanceled?: boolean;
  TestInstruction?: string;
  CreatedAt?: string;
}

export interface PatientOrder {
  Id: number;
  OrderNumber?: string;
  OrderRequestDate?: string;
  OrderedBy?: string;
  OrderStatus?: { DisplayName?: string; Description?: string };
  OrderPriority?: { Description?: string };
  OrderTo?: { DepartmentName?: string };
  BillingStatus?: { Description?: string };
  PatientOrderDetails?: OrderDetail[];
  PatientOrderDetail?: OrderDetail[];
}

export interface CatalogServiceItem {
  id: number;
  code: string;
  name: string;
  category: string;
  department: string;
  price: number;
  kind: 'investigation' | 'radiology' | 'procedure';
}

/** Order status 2 = Cancelled. (IsCanceled is not reliable: older order-form saves stored 1 on active lines.) */
const CANCELLED_STATUS = 2;
const isCancelledLine = (d: OrderDetail) => d.OrderStatusId === CANCELLED_STATUS;
const detailsOf = (o: PatientOrder) => (o.PatientOrderDetails || o.PatientOrderDetail || []).filter((d) => !isCancelledLine(d));

const statusText = (s?: { DisplayName?: string; Description?: string }) => s?.DisplayName || s?.Description || '';

export type ServiceCategoryFilter = 'all' | 'investigation' | 'radiology' | 'procedure';

export const classifyService = (code?: string, name?: string, catOrDept?: string): 'investigation' | 'radiology' | 'procedure' => {
  const c = (code || '').toUpperCase();
  const n = (name || '').toUpperCase();
  const d = (catOrDept || '').toUpperCase();

  // Radiology & Imaging
  if (
    c.startsWith('RAD-') || c.startsWith('XRAY-') || c.startsWith('CT-') || c.startsWith('MRI-') || c.startsWith('USG-') || c.startsWith('ECG-') ||
    n.includes('X-RAY') || n.includes('XRAY') || n.includes('CT SCAN') || n.includes('CECT') || n.includes('HRCT') || n.includes('MRI') ||
    n.includes('ULTRASOUND') || n.includes('USG') || n.includes('SONO') || n.includes('ECG') || n.includes('ECHO') || n.includes('MAMMOGRAPHY') ||
    d.includes('RADIOLOGY') || d.includes('IMAGING') || d.includes('X-RAY')
  ) {
    return 'radiology';
  }

  // Laboratory / Investigations
  if (
    c.startsWith('LAB-') || c.startsWith('BIO-') || c.startsWith('HEM-') || c.startsWith('PAT-') || c.startsWith('MIC-') ||
    n.includes('TEST') || n.includes('PANEL') || n.includes('COUNT') || n.includes('PROFILE') || n.includes('BLOOD') || n.includes('SERUM') ||
    n.includes('URINE') || n.includes('STOOL') || n.includes('LIVER') || n.includes('KIDNEY') || n.includes('RENAL') || n.includes('LIPID') ||
    n.includes('THYROID') || n.includes('CULTURE') || n.includes('CBC') || n.includes('LFT') || n.includes('KFT') || n.includes('ESR') ||
    n.includes('HBA1C') || n.includes('ELECTROLYTES') || n.includes('GLUCOSE') ||
    d.includes('LABORATORY') || d.includes('PATHOLOGY') || d.includes('BIOCHEMISTRY') || d.includes('MICROBIOLOGY') || d.includes('HAEMATOLOGY')
  ) {
    return 'investigation';
  }

  // Procedures & Other
  return 'procedure';
};

const STANDARD_CATALOG_FALLBACK: CatalogServiceItem[] = [
  { id: 101, code: 'LAB-00433', name: 'CBC (COMPLETE BLOOD COUNT)', category: 'Hematology', department: 'Laboratory Medicine', price: 450, kind: 'investigation' },
  { id: 102, code: 'LAB-00238', name: 'LIVER FUNCTION TEST [PANEL]', category: 'Biochemistry', department: 'Laboratory Medicine', price: 950, kind: 'investigation' },
  { id: 103, code: 'LAB-00105', name: 'RENAL / KIDNEY FUNCTION TEST (KFT)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 850, kind: 'investigation' },
  { id: 104, code: 'LAB-00120', name: 'LIPID PROFILE [PANEL]', category: 'Biochemistry', department: 'Laboratory Medicine', price: 750, kind: 'investigation' },
  { id: 105, code: 'LAB-00145', name: 'THYROID PROFILE (T3, T4, TSH)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 650, kind: 'investigation' },
  { id: 106, code: 'LAB-00101', name: 'BLOOD GLUCOSE - FASTING (FBS)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 120, kind: 'investigation' },
  { id: 107, code: 'LAB-00102', name: 'BLOOD GLUCOSE - POST PRANDIAL (PPBS)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 120, kind: 'investigation' },
  { id: 108, code: 'LAB-00180', name: 'GLYCOSYLATED HEMOGLOBIN (HbA1c)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 550, kind: 'investigation' },
  { id: 109, code: 'LAB-00115', name: 'URINE ROUTINE & MICROSCOPY', category: 'Clinical Pathology', department: 'Laboratory Medicine', price: 180, kind: 'investigation' },
  { id: 110, code: 'LAB-00130', name: 'SERUM ELECTROLYTES (Na+, K+, Cl-)', category: 'Biochemistry', department: 'Laboratory Medicine', price: 480, kind: 'investigation' },
  { id: 111, code: 'LAB-00510', name: 'ERYTHROCYTE SEDIMENTATION RATE (ESR)', category: 'Hematology', department: 'Laboratory Medicine', price: 150, kind: 'investigation' },
  { id: 112, code: 'LAB-00520', name: 'WIDAL TEST (SLIDE METHOD)', category: 'Serology', department: 'Laboratory Medicine', price: 280, kind: 'investigation' },
  { id: 113, code: 'LAB-00530', name: 'DENGUE NS1 AG & IGG/IGM ANTIBODY', category: 'Serology', department: 'Laboratory Medicine', price: 900, kind: 'investigation' },
  { id: 114, code: 'LAB-00540', name: 'BLOOD CULTURE & SENSITIVITY (AEROBIC)', category: 'Microbiology', department: 'Laboratory Medicine', price: 1100, kind: 'investigation' },
  { id: 115, code: 'LAB-00550', name: 'URINE CULTURE & SENSITIVITY', category: 'Microbiology', department: 'Laboratory Medicine', price: 800, kind: 'investigation' },

  { id: 201, code: 'RAD-00010', name: 'X-RAY CHEST PA VIEW', category: 'General Radiology', department: 'Radiology & Imaging', price: 350, kind: 'radiology' },
  { id: 202, code: 'RAD-00012', name: 'X-RAY KNEE JOINT AP/LATERAL', category: 'General Radiology', department: 'Radiology & Imaging', price: 550, kind: 'radiology' },
  { id: 203, code: 'RAD-00015', name: 'X-RAY CERVICAL SPINE AP/LATERAL', category: 'General Radiology', department: 'Radiology & Imaging', price: 600, kind: 'radiology' },
  { id: 204, code: 'RAD-00020', name: 'X-RAY LUMBAR SPINE AP/LATERAL', category: 'General Radiology', department: 'Radiology & Imaging', price: 600, kind: 'radiology' },
  { id: 205, code: 'CT-00016', name: 'CT SCAN - CECT ANKLE (BOTH)', category: 'Computed Tomography', department: 'Radiology & Imaging', price: 4200, kind: 'radiology' },
  { id: 206, code: 'CT-00010', name: 'CT SCAN - BRAIN / HEAD (PLAIN)', category: 'Computed Tomography', department: 'Radiology & Imaging', price: 2800, kind: 'radiology' },
  { id: 207, code: 'CT-00025', name: 'CT SCAN - THORAX / CHEST (HRCT)', category: 'Computed Tomography', department: 'Radiology & Imaging', price: 4500, kind: 'radiology' },
  { id: 208, code: 'CT-00030', name: 'CT SCAN - WHOLE ABDOMEN & PELVIS', category: 'Computed Tomography', department: 'Radiology & Imaging', price: 5800, kind: 'radiology' },
  { id: 209, code: 'MRI-00060', name: 'MRI - PITUITARY DYNAMIC SCAN', category: 'Magnetic Resonance', department: 'Radiology & Imaging', price: 6500, kind: 'radiology' },
  { id: 210, code: 'MRI-00010', name: 'MRI - BRAIN (PLAIN & CONTRAST)', category: 'Magnetic Resonance', department: 'Radiology & Imaging', price: 6800, kind: 'radiology' },
  { id: 211, code: 'MRI-00020', name: 'MRI - LUMBO-SACRAL SPINE', category: 'Magnetic Resonance', department: 'Radiology & Imaging', price: 5800, kind: 'radiology' },
  { id: 212, code: 'USG-00010', name: 'ULTRASOUND (USG) WHOLE ABDOMEN', category: 'Ultrasonography', department: 'Radiology & Imaging', price: 1200, kind: 'radiology' },
  { id: 213, code: 'USG-00020', name: 'ULTRASOUND (USG) PELVIS / OBS', category: 'Ultrasonography', department: 'Radiology & Imaging', price: 1100, kind: 'radiology' },
  { id: 214, code: 'CARD-0001', name: '12-LEAD ELECTROCARDIOGRAM (ECG)', category: 'Non-Invasive Cardiology', department: 'Cardiology', price: 250, kind: 'radiology' },
  { id: 215, code: 'CARD-0002', name: '2D ECHOCARDIOGRAPHY WITH COLOR DOPPLER', category: 'Non-Invasive Cardiology', department: 'Cardiology', price: 2200, kind: 'radiology' },

  { id: 301, code: 'PROC-0001', name: 'WOUND DRESSING (MINOR)', category: 'Nursing Care', department: 'Ambulatory / OPD', price: 200, kind: 'procedure' },
  { id: 302, code: 'PROC-0002', name: 'INTRAVENOUS (IV) CANNULATION', category: 'Nursing Procedures', department: 'Ambulatory / OPD', price: 150, kind: 'procedure' },
  { id: 303, code: 'PROC-0003', name: 'SUTURE REMOVAL & STERILE DRESSING', category: 'Minor OT Procedures', department: 'General Surgery', price: 300, kind: 'procedure' },
  { id: 304, code: 'PROC-0004', name: 'FOLEY URINARY CATHETERIZATION', category: 'Nursing Procedures', department: 'Ambulatory / OPD', price: 400, kind: 'procedure' },
  { id: 305, code: 'PROC-0005', name: 'NEBULIZATION THERAPY (PER SESSION)', category: 'Respiratory Care', department: 'Pulmonology', price: 180, kind: 'procedure' },
];

async function fetchOrders(context: EmrWorkspaceContext): Promise<PatientOrder[]> {
  if (!context.encounterId) return [];
  const res = await apiFetch('emr/patientorder/GetPatientOrders', {
    Params: [
      { Key: 2, Value: context.patientId },
      { Key: 18, Value: context.encounterId },
    ],
    PageContext: { PageSize: 100, PageNumber: 1 },
  });
  return res?.Data || [];
}

async function fetchPrescriptions(context: EmrWorkspaceContext): Promise<any[]> {
  if (!context.encounterId) return [];
  const res = await apiFetch('emr/prescription/GetPrescriptions', {
    Params: [
      { Key: 2, Value: context.patientId },
      { Key: 12, Value: context.encounterId },
    ],
    PageContext: { PageSize: 50, PageNumber: 1 },
  });
  return res?.Data || [];
}

async function fetchCatalogServices(facilityId?: number): Promise<CatalogServiceItem[]> {
  try {
    const [testRes, serviceRes] = await Promise.all([
      apiFetch('lis/testmaster/GetTestmasters', {
        Params: [
          { Key: 6, Value: 2 }, // Active
          { Key: 8, Value: { ServiceRateCategoryId: 1, FacilityId: facilityId || 1 } },
        ],
        PageContext: { PageSize: 100, PageNumber: 1 },
      }).catch(() => null),
      apiFetch('ClinicalMaster/ServiceItem/GetServiceItems', {
        Params: [{ Key: 6, Value: 2 }],
        PageContext: { PageSize: 100, PageNumber: 1 },
      }).catch(() => null),
    ]);

    const collected: CatalogServiceItem[] = [];
    const seenCodes = new Set<string>();

    const tests = testRes?.Data || [];
    tests.forEach((t: any) => {
      const code = t.Code || `TEST-${t.Id}`;
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        const name = t.Name || '';
        const dept = t.Department?.DepartmentName || 'Laboratory Medicine';
        collected.push({
          id: t.Id,
          code,
          name,
          category: t.Sampletype?.Name || t.Department?.DepartmentName || 'Laboratory',
          department: dept,
          price: t.ServiceItem?.ServiceItemTariffDetails?.[0]?.Rate ?? t.Price ?? 0,
          kind: classifyService(code, name, dept),
        });
      }
    });

    const items = serviceRes?.Data || [];
    items.forEach((s: any) => {
      const code = s.ItemCode || s.ShortCode || `SRV-${s.Id}`;
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        const name = s.Name || '';
        const dept = s.Department?.DepartmentName || s.ParentCategory?.ServiceCategoryName || 'Clinical Service';
        collected.push({
          id: s.Id,
          code,
          name,
          category: s.ParentCategory?.ServiceCategoryName || s.Department?.DepartmentName || 'General Service',
          department: dept,
          price: s.ServiceItemTariffDetails?.[0]?.Rate ?? 0,
          kind: classifyService(code, name, dept),
        });
      }
    });

    // Merge standard items if fewer than 5 items returned from backend
    if (collected.length < 5) {
      STANDARD_CATALOG_FALLBACK.forEach((item) => {
        if (!seenCodes.has(item.code)) {
          seenCodes.add(item.code);
          collected.push(item);
        }
      });
    }

    return collected;
  } catch (e) {
    console.error('Error fetching catalog services:', e);
    return STANDARD_CATALOG_FALLBACK;
  }
}

/* ═════════════════════════════ SERVICES ═════════════════════════════ */

export const ServicesPanel: React.FC<EmrPanelProps> = ({ context, canEdit, openLegacyModal, onDataChanged }) => {
  const fetcher = useCallback(() => fetchOrders(context), [context]);
  const { data: orders, loading: ordersLoading, error: loadError, reload: load } = useAsyncData<PatientOrder[]>(fetcher, [], { errorMessage: 'Could not load orders.' });

  const [viewMode, setViewMode] = useState<'ordered' | 'catalog'>('ordered');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog data
  const [catalog, setCatalog] = useState<CatalogServiceItem[]>(STANDARD_CATALOG_FALLBACK);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    fetchCatalogServices(context.facilityId)
      .then((items) => {
        if (active) setCatalog(items);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, [context.facilityId]);

  const openOrderForm = (id: number) => {
    openLegacyModal?.(
      'patientemr.patientorder',
      { id, pid: context.patientId, eid: context.encounterId, cid: context.consultationId, context: 'emr', startTab: 'detail' },
      () => {
        load();
        onDataChanged?.('services');
      },
    );
  };

  // Flatten active order lines to count and filter
  const allOrderedLines = useMemo(() => {
    return orders.flatMap((o) => detailsOf(o).map((d) => ({ ...d, order: o })));
  }, [orders]);

  const filteredOrderedLinesCount = useMemo(() => {
    return allOrderedLines.filter((d) => {
      if (categoryFilter !== 'all') {
        const kind = classifyService(d.TestCode, d.TestName, d.CategoryName || d.order?.OrderTo?.DepartmentName);
        if (kind !== categoryFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (d.TestCode || '').toLowerCase().includes(q) || (d.TestName || '').toLowerCase().includes(q) || (d.CategoryName || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).length;
  }, [allOrderedLines, categoryFilter, searchQuery]);

  // Catalog filtered items
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      if (categoryFilter !== 'all' && item.kind !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.department.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [catalog, categoryFilter, searchQuery]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    if (viewMode === 'ordered') {
      return {
        all: allOrderedLines.length,
        investigation: allOrderedLines.filter((l) => classifyService(l.TestCode, l.TestName, l.CategoryName || l.order?.OrderTo?.DepartmentName) === 'investigation').length,
        radiology: allOrderedLines.filter((l) => classifyService(l.TestCode, l.TestName, l.CategoryName || l.order?.OrderTo?.DepartmentName) === 'radiology').length,
        procedure: allOrderedLines.filter((l) => classifyService(l.TestCode, l.TestName, l.CategoryName || l.order?.OrderTo?.DepartmentName) === 'procedure').length,
      };
    } else {
      return {
        all: catalog.length,
        investigation: catalog.filter((i) => i.kind === 'investigation').length,
        radiology: catalog.filter((i) => i.kind === 'radiology').length,
        procedure: catalog.filter((i) => i.kind === 'procedure').length,
      };
    }
  }, [viewMode, allOrderedLines, catalog]);

  return (
    <div style={{ display: 'grid', gap: spacing.md }}>
      <PanelSection
        title={viewMode === 'ordered' ? 'Ordered Services & Investigations' : 'All Services & Investigations Catalog'}
        icon={viewMode === 'ordered' ? 'fa-solid fa-flask-vial' : 'fa-solid fa-list-check'}
        actions={
          <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
            <Segmented<'ordered' | 'catalog'>
              ariaLabel="View Mode"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'ordered', label: `Ordered (${allOrderedLines.length})` },
                { value: 'catalog', label: `All Services Catalog (${catalog.length})` },
              ]}
            />
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={load} disabled={ordersLoading || catalogLoading}>
              Reload
            </Button>
            <Button size="sm" variant="primary" icon="fa-solid fa-plus" onClick={() => openOrderForm(0)} disabled={!canEdit || !openLegacyModal}>
              New order
            </Button>
          </div>
        }
      >
        {/* Category Filter Buttons & Live Search Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', marginBottom: spacing.md }}>
          <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
            {[
              { id: 'all' as ServiceCategoryFilter, label: 'All Services', icon: 'fa-solid fa-layer-group', count: categoryCounts.all },
              { id: 'investigation' as ServiceCategoryFilter, label: 'Laboratory / Investigations', icon: 'fa-solid fa-flask', count: categoryCounts.investigation },
              { id: 'radiology' as ServiceCategoryFilter, label: 'Radiology & Imaging', icon: 'fa-solid fa-x-ray', count: categoryCounts.radiology },
              { id: 'procedure' as ServiceCategoryFilter, label: 'Procedures & Other', icon: 'fa-solid fa-syringe', count: categoryCounts.procedure },
            ].map((cat) => {
              const selected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: radii.pill,
                    border: `1px solid ${selected ? colors.primary : colors.border}`,
                    backgroundColor: selected ? colors.primary : '#fff',
                    color: selected ? '#fff' : colors.textBody,
                    fontSize: '13px',
                    fontWeight: selected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <i className={cat.icon} style={{ fontSize: 12, opacity: selected ? 1 : 0.7 }} />
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: radii.pill,
                      backgroundColor: selected ? 'rgba(255, 255, 255, 0.25)' : colors.surfaceMuted,
                      color: selected ? '#fff' : colors.textMuted,
                      marginLeft: 2,
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ width: 'min(320px, 100%)' }}>
            <Input
              size="sm"
              leftIcon="fa-solid fa-magnifying-glass"
              placeholder={viewMode === 'ordered' ? 'Filter ordered services...' : 'Search all services by name or code...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ORDERED SERVICES VIEW */}
        {viewMode === 'ordered' && (
          <>
            {ordersLoading ? (
              <SkeletonRows rows={4} columns={6} />
            ) : loadError ? (
              <InlineNotice tone="danger">{loadError}</InlineNotice>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.textSubtle, background: colors.surfaceMuted, borderRadius: radii.md }}>
                <i className="fa-solid fa-vials" style={{ fontSize: 32, marginBottom: spacing.sm, color: colors.primaryMid }} aria-hidden="true" />
                <div style={{ ...typography.h4, color: colors.textMain, marginBottom: spacing.xs }}>No services ordered yet for this visit</div>
                <div style={{ ...typography.body, color: colors.textMuted, marginBottom: spacing.md }}>
                  You can order lab tests, radiology scans, or procedures directly.
                </div>
                <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
                  <Button size="sm" variant="primary" icon="fa-solid fa-plus" onClick={() => openOrderForm(0)} disabled={!canEdit || !openLegacyModal}>
                    New Order Form
                  </Button>
                  <Button size="sm" variant="outline-primary" icon="fa-solid fa-list-check" onClick={() => setViewMode('catalog')}>
                    Browse All Services Catalog
                  </Button>
                </div>
              </div>
            ) : filteredOrderedLinesCount === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing.lg, color: colors.textSubtle, background: colors.surfaceMuted, borderRadius: radii.md }}>
                <i className="fa-solid fa-filter" style={{ fontSize: 24, marginBottom: spacing.xs }} />
                <div style={{ ...typography.body, color: colors.textMuted }}>No ordered services match the selected filter or search.</div>
                <div style={{ marginTop: spacing.sm }}>
                  <Button size="xs" variant="outline-secondary" onClick={() => { setCategoryFilter('all'); setSearchQuery(''); }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: spacing.lg }}>
                {orders.map((o) => {
                  const allLines = detailsOf(o);
                  const matchingLines = allLines.filter((d) => {
                    if (categoryFilter !== 'all') {
                      const kind = classifyService(d.TestCode, d.TestName, d.CategoryName || o.OrderTo?.DepartmentName);
                      if (kind !== categoryFilter) return false;
                    }
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const matches = (d.TestCode || '').toLowerCase().includes(q) || (d.TestName || '').toLowerCase().includes(q) || (d.CategoryName || '').toLowerCase().includes(q);
                      if (!matches) return false;
                    }
                    return true;
                  });

                  if (matchingLines.length === 0) return null;

                  return (
                    <div key={o.Id} className="emrws-subcard">
                      <div className="emrws-subcard-head">
                        <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
                          <strong style={{ color: colors.textMain }}>{o.OrderNumber || `Order #${o.Id}`}</strong>
                          <span style={{ ...typography.caption, color: colors.textMuted }}>{formatDateTime(o.OrderRequestDate)}</span>
                          {o.OrderTo?.DepartmentName && <span style={{ ...typography.caption, color: colors.textMuted }}>→ {o.OrderTo.DepartmentName}</span>}
                          {o.OrderedBy && <span style={{ ...typography.caption, color: colors.textMuted }}>by {o.OrderedBy}</span>}
                          {o.OrderPriority?.Description && <Badge tone="info">{o.OrderPriority.Description}</Badge>}
                          {statusText(o.OrderStatus) && <Badge tone={toneForStatus(statusText(o.OrderStatus))}>{statusText(o.OrderStatus)}</Badge>}
                        </div>
                        <Button size="xs" variant="outline-primary" icon="fa-solid fa-pen" onClick={() => openOrderForm(o.Id)} disabled={!openLegacyModal}>
                          Open
                        </Button>
                      </div>
                      <SimpleTable headers={['Code', 'Service / Test Name', 'Category', 'Qty', 'Scheduled', 'Instructions', 'Status']} empty={matchingLines.length === 0} emptyText="No service lines">
                        {matchingLines.map((d) => {
                          const kind = classifyService(d.TestCode, d.TestName, d.CategoryName);
                          const icon = kind === 'investigation' ? 'fa-flask' : kind === 'radiology' ? 'fa-x-ray' : 'fa-syringe';
                          return (
                            <tr key={d.Id}>
                              <td style={{ fontFamily: typography.fontFamilyMono }}>{d.TestCode || '—'}</td>
                              <td style={{ fontWeight: 600 }}>
                                <i className={`fa-solid ${icon}`} style={{ marginRight: 6, color: colors.textSubtle }} />
                                {d.TestName || '—'}
                              </td>
                              <td>{d.CategoryName || o.OrderTo?.DepartmentName || '—'}</td>
                              <td>{d.Quantity ?? 1}</td>
                              <td>{formatDate(d.ScheduleDate || d.RequestDate)}</td>
                              <td>{d.TestInstruction || '—'}</td>
                              <td>{statusText(d.OrderStatus) ? <Badge tone={toneForStatus(statusText(d.OrderStatus))}>{statusText(d.OrderStatus)}</Badge> : '—'}</td>
                            </tr>
                          );
                        })}
                      </SimpleTable>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ALL SERVICES & INVESTIGATIONS CATALOG VIEW */}
        {viewMode === 'catalog' && (
          <>
            {catalogLoading ? (
              <SkeletonRows rows={8} columns={5} />
            ) : filteredCatalog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.textSubtle, background: colors.surfaceMuted, borderRadius: radii.md }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 28, marginBottom: spacing.sm }} />
                <div style={{ ...typography.body, color: colors.textMuted }}>No services match "{searchQuery}" in this category.</div>
                <div style={{ marginTop: spacing.sm }}>
                  <Button size="xs" variant="outline-secondary" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}>
                    Show All Catalog Services
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: radii.md }}>
                <SimpleTable headers={['Code', 'Service / Investigation', 'Department & Category', 'Type', 'Price (Tariff)', 'Action']} empty={false}>
                  {filteredCatalog.map((item) => {
                    const kindBadge =
                      item.kind === 'investigation'
                        ? { tone: 'info' as const, label: 'Investigation / Lab' }
                        : item.kind === 'radiology'
                          ? { tone: 'primary' as const, label: 'Radiology / Imaging' }
                          : { tone: 'neutral' as const, label: 'Procedure / Nursing' };

                    return (
                      <tr key={`${item.kind}-${item.id}-${item.code}`}>
                        <td style={{ fontFamily: typography.fontFamilyMono, fontWeight: 600 }}>{item.code}</td>
                        <td style={{ fontWeight: 600, color: colors.textMain }}>
                          <i
                            className={`fa-solid ${item.kind === 'investigation' ? 'fa-flask' : item.kind === 'radiology' ? 'fa-x-ray' : 'fa-syringe'}`}
                            style={{ marginRight: 8, color: colors.textSubtle }}
                          />
                          {item.name}
                        </td>
                        <td>
                          <div>{item.department}</div>
                          <div style={{ ...typography.caption, color: colors.textMuted }}>{item.category}</div>
                        </td>
                        <td>
                          <Badge tone={kindBadge.tone}>{kindBadge.label}</Badge>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {item.price > 0 ? `₹${item.price.toFixed(2)}` : 'Tariff Standard'}
                        </td>
                        <td>
                          <Button
                            size="xs"
                            variant="primary"
                            icon="fa-solid fa-cart-plus"
                            disabled={!canEdit || !openLegacyModal}
                            onClick={() => openOrderForm(0)}
                          >
                            + Order
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </SimpleTable>
              </div>
            )}
          </>
        )}
      </PanelSection>
    </div>
  );
};

/* ═════════════════════════════ SERVICE DELIVERY ═════════════════════════════ */

type DeliveryFilter = 'all' | 'service' | 'prescription';

interface DeliveryLine {
  key: string;
  kind: 'service' | 'prescription';
  group: string;
  description: string;
  quantity?: number | string;
  startDate?: string;
  addedBy?: string;
  addedAt?: string;
  status?: string;
}

export const ServiceDeliveryPanel: React.FC<EmrPanelProps> = ({ context }) => {
  const [filter, setFilter] = useState<DeliveryFilter>('all');

  const fetcher = useCallback(async (): Promise<DeliveryLine[]> => {
    // Orders and prescriptions are independent reads.
    const [orders, prescriptions] = await Promise.all([fetchOrders(context), fetchPrescriptions(context)]);
    const next: DeliveryLine[] = [];
    orders.forEach((o) =>
      detailsOf(o).forEach((d) =>
        next.push({
          key: `s-${d.Id}`,
          kind: 'service',
          group: d.CategoryName || o.OrderTo?.DepartmentName || 'Service',
          description: [d.TestCode, d.TestName].filter(Boolean).join(' – ') || '—',
          quantity: d.Quantity ?? 1,
          startDate: d.ScheduleDate || d.RequestDate || o.OrderRequestDate,
          addedBy: d.DoctorName || o.OrderedBy,
          addedAt: d.CreatedAt || o.OrderRequestDate,
          status: statusText(d.OrderStatus) || statusText(o.OrderStatus),
        }),
      ),
    );
    prescriptions.forEach((p: any) =>
      (p.PrescriptionDetails || p.PrescriptionDetail || [])
        .filter((d: any) => d.Status === undefined || d.Status === 1)
        .forEach((d: any) =>
          next.push({
            key: `p-${d.Id}`,
            kind: 'prescription',
            group: 'Medication',
            description: d.DrugName || '—',
            quantity: d.Quantity,
            startDate: d.StartDate || p.PrescriptionDate,
            addedBy: [p.Doctor?.FirstName, p.Doctor?.LastName].filter(Boolean).join(' ') || undefined,
            addedAt: p.PrescriptionDate,
            status: p.PrecriptionStatus?.Description,
          }),
        ),
    );
    return next;
  }, [context]);
  const { data: lines, loading, error: loadError, reload: load } = useAsyncData<DeliveryLine[]>(fetcher, [], { errorMessage: 'Could not load service delivery.' });

  const visible = useMemo(() => (filter === 'all' ? lines : lines.filter((l) => l.kind === filter)), [lines, filter]);
  const groups = useMemo(() => {
    const map = new Map<string, DeliveryLine[]>();
    visible.forEach((l) => map.set(l.group, [...(map.get(l.group) || []), l]));
    return Array.from(map.entries());
  }, [visible]);

  const counts = {
    all: lines.length,
    service: lines.filter((l) => l.kind === 'service').length,
    prescription: lines.filter((l) => l.kind === 'prescription').length,
  };

  return (
    <PanelSection
      title="Service delivery"
      icon="fa-solid fa-truck-medical"
      flush
      actions={
        <>
          <Segmented<DeliveryFilter>
            ariaLabel="Filter delivery lines"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All (${counts.all})` },
              { value: 'service', label: `Service (${counts.service})` },
              { value: 'prescription', label: `Prescription (${counts.prescription})` },
            ]}
          />
          <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={load} disabled={loading}>
            Reload
          </Button>
        </>
      }
    >
      {loading ? (
        <div style={{ padding: spacing.lg }}>
          <SkeletonRows rows={4} columns={6} />
        </div>
      ) : loadError ? (
        <div style={{ padding: spacing.lg }}>
          <InlineNotice tone="danger">{loadError}</InlineNotice>
        </div>
      ) : (
        <SimpleTable headers={['Service / Medication', 'Qty', 'Start date', 'Added by', 'Added at', 'Status']} empty={visible.length === 0} emptyText="Nothing to deliver for this visit">
          {groups.map(([group, rows]) => (
            <React.Fragment key={group}>
              <tr className="emrws-group-row">
                <td colSpan={6}>
                  Group: <strong>{group}</strong>
                </td>
              </tr>
              {rows.map((l) => (
                <tr key={l.key}>
                  <td>
                    <i className={l.kind === 'service' ? 'fa-solid fa-flask-vial' : 'fa-solid fa-pills'} style={{ color: colors.textSubtle, marginRight: 6 }} aria-hidden="true" />
                    {l.description}
                  </td>
                  <td>{l.quantity ?? '—'}</td>
                  <td>{formatDate(l.startDate)}</td>
                  <td>{l.addedBy || '—'}</td>
                  <td>{formatDateTime(l.addedAt)}</td>
                  <td>{l.status ? <Badge tone={toneForStatus(l.status)}>{l.status}</Badge> : '—'}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </SimpleTable>
      )}
    </PanelSection>
  );
};
