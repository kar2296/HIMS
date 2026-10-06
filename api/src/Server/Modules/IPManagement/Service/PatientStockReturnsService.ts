import { BaseService, BoFactory } from '../../Base/Index';
import { PatientStockReturnsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientStockReturnsAttributes } from '../Model/Interface/Index';
import { PatientStockReturnsFilters } from '../Common/Filters.e';

export class PatientStockReturnsService extends BaseService {
    private PatientStockReturnsBo: PatientStockReturnsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientStockReturnsBo = BoFactory.GetBo(PatientStockReturnsBo, this.Request);
    }

    public async AddPatientStockReturns(req: BaseRequest): Promise<number> {
        return await this.PatientStockReturnsBo.AddPatientStockReturns(req);
    }

    public async UpdatePatientStockReturns(req: BaseRequest): Promise<boolean> {
        return await this.PatientStockReturnsBo.UpdatePatientStockReturns(req);
    }

    public async GetPatientStockReturnsById(req: BaseRequest): Promise<PatientStockReturnsAttributes> {
        return await this.PatientStockReturnsBo.GetPatientStockReturnsById(req);
    }

    public async GetPatientStockReturns(apiReq?: ApiRequest<PatientStockReturnsFilters>)
        : Promise<ApiResponse<PatientStockReturnsAttributes[]>> {
        return await this.PatientStockReturnsBo.GetPatientStockReturns(apiReq);
    }

    public async DeletePatientStockReturns(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockReturnsBo.DeletePatientStockReturns(req);
    }

    public async RejectPatientStockReturns(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockReturnsBo.RejectPatientStockReturns(req);
    }

    public async CompletePatientStockReturn(req: BaseRequest): Promise<Boolean> {
        return await this.PatientStockReturnsBo.CompletePatientStockReturn(req);
    }
    public async PrintPatientStockReturns(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientStockReturnsBo.PrintPatientStockReturns(req);
    }
}
