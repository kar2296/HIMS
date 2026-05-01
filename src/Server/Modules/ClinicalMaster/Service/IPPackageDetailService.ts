import { BaseService, BoFactory } from '../../Base/Index';
import { IPPackageDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPPackageDetailAttributes } from '../Model/Interface/Index';
import { IPPackageDetailFilters } from '../Common/Filters.e';

export class IPPackageDetailService extends BaseService {
    private IPPackageDetailBo: IPPackageDetailBo;
    constructor(req?: Request) {
        super(req);
        this.IPPackageDetailBo = BoFactory.GetBo(IPPackageDetailBo, this.Request);
    }

    public async AddIPPackageDetail(req: BaseRequest): Promise<number> {
        return await this.IPPackageDetailBo.AddIPPackageDetail(req);
    }

    public async UpdateIPPackageDetail(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageDetailBo.UpdateIPPackageDetail(req);
    }

    public async GetIPPackageDetailById(req: BaseRequest): Promise<IPPackageDetailAttributes> {
        return await this.IPPackageDetailBo.GetIPPackageDetailById(req);
    }

    public async GetIPPackageDetails(apiReq?: ApiRequest<IPPackageDetailFilters>):
        Promise<ApiResponse<IPPackageDetailAttributes[]>> {
        return await this.IPPackageDetailBo.GetIPPackageDetails(apiReq);
    }

    public async DeleteIPPackageDetail(req: BaseRequest): Promise<Boolean> {
        return await this.IPPackageDetailBo.DeleteIPPackageDetail(req);
    }
}
