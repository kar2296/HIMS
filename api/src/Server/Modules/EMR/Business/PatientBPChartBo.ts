import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientBPChartInstance, PatientBPChartAttributes } from '../Model/Interface/Index';
import { PatientBPChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientBPChartBo extends BaseBo<PatientBPChartInstance, PatientBPChartAttributes>  {
    public async AddPatientBPChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientBPChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientBPChartById(req: BaseRequest): Promise<PatientBPChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientBPCharts(apiReq?: ApiRequest<PatientBPChartFilters>):
        Promise<ApiResponse<PatientBPChartAttributes[]>> {
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
                    case PatientBPChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBPChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBPChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBPChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBPChartFilters.BPChartDate:
                        where['BPChartDate'] = param.Value;
                        break;
                    case PatientBPChartFilters.From:
                        where['BPChartDate'] = where['BPChartDate'] || {};
                        (where['BPChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBPChartFilters.To:
                        where['BPChartDate'] = where['BPChartDate'] || {};
                        (where['BPChartDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBPChartFilters.FromAdm:
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
        order.push(['BPChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientBPChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientBPChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBPChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientBPCharts(apiReq);
        let PatientBPChart = data.Data[0];
        let PatientBPChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBPChart.FacilityId);
        let info = {
            PatientBPChart: PatientBPChart,
            PatientBPChartlist: PatientBPChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('bpcharts', { header: {}, body: info });
    }
    public async PrintPatientBPChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBPChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientBPCharts(apiReq);
        let PatientBPChart = data.Data[0];
        let PatientBPChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBPChart.FacilityId);
        let info = {
            PatientBPChart: PatientBPChart,
            PatientBPChartlist: PatientBPChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('bpchartswithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientBPChartInstance, PatientBPChartAttributes> {
        return this.Models.PatientBPChart;
    }

}
