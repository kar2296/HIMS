import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientMedicationInstance, PatientMedicationAttributes } from '../Model/Interface/Index';
import { PatientMedicationFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientMedicationBo extends BaseBo<PatientMedicationInstance, PatientMedicationAttributes>  {
    public async AddPatientMedication(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientMedication(req: BaseRequest): Promise<boolean> {
        return await this.ManageMedicationDetails(req.Data.Details);
    }

    public async ManageMedicationDetails(details: PatientMedicationAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(details[0].PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  medication detail is created,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*******************************', pushMessage);
            console.log('*******************************', pushTokens);
        }
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPatientMedicationById(req: BaseRequest): Promise<PatientMedicationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientMedications(apiReq?: ApiRequest<PatientMedicationFilters>): Promise<ApiResponse<PatientMedicationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['GenericName'], required: false });
        include.push(this.GetReference('PatientMedicationStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientMedicationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientMedicationFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientMedicationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientMedicationFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case PatientMedicationFilters.PatientMedicationStatusId:
                        where['PatientMedicationStatusId'] = param.Value;
                        break;
                    case PatientMedicationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientMedicationFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientMedication(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientMedicationInstance, PatientMedicationAttributes> {
        return this.Models.PatientMedication;
    }
}
