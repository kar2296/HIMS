import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StaffCreditPaymentDetailsInstance, StaffCreditPaymentDetailsAttributes } from '../Model/Interface/Index';
import { StaffCreditPaymentDetailsFilters } from '../Common/Filters.e';
// import * as doctorBo from '../../DoctorInvoice/Business/Index';
import * as billingbo from '../../Billing/Business/Index';

export class StaffCreditPaymentDetailsBo extends BaseBo<StaffCreditPaymentDetailsInstance,
    StaffCreditPaymentDetailsAttributes> {
    public async AddStaffCreditPaymentDetails(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        return result.dataValues.Id;
    }

    public async UpdateStaffCreditPaymentDetails(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetStaffCreditPaymentDetailsById(req: BaseRequest): Promise<StaffCreditPaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    // public async ManageStaffCreditPaymentDetails(StaffCreditPaymentId: number, TotalPaymentAmount: number,
    //     details: StaffCreditPaymentDetailsAttributes[]) {
    //     details = details || [];
    //     let InvoiceBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
    //     await Promise.all(details.map((DetailItem): Promise<void> => {
    //         return (async (Detail): Promise<void> => {
    //             let detail: any = Detail;
    //             detail.Id = detail.Id || 0;
    //             detail.StaffCreditPaymentId = StaffCreditPaymentId;
    //             if (detail.Status === 2 && detail.Id !== 0) {
    //                 await this.MarkAsDelete(detail.Id);
    //             } else if (detail.Id === 0) {
    //                 let savedDetails = await this.Save(detail);
    //                 detail.Id = savedDetails.dataValues.Id;
    //             } else if (detail.Id > 0) {
    //                 await this.Update(detail);
    //             }
    //             let InvoiceInfo: any = {};
    //             InvoiceInfo = await InvoiceBo.GetPatientBillsById({ Id: detail.PatientBillId });
    //             if (detail.PatientBillStatusId === 2 || detail.PatientBillStatusId === 3) {
    //                 if (InvoiceInfo.IsPaidFully === false) {
    //                     InvoiceInfo.IsPaidFully = detail['IsPaidFully'];
    //                     InvoiceInfo.AmountPaid = detail['AmountPaid'];
    //                     InvoiceInfo.DueAmount = detail['DueAmount'];
    //                 }
    //             } else if (detail.PaymentStatusId === 4) {
    //                 InvoiceInfo.AmountPaid = 0;
    //                 // InvoiceInfo.DueAmount = InvoiceInfo.InvoiceAmount;
    //                 // InvoiceInfo.IsFullyPaid = 0;
    //             }
    //             await InvoiceBo.Update(InvoiceInfo);
    //         })(DetailItem);
    //     }));
    //     return true;
    // }


    public async ManageStaffCreditPaymentDetails(StaffCreditPaymentId: number, details: StaffCreditPaymentDetailsAttributes[]) {
        let patientbillbo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        let staffcreditpaymentbo = BoFactory.GetBo(billingbo.StaffCreditPaymentBo, this.Request);
        let staffcreditpaymentInfo = await staffcreditpaymentbo.GetStaffCreditPaymentById({ Id: StaffCreditPaymentId });
        let IsPaidFully: boolean;
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StaffCreditPaymentId = StaffCreditPaymentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                let PatientBillInfo: any = {};
                if (detail.PatientBillId > 0) {
                    PatientBillInfo = await patientbillbo.GetPatientBillsById({ Id: detail.PatientBillId });
                    if (detail.BalanceAmount === 0) {
                        IsPaidFully = true;
                    } else {
                        IsPaidFully = false;
                    }
                    let paymentRequest: any = {
                        Data: {
                            Header: {
                                Id: detail.PatientBillId,
                                BillAmount: (PatientBillInfo.BillAmount),
                                PaidAmount: Number(PatientBillInfo.PaidAmount) + Number(detail.PaidAmount),
                                // ReceiptAmount: Number(PatientBillInfo.ReceiptAmount) + Number(detail.PaidAmount),
                                OutStandingAmount: detail.BalanceAmount,
                                // WriteOff: Number(GrnInfo.WriteOff) + Number(detail.WriteOff),
                                PaymentTypeId: staffcreditpaymentInfo.StaffCreditPaymentTypeId,
                                // InvoiceAmount: staffcreditpaymentInfo.TotalOutstandingAmount,
                                IsPaidFully: IsPaidFully
                            }
                        }
                    };
                    await patientbillbo.UpdatePatientFromStaffBills(paymentRequest);
                }
                if (detail.PatientBillId > 0) {
                    let patientPaymentDetailbo = BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request);
                    let payment: any = {
                        Data: {
                            Id: 0,
                            ReceiptNumber: null,
                            ReceiptDateTime: new Date(),
                            FacilityId: this.Session.FacilityId,
                            PatientId: detail.StaffId,
                            PatientName: detail.StaffName,
                            PatientBillId: detail.PatientBillId,
                            ReceiptTypeId: 3,
                            BillTypeId: 6,
                            OutStandingAmount: detail.BalanceAmount,
                            DueAmount: Number(detail.BalanceAmount) + Number(detail.BalanceAmount),
                            AmountPaid:  Number(detail.PaidAmount),
                            // AmountPaid: Number(PatientBillInfo.PaidAmount) + Number(detail.PaidAmount),
                            ReceiptGeneratedById: this.Session.UserId,
                            PaymentTypeId: staffcreditpaymentInfo.StaffCreditPaymentTypeId,
                            BankId: staffcreditpaymentInfo.BankId,
                            CardTypeId: staffcreditpaymentInfo.CardTypeId,
                            ChequeNo: staffcreditpaymentInfo.ChequeNo,
                            CardHolderName: staffcreditpaymentInfo.CardHolderName,
                            DDNumber: staffcreditpaymentInfo.DDNumber,
                            DDDate: staffcreditpaymentInfo.DDDate,
                            CardNumber: staffcreditpaymentInfo.CardNumber,
                            ChequeDate: staffcreditpaymentInfo.ChequeDate,
                            CollectedOn: staffcreditpaymentInfo.CollectedOn,
                            ReceiptStatusId: 1,
                            IsPharmacyReceipt:1
                        }
                    };
                    await patientPaymentDetailbo.AddStaffPatientPaymentDetails(payment);
                }

            })(DetailItem);
        }));
        return true;
    }
    public async GetStaffCreditPaymentDetails(apiReq?: ApiRequest<StaffCreditPaymentDetailsFilters>):
        Promise<ApiResponse<StaffCreditPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('PaymentStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StaffCreditPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StaffCreditPaymentDetailsFilters.StaffCreditPaymentId:
                        where['StaffCreditPaymentId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStaffCreditPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StaffCreditPaymentDetailsInstance, StaffCreditPaymentDetailsAttributes> {
        return this.Models.StaffCreditPaymentDetails;
    }
}
