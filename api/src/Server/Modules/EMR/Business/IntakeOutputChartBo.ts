import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IntakeOutputChartInstance, IntakeOutputChartAttributes } from '../Model/Interface/Index';
import { IntakeOutputChartFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';

export class IntakeOutputChartBo extends BaseBo<IntakeOutputChartInstance, IntakeOutputChartAttributes>  {
    public async AddIntakeOutputChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIntakeOutputChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIntakeOutputChartById(req: BaseRequest): Promise<IntakeOutputChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetIntakeOutputCharts(apiReq?: ApiRequest<IntakeOutputChartFilters>):
        Promise<ApiResponse<IntakeOutputChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, as: 'CapturedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
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
                    case IntakeOutputChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.IntakeOutputChartDate:
                        where['IntakeOutputChartDate'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.From:
                        where['IntakeOutputChartDate'] = where['IntakeOutputChartDate'] || {};
                        (where['IntakeOutputChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.To:
                        where['IntakeOutputChartDate'] = where['IntakeOutputChartDate'] || {};
                        (where['IntakeOutputChartDate'] as any)['$lte'] = param.Value;
                        break;
                    case IntakeOutputChartFilters.FromAdm:
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
        order.push(['IntakeOutputChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteIntakeOutputChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintIntakeOutputChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: IntakeOutputChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetIntakeOutputCharts(apiReq);
        let IntakeOutputChart = data.Data[0];
        let IntakeOutputChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(IntakeOutputChart.FacilityId);
        let info = {
            IntakeOutputChart: IntakeOutputChart,
            Encounter: Encounter,
            IntakeOutputChartlist: IntakeOutputChartlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('intakeoutputchart', { header: {}, body: info });
    }
    public async PrintIntakeOutputChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: IntakeOutputChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetIntakeOutputCharts(apiReq);
        let IntakeOutputChart = data.Data[0];
        let IntakeOutputChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(IntakeOutputChart.FacilityId);
        let info = {
            IntakeOutputChart: IntakeOutputChart,
            Encounter: Encounter,
            IntakeOutputChartlist: IntakeOutputChartlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('intakeoutputchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<IntakeOutputChartInstance, IntakeOutputChartAttributes> {
        return this.Models.IntakeOutputChart;
    }

}
