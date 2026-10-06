import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BankStatementCancellationsFilters } from '../Common/Filters.e';
import {
    BankStatementCancellationsInstance,
    BankStatementCancellationsAttributes
} from '../Model/Interface/Index';

export class BankStatementCancellationsBo extends BaseBo<BankStatementCancellationsInstance,
    BankStatementCancellationsAttributes>  {
    public async AddBankStatementCancellations(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBankStatementCancellations(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageBankStatementCancellations(BankStatementId: number,
        details: BankStatementCancellationsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.BankStatementId = BankStatementId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        return true;
    }

    public async GetBankStatementCancellationsById(req: BaseRequest): Promise<BankStatementCancellationsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBankStatementCancellations(apiReq?: ApiRequest<BankStatementCancellationsFilters>):
        Promise<ApiResponse<BankStatementCancellationsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case BankStatementCancellationsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBankStatementCancellations(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BankStatementCancellationsInstance, BankStatementCancellationsAttributes> {
        return this.Models.BankStatementCancellations;
    }
}
