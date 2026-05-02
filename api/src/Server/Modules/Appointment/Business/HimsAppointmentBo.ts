import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AppointmentInstance, AppointmentAttributes } from '../Model/Interface/Index';
import { AppointmentFilters, AppointmentDisplayFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as PatientTrackerBo from '../../Appointment/Business/Index';
import { PatientAttributes } from '../../Registration/Model/Interface/Index';
import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
import * as Userbo from '../../SystemSettings/Business/Index';
import * as apptbo from '../../Appointment/Business/Index';
import * as Vitalbo from '../../EMR/Business/Index';
import { PatientVitalFilters } from '../../EMR/Common/Filters.e';
import * as moment from 'moment';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import { FacilityAttributes } from '../../SystemSettings/Model/Interface/Index';
import { MRDLocationFilters } from '../../IPManagement/Common/Filters.e';
import * as mrdlocbo from '../../IPManagement/Business/Index';
import { join } from 'path';
import * as vhCarebo from '../../VirtualHealthcare/Business/Index';
import * as billbo from '../../Billing/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientGuarantorFilters } from '../../Registration/Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';
import { PatientBillsFilters } from '../../Billing/Common/Filters.e';
import * as facilityBo from '../../SystemSettings/Business/Index';

export class AppointmentBo extends BaseBo<AppointmentInstance, AppointmentAttributes> {
    public async AddAppointment(req: BaseRequest): Promise<number> {
        if (await this.AppointmentIsAlreadyExists(req) === -1) {
            throw { code: 'APPOINTMENT_ALREADY_BOOKED' };
        }
        if (req.Data.AppointmentTypeId === 1) {
            let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            if (await encounterBO.CanCreateEncounter(req)) {
                let result = await this.Save(req.Data);
                req.Data.Id = result.dataValues.Id;
                await this.sendAppointmentSMS(req);
                await this.sendConfirmDrAppointmentSMS(req);
                await encounterBO.ManageEncounter(req);
                return result.dataValues.Id;
            }
        } else if (req.Data.AppointmentTypeId === 2) { // Resource Appointment
            let result = await this.Save(req.Data);
            req.Data.Id = result.dataValues.Id;
            await this.sendAppointmentSMS(req);
            await this.sendConfirmDrAppointmentSMS(req);
            return result.dataValues.Id;
        }

        return -1;
    }

    public async AddAppointmentFromSession(req: BaseRequest): Promise<number> {
        if (await this.AppointmentIsAlreadyExists(req) === -1) {
            throw { code: 'APPOINTMENT_ALREADY_BOOKED' };
        }
        // const userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
        // const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken && req.Data.AppointmentStatusId === 6)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', you have checked in the appointment on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            // const pushTokens: string[] = [];
            // if (patient.NotificationToken) {
            //     pushTokens.push(patient.NotificationToken);
            // }
            // await notificationService.sendNotification(pushMessage, pushTokens, body);
            await notificationService.sendNotification(pushMessage, body);
        }

        let patientGuarantorBO = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
        if (req.Data.AppointmentTypeId === 1) {
            let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            if (await encounterBO.CanCreateEncounterfromApnmnt(req)) {
                let result = await this.Save(req.Data);
                await patientBO.ManageAutoAppointmentDisplay(req.Data.PatientId, result.dataValues.Id, req);
                req.Data.Id = result.dataValues.Id;
                await this.sendAppointmentSMS(req);
                await this.sendConfirmDrAppointmentSMS(req);
                let listReq: any = {};
                listReq = {
                    Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId }]
                };
                let listRes = await patientGuarantorBO.GetPatientGuarantors(listReq);
                if (listRes.Data.length > 0) {
                    let patGuar = listRes.Data[0];
                    req.Data.GuarantorTypeId = patGuar.GuarantorTypeId;
                    req.Data.GuarantorId = patGuar.GuarantorId;
                }
                await encounterBO.ManageEncounter(req);
                //Update Patient Tracker In case booking from future appointments
                if (req.Data.PatientTrackerId > 0) {
                    let patienttrackerBo = BoFactory.GetBo(PatientTrackerBo.PatientTrackerBo, this.Request);
                    let updreq: any = {
                        Data: {
                            'Id': Number(req.Data.PatientTrackerId),
                            'FollowupTrackerStatusId': 4
                        }
                    };
                    await patienttrackerBo.UpdatePatientTracker(updreq);
                }
                return result.dataValues.Id;
            }
        } else if (req.Data.AppointmentTypeId === 2) { // Resource Appointment
            let result = await this.Save(req.Data);
            req.Data.Id = result.dataValues.Id;
            await this.sendAppointmentSMS(req);
            await this.sendConfirmDrAppointmentSMS(req);
            return result.dataValues.Id;
        }
        return -1;
    }

    public async AddOrderVirtualAppointment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        req.Data.Id = result.dataValues.Id;
        return result.dataValues.Id;
    }

    public async AddVirtualAppointment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        req.Data.Id = result.dataValues.Id;
        return result.dataValues.Id;
    }
    // if (await this.AppointmentIsAlreadyExists(req) === -1) {
    //     throw { code: 'APPOINTMENT_ALREADY_BOOKED' };
    // }
    // if (req.Data.AppointmentTypeId === 1) {
    //     // let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
    //     // if (await encounterBO.CanCreateEncounter(req)) {

    //     // await this.sendAppointmentSMS(req);
    //     // await encounterBO.ManageEncounter(req);

    // }
    // } else if (req.Data.AppointmentTypeId === 2) { // Resource Appointment
    //     let result = await this.Save(req.Data);
    //     req.Data.Id = result.dataValues.Id;
    //     await this.sendAppointmentSMS(req);
    //     return result.dataValues.Id;
    // }

    // return -1;
    // public async ManageRegCumWithBillAppointment(req: BaseRequest): Promise<any> {
    //     let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
    //     if (!req.Data.Id || req.Data.Id <= 0) {
    //         if (await encounterBO.CanCreateEncounter(req)) {
    //             let result = await this.Save(req.Data);
    //             req.Data.Id = result.dataValues.Id;
    //             await this.sendAppointmentSMS(req);
    //             await encounterBO.ManageEncounter(req);
    //             return result.dataValues.Id;
    //         }
    //     } else {
    //         await this.Update(req.Data);
    //         await this.sendAppointmentSMS(req);
    //         await encounterBO.ManageEncounter(req);
    //         return req.Data.Id;
    //     }
    //     // if (await encounterBO.CanCreateEncounter(req)) {

    //     // }
    //     return -1;
    // }

    public async ManageRegCumWithBillAppointment(req: BaseRequest): Promise<number> {
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        if (await encounterBO.CanCreateEncounter(req)) {
            let result = await this.Save(req.Data);
            req.Data.Id = result.dataValues.Id;
            // await this.sendAppointmentSMS(req);
            await this.sendConfirmDrAppointmentSMS(req);
            await encounterBO.ManageEncounter(req);
            return result.dataValues.Id;
        }
        return -1;
    }

    public async ManageRegCumWithLIS(req: BaseRequest): Promise<number> {
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        if (await encounterBO.CanCreateEncounter(req)) {
            let result = await this.Save(req.Data);
            req.Data.Id = result.dataValues.Id;
            await this.sendAppointmentSMS(req);
            await encounterBO.ManageEncounterForLISReg(req);
            return result.dataValues.Id;
        }
        return -1;
    }

    public async CrossConsultationAppointment(req: BaseRequest): Promise<number> {
        if (await this.AppointmentIsAlreadyExists(req) === -1) {
            throw { code: 'APPOINTMENT_ALREADY_BOOKED' };
        }
        let result = await this.Save(req.Data);
        req.Data.Id = result.dataValues.Id;
        await this.sendAppointmentSMS(req);
        return result.dataValues.Id;
    }

    public async sendAppointmentSMS(req: BaseRequest): Promise<boolean> {
        if (req.Data.AppointmentTypeId >= 1) {
            let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
            let patientData = await patientBO.GetPatientById({ Id: req.Data.PatientId });
            let facBO = BoFactory.GetBo(Userbo.FacilityBo, this.Request);
            let UserData = await userBO.GetUserById({ Id: req.Data.DoctorId });
            let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
            let facilityData = await faciliBO.GetFacilityById({ Id: req.Data.FacilityId });
            let mobileNum = facilityData.Mobile;
            let landNum = facilityData.LandLine;
            let landline = landNum + ',' + mobileNum;
            if (patientData && UserData) {
                let facData = await facBO.GetFacilityById({ Id: req.Data.FacilityId });
                if (patientData.Mobile) {
                    let smsProvider = this.GetSmsProvider();
                    let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                    let smsTemplateInfo = null;
                    switch (req.Data.AppointmentStatusId) {
                        case 1: // Reqeusted
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentRequest', 'AppointmentRequest', 1);
                            break;
                        case 2: // SCHEDULED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentSchedule', 'AppointmentSchedule', 1);
                            break;
                        case 3: // CONFIRMED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentConfirm', 'AppointmentConfirm', 1);
                            break;
                        case 4: // RESCHEDULED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentReschedule', 'AppointmentReschedule', 1);
                            // smsTemplateInfo =
                            //     await eventTemplateBO.GetTemplateInfo('AppointmentReschedulePt', 'AppointmentReschedulePt', 1);
                            break;
                        case 5: // CANCELLED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentCancellation', 'AppointmentCancellation', 1);
                            // smsTemplateInfo =
                            //     await eventTemplateBO.GetTemplateInfo('AppointmentCancellationDr', 'AppointmentCancellationDr', 1);
                            break;
                        case 6: // CHECKED IN
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentCreation', 'AppointmentCreation', 1);
                            break;
                        default:
                            smsTemplateInfo = null;
                    }
                    if (smsTemplateInfo) {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorName(UserData);
                        // if (SmsConfig['SENDER_ID'] && SmsConfig['SENDER_ID'] === 'BEWELL' && req.Data.AppointmentStatusId === 2) {
                        //     vDoctorName = 'Dr' + UserData.FirstName;
                        // }
                        let dateformat = 'DD/MM/YYYY';
                        let faccontact = facData.Mobile;
                        let smsmodel: any = {};
                        if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                            smsmodel = {
                                numbers: [patientData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName,
                                        doctorName: vDoctorName,
                                        facilityName: this.Session.FacilityName,
                                        displaytime: req.Data.StartTime,
                                        displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                                        landlinenum: landline,
                                        contactNo: faccontact
                                    })
                            };
                        }  else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                            try {
                                if (req.Data.AppointmentStatusId === 2) {
                                    smsmodel = {
                                        numbers: [patientData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                datetime : moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime,
                                                department: req.Data.DepartmentName,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                } else if (req.Data.AppointmentStatusId === 4) {
                                    smsmodel = {
                                        numbers: [patientData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                olddatetime: moment(req.Data.OldAppointmentDate).format(dateformat) +
                                                 ' ' + req.Data.OldStartTime,
                                                department: req.Data.DepartmentName,
                                                newdatetime : moment(req.Data.AppointmentDate).format(dateformat) +
                                                 ' ' + req.Data.StartTime,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                } else if (req.Data.AppointmentStatusId === 5) {
                                    smsmodel = {
                                        numbers: [patientData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                datetime : moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime,
                                                department: req.Data.DepartmentName,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                }
                            } catch (error) {
                                console.log('Error Processing SMS:', error);
                            }
                        } else {
                            smsmodel = {
                                numbers: [patientData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName, doctorName: vDoctorName,
                                        facilityName: this.Session.FacilityName,
                                        displaytime: req.Data.StartTime,
                                        displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                                        contactNo: faccontact
                                    })
                            };
                        }
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(Userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                        }
                    }
                    console.log('***********Config*******88');
                    console.log(WhatsAppConfig['PROVIDER']);
                    if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'ProMed') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorName(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        let data = {
                            payload: {
                                name: '',
                                components: [
                                    {
                                        type: 'body',
                                        parameters: [
                                            {
                                                type: 'text',
                                                text: vPatientName
                                            },
                                            // {
                                            //     type: 'text',
                                            //     text: vDoctorName
                                            // },
                                            {
                                                type: 'text',
                                                text: moment(req.Data.AppointmentDate).format(dateformat)
                                            },
                                            {
                                                type: 'text',
                                                text: req.Data.StartTime
                                            }
                                        ]
                                    }
                                ],
                                language: {
                                    code: 'en_US',
                                    policy: 'deterministic'
                                },
                                namespace: '617a3aff_6cf4_4d2f_889c_67c430bd8157'
                            },
                            phoneNumber: patientData.Mobile
                        };
                        if (req.Data.AppointmentStatusId === 2 || req.Data.AppointmentStatusId === 3) {
                            // data.payload.name = 'pro_hms_appointment_confirmation';
                            data.payload.name = 'pro_hms_appointment_confirmation_dr';
                            let param: any = {
                                type: 'text',
                                text: vDoctorName
                            };
                            data.payload.components[0].parameters.push(param);
                        } else if (req.Data.AppointmentStatusId === 4) {
                            // data.payload.name = 'pro_hms_reschedule_appointment_final';
                            data.payload.name = 'pro_hms_reschedule_appointment_dr';
                            let param: any = {
                                type: 'text',
                                text: vDoctorName
                            };
                            data.payload.components[0].parameters.push(param);
                        } else if (req.Data.AppointmentStatusId === 5) {
                            // data.payload.name = 'pro_hms_appointment_cancel_final';
                            data.payload.name = 'pro_hms_appointment_cancel_new_dr';
                            let cancel: any = {
                                type: 'text',
                                text: req.Data.CancelorRescheduleComments
                            };
                            data.payload.components[0].parameters.push(cancel);
                            cancel = {
                                type: 'text',
                                text: vDoctorName
                            };
                            data.payload.components[0].parameters.push(cancel);
                        }
                        if (data.payload.name !== '') {
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes);
                        }

                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        let data = {
                            channelId: '64ef1968000b0fe0d6e2847c',
                            channelType: 'whatsapp',
                            recipient: {
                                name: vPatientName,
                                phone: '91' + Number(patientData.Mobile)
                            },
                            whatsapp: {
                                type: 'template',
                                template: {
                                    templateName: '',
                                    bodyValues: {
                                        variable_1: vPatientName,
                                        variable_2: vDoctorName,
                                        variable_3: req.Data.DepartmentName,
                                        variable_4: moment(req.Data.AppointmentDate).format(dateformat),
                                        variable_5: req.Data.StartTime,
                                    }
                                }
                            }
                        };
                        if (req.Data.AppointmentStatusId === 2) {
                            data.whatsapp.template.templateName = 'appointment_patient';
                            if (data.whatsapp.template.templateName !== '') {
                                const whatsApp = new WhatsappNotificationService();
                                let msgRes = await whatsApp.sendMessage(data);
                                console.log(msgRes);
                            }
                        }
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        if (req.Data.AppointmentStatusId === 2) {
                            let data = {
                                TemplateName: 'ptappointment',
                                ToNumbersWithCountryCode: patientData.Mobile,
                                msg: 'Dear' + vPatientName + 'Your appointment is scheduled with' + vDoctorName + 'on'
                                 + moment(req.Data.AppointmentDate).format(dateformat) +'at' + req.Data.StartTime +
                                  '. Thanks Hospital Management - '+ this.Session.FacilityName +
                                   'For any queries please call' + landline + '.',
                                BodyParameter: [vPatientName, vDoctorName, moment(req.Data.AppointmentDate).format(dateformat),
                                     req.Data.StartTime, this.Session.FacilityName, landline]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the appointmentschedule');
                        } else if(req.Data.AppointmentStatusId === 5) {
                            let data = {
                                TemplateName: 'ptappointmentcan',
                                ToNumbersWithCountryCode: patientData.Mobile,
                                msg: 'Dear' + vPatientName + ', Your appointment with' + vDoctorName + 'on' +
                                 moment(req.Data.AppointmentDate).format(dateformat) + 'at' + req.Data.StartTime +
                                  'has been cancelled.For re-appointment contact :' +
                                   landline +'Sorry for the inconvienience-' +this.Session.FacilityName + '.',
                                BodyParameter: [vPatientName, vDoctorName, moment(req.Data.AppointmentDate).format(dateformat),
                                     req.Data.StartTime, landline,
                                    this.Session.FacilityName]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the appointmentcancel');
                        }
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        if (req.Data.AppointmentStatusId === 2) {
                            let data = {
                                template: 'patientappointment',
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                datetime: moment(req.Data.AppointmentDate).format(dateformat) +' '+req.Data.StartTime,
                                Mobile: patientData.Mobile,
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the championappointmentschedule');
                        } else if (req.Data.AppointmentStatusId === 4) {
                            let data = {
                                template: 'appointmentreschedule',
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                                displaytime: req.Data.StartTime,
                                Mobile: patientData.Mobile,
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the ChampionAppointmentReschedule');
                        } else if(req.Data.AppointmentStatusId === 5) {
                            let data = {
                                template: 'appointmentcancel',
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                                displaytime: req.Data.StartTime,
                                Mobile: patientData.Mobile,
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the ChampionAppointmentCancel');
                        }
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        if (req.Data.AppointmentStatusId === 2) {
                            let data = {
                                TemplateName: 'jnewopdappt',
                                mobile: patientData.Mobile,
                                BodyParameter: [vPatientName, vDoctorName, moment(req.Data.AppointmentDate).format(dateformat)
                                     +' '+ req.Data.StartTime]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the jssappointmentschedule');
                        } else if (req.Data.AppointmentStatusId === 4) {
                            let data = {
                                TemplateName: 'jnewopdapptrscd',
                                mobile: patientData.Mobile,
                                BodyParameter: [vPatientName, vDoctorName, moment(req.Data.AppointmentDate).format(dateformat)
                                    +' '+ req.Data.StartTime]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the JssAppointmentReschedule');
                        } else if(req.Data.AppointmentStatusId === 5) {
                            let data = {
                                TemplateName: 'patapptcan',
                                mobile: patientData.Mobile,
                                BodyParameter: [vPatientName, vDoctorName, moment(req.Data.AppointmentDate).format(dateformat)
                                    +' '+ req.Data.StartTime]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the JssAppointmentCancel');
                        }
                    }
                }

                if (patientData.Email) {
                    let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                    let mailTemplateInfo = null;

                    switch (req.Data.AppointmentStatusId) {
                        // case 1: // Reqeusted
                        //     smsTemplateInfo =
                        //         await eventTemplateBO.GetTemplateInfo('AppointmentRequest', 'AppointmentRequest', 1);
                        //     break;
                        case 2: // SCHEDULED
                            mailTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentSchedule', 'AppointmentSchedule', 2);
                            break;
                        // case 3: // CONFIRMED
                        //     smsTemplateInfo =
                        //         await eventTemplateBO.GetTemplateInfo('AppointmentConfirm', 'AppointmentConfirm', 1);
                        //     break;
                        // case 6: // CHECKED IN
                        //     smsTemplateInfo =
                        //         await eventTemplateBO.GetTemplateInfo('AppointmentCreation', 'AppointmentCreation', 1);
                        //     break;
                        // case 4: // RESCHEDULED
                        //     smsTemplateInfo =
                        //         await eventTemplateBO.GetTemplateInfo('AppointmentReschedule', 'AppointmentReschedule', 1);
                        //     break;
                        case 5: // CANCELLED
                            mailTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('AppointmentCancellation', 'AppointmentCancellation', 2);
                            break;
                        default:
                            mailTemplateInfo = null;
                    }
                    let vPatientName = '';
                    vPatientName = await this.getPatientName(patientData);
                    let vDoctorName = '';
                    vDoctorName = await this.getDoctorName(UserData);
                    let dateformat = 'DD/MM/YYYY';
                    const mailData = {
                        patientName: vPatientName, doctorName: vDoctorName,
                        facilityName: this.Session.FacilityName,
                        displaytime: req.Data.StartTime,
                        displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                        contactNo: this.Session.FacilityContact
                    };
                    if (mailTemplateInfo) {
                        const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                        const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                        let mailProvider = this.GetMailProvider();
                        await mailProvider.send({
                            // from: 'From DrHMS <report@drhms.com>',
                            from: EmailConfig['From'],
                            to: patientData.Email,
                            subject: mailSubject,
                            html: mailBody,
                        });
                    }


                }
            }
        }
        return true;
    }

    public async CheckoutAppointment(req: BaseRequest): Promise<boolean> {
        let checkoutInfo = req.Data;
        let appointmentInstance: any = await this.Find({
            where: { AppointmentId: checkoutInfo.AppointmentId }
        });
        if (appointmentInstance) {
            let appointment = this.GetAttribute(appointmentInstance);
            appointment.AppointmentStatusId = 11; //AppointmentStatusId  - Checkout
            await this.Update(appointment);
            await this.UpdateAppointmentRequestStatus(appointment.Id,
                appointment.AppointmentStatusId);
        }
        return true;
    }

    public async UpdateAppointmentStatus(req: BaseRequest): Promise<boolean> {
        if (req.Data && req.Data.AppointmentId) {
            let appointReq: any = { 'AppointmentStatusId': req.Data.AppointmentStatusId };
            await this.Update(appointReq, {
                fields: ['AppointmentStatusId'],
                where: { 'AppointmentId': req.Data.AppointmentId },
            });
        }
        return true;
    }

    public async UpdateAppointmentRequestStatus(Id: number, Status: number): Promise<boolean> {
        let apptReqtBo = BoFactory.GetBo(apptbo.AppointmentRequestBo, this.Request);
        let updreq: any = {
            Data: {
                'AppointmentId': Id,
                'AppointmentRequestStatusId': Status
            }
        };
        await apptReqtBo.UpdateAppointmentRequestStatus(updreq);
        return true;
    }

    public async AutoCheckoutAppointment(checkoutInfo: any): Promise<boolean> {
        let appointmentInstance: any = await this.Find({
            where: { AppointmentId: checkoutInfo.AppointmentId }
        });
        if (appointmentInstance) {
            let appointment = this.GetAttribute(appointmentInstance);
            appointment.AppointmentStatusId = 11; //AppointmentStatusId  - Checkout
            await this.Update(appointment);
            await this.UpdateAppointmentRequestStatus(appointment.Id,
                appointment.AppointmentStatusId);
        }
        return true;
    }

    public async sendFollowUpSMS(details: AppointmentAttributes[], frmFollowUpDt: Date): Promise<boolean> {
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (rows): Promise<void> => {
                let detail: any = rows;
                let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
                let userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
                let patientData = await patientBO.GetPatientById({ Id: detail.PatientId });
                let UserData = await userBO.GetUserById({ Id: detail.DoctorId });
                if (patientData && UserData) {
                    if (patientData.Mobile) {
                        let smsProvider = this.GetSmsProvider();
                        let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                        let smsTemplateInfo =
                            await eventTemplateBO.GetTemplateInfo('Appointment', 'FollowupAppointmentSMS', 1);
                        if (smsTemplateInfo) {
                            let vPatientName = '';
                            vPatientName = await this.getPatientName(patientData);
                            let vDoctorName = '';
                            vDoctorName = await this.getDoctorName(UserData);
                            let dateformat = 'DD/MM/YYYY';
                            let smsmodel = {
                                numbers: [patientData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName, doctorName: vDoctorName,
                                        facilityName: this.Session.FacilityName,
                                        displaytime: detail.StartTime,
                                        displaydate: moment(frmFollowUpDt).format(dateformat)
                                    })
                            };
                            if (smsProvider) {
                                let SMSStatus = await smsProvider.send(smsmodel);
                                let eventDashboardOutboundBo = BoFactory.GetBo(Userbo.EventDashboardBo, this.Request);
                                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus,
                                    smsmodel.message + ' To : ' + patientData.Mobile);
                            }
                        }
                    }
                }
            })(detailItem);
        }));
        return true;
    }

    public async sendFollowUpPrescribedSMS(details: AppointmentAttributes[], frmFollowUpDt: Date): Promise<boolean> {
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (rows): Promise<void> => {
                let detail: any = rows;
                let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
                let userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
                let patientData = await patientBO.GetPatientById({ Id: detail.PatientId });
                let UserData = await userBO.GetUserById({ Id: detail.DoctorId });
                if (patientData && UserData) {
                    if (patientData.Mobile) {
                        let smsProvider = this.GetSmsProvider();
                        let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                        let facilityBO = BoFactory.GetBo(Userbo.FacilityBo, this.Request);
                        let facilitydata = await facilityBO.GetFacilityById({ Id: detail.FacilityId });
                        let smsTemplateInfo =
                            await eventTemplateBO.GetTemplateInfo('Prescriptions', 'PrescriptionsRemainder', 1);
                        if (smsTemplateInfo) {
                            let vPatientName = '';
                            vPatientName = await this.getPatientName(patientData);
                            let vDoctorName = '';
                            vDoctorName = await this.getDoctorName(UserData);
                            let vFacilityNumber = '';
                            vFacilityNumber = await this.getFacilityNumber(facilitydata);
                            let dateformat = 'DD/MM/YYYY';
                            let smsmodel = {
                                numbers: [patientData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName, doctorName: vDoctorName,
                                        facilityName: this.Session.FacilityName,
                                        facilityNumber: vFacilityNumber,
                                        displaydate: moment(frmFollowUpDt).format(dateformat)
                                    })
                            };
                            if (smsProvider) {
                                let SMSStatus = await smsProvider.send(smsmodel);
                                let eventDashboardOutboundBo = BoFactory.GetBo(Userbo.EventDashboardBo, this.Request);
                                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus,
                                    smsmodel.message + ' To : ' + patientData.Mobile);
                            }
                        }
                    }
                }
            })(detailItem);
        }));
        return true;
    }

    public async sendDrAppointmentStatusSMS(frmDt: Date, toDt: Date): Promise<boolean> {
        let doctorids: AppointmentAttributes[] = await this.GetAppointmentDrs(frmDt, toDt);
        await Promise.all(doctorids.map((detailItem): Promise<void> => {
            return (async (rows): Promise<void> => {
                let detail: any = rows;
                let ApptCount = await this.GetAppointmentCount(detail.DoctorId, frmDt, toDt);
                let userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
                let UserData = await userBO.GetUserById({ Id: detail.DoctorId });
                if (UserData) {
                    if (UserData.Mobile) {
                        let smsProvider = this.GetSmsProvider();
                        let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                        let smsTemplateInfo =
                            await eventTemplateBO.GetTemplateInfo('CRONJOB', 'DailyDoctorAppointment', 1);
                        if (smsTemplateInfo) {
                            let vDoctorName = '';
                            vDoctorName = await this.getDoctorName(UserData);
                            let dateformat = 'DD/MM/YYYY';
                            let smsmodel = {
                                numbers: [UserData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        doctorName: vDoctorName,
                                        noofappointments: ApptCount,
                                        facilityName: this.Session.FacilityName,
                                        displaydate: moment(frmDt).format(dateformat)
                                    })
                            };
                            if (smsProvider) {
                                let SMSStatus = await smsProvider.send(smsmodel);
                                let eventDashboardOutboundBo = BoFactory.GetBo(Userbo.EventDashboardBo, this.Request);
                                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                            }
                        }
                    }
                }
            })(detailItem);
        }));
        return true;
    }

    public async GetAppointmentDrs(frmDt: Date, toDt: Date): Promise<any> {
        let result = await this.FindAll({
            attributes: [
                [this.Dal.fn('DISTINCT', this.Dal.col('DoctorId')), 'DoctorId'],
            ],
            where: {
                AppointmentStatusId: [2],
                AppointmentDate: { '$gte': frmDt, '$lte': toDt }
            }
        });
        return this.GetAttributes(result);
    }

    public async GetAppointmentCount(vDoctorId: number, frmDt: Date, toDt: Date): Promise<number> {
        let result: number = 0;
        let appointmentcount: any = await this.Find({
            attributes: [
                [this.Dal.fn('COUNT', this.Dal.col('DoctorId')), 'AppointmentCount'],
            ],
            where: {
                AppointmentStatusId: [2],
                DoctorId: vDoctorId,
                AppointmentDate: { '$gte': frmDt, '$lte': toDt }
            }
        });
        if (appointmentcount) {
            let appcnt: any = this.GetAttribute(appointmentcount);
            if (appcnt)
                result = appcnt['AppointmentCount'];
        }
        return result;
    }

    public async getPatientName(patientData: PatientAttributes): Promise<string> {
        let vPatientName = '';
        if (patientData) {
            if (patientData.FirstName) vPatientName += patientData.FirstName;
            if (patientData.LastName) vPatientName += ' ' + patientData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patientData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(Userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;
        }
        return vPatientName;
    }

    public async getPatientGender(patientData: PatientAttributes): Promise<string> {
        let vGender = '';
        let apiReqGender = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Gender' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patientData.GenderId }
            ]
        };
        let refTitleBo = BoFactory.GetBo(Userbo.ReferenceValueBo, this.Request);
        let GenderData = await refTitleBo.GetReferenceValues(apiReqGender);
        if (GenderData.Data) {
            if (GenderData.Data.length > 0) {
                if (GenderData.Data[0].Description)
                    vGender = GenderData.Data[0].Description;
            }
        }
        return vGender;
    }

    public async getDoctorName(UserData: UserAttributes): Promise<string> {
        let vDoctorName = '';
        if (UserData) {
            if (UserData.FirstName) vDoctorName += UserData.FirstName;
            if (UserData.LastName) vDoctorName += ' ' + UserData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(Userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName)
                vDoctorName = vTitleName + '.' + vDoctorName;
        }
        return vDoctorName;
    }
    public async getDoctorNamewoTit(UserData: UserAttributes): Promise<string> {
        let vDoctorName = '';
        if (UserData) {
            if (UserData.FirstName) vDoctorName += UserData.FirstName;
            if (UserData.LastName) vDoctorName += ' ' + UserData.LastName;
            // let apiReqTitle = {
            //     Id: 0,
            //     PageContext: { PageSize: 50, PageNumber: 1 },
            //     Params: [
            //         { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
            //         { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
            //     ]
            // };
            // let vTitleName = '';
            // let refTitleBo = BoFactory.GetBo(Userbo.ReferenceValueBo, this.Request);
            // let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            // if (TitleData.Data) {
            //     if (TitleData.Data.length > 0) {
            //         if (TitleData.Data[0].Description)
            //             vTitleName = TitleData.Data[0].Description;
            //     }
            // }
            // if (vTitleName)
            //     vDoctorName = vTitleName + '.' + vDoctorName;
        }
        return vDoctorName;
    }
    public async getFacilityNumber(facilitydata: FacilityAttributes): Promise<string> {
        let vFacilityNumber = '';
        if (facilitydata) {
            if (facilitydata.LandLine) vFacilityNumber += ' ' + facilitydata.LandLine;
        }
        return vFacilityNumber;
    }
    public async AppointmentIsAlreadyExists(req: BaseRequest): Promise<number> {
        let appdt = moment(req.Data.AppointmentDate).format('YYYY-MM-DD');
        let AppIsExists = await this.Find({
            where: {
                AppointmentDate: appdt,
                DoctorId: req.Data.DoctorId,
                AppointmentStatusId: 6,
                StartTime: req.Data.StartTime,
                EndTime: req.Data.EndTime
            },
            order: [['Id', 'DESC']],
        });
        return AppIsExists ? -1 : 1;
    }

    public async UpdateAppAppointment(req: BaseRequest): Promise<boolean> {
        let pbillId: any;
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let patbillBO = BoFactory.GetBo(billbo.PatientBillsBo, this.Request);
        await encounterBO.ManageAppEncounter(req);
        let result = await this.Update(req.Data);
        await this.sendConfirmDrAppointmentSMS(req);
        if (req.Data.VirtualOrderId) {
            pbillId = await patbillBO.AddClinicDraftBills(req);
        }
        if (pbillId && req.Data.PaymentModeId) {
            req.Data.IsPaid = true;
            await this.Update(req.Data);
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken && req.Data.AppointmentStatusId === 4)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', your appointment is rescheduled on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        await this.UpdateAppointmentRequestStatus(req.Data.Id,
            req.Data.AppointmentStatusId);
        return result;
    }

    public async sendConfirmDrAppointmentSMS(req: any): Promise<boolean> {
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
        let facBO = BoFactory.GetBo(Userbo.FacilityBo, this.Request);
        let patientData: any = {};
        if (req) {
            if (req.Data.PatientId) {
                patientData = await patientBO.GetPatientById({ Id: req.Data.PatientId });
            }
        }
        let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
        let facilityData = await faciliBO.GetFacilityById({ Id: req.Data.FacilityId });
        let mobileNum = facilityData.Mobile;
        let landNum = facilityData.LandLine;
        let landline = landNum + ',' + mobileNum;
        if (patientData) {
            let UserData = await userBO.GetUserById({ Id: req.Data.DoctorId });
            let facData = await facBO.GetFacilityById({ Id: req.Data.FacilityId });
            if (patientData && UserData) {
                if (UserData.Mobile) {
                    let smsProvider = this.GetSmsProvider();
                    let eventTemplateBO = BoFactory.GetBo(Userbo.EventTemplateBo, this.Request);
                    let smsTemplateInfo = null;
                    switch (req.Data.AppointmentStatusId) {
                        case 2: // SCHEDULED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('DrPatientAppointment', 'DrPatientAppointment', 1);
                            break;
                        case 4: // RESCHEDULED
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('DrPatientReAppointment', 'DrPatientReAppointment', 1);
                            break;
                        case 5: // CANCEL
                            smsTemplateInfo =
                                await eventTemplateBO.GetTemplateInfo('DrPatientAppCancellation', 'DrPatientAppCancellation', 1);
                            break;
                        default:
                            smsTemplateInfo = null;
                    }
                    if (smsTemplateInfo) {
                        let vPatientName = '';
                        let vDoctorName = '';
                        let faccontact = facData.Mobile;
                        vDoctorName = await this.getDoctorName(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        vPatientName = await this.getPatientName(patientData);
                        let smsmodel: any = {};
                        if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                            smsmodel = {
                                numbers: [UserData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName,
                                        doctorName: vDoctorName,
                                        facilityName: this.Session.FacilityName,
                                        displaydate: moment(req.Data.AppointmentDate).format(dateformat),
                                        displaytime: req.Data.StartTime,
                                        landlinenum: landline,
                                        contactNo: faccontact
                                    })
                            };
                        } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                            try {
                                if (req.Data.AppointmentStatusId === 2) {
                                    smsmodel = {
                                        numbers: [UserData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                datetime : moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime,
                                                department: req.Data.DepartmentName,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                } else if (req.Data.AppointmentStatusId === 4) {
                                    smsmodel = {
                                        numbers: [UserData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                olddatetime: moment(req.Data.OldAppointmentDate).format(dateformat) +
                                                 ' ' + req.Data.OldStartTime,
                                                department: req.Data.DepartmentName,
                                                newdatetime : moment(req.Data.AppointmentDate).format(dateformat) +
                                                 ' ' + req.Data.StartTime,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                } else if (req.Data.AppointmentStatusId === 5) {
                                    smsmodel = {
                                        numbers: [UserData.Mobile],
                                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                                            {
                                                patientName: vPatientName,
                                                doctorName: vDoctorName,
                                                datetime : moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime,
                                                department: req.Data.DepartmentName,
                                                contact: landNum
                                            }),
                                        templateId: smsTemplateInfo.ModuleId
                                    };
                                }
                            } catch (error) {
                                console.log('Error Processing SMS:', error);
                            }
                        } else {
                            smsmodel = {
                                numbers: [UserData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: vPatientName,
                                        doctorName: vDoctorName,
                                        displaytime: req.Data.StartTime,
                                        faccontact: faccontact,
                                        contactNo: faccontact,
                                        displaydate: moment(req.Data.AppointmentDate).format(dateformat)
                                    })
                            };
                        }
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(Userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                        }
                    }
                    console.log('***********Config*******88');
                    console.log(WhatsAppConfig['PROVIDER']);
                    if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        if (req.Data.AppointmentStatusId === 2) {
                            let data = {
                                TemplateName: 'drptappointment',
                                ToNumbersWithCountryCode: UserData.Mobile,
                                msg: 'Dear' + vDoctorName + ',' + vPatientName + 'has been scheduled for your appointment on' +
                                 moment(req.Data.AppointmentDate).format(dateformat) + 'at' + req.Data.StartTime +
                                  '- Thanks Hospital Management - ' + this.Session.FacilityName + '.',
                                BodyParameter: [vDoctorName, vPatientName, moment(req.Data.AppointmentDate).format(dateformat),
                                     req.Data.StartTime, this.Session.FacilityName]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the appointmentschedule');
                        } else if(req.Data.AppointmentStatusId === 5) {
                            let data = {
                                TemplateName: 'drptappointcancel',
                                ToNumbersWithCountryCode: UserData.Mobile,
                                msg: 'Dear' + vDoctorName + ', Appointment with' + vPatientName + 'on' +
                                 moment(req.Data.AppointmentDate).format(dateformat) + 'at' + req.Data.StartTime +
                                  'has been cancelled-Sorry for the inconvienience. Thanks Hospital Management-' +
                                   this.Session.FacilityName + '.',
                                BodyParameter: [vDoctorName, vPatientName, moment(req.Data.AppointmentDate).format(dateformat),
                                     req.Data.StartTime, this.Session.FacilityName]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the appointmentcancel');
                        }
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vDoctorName = '';
                        vDoctorName = await this.getDoctorNamewoTit(UserData);
                        let dateformat = 'DD/MM/YYYY';
                        if (req.Data.AppointmentStatusId === 2) {
                            let data = {
                                template: 'drpatientappointment',
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                date: moment(req.Data.AppointmentDate).format(dateformat),
                                time: req.Data.StartTime,
                                Mobile: UserData.Mobile,
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes,'here is the championDRappointmentschedule');
                        } else if (req.Data.AppointmentStatusId === 4) {
                            let data = {
                                template: 'drpatientappointmentreschedule',
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                date: moment(req.Data.AppointmentDate).format(dateformat),
                                time: req.Data.StartTime,
                                Mobile: UserData.Mobile,
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the ChampionAppointmentDRReschedule');
                        }
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                        try {
                            let vPatientName = '';
                            vPatientName = await this.getPatientName(patientData);
                            let vDoctorName = '';
                            vDoctorName = await this.getDoctorNamewoTit(UserData);
                            let dateformat = 'DD/MM/YYYY';
                            if (req.Data.AppointmentStatusId === 2) {
                                let data = {
                                    TemplateName: 'opdapptdr',
                                    mobile: UserData.Mobile,
                                    BodyParameter: [vDoctorName, vPatientName, patientData.MRN,
                                         moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime]
                                };
                                const whatsApp = new WhatsappNotificationService();
                                let msgRes = await whatsApp.sendMessage(data);
                                console.log(msgRes, 'here is the JssDRappointmentschedule');
                            } else if (req.Data.AppointmentStatusId === 4) {
                                let data = {
                                    TemplateName: 'opdappresdr',
                                    mobile: UserData.Mobile,
                                    BodyParameter: [vDoctorName, vPatientName, patientData.MRN,
                                         moment(req.Data.AppointmentDate).format(dateformat) + ' ' + req.Data.StartTime]
                                };
                                const whatsApp = new WhatsappNotificationService();
                                let msgRes = await whatsApp.sendMessage(data);
                                console.log(msgRes, 'here is the JssAppointmentDRReschedule');
                            } else if (req.Data.AppointmentStatusId === 5) {
                                let data = {
                                    TemplateName: 'opdappcanc',
                                    mobile: UserData.Mobile,
                                    BodyParameter: [vPatientName, moment(req.Data.AppointmentDate).format(dateformat)
                                        + ' ' + req.Data.StartTime]
                                };
                                const whatsApp = new WhatsappNotificationService();
                                let msgRes = await whatsApp.sendMessage(data);
                                console.log(msgRes, 'here is the JssDrAppointmentCancel');
                            }
                        } catch (error) {
                            console.log('Error Processing messages:', error);
                        }
                    }
                }
            }
        }
        return true;
    }

    public async UpdateAppointment(req: BaseRequest): Promise<boolean> {
        let OrderId: any;
        let pbillId: any;
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        if (req.Data.AppointmentStatusId === 6) {
            if (!await encounterBO.CanCreateEncounter(req)) {
                return false;
            }
        }
        // if (await encounterBO.CanCreateEncounter(req)) {
        // let patbillBO = BoFactory.GetBo(billbo.PatientBillsBo, this.Request);
        //await encounterBO.ManageAppEncounter(req);
        // if (req.Data.AppointmentStatusId === 6 && !req.Data.VirtualOrderId) {
        //     OrderId = await this.AddVirtualOrder(req);
        //     req.Data.VirtualOrderId = OrderId;
        // }
        if (req.Data.AppointmentStatusId === 6) {//Included on 30/9/2024 - Jothi
            let AppDispBo = BoFactory.GetBo(apptbo.AppointmentDisplayBo, this.Request);
            let TokenNo = await AppDispBo.GetDRLastTokenCount(req.Data.DoctorId);
            let appData: any = {
                Id: req.Data.AppointmentDisplayId,
                TokenNo: TokenNo,
                TokenStatusId: 1
            };
            await AppDispBo.Update(appData);
        }
        let patientGuarantorBO = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
        let listReq: any = {};
        listReq = {
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId }]
        };
        let listRes = await patientGuarantorBO.GetPatientGuarantors(listReq);
        if (listRes.Data.length > 0) {
            let patGuar = listRes.Data[0];
            req.Data.GuarantorTypeId = patGuar.GuarantorTypeId;
            req.Data.GuarantorId = patGuar.GuarantorId;
        }
        let encId = await encounterBO.ManageUpdateEncounter(req, OrderId);
        let oldData = await this.GetAppointmentById({Id: req.Data.Id});
        console.log('olddatas',oldData);
        if (oldData) {
            const { AppointmentDate, StartTime } = oldData;

            req.Data.OldAppointmentDate = AppointmentDate;
            req.Data.OldStartTime = StartTime;
        }
        if (req.Data.AppointmentStatusId > 1) {
            await this.sendAppointmentSMS(req);
            await this.sendConfirmDrAppointmentSMS(req);
        }
        let result = await this.Update(req.Data);
        if (req.Data.OrderConsultTypeId === 2 && req.Data.AppointmentStatusId === 6) {
            await this.AddConferenceData(req, encId, OrderId);
        }
        if (req.Data.VirtualOrderId) {
            //pbillId = await patbillBO.AddClinicDraftBills(req);
        }
        if (req.Data.IsRescheduled && req.Data.AppointmentStatusId === 2
            && req.Data.VirtualOrderId) {
            let voBo = BoFactory.GetBo(vhCarebo.VirtualOrderBo, this.Request);
            let vorderData: any = {
                Id: req.Data.VirtualOrderId,
                OrderScheduleDate: req.Data.AppointmentDate,
                StartTime: req.Data.StartTime,
                EndTime: req.Data.EndTime
            };
            await voBo.Update(vorderData);
        }
        if (pbillId && req.Data.PaymentModeId) {
            req.Data.IsPaid = true;
            await this.Update(req.Data);
        }
        const userBO = BoFactory.GetBo(Userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken && req.Data.AppointmentStatusId === 4)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', your appointment is rescheduled on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        if (doctorData && (doctorData.NotificationToken && req.Data.AppointmentStatusId === 5)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', Your appointment with ' + patient.FirstName + ', ' + patient.LastName + ' has cancelled on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
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
        if (patient && (patient.NotificationToken && req.Data.AppointmentStatusId === 5)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', your appointment is cancelled on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        if (patient && (patient.NotificationToken && req.Data.AppointmentStatusId === 6)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', you have checked in your appointment on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        await this.UpdateAppointmentRequestStatus(req.Data.Id,
            req.Data.AppointmentStatusId);

        return result;
        // } else {
        //         return false;
        //     }
    }

    public async AddVirtualOrder(req: BaseRequest): Promise<any> {
        let OrderDataHeader: any = {
            Id: 0,
            FacilityId: req.Data.FacilityId,
            VirtualCategoryId: -1,
            VirtualSubCategoryId: -1,
            CategoryTypeId: 1,
            PatientId: req.Data.PatientId,
            PatientMRN: req.Data.PatientMRN,
            PatientName: req.Data.PatientName,
            DoctorId: req.Data.DoctorId,
            DoctorName: req.Data.DoctorName,
            VirtualOrderStatusId: 3,
            OrderRequestDate: req.Data.AppointmentDate,
            FromDate: req.Data.FromDate,
            ToDate: req.Data.ToDate,
            OrderScheduleDate: req.Data.AppointmentDate,
            AppointmentDate: req.Data.AppointmentDate,
            StartTime: req.Data.StartTime,
            EndTime: req.Data.EndTime,
            AppointmentId: req.Data.Id,
            OrderConsultTypeId: 2,
            OrderTotal: req.Data.OrderTotal,
            Details: req.Data.Details
        };
        let voBo = BoFactory.GetBo(vhCarebo.VirtualOrderBo, this.Request);
        let generateTransaction = 0;
        if (!OrderDataHeader.OrderNumber && OrderDataHeader.VirtualOrderStatusId === 1) {
            OrderDataHeader.OrderNumber = null;
            generateTransaction = 1;
        }

        let result = await voBo.Save(OrderDataHeader);
        let OrderId = result.dataValues.Id;
        if (generateTransaction === 1) {
            try {
            this.deferSequenceKey(OrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualOrderId));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }
        if (OrderDataHeader.Details) {
            let detailBO = BoFactory.GetBo(vhCarebo.VirtualOrderDetailBo, this.Request);
            await detailBO.ManageVirtualOrderDetail(OrderId, OrderDataHeader.Details);
        }
        return OrderId;
    }

    public async AddConferenceData(req: BaseRequest, encId: number, OrderId: number): Promise<any> {
        let conferenceData: any = {
            Data: {
                Id: 0,
                OrganizationId: this.Session.OrgId,
                FacilityId: this.Session.FacilityId,
                ConferenceScheduleDate: req.Data.AppointmentDate,
                PatientId: req.Data.PatientId,
                EncounterId: encId,
                OrderId: OrderId,
                AppointmentId: req.Data.Id,
                ParticipantTypeId: 2,
                ConferenceName: 'Online Consultation',
                ConferenceDate: req.Data.AppointmentDate,
                ConferenceTime: req.Data.StartTime,
                Duration: 15,
                AllowRecording: false,
                Description: 'TeleConsultation',
                DoctorId: req.Data.DoctorId,
                DoctorName: req.Data.DoctorName,
                StartTime: req.Data.StartTime,
                EndTime: req.Data.EndTime,
                ConferenceStatusId: 2,
                IsActive: false,
                LockSettingsDisablePrivateChat: true,
                LockSettingsDisableCam: true,
                WebcamsOnlyForModerator: true,
            }
        };
        let confBO = BoFactory.GetBo(vhCarebo.VirtualConferenceBo, this.Request);
        let conferenceId = await confBO.AddVirtualConference(conferenceData);

        let ConfPartData: any = {
            Data: {
                OrganizationId: this.Session.OrgId,
                FacilityId: this.Session.FacilityId,
                ConferenceId: conferenceId,
                ParticipantName: req.Data.PatientName,
                ParticipantUserId: req.Data.PatUserId,
                DoctorId: req.Data.DoctorId,
                IsActive: true
            }
        };
        let confpartBO = BoFactory.GetBo(vhCarebo.VirtualConferenceParticipantBo, this.Request);
        await confpartBO.AddVirtualConferenceParticipant(ConfPartData);
    }

    public async UpdateIsMRDFileRequest(ApptId: number): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { IsMrdFileRequest: true };
        await this.Update(orderUpdate, {
            fields: ['IsMrdFileRequest'],
            where: {
                Id: ApptId
            }
        });
        return result;
    }


    public async GetAppointmentById(req: BaseRequest): Promise<AppointmentAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AppointmentStatus'));
        include.push({
            model: this.Models.AppointmentDisplay, required: false,
            attributes: ['Id', 'TokenStatusId'],
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        let result = await this.GetById(req.Id, { include: include });
        // let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCheckedInAppointments(): Promise<AppointmentAttributes[]> {
        let instances = await this.FindAll({
            where: {
                AppointmentStatusId: 6
            },
            attributes: ['Id', 'PatientId']
        });

        return this.GetAttributes(instances);
    }

    public async GetAppointments(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: [
                'FirstName', 'LastName', 'MRN', 'Age',
                'MRNTypeId', 'TitleId', 'GenderId', 'Mobile', 'DOB', 'AddressLine1', 'AddressLine2', 'Area', 'City', 'State', 'Country',
                'LandLine', 'NationalityIdentifier'
            ],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.AppointmentCategory, attributes: ['Name', 'Color'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'OPDRoomId', 'QmsLocationId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.AppointmentDisplay, required: false,
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        include.push({ model: this.Models.ResourceMaster, attributes: ['ResourceName'], required: false });
        include.push({ model: this.Models.Remark, attributes: ['Remarks'], required: false });
        include.push({ model: this.Models.PatientGuarantor, attributes: ['GuarantorName'], required: false });
        include.push({ model: this.Models.Referral, attributes: ['ReferralName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.VirtualOrder,
            include: [this.GetReference('OrderConsultType')],
            required: false
        });
        include.push(this.GetReference('AppointmentStatus', ['Description', 'ColorCode']));
        include.push(this.GetReference('AppointmentType'));
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('VisitType'));
        include.push(this.GetReference('PaymentMode'));
        include.push(this.GetReference('OrderConsultType'));
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate',
                'DischargeDate', 'EncounterId', 'IsBillCompleted'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedByUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentType:
                        where['AppointmentTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Doctor:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DoctorId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.Resource:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ResourceId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AppointmentStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentDate:
                        where['AppointmentDate'] = param.Value;
                        break;
                    case AppointmentFilters.From:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$gte'] = param.Value;
                        break;
                    case AppointmentFilters.To:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$lte'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentCategory:
                        where['AppointmentCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.VisitType:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Priority:
                        where['PriorityId'] = param.Value;
                        break;
                    case AppointmentFilters.Referral:
                        where['ReferralId'] = param.Value;
                        break;
                    case AppointmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AppointmentFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } };
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.MRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.IsMrdFileRequest:
                        where['IsMrdFileRequest'] = param.Value;
                        break;
                    case AppointmentFilters.MRNTypeId:
                        patientWhere['MRNTypeId'] = 2;
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case AppointmentFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.IsVirtualAppointments:
                        where['IsVirtualAppointments'] = param.Value;
                        break;
                    case AppointmentFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.IsPaid:
                        where['IsPaid'] = param.Value;
                        break;
                    case AppointmentFilters.PaymentModeId:
                        where['PaymentModeId'] = param.Value;
                        break;
                    case AppointmentFilters.OrderConsultTypeId:
                        where['OrderConsultTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.graeaterDoc:
                        where['DoctorId'] = { '$gt': param.Value };
                        break;
                    case AppointmentFilters.IsRescheduled:
                        where['IsRescheduled'] = param.Value;
                        break;
                    case AppointmentFilters.caldoctor:
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
                    case AppointmentFilters.calappointmeentstatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',').map(Number);
                            } else {
                                paramArr = [Number(param.Value)];
                            }
                            paramArr = paramArr.filter(x => x !== -1);
                            if (paramArr.length > 0) {
                                where['AppointmentStatusId'] = { '$in': paramArr };
                            }
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['AppointmentDate', 'ASC'], ['StartTime', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetDashboardAppointments(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: [
                'FirstName', 'LastName', 'MRN', 'Age',
                'MRNTypeId', 'TitleId', 'GenderId', 'Mobile', 'DOB', 'AddressLine1', 'AddressLine2', 'Area', 'City', 'State', 'Country',
                'LandLine', 'NationalityIdentifier'
            ],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'OPDRoomId', 'QmsLocationId'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentType:
                        where['AppointmentTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Doctor:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DoctorId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.Resource:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ResourceId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AppointmentStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentDate:
                        where['AppointmentDate'] = param.Value;
                        break;
                    case AppointmentFilters.From:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$gte'] = param.Value;
                        break;
                    case AppointmentFilters.To:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$lte'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentCategory:
                        where['AppointmentCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.VisitType:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Priority:
                        where['PriorityId'] = param.Value;
                        break;
                    case AppointmentFilters.Referral:
                        where['ReferralId'] = param.Value;
                        break;
                    case AppointmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AppointmentFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } };
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.MRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.IsMrdFileRequest:
                        where['IsMrdFileRequest'] = param.Value;
                        break;
                    case AppointmentFilters.MRNTypeId:
                        patientWhere['MRNTypeId'] = 2;
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case AppointmentFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.IsVirtualAppointments:
                        where['IsVirtualAppointments'] = param.Value;
                        break;
                    case AppointmentFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.IsPaid:
                        where['IsPaid'] = param.Value;
                        break;
                    case AppointmentFilters.PaymentModeId:
                        where['PaymentModeId'] = param.Value;
                        break;
                    case AppointmentFilters.OrderConsultTypeId:
                        where['OrderConsultTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.graeaterDoc:
                        where['DoctorId'] = { '$gt': param.Value };
                        break;
                    case AppointmentFilters.IsRescheduled:
                        where['IsRescheduled'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['AppointmentDate', 'DESC'], ['StartTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetAppointmentswithoutDetail(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: [
                'FirstName', 'LastName', 'MRN', 'Age',
                'MRNTypeId', 'TitleId', 'GenderId', 'Mobile', 'DOB', 'AddressLine1', 'AddressLine2', 'Area', 'City', 'State', 'Country',
                'LandLine', 'NationalityIdentifier'
            ],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.AppointmentCategory, attributes: ['Name', 'Color'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'OPDRoomId', 'QmsLocationId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['TitleId','FirstName', 'LastName'],as:'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.AppointmentDisplay, required: false,
        //     include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        // });
        // include.push({ model: this.Models.ResourceMaster, attributes: ['ResourceName'], required: false });
        include.push({ model: this.Models.Remark, attributes: ['Remarks'], required: false });
        // include.push({ model: this.Models.PatientGuarantor, attributes: ['GuarantorName'], required: false });
        // include.push({ model: this.Models.Referral, attributes: ['ReferralName'], required: false });
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        // include.push({
        //     model: this.Models.VirtualOrder,
        //     include: [this.GetReference('OrderConsultType')],
        //     required: false
        // });
        include.push(this.GetReference('AppointmentStatus', ['Description', 'ColorCode']));
        include.push(this.GetReference('AppointmentType'));
        // include.push(this.GetReference('Priority'));
        include.push(this.GetReference('VisitType'));
        // include.push(this.GetReference('PaymentMode'));
        // include.push(this.GetReference('OrderConsultType'));
        // include.push({
        //     model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate',
        //         'DischargeDate', 'EncounterId', 'IsBillCompleted'], required: false,
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedByUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentType:
                        where['AppointmentTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Doctor:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DoctorId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.Resource:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ResourceId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AppointmentStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.AppointmentDate:
                        where['AppointmentDate'] = param.Value;
                        break;
                    case AppointmentFilters.From:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$gte'] = param.Value;
                        break;
                    case AppointmentFilters.To:
                        where['AppointmentDate'] = where['AppointmentDate'] || {};
                        (where['AppointmentDate'] as any)['$lte'] = param.Value;
                        break;
                    case AppointmentFilters.AppointmentCategory:
                        where['AppointmentCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.VisitType:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.Priority:
                        where['PriorityId'] = param.Value;
                        break;
                    case AppointmentFilters.Referral:
                        where['ReferralId'] = param.Value;
                        break;
                    case AppointmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AppointmentFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } };
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.MRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.IsMrdFileRequest:
                        where['IsMrdFileRequest'] = param.Value;
                        break;
                    case AppointmentFilters.MRNTypeId:
                        patientWhere['MRNTypeId'] = 2;
                        patientQryJoin['required'] = true;
                        break;
                    case AppointmentFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case AppointmentFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentFilters.IsVirtualAppointments:
                        where['IsVirtualAppointments'] = param.Value;
                        break;
                    case AppointmentFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case AppointmentFilters.IsPaid:
                        where['IsPaid'] = param.Value;
                        break;
                    case AppointmentFilters.PaymentModeId:
                        where['PaymentModeId'] = param.Value;
                        break;
                    case AppointmentFilters.OrderConsultTypeId:
                        where['OrderConsultTypeId'] = param.Value;
                        break;
                    case AppointmentFilters.graeaterDoc:
                        where['DoctorId'] = { '$gt': param.Value };
                        break;
                    case AppointmentFilters.IsRescheduled:
                        where['IsRescheduled'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['AppointmentDate', 'DESC'], ['StartTime', 'DESC']);
        apiReq.Attributes = ['Id', 'AppointmentDate', 'FacilityId',
            'AppointmentStatusId', 'AppointmentTypeId', 'AppointmentCategoryId', 'StartTime',
            'EndTime', 'DoctorId', 'PatientId', 'VisitTypeId', 'DepartmentId', 'IsForceBooking',
            'CreatedAt','CreatedBy', 'ReferralId', 'ReferralTypeId'];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetAppointmentWithFileLocation(apiReq?: ApiRequest<AppointmentFilters>):
        Promise<ApiResponse<AppointmentAttributes[]>> {
        let Appointmentsdata: any = null;
        Appointmentsdata = await this.GetAppointments(apiReq);
        for (let kk = 0, len = Appointmentsdata.Data.length; kk < len; kk++) {
            Appointmentsdata.Data[kk].FileLocation = null;
            let Appointmentdata = Appointmentsdata.Data[kk];
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: MRDLocationFilters.PatientId, Value: Appointmentdata.PatientId }]
            };
            let MRDLocBo = BoFactory.GetBo(mrdlocbo.MRDLocationBo, this.Request);
            let CurrentFileLocation = await MRDLocBo.GetMRDLocations(apiReq);
            if (CurrentFileLocation && CurrentFileLocation.Data &&
                CurrentFileLocation.Data.length > 0) {
                let Data: any = CurrentFileLocation.Data[0];
                if (Data && Data.FileLocation && Data.FileLocation.DepartmentName)
                    Appointmentsdata.Data[kk].FileLocation = Data.FileLocation.DepartmentName;
            }
        }
        return Appointmentsdata;
    }

    public async DeleteAppointment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintAppointment(req: BaseRequest): Promise<FileInfo> {
        // let BillNumber = req.Data.BillNumber;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AppointmentFilters.Id, Value: req.Id }]
        };
        let adapiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AppointmentDisplayFilters.AppointmentId, Value: req.Id }]
        };
        let data = await this.GetAppointments(apiReq);
        let AppointmentDisplaybo = BoFactory.GetBo(apptbo.AppointmentDisplayBo, this.Request);
        let AppointmentDisplay =
            await AppointmentDisplaybo.GetAppointmentDisplays(adapiReq);
        let AppointmentDisplays = AppointmentDisplay.Data[0];
        let Appointment = data.Data[0];
        let Appointmentdate = data.Data[0].AppointmentDate;
        let VisitDate = moment(Appointmentdate).format('DD/MM/YYYY');
        console.log(VisitDate, 'VisitDate');
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Appointment.PatientId });
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: Appointment.DoctorId }]
        };
        let userBo = BoFactory.GetBo(Userbo.UserBo, this.Request);
        let userData = await userBo.GetUsers(userReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.AppointmentId, Value: Appointment.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let EncInfo = encounterData.Data[0];
        let billReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: EncInfo.Id }]
        };
        let billBO = BoFactory.GetBo(billbo.PatientBillsBo, this.Request);
        let billData = await billBO.GetPatientBills(billReq);
        let BillNumber: any = '';
        if (billData.Data.length > 0) {
            let BillInfo = billData.Data[0];
            BillNumber = BillInfo.BillNumber;
        }
        let vitalReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVitalFilters.PatientId, Value: Appointment.PatientId },
            { Key: PatientVitalFilters.EncounterId, Value: encounterData.Data[0].Id }]
        };
        let patientvitalBo = BoFactory.GetBo(Vitalbo.PatientVitalBo, this.Request);
        let patientvitalData = await patientvitalBo.GetPatientVitals(vitalReq);
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Appointment.FacilityId);
        let info = {
            Appointment: Appointment,
            VisitDate: VisitDate,
            BillNumber: BillNumber,
            AppointmentDisplay: AppointmentDisplays,
            Patient: patientData,
            Encounter: encounterData.Data[0],
            user: userData.Data[0],
            patientvital: patientvitalData.Data,
            Preferences: printPreferencesData
        };
        let key = 'opvisit';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.1in',
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
    public async PrintAppointmentScheduleReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        let data = await this.GetAppointments(apiReq);
        let Schedule = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let ScheduleData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ScheduleData.FacilityId);
        let info = {
            Schedule: Schedule,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'appointmentschedulereport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
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
    public async PrintAppointmentCancelledReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        let data = await this.GetAppointments(apiReq);
        let Cancelled = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let CancelledData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CancelledData.FacilityId);
        let info = {
            Cancelled: Cancelled,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'appointmentcancelledreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintAppointmentReScheduleReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        let data = await this.GetAppointments(apiReq);
        let ReSchedule = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let ReScheduleData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ReScheduleData.FacilityId);
        let info = {
            ReSchedule: ReSchedule,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'appointmentreschedulereport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintAppointmentPatientfromAppReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        let data = await this.GetAppointments(apiReq);
        let AppointmentPatientfromApp = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let AppointmentPatientfromAppData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AppointmentPatientfromAppData.FacilityId);
        let info = {
            AppointmentPatientfromApp: AppointmentPatientfromApp,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'appointmentpatientfromappreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintVideoConsultationPatientList(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        let data = await this.GetAppointments(apiReq);
        let VideoConsultation = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let VideoConsultationData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VideoConsultationData.FacilityId);
        let info = {
            VideoConsultation: VideoConsultation,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'videoconsultationpatientlist';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'appointment':
    //             count = await this.Items.count({
    //                 where: {
    //                     'AppointmentStatusId': { '$in': [2] },  //SCHEDULED, CONFIRMED, CHECKEDIN
    //                     'DoctorId': this.GetSession().UserId
    //                 }
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { appointment: count };
    // }

    // public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
    //     let appointmentCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'AppointmentStatusId': { '$in': [2] },
    //             'DoctorId': req.Data.DoctorId,
    //             'CreatedAt': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
    //         }
    //     });
    //     return {
    //         'appoinmentCount': appointmentCount,
    //     };
    // }

    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let appointmentCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [2, 6] },
                //'DoctorId': req.Data.DoctorId,
                'AppointmentTypeId': { '$in': [1] },
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let TodayScheduledCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [2] },
                'AppointmentTypeId': { '$in': [1] },
                // 'DoctorId': req.Data.DoctorId,
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let TodayCheckInCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [6] },
                'AppointmentTypeId': { '$in': [1] },
                // 'DoctorId': req.Data.DoctorId,
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let TodayCancelledCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [5] },
                'AppointmentTypeId': { '$in': [1] },
                // 'DoctorId': req.Data.DoctorId,
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let TodayNoShownCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [12] },
                'AppointmentTypeId': { '$in': [1] },
                // 'DoctorId': req.Data.DoctorId,
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        let TodayCheckOutCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [11] },
                'AppointmentTypeId': { '$in': [1] },
                // 'DoctorId': req.Data.DoctorId,
                'FacilityId': { '$in': [req.Data.FacilityId] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        return {
            'appoinmentCount': appointmentCount,
            'TodayScheduledCount': TodayScheduledCount,
            'TodayCheckInCount': TodayCheckInCount,
            'TodayCancelledCount': TodayCancelledCount,
            'TodayNoShownCount': TodayNoShownCount,
            'TodayCheckOutCount': TodayCheckOutCount,
        };
    }
    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let appointmentCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [2, 3] },
                'AppointmentDate': moment(req.Data.FromDate),
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': { '$in': [1, null] },
            }
        });
        let followupCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [6] },
                'AppointmentDate': moment(req.Data.FromDate),
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': 2
            }
        });
        return {
            'AppointmentCount': appointmentCount,
            'FollowupCount': followupCount
        };
    }

    public async GetFacilityVirtualDashBoard(req: BaseRequest): Promise<any> {
        let todayCount = await this.Items.count({
            where: {
                'Status': 1,
                // 'AppointmentStatusId': { '$in': [2, 3] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'DoctorId': req.Data.DoctorId,
            }
        });
        // let pendingCount = await this.Items.count({
        //     where: {
        //         'Status': 1,
        //         'AppointmentStatusId': { '$in': [2, 6] },
        //         'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
        //         'FacilityId': req.Data.FacilityId,
        //         'DoctorId': req.Data.DoctorId,
        //     }
        // });
        // let completedCount = await this.Items.count({
        //     where: {
        //         'Status': 1,
        //         'AppointmentStatusId': { '$in': [11] },
        //         'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
        //         'FacilityId': req.Data.FacilityId,
        //         'DoctorId': req.Data.DoctorId,
        //     }
        // });
        let cancelledCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [5] },
                'AppointmentDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'TodayCount': todayCount,
            // 'PendingCount': pendingCount,
            // 'CompletedCount': completedCount,
            'CancelledCount': cancelledCount
        };
    }
    public GetModel(): SStatic.Model<AppointmentInstance, AppointmentAttributes> {
        return this.Models.Appointment;
    }
    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let checkedinpatientcount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [6] },
            }
        });
        let appoinmentCount = await this.Items.count({
            where: {
                'Status': 1,
                'AppointmentStatusId': { '$in': [2, 3] },
            }
        });
        return {
            'checkedinpatientcount': checkedinpatientcount,
            'appoinmentCount': appoinmentCount
        };
    }

    public async AddDummyAppointment(req: BaseRequest): Promise<number> {
        if (!req.Data.Id) {

            let result = await this.Save(req.Data);
            let AppointmentId = result.dataValues.Id;
            return AppointmentId;
        }
        return -1;
    }
}
