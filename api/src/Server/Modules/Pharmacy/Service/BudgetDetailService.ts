import {BaseService, BoFactory } from '../../Base/Index';
import { BudgetDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BudgetDetailAttributes } from '../Model/Interface/Index';
import { BudgetDetailFilters } from '../Common/Filters.e';

export class BudgetDetailService extends BaseService {
    private BudgetDetailBo: BudgetDetailBo;
    constructor(req?: Request) {
        super(req);
        this.BudgetDetailBo = BoFactory.GetBo(BudgetDetailBo, this.Request);
    }

    public async AddBudgetDetail(req: BaseRequest): Promise<number> {
        return await this.BudgetDetailBo.AddBudgetDetail(req);
    }

    public async UpdateBudgetDetail(req: BaseRequest): Promise<boolean> {
        return await this.BudgetDetailBo.UpdateBudgetDetail(req);
    }

    public async GetBudgetDetailById(req: BaseRequest): Promise<BudgetDetailAttributes> {
        return await this.BudgetDetailBo.GetBudgetDetailById(req);
    }

    public async GetBudgetDetails(apiReq?: ApiRequest<BudgetDetailFilters>):
                    Promise<ApiResponse<BudgetDetailAttributes[]>> {
        return await this.BudgetDetailBo.GetBudgetDetails(apiReq);
    }

    public async DeleteBudgetDetail(req: BaseRequest): Promise<Boolean> {
        return await this.BudgetDetailBo.DeleteBudgetDetail(req);
    }
}
