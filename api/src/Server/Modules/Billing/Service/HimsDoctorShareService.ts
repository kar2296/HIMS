import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorShareBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DoctorShareAttributes } from '../Model/Interface/Index';
import { DoctorShareFilters } from '../Common/Filters.e';

export class DoctorShareService extends BaseService {
    private DoctorShareBo: DoctorShareBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorShareBo = BoFactory.GetBo(DoctorShareBo, this.Request);
    }

    public async AddDoctorShare(req: BaseRequest): Promise<number> {
        return await this.DoctorShareBo.AddDoctorShare(req);
    }

    public async UpdateDoctorShare(req: BaseRequest): Promise<boolean> {
        return await this.DoctorShareBo.UpdateDoctorShare(req);
    }

    public async GetDoctorShareById(req: BaseRequest): Promise<DoctorShareAttributes> {
        return await this.DoctorShareBo.GetDoctorShareById(req);
    }

    public async GetDoctorShare(apiReq?: ApiRequest<DoctorShareFilters>): Promise<ApiResponse<DoctorShareAttributes[]>> {
        return await this.DoctorShareBo.GetDoctorShare(apiReq);
    }

    public async DeleteDoctorShare(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorShareBo.DeleteDoctorShare(req);
    }

}
