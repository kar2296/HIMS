import {BaseService, BoFactory} from '../../Base/Index';
import { TicksheetmasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { TicksheetmasterAttributes} from '../Model/Interface/Index';
import { TicksheetFilters } from '../Common/Filters.e';

export class TicksheetmasterService extends BaseService {
    private TicksheetmasterBo: TicksheetmasterBo;
    constructor(req?: Request) {
        super(req);
        this.TicksheetmasterBo = BoFactory.GetBo(TicksheetmasterBo, this.Request);
    }

    public async AddTicksheetmaster(req: BaseRequest): Promise<number> {
        return await this.TicksheetmasterBo.AddTicksheetmaster(req);
    }

    public async UpdateTicksheetmaster(req: BaseRequest): Promise<boolean> {
        return await this.TicksheetmasterBo.UpdateTicksheetmaster(req);
    }

    public async GetTicksheetmasterById(req: BaseRequest): Promise<TicksheetmasterAttributes> {
        return await this.TicksheetmasterBo.GetTicksheetmasterById(req);
    }

    public async GetTicksheetmasters(apiReq?: ApiRequest<TicksheetFilters>): Promise<ApiResponse<TicksheetmasterAttributes[]>> {
        return await this.TicksheetmasterBo.GetTicksheetmasters(apiReq);
    }

    public async DeleteTicksheetmaster(req: BaseRequest): Promise<Boolean> {
        return await this.TicksheetmasterBo.DeleteTicksheetmaster(req);
    }
}
