import { BaseService, BoFactory } from '../../Base/Index';
import { IPClearenceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPClearenceAttributes } from '../Model/Interface/Index';
import { IPClearenceFilters } from '../Common/Filters.e';

export class IPClearenceService extends BaseService {
    private IPClearenceBo: IPClearenceBo;
    constructor(req?: Request) {
        super(req);
        this.IPClearenceBo = BoFactory.GetBo(IPClearenceBo, this.Request);
    }

    public async AddIPClearence(req: BaseRequest): Promise<number> {
        return await this.IPClearenceBo.AddIPClearence(req);
    }

    public async UpdateIPClearence(req: BaseRequest): Promise<boolean> {
        return await this.IPClearenceBo.UpdateIPClearence(req);
    }

    public async GetIPClearenceById(req: BaseRequest): Promise<IPClearenceAttributes> {
        return await this.IPClearenceBo.GetIPClearenceById(req);
    }

    public async GetIPClearences(apiReq?: ApiRequest<IPClearenceFilters>): Promise<ApiResponse<IPClearenceAttributes[]>> {
        return await this.IPClearenceBo.GetIPClearences(apiReq);
    }

    public async DeleteIPClearence(req: BaseRequest): Promise<Boolean> {
        return await this.IPClearenceBo.DeleteIPClearence(req);
    }
}
