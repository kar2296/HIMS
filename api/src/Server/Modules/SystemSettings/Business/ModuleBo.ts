import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse} from '../../../Common/Index';
import { ModuleInstance, ModuleAttributes} from '../Model/Interface/Index';
import { ModuleFilters } from '../Common/Filters.e';

export class ModuleBo extends BaseBo<ModuleInstance, ModuleAttributes> implements IOptionProvider {
    public async AddModule(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateModule(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetModuleById(req: BaseRequest): Promise<ModuleAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetModules(apiReq?: ApiRequest<ModuleFilters>): Promise<ApiResponse<ModuleAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ModuleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModuleFilters.Name:
                        where['ModuleName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ModuleFilters.ModuleCode:
                        where['ModuleCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ModuleFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteModule(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ModuleInstance, ModuleAttributes> {
        return this.Models.Module;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ModuleFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ModuleName', 'Text'], 'ModuleCode'];
        let val = await this.GetModules(apiReq);
        return { [key]: val.Data };
    }
}
