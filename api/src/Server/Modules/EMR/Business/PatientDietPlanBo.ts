import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientDietPlanInstance, PatientDietPlanAttributes } from '../Model/Interface/Index';
import * as bo from '../../EMR/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientDietPlanFilters } from '../Common/Filters.e';

export class PatientDietPlanBo extends BaseBo<PatientDietPlanInstance, PatientDietPlanAttributes> implements IOptionProvider {
    public async AddPatientDietPlan(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        // let planBO = BoFactory.GetBo(bo.PatientDietPlanLogBo, this.Request);
        // let log: any = {
        //     Data: {
        //         PatientDietPlanId: req.Data.PatientDietPlanId,
        //         PatientDietPlanStatusId: req.Data.PatientDietPlanStatusId,
        //         DietType: req.Data.DietType,
        //     }
        // };
        // await planBO.AddPatientDietPlanLog(log);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDietPlan(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let planBO = BoFactory.GetBo(bo.PatientDietPlanLogBo, this.Request);
        let log: any = {
            Data: {
                PatientDietPlanId: req.Data.Id,
                PatientDietPlanStatusId: req.Data.PatientDietPlanStatusId,
                DietType: req.Data.DietType,
                PatientId: req.Data.PatientId,
            }
        };
        await planBO.AddPatientDietPlanLog(log);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDietPlanById(req: BaseRequest): Promise<PatientDietPlanAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDietPlans(apiReq?: ApiRequest<PatientDietPlanFilters>): Promise<ApiResponse<PatientDietPlanAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DietType'));
        include.push(this.GetReference('DietPreferrence'));
        include.push(this.GetReference('FoodPreference'));
        include.push(this.GetReference('TherapeuticDiet'));
        // include.push({
        //     model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({ model: this.Models.PatientDietPlanLog, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDietPlanFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDietPlanFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDietPlanFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDietPlanFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDietPlan(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientDietPlanFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientDietPlans(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientDietPlanInstance, PatientDietPlanAttributes> {
        return this.Models.PatientDietPlan;
    }
}
