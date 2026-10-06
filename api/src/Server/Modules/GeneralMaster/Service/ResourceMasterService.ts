import {BaseService, BoFactory} from '../../Base/Index';
import { ResourceMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ResourceMasterAttributes} from '../Model/Interface/Index';
import { ResourceMasterFilters } from '../Common/Filters.e';

export class ResourceMasterService extends BaseService {
    private ResourceMasterBo: ResourceMasterBo;
    constructor(req?: Request) {
        super(req);
        this.ResourceMasterBo = BoFactory.GetBo(ResourceMasterBo, this.Request);
    }

    public async AddResourceMaster(req: BaseRequest): Promise<number> {
        return await this.ResourceMasterBo.AddResourceMaster(req);
    }

    public async UpdateResourceMaster(req: BaseRequest): Promise<boolean> {
        return await this.ResourceMasterBo.UpdateResourceMaster(req);
    }

    public async GetResourceMasterById(req: BaseRequest): Promise<ResourceMasterAttributes> {
        return await this.ResourceMasterBo.GetResourceMasterById(req);
    }

    public async GetResourceMasters(apiReq?: ApiRequest<ResourceMasterFilters>): Promise<ApiResponse<ResourceMasterAttributes[]>> {
        return await this.ResourceMasterBo.GetResourceMasters(apiReq);
    }

    public async DeleteResourceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.ResourceMasterBo.DeleteResourceMaster(req);
    }
}
