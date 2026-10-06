import { BaseService, BoFactory } from '../../Base/Index';
import { CssdItemSetUpBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CssdItemSetUpAttributes } from '../Model/Interface/Index';
// import { CSSDStoreMapAttributes } from '../Model/Interface/Index';
import { CssdItemSetUpFilters } from '../Common/Filters.e';

export class CssdItemSetUpService extends BaseService {
    private CssdItemSetUpBo: CssdItemSetUpBo;
    constructor(req?: Request) {
        super(req);
        this.CssdItemSetUpBo = BoFactory.GetBo(CssdItemSetUpBo, this.Request);
    }

    public async AddCssdItemSetUp(req: BaseRequest): Promise<number> {
        return await this.CssdItemSetUpBo.AddCssdItemSetUp(req);
    }

    public async UpdateCssdItemSetUp(req: BaseRequest): Promise<boolean> {
        return await this.CssdItemSetUpBo.UpdateCssdItemSetUp(req);
    }

    public async GetCssdItemSetUpById(req: BaseRequest): Promise<CssdItemSetUpAttributes> {
        return await this.CssdItemSetUpBo.GetCssdItemSetUpById(req);
    }

    public async GetCssdItemSetUps(apiReq?: ApiRequest<CssdItemSetUpFilters>): Promise<ApiResponse<CssdItemSetUpAttributes[]>> {
        return await this.CssdItemSetUpBo.GetCssdItemSetUps(apiReq);
    }

    public async DeleteCssdItemSetUp(req: BaseRequest): Promise<Boolean> {
        return await this.CssdItemSetUpBo.DeleteCssdItemSetUp(req);
    }


}
