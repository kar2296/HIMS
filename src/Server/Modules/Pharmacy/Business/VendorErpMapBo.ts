import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VendorErpFilters } from '../Common/Filters.e';
import { VendorErpMapInstance, VendorErpMapAttributes } from '../Model/Interface/Index';

export class VendorErpMapBo extends BaseBo<VendorErpMapInstance, VendorErpMapAttributes> {
    public async AddVendorErpMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVendorErpMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVendorErpMapById(req: BaseRequest): Promise<VendorErpMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorErpMaps(apiReq?: ApiRequest<VendorErpFilters>): Promise<ApiResponse<VendorErpMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ErpAccountType'));
        include.push(this.GetReference('ErpSubAccountType'));
        include.push(this.GetReference('ErpGLClassType'));
        include.push(this.GetReference('Bank'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorErpFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorErpFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case VendorErpFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case VendorErpFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteVendorErpMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorErpMapInstance, VendorErpMapAttributes> {
        return this.Models.VendorErpMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VendorErpFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'VendorId', 'VendorCode', ['VendorName', 'Text'], 'VendorName'];
        let val = await this.GetVendorErpMaps(apiReq);
        return { [key]: val.Data };
    }
}
