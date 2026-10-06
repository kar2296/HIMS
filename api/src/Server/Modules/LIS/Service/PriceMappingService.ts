import {BaseService, BoFactory} from '../../Base/Index';
import { PriceMappingBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PriceMappingAttributes} from '../Model/Interface/Index';
import { PriceMappingFilters } from '../Common/Filters.e';

export class PriceMappingService extends BaseService {
    private PriceMappingBo: PriceMappingBo;
    constructor(req?: Request) {
        super(req);
        this.PriceMappingBo = BoFactory.GetBo(PriceMappingBo, this.Request);
    }

    public async AddPriceMapping(req: BaseRequest): Promise<number> {
        return await this.PriceMappingBo.AddPriceMapping(req);
    }

    public async UpdatePriceMapping(req: BaseRequest): Promise<boolean> {
        return await this.PriceMappingBo.UpdatePriceMapping(req);
    }

    public async GetPriceMappingById(req: BaseRequest): Promise<PriceMappingAttributes> {
        return await this.PriceMappingBo.GetPriceMappingById(req);
    }

    public async GetPriceMappings(apiReq?: ApiRequest<PriceMappingFilters>): Promise<ApiResponse<PriceMappingAttributes[]>> {
        return await this.PriceMappingBo.GetPriceMappings(apiReq);
    }

    public async DeletePriceMapping(req: BaseRequest): Promise<Boolean> {
        return await this.PriceMappingBo.DeletePriceMapping(req);
    }
}
