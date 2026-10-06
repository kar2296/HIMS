import { BaseService, BoFactory } from '../../Base/Index';
import { WardUserMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WardUserMapAttributes } from '../Model/Interface/Index';
import { WardUserMapFilters } from '../Common/Filters.e';

export class WardUserMapService extends BaseService {
    private WardUserMapBo: WardUserMapBo;
    constructor(req?: Request) {
        super(req);
        this.WardUserMapBo = BoFactory.GetBo(WardUserMapBo, this.Request);
    }

    public async AddWardUserMap(req: BaseRequest): Promise<number> {
        return await this.WardUserMapBo.AddWardUserMap(req);
    }

    public async UpdateWardUserMap(req: BaseRequest): Promise<boolean> {
        return await this.WardUserMapBo.UpdateWardUserMap(req);
    }

    public async GetWardUserMapById(req: BaseRequest): Promise<WardUserMapAttributes> {
        return await this.WardUserMapBo.GetWardUserMapById(req);
    }

    public async GetWardUserMaps(apiReq?: ApiRequest<WardUserMapFilters>): Promise<ApiResponse<WardUserMapAttributes[]>> {
        return await this.WardUserMapBo.GetWardUserMaps(apiReq);
    }

    public async DeleteWardUserMap(req: BaseRequest): Promise<Boolean> {
        return await this.WardUserMapBo.DeleteWardUserMap(req);
    }
}
