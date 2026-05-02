import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DeviceParametersInstance, DeviceParametersAttributes } from '../Model/Interface/Index';
import { DeviceParametersFilters } from '../Common/Filters.e';

export class DeviceParametersBo extends BaseBo<DeviceParametersInstance, DeviceParametersAttributes> implements IOptionProvider {
    public async AddDeviceParameters(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDeviceParameters(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDeviceParametersById(req: BaseRequest): Promise<DeviceParametersAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDeviceParameterss(apiReq?: ApiRequest<DeviceParametersFilters>):
        Promise<ApiResponse<DeviceParametersAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DeviceParameterType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DeviceParametersFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DeviceParametersFilters.Code:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Name: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case DeviceParametersFilters.DeviceParameterTypeId:
                        where['DeviceParameterTypeId'] = param.Value;
                        break;
                    case DeviceParametersFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DeviceParametersFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteDeviceParameters(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DeviceParametersInstance, DeviceParametersAttributes> {
        return this.Models.DeviceParameters;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DeviceParametersFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DeviceParametersName', 'Text'], 'DeviceParametersName', 'DeviceParametersCode'];
        let val = await this.GetDeviceParameterss(apiReq);
        return { [key]: val.Data };
    }
}
