import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest} from '../../../Common/Index';
import { ProcedureAliasInstance, ProcedureAliasAttributes} from '../Model/Interface/Index';
import { ProcedureAliasFilters } from '../Common/Filters.e';

export class ProcedureAliasBo extends BaseBo<ProcedureAliasInstance, ProcedureAliasAttributes> {
    public async AddProcedureAlias(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProcedureAlias(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProcedureAliasById(req: BaseRequest): Promise<ProcedureAliasAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProcedureAliass(apiReq?: ApiRequest<ProcedureAliasFilters>): Promise<Array<ProcedureAliasAttributes>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ProcedureAliasFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ProcedureAliasFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ProcedureAliasFilters.ProcedureId:
                    where['ProcedureId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeleteProcedureAlias(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProcedureAliasInstance, ProcedureAliasAttributes> {
        return this.Models.ProcedureAlias;
    }
}
