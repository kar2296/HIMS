import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { UomMasterInstance, UomMasterAttributes } from '../Model/Interface/Index';
import { UomMasterFilters } from '../Common/Filters.e';

export class UomMasterBo extends BaseBo<UomMasterInstance, UomMasterAttributes> {
    public async AddUomMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUomMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetUomMasterById(req: BaseRequest): Promise<UomMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUomMasters(apiReq?: ApiRequest<UomMasterFilters>): Promise<ApiResponse<UomMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('UomType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UomMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UomMasterFilters.Code:
                        (where as any)[Op.or] = [{ UomName : { [Op.like]: (param.Value || '') + '%' } },
                        { UomCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case UomMasterFilters.Name:
                        (where as any)[Op.or] = [{ UomName : { [Op.like]: (param.Value || '') + '%' } },
                        { UomCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case UomMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case UomMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case UomMasterFilters.UomTypeId:
                        where['UomTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteUomMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UomMasterInstance, UomMasterAttributes> {
        return this.Models.UomMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<UomMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['UomName', 'Text'], 'UomName', 'UomCode', 'IsMultiUse'];
        let val = await this.GetUomMasters(apiReq);
        return { [key]: val.Data };
    }
}
