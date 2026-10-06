import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { PriorityStatusInstance, PriorityStatusAttributes } from '../Model/Interface/Index';
//import { PriorityStatusFilters } from '../Common/Filters.e';

export class PriorityStatusBo extends BaseBo<PriorityStatusInstance, PriorityStatusAttributes>  {
    public async AddPriorityStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePriorityStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPriorityStatusById(req: BaseRequest): Promise<PriorityStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPriorityStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PriorityStatusAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePriorityStatus(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PriorityStatusInstance, PriorityStatusAttributes> {
        return this.Models.PriorityStatus;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DisplayName', 'Text'], ['Orderprioritye', 'NText'] ];
        let val = await this.GetPriorityStatuss(apiReq);
        return { [key]: val.Data };
    }

}
