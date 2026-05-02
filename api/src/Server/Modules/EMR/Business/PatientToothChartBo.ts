import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientToothChartInstance, PatientToothChartAttributes } from '../Model/Interface/Index';
import { PatientToothChartFilters } from '../Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';

export class PatientToothChartBo extends BaseBo<PatientToothChartInstance, PatientToothChartAttributes>  {
    public async AddPatientToothChart(req: BaseRequest): Promise<number> {
        console.log(req.Data);
        if (req.Data) {
            if (req.Data.length > 0) {
                await this.ManagePatientToothChart(req.Data);
                return req.Data[0].EncounterId;
            }
        }
        return 0;
    }

    public async UpdatePatientToothChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManagePatientToothChart(details: PatientToothChartAttributes[])
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
    public async GetPatientToothChartById(req: BaseRequest): Promise<PatientToothChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientToothCharts(apiReq?: ApiRequest<PatientToothChartFilters>):
        Promise<ApiResponse<PatientToothChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientToothChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientToothChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientToothChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientToothChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientToothChartFilters.ToothChartDatetime:
                        where['ToothChartDatetime'] = param.Value;
                        break;
                    case PatientToothChartFilters.FromAdm:
                        EncounterWhere['AdmissionDate'] = EncounterWhere['AdmissionDate'] || {};
                        (EncounterWhere['AdmissionDate'] as any)['$gte'] = param.Value;
                        IsEncounterRequired = true;
                        break;
                    case PatientToothChartFilters.ToothChartTypeId:
                        where['ToothChartTypeId'] = param.Value;
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
        order.push(['ToothChartDatetime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientToothChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientToothChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientToothChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientToothCharts(apiReq);
        let PatientToothChart = data.Data[0];
        let PatientToothChartlist = data.Data;
        let ToothChartlist: any = _.groupBy(data.Data, 'ToothChartTime');
        let ToothHeader: any = [];
        let ToothDetails: any = [];
        // let ToothQualifier: any = [];
        ToothHeader.push({ 'ToothParameters': 'Date' });
        ToothHeader.push({ 'ToothParameters': 'Time' });
        let header = 0;
        for (let idx in ToothChartlist) {
            let detaildt = 0;
            let ToothDetailsRec: any = [];
            let FullData = ToothChartlist[idx];
            for (let idxfl in FullData) {
                let ParamHeader = FullData[idxfl].ToothParameters;
                if (header === 0) {
                    ToothHeader.push({ 'ToothParameters': ParamHeader });
                }
                let ParamValue = FullData[idxfl].ParameterValues;
                let ParamDate = FullData[idxfl].ToothChartDate;
                let ParamTime = FullData[idxfl].ToothChartTime;
                let ParamQualify = FullData[idxfl].QualifierId;
                if (detaildt === 0) {
                    ToothDetailsRec.push({ 'ToothValues': ParamDate, 'ToothQualifier': null });
                    ToothDetailsRec.push({ 'ToothValues': ParamTime, 'ToothQualifier': null });
                    detaildt++;
                }
                ToothDetailsRec.push({ 'ToothValues': ParamValue, 'ToothQualifier': ParamQualify });
            }
            ToothDetails.push({ 'ToothTimes': ToothDetailsRec });
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientToothChart.FacilityId);
        let info = {
            PatientToothChart: PatientToothChart,
            PatientToothChartlist: PatientToothChartlist,
            Encounter: Encounter,
            ToothHeader: ToothHeader,
            ToothDetails: ToothDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('abgchart', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientToothChartInstance, PatientToothChartAttributes> {
        return this.Models.PatientToothChart;
    }

}
