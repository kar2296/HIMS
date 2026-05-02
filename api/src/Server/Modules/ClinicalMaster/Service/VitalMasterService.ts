import {BaseService, BoFactory} from '../../Base/Index';
import { VitalMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { VitalMasterAttributes} from '../Model/Interface/Index';
import { VitalMasterFilters } from '../Common/Filters.e';

export class VitalMasterService extends BaseService {
    private VitalMasterBo: VitalMasterBo;
    constructor(req?: Request) {
        super(req);
        this.VitalMasterBo = BoFactory.GetBo(VitalMasterBo, this.Request);
    }

    public async AddVitalMaster(req: BaseRequest): Promise<number> {
        return await this.VitalMasterBo.AddVitalMaster(req);
    }

    public async UpdateVitalMaster(req: BaseRequest): Promise<boolean> {
        return await this.VitalMasterBo.UpdateVitalMaster(req);
    }

    public async GetVitalMasterById(req: BaseRequest): Promise<VitalMasterAttributes> {
        return await this.VitalMasterBo.GetVitalMasterById(req);
    }

    public async GetVitalMasters(apiReq?: ApiRequest<VitalMasterFilters>): Promise<ApiResponse<VitalMasterAttributes[]>> {
        return await this.VitalMasterBo.GetVitalMasters(apiReq);
    }

    public async DeleteVitalMaster(req: BaseRequest): Promise<Boolean> {
        return await this.VitalMasterBo.DeleteVitalMaster(req);
    }
}
