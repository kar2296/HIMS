import { BaseService, BoFactory } from '../../Base/Index';
import { LHRCVoucherDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LHRCVoucherDetailAttributes } from '../Model/Interface/Index';
import { LHRCVoucherDetailFilters } from '../Common/Filters.e';

export class LHRCVoucherDetailService extends BaseService {
    private LHRCVoucherDetailBo: LHRCVoucherDetailBo;
    constructor(req?: Request) {
        super(req);
        this.LHRCVoucherDetailBo = BoFactory.GetBo(LHRCVoucherDetailBo, this.Request);
    }

    public async AddLHRCVoucherDetail(req: BaseRequest): Promise<number> {
        return await this.LHRCVoucherDetailBo.AddLHRCVoucherDetail(req);
    }

    public async UpdateLHRCVoucherDetail(req: BaseRequest): Promise<boolean> {
        return await this.LHRCVoucherDetailBo.UpdateLHRCVoucherDetail(req);
    }

    public async GetLHRCVoucherDetailById(req: BaseRequest): Promise<LHRCVoucherDetailAttributes> {
        return await this.LHRCVoucherDetailBo.GetLHRCVoucherDetailById(req);
    }

    public async GetLHRCVoucherDetails(apiReq?: ApiRequest<LHRCVoucherDetailFilters>):
        Promise<ApiResponse<LHRCVoucherDetailAttributes[]>> {
        return await this.LHRCVoucherDetailBo.GetLHRCVoucherDetails(apiReq);
    }

    public async DeleteLHRCVoucherDetail(req: BaseRequest): Promise<Boolean> {
        return await this.LHRCVoucherDetailBo.DeleteLHRCVoucherDetail(req);
    }
}
