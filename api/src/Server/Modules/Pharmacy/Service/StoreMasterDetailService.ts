import { BaseService, BoFactory } from '../../Base/Index';
import { StoreMasterDetailBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
// import { StoreMasterDetailAttributes } from '../Model/Interface/Index';
// import { StoreMasterDetailFilters } from '../Common/Filters.e';

export class StoreMasterDetailService extends BaseService {
    private StoreMasterDetailBo: StoreMasterDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StoreMasterDetailBo = BoFactory.GetBo(StoreMasterDetailBo, this.Request);
    }

    public async AddStoreMasterDetail(req: BaseRequest): Promise<number> {
        return await this.StoreMasterDetailBo.AddStoreMasterDetail(req);
    }

    // public async UpdateStoreMaster(req: BaseRequest): Promise<boolean> {
    //     return await this.StoreMasterBo.UpdateStoreMaster(req);
    // }

    // public async GetStoreMasterLogo(apiReq?: ApiRequest<StoreMasterFilters>): Promise<ApiResponse<StoreMasterAttributes[]>> {
    //     return await this.StoreMasterBo.GetStoreMasterLogo(apiReq);
    // }
    // public async GetStoreMasterById(req: BaseRequest): Promise<StoreMasterAttributes> {
    //     return await this.StoreMasterBo.GetStoreMasterById(req);
    // }

    // public async GetStoreMasters(apiReq?: ApiRequest<StoreMasterFilters>): Promise<ApiResponse<StoreMasterAttributes[]>> {
    //     return await this.StoreMasterBo.GetStoreMasters(apiReq);
    // }

    // public async DeleteStoreMaster(req: BaseRequest): Promise<Boolean> {
    //     return await this.StoreMasterBo.DeleteStoreMaster(req);
    // }
    // public async PrintStoreMasterReport(apiReq?: ApiRequest<StoreMasterFilters>): Promise<any> {
    //     return await this.StoreMasterBo.PrintStoreMasterReport(apiReq);
    // }
}
