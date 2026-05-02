import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientSurgicalInstance, PatientSurgicalAttributes } from '../Model/Interface/Index';
import { PatientSurgicalFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientSurgicalBo extends BaseBo<PatientSurgicalInstance, PatientSurgicalAttributes>  {
    public async AddPatientSurgical(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  sugical detail is created,have look in DrHMS' + '.';
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

    public async UpdatePatientSurgical(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientSurgicalById(req: BaseRequest): Promise<PatientSurgicalAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientSurgicals(req : BaseRequest): Promise<boolean> {
        let details : PatientSurgicalAttributes[]  = req.Data || [];
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

    public async GetPatientSurgicals(apiReq?: ApiRequest<PatientSurgicalFilters>): Promise<ApiResponse<PatientSurgicalAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        include.push(this.GetReference('ProcedureType'));
        include.push(this.GetReference('PatientSurgicalStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientSurgicalFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientSurgicalFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientSurgicalFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientSurgicalFilters.Procedure:
                        where['ProcedureId'] = param.Value;
                        break;
                    case PatientSurgicalFilters.ProcedureType:
                        where['ProcedureTypeId'] = param.Value;
                        break;
                    case PatientSurgicalFilters.PatientSurgicalStatusId:
                        where['PatientSurgicalStatusId'] = param.Value;
                        break;
                    case PatientSurgicalFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientSurgicalFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientSurgical(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientSurgicalInstance, PatientSurgicalAttributes> {
        return this.Models.PatientSurgical;
    }

}
