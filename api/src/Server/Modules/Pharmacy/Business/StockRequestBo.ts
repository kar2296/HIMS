import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockRequestInstance, StockRequestAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockRequestFilters, StockRequestDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';
import * as moment from 'moment';

export class StockRequestBo extends BaseBo<StockRequestInstance, StockRequestAttributes>  {

    public async AddStockRequest(req: BaseRequest): Promise<number> {
        if (req.Data.Header.RequestStatusId === 2 && req.Data.Header.RequestNumber === null) {
            /*
            if (req.Data.Header.ItemCategoryId === 1) {
                req.Data.Header.RequestNumber = await Sequence.Next(SequenceKeys.MDStockRequest);
            } else {
                req.Data.Header.RequestNumber = await Sequence.Next(SequenceKeys.NMDStockRequest);
            }
            */
            req.Data.Header.RequestedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.RequestStatusId === 1 && req.Data.Header.RequestNumber === null) {
            req.Data.Header.RequestedDate = new Date();
        }
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
            let StockRequestId = result.dataValues.Id;
            await detailBO.ManageStockRequestDetails(StockRequestId, req.Data.Details);

            let srIdentifier: any = null;
            if (req.Data.Header.RequestStatusId === 2 && req.Data.Header.RequestNumber === null) {
                if (req.Data.Header.ItemCategoryId === 1) {
                    srIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockRequest);
                } else {
                    srIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockRequest);
                }
            }

            if (srIdentifier) {
                this.deferSequenceKey(StockRequestId, 'RequestNumber', srIdentifier, []);
            }

            return StockRequestId;
        }

        return 0;
    }

    public async AddExcelStockRequest(req: BaseRequest): Promise<any> {
        const stockRequestIds: number[] = [];
        try {
            for (const stockItem of req.Data) {
                if (stockItem.RequestStatusId === 2 && stockItem.RequestNumber === null) {
                    stockItem.RequestedDate = new Date();
                    stockItem.ApprovedDate = new Date();
                }
                let result = await this.Save(stockItem);
                if (result) {
                    let detailBO = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
                    let StockRequestId = result.dataValues.Id;
                    stockItem.StockRequestId = StockRequestId;
                    await detailBO.Save(stockItem);

                    let srIdentifier: any = null;
                    if (stockItem.RequestStatusId === 2 && stockItem.RequestNumber === null) {
                        if (stockItem.ItemCategoryId === 1) {
                            srIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockRequest);
                        } else {
                            srIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockRequest);
                        }
                    }

                    if (srIdentifier) {
                        this.deferSequenceKey(StockRequestId, 'RequestNumber', srIdentifier, []);
                    }

                    stockRequestIds.push(StockRequestId);
                }
            }
            return stockRequestIds;
        } catch (error) {
            console.error('Error processing Excel stock request:', error);
            return [];
        }
    }

    public async UpdateStockRequest(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.RequestStatusId === 2 && req.Data.Header.RequestNumber === null) {
            /*
            if (req.Data.Header.ItemCategoryId === 1) {
                req.Data.Header.RequestNumber = await Sequence.Next(SequenceKeys.MDStockRequest);
            } else {
                req.Data.Header.RequestNumber = await Sequence.Next(SequenceKeys.NMDStockRequest);
            }
            */
            req.Data.Header.RequestedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.RequestStatusId === 3 && req.Data.Header.RequestNumber !== null) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
            let StockRequestId = req.Data.Header.Id;
            await detailBO.ManageStockRequestDetails(StockRequestId, req.Data.Details);

            let srIdentifier: any = null;
            if (req.Data.Header.RequestStatusId === 2 && req.Data.Header.RequestNumber === null) {
                if (req.Data.Header.ItemCategoryId === 1) {
                    srIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockRequest);
                } else {
                    srIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockRequest);
                }
            }

            if (srIdentifier) {
                this.deferSequenceKey(StockRequestId, 'RequestNumber', srIdentifier, []);
            }

            return StockRequestId;
        }

        return result;
    }

    public async CompleteStockRequest(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetStockRequestByIdWithoutDetails(req: BaseRequest): Promise<StockRequestAttributes> {
        let result = await this.GetById(req.Id, { attributes: ['Id', 'RequestNumber'] });
        return this.GetAttribute(result);
    }

    public async GetStockRequestById(req: BaseRequest): Promise<StockRequestAttributes> {
        let include: Array<IncludeOptions> = [];

        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TransferedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetStockRequests(apiReq?: ApiRequest<StockRequestFilters>): Promise<ApiResponse<StockRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('StockRequestType'));
        include.push(this.GetReference('RequestStatus'));
        include.push(this.GetReference('StockPriority'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Facility, as: 'ToFacility', attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.StoreMaster, as: 'FromStore', required: false,
            include: [this.GetReference('StoreType')]
        });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TransferedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockRequestFilters.Id:
                        where['StockRequestId'] = param.Value;
                        break;
                    case StockRequestFilters.RequestNumber:
                        where['RequestNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case StockRequestFilters.StockRequestTypeId:
                        where['StockRequestTypeId'] = param.Value;
                        break;
                    case StockRequestFilters.RequestStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['RequestStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockRequestFilters.RequestedDate:
                        where['RequestedDate'] = { '$between': param.Value };
                        break;
                    case StockRequestFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockRequestFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockRequestFilters.ToStoreMasterId:
                        where['ToStoreMasterId'] = param.Value;
                        break;
                    case StockRequestFilters.TransferNumber:
                        where['TransferNumber'] = param.Value;
                        break;
                    case StockRequestFilters.ApprovedUser:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case StockRequestFilters.CreatedUser:
                        where['CreatedBy'] = param.Value;
                        break;
                    case StockRequestFilters.From:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockRequestFilters.To:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockRequestFilters.FromFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockRequestFilters.ToFacility:
                        where['ToFacilityId'] = param.Value;
                        break;
                    case StockRequestFilters.StockPriorityId:
                        where['StockPriorityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStockRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintStockRequest(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockRequests(apiReq);
        let StockRequests = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestDetailFilters.StockRequestId, Value: StockRequests.Id }]
        };
        let StockRequestDetailBo = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
        let StockRequestDetailData = await StockRequestDetailBo.GetStockRequestDetails(Req);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockRequests.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockRequests.FacilityId, StockRequests.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.printheader = printStoreData.printheader;
        if (printStoreData && printStoreData.printfooter)
            printPreferencesData.printfooter = printStoreData.printfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockRequest: StockRequests,
            StockRequestDetail: StockRequestDetailData.Data,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'stockrequest';
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

    public async PrintStockReqBeforeTransfer(req: BaseRequest): Promise<FileInfo> {
        let StockbachDetails: any = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockRequests(apiReq);
        let StockRequests = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestDetailFilters.StockRequestId, Value: StockRequests.Id },
            { Key: StockRequestDetailFilters.ToStoreMasterId, Value: req.Data.storemasterid }]
        };
        let StockRequestDetailBo = BoFactory.GetBo(bo.StockRequestDetailBo, this.Request);
        let StockRequestDetailData = await StockRequestDetailBo.GetStockRequestDetails(Req);
        if (StockRequestDetailData.Data.length > 0) {
            let stockreqDetail: any;
            for (let sridx in StockRequestDetailData.Data) {
                let ReqQty = 0;
                let reqStockItemId = 0;
                let sritem: any = StockRequestDetailData.Data[sridx];
                // let custom_multi_sort = function (a: any, b: any) {
                //     var aExpiryDate = a.ExpiryDate;
                //     var bExpiryDate = b.ExpiryDate;
                //     var aQuantity = a.Quantity;
                //     var bQuantity = b.Quantity;

                //     if (aExpiryDate === bExpiryDate) {
                //         return (aQuantity < bQuantity) ? -1 : (aQuantity > bQuantity) ? 1 : 0;
                //     } else {
                //         return (aExpiryDate < bExpiryDate) ? -1 : 1;
                //     }
                // };


                let custom_multi_sort = function (a: any, b: any) {
                    var aItemName = a.ItemName;
                    var bItemName = b.ItemName;
                    if (aItemName !== bItemName) {
                        return (aItemName < bItemName) ? -1 : 1;
                    }
                    var aExpiryDate = a.ExpiryDate;
                    var bExpiryDate = b.ExpiryDate;

                    if (aExpiryDate !== bExpiryDate) {
                        return (aExpiryDate < bExpiryDate) ? -1 : 1;
                    }

                    var aQuantity = a.Quantity;
                    var bQuantity = b.Quantity;

                    if (aQuantity !== bQuantity) {
                        return (aQuantity < bQuantity) ? -1 : 1;
                    }

                    return 0;
                };

                // let custom_multi_sort = function (a: any, b: any) {
                //     var aItemName = a.ItemName;
                //     var bItemName = b.ItemName;

                //     if (aItemName !== bItemName) {
                //         return (aItemName < bItemName) ? -1 : 1;
                //     }
                //     return 0;
                // };
                // names.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

                if (sritem.ItemMasterId > 0) {
                    ReqQty = sritem.RequestedQuantity;
                    sritem.BalanceRequestedQuantity = ReqQty;
                    if (sritem.ItemMaster.StockItem !== null) {
                        let stockserialitems = null;
                        if (sritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                            stockserialitems = sritem.ItemMaster.StockItem.StockSerialItems;
                            stockserialitems.sort(custom_multi_sort);
                            // stockserialitems.sort((a: any, b: any) => a.ItemName.toLowerCase().localeCompare(b.ItemName.toLowerCase()));

                            for (let batid = 0; batid < stockserialitems.length; batid++) {
                                sritem.TotalAvailableQuantity = sritem.ItemMaster.StockItem.Quantity;
                                sritem.StockItemRev = sritem.ItemMaster.StockItem.Rev;
                                if (sritem.ItemMaster.ReqStoreStock) {
                                    reqStockItemId = sritem.ItemMaster.ReqStoreStock.Id;
                                }
                                if (ReqQty > 0) {
                                    if (sritem.TransferedQuantity > 0) {
                                        ReqQty = ReqQty - sritem.TransferedQuantity;
                                    } else {
                                        ReqQty = ReqQty;
                                    }
                                    if (stockserialitems[batid].Quantity >= ReqQty) {
                                        stockreqDetail = {
                                            Id: 0,
                                            StockRequestDetailId: sritem.Id,
                                            ItemMasterId: sritem.ItemMasterId,
                                            ItemCode: sritem.ItemCode,
                                            ItemName: sritem.ItemName,
                                            ManufacturerName: sritem.ItemMaster.ManufacturerName,
                                            packqty: sritem.ItemMaster.PurConQty,
                                            TotalAvailableQuantity: sritem.ItemMaster.StockItem.Quantity,
                                            QuantityBeforeTransfer: stockserialitems[batid].Quantity,
                                            BatchQuantity: stockserialitems[batid].Quantity,
                                            RequestedQuantity: sritem.RequestedQuantity,
                                            IssuedQuantity: sritem.TransferedQuantity,
                                            // TransferedQuantity: 0,//for jss hospital vidya change
                                            TransferedQuantity: ReqQty, //for jss hospital vidya change
                                            TransitQuantity: ReqQty - sritem.TransferedQuantity,
                                            BatchId: stockserialitems[batid].BatchId,
                                            ExpiryDate: null,
                                            HaveExpiry: false,
                                            HaveNoExpiry: false,
                                            UomPrice: stockserialitems[batid].UomPrice,
                                            PurchasePrice: stockserialitems[batid].PurchasePrice,
                                            UnitCostPrice: stockserialitems[batid].Ucp,
                                            Ucp: stockserialitems[batid].Ucp,
                                            Mrp: stockserialitems[batid].Mrp,
                                            MrPrice: stockserialitems[batid].Mrp,
                                            DiscountModeId: stockserialitems[batid].DiscountModeId,
                                            Discount: stockserialitems[batid].Discount,
                                            UomDiscountAmount: stockserialitems[batid].UomDiscountAmount,
                                            DiscountAmount: stockserialitems[batid].DiscountAmount,
                                            UomPriceAfterDiscount: stockserialitems[batid].UomPriceAfterDiscount,
                                            PurchasePriceAfterDiscount: stockserialitems[batid].PurchasePriceAfterDiscount,
                                            GrossAmount: ReqQty * stockserialitems[batid].Ucp,
                                            NetAmount: ReqQty * stockserialitems[batid].Ucp,
                                            BarCodeId: stockserialitems[batid].BarCodeId,
                                            StockItemId: stockserialitems[batid].StockItemId,
                                            StockSerialItemId: stockserialitems[batid].Id,
                                            StockSerialItemRev: stockserialitems[batid].Rev,
                                            GstId: stockserialitems[batid].GstId,
                                            GstPercentage: stockserialitems[batid].GstPercentage,
                                            GstAmount: stockserialitems[batid].GstAmount,
                                            UnitGstAmount: stockserialitems[batid].UnitGstAmount,
                                            InGstId: stockserialitems[batid].InGstId,
                                            InGstPercentage: stockserialitems[batid].InGstPercentage,
                                            InGstAmount: stockserialitems[batid].InGstAmount,
                                            UnitInGstAmount: stockserialitems[batid].UnitInGstAmount,
                                            CGstId: stockserialitems[batid].CGstId,
                                            CGstPercentage: stockserialitems[batid].CGstPercentage,
                                            CGstAmount: stockserialitems[batid].CGstAmount,
                                            UnitCGstAmount: stockserialitems[batid].UnitCGstAmount,
                                            SGstId: stockserialitems[batid].SGstId,
                                            SGstPercentage: stockserialitems[batid].SGstPercentage,
                                            SGstAmount: stockserialitems[batid].SGstAmount,
                                            UnitSGstAmount: stockserialitems[batid].UnitSGstAmount,
                                            BaseUomId: stockserialitems[batid].BaseUomId,
                                            PurchaseUomId: stockserialitems[batid].PurchaseUomId,
                                            SaleUomId: stockserialitems[batid].SaleUomId,
                                            ConversionQuantity: stockserialitems[batid].ConversionQuantity,
                                            IsExpiry: stockserialitems[batid].IsExpiry,
                                            IsSuspended: stockserialitems[batid].IsSuspended,
                                            ManufacturerId: stockserialitems[batid].ManufacturerId,
                                            VendorMasterId: stockserialitems[batid].VendorMasterId,
                                            GrnDetailId: stockserialitems[batid].GrnDetailId,
                                            GrnId: stockserialitems[batid].GrnId,
                                            StockEntryDetailId: stockserialitems[batid].StockEntryDetailId,
                                            StockEntryId: stockserialitems[batid].StockEntryId,
                                            FacilityId: stockserialitems[batid].FacilityId,
                                            OrgId: stockserialitems[batid].OrgId,
                                            RequestedStoreStockItemId: reqStockItemId,
                                            Status: 1
                                        };

                                        if (stockserialitems[batid].ExpiryDate === null) {
                                            stockreqDetail.ExpiryDate = '';
                                            stockreqDetail.HaveNoExpiry = true;
                                        } else {
                                            stockreqDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                            stockreqDetail.HaveExpiry = true;
                                        }

                                        stockreqDetail.BalanceRequestedQuantity = ReqQty;
                                        StockbachDetails.push(stockreqDetail);
                                        ReqQty = 0;
                                    } else if (stockserialitems[batid].Quantity < ReqQty) {
                                        stockreqDetail = {
                                            Id: 0,
                                            StockRequestDetailId: sritem.Id,
                                            ItemMasterId: sritem.ItemMasterId,
                                            ItemCode: sritem.ItemCode,
                                            ItemName: sritem.ItemName,
                                            ManufacturerName: sritem.ItemMaster.ManufacturerName,
                                            packqty: sritem.ItemMaster.PurConQty,
                                            TotalAvailableQuantity: sritem.ItemMaster.StockItem.Quantity,
                                            QuantityBeforeTransfer: stockserialitems[batid].Quantity,
                                            BatchQuantity: stockserialitems[batid].Quantity,
                                            RequestedQuantity: sritem.RequestedQuantity,
                                            IssuedQuantity: sritem.TransferedQuantity,
                                            TransferedQuantity: stockserialitems[batid].Quantity,
                                            TransitQuantity: stockserialitems[batid].Quantity,
                                            BatchId: stockserialitems[batid].BatchId,
                                            ExpiryDate: null,
                                            HaveExpiry: false,
                                            HaveNoExpiry: false,
                                            UomPrice: stockserialitems[batid].UomPrice,
                                            PurchasePrice: stockserialitems[batid].PurchasePrice,
                                            UnitCostPrice: stockserialitems[batid].Ucp,
                                            MrPrice: stockserialitems[batid].Mrp,
                                            Ucp: stockserialitems[batid].Ucp,
                                            Mrp: stockserialitems[batid].Mrp,
                                            DiscountModeId: stockserialitems[batid].DiscountModeId,
                                            Discount: stockserialitems[batid].Discount,
                                            UomDiscountAmount: stockserialitems[batid].UomDiscountAmount,
                                            DiscountAmount: stockserialitems[batid].DiscountAmount,
                                            UomPriceAfterDiscount: stockserialitems[batid].UomPriceAfterDiscount,
                                            PurchasePriceAfterDiscount: stockserialitems[batid].PurchasePriceAfterDiscount,
                                            GrossAmount: stockserialitems[batid].Quantity * stockserialitems[batid].Ucp,
                                            NetAmount: stockserialitems[batid].Quantity * stockserialitems[batid].Ucp,
                                            BarCodeId: stockserialitems[batid].BarCodeId,
                                            StockItemId: stockserialitems[batid].StockItemId,
                                            StockSerialItemId: stockserialitems[batid].Id,
                                            StockSerialItemRev: stockserialitems[batid].Rev,
                                            GstId: stockserialitems[batid].GstId,
                                            GstPercentage: stockserialitems[batid].GstPercentage,
                                            GstAmount: stockserialitems[batid].GstAmount,
                                            UnitGstAmount: stockserialitems[batid].UnitGstAmount,
                                            InGstId: stockserialitems[batid].InGstId,
                                            InGstPercentage: stockserialitems[batid].InGstPercentage,
                                            InGstAmount: stockserialitems[batid].InGstAmount,
                                            UnitInGstAmount: stockserialitems[batid].UnitInGstAmount,
                                            CGstId: stockserialitems[batid].CGstId,
                                            CGstPercentage: stockserialitems[batid].CGstPercentage,
                                            CGstAmount: stockserialitems[batid].CGstAmount,
                                            UnitCGstAmount: stockserialitems[batid].UnitCGstAmount,
                                            SGstId: stockserialitems[batid].SGstId,
                                            SGstPercentage: stockserialitems[batid].SGstPercentage,
                                            SGstAmount: stockserialitems[batid].SGstAmount,
                                            UnitSGstAmount: stockserialitems[batid].UnitSGstAmount,
                                            BaseUomId: stockserialitems[batid].BaseUomId,
                                            PurchaseUomId: stockserialitems[batid].PurchaseUomId,
                                            SaleUomId: stockserialitems[batid].SaleUomId,
                                            ConversionQuantity: stockserialitems[batid].ConversionQuantity,
                                            IsExpiry: stockserialitems[batid].IsExpiry,
                                            IsSuspended: stockserialitems[batid].IsSuspended,
                                            ManufacturerId: stockserialitems[batid].ManufacturerId,
                                            VendorMasterId: stockserialitems[batid].VendorMasterId,
                                            GrnDetailId: stockserialitems[batid].GrnDetailId,
                                            GrnId: stockserialitems[batid].GrnId,
                                            StockEntryDetailId: stockserialitems[batid].StockEntryDetailId,
                                            StockEntryId: stockserialitems[batid].StockEntryId,
                                            FacilityId: stockserialitems[batid].FacilityId,
                                            OrgId: stockserialitems[batid].OrgId,
                                            RequestedStoreStockItemId: reqStockItemId,
                                            Status: 1
                                        };

                                        if (stockserialitems[batid].ExpiryDate === null) {
                                            stockreqDetail.ExpiryDate = '';
                                            stockreqDetail.HaveNoExpiry = true;
                                        } else {
                                            stockreqDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                            stockreqDetail.HaveExpiry = true;
                                        }

                                        stockreqDetail.BalanceRequestedQuantity = ReqQty;
                                        StockbachDetails.push(stockreqDetail);
                                        ReqQty = ReqQty - stockserialitems[batid].Quantity;
                                    }
                                }
                            }
                        } else {
                            stockreqDetail = {
                                Id: 0,
                                StockRequestDetailId: sritem.Id,
                                ItemMasterId: sritem.ItemMasterId,
                                ItemCode: sritem.ItemCode,
                                ItemName: sritem.ItemName,
                                ManufacturerName: sritem.ItemMaster.ManufacturerName,
                                packqty: sritem.ItemMaster.PurConQty,
                                TotalAvailableQuantity: sritem.ItemMaster.StockItem.Quantity,
                                StockItemRev: sritem.ItemMaster.StockItem.Rev,
                                QuantityBeforeTransfer: 0,
                                BatchQuantity: 0,
                                RequestedQuantity: sritem.RequestedQuantity,
                                IssuedQuantity: sritem.TransferedQuantity,
                                TransferedQuantity: 0,
                                TransitQuantity: 0,
                                BatchId: '',
                                ExpiryDate: null,
                                HaveExpiry: false,
                                HaveNoExpiry: false,
                                UomPrice: 0,
                                PurchasePrice: 0,
                                UnitCostPrice: 0,
                                Ucp: 0,
                                Mrp: 0,
                                MrPrice: 0,
                                DiscountModeId: 2,
                                Discount: 0,
                                UomDiscountAmount: 0,
                                DiscountAmount: 0,
                                UomPriceAfterDiscount: 0,
                                PurchasePriceAfterDiscount: 0,
                                GrossAmount: 0,
                                NetAmount: 0,
                                BarCodeId: '',
                                StockItemId: 0,
                                StockSerialItemId: 0,
                                GstId: 0,
                                GstPercentage: 0,
                                GstAmount: 0,
                                UnitGstAmount: 0,
                                InGstId: 0,
                                InGstPercentage: 0,
                                InGstAmount: 0,
                                UnitInGstAmount: 0,
                                CGstId: 0,
                                CGstPercentage: 0,
                                CGstAmount: 0,
                                UnitCGstAmount: 0,
                                SGstId: 0,
                                SGstPercentage: 0,
                                SGstAmount: 0,
                                UnitSGstAmount: 0,
                                BaseUomId: 0,
                                PurchaseUomId: 0,
                                SaleUomId: 0,
                                ConversionQuantity: 0,
                                IsExpiry: false,
                                IsSuspended: false,
                                ManufacturerId: 0,
                                VendorMasterId: 0,
                                GrnDetailId: 0,
                                GrnId: 0,
                                StockEntryDetailId: 0,
                                StockEntryId: 0,
                                FacilityId: 0,
                                OrgId: 0,
                                Status: 1,
                                RequestedStoreStockItemId: reqStockItemId,
                            };

                            StockbachDetails.push(stockreqDetail);
                        }
                    }
                }
            }
        }

        StockbachDetails.sort((a: any, b: any) => a.ItemName.toLowerCase().localeCompare(b.ItemName.toLowerCase()));
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockRequests.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockRequests.FacilityId, StockRequests.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.printheader = printStoreData.printheader;
        if (printStoreData && printStoreData.printfooter)
            printPreferencesData.printfooter = printStoreData.printfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockRequest: StockRequests,
            StockRequestDetail: StockbachDetails,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'stockbeforetransfer';
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

    public async PrintStockIndentReport(apiReq?: ApiRequest<StockRequestFilters>): Promise<any> {
        let data = await this.GetStockRequests(apiReq);
        let Stockindent = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let Status = apiReq.Data.Status;
        let StockindentData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockindentData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockindentData.FacilityId, StockindentData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Stockindent: Stockindent,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            Status: Status
        };
        let pdfOption: any = null;
        let key = 'stockindentreport';
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

    public async IsAlreadyExist(req: any): Promise<number> {
        let encounterDate = new Date();
        let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 30);
        let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockRequestFilters.StockRequestTypeId, Value: req.Data.Header.StockRequestTypeId },
            { Key: StockRequestFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
            { Key: StockRequestFilters.From, Value: frmDate },
            { Key: StockRequestFilters.To, Value: todate },
            { Key: StockRequestFilters.ToStoreMasterId, Value: req.Data.Header.ToStoreMasterId },
            { Key: StockRequestFilters.FacilityId, Value: req.Data.Header.FacilityId },
            ]
        };
        let data = await this.GetStockRequests(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    public GetModel(): SStatic.Model<StockRequestInstance, StockRequestAttributes> {
        return this.Models.StockRequest;
    }

    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let stockrequestCount = await this.Items.count({
            where: {
                'Status': 1,
                'RequestStatusId': { '$in': [2, 3] },
            }
        });
        let followupCount = await this.Items.count({
            where: {
                'Status': 1,
                'RequestStatusId': { '$in': [4, 5] },
            }
        });
        return {
            'stockrequestCount': stockrequestCount,
            'FollowupCount': followupCount
        };
    }

    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let stockrequestCount = await this.Items.count({
            where: {
                'Status': 1,
                'RequestStatusId': { '$in': [2, 3] },
            }
        });
        return {
            'stockrequestcount': stockrequestCount,
        };
    }
}
