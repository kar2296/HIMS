import {BaseService, BoFactory} from '../../Base/Index';
import { PatientExecutableProcedureBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientExecutableProcedureAttributes} from '../Model/Interface/Index';
import { PatientExecutableProcedureFilters } from '../Common/Filters.e';

export class PatientExecutableProcedureService extends BaseService {
    private PatientExecutableProcedureBo: PatientExecutableProcedureBo;
    constructor(req?: Request) {
        super(req);
        this.PatientExecutableProcedureBo = BoFactory.GetBo(PatientExecutableProcedureBo, this.Request);
    }

    public async AddPatientExecutableProcedure(req: BaseRequest): Promise<number> {
        return await this.PatientExecutableProcedureBo.AddPatientExecutableProcedure(req);
    }

    public async UpdatePatientExecutableProcedure(req: BaseRequest): Promise<boolean> {
        return await this.PatientExecutableProcedureBo.UpdatePatientExecutableProcedure(req);
    }

    public async GetPatientExecutableProcedureById(req: BaseRequest): Promise<PatientExecutableProcedureAttributes> {
        return await this.PatientExecutableProcedureBo.GetPatientExecutableProcedureById(req);
    }

    public async GetPatientExecutableProcedures(
        apiReq?: ApiRequest<PatientExecutableProcedureFilters>): Promise<ApiResponse<PatientExecutableProcedureAttributes[]>> {
        return await this.PatientExecutableProcedureBo.GetPatientExecutableProcedures(apiReq);
    }

    public async DeletePatientExecutableProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.PatientExecutableProcedureBo.DeletePatientExecutableProcedure(req);
    }
}
