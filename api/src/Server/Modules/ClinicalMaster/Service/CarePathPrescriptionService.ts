import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathPrescriptionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathPrescriptionAttributes } from '../Model/Interface/Index';
import { CarePathPrescriptionFilters } from '../Common/Filters.e';

export class CarePathPrescriptionService extends BaseService {
    private CarePathPrescriptionBo: CarePathPrescriptionBo;
    constructor(req?: Request) {
        super(req);
        this.CarePathPrescriptionBo = BoFactory.GetBo(CarePathPrescriptionBo, this.Request);
    }

    public async AddCarePathPrescription(req: BaseRequest): Promise<number> {
        return await this.CarePathPrescriptionBo.AddCarePathPrescription(req);
    }

    public async UpdateCarePathPrescription(req: BaseRequest): Promise<boolean> {
        return await this.CarePathPrescriptionBo.UpdateCarePathPrescription(req);
    }

    public async GetCarePathPrescriptionById(req: BaseRequest): Promise<CarePathPrescriptionAttributes> {
        return await this.CarePathPrescriptionBo.GetCarePathPrescriptionById(req);
    }

    public async GetCarePathPrescriptions(apiReq?: ApiRequest<CarePathPrescriptionFilters>):
        Promise<ApiResponse<CarePathPrescriptionAttributes[]>> {
        return await this.CarePathPrescriptionBo.GetCarePathPrescriptions(apiReq);
    }

    public async DeleteCarePathPrescription(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathPrescriptionBo.DeleteCarePathPrescription(req);
    }
}
