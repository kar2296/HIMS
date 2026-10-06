import { BaseService, BoFactory } from '../../Base/Index';
import { CollectionReportBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CollectionReportAttributes } from '../Model/Interface/Index';
import { CollectionReportFilters } from '../Common/Filters.e';

export class CollectionReportService extends BaseService {
    private CollectionReportBo: CollectionReportBo;
    constructor(req?: Request) {
        super(req);
        this.CollectionReportBo = BoFactory.GetBo(CollectionReportBo, this.Request);
    }
    public async AddCollectionReport(req: BaseRequest): Promise<number> {
        return await this.CollectionReportBo.AddCollectionReport(req);
    }
    public async UpdateCollectionReport(req: BaseRequest): Promise<boolean> {
        return await this.CollectionReportBo.UpdateCollectionReport(req);
    }
    public async ManageCollectionReportUpdate(req: BaseRequest): Promise<boolean> {
        return await this.CollectionReportBo.ManageCollectionReportUpdate(req);
    }
    public async GetCollectionReportById(req: BaseRequest): Promise<CollectionReportAttributes> {
        return await this.CollectionReportBo.GetCollectionReportById(req);
    }
    public async GetCollectionReports(apiReq?: ApiRequest<CollectionReportFilters>):
        Promise<ApiResponse<CollectionReportAttributes[]>> {
        return await this.CollectionReportBo.GetCollectionReports(apiReq);
    }
    // public async DeleteCollectionReports(apiReq?: ApiRequest<CollectionReportFilters>):
    //     Promise<ApiResponse<CollectionReportAttributes[]>> {
    //     return await this.CollectionReportBo.GetCollectionReports(apiReq);
    // }

}
