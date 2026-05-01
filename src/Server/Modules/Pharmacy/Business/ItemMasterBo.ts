import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, MapBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse, ISearchEnums } from '../../../Common/Index';
import { ItemMasterInstance, ItemMasterAttributes } from '../Model/Interface/Index';
import { ItemMasterFilters } from '../Common/Filters.e';
import { ItemVendorMapAttributes } from '../Model/Interface/Index';
import { ItemCustomerMapAttributes } from '../Model/Interface/Index';
import { ItemCustomerFilters } from '../Common/Filters.e';
import { ItemStoreMapAttributes, ItemFacilityMapAttributes } from '../Model/Interface/Index';
import { ItemContractMapAttributes } from '../Model/Interface/Index';
import { ItemFacilityFilters, ItemStoreFilters, ItemVendorFilters, StockItemFilters, } from '../Common/Filters.e';
import { ItemContractMapFilters, StoreUserMapFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';
import * as _ from 'lodash';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

import * as bo from '../../Pharmacy/Business/Index';
//import * as generalMasterBO from '../../GeneralMaster/Business/Index';

export class ItemMasterBo extends BaseBo<ItemMasterInstance, ItemMasterAttributes> {
    protected ItemVendorBO: bo.ItemVendorMapBo;
    protected ItemStoreBO: bo.ItemStoreMapBo;
    protected ItemContractBO: bo.ItemContractMapBo;
    protected ItemCustomerBO: bo.ItemCustomerMapBo;
    protected ItemFacilityBO: bo.ItemFacilityMapBo;

    public constructor(req?: Request) {
        super(req);
        this.ItemVendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, req); //TODO
        this.ItemStoreBO = BoFactory.GetBo(bo.ItemStoreMapBo, req); //TODO
        this.ItemContractBO = BoFactory.GetBo(bo.ItemContractMapBo, req); //TODO
        this.ItemCustomerBO = BoFactory.GetBo(bo.ItemCustomerMapBo, req); //TODO
        this.ItemFacilityBO = BoFactory.GetBo(bo.ItemFacilityMapBo, req); //TODO
    }

    public async AddItemMaster(req: BaseRequest): Promise<number> {
        let codeduplicate = await this.FindAll({ where: { 'ItemCode': req.Data['ItemCode'] } });
        if (codeduplicate && codeduplicate.length > 0) { throw { code: 'CODEALREADYEXIST' }; }

        let nameduplicate = await this.FindAll({ where: { 'ItemName': req.Data['ItemName'] } });
        if (nameduplicate && nameduplicate.length > 0) { throw { code: 'NAMEALREADYEXIST' }; }

        let file = this.Request.file;
        if (file) { req.Data.ImagePath = file.path; }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') { req.Data[idx] = null; }
        }

        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        if (result) {
            let MasterId = result.dataValues.Id;
            let storeuserReq = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: StoreUserMapFilters.UserId, Value: this.Session.UserId }]
            };
            let storeusermapBo = BoFactory.GetBo(bo.StoreUserMapBo, this.Request);
            let storeuserMaps = await storeusermapBo.GetStoreUserMaps(storeuserReq);
            if (storeuserMaps.Data.length > 0) {
                let storeUserMapData = storeuserMaps.Data[0];
                let itemstoreData: any = {
                    Data: {
                        ItemMasterId: MasterId,
                        // ItemFacilityMapId: MasterId,
                        StoreMasterId: storeUserMapData.StoreMasterId,
                        ItemCode: req.Data.ItemCode,
                        ItemName: req.Data.ItemName,
                        CategoryId: req.Data.CategoryId,
                        SubCategoryId: req.Data.SubCategoryId,
                        ProductTypeId: req.Data.ProductTypeId,
                        SubProductTypeId: -1,
                        StoreCode: storeUserMapData.StoreCode,
                        StoreName: storeUserMapData.StoreName,
                        IsBillable: true,
                        Status: 1,
                        FacilityId: this.Session.FacilityId
                    }
                };
                let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoremapBo.AddItemStoreMap(itemstoreData);
            }

            let UomDetails: any = [
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 1,
                    UomId: req.Data.BaseUomId,
                    ConversionQuantity: 1,
                    FacilityId: this.Session.FacilityId,
                },
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 2,
                    UomId: req.Data.PurchaseUomId,
                    ConversionQuantity: parseInt(req.Data.PurConQty),
                    FacilityId: this.Session.FacilityId,
                },
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 3,
                    UomId: req.Data.SaleUomId,
                    ConversionQuantity: 1,
                    FacilityId: this.Session.FacilityId,
                },
            ];

            let UomconvBo = BoFactory.GetBo(bo.UomConversionBo, this.Request);
            await UomconvBo.ManageUomConversions(UomDetails);

            let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
            await stockitemBO.ManageStoreAssosiations(MasterId, req.Data);

            let facilityitemBO = BoFactory.GetBo(bo.ItemFacilityMapBo, this.Request);
            await facilityitemBO.ManageItemFacilityMap(MasterId, req.Data);

            return MasterId;
        }

        return 0;
    }

    public async AddItemMasterExcel(req: BaseRequest): Promise<any> {
        let details: ItemMasterAttributes[] = req.Data || [];

        const filteredDetails: any[] = [];
        for (const DetailItem of details) {
            let codeduplicate = await this.FindAll({
                where: { ItemCode: DetailItem.ItemCode }
            });

            if (!codeduplicate || codeduplicate.length === 0) {
                filteredDetails.push(DetailItem);
            } else {
                console.warn('Duplicate ItemCode found: ' + DetailItem.ItemCode + '. Skipping this row.');
            }
        }
        const masterIds: number[] = [];
        await Promise.all(filteredDetails.map(async (DetailItem: any) => {
            try {
                let result = await this.Save(DetailItem);
                if (result) {
                    let MasterId = result.dataValues.Id;
                    masterIds.push(MasterId); // Collect the MasterId
                }
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        await Promise.all(masterIds.map(async (MasterId, index) => {
            const DetailItem = filteredDetails[index]; // Get corresponding DetailItem
            // Item Store Map
            let storeuserReq = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: StoreUserMapFilters.UserId, Value: this.Session.UserId }]
            };
            let storeusermapBo = BoFactory.GetBo(bo.StoreUserMapBo, this.Request);
            let storeuserMaps = await storeusermapBo.GetStoreUserMaps(storeuserReq);

            if (storeuserMaps.Data.length > 0) {
                let storeUserMapData = storeuserMaps.Data[0];
                let itemstoreData: any = {
                    Data: {
                        ItemMasterId: MasterId,
                        StoreMasterId: storeUserMapData.StoreMasterId,
                        ItemCode: DetailItem.ItemCode,
                        ItemName: DetailItem.ItemName,
                        CategoryId: DetailItem.CategoryId,
                        SubCategoryId: DetailItem.SubCategoryId,
                        ProductTypeId: DetailItem.ProductTypeId,
                        SubProductTypeId: -1,
                        StoreCode: storeUserMapData.StoreCode,
                        StoreName: storeUserMapData.StoreName,
                        IsBillable: true,
                        Status: 1,
                        FacilityId: this.Session.FacilityId
                    }
                };
                let itemstoremapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoremapBo.AddItemStoreMap(itemstoreData);
            }

            // UOM Conversion
            let UomDetails: any = [
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 1,
                    UomId: DetailItem.BaseUomId,
                    ConversionQuantity: 1,
                    FacilityId: this.Session.FacilityId,
                },
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 2,
                    UomId: DetailItem.PurchaseUomId,
                    ConversionQuantity: 1,
                    FacilityId: this.Session.FacilityId,
                },
                {
                    Id: 0,
                    ItemMasterId: MasterId,
                    UomTypeId: 3,
                    UomId: DetailItem.SaleUomId,
                    ConversionQuantity: 1,
                    FacilityId: this.Session.FacilityId,
                },
            ];
            let UomconvBo = BoFactory.GetBo(bo.UomConversionBo, this.Request);
            await UomconvBo.ManageUomConversions(UomDetails);

            // Stock Item Update
            let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
            await stockitemBO.ManageStoreAssosiations(MasterId, DetailItem);

            // Item Facility Map
            let facilityitemBO = BoFactory.GetBo(bo.ItemFacilityMapBo, this.Request);
            await facilityitemBO.ManageItemFacilityMap(MasterId, DetailItem);
        }));
        return true;
    }


    public async UpdateItemMaster(req: BaseRequest): Promise<boolean> {
        // let codeduplicate = await this.FindAll({ where: { 'ItemCode': req.Data['ItemCode'], 'Id': { '$ne': req.Data['Id'] } } });
        // if (codeduplicate && codeduplicate.length > 0) { throw { code: 'CODEALREADYEXIST' }; }

        // let nameduplicate = await this.FindAll({ where: { 'ItemName': req.Data['ItemName'], 'Id': { '$ne': req.Data['Id'] } } });
        // if (nameduplicate && nameduplicate.length > 0) { throw { code: 'NAMEALREADYEXIST' }; }

        let file = this.Request.file;
        if (file) { req.Data.ImagePath = file.path; }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') { req.Data[idx] = null; }
        }

        if (req.Data.IsActive === false) {
            let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
            let ItemQtyStoreApiReq = {
                Id: 0,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Params: [{ Key: StockItemFilters.ItemMasterId, Value: req.Data.Id },
                { Key: StockItemFilters.Quantity, Value: 1 }]
            };
            let StockStatus = await SIBo.GetStockItems(ItemQtyStoreApiReq);
            if (StockStatus.Data.length > 0 && StockStatus.Data[0].Quantity > 0) {
                console.log('StockStatus.DataStockStatus.DataStockStatus.DataStockStatus.Data', StockStatus.Data[0]);
                throw { code: 'CANNOTINACTIVE' };
            }
        }

        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);

        let FacilityMapBo = BoFactory.GetBo(bo.ItemFacilityMapBo, this.Request);
        let StoreMapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
        let VendorMapBo = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);

        let MappedFacilityApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: ItemFacilityFilters.ItemMasterId, Value: req.Data.Id }]
        };
        let MappedStoreApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: ItemStoreFilters.ItemMasterId, Value: req.Data.Id }]
        };
        let MappedVendorApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: ItemVendorFilters.ItemMasterId, Value: req.Data.Id }]
        };

        let MappedFacilities = null;
        let MappedStores = null;
        let MappedVendors = null;
        if (req.Data.IsActive === false || req.Data.IsActive === 0) {
            MappedFacilities = await FacilityMapBo.GetItemFacilityMaps(MappedFacilityApiReq);
            if (MappedFacilities.Data.length > 0) {
                await FacilityMapBo.ManageItemFacilityMaps(req.Data, MappedFacilities.Data);
            }
            MappedStores = await StoreMapBo.GetItemStoreMaps(MappedStoreApiReq);
            if (MappedStores.Data.length > 0) {
                await StoreMapBo.ManageItemStoreMaps(req.Data, MappedStores.Data);
            }
            MappedVendors = await VendorMapBo.GetItemVendorMaps(MappedVendorApiReq);
            if (MappedVendors.Data.length > 0) {
                await VendorMapBo.ManageItemVendorMaps(req.Data, MappedVendors.Data);
            }
        } else if (req.Data.IsActive === true) {
            MappedFacilities = await FacilityMapBo.GetItemFacilityMaps(MappedFacilityApiReq);
            if (MappedFacilities.Data.length > 0) {
                await FacilityMapBo.ManageItemFacilityMaps(req.Data, MappedFacilities.Data);
            }
            MappedStores = await StoreMapBo.GetItemStoreMaps(MappedStoreApiReq);
            if (MappedStores.Data.length > 0) {
                await StoreMapBo.ManageItemStoreMaps(req.Data, MappedStores.Data);
            }
            MappedVendors = await VendorMapBo.GetItemVendorMaps(MappedVendorApiReq);
            if (MappedVendors.Data.length > 0) {
                await VendorMapBo.ManageItemVendorMaps(req.Data, MappedVendors.Data);
            }
        }

        let UomDetails: any = [];
        for (var jdx in req.Data.UomConversions) {
            var uomValue = req.Data.UomConversions[jdx];
            let Uom: any = {
                Id: uomValue.Id,
                UomId: req.Data.BaseUomId,
                ConversionQuantity: 1,
            };
            if (uomValue.UomTypeId === 2) {
                Uom.ConversionQuantity = parseInt(req.Data.PurConQty);
            }
            UomDetails.push(Uom);
        }
        let UomconvBo = BoFactory.GetBo(bo.UomConversionBo, this.Request);
        await UomconvBo.ManageUomConversions(UomDetails);
        return result;
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        if (req.Data.CategoryId) {
            let maxidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('ItemMasterId')), 'ItemMasterId'],
                ],
                where: {
                    Status: 1,
                    CategoryId: req.Data.CategoryId,
                    // FacilityId: req.Data.FacilityId,
                }
            });
            if (maxidInstance) {
                let patient: any = this.GetAttribute(maxidInstance);
                let lastItemMasterId = patient['ItemMasterId'];
                if (lastItemMasterId) MaxId = lastItemMasterId;
            }
        }
        return ++MaxId;
    }

    public async GetMaxItem(req: BaseRequest): Promise<any> {
        if (req.Data.CategoryId) {
            let maxidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('ItemMasterId')), 'ItemMasterId'],
                ],
                where: {
                    Status: 1,
                    CategoryId: req.Data.CategoryId,
                    // FacilityId: req.Data.FacilityId,
                }
            });
            if (maxidInstance) {
                let result: any = this.GetAttribute(maxidInstance);
                let lastItemMasterId = result['ItemMasterId'];
                let item: any = await this.GetById(lastItemMasterId, { attributes: ['Id', 'ItemCode', 'ItemName', 'ItemDescription'] });
                return this.GetAttribute(item);
            }
        }
    }

    public async GetItemLogo(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.ImagePath);
        return new Buffer(result).toString('base64');
    }

    public async GetItemMasterById(req: BaseRequest): Promise<ItemMasterAttributes> {
        //let result = await this.GetById(req.Id);
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.UomConversion,
            //where: { 'UomTypeId': 2 },
            //attributes: ['Id', 'UomTypeId', 'ConversionQuantity'],
            required: false
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetItemFile(req: BaseRequest, res: any): Promise<any> {
        let result = await res.download(req.Data.ImagePath);
        return result;
    }

    public async GetItemMasters(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DiscountMode'));
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.ItemSubType, attributes: ['SubTypeName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugCode', 'DrugName'], required: false });
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorMasterId', 'VendorCode', 'VendorName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        include.push({ model: this.Models.Indication, attributes: ['Code', 'Indications', 'ShortCode'], required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        // include.push({ model: this.Models.UomConversion, required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push(this.GetReference('ScheduleType'));
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
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like] : '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    // case ItemMasterFilters.CategorySubId:
                    //     where['CategorySubId'] = param.Value;
                    //     break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ManufacturerId:
                        where['ManufacturerId'] = param.Value;
                        break;
                    case ItemMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemMasterFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case ItemMasterFilters.OnlyStoreMasterId:
                        include.push({
                            model: this.Models.ItemStoreMap, as: 'StoreMap',
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.SubTypeId:
                        where['SubTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.ItemName:
                        // where['ItemName'] = { '$like': (param.Value || '') + '%' };
                        where['ItemName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemMasterFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case ItemMasterFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;

                    /*
                    case ItemMasterFilters.Guarantor:
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
                        break;
                    */
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetItemMasterlist(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like] : '%' + (param.Value || '') + '%' } },
                        { 'ItemName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    // case ItemMasterFilters.CategorySubId:
                    //     where['CategorySubId'] = param.Value;
                    //     break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ManufacturerId:
                        where['ManufacturerId'] = param.Value;
                        break;
                    case ItemMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemMasterFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case ItemMasterFilters.OnlyStoreMasterId:
                        include.push({
                            model: this.Models.ItemStoreMap, as: 'StoreMap',
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetItemMastersdashboard(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DiscountMode'));
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugCode', 'DrugName'], required: false });
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorMasterId', 'VendorCode', 'VendorName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        include.push({ model: this.Models.Indication, attributes: ['Code', 'Indications', 'ShortCode'], required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push(this.GetReference('ScheduleType'));
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
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like] : '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ManufacturerId:
                        where['ManufacturerId'] = param.Value;
                        break;
                    case ItemMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemMasterFilters.OnlyStoreMasterId:
                        include.push({
                            model: this.Models.ItemStoreMap, as: 'StoreMap',
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.StoreMasterQty:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value, 'Quantity': { $gt: 0 } }
                        });
                        break;
                    /*
                    case ItemMasterFilters.Guarantor:
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
                        break;
                    */
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['MrPrice', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetItemsForOpeningStock(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'UomMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.UomConversion, required: false });
        include.push({ model: this.Models.ProductType, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemMasterFilters.ItemName:
                        // where['ItemName'] = { '$like': (param.Value || '') + '%' };
                        where['ItemName'] = { '$like': param.Value + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetItemsForPurchaseOrder(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Code', 'GenericName'], required: false });
        include.push({ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({
            model: this.Models.UomConversion, required: false,
            include: [{
                model: this.Models.UomMaster, attributes: ['UomId', 'UomCode',
                    'UomName', 'UomDescription'], as: 'UomMaster', required: false
            }]
        });
        include.push({ model: this.Models.GstMaster, required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.ItemFacilityMap, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.VendorMasterId:
                        include.push({
                            model: this.Models.ItemVendorMap,
                            required: true,
                            where: { 'VendorMasterId': param.Value },
                            include: [
                                { model: this.Models.ProductType, required: false },
                                { model: this.Models.GstMaster, required: false },
                                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                                { model: this.Models.UomMaster, as: 'UomMaster', required: false },
                                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                                { model: this.Models.UomMaster, as: 'SaleUom', required: false }
                            ]
                        });
                        break;
                    case ItemMasterFilters.excelCode:
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
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetItemsForGRN(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Code', 'GenericName'], required: false });
        include.push({ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] });
        include.push({
            model: this.Models.UomMaster,
            attributes: ['Id', 'UomCode', 'UomName'],
            as: 'PurchaseUom', required: false
        });
        include.push({
            model: this.Models.UomMaster,
            attributes: ['Id', 'UomCode', 'UomName'],
            as: 'SaleUom', required: false
        });
        include.push({
            model: this.Models.UomConversion, required: false,
            include: [{
                model: this.Models.UomMaster, attributes: ['UomId', 'UomCode',
                    'UomName', 'UomDescription'], as: 'UomMaster', required: false
            }]
        });
        include.push({
            model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                'IsAllFacility'],
            required: false
        });
        include.push({
            model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                'IsAllFacility'],
            as: 'CGstMaster', required: false
        });
        include.push({
            model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                'IsAllFacility'],
            as: 'SGstMaster', required: false
        });
        include.push({
            model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
                'IsAllFacility'],
            as: 'InGstMaster', required: false
        });
        include.push({
            model: this.Models.ItemFacilityMap,
            attributes: ['Id', 'ItemCode', 'ItemName',
                'ItemMasterId', 'FacilityId'
            ],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case ItemMasterFilters.ItemName:
                        // where['ItemName'] = { '$like': (param.Value || '') + '%' };
                        where['ItemName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemMasterFilters.VendorMasterId:
                        include.push({
                            model: this.Models.ItemVendorMap,
                            required: true,
                            where: { 'VendorMasterId': param.Value },
                            include: [
                                { model: this.Models.ProductType, required: false },
                                { model: this.Models.GstMaster, required: false },
                                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                                { model: this.Models.UomMaster, as: 'UomMaster', required: false },
                                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                                { model: this.Models.UomMaster, as: 'SaleUom', required: false }
                            ]
                        });
                        break;
                    case ItemMasterFilters.excelCode:
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
        // apiReq.Attributes = ['ItemMasterId', 'ItemCode', 'ItemName',
        //     'ItemDescription', 'CategoryId', 'SubCategoryId',
        //     'ProductTypeId', 'GenericId', 'DiscountModeId',
        //     'Discount', 'ItemPrice', 'CostPrice',
        //     'MrPrice', 'Mrp', 'IsConsignment',
        //     '', '', '',
        //     'ProductTypeCode', 'ProductTypeName'];
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetMinItemsForGRN(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false });
        // include.push({ model: this.Models.GenericMaster, attributes: ['Code', 'GenericName'], required: false });
        // include.push({ model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] });
        // include.push({
        //     model: this.Models.UomMaster,
        //     attributes: ['Id', 'UomCode', 'UomName'],
        //     as: 'PurchaseUom', required: false
        // });
        // include.push({
        //     model: this.Models.UomMaster,
        //     attributes: ['Id', 'UomCode', 'UomName'],
        //     as: 'SaleUom', required: false
        // });
        // include.push({
        //     model: this.Models.UomConversion, required: false,
        //     include: [{
        //         model: this.Models.UomMaster, attributes: ['UomId', 'UomCode',
        //             'UomName', 'UomDescription'], as: 'UomMaster', required: false
        //     }]
        // });
        // include.push({
        //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
        //         'IsAllFacility'],
        //     required: false
        // });
        // include.push({
        //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
        //         'IsAllFacility'],
        //     as: 'CGstMaster', required: false
        // });
        // include.push({
        //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
        //         'IsAllFacility'],
        //     as: 'SGstMaster', required: false
        // });
        // include.push({
        //     model: this.Models.GstMaster, attributes: ['Id', 'FacilityId', 'GstCode', 'GstName', 'GstPercentage',
        //         'IsAllFacility'],
        //     as: 'InGstMaster', required: false
        // });
        // include.push({
        //     model: this.Models.ItemFacilityMap,
        //     attributes: ['Id', 'ItemCode', 'ItemName',
        //         'ItemMasterId', 'FacilityId'
        //     ],
        //     required: false
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    case ItemMasterFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case ItemMasterFilters.ItemName:
                        // where['ItemName'] = { '$like': (param.Value || '') + '%' };
                        where['ItemName'] = { '$like': param.Value + '%' };
                        break;
                    case ItemMasterFilters.VendorMasterId:
                        include.push({
                            model: this.Models.ItemVendorMap,
                            required: true,
                            where: { 'VendorMasterId': param.Value },
                            include: [
                                { model: this.Models.ProductType, required: false },
                                { model: this.Models.GstMaster, required: false },
                                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                                { model: this.Models.UomMaster, as: 'UomMaster', required: false },
                                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                                { model: this.Models.UomMaster, as: 'SaleUom', required: false }
                            ]
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // apiReq.Attributes = ['ItemMasterId', 'ItemCode', 'ItemName',
        //     'ItemDescription', 'CategoryId', 'SubCategoryId',
        //     'ProductTypeId', 'GenericId', 'DiscountModeId',
        //     'Discount', 'ItemPrice', 'CostPrice',
        //     'MrPrice', 'Mrp', 'IsConsignment',
        //     '', '', '',
        //     'ProductTypeCode', 'ProductTypeName'];
        apiReq.Attributes = ['Id', 'ItemMasterId', 'ItemCode', 'ItemName',
            'ItemDescription', 'CategoryId', 'SubCategoryId',
            'ProductTypeId', 'GenericId', 'DiscountModeId',
            'Discount', 'ItemPrice', 'CostPrice',
            'MrPrice', 'Mrp', 'IsConsignment',
            'ActiveStatusId', 'MrPrice', 'Mrp'];
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetItemsForStockRequest(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async getExcuteStoredProcedure(req: BaseRequest): Promise<any> {
        let RolDate = new Date(req.Data.From);
        let RolPeriod = req.Data.RolPeriod;
        let Facility = req.Data.FacilityId;
        let StoreMaster = req.Data.StoreMasterId;
        let replacements: any = {
            RolDate: RolDate,
            RolPeriod: RolPeriod,
            FacilityId: Facility,
            StoreMasterId: StoreMaster,
        };
        console.log(replacements);
        let spName =
            'reorderleverprocedure(:RolDate,:RolPeriod,:FacilityId,:StoreMasterId)';
        await this.ExecuteStoredProcedure(spName, {
            replacements: replacements,
        });
    }
    // public async GetItemsForStockTransfer(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
    //     let where: WhereOptions<any> = {};
    //     let include: Array<IncludeOptions> = [];
    //     let order: Array<any> = [];
    //     let currentdate = new Date();
    //     include.push(this.GetReference('ActiveStatus'));
    //     include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
    //     include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
    //     apiReq.Params.forEach((param) => {
    //         if (this.IsValidParam(param)) {
    //             switch (param.Key) {
    //                 case ItemMasterFilters.Id:
    //                     where['Id'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.Code:
    //                     where['$or'] = [{ 'ItemCode': { '$like': '%' + (param.Value || '') + '%' } },
    //                     { 'ItemName': { '$like': '%' + (param.Value || '') + '%' } }];
    //                     break;
    //                 case ItemMasterFilters.Status:
    //                     where['ActiveStatusId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.OrganizationId:
    //                     where['OrganizationId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.ProductType:
    //                     where['ProductTypeId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.GenericId:
    //                     where['GenericId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.SubProductType:
    //                     where['SubProductTypeId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.CategoryId:
    //                     where['CategoryId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.SubCategoryId:
    //                     where['SubCategoryId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.DrugId:
    //                     where['DrugId'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.StoreMasterId:
    //                     include.push({
    //                         model: this.Models.StockItem,
    //                         required: false,
    //                         attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
    //                         where: { 'StoreMasterId': param.Value },
    //                         include: [
    //                             {
    //                                 model: this.Models.StockSerialItem,
    //                                 required: false,
    //                                 where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
    //                             }
    //                         ]
    //                     });
    //                     break;
    //                 case ItemMasterFilters.ToStoreMasterId:
    //                     include.push({
    //                         model: this.Models.StockItem,
    //                         as: 'ToStoreStock',
    //                         required: false,
    //                         attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
    //                         where: { 'StoreMasterId': param.Value },
    //                         include: [
    //                             {
    //                                 model: this.Models.StockSerialItem,
    //                                 required: false,
    //                                 where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
    //                             }
    //                         ]
    //                     });
    //                     break;
    //                 case ItemMasterFilters.IsBatchMandatory:
    //                     where['IsBatchMandatory'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IsBillable:
    //                     where['IsBillable'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IsExpiryMandatory:
    //                     where['IsExpiryMandatory'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IsManufacture:
    //                     where['IsManufacture'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IsMRPRequired:
    //                     where['IsMRPRequired'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IsReusable:
    //                     where['IsReusable'] = param.Value;
    //                     break;
    //                 case ItemMasterFilters.IndicationId:
    //                     where['IndicationId'] = param.Value;
    //                     break;
    //                 default:
    //                     throw 'Not Implemented';
    //             }
    //         }
    //     });
    //     order.push(['ItemName', 'ASC']);
    //     return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    // }

    public async GetItemsForStockTransfer(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let currentdate = new Date();
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    // where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                                    where: { 'Quantity': { $gt: 0 } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.ToStoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            as: 'ToStoreStock',
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetItemsForStockConsumption(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    where: { 'Quantity': { $gt: 0 } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetItemsForStockAdjustment(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ProductType, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    where: { 'Quantity': { $gt: 0 } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetMasterItem(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push({ model: this.Models.UomConversion, required: false });
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
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPrescribedItems(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let currentdate = new Date();
        let storemasterId = -1;
        let order: Array<any> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push({ model: this.Models.ItemCategory, attributes: ['CategoryName'], required: false });
        include.push({ model: this.Models.ItemSubCategory, attributes: ['SubCategoryName'], required: false });
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugCode', 'DrugName'], required: false });
        include.push({ model: this.Models.VendorMaster, as: 'Manufacturer', attributes: ['VendorName'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        storemasterId = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StockItem,
            required: true,
            /*attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],*/
            where: { 'StoreMasterId': storemasterId },
            include: [
                {
                    model: this.Models.StockSerialItem,
                    required: false,
                    /*attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],*/
                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: currentdate } }
                }
            ]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetGenericItems(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ScheduleType'));
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName', 'Description'], required: false });
        include.push({ model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false });
        include.push({ model: this.Models.DrugMaster, required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: true,
                                    attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: new Date() } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.PharmacyId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetMinGenericItems(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('ScheduleType'));
        include.push({ model: this.Models.GenericMaster, attributes: ['Id', 'Code', 'GenericName', 'Description'], required: false });
        // include.push({ model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false });
        // include.push({ model: this.Models.DrugMaster, required: false });
        // include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        // include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        // include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like] : '%' + (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': param.Value },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: true,
                                    attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: new Date() } }
                                }
                            ]
                        });
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.PharmacyId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        apiReq.Attributes = ['Id', 'GenericId', 'ItemCode', 'ItemName', '',
            '', ''];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ManageMasterItemInternalPrice(request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });

        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManageMasterItem(request, itemDetails[im]);
            })(itemId);
        }));

        /*
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageMasterItem(request, detail);
            })(item);
        }));
        */
    }

    public async ManageMasterItem(request: any, detail: any): Promise<void> {
        let itemmasterid = detail[0].ItemMasterId;
        let itemprice = detail[0].PurchasePrice;
        let costprice = detail[0].UnitCostPrice;
        let mrprice = detail[0].MrPrice;
        let mrp = detail[0].Mrp;

        let masteritem = await this.GetItemMasterById({ Id: itemmasterid });
        masteritem.ItemPrice = itemprice;
        masteritem.CostPrice = costprice;
        masteritem.MrPrice = mrprice;
        masteritem.Mrp = mrp;
        await this.Update(masteritem);
    }

    public async GetItemMasterForBillModifications(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.UomMaster, required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.ItemCategory, required: false });
        include.push({ model: this.Models.ItemSubCategory, required: false });
        include.push({ model: this.Models.ProductType, required: false });
        include.push({ model: this.Models.ProductSubType, required: false });
        include.push({ model: this.Models.GenericMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.DrugMaster, required: false });

        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });


        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemMasterFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { ItemName : {[Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ItemMasterFilters.Status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemMasterFilters.OrganizationId:
                        where['OrganizationId'] = param.Value;
                        break;
                    case ItemMasterFilters.ProductType:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubProductType:
                        where['SubProductTypeId'] = param.Value;
                        break;
                    case ItemMasterFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.SubCategoryId:
                        where['SubCategoryId'] = param.Value;
                        break;
                    case ItemMasterFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case ItemMasterFilters.StoreMasterId:
                        include.push({
                            model: this.Models.StockItem,
                            required: true,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': param.Value }
                        });
                        break;
                    case ItemMasterFilters.IsBatchMandatory:
                        where['IsBatchMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsBillable:
                        where['IsBillable'] = param.Value;
                        break;
                    case ItemMasterFilters.IsExpiryMandatory:
                        where['IsExpiryMandatory'] = param.Value;
                        break;
                    case ItemMasterFilters.IsManufacture:
                        where['IsManufacture'] = param.Value;
                        break;
                    case ItemMasterFilters.IsMRPRequired:
                        where['IsMRPRequired'] = param.Value;
                        break;
                    case ItemMasterFilters.IsReusable:
                        where['IsReusable'] = param.Value;
                        break;
                    case ItemMasterFilters.IndicationId:
                        where['IndicationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['ItemName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public GetModel(): SStatic.Model<ItemMasterInstance, ItemMasterAttributes> {
        return this.Models.ItemMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemMasterId', 'ItemCode', ['ItemName', 'Text'], 'ItemName'];
        let val = await this.GetItemMasters(apiReq);
        return { [key]: val.Data };
    }

    public async MapStores(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemMasterId', 'StoreMasterId', super.Request);
        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
        await stockitemBO.ManageStockItemAssosiations(req.Data);
        console.log('********************req.Data***************', req.Data);
        return await mapbo.Manage(req.Data);
    }
    public async MapItemStores(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemMasterId', 'StoreMasterId', super.Request);
        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
        await stockitemBO.ManageStockItemAssosiations(req.Data);
        console.log('********************req.Data***************', req.Data);
        return await mapbo.Manages(req.Data);
    }
    public async GetStores(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemMasterId', 'StoreMasterId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async MapFacilityStores(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemFacilityMapId', 'StoreMasterId', super.Request);
        return await mapbo.Manage(req.Data);
    }

    // public async GetFacilityStoreforitems(apiReq?: ApiRequest<ISearchEnums>) {
    //     let mapbo = new MapBo(this.Models.ItemStoreMap, 'FacilityId', 'StoreMasterId', super.Request);
    //     return await mapbo.GetMaps(apiReq);
    // }

    // public async MapFacilityStoreforitems(req: BaseRequest) {
    //     let mapbo = new MapBo(this.Models.ItemStoreMap, 'FacilityId', 'StoreMasterId', super.Request);
    //     let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
    //     await stockitemBO.ManageStockItemAssosiations(req.Data);
    //     return await mapbo.Manage(req.Data);
    // }

    public async GetFacilityStores(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.ItemStoreMap, 'ItemFacilityMapId', 'StoreMasterId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async GetItemStoreMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetItemStoreMaps(apiReq);
    }

    public async GetStoreItemsForOpeningStockEntry(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetStoreItemsForOpeningStockEntry(apiReq);
    }

    public async GetStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetStoreItems(apiReq);
    }

    public async GetStoreItemMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetStoreItemMaps(apiReq);
    }

    public async GetStoreReorderItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetStoreReorderItems(apiReq);
    }

    public async GetInventoryItemsforGRN(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetInventoryItemsforGRN(apiReq);
    }

    public async GetInventoryStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetInventoryStoreItems(apiReq);
    }

    public async GetInventoryAdjustItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetInventoryAdjustItems(apiReq);
    }

    public async GetPharmacyStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetPharmacyStoreItems(apiReq);
    }

    public async GetPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetPharmacyStoreItemsForNonZero(apiReq);
    }
    public async GetAllPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetAllPharmacyStoreItemsForNonZero(apiReq);
    }
    public async GetPharmacyStoreItemForVendorReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetPharmacyStoreItemForVendorReturn(apiReq);
    }

    public async GetPharmacyStoreItemsForDirectReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return this.ItemStoreBO.GetPharmacyStoreItemsForDirectReturn(apiReq);
    }

    public async AddItemVendorMap(req: BaseRequest): Promise<number> {
        return this.ItemVendorBO.AddItemVendorMap(req);
    }

    public async UpdateItemVendorMap(req: BaseRequest): Promise<boolean> {
        return this.ItemVendorBO.UpdateItemVendorMap(req);
    }

    public async AddItemCustomerMap(req: BaseRequest): Promise<number> {
        return this.ItemCustomerBO.AddItemCustomerMap(req);
    }

    public async UpdateItemCustomerMap(req: BaseRequest): Promise<boolean> {
        return this.ItemCustomerBO.UpdateItemCustomerMap(req);
    }

    public async AddItemContractMap(req: BaseRequest): Promise<number> {
        return this.ItemContractBO.AddItemContractMap(req);
    }

    public async UpdateItemContractMap(req: BaseRequest): Promise<boolean> {
        return this.ItemContractBO.UpdateItemContractMap(req);
    }

    public async GetItemContractMapById(req: BaseRequest): Promise<ItemContractMapAttributes> {
        return this.ItemContractBO.GetItemContractMapById(req);
    }

    public async GetItemContractMaps(apiReq?: ApiRequest<ItemContractMapFilters>): Promise<ApiResponse<ItemContractMapAttributes[]>> {
        return this.ItemContractBO.GetItemContractMaps(apiReq);
    }

    public async GetItemVendorMapById(req: BaseRequest): Promise<ItemVendorMapAttributes> {
        return this.ItemVendorBO.GetItemVendorMapById(req);
    }

    public async GetItemVendorMaps(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        return this.ItemVendorBO.GetItemVendorMaps(apiReq);
    }

    public async GetVendorItemsToReturn(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        return this.ItemVendorBO.GetVendorItemsToReturn(apiReq);
    }

    public async DeleteItemVendorMap(req: BaseRequest): Promise<Boolean> {
        return this.ItemVendorBO.DeleteItemVendorMap(req);
    }

    public async GetItemCustomerMapById(req: BaseRequest): Promise<ItemCustomerMapAttributes> {
        return this.ItemCustomerBO.GetItemCustomerMapById(req);
    }

    public async GetItemCustomerMaps(apiReq?: ApiRequest<ItemCustomerFilters>): Promise<ApiResponse<ItemCustomerMapAttributes[]>> {
        return this.ItemCustomerBO.GetItemCustomerMaps(apiReq);
    }

    public async DeleteItemCustomerMap(req: BaseRequest): Promise<Boolean> {
        return this.ItemCustomerBO.DeleteItemCustomerMap(req);
    }

    public async MapFacilities(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.ItemFacilityMap, 'ItemMasterId', 'FacilityId', super.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.ItemFacilityMap, 'ItemMasterId', 'FacilityId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async GetItemFacilityMaps(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        return this.ItemFacilityBO.GetItemFacilityMaps(apiReq);
    }
    public async PrintItemMasterReport(apiReq?: ApiRequest<ItemMasterFilters>): Promise<any> {
        let data = await this.GetItemMasters(apiReq);
        let ItemMaster = data.Data;
        let ProductType = apiReq.Data.ProductType;
        let GenericName = apiReq.Data.GenericName;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ManufacturerName = apiReq.Data.ManufacturerName;
        let ItemMasterData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ItemMasterData.FacilityId);
        let info = {
            ItemMaster: ItemMaster,
            Preferences: printPreferencesData,
            ProductType: ProductType,
            GenericName: GenericName,
            ActiveStatus: ActiveStatus,
            ManufacturerName: ManufacturerName
        };
        let pdfOption: any = null;
        let key = 'itemmasterreport';
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
    public async PrintItemPricereport(apiReq?: ApiRequest<ItemVendorFilters>): Promise<any> {
        let data = await this.GetItemVendorMaps(apiReq);
        let ItemMaster = data.Data;
        let ProductType = apiReq.Data.ProductName;
        let VendorName = apiReq.Data.VendorName;
        let ItemMasterData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ItemMasterData.FacilityId);
        let info = {
            ItemMaster: ItemMaster,
            Preferences: printPreferencesData,
            ProductType: ProductType,
            VendorName: VendorName
        };
        let pdfOption: any = null;
        let key = 'itempricedetailsreport';
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
