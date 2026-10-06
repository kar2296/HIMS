import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemCategoryInstance, ItemCategoryAttributes } from '../Model/Interface/Index';
import { ItemCategoryFilters } from '../Common/Filters.e';

export class ItemCategoryBo extends BaseBo<ItemCategoryInstance, ItemCategoryAttributes> {
    public async AddItemCategory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemCategory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemCategoryById(req: BaseRequest): Promise<ItemCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemCategorys(apiReq?: ApiRequest<ItemCategoryFilters>): Promise<ApiResponse<ItemCategoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemCategoryFilters.Code:
                        where['CategoryCode'] = { '$like': param.Value + '%' };
                        break;
                    case ItemCategoryFilters.Name:
                        where['CategoryName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemCategoryFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemCategoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteItemCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemCategoryInstance, ItemCategoryAttributes> {
        return this.Models.ItemCategory;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CategoryName', 'Text'], 'CategoryName', 'CategoryCode'];
        let val = await this.GetItemCategorys(apiReq);
        return { [key]: val.Data };
    }
}
