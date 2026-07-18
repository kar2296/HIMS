import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GrnInstance, GrnAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import * as vendorbo from '../../Pharmacy/Business/Index';
import { GrnFilters, GrnDetailFilters, VendorContactFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as patbo from '../../Registration/Business/Index';

export class GrnBo extends BaseBo<GrnInstance, GrnAttributes> {

    public async AddGrn(req: BaseRequest): Promise<number> {
        await this.InvoiceCheck(req);
        if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.GrnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                    }
                } else {
                    req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                }
            } else {
                req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.NMDGoodsReceiptNoteId);
            }
            */
            req.Data.Header.GrnDate = new Date();
            req.Data.Header.ReceivedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.GrnStatusId === 1 && req.Data.Header.GrnNumber === null) {
            req.Data.Header.GrnDate = new Date();
            req.Data.Header.ReceivedDate = new Date();
        }
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
            let GrnId = result.dataValues.Id;
            await detailBO.ManageGrnDetails(GrnId, req.Data, req.Data.Details);

            if (req.Data.Header.GrnStatusId === 2) {
                if (!req.Data.Header.IsConsignmentPO) {
                    let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    try {
                        await stockitemBO.ManageStockItems(3, GrnId, req.Data);
                    } catch (ex) {
                        // throw { message: 'Error in Adding Stock' };
                        let errorMessages: any = [];
                        _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                        throw { message: 'Error in Adding ' + errorMessages.join('$,$') };
                    }
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // // await stockmovementBO.ManageStockMovements(3, GrnId, req.Data);
                // /**Newly Included */
                // let stockmovResult = await stockmovementBO.ManageStockMovements1(3, GrnId, req.Data);
                //     if (stockmovResult && stockmovResult.length > 0) {
                //         let errorMessages: any = [];
                //         _.forEach(stockmovResult, (item: any) => { errorMessages.push(item.error.name); });
                //         throw { message: 'Something went Wrong in ' + errorMessages.join(',') };
                //     }
                // let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
                // await itemmasterBO.ManageMasterItemInternalPrice(req.Data);
                let itemstoreBO = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoreBO.ManageItemStoreMapsAfterGrn(req.Data.Header.StoreMasterId, req.Data);
                */

                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                await itemvendorBO.ManageItemVendorMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                let itemcustomerBO = BoFactory.GetBo(bo.ItemCustomerMapBo, this.Request);
                await itemcustomerBO.ManageItemCustomerMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                if (req.Data.Header.PurchaseOrderId > 0 && req.Data.Header.PoNumber !== null) {
                    let purchaseorderBO = BoFactory.GetBo(bo.PurchaseOrderBo, this.Request);
                    await purchaseorderBO.ManagePurchaseOrder(GrnId, req.Data);
                }
            }

            let grnIdentifier: any = null;
            // let seqidentifier = SequenceKeys.GRNStore;
            if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
                // if (req.Data.Header.StoreTypeId === 1) {
                // if (req.Data.Header.StoreSubTypeId === 2) {
                // if (req.Data.Header.SequenceOptionId === 2) {
                //     seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                //     grnIdentifier = this.getSequenceIdentifier(seqidentifier);
                // } else {
                //     grnIdentifier = this.getSequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId);
                // }
                // } else {
                if (req.Data.Header.IsGeneralPoGrn === true && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === true && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.GeneralGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === false && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                // if (req.Data.Header.GrnTypeId === 1) {
                //     grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                //         req.Data.Header.FacilityId
                //     );
                // }
                if (req.Data.Header.GrnTypeId === 1 && req.Data.Header.IsConsignmentDC === true) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 1 && req.Data.Header.IsConsignmentDC === false) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralPoGrn === false && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 3) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                // }
                // } else {
                //     grnIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId);
                // }

            }

            // if (grnIdentifier) {
            //     try {
            //         const afterO: any = () => {
            //             return ((bo, request, grnId) => {
            //                 return {
            //                     UpdateMovementInfo: async (code: string) => {
            //                         request.Data.Header.TransactionId = grnId;
            //                         req.Data.Header.TransactionNumber = code;
            //                         await bo.UpdateMovementInfo(request);
            //                     }
            //                 };
            //             })(this, req, GrnId);
            //         };

            //         this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
            //     } catch (ex) {
            //         console.log(ex);
            //         throw { message: 'Unkonwn Issue.. Please try again' };
            //     }
            // }
            if (grnIdentifier) {
                // grnIdentifier = 'null';
                const afterO: any = () => {
                    return ((bo, request, grnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                try {
                                    request.Data.Header.TransactionId = grnId;
                                    req.Data.Header.TransactionNumber = code;
                                    await bo.UpdateMovementInfo(request);
                                } catch (error) {
                                    console.error('Error in UpdateMovementInfo:', error);
                                    throw error;  // Handle the error as needed
                                }
                            }
                        };
                    })(this, req, GrnId);
                };

                // this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
                const handleDeferredExecution = async () => {
                    try {
                        // Assuming deferSequenceKey processes a list of functions
                        await this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
                    } catch (error) {
                        // console.error('Error in deferSequenceKey execution:', error);
                        // throw error;
                        throw { message: 'Unkonwn Issue.. Please try again' };
                    }
                };

                handleDeferredExecution();
            }
            if (req.Data.Header.VendorMasterId > 0) {
                let vendorBo = BoFactory.GetBo(invbo.VendorMasterBo, this.Request);
                let VendorInfo = await vendorBo.GetVendorMasterById({ Id: req.Data.Header.VendorMasterId });
                let paymentRequest: any = {
                    Data: {
                        Id: VendorInfo.Id,
                        BillAmount: (VendorInfo.BillAmount) + (req.Data.Header.TotalNetAmount),
                        // PaidAmount: (VendorInfo.PaidAmount)+(req.Data.Header.ReceivedAmount),
                        OutStandingAmount: (VendorInfo.OutStandingAmount) + (req.Data.Header.TotalNetAmount),

                    }
                };
                await vendorBo.UpdateVendorMasters(paymentRequest);
            }

            return GrnId;
        }

        return 0;
    }
    public async UpdateSubmission(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        return result;
    }
    public async UpdateGrn(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
            await this.InvoiceCheck(req);
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.GrnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                    }
                } else {
                    req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                }
            } else {
                req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.NMDGoodsReceiptNoteId);
            }
            */
            req.Data.Header.GrnDate = new Date();
            req.Data.Header.ReceivedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        }

        if (req.Data.Header.GrnStatusId === 3 && req.Data.Header.GrnNumber !== null) {
            req.Data.Header.AuthorizedDate = new Date();
        }

        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
            let GrnId = req.Data.Header.Id;
            await detailBO.ManageGrnDetails(GrnId, req.Data, req.Data.Details);

            if (req.Data.Header.GrnStatusId === 2) {
                if (!req.Data.Header.IsConsignmentPO) {
                    let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    try {
                        await stockitemBO.ManageStockItems(3, req.Data.Header.Id, req.Data);
                    } catch (ex) {
                        let errorMessages: any = [];
                        _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                        throw { message: 'Error in Adding ' + errorMessages.join('$,$') };
                    }
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(3, req.Data.Header.Id, req.Data);

                let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
                await itemmasterBO.ManageMasterItemInternalPrice(req.Data);

                /*
                let itemstoreBO = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoreBO.ManageItemStoreMapsAfterGrn(req.Data.Header.StoreMasterId, req.Data);
                */

                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                await itemvendorBO.ManageItemVendorMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                let itemcustomerBO = BoFactory.GetBo(bo.ItemCustomerMapBo, this.Request);
                await itemcustomerBO.ManageItemCustomerMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                if (req.Data.Header.PurchaseOrderId > 0 && req.Data.Header.PoNumber !== null) {
                    let purchaseorderBO = BoFactory.GetBo(bo.PurchaseOrderBo, this.Request);
                    await purchaseorderBO.ManagePurchaseOrder(GrnId, req.Data);
                }
            }

            let grnIdentifier: any = null;
            // let seqidentifier = SequenceKeys.GRNStore;
            if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
                // if (req.Data.Header.StoreTypeId === 1) {
                // if (req.Data.Header.StoreSubTypeId === 2) {
                //     if (req.Data.Header.SequenceOptionId === 2) {
                //         seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                //         grnIdentifier = this.getSequenceIdentifier(seqidentifier);
                //     } else {
                //         grnIdentifier = this.getSequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId);
                //     }
                // } else {
                if (req.Data.Header.IsGeneralPoGrn === true && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === true && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.GeneralGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === false && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 1 && req.Data.Header.IsConsignmentDC === true) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 1 && req.Data.Header.IsConsignmentDC === false) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralPoGrn === false && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 3) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (!grnIdentifier && req.Data.Header.GrnTypeId === 2 && req.Data.Header.IsConsignmentPO) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                // }
                // } else {
                //     grnIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId);
                // }

            }

            if (grnIdentifier) {
                // grnIdentifier = 'null';
                const afterO: any = () => {
                    return ((bo, request, grnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                try {
                                    request.Data.Header.TransactionId = grnId;
                                    req.Data.Header.TransactionNumber = code;
                                    await bo.UpdateMovementInfo(request);
                                } catch (error) {
                                    console.error('Error in UpdateMovementInfo:', error);
                                    throw error;  // Handle the error as needed
                                }
                            }
                        };
                    })(this, req, GrnId);
                };

                // this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
                const handleDeferredExecution = async () => {
                    try {
                        // Assuming deferSequenceKey processes a list of functions
                        await this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
                    } catch (error) {
                        // console.error('Error in deferSequenceKey execution:', error);
                        throw error;
                    }
                };

                handleDeferredExecution();
            }

            return GrnId;
        }

        return result;
    }
    public async UpdatePoGrn(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
            // await this.InvoiceCheck(req);
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.GrnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                    }
                } else {
                    req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.MDGoodsReceiptNoteId);
                }
            } else {
                req.Data.Header.GrnNumber = await Sequence.Next(SequenceKeys.NMDGoodsReceiptNoteId);
            }
            */
            req.Data.Header.GrnDate = new Date();
            req.Data.Header.ReceivedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        }

        if (req.Data.Header.GrnStatusId === 3 && req.Data.Header.GrnNumber !== null) {
            req.Data.Header.AuthorizedDate = new Date();
        }

        let result: any;
        if (req.Data.Header.IsConsignmentPO) {
            req.Data.Header.Id = 0;
            result = await this.Save(req.Data.Header);
            req.Data.Header.Id = result.dataValues.Id;
        } else {
            result = await this.Update(req.Data.Header);
        }

        if (result) {
            let detailBO = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
            let GrnId = req.Data.Header.Id;
            // let GrnId = result.dataValues.Id;
            await detailBO.ManageGrnDetails(GrnId, req.Data, req.Data.Details);

            if (req.Data.Header.GrnStatusId === 2) {
                if (!req.Data.Header.IsConsignmentPO) {
                    let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    try {
                        await stockitemBO.ManageStockItems(3, req.Data.Header.Id, req.Data);
                    } catch (ex) {
                        let errorMessages: any = [];
                        _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                        throw { message: 'Error in Adding ' + errorMessages.join('$,$') };
                    }
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(3, req.Data.Header.Id, req.Data);

                let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
                await itemmasterBO.ManageMasterItemInternalPrice(req.Data);

                /*
                let itemstoreBO = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoreBO.ManageItemStoreMapsAfterGrn(req.Data.Header.StoreMasterId, req.Data);
                */

                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                await itemvendorBO.ManageItemVendorMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                let itemcustomerBO = BoFactory.GetBo(bo.ItemCustomerMapBo, this.Request);
                await itemcustomerBO.ManageItemCustomerMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);

                if (req.Data.Header.PurchaseOrderId > 0 && req.Data.Header.PoNumber !== null) {
                    let purchaseorderBO = BoFactory.GetBo(bo.PurchaseOrderBo, this.Request);
                    await purchaseorderBO.ManagePurchaseOrder(GrnId, req.Data);
                }
            }

            let grnIdentifier: any = null;
            // let seqidentifier = SequenceKeys.GRNStore;
            if (req.Data.Header.GrnStatusId === 2 && req.Data.Header.GrnNumber === null) {
                // if (req.Data.Header.StoreTypeId === 1) {
                //     if (req.Data.Header.StoreSubTypeId === 2) {
                //         if (req.Data.Header.SequenceOptionId === 2) {
                //             seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.GRNStore, req.Data.Header.StoreMasterId);
                //             grnIdentifier = this.getSequenceIdentifier(seqidentifier);
                //         } else {
                //             grnIdentifier = this.getSequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId);
                //         }
                //     } else {
                //         grnIdentifier = this.getSequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId);
                //     }
                // } else {
                //     grnIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId);
                // }
                if (req.Data.Header.IsGeneralPoGrn === true && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === true && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.GeneralGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.IsGeneralGrn === false && req.Data.Header.GrnTypeId === 1) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                // if (req.Data.Header.GrnTypeId === 1) {
                //     grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                //         req.Data.Header.FacilityId
                //     );
                // }
                if (req.Data.Header.IsGeneralPoGrn === false && req.Data.Header.GrnTypeId === 2) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (req.Data.Header.GrnTypeId === 3) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDGoodsReceiptNoteId,
                        req.Data.Header.FacilityId
                    );
                }
                if (!grnIdentifier && req.Data.Header.GrnTypeId === 2 && req.Data.Header.IsConsignmentPO) {
                    grnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.ConsignmentNoteId,
                        req.Data.Header.FacilityId
                    );
                }
            }

            if (grnIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, grnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = grnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, GrnId);
                };

                this.deferSequenceKey(GrnId, 'GrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
            }

            return GrnId;
        }

        return result;
    }
    public async InvoiceCheck(req: BaseRequest): Promise<boolean> {
        let grninfo = req.Data.Header;

        if (grninfo.GrnStatusId === 2) {
            const invoiceDate = new Date(grninfo.InvoiceDate);
            const currentYear = invoiceDate.getFullYear();
            const currentMonth = invoiceDate.getMonth() + 1;
            const fyStart = new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1); // April 1
            const fyEnd = new Date(currentMonth >= 4 ? currentYear + 1 : currentYear, 2, 31, 23, 59, 59, 999); // March 31
            let grnInvoiceNo: number = await this.GetInvoiceNoByOptions({
                where: {
                    VendorMasterId: grninfo.VendorMasterId,
                    InvoiceNumber: grninfo.InvoiceNumber,
                    GrnStatusId: { '$in': [2, 3, 4] },
                    InvoiceDate: { '$between': [fyStart, fyEnd] }
                } as any,
                attributes: ['Id']
            });
            if (grnInvoiceNo > 0) {
                throw { code: 'VENDOR_INVOICE_EXIST' };
            }
        }
        return true;
    }

    public async GetInvoiceNoByOptions(foption: SStatic.FindOptions<any>): Promise<number> {
        let invoiceGrnId: number = -1;
        let grnInstance: any = await this.Find(foption);
        if (grnInstance) {
            let invoicegrn = this.GetAttribute(grnInstance);
            invoiceGrnId = invoicegrn.Id;
        }
        return invoiceGrnId;
    }

    public async ManageGrnOnPurchseReturn(PurchaseReturnId: number, request: any): Promise<any> {
        let grn = await this.GetGrnById({ Id: request.Header.GrnId });
        grn.GrnStatusId = 5;
        grn.PurchaseReturnId = PurchaseReturnId;
        grn.PrnNumber = request.Header.PrnNumber;
        grn.PrnDate = request.Header.PrnDate;
        await this.Update(grn);
    }

    public async ManagePurchaseTallyApprove(req: BaseRequest): Promise<boolean> {
        let details: GrnAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
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

    public async GetGrnById(req: BaseRequest): Promise<GrnAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.VendorMaster, attributes: ['VendorCode', 'VendorName'], required: false,
            // include: [
            //     this.GetReference('Title')
            // ]
        });
        include.push({
            model: this.Models.PurchaseOrder, attributes: ['PatientBillId', 'PurchaseOrderId', 'PatientId'], required: false,
            include: [{
                model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'MRN'], required: false, include: [
                    this.GetReference('Title')
                ],
            }, {
                model: this.Models.PatientBills, required: false
            },
            {
                model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false
            }
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetGrnByIdwoDetails(req: BaseRequest): Promise<GrnAttributes> {
        let result = await this.GetById(req.Id, { attributes: ['Id', 'GrnNumber', 'GrnStatusId'] });
        return this.GetAttribute(result);
    }

    public async GetGrns(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let itemWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        let StoreWhere: WhereOptions<any> = {};
        let isReqStoreSearch: boolean = false;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'UpdatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('GrnType'));
        include.push(this.GetReference('GrnStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.PurchaseOrder, required: false });
        include.push({
            model: this.Models.StoreMaster, required: isReqStoreSearch,
            where: StoreWhere,
        });
        include.push({
            model: this.Models.VendorMaster,
            include: [
                { model: this.Models.GstMaster, required: false }
            ],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GrnFilters.Id:
                        where['GrnId'] = param.Value;
                        break;
                    case GrnFilters.GrnNumber:
                        (where as any)[Op.or] = [{ GrnNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { InvoiceNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case GrnFilters.GrnTypeId:
                        where['GrnTypeId'] = param.Value;
                        break;
                    case GrnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case GrnFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case GrnFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case GrnFilters.InvoiceNumber:
                        where['InvoiceNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.GrnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['GrnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case GrnFilters.PoNumber:
                        where['PoNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.GpNumber:
                        where['GpNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case GrnFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case GrnFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case GrnFilters.IsConsignmentPO:
                        where['IsConsignmentPO'] = param.Value;
                        break;
                    case GrnFilters.GrnDate:
                        where['GrnDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnFilters.From:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnFilters.To:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case GrnFilters.ItemMasterId:
                        itemWhere['ItemMasterId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case GrnFilters.IsPaidFully:
                        where['IsPaidFully'] = param.Value;
                        break;
                    case GrnFilters.GrnNo:
                        where['GrnNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.IsGeneralPoGrn:
                        where['IsGeneralPoGrn'] = param.Value;
                        break;
                    case GrnFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case GrnFilters.IsStockTransferred:
                        where['IsStockTransferred'] = param.Value;
                        break;
                    case GrnFilters.TotalGrossAmount:
                        where['TotalGrossAmount'] = param.Value;
                        break;
                    case GrnFilters.StoreTypeId:
                        StoreWhere['StoreTypeId'] = param.Value;
                        isReqStoreSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.GrnDetail,
            required: isReqItemSearch,
            where: itemWhere,
            include: [
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                { model: this.Models.StockSerialItem, required: false }
            ]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetGrnList(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'SubmittedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReceivedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RejectedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('GrnType'));
        include.push(this.GetReference('GrnStatus'));
        include.push(this.GetReference('ClaimSubmissionStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.PurchaseOrder, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GrnFilters.Id:
                        where['GrnId'] = param.Value;
                        break;
                    case GrnFilters.GrnNumber:
                        (where as any)[Op.or] = [{ GrnNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { InvoiceNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case GrnFilters.GrnTypeId:
                        where['GrnTypeId'] = param.Value;
                        break;
                    case GrnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case GrnFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case GrnFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case GrnFilters.InvoiceNumber:
                        where['InvoiceNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.GrnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['GrnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    // case GrnFilters.GrnStatusId:
                    //     where['GrnStatusId'] = { '$like': '%' + (param.Value || '') + '%' };
                    //     break;
                    case GrnFilters.PoNumber:
                        where['PoNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.GpNumber:
                        where['GpNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case GrnFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case GrnFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case GrnFilters.GrnDate:
                        where['GrnDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnFilters.From:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnFilters.To:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case GrnFilters.TallyApprovedStatusId:
                        where['TallyApprovedStatusId'] = param.Value;
                        break;
                    case GrnFilters.SubmissionStatusId:
                        where['SubmissionStatusId'] = param.Value;
                        break;
                    case GrnFilters.SubmittedDate:
                        where['SubmittedDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnFilters.SubFrom:
                        where['SubmittedDate'] = where['SubmittedDate'] || {};
                        (where['SubmittedDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnFilters.SubTo:
                        where['SubmittedDate'] = where['SubmittedDate'] || {};
                        (where['SubmittedDate'] as any)['$lte'] = param.Value;
                        break;
                    case GrnFilters.IsGeneralPoGrn:
                        where['IsGeneralPoGrn'] = param.Value;
                        break;
                    case GrnFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case GrnFilters.IsConsignmentPO:
                        where['IsConsignmentPO'] = param.Value;
                        break;
                    case GrnFilters.DcNumber:
                        where['DcNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case GrnFilters.IsConsignmentDC:
                        where['IsConsignmentDC'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetVendorOutstandings(req: BaseRequest): Promise<any> {
        let result: any = [];
        let purchasereturnBO = BoFactory.GetBo(invbo.PurchaseReturnBo, this.Request);
        let voucherBO = BoFactory.GetBo(invbo.VendorPaymentBo, this.Request);
        result.push({ Key: 'GRN', Value: await this.GetSupplierGrns(req) });
        result.push({ Key: 'PurchaseReturn', Value: await purchasereturnBO.GetSupplierPurchaseReturn(req) });
        result.push({ Key: 'PaymentVocher', Value: await voucherBO.GetSupplierVoucher(req) });
        // result.push({ Key: 'PV', Value: await this.PharmacyCollection(req) });
        return result;
    }


    public async GetSupplierGrns(req: BaseRequest): Promise<any> {
        let GrnResult: any = [];
        // GrnResult['DisplayOrder'] = 1;
        if (req.Data.VendorMasterId > 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['GrnDate', 'InvoiceNumber', 'GrnNumber',
                    'TotalInvoiceAmount', 'TotalCreditAmount', 'TotalNetAmount', 'VendorMasterId'],
                where: {
                    GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    GrnStatusId: { '$in': [2, 3, 4] },
                    VendorMasterId: { '$eq': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let InvoiceNumber: string = '';
                let GrnNumber: string = '';
                let TotalInvoiceAmount: number = 0;
                let TotalCreditAmount: number = 0;
                let TotalNetAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.GrnDate;
                    InvoiceNumber = bills.InvoiceNumber;
                    GrnNumber = bills.GrnNumber;
                    TotalNetAmount = bills.TotalNetAmount;
                    TotalCreditAmount = bills.TotalCreditAmount;
                    TotalInvoiceAmount = bills.TotalInvoiceAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'InvoiceNumber': InvoiceNumber,
                        'GrnNumber': GrnNumber,
                        'TotalNetAmount': TotalNetAmount,
                        'TotalCreditAmount': TotalCreditAmount,
                        'TotalInvoiceAmount': TotalInvoiceAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    GrnResult.push(info);
                }

            }
        } else if (req.Data.VendorMasterId === 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['GrnDate', 'InvoiceNumber', 'GrnNumber',
                    'TotalInvoiceAmount', 'TotalCreditAmount', 'TotalNetAmount', 'VendorMasterId'],
                where: {
                    GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    GrnStatusId: { '$in': [2, 3, 4] },
                    VendorMasterId: { '$gt': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let InvoiceNumber: string = '';
                let GrnNumber: string = '';
                let TotalInvoiceAmount: number = 0;
                let TotalCreditAmount: number = 0;
                let TotalNetAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.GrnDate;
                    InvoiceNumber = bills.InvoiceNumber;
                    GrnNumber = bills.GrnNumber;
                    TotalNetAmount = bills.TotalNetAmount;
                    TotalCreditAmount = bills.TotalCreditAmount;
                    TotalInvoiceAmount = bills.TotalInvoiceAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'InvoiceNumber': InvoiceNumber,
                        'GrnNumber': GrnNumber,
                        'TotalNetAmount': TotalNetAmount,
                        'TotalCreditAmount': TotalCreditAmount,
                        'TotalInvoiceAmount': TotalInvoiceAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    GrnResult.push(info);
                }
            }
        }
        return GrnResult;
    }


    public async GetSupplierInvoiceSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(invbo.PurchaseReturnBo, this.Request);
        result.push({ Key: 1, Value: await this.SupplierInVoice(req) });
        result.push({ Key: 2, Value: await returnBO.SupplierReturn(req) });
        return result;
    }
    public async SupplierInVoice(req: BaseRequest): Promise<any> {
        let VendorGroup: { [id: number]: any[] } = {};
        let VendorGroupJoin: any = {
            model: this.Models.VendorMaster, as: 'VendorMaster',
            attributes: ['VendorName'],
            required: true,
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let InvoiceAmtInstance: any = await this.FindAll({
            attributes: ['TotalGrossAmount', 'TotalGstAmount', 'TotalNetAmount',
                'TotalCreditAmount', 'TotalInvoiceAmount', 'VendorName', 'VendorMasterId'],
            where: {
                GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                GrnStatusId: { '$in': [2, 3, 4] },
                VendorMasterId: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            },
            include: [VendorGroupJoin]
        });
        if (InvoiceAmtInstance) {
            let groupbills = _.groupBy(InvoiceAmtInstance, 'VendorMasterId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let TotalInvoiceAmount: number = 0;
                let VendorMasterId: number = 0;
                let TotalGrossAmount: number = 0;
                let TotalGstAmount: number = 0;
                let TotalNetAmount: number = 0;
                let TotalCreditAmount: number = 0;
                let VendorName: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    TotalGrossAmount += bills.TotalGrossAmount;
                    TotalGstAmount += bills.TotalGstAmount;
                    TotalNetAmount += bills.TotalNetAmount;
                    TotalCreditAmount += bills.TotalCreditAmount;
                    TotalInvoiceAmount += bills.TotalInvoiceAmount;
                    VendorMasterId = bills.VendorMasterId;
                    VendorName = bills.VendorName;
                    VendorGroup[VendorMasterId] = VendorGroup[VendorMasterId] || [];
                }
                let info = {
                    'TotalGrossAmount': TotalGrossAmount,
                    'TotalGstAmount': TotalGstAmount,
                    'TotalNetAmount': TotalNetAmount,
                    'TotalCreditAmount': TotalCreditAmount,
                    'TotalInvoiceAmount': TotalInvoiceAmount,
                    'VendorMasterId': VendorMasterId,
                    'VendorName': VendorName
                };
                VendorGroup[VendorMasterId].push(info);
            }
        }
        return VendorGroup;
    }

    public async GetToDayGrns(apiReq?: ApiRequest<GrnFilters>): Promise<ApiResponse<GrnAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.GrnDetail,
            required: false,
            include: [
                { model: this.Models.VendorMaster, as: 'VendorMaster', required: false, attributes: ['VendorCode', 'VendorName'] },
                { model: this.Models.ItemMaster, as: 'ItemMaster', required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GrnFilters.Id:
                        where['GrnId'] = param.Value;
                        break;
                    case GrnFilters.GrnNumber:
                        where['GrnNumber'] = param.Value;
                        break;
                    case GrnFilters.GrnTypeId:
                        where['GrnTypeId'] = param.Value;
                        break;
                    case GrnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case GrnFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case GrnFilters.InvoiceNumber:
                        where['InvoiceNumber'] = param.Value;
                        break;
                    case GrnFilters.GrnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['GrnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case GrnFilters.PoNumber:
                        where['PoNumber'] = param.Value;
                        break;
                    case GrnFilters.GpNumber:
                        where['GpNumber'] = param.Value;
                        break;
                    case GrnFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case GrnFilters.GrnDate:
                        where['GrnDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnFilters.From:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnFilters.To:
                        where['GrnDate'] = where['GrnDate'] || {};
                        (where['GrnDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGrn(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintGrn(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GrnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetGrns(apiReq);
        let Grns = data.Data[0];
        let VendorBo = BoFactory.GetBo(vendorbo.VendorMasterBo, this.Request);
        let VendorData = await VendorBo.GetVendorMasterById({ Id: Grns.VendorMasterId });
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GrnDetailFilters.GrnId, Value: Grns.Id }]
        };
        let GrnDetailBo = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
        let GrnDetailData: any = await GrnDetailBo.GetGrnDetails(Req);
        let GrnDetails: any = [];
        GrnDetailData.Data.forEach((Detail: any) => {
            var GrnDetail = Detail;
            GrnDetail.Amt = Detail.NetAmount - (Detail.GrnQuantity * Detail.CGstAmount + Detail.GrnQuantity * Detail.SGstAmount);
            GrnDetail.CgstTax = Detail.GrnQuantity * (Detail.CGstAmount).toFixed(2);
            GrnDetail.SgstTax = Detail.GrnQuantity * (Detail.SGstAmount).toFixed(2);
            GrnDetail.TotalMRP = Detail.GrnQuantity * (Detail.UomMrPrice).toFixed(2);
            GrnDetail.MrPrice = (Detail.MrPrice).toFixed(2);
            GrnDetail.UomPrice = (Detail.UomPrice).toFixed(2);
            GrnDetail.GstAmount = (Detail.GstAmount).toFixed(2);
            GrnDetail.NetAmount = (Detail.NetAmount).toFixed(2);
            GrnDetail.Dis = Detail.GrnQuantity * Detail.UomDiscountAmount;
            GrnDetails.push(GrnDetail);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Grns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Grns.FacilityId, Grns.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.printheader = printStoreData.printheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Grn: Grns,
            GrnDetailDetail: GrnDetails,
            Vendor: VendorData,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'Grn';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '0.7in',
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
    public async PrintInvoiceSummarySupplierReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let Collection: any = [];
        let NetSupplierCollection: any = [];
        let SalesReq = req;
        Collection = await this.GetSupplierInvoiceSummary(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        if (Collection) {
            let suppliercollection = [];
            let supplierreturncollection = [];
            if (Collection.length > 0) {
                suppliercollection = Collection[0].Value;
            }
            if (Collection.length > 1) {
                supplierreturncollection = Collection[1].Value;
            }
            for (let idx in suppliercollection) {
                let suppliercoll = suppliercollection[idx];
                let Key = '';
                let InvoiceAmt = 0;
                let GrossAmt = 0;
                let GstAmt = 0;
                let NetAmt = 0;
                let CreditAmt = 0;
                for (let ix in suppliercoll) {
                    let VendorName = '';
                    if (suppliercoll[ix].VendorName) {
                        VendorName = suppliercoll[ix].VendorName;
                    }

                    if (suppliercoll[ix].TotalGrossAmount) {
                        GrossAmt = suppliercoll[ix].TotalGrossAmount;
                    }
                    if (suppliercoll[ix].TotalGstAmount) {
                        GstAmt = suppliercoll[ix].TotalGstAmount;
                    }
                    if (suppliercoll[ix].TotalNetAmount) {
                        NetAmt = suppliercoll[ix].TotalNetAmount;
                    }
                    if (suppliercoll[ix].TotalCreditAmount) {
                        CreditAmt = suppliercoll[ix].TotalCreditAmount;
                    }
                    if (suppliercoll[ix].TotalInvoiceAmount) {
                        InvoiceAmt = suppliercoll[ix].TotalInvoiceAmount;
                    }
                    Key = VendorName;
                    GrossAmt = GrossAmt;
                    GstAmt = GstAmt;
                    NetAmt = NetAmt;
                    CreditAmt = CreditAmt;
                    InvoiceAmt = InvoiceAmt;
                }
                NetSupplierCollection.push({
                    'Key': Key,
                    'Value': {
                        'GrossAmt': GrossAmt,
                        'GstAmt': GstAmt,
                        'NetAmt': NetAmt,
                        'CreditAmt': CreditAmt,
                        'InvoiceAmt': InvoiceAmt,
                        'ReturnAmt': 0.00,
                    }
                });
                for (let idx in supplierreturncollection) {
                    let supplierret = supplierreturncollection[idx];
                    let Key = '';
                    let ReturnAmt = 0;
                    for (let ix in supplierret) {
                        let VendorName = '';
                        if (supplierret[ix].VendorName) {
                            VendorName = supplierret[ix].VendorName;
                        }

                        if (supplierret[ix].TotalReturnAmount) {
                            ReturnAmt = supplierret[ix].TotalReturnAmount;
                        }
                        Key = VendorName;
                        ReturnAmt = ReturnAmt;
                    }
                    let valappended = 0;
                    NetSupplierCollection.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.Value.ReturnAmt = ReturnAmt;
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSupplierCollection.push({
                            'Key': Key,
                            'Value': {
                                'GrossAmt': 0.00,
                                'GstAmt': 0.00,
                                'NetAmt': 0.00,
                                'CreditAmt': 0.00,
                                'InvoiceAmt': 0.00,
                                'ReturnAmt': ReturnAmt,
                            }
                        });
                }
            }

        }

        let info = {
            NetSupplierCollection: NetSupplierCollection,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,

        };
        let pdfOption: any = null;
        let key = 'invoicesummarybysupplier';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async Print1Grn(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GrnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetGrns(apiReq);
        let Grns: any = data.Data[0];
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(Grns.GrnDate);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: Grns.StoreMasterId
            }
        });
        let PatientData: any = {};
        if (Grns.IsConsignment) {
            let patId = Grns.PurchaseOrder.PatientId;
            let PatBo = BoFactory.GetBo(patbo.PatientBo, this.Request);
            PatientData = await PatBo.GetPatientById({ Id: patId });
        }
        let VendorBo = BoFactory.GetBo(vendorbo.VendorMasterBo, this.Request);
        let VendorData = await VendorBo.GetVendorMasterById({ Id: Grns.VendorMasterId });
        let VendorContactBo = BoFactory.GetBo(vendorbo.VendorContactBo, this.Request);
        let VendorContactReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: VendorContactFilters.VendorMasterId, Value: Grns.VendorMasterId }]
        };
        let VendorContactData: any = await VendorContactBo.GetVendorContacts(VendorContactReq);
        let VendorContact = VendorContactData.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GrnDetailFilters.GrnId, Value: Grns.Id }]
        };
        let GrnDetailBo = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
        let GrnDetailData: any = await GrnDetailBo.GetGrnDetails(Req);
        let GrnDetails: any = [];
        GrnDetailData.Data.forEach((Detail: any) => {
            var GrnDetail = Detail;
            GrnDetail.Amt = Detail.NetAmount - (Detail.GrnQuantity * Detail.CGstAmount + Detail.GrnQuantity * Detail.SGstAmount);
            GrnDetail.CgstTax = Detail.GrnQuantity * (Detail.CGstAmount).toFixed(2);
            GrnDetail.SgstTax = Detail.GrnQuantity * (Detail.SGstAmount).toFixed(2);
            GrnDetail.TotalMRP = Detail.GrnQuantity * (Detail.UomMrPrice).toFixed(2);
            GrnDetail.MrPrice = (Detail.MrPrice).toFixed(2);
            GrnDetail.UomPrice = (Detail.UomPrice).toFixed(2);
            GrnDetail.GstAmount = (Detail.GstAmount).toFixed(2);
            GrnDetail.NetAmount = (Detail.NetAmount).toFixed(2);
            GrnDetail.Dis = Detail.GrnQuantity * Detail.UomDiscountAmount;
            GrnDetails.push(GrnDetail);
        });
        let custom_sort = function (a: any, b: any) {
            return parseInt(a.Id) - parseInt(b.Id);
        };
        GrnDetails.sort(custom_sort);
        let totallineitem = GrnDetails.length;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Grns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Grns.FacilityId, Grns.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let info = {
            Grn: Grns,
            GrnDetailDetail: GrnDetails,
            Vendor: VendorData,
            VendorContact: VendorContact,
            Preferences: printPreferencesData,
            Flags: flags,
            isconsignmentgrn: req.Data.isconsignmentgrnprint,
            isconsignmentinvoice: req.Data.isconsignmentinvoiceprint,
            TOTLineItme: totallineitem,
            patientData: PatientData
        };
        let pdfOption: any = null;
        let key = 'Grn1';
        if (info.isconsignmentgrn === 1) {
            key = 'consignmentgrn';
        }
        if (info.isconsignmentinvoice === 1) {
            key = 'consignmentinvoice';
        }
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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

    public async PrintVendorOutstandingReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let VendorName = req.Data.VendorName;

        let FacilityId = req.Data.FacilityId;
        let StoreMasterId = req.Data.StoreMasterId;
        let FacilityName = req.Data.FacilityName;
        let VendorDetails: any = [];
        let VendorOutstandings = req;
        VendorDetails = await this.GetVendorOutstandings(VendorOutstandings);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        // let UserCollection = [];
        let NetVendorDetails = [];

        if (VendorDetails) {
            let grndetails = [];
            let prndetails = [];
            let voucherdetails = [];
            if (VendorDetails.length > 0) {
                grndetails = VendorDetails[0];
            }
            if (VendorDetails.length > 1) {
                prndetails = VendorDetails[1];
            }
            if (VendorDetails.length > 2) {
                voucherdetails = VendorDetails[2];
            }
            if (grndetails) {
                let Key = '';
                let GrnDate = '';
                let InvoiceNumber = '';
                let GrnNumber = '';
                let TotalInvoiceAmount = 0;
                let TotalCreditAmount = 0;
                let TotalNetAmount = 0;
                Key = grndetails.Key;
                for (let idx in grndetails.Value) {
                    let grnData = grndetails.Value[idx];
                    GrnDate = grnData.GrnDate;
                    InvoiceNumber = grnData.InvoiceNumber;
                    GrnNumber = grnData.GrnNumber;
                    TotalInvoiceAmount = grnData.TotalInvoiceAmount;
                    TotalCreditAmount = grnData.TotalCreditAmount;
                    TotalNetAmount = grnData.TotalNetAmount;
                    NetVendorDetails.push({
                        'Key': Key,
                        'GrnDate': GrnDate,
                        'InvoiceNumber': InvoiceNumber,
                        'GrnNumber': GrnNumber,
                        'TotalInvoiceAmount': TotalInvoiceAmount,
                        'TotalCreditAmount': TotalCreditAmount,
                        'TotalNetAmount': TotalNetAmount,
                        'TotalReturnAmount': 0.00,
                        'VoucherAmount': 0.00
                    });
                }
            }
            if (prndetails) {
                let Key = '';
                let GrnDate = '';
                let GrnNumber = '';
                let TotalReturnAmount = 0;
                Key = prndetails.Key;
                for (let idx in prndetails.Value) {
                    let prnData = prndetails.Value[idx];
                    GrnDate = prnData.GrnDate;
                    GrnNumber = prnData.GrnNumber;
                    TotalReturnAmount = prnData.TotalReturnAmount;
                    NetVendorDetails.push({
                        'Key': Key,
                        'GrnDate': GrnDate,
                        'InvoiceNumber': '',
                        'GrnNumber': GrnNumber,
                        'TotalInvoiceAmount': 0.00,
                        'TotalCreditAmount': 0.00,
                        'TotalNetAmount': 0.00,
                        'TotalReturnAmount': TotalReturnAmount,
                        'VoucherAmount': 0.00,
                    });
                }
            }
            if (voucherdetails) {
                let Key = '';
                let GrnDate = '';
                let GrnNumber = '';
                let VoucherAmount = 0;
                Key = voucherdetails.Key;
                for (let idx in voucherdetails.Value) {
                    let voucherData = voucherdetails.Value[idx];
                    GrnDate = voucherData.GrnDate;
                    GrnNumber = voucherData.GrnNumber;
                    VoucherAmount = voucherData.VoucherAmount;
                    NetVendorDetails.push({
                        'Key': Key,
                        'GrnDate': GrnDate,
                        'InvoiceNumber': '',
                        'GrnNumber': GrnNumber,
                        'TotalInvoiceAmount': 0.00,
                        'TotalCreditAmount': 0.00,
                        'TotalNetAmount': 0.00,
                        'TotalReturnAmount': 0.00,
                        'VoucherAmount': VoucherAmount,
                    });
                }
            }
        }
        let TotInvoiceAmount = 0;
        let TotCNAmount = 0;
        let TotNetAmt = 0;
        let TotRetAmount = 0;
        let TotVoucherAmount = 0;
        let FinalOutstanding = 0;

        for (let jdx in NetVendorDetails) {
            let netcollection = NetVendorDetails[jdx];
            TotInvoiceAmount = TotInvoiceAmount + (netcollection.TotalInvoiceAmount || 0);
            TotCNAmount = TotCNAmount + (netcollection.TotalCreditAmount || 0);
            TotNetAmt = TotNetAmt + (netcollection.TotalNetAmount || 0);
            TotRetAmount = TotRetAmount + (netcollection.TotalReturnAmount || 0);
            TotVoucherAmount = TotVoucherAmount + (netcollection.VoucherAmount || 0);
        }
        TotInvoiceAmount = TotInvoiceAmount;
        TotCNAmount = TotCNAmount;
        TotNetAmt = TotNetAmt;
        TotRetAmount = TotRetAmount;
        TotVoucherAmount = TotVoucherAmount;
        FinalOutstanding = (TotNetAmt - TotRetAmount - TotVoucherAmount);

        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            NetVendorDetails: NetVendorDetails,
            FacilityName: FacilityName,
            VendorName: VendorName,
            TotInvoiceAmount: TotInvoiceAmount,
            TotCNAmount: TotCNAmount,
            TotNetAmt: TotNetAmt,
            TotRetAmount: TotRetAmount,
            TotVoucherAmount: TotVoucherAmount,
            FinalOutstanding: FinalOutstanding

        };
        let pdfOption: any = null;
        let key = 'vendoroutstandingreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintGRNReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        let data = await this.GetGrns(apiReq);
        let Grn = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let GrnStatus = apiReq.Data.GrnStatus;
        let GrnData = data.Data[0];
        let TotalAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalGSTAmount: number = 0;
        let TotalOtherAmount: number = 0;
        let TotalRoundoffAmount: number = 0;
        for (var idx in Grn) {
            var item = Grn[idx];
            TotalAmount = TotalAmount + (item.TotalGrossAmount);
            TotalDisAmount = TotalDisAmount + (item.TotalDiscountAmount);
            TotalNetAmount = TotalNetAmount + (item.TotalNetAmount);
            TotalGSTAmount = TotalGSTAmount + (item.TotalGstAmount);
            TotalOtherAmount = TotalOtherAmount + (item.OtherCharges);
            TotalRoundoffAmount = TotalRoundoffAmount + (item.RoundOff);

        }
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(GrnData.GrnDate);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: GrnData.StoreMasterId
            }
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GrnData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(GrnData.FacilityId, GrnData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let info = {
            Grn: Grn,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            GrnStatus: GrnStatus,
            TotalAmount: TotalAmount,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalGSTAmount: TotalGSTAmount,
            TotalOtherAmount: TotalOtherAmount,
            TotalRoundoffAmount: TotalRoundoffAmount
        };
        let pdfOption: any = null;
        let key = 'grnreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintVendorPendingPaymentReport(apiReq?: ApiRequest<GrnFilters>): Promise<any> {
        let data = await this.GetGrns(apiReq);
        let Grn = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let FacilityName = apiReq.Data.FacilityName;
        let GrnData = data.Data[0];
        let TotalInvoiceAmt: number = 0;
        let TotalNetAmt: number = 0;
        let TotalRecAmt: number = 0;
        let TotalTdsAmt: number = 0;
        let TotalWriteoffAmt: number = 0;
        let TotalBalanceAmt: number = 0;
        for (let idx in Grn) {
            let item = Grn[idx];
            TotalInvoiceAmt += item.TotalInvoiceAmount;
            TotalNetAmt += item.TotalNetAmount;
            TotalRecAmt += item.ReceivedAmount;
            TotalTdsAmt += item.TaxAmount;
            TotalWriteoffAmt += item.WriteOff;
            TotalBalanceAmt += item.BalanceAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GrnData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(GrnData.FacilityId, GrnData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Grn: Grn,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            FacilityName: FacilityName,
            TotalInvoiceAmt: TotalInvoiceAmt,
            TotalNetAmt: TotalNetAmt,
            TotalRecAmt: TotalRecAmt,
            TotalTdsAmt: TotalTdsAmt,
            TotalWriteoffAmt: TotalWriteoffAmt,
            TotalBalanceAmt: TotalBalanceAmt
        };
        let pdfOption: any = null;
        let key = 'vendorpendingpaymentreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async DMPrintGrn(req: BaseRequest): Promise<any> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: GrnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetGrns(apiReq);
        let Grns = data.Data[0];
        let VendorBo = BoFactory.GetBo(vendorbo.VendorMasterBo, this.Request);
        let VendorData = await VendorBo.GetVendorMasterById({ Id: Grns.VendorMasterId });
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: GrnDetailFilters.GrnId, Value: Grns.Id }]
        };
        let GrnDetailBo = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
        let GrnDetailData: any = await GrnDetailBo.GetGrnDetails(Req);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(Grns.FacilityId, Grns.StoreMasterId);
        let GrnDetails: any = [];
        GrnDetailData.Data.forEach((Detail: any) => {
            var GrnDetail = Detail;
            GrnDetail.Amt = Detail.NetAmount - (Detail.GrnQuantity * Detail.CGstAmount + Detail.GrnQuantity * Detail.SGstAmount);
            GrnDetail.CgstTax = Detail.GrnQuantity * Detail.CGstAmount;
            GrnDetail.SgstTax = Detail.GrnQuantity * Detail.SGstAmount;
            GrnDetail.TotalMRP = Detail.GrnQuantity * Detail.UomMrPrice;
            GrnDetails.push(GrnDetail);
        });

        let GrnAmountDeviationDetails: any = [];
        let ItemMasterIds = Array();
        if (GrnDetailData) {
            for (var i = 0; i < GrnDetailData.Data.length; i++) {
                let GrnDetail = GrnDetailData.Data[i];
                ItemMasterIds.push(GrnDetail.ItemMasterId);
                let ItemMasterId = GrnDetail.ItemMasterId;
                let UomPrice = GrnDetail.UomPrice;
                let PurchasePrice = GrnDetail.PurchasePrice;
                let UomPriceAfterDiscount = GrnDetail.UomPriceAfterDiscount;
                let PurchasePriceAfterDiscount = GrnDetail.PurchasePriceAfterDiscount;
                let ItemMasterReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: GrnDetailFilters.ItemMasterId, Value: ItemMasterId }]
                };
                let GrnDetailsData: any = await GrnDetailBo.GetGrnDetails(ItemMasterReq);
                GrnDetailsData.Data.sort(function (a: any, b: any) {
                    if (a.CreatedAt < b.CreatedAt) return 1;
                    else if (a.CreatedAt > b.CreatedAt) return -1;
                    return 0;
                });
                for (var j = 0; j < 3; j++) {
                    let GRN = GrnDetailsData.Data[j];
                    if (GRN) {
                        if (UomPrice > GRN.UomPrice || PurchasePrice > GRN.PurchasePrice ||
                            UomPriceAfterDiscount > GRN.UomPriceAfterDiscount ||
                            PurchasePriceAfterDiscount > GRN.PurchasePriceAfterDiscount) {
                            GrnAmountDeviationDetails.push(GRN);
                        }
                    }
                }
            }
        }

        let info = {
            Grn: Grns,
            GrnDetailDetail: GrnDetails,
            Vendor: VendorData,
            PrintData: printStoreData,
            GrnAmountDeviationDetails: GrnAmountDeviationDetails
        };
        return info;
    }
    public async IsAlreadyExist(req: any): Promise<number> {
        let encounterDate = new Date();
        let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 40);
        let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 40);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GrnFilters.GrnTypeId, Value: req.Data.Header.GrnTypeId },
            { Key: GrnFilters.VendorMasterId, Value: req.Data.Header.VendorMasterId },
            { Key: GrnFilters.From, Value: frmDate },
            { Key: GrnFilters.To, Value: todate },
            { Key: GrnFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
            { Key: GrnFilters.TotalGrossAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetGrns(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public GetModel(): SStatic.Model<GrnInstance, GrnAttributes> {
        return this.Models.Grn;
    }

    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let grnCount = await this.Items.count({
            where: {
                'Status': 1,
                'GrnStatusId': { '$in': [2, 3] },
                // 'ItemmasterId': req.Data.itemid,
                // 'StoremasterId': req.Data.storeid
            }
        });
        return {
            'grnCount': grnCount
        };
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }


}
