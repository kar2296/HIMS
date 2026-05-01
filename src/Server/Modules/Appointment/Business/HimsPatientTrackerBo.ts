import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientTrackerInstance, PatientTrackerAttributes } from '../Model/Interface/Index';
import { PatientTrackerFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as appbo from './Index';
import * as vhcarebO from '../../VirtualHealthcare/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { PatientAttributes } from '../../Registration/Model/Interface/Index';
import * as regbo from '../../Registration/Business/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import * as moment from 'moment';
import * as Referral from '../../GeneralMaster/Business/Index';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';

export class PatientTrackerBo extends BaseBo<PatientTrackerInstance, PatientTrackerAttributes>  {
    public async AddPatientTracker(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientTracker(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientTrackerById(req: BaseRequest): Promise<PatientTrackerAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientTrackers(apiReq?: ApiRequest<PatientTrackerFilters>): Promise<ApiResponse<PatientTrackerAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ReferrerClinicalStatus'));
        include.push(this.GetReference('FollowupTrackerStatus'));
        include.push({
            model: this.Models.User, as: 'AttendUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient, required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Department, as: 'Department', attributes: ['DepartmentId', 'DepartmentName'], required: false
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientTrackerFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientTrackerFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case PatientTrackerFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case PatientTrackerFilters.ConsultationId:
                    where['ConsultationId'] = param.Value;
                    break;
                case PatientTrackerFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case PatientTrackerFilters.FollowupAppointmentOn:
                    where['FollowupAppointmentOn'] = { '$between': param.Value || '' };
                    break;
                case PatientTrackerFilters.IsDischargeMedication:
                    where['IsDischargeMedication'] = param.Value;
                    break;
                case PatientTrackerFilters.TrackerStatusId:
                    where['TrackerStatusId'] = param.Value;
                    break;
                case PatientTrackerFilters.DepartmentId:
                    where['AssignedUserDepartmentId'] = param.Value;
                    break;
                case PatientTrackerFilters.FollowupTrackerStatusId:
                    where['FollowupTrackerStatusId'] = param.Value;
                    break;
                case PatientTrackerFilters.From:
                    where['FollowupAppointmentOn'] = where['FollowupAppointmentOn'] || {};
                    (where['FollowupAppointmentOn'] as any)['$gte'] = param.Value;
                    break;
                case PatientTrackerFilters.To:
                    where['FollowupAppointmentOn'] = where['FollowupAppointmentOn'] || {};
                    (where['FollowupAppointmentOn'] as any)['$lte'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientTracker(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async SendSMSNotifications(req: BaseRequest): Promise<any> {
        let result: any;
        for (let idx in req.Data) {
            let smsInfo = req.Data[idx];
            let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let facBO = BoFactory.GetBo(userbo.FacilityBo, this.Request);
            let patientData = await patientBO.GetPatientById({ Id: smsInfo.PatientId });
            let facData = await facBO.GetFacilityById({ Id: smsInfo.FacilityId });
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('FollowupAppointment', 'FollowupAppointmentConfirmation', 1);
            let smsmodel: any = {};
            if (smsTemplateInfo) {
                let vPatientName = '';
                vPatientName = await this.getPatientName(patientData);
                let dateformat = 'DD/MM/YYYY';
                smsmodel = {
                    numbers: [patientData.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        {
                            patientName: vPatientName,
                            doctorName: smsInfo.AssignedUserName,
                            facilityName: facData.FacilityName,
                            displaydate: moment(smsInfo.FollowupAppointmentOn).format(dateformat),
                        })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    let res = await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' +
                        patientData.Mobile);
                    if (res) {
                        let updateInfo: any = {
                            Id: smsInfo.Id,
                            IsSMSNotified: true
                        };
                        await this.Update(updateInfo);
                    }
                }
            }
            let alertBO = BoFactory.GetBo(Referral.PatientAlertBo, this.Request);
            let alertData: any = {
                Data: {
                    Id: 0,
                    PatientId: req.Data.PatientId,
                    AlertDescription: smsmodel.message,
                    Status: 1
                }
            };
            await alertBO.AddPatientAlert(alertData);
            return true;
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
            let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
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

    public async CheckinPatient(req: BaseRequest): Promise<number> {
        let checkinInfo: any = req.Data;
        let trackerInfo: any = {
            PrevAppointmentId: null,
            ParentTrackId: null,
            PatientId: checkinInfo.PatientId,
            AppointmentId: checkinInfo.Id,
            AppointmentName: null,
            EncounterId: checkinInfo.EncounterId,
            DoctorId: checkinInfo.AssignedUserId,
            FacilityId: null,
            AssignedRoomId: null,
            AssignedRoomName: null,
            AssignedGroupId: null,
            AssignedGroupName: null,
            AssignedUserId: checkinInfo.IsAssignedToUser ? checkinInfo.AssignedUserId : null,
            AssignedUserName: checkinInfo.IsAssignedToUser ? checkinInfo.AssignedUserName : null,
            AssignedDate: new Date(),
            AttendUserId: null,
            AttendUserName: null,
            CalledTime: null,
            AttendTime: null,
            AttendingRoomId: null,
            AttendingRoomName: null,
            TrackerStatusId: 2, //TrackerStatus.Assign
            TrackerComments: null,
            FollowupAppointmentOn: null,
            IncludeReviewNotes: 0,
            LagInMins: null
        };
        let result = await this.Save(trackerInfo);
        return result.dataValues.Id;
    }

    public async AttendPatient(req: BaseRequest): Promise<number> {
        let attendInfo: any = req.Data;
        if (req.Data.appointmentDisplay && req.Data.appointmentDisplay.TokenStatusId === 2) {
            let AppDispBo = BoFactory.GetBo(appbo.AppointmentDisplayBo, this.Request);
            let AppointmentDispData: any = {
                Id: req.Data.appointmentDisplay.AppointmentDisplayId,
                TokenStatusId: 3,
            };
            await AppDispBo.Update(AppointmentDispData);
        }

        let trackerInfo: any = {
            PrevAppointmentId: null,
            ParentTrackId: null,
            PatientId: attendInfo.PatientId,
            AppointmentId: attendInfo.AppointmentId,
            AppointmentName: null,
            EncounterId: null,
            DoctorId: null,
            FacilityId: null,
            AssignedRoomId: null,
            AssignedRoomName: null,
            AssignedGroupId: null,
            AssignedGroupName: null,
            AssignedUserId: this.Session.UserId,
            AssignedUserName: this.Session.UserName,
            AssignedDate: new Date(),
            AttendUserId: this.Session.UserId,
            AttendUserName: this.Session.UserName,
            CalledTime: null,
            AttendTime: new Date(),
            AttendingRoomId: null,
            AttendingRoomName: null,
            TrackerStatusId: 1, //TrackerStatus.Attend
            TrackerComments: null,
            FollowupAppointmentOn: null,
            IncludeReviewNotes: 0,
            LagInMins: null
        };
        let result = await this.Save(trackerInfo);

        let encDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encDocBO.AttendEncounterDoctor(req);
        if (req.Data.oid) {
            let vhBO = BoFactory.GetBo(vhcarebO.VirtualOrderBo, this.Request);
            await vhBO.UpdateOrderWhileattend(req);
        }
        return result.dataValues.Id;
    }

    public async AssignPatient(req: BaseRequest): Promise<number> {
        let assignInfo: any = req.Data;
        if (assignInfo.IsTracker === 1) {
            let tracker: any = {
                Id: assignInfo.PatientTrackerId,
                TrackerNotes: assignInfo.TrackerNotes,
                TrackerComments: assignInfo.TrackerComments,
                FollowupAppointmentOn: assignInfo.FollowupAppointmentOn || null,
            };
            await this.Update(tracker);
            return 1;
        } else {
            let trackerInfo: any = {
                PrevAppointmentId: null,
                ParentTrackId: null,
                PatientId: assignInfo.PatientId,
                AppointmentId: assignInfo.AppointmentId,
                AppointmentName: null,
                //EncounterId: null,
                EncounterId: (assignInfo.EncounterId) ? assignInfo.EncounterId : '',
                DoctorId: null,
                FacilityId: assignInfo.FacilityId,
                AssignedRoomId: null,
                AssignedRoomName: null,
                AssignedGroupId: assignInfo.AssignedGroupId || null,
                AssignedUserDepartmentId: assignInfo.AssignedUserDepartmentId || null,
                AssignedGroupName: assignInfo.AssignedGroupName || null,
                AssignedUserId: assignInfo.AssignedUserId || null,
                AssignedUserName: assignInfo.AssignedUserName || null,
                Duration: assignInfo.Duration || null,
                DurationPeriodId: assignInfo.DurationPeriodId || null,
                AssignedDate: new Date(),
                AttendUserId: null,
                AttendUserName: null,
                CalledTime: null,
                AttendTime: null,
                AttendingRoomId: null,
                AttendingRoomName: null,
                TrackerStatusId: 2, //TrackerStatus.Assign
                TrackerComments: assignInfo.TrackerComments,
                TrackerNotes: assignInfo.TrackerNotes,
                FollowupAppointmentOn: assignInfo.FollowupAppointmentOn || null,
                IncludeReviewNotes: assignInfo.IncludeReviewNotes || 0,
                LagInMins: null
            };
            let result = await this.Save(trackerInfo);

            //encounterdoctor assign
            // let encDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
            // await encDocBO.AssignEncounterDoctor(req);

            return result.dataValues.Id;
        }
    }

    public async OPAutoCheckout(req: BaseRequest): Promise<boolean> {
        let details: Array<any> = req.Data;
        for (let ch = 0; ch < details.length; ch++) {
            let checkoutInfo = details[ch];

            checkoutInfo.AppointmentId = checkoutInfo.AppointmentId || 0;
            if (checkoutInfo.AppointmentId) {
                //close tracker
                let trackerInfo: any = {
                    PrevAppointmentId: null,
                    ParentTrackId: null,
                    PatientId: checkoutInfo.PatientId || -1,
                    AppointmentId: checkoutInfo.AppointmentId,
                    AppointmentName: null,
                    EncounterId: checkoutInfo.EncounterId || -1,
                    DoctorId: checkoutInfo.DoctorId || -1,
                    FacilityId: null,
                    AssignedRoomId: null,
                    AssignedRoomName: null,
                    AssignedGroupId: null,
                    AssignedGroupName: null,
                    AssignedUserId: null,
                    AssignedUserName: null,
                    AssignedDate: null,
                    AttendUserId: this.Session.UserId || 12345,
                    AttendUserName: 'CRON',
                    CalledTime: null,
                    AttendTime: new Date(),
                    AttendingRoomId: null,
                    AttendingRoomName: null,
                    TrackerStatusId: 3, //TrackerStatus.Checkout
                    TrackerComments: checkoutInfo.TrackerComments || '',
                    TrackerNotes: checkoutInfo.TrackerNotes || '',
                    FollowupAppointmentOn: checkoutInfo.FollowupAppointmentOn || null,
                    IncludeReviewNotes: checkoutInfo.IncludeReviewNotes,
                    LagInMins: null,
                    ClinicalStatusId: checkoutInfo.ClinicalStatusId,
                    ConsultationId: checkoutInfo.ConsultationId,
                    IsDischargeMedication: checkoutInfo.IsDischargeMedication
                };
                await this.Save(trackerInfo);


                //encounter checkout
                let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                await encBo.AutoCheckoutEncounter(checkoutInfo);

                //encounterdoctor checkout
                let encDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
                await encDocBO.AutoCheckoutEncounterDoctor(checkoutInfo);

                //close AppointmentStatus - checkout
                let apptBo = BoFactory.GetBo(appbo.AppointmentBo, this.Request);
                await apptBo.AutoCheckoutAppointment(checkoutInfo);


            }

        }

        return true;
    }

    public async CheckoutPatients(req: BaseRequest): Promise<Boolean> {
        let details: Array<any> = req.Data;

        let promises: Array<any> = [];
        details.forEach(detail => {
            let request: any = { Data: detail };
            promises.push(this.CheckoutPatient(request));
        });
        await Promise.all(promises);
        return true;

    }

    public async CheckoutPatient(req: BaseRequest): Promise<any> {
        let checkoutInfo = req.Data;
        checkoutInfo.AppointmentId = checkoutInfo.AppointmentId || checkoutInfo.Id;

        //encounter checkout
        let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        await encBo.CheckoutEncounter(req);

        //encounterdoctor checkout
        let encDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encDocBO.CheckoutEncounterDoctor(req);

        //close AppointmentStatus - checkout
        let apptBo = BoFactory.GetBo(appbo.AppointmentBo, this.Request);
        await apptBo.CheckoutAppointment(req);
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBO.GetPatientById({ Id: checkoutInfo.PatientId });
        //close tracker
        let trackerInfo: any = {
            PrevAppointmentId: null,
            ParentTrackId: null,
            PatientId: checkoutInfo.PatientId,
            AppointmentId: checkoutInfo.AppointmentId,
            AppointmentName: null,
            EncounterId: checkoutInfo.EncounterId,
            DoctorId: checkoutInfo.DoctorId,
            FacilityId: checkoutInfo.FacilityId,
            AssignedRoomId: null,
            AssignedRoomName: null,
            AssignedGroupId: null,
            AssignedGroupName: null,
            AssignedUserId: null,
            AssignedUserName: null,
            AssignedDate: null,
            AttendUserId: this.Session.UserId,
            AttendUserName: this.Session.UserName,
            CalledTime: null,
            AttendTime: new Date(),
            AttendingRoomId: null,
            AttendingRoomName: null,
            TrackerStatusId: 3, //TrackerStatus.Checkout
            TrackerComments: checkoutInfo.TrackerComments,
            TrackerNotes: checkoutInfo.TrackerNotes,
            FollowupAppointmentOn: checkoutInfo.FollowupAppointmentOn || null,
            IncludeReviewNotes: checkoutInfo.IncludeReviewNotes,
            LagInMins: null,
            ClinicalStatusId: checkoutInfo.ClinicalStatusId,
            ConsultationId: checkoutInfo.ConsultationId,
            IsDischargeMedication: checkoutInfo.IsDischargeMedication
        };
        if (!checkoutInfo.Id) {
            let result = await this.Save(trackerInfo);
            if (req.Data.oid) {
                let vhBO = BoFactory.GetBo(vhcarebO.VirtualOrderBo, this.Request);
                await vhBO.UpdateCompleteOrder(req);
            }
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let vPatientName = '';
                vPatientName = await this.getPatientName(patientData);

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
                                variable_1: vPatientName
                            }
                        }
                    }
                };
                data.whatsapp.template.templateName = 'google_review_25_09_clone';
                if (data.whatsapp.template.templateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }
            }
            return result.dataValues.Id;
        } else if (checkoutInfo.Id) {
            let trackerInfo: any = {
                PrevAppointmentId: null,
                Id: checkoutInfo.Id,
                PatientId: checkoutInfo.PatientId,
                AppointmentId: checkoutInfo.AppointmentId,
                AppointmentName: null,
                EncounterId: checkoutInfo.EncounterId,
                DoctorId: checkoutInfo.DoctorId,
                FacilityId: null,
                AssignedRoomId: null,
                AssignedRoomName: null,
                AssignedGroupId: null,
                AssignedGroupName: null,
                AssignedUserId: null,
                AssignedUserName: null,
                AssignedDate: null,
                AttendUserId: this.Session.UserId,
                AttendUserName: this.Session.UserName,
                CalledTime: null,
                AttendTime: new Date(),
                AttendingRoomId: null,
                AttendingRoomName: null,
                TrackerStatusId: 3,
                TrackerComments: checkoutInfo.TrackerComments,
                TrackerNotes: checkoutInfo.TrackerNotes,
                FollowupAppointmentOn: checkoutInfo.FollowupAppointmentOn || null,
                IncludeReviewNotes: checkoutInfo.IncludeReviewNotes,
                LagInMins: null,
                ClinicalStatusId: checkoutInfo.ClinicalStatusId,
                ConsultationId: checkoutInfo.ConsultationId,
                IsDischargeMedication: checkoutInfo.IsDischargeMedication
            };
            let result = await this.Update(trackerInfo);
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let vPatientName = '';
                vPatientName = await this.getPatientName(patientData);

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
                                variable_1: vPatientName
                            }
                        }
                    }
                };
                data.whatsapp.template.templateName = 'google_review_25_09_clone';
                if (data.whatsapp.template.templateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }
            }
            return result;
        }

    }
    public async CheckoutConsultationPatient(req: BaseRequest): Promise<number> {
        let checkoutInfo = req.Data;
        checkoutInfo.AppointmentId = checkoutInfo.AppointmentId || checkoutInfo.Id;
        //encounter checkout
        // let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        // await encBo.CheckoutEncounter(req);
        //encounterdoctor checkout
        let encDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encDocBO.CheckoutEncounterDoctor(req);
        //close AppointmentStatus - checkout
        let appointment: any = { AppointmentStatusId: 11 };
        this.Models.Appointment.update(appointment, {
            fields: ['AppointmentStatusId'],
            where: {
                PatientId: checkoutInfo.PatientId,
                AppointmentId: checkoutInfo.AppointmentId
            }
        });
        //close tracker
        let trackerInfo: any = {
            PrevAppointmentId: null,
            ParentTrackId: null,
            PatientId: checkoutInfo.PatientId,
            AppointmentId: checkoutInfo.AppointmentId,
            AppointmentName: null,
            EncounterId: checkoutInfo.EncounterId,
            DoctorId: checkoutInfo.DoctorId,
            FacilityId: null,
            AssignedRoomId: null,
            AssignedRoomName: null,
            AssignedGroupId: null,
            AssignedGroupName: null,
            AssignedUserId: null,
            AssignedUserName: null,
            AssignedDate: null,
            AttendUserId: this.Session.UserId,
            AttendUserName: this.Session.UserName,
            CalledTime: null,
            AttendTime: new Date(),
            AttendingRoomId: null,
            AttendingRoomName: null,
            TrackerStatusId: 3, //TrackerStatus.Checkout
            TrackerComments: checkoutInfo.TrackerComments,
            TrackerNotes: checkoutInfo.TrackerNotes,
            FollowupAppointmentOn: checkoutInfo.FollowupAppointmentOn || null,
            IncludeReviewNotes: checkoutInfo.IncludeReviewNotes,
            LagInMins: null,
            ClinicalStatusId: checkoutInfo.ClinicalStatusId,
            ConsultationId: checkoutInfo.ConsultationId,
            IsDischargeMedication: checkoutInfo.IsDischargeMedication
        };
        let result = await this.Save(trackerInfo);
        if(result) {

        if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
            let vPatientName = '';
            let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patientData = await patientBO.GetPatientById({ Id: checkoutInfo.PatientId });
            vPatientName = await this.getPatientName(patientData);

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
                            variable_1: vPatientName
                        }
                    }
                }
            };
            data.whatsapp.template.templateName = 'google_review_25_09_clone';
            if (data.whatsapp.template.templateName !== '') {
                const whatsApp = new WhatsappNotificationService();
                let msgRes = await whatsApp.sendMessage(data);
                console.log(msgRes);
            }
        }
    }

        return result.dataValues.Id;
    }
    public GetModel(): SStatic.Model<PatientTrackerInstance, PatientTrackerAttributes> {
        return this.Models.PatientTracker;
    }

    public async setFollowUpAppointmentSMS(frmFollowUpDt: Date, toFollowUpDt: Date): Promise<void> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientTrackerFilters.FollowupAppointmentOn, Value: [frmFollowUpDt, toFollowUpDt] }]
        };
        let patientTrackobj = await this.GetPatientTrackers(apiReq);
        await Promise.all(patientTrackobj.Data.map((patientrkdata): Promise<void> => {
            return (async (pttrkrow): Promise<void> => {
                if (pttrkrow.AppointmentId) {
                    console.log(pttrkrow.AppointmentId); //AppointmentId
                    let apiappReq = {
                        Id: 0,
                        PageContext: { PageSize: -1, PageNumber: 1 },
                        Params: [{ Key: 0, Value: pttrkrow.AppointmentId }]
                    };
                    let appBO = BoFactory.GetBo(appbo.AppointmentBo, this.Request);
                    let appobj = await appBO.GetAppointments(apiappReq);
                    await appBO.sendFollowUpSMS(appobj.Data, frmFollowUpDt);
                }
            })(patientrkdata);
        }));
    }
}
