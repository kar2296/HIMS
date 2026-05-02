import { BaseService, BoFactory } from '../../Base/Index';
import { MRDLocationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { MRDLocationAttributes } from '../Model/Interface/Index';
import { MRDLocationFilters } from '../Common/Filters.e';

export class MRDLocationService extends BaseService {
    private MRDLocationBo: MRDLocationBo;
    constructor(req?: Request) {
        super(req);
        this.MRDLocationBo = BoFactory.GetBo(MRDLocationBo, this.Request);
    }

    public async AddMRDLocation(req: BaseRequest): Promise<number> {
        return await this.MRDLocationBo.AddMRDLocation(req);
    }

    public async UpdateMRDLocation(req: BaseRequest): Promise<boolean> {
        return await this.MRDLocationBo.UpdateMRDLocation(req);
    }

    public async UpdateMRDLocationData(req: BaseRequest): Promise<boolean> {
        return await this.MRDLocationBo.UpdateMRDLocationData(req);
    }

    public async UpdateMRDLocationFromRequest(req: BaseRequest): Promise<boolean> {
        return await this.MRDLocationBo.UpdateMRDLocationFromRequest(req);
    }

    public async GetMRDLocationById(req: BaseRequest): Promise<MRDLocationAttributes> {
        return await this.MRDLocationBo.GetMRDLocationById(req);
    }

    public async GetMRDLocations(apiReq?: ApiRequest<MRDLocationFilters>):
        Promise<ApiResponse<MRDLocationAttributes[]>> {
        return await this.MRDLocationBo.GetMRDLocations(apiReq);
    }

    public async DeleteMRDLocation(req: BaseRequest): Promise<Boolean> {
        return await this.MRDLocationBo.DeleteMRDLocation(req);
    }
}
