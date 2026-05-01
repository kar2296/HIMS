import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientDialysisChartInstance, PatientDialysisChartAttributes } from '../Model/Interface/Index';
import { PatientDialysisChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientDialysisChartBo extends BaseBo<PatientDialysisChartInstance, PatientDialysisChartAttributes>  {
    public async AddPatientDialysisChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDialysisChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDialysisChartById(req: BaseRequest): Promise<PatientDialysisChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDialysisCharts(apiReq?: ApiRequest<PatientDialysisChartFilters>):
        Promise<ApiResponse<PatientDialysisChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, as: 'CapturedByUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        // include.push(this.GetReference('VentilatorMode'));
        // include.push(this.GetReference('DiscountMode'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDialysisChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.DialysisChartDate:
                        where['DialysisChartDate'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.From:
                        where['DialysisChartDate'] = where['DialysisChartDate'] || {};
                        (where['DialysisChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.To:
                        where['DialysisChartDate'] = where['DialysisChartDate'] || {};
                        (where['DialysisChartDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDialysisChartFilters.FromAdm:
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
        order.push(['DialysisChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientDialysisChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
	 public async PrintPatientDialysisChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDialysisChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientDialysisCharts(apiReq);
        let PatientDialysisChart = data.Data[0];
        let PatientDialysisChatlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDialysisChart.FacilityId);
        let info = {
            PatientDialysisChart: PatientDialysisChart,
            Encounter: Encounter,
            PatientDialysisChatlist:PatientDialysisChatlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('dialysischart', { header: {}, body: info });
    }
    public async PrintPatientDialysisChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDialysisChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientDialysisCharts(apiReq);
        let PatientDialysisChart = data.Data[0];
        let PatientDialysisChatlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDialysisChart.FacilityId);
        let info = {
            PatientDialysisChart: PatientDialysisChart,
            Encounter: Encounter,
            PatientDialysisChatlist:PatientDialysisChatlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('dialysischartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientDialysisChartInstance, PatientDialysisChartAttributes> {
        return this.Models.PatientDialysisChart;
    }

}
