import { BaseService, BoFactory } from '../../Base/Index';
import { BankStatementsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { BankStatementsAttributes } from '../Model/Interface/Index';
import { BankStatementsFilters } from '../Common/Filters.e';

export class BankStatementsService extends BaseService {
    private BankStatementsBo: BankStatementsBo;
    constructor(req?: Request) {
        super(req);
        this.BankStatementsBo = BoFactory.GetBo(BankStatementsBo, this.Request);
    }

    public async AddBankStatements(req: BaseRequest): Promise<number> {
        return await this.BankStatementsBo.AddBankStatements(req);
    }

    public async UpdateBankStatements(req: BaseRequest): Promise<boolean> {
        return await this.BankStatementsBo.UpdateBankStatements(req);
    }

    public async DatesAlreadyExist(req: BaseRequest): Promise<boolean> {
        return await this.BankStatementsBo.DatesAlreadyExist(req);
    }

    public async GetBankStatementsById(req: BaseRequest): Promise<BankStatementsAttributes> {
        return await this.BankStatementsBo.GetBankStatementsById(req);
    }

    public async GetBankStatements(apiReq?: ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        return await this.BankStatementsBo.GetBankStatements(apiReq);
    }

    public async GetBankStatementWithoutDenominations(apiReq?:
        ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        return await this.BankStatementsBo.GetBankStatementWithoutDenominations(apiReq);
    }

    public async GetBillingCounters(apiReq?: ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        return await this.BankStatementsBo.GetBillingCounters(apiReq);
    }

    public async PrintUpdateBankStatements(req: BaseRequest): Promise<FileInfo> {
        return await this.BankStatementsBo.PrintUpdateBankStatements(req);
    }
}
