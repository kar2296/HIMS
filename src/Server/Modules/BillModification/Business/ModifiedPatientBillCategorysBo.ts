import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import * as bo from '../../BillModification/Business/Index';
import * as AcutalBillbo from '../../Billing/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import {
    ModifiedPatientBillCategorysFilters, ModifiedPatientBillCategoryDetailsFilters,
    ModifiedPatientBillsFilters, ModifiedPatientPaymentDetailsFilters
} from '../Common/Filters.e';
import {
     PatientRefundFilters,
} from '../../Billing/Common/Filters.e';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import {
    ModifiedPatientBillCategorysInstance,
    ModifiedPatientBillCategorysAttributes
} from '../Model/Interface/Index';
import * as PatGuarantorBo from '../../Registration/Business/Index';
import { PatientGuarantorFilters } from '../../Registration/Common/Filters.e';
import { join } from 'path';

export class ModifiedPatientBillCategorysBo extends BaseBo<ModifiedPatientBillCategorysInstance, ModifiedPatientBillCategorysAttributes>  {
    public async AddModifiedPatientBillCategorys(req: BaseRequest): Promise<number> {
        return 0;
    }

    public async UpdateModifiedPatientBillCategorys(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async ManageNewlyAddedPatientBillCategorys(ModifiedPatientBillId: number,
        details: ModifiedPatientBillCategorysAttributes[]): Promise<any> {
        let categorydetailsBo = BoFactory.GetBo(bo.ModifiedPatientBillCategoryDetailsBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: ModifiedPatientBillCategorysFilters.ModifiedPatientBillId, Value: ModifiedPatientBillId },
                        { Key: ModifiedPatientBillCategorysFilters.PatientBillId, Value: detail.PatientBillId },
                        { Key: ModifiedPatientBillCategorysFilters.EncounterId, Value: detail.EncounterId },
                        { Key: ModifiedPatientBillCategorysFilters.ServiceCategoryId, Value: detail.ServiceCategoryId }
                    ]
                };
                let ExistingServiceCategory = await this.GetModifiedPatientBillCategorys(apiReq);
                if (ExistingServiceCategory.Data.length > 0) {
                    let existingcategory = await this.GetModifiedPatientBillCategorysById({ Id: ExistingServiceCategory.Data[0].Id });
                    existingcategory.CategoryGrossAmount = existingcategory.CategoryGrossAmount + detail.CategoryGrossAmount;
                    existingcategory.CategoryNetAmount = existingcategory.CategoryNetAmount + detail.CategoryNetAmount;
                    existingcategory.SupplementaryGrossAmount = existingcategory.SupplementaryGrossAmount + detail.CategoryGrossAmount;
                    existingcategory.SupplementaryNetAmount = existingcategory.SupplementaryNetAmount + detail.CategoryNetAmount;
                    await this.Update(existingcategory);

                    let PatientBillCategoryDetails: any = detail['ModifiedPatientBillCategoryDetails'];
                    await categorydetailsBo.ManageModifiedPatientBillCategoryDetails(ModifiedPatientBillId,
                        ExistingServiceCategory.Data[0].Id, PatientBillCategoryDetails);
                } else {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    let PatientBillCategoryDetails: any = detail['ModifiedPatientBillCategoryDetails'];
                    await categorydetailsBo.ManageModifiedPatientBillCategoryDetails(ModifiedPatientBillId,
                        result.dataValues.Id, PatientBillCategoryDetails);
                }
            })(DetailItem);
        }));

        return true;
    }

    public async ManageModifiedPatientBillCategorys(ModifiedPatientBillId: number,
        details: ModifiedPatientBillCategorysAttributes[]): Promise<any> {
        let categorydetailsBo = BoFactory.GetBo(bo.ModifiedPatientBillCategoryDetailsBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.ModifiedPatientBillId = ModifiedPatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    let PatientBillCategoryDetails: any = detail['PatientBillCategoryDetails'];
                    await categorydetailsBo.ManageModifiedPatientBillCategoryDetails(ModifiedPatientBillId,
                        result.dataValues.Id, PatientBillCategoryDetails);
                } else if (detail.Id > 0) {
                    /* await this.Update(detail); */
                    let ModifiedPatientBillCategoryDetails: any = detail['ModifiedPatientBillCategoryDetails'];
                    await categorydetailsBo.ManageModifiedPatientBillCategoryDetails(ModifiedPatientBillId,
                        detail.Id, ModifiedPatientBillCategoryDetails);

                    let ModifiedPatientBillCategoryId = detail.Id;
                    let ServiceCategoryId = detail.ServiceCategoryId;
                    await this.UpdateModifiedCategoryDetails(ModifiedPatientBillCategoryId, ServiceCategoryId);
                }
            })(DetailItem);
        }));

        return true;
    }

    public async UpdateModifiedCategoryDetails(ModifiedPatientBillCategoryId: number, ServiceCategoryId: number): Promise<any> {
        let categorieDetailsBO = BoFactory.GetBo(bo.ModifiedPatientBillCategoryDetailsBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [
                { Key: ModifiedPatientBillCategoryDetailsFilters.ServiceCategoryId, Value: ServiceCategoryId }
            ]
        };
        let CategoryDetailsData = await categorieDetailsBO.GetModifiedPatientBillCategoryDetails(apiReq);
        let CategoryGrossAmount: number = 0;
        let CategoryDiscountAmount: number = 0;
        let CategoryNetAmount: number = 0;

        let GuarantorGrossAmount: number = 0;
        let GuarantorDiscountAmount: number = 0;
        let GuarantorNetAmount: number = 0;

        let SupplementaryGrossAmount: number = 0;
        let SupplementaryDiscountAmount: number = 0;
        let SupplementaryNetAmount: number = 0;
        CategoryDetailsData.Data.forEach((Detail: any) => {
            let CategoryDetail = Detail;
            if (CategoryDetail.Status === 1) {
                CategoryGrossAmount += Detail.GrossAmount;
                CategoryDiscountAmount += Detail.DiscountAmount;
                CategoryNetAmount += Detail.NetAmount;
                if (CategoryDetail.IsSupplementary) {
                    SupplementaryGrossAmount += Detail.GrossAmount;
                    SupplementaryDiscountAmount += Detail.DiscountAmount;
                    SupplementaryNetAmount += Detail.NetAmount;
                } else {
                    GuarantorGrossAmount += Detail.GrossAmount;
                    GuarantorDiscountAmount += Detail.DiscountAmount;
                    GuarantorNetAmount += Detail.NetAmount;
                }
            }
        });

        let modifiedCategory = await this.GetModifiedPatientBillCategorysById({ Id: ModifiedPatientBillCategoryId });
        modifiedCategory.CategoryGrossAmount = CategoryGrossAmount;
        modifiedCategory.CategoryDiscountAmount = CategoryDiscountAmount;
        modifiedCategory.CategoryNetAmount = CategoryNetAmount;

        modifiedCategory.GuarantorGrossAmount = GuarantorGrossAmount;
        modifiedCategory.GuarantorDiscountAmount = GuarantorDiscountAmount;
        modifiedCategory.GuarantorNetAmount = GuarantorNetAmount;

        modifiedCategory.SupplementaryGrossAmount = SupplementaryGrossAmount;
        modifiedCategory.SupplementaryDiscountAmount = SupplementaryDiscountAmount;
        modifiedCategory.SupplementaryNetAmount = SupplementaryNetAmount;

        await this.Update(modifiedCategory);
    }

    public async GetModifiedPatientBillCategorysById(req: BaseRequest): Promise<ModifiedPatientBillCategorysAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetModifiedPatientBillCategorys(apiReq?: ApiRequest<ModifiedPatientBillCategorysFilters>):
        Promise<ApiResponse<ModifiedPatientBillCategorysAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ModifiedPatientBillCategorysFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.ModifiedPatientBillId:
                        where['ModifiedPatientBillId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategorysFilters.ServiceSubCategoryId:
                        where['ServiceSubCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteModifiedPatientBillCategorys(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async AcutalPrintPatientBillSummary(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ModifiedPatientBillCategorysFilters.EncounterId, Value: req.Id }]
        };
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let PatientBillSummary = await this.GetModifiedPatientBillCategorys(apiReq);
        let PatientBillSummarys: any = [];
        let TotalGrossAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalNetAmountWithoutDiscount: number = 0;
        let TotalDiscount: number = 0;
        await Promise.all(PatientBillSummary.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                let PatientBillSplitDetailsBo = BoFactory.GetBo(bo.ModifiedPatientBillCategoryDetailsBo, this.Request);
                let splitReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: ModifiedPatientBillCategoryDetailsFilters.ModifiedPatientBillCategoryId, Value: bill.Id }]
                };
                let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetModifiedPatientBillCategoryDetails(splitReq);
                summary.ItemAmount = 0;
                BillSplitDetailsData.Data.forEach((Detail) => {
                    TotalGrossAmount += Detail.Amount;
                    TotalDiscount += Detail.DiscountAmount;
                    TotalNetAmount += Detail.Amount - Detail.DiscountAmount;
                    TotalNetAmountWithoutDiscount += Detail.Amount;
                    summary.ItemAmount += Detail.Amount - Detail.DiscountAmount;
                });
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                PatientBillSummarys.push(summary);
                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                PatientBillSummarys.sort(custom_sort);
            })(splitItem);
        }));
        let isFinalized: boolean = req.Data.isFinalized;
        let PatientBills: any = {};
        let FinalPaymentDetail: any = {};
        if (isFinalized) {
            let billReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: ModifiedPatientBillsFilters.EncounterId, Value: req.Id },
                { Key: ModifiedPatientBillsFilters.BillType, Value: 2 }, { Key: ModifiedPatientBillsFilters.PatientBillStatus, Value: 3 }]
            };
            let BillsBo = BoFactory.GetBo(bo.ModifiedPatientBillsBo, this.Request);
            let PatientBillData = await BillsBo.GetModifiedPatientBills(billReq);
            PatientBills = PatientBillData.Data[0];
            let billpayReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: ModifiedPatientPaymentDetailsFilters.EncounterId, Value: req.Id },
                { Key: ModifiedPatientPaymentDetailsFilters.ModifiedPatientBillId, Value: PatientBills.Id }]
            };
            let BillPaymentBo = BoFactory.GetBo(bo.ModifiedPatientPaymentDetailsBo, this.Request);
            let PatientPaymentDetailsData = await BillPaymentBo.GetModifiedPatientPaymentDetails(billpayReq);
            FinalPaymentDetail = PatientPaymentDetailsData.Data[0];
        }
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let patientBo = BoFactory.GetBo(PatGuarantorBo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Encounter.PatientId });
        let AdvanceAmount: number = 0;
        let ReceiptAmount: number = 0;
        let PaidAmount: number = 0;
        let DueCollect: number = 0;
        let ReceiptDetails = [];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ModifiedPatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: ModifiedPatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: ModifiedPatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: ModifiedPatientPaymentDetailsFilters.IsConsolidatePay, Value: false } ]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.ModifiedPatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetModifiedPatientPaymentDetails(detailReq);
        for (var idx in PatientPaymentDetailsData.Data) {
            var ReceiptItem = PatientPaymentDetailsData.Data[idx];
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 1 &&
                PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                AdvanceAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 2 &&
                PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                ReceiptAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                PaidAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 3)
                DueCollect += PatientPaymentDetailsData.Data[idx].AmountPaid;
            ReceiptDetails.push(ReceiptItem);
        }
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 }]
        };
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let RefundDetails = [];
        let PatientRefundBo = BoFactory.GetBo(AcutalBillbo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (var idx1 in PatientRefundData.Data) {
            var RefundItem = PatientRefundData.Data[idx1];
            if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            }
            if (PatientRefundData.Data[idx1].RefundTypeId === 1)
                PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            RefundDetails.push(RefundItem);
        }
        let UserReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: req.Data.PrintUser }]
        };
        let UsersBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let PrintUser = await UsersBo.GetUsers(UserReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let InsAdvanceAmount = (PaidAmount - RefundAmount);
        if (InsAdvanceAmount < 0)
            InsAdvanceAmount = 0;

        if (Encounter.EstimatedBillDist && !isFinalized && PatientBills.BillTypeId !== 2) {
            PatientBills.BillDiscount = Encounter.EstimatedBillDist;
            TotalDiscount = Encounter.EstimatedBillDist;
            TotalNetAmount -= Encounter.EstimatedBillDist;
            TotalNetAmountWithoutDiscount -= Encounter.EstimatedBillDist;
        }
        let PayModeDesc = '';
        if (FinalPaymentDetail && FinalPaymentDetail.PaymentType &&
            FinalPaymentDetail.PaymentType.Description) {
            PayModeDesc = FinalPaymentDetail.PaymentType.Description;
            PayModeDesc = PayModeDesc.toUpperCase();
        }

        let GuarantorId = Encounter.GuarantorId;
        let PatientGuarantorReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientGuarantorFilters.Id, Value: GuarantorId }]
        };
        let PatientGuarantorBo = BoFactory.GetBo(PatGuarantorBo.PatientGuarantorBo, this.Request);
        let PatientGuarantorData = await PatientGuarantorBo.GetPatientGuarantors(PatientGuarantorReq);
        let PatientGuarantor = PatientGuarantorData.Data[0];
        let GuarantorApprovedAmount: number = 0;
        let NetAmountAfterGuarantorApprovedAmount: number = 0;
        let BalanceAmountAfterGuarantorApprovedAmount: number = 0;
        GuarantorApprovedAmount = PatientGuarantor.CreditLimit;
        NetAmountAfterGuarantorApprovedAmount = TotalNetAmountWithoutDiscount - GuarantorApprovedAmount;
        BalanceAmountAfterGuarantorApprovedAmount = (NetAmountAfterGuarantorApprovedAmount - PaidAmount) + PartialRefundAmount;

        let info = {
            PatientBillSummary: PatientBillSummarys,
            PatientBills: PatientBills,
            FinalPaymentDetail: FinalPaymentDetail,
            PayModeDesc: PayModeDesc,
            Encounter: Encounter,
            Patient: patientData,
            PatientPaymentDetails: ReceiptDetails,
            TotalGrossAmount: TotalGrossAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDiscount: TotalDiscount,
            AdvanceAmount: AdvanceAmount,
            InsAdvanceAmount: InsAdvanceAmount,
            ReceiptAmount: ReceiptAmount,
            PaidAmount: PaidAmount,
            DueCollect: DueCollect,
            NetAmount: (PatientBills.BillAmount + PatientBills.RoundOffValue) - PatientBills.BillDiscount,
            BalanceAmount: (TotalNetAmount - PaidAmount) + PartialRefundAmount,
            currentdate: new Date(),
            PrintUser: PrintUser.Data[0],
            PatientRefund: PatientRefundData.Data,
            RefundAmount: RefundAmount,
            PartialRefundAmount: PartialRefundAmount,
            Preferences: printPreferencesData,
            GuarantorApprovedAmount: GuarantorApprovedAmount,
            NetAmountAfterGuarantorApprovedAmount: NetAmountAfterGuarantorApprovedAmount,
            BalanceAmountAfterGuarantorApprovedAmount: BalanceAmountAfterGuarantorApprovedAmount,
            TotalNetAmountWithoutDiscount: TotalNetAmountWithoutDiscount
        };
        let key = 'Inpatientbillsummary(i)';
        let pdfOption: any = null;
        {
            if (isFinalized) {
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'Inpatientbillsummary';
                }
            }
            if (req.Data.isGuarantor) {
                key = 'InpatientbillsummaryGuarantor(i)';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientbillsummaryGuarantor';
                }
            }
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.3in',
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
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<ModifiedPatientBillCategorysInstance, ModifiedPatientBillCategorysAttributes> {
        return this.Models.ModifiedPatientBillCategorys;
    }
}
