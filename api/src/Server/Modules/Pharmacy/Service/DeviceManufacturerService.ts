import { BaseService, BoFactory } from '../../Base/Index';
import { DeviceManufacturerBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DeviceManufacturerAttributes } from '../Model/Interface/Index';
import { DeviceManufacturerFilters } from '../Common/Filters.e';

export class DeviceManufacturerService extends BaseService {
    private DeviceManufacturerBo: DeviceManufacturerBo;
    constructor(req?: Request) {
        super(req);
        this.DeviceManufacturerBo = BoFactory.GetBo(DeviceManufacturerBo, this.Request);
    }

    public async AddDeviceManufacturer(req: BaseRequest): Promise<number> {
        return await this.DeviceManufacturerBo.AddDeviceManufacturer(req);
    }

    public async UpdateDeviceManufacturer(req: BaseRequest): Promise<boolean> {
        return await this.DeviceManufacturerBo.UpdateDeviceManufacturer(req);
    }

    public async GetDeviceManufacturerById(req: BaseRequest): Promise<DeviceManufacturerAttributes> {
        return await this.DeviceManufacturerBo.GetDeviceManufacturerById(req);
    }

    public async GetDeviceManufacturers(apiReq?: ApiRequest<DeviceManufacturerFilters>):
        Promise<ApiResponse<DeviceManufacturerAttributes[]>> {
        return await this.DeviceManufacturerBo.GetDeviceManufacturers(apiReq);
    }

    public async DeleteDeviceManufacturer(req: BaseRequest): Promise<Boolean> {
        return await this.DeviceManufacturerBo.DeleteDeviceManufacturer(req);
    }
}
