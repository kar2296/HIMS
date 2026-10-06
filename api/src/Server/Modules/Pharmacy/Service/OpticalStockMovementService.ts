import {BaseService, BoFactory} from '../../Base/Index';
import { OpticalStockMovementBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { OpticalStockMovementAttributes} from '../Model/Interface/Index';
import { OpticalStockMovementFilters } from '../Common/Filters.e';

export class OpticalStockMovementService extends BaseService {
    private OpticalStockMovementBo: OpticalStockMovementBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalStockMovementBo = BoFactory.GetBo(OpticalStockMovementBo, this.Request);
    }

    public async AddOpticalStockMovement(req: BaseRequest): Promise<number> {
        return await this.OpticalStockMovementBo.AddOpticalStockMovement(req);
    }

    public async UpdateOpticalStockMovement(req: BaseRequest): Promise<boolean> {
        return await this.OpticalStockMovementBo.UpdateOpticalStockMovement(req);
    }

    public async GetOpticalStockMovementById(req: BaseRequest): Promise<OpticalStockMovementAttributes> {
        return await this.OpticalStockMovementBo.GetOpticalStockMovementById(req);
    }

    public async GetOpticalStockMovements(apiReq?: ApiRequest<OpticalStockMovementFilters>):
    Promise<ApiResponse<OpticalStockMovementAttributes[]>> {
        return await this.OpticalStockMovementBo.GetOpticalStockMovements(apiReq);
    }

    public async DeleteOpticalStockMovement(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalStockMovementBo.DeleteOpticalStockMovement(req);
    }
}
