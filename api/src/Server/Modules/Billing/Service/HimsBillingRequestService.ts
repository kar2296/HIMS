import { BaseService, BoFactory } from '../../Base/Index';
import { BillingRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BillingRequestAttributes } from '../Model/Interface/Index';
import { BillingRequestFilters } from '../Common/Filters.e';

export class BillingRequestService extends BaseService {
    private BillingRequestBo: BillingRequestBo;
    constructor(req?: Request) {
        super(req);
        this.BillingRequestBo = BoFactory.GetBo(BillingRequestBo, this.Request);
    }
    public async AddBillingRequest(req: BaseRequest): Promise<number> {
        return await this.BillingRequestBo.AddBillingRequest(req);
    }
    public async UpdateBillingRequest(req: BaseRequest): Promise<boolean> {
        return await this.BillingRequestBo.UpdateBillingRequest(req);
    }
    public async GetBillingRequestById(req: BaseRequest): Promise<BillingRequestAttributes> {
        return await this.BillingRequestBo.GetBillingRequestById(req);
    }
    public async GetBillingRequests(apiReq?: ApiRequest<BillingRequestFilters>):
        Promise<ApiResponse<BillingRequestAttributes[]>> {
        return await this.BillingRequestBo.GetBillingRequests(apiReq);
    }
    public async GetBillingRequestsbygroup(apiReq?: ApiRequest<BillingRequestFilters>):
        Promise<ApiResponse<BillingRequestAttributes[]>> {
        return await this.BillingRequestBo.GetBillingRequestsbygroup(apiReq);
    }
    public async GetRevenueDepartmentSummary(req: BaseRequest): Promise<any> {
        return await this.BillingRequestBo.GetRevenueDepartmentSummary(req);
    }
    public async GetRevenueCategorySummary(req: BaseRequest): Promise<any> {
        return await this.BillingRequestBo.GetRevenueCategorySummary(req);
    }
    public async GetRevenueDoctorSummary(req: BaseRequest): Promise<any> {
        return await this.BillingRequestBo.GetRevenueDoctorSummary(req);
    }

    public async DeleteBillingRequest(req: BaseRequest): Promise<Boolean> {
        return await this.BillingRequestBo.DeleteBillingRequest(req);
    }
    public async PrintDocShareItemCollectionSummaryOPReport(apiReq?: ApiRequest<BillingRequestFilters>): Promise<any> {
        return await this.BillingRequestBo.PrintDocShareItemCollectionSummaryOPReport(apiReq);
    }
    public async PrintDocShareItemCollectionSummaryIPReport(apiReq?: ApiRequest<BillingRequestFilters>): Promise<any> {
        return await this.BillingRequestBo.PrintDocShareItemCollectionSummaryIPReport(apiReq);
    }
    public async PrintRevenueSummaryDepartmentReport(apiReq?: ApiRequest<BillingRequestFilters>): Promise<any> {
        return await this.BillingRequestBo.PrintRevenueSummaryDepartmentReport(apiReq);
    }
    public async PrintRevenueSummaryDoctorReport(apiReq?: ApiRequest<BillingRequestFilters>): Promise<any> {
        return await this.BillingRequestBo.PrintRevenueSummaryDoctorReport(apiReq);
    }
    public async PrintRevenueSummaryCategoryReport(apiReq?: ApiRequest<BillingRequestFilters>): Promise<any> {
        return await this.BillingRequestBo.PrintRevenueSummaryCategoryReport(apiReq);
    }
}
