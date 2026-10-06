import { BaseService, BoFactory } from '../../Base/Index';
import { StoreRackBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StoreRackAttributes } from '../Model/Interface/Index';
import { StoreRackFilters } from '../Common/Filters.e';

export class StoreRackService extends BaseService {
    private StoreRackBo: StoreRackBo;
    constructor(req?: Request) {
        super(req);
        this.StoreRackBo = BoFactory.GetBo(StoreRackBo, this.Request);
    }

    public async AddStoreRack(req: BaseRequest): Promise<number> {
        return await this.StoreRackBo.AddStoreRack(req);
    }

    public async UpdateStoreRack(req: BaseRequest): Promise<boolean> {
        return await this.StoreRackBo.UpdateStoreRack(req);
    }

    public async GetStoreRackById(req: BaseRequest): Promise<StoreRackAttributes> {
        return await this.StoreRackBo.GetStoreRackById(req);
    }

    public async GetStoreRacks(apiReq?: ApiRequest<StoreRackFilters>): Promise<ApiResponse<StoreRackAttributes[]>> {
        return await this.StoreRackBo.GetStoreRacks(apiReq);
    }

    public async DeleteStoreRack(req: BaseRequest): Promise<Boolean> {
        return await this.StoreRackBo.DeleteStoreRack(req);
    }
}
