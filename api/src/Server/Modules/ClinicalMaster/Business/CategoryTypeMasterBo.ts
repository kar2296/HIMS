import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CategoryTypeMasterInstance, CategoryTypeMasterAttributes } from '../Model/Interface/Index';
import { CategoryTypeMasterFilters } from '../Common/Filters.e';

export class CategoryTypeMasterBo extends BaseBo<CategoryTypeMasterInstance, CategoryTypeMasterAttributes>
    implements IOptionProvider {
    public async AddCategoryTypeMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCategoryTypeMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCategoryTypeMasterById(req: BaseRequest): Promise<CategoryTypeMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCategoryTypeMasters(apiReq?: ApiRequest<CategoryTypeMasterFilters>):
        Promise<ApiResponse<CategoryTypeMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CategoryTypeRef'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CategoryTypeMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CategoryTypeMasterFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case CategoryTypeMasterFilters.CategoryTypeRef:
                        where['CategoryTypeRefId'] = param.Value;
                        break;
                    case CategoryTypeMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCategoryTypeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CategoryTypeMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Description'];
        let val = await this.GetCategoryTypeMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CategoryTypeMasterInstance, CategoryTypeMasterAttributes> {
        return this.Models.CategoryTypeMaster;
    }

}
