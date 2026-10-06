import { BaseService, BoFactory } from '../../Base/Index';
import { PrivilegeCardBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PrivilegeCardAttributes } from '../Model/Interface/Index';
import { PrivilegeCardFilters } from '../Common/Filters.e';

export class PrivilegeCardService extends BaseService {
    private PrivilegeCardBo: PrivilegeCardBo;
    constructor(req?: Request) {
        super(req);
        this.PrivilegeCardBo = BoFactory.GetBo(PrivilegeCardBo, this.Request);
    }

    public async AddPrivilegeCard(req: BaseRequest): Promise<number> {
        return await this.PrivilegeCardBo.AddPrivilegeCard(req);
    }

    public async UpdatePrivilegeCard(req: BaseRequest): Promise<boolean> {
        return await this.PrivilegeCardBo.UpdatePrivilegeCard(req);
    }

    public async GetPrivilegeCardById(req: BaseRequest): Promise<PrivilegeCardAttributes> {
        return await this.PrivilegeCardBo.GetPrivilegeCardById(req);
    }

    public async GetPrivilegeCards(apiReq?: ApiRequest<PrivilegeCardFilters>): Promise<ApiResponse<PrivilegeCardAttributes[]>> {
        return await this.PrivilegeCardBo.GetPrivilegeCards(apiReq);
    }

    public async DeletePrivilegeCard(req: BaseRequest): Promise<Boolean> {
        return await this.PrivilegeCardBo.DeletePrivilegeCard(req);
    }
}
