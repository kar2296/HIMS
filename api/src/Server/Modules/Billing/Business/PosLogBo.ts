import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PosLogInstance, PosLogAttributes } from '../Model/Interface/Index';
import { PosLogFilters } from '../Common/Filters.e';
import * as request from 'request';

export class PosLogBo extends BaseBo<PosLogInstance, PosLogAttributes> {
    public async AddPosLog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    // Icici POS Payment
    public async PushTransaction(req: BaseRequest): Promise<number> {
        const payData = {
            mid: req.Data.mid,
            tid: req.Data.tid,
            tran_type: req.Data.tran_type,
            amount: req.Data.amount,
            bill_no: req.Data.bill_no,
            tip: req.Data.tip,
            erp_tran_id: req.Data.erp_tran_id,
            erp_client_id: req.Data.erp_client_id,
            source_id: req.Data.source_id
        };
        const httpOptions = {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Custom App'
            },
            body: payData,
            json: true
        };
        const finalurl = 'https://iciciapi.lyra-network.in/erpservice/ERP/PushTxn';
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

    public async TransactionStatus(req: BaseRequest): Promise<number> {
        const payData = {
            mid: req.Data.mid,
            tid: req.Data.tid,
            tran_type: req.Data.tran_type,
            bill_no: req.Data.bill_no,
            erp_tran_id: req.Data.erp_tran_id,
            erp_client_id: req.Data.erp_client_id
        };
        const httpOptions = {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Custom App'
            },
            body: payData,
            json: true
        };
        // const finalurl = 'https://iciciapi.lyra-network.in/erpservice/ERP/CheckStatus';
        const finalurl = 'https://iciciapi.lyra-network.in/erpservice/ERP/CallbackStatusCheck';
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

    public async CallBack(req: BaseRequest): Promise<any> {
        req.Data = req;
        req.Data.FacilityId = 1;
        let result = await this.SaveWithOutSession(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePosLog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPosLogById(req: BaseRequest): Promise<PosLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPosLogs(apiReq?: ApiRequest<PosLogFilters>): Promise<ApiResponse<PosLogAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PosLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PosLogFilters.MID:
                        where['MID'] = param.Value;
                        break;
                    case PosLogFilters.TID:
                        where['TID'] = param.Value;
                        break;
                    case PosLogFilters.billNumber:
                        where['billNumber'] = param.Value;
                        break;
                    case PosLogFilters.TranId:
                        where['TranId'] = param.Value;
                        break;
                    case PosLogFilters.TxnStatus:
                        where['TxnStatus'] = param.Value;
                        break;
                    case PosLogFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePosLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PosLogInstance, PosLogAttributes> {
        return this.Models.PosLog;
    }
}
