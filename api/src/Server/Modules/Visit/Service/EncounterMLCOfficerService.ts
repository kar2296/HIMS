import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterMLCOfficerBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterMLCOfficerAttributes } from '../Model/Interface/Index';
import { EncounterMLCOfficerFilters } from '../Common/Filters.e';

export class EncounterMLCOfficerService extends BaseService {
    private EncounterMLCOfficerBo: EncounterMLCOfficerBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterMLCOfficerBo = BoFactory.GetBo(EncounterMLCOfficerBo, this.Request);
    }

    public async AddEncounterMLCOfficer(req: BaseRequest): Promise<number> {
        return await this.EncounterMLCOfficerBo.AddEncounterMLCOfficer(req);
    }

    public async UpdateEncounterMLCOfficer(req: BaseRequest): Promise<boolean> {
        return await this.EncounterMLCOfficerBo.UpdateEncounterMLCOfficer(req);
    }

    public async GetEncounterMLCOfficerById(req: BaseRequest): Promise<EncounterMLCOfficerAttributes> {
        return await this.EncounterMLCOfficerBo.GetEncounterMLCOfficerById(req);
    }

    public async GetEncounterMLCOfficers(apiReq?: ApiRequest<EncounterMLCOfficerFilters>):
        Promise<ApiResponse<EncounterMLCOfficerAttributes[]>> {
        return await this.EncounterMLCOfficerBo.GetEncounterMLCOfficers(apiReq);
    }

    public async DeleteEncounterMLCOfficer(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterMLCOfficerBo.DeleteEncounterMLCOfficer(req);
    }
}
