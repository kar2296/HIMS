import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientSocialHistoryInstance, PatientSocialHistoryAttributes } from '../Model/Interface/Index';
import { PatientSocialHistoryFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientSocialHistoryBo extends
    BaseBo<PatientSocialHistoryInstance, PatientSocialHistoryAttributes>  {
    public async AddPatientSocialHistory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  social history detail is created,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        return result.dataValues.Id;
    }

    public async UpdatePatientSocialHistory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientSocialHistoryById(req: BaseRequest): Promise<PatientSocialHistoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientSocialHistorys(req: BaseRequest): Promise<boolean> {
        let details: PatientSocialHistoryAttributes[] = req.Data || [];
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

    public async GetPatientSocialHistorys(apiReq?: ApiRequest<PatientSocialHistoryFilters>):
        Promise<ApiResponse<PatientSocialHistoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('SocialType'));
        include.push(this.GetReference('SocialFrequency'));
        include.push(this.GetReference('Severity'));
        include.push(this.GetReference('SocialHistoryStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientSocialHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.SocialTypeId:
                        where['SocialTypeId'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.SocialHistoryStatusId:
                        where['SocialHistoryStatusId'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientSocialHistoryFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientSocialHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientSocialHistoryInstance, PatientSocialHistoryAttributes> {
        return this.Models.PatientSocialHistory;
    }
}
