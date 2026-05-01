import { BaseService, BoFactory } from '../../Base/Index';
import { StaffDiscountBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StaffDiscountAttributes } from '../Model/Interface/Index';
import { StaffDiscountFilters } from '../Common/Filters.e';

export class StaffDiscountService extends BaseService {
    private StaffDiscountBo: StaffDiscountBo;
    constructor(req?: Request) {
        super(req);
        this.StaffDiscountBo = BoFactory.GetBo(StaffDiscountBo, this.Request);
    }

    public async AddStaffDiscount(req: BaseRequest): Promise<number> {
        return await this.StaffDiscountBo.AddStaffDiscount(req);
    }

    public async UpdateStaffDiscount(req: BaseRequest): Promise<boolean> {
        return await this.StaffDiscountBo.UpdateStaffDiscount(req);
    }

    public async GetStaffDiscountById(req: BaseRequest): Promise<StaffDiscountAttributes> {
        return await this.StaffDiscountBo.GetStaffDiscountById(req);
    }

    public async GetStaffDiscounts(apiReq?: ApiRequest<StaffDiscountFilters>): Promise<ApiResponse<StaffDiscountAttributes[]>> {
        return await this.StaffDiscountBo.GetStaffDiscounts(apiReq);
    }

    public async DeleteStaffDiscount(req: BaseRequest): Promise<Boolean> {
        return await this.StaffDiscountBo.DeleteStaffDiscount(req);
    }
}
