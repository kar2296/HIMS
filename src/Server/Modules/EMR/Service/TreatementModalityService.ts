import { BaseService, BoFactory } from '../../Base/Index';
import { TreatementModalityBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TreatementModalityAttributes } from '../Model/Interface/Index';
import { TreatementModalityFilters } from '../Common/Filters.e';

export class TreatementModalityService extends BaseService {
    private TreatementModalityBo: TreatementModalityBo;
    constructor(req?: Request) {
        super(req);
        this.TreatementModalityBo = BoFactory.GetBo(TreatementModalityBo, this.Request);
    }

    public async AddTreatementModality(req: BaseRequest): Promise<number> {
        return await this.TreatementModalityBo.AddTreatementModality(req);
    }

    public async UpdateTreatementModality(req: BaseRequest): Promise<boolean> {
        return await this.TreatementModalityBo.UpdateTreatementModality(req);
    }

    public async ManageTreatementModality(req: BaseRequest): Promise<boolean> {
        return await this.TreatementModalityBo.ManageTreatementModality(req);
    }

    public async GetTreatementModalityById(req: BaseRequest): Promise<TreatementModalityAttributes> {
        return await this.TreatementModalityBo.GetTreatementModalityById(req);
    }

    public async GetTreatementModalitys(apiReq?: ApiRequest<TreatementModalityFilters>):
        Promise<ApiResponse<TreatementModalityAttributes[]>> {
        return await this.TreatementModalityBo.GetTreatementModalitys(apiReq);
    }

    public async DeleteTreatementModality(req: BaseRequest): Promise<Boolean> {
        return await this.TreatementModalityBo.DeleteTreatementModality(req);
    }
}
