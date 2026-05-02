import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { ReferralInstance, ReferralAttributes } from '../Model/Interface/Index';
import { ReferralFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class ReferralBo extends BaseBo<ReferralInstance, ReferralAttributes> {
    public async AddReferral(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReferral(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    // public async GetReferralById(req: BaseRequest): Promise<ReferralAttributes> {
    //     let result = await this.GetById(req.Id);
    //     return this.GetAttribute(result);
    // }

    public async GetReferralById(req: BaseRequest): Promise<ReferralAttributes> {
        let result = await this.GetById(req.Id, {attributes: ['Id', 'ReferralTypeId', ['ReferralName', 'Text'], 'ReferralCode',
             'PhoneNo', 'ReferralName']});
        return this.GetAttribute(result);
    }

    public async GetReferrals(apiReq?: ApiRequest<ReferralFilters>): Promise<ApiResponse<ReferralAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.CityMaster, required: false });
        include.push({ model: this.Models.StateMaster, required: false });
        include.push({ model: this.Models.CountryMaster, required: false });
        include.push(this.GetReference('ReferralType'));
        include.push(this.GetReference('MarketingPerson'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ReferralFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ReferralFilters.Name:
                        (where as any)[Op.or] = [{ ReferralName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ReferralCode: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ReferralFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ReferralFilters.ReferralType:
                        where['ReferralTypeId'] = param.Value;
                        break;
                    case ReferralFilters.MarketingPerson:
                        where['MarketingPersonId'] = param.Value;
                        break;
                    case ReferralFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ReferralFilters.IsDefault:
                        where['IsDefault'] = param.Value;
                        break;
                    case ReferralFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    case ReferralFilters.OtherSelfReferralId:
                        where['Id'] = { '$gt': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteReferral(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ReferralInstance, ReferralAttributes> {
        return this.Models.Referral;
    }

    public async MapUsers(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ReferralUserMap as any, 'ReferralId', 'UserId', super.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetUsers(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.ReferralUserMap as any, 'ReferralId', 'UserId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ReferralFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ReferralName', 'Text'], 'ReferralCode', 'ReferralTypeId', 'IsDefault'];
        let val = await this.GetReferrals(apiReq);
        return { [key]: val.Data };
    }
    public async PrintReferraloctorListReport(apiReq?: ApiRequest<ReferralFilters>): Promise<any> {
        let data = await this.GetReferrals(apiReq);
        let Referral = data.Data;
        let FacilityName = apiReq.Data.FacilityName;
        let ReferralType = apiReq.Data.ReferralType;
        let Status = apiReq.Data.Status;
        let ReferralData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ReferralData.FacilityId);
        let info = {
            Referral: Referral,
            Preferences: printPreferencesData,
            FacilityName: FacilityName,
            ReferralType: ReferralType,
            Status: Status
        };
        let pdfOption: any = null;
        let key = 'referraldoctorlistreport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
