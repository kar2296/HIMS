import { BaseService, BoFactory } from '../../Base/Index';
import { RoleMobileConfigMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RoleMobileConfigMapAttributes } from '../Model/Interface/Index';
import { RoleMobileConfigMapFilters } from '../Common/Filters.e';

export class RoleMobileConfigMapService extends BaseService {
    private RoleMobileConfigMapBo: RoleMobileConfigMapBo;
    constructor(req?: Request) {
        super(req);
        this.RoleMobileConfigMapBo = BoFactory.GetBo(RoleMobileConfigMapBo, this.Request);
    }

    public async AddRoleMobileConfigMap(req: BaseRequest): Promise<number> {
        return await this.RoleMobileConfigMapBo.AddRoleMobileConfigMap(req);
    }

    public async UpdateRoleMobileConfigMap(req: BaseRequest): Promise<boolean> {
        return await this.RoleMobileConfigMapBo.UpdateRoleMobileConfigMap(req);
    }

    public async GetRoleMobileConfigMapById(req: BaseRequest): Promise<RoleMobileConfigMapAttributes> {
        return await this.RoleMobileConfigMapBo.GetRoleMobileConfigMapById(req);
    }
    public async GetRoleMobileConfigMaps(apiReq?: ApiRequest<RoleMobileConfigMapFilters>):
        Promise<ApiResponse<RoleMobileConfigMapAttributes[]>> {
        return await this.RoleMobileConfigMapBo.GetRoleMobileConfigMaps(apiReq);
    }

    public async DeleteRoleMobileConfigMap(req: BaseRequest): Promise<Boolean> {
        return await this.RoleMobileConfigMapBo.DeleteRoleMobileConfigMap(req);
    }
}
