import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BankStatementDetailsFilters } from '../Common/Filters.e';
import {
    BankStatementDetailsInstance,
    BankStatementDetailsAttributes
} from '../Model/Interface/Index';

export class BankStatementDetailsBo extends BaseBo<BankStatementDetailsInstance,
    BankStatementDetailsAttributes>  {
    public async AddBankStatementDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBankStatementDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageBankStatementDetails(BankStatementId: number,
        details: BankStatementDetailsAttributes[]): Promise<any> {
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

    public async GetBankStatementDetailsById(req: BaseRequest): Promise<BankStatementDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBankStatementDetails(apiReq?: ApiRequest<BankStatementDetailsFilters>):
        Promise<ApiResponse<BankStatementDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case BankStatementDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                        case BankStatementDetailsFilters.BankStatementId:
                        where['BankStatementId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBankStatementDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BankStatementDetailsInstance, BankStatementDetailsAttributes> {
        return this.Models.BankStatementDetails;
    }
}
