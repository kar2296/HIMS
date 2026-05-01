import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ScreenInstance, ScreenAttributes} from '../Model/Interface/Index';
import { ScreenFilters } from '../Common/Filters.e';

export class ScreenBo extends BaseBo<ScreenInstance, ScreenAttributes> implements IOptionProvider {
    public async AddScreen(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateScreen(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetScreenById(req: BaseRequest): Promise<ScreenAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetScreens(apiReq?: ApiRequest<ScreenFilters>): Promise<ApiResponse<ScreenAttributes[]>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ScreenFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ScreenFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ScreenFilters.ModuleId:
                    where['ModuleId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, attributes: apiReq.Attributes });
    }

    public async DeleteScreen(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ScreenInstance, ScreenAttributes> {
        return this.Models.Screen;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ScreenFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ScreenName', 'Text'], 'ScreenCode'];
        let val = await this.GetScreens(apiReq);
        return { [key]: val.Data };
    }
}
