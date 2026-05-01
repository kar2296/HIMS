import {BaseService, BoFactory } from '../../Base/Index';
import { FamilySocialHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FamilySocialHistoryAttributes } from '../Model/Interface/Index';
import { FamilySocialHistoryFilters } from '../Common/Filters.e';

export class FamilySocialHistoryService extends BaseService {
    private FamilySocialHistoryBo: FamilySocialHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.FamilySocialHistoryBo = BoFactory.GetBo(FamilySocialHistoryBo, this.Request);
    }

    public async AddFamilySocialHistory(req: BaseRequest): Promise<number> {
        return await this.FamilySocialHistoryBo.AddFamilySocialHistory(req);
    }

    public async UpdateFamilySocialHistory(req: BaseRequest): Promise<boolean> {
        return await this.FamilySocialHistoryBo.UpdateFamilySocialHistory(req);
    }

    public async GetFamilySocialHistoryById(req: BaseRequest): Promise<FamilySocialHistoryAttributes> {
        return await this.FamilySocialHistoryBo.GetFamilySocialHistoryById(req);
    }

    public async GetFamilySocialHistorys(apiReq?: ApiRequest<FamilySocialHistoryFilters>):
            Promise<ApiResponse<FamilySocialHistoryAttributes[]>> {
        return await this.FamilySocialHistoryBo.GetFamilySocialHistorys(apiReq);
    }

    public async ManageFamilySocialHistorys(req: BaseRequest): Promise<boolean> {
        return await this.FamilySocialHistoryBo.ManageFamilySocialHistorys(req);
    }

    public async DeleteFamilySocialHistory(req: BaseRequest): Promise<Boolean> {
        return await this.FamilySocialHistoryBo.DeleteFamilySocialHistory(req);
    }
}
