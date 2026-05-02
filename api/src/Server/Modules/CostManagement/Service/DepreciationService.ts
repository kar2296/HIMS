import { BaseService, BoFactory } from '../../Base/Index';
import { DepreciationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DepreciationAttributes } from '../Model/Interface/Index';
import { DepreciationFilters } from '../Common/Filters.e';

export class DepreciationService extends BaseService {
    private DepreciationBo: DepreciationBo;
    constructor(req?: Request) {
        super(req);
        this.DepreciationBo = BoFactory.GetBo(DepreciationBo, this.Request);
    }
    public async AddDepreciation(req: BaseRequest): Promise<number> {
        return await this.DepreciationBo.AddDepreciation(req);
    }
    public async UpdateDepreciation(req: BaseRequest): Promise<boolean> {
        return await this.DepreciationBo.UpdateDepreciation(req);
    }

    public async GetDepreciationById(req: BaseRequest): Promise<DepreciationAttributes> {
        return await this.DepreciationBo.GetDepreciationById(req);
    }
    public async GetDepreciations(apiReq?: ApiRequest<DepreciationFilters>): Promise<ApiResponse<DepreciationAttributes[]>> {
        return await this.DepreciationBo.GetDepreciations(apiReq);
    }
    public async DeleteDepreciation(req: BaseRequest): Promise<Boolean> {
        return await this.DepreciationBo.DeleteDepreciation(req);
    }
}
