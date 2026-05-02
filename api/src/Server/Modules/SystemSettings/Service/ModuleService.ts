import {BaseService, BoFactory} from '../../Base/Index';
import { ModuleBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ModuleAttributes} from '../Model/Interface/Index';
import { ModuleFilters } from '../Common/Filters.e';

export class ModuleService extends BaseService {
    private ModuleBo: ModuleBo;
    constructor(req?: Request) {
        super(req);
        this.ModuleBo = BoFactory.GetBo(ModuleBo, this.Request);
    }

    public async AddModule(req: BaseRequest): Promise<number> {
        return await this.ModuleBo.AddModule(req);
    }

    public async UpdateModule(req: BaseRequest): Promise<boolean> {
        return await this.ModuleBo.UpdateModule(req);
    }

    public async GetModuleById(req: BaseRequest): Promise<ModuleAttributes> {
        return await this.ModuleBo.GetModuleById(req);
    }

    public async GetModules(apiReq?: ApiRequest<ModuleFilters>): Promise<ApiResponse<ModuleAttributes[]>> {
        return await this.ModuleBo.GetModules(apiReq);
    }

    public async DeleteModule(req: BaseRequest): Promise<Boolean> {
        return await this.ModuleBo.DeleteModule(req);
    }
}
