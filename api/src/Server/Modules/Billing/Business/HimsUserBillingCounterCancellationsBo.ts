import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UserBillingCounterCancellationsFilters } from '../Common/Filters.e';
import {
    UserBillingCounterCancellationsInstance,
    UserBillingCounterCancellationsAttributes
} from '../Model/Interface/Index';

export class UserBillingCounterCancellationsBo extends BaseBo<UserBillingCounterCancellationsInstance,
    UserBillingCounterCancellationsAttributes>  {
    public async AddUserBillingCounterCancellations(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserBillingCounterCancellations(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageUserBillingCounterCancellations(UserBillingCounterId: number,
        details: UserBillingCounterCancellationsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.UserBillingCounterId = UserBillingCounterId;
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

    public async GetUserBillingCounterCancellationsById(req: BaseRequest): Promise<UserBillingCounterCancellationsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUserBillingCounterCancellations(apiReq?: ApiRequest<UserBillingCounterCancellationsFilters>):
        Promise<ApiResponse<UserBillingCounterCancellationsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case UserBillingCounterCancellationsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteUserBillingCounterCancellations(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserBillingCounterCancellationsInstance, UserBillingCounterCancellationsAttributes> {
        return this.Models.UserBillingCounterCancellations;
    }
}
