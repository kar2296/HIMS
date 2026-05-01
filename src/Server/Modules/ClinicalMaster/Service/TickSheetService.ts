import {BaseService, BoFactory } from '../../Base/Index';
import { TickSheetBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TickSheetAttributes } from '../Model/Interface/Index';
import { TickSheetFilters } from '../Common/Filters.e';

export class TickSheetService extends BaseService {
    private TickSheetBo: TickSheetBo;
    constructor(req?: Request) {
        super(req);
        this.TickSheetBo = BoFactory.GetBo(TickSheetBo, this.Request);
    }

    public async AddTickSheet(req: BaseRequest): Promise<number> {
        return await this.TickSheetBo.AddTickSheet(req);
    }

    public async UpdateTickSheet(req: BaseRequest): Promise<boolean> {
        return await this.TickSheetBo.UpdateTickSheet(req);
    }

    public async GetTickSheetById(req: BaseRequest): Promise<TickSheetAttributes> {
        return await this.TickSheetBo.GetTickSheetById(req);
    }

    public async GetTickSheets(apiReq?: ApiRequest<TickSheetFilters>): Promise<ApiResponse<TickSheetAttributes[]>> {
        return await this.TickSheetBo.GetTickSheets(apiReq);
    }

    public async DeleteTickSheet(req: BaseRequest): Promise<Boolean> {
        return await this.TickSheetBo.DeleteTickSheet(req);
    }
}
