import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientFeedbackInstance, PatientFeedbackAttributes } from '../Model/Interface/Index';
import * as managePatientFeedbackbo from '../../EMR/Business/Index';

const PatientFeedbackDashboardRegistry: { [key: string]: (request: any) => any } = {
    PatientFeedbackbo: (request: any) => BoFactory.GetBo(managePatientFeedbackbo.PatientFeedbackBo, request),
};


export class PatientFeedbackDashboardBo extends BaseBo<PatientFeedbackInstance, PatientFeedbackAttributes>  {

    public async GetPatientFeedbackDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = PatientFeedbackDashboardRegistry[item.Key];
                if (func) {
                    let bo = func(this.Request);
                    infoResponses[item.Key] = await bo.GetPatientFeedbackInfoDashBoard({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'PatientFeedbackDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<PatientFeedbackInstance, PatientFeedbackAttributes> {
        return this.Models.PatientFeedback;
    }

}
