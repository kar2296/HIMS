import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientAttributes } from '../Model/Interface/Index';
import { PatientFilters } from '../Common/Filters.e';

export class PatientService extends BaseService {
    private PatientBo: PatientBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBo = BoFactory.GetBo(PatientBo, this.Request);
    }

    public async AddPatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddPatient(req);
    }

    public async AddSelfPatientWithoutSession(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddSelfPatientWithoutSession(req);
    }
    public async AddSpousePatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddSpousePatient(req);
    }

    public async AddPharmacyPatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddPharmacyPatient(req);
    }
    public async RegistrationCumVisit(req: BaseRequest): Promise<number> {
        return await this.PatientBo.RegistrationCumVisit(req);
    }

    public async ManageCrossConsultation(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.ManageCrossConsultation(req);
    }

    public async AddDayCarePatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddDayCarePatient(req);
    }

    public async UpdateDayCarePatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.UpdateDayCarePatient(req);
    }

    public async RegCumVisitWithBill(req: BaseRequest): Promise<number> {
        return await this.PatientBo.RegCumVisitWithBill(req);
    }

    public async RegCumVisitWithLIS(req: BaseRequest): Promise<number> {
        return await this.PatientBo.RegCumVisitWithLIS(req);
    }

    public async PrintPatientMedicalLeaveForm(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.PrintPatientMedicalLeaveForm(req);
    }

    public async UpdatePatientFamilyId(req: BaseRequest): Promise<number> {
        return await this.PatientBo.UpdatePatientFamilyId(req);
    }

    public async UpdatePatient(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.UpdatePatient(req);
    }

    public async AddSelfPatient(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddSelfPatient(req);
    }

    public async GetPatientProfilePic(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientProfilePic(req);
    }

    public async GetPatientmrnbarcode(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientmrnbarcode(req);
    }

    public async GetPatientMinimalInfoById(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientMinimalInfoById(req);
    }

    public async GetPatientById(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientById(req);
    }

    public async GetPatientBannerInfoById(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientBannerInfoById(req);
    }

    public async GetPatientInfoById(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientInfoById(req);
    }

    public async GetPatientByIdForPharmacy(req: BaseRequest): Promise<PatientAttributes> {
        return await this.PatientBo.GetPatientByIdForPharmacy(req);
    }

    public async GetPatients(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        return await this.PatientBo.GetPatients(apiReq);
    }

    public async GetPatientSearch(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        return await this.PatientBo.GetPatientSearch(apiReq);
    }

    public async GetMinPatientSearch(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        return await this.PatientBo.GetMinPatientSearch(apiReq);
    }

    public async GetPatientsInfoBanner(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        return await this.PatientBo.GetPatientsInfoBanner(apiReq);
    }


    public async DeletePatient(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBo.DeletePatient(req);
    }

    public async DummyVisitCreation(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.DummyVisitCreation(req);
    }

    public async DummyIPVisitCreation(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.DummyIPVisitCreation(req);
    }

    public async DummyIPOrderCreation(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.DummyIPOrderCreation(req);
    }

    public async PrintPatient(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.PrintPatient(req);
    }
    public async regprintform(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.regprintform(req);
    }

    public async PrintPatientWithEncounter(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.PrintPatientWithEncounter(req);
    }

    public async PrintPatientLabel(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.PrintPatientLabel(req);
    }
    public async PrintPatientList(apiReq?: ApiRequest<PatientFilters>): Promise<any> {
        return await this.PatientBo.PrintPatientList(apiReq);
    }
    public async PrintInActivePatientList(apiReq?: ApiRequest<PatientFilters>): Promise<any> {
        return await this.PatientBo.PrintInActivePatientList(apiReq);
    }
    public async PrintPatientCard(req: BaseRequest): Promise<string> {
        return await this.PatientBo.PrintPatientCard(req);
    }

    public async OPVisitCancel(req: BaseRequest): Promise<boolean> {
        return await this.PatientBo.OPVisitCancel(req);
    }
    public async PrintIpForms(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBo.PrintIpForms(req);
    }
    public async AddPatientMasterExcel(req: BaseRequest): Promise<number> {
        return await this.PatientBo.AddPatientMasterExcel(req);
    }

}
