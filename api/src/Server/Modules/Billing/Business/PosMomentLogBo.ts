import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PosMomentLogInstance, PosMomentLogAttributes } from '../Model/Interface/Index';
import { PosMomentLogFilters } from '../Common/Filters.e';
import * as request from 'request';

export class PosMomentLogBo extends BaseBo<PosMomentLogInstance, PosMomentLogAttributes> {
    public async AddPosMomentLog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async POSMomentCallBack(req: any): Promise<any> {
        console.log('Received request data:', req);

        if (!req.responseToken) {
            throw new Error('response_token is undefined or missing');
        }
        const rawToken = req.responseToken;
        const parsedToken = JSON.parse(rawToken);
        console.log('Parsed token data:', parsedToken);

        const responseToken = parsedToken.response_token;
        const bankProviderDetails = responseToken.bank_provider_details || {};
        const extendedData = bankProviderDetails.bank_response_extended_data || {};

        req.Data = {
            ResponseCode: responseToken.response_code || null,
            ResponseMessage: responseToken.response_message || null,
            ProcessingId: responseToken.processing_id || null,
            CustomerId: responseToken.customer_id || null,
            Amount: responseToken.amount ? parseFloat(responseToken.amount) : null,
            TransactionId: responseToken.transaction_id || null,
            CashbackDiscountedAmount: responseToken.cashback_discounted_amount || null,
            PayMode: responseToken.paymode || null,
            TransactionType: bankProviderDetails.transaction_type || null,
            TransactionStatus: bankProviderDetails.transaction_status || null,
            BankResponseCode: bankProviderDetails.bank_response_code || null,
            BankResponseMessage: bankProviderDetails.bank_response_message || null,
            RrnId: extendedData.rrn_id || null,
            TimeStamp: extendedData.timestamp || null,
            TransactionAmount: extendedData.transaction_amount || null,
            InvoiceNumber: extendedData.invoice_number || null,
            UniqueIdentifierProvider: extendedData.unique_identifier_provider || null,
            IcccCode: extendedData.iccc_code || null,
            CardNumber: extendedData.cardNumber || null,
            CardHolderName: extendedData.cardHolderName || null,
            CardType: extendedData.cardType || null,
            ApprovalCode: extendedData.approvalCode || null,
            CheckSumHash: responseToken.checksum_hash || null,
            SplitPayButtonId: responseToken.splitPayButtonId || null,
        };
        let result = await this.SaveWithOutSession(req.Data);
        if (String(result.dataValues.ResponseCode) === '1200') {
            return 'Payment completed successfully. Transaction ID: ' + result.dataValues.TransactionId + ' You can close the popup.';
        } else {
            return 'Payment failed.close the popup, Please try again.';
        }
    }

    public async MomentTransactionStatus(req: BaseRequest): Promise<number> {
        const payData = {
            processing_id: req.Data.processing_id,
            mid: process.env.MOMENTPAY_MID,
            auth_user: process.env.MOMENTPAY_AUTH_USER,
            auth_key: process.env.MOMENTPAY_AUTH_KEY
        };
        const httpOptions = {
            timeout: 60000,
            body: payData,
            json: true
        };
        const finalurl = 'https://hosmat.momentpay.live/ma/payment/api/v1/status';
        return new Promise<any>((resolve, reject) => {
            request.post(finalurl, httpOptions,
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.error('***** API Error ******', error);
                        reject(error);
                    }
                    console.log('***** API Response ******', response.body);
                    resolve({ body, response });
                });
        });
    }

    public async UpdatePosMomentLog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPosMomentLogById(req: BaseRequest): Promise<PosMomentLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPosMomentLogs(apiReq?: ApiRequest<PosMomentLogFilters>): Promise<ApiResponse<PosMomentLogAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PosMomentLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PosMomentLogFilters.ResponseCode:
                        where['ResponseCode'] = param.Value;
                        break;
                    case PosMomentLogFilters.ProcessingId:
                        where['ProcessingId'] = param.Value;
                        break;
                    case PosMomentLogFilters.CustomerId:
                        where['CustomerId'] = param.Value;
                        break;
                    case PosMomentLogFilters.TransactionId:
                        where['TransactionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePosMomentLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PosMomentLogInstance, PosMomentLogAttributes> {
        return this.Models.PosMomentLog;
    }
}
