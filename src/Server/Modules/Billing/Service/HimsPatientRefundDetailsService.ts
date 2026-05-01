import {BaseService, BoFactory } from '../../Base/Index';
import { PatientRefundDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientRefundDetailsAttributes } from '../Model/Interface/Index';

export class PatientRefundDetailsService extends BaseService {
    private PatientRefundDetailsBo: PatientRefundDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientRefundDetailsBo = BoFactory.GetBo(PatientRefundDetailsBo, this.Request);
    }

    public async AddPatientRefundDetails(req: BaseRequest): Promise<number> {
        return await this.PatientRefundDetailsBo.AddPatientRefundDetails(req);
    }

    public async UpdatePatientRefundDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientRefundDetailsBo.UpdatePatientRefundDetails(req);
    }

    public async GetPatientRefundDetailsById(req: BaseRequest): Promise<PatientRefundDetailsAttributes> {
        return await this.PatientRefundDetailsBo.GetPatientRefundDetailsById(req);
    }

    public async GetPatientRefundDetails(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientRefundDetailsAttributes[]>> {
        return await this.PatientRefundDetailsBo.GetPatientRefundDetails(apiReq);
    }

    public async DeletePatientRefundDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientRefundDetailsBo.DeletePatientRefundDetails(req);
    }
}
