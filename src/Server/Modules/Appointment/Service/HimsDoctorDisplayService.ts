import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorDisplayBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import { Request } from '../../../Core/Index';
import { DoctorDisplayAttributes } from '../Model/Interface/Index';
import { DoctorDisplayFilters } from '../Common/Filters.e';

export class DoctorDisplayService extends BaseService {
    private DoctorDisplayBo: DoctorDisplayBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorDisplayBo = BoFactory.GetBo(DoctorDisplayBo, this.Request);
    }

    public async AddDoctorDisplay(req: BaseRequest): Promise<number> {
        return await this.DoctorDisplayBo.AddDoctorDisplay(req);
    }

    public async UpdateDoctorDisplay(req: BaseRequest): Promise<boolean> {
        return await this.DoctorDisplayBo.UpdateDoctorDisplay(req);
    }

    public async GetDoctorDisplayById(req: BaseRequest): Promise<DoctorDisplayAttributes> {
        return await this.DoctorDisplayBo.GetDoctorDisplayById(req);
    }
    public async GetListofDoctors(apiReq?: ApiRequest<DoctorDisplayFilters>): Promise<number[]> {
        return await this.DoctorDisplayBo.GetListofDoctors(apiReq);
    }

    public async GetDoctorDisplays(apiReq?: ApiRequest<DoctorDisplayFilters>):
        Promise<ApiResponse<DoctorDisplayAttributes[]>> {
        return await this.DoctorDisplayBo.GetDoctorDisplays(apiReq);
    }

    public async DeleteDoctorDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorDisplayBo.DeleteDoctorDisplay(req);
    }
}
