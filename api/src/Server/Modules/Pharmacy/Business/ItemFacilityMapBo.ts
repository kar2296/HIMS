import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemFacilityFilters, StockItemFilters, ItemStoreFilters, ItemVendorFilters } from '../Common/Filters.e';
import { ItemFacilityMapInstance, ItemFacilityMapAttributes } from '../Model/Interface/Index';
import * as bo from '../../Pharmacy/Business/Index';

export class ItemFacilityMapBo extends BaseBo<ItemFacilityMapInstance, ItemFacilityMapAttributes> {
    public async AddItemFacilityMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemFacilityMap(req: BaseRequest): Promise<boolean> {
        /*
        let codeduplicate = await this.FindAll({ where: { 'ItemCode': req.Data['ItemCode'], 'Id': { '$ne': req.Data['Id'] } } });
        if (codeduplicate && codeduplicate.length > 0) { throw { code: 'CODEALREADYEXIST' }; }

        let nameduplicate = await this.FindAll({ where: { 'ItemName': req.Data['ItemName'], 'Id': { '$ne': req.Data['Id'] } } });
        if (nameduplicate && nameduplicate.length > 0) { throw { code: 'NAMEALREADYEXIST' }; }

        let file = this.Request.file;
        if (file) { req.Data.ImagePath = file.path; }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') { req.Data[idx] = null; }
        }
        */

        if (req.Data.IsActive === false) {
            let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
            let ItemQtyStoreApiReq = {
                Id: 0,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Params: [
                    { Key: StockItemFilters.FacilityId, Value: req.Data.FacilityId },
                    { Key: StockItemFilters.ItemMasterId, Value: req.Data.ItemMasterId },
                    { Key: StockItemFilters.Quantity, Value: 1 }
                ]
            };
            let StockStatus = await SIBo.GetStockItems(ItemQtyStoreApiReq);
            if (StockStatus.Data.length > 0) {
                throw { code: 'CANNOTINACTIVE' };
            }
        }

        let result = await this.Update(req.Data);

        let StoreMapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
        let VendorMapBo = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);

        let MappedStoreApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [
                { Key: ItemStoreFilters.FacilityId, Value: req.Data.FacilityId },
                { Key: ItemStoreFilters.ItemMasterId, Value: req.Data.ItemMasterId }
            ]
        };
        let MappedVendorApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: ItemVendorFilters.ItemMasterId, Value: req.Data.Id }]
        };
        let MappedStores = null;
        let MappedVendors = null;
        if (req.Data.IsActive === false || req.Data.IsActive === 0) {
            MappedStores = await StoreMapBo.GetItemStoreMaps(MappedStoreApiReq);
            if (MappedStores.Data.length > 0) {
                await StoreMapBo.ManageItemStoreMaps(req.Data, MappedStores.Data);
            }
            MappedVendors = await VendorMapBo.GetItemVendorMaps(MappedVendorApiReq);
            if (MappedVendors.Data.length > 0) {
                await VendorMapBo.ManageItemVendorMaps(req.Data, MappedVendors.Data);
            }
        } else if (req.Data.IsActive === true) {
            MappedStores = await StoreMapBo.GetItemStoreMaps(MappedStoreApiReq);
            if (MappedStores.Data.length > 0) {
                await StoreMapBo.ManageItemStoreMaps(req.Data, MappedStores.Data);
            }
            MappedVendors = await VendorMapBo.GetItemVendorMaps(MappedVendorApiReq);
            if (MappedVendors.Data.length > 0) {
                await VendorMapBo.ManageItemVendorMaps(req.Data, MappedVendors.Data);
            }
        }

        return result;
    }

    public async ManageItemFacilityMaps(MasterItem: any, details: ItemFacilityMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ItemCode = MasterItem.ItemCode;
                detail.ItemName = MasterItem.ItemName;
                detail.ItemDescription = MasterItem.ItemDescription;
                detail.ItemShortDescription = MasterItem.ItemShortDescription;
                detail.CategoryId = MasterItem.CategoryId;
                detail.SubCategoryId = MasterItem.SubCategoryId;
                detail.ProductTypeId = MasterItem.ProductTypeId;
                detail.SubProductTypeId = MasterItem.SubProductTypeId;
                detail.GenericId = MasterItem.GenericId;
                detail.GenericCode = MasterItem.GenericCode;
                detail.GenericName = MasterItem.GenericName;
                detail.ManufacturerId = MasterItem.ManufacturerId;
                detail.ManufacturerCode = MasterItem.ManufacturerCode;
                detail.ManufacturerName = MasterItem.ManufacturerName;
                detail.BaseUomId = MasterItem.BaseUomId;
                detail.PurchaseUomId = MasterItem.PurchaseUomId;
                detail.SaleUomId = MasterItem.SaleUomId;
                detail.ScheduleTypeId = MasterItem.ScheduleTypeId;
                detail.StorageConditionId = MasterItem.StorageConditionId;
                detail.GstId = MasterItem.GstId;
                detail.InGstId = MasterItem.InGstId;
                detail.CGstId = MasterItem.CGstId;
                detail.SGstId = MasterItem.SGstId;
                detail.AccountCode = MasterItem.AccountCode;
                detail.SubAccountCode = MasterItem.SubAccountCode;
                detail.ProductRegNo = MasterItem.ProductRegNo;
                detail.IsBatchMandatory = MasterItem.IsBatchMandatory;
                detail.IsExpiryMandatory = MasterItem.IsExpiryMandatory;
                detail.CalculateTaxonMRP = MasterItem.CalculateTaxonMRP;
                detail.ItemPrice = MasterItem.ItemPrice;
                detail.CostPrice = MasterItem.CostPrice;
                detail.MrPrice = MasterItem.MrPrice;
                detail.DrugId = MasterItem.DrugId;
                detail.DrugCode = MasterItem.DrugCode;
                detail.DrugName = MasterItem.DrugName;
                detail.IsCssd = MasterItem.IsCssd;
                detail.HSNId = MasterItem.HSNId;
                detail.HSNCode = MasterItem.HSNCode;
                detail.HSNName = MasterItem.HSNName;
                detail.IsConsignment = MasterItem.IsConsignment;
                detail.IsGenericAllow = MasterItem.IsGenericAllow;
                detail.IsBillable = MasterItem.IsBillable;
                detail.IsManufacture = MasterItem.IsManufacture;
                detail.IsControlled = MasterItem.IsControlled;
                detail.IsColdChain = MasterItem.IsColdChain;
                detail.IsAsset = MasterItem.IsAsset;
                detail.IsDescriptionEdit = MasterItem.IsDescriptionEdit;
                detail.IsHighAlert = MasterItem.IsHighAlert;
                detail.IsNarcotic = MasterItem.IsNarcotic;
                detail.IsReusable = MasterItem.IsReusable;
                detail.IsMRPRequired = MasterItem.IsMRPRequired;
                detail.CanEditPriceForGrn = MasterItem.CanEditPriceForGrn;
                detail.IsConsumable = MasterItem.IsConsumable;
                detail.Min = MasterItem.Min;
                detail.Max = MasterItem.Max;
                detail.ActiveStatusId = MasterItem.ActiveStatusId;
                detail.IsActive = MasterItem.IsActive;
                detail.ActiveFrom = MasterItem.ActiveFrom;
                detail.ActiveTo = MasterItem.ActiveTo;
                detail.ImagePath = MasterItem.ImagePath;
                if (MasterItem.IsActive === true) {
                    detail.Status = 1;
                } else {
                    detail.Status = 2;
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

    public async ManageFacilityItemMaps(MasterFacility: any, details: ItemFacilityMapAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (MasterFacility.IsActive === true) {
                    detail.Status = 1;
                } else {
                    detail.Status = 2;
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

    public async GetItemFacilityMapById(req: BaseRequest): Promise<ItemFacilityMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemFacilityMaps(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        // let ItemMasterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugCode', 'DrugName'], required: false });
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorMasterId', 'VendorCode', 'VendorName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemFacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemFacilityFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemFacilityFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemFacilityFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemFacilityFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemFacilityFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemFacilityFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemFacilityFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemFacilityFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemFacilityFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetFacilityMasterItem(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        //include.push({ model: this.Models.UomConversion, required: false });
        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                { model: this.Models.UomConversion, required: false }
            ]
        });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugCode', 'DrugName'], required: false });
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorMasterId', 'VendorCode', 'VendorName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemFacilityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemFacilityFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemFacilityFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemFacilityFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemFacilityFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemFacilityFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemFacilityFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemFacilityFilters.SubProductTypeId:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemFacilityFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemFacilityFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemFacilityFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async ManageItemFacilityMap(MasterId: number, facilitymapitem: ItemFacilityMapAttributes): Promise<boolean> {
        facilitymapitem.ItemMasterId = MasterId;
        await this.Save(facilitymapitem);
        return true;
    }

    public async DeleteItemFacilityMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemFacilityMapInstance, ItemFacilityMapAttributes> {
        return this.Models.ItemFacilityMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemFacilityFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemMasterId', 'ItemCode', ['ItemName', 'Text'], 'ItemName',
            'FacilityId', 'Rev'];
        let val = await this.GetItemFacilityMaps(apiReq);
        return { [key]: val.Data };
    }
}

