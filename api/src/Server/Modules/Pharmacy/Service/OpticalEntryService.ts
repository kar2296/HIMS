import { BaseService, BoFactory } from '../../Base/Index';
import { OpticalEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OpticalEntryAttributes } from '../Model/Interface/Index';
import { OpticalEntryFilters } from '../Common/Filters.e';

export class OpticalEntryService extends BaseService {
    private OpticalEntryBo: OpticalEntryBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalEntryBo = BoFactory.GetBo(OpticalEntryBo, this.Request);
    }

    public async AddOpticalEntry(req: BaseRequest): Promise<number> {
        return await this.OpticalEntryBo.AddOpticalEntry(req);
    }

    public async UpdateOpticalEntry(req: BaseRequest): Promise<boolean> {
        return await this.OpticalEntryBo.UpdateOpticalEntry(req);
    }

    public async GetOpticalEntryById(req: BaseRequest): Promise<OpticalEntryAttributes> {
        return await this.OpticalEntryBo.GetOpticalEntryById(req);
    }

    public async GetOpticalEntrys(apiReq?: ApiRequest<OpticalEntryFilters>): Promise<ApiResponse<OpticalEntryAttributes[]>> {
        return await this.OpticalEntryBo.GetOpticalEntrys(apiReq);
    }

    public async DeleteOpticalEntry(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalEntryBo.DeleteOpticalEntry(req);
    }
}
