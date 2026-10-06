import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ImmunizationInstance, ImmunizationAttributes } from '../Model/Interface/Index';
import { ImmunizationFilters } from '../Common/Filters.e';

export class ImmunizationBo extends BaseBo<ImmunizationInstance, ImmunizationAttributes> {
    public async AddImmunization(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateImmunization(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetImmunizationById(req: BaseRequest): Promise<ImmunizationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetImmunizations(apiReq?: ApiRequest<ImmunizationFilters>): Promise<ApiResponse<ImmunizationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Frequency'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ImmunizationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ImmunizationFilters.Name:
                        where['ImmunizationName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ImmunizationFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ImmunizationFilters.ImmunizationFrequency:
                        where['FrequencyId'] = param.Value;
                        break;
					case ImmunizationFilters.ImmunizationCondition:
                        where['ConditionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteImmunization(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ImmunizationInstance, ImmunizationAttributes> {
        return this.Models.Immunization;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ImmunizationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ImmunizationName', 'Text'], 'ImmunizationName', 'Description','RouteId'];
        let val = await this.GetImmunizations(apiReq);
        return { [key]: val.Data };
    }
}
