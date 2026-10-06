import { BaseService, BoFactory } from '../../Base/Index';
import { GstMasterBo} from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GstMasterAttributes } from '../Model/Interface/Index';
import { GstMasterFilters } from '../Common/Filters.e';

export class GstMasterService extends BaseService {
    private GstMasterBo: GstMasterBo;
    constructor(req?: Request) {
        super(req);
        this.GstMasterBo = BoFactory.GetBo(GstMasterBo, this.Request);
    }

    public async AddGstMaster(req: BaseRequest): Promise<number> {
        return await this.GstMasterBo.AddGstMaster(req);
    }

    public async UpdateGstMaster(req: BaseRequest): Promise<boolean> {
        return await this.GstMasterBo.UpdateGstMaster(req);
    }

    public async GetGstMasterById(req: BaseRequest): Promise<GstMasterAttributes> {
        return await this.GstMasterBo.GetGstMasterById(req);
    }

    public async GetGstMasters(apiReq?: ApiRequest<GstMasterFilters>): Promise<ApiResponse<GstMasterAttributes[]>> {
        return await this.GstMasterBo.GetGstMasters(apiReq);
    }

    public async DeleteGstMaster(req: BaseRequest): Promise<Boolean> {
        return await this.GstMasterBo.DeleteGstMaster(req);
    }
}
