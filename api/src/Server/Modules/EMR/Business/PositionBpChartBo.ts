import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PositionBpChartInstance, PositionBpChartAttributes } from '../Model/Interface/Index';
import { PositionBpChartFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PositionBpChartBo extends BaseBo<PositionBpChartInstance, PositionBpChartAttributes>  {
    public async AddPositionBpChart(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePositionBpChart(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPositionBpChartById(req: BaseRequest): Promise<PositionBpChartAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPositionBpCharts(apiReq?: ApiRequest<PositionBpChartFilters>):
        Promise<ApiResponse<PositionBpChartAttributes[]>> {
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
                    case PositionBpChartFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PositionBpChartFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PositionBpChartFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PositionBpChartFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PositionBpChartFilters.PositionBPChartDate:
                        where['PositionBPChartDate'] = param.Value;
                        break;
                    case PositionBpChartFilters.From:
                        where['PositionBPChartDate'] = where['PositionBPChartDate'] || {};
                        (where['PositionBPChartDate'] as any)['$gte'] = param.Value;
                        break;
                    case PositionBpChartFilters.To:
                        where['PositionBPChartDate'] = where['PositionBPChartDate'] || {};
                        (where['PositionBPChartDate'] as any)['$lte'] = param.Value + ' 23:59:59';
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
        order.push(['PositionBPChartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePositionBpChart(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPositionBpChart(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PositionBpChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPositionBpCharts(apiReq);
        let PositionBpChart = data.Data[0];
        let PositionBpChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PositionBpChart.FacilityId);
        let info = {
            PositionBpChart: PositionBpChart,
            PositionBpChartlist: PositionBpChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('positionbpchart', { header: {}, body: info });
    }
    public async PrintPositionBpChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PositionBpChartFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPositionBpCharts(apiReq);
        let PositionBpChart = data.Data[0];
        let PositionBpChartlist = data.Data;
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
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PositionBpChart.FacilityId);
        let info = {
            PositionBpChart: PositionBpChart,
            PositionBpChartlist: PositionBpChartlist,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        return await Report.Generate('positionbpchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PositionBpChartInstance, PositionBpChartAttributes> {
        return this.Models.PositionBpChart;
    }

}
