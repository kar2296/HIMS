import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VitalMasterInstance, VitalMasterAttributes } from '../Model/Interface/Index';
import { VitalMasterFilters } from '../Common/Filters.e';

export class VitalMasterBo extends BaseBo<VitalMasterInstance, VitalMasterAttributes> {
    public async AddVitalMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVitalMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVitalMasterById(req: BaseRequest): Promise<VitalMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVitalMasters(apiReq?: ApiRequest<VitalMasterFilters>): Promise<ApiResponse<VitalMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('GraphType'));
        include.push(this.GetReference('VitalValueType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VitalMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VitalMasterFilters.Name:
                        where['VitalName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case VitalMasterFilters.VitalValueType:
                        where['VitalValueTypeId'] = param.Value;
                        break;
                    case VitalMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteVitalMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VitalMasterInstance, VitalMasterAttributes> {
        return this.Models.VitalMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VitalMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['VitalName', 'Text'], 'VitalName', 'UOM',
            'GraphTypeId', 'VitalValueTypeId', 'LoincCode', 'Description', 'ReferrenceLink', 'ValueFormat', 'ReferenceRangeFrom',
            'ReferenceRangeTo', 'Mnemonic','DisplayOrder'];
        let val = await this.GetVitalMasters(apiReq);
        return { [key]: val.Data };
    }
}
