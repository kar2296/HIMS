import { BaseService, BoFactory } from '../../Base/Index';
import { LensPrescriptionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { LensPrescriptionAttributes } from '../Model/Interface/Index';
import { LensPrescriptionFilters } from '../Common/Filters.e';

export class LensPrescriptionService extends BaseService {
    private LensPrescriptionBo: LensPrescriptionBo;
    constructor(req?: Request) {
        super(req);
        this.LensPrescriptionBo = BoFactory.GetBo(LensPrescriptionBo, this.Request);
    }

    public async AddLensPrescription(req: BaseRequest): Promise<number> {
        return await this.LensPrescriptionBo.AddLensPrescription(req);
    }

    public async UpdateLensPrescription(req: BaseRequest): Promise<boolean> {
        return await this.LensPrescriptionBo.UpdateLensPrescription(req);
    }

    public async GetLensPrescriptionById(req: BaseRequest): Promise<LensPrescriptionAttributes> {
        return await this.LensPrescriptionBo.GetLensPrescriptionById(req);
    }

    public async GetLensPrescriptions(apiReq?: ApiRequest<LensPrescriptionFilters>): Promise<ApiResponse<LensPrescriptionAttributes[]>> {
        return await this.LensPrescriptionBo.GetLensPrescriptions(apiReq);
    }

    public async DeleteLensPrescription(req: BaseRequest): Promise<Boolean> {
        return await this.LensPrescriptionBo.DeleteLensPrescription(req);
    }

    public async PrintLensPrescription(req: BaseRequest): Promise<FileInfo> {
        return await this.LensPrescriptionBo.PrintLensPrescription(req);
    }
}
