import {BaseService, BoFactory } from '../../Base/Index';
import { PatientStockRequestDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientStockRequestDetailsAttributes } from '../Model/Interface/Index';
import { PatientStockRequestDetailsFilters } from '../Common/Filters.e';

export class PatientStockRequestDetailsService extends BaseService {
    private PatientStockRequestDetailsBo: PatientStockRequestDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientStockRequestDetailsBo = BoFactory.GetBo(PatientStockRequestDetailsBo, this.Request);
    }

    public async AddPatientStockRequestDetails(req: BaseRequest): Promise<number> {
        return await this.PatientStockRequestDetailsBo.AddPatientStockRequestDetails(req);
    }

    public async UpdatePatientStockRequestDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockRequestDetailsBo.UpdatePatientStockRequestDetails(req);
    }

    public async GetPatientStockRequestDetailsById(req: BaseRequest): Promise<PatientStockRequestDetailsAttributes> {
        return await this.PatientStockRequestDetailsBo.GetPatientStockRequestDetailsById(req);
    }

    public async GetPatientStockRequestDetails(apiReq?: ApiRequest<PatientStockRequestDetailsFilters>):
                    Promise<ApiResponse<PatientStockRequestDetailsAttributes[]>> {
        return await this.PatientStockRequestDetailsBo.GetPatientStockRequestDetails(apiReq);
    }

    public async DeletePatientStockRequestDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockRequestDetailsBo.DeletePatientStockRequestDetails(req);
    }
    public async PrintPatientIndentPendingReport(apiReq?: ApiRequest<PatientStockRequestDetailsFilters>): Promise<any> {
        return await this.PatientStockRequestDetailsBo.PrintPatientIndentPendingReport(apiReq);
    }
}
