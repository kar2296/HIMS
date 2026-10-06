import { BaseService, BoFactory } from '../../Base/Index';
import { InsurancePaymentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo} from '../../../Core/Index';
import { InsurancePaymentAttributes } from '../Model/Interface/Index';
import { InsurancePaymentFilters } from '../Common/Filters.e';

export class InsurancePaymentService extends BaseService {
    private InsurancePaymentBo: InsurancePaymentBo;
    constructor(req?: Request) {
        super(req);
        this.InsurancePaymentBo = BoFactory.GetBo(InsurancePaymentBo, this.Request);
    }

    public async AddInsurancePayment(req: BaseRequest): Promise<number> {
        return await this.InsurancePaymentBo.AddInsurancePayment(req);
    }

    public async UpdateInsurancePayment(req: BaseRequest): Promise<boolean> {
        return await this.InsurancePaymentBo.UpdateInsurancePayment(req);
    }

    public async GetInsurancePaymentById(req: BaseRequest): Promise<InsurancePaymentAttributes> {
        return await this.InsurancePaymentBo.GetInsurancePaymentById(req);
    }

    public async GetInsurancePayments(apiReq?: ApiRequest<InsurancePaymentFilters>):
        Promise<ApiResponse<InsurancePaymentAttributes[]>> {
        return await this.InsurancePaymentBo.GetInsurancePayments(apiReq);
    }
    public async PrintInsurancePayments(req: BaseRequest): Promise<FileInfo> {
        return await this.InsurancePaymentBo.PrintInsurancePayments(req);
    }
    public async PrintInsuranceReceiptReport(apiReq?: ApiRequest<InsurancePaymentFilters>): Promise<any> {
        return await this.InsurancePaymentBo.PrintInsuranceReceiptReport(apiReq);
    }

    public async DeleteInsurancePayment(req: BaseRequest): Promise<Boolean> {
        return await this.InsurancePaymentBo.DeleteInsurancePayment(req);
    }
}
