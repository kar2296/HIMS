import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualCategoryInstance, VirtualCategoryAttributes } from '../Model/Interface/Index';
import { VirtualCategoryFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class VirtualCategoryBo extends BaseBo<VirtualCategoryInstance, VirtualCategoryAttributes> {
    public async AddVirtualCategory(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualCategory(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.Imagepath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualCategoryById(req: BaseRequest): Promise<VirtualCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async GetVirtualCategoryImage(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Imagepath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Image: photoBase64 };
    }

    public async GetVirtualCategorys(apiReq?: ApiRequest<VirtualCategoryFilters>): Promise<ApiResponse<VirtualCategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualCategoryFilters.Code:
                        where['CategoryCode'] = { '$like': param.Value + '%' };
                        break;
                    case VirtualCategoryFilters.Name:
                        where['CategoryName'] = { '$like': param.Value + '%' };
                        break;
                    case VirtualCategoryFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case VirtualCategoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VirtualCategoryFilters.IsLabCategory:
                        where['IsLabCategory'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualCategoryInstance, VirtualCategoryAttributes> {
        return this.Models.VirtualCategory;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VirtualCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CategoryName', 'Text'], 'CategoryName', 'CategoryCode'];
        let val = await this.GetVirtualCategorys(apiReq);
        return { [key]: val.Data };
    }
}
