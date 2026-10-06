import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathClinicalOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathClinicalOrderAttributes } from '../Model/Interface/Index';
import { CarePathClinicalOrderFilters } from '../Common/Filters.e';

export class CarePathClinicalOrderService extends BaseService {
    private CarePathClinicalOrderBo: CarePathClinicalOrderBo;
    constructor(req?: Request) {
        super(req);
        this.CarePathClinicalOrderBo = BoFactory.GetBo(CarePathClinicalOrderBo, this.Request);
    }

    public async AddCarePathClinicalOrder(req: BaseRequest): Promise<number> {
        return await this.CarePathClinicalOrderBo.AddCarePathClinicalOrder(req);
    }

    public async UpdateCarePathClinicalOrder(req: BaseRequest): Promise<boolean> {
        return await this.CarePathClinicalOrderBo.UpdateCarePathClinicalOrder(req);
    }

    public async GetCarePathClinicalOrderById(req: BaseRequest): Promise<CarePathClinicalOrderAttributes> {
        return await this.CarePathClinicalOrderBo.GetCarePathClinicalOrderById(req);
    }

    public async GetCarePathClinicalOrders(apiReq?: ApiRequest<CarePathClinicalOrderFilters>):
        Promise<ApiResponse<CarePathClinicalOrderAttributes[]>> {
        return await this.CarePathClinicalOrderBo.GetCarePathClinicalOrders(apiReq);
    }

    public async DeleteCarePathClinicalOrder(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathClinicalOrderBo.DeleteCarePathClinicalOrder(req);
    }
}
