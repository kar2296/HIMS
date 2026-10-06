import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientMonitorChartInstance, PatientMonitorChartAttributes } from '../Model/Interface/Index';
import { PatientMonitorChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientMonitorChartBo extends BaseBo<PatientMonitorChartInstance, PatientMonitorChartAttributes>  {
    public async AddPatientMonitorChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientMonitorChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientMonitorChartById(req: BaseRequest): Promise<PatientMonitorChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientMonitorCharts(apiReq?: ApiRequest<PatientMonitorChartFilters>):
        Promise<ApiResponse<PatientMonitorChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        //include.push(this.GetReference('VentilatorMode'));
        include.push(this.GetReference('DiscountMode'));
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
                    case PatientMonitorChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.MonitorChartDate:
                        where['MonitorChartDate'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.From:
                        where['MonitorChartDate'] = where['MonitorChartDate'] || {};
                        (where['MonitorChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.To:
                        where['MonitorChartDate'] = where['MonitorChartDate'] || {};
                        (where['MonitorChartDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientMonitorChartFilters.FromAdm:
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
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId','DOB'],
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
        order.push(['MonitorChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientMonitorChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientMonitorChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientMonitorChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientMonitorCharts(apiReq);
        let PatientMonitorChart = data.Data[0];
        let PatientMonitorChartlist = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key:EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientMonitorChart.FacilityId);
            let info = {
            PatientMonitorChart: PatientMonitorChart,
            Encounter: Encounter,
            PatientMonitorChartlist: PatientMonitorChartlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('monitorchart', { header: {}, body: info });
    }
    public async PrintPatientMonitorChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientMonitorChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientMonitorCharts(apiReq);
        let PatientMonitorChart = data.Data[0];
        let PatientMonitorChartlist = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key:EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientMonitorChart.FacilityId);
            let info = {
            PatientMonitorChart: PatientMonitorChart,
            Encounter: Encounter,
            PatientMonitorChartlist: PatientMonitorChartlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('monitorchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientMonitorChartInstance, PatientMonitorChartAttributes> {
        return this.Models.PatientMonitorChart;
    }

}
