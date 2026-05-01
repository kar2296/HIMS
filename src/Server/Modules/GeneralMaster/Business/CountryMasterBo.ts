import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CountryMasterInstance, CountryMasterAttributes } from '../Model/Interface/Index';
import { CountryMasterFilters } from '../Common/Filters.e';

export class CountryMasterBo extends BaseBo<CountryMasterInstance, CountryMasterAttributes> implements IOptionProvider {
    public async AddCountryMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCountryMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCountryMasterById(req: BaseRequest): Promise<CountryMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCountryMasters(apiReq?: ApiRequest<CountryMasterFilters>): Promise<ApiResponse<CountryMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CountryMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CountryMasterFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case CountryMasterFilters.CountryCode:
                        where['CountryCode'] = { '$like': param.Value + '%' };
                        break;
                    case CountryMasterFilters.CountryName:
                        where['CountryName'] = { '$like': param.Value + '%' };
                        break;
                    case CountryMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCountryMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CountryMasterInstance, CountryMasterAttributes> {
        return this.Models.CountryMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CountryMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CountryName', 'Text'], ['CountryCode', 'Code'],
         'CountryName'];
        let val = await this.GetCountryMasters(apiReq);
        return { [key]: val.Data };
    }
}
