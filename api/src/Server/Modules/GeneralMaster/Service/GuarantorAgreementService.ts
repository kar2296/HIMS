import { BaseService, BoFactory } from '../../Base/Index';
import { GuarantorAgreementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GuarantorAgreementAttributes } from '../Model/Interface/Index';
import { GuarantorAgreementFilters } from '../Common/Filters.e';

export class GuarantorAgreementService extends BaseService {
    private GuarantorAgreementBo: GuarantorAgreementBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorAgreementBo = BoFactory.GetBo(GuarantorAgreementBo, this.Request);
    }

    public async AddGuarantorAgreement(req: BaseRequest): Promise<number> {
        return await this.GuarantorAgreementBo.AddGuarantorAgreement(req);
    }

    public async UpdateGuarantorAgreement(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorAgreementBo.UpdateGuarantorAgreement(req);
    }

    public async GetGuarantorAgreementById(req: BaseRequest): Promise<GuarantorAgreementAttributes> {
        return await this.GuarantorAgreementBo.GetGuarantorAgreementById(req);
    }

    public async GetGuarantorAgreements(
        apiReq?: ApiRequest<GuarantorAgreementFilters>): Promise<ApiResponse<GuarantorAgreementAttributes[]>> {
        return await this.GuarantorAgreementBo.GetGuarantorAgreements(apiReq);
    }

    public async DeleteGuarantorAgreement(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorAgreementBo.DeleteGuarantorAgreement(req);
    }
}
