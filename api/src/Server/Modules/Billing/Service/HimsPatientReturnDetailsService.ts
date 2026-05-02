import { BaseService, BoFactory } from '../../Base/Index';
import { PatientReturnDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientReturnDetailsAttributes } from '../Model/Interface/Index';
import { PatientReturnDetailsFilters } from '../Common/Filters.e';

export class PatientReturnDetailsService extends BaseService {
    private PatientReturnDetailsBo: PatientReturnDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientReturnDetailsBo = BoFactory.GetBo(PatientReturnDetailsBo, this.Request);
    }

    public async AddPatientReturnDetails(req: BaseRequest): Promise<number> {
        return await this.PatientReturnDetailsBo.AddPatientReturnDetails(req);
    }

    public async UpdatePatientReturnDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientReturnDetailsBo.UpdatePatientReturnDetails(req);
    }

    public async GetPatientReturnDetailsById(req: BaseRequest): Promise<PatientReturnDetailsAttributes> {
        return await this.PatientReturnDetailsBo.GetPatientReturnDetailsById(req);
    }

    public async GetPatientReturnDetails(apiReq?: ApiRequest<PatientReturnDetailsFilters>):
        Promise<ApiResponse<PatientReturnDetailsAttributes[]>> {
        return await this.PatientReturnDetailsBo.GetPatientReturnDetails(apiReq);
    }
    public async SaleReturnGSTDetails(apiReq?: ApiRequest<PatientReturnDetailsFilters>):
        Promise<ApiResponse<PatientReturnDetailsAttributes[]>> {
        return await this.PatientReturnDetailsBo.SaleReturnGSTDetails(apiReq);
    }
    public async PrintSaleReturnGST(apiReq?: ApiRequest<PatientReturnDetailsFilters>): Promise<any> {
        return await this.PatientReturnDetailsBo.PrintSaleReturnGST(apiReq);
    }

    public async DeletePatientReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientReturnDetailsBo.DeletePatientReturnDetails(req);
    }
    public async PrintPatientReturnDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientReturnDetailsBo.PrintPatientReturnDetails(req);
    }
}
