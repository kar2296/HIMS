import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceCategoryPriorityBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceCategoryPriorityAttributes } from '../Model/Interface/Index';

export class ServiceCategoryPriorityService extends BaseService {
    private ServiceCategoryPriorityBo: ServiceCategoryPriorityBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceCategoryPriorityBo = BoFactory.GetBo(ServiceCategoryPriorityBo, this.Request);
    }

    public async AddServiceCategoryPriority(req: BaseRequest): Promise<number> {
        return await this.ServiceCategoryPriorityBo.AddServiceCategoryPriority(req);
    }

    public async UpdateServiceCategoryPriority(req: BaseRequest): Promise<boolean> {
        return await this.ServiceCategoryPriorityBo.UpdateServiceCategoryPriority(req);
    }

    public async GetServiceCategoryPriorityById(req: BaseRequest): Promise<ServiceCategoryPriorityAttributes> {
        return await this.ServiceCategoryPriorityBo.GetServiceCategoryPriorityById(req);
    }

    public async GetServiceCategoryPrioritys(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<ServiceCategoryPriorityAttributes[]>> {
        return await this.ServiceCategoryPriorityBo.GetServiceCategoryPrioritys(apiReq);
    }

    public async DeleteServiceCategoryPriority(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceCategoryPriorityBo.DeleteServiceCategoryPriority(req);
    }
}
