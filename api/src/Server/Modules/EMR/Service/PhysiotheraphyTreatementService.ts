import { BaseService, BoFactory } from '../../Base/Index';
import { PhysiotheraphyTreatementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PhysiotheraphyTreatementAttributes } from '../Model/Interface/Index';
import { PhysiotheraphyTreatementFilters } from '../Common/Filters.e';

export class PhysiotheraphyTreatementService extends BaseService {
    private PhysiotheraphyTreatementBo: PhysiotheraphyTreatementBo;
    constructor(req?: Request) {
        super(req);
        this.PhysiotheraphyTreatementBo = BoFactory.GetBo(PhysiotheraphyTreatementBo, this.Request);
    }

    public async AddPhysiotheraphyTreatement(req: BaseRequest): Promise<number> {
        return await this.PhysiotheraphyTreatementBo.AddPhysiotheraphyTreatement(req);
    }

    public async UpdatePhysiotheraphyTreatement(req: BaseRequest): Promise<boolean> {
        return await this.PhysiotheraphyTreatementBo.UpdatePhysiotheraphyTreatement(req);
    }

    public async GetPhysiotheraphyTreatementById(req: BaseRequest): Promise<PhysiotheraphyTreatementAttributes> {
        return await this.PhysiotheraphyTreatementBo.GetPhysiotheraphyTreatementById(req);
    }

    public async GetPhysiotheraphyTreatements(apiReq?: ApiRequest<PhysiotheraphyTreatementFilters>):
        Promise<ApiResponse<PhysiotheraphyTreatementAttributes[]>> {
        return await this.PhysiotheraphyTreatementBo.GetPhysiotheraphyTreatements(apiReq);
    }

    public async DeletePhysiotheraphyTreatement(req: BaseRequest): Promise<Boolean> {
        return await this.PhysiotheraphyTreatementBo.DeletePhysiotheraphyTreatement(req);
    }
}
