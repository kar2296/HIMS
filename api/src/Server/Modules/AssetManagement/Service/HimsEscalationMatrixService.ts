import { BaseService, BoFactory } from '../../Base/Index';
import { EscalationMatrixBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EscalationMatrixAttributes } from '../Model/Interface/Index';
import { EscalationMatrixFilters } from '../Common/Filters.e';

export class EscalationMatrixService extends BaseService {
    private EscalationMatrixBo: EscalationMatrixBo;
    constructor(req?: Request) {
        super(req);
        this.EscalationMatrixBo = BoFactory.GetBo(EscalationMatrixBo, this.Request);
    }

    public async AddEscalationMatrix(req: BaseRequest): Promise<number> {
        return await this.EscalationMatrixBo.AddEscalationMatrix(req);
    }

    public async UpdateEscalationMatrix(req: BaseRequest): Promise<boolean> {
        return await this.EscalationMatrixBo.UpdateEscalationMatrix(req);
    }

    public async ManageEscalationMatrix(req: BaseRequest): Promise<boolean> {
        return await this.EscalationMatrixBo.ManageEscalationMatrix(req);
    }

    public async GetEscalationMatrixById(req: BaseRequest): Promise<EscalationMatrixAttributes> {
        return await this.EscalationMatrixBo.GetEscalationMatrixById(req);
    }

    public async GetEscalationMatrixs(apiReq?: ApiRequest<EscalationMatrixFilters>): Promise<ApiResponse<EscalationMatrixAttributes[]>> {
        return await this.EscalationMatrixBo.GetEscalationMatrixs(apiReq);
    }

    public async DeleteEscalationMatrix(req: BaseRequest): Promise<Boolean> {
        return await this.EscalationMatrixBo.DeleteEscalationMatrix(req);
    }
}
