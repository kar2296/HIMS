import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientDietPlanLogInstance, PatientDietPlanLogAttributes } from '../Model/Interface/Index';
import { PatientDietPlanLogFilters } from '../Common/Filters.e';

export class PatientDietPlanLogBo extends BaseBo<PatientDietPlanLogInstance, PatientDietPlanLogAttributes> implements IOptionProvider {
    public async AddPatientDietPlanLog(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDietPlanLog(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDietPlanLogById(req: BaseRequest): Promise<PatientDietPlanLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async ManagePatientDietPlanLogs(PatientDietPlanId: number, details: PatientDietPlanLogFilters[]): Promise<boolean> {
    return true;
    }
    public async GetPatientDietPlanLogs(apiReq?: ApiRequest<PatientDietPlanLogFilters>):
        Promise<ApiResponse<PatientDietPlanLogAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDietPlanLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDietPlanLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientDietPlanLogFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientDietPlanLogs(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientDietPlanLogInstance, PatientDietPlanLogAttributes> {
        return this.Models.PatientDietPlanLog;
    }
}
