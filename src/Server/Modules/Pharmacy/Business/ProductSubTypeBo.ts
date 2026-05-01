import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ProductSubTypeInstance, ProductSubTypeAttributes } from '../Model/Interface/Index';
import { ProductSubTypeFilters } from '../Common/Filters.e';

export class ProductSubTypeBo extends BaseBo<ProductSubTypeInstance, ProductSubTypeAttributes> {
    public async AddProductSubType(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProductSubType(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProductSubTypeById(req: BaseRequest): Promise<ProductSubTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProductSubTypes(apiReq?: ApiRequest<ProductSubTypeFilters>): Promise<ApiResponse<ProductSubTypeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProductSubTypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProductSubTypeFilters.Name:
                        (where as any)[Op.or] = [{ SubProductTypeName: { [Op.like]: (param.Value || '') + '%' } },
                        { SubProductTypeCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ProductSubTypeFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ProductSubTypeFilters.productsubtype:
                        where['productsubtype'] = param.Value;
                        break;
                    case ProductSubTypeFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ProductSubTypeFilters.FacilityId:
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

    public async DeleteProductSubType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProductSubTypeInstance, ProductSubTypeAttributes> {
        return this.Models.ProductSubType;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ProductSubTypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SubProductTypeName', 'Text'], 'SubProductTypeName', 'SubProductTypeCode'];
        let val = await this.GetProductSubTypes(apiReq);
        return { [key]: val.Data };
    }
}
