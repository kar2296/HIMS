import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AppInfoInstance, AppInfoAttributes } from '../Model/Interface/Index';
import { AppInfoFilters } from '../Common/Filters.e';

export class AppInfoBo extends BaseBo<AppInfoInstance, AppInfoAttributes>  {
    public async AddAppInfo(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAppInfo(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppInfoById(req: BaseRequest): Promise<AppInfoAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAppInfos(apiReq?: ApiRequest<AppInfoFilters>): Promise<ApiResponse<AppInfoAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case AppInfoFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case AppInfoFilters.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppInfo(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AppInfoInstance, AppInfoAttributes> {
        return this.Models.AppInfo;
    }

}
