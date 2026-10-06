import {BaseService, BoFactory } from '../../Base/Index';
import { AETriageBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AETriageAttributes } from '../Model/Interface/Index';
import { AETriageFilters } from '../Common/Filters.e';

export class AETriageService extends BaseService {
    private AETriageBo: AETriageBo;
    constructor(req?: Request) {
        super(req);
        this.AETriageBo = BoFactory.GetBo(AETriageBo, this.Request);
    }

    public async AddAETriage(req: BaseRequest): Promise<number> {
        return await this.AETriageBo.AddAETriage(req);
    }

    public async UpdateAETriage(req: BaseRequest): Promise<boolean> {
        return await this.AETriageBo.UpdateAETriage(req);
    }

    public async GetAETriageById(req: BaseRequest): Promise<AETriageAttributes> {
        return await this.AETriageBo.GetAETriageById(req);
    }

    public async GetAETriages(apiReq?: ApiRequest<AETriageFilters>):
     Promise<ApiResponse<AETriageAttributes[]>> {
        return await this.AETriageBo.GetAETriages(apiReq);
    }

    public async DeleteAETriage(req: BaseRequest): Promise<Boolean> {
        return await this.AETriageBo.DeleteAETriage(req);
    }
}
