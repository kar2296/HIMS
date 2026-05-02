import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceItemPackageMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceItemPackageMapAttributes } from '../Model/Interface/Index';
import { ServiceItemPackageMapFilters } from '../Common/Filters.e';

export class ServiceItemPackageMapService extends BaseService {
    private ServiceItemPackageMapBo: ServiceItemPackageMapBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceItemPackageMapBo = BoFactory.GetBo(ServiceItemPackageMapBo, this.Request);
    }

    public async AddServiceItemPackageMap(req: BaseRequest): Promise<number> {
        return await this.ServiceItemPackageMapBo.AddServiceItemPackageMap(req);
    }

    public async UpdateServiceItemPackageMap(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemPackageMapBo.UpdateServiceItemPackageMap(req);
    }

    public async ManageSerivceItemPackageMap(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemPackageMapBo.ManageSerivceItemPackageMap(req);
    }

    public async GetServiceItemPackageMapById(req: BaseRequest): Promise<ServiceItemPackageMapAttributes> {
        return await this.ServiceItemPackageMapBo.GetServiceItemPackageMapById(req);
    }

    public async GetServiceItemPackageMaps(apiReq?: ApiRequest<ServiceItemPackageMapFilters>):
     Promise<ApiResponse<ServiceItemPackageMapAttributes[]>> {
        return await this.ServiceItemPackageMapBo.GetServiceItemPackageMaps(apiReq);
    }

    public async DeleteServiceItemPackageMap(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceItemPackageMapBo.DeleteServiceItemPackageMap(req);
    }
}
