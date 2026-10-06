import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtScheduleInstance, OtScheduleAttributes } from '../Model/Interface/Index';
import { OtScheduleFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as bo from '../../OtManagement/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as schedulebo from '../../OtManagement/Business/Index';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import * as moment from 'moment';
import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';

export class OtScheduleBo extends BaseBo<OtScheduleInstance, OtScheduleAttributes> {
    public async AddOtSchedule(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        if (result) {
            let OtScheduleId = result.dataValues.Id;
            let detailBO = BoFactory.GetBo(schedulebo.OtScheduleDetailsBo, this.Request);
            await detailBO.ManageOtScheduleDetails(OtScheduleId, req.Data.Procedures);
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', ' + ' Your  surgery is scheduled on' + moment(req.Data.OTScheduledOn).format('YYYY-MM-DD') + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        let dateformat = 'DD/MM/YYYY';
        let surgeryDate = moment(req.Data.OTScheduledOn).format(dateformat);
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const anesthesiasist: any = await userBO.GetUserById({ Id: req.Data.AnaesthesistId });
        const surgeryRoomBO = BoFactory.GetBo(schedulebo.SurgeryRoomMasterBo, this.Request);
        const surgeryRoomData: any = await surgeryRoomBO.GetSurgeryRoomMasterById({ Id: req.Data.OTRoomId });
        if (anesthesiasist) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo =
                await eventTemplateBO.GetTemplateInfo('Anesthesiasist', 'Anesthesiasist', 1);
            if (smsTemplateInfo) {
                let vDocName = '';
                vDocName = await this.getUserName(anesthesiasist);
                let smsmodel = {
                    numbers: [anesthesiasist.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        {
                            patientName: req.Data.PatientName,
                            scheduledatetime: surgeryDate + ' ' + req.Data.StartTime,
                            surgeryLocation: surgeryRoomData.Name,
                            surgeryDoctor: req.Data.DoctorName,
                            anaesthesiName: vDocName,
                            space: ',',
                        }),
                    templateId: smsTemplateInfo.ModuleId
                };
                let smsProvider = this.GetSmsProvider();
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + anesthesiasist.Mobile);
                }
            }
        }
        await this.sendOtscheduleSms(req);
        return result.dataValues.Id;
    }

    public async sendOtscheduleSms(req: any): Promise<boolean> {
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        let apiReqTitle = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patient.TitleId }
            ]
        };
        let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
        let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
        let title = TitleData.Data[0].Description;
        let dateformat = 'DD/MM/YYYY';
        let surgeryDate = moment(req.Data.OTScheduledOn).format(dateformat);
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const userData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        const surgeryRoomBO = BoFactory.GetBo(schedulebo.SurgeryRoomMasterBo, this.Request);
        const surgeryRoomData: any = await surgeryRoomBO.GetSurgeryRoomMasterById({ Id: req.Data.OTRoomId });
        let apidoctitle = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: userData.TitleId }
            ]
        };
        let docTitleData = await refTitleBo.GetReferenceValues(apidoctitle);
        let doctitle = docTitleData.Data[0].Description;

        let cancelledBy = '';
        let cancelledTitle = '';
        if (req.Data.OTScheduleStatusId === 4) {
            const cancelUserData: any = await userBO.GetUserById({ Id: req.Data.CancelledBy });
            cancelledBy = cancelUserData.FirstName;
            let apiCanreq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: cancelUserData.TitleId }
                ]
            };
            let cancelledByData = await refTitleBo.GetReferenceValues(apiCanreq);
            cancelledTitle = cancelledByData.Data[0].Description;
        }
        if (patient.Mobile) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = null;
            if (req.Data.OTScheduleStatusId === 2) {
                smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientSurgerySchedule', 'PatientSurgerySchedule', 1);
            } else if (req.Data.OTScheduleStatusId === 4) {
                smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientSurgeryCancel', 'PatientSurgeryCancel', 1);
            }
            let smsmodel: any = {};
            if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                try {
                    if (req.Data.OTScheduleStatusId === 2) {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: title + ' ' + vPatientName,
                                    scheduledatetime: surgeryDate + ' ' + req.Data.StartTime,
                                    surgeryLocation: surgeryRoomData.Name,
                                    surgeryDoctor: doctitle + ' ' + userData.FirstName,
                                    contact: this.Session.FacilityContact,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } else if (req.Data.OTScheduleStatusId === 4) {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    procedure: req.Data.ProcedureName,
                                    patientName: title + ' ' + vPatientName,
                                    scheduledatetime: surgeryDate + ' ' + req.Data.StartTime,
                                    surgeryLocation: surgeryRoomData.Name,
                                    cancelledby: cancelledTitle + ' ' + cancelledBy,
                                    reason: req.Data.Remarks,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    }
                } catch (error) {
                    console.log('Error Processing SMS:', error);
                }
            }
            let smsProvider = this.GetSmsProvider();
            if (smsProvider) {
                let SMSStatus = await smsProvider.send(smsmodel);
                let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
            }
        }
        if (userData.Mobile) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = null;
            if (req.Data.OTScheduleStatusId === 2) {
                smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('DrPatientSurgerySchedule', 'DrPatientSurgerySchedule', 1);
            } else if (req.Data.OTScheduleStatusId === 4) {
                smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('DrPatientSurgeryCancel', 'DrPatientSurgeryCancel', 1);
            }
            let smsmodel: any = {};
            if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                try {
                    if (req.Data.OTScheduleStatusId === 2) {
                        smsmodel = {
                            numbers: [userData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: title + ' ' + vPatientName,
                                    scheduledatetime: surgeryDate + ' ' + req.Data.StartTime,
                                    surgeryLocation: surgeryRoomData.Name,
                                    surgeryDoctor: doctitle + ' ' + userData.FirstName,
                                    contact: this.Session.FacilityContact,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } else if (req.Data.OTScheduleStatusId === 4) {
                        smsmodel = {
                            numbers: [userData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    procedure: req.Data.ProcedureName,
                                    patientName: title + ' ' + vPatientName,
                                    scheduledatetime: surgeryDate + ' ' + req.Data.StartTime,
                                    surgeryLocation: surgeryRoomData.Name,
                                    cancelledby: cancelledTitle + ' ' + cancelledBy,
                                    reason: req.Data.Remarks,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    }
                } catch (error) {
                    console.log('Error Processing SMS:', error);
                }
            }
            let smsProvider = this.GetSmsProvider();
            if (smsProvider) {
                let SMSStatus = await smsProvider.send(smsmodel);
                let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + userData.Mobile);
            }
        }
        return true;
    }

    public async UpdateOtSchedule(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (result) {
            let OtScheduleId = req.Data.Id;
            let detailBO = BoFactory.GetBo(schedulebo.OtScheduleDetailsBo, this.Request);
            await detailBO.ManageOtScheduleDetails(OtScheduleId, req.Data.Procedures);
        }
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', ' + ' Your  surgery is scheduled on ' + moment(req.Data.OTScheduledOn).format('YYYY-MM-DD') + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }

        if (req.Data.OTScheduleStatusId === 3) {
            let otentrydata: any = {
                Data: {
                    Id: 0,
                    SurgeryScheduleId: req.Data.Id,
                    FacilityId: req.Data.FacilityId,
                    SurgeryRegisteredOn: new Date(),
                    DiagnosisId: req.Data.DiagnosisId,
                    OtherDiagnosisName: req.Data.OtherDiagnosisName,
                    SurgeryEndDate: req.Data.SurgeryEndDate,
                    AnaesthesistId: req.Data.AnaesthesistId,
                    Comments:req.Data.Comments,
                    PatientId: req.Data.PatientId,
                    EncounterId: req.Data.EncounterId,
                    WardId: req.Data.WardId,
                    RoomId: req.Data.RoomId,
                    BedId: req.Data.BedId,
                    StartTime: req.Data.StartTime,
                    EndTime: req.Data.EndTime,
                    SurgeryTypeId: req.Data.SurgeryTypeId,
                    ProcedureTypeId: req.Data.PriorityId,
                    AdmissionDoctorId: req.Data.DoctorId,
                    ChiefSurgeonId: req.Data.DoctorId,
                    ProcedureId: req.Data.ProcedureId,
                    SurgeryRoomId: req.Data.OTRoomId,
                    AnaesthesiaTypeId: req.Data.AnaesthesiaTypeId,
                    SurgeryEntryStatusId: 1,
                    Status: 1,
                    Procedures: req.Data.Procedures
                }
            };
            let otentrybo = BoFactory.GetBo(bo.SurgeryEntryBo, this.Request);
            await otentrybo.AddSurgeryEntry(otentrydata);
            // let SurgeryEntryId = otentrydata.Id;
            // let detailBO = BoFactory.GetBo(bo.SurgeryEntryDetailsBo, this.Request);
            // await detailBO.ManageSurgeryEntryDetails(SurgeryEntryId, req.Data.Procedures);
        }

        if (doctorData && (doctorData.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', ' + 'Surgery is scheduled on ' + moment(req.Data.OTScheduledOn).format('YYYY-MM-DD') + ' for Patient ' + patient.FirstName + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (doctorData.NotificationToken) {
                pushTokens.push(doctorData.NotificationToken);
            }
            if (doctorData.WebNotificationToken) {
                pushTokens.push(doctorData.WebNotificationToken);
            }

            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        await this.sendOtscheduleSms(req);
        return result;
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

    public async GetOtScheduleById(req: BaseRequest): Promise<OtScheduleAttributes> {
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
        include.push({
            model: this.Models.OtScheduleDetails
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetCathlabScheduleById(req: BaseRequest): Promise<OtScheduleAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetCathlabSchedule(apiReq?: ApiRequest<OtScheduleFilters>): Promise<ApiResponse<OtScheduleAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let isReqPatientSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        include.push(this.GetReference('OTScheduleStatus'));
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier', 'EncounterTypeId'], required: false });
        include.push({
            model: this.Models.SurgeryRoomMaster, attributes: ['Code', 'Name'], required: false,
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'UserName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtScheduleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtScheduleFilters.SurgeryType:
                        where['SurgeryTypeId'] = param.Value;
                        break;
                    case OtScheduleFilters.OTScheduleStatus:
                        where['OTScheduleStatusId'] = param.Value;
                        break;
                    case OtScheduleFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case OtScheduleFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case OtScheduleFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case OtScheduleFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OtScheduleFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        // if (param.Value) {
                        //     let paramArr: Array<number> = [];
                        //     if (param.Value.toString().indexOf(',') > -1) {
                        //         paramArr = param.Value.toString().split(',');
                        //     } else {
                        //         paramArr = [param.Value];
                        //     }
                        //     where['DoctorId'] = { '$in': paramArr };
                        // }
                        break;
                    case OtScheduleFilters.SurgeryName:
                        where['SurgeryName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OtScheduleFilters.OTScheduledOn:
                        where['OTScheduledOn'] = { '$between': param.Value || '' };
                        break;
                    case OtScheduleFilters.From:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$gte'] = param.Value;
                        break;
                    case OtScheduleFilters.To:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$lte'] = param.Value;
                        break;
                    case OtScheduleFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case OtScheduleFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case OtScheduleFilters.SurgeryId:
                        where['SurgeryId'] = param.Value;
                        break;
                    case OtScheduleFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case OtScheduleFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case OtScheduleFilters.OTRoomId:
                        where['OTRoomId'] = param.Value;
                        break;
                    case OtScheduleFilters.IsCathlab:
                        where['IsCathlab'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetOtSchedules(apiReq?: ApiRequest<OtScheduleFilters>): Promise<ApiResponse<OtScheduleAttributes[]>> {
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
        include.push({
            model: this.Models.OtScheduleDetails
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtScheduleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtScheduleFilters.SurgeryType:
                        where['SurgeryTypeId'] = param.Value;
                        break;
                    case OtScheduleFilters.OTScheduleStatus:
                        where['OTScheduleStatusId'] = param.Value;
                        break;
                    case OtScheduleFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case OtScheduleFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case OtScheduleFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case OtScheduleFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OtScheduleFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        // if (param.Value) {
                        //     let paramArr: Array<number> = [];
                        //     if (param.Value.toString().indexOf(',') > -1) {
                        //         paramArr = param.Value.toString().split(',');
                        //     } else {
                        //         paramArr = [param.Value];
                        //     }
                        //     where['DoctorId'] = { '$in': paramArr };
                        // }
                        break;
                    case OtScheduleFilters.SurgeryName:
                        where['SurgeryName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OtScheduleFilters.OTScheduledOn:
                        where['OTScheduledOn'] = { '$between': param.Value || '' };
                        break;
                    case OtScheduleFilters.From:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$gte'] = param.Value;
                        break;
                    case OtScheduleFilters.To:
                        where['OTScheduledOn'] = where['OTScheduledOn'] || {};
                        (where['OTScheduledOn'] as any)['$lte'] = param.Value;
                        break;
                    case OtScheduleFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case OtScheduleFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case OtScheduleFilters.SurgeryId:
                        where['SurgeryId'] = param.Value;
                        break;
                    case OtScheduleFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case OtScheduleFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case OtScheduleFilters.OTRoomId:
                        where['OTRoomId'] = param.Value;
                        break;
                    case OtScheduleFilters.IsCathlab:
                        where['IsCathlab'] = param.Value;
                        break;
                    case OtScheduleFilters.Doctor:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',').map(Number);
                            } else {
                                paramArr = [Number(param.Value)];
                            }
                            paramArr = paramArr.filter(x => x !== -1);

                            if (paramArr.length > 0) {
                                where['DoctorId'] = { '$in': paramArr };
                            }
                        }
                        break;
                    case OtScheduleFilters.Otroom:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',').map(Number);
                            } else {
                                paramArr = [Number(param.Value)];
                            }
                            paramArr = paramArr.filter(x => x !== -1);
                            if (paramArr.length > 0) {
                                where['OTRoomId'] = { '$in': paramArr };
                            }
                        }
                        break;
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
    public async getUserName(UserData: UserAttributes): Promise<string> {
        let vDocName = '';
        if (UserData) {
            if (UserData.FirstName) vDocName += UserData.FirstName;
            if (UserData.LastName) vDocName += ' ' + UserData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName) {
                if (vTitleName.endsWith('.')) {
                    vDocName = vTitleName + vDocName;
                } else {
                    vDocName = vTitleName + '.' + vDocName;
                }
            }
        }
        return vDocName;
    }
    public async DeleteOtSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintOtSchedule(apiReq?: ApiRequest<OtScheduleFilters>): Promise<any> {
        let data = await this.GetOtSchedules(apiReq);
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
    public async PrintOtSchedulereport(apiReq?: ApiRequest<OtScheduleFilters>): Promise<any> {
        let data = await this.GetOtSchedules(apiReq);
        let OtSchedule = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Doctor = apiReq.Data.Surgeon;
        let DiagnosisData: any = [];
        OtSchedule.forEach((detail: any) => {
            let StartTime: any = detail.StartTime;
            let a = StartTime.split(':');
            let StartTimeHours = a[0];
            let StartTimeMinutes = a[1];
            let StartTimeWithoutSeconds = StartTimeHours + ':' + StartTimeMinutes;
            detail.StartTime = StartTimeWithoutSeconds;
        });
        let item: any = {};
        for (let ix in data.Data) {
            item = data.Data[ix];
            item.DiagnosisName = '';
            if (item.DiagnosisId > 0) {
                item.DiagnosisName = item.Diagnosis.DiagnosisName;
            }
            if (!item.DiagnosisId) {
                item.DiagnosisName = item.OtherDiagnosisName;
            }
            if (item.DiagnosisId > 0 && item.OtherDiagnosisName) {
                item.DiagnosisName = item.Diagnosis.DiagnosisName;
                if (item.OtherDiagnosisName) {
                    item.DiagnosisName += ' / ' + item.OtherDiagnosisName;
                }
            }
            DiagnosisData.push(item);
        }
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
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
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

    public GetModel(): SStatic.Model<OtScheduleInstance, OtScheduleAttributes> {
        return this.Models.OtSchedule;
    }
}
