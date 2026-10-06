import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientBillSummaryInstance, PatientBillSummaryAttributes } from '../Model/Interface/Index';
import {
    PatientPaymentDetailsFilters, PatientRefundFilters,
    PatientBillSummaryFilters, PatientBillDetailsFilters,
    PatientBillSplitDetailsFilters, PatientBillsFilters
} from '../Common/Filters.e';
import * as bo from '../../Billing/Business/Index';
import * as billingBO from '../../Billing/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { GuarantorFilters } from '../../GeneralMaster/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { join } from 'path';
import * as PatGuarantorBo from '../../Registration/Business/Index';
import * as guarantorBO from '../../GeneralMaster/Business/Index';
import { PatientGuarantorFilters } from '../../Registration/Common/Filters.e';
import moment = require('moment');
import {
    ReferralFilters,
} from '../../GeneralMaster/Common/Filters.e';
import * as _ from 'lodash';

export class PatientBillSummaryBo extends BaseBo<PatientBillSummaryInstance, PatientBillSummaryAttributes> {
    public async AddPatientBillSummary(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    // public async UpdatePatientBillSummary(req: BaseRequest): Promise<boolean> {
    //     let result = await this.Update(req.Data);
    //     return result;
    // }

    public async UpdatePatientBillSummary(req: BaseRequest): Promise<any> {
        let PatientBillDetailsBO = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
        let guarnatortype = req.Data.guarantortype;
        let billDetReq = {
            Id: 0,
            PageContext: { PageSize: 500000, PageNumber: 1 },
            Params: [
                { Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: PatientBillDetailsFilters.FromDate, Value: req.Data.FromDate },
                { Key: PatientBillDetailsFilters.ToDate, Value: req.Data.ToDate },
                { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },
            ]
        };
        let PatBillDetailData = await PatientBillDetailsBO.GetMinPatientBillDetails(billDetReq);
        let BillDetails: any = PatBillDetailData.Data;
        let EncId = 0;
        if (BillDetails && BillDetails.length > 0) {
            EncId = BillDetails[0].EncounterId;
        }
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (!detData.IsSupplementary) {
                    console.log('pharmacy No suppl');
                    if (detData.PatientBillStatusId === 3) {
                        console.log('completed');
                        if (guarnatortype === true) {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                            actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                        } else {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + (parseFloat(detData.DiscountAmount) || 0);
                        }
                        if (!detData.IsPharmacySale || !detData.IsPharmacyReturn) {
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                        }
                    }
                }
                if (detData.IsSupplementary) {
                    console.log('pharmacy suppl');
                    if (detData.PatientBillStatusId === 3) {
                        if (guarnatortype === true) {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                            actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                        } else {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                            // actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + (parseFloat(detData.DiscountAmount) || 0);
                        }
                        if (!detData.IsPharmacySale || !detData.IsPharmacyReturn) {
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                        }
                    }
                }
                // if (detData.PatientBillStatusId === 3) {
                //     Actamt = Actamt + detData.GrossAmount;
                //     ActNetamt = ActNetamt + detData.NetAmount;
                //     Taxamt = Taxamt + detData.GSTAmount || 0;
                //     DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                // }
                // if (detData.PatientBillStatusId === 2) {
                // if (Actamt > 0) {
                //     Actamt = Actamt - detData.GrossAmount;
                //     ActNetamt = ActNetamt - detData.NetAmount;
                //     Taxamt = Taxamt - detData.GSTAmount || 0;
                //     DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                // } else {
                //     Actamt = 0;
                //     ActNetamt = 0;
                //     DiscAmt = 0;
                //     Taxamt = 0;
                //     actualPatamt = 0;
                // }
                // }
            }
            let CatgryId = parseInt(gdx);
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetMinPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            } else if (PatinetBillSummaData.Data.length === 1) {
                let summInfo = PatinetBillSummaData.Data[0];
                // let actualAmt = 0;
                // let actualNetAmt = 0;
                // let actualPatNetAmt = 0;
                // let actualDiscAmt = 0;
                // let actualtaxAmt = 0;
                // for (let sdx in PatinetBillSummaData.Data) {
                //     let summInfo = PatinetBillSummaData.Data[sdx];
                //     actualAmt = actAmt + summInfo.ActualAmount;
                //     actualNetAmt = actnet + summInfo.ActualNetAmount;
                //     actualPatNetAmt = actPatAmt + summInfo.ActualPatAmount;
                //     actualDiscAmt = discamt + summInfo.DiscountAmount;
                //     actualtaxAmt = taxamt + summInfo.TaxAmount;
                let SummData: any = {
                    Id: summInfo.Id,
                    EncounterId: EncId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Update(SummData);
                // }
            } else {
                console.log('More than one entry found');
            }
        }
        return 1;
    }
    public async GetMinPatientBillSummarys(apiReq?: ApiRequest<PatientBillSummaryFilters>):
        Promise<ApiResponse<PatientBillSummaryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillSummaryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.ActualAmount:
                        where['ActualAmount'] = { '$gt': '0' };
                        break;
                    // case PatientBillSummaryFilters.FromDate:
                    //     where['CreatedAt'] = where['CreatedAt'] || {};
                    //     (where['CreatedAt'] as any)['$gte'] = param.Value;
                    //     break;
                    // case PatientBillSummaryFilters.ToDate:
                    //     where['CreatedAt'] = where['CreatedAt'] || {};
                    //     (where['CreatedAt'] as any)['$lte'] = param.Value;
                    //     break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        apiReq.Attributes = ['Id', 'EncounterId', 'ServiceCategoryId',
            'ActualAmount', 'ActualPatAmount', 'ActualNetAmount', 'DiscountAmount', 'TaxAmount'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async UpdateBillSummary(req: BaseRequest): Promise<any> {
        let BillDetails: any = req.Data.lines;
        let guarnatortype = req.Data.guarantortype;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        console.log('Length');
        console.log(groupedData.length);
        let BillInfo: any;
        let encId: any;
        let actAmt: any = 0;
        let actnet: any = 0;
        let discamt: any = 0;
        let taxamt: any = 0;
        let actPatAmt: any = 0;
        for (let gdx in groupedData) {
            actnet = 0;
            discamt = 0;
            taxamt = 0;
            actPatAmt = 0;
            BillInfo = groupedData[gdx];
            let Actamt: any = 0;
            let ActNetamt: any = 0;
            let DiscAmt: any = 0;
            let Taxamt: any = 0;
            let actualPatamt: any = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                encId = detData.EncounterId;
                if (detData.IsPharmacySale || detData.IsPharmacyReturn) {
                    if (!detData.IsSupplementary) {
                        console.log('pharmacy No suppl');
                        if (detData.PatientBillStatusId === 3) {
                            console.log('completed');
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + (parseFloat(detData.DiscountAmount) || 0);
                        }
                        if (detData.PatientBillStatusId === 2) {
                            //console.log('cancelled'); console.log(Actamt); console.log(detData.NetAmount);
                            if (Actamt > 0) {
                                //Actamt = parseFloat(Actamt) - parseFloat(detData.NetAmount);
                                //ActNetamt = parseFloat(ActNetamt) - parseFloat(detData.NetAmount);
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                //DiscAmt = parseFloat(DiscAmt) - (parseFloat(detData.DiscountAmount) || 0);
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                                actualPatamt = 0;
                            }
                        }
                    }
                    if (detData.IsSupplementary) {
                        console.log('pharmacy suppl');
                        if (detData.PatientBillStatusId === 3) {
                            if (guarnatortype === true) {
                                Actamt = Actamt + parseFloat(detData.NetAmount);
                                ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                                actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                                // Taxamt = Taxamt + detData.GSTAmount || 0;
                                DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                            } else {
                                Actamt = Actamt + parseFloat(detData.NetAmount);
                                ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                                // actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                                // Taxamt = Taxamt + detData.GSTAmount || 0;
                                DiscAmt = DiscAmt + (parseFloat(detData.DiscountAmount) || 0);
                            }

                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (actualPatamt > 0) {
                                // Actamt = Actamt - parseFloat(detData.NetAmount);
                                // ActNetamt = ActNetamt - detData.InsNetAmount;
                                // actualPatamt = actualPatamt + detData.PatNetAmount || 0;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                actualPatamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                            }
                        }
                    }
                } else {
                    if (!detData.IsSupplementary) {
                        console.log('No suppl');
                        if (detData.PatientBillStatusId === 3) {
                            if (guarnatortype === true) {
                                Actamt = Actamt + parseFloat(detData.GrossAmount || 0);
                                ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                                actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                                Taxamt = Taxamt + parseFloat(detData.GSTAmount || 0);
                                DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                            } else {
                                Actamt = Actamt + parseFloat(detData.NetAmount);
                                ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                                // actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                                Taxamt = Taxamt + parseFloat(detData.GSTAmount || 0);
                                DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                            }
                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (Actamt > 0) {
                                // Actamt = Actamt - detData.GrossAmount;
                                // ActNetamt = ActNetamt - detData.NetAmount;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                                actualPatamt = 0;
                            }
                        }
                    } else if (detData.IsSupplementary) {
                        console.log(' suppl');
                        if (detData.PatientBillStatusId === 3) {
                            Actamt = Actamt + parseFloat(detData.GrossAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                            actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            Taxamt = Taxamt + parseFloat(detData.GSTAmount || 0);
                            DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (actualPatamt > 0) {
                                // Actamt = Actamt - detData.GrossAmount;
                                // ActNetamt = ActNetamt - detData.InsNetAmount;
                                // actualPatamt = actualPatamt - detData.PatNetAmount || 0;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                actualPatamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                            }
                        }
                    }
                }
            }
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let CatgryId = parseInt(gdx);
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: encId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: encId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actAmt,
                        ActualNetAmount: actnet,
                        ActualPatAmount: actPatAmt,
                        TaxAmount: taxamt,
                        DiscountAmount: discamt,
                    };
                    await this.Update(SummData);
                }
            } else {
                let SummData: any = {
                    Id: 0,
                    EncounterId: encId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }


    public async ManageOrderBillSummary(BillId: number): Promise<any> {
        let PatientBillDetailsBO = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
        let billDetReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientBillDetailsFilters.PatientBillId, Value: BillId },
                { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }
            ]
        };
        let PatBillDetailData = await PatientBillDetailsBO.GetPatientBillDetails(billDetReq);
        let BillDetails: any = PatBillDetailData.Data;
        let EncId = BillDetails[0].EncounterId;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (detData.PatientBillStatusId === 3) {
                    Actamt = Actamt + detData.GrossAmount;
                    ActNetamt = ActNetamt + detData.NetAmount;
                    Taxamt = Taxamt + detData.GSTAmount || 0;
                    DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                }
                if (detData.PatientBillStatusId === 2) {
                    if (Actamt > 0) {
                        // Actamt = Actamt - detData.GrossAmount;
                        // ActNetamt = ActNetamt - detData.NetAmount;
                        // Taxamt = Taxamt - detData.GSTAmount || 0;
                        // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                    } else {
                        Actamt = 0;
                        ActNetamt = 0;
                        DiscAmt = 0;
                        Taxamt = 0;
                        actualPatamt = 0;
                    }
                }
            }
            let CatgryId = parseInt(gdx);
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                let actualAmt = 0;
                let actualNetAmt = 0;
                let actualPatNetAmt = 0;
                let actualDiscAmt = 0;
                let actualtaxAmt = 0;
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    actualAmt = actAmt + summInfo.ActualAmount;
                    actualNetAmt = actnet + summInfo.ActualNetAmount;
                    actualPatNetAmt = actPatAmt + summInfo.ActualPatAmount;
                    actualDiscAmt = discamt + summInfo.DiscountAmount;
                    actualtaxAmt = taxamt + summInfo.TaxAmount;
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actualAmt,
                        ActualNetAmount: actualNetAmt,
                        ActualPatAmount: actualPatNetAmt,
                        TaxAmount: actualtaxAmt,
                        DiscountAmount: actualDiscAmt,
                    };
                    await this.Update(SummData);
                }
            }
            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }

    public async ManageUpdateRateBillSummary(IsPatientTransfer: boolean,
        EncounterId: number, details: any[]): Promise<any> {
        let BillDetails: any = details;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (detData.PatientBillStatusId === 3) {
                    Actamt = Actamt + detData.GrossAmount;
                    ActNetamt = ActNetamt + detData.NetAmount;
                    Taxamt = Taxamt + detData.GSTAmount || 0;
                    DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                }
                if (detData.PatientBillStatusId === 2) {
                    if (Actamt > 0) {
                        // Actamt = Actamt - detData.GrossAmount;
                        // ActNetamt = ActNetamt - detData.NetAmount;
                        // Taxamt = Taxamt - detData.GSTAmount || 0;
                        // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                    } else {
                        Actamt = 0;
                        ActNetamt = 0;
                        DiscAmt = 0;
                        Taxamt = 0;
                        actualPatamt = 0;
                    }
                }
            }
            let CatgryId = parseInt(gdx);
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    // actualAmt = actAmt + summInfo.ActualAmount;
                    // actualNetAmt = actnet + summInfo.ActualNetAmount;
                    // actualPatNetAmt = actPatAmt + summInfo.ActualPatAmount;
                    // actualDiscAmt = discamt + summInfo.DiscountAmount;
                    // actualtaxAmt = taxamt + summInfo.TaxAmount;
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncounterId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actAmt,
                        ActualNetAmount: actnet,
                        ActualPatAmount: actPatAmt,
                        TaxAmount: taxamt,
                        DiscountAmount: discamt,
                    };
                    await this.Update(SummData);
                }
            }
            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncounterId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }

    public async ManagePatBillSummary(IsPatientTransfer: boolean,
        EncounterId: number, details: any[]): Promise<any> {
        let BillDetails: any = details;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (detData.IsPharmacySale || detData.IsPharmacyReturn) {
                    if (!detData.IsSupplementary) {
                        if (detData.PatientBillStatusId === 3) {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + detData.NetAmount;
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (Actamt > 0) {
                                // Actamt = Actamt - parseFloat(detData.NetAmount);
                                // ActNetamt = ActNetamt - detData.NetAmount;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                                actualPatamt = 0;
                            }
                        }
                    } else if (detData.IsSupplementary) {
                        console.log('pharmacy suppl');
                        if (detData.PatientBillStatusId === 3) {
                            // if (guarnatortype === true) {
                            Actamt = Actamt + parseFloat(detData.NetAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                            actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            // Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                            // } else {
                            //     Actamt = Actamt + parseFloat(detData.NetAmount);
                            //     ActNetamt = ActNetamt + parseFloat(detData.NetAmount);
                            //     // actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            //     // Taxamt = Taxamt + detData.GSTAmount || 0;
                            //     DiscAmt = DiscAmt + (parseFloat(detData.DiscountAmount) || 0);
                            // }

                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (actualPatamt > 0) {
                                // Actamt = Actamt - parseFloat(detData.NetAmount);
                                // ActNetamt = ActNetamt - detData.InsNetAmount;
                                // actualPatamt = actualPatamt + detData.PatNetAmount || 0;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                actualPatamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                            }
                        }
                    }
                } else {
                    if (!detData.IsSupplementary) {
                        if (detData.PatientBillStatusId === 3) {
                            Actamt = Actamt + detData.GrossAmount;
                            ActNetamt = ActNetamt + detData.NetAmount;
                            Taxamt = Taxamt + detData.GSTAmount || 0;
                            DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (Actamt > 0) {
                                // Actamt = Actamt - detData.GrossAmount;
                                // ActNetamt = ActNetamt - detData.NetAmount;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                                actualPatamt = 0;
                            }
                        }
                    } else if (detData.IsSupplementary) {
                        console.log(' suppl');
                        if (detData.PatientBillStatusId === 3) {
                            Actamt = Actamt + parseFloat(detData.GrossAmount);
                            ActNetamt = ActNetamt + parseFloat(detData.InsNetAmount || 0);
                            actualPatamt = actualPatamt + parseFloat(detData.PatNetAmount || 0);
                            Taxamt = Taxamt + parseFloat(detData.GSTAmount || 0);
                            DiscAmt = DiscAmt + parseFloat(detData.DiscountAmount || 0);
                        }
                        if (detData.PatientBillStatusId === 2) {
                            if (actualPatamt > 0) {
                                // Actamt = Actamt - detData.GrossAmount;
                                // ActNetamt = ActNetamt - detData.InsNetAmount;
                                // actualPatamt = actualPatamt - detData.PatNetAmount || 0;
                                // Taxamt = Taxamt - detData.GSTAmount || 0;
                                // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                            } else {
                                Actamt = 0;
                                ActNetamt = 0;
                                actualPatamt = 0;
                                DiscAmt = 0;
                                Taxamt = 0;
                            }
                        }
                    }
                }
            }
            let CatgryId = parseInt(gdx);
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                let actualAmt = 0;
                let actualNetAmt = 0;
                let actualPatNetAmt = 0;
                let actualDiscAmt = 0;
                let actualtaxAmt = 0;
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    actualAmt = actAmt + summInfo.ActualAmount;
                    actualNetAmt = actnet + summInfo.ActualNetAmount;
                    actualPatNetAmt = actPatAmt + summInfo.ActualPatAmount;
                    actualDiscAmt = discamt + summInfo.DiscountAmount;
                    actualtaxAmt = taxamt + summInfo.TaxAmount;
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncounterId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actualAmt,
                        ActualNetAmount: actualNetAmt,
                        ActualPatAmount: actualPatNetAmt,
                        TaxAmount: actualtaxAmt,
                        DiscountAmount: actualDiscAmt,
                    };
                    await this.Update(SummData);
                }
            }
            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncounterId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }

    public async ManageReturnBillSummary(EncounterId: number, details: any[]): Promise<any> {
        let BillDetails: any = details;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in BillInfo) {
                let detData: any = {};
                detData = BillInfo[sx];
                if (detData.PatientBillStatusId === 3) {
                    Actamt = Actamt + parseFloat(detData.NetAmount);
                    ActNetamt = ActNetamt + detData.NetAmount;
                    // Taxamt = Taxamt + detData.GSTAmount || 0;
                    DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                }
                if (detData.PatientBillStatusId === 2) {
                    if (Actamt > 0) {
                        // Actamt = Actamt - parseFloat(detData.NetAmount);
                        // ActNetamt = ActNetamt - detData.NetAmount;
                        // // Taxamt = Taxamt - detData.GSTAmount || 0;
                        // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                    } else {
                        Actamt = 0;
                        ActNetamt = 0;
                        DiscAmt = 0;
                        Taxamt = 0;
                        actualPatamt = 0;
                    }
                }

            }
            let CatgryId = parseInt(gdx);
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                let actualAmt = 0;
                let actualNetAmt = 0;
                let actualPatNetAmt = 0;
                let actualDiscAmt = 0;
                let actualtaxAmt = 0;
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    actualAmt = actAmt + summInfo.ActualAmount;
                    actualNetAmt = actnet + summInfo.ActualNetAmount;
                    actualPatNetAmt = actPatAmt + summInfo.ActualPatAmount;
                    actualDiscAmt = discamt + summInfo.DiscountAmount;
                    actualtaxAmt = taxamt + summInfo.TaxAmount;
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncounterId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actualAmt,
                        ActualNetAmount: actualNetAmt,
                        ActualPatAmount: actualPatNetAmt,
                        TaxAmount: actualtaxAmt,
                        DiscountAmount: actualDiscAmt,
                    };
                    await this.Update(SummData);
                }
            }
            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncounterId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }

    public async ManageAutoPatBillSummary(EncounterId: number, details: any[]): Promise<any> {
        let BillDetails: any = details;
        let groupedData = _.groupBy(BillDetails, 'ServiceCategoryId');
        let BillInfo: any;
        let actAmt = 0;
        let actnet = 0;
        let discamt = 0;
        let taxamt = 0;
        let actPatAmt = 0;
        for (let gdx in groupedData) {
            BillInfo = groupedData[gdx];
            let CatgryId = parseInt(gdx);
            let PatientBillDetailsBO = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
            let billDetReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillDetailsFilters.EncounterId, Value: EncounterId },
                    { Key: PatientBillDetailsFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatBillDetailData = await PatientBillDetailsBO.GetPatientBillDetails(billDetReq);

            let Actamt = 0;
            let ActNetamt = 0;
            let DiscAmt = 0;
            let Taxamt = 0;
            let actualPatamt = 0;
            for (let sx in PatBillDetailData.Data) {
                let detData: any = {};
                detData = PatBillDetailData.Data[sx];
                if (detData.IsPharmacySale || detData.IsPharmacyReturn) {
                    if (detData.PatientBillStatusId === 3) {
                        Actamt = Actamt + parseFloat(detData.NetAmount);
                        ActNetamt = ActNetamt + detData.NetAmount;
                        // Taxamt = Taxamt + detData.GSTAmount || 0;
                        DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                    }
                    if (detData.PatientBillStatusId === 2) {
                        if (Actamt > 0) {
                            // Actamt = Actamt - parseFloat(detData.NetAmount);
                            // ActNetamt = ActNetamt - detData.NetAmount;
                            // // Taxamt = Taxamt - detData.GSTAmount || 0;
                            // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                        } else {
                            Actamt = 0;
                            ActNetamt = 0;
                            DiscAmt = 0;
                            Taxamt = 0;
                            actualPatamt = 0;
                        }
                    }
                } else {
                    if (detData.PatientBillStatusId === 3) {
                        Actamt = Actamt + detData.GrossAmount;
                        ActNetamt = ActNetamt + detData.NetAmount;
                        Taxamt = Taxamt + detData.GSTAmount || 0;
                        DiscAmt = DiscAmt + detData.DiscountAmount || 0;
                    }
                    if (detData.PatientBillStatusId === 2) {
                        if (Actamt > 0) {
                            // Actamt = Actamt - detData.GrossAmount;
                            // ActNetamt = ActNetamt - detData.NetAmount;
                            // Taxamt = Taxamt - detData.GSTAmount || 0;
                            // DiscAmt = DiscAmt - detData.DiscountAmount || 0;
                        } else {
                            Actamt = 0;
                            ActNetamt = 0;
                            DiscAmt = 0;
                            Taxamt = 0;
                            actualPatamt = 0;
                        }
                    }
                }
            }
            actAmt = Actamt;
            actnet = ActNetamt;
            discamt = DiscAmt;
            taxamt = Taxamt;
            actPatAmt = actualPatamt;
            let billSummReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId },
                    { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: CatgryId }
                ]
            };
            let PatinetBillSummaData = await this.GetPatientBillSummarys(billSummReq);

            if (PatinetBillSummaData.Data.length > 0) {
                for (let sdx in PatinetBillSummaData.Data) {
                    let summInfo = PatinetBillSummaData.Data[sdx];
                    let SummData: any = {
                        Id: summInfo.Id,
                        EncounterId: EncounterId,
                        ServiceCategoryId: summInfo.ServiceCategoryId,
                        ActualAmount: actAmt,
                        ActualNetAmount: actnet,
                        ActualPatAmount: actPatAmt,
                        TaxAmount: taxamt,
                        DiscountAmount: discamt,
                    };
                    await this.Update(SummData);
                }
            }
            if (PatinetBillSummaData.Data.length === 0) {
                let SummData: any = {
                    Id: 0,
                    EncounterId: EncounterId,
                    ServiceCategoryId: CatgryId,
                    ActualAmount: actAmt,
                    ActualNetAmount: actnet,
                    ActualPatAmount: actPatAmt,
                    TaxAmount: taxamt,
                    DiscountAmount: discamt,
                };
                await this.Save(SummData);
            }
        }
        return 1;
    }
    public async ManagePatientBillSummary(EncounterId: number, details: PatientBillSummaryAttributes[]):
        Promise<boolean> {
        details = details || [];
        // let billsplitBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        // let summaryApiReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 10000, PageNumber: 1 },
        //     Params: [{ Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId }]
        // };
        // let billsummarys = await this.GetPatientBillSummarys(summaryApiReq);
        // await Promise.all(billsummarys.Data.map((billsummaryItem): Promise<void> => {
        //     return (async (summary): Promise<void> => {
        //         await billsplitBo.DeleteSplitDetails(summary.Id);
        //         await this.DeleteById(summary);
        //     })(billsummaryItem);
        // }));

        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (d): Promise<void> => {
                let detail: any = d;
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let ServiceCategory = await servicecategoryBo.GetServiceCategoryById({ Id: detail.ServiceCategoryId });
                    detail.DisplayOrder = ServiceCategory.DisplayOrder;
                    let billSummaryId = await this.GetExistsBillSummary({
                        where: {
                            EncounterId: detail.EncounterId,
                            ServiceCategoryId: detail.ServiceCategoryId
                        },
                        attributes: ['Id']
                    });
                    if (billSummaryId === -1) {
                        let saveResult = await this.Save(detail);
                        billSummaryId = saveResult.dataValues.Id;
                    }
                    // let billsplitdetails: any = [];
                    // billsplitdetails = detail['PatientBillSplit'];
                    // await billsplitBo.ManagePatientBillSplitDetails(billSummaryId, billsplitdetails);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    // let billsplitdetails: any = [];
                    // billsplitdetails = detail['PatientBillSplit'];
                    // await billsplitBo.ManagePatientBillSplitDetails(detail.Id, billsplitdetails);
                }
            })(detailItem);
        }));
        return true;
    }


    public async ModifiedPatientBillSummary(EncounterId: number,
        details: PatientBillSummaryAttributes[]):
        Promise<boolean> {
        let billsplitBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    if (detail.ServiceCategoryId) {
                        let ServiceCategory = await
                            servicecategoryBo.GetServiceCategoryById({ Id: detail.ServiceCategoryId });
                        if (ServiceCategory && ServiceCategory.DisplayOrder)
                            detail.DisplayOrder = ServiceCategory.DisplayOrder;
                        else detail.DisplayOrder = 0;
                    } else detail.DisplayOrder = 0;
                    let billSummaryId = await this.GetExistsBillSummary({
                        where: {
                            EncounterId: detail.EncounterId,
                            ServiceCategoryId: detail.ServiceCategoryId
                        },
                        attributes: ['Id']
                    });
                    if (billSummaryId === -1) {
                        let saveResult = await this.Save(detail);
                        billSummaryId = saveResult.dataValues.Id;
                    }
                    let billsplitdetails: any = [];
                    billsplitdetails = detail['ModifiedPatientBillCategoryDetails'];
                    await billsplitBo.ModifiedPatientBillSplitDetails(billSummaryId, billsplitdetails);
                } else if (detail.Id > 0) {
                    let billSummaryId = await this.GetExistsBillSummary({
                        where: {
                            EncounterId: detail.EncounterId,
                            ServiceCategoryId: detail.ServiceCategoryId
                        },
                        attributes: ['Id']
                    });
                    let billsplitdetails: any = [];
                    billsplitdetails = detail['ModifiedPatientBillCategoryDetails'];
                    await billsplitBo.ModifiedPatientBillSplitDetails(billSummaryId, billsplitdetails);
                }
            })(DetailItem);
        }));

        await this.UpdateModifiedCategoryDetails(EncounterId);

        return true;
    }

    public async UpdateModifiedCategoryDetails(EncounterId: number): Promise<boolean> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [
                { Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId }
            ]
        };
        let billsplitBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
        let SummaryData = await this.GetPatientBillSummarys(apiReq);
        await Promise.all(SummaryData.Data.map((SummaryItem): Promise<void> => {
            return (async (PatientSummary): Promise<void> => {
                let PatientSummaryId: any = PatientSummary.Id;
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 10000, PageNumber: 1 },
                    Params: [
                        { Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: PatientSummaryId }
                    ]
                };
                let ActualAmount = 0;
                let SplitDetailsData = await billsplitBo.GetPatientBillSplitDetails(apiReq);
                await Promise.all(SplitDetailsData.Data.map((SplitItem): Promise<void> => {
                    return (async (splitdetail): Promise<void> => {
                        ActualAmount += ((splitdetail.ItemAmount || 0) + (splitdetail.SplitItemAmount || 0));
                    })(SplitItem);
                }));
                let patientsummaryreq: any = {
                    Id: PatientSummaryId,
                    ActualAmount: ActualAmount,
                };
                await this.Update(patientsummaryreq);

            })(SummaryItem);
        }));
        return true;
    }

    public async GetPatientBillSummaryById(req: BaseRequest): Promise<PatientBillSummaryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientBillSummarys(apiReq?: ApiRequest<PatientBillSummaryFilters>):
        Promise<ApiResponse<PatientBillSummaryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.PatientBillSplitDetails, required: false,
            include: [{ model: this.Models.PatientBillDetails, required: false }],
        });
        include.push({
            model: this.Models.ServiceCategory,
            attributes: ['Id', 'ServiceCategoryCode', 'ServiceCategoryName', 'DisplayOrder', 'PrintOrder', 'FacilityId'],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillSummaryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillSummaryFilters.NotInServiceCategoryId:
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
                    case PatientBillSummaryFilters.ActualAmount:
                        where['ActualAmount'] = { '$gt': '0' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetExistsBillSummary(foption: SStatic.FindOptions<any>): Promise<number> {
        let billSummaryId: number = -1;
        let billSummaryInstance: any = await this.Find(foption);
        if (billSummaryInstance) {
            let billSummary = this.GetAttribute(billSummaryInstance);
            billSummaryId = billSummary.Id;
        } return billSummaryId;
    }

    public async GetPatientBillSummaryDetails(req: BaseRequest): Promise<any> {
        let BillSummary: any = {};
        let PRFundBo = BoFactory.GetBo(billingBO.PatientRefundBo, this.Request);
        let ReceiptBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
        let BillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
        let encType = 2;
        if (req.Data.IsDayCare) {
            encType = 5;
        }
        let billSummaryApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillSummaryFilters.EncounterId, Value: req.Data.EncounterId }]
        };

        let RefundApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 10, Value: req.Data.EncounterId },
            // { Key: 4, Value: [1, 3, 4] },
            { Key: 4, Value: [1, 2, 3, 4] },
            { Key: 5, Value: 1 },
            { Key: 11, Value: encType },
            { Key: 19, Value: false }]
        };

        let ReceiptApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [
                { Key: 10, Value: req.Data.EncounterId },
                { Key: 11, Value: encType },
                { Key: 30, Value: '1,2,3,7' },//included 7 pharmacy advance on 6/6/2024
                { Key: 5, Value: 1 }
            ]
        };

        let AdjustmentApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 10, Value: req.Data.EncounterId }, { Key: 4, Value: 6 }, { Key: 5, Value: 1 }]
        };

        let BillApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 16, Value: req.Data.EncounterId }, { Key: 6, Value: 2 }, { Key: 4, Value: 3 }]
        };

        BillSummary['BillInfo'] = await this.GetPatientBillSummarys(billSummaryApiReq);
        BillSummary['PRFundInfo'] = await PRFundBo.GetPatientRefund(RefundApiReq);
        BillSummary['ReceiptInfo'] = await ReceiptBo.GetPatientPaymentDetails(ReceiptApiReq);
        BillSummary['AdjustmentInfo'] = await ReceiptBo.GetPatientPaymentDetails(AdjustmentApiReq);
        let FinalBills = await BillBo.GetMinPatientBills(BillApiReq);
        if (FinalBills.Data.length > 0) {
            BillSummary['FinalBillInfo'] = FinalBills.Data[0];
        }
        return BillSummary;
    }

    public async DeletePatientBillSummary(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientBillSummary(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonMedical) ? req.Data.nonMedical : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.insuranceBill) ? req.Data.insuranceBill : 0,
            bothBill: (req.Data.bothBill) ? req.Data.bothBill : 0,
            drugBill: (req.Data.drugBill) ? req.Data.drugBill : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillSummaryFilters.EncounterId, Value: req.Id },
                { Key: PatientBillSummaryFilters.NotInServiceCategoryId, Value: [0] },
            ]
        };
        let TotalMOUDisc = req.Data.MOUDisc;
        if (req.Data.drugBill === true) {
            apiReq.Params.push({ Key: PatientBillSummaryFilters.NotInServiceCategoryId, Value: [19, 20, 21, 22, 23, 24, 25, 26] });
        }
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let PatientBillSummary = await this.GetPatientBillSummarys(apiReq);
        let PatientBillSummarys: any = [];
        let TotalGrossAmount: number = 0;
        let TotalGstAmount: number = 0;
        let TotalNetAmount: number = 0;
        let RoundOffValue: number = 0;
        let TotalNetAmountWithoutDiscount: number = 0;
        let TotalDiscount: number = 0;
        let GstAmount = 0;
        await Promise.all(PatientBillSummary.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                // let PatientBillSplitDetailsBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
                // let splitReq = {
                //     Id: 0,
                //     PageContext: { PageSize: -1, PageNumber: 1 },
                //     Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: bill.Id }]
                // };
                // let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetPatientBillSplitDetails(splitReq);
                summary.ItemAmount = 0;
                summary.DiscountAmount = 0;
                summary.NetAmount = 0;
                // BillSplitDetailsData.Data.forEach((Detail) => {
                TotalGrossAmount += bill.ActualAmount;
                TotalGstAmount += bill.TaxAmount;
                TotalDiscount += bill.DiscountAmount;
                // if (Detail.AgreementDiscountAmt > 0) {
                //     TotMouDisc += Detail.AgreementDiscountAmt;
                // }
                TotalNetAmount += (bill.ActualAmount - bill.DiscountAmount);
                // TotalNetAmountWithoutDiscount += Detail.ItemAmount + Detail.ItemDiscount;
                if (req.Data.nonmedical) {
                    summary.ItemAmount += (bill.ActualNetAmount + bill.ActualPatAmount);
                } else {
                    summary.ItemAmount += (bill.ActualNetAmount);
                }

                //     summary.DiscountAmount += Detail.ItemDiscount;
                //     let NetAmount: number = 0;
                //     NetAmount = Detail.ItemAmount - Detail.ItemDiscount;
                //     summary.NetAmount += NetAmount;

                // });
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                summary.ConsDetails = [];
                if (req.Data.consultDetailsLoad && bill.ServiceCategoryId === 6) {
                    summary.ConsDetails = summary.PatientBillSplitDetails;
                }
                if (summary.ActualAmount > 0) {
                    PatientBillSummarys.push(summary);
                }
                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.ServiceCategory.DisplayOrder) - parseInt(b.ServiceCategory.DisplayOrder);
                };
                PatientBillSummarys.sort(custom_sort);
            })(splitItem);
        }));
        // Pharmacy Split
        let drugReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillSummaryFilters.EncounterId, Value: req.Id },
                { Key: PatientBillSummaryFilters.ServiceCategoryId, Value: [19, 20, 21, 22, 23, 24, 25, 26] },
            ]
        };
        let PatientPharmacyBillSummary = await this.GetPatientBillSummarys(drugReq);
        let PatientPharmacyBillSummarys: any = [];
        let TotalDrugGrossAmount: number = 0;
        let TotalDrugGstAmount: number = 0;
        let TotalDrugNetAmount: number = 0;
        let DrugRoundOffValue: number = 0;
        let TotalDrugNetAmountWithoutDiscount: number = 0;
        let TotalDrugDiscount: number = 0;
        let DrugGstAmount = 0;
        await Promise.all(PatientPharmacyBillSummary.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                summary.ItemAmount = 0;
                summary.DiscountAmount = 0;
                summary.NetAmount = 0;
                TotalDrugGrossAmount += bill.ActualAmount;
                TotalDrugGstAmount += bill.TaxAmount;
                TotalDrugDiscount += bill.DiscountAmount;
                TotalDrugNetAmount += (bill.ActualAmount - bill.DiscountAmount);
                summary.ItemAmount += (bill.ActualNetAmount + bill.ActualPatAmount);
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                summary.ConsDetails = [];
                if (req.Data.consultDetailsLoad && bill.ServiceCategoryId === 6) {
                    summary.ConsDetails = summary.PatientBillSplitDetails;
                }
                PatientPharmacyBillSummarys.push(summary);
                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.ServiceCategory.DisplayOrder) - parseInt(b.ServiceCategory.DisplayOrder);
                };
                PatientPharmacyBillSummarys.sort(custom_sort);
            })(splitItem);
        }));
        let isFinalized: boolean = req.Data.isFinalized;
        let PatientBills: any = {};
        let FinalPaymentDetail: any = {};
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
            let billpayReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
                { Key: PatientPaymentDetailsFilters.PatientBillId, Value: PatientBills.Id }]
            };
            let BillPaymentBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
            let PatientPaymentDetailsData = await BillPaymentBo.GetPatientPaymentDetails(billpayReq);
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
        let patientData: any = {};
        patientData = await patientBo.GetPatientById({ Id: Encounter.PatientId });
        let Age = '';
        if (patientData.Age === 0) {
            let diffDuration = moment.duration(moment().diff(patientData.DOB));
            let ageresult = '';
            let years = diffDuration.years();
            let months = diffDuration.months();
            let days = diffDuration.days();
            if (years > 0) {
                ageresult = diffDuration.years() + 'y ';
            } else if (years === 0) {
                if (months > 0) {
                    ageresult += diffDuration.months() + 'M ';
                }
                if (days > 0) {
                    ageresult += diffDuration.days() + 'D ';
                }
            }
            Age = ageresult;
        } else if (patientData.Age > 0) {
            Age = patientData.Age + 'y';
        }
        let ReferralId = 0;
        if (PatientBills.ReferralId) {
            ReferralId = PatientBills.ReferralId;
        }
        if (patientData.ReferrerId) {
            ReferralId = patientData.ReferrerId;
        }
        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: ReferralId }]
        };
        let ReferralBo = BoFactory.GetBo(guarantorBO.ReferralBo, this.Request);
        let ReferralsData = await ReferralBo.GetReferrals(ReferralsReq);
        let AdvanceAmount: number = 0;
        let ReceiptAmount: number = 0;
        let PaidAmount: number = 0;
        let ActualPaidAmt: number = 0;
        let Adjustment: number = 0;
        let NonPharmacyPaidAmount: number = 0;
        let DueCollect: number = 0;
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let DrugAdvAmount: number = 0;
        let ReceiptDetails = [];
        let NonPharmacyReceiptDetails = [];
        let PharmacyReceiptDetails = [];
        let ReceiptItem: any = {};
        let RefundItem: any = {};
        let PatientRefundInfo: any;
        let encType: any;
        if (Encounter.IsDayCare) {
            encType = 5;
        } else {
            encType = 2;
        }
        if (req.Data.PrintCode === 'prakriya') {
            if (Encounter.GuarantorTypeId === 1 || (Encounter.GuarantorTypeId > 1 && isFinalized)) {
                let detailReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
                    { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: encType },
                    { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
                    { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
                    { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
                };
                let PatientPaymentDetailsBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
                let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
                for (var idx in PatientPaymentDetailsData.Data) {
                    ReceiptItem = PatientPaymentDetailsData.Data[idx];
                    if ((PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 1
                        || PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 6)
                        && PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                        AdvanceAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
                    }
                    if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 2 &&
                        PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                        ReceiptAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
                    }
                    if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                        ActualPaidAmt += PatientPaymentDetailsData.Data[idx].AmountPaid;
                    }
                    if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 6) {
                        Adjustment += PatientPaymentDetailsData.Data[idx].AmountPaid;
                    }
                    if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 3)
                        DueCollect += PatientPaymentDetailsData.Data[idx].AmountPaid;
                    ReceiptDetails.push(ReceiptItem);
                }
                PaidAmount = Math.round(ActualPaidAmt) - Math.round(Adjustment);
                let refundReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Id },
                    { Key: PatientRefundFilters.RefundStatus, Value: 1 },
                    { Key: PatientRefundFilters.EncounterTypeId, Value: encType },
                    { Key: PatientRefundFilters.IsCashToCredit, Value: false }]
                };

                let RefundDetails = [];
                let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
                let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
                PatientRefundInfo = PatientRefundData.Data;

                for (var idx1 in PatientRefundData.Data) {
                    RefundItem = PatientRefundData.Data[idx1];
                    if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                        RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
                    }
                    if (PatientRefundData.Data[idx1].RefundTypeId === 1 || PatientRefundData.Data[idx1].RefundTypeId === 4)
                        PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
                    RefundDetails.push(RefundItem);
                }
            }
        }
        if (req.Data.PrintCode !== 'prakriya') {
            let detailReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
                { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: encType },
                { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
                { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
                { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
            };
            let PatientPaymentDetailsBo = BoFactory.GetBo(billingBO.PatientPaymentDetailsBo, this.Request);
            let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
            for (var idx2 in PatientPaymentDetailsData.Data) {
                ReceiptItem = PatientPaymentDetailsData.Data[idx2];
                if ((PatientPaymentDetailsData.Data[idx2].ReceiptTypeId === 1
                    || PatientPaymentDetailsData.Data[idx2].ReceiptTypeId === 6)
                    && PatientPaymentDetailsData.Data[idx2].ReceiptStatusId === 1) {
                    AdvanceAmount += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                }
                if (PatientPaymentDetailsData.Data[idx2].ReceiptTypeId === 2 &&
                    PatientPaymentDetailsData.Data[idx2].ReceiptStatusId === 1) {
                    ReceiptAmount += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                }
                if (PatientPaymentDetailsData.Data[idx2].ReceiptTypeId === 7) {
                    DrugAdvAmount += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                }
                if (PatientPaymentDetailsData.Data[idx2].ReceiptStatusId === 1) {
                    PaidAmount += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                }
                if (PatientPaymentDetailsData.Data[idx2].ReceiptStatusId === 1 &&
                    PatientPaymentDetailsData.Data[idx2].ReceiptTypeId !== 7) {
                    NonPharmacyPaidAmount += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                }
                if (PatientPaymentDetailsData.Data[idx2].ReceiptTypeId === 3)
                    DueCollect += PatientPaymentDetailsData.Data[idx2].AmountPaid;
                ReceiptDetails.push(ReceiptItem);
            }
            for (var idx4 in PatientPaymentDetailsData.Data) {
                ReceiptItem = PatientPaymentDetailsData.Data[idx4];
                if (PatientPaymentDetailsData.Data[idx4].ReceiptTypeId !== 7) {
                    NonPharmacyReceiptDetails.push(ReceiptItem);
                }
            }
            for (var idx5 in PatientPaymentDetailsData.Data) {
                ReceiptItem = PatientPaymentDetailsData.Data[idx5];
                if (PatientPaymentDetailsData.Data[idx5].ReceiptTypeId === 7) {
                    PharmacyReceiptDetails.push(ReceiptItem);
                }
            }
            let refundReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Id },
                { Key: PatientRefundFilters.RefundStatus, Value: 1 },
                { Key: PatientRefundFilters.EncounterTypeId, Value: encType },
                { Key: PatientRefundFilters.IsCashToCredit, Value: false }]
            };

            let RefundDetails = [];
            let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
            let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
            PatientRefundInfo = PatientRefundData.Data;

            for (var idx3 in PatientRefundData.Data) {
                RefundItem = PatientRefundData.Data[idx3];
                if (PatientRefundData.Data[idx3].RefundStatusId === 1) {
                    RefundAmount += PatientRefundData.Data[idx3].RefundAmount;
                }
                if (PatientRefundData.Data[idx3].RefundTypeId === 1 || PatientRefundData.Data[idx3].RefundTypeId === 4)
                    PartialRefundAmount += PatientRefundData.Data[idx3].RefundAmount;
                RefundDetails.push(RefundItem);
            }

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

        // let GuarantorId = Encounter.GuarantorId;
        let GuarantorId = Encounter.GuarantorId;
        let GuarantorTypeId = Encounter.GuarantorTypeId;
        let GuarantorReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GuarantorFilters.Id, Value: GuarantorId }]
        };
        let GuarantorBo = BoFactory.GetBo(guarantorBO.GuarantorBo, this.Request);
        let GuarantorData = await GuarantorBo.GetGuarantors(GuarantorReq);
        let Guarantor = GuarantorData.Data[0];
        let PatientGuarantorReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientGuarantorFilters.GuarantorId, Value: GuarantorId },
            { Key: PatientGuarantorFilters.PatientId, Value: Encounter.PatientId }]
        };
        let PatientGuarantorBo = BoFactory.GetBo(PatGuarantorBo.PatientGuarantorBo, this.Request);
        let PatientGuarantorData = await PatientGuarantorBo.GetPatientGuarantors(PatientGuarantorReq);
        let PatientGuarantor = PatientGuarantorData.Data[0];
        let GuarantorApprovedAmount: number = 0;
        let NetAmountAfterGuarantorApprovedAmount: number = 0;
        let BalanceAmountAfterGuarantorApprovedAmount: number = 0;
        GuarantorApprovedAmount = Guarantor.CreditLimit;
        NetAmountAfterGuarantorApprovedAmount = TotalNetAmountWithoutDiscount - GuarantorApprovedAmount;
        BalanceAmountAfterGuarantorApprovedAmount = (NetAmountAfterGuarantorApprovedAmount - PaidAmount) + PartialRefundAmount;
        let AdmissionFormattedDate = '';
        let DischargeFormattedDate = '';
        let dateformat = 'DD/MM/YYYY HH:mm';
        if (Encounter.AdmissionDate) {
            AdmissionFormattedDate = moment(Encounter.AdmissionDate).format(dateformat);
        }
        if (Encounter.DischargeDate) {
            DischargeFormattedDate = moment(Encounter.DischargeDate).format(dateformat);
        }
        if (PatientBills.RoundOffValue) {
            RoundOffValue = PatientBills.RoundOffValue;
        } else {
            RoundOffValue = 0;
        }
        let BalanceAmount: number = 0;
        let NonPharmacyBalanceAmount: number = 0;
        let PharmacyBalanceAmount: number = 0;
        if (!isFinalized) {
            TotalNetAmount = Math.round(TotalNetAmount) + Math.round(TotalGstAmount);
            TotalDrugNetAmount = Math.round(TotalDrugNetAmount) + Math.round(TotalDrugGstAmount);
            if (GuarantorTypeId === 1) {
                BalanceAmount = ((TotalNetAmount) - PaidAmount) + PartialRefundAmount;
                NonPharmacyBalanceAmount = ((TotalNetAmount) - NonPharmacyPaidAmount) + PartialRefundAmount;
                PharmacyBalanceAmount = ((TotalDrugNetAmount) - DrugAdvAmount) + PartialRefundAmount;
            } else {
                BalanceAmount = ((TotalNetAmount - req.Data.NetInsuranceAmount) - PaidAmount) + PartialRefundAmount;
                NonPharmacyBalanceAmount = ((TotalNetAmount) - NonPharmacyPaidAmount) + PartialRefundAmount;
                PharmacyBalanceAmount = ((TotalDrugNetAmount) - DrugAdvAmount) + PartialRefundAmount;
            }
        }
        let QrInfo: any;
        let InsNetAmount: number = 0;
        if (isFinalized) {
            TotalNetAmount = Math.round(TotalGrossAmount - PatientBills.BillDiscount);
            if (PatientBills.GuarantorTypeId === 1) {
                BalanceAmount = ((TotalNetAmount) - PaidAmount) + PartialRefundAmount;
                NonPharmacyBalanceAmount = ((TotalNetAmount) - NonPharmacyPaidAmount) + PartialRefundAmount;
                PharmacyBalanceAmount = ((TotalDrugNetAmount) - DrugAdvAmount) + PartialRefundAmount;
            } else {
                BalanceAmount = ((TotalNetAmount - req.Data.NetInsuranceAmount) - PaidAmount) + PartialRefundAmount;
                NonPharmacyBalanceAmount = ((TotalNetAmount) - NonPharmacyPaidAmount) + PartialRefundAmount;
                PharmacyBalanceAmount = ((TotalDrugNetAmount) - DrugAdvAmount) + PartialRefundAmount;
                InsNetAmount = Math.round(TotalNetAmount - PatientBills.CreditApproved || 0);
            }

            let PatName: '';
            let FacInfo: '';
            if (patientData.Title) {
                PatName = patientData.Title.Description;
            }
            if (patientData.FirstName) {
                PatName += ' ' + patientData.FirstName;
            }
            if (patientData.LastName) {
                PatName += ' ' + patientData.LastName;
            }
            if (PatientBills.Facility) {
                FacInfo = PatientBills.Facility.FacilityName;
            }
            if (PatientBills.Facility.AddressLine1) {
                FacInfo += ', ' + PatientBills.Facility.AddressLine1;
            }
            if (PatientBills.Facility.Mobile) {
                FacInfo += ',Phone: ' + PatientBills.Facility.Mobile;
            }
            if (PatientBills.Facility.Email) {
                FacInfo += ',Email: ' + PatientBills.Facility.Email;
            }
            if (PatientBills.Facility.GstNumber) {
                FacInfo += ',GSTIN No: ' + PatientBills.Facility.GstNumber;
            }

            QrInfo = PatientBills.BillNumber + ' , ' + PatientBills.BillAmount + ' , ' +
                PatientBills.BillDateTime + ' , ' + PatName + ' , ' + FacInfo;
        }
        let TotalNetAmtMinusCopay = 0;
        if (req.Data.CoPayAmount !== 0) {
            TotalNetAmtMinusCopay = Math.round(TotalNetAmount) - Math.round(req.Data.CoPayAmount);
        } else {
            TotalNetAmtMinusCopay = Math.round(TotalNetAmount);
        }
        let info = {
            PatientBillSummary: PatientBillSummarys,
            PatientBills: PatientBills,
            FinalPaymentDetail: FinalPaymentDetail,
            PayModeDesc: PayModeDesc,
            Encounter: Encounter,
            Age: Age,
            AdmissionFormattedDate: AdmissionFormattedDate,
            DischargeFormattedDate: DischargeFormattedDate,
            Patient: patientData,
            PatientPaymentDetails: ReceiptDetails,
            PharmacyReceiptDetails: PharmacyReceiptDetails,
            NonPharmacyReceiptDetails: NonPharmacyReceiptDetails,
            TotalGrossAmount: Math.round(TotalGrossAmount),
            TotalGstAmount: TotalGstAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDiscount: TotalDiscount,
            AdvanceAmount: AdvanceAmount,
            DrugAdvAmount: DrugAdvAmount,
            InsAdvanceAmount: InsAdvanceAmount,
            ReceiptAmount: ReceiptAmount,
            PaidAmount: Math.round(PaidAmount),
            NonPharmacyPaidAmount: NonPharmacyPaidAmount,
            DueCollect: Math.round(DueCollect),
            NetInsuranceAmt: Math.round(req.Data.NetInsuranceAmount),
            NetPatientAmt: Math.round(req.Data.NetPatientAmount),
            TotalMou: Math.round(req.Data.TotalMou),
            Referrals: ReferralsData.Data[0],
            NetAmount: (PatientBills.BillAmount + RoundOffValue) - PatientBills.BillDiscount,
            BalanceAmount: Math.round(BalanceAmount),
            NonPharmacyBalanceAmount: NonPharmacyBalanceAmount,
            PharmacyBalanceAmount: PharmacyBalanceAmount,
            currentdate: new Date(),
            PrintUser: PrintUser.Data[0],
            PatientRefund: PatientRefundInfo,
            RefundAmount: RefundAmount,
            PartialRefundAmount: PartialRefundAmount,
            Preferences: printPreferencesData,
            GuarantorApprovedAmount: GuarantorApprovedAmount,
            NetAmountAfterGuarantorApprovedAmount: NetAmountAfterGuarantorApprovedAmount,
            BalanceAmountAfterGuarantorApprovedAmount: BalanceAmountAfterGuarantorApprovedAmount,
            TotalNetAmountWithoutDiscount: TotalNetAmountWithoutDiscount,
            PatientGuarantor: Guarantor,
            QrInfo: QrInfo,
            GstAmount: GstAmount,
            PatientGuarantors: PatientGuarantor,
            Flags: flags,
            billtype: req.Data.ids,
            CoPayAmount: Math.round(req.Data.CoPayAmount),
            NonMedicalAmount: Math.round(req.Data.NonMedicalAmount),
            PatientPharmacyBillSummary: PatientPharmacyBillSummarys,
            TotalDrugGrossAmount: TotalDrugGrossAmount,
            TotalDrugGstAmount: TotalDrugGstAmount,
            TotalDrugNetAmountWithoutDiscount: TotalDrugNetAmountWithoutDiscount,
            DrugRoundOffValue: DrugRoundOffValue,
            TotalDrugNetAmount: TotalDrugNetAmount,
            TotalDrugDiscount: TotalDrugDiscount,
            DrugGstAmount: DrugGstAmount,
            isFinalized: isFinalized,
            InsNetAmount: Math.round(InsNetAmount),
            TotalMOUDisc: TotalMOUDisc,
            TotalNetAmtMinusCopay: TotalNetAmtMinusCopay
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
            if (info.Flags.bothBill) {
                key = 'Inpatientbillfullsummary';
            }
            if (info.Flags.drugBill) {
                key = 'Inpatientbillsummaryph';
            }
            // console.log('key===================='+key);
            //let pdfOption: any = null;
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
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<PatientBillSummaryInstance, PatientBillSummaryAttributes> {
        return this.Models.PatientBillSummary;
    }
}
