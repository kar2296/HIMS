import { BaseService, BoFactory } from '../../Base/Index';
import { ServiceCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceCategoryAttributes } from '../Model/Interface/Index';
import { ServiceCategoryFilters } from '../Common/Filters.e';

export class ServiceCategoryService extends BaseService {
    private ServiceCategoryBo: ServiceCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceCategoryBo = BoFactory.GetBo(ServiceCategoryBo, this.Request);
    }

    public async AddServiceCategory(req: BaseRequest): Promise<number> {
        return await this.ServiceCategoryBo.AddServiceCategory(req);
    }

    public async UpdateServiceCategory(req: BaseRequest): Promise<boolean> {
        return await this.ServiceCategoryBo.UpdateServiceCategory(req);
    }

    public async ManageSerivceCategories(req: BaseRequest): Promise<boolean> {
        return await this.ServiceCategoryBo.ManageSerivceCategories(req);
    }

    public async ManageSerivceSubCategories(req: BaseRequest): Promise<boolean> {
        return await this.ServiceCategoryBo.ManageSerivceSubCategories(req);
    }

    public async GetServiceCategoryById(req: BaseRequest): Promise<ServiceCategoryAttributes> {
        return await this.ServiceCategoryBo.GetServiceCategoryById(req);
    }

    public async GetServiceCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<ApiResponse<ServiceCategoryAttributes[]>> {
        return await this.ServiceCategoryBo.GetServiceCategorys(apiReq);
    }

    public async GetServiceSubCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<ApiResponse<ServiceCategoryAttributes[]>> {
        return await this.ServiceCategoryBo.GetServiceSubCategorys(apiReq);
    }

    public async DeleteServiceCategory(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceCategoryBo.DeleteServiceCategory(req);
    }
    public async PrintServiceCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<any> {
        return await this.ServiceCategoryBo.PrintServiceCategorys(apiReq);
    }
}
