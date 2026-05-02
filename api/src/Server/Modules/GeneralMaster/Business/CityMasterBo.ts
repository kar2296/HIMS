import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CityMasterInstance, CityMasterAttributes } from '../Model/Interface/Index';
import { CityMasterFilters } from '../Common/Filters.e';

export class CityMasterBo extends BaseBo<CityMasterInstance, CityMasterAttributes> implements IOptionProvider {
    public async AddCityMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCityMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCityMasterById(req: BaseRequest): Promise<CityMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCityMasters(apiReq?: ApiRequest<CityMasterFilters>): Promise<ApiResponse<CityMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CityMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CityMasterFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case CityMasterFilters.State:
                        where['StateId'] = param.Value;
                        break;
                    case CityMasterFilters.District:
                        where['DistrictId'] = param.Value;
                        break;
                    case CityMasterFilters.CityName:
                        where['CityName'] = { '$like': param.Value + '%' };
                        break;
                    case CityMasterFilters.Country:
                        where['CountryId'] = param.Value;
                        break;
                    case CityMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CityMasterFilters.CityCode:
                        where['CityCode'] = { '$like': param.Value + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCityMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CityMasterInstance, CityMasterAttributes> {
        return this.Models.CityMaster;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<CityMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CityName', 'Text'], 'CityName'];
        let val = await this.GetCityMasters(apiReq);
        return { [key]: val.Data };
    }
}
