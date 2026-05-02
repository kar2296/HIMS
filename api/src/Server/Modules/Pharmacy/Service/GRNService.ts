import { BaseService, BoFactory } from '../../Base/Index';
import { GrnBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { GrnAttributes } from '../Model/Interface/Index';
import { GrnFilters } from '../Common/Filters.e';

export class GrnService extends BaseService {
    private GrnBo: GrnBo;
    constructor(req?: Request) {
        super(req);
        this.GrnBo = BoFactory.GetBo(GrnBo, this.Request);
    }

    public async AddGrn(req: BaseRequest): Promise<number> {
        return await this.GrnBo.AddGrn(req);
    }

    public async UpdateGrn(req: BaseRequest): Promise<boolean> {
        return await this.GrnBo.UpdateGrn(req);
    }

    public async UpdateSubmission(req: BaseRequest): Promise<boolean> {
        return await this.GrnBo.UpdateSubmission(req);
    }

    public async UpdatePoGrn(req: BaseRequest): Promise<boolean> {
        return await this.GrnBo.UpdatePoGrn(req);
    }

    public async GetGrnById(req: BaseRequest): Promise<GrnAttributes> {
        return await this.GrnBo.GetGrnById(req);
    }

    public async GetGrnByIdwoDetails(req: BaseRequest): Promise<GrnAttributes> {
        return await this.GrnBo.GetGrnByIdwoDetails(req);
    }

    public async GetGrns(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        return await this.GrnBo.GetGrns(apiReq);
    }

    public async ManagePurchaseTallyApprove(req: BaseRequest): Promise<boolean> {
        return await this.GrnBo.ManagePurchaseTallyApprove(req);
    }

    public async GetGrnList(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        return await this.GrnBo.GetGrnList(apiReq);
    }

    public async GetTodayGrns(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        return await this.GrnBo.GetToDayGrns(apiReq);
    }
    public async GetSupplierInvoiceSummary(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        return await this.GrnBo.GetSupplierInvoiceSummary(apiReq);
    }

    public async GetVendorOutstandings(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        return await this.GrnBo.GetVendorOutstandings(apiReq);
    }

    public async DeleteGrn(req: BaseRequest): Promise<Boolean> {
        return await this.GrnBo.DeleteGrn(req);
    }
    public async PrintGrn(req: BaseRequest): Promise<FileInfo> {
        return await this.GrnBo.PrintGrn(req);
    }
    public async Print1Grn(req: BaseRequest): Promise<FileInfo> {
        return await this.GrnBo.Print1Grn(req);
    }
    public async PrintGRNReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        return await this.GrnBo.PrintGRNReport(apiReq);
    }
    public async PrintVendorOutstandingReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        return await this.GrnBo.PrintVendorOutstandingReport(apiReq);
    }
    public async PrintVendorPendingPaymentReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        return await this.GrnBo.PrintVendorPendingPaymentReport(apiReq);
    }
    public async DMPrintGrn(req: BaseRequest): Promise<any> {
        return await this.GrnBo.DMPrintGrn(req);
    }
    public async PrintInvoiceSummarySupplierReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        return await this.GrnBo.PrintInvoiceSummarySupplierReport(apiReq);
    }
}
