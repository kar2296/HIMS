import {BaseService, BoFactory } from '../../Base/Index';
import { FamilyConditionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FamilyConditionAttributes } from '../Model/Interface/Index';
import { FamilyConditionFilters } from '../Common/Filters.e';

export class FamilyConditionService extends BaseService {
    private FamilyConditionBo: FamilyConditionBo;
    constructor(req?: Request) {
        super(req);
        this.FamilyConditionBo = BoFactory.GetBo(FamilyConditionBo, this.Request);
    }

    public async AddFamilyCondition(req: BaseRequest): Promise<number> {
        return await this.FamilyConditionBo.AddFamilyCondition(req);
    }

    public async UpdateFamilyCondition(req: BaseRequest): Promise<boolean> {
        return await this.FamilyConditionBo.UpdateFamilyCondition(req);
    }

    public async GetFamilyConditionById(req: BaseRequest): Promise<FamilyConditionAttributes> {
        return await this.FamilyConditionBo.GetFamilyConditionById(req);
    }

    public async ManageFamilyConditions(req: BaseRequest): Promise<boolean> {
        return await this.FamilyConditionBo.ManageFamilyConditions(req);
    }

    public async GetFamilyConditions(apiReq?: ApiRequest<FamilyConditionFilters>): Promise<ApiResponse<FamilyConditionAttributes[]>> {
        return await this.FamilyConditionBo.GetFamilyConditions(apiReq);
    }

    public async DeleteFamilyCondition(req: BaseRequest): Promise<Boolean> {
        return await this.FamilyConditionBo.DeleteFamilyCondition(req);
    }
}
