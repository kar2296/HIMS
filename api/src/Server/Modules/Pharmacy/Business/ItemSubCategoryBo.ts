import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemSubCategoryInstance, ItemSubCategoryAttributes } from '../Model/Interface/Index';
import { ItemSubCategoryFilters } from '../Common/Filters.e';

export class ItemSubCategoryBo extends BaseBo<ItemSubCategoryInstance, ItemSubCategoryAttributes> {
    public async AddItemSubCategory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemSubCategory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemSubCategoryById(req: BaseRequest): Promise<ItemSubCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemSubCategorys(apiReq?: ApiRequest<ItemSubCategoryFilters>): Promise<ApiResponse<ItemSubCategoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemSubCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemSubCategoryFilters.Code:
                        where['SubCategoryCode'] = { '$like': param.Value + '%' };
                        break;
                    case ItemSubCategoryFilters.Name:
                        where['SubCategoryName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemSubCategoryFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemSubCategoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemSubCategoryFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
       return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteItemSubCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemSubCategoryInstance, ItemSubCategoryAttributes> {
        return this.Models.ItemSubCategory;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemSubCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SubCategoryName', 'Text'], 'SubCategoryName', 'SubCategoryCode'];
        let val = await this.GetItemSubCategorys(apiReq);
        return { [key]: val.Data };
    }
}
