import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    VendorPaymentDetailsInstance, VendorPaymentDetailsAttributes
} from '../Model/Interface/Index';
import { VendorPaymentDetailsFilters } from '../Common/Filters.e';
import * as InventoryBo from '../Business/Index';

export class VendorPaymentDetailsBo extends BaseBo<VendorPaymentDetailsInstance, VendorPaymentDetailsAttributes> {
    public async AddVendorPaymentDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVendorPaymentDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageVendorPaymentDetails(VendorPaymentId: number, details: any[]) {
        let GrnBo = BoFactory.GetBo(InventoryBo.GrnBo, this.Request);
        let VendorPaymentBo = BoFactory.GetBo(InventoryBo.VendorPaymentBo, this.Request);
        let VendorPaymentInfo = await VendorPaymentBo.GetVendorPaymentById({ Id: VendorPaymentId });
        let IsPaidFully: boolean;
        let WriteOff: number = 0;
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.VendorPaymentId = VendorPaymentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                if (detail.GrnId > 0) {
                    let GrnInfo = await GrnBo.GetGrnById({ Id: detail.GrnId });
                    if (detail.BalanceAmount === 0) {
                        IsPaidFully = true;
                    } else {
                        IsPaidFully = false;
                    }
                    if (GrnInfo.WriteOff === 0) {
                        WriteOff = Number(detail.WriteOff);
                    } else {
                        WriteOff = GrnInfo.WriteOff;
                    }
                    let paymentRequest: any = {
                        Data: {
                            Header: {
                                Id: detail.GrnId,
                                TaxAmount: detail.TDSAmount,
                                ReceivedAmount: Number(GrnInfo.ReceivedAmount) + Number(detail.ReceiptAmt),
                                WriteOff: WriteOff,
                                // BalanceAmount: Number(detail.BalanceAmount),
                                BalanceAmount: Number(detail.BalanceAmount) - Number(GrnInfo.ReceivedAmount) - Number(GrnInfo.WriteOff),
                                PaymentTypeId: VendorPaymentInfo.PaymentTypeId,
                                InvoiceAmount: GrnInfo.TotalNetAmount,
                                IsPaidFully: IsPaidFully
                            }
                        }
                    };
                    await GrnBo.UpdateGrn(paymentRequest);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetVendorPaymentDetailsById(req: BaseRequest): Promise<VendorPaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorPaymentDetails(apiReq?: ApiRequest<VendorPaymentDetailsFilters>):
        Promise<ApiResponse<VendorPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let isReqPaymentsearch: boolean = false;
        let paymentWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorPaymentDetailsFilters.VendorPaymentId:
                        where['VendorPaymentId'] = param.Value;
                        break;
                    case VendorPaymentDetailsFilters.VendorPaymentDate:
                        paymentWhere['VendorPaymentDate'] = { '$between': param.Value };
                        isReqPaymentsearch = true;
                        break;
                    case VendorPaymentDetailsFilters.FromDate:
                        paymentWhere['VendorPaymentDate'] = paymentWhere['VendorPaymentDate'] || {};
                        (paymentWhere['VendorPaymentDate'] as any)['$gte'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case VendorPaymentDetailsFilters.ToDate:
                        paymentWhere['VendorPaymentDate'] = paymentWhere['VendorPaymentDate'] || {};
                        (paymentWhere['VendorPaymentDate'] as any)['$lte'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.VendorPayment,
            required: isReqPaymentsearch,
            where: paymentWhere,
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteVendorPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorPaymentDetailsInstance, VendorPaymentDetailsAttributes> {
        return this.Models.VendorPaymentDetails;
    }
}
