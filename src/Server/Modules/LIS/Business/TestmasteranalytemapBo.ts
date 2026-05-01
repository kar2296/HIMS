import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { TestanalyteFilters } from '../Common/Filters.e';
import { TestmasteranalytemapInstance, TestmasteranalytemapAttributes } from '../Model/Interface/Index';

export class TestmasteranalytemapBo extends BaseBo<TestmasteranalytemapInstance, TestmasteranalytemapAttributes> {
    public async AddTestmasteranalytemap(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTestmasteranalytemap(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTestmasteranalytemapById(req: BaseRequest): Promise<TestmasteranalytemapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProfileTestIds(profileTestId: any): Promise<any> {
        let responseArr: Array<number> = [];
        let resultArr = await this.FindAll({
            where: {
                TestmasterId: profileTestId
            }
        });
        if (resultArr) {
            let resultAttrs = this.GetAttributes(resultArr);
            for (var idx in resultAttrs) {
                var item = resultAttrs[idx];
                responseArr.push(item.TestmasterMapId);
            }
        }
        return responseArr;
    }

    public async GetTestmasteranalytemaps(apiReq?: ApiRequest<TestanalyteFilters>): Promise<ApiResponse<TestmasteranalytemapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Testmaster, attributes: ['Code', 'Name', 'Mnemonics'], required: false });
        include.push({ model: this.Models.Testmaster, attributes: ['Code', 'Name', 'Mnemonics'], as: 'TestAnalyteName', required: false });
        include.push({ model: this.Models.Analytemaster, attributes: ['Code', 'Name', 'Mnemonics', 'Loincname'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TestanalyteFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TestanalyteFilters.TestMasterId:
                        where['TestMasterId'] = param.Value;
                        break;
                    case TestanalyteFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTestmasteranalytemap(req: BaseRequest): Promise<Boolean> {
        await this.Items.destroy({ where: { Id: req.Id }, limit: 1 });
        return true;
    }

    public GetModel(): SStatic.Model<TestmasteranalytemapInstance, TestmasteranalytemapAttributes> {
        return this.Models.Testmasteranalytemap;
    }
}
