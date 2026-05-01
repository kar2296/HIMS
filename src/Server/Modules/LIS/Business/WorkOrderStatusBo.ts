import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { WorkOrderStatusInstance, WorkOrderStatusAttributes } from '../Model/Interface/Index';

export class WorkOrderStatusBo extends BaseBo<WorkOrderStatusInstance, WorkOrderStatusAttributes>  {
    public async AddWorkOrderStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWorkOrderStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWorkOrderStatusById(req: BaseRequest): Promise<WorkOrderStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWorkOrderStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<WorkOrderStatusAttributes[]>> {
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

    public async DeleteWorkOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DisplayName', 'Text']];
        let val = await this.GetWorkOrderStatuss(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<WorkOrderStatusInstance, WorkOrderStatusAttributes> {
        return this.Models.WorkOrderStatus;
    }

}
