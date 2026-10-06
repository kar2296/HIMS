import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { CdChartInstance, CdChartAttributes } from '../Model/Interface/Index';
import { CdChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class CdChartBo extends BaseBo<CdChartInstance, CdChartAttributes>  {
    public async AddCdChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCdChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCdChartById(req: BaseRequest): Promise<CdChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCdCharts(apiReq?: ApiRequest<CdChartFilters>):
        Promise<ApiResponse<CdChartAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
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
                    case CdChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CdChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case CdChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case CdChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case CdChartFilters.CdChartDate:
                        where['CdChartDate'] = param.Value;
                        break;
                    case CdChartFilters.From:
                        where['CdChartDate'] = where['CdChartDate'] || {};
                        (where['CdChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case CdChartFilters.To:
                        where['CdChartDate'] = where['CdChartDate'] || {};
                        (where['CdChartDate'] as any)['$lte'] = param.Value + ' 23:59:59';
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
        order.push(['CdChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteCdChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintCdChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: CdChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetCdCharts(apiReq);
        let CdChart = data.Data[0];
        let CdChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CdChart.FacilityId);
        let info = {
            CdChart: CdChart,
            CdChartlist: CdChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('cdchart', { header: {}, body: info });
    }
    public async PrintCdChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: CdChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetCdCharts(apiReq);
        let CdChart = data.Data[0];
        let CdChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CdChart.FacilityId);
        let info = {
            CdChart: CdChart,
            CdChartlist: CdChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('cdchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<CdChartInstance, CdChartAttributes> {
        return this.Models.CdChart;
    }

}
