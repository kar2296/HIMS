import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathProcedureBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathProcedureAttributes } from '../Model/Interface/Index';
import {  CarePathProcedureFilters } from '../Common/Filters.e';

export class  CarePathProcedureService extends BaseService {
    private  CarePathProcedureBo:  CarePathProcedureBo;
    constructor(req?: Request) {
        super(req);
        this. CarePathProcedureBo = BoFactory.GetBo( CarePathProcedureBo, this.Request);
    }

    public async AddCarePathProcedure(req: BaseRequest): Promise<number> {
        return await this.CarePathProcedureBo.AddCarePathProcedure(req);
    }

    public async UpdateCarePathProcedure(req: BaseRequest): Promise<boolean> {
        return await this.CarePathProcedureBo.UpdateCarePathProcedure(req);
    }

    public async GetCarePathProcedureById(req: BaseRequest): Promise<CarePathProcedureAttributes> {
        return await this.CarePathProcedureBo.GetCarePathProcedureById(req);
    }

    public async GetCarePathProcedures(apiReq?: ApiRequest<CarePathProcedureFilters>):
        Promise<ApiResponse<CarePathProcedureAttributes[]>> {
        return await this.CarePathProcedureBo.GetCarePathProcedures(apiReq);
    }

    public async DeleteCarePathProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathProcedureBo.DeleteCarePathProcedure(req);
    }
}
