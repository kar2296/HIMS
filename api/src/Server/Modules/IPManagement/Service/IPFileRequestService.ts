import { BaseService, BoFactory } from '../../Base/Index';
import { IPFileRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPFileRequestAttributes } from '../Model/Interface/Index';
import { IPFileRequestFilters } from '../Common/Filters.e';

export class IPFileRequestService extends BaseService {
    private IPFileRequestBo: IPFileRequestBo;
    constructor(req?: Request) {
        super(req);
        this.IPFileRequestBo = BoFactory.GetBo(IPFileRequestBo, this.Request);
    }

    public async AddIPFileRequest(req: BaseRequest): Promise<number> {
        return await this.IPFileRequestBo.AddIPFileRequest(req);
    }

    public async UpdateIPFileRequest(req: BaseRequest): Promise<boolean> {
        return await this.IPFileRequestBo.UpdateIPFileRequest(req);
    }

    public async GetIPFileRequestById(req: BaseRequest): Promise<IPFileRequestAttributes> {
        return await this.IPFileRequestBo.GetIPFileRequestById(req);
    }

    public async GetIPFileRequests(apiReq?: ApiRequest<IPFileRequestFilters>): Promise<ApiResponse<IPFileRequestAttributes[]>> {
        return await this.IPFileRequestBo.GetIPFileRequests(apiReq);
    }

    public async DeleteIPFileRequest(req: BaseRequest): Promise<Boolean> {
        return await this.IPFileRequestBo.DeleteIPFileRequest(req);
    }
    public async PrintNotifyIncompleteFileReport(apiReq?: ApiRequest<IPFileRequestFilters>): Promise<any> {
        return await this.IPFileRequestBo.PrintNotifyIncompleteFileReport(apiReq);
    }
}
