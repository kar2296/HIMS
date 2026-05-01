import {BaseService, BoFactory} from '../../Base/Index';
import { RemarkBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { RemarkAttributes} from '../Model/Interface/Index';
import { RemarkFilters } from '../Common/Filters.e';

export class RemarkService extends BaseService {
    private RemarkBo: RemarkBo;
    constructor(req?: Request) {
        super(req);
        this.RemarkBo = BoFactory.GetBo(RemarkBo, this.Request);
    }

    public async AddRemark(req: BaseRequest): Promise<number> {
        return await this.RemarkBo.AddRemark(req);
    }

    public async UpdateRemark(req: BaseRequest): Promise<boolean> {
        return await this.RemarkBo.UpdateRemark(req);
    }

    public async GetRemarkById(req: BaseRequest): Promise<RemarkAttributes> {
        return await this.RemarkBo.GetRemarkById(req);
    }

    public async GetRemarks(apiReq?: ApiRequest<RemarkFilters>): Promise<ApiResponse<RemarkAttributes[]>> {
        return await this.RemarkBo.GetRemarks(apiReq);
    }

    public async DeleteRemark(req: BaseRequest): Promise<Boolean> {
        return await this.RemarkBo.DeleteRemark(req);
    }
}
