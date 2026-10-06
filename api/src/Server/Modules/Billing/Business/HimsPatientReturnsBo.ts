import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as billingBO from '../../Billing/Business/Index';
import * as inventoryBO from '../../Pharmacy/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { join } from 'path';
import { PatientReturnsInstance, PatientReturnsAttributes } from '../Model/Interface/Index';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientReturnsFilters, PatientReturnDetailsFilters, PatientBillsFilters, PatientRefundFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as _ from 'lodash';
import {
    PatientFilters
} from '../../Registration/Common/Filters.e';
import * as regbo from '../../Registration/Business/Index';

export class PatientReturnsBo extends BaseBo<PatientReturnsInstance, PatientReturnsAttributes> {
    public async AddPatientReturns(req: BaseRequest): Promise<number> {
        //let seqidentifier = SequenceKeys.PharmacyReturnStore;
        // if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
        //     if (req.Data.Header.StoreTypeId === 1) {
        //         if (req.Data.Header.StoreSubTypeId === 2) {
        //             if (req.Data.Header.SequenceOptionId === 2) {
        //                 seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.PharmacyReturnStore, req.Data.Header.StoreMasterId);
        //                 req.Data.Header.ReturnNumber = await Sequence.Next(seqidentifier);
        //             } else {
        //                 req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //             }
        //         } else {
        //             req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //         }
        //     } else {
        //         req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //     }
        //     req.Data.Header.ReturnDateTime = new Date();
        // }
        let BillPaymentTypeId = -1;
        let result = await this.Save(req.Data.Header);
        let PatientReturnId = result.dataValues.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(billingBO.PatientReturnDetailsBo, this.Request);
            await detailBO.ManagePatientReturnDetails(PatientReturnId, req.Data.Details);
            if (req.Data.Header.Id <= 0 && req.Data.Header.PatientReturnStatusId === 3) {

                for (var i = 0, len = req.Data.paymentDetail.length; i < len; i++) {
                    if (req.Data.paymentDetail[i].Id <= 0) {
                        req.Data.paymentDetail[i].RefundIdentifier = await Sequence.Next(SequenceKeys.RefundNrId,
                            req.Data.Header.FacilityId);
                        req.Data.paymentDetail[i].ReturnDateTime = new Date();
                        req.Data.paymentDetail[i].PatientReturnId = PatientReturnId;
                        req.Data.paymentDetail[i].PharmacyReturnId = PatientReturnId;
                        if (BillPaymentTypeId < 0)
                            BillPaymentTypeId = req.Data.paymentDetail[i].PaymentTypeId;
                    }
                }

                let patientrefundBO = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
                await patientrefundBO.ManagePatientPharmacyRefund(PatientReturnId, req.Data.paymentDetail);


                let PatientBillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);

                /* Pharmacy Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */
                if (req.Data.Header.PharmacyReturnTypeId === 1 || req.Data.Header.PharmacyReturnTypeId === 2 ||
                    req.Data.Header.PharmacyReturnTypeId === 3 || req.Data.Header.PharmacyReturnTypeId === 4) {
                    let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                    if (req.Data.Header.PatientBills.length > 0) {
                        for (let pdx in req.Data.Header.PatientBills) {
                            let pBillId = req.Data.Header.PatientBills[pdx];
                            req.Data.Header.PatientBillId = pBillId;
                        }
                        if (req.Data.Header.PatientBillId) {
                            let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
                            if (req.Data.Header.RefundedAmount > 0) {
                                patientbill.RefundAmount = patientbill.RefundAmount + req.Data.Header.RefundedAmount;
                                await patientbillsBo.Update(patientbill);
                            } else {
                                if (patientbill.PaidAmount > 0 && patientbill.IsPaidFully) {
                                    patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                                } else if (patientbill.PaidAmount > 0 && patientbill.OutStandingAmount > 0) {
                                    if (req.Data.Header.NetAmount > patientbill.OutStandingAmount) {
                                        let RemainAmt = 0;
                                        RemainAmt = req.Data.Header.NetAmount - patientbill.OutStandingAmount;
                                        patientbill.RefundAmount = RemainAmt;
                                        patientbill.OutStandingAmount = 0;
                                    }
                                    if (req.Data.Header.NetAmount < patientbill.OutStandingAmount) {
                                        let RemainAmt = 0;
                                        RemainAmt = patientbill.OutStandingAmount - req.Data.Header.NetAmount;
                                        patientbill.ReturnedAmount = RemainAmt;
                                        patientbill.OutStandingAmount = patientbill.BillAmount - patientbill.OutStandingAmount -
                                            req.Data.Header.NetAmount;
                                    }
                                } else if (patientbill.OutStandingAmount > 0 && patientbill.PaidAmount === 0) {
                                    patientbill.ReturnedAmount = req.Data.Header.NetAmount;
                                    patientbill.OutStandingAmount = patientbill.OutStandingAmount - req.Data.Header.NetAmount;
                                }
                                await patientbillsBo.Update(patientbill);
                            }
                            await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                        }
                    } else {
                        let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
                        if (req.Data.Header.RefundedAmount > 0) {
                            patientbill.RefundAmount = patientbill.RefundAmount + req.Data.Header.RefundedAmount;
                            await patientbillsBo.Update(patientbill);
                        } else {
                            if (patientbill.PaidAmount > 0 && patientbill.IsPaidFully) {
                                patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                            } else if (patientbill.PaidAmount > 0 && patientbill.OutStandingAmount > 0) {
                                if (req.Data.Header.NetAmount > patientbill.OutStandingAmount) {
                                    let RemainAmt = 0;
                                    RemainAmt = req.Data.Header.NetAmount - patientbill.OutStandingAmount;
                                    patientbill.RefundAmount = RemainAmt;
                                    patientbill.OutStandingAmount = 0;
                                }
                                if (req.Data.Header.NetAmount < patientbill.OutStandingAmount) {
                                    let RemainAmt = 0;
                                    RemainAmt = patientbill.OutStandingAmount - req.Data.Header.NetAmount;
                                    patientbill.ReturnedAmount = RemainAmt;
                                    patientbill.OutStandingAmount = patientbill.BillAmount - patientbill.OutStandingAmount -
                                        req.Data.Header.NetAmount;
                                }
                            } else if (patientbill.OutStandingAmount > 0 && patientbill.PaidAmount === 0) {
                                patientbill.ReturnedAmount = req.Data.Header.NetAmount;
                                patientbill.OutStandingAmount = patientbill.OutStandingAmount - req.Data.Header.NetAmount;
                            }
                            await patientbillsBo.Update(patientbill);
                        }
                        await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                    }
                    // let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
                    // if (req.Data.Header.RefundedAmount > 0) {
                    //     patientbill.RefundAmount = patientbill.RefundAmount + req.Data.Header.RefundedAmount;
                    //     await patientbillsBo.Update(patientbill);
                    // } else {
                    //     patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                    //     await patientbillsBo.Update(patientbill);
                    // }

                    // await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                }
                /* Pharmacy Returned Qty Update Against Bill Ended Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */

                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
                if (req.Data.Header.PharmacyReturnTypeId === 6) {
                    let PatientBillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
                    await PatientBillBo.ManagePatientPharmacyReturns(PatientReturnId, req);

                    await PatientBillDetailBo.ManageIPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                }
                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
            }

            let seqidentifier = null;
            if (req.Data.Header.IsStoreSeparateSequence && req.Data.Header.IsStoreSeparateSequence === true) {
                if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
                    seqidentifier = this.getSepStoreSequenceIdentifier(SequenceKeys.PharmacyReturnNumberId,
                        req.Data.Header.StoreMasterId
                    );

                }
            } else {
                if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
                    req.Data.Header.ReturnDateTime = new Date();
                    seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyReturnNumberId,
                        req.Data.Header.FacilityId
                    );
                    if (req.Data.Header.StoreTypeId === 1 && req.Data.Header.StoreSubTypeId === 2 &&
                        req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.PharmacyReturnStore,
                            req.Data.Header.StoreMasterId);
                    }
                    if (req.Data.Header.StoreTypeId === 1) { // ONLY Medical
                        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
                        let billingPreferencesData =
                            await facilityPreferenceBO.GetPrintPreferences('billing', null, req.Data.Header.FacilityId);
                        let iPharmacyPaymodeSeqNr = 0;
                        try {
                            iPharmacyPaymodeSeqNr = parseInt(billingPreferencesData.pharmacypaymodeseqnr);
                        } catch (ex) { iPharmacyPaymodeSeqNr = 0; }
                        if (iPharmacyPaymodeSeqNr) {
                            if (BillPaymentTypeId > 0) {
                                if (req.Data.Header.PharmacyReturnTypeId === 4) { //Manual-Sales - MANRT10001
                                    seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetManualBill,
                                        req.Data.Header.FacilityId
                                    );
                                } else { //Cash-Sales - CASRT10001
                                    seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetCashBill,
                                        req.Data.Header.FacilityId
                                    );
                                }
                            } else {  //Credit-Sales- (outstanding) - CRTRT10001
                                seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetCreditBill,
                                    req.Data.Header.FacilityId
                                );
                            }
                        }
                    }


                }
            }

            // this.deferSequenceKey(PatientReturnId, 'ReturnNumber', seqidentifier);
            if (PatientReturnId > 0 && req.Data.Header.PatientReturnStatusId === 3) {
                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(22, PatientReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }
            }

            // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
            // await stockmovementBO.ManageStockMovements1(22, PatientReturnId, req.Data);

            if (seqidentifier) {
                const afterO: any = () => {
                    return ((bo, request, PatientReturnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = PatientReturnId;
                                request.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PatientReturnId);
                };

                this.deferSequenceKey(PatientReturnId, 'ReturnNumber', seqidentifier,
                    [
                        afterO().UpdateMovementInfo,
                        // afterO().updatePatientAccountsInfo,
                        afterO().SendBillDiscountSMS,
                    ]);

            }
            return PatientReturnId;
        }

        return 0;
    }

    public async AddStaffBillReturns(req: BaseRequest): Promise<number> {
        //let seqidentifier = SequenceKeys.PharmacyReturnStore;
        // if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
        //     if (req.Data.Header.StoreTypeId === 1) {
        //         if (req.Data.Header.StoreSubTypeId === 2) {
        //             if (req.Data.Header.SequenceOptionId === 2) {
        //                 seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.PharmacyReturnStore, req.Data.Header.StoreMasterId);
        //                 req.Data.Header.ReturnNumber = await Sequence.Next(seqidentifier);
        //             } else {
        //                 req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //             }
        //         } else {
        //             req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //         }
        //     } else {
        //         req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
        //     }
        //     req.Data.Header.ReturnDateTime = new Date();
        // }
        let BillPaymentTypeId = -1;
        let result = await this.Save(req.Data.Header);
        let PatientReturnId = result.dataValues.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(billingBO.PatientReturnDetailsBo, this.Request);
            await detailBO.ManagePatientReturnDetails(PatientReturnId, req.Data.Details);
            if (req.Data.Header.Id <= 0 && req.Data.Header.PatientReturnStatusId === 2) {

                // for (var i = 0, len = req.Data.paymentDetail.length; i < len; i++) {
                //     if (req.Data.paymentDetail[i].Id <= 0) {
                //         req.Data.paymentDetail[i].RefundIdentifier = await Sequence.Next(SequenceKeys.RefundNrId);
                //         req.Data.paymentDetail[i].ReturnDateTime = new Date();
                //         req.Data.paymentDetail[i].PatientReturnId = PatientReturnId;
                //         req.Data.paymentDetail[i].PharmacyReturnId = PatientReturnId;
                //         if (BillPaymentTypeId < 0)
                //             BillPaymentTypeId = req.Data.paymentDetail[i].PaymentTypeId;
                //     }
                // }
                let patientrefundBO = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
                await patientrefundBO.ManagePatientPharmacyRefund(PatientReturnId, req.Data.paymentDetail);

                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(22, PatientReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }
                // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(22, PatientReturnId, req.Data);

                let PatientBillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
                // await detailBO.ManagePatientBillDetails(PatientBillId, req.Data.Details);
                /* Pharmacy Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */
                // if (req.Data.Header.PharmacyReturnTypeId === 1 || req.Data.Header.PharmacyReturnTypeId === 2 ||
                //     req.Data.Header.PharmacyReturnTypeId === 3 || req.Data.Header.PharmacyReturnTypeId === 4) {
                //     await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                // }
                /* Pharmacy Returned Qty Update Against Bill Ended Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */

                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
                if (req.Data.Header.PharmacyReturnTypeId === 7) {
                    let PatientBillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
                    await PatientBillBo.ManagePatientPharmacyReturns(PatientReturnId, req);
                    await PatientBillDetailBo.ManageStaffPatientReturnedQtyDetails(PatientReturnId, req.Data.Details);
                    // await PatientBillDetailBo.ManageIPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                }
                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
                if (req.Data.Header.StaffId > 0) {
                    let userbo = BoFactory.GetBo(appbo.UserBo, this.Request);
                    let UserInfo = await userbo.GetUserById({ Id: req.Data.Header.StaffId });
                    let paymentRequest: any = {
                        Data: {
                            Id: UserInfo.Id,
                            // PatientId: req.Data.Header.PatientId,
                            BillAmount: (UserInfo.BillAmount) - (req.Data.Header.ReturnAmount),
                            // PaidAmount: (UserInfo.PaidAmount) - (req.Data.Header.ReturnAmount),
                            OutStandingAmount: (UserInfo.OutStandingAmount) - (req.Data.Header.ReturnAmount),
                        }
                    };
                    await userbo.UpdateUserStaffBills(paymentRequest);
                }
            }
            console.log('******req.Data.Header*********', req.Data.Header);
            let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
            let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
            if (req.Data.Header.ReturnAmount > 0 && req.Data.Header.ReturnWithComeRefund === false) {
                console.log('******1*********');
                patientbill.ReturnedAmount = req.Data.Header.ReturnAmount;
                patientbill.OutStandingAmount = patientbill.OutStandingAmount - req.Data.Header.ReturnAmount;
                patientbill.BillAmount = patientbill.BillAmount - req.Data.Header.ReturnAmount;
                await patientbillsBo.Update(patientbill);
            } else {
                patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                await patientbillsBo.Update(patientbill);
            }

            let seqidentifier = null;
            if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 2) {
                req.Data.Header.ReturnDateTime = new Date();
                seqidentifier = SequenceKeys.PharmacyReturnNumberId;
                if (req.Data.Header.StoreTypeId === 1 && req.Data.Header.StoreSubTypeId === 2 &&
                    req.Data.Header.SequenceOptionId === 2) {
                    seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.PharmacyReturnStore,
                        req.Data.Header.StoreMasterId);
                }
                if (req.Data.Header.StoreTypeId === 1) { // ONLY Medical
                    let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
                    let billingPreferencesData =
                        await facilityPreferenceBO.GetPrintPreferences('billing', null, req.Data.Header.FacilityId);
                    let iPharmacyPaymodeSeqNr = 0;
                    try {
                        iPharmacyPaymodeSeqNr = parseInt(billingPreferencesData.pharmacypaymodeseqnr);
                    } catch (ex) { iPharmacyPaymodeSeqNr = 0; }
                    if (iPharmacyPaymodeSeqNr) {
                        if (BillPaymentTypeId > 0) {
                            if (req.Data.Header.PharmacyReturnTypeId === 5) { //Manual-Sales - MANRT10001
                                seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetManualBill,
                                    req.Data.Header.FacilityId
                                );
                            } else { //Cash-Sales - CASRT10001
                                seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetCashBill,
                                    req.Data.Header.FacilityId
                                );
                            }
                        } else {  //Credit-Sales- (outstanding) - CRTRT10001
                            seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetCreditBill,
                                req.Data.Header.FacilityId
                            );
                        }
                    }
                }


            }

            this.deferSequenceKey(PatientReturnId, 'ReturnNumber', seqidentifier);

            return PatientReturnId;
        }

        return 0;
    }

    public async AddCashToCreditReturns(req: BaseRequest): Promise<number> {
        if (req.Data && req.Data.Header) {
            let result = await this.Save(req.Data.Header);
            let PatientReturnId = result.dataValues.Id;
            let seqidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.PharmacyRetCreditBill,
                req.Data.Header.FacilityId
            );
            this.deferSequenceKey(PatientReturnId, 'ReturnNumber', seqidentifier);
            if (result) {
                let detailBO = BoFactory.GetBo(billingBO.PatientReturnDetailsBo, this.Request);
                await detailBO.ManagePatientReturnDetails(PatientReturnId, req.Data.Details);
            }
            return PatientReturnId;
        }
        return 0;
    }

    public async AddPatientDispenseReturn(DispenseReturnId: number, req: BaseRequest): Promise<any> {
        let BillInfo = req.Data.Header;
        let PatientReturn: any = {};
        PatientReturn = {
            Id: 0,
            ReturnNumber: await Sequence.Next(SequenceKeys.PharmacyReturnNumberId),
            ReturnDateTime: new Date(),
            ReturnTypeId: 6,
            ReturnPriorityId: 1,
            ReturnAmount: BillInfo.ReceivedValue,
            GrossAmount: BillInfo.ReceivedValue,
            NetAmount: BillInfo.ReceivedValue,
            GstAmount: BillInfo.TotalGstAmount,
            InGstAmount: BillInfo.TotalInGstAmount,
            CGstAmount: BillInfo.TotalCGstAmount,
            SGstAmount: BillInfo.TotalSGstAmount,
            NetPatientAmount: BillInfo.NetPatientAmount,
            NetInsuranceAmount: BillInfo.NetInsuranceAmount,
            ReturnGeneratedBy: BillInfo.ReturnReceivedBy,
            ReturnApprovedBy: BillInfo.ReturnReceivedBy,
            PackageDiscount: 0,
            OrganizationId: 0,
            FacilityId: BillInfo.FacilityId,
            DepartmentId: BillInfo.DepartmentId,
            StoreMasterId: BillInfo.StoreMasterId,
            PatientId: BillInfo.PatientId,
            PatientTypeId: BillInfo.PatientTypeId,
            PatientName: BillInfo.PatientName,
            TitleId: BillInfo.TitleId,
            GenderId: BillInfo.GenderId,
            Age: BillInfo.Age,
            EncounterId: BillInfo.EncounterId,
            EncounterTypeId: 2,
            GuarantorId: BillInfo.GuarantorId,
            GuarantorTypeId: BillInfo.GuarantorTypeId,
            GuarantorName: BillInfo.GuarantorName,
            PrivateDueId: 0,
            GuarantorDueId: 0,
            DoctorId: BillInfo.DoctorId,
            PatientReturnStatusId: 3,
            PharmacyReturnTypeId: 6
        };
        let patientReturnId: any;
        let result = await this.Save(PatientReturn);
        if (result) {
            let detailBO = BoFactory.GetBo(billingBO.PatientReturnDetailsBo, this.Request);
            patientReturnId = result.dataValues.Id;
            for (let pbd = 0, pbdlen = req.Data.Details.length; pbd < pbdlen; pbd++) {
                req.Data.Details[pbd].Id = 0;
                req.Data.Details[pbd].BillDateTime = new Date();
                req.Data.Details[pbd].Rate = 1 * req.Data.Details[pbd].Rate;
                req.Data.Details[pbd].Amount = 1 * req.Data.Details[pbd].Amount;
                req.Data.Details[pbd].GrossAmount = 1 * req.Data.Details[pbd].GrossAmount;
                req.Data.Details[pbd].NetAmountBeforeGst = 1 * req.Data.Details[pbd].NetAmountBeforeGst;
                req.Data.Details[pbd].NetAmount = 1 * req.Data.Details[pbd].NetAmount;
            }
            await detailBO.ManagePatientReturnDetails(patientReturnId, req.Data.Details);
        }
        return patientReturnId;
    }

    public async UpdatePatientReturns(req: BaseRequest): Promise<boolean> {
        // let seqidentifier = SequenceKeys.PharmacyReturnStore;


        if (req.Data.Header.Id > 0 && req.Data.Header.PatientReturnStatusId === 2) {
            req.Data.Header = await this.GetPatientReturnsById({ Id: req.Data.Header.Id });
            req.Data.Header.PatientReturnStatusId = 2;
        }
        let result = await this.Update(req.Data.Header);
        let PatientReturnId = req.Data.Header.Id;
        let seqidentifier = null;
        if (req.Data.Header.Id > 0 && !req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
            if (req.Data.Header.IsStoreSeparateSequence && req.Data.Header.IsStoreSeparateSequence === true) {
                if (!req.Data.Header.ReturnNumber && req.Data.Header.PatientReturnStatusId === 3) {
                    seqidentifier = this.getSepStoreSequenceIdentifier(SequenceKeys.PharmacyReturnNumberId,
                        req.Data.Header.StoreMasterId
                    );

                }
            } else {
                if (req.Data.Header.StoreTypeId === 1) {
                    if (req.Data.Header.StoreSubTypeId === 2) {
                        if (req.Data.Header.SequenceOptionId === 2) {
                            seqidentifier = this.getStoreSequenceIdentifier(
                                SequenceKeys.PharmacyReturnStore,
                                req.Data.Header.StoreMasterId);
                            req.Data.Header.ReturnNumber = await Sequence.Next(seqidentifier);
                        } else {
                            req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
                        }
                    } else {
                        req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
                    }
                } else {
                    req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
                }
            }
            req.Data.Header.ReturnDateTime = new Date();
            this.deferSequenceKey(PatientReturnId, 'ReturnNumber', seqidentifier);
        }

        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
            await detailBO.ManagePatientReturnDetails(PatientReturnId, req.Data.Details);
            if (req.Data.Header.Id > 0 && req.Data.Header.PatientReturnStatusId === 3) {

                for (var i = 0, len = req.Data.paymentDetail.length; i < len; i++) {
                    if (req.Data.paymentDetail[i].Id <= 0) {
                        req.Data.paymentDetail[i].RefundIdentifier = await Sequence.Next(SequenceKeys.RefundNrId);
                        req.Data.paymentDetail[i].ReturnDateTime = new Date();
                        req.Data.paymentDetail[i].PatientReturnId = PatientReturnId;
                        req.Data.paymentDetail[i].PharmacyReturnId = PatientReturnId;
                    }
                }

                let patientrefundBO = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
                await patientrefundBO.ManagePatientPharmacyRefund(PatientReturnId, req.Data.paymentDetail);

                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(22, PatientReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(22, PatientReturnId, req.Data);

                /* Pharmacy Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */
                if (req.Data.Header.PharmacyReturnTypeId === 1 || req.Data.Header.PharmacyReturnTypeId === 2 ||
                    req.Data.Header.PharmacyReturnTypeId === 3 || req.Data.Header.PharmacyReturnTypeId === 4) {
                    let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                    let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
                    if (req.Data.Header.RefundedAmount > 0) {
                        patientbill.RefundAmount = patientbill.RefundAmount + req.Data.Header.RefundedAmount;
                        await patientbillsBo.Update(patientbill);
                    } else {
                        patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                        await patientbillsBo.Update(patientbill);
                    }

                    let PatientBillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
                    await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                }
                /* Pharmacy Returned Qty Update Against Bill Ended Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */

                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
                if (req.Data.Header.PharmacyReturnTypeId === 6) {
                    let PatientBillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
                    await PatientBillBo.ManagePatientPharmacyReturns(PatientReturnId, req);
                }
                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
            }
            return PatientReturnId;
        }
        return result;
    }

    public async UpdateStaffBillReturns(req: BaseRequest): Promise<boolean> {
        let seqidentifier = SequenceKeys.PharmacyReturnStore;
        if (req.Data.Header.Id > 0 && !req.Data.Header.ReturnNumber && req.Data.Header.PatientBillStatusId === 3) {
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.PharmacyReturnStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.ReturnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
                    }
                } else {
                    req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
                }
            } else {
                req.Data.Header.ReturnNumber = await Sequence.Next(SequenceKeys.PharmacyReturnNumberId);
            }
            req.Data.Header.ReturnDateTime = new Date();
        }

        if (req.Data.Header.Id > 0 && req.Data.Header.PatientReturnStatusId === 2) {
            req.Data.Header = await this.GetPatientReturnsById({ Id: req.Data.Header.Id });
            req.Data.Header.PatientReturnStatusId = 2;
        }
        let result = await this.Update(req.Data.Header);
        let PatientReturnId = req.Data.Header.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
            await detailBO.ManagePatientReturnDetails(PatientReturnId, req.Data.Details);
            if (req.Data.Header.Id > 0 && req.Data.Header.PatientReturnStatusId === 3) {

                // for (var i = 0, len = req.Data.paymentDetail.length; i < len; i++) {
                //     if (req.Data.paymentDetail[i].Id <= 0) {
                //         req.Data.paymentDetail[i].RefundIdentifier = await Sequence.Next(SequenceKeys.RefundNrId);
                //         req.Data.paymentDetail[i].ReturnDateTime = new Date();
                //         req.Data.paymentDetail[i].PatientReturnId = PatientReturnId;
                //         req.Data.paymentDetail[i].PharmacyReturnId = PatientReturnId;
                //     }
                // }

                let patientrefundBO = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
                await patientrefundBO.ManagePatientPharmacyRefund(PatientReturnId, req.Data.paymentDetail);

                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(22, PatientReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(22, PatientReturnId, req.Data);

                /* Pharmacy Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */
                if (req.Data.Header.PharmacyReturnTypeId === 1 || req.Data.Header.PharmacyReturnTypeId === 2 ||
                    req.Data.Header.PharmacyReturnTypeId === 3 || req.Data.Header.PharmacyReturnTypeId === 4) {
                    let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                    let patientbill = await patientbillsBo.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
                    if (req.Data.Header.RefundedAmount > 0) {
                        patientbill.RefundAmount = patientbill.RefundAmount + req.Data.Header.RefundedAmount;
                        await patientbillsBo.Update(patientbill);
                    } else {
                        patientbill.ReturnedAmount = patientbill.ReturnedAmount + req.Data.Header.NetAmount;
                        await patientbillsBo.Update(patientbill);
                    }

                    let PatientBillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
                    await PatientBillDetailBo.ManageOPPatientReturnedQtyDetails(PatientReturnId, req.Data);
                }
                /* Pharmacy Returned Qty Update Against Bill Ended Here [PharmacyReturnTypeId = 1, 2, 3 & 4] */

                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
                if (req.Data.Header.PharmacyReturnTypeId === 6) {
                    let PatientBillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
                    await PatientBillBo.ManagePatientPharmacyReturns(PatientReturnId, req);
                }
                /* IP Admission Returned Qty Update Against Bill Started Here [PharmacyReturnTypeId = 6] */
            }
            return PatientReturnId;
        }
        return result;
    }

    public async GetPatientReturnsById(req: BaseRequest): Promise<PatientReturnsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientReturns(apiReq?: ApiRequest<PatientReturnsFilters>):
        Promise<ApiResponse<PatientReturnsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let admissionwhere: WhereOptions<any> = {};
        let isadmissionreq: any = false;
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.PatientBills, attributes: ['WardId', 'PaidAmount', 'RefundAmount', 'BillNumber', 'BillDateTime'],
            required: false,
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreName', 'LicenseNo', 'TinNo',
                'IsSeqbasedStore'
            ], required: false,
        });

        include.push(this.GetReference('PatientReturnStatus'));
        include.push(this.GetReference('GuarantorType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'LastName', 'MRN', 'Age', 'Mobile', 'MRNTypeId', 'GenderId'],
            required: false,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientReturnDetails,
            required: false,
            include: [{
                model: this.Models.ItemMaster, required: false
            }]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.Guarantor, as: 'GuarantorMaster', attributes: ['Code', 'GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.PatientRefund,
            required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientReturnsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatReturnDt:
                        where['ReturnDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientReturnsFilters.PatReturnNr:
                        where['ReturnNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientReturnsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientReturnStatusId': 1 }];
                        break;
                    case PatientReturnsFilters.PatientReturnStatus:
                        // where['PatientReturnStatusId'] = param.Value;
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PatientReturnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientReturnsFilters.ReturnPriority:
                        where['ReturnPriorityId'] = param.Value;
                        break;
                    case PatientReturnsFilters.ReturnType:
                        where['ReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientReturnsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Guarantor:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientReturnsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientReturnsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientReturnsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientReturnsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientReturnsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatientName:
                        where['PatientName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case PatientReturnsFilters.ReturnTypeId:
                        where['ReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.MultiReturnType:
                        where['ReturnTypeId'] = { '$in': param.Value };
                        break;
                    case PatientReturnsFilters.PharmacyReturnType:
                        where['PharmacyReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientReturnsFilters.IsRefundedFully:
                        where['IsRefundedFully'] = param.Value;
                        break;
                    case PatientReturnsFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case PatientReturnsFilters.TypeOfReturn:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReturnTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientReturnsFilters.FromDate:
                        where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                        (where['ReturnDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientReturnsFilters.ToDate:
                        where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                        (where['ReturnDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientReturnsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatNameMrn:
                        (where as any)['$or'] = [{ 'PatientMRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'PatientName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MobileNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientReturnsFilters.VisitIdentifier:
                        (admissionwhere as any)['$or'] = [{ 'VisitIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        isadmissionreq = true;
                        break;
                    case PatientReturnsFilters.WardId:
                        admissionwhere['WardId'] = param.Value;
                        isadmissionreq = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.Encounter, attributes: ['WardId', 'VisitIdentifier', 'RoomId', 'BedId'],
            where: admissionwhere,
            required: isadmissionreq,
            include: [
                {
                    model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
                },
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                }
            ],
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetStaffCreditReturns(apiReq?: ApiRequest<PatientReturnsFilters>):
        Promise<ApiResponse<PatientReturnsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.PatientBills, attributes: ['PaidAmount', 'RefundAmount', 'BillNumber', 'BillDateTime'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreName', 'LicenseNo', 'TinNo'], required: false,
        });

        include.push(this.GetReference('PatientReturnStatus'));
        include.push(this.GetReference('GuarantorType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'LastName', 'MRN', 'Age', 'Mobile', 'MRNTypeId', 'GenderId'],
            required: false,
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        include.push({
            model: this.Models.PatientReturnDetails,
            required: false,
            include: [{
                model: this.Models.ItemMaster, required: false
            }]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.Guarantor, as: 'GuarantorMaster', attributes: ['Code', 'GuarantorName'], required: false,
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientReturnsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatReturnDt:
                        where['ReturnDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientReturnsFilters.PatReturnNr:
                        where['ReturnNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientReturnsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientReturnStatusId': 1 }];
                        break;
                    case PatientReturnsFilters.PatientReturnStatus:
                        where['PatientReturnStatusId'] = param.Value;
                        break;
                    case PatientReturnsFilters.ReturnPriority:
                        where['ReturnPriorityId'] = param.Value;
                        break;
                    case PatientReturnsFilters.ReturnType:
                        where['ReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientReturnsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.Guarantor:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientReturnsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientReturnsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientReturnsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientReturnsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientReturnsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatientName:
                        where['PatientName'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case PatientReturnsFilters.ReturnTypeId:
                        where['ReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.MultiReturnType:
                        where['ReturnTypeId'] = { '$in': param.Value };
                        break;
                    case PatientReturnsFilters.PharmacyReturnType:
                        where['PharmacyReturnTypeId'] = param.Value;
                        break;
                    case PatientReturnsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientReturnsFilters.IsRefundedFully:
                        where['IsRefundedFully'] = param.Value;
                        break;
                    case PatientReturnsFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case PatientReturnsFilters.TypeOfReturn:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReturnTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientReturnsFilters.FromDate:
                        where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                        (where['ReturnDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientReturnsFilters.ToDate:
                        where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                        (where['ReturnDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientReturnsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientReturnsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientReturns(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientReturns(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.patientBill) ? req.Data.insuranceBill : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientReturns.PatientId }]
        };
        let patientinfo: any = {};
        if (PatientReturns.PatientId !== 0) {
            let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientFilters.Id, Value: PatientReturns.PatientId }]
            };
            let patientData = await patientBo.GetMinPatientSearch(patReq);
            patientinfo = patientData.Data[0];
        }
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientReturns.PatientBillId }]
        };
        let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let BillData = await patientbillsBo.GetPatientBills(billreq);
        let PatientBills = BillData.Data[0];
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: PatientReturns.PatientBillId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PatientReturns.ReturnDateTime);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PatientReturns.StoreMasterId
            }
        });
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            Encounter: encounterData.Data[0],
            PatientBills: PatientBills,
            PatientRefund: PatientRefundData.Data,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            WithoutTax: (PatientReturns.NetAmount) - (PatientReturns.CGstAmount + PatientReturns.SGstAmount),
            Preferences: printPreferencesData,
            Flags: flags,
            patientinfo: patientinfo
        };
        let pdfOption: any = null;
        let key = 'pharmacybillreturns';
        if (info.PatientReturns.PharmacyReturnTypeId === 4) {
            key = 'directpharmacyreturn';
        }
        // let reportKey = 'ippharmacyjson';
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
                    // height: '5.8in',
                    // width: '8.3in',
                    // orientation: 'landscape',
                    // border: '0',
                    // header: {
                    //     height: '0.7in',
                    //     contents: '',
                    // },
                    // footer: {
                    //     height: '0.5in',
                    //     contents: {
                    //         first: '',
                    //         default: '',
                    //         last: '',
                    //     },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientReturns1(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns: any = data.Data[0];
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PatientReturns.ReturnDateTime);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PatientReturns.StoreMasterId
            }
        });
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let gstGrp = _.groupBy(PatientReturnDetailsData.Data, 'GSTPercentage');
        let GstInfo: any = {};
        let GstgrpInfo: any = [];
        for (let cdx in gstGrp) {
            if (cdx !== '0') {
                let gstdata = gstGrp[cdx];
                let gstData: any = {
                    gstRate: '',
                    gstAmt: '',
                    cgstRate: '',
                    cgstAmt: '',
                    sgstRate: '',
                    sgstAmt: '',
                };
                let gstamt: any = 0;
                let cgstamt: any = 0;
                let sgstamt: any = 0;

                for (let jx in gstdata) {
                    GstInfo = gstdata[jx];
                    gstData.gstRate = GstInfo.GSTPercentage;
                    gstData.cgstRate = GstInfo.CGstPercentage;
                    gstData.sgstRate = GstInfo.SGstPercentage;
                    gstamt = gstamt + parseFloat(GstInfo.GSTAmount);
                    cgstamt = cgstamt + parseFloat(GstInfo.CGstAmount);
                    sgstamt = sgstamt + parseFloat(GstInfo.SGstAmount);
                    gstData.gstAmt = parseFloat(gstamt).toFixed(2);
                    gstData.cgstAmt = parseFloat(cgstamt).toFixed(2);
                    gstData.sgstAmt = parseFloat(sgstamt).toFixed(2);
                }
                GstgrpInfo.push(gstData);
            }
        }
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientReturns.PatientId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientinfo: any = {};
        if (PatientReturns.PatientId !== 0) {
            let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientFilters.Id, Value: PatientReturns.PatientId }]
            };
            let patientData = await patientBo.GetMinPatientSearch(patReq);
            patientinfo = patientData.Data[0];
        }
        let billreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientReturns.PatientBillId }]
        };
        let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let BillData = await patientbillsBo.GetPatientBills(billreq);
        let PatientBills = BillData.Data[0];
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: PatientReturns.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            Encounter: encounterData.Data[0],
            PatientBills: PatientBills,
            PatientRefund: PatientRefundData.Data,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            WithoutTax: (PatientReturns.NetAmount) - (PatientReturns.CGstAmount + PatientReturns.SGstAmount),
            Preferences: printPreferencesData,
            GstgrpInfo: GstgrpInfo,
            patientinfo: patientinfo
        };
        let pdfOption: any = null;
        let key = 'pharmacybillreturns1';
        if (info.PatientReturns.PharmacyReturnTypeId === 4) {
            key = 'directpharmacyreturn1';
        }
        // let reportKey = 'ippharmacyjson';
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
                    // height: '5.8in',
                    // width: '8.3in',
                    // orientation: 'landscape',
                    // border: '0',
                    // header: {
                    //     height: '0.7in',
                    //     contents: '',
                    // },
                    // footer: {
                    //     height: '0.5in',
                    //     contents: {
                    //         first: '',
                    //         default: '',
                    //         last: '',
                    //     },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPharmacyReturnReportforOTC(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let PaymentType = req.Data.PaymentType;
        let StoreName = req.Data.StoreName;
        let UserName = req.Data.UserName;
        let FacilityId = req.Data.FacilityId;
        let StoreMasterId = req.Data.StoreMasterId;

        let PatientReturnData: any = [];
        let PaymentOPReturn: any = [];
        let TotCash: number = 0;
        let TotCard: number = 0;
        let TotChequeOthers: number = 0;
        let TotSales: number = 0;
        let TotCashDue: number = 0;
        let TotCardDue: number = 0;
        let TotChequeOthersDue: number = 0;
        let TotDues: number = 0;
        let TotCashReturn: number = 0;
        let TotReturn: number = 0;

        let PatientReturnsBo = BoFactory.GetBo(bo.PatientReturnsBo, this.Request);
        let returnReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.TypeOfReturn, Value: [1, 2, 3, 4, 5] },
            { Key: PatientReturnsFilters.PatientReturnStatus, Value: 3 },
            { Key: PatientReturnsFilters.PatReturnDt, Value: [FromDate, ToDate] }]
        };
        PatientReturnData = await PatientReturnsBo.GetPatientReturns(returnReq);
        // let returndata = PatientReturnData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, StoreMasterId);

        for (let idx in PatientReturnData.Data) {
            let PatientReturnBill = PatientReturnData.Data[idx];
            let ReturnDate = PatientReturnBill.ReturnDateTime;
            let ReturnNumber = PatientReturnBill.ReturnNumber;
            let BillDate = null;
            let BillNumber = '';
            let DoctorName = '';
            if (PatientReturnBill.PatientBill) {
                BillDate = PatientReturnBill.PatientBill.BillDateTime;
                BillNumber = PatientReturnBill.PatientBill.BillNumber;
            }
            let PatientName = '';
            let Cash = 0;
            let Card = 0;
            let ChequeOthers = 0;
            let ReturnedBy = '';

            if (PatientReturnBill.Patient && PatientReturnBill.Patient.Title && PatientReturnBill.Patient.Title.Description)
                PatientName += PatientReturnBill.Patient.Title.Description;

            if (PatientReturnBill.Patient && PatientReturnBill.Patient.FirstName)
                PatientName += ' ' + PatientReturnBill.Patient.FirstName;

            if (PatientReturnBill.Patient && PatientReturnBill.Patient.LastName)
                PatientName += ' ' + PatientReturnBill.Patient.LastName;

            if (PatientReturnBill.Patient && PatientReturnBill.Patient.MRN)
                PatientName += ' ' + PatientReturnBill.Patient.MRN;

            if (!PatientName)
                PatientName = PatientReturnBill.PatientName;

            if (PatientReturnBill.User && PatientReturnBill.User.Title && PatientReturnBill.User.Title.Description)
                DoctorName += PatientReturnBill.User.Title.Description;

            if (PatientReturnBill.User && PatientReturnBill.User.FirstName)
                DoctorName += ' ' + PatientReturnBill.User.FirstName;

            if (PatientReturnBill.User && PatientReturnBill.User.LastName)
                DoctorName += ' ' + PatientReturnBill.User.LastName;

            if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.Title && PatientReturnBill.ReturnedUser.Title.Description)
                ReturnedBy += PatientReturnBill.ReturnedUser.Title.Description;

            if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.FirstName)
                ReturnedBy += ' ' + PatientReturnBill.ReturnedUser.FirstName;

            if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.LastName)
                ReturnedBy += ' ' + PatientReturnBill.ReturnedUser.LastName;

            Cash = PatientReturnBill.ReturnAmount;
            TotCashReturn += PatientReturnBill.ReturnAmount;
            TotReturn += PatientReturnBill.ReturnAmount;


            let PaymentCollectionModel = {
                BillDate: BillDate,
                ReturnDate: ReturnDate,
                ReturnNumber: ReturnNumber,
                BillNumber: BillNumber,
                DoctorName: DoctorName,
                PatientName: PatientName,
                Cash: Cash,
                Card: Card,
                ChequeOthers: ChequeOthers,
                ReturnedBy: ReturnedBy
            };
            PaymentOPReturn.push(PaymentCollectionModel);
        }
        let TotalNetCash = (TotCash + TotCashDue) - TotCashReturn;
        let TotalNetCard = TotCard + TotCardDue;
        let TotalNetCheque = TotChequeOthers + TotChequeOthersDue;
        let NetSubmission = (TotSales + TotDues) - TotReturn;

        let info = {
            TotCash: TotCash,
            TotCard: TotCard,
            TotChequeOthers: TotChequeOthers,
            FromDate: FromDate,
            ToDate: ToDate,
            PaymentType: PaymentType,
            TotSales: TotSales,
            TotCashDue: TotCashDue,
            TotCardDue: TotCardDue,
            TotChequeOthersDue: TotChequeOthersDue,
            TotDues: TotDues,
            TotCashReturn: TotCashReturn,
            TotReturn: TotReturn,
            PaymentOPReturn: PaymentOPReturn,
            TotalNetCash: TotalNetCash,
            TotalNetCard: TotalNetCard,
            TotalNetCheque: TotalNetCheque,
            NetSubmission: NetSubmission,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            UserName: UserName,
            StoreName: StoreName
        };
        let pdfOption: any = null;
        let key = 'pharmacyreturnreportforotc';
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
    public async PrintPatientReturnsReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PatientReturnsData = data.Data[0];
        let TotalRetAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalGSTAmount: number = 0;
        let TotalCGSTAmount: number = 0;
        let TotalSGSTAmount: number = 0;
        for (let idx in PatientReturns) {
            let item = PatientReturns[idx];
            TotalRetAmount += item.ReturnAmount;
            TotalDisAmount += item.DiscountAmount;
            TotalGSTAmount += item.GstAmount;
            TotalCGSTAmount += item.CGstAmount;
            TotalSGSTAmount += item.SGstAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturnsData.FacilityId);
        let info = {
            PatientReturns: PatientReturns,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalRetAmount: TotalRetAmount,
            TotalDisAmount: TotalDisAmount,
            TotalGSTAmount: TotalGSTAmount,
            TotalCGSTAmount: TotalCGSTAmount,
            TotalSGSTAmount: TotalSGSTAmount
        };
        let pdfOption: any = null;
        let key = 'pharmacyreturnreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
    public async PrintIPPharmacyReturnReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let WardName = apiReq.Data.WardName;
        let PatientReturnsData = data.Data[0];
        let TotalRetAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalGSTAmount: number = 0;
        let TotalCGSTAmount: number = 0;
        let TotalSGSTAmount: number = 0;
        for (let idx in PatientReturns) {
            let item = PatientReturns[idx];
            TotalRetAmount += item.ReturnAmount;
            TotalDisAmount += item.DiscountAmount;
            TotalGSTAmount += item.GstAmount;
            TotalCGSTAmount += item.CGstAmount;
            TotalSGSTAmount += item.SGstAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturnsData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturnsData.FacilityId, PatientReturnsData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientReturns: PatientReturns,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalRetAmount: TotalRetAmount,
            TotalDisAmount: TotalDisAmount,
            TotalGSTAmount: TotalGSTAmount,
            TotalCGSTAmount: TotalCGSTAmount,
            TotalSGSTAmount: TotalSGSTAmount,
            StoreName: StoreName,
            WardName: WardName
        };
        let pdfOption: any = null;
        let key = 'ippharmacyreturnvoucherreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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

    public async PrintDMPatientReturns(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientReturns.PatientId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billreq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientReturns.PatientBillId }]
        };
        let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let BillData = await patientbillsBo.GetPatientBills(billreq);
        let PatientBills = BillData.Data[0];
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: PatientReturns.PatientBillId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            Encounter: encounterData.Data[0],
            PatientBills: PatientBills,
            PatientRefund: PatientRefundData.Data,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            WithoutTax: PatientReturns.GrossAmount - (PatientReturns.CGstAmount + PatientReturns.SGstAmount),
            PrintData: printStoreData
        };
        return info;
    }

    public async PrintDirectPatientReturns(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id },
            { Key: PatientReturnsFilters.ReturnType, Value: 5 }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: PatientReturns.PatientBillId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            PatientRefund: PatientRefundData.Data,
            WithoutTax: PatientReturns.GrossAmount - (PatientReturns.CGstAmount + PatientReturns.SGstAmount),
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'directpharmacyreturn';
        // let reportKey = 'ippharmacyjson';
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
                    // height: '5.8in',
                    // width: '8.3in',
                    // orientation: 'landscape',
                    // border: '0',
                    // header: {
                    //     height: '0.7in',
                    //     contents: '',
                    // },
                    // footer: {
                    //     height: '0.5in',
                    //     contents: {
                    //         first: '',
                    //         default: '',
                    //         last: '',
                    //     },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintDMDirectPatientReturns(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id },
            { Key: PatientReturnsFilters.ReturnType, Value: 5 }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: PatientReturns.PatientBillId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            PatientRefund: PatientRefundData.Data,
            WithoutTax: PatientReturns.GrossAmount - (PatientReturns.CGstAmount + PatientReturns.SGstAmount),
            Preferences: printPreferencesData,
            PrintData: printStoreData
        };
        return info;
    }

    public async PrintIPPatientReturns(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id },
            { Key: PatientReturnsFilters.ReturnType, Value: 6 }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns: any = data.Data[0];
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PatientReturns.ReturnDateTime);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PatientReturns.StoreMasterId
            }
        });
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientReturns.PatientId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: PatientReturns.EncounterId }]
        };
        let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let BillData = await patientbillsBo.GetPatientBills(billreq);
        let PatientBills = BillData.Data[0];
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: PatientReturns.EncounterId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let QrInfo: any;
        let PatName: '';
        let FacInfo: '';
        if (PatientReturns.Patient.Title) {
            PatName = PatientReturns.Patient.Title.Description;
        }
        if (PatientReturns.Patient.FirstName) {
            PatName += ' ' + PatientReturns.Patient.FirstName;
        }
        if (PatientReturns.Patient.LastName) {
            PatName += ' ' + PatientReturns.Patient.LastName;
        }
        if (PatientReturns.Facility) {
            FacInfo = PatientReturns.Facility.FacilityName;
        }
        if (PatientReturns.Facility.AddressLine1) {
            FacInfo += ', ' + PatientReturns.Facility.AddressLine1;
        }
        if (PatientReturns.Facility.Mobile) {
            FacInfo += ',Phone: ' + PatientReturns.Facility.Mobile;
        }
        if (PatientReturns.Facility.Email) {
            FacInfo += ',Email: ' + PatientReturns.Facility.Email;
        }
        if (PatientReturns.Facility.GstNumber) {
            FacInfo += ',GSTIN No: ' + PatientReturns.Facility.GstNumber;
        }

        QrInfo = PatientReturns.ReturnNumber + ' , ' + PatientReturns.ReturnAmount + ' , ' +
            PatientReturns.ReturnDateTime + ' , ' + PatName + ' , ' + FacInfo;
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            Encounter: encounterData.Data[0],
            PatientBills: PatientBills,
            PatientRefund: PatientRefundData.Data,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            WithoutTax: PatientReturns.GrossAmount - PatientReturns.GstAmount,
            Preferences: printPreferencesData,
            QrInfo: QrInfo,
            Flags: flags
        };
        let pdfOption: any = null;
        let key = 'ippharmacybillreturns';
        // let reportKey = 'ippharmacyjson';
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
                    // height: '5.8in',
                    // width: '8.3in',
                    // orientation: 'landscape',
                    // border: '0',
                    // header: {
                    //     height: '0.7in',
                    //     contents: '',
                    // },
                    // footer: {
                    //     height: '0.5in',
                    //     contents: {
                    //         first: '',
                    //         default: '',
                    //         last: '',
                    //     },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintStaffCreditReturnReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let PatientReturnsData = data.Data[0];
        let TotalRetAmount: number = 0;
        let TotalDisAmount: number = 0;
        for (let idx in PatientReturns) {
            let item = PatientReturns[idx];
            TotalRetAmount += item.ReturnAmount;
            TotalDisAmount += item.DiscountAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturnsData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientReturnsData.FacilityId, PatientReturnsData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientReturns: PatientReturns,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalRetAmount: TotalRetAmount,
            TotalDisAmount: TotalDisAmount,
            StoreName: StoreName
        };
        let pdfOption: any = null;
        let key = 'staffcreditreturnreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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

    public async PrintDMIPPatientReturns(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnsFilters.Id, Value: req.Id },
            { Key: PatientReturnsFilters.ReturnType, Value: 6 }]
        };
        let data = await this.GetPatientReturns(apiReq);
        let PatientReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.PatientReturnId, Value: PatientReturns.Id }]
        };
        let PatientReturnDetailsBo = BoFactory.GetBo(bo.PatientReturnDetailsBo, this.Request);
        let PatientReturnDetailsData = await PatientReturnDetailsBo.GetPatientReturnDetails(Req);
        let PatientReturnDetails: any = [];
        PatientReturnDetailsData.Data.forEach((Detail: any) => {
            var PatientReturnDetail = Detail;
            PatientReturnDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientReturnDetails.push(PatientReturnDetail);
        });
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientReturns.PatientId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billreq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: PatientReturns.EncounterId }]
        };
        let patientbillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let BillData = await patientbillsBo.GetPatientBills(billreq);
        let PatientBills = BillData.Data[0];
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: PatientReturns.EncounterId },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 }]
        };
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PatientReturns.FacilityId, PatientReturns.StoreMasterId);
        let info = {
            PatientReturns: PatientReturns,
            Patientreturndetails: PatientReturnDetails,
            Encounter: encounterData.Data[0],
            PatientBills: PatientBills,
            PatientRefund: PatientRefundData.Data,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            WithoutTax: PatientReturns.GrossAmount - PatientReturns.GstAmount,
            Preferences: printPreferencesData,
            PrintData: printStoreData
        };
        return info;
    }

    public GetModel(): SStatic.Model<PatientReturnsInstance, PatientReturnsAttributes> {
        return this.Models.PatientReturns;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'Pharmacy Refund', Value: await this.OPPharmacyRefundDetails(req) });
        // result.push({ Key: 'Return', Value: await this.IPPharmacyRefundDetails(req) });
        return result;
    }
    public async ReturnDetails(req: BaseRequest): Promise<any> {
        let ReturnDetailsResult: any = [];
        ReturnDetailsResult['DisplayOrder'] = 1;
        let EncJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeId'],
            required: true,
            where: {
                EncounterTypeId: 1,
            }
        };
        let IpEncJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeId'],
            required: true,
            where: {
                EncounterTypeId: 2,
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'ReturnAmount'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReturnTypeId: 1,
                PatientReturnStatusId: 3,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountInstance) {
            let OPReturn: number = 0;
            let Type: number = 0;
            let bill: any = this.GetAttribute(opbillamountInstance);
            // ReturnDetailsResult['OPReturn'] = bill['ReturnAmount'];
            // ReturnDetailsResult['Type'] = bill[1];
            OPReturn = bill['ReturnAmount'];
            Type = 1;
            let info = {
                'OPReturn': OPReturn,
                'Type': Type,
            };
            ReturnDetailsResult.push(info);
        }

        let opbillamountIPInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'ReturnAmount'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReturnTypeId: 1,
                PatientReturnStatusId: 3,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,

            },
            include: [IpEncJoin]
        });
        if (opbillamountIPInstance) {
            let IPReturn: number = 0;
            let Type: number = 0;
            let bill: any = this.GetAttribute(opbillamountIPInstance);
            // ReturnDetailsResult['IPReturn'] = bill['ReturnAmount'];
            // ReturnDetailsResult['Type'] = bill[1];
            IPReturn = bill['ReturnAmount'];
            Type = 2;
            let info = {
                'IPReturn': IPReturn,
                'Type': Type,
            };
            ReturnDetailsResult.push(info);
        }

        let opbillamountstaffInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'ReturnAmount'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReturnTypeId: 7,
                PatientReturnStatusId: 2,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            }
        });
        if (opbillamountstaffInstance) {
            let StaffCreditReturn: number = 0;
            let Type: number = 0;
            let bill: any = this.GetAttribute(opbillamountstaffInstance);
            // ReturnDetailsResult['StaffCreditReturn'] = bill['ReturnAmount'];
            // ReturnDetailsResult['Type'] = bill[1];
            StaffCreditReturn = bill['ReturnAmount'];
            Type = 3;
            let info = {
                'StaffCreditReturn': StaffCreditReturn,
                'Type': Type,
            };
            ReturnDetailsResult.push(info);
        }
        let opdirectbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'ReturnAmount'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReturnTypeId: 4,
                PatientReturnStatusId: 3,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            }
        });
        if (opdirectbillamountInstance) {
            let DirectReturn: number = 0;
            let Type: number = 0;
            let bill: any = this.GetAttribute(opdirectbillamountInstance);
            // ReturnDetailsResult['OPReturn'] = bill['ReturnAmount'];
            // ReturnDetailsResult['Type'] = bill[1];
            DirectReturn = bill['ReturnAmount'];
            Type = 4;
            let info = {
                'DirectReturn': DirectReturn,
                'Type': Type,
            };
            ReturnDetailsResult.push(info);
        }

        return ReturnDetailsResult;
    }
    public async PharmacyReturnDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'ReturnedUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let ipreturnamountInstance: any = await this.FindAll({
            attributes: ['ReturnAmount', 'ReturnApprovedBy'],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                ReturnTypeId: 6,
                PatientReturnStatusId: 3,
                ReturnApprovedBy: { '$gt': 0 },
                StoreMasterId: req.Data.StoreMasterId,
                FacilityId: req.Data.FacilityId,
            },
            include: [UserGroupJoin]
        });
        if (ipreturnamountInstance) {
            let groupbills = _.groupBy(ipreturnamountInstance, 'ReturnApprovedBy');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ReturnAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    ReturnAmount += bills.ReturnAmount;
                    UserId = bills.ReturnApprovedBy;
                    User = bills.ReturnedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'IPReturnAmount': ReturnAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        return UserGroup;
    }

    public async PharmacyIPReturnDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 10;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'TotalRefundAmount'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                ReturnTypeId: 6,
                PatientReturnStatusId: 3,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['IPReturnAmount'] = bill['TotalRefundAmount'];
        }
        return OPBillResult;
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }

    private async OPPharmacyRefundDetails(req: BaseRequest): Promise<any> {
        let RefundData: any = {};
        RefundData['DisplayOrder'] = 11;
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'TotalAmountRefund'],
            ],
            where: {
                ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                Status: 1,
                PatientReturnStatusId: 3,
                ReturnTypeId: { '$in': [1, 2, 3, 4, 5] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            }
        });

        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            RefundData['ReturnAmount'] = bill['TotalAmountRefund'];
            RefundData['CashAmount'] = bill['TotalAmountRefund'];
        }

        RefundData['CardAmount'] = '0.00';
        RefundData['OtherAmount'] = '0.00';

        return RefundData;
    }


    // private async IPPharmacyRefundDetails(req: BaseRequest): Promise<any> {
    //     let RefundData: any = {};
    //     RefundData['DisplayOrder'] = 101;
    //     let opbillamountInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('ReturnAmount')), 'TotalAmountRefund'],
    //         ],
    //         where: {
    //             ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             PatientReturnStatusId: 3,
    //             ReturnTypeId: 6,
    //             FacilityId: req.Data.FacilityId
    //         }
    //     });
    //     if (opbillamountInstance) {
    //         let bill: any = this.GetAttribute(opbillamountInstance);
    //         RefundData['ReturnAmount'] = bill['TotalAmountRefund'];
    //     }

    //     RefundData['CashAmount'] = '0.00';
    //     RefundData['CardAmount'] = '0.00';
    //     RefundData['OtherAmount'] = '0.00';

    //     return RefundData;
    // }

}
