import {BaseService, BoFactory } from '../../Base/Index';
import { CronStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CronStatusAttributes } from '../Model/Interface/Index';
import { CronStatusFilters } from '../Common/Filters.e';

export class CronStatusService extends BaseService {
    private CronStatusBo: CronStatusBo;
    constructor(req?: Request) {
        super(req);
        this.CronStatusBo = BoFactory.GetBo(CronStatusBo, this.Request);
    }

    public async GetCronStatusById(req: BaseRequest): Promise<CronStatusAttributes> {
        return await this.CronStatusBo.GetCronStatusById(req);
    }

    public async GetCronStatus(apiReq?: ApiRequest<CronStatusFilters>): Promise<ApiResponse<CronStatusAttributes[]>> {
        return await this.CronStatusBo.GetCronStatus(apiReq);
    }

}
