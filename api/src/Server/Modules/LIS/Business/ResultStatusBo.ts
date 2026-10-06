import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { ResultStatusInstance, ResultStatusAttributes } from '../Model/Interface/Index';

export class ResultStatusBo extends BaseBo<ResultStatusInstance, ResultStatusAttributes>  {
    public async AddResultStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateResultStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetResultStatusById(req: BaseRequest): Promise<ResultStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetResultStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<ResultStatusAttributes[]>> {
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

    public async DeleteResultStatus(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ResultStatusInstance, ResultStatusAttributes> {
        return this.Models.ResultStatus;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DisplayName', 'Text'], 'Name', 'Menmonics' ];
        let val = await this.GetResultStatuss(apiReq);
        return { [key]: val.Data };
    }

}
