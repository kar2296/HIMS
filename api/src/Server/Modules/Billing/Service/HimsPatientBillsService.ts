import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBillsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientBillsAttributes } from '../Model/Interface/Index';
import { PatientBillsFilters } from '../Common/Filters.e';

export class PatientBillsService extends BaseService {
    private PatientBillsBo: PatientBillsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillsBo = BoFactory.GetBo(PatientBillsBo, this.Request);
    }

    public async AddPatientBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddPatientBills(req);
    }
    public async AddIPPatientBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddIPPatientBills(req);
    }
    public async AddBedChargePatientBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddBedChargePatientBills(req);
    }
    public async UpdatePatientBillsFromCancel(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsFromCancel(req);
    }
    public async UpdatePatientBillsCancel(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsCancel(req);
    }
    public async UpdatePatientBillsforDiscount(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsforDiscount(req);
    }
    public async UpdatePatientBillsforDue(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsforDue(req);
    }
    public async UpdatePatientBillsFromBedOccupancy(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsFromBedOccupancy(req);
    }

    public async UpdateBillDiscount(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdateBillDiscount(req);
    }

    public async UpdatePatientBillsFromPlans(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsFromPlans(req);
    }

    public async UpdatePatientBillsInsurance(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBillsInsurance(req);
    }

    public async UpdatePatientBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientBills(req);
    }

    public async UpdateVirtualPatientBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdateVirtualPatientBills(req);
    }

    public async AddPatientB2BBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddPatientB2BBills(req);
    }

    public async BIDeptRevneue(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.BIDeptRevneue(req);
    }

    public async checkBillCashAmount(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.checkBillCashAmount(req);
    }

    public async BIDoctorRevneue(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.BIDoctorRevneue(req);
    }

    public async GetRevenueDoctorSummary(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetRevenueDoctorSummary(req);
    }

    public async GetRevenueDepartmentSummary(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetRevenueDepartmentSummary(req);
    }
    public async GetPharmacyDetails(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetPharmacyDetails(req);
    }
    public async BIDiscountReport(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.BIDiscountReport(req);
    }

    public async BIDueReport(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.BIDueReport(req);
    }

    /*
    public async UpdatePatientB2BBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientB2BBills(req);
    }
    */

    public async AddPatientPharmacyBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddPatientPharmacyBills(req);
    }

    public async AddIPPatientPharmacyBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddIPPatientPharmacyBills(req);
    }

    public async AddConsignmentBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddConsignmentBills(req);
    }

    public async GetPatientTaxableBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientTaxableBills(apiReq);
    }

    public async UpdatePatientPharmacyBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientPharmacyBills(req);
    }

    public async GetPatientBillswithoutdetails(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientBillswithoutdetails(apiReq);
    }
    public async GetRevenueDetals(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetRevenueDetals(apiReq);
    }
    public async AddPatientOpticalBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddPatientOpticalBills(req);
    }

    public async UpdatePatientOpticalBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientOpticalBills(req);
    }

    public async ManageCashToCreditBill(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.ManageCashToCreditBill(req);
    }

    public async ManageIPCashToOPCreditBill(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.ManageIPCashToOPCreditBill(req);
    }

    public async GetFindPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetFindPharmacyBills(apiReq);
    }

    public async GetFindDirectPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetFindDirectPharmacyBills(apiReq);
    }

    public async GetPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientPharmacyBills(apiReq);
    }

    public async GetFindPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetFindPatientPharmacyBills(apiReq);
    }

    public async GetPatientBillsById(req: BaseRequest): Promise<PatientBillsAttributes> {
        return await this.PatientBillsBo.GetPatientBillsById(req);
    }

    public async GetPatientBillsByEncounterId(apiReq?: ApiRequest<PatientBillsFilters>): Promise<number> {
        return await this.PatientBillsBo.GetPatientBillsByEncounterId(apiReq);
    }

    public async GetPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientBills(apiReq);
    }

    public async GetPatientBillsemrbillingservice(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientBillsemrbillingservice(apiReq);
    }

    public async GetPatientBillsforInsuranceupdate(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientBillsforInsuranceupdate(apiReq);
    }

    public async GetPatientBillsforprint(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPatientBillsforprint(apiReq);
    }

    public async GetPharmacyPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetPharmacyPatientBills(apiReq);
    }

    public async checkBillFinalized(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.checkBillFinalized(apiReq);
    }

    public async GetClinicalPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetClinicalPatientBills(apiReq);
    }

    public async GetIPBillPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetIPBillPatientBills(apiReq);
    }

    public async GetInsuranceCreditSummary(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetInsuranceCreditSummary(apiReq);
    }

    public async PrintAllPharmacybilldetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintAllPharmacybilldetails(req);
    }

    public async GetInsuranceOutstandingSummary(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetInsuranceOutstandingSummary(apiReq);
    }

    public async GetStaffCreditSummary(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetStaffCreditSummary(apiReq);
    }

    public async WhatsAppDocumentSent(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillsBo.WhatsAppDocumentSent(req);
    }

    public async GetFindPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<PatientBillsAttributes[]>> {
        return await this.PatientBillsBo.GetFindPatientBills(apiReq);
    }

    public async DeletePatientBills(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillsBo.DeletePatientBills(req);
    }

    public async getPharmacyBillsWithReturn(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillsBo.getPharmacyBillsWithReturn(req);
    }

    public async getPharmacyClearanceBillsWithReturn(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillsBo.getPharmacyClearanceBillsWithReturn(req);
    }

    public async PrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPatientBills(req);
    }
    public async PrintOPPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintOPPatientBills(req);
    }
    public async PrintPatientBills1(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPatientBills1(req);
    }
    public async ModPrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.ModPrintPatientBills(req);
    }
    public async ThermalPrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.ThermalPrintPatientBills(req);
    }

    public async PrintPatientBillsWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPatientBillsWithoutHeader(req);
    }

    public async PrintPatientDGBillsWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPatientDGBillsWithoutHeader(req);
    }

    public async Printopcreditbill(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.Printopcreditbill(req);
    }

    public async PrintPatientBillsByPatient(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPatientBillsByPatient(req);
    }
    public async PrintCancelReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintCancelReport(apiReq);
    }
    public async PrintPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPharmacyBills(req);
    }
    public async PrintPharmacyBills1(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPharmacyBills1(req);
    }
    public async PrintIPCancelReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPCancelReport(apiReq);
    }

    public async PopulateInpatientBills(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PopulateInpatientBills(req);
    }

    public async PopulateRoomCharges(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PopulateRoomCharges(req);
    }

    public async PopulateIPBillsWithoutAutoCharge(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PopulateIPBillsWithoutAutoCharge(req);
    }

    public async GetPendingOrders(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetPendingOrders(req);
    }

    public async GetMultiPendingOrders(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetMultiPendingOrders(req);
    }

    public async GetPendingProcedureOrders(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetPendingProcedureOrders(req);
    }

    public async AddPatientStaffBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.AddPatientStaffBills(req);
    }

    public async UpdatePatientStaffBills(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdatePatientStaffBills(req);
    }

    public async PrintStaffBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintStaffBills(req);
    }

    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetPendingPrescriptions(req);
    }

    public async ManageIPBills(req: BaseRequest): Promise<number> {
        return await this.PatientBillsBo.ManageIPBills(req);
    }

    public async UpdateIpParentId(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.UpdateIpParentId(req);
    }

    public async ConsolidatePayment(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.ConsolidatePayment(req);
    }

    public async ConsolidatePharmacyPayment(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.ConsolidatePharmacyPayment(req);
    }

    public async PrintInPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintInpatientBills(req);
    }
    public async PrintNonMedical(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintNonMedical(req);
    }
    public async NewPrintInpatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.NewPrintInpatientBills(req);
    }

    public async PrintDailyBillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintDailyBillReport(apiReq);
    }
    public async PrintOpticalDailybillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintOpticalDailybillReport(apiReq);
    }
    public async PrintInsuranceCreditSummary(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintInsuranceCreditSummary(apiReq);
    }
    public async PrintInsuranceOutstandingSummary(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintInsuranceOutstandingSummary(apiReq);
    }
    public async PrintStaffCreditSummary(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintStaffCreditSummary(apiReq);
    }
    public async PrintDiscountReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintDiscountReport(apiReq);
    }
    public async PrintIPDiscountReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPDiscountReport(apiReq);
    }
    public async PrintOutstandingReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintOutstandingReport(apiReq);
    }
    public async PrintIPDueReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPDueReport(apiReq);
    }
    public async PrintPharmacyBillDetailReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyBillDetailReport(apiReq);
    }
    public async PrintStaffCreditBillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintStaffCreditBillReport(apiReq);
    }
    public async PrintStaffPendingPaymentReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintStaffPendingPaymentReport(apiReq);
    }
    public async PrintPharmacyDiscountReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyDiscountReport(apiReq);
    }
    public async PrintPharmacyDueReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyDueReport(apiReq);
    }
    public async PrintOPBillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintOPBillReport(apiReq);
    }
    public async PrintIPBillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPBillReport(apiReq);
    }
    public async PrintDirectBillReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintDirectBillReport(apiReq);
    }
    public async PrintInpatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintInpatientBillDetails(req);
    }
    public async PrintDailyInpatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintDailyInpatientBills(req);
    }

    public async PrintIPPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintIPPharmacyBills(req);
    }

    public async PrintOPPharmacyBillsforIP(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintOPPharmacyBillsforIP(req);
    }

    public async PrintIPBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintIPBillingPharmacyBills(req);
    }

    public async PrintOTBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintOTBillingPharmacyBills(req);
    }

    public async GetLastBillInfo(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.GetLastBillInfo(req);
    }

    public async DMPrintPatientBills(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.DMPrintPatientBills(req);
    }

    public async DMPrintPharmacyBillsWithReturn(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.DMPrintPharmacyBillsWithReturn(req);
    }

    public async PrintDMIPPharmacyBills(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PrintDMIPPharmacyBills(req);
    }

    public async CancelIPPatientBill(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillsBo.CancelIPPatientBill(req);
    }

    public async PrintconsumerBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintconsumerBills(req);
    }

    public async PrintOPConsolidate(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintOPConsolidate(req);
    }

    public async PrintOPConsolidateWithoutPharmacy(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintOPConsolidateWithoutPharmacy(req);
    }
    public async PrintConsolidatedPharmacybilldetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintConsolidatedPharmacybilldetails(req);
    }
    public async PrintConsolidatedAllPharmacybilldetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintConsolidatedAllPharmacybilldetails(req);
    }
    public async PrintConsolidatedOPbilldetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintConsolidatedOPbilldetails(req);
    }
    public async PrintConsolidatedallbilldetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintConsolidatedallbilldetails(req);
    }
    public async PrintPharmacyConsolidatedbill(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPharmacyConsolidatedbill(req);
    }
    public async PrintRevenueSummaryDoctorReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintRevenueSummaryDoctorReport(apiReq);
    }
    public async PrintRevenueSummaryDepartmentReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintRevenueSummaryDepartmentReport(apiReq);
    }
    public async PrintCollectionReportByCashier(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PrintCollectionReportByCashier(req);
    }
    public async PrintPharmacyCollectionReport(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyCollectionReport(req);
    }
    public async PrintPharmacyCollectionAllCashier(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyCollectionAllCashier(req);
    }
    public async PrintPharmacyCollectionSummaryReport(req: BaseRequest): Promise<any> {
        return await this.PatientBillsBo.PrintPharmacyCollectionSummaryReport(req);
    }
    public async PrintIPInsuranceReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPInsuranceReport(apiReq);
    }
    public async PrintIPPharmacyIssueReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintIPPharmacyIssueReport(apiReq);
    }
    public async PrintInsuranceAgingReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintInsuranceAgingReport(apiReq);
    }
    public async PrintReferralDoctorRevenueDetailsReport(apiReq?: ApiRequest<PatientBillsFilters>): Promise<any> {
        return await this.PatientBillsBo.PrintReferralDoctorRevenueDetailsReport(apiReq);
    }
    public async PrintPharmacyClearance(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillsBo.PrintPharmacyClearance(req);
    }
    public async getInpatientBillDetails(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<any> {
        return await this.PatientBillsBo.getInpatientBillDetails(apiReq);
    }
}
