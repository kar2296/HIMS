import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CustomerContactFilters } from '../Common/Filters.e';
import { CustomerContactInstance, CustomerContactAttributes } from '../Model/Interface/Index';

export class CustomerContactBo extends BaseBo<CustomerContactInstance, CustomerContactAttributes> {
    public async AddCustomerContact(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCustomerContact(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCustomerContactById(req: BaseRequest): Promise<CustomerContactAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCustomerContacts(apiReq?: ApiRequest<CustomerContactFilters>): Promise<ApiResponse<CustomerContactAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.PincodeMaster, attributes: ['PincodeId','Pincode'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryId','CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateId','StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictId','DistrictName'], required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityId','CityName'], required: false });
        include.push(this.GetReference('ContactType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CustomerContactFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CustomerContactFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case CustomerContactFilters.CustomerMasterId:
                        where['CustomerMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCustomerContact(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CustomerContactInstance, CustomerContactAttributes> {
        return this.Models.CustomerContact;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CustomerContactFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'CustomerId', 'CustomerCode', ['CustomerName', 'Text'], 'CustomerName'];
        let val = await this.GetCustomerContacts(apiReq);
        return { [key]: val.Data };
    }
}
