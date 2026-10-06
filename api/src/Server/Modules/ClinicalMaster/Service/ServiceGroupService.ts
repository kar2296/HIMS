import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceGroupBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceGroupAttributes } from '../Model/Interface/Index';
import { ServiceGroupFilters } from '../Common/Filters.e';

export class ServiceGroupService extends BaseService {
    private ServiceGroupBo: ServiceGroupBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceGroupBo = BoFactory.GetBo(ServiceGroupBo, this.Request);
    }

    public async AddServiceGroup(req: BaseRequest): Promise<number> {
        return await this.ServiceGroupBo.AddServiceGroup(req);
    }

    public async UpdateServiceGroup(req: BaseRequest): Promise<boolean> {
        return await this.ServiceGroupBo.UpdateServiceGroup(req);
    }

    public async ManageSerivceGroups(req: BaseRequest): Promise<boolean> {
        return await this.ServiceGroupBo.ManageSerivceGroups(req);
    }

    public async GetServiceGroupById(req: BaseRequest): Promise<ServiceGroupAttributes> {
        return await this.ServiceGroupBo.GetServiceGroupById(req);
    }

    public async GetServiceGroups(apiReq?: ApiRequest<ServiceGroupFilters>): Promise<ApiResponse<ServiceGroupAttributes[]>> {
        return await this.ServiceGroupBo.GetServiceGroups(apiReq);
    }

    public async DeleteServiceGroup(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceGroupBo.DeleteServiceGroup(req);
    }
}
