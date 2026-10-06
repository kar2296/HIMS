import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemCustomerFilters } from '../Common/Filters.e';
import { ItemCustomerMapInstance, ItemCustomerMapAttributes } from '../Model/Interface/Index';

export class ItemCustomerMapBo extends BaseBo<ItemCustomerMapInstance, ItemCustomerMapAttributes> {
    public async AddItemCustomerMap(req: BaseRequest): Promise<number> {
        let customeritemduplicate = await this.FindAll({
            where: {
                'ItemMasterId': req.Data['ItemMasterId'],
                'CustomerMasterId': req.Data['CustomerMasterId']
            }
        });
        if (customeritemduplicate && customeritemduplicate.length > 0) {
            throw { code: 'THIS_ITEM_ALREADY_MAPPED' };
        }

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemCustomerMap(req: BaseRequest): Promise<boolean> {
        let customeritemduplicate = await this.FindAll({
            where: {
                'ItemMasterId': req.Data['ItemMasterId'],
                'CustomerMasterId': req.Data['CustomerMasterId'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (customeritemduplicate && customeritemduplicate.length > 0) {
            throw { code: 'THIS_ITEM_ALREADY_MAPPED' };
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemCustomerMapById(req: BaseRequest): Promise<ItemCustomerMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageItemCustomerMapsAfterGrn(VendorMasterId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        for (var gi = 0; gi < details.length; gi++) {
            await this.ManageItemCustomerMapAfterGrn(VendorMasterId, request, details[gi]);
        }
    }

    public async ManageItemCustomerMapAfterGrn(VendorMasterId: number, request: any, itemInfo: any): Promise<void> {
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 1000 },
            Params: [{ Key: ItemCustomerFilters.ItemMasterId, Value: itemInfo.ItemMasterId }]
        };
        let CustomerMaps = await this.GetItemCustomerMaps(apiReq);
        if (CustomerMaps.Data && CustomerMaps.Data.length > 0) {
            for (var cm = 0; cm < CustomerMaps.Data.length; cm++) {
                await this.ManageItemCustomerMap(CustomerMaps.Data[cm], itemInfo);
            }
        }
    }

    public async ManageItemCustomerMap(customermapinfo: any, itemInfo: any): Promise<void> {
        let customermap = await this.GetItemCustomerMapById({ Id: customermapinfo.Id });
        customermap.UomPrice = itemInfo.UomPrice;
        customermap.Price = itemInfo.Price;
        await this.Update(customermap);
    }

    public async GetItemCustomerMaps(apiReq?: ApiRequest<ItemCustomerFilters>): Promise<ApiResponse<ItemCustomerMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        let itemQry: any = {
            model: this.Models.ItemMaster,
            required: true,
            include: [
                this.GetReference('ScheduleType'),
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
                {
                    model: this.Models.GenericMaster,
                    required: false,
                    attributes: ['Code', 'GenericName', 'ScheduleTypeId', 'IsPrescribed']
                }
            ]
        };
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.CustomerMaster, required: false });
        include.push(this.GetReference('DiscountMode'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemCustomerFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemCustomerFilters.CustomerMasterId:
                        where['CustomerMasterId'] = param.Value;
                        break;
                    case ItemCustomerFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemCustomerFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemCustomerFilters.StoreMasterId:
                        storemasterId = param.Value;
                        itemQry.include.push({
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
                        });
                        break;
                    case ItemCustomerFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemCustomerFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ItemCustomerFilters.ItemFacilityMapId:
                        where['ItemFacilityMapId'] = param.Value;
                        break;
                    case ItemCustomerFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(itemQry);

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetCustomerItemsToReturn(apiReq?: ApiRequest<ItemCustomerFilters>): Promise<ApiResponse<ItemCustomerMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let customermasterId = -1;
        let storemasterId = -1;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemCustomerFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemCustomerFilters.CustomerMasterId:
                        customermasterId = param.Value;
                        where['CustomerMasterId'] = customermasterId;
                        break;
                    case ItemCustomerFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case ItemCustomerFilters.Code:
                        (where as any)[Op.or] = [{ ItemCode: { [Op.like]: (param.Value || '') + '%' } },
                        { ItemName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ItemCustomerFilters.StoreMasterId:
                        storemasterId = param.Value;
                        break;
                    case ItemCustomerFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ItemCustomerFilters.ProductTypeId:
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
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                    where: { 'StoreMasterId': storemasterId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            where: {
                                '$and': [{ 'StoreMasterId': storemasterId },
                                { 'CustomerMasterId': customermasterId },
                                { 'Quantity': { $gt: 0 } }]
                            }
                        }
                    ]
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteItemCustomerMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemCustomerMapInstance, ItemCustomerMapAttributes> {
        return this.Models.ItemCustomerMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemCustomerFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemMasterId', 'ItemCode', ['ItemName', 'Text'], 'ItemName',
            'CustomerMasterId', 'CustomerCode', 'CustomerName', 'Price', 'DiscountModeId', 'Discount', 'MrPrice', 'FreeQty'];
        let val = await this.GetItemCustomerMaps(apiReq);
        return { [key]: val.Data };
    }
}
