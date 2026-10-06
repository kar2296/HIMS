import {BaseService, BoFactory } from '../../Base/Index';
import { PatientProcedureBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientProcedureAttributes } from '../Model/Interface/Index';
import { PatientProcedureFilters } from '../Common/Filters.e';

export class PatientProcedureService extends BaseService {
    private PatientProcedureBo: PatientProcedureBo;
    constructor(req?: Request) {
        super(req);
        this.PatientProcedureBo = BoFactory.GetBo(PatientProcedureBo, this.Request);
    }

    public async AddPatientProcedure(req: BaseRequest): Promise<number> {
        return await this.PatientProcedureBo.AddPatientProcedure(req);
    }

    public async UpdatePatientProcedure(req: BaseRequest): Promise<boolean> {
        return await this.PatientProcedureBo.UpdatePatientProcedure(req);
    }

    public async GetPatientProcedureById(req: BaseRequest): Promise<PatientProcedureAttributes> {
        return await this.PatientProcedureBo.GetPatientProcedureById(req);
    }

    public async GetPatientProcedures(apiReq?: ApiRequest<PatientProcedureFilters>): Promise<ApiResponse<PatientProcedureAttributes[]>> {
        return await this.PatientProcedureBo.GetPatientProcedures(apiReq);
    }

    public async ManagePatientProcedures(apiReq?: ApiRequest<PatientProcedureFilters>): Promise<boolean> {
        return await this.PatientProcedureBo.ManagePatientProcedures(apiReq);
    }

    public async DeletePatientProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.PatientProcedureBo.DeletePatientProcedure(req);
    }
}
