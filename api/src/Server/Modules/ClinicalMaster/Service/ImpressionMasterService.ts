import { BaseService, BoFactory } from '../../Base/Index';
import { ImpressionMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ImpressionMasterAttributes } from '../Model/Interface/Index';
import { ImpressionMasterFilters } from '../Common/Filters.e';

export class ImpressionMasterService extends BaseService {
    private ImpressionMasterBo: ImpressionMasterBo;
    constructor(req?: Request) {
        super(req);
        this.ImpressionMasterBo = BoFactory.GetBo(ImpressionMasterBo, this.Request);
    }

    public async AddImpressionMaster(req: BaseRequest): Promise<number> {
        return await this.ImpressionMasterBo.AddImpressionMaster(req);
    }

    public async UpdateImpressionMaster(req: BaseRequest): Promise<boolean> {
        return await this.ImpressionMasterBo.UpdateImpressionMaster(req);
    }

    public async GetImpressionMasterById(req: BaseRequest): Promise<ImpressionMasterAttributes> {
        return await this.ImpressionMasterBo.GetImpressionMasterById(req);
    }

    public async GetImpressionMasters(apiReq?: ApiRequest<ImpressionMasterFilters>):
        Promise<ApiResponse<ImpressionMasterAttributes[]>> {
        return await this.ImpressionMasterBo.GetImpressionMasters(apiReq);
    }

    public async DeleteImpressionMaster(req: BaseRequest): Promise<Boolean> {
        return await this.ImpressionMasterBo.DeleteImpressionMaster(req);
    }
}
