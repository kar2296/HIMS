import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterMLCBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { EncounterMLCAttributes } from '../Model/Interface/Index';
import { EncounterMLCFilters } from '../Common/Filters.e';

export class EncounterMLCService extends BaseService {
    private EncounterMLCBo: EncounterMLCBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterMLCBo = BoFactory.GetBo(EncounterMLCBo, this.Request);
    }

    public async AddEncounterMLC(req: BaseRequest): Promise<number> {
        return await this.EncounterMLCBo.AddEncounterMLC(req);
    }

    public async UpdateEncounterMLC(req: BaseRequest): Promise<boolean> {
        return await this.EncounterMLCBo.UpdateEncounterMLC(req);
    }

    public async GetEncounterMLCById(req: BaseRequest): Promise<EncounterMLCAttributes> {
        return await this.EncounterMLCBo.GetEncounterMLCById(req);
    }

    public async GetEncounterMLCs(apiReq?: ApiRequest<EncounterMLCFilters>): Promise<ApiResponse<EncounterMLCAttributes[]>> {
        return await this.EncounterMLCBo.GetEncounterMLCs(apiReq);
    }

    public async GetAccidentMLC(req: BaseRequest): Promise<any> {
        return await this.EncounterMLCBo.GetAccidentMLC(req);
    }
    public async DeleteEncounterMLC(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterMLCBo.DeleteEncounterMLC(req);
    }
     public async PrintEncounterMLC(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterMLCBo.PrintEncounterMLC(req);
    }
}
