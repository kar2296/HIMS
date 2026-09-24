/**
 * SERVICES and SERVICE DELIVERY panels.
 *
 * SERVICES          : this visit's lab / radiology / procedure orders grouped by order,
 *                     read from emr/patientorder/GetPatientOrders (Key 2 = PatientId, Key 18 = EncounterId).
 *                     "New order" opens the existing order form (modal "patientemr.patientorder"), which
 *                     already handles service search, tariffs, guarantor rules and billing.
 * SERVICE DELIVERY  : one flat, filterable list (All / Service / Prescription) of everything ordered
 *                     for the visit, with its delivery and billing status -- like the reference screen.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Button } from '../../Button';
import { SkeletonRows } from '../../../components/ui/Loading';
import { Badge, toneForStatus } from '../../../components/ui/Badge';
import { colors, spacing, typography } from '../../../components/ui/tokens';
import type { EmrPanelProps, EmrWorkspaceContext } from '../types';
import { formatDate, formatDateTime } from '../emrHelpers';
import { useAsyncData } from '../useAsyncData';
import { InlineNotice, PanelSection, Segmented, SimpleTable } from '../EmrUi';

interface OrderDetail {
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

interface PatientOrder {
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

const detailsOf = (o: PatientOrder) => (o.PatientOrderDetails || o.PatientOrderDetail || []).filter((d) => !d.IsCanceled);

const statusText = (s?: { DisplayName?: string; Description?: string }) => s?.DisplayName || s?.Description || '';

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

/* ═════════════════════════════ SERVICES ═════════════════════════════ */

export const ServicesPanel: React.FC<EmrPanelProps> = ({ context, canEdit, openLegacyModal, onDataChanged }) => {
  const fetcher = useCallback(() => fetchOrders(context), [context]);
  const { data: orders, loading, error: loadError, reload: load } = useAsyncData<PatientOrder[]>(fetcher, [], { errorMessage: 'Could not load orders.' });

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

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <PanelSection
        title="Ordered services"
        icon="fa-solid fa-flask-vial"
        actions={
          <>
            <Button size="sm" variant="outline-secondary" icon="fa-solid fa-rotate" onClick={load} disabled={loading}>
              Reload
            </Button>
            <Button size="sm" variant="primary" icon="fa-solid fa-plus" onClick={() => openOrderForm(0)} disabled={!canEdit || !openLegacyModal}>
              New order
            </Button>
          </>
        }
      >
        {loading ? (
          <SkeletonRows rows={4} columns={6} />
        ) : loadError ? (
          <InlineNotice tone="danger">{loadError}</InlineNotice>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.textSubtle }}>
            <i className="fa-solid fa-vials" style={{ fontSize: 28, marginBottom: spacing.sm }} aria-hidden="true" />
            <div style={{ ...typography.body }}>No services ordered for this visit.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: spacing.lg }}>
            {orders.map((o) => {
              const lines = detailsOf(o);
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
                  <SimpleTable headers={['Code', 'Service', 'Category', 'Qty', 'Scheduled', 'Instructions', 'Status']} empty={lines.length === 0} emptyText="No service lines">
                    {lines.map((d) => (
                      <tr key={d.Id}>
                        <td style={{ fontFamily: typography.fontFamilyMono }}>{d.TestCode || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{d.TestName || '—'}</td>
                        <td>{d.CategoryName || '—'}</td>
                        <td>{d.Quantity ?? 1}</td>
                        <td>{formatDate(d.ScheduleDate || d.RequestDate)}</td>
                        <td>{d.TestInstruction || '—'}</td>
                        <td>{statusText(d.OrderStatus) ? <Badge tone={toneForStatus(statusText(d.OrderStatus))}>{statusText(d.OrderStatus)}</Badge> : '—'}</td>
                      </tr>
                    ))}
                  </SimpleTable>
                </div>
              );
            })}
          </div>
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
