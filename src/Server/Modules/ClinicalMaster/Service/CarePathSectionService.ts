import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathSectionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathSectionAttributes } from '../Model/Interface/Index';
import {  CarePathSectionFilters } from '../Common/Filters.e';

export class  CarePathSectionService extends BaseService {
    private  CarePathSectionBo:  CarePathSectionBo;
    constructor(req?: Request) {
        super(req);
        this. CarePathSectionBo = BoFactory.GetBo( CarePathSectionBo, this.Request);
    }

    public async AddCarePathSection(req: BaseRequest): Promise<number> {
        return await this.CarePathSectionBo.AddCarePathSection(req);
    }

    public async UpdateCarePathSection(req: BaseRequest): Promise<boolean> {
        return await this.CarePathSectionBo.UpdateCarePathSection(req);
    }

    public async GetCarePathSectionById(req: BaseRequest): Promise<CarePathSectionAttributes> {
        return await this.CarePathSectionBo.GetCarePathSectionById(req);
    }

    public async GetCarePathSections(apiReq?: ApiRequest<CarePathSectionFilters>):
        Promise<ApiResponse<CarePathSectionAttributes[]>> {
        return await this.CarePathSectionBo.GetCarePathSections(apiReq);
    }

    public async DeleteCarePathSection(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathSectionBo.DeleteCarePathSection(req);
    }
}
