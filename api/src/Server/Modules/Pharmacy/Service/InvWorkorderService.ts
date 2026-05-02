import { BaseService, BoFactory } from '../../Base/Index';
import { InvWorkorderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { InvWorkorderAttributes } from '../Model/Interface/Index';
import { InvWorkorderFilters } from '../Common/Filters.e';

export class InvWorkorderService extends BaseService {
    private InvWorkorderBo: InvWorkorderBo;
    constructor(req?: Request) {
        super(req);
        this.InvWorkorderBo = BoFactory.GetBo(InvWorkorderBo, this.Request);
    }

    public async AddInvWorkorder(req: BaseRequest): Promise<number> {
        return await this.InvWorkorderBo.AddInvWorkorder(req);
    }

    public async UpdateInvWorkorder(req: BaseRequest): Promise<boolean> {
        return await this.InvWorkorderBo.UpdateInvWorkorder(req);
    }

    public async GetInvWorkorderById(req: BaseRequest): Promise<InvWorkorderAttributes> {
        return await this.InvWorkorderBo.GetInvWorkorderById(req);
    }

    public async GetInvWorkorders(apiReq?: ApiRequest<InvWorkorderFilters>): Promise<ApiResponse<InvWorkorderAttributes[]>> {
        return await this.InvWorkorderBo.GetInvWorkorders(apiReq);
    }

    public async DeleteInvWorkorder(req: BaseRequest): Promise<Boolean> {
        return await this.InvWorkorderBo.DeleteInvWorkorder(req);
    }
    public async PrintInvWorkOrder(req: BaseRequest): Promise<FileInfo> {
        return await this.InvWorkorderBo.PrintInvWorkOrder(req);
    }
    public async PrintwithoutInvWorkOrder(req: BaseRequest): Promise<FileInfo> {
        return await this.InvWorkorderBo.PrintwithoutInvWorkOrder(req);
    }
}
