import {BaseService, BoFactory} from '../../Base/Index';
import { StateMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { StateMasterAttributes} from '../Model/Interface/Index';
import { StateMasterFilters } from '../Common/Filters.e';

export class StateMasterService extends BaseService {
    private StateMasterBo: StateMasterBo;
    constructor(req?: Request) {
        super(req);
        this.StateMasterBo = BoFactory.GetBo(StateMasterBo, this.Request);
    }

    public async AddStateMaster(req: BaseRequest): Promise<number> {
        return await this.StateMasterBo.AddStateMaster(req);
    }

    public async UpdateStateMaster(req: BaseRequest): Promise<boolean> {
        return await this.StateMasterBo.UpdateStateMaster(req);
    }

    public async GetStateMasterById(req: BaseRequest): Promise<StateMasterAttributes> {
        return await this.StateMasterBo.GetStateMasterById(req);
    }

    public async GetStateMasters(apiReq?: ApiRequest<StateMasterFilters>): Promise<ApiResponse<StateMasterAttributes[]>> {
        return await this.StateMasterBo.GetStateMasters(apiReq);
    }

    public async DeleteStateMaster(req: BaseRequest): Promise<Boolean> {
        return await this.StateMasterBo.DeleteStateMaster(req);
    }
}
