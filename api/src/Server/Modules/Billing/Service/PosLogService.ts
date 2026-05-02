import { BaseService, BoFactory } from '../../Base/Index';
import { PosLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PosLogAttributes } from '../Model/Interface/Index';
import { PosLogFilters } from '../Common/Filters.e';

export class PosLogService extends BaseService {
    private PosLogBo: PosLogBo;
    constructor(req?: Request) {
        super(req);
        this.PosLogBo = BoFactory.GetBo(PosLogBo, this.Request);
    }
    public async AddPosLog(req: BaseRequest): Promise<number> {
        return await this.PosLogBo.AddPosLog(req);
    }
    public async PushTransaction(req: BaseRequest): Promise<number> {
        return await this.PosLogBo.PushTransaction(req);
    }
    public async TransactionStatus(req: BaseRequest): Promise<number> {
        return await this.PosLogBo.TransactionStatus(req);
    }
    public async CallBack(req: BaseRequest): Promise<number> {
        return await this.PosLogBo.CallBack(req);
    }
    public async UpdatePosLog(req: BaseRequest): Promise<boolean> {
        return await this.PosLogBo.UpdatePosLog(req);
    }
    public async GetPosLogById(req: BaseRequest): Promise<PosLogAttributes> {
        return await this.PosLogBo.GetPosLogById(req);
    }
    public async GetPosLogs(apiReq?: ApiRequest<PosLogFilters>): Promise<ApiResponse<PosLogAttributes[]>> {
        return await this.PosLogBo.GetPosLogs(apiReq);
    }
    public async DeletePosLog(req: BaseRequest): Promise<Boolean> {
        return await this.PosLogBo.DeletePosLog(req);
    }
}
