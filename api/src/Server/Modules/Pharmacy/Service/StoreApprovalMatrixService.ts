import { BaseService, BoFactory } from '../../Base/Index';
import { StoreApprovalMatrixBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StoreApprovalMatrixAttributes } from '../Model/Interface/Index';
import { StoreApprovalMatrixFilters } from '../Common/Filters.e';

export class StoreApprovalMatrixService extends BaseService {
    private StoreApprovalMatrixBo: StoreApprovalMatrixBo;
    constructor(req?: Request) {
        super(req);
        this.StoreApprovalMatrixBo = BoFactory.GetBo(StoreApprovalMatrixBo, this.Request);
    }

    public async AddStoreApprovalMatrix(req: BaseRequest): Promise<number> {
        return await this.StoreApprovalMatrixBo.AddStoreApprovalMatrix(req);
    }

    public async UpdateStoreApprovalMatrix(req: BaseRequest): Promise<boolean> {
        return await this.StoreApprovalMatrixBo.UpdateStoreApprovalMatrix(req);
    }

    public async GetStoreApprovalMatrixById(req: BaseRequest): Promise<StoreApprovalMatrixAttributes> {
        return await this.StoreApprovalMatrixBo.GetStoreApprovalMatrixById(req);
    }

    public async GetStoreApprovalMatrix(apiReq?: ApiRequest<StoreApprovalMatrixFilters>):
        Promise<ApiResponse<StoreApprovalMatrixAttributes[]>> {
        return await this.StoreApprovalMatrixBo.GetStoreApprovalMatrix(apiReq);
    }

    public async DeleteStoreApprovalMatrix(req: BaseRequest): Promise<Boolean> {
        return await this.StoreApprovalMatrixBo.DeleteStoreApprovalMatrix(req);
    }
}
