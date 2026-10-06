import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceRateCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceRateCategoryAttributes } from '../Model/Interface/Index';
import { ServiceRateCategoryFilters } from '../Common/Filters.e';

export class ServiceRateCategoryService extends BaseService {
    private ServiceRateCategoryBo: ServiceRateCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceRateCategoryBo = BoFactory.GetBo(ServiceRateCategoryBo, this.Request);
    }

    public async AddServiceRateCategory(req: BaseRequest): Promise<number> {
        return await this.ServiceRateCategoryBo.AddServiceRateCategory(req);
    }

    public async UpdateServiceRateCategory(req: BaseRequest): Promise<boolean> {
        return await this.ServiceRateCategoryBo.UpdateServiceRateCategory(req);
    }

    public async GetServiceRateCategoryById(req: BaseRequest): Promise<ServiceRateCategoryAttributes> {
        return await this.ServiceRateCategoryBo.GetServiceRateCategoryById(req);
    }

    public async GetServiceRateCategorys(apiReq?: ApiRequest<ServiceRateCategoryFilters>):
     Promise<ApiResponse<ServiceRateCategoryAttributes[]>> {
        return await this.ServiceRateCategoryBo.GetServiceRateCategorys(apiReq);
    }

    public async DeleteServiceRateCategory(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceRateCategoryBo.DeleteServiceRateCategory(req);
    }
    public async AddServiceRateCategoryExcel(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceRateCategoryBo.AddServiceRateCategoryExcel(req);
    }
}
