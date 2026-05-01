import { BaseService, BoFactory } from '../../Base/Index';
import { BankStatementDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BankStatementDetailsAttributes } from '../Model/Interface/Index';
import { BankStatementDetailsFilters } from '../Common/Filters.e';

export class BankStatementDetailsService extends BaseService {
    private BankStatementDetailsBo: BankStatementDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.BankStatementDetailsBo = BoFactory.GetBo(BankStatementDetailsBo, this.Request);
    }

    public async AddBankStatementDetails(req: BaseRequest): Promise<number> {
        return await this.BankStatementDetailsBo.AddBankStatementDetails(req);
    }

    public async UpdateBankStatementDetails(req: BaseRequest): Promise<boolean> {
        return await this.BankStatementDetailsBo.UpdateBankStatementDetails(req);
    }

    public async GetBankStatementDetailsById(req: BaseRequest): Promise<BankStatementDetailsAttributes> {
        return await this.BankStatementDetailsBo.GetBankStatementDetailsById(req);
    }

    public async GetBankStatementDetails(apiReq?: ApiRequest<BankStatementDetailsFilters>):
        Promise<ApiResponse<BankStatementDetailsAttributes[]>> {
        return await this.BankStatementDetailsBo.GetBankStatementDetails(apiReq);
    }

    public async DeleteBankStatementDetails(req: BaseRequest): Promise<Boolean> {
        return await this.BankStatementDetailsBo.DeleteBankStatementDetails(req);
    }
}
