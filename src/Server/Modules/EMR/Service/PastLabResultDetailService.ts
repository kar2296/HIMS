import {BaseService, BoFactory} from '../../Base/Index';
import { PastLabResultDetailBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PastLabResultDetailAttributes} from '../Model/Interface/Index';
import { PastLabResultDetailFilters } from '../Common/Filters.e';

export class PastLabResultDetailService extends BaseService {
    private PastLabResultDetailBo: PastLabResultDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PastLabResultDetailBo = BoFactory.GetBo(PastLabResultDetailBo, this.Request);
    }

    public async AddPastLabResultDetail(req: BaseRequest): Promise<number> {
        return await this.PastLabResultDetailBo.AddPastLabResultDetail(req);
    }

    public async UpdatePastLabResultDetail(req: BaseRequest): Promise<boolean> {
        return await this.PastLabResultDetailBo.UpdatePastLabResultDetail(req);
    }

    public async GetPastLabResultDetailById(req: BaseRequest): Promise<PastLabResultDetailAttributes> {
        return await this.PastLabResultDetailBo.GetPastLabResultDetailById(req);
    }

    public async GetPastLabResultDetails(apiReq?: ApiRequest<PastLabResultDetailFilters>)
    : Promise<ApiResponse<PastLabResultDetailAttributes[]>> {
        return await this.PastLabResultDetailBo.GetPastLabResultDetails(apiReq);
    }

    public async DeletePastLabResultDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PastLabResultDetailBo.DeletePastLabResultDetail(req);
    }
}
