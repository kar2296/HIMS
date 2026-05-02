import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StateMasterInstance, StateMasterAttributes } from '../Model/Interface/Index';
import { StateMasterFilters } from '../Common/Filters.e';

export class StateMasterBo extends BaseBo<StateMasterInstance, StateMasterAttributes> implements IOptionProvider {
    public async AddStateMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStateMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStateMasterById(req: BaseRequest): Promise<StateMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStateMasters(apiReq?: ApiRequest<StateMasterFilters>): Promise<ApiResponse<StateMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StateMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StateMasterFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case StateMasterFilters.Country:
                        where['CountryId'] = param.Value;
                        break;
                    case StateMasterFilters.StateCode:
                        where['StateCode'] = { '$like': param.Value + '%' };
                        break;
                    case StateMasterFilters.StateName:
                        where['StateName'] = { '$like': param.Value + '%' };
                        break;
                    case StateMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStateMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StateMasterInstance, StateMasterAttributes> {
        return this.Models.StateMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StateMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['StateName', 'Text'], 'StateName'];
        let val = await this.GetStateMasters(apiReq);
        return { [key]: val.Data };
    }
}
