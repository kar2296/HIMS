import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ProductTypeInstance, ProductTypeAttributes } from '../Model/Interface/Index';
import { ProductTypeFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class ProductTypeBo extends BaseBo<ProductTypeInstance, ProductTypeAttributes> {
    public async AddProductType(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProductType(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProductTypeById(req: BaseRequest): Promise<ProductTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProductTypes(apiReq?: ApiRequest<ProductTypeFilters>): Promise<ApiResponse<ProductTypeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProductTypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProductTypeFilters.Name:
                        (where as any)[Op.or] = [{ ProductTypeName: { [Op.like]: (param.Value || '') + '%' } },
                        { ProductTypeCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ProductTypeFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ProductTypeFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ProductTypeFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ProductTypeFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ProductTypeFilters.IsAllFacility:
                        where['IsAllFacility'] = param.Value;
                        break;
                    case ProductTypeFilters.SubTypeId:
                        where['SubTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteProductType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProductTypeInstance, ProductTypeAttributes> {
        return this.Models.ProductType;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ProductTypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ProductTypeName', 'Text'], 'ProductTypeName', 'ProductTypeCode'];
        let val = await this.GetProductTypes(apiReq);
        return { [key]: val.Data };
    }
    public async PrintProductTypeReport(apiReq?: ApiRequest<ProductTypeFilters>): Promise<any> {
        let data = await this.GetProductTypes(apiReq);
        let ProductType = data.Data;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let CategoryName = apiReq.Data.CategoryName;
        let SubCategoryName = apiReq.Data.SubCategoryName;
        let ProductTypeData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ProductTypeData.FacilityId);
        let info = {
            ProductType: ProductType,
            Preferences: printPreferencesData,
            ActiveStatus: ActiveStatus,
            CategoryName: CategoryName,
            SubCategoryName: SubCategoryName
        };
        let pdfOption: any = null;
        let key = 'producttypereport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
