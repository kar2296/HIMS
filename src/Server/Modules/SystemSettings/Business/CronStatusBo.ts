import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CronStatusInstance, CronStatusAttributes } from '../Model/Interface/Index';
import { CronStatusFilters } from '../Common/Filters.e';

export class CronStatusBo extends BaseBo<CronStatusInstance, CronStatusAttributes>  {

    public async AddCronStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCronStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCronStatusById(req: BaseRequest): Promise<CronStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCronStatus(apiReq?: ApiRequest<CronStatusFilters>):
        Promise<ApiResponse<CronStatusAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case CronStatusFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case CronStatusFilters.Name:
                    where['CronDescription'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public GetModel(): SStatic.Model<CronStatusInstance, CronStatusAttributes> {
        return this.Models.CronStatus;
    }

}
