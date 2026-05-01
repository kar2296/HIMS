import { BaseService, BoFactory } from '../../Base/Index';
import { PatientStockRequestsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientStockRequestsAttributes } from '../Model/Interface/Index';
import { PatientStockRequestsFilters } from '../Common/Filters.e';

export class PatientStockRequestsService extends BaseService {
    private PatientStockRequestsBo: PatientStockRequestsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientStockRequestsBo = BoFactory.GetBo(PatientStockRequestsBo, this.Request);
    }

    public async AddPatientStockRequests(req: BaseRequest): Promise<number> {
        return await this.PatientStockRequestsBo.AddPatientStockRequests(req);
    }

    public async UpdatePatientStockRequests(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockRequestsBo.UpdatePatientStockRequests(req);
    }

    public async CompletePatientStockRequest(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockRequestsBo.CompletePatientStockRequest(req);
    }

    public async RejectPatientStockRequest(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockRequestsBo.RejectPatientStockRequest(req);
    }

    public async GetPatientStockRequestsById(req: BaseRequest): Promise<PatientStockRequestsAttributes> {
        return await this.PatientStockRequestsBo.GetPatientStockRequestsById(req);
    }

    public async GetPendingIndents(req: BaseRequest): Promise<PatientStockRequestsAttributes> {
        return await this.PatientStockRequestsBo.GetPendingIndents(req);
    }

    public async GetPatientStockRequests(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        return await this.PatientStockRequestsBo.GetPatientStockRequests(apiReq);
    }

    public async GetPatientWorkLists(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        return await this.PatientStockRequestsBo.GetPatientWorkLists(apiReq);
    }

    public async GetPatientStockRequestsList(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        return await this.PatientStockRequestsBo.GetPatientStockRequestsList(apiReq);
    }

    public async DeletePatientStockRequests(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockRequestsBo.DeletePatientStockRequests(req);
    }
    public async PrintPatientStockRequest(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientStockRequestsBo.PrintPatientStockRequest(req);
    }
    public async PrintPatientStockReceive(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientStockRequestsBo.PrintPatientStockReceive(req);
    }
    public async PrintPatientMedicineReport(apiReq?: ApiRequest<PatientStockRequestsFilters>): Promise<any> {
        return await this.PatientStockRequestsBo.PrintPatientMedicineReport(apiReq);
    }
}
