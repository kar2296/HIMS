import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DeviceManufacturerInstance, DeviceManufacturerAttributes } from '../Model/Interface/Index';
import { DeviceManufacturerFilters } from '../Common/Filters.e';

export class DeviceManufacturerBo extends BaseBo<DeviceManufacturerInstance, DeviceManufacturerAttributes> implements IOptionProvider {
    public async AddDeviceManufacturer(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDeviceManufacturer(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDeviceManufacturerById(req: BaseRequest): Promise<DeviceManufacturerAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDeviceManufacturers(apiReq?: ApiRequest<DeviceManufacturerFilters>):
        Promise<ApiResponse<DeviceManufacturerAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DeviceManufacturerFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DeviceManufacturerFilters.DeviceManufacturerCode:
                        (where as any)[Op.or] = [{ DeviceManufacturerCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { DeviceManufacturerName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case DeviceManufacturerFilters.Version:
                        where['Version'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case DeviceManufacturerFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DeviceManufacturerFilters.FacilityId:
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

    public async DeleteDeviceManufacturer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DeviceManufacturerInstance, DeviceManufacturerAttributes> {
        return this.Models.DeviceManufacturer;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DeviceManufacturerFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DeviceManufacturerName', 'Text'],
            'DeviceManufacturerName', 'DeviceManufacturerCode'];
        let val = await this.GetDeviceManufacturers(apiReq);
        return { [key]: val.Data };
    }
}
