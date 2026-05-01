import { BaseService, BoFactory } from '../../Base/Index';
import { DeviceParametersBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DeviceParametersAttributes } from '../Model/Interface/Index';
import { DeviceParametersFilters } from '../Common/Filters.e';

export class DeviceParametersService extends BaseService {
    private DeviceParametersBo: DeviceParametersBo;
    constructor(req?: Request) {
        super(req);
        this.DeviceParametersBo = BoFactory.GetBo(DeviceParametersBo, this.Request);
    }

    public async AddDeviceParameters(req: BaseRequest): Promise<number> {
        return await this.DeviceParametersBo.AddDeviceParameters(req);
    }

    public async UpdateDeviceParameters(req: BaseRequest): Promise<boolean> {
        return await this.DeviceParametersBo.UpdateDeviceParameters(req);
    }

    public async GetDeviceParametersById(req: BaseRequest): Promise<DeviceParametersAttributes> {
        return await this.DeviceParametersBo.GetDeviceParametersById(req);
    }

    public async GetDeviceParameterss(apiReq?: ApiRequest<DeviceParametersFilters>):
        Promise<ApiResponse<DeviceParametersAttributes[]>> {
        return await this.DeviceParametersBo.GetDeviceParameterss(apiReq);
    }

    public async DeleteDeviceParameters(req: BaseRequest): Promise<Boolean> {
        return await this.DeviceParametersBo.DeleteDeviceParameters(req);
    }
}
