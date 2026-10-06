import {BaseService, BoFactory} from '../../Base/Index';
import { ReferralChargeBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ReferralChargeAttributes} from '../Model/Interface/Index';
import { ReferralChargeFilters } from '../Common/Filters.e';

export class ReferralChargeService extends BaseService {
    private ReferralChargeBo: ReferralChargeBo;
    constructor(req?: Request) {
        super(req);
        this.ReferralChargeBo = BoFactory.GetBo(ReferralChargeBo, this.Request);
    }

    public async AddReferralCharge(req: BaseRequest): Promise<number> {
        return await this.ReferralChargeBo.AddReferralCharge(req);
    }

    public async UpdateReferralCharge(req: BaseRequest): Promise<boolean> {
        return await this.ReferralChargeBo.UpdateReferralCharge(req);
    }

    public async GetReferralChargeById(req: BaseRequest): Promise<ReferralChargeAttributes> {
        return await this.ReferralChargeBo.GetReferralChargeById(req);
    }

    public async GetReferralCharges(apiReq?: ApiRequest<ReferralChargeFilters>): Promise<ApiResponse<ReferralChargeAttributes[]>> {
        return await this.ReferralChargeBo.GetReferralCharges(apiReq);
    }

    public async DeleteReferralCharge(req: BaseRequest): Promise<Boolean> {
        return await this.ReferralChargeBo.DeleteReferralCharge(req);
    }
}
