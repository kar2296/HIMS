import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FamilySocialHistoryInstance, FamilySocialHistoryAttributes } from '../Model/Interface/Index';
import { FamilySocialHistoryFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class FamilySocialHistoryBo extends BaseBo<FamilySocialHistoryInstance, FamilySocialHistoryAttributes> {
    public async AddFamilySocialHistory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your family social history detail is created,have look in DrHMS' + '.';
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

    public async UpdateFamilySocialHistory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFamilySocialHistoryById(req: BaseRequest): Promise<FamilySocialHistoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageFamilySocialHistorys(req: BaseRequest): Promise<boolean> {
        let details: FamilySocialHistoryAttributes[] = req.Data || [];
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

    public async GetFamilySocialHistorys(apiReq?: ApiRequest<FamilySocialHistoryFilters>):
        Promise<ApiResponse<FamilySocialHistoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('SocialType'));
        include.push(this.GetReference('SocialFrequency'));
        include.push(this.GetReference('Relationship'));
        include.push(this.GetReference('Severity'));
        include.push(this.GetReference('SocialHistoryStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FamilySocialHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.SocialTypeId:
                        where['SocialTypeId'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.SocialHistoryStatusId:
                        where['SocialHistoryStatusId'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case FamilySocialHistoryFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFamilySocialHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FamilySocialHistoryInstance, FamilySocialHistoryAttributes> {
        return this.Models.FamilySocialHistory;
    }
}
