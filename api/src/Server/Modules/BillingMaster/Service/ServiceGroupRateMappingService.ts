import { BaseService, BoFactory } from '../../Base/Index';
import { ServiceGroupRateMappingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceGroupRateMappingAttributes } from '../Model/Interface/Index';
import { ServiceGroupRateMappingFilters } from '../Common/Filters.e';

export class ServiceGroupRateMappingService extends BaseService {
    private ServiceGroupRateMappingBo: ServiceGroupRateMappingBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceGroupRateMappingBo = BoFactory.GetBo(ServiceGroupRateMappingBo, this.Request);
    }

    public async AddServiceGroupRateMapping(req: BaseRequest): Promise<number> {
        return await this.ServiceGroupRateMappingBo.AddServiceGroupRateMapping(req);
    }

    public async UpdateServiceGroupRateMapping(req: BaseRequest): Promise<boolean> {
        return await this.ServiceGroupRateMappingBo.UpdateServiceGroupRateMapping(req);
    }

    public async GetServiceGroupRateMappingById(req: BaseRequest): Promise<ServiceGroupRateMappingAttributes> {
        return await this.ServiceGroupRateMappingBo.GetServiceGroupRateMappingById(req);
    }
    public async GetAllServiceGroupRateMapping(apiReq?:
        ApiRequest<ServiceGroupRateMappingFilters>): Promise<ApiResponse<ServiceGroupRateMappingAttributes[]>> {
        return await this.ServiceGroupRateMappingBo.GetAllServiceGroupRateMapping(apiReq);
    }

    public async DeleteServiceGroupRateMapping(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceGroupRateMappingBo.DeleteServiceGroupRateMapping(req);
    }
}
