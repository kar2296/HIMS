import { BaseService, BoFactory } from '../../Base/Index';
import { UomMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UomMasterAttributes } from '../Model/Interface/Index';
import { UomMasterFilters } from '../Common/Filters.e';

export class UomMasterService extends BaseService {
    private UomMasterBo: UomMasterBo;
    constructor(req?: Request) {
        super(req);
        this.UomMasterBo = BoFactory.GetBo(UomMasterBo, this.Request);
    }

    public async AddUomMaster(req: BaseRequest): Promise<number> {
        return await this.UomMasterBo.AddUomMaster(req);
    }

    public async UpdateUomMaster(req: BaseRequest): Promise<boolean> {
        return await this.UomMasterBo.UpdateUomMaster(req);
    }

    public async GetUomMasterById(req: BaseRequest): Promise<UomMasterAttributes> {
        return await this.UomMasterBo.GetUomMasterById(req);
    }

    public async GetUomMasters(apiReq?: ApiRequest<UomMasterFilters>): Promise<ApiResponse<UomMasterAttributes[]>> {
        return await this.UomMasterBo.GetUomMasters(apiReq);
    }

    public async DeleteUomMaster(req: BaseRequest): Promise<Boolean> {
        return await this.UomMasterBo.DeleteUomMaster(req);
    }
}
