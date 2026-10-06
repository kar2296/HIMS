import {BaseService, BoFactory} from '../../Base/Index';
import { PastLabResultBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PastLabResultAttributes} from '../Model/Interface/Index';
import { PastLabResultFilters } from '../Common/Filters.e';

export class PastLabResultService extends BaseService {
    private PastLabResultBo: PastLabResultBo;
    constructor(req?: Request) {
        super(req);
        this.PastLabResultBo = BoFactory.GetBo(PastLabResultBo, this.Request);
    }

    public async AddPastLabResult(req: BaseRequest): Promise<number> {
        return await this.PastLabResultBo.AddPastLabResult(req);
    }

    public async UpdatePastLabResult(req: BaseRequest): Promise<boolean> {
        return await this.PastLabResultBo.UpdatePastLabResult(req);
    }

    public async GetPastLabResultById(req: BaseRequest): Promise<PastLabResultAttributes> {
        return await this.PastLabResultBo.GetPastLabResultById(req);
    }

    public async GetPastLabResults(apiReq?: ApiRequest<PastLabResultFilters>): Promise<ApiResponse<PastLabResultAttributes[]>> {
        return await this.PastLabResultBo.GetPastLabResults(apiReq);
    }

    public async DeletePastLabResult(req: BaseRequest): Promise<Boolean> {
        return await this.PastLabResultBo.DeletePastLabResult(req);
    }
}
