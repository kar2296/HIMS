import * as SStatic from 'sequelize';

// Import Sequelize operators
const { Op } = SStatic;
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockItemInstance, StockItemAttributes, ItemMasterAttributes } from '../Model/Interface/Index';
import { GrnDetailAttributes, PurchaseReturnDetailAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockItemFilters, StoreMasterFilters } from '../Common/Filters.e';
import * as _ from 'lodash';

export class StockItemBo extends BaseBo<StockItemInstance, StockItemAttributes> {

    public async AddStockItem(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let StockItemId = result.dataValues.Id;
        await detailBO.ManageStockSerialItems(StockItemId, req.Data.Details);
        return StockItemId;
    }

    public async UpdateStockItem(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let StockItemId = req.Data.Header.Id;
        await detailBO.ManageStockSerialItems(StockItemId, req.Data.Details);
        return result;
    }

    public async GetStockItemById(req: BaseRequest): Promise<StockItemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageStoreAssosiations(MasterId: number, detail: ItemMasterAttributes): Promise<any> {
        let storeReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StoreMasterFilters.ActiveStatus, Value: 2 }]
        };
        let storeBO = BoFactory.GetBo(bo.StoreMasterBo, this.Request);
        let StoreData = await storeBO.GetStoreMasters(storeReq);
        let stockitem = {};
        await Promise.all(StoreData.Data.map((storeItem): Promise<void> => {
            return (async (store): Promise<void> => {
                stockitem = {
                    ItemMasterId: MasterId,
                    ItemCode: detail.ItemCode,
                    ItemName: detail.ItemName,
                    Quantity: 0,
                    StoreMasterId: store.Id,
                    FacilityId: 1,
                    IsConsignment: detail.IsConsignment
                };
                await this.ManageStoreAssosiation(MasterId, stockitem as any);
            })(storeItem);
        }));
    }

    public async ManageStockItemAssosiations(detail: any): Promise<any> {
        for (let sdx in detail) {
            let storemap = detail[sdx];
            let StockItemApiReq = {
                Id: 0,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Params: [
                    { Key: StockItemFilters.ItemMasterId, Value: storemap.ItemMasterId },
                    { Key: StockItemFilters.StoreMasterId, Value: storemap.StoreMasterId },
                ]
            };
            let storeBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
            let StoreData = await storeBO.GetStockItems(StockItemApiReq);
            let stockitem: any = {};
            if (StoreData.Data.length === 0) {
                stockitem = {
                    Id: 0,
                    ItemMasterId: storemap.ItemMasterId,
                    ItemCode: storemap.ItemCode,
                    ItemName: storemap.ItemName,
                    Quantity: 0,
                    StoreMasterId: storemap.StoreMasterId,
                    FacilityId: storemap.FacilityId
                };
                await this.Save(stockitem);
            }
        }
    }

    public async ManageStoreAssosiation(MasterId: number, stockitem: StockItemAttributes): Promise<boolean> {
        await this.Save(stockitem);
        return true;
    }

    public async GetStockItems(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.StoreMaster, required: false });
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockItemFilters.Id:
                        where['StockItemId'] = param.Value;
                        break;
                    case StockItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockItemFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: '0' };
                        break;
                    case StockItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockItemFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case StockItemFilters.Code:
                        (where as any) [Op.or] = [
                            { ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetStockItemsforPR(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.StoreMaster, required: false });
        let order: Array<any> = [];
        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                this.GetReference('ScheduleType'),
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockItemFilters.Id:
                        where['StockItemId'] = param.Value;
                        break;
                    case StockItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockItemFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: '0' };
                        break;
                    case StockItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockItemFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case StockItemFilters.Code:
                        (where as any) [Op.or] = [
                            { ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetToDayStockItems(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.ItemMaster,
            as: 'ItemMaster',
            required: false,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockItemFilters.Id:
                        where['StockItemId'] = param.Value;
                        break;
                    case StockItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockItemFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: '0' };
                        break;
                    case StockItemFilters.IncludeSerialItems:
                        include.push({
                            model: this.Models.StockSerialItem,
                            required: false,
                            where: { Quantity: { [Op.gt]: 0 } }
                        });
                        break;
                    /*
                case StockItemFilters.IncludeSerialItems:
                    where['Quantity'] = { [Op.gt]: '0' };
                    let dbtQry = this.GetSelectQuery(this.Models.StockSerialItem, {
                        attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
                        where: [this.Dal.literal('`ItemMasterId` = `StockItem`.`ItemMasterId`'),
                        {
                            'Status': 1,
                            Quantity: { [Op.gt]: 0 }
                        }]
                    }, 'StockValue');
                    attributes.include.push(dbtQry);
                    break;
                    */
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStockItemsForSale(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockItemFilters.Id:
                        where['StockItemId'] = param.Value;
                        break;
                    case StockItemFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockItemFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockItemFilters.Code:
                        (where as any) [Op.or] = [
                            { ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StockSerialItem,
            required: true,
            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
            where: { Quantity: { [Op.gt]: 0 } }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                this.GetReference('ScheduleType'),
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockItem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StockItemInstance, StockItemAttributes> {
        return this.Models.StockItem;
    }

    public async GetStockItemIdByFilter(req: BaseRequest): Promise<any> {
        let stockitem = null;
        let filterInfo = req.Data;
        let stockitemInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                ItemMasterId: filterInfo.ItemMasterId
            }
        });
        if (stockitemInstance) {
            stockitem = this.GetAttribute(stockitemInstance);
        }
        return stockitem;
    }

    public async ManageStockItems(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let StDetails: any = [];
        if (request.Details.length > 0) {
            for (let sdx in request.Details) {
                let stitem = request.Details[sdx];
                if (stitem.Status === 1) {
                    if (TransactionType === 9) {
                        if (stitem.TransferedQuantity > 0)
                            StDetails.push(stitem);
                    } else {
                        StDetails.push(stitem);
                    }

                }
            }
        }
        let details: Array<any> = StDetails;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });

        let errorMessages: any = [];
        let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {
                try {
                    await this.ManageStockItem(TransactionType, TransactionId, request, gi);
                } catch (ex) {
                    console.log('stockitem issue');
                    errorMessages.push(ex.message);
                    // console.log(ex);
                    // console.log('grouped item')
                    // console.log(groupedItem.ItemMasterId,groupedItem.ItemName);
                    // throw { message: ex.message };
                }
                // try {
                //     await stockmovementBO.ManageStockMovement1(TransactionType, TransactionId, request, gi);
                // } catch (ex) {
                //     console.log('stockitem issue');
                //     console.log(ex);
                //     throw { message: ex.message };
                // }
            })(groupedItem);
        }));
        if (errorMessages.length > 0) {
            throw { message: errorMessages };
            // return _.filter(groupedItems, (item) => { return item.error !== null; });
        }


        errorMessages = [];
        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {

                try {
                    await stockmovementBO.ManageStockMovement1(TransactionType, TransactionId, request, gi);
                } catch (ex) {
                    console.log('stockmovement issue');
                    console.log(ex);
                    errorMessages.push(ex.message);
                    // throw { message: ex.message };
                }
                // try {
                //     await stockmovementBO.ManageStockMovement1(TransactionType, TransactionId, request, gi);
                // } catch (ex) {
                //     console.log('stockitem issue');
                //     console.log(ex);
                //     throw { message: ex.message };
                // }
            })(groupedItem);
        }));
        if (errorMessages.length > 0) {
            throw { message: errorMessages };
        }
        return _.filter(groupedItems, (item: any) => { return item.error !== null; });
        // for (var gi = 0; gi < groupedItems.length; gi++) {
        //     await this.ManageStockItem(TransactionType, TransactionId, request, groupedItems[gi]);
        // }


    }

    public async ManageStockItem(TransactionType: number, TransactionId: number,
        request: any, itemInfo: any): Promise<void> {
        let details = itemInfo.batches;
        let stockitem = {};
        try {
            if (TransactionType === 1) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.TotalConversionQuantity)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    // StockItemId: details[0].StockItemId,
                    StockEntryId: details[0].StockEntryId,
                    StockEntryDetailId: 0
                };
            } else if (TransactionType === 3) {
                let Qty = 0;
                if (details[0].IsReusable) {
                    Qty = details[0].MinQtyConv;
                } else {
                    Qty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
                }
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: Qty,
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    // StockItemId: details[0].StockItemId,
                    GrnId: details[0].GrnId,
                    GrnDetailId: 0,
                    IsConsignment: request.Header.IsConsignment
                };
            } else if (TransactionType === 5) {
                var PrnQty = 0;
                var ReturningGrnId = 0;
                if (request.Header.PrnTypeId === 2) {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
                    ReturningGrnId = request.Header.GrnId;
                } else {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.PrnQuantity));
                }
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: PrnQty,
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: ReturningGrnId,
                    GrnDetailId: 0
                };
            } else if (TransactionType === 9) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 13) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.QtyConsumed),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 15) {
                // var AdjQty = 0;
                // if (request.Header.AdjustmentTypeId === 1) {
                //     AdjQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
                // }
                // if (request.Header.AdjustmentTypeId === 2) {
                //     AdjQty = _.sumBy(details, (detail: any) => detail.QtyAdjusted);
                // }
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    // Quantity: AdjQty,
                    // Quantity: AdjInQty,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 19) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.DispensedQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 20) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.AcceptedQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0
                    //Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 21) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.Quantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 22) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.ReturnQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0
                };
            } else if (TransactionType === 23) {
                let ReceivingStoreId = 0;
                if (request.Header.TransferTypeId === 1 || request.Header.TransferTypeId === 3) {
                    ReceivingStoreId = request.Header.ToStoreMasterId;
                } else {
                    ReceivingStoreId = request.Header.StoreMasterId;
                }
                stockitem = {
                    Id: details[0].RequestedStoreStockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.AcceptedQuantity)),
                    StoreMasterId: ReceivingStoreId,
                    FacilityId: 0,
                    OrgId: 0,
                    StockTransferId: details[0].StockTransferId,
                    StockTransferDetailId: 0
                };
            } else if (TransactionType === 24) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.Quantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            }
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            // itemInfo.error = { name: details[0].ItemName };
            itemInfo.error = { ItemMasterId: details[0].ItemMasterId, name: details[0].ItemName };
            throw { message: itemInfo.error };
        }

        try {
            await this.ManageStock(TransactionType, stockitem as any, details);
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            itemInfo.error = { ItemMasterId: details[0].ItemMasterId, name: details[0].ItemName };
            throw { message: itemInfo.error };
        }
    }

    public async ManageStock(TransactionType: number, stockitem: StockItemAttributes, details: Array<any>): Promise<boolean> {
        let saveResult: any;
        let serialitems = details;
        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);

        if (TransactionType === 1) {
            try {
                let ExistingStockItem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (ExistingStockItem !== null) {
                    ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 3) {
            try {
                let ExistingStockItem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });

                if (ExistingStockItem !== null) {
                    ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 5) {
            try {
                let ExistingStockItem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (ExistingStockItem !== null) {
                    if (ExistingStockItem.Quantity >= stockitem.Quantity) {
                        ExistingStockItem.Quantity = ExistingStockItem.Quantity - Number(stockitem.Quantity);
                        saveResult = await this.Update(ExistingStockItem);
                        stockitem.Id = ExistingStockItem.Id;
                        await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                    } else {
                        // ExistingStockItem.Quantity = 0;
                        ExistingStockItem.Quantity = ExistingStockItem.Quantity - Number(stockitem.Quantity);
                        ExistingStockItem.Rev = stockitem.Rev;
                        if (ExistingStockItem.Quantity < 0) {
                            throw { message: 'Stock not exist.. Please check' };
                        }
                        saveResult = await this.Update(ExistingStockItem);
                        stockitem.Id = ExistingStockItem.Id;
                        await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                    }
                } else {
                    throw { code: 'NO_EXISTING_STOCK_ITEM' };
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 9) {
            try {
                // let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                let existingstockitem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });

                if (existingstockitem !== null) {
                    if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                    } else {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                        existingstockitem.Rev = stockitem.Rev;
                        if (existingstockitem.Quantity < 0) {
                            throw { message: 'Stock not exist.. Please check' };
                        }
                    }

                    try {
                        let affectedrows: any = await this.Update(existingstockitem);
                        if (affectedrows === 0) {
                            return Promise.reject(new Error('Error in Updating Stock'));
                        }
                        await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                    } catch (ex) {
                        throw { message: 'Error in Updating Stock' };
                    }
                    // await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 13) {
            try {
                // let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                let existingstockitem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (existingstockitem !== null) {
                    if (existingstockitem.Quantity >= stockitem.Quantity) {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                        // existingstockitem.Rev = stockitem.Rev;
                    } else {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                        existingstockitem.Rev = stockitem.Rev;
                        // existingstockitem.Quantity = 0;
                        throw { message: 'Stock Issue.. Please try again' };
                    }
                    await this.Update(existingstockitem);
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 15) {
            try {
                let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                if (serialitems[0].AdjustmentTypeId === 1) {
                    existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
                } else {
                    if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                    } else {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                        existingstockitem.Rev = stockitem.Rev;
                    }
                }

                await this.Update(existingstockitem);
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 19) {
            try {
                // let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                let existingstockitem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (existingstockitem !== null) {
                    if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                    } else {
                        existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                        if (existingstockitem.Quantity < 0) {
                            throw { message: 'Stock not exist.. Please check' };
                        }
                        existingstockitem.Rev = stockitem.Rev;
                    }

                    await this.Update(existingstockitem);
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 20) {
            try {
                let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
                //existingstockitem.Rev = stockitem.Rev;
                // await this.Update(existingstockitem);
                // await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                if (existingstockitem !== null) {
                    stockitem.Id = existingstockitem.Id;
                    existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
                    //existingstockitem.Rev = stockitem.Rev;
                    await this.Update(existingstockitem);
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 21) {
            try {
                // let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                let existingstockitem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (existingstockitem !== null) {
                    if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                        existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                    } else {
                        existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                        if (existingstockitem.Quantity < 0) {
                            throw { message: 'Stock not exist.. Please check' };
                        }
                        existingstockitem.Rev = stockitem.Rev;
                    }
                    await this.Update(existingstockitem);
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }

        } else if (TransactionType === 22) {
            try {
                let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                existingstockitem.Quantity = existingstockitem.Quantity + stockitem.Quantity;

                await this.Update(existingstockitem);
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 23) {
            // let ExistingStockItem = await this.GetStockItemIdByFilter({
            //     Id: 0,
            //     Data: {
            //         StoreMasterId: stockitem.StoreMasterId,
            //         ItemMasterId: stockitem.ItemMasterId
            //     }
            // });
            try {
                let ExistingStockItem = await this.GetStockItemIdByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: stockitem.ItemMasterId
                    }
                });
                if (ExistingStockItem !== null) {
                    ExistingStockItem.Quantity = Number(ExistingStockItem.Quantity) + Number(stockitem.Quantity);
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    stockitem.Id = 0;
                    saveResult = await this.Save(stockitem);
                    stockitem.Id = saveResult.dataValues.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 24) {
            try {
                let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
                if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                    existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                } else {
                    existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                    existingstockitem.Rev = stockitem.Rev;
                }
                await this.Update(existingstockitem);
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        }
        return true;
    }

    public async ManageGrnStockItem(GrnId: number,
        request: any, detail: GrnDetailAttributes): Promise<any> {
        let stockitem = {};
        stockitem = {
            ItemMasterId: detail.ItemMasterId,
            ItemCode: detail.ItemCode,
            ItemName: detail.ItemName,
            Quantity: Number(detail.TotalQuantityAfterConversion),
            StoreMasterId: request.Header.StoreMasterId,
            FacilityId: request.Header.FacilityId
        };

        await this.ManageGrnStock(GrnId, detail.Id, request, stockitem as any, detail);
    }

    public async ManageGrnStock(GrnId: number, GrnDetailId: number, request: any,
        stockitem: StockItemAttributes, detail: any): Promise<boolean> {
        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let ExistingStockItem = await this.GetStockItemIdByFilter({
            Id: 0,
            Data: {
                StoreMasterId: stockitem.StoreMasterId,
                ItemMasterId: stockitem.ItemMasterId
            }
        });
        if (ExistingStockItem !== null) {
            ExistingStockItem.Quantity = ExistingStockItem.Quantity + stockitem.Quantity;
            //saveResult = await this.Update(ExistingStockItem);
            stockitem.Id = ExistingStockItem.Id;
            let stockserialitem = {};
            stockserialitem = {
                StockItemId: stockitem.Id,
                StoreMasterId: stockitem.StoreMasterId,
                BarCodeId: 'GRN123',
                ItemMasterId: stockitem.ItemMasterId,
                ItemCode: stockitem.ItemCode,
                ItemName: stockitem.ItemName,
                BatchId: detail.BatchId || GrnDetailId,
                ExpiryDate: detail.ExpiryDate,
                Quantity: stockitem.Quantity,
                Ucp: detail.UnitCostPrice,
                Mrp: detail.MrPrice,
                GstId: detail.GstId,
                GstPercentage: detail.GstPercentage,
                InGstId: detail.InGstId,
                InGstPercentage: detail.InGstPercentage,
                CGstId: detail.CGstId,
                CGstPercentage: detail.CGstPercentage,
                SGstId: detail.SGstId,
                SGstPercentage: detail.SGstPercentage,
                PurchaseUomId: detail.BaseUomId,
                BaseUomId: detail.BaseUomId,
                SaleUomId: detail.SaleUomId,
                ManufacturerId: detail.ManufacturerId,
                VendorMasterId: detail.VendorMasterId,
                GrnId: GrnId,
                GrnDetailId: GrnDetailId,
                FacilityId: stockitem.FacilityId,
                OrgId: 0,
            };
            await ssiBO.ManageGrnStockSerial(request, stockserialitem as any, detail);
        }
        /*
        if (ExistingStockItem !== null) {
            ExistingStockItem.Quantity = ExistingStockItem.Quantity + stockitem.Quantity;
            saveResult = await this.Update(ExistingStockItem);
            stockitem.Id = ExistingStockItem.Id;
            let stockserialitem = {};
            stockserialitem = {
                StockItemId: stockitem.Id,
                StoreMasterId: stockitem.StoreMasterId,
                BarCodeId: 'GRN123',
                ItemMasterId: stockitem.ItemMasterId,
                ItemCode: stockitem.ItemCode,
                ItemName: stockitem.ItemName,
                BatchId: detail.BatchId || GrnDetailId,
                ExpiryDate: detail.ExpiryDate,
                Quantity: stockitem.Quantity,
                Ucp: detail.UnitCostPrice,
                Mrp: detail.MrPrice,
                GstId: detail.GstId,
                GstPercentage: detail.GstPercentage,
                InGstId: detail.InGstId,
                InGstPercentage: detail.InGstPercentage,
                CGstId: detail.CGstId,
                CGstPercentage: detail.CGstPercentage,
                SGstId: detail.SGstId,
                SGstPercentage: detail.SGstPercentage,
                PurchaseUomId: detail.BaseUomId,
                BaseUomId: detail.BaseUomId,
                SaleUomId: detail.SaleUomId,
                ManufacturerId: detail.ManufacturerId,
                VendorMasterId: detail.VendorMasterId,
                GrnId: GrnId,
                GrnDetailId: GrnDetailId,
                FacilityId: stockitem.FacilityId,
                OrgId: 0,
            };
            await ssiBO.ManageGrnStockSerial(request, stockserialitem as any, detail);
        } else {
            saveResult = await this.Save(stockitem);
            stockitem.Id = saveResult.dataValues.Id;
            let stockserialitem = {};
            stockserialitem = {
                StockItemId: stockitem.Id,
                StoreMasterId: stockitem.StoreMasterId,
                BarCodeId: 'GRN123',
                ItemMasterId: stockitem.ItemMasterId,
                ItemCode: stockitem.ItemCode,
                ItemName: stockitem.ItemName,
                BatchId: detail.BatchId || GrnDetailId,
                ExpiryDate: detail.ExpiryDate,
                Quantity: stockitem.Quantity,
                Ucp: detail.UnitCostPrice,
                Mrp: detail.MrPrice,
                GstId: detail.GstId,
                GstPercentage: detail.GstPercentage,
                InGstId: detail.InGstId,
                InGstPercentage: detail.InGstPercentage,
                CGstId: detail.CGstId,
                CGstPercentage: detail.CGstPercentage,
                SGstId: detail.SGstId,
                SGstPercentage: detail.SGstPercentage,
                PurchaseUomId: detail.BaseUomId,
                BaseUomId: detail.BaseUomId,
                SaleUomId: detail.SaleUomId,
                ManufacturerId: detail.ManufacturerId,
                VendorMasterId: detail.VendorMasterId,
                GrnId: GrnId,
                GrnDetailId: GrnDetailId,
                FacilityId: stockitem.FacilityId,
                OrgId: 0,
            };
            await ssiBO.ManageGrnStockSerial(request, stockserialitem as any, detail);
        }
        */
        return true;
    }

    public async ManageItemStock(movement: any): Promise<boolean> {
        let ExistingItem = await this.GetStockItemIdByFilter({
            Id: 0,
            Data: {
                StoreMasterId: movement.StoreMasterId,
                ItemMasterId: movement.ItemMasterId
            }
        });

        if (ExistingItem !== null) {
            ExistingItem.Quantity = ExistingItem.Quantity + movement.InQty;
            await this.Update(ExistingItem);
        }

        return true;
    }

    public async ManageItemStockAfterPurchaseReturns(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManageItemStockAfterPurchaseReturn(TransactionType, TransactionId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManageItemStockAfterPurchaseReturn(TransactionType: number, TransactionId: number,
        request: any, details: Array<any>): Promise<void> {
        let ExistingItem = await this.GetStockItemIdByFilter({
            Id: 0,
            Data: {
                StoreMasterId: request.Header.StoreMasterId,
                ItemMasterId: details[0].ItemMasterId
            }
        });

        if (ExistingItem !== null) {
            if (request.Header.PrnTypeId === 1) {
                ExistingItem.Quantity =
                    ExistingItem.Quantity - _.sumBy(details, (detail: any) => detail.PrnQuantity);
            } else if (request.Header.PrnTypeId === 2) {
                ExistingItem.Quantity =
                    ExistingItem.Quantity - _.sumBy(details, (detail: any) => detail.TotalQuantityAfterConversion + detail.FreeQty);
            }
            await this.Update(ExistingItem);
        }
    }

    public async ManagePrnStockItem(PurchaseReturnId: number,
        request: any, detail: PurchaseReturnDetailAttributes): Promise<any> {
        let stockitem = {};
        if (request.Header.PrnTypeId === 2) {
            stockitem = {
                Id: detail.StockItemId,
                ItemMasterId: detail.ItemMasterId,
                ItemCode: detail.ItemCode,
                ItemName: detail.ItemName,
                Quantity: Number(detail.TotalQuantityAfterConversion) + Number(detail.FreeQty),
                StoreMasterId: request.Header.StoreMasterId,
                FacilityId: request.Header.FacilityId
            };
        } else {
            stockitem = {
                Id: detail.StockItemId,
                ItemMasterId: detail.ItemMasterId,
                ItemCode: detail.ItemCode,
                ItemName: detail.ItemName,
                Quantity: Number(detail.PrnQuantity) + Number(detail.FreeQty),
                StoreMasterId: request.Header.StoreMasterId,
                FacilityId: request.Header.FacilityId
            };
        }

        await this.ManagePrnStock(detail.PurchaseReturnId, detail.Id, request, stockitem as any, detail);
    }

    public async ManagePrnStock(PurchaseReturnId: number, PurchaseReturnDetailId: number, request: any,
        stockitem: StockItemAttributes, detail: any): Promise<boolean> {
        //let saveResult: any;
        let stockserialitem = {};
        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        if (request.Header.PrnTypeId === 2) {
            //let existingstockitem = await this.GetStockItemById({ Id: detail.StockItemId });
            //existingstockitem.Quantity = existingstockitem.Quantity - stockitem.Quantity;
            //saveResult = await this.Update(existingstockitem);
            stockserialitem = {
                Id: detail.StockSerialItemId,
                StockItemId: detail.StockItemId,
                Quantity: Number(detail.TotalQuantityAfterConversion) + Number(detail.FreeQty),
                GrnId: PurchaseReturnId,
                GrnDetailId: PurchaseReturnDetailId
            };
        } else {
            //let existingstockitem = await this.GetStockItemById({ Id: detail.StockItemId });
            //existingstockitem.Quantity = existingstockitem.Quantity - detail.PrnQuantity;
            //saveResult = await this.Update(existingstockitem);
            stockserialitem = {
                Id: detail.StockSerialItemId,
                StockItemId: detail.StockItemId,
                Quantity: Number(detail.PrnQuantity) + Number(detail.FreeQty),
                GrnId: PurchaseReturnId,
                GrnDetailId: PurchaseReturnDetailId
            };
        }

        await ssiBO.ManagePrnStockSerial(request, stockserialitem as any, detail);

        return true;
    }

    /*
    public async ManageAdjustedStockItem(StockAdjustmentId: number,
        request: any, detail: StockAdjustmentDetailAttributes): Promise<any> {
        let StockSerialDetailsBo = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let serialdetailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: 1, Value: detail.ItemMasterId },
            { Key: 2, Value: detail.StoreMasterId }]
        };
        let StockSerialData: any = [];
        let SerialDetailsData = await StockSerialDetailsBo.GetStockSerialItems(serialdetailReq);
        StockSerialData = SerialDetailsData.Data;
        let SerialQuantity = _.sumBy(StockSerialData, (serialdetail: any) => serialdetail.Quantity);

        let existingstockitem = await this.GetStockItemById({ Id: detail.StockItemId });
        existingstockitem.Quantity = SerialQuantity;
        await this.Update(existingstockitem);
    }
    */

    public async ManageAdjustedStockItems(StockAdjustmentId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });

        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {
                await this.ManageAdjustedStockItem(StockAdjustmentId, request, gi);
            })(groupedItem);
        }));

        return _.filter(groupedItems, (item: any) => { return item.error !== null; });
    }

    public async ManageAdjustedStockItem(StockAdjustmentId: number,
        request: any, itemInfo: any): Promise<void> {
        let details = itemInfo.batches;
        let StockSerialDetailsBo = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let serialdetailReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 1, Value: details[0].ItemMasterId },
            { Key: 2, Value: request.Header.StoreMasterId }]
        };
        let StockSerialData: any = [];
        let SerialDetailsData = await StockSerialDetailsBo.GetStockSerialItems(serialdetailReq);
        StockSerialData = SerialDetailsData.Data;
        let SerialQuantity = _.sumBy(StockSerialData, (serialdetail: any) => serialdetail.Quantity);

        let existingstockitem = await this.GetStockItemById({ Id: details[0].StockItemId });
        existingstockitem.Quantity = SerialQuantity;
        await this.Update(existingstockitem);
    }

    public async ManageStockTransactions(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let StDetails: any = [];
        if (request.Details.length > 0) {
            for (let sdx in request.Details) {
                let stitem = request.Details[sdx];
                if (stitem.Status === 1) {
                    StDetails.push(stitem);
                }
            }
        }
        let details: Array<any> = StDetails;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });


        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {
                await this.ManageStockTransactionItem(TransactionType, TransactionId, request, gi);
            })(groupedItem);
        }));


        // for (var gi = 0; gi < groupedItems.length; gi++) {
        //     await this.ManageStockItem(TransactionType, TransactionId, request, groupedItems[gi]);
        // }

        return _.filter(groupedItems, (item: any) => { return item.error !== null; });
    }

    public async ManageStockTransactionItem(TransactionType: number, TransactionId: number,
        request: any, itemInfo: any): Promise<void> {
        let details = itemInfo.batches;
        let stockitem = {};
        try {
            if (TransactionType === 1) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.TotalConversionQuantity)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    // StockItemId: details[0].StockItemId,
                    StockEntryId: details[0].StockEntryId,
                    StockEntryDetailId: 0
                };
            } else if (TransactionType === 3) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    // StockItemId: details[0].StockItemId,
                    GrnId: details[0].GrnId,
                    GrnDetailId: 0
                };
            } else if (TransactionType === 5) {
                var PrnQty = 0;
                var ReturningGrnId = 0;
                if (request.Header.PrnTypeId === 2) {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
                    ReturningGrnId = request.Header.GrnId;
                } else {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.PrnQuantity));
                }
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: PrnQty,
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: ReturningGrnId,
                    GrnDetailId: 0
                };
            } else if (TransactionType === 9) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 13) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.QtyConsumed),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 15) {
                // var AdjQty = 0;
                // if (request.Header.AdjustmentTypeId === 1) {
                //     AdjQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
                // }
                // if (request.Header.AdjustmentTypeId === 2) {
                //     AdjQty = _.sumBy(details, (detail: any) => detail.QtyAdjusted);
                // }
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    // Quantity: AdjQty,
                    // Quantity: AdjInQty,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted)),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: request.Header.FacilityId,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 19) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.DispensedQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 20) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.AcceptedQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0
                    //Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 21) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.Quantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            } else if (TransactionType === 22) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.ReturnQuantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0
                };
            } else if (TransactionType === 23) {
                let ReceivingStoreId = 0;
                if (request.Header.TransferTypeId === 1 || request.Header.TransferTypeId === 3) {
                    ReceivingStoreId = request.Header.StoreMasterId;
                } else {
                    ReceivingStoreId = request.Header.ToStoreMasterId;
                }
                stockitem = {
                    Id: details[0].RequestedStoreStockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    ItemCode: details[0].ItemCode,
                    ItemName: details[0].ItemName,
                    Quantity: _.sumBy(details, (detail: any) => Number(detail.AcceptedQuantity)),
                    StoreMasterId: ReceivingStoreId,
                    FacilityId: 0,
                    OrgId: 0,
                    StockTransferId: details[0].StockTransferId,
                    StockTransferDetailId: 0
                };
            } else if (TransactionType === 24) {
                stockitem = {
                    Id: details[0].StockItemId,
                    ItemMasterId: details[0].ItemMasterId,
                    Quantity: _.sumBy(details, (detail: any) => detail.Quantity),
                    StoreMasterId: request.Header.StoreMasterId,
                    FacilityId: 0,
                    OrgId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    Rev: details[0].StockItemRev
                };
            }
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            // itemInfo.error = { name: details[0].ItemName };
            throw { message: 'Error in Updating Stock' };
        }

        try {
            await this.ManageStockTransaction(TransactionType, stockitem as any, details);
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            itemInfo.error = { name: details[0].ItemName };
        }
    }

    public async ManageStockTransaction(TransactionType: number, stockitem: StockItemAttributes, details: Array<any>): Promise<boolean> {
        let saveResult: any;
        let serialitems = details;
        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);

        if (TransactionType === 1) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.ItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } else {
                stockitem.Id = 0;
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            }
        } else if (TransactionType === 3) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.ItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } else {
                stockitem.Id = 0;
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            }
        } else if (TransactionType === 5) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.ItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                if (ExistingStockItem.Quantity >= stockitem.Quantity) {
                    ExistingStockItem.Quantity = ExistingStockItem.Quantity - Number(stockitem.Quantity);
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                } else {
                    ExistingStockItem.Quantity = 0;
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                    await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
                }
            } else {
                throw { code: 'NO_EXISTING_STOCK_ITEM' };
            }
        } else if (TransactionType === 9) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
            existingstockitem.Rev = stockitem.Rev;
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        } else if (TransactionType === 13) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity > stockitem.Quantity) {
                existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            } else {
                existingstockitem.Quantity = 0;
            }
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        } else if (TransactionType === 15) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            if (serialitems[0].AdjustmentTypeId === 1) {
                existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
            }
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        } else if (TransactionType === 19) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
            existingstockitem.Rev = stockitem.Rev;
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        } else if (TransactionType === 20) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
            //existingstockitem.Rev = stockitem.Rev;
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        } else if (TransactionType === 21) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            }
            try {
                await this.Update(existingstockitem);
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }

        } else if (TransactionType === 22) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                existingstockitem.Quantity = existingstockitem.Quantity + Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity + Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            }
            try {
                console.log('**********stockitemexistingstockitem***********', existingstockitem);
                await this.Update(existingstockitem);
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } catch (ex) {
                throw { message: 'Error in Updating Stock' };
            }
        } else if (TransactionType === 23) {
            // let ExistingStockItem = await this.GetStockItemIdByFilter({
            //     Id: 0,
            //     Data: {
            //         StoreMasterId: stockitem.StoreMasterId,
            //         ItemMasterId: stockitem.ItemMasterId
            //     }
            // });
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.ItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = Number(ExistingStockItem.Quantity) + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            } else {
                stockitem.Id = 0;
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
                await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
            }
        } else if (TransactionType === 24) {
            let existingstockitem = await this.GetStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            }
            await this.Update(existingstockitem);
            await ssiBO.ManageSerialItems(TransactionType, stockitem, details);
        }
        return true;
    }
}
