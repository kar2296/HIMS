import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TestmasterBOMInstance, TestmasterBOMAttributes } from '../Model/Interface/Index';
import { TestmasterBOMFilters } from '../Common/Filters.e';

export class TestmasterBOMBo extends BaseBo<TestmasterBOMInstance, TestmasterBOMAttributes>  {
    public async AddTestmasterBOM(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTestmasterBOM(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTestmasterBOMById(req: BaseRequest): Promise<TestmasterBOMAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTestmasterBOMs(apiReq?: ApiRequest<TestmasterBOMFilters>): Promise<ApiResponse<TestmasterBOMAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemCode', 'ItemName',
                'ProductTypeId', 'SubProductTypeId'], required: false
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TestmasterBOMFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TestmasterBOMFilters.TestMasterId:
                    where['TestmasterId'] = param.Value;
                    break;
                case TestmasterBOMFilters.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTestmasterBOM(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TestmasterBOMInstance, TestmasterBOMAttributes> {
        return this.Models.TestmasterBOM;
    }

}
