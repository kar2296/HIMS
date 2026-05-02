import {BaseService, BoFactory } from '../../Base/Index';
import { TickSheetMasterDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TickSheetMasterDetailAttributes } from '../Model/Interface/Index';
import { TickSheetMasterDetailFilters } from '../Common/Filters.e';

export class TickSheetMasterDetailService extends BaseService {
    private TickSheetMasterDetailBo: TickSheetMasterDetailBo;
    constructor(req?: Request) {
        super(req);
        this.TickSheetMasterDetailBo = BoFactory.GetBo(TickSheetMasterDetailBo, this.Request);
    }

    public async AddTickSheetMasterDetail(req: BaseRequest): Promise<number> {
        return await this.TickSheetMasterDetailBo.AddTickSheetMasterDetail(req);
    }

    public async UpdateTickSheetMasterDetail(req: BaseRequest): Promise<boolean> {
        return await this.TickSheetMasterDetailBo.UpdateTickSheetMasterDetail(req);
    }

    public async GetTickSheetMasterDetailById(req: BaseRequest): Promise<TickSheetMasterDetailAttributes> {
        return await this.TickSheetMasterDetailBo.GetTickSheetMasterDetailById(req);
    }

    public async GetTickSheetMasterDetails(apiReq?: ApiRequest<TickSheetMasterDetailFilters>):
     Promise<ApiResponse<TickSheetMasterDetailAttributes[]>> {
        return await this.TickSheetMasterDetailBo.GetTickSheetMasterDetails(apiReq);
    }

    public async DeleteTickSheetMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.TickSheetMasterDetailBo.DeleteTickSheetMasterDetail(req);
    }
}
