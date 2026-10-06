import { BaseService, BoFactory } from '../../Base/Index';
import { LISInterfacePatientDetailsBo } from '../Business/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    LISInterfacePatientDetailsAttributes
} from '../Model/Interface/Index';
import { LISInterfacePatientDetailsFilters } from '../Common/Filters.e';
import { Request } from '../../../Core/Index';

export class LISInterfacePatientDetailsService extends BaseService {
    private LISInterfacePatientDetailsBo: LISInterfacePatientDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.LISInterfacePatientDetailsBo =
        BoFactory.GetBo(LISInterfacePatientDetailsBo, this.Request);
    }

    public async AddLISPatientDetails(req: BaseRequest): Promise<number> {
        return await this.LISInterfacePatientDetailsBo.AddLISPatientDetails(req);
    }

    public async UpdateLISPatientDetails(req: BaseRequest): Promise<any> {
        return await this.LISInterfacePatientDetailsBo.UpdateLISPatientDetails(req);
    }

    public async GetLISPatientDetailsById(req: BaseRequest):
    Promise<LISInterfacePatientDetailsAttributes> {
        return await this.LISInterfacePatientDetailsBo.GetLISPatientDetailsById(req);
    }

    public async GetLISPatientDetails(apiReq?: ApiRequest<LISInterfacePatientDetailsFilters>):
    Promise<ApiResponse<LISInterfacePatientDetailsAttributes[]>> {
        return await this.LISInterfacePatientDetailsBo.GetLISPatientDetails(apiReq);
    }

    public async DeleteLISResults(req: BaseRequest): Promise<any> {
        return await this.LISInterfacePatientDetailsBo.DeleteLISResults(req);
    }

}
