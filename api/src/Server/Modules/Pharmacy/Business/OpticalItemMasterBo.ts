import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OpticalItemMasterInstance, OpticalItemMasterAttributes } from '../Model/Interface/Index';
import { OpticalItemMasterFilters } from '../Common/Filters.e';

export class OpticalItemMasterBo extends BaseBo<OpticalItemMasterInstance, OpticalItemMasterAttributes> {
    public async AddOpticalItemMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOpticalItemMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOpticalItemMasterById(req: BaseRequest): Promise<OpticalItemMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOpticalItemMasters(apiReq?: ApiRequest<OpticalItemMasterFilters>): Promise<ApiResponse<OpticalItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('OpticalProductType'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OpticalItemMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case OpticalItemMasterFilters.OpticalProductTypeId:
                        where['OpticalProductTypeId'] = param.Value;
                        break;
                    case OpticalItemMasterFilters.ItemCode:
                        where['ItemCode'] = { '$like': + '%' + param.Value + '%' };
                        break;
                    case OpticalItemMasterFilters.ItemName:
                        where['ItemName'] = { '$like': + '%' + param.Value + '%' };
                        break;
                    case OpticalItemMasterFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    case OpticalItemMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case OpticalItemMasterFilters.ItemNameAndCode:
                        (where as any)[Op.or] = [{ ItemName : { [Op.like]: (param.Value || '') + '%' } },
                        { ItemCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteOpticalItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalItemMasterInstance, OpticalItemMasterAttributes> {
        return this.Models.OpticalItemMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OpticalItemMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ItemName', 'Text'], 'ItemName', 'ItemCode'];
        let val = await this.GetOpticalItemMasters(apiReq);
        return { [key]: val.Data };
    }
}
