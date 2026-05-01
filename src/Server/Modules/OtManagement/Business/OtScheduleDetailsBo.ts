import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtScheduleDetailsInstance, OtScheduleDetailsAttributes } from '../Model/Interface/Index';
import { OtScheduleDetailsFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
// import * as regbo from '../../Registration/Business/Index';
// import { NotificationService } from '../../../Notification/OneSignalNotification';
// import * as moment from 'moment';

export class OtScheduleDetailsBo extends BaseBo<OtScheduleDetailsInstance, OtScheduleDetailsAttributes> {
    public async AddOtScheduleDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOtScheduleDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        // const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        // const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        // const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        // const patient: any = await patientBO.GetById(req.Data.PatientId);
        // let vPatientName = '';
        // if (patient.FirstName) vPatientName += patient.FirstName;
        // if (patient.LastName) vPatientName += ' ' + patient.LastName;
        // if (patient && (patient.NotificationToken)) {
        //     /* tslint:disable-next-line */
        //     const pushMessage: string = 'Dear ' +
        //vPatientName + ', ' + ' Your  surgery is scheduled on ' +
        //moment(req.Data.OTScheduledOn).format('YYYY-MM-DD') + '.';
        //     const notificationService: any = new NotificationService();
        //     const body = {
        //         type: 'appoinment_booking',
        //     };
        //     const pushTokens: string[] = [];
        //     if (patient.NotificationToken) {
        //         pushTokens.push(patient.NotificationToken);
        //     }
        //     await notificationService.sendNotification(pushMessage, pushTokens, body);
        //     console.log('*************************pushMessage**********************', pushMessage);
        //     console.log('*************************pushTokens**********************', pushTokens);
        // }

        // if (doctorData && (doctorData.NotificationToken)) {
        //     /* tslint:disable-next-line */
        //     const pushMessage: string = 'Dear ' + doctorData.FirstName
        //+ ', ' +
        // 'Surgery is scheduled on ' + moment(req.Data.OTScheduledOn).
        //format('YYYY-MM-DD') + ' for Patient ' + patient.FirstName + '.';
        //     const notificationService: any = new NotificationService();
        //     const body = {
        //         type: 'appoinment_booking',
        //     };
        //     const pushTokens: string[] = [];
        //     if (doctorData.NotificationToken) {
        //         pushTokens.push(doctorData.NotificationToken);
        //     }
        //     if (doctorData.WebNotificationToken) {
        //         pushTokens.push(doctorData.WebNotificationToken);
        //     }

        //     await notificationService.sendNotification(pushMessage, pushTokens, body);
        // }
        return result;
    }

    public async ManageOtScheduleDetails(OtScheduleId: number, details: any[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.OTScheduledId = OtScheduleId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Status === 2 && detail.Id === 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'otschedule':
    //             count = await this.Items.count({
    //                 where: {
    //                     'OTScheduleStatusId': { '$in': [1] },  //Scheduled
    //                     'DoctorId': this.GetSession().UserId,

    //                 }
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }

    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let otschedulecount = await this.Items.count({
            where: {
                'Status': 1,
                'OTScheduleStatusId': 2,
                'DoctorId': req.Data.DoctorId,
                'OTScheduledOn': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        return {
            'otschedulecount': otschedulecount,
        };
    }

    public async GetOtScheduleDetailsById(req: BaseRequest): Promise<OtScheduleDetailsAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ScheduledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ConfirmedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetOtScheduleDetails(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<ApiResponse<OtScheduleDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let isReqPatientSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        include.push(this.GetReference('OTScheduleStatus'));
        include.push(this.GetReference('Team'));
        include.push(this.GetReference('SurgeryType'));
        include.push(this.GetReference('AnaesthesiaType'));
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('OTRoom'));
        include.push(this.GetReference('OtSchedulrOrder'));
        include.push(this.GetReference('IOLLensType'));
        include.push(this.GetReference('IOLLensName'));
        include.push(this.GetReference('LensPower'));
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName', 'Description'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'UserName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier', 'EncounterTypeId'], required: false });
        include.push({
            model: this.Models.Facility, attributes: ['FacilityId'], required: false,
        });
        include.push({
            model: this.Models.SurgeryRoomMaster, attributes: ['Code', 'Name'], required: false,
        });
        include.push({ model: this.Models.Diagnosis, attributes: ['Code', 'DiagnosisName'], as: 'Diagnosis', required: false });
        include.push({
            model: this.Models.PatientGuarantor, attributes: ['GuarantorId',
                'GuarantorName'], as: 'PatientGuarantor', required: false
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ScheduledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ConfirmedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Anaesthesist', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtScheduleDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    // case OtScheduleDetailsFilters.SurgeryType:
                    //     where['SurgeryTypeId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.OTScheduleStatus:
                    //     where['OTScheduleStatusId'] = param.Value;
                    //     break;
                    case OtScheduleDetailsFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case OtScheduleDetailsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    // case OtScheduleDetailsFilters.PatientNameMRN:
                    //     patientWhere['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                    //     { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                    //     { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     isReqPatientSearch = true;
                    //     break;
                    case OtScheduleDetailsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    // case OtScheduleDetailsFilters.DoctorId:
                    //     where['DoctorId'] = param.Value;
                        // if (param.Value) {
                        //     let paramArr: Array<number> = [];
                        //     if (param.Value.toString().indexOf(',') > -1) {
                        //         paramArr = param.Value.toString().split(',');
                        //     } else {
                        //         paramArr = [param.Value];
                        //     }
                        //     where['DoctorId'] = { '$in': paramArr };
                        // }
                        // break;
                    // case OtScheduleDetailsFilters.SurgeryName:
                    //     where['SurgeryName'] = { '$like': '%' + (param.Value || '') + '%' };
                    //     break;
                    // case OtScheduleDetailsFilters.OTScheduledOn:
                    //     where['OTScheduledOn'] = { '$between': param.Value || '' };
                    //     break;
                    case OtScheduleDetailsFilters.From:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$gte'] = param.Value;
                        break;
                    case OtScheduleDetailsFilters.To:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$lte'] = param.Value;
                        break;
                    // case OtScheduleDetailsFilters.TeamId:
                    //     where['TeamId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.DiagnosisId:
                    //     where['DiagnosisId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.SurgeryId:
                    //     where['SurgeryId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.PriorityId:
                    //     where['PriorityId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.EncounterId:
                    //     where['EncounterId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.OTRoomId:
                    //     where['OTRoomId'] = param.Value;
                    //     break;
                    // case OtScheduleDetailsFilters.IsCathlab:
                    //     where['IsCathlab'] = param.Value;
                    //     break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteOtScheduleDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintOtScheduleDetails(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<any> {
        let data = await this.GetOtScheduleDetails(apiReq);
        let OtSchedule = data.Data;
        OtSchedule.forEach((detail: any) => {
            let StartTime: any = detail.StartTime;
            let a = StartTime.split(':');
            let StartTimeHours = a[0];
            let StartTimeMinutes = a[1];
            let StartTimeWithoutSeconds = StartTimeHours + ':' + StartTimeMinutes;
            detail.StartTime = StartTimeWithoutSeconds;
        });

        let OtFacility = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OtFacility.FacilityId);
        let info = {
            otschedule: OtSchedule,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'otschedule';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOtSchedulereport(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<any> {
        let data = await this.GetOtScheduleDetails(apiReq);
        let OtSchedule = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Doctor = apiReq.Data.Surgeon;
        OtSchedule.forEach((detail: any) => {
            let StartTime: any = detail.StartTime;
            let a = StartTime.split(':');
            let StartTimeHours = a[0];
            let StartTimeMinutes = a[1];
            let StartTimeWithoutSeconds = StartTimeHours + ':' + StartTimeMinutes;
            detail.StartTime = StartTimeWithoutSeconds;
        });

        let OtFacility = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OtFacility.FacilityId);
        let info = {
            otschedule: OtSchedule,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Doctor: Doctor
        };
        let pdfOption: any = null;
        let key = 'otschedulereport';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let OTScheduleCount = await this.Items.count({
            where: {
                'Status': 1,
                'OTScheduleStatusId': { '$in': [1, 2] }
            }
        });
        return {
            'OTScheduleCount': OTScheduleCount,
        };
    }

    public GetModel(): SStatic.Model<OtScheduleDetailsInstance, OtScheduleDetailsAttributes> {
        return this.Models.OtScheduleDetails;
    }
}
