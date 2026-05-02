import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemStoreFilters, StockItemFilters } from '../Common/Filters.e';
import { ItemStoreMapInstance, ItemStoreMapAttributes } from '../Model/Interface/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as bo from '../../Pharmacy/Business/Index';
//import * as generalMasterBO from '../../GeneralMaster/Business/Index';

export class ItemStoreMapBo extends BaseBo<ItemStoreMapInstance, ItemStoreMapAttributes> {
    public async AddItemStoreMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemStoreMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);

        let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
        let StockItemApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [
                { Key: StockItemFilters.ItemMasterId, Value: req.Data.ItemMasterId },
                { Key: StockItemFilters.StoreMasterId, Value: req.Data.StoreMasterId }
            ]
        };
        let StockItem = null;
        if (req.Data.ItemMasterId > 0) {
            StockItem = await SIBo.GetStockItems(StockItemApiReq);
            if (StockItem.Data.length > 0) {
                let existingstockitem = await SIBo.GetStockItemById({ Id: StockItem.Data[0].Id });
                existingstockitem.MinQuantity = req.Data.MinQty;
                existingstockitem.MaxQuantity = req.Data.MaxQty;
                existingstockitem.ReOrderQuantity = req.Data.ROLQty;
                await SIBo.Update(existingstockitem);
            }
        }

        return result;
    }

    public async ManageItemStoreMaps(MasterItem: any, details: ItemStoreMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (MasterItem.IsActive === true) {
                    detail.Status = 1;
                    detail.ItemCode = MasterItem.ItemCode;
                    detail.ItemName = MasterItem.ItemName;
                    detail.CategoryId = MasterItem.CategoryId;
                    detail.SubCategoryId = MasterItem.SubCategoryId;
                    detail.ProductTypeId = MasterItem.ProductTypeId;
                    detail.SubProductTypeId = MasterItem.SubProductTypeId;
                    detail.IsBillable = MasterItem.IsBillable;
                } else {
                    detail.Status = 2;
                    detail.ItemCode = MasterItem.ItemCode;
                    detail.ItemName = MasterItem.ItemName;
                    detail.CategoryId = MasterItem.CategoryId;
                    detail.SubCategoryId = MasterItem.SubCategoryId;
                    detail.ProductTypeId = MasterItem.ProductTypeId;
                    detail.SubProductTypeId = MasterItem.SubProductTypeId;
                    detail.IsBillable = MasterItem.IsBillable;
                }
                if (detail.Id === 0) {
                    //await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageStoreItemMaps(MasterStore: any, details: ItemStoreMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (MasterStore.IsActive === true) {
                    detail.Status = 1;
                    detail.StoreCode = MasterStore.StoreCode;
                    detail.StoreName = MasterStore.StoreName;
                } else {
                    detail.Status = 2;
                    detail.StoreCode = MasterStore.StoreCode;
                    detail.StoreName = MasterStore.StoreName;
                }
                if (detail.Id === 0) {
                    //await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageItemStoreMapsAfterGrn(StoreMasterId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        for (var gi = 0; gi < details.length; gi++) {
            await this.ManageItemStoreMapAfterGrn(StoreMasterId, details[gi]);
        }
    }

    public async ManageItemStoreMapAfterGrn(StoreMasterId: number, itemInfo: any): Promise<void> {
        let ExistingStoreItem = await this.GetStoreItemByFilter({
            Id: 0,
            Data: {
                StoreMasterId: StoreMasterId,
                ItemMasterId: itemInfo.ItemMasterId
            }
        });
        if (ExistingStoreItem !== null) {
            ExistingStoreItem.ItemCode = itemInfo.ItemCode;
            ExistingStoreItem.ItemName = itemInfo.ItemName;
            ExistingStoreItem.CategoryId = itemInfo.MasterItem.CategoryId;
            ExistingStoreItem.SubCategoryId = itemInfo.MasterItem.SubCategoryId;
            ExistingStoreItem.ProductTypeId = itemInfo.MasterItem.ProductTypeId;
            ExistingStoreItem.SubProductTypeId = itemInfo.MasterItem.SubProductTypeId;
            await this.Update(ExistingStoreItem);
        } else {
            let storeitem = {};
            storeitem = {
                ItemMasterId: itemInfo.ItemMasterId,
                StoreMasterId: StoreMasterId,
                FacilityId: 1,
                RackId: 0,
                CategoryId: itemInfo.MasterItem.CategoryId,
                SubCategoryId: itemInfo.MasterItem.SubCategoryId,
                ProductTypeId: itemInfo.MasterItem.ProductTypeId,
                SubProductTypeId: itemInfo.MasterItem.SubProductTypeId,
                ItemCode: itemInfo.ItemCode,
                ItemName: itemInfo.ItemName,
                IsBillable: itemInfo.MasterItem.IsBillable,
                Status: 1
            };
            await this.Save(storeitem as any);
        }
    }

    public async GetStoreItemByFilter(req: BaseRequest): Promise<any> {
        let storeitem = null;
        let filterInfo = req.Data;
        let storeitemInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                ItemMasterId: filterInfo.ItemMasterId
            }
        });
        if (storeitemInstance) {
            storeitem = this.GetAttribute(storeitemInstance);
        }
        return storeitem;
    }

    public async GetItemStoreMapById(req: BaseRequest): Promise<ItemStoreMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemStoreMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let tostoremasterId = -1;
        let GenericWhere: WhereOptions<any> = {};
        let isReqToStoreQtySearch: boolean = false;
        let isReqGenericSearch: boolean = false;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.IsActive:
                        ItemMasterWhere['IsActive'] = param.Value;
                        break;
                    case ItemStoreFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemStoreFilters.ItemFacilityMapId:
                        where['ItemFacilityMapId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.Qty:
                        isReqToStoreQtySearch = true;
                        break;
                    case ItemStoreFilters.GenericName:
                        (GenericWhere as any)[Op.or] = [{ GenericName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Code: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqGenericSearch = true;
                        break;
                    case ItemStoreFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        where['ItemName'] = { '$like': (param.Value) + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                { model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                { model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster,
                    required: isReqGenericSearch,
                    where: GenericWhere,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.UomMaster, as: 'BaseUom', required: false },
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                { model: this.Models.UomMaster, as: 'SaleUom', required: false },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                this.GetReference('ScheduleType'),
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.ItemVendorMap,
                    required: false,
                    attributes: ['MinQty', 'MaxQty', 'FreeQty', 'Price', 'MrPrice', 'DiscountModeId',
                        'DiscountModeCode', 'Discount', 'GstId', 'GstCode', 'GstName', 'GstPercentage'],
                    where: { 'RankId': 1 }
                },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': tostoremasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            /*
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            */
                            // where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    as: 'ToStoreStock',
                    required: isReqToStoreQtySearch,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: isReqToStoreQtySearch,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStoreItemsForOpeningStockEntry(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let ItemMasterWhere: WhereOptions<any> = {};
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        where['ItemName'] = { '$like': (param.Value) + '%' };
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                { model: this.Models.UomMaster, required: false, attributes: ['UomCode', 'UomName'] },
                // { model: this.Models.UomMaster, as: 'UomMaster', required: false },
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false,
                    attributes: ['UomCode', 'UomName']
                 },
                { model: this.Models.UomMaster, as: 'SaleUom',
                    attributes: ['UomCode', 'UomName'], required: false },
                { model: this.Models.UomConversion, required: false },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StockItemId', 'ItemMasterId', 'StoreMasterId', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId }
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityCode', 'FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], required: false });
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
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
                { model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                { model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                { model: this.Models.ProductSubType, required: false, attributes: ['SubProductTypeCode', 'SubProductTypeName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStoreItemMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let tostoremasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemStoreFilters.ItemFacilityMapId:
                        where['ItemFacilityMapId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    as: 'ToStoreStock',
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': tostoremasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStoreReorderItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsOpenReOrder: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityCode', 'FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], required: false });
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.IsOpenReOrder:
                        IsOpenReOrder = param.Value;
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
                { model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                { model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                { model: this.Models.ProductSubType, required: false, attributes: ['SubProductTypeCode', 'SubProductTypeName'] },
                { model: this.Models.GstMaster, as: 'GstMaster', required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                {
                    model: this.Models.ItemVendorMap,
                    required: false,
                    where: { 'RankId': 1 },
                    include: [
                        { model: this.Models.GstMaster, as: 'GstMaster', required: false },
                        { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                        { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                        { model: this.Models.GstMaster, as: 'SGstMaster', required: false }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.PurchaseOrderDetail,
                    required: false,
                    attributes: ['Id', 'ItemMasterId', 'PoQuantity', 'ReceivedQuantity'
                        //[this.Dal.fn('SUM', this.Dal.col('PoQuantity')), 'PoQuantity'],
                        //[this.Dal.fn('SUM', this.Dal.col('ReceivedQuantity')), 'ReceivedQuantity']
                    ],
                    where: {
                        'StoreMasterId': storemasterId
                    }
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetItemsForStockTransfer(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let tostoremasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        ItemMasterWhere['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        where['ItemName'] = { '$like': (param.Value) + '%' };
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.UomMaster,
                    attributes: ['Id', 'UomCode', 'UomName'],
                    as: 'PurchaseUom', required: false
                },
                {
                    model: this.Models.UomMaster,
                    attributes: ['Id', 'UomCode', 'UomName'],
                    as: 'SaleUom', required: false
                },
                // {
                //     model: this.Models.UomConversion, required: false,
                //     include: [{
                //         model: this.Models.UomMaster, attributes: ['UomId', 'UomCode',
                //             'UomName', 'UomDescription'], as: 'UomMaster', required: false
                //     }]
                // },
                // {
                //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                //         'IsAllFacility'],
                //     required: false
                // },
                // {
                //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                //         'IsAllFacility'],
                //     as: 'CGstMaster', required: false
                // },
                // {
                //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                //         'IsAllFacility'],
                //     as: 'SGstMaster', required: false
                // },
                // {
                //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                //         'IsAllFacility'],
                //     as: 'InGstMaster', required: false
                // },
                // {
                //     model: this.Models.ItemFacilityMap,
                //     attributes: ['Id', 'ItemCode', 'ItemName',
                //         'ItemMasterId', 'FacilityId'
                //     ],
                //     required: false
                // },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                //this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            // where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    as: 'ToStoreStock',
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': tostoremasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetInventoryItemsforGRN(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        // let tostoremasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or](where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        ItemMasterWhere['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        where['ItemName'] = { '$like': (param.Value) + '%' };
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    // case ItemStoreFilters.ToStoreMasterId:
                    //     tostoremasterId = param.Value;
                    //     break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.excelCode:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ItemCode'] = { '$in': paramArr };
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
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.UomMaster,
                    attributes: ['Id', 'UomCode', 'UomName'],
                    as: 'PurchaseUom', required: false
                },
                {
                    model: this.Models.UomMaster,
                    attributes: ['Id', 'UomCode', 'UomName'],
                    as: 'SaleUom', required: false
                },
                {
                    model: this.Models.UomConversion, required: false,
                    include: [{
                        model: this.Models.UomMaster, attributes: ['UomId', 'UomCode',
                            'UomName', 'UomDescription'], as: 'UomMaster', required: false
                    }]
                },
                {
                    model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                        'IsAllFacility'],
                    required: false
                },
                {
                    model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                        'IsAllFacility'],
                    as: 'CGstMaster', required: false
                },
                {
                    model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                        'IsAllFacility'],
                    as: 'SGstMaster', required: false
                },
                {
                    model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                        'IsAllFacility'],
                    as: 'InGstMaster', required: false
                },
                {
                    model: this.Models.ItemFacilityMap,
                    attributes: ['Id', 'ItemCode', 'ItemName',
                        'ItemMasterId', 'FacilityId'
                    ],
                    required: false
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                //this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    // include: [
                    //     {
                    //         model: this.Models.StockSerialItem,
                    //         required: false,
                    //         attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                    //             'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                    //             'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                    //         where: { 'Quantity': { $gt: 0 } }
                    //     }
                    // ]
                },
                // {
                //     model: this.Models.StockItem,
                //     as: 'ToStoreStock',
                //     required: false,
                //     attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                //     where: { 'StoreMasterId': tostoremasterId },
                //     include: [
                //         {
                //             model: this.Models.StockSerialItem,
                //             required: false,
                //             attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                //                 'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                //                 'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                //             where: { 'Quantity': { $gt: 0 } }
                //         }
                //     ]
                // }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetInventoryStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let tostoremasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                //this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                {
                    model: this.Models.StockItem,
                    as: 'ToStoreStock',
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': tostoremasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetInventoryAdjustItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let tostoremasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ToStoreMasterId:
                        tostoremasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        ItemMasterWhere['ActiveStatusId'] = param.Value;
                        break;
                    case ItemStoreFilters.Status:
                        where['Status'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            where: ItemMasterWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                //this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            // where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                },
                // {
                //     model: this.Models.StockItem,
                //     as: 'ToStoreStock',
                //     required: false,
                //     attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                //     where: { 'StoreMasterId': tostoremasterId },
                //     include: [
                //         {
                //             model: this.Models.StockSerialItem,
                //             required: false,
                //             attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                //                 'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                //                 'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                //             // where: { 'Quantity': { $gt: 0 } }
                //         }
                //     ]
                // }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPharmacyStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let itemWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let storemasterId = -1;
        let guarantorsearchid = -1;
        let currentdate = null;
        let GenericWhere: WhereOptions<any> = {};
        let isReqGenericSearch: boolean = false;
        /*
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        */
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.CurrentDate:
                        currentdate = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemStoreFilters.IsConsignment:
                        itemWhere['IsConsignment'] = param.Value;
                        // isReqItemSearch = true;
                        break;
                    case ItemStoreFilters.Guarantor:
                        guarantorsearchid = param.Value;
                        /*
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ItemMasterId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        */
                        break;
                    case ItemStoreFilters.GenericName:
                        (GenericWhere as any)[Op.or] = [{ GenericName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Code: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqGenericSearch = true;
                        break;
                    case ItemStoreFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        where['ItemName'] = { '$like': (param.Value) + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            where: itemWhere,
            required: true,
            include: [
                //{ model: this.Models.DrugMaster, required: false },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: isReqGenericSearch, where: GenericWhere,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.GuarantorSupplementary,
                    required: false,
                    attributes: ['Id', 'ItemMasterId'],
                    where: { 'GuarantorId': guarantorsearchid },
                    as: 'Supplementary'
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    /*
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    */
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            /*
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            */
                            where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                        }
                    ]
                }
            ]
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetAllPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let itemWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let storemasterId: any = [];
        let guarantorsearchid = -1;
        let currentdate = null;
        let GenericWhere: WhereOptions<any> = {};
        let isReqGenericSearch: boolean = false;
        let isReqItemSearch: boolean = false;

        /*
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        */
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:

                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        // where['StoreMasterId'] = { '$in': paramArr };

                        storemasterId = paramArr;
                        // where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.CurrentDate:
                        currentdate = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemStoreFilters.IsConsignment:
                        itemWhere['IsConsignment'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case ItemStoreFilters.Guarantor:
                        guarantorsearchid = param.Value;
                        /*
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ItemMasterId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        */
                        break;
                    case ItemStoreFilters.GenericName:
                        (GenericWhere as any)[Op.or] = [{ GenericName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Code: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqGenericSearch = true;
                        break;
                    case ItemStoreFilters.ExactSearch:
                        (where as any)[Op.or] = [
                            { ItemName: { [Op.like]: (param.Value) + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: isReqItemSearch,
            where: itemWhere,
            include: [
                //{ model: this.Models.DrugMaster, required: false },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: isReqGenericSearch, where: GenericWhere,
                    attributes: ['Id', 'Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.GuarantorSupplementary,
                    required: false,
                    attributes: ['Id', 'ItemMasterId'],
                    where: { 'GuarantorId': guarantorsearchid },
                    as: 'Supplementary'
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: true,
                    /*
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    */

                    // where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: true,
                            include: [
                                {
                                    model: this.Models.VendorMaster,
                                    attributes: ['VendorMasterId', 'VendorName'],
                                    required: false
                                },
                                {
                                    model: this.Models.Grn,
                                    attributes: ['DcDate', 'DcNumber'],
                                    required: false
                                },
                            ],
                            /*
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            */
                            where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                        }
                    ]
                }
            ]
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let itemWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let storemasterId = -1;
        let guarantorsearchid = -1;
        let currentdate = null;
        let GenericWhere: WhereOptions<any> = {};
        let isReqGenericSearch: boolean = false;
        let isReqItemSearch: boolean = false;
        /*
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        */
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.CurrentDate:
                        currentdate = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemStoreFilters.IsConsignment:
                        itemWhere['IsConsignment'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case ItemStoreFilters.Guarantor:
                        guarantorsearchid = param.Value;
                        /*
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ItemMasterId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        */
                        break;
                    case ItemStoreFilters.GenericName:
                        (GenericWhere as any)[Op.or] = [{ GenericName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Code: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqGenericSearch = true;
                        break;
                    case ItemStoreFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        include.push({
            model: this.Models.ItemMaster,
            required: isReqItemSearch,
            where: itemWhere,
            include: [
                //{ model: this.Models.DrugMaster, required: false },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                //{ model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                //{ model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                {
                    model: this.Models.GenericMaster, required: isReqGenericSearch, where: GenericWhere,
                    attributes: ['Id', 'Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.GuarantorSupplementary,
                    required: false,
                    attributes: ['Id', 'ItemMasterId'],
                    where: { 'GuarantorId': guarantorsearchid },
                    as: 'Supplementary'
                },
                //{ model: this.Models.UomMaster, required: false },
                //{ model: this.Models.GstMaster, required: false },
                //{ model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                //{ model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                this.GetReference('ScheduleType'),
                //{ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: true,
                    /*
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    */
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: true,
                            include: [
                                {
                                    model: this.Models.VendorMaster,
                                    attributes: ['VendorMasterId', 'VendorName'],
                                    required: false
                                },
                                {
                                    model: this.Models.Grn,
                                    attributes: ['DcDate', 'DcNumber'],
                                    required: false
                                },
                            ],
                            /*
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                            */
                            where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                        }
                    ]
                }
            ]
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPharmacyStoreItemsForDirectReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let currentdate = null;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        where['Status'] = param.Value;
                        break;
                    case ItemStoreFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemStoreFilters.CurrentDate:
                        currentdate = param.Value;
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
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gte: 0 }, 'ExpiryDate': { $gt: currentdate } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPharmacyStoreItemForVendorReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let vendormasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemStoreFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemStoreFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = storemasterId;
                        break;
                    case ItemStoreFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemStoreFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemStoreFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemStoreFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemStoreFilters.VendorMasterId:
                        vendormasterId = param.Value;
                        break;
                    case ItemStoreFilters.ActiveStatus:
                        where['Status'] = param.Value;
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
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                {
                    model: this.Models.GenericMaster, required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage',
                                'ManufacturerId', 'VendorMasterId', 'GrnId', 'GrnDetailId', 'PurchasePrice'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteItemStoreMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemStoreMapInstance, ItemStoreMapAttributes> {
        return this.Models.ItemStoreMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemMasterId', 'ItemCode', ['ItemName', 'Text'], 'ItemName',
            'StoreMasterId', 'StoreCode', 'StoreName', 'Rev'];
        let val = await this.GetItemStoreMaps(apiReq);
        return { [key]: val.Data };
    }
    public async PrintRackDetailsbyStore(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        let data = await this.GetStoreItems(apiReq);
        let RackStoreItem = data.Data;
        let ProductName = apiReq.Data.ProductName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let RackStoreItemData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(RackStoreItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(RackStoreItemData.FacilityId, RackStoreItemData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            RackStoreItem: RackStoreItem,
            Preferences: printPreferencesData,
            ProductName: ProductName,
            StoreName: StoreName,
            ItemName: ItemName
        };
        let pdfOption: any = null;
        let key = 'rackdetailsbystorereport';
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
    public async PrintItemROLSetupReport(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        let data = await this.GetStoreItems(apiReq);
        let RackStoreItem = data.Data;
        let ProductName = apiReq.Data.ProductName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let RackStoreItemData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(RackStoreItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(RackStoreItemData.FacilityId, RackStoreItemData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            RackStoreItem: RackStoreItem,
            Preferences: printPreferencesData,
            ProductName: ProductName,
            StoreName: StoreName,
            ItemName: ItemName
        };
        let pdfOption: any = null;
        let key = 'itemrolsetupreport';
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
    public async PrintItemReorderList(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        let data = await this.GetStoreItems(apiReq);
        let RackStoreItem = data.Data;
        let ProductName = apiReq.Data.ProductName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let RackStoreItemData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(RackStoreItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(RackStoreItemData.FacilityId, RackStoreItemData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            RackStoreItem: RackStoreItem,
            Preferences: printPreferencesData,
            ProductName: ProductName,
            StoreName: StoreName,
            ItemName: ItemName
        };
        let pdfOption: any = null;
        let key = 'itemreorderlistreport';
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
}

