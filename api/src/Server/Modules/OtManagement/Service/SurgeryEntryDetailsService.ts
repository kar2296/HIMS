import { BaseService, BoFactory } from '../../Base/Index';
import { SurgeryEntryDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { SurgeryEntryDetailsAttributes } from '../Model/Interface/Index';
import { SurgeryEntryDetailsFilters } from '../Common/Filters.e';

export class SurgeryEntryDetailsService extends BaseService {
    private SurgeryEntryDetailsBo: SurgeryEntryDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.SurgeryEntryDetailsBo = BoFactory.GetBo(SurgeryEntryDetailsBo, this.Request);
    }

    public async AddSurgeryEntryDetails(req: BaseRequest): Promise<number> {
        return await this.SurgeryEntryDetailsBo.AddSurgeryEntryDetails(req);
    }

    public async UpdateSurgeryEntryDetails(req: BaseRequest): Promise<boolean> {
        return await this.SurgeryEntryDetailsBo.UpdateSurgeryEntryDetails(req);
    }

    public async GetSurgeryEntryDetailsById(req: BaseRequest): Promise<SurgeryEntryDetailsAttributes> {
        return await this.SurgeryEntryDetailsBo.GetSurgeryEntryDetailsById(req);
    }

    public async GetSurgeryEntryDetails(apiReq?:
        ApiRequest<SurgeryEntryDetailsFilters>):
        Promise<ApiResponse<SurgeryEntryDetailsAttributes[]>> {
        return await this.SurgeryEntryDetailsBo.GetSurgeryEntryDetails(apiReq);
    }

    // public async DeleteSurgeryEntryDetails(req: BaseRequest): Promise<Boolean> {
    //     return await this.SurgeryEntryDetailsBo.DeleteSurgeryEntryDetails(req);
    // }

    // public async PrintSurgeryEntryDetails(apiReq?: ApiRequest<SurgeryEntryDetailsFilters>): Promise<any> {
    //     return await this.SurgeryEntryDetailsBo.PrintSurgeryEntryDetails(apiReq);
    // }

    // public async PrintSurgeryEntryDetailsreport(apiReq?: ApiRequest<SurgeryEntryDetailsFilters>): Promise<any> {
    //     return await this.SurgeryEntryDetailsBo.PrintSurgeryEntryDetailsreport(apiReq);
    // }

}
