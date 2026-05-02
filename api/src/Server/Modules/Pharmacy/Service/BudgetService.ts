import {BaseService, BoFactory} from '../../Base/Index';
import { BudgetBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { BudgetAttributes} from '../Model/Interface/Index';
import { BudgetFilters } from '../Common/Filters.e';

export class BudgetService extends BaseService {
    private BudgetBo: BudgetBo;
    constructor(req?: Request) {
        super(req);
        this.BudgetBo = BoFactory.GetBo(BudgetBo, this.Request);
    }

    public async AddBudget(req: BaseRequest): Promise<number> {
        return await this.BudgetBo.AddBudget(req);
    }

    public async UpdateBudget(req: BaseRequest): Promise<boolean> {
        return await this.BudgetBo.UpdateBudget(req);
    }

    public async GetBudgetById(req: BaseRequest): Promise<BudgetAttributes> {
        return await this.BudgetBo.GetBudgetById(req);
    }

    public async GetBudgets(apiReq?: ApiRequest<BudgetFilters>): Promise<ApiResponse<BudgetAttributes[]>> {
        return await this.BudgetBo.GetBudgets(apiReq);
    }

    public async DeleteBudget(req: BaseRequest): Promise<Boolean> {
        return await this.BudgetBo.DeleteBudget(req);
    }
}
