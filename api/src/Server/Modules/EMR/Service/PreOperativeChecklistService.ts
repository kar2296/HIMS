import {BaseService, BoFactory } from '../../Base/Index';
import { PreOperativeChecklistBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PreOperativeChecklistAttributes } from '../Model/Interface/Index';
import { PreOperativeChecklistFilters } from '../Common/Filters.e';

export class PreOperativeChecklistService extends BaseService {
    private PreOperativeChecklistBo: PreOperativeChecklistBo;
    constructor(req?: Request) {
        super(req);
        this.PreOperativeChecklistBo = BoFactory.GetBo(PreOperativeChecklistBo, this.Request);
    }
    public async AddPreOperativeChecklist(req: BaseRequest): Promise<number> {
        return await this.PreOperativeChecklistBo.AddPreOperativeChecklist(req);
    }
    public async UpdatePreOperativeChecklist(req: BaseRequest): Promise<boolean> {
        return await this.PreOperativeChecklistBo.UpdatePreOperativeChecklist(req);
    }
    public async GetFeedbackSignPic(req: BaseRequest): Promise<PreOperativeChecklistAttributes> {
        return await this.PreOperativeChecklistBo.GetFeedbackSignPic(req);
    }
    public async GetPreOperativeChecklistById(req: BaseRequest): Promise<PreOperativeChecklistAttributes> {
        return await this.PreOperativeChecklistBo.GetPreOperativeChecklistById(req);
    }
    public async GetPreOperativeChecklists(apiReq?:
        ApiRequest<PreOperativeChecklistFilters>): Promise<ApiResponse<PreOperativeChecklistAttributes[]>> {
        return await this.PreOperativeChecklistBo.GetPreOperativeChecklists(apiReq);
    }
    public async DeletePreOperativeChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.PreOperativeChecklistBo.DeletePreOperativeChecklist(req);
    }
}
