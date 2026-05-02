import { BaseService, BoFactory } from '../../Base/Index';
import { PatientTrackerBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientTrackerAttributes } from '../Model/Interface/Index';
import { PatientTrackerFilters } from '../Common/Filters.e';

export class PatientTrackerService extends BaseService {
    private PatientTrackerBo: PatientTrackerBo;
    constructor(req?: Request) {
        super(req);
        this.PatientTrackerBo = BoFactory.GetBo(PatientTrackerBo, this.Request);
    }

    public async AddPatientTracker(req: BaseRequest): Promise<number> {
        return await this.PatientTrackerBo.AddPatientTracker(req);
    }

    public async UpdatePatientTracker(req: BaseRequest): Promise<boolean> {
        return await this.PatientTrackerBo.UpdatePatientTracker(req);
    }

    public async GetPatientTrackerById(req: BaseRequest): Promise<PatientTrackerAttributes> {
        return await this.PatientTrackerBo.GetPatientTrackerById(req);
    }

    public async GetPatientTrackers(apiReq?: ApiRequest<PatientTrackerFilters>): Promise<ApiResponse<PatientTrackerAttributes[]>> {
        return await this.PatientTrackerBo.GetPatientTrackers(apiReq);
    }

    public async AttendPatient(req: BaseRequest): Promise<number> {
        return await this.PatientTrackerBo.AttendPatient(req);
    }

    public async AssignPatient(req: BaseRequest): Promise<number> {
        return await this.PatientTrackerBo.AssignPatient(req);
    }

    public async CheckoutPatients(req: BaseRequest): Promise<Boolean> {
        return await this.PatientTrackerBo.CheckoutPatients(req);
    }

    public async CheckoutPatient(req: BaseRequest): Promise<number> {
        return await this.PatientTrackerBo.CheckoutPatient(req);
    }

    public async CheckoutConsultationPatient(req: BaseRequest): Promise<number> {
        return await this.PatientTrackerBo.CheckoutConsultationPatient(req);
    }

    public async DeletePatientTracker(req: BaseRequest): Promise<Boolean> {
        return await this.PatientTrackerBo.DeletePatientTracker(req);
    }

    public async SendSMSNotifications(req: BaseRequest): Promise<Boolean> {
        return await this.PatientTrackerBo.SendSMSNotifications(req);
    }
}
