import { BaseService, BoFactory } from '../../Base/Index';
import { MRDMovementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { MRDMovementAttributes } from '../Model/Interface/Index';
import { MRDMovementFilters } from '../Common/Filters.e';

export class MRDMovementService extends BaseService {
    private MRDMovementBo: MRDMovementBo;
    constructor(req?: Request) {
        super(req);
        this.MRDMovementBo = BoFactory.GetBo(MRDMovementBo, this.Request);
    }

    public async AddMRDMovement(req: BaseRequest): Promise<number> {
        return await this.MRDMovementBo.AddMRDMovement(req);
    }

    public async UpdateMRDMovement(req: BaseRequest): Promise<boolean> {
        return await this.MRDMovementBo.UpdateMRDMovement(req);
    }

    public async GetMRDMovementById(req: BaseRequest): Promise<MRDMovementAttributes> {
        return await this.MRDMovementBo.GetMRDMovementById(req);
    }

    public async GetMRDMovements(apiReq?: ApiRequest<MRDMovementFilters>):
    Promise<ApiResponse<MRDMovementAttributes[]>> {
        return await this.MRDMovementBo.GetMRDMovements(apiReq);
    }

    public async DeleteMRDMovement(req: BaseRequest): Promise<Boolean> {
        return await this.MRDMovementBo.DeleteMRDMovement(req);
    }
}
