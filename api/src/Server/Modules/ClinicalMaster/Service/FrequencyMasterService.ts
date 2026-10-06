import {BaseService, BoFactory } from '../../Base/Index';
import { FrequencyMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FrequencyMasterAttributes } from '../Model/Interface/Index';
import { FrequencyMasterFilters } from '../Common/Filters.e';

export class FrequencyMasterService extends BaseService {
    private FrequencyMasterBo: FrequencyMasterBo;
    constructor(req?: Request) {
        super(req);
        this.FrequencyMasterBo = BoFactory.GetBo(FrequencyMasterBo, this.Request);
    }

    public async AddFrequencyMaster(req: BaseRequest): Promise<number> {
        return await this.FrequencyMasterBo.AddFrequencyMaster(req);
    }

    public async UpdateFrequencyMaster(req: BaseRequest): Promise<boolean> {
        return await this.FrequencyMasterBo.UpdateFrequencyMaster(req);
    }

    public async GetFrequencyMasterById(req: BaseRequest): Promise<FrequencyMasterAttributes> {
        return await this.FrequencyMasterBo.GetFrequencyMasterById(req);
    }

    public async GetFrequencyMasters(apiReq?: ApiRequest<FrequencyMasterFilters>): Promise<ApiResponse<FrequencyMasterAttributes[]>> {
        return await this.FrequencyMasterBo.GetFrequencyMasters(apiReq);
    }

    public async DeleteFrequencyMaster(req: BaseRequest): Promise<Boolean> {
        return await this.FrequencyMasterBo.DeleteFrequencyMaster(req);
    }
}
