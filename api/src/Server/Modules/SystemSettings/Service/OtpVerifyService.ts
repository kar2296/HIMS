import { BaseService, BoFactory } from '../../Base/Index';
import { OtpVerifyBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtpVerifyAttributes } from '../Model/Interface/Index';
import { OtpVerifyFilters } from '../Common/Filters.e';

export class OtpVerifyService extends BaseService {
    private OtpVerifyBo: OtpVerifyBo;
    constructor(req?: Request) {
        super(req);
        this.OtpVerifyBo = BoFactory.GetBo(OtpVerifyBo, this.Request);
    }

    public async AddOtpVerify(req: BaseRequest): Promise<number> {
        return await this.OtpVerifyBo.AddOtpVerify(req);
    }

    public async AddOtpVerifyNoSession(req: BaseRequest): Promise<number> {
        return await this.OtpVerifyBo.AddOtpVerifyWithoutSession(req);
    }

    public async AddProviderOtpVerify(req: BaseRequest): Promise<number> {
        return await this.OtpVerifyBo.AddProviderOtpVerify(req);
    }

    public async UpdateProviderOtpVerify(req: BaseRequest): Promise<number> {
        return await this.OtpVerifyBo.UpdateProviderOtpVerify(req);
    }

    public async UpdateOtpVerify(req: BaseRequest): Promise<boolean> {
        return await this.OtpVerifyBo.UpdateOtpVerify(req);
    }

    public async UpdateOtpVerifyWithoutSession(req: BaseRequest): Promise<boolean> {
        return await this.OtpVerifyBo.UpdateOtpVerifyWithoutSession(req);
    }

    public async SendForgotOtpVerify(req: BaseRequest): Promise<boolean> {
        return await this.OtpVerifyBo.SendForgotOtpVerify(req);
    }

    public async UpdateForgotOtpVerify(req: BaseRequest): Promise<boolean> {
        return await this.OtpVerifyBo.UpdateForgotOtpVerify(req);
    }

    public async GetOtpVerifyById(req: BaseRequest): Promise<OtpVerifyAttributes> {
        return await this.OtpVerifyBo.GetOtpVerifyById(req);
    }

    public async SendForgotOtpVerifyNoSession(req: BaseRequest): Promise<any> {
        return await this.OtpVerifyBo.SendForgotOtpVerifyWithoutSession(req);
    }

    public async GetOtpVerifys(apiReq?: ApiRequest<OtpVerifyFilters>): Promise<ApiResponse<OtpVerifyAttributes[]>> {
        return await this.OtpVerifyBo.GetOtpVerifys(apiReq);
    }

    public async DeleteOtpVerify(req: BaseRequest): Promise<Boolean> {
        return await this.OtpVerifyBo.DeleteOtpVerify(req);
    }

}
