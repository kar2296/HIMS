import { BaseService, BoFactory } from '../../Base/Index';
import { GuarantorChecklistBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GuarantorChecklistAttributes } from '../Model/Interface/Index';
import { GuarantorChecklistFilters } from '../Common/Filters.e';

export class GuarantorChecklistService extends BaseService {
    private GuarantorChecklistBo: GuarantorChecklistBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorChecklistBo = BoFactory.GetBo(GuarantorChecklistBo, this.Request);
    }

    public async AddGuarantorChecklist(req: BaseRequest): Promise<number> {
        return await this.GuarantorChecklistBo.AddGuarantorChecklist(req);
    }

    public async UpdateGuarantorChecklist(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorChecklistBo.UpdateGuarantorChecklist(req);
    }

    public async ManageGuarantorChecklist(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorChecklistBo.ManageGuarantorChecklist(req);
    }

    public async GetGuarantorChecklistById(req: BaseRequest): Promise<GuarantorChecklistAttributes> {
        return await this.GuarantorChecklistBo.GetGuarantorChecklistById(req);
    }

    public async GetGuarantorChecklists(
        apiReq?: ApiRequest<GuarantorChecklistFilters>): Promise<ApiResponse<GuarantorChecklistAttributes[]>> {
        return await this.GuarantorChecklistBo.GetGuarantorChecklists(apiReq);
    }

    public async DeleteGuarantorChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorChecklistBo.DeleteGuarantorChecklist(req);
    }
}
