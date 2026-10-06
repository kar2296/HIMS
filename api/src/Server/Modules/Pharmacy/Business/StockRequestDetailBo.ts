import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockRequestDetailInstance, StockRequestDetailAttributes } from '../Model/Interface/Index';
import { StockRequestDetailFilters } from '../Common/Filters.e';
import * as _ from 'lodash';
import * as moment from 'moment';

export class StockRequestDetailBo extends BaseBo<StockRequestDetailInstance, StockRequestDetailAttributes> {
    public async AddStockRequestDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockRequestDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    // public async ManageStockRequestDetails(StockRequestId: number, details: StockRequestDetailAttributes[]): Promise<boolean> {
    //     details = details || [];
    //     let promises: Array<any> = [];
    //     details.forEach(detail => {
    //         detail.Id = detail.Id || 0;
    //         detail.StockRequestId = StockRequestId;
    //         if (detail.Status === 2 && detail.Id !== 0) {
    //             promises.push(this.MarkAsDelete(detail.Id));
    //         } else if (detail.Id === 0) {
    //             promises.push(this.Save(detail));
    //         } else if (detail.Id > 0) {
    //             promises.push(this.Update(detail));
    //         }
    //     });
    //     await Promise.all(promises);
    //     return true;
    // }

    public async ManageStockRequestDetails(StockRequestId: number, details: StockRequestDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StockRequestId = StockRequestId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Status === 1 && detail.Id === 0) {
                    if (await this.IsAlreadyExist(detail) <= -1) throw { message: 'Stock Detail Already Exist' };
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Status === 1 && detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageStockRequestDetailsAfterTransfer(StockTransferId: number, request: any): Promise<any> {
        /*
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageStockRequestDetailItem(StockTransferId, request, detail);
            })(item);
        }));
        */

        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.StockRequestDetailId; });
        await Promise.all(Object.keys(itemDetails).map((requestdetailId: any) => {
            return (async (im) => {
                await this.ManageStockRequestDetailItem(StockTransferId, request, itemDetails[im]);
            })(requestdetailId);
        }));
    }

    /*
    public async ManageStockRequestDetailItem(StockTransferId: number, request: any, detail: any): Promise<void> {
        let StockRequestDetailId = detail.StockRequestDetailId;
        if (StockRequestDetailId > 0) {
            let StockRequestDetailedItem = await this.GetStockRequestDetailById({ Id: StockRequestDetailId });
            StockRequestDetailedItem.TransferedQuantity = StockRequestDetailedItem.TransferedQuantity + detail.TransferedQuantity;
            await this.Update(StockRequestDetailedItem);
        }
    }
    */

    public async ManageStockRequestDetailItem(StockTransferId: number, request: any, details: Array<any>): Promise<void> {
        let StockRequestDetailId = details[0].StockRequestDetailId;
        let CurrentQuantity = _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity));
        if (StockRequestDetailId > 0) {
            let StockRequestDetailedItem = await this.GetStockRequestDetailById({ Id: StockRequestDetailId });
            // StockRequestDetailedItem.TransferedQuantity = Number(StockRequestDetailedItem.TransferedQuantity) + Number(CurrentQuantity);
            StockRequestDetailedItem.TransferedQuantity = (Number(StockRequestDetailedItem.TransferedQuantity) + Number(CurrentQuantity));

            await this.Update(StockRequestDetailedItem);
        }
    }

    public async GetStockRequestDetailById(req: BaseRequest): Promise<StockRequestDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockRequestDetails(apiReq?: ApiRequest<StockRequestDetailFilters>):
        Promise<ApiResponse<StockRequestDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let tostoremasterId = -1;
        let fromstoremasterId = -1;
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.StockRequest, attributes: ['RequestNumber', 'RequestedDate', 'StoreName'], required: false });
        // include.push({ model: this.Models.StockTransferDetail, required: false });
        include.push({ model: this.Models.StockTransferDetail, as: 'StockTransferDetails', required: false });
        //include.push({ model: this.Models.StoreMaster, as: 'FromStore',required: false });
        //include.push({ model: this.Models.ItemMaster, attributes: ['ItemCode', 'ItemName'], as: 'ItemMaster', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockRequestDetailFilters.Id:
                        where['StockRequestDetailId'] = param.Value;
                        break;
                    case StockRequestDetailFilters.StockRequestId:
                        where['StockRequestId'] = param.Value;
                        break;
                    case StockRequestDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockRequestDetailFilters.RequestedQuantity:
                        where['RequestedQuantity'] = param.Value;
                        break;
                    case StockRequestDetailFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case StockRequestDetailFilters.FromStoreMasterId:
                        fromstoremasterId = param.Value;
                        break;
                    case StockRequestDetailFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case StockRequestDetailFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
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
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': tostoremasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            /*
                            attributes: ['Id', 'StockItemId', 'ItemMasterId', 'StoreMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId', 'InGstPercentage',
                                'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            */
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    required: false, as: 'ReqStoreStock',
                    attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': fromstoremasterId },
                }
            ]
        });
        order.push(['StockRequestDetailId', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockRequestDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async IsAlreadyExist(req: any): Promise<number> {
        let encounterDate = new Date();
        let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 30);
        let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestDetailFilters.ItemMasterId, Value: req.ItemMasterId },
            { Key: StockRequestDetailFilters.RequestedQuantity, Value: req.RequestedQuantity },
            { Key: StockRequestDetailFilters.CreatedFrom, Value: frmDate },
            { Key: StockRequestDetailFilters.CreatedTo, Value: todate },
            { Key: StockRequestDetailFilters.StockRequestId, Value: req.StockRequestId },
                // { Key: GrnDetailFilters.TotalGrossAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetStockRequestDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    public GetModel(): SStatic.Model<StockRequestDetailInstance, StockRequestDetailAttributes> {
        return this.Models.StockRequestDetail;
    }

}
