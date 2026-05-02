import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PincodeMasterInstance, PincodeMasterAttributes } from '../Model/Interface/Index';
import { PincodeMasterFilters } from '../Common/Filters.e';

export class PincodeMasterBo extends BaseBo<PincodeMasterInstance, PincodeMasterAttributes> implements IOptionProvider {
    public async AddPincodeMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePincodeMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPincodeMasterById(req: BaseRequest): Promise<PincodeMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPincodeMasters(apiReq?: ApiRequest<PincodeMasterFilters>): Promise<ApiResponse<PincodeMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PincodeMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PincodeMasterFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PincodeMasterFilters.Country:
                        where['CountryId'] = param.Value;
                        break;
                    case PincodeMasterFilters.State:
                        where['StateId'] = param.Value;
                        break;
                    case PincodeMasterFilters.City:
                        where['CityId'] = param.Value;
                        break;
                    case PincodeMasterFilters.Pincode:
                        where['Pincode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PincodeMasterFilters.Area:
                        where['Area'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PincodeMasterFilters.PincodeArea:
                        where['Area'] = param.Value;
                        break;
                    case PincodeMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PincodeMasterFilters.District:
                        where['DistrictId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePincodeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PincodeMasterInstance, PincodeMasterAttributes> {
        return this.Models.PincodeMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PincodeMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Pincode', 'Text'], 'Pincode'];
        let val = await this.GetPincodeMasters(apiReq);
        return { [key]: val.Data };
    }
}
