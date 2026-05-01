import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EscalationMatrixInstance, EscalationMatrixAttributes } from '../Model/Interface/Index';
import { EscalationMatrixFilters } from '../Common/Filters.e';

export class EscalationMatrixBo extends BaseBo<EscalationMatrixInstance, EscalationMatrixAttributes> implements IOptionProvider {
    public async AddEscalationMatrix(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEscalationMatrix(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageEscalationMatrix(req: BaseRequest): Promise<boolean> {
        let list: EscalationMatrixAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }


    public async GetEscalationMatrixById(req: BaseRequest): Promise<EscalationMatrixAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEscalationMatrixs(apiReq?: ApiRequest<EscalationMatrixFilters>): Promise<ApiResponse<EscalationMatrixAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EscalationMatrixFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEscalationMatrix(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EscalationMatrixFilters>): Promise<any> {
        let val = await this.GetEscalationMatrixs(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EscalationMatrixInstance, EscalationMatrixAttributes> {
        return this.Models.EscalationMatrix;
    }

}
