import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualSubCategoryInstance, VirtualSubCategoryAttributes } from '../Model/Interface/Index';
import { VirtualSubCategoryFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class VirtualSubCategoryBo extends BaseBo<VirtualSubCategoryInstance, VirtualSubCategoryAttributes> {
    public async AddVirtualSubCategory(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualSubCategory(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualSubCategoryById(req: BaseRequest): Promise<VirtualSubCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualSubCategoryImage(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Imagepath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Image: photoBase64 };
    }

    public async GetVirtualSubCategorys(apiReq?: ApiRequest<VirtualSubCategoryFilters>):
        Promise<ApiResponse<VirtualSubCategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let CatWhere: WhereOptions<any> = {};
        let IsCatSearch: boolean = false;
        // include.push({ model: this.Models.VirtualCategory, attributes: ['Id', 'CategoryName', 'ConsultancyTypeId'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualSubCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualSubCategoryFilters.Code:
                        where['SubCategoryCode'] = { '$like': param.Value + '%' };
                        break;
                    case VirtualSubCategoryFilters.Name:
                        where['SubCategoryName'] = { '$like': param.Value + '%' };
                        break;
                    case VirtualSubCategoryFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case VirtualSubCategoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VirtualSubCategoryFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case VirtualSubCategoryFilters.IsHome:
                        where['IsHome'] = param.Value;
                        break;
                    case VirtualSubCategoryFilters.IsLabCategory:
                        CatWhere['IsLabCategory'] = param.Value;
                        IsCatSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'ASC']);
        include.push({
            model: this.Models.VirtualCategory,
            attributes: ['Id', 'CategoryName', 'ConsultancyTypeId', 'IsLabCategory'],
            where: CatWhere,
            required: IsCatSearch
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualSubCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualSubCategoryInstance, VirtualSubCategoryAttributes> {
        return this.Models.VirtualSubCategory;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VirtualSubCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SubCategoryName', 'Text'], 'SubCategoryName', 'SubCategoryCode'];
        let val = await this.GetVirtualSubCategorys(apiReq);
        return { [key]: val.Data };
    }
}
