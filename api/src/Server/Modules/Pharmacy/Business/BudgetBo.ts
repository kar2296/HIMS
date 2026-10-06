import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BudgetInstance, BudgetAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { BudgetFilters } from '../Common/Filters.e';

export class BudgetBo extends BaseBo<BudgetInstance, BudgetAttributes>  {

    public async AddBudget(req: BaseRequest): Promise<number> {
        let detailBO = BoFactory.GetBo(bo.BudgetDetailBo, this.Request);
        let result = await this.Save(req.Data);
        await detailBO.ManageBudgetDetails(result.dataValues.Id, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateBudget(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let detailBO = BoFactory.GetBo(bo.BudgetDetailBo, this.Request);
        await detailBO.ManageBudgetDetails(req.Data.Id, req.Data.Details);
        return result;
    }
    public async GetBudgetById(req: BaseRequest): Promise<BudgetAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBudgets(apiReq?: ApiRequest<BudgetFilters>): Promise<ApiResponse<BudgetAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BudgetFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BudgetFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case BudgetFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBudget(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }


    public GetModel(): SStatic.Model<BudgetInstance, BudgetAttributes> {
        return this.Models.Budget;
    }

}
