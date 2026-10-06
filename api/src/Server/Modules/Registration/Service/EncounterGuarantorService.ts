import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterGuarantorBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterGuarantorAttributes } from '../Model/Interface/Index';
import { EncounterGuarantorFilters } from '../Common/Filters.e';

export class EncounterGuarantorService extends BaseService {
    private EncounterGuarantorBo: EncounterGuarantorBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterGuarantorBo = BoFactory.GetBo(EncounterGuarantorBo, this.Request);
    }

    public async AddEncounterGuarantor(req: BaseRequest): Promise<number> {
        return await this.EncounterGuarantorBo.AddEncounterGuarantor(req);
    }

    public async UpdateEncounterGuarantor(req: BaseRequest): Promise<boolean> {
        return await this.EncounterGuarantorBo.UpdateEncounterGuarantor(req);
    }

    public async GetEncounterGuarantorById(req: BaseRequest): Promise<EncounterGuarantorAttributes> {
        return await this.EncounterGuarantorBo.GetEncounterGuarantorById(req);
    }

    public async GetEncounterGuarantors(apiReq?: ApiRequest<EncounterGuarantorFilters>):
        Promise<ApiResponse<EncounterGuarantorAttributes[]>> {
        return await this.EncounterGuarantorBo.GetEncounterGuarantors(apiReq);
    }

    public async DeleteEncounterGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterGuarantorBo.DeleteEncounterGuarantor(req);
    }

    public async ManageEncounterGuarantor(req: BaseRequest): Promise<number> {
        return await this.EncounterGuarantorBo.ManageEncounterGuarantor(req);
    }

}
