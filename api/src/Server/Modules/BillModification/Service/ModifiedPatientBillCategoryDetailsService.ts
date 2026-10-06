import { BaseService, BoFactory } from '../../Base/Index';
import { ModifiedPatientBillCategoryDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ModifiedPatientBillCategoryDetailsAttributes } from '../Model/Interface/Index';
import { ModifiedPatientBillCategoryDetailsFilters } from '../Common/Filters.e';

export class ModifiedPatientBillCategoryDetailsService extends BaseService {
    private ModifiedPatientBillCategoryDetailsBo: ModifiedPatientBillCategoryDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.ModifiedPatientBillCategoryDetailsBo = BoFactory.GetBo(ModifiedPatientBillCategoryDetailsBo, this.Request);
    }

    public async AddModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<number> {
        return await this.ModifiedPatientBillCategoryDetailsBo.AddModifiedPatientBillCategoryDetails(req);
    }

    public async UpdateModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillCategoryDetailsBo.UpdateModifiedPatientBillCategoryDetails(req);
    }

    public async GetModifiedPatientBillCategoryDetailsById(req: BaseRequest): Promise<ModifiedPatientBillCategoryDetailsAttributes> {
        return await this.ModifiedPatientBillCategoryDetailsBo.GetModifiedPatientBillCategoryDetailsById(req);
    }

    public async GetModifiedPatientBillCategoryDetails(apiReq?: ApiRequest<ModifiedPatientBillCategoryDetailsFilters>)
        : Promise<ApiResponse<ModifiedPatientBillCategoryDetailsAttributes[]>> {
        return await this.ModifiedPatientBillCategoryDetailsBo.GetModifiedPatientBillCategoryDetails(apiReq);
    }

    public async DeleteModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<Boolean> {
        return await this.ModifiedPatientBillCategoryDetailsBo.DeleteModifiedPatientBillCategoryDetails(req);
    }
}
