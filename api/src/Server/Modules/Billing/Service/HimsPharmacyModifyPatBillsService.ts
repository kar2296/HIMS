import { BaseService, BoFactory } from '../../Base/Index';
import { PharmacyModifyPatBillsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PharmacyModifyPatBillsAttributes } from '../Model/Interface/Index';
import { PatientBillsFilters } from '../Common/Filters.e';

export class PharmacyModifyPatBillsService extends BaseService {
    private PharmacyModifyPatBillsBo: PharmacyModifyPatBillsBo;
    constructor(req?: Request) {
        super(req);
        this.PharmacyModifyPatBillsBo = BoFactory.GetBo(PharmacyModifyPatBillsBo, this.Request);
    }

    public async AddPatientBills(req: BaseRequest): Promise<number> {
        return await this.PharmacyModifyPatBillsBo.AddPatientBills(req);
    }

    public async GetFindPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        return await this.PharmacyModifyPatBillsBo.GetFindPharmacyBills(apiReq);
    }

    public async GetPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        return await this.PharmacyModifyPatBillsBo.GetPatientPharmacyBills(apiReq);
    }

    public async GetFindPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        return await this.PharmacyModifyPatBillsBo.GetFindPatientPharmacyBills(apiReq);
    }

    public async GetPatientBillsById(req: BaseRequest): Promise<PharmacyModifyPatBillsAttributes> {
        return await this.PharmacyModifyPatBillsBo.GetPatientBillsById(req);
    }

    public async GetPatientBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        return await this.PharmacyModifyPatBillsBo.GetPatientBills(apiReq);
    }

    public async GetFindPatientBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        return await this.PharmacyModifyPatBillsBo.GetFindPatientBills(apiReq);
    }

    public async DeletePatientBills(req: BaseRequest): Promise<Boolean> {
        return await this.PharmacyModifyPatBillsBo.DeletePatientBills(req);
    }

    public async PrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintPatientBills(req);
    }

    public async PrintPatientBillsWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintPatientBillsWithoutHeader(req);
    }

    public async Printopcreditbill(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.Printopcreditbill(req);
    }

    public async PrintPatientBillsByPatient(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintPatientBillsByPatient(req);
    }

    public async PrintPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintPharmacyBills(req);
    }

    public async GetPendingOrders(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatBillsBo.GetPendingOrders(req);
    }

    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatBillsBo.GetPendingPrescriptions(req);
    }


    public async PrintInPatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintInpatientBills(req);
    }

    public async PrintDailyInpatientBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintDailyInpatientBills(req);
    }

    public async PrintIPPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintIPPharmacyBills(req);
    }

    public async PrintOPPharmacyBillsforIP(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintOPPharmacyBillsforIP(req);
    }

    public async PrintIPBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintIPBillingPharmacyBills(req);
    }

    public async PrintOTBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintOTBillingPharmacyBills(req);
    }

    public async GetLastBillInfo(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatBillsBo.GetLastBillInfo(req);
    }

    public async DMPrintPatientBills(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatBillsBo.DMPrintPatientBills(req);
    }

    public async PrintDMIPPharmacyBills(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatBillsBo.PrintDMIPPharmacyBills(req);
    }

    public async PrintconsumerBills(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintconsumerBills(req);
    }

    public async PrintOPConsolidate(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillsBo.PrintOPConsolidate(req);
    }

}
