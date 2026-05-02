import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientInstance, PatientAttributes } from '../Model/Interface/Index';
import * as encbo from '../../Visit/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as billbo from '../../Billing/Business/Index';
import * as inpbo from '../../IPManagement/Business/Index';
import * as appmntbo from '../../Appointment/Business/Index';

export class OPDDashboardBo extends BaseBo<PatientInstance, PatientAttributes>  {

    public async GetOPDDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getOPDDashboardRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetOPDDashBoardInfo({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'OPDDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<PatientInstance, PatientAttributes> {
        return this.Models.Patient;
    }

    private getOPDDashboardRegistry(): { [key: string]: () => any } {
        return {
            apnmntbo: () => BoFactory.GetBo(encbo.EncounterBo, this.Request),
            patientbo: () => BoFactory.GetBo(regbo.PatientBo, this.Request),
            opbillbo: () => BoFactory.GetBo(billbo.PatientBillsBo, this.Request),
            dgbillbo: () => BoFactory.GetBo(billbo.PatientBillsBo, this.Request),
            creditnotebo: () => BoFactory.GetBo(billbo.PatientCreditNoteBo, this.Request),
            doctordisplaybo: () => BoFactory.GetBo(appmntbo.DoctorDisplayBo, this.Request),
            qmstokenbo: () => BoFactory.GetBo(appmntbo.AppointmentDisplayBo, this.Request),
            generalboardbo: () => BoFactory.GetBo(appmntbo.GeneralDisplayBo, this.Request),
            mrdrequestbo: () => BoFactory.GetBo(inpbo.FileRequestBo, this.Request),
        };
    }
}
