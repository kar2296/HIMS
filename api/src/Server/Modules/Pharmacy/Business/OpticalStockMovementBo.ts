import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OpticalStockMovementInstance, OpticalStockMovementAttributes } from '../Model/Interface/Index';
import { OpticalStockMovementFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import * as _ from 'lodash';

export class OpticalStockMovementBo extends BaseBo<OpticalStockMovementInstance,
    OpticalStockMovementAttributes> {
    public async AddOpticalStockMovement(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOpticalStockMovement(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOpticalStockMovementById(req: BaseRequest): Promise<OpticalStockMovementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOpticalStockMovements(apiReq?: ApiRequest<OpticalStockMovementFilters>):
        Promise<ApiResponse<OpticalStockMovementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('OpticalProductType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalStockMovementFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OpticalStockMovementFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case OpticalStockMovementFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOpticalStockMovement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalStockMovementInstance, OpticalStockMovementAttributes> {
        return this.Models.OpticalStockMovement;
    }

    public async GetClosingStockByFilter(req: BaseRequest): Promise<any> {
        let stockmovement = null;
        let filterInfo = req.Data;
        let stockmovementInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                OpticalItemMasterId: filterInfo.OpticalItemMasterId
            },
            order: [['OpticalStockMovementId', 'DESC']],
            limit: 1
        });
        if (stockmovementInstance) {
            stockmovement = this.GetAttribute(stockmovementInstance);
        }
        return stockmovement;
    }

    public async ManageOpticalStockMovements(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.OpticalItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManageOpticalStockMovement(TransactionType, TransactionId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManageOpticalStockMovement(TransactionType: number, TransactionId: number,
        request: any, details: Array<any>): Promise<void> {
        let TransNo = null;
        let TransRef = null;
        let TransDate = null;
        let InComingQty = 0;
        let OutGoingQty = 0;
        let FromStoreId = 0;
        let ToStoreId = 0;
        let StoreId = 0;
        let FacilityId = 0;
        if (TransactionType === 1) {
            TransNo = request.Header.StockEntryNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.StockEntryDate;
            InComingQty = _.sumBy(details, (detail: any) => Number(detail.EntryQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 3) {
            TransNo = request.Header.OpticalGrnNumber;
            TransRef = request.Header.VendorName;
            TransDate = request.Header.OpticalGrnDate;
            InComingQty = _.sumBy(details, (detail: any) => detail.TotalQuantityAfterConversion);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 5) {
            var PrnQty = 0;
            if (request.Header.PrnTypeId === 2) {
                PrnQty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
            } else {
                PrnQty = _.sumBy(details, (detail: any) => Number(detail.PrnQuantity));
            }

            TransNo = request.Header.PrnNumber;
            TransRef = request.Header.VendorName;
            TransDate = request.Header.PrnDate;
            OutGoingQty = PrnQty;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 9) {
            TransNo = request.Header.TransferNumber;
            TransRef = request.Header.ToStoreName;
            TransDate = request.Header.TransferDate;
            OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 13) {
            TransNo = request.Header.StockConsumptionNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.ConsumptionDate;
            OutGoingQty = _.sumBy(details, (detail: any) => detail.QtyConsumed);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 15) {
            TransNo = request.Header.StockAdjustmentNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.AdjustedDate;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 19) {
            TransNo = request.Header.DispenseNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.DispenseDateTime;
            OutGoingQty = _.sumBy(details, (detail: any) => detail.DispensedQuantity);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
        } else if (TransactionType === 20) {
            TransNo = request.Header.DispenseReturnNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.DispenseReturnDateTime;
            InComingQty = _.sumBy(details, (detail: any) => detail.AcceptedQuantity);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 21) {
            TransNo = request.Header.BillNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.BillDateTime;
            OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 22) {
            TransNo = request.Header.ReturnNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.ReturnDateTime;
            InComingQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 23) {
            TransNo = request.Header.AcceptanceNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.AcceptedDate;
            InComingQty = _.sumBy(details, (detail: any) => Number(detail.AcceptedQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.ToStoreMasterId;
            FacilityId = request.Header.FacilityId;
        } else if (TransactionType === 24) {
            TransNo = request.Header.BillNumber;
            TransDate = request.Header.BillDateTime;
            OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
        }

        let movement = {
            OpticalStockItemId: details[0].OpticalStockItemId,
            OpticalItemMasterId: details[0].OpticalItemMasterId,
            OpticalTransactionTypeId: TransactionType,
            TransactionId: TransactionId,
            TransactionNumber: TransNo,
            TransactionReference: TransRef,
            TransactionDate: TransDate,
            TotalBFQty: 0,
            InQty: InComingQty,
            OutQty: OutGoingQty,
            TotalAFQty: 0,
            FromStoreMasterId: FromStoreId,
            ToStoreMasterId: ToStoreId,
            StoreMasterId: StoreId,
            FacilityId: FacilityId,
            OrgId: 0
        };

        await this.ManageMovement(movement as any, details);
    }

    public async ManageMovement(movement: OpticalStockMovementAttributes, details: Array<any>): Promise<boolean> {
        movement.Id = movement.Id || 0;
        if (movement.Status === 2 && movement.Id !== 0) {
            await this.MarkAsDelete(movement.Id);
        } else if (movement.Id === 0) {
            let ItemPrevClosingStock = await this.GetClosingStockByFilter({
                Id: 0,
                Data: {
                    StoreMasterId: movement.StoreMasterId,
                    OpticalItemMasterId: movement.OpticalItemMasterId
                }
            });

            if (ItemPrevClosingStock !== null) {
                if (movement.OpticalTransactionTypeId === 1) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + Number(movement.InQty);
                } else if (movement.OpticalTransactionTypeId === 3) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + Number(movement.InQty);
                } else if (movement.OpticalTransactionTypeId === 5) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                } else if (movement.OpticalTransactionTypeId === 9) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) - Number(movement.OutQty);
                } else if (movement.OpticalTransactionTypeId === 13) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - movement.OutQty;
                } else if (movement.OpticalTransactionTypeId === 15) {
                    if (ItemPrevClosingStock !== null) {
                        let clearmovement: any = {};
                        if (ItemPrevClosingStock.TotalAFQty > 0) {
                            clearmovement = {
                                OpticalStockItemId: ItemPrevClosingStock.OpticalStockItemId,
                                OpticalItemMasterId: movement.OpticalItemMasterId,
                                OpticalTransactionTypeId: movement.OpticalTransactionTypeId,
                                TransactionId: movement.TransactionId,
                                TransactionNumber: movement.TransactionNumber,
                                TransactionDate: movement.TransactionDate,
                                TotalBFQty: 0,
                                InQty: 0,
                                OutQty: ItemPrevClosingStock.TotalAFQty,
                                TotalAFQty: 0,
                                FromStoreMasterId: movement.FromStoreMasterId,
                                ToStoreMasterId: movement.ToStoreMasterId,
                                StoreMasterId: movement.StoreMasterId,
                                FacilityId: 0,
                                OrgId: 0
                            };
                        } else {
                            clearmovement = {
                                OpticalStockItemId: ItemPrevClosingStock.OpticalStockItemId,
                                OpticalItemMasterId: movement.OpticalItemMasterId,
                                OpticalTransactionTypeId: movement.OpticalTransactionTypeId,
                                TransactionId: movement.TransactionId,
                                TransactionNumber: movement.TransactionNumber,
                                TransactionDate: movement.TransactionDate,
                                TotalBFQty: 0,
                                InQty: ItemPrevClosingStock.TotalAFQty,
                                OutQty: 0,
                                TotalAFQty: 0,
                                FromStoreMasterId: movement.FromStoreMasterId,
                                ToStoreMasterId: movement.ToStoreMasterId,
                                StoreMasterId: movement.StoreMasterId,
                                FacilityId: 0,
                                OrgId: 0
                            };
                        }
                        await this.Save(clearmovement);
                    }

                    let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                        Id: 0,
                        Data: {
                            StoreMasterId: movement.StoreMasterId,
                            OpticalItemMasterId: movement.OpticalItemMasterId
                        }
                    });

                    if (ExistingStockItem !== null) {
                        movement.OpticalStockItemId = ExistingStockItem.Id;
                        movement.InQty = ExistingStockItem.Quantity;
                        movement.TotalAFQty = ExistingStockItem.Quantity;
                    } else {
                        movement.InQty = 0;
                        movement.TotalAFQty = 0;
                    }
                } else if (movement.OpticalTransactionTypeId === 19) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) - Number(movement.OutQty);
                } else if (movement.OpticalTransactionTypeId === 20) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) + Number(movement.InQty);
                } else if (movement.OpticalTransactionTypeId === 21) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                } else if (movement.OpticalTransactionTypeId === 22) {
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + movement.InQty;
                } else if (movement.OpticalTransactionTypeId === 23) {
                    movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) + Number(movement.InQty);
                } else if (movement.OpticalTransactionTypeId === 24) {
                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                }
            } else {
                movement.TotalAFQty = movement.InQty;
            }
            let result = await this.Save(movement);
            movement.Id = result.dataValues.Id;
        }
        return true;
    }
}
