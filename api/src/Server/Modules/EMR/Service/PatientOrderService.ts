import { BaseService, BoFactory } from '../../Base/Index';
import { PatientOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientOrderAttributes } from '../Model/Interface/Index';
import { PatientOrderFilters } from '../Common/Filters.e';

export class PatientOrderService extends BaseService {
    private PatientOrderBo: PatientOrderBo;
    constructor(req?: Request) {
        super(req);
        this.PatientOrderBo = BoFactory.GetBo(PatientOrderBo, this.Request);
    }

    public async AddPatientOrder(req: BaseRequest): Promise<number> {
        return await this.PatientOrderBo.AddPatientOrder(req);
    }

    public async AddPatientOrderWithExecutableProcedures(req: BaseRequest): Promise<number> {
        return await this.PatientOrderBo.AddPatientOrderWithExecutableProcedures(req);
    }

    public async UpdateOrderStatusPatientOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdateOrderStatusPatientOrder(req);
    }

    public async UpdatePatientOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdatePatientOrder(req);
    }

    public async UpdateCancelPatientOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdateCancelPatientOrder(req);
    }

    public async UpdateCancelclinicalPatientOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdateCancelclinicalPatientOrder(req);
    }

    public async UpdateorderCancelPatientOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdateorderCancelPatientOrder(req);
    }

    public async ManagePatientOrders(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.ManagePatientOrders(req);
    }

    public async UpdatePatientOrderReview(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdatePatientOrderReview(req);
    }

    public async GetPatientOrderById(req: BaseRequest): Promise<PatientOrderAttributes> {
        return await this.PatientOrderBo.GetPatientOrderById(req);
    }

    public async GetMinPatientOrderById(req: BaseRequest): Promise<PatientOrderAttributes> {
        return await this.PatientOrderBo.GetPatientOrderById(req);
    }

    public async GetPatientOrderByIdWithoutDetails(req: BaseRequest): Promise<PatientOrderAttributes> {
        return await this.PatientOrderBo.GetPatientOrderByIdWithoutDetails(req);
    }

    public async GetPatientOrderWithDetailsByBillingId(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        return await this.PatientOrderBo.GetPatientOrderWithDetailsByBillingId(apiReq);
    }

    public async GetPatientOrders(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        return await this.PatientOrderBo.GetPatientOrders(apiReq);
    }

    public async GetPatientOrdersforPreviousOrder(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        return await this.PatientOrderBo.GetPatientOrdersforPreviousOrder(apiReq);
    }

    public async GetMinPatientOrders(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        return await this.PatientOrderBo.GetMinPatientOrders(apiReq);
    }

    public async GetPatientOrderWithoutDetails(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        return await this.PatientOrderBo.GetPatientOrderWithoutDetails(apiReq);
    }
    public async DeletePatientOrder(req: BaseRequest): Promise<Boolean> {
        return await this.PatientOrderBo.DeletePatientOrder(req);
    }
    public async PrintPatientOrder(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintPatientOrder(req);
    }
    public async PrintPatientOrderInv(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintPatientOrderInv(req);
    }
    public async GetOrderHtml(req: BaseRequest): Promise<string> {
        return await this.PatientOrderBo.GetOrderHtml(req);
    }
    public async PrintPatientOrders(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintPatientOrders(req);
    }
    public async PrintPatientOrdersWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintPatientOrdersWithoutHeader(req);
    }
    public async PrintConsolidatedLabResult(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintConsolidatedLabResult(req);
    }
    public async PrintConsolidatedRadiologyResult(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.PrintConsolidatedRadiologyResult(req);
    }
    public async Printpreviousrisresults(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.Printpreviousrisresults(req);
    }
    public async Printpreviousendoscopyresults(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientOrderBo.Printpreviousendoscopyresults(req);
    }

    public async UpdateLabConsultationNote(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderBo.UpdateLabConsultationNote(req);
    }

}
