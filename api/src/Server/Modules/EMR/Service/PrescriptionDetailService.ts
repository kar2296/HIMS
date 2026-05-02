import { BaseService, BoFactory } from '../../Base/Index';
import { PrescriptionDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PrescriptionDetailAttributes } from '../Model/Interface/Index';
import { PrescriptionDetailFilters } from '../Common/Filters.e';

export class PrescriptionDetailService extends BaseService {
    private PrescriptionDetailBo: PrescriptionDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PrescriptionDetailBo = BoFactory.GetBo(PrescriptionDetailBo, this.Request);
    }

    public async AddPrescriptionDetail(req: BaseRequest): Promise<number> {
        return await this.PrescriptionDetailBo.AddPrescriptionDetail(req);
    }

    public async UpdatePrescriptionDetail(req: BaseRequest): Promise<boolean> {
        return await this.PrescriptionDetailBo.UpdatePrescriptionDetail(req);
    }

    public async GetPrescriptionDetailById(req: BaseRequest): Promise<PrescriptionDetailAttributes> {
        return await this.PrescriptionDetailBo.GetPrescriptionDetailById(req);
    }

    public async GetPrescriptionDetails(apiReq?: ApiRequest<PrescriptionDetailFilters>):
        Promise<ApiResponse<PrescriptionDetailAttributes[]>> {
        return await this.PrescriptionDetailBo.GetPrescriptionDetails(apiReq);
    }

    public async DeletePrescriptionDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PrescriptionDetailBo.DeletePrescriptionDetail(req);
    }
    public async PrintPendingPrescriptionReport(apiReq?: ApiRequest<PrescriptionDetailFilters>): Promise<any> {
        return await this.PrescriptionDetailBo.PrintPendingPrescriptionReport(apiReq);
    }
}
