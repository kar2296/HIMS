import { BaseService, BoFactory } from '../../Base/Index';
import { InsurancePaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { InsurancePaymentDetailsAttributes } from '../Model/Interface/Index';
import { InsurancePaymentDetailsFilters } from '../Common/Filters.e';

export class InsurancePaymentDetailsService extends BaseService {
    private InsurancePaymentDetailsBo: InsurancePaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.InsurancePaymentDetailsBo = BoFactory.GetBo(InsurancePaymentDetailsBo, this.Request);
    }

    public async AddInsurancePaymentDetails(req: BaseRequest): Promise<number> {
        return await this.InsurancePaymentDetailsBo.AddInsurancePaymentDetails(req);
    }

    public async UpdateInsurancePaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.InsurancePaymentDetailsBo.UpdateInsurancePaymentDetails(req);
    }

    public async GetInsurancePaymentDetailsById(req: BaseRequest): Promise<InsurancePaymentDetailsAttributes> {
        return await this.InsurancePaymentDetailsBo.GetInsurancePaymentDetailsById(req);
    }

    public async GetInsurancePaymentDetails(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>):
        Promise<ApiResponse<InsurancePaymentDetailsAttributes[]>> {
        return await this.InsurancePaymentDetailsBo.GetInsurancePaymentDetails(apiReq);
    }

    public async GetInsuranceDisallowance(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>):
        Promise<ApiResponse<InsurancePaymentDetailsAttributes[]>> {
        return await this.InsurancePaymentDetailsBo.GetInsuranceDisallowance(apiReq);
    }
    public async PrintInsurancedetailswithpatient(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        return await this.InsurancePaymentDetailsBo.PrintInsurancedetailswithpatient(apiReq);
    }
    public async PrintInsurancetdsreport(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        return await this.InsurancePaymentDetailsBo.PrintInsurancetdsreport(apiReq);
    }
    public async PrintInsurancedisallowancereport(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        return await this.InsurancePaymentDetailsBo.PrintInsurancedisallowancereport(apiReq);
    }
    public async DeleteInsurancePaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.InsurancePaymentDetailsBo.DeleteInsurancePaymentDetails(req);
    }
}
