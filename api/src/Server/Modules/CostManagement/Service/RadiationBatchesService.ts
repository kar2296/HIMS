import { BaseService, BoFactory } from '../../Base/Index';
import { RadiationBatchesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RadiationBatchesAttributes } from '../Model/Interface/Index';
import { RadiationBatchesFilters } from '../Common/Filters.e';

export class RadiationBatchesService extends BaseService {
    private RadiationBatchesBo: RadiationBatchesBo;
    constructor(req?: Request) {
        super(req);
        this.RadiationBatchesBo = BoFactory.GetBo(RadiationBatchesBo, this.Request);
    }

    public async AddRadiationBatches(req: BaseRequest): Promise<number> {
        return await this.RadiationBatchesBo.AddRadiationBatches(req);
    }

    public async UpdateRadiationBatches(req: BaseRequest): Promise<boolean> {
        return await this.RadiationBatchesBo.UpdateRadiationBatches(req);
    }

    public async GetRadiationBatchesById(req: BaseRequest): Promise<RadiationBatchesAttributes> {
        return await this.RadiationBatchesBo.GetRadiationBatchesById(req);
    }
    public async GetRadiationBatchessGetRadiationBatchess(apiReq?:
        ApiRequest<RadiationBatchesFilters>): Promise<ApiResponse<RadiationBatchesAttributes[]>> {
        return await this.RadiationBatchesBo.GetRadiationBatchess(apiReq);
    }

    public async DeleteRadiationBatches(req: BaseRequest): Promise<Boolean> {
        return await this.RadiationBatchesBo.DeleteRadiationBatches(req);
    }
}
