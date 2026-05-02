import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { EncounterAttributes } from '../Model/Interface/Index';
import { EncounterFilters } from '../Common/Filters.e';

export class EncounterService extends BaseService {
    private EncounterBo: EncounterBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterBo = BoFactory.GetBo(EncounterBo, this.Request);
    }

    public async AddEncounter(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.AddEncounter(req);
    }

    public async SMSWithVisitIdentifier(req: BaseRequest): Promise<boolean> {
        return await this.EncounterBo.SMSWithVisitIdentifier(req);
    }

    public async AddPharmacyEncounter(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.AddPharmacyEncounter(req);
    }

    public async UpdateEncounter(req: BaseRequest): Promise<boolean> {
        return await this.EncounterBo.UpdateEncounter(req);
    }

    public async postMedBlaze(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.postMedBlaze(req);
    }

    public async postWhatsapp(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.postWhatsapp(req);
    }

    public async ExcuteStoredProcedure(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.ExcuteStoredProcedure(req);
    }
    public async CancelAdmissionEncounter(req: BaseRequest): Promise<boolean> {
        return await this.EncounterBo.CancelAdmissionEncounter(req);
    }

    public async ManageEmergencyBillsTransfer(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.ManageEmergencyBillsTransfer(req);
    }

    public async ManageDayCareAdmissionEncounter(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.ManageDayCareAdmissionEncounter(req);
    }

    public async ManageAdmissionEncounter(req: BaseRequest): Promise<number> {
        return await this.EncounterBo.ManageAdmissionEncounter(req);
    }

    public async GetEncounterById(req: BaseRequest): Promise<EncounterAttributes> {
        return await this.EncounterBo.GetEncounterById(req);
    }

    public async GetListofEncounters(apiReq?: ApiRequest<EncounterAttributes>): Promise<number[]> {
        return await this.EncounterBo.GetListofEncounters(apiReq);
    }

    public async GetIPAdmissionSummaryDoctor(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetIPAdmissionSummaryDoctor(apiReq);
    }

    public async GetDocStatsDashBoard(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetDocStatsDashBoard(apiReq);
    }

    public async GetIPStatistics(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetIPStatistics(apiReq);
    }

    public async GetIPStatisticsByWard(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetIPStatisticsByWard(apiReq);
    }
    public async IPStatisticsWithDate(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.IPStatisticsWithDate(apiReq);
    }
    public async GetOutpatientSummaryDoctor(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetOutpatientSummaryDoctor(apiReq);
    }
    public async GetDiagnosissummaryforIp(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetDiagnosissummaryforIp(apiReq);
    }

    public async GetIPAdmissionSummaryInsurance(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetIPAdmissionSummaryInsurance(apiReq);
    }

    public async GetOutpatientSummaryInsurance(apiReq?: ApiRequest<EncounterFilters>):
        Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetOutpatientSummaryInsurance(apiReq);
    }

    public async GetOPDefaultServices(req: BaseRequest): Promise<any[]> {
        return await this.EncounterBo.GetOPDefaultServices(req);
    }

    public async GetEncounters(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetEncounters(apiReq);
    }

    public async GetMinEncounters(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetMinEncounters(apiReq);
    }

    public async GetAdditionalVisitwithoutIP(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetAdditionalVisitwithoutIP(apiReq);
    }

    public async GetEncounterAdvances(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetEncounterAdvances(apiReq);
    }

    public async DeleteEncounter(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterBo.DeleteEncounter(req);
    }

    public async PrintEncounter(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterBo.PrintEncounter(req);
    }

    public async PrintEncounter5(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterBo.PrintEncounter5(req);
    }

    public async PatientConsentPrint(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterBo.PatientConsentPrint(req);
    }

    public async DischargeSlipPrint(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterBo.DischargeSlipPrint(req);
    }

    public async PrintAdmissionLabel5(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterBo.PrintAdmissionLabel5(req);
    }

    public async AdmitAdmissionRequest(req: BaseRequest): Promise<any> {
        return await this.EncounterBo.AdmitAdmissionRequest(req);
    }

    public async GetIPPatientsBills(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetIPPatientsBills(apiReq);
    }

    public async GetMINIPPatientsBills(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        return await this.EncounterBo.GetMINIPPatientsBills(apiReq);
    }

    public async BIDepartmentCount(req: BaseRequest): Promise<any> {
        return await this.EncounterBo.BIDepartmentCount(req);
    }

    public async BIDoctorCount(req: BaseRequest): Promise<any> {
        return await this.EncounterBo.BIDoctorCount(req);
    }
    public async PrintIPAdmissionReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPAdmissionReport(apiReq);
    }
    public async PrintPatientListByDiagnosisReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintPatientListByDiagnosisReport(apiReq);
    }
    public async PrintIPDischargeReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPDischargeReport(apiReq);
    }
    public async PrintDeseasedPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintDeseasedPatientReport(apiReq);
    }
    public async PrintOutPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintOutPatientReport(apiReq);
    }
    public async PrintDayCareReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintDayCareReport(apiReq);
    }
    public async PrintMLCReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintMLCReport(apiReq);
    }
    public async PrintEmergencyPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintEmergencyPatientReport(apiReq);
    }
    public async PrintDayCaretoAdmissionPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintDayCaretoAdmissionPatientReport(apiReq);
    }
    public async PrintIPAdmissionInsuranceReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPAdmissionInsuranceReport(apiReq);
    }
    public async PrintIPPatientReferralReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPPatientReferralReport(apiReq);
    }
    public async PrintOPPatientReferralReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintOPPatientReferralReport(apiReq);
    }
    public async PrintIPBillReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPBillReport(apiReq);
    }
    public async PrintCurrentOccupancyReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintCurrentOccupancyReport(apiReq);
    }

    public async PrintIPAdmissionSummarybyDoctor(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPAdmissionSummarybyDoctor(apiReq);
    }
    public async PrintIPAdmissionSummarybyInsurance(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPAdmissionSummarybyInsurance(apiReq);
    }
    public async PrintOutpatientSummarybyInsurance(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintOutpatientSummarybyInsurance(apiReq);
    }
    public async PrintOutpatientSummary(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintOutpatientSummary(apiReq);
    }
    public async PrintOutpatientSummarybyDoctor(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintOutpatientSummarybyDoctor(apiReq);
    }
    public async PrintDiagnosissummaryforIp(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintDiagnosissummaryforIp(apiReq);
    }
    public async PrintIPDueReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPDueReport(apiReq);
    }
    public async PrintIPOccupancyAdvanceReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPOccupancyAdvanceReport(apiReq);
    }
    public async PrintIPStatisticsReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPStatisticsReport(apiReq);
    }
    public async PrintIPStatisticsByWard(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPStatisticsByWard(apiReq);
    }
    public async PrintIPDailyWiseStatisticsReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintIPDailyWiseStatisticsReport(apiReq);
    }
    public async BIDepartmentOPCount(req: BaseRequest): Promise<any> {
        return await this.EncounterBo.BIDepartmentOPCount(req);
    }
    public async PrintMLCPatientListReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintMLCPatientListReport(apiReq);
    }
    public async PrintDepartmentWiseStatisticsReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintDepartmentWiseStatisticsReport(apiReq);
    }
    public async PrintPreviuosSlip(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        return await this.EncounterBo.PrintPreviuosSlip(apiReq);
    }
}
