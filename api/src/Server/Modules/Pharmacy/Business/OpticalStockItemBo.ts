import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OpticalStockItemInstance, OpticalStockItemAttributes/*, OpticalItemMasterAttributes */ } from '../Model/Interface/Index';
//import { BoFactory } from '../../Base/Business/Index';
//import * as bo from '../../Pharmacy/Business/Index';
import { OpticalStockItemFilters/*, StoreMasterFilters */ } from '../Common/Filters.e';
import * as _ from 'lodash';

export class OpticalStockItemBo extends BaseBo<OpticalStockItemInstance, OpticalStockItemAttributes> {
    public async AddOpticalStockItem(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let storeduplicate = await this.FindAll({
            where: {
                'OpticalItemMasterId': req.Data['OpticalItemMasterId'],
                'StoreMasterId': req.Data['StoreMasterId']
            }
        });
        if (storeduplicate && storeduplicate.length > 0) {
            throw { code: 'THIS_STORE_ALREADY_MAPPED' };
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOpticalStockItem(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOpticalStockItemById(req: BaseRequest): Promise<OpticalStockItemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOpticalStockItems(apiReq?: ApiRequest<OpticalStockItemFilters>): Promise<ApiResponse<OpticalStockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('OpticalProductType'));
        include.push({ model: this.Models.UomMaster, as: 'UomMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({
            model: this.Models.OpticalItemMaster, attributes: ['ItemCode', 'ItemName', 'Rate',
                'GSTPercentage', 'HikePercentage', 'SalesPrice'], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalStockItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OpticalStockItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.OpticalItemMasterId:
                        where['OpticalItemMasterId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.OpticalProductTypeId:
                        where['OpticalProductTypeId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.ItemCode:
                        where['ItemCode'] = { '$like': + '%' + param.Value + '%' };
                        break;
                    case OpticalStockItemFilters.ItemName:
                        where['ItemName'] = { '$like': + '%' + param.Value + '%' };
                        break;
                    case OpticalStockItemFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.ItemNameAndCode:
                        (where as any)[Op.or] = [{ ItemName: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetOpticalStoreItems(apiReq?: ApiRequest<OpticalStockItemFilters>): Promise<ApiResponse<OpticalStockItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalStockItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OpticalStockItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.OpticalItemMasterId:
                        where['OpticalItemMasterId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.ItemNameAndCode:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case OpticalStockItemFilters.OpticalCategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.OpticalProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case OpticalStockItemFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.OpticalItemMaster,
            required: true,
            include: [
                //{ model: this.Models.OpticalProductType, required: false },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false }
            ]
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteOpticalStockItem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalStockItemInstance, OpticalStockItemAttributes> {
        return this.Models.OpticalStockItem;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OpticalStockItemFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ItemName', 'Text'], 'ItemName', 'ItemCode'];
        let val = await this.GetOpticalStockItems(apiReq);
        return { [key]: val.Data };
    }

    public async GetStockItemIdByFilter(req: BaseRequest): Promise<any> {
        let stockitem = null;
        let filterInfo = req.Data;
        let stockitemInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                OpticalItemMasterId: filterInfo.OpticalItemMasterId
            }
        });
        if (stockitemInstance) {
            stockitem = this.GetAttribute(stockitemInstance);
        }
        return stockitem;
    }

    public async ManageOpticalStockItems(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        /*
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.OpticalItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });
        */

        /*
        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {
                await this.ManageStockItem(TransactionType, TransactionId, request, gi);
            })(groupedItem);
        }));
        */

        for (var gi = 0; gi < details.length; gi++) {
            await this.ManageOpticalStockItem(TransactionType, TransactionId, request, details[gi]);
        }

        return _.filter(details, (item: any) => {
            return item.error !== null;
        });
    }

    public async ManageOpticalStockItem(TransactionType: number, TransactionId: number,
        request: any, itemInfo: any): Promise<void> {
        let details = itemInfo;
        let stockitem = {};

        if (TransactionType === 1) {
            stockitem = {
                ItemMasterId: details.OpticalItemMasterId,
                ItemCode: details.ItemCode,
                ItemName: details.ItemName,
                Quantity: Number(details.EntryQuantity),
                StoreMasterId: request.Header.StoreMasterId,
                FacilityId: request.Header.FacilityId,
                OrgId: 0,
                StockItemId: details.OpticalStockItemId,
                StockEntryId: details.StockEntryId,
                StockEntryDetailId: 0
            };
        } else if (TransactionType === 3) {
            stockitem = {
                OpticalItemMasterId: details.OpticalItemMasterId,
                ItemCode: details.ItemCode,
                ItemName: details.ItemName,
                Quantity: Number(details.TotalQuantityAfterConversion),
                StoreMasterId: request.Header.StoreMasterId,
                FacilityId: request.Header.FacilityId,
                OrgId: 0,
                StockItemId: details.OpticalStockItemId
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
            stockitem = {
                Id: details[0].StockItemId,
                ItemMasterId: details[0].ItemMasterId,
                Quantity: _.sumBy(details, (detail: any) => detail.QtyAdjusted),
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
            };
        } else if (TransactionType === 21) {
            stockitem = {
                Id: details.OpticalStockItemId,
                ItemMasterId: details.OpticalItemMasterId,
                Quantity: details.Quantity,
                StoreMasterId: request.Header.StoreMasterId,
                FacilityId: 0,
                OrgId: 0,
                GrnId: 0,
                GrnDetailId: 0,
                Rev: details.StockItemRev
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
            if (request.Header.TransferTypeId === 3) {
                ReceivingStoreId = request.Header.StoreMasterId;
            } else {
                ReceivingStoreId = request.Header.ToStoreMasterId;
            }
            stockitem = {
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

        try {
            await this.ManageOpticalStock(TransactionType, stockitem as any, details);
        } catch (ex) {
            itemInfo.error = { name: details.ItemName };
        }
    }

    public async ManageOpticalStock(TransactionType: number, stockitem: OpticalStockItemAttributes, details: Array<any>): Promise<boolean> {
        let saveResult: any;
        let serialitems = details;
        if (TransactionType === 1) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.OpticalItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
            } else {
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
            }
        } else if (TransactionType === 3) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    OpticalItemMasterId: stockitem.OpticalItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = ExistingStockItem.Quantity + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
            } else {
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
            }
        } else if (TransactionType === 5) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.OpticalItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                if (ExistingStockItem.Quantity >= stockitem.Quantity) {
                    ExistingStockItem.Quantity = ExistingStockItem.Quantity - Number(stockitem.Quantity);
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                } else {
                    ExistingStockItem.Quantity = 0;
                    saveResult = await this.Update(ExistingStockItem);
                    stockitem.Id = ExistingStockItem.Id;
                }
            } else {
                throw { code: 'NO_EXISTING_STOCK_ITEM' };
            }
        } else if (TransactionType === 9) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
            existingstockitem.Rev = stockitem.Rev;
            await this.Update(existingstockitem);
        } else if (TransactionType === 13) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity > stockitem.Quantity) {
                existingstockitem.Quantity = existingstockitem.Quantity - stockitem.Quantity;
                existingstockitem.Rev = stockitem.Rev;
            } else {
                existingstockitem.Quantity = 0;
            }
            await this.Update(existingstockitem);
        } else if (TransactionType === 15) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            if (serialitems[0].AdjustedTypeId === 1) {
                existingstockitem.Quantity = existingstockitem.Quantity + stockitem.Quantity;
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity - stockitem.Quantity;
            }
            await this.Update(existingstockitem);
        } else if (TransactionType === 19) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) - Number(stockitem.Quantity);
            existingstockitem.Rev = stockitem.Rev;
            await this.Update(existingstockitem);
        } else if (TransactionType === 20) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = Number(existingstockitem.Quantity) + Number(stockitem.Quantity);
            await this.Update(existingstockitem);
        } else if (TransactionType === 21) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            }
            await this.Update(existingstockitem);
        } else if (TransactionType === 22) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            existingstockitem.Quantity = existingstockitem.Quantity + stockitem.Quantity;
            await this.Update(existingstockitem);
        } else if (TransactionType === 23) {
            let ExistingStockItem = await this.GetStockItemIdByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: stockitem.StoreMasterId,
                    ItemMasterId: stockitem.OpticalItemMasterId
                }
            });
            if (ExistingStockItem !== null) {
                ExistingStockItem.Quantity = Number(ExistingStockItem.Quantity) + Number(stockitem.Quantity);
                saveResult = await this.Update(ExistingStockItem);
                stockitem.Id = ExistingStockItem.Id;
            } else {
                saveResult = await this.Save(stockitem);
                stockitem.Id = saveResult.dataValues.Id;
            }
        } else if (TransactionType === 24) {
            let existingstockitem = await this.GetOpticalStockItemById({ Id: stockitem.Id });
            if (existingstockitem.Quantity >= Number(stockitem.Quantity)) {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
            } else {
                existingstockitem.Quantity = existingstockitem.Quantity - Number(stockitem.Quantity);
                existingstockitem.Rev = stockitem.Rev;
            }
            await this.Update(existingstockitem);
        }
        return true;
    }
}
