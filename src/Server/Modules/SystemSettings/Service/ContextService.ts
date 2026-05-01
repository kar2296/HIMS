import {BaseService, BoFactory } from '../../Base/Index';
import { ContextBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ContextAttributes } from '../Model/Interface/Index';
import { ContextFilters } from '../Common/Filters.e';

export class ContextService extends BaseService {
    private ContextBo: ContextBo;
    constructor(req?: Request) {
        super(req);
        this.ContextBo = BoFactory.GetBo(ContextBo, this.Request);
    }

    public async AddContext(req: BaseRequest): Promise<number> {
        return await this.ContextBo.AddContext(req);
    }

    public async UpdateContext(req: BaseRequest): Promise<boolean> {
        return await this.ContextBo.UpdateContext(req);
    }

    public async GetContextById(req: BaseRequest): Promise<ContextAttributes> {
        return await this.ContextBo.GetContextById(req);
    }

    public async GetContexts(apiReq?: ApiRequest<ContextFilters>): Promise<ApiResponse<ContextAttributes[]>> {
        return await this.ContextBo.GetContexts(apiReq);
    }

    public async DeleteContext(req: BaseRequest): Promise<Boolean> {
        return await this.ContextBo.DeleteContext(req);
    }
}
