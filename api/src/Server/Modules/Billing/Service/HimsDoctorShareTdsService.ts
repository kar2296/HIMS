import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorShareTdsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DoctorShareTdsAttributes } from '../Model/Interface/Index';
import { DoctorShareTdsFilters } from '../Common/Filters.e';

export class DoctorShareTdsService extends BaseService {
    private DoctorShareTdsBo: DoctorShareTdsBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorShareTdsBo = BoFactory.GetBo(DoctorShareTdsBo, this.Request);
    }

    public async AddDoctorShareTds(req: BaseRequest): Promise<number> {
        return await this.DoctorShareTdsBo.AddDoctorShareTds(req);
    }

    public async UpdateDoctorShareTds(req: BaseRequest): Promise<boolean> {
        return await this.DoctorShareTdsBo.UpdateDoctorShareTds(req);
    }

    public async GetDoctorShareTdsById(req: BaseRequest): Promise<DoctorShareTdsAttributes> {
        return await this.DoctorShareTdsBo.GetDoctorShareTdsById(req);
    }

    public async GetDoctorShareTds(apiReq?: ApiRequest<DoctorShareTdsFilters>): Promise<ApiResponse<DoctorShareTdsAttributes[]>> {
        return await this.DoctorShareTdsBo.GetDoctorShareTds(apiReq);
    }

    public async DeleteDoctorShareTds(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorShareTdsBo.DeleteDoctorShareTds(req);
    }

}
