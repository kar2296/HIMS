import {BaseService, BoFactory } from '../../Base/Index';
import { BillingSettingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BillingSettingAttributes } from '../Model/Interface/Index';
import { BillingSettingFilters } from '../Common/Filters.e';

export class BillingSettingService extends BaseService {
    private BillingSettingBo: BillingSettingBo;
    constructor(req?: Request) {
        super(req);
        this.BillingSettingBo = BoFactory.GetBo(BillingSettingBo, this.Request);
    }

    public async AddBillingSetting(req: BaseRequest): Promise<number> {
        return await this.BillingSettingBo.AddBillingSetting(req);
    }

    public async UpdateBillingSetting(req: BaseRequest): Promise<boolean> {
        return await this.BillingSettingBo.UpdateBillingSetting(req);
    }

    public async GetBillingSettingById(req: BaseRequest): Promise<BillingSettingAttributes> {
        return await this.BillingSettingBo.GetBillingSettingById(req);
    }

    public async GetBillingSettings(apiReq?: ApiRequest<BillingSettingFilters>): Promise<ApiResponse<BillingSettingAttributes[]>> {
        return await this.BillingSettingBo.GetBillingSettings(apiReq);
    }

    public async DeleteBillingSetting(req: BaseRequest): Promise<Boolean> {
        return await this.BillingSettingBo.DeleteBillingSetting(req);
    }
}
