import {BaseService, BoFactory } from '../../Base/Index';
import { PastOcularHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PastOcularHistoryAttributes } from '../Model/Interface/Index';
import { PastOcularHistoryFilters } from '../Common/Filters.e';

export class PastOcularHistoryService extends BaseService {
    private PastOcularHistoryBo: PastOcularHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.PastOcularHistoryBo = BoFactory.GetBo(PastOcularHistoryBo, this.Request);
    }

    public async AddPastOcularHistory(req: BaseRequest): Promise<number> {
        return await this.PastOcularHistoryBo.AddPastOcularHistory(req);
    }

    public async UpdatePastOcularHistory(req: BaseRequest): Promise<boolean> {
        return await this.PastOcularHistoryBo.UpdatePastOcularHistory(req);
    }

    public async GetPastOcularHistoryById(req: BaseRequest): Promise<PastOcularHistoryAttributes> {
        return await this.PastOcularHistoryBo.GetPastOcularHistoryById(req);
    }

    public async ManagePastOcularHistorys(req: BaseRequest): Promise<boolean> {
        return await this.PastOcularHistoryBo.ManagePastOcularHistorys(req);
    }

    public async GetPastOcularHistorys(apiReq?: ApiRequest<PastOcularHistoryFilters>):
                Promise<ApiResponse<PastOcularHistoryAttributes[]>> {
        return await this.PastOcularHistoryBo.GetPastOcularHistorys(apiReq);
    }

    public async DeletePastOcularHistory(req: BaseRequest): Promise<Boolean> {
        return await this.PastOcularHistoryBo.DeletePastOcularHistory(req);
    }
}
