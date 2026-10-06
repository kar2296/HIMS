import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorInvoiceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { DoctorInvoiceAttributes } from '../Model/Interface/Index';
import { DoctorInvoiceFilters } from '../Common/Filters.e';

export class DoctorInvoiceService extends BaseService {
    private DoctorInvoiceBo: DoctorInvoiceBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorInvoiceBo = BoFactory.GetBo(DoctorInvoiceBo, this.Request);
    }

    public async AddDoctorInvoice(req: BaseRequest): Promise<number> {
        return await this.DoctorInvoiceBo.AddDoctorInvoice(req);
    }

    public async UpdateDoctorInvoice(req: BaseRequest): Promise<boolean> {
        return await this.DoctorInvoiceBo.UpdateDoctorInvoice(req);
    }

    public async GetDoctorInvoiceById(req: BaseRequest): Promise<DoctorInvoiceAttributes> {
        return await this.DoctorInvoiceBo.GetDoctorInvoiceById(req);
    }

    public async GetDoctorInvoices(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<ApiResponse<DoctorInvoiceAttributes[]>> {
        return await this.DoctorInvoiceBo.GetDoctorInvoices(apiReq);
    }

    public async getExcuteStoredProcedure(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<ApiResponse<DoctorInvoiceAttributes[]>> {
        return await this.DoctorInvoiceBo.getExcuteStoredProcedure(apiReq);
    }

    public async DeleteDoctorInvoice(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorInvoiceBo.DeleteDoctorInvoice(req);
    }
    public async PrintDoctorInvoice(req: BaseRequest): Promise<FileInfo> {
        return await this.DoctorInvoiceBo.PrintDoctorInvoice(req);
    }
    public async PrintDoctorInvoiceTds(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        return await this.DoctorInvoiceBo.PrintDoctorInvoiceTds(apiReq);
    }
    public async PrintDoctorInvoiceReport(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        return await this.DoctorInvoiceBo.PrintDoctorInvoiceReport(apiReq);
    }
    public async PrintOutstandingPaymentReport(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        return await this.DoctorInvoiceBo.PrintOutstandingPaymentReport(apiReq);
    }
}
