import {BaseService, BoFactory} from '../../Base/Index';
import { GuarantorBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GuarantorAttributes} from '../Model/Interface/Index';
import { GuarantorFilters } from '../Common/Filters.e';

export class GuarantorService extends BaseService {
    private GuarantorBo: GuarantorBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorBo = BoFactory.GetBo(GuarantorBo, this.Request);
    }

    public async AddGuarantor(req: BaseRequest): Promise<number> {
        return await this.GuarantorBo.AddGuarantor(req);
    }

    public async UpdateGuarantor(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorBo.UpdateGuarantor(req);
    }

    public async GetGuarantorById(req: BaseRequest): Promise<GuarantorAttributes> {
        return await this.GuarantorBo.GetGuarantorById(req);
    }

    public async GetGuarantors(apiReq?: ApiRequest<GuarantorFilters>): Promise<ApiResponse<GuarantorAttributes[]>> {
        return await this.GuarantorBo.GetGuarantors(apiReq);
    }

    public async DeleteGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorBo.DeleteGuarantor(req);
    }

    public async GetSelfGuarantor(req: BaseRequest): Promise<GuarantorAttributes> {
        return await this.GuarantorBo.GetSelfGuarantor();
    }
    public async PrintInsuranceListReport(apiReq?: ApiRequest<GuarantorFilters>): Promise<any> {
        return await this.GuarantorBo.PrintInsuranceListReport(apiReq);
    }
    public async AddGuarantorMasterExcel(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorBo.AddGuarantorMasterExcel(req);
    }
}
