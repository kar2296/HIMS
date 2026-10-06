import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { EncounterInstance, EncounterAttributes } from '../../Visit/Model/Interface/Index';
import * as emrbo from '../../EMR/Business/Index';
import * as presbo from '../../EMR/Business/Index';
import * as orderbo from '../../EMR/Business/Index';
import * as surgbo from '../../OtManagement/Business/Index';
import * as admitbo from '../../IPManagement/Business/Index';

export class PatientEMRDashboardBo extends BaseBo<EncounterInstance, EncounterAttributes>  {

    public async GetPatientEMRDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let registry = this.getPatientEMRDashboardRegistry();
                let func = registry[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetEMRDashBoardInfo({ Data: filterAttributes } || { Data: {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'PatientEMRDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<EncounterInstance, EncounterAttributes> {
        return this.Models.Encounter;
    }

    private getPatientEMRDashboardRegistry(): { [key: string]: () => any } {
        return {
            consultbo: () => BoFactory.GetBo(emrbo.ConsultationBo, this.Request),
            prescribebo: () => BoFactory.GetBo(presbo.PrescriptionBo, this.Request),
            orderbo: () => BoFactory.GetBo(orderbo.PatientOrderBo, this.Request),
            surgeryrequestbo: () => BoFactory.GetBo(surgbo.OtRequestBo, this.Request),
            documentbo: () => BoFactory.GetBo(emrbo.ClinicalDocumentBo, this.Request),
            admitrequestbo: () => BoFactory.GetBo(admitbo.AdmissionRequestBo, this.Request),
            allergybo: () => BoFactory.GetBo(emrbo.PatientAllergyBo, this.Request),
            labresultbo: () => BoFactory.GetBo(orderbo.PatientOrderBo, this.Request),
            radiologyresultbo: () => BoFactory.GetBo(orderbo.PatientOrderBo, this.Request),
            endoscopyresultbo: () => BoFactory.GetBo(orderbo.PatientOrderBo, this.Request),
            lensprescribebo: () => BoFactory.GetBo(presbo.LensPrescriptionBo, this.Request),
        };
    }

}
