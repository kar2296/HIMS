import { BaseService, BoFactory } from '../../Base/Index';
import { BankStatementDenominationsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BankStatementDenominationsAttributes } from '../Model/Interface/Index';
import { BankStatementDenominationsFilters } from '../Common/Filters.e';

export class BankStatementDenominationsService extends BaseService {
    private BankStatementDenominationsBo: BankStatementDenominationsBo;
    constructor(req?: Request) {
        super(req);
        this.BankStatementDenominationsBo = BoFactory.GetBo(BankStatementDenominationsBo, this.Request);
    }

    public async AddBankStatementDenominations(req: BaseRequest): Promise<number> {
        return await this.BankStatementDenominationsBo.AddBankStatementDenominations(req);
    }

    public async UpdateBankStatementDenominations(req: BaseRequest): Promise<boolean> {
        return await this.BankStatementDenominationsBo.UpdateBankStatementDenominations(req);
    }

    public async GetBankStatementDenominationsById(req: BaseRequest): Promise<BankStatementDenominationsAttributes> {
        return await this.BankStatementDenominationsBo.GetBankStatementDenominationsById(req);
    }

    public async GetBankStatementDenominations(apiReq?: ApiRequest<BankStatementDenominationsFilters>):
        Promise<ApiResponse<BankStatementDenominationsAttributes[]>> {
        return await this.BankStatementDenominationsBo.GetBankStatementDenominations(apiReq);
    }

    public async DeleteBankStatementDenominations(req: BaseRequest): Promise<Boolean> {
        return await this.BankStatementDenominationsBo.DeleteBankStatementDenominations(req);
    }
}
