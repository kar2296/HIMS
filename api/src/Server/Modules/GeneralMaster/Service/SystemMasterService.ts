import {BaseService, BoFactory} from '../../Base/Index';
import { SystemMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { SystemMasterAttributes} from '../Model/Interface/Index';
import { SystemMasterFilters } from '../Common/Filters.e';

export class SystemMasterService extends BaseService {
    private SystemMasterBo: SystemMasterBo;
    constructor(req?: Request) {
        super(req);
        this.SystemMasterBo = BoFactory.GetBo(SystemMasterBo, this.Request);
    }

    public async AddSystemMaster(req: BaseRequest): Promise<number> {
        return await this.SystemMasterBo.AddSystemMaster(req);
    }

    public async UpdateSystemMaster(req: BaseRequest): Promise<boolean> {
        return await this.SystemMasterBo.UpdateSystemMaster(req);
    }

    public async GetSystemMasterById(req: BaseRequest): Promise<SystemMasterAttributes> {
        return await this.SystemMasterBo.GetSystemMasterById(req);
    }

    public async GetSystemMasters(apiReq?: ApiRequest<SystemMasterFilters>): Promise<ApiResponse<SystemMasterAttributes[]>> {
        return await this.SystemMasterBo.GetSystemMasters(apiReq);
    }

    public async DeleteSystemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.SystemMasterBo.DeleteSystemMaster(req);
    }
}
