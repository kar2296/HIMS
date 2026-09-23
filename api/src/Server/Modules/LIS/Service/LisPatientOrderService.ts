import { BaseService, BoFactory } from '../../Base/Index';
import { Request } from '../../../Core/Index';
import { ApiResponse } from '../../../Common/Index';
import * as emrbo from '../../EMR/Business/Index';
import { PatientOrderDetailFilters } from '../../EMR/Common/Filters.e';
import { PatientWorkorderBo } from '../Business/Index';
import {
    toPatientOrderRequest, toPatientOrderDetailRequest, toLegacyOrder, toLegacyOrderDetail,
    selectedLineIds, toAcceptSelection, groupByOrder, isOrdered, ORDER_STATUS
} from '../Common/LisPatientOrderMapper';

/**
 * Serves the legacy LIS order screens (order acknowledge / assignment / process, sample collection
 * and review, result approval and dispatch) from the current order tables:
 *   lis/patientorders/GetPatientOrders
 *   lis/patientorderdetails/GetPatientOrderdetails | ApprovePatientorderdetails | CancelPatientorderdetails
 *   lis/encounterorderdetails/ApproveEncounterorderdetails | CancelEncounterorderdetails
 * Approve / cancel reuse PatientWorkorderBo.AcceptOrder / CancelOrder (work orders, samples, billing),
 * exactly like the EMR Order Acknowledgement screen.
 */
export class LisPatientOrderService extends BaseService {
    constructor(req?: Request) {
        super(req);
    }

    public async GetPatientOrders(legacyReq: any): Promise<ApiResponse<any[]>> {
        const orderBo = BoFactory.GetBo(emrbo.PatientOrderBo, this.Request);
        const res: any = await orderBo.GetPatientOrders(toPatientOrderRequest(legacyReq));
        return { PageContext: res.PageContext, Data: (res.Data || []).map(toLegacyOrder) };
    }

    public async GetPatientOrderdetails(legacyReq: any): Promise<ApiResponse<any[]>> {
        const detailBo = BoFactory.GetBo(emrbo.PatientOrderDetailBo, this.Request);
        const res: any = await detailBo.GetPatientOrderDetails(toPatientOrderDetailRequest(legacyReq));
        return { PageContext: res.PageContext, Data: (res.Data || []).map(toLegacyOrderDetail) };
    }

    /** Accepts the ticked order lines that are still "Ordered". */
    public async ApproveOrderDetails(body: any): Promise<boolean> {
        const lines = await this.loadSelectedLines(body);
        const pending = lines.filter(isOrdered);
        if (pending.length === 0) {
            throw new Error('None of the selected tests can be accepted (already accepted or cancelled).');
        }
        const workorderBo = BoFactory.GetBo(PatientWorkorderBo, this.Request);
        for (const [orderId, orderLines] of groupByOrder(pending)) {
            await workorderBo.AcceptOrder({ Id: orderId, Data: { selectedlist: toAcceptSelection(orderLines) } } as any);
        }
        return true;
    }

    /** Cancels the ticked order lines that are still "Ordered"; the order is cancelled when no active line is left. */
    public async CancelOrderDetails(body: any): Promise<boolean> {
        const lines = await this.loadSelectedLines(body);
        const pending = lines.filter(isOrdered);
        if (pending.length === 0) {
            throw new Error('None of the selected tests can be cancelled (already accepted or cancelled).');
        }
        const workorderBo = BoFactory.GetBo(PatientWorkorderBo, this.Request);
        for (const [orderId, orderLines] of groupByOrder(pending)) {
            const cancelIds = orderLines.map((l: any) => Number(l.Id));
            const allLines = await this.loadLines([{ Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId }]);
            const stillActive = allLines.filter((l: any) =>
                Number(l.OrderStatusId) !== ORDER_STATUS.CANCELLED && cancelIds.indexOf(Number(l.Id)) === -1);
            await workorderBo.CancelOrder({
                Id: orderId,
                Data: {
                    selectedlist: orderLines,
                    detailids: cancelIds,
                    orderstatusid: stillActive.length === 0 ? ORDER_STATUS.CANCELLED : undefined
                }
            } as any);
        }
        return true;
    }

    /** Re-reads the ticked lines from the database; the client's copy is never trusted for status or grouping. */
    private async loadSelectedLines(body: any): Promise<any[]> {
        const ids = selectedLineIds(body);
        if (ids.length === 0) {
            throw new Error('Select at least one test.');
        }
        const lines = await this.loadLines([{ Key: PatientOrderDetailFilters.Ids, Value: ids }]);
        if (lines.length !== ids.length) {
            throw new Error('Some of the selected tests no longer exist. Please refresh and try again.');
        }
        return lines;
    }

    private async loadLines(params: any[]): Promise<any[]> {
        const detailBo = BoFactory.GetBo(emrbo.PatientOrderDetailBo, this.Request);
        const res: any = await detailBo.GetPatientOrderDetails({
            Params: [...params, { Key: PatientOrderDetailFilters.IncludeTestMaster, Value: true }]
        } as any);
        return (res.Data || []).map((row: any) => (row && typeof row.get === 'function' ? row.get({ plain: true }) : row));
    }
}
