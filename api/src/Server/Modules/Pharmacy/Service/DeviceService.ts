import { BaseService, BoFactory } from '../../Base/Index';
import { DeviceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DeviceAttributes } from '../Model/Interface/Index';
import { DeviceFilters } from '../Common/Filters.e';

export class DeviceService extends BaseService {
    private DeviceBo: DeviceBo;
    constructor(req?: Request) {
        super(req);
        this.DeviceBo = BoFactory.GetBo(DeviceBo, this.Request);
    }

    public async AddDevice(req: BaseRequest): Promise<number> {
        return await this.DeviceBo.AddDevice(req);
    }

    public async UpdateDevice(req: BaseRequest): Promise<boolean> {
        return await this.DeviceBo.UpdateDevice(req);
    }

    public async GetDeviceById(req: BaseRequest): Promise<DeviceAttributes> {
        return await this.DeviceBo.GetDeviceById(req);
    }

    public async GetDevices(apiReq?: ApiRequest<DeviceFilters>):
        Promise<ApiResponse<DeviceAttributes[]>> {
        return await this.DeviceBo.GetDevices(apiReq);
    }

    public async DeleteDevice(req: BaseRequest): Promise<Boolean> {
        return await this.DeviceBo.DeleteDevice(req);
    }
}
