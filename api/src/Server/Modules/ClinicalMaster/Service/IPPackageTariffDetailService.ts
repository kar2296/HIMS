import { BaseService, BoFactory } from '../../Base/Index';
import { IPPackageTariffDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPPackageTariffDetailAttributes } from '../Model/Interface/Index';
import { IPPackageTariffDetailFilters } from '../Common/Filters.e';

export class IPPackageTariffDetailService extends BaseService {
    private IPPackageTariffDetailBo: IPPackageTariffDetailBo;
    constructor(req?: Request) {
        super(req);
        this.IPPackageTariffDetailBo = BoFactory.GetBo(IPPackageTariffDetailBo, this.Request);
    }

    public async AddIPPackageTariffDetail(req: BaseRequest): Promise<number> {
        return await this.IPPackageTariffDetailBo.AddIPPackageTariffDetail(req);
    }

    public async UpdateIPPackageTariffDetail(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageTariffDetailBo.UpdateIPPackageTariffDetail(req);
    }

    public async GetIPPackageTariffDetailById(req: BaseRequest): Promise<IPPackageTariffDetailAttributes> {
        return await this.IPPackageTariffDetailBo.GetIPPackageTariffDetailById(req);
    }

    public async GetIPPackageTariffDetails(apiReq?: ApiRequest<IPPackageTariffDetailFilters>):
        Promise<ApiResponse<IPPackageTariffDetailAttributes[]>> {
        return await this.IPPackageTariffDetailBo.GetIPPackageTariffDetails(apiReq);
    }

    public async DeleteIPPackageTariffDetail(req: BaseRequest): Promise<Boolean> {
        return await this.IPPackageTariffDetailBo.DeleteIPPackageTariffDetail(req);
    }
}
