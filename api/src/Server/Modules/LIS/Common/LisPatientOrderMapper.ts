/**
 * Adapter between the legacy LIS order screens (public/views/lis/*) and the current order tables.
 *
 * The LIS screens were written for an older "patientorders" API with different field names
 * (Ordernumber, Orderrequestdate, Orderstatuse, PriorityStatus, ...). The data itself lives in the
 * same tables the EMR order module uses (patientorders / patientorderdetails), so these pure
 * functions translate requests and records in both directions. No database access here.
 */
import { PatientOrderFilters, PatientOrderDetailFilters } from '../../EMR/Common/Filters.e';

/** Keys sent by the legacy list screens to lis/patientorders/GetPatientOrders. */
export enum LisPatientOrderKeys {
    Id = 0,
    ParentDept = 1,     // 1 = Lab, 2 = Radiology, 3 = Other  -> patientorders.TestTypeId
    RequestDate = 2,    // ['yyyy-MM-dd 00:00:00', 'yyyy-MM-dd 23:59:59']
    OrderStatus = 3,    // -1 = all
    OrderNumber = 4,    // -1 = all
    Priority = 5        // -1 = all
}

/** Order-line status codes used by the order module (see PatientWorkorderBo.AcceptOrder / CancelOrder). */
export const ORDER_STATUS = { ORDERED: 1, CANCELLED: 2, ACCEPTED: 10 };

export interface ParamItem { Key: number; Value: any; }

const isSet = (value: any): boolean =>
    value !== undefined && value !== null && value !== '' && String(value) !== '-1';

/** Translates the legacy list request into an EMR PatientOrder request. */
export function toPatientOrderRequest(legacy: any): any {
    const params: ParamItem[] = [];
    ((legacy && legacy.Params) || []).forEach((p: ParamItem) => {
        switch (Number(p.Key)) {
            case LisPatientOrderKeys.Id:
                if (isSet(p.Value)) { params.push({ Key: PatientOrderFilters.Id, Value: Number(p.Value) }); }
                break;
            case LisPatientOrderKeys.ParentDept:
                if (isSet(p.Value) && Number(p.Value) > 0) { params.push({ Key: PatientOrderFilters.TestType, Value: Number(p.Value) }); }
                break;
            case LisPatientOrderKeys.RequestDate:
                if (Array.isArray(p.Value) && p.Value.length === 2 && p.Value[0] && p.Value[1]) {
                    params.push({ Key: PatientOrderFilters.OrderReqDate, Value: [p.Value[0], p.Value[1]] });
                }
                break;
            case LisPatientOrderKeys.OrderStatus:
                if (isSet(p.Value)) { params.push({ Key: PatientOrderFilters.OrderStatus, Value: p.Value }); }
                break;
            case LisPatientOrderKeys.OrderNumber:
                if (isSet(p.Value)) { params.push({ Key: PatientOrderFilters.OrderNumber, Value: String(p.Value).trim() }); }
                break;
            case LisPatientOrderKeys.Priority:
                if (isSet(p.Value)) { params.push({ Key: PatientOrderFilters.OrderPriority, Value: Number(p.Value) }); }
                break;
            default:
                break; // unknown legacy keys are ignored rather than passed through
        }
    });
    return {
        Params: params,
        PageContext: legacy && legacy.PageContext ? legacy.PageContext : { PageSize: 25, PageNumber: 1 }
    };
}

/** Translates the legacy detail request (Key 0 = patient order id) into an EMR PatientOrderDetail request. */
export function toPatientOrderDetailRequest(legacy: any): any {
    const orderParam = ((legacy && legacy.Params) || []).find((p: ParamItem) => Number(p.Key) === 0);
    const orderId = orderParam ? Number(orderParam.Value) : 0;
    if (!(orderId > 0)) {
        throw new Error('Patient order id is required.');
    }
    return {
        Params: [
            { Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId },
            { Key: PatientOrderDetailFilters.IncludeTestMaster, Value: true }
        ],
        PageContext: legacy && legacy.PageContext ? legacy.PageContext : { PageSize: 100, PageNumber: 1 }
    };
}

const plain = (row: any): any => (row && typeof row.get === 'function' ? row.get({ plain: true }) : JSON.parse(JSON.stringify(row || {})));

/** "Dr. First Last" from a User row (with its Title reference), or ''. */
export function doctorName(user: any): string {
    if (!user) {
        return '';
    }
    const title = user.Title && user.Title.Description ? user.Title.Description : '';
    return [title, user.FirstName, user.LastName].filter((part: any) => !!part).join(' ');
}

/** Order header in the shape the legacy list screens read. */
export function toLegacyOrder(row: any): any {
    const o = plain(row);
    const details: any[] = o.PatientOrderDetails || [];
    const testNames = details.map((d: any) => d.TestName).filter((n: any) => !!n);
    return {
        ...o,
        Ordernumber: o.OrderNumber,
        Orderrequestdate: o.OrderRequestDate,
        Billdate: o.BillDate,
        Billingid: o.BillingId,
        Orderstatuse: o.OrderStatusId,
        DoctorName: doctorName(o.Doctor || o.User),
        OrderStatus: { DisplayName: (o.OrderStatus && o.OrderStatus.DisplayName) || '' },
        PriorityStatus: { DisplayName: (o.OrderPriority && o.OrderPriority.Description) || '' },
        PatientOrderdetails: { Testname: testNames.join(', ') },
        // Sample-collection list shows "edit" for new orders and "view" once processed.
        ActiveStatusId: o.OrderStatusId === ORDER_STATUS.ORDERED ? 1 : 2
    };
}

/** Order line in the shape the legacy detail screens read. */
export function toLegacyOrderDetail(row: any): any {
    const d = plain(row);
    const department = d.Department ? { DepartmentName: d.Department.DepartmentName } : { DepartmentName: '' };
    return {
        ...d,
        Testname: d.TestName,
        DoctorName: doctorName(d.PatientOrder && d.PatientOrder.Doctor),
        Orderstatuse: d.OrderStatusId || ORDER_STATUS.ORDERED,
        OrderStatus: { DisplayName: (d.OrderStatus && d.OrderStatus.DisplayName) || '' },
        PriorityStatus: { DisplayName: (d.OrderPriority && d.OrderPriority.Description) || '' },
        Department: department,
        DeptId: department
    };
}

/** Ids of the ticked lines posted by the legacy screens ({ Data: [line, ...] }). */
export function selectedLineIds(body: any): number[] {
    const rows: any[] = body && Array.isArray(body.Data) ? body.Data : [];
    const ids = rows.map((r: any) => Number(r && r.Id)).filter((id: number) => id > 0);
    return Array.from(new Set(ids));
}

/**
 * Builds AcceptOrder's selectedlist from order lines loaded on the server. Same numbering the
 * Order Acknowledgement screen uses: separate-work-order and culture tests get their own sequence
 * numbers so AcceptOrder puts them in separate work orders.
 */
export function toAcceptSelection(lines: any[]): any[] {
    let separateIndex = 0;
    let cultureIndex = 0;
    return lines.map((line: any) => {
        const tm = line.Testmaster || {};
        return {
            ...line,
            OrderStatusId: line.OrderStatusId || ORDER_STATUS.ORDERED,
            IsSeparateWorkOrder: tm.IsSeparateWorkOrder ? ++separateIndex : 0,
            IsCulture: tm.IsCulture ? ++cultureIndex : 0,
            ExternalProviderId: line.ExternalProviderId || undefined
        };
    });
}

/** Groups lines by their patient order. */
export function groupByOrder(lines: any[]): Map<number, any[]> {
    const groups = new Map<number, any[]>();
    lines.forEach((line: any) => {
        const orderId = Number(line.PatientOrderId);
        const list = groups.get(orderId);
        if (list) { list.push(line); } else { groups.set(orderId, [line]); }
    });
    return groups;
}

export const isOrdered = (line: any): boolean => !line.OrderStatusId || Number(line.OrderStatusId) === ORDER_STATUS.ORDERED;
