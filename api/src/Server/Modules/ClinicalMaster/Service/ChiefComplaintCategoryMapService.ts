import { BaseService, BoFactory } from '../../Base/Index';
import { ChiefComplaintCategoryMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ChiefComplaintCategoryMapAttributes } from '../Model/Interface/Index';
import { ChiefComplaintCategoryMapFilters } from '../Common/Filters.e';

export class ChiefComplaintCategoryMapService extends BaseService {
    private ChiefComplaintCategoryMapBo: ChiefComplaintCategoryMapBo;
    constructor(req?: Request) {
        super(req);
        this.ChiefComplaintCategoryMapBo = BoFactory.GetBo(ChiefComplaintCategoryMapBo, this.Request);
    }

    public async AddChiefComplaintCategoryMap(req: BaseRequest): Promise<number> {
        return await this.ChiefComplaintCategoryMapBo.AddChiefComplaintCategoryMap(req);
    }

    public async UpdateChiefComplaintCategoryMap(req: BaseRequest): Promise<boolean> {
        return await this.ChiefComplaintCategoryMapBo.UpdateChiefComplaintCategoryMap(req);
    }

    public async GetChiefComplaintCategoryMapById(req: BaseRequest): Promise<ChiefComplaintCategoryMapAttributes> {
        return await this.ChiefComplaintCategoryMapBo.GetChiefComplaintCategoryMapById(req);
    }

    public async GetChiefComplaintCategoryMaps(apiReq?: ApiRequest<ChiefComplaintCategoryMapFilters>):
        Promise<ApiResponse<ChiefComplaintCategoryMapAttributes[]>> {
        return await this.ChiefComplaintCategoryMapBo.GetChiefComplaintCategoryMaps(apiReq);
    }

    public async DeleteChiefComplaintCategoryMap(req: BaseRequest): Promise<Boolean> {
        return await this.ChiefComplaintCategoryMapBo.DeleteChiefComplaintCategoryMap(req);
    }
}
