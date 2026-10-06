import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockSerialMovementInstance, StockSerialMovementAttributes } from '../Model/Interface/Index';
import { StockSerialMovementFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';

export class StockSerialMovementBo extends BaseBo<StockSerialMovementInstance, StockSerialMovementAttributes> {
    public async AddStockSerialMovement(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockSerialMovement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageStockSerialMovements(StockMovementId: number, details: StockSerialMovementAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.StockMovementId = StockMovementId;
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

    public async GetStockSerialMovementById(req: BaseRequest): Promise<StockSerialMovementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockSerialMovements(apiReq?: ApiRequest<StockSerialMovementFilters>):
        Promise<ApiResponse<StockSerialMovementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let ItemWhere: WhereOptions<any> = {};
        let StockMovWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        let isReqstockMovSearch: boolean = false;
        let stockserialWhere: WhereOptions<any> = {};
        let isReqstockserialSearch: boolean = false;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockSerialMovementFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockSerialMovementFilters.StockMovementId:
                        where['StockMovementId'] = param.Value;
                        break;
                    case StockSerialMovementFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockSerialMovementFilters.ProductTypeId:
                        ItemWhere['ProductTypeId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case StockSerialMovementFilters.TransactionDate:
                        StockMovWhere['TransactionDate'] = { '$between': param.Value };
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.From:
                        StockMovWhere['TransactionDate'] = StockMovWhere['TransactionDate'] || {};
                        (StockMovWhere['TransactionDate'] as any)['$gte'] = param.Value;
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.To:
                        StockMovWhere['TransactionDate'] = StockMovWhere['TransactionDate'] || {};
                        (StockMovWhere['TransactionDate'] as any)['$lte'] = param.Value;
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.FacilityId:
                        StockMovWhere['FacilityId'] = param.Value;
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.StoreMasterId:
                        StockMovWhere['StoreMasterId'] = param.Value;
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.StoreMasterId:
                        StockMovWhere['StoreMasterId'] = param.Value;
                        isReqstockMovSearch = true;
                        break;
                    case StockSerialMovementFilters.StockSerialItemId:
                        stockserialWhere['StockSerialItemId'] = param.Value;
                        isReqstockserialSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster,
            attributes: ['ItemName', 'ProductTypeId', 'ProductRegNo',
                'SubCategoryId'], required: isReqItemSearch, where: ItemWhere,
            include: [
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.StockMovement,
            required: isReqstockMovSearch, where: StockMovWhere,
        });
        include.push({
            model: this.Models.StockSerialItem,
            required: isReqstockserialSearch, where: stockserialWhere,

        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockSerialMovement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ManageSerialMovementsAfterAdjustment(movement: any, serialDetails: Array<any>): Promise<boolean> {
        let serialMovement = {};
        let StockSerialDetailsBo = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
        let serialdetailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: 1, Value: movement.ItemMasterId },
            { Key: 2, Value: movement.StoreMasterId }]
        };
        let StockSerialData: any = [];
        let SerialDetailsData = await StockSerialDetailsBo.GetStockSerialItems(serialdetailReq);
        StockSerialData = SerialDetailsData.Data;

        await Promise.all(StockSerialData.map((StockSerialDetail: any) => {
            return (async (sd) => {
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: StockSerialDetail.Id,
                    StockSerialItemId: StockSerialDetail.Id,
                    BarCodeId: StockSerialDetail.BarCodeId,
                    ItemMasterId: StockSerialDetail.ItemMasterId,
                    BatchId: StockSerialDetail.BatchId,
                    ExpiryDate: StockSerialDetail.ExpiryDate,
                    InQty: StockSerialDetail.Quantity,
                    TotalAFQty: StockSerialDetail.Quantity,
                    Ucp: StockSerialDetail.Ucp,
                    Mrp: StockSerialDetail.Mrp,
                    GstId: StockSerialDetail.GstId,
                    GstPercentage: StockSerialDetail.GstPercentage,
                    InGstId: StockSerialDetail.InGstId,
                    InGstPercentage: StockSerialDetail.InGstPercentage,
                    CGstId: StockSerialDetail.CGstId,
                    CGstPercentage: StockSerialDetail.CGstPercentage,
                    SGstId: StockSerialDetail.SGstId,
                    SGstPercentage: StockSerialDetail.SGstPercentage,
                    BaseUomId: StockSerialDetail.BaseUomId,
                    PurchaseUomId: StockSerialDetail.PurchaseUomId,
                    SaleUomId: StockSerialDetail.SaleUomId,
                    ManufacturerId: StockSerialDetail.ManufacturerId,
                    VendorMasterId: StockSerialDetail.VendorMasterId,
                    GrnId: StockSerialDetail.GrnId,
                    GrnDetailId: StockSerialDetail.GrnDetailId,
                    FacilityId: StockSerialDetail.FacilityId,
                    OrgId: StockSerialDetail.OrgId
                };
                await this.Save(serialMovement as any);
            })(StockSerialDetail);
        }));

        return true;
    }

    public async ManageSerialMovements(movement: any, serialDetails: Array<any>): Promise<boolean> {
        await Promise.all(serialDetails.map((detail: any) => {
            return (async (sd) => {
                await this.ManageSerialMovement(movement, sd);
            })(detail);
        }));
        return true;
    }
    public async GetClosingStockMovByFilter(req: BaseRequest): Promise<any> {
        let stockmovement = null;
        let filterInfo = req.Data;
        let stocksermovementInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                BatchId: filterInfo.BatchId,
                ItemMasterId: filterInfo.ItemMasterId,
                StockSerialItemId: filterInfo.StockSerialItemId
            },
            order: [['StockSerialMovementId', 'DESC']],
            limit: 1
        });
        if (stocksermovementInstance) {
            stockmovement = this.GetAttribute(stocksermovementInstance);
        }
        return stockmovement;
    }

    public async ManageSerialMovement(movement: any, serialDetail: any): Promise<boolean> {
        let serialMovement = {};
        let SerialInQty = 0;
        let SerialOutQty = 0;
        try {
            let ItemPrevClosingStockserMov = await this.GetClosingStockMovByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: movement.StoreMasterId,
                    BatchId: serialDetail.BatchId,
                    ItemMasterId: movement.ItemMasterId,
                    StockSerialItemId: serialDetail.StockSerialItemId
                }
            });

            if (movement.TransactionTypeId === 1) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    // movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(serialDetail.TotalConversionQuantity);
                } else {
                    movement.TotalBFQty = 0;
                    // movement.TotalAFQty = Number(movement.InQty);
                    movement.TotalAFQty = Number(serialDetail.TotalConversionQuantity);
                }
                SerialInQty = Number(serialDetail.TotalConversionQuantity);
                if (movement.IsMultiUse) {
                    serialMovement = {
                        StockMovementId: movement.Id,
                        TransactionDate: movement.TransactionDate,
                        TransactionDetailId: serialDetail.Id,
                        StockSerialItemId: serialDetail.StockSerialItemId,
                        BarCodeId: 'OSE123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        FacilityId: movement.FacilityId,
                        StoreMasterId: movement.StoreMasterId,
                        BatchId: serialDetail.BatchId,
                        ExpiryDate: serialDetail.ExpiryDate,
                        InQty: SerialInQty,
                        OutQty: SerialOutQty,
                        TotalBFQty: movement.TotalBFQty,
                        TotalAFQty: movement.TotalAFQty,
                        Ucp: serialDetail.UnitCostPrice,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: (serialDetail.MrPrice) / (serialDetail.NoOfTransactions),
                        TotalTransactions: serialDetail.NoOfTransactions,
                        ConsumedTransactions: '0',
                        PendingTransactions: '0',
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: 0,
                        StockEntryId: serialDetail.StockEntryId,
                        StockEntryDetailId: serialDetail.Id
                    };
                } else {
                    serialMovement = {
                        StockMovementId: movement.Id,
                        TransactionDate: movement.TransactionDate,
                        TransactionDetailId: serialDetail.Id,
                        StockSerialItemId: serialDetail.StockSerialItemId,
                        BarCodeId: 'OSE123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        FacilityId: movement.FacilityId,
                        StoreMasterId: movement.StoreMasterId,
                        BatchId: serialDetail.BatchId,
                        ExpiryDate: serialDetail.ExpiryDate,
                        InQty: SerialInQty,
                        OutQty: SerialOutQty,
                        TotalBFQty: movement.TotalBFQty,
                        // TotalAFQty: SerialInQty,
                        TotalAFQty: movement.TotalAFQty,
                        Ucp: serialDetail.UnitCostPrice,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: 0,
                        TotalTransactions: serialDetail.NoOfTransactions,
                        ConsumedTransactions: '0',
                        PendingTransactions: '0',
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: 0,
                        StockEntryId: serialDetail.StockEntryId,
                        StockEntryDetailId: serialDetail.Id
                    };
                }
                // try {
                await this.Save(serialMovement as any);
                // } catch (ex) {
                //     throw { message: 'Some Network Issue.. Please try again' };
                // }
            } else if (movement.TransactionTypeId === 3) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialInQty = serialDetail.TotalQuantityAfterConversion;
                var ucp = 0;
                if(serialDetail.NetAmount && serialDetail.NetAmount > 0) {
                    if(serialDetail.TotalQuantityAfterConversion > 0) {
                        ucp = (serialDetail.NetAmount) / (serialDetail.TotalQuantityAfterConversion);
                    } else {
                        ucp = (serialDetail.UnitCostPrice || 0);
                    }
                } else {
                    ucp = (serialDetail.UnitCostPrice || 0);
                }
                if (movement.IsMultiUse) {
                    serialMovement = {
                        StockMovementId: movement.Id,
                        TransactionDate: movement.TransactionDate,
                        TransactionDetailId: serialDetail.Id,
                        StockSerialItemId: serialDetail.StockSerialItemId,
                        BarCodeId: 'GRN123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        FacilityId: serialDetail.FacilityId,
                        StoreMasterId: movement.StoreMasterId,
                        BatchId: serialDetail.BatchId,
                        ExpiryDate: serialDetail.ExpiryDate,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: (serialDetail.MrPrice) / (serialDetail.NoOfTransactions),
                        TotalTransactions: serialDetail.NoOfTransactions,
                        ConsumedTransactions: '0',
                        PendingTransactions: '0',
                        InQty: SerialInQty,
                        OutQty: SerialOutQty,
                        TotalBFQty: movement.TotalBFQty,
                        TotalAFQty: SerialInQty,
                        // Ucp: serialDetail.UnitCostPrice,
                        Ucp: ucp,
                        Mrp: serialDetail.MrPrice,
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.Id
                    };
                } else {
                    serialMovement = {
                        StockMovementId: movement.Id,
                        TransactionDate: movement.TransactionDate,
                        TransactionDetailId: serialDetail.Id,
                        StockSerialItemId: serialDetail.StockSerialItemId,
                        BarCodeId: 'GRN123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        BatchId: serialDetail.BatchId,
                        FacilityId: serialDetail.FacilityId,
                        StoreMasterId: movement.StoreMasterId,
                        ExpiryDate: serialDetail.ExpiryDate,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: 0,
                        TotalTransactions: serialDetail.NoOfTransactions,
                        ConsumedTransactions: '0',
                        PendingTransactions: '0',
                        InQty: SerialInQty,
                        OutQty: SerialOutQty,
                        TotalBFQty: movement.TotalBFQty,
                        TotalAFQty: SerialInQty,
                        // Ucp: serialDetail.UnitCostPrice,
                        Ucp: ucp,
                        Mrp: serialDetail.MrPrice,
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.Id
                    };
                }
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 5) {

                let ReturningGrnId = 0;
                let ReturningGrnDetailId = 0;
                if (serialDetail.PrnTypeId === 2) {
                    SerialOutQty = Number(serialDetail.TotalQuantityAfterConversion);
                    ReturningGrnId = serialDetail.GrnId;
                    ReturningGrnDetailId = serialDetail.GrnDetailId;
                } else {
                    SerialOutQty = Number(serialDetail.PrnQuantity);
                }
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(SerialOutQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(SerialOutQty);
                }
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'PRN123',
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnId: ReturningGrnId,
                    GrnDetailId: ReturningGrnDetailId
                };
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 9) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(movement.OutQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.OutQty);
                }
                SerialOutQty = Number(serialDetail.TransferedQuantity);
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnId: serialDetail.GrnId,
                    GrnDetailId: serialDetail.GrnDetailId,
                    StockEntryId: serialDetail.StockEntryId,
                    StockEntryDetailId: serialDetail.StockEntryDetailId
                };
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 13) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = Number(ItemPrevClosingStockserMov.TotalAFQty) - Number(movement.OutQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.OutQty);
                }
                SerialOutQty = serialDetail.QtyConsumed;
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.PurchaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnId: serialDetail.GrnId,
                    GrnDetailId: serialDetail.GrnDetailId
                };
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 15) {

                if (serialDetail.AdjustmentTypeId === 1) {
                    SerialInQty = serialDetail.QtyAdjusted;
                    if (ItemPrevClosingStockserMov !== null) {
                        movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(SerialInQty);
                    } else {
                        movement.TotalBFQty = 0;
                        movement.TotalAFQty = Number(SerialInQty);
                    }
                }

                if (serialDetail.AdjustmentTypeId === 2) {
                    SerialOutQty = serialDetail.QtyAdjusted;
                    if (ItemPrevClosingStockserMov !== null) {
                        movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(SerialOutQty);
                    } else {
                        movement.TotalBFQty = 0;
                        movement.TotalAFQty = Number(SerialOutQty);
                    }
                }
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDetailId: serialDetail.Id,
                    TransactionDate: movement.TransactionDate,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'STADJ123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.PurchaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId
                };
                // try {
                await this.Save(serialMovement as any);
                // } catch (ex) {
                //     throw { message: 'Some Network Issue.. Please try again' };
                // }
            } else if (movement.TransactionTypeId === 19) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    // movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(movement.OutQty);
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(serialDetail.DispensedQuantity);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialOutQty = Number(serialDetail.DispensedQuantity);
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnId: serialDetail.GrnId,
                    GrnDetailId: serialDetail.GrnDetailId,
                    StockEntryId: serialDetail.StockEntryId,
                    StockEntryDetailId: serialDetail.StockEntryDetailId
                };
                // try {
                await this.Save(serialMovement as any);
                // } catch (ex) {
                //     throw { message: 'Some Network Issue.. Please try again' };
                // }
            } else if (movement.TransactionTypeId === 20) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialInQty = Number(serialDetail.AcceptedQuantity);
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: 0,
                    VendorMasterId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    StockEntryId: 0,
                    StockEntryDetailId: 0
                };
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 21) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    // movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty - Number(serialDetail.Quantity);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialOutQty = Number(serialDetail.Quantity);
                if (movement.IsMultiUse) {
                    if (!serialDetail.PendingTransactions) {
                        serialMovement = {
                            StockMovementId: movement.Id,
                            TransactionDate: movement.TransactionDate,
                            TransactionDetailId: serialDetail.Id,
                            StockSerialItemId: serialDetail.StockSerialItemId,
                            BarCodeId: 'ABC123',
                            FacilityId: movement.FacilityId,
                            StoreMasterId: movement.StoreMasterId,
                            ItemMasterId: serialDetail.ItemMasterId,
                            BatchId: serialDetail.BatchId,
                            ExpiryDate: serialDetail.ExpiryDate,
                            IsMultiUse: serialDetail.IsMultiUse,
                            ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                            TotalTransactions: serialDetail.TotalTransactions,
                            ConsumedTransactions: serialDetail.ConsumedTransactions,
                            PendingTransactions: serialDetail.PendingTransactions,
                            TotalBFQty: Number(serialDetail.BatchQuantity),
                            InQty: SerialInQty,
                            OutQty: SerialOutQty,
                            TotalAFQty: 0,
                            Ucp: serialDetail.UnitCostPrice,
                            Mrp: serialDetail.MrPrice,
                            GstId: serialDetail.GSTId,
                            GstPercentage: serialDetail.GSTPercentage,
                            InGstId: serialDetail.InGstId,
                            InGstPercentage: serialDetail.InGstPercentage,
                            CGstId: serialDetail.CGstId,
                            CGstPercentage: serialDetail.CGstPercentage,
                            SGstId: serialDetail.SGstId,
                            SGstPercentage: serialDetail.SGstPercentage,
                            PurchaseUomId: serialDetail.BaseUomId,
                            BaseUomId: serialDetail.BaseUomId,
                            SaleUomId: serialDetail.SaleUomId,
                            ManufacturerId: serialDetail.ManufacturerId,
                            VendorMasterId: serialDetail.VendorMasterId,
                            GrnId: serialDetail.GrnId,
                            GrnDetailId: serialDetail.GrnDetailId,
                            StockEntryId: serialDetail.StockEntryId,
                            StockEntryDetailId: serialDetail.StockEntryDetailId
                        };
                    } else if (Number(serialDetail.ConsumedPerTransactions) === Number(serialDetail.ItemPossibleTransactions)) {
                        serialMovement = {
                            StockMovementId: movement.Id,
                            TransactionDate: movement.TransactionDate,
                            TransactionDetailId: serialDetail.Id,
                            StockSerialItemId: serialDetail.StockSerialItemId,
                            BarCodeId: 'ABC123',
                            FacilityId: movement.FacilityId,
                            StoreMasterId: movement.StoreMasterId,
                            ItemMasterId: serialDetail.ItemMasterId,
                            BatchId: serialDetail.BatchId,
                            ExpiryDate: serialDetail.ExpiryDate,
                            IsMultiUse: serialDetail.IsMultiUse,
                            ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                            TotalTransactions: serialDetail.TotalTransactions,
                            ConsumedTransactions: serialDetail.ConsumedTransactions,
                            PendingTransactions: serialDetail.PendingTransactions,
                            TotalBFQty: Number(serialDetail.BatchQuantity),
                            InQty: SerialInQty,
                            OutQty: SerialOutQty,
                            TotalAFQty: Number(serialDetail.Quantity) - 1,
                            Ucp: serialDetail.UnitCostPrice,
                            Mrp: serialDetail.MrPrice,
                            GstId: serialDetail.GSTId,
                            GstPercentage: serialDetail.GSTPercentage,
                            InGstId: serialDetail.InGstId,
                            InGstPercentage: serialDetail.InGstPercentage,
                            CGstId: serialDetail.CGstId,
                            CGstPercentage: serialDetail.CGstPercentage,
                            SGstId: serialDetail.SGstId,
                            SGstPercentage: serialDetail.SGstPercentage,
                            PurchaseUomId: serialDetail.BaseUomId,
                            BaseUomId: serialDetail.BaseUomId,
                            SaleUomId: serialDetail.SaleUomId,
                            ManufacturerId: serialDetail.ManufacturerId,
                            VendorMasterId: serialDetail.VendorMasterId,
                            GrnId: serialDetail.GrnId,
                            GrnDetailId: serialDetail.GrnDetailId,
                            StockEntryId: serialDetail.StockEntryId,
                            StockEntryDetailId: serialDetail.StockEntryDetailId
                        };
                    } else if (Number(serialDetail.ConsumedPerTransactions) > Number(serialDetail.ItemPossibleTransactions)) {
                        serialMovement = {
                            StockMovementId: movement.Id,
                            TransactionDate: movement.TransactionDate,
                            TransactionDetailId: serialDetail.Id,
                            StockSerialItemId: serialDetail.StockSerialItemId,
                            BarCodeId: 'ABC123',
                            ItemMasterId: serialDetail.ItemMasterId,
                            BatchId: serialDetail.BatchId,
                            FacilityId: movement.FacilityId,
                            StoreMasterId: movement.StoreMasterId,
                            ExpiryDate: serialDetail.ExpiryDate,
                            IsMultiUse: serialDetail.IsMultiUse,
                            ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                            TotalTransactions: serialDetail.TotalTransactions,
                            ConsumedTransactions: serialDetail.ConsumedTransactions,
                            PendingTransactions: serialDetail.PendingTransactions,
                            TotalBFQty: Number(serialDetail.BatchQuantity),
                            InQty: SerialInQty,
                            OutQty: SerialOutQty,
                            TotalAFQty: Number(serialDetail.ConsumedTransactions) / Number(serialDetail.ItemPossibleTransactions),
                            Ucp: serialDetail.UnitCostPrice,
                            Mrp: serialDetail.MrPrice,
                            GstId: serialDetail.GSTId,
                            GstPercentage: serialDetail.GSTPercentage,
                            InGstId: serialDetail.InGstId,
                            InGstPercentage: serialDetail.InGstPercentage,
                            CGstId: serialDetail.CGstId,
                            CGstPercentage: serialDetail.CGstPercentage,
                            SGstId: serialDetail.SGstId,
                            SGstPercentage: serialDetail.SGstPercentage,
                            PurchaseUomId: serialDetail.BaseUomId,
                            BaseUomId: serialDetail.BaseUomId,
                            SaleUomId: serialDetail.SaleUomId,
                            ManufacturerId: serialDetail.ManufacturerId,
                            VendorMasterId: serialDetail.VendorMasterId,
                            GrnId: serialDetail.GrnId,
                            GrnDetailId: serialDetail.GrnDetailId,
                            StockEntryId: serialDetail.StockEntryId,
                            StockEntryDetailId: serialDetail.StockEntryDetailId
                        };
                    } else if (Number(serialDetail.ConsumedPerTransactions) < Number(serialDetail.ItemPossibleTransactions)) {
                        if (Number(serialDetail.ConsumedTransactions) === Number(serialDetail.ItemPossibleTransactions)) {
                            serialMovement = {
                                StockMovementId: movement.Id,
                                TransactionDate: movement.TransactionDate,
                                TransactionDetailId: serialDetail.Id,
                                StockSerialItemId: serialDetail.StockSerialItemId,
                                BarCodeId: 'ABC123',
                                ItemMasterId: serialDetail.ItemMasterId,
                                BatchId: serialDetail.BatchId,
                                FacilityId: movement.FacilityId,
                                StoreMasterId: movement.StoreMasterId,
                                ExpiryDate: serialDetail.ExpiryDate,
                                IsMultiUse: serialDetail.IsMultiUse,
                                ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                                TotalTransactions: serialDetail.TotalTransactions,
                                ConsumedTransactions: serialDetail.ConsumedTransactions,
                                PendingTransactions: serialDetail.PendingTransactions,
                                TotalBFQty: Number(serialDetail.BatchQuantity),
                                InQty: SerialInQty,
                                OutQty: SerialOutQty,
                                TotalAFQty: Number(serialDetail.BatchQuantity) - 1,
                                Ucp: serialDetail.UnitCostPrice,
                                Mrp: serialDetail.MrPrice,
                                GstId: serialDetail.GSTId,
                                GstPercentage: serialDetail.GSTPercentage,
                                InGstId: serialDetail.InGstId,
                                InGstPercentage: serialDetail.InGstPercentage,
                                CGstId: serialDetail.CGstId,
                                CGstPercentage: serialDetail.CGstPercentage,
                                SGstId: serialDetail.SGstId,
                                SGstPercentage: serialDetail.SGstPercentage,
                                PurchaseUomId: serialDetail.BaseUomId,
                                BaseUomId: serialDetail.BaseUomId,
                                SaleUomId: serialDetail.SaleUomId,
                                ManufacturerId: serialDetail.ManufacturerId,
                                VendorMasterId: serialDetail.VendorMasterId,
                                GrnId: serialDetail.GrnId,
                                GrnDetailId: serialDetail.GrnDetailId,
                                StockEntryId: serialDetail.StockEntryId,
                                StockEntryDetailId: serialDetail.StockEntryDetailId
                            };
                        } else if (Number(serialDetail.ConsumedTransactions) > Number(serialDetail.ItemPossibleTransactions)) {
                            let ConsumeTrans =
                                Number(serialDetail.ConsumedTransactions) % Number(serialDetail.ItemPossibleTransactions);
                            let CTrans = Math.trunc(ConsumeTrans);
                            if (CTrans === 0 || 1) {
                                serialMovement = {
                                    StockMovementId: movement.Id,
                                    TransactionDate: movement.TransactionDate,
                                    TransactionDetailId: serialDetail.Id,
                                    StockSerialItemId: serialDetail.StockSerialItemId,
                                    BarCodeId: 'ABC123',
                                    ItemMasterId: serialDetail.ItemMasterId,
                                    BatchId: serialDetail.BatchId,
                                    FacilityId: movement.FacilityId,
                                    StoreMasterId: movement.StoreMasterId,
                                    ExpiryDate: serialDetail.ExpiryDate,
                                    IsMultiUse: serialDetail.IsMultiUse,
                                    ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                                    TotalTransactions: serialDetail.TotalTransactions,
                                    ConsumedTransactions: serialDetail.ConsumedTransactions,
                                    PendingTransactions: serialDetail.PendingTransactions,
                                    TotalBFQty: Number(serialDetail.BatchQuantity),
                                    InQty: SerialInQty,
                                    OutQty: SerialOutQty,
                                    TotalAFQty: Number(serialDetail.BatchQuantity) - 1,
                                    Ucp: serialDetail.UnitCostPrice,
                                    Mrp: serialDetail.MrPrice,
                                    GstId: serialDetail.GSTId,
                                    GstPercentage: serialDetail.GSTPercentage,
                                    InGstId: serialDetail.InGstId,
                                    InGstPercentage: serialDetail.InGstPercentage,
                                    CGstId: serialDetail.CGstId,
                                    CGstPercentage: serialDetail.CGstPercentage,
                                    SGstId: serialDetail.SGstId,
                                    SGstPercentage: serialDetail.SGstPercentage,
                                    PurchaseUomId: serialDetail.BaseUomId,
                                    BaseUomId: serialDetail.BaseUomId,
                                    SaleUomId: serialDetail.SaleUomId,
                                    ManufacturerId: serialDetail.ManufacturerId,
                                    VendorMasterId: serialDetail.VendorMasterId,
                                    GrnId: serialDetail.GrnId,
                                    GrnDetailId: serialDetail.GrnDetailId,
                                    StockEntryId: serialDetail.StockEntryId,
                                    StockEntryDetailId: serialDetail.StockEntryDetailId
                                };
                            } else {
                                serialMovement = {
                                    StockMovementId: movement.Id,
                                    TransactionDate: movement.TransactionDate,
                                    TransactionDetailId: serialDetail.Id,
                                    StockSerialItemId: serialDetail.StockSerialItemId,
                                    BarCodeId: 'ABC123',
                                    ItemMasterId: serialDetail.ItemMasterId,
                                    FacilityId: movement.FacilityId,
                                    StoreMasterId: movement.StoreMasterId,
                                    BatchId: serialDetail.BatchId,
                                    ExpiryDate: serialDetail.ExpiryDate,
                                    IsMultiUse: serialDetail.IsMultiUse,
                                    ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                                    TotalTransactions: serialDetail.TotalTransactions,
                                    ConsumedTransactions: serialDetail.ConsumedTransactions,
                                    PendingTransactions: serialDetail.PendingTransactions,
                                    TotalBFQty: Number(serialDetail.BatchQuantity),
                                    InQty: SerialInQty,
                                    OutQty: SerialOutQty,
                                    TotalAFQty: Number(serialDetail.BatchQuantity),
                                    Ucp: serialDetail.UnitCostPrice,
                                    Mrp: serialDetail.MrPrice,
                                    GstId: serialDetail.GSTId,
                                    GstPercentage: serialDetail.GSTPercentage,
                                    InGstId: serialDetail.InGstId,
                                    InGstPercentage: serialDetail.InGstPercentage,
                                    CGstId: serialDetail.CGstId,
                                    CGstPercentage: serialDetail.CGstPercentage,
                                    SGstId: serialDetail.SGstId,
                                    SGstPercentage: serialDetail.SGstPercentage,
                                    PurchaseUomId: serialDetail.BaseUomId,
                                    BaseUomId: serialDetail.BaseUomId,
                                    SaleUomId: serialDetail.SaleUomId,
                                    ManufacturerId: serialDetail.ManufacturerId,
                                    VendorMasterId: serialDetail.VendorMasterId,
                                    GrnId: serialDetail.GrnId,
                                    GrnDetailId: serialDetail.GrnDetailId,
                                    StockEntryId: serialDetail.StockEntryId,
                                    StockEntryDetailId: serialDetail.StockEntryDetailId
                                };
                            }
                        }
                    } else {
                        serialMovement = {
                            StockMovementId: movement.Id,
                            TransactionDate: movement.TransactionDate,
                            TransactionDetailId: serialDetail.Id,
                            StockSerialItemId: serialDetail.StockSerialItemId,
                            BarCodeId: 'ABC123',
                            ItemMasterId: serialDetail.ItemMasterId,
                            BatchId: serialDetail.BatchId,
                            ExpiryDate: serialDetail.ExpiryDate,
                            FacilityId: movement.FacilityId,
                            StoreMasterId: movement.StoreMasterId,
                            IsMultiUse: serialDetail.IsMultiUse,
                            ConversionMrp: (serialDetail.MrPrice) / (serialDetail.TotalTransactions),
                            TotalTransactions: serialDetail.TotalTransactions,
                            ConsumedTransactions: serialDetail.ConsumedTransactions,
                            PendingTransactions: serialDetail.PendingTransactions,
                            TotalBFQty: Number(serialDetail.BatchQuantity),
                            InQty: SerialInQty,
                            OutQty: SerialOutQty,
                            TotalAFQty: Number(serialDetail.BatchQuantity),
                            Ucp: serialDetail.UnitCostPrice,
                            Mrp: serialDetail.MrPrice,
                            GstId: serialDetail.GSTId,
                            GstPercentage: serialDetail.GSTPercentage,
                            InGstId: serialDetail.InGstId,
                            InGstPercentage: serialDetail.InGstPercentage,
                            CGstId: serialDetail.CGstId,
                            CGstPercentage: serialDetail.CGstPercentage,
                            SGstId: serialDetail.SGstId,
                            SGstPercentage: serialDetail.SGstPercentage,
                            PurchaseUomId: serialDetail.BaseUomId,
                            BaseUomId: serialDetail.BaseUomId,
                            SaleUomId: serialDetail.SaleUomId,
                            ManufacturerId: serialDetail.ManufacturerId,
                            VendorMasterId: serialDetail.VendorMasterId,
                            GrnId: serialDetail.GrnId,
                            GrnDetailId: serialDetail.GrnDetailId,
                            StockEntryId: serialDetail.StockEntryId,
                            StockEntryDetailId: serialDetail.StockEntryDetailId
                        };
                    }
                } else {
                    serialMovement = {
                        StockMovementId: movement.Id,
                        TransactionDate: movement.TransactionDate,
                        TransactionDetailId: serialDetail.Id,
                        StockSerialItemId: serialDetail.StockSerialItemId,
                        BarCodeId: 'ABC123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        BatchId: serialDetail.BatchId,
                        ExpiryDate: serialDetail.ExpiryDate,
                        FacilityId: movement.FacilityId,
                        StoreMasterId: movement.StoreMasterId,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: 0,
                        TotalTransactions: serialDetail.TotalTransactions,
                        ConsumedTransactions: serialDetail.ConsumedTransactions,
                        PendingTransactions: serialDetail.PendingTransactions,
                        // TotalBFQty: Number(serialDetail.BatchQuantity),
                        TotalBFQty: Number(movement.TotalBFQty),
                        InQty: SerialInQty,
                        OutQty: SerialOutQty,
                        // TotalAFQty: Number(serialDetail.BatchQuantity) - SerialOutQty,
                        TotalAFQty: Number(movement.TotalAFQty),
                        Ucp: serialDetail.UnitCostPrice,
                        Mrp: serialDetail.MrPrice,
                        GstId: serialDetail.GSTId,
                        GstPercentage: serialDetail.GSTPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.GrnDetailId,
                        StockEntryId: serialDetail.StockEntryId,
                        StockEntryDetailId: serialDetail.StockEntryDetailId
                    };
                }
                // try {
                await this.Save(serialMovement as any);
                // } catch (ex) {
                //     throw { message: 'Some Network Issue.. Please try again' };
                // }

            } else if (movement.TransactionTypeId === 22) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    // movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(serialDetail.ReturnQuantity);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(serialDetail.ReturnQuantity);
                }
                SerialInQty = serialDetail.ReturnQuantity;
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BatchId: serialDetail.BatchId,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                };
                // try {
                await this.Save(serialMovement as any);
                // } catch (ex) {
                //     throw { message: 'Some Network Issue.. Please Try Again' };
                // }
            } else if (movement.TransactionTypeId === 23) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialInQty = Number(serialDetail.TransferedQuantity);
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalBFQty: movement.TotalBFQty,
                    TotalAFQty: movement.TotalAFQty,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId
                };
                await this.Save(serialMovement as any);
            } else if (movement.TransactionTypeId === 24) {
                if (ItemPrevClosingStockserMov !== null) {
                    movement.TotalBFQty = ItemPrevClosingStockserMov.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStockserMov.TotalAFQty + Number(movement.InQty);
                } else {
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = Number(movement.InQty);
                }
                SerialOutQty = Number(serialDetail.Quantity);
                serialMovement = {
                    StockMovementId: movement.Id,
                    TransactionDate: movement.TransactionDate,
                    TransactionDetailId: serialDetail.Id,
                    StockSerialItemId: serialDetail.StockSerialItemId,
                    BarCodeId: 'ABC123',
                    ItemMasterId: serialDetail.ItemMasterId,
                    FacilityId: movement.FacilityId,
                    StoreMasterId: movement.StoreMasterId,
                    BatchId: serialDetail.BatchId,
                    ExpiryDate: serialDetail.ExpiryDate,
                    TotalBFQty: Number(serialDetail.BatchQuantity),
                    InQty: SerialInQty,
                    OutQty: SerialOutQty,
                    TotalAFQty: Number(serialDetail.BatchQuantity) - SerialOutQty,
                    Ucp: serialDetail.UnitCostPrice,
                    Mrp: serialDetail.MrPrice,
                    GstId: serialDetail.GSTId,
                    GstPercentage: serialDetail.GSTPercentage,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    PurchaseUomId: serialDetail.BaseUomId,
                    BaseUomId: serialDetail.BaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnId: serialDetail.GrnId,
                    GrnDetailId: serialDetail.GrnDetailId,
                    StockEntryId: serialDetail.StockEntryId,
                    StockEntryDetailId: serialDetail.StockEntryDetailId
                };
                await this.Save(serialMovement as any);
            }
        } catch (ex) {
            throw { message: 'Some Network Issue.. Please Try Again' };
        }
        return true;
    }

    public async ManageGrnSerialMovement(request: any, stockserialitem: any, movement: any, detail: any): Promise<boolean> {
        let serialMovement = {};
        serialMovement = {
            StockMovementId: movement.Id,
            TransactionDate: movement.TransactionDate,
            StockSerialItemId: stockserialitem.Id,
            BarCodeId: stockserialitem.BarCodeId,
            ItemMasterId: stockserialitem.ItemMasterId,
            BatchId: stockserialitem.BatchId || stockserialitem.GrnDetailId,
            ExpiryDate: stockserialitem.ExpiryDate,
            InQty: stockserialitem.Quantity,
            OutQty: 0,
            Ucp: stockserialitem.Ucp,
            Mrp: stockserialitem.Mrp,
            GstId: stockserialitem.GstId,
            GstPercentage: stockserialitem.GstPercentage,
            InGstId: stockserialitem.InGstId,
            InGstPercentage: stockserialitem.InGstPercentage,
            CGstId: stockserialitem.CGstId,
            CGstPercentage: stockserialitem.CGstPercentage,
            SGstId: stockserialitem.SGstId,
            SGstPercentage: stockserialitem.SGstPercentage,
            PurchaseUomId: stockserialitem.BaseUomId,
            BaseUomId: stockserialitem.BaseUomId,
            SaleUomId: stockserialitem.SaleUomId,
            ManufacturerId: stockserialitem.ManufacturerId,
            VendorMasterId: stockserialitem.VendorMasterId,
            GrnId: stockserialitem.GrnId,
            GrnDetailId: stockserialitem.GrnDetailId
        };
        await this.Save(serialMovement as any);

        return true;
    }

    public async ManagePrnSerialMovement(request: any, stockserialitem: any, movement: any, detail: any): Promise<boolean> {
        let serialMovement = {};
        serialMovement = {
            StockMovementId: movement.Id,
            TransactionDate: movement.TransactionDate,
            StockSerialItemId: detail.StockSerialItemId,
            BarCodeId: detail.BarCodeId,
            ItemMasterId: detail.ItemMasterId,
            BatchId: detail.BatchId || detail.GrnDetailId,
            ExpiryDate: detail.ExpiryDate,
            InQty: 0,
            OutQty: movement.OutQty,
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
            PurchaseUomId: detail.PurchaseUomId,
            BaseUomId: detail.BaseUomId,
            SaleUomId: detail.SaleUomId,
            ManufacturerId: 0,
            VendorMasterId: detail.VendorMasterId
        };
        await this.Save(serialMovement as any);

        return true;
    }

    public GetModel(): SStatic.Model<StockSerialMovementInstance, StockSerialMovementAttributes> {
        return this.Models.StockSerialMovement;
    }
}
