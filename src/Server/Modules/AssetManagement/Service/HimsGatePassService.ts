import {BaseService, BoFactory } from '../../Base/Index';
import { GatePassBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GatePassAttributes } from '../Model/Interface/Index';
import { GatePassFilters } from '../Common/Filters.e';

export class GatePassService extends BaseService {
    private GatePassBo: GatePassBo;
    constructor(req?: Request) {
        super(req);
        this.GatePassBo = BoFactory.GetBo(GatePassBo, this.Request);
    }

    public async AddGatePass(req: BaseRequest): Promise<number> {
        return await this.GatePassBo.AddGatePass(req);
    }

    public async UpdateGatePass(req: BaseRequest): Promise<boolean> {
        return await this.GatePassBo.UpdateGatePass(req);
    }

    public async GetGatePassById(req: BaseRequest): Promise<GatePassAttributes> {
        return await this.GatePassBo.GetGatePassById(req);
    }

    public async GetGatePasss(apiReq?: ApiRequest<GatePassFilters>): Promise<ApiResponse<GatePassAttributes[]>> {
        return await this.GatePassBo.GetGatePasss(apiReq);
    }

    public async PrintGatePass(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        return await this.GatePassBo.PrintGatePass(apiReq);
    }

    public async PrintGatePass1(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        return await this.GatePassBo.PrintGatePass1(apiReq);
    }

    public async DeleteGatePass(req: BaseRequest): Promise<Boolean> {
        return await this.GatePassBo.DeleteGatePass(req);
    }
    public async PrintAssetGatepassReport(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        return await this.GatePassBo.PrintAssetGatepassReport(apiReq);
    }
}

