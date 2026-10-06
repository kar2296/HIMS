import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemSubTypeInstance, ItemSubTypeAttributes } from '../Model/Interface/Index';
import { ItemSubTypeFilters } from '../Common/Filters.e';

export class ItemSubTypeBo extends BaseBo<ItemSubTypeInstance, ItemSubTypeAttributes> {
    public async AddItemSubType(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemSubType(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemSubTypeById(req: BaseRequest): Promise<ItemSubTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemSubTypes(apiReq?: ApiRequest<ItemSubTypeFilters>): Promise<ApiResponse<ItemSubTypeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemSubTypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemSubTypeFilters.Code:
                        where['SubTypeCode'] = { '$like': param.Value + '%' };
                        break;
                    case ItemSubTypeFilters.Name:
                        where['SubTypeName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemSubTypeFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemSubTypeFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemSubTypeFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemSubTypeFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteItemSubType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemSubTypeInstance, ItemSubTypeAttributes> {
        return this.Models.ItemSubType;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemSubTypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SubTypeName', 'Text'], 'SubTypeName', 'SubTypeCode'];
        let val = await this.GetItemSubTypes(apiReq);
        return { [key]: val.Data };
    }
}
