import {BaseService, BoFactory} from '../../Base/Index';
import { ConsumablesBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ConsumablesAttributes} from '../Model/Interface/Index';
import { ConsumablesFilters } from '../Common/Filters.e';

export class ConsumablesService extends BaseService {
    private ConsumablesBo: ConsumablesBo;
    constructor(req?: Request) {
        super(req);
        this.ConsumablesBo = BoFactory.GetBo(ConsumablesBo, this.Request);
    }

    public async AddConsumables(req: BaseRequest): Promise<number> {
        return await this.ConsumablesBo.AddConsumables(req);
    }

    public async UpdateConsumables(req: BaseRequest): Promise<boolean> {
        return await this.ConsumablesBo.UpdateConsumables(req);
    }

    public async GetConsumablesById(req: BaseRequest): Promise<ConsumablesAttributes> {
        return await this.ConsumablesBo.GetConsumablesById(req);
    }

    public async GetConsumabless(apiReq?: ApiRequest<ConsumablesFilters>): Promise<ApiResponse<ConsumablesAttributes[]>> {
        return await this.ConsumablesBo.GetConsumabless(apiReq);
    }

    public async DeleteConsumables(req: BaseRequest): Promise<Boolean> {
        return await this.ConsumablesBo.DeleteConsumables(req);
    }
}
