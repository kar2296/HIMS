import {BaseService, BoFactory } from '../../Base/Index';
import { PatientStockReturnDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientStockReturnDetailsAttributes } from '../Model/Interface/Index';
import { PatientStockReturnDetailsFilters } from '../Common/Filters.e';

export class PatientStockReturnDetailsService extends BaseService {
    private PatientStockReturnDetailsBo: PatientStockReturnDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientStockReturnDetailsBo = BoFactory.GetBo(PatientStockReturnDetailsBo, this.Request);
    }

    public async AddPatientStockReturnDetails(req: BaseRequest): Promise<number> {
        return await this.PatientStockReturnDetailsBo.AddPatientStockReturnDetails(req);
    }

    public async UpdatePatientStockReturnDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockReturnDetailsBo.UpdatePatientStockReturnDetails(req);
    }

    public async GetPatientStockReturnDetailsById(req: BaseRequest): Promise<PatientStockReturnDetailsAttributes> {
        return await this.PatientStockReturnDetailsBo.GetPatientStockReturnDetailsById(req);
    }

    public async GetPatientStockReturnDetails(apiReq?: ApiRequest<PatientStockReturnDetailsFilters>):
                    Promise<ApiResponse<PatientStockReturnDetailsAttributes[]>> {
        return await this.PatientStockReturnDetailsBo.GetPatientStockReturnDetails(apiReq);
    }

    public async DeletePatientStockReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockReturnDetailsBo.DeletePatientStockReturnDetails(req);
    }
}
