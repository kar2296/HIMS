import { BaseService, BoFactory } from '../../Base/Index';
import { ItemMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request, Response } from '../../../Core/Index';
import { ItemMasterAttributes } from '../Model/Interface/Index';
import { ItemMasterFilters } from '../Common/Filters.e';
import { ItemVendorMapAttributes } from '../Model/Interface/Index';
import { ItemVendorFilters } from '../Common/Filters.e';
import { ItemCustomerMapAttributes } from '../Model/Interface/Index';
import { ItemCustomerFilters } from '../Common/Filters.e';
import { ItemStoreMapAttributes, ItemFacilityMapAttributes } from '../Model/Interface/Index';
import { ItemStoreFilters, ItemFacilityFilters } from '../Common/Filters.e';

export class ItemMasterService extends BaseService {
    private ItemMasterBo: ItemMasterBo;
    constructor(req?: Request) {
        super(req);
        this.ItemMasterBo = BoFactory.GetBo(ItemMasterBo, this.Request);
    }

    public async AddItemMaster(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.AddItemMaster(req);
    }

    public async AddItemMasterExcel(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.AddItemMasterExcel(req);
    }

    public async UpdateItemMaster(req: BaseRequest): Promise<boolean> {
        return await this.ItemMasterBo.UpdateItemMaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.GetMaxId(req);
    }

    public async GetMaxItem(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.GetMaxItem(req);
    }

    public async GetItemMasterById(req: BaseRequest): Promise<ItemMasterAttributes> {
        return await this.ItemMasterBo.GetItemMasterById(req);
    }

    public async GetItemMasters(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemMasters(apiReq);
    }
    public async getExcuteStoredProcedure(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.getExcuteStoredProcedure(req);
    }
    public async GetItemMasterlist(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemMasterlist(apiReq);
    }
    public async GetItemMastersdashboard(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemMastersdashboard(apiReq);
    }
    public async GetItemsForOpeningStock(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForOpeningStock(apiReq);
    }

    public async GetItemsForPurchaseOrder(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForPurchaseOrder(apiReq);
    }

    public async GetItemsForGRN(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForGRN(apiReq);
    }

    public async GetMinItemsForGRN(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetMinItemsForGRN(apiReq);
    }

    public async GetItemsForStockRequest(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForStockRequest(apiReq);
    }

    public async GetItemsForStockTransfer(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForStockTransfer(apiReq);
    }

    public async GetItemsForStockConsumption(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForStockConsumption(apiReq);
    }

    public async GetItemsForStockAdjustment(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemsForStockAdjustment(apiReq);
    }

    public async GetMasterItem(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetMasterItem(apiReq);
    }

    public async GetItemMasterForBillModifications(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetItemMasterForBillModifications(apiReq);
    }

    public async GetGenericItems(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetGenericItems(apiReq);
    }

    public async GetMinGenericItems(apiReq?: ApiRequest<ItemMasterFilters>): Promise<ApiResponse<ItemMasterAttributes[]>> {
        return await this.ItemMasterBo.GetMinGenericItems(apiReq);
    }

    public async DeleteItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.DeleteItemMaster(req);
    }

    public async MapStores(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.MapStores(req);
    }

    public async MapItemStores(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.MapItemStores(req);
    }

    public async GetFacilityStores(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<ItemStoreMapAttributes>> {
        return await this.ItemMasterBo.GetFacilityStores(apiReq);
    }

    public async MapFacilityStores(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.MapFacilityStores(req);
    }

    public async GetStores(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<ItemStoreMapAttributes>> {
        return await this.ItemMasterBo.GetStores(apiReq);
    }

    public async GetItemStoreMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetItemStoreMaps(apiReq);
    }

    public async GetStoreItemsForOpeningStockEntry(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetStoreItemsForOpeningStockEntry(apiReq);
    }

    public async GetStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetStoreItems(apiReq);
    }

    public async GetStoreItemMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetStoreItemMaps(apiReq);
    }

    public async GetStoreReorderItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetStoreReorderItems(apiReq);
    }

    public async GetInventoryStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetInventoryStoreItems(apiReq);
    }

    public async GetInventoryItemsforGRN(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetInventoryItemsforGRN(apiReq);
    }

    public async GetInventoryAdjustItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetInventoryAdjustItems(apiReq);
    }

    public async GetPharmacyStoreItems(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetPharmacyStoreItems(apiReq);
    }

    public async GetPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetPharmacyStoreItemsForNonZero(apiReq);
    }

    public async GetAllPharmacyStoreItemsForNonZero(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetAllPharmacyStoreItemsForNonZero(apiReq);
    }

    public async GetPharmacyStoreItemForVendorReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetPharmacyStoreItemForVendorReturn(apiReq);
    }

    public async GetPharmacyStoreItemsForDirectReturn(apiReq?: ApiRequest<ItemStoreFilters>):
        Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemMasterBo.GetPharmacyStoreItemsForDirectReturn(apiReq);
    }

    public async AddItemVendorMap(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.AddItemVendorMap(req);
    }

    public async UpdateItemVendorMap(req: BaseRequest): Promise<boolean> {
        return await this.ItemMasterBo.UpdateItemVendorMap(req);
    }

    public async AddItemCustomerMap(req: BaseRequest): Promise<number> {
        return await this.ItemMasterBo.AddItemCustomerMap(req);
    }

    public async UpdateItemCustomerMap(req: BaseRequest): Promise<boolean> {
        return await this.ItemMasterBo.UpdateItemCustomerMap(req);
    }

    public async GetItemLogo(req: BaseRequest): Promise<ItemMasterAttributes> {
        return await this.ItemMasterBo.GetItemLogo(req);
    }

    public async GetItemFile(req: BaseRequest, res: Response): Promise<any> {
        return await this.ItemMasterBo.GetItemFile(req, res);
    }

    public async GetItemVendorMapById(req: BaseRequest): Promise<ItemVendorMapAttributes> {
        return await this.ItemMasterBo.GetItemVendorMapById(req);
    }

    public async GetItemVendorMaps(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        return await this.ItemMasterBo.GetItemVendorMaps(apiReq);
    }

    public async GetVendorItemsToReturn(apiReq?: ApiRequest<ItemVendorFilters>): Promise<ApiResponse<ItemVendorMapAttributes[]>> {
        return await this.ItemMasterBo.GetVendorItemsToReturn(apiReq);
    }

    public async DeleteItemVendorMap(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.DeleteItemVendorMap(req);
    }

    public async GetItemCustomerMapById(req: BaseRequest): Promise<ItemCustomerMapAttributes> {
        return await this.ItemMasterBo.GetItemCustomerMapById(req);
    }

    public async GetItemCustomerMaps(apiReq?: ApiRequest<ItemCustomerFilters>): Promise<ApiResponse<ItemCustomerMapAttributes[]>> {
        return await this.ItemMasterBo.GetItemCustomerMaps(apiReq);
    }

    public async DeleteItemCustomerMap(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.DeleteItemCustomerMap(req);
    }

    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.ItemMasterBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<ItemFacilityMapAttributes>> {
        return await this.ItemMasterBo.GetFacilities(apiReq);
    }

    public async GetItemFacilityMaps(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        return await this.ItemMasterBo.GetItemFacilityMaps(apiReq);
    }
    public async PrintItemMasterReport(apiReq?: ApiRequest<ItemMasterFilters>): Promise<any> {
        return await this.ItemMasterBo.PrintItemMasterReport(apiReq);
    }
    public async PrintItemPricereport(apiReq?: ApiRequest<ItemVendorFilters>): Promise<any> {
        return await this.ItemMasterBo.PrintItemPricereport(apiReq);
    }

}
