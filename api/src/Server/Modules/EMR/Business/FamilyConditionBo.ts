import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FamilyConditionInstance, FamilyConditionAttributes } from '../Model/Interface/Index';
import { FamilyConditionFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class FamilyConditionBo extends BaseBo<FamilyConditionInstance, FamilyConditionAttributes> {
    public async AddFamilyCondition(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your family condition detail is created,have look in DrHMS' + '.';
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

    public async UpdateFamilyCondition(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFamilyConditionById(req: BaseRequest): Promise<FamilyConditionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageFamilyConditions(req : BaseRequest): Promise<boolean> {
        let details : FamilyConditionAttributes[]  = req.Data || [];
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

    public async GetFamilyConditions(apiReq?: ApiRequest<FamilyConditionFilters>): Promise<ApiResponse<FamilyConditionAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ConditionType'));
        include.push(this.GetReference('ConditionStatus'));
        include.push(this.GetReference('Relationship'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FamilyConditionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FamilyConditionFilters.Name:
                        where['DiagnosisName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FamilyConditionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FamilyConditionFilters.ConditionType:
                        where['ConditionTypeId'] = param.Value;
                        break;
                    case FamilyConditionFilters.Relationship:
                        where['RelationshipId'] = param.Value;
                        break;
                    case FamilyConditionFilters.ConditionStatusId:
                        where['ConditionStatusId'] = param.Value;
                        break;
                    case FamilyConditionFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case FamilyConditionFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFamilyCondition(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FamilyConditionInstance, FamilyConditionAttributes> {
        return this.Models.FamilyCondition;
    }
}
