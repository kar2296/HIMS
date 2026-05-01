import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ContextInstance, ContextAttributes } from '../Model/Interface/Index';
import { ContextFilters } from '../Common/Filters.e';

export class ContextBo extends BaseBo<ContextInstance, ContextAttributes>  {
    public async AddContext(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateContext(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetContextById(req: BaseRequest): Promise<ContextAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetContexts(apiReq?: ApiRequest<ContextFilters>): Promise<ApiResponse<ContextAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ContextFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ContextFilters.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteContext(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ContextInstance, ContextAttributes> {
        return this.Models.Context;
    }

}
