import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { EncounterDoctorInstance, EncounterDoctorAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as apptbo from '../../Appointment/Business/Index';
// import * as physiotheraphybo from '../../Physiotheraphy/Business/Index';
import * as surgbo from '../../OtManagement/Business/Index';
import * as presbo from '../../EMR/Business/Index';
import * as adminbo from '../../IPManagement/Business/Index';
import * as worordbo from '../../LIS/Business/Index';
import * as otmgmnt from '../../OtManagement/Business/Index';
// Fix: Remove this.Request from the registry functions since it's undefined in this context
const DoctorDashboardRegistry: { [key: string]: (request?: any) => any } = {
    mycheckedin: (request?: any) => BoFactory.GetBo(encbo.EncounterDoctorBo, request),
    myinpatient: (request?: any) => BoFactory.GetBo(encbo.EncounterBo, request),
    appointment: (request?: any) => BoFactory.GetBo(apptbo.AppointmentBo, request),
    resultreview: (request?: any) => BoFactory.GetBo(worordbo.PatientWorkorderBo, request),
    radiologyresult: (request?: any) => BoFactory.GetBo(worordbo.PatientWorkorderBo, request),
    abnormalresults: (request?: any) => BoFactory.GetBo(worordbo.PatientWorkorderBo, request),
    endoscopyresults: (request?: any) => BoFactory.GetBo(worordbo.PatientWorkorderBo, request),
    surgeryrequest: (request?: any) => BoFactory.GetBo(surgbo.OtRequestBo, request),
    prescription: (request?: any) => BoFactory.GetBo(presbo.PrescriptionBo, request),
    pendingdischarge: (request?: any) => BoFactory.GetBo(encbo.EncounterBo, request),
    otschedule: (request?: any) => BoFactory.GetBo(otmgmnt.OtScheduleBo, request),
    reviewnotes: (request?: any) => BoFactory.GetBo(otmgmnt.SurgeryEntryBo, request),
    admissionrequest: (request?: any) => BoFactory.GetBo(adminbo.AdmissionRequestBo, request),
    // physiotheraphy: (request?: any) => BoFactory.GetBo(physiotheraphybo.PhysiotheraphyBo, request)
};
export class DoctorDashboardBo extends BaseBo<EncounterDoctorInstance, EncounterDoctorAttributes>  {
    // PUBLIC METHODS MUST COME FIRST
    public async GetDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};
        let filterAttributes = req?.Attributes;
        let requestKeys: any = req?.Data?.Keys;
        if (!requestKeys) {
            throw new Error('Request keys are required');
        }
        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                if (!item?.Key) {
                    throw new Error('Item key is required');
                }
                let func = DoctorDashboardRegistry[item.Key];
                if (func) {
                    // Pass the request to the function, but the BO will set its own Request property
                    let bo = func(this.Request);
                    bo.Request = filterAttributes || this.Request;
                    infoResponses[item.Key] = await bo.GetDashBoardInfo({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'DoctorDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }
    public async GetDashboardOptionsAlternative(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};
        let filterAttributes = req?.Attributes;
        let requestKeys: any = req?.Data?.Keys;
        if (!requestKeys) {
            throw new Error('Request keys are required');
        }
        const registry = this.getDashboardRegistry();
        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                if (!item?.Key) {
                    throw new Error('Item key is required');
                }
                let func = registry[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes || this.Request;
                    infoResponses[item.Key] = await bo.GetDashBoardInfo({ Data: filterAttributes || {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'DoctorDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }
    public GetModel(): SStatic.Model<EncounterDoctorInstance, EncounterDoctorAttributes> {
        return this.Models.EncounterDoctor;
    }
    // PRIVATE METHODS COME AFTER PUBLIC METHODS
    private getDashboardRegistry(): { [key: string]: () => any } {
        return {
            mycheckedin: () => BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request),
            myinpatient: () => BoFactory.GetBo(encbo.EncounterBo, this.Request),
            appointment: () => BoFactory.GetBo(apptbo.AppointmentBo, this.Request),
            resultreview: () => BoFactory.GetBo(worordbo.PatientWorkorderBo, this.Request),
            radiologyresult: () => BoFactory.GetBo(worordbo.PatientWorkorderBo, this.Request),
            abnormalresults: () => BoFactory.GetBo(worordbo.PatientWorkorderBo, this.Request),
            endoscopyresults: () => BoFactory.GetBo(worordbo.PatientWorkorderBo, this.Request),
            surgeryrequest: () => BoFactory.GetBo(surgbo.OtRequestBo, this.Request),
            prescription: () => BoFactory.GetBo(presbo.PrescriptionBo, this.Request),
            pendingdischarge: () => BoFactory.GetBo(encbo.EncounterBo, this.Request),
            otschedule: () => BoFactory.GetBo(otmgmnt.OtScheduleBo, this.Request),
            reviewnotes: () => BoFactory.GetBo(otmgmnt.SurgeryEntryBo, this.Request),
            admissionrequest: () => BoFactory.GetBo(adminbo.AdmissionRequestBo, this.Request),
        };
    }
}

