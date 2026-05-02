import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientABGChartInstance, PatientABGChartAttributes } from '../Model/Interface/Index';
import { PatientABGChartFilters } from '../Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';

export class PatientABGChartBo extends BaseBo<PatientABGChartInstance, PatientABGChartAttributes>  {
    public async AddPatientABGChart(req: BaseRequest): Promise<number> {
        console.log(req.Data);
        if (req.Data) {
            if (req.Data.length > 0) {
                await this.ManagePatientABGChart(req.Data);
                return req.Data[0].PatientId;
            }
        }
        return 0;
        // let result = await this.Save(req.Data);
        // return result.dataValues.Id;
    }

    public async UpdatePatientABGChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManagePatientABGChart(details: PatientABGChartAttributes[])
        : Promise<boolean> {
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
    public async GetPatientABGChartById(req: BaseRequest): Promise<PatientABGChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientABGCharts(apiReq?: ApiRequest<PatientABGChartFilters>):
        Promise<ApiResponse<PatientABGChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        // include.push(this.GetReference('VentilatorMode'));
        // include.push(this.GetReference('DiscountMode'));
        // include.push({
        //     model: this.Models.Encounter,
        //     required: true,
        //     include: [
        //         { model: this.Models.WardMaster, required: false },
        //         { model: this.Models.WardRoomMaster, required: false },
        //         { model: this.Models.WardRoomBedMaster, required: false }
        //     ]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientABGChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientABGChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientABGChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientABGChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientABGChartFilters.ABGChartDate:
                        where['ABGChartDate'] = param.Value;
                        break;
                    case PatientABGChartFilters.From:
                        where['ABGChartDate'] = where['ABGChartDate'] || {};
                        (where['ABGChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientABGChartFilters.To:
                        where['ABGChartDate'] = where['ABGChartDate'] || {};
                        (where['ABGChartDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientABGChartFilters.FromAdm:
                        EncounterWhere['AdmissionDate'] = EncounterWhere['AdmissionDate'] || {};
                        (EncounterWhere['AdmissionDate'] as any)['$gte'] = param.Value;
                        IsEncounterRequired = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.Encounter,
            where: EncounterWhere,
            required: IsEncounterRequired,
            include: [
                { model: this.Models.WardMaster, required: false },
                { model: this.Models.WardRoomMaster, required: false },
                { model: this.Models.WardRoomBedMaster, required: false }
            ]
        });
        order.push(['ABGChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientABGChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientABGChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientABGChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientABGCharts(apiReq);
        let PatientABGChart = data.Data[0];
        let PatientABGChartlist = data.Data;
        let ABGChartlist: any = _.groupBy(data.Data, 'ABGChartTime');
        let ABGHeader: any = [];
        let ABGDetails: any = [];
        // let ABGQualifier: any = [];
        ABGHeader.push({ 'ABGParameters': 'Date' });
        ABGHeader.push({ 'ABGParameters': 'Time' });
        let header = 0;
        for (let idx in ABGChartlist) {
            let detaildt = 0;
            let ABGDetailsRec: any = [];
            let FullData = ABGChartlist[idx];
            for (let idxfl in FullData) {
                let ParamHeader = FullData[idxfl].ABGParameters;
                if (header === 0) {
                    ABGHeader.push({ 'ABGParameters': ParamHeader });
                }
                let ParamValue = FullData[idxfl].ParameterValues;
                let ParamDate = FullData[idxfl].ABGChartDate;
                let ParamTime = FullData[idxfl].ABGChartTime;
                let ParamQualify = FullData[idxfl].QualifierId;
                if (detaildt === 0) {
                    ABGDetailsRec.push({ 'ABGValues': ParamDate, 'ABGQualifier': null });
                    ABGDetailsRec.push({ 'ABGValues': ParamTime, 'ABGQualifier': null });
                    detaildt++;
                }
                ABGDetailsRec.push({ 'ABGValues': ParamValue, 'ABGQualifier': ParamQualify });
            }
            ABGDetails.push({ 'ABGTimes': ABGDetailsRec });
            header++;
        }

        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientABGChart.FacilityId);
        let info = {
            PatientABGChart: PatientABGChart,
            PatientABGChartlist: PatientABGChartlist,
            Encounter: Encounter,
            ABGHeader: ABGHeader,
            ABGDetails: ABGDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('abgchart', { header: {}, body: info });
    }
    public async PrintPatientABGChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientABGChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientABGCharts(apiReq);
        let PatientABGChart = data.Data[0];
        let PatientABGChartlist = data.Data;
        let ABGChartlist: any = _.groupBy(data.Data, 'ABGChartTime');
        let ABGHeader: any = [];
        let ABGDetails: any = [];
        // let ABGQualifier: any = [];
        ABGHeader.push({ 'ABGParameters': 'Date' });
        ABGHeader.push({ 'ABGParameters': 'Time' });
        let header = 0;
        for (let idx in ABGChartlist) {
            let detaildt = 0;
            let ABGDetailsRec: any = [];
            let FullData = ABGChartlist[idx];
            for (let idxfl in FullData) {
                let ParamHeader = FullData[idxfl].ABGParameters;
                if (header === 0) {
                    ABGHeader.push({ 'ABGParameters': ParamHeader });
                }
                let ParamValue = FullData[idxfl].ParameterValues;
                let ParamDate = FullData[idxfl].ABGChartDate;
                let ParamTime = FullData[idxfl].ABGChartTime;
                let ParamQualify = FullData[idxfl].QualifierId;
                if (detaildt === 0) {
                    ABGDetailsRec.push({ 'ABGValues': ParamDate, 'ABGQualifier': null });
                    ABGDetailsRec.push({ 'ABGValues': ParamTime, 'ABGQualifier': null });
                    detaildt++;
                }
                ABGDetailsRec.push({ 'ABGValues': ParamValue, 'ABGQualifier': ParamQualify });
            }
            ABGDetails.push({ 'ABGTimes': ABGDetailsRec });
            header++;
        }

        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientABGChart.FacilityId);
        let info = {
            PatientABGChart: PatientABGChart,
            PatientABGChartlist: PatientABGChartlist,
            Encounter: Encounter,
            ABGHeader: ABGHeader,
            ABGDetails: ABGDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('abgchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientABGChartInstance, PatientABGChartAttributes> {
        return this.Models.PatientABGChart;
    }

}
