import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBillDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientBillDetailsAttributes } from '../Model/Interface/Index';
import { PatientBillDetailsFilters } from '../Common/Filters.e';

export class PatientBillDetailsService extends BaseService {
    private PatientBillDetailsBo: PatientBillDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillDetailsBo = BoFactory.GetBo(PatientBillDetailsBo, this.Request);
    }

    public async AddPatientBillDetails(req: BaseRequest): Promise<number> {
        return await this.PatientBillDetailsBo.AddPatientBillDetails(req);
    }

    public async UpdatePatientBillDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillDetailsBo.UpdatePatientBillDetails(req);
    }

    public async GetPatientBillDetailsById(req: BaseRequest): Promise<PatientBillDetailsAttributes> {
        return await this.PatientBillDetailsBo.GetPatientBillDetailsById(req);
    }

    public async GetPatientInsuranceBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientInsuranceBillDetails(apiReq);
    }

    public async GetPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientBillDetails(apiReq);
    }

    public async GetMinPatientBillDetailsforLock(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientBillDetails(apiReq);
    }

    public async GetPatientBillDetailsforprint(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientBillDetailsforprint(apiReq);
    }
    public async GetPatientBillDetailsforStockserialItem(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientBillDetailsforStockserialItem(apiReq);
    }

    public async GetPatientBillDetailsForPerformingDoctors(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientBillDetailsForPerformingDoctors(apiReq);
    }

    public async GetPatientPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientPharmacyBillDetails(apiReq);
    }

    public async GetPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPharmacyBillDetails(apiReq);
    }

    public async GetPatientOTPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPatientOTPharmacyBillDetails(apiReq);
    }

    public async UpdateBillRates(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdateBillRates(details);
    }

    public async UpdateInsuranceBill(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdateInsuranceBill(details);
    }

    public async UpdateDoctorShareDetails(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdateDoctorShareDetails(details);
    }

    public async UpdateInsuranceBillModifed(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdateInsuranceBillModifed(details);
    }
    public async ManagePatientBillComments(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillDetailsBo.ManagePatientBillComments(req);
    }

    public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetPreviousOrders(apiReq);
    }

    public async DeletePatientBillDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillDetailsBo.DeletePatientBillDetails(req);
    }
    public async UpdatePatientCancelItemwise(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdatePatientCancelItemwise(req);
    }
    public async SaleGSTDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.SaleGSTDetails(apiReq);
    }
    public async GetDailySalesSummarybyItem(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetDailySalesSummarybyItem(apiReq);
    }
    public async GetConsolidateSaleGst(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetConsolidateSaleGst(apiReq);
    }
    public async GetOverallConsolidateGst(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetOverallConsolidateGst(apiReq);
    }
    public async GetConsolidateOutputGst(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetConsolidateOutputGst(apiReq);
    }
    public async GetRevenueServiceItemSummary(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        return await this.PatientBillDetailsBo.GetRevenueServiceItemSummary(apiReq);
    }
    public async PrintLabRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintLabRevenueReport(apiReq);
    }
    public async PrintRadiologyRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintRadiologyRevenueReport(apiReq);
    }
    public async PrintPatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillDetailsBo.PrintPatientBillDetails(req);
    }
    public async PrintLabsummaryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintLabsummaryReport(apiReq);
    }
    public async PrintPharmacyScheduleReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintPharmacyScheduleReport(apiReq);
    }
    public async PrintPharmacyScheduleXReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintPharmacyScheduleXReport(apiReq);
    }
    public async PrintItemwisesalesprofit(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintItemwisesalesprofit(apiReq);
    }
    public async PrintRevenueSummaryCategoryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintRevenueSummaryCategoryReport(apiReq);
    }
    public async PrintDoctorRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintDoctorRevenueReport(apiReq);
    }
    public async PrintRevenueSummaryByServiceItem(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintRevenueSummaryByServiceItem(apiReq);
    }
    public async PrintItemCollectionSummaryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintItemCollectionSummaryReport(apiReq);
    }
    public async PrintItemCollectionSummaryOPReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintItemCollectionSummaryOPReport(apiReq);
    }
    public async PrintDailySalesandRevenueDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintDailySalesandRevenueDetails(apiReq);
    }
    public async PrintSaleGSTReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintSaleGSTReport(apiReq);
    }
    public async PrintConsolidateSaleGSTReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintConsolidateSaleGSTReport(apiReq);
    }
    public async PrintConsolidateOuputGSTSummary(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintConsolidateOuputGSTSummary(apiReq);
    }
    public async PrintDailySalesSummaryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintDailySalesSummaryReport(apiReq);
    }
    public async PrintOverallConsolidateGSTSummary(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        return await this.PatientBillDetailsBo.PrintOverallConsolidateGSTSummary(apiReq);
    }
    public async UpdateSimpleViewBill(BillData: BaseRequest): Promise<Boolean> {
        return await this.PatientBillDetailsBo.UpdateSimpleViewBill(BillData);
    }

    public async BICategoryRevneue(BillData: BaseRequest): Promise<any> {
        return await this.PatientBillDetailsBo.BICategoryRevneue(BillData);
    }
    public async ExcelPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<any> {
        return await this.PatientBillDetailsBo.ExcelPatientBillDetails(apiReq);
    }

}
