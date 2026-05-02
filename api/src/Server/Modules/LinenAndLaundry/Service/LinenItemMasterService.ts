import {BaseService, BoFactory} from '../../Base/Index';
import { LinenItemMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { LinenItemMasterAttributes} from '../Model/Interface/Index';
import { LinenItemMasterFilters } from '../Common/Filters.e';

export class LinenItemMasterService extends BaseService {
    private LinenItemMasterBo: LinenItemMasterBo;
    constructor(req?: Request) {
        super(req);
        this.LinenItemMasterBo = BoFactory.GetBo(LinenItemMasterBo, this.Request);
    }

    public async AddLinenItemMaster(req: BaseRequest): Promise<number> {
        return await this.LinenItemMasterBo.AddLinenItemMaster(req);
    }

    public async UpdateLinenItemMaster(req: BaseRequest): Promise<boolean> {
        return await this.LinenItemMasterBo.UpdateLinenItemMaster(req);
    }

    public async GetLinenItemMasterById(req: BaseRequest): Promise<LinenItemMasterAttributes> {
        return await this.LinenItemMasterBo.GetLinenItemMasterById(req);
    }

    public async GetLinenItemMaster(apiReq?: ApiRequest<LinenItemMasterFilters>): Promise<ApiResponse<LinenItemMasterAttributes[]>> {
        return await this.LinenItemMasterBo.GetLinenItemMaster(apiReq);
    }

    public async DeleteLinenItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.LinenItemMasterBo.DeleteLinenItemMaster(req);
    }
}
