import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { HsnMasterInstance, HsnMasterAttributes } from '../Model/Interface/Index';
import { HsnMasterFilters } from '../Common/Filters.e';

export class HsnMasterBo extends BaseBo<HsnMasterInstance, HsnMasterAttributes> {
    public async AddHsnMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateHsnMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetHsnMasterById(req: BaseRequest): Promise<HsnMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetHsnMasters(apiReq?: ApiRequest<HsnMasterFilters>): Promise<ApiResponse<HsnMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case HsnMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case HsnMasterFilters.Code:
                        (where as any)[Op.or] = [{ HSNCode: { [Op.like]: (param.Value || '') + '%' } },
                        { HSNName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case HsnMasterFilters.Company:
                        where['HSNCompany'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case HsnMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteHsnMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<HsnMasterInstance, HsnMasterAttributes> {
        return this.Models.HsnMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<HsnMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'HSNCode', ['HSNName', 'Text'], 'HSNCompany',
            'GstId', 'GstCode', 'GstPercentage', 'InGstId', 'InGstCode', 'InGstPercentage',
            'CGstId', 'CGstCode', 'CGstPercentage', 'SGstId', 'SGstCode', 'SGstPercentage'];
        let val = await this.GetHsnMasters(apiReq);
        return { [key]: val.Data };
    }
}
