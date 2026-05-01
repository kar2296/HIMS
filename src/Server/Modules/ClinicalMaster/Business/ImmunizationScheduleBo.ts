import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ImmunizationScheduleInstance, ImmunizationScheduleAttributes } from '../Model/Interface/Index';
import { ImmunizationScheduleFilters } from '../Common/Filters.e';

export class ImmunizationScheduleBo extends BaseBo<ImmunizationScheduleInstance, ImmunizationScheduleAttributes> {
    public async AddImmunizationSchedule(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateImmunizationSchedule(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetImmunizationScheduleById(req: BaseRequest): Promise<ImmunizationScheduleAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetImmunizationSchedules(apiReq?: ApiRequest<ImmunizationScheduleFilters>)
        : Promise<ApiResponse<ImmunizationScheduleAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Immunization, required: false });
        include.push(this.GetReference('Route'));
        include.push(this.GetReference('ScheduleFlag'));
        include.push(this.GetReference('Period'));
        include.push(this.GetReference('ScheduleName'));
        include.push(this.GetReference('Dosage'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ImmunizationScheduleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ImmunizationScheduleFilters.Name:
                        where['ImmunizationName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ImmunizationScheduleFilters.ScheduleId:
                        where['ScheduleId'] = param.Value;
                        break;
                    case ImmunizationScheduleFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteImmunizationSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ImmunizationScheduleInstance, ImmunizationScheduleAttributes> {
        return this.Models.ImmunizationSchedule;
    }
}
