import * as SStatic from 'sequelize';
import { Op, WhereOptions } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterInstance, EncounterAttributes } from '../Model/Interface/Index';
import { EncounterFilters } from '../Common/Filters.e';
import { PatientKinFilters, } from '../../Registration/Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Registration/Business/Index';
import * as apptbo from '../../Appointment/Business/Index';
import * as inpatientBO from '../../IPManagement/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';
import * as clinicalMasterBo from '../../ClinicalMaster/Business/Index';
import * as billingBo from '../../Billing/Business/Index';
import * as emrBo from '../../EMR/Business/Index';
import * as appMgBo from '../../SystemSettings/Business/Index';
import * as regBo from '../../Registration/Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as moment from 'moment';
import { ServiceItemAliasFilters, ProcedureFilters } from '../../ClinicalMaster/Common/Filters.e';
import { UserTeamFilters } from '../../SystemSettings/Common/Filters.e';
import { ReferenceValueFilters, DepartmentFilters } from '../../SystemSettings/Common/Filters.e';
import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
import { MRDLocationFilters } from '../../IPManagement/Common/Filters.e';
import { WardRoomBedMasterFilters } from '../../GeneralMaster/Common/Filters.e';
import {
    PatientBillsFilters, PatientBillDetailsFilters,
    PatientPaymentDetailsFilters, PatientBillSummaryFilters,
    PatientRefundFilters
} from '../../Billing/Common/Filters.e';
import { PatientOrderFilters } from '../../EMR/Common/Filters.e';
import { PatientGuarantorFilters, } from '../../Registration/Common/Filters.e';
import * as OTBO from '../../OtManagement/Business/Index';
import { SurgeryEntryFilters } from '../../OtManagement/Common/Filters.e';
import * as _ from 'lodash';
import { ReferralAttributes } from '../../GeneralMaster/Model/Interface/Index';
import { IntegrationService } from '../../../Common/IntegrationService';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';
import * as facilityBo from '../../SystemSettings/Business/Index';

export class EncounterBo extends BaseBo<EncounterInstance, EncounterAttributes> {
    public async AddEncounter(req: BaseRequest): Promise<number> {
        let generateVisitId: number = 0;
        if (req.Data.EncounterTypeId === 3) {
            generateVisitId = 1;
        }

        if (req.Data.DoctorId > 0)
            req.Data.TeamId = await this.getTeamId(req.Data.DoctorId);
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result = await this.Save(req.Data);
        let encId = result.dataValues.Id;
        if (generateVisitId === 1) {
            try {
                this.deferSequenceKey(encId, 'VisitIdentifier',
                    this.getSequenceIdentifier(SequenceKeys.AERegistration));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }
        // if (req.Data.Id > 0 && req.Data.EncounterTypeId === 1 && process.env.MEDBLAZE_URL && process.env.MEDBLAZE_URL.length > 3) {
        //     let encounterData = await this.GetEncounterById({ Id: req.Data.Id });
        //     let VisitIdentifier = encounterData.VisitIdentifier;
        //     if (VisitIdentifier) {
        //         console.log(req.Data);
        //         console.log(VisitIdentifier);
        //         const integrationService = new IntegrationService();
        //         req.Data.feedbackData.variables[5].value = String(VisitIdentifier);
        //         // let postResult:any = await integrationService.postMedBlaze(req.Data.feedbackData);
        //         // console.log(postResult);
        //     }
        // }
        return encId;
    }

    public async AddPharmacyEncounter(req: BaseRequest): Promise<number> {
        let generateVisitId: number = 0;
        if (req.Data.EncounterTypeId === 3) {
            generateVisitId = 1;
        }
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result = await this.Save(req.Data);
        let encId = result.dataValues.Id;
        if (generateVisitId === 1) {
            try {
                this.deferSequenceKey(encId, 'VisitIdentifier',
                    this.getSequenceIdentifier(SequenceKeys.OPEncounter));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }

        return encId;
    }

    public async getTeamId(DoctorId: number): Promise<number> {
        let vTeamId = 0;
        let userTermBO = BoFactory.GetBo(userbo.UserTeamBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: UserTeamFilters.UserId, Value: DoctorId },
                { Key: UserTeamFilters.IsDefault, Value: true },
            ]
        };
        let data = await userTermBO.GetUserTeams(apiReq);
        for (let i = 0; i < data.length && i < 1; i++) {
            vTeamId = data[i].TeamId;
        }
        return vTeamId;
    }

    public async UpdateEncounter(req: BaseRequest): Promise<boolean> {
        // console.log(req.Data);
        let result = await this.Update(req.Data);
        // let PatientDischargeEventBo = BoFactory.GetBo(inpatientBO.PatientDischargeEventBo, this.Request);
        // let eventreq: any = {
        //     Data: {
        //         PatientDischargeEventId: req.Data.PatientDischargeEventId,
        //         DischargeTypeId: req.Data.DischargeTypeId,
        //         DoctorId: req.Data.DoctorId,
        //         PatientId: req.Data.PatientId,
        //         EncounterId: req.Data.Id,
        //         ClicalDischargeId: req.Data.ClincalStatusId,
        //         Comments: req.Data.Comments
        //     }mo
        // };
        // if (eventreq.Data.PatientDischargeEventId > 0)
        //     await PatientDischargeEventBo.UpdatePatientDischargeEventByDiagnosis(eventreq);
        return result;
    }


    public async CheckoutOldVisit(req: BaseRequest): Promise<boolean> {
        if (req.Data.PatientId) {
            let previousEncounter: any = {
                DischargeDate: new Date(),
                EncounterStatusId: 2, IsLatest: false
            };
            await this.Update(previousEncounter, {
                fields: ['IsLatest'],
                where: {
                    PatientId: req.Data.PatientId,
                    EncounterTypeId: 1, // OP Checkout
                    IsLatest: true
                }
            });
        }
        return true;
    }

    public async UpdateEncounterDiagnosis(req: BaseRequest): Promise<boolean> {
        let eventdata: any = {
            Data: {
                Id: req.Data.EncounterId,
                DischargeTypeId: req.Data.DischargeTypeId,
                ClincalStatusId: req.Data.ClincalStatusId,
                PatientId: req.Data.PatientId,
                Comments: req.Data.Comments,
                DiagnosisId: req.Data.DiagnosisId,
                Diagnosis2Id: req.Data.Diagnosis2Id,
                Diagnosis3Id: req.Data.Diagnosis3Id,
                CPTDiagnosisId: req.Data.CPTDiagnosisId,
                OtherDiagnosis: req.Data.OtherDiagnosis
            }
        };
        let result = await this.Update(eventdata.Data);
        return result;
    }

    public async CancelAdmissionEncounter(req: BaseRequest): Promise<boolean> {
        let encData = await this.GetEncounterById({ Id: req.Data.Id });
        if (!encData) {
            return false;
        }
        encData.AdmissionStatusId = 7;
        encData.EncounterStatusId = 2;
        encData.IsLatest = false;
        encData.Status = 1;
        if (req.Data.Comments) {
            encData.Comments = req.Data.Comments;
        }
        let result = await this.Update(encData);
        if (result) {
            let patbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            await patbillBO.CancelEncIPBills(req);

            let patbillDetailBO = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
            await patbillDetailBO.CancelEncIPBillDetails(req);

            let paymentBO = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
            await paymentBO.CancelEncIPBillPayments(req);

            let refundBO = BoFactory.GetBo(billingBo.PatientRefundBo, this.Request);
            await refundBO.CancelEncIPBillRefunds(req);

            let bedOccupancyBO = BoFactory.GetBo(inpatientBO.BedOccupancyHistoryBo, this.Request);
            await bedOccupancyBO.EncReOccupyBed(req);

            let wardroombedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
            await wardroombedBO.ManageEncCancelBedStatus(req);
        }
        return result;
    }

    public async ManageEmergencyBillsTransfer(req: BaseRequest): Promise<number> {

        let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        let billReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.OnlyPID, Value: req.Data.PatientId },
            { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillsFilters.EncounterId, Value: req.Data.OldEncId }]
        };
        let patBillsData = await patientbillBO.GetPatientBills(billReq);
        let billSummBo = BoFactory.GetBo(billingBo.PatientBillSummaryBo, this.Request);
        if (patBillsData.Data.length > 0) {
            for (let pdx in patBillsData.Data) {
                let BillInfo = patBillsData.Data[pdx];
                let billDate: any;
                if (req.Data.IsFromDayCare) {
                    billDate = BillInfo.BillDateTime;
                } else {
                    billDate = req.Data.AdmissionDate;
                }
                let billData: any = {
                    Id: BillInfo.Id,
                    EncounterId: req.Data.Id,
                    BillTypeId: 3,
                    BillDateTime: billDate,
                    BillNumber: await Sequence.Next(SequenceKeys.IPBillNumberId)
                };
                await patientbillBO.Update(billData);

                let patientbilldetBO = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
                let billReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: BillInfo.Id }]
                };
                let patBillDetailsData = await patientbilldetBO.GetPatientBillDetails(billReq);
                for (let pddx in patBillDetailsData.Data) {
                    let detailDataBills = patBillDetailsData.Data[pddx];
                    if (req.Data.IsFromDayCare) {
                        billDate = detailDataBills.BillDateTime;
                    } else {
                        billDate = req.Data.AdmissionDate;
                    }
                    let bilDetInfo: any = {
                        Id: detailDataBills.Id,
                        BillDateTime: billDate,
                        EncounterId: req.Data.Id
                    };
                    await patientbilldetBO.Update(bilDetInfo);
                }
                if (!req.Data.IsFromDayCare) {
                    await billSummBo.ManagePatBillSummary(false, req.Data.Id, patBillDetailsData.Data);
                }
            }
        }
        if (req.Data.IsFromDayCare) {

            let patientOrderBO = BoFactory.GetBo(emrBo.PatientOrderBo, this.Request);
            let billorderReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientOrderFilters.PatientId, Value: req.Data.PatientId },
                // { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
                { Key: PatientOrderFilters.EncounterId, Value: req.Data.OldEncId }]
            };
            let patBillorderData: any = await patientOrderBO.GetMinPatientOrders(billorderReq);

            if (patBillorderData.Data.length > 0) {
                for (let pdx in patBillorderData.Data) {
                    let orderInfo = patBillorderData.Data[pdx];
                    // let billDate: any;
                    // if (req.Data.IsFromDayCare) {
                    //     billDate = BillInfo.BillDateTime;
                    // } else {
                    //     billDate = req.Data.AdmissionDate;
                    // }
                    let orderData: any = {
                        Id: orderInfo.Id,
                        EncounterId: req.Data.Id,
                        // BillTypeId: 3,
                        // BillDateTime: billDate,
                        // BillNumber: await Sequence.Next(SequenceKeys.IPBillNumberId)
                    };
                    await patientOrderBO.Update(orderData);

                    // let patientbilldetBO = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
                    // let billReq = {
                    //     Id: 0,
                    //     PageContext: { PageSize: -1, PageNumber: 1 },
                    //     Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: BillInfo.Id }]
                    // };
                    // let patBillDetailsData = await patientbilldetBO.GetPatientBillDetails(billReq);
                    // for (let pddx in patBillDetailsData.Data) {
                    //     let detailDataBills = patBillDetailsData.Data[pddx];
                    //     if (req.Data.IsFromDayCare) {
                    //         billDate = detailDataBills.BillDateTime;
                    //     } else {
                    //         billDate = req.Data.AdmissionDate;
                    //     }
                    //     let bilDetInfo: any = {
                    //         Id: detailDataBills.Id,
                    //         BillDateTime: billDate,
                    //         EncounterId: req.Data.Id
                    //     };
                    //     await patientbilldetBO.Update(bilDetInfo);
                    // }

                }
            }

            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: req.Data.OldEncId },
                ]
            };
            let PatinetBillSummaData = await billSummBo.GetPatientBillSummarys(billSummReq);
            if (PatinetBillSummaData.Data.length > 0) {
                for (let sdx in PatinetBillSummaData.Data) {
                    let billSummData = PatinetBillSummaData.Data[sdx];
                    let SummInfo: any = {
                        Id: billSummData.Id,
                        EncounterId: req.Data.Id
                    };
                    await billSummBo.Update(SummInfo);
                }
            }
        }
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
        let paydetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.OnlyPID, Value: req.Data.PatientId },
            { Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Data.OldEncId }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(paydetailReq);
        if (PatientPaymentDetailsData.Data.length > 0) {
            for (let pddx in PatientPaymentDetailsData.Data) {
                let paymentInfo = PatientPaymentDetailsData.Data[pddx];
                let recDate: any;
                if (req.Data.IsFromDayCare) {
                    recDate = paymentInfo.ReceiptDateTime;
                } else {
                    recDate = req.Data.AdmissionDate;
                }
                let PayDetailInfo: any = {
                    Id: paymentInfo.Id,
                    ReceiptDateTime: recDate,
                    EncounterId: req.Data.Id,
                    EncounterTypeId: 2,
                    BillTypeId: 3
                };
                await PatientPaymentDetailsBo.Update(PayDetailInfo);
            }
        }

        let PatientRefundBo = BoFactory.GetBo(billingBo.PatientRefundBo, this.Request);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientId, Value: req.Data.PatientId },
            { Key: PatientRefundFilters.EncounterId, Value: req.Data.OldEncId }]
        };
        let PatRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        if (PatRefundData.Data.length > 0) {
            for (let pddx in PatRefundData.Data) {
                let refInfo = PatRefundData.Data[pddx];
                let recDate: any;
                if (req.Data.IsFromDayCare) {
                    recDate = refInfo.RefundDateTime;
                } else {
                    recDate = req.Data.AdmissionDate;
                }
                let PayDetailInfo: any = {
                    Id: refInfo.Id,
                    RefundDateTime: recDate,
                    EncounterId: req.Data.Id,
                    EncounterTypeId: 2
                };
                await PatientPaymentDetailsBo.Update(PayDetailInfo);
            }
        }
        return req.Data.Id;
    }

    public async ManageDayCareAdmissionEncounter(req: BaseRequest): Promise<number> {
        let saveResult: any;
        let updateResult: any;
        let generateVisitId: number = 0;
        let PatientGuarantorId: number;
        let GuarantorId: number;
        let PatientGuarantorTypeId: number;
        let PatientGuarantorName: string;
        let isSave: boolean = false;
        let encdata: any;
        if (req.Data.EncId) {
            encdata = await this.GetEncounterById({ Id: req.Data.EncId });
            if (!encdata) {
                return 0;
            }
            let PatientDischargeEventBo = BoFactory.GetBo(inpatientBO.PatientDischargeEventBo, this.Request);
            let encUpdate: any = {
                Data: {
                    // Id: encdata.Id,
                    EncounterId: encdata.Id,
                    DischargeDate: new Date(),
                    DischargeTypeId: 1,
                    FromBedId: encdata.BedId,
                    AdmissionStatusId: 6,
                    IsLatest: false,
                    EncounterStatusId: 2,
                    IsBillLock: true,
                }
            };
            // await this.Update(encUpdate.Data);
            await PatientDischargeEventBo.AddPatientDischargeEventFromDayCare(encUpdate);
        }
        req.Data.AdmissionDate = encdata.AdmissionDate;
        if (req.Data.AdmissionStatusId === 2 && req.Data.Id === 0)
            await this.CanAdmitPatient(req);

        if (req.Data.AdmissionStatusId === 2 && !req.Data.VisitIdentifier) {
            generateVisitId = 1;
        }

        let iRoomRentInHourly = 0;
        let facilityprebo = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.roomrentinhourly) {
            try {
                iRoomRentInHourly = parseInt(facilityPreferencesData.roomrentinhourly);
            } catch (ex) { iRoomRentInHourly = 0; }
        }

        if (req.Data.GuarantorId > 0) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientforGuarantorInfo(req.Data.PatientId,
                req.Data.GuarantorTypeId, req.Data.GuarantorId, req.Data.TpaId, req.Data.GuarantorName, req.Data.EncId);

            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId },
                { Key: PatientGuarantorFilters.GuarantorId, Value: req.Data.GuarantorId }]
            };
            let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
            if (resguardata) {
                PatientGuarantorId = resguardata.Data[0].Id;
                GuarantorId = resguardata.Data[0].GuarantorId;
                PatientGuarantorTypeId = resguardata.Data[0].GuarantorTypeId;
                PatientGuarantorName = resguardata.Data[0].GuarantorName;
            }
            if (!req.Data.IsNewEncounter) {
                let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
                let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: PatientGuarantorId });
                if (patientGuarantorData) {
                    let guarantorBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
                    let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });
                    let GuarantorId_ = 1000;
                    GuarantorId_ = await guarantorBO.GetCurrentGuarantorId();
                    if (req.Data.GuarantorTypeId > 1) {
                        req.Data.CoPayPercent = guarantor.CoPayPercent;
                    }
                    if ((guarantor.Id !== GuarantorId_) && (!guarantor.IsIPBedTariff)) {
                        req.Data.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                    }
                }
            } else if (req.Data.IsNewEncounter) {
                let guarantorBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
                let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
                let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: PatientGuarantorId });
                if (patientGuarantorData) {
                    let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });
                    let GuarantorId_ = 1000;
                    GuarantorId_ = await guarantorBO.GetCurrentGuarantorId();
                    if (req.Data.GuarantorTypeId > 1) {
                        req.Data.CoPayPercent = guarantor.CoPayPercent;
                    }
                    if ((guarantor.Id !== GuarantorId_) && (!guarantor.IsIPBedTariff)) {
                        req.Data.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                    }
                }
            }
        }

        if (req.Data.Id === 0 && req.Data.Status !== 2) {
            req.Data.IsLatest = true;
            req.Data.EncounterStatusId = 1; //START

            if (req.Data.DoctorId > 0)
                req.Data.TeamId = await this.getTeamId(req.Data.DoctorId);

            if (generateVisitId === 1) {
                if (!req.Data.IsFromDayCare)
                    req.Data.AdmissionDate = new Date();

            }
            if (await this.IsAlreadyExist(req) <= -1) return -1;
            saveResult = await this.Save(req.Data);
            req.Data.Id = saveResult.dataValues.Id;
            if (generateVisitId === 1 && req.Data.AdmissionStatusId === 2) {
                try {
                    this.deferSequenceKey(req.Data.Id, 'VisitIdentifier',
                        this.getSequenceIdentifier(SequenceKeys.Admission));
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }


            isSave = true;
            if (req.Data.DoctorId) {
                await this.SMSAdmissionStatus(req.Data.Id);
                await this.SmsReferralDoctor(req);
            }

            if (req.Data.TeamId && req.Data.TeamId > 0)
                await this.GetAdmissionTeamUsers(req.Data.Id, req.Data.TeamId);

        } else if (req.Data.Id > 0) {
            updateResult = await this.Update(req.Data);
            if (generateVisitId === 1) {
                try {
                    this.deferSequenceKey(req.Data.Id, 'VisitIdentifier',
                        this.getSequenceIdentifier(SequenceKeys.Admission));
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
        }
        let admissionlogbo = BoFactory.GetBo(inpatientBO.PatientAdmissionLogBo, this.Request);
        let bedOccupancyHistory = BoFactory.GetBo(inpatientBO.BedOccupancyHistoryBo, this.Request);
        if (isSave && req.Data.AdmissionStatusId === 2) {

            //Add bill for Facility Default Service Items
            let facilityInfo: any = {
                Data: {
                    NoofDays: 1,
                    RoomId: req.Data.RoomId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: req.Data.FacilityId,
                    GuarantorId: req.Data.GuarantorId,
                    PatientGuarantorId: PatientGuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                    CoPayPercent: req.Data.CoPayPercent,
                    EncounterId: req.Data.Id,
                    IsFromDayCare: (req.Data.IsFromDayCare === true) ? 1 : 0
                }
            };
            // if (!req.Data.IsDayCare)
            await this.ManageEncounterFacilityBillInfo(facilityInfo);
            let iRoomRentGraceMins = 0;
            if (req.Data.RoomId) {
                let Roombo = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
                let RoomInfo = await Roombo.GetWardRoomMasterById({ Id: req.Data.RoomId });
                iRoomRentGraceMins = RoomInfo.GracePeriod;
                if (!iRoomRentGraceMins) iRoomRentGraceMins = 0;
            }

            //Add bill for Bed and Room Default Service Items
            let billInfoReq: any = {
                Data: {
                    NoofDays: (iRoomRentGraceMins > 0) ? 0 : (iRoomRentInHourly > 0) ? 0.5 : 1,
                    RoomId: req.Data.RoomId,
                    WardId: req.Data.WardId,
                    BedId: req.Data.BedId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: req.Data.FacilityId,
                    GuarantorId: req.Data.GuarantorId,
                    PatientGuarantorId: PatientGuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                    CoPayPercent: req.Data.CoPayPercent,
                    EncounterId: req.Data.Id,
                    IsPrimaryBed: true,
                    IsDoubleOccupancy: false
                }
            };
            let PatientBillId = await this.ManageBedChargesBillInfo(billInfoReq);

            //Update BedStatus available to Occupied
            if (req.Data.BedId && req.Data.BedId > 0) {
                let bedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
                // let bedInfo = await bedBO.GetWardRoomBedMasterById({ Id: req.Data.BedId });
                let bedRequest: any = {
                    Data: {
                        Id: req.Data.BedId,
                        BedStatusId: 2
                    }
                };
                await bedBO.UpdateBedMaster(bedRequest);

                let bedOccupancyInfo: any = {
                    Data: {
                        EncounterId: req.Data.Id,
                        PatientId: req.Data.PatientId,
                        LocationId: req.Data.LocationId,
                        WardId: req.Data.WardId,
                        DoctorId: req.Data.DoctorId,
                        DepartmentId: req.Data.DepartmentId,
                        FacilityId: req.Data.FacilityId,
                        RoomId: req.Data.RoomId,
                        BedId: req.Data.BedId,
                        AdmissionDate: req.Data.AdmissionDate,
                        //DischargeDate: req.Data.ExpectedDischargeDate,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        AdmitStatusId: req.Data.AdmissionStatusId,
                        PatientBillId: PatientBillId,
                        OccupancyStatusId: 1,
                        IsPrimaryBed: 1,
                        BillingStartDate: new Date(),
                        // BillingEndDate: new Date()
                    }
                };
                await bedOccupancyHistory.ManageBedOccupancyHistory(bedOccupancyInfo);
            }
        }

        //Update the Encounter Doctor
        let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encounterDocBO.ManageAdmissionDoctor(req);

        //Update Encounter Guarantor
        let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
        req.Data.PatientGuarantorId = PatientGuarantorId;
        req.Data.GuarantorId = req.Data.GuarantorId;
        req.Data.EncounterId = req.Data.Id; // Add Property to assign the encounter id in guarantor
        await encounterGuarantorBo.ManageEncounterGuarantor(req);
        if (isSave && req.Data.AdmissionStatusId === 2) {
            let AdmissionLog: any = {
                Data: {
                    EncounterId: req.Data.Id,
                    AdmissionStatusId: req.Data.AdmissionStatusId,
                    AdmittingReasonId: req.Data.AdmittingReasonId,
                    DoctorId: req.Data.DoctorId
                }
            };
            await admissionlogbo.AddPatientAdmissionLog(AdmissionLog);
        }

        let PatientId: number;
        let encounterId: number;
        let PatientMRN: string;
        let DoctorId: number;
        let DoctorName: string;
        let RequestTypeId_ = 0;
        let MRDTypeId_ = 2; //IP
        let MrdRequestTypeId_ = 1; //visit
        let FrmDeptId = 0;
        let ToDeptId = 0;
        let CurrentLocId = 0;
        let NewPatient = 0;
        let IsMRDRequired = 0;
        let IsMRDFileCreation = 0;
        let MRDMovementStatusId = 0;
        let IsManual = false;
        let PriorityId = 3;  //medium

        PatientId = req.Data.PatientId;
        encounterId = req.Data.Id;
        DoctorId = req.Data.DoctorId;
        FrmDeptId = this.Session.DepartmentId;

        if (req.Data.IsMRDFileCreation === true) {
            let apiDeptReq = {
                Id: 0,
                PageContext: { PageSize: 1, PageNumber: 1 },
                Params: [{ Key: DepartmentFilters.IsMRDLocation, Value: true }]
            };
            let deptBo = BoFactory.GetBo(appMgBo.DepartmentBo, this.Request);
            let deptdata = await deptBo.GetDepartments(apiDeptReq);
            if (deptdata && deptdata.Data && deptdata.Data.length > 0) {
                ToDeptId = deptdata.Data[0].Id;
                CurrentLocId = deptdata.Data[0].Id;
            }
            MRDMovementStatusId = 1; //Requested
        }
        if (ToDeptId > 0 && req.Data.IsMRDFileCreation === true) {
            let MRDFileStatusId = 1; // Created
            let MRDLocBo = BoFactory.GetBo(inpatientBO.MRDLocationBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: MRDLocationFilters.PatientId, Value: req.Data.PatientId },
                ]
            };
            let data = await MRDLocBo.GetMRDLocations(apiReq);
            if (data.Data.length === 0) {
                await MRDLocBo.ManageMRDLocation(PatientMRN, RequestTypeId_, MRDTypeId_,
                    PatientId, encounterId, DoctorId, DoctorName,
                    0, null, null, FrmDeptId, ToDeptId, CurrentLocId, NewPatient,
                    MRDFileStatusId, MRDMovementStatusId, IsMRDRequired, IsMRDFileCreation, IsManual, PriorityId, MrdRequestTypeId_);
            }
        }
        return req.Data.Id;
    }

    public async ManageAdmissionEncounter(req: BaseRequest): Promise<number> {
        let saveResult: any;
        let updateResult: any;
        let generateVisitId: number = 0;
        let PatientGuarantorId: number;
        let GuarantorId: number;
        let PatientGuarantorTypeId: number;
        let PatientGuarantorName: string;
        let isSave: boolean = false;
        if (req.Data.AdmissionStatusId === 2 && req.Data.Id === 0)
            await this.CanAdmitPatient(req);

        if (req.Data.AdmissionStatusId === 2 && !req.Data.VisitIdentifier) {
            generateVisitId = 1;
        }

        let iRoomRentInHourly = 0;
        let facilityprebo = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.roomrentinhourly) {
            try {
                iRoomRentInHourly = parseInt(facilityPreferencesData.roomrentinhourly);
            } catch (ex) { iRoomRentInHourly = 0; }
        }

        if (req.Data.GuarantorId > 0) {

            if (!req.Data.IsNewEncounter) {
                // let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
                // let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: PatientGuarantorId });
                // if (patientGuarantorData) {
                let guarantorBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
                let guarantor = await guarantorBO.GetGuarantorById({ Id: req.Data.GuarantorId });
                let GuarantorId_ = 1000;
                GuarantorId_ = await guarantorBO.GetCurrentGuarantorId();
                if (req.Data.GuarantorTypeId > 1) {
                    req.Data.CoPayPercent = guarantor.CoPayPercent;
                }
                if ((guarantor.Id !== GuarantorId_) && (!guarantor.IsIPBedTariff)) {
                    req.Data.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                }
                // }
            } else if (req.Data.IsNewEncounter) {
                let guarantorBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
                // let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
                // let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: PatientGuarantorId });
                // if (patientGuarantorData) {
                let guarantor = await guarantorBO.GetGuarantorById({ Id: req.Data.GuarantorId });
                let GuarantorId_ = 1000;
                GuarantorId_ = await guarantorBO.GetCurrentGuarantorId();
                if (req.Data.GuarantorTypeId > 1) {
                    req.Data.CoPayPercent = guarantor.CoPayPercent;
                }
                if ((guarantor.Id !== GuarantorId_) && (!guarantor.IsIPBedTariff)) {
                    req.Data.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                }
                // }
            }
        }

        if (req.Data.Id === 0 && req.Data.Status !== 2) {
            req.Data.IsLatest = true;
            req.Data.EncounterStatusId = 1; //START

            if (req.Data.DoctorId > 0)
                req.Data.TeamId = await this.getTeamId(req.Data.DoctorId);

            if (generateVisitId === 1) {
                if (!req.Data.IsEmergencyPatient)
                    req.Data.AdmissionDate = new Date();
            }

            if (await this.IsAlreadyExist(req) <= -1) return -1;
            // req.Data.AdmissionDate = new Date();
            saveResult = await this.Save(req.Data);
            req.Data.Id = saveResult.dataValues.Id;
            let EncId = req.Data.Id;
            // req.Data.PatientGuarantorId = PatientGuarantorId;
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);


            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId },
                { Key: PatientGuarantorFilters.GuarantorId, Value: req.Data.GuarantorId },
                { Key: PatientGuarantorFilters.EncounterId, Value: EncId }]
            };
            let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
            if (resguardata.Data.length === 0) {
                PatientGuarantorId = await patientGuarantorBO.ManagePatientforGuarantorInfowEnc(req.Data.PatientId,
                    req.Data.GuarantorTypeId, req.Data.GuarantorId, req.Data.TpaId, req.Data.GuarantorName, EncId);
            }
            // await patientGuarantorBo.UpdateEncGuarantor(req, EncId);
            // if (generateVisitId === 1 && req.Data.AdmissionStatusId === 2 && req.Data.GuarantorTypeId > 1) {
            //     this.deferSequenceKey(req.Data.Id, 'InsuranceTempBillNo',
            //         this.getSequenceIdentifier(SequenceKeys.InsuranceTempBill));
            // }
            if (generateVisitId === 1 && req.Data.AdmissionStatusId === 2 && !req.Data.IsDayCare) {
                try {
                    let visitIdentifier = '';
                    visitIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.Admission,
                        req.Data.FacilityId
                    );
                    if (visitIdentifier) {
                        this.deferSequenceKey(req.Data.Id, 'VisitIdentifier',
                            visitIdentifier);
                    } else {
                        throw { message: 'Sequence Issue.. Please contact Support' };
                    }


                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
            if (generateVisitId === 1 && req.Data.AdmissionStatusId === 2 && req.Data.IsDayCare) {
                try {
                    this.deferSequenceKey(req.Data.Id, 'VisitIdentifier',
                        this.getSequenceIdentifier(SequenceKeys.DayCareAdmission));
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }

            isSave = true;

            // if (req.Data.DoctorId) {
            //     await this.SMSAdmissionStatus(req.Data.Id);
            //     await this.SmsReferralDoctor(req);
            // }

            if (req.Data.TeamId && req.Data.TeamId > 0)
                await this.GetAdmissionTeamUsers(req.Data.Id, req.Data.TeamId);

        } else if (req.Data.Id > 0) {
            updateResult = await this.Update(req.Data);
            if (generateVisitId === 1) {
                try {
                    this.deferSequenceKey(req.Data.Id, 'VisitIdentifier',
                        this.getSequenceIdentifier(SequenceKeys.Admission));
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientforGuarantorInfo(req.Data.PatientId,
                req.Data.GuarantorTypeId, req.Data.GuarantorId, req.Data.TpaId, req.Data.GuarantorName, req.Data.Id);

            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId },
                { Key: PatientGuarantorFilters.GuarantorId, Value: req.Data.GuarantorId }]
            };
            let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
            if (resguardata.Data.length > 0) {
                PatientGuarantorId = resguardata.Data[0].Id;
                GuarantorId = resguardata.Data[0].GuarantorId;
                PatientGuarantorTypeId = resguardata.Data[0].GuarantorTypeId;
                PatientGuarantorName = resguardata.Data[0].GuarantorName;
            }
        }

        if (req.Data.Id > 0 && process.env.MEDBLAZE_URL && process.env.MEDBLAZE_URL.length > 3) {
            let encounterData = await this.GetEncounterById({ Id: req.Data.Id });
            let VisitIdentifier = encounterData.VisitIdentifier;
            if (VisitIdentifier) {
                const integrationService = new IntegrationService();
                req.Data.feedbackData.variables[5].value = String(VisitIdentifier);
                let postResult: any = await integrationService.postMedBlaze(req.Data.feedbackData);
                console.log(postResult);
            }
        }

        let admissionlogbo = BoFactory.GetBo(inpatientBO.PatientAdmissionLogBo, this.Request);
        let bedOccupancyHistory = BoFactory.GetBo(inpatientBO.BedOccupancyHistoryBo, this.Request);
        if (isSave && req.Data.AdmissionStatusId === 2) {

            //Add bill for Facility Default Service Items
            let facilityInfo: any = {
                Data: {
                    NoofDays: 1,
                    RoomId: req.Data.RoomId,
                    WardId: req.Data.WardId,
                    BedId: req.Data.BedId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: req.Data.FacilityId,
                    GuarantorId: req.Data.GuarantorId,
                    PatientGuarantorId: PatientGuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                    CoPayPercent: req.Data.CoPayPercent,
                    EncounterId: req.Data.Id
                }
            };
            if (!req.Data.IsDayCare)
                await this.ManageEncounterFacilityBillInfo(facilityInfo);
            let iRoomRentGraceMins = 0;
            if (req.Data.RoomId) {
                let Roombo = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
                let RoomInfo = await Roombo.GetWardRoomMasterById({ Id: req.Data.RoomId });
                iRoomRentGraceMins = RoomInfo.GracePeriod;
                if (!iRoomRentGraceMins) iRoomRentGraceMins = 0;
            }

            //Add bill for Bed and Room Default Service Items
            let billInfoReq: any = {
                Data: {
                    NoofDays: (iRoomRentGraceMins > 0) ? 0 : (iRoomRentInHourly > 0) ? 0.5 : 1,
                    RoomId: req.Data.RoomId,
                    BedId: req.Data.BedId,
                    WardId: req.Data.WardId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: req.Data.FacilityId,
                    GuarantorId: req.Data.GuarantorId,
                    PatientGuarantorId: PatientGuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                    CoPayPercent: req.Data.CoPayPercent,
                    EncounterId: req.Data.Id,
                    IsPrimaryBed: true,
                    IsDoubleOccupancy: false
                }
            };
            let PatientBillId = await this.ManageBedChargesBillInfo(billInfoReq);

            //Update BedStatus available to Occupied
            if (req.Data.BedId && req.Data.BedId > 0) {
                let bedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
                // let bedInfo = await bedBO.GetWardRoomBedMasterById({ Id: req.Data.BedId });
                let bedRequest: any = {
                    Data: {
                        Id: req.Data.BedId,
                        BedStatusId: 2
                    }
                };
                await bedBO.UpdateBedMaster(bedRequest);

                let bedOccupancyInfo: any = {
                    Data: {
                        EncounterId: req.Data.Id,
                        PatientId: req.Data.PatientId,
                        LocationId: req.Data.LocationId,
                        WardId: req.Data.WardId,
                        DoctorId: req.Data.DoctorId,
                        DepartmentId: req.Data.DepartmentId,
                        FacilityId: req.Data.FacilityId,
                        RoomId: req.Data.RoomId,
                        BedId: req.Data.BedId,
                        AdmissionDate: req.Data.AdmissionDate,
                        //DischargeDate: req.Data.ExpectedDischargeDate,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        AdmitStatusId: req.Data.AdmissionStatusId,
                        PatientBillId: PatientBillId,
                        OccupancyStatusId: 1,
                        IsPrimaryBed: 1,
                        BillingStartDate: new Date(),
                        // BillingEndDate: new Date()
                    }
                };
                await bedOccupancyHistory.ManageBedOccupancyHistory(bedOccupancyInfo);
            }
        }

        //Update the Encounter Doctor
        let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encounterDocBO.ManageAdmissionDoctor(req);

        //Update Encounter Guarantor
        let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
        req.Data.PatientGuarantorId = PatientGuarantorId;
        req.Data.GuarantorId = req.Data.GuarantorId;
        req.Data.EncounterId = req.Data.Id; // Add Property to assign the encounter id in guarantor
        await encounterGuarantorBo.ManageEncounterGuarantor(req);
        if (isSave && req.Data.AdmissionStatusId === 2) {
            let AdmissionLog: any = {
                Data: {
                    EncounterId: req.Data.Id,
                    AdmissionStatusId: req.Data.AdmissionStatusId,
                    AdmittingReasonId: req.Data.AdmittingReasonId,
                    DoctorId: req.Data.DoctorId
                }
            };
            await admissionlogbo.AddPatientAdmissionLog(AdmissionLog);
        }

        let PatientId: number;
        let encounterId: number;
        let PatientMRN: string;
        let DoctorId: number;
        let DoctorName: string;
        let RequestTypeId_ = 0;
        let MRDTypeId_ = 2; //IP
        let MrdRequestTypeId_ = 1; //visit
        let FrmDeptId = 0;
        let ToDeptId = 0;
        let CurrentLocId = 0;
        let NewPatient = 0;
        let IsMRDRequired = 0;
        let IsMRDFileCreation = 0;
        let MRDMovementStatusId = 0;
        let IsManual = false;
        let PriorityId = 3;  //medium

        PatientId = req.Data.PatientId;
        encounterId = req.Data.Id;
        DoctorId = req.Data.DoctorId;
        FrmDeptId = this.Session.DepartmentId;

        if (req.Data.IsMRDFileCreation === true) {
            let apiDeptReq = {
                Id: 0,
                PageContext: { PageSize: 1, PageNumber: 1 },
                Params: [{ Key: DepartmentFilters.IsMRDLocation, Value: true }]
            };
            let deptBo = BoFactory.GetBo(appMgBo.DepartmentBo, this.Request);
            let deptdata = await deptBo.GetDepartments(apiDeptReq);
            if (deptdata && deptdata.Data && deptdata.Data.length > 0) {
                ToDeptId = deptdata.Data[0].Id;
                CurrentLocId = deptdata.Data[0].Id;
            }
            MRDMovementStatusId = 1; //Requested
        }
        if (ToDeptId > 0 && req.Data.IsMRDFileCreation === true) {
            let MRDFileStatusId = 1; // Created
            let MRDLocBo = BoFactory.GetBo(inpatientBO.MRDLocationBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: MRDLocationFilters.PatientId, Value: req.Data.PatientId },
                ]
            };
            let data = await MRDLocBo.GetMRDLocations(apiReq);
            if (data.Data.length === 0) {
                await MRDLocBo.ManageMRDLocation(PatientMRN, RequestTypeId_, MRDTypeId_,
                    PatientId, encounterId, DoctorId, DoctorName,
                    0, null, null, FrmDeptId, ToDeptId, CurrentLocId, NewPatient,
                    MRDFileStatusId, MRDMovementStatusId, IsMRDRequired, IsMRDFileCreation, IsManual, PriorityId, MrdRequestTypeId_);
            }
        }

        if (isSave && req.Data.AdmissionStatusId === 2) {
            if (req.Data.DoctorId) {
                if (!req.Data.IsDayCare) {
                    await this.SMSAdmissionStatus(req.Data.Id);
                    await this.SmsReferralDoctor(req);
                }
            }
        }
        if (req.Data.IsMLC === true) {
            await this.SmsIsMLCDoctor(req);
        }
        return req.Data.Id;
    }
    public async SmsIsMLCDoctor(req: any): Promise<any> {
        let AdmissionDate = '';
        let AdmissionTime = '';
        const dateformat = 'DD/MM/YYYY';
        const timeformat = 'HH:mm:ss';

        AdmissionDate = moment(req.Data.AdmissionDate).format(dateformat);
        AdmissionTime = moment(req.Data.AdmissionDate).format(timeformat);

        if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
            try {
                const defaultDoctorMobileNumbers = ['7349603160', '7975222821', '7760303199', '9964800076', '9060488309'];
                for (const mobile of defaultDoctorMobileNumbers) {
                    const whatsApp = new WhatsappNotificationService();

                    const whatsAppData = {
                        TemplateName: 'newmlcj',
                        mobile: mobile,
                        BodyParameter: [
                            AdmissionDate + ' ' + AdmissionTime,
                            req.Data.Patient.FirstName || '',
                            req.Data.PatientMrn || '',
                            req.Data.Patient.Age || '',
                            req.Data.WardName || ''
                        ]
                    };

                    const msgRes = await whatsApp.sendMessage(whatsAppData);
                    console.log('WhatsApp MLC Doctor message status:', msgRes);
                }
            } catch (error) {
                console.error('Error sending WhatsApp to MLC doctors:', error);
            }
        }

        return true;
    }

    public async SmsReferralDoctor(req: any): Promise<any> {
        if (req.Data.ReferralTypeId !== 9) {
            if (req.Data.ReferrerNumber) {
                let AdmissionDate = '';
                let AdmissionTime = '';
                let dateformat = 'DD/MM/YYYY';
                let timeformat = 'HH:mm:ss';
                AdmissionDate = moment(req.Data.AdmissionDate).format(dateformat);
                AdmissionTime = moment(req.Data.AdmissionDate).format(timeformat);
                let smsProvider = this.GetSmsProvider();
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let referralBO = BoFactory.GetBo(generalMasterBo.ReferralBo, this.Request);
                let referralData = await referralBO.GetReferralById({ Id: req.Data.ReferralId });
                let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientReferralDoctor', 'PatientReferralDoctor', 1);
                let vPatientName = '';
                if (req.Data.FirstName) vPatientName += req.Data.FirstName;
                if (req.Data.LastName) vPatientName += ' ' + req.Data.LastName;

                let TitleData: any = {};
                let GenderData: any = {};
                let refTitleBo = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
                if (req.Data.TitleId) {
                    let apiReqTitle = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                            { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
                        ]
                    };

                    TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
                }
                if (req.Data.GenderId) {
                    let apiReqGender = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Gender' },
                            { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.GenderId }
                        ]
                    };
                    GenderData = await refTitleBo.GetReferenceValues(apiReqGender);
                }
                let vRefDoctorName = '';
                vRefDoctorName = await this.getReferralData(referralData);
                let vTitleName = '';
                let vGender = '';
                if (TitleData) {
                    if (TitleData.Data) {
                        if (TitleData.Data[0].Description)
                            vTitleName = TitleData.Data[0].Description;
                    }
                }
                if (GenderData) {
                    if (GenderData.Data) {
                        if (GenderData.Data[0].Description)
                            vGender = GenderData.Data[0].Description;
                    }
                }
                if (vTitleName)
                    vPatientName = vTitleName + '.' + vPatientName;
                if (smsTemplateInfo) {
                    let smsmodel = {
                        numbers: [req.Data.ReferrerNumber],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                refDoctorName: vRefDoctorName,
                                patientName: vPatientName,
                                mrn: req.Data.MRN,
                                age: req.Data.Age,
                                gender: vGender,
                                facilityName: this.Session.FacilityName
                            })
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appMgBo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.ReferrerNumber);
                    }
                }
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                    try {
                        let whatsApp = new WhatsappNotificationService();

                        let whatsAppData = {
                            TemplateName: 'newmlcj',
                            mobile: req.Data.ReferrerNumber,
                            BodyParameter: [
                                AdmissionDate + ' ' + AdmissionTime, req.Data.Patient.FirstName, req.Data.PatientMrn,
                                req.Data.Patient.Age, req.Data.WardName,
                            ]
                        };
                        let msgRes = await whatsApp.sendMessage(whatsAppData);
                        console.log(msgRes, 'WhatsApp referral doctor message status');
                    } catch (error) {
                        console.error('Error sending WhatsApp message to referral doctor:', error);
                    }
                }

            }
        }
        return true;
    }

    public async getReferralData(referralData: ReferralAttributes): Promise<string> {
        let vRefDoctorName = '';
        if (referralData) {
            if (referralData.ReferralName) vRefDoctorName += ' ' + referralData.ReferralName;
        }
        return vRefDoctorName;
    }

    public async GetTitle(TitleId: number): Promise<string> {
        let refTitleBo = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
        let vTitleName = '';
        let apiReqTitle = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: TitleId }
            ]
        };
        let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
        if (TitleData.Data) {
            if (TitleData.Data.length > 0) {
                if (TitleData.Data[0].Description)
                    vTitleName = TitleData.Data[0].Description;
            }
        }
        return vTitleName;
    }
    public async IsAlreadyExist(req: any): Promise<number> {
        let encounterDate = new Date();
        // let FromDate = encounterDate.setMinutes(encounterDate.getMinutes() - 2);
        // let ToDate = encounterDate.setMinutes(encounterDate.getMinutes() + 2);
        let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 30);
        let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: req.Data.PatientId },
            { Key: EncounterFilters.EncounterTypeId, Value: req.Data.EncounterTypeId },
            // { Key: EncounterFilters.From, Value: frmDate },
            // { Key: EncounterFilters.To, Value: todate },
            { Key: EncounterFilters.CreatedFrom, Value: frmDate },
            { Key: EncounterFilters.CreatedTo, Value: todate },
            { Key: EncounterFilters.DoctorId, Value: req.Data.DoctorId },
            { Key: EncounterFilters.AdmissionStatusId, Value: req.Data.AdmissionStatusId }
            ]
        };
        let data = await this.GetMinEncounters(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public async GetAdmissionTeamUsers(EncId: number, TeamId: number): Promise<boolean> {
        let userbo = BoFactory.GetBo(appMgBo.UserBo, this.Request);
        let appmgbo = BoFactory.GetBo(appMgBo.UserTeamBo, this.Request);
        let TeamIdApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000000, PageNumber: 1 },
            Params: [{ Key: 4, Value: TeamId }]
        };
        let TeamUserIdsInfo = await appmgbo.GetUserTeams(TeamIdApiReq);
        if (TeamUserIdsInfo) {
            await Promise.all(TeamUserIdsInfo.map((TeamUserIds): Promise<void> => {
                return (async (Teamuserinfo): Promise<void> => {
                    if (Teamuserinfo && Teamuserinfo.UserId) {
                        let UserIdApiReq = {
                            Id: 0,
                            PageContext: { PageSize: 10000000, PageNumber: 1 },
                            Params: [{ Key: 0, Value: Teamuserinfo.UserId }]
                        };
                        let userdetailinfo = await userbo.GetUsers(UserIdApiReq);
                        if (userdetailinfo && userdetailinfo.Data && userdetailinfo.Data.length > 0) {
                            for (var idx in userdetailinfo.Data) {
                                let userdetail = userdetailinfo.Data[idx];
                                if (userdetail && userdetail.Mobile) {

                                    let UserName = '';
                                    let Title = await this.GetTitle(userdetail.TitleId);
                                    if (Title) UserName += Title;
                                    if (userdetail.FirstName) UserName += ' ' + userdetail.FirstName;
                                    if (userdetail.LastName) UserName += ' ' + userdetail.LastName;
                                    let MobileNr = userdetail.Mobile;
                                    await this.SendAdmissionTeamSMS(EncId, MobileNr, UserName);
                                }
                            }
                        }
                    }
                })(TeamUserIds);
            }));
        }

        return true;
    }

    public async SendAdmissionTeamSMS(EncId: number, MobileNr: string, UserName: string): Promise<boolean> {
        let encdata = await this.GetEncounterById({ Id: EncId });
        if (encdata) {
            let PatientName = ''; let MRN = ''; let Age = 0; let Gender = '';
            let DisplayWard = ''; let DisplayRoom = ''; let DisplayBed = '';
            let AdmissionDate = ''; let AdmissionTime = '';
            let dateformat = 'DD/MM/YYYY';
            let timeformat = 'HH:mm:ss';
            AdmissionDate = moment(encdata.AdmissionDate).format(dateformat);
            AdmissionTime = moment(encdata.AdmissionDate).format(timeformat);
            MRN = encdata.PatientMrn;
            if (MobileNr) {
                let regbo = BoFactory.GetBo(regBo.PatientBo, this.Request);
                let patientData = await regbo.GetPatientById({ Id: encdata.PatientId });
                Age = patientData.Age;
                let appBO = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
                PatientName = await appBO.getPatientName(patientData);
                Gender = await appBO.getPatientGender(patientData);
                let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
                let UserData = await userBO.GetUserById({ Id: encdata.DoctorId });
                let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
                let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
                DisplayWard = warddata.Description;
                let wardRoomMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
                let roomData = await wardRoomMasterBO.GetWardRoomMasterById({ Id: encdata.RoomId });
                DisplayRoom = roomData.Description;
                let wardRoomBedMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
                let bedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: encdata.BedId });
                DisplayBed = bedData.Description;

                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('Admission', 'PatientAdmission', 1);
                if (smsTemplateInfo) {
                    let vDocName = '';
                    vDocName = await this.getUserName(UserData);
                    let smsmodel = {
                        numbers: [MobileNr],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                userName: UserName,
                                doctorName: vDocName,
                                patientName: PatientName,
                                mrn: MRN,
                                age: Age, gender: Gender,
                                displayward: DisplayWard,
                                displayroom: DisplayRoom,
                                displaybed: DisplayBed,
                                displaydate: AdmissionDate,
                                displaytime: AdmissionTime
                            })
                    };
                    let smsProvider = this.GetSmsProvider();
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + MobileNr);
                    }
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
    public async getUserNamewoTitle(UserData: UserAttributes): Promise<string> {
        let vDocName = '';
        if (UserData) {
            if (UserData.FirstName) vDocName += UserData.FirstName;
            if (UserData.LastName) vDocName += ' ' + UserData.LastName;
            // let apiReqTitle = {
            //     Id: 0,
            //     PageContext: { PageSize: 50, PageNumber: 1 },
            //     Params: [
            //         { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
            //         { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
            //     ]
            // };
            // let vTitleName = '';
            // let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            // let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            // if (TitleData.Data) {
            //     if (TitleData.Data.length > 0) {
            //         if (TitleData.Data[0].Description)
            //             vTitleName = TitleData.Data[0].Description;
            //     }
            // }
            // if (vTitleName)
            //     vDocName = vTitleName + '.' + vDocName;
        }
        return vDocName;
    }
    public async SMSAdmissionStatus(EncId: number): Promise<boolean> {
        let encdata = await this.GetEncounterById({ Id: EncId });
        if (encdata) {
            let DrName = ''; let PatientName = ''; let MRN = ''; let Age = 0; let Gender = '';
            let DisplayWard = ''; let DisplayRoom = ''; let DisplayBed = '';
            let AdmissionDate = ''; let AdmissionTime = ''; let ServiceRt = '';
            let dateformat = 'DD/MM/YYYY';
            let timeformat = 'HH:mm:ss';
            DrName = encdata.DoctorName;
            AdmissionDate = moment(encdata.AdmissionDate).format(dateformat);
            AdmissionTime = moment(encdata.AdmissionDate).format(timeformat);
            MRN = encdata.PatientMrn;
            let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
            let UserData = await userBO.GetUserById({ Id: encdata.DoctorId });
            let regbo = BoFactory.GetBo(regBo.PatientBo, this.Request);
            let patientData = await regbo.GetPatientById({ Id: encdata.PatientId });
            Age = patientData.Age;
            let appBO = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
            PatientName = await appBO.getPatientName(patientData);
            Gender = await appBO.getPatientGender(patientData);
            let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
            let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
            DisplayWard = warddata.WardName;
            let serviceRateBo = BoFactory.GetBo(clinicalMasterBo.ServiceRateCategoryBo, this.Request);
            let servicerate = await serviceRateBo.GetServiceRateCategoryById({ Id: encdata.ServiceRateCategoryId });
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
            let wardRoomMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
            let roomData = await wardRoomMasterBO.GetWardRoomMasterById({ Id: encdata.RoomId });
            DisplayRoom = roomData.Description;
            let wardRoomBedMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
            let bedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: encdata.BedId });
            DisplayBed = bedData.Description;
            if (patientData.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('PatientAdmission', 'PatientAdmission', 1);
                let vDocName = '';
                vDocName = await this.getUserName(UserData);
                let smsmodel: any = {};
                if (smsTemplateInfo) {
                    if (SmsConfig['PROVIDER'] === 'CAUVERY') {
                        smsmodel = {
                            numbers: [patientData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    facilityName: this.Session.FacilityName,
                                    doctorName: vDocName,
                                    mrn: patientData.MRN,
                                    agegender: Age + ' Yrs-' + Gender,
                                    // age: patientData.Age,
                                    // gender: Gender,
                                    displayroom: DisplayRoom,
                                    displaybed: DisplayBed + ' ' + DisplayWard,
                                    serviceratecategory: ServiceRt,
                                    promotionsch: gaurantorname,
                                    datetime: AdmissionDate + ' ' + AdmissionTime,
                                    // displaydate: AdmissionDate,
                                    // displaytime: AdmissionTime,
                                    contactNo: this.Session.FacilityContact
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                        if (smsTemplateInfo.SentToGroup) {
                            let paramArr: Array<any> = [];
                            if (smsTemplateInfo.SentToGroup.toString().indexOf(',') > -1) {
                                paramArr = smsTemplateInfo.SentToGroup.toString().split(',');
                            }
                            smsmodel.numbers = paramArr;
                        }
                    } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI' && patientData.IsVip === true) {
                        smsmodel = {
                            numbers: [patientData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    mrn: patientData.MRN,
                                    doctorName: vDocName,
                                    ward: DisplayWard,
                                    bedNo: DisplayBed,
                                    displaydate: AdmissionDate,
                                    displaytime: AdmissionTime,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } else {
                        smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    userName: vDocName,
                                    doctorName: DrName,
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
                    }
                    let smsProvider = this.GetSmsProvider();
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                    }
                }
                console.log('***********Config*******88');
                console.log(WhatsAppConfig['PROVIDER']);
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                    let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
                    let facilityData = await faciliBO.GetFacilityById({ Id: this.Session.FacilityId });
                    let landline = facilityData.Mobile;
                    let numbersToSend = [];
                    if (patientData.Mobile) {
                        numbersToSend.push(patientData.Mobile);
                    }
                    let landlineNumbers = landline.split(',').map(number => number.trim());
                    numbersToSend = numbersToSend.concat(landlineNumbers);
                    let promises: any = [];
                    numbersToSend.forEach(async (number) => {
                        let data = {
                            TemplateName: 'patientadmission',
                            ToNumbersWithCountryCode: number,
                            msg: 'Dear ' + PatientName + ', you have been admitted under the care of Dr. ' + vDocName +
                                ' in Bed No. ' + DisplayBed + ' in ' + DisplayWard + ' - ' + this.Session.FacilityName + '.',
                            BodyParameter: [PatientName, vDocName, DisplayBed, DisplayWard, this.Session.FacilityName]
                        };
                        const whatsApp = new WhatsappNotificationService();
                        let msgRes = await whatsApp.sendMessage(data);
                        promises.push(msgRes);
                    });
                    Promise.all(promises)
                        .then((results) => {
                            console.log(results, 'here are the patient admissionmessages');
                        })
                        .catch((error) => {
                            console.log('Error sendingmessages:', error);
                        });

                } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'patientadmissionchampion',
                        Mobile: patientData.Mobile,
                        patientName: PatientName,
                        doctorName: vDocName,
                        displaybed: DisplayBed,
                        displayward: DisplayWard
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the patientadmissionchampion');

                }
            }
            //Send to Dr
            if (UserData.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('DrPatientAdmission', 'DrPatientAdmission', 1);
                let vDocName = '';
                vDocName = await this.getUserName(UserData);
                if (smsTemplateInfo) {
                    let smsmodel: any = {};
                    if (SmsConfig['PROVIDER'] === 'CAUVERY') {
                        vDocName = await this.getUserNamewoTitle(UserData);
                        smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    facilityName: this.Session.FacilityName,
                                    doctorName: vDocName,
                                    mrn: patientData.MRN,
                                    agegender: Age + ' Yrs-' + Gender,
                                    // age: patientData.Age,
                                    // gender: Gender,
                                    displayroom: DisplayRoom,
                                    displaybed: DisplayBed + ' ' + DisplayWard,
                                    serviceratecategory: ServiceRt,
                                    promotionsch: gaurantorname,
                                    datetime: AdmissionDate + ' ' + AdmissionTime,
                                    // displaydate: AdmissionDate,
                                    // displaytime: AdmissionTime,
                                    contactNo: this.Session.FacilityContact
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } else if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                        vDocName = await this.getUserNamewoTitle(UserData);
                        smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    doctorName: vDocName,
                                    displaybed: DisplayBed + ' ' + DisplayWard,
                                    contactNo: this.Session.FacilityContact
                                })
                        };
                    } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI' && patientData.IsVip === true) {
                        smsmodel = {
                            numbers: [UserData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    mrn: patientData.MRN,
                                    doctorName: vDocName,
                                    ward: DisplayWard,
                                    bedNo: DisplayBed,
                                    displaydate: AdmissionDate,
                                    displaytime: AdmissionTime,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                    } else {
                        smsmodel = {
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
                    }
                    let smsProvider = this.GetSmsProvider();
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                    }
                }
                console.log('***********Config*******88');
                console.log(WhatsAppConfig['PROVIDER']);
                let agegender = Age + ' Yrs-' + Gender;
                let datetime = AdmissionDate + ' ' + AdmissionTime;
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                    let data = {
                        TemplateName: 'drptadmission',
                        ToNumbersWithCountryCode: UserData.Mobile,
                        msg: 'Patient' + PatientName + ',' + agegender + 'PRN:' + MRN + 'is admitted on' + datetime + 'under' +
                            vDocName + 'Pay Category:' + ServiceRt + 'Sch Name:' + gaurantorname +
                            '. Thanks Hospital Management - Cauvery Hospital',
                        BodyParameter: [PatientName, agegender, MRN, datetime, vDocName, ServiceRt, gaurantorname]
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the patientadmission');

                } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let data = {
                        template: 'drpatientadmissionchampion',
                        Mobile: UserData.Mobile,
                        doctorName: vDocName,
                        patientName: PatientName,
                        displaybed: DisplayBed,
                        displayward: DisplayWard
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the drpatientadmissionchampion');

                } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                    try {
                        let data = {
                            TemplateName: 'admedtodr',
                            mobile: UserData.Mobile,
                            BodyParameter: [vDocName, PatientName, MRN, DisplayBed + ' ' + DisplayWard, datetime]
                        };
                        const whatsApp = new WhatsappNotificationService();
                        let msgRes = await whatsApp.sendMessage(data);
                        console.log(msgRes, 'here is the drpatientadmissionjss');
                    } catch (error) {
                        console.log('Error Processing messages:', error);
                    }
                }
            }

            if (UserData.Email) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let mailTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('PatientAdmission', 'PatientAdmission', 2);
                // let vDocName = '';
                // vDocName = await this.getUserName(UserData);
                const mailData = {
                    doctorName: DrName,
                    patientName: PatientName,
                    mrn: MRN,
                    facilityName: this.Session.FacilityName,
                    // age: Age, gender: Gender,
                    //displayward: DisplayWard,
                    // displayroom: DisplayRoom,
                    displaybed: DisplayBed + ' ' + DisplayWard,
                    // displaydate: AdmissionDate,
                    // displaytime: AdmissionTime,
                    contactNo: this.Session.FacilityContact
                };
                if (mailTemplateInfo) {
                    const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                    const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                    let mailProvider = this.GetMailProvider();
                    await mailProvider.send({
                        from: 'From DrHMS <report@drhms.com>',
                        to: UserData.Email,
                        subject: mailSubject,
                        html: mailBody,
                    });
                }

            }


            // let vDocName = '';
            // vDocName = await this.getUserName(UserData);
            if (patientData && (patientData.NotificationToken)) {
                /* tslint:disable-next-line */
                // const pushMessage: string = 'Dear ' + PatientName + ', ' + ' Your  surgery is scheduled on ' + moment(req.Data.OTScheduledOn).format('YYYY-MM-DD') + '.';
                const pushMessage: string = 'Dear ' + ', the patient ' + PatientName + '-'
                    + MRN + ', ' + Age + ', '
                    + Gender + ', you been admitted under in the '
                    + DisplayWard + 'ward ' + DisplayBed + ' on '
                    + AdmissionDate + 'at ' + AdmissionTime + '.';
                const notificationService: any = new NotificationService();
                const body = {
                    type: 'appoinment_booking',
                };
                const pushTokens: string[] = [];
                if (patientData.NotificationToken) {
                    pushTokens.push(patientData.NotificationToken);
                }
                await notificationService.sendNotification(pushMessage, pushTokens, body);
                console.log('*************************pushMessage**********************', pushMessage);
                console.log('*************************pushTokens**********************', pushTokens);
            }

            if (UserData && (UserData.NotificationToken)) {
                /* tslint:disable-next-line */
                const pushMessage: string = 'Dear ' + DrName + ', the patient ' + PatientName + '-' + MRN + ', ' + Age + ', ' + Gender + ', has been admitted under your care in the ' + DisplayWard + 'ward ' + DisplayBed + ' on ' + AdmissionDate + 'at ' + AdmissionTime + '.';
                const notificationService: any = new NotificationService();
                const body = {
                    type: 'appoinment_booking',
                };
                const pushTokens: string[] = [];
                if (UserData.NotificationToken) {
                    pushTokens.push(UserData.NotificationToken);
                }
                // if (UserData.WebNotificationToken) {
                //     pushTokens.push(UserData.WebNotificationToken);
                // }

                await notificationService.sendNotification(pushMessage, pushTokens, body);
            }
        }
        return true;
    }

    public async SMSWithVisitIdentifier(req: any): Promise<boolean> {
        let encdata = await this.GetEncounterById({ Id: req.Id });
        let regbo = BoFactory.GetBo(regBo.PatientBo, this.Request);
        let patientData = await regbo.GetPatientById({ Id: encdata.PatientId });
        if (encdata && patientData && patientData.IsVip === false) {
            let PatientName = ''; let MRN = '';
            let DisplayWard = ''; let DisplayBed = '';
            let AdmissionDate = ''; let AdmissionTime = '';
            let dateformat = 'DD/MM/YYYY';
            let timeformat = 'HH:mm:ss';
            AdmissionDate = moment(encdata.AdmissionDate).format(dateformat);
            AdmissionTime = moment(encdata.AdmissionDate).format(timeformat);
            MRN = encdata.PatientMrn;
            let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
            let UserData = await userBO.GetUserById({ Id: encdata.DoctorId });
            let appBO = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
            PatientName = await appBO.getPatientName(patientData);
            let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
            let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
            DisplayWard = warddata.WardName;
            let locationMasterBo = BoFactory.GetBo(generalMasterBo.LocationMasterBo, this.Request);
            let locadata = await locationMasterBo.GetLocationMasterById({ Id: encdata.LocationId });
            let location = locadata.LocationName;
            let wardRoomBedMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
            let bedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: encdata.BedId });
            DisplayBed = bedData.Description;
            let secondaryDoctorData: any = null;
            if (encdata.SecondaryDoctorId) {
                secondaryDoctorData = await userBO.GetUserById({ Id: encdata.SecondaryDoctorId });
            }
            if (patientData.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('NormalPatientAdmission', 'NormalPatientAdmission', 1);
                let smsmodel: any = {};
                if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                    try {
                        smsmodel = {
                            numbers: [patientData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: PatientName,
                                    visitIdentifier: encdata.VisitIdentifier,
                                    mrn: MRN,
                                    doctorName: UserData.FirstName,
                                    ward: DisplayWard,
                                    bedNo: DisplayBed,
                                    datetime: AdmissionDate + ' ' + AdmissionTime,
                                    location: location,
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                        if (encdata.ReferralId) {
                            try {
                                let referralBo = BoFactory.GetBo(generalMasterBo.ReferralBo, this.Request);
                                let referralData = await referralBo.GetReferralById({ Id: encdata.ReferralId });
                                let apiReqref = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [
                                        { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'ReferralType' },
                                        { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: encdata.ReferralTypeId }
                                    ]
                                };
                                let refTitleBo = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
                                let refData = await refTitleBo.GetReferenceValues(apiReqref);
                                let refType = refData.Data[0].Description;
                                let smsTemplateInfo1 =
                                    await eventTemplateBO.GetTemplateInfo('PatientReferralDoctor', 'PatientReferralDoctor', 1);
                                let smsmodel1: any = {
                                    numbers: [referralData.PhoneNo],
                                    message: Template.Compile(smsTemplateInfo1.TemplateContent,
                                        {
                                            patientName: PatientName,
                                            mrn: MRN,
                                            referredby: referralData.ReferralName,
                                            sourcetype: refType,
                                            priority: 'Yes'
                                        }),
                                    templateId: smsTemplateInfo1.ModuleId
                                };
                                let smsProvider1 = this.GetSmsProvider();
                                if (smsProvider1) {
                                    let SMSStatus1 = await smsProvider1.send(smsmodel1);
                                    let eventDashboardOutboundBo1 = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                                    await eventDashboardOutboundBo1.ManageSMSOutBound(SMSStatus1, smsmodel1.message +
                                        ' To : ' + referralData.PhoneNo);
                                }
                            } catch (error) {
                                console.log('Error Processing Ref SMS:', error);
                            }
                        }
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
            //Send to Dr
            if (UserData.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('DrNormalPatientAdmission', 'DrNormalPatientAdmission', 1);
                let vDocName = '';
                vDocName = await this.getUserName(UserData);
                let secondDoctorName = '';
                if (secondaryDoctorData) {
                    secondDoctorName = await this.getUserName(secondaryDoctorData);
                }
                if (smsTemplateInfo) {
                    let smsmodel: any = {};
                    if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                        try {
                            smsmodel = {
                                numbers: [UserData.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        patientName: PatientName,
                                        visitIdentifier: encdata.VisitIdentifier,
                                        mrn: MRN,
                                        primaryDoctor: vDocName,
                                        Space: ',',
                                        secondaryDoctor: secondDoctorName || 'No Secondary Doctor',
                                        ward: DisplayWard,
                                        bedNo: DisplayBed,
                                        datetime: AdmissionDate + ' ' + AdmissionTime,
                                        location: location,
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
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + UserData.Mobile);
                    }
                }
            }
        }
        return true;
    }

    public async ManageEncounterFacilityBillInfo(req: BaseRequest): Promise<boolean> {
        let facilityServiceBo = BoFactory.GetBo(appMgBo.FacilityDefaultServiceBo, this.Request);
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        let patientguarantorbo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
        let GuarantorBo = BoFactory.GetBo(generalMasterBo.GuarantorSupplementaryBo, this.Request);
        //  let BedBo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let BillDetails: any = [];
        let BillingAmount: number = 0;
        let InsuranceNet: number = 0;
        let PatientNet: number = 0;
        let PatAmt = 0;
        let InsAmt = 0;
        let IsInsurance: Boolean = false;
        let GuarantorId = 1000;
        let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        GuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();
        if (req.Data.GuarantorId > 0) {
            let PatientGuarantor = await patientguarantorbo.GetPatientGuarantorById({ Id: req.Data.PatientGuarantorId });
            if (PatientGuarantor.GuarantorId !== GuarantorId) {
                IsInsurance = true;
                GuarantorId = PatientGuarantor.GuarantorId;
            }
        }
        let facilityServiceApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: 2, Value: req.Data.FacilityId }, { Key: 7, Value: [req.Data.GuarantorId, -1] },
            { Key: 5, Value: req.Data.GuarantorTypeId },
            { Key: 3, Value: 2 }]
        };
        let AliasId: any = null;
        let AliasName: any = null;
        // let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: req.Data.BedId });
        let facilityServiceDetails = await facilityServiceBo.GetFacilityDefaultServices(facilityServiceApiReq);
        await Promise.all(facilityServiceDetails.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: 2, Value: ServiceInfo.Id }, { Key: 3, Value: req.Data.ServiceRateCategoryId },
                    { Key: 5, Value: req.Data.FacilityId }]
                };
                let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                let IsSupplementary: Boolean = false;
                if (IsInsurance) {
                    let SupplementaryId = await GuarantorBo.CheckSupplementaryServiceItem({
                        where: {
                            ServiceItemId: ServiceItem.ServiceItemId,
                            GuarantorId: GuarantorId
                        },
                        attributes: ['Id']
                    });
                    if (SupplementaryId > 0)
                        IsSupplementary = true;
                }

                if (req.Data.GuarantorTypeId > 1) {
                    AliasId = null;
                    AliasName = null;
                    let apiServAliasReq = {
                        Id: 0,
                        Params: [
                            { Key: ServiceItemAliasFilters.ServiceItemId, Value: ServiceItem.ServiceItemId },
                            { Key: ServiceItemAliasFilters.ExternalProviderId, Value: GuarantorId }
                        ],
                        PageContext: { PageSize: -1, PageNumber: 1 }
                    };
                    let servItmAliasBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemAliasBo, this.Request);
                    let seritmaliasdata = await servItmAliasBo.GetServiceItemAliass(apiServAliasReq);
                    if (seritmaliasdata.Data && seritmaliasdata.Data.length > 0) {
                        AliasId = seritmaliasdata.Data[0].AliasId;
                        AliasName = seritmaliasdata.Data[0].AliasName;
                    }
                }

                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        if (req.Data.GuarantorTypeId > 1) {
                            if (req.Data.CoPayPercent) {
                                PatAmt = parseFloat(traif.Rate.toString()) * (parseInt(req.Data.CoPayPercent) / 100);
                                InsAmt = (parseFloat(traif.Rate.toString())) - (PatAmt || 0);
                            }
                            if (!req.Data.CoPayPercent) {
                                InsAmt = parseFloat(traif.Rate.toString());
                            }
                        }
                        BillDetails.push({
                            BillDateTime: new Date(),
                            ServiceId: traif.ServiceItemId,
                            ServiceName: ServiceInfo.Name,
                            StartDate: new Date(),
                            Quantity: 1,// No of Days is Quantity for Default Services
                            Rate: parseFloat(traif.Rate.toString()),
                            Amount: 1 * parseFloat(traif.Rate.toString()),
                            GrossAmount: 1 * parseFloat(traif.Rate.toString()),
                            NetAmount: 1 * parseFloat(traif.Rate.toString()),
                            InsNetAmount: InsAmt,
                            PatNetAmount: PatAmt,
                            DoctorId: req.Data.DoctorId,
                            DoctorShare: traif.DoctorShare,
                            IsPackageItem: false,
                            ServiceRateCategoryId: traif.ServiceRateCategoryId,
                            DepartmentId: req.Data.DepartmentId,
                            ServiceCategoryId: ServiceInfo.CategoryId,
                            ServiceSubCategoryId: ServiceInfo.SubCategoryId,
                            ServiceGroupId: ServiceInfo.BillingGroupId,
                            EncounterId: req.Data.EncounterId,
                            PatientBillStatusId: 3,
                            IsSupplementary: IsSupplementary,
                            AliasId: AliasId,
                            AliasName: AliasName,
                        });
                        BillingAmount = parseFloat(BillingAmount.toString()) + parseFloat(traif.Rate.toString());
                        InsuranceNet = parseFloat(InsuranceNet.toString()) + ((parseFloat(traif.Rate.toString())) - (PatAmt || 0));
                        PatientNet = parseFloat(PatientNet.toString()) + parseFloat(PatAmt.toString());
                    })(ServiceTraifItem);
                }));
            })(service);
        }));

        if (BillDetails.length > 0) {
            let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            let PatientBill: any = {
                Data: {
                    Header: {
                        BillTypeId: 3,
                        BillDateTime: new Date(),
                        BillAmount: BillingAmount,
                        NetInsuranceAmount: InsuranceNet || 0,
                        NetPatientAmount: PatientNet || 0,
                        PatientId: req.Data.PatientId,
                        EncounterId: req.Data.EncounterId,
                        EncounterTypeId: 2, //In Patient Encounter
                        GuarantorId: req.Data.GuarantorId,
                        GuarantorTypeId: req.Data.GuarantorTypeId,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        DoctorId: req.Data.DoctorId,
                        PatientBillStatusId: 3,
                        FacilityId: req.Data.FacilityId,
                        DepartmentId: req.Data.DepartmentId,
                        OrganizationId: req.Data.OrganizationId,
                        RoomId: req.Data.RoomId,
                        WardId: req.Data.WardId,
                        BedId: req.Data.BedId,
                        IsDayCare: (req.Data.IsFromDayCare === 1) ? req.Data.IsFromDayCare : 0
                    },
                    paymentDetail: [],
                    Details: BillDetails
                }
            };
            let BillSaveResult = await patientbillBO.AddIPPatientBills(PatientBill);
            return BillSaveResult > 0;
        } else {
            return false;
        }
    }


    public async ManageBedChargesBillInfo(req: BaseRequest): Promise<number> {
        let WardRoomServiceMapBo = BoFactory.GetBo(generalMasterBo.WardRoomServiceMapBo, this.Request);
        //let BedBo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let OldPatientBillId = req.Data.PatientBillId;
        let NoofDays: number = req.Data.NoofDays;
        console.log('********No of Days**********');
        console.log(req.Data.NoofDays);
        let IsPrimaryBed: boolean = req.Data.IsPrimaryBed;
        let IsDoubleOccupancy: boolean = req.Data.IsDoubleOccupancy;
        let roomApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: 1, Value: req.Data.RoomId }]//RoomId
        };
        // let bedInfo = await BedBo.GetWardRoomBedMasterById({ Id: req.Data.BedId });
        let roomServiceItemInfo = await WardRoomServiceMapBo.GetWardRoomServiceMaps(roomApiReq);
        let BillingAmount: number = 0;
        let InsuranceNet: number = 0;
        let PatientNet: number = 0;
        let PatAmt = 0;
        let InsAmt = 0;
        let BillDetails: any = [];
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        // let patientguarantorbo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
        let GuarantorBo = BoFactory.GetBo(generalMasterBo.GuarantorSupplementaryBo, this.Request);
        let IsInsurance: Boolean = false;
        let GuarantorId = 1000;
        let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        GuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();
        if (req.Data.GuarantorId > 0) {
            // let PatientGuarantor = await patientguarantorbo.GetPatientGuarantorById({ Id: req.Data.PatientGuarantorId });
            // let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
            let guarantor = await guarantorMasterBO.GetGuarantorById({ Id: req.Data.GuarantorId });
            // if (guarantor.Id !== GuarantorId) {
            if ((guarantor.Id !== GuarantorId) && (!guarantor.IsIPBedTariff)) {
                IsInsurance = true;
                GuarantorId = guarantor.Id;
            }
        }
        let facilityprebo = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let daywiseseparatebilling = 0;
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.bedchargesforindividualdays) {
            try {
                daywiseseparatebilling = parseInt(facilityPreferencesData.bedchargesforindividualdays);
            } catch (ex) { daywiseseparatebilling = 0; }
        }
        await Promise.all(roomServiceItemInfo.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let ServiceItemDetail: any = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                if (!req.Data.FacilityId) req.Data.FacilityId = this.Session.FacilityId;
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: 2, Value: ServiceItemDetail.Id }, { Key: 3, Value: req.Data.ServiceRateCategoryId },
                    { Key: 5, Value: req.Data.FacilityId }]
                };
                let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                let IsSupplementary: Boolean = false;
                if (IsInsurance) {
                    let SupplementaryId = await GuarantorBo.CheckSupplementaryServiceItem({
                        where: {
                            ServiceItemId: ServiceItem.ServiceItemId,
                            GuarantorId: GuarantorId
                        },
                        attributes: ['Id']
                    });
                    if (SupplementaryId > 0)
                        IsSupplementary = true;
                }
                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem: any): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        if (req.Data.GuarantorTypeId > 1) {
                            if (!req.Data.CoPayPercent) {
                                InsAmt = parseFloat(traif.Rate.toString());
                            }
                            if (req.Data.CoPayPercent) {
                                if (NoofDays > 0) {
                                    PatAmt = parseFloat(traif.Rate.toString()) * (parseInt(req.Data.CoPayPercent) / 100);
                                    InsAmt = (parseFloat(traif.Rate.toString())) - (PatAmt || 0);
                                } else {
                                    InsAmt = 0;
                                    PatAmt = 0;
                                }
                            }
                        }

                        if (ServiceTraifItem.ServiceItem && ServiceTraifItem.ServiceItem.GstMaster) {
                            ServiceTraifItem.GSTPercentage = ServiceTraifItem.ServiceItem.GstMaster.GstPercentage;

                            if (ServiceTraifItem.GSTPercentage) {
                                ServiceTraifItem.UnitGSTAmount = (ServiceTraifItem.GSTPercentage / 100) * traif.Rate;
                                if (ServiceTraifItem.UnitGSTAmount > 0) {
                                    ServiceTraifItem.GSTAmount = parseFloat(ServiceTraifItem.UnitGSTAmount) * NoofDays;
                                    ServiceTraifItem.GSTAmount = parseFloat(ServiceTraifItem.GSTAmount).toFixed(2);
                                }
                            }
                        }
                        if (!IsDoubleOccupancy) {
                            if (ServiceItem.ApplyMainOccupancy) {
                                BillDetails.push({
                                    BillDateTime: new Date(),
                                    ServiceId: traif.ServiceItemId,
                                    ServiceName: ServiceItemDetail.Name,
                                    StartDate: new Date(),
                                    // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                    Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                    Rate: parseFloat(traif.Rate.toString()),
                                    GSTAmount: ServiceTraifItem.GSTAmount,
                                    GSTPercentage: ServiceTraifItem.GSTPercentage,
                                    // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    Amount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    GrossAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    NetAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    InsNetAmount: InsAmt,
                                    PatNetAmount: PatAmt,
                                    DoctorId: req.Data.DoctorId,
                                    DoctorShare: traif.DoctorShare,
                                    IsPackageItem: false,
                                    ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                    DepartmentId: req.Data.DepartmentId,
                                    ServiceCategoryId: ServiceItemDetail.CategoryId,
                                    ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                    ServiceGroupId: ServiceItemDetail.BillingGroupId || 0,
                                    EncounterId: req.Data.EncounterId,
                                    PatientBillStatusId: 3,
                                    IsSupplementary: IsSupplementary
                                });
                                BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                                InsuranceNet = parseFloat(InsuranceNet.toString()) + parseFloat(InsAmt.toString());
                                PatientNet = parseFloat(PatientNet.toString()) + parseFloat(PatAmt.toString());
                            }
                        } else {
                            if (IsPrimaryBed) {
                                if (ServiceItem.ApplyMainOccupancy) {
                                    BillDetails.push({
                                        BillDateTime: new Date(),
                                        ServiceId: traif.ServiceItemId,
                                        ServiceName: ServiceItemDetail.Name,
                                        StartDate: new Date(),
                                        // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                        Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                        Rate: parseFloat(traif.Rate.toString()),
                                        // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                        // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                        // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                        Amount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        GrossAmount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        NetAmount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        InsNetAmount: InsAmt,
                                        PatNetAmount: PatAmt,
                                        DoctorId: req.Data.DoctorId,
                                        DoctorShare: traif.DoctorShare,
                                        IsPackageItem: false,
                                        ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                        DepartmentId: req.Data.DepartmentId,
                                        ServiceCategoryId: ServiceItemDetail.CategoryId,
                                        ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                        ServiceGroupId: ServiceItemDetail.BillingGroupId,
                                        EncounterId: req.Data.EncounterId,
                                        PatientBillStatusId: 3,
                                        IsSupplementary: IsSupplementary,
                                        GSTAmount: ServiceTraifItem.GSTAmount,
                                        GSTPercentage: ServiceTraifItem.GSTPercentage,
                                    });
                                    BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                                    InsuranceNet = parseFloat(InsuranceNet.toString()) + parseFloat(InsAmt.toString());
                                    PatientNet = parseFloat(PatientNet.toString()) + parseFloat(PatAmt.toString());
                                }
                            } else if (ServiceItem.ApplyDoubleOccupancy) {
                                BillDetails.push({
                                    BillDateTime: new Date(),
                                    ServiceId: traif.ServiceItemId,
                                    ServiceName: ServiceItemDetail.Name,
                                    StartDate: new Date(),
                                    // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                    // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                    Rate: parseFloat(traif.Rate.toString()),
                                    Amount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    GrossAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    NetAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    InsNetAmount: InsAmt,
                                    PatNetAmount: PatAmt,
                                    DoctorId: req.Data.DoctorId,
                                    DoctorShare: traif.DoctorShare,
                                    IsPackageItem: false,
                                    ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                    DepartmentId: req.Data.DepartmentId,
                                    ServiceCategoryId: ServiceItemDetail.CategoryId,
                                    ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                    ServiceGroupId: ServiceItemDetail.BillingGroupId,
                                    EncounterId: req.Data.EncounterId,
                                    PatientBillStatusId: 3,
                                    IsSupplementary: IsSupplementary,
                                    GSTAmount: ServiceTraifItem.GSTAmount,
                                    GSTPercentage: ServiceTraifItem.GSTPercentage,
                                });
                                BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                                InsuranceNet = parseFloat(InsuranceNet.toString()) + parseFloat(InsAmt.toString());
                                PatientNet = parseFloat(PatientNet.toString()) + parseFloat(PatAmt.toString());
                            }
                        }
                    })(ServiceTraifItem);
                }));
            })(service);
        }));
        /* Grouping Auto Charges */

        /* Grouping Auto Charges */
        // let frmDate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        // let toDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        // let PatientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        // let billdetailReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 1000, PageNumber: 1 },
        //     Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: OldPatientBillId },
        //     { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
        //     { Key: PatientBillDetailsFilters.FromDate, Value: frmDate },
        //     { Key: PatientBillDetailsFilters.ToDate, Value: toDate }
        //     ]
        // };
        // let billExists: any = await PatientBillDetailsBo.GetMinPatientBillDetails(billdetailReq);
        // let frmDate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        // let toDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let PatientBillsBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [
                // { Key: PatientBillDetailsFilters.PatientBillId, Value: OldPatientBillId },
                { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
                // { Key: PatientBillsFilters.FromDate, Value: frmDate },
                // { Key: PatientBillsFilters.ToDate, Value: toDate },
                { Key: PatientBillsFilters.TransferEncounterId, Value: req.Data.OccupancyHistoryId },
                { Key: PatientBillsFilters.WardId, Value: req.Data.WardId },
                { Key: PatientBillsFilters.RoomId, Value: req.Data.RoomId },
                { Key: PatientBillsFilters.BedId, Value: req.Data.BedId },
            ]
        };
        let billExists: any = await PatientBillsBo.GetMinPatientBills(billdetailReq);
        console.log('******Length*******');
        console.log(billExists.Data.length);
        console.log(NoofDays);
        console.log('******End*********');
        console.log(req.Data.fromBedTransfer);
        console.log(req.Data.OccupancyHistoryId);
        // if (!req.Data.fromBedTransfer && billExists && billExists.Data.length > 0 && daywiseseparatebilling === 1) {
        // if (BillDetails.length === billExists.Data.length) {
        //     return 0;
        // }
        // if (NoofDays === billExists.Data.length) {
        //     return 0;
        // }
        // } else {

        //Insert bills against encounter
        if (BillDetails.length > 0) {
            let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            let PatientBill: any = {
                Data: {
                    Header: {
                        BillTypeId: 3,
                        BillDateTime: new Date(),
                        BillAmount: BillingAmount,
                        NetInsuranceAmount: InsuranceNet || 0,
                        NetPatientAmount: PatientNet || 0,
                        PatientId: req.Data.PatientId,
                        EncounterId: req.Data.EncounterId,
                        EncounterTypeId: 2, //In Patient Encounter
                        TransferEncounterId: req.Data.OccupancyHistoryId,//To Test for Entries
                        WardId: req.Data.WardId,
                        BedId: req.Data.BedId,
                        RoomId: req.Data.RoomId,
                        GuarantorId: req.Data.GuarantorId,
                        GuarantorTypeId: req.Data.GuarantorTypeId,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        DoctorId: req.Data.DoctorId,
                        PatientBillStatusId: 3,
                        FacilityId: req.Data.FacilityId,
                        DepartmentId: req.Data.DepartmentId,
                        OrganizationId: req.Data.OrganizationId,
                        IsPatientTransfer: req.Data.IsPatientTransfer,
                        updateOccupancy: (req.Data.OccupancyHistoryId &&
                            req.Data.OccupancyHistoryId > 0) ?
                            req.Data.OccupancyHistoryId : 0,
                        allowDuplicate: 1
                    },
                    paymentDetail: [],
                    Details: BillDetails
                }
            };
            console.log('**********Old PatientBill Id*********');
            console.log(OldPatientBillId);
            console.log(req.Data.fromBedTransfer);

            if (!OldPatientBillId) {
                let BillSaveResult = await patientbillBO.AddIPPatientBills(PatientBill);
                return BillSaveResult;
            } else if (OldPatientBillId && OldPatientBillId > 0 && req.Data.fromBedTransfer === 1) {
                let BillSaveResult = await patientbillBO.AddIPPatientBills(PatientBill);
                return BillSaveResult;
            } else if (OldPatientBillId && OldPatientBillId > 0 && daywiseseparatebilling === 1) {
                if (NoofDays <= billExists.Data.length) {
                    return 0;
                } else if (NoofDays > billExists.Data.length) {
                    let CurrentDate = moment().toDate();
                    let billStartdate = moment(req.Data.BillingStartDate).toDate();
                    // var a = moment('2013-01-01');
                    // var b = moment('2013-06-01');
                    var i = 0;
                    let patientBillId = 0;
                    for (var m = moment(billStartdate); m.isSameOrBefore(CurrentDate); m.add(1, 'days')) {

                        var new_date = moment(billStartdate, 'DD-MM-YYYY').add(i, 'days');
                        i++;
                        // current hours
                        let hours = billStartdate.getHours();
                        // current minutes
                        let minutes = billStartdate.getMinutes();
                        // current seconds
                        let seconds = billStartdate.getSeconds();
                        let frmDate = moment(new_date).format('YYYY-MM-DD');
                        console.log(frmDate);
                        let billReq = {
                            Id: 0,
                            PageContext: { PageSize: 1000, PageNumber: 1 },
                            Params: [
                                // { Key: PatientBillDetailsFilters.PatientBillId, Value: OldPatientBillId },
                                { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
                                // { Key: PatientBillsFilters.FromDate, Value: frmDate },
                                { Key: PatientBillsFilters.BillDateTime, Value: [frmDate + ' 00:00:00', frmDate + ' 23:59:00'] },
                                { Key: PatientBillsFilters.TransferEncounterId, Value: req.Data.OccupancyHistoryId },
                                { Key: PatientBillsFilters.WardId, Value: req.Data.WardId },
                                { Key: PatientBillsFilters.RoomId, Value: req.Data.RoomId },
                                { Key: PatientBillsFilters.BedId, Value: req.Data.BedId },
                            ]
                        };
                        let dataExists: any = await PatientBillsBo.GetMinPatientBills(billReq);
                        if (dataExists.Data.length <= 0) {
                            let date = moment(frmDate).hours(hours).minutes(minutes).seconds(seconds).milliseconds(0);
                            PatientBill.Data.Header.BillDateTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
                            patientBillId = await patientbillBO.AddBedChargePatientBills(PatientBill);
                        }
                    }
                    return patientBillId;

                } else {
                    let BillSaveResult = await patientbillBO.AddIPPatientBills(PatientBill);
                    return BillSaveResult;
                }

            } else if (OldPatientBillId && OldPatientBillId > 0) {
                let PatientBillsapiReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillsFilters.Id, Value: OldPatientBillId }]
                };
                let patientbill: any = null;
                let OldBillInfo = await patientbillBO.GetPatientBills(PatientBillsapiReq);
                let BillAmt = 0;
                let NetInsAmt = 0;
                let NetPatAmt = 0;
                let IsAutoBillModified = false;
                let AcutalBillDetails = [];
                for (let pbidx in OldBillInfo.Data) {
                    patientbill = OldBillInfo.Data[pbidx];
                    let insAmt = 0;
                    let patAmt = 0;

                    for (let npbdidx in BillDetails) {
                        let newpatbildt = BillDetails[npbdidx];
                        let newrecord = 1;
                        for (let pbdtidx in patientbill.PatientBillDetails) {
                            let patientbilldetail = patientbill.PatientBillDetails[pbdtidx];
                            IsAutoBillModified = patientbilldetail.IsAutoBillModified;
                            if (req.Data.GuarantorTypeId > 1) {
                                if (req.Data.CoPayPercent) {
                                    patAmt = (NoofDays * patientbilldetail.Rate) * (parseInt(req.Data.CoPayPercent) / 100);
                                    insAmt = (NoofDays * patientbilldetail.Rate) - (patAmt);
                                }
                                if (!req.Data.CoPayPercent) {
                                    insAmt = (NoofDays * patientbilldetail.Rate);
                                }
                            }
                            if (newpatbildt.ServiceId === patientbilldetail.ServiceId
                                && !IsAutoBillModified) {
                                BillDetails[npbdidx].Rate = patientbilldetail.Rate;
                                BillDetails[npbdidx].Quantity = NoofDays;
                                BillDetails[npbdidx].Amount = NoofDays * patientbilldetail.Rate;
                                BillDetails[npbdidx].GrossAmount = NoofDays * patientbilldetail.Rate;
                                BillDetails[npbdidx].NetAmount = NoofDays * patientbilldetail.Rate;
                                BillDetails[npbdidx].Id = patientbilldetail.Id;
                                BillDetails[npbdidx].PatNetAmount = patAmt;
                                BillDetails[npbdidx].InsNetAmount = insAmt;
                                BillAmt += NoofDays * patientbilldetail.Rate;
                                NetPatAmt += BillDetails[npbdidx].PatNetAmount;
                                NetInsAmt += BillDetails[npbdidx].InsNetAmount;
                                AcutalBillDetails.push(BillDetails[npbdidx]);
                                newrecord = 0;
                                break;
                            } else if (newpatbildt.ServiceId === patientbilldetail.ServiceId
                                && IsAutoBillModified) {
                                newrecord = 0;
                                break;
                            }
                        }
                        if (newrecord === 1) {
                            BillDetails[npbdidx].Id = 0;
                            BillAmt += NoofDays * BillDetails[npbdidx].Rate;
                            NetPatAmt += ((NoofDays * BillDetails[npbdidx].Rate) * (parseInt(req.Data.CoPayPercent) / 100));
                            NetInsAmt += (NoofDays * BillDetails[npbdidx].Rate) - (NetPatAmt);
                            AcutalBillDetails.push(BillDetails[npbdidx]);
                        }
                    }
                    if (BillAmt > 0) {
                        patientbill.BillAmount = BillAmt;
                        patientbill.NetInsuranceAmount = NetInsAmt || 0;
                        patientbill.NetPatientAmount = NetPatAmt || 0;
                    }
                }

                let UpdatePatientBillReq: any = {
                    Data: {
                        Header: patientbill,
                        paymentDetail: [],
                        Details: AcutalBillDetails
                    }
                };
                await patientbillBO.UpdatePatientBedCharges(UpdatePatientBillReq);
                return OldPatientBillId;
            }
        } else {
            return 0;
        }
        // }
        return 0;
    }

    public async ManageEncounterBillInfo(req: BaseRequest): Promise<number> {
        let WardRoomServiceMapBo = BoFactory.GetBo(generalMasterBo.WardRoomServiceMapBo, this.Request);
        //let BedBo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let NoofDays: number = !req.Data.NoofDays ? 1 : req.Data.NoofDays;
        let IsPrimaryBed: boolean = req.Data.IsPrimaryBed;
        let IsDoubleOccupancy: boolean = req.Data.IsDoubleOccupancy;
        let roomApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: 1, Value: req.Data.RoomId }]//RoomId
        };
        // let bedInfo = await BedBo.GetWardRoomBedMasterById({ Id: req.Data.BedId });
        let roomServiceItemInfo = await WardRoomServiceMapBo.GetWardRoomServiceMaps(roomApiReq);
        let BillingAmount: number = 0;
        let BillDetails: any = [];
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        // let patientguarantorbo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
        let GuarantorBo = BoFactory.GetBo(generalMasterBo.GuarantorSupplementaryBo, this.Request);
        let GuarantorMasBo = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        let IsInsurance: Boolean = false;
        let GuarantorId = 1000;
        let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        GuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();
        if (req.Data.GuarantorId > 0) {
            // let PatientGuarantor = await patientguarantorbo.GetPatientGuarantorById({ Id: req.Data.GuarantorId });
            let guarantor = await GuarantorMasBo.GetGuarantorById({ Id: req.Data.GuarantorId });
            // if (guarantor.Id !== GuarantorId) {
            if ((guarantor.Id !== GuarantorId) && (!guarantor.IsIPBedTariff)) {
                IsInsurance = true;
                GuarantorId = guarantor.Id;
            }
        }
        let facilityprebo = BoFactory.GetBo(appMgBo.FacilityPreferenceBo, this.Request);
        let daywiseseparatebilling = 0;
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.bedchargesforindividualdays) {
            try {
                daywiseseparatebilling = parseInt(facilityPreferencesData.bedchargesforindividualdays);
            } catch (ex) { daywiseseparatebilling = 0; }
        }
        await Promise.all(roomServiceItemInfo.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let ServiceItemDetail: any = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                if (!req.Data.FacilityId) req.Data.FacilityId = this.Session.FacilityId;
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: 2, Value: ServiceItemDetail.Id }, { Key: 3, Value: req.Data.ServiceRateCategoryId },
                    { Key: 5, Value: req.Data.FacilityId }
                    ]
                };
                let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                let IsSupplementary: Boolean = false;
                if (IsInsurance) {
                    let SupplementaryId = await GuarantorBo.CheckSupplementaryServiceItem({
                        where: {
                            ServiceItemId: ServiceItem.ServiceItemId,
                            GuarantorId: GuarantorId
                        },
                        attributes: ['Id']
                    });
                    if (SupplementaryId > 0)
                        IsSupplementary = true;
                }
                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        if (!IsDoubleOccupancy) {
                            if (ServiceItem.ApplyMainOccupancy) {
                                BillDetails.push({
                                    BillDateTime: new Date(),
                                    ServiceId: traif.ServiceItemId,
                                    ServiceName: ServiceItemDetail.Name,
                                    StartDate: new Date(),
                                    // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                    // Rate: parseFloat(traif.Rate.toString()),
                                    // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                    Rate: parseFloat(traif.Rate.toString()),
                                    Amount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    GrossAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    NetAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    DoctorId: req.Data.DoctorId,
                                    DoctorShare: traif.DoctorShare,
                                    IsPackageItem: false,
                                    ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                    DepartmentId: req.Data.DepartmentId,
                                    ServiceCategoryId: ServiceItemDetail.CategoryId,
                                    ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                    ServiceGroupId: ServiceItemDetail.BillingGroupId,
                                    EncounterId: req.Data.EncounterId,
                                    PatientBillStatusId: 3,
                                    IsSupplementary: IsSupplementary
                                });
                                BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                            }
                        } else {
                            if (IsPrimaryBed) {
                                if (ServiceItem.ApplyMainOccupancy) {
                                    BillDetails.push({
                                        BillDateTime: new Date(),
                                        ServiceId: traif.ServiceItemId,
                                        ServiceName: ServiceItemDetail.Name,
                                        StartDate: new Date(),
                                        // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                        // Rate: parseFloat(traif.Rate.toString()),
                                        // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                        // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                        // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                        Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                        Rate: parseFloat(traif.Rate.toString()),
                                        Amount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        GrossAmount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        NetAmount: (daywiseseparatebilling === 1) ?
                                            parseFloat(traif.Rate.toString()) :
                                            (NoofDays * parseFloat(traif.Rate.toString())),
                                        DoctorId: req.Data.DoctorId,
                                        DoctorShare: traif.DoctorShare,
                                        IsPackageItem: false,
                                        ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                        DepartmentId: req.Data.DepartmentId,
                                        ServiceCategoryId: ServiceItemDetail.CategoryId,
                                        ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                        ServiceGroupId: ServiceItemDetail.BillingGroupId,
                                        EncounterId: req.Data.EncounterId,
                                        PatientBillStatusId: 3,
                                        IsSupplementary: IsSupplementary
                                    });
                                    BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                                }
                            } else if (ServiceItem.ApplyDoubleOccupancy) {
                                BillDetails.push({
                                    BillDateTime: new Date(),
                                    ServiceId: traif.ServiceItemId,
                                    ServiceName: ServiceItemDetail.Name,
                                    StartDate: new Date(),
                                    // Quantity: NoofDays,// No of Days is Quantity for Default Services
                                    // Rate: parseFloat(traif.Rate.toString()),
                                    // Amount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // GrossAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    // NetAmount: NoofDays * parseFloat(traif.Rate.toString()),
                                    Quantity: (daywiseseparatebilling === 1) ? 1 : NoofDays,
                                    Rate: parseFloat(traif.Rate.toString()),
                                    Amount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    GrossAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    NetAmount: (daywiseseparatebilling === 1) ?
                                        parseFloat(traif.Rate.toString()) :
                                        (NoofDays * parseFloat(traif.Rate.toString())),
                                    DoctorId: req.Data.DoctorId,
                                    DoctorShare: traif.DoctorShare,
                                    IsPackageItem: false,
                                    ServiceRateCategoryId: traif.ServiceRateCategoryId,
                                    DepartmentId: req.Data.DepartmentId,
                                    ServiceCategoryId: ServiceItemDetail.CategoryId,
                                    ServiceSubCategoryId: ServiceItemDetail.SubCategoryId,
                                    ServiceGroupId: ServiceItemDetail.BillingGroupId,
                                    EncounterId: req.Data.EncounterId,
                                    PatientBillStatusId: 3,
                                    IsSupplementary: IsSupplementary
                                });
                                BillingAmount = parseFloat(BillingAmount.toString()) + (NoofDays * parseFloat(traif.Rate.toString()));
                            }
                        }
                    })(ServiceTraifItem);
                }));
            })(service);
        }));

        /* Grouping Auto Charges */

        /* Grouping Auto Charges */

        //Insert bills against encounter
        let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        if (BillDetails.length > 0) {

            let PatientBill: any = {
                Data: {
                    Header: {
                        BillTypeId: 3,
                        BillDateTime: new Date(),
                        BillAmount: BillingAmount,
                        PatientId: req.Data.PatientId,
                        EncounterId: req.Data.EncounterId,
                        EncounterTypeId: 2, //In Patient Encounter
                        TransferEncounterId: req.Data.OccupancyHistoryId,//To Test for Entries
                        WardId: req.Data.WardId,
                        BedId: req.Data.BedId,
                        RoomId: req.Data.RoomId,
                        GuarantorId: req.Data.GuarantorId,
                        GuarantorTypeId: req.Data.GuarantorTypeId,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        DoctorId: req.Data.DoctorId,
                        PatientBillStatusId: 3,
                        FacilityId: req.Data.FacilityId,
                        DepartmentId: req.Data.DepartmentId,
                        OrganizationId: req.Data.OrganizationId,
                        allowDuplicate: 1
                    },
                    paymentDetail: [],
                    Details: BillDetails
                }
            };
            if (daywiseseparatebilling === 1) {
                console.log('********Daywise Separate Billing********');
                let CurrentDate = moment().toDate();
                let billStartdate = moment(req.Data.BillingStartDate).toDate();
                console.log(CurrentDate);
                console.log(billStartdate);
                // var a = moment('2013-01-01');
                // var b = moment('2013-06-01');
                let patientBillId = 0;
                var i = 0;
                for (var m = moment(billStartdate); m.isSameOrBefore(CurrentDate); m.add(1, 'days')) {
                    console.log('*********Conv Date******');
                    var new_date = moment(billStartdate, 'DD-MM-YYYY').add(i, 'days');
                    i++;
                    // let frmDate = moment(new_date);
                    let frmDate = moment(new_date).format('YYYY-MM-DD');
                    console.log(frmDate);
                    let billReq = {
                        Id: 0,
                        PageContext: { PageSize: 1000, PageNumber: 1 },
                        Params: [
                            // { Key: PatientBillDetailsFilters.PatientBillId, Value: OldPatientBillId },
                            { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
                            // { Key: PatientBillsFilters.FromDate, Value: frmDate },
                            { Key: PatientBillsFilters.BillDateTime, Value: [frmDate + ' 00:00:00', frmDate + ' 23:59:00'] },
                            { Key: PatientBillsFilters.TransferEncounterId, Value: req.Data.OccupancyHistoryId },
                            { Key: PatientBillsFilters.WardId, Value: req.Data.WardId },
                            { Key: PatientBillsFilters.RoomId, Value: req.Data.RoomId },
                            { Key: PatientBillsFilters.BedId, Value: req.Data.BedId },
                        ]
                    };
                    let dataExists: any = await patientbillBO.GetMinPatientBills(billReq);
                    if (dataExists.Data.length <= 0) {
                        PatientBill.Data.Header.BillDateTime = moment(new_date).format('YYYY-MM-DD HH:mm:ss');
                        patientBillId = await patientbillBO.AddBedChargePatientBills(PatientBill);
                    }

                }
                return patientBillId;
            } else {
                let BillSaveResult = await patientbillBO.AddPatientBills(PatientBill);
                return BillSaveResult;
            }

        } else {
            return 0;
        }
    }

    public async ExcuteStoredProcedure(req: BaseRequest): Promise<any> {
        // let FirstDay = new Date(req.Data.From);
        // let replacements: any = {
        //     FirstDay: FirstDay,
        //     isupdate: 0,
        //     ERROR:''
        // };
        // console.log(replacements);
        // let spName =
        //     'ATT_SUMMARY_upgraded(:FirstDay, :isupdate, @ERROR)';
        // await this.ExecuteStoredProcedure(spName, {
        //     replacements: replacements,
        // });
        let spName =
            'auto_billlock';
        console.log(req.Data.procedureName);
        if (req.Data && req.Data.procedureName) {
            spName = req.Data.procedureName;
        }

        await this.ExecuteStoredProcedure(spName);


    }

    public async CanAdmitPatient(req: BaseRequest): Promise<boolean> {
        let encounter = req.Data;
        let AdmissionStatusId = encounter.AdmissionStatusId;

        if (AdmissionStatusId === 2) { //CHECKIN
            let openEncounterId: number = await this.GetEncounterIdByOptions({
                where: {
                    PatientId: encounter.PatientId,
                    EncounterTypeId: 2,
                    AdmissionStatusId: { '$in': [2, 3, 4] }
                },
                attributes: ['Id']
            });
            if (openEncounterId > -1) {
                throw { code: 'OPEN_IP_ENCOUNTER_EXIST' };
            }
        }
        return true;
    }

    public async AdmitAdmissionRequest(req: BaseRequest): Promise<any> {
        if (req.Id <= 0)
            return { Data: { Id: req.Id, Status: false } };

        let admissionrequestbo = BoFactory.GetBo(inpatientBO.AdmissionRequestBo, this.Request);
        let AdmissionRequest = await admissionrequestbo.GetAdmissionRequestById(req);

        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: AdmissionRequest.PatientId });

        let encounterDetail: any = await this.GetEncounterIdByAdmissionRequest({
            Id: 0,
            Data: {
                PatientId: patientData.Id,
                AdmissionRequestId: AdmissionRequest.Id,
                EncounterTypeId: 2 //EncounterType.OP
            }
        });
        if (encounterDetail > 0)
            return { Data: { Id: encounterDetail, Status: false } };

        let encounter: any = {
            EncounterTypeId: 2, //EncounterType.OP
            PatientId: AdmissionRequest.PatientId,
            AdmissionRequestId: AdmissionRequest.Id,
            PatientMrn: patientData.MRN,
            DoctorId: AdmissionRequest.DoctorId, //1.Primary doctor for checkin appointment,
            //DoctorName: doctorInfo.TitleId.Description, // Get the Doctor Details.
            SpecialityId: -1, // - Doctor SpecialityId
            DepartmentId: AdmissionRequest.DepartmentId, //  - Doctor DepartmentId,
            //ReferralId: AdmissionRequest., //- appointment referral id,
            //ReferralName: appointment.ReferralName,
            // GuarantorId: appointment.PatientGuarantorId,
            AdmissionDate: AdmissionRequest.AdmissionDate,
            OrganizationId: -1,
            FacilityId: AdmissionRequest.FacilityId,
            IsLatest: true,
            // VisitReasonId: AdmissionRequest.Reasons,
            // AdmittingReasonId: AdmissionRequest.Reasons,
            // AssignId: AdmissionRequest.,
            //   AssignedGroupId: appointment.AssignedGroupId,
            Comments: AdmissionRequest.Comments,
            PriorityId: AdmissionRequest.PriorityId,
            ClinicalStaffId: this.Session.UserId,
            // EncounterStatusId: 1, //START
            // AdmissionRequestTypeId: AdmissionRequest.RequestTypeId,
            ServiceRateCategoryId: AdmissionRequest.ServiceRateCategoryId,
            AdmissionPriorityId: AdmissionRequest.PriorityId,
            AdmissionStatusId: 1,
            ALOS: AdmissionRequest.ALOS,
            ExpectedDischargeDate: AdmissionRequest.ExceptedDisDate,
            LocationId: AdmissionRequest.LocationId,
            WardId: AdmissionRequest.WardId,
            RoomId: AdmissionRequest.RoomId,
            BedId: AdmissionRequest.BedId,
            TeamId: 0,
        };
        if (encounter.DoctorId > 0)
            encounter.TeamId = await this.getTeamId(encounter.DoctorId);
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let saveResult = await this.Save(encounter);
        let admissionlogbo = BoFactory.GetBo(inpatientBO.PatientAdmissionLogBo, this.Request);
        let AdmissionLog: any = {
            Data: {
                EncounterId: saveResult.dataValues.Id,
                AdmissionStatusId: encounter.AdmissionStatusId,
                AdmittingReasonId: encounter.AdmittingReasonId,
                DoctorId: encounter.DoctorId
            }
        };
        //AdmissionLog.EncounterId = saveResult.dataValues.Id;

        await admissionlogbo.AddPatientAdmissionLog(AdmissionLog);
        return { Data: { Id: saveResult.dataValues.Id, Status: false } };
    }

    public async GetEncounterIdByOptions(foption: SStatic.FindOptions<any>): Promise<number> {
        let encounterId: number = -1;
        let encounterInstance: any = await this.Find(foption);
        if (encounterInstance) {
            let encounter = this.GetAttribute(encounterInstance);
            encounterId = encounter.Id;
        }
        return encounterId;
    }

    public async CanCreateEncounter(req: BaseRequest): Promise<boolean> {
        let appointment = req.Data;
        let appoinetdt = null;
        let CurrentDate = new Date();
        CurrentDate.setHours(23);
        CurrentDate.setMinutes(59);
        CurrentDate.setSeconds(59);
        try {
            appoinetdt = new Date(appointment.AppointmentDate);
        } catch (ex) { appoinetdt = new Date(); }
        if (appoinetdt < CurrentDate) {
            let openEncounterId: number = await this.GetEncounterIdByOptions({
                where: {
                    PatientId: appointment.PatientId,
                    IsLatest: true,
                    // DoctorId: appointment.AssignedUserId,
                    // EncounterTypeId: 1, //EncounterType.OP
                    EncounterStatusId: 1 //START
                },
                attributes: ['Id']
            });
            if (openEncounterId > -1) {
                throw { code: 'OPEN_ENCOUNTER_EXIST' };
            }
        }
        ///////}
        return true;
    }

    public async CanCreateEncounterfromApnmnt(req: BaseRequest): Promise<boolean> {
        let appointment = req.Data;
        let appoinetdt = null;
        let CurrentDate = new Date();
        CurrentDate.setHours(23);
        CurrentDate.setMinutes(59);
        CurrentDate.setSeconds(59);
        try {
            appoinetdt = new Date(appointment.AppointmentDate);
        } catch (ex) { appoinetdt = new Date(); }
        // if (appoinetdt < CurrentDate) {
        //     let openEncounterId: number = await this.GetEncounterIdByOptions({
        //         where: {
        //             PatientId: appointment.PatientId,
        //             IsLatest: true,
        //             // DoctorId: appointment.AssignedUserId,
        //             // EncounterTypeId: 1, //EncounterType.OP
        //             EncounterStatusId: 1 //START
        //         },
        //         attributes: ['Id']
        //     });
        //     if (openEncounterId > -1) {
        //         throw { code: 'OPEN_ENCOUNTER_EXIST' };
        //     }
        // }
        return true;
    }

    public async UpdateIsNoBill(IsNoBillflag: number, EncounterId: number): Promise<boolean> {
        var result = true;
        let IsNoBillres: any = { IsNoBill: IsNoBillflag };
        await this.Update(IsNoBillres, {
            fields: ['IsNoBill'],
            where: {
                Id: EncounterId
            }
        });
        return result;
    }

    public async UpdateIsBillCompleted(IsIsBillCompletedflag: number, EncounterId: number): Promise<boolean> {
        var result = true;
        if (EncounterId && EncounterId > 0) {
            let IsIsBillCompletedres: any = { IsBillCompleted: IsIsBillCompletedflag };
            await this.Update(IsIsBillCompletedres, {
                fields: ['IsBillCompleted'],
                where: {
                    Id: EncounterId
                }
            });
        }
        return result;
    }

    public async UpdateIsPaidVisit(IsPaidVisitflag: number, EncounterId: number): Promise<boolean> {
        var result = true;
        let IsPaidVisitres: any = { IsPaidVisit: IsPaidVisitflag };
        await this.Update(IsPaidVisitres, {
            fields: ['IsPaidVisit'],
            where: {
                Id: EncounterId
            }
        });
        return result;
    }

    public async UpdateFreeVisitCount(FreeVisitcount: number, EncounterId: number): Promise<boolean> {
        var result = true;
        let FreeVisitres: any = { FreeVisit: FreeVisitcount };
        await this.Update(FreeVisitres, {
            fields: ['FreeVisit'],
            where: {
                Id: EncounterId
            }
        });
        return result;
    }

    public async postMedBlaze(req: BaseRequest): Promise<number> {
        if (req.Data.encounterId && req.Data.encounterId > 0) {
            let encounterData = await this.GetEncounterById({ Id: req.Data.encounterId });
            let VisitIdentifier = encounterData.VisitIdentifier;
            req.Data.feedbackData.variables[5].value = String(VisitIdentifier);
            console.log('*******Visit Identifier');
            console.log(VisitIdentifier);
        }
        const integrationService = new IntegrationService();
        let postResult: any = await integrationService.postMedBlaze(req.Data.feedbackData);
        console.log(postResult);
        return 1;
    }

    public async postWhatsapp(req: BaseRequest): Promise<number> {
        if (req.Data.encounterId && req.Data.encounterId > 0) {
            let encounterData = await this.GetEncounterById({ Id: req.Data.encounterId });
            let VisitIdentifier = encounterData.VisitIdentifier;
            console.log('*******Visit Identifier');
            console.log(VisitIdentifier);
            //WhatsApp
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
                let UserData = await userBO.GetUserById({ Id: req.Data.DoctorId });
                let vDoctorName = '';
                vDoctorName = await this.getUserNamewoTitle(UserData);

                let data = {
                    channelId: '64ef1968000b0fe0d6e2847c',
                    channelType: 'whatsapp',
                    recipient: {
                        name: req.Data.FirstName,
                        phone: '91' + Number(UserData.Mobile)
                    },
                    whatsapp: {
                        type: 'template',
                        template: {
                            templateName: '',
                            bodyValues: {
                                name: req.Data.FirstName,
                                variable_2: vDoctorName,
                                variable_3: req.Data.DepartmentName,
                                variable_4: (VisitIdentifier) ? String(VisitIdentifier) : '',
                                variable_5: req.Data.MRN,
                            }
                        }
                    }
                };

                data.whatsapp.template.templateName = 'admission';
                if (data.whatsapp.template.templateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }
            }
        }
        return 1;
    }

    public async ManageEncounter(req: BaseRequest): Promise<number> {
        let appointment = req.Data;
        let apptStatus = appointment.AppointmentStatusId;

        let patientBO = BoFactory.GetBo(bo.PatientBo, this.Request);
        let patient: any = await patientBO.GetById(appointment.PatientId);
        let trackerBO = BoFactory.GetBo(apptbo.PatientTrackerBo, this.Request);
        let generateVisitId: number = 0;
        if (apptStatus === 6) { //CHECKIN
            if (appointment && (!appointment.PatientGuarantorId || appointment.PatientGuarantorId < 0)) {
                let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
                let listReq: any = {};
                listReq = {
                    Params: [{ Key: PatientGuarantorFilters.PatientId, Value: appointment.PatientId },
                    { Key: PatientGuarantorFilters.Rank, Value: 1 }]
                };
                let listRes = await patientGuarantorBO.GetPatientGuarantors(listReq);
                if (listRes && listRes.Data &&
                    listRes.Data.length > 0) {
                    appointment.PatientGuarantorId = listRes.Data[0].Id;
                } else {
                    appointment.PatientGuarantorId =
                        await patientGuarantorBO.ManagePatientSelfGuarantor(appointment.PatientId);
                }
            }
            let encounterId: number = await this.GetEncounterIdByFilter({
                Id: 0,
                Data: {
                    PatientId: appointment.PatientId,
                    AppointmentId: appointment.Id,
                    EncounterTypeId: 1 //EncounterType.OP
                }
            });
            if (encounterId === -1) {
                await this.CanCreateEncounter(req);
                let encounter: any = {
                    EncounterTypeId: 1, //EncounterType.OP
                    PatientId: appointment.PatientId,
                    RemarkId: appointment.RemarkId,
                    AppointmentId: appointment.Id,
                    VisitIdentifier: null,
                    PatientMrn: patient.MRN,
                    DoctorId: appointment.AssignedUserId, //1.Primary doctor for checkin appointment,
                    DoctorName: appointment.AssignedUserName,
                    DiagnosisId: appointment.DiagnosisId,
                    OtherDiagnosis: appointment.OtherDiagnosis,
                    SpecialityId: -1, // - Doctor SpecialityId
                    DepartmentId: appointment.DepartmentId, //  - Doctor DepartmentId,
                    ReferralId: appointment.ReferralId, //- appointment referral id,
                    ReferralName: appointment.ReferralName,
                    ReferralTypeId: appointment.ReferralTypeId,
                    GuarantorId: appointment.GuarantorId,
                    TpaId: appointment.TpaId,
                    GuarantorTypeId: appointment.PatientGuarantorTypeId,
                    AdmissionDate: new Date(), //appointment.AppointmentDate
                    OrganizationId: -1,
                    FacilityId: appointment.FacilityId,
                    InsuranceNumber: appointment.InsuranceNumber,
                    IsLatest: true,
                    VisitReasonId: appointment.RemarkId,
                    IsMLC: appointment.IsMLC,
                    PromotionalSchemeId: appointment.PromotionSchemeId,
                    AdmitReason: appointment.Remarks,
                    AssignId: appointment.AssignedUserId,
                    AssignedGroupId: appointment.AssignedGroupId,
                    Comments: appointment.Comments,
                    PriorityId: appointment.PriorityId,
                    ClinicalStaffId: this.Session.UserId,
                    EncounterStatusId: 1, //START
                    VisitTypeId: appointment.VisitTypeId,
                    IsEmergencyVisit: appointment.IsEmergency,
                    TeamId: 0,
                    B2BCustomerMasterId: appointment.B2BCustomerMasterId,
                    ClinicalNotes: appointment.ClinicalNotes,
                    ServiceRateCategoryId: appointment.ServiceRateCategoryId || 1,
                    BillingStatusId: 1
                };

                if (appointment.TeamId)
                    encounter.TeamId = appointment.TeamId;

                generateVisitId = 1;
                //update IsLatest for other OP encounters
                let previousEncounter: any = { Id: 0, IsLatest: false };
                await this.Models.Encounter.update(previousEncounter, {
                    fields: ['IsLatest'],
                    where: {
                        PatientId: encounter.PatientId,
                        EncounterTypeId: encounter.EncounterTypeId,
                        IsLatest: true
                    }
                });

                if (!encounter.TeamId && encounter.DoctorId > 0)
                    encounter.TeamId = await this.getTeamId(encounter.DoctorId);


                let result = await this.Save(encounter);
                encounterId = result.dataValues.Id;
                if (generateVisitId === 1)
                    try {
                        this.deferSequenceKey(encounterId, 'VisitIdentifier',
                            this.getSequenceIdentifier(SequenceKeys.OPEncounter));
                    } catch (error) {
                        throw { message: 'Sequence Issue.. Please contact Support' };
                    }
            } else {
                let encounter = await this.GetEncounterById({ Id: encounterId });
                encounter.ReferralId = appointment.ReferralId;
                encounter.ReferralName = appointment.ReferralName;
                encounter.GuarantorId = appointment.GuarantorId;
                encounter.VisitReasonId = appointment.RemarkId;
                encounter.RemarkId = appointment.RemarkId;
                encounter.Comments = appointment.Comments;
                await this.Update(encounter);
            }

            //await patientBO.PatientBranchChangeOver(appointment.PatientId, appointment.FacilityId);

            req.Data.EncounterId = encounterId;
            await trackerBO.CheckinPatient(req);

            let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
            await encounterDocBO.ManageEncounterDoctor(req);

            let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
            await encounterGuarantorBo.ManageEncounterGuarantor(req);

            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.UpdateEncGuarantor(req, req.Data.EncounterId);

            if (!req.Data.NoDraftBill) {
                await this.ManageOPDefaultServices(req);
            }

            return encounterId;
        } else if (apptStatus === 11) {
            await trackerBO.CheckoutPatient(req);
        }
        return -1;
    }

    public async ManageAppEncounter(req: BaseRequest): Promise<number> {
        let appointment = req.Data;
        let apptStatus = appointment.AppointmentStatusId;

        let patientBO = BoFactory.GetBo(bo.PatientBo, this.Request);
        let patient: any = await patientBO.GetById(appointment.PatientId);
        let trackerBO = BoFactory.GetBo(apptbo.PatientTrackerBo, this.Request);
        let generateVisitId: number = 0;
        if (apptStatus === 6) { //CHECKIN
            let encounterId: number = await this.GetEncounterIdByFilter({
                Id: 0,
                Data: {
                    PatientId: appointment.PatientId,
                    AppointmentId: appointment.Id,
                    EncounterTypeId: 1 //EncounterType.OP
                }
            });
            if (encounterId === -1) {
                // await this.CanCreateEncounter(req);
                let encounter: any = {
                    EncounterTypeId: 1, //EncounterType.OP
                    PatientId: appointment.PatientId,
                    RemarkId: appointment.RemarkId,
                    AppointmentId: appointment.Id,
                    VisitIdentifier: null,
                    PatientMrn: patient.MRN,
                    DoctorId: appointment.AssignedUserId, //1.Primary doctor for checkin appointment,
                    DoctorName: appointment.AssignedUserName,
                    DiagnosisId: appointment.DiagnosisId,
                    OtherDiagnosis: appointment.OtherDiagnosis,
                    SpecialityId: -1, // - Doctor SpecialityId
                    DepartmentId: appointment.DepartmentId, //  - Doctor DepartmentId,
                    ReferralId: appointment.ReferralId, //- appointment referral id,
                    ReferralName: appointment.ReferralName,
                    ReferralTypeId: appointment.ReferralTypeId,
                    GuarantorId: appointment.GuarantorId,
                    GuarantorTypeId: appointment.PatientGuarantorTypeId,
                    AdmissionDate: new Date(), //appointment.AppointmentDate
                    OrganizationId: -1,
                    FacilityId: appointment.FacilityId,
                    IsLatest: true,
                    VisitReasonId: appointment.RemarkId,
                    AdmitReason: appointment.Remarks,
                    AssignId: appointment.AssignedUserId,
                    AssignedGroupId: appointment.AssignedGroupId,
                    Comments: appointment.Comments,
                    PriorityId: appointment.PriorityId,
                    ClinicalStaffId: this.Session.UserId,
                    EncounterStatusId: 1, //START
                    VisitTypeId: appointment.VisitTypeId,
                    TeamId: 0,
                    B2BCustomerMasterId: appointment.B2BCustomerMasterId,
                    ClinicalNotes: appointment.ClinicalNotes,
                    ServiceRateCategoryId: appointment.ServiceRateCategoryId,
                    BillingStatusId: 1
                };

                generateVisitId = 1;
                //update IsLatest for other OP encounters
                let previousEncounter: any = { Id: 0, IsLatest: false };
                await this.Models.Encounter.update(previousEncounter, {
                    fields: ['IsLatest'],
                    where: {
                        PatientId: encounter.PatientId,
                        EncounterTypeId: encounter.EncounterTypeId,
                        IsLatest: true
                    }
                });

                let result = await this.Save(encounter);
                encounterId = result.dataValues.Id;
                if (generateVisitId === 1)
                    try {
                        this.deferSequenceKey(encounterId, 'VisitIdentifier',
                            this.getSequenceIdentifier(SequenceKeys.OPEncounter));
                    } catch (error) {
                        throw { message: 'Sequence Issue.. Please contact Support' };
                    }
            } else {
                let encounter = await this.GetEncounterById({ Id: encounterId });
                encounter.ReferralId = appointment.ReferralId;
                encounter.ReferralName = appointment.ReferralName;
                encounter.GuarantorId = appointment.PatientGuarantorId;
                encounter.VisitReasonId = appointment.RemarkId;
                encounter.RemarkId = appointment.RemarkId;
                encounter.Comments = appointment.Comments;
                await this.Update(encounter);
            }

            //await patientBO.PatientBranchChangeOver(appointment.PatientId, appointment.FacilityId);

            req.Data.EncounterId = encounterId;
            await trackerBO.CheckinPatient(req);

            let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
            await encounterDocBO.ManageAppEncounterDoctor(req);

            return encounterId;
        } else if (apptStatus === 11) {
            await trackerBO.CheckoutPatient(req);
        }
        return -1;
    }

    public async ManageUpdateEncounter(req: BaseRequest, OrderId: number): Promise<number> {
        let appointment = req.Data;
        let apptStatus = appointment.AppointmentStatusId;
        let encounterId: any;
        let patientBO = BoFactory.GetBo(bo.PatientBo, this.Request);
        let patient: any = await patientBO.GetById(appointment.PatientId);
        let trackerBO = BoFactory.GetBo(apptbo.PatientTrackerBo, this.Request);
        let generateVisitId: number = 0;
        if (apptStatus === 6) { //CHECKIN
            // if (appointment && (!appointment.PatientGuarantorId || appointment.PatientGuarantorId < 0)) {
            //     let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            //     let listReq: any = {};
            //     listReq = {
            //         Params: [{ Key: PatientGuarantorFilters.PatientId, Value: appointment.PatientId },
            //         { Key: PatientGuarantorFilters.Rank, Value: 1 }]
            //     };
            //     let listRes = await patientGuarantorBO.GetPatientGuarantors(listReq);
            //     if (listRes && listRes.Data &&
            //         listRes.Data.length > 0) {
            //         appointment.PatientGuarantorId = listRes.Data[0].Id;
            //     } else {
            //         appointment.PatientGuarantorId =
            //             await patientGuarantorBO.ManagePatientSelfGuarantor(appointment.PatientId);
            //     }
            // }
            encounterId = await this.GetEncounterIdByFilter({
                Id: 0,
                Data: {
                    PatientId: appointment.PatientId,
                    AppointmentId: appointment.Id,
                    EncounterTypeId: 1 //EncounterType.OP
                }
            });
            if (encounterId === -1) {
                // await this.CanCreateEncounter(req);
                let encounter: any = {
                    EncounterTypeId: 1, //EncounterType.OP
                    PatientId: appointment.PatientId,
                    RemarkId: appointment.RemarkId,
                    AppointmentId: appointment.Id,
                    VisitIdentifier: null,
                    PatientMrn: patient.MRN,
                    DoctorId: appointment.AssignedUserId, //1.Primary doctor for checkin appointment,
                    DoctorName: appointment.AssignedUserName,
                    DiagnosisId: appointment.DiagnosisId,
                    OtherDiagnosis: appointment.OtherDiagnosis,
                    SpecialityId: -1, // - Doctor SpecialityId
                    DepartmentId: appointment.DepartmentId, //  - Doctor DepartmentId,
                    ReferralId: appointment.ReferralId, //- appointment referral id,
                    ReferralName: appointment.ReferralName,
                    ReferralTypeId: appointment.ReferralTypeId,
                    GuarantorId: appointment.GuarantorId,
                    GuarantorTypeId: appointment.GuarantorTypeId,
                    AdmissionDate: new Date(), //appointment.AppointmentDate
                    OrganizationId: -1,
                    FacilityId: appointment.FacilityId,
                    IsLatest: true,
                    VisitReasonId: appointment.RemarkId,
                    AdmitReason: appointment.Remarks,
                    AssignId: appointment.AssignedUserId,
                    AssignedGroupId: appointment.AssignedGroupId,
                    Comments: appointment.Comments,
                    PriorityId: appointment.PriorityId,
                    ClinicalStaffId: this.Session.UserId,
                    EncounterStatusId: 1, //START
                    VisitTypeId: appointment.VisitTypeId,
                    TeamId: 0,
                    B2BCustomerMasterId: appointment.B2BCustomerMasterId,
                    ClinicalNotes: appointment.ClinicalNotes,
                    ServiceRateCategoryId: appointment.ServiceRateCategoryId,
                    BillingStatusId: 1
                };

                if (appointment.TeamId)
                    encounter.TeamId = appointment.TeamId;

                generateVisitId = 1;
                //update IsLatest for other OP encounters
                let previousEncounter: any = { Id: 0, IsLatest: false };
                await this.Models.Encounter.update(previousEncounter, {
                    fields: ['IsLatest'],
                    where: {
                        PatientId: encounter.PatientId,
                        EncounterTypeId: encounter.EncounterTypeId,
                        IsLatest: true
                    }
                });

                if (!encounter.TeamId && encounter.DoctorId > 0)
                    encounter.TeamId = await this.getTeamId(encounter.DoctorId);


                let result = await this.Save(encounter);
                encounterId = result.dataValues.Id;
                if (generateVisitId === 1)
                    try {
                        this.deferSequenceKey(encounterId, 'VisitIdentifier',
                            this.getSequenceIdentifier(SequenceKeys.OPEncounter));
                    } catch (error) {
                        throw { message: 'Sequence Issue.. Please contact Support' };
                    }
            } else {
                let encounter = await this.GetEncounterById({ Id: encounterId });
                encounter.ReferralId = appointment.ReferralId;
                encounter.ReferralName = appointment.ReferralName;
                encounter.GuarantorId = appointment.PatientGuarantorId;
                encounter.VisitReasonId = appointment.RemarkId;
                encounter.RemarkId = appointment.RemarkId;
                encounter.Comments = appointment.Comments;
                await this.Update(encounter);
            }

            //await patientBO.PatientBranchChangeOver(appointment.PatientId, appointment.FacilityId);

            req.Data.EncounterId = encounterId;
            await trackerBO.CheckinPatient(req);

            let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
            await encounterDocBO.ManageupdateEncounterDoctor(req, OrderId);

            // let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
            // await encounterGuarantorBo.ManageEncounterGuarantor(req);

            // if (!req.Data.NoDraftBill) {
            //     await this.ManageOPDefaultServices(req);
            // }

            return encounterId;
        } else if (apptStatus === 11) {
            await trackerBO.CheckoutPatient(req);
        }
        return encounterId;
    }

    public async ManageEncounterForLISReg(req: BaseRequest): Promise<number> {
        let appointment = req.Data;
        let apptStatus = appointment.AppointmentStatusId;

        let patientBO = BoFactory.GetBo(bo.PatientBo, this.Request);
        let patient: any = await patientBO.GetById(appointment.PatientId);
        let trackerBO = BoFactory.GetBo(apptbo.PatientTrackerBo, this.Request);
        let generateVisitId: number = 0;
        if (apptStatus === 6) { //CHECKIN

            let encounterId: number = await this.GetEncounterIdByFilter({
                Id: 0,
                Data: {
                    PatientId: appointment.PatientId,
                    AppointmentId: appointment.Id,
                    EncounterTypeId: 4 //EncounterType.B2B
                }
            });
            if (encounterId === -1) {
                await this.CanCreateEncounter(req);
                let encounter: any = {
                    EncounterTypeId: 4, //EncounterType.B2B
                    PatientId: appointment.PatientId,
                    RemarkId: appointment.RemarkId,
                    AppointmentId: appointment.Id,
                    VisitIdentifier: null,
                    PatientMrn: patient.MRN,
                    DoctorId: appointment.AssignedUserId, //1.Primary doctor for checkin appointment,
                    DoctorName: appointment.AssignedUserName,
                    DiagnosisId: appointment.DiagnosisId,
                    OtherDiagnosis: appointment.OtherDiagnosis,
                    SpecialityId: -1, // - Doctor SpecialityId
                    DepartmentId: appointment.DepartmentId, //  - Doctor DepartmentId,
                    ReferralId: appointment.ReferralId, //- appointment referral id,
                    ReferralName: appointment.ReferralName,
                    ReferralTypeId: appointment.ReferralTypeId,
                    GuarantorId: appointment.PatientGuarantorId,
                    AdmissionDate: new Date(), //appointment.AppointmentDate
                    OrganizationId: -1,
                    FacilityId: appointment.FacilityId,
                    IsLatest: true,
                    VisitReasonId: appointment.RemarkId,
                    AdmitReason: appointment.Remarks,
                    AssignId: appointment.AssignedUserId,
                    AssignedGroupId: appointment.AssignedGroupId,
                    Comments: appointment.Comments,
                    PriorityId: appointment.PriorityId,
                    ClinicalStaffId: this.Session.UserId,
                    EncounterStatusId: 1, //START
                    VisitTypeId: appointment.VisitTypeId,
                    TeamId: 0,
                    B2BCustomerMasterId: appointment.B2BCustomerMasterId,
                    ClinicalNotes: appointment.ClinicalNotes,
                    IsB2BCustomer: true
                };

                if (appointment.TeamId)
                    encounter.TeamId = appointment.TeamId;

                generateVisitId = 1;
                //update IsLatest for other OP encounters
                let previousEncounter: any = { Id: 0, IsLatest: false };
                await this.Models.Encounter.update(previousEncounter, {
                    fields: ['IsLatest'],
                    where: {
                        PatientId: encounter.PatientId,
                        EncounterTypeId: encounter.EncounterTypeId,
                        IsLatest: true
                    }
                });

                if (!encounter.TeamId && encounter.DoctorId > 0)
                    encounter.TeamId = await this.getTeamId(encounter.DoctorId);


                let result = await this.Save(encounter);
                encounterId = result.dataValues.Id;
                if (generateVisitId === 1)
                    try {
                        this.deferSequenceKey(encounterId, 'VisitIdentifier',
                            this.getSequenceIdentifier(SequenceKeys.OPEncounter));
                    } catch (error) {
                        throw { message: 'Sequence Issue.. Please contact Support' };
                    }
            } else {
                let encounter = await this.GetEncounterById({ Id: encounterId });
                encounter.ReferralId = appointment.ReferralId;
                encounter.ReferralName = appointment.ReferralName;
                encounter.GuarantorId = appointment.PatientGuarantorId;
                encounter.VisitReasonId = appointment.RemarkId;
                encounter.Comments = appointment.Comments;
                encounter.RemarkId = appointment.RemarkId;
                await this.Update(encounter);
            }

            //await patientBO.PatientBranchChangeOver(appointment.PatientId, appointment.FacilityId);

            req.Data.EncounterId = encounterId;
            await trackerBO.CheckinPatient(req);

            let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
            await encounterDocBO.ManageEncounterDoctor(req);

            let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
            await encounterGuarantorBo.ManageEncounterGuarantor(req);

            if (!req.Data.NoDraftBill) {
                await this.ManageOPDefaultServices(req);
            }

            return encounterId;
        } else if (apptStatus === 11) {
            await trackerBO.CheckoutPatient(req);
        }
        return -1;
    }
    public async getOPVisitCount(req: BaseRequest): Promise<number> {
        let opVisitCount = 0;
        opVisitCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'PatientId': req.Data.PatientId,
                'FacilityId': req.Data.FacilityId,
            }
        });
        if (!opVisitCount) opVisitCount = 0;

        return opVisitCount;
    }

    public async getAllOPVisitCount(req: BaseRequest): Promise<number> {
        let opVisitCount = 0;
        opVisitCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientId': req.Data.PatientId,
                'FacilityId': req.Data.FacilityId,
            }
        });
        if (!opVisitCount) opVisitCount = 0;

        return opVisitCount;
    }

    public async GetOPDefaultServices(req: BaseRequest): Promise<any[]> {
        let facilityServiceBo = BoFactory.GetBo(appMgBo.FacilityDefaultServiceBo, this.Request);
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        // return value
        let BillDetails: any = [];

        // req variable from client
        let NewVisit = req.Data.NewVisit;
        let GuarantorId = req.Data.GuarantorId; // GuarantorId
        let GuarantorTypeId = req.Data.GuarantorTypeId; // GuarantorTypeId
        let GuarantorServiceRateCategoryId = req.Data.GuarantorServiceRateCategoryId;
        let FacilityId = req.Data.FacilityId;
        // Self Guarantor for Default Tariff
        let SelfGuarantorId = 0;
        let SelfGuarantorServiceRateCategory = 0;
        try {
            let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
            SelfGuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();
            let Guarantorobj = await guarantorMasterBO.GetGuarantorById({ Id: GuarantorId });
            if (Guarantorobj) {
                SelfGuarantorServiceRateCategory = Guarantorobj.ServiceRateCategoryId;
            }
        } catch (ex) { console.log(ex); }
        if (!SelfGuarantorId) SelfGuarantorId = 0;
        if (!SelfGuarantorServiceRateCategory) SelfGuarantorServiceRateCategory = 0;

        let facilityServiceApiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: 2, Value: FacilityId },
                { Key: 3, Value: 1 }, // Encounter type OP
                { Key: 4, Value: NewVisit }, // NewVisit or FollowUp
                { Key: 5, Value: GuarantorTypeId }, // GuarantorTypeId
                { Key: 6, Value: 1 }, // StatusId
                { Key: 7, Value: GuarantorId }, // GuarantorId
            ]
        };

        let AliasId: any = null;
        let AliasName: any = null;
        let EligibleDaysFrom: any = {};
        let EligibleDays: any = {};
        let NoofVisitFree: any = {};
        let facilityServiceDetails = await facilityServiceBo.GetFacilityDefaultServices(facilityServiceApiReq);
        await Promise.all(facilityServiceDetails.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let SerId = ServiceItem.ServiceItemId;
                EligibleDaysFrom[SerId] = ServiceItem.EligibleDaysFrom;
                EligibleDays[SerId] = ServiceItem.EligibleDays;
                NoofVisitFree[SerId] = ServiceItem.NooFVisitFree;
                let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                if (GuarantorTypeId > 1) {
                    AliasId = null;
                    AliasName = null;
                    let apiServAliasReq = {
                        Id: 0,
                        Params: [
                            { Key: ServiceItemAliasFilters.ServiceItemId, Value: ServiceInfo.Id },
                            { Key: ServiceItemAliasFilters.ExternalProviderId, Value: GuarantorId }
                        ],
                        PageContext: { PageSize: -1, PageNumber: 1 }
                    };
                    let servItmAliasBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemAliasBo, this.Request);
                    let seritmaliasdata = await servItmAliasBo.GetServiceItemAliass(apiServAliasReq);
                    if (seritmaliasdata.Data && seritmaliasdata.Data.length > 0) {
                        AliasId = seritmaliasdata.Data[0].AliasId;
                        AliasName = seritmaliasdata.Data[0].AliasName;
                    }
                }
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: 2, Value: ServiceInfo.Id },
                        { Key: 3, Value: GuarantorServiceRateCategoryId },
                        { Key: 5, Value: req.Data.FacilityId }
                    ]
                };
                let serviceItemInfo = null;
                serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                if (!serviceItemInfo) { // Tariff is not available Get from Self Tariff
                    let selfTariffApiReq = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: 2, Value: ServiceInfo.Id },
                            { Key: 3, Value: SelfGuarantorServiceRateCategory },
                            { Key: 5, Value: req.Data.FacilityId }
                        ]
                    };
                    serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(selfTariffApiReq);
                }
                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        let BilldetailItem = {
                            BillDateTime: new Date(),
                            DiscountModeId: 0,
                            DiscountAmount: 0,
                            DiscountPercentage: 0,
                            ProportionateDiscount: 0,
                            StartDate: new Date(),
                            Quantity: 1,// No of Days is Quantity for Default Services
                            Rate: parseFloat(traif.Rate.toString()),
                            EmergencyRate: parseFloat(traif.EmergencyRate.toString()),
                            Amount: 1 * parseFloat(traif.Rate.toString()),
                            GrossAmount: 1 * parseFloat(traif.Rate.toString()),
                            NetAmount: 1 * parseFloat(traif.Rate.toString()),
                            ReceivedAmount: 1 * parseFloat(traif.Rate.toString()),
                            DoctorId: req.Data.DoctorId,
                            DoctorShare: traif.DoctorShare,
                            IsPackageItem: ServiceInfo.IsPackage,
                            ServiceId: traif.ServiceItemId,
                            ServiceCode: ServiceInfo.ItemCode,
                            ServiceName: ServiceInfo.Name,
                            TestCode: ServiceInfo.ItemCode,
                            TestName: ServiceInfo.Name,
                            TestDescription: ServiceInfo.Name,
                            DepartmentId: ServiceInfo.DepartmentId,
                            SubDepartmentId: ServiceInfo.SubDepartmentId,
                            IsOrderable: ServiceInfo.IsOrderable,
                            CanDiscountProportionate: ServiceInfo.CanDiscountProportionate,
                            ServiceCategoryId: ServiceInfo.CategoryId,
                            MasterTypeId: ServiceInfo.MasterTypeId,
                            TestId: ServiceInfo.MasterItemId,
                            TestTypeId: ServiceInfo.OrderTypeId,
                            MasterItemId: ServiceInfo.MasterItemId,
                            MasterName: ServiceInfo.MasterName,
                            ServiceRateCategoryId: traif.ServiceRateCategoryId,
                            ServiceSubCategoryId: ServiceInfo.SubCategoryId,
                            ServiceGroupId: ServiceInfo.BillingGroupId,
                            EncounterId: req.Data.EncounterId,
                            PatientBillStatusId: 1,
                            IsSupplementary: 0,
                            AliasId: AliasId,
                            AliasName: AliasName,
                            DefaultFacilityEligibleDaysFrom: EligibleDaysFrom[traif.ServiceItemId],
                            DefaultFacilityEligibleDays: EligibleDays[traif.ServiceItemId],
                            DefaultFacilityNoofVisitFree: NoofVisitFree[traif.ServiceItemId],
                            CurrentDate: new Date(),
                        };

                        BillDetails.push(BilldetailItem);
                    })(ServiceTraifItem);
                }));
            })(service);
        }));

        return BillDetails;
    }

    public async ManageOPDefaultServices(req: BaseRequest): Promise<boolean> {
        let facilityServiceBo = BoFactory.GetBo(appMgBo.FacilityDefaultServiceBo, this.Request);
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        let patientguarantorbo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
        let Guarantorbo = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        let NewVisit = 1;
        let BillDetails: any = [];
        let BillingAmount: number = 0;
        let GuarantorId = 1000; // Self
        let GuarantorTypeId = 1;
        let GuarantorServiceRateCategory = -1;
        let encounterCount = await this.getAllOPVisitCount(req);
        if (encounterCount > 0) NewVisit = 2;

        let guarantorMasterBO = BoFactory.GetBo(generalMasterBo.GuarantorBo, this.Request);
        GuarantorId = await guarantorMasterBO.GetCurrentGuarantorId();

        if (req.Data.PatientGuarantorId > 0) {
            let PatientGuarantor = await patientguarantorbo.GetPatientGuarantorById({ Id: req.Data.PatientGuarantorId });
            if (PatientGuarantor) {
                GuarantorId = PatientGuarantor.GuarantorId;
                GuarantorTypeId = PatientGuarantor.GuarantorTypeId;
            }
        }
        let Guarantorobj = await Guarantorbo.GetGuarantorById({ Id: GuarantorId });
        if (Guarantorobj) {
            GuarantorServiceRateCategory = Guarantorobj.ServiceRateCategoryId;
        }
        let facilityServiceApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: 2, Value: req.Data.FacilityId },
                { Key: 3, Value: 1 }, // Encounter type OP
                { Key: 4, Value: NewVisit }, // Encounter type OP
                { Key: 5, Value: GuarantorTypeId }, // GuarantorTypeId
                { Key: 6, Value: 1 }, // StatusId
            ]
        };

        let AliasId: any = null;
        let AliasName: any = null;
        let facilityServiceDetails = await facilityServiceBo.GetFacilityDefaultServices(facilityServiceApiReq);
        await Promise.all(facilityServiceDetails.Data.map((service): Promise<void> => {
            return (async (ServiceItem): Promise<void> => {
                let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: ServiceItem.ServiceItemId });
                if (GuarantorTypeId > 1) {
                    AliasId = null;
                    AliasName = null;
                    let apiServAliasReq = {
                        Id: 0,
                        Params: [
                            { Key: ServiceItemAliasFilters.ServiceItemId, Value: ServiceInfo.Id },
                            { Key: ServiceItemAliasFilters.ExternalProviderId, Value: GuarantorId }
                        ],
                        PageContext: { PageSize: -1, PageNumber: 1 }
                    };
                    let servItmAliasBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemAliasBo, this.Request);
                    let seritmaliasdata = await servItmAliasBo.GetServiceItemAliass(apiServAliasReq);
                    if (seritmaliasdata.Data && seritmaliasdata.Data.length > 0) {
                        AliasId = seritmaliasdata.Data[0].AliasId;
                        AliasName = seritmaliasdata.Data[0].AliasName;
                    }
                }
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: 2, Value: ServiceInfo.Id },
                        { Key: 3, Value: GuarantorServiceRateCategory }
                    ]
                };
                let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                await Promise.all(serviceItemInfo.Data.map((ServiceTraifItem): Promise<void> => {
                    return (async (traif): Promise<void> => {
                        BillDetails.push({
                            BillDateTime: new Date(),
                            ServiceId: traif.ServiceItemId,
                            ServiceName: ServiceInfo.Name,
                            StartDate: new Date(),
                            Quantity: 1,// No of Days is Quantity for Default Services
                            Rate: parseFloat(traif.Rate.toString()),
                            Amount: 1 * parseFloat(traif.Rate.toString()),
                            GrossAmount: 1 * parseFloat(traif.Rate.toString()),
                            NetAmount: 1 * parseFloat(traif.Rate.toString()),
                            DoctorId: req.Data.DoctorId,
                            DoctorShare: traif.DoctorShare,
                            IsPackageItem: false,
                            ServiceRateCategoryId: traif.ServiceRateCategoryId,
                            DepartmentId: req.Data.DepartmentId,
                            ServiceCategoryId: ServiceInfo.CategoryId,
                            ServiceSubCategoryId: ServiceInfo.SubCategoryId,
                            ServiceGroupId: ServiceInfo.BillingGroupId,
                            EncounterId: req.Data.EncounterId,
                            PatientBillStatusId: 1,
                            IsSupplementary: 0,
                            AliasId: AliasId,
                            AliasName: AliasName
                        });
                        BillingAmount = parseFloat(BillingAmount.toString()) + parseFloat(traif.Rate.toString());
                    })(ServiceTraifItem);
                }));
            })(service);
        }));

        if (BillDetails.length > 0) {
            let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            let PatientBill: any = {
                Data: {
                    Header: {
                        BillTypeId: 1, // OP
                        BillDateTime: new Date(),
                        BillAmount: BillingAmount,
                        PatientId: req.Data.PatientId,
                        EncounterId: req.Data.EncounterId,
                        EncounterTypeId: 1, //OP Encounter
                        GuarantorId: req.Data.PatientGuarantorId,
                        GuarantorTypeId: GuarantorTypeId,
                        ServiceRateCategoryId: GuarantorServiceRateCategory,
                        DoctorId: req.Data.DoctorId,
                        PatientBillStatusId: 1,
                        FacilityId: req.Data.FacilityId,
                        DepartmentId: req.Data.DepartmentId,
                        OrganizationId: req.Data.OrganizationId
                    },
                    paymentDetail: [],
                    Details: BillDetails
                }
            };
            let BillSaveResult = await patientbillBO.AddPatientBills(PatientBill);
            return BillSaveResult > 0;
        } else {
            return false;
        }
    }

    public async IsBillLocked(req: BaseRequest): Promise<boolean> {
        let islocked = false;
        let result = await this.GetById(req.Id);
        let Encounterdata = this.GetAttribute(result);
        if (Encounterdata && Encounterdata.EncounterTypeId === 2 && Encounterdata.IsBillLock)
            islocked = true;

        return islocked;
    }

    public async GetEncounterById(req: BaseRequest): Promise<EncounterAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CreatedByUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Guarantor,
            include: [{
                model: this.Models.GuarantorAgreement,
                required: false
            }],
            required: false
        });
        include.push({
            model: this.Models.PromotionalScheme, attributes: ['Id', 'PromotionSchemeName', 'PromotionSchemeCode'],
            required: false,
            include: [
                {
                    model: this.Models.PromotionalSchemeDetail,
                    required: false,
                },
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetEncounterIdForAppointment(appointmentId: number): Promise<number> {
        let encounterId = -1;
        let instance = await this.Find({
            where: {
                AppointmentId: appointmentId
            },
            attributes: ['Id']
        });
        if (instance) {
            let attribs = this.GetAttribute(instance);
            encounterId = attribs.Id;
        }
        return encounterId;
    }

    public async CheckoutEncounter(req: BaseRequest): Promise<number> {
        let checkoutInfo = req.Data;
        let encounterInstance: any = await this.Find({
            where: { PatientId: checkoutInfo.PatientId, AppointmentId: checkoutInfo.AppointmentId }
        });
        if (encounterInstance) {
            let encounter = this.GetAttribute(encounterInstance);
            encounter.DischargeDate = new Date();
            //encounter.EncounterStatusId = 2; //EncounterStatus.Checkout
            encounter.EncounterStatusId = 11;
            encounter.IsLatest = false;
            await this.SaveOrUpdate(encounter);
        }
        return 0;
    }

    public async AutoCheckoutEncounter(checkoutInfo: any): Promise<number> {
        let encounterInstance: any = await this.Find({
            where: { PatientId: checkoutInfo.PatientId, AppointmentId: checkoutInfo.AppointmentId }
        });
        if (encounterInstance) {
            let encounter = this.GetAttribute(encounterInstance);
            encounter.DischargeDate = new Date();
            encounter.EncounterStatusId = 2; //EncounterStatus.Checkout
            encounter.IsLatest = false;
            await this.SaveOrUpdate(encounter);
        }
        return 0;
    }

    public async GetEncounterIdByFilter(req: BaseRequest): Promise<number> {
        let encounterId: number = -1;
        let filterInfo = req.Data;
        let encounterInstance: any = await this.Find({
            where: {
                PatientId: filterInfo.PatientId,
                AppointmentId: filterInfo.AppointmentId,
                EncounterTypeId: filterInfo.EncounterTypeId || 1,  //default EncounterType.OP
                //AdmissionRequestId:filterInfo.AdmissionRequestId
                //, IsLatest: 1
            },
            attributes: ['Id']
        });
        if (encounterInstance) {
            let encounter = this.GetAttribute(encounterInstance);
            encounterId = encounter.Id;
        }
        return encounterId;
    }

    public async GetEncounterIdByAdmissionRequest(req: BaseRequest): Promise<number> {
        let encounterId: number = -1;
        let filterInfo = req.Data;
        let encounterInstance: any = await this.Find({
            where: {
                PatientId: filterInfo.PatientId,
                // AppointmentId: filterInfo.AppointmentId,
                EncounterTypeId: filterInfo.EncounterTypeId || 2,  //default EncounterType.OP
                AdmissionRequestId: filterInfo.AdmissionRequestId
                //, IsLatest: 1
            },
            attributes: ['Id']
        });
        if (encounterInstance) {
            let encounter = this.GetAttribute(encounterInstance);
            encounterId = encounter.Id;
        }
        return encounterId;
    }

    public async GetListofEncounters(req: BaseRequest):
        Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                WardId: req.Id
            },
            attributes: ['Id']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.Id);
        });
        return result;
    }

    public setIDValidation(apiReq?: ApiRequest<EncounterFilters>)
        : ApiRequest<EncounterFilters> { // is only validation for Id
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterFilters.Id:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.WardId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.DepartmentId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.DoctorId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.PatientId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.EncounterTypeId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.RoomId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.GuarantorTypeId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.GuarantorId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
                case EncounterFilters.BedId:
                    if (param.Value === 0) param.Value = -12345;
                    break;
            }
        });
        return apiReq;
    }

    public async GetAdmissionDate(req: BaseRequest): Promise<any> {
        let CurrentDate = moment().toDate();
        let lastreqdate = moment(req.Data.TransactionDate).toDate();
        lastreqdate.setHours(CurrentDate.getHours());
        lastreqdate.setMinutes(CurrentDate.getMinutes());
        lastreqdate.setSeconds(CurrentDate.getSeconds());
        if (req.Data.TransactionDate) {
            let frmDate = moment(req.Data.TransactionDate).format('YYYY-MM-DD 00:00:00');
            let toDate = moment(req.Data.TransactionDate).format('YYYY-MM-DD 23:59:59');
            let maxpidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('AdmissionDate')), 'AdmissionDate'],
                ],
                where: {
                    AdmissionDate: { '$gt': frmDate, '$lte': toDate }
                }
            });
            if (maxpidInstance) {
                let patient: any = this.GetAttribute(maxpidInstance);
                let lastreqdbdate = patient['AdmissionDate'];
                if (lastreqdbdate) {
                    lastreqdate = lastreqdbdate;
                }
            }
        }
        return lastreqdate;
    }

    public async GetEncounters(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        apiReq = this.setIDValidation(apiReq);

        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        // let patientGuarantorWhere: WhereOptions<any> = {};
        let patientCertificateWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientCertificate: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let WardWhere: WhereOptions<any> = {};
        let IsWardSearch: boolean = false;
        let issortbyadmissiondate = false;
        let issortbydischargedate = false;
        let issortbycreateddate = false;
        let attributes: any = {};
        let issortbyipnumber = false;
        attributes['include'] = [];

        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false });
        include.push({ model: this.Models.Remark, attributes: ['Remarks'], as: 'VisitReason', required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push({
            model: this.Models.Diagnosis, as: 'Diagnosis', attributes: ['DiagnosisName', 'Code'], required: false,
            include: [this.GetReference('DiagnosisVersion')]
        });
        include.push({
            model: this.Models.Diagnosis, as: 'Diagnosis2', attributes: ['DiagnosisName', 'Code'], required: false,
            include: [this.GetReference('DiagnosisVersion')]
        });
        include.push({
            model: this.Models.Diagnosis, as: 'Diagnosis3', attributes: ['DiagnosisName', 'Code'], required: false,
            include: [this.GetReference('DiagnosisVersion')]
        });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.LocationMaster, attributes: ['LocationName'], required: false });
        // include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.Guarantor, required: false,
            include: [this.GetReference('TPA')]
        });
        include.push(this.GetReference('EncounterType'));
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({ model: this.Models.AdmissionRequest, attributes: ['RequestIdentifier'], required: false });
        include.push({ model: this.Models.EncounterGuarantor, required: false });
        include.push({
            model: this.Models.User, as: 'Created', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                'PhotoPath', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Assignee', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ClinicalStaff', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.B2BCustomerMaster, required: false });
        include.push({ model: this.Models.Department, as: 'DischargeDepartment', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Appointment, required: false });
        include.push({
            model: this.Models.UserTeam, required: false,
            include: [this.GetReference('Team')]
        });
        include.push({
            model: this.Models.PromotionalScheme, attributes: ['Id', 'PromotionSchemeName', 'PromotionSchemeCode'],
            required: false,
            include: [
                {
                    model: this.Models.PromotionalSchemeDetail,
                    required: false,
                },
            ]
        });
        include.push({ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false });
        include.push({ model: this.Models.PatientDischargeEvent, required: false });
        include.push({ model: this.Models.Referral, attributes: ['ReferralName', 'ReferralCode'], required: false });
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('TPA'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('AdmissionPriority'));
        include.push(this.GetReference('AdmissionRequestType'));
        include.push(this.GetReference('AdmissionStatus', ['Description', 'ColorCode']));
        include.push(this.GetReference('AppointmentStatus'));
        include.push(this.GetReference('AdmittingReason'));
        include.push(this.GetReference('VisitType'));
        include.push(this.GetReference('ReferralType'));
        include.push(this.GetReference('GuardianType'));
        include.push(this.GetReference('DischargeType'));
        include.push(this.GetReference('BillingStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case EncounterFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case EncounterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case EncounterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EncounterFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case EncounterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterFilters.AttenderName:
                        where['AttenderName'] = param.Value;
                        break;
                   case EncounterFilters.PatientNameMRN:
    (patientWhere as any)[Op.or] = [
        { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
    ];
    isReqPatientSearch = true;
    break;
                    case EncounterFilters.BillNumber:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount'],
                            required: true,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3,
                                'BillNumber': param.Value
                            }, as: 'DischargedBills'
                        });
                        break;
                    case EncounterFilters.Phone:
    (patientWhere as any)[Op.or] = [{ 'Mobile': { [Op.like]: (param.Value || '') } }];
    isReqPatientSearch = true;
    break;
                    case EncounterFilters.RequestIdentifier:
    (where as any)[Op.or] = [{ 'AdmissionRequest.RequestIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
case EncounterFilters.VisitIdentifier:
    (where as any)[Op.or] = [{ 'VisitIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
                    case EncounterFilters.EncounterStatus:
                        where['EncounterStatusId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionDate:
                        where['AdmissionDate'] = { '$between': param.Value || '' };
                        issortbyadmissiondate = true;
                        break;
                    case EncounterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case EncounterFilters.From:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.To:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    // case EncounterFilters.GuarantorTypeId:
                    //     patientGuarantorWhere['GuarantorTypeId'] = param.Value;
                    //     isReqPatientGuarantor = true;
                    //     break;
                    // case EncounterFilters.GuarantorId:
                    //     patientGuarantorWhere['GuarantorId'] = param.Value;
                    //     isReqPatientGuarantor = true;
                    //     break;
                    // case EncounterFilters.MultiGuarantorType:
                    //     patientGuarantorWhere['GuarantorTypeId'] = { '$in': param.Value };
                    //     isReqPatientGuarantor = true;
                    //     break;
                   case EncounterFilters.AttenderPhone:
    (where as any)[Op.or] = [{ 'AttenderPhone': param.Value }];
    break;
                    case EncounterFilters.WardMasterTypeId:
                        WardWhere['WardMasterTypeId'] = param.Value;
                        IsWardSearch = true;
                        break;
                    case EncounterFilters.OpenEncounter:
    (where as any)[Op.or] = [
        { 'EncounterStatusId': 1 },
        { 'AdmissionStatusId': { [Op.in]: [2, 3, 4, 5] } }
    ];
    break;
                    case EncounterFilters.IncludePaymentDetails:
                        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': [1, 2],
                                'ReceiptStatusId': 1
                            }]
                        }, 'PaidAmount');
                        attributes.include.push(paidQry);
                        let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': [1, 2],
                                'ReceiptStatusId': 1
                            }]
                        }, 'AmountAdjusted');
                        attributes.include.push(adjustedQry);
                        break;
                    case EncounterFilters.IncludeBillPharmacyInfoDetails:
                        let opbillAmountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': [1, 5],
                                'PatientBillStatusId': 3
                            }]
                        }, 'OPBillAmount');
                        attributes.include.push(opbillAmountQry);
                        let pharmacybillAmountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 4,
                                'PatientBillStatusId': 3
                            }]
                        }, 'PharmacyBillAmount');
                        attributes.include.push(pharmacybillAmountQry);
                        break;
                    case EncounterFilters.IncludeBillDetails:
                        let dbtQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'IsPharmacyReceipt': 0,
                                'ReceiptStatusId': 1
                            }]
                        }, 'Debit');
                        attributes.include.push(dbtQry);
                        let tdsQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('TDSAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'ReceiptStatusId': 1
                            }]
                        }, 'TDS');
                        attributes.include.push(tdsQry);
                        let disQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('Disallowance'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'ReceiptStatusId': 1
                            }]
                        }, 'Disallowance');
                        attributes.include.push(disQry);
                        let billAmountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'BillAmount');
                        attributes.include.push(billAmountQry);
                        let billDiscountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillDiscount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'DiscountAmount');
                        attributes.include.push(billDiscountQry);
                        let billRoundoffQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('RoundOffValue'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'RoundOffValue');
                        attributes.include.push(billRoundoffQry);
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount', 'RoundOffValue',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount', 'OTRegisterId'],
                            required: false,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3
                            }, as: 'FinalBills'
                        });
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount',
                                'RoundOffValue', 'PaidAmount', 'OTRegisterId'],
                            required: false,
                            where: {
                                'Status': 1,
                                'BillTypeId': [2, 3],
                                'PatientBillStatusId': 3,
                                'IsPharmacyBill': true,
                                'PharmacySaleTypeId': { '$gt': '0' }
                            }, as: 'PharmacyBills'
                        });
                        let billPackageInclusionQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('PackageAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'InclusionAmount');
                        attributes.include.push(billPackageInclusionQry);
                        let billPackageExclusionQry = this.GetSelectQuery(this.Models.PatientBillPackageSummary, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('ExclusionAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'ExclusionAmount');
                        attributes.include.push(billPackageExclusionQry);
                        let billPackageDiscountQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('DiscountAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'PackageDiscountAmount');
                        attributes.include.push(billPackageDiscountQry);
                        break;
                    case EncounterFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case EncounterFilters.IncludePatientCertifiate:
                        include.push({
                            model: this.Models.PatientCertificate, where: patientCertificateWhere, required: isReqPatientCertificate,
                            include: [
                                this.GetReference('CertificateStatus')
                            ]
                        });
                        break;
                    case EncounterFilters.CertificateStatusId:
                        patientCertificateWhere['CertificateStatusId'] = param.Value;
                        isReqPatientCertificate = true;
                        break;
                    case EncounterFilters.DischargeTypeId:
                        where['DischargeTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AppointmentId:
                        where['AppointmentId'] = param.Value;
                        break;
                    case EncounterFilters.BedBoardAdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IncludeDoctors:
                        include.push({ model: this.Models.EncounterDoctor, required: false });
                        break;
                    case EncounterFilters.IsBillLock:
                        where['IsBillLock'] = param.Value;
                        break;
                    case EncounterFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IsReadmission:
                        where['IsReadmission'] = param.Value;
                        break;
                    case EncounterFilters.IsPaidVisit:
                        where['IsPaidVisit'] = param.Value;
                        break;
                    case EncounterFilters.FreeVisit:
                        where['FreeVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsEstimatedBill:
                        where['IsEstimatedBill'] = param.Value;
                        break;
                    case EncounterFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case EncounterFilters.IsSurgery:
                        where['IsSurgery'] = param.Value;
                        break;
                    case EncounterFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case EncounterFilters.IsRegCumBill:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount'],
                            required: false,
                            where: {
                                'Status': 1,
                                'PatientBillStatusId': 3,
                                'IsRegCumBill': 1
                            }, as: 'IsRegCumBill'
                        });
                        break;
                    case EncounterFilters.IsAdditionalVisit:
                        where['IsAdditionalVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsBillModified:
                        where['IsBillModified'] = param.Value;
                        break;
                    case EncounterFilters.IsLatest:
                        where['IsLatest'] = param.Value;
                        break;
                    case EncounterFilters.GenderId:
                        patientWhere['GenderId'] = param.Value;
                        isReqPatientSearch = true;
                        break;
                    case EncounterFilters.VisitTypeId:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterFilters.OtherSelfReferralId:
                        where['ReferralId'] = { '$gt': param.Value };
                        break;
                    case EncounterFilters.ReferralTypeId:
                        where['ReferralTypeId'] = param.Value;
                        break;
                    case EncounterFilters.OnlyDiagnosis:
                        where['DiagnosisId'] = { '$gt': param.Value };
                        break;
                    case EncounterFilters.IsMLC:
                        where['IsMLC'] = param.Value;
                        break;
                    case EncounterFilters.ISMRDReturn:
                        where['ISMRDReturn'] = param.Value;
                        break;
                    case EncounterFilters.FromAdmandToDisc:
    (where as any)[Op.or] = [
        { 'AdmissionDate': { [Op.between]: param.Value } },
        { 'DischargeDate': { [Op.between]: param.Value } },
    ];
    break;
                    case EncounterFilters.DischargeDate:
                        where['DischargeDate'] = { '$between': param.Value || '' };
                        issortbydischargedate = true;
                        break;
                    case EncounterFilters.BillingStatusId:
                        where['BillingStatusId'] = param.Value;
                        break;
                    case EncounterFilters.PatientTypeId:
                        patientWhere['PatientTypeId'] = param.Value;
                        isReqPatientSearch = true;
                        break;
                    case EncounterFilters.IsDayCare:
                        where['IsDayCare'] = param.Value;
                        break;
                    case EncounterFilters.IsEmergencyVisit:
                        where['IsEmergencyVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsFromDayCare:
                        where['IsFromDayCare'] = param.Value;
                        break;
                    case EncounterFilters.IPnumsort:
                        issortbyipnumber = param.Value;
                        break;
                    case EncounterFilters.SortByCreated:
                        issortbycreateddate = param.Value;
                        break;
                    case EncounterFilters.RemarkId:
                        where['RemarkId'] = param.Value;
                        break;
                    case EncounterFilters.NotSelfRefType:
                        where['ReferralTypeId'] = { '$ne': param.Value };
                        break;
                    case EncounterFilters.NotDepartmentId:
                        where['DepartmentId'] = { '$ne': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City', 'AlternateMobileNum',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email', 'RemarkId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
            { model: this.Models.Remark, attributes: ['Remarks'], required: false }]
        });
        // include.push({
        //     model: this.Models.PatientGuarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId', 'GuarantorLetterNo', 'EmployeeId'],
        //     where: patientGuarantorWhere,
        //     required: isReqPatientGuarantor,
        //     include: [this.GetReference('GuarantorType', ['Description', 'ColorCode']), this.GetReference('Tpa')]
        // });
        let WardQry: any = {
            model: this.Models.WardMaster,
            attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            where: WardWhere,
            required: IsWardSearch
        };
        include.push(WardQry);
        if (issortbyadmissiondate)
            order.push(['AdmissionDate', 'DESC']);
        if (issortbyipnumber)
            order.push(['VisitIdentifier', 'DESC']);
        if (issortbydischargedate)
            order.push(['DischargeDate', 'DESC']);
        if (issortbycreateddate)
            order.push(['CreatedAt', 'DESC']);

        // order.push(['AdmissionDate', 'DESC']);
        // order.push(['DischargeDate', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });

    }

    public async GetMinEncounters(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        // let patientGuarantorWhere: WhereOptions<any> = {};
        // let isReqPatientSearch: boolean = false;
        // let isReqPatientGuarantor: boolean = false;
        let include: Array<IncludeOptions> = [];
        let patientCertificateWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientCertificate: boolean = false;
        let order: Array<any> = [];
        // let WardWhere: WhereOptions<any> = {};
        // let IsWardSearch: boolean = false;
        // let issortbyadmissiondate = false;
        // let issortbydischargedate = false;
        // let attributes: any = {};
        // attributes['include'] = [];

        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('EncounterType'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                'PhotoPath', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Appointment, required: false });
        include.push(this.GetReference('AdmissionStatus', ['Description', 'ColorCode']));
        //include.push(this.GetReference('AppointmentStatus'));
        include.push(this.GetReference('VisitType'));
        include.push(this.GetReference('BillingStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case EncounterFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case EncounterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case EncounterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EncounterFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case EncounterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterFilters.AttenderName:
                        where['AttenderName'] = param.Value;
                        break;
                case EncounterFilters.PatientNameMRN:
    (patientWhere as any)[Op.or] = [
        { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
        { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
    ];
    isReqPatientSearch = true;
    break;
                    case EncounterFilters.Phone:
    (patientWhere as any)[Op.or] = [{ 'Mobile': { [Op.like]: (param.Value || '') } }];
    isReqPatientSearch = true;
    break;
case EncounterFilters.RequestIdentifier:
    (where as any)[Op.or] = [{ 'AdmissionRequest.RequestIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
case EncounterFilters.VisitIdentifier:
    (where as any)[Op.or] = [{ 'VisitIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
                    case EncounterFilters.EncounterStatus:
                        where['EncounterStatusId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    // case EncounterFilters.AdmissionDate:
                    //     where['AdmissionDate'] = { '$between': param.Value || '' };
                    //     issortbyadmissiondate = true;
                    //     break;
                    case EncounterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case EncounterFilters.From:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.To:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    // case EncounterFilters.GuarantorTypeId:
                    //     patientGuarantorWhere['GuarantorTypeId'] = param.Value;
                    //     isReqPatientGuarantor = true;
                    //     break;
                    // case EncounterFilters.GuarantorId:
                    //     patientGuarantorWhere['GuarantorId'] = param.Value;
                    //     isReqPatientGuarantor = true;
                    //     break;
                    // case EncounterFilters.MultiGuarantorType:
                    //     patientGuarantorWhere['GuarantorTypeId'] = { '$in': param.Value };
                    //     isReqPatientGuarantor = true;
                    //     break;
                    case EncounterFilters.AttenderPhone:
    (where as any)[Op.or] = [{ 'AttenderPhone': param.Value }];
    break;
// case EncounterFilters.WardMasterTypeId:
//     WardWhere['WardMasterTypeId'] = param.Value;
//     IsWardSearch = true;
//     break;
case EncounterFilters.OpenEncounter:
    (where as any)[Op.or] = [
        { 'EncounterStatusId': 1 },
        { 'AdmissionStatusId': { [Op.in]: [2, 3, 4, 5] } }
    ];
    break;
                    case EncounterFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case EncounterFilters.DischargeTypeId:
                        where['DischargeTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AppointmentId:
                        where['AppointmentId'] = param.Value;
                        break;
                    case EncounterFilters.BedBoardAdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IncludeDoctors:
                        include.push({
                            model: this.Models.EncounterDoctor,
                            required: false,
                            include: [
                                { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                                {
                                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                                        'PhotoPath', 'SignPath'],
                                    required: false,
                                    include: [
                                        this.GetReference('Title')
                                    ]
                                }]
                        });
                        break;
                    case EncounterFilters.IsBillLock:
                        where['IsBillLock'] = param.Value;
                        break;
                    case EncounterFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IsReadmission:
                        where['IsReadmission'] = param.Value;
                        break;
                    case EncounterFilters.IsPaidVisit:
                        where['IsPaidVisit'] = param.Value;
                        break;
                    case EncounterFilters.FreeVisit:
                        where['FreeVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsEstimatedBill:
                        where['IsEstimatedBill'] = param.Value;
                        break;
                    case EncounterFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case EncounterFilters.IsSurgery:
                        where['IsSurgery'] = param.Value;
                        break;
                    case EncounterFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case EncounterFilters.IsAdditionalVisit:
                        where['IsAdditionalVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsBillModified:
                        where['IsBillModified'] = param.Value;
                        break;
                    case EncounterFilters.IsLatest:
                        where['IsLatest'] = param.Value;
                        break;
                    case EncounterFilters.GenderId:
                        patientWhere['GenderId'] = param.Value;
                        isReqPatientSearch = true;
                        break;
                    case EncounterFilters.VisitTypeId:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterFilters.ReferralTypeId:
                        where['ReferralTypeId'] = param.Value;
                        break;
                    case EncounterFilters.OnlyDiagnosis:
                        where['DiagnosisId'] = { '$gt': param.Value };
                        break;
                    case EncounterFilters.IsMLC:
                        where['IsMLC'] = param.Value;
                        break;
                    case EncounterFilters.ISMRDReturn:
                        where['ISMRDReturn'] = param.Value;
                        break;
                   case EncounterFilters.FromAdmandToDisc:
    (where as any)[Op.or] = [
        { 'AdmissionDate': { [Op.between]: param.Value } },
        { 'DischargeDate': { [Op.between]: param.Value } },
    ];
    break;
                    // case EncounterFilters.DischargeDate:
                    //     where['DischargeDate'] = { '$between': param.Value || '' };
                    //     issortbydischargedate = true;
                    //     break;
                    case EncounterFilters.BillingStatusId:
                        where['BillingStatusId'] = param.Value;
                        break;
                    case EncounterFilters.PatientTypeId:
                        patientWhere['PatientTypeId'] = param.Value;
                        isReqPatientSearch = true;
                        break;
                    case EncounterFilters.IncludePatientCertifiate:
                        include.push({
                            model: this.Models.PatientCertificate, where: patientCertificateWhere, required: isReqPatientCertificate,
                            include: [
                                this.GetReference('CertificateStatus')
                            ]
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName',
                'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2',
                'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath',
                'MaritalStatusId', 'LandLine', 'Email', 'RemarkId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
            { model: this.Models.Remark, attributes: ['Remarks'], required: false }]
        });
        // include.push({
        //     model: this.Models.PatientGuarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId', 'GuarantorLetterNo', 'EmployeeId'],
        //     where: patientGuarantorWhere,
        //     required: isReqPatientGuarantor,
        //     include: [this.GetReference('GuarantorType', ['Description', 'ColorCode']), this.GetReference('Tpa')]
        // });
        include.push({
            model: this.Models.WardMaster,
            attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            required: false
        });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['GuarantorName'],
            required: false
        });
        // let WardQry: any = {
        //     model: this.Models.WardMaster,
        //     attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
        //     where: WardWhere,
        //     required: IsWardSearch
        // };
        // include.push(WardQry);

        // if (issortbyadmissiondate)
        //     order.push(['AdmissionDate', 'DESC']);

        // if (issortbydischargedate)
        //     order.push(['DischargeDate', 'DESC']);
        // order.push(['AdmissionDate', 'DESC']);
        // order.push(['DischargeDate', 'DESC']);
        apiReq.Attributes = ['Id', 'DoctorName', 'AdmissionStatusId',
            'PatientId', 'VisitTypeId', 'EncounterTypeId',
            'AppointmentId', 'DoctorId', 'DepartmentId',
            'FacilityId', 'AdmissionDate',
            'GuarantorId', 'WardId',
            'BillingRemarks', 'BillingStatusId', 'VisitIdentifier', 'ReferralName'];
        order.push(['Id', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetIPAdmissionSummaryDoctor(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.IPSelfAdmission(req) });
        result.push({ Key: 1, Value: await this.IPInsuranceAdmission(req) });
        return result;
    }
    public async IPSelfAdmission(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let DepartmentGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: true,
        };
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
        };
        if (req.Data.DoctorId > 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId', 'AdmissionStatusId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    DoctorId: { '$eq': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$eq': 1 },
                    AdmissionStatusId: { '$ne': 1 }
                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let SelfCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    SelfCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'SelfCount': SelfCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId', 'AdmissionStatusId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    DoctorId: { '$gt': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$eq': 1 },
                    AdmissionStatusId: { '$ne': 1 }

                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let SelfCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    SelfCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'SelfCount': SelfCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }
        return DoctorGroup;
    }
    public async IPInsuranceAdmission(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let DepartmentGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: true,
        };
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
        };
        if (req.Data.DoctorId > 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId', 'AdmissionStatusId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    DoctorId: { '$eq': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$gt': 1 },
                    AdmissionStatusId: { '$ne': 1 }
                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let InsuranceCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    InsuranceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId', 'AdmissionStatusId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    DoctorId: { '$gt': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$gt': 1 },
                    AdmissionStatusId: { '$ne': 1 }

                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let InsuranceCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    InsuranceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }
        return DoctorGroup;
    }
    public async GetIPStatistics(req: BaseRequest): Promise<any> {
        let result: any = [];
        let OccupanceBO = BoFactory.GetBo(inpatientBO.BedOccupancyHistoryBo, this.Request);
        let wardRoomBedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        result.push({ Key: 1, Value: await this.EncounterCount(req) });
        result.push({ Key: 2, Value: await OccupanceBO.OccupancyCount(req) });
        result.push({ Key: 3, Value: await wardRoomBedBO.CapacityCount(req) });
        return result;
    }
    public async GetIPStatisticsByWard(req: BaseRequest): Promise<any> {
        let result: any = [];
        let transBo = BoFactory.GetBo(inpatientBO.BedTransferBo, this.Request);
        result.push({ Key: 1, Value: await this.EncounterCount(req) });
        result.push({ Key: 2, Value: await transBo.TransferCount(req) });
        return result;
    }
    public async EncounterCount(req: BaseRequest): Promise<any> {
        let WardGroup: { [id: number]: any[] } = {};
        let WardGroupJoin: any = {
            model: this.Models.WardMaster,
            required: true,
        };
        let admissionInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'WardId'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                // WardId: { '$eq': req.Data.WardId },
                FacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 2 }
            },
            include: [WardGroupJoin]
        });
        if (admissionInstance) {
            let groupbills = _.groupBy(admissionInstance, 'WardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AdmissionCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                AdmissionCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.WardId;
                    WardName = bills.WardMaster.WardName;
                    // GuarantorType = bills.GuarantorType.Description;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'AdmissionCount': AdmissionCount
                };
                WardGroup[WardId].push(info);
            }
        }

        let dischargeInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'WardId'],
            where: {
                DischargeDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                // WardId: { '$eq': req.Data.WardId },
                FacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 6 }
            },
            include: [WardGroupJoin]
        });
        if (dischargeInstance) {
            let groupbills = _.groupBy(dischargeInstance, 'WardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let DischargeCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                DischargeCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.WardId;
                    WardName = bills.WardMaster.WardName;
                    // GuarantorType = bills.GuarantorType.Description;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'DischargeCount': DischargeCount
                };
                WardGroup[WardId].push(info);
            }
        }

        let deathInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'WardId', 'DischargeTypeId'],
            where: {
                DischargeDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                // WardId: { '$eq': req.Data.WardId },
                FacilityId: req.Data.FacilityId,
                DischargeTypeId: 2
                // AdmissionStatusId: { '$eq': 6 }
            },
            include: [WardGroupJoin]
        });
        if (deathInstance) {
            let groupbills = _.groupBy(deathInstance, 'WardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let DeathCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                DeathCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.WardId;
                    WardName = bills.WardMaster.WardName;
                    // GuarantorType = bills.GuarantorType.Description;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'DeathCount': DeathCount
                };
                WardGroup[WardId].push(info);
            }
        }

        return WardGroup;
    }
    public async IPStatisticsWithDate(req: BaseRequest): Promise<any> {
        let EncounterCount: { [id: number]: any[] } = {};
        let admissionInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'AdmissionDate'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                // WardId: { '$eq': req.Data.WardId },
                FacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 2 }
            },
        });
        if (admissionInstance) {
            let groupbills = _.groupBy(admissionInstance, 'AdmissionDate');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AdmissionCount: number = 0;
                let AdmDate: any = '';
                let StatusId: number;
                AdmissionCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AdmDate = bills.AdmissionDate;
                    StatusId = 1;
                    EncounterCount[StatusId] = EncounterCount[StatusId] || [];
                    // GuarantorType = bills.GuarantorType.Description;
                }
                let info = {
                    'AdmDate': AdmDate,
                    'StatusId': StatusId,
                    'AdmissionCount': AdmissionCount
                };
                EncounterCount[StatusId].push(info);
            }
        }

        let dischargeInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'DischargeDate'],
            where: {
                DischargeDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                DischargeTypeId: { '$ne': 2 },
                FacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 6 }
            },
        });
        if (dischargeInstance) {
            let groupbills = _.groupBy(dischargeInstance, 'DischargeDate');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let DischargeCount: number = 0;
                let DischargeDate: number = 0;
                let StatusId: number;
                DischargeCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    DischargeDate = bills.DischargeDate;
                    StatusId = 2;
                    EncounterCount[StatusId] = EncounterCount[StatusId] || [];
                }
                let info = {
                    'DischargeDate': DischargeDate,
                    'DischargeCount': DischargeCount,
                    'StatusId': StatusId,
                };
                EncounterCount[StatusId].push(info);
            }
        }
        let deathInstance: any = await this.FindAll({
            attributes: ['AdmissionStatusId', 'DeathDate'],
            where: {
                DeathDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                DischargeTypeId: { '$eq': 2 },
                FacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 6 }
            },
        });
        if (deathInstance) {
            let groupbills = _.groupBy(deathInstance, 'DeathDate');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let DeathCount: number = 0;
                let DeathDate: number = 0;
                let StatusId: number;
                DeathCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    DeathDate = bills.DeathDate;
                    StatusId = 3;
                    EncounterCount[StatusId] = EncounterCount[StatusId] || [];
                }
                let info = {
                    'DeathDate': DeathDate,
                    'DeathCount': DeathCount,
                    'StatusId': StatusId,
                };
                EncounterCount[StatusId].push(info);
            }
        }

        return EncounterCount;
    }
    public async GetOutpatientSummaryDoctor(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OutpatientSelf(req) });
        result.push({ Key: 1, Value: await this.OutpatientInsurance(req) });
        return result;
    }
    public async OutpatientSelf(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let DepartmentGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: true,
        };
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
        };
        if (req.Data.DoctorId > 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    DoctorId: { '$eq': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$eq': 1 }
                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let SelfCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    SelfCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'SelfCount': SelfCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    DoctorId: { '$gt': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$eq': 1 }

                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let SelfCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    SelfCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'SelfCount': SelfCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }
        return DoctorGroup;
    }
    public async OutpatientInsurance(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let DepartmentGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: true,
        };
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
        };
        if (req.Data.DoctorId > 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    DoctorId: { '$eq': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$gt': 1 }
                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let InsuranceCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    InsuranceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let selfadmissionInstance: any = await this.FindAll({
                attributes: ['DepartmentId', 'DoctorId', 'GuarantorId', 'GuarantorTypeId'],
                where: {
                    AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    DoctorId: { '$gt': req.Data.DoctorId },
                    FacilityId: req.Data.FacilityId,
                    GuarantorTypeId: { '$gt': 1 }

                },
                include: [DoctorGroupJoin, DepartmentGroupJoin, GuarantorGroupJoin]
            });
            if (selfadmissionInstance) {
                let groupbills = _.groupBy(selfadmissionInstance, 'DoctorId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let InsuranceCount: number = 0;
                    let DepartmentId: number = 0;
                    let DoctorId: number = 0;
                    let DoctorName: string = '';
                    let GuarantorName: string = '';
                    let DepartmentName: string = '';
                    let GuarantorType: string = '';
                    InsuranceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DepartmentName = bills.Department.DepartmentName;
                        DepartmentId = bills.DepartmentId;
                        DoctorId = bills.DoctorId;
                        DoctorName = bills.Doctor;
                        GuarantorName = bills.Guarantor.GuarantorName;
                        // GuarantorType = bills.GuarantorType.Description;
                        DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    }
                    let info = {
                        'DepartmentId': DepartmentId,
                        'DoctorId': DoctorId,
                        'DoctorName': DoctorName,
                        'GuarantorType': GuarantorType,
                        'GuarantorName': GuarantorName,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }
        return DoctorGroup;
    }
    public async GetIPAdmissionSummaryInsurance(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.IPGuarantor(req) });
        return result;
    }
    public async IPGuarantor(req: BaseRequest): Promise<any> {
        let GuarantorGroup: { [id: number]: any[] } = {};
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
            include: [
                this.GetReference('GuarantorType')
            ]
        };

        let selfadmissionInstance: any = await this.FindAll({
            attributes: ['GuarantorId', 'GuarantorTypeId'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                GuarantorTypeId: { '$gt': 1 },
                // DoctorId: { '$eq': req.Data.DoctorId },
            },
            include: [GuarantorGroupJoin]
        });
        if (selfadmissionInstance) {
            let groupbills = _.groupBy(selfadmissionInstance, 'GuarantorId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let GuarantorCount: number = 0;
                let GuarantorId: number = 0;
                let GuarantorTypeId: number = 0;
                let GuarantorName: string = '';
                let GuarantorType: string = '';
                GuarantorCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    GuarantorId = bills.GuarantorId;
                    GuarantorTypeId = bills.GuarantorTypeId;
                    GuarantorName = bills.Guarantor.GuarantorName;
                    GuarantorType = bills.Guarantor.GuarantorType.Description;
                    GuarantorGroup[GuarantorId] = GuarantorGroup[GuarantorId] || [];
                }
                let info = {
                    'GuarantorId': GuarantorId,
                    'GuarantorTypeId': GuarantorTypeId,
                    'GuarantorType': GuarantorType,
                    'GuarantorName': GuarantorName,
                    'GuarantorCount': GuarantorCount
                };
                GuarantorGroup[GuarantorId].push(info);
            }
        }

        return GuarantorGroup;
    }
    public async GetOutpatientSummaryInsurance(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPGuarantor(req) });
        return result;
    }
    public async OPGuarantor(req: BaseRequest): Promise<any> {
        let GuarantorGroup: { [id: number]: any[] } = {};
        let GuarantorGroupJoin: any = {
            model: this.Models.Guarantor,
            attributes: ['GuarantorName', 'GuarantorTypeId'],
            required: true,
            include: [
                this.GetReference('GuarantorType')
            ]
        };

        let selfadmissionInstance: any = await this.FindAll({
            attributes: ['GuarantorId', 'GuarantorTypeId'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                FacilityId: req.Data.FacilityId,
                GuarantorTypeId: { '$gt': 1 },
                // DoctorId: { '$eq': req.Data.DoctorId },
            },
            include: [GuarantorGroupJoin]
        });
        if (selfadmissionInstance) {
            let groupbills = _.groupBy(selfadmissionInstance, 'GuarantorTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let GuarantorCount: number = 0;
                let GuarantorId: number = 0;
                let GuarantorTypeId: number = 0;
                let GuarantorName: string = '';
                let GuarantorType: string = '';
                GuarantorCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    GuarantorId = bills.GuarantorId;
                    GuarantorTypeId = bills.GuarantorTypeId;
                    GuarantorName = bills.Guarantor.GuarantorName;
                    GuarantorType = bills.Guarantor.GuarantorType.Description;
                    GuarantorGroup[GuarantorTypeId] = GuarantorGroup[GuarantorTypeId] || [];
                }
                let info = {
                    'GuarantorId': GuarantorId,
                    'GuarantorTypeId': GuarantorTypeId,
                    'GuarantorType': GuarantorType,
                    'GuarantorName': GuarantorName,
                    'GuarantorCount': GuarantorCount
                };
                GuarantorGroup[GuarantorTypeId].push(info);
            }
        }

        return GuarantorGroup;
    }
    public async GetDiagnosissummaryforIp(req: BaseRequest): Promise<any> {
        let DiagnosisGroup: { [id: number]: any[] } = {};
        let DiagnosisGroupJoin: any = {
            model: this.Models.Diagnosis, as: 'Diagnosis',
            attributes: ['DiagnosisName'],
            required: true,
        };

        let selfadmissionInstance: any = await this.FindAll({
            attributes: ['DiagnosisId'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
            },
            include: [DiagnosisGroupJoin]
        });
        if (selfadmissionInstance) {
            let groupbills = _.groupBy(selfadmissionInstance, 'DiagnosisId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let DiagnosisId: number = 0;
                let DiagnosisName: string = '';
                let DiagnosisCount: number = 0;
                DiagnosisCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    DiagnosisId = bills.DiagnosisId;
                    DiagnosisName = bills.Diagnosis.DiagnosisName;
                    DiagnosisGroup[DiagnosisId] = DiagnosisGroup[DiagnosisId] || [];
                }
                let info = {
                    'DiagnosisId': DiagnosisId,
                    'DiagnosisName': DiagnosisName,
                    'DiagnosisCount': DiagnosisCount
                };
                DiagnosisGroup[DiagnosisId].push(info);
            }
        }

        return DiagnosisGroup;
    }
    public async GetAdditionalVisitwithoutIP(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        let EncountersInfo: any = {};
        let ResultEncountersInfo: any = {
            Data: []
        };
        EncountersInfo = await this.GetEncounters(apiReq);
        if (EncountersInfo.Data) {
            for (let i = 0; i < EncountersInfo.Data.length; i++) {
                let encounter = EncountersInfo.Data[i];
                let IsAlreadyIPCreated = 0;
                if (encounter && encounter.PatientId) {
                    IsAlreadyIPCreated = await this.PatientIsIP(encounter.PatientId);
                    if (IsAlreadyIPCreated === 0) {
                        ResultEncountersInfo.Data.push(encounter);
                    }
                }
            }
        }
        return ResultEncountersInfo;
    }

    public async PatientIsIP(ePatientId: number): Promise<number> {
        let resultdata = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('EncounterId')), 'EncounterId'],
            ],
            where: {
                Status: 1,
                PatientId: ePatientId,
                EncounterTypeId: 2,
                DischargeDate: null
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastServiceItemId = patient['EncounterId'];
            if (lastServiceItemId) resultdata = lastServiceItemId;
        }

        return resultdata;
    }


    public async GetEncounterAdvances(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let patientGuarantorWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientGuarantor: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let WardWhere: WhereOptions<any> = {};
        let IsWardSearch: boolean = false;

        let attributes: any = {};
        attributes['include'] = [];

        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Remark, attributes: ['Remarks'], as: 'VisitReason', required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push({ model: this.Models.Diagnosis, as: 'Diagnosis', attributes: ['DiagnosisName', 'Code'], required: false });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push(this.GetReference('EncounterType'));
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case EncounterFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case EncounterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case EncounterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EncounterFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case EncounterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterStatus:
                        where['EncounterStatusId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionDate:
                        where['AdmissionDate'] = { '$between': param.Value || '' };
                        break;
                    case EncounterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case EncounterFilters.From:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.To:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorTypeId:
                        patientGuarantorWhere['GuarantorTypeId'] = param.Value;
                        isReqPatientGuarantor = true;
                        break;
                    case EncounterFilters.GuarantorId:
                        patientGuarantorWhere['GuarantorId'] = param.Value;
                        isReqPatientGuarantor = true;
                        break;
                    case EncounterFilters.MultiGuarantorType:
                        patientGuarantorWhere['GuarantorTypeId'] = { '$in': param.Value };
                        isReqPatientGuarantor = true;
                        break;
                    case EncounterFilters.IncludeBillDetails:
                        let dbtQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'IsPharmacyReceipt': 0,
                                'ReceiptStatusId': 1
                            }]
                        }, 'Debit');
                        attributes.include.push(dbtQry);
                        break;
                    case EncounterFilters.IsBillLock:
                        where['IsBillLock'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientPaymentDetails,
            required: false,
            where: {
                'Status': 1,
                'EncounterTypeId': { '$in': [2, 5] },
                'IsPharmacyReceipt': 0,
                'ReceiptStatusId': 1,
                'ReceiptTypeId': { '$in': [1, 6] },
            },
        });
        include.push({
            model: this.Models.PatientRefund,
            required: false,
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'RefundStatusId': 1,
                'RefundTypeId': 1
            },
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        // include.push({
        //     model: this.Models.PatientGuarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
        //     where: patientGuarantorWhere,
        //     required: isReqPatientGuarantor,
        //     include: [this.GetReference('GuarantorType', ['Description', 'ColorCode']), this.GetReference('Tpa')]
        // });
        let WardQry: any = {
            model: this.Models.WardMaster,
            attributes: ['WardName', 'WardMasterTypeId'],
            where: WardWhere,
            required: IsWardSearch
        };
        include.push(WardQry);
        order.push(['AdmissionDate', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });

    }

    public async PrintEncounter(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounters(apiReq);
        let Data = data.Data[0];
        let EncounterGuardianTypeId = 0;
        EncounterGuardianTypeId = Data.GuardianTypeId;
        let EncounterGuardianType: any = [];
        if (EncounterGuardianTypeId > 0) {
            let GuardianTypeReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: EncounterGuardianTypeId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'GuardianType' }]
            };
            let EncounterGuardianTypeBO = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
            let EncounterGuardianTypeData = await EncounterGuardianTypeBO.GetReferenceValues(GuardianTypeReq);
            EncounterGuardianType = EncounterGuardianTypeData.Data[0];
        }
        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let PatientKinBo = BoFactory.GetBo(bo.PatientKinBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let GuardianTypeId = 0;
        GuardianTypeId = patientData.GuardianTypeId;
        let GuardianType: any = [];
        if (GuardianTypeId > 0) {
            let GuardianTypeReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: GuardianTypeId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'GuardianType' }]
            };
            let GuardianTypeBO = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
            let GuardianTypeData = await GuardianTypeBO.GetReferenceValues(GuardianTypeReq);
            GuardianType = GuardianTypeData.Data[0];
        }
        let kinReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: Data.PatientId }]
        };
        let patientkinData = await PatientKinBo.GetPatientKins(kinReq);

        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
            { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let PatientPaymentReceipt = Array();
        let AmountPaid = 0;
        let ReceiptNumber = '';
        PatientPaymentDetailsData.Data.forEach((Detail) => {
            AmountPaid = (AmountPaid) + (Detail.AmountPaid);
            ReceiptNumber += Detail.ReceiptNumber + ',';
            PatientPaymentReceipt.push(Detail.Id);
        });

        let OTReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.EncounterId, Value: req.Id },
            { Key: SurgeryEntryFilters.PatientId, Value: Data.PatientId }
            ]
        };
        let surgeryentryBo = BoFactory.GetBo(OTBO.SurgeryEntryBo, this.Request);
        let OtRegisterData = await surgeryentryBo.GetSurgeryEntrys(OTReq);
        let OTProcedure = '';
        for (var i = 0; i < OtRegisterData.Data.length; i++) {
            let OtRegister = OtRegisterData.Data[i];
            let ProcedureBo = BoFactory.GetBo(clinicalMasterBo.ProcedureBo, this.Request);
            let ProcedureId = OtRegister.ProcedureId;
            let Procedure = '';
            if (ProcedureId > 0) {
                let Procedure1Req = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: ProcedureFilters.Id, Value: ProcedureId }]
                };

                let ProcedureData = await ProcedureBo.GetProcedures(Procedure1Req);
                Procedure = ProcedureData.Data[0].ProcedureName;
            }

            if (Procedure !== '' && Procedure !== null && Procedure !== undefined) {
                OTProcedure += Procedure + ' , ';
            }
        }

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        let info = {
            Patient: patientData,
            Encounter: Data,
            PatientKin: patientkinData[0],
            PatientPaymentReceipt: PatientPaymentReceipt,
            Preferences: printPreferencesData,
            AmountPaid: AmountPaid,
            GuardianType: GuardianType,
            EncounterGuardianType: EncounterGuardianType,
            ReceiptNumber: ReceiptNumber,
            OTProcedure: OTProcedure
        };
        let pdfOption: any = null;
        let key = 'Encounter';
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

    public async PrintEncounter5(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounters(apiReq);
        let Data = data.Data[0];
        let EncounterGuardianTypeId = 0;
        EncounterGuardianTypeId = Data.GuardianTypeId;
        let EncounterGuardianType: any = [];
        if (EncounterGuardianTypeId > 0) {
            let GuardianTypeReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: EncounterGuardianTypeId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'GuardianType' }]
            };
            let EncounterGuardianTypeBO = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
            let EncounterGuardianTypeData = await EncounterGuardianTypeBO.GetReferenceValues(GuardianTypeReq);
            EncounterGuardianType = EncounterGuardianTypeData.Data[0];
        }
        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let PatientKinBo = BoFactory.GetBo(bo.PatientKinBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let GuardianTypeId = 0;
        GuardianTypeId = patientData.GuardianTypeId;
        let GuardianType: any = [];
        if (GuardianTypeId > 0) {
            let GuardianTypeReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: GuardianTypeId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'GuardianType' }]
            };
            let GuardianTypeBO = BoFactory.GetBo(appMgBo.ReferenceValueBo, this.Request);
            let GuardianTypeData = await GuardianTypeBO.GetReferenceValues(GuardianTypeReq);
            GuardianType = GuardianTypeData.Data[0];
        }
        let kinReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: Data.PatientId }]
        };
        let patientkinData = await PatientKinBo.GetPatientKins(kinReq);

        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
            { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let PatientPaymentReceipt = Array();
        let AmountPaid = 0;
        let ReceiptNumber = '';
        PatientPaymentDetailsData.Data.forEach((Detail) => {
            AmountPaid = (AmountPaid) + (Detail.AmountPaid);
            ReceiptNumber += Detail.ReceiptNumber + ',';
            PatientPaymentReceipt.push(Detail.Id);
        });

        let OTReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.EncounterId, Value: req.Id },
            { Key: SurgeryEntryFilters.PatientId, Value: Data.PatientId }
            ]
        };
        let surgeryentryBo = BoFactory.GetBo(OTBO.SurgeryEntryBo, this.Request);
        let OtRegisterData = await surgeryentryBo.GetSurgeryEntrys(OTReq);
        let OTProcedure = '';
        for (var i = 0; i < OtRegisterData.Data.length; i++) {
            let OtRegister = OtRegisterData.Data[i];
            let ProcedureBo = BoFactory.GetBo(clinicalMasterBo.ProcedureBo, this.Request);
            let ProcedureId = OtRegister.ProcedureId;
            let Procedure = '';
            if (ProcedureId > 0) {
                let Procedure1Req = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: ProcedureFilters.Id, Value: ProcedureId }]
                };

                let ProcedureData = await ProcedureBo.GetProcedures(Procedure1Req);
                Procedure = ProcedureData.Data[0].ProcedureName;
            }

            if (Procedure !== '' && Procedure !== null && Procedure !== undefined) {
                OTProcedure += Procedure + ' , ';
            }
        }

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        let info = {
            Patient: patientData,
            Encounter: Data,
            PatientKin: patientkinData[0],
            PatientPaymentReceipt: PatientPaymentReceipt,
            Preferences: printPreferencesData,
            AmountPaid: AmountPaid,
            GuardianType: GuardianType,
            EncounterGuardianType: EncounterGuardianType,
            ReceiptNumber: ReceiptNumber,
            OTProcedure: OTProcedure
        };
        let pdfOption: any = null;
        let key = 'Encounter';
        if (req.Data) {
            key = 'admissionlabel5';
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.05in',
                    contents: '',
                },
                footer: {
                    height: '0in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',

                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };

        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOutpatientSummary(req: BaseRequest): Promise<any> {

        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let PatientReq = req;

        let EncounterData = await this.GetFacilityInfoDashBoard(PatientReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReq.Data.FacilityId);
        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            EncounterData: EncounterData,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'outpatientsummary';
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
    public async PrintPreviuosSlip(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounter = await this.GetEncounters(apiReq);
        let VisitData: any = encounter.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData = await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VisitData.FacilityId);
        let info = {
            VisitData: VisitData,
            Preferences: printPreferencesData
        };
        let key = 'previousopvisit';
        let pdfOption: any = null;
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

    public async PatientConsentPrint(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounters(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let PatientKinBo = BoFactory.GetBo(bo.PatientKinBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let kinReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: Data.PatientId }]
        };
        let patientkinData = await PatientKinBo.GetPatientKins(kinReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        let info = {
            Patient: patientData,
            Encounter: Data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'patientconsent';
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
    public async PrintIPAdmissionReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus
        };
        let pdfOption: any = null;
        let key = 'ipadmissionreport';
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
    public async PrintMLCPatientListReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus
        };
        let pdfOption: any = null;
        let key = 'mlcpatientlistreport';
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
    public async PrintDepartmentWiseStatisticsReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let EncountersData = data.Data[0];
        let deptEnc: any = [];
        let DepartmentStat: any = [];
        let GroupedBatchData = _.groupBy(data.Data, 'DepartmentId');

        for (let idx in GroupedBatchData) {
            let deptStats = {
                DepartmentName: '',
                NewCount: 0,
                FollowupCount: 0,
                TotOpCount: 0,
                AdmCount: 0,
                DisCount: 0
            };
            let grpDept = GroupedBatchData[idx];
            for (let ddx in grpDept) {
                deptEnc = grpDept[ddx];
                deptStats.DepartmentName = deptEnc.Department.DepartmentName;
                if (deptEnc.EncounterTypeId === 1) {
                    deptStats.TotOpCount++;
                }
                if (deptEnc.EncounterTypeId === 1 && deptEnc.VisitTypeId === 1) {
                    deptStats.NewCount++;
                }
                if (deptEnc.EncounterTypeId === 1 && deptEnc.VisitTypeId === 2) {
                    deptStats.FollowupCount++;
                }
                if (deptEnc.EncounterTypeId === 2 && deptEnc.AdmissionDate) {
                    deptStats.AdmCount++;
                }
                if (deptEnc.EncounterTypeId === 2 && deptEnc.DischargeDate) {
                    deptStats.DisCount++;
                }
                if (DepartmentStat.length === 0) {
                    DepartmentStat.push(deptStats);
                } else {
                    var valappended = 0;
                    DepartmentStat.forEach(function (item: any) {
                        if (deptStats.DepartmentName === item.DepartmentName) {
                            item.TotOpCount = deptStats.TotOpCount;
                            item.NewCount = deptStats.NewCount;
                            item.FollowupCount = deptStats.FollowupCount;
                            item.AdmCount = deptStats.AdmCount;
                            item.DisCount = deptStats.DisCount;
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        DepartmentStat.push(deptStats);
                }

            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            DepartmentStat: DepartmentStat,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
        };
        let pdfOption: any = null;
        let key = 'departmentwisestatisticsreport';
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
    public async PrintPatientListByDiagnosisReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DiagnosisName = apiReq.Data.DiagnosisName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DiagnosisName: DiagnosisName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus
        };
        let pdfOption: any = null;
        let key = 'patientlistbydiagnosis';
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
    public async PrintIPDischargeReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let DischargeType = apiReq.Data.DischargeType;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            DischargeType: DischargeType
        };
        let pdfOption: any = null;
        let key = 'ipdischargereport';
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
    public async PrintDeseasedPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'deseasedpatientreport';
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
    public async PrintOutPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'outpatientreport';
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
    public async PrintDayCareReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'daycarereport';
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
    public async PrintMLCReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'mlcreport';
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
    public async PrintEmergencyPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'emergencypatientreport';
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
    public async PrintDayCaretoAdmissionPatientReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'daycaretoadmissionpatientreport';
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
    public async PrintIPAdmissionInsuranceReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let WardName = apiReq.Data.WardName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            WardName: WardName
        };
        let pdfOption: any = null;
        let key = 'ipadmissioninsurancereport';
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

    public async PrintIPPatientReferralReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let ReferralType = apiReq.Data.ReferralType;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            ReferralType: ReferralType,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus
        };
        let pdfOption: any = null;
        let key = 'ippatientreferralreport';
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
    public async PrintOPPatientReferralReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let ReferralType = apiReq.Data.ReferralType;
        let GuarantorName = apiReq.Data.GuarantorName;
        let ReferralName = apiReq.Data.ReferralName;
        let EncountersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            ReferralType: ReferralType,
            GuarantorName: GuarantorName,
            ReferralName: ReferralName
        };
        let pdfOption: any = null;
        let key = 'oppatientreferralreport';
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
    public async PrintIPBillReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetIPPatientsBills(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let EncountersData = data.Data[0];
        let PatientIpBills: any = [];
        let TotalBillAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDueAmount: number = 0;
        let TotalPaidAmount: number = 0;
        Encounters.forEach((Encounter: any) => {
            let IpBillData = Encounter;
            let BillData = IpBillData.FinalBills[0];
            IpBillData.GrossAmount = parseFloat(BillData.BillAmount);
            IpBillData.BillDiscount = parseFloat(BillData.BillDiscount);
            IpBillData.NetAmount = (parseFloat(IpBillData.GrossAmount) - parseFloat(IpBillData.BillDiscount));
            IpBillData.DueAmt = parseFloat(BillData.OutStandingAmount) || 0;
            IpBillData.PaidAmount = parseFloat(BillData.PaidAmount) || 0;
            PatientIpBills.push(IpBillData);
        });
        for (let idx in PatientIpBills) {
            let item = PatientIpBills[idx];
            TotalBillAmount += item.GrossAmount;
            TotalDisAmount += item.BillDiscount;
            TotalNetAmount += item.NetAmount;
            TotalDueAmount += item.DueAmt;
            TotalPaidAmount += item.PaidAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            PatientIpBills: PatientIpBills,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            TotalBillAmount: TotalBillAmount,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDueAmount: TotalDueAmount,
            TotalPaidAmount: TotalPaidAmount
        };
        let pdfOption: any = null;
        let key = 'ipbillreport';
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
    public async DischargeSlipPrint(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonMedical) ? req.Data.nonMedical : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounters(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let PatientKinBo = BoFactory.GetBo(bo.PatientKinBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let kinReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: Data.PatientId }]
        };
        let patientkinData = await PatientKinBo.GetPatientKins(kinReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        let PatientBills: any = {};
        let PatientBillsapiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
            { Key: PatientBillsFilters.BillType, Value: 2 },
            { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }]
        };
        let PatientBillsBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        let PatientBillsdata = await PatientBillsBo.GetPatientBills(PatientBillsapiReq);
        PatientBills = PatientBillsdata.Data[0];
        let info = {
            Patient: patientData,
            Encounter: Data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData,
            PatientBills: PatientBills,
            Flags: flags
        };
        let pdfOption: any = null;
        let key = 'dischargeslip';
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

    public async PrintAdmissionLabel5(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounters(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let PatientKinBo = BoFactory.GetBo(bo.PatientKinBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let kinReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: Data.PatientId }]
        };
        let patientkinData = await PatientKinBo.GetPatientKins(kinReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        let info = {
            Patient: patientData,
            Encounter: Data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'admissionlabel5';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '0.40in',
                contents: '',
            },
            footer: {
                height: '0in',
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

    public async DeleteEncounter(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ReOpenEncounterAdmission(req: BaseRequest): Promise<number> {
        if (req.Data.EncounterId > 0) {
            let patientEncounterData = await this.GetEncounterById({ Id: req.Data.EncounterId });

            if (patientEncounterData) {
                patientEncounterData.IsLatest = true;
                patientEncounterData.DischargeDate = null;
                patientEncounterData.EncounterStatusId = 1;
                // patientEncounterData.AdmissionStatusId = 2;
                patientEncounterData.AdmissionStatusId = 4;//Clinical Discharge
                patientEncounterData.IsBillLock = false;
                patientEncounterData.DischargeTypeId = 0;
                patientEncounterData.IsBillCompleted = false;

                await this.Update(patientEncounterData);
            }
        }

        return req.Data.EncounterId;
    }

    public GetModel(): SStatic.Model<EncounterInstance, EncounterAttributes> {
        return this.Models.Encounter;
    }
    public async PrintIPAdmissionSummarybyDoctor(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let docsummary: any = [];
        let NetDoctorSummary: any = [];
        let DoctorSummary = req;
        docsummary = await this.GetIPAdmissionSummaryDoctor(DoctorSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorSummary.Data.FacilityId);
        if (docsummary) {
            let self = [];
            let Insurance = [];
            if (docsummary.length > 0) {
                self = docsummary[0].Value;
            }
            if (docsummary.length > 1) {
                Insurance = docsummary[1].Value;
            }
            for (let idx in self) {
                let selfdoctor = self[idx];
                let Key = '';
                let DepartmentName = '';
                let SelfCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in selfdoctor) {
                    let DoctorName = '';
                    if (selfdoctor[ix].DoctorName) {
                        if (selfdoctor[ix].DoctorName.Title)
                            DoctorName = selfdoctor[ix].DoctorName.Title.Description;
                        if (selfdoctor[ix].DoctorName.FirstName)
                            DoctorName += ' ' + selfdoctor[ix].DoctorName.FirstName;
                        if (selfdoctor[ix].DoctorName.LastName)
                            DoctorName += ' ' + selfdoctor[ix].DoctorName.LastName;
                    }
                    if (selfdoctor[ix].DepartmentName) {
                        DepartmentName = selfdoctor[ix].DepartmentName;
                    }
                    if (selfdoctor[ix].SelfCount) {
                        SelfCount = selfdoctor[ix].SelfCount;
                    }
                    Key = DoctorName;
                    DepartmentName = DepartmentName;
                    SelfCount = SelfCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetDoctorSummary.push({
                    'Key': Key,
                    'DepartmentName': DepartmentName,
                    'SelfCount': SelfCount,
                });

            }
            for (let idx in Insurance) {
                let Insurancedoctor = Insurance[idx];
                let Key = '';
                let DepartmentName = '';
                let InsuranceCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in Insurancedoctor) {
                    let DoctorName = '';
                    if (Insurancedoctor[ix].DoctorName) {
                        if (Insurancedoctor[ix].DoctorName.Title)
                            DoctorName = Insurancedoctor[ix].DoctorName.Title.Description;
                        if (Insurancedoctor[ix].DoctorName.FirstName)
                            DoctorName += ' ' + Insurancedoctor[ix].DoctorName.FirstName;
                        if (Insurancedoctor[ix].DoctorName.LastName)
                            DoctorName += ' ' + Insurancedoctor[ix].DoctorName.LastName;
                    }
                    if (Insurancedoctor[ix].DepartmentName) {
                        DepartmentName = Insurancedoctor[ix].DepartmentName;
                    }
                    if (Insurancedoctor[ix].InsuranceCount) {
                        InsuranceCount = Insurancedoctor[ix].InsuranceCount;
                    }
                    Key = DoctorName;
                    DepartmentName = DepartmentName;
                    InsuranceCount = InsuranceCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                let valappended = 0;
                NetDoctorSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.InsuranceCount = InsuranceCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetDoctorSummary.push({
                        'Key': Key,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount,
                    });
            }
            // for (let idx in NetDoctorSummary) {
            //     let collectiondetails = NetDoctorSummary[idx];
            //     let doctorcollect = {
            //         Key: collectiondetails.Key,
            //         DepartmentName: collectiondetails.DepartmentName,
            //         SelfCount: collectiondetails.SelfCount,
            //         InsuranceCount: collectiondetails.InsuranceCount,
            //         TotalCount: (collectiondetails.SelfCount) + (collectiondetails.InsuranceCount)

            //     };
            //     NetSummary.push(doctorcollect);
            // }
        }
        let TotSelfCount = 0;
        let TotInsuranceCount = 0;
        let TotAllCount = 0;
        var totSelfCount = 0;
        var totInsuranceCount = 0;
        for (var ix in NetDoctorSummary) {
            let netsummary = NetDoctorSummary[ix];
            if (netsummary.SelfCount) {
                totSelfCount += netsummary.SelfCount;
            }
            if (netsummary.InsuranceCount) {
                totInsuranceCount += netsummary.InsuranceCount;
            }
        }
        TotSelfCount = totSelfCount;
        TotInsuranceCount = totInsuranceCount;
        TotAllCount = (totSelfCount) + (totInsuranceCount);

        let info = {
            NetDoctorSummary: NetDoctorSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotSelfCount: TotSelfCount,
            TotInsuranceCount: TotInsuranceCount,
            TotAllCount: TotAllCount

        };
        let pdfOption: any = null;
        let key = 'ipadmissionsummarybydoctor';
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
    public async PrintIPStatisticsReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let ipstatistics: any = [];
        let NetIPStatistics: any = [];
        let IPStatistics = req;
        ipstatistics = await this.GetIPStatistics(IPStatistics);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(IPStatistics.Data.FacilityId);
        if (ipstatistics) {
            let enccount = [];
            let occupancycount = [];
            let capacitycount = [];
            if (ipstatistics.length > 0) {
                enccount = ipstatistics[0].Value;
            }
            if (ipstatistics.length > 1) {
                occupancycount = ipstatistics[1].Value;
            }
            if (ipstatistics.length > 2) {
                capacitycount = ipstatistics[2].Value;
            }
            for (let idx in enccount) {
                let encCount = enccount[idx];
                let Key = '';
                let AdmissionCount = 0;
                let DischargeCount = 0;
                for (let ix in encCount) {
                    if (encCount[ix].WardName) {
                        Key = encCount[ix].WardName;
                    }
                    if (encCount[ix].AdmissionCount) {
                        AdmissionCount = encCount[ix].AdmissionCount;
                    }
                    if (encCount[ix].DischargeCount) {
                        DischargeCount = encCount[ix].DischargeCount;
                    }
                    Key = Key;
                    AdmissionCount = AdmissionCount;
                    DischargeCount = DischargeCount;
                }
                let valappended = 0;
                NetIPStatistics.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.AdmissionCount = AdmissionCount;
                        item.DischargeCount = DischargeCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetIPStatistics.push({
                        'Key': Key,
                        'AdmissionCount': AdmissionCount,
                        'DischargeCount': DischargeCount,
                    });

            }
            for (let idx in occupancycount) {
                let occuCount = occupancycount[idx];
                let Key = '';
                let OccupancyCount = 0;
                for (let ix in occuCount) {
                    if (occuCount[ix].WardName) {
                        Key = occuCount[ix].WardName;
                    }
                    if (occuCount[ix].OccupancyCount) {
                        OccupancyCount = occuCount[ix].OccupancyCount;
                    }
                    Key = Key;
                    OccupancyCount = OccupancyCount;
                }
                let valappended = 0;
                NetIPStatistics.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.OccupancyCount = OccupancyCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetIPStatistics.push({
                        'Key': Key,
                        'OccupancyCount': OccupancyCount,
                    });
            }

            for (let idx in capacitycount) {
                let cpctycount = capacitycount[idx];
                let Key = '';
                let CapacityCount = 0;
                for (let ix in cpctycount) {
                    if (cpctycount[ix].WardName) {
                        Key = cpctycount[ix].WardName;
                    }
                    if (cpctycount[ix].CapacityCount) {
                        CapacityCount = cpctycount[ix].CapacityCount;
                    }
                    Key = Key;
                    CapacityCount = CapacityCount;
                }
                let valappended = 0;
                NetIPStatistics.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.CapacityCount = CapacityCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetIPStatistics.push({
                        'Key': Key,
                        'CapacityCount': CapacityCount,
                    });

            }

        }
        let TotAdmissionCount = 0;
        let TotDischargeCount = 0;
        let TotOccupancyCount = 0;
        let TotCapacityCount = 0;
        var totAdmissionCount = 0;
        var totDischargeCount = 0;
        var totOccupancyCount = 0;
        var totCapacityCount = 0;
        for (var ix in NetIPStatistics) {
            let netsummary = NetIPStatistics[ix];
            if (netsummary.AdmissionCount) {
                totAdmissionCount += netsummary.AdmissionCount;
            }
            if (netsummary.DischargeCount) {
                totDischargeCount += netsummary.DischargeCount;
            }
            if (netsummary.OccupancyCount) {
                totOccupancyCount += netsummary.OccupancyCount;
            }
            if (netsummary.CapacityCount) {
                totCapacityCount += netsummary.CapacityCount;
            }
        }
        TotAdmissionCount = totAdmissionCount;
        TotDischargeCount = totDischargeCount;
        TotOccupancyCount = totOccupancyCount;
        TotCapacityCount = totCapacityCount;

        let info = {
            NetIPStatistics: NetIPStatistics,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotAdmissionCount: TotAdmissionCount,
            TotDischargeCount: TotDischargeCount,
            TotOccupancyCount: TotOccupancyCount,
            TotCapacityCount: TotCapacityCount,

        };
        let pdfOption: any = null;
        let key = 'ipstatisticsreport';
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
    public async PrintIPStatisticsByWard(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let ipstatistics: any = [];
        let NetIPStatistics: any = [];
        let IPStatistics = req;
        ipstatistics = await this.GetIPStatisticsByWard(IPStatistics);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(IPStatistics.Data.FacilityId);
        if (ipstatistics) {
            let enccount = [];
            let transfercount = [];
            if (ipstatistics.length > 0) {
                enccount = ipstatistics[0].Value;
            }
            if (ipstatistics.length > 1) {
                transfercount = ipstatistics[1].Value;
            }
            for (let idx in enccount) {
                let encCount = enccount[idx];
                let Key = '';
                let AdmissionCount = 0;
                let DischargeCount = 0;
                let DeathCount = 0;
                for (let ix in encCount) {
                    if (encCount[ix].WardName) {
                        Key = encCount[ix].WardName;
                    }
                    if (encCount[ix].AdmissionCount) {
                        AdmissionCount = encCount[ix].AdmissionCount;
                    }
                    if (encCount[ix].DischargeCount) {
                        DischargeCount = encCount[ix].DischargeCount;
                    }
                    if (encCount[ix].DeathCount) {
                        DeathCount = encCount[ix].DeathCount;
                    }
                    Key = Key;
                    AdmissionCount = AdmissionCount;
                    DischargeCount = DischargeCount;
                    DeathCount = DeathCount;
                }
                let valappended = 0;
                NetIPStatistics.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.AdmissionCount = AdmissionCount;
                        item.DischargeCount = DischargeCount;
                        item.DeathCount = DeathCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetIPStatistics.push({
                        'Key': Key,
                        'AdmissionCount': AdmissionCount,
                        'DischargeCount': DischargeCount,
                        'DeathCount': DeathCount,
                    });

            }
            for (let idx in transfercount) {
                let transCount = transfercount[idx];
                let Key = '';
                let TransferInCount = 0;
                let TransferOutCount = 0;
                for (let ix in transCount) {
                    if (transCount[ix].WardName) {
                        Key = transCount[ix].WardName;
                    }
                    if (transCount[ix].TransferInCount) {
                        TransferInCount = transCount[ix].TransferInCount;
                    }
                    if (transCount[ix].TransferOutCount) {
                        TransferOutCount = transCount[ix].TransferOutCount;
                    }
                    Key = Key;
                    TransferInCount = TransferInCount;
                    TransferOutCount = TransferOutCount;
                }
                let valappended = 0;
                NetIPStatistics.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.TransferInCount = TransferInCount;
                        item.TransferOutCount = TransferOutCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetIPStatistics.push({
                        'Key': Key,
                        'TransferInCount': TransferInCount,
                        'TransferOutCount': TransferOutCount,
                    });
            }



        }
        let TotAdmissionCount = 0;
        let TotDischargeCount = 0;
        let TotDeathCount = 0;
        let TotTransferInCount = 0;
        let TotTransferOutCount = 0;
        var totAdmissionCount = 0;
        var totDischargeCount = 0;
        var totDeathCount = 0;
        var totTransferInCount = 0;
        var totTransferOutCount = 0;
        for (var ix in NetIPStatistics) {
            let netsummary = NetIPStatistics[ix];
            if (netsummary.AdmissionCount) {
                totAdmissionCount += netsummary.AdmissionCount;
            }
            if (netsummary.DischargeCount) {
                totDischargeCount += netsummary.DischargeCount;
            }
            if (netsummary.DeathCount) {
                totDeathCount += netsummary.DeathCount;
            }
            if (netsummary.TransferInCount) {
                totTransferInCount += netsummary.TransferInCount;
            }
            if (netsummary.TransferOutCount) {
                totTransferOutCount += netsummary.TransferOutCount;
            }
        }
        TotAdmissionCount = totAdmissionCount;
        TotDischargeCount = totDischargeCount;
        TotDeathCount = totDeathCount;
        TotTransferInCount = totTransferInCount;
        TotTransferOutCount = totTransferOutCount;

        let info = {
            NetIPStatistics: NetIPStatistics,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotAdmissionCount: TotAdmissionCount,
            TotDischargeCount: TotDischargeCount,
            TotDeathCount: TotDeathCount,
            TotTransferInCount: TotTransferInCount,
            TotTransferOutCount: TotTransferOutCount,

        };
        let pdfOption: any = null;
        let key = 'ipstatisticsbyward';
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
    public async PrintIPDailyWiseStatisticsReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let ipstatistics: any = [];
        let DailyIPStats: any = [];
        let IPStatistics = req;
        ipstatistics = await this.IPStatisticsWithDate(IPStatistics);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(IPStatistics.Data.FacilityId);
        if (ipstatistics) {
            let admCount = [];
            let discount = [];
            let deathCount = [];

            admCount = ipstatistics[1];
            discount = ipstatistics[2];
            deathCount = ipstatistics[3];

            for (let ldx in admCount) {
                let AdmCountStats = admCount[ldx];
                let Key = '';
                let AdmissionCount = 0;
                // var DischargeCount = 0;
                // var DeathCount = 0;
                let year = new Date(AdmCountStats.AdmDate).getFullYear();
                let month = new Date(AdmCountStats.AdmDate).getMonth();
                let date = new Date(AdmCountStats.AdmDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                // var AdmissionDate = Key;
                if (AdmCountStats.AdmissionCount) {
                    AdmissionCount = AdmCountStats.AdmissionCount;
                }
                // if (CountStats.DischargeCount) {
                //     DischargeCount = CountStats.DischargeCount;
                // }
                // if (CountStats.DeathCount) {
                //     DeathCount = CountStats.DeathCount;
                // }
                Key = Key;
                AdmissionCount = AdmissionCount;
                // DischargeCount = DischargeCount;
                // DeathCount = DeathCount;

                let valappended = 0;
                DailyIPStats.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.AdmissionCount += AdmissionCount;
                        // item.DischargeCount = DischargeCount;
                        // item.DeathCount = DeathCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    DailyIPStats.push({
                        'Key': Key,
                        'AdmissionCount': AdmissionCount,
                        // 'DischargeCount': DischargeCount,
                        // 'DeathCount': DeathCount,
                    });

            }

            for (let ldx in discount) {
                let DisCountStats = discount[ldx];
                let Key = '';
                let DischargeCount = 0;
                let year = new Date(DisCountStats.DischargeDate).getFullYear();
                let month = new Date(DisCountStats.DischargeDate).getMonth();
                let date = new Date(DisCountStats.DischargeDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                if (DisCountStats.DischargeCount) {
                    DischargeCount = DisCountStats.DischargeCount;
                }
                Key = Key;
                DischargeCount = DischargeCount;

                let valappended = 0;
                DailyIPStats.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.DischargeCount += DischargeCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    DailyIPStats.push({
                        'Key': Key,
                        'DischargeCount': DischargeCount,
                    });

            }
            for (let ldx in deathCount) {
                let DeathCountStats = deathCount[ldx];
                let Key = '';
                let DeathCount = 0;
                let year = new Date(DeathCountStats.DeathDate).getFullYear();
                let month = new Date(DeathCountStats.DeathDate).getMonth();
                let date = new Date(DeathCountStats.DeathDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                if (DeathCountStats.DeathCount) {
                    DeathCount = DeathCountStats.DeathCount;
                }
                Key = Key;
                DeathCount = DeathCount;

                let valappended = 0;
                DailyIPStats.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.DeathCount += DeathCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    DailyIPStats.push({
                        'Key': Key,
                        'DeathCount': DeathCount,
                    });

            }

        }
        let TotAdmissionCount = 0;
        let TotDischargeCount = 0;
        let TotDeathCount = 0;
        let totAdmissionCount = 0;
        let totDischargeCount = 0;
        let totDeathCount = 0;
        for (var ix in DailyIPStats) {
            let netsummary = DailyIPStats[ix];
            if (netsummary.AdmissionCount) {
                totAdmissionCount += netsummary.AdmissionCount;
            }
            if (netsummary.DischargeCount) {
                totDischargeCount += netsummary.DischargeCount;
            }
            if (netsummary.DeathCount) {
                totDeathCount += netsummary.DeathCount;
            }
        }
        TotAdmissionCount = totAdmissionCount;
        TotDischargeCount = totDischargeCount;
        TotDeathCount = totDeathCount;

        let info = {
            DailyIPStats: DailyIPStats,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotAdmissionCount: TotAdmissionCount,
            TotDischargeCount: TotDischargeCount,
            TotDeathCount: TotDeathCount,

        };
        let pdfOption: any = null;
        let key = 'dailywiseipstatisticsreport';
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
    public async PrintOutpatientSummarybyDoctor(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let docsummary: any = [];
        let NetDoctorSummary: any = [];
        let AllDoctorSummary: any = [];
        let DoctorSummary = req;
        docsummary = await this.GetOutpatientSummaryDoctor(DoctorSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorSummary.Data.FacilityId);
        if (docsummary) {
            let self = [];
            let Insurance = [];
            if (docsummary.length > 0) {
                self = docsummary[0].Value;
            }
            if (docsummary.length > 1) {
                Insurance = docsummary[1].Value;
            }
            for (let idx in self) {
                let selfdoctor = self[idx];
                let Key = '';
                let DepartmentName = '';
                let SelfCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in selfdoctor) {
                    let DoctorName = '';
                    if (selfdoctor[ix].DoctorName) {
                        if (selfdoctor[ix].DoctorName.Title)
                            DoctorName = selfdoctor[ix].DoctorName.Title.Description;
                        if (selfdoctor[ix].DoctorName.FirstName)
                            DoctorName += ' ' + selfdoctor[ix].DoctorName.FirstName;
                        if (selfdoctor[ix].DoctorName.LastName)
                            DoctorName += ' ' + selfdoctor[ix].DoctorName.LastName;
                    }
                    if (selfdoctor[ix].DepartmentName) {
                        DepartmentName = selfdoctor[ix].DepartmentName;
                    }
                    if (selfdoctor[ix].SelfCount) {
                        SelfCount = selfdoctor[ix].SelfCount;
                    }
                    Key = DoctorName;
                    DepartmentName = DepartmentName;
                    SelfCount = SelfCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetDoctorSummary.push({
                    'Key': Key,
                    'DepartmentName': DepartmentName,
                    'SelfCount': SelfCount,
                });

            }
            for (let idx in Insurance) {
                let Insurancedoctor = Insurance[idx];
                let Key = '';
                let DepartmentName = '';
                let InsuranceCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in Insurancedoctor) {
                    let DoctorName = '';
                    if (Insurancedoctor[ix].DoctorName) {
                        if (Insurancedoctor[ix].DoctorName.Title)
                            DoctorName = Insurancedoctor[ix].DoctorName.Title.Description;
                        if (Insurancedoctor[ix].DoctorName.FirstName)
                            DoctorName += ' ' + Insurancedoctor[ix].DoctorName.FirstName;
                        if (Insurancedoctor[ix].DoctorName.LastName)
                            DoctorName += ' ' + Insurancedoctor[ix].DoctorName.LastName;
                    }
                    if (Insurancedoctor[ix].DepartmentName) {
                        DepartmentName = Insurancedoctor[ix].DepartmentName;
                    }
                    if (Insurancedoctor[ix].InsuranceCount) {
                        InsuranceCount = Insurancedoctor[ix].InsuranceCount;
                    }
                    Key = DoctorName;
                    DepartmentName = DepartmentName;
                    InsuranceCount = InsuranceCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                let valappended = 0;
                NetDoctorSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.InsuranceCount = InsuranceCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetDoctorSummary.push({
                        'Key': Key,
                        'DepartmentName': DepartmentName,
                        'InsuranceCount': InsuranceCount,
                    });
            }
            // for (let idx in NetDoctorSummary) {
            //     let collectiondetails = NetDoctorSummary[idx];
            //     let doctorcollect = {
            //         Key: collectiondetails.Key,
            //         DepartmentName: collectiondetails.DepartmentName,
            //         SelfCount: collectiondetails.SelfCount,
            //         InsuranceCount: collectiondetails.InsuranceCount,
            //         TotalCount: (collectiondetails.SelfCount) + (collectiondetails.InsuranceCount)

            //     };
            //     NetSummary.push(doctorcollect);
            // }
        }
        let TotSelfCount = 0;
        let TotInsuranceCount = 0;
        let TotAllCount = 0;
        var totSelfCount = 0;
        var totInsuranceCount = 0;
        let netsummary: any = {};
        for (var ix in NetDoctorSummary) {
            netsummary = NetDoctorSummary[ix];
            if (netsummary.SelfCount) {
                totSelfCount += netsummary.SelfCount;
            }
            if (netsummary.InsuranceCount) {
                totInsuranceCount += netsummary.InsuranceCount;
            }
            netsummary.TotalCount = (netsummary.SelfCount || 0) + (netsummary.InsuranceCount || 0);
            AllDoctorSummary.push(netsummary);
        }
        TotSelfCount = totSelfCount;
        TotInsuranceCount = totInsuranceCount;
        TotAllCount = (totSelfCount) + (totInsuranceCount);

        let info = {
            AllDoctorSummary: AllDoctorSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotSelfCount: TotSelfCount,
            TotInsuranceCount: TotInsuranceCount,
            TotAllCount: TotAllCount

        };
        let pdfOption: any = null;
        let key = 'outpatientsummarybydoctor';
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
    public async PrintIPAdmissionSummarybyInsurance(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityId = req.Data.FacilityId;
        let GuarantorSummary: any = [];
        let NetGurantorSummary: any = [];
        let GuarSummary = req;
        GuarantorSummary = await this.GetIPAdmissionSummaryInsurance(GuarSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        if (GuarantorSummary) {
            let self = [];
            if (GuarantorSummary.length > 0) {
                self = GuarantorSummary[0].Value;
            }
            for (let idx in self) {
                let selfGuar = self[idx];
                let Key = '';
                let GuarantorType = '';
                let GuarantorCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in selfGuar) {
                    let GuarantorName = '';
                    if (selfGuar[ix].GuarantorName) {
                        GuarantorName = selfGuar[ix].GuarantorName;
                    }

                    if (selfGuar[ix].GuarantorType) {
                        GuarantorType = selfGuar[ix].GuarantorType;
                    }
                    if (selfGuar[ix].GuarantorCount) {
                        GuarantorCount = selfGuar[ix].GuarantorCount;
                    }
                    Key = GuarantorName;
                    GuarantorType = GuarantorType;
                    GuarantorCount = GuarantorCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetGurantorSummary.push({
                    'Key': Key,
                    'GuarantorType': GuarantorType,
                    'GuarantorCount': GuarantorCount,
                });

            }

        }
        let TotGuarantorCount = 0;
        let totGuarantorCount = 0;
        for (let i in NetGurantorSummary) {
            let netsummary = NetGurantorSummary[i];
            if (netsummary.GuarantorCount) {
                totGuarantorCount += netsummary.GuarantorCount;
            }
        }
        TotGuarantorCount = totGuarantorCount;

        let info = {
            NetGurantorSummary: NetGurantorSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotGuarantorCount: TotGuarantorCount

        };
        let pdfOption: any = null;
        let key = 'ipadmissionsummarybyinsurance';
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
    public async PrintDiagnosissummaryforIp(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let DiagnosisSummary: any = [];
        let NetDiagnosisSummary: any = [];
        let DiagSummary = req;
        DiagnosisSummary = await this.GetDiagnosissummaryforIp(DiagSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DiagSummary.Data.FacilityId);
        if (DiagnosisSummary) {
            for (let idx in DiagnosisSummary) {
                let diagSummary = DiagnosisSummary[idx];
                let Key = '';
                let DiagnosisName = '';
                let diagCount = 0;
                let DiagnosisCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in diagSummary) {
                    if (diagSummary[ix].DiagnosisName) {
                        DiagnosisName = diagSummary[ix].DiagnosisName;
                    }
                    if (diagSummary[ix].DiagnosisCount) {
                        diagCount = diagSummary[ix].DiagnosisCount;
                    }
                    Key = DiagnosisName;
                    DiagnosisCount = diagCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetDiagnosisSummary.push({
                    'Key': Key,
                    'DiagnosisCount': DiagnosisCount,
                });

            }

        }
        let TotDiagnosisCount = 0;
        let totDiagnosisCount = 0;
        for (let ix in NetDiagnosisSummary) {
            let netsummary = NetDiagnosisSummary[ix];
            if (netsummary.DiagnosisCount) {
                totDiagnosisCount += netsummary.DiagnosisCount;
            }
        }
        TotDiagnosisCount = totDiagnosisCount;

        let info = {
            NetDiagnosisSummary: NetDiagnosisSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotDiagnosisCount: TotDiagnosisCount

        };
        let pdfOption: any = null;
        let key = 'diagnosissummaryforippatient';
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
    public async PrintOutpatientSummarybyInsurance(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityId = req.Data.FacilityId;
        let GuarantorSummary: any = [];
        let NetGurantorSummary: any = [];
        let GuarSummary = req;
        GuarantorSummary = await this.GetOutpatientSummaryInsurance(GuarSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        if (GuarantorSummary) {
            let self = [];
            if (GuarantorSummary.length > 0) {
                self = GuarantorSummary[0].Value;
            }
            for (let idx in self) {
                let selfGuar = self[idx];
                let Key = '';
                let GuarantorType = '';
                let GuarantorCount = 0;
                // let DueCollectAmt = 0;
                for (let ix in selfGuar) {
                    let GuarantorName = '';
                    if (selfGuar[ix].GuarantorName) {
                        GuarantorName = selfGuar[ix].GuarantorName;
                    }

                    if (selfGuar[ix].GuarantorType) {
                        GuarantorType = selfGuar[ix].GuarantorType;
                    }
                    if (selfGuar[ix].GuarantorCount) {
                        GuarantorCount = selfGuar[ix].GuarantorCount;
                    }
                    Key = GuarantorName;
                    GuarantorType = GuarantorType;
                    GuarantorCount = GuarantorCount;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetGurantorSummary.push({
                    'Key': Key,
                    'GuarantorType': GuarantorType,
                    'GuarantorCount': GuarantorCount,
                });

            }

        }
        let TotGuarantorCount = 0;
        let totGuarantorCount = 0;
        for (let i in NetGurantorSummary) {
            let netsummary = NetGurantorSummary[i];
            if (netsummary.GuarantorCount) {
                totGuarantorCount += netsummary.GuarantorCount;
            }
        }
        TotGuarantorCount = totGuarantorCount;

        let info = {
            NetGurantorSummary: NetGurantorSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotGuarantorCount: TotGuarantorCount

        };
        let pdfOption: any = null;
        let key = 'outpatientsummarybyinsurance';
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

    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'myinpatient':
    //             count = await this.Items.count({
    //                 where: {
    //                     'DoctorId': this.GetSession().UserId,
    //                     'EncounterTypeId': 2,
    //                     'AdmissionStatusId': 2
    //                 },
    //             });
    //             break;
    //         case 'pendingdischarge':
    //             count = await this.Items.count({
    //                 where: {
    //                     'DoctorId': this.GetSession().UserId,
    //                     'EncounterTypeId': 2,
    //                     'AdmissionStatusId': 4
    //                 },
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }

    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let OtWorklistCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 2,
                //'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'OtWorklistCount': OtWorklistCount,
        };
    }

    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let inpatientcount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 2,
                'DoctorId': req.Data.DoctorId,
            }
        });
        let pendingdischargescount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 4,
                'DoctorId': req.Data.DoctorId,
            }
        });
        let dischargedcount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'inpatientcount': inpatientcount,
            'pendingdischargescount': pendingdischargescount,
            'dischargedcount': dischargedcount
        };
    }

    public async GetIPPatientsBills(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let GuarantorWhere: WhereOptions<any> = {};
        let patientGuarantorWhere: WhereOptions<any> = {};
        let patientCertificateWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientGuarantor, isReqGuarantor, isReqPatientCertificate: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let WardWhere: WhereOptions<any> = {};
        let IsWardSearch: boolean = false;
        let issortbybillnumber = false;
        let attributes: any = {};
        attributes['include'] = [];
        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        // include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push(this.GetReference('AdmissionStatus', ['Description', 'ColorCode']));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case EncounterFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case EncounterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case EncounterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EncounterFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case EncounterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterFilters.AttenderName:
                        where['AttenderName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                   case EncounterFilters.PatientNameMRN:
    if (mrnshortcode > 0) {
        (patientWhere as any)[Op.or] = [
            { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
        ];
    } else {
        (patientWhere as any)[Op.or] = [
            { 'FirstName': { [Op.like]: '' + (param.Value || '') + '%' } },
            { 'LastName': { [Op.like]: '' + (param.Value || '') + '%' } },
            { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
        ];
    }
    isReqPatientSearch = true;
    break;
                    case EncounterFilters.BillNumber:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount', 'RoundOffValue'],
                            required: true,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3,
                                'BillNumber': param.Value
                            }, as: 'DischargedBills'
                        });
                        break;
                  case EncounterFilters.Phone:
    (patientWhere as any)[Op.or] = [{ Mobile: { [Op.like]: (param.Value || '') } }];
    isReqPatientSearch = true;
    break;

case EncounterFilters.RequestIdentifier:
    (where as any)[Op.or] = [{ '$AdmissionRequest.RequestIdentifier$': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;

case EncounterFilters.VisitIdentifier:
    (where as any)[Op.or] = [{ VisitIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
                    case EncounterFilters.EncounterStatus:
                        where['EncounterStatusId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionDate:
                        where['AdmissionDate'] = { '$between': param.Value || '' };
                        break;
                    case EncounterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case EncounterFilters.From:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.To:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case EncounterFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case EncounterFilters.MultiGuarantorType:
                        patientGuarantorWhere['GuarantorTypeId'] = { '$in': param.Value };
                        isReqPatientGuarantor = true;
                        break;
                    case EncounterFilters.AttenderPhone:
    (where as any)[Op.or] = [{ 'AttenderPhone': param.Value }];
    break;
                    case EncounterFilters.WardMasterTypeId:
                        WardWhere['WardMasterTypeId'] = param.Value;
                        IsWardSearch = true;
                        break;
                   case EncounterFilters.OpenEncounter:
    (where as any)[Op.or] = [
        { 'EncounterStatusId': 1 },
        { 'AdmissionStatusId': { [Op.in]: [2, 3, 4, 5] } }
    ];
    break;
                    case EncounterFilters.IncludeBillSummary:
                        let billSummQry = this.GetSelectQuery(this.Models.PatientBillSummary, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('ActualAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                            }]
                        }, 'ActualAmount');
                        attributes.include.push(billSummQry);
                        break;
                    case EncounterFilters.IncludePaymentDetails:
                        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': 1,
                                'ReceiptStatusId': 1
                            }]
                        }, 'PaidAmount');
                        attributes.include.push(paidQry);
                        let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': 1,
                                'ReceiptStatusId': 1
                            }]
                        }, 'AmountAdjusted');
                        attributes.include.push(adjustedQry);
                        break;
                    case EncounterFilters.IncludeBillDetails:
                        let dbtQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'IsPharmacyReceipt': 0,
                                'ReceiptStatusId': 1
                            }]
                        }, 'Debit');
                        attributes.include.push(dbtQry);
                        // let tdsQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('TDSAmount'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                        //         'ReceiptStatusId': 1
                        //     }]
                        // }, 'TDS');
                        // attributes.include.push(tdsQry);
                        // let disQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('Disallowance'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                        //         'ReceiptStatusId': 1
                        //     }]
                        // }, 'Disallowance');
                        // attributes.include.push(disQry);
                        // let billAmountQry = this.GetSelectQuery(this.Models.PatientBills, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         'BillTypeId': 3,
                        //         'PatientBillStatusId': 3
                        //     }]
                        // }, 'BillAmount');
                        // attributes.include.push(billAmountQry);
                        let billDiscountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillDiscount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'DiscountAmount');
                        attributes.include.push(billDiscountQry);
                        let billRoundoffQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('RoundOffValue'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'RoundOffValue');
                        attributes.include.push(billRoundoffQry);
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount',
                                'RoundOffValue', 'PaidAmount', 'OTRegisterId', 'BillTypeId', 'CancelReqRaisedStatusId'],
                            required: false,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3
                            }, as: 'FinalBills'
                        });
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount',
                                'RoundOffValue', 'PaidAmount', 'OTRegisterId'],
                            required: false,
                            where: {
                                'Status': 1,
                                'BillTypeId': [2, 3],
                                'PatientBillStatusId': 3,
                                'IsPharmacyBill': true,
                                'PharmacySaleTypeId': { '$gt': '0' }
                            }, as: 'PharmacyBills'
                        });
                        let billPackageInclusionQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('PackageAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'InclusionAmount');
                        attributes.include.push(billPackageInclusionQry);
                        let billPackageExclusionQry = this.GetSelectQuery(this.Models.PatientBillPackageSummary, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('ExclusionAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'ExclusionAmount');
                        attributes.include.push(billPackageExclusionQry);
                        let billPackageDiscountQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('DiscountAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'PackageDiscountAmount');
                        attributes.include.push(billPackageDiscountQry);
                        break;
                    case EncounterFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case EncounterFilters.IncludePatientCertifiate:
                        include.push({
                            model: this.Models.PatientCertificate, where: patientCertificateWhere, required: isReqPatientCertificate,
                            include: [
                                this.GetReference('CertificateStatus')
                            ]
                        });
                        break;
                    case EncounterFilters.CertificateStatusId:
                        patientCertificateWhere['CertificateStatusId'] = param.Value;
                        isReqPatientCertificate = true;
                        break;
                    case EncounterFilters.DischargeTypeId:
                        where['DischargeTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AppointmentId:
                        where['AppointmentId'] = param.Value;
                        break;
                    case EncounterFilters.BedBoardAdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IncludeDoctors:
                        include.push({ model: this.Models.EncounterDoctor, required: false });
                        break;
                    case EncounterFilters.IsBillLock:
                        where['IsBillLock'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IsReadmission:
                        where['IsReadmission'] = param.Value;
                        break;
                    case EncounterFilters.IsPaidVisit:
                        where['IsPaidVisit'] = param.Value;
                        break;
                    case EncounterFilters.FreeVisit:
                        where['FreeVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsEstimatedBill:
                        where['IsEstimatedBill'] = param.Value;
                        break;
                    case EncounterFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case EncounterFilters.IsSurgery:
                        where['IsSurgery'] = param.Value;
                        break;
                    case EncounterFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case EncounterFilters.IsBillModified:
                        where['IsBillModified'] = param.Value;
                        break;
                    case EncounterFilters.IsPackageAssigned:
                        where['IsPackageAssigned'] = param.Value;
                        break;
                  case EncounterFilters.TpaId:
    (GuarantorWhere as any)[Op.or] = [{ 'TpaId': param.Value }];
    isReqGuarantor = true;
    break;
                    case EncounterFilters.IsDayCare:
                        where['IsDayCare'] = param.Value;
                        break;
                    case EncounterFilters.Billnumbersort:
                        issortbybillnumber = param.Value;
                        break;
                    default:
                        console.log(param);
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'FacilityId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['Id', 'GuarantorName', 'TPAId'],
            where: GuarantorWhere,
            required: isReqGuarantor,
            include: [this.GetReference('TPA')]
        });
        // include.push({
        //     model: this.Models.PatientGuarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
        //     where: patientGuarantorWhere,
        //     required: isReqPatientGuarantor,
        //     include: [this.GetReference('GuarantorType', ['Description', 'ColorCode']), this.GetReference('Tpa')]
        // });
        let WardQry: any = {
            model: this.Models.WardMaster,
            attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            where: WardWhere,
            required: IsWardSearch
        };
        include.push(WardQry);
        order.push(['AdmissionDate', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });

    }
    public async GetMINIPPatientsBills(apiReq?: ApiRequest<EncounterFilters>): Promise<ApiResponse<EncounterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let GuarantorWhere: WhereOptions<any> = {};
        let patientGuarantorWhere: WhereOptions<any> = {};
        let patientCertificateWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientGuarantor, isReqGuarantor, isReqPatientCertificate: boolean = false;
        let includeBill: any = false;
        let isBillRequired: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let WardWhere: WhereOptions<any> = {};
        let IsWardSearch: boolean = false;
        let attributes: any = {};
        let issortbyipnumber = false;
        // attributes = ['Id', 'EncounterTypeId',
        //     'WardId', 'GuarantorId', 'PatientId', 'DoctorId', 'AdmissionStatusId',
        //     'BedId', 'RoomId', 'AdmissionDate'];
        attributes['include'] = [];
        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.BillingRequest, as: 'BillingRequest',
            // attributes: ['FirstName', 'LastName'],
            required: false,
            where: { 'BillingRequestTypeId': 3, },
            include: [{
                model: this.Models.User,
                attributes: ['FirstName', 'LastName', 'SignPath'], as: 'BillingRequestUser', required: false
            }]
            // include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        // include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push(this.GetReference('AdmissionStatus', ['Description', 'ColorCode']));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case EncounterFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case EncounterFilters.ServiceRateCategoryId:
                        where['ServiceRateCategoryId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case EncounterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EncounterFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case EncounterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterFilters.AttenderName:
                        where['AttenderName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                   case EncounterFilters.PatientNameMRN:
    if (mrnshortcode > 0) {
        (patientWhere as any)[Op.or] = [
            { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
        ];
    } else {
        (patientWhere as any)[Op.or] = [
            { 'FirstName': { [Op.like]: '' + (param.Value || '') + '%' } },
            { 'LastName': { [Op.like]: '' + (param.Value || '') + '%' } },
            { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
            { 'Mobile': { [Op.like]: '%' + (param.Value || '') + '%' } }
        ];
    }
    isReqPatientSearch = true;
    break;
                    case EncounterFilters.FromBillDate:
                        billWhere['BillDateTime'] = billWhere['BillDateTime'] || {};
                        (billWhere['BillDateTime'] as any)['$gte'] = param.Value;
                        isBillRequired = true;
                        break;
                    case EncounterFilters.ToBillDate:
                        billWhere['BillDateTime'] = billWhere['BillDateTime'] || {};
                        (billWhere['BillDateTime'] as any)['$lte'] = param.Value;
                        isBillRequired = true;
                        break;
                    case EncounterFilters.BillNumber:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount', 'IsPaidFully',
                                'BillDiscount', 'OutStandingAmount', 'RefundAmount', 'RoundOffValue'],
                            required: false,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3,
                                'BillNumber': { '$like': '' + (param.Value || '') + '%' }
                            }, as: 'DischargedBills'
                        });
                        break;
                    case EncounterFilters.IsPaidFully:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'IsPaidFully'],
                            required: true,
                            where: {
                                'Status': 1,
                                'BillTypeId': 2,
                                'PatientBillStatusId': 3,
                                'IsPaidFully': param.Value
                            }, as: 'DueBills'
                        });
                        break;
                   case EncounterFilters.Phone:
    (patientWhere as any)[Op.or] = [{ 'Mobile': { [Op.like]: (param.Value || '') } }];
    isReqPatientSearch = true;
    break;
case EncounterFilters.RequestIdentifier:
    (where as any)[Op.or] = [{ 'AdmissionRequest.RequestIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
case EncounterFilters.VisitIdentifier:
    (where as any)[Op.or] = [{ 'VisitIdentifier': { [Op.like]: '%' + (param.Value || '') + '%' } }];
    break;
                    case EncounterFilters.EncounterStatus:
                        where['EncounterStatusId'] = param.Value;
                        break;
                    case EncounterFilters.BillUnlockRequestStatus:
                        where['BillUnlockRequestStatusId'] = param.Value;
                        break;
                    case EncounterFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionDate:
                        where['AdmissionDate'] = { '$between': param.Value || '' };
                        break;
                    case EncounterFilters.DOD:
                        where['DischargeDate'] = { '$between': param.Value || '' };
                        break;
                    case EncounterFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case EncounterFilters.From:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.To:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case EncounterFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case EncounterFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterFilters.listGovt:
                        where['GuarantorTypeId'] = { '$gt': param.Value };
                        break;
                    case EncounterFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case EncounterFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case EncounterFilters.MultiGuarantorType:
                        patientGuarantorWhere['GuarantorTypeId'] = { '$in': param.Value };
                        isReqPatientGuarantor = true;
                        break;
                   case EncounterFilters.AttenderPhone:
    (where as any)[Op.or] = [{ 'AttenderPhone': param.Value }];
    break;
                    case EncounterFilters.WardMasterTypeId:
                        WardWhere['WardMasterTypeId'] = param.Value;
                        IsWardSearch = true;
                        break;
                    case EncounterFilters.OpenEncounter:
    (where as any)[Op.or] = [
        { 'EncounterStatusId': 1 },
        { 'AdmissionStatusId': { [Op.in]: [2, 3, 4, 5] } }
    ];
    break;
                    case EncounterFilters.IncludeBillSummary:
                        let billSummQry = this.GetSelectQuery(this.Models.PatientBillSummary, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('ActualAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                            }]
                        }, 'ActualAmount');
                        attributes.include.push(billSummQry);
                        // include.push({
                        //     model: this.Models.PatientBillSummary,
                        //     attributes: ['Id','ActualAmount',[this.Dal.fn('SUM', this.Dal.col('ActualAmount')),'Amount']],
                        //     required: false,
                        //     as: 'Summary'
                        // });
                        break;
                    case EncounterFilters.IncludePaymentDetails:
                        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': 1,
                                'ReceiptStatusId': 1
                            }]
                        }, 'PaidAmount');
                        attributes.include.push(paidQry);
                        let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
                            where: [this.Dal.literal('`PatientId` = `Encounter`.`PatientId`'),
                            {
                                'Status': 1,
                                'ReceiptTypeId': 1,
                                'ReceiptStatusId': 1
                            }]
                        }, 'AmountAdjusted');
                        attributes.include.push(adjustedQry);
                        break;
                    case EncounterFilters.IncludeBillDetails:
                        let dbtQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                                'IsPharmacyReceipt': 0,
                                'ReceiptStatusId': 1
                            }]
                        }, 'Debit');
                        attributes.include.push(dbtQry);
                        // let tdsQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('TDSAmount'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                        //         'ReceiptStatusId': 1
                        //     }]
                        // }, 'TDS');
                        // attributes.include.push(tdsQry);
                        // let disQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('Disallowance'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         '$or': [{ 'EncounterTypeId': 2 }, { 'EncounterTypeId': 3 }],
                        //         'ReceiptStatusId': 1
                        //     }]
                        // }, 'Disallowance');
                        // attributes.include.push(disQry);
                        // let billAmountQry = this.GetSelectQuery(this.Models.PatientBills, {
                        //     attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
                        //     where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                        //     {
                        //         'Status': 1,
                        //         'BillTypeId': 3,
                        //         'PatientBillStatusId': 3
                        //     }]
                        // }, 'BillAmount');
                        // attributes.include.push(billAmountQry);
                        let billDiscountQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('BillDiscount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'DiscountAmount');
                        attributes.include.push(billDiscountQry);
                        let billRoundoffQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('RoundOffValue'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'BillTypeId': 3,
                                'PatientBillStatusId': 3
                            }]
                        }, 'RoundOffValue');
                        attributes.include.push(billRoundoffQry);
                        includeBill = true;
                        billWhere['Status'] = 1;
                        billWhere['BillTypeId'] = 2;
                        billWhere['PatientBillStatusId'] = 3;
                        // include.push({
                        //     model: this.Models.PatientBills,
                        //     attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                        //         'BillDiscount', 'OutStandingAmount', 'RefundAmount', 'BillDiscountModeId',
                        //         'RoundOffValue', 'PaidAmount', 'OTRegisterId', 'BillTypeId', 'CancelReqRaisedStatusId'],
                        //     required: false,
                        //     where: {
                        //         'Status': 1,
                        //         'BillTypeId': 2,
                        //         'PatientBillStatusId': 3
                        //     }, as: 'FinalBills'
                        // });
                        // include.push({
                        //     model: this.Models.PatientBills,
                        //     attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                        //         'BillDiscount', 'OutStandingAmount', 'RefundAmount',
                        //         'RoundOffValue', 'PaidAmount', 'OTRegisterId'],
                        //     required: false,
                        //     where: {
                        //         'Status': 1,
                        //         'BillTypeId': [2, 3],
                        //         'PatientBillStatusId': 3,
                        //         'IsPharmacyBill': true,
                        //         'PharmacySaleTypeId': { '$gt': '0' }
                        //     }, as: 'PharmacyBills'
                        // });
                        let billPackageInclusionQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('PackageAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1,
                                'ActiveStatusId': 2
                            }]
                        }, 'InclusionAmount');
                        attributes.include.push(billPackageInclusionQry);
                        let billPackageExclusionQry = this.GetSelectQuery(this.Models.PatientBillPackageSummary, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('ExclusionAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'ExclusionAmount');
                        attributes.include.push(billPackageExclusionQry);
                        let billPackageDiscountQry = this.GetSelectQuery(this.Models.EncounterIPPackage, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('DiscountAmount'))],
                            where: [this.Dal.literal('`EncounterId` = `Encounter`.`EncounterId`'),
                            {
                                'Status': 1
                            }]
                        }, 'PackageDiscountAmount');
                        attributes.include.push(billPackageDiscountQry);
                        break;
                    case EncounterFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case EncounterFilters.IncludePatientCertifiate:
                        include.push({
                            model: this.Models.PatientCertificate, where: patientCertificateWhere, required: isReqPatientCertificate,
                            include: [
                                this.GetReference('CertificateStatus')
                            ]
                        });
                        break;
                    case EncounterFilters.CertificateStatusId:
                        patientCertificateWhere['CertificateStatusId'] = param.Value;
                        isReqPatientCertificate = true;
                        break;
                    case EncounterFilters.DischargeTypeId:
                        where['DischargeTypeId'] = param.Value;
                        break;
                    case EncounterFilters.AppointmentId:
                        where['AppointmentId'] = param.Value;
                        break;
                    case EncounterFilters.BedBoardAdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IncludeDoctors:
                        include.push({ model: this.Models.EncounterDoctor, required: false });
                        break;
                    case EncounterFilters.IsBillLock:
                        where['IsBillLock'] = param.Value;
                        break;
                    case EncounterFilters.AdmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case EncounterFilters.IsReadmission:
                        where['IsReadmission'] = param.Value;
                        break;
                    case EncounterFilters.IsPaidVisit:
                        where['IsPaidVisit'] = param.Value;
                        break;
                    case EncounterFilters.FreeVisit:
                        where['FreeVisit'] = param.Value;
                        break;
                    case EncounterFilters.IsEstimatedBill:
                        where['IsEstimatedBill'] = param.Value;
                        break;
                    case EncounterFilters.TeamId:
                        where['TeamId'] = param.Value;
                        break;
                    case EncounterFilters.IsSurgery:
                        where['IsSurgery'] = param.Value;
                        break;
                    case EncounterFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case EncounterFilters.IsBillModified:
                        where['IsBillModified'] = param.Value;
                        break;
                    case EncounterFilters.IsPackageAssigned:
                        where['IsPackageAssigned'] = param.Value;
                        break;
                  case EncounterFilters.TpaId:
    (GuarantorWhere as any)[Op.or] = [{ 'TpaId': param.Value }];
    isReqGuarantor = true;
    break;
                    case EncounterFilters.IsDayCare:
                        where['IsDayCare'] = param.Value;
                        break;
                    case EncounterFilters.IPnumsort:
                        issortbyipnumber = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (includeBill === true) {
            include.push({
                model: this.Models.PatientBills,
                attributes: ['Id', 'BillDateTime', 'BillNumber', 'BillAmount',
                    'BillDiscount', 'OutStandingAmount', 'RefundAmount', 'BillDiscountModeId',
                    'RoundOffValue', 'PaidAmount', 'OTRegisterId', 'BillTypeId', 'CancelReqRaisedStatusId'],
                required: isBillRequired,
                where: billWhere, as: 'FinalBills'
            });
        }
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'FacilityId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['Id', 'GuarantorName', 'TPAId'],
            where: GuarantorWhere,
            required: isReqGuarantor,
            include: [this.GetReference('TPA')]
        });
        // include.push({
        //     model: this.Models.PatientGuarantor,
        //     attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
        //     where: patientGuarantorWhere,
        //     required: isReqPatientGuarantor,
        //     include: [this.GetReference('GuarantorType', ['Description', 'ColorCode']), this.GetReference('Tpa')]
        // });
        let WardQry: any = {
            model: this.Models.WardMaster,
            attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
            where: WardWhere,
            required: IsWardSearch
        };
        include.push(WardQry);
        order.push(['AdmissionDate', 'DESC']);
        if (issortbyipnumber) {
            order.push(['VisitIdentifier', 'DESC']);
        }
        //apiReq.Attributes = attributes;
        /*apiReq.Attributes = ['Id', 'EncounterTypeId',
            'WardId', 'GuarantorId', 'PatientId', 'DoctorId', 'AdmissionStatusId',
            'BedId', 'RoomId', 'AdmissionDate'];*/
        // apiReq.Attributes = apiReq.Attributes || attributes || {exclude: ['PatientMrn']};
        console.log(apiReq.Attributes);
        console.log('*********');
        apiReq.Attributes = apiReq.Attributes || attributes;
        console.log(apiReq.Attributes);
        // let exclude: Array<any> = ['PatientMrn','AdmissionPriorityId','AdmissionRequestId','AdmissionRequestTypeId'];
        let exclude: Array<any> = ['PatientMrn', 'DoctorName', 'SecondaryDoctorId', 'SecondaryDoctorName', 'SpecialityId',
            'DepartmentId', 'GuarantorId', 'EligibleAmount', 'CreditLimit',
            'ExpectedDischargeDate', 'DeathDate', 'SurgeryDate', 'OrganizationId', 'TokenId', 'AdmissionRequestTypeId',
            'ArrivedDate', 'CallDate', 'BookingId', 'AdmissionRequestId', 'PreviousEncounterId', 'IsReadmission', 'IsLatest',
            'IsDay1Discharge', 'AppointmentId',
            'AdmittingReasonId', 'AssignId', 'AssignedGroupId', 'VisitReasonId', 'Comments', 'ALOS', 'LocationId', 'ServiceRateCategoryId',
            'DiagnosisId', 'AdmitDiagnosis',
            'AttenderName', 'GuardianTypeId', 'AttenderPhone', 'IsMRDRequest', 'IsWalkin', 'IsMLC', 'PriorityId', 'AdmissionPriorityId',
            'ClinicalStaffId', 'IsMassCasuality',
            'IsPharmacyClearance', 'IsOPClearance',
            'DischargeDepartmentId',
            'EncounterStatusId', 'MergedEncounterId', 'Status', 'Rev',
            'CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt',
            'RemarkId', 'ReferralTypeId', 'OtherDiagnosis', 'DischargeTypeId', 'PatientDietNbmTypeId',
            'EncounterIPPackageId', 'IPPackageId',
            'VisitTypeId', 'TeamId', 'IsNoBill', 'IsPaidVisit',
            'FreeVisit', 'IsBillCompleted', 'IsSurgery',
            'IsAdmission', 'ProcedureId', 'Diagnosis2Id',
            'Diagnosis3Id', 'CPTDiagnosisId', 'ClincalStatusId', 'EstimatedBillDist',
            'EstimatedBillDistTypeId', 'IsEmergency', 'IsMRDFileCreation', 'IsReceived', 'IsBillModified', 'B2BCustomerMasterId',
            'ClinicalNotes', 'IsB2BCustomer', 'VisitCancelReason', 'TriageLevelId', 'IsOscc', 'PatientLocation', 'IsEmergencyVisit',
            'ISMRDReturn', 'AttenderName1',
            'GuardianTypeId1', 'AttenderPhone1',
            'ReceivedOn', 'ReceivedBy', 'IsAdditionalVisit',
            'IsIncompleteMRD', 'MRDIpFileId', 'PromotionalSchemeId', 'InsuranceNumber', 'BillingStatusId', 'BillingRemarks'];
        return await this.FindAndCountAll(apiReq, {
            where: where, include: include,
            attributes: { exclude: exclude, include: attributes.include }, order: order
        });

    }
    public async PrintCurrentOccupancyReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetEncounters(apiReq);
        let Encounters = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let EncounterBillDetail: any = [];
        for (let idx in Encounters) {
            let item: any = {};
            item = Encounters[idx];
            let FinalBill = item.FinalBills[0];
            let BillDiscount = 0;
            let isFinalize = false;
            if (FinalBill) {
                isFinalize = true;
                BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
            }
            let Debit =
                (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
            item.Debit = Debit;
            let Credit = (!item.IsPackageAssigned ?
                (isNaN(parseFloat(item.BillAmount)) ? 0 : parseFloat(item.BillAmount)) :
                (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount)) +
                (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount))) -
                (isFinalize ? BillDiscount :
                    (!item.IsPackageAssigned ?
                        (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                        (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

            item.Credit = (isNaN(Credit) ? 0 : (Credit));
            item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
            if (item.FinalBills.length > 0)
                item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                    0 : parseFloat(item.FinalBills[0].RefundAmount));
            if (item.PharmacyBills.length > 0) {
                let pharbillamt = 0;
                let pharbilldue = 0;
                for (let pdx in item.PharmacyBills) {
                    let pharmacybill = item.PharmacyBills[pdx];
                    pharbillamt += pharmacybill.BillAmount;
                    pharbilldue += pharmacybill.OutStandingAmount;
                }
                item.PharmacyDue = pharbilldue;
                item.PharmacyBillAmt = pharbillamt;
            }
            EncounterBillDetail.push(item);
        }
        let TotalDebit: number = 0;
        let TotalCredit: number = 0;
        let TotalBalance: number = 0;
        let TotalPharmacyBill: number = 0;
        let TotalPharmacyDue: number = 0;
        let totdebit: number = 0;
        let totcredit: number = 0;
        let totbalance: number = 0;
        let totbill: number = 0;
        let totdue: number = 0;
        for (let idx in EncounterBillDetail) {
            let billdetail = EncounterBillDetail[idx];
            totdebit += billdetail.Debit;
            totcredit += billdetail.Credit;
            totbalance += billdetail.Balance;
            totbill += billdetail.PharmacyBillAmt;
            totdue += billdetail.PharmacyDue;
        }
        TotalDebit = totdebit;
        TotalCredit = totcredit;
        TotalBalance = totbalance;
        TotalPharmacyBill = totbill;
        TotalPharmacyDue = totdue;

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus,
            EncounterBillDetail: EncounterBillDetail,
            TotalDebit: TotalDebit,
            TotalCredit: TotalCredit,
            TotalBalance: TotalBalance
        };
        let pdfOption: any = null;
        let key = 'currentoccupancyreport';
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
    public async PrintIPOccupancyAdvanceReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetIPPatientsBills(apiReq);
        let Encounters = data.Data;
        let dateformat = 'DD/MM/YYYY';
        let AdmissionDate = moment(apiReq.Data.AdmDate).format(dateformat);
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DoctorName = apiReq.Data.DoctorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let EncountersData = data.Data[0];
        let EncounterBillDetail: any = [];
        for (let idx in Encounters) {
            let item: any = {};
            let FinalBill: any;
            let TotBillAmt: any;
            let Credit: any;
            item = Encounters[idx];
            if (item.FinalBills.length === 1) {
                FinalBill = item.FinalBills[0];
            } else if (item.FinalBills.length > 1) {
                let lastIndex = item.FinalBills.length - 1;
                FinalBill = item.FinalBills[lastIndex];
            }
            // let FinalBill = item.FinalBills[0];
            let BillDiscount = 0;
            let isFinalize = false;
            if (FinalBill) {
                isFinalize = true;
                BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount || 0)) ? 0 : parseFloat(FinalBill.BillDiscount || 0);
            }
            TotBillAmt = parseFloat(item.BillAmount || 0) + parseFloat(item.RoundOffValue || 0);

            let Debit =
                (isNaN(parseFloat(item.Disallowance || 0)) ? 0 : parseFloat(item.Disallowance || 0)) +
                ((isNaN(parseFloat(item.TDS || 0)) ? 0 : parseFloat(item.TDS || 0))) +
                (isNaN(parseFloat(item.Debit || 0)) ? (0) : parseFloat(item.Debit || 0));
            item.Debit = Debit;
            Credit = (!item.IsPackageAssigned ?
                (isNaN(parseFloat(TotBillAmt || 0)) ? 0 : parseFloat(TotBillAmt || 0)) :
                (isNaN(parseFloat(item.InclusionAmount || 0)) ? (0) : parseFloat(item.InclusionAmount || 0)) +
                (isNaN(parseFloat(item.ExclusionAmount || 0)) ? (0) : parseFloat(item.ExclusionAmount))) -
                (isFinalize ? BillDiscount :
                    (!item.IsPackageAssigned ?
                        (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                        (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

            item.Credit = (isNaN(parseFloat(Credit || 0)) ? 0 : parseFloat(Credit || 0));
            item.Balance = (Credit - (isNaN(parseFloat(item.Debit || 0)) ? 0 : parseFloat(item.Debit || 0)));
            if (item.FinalBills.length > 0)
                item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                    0 : parseFloat(item.FinalBills[0].RefundAmount));

            if (item.PharmacyBills.length > 0) {
                let pharbillamt = 0;
                let pharbilldue = 0;
                for (let pdx in item.PharmacyBills) {
                    let pharmacybill = item.PharmacyBills[pdx];
                    pharbillamt += pharmacybill.BillAmount;
                    pharbilldue += pharmacybill.OutStandingAmount;
                }
                item.PharmacyDue = pharbilldue;
                item.PharmacyBillAmt = pharbillamt;
            }
            EncounterBillDetail.push(item);
        }
        let TotalDebit: number = 0;
        let TotalCredit: number = 0;
        let TotalBalance: number = 0;
        let TotalPharmacyBill: number = 0;
        let TotalPharmacyDue: number = 0;
        let totdebit: number = 0;
        let totcredit: number = 0;
        let totbalance: number = 0;
        let totbill: number = 0;
        let totdue: number = 0;
        for (let idx in EncounterBillDetail) {
            let billdetail = EncounterBillDetail[idx];
            totdebit += billdetail.Debit;
            totcredit += billdetail.Credit;
            totbalance += billdetail.Balance;
            totbill += billdetail.PharmacyBillAmt;
            totdue += billdetail.PharmacyDue;
        }
        TotalDebit = totdebit;
        TotalCredit = totcredit;
        TotalBalance = totbalance;
        TotalPharmacyBill = totbill;
        TotalPharmacyDue = totdue;

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            Encounters: Encounters,
            Preferences: printPreferencesData,
            AdmissionDate: AdmissionDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            DoctorName: DoctorName,
            AdmissionStatus: AdmissionStatus,
            EncounterBillDetail: EncounterBillDetail,
            TotalDebit: TotalDebit,
            TotalCredit: TotalCredit,
            TotalBalance: TotalBalance
        };
        let pdfOption: any = null;
        let key = 'ipoccupancyreportwithadvance';
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

    public async PrintIPDueReport(apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        let data = await this.GetIPPatientsBills(apiReq);
        let IpdiscList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let EncountersData = data.Data[0];
        let PatientIpBills: any = [];
        let TotalBillAmount: number = 0;
        let TotalDueAmount: number = 0;
        let TotalNetAmount: number = 0;
        IpdiscList.forEach((Encounter: any) => {
            let IpBillData = Encounter;
            let BillData = IpBillData.FinalBills[0];
            if (BillData.OutStandingAmount > 0) {
                IpBillData.GrossAmount = parseFloat(BillData.BillAmount);
                IpBillData.BillDiscount = parseFloat(BillData.BillDiscount);
                IpBillData.OutStandingAmount = parseFloat(BillData.OutStandingAmount);
                IpBillData.NetAmount = (parseFloat(IpBillData.GrossAmount) - parseFloat(IpBillData.BillDiscount));
                PatientIpBills.push(IpBillData);
            }
        });
        for (let idx in PatientIpBills) {
            let item = PatientIpBills[idx];
            TotalBillAmount += item.GrossAmount;
            TotalDueAmount += item.OutStandingAmount;
            TotalNetAmount += item.NetAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncountersData.FacilityId);
        let info = {
            PatientIpBills: PatientIpBills,
            IpdiscList: IpdiscList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            WardName: WardName,
            GuarantorName: GuarantorName,
            TotalBillAmount: TotalBillAmount,
            TotalDueAmount: TotalDueAmount,
            TotalNetAmount: TotalNetAmount
        };
        let pdfOption: any = null;
        let key = 'ipduereport';
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

    public async GetDocStatsDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.NewVisitCount(req) });
        result.push({ Key: 2, Value: await this.FollowupCount(req) });
        return result;
    }

    public async NewVisitCount(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let docnewvisitInstance: any = await this.FindAll({
            attributes: ['Status', 'EncounterTypeId', 'DoctorId', 'AdmissionDate', 'FacilityId', 'VisitTypeId'],
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': 1,
            },
            include: [DoctorGroupJoin]
        });
        if (docnewvisitInstance) {
            let groupbills = _.groupBy(docnewvisitInstance, 'DoctorId');
            // let NewCount: number = 0;
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let NewCount: number = 0;
                let DoctorId: number = 0;
                let EncounterId: number = 0;
                let DoctorName: string = '';
                NewCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    DoctorId = bills.DoctorId;
                    EncounterId = bills.Id;
                    DoctorName = bills.Doctor;
                    // GuarantorType = bills.GuarantorType.Description;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                }
                let info = {
                    'EncounterId': EncounterId,
                    'DoctorId': DoctorId,
                    'DoctorName': DoctorName,
                    'NewCount': NewCount
                };
                DoctorGroup[DoctorId].push(info);
            }
            // for (let i = 0; i < docnewvisitInstance.length; i++) {
            //     NewCount = docnewvisitInstance.length;
            //     let Enc: any = this.GetAttribute(docnewvisitInstance[i]);
            //     let DoctorId = Enc.DoctorId;
            //     DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
            //     let info = {
            //         'EncounterId': Enc.EncounterId,
            //         'DoctorId': DoctorId,
            //         'DoctorName': Enc.Doctor,
            //         'NewCount': NewCount
            //     };
            //     DoctorGroup[DoctorId].push(info);
            // }
        }
        return DoctorGroup;
    }

    public async FollowupCount(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let docfollowupvisitInstance: any = await this.FindAll({
            attributes: ['Status', 'EncounterTypeId', 'DoctorId', 'AdmissionDate', 'FacilityId', 'VisitTypeId'],
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': 2,
            },
            include: [DoctorGroupJoin]
        });
        if (docfollowupvisitInstance) {
            let groupbills = _.groupBy(docfollowupvisitInstance, 'DoctorId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let FollowUpCount: number = 0;
                let DoctorId: number = 0;
                let EncounterId: number = 0;
                let DoctorName: string = '';
                FollowUpCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    DoctorId = bills.DoctorId;
                    EncounterId = bills.Id;
                    DoctorName = bills.Doctor;
                    // GuarantorType = bills.GuarantorType.Description;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                }
                let info = {
                    'EncounterId': EncounterId,
                    'DoctorId': DoctorId,
                    'DoctorName': DoctorName,
                    'FollowUpCount': FollowUpCount
                };
                DoctorGroup[DoctorId].push(info);
            }

            // for (let i = 0; i < docfollowupvisitInstance.length; i++) {
            //     FollowUpCount = docfollowupvisitInstance.length;
            //     let Enc: any = this.GetAttribute(docfollowupvisitInstance[i]);
            //     let DoctorId = Enc.DoctorId;
            //     DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
            //     let info = {
            //         'EncounterId': Enc.EncounterId,
            //         'DoctorId': DoctorId,
            //         'DoctorName': Enc.Doctor,
            //         'FollowUpCount': FollowUpCount
            //     };
            //     DoctorGroup[DoctorId].push(info);
            // }
        }
        return DoctorGroup;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let opVisitCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': [1, 2]
            }
        });
        let opNewVisitCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': 1,
            }
        });
        let opFollowUpVisitCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'VisitTypeId': 2,
            }
        });
        let totaladmissionCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [2, 3, 4, 5, 6] },
                // 'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let datewiseadmissionCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                // 'AdmissionStatusId': { '$in': [2, 3, 4, 5, 6] },
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let admissionCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                // 'AdmissionStatusId': 2,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let dischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
                'DischargeDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let FitfordischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 3,
                // 'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let ClinicaldischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 4,
                // 'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let FinancedischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 5,
                // 'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let PendingdischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [3, 4] },
                // 'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'OPVisitCount': opVisitCount,
            'opNewVisitCount': opNewVisitCount,
            'opFollowUpVisitCount': opFollowUpVisitCount,
            'TotalAdmissionCount': totaladmissionCount,
            'AdmissionCount': admissionCount,
            'DischargeCount': dischargeCount,
            'FitfordischargeCount': FitfordischargeCount,
            'ClinicaldischargeCount': ClinicaldischargeCount,
            'FinancedischargeCount': FinancedischargeCount,
            'DateAdmissionCount': datewiseadmissionCount,
            'PendingdischargeCount': PendingdischargeCount
        };
    }

    public async GetFacilityCovidBedDetail(req: BaseRequest): Promise<any> {
        let covidadmissionCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [2, 3, 4, 5, 6] },
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        let coviddischargeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
                'DischargeDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        let coviddeathCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
                'DischargeTypeId': 2,
                'DischargeDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'DeathDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        let Covid10dayCount = [];
        let coviddischargebefore10Count = await this.Items.findAll({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'DischargeDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        if (coviddischargebefore10Count) {
            for (let i = 0; i < coviddischargebefore10Count.length; i++) {
                let enData: any = this.GetAttribute(coviddischargebefore10Count[i]);
                let AdmDate = '';
                let DiscDate = '';
                AdmDate = enData.AdmissionDate;
                DiscDate = enData.DischargeDate;
                let info = {
                    'AdmDate': AdmDate,
                    'DiscDate': DiscDate,
                };
                Covid10dayCount.push(info);
            }
        }
        let covidventilatorCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [2, 3, 4, 5] },
                'AdmittingReasonId': 5,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        let covidHighflowO2Count = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [2, 3, 4, 5] },
                'AdmittingReasonId': 6,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        let covidmildCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': { '$in': [2, 3, 4, 5] },
                'AdmittingReasonId': 7,
                'AdmissionDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            },
            include: [{
                model: this.Models.WardRoomBedMaster,
                attributes: ['Id', 'WardId', 'IsCovidBed'],
                where: {
                    'IsCovidBed': true
                },
                required: true
            }]
        });
        return {
            'covidadmissionCount': covidadmissionCount,
            'coviddischargeCount': coviddischargeCount,
            'coviddeathCount': coviddeathCount,
            'Covid10dayCount': Covid10dayCount,
            'covidventilatorCount': covidventilatorCount,
            'covidHighflowO2Count': covidHighflowO2Count,
            'covidmildCount': covidmildCount
        };
    }

    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let AppointCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 1,
                'AdmissionDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'AppointCount': AppointCount
        };
    }

    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let inpatientcount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 2,
            }
        });
        let dischargedcount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterTypeId': 2,
                'AdmissionStatusId': 6,
            }
        });
        return {
            'inpatientCount': inpatientcount,
            'dischargedcount': dischargedcount
        };
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EncounterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['VisitIdentifier', 'Text']];
        let val = await this.GetEncounters(apiReq);
        return { [key]: val.Data };
    }

    public async AddDummyOPEncounter(req: BaseRequest): Promise<number> {

        req.Data.VisitIdentifier = null;
        let currentdate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        let frmDate = moment(req.Data.AdmissionDate).format('YYYY-MM-DD 00:00:00');
        if (currentdate !== frmDate) {
            let toDate = moment(req.Data.AdmissionDate).format('YYYY-MM-DD 23:59:59');
            let maxpidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('EncounterId')), 'EncounterId'],
                ],
                where: {
                    EncounterTypeId: 1,
                    AdmissionDate: { '$gt': frmDate, '$lte': toDate }
                }
            });
            if (maxpidInstance) {
                let patient: any = this.GetAttribute(maxpidInstance);
                let lastpid = patient['EncounterId'];
                if (lastpid) {
                    let encounterinfo = await this.GetEncounterById({ Id: lastpid });
                    let LatestVisitIdentifier = encounterinfo.VisitIdentifier;
                    let lastnr = Number(LatestVisitIdentifier);
                    lastnr++;
                    req.Data.VisitIdentifier = lastnr;
                }
            }
        }

        if (req.Data.PatientId && req.Data.VisitTypeId === 2) { // Followup checkout old visit
            let previousEncounter: any = { IsLatest: false };
            await this.Update(previousEncounter, {
                fields: ['IsLatest'],
                where: {
                    PatientId: req.Data.PatientId,
                    EncounterTypeId: 1, // OP Checkout
                    IsLatest: true
                }
            });
        }
        let result = await this.Save(req.Data);
        let EncounterId = result.dataValues.Id;
        if (!req.Data.VisitIdentifier) {
            try {
                this.deferSequenceKey(EncounterId, 'VisitIdentifier',
                    this.getSequenceIdentifier(SequenceKeys.OPEncounter));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }
        return EncounterId;
    }

    public async AddDummyIPEncounter(req: BaseRequest): Promise<number> {
        if (req.Data.PatientId) { // old op visit checkout
            let previousEncounter: any = { IsLatest: false };
            await this.Update(previousEncounter, {
                fields: ['IsLatest'],
                where: {
                    PatientId: req.Data.PatientId,
                    EncounterTypeId: 1, // OP Checkout
                    IsLatest: true
                }
            });
        }

        req.Data.VisitIdentifier = null;
        let currentdate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        let frmDate = moment(req.Data.AdmissionDate).format('YYYY-MM-DD 00:00:00');
        if (currentdate !== frmDate) {
            let toDate = moment(req.Data.AdmissionDate).format('YYYY-MM-DD 23:59:59');
            let maxpidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('EncounterId')), 'EncounterId'],
                ],
                where: {
                    EncounterTypeId: 2,
                    AdmissionDate: { '$gt': frmDate, '$lte': toDate }
                }
            });
            console.log('Admission From ' + frmDate + ' To  ' + toDate);
            if (maxpidInstance) {
                let patient: any = this.GetAttribute(maxpidInstance);
                let lastpid = patient['EncounterId'];
                if (lastpid) {
                    let encounterinfo = await this.GetEncounterById({ Id: lastpid });
                    let LatestVisitIdentifier = encounterinfo.VisitIdentifier;
                    console.log('LatestVisitIdentifier ' + LatestVisitIdentifier);
                    if (LatestVisitIdentifier) {
                        let lastnr = Number(LatestVisitIdentifier);
                        lastnr++;
                        req.Data.VisitIdentifier = lastnr;
                    }
                }
            }
        }

        let result = await this.Save(req.Data);
        let EncounterId = result.dataValues.Id;
        req.Data.EncounterId = EncounterId;

        if (!req.Data.VisitIdentifier) {
            try {
                this.deferSequenceKey(EncounterId, 'VisitIdentifier',
                    this.getSequenceIdentifier(SequenceKeys.Admission));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }

        let admissionlogbo = BoFactory.GetBo(inpatientBO.PatientAdmissionLogBo, this.Request);
        let bedOccupancyHistory = BoFactory.GetBo(inpatientBO.BedOccupancyHistoryBo, this.Request);
        let AdmissionLog: any = {
            Data: {
                EncounterId: EncounterId,
                AdmissionStatusId: req.Data.AdmissionStatusId,
                AdmittingReasonId: 3,
                DoctorId: req.Data.DoctorId
            }
        };
        if (req.Data.AdmissionStatusId === 2) {
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: WardRoomBedMasterFilters.WardId, Value: req.Data.WardId },
                    { Key: WardRoomBedMasterFilters.BedStatusId, Value: 1 }
                ]
            };
            let wardRoomBedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
            let resguardata = await wardRoomBedBO.GetWardRoomBedMasters(apiReq);
            if (resguardata && resguardata.Data.length > 0) {
                let bedBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
                let bedRequest: any = {
                    Data: { Id: resguardata.Data[0].Id, BedStatusId: 2 }
                };
                await bedBO.UpdateBedMaster(bedRequest);

                let bedOccupancyInfo: any = {
                    Data: {
                        EncounterId: EncounterId,
                        PatientId: req.Data.PatientId,
                        LocationId: resguardata.Data[0].LocationId,
                        WardId: resguardata.Data[0].WardId,
                        DoctorId: req.Data.DoctorId,
                        DepartmentId: req.Data.DepartmentId,
                        RoomId: resguardata.Data[0].RoomId,
                        BedId: resguardata.Data[0].Id,
                        AdmissionDate: req.Data.AdmissionDate,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        AdmitStatusId: req.Data.AdmissionStatusId,
                        PatientBillId: 0,
                        OccupancyStatusId: 1,
                        IsPrimaryBed: 1,
                        BillingStartDate: new Date(),
                        // BillingEndDate: new Date()
                    }
                };
                await bedOccupancyHistory.ManageBedOccupancyHistory(bedOccupancyInfo);

                if (EncounterId) {
                    let patientEncounterData = await this.GetEncounterById({ Id: EncounterId });
                    if (patientEncounterData) {
                        patientEncounterData.LocationId = resguardata.Data[0].LocationId,
                            patientEncounterData.RoomId = resguardata.Data[0].RoomId,
                            patientEncounterData.RoomId = resguardata.Data[0].RoomId,
                            patientEncounterData.BedId = resguardata.Data[0].Id,
                            await this.Update(patientEncounterData);
                    }
                }

            }
        }

        req.Data.FacilityId = this.Session.FacilityId;
        req.Data.OrganizationId = 1;
        req.Data.StartDate = req.Data.AdmissionDate;
        req.Data.EndDate = null;
        req.Data.IsPrimary = true;
        req.Data.EncounterDoctorStatus = 2;
        req.Data.Id = null;

        let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
        await encounterDocBO.AddEncounterDoctor(req);

        let encounterGuarantorBo = BoFactory.GetBo(bo.EncounterGuarantorBo, this.Request);
        let encounterGuarantor: any = {};
        encounterGuarantor.Id = 0;
        encounterGuarantor.PatientId = req.Data.PatientId;
        encounterGuarantor.EncounterId = req.Data.EncounterId;
        encounterGuarantor.FacilityId = req.Data.FacilityId;
        encounterGuarantor.PatientGuarantorId = req.Data.GuarantorId;
        encounterGuarantor.ServiceRateCategoryId = req.Data.ServiceRateCategoryId;
        encounterGuarantor.GuarantorId = 2000;
        encounterGuarantor.GuarantorName = 'Free';
        encounterGuarantor.GuarantorTypeId = 6;
        encounterGuarantor.ActiveStatusId = 2;
        encounterGuarantor.Rank = 1;
        await encounterGuarantorBo.Save(encounterGuarantor);

        await admissionlogbo.AddPatientAdmissionLog(AdmissionLog);



        return EncounterId;
    }

    public async BIDepartmentCount(req: BaseRequest): Promise<number> {
        let BIRptDeptCount: any = {};
        for (let j = 0, len = req.Data.length; j < len; j++) {
            let frmdt = req.Data[j].DispDate;
            if (!BIRptDeptCount[frmdt]) BIRptDeptCount[frmdt] = {};
            let newreq: any = {
                Data: []
            };
            newreq.Data = req.Data[j];
            if (newreq && newreq.Data && newreq.Data.FromDate) {
                if (!BIRptDeptCount[frmdt]['OPDept']) {
                    BIRptDeptCount[frmdt]['OPDept'] = [];
                }
                if (!BIRptDeptCount[frmdt]['IPDept']) {
                    BIRptDeptCount[frmdt]['IPDept'] = [];
                }
                if (!BIRptDeptCount[frmdt]['DGDept']) {
                    BIRptDeptCount[frmdt]['DGDept'] = [];
                }
                BIRptDeptCount[frmdt]['OPDept'].push(await this.OPDeptCount(newreq));
                BIRptDeptCount[frmdt]['IPDept'].push(await this.IPDeptCount(newreq));
                BIRptDeptCount[frmdt]['DGDept'].push(await this.DGDeptCount(newreq));
            }
        }
        return BIRptDeptCount;
    }

    public async BIDoctorCount(req: BaseRequest): Promise<number> {
        let BIRptDoctorCount: any = {};
        for (let j = 0, len = req.Data.length; j < len; j++) {
            let frmdt = req.Data[j].DispDate;
            if (!BIRptDoctorCount[frmdt]) BIRptDoctorCount[frmdt] = {};
            let newreq: any = {
                Data: []
            };
            newreq.Data = req.Data[j];
            if (newreq && newreq.Data && newreq.Data.FromDate) {
                if (!BIRptDoctorCount[frmdt]['OPDoctor']) {
                    BIRptDoctorCount[frmdt]['OPDoctor'] = [];
                }
                if (!BIRptDoctorCount[frmdt]['IPDoctor']) {
                    BIRptDoctorCount[frmdt]['IPDoctor'] = [];
                }
                if (!BIRptDoctorCount[frmdt]['DGDoctor']) {
                    BIRptDoctorCount[frmdt]['DGDoctor'] = [];
                }
                BIRptDoctorCount[frmdt]['OPDoctor'].push(await this.OPDoctorCount(newreq));
                BIRptDoctorCount[frmdt]['IPDoctor'].push(await this.IPDoctorCount(newreq));
                BIRptDoctorCount[frmdt]['DGDoctor'].push(await this.DGDoctorCount(newreq));
            }
        }
        return BIRptDoctorCount;
    }

    public async BIDepartmentOPCount(req: BaseRequest): Promise<number> {
        let BIRptDeptCount: any = {};
        for (let j = 0, len = req.Data.length; j < len; j++) {
            let frmdt = req.Data[j].DispDate;
            if (!BIRptDeptCount[frmdt]) BIRptDeptCount[frmdt] = {};
            let newreq: any = {
                Data: []
            };
            newreq.Data = req.Data[j];
            if (newreq && newreq.Data && newreq.Data.FromDate) {
                if (!BIRptDeptCount[frmdt]['OPNew']) {
                    BIRptDeptCount[frmdt]['OPNew'] = [];
                }
                if (!BIRptDeptCount[frmdt]['OPFollowUp']) {
                    BIRptDeptCount[frmdt]['OPFollowUp'] = [];
                }
                BIRptDeptCount[frmdt]['OPNew'].push(await this.OPDeptNewCount(newreq));
                BIRptDeptCount[frmdt]['OPFollowUp'].push(await this.OPDeptFollowUpCount(newreq));
            }
        }
        return BIRptDeptCount;
    }

    private async OPDeptCount(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let deptbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DepartmentId'],
            where: {
                Status: 1,
                EncounterTypeId: 1,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DeptGroupJoin]
        });
        if (deptbencountInstance) {
            for (let i = 0; i < deptbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(deptbencountInstance[i]);
                let DeptId = Enc.DepartmentId;
                let DeptName = 'General';
                if (Enc.Department && Enc.Department.DepartmentName) {
                    DeptName = Enc.Department.DepartmentName;
                }
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }
        return DeptGroup;
    }

    private async IPDeptCount(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let deptbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DepartmentId'],
            where: {
                Status: 1,
                EncounterTypeId: 2,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DeptGroupJoin]
        });
        if (deptbencountInstance) {
            for (let i = 0; i < deptbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(deptbencountInstance[i]);
                let DeptId = Enc.DepartmentId;
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let DeptName = 'General';
                if (Enc.Department && Enc.Department.DepartmentName) {
                    DeptName = Enc.Department.DepartmentName;
                }
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }
        return DeptGroup;
    }

    private async DGDeptCount(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let deptbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DepartmentId'],
            where: {
                Status: 1,
                EncounterTypeId: 4,
                CreatedAt: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DeptGroupJoin]
        });
        if (deptbencountInstance) {
            for (let i = 0; i < deptbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(deptbencountInstance[i]);
                let DeptId = Enc.DepartmentId;
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let DeptName = 'General';
                if (Enc.Department && Enc.Department.DepartmentName) {
                    DeptName = Enc.Department.DepartmentName;
                }
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }
        return DeptGroup;
    }

    private async OPDoctorCount(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let doctorbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DoctorId'],
            where: {
                Status: 1,
                EncounterTypeId: 1,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DoctorGroupJoin]
        });
        if (doctorbencountInstance) {
            for (let i = 0; i < doctorbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(doctorbencountInstance[i]);
                let DoctorId = Enc.DoctorId;
                DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DoctorId': DoctorId,
                    'DoctorName': Enc.Doctor
                };
                DoctorGroup[DoctorId].push(info);
            }
        }
        return DoctorGroup;
    }

    private async IPDoctorCount(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let doctorbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DoctorId'],
            where: {
                Status: 1,
                EncounterTypeId: 2,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DoctorGroupJoin]
        });
        if (doctorbencountInstance) {
            for (let i = 0; i < doctorbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(doctorbencountInstance[i]);
                let DoctorId = Enc.DoctorId;
                DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DoctorId': DoctorId,
                    'DoctorName': Enc.Doctor
                };
                DoctorGroup[DoctorId].push(info);
            }
        }
        return DoctorGroup;
    }

    private async DGDoctorCount(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let doctorbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DoctorId'],
            where: {
                Status: 1,
                EncounterTypeId: 4,
                CreatedAt: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DoctorGroupJoin]
        });
        if (doctorbencountInstance) {
            for (let i = 0; i < doctorbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(doctorbencountInstance[i]);
                let DoctorId = Enc.DoctorId;
                DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DoctorId': DoctorId,
                    'DoctorName': Enc.Doctor
                };
                DoctorGroup[DoctorId].push(info);
            }
        }
        return DoctorGroup;
    }

    private async OPDeptNewCount(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let deptbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DepartmentId'],
            where: {
                Status: 1,
                EncounterTypeId: 1,
                VisitTypeId: 1,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DeptGroupJoin]
        });
        if (deptbencountInstance) {
            for (let i = 0; i < deptbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(deptbencountInstance[i]);
                let DeptId = Enc.DepartmentId;
                let DeptName = 'General';
                if (Enc.Department && Enc.Department.DepartmentName) {
                    DeptName = Enc.Department.DepartmentName;
                }
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }
        return DeptGroup;
    }

    private async OPDeptFollowUpCount(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let deptbencountInstance: any = await this.FindAll({
            attributes: ['EncounterId', 'DepartmentId'],
            where: {
                Status: 1,
                EncounterTypeId: 1,
                VisitTypeId: 2,
                AdmissionDate: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
            include: [DeptGroupJoin]
        });
        if (deptbencountInstance) {
            for (let i = 0; i < deptbencountInstance.length; i++) {
                let Enc: any = this.GetAttribute(deptbencountInstance[i]);
                let DeptId = Enc.DepartmentId;
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let DeptName = 'General';
                if (Enc.Department && Enc.Department.DepartmentName) {
                    DeptName = Enc.Department.DepartmentName;
                }
                let info = {
                    'EncounterId': Enc.EncounterId,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }
        return DeptGroup;
    }

}
