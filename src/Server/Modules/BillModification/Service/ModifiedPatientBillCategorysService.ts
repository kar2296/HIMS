import { BaseService, BoFactory } from '../../Base/Index';
import { ModifiedPatientBillCategorysBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ModifiedPatientBillCategorysAttributes } from '../Model/Interface/Index';
import { ModifiedPatientBillCategorysFilters } from '../Common/Filters.e';
import { FileInfo } from '../../../Core/Index';

export class ModifiedPatientBillCategorysService extends BaseService {
    private ModifiedPatientBillCategorysBo: ModifiedPatientBillCategorysBo;
    constructor(req?: Request) {
        super(req);
        this.ModifiedPatientBillCategorysBo = BoFactory.GetBo(ModifiedPatientBillCategorysBo, this.Request);
    }

    public async AddModifiedPatientBillCategorys(req: BaseRequest): Promise<number> {
        return await this.ModifiedPatientBillCategorysBo.AddModifiedPatientBillCategorys(req);
    }

    public async UpdateModifiedPatientBillCategorys(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillCategorysBo.UpdateModifiedPatientBillCategorys(req);
    }

    public async GetModifiedPatientBillCategorysById(req: BaseRequest): Promise<ModifiedPatientBillCategorysAttributes> {
        return await this.ModifiedPatientBillCategorysBo.GetModifiedPatientBillCategorysById(req);
    }

    public async GetModifiedPatientBillCategorys(apiReq?: ApiRequest<ModifiedPatientBillCategorysFilters>)
        : Promise<ApiResponse<ModifiedPatientBillCategorysAttributes[]>> {
        return await this.ModifiedPatientBillCategorysBo.GetModifiedPatientBillCategorys(apiReq);
    }

    public async DeleteModifiedPatientBillCategorys(req: BaseRequest): Promise<Boolean> {
        return await this.ModifiedPatientBillCategorysBo.DeleteModifiedPatientBillCategorys(req);
    }

    public async AcutalPrintPatientBillSummary(req: BaseRequest): Promise<FileInfo> {
        return await this.ModifiedPatientBillCategorysBo.AcutalPrintPatientBillSummary(req);
    }

}
