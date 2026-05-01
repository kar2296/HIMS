import { BaseService, BoFactory } from '../../Base/Index';
import { ContainertypeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ContainertypeAttributes } from '../Model/Interface/Index';
import { ContainertypeFilters } from '../Common/Filters.e';

export class ContainertypeService extends BaseService {
    private ContainertypeBo: ContainertypeBo;
    constructor(req?: Request) {
        super(req);
        this.ContainertypeBo = BoFactory.GetBo(ContainertypeBo, this.Request);
    }

    public async AddContainertype(req: BaseRequest): Promise<number> {
        return await this.ContainertypeBo.AddContainertype(req);
    }

    public async UpdateContainertype(req: BaseRequest): Promise<boolean> {
        return await this.ContainertypeBo.UpdateContainertype(req);
    }

    public async GetContainertypeById(req: BaseRequest): Promise<ContainertypeAttributes> {
        return await this.ContainertypeBo.GetContainertypeById(req);
    }

    public async GetContainertypes(apiReq?: ApiRequest<ContainertypeFilters>): Promise<ApiResponse<ContainertypeAttributes[]>> {
        return await this.ContainertypeBo.GetContainertypes(apiReq);
    }

    public async DeleteContainertype(req: BaseRequest): Promise<Boolean> {
        return await this.ContainertypeBo.DeleteContainertype(req);
    }
}
