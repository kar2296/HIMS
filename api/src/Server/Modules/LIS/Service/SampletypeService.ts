import {BaseService, BoFactory} from '../../Base/Index';
import { SampletypeBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { SampletypeAttributes} from '../Model/Interface/Index';
import { SampletypeFilters } from '../Common/Filters.e';

export class SampletypeService extends BaseService {
    private SampletypeBo: SampletypeBo;
    constructor(req?: Request) {
        super(req);
        this.SampletypeBo = BoFactory.GetBo(SampletypeBo, this.Request);
    }

    public async AddSampletype(req: BaseRequest): Promise<number> {
        return await this.SampletypeBo.AddSampletype(req);
    }

    public async UpdateSampletype(req: BaseRequest): Promise<boolean> {
        return await this.SampletypeBo.UpdateSampletype(req);
    }

    public async GetSampletypeById(req: BaseRequest): Promise<SampletypeAttributes> {
        return await this.SampletypeBo.GetSampletypeById(req);
    }

    public async GetSampletypes(apiReq?: ApiRequest<SampletypeFilters>): Promise<ApiResponse<SampletypeAttributes[]>> {
        return await this.SampletypeBo.GetSampletypes(apiReq);
    }

    public async DeleteSampletype(req: BaseRequest): Promise<Boolean> {
        return await this.SampletypeBo.DeleteSampletype(req);
    }
}
