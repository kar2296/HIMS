import {BaseService, BoFactory} from '../../Base/Index';
import { ExternalprovidersBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ExternalprovidersAttributes} from '../Model/Interface/Index';
import { ExternalprovidersFilters } from '../Common/Filters.e';

export class ExternalprovidersService extends BaseService {
    private ExternalprovidersBo: ExternalprovidersBo;
    constructor(req?: Request) {
        super(req);
        this.ExternalprovidersBo = BoFactory.GetBo(ExternalprovidersBo, this.Request);
    }

    public async AddExternalproviders(req: BaseRequest): Promise<number> {
        return await this.ExternalprovidersBo.AddExternalproviders(req);
    }

    public async UpdateExternalproviders(req: BaseRequest): Promise<boolean> {
        return await this.ExternalprovidersBo.UpdateExternalproviders(req);
    }

    public async GetExternalprovidersById(req: BaseRequest): Promise<ExternalprovidersAttributes> {
        return await this.ExternalprovidersBo.GetExternalprovidersById(req);
    }

    public async GetExternalproviders(apiReq?: ApiRequest<ExternalprovidersFilters>): Promise<ApiResponse<ExternalprovidersAttributes[]>> {
        return await this.ExternalprovidersBo.GetExternalproviders(apiReq);
    }

    public async DeleteExternalproviders(req: BaseRequest): Promise<Boolean> {
        return await this.ExternalprovidersBo.DeleteExternalproviders(req);
    }
}
