import {BaseService, BoFactory } from '../../Base/Index';
import { TickSheetMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TickSheetMasterAttributes } from '../Model/Interface/Index';
import { TickSheetMasterFilters } from '../Common/Filters.e';

export class TickSheetMasterService extends BaseService {
    private TickSheetMasterBo: TickSheetMasterBo;
    constructor(req?: Request) {
        super(req);
        this.TickSheetMasterBo = BoFactory.GetBo(TickSheetMasterBo, this.Request);
    }

    public async AddTickSheetMaster(req: BaseRequest): Promise<number> {
        return await this.TickSheetMasterBo.AddTickSheetMaster(req);
    }

    public async UpdateTickSheetMaster(req: BaseRequest): Promise<boolean> {
        return await this.TickSheetMasterBo.UpdateTickSheetMaster(req);
    }

    public async GetTickSheetMasterById(req: BaseRequest): Promise<TickSheetMasterAttributes> {
        return await this.TickSheetMasterBo.GetTickSheetMasterById(req);
    }

    public async GetTickSheetMasters(apiReq?: ApiRequest<TickSheetMasterFilters>): Promise<ApiResponse<TickSheetMasterAttributes[]>> {
        return await this.TickSheetMasterBo.GetTickSheetMasters(apiReq);
    }

    public async DeleteTickSheetMaster(req: BaseRequest): Promise<Boolean> {
        return await this.TickSheetMasterBo.DeleteTickSheetMaster(req);
    }
}
