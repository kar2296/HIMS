import {BaseService, BoFactory} from '../../Base/Index';
import { ExternalProviderBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ExternalProviderAttributes} from '../Model/Interface/Index';
import { ExternalProviderFilters } from '../Common/Filters.e';

export class ExternalProviderService extends BaseService {
    private ExternalProviderBo: ExternalProviderBo;
    constructor(req?: Request) {
        super(req);
        this.ExternalProviderBo = BoFactory.GetBo(ExternalProviderBo, this.Request);
    }

    public async AddExternalProvider(req: BaseRequest): Promise<number> {
        return await this.ExternalProviderBo.AddExternalProvider(req);
    }

    public async UpdateExternalProvider(req: BaseRequest): Promise<boolean> {
        return await this.ExternalProviderBo.UpdateExternalProvider(req);
    }

    public async GetExternalProviderById(req: BaseRequest): Promise<ExternalProviderAttributes> {
        return await this.ExternalProviderBo.GetExternalProviderById(req);
    }

    public async GetExternalProvideres(apiReq?: ApiRequest<ExternalProviderFilters>): Promise<ApiResponse<ExternalProviderAttributes[]>> {
        return await this.ExternalProviderBo.GetExternalProvideres(apiReq);
    }

    public async DeleteExternalProvider(req: BaseRequest): Promise<Boolean> {
        return await this.ExternalProviderBo.DeleteExternalProvider(req);
    }
}
