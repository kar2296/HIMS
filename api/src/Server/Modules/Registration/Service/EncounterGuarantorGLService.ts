import {BaseService, BoFactory } from '../../Base/Index';
import { EncounterGuarantorGLBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterGuarantorGLAttributes } from '../Model/Interface/Index';
import { EncounterGuarantorGLFilters } from '../Common/Filters.e';

export class EncounterGuarantorGLService extends BaseService {
    private EncounterGuarantorGLBo: EncounterGuarantorGLBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterGuarantorGLBo = BoFactory.GetBo(EncounterGuarantorGLBo, this.Request);
    }

    public async AddEncounterGuarantorGL(req: BaseRequest): Promise<number> {
        return await this.EncounterGuarantorGLBo.AddEncounterGuarantorGL(req);
    }

    public async UpdateEncounterGuarantorGL(req: BaseRequest): Promise<boolean> {
        return await this.EncounterGuarantorGLBo.UpdateEncounterGuarantorGL(req);
    }

    public async GetEncounterGuarantorGLById(req: BaseRequest): Promise<EncounterGuarantorGLAttributes> {
        return await this.EncounterGuarantorGLBo.GetEncounterGuarantorGLById(req);
    }

    public async GetEncounterGuarantorGLs(apiReq?: ApiRequest<EncounterGuarantorGLFilters>):
     Promise<ApiResponse<EncounterGuarantorGLAttributes[]>> {
        return await this.EncounterGuarantorGLBo.GetEncounterGuarantorGLs(apiReq);
    }

    public async DeleteEncounterGuarantorGL(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterGuarantorGLBo.DeleteEncounterGuarantorGL(req);
    }
}
