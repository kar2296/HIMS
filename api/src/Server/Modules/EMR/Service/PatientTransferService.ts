import { BaseService, BoFactory } from '../../Base/Index';
import { PatientTransferBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientTransferAttributes } from '../Model/Interface/Index';
import { PatientTransferFilters } from '../Common/Filters.e';

export class PatientTransferService extends BaseService {
    private PatientTransferBo: PatientTransferBo;
    constructor(req?: Request) {
        super(req);
        this.PatientTransferBo = BoFactory.GetBo(PatientTransferBo, this.Request);
    }

    public async AddPatientTransfer(req: BaseRequest): Promise<number> {
        return await this.PatientTransferBo.AddPatientTransfer(req);
    }

    public async UpdatePatientTransfer(req: BaseRequest): Promise<boolean> {
        return await this.PatientTransferBo.UpdatePatientTransfer(req);
    }

    public async GetPatientTransferById(req: BaseRequest): Promise<PatientTransferAttributes> {
        return await this.PatientTransferBo.GetPatientTransferById(req);
    }

    public async GetPatientTransfers(apiReq?: ApiRequest<PatientTransferFilters>):
        Promise<ApiResponse<PatientTransferAttributes[]>> {
        return await this.PatientTransferBo.GetPatientTransfers(apiReq);
    }

    public async DeletePatientTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.PatientTransferBo.DeletePatientTransfer(req);
    }
}
