import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientProcedureInstance, PatientProcedureAttributes } from '../Model/Interface/Index';
import { PatientProcedureFilters } from '../Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientProcedureBo extends BaseBo<PatientProcedureInstance, PatientProcedureAttributes>  {
    public async AddPatientProcedure(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your procedure detail is created,have look in DrHMS' + '.';
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

    public async UpdatePatientProcedure(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientProcedureById(req: BaseRequest): Promise<PatientProcedureAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientProcedures(req: BaseRequest): Promise<boolean> {
        let details: PatientProcedureAttributes[] = req.Data || [];
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

    public async GetPatientProcedures(apiReq?: ApiRequest<PatientProcedureFilters>): Promise<ApiResponse<PatientProcedureAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        include.push(this.GetReference('ProcedureType'));
        include.push(this.GetReference('PatientProcedureStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientProcedureFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientProcedureFilters.Name:
                        where['ProcedureName'] = param.Value;
                        break;
                    case PatientProcedureFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientProcedureFilters.Procedure:
                        where['ProcedureId'] = param.Value;
                        break;
                    case PatientProcedureFilters.ProcedureType:
                        where['ProcedureTypeId'] = param.Value;
                        break;
                    case PatientProcedureFilters.PatientProcedureStatus:
                        where['PatientProcedureStatusId'] = param.Value;
                        break;
                    case PatientProcedureFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientProcedureFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientProcedureInstance, PatientProcedureAttributes> {
        return this.Models.PatientProcedure;
    }
}
