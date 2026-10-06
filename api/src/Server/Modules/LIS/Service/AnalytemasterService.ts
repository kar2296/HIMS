import { BaseService, BoFactory } from '../../Base/Index';
import { AnalytemasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AnalytemasterAttributes, AnalytealiasesmasterAttributes, AnalyterefmasterAttributes } from '../Model/Interface/Index';
import { AnalytemasterFilters, AnalyteAliasFilters, AnalyteRefFilters } from '../Common/Filters.e';

export class AnalytemasterService extends BaseService {
    private AnalytemasterBo: AnalytemasterBo;
    constructor(req?: Request) {
        super(req);
        this.AnalytemasterBo = BoFactory.GetBo(AnalytemasterBo, this.Request);
    }

    public async AddAnalytemaster(req: BaseRequest): Promise<number> {
        return await this.AnalytemasterBo.AddAnalytemaster(req);
    }

    public async UpdateAnalytemaster(req: BaseRequest): Promise<boolean> {
        return await this.AnalytemasterBo.UpdateAnalytemaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.AnalytemasterBo.GetMaxId(req);
    }

    public async GetAnalytemasterById(req: BaseRequest): Promise<AnalytemasterAttributes> {
        return await this.AnalytemasterBo.GetAnalytemasterById(req);
    }

    public async GetAnalytemasters(apiReq?: ApiRequest<AnalytemasterFilters>): Promise<ApiResponse<AnalytemasterAttributes[]>> {
        return await this.AnalytemasterBo.GetAnalytemasters(apiReq);
    }

    public async DeleteAnalytemaster(req: BaseRequest): Promise<Boolean> {
        return await this.AnalytemasterBo.DeleteAnalytemaster(req);
    }

    public async AddAliasesmaster(req: BaseRequest): Promise<number> {
        return await this.AnalytemasterBo.AddAliasesmaster(req);
    }

    public async UpdateAliasesmaster(req: BaseRequest): Promise<boolean> {
        return await this.AnalytemasterBo.UpdateAliasesmaster(req);
    }

    public async GetAliasesmasterById(req: BaseRequest): Promise<AnalytealiasesmasterAttributes> {
        return await this.AnalytemasterBo.GetAliasesmasterById(req);
    }

    public async GetAliasesmasters(apiReq?: ApiRequest<AnalyteAliasFilters>): Promise<ApiResponse<AnalytealiasesmasterAttributes[]>> {
        return await this.AnalytemasterBo.GetAliasesmasters(apiReq);
    }

    public async DeleteAliasesmaster(req: BaseRequest): Promise<Boolean> {
        return await this.AnalytemasterBo.DeleteAliasesmaster(req);
    }

    public async AddAnalyteRefmaster(req: BaseRequest): Promise<number> {
        return await this.AnalytemasterBo.AddAnalyteRefmaster(req);
    }

    public async UpdateAnalyteRefmaster(req: BaseRequest): Promise<boolean> {
        return await this.AnalytemasterBo.UpdateAnalyteRefmaster(req);
    }

    public async GetAnalyteRefmasterById(req: BaseRequest): Promise<AnalyterefmasterAttributes> {
        return await this.AnalytemasterBo.GetAnalyterefmasterById(req);
    }

    public async GetAnalyterefmasters(apiReq?: ApiRequest<AnalyteRefFilters>): Promise<ApiResponse<AnalyterefmasterAttributes[]>> {
        return await this.AnalytemasterBo.GetAnalyterefmasters(apiReq);
    }

    public async DeleteAnalyteRefmaster(req: BaseRequest): Promise<Boolean> {
        return await this.AnalytemasterBo.DeleteAnalyteRefmaster(req);
    }
    public async AddAnalyteMasterExcel(req: BaseRequest): Promise<Boolean> {
        return await this.AnalytemasterBo.AddAnalyteMasterExcel(req);
    }

}
