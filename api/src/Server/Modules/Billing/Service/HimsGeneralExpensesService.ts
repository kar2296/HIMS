import {BaseService, BoFactory} from '../../Base/Index';
import { GeneralExpensesBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request,FileInfo} from '../../../Core/Index';
import { GeneralExpensesAttributes} from '../Model/Interface/Index';
import { GeneralExpensesFilters } from '../Common/Filters.e';

export class GeneralExpensesService extends BaseService {
    private GeneralExpensesBo: GeneralExpensesBo;
    constructor(req?: Request) {
        super(req);
        this.GeneralExpensesBo = BoFactory.GetBo(GeneralExpensesBo, this.Request);
    }

    public async AddGeneralExpenses(req: BaseRequest): Promise<number> {
        return await this.GeneralExpensesBo.AddGeneralExpenses(req);
    }

    public async UpdateGeneralExpenses(req: BaseRequest): Promise<boolean> {
        return await this.GeneralExpensesBo.UpdateGeneralExpenses(req);
    }

    public async GetGeneralExpensesById(req: BaseRequest): Promise<GeneralExpensesAttributes> {
        return await this.GeneralExpensesBo.GetGeneralExpensesById(req);
    }

    public async GetGeneralExpensess(apiReq?: ApiRequest<GeneralExpensesFilters>): Promise<ApiResponse<GeneralExpensesAttributes[]>> {
        return await this.GeneralExpensesBo.GetGeneralExpensess(apiReq);
    }

    public async DeleteGeneralExpenses(req: BaseRequest): Promise<Boolean> {
        return await this.GeneralExpensesBo.DeleteGeneralExpenses(req);
    }
    public async PrintGeneralExpenses(req: BaseRequest): Promise<FileInfo> {
        return await this.GeneralExpensesBo.PrintGeneralExpenses(req);
    }
    public async PrintGeneralExpenseList(apiReq?: ApiRequest<GeneralExpensesFilters>): Promise<any> {
        return await this.GeneralExpensesBo.PrintGeneralExpenseList(apiReq);
    }
}
