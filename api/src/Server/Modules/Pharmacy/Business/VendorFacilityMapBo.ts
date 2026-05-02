import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
//import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VendorFacilityFilters } from '../Common/Filters.e';
import { VendorFacilityMapInstance, VendorFacilityMapAttributes } from '../Model/Interface/Index';
//import * as bo from '../../Pharmacy/Business/Index';

export class VendorFacilityMapBo extends BaseBo<VendorFacilityMapInstance, VendorFacilityMapAttributes> {
    public async AddVendorFacilityMap(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'VendorCode': req.Data['VendorCode'],
                'FacilityId': req.Data['FacilityId']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVendorFacilityMap(req: BaseRequest): Promise<boolean> {
        let duplicate = await this.FindAll({
            where: {
                'VendorCode': req.Data['VendorCode'],
                'FacilityId': req.Data['FacilityId'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageVendorFacilityMaps(MasterVendor: any, details: VendorFacilityMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailVendor): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.VendorMasterId = MasterVendor.VendorMasterId;
                detail.VendorCode = MasterVendor.VendorCode;
                detail.VendorName = MasterVendor.VendorName;
                detail.VendorDescription = MasterVendor.VendorDescription;
                detail.VendorTypeId = MasterVendor.VendorTypeId;
                detail.Pincode = MasterVendor.Pincode;
                detail.Area = MasterVendor.Area;
                detail.City = MasterVendor.City;
                detail.State = MasterVendor.State;
                detail.Country = MasterVendor.Country;
                detail.MobileNumber = MasterVendor.MobileNumber;
                detail.PhoneNumber = MasterVendor.PhoneNumber;
                detail.FaxNumber = MasterVendor.FaxNumber;
                detail.EmailAddress = MasterVendor.EmailAddress;
                //detail.ManufacturerName = MasterVendor.ManufacturerName;
                detail.ContactPerson = MasterVendor.ContactPerson;
                detail.BusinessDomainId = MasterVendor.BusinessDomainId;
                detail.DistributionTypeId = MasterVendor.DistributionTypeId;
                detail.PaymentTermsId = MasterVendor.PaymentTermsId;
                detail.LicenceCode = MasterVendor.LicenceCode;
                detail.AddressLine1 = MasterVendor.AddressLine1;
                detail.AddressLine2 = MasterVendor.AddressLine2;
                detail.AddressLine3 = MasterVendor.AddressLine3;
                detail.VendorUrl = MasterVendor.VendorUrl;
                detail.LeadTime = MasterVendor.LeadTime;
                detail.CurrencyCodeId = MasterVendor.CurrencyCodeId;
                detail.IsActive = MasterVendor.IsActive;
                detail.ActiveFrom = MasterVendor.ActiveFrom;
                detail.ActiveTo = MasterVendor.ActiveTo;
                detail.ActiveStatusId = MasterVendor.ActiveStatusId;
                detail.Comments = MasterVendor.Comments;
                if (MasterVendor) {
                    detail.Status = 1;
                } else {
                    detail.Status = 2;
                }
                if (detail.Id === 0) {
                    //await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailVendor);
        }));
        return true;
    }

    public async ManageFacilityVendorMaps(MasterFacility: any, details: VendorFacilityMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailVendor): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (MasterFacility.IsActive === true) {
                    detail.ActiveStatusId = 2;
                } else {
                    detail.ActiveStatusId = 3;
                }
                if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailVendor);
        }));
        return true;
    }

    public async GetVendorFacilityMapById(req: BaseRequest): Promise<VendorFacilityMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorFacilityMaps(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        //include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.VendorMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorFacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorFacilityFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VendorFacilityFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case VendorFacilityFilters.Name:
                        (where as any)[Op.or] = [{ VendorName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { VendorCode: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case VendorFacilityFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case VendorFacilityFilters.VendorTypeId:
                        where['VendorTypeId'] = param.Value;
                        break;
                    case VendorFacilityFilters.DistributionTypeId:
                        where['DistributionTypeId'] = param.Value;
                        break;
                    case VendorFacilityFilters.BusinessDomainId:
                        where['BusinessDomainId'] = param.Value;
                        break;
                    case VendorFacilityFilters.PhoneNumber:
                        where['PhoneNumber'] = param.Value;
                        break;
                    case VendorFacilityFilters.EmailAddress:
                        where['EmailAddress'] = param.Value;
                        break;
                    case VendorFacilityFilters.City:
                        where['City'] = param.Value;
                        break;
                    case VendorFacilityFilters.LeadTime:
                        where['LeadTime'] = param.Value;
                        break;
                    case VendorFacilityFilters.SupplyTypeId:
                        where['SupplyTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetFacilityMasterVendor(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        //include.push(this.GetReference('ActiveStatus'));
        //include.push({ model: this.Models.VendorMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorFacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorFacilityFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VendorFacilityFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case VendorFacilityFilters.Name:
                        (where as any)[Op.or] = [{ VendorName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { VendorCode: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case VendorFacilityFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case VendorFacilityFilters.VendorTypeId:
                        where['VendorTypeId'] = param.Value;
                        break;
                    case VendorFacilityFilters.DistributionTypeId:
                        where['DistributionTypeId'] = param.Value;
                        break;
                    case VendorFacilityFilters.BusinessDomainId:
                        where['BusinessDomainId'] = param.Value;
                        break;
                    case VendorFacilityFilters.PhoneNumber:
                        where['PhoneNumber'] = param.Value;
                        break;
                    case VendorFacilityFilters.EmailAddress:
                        where['EmailAddress'] = param.Value;
                        break;
                    case VendorFacilityFilters.City:
                        where['City'] = param.Value;
                        break;
                    case VendorFacilityFilters.LeadTime:
                        where['LeadTime'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async ManageVendorFacilityMap(MasterId: number, facilitymapvendor: VendorFacilityMapAttributes): Promise<boolean> {
        facilitymapvendor.VendorMasterId = MasterId;
        await this.Save(facilitymapvendor);
        return true;
    }

    public async DeleteVendorFacilityMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorFacilityMapInstance, VendorFacilityMapAttributes> {
        return this.Models.VendorFacilityMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VendorFacilityFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'VendorMasterId', 'VendorCode', ['VendorName', 'Text'], 'VendorName',
            'FacilityId', 'Rev'];
        let val = await this.GetVendorFacilityMaps(apiReq);
        return { [key]: val.Data };
    }
}

