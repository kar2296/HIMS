import { BaseService, BoFactory } from '../../Base/Index';
import { DynamicQRLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DynamicQRLogAttributes } from '../Model/Interface/Index';
import { DynamicQRLogFilters } from '../Common/Filters.e';

export class DynamicQRLogService extends BaseService {
    private DynamicQRLogBo: DynamicQRLogBo;
    constructor(req?: Request) {
        super(req);
        this.DynamicQRLogBo = BoFactory.GetBo(DynamicQRLogBo, this.Request);
    }
    public async AddDynamicQRLog(req: BaseRequest): Promise<number> {
        return await this.DynamicQRLogBo.AddDynamicQRLog(req);
    }
    public async GenerateQR(req: any): Promise<any> {
        return await this.DynamicQRLogBo.GenerateQR(req);
    }
    public async CallBack(req: any): Promise<any> {
        return await this.DynamicQRLogBo.CallBack(req);
    }
    public async CheckTransactionStatus(req: any): Promise<any> {
        return await this.DynamicQRLogBo.CheckTransactionStatus(req);
    }
    public async UpdateDynamicQRLog(req: BaseRequest): Promise<boolean> {
        return await this.DynamicQRLogBo.UpdateDynamicQRLog(req);
    }
    public async GetDynamicQRLogById(req: BaseRequest): Promise<DynamicQRLogAttributes> {
        return await this.DynamicQRLogBo.GetDynamicQRLogById(req);
    }
    public async GetDynamicQRLogs(apiReq?: ApiRequest<DynamicQRLogFilters>): Promise<ApiResponse<DynamicQRLogAttributes[]>> {
        return await this.DynamicQRLogBo.GetDynamicQRLogs(apiReq);
    }
    public async DeleteDynamicQRLog(req: BaseRequest): Promise<Boolean> {
        return await this.DynamicQRLogBo.DeleteDynamicQRLog(req);
    }
}
