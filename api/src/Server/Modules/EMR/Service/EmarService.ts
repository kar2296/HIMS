import { BaseService, BoFactory } from '../../Base/Index';
import { EmarBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EmarAttributes } from '../Model/Interface/Index';
import { EmarFilters } from '../Common/Filters.e';

export class EmarService extends BaseService {
    private EmarBo: EmarBo;
    constructor(req?: Request) {
        super(req);
        this.EmarBo = BoFactory.GetBo(EmarBo, this.Request);
    }

    public async AddEmar(req: BaseRequest): Promise<number> {
        return await this.EmarBo.AddEmar(req);
    }

    public async UpdateEmar(req: BaseRequest): Promise<boolean> {
        return await this.EmarBo.UpdateEmar(req);
    }

    public async AdministerPrescribedInjection(req: BaseRequest): Promise<boolean> {
        return await this.EmarBo.AdministerPrescribedInjection(req);
    }

    public async GetEmarById(req: BaseRequest): Promise<EmarAttributes> {
        return await this.EmarBo.GetEmarById(req);
    }

    public async GetEmars(apiReq?: ApiRequest<EmarFilters>):
        Promise<ApiResponse<EmarAttributes[]>> {
        return await this.EmarBo.GetEmars(apiReq);
    }

    public async DeleteEmar(req: BaseRequest): Promise<Boolean> {
        return await this.EmarBo.DeleteEmar(req);
    }
}
