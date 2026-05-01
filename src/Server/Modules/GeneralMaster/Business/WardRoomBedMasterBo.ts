import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { WardRoomBedMasterInstance, WardRoomBedMasterAttributes } from '../Model/Interface/Index';
import { WardRoomBedMasterFilters, BedStatusFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as encBo from '../../Visit/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class WardRoomBedMasterBo extends BaseBo<WardRoomBedMasterInstance, WardRoomBedMasterAttributes> {
    public async AddWardRoomBedMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardRoomBedMaster(req: BaseRequest): Promise<boolean> {
        return await this.ManageWardRoomBedMaster(req.Data.Details);
    }

    public async UpdateBedMaster(req: BaseRequest): Promise<Boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageWardRoomBedMaster(details: WardRoomBedMasterAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetWardRoomBedMasterById(req: BaseRequest): Promise<WardRoomBedMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWardRoomBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<ApiResponse<WardRoomBedMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let WardmasterWhere: WhereOptions<any> = {};
        let isReqWardSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['Id', 'ServiceRateCategory'], required: false });
        // include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo', 'PhotoPath', 'ServiceRateCategoryId'], required: false });
        //   include.push(this.GetReference('RoomClassificationType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('BedStatus'));
        include.push({ model: this.Models.LocationMaster, attributes: ['Id', 'LocationName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardRoomBedMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.BedStatusId:
                        where['BedStatusId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.IsTemp:
                        where['IsTemp'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.WardMasterTypeId:
                        WardmasterWhere['WardMasterTypeId'] = param.Value;
                        isReqWardSearch = true;
                        break;
                    case WardRoomBedMasterFilters.ActiveStatusId:
                        WardmasterWhere['ActiveStatusId'] = param.Value;
                        isReqWardSearch = true;
                        break;
                    case WardRoomBedMasterFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.WardMaster,
            required: isReqWardSearch,
            where: WardmasterWhere,
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetWardRoomBedMasters1(apiReq?:
        ApiRequest<WardRoomBedMasterFilters>):
        Promise<ApiResponse<WardRoomBedMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let WardmasterWhere: WhereOptions<any> = {};
        let isReqWardSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['Id', 'ServiceRateCategory'], required: false });
        // include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo', 'PhotoPath', 'ServiceRateCategoryId'], required: false });
        //   include.push(this.GetReference('RoomClassificationType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('BedStatus'));
        include.push({ model: this.Models.LocationMaster, attributes: ['Id', 'LocationName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardRoomBedMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.BedStatusId:
                        where['BedStatusId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.IsTemp:
                        where['IsTemp'] = param.Value;
                        break;
                    case WardRoomBedMasterFilters.WardMasterTypeId:
                        WardmasterWhere['WardMasterTypeId'] = param.Value;
                        isReqWardSearch = true;
                        break;
                    case WardRoomBedMasterFilters.ActiveStatusId:
                        WardmasterWhere['ActiveStatusId'] = param.Value;
                        isReqWardSearch = true;
                        break;
                    case WardRoomBedMasterFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.WardMaster,
            required: isReqWardSearch,
            where: WardmasterWhere,
        });
        apiReq.Attributes = ['Id', 'BedStatusId', 'FacilityId', 'RoomId', 'Code'];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async ManageBedStatus(req: BaseRequest): Promise<Boolean> {
        let roombed = await this.GetWardRoomBedMasterById({ Id: req.Data.BedId });
        roombed.BedStatusId = 2;
        let result = await this.Update(roombed);
        return result;
    }

    public async ManageEncCancelBedStatus(req: BaseRequest): Promise<Boolean> {
        let roombed = await this.GetWardRoomBedMasterById({ Id: req.Data.BedId });
        roombed.BedStatusId = 1;
        let result = await this.Update(roombed);
        return result;
    }


    public async DeleteWardRoomBedMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WardRoomBedMasterInstance, WardRoomBedMasterAttributes> {
        return this.Models.WardRoomBedMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['BedNo', 'Text']];
        let val = await this.GetWardRoomBedMasters(apiReq);
        return { [key]: val.Data };
    }

    public async GetBedStatusList(apiReq: ApiRequest<BedStatusFilters>): Promise<ApiResponse<any>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedStatusFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedStatusFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let bedInfo = await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
        return { Data: bedInfo };
    }


    public async CapacityCount(req: BaseRequest): Promise<any> {
        let WardGroup: { [id: number]: any[] } = {};
        let WardGroupJoin: any = {
            model: this.Models.WardMaster,
            required: true,
        };
        let capacityInstance: any = await this.FindAll({
            attributes: ['BedStatusId', 'WardId'],
            where: {
                // AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
                BedStatusId: { '$eq': 1 }
            },
            include: [WardGroupJoin]
        });
        if (capacityInstance) {
            let groupbills = _.groupBy(capacityInstance, 'WardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let CapacityCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                CapacityCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.WardId;
                    WardName = bills.WardMaster.WardName;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'CapacityCount': CapacityCount
                };
                WardGroup[WardId].push(info);
            }
        }


        return WardGroup;
    }
    public async PrintWardRoomBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        let data = await this.GetWardRoomBedMasters(apiReq);
        let WardDetails = data.Data;
        let BedStatus = apiReq.Data.BedStatus;
        let WardName = apiReq.Data.WardName;
        let WardDetailsData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(WardDetailsData.FacilityId);
        let info = {
            WardDetails: WardDetails,
            Preferences: printPreferencesData,
            BedStatus: BedStatus,
            WardName: WardName
        };
        let pdfOption: any = null;
        let key = 'wardandbedlistreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
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
    public async PrintAvailableBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        let data = await this.GetWardRoomBedMasters(apiReq);
        let WardDetails = data.Data;
        let WardName = apiReq.Data.WardName;
        let WardDetailsData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(WardDetailsData.FacilityId);
        let info = {
            WardDetails: WardDetails,
            Preferences: printPreferencesData,
            WardName: WardName
        };
        let pdfOption: any = null;
        let key = 'availablebedreport';
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

    public async GetFacilityCovidBedDetail(req: BaseRequest): Promise<any> {
        let allbedCount = await this.Items.count({
            where: {
                'Status': 1,
                // 'CreatedAt': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let covidbedCount = await this.Items.count({
            where: {
                'Status': 1,
                'IsCovidBed': true,
                // 'CreatedAt': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'allbedCount': allbedCount,
            'covidbedCount': covidbedCount
        };
    }
    public async PrintCovidStatisticsReport(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        let WardDetails = await this.GetFacilityCovidBedDetail(apiReq);
        let encounterBO = BoFactory.GetBo(encBo.EncounterBo, this.Request);
        let EncounterDetails = await encounterBO.GetFacilityCovidBedDetail(apiReq);

        let tenDaysCount = EncounterDetails.Covid10dayCount;
        EncounterDetails.Cov10DayCount = 0;
        for (let idx in tenDaysCount) {
            let Daydiff = tenDaysCount[idx];
            let date1 = new Date(Daydiff.AdmDate);
            let date2 = new Date(Daydiff.DiscDate);
            let Difference_In_Time = date2.getTime() - date1.getTime();
            let timeDuration = (Difference_In_Time / (1000 * 3600 * 24));
            if (timeDuration < 10) {
                EncounterDetails.Cov10DayCount++;
            }
        }

        let Total = (EncounterDetails.covidventilatorCount || 0) +
            (EncounterDetails.covidHighflowO2Count || 0) +
            (EncounterDetails.covidmildCount || 0);

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(apiReq.Data.FacilityId);
        let info = {
            WardDetails: WardDetails,
            EncounterDetails: EncounterDetails,
            Total: Total,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'covidstatisticsreport';
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
