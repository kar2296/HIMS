import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ABGParametersInstance, ABGParametersAttributes } from '../Model/Interface/Index';
import { ABGParametersFilters } from '../Common/Filters.e';

export class ABGParametersBo extends BaseBo<ABGParametersInstance, ABGParametersAttributes> implements IOptionProvider {
    public async AddABGParameters(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateABGParameters(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetABGParametersById(req: BaseRequest): Promise<ABGParametersAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetABGParameterss(apiReq?: ApiRequest<ABGParametersFilters>): Promise<ApiResponse<ABGParametersAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ParameterType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ABGParametersFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ABGParametersFilters.Name:
                        (where as any)['$or'] = [{ 'ABGParameters': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ABGParametersFilters.ParameterTypeId:
                        where['ParameterTypeId'] = param.Value;
                        break;
                    case ABGParametersFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteABGParameters(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ABGParametersFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ABGParameters', 'Text'], 'ABGParameters'];
        let val = await this.GetABGParameterss(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ABGParametersInstance, ABGParametersAttributes> {
        return this.Models.ABGParameters;
    }
}
