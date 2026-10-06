import { BaseService, BoFactory } from '../../Base/Index';
import { PatientPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientPaymentDetailsAttributes } from '../Model/Interface/Index';
import { PatientPaymentDetailsFilters } from '../Common/Filters.e';

export class PatientPaymentDetailsService extends BaseService {
    private PatientPaymentDetailsBo: PatientPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientPaymentDetailsBo = BoFactory.GetBo(PatientPaymentDetailsBo, this.Request);
    }

    public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.PatientPaymentDetailsBo.AddPatientPaymentDetails(req);
    }

    public async AddStaffPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.PatientPaymentDetailsBo.AddStaffPatientPaymentDetails(req);
    }

    public async ManageReceiptWithAdjustment(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.ManageReceiptWithAdjustment(req);
    }

    public async ManagePaymodeChange(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.ManagePaymodeChange(req);
    }

    public async UpdatePatientPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.UpdatePatientPaymentDetails(req);
    }

    public async FullBillCancel(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.FullBillCancel(req);
    }

    public async GetPatientPaymentDetailsById(req: BaseRequest): Promise<PatientPaymentDetailsAttributes> {
        return await this.PatientPaymentDetailsBo.GetPatientPaymentDetailsById(req);
    }

    public async GetPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetPatientPaymentDetails(apiReq);
    }

    public async GetMinPatientPaymentDetailsforLock(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetMinPatientPaymentDetailsforLock(apiReq);
    }

    public async GetPharmacySalesCollections(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetPharmacySalesCollections(apiReq);
    }
    public async GetPharmacyCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetPharmacyCollectionSummary(apiReq);
    }
    public async GetBillingCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetBillingCollectionSummary(apiReq);
    }
    public async GetOverallCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetOverallCollectionSummary(apiReq);
    }
    public async GetOPBillingCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetOPBillingCollectionSummary(apiReq);
    }

    public async GetOverallCollectionCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetOverallCollectionCashier(apiReq);
    }
    public async GetUserWiseCollectionCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
    Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
    return await this.PatientPaymentDetailsBo.GetUserWiseCollectionCashier(apiReq);
}
    public async GetIPBillingCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PatientPaymentDetailsBo.GetIPBillingCollectionSummary(apiReq);
    }

    public async DeletePatientPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientPaymentDetailsBo.DeletePatientPaymentDetails(req);
    }

    public async ModifyPatientPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.ModifyPatientPaymentDetails(req);
    }

    public async BIReportOverAllCollection(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentDetailsBo.BIReportOverAllCollection(req);
    }

    public async PrintPatientPaymentDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientPaymentDetailsBo.PrintPatientPaymentDetails(req);
    }

    public async DMPrintPatientPaymentDetails(req: BaseRequest): Promise<any> {
        return await this.PatientPaymentDetailsBo.DMPrintPatientPaymentDetails(req);
    }
    public async PrintCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintCollectionReport(apiReq);
    }
    public async PrintCollectionSummaryOPIP(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientPaymentDetailsBo.PrintCollectionSummaryOPIP(req);
    }
    public async PrintPharmacyCardCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintPharmacyCardCollectionReport(apiReq);
    }
    public async PrintPharmacyCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintPharmacyCollectionSummaryCashier(apiReq);
    }
    public async PrintOPIPCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintOPIPCollectionSummaryCashier(apiReq);
    }
    public async PrintOPCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintOPCollectionSummaryCashier(apiReq);
    }
    public async PrintIPCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintIPCollectionSummaryCashier(apiReq);
    }
    public async PrintOverallCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintOverallCollectionSummaryCashier(apiReq);
    }
    public async PrintIPCollectionReportByCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintIPCollectionReportByCashier(apiReq);
    }
    public async PrintOverallCollectionSummary(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintOverallCollectionSummary(apiReq);
    }
    public async PrintUserWiseCollectionSummaryCashier(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintUserWiseCollectionSummaryCashier(apiReq);
    }
    public async PrintPharmacyDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintPharmacyDueCollectionReport(apiReq);
    }
    public async PrintOPDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintOPDueCollectionReport(apiReq);
    }
    public async PrintIPDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintIPDueCollectionReport(apiReq);
    }
    public async GetSystemDatetime(req: BaseRequest): Promise<Date> {
        return await this.PatientPaymentDetailsBo.GetSystemDatetime(req);
    }
    public async PrintAdvanceFundDetailsReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintAdvanceFundDetailsReport(apiReq);
    }
     public async PrintIRDSalesReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        return await this.PatientPaymentDetailsBo.PrintIRDSalesReport(apiReq);
    }

}
