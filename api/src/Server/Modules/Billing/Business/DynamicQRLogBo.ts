import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DynamicQRLogInstance, DynamicQRLogAttributes } from '../Model/Interface/Index';
import { DynamicQRLogFilters } from '../Common/Filters.e';
import * as request from 'request';
import * as crypto from 'crypto';
// import * as fs from 'fs';
// import * as path from 'path';

const RSA_PKCS1_PADDING = 1;
export class DynamicQRLogBo extends BaseBo<DynamicQRLogInstance, DynamicQRLogAttributes> {

    public async encryptWithPublicKey(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const encrypted = crypto.publicEncrypt(
                    {
                        key: this.getIciciPublicKey(),
                        padding: RSA_PKCS1_PADDING,
                    },
                    Buffer.from(data, 'utf-8')
                );
                resolve(encrypted.toString('base64'));
            } catch (error) {
                reject(error);
            }
        });
    }

    public async decryptWithPrivateKey(encryptedData: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const decrypted = crypto.privateDecrypt(
                    {
                        key: this.getMerchantPrivateKey(),
                        padding: RSA_PKCS1_PADDING,
                    },
                    Buffer.from(encryptedData, 'base64')
                );
                resolve(decrypted.toString('utf-8'));
            } catch (error) {
                reject(error);
            }
        });
    }

    public async GenerateQR(req: BaseRequest): Promise<any> {
        try {
            const payload = {
                amount: req.Data.amount,
                merchantId: req.Data.merchantId,
                terminalId: req.Data.terminalId,
                merchantTranId: req.Data.merchantTranId,
                billNumber: req.Data.billNumber
            };
            console.log('Original Payload:', JSON.stringify(payload));
            const encryptedPayload = await this.encryptWithPublicKey(JSON.stringify(payload));
            const url = process.env.ICICI_BASE_URL+ '/' +process.env.MERCHANT_ID;
            console.log('Encrypted Payload:', encryptedPayload);
            console.log('URL', url);
            return new Promise((resolve, reject) => {
                request.post(
                    url,
                    {
                        timeout: 60000,
                        headers: {
                            'Content-Type': 'text/plain;charset=UTF-8',
                            'apikey': 'r5wnYwmFnSHbAQWMjohW0tCh3olKgBO1'
                        },
                        strictSSL: true,
                        body: encryptedPayload,
                    },
                    async (error: any, response: request.RequestResponse, body: any) => {
                        if (error) {
                            console.error('***** API Error ******', error);
                            reject(new Error('QR Code generation failed'));
                            return;
                        }

                        console.log('Response Body:', body);

                        try {
                            const decryptedResponse = await this.decryptWithPrivateKey(body);
                            console.log('Decrypted Response:', decryptedResponse);
                            resolve(JSON.parse(decryptedResponse));
                        } catch (decryptionError) {
                            console.error('Decryption Error:', decryptionError);
                            reject(new Error('Response decryption failed'));
                        }
                    }
                );
            });
        } catch (error) {
            console.error('GenerateQR Error:', error);
            throw new Error('QR generation failed due to an internal error');
        }
    }

    public async CallBack(req: any): Promise<any> {
        try {
            const encryptedData = req;
            console.log('EncryptedData Callback Data:', encryptedData);
            const decryptedData = JSON.parse(await this.decryptWithPrivateKey(encryptedData));
            console.log('Decrypted Callback Data:', decryptedData);
            const requestData = { Data: decryptedData };

            requestData.Data.MerchantId = decryptedData.merchantId;
            requestData.Data.SubMerchantId = decryptedData.subMerchantId;
            requestData.Data.TerminalId = decryptedData.terminalId;
            requestData.Data.MerchantTranId = decryptedData.merchantTranId;
            let result = await this.SaveWithOutSession(requestData.Data);
            return result.dataValues.Id;

        } catch (error) {
            console.log('Decrypted Callback Data:', error);
        }
    }

    public async CheckTransactionStatus(req: BaseRequest): Promise<any> {
        try {
            const payload = {
                merchantId: process.env.MERCHANT_ID,
                subMerchantId: process.env.MERCHANT_ID,
                terminalId: '5912',
                merchantTranId: req.Data.merchantTranId
            };
            console.log('Original Payload:', JSON.stringify(payload));
            const encryptedPayload = await this.encryptWithPublicKey(JSON.stringify(payload));
            const url = 'https://apibankingone.icicibank.com/api/MerchantAPI/UPI/v0/TransactionStatus3/9086188';
            console.log('Encrypted Payload:', encryptedPayload);
            console.log('URL', url);
            return new Promise((resolve, reject) => {
                request.post(
                    url,
                    {
                        timeout: 60000,
                        headers: {
                            'Content-Type': 'text/plain;charset=UTF-8',
                            'apikey': 'r5wnYwmFnSHbAQWMjohW0tCh3olKgBO1'
                        },
                        strictSSL: true,
                        body: encryptedPayload,
                    },
                    async (error: any, response: request.RequestResponse, body: any) => {
                        if (error) {
                            console.error('***** API Error ******', error);
                            reject(new Error('Check Status failed'));
                            return;
                        }

                        console.log('Response Body:', body);

                        try {
                            const decryptedResponse = await this.decryptWithPrivateKey(body);
                            console.log('Decrypted Response:', decryptedResponse);
                            resolve(JSON.parse(decryptedResponse));
                        } catch (decryptionError) {
                            console.error('Decryption Error:', decryptionError);
                            reject(new Error('Response decryption failed'));
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Check Status Error:', error);
            throw new Error('Check Status failed due to an internal error');
        }
    }

    public async AddDynamicQRLog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDynamicQRLog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDynamicQRLogById(req: BaseRequest): Promise<DynamicQRLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDynamicQRLogs(apiReq?: ApiRequest<DynamicQRLogFilters>): Promise<ApiResponse<DynamicQRLogAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DynamicQRLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DynamicQRLogFilters.MerchantId:
                        where['MerchantId'] = param.Value;
                        break;
                    case DynamicQRLogFilters.TerminalId:
                        where['TerminalId'] = param.Value;
                        break;
                    case DynamicQRLogFilters.MerchantTranId:
                        where['MerchantTranId'] = param.Value;
                        break;
                    case DynamicQRLogFilters.TxnStatus:
                        where['TxnStatus'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteDynamicQRLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DynamicQRLogInstance, DynamicQRLogAttributes> {
        return this.Models.DynamicQRLog;
    }
    private getIciciPublicKey(): string {
        if (!process.env.ICICI_PUBLIC_KEY) {
            throw new Error('ICICI_PUBLIC_KEY is not defined in environment variables');
        }
        return process.env.ICICI_PUBLIC_KEY.replace(/\\n/g, '\n');
    }

    private getMerchantPrivateKey(): string {
        if (!process.env.MERCHANT_PRIVATE_KEY) {
            throw new Error('MERCHANT_PRIVATE_KEY is not defined in environment variables');
        }
        return process.env.MERCHANT_PRIVATE_KEY.replace(/\\n/g, '\n');
    }
}
