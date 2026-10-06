import { BaseService, BoFactory } from '../../Base/Index';
import { OPModifyPatBillsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { OPModifyPatBillsAttributes } from '../Model/Interface/Index';
import { PatientBillsFilters } from '../Common/Filters.e';

export class OPModifyPatBillsService extends BaseService {
    private OPModifyPatBillsBo: OPModifyPatBillsBo;
    constructor(req?: Request) {
        super(req);
        this.OPModifyPatBillsBo = BoFactory.GetBo(OPModifyPatBillsBo, this.Request);
    }

    public async AddPatientBills(req: BaseRequest): Promise<number> {
        return await this.OPModifyPatBillsBo.AddPatientBills(req);
    }

    public async GetFindPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<OPModifyPatBillsAttributes[]>> {
        return await this.OPModifyPatBillsBo.GetFindPharmacyBills(apiReq);
    }

    public async GetPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<OPModifyPatBillsAttributes[]>> {
        return await this.OPModifyPatBillsBo.GetPatientPharmacyBills(apiReq);
    }

    public async GetFindPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<OPModifyPatBillsAttributes[]>> {
        return await this.OPModifyPatBillsBo.GetFindPatientPharmacyBills(apiReq);
    }

    public async GetPatientBillsById(req: BaseRequest): Promise<OPModifyPatBillsAttributes> {
        return await this.OPModifyPatBillsBo.GetPatientBillsById(req);
    }

    public async GetPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<OPModifyPatBillsAttributes[]>> {
        return await this.OPModifyPatBillsBo.GetPatientBills(apiReq);
    }

    public async GetFindPatientBills(apiReq?: ApiRequest<PatientBillsFilters>): Promise<ApiResponse<OPModifyPatBillsAttributes[]>> {
        return await this.OPModifyPatBillsBo.GetFindPatientBills(apiReq);
    }

    public async DeletePatientBills(req: BaseRequest): Promise<Boolean> {
        return await this.OPModifyPatBillsBo.DeletePatientBills(req);
    }

    public async PrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintPatientBills(req);
    }

    public async PrintPatientBillsWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintPatientBillsWithoutHeader(req);
    }

    public async Printopcreditbill(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.Printopcreditbill(req);
    }

    public async PrintPatientBillsByPatient(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintPatientBillsByPatient(req);
    }

    public async PrintPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintPharmacyBills(req);
    }

    public async GetPendingOrders(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatBillsBo.GetPendingOrders(req);
    }

    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatBillsBo.GetPendingPrescriptions(req);
    }


    public async PrintInPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintInpatientBills(req);
    }

    public async PrintDailyInpatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintDailyInpatientBills(req);
    }

    public async PrintIPPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintIPPharmacyBills(req);
    }

    public async PrintOPPharmacyBillsforIP(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintOPPharmacyBillsforIP(req);
    }

    public async PrintIPBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintIPBillingPharmacyBills(req);
    }

    public async PrintOTBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintOTBillingPharmacyBills(req);
    }

    public async GetLastBillInfo(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatBillsBo.GetLastBillInfo(req);
    }

    public async DMPrintPatientBills(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatBillsBo.DMPrintPatientBills(req);
    }

    public async PrintDMIPPharmacyBills(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatBillsBo.PrintDMIPPharmacyBills(req);
    }

    public async PrintconsumerBills(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintconsumerBills(req);
    }

    public async PrintOPConsolidate(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillsBo.PrintOPConsolidate(req);
    }

}
