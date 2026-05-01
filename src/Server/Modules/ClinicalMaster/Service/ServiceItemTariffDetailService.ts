import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceItemTariffDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceItemTariffDetailAttributes } from '../Model/Interface/Index';
import { ServiceItemTariffDetailFilters } from '../Common/Filters.e';

export class ServiceItemTariffDetailService extends BaseService {
    private ServiceItemTariffDetailBo: ServiceItemTariffDetailBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceItemTariffDetailBo = BoFactory.GetBo(ServiceItemTariffDetailBo, this.Request);
    }

    public async AddServiceItemTariffDetail(req: BaseRequest): Promise<number> {
        return await this.ServiceItemTariffDetailBo.AddServiceItemTariffDetail(req);
    }

    public async UpdateServiceItemTariffDetail(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemTariffDetailBo.UpdateServiceItemTariffDetail(req);
    }

    public async ManageSerivceItemTariffDetail(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemTariffDetailBo.ManageSerivceItemTariffDetail(req);
    }

    public async GetServiceItemTariffDetailById(req: BaseRequest): Promise<ServiceItemTariffDetailAttributes> {
        return await this.ServiceItemTariffDetailBo.GetServiceItemTariffDetailById(req);
    }

    public async GetServiceItemTariffDetails(apiReq?: ApiRequest<ServiceItemTariffDetailFilters>):
        Promise<ApiResponse<ServiceItemTariffDetailAttributes[]>> {
        return await this.ServiceItemTariffDetailBo.GetServiceItemTariffDetails(apiReq);
    }

    public async DeleteServiceItemTariffDetail(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceItemTariffDetailBo.DeleteServiceItemTariffDetail(req);
    }
}
