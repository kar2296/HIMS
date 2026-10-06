import {BaseService, BoFactory} from '../../Base/Index';
import { DistrictMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DistrictMasterAttributes} from '../Model/Interface/Index';
import { DistrictMasterFilters } from '../Common/Filters.e';

export class DistrictMasterService extends BaseService {
    private DistrictMasterBo: DistrictMasterBo;
    constructor(req?: Request) {
        super(req);
        this.DistrictMasterBo = BoFactory.GetBo(DistrictMasterBo, this.Request);
    }

    public async AddDistrictMaster(req: BaseRequest): Promise<number> {
        return await this.DistrictMasterBo.AddDistrictMaster(req);
    }

    public async UpdateDistrictMaster(req: BaseRequest): Promise<boolean> {
        return await this.DistrictMasterBo.UpdateDistrictMaster(req);
    }

    public async GetDistrictMasterById(req: BaseRequest): Promise<DistrictMasterAttributes> {
        return await this.DistrictMasterBo.GetDistrictMasterById(req);
    }

    public async GetDistrictMasters(apiReq?: ApiRequest<DistrictMasterFilters>): Promise<ApiResponse<DistrictMasterAttributes[]>> {
        return await this.DistrictMasterBo.GetDistrictMasters(apiReq);
    }

    public async DeleteDistrictMaster(req: BaseRequest): Promise<Boolean> {
        return await this.DistrictMasterBo.DeleteDistrictMaster(req);
    }
}
