import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathProcedureInstance, CarePathProcedureAttributes } from '../Model/Interface/Index';
import { CarePathProcedureFilters } from '../Common/Filters.e';

export class CarePathProcedureBo extends BaseBo<CarePathProcedureInstance, CarePathProcedureAttributes> implements IOptionProvider {
    public async AddCarePathProcedure(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePathProcedure(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCarePathProcedureById(req: BaseRequest): Promise<CarePathProcedureAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePathProcedures(apiReq?: ApiRequest<CarePathProcedureFilters>):
        Promise<ApiResponse<CarePathProcedureAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('ProcedureCodeScheme'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathProcedureFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathProcedureFilters.CarePathId:
                        where['CarePathId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePathProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathProcedureFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCarePathProcedures(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathProcedureInstance, CarePathProcedureAttributes> {
        return this.Models.CarePathProcedure;
    }
}
