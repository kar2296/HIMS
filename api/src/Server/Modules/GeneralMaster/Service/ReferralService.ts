import { BaseService, BoFactory } from '../../Base/Index';
import { ReferralBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ReferralAttributes, ReferralUserMapAttributes } from '../Model/Interface/Index';
import { ReferralFilters } from '../Common/Filters.e';

export class ReferralService extends BaseService {
    private ReferralBo: ReferralBo;
    constructor(req?: Request) {
        super(req);
        this.ReferralBo = BoFactory.GetBo(ReferralBo, this.Request);
    }

    public async AddReferral(req: BaseRequest): Promise<number> {
        return await this.ReferralBo.AddReferral(req);
    }

    public async UpdateReferral(req: BaseRequest): Promise<boolean> {
        return await this.ReferralBo.UpdateReferral(req);
    }

    public async GetReferralById(req: BaseRequest): Promise<ReferralAttributes> {
        return await this.ReferralBo.GetReferralById(req);
    }

    public async GetReferrals(apiReq?: ApiRequest<ReferralFilters>): Promise<ApiResponse<ReferralAttributes[]>> {
        return await this.ReferralBo.GetReferrals(apiReq);
    }

    public async DeleteReferral(req: BaseRequest): Promise<Boolean> {
        return await this.ReferralBo.DeleteReferral(req);
    }

    public async MapUsers(req: BaseRequest): Promise<Boolean> {
        return await this.ReferralBo.MapUsers(req);
    }

    public async GetUsers(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<ReferralUserMapAttributes>> {
        return await this.ReferralBo.GetUsers(apiReq) as ReferralUserMapAttributes[];
    }
    public async PrintReferraloctorListReport(apiReq?: ApiRequest<ReferralFilters>): Promise<any> {
        return await this.ReferralBo.PrintReferraloctorListReport(apiReq);
    }
}
