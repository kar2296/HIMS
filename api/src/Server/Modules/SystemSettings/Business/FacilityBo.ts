import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { FacilityInstance, FacilityAttributes } from '../Model/Interface/Index';
import { FacilityFilters, FacilityPreferenceFilters } from '../Common/Filters.e';
import * as appMgBo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { readFileSync } from 'fs';
import { SequenceMastersFilters } from '../../General/Common/Filters.e';
import * as genBo from '../../General/Business/Index';

export class FacilityBo extends BaseBo<FacilityInstance, FacilityAttributes> implements IOptionProvider {
    public async AddFacility(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        let facilityId = result.dataValues.Id;

        let facilityPreferenceBO = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let prefReq = {
            Id: 0,
            PageContext: { PageSize: 500, PageNumber: 1 },
            Params: [{ Key: FacilityPreferenceFilters.FacilityId, Value: 1 }]
        };
        let FacilityPreferData = await facilityPreferenceBO.GetFacilityPreferences(prefReq);
        let PreferData: any = {
            Data: []
        };
        for (let idx in FacilityPreferData.Data) {
            let facilitypreferData = FacilityPreferData.Data[idx];
            let facPref: any = {
                Id: 0,
                FacilityId: facilityId,
                Category: facilitypreferData.Category,
                PreferenceDisplay: facilitypreferData.PreferenceDisplay,
                PreferenceKey: facilitypreferData.PreferenceKey,
                PreferenceType: facilitypreferData.PreferenceType,
                PreferenceValue: facilitypreferData.PreferenceValue,
                Row: facilitypreferData.Row,
                Col: facilitypreferData.Col,
                Status: facilitypreferData.Status,
            };
            PreferData.Data.push(facPref);
        }
        await facilityPreferenceBO.ManageNewFacilityPreference(PreferData);


        let sequenceBo = BoFactory.GetBo(genBo.SequenceMastersBo, this.Request);
        let seqReq = {
            Id: 0,
            PageContext: { PageSize: 500, PageNumber: 1 },
            Params: [{ Key: SequenceMastersFilters.FacilityId, Value: 1 }]
        };
        let SequenceData = await sequenceBo.GetSequenceMasterss(seqReq);
        let Sequence: any = {
            Data: []
        };
        for (let idx in SequenceData.Data) {
            let sequenceInfo = SequenceData.Data[idx];
            let seqData: any = {
                Id: 0,
                SeqName: sequenceInfo.SeqName + '' + facilityId,
                OrganizationId: req.Data.OrganizationId,
                FacilityId: facilityId,
                SeqPrefix: sequenceInfo.SeqPrefix,
                SeqSuffix: sequenceInfo.SeqSuffix,
                SeqStartId: sequenceInfo.SeqStartId,
                SeqLastId: sequenceInfo.SeqLastId,
                SeqBaseId: sequenceInfo.SeqBaseId,
                IsDailyReset: sequenceInfo.IsDailyReset,
                SeqIncSize: sequenceInfo.SeqIncSize,
                SeqBlockSize: sequenceInfo.SeqBlockSize,
                ActiveFrom: sequenceInfo.ActiveFrom,
                ActiveTo: sequenceInfo.ActiveTo,
                Status: sequenceInfo.Status,
            };
            Sequence.Data.push(seqData);
        }
        await sequenceBo.ManageNewSequences(Sequence);

        return facilityId;
    }

    public async UpdateFacility(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);

        let facilityPreferenceBO = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let prefReq = {
            Id: 0,
            PageContext: { PageSize: 500, PageNumber: 1 },
            Params: [{ Key: FacilityPreferenceFilters.FacilityId, Value: req.Data.FacilityId },
                // { Key: FacilityPreferenceFilters.PreferenceKey, Value: 'directlabsync' }
                { Key: FacilityPreferenceFilters.PreferenceKeys, Value: ['directlabsync', 'pharseqbasedonstore', 'itemexactsearch'] }
            ]
        };
        let FacilityPreferData = await facilityPreferenceBO.GetFacilityPreferences(prefReq);
        let PreferData: any = {
            Data: []
        };
        for (let idx in FacilityPreferData.Data) {
            let facilitypreferData = FacilityPreferData.Data[idx];
            let facPref: any = {};
            if(facilitypreferData.PreferenceKey === 'directlabsync') {
                facPref = {
                    Id: facilitypreferData.Id,
                    PreferenceValue: req.Data.IsDirectLabSync,
                };
                PreferData.Data.push(facPref);
            } else if(facilitypreferData.PreferenceKey === 'pharseqbasedonstore') {
                facPref = {
                    Id: facilitypreferData.Id,
                    PreferenceValue: req.Data.IsPharmacybasedonStore,
                };
                PreferData.Data.push(facPref);
            } else if(facilitypreferData.PreferenceKey === 'itemexactsearch') {
                facPref = {
                    Id: facilitypreferData.Id,
                    PreferenceValue: req.Data.IsItemExactSearch,
                };
                PreferData.Data.push(facPref);
            }

        }
        await facilityPreferenceBO.ManageNewFacilityPreference(PreferData);
        return result;
    }

    public async GetFacilityById(req: BaseRequest): Promise<FacilityAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetMinFacilityById(req: BaseRequest): Promise<FacilityAttributes> {
        let result = await this.GetById(req.Id, {attributes: ['Id', 'IsDoctorShare', 'IsVAT', 'FacilityName',
        'IsAddressSearch',
        'IsAlternateEmailMandatory', 'IsAlternateMobileMandatory']});
        return this.GetAttribute(result);
    }

    public async GetFacilitys(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
        include.push({ model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push(this.GetReference('FacilityType'));
        include.push(this.GetReference('ActiveStatus'));

        let onlyMine = true;

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FacilityFilters.Name:
                        where['FacilityName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FacilityFilters.FacilityCode:
                        where['FacilityCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FacilityFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case FacilityFilters.AllEntries:
                        onlyMine = !param.Value;
                        break;
                    case FacilityFilters.NameCode:
                        (where as any)['$or'] = [{ 'FacilityName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'FacilityCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case FacilityFilters.IsVAT:
                        where['IsVAT'] = param.Value;
                        break;
                    case FacilityFilters.IsDoctorShare:
                        where['IsDoctorShare'] = param.Value;
                        break;
                    case FacilityFilters.IsAdmissionDate:
                        where['IsAdmissionDate'] = param.Value;
                        break;
                    case FacilityFilters.IsAddressSearch:
                        where['IsAddressSearch'] = param.Value;
                        break;
                    case FacilityFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // if (onlyMine) {
        //     let mapbo = new MapBo(this.Models.UserFacilityMap, 'UserId', 'FacilityId', this.Request);
        //     let facilityInstances = await mapbo.FindAll({
        //         where: {
        //             'UserId': this.GetSession().UserId
        //         },
        //         attributes: ['FacilityId']
        //     });
        //     let facilityIds: Array<any> = [];
        //     facilityIds.push(-1);
        //     if (facilityInstances !== null) {
        //         for (let i of facilityInstances) {
        //             let facility = (<any>i)['dataValues'];
        //             facilityIds.push(facility['FacilityId']);
        //         }
        //     }
        //     where['Id'] = { '$in': facilityIds };
        // }
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async GetOtherFacilitys(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
        include.push({ model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push(this.GetReference('FacilityType'));
        include.push(this.GetReference('ActiveStatus'));

        // let onlyMine = true;

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FacilityFilters.Name:
                        where['FacilityName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FacilityFilters.FacilityCode:
                        where['FacilityCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FacilityFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    // case FacilityFilters.AllEntries:
                    //     onlyMine = !param.Value;
                    //     break;
                    case FacilityFilters.NameCode:
                        (where as any)['$or'] = [{ 'FacilityName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'FacilityCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case FacilityFilters.IsLabCentre:
                        where['IsLabCentre'] = param.Value;
                        break;
                    case FacilityFilters.IsMedicineCentre:
                        where['IsMedicineCentre'] = param.Value;
                        break;
                    case FacilityFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // if (onlyMine) {
        //     let mapbo = new MapBo(this.Models.UserFacilityMap, 'UserId', 'FacilityId', this.Request);
        //     let facilityInstances = await mapbo.FindAll({
        //         where: {
        //             'UserId': this.GetSession().UserId
        //         },
        //         attributes: ['FacilityId']
        //     });
        //     let facilityIds: Array<any> = [];
        //     facilityIds.push(-1);
        //     if (facilityInstances !== null) {
        //         for (let i of facilityInstances) {
        //             let facility = (<any>i)['dataValues'];
        //             facilityIds.push(facility['FacilityId']);
        //         }
        //     }
        //     where['Id'] = { '$in': facilityIds };
        // }
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteFacility(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FacilityInstance, FacilityAttributes> {
        return this.Models.Facility;
    }

    public async GetFacilityLogo(req: BaseRequest): Promise<any> {
        if (req.Data && req.Data.LogoPath) {
            let fs = require('fs');
            if (fs.existsSync(req.Data.LogoPath)) {
                let fileBuff = await readFileSync(req.Data.LogoPath);
                let logoBase64 = new Buffer(fileBuff).toString('base64');
                return { Id: req.Data.Id, Logo: logoBase64 };
            }
        }
        return null;
    }

    public async GetSecondFacilityLogo(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.SecondLogoPath);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<FacilityFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['FacilityName', 'Text'], 'FacilityCode', 'AddressLine1',
            'OrganizationId', 'PinCodeId', 'CityId', 'StateId', 'DistrictId', 'WardId',
            'CountryId', 'Country', 'ActiveStatusId', 'FacilityTypeId', 'Email', 'IsSwosthaIntegration', 'Lat', 'Lng',
        'SeniorCitizenDiscount'];
        let val = await this.GetFacilitys(apiReq);
        return { [key]: val.Data };
    }

    public async MapDeparments(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.FacilityDepartmentMap as any, 'FacilityId', 'DepartmentId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetDeparments(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.FacilityDepartmentMap as any, 'FacilityId', 'DepartmentId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }
}
