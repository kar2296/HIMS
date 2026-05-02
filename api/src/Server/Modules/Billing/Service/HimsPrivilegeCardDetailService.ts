import { BaseService, BoFactory } from '../../Base/Index';
import { PrivilegeCardDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PrivilegeCardDetailAttributes } from '../Model/Interface/Index';
import { PrivilegeCardDetailFilters } from '../Common/Filters.e';

export class PrivilegeCardDetailService extends BaseService {
    private PrivilegeCardDetailBo: PrivilegeCardDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PrivilegeCardDetailBo = BoFactory.GetBo(PrivilegeCardDetailBo, this.Request);
    }

    public async AddPrivilegeCardDetail(req: BaseRequest): Promise<number> {
        return await this.PrivilegeCardDetailBo.AddPrivilegeCardDetail(req);
    }

    public async UpdatePrivilegeCardDetail(req: BaseRequest): Promise<boolean> {
        return await this.PrivilegeCardDetailBo.UpdatePrivilegeCardDetail(req);
    }

    public async GetPrivilegeCardDetailById(req: BaseRequest): Promise<PrivilegeCardDetailAttributes> {
        return await this.PrivilegeCardDetailBo.GetPrivilegeCardDetailById(req);
    }

    public async GetPrivilegeCardDetails(apiReq?: ApiRequest<PrivilegeCardDetailFilters>):
        Promise<ApiResponse<PrivilegeCardDetailAttributes[]>> {
        return await this.PrivilegeCardDetailBo.GetPrivilegeCardDetails(apiReq);
    }

    public async DeletePrivilegeCardDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PrivilegeCardDetailBo.DeletePrivilegeCardDetail(req);
    }
}
