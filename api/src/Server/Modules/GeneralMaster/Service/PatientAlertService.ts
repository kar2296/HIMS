import {BaseService, BoFactory} from '../../Base/Index';
import { PatientAlertBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientAlertAttributes} from '../Model/Interface/Index';
import { PatientAlertFilters } from '../Common/Filters.e';

export class PatientAlertService extends BaseService {
    private PatientAlertBo: PatientAlertBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAlertBo = BoFactory.GetBo(PatientAlertBo, this.Request);
    }

    public async AddPatientAlert(req: BaseRequest): Promise<number> {
        return await this.PatientAlertBo.AddPatientAlert(req);
    }

    public async UpdatePatientAlert(req: BaseRequest): Promise<boolean> {
        return await this.PatientAlertBo.UpdatePatientAlert(req);
    }

    public async GetPatientAlertById(req: BaseRequest): Promise<PatientAlertAttributes> {
        return await this.PatientAlertBo.GetPatientAlertById(req);
    }

    public async GetPatientAlerts(apiReq?: ApiRequest<PatientAlertFilters>): Promise<ApiResponse<PatientAlertAttributes[]>> {
        return await this.PatientAlertBo.GetPatientAlerts(apiReq);
    }

    public async DeletePatientAlert(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAlertBo.DeletePatientAlert(req);
    }
}
