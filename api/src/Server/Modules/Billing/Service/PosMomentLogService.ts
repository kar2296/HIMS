import { BaseService, BoFactory } from '../../Base/Index';
import { PosMomentLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PosMomentLogAttributes } from '../Model/Interface/Index';
import { PosMomentLogFilters } from '../Common/Filters.e';

export class PosMomentLogService extends BaseService {
    private PosMomentLogBo: PosMomentLogBo;
    constructor(req?: Request) {
        super(req);
        this.PosMomentLogBo = BoFactory.GetBo(PosMomentLogBo, this.Request);
    }
    public async AddPosMomentLog(req: BaseRequest): Promise<number> {
        return await this.PosMomentLogBo.AddPosMomentLog(req);
    }
    public async MomentTransactionStatus(req: BaseRequest): Promise<number> {
        return await this.PosMomentLogBo.MomentTransactionStatus(req);
    }
    public async POSMomentCallBack(req: BaseRequest): Promise<any> {
        return await this.PosMomentLogBo.POSMomentCallBack(req);
    }
    public async UpdatePosMomentLog(req: BaseRequest): Promise<boolean> {
        return await this.PosMomentLogBo.UpdatePosMomentLog(req);
    }
    public async GetPosMomentLogById(req: BaseRequest): Promise<PosMomentLogAttributes> {
        return await this.PosMomentLogBo.GetPosMomentLogById(req);
    }
    public async GetPosMomentLogs(apiReq?: ApiRequest<PosMomentLogFilters>): Promise<ApiResponse<PosMomentLogAttributes[]>> {
        return await this.PosMomentLogBo.GetPosMomentLogs(apiReq);
    }
    public async DeletePosMomentLog(req: BaseRequest): Promise<Boolean> {
        return await this.PosMomentLogBo.DeletePosMomentLog(req);
    }
}
