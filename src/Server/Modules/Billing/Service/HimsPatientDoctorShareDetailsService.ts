import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDoctorShareDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDoctorShareDetailsAttributes } from '../Model/Interface/Index';
import { PatientDoctorShareDetailsFilters } from '../Common/Filters.e';

export class PatientDoctorShareDetailsService extends BaseService {
    private PatientDoctorShareDetailsBo: PatientDoctorShareDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDoctorShareDetailsBo = BoFactory.GetBo(PatientDoctorShareDetailsBo, this.Request);
    }

    public async AddPatientDoctorShareDetails(req: BaseRequest): Promise<number> {
        return await this.PatientDoctorShareDetailsBo.AddPatientDoctorShareDetails(req);
    }

    public async UpdatePatientDoctorShareDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientDoctorShareDetailsBo.UpdatePatientDoctorShareDetails(req);
    }

    public async ManagePatientDoctorShareDetailsUpdate(req: BaseRequest): Promise<boolean> {
        return await this.PatientDoctorShareDetailsBo.ManagePatientDoctorShareDetailsUpdate(req);
    }

    public async UpdatePatientShareInfoDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientDoctorShareDetailsBo.UpdatePatientShareInfoDetails(req);
    }

    public async GetPatientDoctorShareDetailsById(req: BaseRequest): Promise<PatientDoctorShareDetailsAttributes> {
        return await this.PatientDoctorShareDetailsBo.GetPatientDoctorShareDetailsById(req);
    }


    public async GetPatientDoctorShareDetails(apiReq?: ApiRequest<PatientDoctorShareDetailsFilters>):
        Promise<ApiResponse<PatientDoctorShareDetailsAttributes[]>> {
        return await this.PatientDoctorShareDetailsBo.GetPatientDoctorShareDetails(apiReq);
    }
    public async PrintDoctorShareDetailReport(apiReq?: ApiRequest<PatientDoctorShareDetailsFilters>): Promise<any> {
        return await this.PatientDoctorShareDetailsBo.PrintDoctorShareDetailReport(apiReq);
    }
    public async PrintDoctorShareSummaryReport(req: BaseRequest): Promise<any> {
        return await this.PatientDoctorShareDetailsBo.PrintDoctorShareSummaryReport(req);
    }
    public async PrintDailyWiseDoctorShareSummaryReport(req: BaseRequest): Promise<any> {
        return await this.PatientDoctorShareDetailsBo.PrintDailyWiseDoctorShareSummaryReport(req);
    }
}
