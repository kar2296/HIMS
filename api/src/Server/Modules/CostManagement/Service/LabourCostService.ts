import { BaseService, BoFactory } from '../../Base/Index';
import { LabourCostBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LabourCostAttributes } from '../Model/Interface/Index';
import { LabourCostFilters } from '../Common/Filters.e';

export class LabourCostService extends BaseService {
    private LabourCostBo: LabourCostBo;
    constructor(req?: Request) {
        super(req);
        this.LabourCostBo = BoFactory.GetBo(LabourCostBo, this.Request);
    }

    public async AddLabourCost(req: BaseRequest): Promise<number> {
        return await this.LabourCostBo.AddLabourCost(req);
    }

    public async UpdateLabourCost(req: BaseRequest): Promise<boolean> {
        return await this.LabourCostBo.UpdateLabourCost(req);
    }

    public async GetLabourCostById(req: BaseRequest): Promise<LabourCostAttributes> {
        return await this.LabourCostBo.GetLabourCostById(req);
    }
    public async GetLabourCosts(apiReq?: ApiRequest<LabourCostFilters>): Promise<ApiResponse<LabourCostAttributes[]>> {
        return await this.LabourCostBo.GetLabourCosts(apiReq);
    }

    public async DeleteLabourCost(req: BaseRequest): Promise<Boolean> {
        return await this.LabourCostBo.DeleteLabourCost(req);
    }
}
