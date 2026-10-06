import {BaseService, BoFactory } from '../../Base/Index';
import { FrequencyCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FrequencyCategoryAttributes } from '../Model/Interface/Index';
import { FrequencyCategoryFilters } from '../Common/Filters.e';

export class FrequencyCategoryService extends BaseService {
    private FrequencyCategoryBo: FrequencyCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.FrequencyCategoryBo = BoFactory.GetBo(FrequencyCategoryBo, this.Request);
    }

    public async AddFrequencyCategory(req: BaseRequest): Promise<number> {
        return await this.FrequencyCategoryBo.AddFrequencyCategory(req);
    }

    public async UpdateFrequencyCategory(req: BaseRequest): Promise<boolean> {
        return await this.FrequencyCategoryBo.UpdateFrequencyCategory(req);
    }

    public async GetFrequencyCategoryById(req: BaseRequest): Promise<FrequencyCategoryAttributes> {
        return await this.FrequencyCategoryBo.GetFrequencyCategoryById(req);
    }

    public async GetFrequencyCategorys(apiReq?: ApiRequest<FrequencyCategoryFilters>): Promise<ApiResponse<FrequencyCategoryAttributes[]>> {
        return await this.FrequencyCategoryBo.GetFrequencyCategorys(apiReq);
    }

    public async DeleteFrequencyCategory(req: BaseRequest): Promise<Boolean> {
        return await this.FrequencyCategoryBo.DeleteFrequencyCategory(req);
    }
}
