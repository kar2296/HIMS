import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDispenseBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientDispenseAttributes } from '../Model/Interface/Index';
import { PatientDispenseFilters } from '../Common/Filters.e';

export class PatientDispenseService extends BaseService {
    private PatientDispenseBo: PatientDispenseBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDispenseBo = BoFactory.GetBo(PatientDispenseBo, this.Request);
    }

    public async AddPatientDispense(req: BaseRequest): Promise<number> {
        return await this.PatientDispenseBo.AddPatientDispense(req);
    }

    public async UpdatePatientDispense(req: BaseRequest): Promise<boolean> {
        return await this.PatientDispenseBo.UpdatePatientDispense(req);
    }

    public async GetPatientDispenseById(req: BaseRequest): Promise<PatientDispenseAttributes> {
        return await this.PatientDispenseBo.GetPatientDispenseById(req);
    }

    public async GetPatientDispenses(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<ApiResponse<PatientDispenseAttributes[]>> {
        return await this.PatientDispenseBo.GetPatientDispenses(apiReq);
    }

    public async GetPatientDispensesForprint(apiReq?: ApiRequest<PatientDispenseFilters>):
        Promise<ApiResponse<PatientDispenseAttributes[]>> {
        return await this.PatientDispenseBo.GetPatientDispensesForprint(apiReq);
    }

    public async GetPatientDispensedListWithoutDetails(apiReq?: ApiRequest<PatientDispenseFilters>):
        Promise<ApiResponse<PatientDispenseAttributes[]>> {
        return await this.PatientDispenseBo.GetPatientDispensedListWithoutDetails(apiReq);
    }

    public async GetPatientDispensedList(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<ApiResponse<PatientDispenseAttributes[]>> {
        return await this.PatientDispenseBo.GetPatientDispensedList(apiReq);
    }

    public async DeletePatientDispense(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDispenseBo.DeletePatientDispense(req);
    }

    public async PrintPatientDispense(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDispenseBo.PrintPatientDispense(req);
    }
    public async PrintPatientIPDispensesReport(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<any> {
        return await this.PatientDispenseBo.PrintPatientIPDispensesReport(apiReq);
    }
}
