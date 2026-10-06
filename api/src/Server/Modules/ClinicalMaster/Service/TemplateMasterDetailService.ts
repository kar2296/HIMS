import {BaseService, BoFactory } from '../../Base/Index';
import { TemplateMasterDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TemplateMasterDetailAttributes } from '../Model/Interface/Index';
import { TemplateMasterDetailFilters } from '../Common/Filters.e';

export class TemplateMasterDetailService extends BaseService {
    private TemplateMasterDetailBo: TemplateMasterDetailBo;
    constructor(req?: Request) {
        super(req);
        this.TemplateMasterDetailBo = BoFactory.GetBo(TemplateMasterDetailBo, this.Request);
    }

    public async AddTemplateMasterDetail(req: BaseRequest): Promise<number> {
        return await this.TemplateMasterDetailBo.AddTemplateMasterDetail(req);
    }

    public async UpdateTemplateMasterDetail(req: BaseRequest): Promise<boolean> {
        return await this.TemplateMasterDetailBo.UpdateTemplateMasterDetail(req);
    }

    public async GetTemplateMasterDetailById(req: BaseRequest): Promise<TemplateMasterDetailAttributes> {
        return await this.TemplateMasterDetailBo.GetTemplateMasterDetailById(req);
    }

    public async GetTemplateMasterDetails(apiReq?: ApiRequest<TemplateMasterDetailFilters>):
     Promise<ApiResponse<TemplateMasterDetailAttributes[]>> {
        return await this.TemplateMasterDetailBo.GetTemplateMasterDetails(apiReq);
    }

    public async DeleteTemplateMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.TemplateMasterDetailBo.DeleteTemplateMasterDetail(req);
    }
}
