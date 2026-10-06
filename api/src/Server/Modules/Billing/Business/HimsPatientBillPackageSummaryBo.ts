import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientBillPackageSummaryInstance, PatientBillPackageSummaryAttributes } from '../Model/Interface/Index';
import { PatientBillPackageSummaryFilters } from '../Common/Filters.e';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import * as billingBO from '../../Billing/Business/Index';
import * as encBo from '../../Visit/Business/Index';
import {
    EncounterFilters,
    EncounterIPPackageFilters
} from '../../Visit/Common/Filters.e';
import {
    PatientBillsFilters,
    PatientPaymentDetailsFilters,
    PatientRefundFilters
} from '../../Billing/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { join } from 'path';
import * as _ from 'lodash';

export class PatientBillPackageSummaryBo extends BaseBo<PatientBillPackageSummaryInstance,
    PatientBillPackageSummaryAttributes> {
    public async AddPatientBillPackageSummary(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientBillPackageSummary(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientBillPackageSummary(EncounterId: number, details: PatientBillPackageSummaryAttributes[]):
        Promise<boolean> {
        details = details || [];

        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let summaryApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillPackageSummaryFilters.EncounterId, Value: EncounterId }]
        };
        let billsummarys = await this.GetPatientBillPackageSummarys(summaryApiReq);
        //Delete the Existing Summary items for refersh new details
        await Promise.all(billsummarys.Data.map((billsummaryItem): Promise<void> => {
            return (async (summary): Promise<void> => {
                await this.DeleteById(summary);
            })(billsummaryItem);
        }));

        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (d): Promise<void> => {
                let detail: any = d;
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let ServiceCategory = await servicecategoryBo.GetServiceCategoryById({ Id: detail.ServiceCategoryId });
                    detail.DisplayOrder = ServiceCategory.DisplayOrder;
                    detail.ServiceGroupId = ServiceCategory.ServiceGroupId;
                    let IpPackage = await BoFactory.GetBo(clinicalmasterBO.IPPackageBo, this.Request).
                        GetIPPackageById({ Id: detail.IPPackageId });
                    detail.PackageName = IpPackage.IPPackageName;
                    let billPackageSummaryId = await this.GetExistsBillPackageSummary({
                        where: {
                            EncounterId: detail.EncounterId,
                            ServiceCategoryId: detail.ServiceCategoryId
                        },
                        attributes: ['Id']
                    });
                    if (billPackageSummaryId === -1) {
                        let saveResult = await this.Save(detail);
                        billPackageSummaryId = saveResult.dataValues.Id;
                    } else {
                        detail.Id = billPackageSummaryId;
                        await this.Update(detail);
                    }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }

    public async GetExistsBillPackageSummary(foption: SStatic.FindOptions<any>): Promise<number> {
        let billPackageSummaryId: number = -1;
        let billPackageSummaryInstance: any = await this.Find(foption);
        if (billPackageSummaryInstance) {
            let billPackageSummary = this.GetAttribute(billPackageSummaryInstance);
            billPackageSummaryId = billPackageSummary.Id;
        } return billPackageSummaryId;
    }

    public async UpdateBillSummary(req: BaseRequest, details: any, packItem: any): Promise<any> {
        let BillDetails: any = details.Data;
        let packageName = packItem.IPPackageName;
        let EncippackId = packItem.Id;
        let IppackId = packItem.IPPackageId;
        let EncId = req.Id;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;

        let actAmt: any = 0;
        let incAmt: any = 0;
        let excAmt: any = 0;
        let actPatAmt: any = 0;
        let packamt: any = 0;
        for (let gdx in groupedData) {
            actAmt = 0;
            incAmt = 0;
            excAmt = 0;
            actPatAmt = 0;
            packamt = 0;
            BillInfo = groupedData[gdx];
            let Actamt: any = 0;
            let IncAmt: any = 0;
            let ExcAmt: any = 0;
            let actualPatamt: any = 0;
            let PackAmt: any = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (detData.PatientBillStatusId === 3) {
                    PackAmt = PackAmt + parseFloat(detData.GrossAmount || 0);
                    Actamt = Actamt + parseFloat(detData.GrossAmount || 0);
                    if (!detData.IsInclusionItem && !detData.IsExclusionItem && !detData.IsSupplementary) {
                        IncAmt = IncAmt + parseFloat(detData.GrossAmount || 0);
                    }
                    if (detData.IsInclusionItem) {
                        IncAmt = IncAmt + parseFloat(detData.GrossAmount || 0);
                    }
                    if (detData.IsExclusionItem) {
                        // if (IncAmt > 0) {
                        //     IncAmt = IncAmt - parseFloat(detData.GrossAmount || 0);
                        // }
                        ExcAmt = ExcAmt + parseFloat(detData.GrossAmount || 0);
                    }
                    if (detData.IsSupplementary) {
                        // if (IncAmt > 0) {
                        //     IncAmt = IncAmt - parseFloat(detData.GrossAmount || 0);
                        // }
                        // if (ExcAmt > 0) {
                        //     ExcAmt = ExcAmt - parseFloat(detData.GrossAmount || 0);
                        // }
                        actualPatamt = actualPatamt + parseFloat(detData.NetAmount || 0);
                    }
                }

            }
            packamt = PackAmt;
            actAmt = Actamt;
            incAmt = IncAmt;
            excAmt = ExcAmt;
            actPatAmt = actualPatamt;
            let CatgryId = parseInt(gdx);
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillPackageSummaryFilters.EncounterId, Value: EncId },
                    { Key: PatientBillPackageSummaryFilters.ServiceCategoryId, Value: CatgryId },
                    // { Key: PatientBillPackageSummaryFilters.IPPackageId, Value: IppackId },
                    // { Key: PatientBillPackageSummaryFilters.EncounterIPPackageId, Value: EncippackId }
                ]
            };
            // let PatinetBillSummaData = await this.GetPatientBillPackageSummarys(billSummReq);
            let PatinetBillSummaData = await this.GetMinPatientBillPackageSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncId,
                        IPPackageId: IppackId,
                        EncounterIPPackageId: EncippackId,
                        PackageName: packageName,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actAmt,
                        PackageAmount: packamt,
                        InclusionAmount: incAmt,
                        ActualPatAmount: actPatAmt,
                        ExclusionAmount: excAmt,
                    };
                    await this.Update(SummData);
                }
            } else {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncId,
                    IPPackageId: IppackId,
                    EncounterIPPackageId: EncippackId,
                    PackageName: packageName,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    PackageAmount: packamt,
                    InclusionAmount: incAmt,
                    ActualPatAmount: actPatAmt,
                    ExclusionAmount: excAmt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }

    public async GetPatientBillPackageSummaryById(req: BaseRequest): Promise<PatientBillPackageSummaryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientBillPackageSummarys(apiReq?: ApiRequest<PatientBillPackageSummaryFilters>):
        Promise<ApiResponse<PatientBillPackageSummaryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.ServiceCategory,
            attributes: ['Id', 'ServiceCategoryCode', 'ServiceCategoryName', 'DisplayOrder'],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillPackageSummaryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.IPPackageId:
                        where['IPPackageId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.EncounterIPPackageId:
                        where['EncounterIPPackageId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.EncounterIPPackagees:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['EncounterIPPackageId'] = { '$in': paramArr };
                        }

                        break;
                    case PatientBillPackageSummaryFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.ServiceCategoryId:

                    default:
                        throw ('Not Implemented');
                }
            }
        });
        order.push(['DisplayOrder', 'ASC']);
        include.push({
            model: this.Models.EncounterIPPackage, required: true,
            where: { 'ActiveStatusId': 2 },
            // include: [{
            //     model: this.Models.EncounterIPPackageDetail, required: false,
            //     include: [{ model: this.Models.EncounterIPPackageServiceInclusion, required: false },
            //     { model: this.Models.EncounterIPPackageServiceExclusion, required: false }]
            // }]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetMinPatientBillPackageSummarys(apiReq?: ApiRequest<PatientBillPackageSummaryFilters>):
        Promise<ApiResponse<PatientBillPackageSummaryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.ServiceCategory,
            attributes: ['Id', 'ServiceCategoryCode', 'ServiceCategoryName'],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillPackageSummaryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.IPPackageId:
                        where['IPPackageId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.EncounterIPPackageId:
                        where['EncounterIPPackageId'] = param.Value;
                        break;
                    case PatientBillPackageSummaryFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        order.push(['DisplayOrder', 'ASC']);
        // include.push({
        //     model: this.Models.EncounterIPPackage, attributes: ['ItemCode'], required: true,
        //     where: { 'ActiveStatusId': 2 },
        //     include: [{
        //         model: this.Models.EncounterIPPackageDetail, attributes: ['ItemCode'], required: false,
        //         include: [{ model: this.Models.EncounterIPPackageServiceInclusion, attributes: ['ItemCode'], required: false },
        //         { model: this.Models.EncounterIPPackageServiceExclusion, attributes: ['ItemCode'],required: false }]
        //     }]
        // });
        apiReq.Attributes = ['Id', 'DisplayOrder', 'ServiceCategoryId'];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeletePatientBillPackageSummary(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetPatientBillPackageSummaryDetails(req: BaseRequest): Promise<any> {
        let BillSummary: any = {};

        let PackageBo = BoFactory.GetBo(encBo.EncounterIPPackageBo, this.Request);
        let PRFundBo = BoFactory.GetBo(billingBO.PatientRefundBo, this.Request);
        let ReceiptBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
        let BillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);

        let billSummaryApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillPackageSummaryFilters.EncounterId, Value: req.Data.EncounterId }]
        };

        let RefundApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 10, Value: req.Data.EncounterId }, { Key: 5, Value: 1 }, { Key: 11, Value: 2 }, { Key: 19, Value: false },
            { Key: 4, Value: [1, 3, 4] },
            ]
        };

        let ReceiptApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 10, Value: req.Data.EncounterId }, { Key: 11, Value: 2 }, { Key: 30, Value: '1,2,3,6,7' }, { Key: 5, Value: 1 }]
        };

        let BillApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 16, Value: req.Data.EncounterId }, { Key: 6, Value: 2 }, { Key: 4, Value: 3 }]
        };

        let PackageApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 6, Value: req.Data.EncounterId },
            { Key: 5, Value: 2 }]
        };

        BillSummary['BillInfo'] = await this.GetPatientBillPackageSummarys(billSummaryApiReq);
        BillSummary['PRFundInfo'] = await PRFundBo.GetPatientRefund(RefundApiReq);
        BillSummary['ReceiptInfo'] = await ReceiptBo.GetPatientPaymentDetails(ReceiptApiReq);
        BillSummary['PackageInfo'] = await PackageBo.GetEncounterIPPackages(PackageApiReq);
        let FinalBills = await BillBo.GetPatientBills(BillApiReq);
        if (FinalBills.Data.length > 0) {
            BillSummary['FinalBillInfo'] = FinalBills.Data[0];
        }
        return BillSummary;
    }

    public async PrintPatientBillPackageSummary(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonMedical) ? req.Data.nonMedical : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.patientBill) ? req.Data.insuranceBill : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillPackageSummaryFilters.EncounterId, Value: req.Id }]
        };
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let encounterIpPackageBo = BoFactory.GetBo(encBo.EncounterIPPackageBo, this.Request);

        let PatientBillPackageSummarys = await this.GetPatientBillPackageSummarys(apiReq);
        let encounterIPPackageApiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id }]
        };
        let EncounterIPPackage = await encounterIpPackageBo.GetEncounterIPPackages(encounterIPPackageApiReq);
        let PatientBillPackageSummary: any = {};
        let PatientBillSummarys: any = [];
        let TotalGrossAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDiscount: number = 0;
        PatientBillPackageSummary = EncounterIPPackage.Data[0];
        PatientBillPackageSummary.TotalNetAmount = 0;
        PatientBillPackageSummary.TotalGrossAmount = 0;
        await Promise.all(PatientBillPackageSummarys.Data.map((SummaryDetails: any): Promise<void> => {
            return (async (SummaryItem): Promise<void> => {
                let summary: any = SummaryItem;
                //TotalNetAmount += parseFloat(SummaryItem.PackageAmount);

                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: SummaryItem.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                if (SummaryItem.ExclusionAmount > 0) {
                    PatientBillSummarys.push(summary);
                    TotalNetAmount += parseFloat(SummaryItem.ExclusionAmount);
                    TotalGrossAmount += parseFloat(SummaryItem.ExclusionAmount);
                }
                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                PatientBillSummarys.sort(custom_sort);
            })(SummaryDetails);
        }));
        PatientBillPackageSummary.TotalNetAmount = PatientBillPackageSummary.PackageAmount + TotalNetAmount;
        TotalNetAmount = PatientBillPackageSummary.TotalNetAmount;
        PatientBillPackageSummary.TotalGrossAmount = PatientBillPackageSummary.PackageAmount + TotalGrossAmount;
        TotalGrossAmount = PatientBillPackageSummary.TotalGrossAmount;
        PatientBillPackageSummary['ExcludedSummary'] = PatientBillSummarys;
        let isFinalized: boolean = req.Data.isFinalized;
        let PatientBills: any = {};
        if (isFinalized) {
            let billReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: 2 }, { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }]
            };
            let BillsBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
            let PatientBillData = await BillsBo.GetPatientBills(billReq);
            PatientBills = PatientBillData.Data[0];
        }
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encBo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let AdvanceAmount: number = 0;
        let ReceiptAmount: number = 0;
        let PaidAmount: number = 0;
        let DueCollect: number = 0;
        let ReceiptDetails = [];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
            { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
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
        let PatientRefundBo = BoFactory.GetBo(billingBO.PatientRefundBo, this.Request);
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

        let InsAdvanceAmount = (PaidAmount - RefundAmount);
        if (InsAdvanceAmount < 0)
            InsAdvanceAmount = 0;

        if (Encounter.EstimatedBillDist && !isFinalized && PatientBills.BillTypeId !== 2) {
            PatientBills.BillDiscount = Encounter.EstimatedBillDist;
            TotalDiscount = Encounter.EstimatedBillDist;
            TotalNetAmount -= Encounter.EstimatedBillDist;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            PatientBillSummary: PatientBillPackageSummary,
            // SplitDetails: SplitDetails,
            PatientBills: PatientBills,
            Encounter: Encounter,
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
            Flags: flags
        };
        let key = 'inpatientpackagebillsummary(i)';
        let pdfOption: any = null;
        {
            if (isFinalized) {
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'inpatientpackagebillsummary';
                }
            }
            if (req.Data.isGuarantor) {
                key = 'InpatientpackagebillsummaryGuarantor(i)';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientpackagebillsummaryGuarantor';
                }
            }
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
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<PatientBillPackageSummaryInstance, PatientBillPackageSummaryAttributes> {
        return this.Models.PatientBillPackageSummary;
    }
}
