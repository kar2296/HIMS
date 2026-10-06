import {BaseService, BoFactory} from '../../Base/Index';
import { DietItemMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DietItemMasterAttributes} from '../Model/Interface/Index';
import { DietItemMasterFilters } from '../Common/Filters.e';

export class DietItemMasterService extends BaseService {
    private DietItemMasterBo: DietItemMasterBo;
    constructor(req?: Request) {
        super(req);
        this.DietItemMasterBo = BoFactory.GetBo(DietItemMasterBo, this.Request);
    }

    public async AddDietItemMaster(req: BaseRequest): Promise<number> {
        return await this.DietItemMasterBo.AddDietItemMaster(req);
    }

    public async UpdateDietItemMaster(req: BaseRequest): Promise<boolean> {
        return await this.DietItemMasterBo.UpdateDietItemMaster(req);
    }

    public async GetDietItemMasterById(req: BaseRequest): Promise<DietItemMasterAttributes> {
        return await this.DietItemMasterBo.GetDietItemMasterById(req);
    }

    public async GetDietItemMasters(apiReq?: ApiRequest<DietItemMasterFilters>): Promise<ApiResponse<DietItemMasterAttributes[]>> {
        return await this.DietItemMasterBo.GetDietItemMasters(apiReq);
    }

    public async DeleteDietItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.DietItemMasterBo.DeleteDietItemMaster(req);
    }
}
