import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AnalytealiasesmasterInstance, AnalytealiasesmasterAttributes } from '../Model/Interface/Index';
import { AnalyteAliasFilters } from '../Common/Filters.e';

export class AnalytealiasesmasterBo extends BaseBo<AnalytealiasesmasterInstance, AnalytealiasesmasterAttributes> {
    public async AddAnalytealiasesmaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalytealiasesmaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnalytealiasesmasterById(req: BaseRequest): Promise<AnalytealiasesmasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAnalytealiasesmasters(apiReq?: ApiRequest<AnalyteAliasFilters>):
        Promise<ApiResponse<AnalytealiasesmasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AliasesType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AnalyteAliasFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AnalyteAliasFilters.Name:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } },

                        { Name: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case AnalyteAliasFilters.AnalyteId:
                        where['AnalyteId'] = param.Value;
                        break;
                    case AnalyteAliasFilters.AliasesType:
                        where['AliasesTypeId'] = param.Value;
                        break;
                    case AnalyteAliasFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteAnalytealiasesmaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AnalytealiasesmasterInstance, AnalytealiasesmasterAttributes> {
        return this.Models.Analytealiasesmaster;
    }
}
