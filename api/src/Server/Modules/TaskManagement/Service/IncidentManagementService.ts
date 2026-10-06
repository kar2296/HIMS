import { BaseService, BoFactory } from '../../Base/Index';
import { IncidentManagementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IncidentManagementAttributes } from '../Model/Interface/Index';
import { IncidentManagementFilters } from '../Common/Filters.e';

export class IncidentManagementService extends BaseService {
    private IncidentManagementBo: IncidentManagementBo;
    constructor(req?: Request) {
        super(req);
        this.IncidentManagementBo = BoFactory.GetBo(IncidentManagementBo, this.Request);
    }

    public async AddIncidentManagement(req: BaseRequest): Promise<number> {
        return await this.IncidentManagementBo.AddIncidentManagement(req);
    }

    public async UpdateIncidentManagement(req: BaseRequest): Promise<boolean> {
        return await this.IncidentManagementBo.UpdateIncidentManagement(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.IncidentManagementBo.GetMaxId(req);
    }

    public async GetIncidentManagementById(req: BaseRequest): Promise<IncidentManagementAttributes> {
        return await this.IncidentManagementBo.GetIncidentManagementById(req);
    }

    public async GetIncidentManagements(apiReq?: ApiRequest<IncidentManagementFilters>):
        Promise<ApiResponse<IncidentManagementAttributes[]>> {
        return await this.IncidentManagementBo.GetIncidentManagements(apiReq);
    }

    public async DeleteIncidentManagement(req: BaseRequest): Promise<Boolean> {
        return await this.IncidentManagementBo.DeleteIncidentManagement(req);
    }
}
