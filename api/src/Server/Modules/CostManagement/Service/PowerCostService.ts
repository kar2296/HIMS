import {BaseService, BoFactory } from '../../Base/Index';
import { PowerCostBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PowerCostAttributes } from '../Model/Interface/Index';
import { PowerCostFilters } from '../Common/Filters.e';

export class PowerCostService extends BaseService {
    private PowerCostBo: PowerCostBo;
    constructor(req?: Request) {
        super(req);
        this.PowerCostBo = BoFactory.GetBo(PowerCostBo, this.Request);
    }

    public async AddPowerCost(req: BaseRequest): Promise<number> {
        return await this.PowerCostBo.AddPowerCost(req);
    }

    public async UpdatePowerCost(req: BaseRequest): Promise<boolean> {
        return await this.PowerCostBo.UpdatePowerCost(req);
    }

    public async GetPowerCostById(req: BaseRequest): Promise<PowerCostAttributes> {
        return await this.PowerCostBo.GetPowerCostById(req);
    }

    public async GetPowerCosts(apiReq?: ApiRequest<PowerCostFilters>): Promise<ApiResponse<PowerCostAttributes[]>> {
        return await this.PowerCostBo.GetPowerCosts(apiReq);
    }

    public async DeletePowerCost(req: BaseRequest): Promise<Boolean> {
        return await this.PowerCostBo.DeletePowerCost(req);
    }
}

