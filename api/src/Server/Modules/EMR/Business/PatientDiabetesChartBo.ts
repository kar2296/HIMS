import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientDiabetesChartInstance, PatientDiabetesChartAttributes } from '../Model/Interface/Index';
import { PatientDiabetesChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientDiabetesChartBo extends BaseBo<PatientDiabetesChartInstance, PatientDiabetesChartAttributes>  {
    public async AddPatientDiabetesChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDiabetesChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDiabetesChartById(req: BaseRequest): Promise<PatientDiabetesChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDiabetesCharts(apiReq?: ApiRequest<PatientDiabetesChartFilters>):
        Promise<ApiResponse<PatientDiabetesChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        include.push(this.GetReference('TimePeriod'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
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
                    case PatientDiabetesChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.DiabetesChartDate:
                        where['DiabetesChartDate'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.From:
                        where['DiabetesChartDate'] = where['DiabetesChartDate'] || {};
                        (where['DiabetesChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDiabetesChartFilters.To:
                        where['DiabetesChartDate'] = where['DiabetesChartDate'] || {};
                        (where['DiabetesChartDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientDiabetesChartFilters.FromAdm:
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
        order.push(['DiabetesChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientDiabetesChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientDiabetesChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDiabetesChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientDiabetesCharts(apiReq);
        let PatientDiabetesChart = data.Data[0];
        let PatientDiabetesChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDiabetesChart.FacilityId);
        let info = {
            PatientDiabetesChart: PatientDiabetesChart,
            PatientDiabetesChartlist: PatientDiabetesChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('diabetchart', { header: {}, body: info });
    }
    public async PrintPatientDiabetesChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDiabetesChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientDiabetesCharts(apiReq);
        let PatientDiabetesChart = data.Data[0];
        let PatientDiabetesChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDiabetesChart.FacilityId);
        let info = {
            PatientDiabetesChart: PatientDiabetesChart,
            PatientDiabetesChartlist: PatientDiabetesChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('diabetchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientDiabetesChartInstance, PatientDiabetesChartAttributes> {
        return this.Models.PatientDiabetesChart;
    }

}
