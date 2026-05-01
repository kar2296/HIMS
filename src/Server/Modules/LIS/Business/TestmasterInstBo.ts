import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TestmasterInstInstance, TestmasterInstAttributes } from '../Model/Interface/Index';
import { TestInstFilters } from '../Common/Filters.e';

export class TestmasterInstBo extends BaseBo<TestmasterInstInstance, TestmasterInstAttributes>  {
    public async AddTestmasterInst(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTestmasterInst(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTestmasterInstById(req: BaseRequest): Promise<TestmasterInstAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTestmasterInsts(apiReq?: ApiRequest<TestInstFilters>): Promise<ApiResponse<TestmasterInstAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TestInstFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TestInstFilters.TestMasterId:
                        where['TestMasterId'] = param.Value;
                        break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTestmasterInst(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TestmasterInstInstance, TestmasterInstAttributes> {
        return this.Models.TestmasterInst;
    }

}
