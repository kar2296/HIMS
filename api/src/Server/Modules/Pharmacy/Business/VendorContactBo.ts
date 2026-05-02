import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VendorContactFilters } from '../Common/Filters.e';
import { VendorContactInstance, VendorContactAttributes } from '../Model/Interface/Index';

export class VendorContactBo extends BaseBo<VendorContactInstance, VendorContactAttributes> {
    public async AddVendorContact(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVendorContact(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVendorContactById(req: BaseRequest): Promise<VendorContactAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorContacts(apiReq?: ApiRequest<VendorContactFilters>): Promise<ApiResponse<VendorContactAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.PincodeMaster, attributes: ['PincodeId', 'Pincode'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryId', 'CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateId', 'StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictId', 'DistrictName'], required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityId', 'CityName'], required: false });
        include.push(this.GetReference('ContactType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorContactFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorContactFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case VendorContactFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case VendorContactFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteVendorContact(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorContactInstance, VendorContactAttributes> {
        return this.Models.VendorContact;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VendorContactFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'VendorId', 'VendorCode', ['VendorName', 'Text'], 'VendorName'];
        let val = await this.GetVendorContacts(apiReq);
        return { [key]: val.Data };
    }
}
