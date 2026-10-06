import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAllergyInstance, PatientAllergyAttributes } from '../Model/Interface/Index';
import { PatientAllergyFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
// import * as userbo from '../../SystemSettings/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientAllergyBo extends BaseBo<PatientAllergyInstance, PatientAllergyAttributes> {
    public async AddPatientAllergy(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        // const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        // const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your allergy detail is created,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*******************************',pushMessage);
            console.log('*******************************',pushTokens);
        }
        return result.dataValues.Id;
    }

    public async UpdatePatientAllergy(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientAllergyById(req: BaseRequest): Promise<PatientAllergyAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientAllergys(req: BaseRequest): Promise<boolean> {
        let details: PatientAllergyAttributes[] = req.Data || [];
        let promises: Array<any> = [];
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

    public async GetPatientAllergys(apiReq?: ApiRequest<PatientAllergyFilters>): Promise<ApiResponse<PatientAllergyAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AllergyType'));
        include.push(this.GetReference('AllergySeverity'));
        include.push(this.GetReference('PatientAllergyStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAllergyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAllergyFilters.Name:
                        where['AllergyName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientAllergyFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAllergyFilters.AllergyType:
                        where['AllergyTypeId'] = param.Value;
                        break;
                    case PatientAllergyFilters.PatientAllergyStatusId:
                        where['PatientAllergyStatusId'] = param.Value;
                        break;
                    case PatientAllergyFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientAllergyFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientAllergy(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAllergyInstance, PatientAllergyAttributes> {
        return this.Models.PatientAllergy;
    }
    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let AllergyCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'AllergyCount': AllergyCount
        };
    }
}
