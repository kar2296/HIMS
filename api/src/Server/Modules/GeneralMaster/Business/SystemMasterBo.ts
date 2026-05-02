import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { SystemMasterInstance, SystemMasterAttributes } from '../Model/Interface/Index';
import { SystemMasterFilters } from '../Common/Filters.e';

export class SystemMasterBo extends BaseBo<SystemMasterInstance, SystemMasterAttributes> implements IOptionProvider {
    public async AddSystemMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSystemMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSystemMasterById(req: BaseRequest): Promise<SystemMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetSystemMasters(apiReq?: ApiRequest<SystemMasterFilters>): Promise<ApiResponse<SystemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('SystemType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SystemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SystemMasterFilters.SystemName:
                        (where as any)[Op.or] = [{ SystemName: { [Op.like]: (param.Value || '') + '%' } },
                        { Code: { [Op.like]: (param.Value || '') + '%' } }];
                        // where['SystemName'] = param.Value;
                        break;
                    case SystemMasterFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case SystemMasterFilters.SystemTypeId:
                        where['SystemTypeId'] = param.Value;
                        break;
                    case SystemMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSystemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<SystemMasterInstance, SystemMasterAttributes> {
        return this.Models.SystemMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SystemMasterFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'ExaminationSystem') {
            apiReq.Params.push({ Key: SystemMasterFilters.SystemTypeId, Value: 1 },
                { Key: SystemMasterFilters.ActiveStatus, Value: 2 });
        } else if (key === 'LaserAdvice') {
            apiReq.Params.push({ Key: SystemMasterFilters.SystemTypeId, Value: 2 },
                { Key: SystemMasterFilters.ActiveStatus, Value: 2 });
        } else if (key === 'SurgeryAdvice') {
            apiReq.Params.push({ Key: SystemMasterFilters.SystemTypeId, Value: 3 },
                { Key: SystemMasterFilters.ActiveStatus, Value: 2 });
        } else if (key === 'InjectionAdvice') {
            apiReq.Params.push({ Key: SystemMasterFilters.SystemTypeId, Value: 4 },
                { Key: SystemMasterFilters.ActiveStatus, Value: 2 });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SystemName', 'Text'], 'SystemName', 'Code'];
        let val = await this.GetSystemMasters(apiReq);
        return { [key]: val.Data };
    }
}
