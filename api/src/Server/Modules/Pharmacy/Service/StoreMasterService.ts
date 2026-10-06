import { BaseService, BoFactory } from '../../Base/Index';
import { StoreMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StoreMasterAttributes } from '../Model/Interface/Index';
import { StoreMasterFilters } from '../Common/Filters.e';

export class StoreMasterService extends BaseService {
    private StoreMasterBo: StoreMasterBo;
    constructor(req?: Request) {
        super(req);
        this.StoreMasterBo = BoFactory.GetBo(StoreMasterBo, this.Request);
    }

    public async AddStoreMaster(req: BaseRequest): Promise<number> {
        return await this.StoreMasterBo.AddStoreMaster(req);
    }

    public async UpdateStoreMaster(req: BaseRequest): Promise<boolean> {
        return await this.StoreMasterBo.UpdateStoreMaster(req);
    }

    public async GetStoreMasterLogo(apiReq?: ApiRequest<StoreMasterFilters>): Promise<ApiResponse<StoreMasterAttributes[]>> {
        return await this.StoreMasterBo.GetStoreMasterLogo(apiReq);
    }
    public async GetStoreMasterById(req: BaseRequest): Promise<StoreMasterAttributes> {
        return await this.StoreMasterBo.GetStoreMasterById(req);
    }

    public async GetStoreMasters(apiReq?: ApiRequest<StoreMasterFilters>): Promise<ApiResponse<StoreMasterAttributes[]>> {
        return await this.StoreMasterBo.GetStoreMasters(apiReq);
    }

    public async DeleteStoreMaster(req: BaseRequest): Promise<Boolean> {
        return await this.StoreMasterBo.DeleteStoreMaster(req);
    }
    public async PrintStoreMasterReport(apiReq?: ApiRequest<StoreMasterFilters>): Promise<any> {
        return await this.StoreMasterBo.PrintStoreMasterReport(apiReq);
    }
}
