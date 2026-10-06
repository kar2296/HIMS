import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualOrderInstance, VirtualOrderAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../VirtualHealthcare/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import { VirtualOrderFilters, VirtualOrderDetailFilters } from '../Common/Filters.e';
import { EncounterDoctorFilters } from '../../Visit/Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as encbo from '../../Visit/Business/Index';
import * as appointmentbo from '../../Appointment/Business/Index';
import * as emrBo from '../../EMR/Business/Index';
import { readFileSync } from 'fs';
import * as userbo from '../../SystemSettings/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { join } from 'path';
import * as genMasbo from '../../GeneralMaster/Business/Index';
// import { readFileSync } from 'fs';
import { PatientOrderFilters } from '../../EMR/Common/Filters.e';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NotificationService } from '../../../Notification/OneSignalNotification';



export class VirtualOrderBo extends BaseBo<VirtualOrderInstance, VirtualOrderAttributes> {
    public async AddVirtualOrder(req: any): Promise<any> {
        let ordId: any;
        // let returnMsg = '1';
        // let returnErrorMsg = 'Already Ordered to this Center';
        // let res = '';

        let vOrderid: any;
        for (let idx in req.Data) {
            let headerInfo = req.Data[idx];
            let OrderDataHeader: any = {
                Id: Number(headerInfo.Id),
                FacilityId: Number(headerInfo.FacilityId),
                ResultFormatTypeId: Number(headerInfo.ResultFormatTypeId),
                VirtualCategoryId: Number(headerInfo.VirtualCategoryId),
                VirtualSubCategoryId: Number(headerInfo.VirtualSubCategoryId),
                CategoryTypeId: Number(headerInfo.CategoryTypeId),
                PatientId: Number(headerInfo.PatientId),
                ParentPatientId: Number(headerInfo.ParentPatientId) || 0,
                PatientMRN: headerInfo.PatientMRN,
                PatientName: headerInfo.PatientName,
                OrderNumber:headerInfo.OrderNumber,
                OrderRequestDate: headerInfo.OrderRequestDate,
                FromDate: headerInfo.FromDate,
                ToDate: headerInfo.ToDate,
                OrderScheduleDate: headerInfo.OrderScheduleDate,
                OrderCompletedDate: headerInfo.AppointmentEndDate,
                VirtualOrderStatusId: 1,
                OrderTotal: headerInfo.OrderTotal,
                PaymentModeId: headerInfo.PaymentModeId,
                OrderModeId: 2,
                RequestTypeId: 1,
                AppointmentDate: headerInfo.AppointmentDate,
                AppointmentEndDate: headerInfo.AppointmentEndDate,
                NoofDays: headerInfo.NoofDays,
                StartTime: headerInfo.StartTime,
                EndTime: headerInfo.EndTime,
                TotalNetAmount: headerInfo.TotalNetAmount,
                GrossAmount: headerInfo.GrossAmount,
                DiscountAmount: headerInfo.DiscountAmount,
                VATAmount: headerInfo.VATAmount,
                MinAdvance: headerInfo.MinAdvance,
                IsVaccineOrders: headerInfo.IsVaccineOrders || false,
                IsLab: headerInfo.IsLab || false,
                IsLabOrders: headerInfo.IsLabOrders || false,
                IsOxygenOrders: headerInfo.IsOxygenOrders || false,
                Address: headerInfo.Address,
                Landmark: headerInfo.Landmark,
                ProofTypeId: headerInfo.ProofTypeId,
                IssueAuthorityId: headerInfo.IssueAuthorityId,
                CovidId: headerInfo.CovidId,
                AllergiesId: headerInfo.AllergiesId,
                DiseaseId: headerInfo.DiseaseId,
                Disease: headerInfo.Disease,
                ProofIdentify: headerInfo.ProofIdentify,
                Details: headerInfo.Details,
                VaccineDetails: headerInfo.VaccineDetails,
                IsBooking: headerInfo.IsBooking || false,
                PaymentGatewayRefNo: headerInfo.PaymentGatewayRefNo,
                IsRenewed: headerInfo.IsRenewed,
                vorderId: headerInfo.vorderId,
            };
            let orderReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: PatientOrderFilters.PatientId, Value: OrderDataHeader.PatientId },
                    { Key: PatientOrderFilters.FacilityId, Value: OrderDataHeader.FacilityId },
                    // { Key: PatientOrderFilters.SubCategoryId, Value: OrderDataHeader.VirtualSubCategoryId },
                    { Key: PatientOrderFilters.OrderStatus, Value: '1,10' },
                ]
            };
            let emrBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
            let orderData = await emrBO.GetPatientOrders(orderReq);
            if (orderData.Data.length > 0 && OrderDataHeader.IsVaccineOrders) {
                throw { code: 'ALREADYEXIST' };
            }
            let generateTransaction = 0;
            if (!OrderDataHeader.OrderNumber && OrderDataHeader.VirtualOrderStatusId === 1) {
                req.Data.OrderNumber = null;
                generateTransaction = 1;
            }
            let file = this.Request.file;
            if (file) {
                OrderDataHeader.ProofIdentify = file.path;
            }
            let result = await this.Save(OrderDataHeader);
            // let patId = OrderDataHeader.PatientId;
            vOrderid = result.dataValues.Id;
            if (generateTransaction === 1) {
                this.deferSequenceKey(vOrderid, 'OrderNumber',
                    this.getSequenceIdentifier(SequenceKeys.VirtualOrderId));
            }
            // if (OrderDataHeader.Address) {
            //     let patinfo: any = {
            //         Data: {
            //             Id: OrderDataHeader.PatientId,
            //             AddressLine1: OrderDataHeader.Address
            //         }
            //     };
            //     let regBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            //     await regBO.UpdatePatientFromOrder(patinfo);
            // }
            // let vaccinequestionBo = BoFactory.GetBo(bo.VaccineOrderQuestionBo, this.Request);
            // await vaccinequestionBo.ManageVaccineOrderQuestion(vOrderid, patId, req.VaccineData);
            let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
            await detailBO.ManageVirtualOrderDetail(vOrderid, OrderDataHeader.Details);
            ordId = await this.DirectConfirmVirtualOrder(vOrderid, OrderDataHeader);
        }
        return ordId;
    }

    //UpdateVirtualOrderPaymentgateway api
    public async UpdateVirtualOrderPaymentgateway(req: any): Promise<any> {
        for (let idx in req.Data) {
            let headerInfo = req.Data[idx];
            let OrderDataHeader: any = {
                Id: Number(headerInfo.Id),
                VirtualOrderStatusId: headerInfo.VirtualOrderStatusId,
                PaymentGatewayRefNo: headerInfo.PaymentGatewayRefNo,
            };
            let result = await this.Update(OrderDataHeader);
            return result;
        }
    }
    public async UpdateVirtualOrder(req: BaseRequest): Promise<boolean> {
        let generateTransaction = 0;
        let file = this.Request.file;
        if (file) {
            req.Data.Header.ProofIdentify = file.path;
        }
        if (!req.Data.Header.OrderNumber) {
            req.Data.OrderNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Update(req.Data.Header);
        let vOrderid = req.Data.Header.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vOrderid, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualOrderId));
        }
        if (req.Data.PatData) {
            let patinfo: any = {
                Data: req.Data.PatData
            };
            let regBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            await regBO.UpdatePatient(patinfo);
        }
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.Header.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.Header.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (doctorData && (doctorData.NotificationToken && req.Data.Header.VirtualOrderStatusId === 8)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', ' + vPatientName + ' has cancelled the appointment on ' + moment(req.Data.Header.OrderRequestDate).format('YYYY-MM-DD') + ' ' + req.Data.Header.StartTime + '.';
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
        if (patient && (patient.NotificationToken && req.Data.Header.VirtualOrderStatusId === 8)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', you has cancelled the appointment on ' + moment(req.Data.Header.OrderRequestDate).format('YYYY-MM-DD') + ' ' + req.Data.Header.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (doctorData.NotificationToken) {
                pushTokens.push(doctorData.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        await detailBO.ManageVirtualOrderDetail(vOrderid, req.Data.Details);
        if (result && req.Data.Header.VirtualOrderStatusId === 8) {
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            let ApnmntData = await AppBo.GetAppointmentById({ Id: req.Data.Header.AppointmentId });
            let AppointmentData: any = {
                Id: ApnmntData.Id,
                AppointmentStatusId: 5
            };
            let apntUpdate = await AppBo.Update(AppointmentData);
            if (apntUpdate) {
                await this.sendDocCancelSMS(req.Data.Header);
            }
        }
        return result;
    }

    // public async UpdateVaccineCard(req: any): Promise<any> {
    //     // let result = await this.Update(req.Data);
    //     for (let idx in req.Data) {
    //         let headerInfo = req.Data[idx];
    //         let OrderDataHeader: any = {
    //             Id: Number(headerInfo.Id),
    //             VaccinationTypeId: headerInfo.VaccinationTypeId,
    //             Batch: headerInfo.Batch,
    //             Manufacturer: headerInfo.Manufacturer,
    //             OrderRequestDate: headerInfo.OrderRequestDate,
    //             VaccineCardPath: headerInfo.VaccineCardPath,
    //             VaccinatedBy: headerInfo.VaccinatedBy,
    //             VaccineCenterName: headerInfo.VaccineCenterName,
    //             DosageId: headerInfo.DosageId,
    //         };
    //         let file = this.Request.file;
    //         if (file) {
    //             OrderDataHeader.VaccineCardPath = file.path;
    //         }
    //         let apiReq = {
    //             Id: 0,
    //             PageContext: { PageSize: 50, PageNumber: 1 },
    //             Params: [
    //                 { Key: PatientOrderFilters.VirtualOrderId, Value: req.Data.Id },
    //             ]
    //         };
    //         let patOrdBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
    //         let patOrderInfo = await patOrdBO.GetPatientOrders(apiReq);
    //         if (patOrderInfo.Data.length > 0) {
    //             let OrderData = patOrderInfo.Data[0];
    //             let PatOrderData: any = {
    //                 Id: OrderData.Id,
    //                 VaccinationTypeId: Number(req.Data.VaccinationTypeId),
    //                 DosageId: Number(req.Data.DosageId),
    //                 Manufacturer: req.Data.Manufacturer,
    //                 Batch: req.Data.Batch,
    //                 VaccineCenterName: req.Data.VaccineCenterName,
    //                 VaccinatedBy: req.Data.VaccinatedBy,551
    //             };
    //             await patOrdBO.Update(PatOrderData);
    //         }
    //         let result = await this.Update(OrderDataHeader);
    //         return result;
    //     }
    // }

    public async GetVaccineCardPic(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.VaccineCardPath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async sendDocCancelSMS(req: any): Promise<boolean> {
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let appointmentBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
        let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        let patientData: any = {};
        let UserData: any = {};
        let smsmodel: any = {};
        if (req) {
            if (req.PatientId) {
                patientData = await patientBO.GetPatientById({ Id: req.PatientId });
            }
            UserData = await userBO.GetUserById({ Id: req.DoctorId });
        } else {
            patientData = await patientBO.GetPatientById({ Id: req.Data.PatientId });
        }
        if (patientData) {
            if (patientData.Mobile) {
                let smsProvider = this.GetSmsProvider();
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo = null;
                smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('DoctorConsultCancel', 'DoctorConsultCancel', 1);
                if (smsTemplateInfo) {
                    let vPatientName = '';
                    vPatientName = await appointmentBo.getPatientName(patientData);
                    let vDoctorName = '';
                    vDoctorName = await appointmentBo.getDoctorName(UserData);
                    let dateformat = 'DD/MM/YYYY';
                    smsmodel = {
                        numbers: [patientData.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                displaydate: moment(req.OrderScheduleDate).format(dateformat),
                                displaytime: req.StartTime,
                            })
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                    }
                }
            }
        }
        let alertBO = BoFactory.GetBo(genMasbo.PatientAlertBo, this.Request);
        let alertData: any = {
            Data: {
                Id: 0,
                PatientId: req.PatientId,
                AlertDescription: smsmodel.message,
                Status: 1
            }
        };
        await alertBO.AddPatientAlert(alertData);
        return true;
    }


    // public async GetAttachmentFile(req: BaseRequest): Promise<any> {
    //     let fileBuff = await readFileSync(req.Data.ProofIdentify);
    //     let logoBase64 = new Buffer(fileBuff).toString('base64');
    //     return { Id: req.Data.Id, ProofIdentify: logoBase64 };
    // }
    public async DirectConfirmVirtualOrder(orderId: number, headerInfo: any): Promise<any> {
        let virtualId = orderId;
        let appId: number = 0;
        let encId: number = 0;
        let AppointmentData: any = {
            Data: {
                Id: 0,
                FacilityId: headerInfo.FacilityId,
                AppointmentCategoryId: 5,
                AppointmentDate: headerInfo.AppointmentDate,
                AppointmentEndDate: headerInfo.AppointmentEndDate,
                NoofDays: headerInfo.NoofDays,
                MinAdvance: headerInfo.MinAdvance,
                AppointmentStatusId: 6,
                AppointmentTypeId: 1,
                VisitTypeId: 1,
                AssignedUserId: headerInfo.DoctorId,
                AssignedUserName: headerInfo.DoctorName,
                DepartmentId: headerInfo.DepartmentId,
                DoctorId: headerInfo.DoctorId,
                PatientId: headerInfo.PatientId,
                PriorityId: 3,
                OrderScheduledId: -1,
                StartTime: headerInfo.StartTime,
                EndTime: headerInfo.EndTime,
                IsVirtualAppointments: true,
                PaymentGatewayRefNo: headerInfo.PaymentGatewayRefNo,
                PaymentModeId: headerInfo.PaymentModeId,
                Amount: headerInfo.Amount,
                PaymentStatusId: headerInfo.PaymentStatusId,
                BankName: headerInfo.BankName,
                ApprovalNumber: headerInfo.ApprovalNumber,
                SubCategoryId: headerInfo.VirtualSubCategoryId,
                vorderId: headerInfo.vorderId,
                IsRenewed: headerInfo.IsRenewed,
            }
        };
        let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
        appId = await AppBo.AddOrderVirtualAppointment(AppointmentData);
        let encBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: EncounterFilters.PatientId, Value: headerInfo.PatientId },
                // { Key: EncounterFilters.IsLatest, Value: true },
                // { Key: EncounterFilters.EncounterStatus, Value: 1 }
            ]
        };
        let encData = await encBO.GetEncounters(EncReq);
        if (encData.Data.length > 0) {
            encId = encData.Data[0].Id;
        } else {
            let EncData: any = {
                Data: {
                    Id: 0,
                    EncounterTypeId: 1,
                    VisitIdentifier: '',
                    PatientId: headerInfo.PatientId,
                    DepartmentId: headerInfo.DepartmentId,
                    DoctorId: headerInfo.DoctorId,
                    AdmissionDate: headerInfo.AppointmentDate,
                    IsLatest: true,
                    AppointmentId: appId || 0,
                    EncounterStatusId: 1,
                    VisitTypeId: 1,
                }
            };
            encId = await encBO.AddEncounter(EncData);
        }
        let assignData: any = {
            Id: virtualId,
            VirtualOrderStatusId: 2,
            AppointmentId: appId
        };
        await this.Update(assignData);
        let OrderId = await this.UpdateVirtualLabOrder(virtualId, headerInfo, encId);
        return OrderId;
    }

    public async UpdateVirtualLabOrder(virtualId: number, req: any, encId: number): Promise<any> {
        let porderId: number;
        if (req.OrderModeId === 2 && req.IsLab) {
            req.IsVirtualOrders = true;
            let emrBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
            req.Id = 0;
            req.OrderStatusId = 1;
            req.TestTypeId = 1;
            req.EncounterId = encId;
            req.VirtualOrderId = virtualId;
            req.SubCategoryId = req.VirtualSubCategoryId;
            req.StartTime = req.StartTime;
            req.EndTime = req.EndTime;
            req.IsLabOrders = req.IsLabOrders || false;
            req.IsVaccineOrders = req.IsVaccineOrders || false;
            req.IsLab = req.IsLab || false;
            req.ResultFormatTypeId = req.ResultFormatTypeId;
            req.IsRenewed = req.IsRenewed || false;
            if (req.PaymentModeId === 2) {
                req.IsPaidFully = false;
            } else {
                req.IsPaidFully = true;
            }
            porderId = await emrBO.AddVirtualPatientOrder(req);
            await this.DirectAssignLabVirtualOrder(virtualId, req);
        } else if (req.OrderModeId === 2 && req.IsVaccineOrders) {
            req.IsVirtualOrders = true;
            let emrBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
            req.Id = 0;
            req.OrderStatusId = 1;
            req.EncounterId = encId;
            req.VirtualOrderId = virtualId;
            req.SubCategoryId = req.VirtualSubCategoryId;
            req.StartTime = req.StartTime;
            req.EndTime = req.EndTime;
            req.IsGovtApproved = false;
            req.IsLabOrders = req.IsLabOrders || false;
            req.IsVaccineOrders = req.IsVaccineOrders || false;
            req.IsLab = req.IsLab || false;
            req.IsBooking = req.IsBooking || false;
            req.IsRenewed = req.IsRenewed || false;
            // if (req.PaymentModeId === 2) {
            //     req.IsPaidFully = false;
            // } else {
            //     req.IsPaidFully = true;
            // }
            porderId = await emrBO.AddVirtualPatientOrder(req);
            await this.DirectAssignLabVirtualOrder(virtualId, req);
        } else if (req.OrderModeId === 2 && req.IsOxygenOrders) {
            req.IsVirtualOrders = true;
            let emrBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
            req.Id = 0;
            req.OrderStatusId = 1;
            req.EncounterId = encId;
            req.VirtualOrderId = virtualId;
            req.SubCategoryId = req.VirtualSubCategoryId;
            req.StartTime = req.StartTime;
            req.EndTime = req.EndTime;
            req.IsGovtApproved = false;
            req.IsLabOrders = req.IsLabOrders || false;
            req.IsOxygenOrders = req.IsOxygenOrders || false;
            req.IsLab = req.IsLab || false;
            req.IsBooking = req.IsBooking || false;
            req.vorderId = req.vorderId;
            req.IsRenewed = req.IsRenewed || false;
            // if (req.PaymentModeId === 2) {
            //     req.IsPaidFully = false;
            // } else {
            //     req.IsPaidFully = true;
            // }
            porderId = await emrBO.AddVirtualPatientOrder(req);
            await this.DirectAssignLabVirtualOrder(virtualId, req);
        }
        return porderId;
    }

    // public async GetProofIdentifyFile(req: BaseRequest, res: any): Promise<any> {
    //     let result = await res.download(req.Data.Header.ProofIdentify);
    //     return result;
    // }

    public async DirectAssignLabVirtualOrder(orderId: number, req: BaseRequest): Promise<any> {
        let virtualId = orderId;
        let assignData: any = {
            Id: virtualId,
            VirtualOrderStatusId: 3
        };
        let result = await this.Update(assignData);
        return result;
    }

    public async AddDoctorConsultVirtualOrder(req: BaseRequest): Promise<number> {
        let generateTransaction = 0;
        if (!req.Data.Header.OrderNumber && req.Data.Header.VirtualOrderStatusId === 1) {
            req.Data.OrderNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Save(req.Data.Header);
        let vOrderid = result.dataValues.Id;
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.Header.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.Header.PatientId);

        if (doctorData && (doctorData.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', ' + patient.FirstName + ' has booked appointment on ' + moment(req.Data.Header.OrderRequestDate).format('YYYY-MM-DD') + ' ' + req.Data.Header.StartTime + '.';
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
        console.log('doctorData.DoctorName', doctorData.DoctorName);
        console.log('req.Data', req.Data);
        console.log('req.Data.StartTime', req.Data.StartTime);

        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken || patient.WebNotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ' appointment booked on ' + moment(req.Data.Header.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.Header.StartTime + '   with doctor ' + req.Data.Header.DoctorName + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };

            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            if (patient.WebNotificationToken) {
                pushTokens.push(patient.WebNotificationToken);
            }

            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        if (generateTransaction === 1) {
            this.deferSequenceKey(vOrderid, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualOrderId));
        }
        if (req.Data.PatData) {
            let patinfo: any = {
                Data: req.Data.PatData
            };
            let regBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            await regBO.UpdatePatient(patinfo);
        }
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        if (req.Data.Details) {
            await detailBO.ManageVirtualOrderDetail(vOrderid, req.Data.Details);
        }
        await this.DirectDocConfirmVirtualOrder(req, vOrderid);
        return vOrderid;
    }

    public async DirectDocConfirmVirtualOrder(req: BaseRequest, vOrderid: number): Promise<any> {
        let appId: number = 0;
        let encId: number = 0;
        if (req.Data.Header.CategoryTypeId === 1) {
            let apnmntStatus: any;
            let ispaid: any;
            // if (req.Data.Header.VirtualCategoryId === 5) {
            //     apnmntStatus = 2;
            //     if (req.Data.Header.PaymentModeId === 2) {
            //         ispaid = false;
            //     } else {
            //         ispaid = true;
            //     }
            // } else {
            apnmntStatus = 2;
            ispaid = true;
            // }

            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    FacilityId: req.Data.Header.FacilityId,
                    AppointmentCategoryId: 5,
                    AppointmentDate: req.Data.Header.AppointmentDate,
                    AppointmentStatusId: apnmntStatus,
                    AppointmentTypeId: 1,
                    VisitTypeId: 1,
                    AssignedUserId: req.Data.Header.DoctorId,
                    AssignedUserName: req.Data.Header.DoctorName,
                    DepartmentId: req.Data.Header.DepartmentId,
                    DoctorId: req.Data.Header.DoctorId,
                    PatientId: req.Data.Header.PatientId,
                    PriorityId: 3,
                    OrderScheduledId: -1,
                    StartTime: req.Data.Header.StartTime,
                    EndTime: req.Data.Header.EndTime,
                    IsVirtualAppointments: true,
                    PaymentGatewayRefNo: req.Data.Header.PaymentGatewayRefNo,
                    PaymentModeId: req.Data.Header.PaymentModeId,
                    Amount: req.Data.Header.Amount,
                    PaymentStatusId: req.Data.Header.PaymentStatusId,
                    BankName: req.Data.Header.BankName,
                    ApprovalNumber: req.Data.Header.ApprovalNumber,
                    SubCategoryId: req.Data.Header.VirtualSubCategoryId,
                    OrderConsultTypeId: req.Data.Header.OrderConsultTypeId,
                    VirtualOrderId: vOrderid,
                    IsPaid: ispaid
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            appId = await AppBo.AddVirtualAppointment(AppointmentData);
            let encBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let EncReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: EncounterFilters.PatientId, Value: req.Data.Header.PatientId },
                    { Key: EncounterFilters.IsLatest, Value: true },
                    { Key: EncounterFilters.EncounterStatus, Value: 1 }
                ]
            };
            let encData = await encBO.GetEncounters(EncReq);
            if (encData.Data.length > 0) {
                encId = encData.Data[0].Id;
                let EncData: any = {
                    Data: {
                        Id: encId,
                        EncounterTypeId: 1,
                        // VisitIdentifier: '',
                        // PatientId: req.Data.Header.PatientId,
                        DepartmentId: req.Data.Header.DepartmentId,
                        DoctorId: req.Data.Header.DoctorId,
                        AdmissionDate: req.Data.Header.AppointmentDate,
                        IsLatest: true,
                        AppointmentId: appId || 0,
                        EncounterStatusId: 1,
                        VisitTypeId: 1,
                    }
                };
                await encBO.Update(EncData.Data);
            } else {
                let EncData: any = {
                    Data: {
                        Id: 0,
                        EncounterTypeId: 1,
                        VisitIdentifier: '',
                        PatientId: req.Data.Header.PatientId,
                        DepartmentId: req.Data.Header.DepartmentId,
                        DoctorId: req.Data.Header.DoctorId,
                        AdmissionDate: req.Data.Header.AppointmentDate,
                        IsLatest: true,
                        AppointmentId: appId || 0,
                        EncounterStatusId: 1,
                        VisitTypeId: 1,
                    }
                };
                encId = await encBO.AddEncounter(EncData);
            }
        }
        let assignData: any = {
            Id: vOrderid,
            VirtualOrderStatusId: 2,
            AppointmentId: appId
        };
        let result = await this.Update(assignData);
        // let vOrderid = req.Data.Header.Id;
        // let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        // await detailBO.ManageVirtualOrderDetail(vOrderid, req.Data.Details);
        let billBO = BoFactory.GetBo(bo.VirtualBillBo, this.Request);
        await billBO.AddVirtualBill(req);
        if (req.Data.Header.CategoryTypeId === 1 && req.Data.Header.OrderConsultTypeId === 2) {
            let conferenceData: any = {
                Data: {
                    Id: 0,
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: req.Data.Header.FacilityId,
                    ConferenceScheduleDate: req.Data.Header.OrderScheduleDate,
                    PatientId: req.Data.Header.PatientId,
                    EncounterId: encId,
                    AppointmentId: appId,
                    OrderId: vOrderid,
                    ParticipantTypeId: 2,
                    ConferenceName: 'Online Consultation',
                    ConferenceDate: req.Data.Header.OrderScheduleDate,
                    ConferenceTime: req.Data.Header.StartTime,
                    Duration: 15,
                    AllowRecording: false,
                    Description: 'TeleConsultation',
                    DoctorId: req.Data.Header.DoctorId,
                    DoctorName: req.Data.Header.DoctorName,
                    StartTime: req.Data.Header.StartTime,
                    EndTime: req.Data.Header.EndTime,
                    ConferenceStatusId: 2,
                    IsActive: false,
                    LockSettingsDisablePrivateChat: true,
                    LockSettingsDisableCam: true,
                    WebcamsOnlyForModerator: true,
                }
            };
            let confBO = BoFactory.GetBo(bo.VirtualConferenceBo, this.Request);
            let conferenceId = await confBO.AddVirtualConference(conferenceData);

            let ConfPartData: any = {
                Data: {
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: this.Session.FacilityId,
                    ConferenceId: conferenceId,
                    ParticipantName: req.Data.Header.PatientName,
                    ParticipantUserId: req.Data.Header.PatUserId,
                    DoctorId: req.Data.Header.DoctorId,
                    IsActive: true
                }
            };
            let confpartBO = BoFactory.GetBo(bo.VirtualConferenceParticipantBo, this.Request);
            await confpartBO.AddVirtualConferenceParticipant(ConfPartData);
        }
        if (appId) {
            await this.sendDocConfirmSMS(req.Data.Header, vOrderid);
        }
        await this.DirectAssignVirtualOrder(req, vOrderid, appId, encId);
        return result;
    }

    public async sendDocConfirmSMS(req: any, vOrderid: number): Promise<boolean> {
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let appointmentBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
        let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        let patientData: any = {};
        let UserData: any = {};
        let smsmodel: any = {};
        if (req) {
            if (req.PatientId) {
                patientData = await patientBO.GetPatientById({ Id: req.PatientId });
            }
            UserData = await userBO.GetUserById({ Id: req.DoctorId });
        } else {
            patientData = await patientBO.GetPatientById({ Id: req.Data.PatientId });
        }
        if (patientData) {
            if (patientData.Mobile) {
                let smsProvider = this.GetSmsProvider();
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo = null;
                smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('DoctorConsultOrder', 'DoctorConsultOrderConfirm', 1);
                if (smsTemplateInfo) {
                    let vPatientName = '';
                    vPatientName = await appointmentBo.getPatientName(patientData);
                    let vDoctorName = '';
                    vDoctorName = await appointmentBo.getDoctorName(UserData);
                    let dateformat = 'DD/MM/YYYY';
                    smsmodel = {
                        numbers: [patientData.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                doctorName: vDoctorName,
                                displaydate: moment(req.OrderScheduleDate).format(dateformat),
                                displaytime: req.StartTime,
                            })
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                    }
                }
            }
        }
        let alertBO = BoFactory.GetBo(genMasbo.PatientAlertBo, this.Request);
        let alertData: any = {
            Data: {
                Id: 0,
                PatientId: req.PatientId,
                AlertDescription: smsmodel.message,
                Status: 1
            }
        };
        await alertBO.AddPatientAlert(alertData);
        return true;
    }

    public async DirectAssignVirtualOrder(req: BaseRequest, vorderid: number, appId: number, encId: number): Promise<any> {
        let assignData: any = {
            Id: vorderid,
            VirtualOrderStatusId: 3,
            DoctorId: req.Data.Header.DoctorId,
            OrderToId: req.Data.Header.DepartmentId,
            DoctorName: req.Data.Header.DoctorName
        };
        let result = await this.Update(assignData);
        // if (req.Data.Header.VirtualCategoryId !== 5) {
        //     let encounterDoctor: any = {
        //         Data: {
        //             Id: 0,
        //             PatientId: req.Data.Header.PatientId,
        //             EncounterId: encId,
        //             EncounterConsulationId: null,
        //             AppointmentId: appId,
        //             VisitIdentifier: null,
        //             ConsultationNumber: null,
        //             DoctorId: req.Data.Header.DoctorId,
        //             DoctorName: req.Data.Header.AssignedUserName,
        //             DepartmentId: req.Data.Header.DepartmentId,
        //             SpecialityId: null,
        //             FacilityId: req.Data.Header.FacilityId,
        //             StartDate: req.Data.Header.OrderScheduleDate,
        //             EndDate: null,
        //             IsVirtualConsultation: true,
        //             VirtualCategoryId: req.Data.Header.VirtualCategoryId,
        //             OrderConsultTypeId: req.Data.Header.OrderConsultTypeId,
        //             VirtualOrderId: vorderid,
        //             EncounterDoctorStatus: 1 //Pending
        //         }
        //     };
        //     let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        //     await encounterDocBO.AddEncounterDoctor(encounterDoctor);
        // }
        // let vOrderid = req.Data.Header.Id;
        // let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        // await detailBO.ManageVirtualOrderDetail(vorderid, req.Data.Details);
        // let billBO = BoFactory.GetBo(bo.VirtualBillBo, this.Request);
        // await billBO.UpdateVirtualBillOrder(req);
        return result;
    }

    public async UpdateVirtualOrderFromBill(req: BaseRequest): Promise<any> {
        let billBO = BoFactory.GetBo(bo.VirtualBillBo, this.Request);
        let data = await billBO.GetVirtualBillById(req.Data.Header);
        let OrderbillData: any = {
            Data: {
                Id: req.Data.Header.VirtualOrderId,
                VirtualBillId: req.Data.Header.Id,
                VirtualBillStatusId: req.Data.Header.VirtualBillStatusId,
                VirtualBillNumber: data.BillNumber,
                VirtualBillAmount: req.Data.Header.BillAmount,
            }
        };
        let result = await this.Update(OrderbillData.Data);
        let vOrderid = req.Data.Header.VirtualOrderId;
        let billDetails: any = req.Data.Details;
        let ordDetails: any = [];
        for (let idx in billDetails) {
            let detail = billDetails[idx];
            let orderDetailData: any = {
                Id: detail.VirtualOrderDetailId,
                VirtualBillDetailId: detail.Id,
                VirtualBillId: detail.VirtualBillId,
                VirtualBillStatusId: detail.VirtualBillStatusId
            };
            ordDetails.push(orderDetailData);
        }
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        await detailBO.ManageVirtualOrderDetail(vOrderid, ordDetails);
        return result;
    }

    public async ConfirmVirtualOrder(req: BaseRequest): Promise<any> {
        let appId: number = 0;
        if (req.Data.Header.CategoryTypeId === 1) {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    FacilityId: req.Data.Header.FacilityId,
                    AppointmentCategoryId: 5,
                    AppointmentDate: req.Data.Header.AppointmentDate,
                    AppointmentStatusId: 6,
                    AppointmentTypeId: 1,
                    VisitTypeId: 1,
                    AssignedUserId: req.Data.Header.DoctorId,
                    AssignedUserName: req.Data.Header.DoctorName,
                    DepartmentId: req.Data.Header.DepartmentId,
                    DoctorId: req.Data.Header.DoctorId,
                    PatientId: req.Data.Header.PatientId,
                    PriorityId: 3,
                    OrderScheduledId: -1,
                    StartTime: req.Data.Header.StartTime,
                    IsVirtualAppointments: true,
                    EndTime: req.Data.Header.EndTime,
                    PaymentGatewayRefNo: req.Data.Header.PaymentGatewayRefNo,
                    PaymentModeId: req.Data.Header.PaymentModeId,
                    Amount: req.Data.Header.Amount,
                    PaymentStatusId: req.Data.Header.PaymentStatusId,
                    BankName: req.Data.Header.BankName,
                    ApprovalNumber: req.Data.Header.ApprovalNumber,
                    SubCategoryId: req.Data.Header.VirtualSubCategoryId,
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            appId = await AppBo.AddOrderVirtualAppointment(AppointmentData);
        }
        let assignData: any = {
            Id: req.Data.Header.Id,
            VirtualOrderStatusId: 2,
            AppointmentId: appId
        };
        let result = await this.Update(assignData);
        let vOrderid = req.Data.Header.Id;
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        await detailBO.ManageVirtualOrderDetail(vOrderid, req.Data.Details);
        let billBO = BoFactory.GetBo(bo.VirtualBillBo, this.Request);
        await billBO.AddVirtualBill(req);
        if (req.Data.Header.CategoryTypeId === 1 && req.Data.Header.OrderConsultTypeId === 2) {
            let conferenceData: any = {
                Data: {
                    Id: 0,
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: this.Session.FacilityId,
                    ConferenceScheduleDate: req.Data.Header.OrderScheduleDate,
                    PatientId: req.Data.Header.PatientId,
                    EncounterId: req.Data.Header.EncounterId,
                    AppointmentId: appId,
                    OrderId: req.Data.Header.Id,
                    ParticipantTypeId: 2,
                    ConferenceName: 'Online Consultation',
                    ConferenceDate: req.Data.Header.OrderScheduleDate,
                    ConferenceTime: req.Data.Header.StartTime,
                    Duration: 15,
                    AllowRecording: false,
                    Description: 'TeleConsultation',
                    DoctorId: req.Data.Header.DoctorId,
                    DoctorName: req.Data.Header.DoctorName,
                    StartTime: req.Data.Header.StartTime,
                    EndTime: req.Data.Header.EndTime,
                    ConferenceStatusId: 2,
                    IsActive: false,
                    LockSettingsDisablePrivateChat: true,
                    LockSettingsDisableCam: true,
                    WebcamsOnlyForModerator: true,
                }
            };
            let confBO = BoFactory.GetBo(bo.VirtualConferenceBo, this.Request);
            let conferenceId = await confBO.AddVirtualConference(conferenceData);

            let ConfPartData: any = {
                Data: {
                    OrganizationId: this.Session.OrganizationId,
                    FacilityId: this.Session.FacilityId,
                    ConferenceId: conferenceId,
                    ParticipantName: req.Data.Header.PatientName,
                    ParticipantUserId: req.Data.Header.PatUserId,
                    DoctorId: req.Data.Header.DoctorId,
                    IsActive: true
                }
            };
            let confpartBO = BoFactory.GetBo(bo.VirtualConferenceParticipantBo, this.Request);
            await confpartBO.AddVirtualConferenceParticipant(ConfPartData);
        }
        return result;
    }

    public async AssignVirtualOrder(req: BaseRequest): Promise<any> {
        let assignData: any = {
            Id: req.Data.Header.Id,
            VirtualOrderStatusId: 3,
            DoctorId: req.Data.Header.DoctorId,
            OrderToId: req.Data.Header.DepartmentId,
            DoctorName: req.Data.Header.DoctorName
        };
        let result = await this.Update(assignData);
        let encounterDoctor: any = {
            Data: {
                Id: 0,
                PatientId: req.Data.Header.PatientId,
                EncounterId: req.Data.Header.EncounterId,
                EncounterConsulationId: null,
                AppointmentId: req.Data.Header.AppointmentId,
                VisitIdentifier: null,
                ConsultationNumber: null,
                DoctorId: req.Data.Header.DoctorId,
                DoctorName: req.Data.Header.AssignedUserName,
                DepartmentId: req.Data.Header.DepartmentId,
                SpecialityId: null,
                FacilityId: req.Data.Header.FacilityId,
                StartDate: req.Data.Header.OrderScheduleDate,
                EndDate: null,
                IsVirtualConsultation: true,
                VirtualCategoryId: req.Data.Header.VirtualCategoryId,
                VirtualOrderId: req.Data.Header.Id,
                EncounterDoctorStatus: 1 //Pending
            }
        };
        let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encounterDocBO.AddEncounterDoctor(encounterDoctor);
        let vOrderid = req.Data.Header.Id;
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        await detailBO.ManageVirtualOrderDetail(vOrderid, req.Data.Details);
        // let billBO = BoFactory.GetBo(bo.VirtualBillBo, this.Request);
        // await billBO.UpdateVirtualBillOrder(req);
        return result;
    }

    public async UpdateOrderWhileattend(req: BaseRequest): Promise<boolean> {
        let vOrderInfo = await this.GetVirtualOrderById({ Id: req.Data.oid });
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: VirtualOrderDetailFilters.VirtualOrderId, Value: req.Data.oid }
            ]
        };
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        let OrderDetdata = await detailBO.GetVirtualOrderDetails(apiReq);
        vOrderInfo.VirtualOrderStatusId = 5;
        let result = await this.Update(vOrderInfo);
        let vOrderid = vOrderInfo.Id;
        let detailsData: any = {};
        let DetailData: any = [];
        for (let idx in OrderDetdata.Data) {
            detailsData = OrderDetdata.Data[idx];
            detailsData.VirtualOrderDetailStatusId = 5;
            DetailData.push(detailsData);
        }
        await detailBO.ManageVirtualOrderDetail(vOrderid, DetailData);
        return result;
    }

    public async UpdateCompleteOrder(req: BaseRequest): Promise<boolean> {
        let vOrderInfo = await this.GetVirtualOrderById({ Id: req.Data.oid });
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: VirtualOrderDetailFilters.VirtualOrderId, Value: req.Data.oid }
            ]
        };
        let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
        let OrderDetdata = await detailBO.GetVirtualOrderDetails(apiReq);
        vOrderInfo.VirtualOrderStatusId = 6;
        let result = await this.Update(vOrderInfo);
        let vOrderid = vOrderInfo.Id;
        let detailsData: any = {};
        let DetailData: any = [];
        for (let idx in OrderDetdata.Data) {
            detailsData = OrderDetdata.Data[idx];
            detailsData.VirtualOrderDetailStatusId = 6;
            DetailData.push(detailsData);
        }
        await detailBO.ManageVirtualOrderDetail(vOrderid, DetailData);
        return result;
    }

    public async UpdateRescheduleVirtualOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
        let ApnmntData = await AppBo.GetAppointmentById({ Id: req.Data.AppointmentId });
        let apnmntData: any = {
            Id: ApnmntData.Id,
            AppointmentDate: req.Data.AppointmentDate,
            StartTime: req.Data.StartTime,
            EndTime: req.Data.EndTime,
            IsRescheduled: true
        };
        await AppBo.Update(apnmntData);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: EncounterDoctorFilters.AppointmentId, Value: req.Data.AppointmentId },
                { Key: EncounterDoctorFilters.VirtualOrderId, Value: req.Data.Id },
            ]
        };
        let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        let enDocInfo = await encounterDocBO.GetEncounterDoctors(apiReq);
        if (enDocInfo.Data.length > 0) {
            let encdoctorData = enDocInfo.Data[0];
            let encdocData: any = {
                Id: encdoctorData.Id,
                StartDate: req.Data.AppointmentDate,
            };
            await encounterDocBO.Update(encdocData);
        }
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.Header.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.Header.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (doctorData && (doctorData.NotificationToken && req.Data.Header.VirtualOrderStatusId === 9)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.DoctorName + ', ' + patient.FirstName + ' has rescheduled the appointment on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (doctorData.NotificationToken) {
                pushTokens.push(doctorData.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        if (patient && (patient.NotificationToken && req.Data.Header.VirtualOrderStatusId === 9)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', you have rescheduled the appointment on ' + moment(req.Data.AppointmentDate).format('YYYY-MM-DD') + ' ' + req.Data.StartTime + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (doctorData.NotificationToken) {
                pushTokens.push(doctorData.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        return result;
    }

    // public async UpdateRescheduleDiagnosticOrder(req: BaseRequest): Promise<boolean> {
    //     let result = await this.Update(req.Data);
    //     let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
    //     let ApnmntData = await AppBo.GetAppointmentById({ Id: req.Data.AppointmentId });
    //     let apnmntData: any = {
    //         Id: ApnmntData.Id,
    //         AppointmentDate: req.Data.AppointmentDate,
    //         StartTime: req.Data.StartTime,
    //         EndTime: req.Data.EndTime,
    //         IsRescheduled: true
    //     };
    //     await AppBo.Update(apnmntData);
    //     let apiReq = {
    //         Id: 0,
    //         PageContext: { PageSize: 50, PageNumber: 1 },
    //         Params: [
    //             { Key: PatientOrderFilters.VirtualOrderId, Value: req.Data.Id },
    //         ]
    //     };
    //     let patOrdBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
    //     let patOrderInfo = await patOrdBO.GetPatientOrders(apiReq);
    //     if (patOrderInfo.Data.length > 0) {
    //         let OrderData = patOrderInfo.Data[0];
    //         let PatOrderData: any = {
    //             Id: OrderData.Id,
    //             OrderScheduleDate: req.Data.OrderScheduleDate,
    //             StartTime: req.Data.StartTime,
    //             EndTime: req.Data.EndTime,
    //         };
    //         await patOrdBO.Update(PatOrderData);
    //     }
    //     return result;
    // }

    // public async AddVaccineCardOrder(req: any): Promise<any> {
    //     let vOrderid: any;
    //     for (let idx in req.Data) {
    //         let headerInfo = req.Data[idx];
    //         let OrderDataHeader: any = {
    //             Id: 0,
    //             FacilityId: Number(headerInfo.FacilityId),
    //             VirtualCategoryId: Number(headerInfo.VirtualCategoryId),
    //             VirtualSubCategoryId: Number(headerInfo.VirtualSubCategoryId),
    //             CategoryTypeId: Number(headerInfo.CategoryTypeId),
    //             VaccinationTypeId: Number(headerInfo.VaccinationTypeId),
    //             DosageId: Number(headerInfo.DosageId),
    //             PatientId: Number(headerInfo.PatientId),
    //             PatientMRN: headerInfo.PatientMRN,
    //             PatientName: headerInfo.PatientName,
    //             OrderRequestDate: headerInfo.OrderRequestDate,
    //             VirtualOrderStatusId: 1,
    //             OrderModeId: 2,
    //             RequestTypeId: 1,
    //             IsVaccineOrders: headerInfo.IsVaccineOrders || false,
    //             IsVaccineSelfCard: headerInfo.IsVaccineSelfCard || false,
    //             Manufacturer: headerInfo.Manufacturer,
    //             Batch: headerInfo.Batch,
    //             VaccineCenterName: headerInfo.VaccineCenterName,
    //             VaccineCenterId: headerInfo.VaccineCenterId,
    //             VaccinatedBy: headerInfo.VaccinatedBy,
    //             Details: headerInfo.Details,
    //         };

    //         let generateTransaction = 0;
    //         if (!OrderDataHeader.OrderNumber && OrderDataHeader.VirtualOrderStatusId === 1) {
    //             req.Data.OrderNumber = null;
    //             generateTransaction = 1;
    //         }
    //         let file = this.Request.file;
    //         if (file) {
    //             OrderDataHeader.VaccineCardPath = file.path;
    //         }
    //         if (req.Data.iswebcamphoto === true || req.Data.iswebcamphoto === 'true') {
    //             let base64String = req.Data.webcamphoto;
    //             let datetimestamp = Date.now();
    //             let filePath = AppConfig.UploadFilePath + '/' + req.Data.PatientName + '-' + datetimestamp + '.png';
    //             await writeFileSync(filePath, new Buffer(base64String, 'base64'));
    //             req.Data.VaccineCardPath = filePath;
    //         }
    //         let result = await this.Save(OrderDataHeader);

    //         vOrderid = result.dataValues.Id;
    //         if (generateTransaction === 1) {
    //             this.deferSequenceKey(vOrderid, 'OrderNumber',
    //                 this.getSequenceIdentifier(SequenceKeys.VirtualOrderId));
    //         }

    //         let detailBO = BoFactory.GetBo(bo.VirtualOrderDetailBo, this.Request);
    //         await detailBO.ManageVirtualOrderDetail(vOrderid, OrderDataHeader.Details);
    //         await this.UpdateVirtualVaccineCardOrder(OrderDataHeader, vOrderid);
    //     }
    //     return true;
    // }


    // public async UpdateVirtualVaccineCardOrder(req: any, virtualId: number): Promise<any> {
    //     let porderId: number;
    //     req.IsVirtualOrders = true;
    //     let emrBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
    //     req.Id = 0;
    //     req.OrderStatusId = 1;
    //     req.VirtualOrderId = virtualId;
    //     req.SubCategoryId = req.VirtualSubCategoryId;
    //     req.IsVaccineOrders = req.IsVaccineOrders || false;
    //     req.IsVaccineSelfCard = req.IsVaccineSelfCard || false;
    //     porderId = await emrBO.AddVaccineCardOrder(req);
    //     await this.DirectAssignLabVirtualOrder(virtualId, req);
    //     return porderId;
    // }

    public async GetVirtualOrderById(req: BaseRequest): Promise<VirtualOrderAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualOrders(apiReq?: ApiRequest<VirtualOrderFilters>):
        Promise<ApiResponse<VirtualOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AppoinmentRequestType'));
        include.push(this.GetReference('OrderMode'));
        include.push(this.GetReference('OrderConsultType'));
        include.push(this.GetReference('VirtualOrderStatus'));
        include.push(this.GetReference('PaymentMode'));
        // include.push(this.GetReference('ProofType'));
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Appointment, required: false
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false
        });
        include.push({ model: this.Models.VirtualCategory, required: false });
        include.push({ model: this.Models.VirtualSubCategory, required: false });
        include.push({
            model: this.Models.EncounterDoctor, required: false,
            include: [this.GetReference('ConsultationStatus'),]
        });
        include.push({
            model: this.Models.VirtualOrderDetail,
            include: [
                { model: this.Models.ServiceItem, required: false }
            ],
            required: false
        });
        include.push({ model: this.Models.Facility, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualOrderFilters.VirtualOrderStatusId:
                        where['VirtualOrderStatusId'] = param.Value;
                        break;
                    case VirtualOrderFilters.OrderReqDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case VirtualOrderFilters.From:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case VirtualOrderFilters.To:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case VirtualOrderFilters.PatOrderBill:
    let searchValue = param.Value || '';
    where = {
        [Op.or]: [
            { OrderNumber: { [Op.like]: '%' + searchValue + '%' } },
            { PatientMRN: { [Op.like]: '%' + searchValue + '%' } },
            { PatientName: { [Op.like]: '%' + searchValue + '%' } },
            { PatientMobile: { [Op.like]: '%' + searchValue + '%' } }
        ]
    };
break;
        //             case VirtualOrderFilters.PatOrderBill:
        // where = {
        //     [Op.or]: [
        //         { OrderNumber: { [Op.like]: `%${param.Value || ''}%` } },
        //         { PatientMRN: { [Op.like]: `%${param.Value || ''}%` } },
        //         { PatientName: { [Op.like]: `%${param.Value || ''}%` } },
        //         { PatientMobile: { [Op.like]: `%${param.Value || ''}%` } }
        //     ]
        // };
        // break;
                    case VirtualOrderFilters.VirtualCategoryId:
                        where['VirtualCategoryId'] = param.Value;
                        break;
                    case VirtualOrderFilters.VirtualSubCategoryId:
                        where['VirtualSubCategoryId'] = param.Value;
                        break;
                    case VirtualOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case VirtualOrderFilters.OrderSchDate:
                        where['OrderScheduleDate'] = { '$between': param.Value || '' };
                        break;
                    case VirtualOrderFilters.FromSch:
                        where['OrderScheduleDate'] = where['OrderScheduleDate'] || {};
                        (where['OrderScheduleDate'] as any)['$gte'] = param.Value;
                        break;
                    case VirtualOrderFilters.ToSch:
                        where['OrderScheduleDate'] = where['OrderScheduleDate'] || {};
                        (where['OrderScheduleDate'] as any)['$lte'] = param.Value;
                        break;
                    case VirtualOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case VirtualOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualOrderInstance, VirtualOrderAttributes> {
        return this.Models.VirtualOrder;
    }
    public async GetDoctorSummary(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.Facility, as: 'Facility',
            attributes: ['FacilityName'],
            required: true,
            where: { 'FacilityTypeId': 3 }
        };
        if (req.Data.FacilityId > 0) {
            let DoctorInstance: any = await this.FindAll({
                attributes: ['OrderRequestDate', 'OrderScheduleDate', 'FacilityId',
                    'OrderAmount', 'DeliveryAmount', 'TotalNetAmount'],
                where: {
                    MedicineOrderDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: { '$eq': req.Data.FacilityId },
                    MedicineOrderStatusId: { '$ne': 4 }
                },
                include: [DoctorGroupJoin]
            });
            if (DoctorInstance) {
                let groupbills = _.groupBy(DoctorInstance, 'FacilityId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorCount: number = 0;
                    let FacilityId: number = 0;
                    let FacilityName: string = '';
                    let OrderAmount: number = 0;
                    DoctorCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        FacilityId = bills.FacilityId;
                        FacilityName = bills.Facility.FacilityName;
                        OrderAmount = bills.OrderAmount;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[FacilityId] = DoctorGroup[FacilityId] || [];
                    }
                    let info = {
                        'FacilityId': FacilityId,
                        'FacilityName': FacilityName,
                        'DoctorCount': DoctorCount,
                        'OrderAmount': OrderAmount,
                    };
                    DoctorGroup[FacilityId].push(info);
                }
            }
        } else if (req.Data.FacilityId === 0) {
            let DoctorInstance: any = await this.FindAll({
                attributes: ['MedicineOrderDate', 'FacilityId',
                    'OrderAmount', 'DeliveryAmount', 'TotalNetAmount'],
                where: {
                    MedicineOrderDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: { '$gt': req.Data.FacilityId },
                    MedicineOrderStatusId: { '$ne': 4 }
                },
                include: [DoctorGroupJoin]
            });
            if (DoctorInstance) {
                let groupbills = _.groupBy(DoctorInstance, 'FacilityId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorCount: number = 0;
                    let FacilityId: number = 0;
                    let FacilityName: string = '';
                    let OrderAmount: number = 0;
                    DoctorCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        FacilityId = bills.FacilityId;
                        FacilityName = bills.Facility.FacilityName;
                        OrderAmount = bills.OrderAmount;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[FacilityId] = DoctorGroup[FacilityId] || [];
                    }
                    let info = {
                        'FacilityId': FacilityId,
                        'FacilityName': FacilityName,
                        'DoctorCount': DoctorCount,
                        'OrderAmount': OrderAmount,
                    };
                    DoctorGroup[FacilityId].push(info);
                }
            }
        }
        return DoctorGroup;
    }
    public async PrintVirtualAppoinmentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        let data = await this.GetVirtualOrders(apiReq);
        let Virtualappoinment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let Paymenttype = apiReq.Data.Paymenttype;
        let Appoinmenttype = apiReq.Data.Appoinmenttype;
        let VirtualappoinmentData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VirtualappoinmentData.FacilityId);
        let info = {
            Virtualappoinment: Virtualappoinment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            Paymenttype: Paymenttype,
            Appoinmenttype: Appoinmenttype
        };
        let pdfOption: any = null;
        let key = 'virtualappoinmentreports';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintCancelAppoinmentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        let data = await this.GetVirtualOrders(apiReq);
        let Virtualappoinment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let Paymenttype = apiReq.Data.Paymenttype;
        let Appoinmenttype = apiReq.Data.Appoinmenttype;
        let VirtualappoinmentData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VirtualappoinmentData.FacilityId);
        let info = {
            Virtualappoinment: Virtualappoinment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            Paymenttype: Paymenttype,
            Appoinmenttype: Appoinmenttype
        };
        let pdfOption: any = null;
        let key = 'cancelappoinmentreports';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintLabOnlinePaymentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        let data = await this.GetVirtualOrders(apiReq);
        let LabOnline = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let LabOnlineData = data.Data[0];
        let TotalAmt: number = 0;
        let TotalDisAmt: number = 0;
        let TotalNetAmt: number = 0;

        for (let idx in LabOnline) {
            let item = LabOnline[idx];
            TotalAmt += item.GrossAmount;
            TotalDisAmt += item.DiscountAmount;
            TotalNetAmt += item.OrderTotal;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(LabOnlineData.FacilityId);
        let info = {
            LabOnline: LabOnline,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalAmt: TotalAmt,
            TotalDisAmt: TotalDisAmt,
            TotalNetAmt: TotalNetAmt
        };
        let pdfOption: any = null;
        let key = 'labonlinepaymentreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOnlinePaymentDetailsReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        let data = await this.GetVirtualOrders(apiReq);
        let OnlinePayment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let CategoryName = apiReq.Data.CategoryName;
        let SubCategoryName = apiReq.Data.SubCategoryName;
        let OnlinePaymentData = data.Data[0];
        let TotalAmt: number = 0;
        let TotalDisAmt: number = 0;
        let TotalNetAmt: number = 0;

        for (let idx in OnlinePayment) {
            let item = OnlinePayment[idx];
            TotalAmt += item.GrossAmount;
            TotalDisAmt += item.DiscountAmount;
            TotalNetAmt += item.OrderTotal;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OnlinePaymentData.FacilityId);
        let info = {
            OnlinePayment: OnlinePayment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalAmt: TotalAmt,
            TotalDisAmt: TotalDisAmt,
            TotalNetAmt: TotalNetAmt,
            CategoryName: CategoryName,
            SubCategoryName: SubCategoryName
        };
        let pdfOption: any = null;
        let key = 'onlinepaymentdetailsreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOnlinePaymentSummaryReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        let data = await this.GetVirtualOrders(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let CategoryName = apiReq.Data.CategoryName;
        let SubCategoryName = apiReq.Data.SubCategoryName;
        let OnlinePaymentData = data.Data[0];
        let CategorySummary: any = [];
        let ctgyInfo: any = [];

        let GroupedBatchData = _.groupBy(data.Data, 'VirtualCategoryId');
        for (let jdx in GroupedBatchData) {
            let batchdata = GroupedBatchData[jdx];
            //                 let ctgryData = {
            let CategoryName = '';
            let FacilityName = '';
            let TotalAmt = 0;
            //                 }
            for (let cdx in batchdata) {
                ctgyInfo = batchdata[cdx];
                FacilityName = ctgyInfo.Facility.FacilityName;
                CategoryName = ctgyInfo.VirtualCategory.CategoryName;
                TotalAmt = ctgyInfo.OrderTotal;
                let valappend = 0;
                if (CategorySummary.length > 0) {
                    CategorySummary.forEach(function (item: any) {
                        if (FacilityName === item.FacilityName && CategoryName === item.CategoryName) {
                            if (item.TotalAmt > 0) {
                                item.TotalAmt += TotalAmt;
                            } else {
                                item.TotalAmt = TotalAmt;
                            }
                            valappend = 1;
                        }
                    });
                }
                if (valappend === 0) {
                    CategorySummary.push({
                        'FacilityName': FacilityName,
                        'CategoryName': CategoryName,
                        'TotalAmt': TotalAmt,
                    });
                }
            }
        }

        let TotNetAmount = 0;
        for (let jdx in CategorySummary) {
            let netcal = CategorySummary[jdx];
            TotNetAmount = TotNetAmount + (netcal.TotalAmt || 0);

        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OnlinePaymentData.FacilityId);
        let info = {
            CategorySummary: CategorySummary,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotNetAmount: TotNetAmount,
            CategoryName: CategoryName,
            SubCategoryName: SubCategoryName
        };
        let pdfOption: any = null;
        let key = 'onlinepaymentsummaryreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
