import { BaseService, BoFactory } from '../../Base/Index';
import { InvWorkorderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { InvWorkorderDetailAttributes } from '../Model/Interface/Index';
import { InvWorkorderDetailFilters } from '../Common/Filters.e';

export class InvWorkorderDetailService extends BaseService {
    private InvWorkorderDetailBo: InvWorkorderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.InvWorkorderDetailBo = BoFactory.GetBo(InvWorkorderDetailBo, this.Request);
    }

    public async AddInvWorkorderDetail(req: BaseRequest): Promise<number> {
        return await this.InvWorkorderDetailBo.AddInvWorkorderDetail(req);
    }

    public async UpdateInvWorkorderDetail(req: BaseRequest): Promise<boolean> {
        return await this.InvWorkorderDetailBo.UpdateInvWorkorderDetail(req);
    }

    public async GetInvWorkorderDetailById(req: BaseRequest): Promise<InvWorkorderDetailAttributes> {
        return await this.InvWorkorderDetailBo.GetInvWorkorderDetailById(req);
    }

    public async GetInvWorkorderDetails(apiReq?: ApiRequest<InvWorkorderDetailFilters>):
        Promise<ApiResponse<InvWorkorderDetailAttributes[]>> {
        return await this.InvWorkorderDetailBo.GetInvWorkorderDetails(apiReq);
    }

    public async DeleteInvWorkorderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.InvWorkorderDetailBo.DeleteInvWorkorderDetail(req);
    }
}
