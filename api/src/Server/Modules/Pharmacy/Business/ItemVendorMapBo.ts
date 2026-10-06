import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemVendorFilters } from '../Common/Filters.e';
import { ItemVendorMapInstance, ItemVendorMapAttributes } from '../Model/Interface/Index';
import { UomConversionAttributes } from '../Model/Interface/Index';

export class ItemVendorMapBo extends BaseBo<ItemVendorMapInstance, ItemVendorMapAttributes> {
    public async AddItemVendorMap(req: BaseRequest): Promise<number> {
        let vendoritemduplicate = await this.FindAll({
            where: {
                'ItemFacilityMapId': req.Data['ItemFacilityMapId'],
                'FacilityId': req.Data['FacilityId'],
                'VendorMasterId': req.Data['VendorMasterId'],
                'ItemMasterId': req.Data['ItemMasterId']
            }
        });
        if (vendoritemduplicate && vendoritemduplicate.length > 0) {
            throw { code: 'THIS_ITEM_ALREADY_MAPPED' };
        }

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemVendorMap(req: BaseRequest): Promise<boolean> {
        let vendoritemduplicate = await this.FindAll({
            where: {
                'ItemFacilityMapId': req.Data['ItemFacilityMapId'],
                'FacilityId': req.Data['FacilityId'],
                'VendorMasterId': req.Data['VendorMasterId'],
                'ItemMasterId': req.Data['ItemMasterId'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (vendoritemduplicate && vendoritemduplicate.length > 0) {
            throw { code: 'THIS_ITEM_ALREADY_MAPPED' };
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageItemVendorMaps(MasterItem: any, details: ItemVendorMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (MasterItem.IsActive === true) {
                    detail.ItemCode = MasterItem.ItemCode;
                    detail.ItemName = MasterItem.ItemName;
                    detail.CategoryId = MasterItem.CategoryId;
                    detail.ProductTypeId = MasterItem.ProductTypeId;
                    detail.ActiveStatusId = 2;
                } else {
                    detail.ItemCode = MasterItem.ItemCode;
                    detail.ItemName = MasterItem.ItemName;
                    detail.CategoryId = MasterItem.CategoryId;
                    detail.ProductTypeId = MasterItem.ProductTypeId;
                    detail.ActiveStatusId = 3;
                }
                if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageItemVendorMapsAfterGrn(VendorMasterId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        for (var gi = 0; gi < details.length; gi++) {
            await this.ManageItemVendorMapAfterGrn(VendorMasterId, request, details[gi]);
        }
    }

    public async ManageItemVendorMapAfterGrn(VendorMasterId: number, request: any, itemInfo: any): Promise<void> {
        let ExistingVendorItem = await this.GetVendorItemByFilter({
            Id: 0,
            Data: {
                VendorMasterId: VendorMasterId,
                ItemMasterId: itemInfo.ItemMasterId
            }
        });
        if (ExistingVendorItem !== null) {
            ExistingVendorItem.ItemFacilityMapId = itemInfo.ItemFacilityMapId;
            ExistingVendorItem.FacilityId = itemInfo.FacilityId;
            ExistingVendorItem.CategoryId = itemInfo.MasterItem.CategoryId;
            ExistingVendorItem.ItemCode = itemInfo.ItemCode;
            ExistingVendorItem.ItemName = itemInfo.ItemName;
            ExistingVendorItem.PurchaseUomId = itemInfo.PurchaseUomId;
            ExistingVendorItem.ConversionQuantity = itemInfo.ConversionQuantity;
            ExistingVendorItem.SaleUomId = itemInfo.SaleUomId;
            ExistingVendorItem.FreeQty = itemInfo.FreeQty;
            ExistingVendorItem.UomPrice = itemInfo.UomPrice;
            ExistingVendorItem.UomMrPrice = itemInfo.UomMrPrice;
            ExistingVendorItem.Price = itemInfo.PurchasePrice;
            ExistingVendorItem.MrPrice = itemInfo.MrPrice;
            ExistingVendorItem.DiscountModeId = itemInfo.DiscountModeId;
            ExistingVendorItem.Discount = itemInfo.Discount;
            ExistingVendorItem.GstId = itemInfo.GstId;
            ExistingVendorItem.InGstId = 1;
            ExistingVendorItem.CGstId = itemInfo.CGstId;
            ExistingVendorItem.SGstId = itemInfo.SGstId;
            ExistingVendorItem.GstPercentage = itemInfo.GstPercentage;
            ExistingVendorItem.ActiveStatusId = 2;
            ExistingVendorItem.ProductTypeId = itemInfo.MasterItem.ProductTypeId;
            await this.Update(ExistingVendorItem);
        } else {
            let vendoritem = {};
            vendoritem = {
                ItemFacilityMapId: itemInfo.ItemFacilityMapId,
                FacilityId: itemInfo.FacilityId,
                ItemMasterId: itemInfo.ItemMasterId,
                CategoryId: itemInfo.MasterItem.CategoryId,
                VendorMasterId: VendorMasterId,
                ItemCode: itemInfo.ItemCode,
                ItemName: itemInfo.ItemName,
                VendorCode: request.Header.VendorCode,
                VendorName: request.Header.VendorName,
                PurchaseUomId: itemInfo.PurchaseUomId,
                ConversionQuantity: itemInfo.ConversionQuantity,
                SaleUomId: itemInfo.SaleUomId,
                RankId: 1,
                FreeQty: itemInfo.FreeQty,
                UomPrice: itemInfo.UomPrice,
                UomMrPrice: itemInfo.UomMrPrice,
                Price: itemInfo.PurchasePrice,
                MrPrice: itemInfo.MrPrice,
                DiscountModeId: itemInfo.DiscountModeId,
                Discount: itemInfo.Discount,
                GstId: itemInfo.GstId,
                InGstId: 1,
                CGstId: itemInfo.CGstId,
                SGstId: itemInfo.SGstId,
                GstPercentage: itemInfo.GstPercentage,
                ActiveFrom: new Date(),
                IsActive: 1,
                ActiveStatusId: 2,
                ProductTypeId: itemInfo.MasterItem.ProductTypeId,
                Status: 1
            };
            await this.Save(vendoritem as any);
        }
    }

    public async GetVendorItemByFilter(req: BaseRequest): Promise<any> {
        let vendoritem = null;
        let filterInfo = req.Data;
        let vendoritemInstance = await this.Find({
            where: {
                VendorMasterId: filterInfo.VendorMasterId,
                ItemMasterId: filterInfo.ItemMasterId
            }
        });
        if (vendoritemInstance) {
            vendoritem = this.GetAttribute(vendoritemInstance);
        }
        return vendoritem;
    }

    public async ManageItemUomChanges(ItemMasterId: number, detail: UomConversionAttributes): Promise<boolean> {
        let itemvendormaps = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ItemVendorFilters.ItemMasterId, Value: ItemMasterId }]
        };
        let data = await this.GetItemVendorMaps(apiReq);
        itemvendormaps = data.Data || [];
        if (itemvendormaps.length > 0) {
            await this.ManageItemVendorUom(ItemMasterId, detail, itemvendormaps);
        }
        return true;
    }

    public async ManageItemVendorUom(ItemMasterId: number, ItemUom: UomConversionAttributes, details: ItemVendorMapAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PurchaseUomId = ItemUom.UomId;
                detail.PurchaseUomCode = ItemUom.UomCode;
                detail.ConversionQuantity = ItemUom.ConversionQuantity;
                detail.Price = detail.UomPrice / ItemUom.ConversionQuantity;
                detail.MrPrice = detail.UomMrPrice / ItemUom.ConversionQuantity;
                if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetItemVendorMapById(req: BaseRequest): Promise<ItemVendorMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemVendorMaps(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let itemQry: any = {
            model: this.Models.ItemMaster,
            required: true,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                {
                    model: this.Models.GstMaster, required: false, attributes: ['Id', 'GstId',
                        'GstCode', 'GstName', 'GstDescription', 'GstPercentage']
                },
                {
                    model: this.Models.GstMaster, as: 'InGstMaster', required: false, attributes: ['Id', 'GstId',
                        'GstCode', 'GstName', 'GstDescription', 'GstPercentage']
                },
                {
                    model: this.Models.GstMaster, as: 'CGstMaster', required: false, attributes: ['Id', 'GstId',
                        'GstCode', 'GstName', 'GstDescription', 'GstPercentage']
                },
                {
                    model: this.Models.GstMaster, as: 'SGstMaster', required: false, attributes: ['Id', 'GstId',
                        'GstCode', 'GstName', 'GstDescription', 'GstPercentage']
                },
                { model: this.Models.UomMaster, required: false, attributes: ['UomName'] },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                { model: this.Models.ItemFacilityMap, required: false }
            ]
        };
        include.push({ model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] });
        include.push({ model: this.Models.UomMaster, as: 'UomMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.GstMaster, required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push(this.GetReference('DiscountMode'));
        include.push(this.GetReference('Rank'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemVendorFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemVendorFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case ItemVendorFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    // case ItemVendorFilters.Code:
                    //     where['$or'] = [{ 'ItemCode': { '$like': (param.Value || '') + '%' } },
                    //     { 'ItemName': { '$like': (param.Value || '') + '%' } }];
                    //     break;
                    case ItemVendorFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemVendorFilters.StoreMasterId:
                        storemasterId = param.Value;
                        itemQry.include.push({
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': storemasterId }
                        });
                        break;
                    case ItemVendorFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemVendorFilters.Rank:
                        where['RankId'] = param.Value;
                        break;
                    case ItemVendorFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemVendorFilters.ItemFacilityMapId:
                        where['ItemFacilityMapId'] = param.Value;
                        break;
                    case ItemVendorFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemVendorFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemVendorFilters.ItemName:
                        where['ItemName'] = { '$like': '%' + (param.Value || '') };
                        break;
                    case ItemVendorFilters.excelCode:
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
        include.push(itemQry);

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetVendorItemsToReturn(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let vendormasterId = -1;
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemVendorFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemVendorFilters.VendorMasterId:
                        vendormasterId = param.Value;
                        where['VendorMasterId'] = vendormasterId;
                        break;
                    case ItemVendorFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemVendorFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like] : (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemVendorFilters.StoreMasterId:
                        storemasterId = param.Value;
                        break;
                    case ItemVendorFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemVendorFilters.Rank:
                        where['RankId'] = param.Value;
                        break;
                    case ItemVendorFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
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
                { model: this.Models.ItemCategory, required: false, attributes: ['CategoryCode', 'CategoryName'] },
                { model: this.Models.ItemSubCategory, required: false, attributes: ['SubCategoryCode', 'SubCategoryName'] },
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.GstMaster, required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
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
                            where: {
                                '$and': [{ 'StoreMasterId': storemasterId },
                                { 'VendorMasterId': vendormasterId },
                                { 'Quantity': { $gt: 0 } }]
                            }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteItemVendorMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemVendorMapInstance, ItemVendorMapAttributes> {
        return this.Models.ItemVendorMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemVendorFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemMasterId', 'ItemCode', ['ItemName', 'Text'], 'ItemName',
            'VendorMasterId', 'VendorCode', 'VendorName', 'Price', 'DiscountModeId', 'Discount', 'MrPrice', 'FreeQty'];
        let val = await this.GetItemVendorMaps(apiReq);
        return { [key]: val.Data };
    }
}
