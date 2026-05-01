import { BaseService, BoFactory } from '../../Base/Index';
import { PrescriptionPadBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PrescriptionPadAttributes } from '../Model/Interface/Index';
import { PrescriptionPadFilters } from '../Common/Filters.e';

export class PrescriptionPadService extends BaseService {
    private PrescriptionPadBo: PrescriptionPadBo;
    constructor(req?: Request) {
        super(req);
        this.PrescriptionPadBo = BoFactory.GetBo(PrescriptionPadBo, this.Request);
    }

    public async AddPrescriptionPad(req: BaseRequest): Promise<number> {
        return await this.PrescriptionPadBo.AddPrescriptionPad(req);
    }

    public async UpdatePrescriptionPad(req: BaseRequest): Promise<boolean> {
        return await this.PrescriptionPadBo.UpdatePrescriptionPad(req);
    }

    public async GetPrescriptionPadInfo(req: BaseRequest): Promise<PrescriptionPadAttributes> {
        return await this.PrescriptionPadBo.GetPrescriptionPadInfo(req);
    }

    public async GetPrescriptionPadById(req: BaseRequest): Promise<PrescriptionPadAttributes> {
        return await this.PrescriptionPadBo.GetPrescriptionPadById(req);
    }

    public async GetPrescriptionPads(apiReq?: ApiRequest<PrescriptionPadFilters>): Promise<ApiResponse<PrescriptionPadAttributes[]>> {
        return await this.PrescriptionPadBo.GetPrescriptionPads(apiReq);
    }

    public async DeletePrescriptionPad(req: BaseRequest): Promise<Boolean> {
        return await this.PrescriptionPadBo.DeletePrescriptionPad(req);
    }
}
