import { BaseService, BoFactory } from '../../Base/Index';
import { BankStatementCancellationsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BankStatementCancellationsAttributes } from '../Model/Interface/Index';
import { BankStatementCancellationsFilters } from '../Common/Filters.e';

export class BankStatementCancellationsService extends BaseService {
    private BankStatementCancellationsBo: BankStatementCancellationsBo;
    constructor(req?: Request) {
        super(req);
        this.BankStatementCancellationsBo = BoFactory.GetBo(BankStatementCancellationsBo, this.Request);
    }

    public async AddBankStatementCancellations(req: BaseRequest): Promise<number> {
        return await this.BankStatementCancellationsBo.AddBankStatementCancellations(req);
    }

    public async UpdateBankStatementCancellations(req: BaseRequest): Promise<boolean> {
        return await this.BankStatementCancellationsBo.UpdateBankStatementCancellations(req);
    }

    public async GetBankStatementCancellationsById(req: BaseRequest): Promise<BankStatementCancellationsAttributes> {
        return await this.BankStatementCancellationsBo.GetBankStatementCancellationsById(req);
    }

    public async GetBankStatementCancellations(apiReq?: ApiRequest<BankStatementCancellationsFilters>):
        Promise<ApiResponse<BankStatementCancellationsAttributes[]>> {
        return await this.BankStatementCancellationsBo.GetBankStatementCancellations(apiReq);
    }

    public async DeleteBankStatementCancellations(req: BaseRequest): Promise<Boolean> {
        return await this.BankStatementCancellationsBo.DeleteBankStatementCancellations(req);
    }
}
