import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { SurgeryEntryInstance, SurgeryEntryAttributes } from '../Model/Interface/Index';
import { SurgeryEntryFilters, OtPatientEquipmentsFilters, OtNotesFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as encbo from '../../Visit/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { ProcedureServicesFilters } from '../../BillingMaster/Common/Filters.e';
import * as eqibo from '../../OtManagement/Business/Index';
import * as notebo from '../../OtManagement/Business/Index';
import * as procedurebo from '../../BillingMaster/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { join } from 'path';
import * as _ from 'lodash';
import * as regbo from '../../Registration/Business/Index';
import * as schedulebo from '../../OtManagement/Business/Index';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import * as moment from 'moment';

export class SurgeryEntryBo extends BaseBo<SurgeryEntryInstance, SurgeryEntryAttributes> {
    // public async AddSurgeryEntry(req: BaseRequest): Promise<number> {
    //     let generateOTRegId = 0;
    //     if (!req.Data.SurgeryIdentifier && req.Data.SurgeryEntryStatusId === 2) {
    //         req.Data.SurgeryIdentifier = null;
    //         generateOTRegId = 1;
    //         // await Sequence.Next(SequenceKeys.OTIdentifierId);
    //     }
    //     let result = await this.Save(req.Data);
    //     let otRegId = result.dataValues.Id;
    //     if(result) {
    //         let OtScheduleId = req.Data.Id;
    //         let detailBO = BoFactory.GetBo(schedulebo.OtScheduleDetailsBo, this.Request);
    //         await detailBO.ManageOtScheduleDetails(OtScheduleId, req.Data.Procedures);
    //     }
    //     if (generateOTRegId === 1) {
    //         this.deferSequenceKey(otRegId, 'SurgeryIdentifier',
    //             this.getSequenceIdentifier(SequenceKeys.OTIdentifierId));
    //     }
    //     if (req.Data.SurgeryScheduleId) {
    //         let surgeryscheduleBo = BoFactory.GetBo(notebo.OtScheduleBo, this.Request);
    //         let surgeryscheduledata = await surgeryscheduleBo.GetOtScheduleById({ Id: req.Data.SurgeryScheduleId });
    //         surgeryscheduledata.OTScheduleStatusId = 5;
    //         await surgeryscheduleBo.Update(surgeryscheduledata);
    //     }
    //     const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
    //     const patient: any = await patientBO.GetById(req.Data.PatientId);
    //     if (patient && (patient.NotificationToken)) {
    //         /* tslint:disable-next-line */
    //         const pushMessage: string = 'Dear ' +
    //patient.FirstName + ', ' + ' Your  surgery is entered on'
    //+ moment(req.Data.SurgeryRegisteredOn).format('YYYY-MM-DD') + '.';
    //         const notificationService: any = new NotificationService();
    //         const body = {
    //             type: 'appoinment_booking',
    //         };
    //         const pushTokens: string[] = [];
    //         if (patient.NotificationToken) {
    //             pushTokens.push(patient.NotificationToken);
    //         }
    //         await notificationService.sendNotification(pushMessage, pushTokens, body);
    //         console.log('*************************pushMessage**********************', pushMessage);
    //         console.log('*************************pushTokens**********************', pushTokens);
    //     }
    //     return otRegId;
    // }

    public async AddSurgeryEntry(req: BaseRequest): Promise<number> {
        let generateOTRegId = 0;
        if (!req.Data.SurgeryIdentifier && req.Data.SurgeryEntryStatusId === 2 || req.Data.SurgeryEntryStatusId === 3) {
            req.Data.SurgeryIdentifier = null;
            generateOTRegId = 1;
            // await Sequence.Next(SequenceKeys.OTIdentifierId);
        }
        let result = await this.Save(req.Data);
        let otRegId = result.dataValues.Id;
        if (result) {
            let SurgeryEntryId = result.dataValues.Id;
            req.Data.Procedures = req.Data.Procedures.map((procedure: any) => ({
                ...procedure,
                Id: 0
            }));
            let detailBO = BoFactory.GetBo(schedulebo.SurgeryEntryDetailsBo, this.Request);
            await detailBO.ManageSurgeryEntryDetails(SurgeryEntryId, req.Data.Procedures);
        }
        if (generateOTRegId === 1) {
            this.deferSequenceKey(otRegId, 'SurgeryIdentifier',
                this.getSequenceIdentifier(SequenceKeys.OTIdentifierId));
        }
        if (req.Data.SurgeryScheduleId) {
            let otstatus = 0;
            if (req.Data.SurgeryEntryStatusId === 1 || req.Data.SurgeryEntryStatusId === 2) {
                otstatus = 3;
            }
            if (req.Data.SurgeryEntryStatusId === 3) {
                otstatus = 5;
            }
            let surgeryscheduleBo = BoFactory.GetBo(notebo.OtScheduleBo, this.Request);
            let surgeryscheduledata = await surgeryscheduleBo.GetOtScheduleById({ Id: req.Data.SurgeryScheduleId });
            surgeryscheduledata.OTScheduleStatusId = otstatus;
            await surgeryscheduleBo.Update(surgeryscheduledata);
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  surgery is entered on' + moment(req.Data.SurgeryRegisteredOn).format('YYYY-MM-DD') + '.';
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
        return otRegId;
    }

    public async UpdateSurgeryEntry(req: BaseRequest): Promise<boolean> {
        let generateOTRegId = 0;
        if (!req.Data.SurgeryIdentifier && req.Data.SurgeryEntryStatusId === 2) {
            req.Data.SurgeryIdentifier = null;
            generateOTRegId = 1;
            // await Sequence.Next(SequenceKeys.OTIdentifierId);
        }
        let result = await this.Update(req.Data);
        if (result) {
            let SurgeryEntryId = req.Data.Id;
            let detailBO = BoFactory.GetBo(schedulebo.SurgeryEntryDetailsBo, this.Request);
            await detailBO.ManageSurgeryEntryDetails(SurgeryEntryId, req.Data.Procedures);
        }
        if (generateOTRegId === 1) {
            this.deferSequenceKey(req.Data.Id, 'SurgeryIdentifier',
                this.getSequenceIdentifier(SequenceKeys.OTIdentifierId));
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  surgery is entered on' + moment(req.Data.SurgeryRegisteredOn).format('YYYY-MM-DD') + '.';
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
        let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let Encounter = await EncounterBo.GetEncounterById({ Id: req.Data.EncounterId });
        Encounter.SurgeryDate = req.Data.SurgeryStartedate;
        Encounter.IsSurgery = true;
        await EncounterBo.Update(Encounter);
        if (req.Data.SurgeryEntryStatusId === 3) {
            if (req.Data.SurgeryEntryDetails.length > 0) {
                for (var jdx = 0; jdx < req.Data.SurgeryEntryDetails.length; jdx++) {

                    var procedure_entry = req.Data.SurgeryEntryDetails[jdx];
                    if (procedure_entry.ProcedureId && procedure_entry.ProcedureId > 0) {
                        let Patientbill: any = {};
                        let Header = {
                            BillDateTime: new Date(),
                            BillTypeId: 3,
                            DepartmentId: Encounter.DepartmentId,
                            PatientId: req.Data.PatientId,
                            EncounterId: req.Data.EncounterId,
                            EncounterTypeId: Encounter.EncounterTypeId,
                            GuarantorId: Encounter.GuarantorId,
                            GuarantorTypeId: Encounter.GuarantorTypeId,
                            ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
                            DoctorId: procedure_entry.ChiefSurgeonId,
                            DoctorName: procedure_entry.ChiefSurgeonName,
                            PatientBillStatusId: 3,
                            BillAmount: 0,
                            PaidAmount: 0,
                            OutStandingAmount: 0,
                            FacilityId: req.Data.FacilityId,
                            OrganizationId: req.Data.OrganizationId,
                            allowDuplicate: 1
                        };
                        let BillDetails = [];
                        let ProcedureServiceBo = BoFactory.GetBo(procedurebo.ProcedureServicesBo, this.Request);
                        let apiReq = {
                            Id: 0,
                            PageContext: { PageSize: 100, PageNumber: 1 },
                            Params: [{ Key: ProcedureServicesFilters.ProcedureId, Value: procedure_entry.ProcedureId }]
                        };
                        let ProcedureServices = await ProcedureServiceBo.GetProcedureServices(apiReq);
                        let ProcedureItem: Array<any> = ProcedureServices.Data;
                        let ProcedureTariff: any = {};

                        // for (var i in ProcedureItem[0].ServiceItem.ServiceItemTariffDetails) {
                        //     var tariff = ProcedureItem[0].ServiceItem.ServiceItemTariffDetails[i];
                        //     if (tariff.ServiceRateCategoryId === Encounter.ServiceRateCategoryId)
                        //         ProcedureTariff = tariff;
                        // }

                        let serviceDetails = ProcedureItem[0].ServiceItem.ServiceItemTariffDetails.filter(function (el: any) {
                            return el.FacilityId === req.Data.FacilityId &&
                                el.ServiceRateCategoryId === Encounter.ServiceRateCategoryId;
                        }
                        );
                        if (serviceDetails.length > 0) ProcedureTariff = serviceDetails[0];

                        for (var idx in ProcedureServices.Data) {
                            var item: any = ProcedureServices.Data[idx];
                            var Bill: any = {
                                Id: 0,
                                BillDateTime: new Date(),
                                ServiceId: item.ServiceItemId,
                                ServiceName: item.ServiceItem.Name,
                                ServiceCode: item.ServiceItem.ItemCode,
                                ServiceCategoryId: item.ServiceItem.CategoryId,
                                MasterItemId: item.ServiceItem.MasterItemId,
                                EncounterId: req.Data.EncounterId,
                                ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
                                DoctorId: procedure_entry.ChiefSurgeonId,
                                DoctorName: procedure_entry.ChiefSurgeonName,
                                PatientBillStatusId: 3,
                                MasterTypeId: item.ServiceItem.MasterTypeId,
                                Quantity: 1,
                                DiscountAmount: 0,
                                DoctorShare: 0,
                                Rate: 0,
                                FacilityId: req.Data.FacilityId,
                                OrganizationId: req.Data.OrganizationId
                            };
                            if (ProcedureItem.length > 0 && !isNaN(parseFloat(item.Percent))) {
                                if (item.IsOTHourlyCharge === true) {
                                    for (var v in item.ServiceItem.ServiceItemTariffDetails) {
                                        var itemtariff = item.ServiceItem.ServiceItemTariffDetails[v];
                                        if (itemtariff.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
                                            Bill.Rate = !isNaN(parseFloat(itemtariff.Rate)) ? itemtariff.Rate : 0;
                                        }
                                    }
                                    console.log('*******Rate**********');
                                    console.log(Bill.Rate);
                                } else {
                                    item.Rate = !isNaN(parseFloat(ProcedureTariff.Rate)) ? ProcedureTariff.Rate : 0;
                                    Bill.Rate = (parseFloat(item.Rate) * parseFloat(item.Percent)) / 100;
                                    Bill.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
                                }
                            } else {
                                for (var vi in item.ServiceItem.ServiceItemTariffDetails) {
                                    var itemtariff1 = item.ServiceItem.ServiceItemTariffDetails[vi];
                                    if (itemtariff1.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
                                        Bill.Rate = !isNaN(parseFloat(itemtariff1.Rate)) ? itemtariff1.Rate : 0;
                                    }
                                }
                            }
                            if (item.IsOTHourlyCharge === true) {
                                Bill.Quantity = Number(Bill.Quantity) * parseInt(req.Data.totalSurgeryTime);
                            }

                            Bill.GrossAmount = Bill.Quantity * parseFloat(Bill.Rate);
                            Bill.Amount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                            Bill.NetAmount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                            if (item.IsOTHourlyCharge === false) {
                                Bill.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
                            }
                            Header.BillAmount += Bill.GrossAmount;

                            if (item.IsCheifSurgeon) {
                                Bill.DoctorId = procedure_entry.ChiefSurgeonId;
                                Bill.DoctorName = procedure_entry.ChiefSurgeonName;
                            } else if (item.IsAssistantSurgeon) {
                                // Bill.DoctorId = procedure_entry.AssistantSurgeonId;
                                Bill.DoctorId = procedure_entry.SecondSurgeonId;
                                Bill.DoctorName = procedure_entry.SecondSurgeonName;
                            } else if (item.IsAnesthetist) {
                                Bill.DoctorId = req.Data.AnaesthesistId;
                            }
                            BillDetails.push(Bill);
                        }
                        Header.OutStandingAmount = Header.BillAmount;

                        if (ProcedureServices.Data.length > 0) {
                            Patientbill = {
                                Data: {
                                    Header: Header,
                                    Details: BillDetails,
                                    paymentDetail: []
                                }
                            };
                            let BillBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
                            await BillBo.AddIPPatientBills(Patientbill);
                        }
                    }
                }
            }

            // if (req.Data.Procedure2Id) {
            //     let Patientbill: any = {};
            //     let Header = {
            //         BillDateTime: req.Data.SurgeryStartedate,
            //         BillTypeId: 3,
            //         DepartmentId: Encounter.DepartmentId,
            //         PatientId: req.Data.PatientId,
            //         EncounterId: req.Data.EncounterId,
            //         EncounterTypeId: Encounter.EncounterTypeId,
            //         GuarantorId: Encounter.GuarantorId,
            //         GuarantorTypeId: Encounter.GuarantorTypeId,
            //         ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
            //         DoctorId: req.Data.ChiefSurgeonId,
            //         DoctorName: req.Data.ChiefSurgeon,
            //         PatientBillStatusId: 3,
            //         BillAmount: 0,
            //         PaidAmount: 0,
            //         OutStandingAmount: 0,
            //     };
            //     let BillDetails = [];
            //     let ProcedureServiceBo = BoFactory.GetBo(procedurebo.ProcedureServicesBo, this.Request);
            //     let apiReq = {
            //         Id: 0,
            //         PageContext: { PageSize: 100, PageNumber: 1 },
            //         Params: [{ Key: ProcedureServicesFilters.ProcedureId, Value: req.Data.Procedure2Id }]
            //     };
            //     let Procedure2Services = await ProcedureServiceBo.GetProcedureServices(apiReq);
            //     let Procedure2Item: Array<any> = Procedure2Services.Data;

            //     let Procedure2Tariff: any = {};
            //     for (var i2 in Procedure2Item[0].ServiceItem.ServiceItemTariffDetails) {
            //         var tariff2 = Procedure2Item[0].ServiceItem.ServiceItemTariffDetails[i2];
            //         if (tariff2.ServiceRateCategoryId === Encounter.ServiceRateCategoryId)
            //             Procedure2Tariff = tariff2;
            //     }

            //     for (var idx2 in Procedure2Services.Data) {
            //         var item2: any = Procedure2Services.Data[idx2];
            //         var Bill2: any = {
            //             Id: 0,
            //             BillDateTime: req.Data.SurgeryStartedate,
            //             ServiceId: item2.ServiceItemId,
            //             ServiceName: item2.ServiceItem.Name,
            //             ServiceCode: item2.ServiceItem.ItemCode,
            //             ServiceCategoryId: item2.ServiceItem.CategoryId,
            //             MasterItemId: item2.ServiceItem.MasterItemId,
            //             EncounterId: req.Data.EncounterId,
            //             ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
            //             PatientBillStatusId: 3,
            //             MasterTypeId: item2.ServiceItem.MasterTypeId,
            //             Quantity: 1,
            //             DiscountAmount: 0,
            //             Rate: 0
            //         };
            //         if (Procedure2Item.length > 0 && !isNaN(parseFloat(item.Percent))) {
            //             item2.Rate = !isNaN(parseFloat(Procedure2Tariff.Rate)) ? Procedure2Tariff.Rate : 0;
            //             Bill2.Rate = (parseFloat(item2.Rate) * parseFloat(item2.Percent)) / 100;
            //             Bill2.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
            //         } else {
            //             for (var v2 in item.ServiceItem.ServiceItemTariffDetails) {
            //                 var itemtariff2 = item.ServiceItem.ServiceItemTariffDetails[v2];
            //                 if (itemtariff2.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
            //                     Bill2.Rate = !isNaN(parseFloat(itemtariff2.Rate)) ? itemtariff2.Rate : 0;
            //                 }
            //             }
            //         }
            //         Bill2.GrossAmount = Bill2.Quantity * parseFloat(Bill2.Rate);
            //         Bill2.Amount = (Bill2.Quantity * parseFloat(Bill2.Rate)) - parseFloat(Bill2.DiscountAmount);
            //         Bill2.NetAmount = (Bill2.Quantity * parseFloat(Bill2.Rate)) - parseFloat(Bill2.DiscountAmount);
            //         Bill2.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
            //         Header.BillAmount += Bill2.GrossAmount;

            //         if (item.IsCheifSurgeon) {
            //             Bill2.DoctorId = req.Data.ChiefSurgeonId;
            //         } else if (item.IsAssistantSurgeon) {
            //             Bill2.DoctorId = req.Data.AssistantSurgeonId;
            //         } else if (item.IsAnesthetist) {
            //             Bill2.DoctorId = req.Data.AnaesthesistId;
            //         }
            //         BillDetails.push(Bill2);
            //     }
            //     Header.OutStandingAmount = Header.BillAmount;
            //     if (Procedure2Services.Data.length > 0) {
            //         Patientbill = {
            //             Data: {
            //                 Header: Header,
            //                 Details: BillDetails,
            //                 paymentDetail: []
            //             }
            //         };
            //         let BillBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            //         await BillBo.AddIPPatientBills(Patientbill);
            //     }
            // }
            // if (req.Data.Procedure3Id) {
            //     let Patientbill: any = {};
            //     let Header = {
            //         BillDateTime: req.Data.SurgeryStartedate,
            //         BillTypeId: 3,
            //         DepartmentId: Encounter.DepartmentId,
            //         PatientId: req.Data.PatientId,
            //         EncounterId: req.Data.EncounterId,
            //         EncounterTypeId: Encounter.EncounterTypeId,
            //         GuarantorId: Encounter.GuarantorId,
            //         GuarantorTypeId: Encounter.GuarantorTypeId,
            //         ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
            //         DoctorId: req.Data.ChiefSurgeonId,
            //         DoctorName: req.Data.ChiefSurgeon,
            //         PatientBillStatusId: 3,
            //         BillAmount: 0,
            //         PaidAmount: 0,
            //         OutStandingAmount: 0,
            //     };
            //     let BillDetails = [];
            //     let ProcedureServiceBo = BoFactory.GetBo(procedurebo.ProcedureServicesBo, this.Request);
            //     let apiReq = {
            //         Id: 0,
            //         PageContext: { PageSize: 100, PageNumber: 1 },
            //         Params: [{ Key: ProcedureServicesFilters.ProcedureId, Value: req.Data.Procedure3Id }]
            //     };
            //     let Procedure3Services = await ProcedureServiceBo.GetProcedureServices(apiReq);
            //     let Procedure3Item: Array<any> = Procedure3Services.Data;

            //     let Procedure3Tariff: any = {};
            //     for (var i3 in Procedure3Item[0].ServiceItem.ServiceItemTariffDetails) {
            //         var tariff3 = Procedure3Item[0].ServiceItem.ServiceItemTariffDetails[i3];
            //         if (tariff3.ServiceRateCategoryId === Encounter.ServiceRateCategoryId)
            //             Procedure3Tariff = tariff3;
            //     }

            //     for (var idx3 in Procedure3Services.Data) {
            //         var item3: any = Procedure3Services.Data[idx3];
            //         var Bill3: any = {
            //             Id: 0,
            //             BillDateTime: req.Data.SurgeryStartedate,
            //             ServiceId: item3.ServiceItemId,
            //             ServiceName: item3.ServiceItem.Name,
            //             ServiceCode: item3.ServiceItem.ItemCode,
            //             ServiceCategoryId: item3.ServiceItem.CategoryId,
            //             MasterItemId: item3.ServiceItem.MasterItemId,
            //             EncounterId: req.Data.EncounterId,
            //             ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
            //             PatientBillStatusId: 3,
            //             MasterTypeId: item3.ServiceItem.MasterTypeId,
            //             Quantity: 1,
            //             DiscountAmount: 0,
            //             Rate: 0
            //         };
            //         if (Procedure3Item.length > 0 && !isNaN(parseFloat(item3.Percent))) {
            //             item3.Rate = !isNaN(parseFloat(Procedure3Tariff)) ? Procedure3Tariff.Rate : 0;
            //             Bill3.Rate = (parseFloat(item3.Rate) * parseFloat(item3.Percent)) / 100;
            //             Bill3.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
            //         } else {
            //             for (var v3 in item3.ServiceItem.ServiceItemTariffDetails) {
            //                 var itemtariff3 = item3.ServiceItem.ServiceItemTariffDetails[v3];
            //                 if (itemtariff3.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
            //                     Bill3.Rate = !isNaN(parseFloat(itemtariff3.Rate)) ? itemtariff3.Rate : 0;
            //                 }
            //             }
            //         }
            //         Bill3.GrossAmount = Bill3.Quantity * parseFloat(Bill3.Rate);
            //         Bill3.Amount = (Bill3.Quantity * parseFloat(Bill3.Rate)) - parseFloat(Bill3.DiscountAmount);
            //         Bill3.NetAmount = (Bill3.Quantity * parseFloat(Bill3.Rate)) - parseFloat(Bill3.DiscountAmount);
            //         Bill3.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
            //         Header.BillAmount += Bill3.GrossAmount;

            //         if (item.IsCheifSurgeon) {
            //             Bill3.DoctorId = req.Data.ChiefSurgeonId;
            //         } else if (item.IsAssistantSurgeon) {
            //             Bill3.DoctorId = req.Data.AssistantSurgeonId;
            //         } else if (item.IsAnesthetist) {
            //             Bill3.DoctorId = req.Data.AnaesthesistId;
            //         }
            //         BillDetails.push(Bill3);
            //     }
            //     Header.OutStandingAmount = Header.BillAmount;
            //     if (Procedure3Services.Data.length > 0) {
            //         Patientbill = {
            //             Data: {
            //                 Header: Header,
            //                 Details: BillDetails,
            //                 paymentDetail: []
            //             }
            //         };
            //         let BillBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            //         await BillBo.AddIPPatientBills(Patientbill);
            //     }
            // }
        }
        return result;
    }
    public async UpdateOTSurgeryEntry(req: BaseRequest): Promise<boolean> {
        let generateOTRegId = 0;
        if (!req.Data.SurgeryIdentifier && req.Data.SurgeryEntryStatusId === 2) {
            req.Data.SurgeryIdentifier = null;
            generateOTRegId = 1;
            // await Sequence.Next(SequenceKeys.OTIdentifierId);
        }
        let result = await this.Update(req.Data);
        if (generateOTRegId === 1) {
            this.deferSequenceKey(req.Data.Id, 'SurgeryIdentifier',
                this.getSequenceIdentifier(SequenceKeys.OTIdentifierId));
        }
        if (result) {
            let SurgeryEntryId = req.Data.Id;
            let detailBO = BoFactory.GetBo(schedulebo.SurgeryEntryDetailsBo, this.Request);
            await detailBO.ManageSurgeryEntryDetails(SurgeryEntryId, req.Data.Procedures);
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your  surgery is entered on' + moment(req.Data.SurgeryRegisteredOn).format('YYYY-MM-DD') + '.';
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
        let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let Encounter = await EncounterBo.GetEncounterById({ Id: req.Data.EncounterId });
        Encounter.SurgeryDate = req.Data.SurgeryStartedate;
        Encounter.IsSurgery = true;
        await EncounterBo.Update(Encounter);
        if (req.Data.SurgeryEntryStatusId === 3) {
            if (req.Data.Procedures.length > 0) {
                for (var jdx = 0; jdx < req.Data.Procedures.length; jdx++) {

                    var procedure_entry = req.Data.Procedures[jdx];
                    if (procedure_entry.ProcedureId && procedure_entry.ProcedureId > 0) {
                        let Patientbill: any = {};
                        let Header = {
                            BillDateTime: new Date(),
                            BillTypeId: 3,
                            DepartmentId: Encounter.DepartmentId,
                            PatientId: req.Data.PatientId,
                            EncounterId: req.Data.EncounterId,
                            EncounterTypeId: Encounter.EncounterTypeId,
                            GuarantorId: Encounter.GuarantorId,
                            GuarantorTypeId: Encounter.GuarantorTypeId,
                            ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
                            DoctorId: procedure_entry.ChiefSurgeonId,
                            DoctorName: procedure_entry.ChiefSurgeonName,
                            PatientBillStatusId: 3,
                            BillAmount: 0,
                            PaidAmount: 0,
                            OutStandingAmount: 0,
                            FacilityId: req.Data.FacilityId,
                            OrganizationId: req.Data.OrganizationId,
                            allowDuplicate: 1
                        };
                        let BillDetails = [];
                        let ProcedureServiceBo = BoFactory.GetBo(procedurebo.ProcedureServicesBo, this.Request);
                        let apiReq = {
                            Id: 0,
                            PageContext: { PageSize: 100, PageNumber: 1 },
                            Params: [{ Key: ProcedureServicesFilters.ProcedureId, Value: procedure_entry.ProcedureId }]
                        };
                        let ProcedureServices = await ProcedureServiceBo.GetProcedureServices(apiReq);
                        let ProcedureItem: Array<any> = ProcedureServices.Data;
                        let ProcedureTariff: any = {};

                        // for (var i in ProcedureItem[0].ServiceItem.ServiceItemTariffDetails) {
                        //     var tariff = ProcedureItem[0].ServiceItem.ServiceItemTariffDetails[i];
                        //     if (tariff.ServiceRateCategoryId === Encounter.ServiceRateCategoryId)
                        //         ProcedureTariff = tariff;
                        // }

                        let serviceDetails = ProcedureItem[0].ServiceItem.ServiceItemTariffDetails.filter(function (el: any) {
                            return el.FacilityId === req.Data.FacilityId &&
                                el.ServiceRateCategoryId === Encounter.ServiceRateCategoryId;
                        }
                        );
                        if (serviceDetails.length > 0) ProcedureTariff = serviceDetails[0];

                        for (var idx in ProcedureServices.Data) {
                            var item: any = ProcedureServices.Data[idx];
                            var Bill: any = {
                                Id: 0,
                                BillDateTime: new Date(),
                                ServiceId: item.ServiceItemId,
                                ServiceName: item.ServiceItem.Name,
                                ServiceCode: item.ServiceItem.ItemCode,
                                ServiceCategoryId: item.ServiceItem.CategoryId,
                                MasterItemId: item.ServiceItem.MasterItemId,
                                EncounterId: req.Data.EncounterId,
                                ServiceRateCategoryId: Encounter.ServiceRateCategoryId,
                                DoctorId: procedure_entry.ChiefSurgeonId,
                                DoctorName: procedure_entry.ChiefSurgeonName,
                                PatientBillStatusId: 3,
                                MasterTypeId: item.ServiceItem.MasterTypeId,
                                Quantity: 1,
                                DiscountAmount: 0,
                                Rate: 0,
                                FacilityId: req.Data.FacilityId,
                                OrganizationId: req.Data.OrganizationId
                            };
                            if (ProcedureItem.length > 0 && !isNaN(parseFloat(item.Percent))) {
                                if (item.IsOTHourlyCharge === true) {
                                    for (var v in item.ServiceItem.ServiceItemTariffDetails) {
                                        var itemtariff = item.ServiceItem.ServiceItemTariffDetails[v];
                                        if (itemtariff.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
                                            Bill.Rate = !isNaN(parseFloat(itemtariff.Rate)) ? itemtariff.Rate : 0;
                                        }
                                    }
                                    console.log('*******Rate**********');
                                    console.log(Bill.Rate);
                                } else {
                                    item.Rate = !isNaN(parseFloat(ProcedureTariff.Rate)) ? ProcedureTariff.Rate : 0;
                                    Bill.Rate = (parseFloat(item.Rate) * parseFloat(item.Percent)) / 100;
                                    Bill.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
                                }
                            } else {
                                for (var vi in item.ServiceItem.ServiceItemTariffDetails) {
                                    var itemtariff1 = item.ServiceItem.ServiceItemTariffDetails[vi];
                                    if (itemtariff1.ServiceRateCategoryId === Encounter.ServiceRateCategoryId) {
                                        Bill.Rate = !isNaN(parseFloat(itemtariff1.Rate)) ? itemtariff1.Rate : 0;
                                    }
                                }
                            }

                            if (item.IsOTHourlyCharge === true) {
                                Bill.Quantity = Number(Bill.Quantity) * parseInt(req.Data.totalSurgeryTime);
                            }
                            Bill.GrossAmount = Bill.Quantity * parseFloat(Bill.Rate);
                            Bill.Amount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                            Bill.NetAmount = (Bill.Quantity * parseFloat(Bill.Rate)) - parseFloat(Bill.DiscountAmount);
                            if (item.IsOTHourlyCharge === false) {
                                Bill.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
                            }
                            // Bill.DoctorShare = (parseFloat(item.DoctorSharePercent) / 100) * parseFloat(item.Rate);
                            Header.BillAmount += Bill.GrossAmount;

                            if (item.IsCheifSurgeon) {
                                Bill.DoctorId = procedure_entry.ChiefSurgeonId;
                                Bill.DoctorName = procedure_entry.ChiefSurgeonName;
                            } else if (item.IsAssistantSurgeon) {
                                // Bill.DoctorId = procedure_entry.AssistantSurgeonId;
                                Bill.DoctorId = procedure_entry.SecondSurgeonId;
                                Bill.DoctorName = procedure_entry.SecondSurgeonName;
                            } else if (item.IsAnesthetist) {
                                Bill.DoctorId = req.Data.AnaesthesistId;
                            }
                            BillDetails.push(Bill);
                        }
                        Header.OutStandingAmount = Header.BillAmount;

                        if (ProcedureServices.Data.length > 0) {
                            Patientbill = {
                                Data: {
                                    Header: Header,
                                    Details: BillDetails,
                                    paymentDetail: []
                                }
                            };
                            let BillBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
                            await BillBo.AddIPPatientBills(Patientbill);
                        }
                    }
                }
            }
        }
        return result;
    }
    public async UpdateSurgeryEntryReview(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'reviewnotes':
    //             count = await this.Items.count({
    //                 where: {
    //                     'SurgeryEntryStatusId': { '$in': [2, 4] },  //Approved&Completed
    //                     'ChiefSurgeonId': this.GetSession().UserId,

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
        let otnotescount = await this.Items.count({
            where: {
                'Status': 1,
                'SurgeryEntryStatusId': { '$in': [2, 4] },
                'ChiefSurgeonId': req.Data.DoctorId
            }
        });
        return {
            'otnotescount': otnotescount,
        };
    }
    public async GetSurgeryEntryById(req: BaseRequest): Promise<SurgeryEntryAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeId', 'IsBillLock'],
        });
        include.push({
            model: this.Models.SurgeryEntryDetails,
            required: false
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetSurgeryEntrys(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<ApiResponse<SurgeryEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let ProcedureWhere: WhereOptions<any> = {};
        let IsProcedureSearch: boolean = false;
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('SurgeryEntryStatus'));
        include.push(this.GetReference('SurgeryType'));
        include.push(this.GetReference('AnaesthesiaType'));
        include.push({ model: this.Models.OtNotes, required: false });
        // include.push({ model: this.Models.OtPatientEquipments, required: false });
        include.push({ model: this.Models.SurgeryRoomMaster, required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'OTRoom', required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false, });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description',
                'ServiceRateCategoryId'], required: false
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'DepartmentId',
                'Qualification'], required: false,
            include: [
                { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName', 'DepartmentId'], required: false },
                this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ChiefSurgeon', attributes: ['FirstName', 'LastName', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Anaesthesist', attributes: ['FirstName', 'LastName', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Diagnosis, attributes: ['Code', 'DiagnosisName'], as: 'PreDiagnosis', required: false });
        include.push({
            model: this.Models.User, as: 'AssistantSurgeon', attributes: ['FirstName', 'LastName', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.SurgeryEntryDetails,
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SurgeryEntryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SurgeryEntryFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case SurgeryEntryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.SurgeryEntryStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['SurgeryEntryStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case SurgeryEntryFilters.OTIdentifier:
                        where['OTIdentifier'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case SurgeryEntryFilters.Surgeon:
                        where['ChiefSurgeonId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.AssistantSurgeonId:
                        where['AssistantSurgeonId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.Procedure:
                        where['ProcedureId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.Anaesthesist:
                        where['AnaesthesistId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.OTStartedate:
                        where['SurgeryStartedate'] = { '$gte': param.Value };
                        break;
                    case SurgeryEntryFilters.OTEndDate:
                        where['SurgeryEndDate'] = { '$gte': param.Value };
                        break;
                    case SurgeryEntryFilters.OTRoom:
                        where['SurgeryRoomId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.ProcedureName:
                        ProcedureWhere['ProcedureName'] = { '$like': '%' + (param.Value || '') + '%' };
                        IsProcedureSearch = true;
                        break;
                    case SurgeryEntryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.SurgeryRegisteredOn:
                        where['SurgeryRegisteredOn'] = { '$between': param.Value || '' };
                        break;
                    case SurgeryEntryFilters.From:
                        where['SurgeryRegisteredOn'] = where['SurgeryRegisteredOn'] || {};
                        (where['SurgeryRegisteredOn'] as any)['$gte'] = param.Value;
                        break;
                    case SurgeryEntryFilters.To:
                        where['SurgeryRegisteredOn'] = where['SurgeryRegisteredOn'] || {};
                        (where['SurgeryRegisteredOn'] as any)['$lte'] = param.Value;
                        break;
                    case SurgeryEntryFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.SurgeryStatus:
                        where['SurgeryEntryStatusId'] = param.Value;
                        break;
                    case SurgeryEntryFilters.IsCathlab:
                        where['IsCathlab'] = param.Value;
                        break;
                    case SurgeryEntryFilters.SurgeryScheduleId:
                        where['SurgeryScheduleId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push({
        //     model: this.Models.Procedure, as: 'Procedure',
        //     attributes: ['ProcedureName'],
        //     where: ProcedureWhere,
        //     required: IsProcedureSearch
        // });
        // include.push({
        //     model: this.Models.Procedure, as: 'Procedure2',
        //     attributes: ['ProcedureName'],
        //     where: ProcedureWhere,
        //     required: IsProcedureSearch
        // });
        // include.push({
        //     model: this.Models.Procedure, as: 'Procedure3',
        //     attributes: ['ProcedureName'],
        //     where: ProcedureWhere,
        //     required: IsProcedureSearch
        // });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'DOB', 'Age', 'GenderId',
                'AddressLine1', 'Area', 'City', 'State', 'Pincode', 'Country', 'Mobile'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteSurgeryEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetSurgerysummarybyProcedure(req: BaseRequest): Promise<any> {
        let ProcedureGroup: { [id: number]: any[] } = {};
        let ProcedureGroupJoin: any = {
            model: this.Models.Procedure, as: 'Procedure',
            required: true,
        };
        if (req.Data.ProcedureId === 0) {
            let procedureInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ProcedureId: { '$gt': req.Data.ProcedureId },
                    DepartmentId: req.Data.DepartmentId,
                },
                include: [ProcedureGroupJoin]
            });
            if (procedureInstance) {
                let grpprocedure = _.groupBy(procedureInstance, 'ProcedureId');
                for (let i in grpprocedure) {
                    let groupedProcedure = grpprocedure[i];
                    let ProcedureId: number = 0;
                    let ProcedureName: string = '';
                    let ProcedureCount: number = 0;
                    ProcedureCount = groupedProcedure.length;
                    for (let i = 0; i < groupedProcedure.length; i++) {
                        let bills: any = groupedProcedure[i];
                        ProcedureId = bills.ProcedureId;
                        ProcedureName = bills.Procedure.ProcedureName;
                        ProcedureGroup[ProcedureId] = ProcedureGroup[ProcedureId] || [];
                    }
                    let info = {
                        'ProcedureId': ProcedureId,
                        'ProcedureName': ProcedureName,
                        'ProcedureCount': ProcedureCount
                    };
                    ProcedureGroup[ProcedureId].push(info);
                }
            }
        } else if (req.Data.ProcedureId > 0) {
            let procedureInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ProcedureId: { '$eq': req.Data.ProcedureId },
                    DepartmentId: req.Data.DepartmentId,
                },
                include: [ProcedureGroupJoin]
            });
            if (procedureInstance) {
                let grpprocedure = _.groupBy(procedureInstance, 'ProcedureId');
                for (let i in grpprocedure) {
                    let groupedProcedure = grpprocedure[i];
                    let ProcedureId: number = 0;
                    let ProcedureName: string = '';
                    let ProcedureCount: number = 0;
                    ProcedureCount = groupedProcedure.length;
                    for (let i = 0; i < groupedProcedure.length; i++) {
                        let bills: any = groupedProcedure[i];
                        ProcedureId = bills.ProcedureId;
                        ProcedureName = bills.Procedure.ProcedureName;
                        ProcedureGroup[ProcedureId] = ProcedureGroup[ProcedureId] || [];
                    }
                    let info = {
                        'ProcedureId': ProcedureId,
                        'ProcedureName': ProcedureName,
                        'ProcedureCount': ProcedureCount
                    };
                    ProcedureGroup[ProcedureId].push(info);
                }
            }
        }
        return ProcedureGroup;
    }

    public async GetSurgerysummarybySurgeon(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.SugerySelfSummary(req) });
        result.push({ Key: 2, Value: await this.SurgeryInsuranceSummary(req) });
        return result;
    }

    public async SugerySelfSummary(req: BaseRequest): Promise<any> {
        let SurgeonGroup: { [id: number]: any[] } = {};
        let SurgeonGroupJoin: any = {
            model: this.Models.User, as: 'ChiefSurgeon',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        // let EncounterJoin: any = {
        //     model: this.Models.Encounter,
        //     required: true,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // };
        if (req.Data.ChiefSurgeonId === -1) {
            let SurgeonInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ChiefSurgeonId: { '$gt': req.Data.ChiefSurgeonId },
                },
                include: [SurgeonGroupJoin, {
                    model: this.Models.Encounter,
                    attributes: ['Id', 'GuarantorTypeId'],
                    where: {
                        GuarantorTypeId: { '$eq': 1 }
                    },
                    include: [this.GetReference('GuarantorType', ['Description', 'ColorCode'])],
                    required: true
                }]

                // include: [SurgeonGroupJoin]
            });
            if (SurgeonInstance) {
                let grpSurgeon = _.groupBy(SurgeonInstance, 'ChiefSurgeonId');
                for (let i in grpSurgeon) {
                    let groupedSurgeon = grpSurgeon[i];
                    let SurgeonId: number = 0;
                    let SurgeonName: string = '';
                    let SelfCount: number = 0;
                    SelfCount = groupedSurgeon.length;
                    for (let i = 0; i < groupedSurgeon.length; i++) {
                        let bills: any = groupedSurgeon[i];
                        let surgeonname: any = '';
                        if (bills.ChiefSurgeon) {
                            if (bills.ChiefSurgeon.Title) {
                                surgeonname = bills.ChiefSurgeon.Title.Description;
                            }
                            if (bills.ChiefSurgeon.FirstName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.FirstName;
                            }
                            if (bills.ChiefSurgeon.LastName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.LastName;
                            }
                        }
                        SurgeonId = bills.ChiefSurgeonId;
                        SurgeonName = surgeonname;
                        SurgeonGroup[SurgeonId] = SurgeonGroup[SurgeonId] || [];
                    }
                    let info = {
                        'SurgeonId': SurgeonId,
                        'SurgeonName': SurgeonName,
                        'SelfCount': SelfCount
                    };
                    SurgeonGroup[SurgeonId].push(info);
                }
            }
        } else if (req.Data.ChiefSurgeonId > -1) {
            let SurgeonInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ChiefSurgeonId: { '$eq': req.Data.ChiefSurgeonId },
                },
                include: [SurgeonGroupJoin, {
                    model: this.Models.Encounter,
                    attributes: ['Id', 'GuarantorTypeId'],
                    where: {
                        GuarantorTypeId: { '$eq': 1 }
                    },
                    include: [this.GetReference('GuarantorType', ['Description', 'ColorCode'])],
                    required: true
                }]
            });
            if (SurgeonInstance) {
                let grpSurgeon = _.groupBy(SurgeonInstance, 'ChiefSurgeonId');
                for (let i in grpSurgeon) {
                    let groupedSurgeon = grpSurgeon[i];
                    let SurgeonId: number = 0;
                    let SurgeonName: string = '';
                    let SelfCount: number = 0;
                    SelfCount = groupedSurgeon.length;
                    for (let i = 0; i < groupedSurgeon.length; i++) {
                        let bills: any = groupedSurgeon[i];
                        let surgeonname: any = '';
                        if (bills.ChiefSurgeon) {
                            if (bills.ChiefSurgeon.Title) {
                                surgeonname = bills.ChiefSurgeon.Title.Description;
                            }
                            if (bills.ChiefSurgeon.FirstName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.FirstName;
                            }
                            if (bills.ChiefSurgeon.LastName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.LastName;
                            }
                        }
                        SurgeonId = bills.ChiefSurgeonId;
                        SurgeonName = surgeonname;
                        SurgeonGroup[SurgeonId] = SurgeonGroup[SurgeonId] || [];
                    }
                    let info = {
                        'SurgeonId': SurgeonId,
                        'SurgeonName': SurgeonName,
                        'SelfCount': SelfCount
                    };
                    SurgeonGroup[SurgeonId].push(info);
                }
            }
        }
        return SurgeonGroup;
    }
    public async SurgeryInsuranceSummary(req: BaseRequest): Promise<any> {
        let SurgeonGroup: { [id: number]: any[] } = {};
        let SurgeonGroupJoin: any = {
            model: this.Models.User, as: 'ChiefSurgeon',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        // let EncounterJoin: any = {
        //     model: this.Models.Encounter,
        //     required: true,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // };
        if (req.Data.ChiefSurgeonId === -1) {
            let SurgeonInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ChiefSurgeonId: { '$gt': req.Data.ChiefSurgeonId },
                },
                include: [SurgeonGroupJoin, {
                    model: this.Models.Encounter,
                    attributes: ['Id', 'GuarantorTypeId'],
                    where: {
                        GuarantorTypeId: { '$eq': 2 }
                    },
                    include: [this.GetReference('GuarantorType', ['Description', 'ColorCode'])],
                    required: true
                }]

                // include: [SurgeonGroupJoin]
            });
            if (SurgeonInstance) {
                let grpSurgeon = _.groupBy(SurgeonInstance, 'ChiefSurgeonId');
                for (let i in grpSurgeon) {
                    let groupedSurgeon = grpSurgeon[i];
                    let SurgeonId: number = 0;
                    let SurgeonName: string = '';
                    let InsuranceCount: number = 0;
                    InsuranceCount = groupedSurgeon.length;
                    for (let i = 0; i < groupedSurgeon.length; i++) {
                        let bills: any = groupedSurgeon[i];
                        let surgeonname: any = '';
                        if (bills.ChiefSurgeon) {
                            if (bills.ChiefSurgeon.Title) {
                                surgeonname = bills.ChiefSurgeon.Title.Description;
                            }
                            if (bills.ChiefSurgeon.FirstName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.FirstName;
                            }
                            if (bills.ChiefSurgeon.LastName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.LastName;
                            }
                        }
                        SurgeonId = bills.ChiefSurgeonId;
                        SurgeonName = surgeonname;
                        SurgeonGroup[SurgeonId] = SurgeonGroup[SurgeonId] || [];
                    }
                    let info = {
                        'SurgeonId': SurgeonId,
                        'SurgeonName': SurgeonName,
                        'InsuranceCount': InsuranceCount
                    };
                    SurgeonGroup[SurgeonId].push(info);
                }
            }
        } else if (req.Data.ChiefSurgeonId > -1) {
            let SurgeonInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    ChiefSurgeonId: { '$eq': req.Data.ChiefSurgeonId },
                },
                include: [SurgeonGroupJoin, {
                    model: this.Models.Encounter,
                    attributes: ['Id', 'GuarantorTypeId'],
                    where: {
                        GuarantorTypeId: { '$eq': 2 }
                    },
                    include: [this.GetReference('GuarantorType', ['Description', 'ColorCode'])],
                    required: true
                }]
                // include: [SurgeonGroupJoin]
            });
            if (SurgeonInstance) {
                let grpSurgeon = _.groupBy(SurgeonInstance, 'ChiefSurgeonId');
                for (let i in grpSurgeon) {
                    let groupedSurgeon = grpSurgeon[i];
                    let SurgeonId: number = 0;
                    let SurgeonName: string = '';
                    let InsuranceCount: number = 0;
                    InsuranceCount = groupedSurgeon.length;
                    for (let i = 0; i < groupedSurgeon.length; i++) {
                        let bills: any = groupedSurgeon[i];
                        let surgeonname: any = '';
                        if (bills.ChiefSurgeon) {
                            if (bills.ChiefSurgeon.Title) {
                                surgeonname = bills.ChiefSurgeon.Title.Description;
                            }
                            if (bills.ChiefSurgeon.FirstName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.FirstName;
                            }
                            if (bills.ChiefSurgeon.LastName) {
                                surgeonname += ' ' + bills.ChiefSurgeon.LastName;
                            }
                        }
                        SurgeonId = bills.ChiefSurgeonId;
                        SurgeonName = surgeonname;
                        SurgeonGroup[SurgeonId] = SurgeonGroup[SurgeonId] || [];
                    }
                    let info = {
                        'SurgeonId': SurgeonId,
                        'SurgeonName': SurgeonName,
                        'InsuranceCount': InsuranceCount
                    };
                    SurgeonGroup[SurgeonId].push(info);
                }
            }
        }
        return SurgeonGroup;
    }
    public async GetSurgerysummarybyAnaesthetist(req: BaseRequest): Promise<any> {
        let AnaesthesistGroup: { [id: number]: any[] } = {};
        let AnaesthesistGroupJoin: any = {
            model: this.Models.User, as: 'Anaesthesist',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.AnaesthesistId === 0) {
            let AnaesthesistInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    AnaesthesistId: { '$gt': req.Data.AnaesthesistId },
                },
                include: [AnaesthesistGroupJoin]
            });
            if (AnaesthesistInstance) {
                let grpAnaesthesist = _.groupBy(AnaesthesistInstance, 'AnaesthesistId');
                for (let i in grpAnaesthesist) {
                    let groupedAnaesthesist = grpAnaesthesist[i];
                    let AnaesthesistId: number = 0;
                    let Anaesthesistname: string = '';
                    let AnaesthesistCount: number = 0;
                    let anaesthesistname: any = '';
                    AnaesthesistCount = groupedAnaesthesist.length;
                    for (let i = 0; i < groupedAnaesthesist.length; i++) {
                        let bills: any = groupedAnaesthesist[i];
                        if (bills.Anaesthesist) {
                            if (bills.Anaesthesist.Title) {
                                anaesthesistname = bills.Anaesthesist.Title.Description;
                            }
                            if (bills.Anaesthesist.FirstName) {
                                anaesthesistname += ' ' + bills.Anaesthesist.FirstName;
                            }
                            if (bills.Anaesthesist.LastName) {
                                anaesthesistname += ' ' + bills.Anaesthesist.LastName;
                            }
                        }
                        AnaesthesistId = bills.AnaesthesistId;
                        Anaesthesistname = anaesthesistname;
                        AnaesthesistGroup[AnaesthesistId] = AnaesthesistGroup[AnaesthesistId] || [];
                    }
                    let info = {
                        'AnaesthesistId': AnaesthesistId,
                        'AnaesthesistName': Anaesthesistname,
                        'AnaesthesistCount': AnaesthesistCount
                    };
                    AnaesthesistGroup[AnaesthesistId].push(info);
                }
            }
        } else if (req.Data.AnaesthesistId > 0) {
            let AnaesthesistInstance: any = await this.FindAll({
                where: {
                    SurgeryRegisteredOn: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: req.Data.FacilityId,
                    IsCathlab: req.Data.IsCathlab,
                    AnaesthesistId: { '$eq': req.Data.AnaesthesistId },
                },
                include: [AnaesthesistGroupJoin]
            });
            if (AnaesthesistInstance) {
                let grpAnaesthesist = _.groupBy(AnaesthesistInstance, 'AnaesthesistId');
                for (let i in grpAnaesthesist) {
                    let groupedAnaesthesist = grpAnaesthesist[i];
                    let AnaesthesistId: number = 0;
                    let Anaesthesistname: string = '';
                    let AnaesthesistCount: number = 0;
                    let anaesthesistname: any = '';
                    AnaesthesistCount = groupedAnaesthesist.length;
                    for (let i = 0; i < groupedAnaesthesist.length; i++) {
                        let bills: any = groupedAnaesthesist[i];
                        if (bills.Anaesthesist) {
                            if (bills.Anaesthesist.Title) {
                                anaesthesistname = bills.Anaesthesist.Title.Description;
                            }
                            if (bills.Anaesthesist.FirstName) {
                                anaesthesistname += ' ' + bills.Anaesthesist.FirstName;
                            }
                            if (bills.Anaesthesist.LastName) {
                                anaesthesistname += ' ' + bills.Anaesthesist.LastName;
                            }
                        }
                        AnaesthesistId = bills.AnaesthesistId;
                        Anaesthesistname = anaesthesistname;
                        AnaesthesistGroup[AnaesthesistId] = AnaesthesistGroup[AnaesthesistId] || [];
                    }
                    let info = {
                        'AnaesthesistId': AnaesthesistId,
                        'AnaesthesistName': Anaesthesistname,
                        'AnaesthesistCount': AnaesthesistCount
                    };
                    AnaesthesistGroup[AnaesthesistId].push(info);
                }
            }
        }
        return AnaesthesistGroup;
    }
    public async PrintSurgeryEntry(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.Id, Value: req.Id }]
        };
        let data = await this.GetSurgeryEntrys(apiReq);
        let SurgeryEntrys: any = data.Data[0];
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: SurgeryEntrys.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let userreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: SurgeryEntrys.ScurbNurseId }]
        };
        let userBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let UserData = await userBo.GetUsers(userreq);
        let ScrubNurse = UserData.Data[0];
        let eqiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OtPatientEquipmentsFilters.OtRegisterId, Value: SurgeryEntrys.Id }]
        };
        let OtPatientEquipmentsBo: any = BoFactory.GetBo(eqibo.OtPatientEquipmentsBo, this.Request);
        let OtPatientEquipmentData: any = await OtPatientEquipmentsBo.GetOtPatientEquipmentss(eqiReq);
        let OtPatientEquipment: any = OtPatientEquipmentData.Data[0];
        let noteReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OtNotesFilters.SurgeryEntryId, Value: SurgeryEntrys.Id }]
        };
        let OtNotesBo = BoFactory.GetBo(notebo.OtNotesBo, this.Request);
        let OtNotesData = await OtNotesBo.GetOtNotess(noteReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let OtNotes: any = OtNotesData.Data[0];
        let SurgeryNote: string = '';
        let AnaesthesiaNote: string = '';
        OtNotesData.Data.forEach((Detail) => {
            if (OtNotesData && Detail.OtNoteTypeId === 1) {
                SurgeryNote = Detail.DataTemplate;
            }
            if (OtNotesData && Detail.OtNoteTypeId === 2) {
                AnaesthesiaNote = Detail.DataTemplate;
            }
        });

        let info = {
            SurgeryEntry: SurgeryEntrys,
            Encounter: Encounter,
            OtPatientEquipment: OtPatientEquipment,
            OtNotes: OtNotes,
            SurgeryNote: SurgeryNote,
            AnaesthesiaNote: AnaesthesiaNote,
            Preferences: printPreferencesData,
            ScrubNurse: ScrubNurse
        };
        return await Report.Generate('otregister', { header: {}, body: info });
    }

    public async PrintSurgeryEntryReport(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<any> {
        let data = await this.GetSurgeryEntrys(apiReq);
        let SurgeryEntrys = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Surgeon = apiReq.Data.Surgeon;
        let ProcedureName = apiReq.Data.ProcedureName;

        let OtFacility = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OtFacility.FacilityId);
        let info = {
            SurgeryEntrys: SurgeryEntrys,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Surgeon: Surgeon,
            ProcedureName: ProcedureName
        };
        // let pdfOption: any = null;
        let key = 'surgeryentryreport';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
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
            console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintSurgerysummarybyProcedure(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let ProcedureName = req.Data.ProcedureName;
        let ProcedureSummary: any = [];
        let NetProcedureSummary: any = [];
        let TotProcedureCount: number = 0;
        let ProSummary = req;
        ProcedureSummary = await this.GetSurgerysummarybyProcedure(ProSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ProSummary.Data.FacilityId);
        if (ProcedureSummary) {
            for (let idx in ProcedureSummary) {
                let procedureSummary = ProcedureSummary[idx];
                let Key = '';
                let procedurename = '';
                let procedurecount = 0;
                for (let px in procedureSummary) {
                    let psummary = procedureSummary[px];
                    if (psummary.ProcedureName) {
                        procedurename = psummary.ProcedureName;
                    }
                    if (psummary.ProcedureCount) {
                        procedurecount = psummary.ProcedureCount;
                    }
                }
                Key = procedurename;
                procedurecount = procedurecount;
                NetProcedureSummary.push({
                    'Key': Key,
                    'ProcedureCount': procedurecount,
                });
            }
        }

        let totprocedurecount = 0;
        for (let ix in NetProcedureSummary) {
            let netsummary = NetProcedureSummary[ix];
            if (netsummary.ProcedureCount) {
                totprocedurecount += netsummary.ProcedureCount;
            }
        }
        TotProcedureCount = totprocedurecount;

        let info = {
            NetProcedureSummary: NetProcedureSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotProcedureCount: TotProcedureCount,
            ProcedureName: ProcedureName

        };
        let pdfOption: any = null;
        let key = 'surgerysummarybyprocedure';
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
    public async PrintSurgerysummarybySurgeon(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let SurgeonName = req.Data.SurgeonName;
        let SurgeonSummary: any = [];
        let NetSurgeonSummary: any = [];
        let TotSurgeonCount: number = 0;
        let SurSummary = req;
        SurgeonSummary = await this.GetSurgerysummarybySurgeon(SurSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SurSummary.Data.FacilityId);
        if (SurgeonSummary) {
            let selfsurgeon = [];
            let insurancesurgeon = [];
            if (SurgeonSummary.length > 0) {
                selfsurgeon = SurgeonSummary[0].Value;
            }
            if (SurgeonSummary.length > 1) {
                insurancesurgeon = SurgeonSummary[1].Value;
            }
            for (let idx in selfsurgeon) {
                let surgeonSummary = selfsurgeon[idx];
                let Key = '';
                let SurgeonName = '';
                let SelfCount = 0;
                for (let px in surgeonSummary) {
                    let psummary = surgeonSummary[px];
                    if (psummary.SurgeonName) {
                        SurgeonName = psummary.SurgeonName;
                    }
                    if (psummary.SelfCount) {
                        SelfCount = psummary.SelfCount;
                    }
                }
                Key = SurgeonName;
                SelfCount = SelfCount;
                NetSurgeonSummary.push({
                    'Key': Key,
                    'SelfCount': SelfCount,
                });
            }
            for (let idx in insurancesurgeon) {
                let surgeonSummary = insurancesurgeon[idx];
                let Key = '';
                let SurgeonName = '';
                let InsuranceCount = 0;
                for (let px in surgeonSummary) {
                    let psummary = surgeonSummary[px];
                    if (psummary.SurgeonName) {
                        SurgeonName = psummary.SurgeonName;
                    }
                    if (psummary.InsuranceCount) {
                        InsuranceCount = psummary.InsuranceCount;
                    }
                }
                Key = SurgeonName;
                InsuranceCount = InsuranceCount;
                let valappended = 0;
                NetSurgeonSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.InsuranceCount = InsuranceCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0) {
                    NetSurgeonSummary.push({
                        'Key': Key,
                        'InsuranceCount': InsuranceCount,
                    });
                }
            }
        }
        let totSelfCount = 0;
        let totInsuranceCount = 0;
        for (let ix in NetSurgeonSummary) {
            let netsummary = NetSurgeonSummary[ix];
            if (netsummary.SelfCount) {
                totSelfCount += netsummary.SelfCount;
            }
            if (netsummary.InsuranceCount) {
                totInsuranceCount += netsummary.InsuranceCount;
            }
        }
        let TotSelfCount = totSelfCount;
        let TotInsuranceCount = totInsuranceCount;

        let info = {
            NetSurgeonSummary: NetSurgeonSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotSurgeonCount: TotSurgeonCount,
            SurgeonName: SurgeonName,
            TotSelfCount: TotSelfCount,
            TotInsuranceCount: TotInsuranceCount


        };
        let pdfOption: any = null;
        let key = 'surgerysummarybysurgeon';
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
    public async PrintSurgerysummarybyAnaesthesist(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let AnaesthesistName = req.Data.AnaesthesistName;
        let AnaesthesistSummary: any = [];
        let NetAnaesthesistSummary: any = [];
        let TotAnaesthesistCount: number = 0;
        let SurSummary = req;
        AnaesthesistSummary = await this.GetSurgerysummarybyAnaesthetist(SurSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SurSummary.Data.FacilityId);
        if (AnaesthesistSummary) {
            for (let idx in AnaesthesistSummary) {
                let anaesthesistSummary = AnaesthesistSummary[idx];
                let Key = '';
                let AnaesthesistName = '';
                let Anaesthesistcount = 0;
                for (let px in anaesthesistSummary) {
                    let psummary = anaesthesistSummary[px];
                    if (psummary.AnaesthesistName) {
                        AnaesthesistName = psummary.AnaesthesistName;
                    }
                    if (psummary.AnaesthesistCount) {
                        Anaesthesistcount = psummary.AnaesthesistCount;
                    }
                }
                Key = AnaesthesistName;
                Anaesthesistcount = Anaesthesistcount;
                NetAnaesthesistSummary.push({
                    'Key': Key,
                    'AnaesthesistCount': Anaesthesistcount,
                });
            }
        }

        let totAnaesthesistcount = 0;
        for (let ix in NetAnaesthesistSummary) {
            let netsummary = NetAnaesthesistSummary[ix];
            if (netsummary.AnaesthesistCount) {
                totAnaesthesistcount += netsummary.AnaesthesistCount;
            }
        }
        TotAnaesthesistCount = totAnaesthesistcount;

        let info = {
            NetAnaesthesistSummary: NetAnaesthesistSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotAnaesthesistCount: TotAnaesthesistCount,
            AnaesthesistName: AnaesthesistName

        };
        let pdfOption: any = null;
        let key = 'surgerysummarybyanaesthesist';
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
    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let SurgeryEntryCount = await this.Items.count({
            where: {
                'Status': 1,
                'SurgeryEntryStatusId': { '$in': [2, 4] }
            }
        });
        return {
            'SurgeryEntryCount': SurgeryEntryCount,
        };
    }
    public GetModel(): SStatic.Model<SurgeryEntryInstance, SurgeryEntryAttributes> {
        return this.Models.SurgeryEntry;
    }
}
