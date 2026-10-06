import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DeviceInstance, DeviceAttributes } from '../Model/Interface/Index';
import { DeviceFilters } from '../Common/Filters.e';

export class DeviceBo extends BaseBo<DeviceInstance, DeviceAttributes> implements IOptionProvider {
    public async AddDevice(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDevice(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDeviceById(req: BaseRequest): Promise<DeviceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDevices(apiReq?: ApiRequest<DeviceFilters>):
        Promise<ApiResponse<DeviceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.DeviceManufacturer, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DeviceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DeviceFilters.DeviceCode:
                        (where as any)[Op.or] = [{ DeviceCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { DeviceName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case DeviceFilters.DeviceManufacturerId:
                        where['DeviceManufacturerId'] = param.Value;
                        break;
                    case DeviceFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DeviceFilters.FacilityId:
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

    public async DeleteDevice(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DeviceInstance, DeviceAttributes> {
        return this.Models.Device;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DeviceFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DeviceName', 'Text'], 'DeviceName', 'DeviceCode'];
        let val = await this.GetDevices(apiReq);
        return { [key]: val.Data };
    }
}
