import { BaseService, BoFactory } from '../../Base/Index';
import { CollectionBaseRevenueBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CollectionBaseRevenueAttributes } from '../Model/Interface/Index';
import { CollectionBaseRevenueFilters } from '../Common/Filters.e';

export class CollectionBaseRevenueService extends BaseService {
    private CollectionBaseRevenueBo: CollectionBaseRevenueBo;
    constructor(req?: Request) {
        super(req);
        this.CollectionBaseRevenueBo = BoFactory.GetBo(CollectionBaseRevenueBo, this.Request);
    }
    public async AddCollectionBaseRevenue(req: BaseRequest): Promise<number> {
        return await this.CollectionBaseRevenueBo.AddCollectionBaseRevenue(req);
    }
    public async UpdateCollectionBaseRevenue(req: BaseRequest): Promise<boolean> {
        return await this.CollectionBaseRevenueBo.UpdateCollectionBaseRevenue(req);
    }
    public async GetCollectionBaseRevenueById(req: BaseRequest): Promise<CollectionBaseRevenueAttributes> {
        return await this.CollectionBaseRevenueBo.GetCollectionBaseRevenueById(req);
    }
    public async GetCollectionBaseRevenues(apiReq?: ApiRequest<CollectionBaseRevenueFilters>):
        Promise<ApiResponse<CollectionBaseRevenueAttributes[]>> {
        return await this.CollectionBaseRevenueBo.GetCollectionBaseRevenues(apiReq);
    }
    public async GetRevenueDepartmentSummary(req: BaseRequest): Promise<any> {
        return await this.CollectionBaseRevenueBo.GetRevenueDepartmentSummary(req);
    }
    public async GetRevenueCategorySummary(req: BaseRequest): Promise<any> {
        return await this.CollectionBaseRevenueBo.GetRevenueCategorySummary(req);
    }
    public async GetRevenueDoctorSummary(req: BaseRequest): Promise<any> {
        return await this.CollectionBaseRevenueBo.GetRevenueDoctorSummary(req);
    }

    public async DeleteCollectionBaseRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.CollectionBaseRevenueBo.DeleteCollectionBaseRevenue(req);
    }
    public async PrintDocShareItemCollectionSummaryOPReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        return await this.CollectionBaseRevenueBo.PrintDocShareItemCollectionSummaryOPReport(apiReq);
    }
    public async PrintDocShareItemCollectionSummaryIPReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        return await this.CollectionBaseRevenueBo.PrintDocShareItemCollectionSummaryIPReport(apiReq);
    }
    public async PrintRevenueSummaryDepartmentReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        return await this.CollectionBaseRevenueBo.PrintRevenueSummaryDepartmentReport(apiReq);
    }
    public async PrintRevenueSummaryDoctorReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        return await this.CollectionBaseRevenueBo.PrintRevenueSummaryDoctorReport(apiReq);
    }
    public async PrintRevenueSummaryCategoryReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        return await this.CollectionBaseRevenueBo.PrintRevenueSummaryCategoryReport(apiReq);
    }
}
