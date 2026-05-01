import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UserPreferenceInstance, UserPreferenceAttributes } from '../Model/Interface/Index';
import { UserPreferenceFilters } from '../Common/Filters.e';

export class UserPreferenceBo extends BaseBo<UserPreferenceInstance, UserPreferenceAttributes>  {
    public async AddUserPreference(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserPreference(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetUserPreferenceById(req: BaseRequest): Promise<UserPreferenceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUserPreferences(apiReq?: ApiRequest<UserPreferenceFilters>): Promise<ApiResponse<UserPreferenceAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UserPreferenceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UserPreferenceFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserPreferenceFilters.PrefKey:
                        where['PrefKey'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteUserPreference(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserPreferenceInstance, UserPreferenceAttributes> {
        return this.Models.UserPreference;
    }

}
