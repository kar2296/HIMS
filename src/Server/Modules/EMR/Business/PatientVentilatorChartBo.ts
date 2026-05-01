import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientVentilatorChartInstance, PatientVentilatorChartAttributes } from '../Model/Interface/Index';
import { PatientVentilatorChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientVentilatorChartBo extends BaseBo<PatientVentilatorChartInstance, PatientVentilatorChartAttributes>  {
    public async AddPatientVentilatorChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientVentilatorChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientVentilatorChartById(req: BaseRequest): Promise<PatientVentilatorChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientVentilatorCharts(apiReq?: ApiRequest<PatientVentilatorChartFilters>):
        Promise<ApiResponse<PatientVentilatorChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        include.push(this.GetReference('VentilatorMode'));
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
                    case PatientVentilatorChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.VentilatorDate:
                        where['VentilatorDate'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.From:
                        where['VentilatorDate'] = where['VentilatorDate'] || {};
                        (where['VentilatorDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.To:
                        where['VentilatorDate'] = where['VentilatorDate'] || {};
                        (where['VentilatorDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientVentilatorChartFilters.FromAdm:
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
        order.push(['VentilatorDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientVentilatorChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientVentilatorChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVentilatorChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientVentilatorCharts(apiReq);
        let PatientVentilatorChart = data.Data[0];
        let PatientVentilatorChatlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientVentilatorChart.FacilityId);
        let info = {
            PatientVentilatorChart: PatientVentilatorChart,
            Encounter: Encounter,
            PatientVentilatorChatlist: PatientVentilatorChatlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('ventilatorchart', { header: {}, body: info });
    }
    public async PrintPatientVentilatorChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVentilatorChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientVentilatorCharts(apiReq);
        let PatientVentilatorChart = data.Data[0];
        let PatientVentilatorChatlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientVentilatorChart.FacilityId);
        let info = {
            PatientVentilatorChart: PatientVentilatorChart,
            Encounter: Encounter,
            PatientVentilatorChatlist: PatientVentilatorChatlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('ventilatorchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientVentilatorChartInstance, PatientVentilatorChartAttributes> {
        return this.Models.PatientVentilatorChart;
    }
}
