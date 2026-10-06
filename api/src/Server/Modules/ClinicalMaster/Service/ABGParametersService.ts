import {BaseService, BoFactory} from '../../Base/Index';
import { ABGParametersBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ABGParametersAttributes} from '../Model/Interface/Index';
import { ABGParametersFilters } from '../Common/Filters.e';

export class ABGParametersService extends BaseService {
    private ABGParametersBo: ABGParametersBo;
    constructor(req?: Request) {
        super(req);
        this.ABGParametersBo = BoFactory.GetBo(ABGParametersBo, this.Request);
    }

    public async AddABGParameters(req: BaseRequest): Promise<number> {
        return await this.ABGParametersBo.AddABGParameters(req);
    }

    public async UpdateABGParameters(req: BaseRequest): Promise<boolean> {
        return await this.ABGParametersBo.UpdateABGParameters(req);
    }

    public async GetABGParametersById(req: BaseRequest): Promise<ABGParametersAttributes> {
        return await this.ABGParametersBo.GetABGParametersById(req);
    }

    public async GetABGParameterss(apiReq?: ApiRequest<ABGParametersFilters>): Promise<ApiResponse<ABGParametersAttributes[]>> {
        return await this.ABGParametersBo.GetABGParameterss(apiReq);
    }

    public async DeleteABGParameters(req: BaseRequest): Promise<Boolean> {
        return await this.ABGParametersBo.DeleteABGParameters(req);
    }
}
