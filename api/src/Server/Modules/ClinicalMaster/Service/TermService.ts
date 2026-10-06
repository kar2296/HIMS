import {BaseService, BoFactory } from '../../Base/Index';
import { TermBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TermAttributes } from '../Model/Interface/Index';
import { TermFilters } from '../Common/Filters.e';

export class TermService extends BaseService {
    private TermBo: TermBo;
    constructor(req?: Request) {
        super(req);
        this.TermBo = BoFactory.GetBo(TermBo, this.Request);
    }

    public async AddTerm(req: BaseRequest): Promise<number> {
        return await this.TermBo.AddTerm(req);
    }

    public async UpdateTerm(req: BaseRequest): Promise<boolean> {
        return await this.TermBo.UpdateTerm(req);
    }

    public async GetTermById(req: BaseRequest): Promise<TermAttributes> {
        return await this.TermBo.GetTermById(req);
    }

    public async GetTerms(apiReq?: ApiRequest<TermFilters>): Promise<ApiResponse<TermAttributes[]>> {
        return await this.TermBo.GetTerms(apiReq);
    }

    public async DeleteTerm(req: BaseRequest): Promise<Boolean> {
        return await this.TermBo.DeleteTerm(req);
    }
}
