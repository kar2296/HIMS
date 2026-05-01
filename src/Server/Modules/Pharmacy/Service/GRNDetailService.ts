import { BaseService, BoFactory } from '../../Base/Index';
import { GrnDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GrnDetailAttributes } from '../Model/Interface/Index';
import { GrnDetailFilters } from '../Common/Filters.e';

export class GrnDetailService extends BaseService {
    private GrnDetailBo: GrnDetailBo;
    constructor(req?: Request) {
        super(req);
        this.GrnDetailBo = BoFactory.GetBo(GrnDetailBo, this.Request);
    }

    public async AddGrnDetail(req: BaseRequest): Promise<number> {
        return await this.GrnDetailBo.AddGrnDetail(req);
    }

    public async UpdateGrnDetail(req: BaseRequest): Promise<boolean> {
        return await this.GrnDetailBo.UpdateGrnDetail(req);
    }

    public async GetGrnDetailById(req: BaseRequest): Promise<GrnDetailAttributes> {
        return await this.GrnDetailBo.GetGrnDetailById(req);
    }

    public async GetGrnDetails(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        return await this.GrnDetailBo.GetGrnDetails(apiReq);
    }
    public async PrintGRNReportByItem(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        return await this.GrnDetailBo.PrintGRNReportByItem(apiReq);
    }
    public async GetConsolidatePurchaseGst(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        return await this.GrnDetailBo.GetConsolidatePurchaseGst(apiReq);
    }
    public async GetConsolidateInputGstSummary(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        return await this.GrnDetailBo.GetConsolidateInputGstSummary(apiReq);
    }
    public async PurchaseSaleGSTDetails(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        return await this.GrnDetailBo.PurchaseSaleGSTDetails(apiReq);
    }
    public async PrintPurchaseSaleGSTReport(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        return await this.GrnDetailBo.PrintPurchaseSaleGSTReport(apiReq);
    }
    public async PrintConsolidatePurchaseGSTReport(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        return await this.GrnDetailBo.PrintConsolidatePurchaseGSTReport(apiReq);
    }
    public async PrintConsolidateInputGSTSummary(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        return await this.GrnDetailBo.PrintConsolidateInputGSTSummary(apiReq);
    }
    public async PrintDailyPurchaseSummary(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        return await this.GrnDetailBo.PrintDailyPurchaseSummary(apiReq);
    }
    public async DeleteGrnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.GrnDetailBo.DeleteGrnDetail(req);
    }
}
