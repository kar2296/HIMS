import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientStockReturnDetailsInstance, PatientStockReturnDetailsAttributes } from '../Model/Interface/Index';
import { PatientStockReturnDetailsFilters } from '../Common/Filters.e';

export class PatientStockReturnDetailsBo extends BaseBo<PatientStockReturnDetailsInstance, PatientStockReturnDetailsAttributes> {
    public async AddPatientStockReturnDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientStockReturnDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientStockReturnDetails(PatientStockReturnId: number, details:
        PatientStockReturnDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PatientStockReturnId = PatientStockReturnId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async ManagePatientStockReturnDetailsAfterReceive(PatientDispenseReturnId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePatientStockReturnDetailAfterReceive(PatientDispenseReturnId, request, detail);
            })(item);
        }));
    }

    public async ManagePatientStockReturnDetailAfterReceive(PatientDispenseReturnId: number, request: any, detail: any): Promise<void> {
        let PatientStockReturnDetailId = detail.PatientStockReturnDetailId;
        if (PatientStockReturnDetailId > 0) {
            let PSReturnDetailedItem = await this.GetPatientStockReturnDetailsById({ Id: PatientStockReturnDetailId });
            PSReturnDetailedItem.ReceivedQuantity = PSReturnDetailedItem.ReceivedQuantity + detail.AcceptedQuantity;
            PSReturnDetailedItem.ReturnStatusId = request.Header.PatientReturnStatusId;
            await this.Update(PSReturnDetailedItem);
        }
    }

    public async ManagePatientStockReturnDetailsForComplete(request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePatientStockReturnDetailForComplete(request, detail);
            })(item);
        }));
    }

    public async ManagePatientStockReturnDetailForComplete(request: any, detail: any): Promise<void> {
        let PatientStockReturnDetailId = detail.PatientStockReturnDetailId;
        if (PatientStockReturnDetailId > 0) {
            let PSReturnDetailedItem = await this.GetPatientStockReturnDetailsById({ Id: PatientStockReturnDetailId });
            PSReturnDetailedItem.ReturnStatusId = request.Header.PatientReturnStatusId;
            await this.Update(PSReturnDetailedItem);
        }
    }

    public async GetPatientStockReturnDetailsById(req: BaseRequest): Promise<PatientStockReturnDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientStockReturnDetails(apiReq?: ApiRequest<PatientStockReturnDetailsFilters>):
        Promise<ApiResponse<PatientStockReturnDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let tostoreId = -1;
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.PatientStockReturns, as: 'PatientStockReturns', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockReturnDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.PatientStockReturnId:
                        where['PatientStockReturnId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ItemId:
                        where['ItemId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ToStoreId:
                        tostoreId = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ReturnStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReturnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                this.GetReference('ScheduleType'),
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Quantity'],
                    where: { 'StoreMasterId': tostoreId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'ItemMasterId', 'StoreMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId', 'InGstPercentage',
                                'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientStockReturnDetailsForReject(apiReq?: ApiRequest<PatientStockReturnDetailsFilters>):
        Promise<ApiResponse<PatientStockReturnDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockReturnDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.PatientStockReturnId:
                        where['PatientStockReturnId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ItemId:
                        where['ItemId'] = param.Value;
                        break;
                    case PatientStockReturnDetailsFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientStockReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientStockReturnDetailsInstance, PatientStockReturnDetailsAttributes> {
        return this.Models.PatientStockReturnDetails;
    }
    /*
    public async GetOptions(key: string, apiReq?: ApiRequest<PatientStockReturnDetailsFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemId', 'ItemCode', ['ItemName', 'Text'], 'ItemName'];
        let val = await this.GetPatientStockReturnDetails(apiReq);
        return { [key]: val.Data };
    }
    */
}
