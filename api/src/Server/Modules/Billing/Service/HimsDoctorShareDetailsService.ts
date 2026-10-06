import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorShareDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DoctorShareDetailsAttributes } from '../Model/Interface/Index';
import { DoctorShareDetailsFilters } from '../Common/Filters.e';

export class DoctorShareDetailsService extends BaseService {
    private DoctorShareDetailsBo: DoctorShareDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorShareDetailsBo = BoFactory.GetBo(DoctorShareDetailsBo, this.Request);
    }

    public async AddDoctorShareDetails(req: BaseRequest): Promise<number> {
        return await this.DoctorShareDetailsBo.AddDoctorShareDetails(req);
    }

    public async UpdateDoctorShareDetails(req: BaseRequest): Promise<boolean> {
        return await this.DoctorShareDetailsBo.UpdateDoctorShareDetails(req);
    }

    public async GetDoctorShareDetailsById(req: BaseRequest): Promise<DoctorShareDetailsAttributes> {
        return await this.DoctorShareDetailsBo.GetDoctorShareDetailsById(req);
    }


    public async GetDoctorShareDetails(apiReq?: ApiRequest<DoctorShareDetailsFilters>):
        Promise<ApiResponse<DoctorShareDetailsAttributes[]>> {
        return await this.DoctorShareDetailsBo.GetDoctorShareDetails(apiReq);
    }


}
