import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceItemAliasBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceItemAliasAttributes } from '../Model/Interface/Index';
import { ServiceItemAliasFilters } from '../Common/Filters.e';

export class ServiceItemAliasService extends BaseService {
    private ServiceItemAliasBo: ServiceItemAliasBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceItemAliasBo = BoFactory.GetBo(ServiceItemAliasBo, this.Request);
    }

    public async AddServiceItemAlias(req: BaseRequest): Promise<number> {
        return await this.ServiceItemAliasBo.AddServiceItemAlias(req);
    }

    public async UpdateServiceItemAlias(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemAliasBo.UpdateServiceItemAlias(req);
    }

    public async ManageSerivceItemAlias(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemAliasBo.ManageSerivceItemAlias(req);
    }

    public async GetServiceItemAliasById(req: BaseRequest): Promise<ServiceItemAliasAttributes> {
        return await this.ServiceItemAliasBo.GetServiceItemAliasById(req);
    }

    public async GetServiceItemAliass(apiReq?: ApiRequest<ServiceItemAliasFilters>): Promise<ApiResponse<ServiceItemAliasAttributes[]>> {
        return await this.ServiceItemAliasBo.GetServiceItemAliass(apiReq);
    }

    public async DeleteServiceItemAlias(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceItemAliasBo.DeleteServiceItemAlias(req);
    }
}
