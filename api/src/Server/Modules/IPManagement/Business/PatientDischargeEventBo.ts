import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientDischargeEventInstance, PatientDischargeEventAttributes } from '../Model/Interface/Index';
import { PatientDischargeEventFilters, BedOccupancyHistoryFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as inpatientBo from '../../IPManagement/Business/Index';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import * as moment from 'moment';
import * as inpatientBO from '../../IPManagement/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as apptbo from '../../Appointment/Business/Index';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';
import { ReferenceValueFilters, DepartmentFilters } from '../../SystemSettings/Common/Filters.e';
import { PatientFilters } from '../../Registration/Common/Filters.e';
import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
// import { NotificationService } from '../../../Notification/OneSignalNotification';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';
import * as clinicalMasterBo from '../../ClinicalMaster/Business/Index';
// import * as billingBo from '../../Billing/Business/Index';
import * as facilityBo from '../../SystemSettings/Business/Index';
import * as generalbo from '../../GeneralMaster/Business/Index';

export class PatientDischargeEventBo extends BaseBo<PatientDischargeEventInstance, PatientDischargeEventAttributes>
    implements IOptionProvider {
    // public async AddPatientDischargeEvent(req: BaseRequest): Promise<number> {
    //     this.HandleActiveState(req.Data);

    //     let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
    //     let occupanyBO = BoFactory.GetBo(inpatientBo.BedOccupancyHistoryBo, this.Request);
    //     let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);

    //     let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
    //     EncounterInfo.AdmissionStatusId = req.Data.AdmissionStatusId;

    //     //Clinical Discharge Bills updates
    //     if (req.Data.AdmissionStatusId === 4) {
    //         let ServiceRateCategoryId: number = 0;
    //         ServiceRateCategoryId = EncounterInfo.ServiceRateCategoryId;
    //         let IsInsuranceTraiff: boolean = false;
    //         // if (EncounterInfo.GuarantorId > 0) {
    //         //     let patientGuarantorBo = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
    //         //     let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: req.Data.GuarantorId });

    //         //     if (patientGuarantorData) {
    //         //         let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
    //         //         let GuarantorId_ = 1000;
    //         //         await guarantorBO.GetCurrentGuarantorId().then(function (result) {
    //         //             GuarantorId_ = result;
    //         //         });
    //         //         let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });
    //         //         if (guarantor.Id !== GuarantorId_) {
    //         //             IsInsuranceTraiff = true;
    //         //             ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
    //         //         }
    //         //     }
    //         // }

    //         let OccupancyApiReq = {
    //             Id: 0,
    //             PageContext: { PageSize: 50, PageNumber: 1 },
    //             Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Id },
    //             { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }]
    //         };

    //         let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);

    //         await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
    //             return (async (OccupancyHistory): Promise<void> => {
    //                 let StartDate: any = OccupancyHistory.BillingStartDate;
    //                 let EndDate: any = OccupancyHistory.BillingEndDate === null ? new Date() : OccupancyHistory.BillingEndDate;

    //                 let days = moment(EndDate).diff(moment(StartDate), 'days');
    //                 let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });

    //                 if (days > 0) {
    //                     let BillReq: any = {
    //                         Data: {
    //                             NoofDays: days > 0 ? days : 1,
    //                             RoomId: OccupancyHistory.RoomId,
    //                             DoctorId: EncounterInfo.DoctorId,
    //                             DepartmentId: EncounterInfo.DepartmentId,
    //                             PatientId: EncounterInfo.PatientId,
    //                             FacilityId: OccupancyHistory.FacilityId,
    //                             GuarantorId: EncounterInfo.GuarantorId,
    //                             //GuarantorTypeId: EncounterInfo.GuarantorTypeId,
    //                             ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId,
    //                             EncounterId: EncounterInfo.Id,
    //                             IsPrimaryBed: OccupancyHistory.IsPrimaryBed,
    //                             IsDoubleOccupancy: OccupancyHistory.IsDoubleOccupancy
    //                         }
    //                     };
    //                     if (!EncounterInfo.IsBillLock)
    //                         await encounterbo.ManageEncounterBillInfo(BillReq);
    //                 }
    //             })(Occupancy);
    //         }));
    //     }
    //     if (req.Data.AdmissionStatusId === 6) {
    //         EncounterInfo.DischargeDate = req.Data.DischargeDate || new Date();
    //         EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId || 1;
    //         if (req.Data.DischargeTypeId === 2) {
    //             EncounterInfo.DeathDate = req.Data.DeathDate || new Date();
    //         }
    //         EncounterInfo.EncounterStatusId = 2;
    //         EncounterInfo.IsLatest = false;
    //         let OccupancyApiReq = {
    //             Id: 0,
    //             PageContext: { PageSize: 50, PageNumber: 1 },
    //             Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
    //             { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.FromBedId },
    //             { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }
    //             ]
    //         };
    //         let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);

    //         await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
    //             return (async (OccupancyHistory): Promise<void> => {
    //                 OccupancyHistory.DischargeDate = req.Data.DischargeDate || new Date();
    //                 OccupancyHistory.OccupancyStatusId = 2;
    //                 OccupancyHistory.AdmitStatusId = 6;
    //                 OccupancyHistory.BillingEndDate = OccupancyHistory.BillingEndDate === null
    //                     ? new Date() : OccupancyHistory.BillingEndDate;
    //                 await occupanyBO.Update(OccupancyHistory);

    //                 let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
    //                 BedInfo.BedStatusId = 1;
    //                 await BedBo.Update(BedInfo);

    //             })(Occupancy);
    //         }));
    //         const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
    //         const patient: any = await patientBO.GetById(req.Data.PatientId);
    //         const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
    //         const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
    //         if (patient && (patient.NotificationToken)) {
    //             /* tslint:disable-next-line */
    //             const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' You are discharged on'
    //             + moment(req.Data.DischargeDate).format('YYYY-MM-DD') + '.';
    //             const notificationService: any = new NotificationService();
    //             const body = {
    //                 type: 'appoinment_booking',
    //             };
    //             const pushTokens: string[] = [];
    //             if (patient.NotificationToken) {
    //                 pushTokens.push(patient.NotificationToken);
    //             }
    //             await notificationService.sendNotification(pushMessage, pushTokens, body);
    //             console.log('*************************pushMessage**********************', pushMessage);
    //             console.log('*************************pushTokens**********************', pushTokens);
    //         }
    //         if (doctorData && (doctorData.NotificationToken)) {
    //             /* tslint:disable-next-line */
    //             const pushMessage: string = 'Dear ' + doctorData.FirstName + ', '
    //             + patient.FirstName + ', ' + ' discharged on' +
    //              moment(req.Data.DischargeDate).format('YYYY-MM-DD') + '.';
    //             const notificationService: any = new NotificationService();
    //             const body = {
    //                 type: 'appoinment_booking',
    //             };
    //             const pushTokens: string[] = [];
    //             if (doctorData.NotificationToken) {
    //                 pushTokens.push(doctorData.NotificationToken);
    //             }
    //             if (doctorData.WebNotificationToken) {
    //                 pushTokens.push(doctorData.WebNotificationToken);
    //             }

    //             await notificationService.sendNotification(pushMessage, pushTokens, body);
    //         }

    //         if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
    //             // let vPatientName = '';
    //             // vPatientName = await this.getPatientName(patient);
    //             // let vDoctorName = '';
    //             // vDoctorName = await this.getDoctorNamewoTit(UserData);
    //             // let dateformat = 'DD/MM/YYYY';
    //             let data = {
    //                 channelId: '64ef1968000b0fe0d6e2847c',
    //                 channelType: 'whatsapp',
    //                 recipient: {
    //                     name: patient.FirstName,
    //                     phone: '91' + Number(patient.Mobile)
    //                 },
    //                 whatsapp: {
    //                     type: 'template',
    //                     template: {
    //                         templateName: '',
    //                         bodyValues: {
    //                             variable_1: patient.FirstName
    //                         }
    //                     }
    //                 }
    //             };
    //             data.whatsapp.template.templateName = 'google_review_25_09_clone';
    //             if (data.whatsapp.template.templateName !== '') {
    //                 const whatsApp = new WhatsappNotificationService();
    //                 let msgRes = await whatsApp.sendMessage(data);
    //                 console.log(msgRes);
    //             }
    //         }

    //     }
    //     await this.ManagePatientAdmissionLog(req);

    //     await encounterbo.Update(EncounterInfo);
    //     req.Data.PatientId = EncounterInfo.PatientId;
    //     let result = await this.Save(req.Data);

    //     return result.dataValues.Id;
    // }
    public async AddPatientDischargeEvent(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);

        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let occupanyBO = BoFactory.GetBo(inpatientBo.BedOccupancyHistoryBo, this.Request);
        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);

        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.AdmissionStatusId = req.Data.AdmissionStatusId;

        //Clinical Discharge Bills updates
        if (req.Data.AdmissionStatusId === 4) {

            let ServiceRateCategoryId: number = 0;
            ServiceRateCategoryId = EncounterInfo.ServiceRateCategoryId;
            let IsInsuranceTraiff: boolean = false;
            // if (EncounterInfo.GuarantorId > 0) {
            //     let patientGuarantorBo = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
            //     let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: EncounterInfo.GuarantorId });

            //     if (patientGuarantorData) {
            //         let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
            //         let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });
            //         if (guarantor.Id !== 1000) {
            //             IsInsuranceTraiff = true;
            //             ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
            //         }
            //     }
            // }

            let OccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }]
            };

            let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);
            await this.sendPatientDischargeSms(req);
            await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
                return (async (OccupancyHistory): Promise<void> => {
                    let StartDate: any = OccupancyHistory.BillingStartDate;
                    let EndDate: any = OccupancyHistory.BillingEndDate === null ? new Date() : OccupancyHistory.BillingEndDate;

                    let days = moment(EndDate).diff(moment(StartDate), 'days');
                    let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });

                    if (days > 0) {
                        let BillReq: any = {
                            Data: {
                                NoofDays: days > 0 ? days : 1,
                                RoomId: OccupancyHistory.RoomId,
                                DoctorId: EncounterInfo.DoctorId,
                                DepartmentId: EncounterInfo.DepartmentId,
                                PatientId: EncounterInfo.PatientId,
                                FacilityId: OccupancyHistory.FacilityId,
                                GuarantorId: EncounterInfo.GuarantorId,
                                //GuarantorTypeId: EncounterInfo.GuarantorTypeId,
                                ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId,
                                EncounterId: EncounterInfo.Id,
                                IsPrimaryBed: OccupancyHistory.IsPrimaryBed,
                                IsDoubleOccupancy: OccupancyHistory.IsDoubleOccupancy
                            }
                        };
                        if (!EncounterInfo.IsBillLock)
                            await encounterbo.ManageEncounterBillInfo(BillReq);
                    }
                })(Occupancy);
            }));
        }
        if (req.Data.AdmissionStatusId === 4) {
            let deptBo = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
            let deptReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: DepartmentFilters.IsIPClearence, Value: true },
                ]
            };
            let deptdata = await deptBo.GetDepartments(deptReq);
            let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: PatientFilters.Id, Value: req.Data.PatientId },
                ]
            };
            let patientData = await patientBo.GetPatients(patReq);
            console.log('***************patientData*******************', patientData);
            let PatientMrn = '';
            let PatientName = '';
            PatientMrn = patientData.Data[0].MRN;
            PatientName = (patientData.Data[0].FirstName + ' ' + patientData.Data[0].LastName);
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: PatientFilters.Id, Value: req.Data.EncounterId },
                ]
            };
            let encounterData = await encounterBo.GetEncounters(encReq);
            console.log('***************encounterData*******************', encounterData);
            let DoctorName = '';
            let VisitNo = '';
            let WardId = 0;
            let RoomId = 0;
            let BedId = 0;
            WardId = encounterData.Data[0].WardId;
            RoomId = encounterData.Data[0].RoomId;
            DoctorName = encounterData.Data[0].DoctorName;
            BedId = encounterData.Data[0].BedId;
            VisitNo = encounterData.Data[0].VisitIdentifier;
            let ipclearenceBo = BoFactory.GetBo(inpatientBO.IPClearenceBo, this.Request);
            let ipcdptdata: any = [];
            console.log('***************deptdata*******************', deptdata);
            if (deptdata && deptdata.Data.length > 0) {
                let deptid: any = [];
                for (let idx in deptdata.Data) {
                    ipcdptdata = deptdata.Data[idx];
                    deptid = ipcdptdata.Id;
                    let ipclearencedata: any = {
                        Id: 0,
                        DepartmentId: deptid,
                        PatientId: req.Data.PatientId,
                        PatientMrn: PatientMrn,
                        PatientName: PatientName,
                        EncounterId: req.Data.EncounterId,
                        VisitNo: VisitNo,
                        DoctorId: req.Data.DoctorId,
                        DoctorName: DoctorName,
                        WardId: WardId,
                        RoomId: RoomId,
                        BedId: BedId,
                        AdmissionStatusId: req.Data.AdmissionStatusId,
                        IPClearenceStatusId: 1,
                        IPClearenceDate: req.Data.CreatedAt,
                        RequestedBy: req.Data.CreatedBy,
                        RequestedDate: req.Data.CreatedAt,
                        Status: 1
                    };
                    await ipclearenceBo.Save(ipclearencedata);
                    console.log('*********saveipclearencedata***************', ipclearencedata);
                }
            }
        }
        if (req.Data.AdmissionStatusId === 6) {
            console.log(req.Data);
            EncounterInfo.DischargeDate = req.Data.DischargeDate || new Date();
            EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId || 1;
            if (req.Data.DischargeTypeId === 2) {
                EncounterInfo.DeathDate = req.Data.DeathDate || new Date();
            }
            EncounterInfo.IsLatest = false;
            EncounterInfo.EncounterStatusId = 2;
            let OccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.FromBedId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }
                ]
            };
            let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);
            await this.SendDoctorDischargeSms(req);
            await this.sendPatientDischargeSms(req);
            await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
                return (async (OccupancyHistory): Promise<void> => {
                    OccupancyHistory.DischargeDate = req.Data.DischargeDate || new Date();
                    OccupancyHistory.OccupancyStatusId = 2;
                    OccupancyHistory.AdmitStatusId = 6;
                    OccupancyHistory.BillingEndDate = OccupancyHistory.BillingEndDate === null
                        ? new Date() : OccupancyHistory.BillingEndDate;
                    await occupanyBO.Update(OccupancyHistory);

                    let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
                    let bedData: any = {};
                    bedData.Id = BedInfo.Id;
                    bedData.BedStatusId = 1;
                    await BedBo.Update(bedData);

                })(Occupancy);
            }));
            const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            const patient: any = await patientBO.GetById(req.Data.PatientId);
            const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
            const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
            if (patient.Mobile) {
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'patientdischarge',
                        Mobile: patient.Mobile,
                        patientName: patient.FirstName
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the patientdischarge');

                }
            }
            if (doctorData.Mobile) {
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'drpatientdischarge',
                        Mobile: doctorData.Mobile,
                        doctorName: doctorData.FirstName,
                        patientName: patient.FirstName
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the drpatientdischarge');

                }
            }
        }
        await this.ManagePatientAdmissionLog(req);

        await encounterbo.Update(EncounterInfo);
        req.Data.PatientId = EncounterInfo.PatientId;
        let result = await this.Save(req.Data);
        if (req.Data.DischargeTypeId === 2 && req.Data.IsDeathConfirmed === true) {
            const deathData: any = {
                FacilityId: this.Session.FacilityId,
                PatientId: req.Data.PatientId,
                EncounterId: req.Data.EncounterId,
                DoctorId: req.Data.DoctorId,
                DeathStatusId: 1,
                IsDeathConfirmed: req.Data.IsDeathConfirmed,
                DeathRequestedBy: this.Session.UserId,
                DeathRequestedDate: new Date(),
                DeathDate: req.Data.DeathDate,
                DeathComments: req.Data.DeathComments
            };
            let patientdeath = BoFactory.GetBo(regbo.PatientDeathBo, this.Request);
            await patientdeath.Save(deathData);
        }
        return result.dataValues.Id;
    }

    public async UpdatePatientDischargeEvent(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);

        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let occupanyBO = BoFactory.GetBo(inpatientBo.BedOccupancyHistoryBo, this.Request);
        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.AdmissionStatusId = req.Data.AdmissionStatusId;

        //Clinical Discharge Bills updates
        if (req.Data.AdmissionStatusId === 4) {

            let ServiceRateCategoryId: number = 0;
            ServiceRateCategoryId = EncounterInfo.ServiceRateCategoryId;
            let IsInsuranceTraiff: boolean = false;
            // if (EncounterInfo.GuarantorId > 0) {
            //     let patientGuarantorBo = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
            //     let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: EncounterInfo.GuarantorId });

            //     if (patientGuarantorData) {
            //         let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
            //         let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });
            //         if (guarantor.Id !== 1000) {
            //             IsInsuranceTraiff = true;
            //             ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
            //         }
            //     }
            // }

            let OccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }]
            };

            let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);
            await this.SendDoctorDischargeSms(req);
            await this.sendPatientDischargeSms(req);
            await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
                return (async (OccupancyHistory): Promise<void> => {
                    let StartDate: any = OccupancyHistory.BillingStartDate;
                    let EndDate: any = OccupancyHistory.BillingEndDate === null ? new Date() : OccupancyHistory.BillingEndDate;

                    let days = moment(EndDate).diff(moment(StartDate), 'days');
                    let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
console.log('Days');
console.log(days);
                    if (days > 0) {
                        let BillReq: any = {
                            Data: {
                                NoofDays: days > 0 ? days : 1,
                                RoomId: OccupancyHistory.RoomId,
                                DoctorId: EncounterInfo.DoctorId,
                                DepartmentId: EncounterInfo.DepartmentId,
                                PatientId: EncounterInfo.PatientId,
                                FacilityId: OccupancyHistory.FacilityId,
                                GuarantorId: EncounterInfo.GuarantorId,
                                //GuarantorTypeId: EncounterInfo.GuarantorTypeId,
                                ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId,
                                EncounterId: EncounterInfo.Id,
                                IsPrimaryBed: OccupancyHistory.IsPrimaryBed,
                                IsDoubleOccupancy: OccupancyHistory.IsDoubleOccupancy
                            }
                        };
                        if (!EncounterInfo.IsBillLock)
                            await encounterbo.ManageEncounterBillInfo(BillReq);
                    }
                })(Occupancy);
            }));
        }
        if (req.Data.AdmissionStatusId === 4) {
            let deptBo = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
            let deptReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: DepartmentFilters.IsIPClearence, Value: true },
                ]
            };
            let deptdata = await deptBo.GetDepartments(deptReq);
            let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: PatientFilters.Id, Value: req.Data.PatientId },
                ]
            };
            let patientData = await patientBo.GetPatients(patReq);
            console.log('***************patientData*******************', patientData);
            let PatientMrn = '';
            let PatientName = '';
            PatientMrn = patientData.Data[0].MRN;
            PatientName = (patientData.Data[0].FirstName + ' ' + patientData.Data[0].LastName);
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encReq: any = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: PatientFilters.Id, Value: req.Data.EncounterId },
                ]
            };
            let encounterData = await encounterBo.GetEncounters(encReq);
            console.log('***************encounterData*******************', encounterData);
            let DoctorName = '';
            let VisitNo = '';
            let WardId = 0;
            let RoomId = 0;
            let BedId = 0;
            WardId = encounterData.Data[0].WardId;
            RoomId = encounterData.Data[0].RoomId;
            DoctorName = encounterData.Data[0].DoctorName;
            BedId = encounterData.Data[0].BedId;
            VisitNo = encounterData.Data[0].VisitIdentifier;
            let ipclearenceBo = BoFactory.GetBo(inpatientBO.IPClearenceBo, this.Request);
            let ipcdptdata: any = [];
            console.log('***************deptdata*******************', deptdata);
            if (deptdata && deptdata.Data.length > 0) {
                let deptid: any = [];
                for (let idx in deptdata.Data) {
                    ipcdptdata = deptdata.Data[idx];
                    deptid = ipcdptdata.Id;
                    let ipclearencedata: any = {
                        Id: 0,
                        DepartmentId: deptid,
                        PatientId: req.Data.PatientId,
                        PatientMrn: PatientMrn,
                        PatientName: PatientName,
                        EncounterId: req.Data.EncounterId,
                        VisitNo: VisitNo,
                        DoctorId: req.Data.DoctorId,
                        DoctorName: DoctorName,
                        WardId: WardId,
                        RoomId: RoomId,
                        BedId: BedId,
                        AdmissionStatusId: req.Data.AdmissionStatusId,
                        IPClearenceStatusId: 1,
                        IPClearenceDate: req.Data.CreatedAt,
                        RequestedBy: req.Data.CreatedBy,
                        RequestedDate: req.Data.CreatedAt,
                        Status: 1
                    };
                    await ipclearenceBo.Save(ipclearencedata);
                    console.log('*********saveipclearencedata***************', ipclearencedata);
                }
            }
        }
        if (req.Data.AdmissionStatusId === 6) {
            console.log(req.Data);
            EncounterInfo.DischargeDate = req.Data.DischargeDate || new Date();
            EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId || 1;
            if (req.Data.DischargeTypeId === 2) {
                EncounterInfo.DeathDate = req.Data.DeathDate || new Date();
            }
            EncounterInfo.IsLatest = false;
            EncounterInfo.EncounterStatusId = 2;
            let OccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.FromBedId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }
                ]
            };
            let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);
            await this.SendDoctorDischargeSms(req);
            await this.sendPatientDischargeSms(req);
            await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
                return (async (OccupancyHistory): Promise<void> => {
                    OccupancyHistory.DischargeDate = req.Data.DischargeDate || new Date();
                    OccupancyHistory.OccupancyStatusId = 2;
                    OccupancyHistory.AdmitStatusId = 6;
                    OccupancyHistory.BillingEndDate = OccupancyHistory.BillingEndDate === null
                        ? new Date() : OccupancyHistory.BillingEndDate;
                    await occupanyBO.Update(OccupancyHistory);

                    let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
                    let bedData: any = {};
                    bedData.Id = BedInfo.Id;
                    bedData.BedStatusId = 1;
                    await BedBo.Update(bedData);

                })(Occupancy);
            }));
            const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            const patient: any = await patientBO.GetById(req.Data.PatientId);
            const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
            const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
            if (patient.Mobile) {
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'patientdischarge',
                        Mobile: patient.Mobile,
                        patientName: patient.FirstName
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the patientdischarge');

                }
            }
            if (doctorData.Mobile) {
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'drpatientdischarge',
                        Mobile: doctorData.Mobile,
                        doctorName: doctorData.FirstName,
                        patientName: patient.FirstName
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the drpatientdischarge');

                }
            }
            if (patient.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('DrHMSpatientDischarge', 'DrHMSpatientDischarge', 1);
                if (smsTemplateInfo) {
                    let smsmodel: any = {};
                    if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: patient.FirstName,
                                    contactNo: this.Session.FacilityContact
                                })
                        };
                    } else {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: patient.FirstName,
                                    contactNo: this.Session.FacilityContact
                                })
                        };
                    }
                    let smsProvider = this.GetSmsProvider();
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
                    }
                }
            }
        }
        await this.ManagePatientAdmissionLog(req);
        console.log(EncounterInfo);
        await encounterbo.Update(EncounterInfo);
        //   await  encounterbo.ManageAdmissionEncounter(encounter);
        return result;
    }

    public async AddPatientDischargeEventFromDayCare(req: BaseRequest): Promise<any> {
        let result = await this.Save(req.Data);

        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let occupanyBO = BoFactory.GetBo(inpatientBo.BedOccupancyHistoryBo, this.Request);
        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.AdmissionStatusId = req.Data.AdmissionStatusId;


        if (req.Data.AdmissionStatusId === 6) {
            console.log(req.Data);
            EncounterInfo.DischargeDate = req.Data.DischargeDate || new Date();
            EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId || 1;
            if (req.Data.DischargeTypeId === 2) {
                EncounterInfo.DeathDate = req.Data.DeathDate || new Date();
            }
            EncounterInfo.IsLatest = false;
            EncounterInfo.EncounterStatusId = 2;
            if (req.Data.IsBillLock === true) {
                EncounterInfo.IsBillLock = true;
                EncounterInfo.IsBillFinalized = true;
            }
            let OccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.FromBedId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }
                ]
            };
            let OccupancyHistoryDetails = await occupanyBO.GetBedOccupancyHistorys(OccupancyApiReq);
            // await this.SendDoctorDischargeSms(req);
            await Promise.all(OccupancyHistoryDetails.Data.map((Occupancy): Promise<void> => {
                return (async (OccupancyHistory): Promise<void> => {
                    OccupancyHistory.DischargeDate = req.Data.DischargeDate || new Date();
                    OccupancyHistory.OccupancyStatusId = 2;
                    OccupancyHistory.AdmitStatusId = 6;
                    OccupancyHistory.BillingEndDate = OccupancyHistory.BillingEndDate === null
                        ? new Date() : OccupancyHistory.BillingEndDate;
                    await occupanyBO.Update(OccupancyHistory);

                    let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
                    let bedData: any = {};
                    bedData.Id = BedInfo.Id;
                    bedData.BedStatusId = 1;
                    await BedBo.Update(bedData);

                })(Occupancy);
            }));
        }
        await this.ManagePatientAdmissionLog(req);
        console.log(EncounterInfo);
        await encounterbo.Update(EncounterInfo);
        return result;
    }

    public async SendDoctorDischargeSms(req: any): Promise<boolean> {
        try {
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
            if (encdata) {
                let DrName = ''; let PatientName = ''; let MRN = ''; let Age = 0; let Gender = '';
                let DisplayWard = ''; let DisplayRoom = ''; let DisplayBed = '';
                let AdmissionDate = ''; let AdmissionTime = '';
                let dateformat = 'DD/MM/YYYY';
                let timeformat = 'HH:mm:ss';
                DrName = encdata.DoctorName;
                AdmissionDate = moment(encdata.AdmissionDate).format(dateformat);
                AdmissionTime = moment(encdata.AdmissionDate).format(timeformat);
                MRN = encdata.PatientMrn;
                let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
                let UserData = await userBO.GetUserById({ Id: encdata.DoctorId });
                if (UserData.Mobile) {
                    let regBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
                    let patientData = await regBo.GetPatientById({ Id: encdata.PatientId });
                    Age = patientData.Age;
                    let appBO = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
                    PatientName = await appBO.getPatientName(patientData);
                    Gender = await appBO.getPatientGender(patientData);
                    let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
                    let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
                    DisplayWard = warddata.WardName;
                    let wardRoomMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
                    let roomData = await wardRoomMasterBO.GetWardRoomMasterById({ Id: encdata.RoomId });
                    DisplayRoom = roomData.Description;
                    let wardRoomBedMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
                    let bedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: encdata.BedId });
                    DisplayBed = bedData.Description;
                    let serviceRateBo = BoFactory.GetBo(clinicalMasterBo.ServiceRateCategoryBo, this.Request);
                    let servicerate = await serviceRateBo.GetServiceRateCategoryById({ Id: encdata.ServiceRateCategoryId });
                    let ServiceRt = '';
                    ServiceRt = servicerate.ServiceRateCategory;
                    // let promotionalSchemeBo = BoFactory.GetBo(billingBo.PromotionalSchemeBo, this.Request);
                    // let PromotionalSch = '';
                    // if (encdata.PromotionalSchemeId && encdata.PromotionalSchemeId > 0) {
                    //     let PromotionSch: any = await promotionalSchemeBo.GetPromotionalSchemeById({ Id: encdata.PromotionalSchemeId });
                    //     PromotionalSch = PromotionSch.PromotionSchemeName;
                    // }
                    let gaurantorname = '';
                    let gaurantobo = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
                    let gaurantor = await gaurantobo.GetGuarantorById({ Id: encdata.GuarantorId });
                    gaurantorname = gaurantor.GuarantorName;
                    let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
                    let facilityData = await faciliBO.GetFacilityById({ Id: this.Session.FacilityId });
                    let faxNo = facilityData.FaxNo;
                    let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                    let smsTemplateInfo =
                        await eventTemplateBO.GetTemplateInfo('DischargeDoctor', 'DischargeDoctor', 1);
                    let vDocName = '';
                    vDocName = await this.getUserName(UserData);
                    if (smsTemplateInfo) {
                        let smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    userName: vDocName,
                                    doctorName: vDocName,
                                    patientName: PatientName,
                                    mrn: MRN,
                                    age: Age, gender: Gender,
                                    //displayward: DisplayWard,
                                    displayroom: DisplayRoom,
                                    displaybed: DisplayBed + ' ' + DisplayWard,
                                    displaydate: AdmissionDate,
                                    displaytime: AdmissionTime,
                                    contactNo: this.Session.FacilityContact
                                })
                        };
                        let smsProvider = this.GetSmsProvider();
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                        }
                    }
                    eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                    smsTemplateInfo =
                        await eventTemplateBO.GetTemplateInfo('DrHMSpatientDischarge', 'DrHMSpatientDischarge', 1);
                    //let vDocName = '';
                    //vDocName = await this.getUserName(UserData);
                    if (smsTemplateInfo) {
                        let smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    userName: vDocName,
                                    doctorName: vDocName,
                                    patientName: PatientName,
                                    mrn: MRN,
                                    age: Age, gender: Gender,
                                    //displayward: DisplayWard,
                                    displayroom: DisplayRoom,
                                    displaybed: DisplayBed + ' ' + DisplayWard,
                                    displaydate: AdmissionDate,
                                    displaytime: AdmissionTime,
                                    contactNo: this.Session.FacilityContact
                                })
                        };
                        let smsProvider = this.GetSmsProvider();
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                        }
                    }
                    if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                        let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
                        let facilityData = await faciliBO.GetFacilityById({ Id: this.Session.FacilityId });
                        let housekeepnumber = facilityData.HouseKeepingNumber;
                        let agegender = Age + ' Yrs-' + Gender;
                        let datetime = AdmissionDate + ' ' + AdmissionTime;
                        let numbersToSend = [];
                        if (UserData.Mobile) {
                            numbersToSend.push(UserData.Mobile);
                        }
                        if (housekeepnumber) {
                            let housekeepingNumbers = housekeepnumber.split(',').map(number => number.trim());
                            numbersToSend = numbersToSend.concat(housekeepingNumbers);
                        }
                        let promises: any = [];
                        numbersToSend.forEach(async (number) => {
                            let data = {
                                TemplateName: 'drclinicaldischarge',
                                ToNumbersWithCountryCode: number,
                                msg: 'Patient ' + PatientName + ', ' + agegender + ' PRN:' + MRN + ' will be discharged on ' + datetime +
                                    ' under ' + vDocName + ' Pay Category:' + ServiceRt + ' Sch Name:' + gaurantorname + ' FaxNo:' + faxNo +
                                    ' Thanks Hospital Management - Cauvery Hospital.',
                                BodyParameter: [PatientName, agegender, MRN, datetime, vDocName, ServiceRt, gaurantorname, faxNo]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            promises.push(msgRes);
                        });
                        Promise.all(promises)
                            .then((results) => {
                                console.log(results, 'here are the drclinicaldischarge messages');
                            })
                            .catch((error) => {
                                console.log('Error sending messages:', error);
                            });
                    } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                        try {
                            let datetime = AdmissionDate + ' ' + AdmissionTime;
                            let data = {
                                TemplateName: 'newdistordr',
                                mobile: UserData.Mobile,
                                BodyParameter: [PatientName, MRN, encdata.VisitIdentifier, DisplayBed + ' ' + DisplayWard, datetime]
                            };
                            const whatsApp = new WhatsappNotificationService();
                            let msgRes = await whatsApp.sendMessage(data);
                            console.log(msgRes, 'here is the drpatientDischargeJss');
                        } catch (error) {
                            console.log('Error Processing messages:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in SendDoctorDischargeSms:', error);
            return false;
        }

        return true;
    }

    public async sendPatientDischargeSms(req: any): Promise<boolean> {
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encdata = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        if (encdata) {
            let PatientName = '';
            let DisplayWard = '';
            let dateformat = 'DD/MM/YYYY';
            let timeformat = 'HH:mm:ss';
            let dischargeDate = moment(new Date()).format(dateformat);
            let dischargeTime = moment(new Date()).format(timeformat);
            let regBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patientData = await regBo.GetPatientById({ Id: encdata.PatientId });
            let appBO = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
            PatientName = await appBO.getPatientName(patientData);
            let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
            let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
            DisplayWard = warddata.WardName;

            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'AdmissionStatus' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.AdmissionStatusId }
                ]
            };
            let refadmistatus = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            let admissionData = await refadmistatus.GetReferenceValues(apiReq);
            let dischargetype = admissionData.Data[0].Description;

            if (patientData.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('PatientDischarge', 'PatientDischarge', 1);
                let smsmodel: any = {};
                if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                    try {
                        smsmodel = {
                            numbers: [patientData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    visitIdentifier: encdata.VisitIdentifier,
                                    dischargeType: dischargetype,
                                    ward: DisplayWard,
                                    datetime: dischargeDate + ' ' + dischargeTime,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } catch (error) {
                        console.log('Error Processing SMS:', error);
                    }
                }
                let smsProvider = this.GetSmsProvider();
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                }
            }
        }
        return true;
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
            if (vTitleName)
                vDocName = vTitleName + '.' + vDocName;
        }
        return vDocName;
    }

    public async UpdatePatientDischargeEventByDiagnosis(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let eventdata: any = {
            Data: {
                EncounterId: req.Data.EncounterId,
                DischargeTypeId: req.Data.DischargeTypeId,
                ClincalStatusId: req.Data.ClicalDischargeId,
                PatientId: req.Data.PatientId,
                Comments: req.Data.Comments,
                DiagnosisId: req.Data.DiagnosisId,
                Diagnosis2Id: req.Data.Diagnosis2Id,
                Diagnosis3Id: req.Data.Diagnosis3Id,
                CPTDiagnosisId: req.Data.CPTDiagnosisId,
                OtherDiagnosis: req.Data.OtherDiagnosis
            }
        };
        await encounterbo.UpdateEncounterDiagnosis(eventdata);
        return result;
    }
    public async ManagePatientAdmissionLog(req: BaseRequest): Promise<number> {
        let AdmissionLog: any = {
            Data: {
                EncounterId: req.Data.EncounterId,
                AdmissionStatusId: req.Data.AdmissionStatusId
            }
        };
        let admissionlogbo = BoFactory.GetBo(inpatientBO.PatientAdmissionLogBo, this.Request);
        return await admissionlogbo.AddPatientAdmissionLog(AdmissionLog);
    }

    public async GetPatientDischargeEventById(req: BaseRequest): Promise<PatientDischargeEventAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'FitFordischargeBy', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ClicalDischargeBy', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'PhysicalDischargeBy', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientDischargeEventByEncounterId(req: BaseRequest): Promise<number> {
        //    let result = await this.GetById(req.Id);

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDischargeEventFilters.EncounterId, Value: req.Id }]
        };
        let responseData = await this.GetPatientDischargeEvents(apiReq);
        if (responseData.Data.length > 0) {
            let data = responseData.Data[0];
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata = await encounterbo.GetEncounterById({ Id: req.Id });
            let regBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patientData = await regBo.GetPatientById({ Id: encdata.PatientId });
            if (patientData.ReferrerId > 0) {
                let referralBO = BoFactory.GetBo(generalbo.ReferralBo, this.Request);
                let referralData = await referralBO.GetReferralById({ Id: patientData.ReferrerId });
                console.log('referralData', referralData.PhoneNo);
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                    try {
                        let whatsApp = new WhatsappNotificationService();

                        let whatsAppData = {
                            TemplateName: 'disctodr',
                            mobile: referralData.PhoneNo,
                            BodyParameter: [
                                referralData.ReferralName, patientData.FirstName + '' + patientData.LastName, patientData.MRN,
                            ]
                        };
                        let msgRes = await whatsApp.sendMessage(whatsAppData);
                        console.log(msgRes, 'WhatsApp referral doctor message status');
                    } catch (error) {
                        console.error('Error sending WhatsApp message to referral doctor:', error);
                    }
                }
            }
            return data.Id;
        } else {
            return 0;
        }

    }
    public async GetPatientDischargeEvents(apiReq?: ApiRequest<PatientDischargeEventFilters>):
        Promise<ApiResponse<PatientDischargeEventAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Encounter, attributes: ['Id', 'ExpectedDischargeDate'], required: false });
        // include.push(this.GetReference('AdmissionStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDischargeEventFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDischargeEventFilters.EncounterId:
                        where['EncounterId'] = param.Value;
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
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDischargeEvent(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientDischargeEventFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPatientDischargeEvents(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<PatientDischargeEventInstance, PatientDischargeEventAttributes> {
        return this.Models.PatientDischargeEvent;
    }
}
