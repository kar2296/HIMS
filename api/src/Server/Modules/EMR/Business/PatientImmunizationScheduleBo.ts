import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientImmunizationScheduleInstance, PatientImmunizationScheduleAttributes } from '../Model/Interface/Index';
import { PatientImmunizationScheduleFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as clibo from '../../ClinicalMaster/Business/Index';
import * as moment from 'moment';

export class PatientImmunizationScheduleBo extends BaseBo<PatientImmunizationScheduleInstance, PatientImmunizationScheduleAttributes>  {
    public async AddPatientImmunizationSchedule(req: BaseRequest): Promise<number> {
        let ImmuScheduleBo = BoFactory.GetBo(clibo.ImmunizationScheduleBo, this.Request);
        let searchfilter = {
            Id : 0,
            Params:[ { Key: 2, Value : req.Data.ScheduleName } ],
            PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                } };
        let immuscheduleResp: any = await ImmuScheduleBo.GetImmunizationSchedules(searchfilter);
        let immuschedulelist: Array<any> = immuscheduleResp.Data;
        let promises: Array<any> = [];
        let periodMap : any = {
            1 : 'days', 2 : 'weeks', 3 : 'months', 4 : 'years'
        };
        immuschedulelist.forEach(item => {
            let periodStr = periodMap[item.PeriodId];
            let immunizationDate =  moment(req.Data.PatientDOB).add(item.Duration, periodStr);
            let schedule: any = {};
            schedule.ScheduleId = item.ScheduleId;
            schedule.ImmunizationId = item.ImmunizationId;
            schedule.ImmunizationName = item.ImmunizationName;
            schedule.ScheduleFlagId = item.ScheduleFlagId;
            schedule.RouteId = item.RouteId;
            schedule.DosageId = item.DosageId;
            schedule.Duration = item.Duration;
            schedule.PeriodId = item.PeriodId;
            schedule.ImmunizationDate = immunizationDate;
            schedule.AdministeredDate = null;
            schedule.ImmunizationScheduleId = item.Id;
            schedule.PatientId = req.Data.PatientId;
            schedule.EncounterId = req.Data.EncounterId;
            schedule.ImmunizationScheduleStatusId = 1; //NOT ADMINISTERED
            promises.push(this.Save(schedule));
        });

        await Promise.all(promises);
        return 1;
    }

    public async UpdatePatientImmunizationSchedule(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateSchedule(immu : any) : Promise<boolean> {
        let item: any = { 'ImmunizationScheduleStatusId': 2, 'AdministeredDate' : new Date() };  //2 - ADMINISTERED
        await this.Update(item, {
            fields: ['ImmunizationScheduleStatusId', 'AdministeredDate'],
            where: { 'Id': immu.PatientImmunizationScheduleId },
        });
        return true;
    }

    public async GetPatientImmunizationScheduleById(req: BaseRequest): Promise<PatientImmunizationScheduleAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientImmunizationSchedules(apiReq?: ApiRequest<PatientImmunizationScheduleFilters>):
     Promise<ApiResponse<PatientImmunizationScheduleAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientImmunizationScheduleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientImmunizationScheduleFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientImmunizationScheduleFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientImmunizationSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientImmunizationScheduleInstance, PatientImmunizationScheduleAttributes> {
        return this.Models.PatientImmunizationSchedule;
    }

}
