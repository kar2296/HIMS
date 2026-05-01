import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GstMasterInstance, GstMasterAttributes } from '../Model/Interface/Index';
import { GstMasterFilters } from '../Common/Filters.e';

export class GstMasterBo extends BaseBo<GstMasterInstance, GstMasterAttributes> {
    public async AddGstMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGstMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGstMasterById(req: BaseRequest): Promise<GstMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGstMasters(apiReq?: ApiRequest<GstMasterFilters>): Promise<ApiResponse<GstMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.GstMaster, as: 'ChildGst', required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GstMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GstMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case GstMasterFilters.Name:
                        (where as any)[Op.or] = [{ GstName: { [Op.like]: (param.Value || '') + '%' } },
                        { GstCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case GstMasterFilters.GstPercentage:
                        where['GstPercentage'] = param.Value;
                        break;
                    case GstMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GstMasterFilters.ParentGstId:
                        where['ParentGstId'] = param.Value;
                        break;
                    case GstMasterFilters.IsParent:
                        where['IsParent'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteGstMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GstMasterInstance, GstMasterAttributes> {
        return this.Models.GstMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GstMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GstName', 'Text'], 'GstName', 'GstCode', 'GstPercentage',
            'ParentGstId', 'ChildGstId'];
        let val = await this.GetGstMasters(apiReq);
        return { [key]: val.Data };
    }
}
