import {BaseService, BoFactory} from '../../Base/Index';
import { IndicationBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { IndicationAttributes} from '../Model/Interface/Index';
import { IndicationFilters } from '../Common/Filters.e';

export class IndicationService extends BaseService {
    private IndicationBo:IndicationBo;
    constructor(req?: Request) {
        super(req);
        this.IndicationBo = BoFactory.GetBo(IndicationBo, this.Request);
    }

    public async AddIndication(req: BaseRequest): Promise<number> {
        return await this.IndicationBo.AddIndication(req);
    }

    public async UpdateIndication(req: BaseRequest): Promise<boolean> {
        return await this.IndicationBo.UpdateIndication(req);
    }

    public async GetIndicationById(req: BaseRequest): Promise<IndicationAttributes> {
        return await this.IndicationBo.GetIndicationById(req);
    }

    public async GetIndications(apiReq?: ApiRequest<IndicationFilters>): Promise<ApiResponse<IndicationAttributes[]>> {
        return await this.IndicationBo.GetIndications(apiReq);
    }

    public async DeleteIndication(req: BaseRequest): Promise<Boolean> {
        return await this.IndicationBo.DeleteIndication(req);
    }
}
