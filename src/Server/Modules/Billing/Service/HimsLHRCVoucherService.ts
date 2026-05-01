import { BaseService, BoFactory } from '../../Base/Index';
import { LHRCVoucherBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { LHRCVoucherAttributes } from '../Model/Interface/Index';
import { LHRCVoucherFilters } from '../Common/Filters.e';

export class LHRCVoucherService extends BaseService {
    private LHRCVoucherBo: LHRCVoucherBo;
    constructor(req?: Request) {
        super(req);
        this.LHRCVoucherBo = BoFactory.GetBo(LHRCVoucherBo, this.Request);
    }

    public async AddLHRCVoucher(req: BaseRequest): Promise<number> {
        return await this.LHRCVoucherBo.AddLHRCVoucher(req);
    }

    public async UpdateLHRCVoucher(req: BaseRequest): Promise<boolean> {
        return await this.LHRCVoucherBo.UpdateLHRCVoucher(req);
    }

    public async GetLHRCVoucherById(req: BaseRequest): Promise<LHRCVoucherAttributes> {
        return await this.LHRCVoucherBo.GetLHRCVoucherById(req);
    }

    public async GetLHRCVouchers(apiReq?: ApiRequest<LHRCVoucherFilters>): Promise<ApiResponse<LHRCVoucherAttributes[]>> {
        return await this.LHRCVoucherBo.GetLHRCVouchers(apiReq);
    }

    public async DeleteLHRCVoucher(req: BaseRequest): Promise<Boolean> {
        return await this.LHRCVoucherBo.DeleteLHRCVoucher(req);
    }
    public async PrintLHRCVoucher(req: BaseRequest): Promise<FileInfo> {
        return await this.LHRCVoucherBo.PrintLHRCVoucher(req);
    }
}
