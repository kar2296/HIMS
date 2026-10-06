import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientConditionInstance, PatientConditionAttributes } from '../Model/Interface/Index';
import { PatientConditionFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientConditionBo extends BaseBo<PatientConditionInstance, PatientConditionAttributes>  {
    public async AddPatientCondition(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your condition detail is created,have look in DrHMS' + '.';
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

    public async UpdatePatientCondition(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientConditionById(req: BaseRequest): Promise<PatientConditionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientConditions(req: BaseRequest): Promise<boolean> {
        let details: PatientConditionAttributes[] = req.Data || [];
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
    public async GetPatientConditions(apiReq?: ApiRequest<PatientConditionFilters>): Promise<ApiResponse<PatientConditionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ConditionType'));
        include.push(this.GetReference('ConditionStatus'));
        include.push(this.GetReference('Side'));
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'DoctorId', 'DoctorName'], required: false,
            include: [this.GetReference('EncounterType')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientConditionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientConditionFilters.Name:
                        where['DiagnosisName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientConditionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientConditionFilters.ConditionType:
                        where['ConditionTypeId'] = param.Value;
                        break;
                    case PatientConditionFilters.ConditionStatusId:
                        where['ConditionStatusId'] = param.Value;
                        break;
                    case PatientConditionFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientConditionFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientConditionFilters.IsPatientCondition:
                        where['IsPatientCondition'] = param.Value;
                        break;
                    case PatientConditionFilters.ConditionDate:
                        where['ConditionDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientConditionFilters.From:
                        where['ConditionDate'] = where['ConditionDate'] || {};
                        (where['ConditionDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientConditionFilters.To:
                        where['ConditionDate'] = where['ConditionDate'] || {};
                        (where['ConditionDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientCondition(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientConditionInstance, PatientConditionAttributes> {
        return this.Models.PatientCondition;
    }
}
