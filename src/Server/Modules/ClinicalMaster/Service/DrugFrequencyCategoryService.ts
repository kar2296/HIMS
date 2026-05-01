import {BaseService, BoFactory } from '../../Base/Index';
import { DrugFrequencyCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DrugFrequencyCategoryAttributes } from '../Model/Interface/Index';
import { DrugFrequencyCategoryFilters } from '../Common/Filters.e';

export class DrugFrequencyCategoryService extends BaseService {
    private DrugFrequencyCategoryBo: DrugFrequencyCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.DrugFrequencyCategoryBo = BoFactory.GetBo(DrugFrequencyCategoryBo, this.Request);
    }

    public async AddDrugFrequencyCategory(req: BaseRequest): Promise<number> {
        return await this.DrugFrequencyCategoryBo.AddDrugFrequencyCategory(req);
    }

    public async UpdateDrugFrequencyCategory(req: BaseRequest): Promise<boolean> {
        return await this.DrugFrequencyCategoryBo.UpdateDrugFrequencyCategory(req);
    }

    public async GetDrugFrequencyCategoryById(req: BaseRequest): Promise<DrugFrequencyCategoryAttributes> {
        return await this.DrugFrequencyCategoryBo.GetDrugFrequencyCategoryById(req);
    }

    public async GetDrugFrequencyCategorys(apiReq?: ApiRequest<DrugFrequencyCategoryFilters>):
     Promise<ApiResponse<DrugFrequencyCategoryAttributes[]>> {
        return await this.DrugFrequencyCategoryBo.GetDrugFrequencyCategorys(apiReq);
    }

    public async DeleteDrugFrequencyCategory(req: BaseRequest): Promise<Boolean> {
        return await this.DrugFrequencyCategoryBo.DeleteDrugFrequencyCategory(req);
    }
}
