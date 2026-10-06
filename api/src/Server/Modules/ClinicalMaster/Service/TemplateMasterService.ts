import {BaseService, BoFactory } from '../../Base/Index';
import { TemplateMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TemplateMasterAttributes } from '../Model/Interface/Index';
import { TemplateMasterFilters } from '../Common/Filters.e';

export class TemplateMasterService extends BaseService {
    private TemplateMasterBo: TemplateMasterBo;
    constructor(req?: Request) {
        super(req);
        this.TemplateMasterBo = BoFactory.GetBo(TemplateMasterBo, this.Request);
    }

    public async AddTemplateMaster(req: BaseRequest): Promise<number> {
        return await this.TemplateMasterBo.AddTemplateMaster(req);
    }

    public async UpdateTemplateMaster(req: BaseRequest): Promise<boolean> {
        return await this.TemplateMasterBo.UpdateTemplateMaster(req);
    }

    public async GetTemplateMasterById(req: BaseRequest): Promise<TemplateMasterAttributes> {
        return await this.TemplateMasterBo.GetTemplateMasterById(req);
    }

    public async GetTemplateMasters(apiReq?: ApiRequest<TemplateMasterFilters>): Promise<ApiResponse<TemplateMasterAttributes[]>> {
        return await this.TemplateMasterBo.GetTemplateMasters(apiReq);
    }

    public async DeleteTemplateMaster(req: BaseRequest): Promise<Boolean> {
        return await this.TemplateMasterBo.DeleteTemplateMaster(req);
    }
}
