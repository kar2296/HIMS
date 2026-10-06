import { BaseService, BoFactory } from '../../Base/Index';
import { IPPackageBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPPackageAttributes } from '../Model/Interface/Index';
import { IPPackageFilters } from '../Common/Filters.e';

export class IPPackageService extends BaseService {
    private IPPackageBo: IPPackageBo;
    constructor(req?: Request) {
        super(req);
        this.IPPackageBo = BoFactory.GetBo(IPPackageBo, this.Request);
    }

    public async AddIPPackage(req: BaseRequest): Promise<number> {
        return await this.IPPackageBo.AddIPPackage(req);
    }

    public async AddIPPackageByTariff(req: BaseRequest): Promise<number> {
        return await this.IPPackageBo.AddIPPackageByTariff(req);
    }

    public async UpdateIPPackage(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageBo.UpdateIPPackage(req);
    }

    public async UpdateIPPackageByTariff(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageBo.UpdateIPPackageByTariff(req);
    }

    public async GetIPPackageById(req: BaseRequest): Promise<IPPackageAttributes> {
        return await this.IPPackageBo.GetIPPackageById(req);
    }

    public async GetIPPackages(apiReq?: ApiRequest<IPPackageFilters>): Promise<ApiResponse<IPPackageAttributes[]>> {
        return await this.IPPackageBo.GetIPPackages(apiReq);
    }

    public async GetTariffIPPackages(apiReq?: ApiRequest<IPPackageFilters>): Promise<ApiResponse<IPPackageAttributes[]>> {
        return await this.IPPackageBo.GetTariffIPPackages(apiReq);
    }

    public async DeleteIPPackage(req: BaseRequest): Promise<Boolean> {
        return await this.IPPackageBo.DeleteIPPackage(req);
    }
}
