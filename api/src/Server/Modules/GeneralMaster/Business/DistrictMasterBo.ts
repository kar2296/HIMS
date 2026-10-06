import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DistrictMasterInstance, DistrictMasterAttributes } from '../Model/Interface/Index';
import { DistrictMasterFilters } from '../Common/Filters.e';

export class DistrictMasterBo extends BaseBo<DistrictMasterInstance, DistrictMasterAttributes> implements IOptionProvider {
    public async AddDistrictMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDistrictMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDistrictMasterById(req: BaseRequest): Promise<DistrictMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDistrictMasters(apiReq?: ApiRequest<DistrictMasterFilters>): Promise<ApiResponse<DistrictMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DistrictMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DistrictMasterFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case DistrictMasterFilters.State:
                        where['StateId'] = param.Value;
                        break;
                    case DistrictMasterFilters.City:
                        where['CityId'] = param.Value;
                        break;
                    case DistrictMasterFilters.DistrictName:
                        where['DistrictName'] = { '$like': param.Value + '%' };
                        break;
                    case DistrictMasterFilters.Country:
                        where['CountryId'] = param.Value;
                        break;
                    case DistrictMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DistrictMasterFilters.DistrictCode:
                        where['DistrictCode'] = { '$like': param.Value + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDistrictMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DistrictMasterInstance, DistrictMasterAttributes> {
        return this.Models.DistrictMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DistrictMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DistrictName', 'Text'], 'DistrictName'];
        let val = await this.GetDistrictMasters(apiReq);
        return { [key]: val.Data };
    }
}
