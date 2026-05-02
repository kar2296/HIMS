import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockTransferInstance, StockTransferAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockTransferFilters, StockTransferDetailFilters, ItemStoreFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';
import * as moment from 'moment';
const _ = require('lodash');
// import { join } from 'path';

export class StockTransferBo extends BaseBo<StockTransferInstance, StockTransferAttributes> {

    public async AddStockTransfer(req: BaseRequest): Promise<number> {
        if (req.Data.Header.TransferStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.TransferNumber = await Sequence.Next(SequenceKeys.MDStockTransfer);
            } else {
                req.Data.Header.TransferNumber = await Sequence.Next(SequenceKeys.NMDStockTransfer);
            }
            */
            req.Data.Header.TransferDate = new Date();
            req.Data.Header.TransferedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.TransferStatusId === 1) {
            req.Data.Header.TransferDate = new Date();
            req.Data.Header.TransferedDate = new Date();
        }
        if (req.Data.Header && req.Data.Header.StockRequestId > 0) {
            if (await this.IsTransferExist(req) <= -1) throw { message: 'Stock Already Transfered' };
        }
        if (await this.IsAlreadyExist(req) <= -1) throw { message: 'Stock Already Transfered' };


        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
            let StockTransferId = result.dataValues.Id;
            let res = await detailBO.ManageStockTransferDetails(StockTransferId, req.Data.Details);
            console.log(res);
            // if (req.Data.Details) {
            //     for (let sdx in req.Data.Details) {
            //         let storemap = req.Data.Details[sdx];
            //         let MasterId = storemap.ItemMasterId;
            //         let storeuserReq = {
            //             Id: 0,
            //             PageContext: { PageSize: 100, PageNumber: 1 },
            //             Params: [{ Key: ItemStoreFilters.ItemMasterId, Value: MasterId },
            //             { Key: ItemStoreFilters.StoreMasterId, Value: req.Data.Header.ToStoreMasterId }]
            //         };
            //         let itemstoremapbo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
            //         let itemStoreMaps = await itemstoremapbo.GetItemStoreMaps(storeuserReq);
            //         if (itemStoreMaps.Data.length === 0) {
            //             let itemstoreData: any = {
            //                 Data: {
            //                     ItemMasterId: MasterId,
            //                     StoreMasterId: req.Data.Header.ToStoreMasterId,
            //                     StoreName: req.Data.Header.ToStoreName,
            //                     ItemCode: req.Data.Details.ItemCode,
            //                     ItemName: req.Data.Details.ItemName,
            //                     FacilityId: req.Data.Header.FacilityId,
            //                     IsBillable: 1,
            //                     Status: 1,
            //                 }
            //             };
            //             console.log('itemstoreDataitemstoreDataitemstoreDataitemstoreData', itemstoreData);
            //             await itemstoremapbo.AddItemStoreMap(itemstoreData);
            //         }
            //     }
            // }
            // let details: any = [];
            // if(res === true) {
            //     let Req = {
            //         Id: 0,
            //         PageContext: { PageSize: 1000, PageNumber: 1 },
            //         Params: [{ Key: StockTransferDetailFilters.StockTransferId, Value: StockTransferId }]
            //     };
            //     details = await detailBO.GetStockTransferDetails(Req);
            // }
            if (req.Data.Header.TransferStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                // req.Data.Details = details.Data;
                try {
                    await stockitemBO.ManageStockItems(9, StockTransferId, req.Data);
                } catch (ex) {
                    // throw { message: 'Stock Changes Happened' };
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }
                let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                let TransactionId = Number(StockTransferId);
                let groupInstance = await stockmovementBo.Find({
                    where: {
                        TransactionId: TransactionId,
                        TransactionTypeId: 9
                    }
                });
                if (!groupInstance) {
                    throw { message: 'Error in Updating Movement' };
                }
                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(9, StockTransferId, req.Data);

                let stIdentifier: any = null;
                if (req.Data.Header.TransferStatusId === 2) {
                    if (req.Data.Header.StoreTypeId === 1) {
                        stIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockTransfer);
                    } else {
                        stIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockTransfer);
                    }
                }

                if (stIdentifier) {
                    const afterO: any = () => {
                        return ((bo, request, stockTransferId) => {
                            return {
                                UpdateMovementInfo: async (code: string) => {
                                    request.Data.Header.TransactionId = stockTransferId;
                                    req.Data.Header.TransactionNumber = code;
                                    await bo.UpdateMovementInfo(request);
                                }
                            };
                        })(this, req, StockTransferId);
                    };

                    this.deferSequenceKey(StockTransferId, 'TransferNumber', stIdentifier, [afterO().UpdateMovementInfo]);
                }
                if (req.Data.Header.GrnId) {
                    let grnBO = BoFactory.GetBo(bo.GrnBo, this.Request);
                    let grnData = await grnBO.GetGrnById({ Id: req.Data.Header.GrnId });
                    let grnupdate: any = {
                        Id: grnData.Id,
                        IsStockTransferred: true
                    };
                    await grnBO.Update(grnupdate);

                }
                if (req.Data.Details) {
                    for (var sidx in req.Data.Details) {
                        var conitem = req.Data.Details[sidx];
                        conitem.BatchDetails = [];
                        if (conitem.ItemMasterId > 0) {
                            var ConsumededBatchDetail = {
                                Id: 0,
                                ItemMasterId: conitem.ItemMasterId,
                                ItemCode: conitem.ItemCode,
                                ItemName: conitem.ItemName,
                                StoreName: req.Data.Header.ToStoreName,
                                StoreMasterId: req.Data.Header.ToStoreMasterId,
                                FacilityId: req.Data.Header.FacilityId
                            };
                            conitem.BatchDetails.push(ConsumededBatchDetail);
                        }
                    }
                    let storeuserReq = {
                        Id: 0,
                        PageContext: { PageSize: 100, PageNumber: 1 },
                        Params: [
                            { Key: ItemStoreFilters.ItemMasterId, Value: ConsumededBatchDetail.ItemMasterId, },
                            { Key: ItemStoreFilters.StoreMasterId, Value: ConsumededBatchDetail.StoreMasterId }
                        ]
                    };
                    let storeusermapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                    let itemstoreMaps = await storeusermapBo.GetItemStoreMaps(storeuserReq);
                    let Facility = 0;
                    if (req.Data.Header.ToFacilityId > 0) {
                        Facility = req.Data.Header.ToFacilityId;
                    } else {
                        Facility = req.Data.Header.FacilityId;
                    }
                    if (itemstoreMaps.Data.length === 0) {
                        // let itemstoreMapData = itemstoreMaps.Data[0];
                        let itemstoreData: any = {
                            Data: {
                                Id: 0,
                                ItemMasterId: ConsumededBatchDetail.ItemMasterId,
                                StoreMasterId: req.Data.Header.ToStoreMasterId,
                                ItemCode: ConsumededBatchDetail.ItemCode,
                                ItemName: ConsumededBatchDetail.ItemName,
                                IsBillable: true,
                                Status: 1,
                                ActiveStatusId: 2,
                                FacilityId: Facility
                                // FacilityId: req.Data.Header.FacilityId
                            }
                        };
                        let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                        await itemstoremapBo.AddItemStoreMap(itemstoreData);
                    } else {
                        // let itemstoreMapData = itemstoreMaps.Data[0];
                        let itemstoreData: any = {
                            Data: {
                                ItemMasterId: ConsumededBatchDetail.ItemMasterId,
                                StoreMasterId: req.Data.Header.ToStoreMasterId,
                                ItemCode: ConsumededBatchDetail.ItemCode,
                                ItemName: ConsumededBatchDetail.ItemName,
                                IsBillable: true,
                                Status: 1,
                                ActiveStatusId: 2,
                                FacilityId: this.Session.FacilityId
                                // FacilityId: req.Data.Header.FacilityId
                            }
                        };
                        let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                        await itemstoremapBo.Update(itemstoreData);
                    }
                }
                if (req.Data.Header.TransferTypeId === 3) {
                    let stockreqBO = BoFactory.GetBo(bo.StockRequestBo, this.Request);
                    let stockreq = await stockreqBO.GetStockRequestById({ Id: req.Data.Header.StockRequestId });
                    stockreq.RequestStatusId = req.Data.Header.RequestStatusId;
                    stockreq.StockTransferId = StockTransferId;
                    stockreq.TransferNumber = req.Data.Header.TransferNumber;
                    stockreq.TransferedBy = req.Data.Header.TransferedBy;
                    stockreq.TransferedDate = req.Data.Header.TransferedDate;
                    await stockreqBO.Update(stockreq);

                    let stockreqdetailBO = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
                    await stockreqdetailBO.ManageStockRequestDetailsAfterTransfer(StockTransferId, req.Data);
                } else {
                    if (req.Data.Header.AcceptanceStatusId === 2) {
                        req.Data.Header.AcceptanceNumber = await Sequence.Next(SequenceKeys.MDStockReceive);
                        // await stockmovementBO.ManageStockMovements(23, StockTransferId, req.Data);
                        try {
                            await stockitemBO.ManageStockItems(23, StockTransferId, req.Data);
                        } catch (ex) {
                            // throw { message: 'Error in Updating Stock' };
                            let errorMessages: any = [];
                            _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                            throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                        }
                        let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                        let TransactionId = Number(StockTransferId);
                        let groupInstance = await stockmovementBo.Find({
                            where: {
                                TransactionId: TransactionId,
                                TransactionTypeId: 23
                            }
                        });
                        if (!groupInstance) {
                            throw { message: 'Error in Updating Movement' };
                        }
                        let srIdentifier: any = null;
                        if (req.Data.Header.TransferStatusId === 2) {
                            if (req.Data.Header.StoreTypeId === 1) {
                                srIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockReceive);
                            } else {
                                srIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockReceive);
                            }
                        }

                        if (srIdentifier) {
                            const afterO: any = () => {
                                return ((bo, request, stockTransferId) => {
                                    return {
                                        UpdateReceiveMovementInfo: async (code: string) => {
                                            try {
                                                request.Data.Header.TransactionId = stockTransferId;
                                                req.Data.Header.TransactionNumber = code;
                                                await bo.UpdateReceiveMovementInfo(request);
                                            } catch (error) {
                                                console.error('Error in UpdateReceiveMovementInfo:', error);
                                                throw error;  // Handle the error as needed
                                            }
                                        }
                                    };
                                })(this, req, StockTransferId);
                            };

                            // this.deferSequenceKey(StockTransferId,
                            // 'AcceptanceNumber', srIdentifier,
                            // [afterO().UpdateReceiveMovementInfo]);
                            const handleDeferredExecution = async () => {
                                try {
                                    // Assuming deferSequenceKey processes a list of functions
                                    this.deferSequenceKey(StockTransferId,
                                        'AcceptanceNumber', srIdentifier,
                                        [afterO().UpdateReceiveMovementInfo]);
                                } catch (error) {
                                    // console.error('Error in deferSequenceKey execution:', error);
                                    throw error;
                                }
                            };

                            handleDeferredExecution();
                        }
                    }
                    // if (req.Data.Details) {
                    //     for (var sidx in req.Data.Details) {
                    //         var conitem = req.Data.Details[sidx];
                    //         conitem.BatchDetails = [];
                    //         if (conitem.ItemMasterId > 0) {
                    //             var ConsumededBatchDetail = {
                    //                 Id: 0,
                    //                 ItemMasterId: conitem.ItemMasterId,
                    //                 ItemCode: conitem.ItemCode,
                    //                 ItemName: conitem.ItemName,
                    //                 StoreName: req.Data.Header.ToStoreName,
                    //                 StoreMasterId: req.Data.Header.ToStoreMasterId,
                    //             };
                    //             conitem.BatchDetails.push(ConsumededBatchDetail);
                    //         }
                    //     }
                    //     let storeuserReq = {
                    //         Id: 0,
                    //         PageContext: { PageSize: 100, PageNumber: 1 },
                    //         Params: [
                    //             { Key: ItemStoreFilters.ItemMasterId, Value: ConsumededBatchDetail.ItemMasterId, },
                    //             { Key: ItemStoreFilters.StoreMasterId, Value: ConsumededBatchDetail.StoreMasterId }
                    //         ]
                    //     };
                    //     let storeusermapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                    //     let itemstoreMaps = await storeusermapBo.GetItemStoreMaps(storeuserReq);
                    //     if (itemstoreMaps.Data.length === 0) {
                    //         // let itemstoreMapData = itemstoreMaps.Data[0];
                    //         let itemstoreData: any = {
                    //             Data: {
                    //                 Id: 0,
                    //                 ItemMasterId: ConsumededBatchDetail.ItemMasterId,
                    //                 StoreMasterId: req.Data.Header.ToStoreMasterId,
                    //                 ItemCode: ConsumededBatchDetail.ItemCode,
                    //                 ItemName: ConsumededBatchDetail.ItemName,
                    //                 IsBillable: true,
                    //                 Status: 1,
                    //                 ActiveStatusId: 2,
                    //                 FacilityId: this.Session.FacilityId
                    //             }
                    //         };
                    //         let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                    //         await itemstoremapBo.AddItemStoreMap(itemstoreData);
                    //     } else {
                    //         // let itemstoreMapData = itemstoreMaps.Data[0];
                    //         let itemstoreData: any = {
                    //             Data: {
                    //                 ItemMasterId: ConsumededBatchDetail.ItemMasterId,
                    //                 StoreMasterId: req.Data.Header.ToStoreMasterId,
                    //                 ItemCode: ConsumededBatchDetail.ItemCode,
                    //                 ItemName: ConsumededBatchDetail.ItemName,
                    //                 IsBillable: true,
                    //                 Status: 1,
                    //                 ActiveStatusId: 2,
                    //                 FacilityId: this.Session.FacilityId
                    //             }
                    //         };
                    //         let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                    //         await itemstoremapBo.Update(itemstoreData);
                    //     }
                    // }
                }
            }

            return StockTransferId;
        }

        return 0;
    }

    public async MapItemStore(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemMasterId', 'StoreMasterId');
        return await mapbo.Manages(req.Data.Header);
    }
    public async UpdateStockTransfer(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.TransferStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.TransferNumber = await Sequence.Next(SequenceKeys.MDStockTransfer);
            } else {
                req.Data.Header.TransferNumber = await Sequence.Next(SequenceKeys.NMDStockTransfer);
            }
            */
            req.Data.Header.TransferDate = new Date();
            req.Data.Header.TransferedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.TransferStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
            let StockTransferId = req.Data.Header.Id;
            await detailBO.ManageStockTransferDetails(StockTransferId, req.Data.Details);

            if (req.Data.Header.TransferStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                if (!req.Data.Header.acceptdirecttransfer) {
                    try {
                        await stockitemBO.ManageStockItems(9, req.Data.Header.Id, req.Data);
                    } catch (ex) {
                        // throw { message: 'Stock Changes Happened' };
                        let errorMessages: any = [];
                        _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                        throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                    }
                    let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                    let TransactionId = Number(StockTransferId);
                    let groupInstance = await stockmovementBo.Find({
                        where: {
                            TransactionId: TransactionId,
                            TransactionTypeId: 9
                        }
                    });
                    if (!groupInstance) {
                        throw { message: 'Error in Updating Movement' };
                    }
                    // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                    // await stockmovementBO.ManageStockMovements(9, req.Data.Header.Id, req.Data);

                    let stIdentifier: any = null;
                    if (req.Data.Header.TransferStatusId === 2) {
                        if (req.Data.Header.StoreTypeId === 1) {
                            stIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockTransfer);
                        } else {
                            stIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockTransfer);
                        }
                    }

                    if (stIdentifier) {
                        const afterO: any = () => {
                            return ((bo, request, stockTransferId) => {
                                return {
                                    UpdateMovementInfo: async (code: string) => {
                                        request.Data.Header.TransactionId = stockTransferId;
                                        req.Data.Header.TransactionNumber = code;
                                        await bo.UpdateMovementInfo(request);
                                    }
                                };
                            })(this, req, StockTransferId);
                        };

                        this.deferSequenceKey(StockTransferId, 'TransferNumber', stIdentifier, [afterO().UpdateMovementInfo]);
                    }
                }

                if (req.Data.Header.TransferTypeId === 3) {
                    let stockreqBO = BoFactory.GetBo(bo.StockRequestBo, this.Request);
                    let stockreq = await stockreqBO.GetStockRequestById({ Id: req.Data.Header.StockRequestId });
                    stockreq.RequestStatusId = req.Data.Header.RequestStatusId;
                    stockreq.StockTransferId = StockTransferId;
                    stockreq.TransferNumber = req.Data.Header.TransferNumber;
                    stockreq.TransferedBy = req.Data.Header.TransferedBy;
                    stockreq.TransferedDate = req.Data.Header.TransferedDate;
                    await stockreqBO.Update(stockreq);

                    let stockreqdetailBO = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
                    await stockreqdetailBO.ManageStockRequestDetailsAfterTransfer(StockTransferId, req.Data);
                    // await stockmovementBO.ManageStockMovements(23, req.Data.Header.Id, req.Data);
                    if (req.Data.Header.AcceptanceStatusId === 2) {
                        try {
                            await stockitemBO.ManageStockItems(23, req.Data.Header.Id, req.Data);
                        } catch (ex) {
                            // throw { message: 'Error in Updating Stock' };
                            let errorMessages: any = [];
                            _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                            throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                        }
                        let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                        let TransactionId = Number(req.Data.Header.Id);
                        let groupInstance = await stockmovementBo.Find({
                            where: {
                                TransactionId: TransactionId,
                                TransactionTypeId: 23
                            }
                        });
                        if (!groupInstance) {
                            throw { message: 'Error in Updating Movement' };
                        }
                    }
                } else {
                    if (req.Data.Header.AcceptanceStatusId === 2) {
                        req.Data.Header.AcceptanceNumber = await Sequence.Next(SequenceKeys.MDStockReceive);
                        // await stockmovementBO.ManageStockMovements(23, req.Data.Header.Id, req.Data);
                        try {
                            await stockitemBO.ManageStockItems(23, req.Data.Header.Id, req.Data);
                        } catch (ex) {
                            let errorMessages: any = [];
                            _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                            throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                        }

                        let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                        let TransactionId = Number(StockTransferId);
                        let groupInstance = await stockmovementBo.Find({
                            where: {
                                TransactionId: TransactionId,
                                TransactionTypeId: 23
                            }
                        });
                        if (!groupInstance) {
                            throw { message: 'Error in Updating Movement' };
                        }
                        let srIdentifier: any = null;
                        if (req.Data.Header.TransferStatusId === 2) {
                            if (req.Data.Header.StoreTypeId === 1) {
                                srIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockReceive);
                            } else {
                                srIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockReceive);
                            }
                        }

                        if (srIdentifier) {
                            const afterO: any = () => {
                                return ((bo, request, stockTransferId) => {
                                    return {
                                        UpdateReceiveMovementInfo: async (code: string) => {
                                            request.Data.Header.TransactionId = stockTransferId;
                                            req.Data.Header.TransactionNumber = code;
                                            await bo.UpdateReceiveMovementInfo(request);
                                        }
                                    };
                                })(this, req, StockTransferId);
                            };

                            this.deferSequenceKey(StockTransferId, 'AcceptanceNumber', srIdentifier, [afterO().UpdateReceiveMovementInfo]);
                        }
                    }
                }
            }

            return req.Data.Header.Id;
        }

        return req.Data.Header.Id;
    }

    public async AcceptStockTransfer(req: BaseRequest): Promise<boolean> {
        let result = null;
        if (req.Data.Header.AcceptanceStatusId === 2) {


            // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
            // await stockmovementBO.ManageStockMovements(23, req.Data.Header.Id, req.Data);

            let stocktransferdetailBO = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
            await stocktransferdetailBO.ManageStockTransferItemDetails(req.Data.Header.Id, req.Data);

            let stocktransfer = await this.GetStockTransferById({ Id: req.Data.Header.Id });
            if (stocktransfer && stocktransfer.AcceptanceStatusId === 2) {
                if (stocktransfer.AcceptanceNumber !== null || stocktransfer.AcceptanceNumber !== '') {
                    throw { message: 'Stock Already Received' };
                }
            }

            stocktransfer.AcceptanceNumber = await Sequence.Next(SequenceKeys.MDStockReceive);
            stocktransfer.AcceptanceStatusId = req.Data.Header.AcceptanceStatusId;
            stocktransfer.AcceptedBy = req.Data.Header.AcceptedBy;
            stocktransfer.AcceptedDate = new Date();
            result = await this.Update(stocktransfer);

            let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
            try {
                await stockitemBO.ManageStockItems(23, req.Data.Header.Id, req.Data);
            } catch (ex) {
                // throw { message: 'Error in Updating Stock' };
                let errorMessages: any = [];
                _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
            }
            let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
            let TransactionId = Number(req.Data.Header.Id);
            let groupInstance = await stockmovementBo.Find({
                where: {
                    TransactionId: TransactionId,
                    TransactionTypeId: 23
                }
            });
            if (!groupInstance) {
                throw { message: 'Error in Updating Movement' };
            }
            let saIdentifier: any = null;
            if (req.Data.Header.AcceptanceStatusId === 2) {
                // if (req.Data.Header.StoreTypeId === 1) {
                saIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockReceive);
                // } else {
                //     saIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockReceive);
                // }
            }

            if (saIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockTransferId) => {
                        return {
                            UpdateReceiveMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = stockTransferId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateReceiveMovementInfo(request);
                            }
                        };
                    })(this, req, req.Data.Header.Id);
                };

                this.deferSequenceKey(req.Data.Header.Id, 'AcceptanceNumber', saIdentifier, [afterO().UpdateReceiveMovementInfo]);
            }
        }

        return result;
    }

    public async GetStockTransferByIdWithoutDetails(req: BaseRequest): Promise<StockTransferAttributes> {
        let result = await this.GetById(req.Id, { attributes: ['Id', 'TransferNumber'] });
        return this.GetAttribute(result);
    }

    public async GetStockAcceptByIdWithoutDetails(req: BaseRequest): Promise<StockTransferAttributes> {
        let result = await this.GetById(req.Id, { attributes: ['Id', 'AcceptanceNumber'] });
        return this.GetAttribute(result);
    }

    public async GetStockTransferById(req: BaseRequest): Promise<StockTransferAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TranferedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetStockTransfers(apiReq?: ApiRequest<StockTransferFilters>): Promise<ApiResponse<StockTransferAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('TransferType'));
        include.push(this.GetReference('TransferStatus'));
        include.push(this.GetReference('AcceptanceStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.StockRequest, required: false,
            include: [this.GetReference('StockPriority')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TranferedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockTransferFilters.Id:
                        where['StockTransferId'] = param.Value;
                        break;
                    case StockTransferFilters.TransferNumber:
                        where['TransferNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case StockTransferFilters.TransferTypeId:
                        where['TransferTypeId'] = param.Value;
                        break;
                    case StockTransferFilters.StockRequestId:
                        where['StockRequestId'] = param.Value;
                        break;
                    case StockTransferFilters.TransferStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['TransferStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockTransferFilters.TransferDate:
                        where['TransferDate'] = { '$between': param.Value || '' };
                        break;
                    case StockTransferFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockTransferFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockTransferFilters.ToStoreMasterId:
                        where['ToStoreMasterId'] = param.Value;
                        break;
                    case StockTransferFilters.RequestNumber:
                        where['RequestNumber'] = param.Value;
                        break;
                    case StockTransferFilters.AcceptanceStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AcceptanceStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockTransferFilters.RequestedUser:
                        where['RequestedBy'] = param.Value;
                        break;
                    case StockTransferFilters.ApprovedUser:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case StockTransferFilters.TranferedUser:
                        where['TransferedBy'] = param.Value;
                        break;
                    case StockTransferFilters.AcceptanceNumber:
                        where['AcceptanceNumber'] = param.Value;
                        break;
                    case StockTransferFilters.From:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockTransferFilters.To:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockTransferFilters.StockTransferAcceptNo:
                        (where as any)[Op.or] = [{ TransferNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { AcceptanceNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case StockTransferFilters.ToFacilityId:
                        where['ToFacilityId'] = param.Value;
                        break;
                    case StockTransferFilters.TotalNetAmount:
                        where['TotalNetAmount'] = param.Value;
                        break;
                    case StockTransferFilters.StatusId:
                        where['TransferStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStockTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintStockTransfer(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockTransfers(apiReq);
        let StockTransfers = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferDetailFilters.StockTransferId, Value: StockTransfers.Id }]
        };
        let issueqty = req.Data.issueqty;
        let StockTransferDetailBo = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
        let StockTransferDetailData = await StockTransferDetailBo.GetStockTransferDetails(Req);
        let StockTransferDetails: any = [];
        StockTransferDetailData.Data.forEach((TransferDetail: any) => {
            if (TransferDetail.TransferedQuantity !== 0) {
                var StockTransferDetail = TransferDetail;
                StockTransferDetail.TotalMRP = TransferDetail.TransferedQuantity * TransferDetail.MrPrice;
                StockTransferDetails.push(StockTransferDetail);
            }
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockTransfers.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockTransfers.FacilityId, StockTransfers.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockTransfer: StockTransfers,
            StockTransferDetail: StockTransferDetails,
            Preferences: printPreferencesData,
            issueqty: issueqty,
            Flags: flags
        };
        let pdfOption: any = null;
        let key = 'stocktransfer';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '0.5in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintStockAcceptance(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockTransfers(apiReq);
        let StockTransfers = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferDetailFilters.StockTransferId, Value: StockTransfers.Id }]
        };
        let StockTransferDetailBo = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
        let StockTransferDetailData = await StockTransferDetailBo.GetStockTransferDetails(Req);
        let StockTransferDetails: any = [];
        StockTransferDetailData.Data.forEach((TransferDetail: any) => {
            var StockTransferDetail = TransferDetail;
            StockTransferDetail.TotalMRP = TransferDetail.TransferedQuantity * TransferDetail.MrPrice;
            StockTransferDetails.push(StockTransferDetail);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockTransfers.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockTransfers.FacilityId, StockTransfers.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockTransfer: StockTransfers,
            StockTransferDetail: StockTransferDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('stockacceptance', { header: {}, body: info });
    }



    public async DMPrintStockTransfer(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockTransfers(apiReq);
        let StockTransfers = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: StockTransferDetailFilters.StockTransferId, Value: StockTransfers.Id }]
        };
        let StockTransferDetailBo = BoFactory.GetBo(bo.StockTransferDetailBo, this.Request);
        let StockTransferDetailData = await StockTransferDetailBo.GetStockTransferDetails(Req);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(StockTransfers.FacilityId, StockTransfers.StoreMasterId);
        let StockTransferDetails: any = [];
        StockTransferDetailData.Data.forEach((TransferDetail: any) => {
            var StockTransferDetail = TransferDetail;
            StockTransferDetail.TotalMRP = TransferDetail.TransferedQuantity * TransferDetail.MrPrice;
            StockTransferDetails.push(StockTransferDetail);
        });
        let info = {
            StockTransfer: StockTransfers,
            StockTransferDetail: StockTransferDetails,
            PrintData: printStoreData
        };
        return info;
    }

    public GetModel(): SStatic.Model<StockTransferInstance, StockTransferAttributes> {
        return this.Models.StockTransfer;
    }

    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let stockacceptCount = await this.Items.count({
            where: {
                'Status': 1,
                'AcceptanceStatusId': { '$in': [2] },
            }
        });
        return {
            'stockacceptCount': stockacceptCount,
        };
    }
    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let stockreceivecount = await this.Items.count({
            where: {
                'Status': 1,
                'AcceptanceStatusId': { '$in': [2] },
            }
        });
        return {
            'stockreceivecount': stockreceivecount,
        };
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
            Params: [
                // { Key: StockTransferFilters.StockRequestId, Value: req.StockRequestId },
                { Key: StockTransferFilters.TransferTypeId, Value: req.Data.Header.TransactionTypeId },
                { Key: StockTransferFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
                { Key: StockTransferFilters.From, Value: frmDate },
                { Key: StockTransferFilters.To, Value: todate },
                // { Key: StockTransferFilters.GrnId, Value: req.GrnId },
                { Key: StockTransferFilters.TotalNetAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetStockTransfers(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    public async IsTransferExist(req: any): Promise<number> {
        // let encounterDate = new Date();
        // let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 30);
        // let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 30);
        // let frmDate = moment(FromDate);
        // let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: StockTransferFilters.StockRequestId, Value: req.Data.Header.StockRequestId },
                { Key: StockTransferFilters.TransferTypeId, Value: req.Data.Header.TransactionTypeId },
                { Key: StockTransferFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
                { Key: StockTransferFilters.FacilityId, Value: req.Data.Header.FacilityId },
                // { Key: StockTransferFilters.From, Value: frmDate },
                // { Key: StockTransferFilters.To, Value: todate },
                // { Key: StockTransferFilters.GrnId, Value: req.GrnId },
                // { Key: StockTransferFilters.TotalNetAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetStockTransfers(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId, TransactionTypeId: 9 }
        });
    }

    private async UpdateReceiveMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId, TransactionTypeId: 23 }
        });
    }
}
