
import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import {
    PatientBillDetailsFilters, PatientDoctorShareDetailsFilters,
    PatientPaymentDetailsFilters
} from '../Common/Filters.e';
import {
    EncounterFilters, EncounterIPPackageFilters, EncounterIPPackageDetailFilters
    , EncounterIPPackageServiceInclusionFilters, EncounterIPPackageServiceExclusionFilters
} from '../../Visit/Common/Filters.e';
import { PatientOrderFilters } from '../../EMR/Common/Filters.e';
import { PatientBillDetailsInstance, PatientBillDetailsAttributes } from '../Model/Interface/Index';
import * as encbo from '../../Visit/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as orderBo from '../../EMR/Business/Index';
import { BoFactory } from '../../../Modules/Base/Business/Index';
import * as invBo from '../../Pharmacy/Business/Index';
//import * as billingBO from '../../Billing/Business/Index';
import * as BillingBo from './Index';
import { join } from 'path';
import * as _ from 'lodash';
import * as userbo from '../../SystemSettings/Business/Index';
import * as clinicalMasterBo from '../../ClinicalMaster/Business/Index';
import * as moment from 'moment';

// import * as moment from 'moment';

export class PatientBillDetailsBo extends BaseBo<PatientBillDetailsInstance, PatientBillDetailsAttributes> {
    public async AddPatientBillDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        // let patientbillsummbo = BoFactory.GetBo(BillingBo.PatientBillSummaryBo, this.Request);
        // let billSummReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 50, PageNumber: 1 },
        //     Params: [
        //         { Key: PatientBillSummaryFilters.EncounterId, Value: req.Data.EncounterId },
        //         { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId }
        //     ]
        // };
        // let PatinetBillSummaData = await patientbillsummbo.GetPatientBillSummarys(billSummReq);
        // if (PatinetBillSummaData.Data.length > 0) {
        //     for (let sdx in PatinetBillSummaData.Data) {
        //         let summInfo = PatinetBillSummaData.Data[sdx];
        //         // if (summInfo.ServiceCategoryId === req.Data.ServiceCategoryId) {
        //         let actamt = 0;
        //         actamt = summInfo.ActualAmount + req.Data.NetAmount;
        //         let SummData: any = {
        //             Id: summInfo.Id,
        //             EncounterId: req.Data.EncounterId,
        //             ServiceCategoryId: req.Data.ServiceCategoryId,
        //             ActualAmount: actamt,
        //         };
        //         await patientbillsummbo.Update(SummData);
        //         // } else {
        //         //     let SummData: any = {
        //         //         Id: 0,
        //         //         EncounterId: req.Data.EncounterId,
        //         //         ServiceCategoryId: req.Data.ServiceCategoryId,
        //         //         ActualAmount: req.Data.NetAmount,
        //         //     };
        //         //     await patientbillsummbo.Save(SummData);
        //         // }
        //     }
        // }
        // if (PatinetBillSummaData.Data.length === 0) {
        //     let SummData: any = {
        //         Id: 0,
        //         EncounterId: req.Data.EncounterId,
        //         ServiceCategoryId: req.Data.ServiceCategoryId,
        //         ActualAmount: req.Data.NetAmount,
        //     };
        //     await patientbillsummbo.Save(SummData);
        // }
        return result.dataValues.Id;
    }

    public async UpdatePatientBillDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (req.Data && req.Data.PatientBillId) {
            let billingBo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
            let billDetailApiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: req.Data.PatientBillId },
                { Key: PatientBillDetailsFilters.NotInPatientBillStatusIds, Value: [2] }]
            };
            let PatientBillDetails = await this.GetPatientBillDetails(billDetailApiReq);
            if (PatientBillDetails.Data.length === 0) {
                let PatientBill: any = await billingBo.GetById(req.Data.PatientBillId);
                if (PatientBill.Id > 0) {
                    PatientBill.PatientBillStatusId = 2;
                    await billingBo.Update(PatientBill);
                }
            }
        }
        return result;
    }
    public async IsAlreadyExist(req: any): Promise<number> {
        let billDate = new Date();
        // let FromDate = billDate.setMinutes(billDate.getMinutes() - 2);
        // let ToDate = billDate.setMinutes(billDate.getMinutes() + 2);
        let FromDate = billDate.setSeconds(billDate.getSeconds() - 30);
        let ToDate = billDate.setSeconds(billDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.EncounterId },
            { Key: PatientBillDetailsFilters.ServiceId, Value: req.ServiceId },
            { Key: PatientBillDetailsFilters.FromDate, Value: frmDate },
            { Key: PatientBillDetailsFilters.ToDate, Value: todate }]
        };
        let data = await this.GetMinPatientBillDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public async UpdateIPBillTOOPBillDetails(details: PatientBillDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async IsBillLockCheck(PatientBillId: number, EncounterId: number) {
        let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let BillData = await patientbillbo.GetPatientBillsById({ Id: PatientBillId });
        if (BillData && BillData.BillTypeId === 3) {
            let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            if (await EncounterBo.IsBillLocked({ Id: EncounterId })) {
                throw { code: 'BILL_ALREADY_LOCKED' };
            }
        }
    }

    public async CancelEncIPBillDetails(req: BaseRequest): Promise<Boolean> {
        let ipbills = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.Id }]
        };
        let data = await this.GetPatientBillDetails(apiReq);
        ipbills = data.Data || [];
        if (ipbills.length > 0) {
            await this.ManageCancelledIPBillDetails(req.Id, ipbills);
        }

        return true;
    }

    public async ManageCancelledIPBillDetails(EncounterId: number, details: PatientBillDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillStatusId = 2;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManagePatientBillDetails(PatientBillId: number, details: any[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                console.log('************Detail*********');
                // console.log(detail);
                detail.Id = detail.Id || 0;
                if (detail.EncounterId) {
                    await this.IsBillLockCheck(PatientBillId, detail.EncounterId);
                }
                detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let checkEntry: any = await this.Find({
                        attributes: ['Id', 'PatientBillId', 'BillDateTime'],
                        where: {
                            PatientBillId: PatientBillId,
                            ServiceId: detail.ServiceId,
                            ServiceCategoryId: detail.ServiceCategoryId
                        }
                    });
                    if (!checkEntry) {
                        if (!detail.UnitPrice || detail.UnitPrice === 0) //Newly included on 30/3/24
                            detail.UnitPrice = detail.Rate;
                        if (!detail.NetAmount || detail.NetAmount === 0) { //Newly included on 10/7/25
                            if (!detail.DiscountPercentage || detail.DiscountPercentage === 0)
                                detail.NetAmount = detail.Amount - detail.DiscountAmount;
                        }
                        if (!detail.IsPharmacySale || !detail.IsPharmacyReturn) {
                            // if (detail.ServiceItem.GstMaster) {
                            //     detail.GSTPercentage = detail.ServiceItem.GstMaster.GstPercentage;
                            // }
                            // if (detail.GSTPercentage) {
                            //     detail.UnitGSTAmount = (detail.GSTPercentage / 100) * detail.Rate;

                            //     if (detail.UnitGSTAmount > 0) {
                            //         detail.GSTAmount = parseFloat(detail.UnitGSTAmount) * detail.Quantity;
                            //         detail.GSTAmount = parseFloat(detail.GSTAmount).toFixed(2);
                            //     }
                            // }
                        }
                        let result = await this.Save(detail);
                        detail.Id = result.dataValues.Id;
                        let PatientBillDetailId = detail.Id;
                        if (detail.Id && detail.Id > 0 && detail.IsExecutableProcedure) {
                            let ExecutableProcedureBO = BoFactory.GetBo(BillingBo.PatientExecutableProcedureBo, this.Request);
                            await ExecutableProcedureBO.ManagePatientExecutableProcedure(PatientBillId, PatientBillDetailId, details);
                        }
                        let docDetail: any = [];
                        // let SummaryPackageDetail: any = [];
                        let PackageDetailInclusion: any = [];
                        let PackageDetailExclusion: any = [];
                        let PackageDetailExclusion1: any = [];
                        let PackageDetailInclusion1: any = [];
                        // let PackageDetails: any = [];
                        let billdetail: any = {};
                        let docShareBO = BoFactory.GetBo(BillingBo.PatientDoctorShareDetailsBo, this.Request);
                        if (detail.Id && detail.Id > 0 && detail.DoctorShare > 0) {
                            if (detail.DoctorShare > 0) {
                                if (detail.AllowIPDocShare === 0 || !detail.AllowIPDocShare) {
                                    billdetail = detail;
                                    // console.log('*********billdetail1**********', billdetail.DocShareDetails[0].Team);
                                    if (billdetail.DocShareDetails) {
                                        let docData: any = {
                                            Id: 0,
                                            PatientBillId: PatientBillId,
                                            PatientBillDetailId: detail.Id,
                                            FacilityId: this.Session.FacilityId,
                                            BillDateTime: billdetail.BillDateTime,
                                            ServiceItemId: detail.ServiceId,
                                            TeamId: detail.TeamId,
                                            ServiceCode: detail.ServiceCode,
                                            ServiceName: detail.ServiceName,
                                            ServiceAmount: detail.NetAmount,
                                            DoctorId: detail.DoctorId,
                                            DoctorName: detail.DoctorName,
                                            DoctorSharePercentage: detail.DoctorShareValue,
                                            DoctorShareAmount: detail.DoctorShare,
                                            IsInvoicedDoctorShare: false,
                                            PatientTypeId: detail.PatientTypeId,
                                            EncounterId: detail.EncounterId,
                                            ShareType: 1,
                                            DoctorShareStatusId: 1
                                        };
                                        docDetail.push(docData);
                                    } else {
                                        let docData: any = {
                                            Id: 0,
                                            PatientBillId: PatientBillId,
                                            PatientBillDetailId: detail.Id,
                                            FacilityId: this.Session.FacilityId,
                                            BillDateTime: billdetail.BillDateTime,
                                            ServiceItemId: detail.ServiceId,
                                            // TeamId: billdetail.DocShareDetails[0].TeamId||0,
                                            ServiceCode: detail.ServiceCode,
                                            ServiceName: detail.ServiceName,
                                            ServiceAmount: detail.NetAmount,
                                            DoctorId: detail.DoctorId,
                                            DoctorName: detail.DoctorName,
                                            DoctorSharePercentage: detail.DoctorShareValue,
                                            DoctorShareAmount: detail.DoctorShare,
                                            IsInvoicedDoctorShare: false,
                                            PatientTypeId: detail.PatientTypeId,
                                            EncounterId: detail.EncounterId,
                                            ShareType: 1,
                                            DoctorShareStatusId: 1
                                        };
                                        docDetail.push(docData);
                                    }
                                }
                                // console.log('*********docDetail1**********', docDetail);
                                await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                            }
                        }
                        if (detail.Id && detail.Id > 0 && detail.DocShareDetails && detail.DocShareDetails.length > 0) {
                            let billdetail: any = {};
                            for (let pdx in detail.DocShareDetails) {
                                let docShareDetail = detail.DocShareDetails[pdx];
                                if (detail.Id && detail.Id > 0 && docShareDetail.PerformDoctorId > 0) {
                                    billdetail = detail;
                                    // console.log('*********billdetail2**********', billdetail);
                                    if (billdetail.DocShareDetails) {
                                        let docData: any = {
                                            Id: 0,
                                            PatientBillId: PatientBillId,
                                            PatientBillDetailId: detail.Id,
                                            FacilityId: this.Session.FacilityId,
                                            BillDateTime: billdetail.BillDateTime,
                                            ServiceItemId: detail.ServiceId,
                                            TeamId: docShareDetail.TeamId,
                                            ServiceCode: detail.ServiceCode,
                                            ServiceName: detail.ServiceName,
                                            ServiceAmount: billdetail.NetAmount,
                                            DoctorId: docShareDetail.PerformDoctorId,
                                            DoctorName: docShareDetail.PerformDoctorName,
                                            DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                            DoctorShareAmount: docShareDetail.PerformDrShare,
                                            PatientTypeId: docShareDetail.PatientTypeId,
                                            //EncounterId: docShareDetail.EncounterId,
                                            EncounterId: detail.EncounterId,
                                            EncounterTypeId: detail.EncounterTypeId,
                                            IsInvoicedDoctorShare: false,
                                            ShareType: 2,
                                            DoctorShareStatusId: 1
                                        };
                                        docDetail.push(docData);
                                    } else {
                                        let docData: any = {
                                            Id: 0,
                                            PatientBillId: PatientBillId,
                                            PatientBillDetailId: detail.Id,
                                            FacilityId: this.Session.FacilityId,
                                            BillDateTime: billdetail.BillDateTime,
                                            ServiceItemId: detail.ServiceId,
                                            // TeamId: billdetail.DocShareDetails[0].TeamId||0,
                                            ServiceCode: detail.ServiceCode,
                                            ServiceName: detail.ServiceName,
                                            ServiceAmount: billdetail.NetAmount,
                                            DoctorId: docShareDetail.PerformDoctorId,
                                            DoctorName: docShareDetail.PerformDoctorName,
                                            DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                            DoctorShareAmount: docShareDetail.PerformDrShare,
                                            PatientTypeId: docShareDetail.PatientTypeId,
                                            //EncounterId: docShareDetail.EncounterId,
                                            EncounterId: detail.EncounterId,
                                            EncounterTypeId: detail.EncounterTypeId,
                                            IsInvoicedDoctorShare: false,
                                            ShareType: 2,
                                            DoctorShareStatusId: 1
                                        };
                                        docDetail.push(docData);
                                    }
                                }
                                //  console.log('*********docDetail2**********',docDetail);
                            }
                            await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                        }
                        let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
                        let patientbillpackageexclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceExclusionBo, this.Request);
                        let patientbillpackageinclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceInclusionBo, this.Request);
                        let BillData = await patientbillbo.GetPatientBillsById({ Id: PatientBillId });
                        let encounterippackagebo = BoFactory.GetBo(encbo.EncounterIPPackageBo, this.Request);
                        let encounterippackagedetailbo = BoFactory.GetBo(encbo.EncounterIPPackageDetailBo, this.Request);
                        let EncounterPackageReq = {
                            Id: 0,
                            PageContext: { PageSize: 50, PageNumber: 1 },
                            Params: [
                                { Key: EncounterIPPackageFilters.EncounterId, Value: BillData.EncounterId }
                            ]
                        };
                        let EncounterIPPackageData = await encounterippackagebo.GetEncounterIPPackages(EncounterPackageReq);
                        let EncounterIPPackage = EncounterIPPackageData.Data[0];
                        let EncIPPackageId = 0;
                        if (EncounterIPPackageData.Data.length > 0) {
                            EncIPPackageId = EncounterIPPackage.Id;
                        }
                        let EncounterPackageDetailReq = {
                            Id: 0,
                            PageContext: { PageSize: 50, PageNumber: 1 },
                            Params: [
                                { Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: EncIPPackageId },
                                { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                            ]
                        };
                        let EncounterIPPackageDetailData = await
                            encounterippackagedetailbo.GetEncounterIPPackageDetails(EncounterPackageDetailReq);
                        let EnIPPD = 0;
                        let IsDataUpdated = 0;
                        let servicecategoryBo = BoFactory.GetBo(clinicalMasterBo.ServiceCategoryBo, this.Request);
                        let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: detail.ServiceCategoryId });

                        for (var idx in EncounterIPPackageDetailData.Data) {
                            var DetailData = EncounterIPPackageDetailData.Data[idx];
                            if (DetailData.ServiceCategoryId === detail.ServiceCategoryId) {
                                EnIPPD = DetailData.Id;
                                IsDataUpdated = 1;
                                if (detail.IsExclusionItem) {
                                    let pacData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: EnIPPD,
                                        PatientBillDetailId: detail.Id,
                                        IPPackageId: EncounterIPPackage.IPPackageId,
                                        EncounterIPPackageId: EncIPPackageId,
                                        PackageName: EncounterIPPackage.IPPackageName,
                                        ServiceGroupId: detail.ServiceGroupId,
                                        ServiceCategoryId: detail.ServiceCategoryId,
                                        ServiceItemId: detail.ServiceId,
                                        ServiceItemName: detail.ServiceName,
                                        Quantity: detail.Quantity,
                                        Rate: detail.Rate,
                                        Amount: detail.Amount,
                                        TotalAmount: detail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    };
                                    PackageDetailExclusion.push(pacData);
                                    await patientbillpackageexclusionbo
                                        .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, EnIPPD, PackageDetailExclusion);
                                } else if (detail.IsInclusionItem) {
                                    let pacData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: EnIPPD,
                                        PatientBillDetailId: detail.Id,
                                        IPPackageId: EncounterIPPackage.IPPackageId,
                                        EncounterIPPackageId: EncIPPackageId,
                                        PackageName: EncounterIPPackage.IPPackageName,
                                        ServiceGroupId: detail.ServiceGroupId,
                                        ServiceCategoryId: detail.ServiceCategoryId,
                                        ServiceItemId: detail.ServiceId,
                                        ServiceItemName: detail.ServiceName,
                                        Quantity: detail.Quantity,
                                        Rate: detail.Rate,
                                        Amount: detail.Amount,
                                        TotalAmount: detail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    };
                                    PackageDetailInclusion.push(pacData);
                                    await patientbillpackageinclusionbo
                                        .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, EnIPPD, PackageDetailInclusion);

                                }
                                break;
                            }
                        }
                        if (IsDataUpdated === 0) {
                            let pacDetailData: any = {
                                Data: {
                                    Id: 0,
                                    EncounterIPPackageId: EncIPPackageId,
                                    IPPackageDetailId: 0,
                                    ServiceCategoryId: detail.ServiceCategoryId,
                                    ServiceCategoryCode: ServiceCategoryInfo.ServiceCategoryCode,
                                    ServiceCategoryName: ServiceCategoryInfo.ServiceCategoryName,
                                    PackageAmount: detail.NetAmount,
                                    ActiveStatusId: 2,
                                    Status: 1,
                                }
                            };
                            // PackageDetails.Push(pacDetailData);
                            let detailDataId = await encounterippackagedetailbo
                                .AddEncounterIPPackageDetail(pacDetailData);
                            console.log('*******detailDataId********', detailDataId);
                            let PackageDetailsId = detailDataId;
                            if (detail.IsExclusionItem) {
                                let pacData: any = {
                                    Id: 0,
                                    EncounterIPPackageDetailId: PackageDetailsId,
                                    PatientBillDetailId: detail.Id,
                                    IPPackageId: EncounterIPPackage.IPPackageId,
                                    EncounterIPPackageId: EncIPPackageId,
                                    PackageName: EncounterIPPackage.IPPackageName,
                                    ServiceGroupId: detail.ServiceGroupId,
                                    ServiceCategoryId: detail.ServiceCategoryId,
                                    ServiceItemId: detail.ServiceId,
                                    ServiceItemName: detail.ServiceName,
                                    Quantity: detail.Quantity,
                                    Rate: detail.Rate,
                                    Amount: detail.Amount,
                                    TotalAmount: detail.GrossAmount,
                                    ActiveStatusId: 2,
                                    Status: 1
                                };
                                PackageDetailExclusion1.push(pacData);
                                console.log('*******PackageDetailExclusion1********', PackageDetailExclusion1);
                                await patientbillpackageexclusionbo
                                    .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, PackageDetailsId, PackageDetailExclusion1);
                            } else if (detail.IsInclusionItem) {
                                let pacData: any = {
                                    Id: 0,
                                    EncounterIPPackageDetailId: PackageDetailsId,
                                    PatientBillDetailId: detail.Id,
                                    IPPackageId: EncounterIPPackage.IPPackageId,
                                    EncounterIPPackageId: EncIPPackageId,
                                    PackageName: EncounterIPPackage.IPPackageName,
                                    ServiceGroupId: detail.ServiceGroupId,
                                    ServiceCategoryId: detail.ServiceCategoryId,
                                    ServiceItemId: detail.ServiceId,
                                    ServiceItemName: detail.ServiceName,
                                    Quantity: detail.Quantity,
                                    Rate: detail.Rate,
                                    Amount: detail.Amount,
                                    TotalAmount: detail.GrossAmount,
                                    ActiveStatusId: 2,
                                    Status: 1
                                };
                                PackageDetailInclusion1.push(pacData);
                                await patientbillpackageinclusionbo
                                    .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, PackageDetailsId, PackageDetailInclusion1);

                            }
                        }
                    }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);

        }));
        let BillIds: Array<any> = [];
        let BillMap: any = {};
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = BillMap[detail.PatientBillId];
                if (!Bill) {
                    BillIds.push(detail.PatientBillId);
                    Bill = {
                        Id: detail.PatientBillId,
                    };
                    BillMap[detail.PatientBillId] = Bill;
                }
            })(DetailItem);
        }));
        let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        await Promise.all(BillIds.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = await patientbillbo.GetPatientBillsById({ Id: detail });
                let BillDetailApiReq = {
                    Id: 0,
                    PageContext: {
                        PageSize: 10000,
                        PageNumber: 1
                    },
                    Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: Bill.Id }]
                };
                // let BillDetails = await this.GetPatientBillDetails(BillDetailApiReq);
                let BillDetails = await this.GetMinPatientBillDetails(BillDetailApiReq);
                let BillAmount: number = 0;
                let BillDiscount: number = 0;
                let BillGstAmount: number = 0;
                let CancelledCount: number = 0;
                await Promise.all(BillDetails.Data.map((BillDetailItem): Promise<void> => {
                    return (async (BillDetail): Promise<void> => {
                        if (BillDetail.PatientBillStatusId !== 2) {
                            BillAmount += BillDetail.Amount;

                            BillGstAmount += BillDetail.GSTAmount || 0;
                            if (BillDetail.DiscountAmount > 0) {
                                BillDiscount += BillDetail.DiscountAmount;
                            } else {
                                if (BillDetail.SchemeDiscountAmt > 0) {
                                    BillDiscount += BillDetail.SchemeDiscountAmt;
                                }
                            }
                        } else if (BillDetail.PatientBillStatusId === 2) {
                            CancelledCount++;
                        }
                    })(BillDetailItem);
                }));
                if (BillDetails.Data[0].PatientBillStatusId !== 1) {
                    if (BillDetails.Data.length === CancelledCount) {
                        Bill.PatientBillStatusId = 2;
                        Bill.CancelledBy = BillDetails.Data[0].CancelledBy;
                    } else {
                        // Bill.BillAmount = BillAmount;
                        // Bill.BillDiscount = BillDiscount;
                        // Bill.GSTAmount = BillGstAmount;
                        // Bill.PatientBillStatusId = 3;
                    }
                }
                await patientbillbo.Update(Bill);
            })(DetailItem);
        }));
        return true;
    }
    public async ManagePatientBillComments(req: BaseRequest): Promise<any> {
        let details: any = req.Data.details || [];
        await Promise.all(details.map((DetailItem: any): Promise<void> => {
            return (async (detail): Promise<void> => {
                console.log('************Detail*********');
                console.log(detail);
                detail.Id = detail.Id || 0;
                if (detail.EncounterId) {
                    // await this.IsBillLockCheck(PatientBillId, detail.EncounterId);
                }
                // detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        return true;
    }
    public async ManageIPatientBillDetails(PatientBillId: number, details: any[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.EncounterId) {
                    if (!detail.allowBilltoSave)
                        await this.IsBillLockCheck(PatientBillId, detail.EncounterId);
                }
                detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    if (!detail.UnitPrice || detail.UnitPrice === 0) //Newly included on 30/3/24
                        detail.UnitPrice = detail.Rate;
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    let PatientBillDetailId = detail.Id;
                    if (detail.Id && detail.Id > 0 && detail.IsExecutableProcedure) {
                        let ExecutableProcedureBO = BoFactory.GetBo(BillingBo.PatientExecutableProcedureBo, this.Request);
                        await ExecutableProcedureBO.ManagePatientExecutableProcedure(PatientBillId, PatientBillDetailId, details);
                    }
                    let docDetail: any = [];
                    // let SummaryPackageDetail: any = [];
                    // let PackageDetailInclusion: any = [];
                    // let PackageDetailExclusion: any = [];
                    // let PackageDetailExclusion1: any = [];
                    // let PackageDetailInclusion1: any = [];
                    // let PackageDetails: any = [];
                    let billdetail: any = {};
                    let docShareBO = BoFactory.GetBo(BillingBo.PatientDoctorShareDetailsBo, this.Request);
                    if (detail.Id && detail.Id > 0 && detail.DoctorShare > 0) {
                        if (detail.DoctorShare > 0) {
                            if (detail.AllowIPDocShare === 0 || !detail.AllowIPDocShare) {
                                billdetail = detail;
                                // console.log('*********billdetail1**********', billdetail.DocShareDetails[0].Team);
                                if (billdetail.DocShareDetails) {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: PatientBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        TeamId: detail.TeamId,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: detail.NetAmount,
                                        DoctorId: detail.DoctorId,
                                        DoctorName: detail.DoctorName,
                                        DoctorSharePercentage: detail.DoctorShareValue,
                                        DoctorShareAmount: detail.DoctorShare,
                                        IsInvoicedDoctorShare: false,
                                        PatientTypeId: detail.PatientTypeId,
                                        EncounterId: detail.EncounterId,
                                        ShareType: 1,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                } else {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: PatientBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        // TeamId: billdetail.DocShareDetails[0].TeamId||0,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: detail.NetAmount,
                                        DoctorId: detail.DoctorId,
                                        DoctorName: detail.DoctorName,
                                        DoctorSharePercentage: detail.DoctorShareValue,
                                        DoctorShareAmount: detail.DoctorShare,
                                        IsInvoicedDoctorShare: false,
                                        PatientTypeId: detail.PatientTypeId,
                                        EncounterId: detail.EncounterId,
                                        ShareType: 1,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                }
                            }
                            // console.log('*********docDetail1**********', docDetail);
                            await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                        }
                    }
                    if (detail.Id && detail.Id > 0 && detail.DocShareDetails && detail.DocShareDetails.length > 0) {
                        let billdetail: any = {};
                        for (let pdx in detail.DocShareDetails) {
                            let docShareDetail = detail.DocShareDetails[pdx];
                            if (detail.Id && detail.Id > 0 && docShareDetail.PerformDoctorId > 0) {
                                billdetail = detail;
                                // console.log('*********billdetail2**********', billdetail);
                                if (billdetail.DocShareDetails) {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: PatientBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        TeamId: docShareDetail.TeamId,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: billdetail.NetAmount,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        EncounterId: detail.EncounterId,
                                        EncounterTypeId: detail.EncounterTypeId,
                                        IsInvoicedDoctorShare: false,
                                        ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                } else {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: PatientBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        // TeamId: billdetail.DocShareDetails[0].TeamId||0,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: billdetail.NetAmount,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        EncounterId: detail.EncounterId,
                                        EncounterTypeId: detail.EncounterTypeId,
                                        IsInvoicedDoctorShare: false,
                                        ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                }
                            }
                            //  console.log('*********docDetail2**********',docDetail);
                        }
                        await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                    }
                    // let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
                    // let patientbillsummbo = BoFactory.GetBo(BillingBo.PatientBillSummaryBo, this.Request);
                    // let patientbillpackageexclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceExclusionBo, this.Request);
                    // let patientbillpackageinclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceInclusionBo, this.Request);
                    // let BillData = await patientbillbo.GetPatientBillsById({ Id: PatientBillId });
                    // let encounterippackagebo = BoFactory.GetBo(encbo.EncounterIPPackageBo, this.Request);
                    // let encounterippackagedetailbo = BoFactory.GetBo(encbo.EncounterIPPackageDetailBo, this.Request);
                    // let EncounterPackageReq = {
                    //     Id: 0,
                    //     PageContext: { PageSize: 50, PageNumber: 1 },
                    //     Params: [
                    //         { Key: EncounterIPPackageFilters.EncounterId, Value: BillData.EncounterId }
                    //     ]
                    // };
                    // let EncounterIPPackageData = await encounterippackagebo.GetEncounterIPPackages(EncounterPackageReq);
                    // let EncounterIPPackage = EncounterIPPackageData.Data[0];
                    // let EncIPPackageId = 0;
                    // if (EncounterIPPackageData.Data.length > 0) {
                    //     EncIPPackageId = EncounterIPPackage.Id;
                    // }
                    // let EncounterPackageDetailReq = {
                    //     Id: 0,
                    //     PageContext: { PageSize: 50, PageNumber: 1 },
                    //     Params: [
                    //         { Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: EncIPPackageId },
                    //         { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                    //     ]
                    // };
                    // let EncounterIPPackageDetailData = await
                    //     encounterippackagedetailbo.GetEncounterIPPackageDetails(EncounterPackageDetailReq);
                    // let EnIPPD = 0;
                    // let IsDataUpdated = 0;
                    // let servicecategoryBo = BoFactory.GetBo(clinicalMasterBo.ServiceCategoryBo, this.Request);
                    // let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: detail.ServiceCategoryId });
                    // for (var idx in EncounterIPPackageDetailData.Data) {
                    //     var DetailData = EncounterIPPackageDetailData.Data[idx];
                    //     if (DetailData.ServiceCategoryId === detail.ServiceCategoryId) {
                    //         EnIPPD = DetailData.Id;
                    //         IsDataUpdated = 1;
                    //         if (detail.IsExclusionItem) {
                    //             let pacData: any = {
                    //                 Id: 0,
                    //                 EncounterIPPackageDetailId: EnIPPD,
                    //                 PatientBillDetailId: detail.Id,
                    //                 IPPackageId: EncounterIPPackage.IPPackageId,
                    //                 EncounterIPPackageId: EncIPPackageId,
                    //                 PackageName: EncounterIPPackage.IPPackageName,
                    //                 ServiceGroupId: detail.ServiceGroupId,
                    //                 ServiceCategoryId: detail.ServiceCategoryId,
                    //                 ServiceItemId: detail.ServiceId,
                    //                 ServiceItemName: detail.ServiceName,
                    //                 Quantity: detail.Quantity,
                    //                 Rate: detail.Rate,
                    //                 Amount: detail.Amount,
                    //                 TotalAmount: detail.GrossAmount,
                    //                 ActiveStatusId: 2,
                    //                 Status: 1
                    //             };
                    //             PackageDetailExclusion.push(pacData);
                    //             await patientbillpackageexclusionbo
                    //                 .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, EnIPPD, PackageDetailExclusion);
                    //         } else if (detail.IsInclusionItem) {
                    //             let pacData: any = {
                    //                 Id: 0,
                    //                 EncounterIPPackageDetailId: EnIPPD,
                    //                 PatientBillDetailId: detail.Id,
                    //                 IPPackageId: EncounterIPPackage.IPPackageId,
                    //                 EncounterIPPackageId: EncIPPackageId,
                    //                 PackageName: EncounterIPPackage.IPPackageName,
                    //                 ServiceGroupId: detail.ServiceGroupId,
                    //                 ServiceCategoryId: detail.ServiceCategoryId,
                    //                 ServiceItemId: detail.ServiceId,
                    //                 ServiceItemName: detail.ServiceName,
                    //                 Quantity: detail.Quantity,
                    //                 Rate: detail.Rate,
                    //                 Amount: detail.Amount,
                    //                 TotalAmount: detail.GrossAmount,
                    //                 ActiveStatusId: 2,
                    //                 Status: 1
                    //             };
                    //             PackageDetailInclusion.push(pacData);
                    //             await patientbillpackageinclusionbo
                    //                 .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, EnIPPD, PackageDetailInclusion);

                    //         }
                    //         break;
                    //     }
                    // }
                    // if (IsDataUpdated === 0) {
                    //     let pacDetailData: any = {
                    //         Data: {
                    //             Id: 0,
                    //             EncounterIPPackageId: EncIPPackageId,
                    //             IPPackageDetailId: 0,
                    //             ServiceCategoryId: detail.ServiceCategoryId,
                    //             ServiceCategoryCode: ServiceCategoryInfo.ServiceCategoryCode,
                    //             ServiceCategoryName: ServiceCategoryInfo.ServiceCategoryName,
                    //             PackageAmount: detail.NetAmount,
                    //             ActiveStatusId: 2,
                    //             Status: 1,
                    //         }
                    //     };
                    //     // PackageDetails.Push(pacDetailData);
                    //     let detailDataId = await encounterippackagedetailbo
                    //         .AddEncounterIPPackageDetail(pacDetailData);
                    //     console.log('*******detailDataId********', detailDataId);
                    //     let PackageDetailsId = detailDataId;
                    //     if (detail.IsExclusionItem) {
                    //         let pacData: any = {
                    //             Id: 0,
                    //             EncounterIPPackageDetailId: PackageDetailsId,
                    //             PatientBillDetailId: detail.Id,
                    //             IPPackageId: EncounterIPPackage.IPPackageId,
                    //             EncounterIPPackageId: EncIPPackageId,
                    //             PackageName: EncounterIPPackage.IPPackageName,
                    //             ServiceGroupId: detail.ServiceGroupId,
                    //             ServiceCategoryId: detail.ServiceCategoryId,
                    //             ServiceItemId: detail.ServiceId,
                    //             ServiceItemName: detail.ServiceName,
                    //             Quantity: detail.Quantity,
                    //             Rate: detail.Rate,
                    //             Amount: detail.Amount,
                    //             TotalAmount: detail.GrossAmount,
                    //             ActiveStatusId: 2,
                    //             Status: 1
                    //         };
                    //         PackageDetailExclusion1.push(pacData);
                    //         console.log('*******PackageDetailExclusion1********', PackageDetailExclusion1);
                    //         await patientbillpackageexclusionbo
                    //             .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, PackageDetailsId, PackageDetailExclusion1);
                    //     } else if (detail.IsInclusionItem) {
                    //         let pacData: any = {
                    //             Id: 0,
                    //             EncounterIPPackageDetailId: PackageDetailsId,
                    //             PatientBillDetailId: detail.Id,
                    //             IPPackageId: EncounterIPPackage.IPPackageId,
                    //             EncounterIPPackageId: EncIPPackageId,
                    //             PackageName: EncounterIPPackage.IPPackageName,
                    //             ServiceGroupId: detail.ServiceGroupId,
                    //             ServiceCategoryId: detail.ServiceCategoryId,
                    //             ServiceItemId: detail.ServiceId,
                    //             ServiceItemName: detail.ServiceName,
                    //             Quantity: detail.Quantity,
                    //             Rate: detail.Rate,
                    //             Amount: detail.Amount,
                    //             TotalAmount: detail.GrossAmount,
                    //             ActiveStatusId: 2,
                    //             Status: 1
                    //         };
                    //         PackageDetailInclusion1.push(pacData);
                    //         await patientbillpackageinclusionbo
                    //             .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, PackageDetailsId, PackageDetailInclusion1);

                    //     }
                    // }
                    // let billSummReq = {
                    //     Id: 0,
                    //     PageContext: { PageSize: 50, PageNumber: 1 },
                    //     Params: [
                    //         { Key: PatientBillSummaryFilters.EncounterId, Value: BillData.EncounterId },
                    //         { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                    //     ]
                    // };
                    // let PatinetBillSummaData = await patientbillsummbo.GetPatientBillSummarys(billSummReq);
                    // if (PatinetBillSummaData.Data.length > 0) {
                    //     for (let sdx in PatinetBillSummaData.Data) {
                    //         let summInfo = PatinetBillSummaData.Data[sdx];
                    //         // if (summInfo.ServiceCategoryId === detail.ServiceCategoryId) {
                    //         let actamt = 0;
                    //         actamt = summInfo.ActualAmount + detail.NetAmount;
                    //         let SummData: any = {
                    //             Id: summInfo.Id,
                    //             EncounterId: BillData.EncounterId,
                    //             ServiceCategoryId: detail.ServiceCategoryId,
                    //             ActualAmount: actamt,
                    //         };
                    //         await patientbillsummbo.Update(SummData);
                    //         // } else {
                    //         //     let SummData: any = {
                    //         //         Id: 0,
                    //         //         EncounterId: BillData.EncounterId,
                    //         //         ServiceCategoryId: detail.ServiceCategoryId,
                    //         //         ActualAmount: detail.NetAmount,
                    //         //     };
                    //         //     await patientbillsummbo.Save(SummData);
                    //         // }
                    //     }
                    // }
                    // if (PatinetBillSummaData.Data.length === 0) {
                    //     let SummData: any = {
                    //         Id: 0,
                    //         EncounterId: BillData.EncounterId,
                    //         ServiceCategoryId: detail.ServiceCategoryId,
                    //         ActualAmount: detail.NetAmount,
                    //     };
                    //     await patientbillsummbo.Save(SummData);
                    // }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        return true;
    }

    public async ManagePatientClinicBillDetails(PatientBillId: number, details: PatientBillDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.EncounterId) {
                    // await this.IsBillLockCheck(PatientBillId, detail.EncounterId);
                }
                detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    if (!detail.UnitPrice || detail.UnitPrice === 0) //Newly included on 30/3/24
                        detail.UnitPrice = detail.Rate;
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        let BillIds: Array<any> = [];
        let BillMap: any = {};
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = BillMap[detail.PatientBillId];
                if (!Bill) {
                    BillIds.push(detail.PatientBillId);
                    Bill = {
                        Id: detail.PatientBillId,
                    };
                    BillMap[detail.PatientBillId] = Bill;
                }
            })(DetailItem);
        }));
        let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        await Promise.all(BillIds.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = await patientbillbo.GetPatientBillsById({ Id: detail });
                let BillDetailApiReq = {
                    Id: 0,
                    PageContext: {
                        PageSize: 10000,
                        PageNumber: 1
                    },
                    Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: Bill.Id }]
                };
                // let BillDetails = await this.GetPatientBillDetails(BillDetailApiReq);
                let BillDetails = await this.GetMinPatientBillDetails(BillDetailApiReq);
                let BillAmount: number = 0;
                let BillDiscount: number = 0;
                let BillGstAmount: number = 0;
                let CancelledCount: number = 0;
                await Promise.all(BillDetails.Data.map((BillDetailItem): Promise<void> => {
                    return (async (BillDetail): Promise<void> => {
                        if (BillDetail.PatientBillStatusId !== 2) {
                            BillAmount += BillDetail.Amount;
                            BillDiscount += BillDetail.DiscountAmount;
                            BillGstAmount += BillDetail.GSTAmount || 0;
                        } else if (BillDetail.PatientBillStatusId === 2) {
                            CancelledCount++;
                        }
                    })(BillDetailItem);
                }));
                if (BillDetails.Data.length === CancelledCount) {
                    Bill.PatientBillStatusId = 2;
                    Bill.CancelledBy = BillDetails.Data[0].CancelledBy;
                } else {
                    Bill.BillAmount = BillAmount;
                    Bill.BillDiscount = BillDiscount;
                    Bill.GSTAmount = BillGstAmount;
                    Bill.PatientBillStatusId = 3;
                }
                await patientbillbo.Update(Bill);
            })(DetailItem);
        }));
        return true;
    }

    public async ManagePatientDispenseBillDetails(PatientBillId: number, details: PatientBillDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0 && detail.Quantity > 0) {
                    let result = await this.Save(detail);
                    // let patientbillsummbo = BoFactory.GetBo(BillingBo.PatientBillSummaryBo, this.Request);
                    // let billSummReq = {
                    //     Id: 0,
                    //     PageContext: { PageSize: 50, PageNumber: 1 },
                    //     Params: [
                    //         { Key: PatientBillSummaryFilters.EncounterId, Value: detail.EncounterId },
                    //         { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                    //     ]
                    // };
                    // let PatinetBillSummaData = await patientbillsummbo.GetPatientBillSummarys(billSummReq);
                    // if (PatinetBillSummaData.Data.length > 0) {
                    //     for (let sdx in PatinetBillSummaData.Data) {
                    //         let summInfo = PatinetBillSummaData.Data[sdx];
                    //         let actamt = 0;
                    //         actamt = summInfo.ActualAmount + detail.NetAmount;
                    //         let SummData: any = {
                    //             Id: summInfo.Id,
                    //             EncounterId: detail.EncounterId,
                    //             ServiceCategoryId: detail.ServiceCategoryId,
                    //             ActualAmount: actamt,
                    //         };
                    //         await patientbillsummbo.Update(SummData);
                    //     }
                    // }
                    // if (PatinetBillSummaData.Data.length === 0) {
                    //     let SummData: any = {
                    //         Id: 0,
                    //         EncounterId: detail.EncounterId,
                    //         ServiceCategoryId: detail.ServiceCategoryId,
                    //         ActualAmount: detail.NetAmount,
                    //     };
                    //     await patientbillsummbo.Save(SummData);
                    // }
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        return true;
    }

    public async ManageOPPatientReturnedQtyDetails(PatientRefundId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageOPReturnedItem(PatientRefundId, request, detail);
            })(item);
        }));
    }

    public async ManageOPReturnedItem(PatientRefundId: number, request: any, detail: any): Promise<void> {
        let PatientBillDetailId = detail.PatientBillDetailId;
        if (PatientBillDetailId > 0) {
            let PatientBillDetailedItem = await this.GetPatientBillDetailsById({ Id: PatientBillDetailId });
            PatientBillDetailedItem.ReturnedQuantity = PatientBillDetailedItem.ReturnedQuantity + detail.ReturnQuantity;
            PatientBillDetailedItem.ReturnedAmount =
                PatientBillDetailedItem.ReturnedAmount + (Number(detail.ReturnQuantity) * PatientBillDetailedItem.Rate);
            await this.Update(PatientBillDetailedItem);
        }
    }

    public async ManageIPPatientReturnedQtyDetails(PatientRefundId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageIPReturnedItem(PatientRefundId, request, detail);
            })(item);
        }));
    }

    public async ManageIPReturnedItem(PatientRefundId: number, request: any, detail: any): Promise<void> {
        let PatientBillDetailId = detail.PatientBillDetailId;
        let PatientBillDetailedItem: any = {};
        if (PatientBillDetailId > 0) {
            PatientBillDetailedItem = await this.GetPatientBillDetailsById({ Id: PatientBillDetailId });
            PatientBillDetailedItem.ReturnedQuantity = PatientBillDetailedItem.ReturnedQuantity + detail.ReturnQuantity;
            PatientBillDetailedItem.ReturnedAmount =
                PatientBillDetailedItem.ReturnedAmount + (Number(detail.ReturnQuantity) * PatientBillDetailedItem.Rate);
            // PatientBillDetailedItem.PatNetAmount = PatientBillDetailedItem.PatNetAmount - detail.PatNetAmount;
            // PatientBillDetailedItem.InsNetAmount = PatientBillDetailedItem.InsNetAmount - detail.InsNetAmount;
            await this.Update(PatientBillDetailedItem);
        }
        // let patientbillsummbo = BoFactory.GetBo(BillingBo.PatientBillSummaryBo, this.Request);
        // let billSummReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 50, PageNumber: 1 },
        //     Params: [
        //         { Key: PatientBillSummaryFilters.EncounterId, Value: PatientBillDetailedItem.EncounterId },
        //         { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: PatientBillDetailedItem.ServiceCategoryId }
        //     ]
        // };
        // let PatinetBillSummaData = await patientbillsummbo.GetPatientBillSummarys(billSummReq);
        // if (PatinetBillSummaData.Data.length > 0) {
        //     for (let sdx in PatinetBillSummaData.Data) {
        //         let summInfo = PatinetBillSummaData.Data[sdx];
        //         let actamt = 0;
        //         let actualNetAmt = 0;
        //         let actualPatNetAmt = 0;
        //         let actualDiscAmt = 0;
        //         let actualtaxAmt = 0;
        //         actamt = summInfo.ActualAmount + detail.NetAmount;
        //         actualNetAmt = summInfo.ActualNetAmount + detail.NetAmount;
        //         actualPatNetAmt = summInfo.ActualPatAmount + detail.PatNetAmount;
        //         actualDiscAmt = (summInfo.DiscountAmount || 0) + (detail.DiscountAmount || 0);
        //         // actualtaxAmt = summInfo.TaxAmount - detail.GSTAmount;
        //         let SummData: any = {
        //             Id: summInfo.Id,
        //             EncounterId: PatientBillDetailedItem.EncounterId,
        //             ServiceCategoryId: PatientBillDetailedItem.ServiceCategoryId,
        //             ActualAmount: actamt,
        //             ActualNetAmount: actualNetAmt,
        //             ActualPatAmount: actualPatNetAmt,
        //             TaxAmount: actualtaxAmt,
        //             DiscountAmount: actualDiscAmt,
        //         };
        //         await patientbillsummbo.Update(SummData);

        //     }
        // }
        // if (PatinetBillSummaData.Data.length === 0) {
        //     let SummData: any = {
        //         Id: 0,
        //         EncounterId: PatientBillDetailedItem.EncounterId,
        //         ServiceCategoryId: PatientBillDetailedItem.ServiceCategoryId,
        //         ActualAmount: detail.NetAmount,
        //     };
        //     await patientbillsummbo.Save(SummData);
        // }
    }

    public async ManageStaffPatientReturnedQtyDetails(PatientRefundId: number, request: any): Promise<any> {
        let details: Array<any> = request;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageStaffReturnedItem(PatientRefundId, request, detail);
            })(item);
        }));
    }

    public async ManageStaffReturnedItem(PatientRefundId: number, request: any, detail: any): Promise<void> {
        let PatientBillDetailId = detail.PatientBillDetailId;
        if (PatientBillDetailId > 0) {
            let PatientBillDetailedItem = await this.GetPatientBillDetailsById({ Id: PatientBillDetailId });
            PatientBillDetailedItem.Id = PatientBillDetailId;
            PatientBillDetailedItem.Quantity = PatientBillDetailedItem.Quantity - detail.ReturnQuantity;
            PatientBillDetailedItem.ReturnedQuantity = PatientBillDetailedItem.ReturnedQuantity + detail.ReturnQuantity;
            PatientBillDetailedItem.ReturnedAmount =
                PatientBillDetailedItem.ReturnedAmount + (Number(detail.ReturnQuantity) * PatientBillDetailedItem.Rate);
            await this.Update(PatientBillDetailedItem);
        }
    }

    public async UpdateBillingStaus(patientBillId: number, billingStatusId: number): Promise<boolean> {
        var result = true;
        let billStatusUpdate: any = { PatientBillStatusId: billingStatusId };
        await this.Update(billStatusUpdate, {
            fields: ['PatientBillStatusId'],
            where: {
                PatientBillId: patientBillId
            }
        });
        return result;
    }

    public async GetPatientBillDetailsById(req: BaseRequest): Promise<PatientBillDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPharmacyBillDetails(req: BaseRequest): Promise<any> {
        let BillDetails: any;
        if (req.Data.IsOtherBills) {
            let DetReq = {
                Id: 0,
                PageContext: { PageSize: 500000, PageNumber: 1 },
                Params: [
                    { Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.EncounterId },
                    { Key: PatientBillDetailsFilters.FromDate, Value: req.Data.FromDate },
                    { Key: PatientBillDetailsFilters.ToDate, Value: req.Data.ToDate },
                    { Key: PatientBillDetailsFilters.ServiceId, Value: req.Data.ServiceId },
                    { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },
                    // { Key: PatientBillDetailsFilters.IsPharmaCollections, Value: true },
                ]
            };
            BillDetails = await this.GetPatientInsuranceBillDetails(DetReq);
        } else {
            let DetReq = {
                Id: 0,
                PageContext: { PageSize: 500000, PageNumber: 1 },
                Params: [
                    { Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.EncounterId },
                    { Key: PatientBillDetailsFilters.FromDate, Value: req.Data.FromDate },
                    { Key: PatientBillDetailsFilters.ToDate, Value: req.Data.ToDate },
                    { Key: PatientBillDetailsFilters.ServiceId, Value: req.Data.ServiceId },
                    { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },
                    { Key: PatientBillDetailsFilters.IsPharmaCollections, Value: true },
                ]
            };
            BillDetails = await this.GetPatientInsuranceBillDetails(DetReq);
        }
        return BillDetails;
    }
    public async GetPatientInsuranceBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode', 'GstId', 'IsRateEditable'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false
            },
            { model: this.Models.GstMaster, required: false }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], required: false });
        include.push({
            model: this.Models.ItemMaster,
            required: false,
            attributes: ['Id', 'ItemCode', 'ItemName'],
            // include: [
            //     { model: this.Models.DrugMaster, required: false },
            //     {
            //         model: this.Models.StockItem,
            //         required: false,
            //         attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
            //         where: { 'StoreMasterId': storemasterId },
            //         include: [
            //             {
            //                 model: this.Models.StockSerialItem,
            //                 required: false,
            //                 attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
            //                     'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
            //                     'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
            //                 where: { 'Quantity': { $gt: 0 } }
            //             }
            //         ]
            //     }
            // ]
        });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.PatientDoctorShareDetails,
            required: false,
            // include: [
            //     this.GetReference('Title')
            // ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        // 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                                'EncounterTypeId', 'EncounterId'],
                            required: true,
                            where: { 'BillTypeId': 3 }
                        });
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.NonServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$notIn': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.IsPharmaCollections:
                        (where as any)['$or'] = [{ 'IsPharmacySale': param.Value },
                        { 'IsPharmacyReturn': param.Value }];
                        break;
                    case PatientBillDetailsFilters.NetAmount:
                        where['NetAmount'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsAutoBillModified:
                        where['IsAutoBillModified'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyCredit:
                        where['IsPharmacyCredit'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        order.push(['BillDateTime', 'DESC']);
        apiReq.Attributes = ['Id', 'PatientBillId', 'BillDateTime',
            'ServiceId', 'ServiceName', 'Quantity', 'DoctorShare',
            'Rate', 'Amount', 'ServiceCategoryId', 'PatientBillStatusId',
            'EncounterId', 'IsPharmacySale', 'BatchId', 'ExpiryDate',
            'InGstAmount', 'CGstAmount', 'SGstAmount', 'CGstPercentage',
            'SGstPercentage', 'GSTPercentage',
            'AliasId', 'AliasName', 'DepartmentId',
            'NetAmount', 'IsPharmacyReturn', 'MasterTypeId',
            'DiscountAmount', 'CreatedBy', 'DoctorId',
            'IsInclusionItem', 'IsExclusionItem', 'IsSupplementary',
            'GrossAmount', 'PatNetAmount', 'InsNetAmount',
            'OrderStatusId', 'ItemMasterId', 'IsAutoBillModified',
            'Status', 'UnitPrice',
            'AgreementDiscountAmt',
            'ItemCode', 'ItemName', 'GSTAmount',
            'Remarks', 'Comments',
            'UpdatedBy', 'CancelledBy',
            'CreatedAt', 'UpdatedAt',
            'StoreMasterId', 'CancelReason',
            'AdjustRate', 'IsDiscountApplied',
            'DetCancelReqRaisedStatusId'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetMinPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode', 'GstId'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, attributes: ['ServiceId', 'ServiceName'], required: false,
                include: [
                    { model: this.Models.ServiceItem, attributes: ['Name'], required: false, }
                ]
            },
                // { model: this.Models.GstMaster, required: false }
            ]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        // include.push({
        //     model: this.Models.ItemMaster,
        //     required: false,
        //     attributes: ['Id', 'ItemCode', 'ItemName'],
        //     // include: [
        //     //     { model: this.Models.DrugMaster, required: false },
        //     //     {
        //     //         model: this.Models.StockItem,
        //     //         required: false,
        //     //         attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
        //     //         where: { 'StoreMasterId': storemasterId },
        //     //         include: [
        //     //             {
        //     //                 model: this.Models.StockSerialItem,
        //     //                 required: false,
        //     //                 attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
        //     //                     'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
        //     //                     'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
        //     //                 where: { 'Quantity': { $gt: 0 } }
        //     //             }
        //     //         ]
        //     //     }
        //     // ]
        // });

        // include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        // include.push({
        //     model: this.Models.PatientDoctorShareDetails,
        //     required: false,
        //     // include: [
        //     //     this.GetReference('Title')
        //     // ]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        // 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        // include.push({
                        //     model: this.Models.PatientBills,
                        //     attributes: ['BillNumber', 'PatientName', 'DoctorName',
                        //         'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                        //         'EncounterTypeId', 'EncounterId'],
                        //     required: true,
                        //     where: { 'BillTypeId': 3 }
                        // });
                        billWhere['BillTypeId'] = 3;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.NonServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$notIn': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.IsPharmaCollections:
                        (where as any)['$or'] = [{ 'IsPharmacySale': param.Value },
                        { 'IsPharmacyReturn': param.Value }];
                        break;
                    case PatientBillDetailsFilters.NetAmount:
                        where['NetAmount'] = param.Value;
                        break;
                    default:
                        console.log(param.Key);
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.Encounter,
            // where: encounterWhere,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'RoomId', 'BedId', 'WardId'
            ],
            required: false,
            // required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                },
                // { model: this.Models.EncounterGuarantor, required: false },
            ],
        });
        // if (apiReq.Data.includeOrder === true) {
        //     include.push({
        //         model: this.Models.PatientBills, attributes: ['PatientBillId',
        //             'PatientOrderId', 'BillNumber',
        //             'BillTypeId'],
        //         required: false,
        //         include: [
        //             {
        //                 model: this.Models.PatientOrder, attributes: ['PatientOrderId', 'OrderNumber', 'OrderStatusId'],
        //                 required: true,
        //                 include: [
        //                     { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false }
        //                 ]
        //             }
        //         ],
        //     });
        // } else {
        //     include.push({
        //         model: this.Models.PatientBills, attributes: ['PatientBillId',
        //             'PatientOrderId',
        //             'BillNumber', 'BillTypeId'],
        //         required: false,
        //     });
        // }

        include.push({
            model: this.Models.PatientBills, attributes: ['PatientBillId',
                'PatientOrderId',
                'BillNumber', 'BillTypeId'],
            where: billWhere,
            required: isReqBillSearch,
        });
        order.push(['BillDateTime', 'DESC']);

        apiReq.Attributes = ['Id', 'PatientBillId', 'BillDateTime',
            'ServiceId', 'ServiceName', 'Quantity',
            'Rate', 'Amount', 'ServiceCategoryId', 'PatientBillStatusId',
            'EncounterId', 'IsPharmacySale', 'BatchId', 'ExpiryDate',
            'InGstAmount', 'CGstAmount', 'SGstAmount', 'CGstPercentage',
            'SGstPercentage', 'GSTPercentage',
            'AliasId', 'AliasName', 'DepartmentId',
            'NetAmount', 'IsPharmacyReturn', 'MasterTypeId',
            'DiscountAmount', 'CreatedBy', 'DoctorId',
            'IsInclusionItem', 'IsExclusionItem', 'IsSupplementary',
            'GrossAmount', 'PatNetAmount', 'InsNetAmount',
            'GSTAmount', 'SchemeDiscountAmt'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let bothsupplm = false;
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode', 'IsDoctorDisplay'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false,
                include: [
                    { model: this.Models.ServiceItem, attributes: ['Name', 'IsDoctorDisplay'], required: false, }
                ]
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false,
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemName', 'ProductRegNo', 'SubCategoryId'], required: false,
            include: [
                this.GetReference('ScheduleType'),
                {
                    model: this.Models.VendorMaster, attributes: ['VendorName'], required: false,
                },
                {
                    model: this.Models.HsnMaster, attributes: ['HSNCode'], required: false,
                },
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'UserName'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'ExeDoctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientDoctorShareDetails,
            required: false,
            // include: [
            //     this.GetReference('Title')
            // ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientBillDetailsFilters.PatientBillStatus:          Please Add New Key Name and add the filter case.
                    //     billWhere['PatientBillStatusId'] = param.Value;        Dont Edit in Any Existing Cases.
                    //     isReqBillSearch = true;
                    //     break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        billWhere['BillTypeId'] = 3;// 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PatientNameMrn:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    // case PatientBillDetailsFilters.NotInServiceCategoryId:
                    //     if (param.Value) {
                    //         let paramArr: Array<number> = [];
                    //         if (param.Value.toString().indexOf(',') > -1) {
                    //             paramArr = param.Value.toString().split(',');
                    //         } else {
                    //             paramArr = [param.Value];
                    //         }
                    //         where['ServiceCategoryId'] = { '$in': paramArr };
                    //     }
                    //     break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientId:
                        billWhere['PatientId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.BillTypeId:
                        billWhere['BillTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.FacilityId:
                        billWhere['FacilityId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsExecutingService:
                        where['IsExecutingService'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ScheduleTypeId:
                        where['ScheduleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyBill:
                        billWhere['IsPharmacyBill'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillDetailsFilters.BothSupplmandPartial:
                        (where as any)['$or'] = [{ 'IsPartialSupplemetary': true },
                        { 'IsSupplementary': false }];
                        bothsupplm = true;
                        // where['$not'] = [{ 'IsPartialSupplemetary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.MultiScheduleTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ScheduleTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.IsDietBill:
                        billWhere['IsDietBill'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyReturn:
                        where['IsPharmacyReturn'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.BillStatus:
                        billWhere['PatientBillStatusId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.Quantity:
                        where['Quantity'] = { $gt: param.Value };
                        break;
                    case PatientBillDetailsFilters.CancelReqRaisedStatusId:
                        where['CancelReqRaisedStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmaCollections:
                        (where as any)['$or'] = [{ 'IsPharmacySale': param.Value },
                        { 'IsPharmacyReturn': param.Value }];
                        break;
                    case PatientBillDetailsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['BillNumber', 'PatientName', 'Age', 'GenderId', 'RoomId', 'BedId', 'WardId', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId', 'IsPharmacyBill', 'IsDietBill'],
            required: isReqBillSearch,
            where: billWhere,
            include: [this.GetReference('Gender'), this.GetReference('BillType'), {
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender'),
                    { model: this.Models.Referral, required: false, }
                ],
            },
            {
                model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            },
            {
                model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            },
            {
                model: this.Models.PatientPaymentDetails, required: false,
                include: [this.GetReference('PaymentType'), {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                }],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                },
                { model: this.Models.EncounterGuarantor, required: false },
            ],
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPatientBillDetailsforprint(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let bothsupplm = false;
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false,
                include: [
                    { model: this.Models.ServiceItem, attributes: ['Name'], required: false, }
                ]
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false,
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemName', 'ProductRegNo', 'SubCategoryId'], required: false,
            include: [
                this.GetReference('ScheduleType'),
                {
                    model: this.Models.VendorMaster, attributes: ['VendorName'], required: false,
                },
                {
                    model: this.Models.HsnMaster, attributes: ['HSNCode'], required: false,
                },
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'LicenseNo', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'UserName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'ExeDoctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientDoctorShareDetails,
            required: false,
            // include: [
            //     this.GetReference('Title')
            // ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientBillDetailsFilters.PatientBillStatus:          Please Add New Key Name and add the filter case.
                    //     billWhere['PatientBillStatusId'] = param.Value;        Dont Edit in Any Existing Cases.
                    //     isReqBillSearch = true;
                    //     break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        billWhere['BillTypeId'] = 3;// 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PatientNameMrn:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientId:
                        billWhere['PatientId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.BillTypeId:
                        billWhere['BillTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.FacilityId:
                        billWhere['FacilityId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsExecutingService:
                        where['IsExecutingService'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ScheduleTypeId:
                        where['ScheduleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyBill:
                        billWhere['IsPharmacyBill'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillDetailsFilters.BothSupplmandPartial:
                        (where as any)['$or'] = [{ 'IsPartialSupplemetary': true },
                        { 'IsSupplementary': false }];
                        bothsupplm = true;
                        // where['$not'] = [{ 'IsPartialSupplemetary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.MultiScheduleTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ScheduleTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.IsDietBill:
                        billWhere['IsDietBill'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyReturn:
                        where['IsPharmacyReturn'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.BillStatus:
                        billWhere['PatientBillStatusId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.Quantity:
                        where['Quantity'] = { $gt: param.Value };
                        break;
                    case PatientBillDetailsFilters.CancelReqRaisedStatusId:
                        where['CancelReqRaisedStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmaCollections:
                        (where as any)['$or'] = [{ 'IsPharmacySale': param.Value },
                        { 'IsPharmacyReturn': param.Value }];
                        break;
                    case PatientBillDetailsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        // include.push({
        //     model: this.Models.PatientBills,
        //     attributes: ['BillNumber', 'PatientName', 'Age', 'GenderId', 'RoomId', 'BedId', 'WardId', 'DoctorName',
        //         'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
        //         'EncounterTypeId', 'EncounterId', 'IsPharmacyBill', 'IsDietBill'],
        //     required: isReqBillSearch,
        //     where: billWhere,
        //     include: [this.GetReference('Gender'), this.GetReference('BillType'), {
        //         model: this.Models.Patient,
        //         where: patientWhere,
        //         attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
        //             'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
        //             'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
        //         required: isReqPatientSearch,
        //         include: [
        //             this.GetReference('Title'), this.GetReference('Gender'),
        //             { model: this.Models.Referral, required: false, }
        //         ],
        //     },
        //     {
        //         model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
        //     },
        //     {
        //         model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
        //     },
        //     {
        //         model: this.Models.WardMaster, attributes: ['WardName'], required: false,
        //     },
        //     {
        //         model: this.Models.PatientPaymentDetails, required: false,
        //         include: [this.GetReference('PaymentType'), {
        //             model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
        //             include: [
        //                 this.GetReference('Title')
        //             ]
        //         }],
        //     }]
        // });
        // include.push({
        //     model: this.Models.Encounter,
        //     where: encounterWhere,
        //     attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
        //     required: isReqEncounterSearch,
        //     include: [
        //         {
        //             model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
        //         },
        //         {
        //             model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
        //         },
        //         {
        //             model: this.Models.WardMaster, attributes: ['WardName'], required: false,
        //         },
        //         { model: this.Models.EncounterGuarantor, required: false },
        //     ],
        // });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPatientBillDetailsforStockserialItem(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let ItemWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let bothsupplm = false;
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription', 'StoreName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'UserName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.StockSerialItem, attributes: ['Id', 'StoreMasterId',
                'ItemMasterId', 'ItemCode', 'ItemName', 'Ucp', 'Mrp'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientBillDetailsFilters.PatientBillStatus:          Please Add New Key Name and add the filter case.
                    //     billWhere['PatientBillStatusId'] = param.Value;        Dont Edit in Any Existing Cases.
                    //     isReqBillSearch = true;
                    //     break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        billWhere['BillTypeId'] = 3;// 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PatientNameMrn:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientId:
                        billWhere['PatientId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.BillTypeId:
                        billWhere['BillTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.FacilityId:
                        billWhere['FacilityId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsExecutingService:
                        where['IsExecutingService'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ScheduleTypeId:
                        where['ScheduleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyBill:
                        billWhere['IsPharmacyBill'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillDetailsFilters.BothSupplmandPartial:
                        (where as any)['$or'] = [{ 'IsPartialSupplemetary': true },
                        { 'IsSupplementary': false }];
                        bothsupplm = true;
                        // where['$not'] = [{ 'IsPartialSupplemetary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.MultiScheduleTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ScheduleTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ProductTypeId:
                        ItemWhere['ProductTypeId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['BillNumber', 'PatientName', 'Age', 'GenderId', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId', 'IsPharmacyBill'],
            required: isReqBillSearch,
            where: billWhere,
            include: [this.GetReference('Gender'), {
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.ItemMaster,
            attributes: ['ItemName', 'ProductTypeId', 'ProductRegNo',
                'SubCategoryId'], required: isReqItemSearch, where: ItemWhere,
            include: [
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                }
            ],
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPatientBillDetailsForPerformingDoctors(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false
            }, {
                model: this.Models.ServiceItemPerformingDoctor
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false,
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemName', 'ProductRegNo', 'SubCategoryId'], required: false,
            include: [
                this.GetReference('ScheduleType'),
                {
                    model: this.Models.VendorMaster, attributes: ['VendorName'], required: false,
                },
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo', 'UserName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientBillDetailsFilters.PatientBillStatus:          Please Add New Key Name and add the filter case.
                    //     billWhere['PatientBillStatusId'] = param.Value;        Dont Edit in Any Existing Cases.
                    //     isReqBillSearch = true;
                    //     break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        billWhere['BillTypeId'] = 3;// 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PatientNameMrn:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientId:
                        billWhere['PatientId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.BillTypeId:
                        billWhere['BillTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsExecutingService:
                        where['IsExecutingService'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                }
            ],
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPatientPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreName'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyCredit:
                        where['IsPharmacyCredit'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyReturn:
                        where['IsPharmacyReturn'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn', 'AdmissionDate', 'DischargeDate',
                'EncounterStatusId', 'AdmissionStatusId', 'IsBillLock'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.PatientStockReturnDetails,
                    as: 'PatientStockReturnDetails',
                    required: false,
                    where: { 'ReturnStatusId': [2, 3] }
                }
            ]
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientOTPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyCredit:
                        where['IsPharmacyCredit'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: false
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn', 'AdmissionDate', 'DischargeDate',
                'EncounterStatusId', 'AdmissionStatusId', 'IsBillLock'],
            required: isReqEncounterSearch
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetMinPatientBillDetailsforLock(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PatientBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        // include.push({
        //     model: this.Models.ServiceItem, attributes: ['ItemCode', 'GstId'], required: false,
        //     include: [{
        //         model: this.Models.ServiceItemPackageMap, attributes: ['ServiceId', 'ServiceName'], required: false,
        //         include: [
        //             { model: this.Models.ServiceItem, attributes: ['Name'], required: false, }
        //         ]
        //     },
        //         // { model: this.Models.GstMaster, required: false }
        //     ]
        // });
        // include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        // include.push({
        //     model: this.Models.ItemMaster,
        //     required: false,
        //     attributes: ['Id', 'ItemCode', 'ItemName'],
        //     // include: [
        //     //     { model: this.Models.DrugMaster, required: false },
        //     //     {
        //     //         model: this.Models.StockItem,
        //     //         required: false,
        //     //         attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
        //     //         where: { 'StoreMasterId': storemasterId },
        //     //         include: [
        //     //             {
        //     //                 model: this.Models.StockSerialItem,
        //     //                 required: false,
        //     //                 attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
        //     //                     'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
        //     //                     'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
        //     //                 where: { 'Quantity': { $gt: 0 } }
        //     //             }
        //     //         ]
        //     //     }
        //     // ]
        // });

        // include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        // include.push({
        //     model: this.Models.PatientDoctorShareDetails,
        //     required: false,
        //     // include: [
        //     //     this.GetReference('Title')
        //     // ]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'TitleId'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        // 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        // include.push({
                        //     model: this.Models.PatientBills,
                        //     attributes: ['BillNumber', 'PatientName', 'DoctorName',
                        //         'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                        //         'EncounterTypeId', 'EncounterId'],
                        //     required: true,
                        //     where: { 'BillTypeId': 3 }
                        // });
                        billWhere['BillTypeId'] = 3;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillDetailsFilters.NonServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$notIn': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.IsPharmaCollections:
                        (where as any)['$or'] = [{ 'IsPharmacySale': param.Value },
                        { 'IsPharmacyReturn': param.Value }];
                        break;
                    case PatientBillDetailsFilters.NetAmount:
                        where['NetAmount'] = param.Value;
                        break;
                    default:
                        console.log(param.Key);
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.Encounter,
            where: {
                AdmissionStatusId: { '$notIn': [1, 5, 6, 7] },
            },
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'RoomId', 'BedId', 'WardId'
            ],
            required: false,
        });


        order.push(['BillDateTime', 'DESC']);

        apiReq.Attributes = ['Id', 'PatientBillId', 'BillDateTime',
            'ServiceId', 'ServiceName', 'Quantity',
            'Rate', 'Amount', 'ServiceCategoryId', 'PatientBillStatusId',
            'EncounterId', 'IsPharmacySale', 'BatchId', 'ExpiryDate',
            'InGstAmount', 'CGstAmount', 'SGstAmount', 'CGstPercentage',
            'SGstPercentage', 'GSTPercentage',
            'AliasId', 'AliasName', 'DepartmentId',
            'NetAmount', 'IsPharmacyReturn', 'MasterTypeId',
            'DiscountAmount', 'CreatedBy', 'DoctorId',
            'IsInclusionItem', 'IsExclusionItem', 'IsSupplementary',
            'GrossAmount', 'PatNetAmount', 'InsNetAmount',
            'GSTAmount', 'SchemeDiscountAmt'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeletePatientBillDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async UpdateBillRates(req: any): Promise<Boolean> {
        let billDetails = req.Data.Details;
        let UpdatedBillDetails: any = [];
        let BillBo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        for (let idx in billDetails) {
            let detailData = billDetails[idx];
            let BillAmount: number = 0;
            let InsuranceAmount: number = 0;
            let PatientAmount: number = 0;
            let BillDiscount: number = 0;
            let CancelledCount: number = 0;
            if (detailData.ServiceId) {
                if (detailData.IsPharmacySale === true || detailData.IsPharmacyReturn === true) {
                    let IsSuppm: any = false;
                    if (req.Data.Header.GuarantorTypeId === 1) {
                        IsSuppm = false;
                    }
                    let detailInfo: any = {
                        Id: detailData.Id,
                        IsSupplementary: IsSuppm
                    };
                    await this.Update(detailInfo);
                } else {
                    let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: detailData.ServiceId });
                    let serviceTariffApiReq = {
                        Id: 0,
                        PageContext: { PageSize: -1, PageNumber: 1 },
                        Params: [{ Key: 2, Value: ServiceInfo.Id }, { Key: 3, Value: req.Data.Header.ServiceRateCategoryId },
                        { Key: 5, Value: req.Data.Header.FacilityId }]
                    };
                    let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                    if (serviceItemInfo.Data.length > 0) {
                        let traif = serviceItemInfo.Data[0];
                        let PatAmt = 0;
                        let InsAmt = 0;
                        if (req.Data.Header.GuarantorTypeId > 1) {
                            if (req.Data.Header.CoPayPercent) {
                                PatAmt = parseFloat(traif.Rate.toString()) * (parseInt(req.Data.Header.CoPayPercent) / 100);
                                InsAmt = (parseFloat(traif.Rate.toString())) - (PatAmt || 0);
                            } if (!req.Data.Header.CoPayPercent) {
                                InsAmt = parseFloat(traif.Rate.toString());
                            }
                        } else {
                            InsAmt = 0;
                            PatAmt = 0;
                        }
                        let IsSuppm: any = false;
                        if (req.Data.Header.GuarantorTypeId === 1) {
                            IsSuppm = false;
                        }
                        let detailInfo: any = {
                            Id: detailData.Id,
                            Rate: parseFloat(traif.Rate.toString()),
                            ServiceCategoryId: detailData.ServiceCategoryId,
                            ServiceRateCategoryId: req.Data.Header.ServiceRateCategoryId,
                            PatientBillStatusId: detailData.PatientBillStatusId,
                            Amount: detailData.Quantity * parseFloat(traif.Rate.toString()),
                            GrossAmount: detailData.Quantity * parseFloat(traif.Rate.toString()),
                            NetAmount: detailData.Quantity * parseFloat(traif.Rate.toString()),
                            InsNetAmount: InsAmt,
                            PatNetAmount: PatAmt,
                            IsSupplementary: IsSuppm
                        };
                        await this.Update(detailInfo);
                        UpdatedBillDetails.push(detailInfo);
                        let Bill = await BillBo.GetPatientBillsById({ Id: detailData.PatientBillId });
                        if (detailData.PatientBillStatusId !== 2) {
                            BillAmount += detailData.Amount;
                            InsuranceAmount += detailData.InsNetAmount || 0;
                            PatientAmount += detailData.PatNetAmount || 0;
                            BillDiscount += detailData.DiscountAmount;
                        } else if (detailData.PatientBillStatusId === 2) {
                            CancelledCount++;
                        }
                        // if (detailData.Data.length === CancelledCount) {
                        //     Bill.PatientBillStatusId = 2;
                        //     Bill.CancelledBy = detailData.Data[0].CancelledBy;
                        // } else {
                        Bill.BillAmount = BillAmount;
                        Bill.NetInsuranceAmount = InsuranceAmount;
                        Bill.NetPatientAmount = PatientAmount;
                        Bill.BillDiscount = BillDiscount;
                        Bill.ServiceRateCategoryId = req.Data.Header.ServiceRateCategoryId;
                        Bill.PatientBillStatusId = 3;
                        // }
                        await BillBo.Update(Bill);
                    }
                }
            }
        }
        let billSummBo = BoFactory.GetBo(BillingBo.PatientBillSummaryBo, this.Request);
        await billSummBo.ManageUpdateRateBillSummary(false, req.Data.Header.EncounterId, UpdatedBillDetails);
        return true;
    }
    public async UpdateInsuranceBill(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        let EncounterId = null;
        details = details || [];
        if (details.length > 0) {
            EncounterId = details[0].EncounterId;
        }
        let PatientBillId = null;
        let BillBo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);

        let encounterippackagebo = BoFactory.GetBo(encbo.EncounterIPPackageBo, this.Request);
        let encounterippackagedetailbo = BoFactory.GetBo(encbo.EncounterIPPackageDetailBo, this.Request);
        let EncounterPackageReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: EncounterIPPackageFilters.EncounterId, Value: EncounterId }
            ]
        };
        let EncounterIPPackageData = await encounterippackagebo.GetEncounterIPPackages(EncounterPackageReq);
        let EncounterIPPackage = EncounterIPPackageData.Data[0];
        let EncIPPackageId = 0;
        if (EncounterIPPackageData.Data.length > 0) {
            EncIPPackageId = EncounterIPPackage.Id;
        }
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                EncounterId = detail.EncounterId;
                PatientBillId = detail.PatientBillId;
                let PatientBillDetailId = detail.Id;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    // console.log('*****detail*****',detail);
                    await this.Update(detail);
                    //Doctor Share Update

                    let docShareBO = BoFactory.GetBo(BillingBo.PatientDoctorShareDetailsBo, this.Request);
                    let billdetail: any = {};
                    billdetail = detail;
                    if (billdetail.DocShareDetails && billdetail.DocShareDetails.length > 0) {
                        let docDetail: any = [];
                        for (let pdx in billdetail.DocShareDetails) {
                            let docShareDetail = billdetail.DocShareDetails[pdx];
                            if (docShareDetail.PerformDoctorId > 0) {

                                // console.log('*********billdetail2**********', billdetail);
                                console.log(docShareDetail.Id);
                                if (docShareDetail.Id === 0) {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: billdetail.PatientBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        TeamId: docShareDetail.TeamId,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: billdetail.NetAmount,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        EncounterId: detail.EncounterId,
                                        EncounterTypeId: 2,
                                        IsInvoicedDoctorShare: false,
                                        ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                } else {
                                    let docData: any = {
                                        Id: docShareDetail.Id,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        Status: docShareDetail.Status,
                                        //PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        // EncounterId: detail.EncounterId,
                                        // EncounterTypeId: detail.EncounterTypeId,
                                        // IsInvoicedDoctorShare: false,
                                        // ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    console.log(docData);
                                    docDetail.push(docData);
                                }
                            }
                            //  console.log('*********docDetail2**********',docDetail);
                        }
                        await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                    }

                    // let SummaryPackageDetail: any = [];
                    let PackageDetailExclusion: any = [];
                    let PackageDetailInclusion: any = [];
                    let PackageDetailExclusion1: any = [];
                    let PackageDetailInclusion1: any = [];
                    let IncDataDetail: any = [];
                    let ExcDataDetail: any = [];
                    // let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
                    let patientbillpackageexclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceExclusionBo, this.Request);
                    let patientbillpackageinclusionbo = BoFactory.GetBo(encbo.EncounterIPPackageServiceInclusionBo, this.Request);
                    // let BillData = await patientbillbo.GetPatientBillsById({ Id: PatientBillId });

                    // console.log('*****EncounterIPPackage*****', EncounterIPPackage);
                    let EncounterPackageDetailReq = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: EncIPPackageId },
                            { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                        ]
                    };
                    let EncounterIPPackageDetailData = await
                        encounterippackagedetailbo.GetMinEncounterIPPackageDetails(EncounterPackageDetailReq);
                    let EnIPPD = 0;
                    let IsDataUpdated = 0;
                    // let EncounterIPPackageDetail = EncounterIPPackageDetailData.Data[0];
                    // if (EncounterIPPackageDetailData.Data.length > 0) {
                    //     EnIPPD = EncounterIPPackageDetail.Id;
                    // }
                    //start
                    let EncounterPackageInclusionReq = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: EncounterIPPackageServiceInclusionFilters.PatientBillDetailId, Value: detail.Id },
                            { Key: EncounterIPPackageServiceInclusionFilters.ServiceItemId, Value: detail.ServiceId }
                        ]
                    };
                    let EncounterIPPackageInclusionData = await
                        patientbillpackageinclusionbo.GetMinEncounterIPPackageServiceInclusions(EncounterPackageInclusionReq);
                    let encinclusionid = 0;
                    let EncounterIPPackageInclusion = EncounterIPPackageInclusionData.Data[0];
                    if (EncounterIPPackageInclusionData.Data.length > 0) {
                        encinclusionid = EncounterIPPackageInclusion.Id || 0;
                    }
                    if (encinclusionid > 0 && detail.IsExclusionItem) {
                        let incData: any = {
                            Id: encinclusionid,
                            Rate: 0.000000,
                            Amount: 0.000000,
                            ActiveStatusId: 2,
                            Status: 2,
                            TotalAmount: 0.000000
                        };
                        IncDataDetail.push(incData);
                        // console.log('**********IncDataDetail****************', IncDataDetail);
                        await patientbillpackageinclusionbo
                            .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, EnIPPD, IncDataDetail);
                    }//end
                    let EncounterPackageExclusionReq = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: EncounterIPPackageServiceExclusionFilters.PatientBillDetailId, Value: detail.Id },
                            { Key: EncounterIPPackageServiceExclusionFilters.ServiceItemId, Value: detail.ServiceId }
                        ]
                    };
                    let EncounterIPPackageExclusionData = await
                        patientbillpackageexclusionbo.GetMinEncounterIPPackageServiceExclusions(EncounterPackageExclusionReq);
                    let encexclusionid = 0;
                    let EncounterIPPackageExclusion = EncounterIPPackageExclusionData.Data[0];
                    if (EncounterIPPackageExclusionData.Data.length > 0) {
                        encexclusionid = EncounterIPPackageExclusion.Id || 0;
                    }
                    if (encexclusionid > 0 && detail.IsInclusionItem) {
                        let excData: any = {
                            Id: encexclusionid,
                            Rate: '0.000000',
                            Amount: '0.000000',
                            ActiveStatusId: 2,
                            Status: 2,
                            TotalAmount: '0.000000'
                        };
                        ExcDataDetail.push(excData);
                        // console.log('**********ExcDataDetail****************', ExcDataDetail);
                        await patientbillpackageexclusionbo
                            .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, EnIPPD, ExcDataDetail);
                    }
                    for (var idx in EncounterIPPackageDetailData.Data) {
                        var DetailData = EncounterIPPackageDetailData.Data[idx];
                        if (DetailData.ServiceCategoryId === detail.ServiceCategoryId) {
                            EnIPPD = DetailData.Id;
                            IsDataUpdated = 1;
                            if (detail.IsExclusionItem) {
                                let pacData: any = {
                                    Id: 0,
                                    EncounterIPPackageDetailId: EnIPPD,
                                    PatientBillDetailId: detail.Id,
                                    IPPackageId: EncounterIPPackage.IPPackageId,
                                    EncounterIPPackageId: EncIPPackageId,
                                    PackageName: EncounterIPPackage.IPPackageName,
                                    ServiceGroupId: detail.ServiceGroupId,
                                    ServiceCategoryId: detail.ServiceCategoryId,
                                    ServiceItemId: detail.ServiceId,
                                    ServiceItemName: detail.ServiceName,
                                    Quantity: detail.Quantity,
                                    Rate: detail.Rate,
                                    Amount: detail.Amount,
                                    TotalAmount: detail.GrossAmount,
                                    ActiveStatusId: 2,
                                    Status: 1
                                };
                                if (encexclusionid > 0) {
                                    pacData.Id = encexclusionid;
                                }
                                PackageDetailExclusion.push(pacData);
                                await patientbillpackageexclusionbo
                                    .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, EnIPPD, PackageDetailExclusion);
                            } else if (detail.IsInclusionItem) {
                                let pacData: any = {
                                    Id: 0,
                                    EncounterIPPackageDetailId: EnIPPD,
                                    PatientBillDetailId: detail.Id,
                                    IPPackageId: EncounterIPPackage.IPPackageId,
                                    EncounterIPPackageId: EncIPPackageId,
                                    PackageName: EncounterIPPackage.IPPackageName,
                                    ServiceGroupId: detail.ServiceGroupId,
                                    ServiceCategoryId: detail.ServiceCategoryId,
                                    ServiceItemId: detail.ServiceId,
                                    ServiceItemName: detail.ServiceName,
                                    Quantity: detail.Quantity,
                                    Rate: detail.Rate,
                                    Amount: detail.Amount,
                                    TotalAmount: detail.GrossAmount,
                                    ActiveStatusId: 2,
                                    Status: 1
                                };
                                if (encinclusionid > 0) {
                                    pacData.Id = encinclusionid;
                                }
                                PackageDetailInclusion.push(pacData);
                                await patientbillpackageinclusionbo
                                    .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, EnIPPD, PackageDetailInclusion);
                            }
                            break;
                        }
                    }
                    if (IsDataUpdated === 0) {
                        let pacDetailData: any = {
                            Data: {
                                Id: 0,
                                EncounterIPPackageId: EncIPPackageId,
                                IPPackageDetailId: 0,
                                ServiceCategoryId: detail.ServiceCategoryId,
                                PackageAmount: 0.0,
                                ActiveStatusId: 2,
                                Status: 1,
                            }
                        };
                        // PackageDetails.Push(pacDetailData);
                        let detailDataId = await encounterippackagedetailbo
                            .AddEncounterIPPackageDetail(pacDetailData);
                        console.log('*******detailDataId********', detailDataId);
                        let PackageDetailsId = detailDataId;
                        if (detail.IsExclusionItem) {
                            let pacData: any = {
                                Id: 0,
                                EncounterIPPackageDetailId: PackageDetailsId,
                                PatientBillDetailId: detail.Id,
                                IPPackageId: EncounterIPPackage.IPPackageId,
                                EncounterIPPackageId: EncIPPackageId,
                                PackageName: EncounterIPPackage.IPPackageName,
                                ServiceGroupId: detail.ServiceGroupId,
                                ServiceCategoryId: detail.ServiceCategoryId,
                                ServiceItemId: detail.ServiceId,
                                ServiceItemName: detail.ServiceName,
                                Quantity: detail.Quantity,
                                Rate: detail.Rate,
                                Amount: detail.Amount,
                                TotalAmount: detail.GrossAmount,
                                ActiveStatusId: 2,
                                Status: 1
                            };
                            PackageDetailExclusion1.push(pacData);
                            console.log('*******PackageDetailExclusion1********', PackageDetailExclusion1);
                            await patientbillpackageexclusionbo
                                .ManageEncounterIPPackageServiceExclusions(EncIPPackageId, PackageDetailsId, PackageDetailExclusion1);
                        } else if (detail.IsInclusionItem) {
                            let pacData: any = {
                                Id: 0,
                                EncounterIPPackageDetailId: PackageDetailsId,
                                PatientBillDetailId: detail.Id,
                                IPPackageId: EncounterIPPackage.IPPackageId,
                                EncounterIPPackageId: EncIPPackageId,
                                PackageName: EncounterIPPackage.IPPackageName,
                                ServiceGroupId: detail.ServiceGroupId,
                                ServiceCategoryId: detail.ServiceCategoryId,
                                ServiceItemId: detail.ServiceId,
                                ServiceItemName: detail.ServiceName,
                                Quantity: detail.Quantity,
                                Rate: detail.Rate,
                                Amount: detail.Amount,
                                TotalAmount: detail.GrossAmount,
                                ActiveStatusId: 2,
                                Status: 1
                            };
                            PackageDetailInclusion1.push(pacData);
                            await patientbillpackageinclusionbo
                                .ManageEncounterIPPackageServiceInclusions(EncIPPackageId, PackageDetailsId, PackageDetailInclusion1);

                        }
                    }
                }
            })(DetailItem);
        }));
        let BillIds: Array<any> = [];
        let BillMap: any = {};
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = BillMap[detail.PatientBillId];
                if (!Bill) {
                    BillIds.push(detail.PatientBillId);
                    Bill = {
                        Id: detail.PatientBillId,
                    };
                    BillMap[detail.PatientBillId] = Bill;
                }
            })(DetailItem);
        }));

        await Promise.all(BillIds.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = await BillBo.GetPatientBillsById({ Id: detail });
                let BillDetailApiReq = {
                    Id: 0,
                    PageContext: {
                        PageSize: 10000,
                        PageNumber: 1
                    },
                    Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: Bill.Id }]
                };
                // let BillDetails = await this.GetPatientBillDetails(BillDetailApiReq);
                let BillDetails = await this.GetMinPatientBillDetails(BillDetailApiReq);
                let BillAmount: number = 0;
                let BillDiscount: number = 0;
                let BillGstAmount: number = 0;
                let CancelledCount: number = 0;
                await Promise.all(BillDetails.Data.map((BillDetailItem): Promise<void> => {
                    return (async (BillDetail): Promise<void> => {
                        if (BillDetail.PatientBillStatusId !== 2) {
                            BillAmount += BillDetail.Amount;
                            BillDiscount += BillDetail.DiscountAmount;
                            BillGstAmount += BillDetail.GSTAmount || 0;
                        } else if (BillDetail.PatientBillStatusId === 2) {
                            CancelledCount++;
                        }
                    })(BillDetailItem);
                }));
                if (BillDetails.Data.length === CancelledCount) {
                    Bill.PatientBillStatusId = 2;
                    Bill.CancelledBy = BillDetails.Data[0].CancelledBy;
                } else {
                    Bill.BillAmount = BillAmount;
                    Bill.BillDiscount = BillDiscount;
                    Bill.GSTAmount = BillGstAmount;
                    Bill.PatientBillStatusId = 3;
                }
                await BillBo.Update(Bill);
            })(DetailItem);
        }));

        //Update Summary
        //let IsPatientTransfer = false;
        //IsPatientTransfer = req.Data.Header.IsPatientTransfer;
        // let billSummBo = BoFactory.GetBo(billingBO.PatientBillSummaryBo, this.Request);
        // await billSummBo.ManagePatBillSummary(false, EncounterId, details);

        // if (EncounterId && EncounterId > 0) {
        //     await BillBo.PopulateInpatientBills({ Id: EncounterId });
        //     // await BillBo.PopulateUpdateBills({ Id: EncounterId }, details);
        // }

        return true;
    }

    public async UpdateDoctorShareDetails(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        let EncounterId = null;
        let PatientBillId = null;
        // let BillBo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                EncounterId = detail.EncounterId;
                PatientBillId = detail.PatientBillId;
                let PatientBillDetailId = detail.Id;
                if (detail.Status === 2 && detail.Id !== 0) {
                    //await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    //await this.Save(detail);
                } else if (detail.Id > 0) {
                    // console.log('*****detail*****',detail);
                    // await this.Update(detail);
                    //Doctor Share Update
                    let renewUpdate: any = {
                        Id: detail.Id,
                        DoctorShare: detail.DoctorShare
                    };
                    await this.Update(renewUpdate);

                    let docShareBO = BoFactory.GetBo(BillingBo.PatientDoctorShareDetailsBo, this.Request);
                    let billdetail: any = {};
                    billdetail = detail;
                    if (billdetail.DocShareDetails && billdetail.DocShareDetails.length > 0) {
                        let docDetail: any = [];
                        for (let pdx in billdetail.DocShareDetails) {
                            let docShareDetail = billdetail.DocShareDetails[pdx];
                            if (docShareDetail.PerformDoctorId > 0) {

                                // console.log('*********billdetail2**********', billdetail);
                                console.log(docShareDetail.Id);
                                if (docShareDetail.Id === 0) {
                                    let docData: any = {
                                        Id: 0,
                                        PatientBillId: billdetail.PatientBillId,
                                        ParentBillId: billdetail.ParentBillId,
                                        PatientBillDetailId: detail.Id,
                                        FacilityId: this.Session.FacilityId,
                                        BillDateTime: billdetail.BillDateTime,
                                        ServiceItemId: detail.ServiceId,
                                        TeamId: docShareDetail.TeamId,
                                        ServiceCode: detail.ServiceCode,
                                        ServiceName: detail.ServiceName,
                                        ServiceAmount: billdetail.NetAmount,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        EncounterId: detail.EncounterId,
                                        EncounterTypeId: 2,
                                        IsInvoicedDoctorShare: false,
                                        ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    docDetail.push(docData);
                                } else {
                                    let docData: any = {
                                        Id: docShareDetail.Id,
                                        DoctorId: docShareDetail.PerformDoctorId,
                                        DoctorName: docShareDetail.PerformDoctorName,
                                        DoctorSharePercentage: docShareDetail.PerformDrShareValue,
                                        DoctorShareAmount: docShareDetail.PerformDrShare,
                                        ParentBillId: billdetail.ParentBillId,
                                        Status: docShareDetail.Status,
                                        //PatientTypeId: docShareDetail.PatientTypeId,
                                        //EncounterId: docShareDetail.EncounterId,
                                        // EncounterId: detail.EncounterId,
                                        // EncounterTypeId: detail.EncounterTypeId,
                                        // IsInvoicedDoctorShare: false,
                                        // ShareType: 2,
                                        DoctorShareStatusId: 1
                                    };
                                    console.log(docData);
                                    docDetail.push(docData);
                                }
                            }
                            //  console.log('*********docDetail2**********',docDetail);
                        }
                        await docShareBO.ManagePatientDoctorShareDetails(PatientBillId, PatientBillDetailId, docDetail);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async UpdateInsuranceBillModifed(details: PatientBillDetailsAttributes[]): Promise<Boolean> {
        let Final_PatientBillId = null;
        let DOA = null;
        let DOD = null;
        let GuarantorId = 0;
        let GuarantorTypeId = 0;
        let ReducedTotalAmt = 0;
        let TotBillAmt = 0;
        let TotGstAmt = 0;
        let TotInGstAmt = 0;
        let TotCGstAmt = 0;
        let TotSGstAmt = 0;
        let TotBillDiscAmt = 0;
        let DiscModeId: number = 0;
        details = details || [];
        await Promise.all(details.map((DetailItem: any): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                Final_PatientBillId = detail.Final_PatientBillId;
                DOA = detail.DOA;
                DOD = detail.DOD;
                GuarantorId = detail.GuarantorId;
                GuarantorTypeId = detail.GuarantorTypeId;
                ReducedTotalAmt = detail.ReducedTotalAmt;
                TotBillAmt = detail.TotBillAmt;
                TotGstAmt = detail.TotGstAmount;
                TotInGstAmt = detail.TotInGstAmount;
                TotCGstAmt = detail.TotCGstAmount;
                TotSGstAmt = detail.TotSGstAmount;
                TotBillDiscAmt = detail.TotBillDiscAmt;
                DiscModeId = detail.BillDiscountModeId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));

        if (Final_PatientBillId) {
            let PaymentdetailBO = BoFactory.GetBo(BillingBo.PatientPaymentDetailsBo, this.Request);
            let PaymentBillReq = {
                Id: 0,
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                },
                Params: [
                    { Key: PatientPaymentDetailsFilters.PatientBillId, Value: Final_PatientBillId }
                ]
            };
            let paymentdate: any = await PaymentdetailBO.GetPatientPaymentDetails(PaymentBillReq);
            if (paymentdate.Data) {
                if (paymentdate.Data.length > 0) {
                    for (let idx in paymentdate.Data) {
                        if (ReducedTotalAmt > 0) {
                            if (paymentdate.Data[idx].ReceiptStatusId === 1) {
                                if (paymentdate.Data[idx].AmountPaid >= ReducedTotalAmt) {
                                    if (paymentdate.Data[idx].ReceiptTypeId === 2 || paymentdate.Data[idx].ReceiptTypeId === 3) {
                                        paymentdate.Data[idx].BillAmount = TotBillAmt;
                                        paymentdate.Data[idx].AmountPaid = paymentdate.Data[idx].AmountPaid - ReducedTotalAmt;
                                        paymentdate.Data[idx].GuarantorId = GuarantorId;
                                        paymentdate.Data[idx].GuarantorTypeId = GuarantorTypeId;
                                        paymentdate.Data[idx].DOA = DOA;
                                        paymentdate.Data[idx].DOD = DOD;
                                        paymentdate.Data[idx].TotBillAmt = TotBillAmt;
                                        paymentdate.Data[idx].TotBillDiscAmt = TotBillDiscAmt;
                                        paymentdate.Data[idx].TotGstAmt = TotGstAmt;
                                        paymentdate.Data[idx].TotInGstAmt = TotInGstAmt;
                                        paymentdate.Data[idx].TotCGstAmt = TotCGstAmt;
                                        paymentdate.Data[idx].TotSGstAmt = TotSGstAmt;
                                        paymentdate.Data[idx].DiscModeId = DiscModeId;
                                    }
                                    ReducedTotalAmt = 0;
                                } else {
                                    if (paymentdate.Data[idx].ReceiptTypeId === 2 || paymentdate.Data[idx].ReceiptTypeId === 3) {
                                        paymentdate.Data[idx].BillAmount = TotBillAmt;
                                        paymentdate.Data[idx].AmountPaid = 0;
                                        paymentdate.Data[idx].GuarantorId = GuarantorId;
                                        paymentdate.Data[idx].GuarantorTypeId = GuarantorTypeId;
                                        paymentdate.Data[idx].DOA = DOA;
                                        paymentdate.Data[idx].DOD = DOD;
                                        paymentdate.Data[idx].TotBillAmt = TotBillAmt;
                                        paymentdate.Data[idx].TotBillDiscAmt = TotBillDiscAmt;
                                        ReducedTotalAmt = ReducedTotalAmt - paymentdate.Data[idx].AmountPaid;
                                        paymentdate.Data[idx].TotGstAmt = TotGstAmt;
                                        paymentdate.Data[idx].TotInGstAmt = TotInGstAmt;
                                        paymentdate.Data[idx].TotCGstAmt = TotCGstAmt;
                                        paymentdate.Data[idx].TotSGstAmt = TotSGstAmt;
                                        paymentdate.Data[idx].DiscModeId = DiscModeId;
                                    }
                                }
                            }
                        } else if (ReducedTotalAmt < 0) {
                            if (paymentdate.Data[idx].ReceiptStatusId === 1) {
                                if (paymentdate.Data[idx].ReceiptTypeId === 2 || paymentdate.Data[idx].ReceiptTypeId === 3) {
                                    paymentdate.Data[idx].BillAmount = TotBillAmt;
                                    paymentdate.Data[idx].AmountPaid = paymentdate.Data[idx].AmountPaid - ReducedTotalAmt;
                                    paymentdate.Data[idx].GuarantorId = GuarantorId;
                                    paymentdate.Data[idx].GuarantorTypeId = GuarantorTypeId;
                                    paymentdate.Data[idx].DOA = DOA;
                                    paymentdate.Data[idx].DOD = DOD;
                                    paymentdate.Data[idx].TotBillAmt = TotBillAmt;
                                    paymentdate.Data[idx].TotBillDiscAmt = TotBillDiscAmt;
                                    paymentdate.Data[idx].TotGstAmt = TotGstAmt;
                                    paymentdate.Data[idx].TotInGstAmt = TotInGstAmt;
                                    paymentdate.Data[idx].TotCGstAmt = TotCGstAmt;
                                    paymentdate.Data[idx].TotSGstAmt = TotSGstAmt;
                                    paymentdate.Data[idx].DiscModeId = DiscModeId;
                                }
                            }
                        }
                    }
                    await PaymentdetailBO.ModifyPatientPaymentDetails(paymentdate);
                }
            }
        }

        return true;
    }

    public async UpdateSimpleViewBill(BillData: BaseRequest): Promise<Boolean> {
        let EncounterId = null;
        let BillBo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let details: Array<any> = BillData.Data.BillDetails || [];
        let newPatientBillDetails: Array<any> = [];
        let BillingAmount: number = 0;
        details.forEach((val, idx) => {
            if (val.PatientBillId === 0) {
                newPatientBillDetails.push(val);
                BillingAmount += parseFloat(val.Amount);
                details.splice(idx, 1);
            }
        });

        if (newPatientBillDetails.length > 0) {
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encounterData = await encounterBo.GetEncounterById({ Id: BillData.Data.EncounterId });
            let PatientBill: any = {
                Data: {
                    Header: {
                        BillTypeId: 3,
                        BillDateTime: new Date(),
                        BillAmount: BillingAmount,
                        PatientId: encounterData.PatientId,
                        EncounterId: encounterData.Id,
                        EncounterTypeId: 2, //In Patient Encounter
                        GuarantorId: encounterData.GuarantorId,
                        GuarantorTypeId: encounterData.GuarantorTypeId,
                        ServiceRateCategoryId: encounterData.ServiceRateCategoryId,
                        DoctorId: encounterData.DoctorId,
                        PatientBillStatusId: 3,
                        FacilityId: encounterData.FacilityId,
                        DepartmentId: encounterData.DepartmentId,
                        OrganizationId: encounterData.OrganizationId
                    },
                    paymentDetail: [],
                    Details: newPatientBillDetails
                }
            };
            await BillBo.AddPatientBills(PatientBill);
        }

        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                EncounterId = detail.EncounterId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        let BillIds: Array<any> = [];
        let BillMap: any = {};
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let Bill = BillMap[detail.PatientBillId];
                if (!Bill) {
                    BillIds.push(detail.PatientBillId);
                    Bill = {
                        Id: detail.PatientBillId,
                    };
                    BillMap[detail.PatientBillId] = Bill;
                }
            })(DetailItem);
        }));

        await Promise.all(BillIds.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (detail > 0) {
                    let Bill = await BillBo.GetPatientBillsById({ Id: detail });
                    let BillDetailApiReq = {
                        Id: 0,
                        PageContext: {
                            PageSize: 10000,
                            PageNumber: 1
                        },
                        Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: Bill.Id }]
                    };
                    let BillDetails = await this.GetPatientBillDetails(BillDetailApiReq);
                    let BillAmount: number = 0;
                    let BillDiscount: number = 0;
                    let CancelledCount: number = 0;
                    await Promise.all(BillDetails.Data.map((BillDetailItem): Promise<void> => {
                        return (async (BillDetail): Promise<void> => {
                            if (BillDetail.PatientBillStatusId !== 2) {
                                BillAmount += BillDetail.Amount;
                                BillDiscount += BillDetail.DiscountAmount;
                            } else if (BillDetail.PatientBillStatusId === 2) {
                                CancelledCount++;
                            }
                        })(BillDetailItem);
                    }));
                    if (BillDetails.Data.length === CancelledCount) {
                        Bill.PatientBillStatusId = 2;
                        Bill.CancelledBy = BillData.Data.EncounterId;
                    } else {
                        Bill.BillAmount = BillAmount;
                        Bill.BillDiscount = BillDiscount;
                        Bill.PatientBillStatusId = 3;
                    }
                    await BillBo.Update(Bill);
                }
            })(DetailItem);
        }));

        if (EncounterId && EncounterId > 0) {
            await BillBo.PopulateInpatientBills({ Id: EncounterId });
        }
        return true;
    }

    public async GetDailySalesSummarybyItem(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(BillingBo.PatientReturnDetailsBo, this.Request);
        result.push({ Key: 1, Value: await this.SaleSummary(req) });
        result.push({ Key: 2, Value: await returnBO.ReturnSummary(req) });
        return result;
    }

    public async SaleSummary(req: BaseRequest): Promise<any> {
        let ItemGroup: { [id: number]: any[] } = {};
        let ItemGroupJoin: any = {
            model: this.Models.ItemMaster,
            attributes: ['ItemCode', 'ItemName'],
            required: true,
        };
        if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId > 0) {
            let saleitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rate',
                    'Ucp', 'GrossAmount', 'DiscountAmount', 'NetAmount', 'ProportionateDiscount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: true,
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (saleitemInstance) {
                let groupbills = _.groupBy(saleitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let Quantity: number = 0;
                    let Mrp: number = 0;
                    let Ucp: number = 0;
                    let AvgMrp: number = 0;
                    let AvgUcp: number = 0;
                    let SaleAmount: number = 0;
                    let Discount: number = 0;
                    let TotalSales: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        Quantity += bills.Quantity;
                        Mrp += bills.Rate;
                        Ucp += bills.Ucp;
                        AvgMrp = Mrp / groupedBills.length;
                        AvgUcp = Ucp / groupedBills.length;
                        SaleAmount += bills.GrossAmount;
                        Discount += bills.ProportionateDiscount;
                        TotalSales += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'Quantity': Quantity,
                        'Mrp': Mrp,
                        'Ucp': Ucp,
                        'AvgMrp': AvgMrp,
                        'AvgUcp': AvgUcp,
                        'SaleAmount': SaleAmount,
                        'Discount': Discount,
                        'TotalSales': TotalSales,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId > 0) {
            let saleitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rate',
                    'Ucp', 'GrossAmount', 'DiscountAmount', 'NetAmount', 'ProportionateDiscount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: true,
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (saleitemInstance) {
                let groupbills = _.groupBy(saleitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let Quantity: number = 0;
                    let Mrp: number = 0;
                    let Ucp: number = 0;
                    let AvgMrp: number = 0;
                    let AvgUcp: number = 0;
                    let SaleAmount: number = 0;
                    let Discount: number = 0;
                    let TotalSales: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        Quantity += bills.Quantity;
                        Mrp += bills.Rate;
                        Ucp += bills.Ucp;
                        AvgMrp = Mrp / groupedBills.length;
                        AvgUcp = Ucp / groupedBills.length;
                        SaleAmount += bills.GrossAmount;
                        Discount += bills.ProportionateDiscount;
                        TotalSales += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'Quantity': Quantity,
                        'Mrp': Mrp,
                        'Ucp': Ucp,
                        'AvgMrp': AvgMrp,
                        'AvgUcp': AvgUcp,
                        'SaleAmount': SaleAmount,
                        'Discount': Discount,
                        'TotalSales': TotalSales,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId === 0) {
            let saleitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rate',
                    'Ucp', 'GrossAmount', 'DiscountAmount', 'NetAmount', 'ProportionateDiscount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: true,
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (saleitemInstance) {
                let groupbills = _.groupBy(saleitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let Quantity: number = 0;
                    let Mrp: number = 0;
                    let Ucp: number = 0;
                    let AvgMrp: number = 0;
                    let AvgUcp: number = 0;
                    let SaleAmount: number = 0;
                    let Discount: number = 0;
                    let TotalSales: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        Quantity += bills.Quantity;
                        Mrp += bills.Rate;
                        Ucp += bills.Ucp;
                        AvgMrp = Mrp / groupedBills.length;
                        AvgUcp = Ucp / groupedBills.length;
                        SaleAmount += bills.GrossAmount;
                        Discount += bills.ProportionateDiscount;
                        TotalSales += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'Quantity': Quantity,
                        'Mrp': Mrp,
                        'Ucp': Ucp,
                        'AvgMrp': AvgMrp,
                        'AvgUcp': AvgUcp,
                        'SaleAmount': SaleAmount,
                        'Discount': Discount,
                        'TotalSales': TotalSales,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId === 0) {
            let saleitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rate',
                    'Ucp', 'GrossAmount', 'DiscountAmount', 'NetAmount', 'ProportionateDiscount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: true,
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (saleitemInstance) {
                let groupbills = _.groupBy(saleitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let Quantity: number = 0;
                    let Mrp: number = 0;
                    let Ucp: number = 0;
                    let AvgMrp: number = 0;
                    let AvgUcp: number = 0;
                    let SaleAmount: number = 0;
                    let Discount: number = 0;
                    let TotalSales: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        Quantity += bills.Quantity;
                        Mrp += bills.Rate;
                        Ucp += bills.Ucp;
                        AvgMrp = Mrp / groupedBills.length;
                        AvgUcp = Ucp / groupedBills.length;
                        SaleAmount += bills.GrossAmount;
                        Discount += bills.ProportionateDiscount;
                        TotalSales += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'Quantity': Quantity,
                        'Mrp': Mrp,
                        'Ucp': Ucp,
                        'AvgMrp': AvgMrp,
                        'AvgUcp': AvgUcp,
                        'SaleAmount': SaleAmount,
                        'Discount': Discount,
                        'TotalSales': TotalSales,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        }
        return ItemGroup;
    }

    public async GetConsolidateSaleGst(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(BillingBo.PatientReturnDetailsBo, this.Request);
        result.push({ Key: 1, Value: await this.SaleGSTDetails(req) });
        result.push({ Key: 2, Value: await returnBO.SaleReturnGSTDetails(req) });
        return result;
    }
    public async SaleGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster,
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount',
                    'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '0.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 1 },
                    GSTPercentage: { '$eq': '0.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 11 },
                    GSTPercentage: { '$eq': '5.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '5.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '12.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 7 },
                    GSTPercentage: { '$eq': '12.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 8 },
                    GSTPercentage: { '$eq': '18.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 8 },
                    GSTPercentage: { '$eq': '18.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 12 },
                    GSTPercentage: { '$eq': '28.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    // GSTId: { '$eq': 12 },
                    GSTPercentage: { '$eq': '28.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'BillDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = bills.BillDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        return GSTGroup;
    }
    public async GetOverallConsolidateGst(req: BaseRequest): Promise<any> {
        let result: any = [];
        let grnBO = BoFactory.GetBo(invBo.GrnDetailBo, this.Request);
        result.push({ Key: 1, Value: await this.GetConsolidateOutputGst(req) });
        result.push({ Key: 2, Value: await grnBO.GetConsolidateInputGstSummary(req) });
        return result;
    }
    public async GetConsolidateOutputGst(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(BillingBo.PatientReturnDetailsBo, this.Request);
        result.push({ Key: 1, Value: await this.ConsolidatedSaleGSTDetails(req) });
        result.push({ Key: 2, Value: await returnBO.ConsolidatedSaleReturnGSTDetails(req) });
        return result;
    }
    public async ConsolidatedSaleGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster,
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '0.000000' },
                    // GSTId: { '$eq': 1 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '0.000000' },
                    // GSTId: { '$eq': 1 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '5.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '5.000000' },
                    // GSTId: { '$eq': 11 },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '12.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '12.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    // where: {
                    //     // BillTypeId: { '$in': [3, 4, 6] },
                    //     IsPharmacyBill: true,
                    //     FacilityId: req.Data.FacilityId,
                    // },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '18.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        // BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '18.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        // BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '28.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        // BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'BillDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    PatientBillStatusId: 3,
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GSTPercentage: { '$eq': '28.000000' },
                    IsPharmacySale: { '$gt': 0 },
                    PharmacySaleTypeId: { '$in': [1, 4, 5] },
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        // BillTypeId: { '$in': [3, 4, 6] },
                        IsPharmacyBill: true,
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        return GSTGroup;
    }
    public async GetRevenueServiceItemSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPServiceItemRevenue(req) });
        result.push({ Key: 2, Value: await this.IPServiceItemRevenue(req) });
        result.push({ Key: 3, Value: await this.TotalServiceItemRevenue(req) });
        return result;
    }
    public async OPServiceItemRevenue(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceGroupJoin: any = {
            model: this.Models.ServiceItem,
            attributes: ['Name'],
            include: [
                { model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false }
            ],
            required: true,
        };
        if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId > -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId > -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId }

                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId === -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }

                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId === -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }

                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        }
        return ServiceGroup;
    }
    public async IPServiceItemRevenue(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceGroupJoin: any = {
            model: this.Models.ServiceItem,
            attributes: ['Name'],
            include: [
                { model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false }
            ],
            required: true,
        };
        if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId > -1) {
            let iprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId },
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (iprevamtInstance) {
                let groupbills = _.groupBy(iprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId > -1) {
            let iprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (iprevamtInstance) {
                let groupbills = _.groupBy(iprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId === -1) {
            let iprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (iprevamtInstance) {
                let groupbills = _.groupBy(iprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId === -1) {
            let iprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (iprevamtInstance) {
                let groupbills = _.groupBy(iprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        }
        return ServiceGroup;
    }
    public async TotalServiceItemRevenue(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceGroupJoin: any = {
            model: this.Models.ServiceItem,
            attributes: ['Name'],
            include: [
                { model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false }
            ],
            required: true,
        };
        if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId > -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 3, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId > -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 3, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId > 0 && req.Data.ServiceCategoryId === -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$eq': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 3, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        } else if (req.Data.ServiceId === 0 && req.Data.ServiceCategoryId === -1) {
            let oprevamtInstance: any = await this.FindAll({
                attributes: ['ServiceId', 'ServiceCategoryId', 'ServiceName', 'NetAmount'],
                where: {
                    BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                    IsPharmacySale: 0,
                    ServiceId: { '$gt': req.Data.ServiceId },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId }
                },
                include: [ServiceGroupJoin, {
                    model: this.Models.PatientBills,
                    attributes: ['Id'],
                    where: {
                        BillTypeId: { '$in': [1, 3, 5] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (oprevamtInstance) {
                let groupbills = _.groupBy(oprevamtInstance, 'ServiceId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ServiceId: number = 0;
                    let ServiceName: string = '';
                    let CategoryName: string = '';
                    let ServiceCount: number = 0;
                    let NetAmount: number = 0;
                    ServiceCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ServiceId = bills.ServiceId;
                        ServiceName = bills.ServiceName;
                        CategoryName = bills.ServiceItem.ServiceCategory.ServiceCategoryName;
                        NetAmount += bills.NetAmount;
                        ServiceGroup[ServiceId] = ServiceGroup[ServiceId] || [];
                    }
                    let info = {
                        'ServiceId': ServiceId,
                        'ServiceName': ServiceName,
                        'ServiceCount': ServiceCount,
                        'NetAmount': NetAmount,
                        'ServiceCategoryName': CategoryName
                    };
                    ServiceGroup[ServiceId].push(info);
                }
            }
        }
        return ServiceGroup;
    }

    public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<any[]>> {
        // let data = await this.GetPatientBillDetails(apiReq);
        let data = await this.GetMinPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let PreviousOrderDetails: any = [];
        let OrderBo = BoFactory.GetBo(orderBo.PatientOrderBo, this.Request);
        await Promise.all(PatientBillDetails.map((BillDetailItem): Promise<void> => {
            return (async (BillDetail: any): Promise<void> => {
                var item = BillDetail;
                try {
                    if (BillDetail.PatientBill.BillTypeId !== 4) {
                        item.OrderNumber = '';
                        if (!BillDetail.IsPharmacySale && !BillDetail.IsPharmacyReturn && BillDetail.MasterTypeId > 0
                            && BillDetail.PatientBill && BillDetail.PatientBill.PatientOrderId) {
                            let OrderApiReq = {
                                Id: 0,
                                PageContext: {
                                    PageSize: 10000,
                                    PageNumber: 1
                                },
                                Params: [{ Key: PatientOrderFilters.Id, Value: BillDetail.PatientBill.PatientOrderId }]
                            };
                            let OrderDetails: any = await OrderBo.GetPatientOrdersforPreviousOrder(OrderApiReq);
                            if (OrderDetails.length > 0) {
                                item.OrderNumber = OrderDetails.Data[0].OrderNumber;
                                item.OrderStatus = OrderDetails.Data[0].OrderStatus.DisplayName;
                            }
                        }
                        PreviousOrderDetails.push(item);
                    }
                } catch (ex) {
                    console.log(ex);
                }
            })(BillDetailItem);
        }));
        return PreviousOrderDetails;
    }

    // public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
    //     Promise<ApiResponse<any[]>> {
    //     // let data = await this.GetPatientBillDetails(apiReq);
    //     let data = await this.GetMinPatientBillDetails(apiReq);
    //     let PatientBillDetails = data.Data;
    //     let PreviousOrderDetails: any = [];
    //     // let OrderBo = BoFactory.GetBo(orderBo.PatientOrderBo, this.Request);
    //     await Promise.all(PatientBillDetails.map((BillDetailItem): Promise<void> => {
    //         return (async (BillDetail: any): Promise<void> => {
    //             var item = BillDetail;
    //             if (BillDetail.PatientBill.BillTypeId !== 4) {
    //                 item.OrderNumber = '';
    //                 if (!BillDetail.IsPharmacySale && !BillDetail.IsPharmacyReturn && BillDetail.MasterTypeId > 0
    //                     && BillDetail.PatientBill && BillDetail.PatientBill.PatientOrderId) {
    //                     // let OrderApiReq = {
    //                     //     Id: 0,
    //                     //     PageContext: {
    //                     //         PageSize: 10000,
    //                     //         PageNumber: 1
    //                     //     },
    //                     //     Params: [{ Key: PatientOrderFilters.Id, Value: BillDetail.PatientBill.PatientOrderId }]
    //                     // };
    //                     // let OrderDetails: any = await OrderBo.GetPatientOrdersforPreviousOrder(OrderApiReq);
    //                     // if (OrderDetails.length > 0) {
    //                     //     item.OrderNumber = OrderDetails.Data[0].OrderNumber;
    //                     //     item.OrderStatus = OrderDetails.Data[0].OrderStatus.DisplayName;
    //                     // }
    //                     item.OrderNumber = BillDetail.PatientBill.PatientOrder.OrderNumber;
    //                     item.OrderStatus = BillDetail.PatientBill.PatientOrder.OrderStatus.DisplayName;
    //                 }
    //                 PreviousOrderDetails.push(item);
    //             }
    //         })(BillDetailItem);
    //     }));
    //     return PreviousOrderDetails;
    // }

    public async PrintPatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonmedical) ? req.Data.nonmedical : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.patientBill) ? req.Data.insuranceBill : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientBillDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillDetailsFilters.IsTempIPBill, Value: req.Data.IsTempIPBill }]
        };
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let ServiceName: string = req.Data.ServiceName;
        let GrossAmount: number = 0;
        let DiscountAmount: number = 0;
        let NetAmount: number = 0;
        for (var idx in PatientBillDetails) {
            var item = PatientBillDetails[idx];
            GrossAmount += item.GrossAmount;
            DiscountAmount += item.DiscountAmount;
            NetAmount += item.GrossAmount - item.DiscountAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Encounter: Encounter,
            ServiceName: ServiceName,
            GrossAmount: GrossAmount,
            DiscountAmount: DiscountAmount,
            NetAmount: NetAmount,
            Preferences: printPreferencesData,
            Flags: flags
        };
        let key = 'breakup';
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
    // return await Report.Generate('breakup', { header: {}, body: info });
    // }
    public async ExcelPatientBillDetails(req: BaseRequest): Promise<any> {
        let BillDetails: any;
        let DetReq = {
            Id: 0,
            PageContext: { PageSize: 500000, PageNumber: 1 },
            Params: [
                { Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: PatientBillDetailsFilters.FromDate, Value: req.Data.FromDate },
                { Key: PatientBillDetailsFilters.ToDate, Value: req.Data.ToDate },
                { Key: PatientBillDetailsFilters.PatientBillStatusId, Value: 3 },
            ]
        };
        if (req.Data.IsPharmacyCredit === 0) {
            DetReq.Params.push({ Key: PatientBillDetailsFilters.IsPharmacyCredit, Value: 0 });
            DetReq.Params.push({ Key: PatientBillDetailsFilters.IsPharmacySale, Value: false });
        } else {
            DetReq.Params.push({ Key: PatientBillDetailsFilters.IsPharmacyCredit, Value: 1 });
        }
        BillDetails = await this.GetPatientInsuranceBillDetails(DetReq);
        let data = BillDetails;
        let PatientBillDetails = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Data.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let GrossAmount: number = 0;
        let DiscountAmount: number = 0;
        let NetAmount: number = 0;
        for (var idx in PatientBillDetails) {
            var item = PatientBillDetails[idx];
            GrossAmount += item.GrossAmount;
            DiscountAmount += item.DiscountAmount;
            NetAmount += item.GrossAmount - item.DiscountAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            GrossAmount: GrossAmount,
            DiscountAmount: DiscountAmount,
            NetAmount: NetAmount,
            Preferences: printPreferencesData
        };

        let key = 'breakupxl';
        let pdfOption: any = null;
        return await Report.GenerateHtml(key, { header: {}, body: info }, null, pdfOption);
    }
    // return await Report.Generate('breakup', { header: {}, body: info });
    // }
    public async PrintLabsummaryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PatientBillDetailsData = data.Data[0];
        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName
        };
        let pdfOption: any = null;
        let key = 'labsummaryreport';
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
    public async PrintPharmacyScheduleReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let DataapiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: apiReq.Params
        };
        let data = await this.GetPatientBillDetails(DataapiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let ItemName = apiReq.Data.ItemName;

        let StoreName = apiReq.Data.StoreName;
        let ScheduleType = apiReq.Data.ScheduleType;
        let PatientBillDetailsData = data.Data[0];
        let PharmacyScheduleReport: any = [];


        PatientBillDetails.forEach((Detail: any) => {
            let BillData = Detail;
            BillData.PatientInfo = '';
            if (Detail.PatientBill.Patient) {
                if (Detail.PatientBill.Patient.Title)
                    BillData.PatientInfo = Detail.PatientBill.Patient.Title.Description;
                if (Detail.PatientBill.Patient.FirstName)
                    BillData.PatientInfo += ' ' + Detail.PatientBill.Patient.FirstName;
                if (Detail.PatientBill.Patient.LastName)
                    BillData.PatientInfo += ' ' + Detail.PatientBill.Patient.LastName;
                if (Detail.PatientBill.Patient.MRN)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.MRN;
                if (Detail.PatientBill.Patient.Age)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.Age;
                if (Detail.PatientBill.Patient.Gender)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.Gender.Description;
            } else if (!Detail.PatientBill.Patient) {
                BillData.PatientInfo = Detail.PatientBill.PatientName
                    + '/' + Detail.PatientBill.Age;
                if (Detail.PatientBill.Gender) {
                    let Gender = Detail.PatientBill.Gender.Description;
                    BillData.PatientInfo += '/' + Gender;
                }
            }
            PharmacyScheduleReport.push(BillData);
        });

        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatBillData.FacilityId, PatBillData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientBillDetails: PatientBillDetails,
            PharmacyScheduleReport: PharmacyScheduleReport,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            ItemName: ItemName,
            StoreName: StoreName,
            ScheduleType: ScheduleType
        };
        let pdfOption: any = null;
        let key = 'pharmacyschedulereport';
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
    public async PrintDoctorRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let PatientBillDetailsData = data.Data[0];
        let TotalAmount: number = 0;
        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        for (let idx in PatientBillDetails) {
            let item = PatientBillDetails[idx];
            TotalAmount += item.Amount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            TotalAmount: TotalAmount
        };
        let pdfOption: any = null;
        let key = 'doctorrevenuereport';
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
    public async PrintItemwisesalesprofit(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetailsforStockserialItem(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let PatientBillDetailsData = data.Data[0];
        let TotalUCP: number = 0;
        let TotalMRP: number = 0;
        let TotalQty: number = 0;
        let TotalSale: number = 0;
        let TotalPurchase: number = 0;
        let TotalProfit: number = 0;
        let TotalProfitPer: number = 0;
        let TotalProfitPercent: any;
        let item: any = {};
        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        for (let idx in PatientBillDetails) {
            item = PatientBillDetails[idx];
            item.PurchaseValue = parseFloat(item.StockSerialItem.Ucp) * parseInt(item.Quantity);
            item.Profit = parseFloat(item.NetAmount) - parseFloat(item.PurchaseValue);
            item.ProfitPer = ((item.Profit * 100) / parseFloat(item.PurchaseValue)).toFixed(2);

            TotalUCP = TotalUCP + (item.StockSerialItem.Ucp);
            TotalMRP = TotalMRP + (item.Rate);
            TotalQty = TotalQty + (item.Quantity);
            TotalSale = TotalSale + (item.NetAmount);
            TotalPurchase = TotalPurchase + (item.PurchaseValue);
            TotalProfit = TotalProfit + (item.Profit);
            TotalProfitPer = (TotalProfitPer || 0) + parseFloat(item.ProfitPer);
            TotalProfitPercent = TotalProfitPer.toFixed(2);

        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            TotalUCP: TotalUCP,
            TotalMRP: TotalMRP,
            TotalQty: TotalQty,
            TotalSale: TotalSale,
            TotalPurchase: TotalPurchase,
            TotalProfit: TotalProfit,
            ProductType: ProductType,
            TotalProfitPercent: TotalProfitPercent
        };
        let pdfOption: any = null;
        let key = 'itemwisesalesprofitreport';
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
    public async PrintRevenueSummaryByServiceItem(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let ServiceName = req.Data.ServiceName;
        let ServiceCategoryName = req.Data.ServiceCategoryName;
        let ServiceItem = req.Data.ServiceItem;
        let ServiceInfo: any = [];
        let NetServiceInfo: any = [];

        let ServiceData = req;
        ServiceInfo = await this.GetRevenueServiceItemSummary(ServiceData);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceData.Data.FacilityId);

        if (ServiceInfo) {
            let opservicecollection = [];
            let ipservicecollection = [];
            let totalservicecollection = [];
            if (ServiceInfo.length > 0)
                opservicecollection = ServiceInfo[0].Value;

            if (ServiceInfo.length > 1)
                ipservicecollection = ServiceInfo[1].Value;

            if (ServiceInfo.length > 2)
                totalservicecollection = ServiceInfo[2].Value;

            for (let idx in opservicecollection) {
                let coll = opservicecollection[idx];
                let OPRevenue = 0;
                let ServiceName = '';
                let ServiceCategoryName = '';
                let Key = '';
                let OPCount = 0;
                for (let idx in coll) {
                    ServiceName = coll[idx].ServiceName;
                    ServiceCategoryName = coll[idx].ServiceCategoryName;
                    OPCount = coll[idx].ServiceCount;
                    OPRevenue = coll[idx].NetAmount;
                }
                Key = ServiceName;
                NetServiceInfo.push({
                    'Key': ServiceName,
                    'ServiceCategoryName': ServiceCategoryName,
                    'OPCount': OPCount,
                    'OPRevenue': OPRevenue,
                    'IPCount': 0,
                    'IPRevenue': 0.00,
                    'TotalCount': 0,
                    'TotalRevenue': 0.00
                });
            }
            for (let idx in ipservicecollection) {
                let coll = ipservicecollection[idx];
                let IPRevenue = 0;
                let ServiceName = '';
                let ServiceCategoryName = '';
                let Key = '';
                let IPCount = 0;
                for (let idx in coll) {
                    ServiceName = coll[idx].ServiceName;
                    ServiceCategoryName = coll[idx].ServiceCategoryName;
                    IPCount = coll[idx].ServiceCount;
                    IPRevenue = coll[idx].NetAmount;
                }
                Key = ServiceName;

                let valappended = 0;
                NetServiceInfo.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.ServiceCategoryName = ServiceCategoryName;
                        item.IPCount = IPCount;
                        item.IPRevenue = IPRevenue;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    NetServiceInfo.push({
                        'Key': ServiceName,
                        'ServiceCategoryName': ServiceCategoryName,
                        'OPCount': 0,
                        'OPRevenue': 0.00,
                        'IPCount': IPCount,
                        'IPRevenue': IPRevenue,
                        'TotalCount': 0,
                        'TotalRevenue': 0.00

                    });
            }
            for (let idx in totalservicecollection) {
                let coll = totalservicecollection[idx];
                let TotalRevenue = 0;
                let ServiceName = '';
                let ServiceCategoryName = '';
                let Key = '';
                let TotalCount = 0;
                for (let idx in coll) {
                    ServiceName = coll[idx].ServiceName;
                    ServiceCategoryName = coll[idx].ServiceCategoryName;
                    TotalCount = coll[idx].ServiceCount;
                    TotalRevenue = coll[idx].NetAmount;
                }
                Key = ServiceName;

                var valappended = 0;
                NetServiceInfo.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.ServiceCategoryName = ServiceCategoryName;
                        item.TotalCount = TotalCount;
                        item.TotalRevenue = TotalRevenue;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    NetServiceInfo.push({
                        'Key': ServiceName,
                        'ServiceCategoryName': ServiceCategoryName,
                        'OPCount': 0,
                        'OPRevenue': 0.00,
                        'IPCount': 0,
                        'IPRevenue': 0.00,
                        'TotalCount': TotalCount,
                        'TotalRevenue': TotalRevenue
                    });
            }
        }
        let TotOPCount = 0;
        let TotOPRevenue = 0;
        let TotIPCount = 0;
        let TotIPRevenue = 0;
        let NetTotCount = 0;
        let NetTotalRevenue = 0;
        for (let ix in NetServiceInfo) {
            let netsummary = NetServiceInfo[ix];
            if (netsummary.OPCount) {
                TotOPCount += netsummary.OPCount;
            }
            if (netsummary.OPRevenue) {
                TotOPRevenue += netsummary.OPRevenue;
            }
            if (netsummary.IPCount) {
                TotIPCount += netsummary.IPCount;
            }
            if (netsummary.IPRevenue) {
                TotIPRevenue += netsummary.IPRevenue;
            }
            if (netsummary.TotalCount) {
                NetTotCount += netsummary.TotalCount;
            }
            if (netsummary.TotalRevenue) {
                NetTotalRevenue += netsummary.TotalRevenue;
            }
        }
        TotOPCount = TotOPCount;
        TotOPRevenue = TotOPRevenue;
        TotIPCount = TotIPCount;
        TotIPRevenue = TotIPRevenue;
        NetTotCount = NetTotCount;
        NetTotalRevenue = NetTotalRevenue;

        let info = {
            Preferences: printPreferencesData,
            NetServiceInfo: NetServiceInfo,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            ServiceItem: ServiceItem,
            TotOPCount: TotOPCount,
            TotOPRevenue: TotOPRevenue,
            TotIPCount: TotIPCount,
            TotIPRevenue: TotIPRevenue,
            NetTotCount: NetTotCount,
            NetTotalRevenue: NetTotalRevenue,
            ServiceCategoryName: ServiceCategoryName,
            ServiceName: ServiceName
        };
        let pdfOption: any = null;
        let key = 'revenuesummarybyserviceitem';
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
    public async PrintItemCollectionSummaryReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let BillingGroup = apiReq.Data.BillingGroup;
        let DoctorName = apiReq.Data.DoctorName;
        let BillingService = apiReq.Data.BillingService;
        let PatientBillDetailsData = data.Data[0];
        let TotalAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDocshare: number = 0;
        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        for (let idx in PatientBillDetails) {
            let item = PatientBillDetails[idx];
            TotalAmount += item.GrossAmount;
            TotalDisAmount += item.DiscountAmount;
            TotalNetAmount += item.Amount;
            TotalDocshare += item.DoctorShare;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            BillingGroup: BillingGroup,
            DoctorName: DoctorName,
            TotalAmount: TotalAmount,
            BillingService: BillingService,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDocshare: TotalDocshare

        };
        let pdfOption: any = null;
        let key = 'itemwisecollectionsummaryipreport';
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
    public async PrintItemCollectionSummaryOPReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let BillingGroup = apiReq.Data.BillingGroup;
        let DoctorName = apiReq.Data.DoctorName;
        let BillingService = apiReq.Data.BillingService;
        let PatientBillDetailsData = data.Data[0];
        let TotalAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDocshare: number = 0;
        let item: any = {};

        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        for (let idx in PatientBillDetails) {
            item = PatientBillDetails[idx];
            item.DiscountAmt = 0;
            item.NetAmt = 0;
            if (item.ProportionateDiscount > 0) {
                item.DiscountAmt = item.ProportionateDiscount;
            } else if (item.DiscountAmount > 0) {
                item.DiscountAmt = item.DiscountAmount;
            }
            item.NetAmt = parseFloat(item.GrossAmount) - parseFloat(item.DiscountAmt || 0);
            TotalAmount += item.GrossAmount;
            TotalDisAmount += item.DiscountAmt;
            TotalNetAmount += item.NetAmt;
            TotalDocshare += item.DoctorShare;
        }
        // item.PaymentType = '';
        // item.CollectedBy = '';
        // if (item.PatientBill) {
        //     if (item.PatientBill.PatientPaymentDetails.length > 0) {
        //         let PayDetails = item.PatientBill.PatientPaymentDetails[0];
        //         item.PaymentType = PayDetails.PaymentType.Description;
        //         if (item.CreatedUser) {
        //             if (item.CreatedUser.Title) {
        //                 item.CollectedBy = item.CreatedUser.Title.Description;
        //             }
        //             if (item.CreatedUser.FirstName) {
        //                 item.CollectedBy += ' ' + item.CreatedUser.FirstName;
        //             }
        //             if (item.CreatedUser.LastName) {
        //                 item.CollectedBy += ' ' + item.CreatedUser.LastName;
        //             }
        //         }
        //     }
        // }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            BillingGroup: BillingGroup,
            DoctorName: DoctorName,
            TotalAmount: TotalAmount,
            BillingService: BillingService,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDocshare: TotalDocshare

        };
        let pdfOption: any = null;
        let key = 'itemwisecollectionsummaryopreport';
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
    public async PrintDailySalesandRevenueDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let PatientBillDetailsData = data.Data[0];
        let TotalAmount: number = 0;
        // let TotalDisAmount: number = 0;
        // let TotalNetAmount: number = 0;
        // let TotalDocshare: number = 0;
        let item: any = {};

        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        for (let idx in PatientBillDetails) {
            item = PatientBillDetails[idx];
            item.PaymentType = '';
            if (item.PatientBill) {
                if (item.PatientBill.PatientPaymentDetails.length > 0) {
                    let PayDetails = item.PatientBill.PatientPaymentDetails[0];
                    item.PaymentType = PayDetails.PaymentType.Description;
                }
            }
            TotalAmount += item.GrossAmount;
            // TotalDisAmount += item.DiscountAmt;
            // TotalNetAmount += item.NetAmt;
            // TotalDocshare += item.DoctorShare;
        }

        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            TotalAmount: TotalAmount

        };
        let pdfOption: any = null;
        let key = 'dailysalesandrevenuedetails';
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
    public async PrintSaleGSTReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let SaleGst: any = [];
        let NetSaleGst: any = [];
        let SalesReq = req;
        SaleGst = await this.SaleGSTDetails(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(SalesReq.Data.FacilityId, SalesReq.Data.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (SaleGst) {
            let overallsalegst = [];
            let zerosalegst = [];
            let fivesalegst = [];
            let twelvesalegst = [];
            let eighteensalegst = [];
            let twentyeightsalegst = [];
            for (let gstid in SaleGst) {
                if (parseInt(gstid) === -1) {
                    overallsalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 0) {
                    zerosalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 12) {
                    twelvesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 18) {
                    eighteensalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 5) {
                    fivesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 28) {
                    twentyeightsalegst = SaleGst[gstid];
                }

            }

            for (let idx in zerosalegst) {
                let zero_salegst = zerosalegst[idx];
                let Key = '';
                let ZeroNetAmountBeforeGST = 0;
                let ZerGSTAmount = 0;
                let year = new Date(zero_salegst.BillDate).getFullYear();
                let month = new Date(zero_salegst.BillDate).getMonth();
                let date = new Date(zero_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = zero_salegst.BillDate;
                ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                ZerGSTAmount = zero_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = zero_salegst.BillDate;
                        if (item.ZeroNetAmountBeforeGST > 0) {
                            item.ZeroNetAmountBeforeGST += zero_salegst.NetAmountBeforeGST;
                        } else {
                            item.ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                        }
                        if (item.ZerGSTAmount > 0) {
                            item.ZerGSTAmount += zero_salegst.GSTAmount;
                        } else {
                            item.ZerGSTAmount = zero_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': ZeroNetAmountBeforeGST,
                        'ZerGSTAmount': ZerGSTAmount,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,
                        'BDate': BDate
                    });
            }
            for (let idx in twelvesalegst) {
                let twelve_salegst = twelvesalegst[idx];
                let Key = '';
                let twelveNetAmountBeforeGST = 0;
                let twelveGSTAmount = 0;
                let year = new Date(twelve_salegst.BillDate).getFullYear();
                let month = new Date(twelve_salegst.BillDate).getMonth();
                let date = new Date(twelve_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = twelve_salegst.BillDate;
                twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                twelveGSTAmount = twelve_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = twelve_salegst.BillDate;
                        if (item.twelveNetAmountBeforeGST > 0) {
                            item.twelveNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                        } else {
                            item.twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                        }
                        if (item.twelveGSTAmount > 0) {
                            item.twelveGSTAmount += twelve_salegst.GSTAmount;
                        } else {
                            item.twelveGSTAmount = twelve_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': twelveNetAmountBeforeGST,
                        'twelveGSTAmount': twelveGSTAmount,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,
                        'BDate': BDate

                    });
            }
            for (let idx in eighteensalegst) {
                let eighteen_salegst = eighteensalegst[idx];
                let Key = '';
                let eighteenNetAmountBeforeGST = 0;
                let eighteenGSTAmount = 0;
                let year = new Date(eighteen_salegst.BillDate).getFullYear();
                let month = new Date(eighteen_salegst.BillDate).getMonth();
                let date = new Date(eighteen_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = eighteen_salegst.BillDate;
                eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                eighteenGSTAmount = eighteen_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = eighteen_salegst.BillDate;
                        if (item.eighteenNetAmountBeforeGST > 0) {
                            item.eighteenNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                        } else {
                            item.eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                        }
                        if (item.eighteenGSTAmount > 0) {
                            item.eighteenGSTAmount += eighteen_salegst.GSTAmount;
                        } else {
                            item.eighteenGSTAmount = eighteen_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': eighteenNetAmountBeforeGST,
                        'eighteenGSTAmount': eighteenGSTAmount,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,
                        'BDate': BDate

                    });
            }
            for (let idx in fivesalegst) {
                let five_salegst = fivesalegst[idx];
                let Key = '';
                let fiveNetAmountBeforeGST = 0;
                let fiveGSTAmount = 0;
                let year = new Date(five_salegst.BillDate).getFullYear();
                let month = new Date(five_salegst.BillDate).getMonth();
                let date = new Date(five_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = five_salegst.BillDate;
                fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                fiveGSTAmount = five_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = five_salegst.BillDate;
                        if (item.fiveNetAmountBeforeGST > 0) {
                            item.fiveNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                        } else {
                            item.fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                        }
                        if (item.fiveGSTAmount > 0) {
                            item.fiveGSTAmount += five_salegst.GSTAmount;
                        } else {
                            item.fiveGSTAmount = five_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': fiveNetAmountBeforeGST,
                        'fiveGSTAmount': fiveGSTAmount,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,
                        'BDate': BDate

                    });
            }
            for (let idx in twentyeightsalegst) {
                let twentyeight_salegst = twentyeightsalegst[idx];
                let Key = '';
                let twentyeightNetAmountBeforeGST = 0;
                let twentyeightGSTAmount = 0;
                let year = new Date(twentyeight_salegst.BillDate).getFullYear();
                let month = new Date(twentyeight_salegst.BillDate).getMonth();
                let date = new Date(twentyeight_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = twentyeight_salegst.BillDate;
                twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = twentyeight_salegst.BillDate;
                        if (item.twentyeightNetAmountBeforeGST > 0) {
                            item.twentyeightNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                        } else {
                            item.twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                        }
                        if (item.twentyeightGSTAmount > 0) {
                            item.twentyeightGSTAmount += twentyeight_salegst.GSTAmount;
                        } else {
                            item.twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': twentyeightNetAmountBeforeGST,
                        'twentyeightGSTAmount': twentyeightGSTAmount,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,
                        'BDate': BDate

                    });
            }
            for (let idx in overallsalegst) {
                let overall_salegst = overallsalegst[idx];
                let Key = '';
                let NetAmountBeforeGST = 0;
                let NetAmount = 0;
                let GSTAmount = 0;
                let year = new Date(overall_salegst.BillDate).getFullYear();
                let month = new Date(overall_salegst.BillDate).getMonth();
                let date = new Date(overall_salegst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = overall_salegst.BillDate;
                NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                NetAmount = overall_salegst.NetAmount;
                GSTAmount = overall_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = overall_salegst.BillDate;
                        if (item.NetAmountBeforeGST > 0) {
                            item.NetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                        } else {
                            item.NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                        }
                        if (item.NetAmount > 0) {
                            item.NetAmount += overall_salegst.NetAmount;
                        } else {
                            item.NetAmount = overall_salegst.NetAmount;
                        }
                        if (item.GSTAmount > 0) {
                            item.GSTAmount += overall_salegst.GSTAmount;
                        } else {
                            item.GSTAmount = overall_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'BDate': BDate
                    });
            }
        }
        let Sort_Date = function (a: any, b: any) {
            return new Date(a.BDate).getTime() - new Date(b.BDate).getTime();
        };
        NetSaleGst.sort(Sort_Date);

        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotZeroNetAmountBeforeGST = 0;
        let TotZerGSTAmount = 0;
        let TotfiveNetAmountBeforeGST = 0;
        let TotfiveGSTAmount = 0;
        let TottwelveNetAmountBeforeGST = 0;
        let TottwelveGSTAmount = 0;
        let ToteighteenNetAmountBeforeGST = 0;
        let ToteighteenGSTAmount = 0;
        let TottwentyeightNetAmountBeforeGST = 0;
        let TottwentyeightGSTAmount = 0;
        for (let jdx in NetSaleGst) {
            let netcollection = NetSaleGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST + (netcollection.ZeroNetAmountBeforeGST || 0);
            TotZerGSTAmount = TotZerGSTAmount + (netcollection.ZerGSTAmount || 0);
            TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST + (netcollection.fiveNetAmountBeforeGST || 0);
            TotfiveGSTAmount = TotfiveGSTAmount + (netcollection.fiveGSTAmount || 0);
            TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST + (netcollection.twelveNetAmountBeforeGST || 0);
            TottwelveGSTAmount = TottwelveGSTAmount + (netcollection.twelveGSTAmount || 0);
            ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST + (netcollection.eighteenNetAmountBeforeGST || 0);
            ToteighteenGSTAmount = ToteighteenGSTAmount + (netcollection.eighteenGSTAmount || 0);
            TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST + (netcollection.twentyeightNetAmountBeforeGST || 0);
            TottwentyeightGSTAmount = TottwentyeightGSTAmount + (netcollection.twentyeightGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST;
        TotZerGSTAmount = TotZerGSTAmount;
        TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST;
        TotfiveGSTAmount = TotfiveGSTAmount;
        TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST;
        TottwelveGSTAmount = TottwelveGSTAmount;
        ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST;
        ToteighteenGSTAmount = ToteighteenGSTAmount;
        TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST;
        TottwentyeightGSTAmount = TottwentyeightGSTAmount;

        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotZeroNetAmountBeforeGST: TotZeroNetAmountBeforeGST,
            TotZerGSTAmount: TotZerGSTAmount,
            TotfiveNetAmountBeforeGST: TotfiveNetAmountBeforeGST,
            TotfiveGSTAmount: TotfiveGSTAmount,
            TottwelveNetAmountBeforeGST: TottwelveNetAmountBeforeGST,
            TottwelveGSTAmount: TottwelveGSTAmount,
            ToteighteenNetAmountBeforeGST: ToteighteenNetAmountBeforeGST,
            ToteighteenGSTAmount: ToteighteenGSTAmount,
            TottwentyeightNetAmountBeforeGST: TottwentyeightNetAmountBeforeGST,
            TottwentyeightGSTAmount: TottwentyeightGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'salesgstreport';
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
    public async PrintConsolidateSaleGSTReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let Gstcollection: any = [];
        let NetSaleGst: any = [];
        let OverallGst: any = [];

        let SalesReq = req;
        Gstcollection = await this.GetConsolidateSaleGst(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(SalesReq.Data.FacilityId, SalesReq.Data.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (Gstcollection) {
            let SaleGst = [];
            let SalereturnGst = [];
            if (Gstcollection.length > 0) {
                SaleGst = Gstcollection[0].Value;
            }
            if (Gstcollection.length > 1) {
                SalereturnGst = Gstcollection[1].Value;
            }
            if (SaleGst) {
                let overallsalegst = [];
                let zerosalegst = [];
                let fivesalegst = [];
                let twelvesalegst = [];
                let eighteensalegst = [];
                let twentyeightsalegst = [];
                for (let gstid in SaleGst) {
                    if (parseInt(gstid) === -1) {
                        overallsalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 0) {
                        zerosalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 12) {
                        twelvesalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 18) {
                        eighteensalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 5) {
                        fivesalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 28) {
                        twentyeightsalegst = SaleGst[gstid];
                    }

                }

                for (let idx in zerosalegst) {
                    let zero_salegst = zerosalegst[idx];
                    let Key = '';
                    let ZeroSaleNetAmountBeforeGST = 0;
                    let ZeroSaleGSTAmount = 0;
                    let year = new Date(zero_salegst.BillDate).getFullYear();
                    let month = new Date(zero_salegst.BillDate).getMonth();
                    let date = new Date(zero_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = zero_salegst.BillDate;
                    ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                    ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = zero_salegst.BillDate;
                            if (item.ZeroSaleNetAmountBeforeGST > 0) {
                                item.ZeroSaleNetAmountBeforeGST += zero_salegst.NetAmountBeforeGST;
                            } else {
                                item.ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                            }
                            if (item.ZeroSaleGSTAmount > 0) {
                                item.ZeroSaleGSTAmount += zero_salegst.GSTAmount;
                            } else {
                                item.ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'ZeroSaleNetAmountBeforeGST': ZeroSaleNetAmountBeforeGST,
                            'ZeroSaleGSTAmount': ZeroSaleGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in twelvesalegst) {
                    let twelve_salegst = twelvesalegst[idx];
                    let Key = '';
                    let twelveSaleNetAmountBeforeGST = 0;
                    let twelveSaleGSTAmount = 0;
                    let year = new Date(twelve_salegst.BillDate).getFullYear();
                    let month = new Date(twelve_salegst.BillDate).getMonth();
                    let date = new Date(twelve_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = twelve_salegst.BillDate;
                    twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                    twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = twelve_salegst.BillDate;
                            if (item.twelveSaleNetAmountBeforeGST > 0) {
                                item.twelveSaleNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                            } else {
                                item.twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                            }
                            if (item.twelveSaleGSTAmount > 0) {
                                item.twelveSaleGSTAmount += twelve_salegst.GSTAmount;
                            } else {
                                item.twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twelveSaleNetAmountBeforeGST': twelveSaleNetAmountBeforeGST,
                            'twelveSaleGSTAmount': twelveSaleGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in eighteensalegst) {
                    let eighteen_salegst = eighteensalegst[idx];
                    let Key = '';
                    let eighteenSaleNetAmountBeforeGST = 0;
                    let eighteenSaleGSTAmount = 0;
                    let year = new Date(eighteen_salegst.BillDate).getFullYear();
                    let month = new Date(eighteen_salegst.BillDate).getMonth();
                    let date = new Date(eighteen_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = eighteen_salegst.BillDate;
                    eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                    eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = eighteen_salegst.BillDate;
                            if (item.eighteenSaleNetAmountBeforeGST > 0) {
                                item.eighteenSaleNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                            } else {
                                item.eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                            }
                            if (item.eighteenSaleGSTAmount > 0) {
                                item.eighteenSaleGSTAmount += eighteen_salegst.GSTAmount;
                            } else {
                                item.eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'eighteenSaleNetAmountBeforeGST': eighteenSaleNetAmountBeforeGST,
                            'eighteenSaleGSTAmount': eighteenSaleGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in fivesalegst) {
                    let five_salegst = fivesalegst[idx];
                    let Key = '';
                    let fiveSaleNetAmountBeforeGST = 0;
                    let fiveSaleGSTAmount = 0;
                    let year = new Date(five_salegst.BillDate).getFullYear();
                    let month = new Date(five_salegst.BillDate).getMonth();
                    let date = new Date(five_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = five_salegst.BillDate;
                    fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                    fiveSaleGSTAmount = five_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = five_salegst.BillDate;
                            if (item.fiveSaleNetAmountBeforeGST > 0) {
                                item.fiveSaleNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                            } else {
                                item.fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                            }
                            if (item.fiveSaleGSTAmount > 0) {
                                item.fiveSaleGSTAmount += five_salegst.GSTAmount;
                            } else {
                                item.fiveSaleGSTAmount = five_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'fiveSaleNetAmountBeforeGST': fiveSaleNetAmountBeforeGST,
                            'fiveSaleGSTAmount': fiveSaleGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in twentyeightsalegst) {
                    let twentyeight_salegst = twentyeightsalegst[idx];
                    let Key = '';
                    let twentyeightSaleNetAmountBeforeGST = 0;
                    let twentyeightSaleGSTAmount = 0;
                    let year = new Date(twentyeight_salegst.BillDate).getFullYear();
                    let month = new Date(twentyeight_salegst.BillDate).getMonth();
                    let date = new Date(twentyeight_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = twentyeight_salegst.BillDate;
                    twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                    twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = twentyeight_salegst.BillDate;
                            if (item.twentyeightSaleNetAmountBeforeGST > 0) {
                                item.twentyeightSaleNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightSaleGSTAmount > 0) {
                                item.twentyeightSaleGSTAmount += twentyeight_salegst.GSTAmount;
                            } else {
                                item.twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twentyeightSaleNetAmountBeforeGST': twentyeightSaleNetAmountBeforeGST,
                            'twentyeightSaleGSTAmount': twentyeightSaleGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in overallsalegst) {
                    let overall_salegst = overallsalegst[idx];
                    let Key = '';
                    let SaleNetAmountBeforeGST = 0;
                    let SaleNetAmount = 0;
                    let SaleGSTAmount = 0;
                    let year = new Date(overall_salegst.BillDate).getFullYear();
                    let month = new Date(overall_salegst.BillDate).getMonth();
                    let date = new Date(overall_salegst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = overall_salegst.BillDate;
                    SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                    SaleNetAmount = overall_salegst.NetAmount;
                    SaleGSTAmount = overall_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = overall_salegst.BillDate;
                            if (item.SaleNetAmountBeforeGST > 0) {
                                item.SaleNetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                            } else {
                                item.SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                            }
                            if (item.SaleNetAmount > 0) {
                                item.SaleNetAmount += overall_salegst.NetAmount;
                            } else {
                                item.SaleNetAmount = overall_salegst.NetAmount;
                            }
                            if (item.SaleGSTAmount > 0) {
                                item.SaleGSTAmount += overall_salegst.GSTAmount;
                            } else {
                                item.SaleGSTAmount = overall_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                            'SaleNetAmount': SaleNetAmount,
                            'SaleGSTAmount': SaleGSTAmount,
                            'BDate': BDate
                        });
                }
            }
            if (SalereturnGst) {
                let valappended = 0;
                let overallsalereturngst = [];
                let zerosalereturngst = [];
                let fivesalereturngst = [];
                let twelvesalereturngst = [];
                let eighteensalereturngst = [];
                let twentyeightsalereturngst = [];
                for (let gstid in SalereturnGst) {
                    if (parseInt(gstid) === -1) {
                        overallsalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 0) {
                        zerosalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 12) {
                        twelvesalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 18) {
                        eighteensalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 5) {
                        fivesalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 28) {
                        twentyeightsalereturngst = SalereturnGst[gstid];
                    }

                }

                for (let idx in zerosalereturngst) {
                    let zero_salereturngst = zerosalereturngst[idx];
                    let Key = '';
                    let ZeroRetNetAmountBeforeGST = 0;
                    let ZeroRetGSTAmount = 0;
                    let year = new Date(zero_salereturngst.BillDate).getFullYear();
                    let month = new Date(zero_salereturngst.BillDate).getMonth();
                    let date = new Date(zero_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = zero_salereturngst.BillDate;
                    ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                    ZeroRetGSTAmount = zero_salereturngst.GSTAmount;

                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = zero_salereturngst.BillDate;
                            if (item.ZeroRetNetAmountBeforeGST > 0) {
                                item.ZeroRetNetAmountBeforeGST += zero_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.ZeroRetGSTAmount > 0) {
                                item.ZeroRetGSTAmount += zero_salereturngst.GSTAmount;
                            } else {
                                item.ZeroRetGSTAmount = zero_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'ZeroRetNetAmountBeforeGST': ZeroRetNetAmountBeforeGST,
                            'ZeroRetGSTAmount': ZeroRetGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in twelvesalereturngst) {
                    let twelve_salereturngst = twelvesalereturngst[idx];
                    let Key = '';
                    let twelveRetNetAmountBeforeGST = 0;
                    let twelveRetGSTAmount = 0;
                    let year = new Date(twelve_salereturngst.BillDate).getFullYear();
                    let month = new Date(twelve_salereturngst.BillDate).getMonth();
                    let date = new Date(twelve_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = twelve_salereturngst.BillDate;
                    twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                    twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = twelve_salereturngst.BillDate;
                            if (item.twelveRetNetAmountBeforeGST > 0) {
                                item.twelveRetNetAmountBeforeGST += twelve_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twelveRetGSTAmount > 0) {
                                item.twelveRetGSTAmount += twelve_salereturngst.GSTAmount;
                            } else {
                                item.twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twelveRetNetAmountBeforeGST': twelveRetNetAmountBeforeGST,
                            'twelveRetGSTAmount': twelveRetGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in eighteensalereturngst) {
                    let eighteen_salereturngst = eighteensalereturngst[idx];
                    let Key = '';
                    let eighteenRetNetAmountBeforeGST = 0;
                    let eighteenRetGSTAmount = 0;
                    let year = new Date(eighteen_salereturngst.BillDate).getFullYear();
                    let month = new Date(eighteen_salereturngst.BillDate).getMonth();
                    let date = new Date(eighteen_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = eighteen_salereturngst.BillDate;
                    eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                    eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = eighteen_salereturngst.BillDate;
                            if (item.eighteenRetNetAmountBeforeGST > 0) {
                                item.eighteenRetNetAmountBeforeGST += eighteen_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.eighteenRetGSTAmount > 0) {
                                item.eighteenRetGSTAmount += eighteen_salereturngst.GSTAmount;
                            } else {
                                item.eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'eighteenRetNetAmountBeforeGST': eighteenRetNetAmountBeforeGST,
                            'eighteenRetGSTAmount': eighteenRetGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in fivesalereturngst) {
                    let five_salereturngst = fivesalereturngst[idx];
                    let Key = '';
                    let fiveRetNetAmountBeforeGST = 0;
                    let fiveRetGSTAmount = 0;
                    let year = new Date(five_salereturngst.BillDate).getFullYear();
                    let month = new Date(five_salereturngst.BillDate).getMonth();
                    let date = new Date(five_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = five_salereturngst.BillDate;
                    fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                    fiveRetGSTAmount = five_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = five_salereturngst.BillDate;
                            if (item.fiveRetNetAmountBeforeGST > 0) {
                                item.fiveRetNetAmountBeforeGST += five_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.fiveRetGSTAmount > 0) {
                                item.fiveRetGSTAmount += five_salereturngst.GSTAmount;
                            } else {
                                item.fiveRetGSTAmount = five_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'fiveRetNetAmountBeforeGST': fiveRetNetAmountBeforeGST,
                            'fiveRetGSTAmount': fiveRetGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in twentyeightsalereturngst) {
                    let twentyeight_salereturngst = twentyeightsalereturngst[idx];
                    let Key = '';
                    let twentyeightRetNetAmountBeforeGST = 0;
                    let twentyeightRetGSTAmount = 0;
                    let year = new Date(twentyeight_salereturngst.BillDate).getFullYear();
                    let month = new Date(twentyeight_salereturngst.BillDate).getMonth();
                    let date = new Date(twentyeight_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = twentyeight_salereturngst.BillDate;
                    twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                    twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = twentyeight_salereturngst.BillDate;
                            if (item.twentyeightRetNetAmountBeforeGST > 0) {
                                item.twentyeightRetNetAmountBeforeGST += twentyeight_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightRetGSTAmount > 0) {
                                item.twentyeightRetGSTAmount += twentyeight_salereturngst.GSTAmount;
                            } else {
                                item.twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twentyeightRetNetAmountBeforeGST': twentyeightRetNetAmountBeforeGST,
                            'twentyeightRetGSTAmount': twentyeightRetGSTAmount,
                            'BDate': BDate
                        });
                }
                for (let idx in overallsalereturngst) {
                    let overall_salereturngst = overallsalereturngst[idx];
                    let Key = '';
                    let RetNetAmountBeforeGST = 0;
                    let RetNetAmount = 0;
                    let RetGSTAmount = 0;
                    let year = new Date(overall_salereturngst.BillDate).getFullYear();
                    let month = new Date(overall_salereturngst.BillDate).getMonth();
                    let date = new Date(overall_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let BDate = overall_salereturngst.BillDate;
                    RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                    RetNetAmount = overall_salereturngst.NetAmount;
                    RetGSTAmount = overall_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.BDate = overall_salereturngst.BillDate;
                            if (item.RetNetAmountBeforeGST > 0) {
                                item.RetNetAmountBeforeGST += overall_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.RetNetAmount > 0) {
                                item.RetNetAmount += overall_salereturngst.NetAmount;
                            } else {
                                item.RetNetAmount = overall_salereturngst.NetAmount;
                            }
                            if (item.RetGSTAmount > 0) {
                                item.RetGSTAmount += overall_salereturngst.GSTAmount;
                            } else {
                                item.RetGSTAmount = overall_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                            'RetNetAmount': RetNetAmount,
                            'RetGSTAmount': RetGSTAmount,
                            'BDate': BDate
                        });
                }
            }
            let Sort_Date = function (a: any, b: any) {
                return new Date(a.BDate).getTime() - new Date(b.BDate).getTime();
            };
            NetSaleGst.sort(Sort_Date);

            for (let idx in NetSaleGst) {
                let allgst = NetSaleGst[idx];
                let consolidategst = {
                    Key: allgst.Key,
                    NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                    NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                    GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                    ZeroNetAmountBeforeGST: (allgst.ZeroSaleNetAmountBeforeGST || 0) - (allgst.ZeroRetNetAmountBeforeGST || 0),
                    ZeroGSTAmount: (allgst.ZeroSaleGSTAmount || 0) - (allgst.ZeroRetGSTAmount || 0),
                    fiveNetAmountBeforeGST: (allgst.fiveSaleNetAmountBeforeGST || 0) - (allgst.fiveRetNetAmountBeforeGST || 0),
                    fiveGSTAmount: (allgst.fiveSaleGSTAmount || 0) - (allgst.fiveRetGSTAmount || 0),
                    twelveNetAmountBeforeGST: (allgst.twelveSaleNetAmountBeforeGST || 0) - (allgst.twelveRetNetAmountBeforeGST || 0),
                    twelveGSTAmount: (allgst.twelveSaleGSTAmount || 0) - (allgst.twelveRetGSTAmount || 0),
                    eighteenNetAmountBeforeGST: (allgst.eighteenSaleNetAmountBeforeGST || 0) - (allgst.eighteenRetNetAmountBeforeGST || 0),
                    eighteenGSTAmount: (allgst.eighteenSaleGSTAmount || 0) - (allgst.eighteenRetGSTAmount || 0),
                    twentyeightNetAmountBeforeGST: (allgst.twentyeightSaleNetAmountBeforeGST || 0) -
                        (allgst.twentyeightRetNetAmountBeforeGST || 0),
                    twentyeightGSTAmount: (allgst.twentyeightSaleGSTAmount || 0) - (allgst.twentyeightRetGSTAmount || 0),
                };
                OverallGst.push(consolidategst);
            }

        }


        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotZeroNetAmountBeforeGST = 0;
        let TotZerGSTAmount = 0;
        let TotfiveNetAmountBeforeGST = 0;
        let TotfiveGSTAmount = 0;
        let TottwelveNetAmountBeforeGST = 0;
        let TottwelveGSTAmount = 0;
        let ToteighteenNetAmountBeforeGST = 0;
        let ToteighteenGSTAmount = 0;
        let TottwentyeightNetAmountBeforeGST = 0;
        let TottwentyeightGSTAmount = 0;
        for (let jdx in OverallGst) {
            let netcollection = OverallGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST + (netcollection.ZeroNetAmountBeforeGST || 0);
            TotZerGSTAmount = TotZerGSTAmount + (netcollection.ZerGSTAmount || 0);
            TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST + (netcollection.fiveNetAmountBeforeGST || 0);
            TotfiveGSTAmount = TotfiveGSTAmount + (netcollection.fiveGSTAmount || 0);
            TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST + (netcollection.twelveNetAmountBeforeGST || 0);
            TottwelveGSTAmount = TottwelveGSTAmount + (netcollection.twelveGSTAmount || 0);
            ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST + (netcollection.eighteenNetAmountBeforeGST || 0);
            ToteighteenGSTAmount = ToteighteenGSTAmount + (netcollection.eighteenGSTAmount || 0);
            TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST + (netcollection.twentyeightNetAmountBeforeGST || 0);
            TottwentyeightGSTAmount = TottwentyeightGSTAmount + (netcollection.twentyeightGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST;
        TotZerGSTAmount = TotZerGSTAmount;
        TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST;
        TotfiveGSTAmount = TotfiveGSTAmount;
        TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST;
        TottwelveGSTAmount = TottwelveGSTAmount;
        ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST;
        ToteighteenGSTAmount = ToteighteenGSTAmount;
        TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST;
        TottwentyeightGSTAmount = TottwentyeightGSTAmount;


        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            OverallGst: OverallGst,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotZeroNetAmountBeforeGST: TotZeroNetAmountBeforeGST,
            TotZerGSTAmount: TotZerGSTAmount,
            TotfiveNetAmountBeforeGST: TotfiveNetAmountBeforeGST,
            TotfiveGSTAmount: TotfiveGSTAmount,
            TottwelveNetAmountBeforeGST: TottwelveNetAmountBeforeGST,
            TottwelveGSTAmount: TottwelveGSTAmount,
            ToteighteenNetAmountBeforeGST: ToteighteenNetAmountBeforeGST,
            ToteighteenGSTAmount: ToteighteenGSTAmount,
            TottwentyeightNetAmountBeforeGST: TottwentyeightNetAmountBeforeGST,
            TottwentyeightGSTAmount: TottwentyeightGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'consolidatesalesgstreport';
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
    public async PrintConsolidateOuputGSTSummary(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let Gstcollection: any = [];
        let NetSaleGst: any = [];
        let OverallGst: any = [];

        let SalesReq = req;
        Gstcollection = await this.GetConsolidateOutputGst(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(SalesReq.Data.FacilityId, SalesReq.Data.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (Gstcollection) {
            let SaleGst = [];
            let SalereturnGst = [];
            if (Gstcollection.length > 0) {
                SaleGst = Gstcollection[0].Value;
            }
            if (Gstcollection.length > 1) {
                SalereturnGst = Gstcollection[1].Value;
            }
            if (SaleGst) {
                for (let idx in SaleGst) {
                    let gstgrpdata = SaleGst[idx];
                    let Key = '';
                    let SaleNetAmountBeforeGST = 0;
                    let SaleNetAmount = 0;
                    let SaleGSTAmount = 0;
                    let SaleCGSTAmount = 0;
                    let SaleSGSTAmount = 0;
                    let gstdata: any = {};
                    for (let ix in gstgrpdata) {
                        gstdata = gstgrpdata[ix];
                        Key = gstdata.GSTPercentage;
                        SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                        SaleNetAmount = gstdata.NetAmount;
                        SaleGSTAmount = gstdata.GSTAmount;
                        SaleCGSTAmount = gstdata.CGSTAmount;
                        SaleSGSTAmount = gstdata.SGSTAmount;
                    }
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            if (item.SaleNetAmountBeforeGST > 0) {
                                item.SaleNetAmountBeforeGST += gstdata.NetAmountBeforeGST;
                            } else {
                                item.SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                            }
                            if (item.SaleNetAmount > 0) {
                                item.SaleNetAmount += gstdata.NetAmount;
                            } else {
                                item.SaleNetAmount = gstdata.NetAmount;
                            }
                            if (item.SaleGSTAmount > 0) {
                                item.SaleGSTAmount += gstdata.GSTAmount;
                            } else {
                                item.SaleGSTAmount = gstdata.GSTAmount;
                            }
                            if (item.SaleCGSTAmount > 0) {
                                item.SaleCGSTAmount += gstdata.CGSTAmount;
                            } else {
                                item.SaleCGSTAmount = gstdata.CGSTAmount;
                            }
                            if (item.SaleSGSTAmount > 0) {
                                item.SaleSGSTAmount += gstdata.SGSTAmount;
                            } else {
                                item.SaleSGSTAmount = gstdata.SGSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                            'SaleNetAmount': SaleNetAmount,
                            'SaleGSTAmount': SaleGSTAmount,
                            'SaleCGSTAmount': SaleCGSTAmount,
                            'SaleSGSTAmount': SaleSGSTAmount,
                        });
                }
            }
            if (SalereturnGst) {
                for (let idx in SalereturnGst) {
                    let retgstgrpdata = SalereturnGst[idx];
                    let Key = '';
                    let RetNetAmountBeforeGST = 0;
                    let RetNetAmount = 0;
                    let RetGSTAmount = 0;
                    let RetCGSTAmount = 0;
                    let RetSGSTAmount = 0;
                    let retgstdata: any = {};
                    for (let ix in retgstgrpdata) {
                        retgstdata = retgstgrpdata[ix];
                        Key = retgstdata.GSTPercentage;
                        RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                        RetNetAmount = retgstdata.NetAmount;
                        RetGSTAmount = retgstdata.GSTAmount;
                        RetCGSTAmount = retgstdata.CGSTAmount;
                        RetSGSTAmount = retgstdata.SGSTAmount;
                    }
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            if (item.RetNetAmountBeforeGST > 0) {
                                item.RetNetAmountBeforeGST += retgstdata.NetAmountBeforeGST;
                            } else {
                                item.RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                            }
                            if (item.RetNetAmount > 0) {
                                item.RetNetAmount += retgstdata.NetAmount;
                            } else {
                                item.RetNetAmount = retgstdata.NetAmount;
                            }
                            if (item.RetGSTAmount > 0) {
                                item.RetGSTAmount += retgstdata.GSTAmount;
                            } else {
                                item.RetGSTAmount = retgstdata.GSTAmount;
                            }
                            if (item.RetCGSTAmount > 0) {
                                item.RetCGSTAmount += retgstdata.CGSTAmount;
                            } else {
                                item.RetCGSTAmount = retgstdata.CGSTAmount;
                            }
                            if (item.RetSGSTAmount > 0) {
                                item.RetSGSTAmount += retgstdata.SGSTAmount;
                            } else {
                                item.RetSGSTAmount = retgstdata.SGSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                            'RetNetAmount': RetNetAmount,
                            'RetGSTAmount': RetGSTAmount,
                            'RetCGSTAmount': RetCGSTAmount,
                            'RetSGSTAmount': RetSGSTAmount,
                        });
                }
            }

            for (let idx in NetSaleGst) {
                let allgst = NetSaleGst[idx];
                let consolidategst = {
                    Key: allgst.Key,
                    NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                    NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                    GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                    CGSTAmount: (allgst.SaleCGSTAmount || 0) - (allgst.RetCGSTAmount || 0),
                    SGSTAmount: (allgst.SaleSGSTAmount || 0) - (allgst.RetSGSTAmount || 0),
                };
                OverallGst.push(consolidategst);
            }

        }
        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotCGSTAmount = 0;
        let TotSGSTAmount = 0;
        for (let jdx in OverallGst) {
            let netcollection = OverallGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotCGSTAmount = TotCGSTAmount + (netcollection.CGSTAmount || 0);
            TotSGSTAmount = TotSGSTAmount + (netcollection.SGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotCGSTAmount = TotCGSTAmount;
        TotSGSTAmount = TotSGSTAmount;

        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            OverallGst: OverallGst,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotCGSTAmount: TotCGSTAmount,
            TotSGSTAmount: TotSGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'consolidateoutputgstsummary';
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

    public async PrintDailySalesSummaryReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let ItemMaster = req.Data.ItemMaster;
        let DailySaleSummary: any = [];
        let NetSummary: any = [];
        let OverallSummary: any = [];

        let ConSaleSummary = req;
        DailySaleSummary = await this.GetDailySalesSummarybyItem(ConSaleSummary);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ConSaleSummary.Data.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(ConSaleSummary.Data.FacilityId, ConSaleSummary.Data.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (DailySaleSummary) {
            let SaleSummary = [];
            let ReturnSummary = [];
            if (DailySaleSummary.length > 0) {
                SaleSummary = DailySaleSummary[0].Value;
            }
            if (DailySaleSummary.length > 1) {
                ReturnSummary = DailySaleSummary[1].Value;
            }
            if (SaleSummary) {
                for (let idx in SaleSummary) {
                    let ItemName = '';
                    let ItemCode = '';
                    let Quantity: any = '';
                    let Mrp: any = '';
                    let Ucp: any = '';
                    let PurchasePrice: any = '';
                    let Profit: any = '';
                    let SaleAmount = 0;
                    let Discount = 0;
                    let TotalSales = 0;
                    let salesummary = SaleSummary[idx];
                    for (let sdx in salesummary) {
                        let itemsale = salesummary[sdx];
                        ItemName = itemsale.ItemName;
                        ItemCode = itemsale.ItemCode;
                        Quantity = itemsale.Quantity;
                        Mrp = itemsale.AvgMrp;
                        Ucp = itemsale.AvgUcp;
                        PurchasePrice = (Ucp * Quantity).toFixed(2);
                        SaleAmount = itemsale.SaleAmount;
                        Discount = itemsale.Discount;
                        TotalSales = itemsale.TotalSales;
                        Profit = (TotalSales - PurchasePrice).toFixed(2);
                        var valappended = 0;
                        NetSummary.forEach(function (item: any) {
                            if (ItemName === item.ItemName) {
                                item.ItemName = itemsale.ItemName;
                                item.ItemCode = itemsale.ItemCode;
                                item.Quantity = itemsale.Quantity || 0;
                                item.Mrp = parseFloat(itemsale.AvgMrp).toFixed(2) || 0;
                                item.Ucp = parseFloat(itemsale.AvgUcp).toFixed(2) || 0;
                                item.PurchasePrice = (parseFloat(itemsale.AvgUcp) * itemsale.Quantity).toFixed(2) || 0;
                                item.SaleAmount = itemsale.SaleAmount || 0;
                                item.Discount = itemsale.Discount || 0;
                                item.TotalSales = itemsale.TotalSales || 0;
                                item.Profit = (item.TotalSales - item.PurchasePrice).toFixed(2);
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSummary.push({
                                'ItemName': ItemName,
                                'ItemCode': ItemCode,
                                'Quantity': Quantity || 0,
                                'Mrp': Mrp || 0,
                                'Ucp': Ucp || 0,
                                'PurchasePrice': PurchasePrice || 0,
                                'SaleAmount': SaleAmount || 0,
                                'Discount': Discount || 0,
                                'TotalSales': TotalSales || 0,
                                'Profit': Profit
                            });
                    }
                }
            }
            if (ReturnSummary) {
                for (let idx in ReturnSummary) {
                    let ItemName = '';
                    let ItemCode = '';
                    let ReturnQuantity = 0;
                    let ReturnMrp = 0;
                    let ReturnAmount = 0;
                    let ReturnDiscount = 0;
                    let TotalReturns = 0;
                    let retsummary = ReturnSummary[idx];
                    for (let sdx in retsummary) {
                        let itemreturn = retsummary[sdx];
                        ItemName = itemreturn.ItemName;
                        ItemCode = itemreturn.ItemCode;
                        ReturnQuantity = itemreturn.ReturnQuantity;
                        ReturnMrp = itemreturn.ReturnMrp;
                        ReturnAmount = itemreturn.ReturnAmount;
                        ReturnDiscount = itemreturn.ReturnDiscount;
                        TotalReturns = itemreturn.TotalReturns;
                        let valappended = 0;
                        NetSummary.forEach(function (item: any) {
                            if (ItemName === item.ItemName) {
                                item.ItemName = itemreturn.ItemName;
                                item.ItemCode = itemreturn.ItemCode;
                                item.ReturnQuantity = itemreturn.ReturnQuantity || 0;
                                item.ReturnMrp = itemreturn.ReturnMrp || 0;
                                item.ReturnAmount = itemreturn.ReturnAmount || 0;
                                item.ReturnDiscount = itemreturn.ReturnDiscount || 0;
                                item.TotalReturns = itemreturn.TotalReturns || 0;
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSummary.push({
                                'ItemName': ItemName,
                                'ItemCode': ItemCode,
                                'ReturnQuantity': ReturnQuantity || 0,
                                'ReturnMrp': ReturnMrp || 0,
                                'ReturnAmount': ReturnAmount || 0,
                                'ReturnDiscount': ReturnDiscount || 0,
                                'TotalReturns': TotalReturns || 0,
                            });
                    }
                }
            }
            for (var idx in NetSummary) {
                var allgst = NetSummary[idx];
                allgst.NetSales = (allgst.TotalSales || 0) - (allgst.TotalReturns || 0);
                if (!allgst.Quantity) {
                    allgst.Quantity = 0;
                }
                if (!allgst.Mrp) {
                    allgst.Mrp = 0;
                }
                if (!allgst.SaleAmount) {
                    allgst.SaleAmount = 0;
                }
                if (!allgst.Discount) {
                    allgst.Discount = 0;
                }
                if (!allgst.TotalSales) {
                    allgst.TotalSales = 0;
                }

                if (!allgst.ReturnQuantity) {
                    allgst.ReturnQuantity = 0;
                }
                if (!allgst.ReturnMrp) {
                    allgst.ReturnMrp = 0;
                }
                if (!allgst.ReturnAmount) {
                    allgst.ReturnAmount = 0;
                }
                if (!allgst.ReturnDiscount) {
                    allgst.ReturnDiscount = 0;
                }
                if (!allgst.TotalReturns) {
                    allgst.TotalReturns = 0;
                }
                OverallSummary.push(allgst);
            }

        }
        let TotSalesQty = 0;
        let TotPurchasePrice = 0;
        let TotMrp = 0;
        let TotSalesAmount = 0;
        let TotDiscount = 0;
        let FooterSalesAmount = 0;
        let TotProfit = 0;
        let TotReturnQty = 0;
        let TotReturnAmount = 0;
        let TotReturnDiscount = 0;
        let FooterReturnAmount = 0;
        let FooterNetAmount = 0;
        for (let jdx in OverallSummary) {
            let netsalessummary = OverallSummary[jdx];
            TotSalesQty = TotSalesQty + (netsalessummary.Quantity || 0);
            TotMrp = TotMrp + parseFloat(netsalessummary.Mrp || 0);
            TotPurchasePrice = TotPurchasePrice + parseFloat(netsalessummary.PurchasePrice || 0);
            TotSalesAmount = TotSalesAmount + (netsalessummary.SaleAmount || 0);
            TotDiscount = TotDiscount + (netsalessummary.Discount || 0);
            TotProfit = TotProfit + parseFloat(netsalessummary.Profit || 0);
            FooterSalesAmount = FooterSalesAmount + (netsalessummary.TotalSales || 0);
            TotReturnQty = TotReturnQty + (netsalessummary.ReturnQuantity || 0);
            TotReturnAmount = TotReturnAmount + (netsalessummary.ReturnAmount || 0);
            TotReturnDiscount = TotReturnDiscount + (netsalessummary.ReturnDiscount || 0);
            FooterReturnAmount = FooterReturnAmount + (netsalessummary.TotalReturns || 0);
            FooterNetAmount = FooterNetAmount + (netsalessummary.NetSales || 0);
        }
        TotSalesQty = TotSalesQty;
        TotPurchasePrice = TotPurchasePrice;
        TotMrp = TotMrp;
        TotProfit = TotProfit;
        TotSalesAmount = TotSalesAmount;
        TotDiscount = TotDiscount;
        FooterSalesAmount = FooterSalesAmount;
        TotReturnQty = TotReturnQty;
        TotReturnAmount = TotReturnAmount;
        TotReturnDiscount = TotReturnDiscount;
        FooterReturnAmount = FooterReturnAmount;
        FooterNetAmount = FooterNetAmount;

        let info = {
            NetSummary: NetSummary,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            OverallSummary: OverallSummary,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            ItemMaster: ItemMaster,
            TotSalesQty: TotSalesQty,
            TotMrp: TotMrp,
            TotSalesAmount: TotSalesAmount,
            TotDiscount: TotDiscount,
            FooterSalesAmount: FooterSalesAmount,
            TotReturnQty: TotReturnQty,
            TotReturnAmount: TotReturnAmount,
            TotReturnDiscount: TotReturnDiscount,
            FooterReturnAmount: FooterReturnAmount,
            FooterNetAmount: FooterNetAmount,
            TotPurchasePrice: TotPurchasePrice,
            TotProfit: TotProfit

        };
        let pdfOption: any = null;
        let key = 'dailysalessummarybyitem';
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

    public async PrintOverallConsolidateGSTSummary(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let Gstcollection: any = [];
        let NetSaleGst: any = [];
        let OverallGst: any = [];

        let SalesReq = req;
        Gstcollection = await this.GetOverallConsolidateGst(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);

        if (Gstcollection) {
            let OutputSaleGst = [];
            let OutputSalereturnGst = [];
            let InputSaleGst = [];
            let InputSalereturnGst = [];
            let OutputGst = [];
            let InputGst = [];
            if (Gstcollection.length > 0) {
                OutputGst = Gstcollection[0].Value;
            }
            if (Gstcollection.length > 1) {
                InputGst = Gstcollection[1].Value;
            }
            if (OutputGst) {
                if (OutputGst.length > 0) {
                    OutputSaleGst = OutputGst[0].Value;
                }
                if (OutputGst.length > 1) {
                    OutputSalereturnGst = OutputGst[1].Value;
                }
                if (OutputSaleGst) {
                    for (let idx in OutputSaleGst) {
                        let outputsalegst = OutputSaleGst[idx];
                        let Key = '';
                        let SaleNetAmountBeforeGST = 0;
                        let SaleNetAmount = 0;
                        let SaleGSTAmount = 0;
                        let SaleCGSTAmount = 0;
                        let SaleSGSTAmount = 0;
                        let outputgstdata: any = {};
                        for (let ix in outputsalegst) {
                            outputgstdata = outputsalegst[ix];
                            Key = outputgstdata.GSTPercentage;
                            SaleNetAmountBeforeGST = outputgstdata.NetAmountBeforeGST;
                            SaleNetAmount = outputgstdata.NetAmount;
                            SaleGSTAmount = outputgstdata.GSTAmount;
                            SaleCGSTAmount = outputgstdata.CGSTAmount;
                            SaleSGSTAmount = outputgstdata.SGSTAmount;
                        }
                        let valappended = 0;
                        NetSaleGst.forEach(function (item: any) {
                            if (Key === item.Key) {
                                if (item.SaleNetAmountBeforeGST > 0) {
                                    item.SaleNetAmountBeforeGST += outputgstdata.NetAmountBeforeGST;
                                } else {
                                    item.SaleNetAmountBeforeGST = outputgstdata.NetAmountBeforeGST;
                                }
                                if (item.SaleNetAmount > 0) {
                                    item.SaleNetAmount += outputgstdata.NetAmount;
                                } else {
                                    item.SaleNetAmount = outputgstdata.NetAmount;
                                }
                                if (item.SaleGSTAmount > 0) {
                                    item.SaleGSTAmount += outputgstdata.GSTAmount;
                                } else {
                                    item.SaleGSTAmount = outputgstdata.GSTAmount;
                                }
                                if (item.SaleCGSTAmount > 0) {
                                    item.SaleCGSTAmount += outputgstdata.CGSTAmount;
                                } else {
                                    item.SaleCGSTAmount = outputgstdata.CGSTAmount;
                                }
                                if (item.SaleSGSTAmount > 0) {
                                    item.SaleSGSTAmount += outputgstdata.SGSTAmount;
                                } else {
                                    item.SaleSGSTAmount = outputgstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSaleGst.push({
                                'Key': Key,
                                'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                                'SaleNetAmount': SaleNetAmount,
                                'SaleGSTAmount': SaleGSTAmount,
                                'SaleCGSTAmount': SaleCGSTAmount,
                                'SaleSGSTAmount': SaleSGSTAmount,
                            });
                    }
                }
                if (OutputSalereturnGst) {
                    for (let idx in OutputSalereturnGst) {
                        let outputsalereturngst = OutputSalereturnGst[idx];
                        let Key = '';
                        let RetNetAmountBeforeGST = 0;
                        let RetNetAmount = 0;
                        let RetGSTAmount = 0;
                        let RetCGSTAmount = 0;
                        let RetSGSTAmount = 0;
                        let outputretgstdata: any = {};
                        for (let ix in outputsalereturngst) {
                            outputretgstdata = outputsalereturngst[ix];
                            Key = outputretgstdata.GSTPercentage;
                            RetNetAmountBeforeGST = outputretgstdata.NetAmountBeforeGST;
                            RetNetAmount = outputretgstdata.NetAmount;
                            RetGSTAmount = outputretgstdata.GSTAmount;
                            RetCGSTAmount = outputretgstdata.CGSTAmount;
                            RetSGSTAmount = outputretgstdata.SGSTAmount;
                        }
                        let valappended = 0;
                        NetSaleGst.forEach(function (item: any) {
                            if (Key === item.Key) {
                                if (item.RetNetAmountBeforeGST > 0) {
                                    item.RetNetAmountBeforeGST += outputretgstdata.NetAmountBeforeGST;
                                } else {
                                    item.RetNetAmountBeforeGST = outputretgstdata.NetAmountBeforeGST;
                                }
                                if (item.RetNetAmount > 0) {
                                    item.RetNetAmount += outputretgstdata.NetAmount;
                                } else {
                                    item.RetNetAmount = outputretgstdata.NetAmount;
                                }
                                if (item.RetGSTAmount > 0) {
                                    item.RetGSTAmount += outputretgstdata.GSTAmount;
                                } else {
                                    item.RetGSTAmount = outputretgstdata.GSTAmount;
                                }
                                if (item.RetCGSTAmount > 0) {
                                    item.RetCGSTAmount += outputretgstdata.CGSTAmount;
                                } else {
                                    item.RetCGSTAmount = outputretgstdata.CGSTAmount;
                                }
                                if (item.RetSGSTAmount > 0) {
                                    item.RetSGSTAmount += outputretgstdata.SGSTAmount;
                                } else {
                                    item.RetSGSTAmount = outputretgstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSaleGst.push({
                                'Key': Key,
                                'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                                'RetNetAmount': RetNetAmount,
                                'RetGSTAmount': RetGSTAmount,
                                'RetCGSTAmount': RetCGSTAmount,
                                'RetSGSTAmount': RetSGSTAmount,
                            });
                    }
                }
            }

            if (InputGst) {
                if (InputGst.length > 0) {
                    InputSaleGst = InputGst[0].Value;
                }
                if (InputGst.length > 1) {
                    InputSalereturnGst = InputGst[1].Value;
                }
                if (InputSaleGst) {
                    for (let idx in InputSaleGst) {
                        let gstgrpdata = InputSaleGst[idx];
                        let Key = '';
                        let IPSaleNetAmountBeforeGST = 0;
                        let IPSaleNetAmount = 0;
                        let IPSaleGSTAmount = 0;
                        let IPSaleCGSTAmount = 0;
                        let IPSaleSGSTAmount = 0;
                        let inputgstdata: any = {};
                        for (let ix in gstgrpdata) {
                            inputgstdata = gstgrpdata[ix];
                            Key = inputgstdata.GSTPercentage;
                            IPSaleNetAmountBeforeGST = inputgstdata.NetAmountBeforeGST;
                            IPSaleNetAmount = inputgstdata.NetAmount;
                            IPSaleGSTAmount = inputgstdata.GSTAmount;
                            IPSaleCGSTAmount = inputgstdata.CGSTAmount;
                            IPSaleSGSTAmount = inputgstdata.SGSTAmount;
                        }
                        let valappended = 0;
                        NetSaleGst.forEach(function (item: any) {
                            if (Key === item.Key) {
                                if (item.IPSaleNetAmountBeforeGST > 0) {
                                    item.IPSaleNetAmountBeforeGST += inputgstdata.NetAmountBeforeGST;
                                } else {
                                    item.IPSaleNetAmountBeforeGST = inputgstdata.NetAmountBeforeGST;
                                }
                                if (item.IPSaleNetAmount > 0) {
                                    item.IPSaleNetAmount += inputgstdata.NetAmount;
                                } else {
                                    item.IPSaleNetAmount = inputgstdata.NetAmount;
                                }
                                if (item.IPSaleGSTAmount > 0) {
                                    item.IPSaleGSTAmount += inputgstdata.GSTAmount;
                                } else {
                                    item.IPSaleGSTAmount = inputgstdata.GSTAmount;
                                }
                                if (item.IPSaleCGSTAmount > 0) {
                                    item.IPSaleCGSTAmount += inputgstdata.CGSTAmount;
                                } else {
                                    item.IPSaleCGSTAmount = inputgstdata.CGSTAmount;
                                }
                                if (item.IPSaleSGSTAmount > 0) {
                                    item.IPSaleSGSTAmount += inputgstdata.SGSTAmount;
                                } else {
                                    item.IPSaleSGSTAmount = inputgstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSaleGst.push({
                                'Key': Key,
                                'IPSaleNetAmountBeforeGST': IPSaleNetAmountBeforeGST,
                                'IPSaleNetAmount': IPSaleNetAmount,
                                'IPSaleGSTAmount': IPSaleGSTAmount,
                                'IPSaleCGSTAmount': IPSaleCGSTAmount,
                                'IPSaleSGSTAmount': IPSaleSGSTAmount,
                            });
                    }
                }
                if (InputSalereturnGst) {
                    for (let idx in InputSalereturnGst) {
                        let retgstgrpdata = InputSalereturnGst[idx];
                        let Key = '';
                        let IPRetNetAmountBeforeGST = 0;
                        let IPRetNetAmount = 0;
                        let IPRetGSTAmount = 0;
                        let IPRetCGSTAmount = 0;
                        let IPRetSGSTAmount = 0;
                        let inputretgstdata: any = {};
                        for (let ix in retgstgrpdata) {
                            inputretgstdata = retgstgrpdata[ix];
                            Key = inputretgstdata.GSTPercentage;
                            IPRetNetAmountBeforeGST = inputretgstdata.NetAmountBeforeGST;
                            IPRetNetAmount = inputretgstdata.NetAmount;
                            IPRetGSTAmount = inputretgstdata.GSTAmount;
                            IPRetCGSTAmount = inputretgstdata.CGSTAmount;
                            IPRetSGSTAmount = inputretgstdata.SGSTAmount;
                        }
                        let valappended = 0;
                        NetSaleGst.forEach(function (item: any) {
                            if (Key === item.Key) {
                                if (item.IPRetNetAmountBeforeGST > 0) {
                                    item.IPRetNetAmountBeforeGST += inputretgstdata.NetAmountBeforeGST;
                                } else {
                                    item.IPRetNetAmountBeforeGST = inputretgstdata.NetAmountBeforeGST;
                                }
                                if (item.IPRetNetAmount > 0) {
                                    item.IPRetNetAmount += inputretgstdata.NetAmount;
                                } else {
                                    item.IPRetNetAmount = inputretgstdata.NetAmount;
                                }
                                if (item.IPRetGSTAmount > 0) {
                                    item.IPRetGSTAmount += inputretgstdata.GSTAmount;
                                } else {
                                    item.IPRetGSTAmount = inputretgstdata.GSTAmount;
                                }
                                if (item.IPRetCGSTAmount > 0) {
                                    item.IPRetCGSTAmount += inputretgstdata.CGSTAmount;
                                } else {
                                    item.IPRetCGSTAmount = inputretgstdata.CGSTAmount;
                                }
                                if (item.IPRetSGSTAmount > 0) {
                                    item.IPRetSGSTAmount += inputretgstdata.SGSTAmount;
                                } else {
                                    item.IPRetSGSTAmount = inputretgstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            NetSaleGst.push({
                                'Key': Key,
                                'IPRetNetAmountBeforeGST': IPRetNetAmountBeforeGST,
                                'IPRetNetAmount': IPRetNetAmount,
                                'IPRetGSTAmount': IPRetGSTAmount,
                                'IPRetCGSTAmount': IPRetCGSTAmount,
                                'IPRetSGSTAmount': IPRetSGSTAmount,
                            });
                    }
                }
            }


            for (let idx in NetSaleGst) {
                let allgst = NetSaleGst[idx];
                let consolidategst = {
                    Key: allgst.Key,
                    NetAmountBeforeGST: ((allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0)) -
                        ((allgst.IPSaleNetAmountBeforeGST || 0) - (allgst.IPRetNetAmountBeforeGST || 0)),

                    NetAmount: ((allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0)) -
                        ((allgst.IPSaleNetAmount || 0) - (allgst.IPRetNetAmount || 0)),

                    GSTAmount: ((allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0)) -
                        ((allgst.IPSaleGSTAmount || 0) - (allgst.IPRetGSTAmount || 0)),

                    CGSTAmount: ((allgst.SaleCGSTAmount || 0) - (allgst.RetCGSTAmount || 0)) -
                        ((allgst.IPSaleCGSTAmount || 0) - (allgst.IPRetCGSTAmount || 0)),

                    SGSTAmount: ((allgst.SaleSGSTAmount || 0) - (allgst.RetSGSTAmount || 0)) -
                        ((allgst.IPSaleSGSTAmount || 0) - (allgst.IPRetSGSTAmount || 0)),
                };
                OverallGst.push(consolidategst);
            }

        }
        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotCGSTAmount = 0;
        let TotSGSTAmount = 0;
        for (let jdx in OverallGst) {
            let netcollection = OverallGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotCGSTAmount = TotCGSTAmount + (netcollection.CGSTAmount || 0);
            TotSGSTAmount = TotSGSTAmount + (netcollection.SGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotCGSTAmount = TotCGSTAmount;
        TotSGSTAmount = TotSGSTAmount;

        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            OverallGst: OverallGst,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotCGSTAmount: TotCGSTAmount,
            TotSGSTAmount: TotSGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'overallconsolidategst';
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
    public async PrintPharmacyScheduleXReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let PatientBillDetailsData = data.Data[0];
        let PharmacyScheduleReport: any = [];
        PatientBillDetails.forEach((Detail: any) => {
            let BillData = Detail;
            BillData.PatientInfo = '';
            if (Detail.PatientBill.Patient) {
                if (Detail.PatientBill.Patient.Title)
                    BillData.PatientInfo = Detail.PatientBill.Patient.Title.Description;
                if (Detail.PatientBill.Patient.FirstName)
                    BillData.PatientInfo += ' ' + Detail.PatientBill.Patient.FirstName;
                if (Detail.PatientBill.Patient.LastName)
                    BillData.PatientInfo += ' ' + Detail.PatientBill.Patient.LastName;
                if (Detail.PatientBill.Patient.MRN)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.MRN;
                if (Detail.PatientBill.Patient.Age)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.Age;
                if (Detail.PatientBill.Patient.Gender)
                    BillData.PatientInfo += '/' + Detail.PatientBill.Patient.Gender.Description;
            } else if (!Detail.PatientBill.Patient) {
                BillData.PatientInfo = Detail.PatientBill.PatientName
                    + '/' + Detail.PatientBill.Age + '/' + Detail.PatientBill.Gender.Description;
            }
            PharmacyScheduleReport.push(BillData);
        });

        let billBO = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request);
        let PatBillData = await billBO.GetPatientBillsById({ Id: PatientBillDetailsData.PatientBillId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatBillData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatBillData.FacilityId, PatBillData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            PharmacyScheduleReport: PharmacyScheduleReport
        };
        let pdfOption: any = null;
        let key = 'pharmacyschedulexreport';
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
    public async UpdatePatientCancelItemwise(req: BaseRequest): Promise<boolean> {
        let patientbillbo = BoFactory.GetBo(BillingBo.PatientBillsBo, this.Request); // Patient bill header
        let creditNotebo = BoFactory.GetBo(BillingBo.PatientCreditNoteBo, this.Request); // Credit Note
        let refundbo = BoFactory.GetBo(BillingBo.PatientRefundBo, this.Request); // Refund Against Item Paid Amount
        let orderbo = BoFactory.GetBo(orderBo.PatientOrderBo, this.Request);
        let orderdetailbo = BoFactory.GetBo(orderBo.PatientOrderDetailBo, this.Request);
        let totalrefundamt = 0;
        for (var dtidx = 0; dtidx < req.Data.selectedlist.length; dtidx++) {
            await this.Update(req.Data.selectedlist[dtidx]);
            totalrefundamt += req.Data.selectedlist[dtidx].ReceivedAmount;
        }
        let CNId = await creditNotebo.ManagePatientCreditNoteBillCancel(req.Data.CN);
        if (!CNId) CNId = -1;
        let PatientCreditNoteData = await creditNotebo.GetPatientCreditNoteById({ Id: CNId });
        if (totalrefundamt > 0) {
            req.Data.Refund.Data.Header.CreditNoteIdentifier = PatientCreditNoteData.CreditNoteIdentifier;
            await refundbo.AddPatientRefund(req.Data.Refund);
        }
        if (req.Data.billheader) {
            let updrev = await patientbillbo.GetPatientBillsById({ Id: req.Data.billheader.Id });
            if (updrev) req.Data.billheader.Rev = updrev.Rev;
            await patientbillbo.Update(req.Data.billheader);
        }
        if (req.Data.Order) {
            if (req.Data.Order.Header) {
                for (let idx in req.Data.Order.Header) {
                    await orderbo.UpdateBillingStaus(req.Data.Order.Header[idx].Id,
                        req.Data.Order.Header[idx].PatientBillStatusId);
                    await orderbo.UpdateOrderStatus(req.Data.Order.Header[idx].Id,
                        req.Data.Order.Header[idx].OrderStatusId);
                }
            }
            if (req.Data.Order.Details) {
                for (let idx in req.Data.Order.Details) {
                    await orderdetailbo.UpdateBillingStaus(req.Data.Order.Details[idx].Id,
                        req.Data.Order.Details[idx].PatientBillStatusId);
                }
                for (let idx in req.Data.Order.Details) {
                    await orderdetailbo.UpdateOrderStatus(req.Data.Order.Details[idx].Id,
                        req.Data.Order.Details[idx].OrderStatusId);
                }
            }
        }

        for (let pdx in req.Data.selectedlist) {
            let billdetail = req.Data.selectedlist[pdx];
            let docShareBO = BoFactory.GetBo(BillingBo.PatientDoctorShareDetailsBo, this.Request);
            let apipatdrshareReq = {
                Id: 0,
                Params: [
                    { Key: PatientDoctorShareDetailsFilters.PatientBillDetailId, Value: billdetail.Id },
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };
            let doctorShareData: any = await docShareBO.GetPatientDoctorShareDetails(apipatdrshareReq);
            for (let jdx in doctorShareData.Data) {
                let shareInfo = doctorShareData.Data[jdx];
                let shareupdate: any = {
                    Id: shareInfo.Id,
                    DoctorShareStatusId: 2
                };
                await docShareBO.Update(shareupdate);
            }
        }

        return true;
    }
    public async PrintRadiologyRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DepartmentName = apiReq.Data.DepartmentName;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            GuarantorName: GuarantorName,
            DepartmentName: DepartmentName

        };
        let pdfOption: any = null;
        let key = 'radiologyrevenuereport';
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
    public async PrintLabRevenueReport(apiReq?: ApiRequest<PatientBillDetailsFilters>): Promise<any> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DepartmentName = apiReq.Data.DepartmentName;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            GuarantorName: GuarantorName,
            DepartmentName: DepartmentName

        };
        let pdfOption: any = null;
        let key = 'labrevenuereport';
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
    public GetModel(): SStatic.Model<PatientBillDetailsInstance, PatientBillDetailsAttributes> {
        return this.Models.PatientBillDetails;
    }

    public async GetFacilityCollectionDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPServiceCollectionRep(req) });
        result.push({ Key: 2, Value: await this.IPServiceCollectionRep(req) });
        return result;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPServiceCollection(req) });
        result.push({ Key: 2, Value: await this.IPServiceCollection(req) });
        return result;
    }

    public async PrintRevenueSummaryCategoryReport(req: BaseRequest): Promise<any> {
        // let data = await this.GetFacilityDashboardOptions(apiReq);
        // let FacilityDashboard = data.Data;
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let CategoryName = req.Data.CategoryName;
        let CategoryData: any = [];
        // let FacilityInfo: any = [];
        let opTotNetAmt: number = 0;
        let opcategory: any = [];
        let category: Array<any> = [];
        let Totcategory: any = [];
        let totopcategory: any = [];
        let ipcategory: any = [];
        let totipcategory: any = [];

        let categoryReq = req;
        CategoryData = await this.GetFacilityCollectionDashBoard(categoryReq);
        // CategoryData = CategoryData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(categoryReq.Data.FacilityId);

        let opcollection = [];
        let ipcollection = [];

        if (CategoryData.length > 0)
            opcollection = CategoryData[0].Value;


        if (CategoryData.length > 1)
            ipcollection = CategoryData[1].Value;


        for (let idx in opcollection) {
            let coll = opcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            opTotNetAmt += NetAmt;
            opcategory.push({
                'Key': key,
                'Value': NetAmt
            });
            category.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'OPIP': NetAmt
                }
            });
        }
        totopcategory.push({
            'Key': 'Total',
            'Value': opTotNetAmt
        });
        let ipTotNetAmt = 0;
        for (let idx in ipcollection) {
            let coll = ipcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            ipTotNetAmt += NetAmt;
            ipcategory.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            category.forEach((val) => {
                if (key === val.Key) {
                    val.Value.IP = NetAmt;
                    val.Value.OPIP = val.Value.OP + val.Value.IP;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                category.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': NetAmt,
                        'OPIP': NetAmt
                    }
                });
        }
        totipcategory.push({
            'Key': 'Total',
            'Value': ipTotNetAmt
        });

        Totcategory.push({
            'Key': 'Total',
            'Value': {
                'OP': opTotNetAmt,
                'IP': ipTotNetAmt,
                'OPIP': opTotNetAmt + ipTotNetAmt
            }
        });
        let info = {
            Preferences: printPreferencesData,
            category: category,
            Totcategory: Totcategory,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            CategoryName: CategoryName
        };
        let pdfOption: any = null;
        let key = 'revenuesummarycategoryreport';
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

    public async BICategoryRevneue(req: BaseRequest): Promise<any> {
        let BIRptDeptRevenue: any = {};
        for (let j = 0, len = req.Data.length; j < len; j++) {
            let frmdt = req.Data[j].DispDate;
            if (!BIRptDeptRevenue[frmdt]) BIRptDeptRevenue[frmdt] = {};
            let newreq: any = {
                Data: []
            };
            newreq.Data = req.Data[j];
            if (newreq && newreq.Data && newreq.Data.FromDate) {
                if (!BIRptDeptRevenue[frmdt]['OPCatg']) {
                    BIRptDeptRevenue[frmdt]['OPCatg'] = [];
                }
                if (!BIRptDeptRevenue[frmdt]['IPCatg']) {
                    BIRptDeptRevenue[frmdt]['IPCatg'] = [];
                }
                BIRptDeptRevenue[frmdt]['OPCatg'].push(await this.BIOPServiceCollection(newreq));
                BIRptDeptRevenue[frmdt]['IPCatg'].push(await this.BIIPServiceCollection(newreq));
            }
        }
        return BIRptDeptRevenue;
    }

    private async OPServiceCollectionRep(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: { '$in': [1, 5] },
                PatientBillStatusId: 3,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };
        if (req.Data.ServiceCategoryId > 0) {
            let ipbillamountInstance: any = await this.FindAll({
                attributes: ['NetAmount', 'ServiceCategoryId'],
                where: {
                    PatientBillStatusId: 3,
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId },
                    FacilityId: req.Data.FacilityId,
                },
                include: [PatientBillJoin, ServiceCategoryJoin]
            });
            if (ipbillamountInstance) {
                for (let i = 0; i < ipbillamountInstance.length; i++) {
                    let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                    let ServId = billdetail.ServiceCategoryId;
                    ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                    let info = {
                        'NetAmount': billdetail.NetAmount,
                        'ServId': ServId,
                        'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                    };
                    ServiceGroup[ServId].push(info);
                }
            }
        } else if (req.Data.ServiceCategoryId === 0) {
            let ipbillamountInstance: any = await this.FindAll({
                attributes: ['NetAmount', 'ServiceCategoryId'],
                where: {
                    PatientBillStatusId: 3,
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId },
                    FacilityId: req.Data.FacilityId,
                },
                include: [PatientBillJoin, ServiceCategoryJoin]
            });
            if (ipbillamountInstance) {
                for (let i = 0; i < ipbillamountInstance.length; i++) {
                    let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                    let ServId = billdetail.ServiceCategoryId;
                    ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                    let info = {
                        'NetAmount': billdetail.NetAmount,
                        'ServId': ServId,
                        'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                    };
                    ServiceGroup[ServId].push(info);
                }
            }
        }

        return ServiceGroup;
    }

    private async IPServiceCollectionRep(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: 2,
                PatientBillStatusId: 3,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };
        let EncounterJoin: any = {
            model: this.Models.Encounter,
            attributes: [],
            required: true,
            where: {
                AdmissionStatusId: { '$in': [5, 6] },
            }
        };
        if (req.Data.ServiceCategoryId > 0) {
            let ipbillamountInstance: any = await this.FindAll({
                attributes: ['NetAmount', 'ServiceCategoryId'],
                where: {
                    PatientBillStatusId: 3,
                    // BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ServiceCategoryId: { '$eq': req.Data.ServiceCategoryId },
                    FacilityId: req.Data.FacilityId,
                },
                include: [PatientBillJoin, ServiceCategoryJoin, EncounterJoin]
            });
            if (ipbillamountInstance) {
                for (let i = 0; i < ipbillamountInstance.length; i++) {
                    let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                    let ServId = billdetail.ServiceCategoryId;
                    ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                    let info = {
                        'NetAmount': billdetail.NetAmount,
                        'ServId': ServId,
                        'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                    };
                    ServiceGroup[ServId].push(info);
                }
            }
        } else if (req.Data.ServiceCategoryId === 0) {
            let ipbillamountInstance: any = await this.FindAll({
                attributes: ['NetAmount', 'ServiceCategoryId'],
                where: {
                    PatientBillStatusId: 3,
                    // BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ServiceCategoryId: { '$gt': req.Data.ServiceCategoryId },
                    FacilityId: req.Data.FacilityId,
                },
                include: [PatientBillJoin, ServiceCategoryJoin, EncounterJoin]
            });
            if (ipbillamountInstance) {
                for (let i = 0; i < ipbillamountInstance.length; i++) {
                    let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                    let ServId = billdetail.ServiceCategoryId;
                    ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                    let info = {
                        'NetAmount': billdetail.NetAmount,
                        'ServId': ServId,
                        'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                    };
                    ServiceGroup[ServId].push(info);
                }
            }
        }


        return ServiceGroup;
    }

    private async OPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: { '$in': [1, 5] },
                PatientBillStatusId: 3,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };
        let ipbillamountInstance: any = await this.FindAll({
            attributes: ['NetAmount', 'ServiceCategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (ipbillamountInstance) {
            for (let i = 0; i < ipbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                let ServId = billdetail.ServiceCategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.NetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }

    private async IPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                // BillTypeId: 2,
                PatientBillStatusId: 3,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };
        let EncounterJoin: any = {
            model: this.Models.Encounter,
            attributes: [],
            required: true,
            where: {
                AdmissionStatusId: { '$in': [5, 6] },

            }
        };
        let ipbillamountInstance: any = await this.FindAll({
            attributes: ['NetAmount', 'ServiceCategoryId'],
            where: {
                PatientBillStatusId: 3,
                // BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin, EncounterJoin]
        });
        if (ipbillamountInstance) {
            for (let i = 0; i < ipbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                let ServId = billdetail.ServiceCategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.NetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }
    private async BIOPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: { '$in': [1, 5, 4] },
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let ipbillamountInstance: any = await this.FindAll({
            attributes: ['NetAmount', 'ServiceCategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (ipbillamountInstance) {
            for (let i = 0; i < ipbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                let ServId = billdetail.ServiceCategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.NetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }

    private async BIIPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: 3,
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let ipbillamountInstance: any = await this.FindAll({
            attributes: ['NetAmount', 'ServiceCategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (ipbillamountInstance) {
            for (let i = 0; i < ipbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                let ServId = billdetail.ServiceCategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.NetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }

}
