import {BaseService, BoFactory} from '../../Base/Index';
import { ReferenceValueGroupBo} from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ReferenceValueGroupAttributes} from '../Model/Interface/Index';
import { ReferenceValueGroupFilters } from '../Common/Filters.e';

export class ReferenceValueGroupService extends BaseService {
    private ReferenceValueGroupBo: ReferenceValueGroupBo;
    constructor(req?: Request) {
        super(req);
        this.ReferenceValueGroupBo = BoFactory.GetBo(ReferenceValueGroupBo, this.Request);
    }

    public async AddReferenceValueGroup(req: BaseRequest): Promise<number> {
        return await this.ReferenceValueGroupBo.AddReferenceValueGroup(req);
    }

    public async UpdateReferenceValueGroup(req: BaseRequest): Promise<boolean> {
        return await this.ReferenceValueGroupBo.UpdateReferenceValueGroup(req);
    }

    public async GetReferenceValueGroupById(req: BaseRequest): Promise<ReferenceValueGroupAttributes> {
        return await this.ReferenceValueGroupBo.GetReferenceValueGroupById(req);
    }

    public async GetReferenceValueGroups(apiReq?: ApiRequest<ReferenceValueGroupFilters>)
        : Promise<ApiResponse<ReferenceValueGroupAttributes[]>> {
        return await this.ReferenceValueGroupBo.GetReferenceValueGroups(apiReq);
    }

    public async DeleteReferenceValueGroup(req: BaseRequest): Promise<Boolean> {
        return await this.ReferenceValueGroupBo.DeleteReferenceValueGroup(req);
    }
}
