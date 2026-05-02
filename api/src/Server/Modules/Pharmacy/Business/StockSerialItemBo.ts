import * as SStatic from 'sequelize';

// Import Sequelize operators
const { Op } = SStatic;
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockSerialItemInstance, StockSerialItemAttributes } from '../Model/Interface/Index';
import { StockSerialItemFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';
import * as moment from 'moment';
// import { any } from 'bluebird';
// import { StockRequestService } from '../Service/Index';

export class StockSerialItemBo extends BaseBo<StockSerialItemInstance, StockSerialItemAttributes> {
    public async AddStockSerialItem(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockSerialItem(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateBarcodeStockItem(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let detailBO = BoFactory.GetBo(bo.GrnDetailBo, this.Request);
        let stockdetailBO = BoFactory.GetBo(bo.StockEntryDetailBo, this.Request);
        if (req.Data.GrnDetailId) {
            let grndetail = await detailBO.GetGrnDetailById({ Id: req.Data.GrnDetailId });
            if (req.Data.BarcodeNo) {
                let updInfo: any = {
                    Id: grndetail.Id,
                    BarCodeId: req.Data.BarcodeNo
                };
                await detailBO.Update(updInfo);
            }
        }
        if (req.Data.StockEntryDetailId) {
            let stockdetail = await stockdetailBO.GetStockEntryDetailById({ Id: req.Data.StockEntryDetailId });
            if (req.Data.BarcodeNo) {
                let stupdInfo: any = {
                    Id: stockdetail.Id,
                    BarCodeId: req.Data.BarcodeNo
                };
                await stockdetailBO.Update(stupdInfo);
            }
        }
        return result;
    }

    public async ManageStockSerialItems(StockItemId: number, details: StockSerialItemAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.StockItemId = StockItemId;
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

    public async UpdateStockSerialItems(req: BaseRequest): Promise<number> {
        let StockItemId = req.Data.Header.Id;
        await this.ManageStockSerialItems(StockItemId, req.Data.Details);
        return StockItemId;
    }

    public async GetStockSerialItemById(req: BaseRequest): Promise<StockSerialItemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockSerialItemIdByFilter(req: BaseRequest): Promise<any> {
        let stockserialitem = null;
        let filterInfo = req.Data;
        let stockserialitemInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                ItemMasterId: filterInfo.ItemMasterId,
                BatchId: filterInfo.BatchId,
                GrnId: filterInfo.GrnId
            }
        });
        if (stockserialitemInstance) {
            stockserialitem = this.GetAttribute(stockserialitemInstance);
        }
        return stockserialitem;
    }

    public async GetStockSerialItemIdByStore(req: BaseRequest): Promise<any> {
        let stockserialitem = null;
        let filterInfo = req.Data;
        let stockserialitemInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                ItemMasterId: filterInfo.ItemMasterId,
                Id: filterInfo.StockSerialItemId
                // BatchId: filterInfo.BatchId,
                // GrnId: filterInfo.GrnId
            }
        });
        if (stockserialitemInstance) {
            stockserialitem = this.GetAttribute(stockserialitemInstance);
        }
        return stockserialitem;
    }

    public async GetExpiredSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let itemWhere: WhereOptions<any> = {};
        let isRequired: any = false;
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockSerialItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockSerialItemFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ExpiryDate:
                        where['ExpiryDate'] = { [Op.between]: param.Value || '' };
                        break;
                    case StockSerialItemFilters.FromDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.gte] = param.Value;
                        break;
                    case StockSerialItemFilters.ToDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.lte] = param.Value + ' 23:59:59';
                        break;
                    case StockSerialItemFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ProductTypeId:
                        itemWhere['ProductTypeId'] = param.Value;
                        isRequired = true;
                        break;
                    case StockSerialItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: 0 };
                        break;
                    case StockSerialItemFilters.GenericId:
                        itemWhere['GenericId'] = param.Value;
                        isRequired = true;
                        break;
                    case StockSerialItemFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: isRequired,
            where: itemWhere,
            include: [
                { model: this.Models.GenericMaster, required: false, attributes: ['Code', 'GenericName'] },
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] }
            ]
        });
        order.push(['ExpiryDate', 'Asc']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStockSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let producttypeWhere: WhereOptions<any> = {};
        let isProductTypeRequired: any = false;
        let order: Array<any> = [];
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        // include.push({ model: this.Models.ItemMaster, required: false });
        include.push({
            model: this.Models.Grn, attributes: ['GrnId', 'GrnNumber'], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockSerialItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockSerialItemFilters.ItemMasterId:
                        //where['ItemMasterId'] = param.Value;
                        (where as any)[Op.and] = [
                            { ItemMasterId: param.Value },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    // case StockSerialItemFilters.ItemMasterId:
                    //     where['ItemMasterId'] = param.Value;
                    //     break;
                    case StockSerialItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ExpiryDate:
                        where['ExpiryDate'] = { [Op.between]: param.Value || '' };
                        break;
                    case StockSerialItemFilters.FromDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.gte] = param.Value;
                        break;
                    case StockSerialItemFilters.ToDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.lte] = param.Value;
                        break;
                    case StockSerialItemFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)[Op.gte] = param.Value;
                        break;
                    case StockSerialItemFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)[Op.lte] = param.Value;
                        break;
                    case StockSerialItemFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ProductTypeId:
                        producttypeWhere['ProductTypeId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.GenericId:
                        producttypeWhere['GenericId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: param.Value };
                        break;
                    case StockSerialItemFilters.CategoryId:
                        producttypeWhere['CategoryId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.CurrentExpiry:
                        where['ExpiryDate'] = { [Op.gt]: param.Value };
                        break;
                    case StockSerialItemFilters.ActiveStatusId:
                        producttypeWhere['ActiveStatusId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.IsBillable:
                        producttypeWhere['IsBillable'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.IsConsignment:
                        producttypeWhere['IsConsignment'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.BarcodeNo:
                        (where as any)[Op.or] = [{ BarcodeNo: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case StockSerialItemFilters.Code:
                        (where as any)[Op.or] = [
                            { ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    case StockSerialItemFilters.StoreMaster:
                        //where['ItemMasterId'] = param.Value;
                        (where as any)[Op.and] = [
                            { StoreMasterId: param.Value },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    case StockSerialItemFilters.StoreMasters:
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        //where['ItemMasterId'] = param.Value;
                        (where as any)[Op.and] = [
                            { StoreMasterId: { [Op.in]: paramArr } },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    case StockSerialItemFilters.ItemMaster:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.GrnId:
                        where['GrnId'] = param.Value;
                        break;
                    case StockSerialItemFilters.GrnDetailId:
                        where['GrnDetailId'] = param.Value;
                        break;
                        case StockSerialItemFilters.BatchId:
                        where['BatchId'] = param.Value;
                        break;
                    default:
                        console.log(param.Key);
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: isProductTypeRequired,
            where: producttypeWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
            ]
        });
        order.push(['ItemName', 'Asc']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetValueStockSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let producttypeWhere: WhereOptions<any> = {};
        let isProductTypeRequired: any = false;
        let order: Array<any> = [];
        // include.push({ model: this.Models.StoreMaster, required: false });
        // include.push({ model: this.Models.VendorMaster, required: false });
        // // include.push({ model: this.Models.ItemMaster, required: false });
        // include.push({
        //     model: this.Models.Grn, attributes: ['GrnId', 'GrnNumber'], required: false
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockSerialItemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockSerialItemFilters.ItemMasterId:
                        //where['ItemMasterId'] = param.Value;
                        (where as any)[Op.and] = [
                            { ItemMasterId: param.Value },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    // case StockSerialItemFilters.ItemMasterId:
                    //     where['ItemMasterId'] = param.Value;
                    //     break;
                    case StockSerialItemFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ExpiryDate:
                        where['ExpiryDate'] = { [Op.between]: param.Value || '' };
                        break;
                    case StockSerialItemFilters.FromDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.gte] = param.Value;
                        break;
                    case StockSerialItemFilters.ToDate:
                        where['ExpiryDate'] = where['ExpiryDate'] || {};
                        (where['ExpiryDate'] as any)[Op.lte] = param.Value;
                        break;
                    case StockSerialItemFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case StockSerialItemFilters.ProductTypeId:
                        producttypeWhere['ProductTypeId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.GenericId:
                        producttypeWhere['GenericId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.Quantity:
                        where['Quantity'] = { [Op.gt]: param.Value };
                        break;
                    case StockSerialItemFilters.CategoryId:
                        producttypeWhere['CategoryId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.CurrentExpiry:
                        where['ExpiryDate'] = { [Op.gt]: param.Value };
                        break;
                    case StockSerialItemFilters.ActiveStatusId:
                        producttypeWhere['ActiveStatusId'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.IsBillable:
                        producttypeWhere['IsBillable'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.IsConsignment:
                        producttypeWhere['IsConsignment'] = param.Value;
                        isProductTypeRequired = true;
                        break;
                    case StockSerialItemFilters.BarcodeNo:
                        (where as any)[Op.or] = [{ BarcodeNo: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case StockSerialItemFilters.Code:
                        (where as any)[Op.or] = [
                            { ItemCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { ItemName: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    case StockSerialItemFilters.StoreMaster:
                        //where['ItemMasterId'] = param.Value;
                        (where as any)[Op.and] = [
                            { StoreMasterId: param.Value },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    case StockSerialItemFilters.StoreMasters:
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        //where['ItemMasterId'] = param.Value;
                        (where as any) [Op.and] = [
                            { StoreMasterId: { [Op.in]: paramArr } },
                            { Quantity: { [Op.gt]: 0 } }
                        ];
                        break;
                    case StockSerialItemFilters.ItemMaster:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['Id', 'ItemCode', 'ItemName', 'ProductTypeId'],
            required: isProductTypeRequired,
            where: producttypeWhere,
            include: [
                { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] },
            ]
        });
        order.push(['ItemName', 'Asc']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetStockSummaryByProductGst(req: BaseRequest): Promise<any> {
        let GSTGroup: { [id: number]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster,
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        let ProductGroupJoin: any = {
            model: this.Models.ProductType,
            attributes: ['ProductTypeName'],
            required: true,
        };
        let overalltaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.in]: [1, 7, 8, 11, 12] },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (overalltaxamountInstance) {
            let groupbills = _.groupBy(overalltaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = -1;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        let zerotaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.eq]: 1 },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (zerotaxamountInstance) {
            let groupbills = _.groupBy(zerotaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = bills.GstId;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        let fivetaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.eq]: 11 },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (fivetaxamountInstance) {
            let groupbills = _.groupBy(fivetaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = bills.GstId;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        let twelvetaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.eq]: 7 },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (twelvetaxamountInstance) {
            let groupbills = _.groupBy(twelvetaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = bills.GstId;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        let eighteentaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.eq]: 8 },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (eighteentaxamountInstance) {
            let groupbills = _.groupBy(eighteentaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = bills.GstId;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        let tweentyeighttaxamountInstance: any = await this.FindAll({
            attributes: ['GstPercentage', 'Quantity', 'GstAmount', 'GstId', 'Ucp', 'Mrp', 'PurchasePrice', 'ExpiryDate'],
            where: {
                Quantity: { [Op.gt]: 0 },
                GstId: { [Op.eq]: 12 },
                ExpiryDate: { [Op.gte]: new Date() }

            },
            include: [GSTGroupJoin, {
                model: this.Models.ItemMaster,
                attributes: ['Id', 'ProductTypeId', 'ActiveStatusId', 'IsActive'],
                where: {
                    ActiveStatusId: 2,
                    IsActive: true,
                    // ProductTypeId: { '$gt': 0 }
                },
                required: true,
                include: [ProductGroupJoin]
            }],
        });
        if (tweentyeighttaxamountInstance) {
            let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'ItemMaster.ProductTypeId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let ProductName: any = '';
                let NetAmountBeforeGST: number = 0;
                let NetAmount: number = 0;
                let GSTAmount: number = 0;
                let GSTId: number = 0;
                // let Quantity: number = 0;
                let GSTPercentage: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    let itemmaster = bills.ItemMaster;
                    ProductName = itemmaster.ProductType.ProductTypeName;
                    // Quantity += bills.Quantity;
                    NetAmount += (bills.Quantity * bills.Ucp);
                    GSTAmount += bills.GstAmount;
                    NetAmountBeforeGST += (bills.Quantity * bills.PurchasePrice);
                    GSTId = bills.GstId;
                    GSTPercentage = bills.GstPercentage;
                    GSTGroup[GSTId] = GSTGroup[GSTId] || [];
                }
                let info = {
                    'NetAmountBeforeGST': NetAmountBeforeGST,
                    'NetAmount': NetAmount,
                    'GSTAmount': GSTAmount,
                    'GSTId': GSTId,
                    'GSTPercentage': GSTPercentage,
                    'ProductName': ProductName
                };
                GSTGroup[GSTId].push(info);
            }
        }
        return GSTGroup;
    }
    public async GetStockSerialItemsforNonMovements(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let stockserialitems: any = [];
        stockserialitems = await this.GetStockSerialItems(apiReq);
        let StockItems: any = [];
        let stockserialData = stockserialitems.Data;

        for (let idx in stockserialData) {
            let stockeditems = stockserialData[idx];
            let stockMovBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
            let opbillamountcashInstance: any = await stockMovBO.FindAll({
                where: {
                    TransactionDate: { [Op.gt]: FromDate, [Op.lte]: ToDate },
                    TransactionTypeId: { [Op.notIn]: [3] },
                    ItemMasterId: { [Op.eq]: stockeditems.ItemMasterId },
                },
            });
            if (opbillamountcashInstance.length === 0) {
                StockItems.push(stockeditems);
            }
        }
        return StockItems;
    }

    public async DeleteStockSerialItem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ManageStockSerials(serialitem: StockSerialItemAttributes): Promise<boolean> {
        serialitem.Id = serialitem.Id || 0;
        if (serialitem.Status === 2 && serialitem.Id !== 0) {
            await this.MarkAsDelete(serialitem.Id);
        } else if (serialitem.Id === 0) {
            await this.Save(serialitem);
        } else if (serialitem.Id > 0) {
            await this.Update(serialitem);
        }

        return true;
    }

    public async ManageSerialItems(TransactionType: number, stockitem: any, serialDetails: Array<any>): Promise<boolean> {
        await Promise.all(serialDetails.map((detail: any) => {
            return (async (sd) => {
                await this.ManageSerialItem(TransactionType, stockitem, sd);
            })(detail);
        }));
        return true;
    }

    public async ManageSerialItem(TransactionType: number, stockitem: any, serialDetail: any): Promise<any> {
        let serialitem = {};
        try {
            if (TransactionType === 1) {
                if (serialDetail.IsMultiUse) {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: 'OSE123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: stockitem.ItemCode,
                        ItemName: stockitem.ItemName,
                        FacilityId: stockitem.FacilityId,
                        BatchId: serialDetail.BatchId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        BarcodeNo: serialDetail.BarCodeId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: Number(serialDetail.TotalConversionQuantity),
                        Ucp: serialDetail.UnitCostPrice,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: (serialDetail.MrPrice) / (serialDetail.NoOfTransactions),
                        TotalTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalConversionQuantity),
                        ConsumedTransactions: 0,
                        PendingTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalConversionQuantity),
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: 0,
                        StockEntryId: serialDetail.StockEntryId,
                        StockEntryDetailId: serialDetail.Id
                    };
                } else {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: 'OSE123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: stockitem.ItemCode,
                        ItemName: stockitem.ItemName,
                        FacilityId: stockitem.FacilityId,
                        BatchId: serialDetail.BatchId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        BarcodeNo: serialDetail.BarCodeId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: Number(serialDetail.TotalConversionQuantity),
                        Ucp: serialDetail.UnitCostPrice,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: serialDetail.MrPrice,
                        TotalTransactions: 0,
                        ConsumedTransactions: 0,
                        PendingTransactions: 0,
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: 0,
                        StockEntryId: serialDetail.StockEntryId,
                        StockEntryDetailId: serialDetail.Id
                    };
                }
                let oseresult = await this.Save(serialitem as any);
                serialDetail.StockSerialItemId = oseresult.dataValues.Id;
            } else if (TransactionType === 3) {
                var ucp = 0;
                if (serialDetail.NetAmount && serialDetail.NetAmount > 0) {
                    if (serialDetail.TotalQuantityAfterConversion > 0) {
                        ucp = (serialDetail.NetAmount) / (serialDetail.TotalQuantityAfterConversion);
                    } else {
                        ucp = (serialDetail.UnitCostPrice || 0);
                    }
                } else {
                    ucp = (serialDetail.UnitCostPrice || 0);
                }
                if (serialDetail.IsReusable) {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: 'OSE123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: stockitem.ItemCode,
                        ItemName: stockitem.ItemName,
                        FacilityId: stockitem.FacilityId,
                        BatchId: serialDetail.BatchId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        BarcodeNo: serialDetail.BarCodeId || serialDetail.StockEntryId + '-' + serialDetail.Id,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: Number(serialDetail.MinQtyConv),
                        UomPrice: (serialDetail.UomPrice) / (serialDetail.Min),
                        PurchasePrice: (serialDetail.PurchasePrice) / (serialDetail.Min),
                        // Ucp: (serialDetail.UnitCostPrice) / (serialDetail.Min),
                        Ucp: ucp / (serialDetail.Min),
                        Mrp: (serialDetail.MrPrice) / (serialDetail.Min),
                        MarginPrice: (serialDetail.MrPrice) / (serialDetail.Min),
                        IsMultiUse: serialDetail.IsMultiUse,
                        // ConversionMrp: (serialDetail.MrPrice) / (serialDetail.NoOfTransactions),
                        // TotalTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalConversionQuantity),
                        // ConsumedTransactions: 0,
                        // PendingTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalConversionQuantity),
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: 0,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.Id,
                        IsConsignment: stockitem.IsConsignment
                    };
                } else if (serialDetail.IsMultiUse) {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: 'GRN123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: serialDetail.ItemCode,
                        ItemName: serialDetail.ItemName,
                        FacilityId: stockitem.FacilityId,
                        BatchId: serialDetail.BatchId || serialDetail.GrnId + '-' + serialDetail.Id,
                        BarcodeNo: serialDetail.BarCodeId || serialDetail.GrnId + '-' + serialDetail.Id,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: serialDetail.TotalQuantityAfterConversion,
                        UomPrice: serialDetail.UomPrice,
                        PurchasePrice: serialDetail.PurchasePrice,
                        DiscountModeId: serialDetail.DiscountModeId,
                        Discount: serialDetail.Discount,
                        UomDiscountAmount: serialDetail.UomDiscountAmount,
                        DiscountAmount: serialDetail.DiscountAmount,
                        UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                        PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                        // Ucp: serialDetail.UnitCostPrice,
                        Ucp: ucp,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: (serialDetail.MrPrice) / (serialDetail.NoOfTransactions),
                        TotalTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalQuantityAfterConversion),
                        ConsumedTransactions: 0,
                        PendingTransactions: Number(serialDetail.NoOfTransactions) * Number(serialDetail.TotalQuantityAfterConversion),
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        GstAmount: serialDetail.GstAmount,
                        UnitGstAmount: serialDetail.UnitGstAmount,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        InGstAmount: serialDetail.InGstAmount,
                        UnitInGstAmount: serialDetail.UnitInGstAmount,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        CGstAmount: serialDetail.CGstAmount,
                        UnitCGstAmount: serialDetail.UnitCGstAmount,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        SGstAmount: serialDetail.SGstAmount,
                        UnitSGstAmount: serialDetail.UnitSGstAmount,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ConversionQuantity: serialDetail.ConversionQuantity,
                        IsExpiry: serialDetail.IsExpiryRequired,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.Id
                    };
                } else {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: 'GRN123',
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: serialDetail.ItemCode,
                        ItemName: serialDetail.ItemName,
                        FacilityId: stockitem.FacilityId,
                        BatchId: serialDetail.BatchId || serialDetail.GrnId + '-' + serialDetail.Id,
                        BarcodeNo: serialDetail.BarCodeId || serialDetail.GrnId + '-' + serialDetail.Id,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: serialDetail.TotalQuantityAfterConversion,
                        UomPrice: serialDetail.UomPrice,
                        PurchasePrice: serialDetail.PurchasePrice,
                        DiscountModeId: serialDetail.DiscountModeId,
                        Discount: serialDetail.Discount,
                        UomDiscountAmount: serialDetail.UomDiscountAmount,
                        DiscountAmount: serialDetail.DiscountAmount,
                        UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                        PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                        // Ucp: serialDetail.UnitCostPrice,
                        Ucp: ucp,
                        Mrp: serialDetail.MrPrice,
                        IsMultiUse: serialDetail.IsMultiUse,
                        ConversionMrp: serialDetail.MrPrice,
                        TotalTransactions: 0,
                        ConsumedTransactions: 0,
                        PendingTransactions: 0,
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        GstAmount: serialDetail.GstAmount,
                        UnitGstAmount: serialDetail.UnitGstAmount,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        InGstAmount: serialDetail.InGstAmount,
                        UnitInGstAmount: serialDetail.UnitInGstAmount,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        CGstAmount: serialDetail.CGstAmount,
                        UnitCGstAmount: serialDetail.UnitCGstAmount,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        SGstAmount: serialDetail.SGstAmount,
                        UnitSGstAmount: serialDetail.UnitSGstAmount,
                        PurchaseUomId: serialDetail.BaseUomId,
                        BaseUomId: serialDetail.BaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ConversionQuantity: serialDetail.ConversionQuantity,
                        IsExpiry: serialDetail.IsExpiryRequired,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnId: serialDetail.GrnId,
                        GrnDetailId: serialDetail.Id,
                        IsConsignment: stockitem.IsConsignment
                    };
                }
                if (await this.IsAlreadyExist(serialitem) <= -1) return -1;
                let grnresult = await this.Save(serialitem as any);
                serialDetail.StockSerialItemId = grnresult.dataValues.Id;
            } else if (TransactionType === 5) {
                var PrnQty = 0;
                if (serialDetail.PrnTypeId === 2) {
                    PrnQty = Number(serialDetail.TotalQuantityAfterConversion);
                } else {
                    PrnQty = Number(serialDetail.PrnQuantity);
                }

                if (serialDetail.StockSerialItemId > 0) {
                    let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                    if (existingserialitem !== null) {
                        if (existingserialitem.Quantity >= PrnQty) {
                            existingserialitem.Quantity = existingserialitem.Quantity - PrnQty;
                            existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                            await this.Update(existingserialitem);
                        } else {
                            // existingserialitem.Quantity = 0;
                            existingserialitem.Quantity = existingserialitem.Quantity - PrnQty;
                            if (existingserialitem.Quantity < 0) {
                                throw { message: 'Batch Quantity not available.. Please check' };
                            }
                            existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                            await this.Update(existingserialitem);
                        }
                    } else {
                        throw { code: 'NO_EXISTING_STOCK_SERIAL_ITEM' };
                    }
                } else {
                    let ExistingSerialTtem = await this.GetStockSerialItemIdByFilter({
                        Id: 0,
                        Data: {
                            StoreMasterId: stockitem.StoreMasterId,
                            ItemMasterId: stockitem.ItemMasterId,
                            BatchId: serialDetail.BatchId,
                            GrnId: serialDetail.GrnId
                        }
                    });
                    if (ExistingSerialTtem !== null) {
                        if (ExistingSerialTtem.Quantity >= PrnQty) {
                            ExistingSerialTtem.Quantity = ExistingSerialTtem.Quantity - PrnQty;
                            ExistingSerialTtem.BarcodeNo = ExistingSerialTtem.BarcodeNo;
                            await this.Update(ExistingSerialTtem);
                        } else {
                            // ExistingSerialTtem.Quantity = 0;
                            ExistingSerialTtem.Quantity = ExistingSerialTtem.Quantity - PrnQty;
                            if (ExistingSerialTtem.Quantity < 0) {
                                throw { message: 'Batch Quantity not available.. Please check' };
                            }
                            ExistingSerialTtem.BarcodeNo = ExistingSerialTtem.BarcodeNo;
                            await this.Update(ExistingSerialTtem);
                        }
                    } else {
                        throw { code: 'NO_EXISTING_STOCK_SERIAL_ITEM' };
                    }
                }
            } else if (TransactionType === 9) {
                /*
                let ExistingSerialsApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: StockSerialItemFilters.ItemMasterId, Value: stockitem.ItemMasterId },
                    { Key: StockSerialItemFilters.StoreMasterId, Value: stockitem.StoreMasterId }
                    ]
                };
                let StockSerialDetails = await this.GetStockSerialItems(ExistingSerialsApiReq);
                await this.ManageSerialBatches(StockSerialDetails.Data, stockitem.Quantity);
                */
                // let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                let existingserialitem = await this.GetStockSerialItemIdByStore({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: serialDetail.ItemMasterId,
                        StockSerialItemId: serialDetail.StockSerialItemId
                    }
                });
                if (existingserialitem !== null) {
                    if (existingserialitem.Quantity >= Number(serialDetail.TransferedQuantity)) {
                        existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.TransferedQuantity);
                    } else {
                        existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.TransferedQuantity);
                        if (existingserialitem.Quantity < 0) {
                            throw { message: 'Batch Quantity not available.. Please check' };
                        }
                        existingserialitem.Rev = serialDetail.StockSerialItemRev;
                    }
                    // existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.TransferedQuantity);
                    // existingserialitem.Rev = serialDetail.StockSerialItemRev;
                    existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                    await this.Update(existingserialitem);
                } else {
                    // serialitem = {
                    //     StockItemId: stockitem.Id,
                    //     StoreMasterId: stockitem.StoreMasterId,
                    //     BarCodeId: serialDetail.BarCodeId,
                    //     ItemMasterId: serialDetail.ItemMasterId,
                    //     ItemCode: serialDetail.ItemCode,
                    //     ItemName: serialDetail.ItemName,
                    //     BatchId: serialDetail.BatchId,
                    //     BarcodeNo: serialDetail.BarcodeNo,
                    //     ExpiryDate: serialDetail.ExpiryDate,
                    //     Quantity: serialDetail.AcceptedQuantity,
                    //     UomPrice: serialDetail.UomPrice,
                    //     PurchasePrice: serialDetail.PurchasePrice,
                    //     DiscountModeId: serialDetail.DiscountModeId,
                    //     Discount: serialDetail.Discount,
                    //     UomDiscountAmount: serialDetail.UomDiscountAmount,
                    //     DiscountAmount: serialDetail.DiscountAmount,
                    //     UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                    //     PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                    //     Ucp: serialDetail.Ucp,
                    //     Mrp: serialDetail.Mrp,
                    //     MarginPrice: serialDetail.Mrp,
                    //     GstId: serialDetail.GstId,
                    //     GstPercentage: serialDetail.GstPercentage,
                    //     GstAmount: serialDetail.GstAmount,
                    //     UnitGstAmount: serialDetail.UnitGstAmount,
                    //     InGstId: serialDetail.InGstId,
                    //     InGstPercentage: serialDetail.InGstPercentage,
                    //     InGstAmount: serialDetail.InGstAmount,
                    //     UnitInGstAmount: serialDetail.UnitInGstAmount,
                    //     CGstId: serialDetail.CGstId,
                    //     CGstPercentage: serialDetail.CGstPercentage,
                    //     CGstAmount: serialDetail.CGstAmount,
                    //     UnitCGstAmount: serialDetail.UnitCGstAmount,
                    //     SGstId: serialDetail.SGstId,
                    //     SGstPercentage: serialDetail.SGstPercentage,
                    //     SGstAmount: serialDetail.SGstAmount,
                    //     UnitSGstAmount: serialDetail.UnitSGstAmount,
                    //     BaseUomId: serialDetail.BaseUomId,
                    //     PurchaseUomId: serialDetail.PurchaseUomId,
                    //     SaleUomId: serialDetail.SaleUomId,
                    //     ConversionQuantity: serialDetail.ConversionQuantity,
                    //     IsExpiry: serialDetail.IsExpiry,
                    //     IsSuspended: serialDetail.IsSuspended,
                    //     ManufacturerId: serialDetail.ManufacturerId,
                    //     VendorMasterId: serialDetail.VendorMasterId,
                    //     GrnDetailId: serialDetail.GrnDetailId,
                    //     GrnId: serialDetail.GrnId,
                    //     StockEntryDetailId: serialDetail.StockEntryDetailId,
                    //     StockEntryId: serialDetail.StockEntryId,
                    //     StockTransferId: serialDetail.StockTransferId,
                    //     StockTransferDetailId: serialDetail.Id,
                    //     FacilityId: serialDetail.FacilityId,
                    //     OrgId: serialDetail.OrgId,
                    //     Status: 1
                    // };
                    // await this.Save(serialitem as any);
                }
            } else if (TransactionType === 13) {
                let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                if (existingserialitem.Quantity >= serialDetail.QtyConsumed) {
                    existingserialitem.Quantity = Number(existingserialitem.Quantity) - Number(serialDetail.QtyConsumed);
                    // existingserialitem.Rev = serialDetail.StockSerialItemRev;
                    // existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                } else {
                    // existingserialitem.Quantity = 0;
                    existingserialitem.Quantity = Number(existingserialitem.Quantity) - Number(serialDetail.QtyConsumed);
                    if (existingserialitem.Quantity < 0) {
                        throw { message: 'Batch Quantity not available.. Please check' };
                    }
                    existingserialitem.Rev = serialDetail.StockSerialItemRev;
                    // existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                }
                existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                await this.Update(existingserialitem);
            } else if (TransactionType === 15) {
                let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                existingserialitem.Quantity = Number(existingserialitem.Quantity);
                existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                // if (serialDetail.AdjustmentTypeId === 1) {
                //     existingserialitem.Quantity = Number(existingserialitem.Quantity) + Number(serialDetail.QtyAdjusted);
                // } else {
                //     existingserialitem.Quantity = Number(existingserialitem.Quantity) - Number(serialDetail.QtyAdjusted);
                // }
                await this.Update(existingserialitem);
            } else if (TransactionType === 19) {

                // let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                let existingserialitem = await this.GetStockSerialItemIdByStore({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: serialDetail.ItemMasterId,
                        StockSerialItemId: serialDetail.StockSerialItemId
                    }
                });
                if (existingserialitem !== null) {
                    if (existingserialitem.Quantity >= Number(serialDetail.Quantity)) {
                        existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.DispensedQuantity);
                        existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                    } else {
                        existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.DispensedQuantity);
                        if (existingserialitem.Quantity < 0) {
                            throw { message: 'Batch Quantity not available.. Please check' };
                        }
                        existingserialitem.Rev = serialDetail.StockSerialItemRev;
                        existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                    }
                    await this.Update(existingserialitem);
                } else {
                    serialitem = {
                        StockItemId: stockitem.Id,
                        StoreMasterId: stockitem.StoreMasterId,
                        BarCodeId: serialDetail.BarCodeId,
                        ItemMasterId: serialDetail.ItemMasterId,
                        ItemCode: serialDetail.ItemCode,
                        ItemName: serialDetail.ItemName,
                        BatchId: serialDetail.BatchId,
                        BarcodeNo: serialDetail.BarcodeNo,
                        ExpiryDate: serialDetail.ExpiryDate,
                        Quantity: serialDetail.AcceptedQuantity,
                        UomPrice: serialDetail.UomPrice,
                        PurchasePrice: serialDetail.PurchasePrice,
                        DiscountModeId: serialDetail.DiscountModeId,
                        Discount: serialDetail.Discount,
                        UomDiscountAmount: serialDetail.UomDiscountAmount,
                        DiscountAmount: serialDetail.DiscountAmount,
                        UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                        PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                        Ucp: serialDetail.Ucp,
                        Mrp: serialDetail.Mrp,
                        MarginPrice: serialDetail.Mrp,
                        GstId: serialDetail.GstId,
                        GstPercentage: serialDetail.GstPercentage,
                        GstAmount: serialDetail.GstAmount,
                        UnitGstAmount: serialDetail.UnitGstAmount,
                        InGstId: serialDetail.InGstId,
                        InGstPercentage: serialDetail.InGstPercentage,
                        InGstAmount: serialDetail.InGstAmount,
                        UnitInGstAmount: serialDetail.UnitInGstAmount,
                        CGstId: serialDetail.CGstId,
                        CGstPercentage: serialDetail.CGstPercentage,
                        CGstAmount: serialDetail.CGstAmount,
                        UnitCGstAmount: serialDetail.UnitCGstAmount,
                        SGstId: serialDetail.SGstId,
                        SGstPercentage: serialDetail.SGstPercentage,
                        SGstAmount: serialDetail.SGstAmount,
                        UnitSGstAmount: serialDetail.UnitSGstAmount,
                        BaseUomId: serialDetail.BaseUomId,
                        PurchaseUomId: serialDetail.PurchaseUomId,
                        SaleUomId: serialDetail.SaleUomId,
                        ConversionQuantity: serialDetail.ConversionQuantity,
                        IsExpiry: serialDetail.IsExpiry,
                        IsSuspended: serialDetail.IsSuspended,
                        ManufacturerId: serialDetail.ManufacturerId,
                        VendorMasterId: serialDetail.VendorMasterId,
                        GrnDetailId: serialDetail.GrnDetailId,
                        GrnId: serialDetail.GrnId,
                        StockEntryDetailId: serialDetail.StockEntryDetailId,
                        StockEntryId: serialDetail.StockEntryId,
                        StockTransferId: serialDetail.StockTransferId,
                        StockTransferDetailId: serialDetail.Id,
                        FacilityId: serialDetail.FacilityId,
                        OrgId: serialDetail.OrgId,
                        Status: 1
                    };
                    await this.Save(serialitem as any);
                }
            } else if (TransactionType === 20) {
                let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                existingserialitem.Quantity = existingserialitem.Quantity + Number(serialDetail.AcceptedQuantity);
                existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                //existingserialitem.Rev = serialDetail.StockSerialItemRev;
                await this.Update(existingserialitem);
            } else if (TransactionType === 21) {
                // try {
                // let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                let existingserialitem = await this.GetStockSerialItemIdByStore({
                    Id: 0,
                    Data: {
                        StoreMasterId: stockitem.StoreMasterId,
                        ItemMasterId: serialDetail.ItemMasterId,
                        StockSerialItemId: serialDetail.StockSerialItemId
                    }
                });
                if (existingserialitem !== null) {
                    if (existingserialitem.IsMultiUse === true) {
                        if (serialDetail.TotalTransactions >= Number(serialDetail.Quantity))
                            if (!serialDetail.PendingTransactions) {
                                existingserialitem.Quantity = 0;
                                existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                            } else {
                                if (Number(serialDetail.ConsumedPerTransactions) === Number(serialDetail.ItemPossibleTransactions)) {
                                    existingserialitem.Quantity = existingserialitem.Quantity - 1;
                                    existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                    existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                    existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                } else if (Number(serialDetail.ConsumedPerTransactions) > Number(serialDetail.ItemPossibleTransactions)) {
                                    let RedQty = Number(serialDetail.ConsumedPerTransactions) /
                                        Number(serialDetail.ItemPossibleTransactions);
                                    console.log(Math.trunc(RedQty));
                                    let Qty = Math.trunc(RedQty);
                                    existingserialitem.Quantity = existingserialitem.Quantity - Qty;
                                    existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                    existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                    existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                } else if (Number(serialDetail.ConsumedPerTransactions) < Number(serialDetail.ItemPossibleTransactions)) {
                                    if (Number(serialDetail.ConsumedTransactions) === Number(serialDetail.ItemPossibleTransactions)) {
                                        existingserialitem.Quantity = existingserialitem.Quantity - 1;
                                        existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                        existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                        existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                    } else if (Number(serialDetail.ConsumedTransactions) > Number(serialDetail.ItemPossibleTransactions)) {
                                        let ConsumeTrans =
                                            Number(serialDetail.ConsumedTransactions) % Number(serialDetail.ItemPossibleTransactions);
                                        let CTrans = Math.trunc(ConsumeTrans);
                                        if (CTrans === 0 || 1) {
                                            existingserialitem.Quantity = existingserialitem.Quantity - 1;
                                            existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                            existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                            existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                        } else {
                                            existingserialitem.Quantity = existingserialitem.Quantity;
                                            existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                            existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                            existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                        }
                                    } else if (Number(serialDetail.ConsumedTransactions) < Number(serialDetail.ItemPossibleTransactions)) {
                                        existingserialitem.Quantity = existingserialitem.Quantity;
                                        existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                                        existingserialitem.ConsumedTransactions = serialDetail.ConsumedTransactions;
                                        existingserialitem.PendingTransactions = serialDetail.PendingTransactions;
                                    }
                                }
                            }
                    } else {
                        if (existingserialitem.Quantity >= Number(serialDetail.Quantity)) {
                            existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.Quantity);
                        } else {
                            existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.Quantity);
                            if (existingserialitem.Quantity < 0) {
                                throw { message: 'Batch Quantity not available.. Please check' };
                            }
                            existingserialitem.Rev = serialDetail.StockSerialItemRev;
                        }

                    }
                    existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;

                    await this.Update(existingserialitem);
                } else {
                    // serialitem = {
                    //     StockItemId: stockitem.Id,
                    //     StoreMasterId: stockitem.StoreMasterId,
                    //     BarCodeId: serialDetail.BarCodeId,
                    //     ItemMasterId: serialDetail.ItemMasterId,
                    //     ItemCode: serialDetail.ItemCode,
                    //     ItemName: serialDetail.ItemName,
                    //     BatchId: serialDetail.BatchId,
                    //     BarcodeNo: serialDetail.BarcodeNo,
                    //     ExpiryDate: serialDetail.ExpiryDate,
                    //     Quantity: serialDetail.ReturnQuantity,
                    //     UomPrice: serialDetail.UomPrice,
                    //     PurchasePrice: serialDetail.PurchasePrice,
                    //     DiscountModeId: serialDetail.DiscountModeId,
                    //     Discount: serialDetail.Discount,
                    //     UomDiscountAmount: serialDetail.UomDiscountAmount,
                    //     DiscountAmount: serialDetail.DiscountAmount,
                    //     UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                    //     PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                    //     Ucp: serialDetail.Ucp,
                    //     Mrp: serialDetail.Mrp,
                    //     MarginPrice: serialDetail.Mrp,
                    //     GstId: serialDetail.GstId,
                    //     GstPercentage: serialDetail.GstPercentage,
                    //     GstAmount: serialDetail.GstAmount,
                    //     UnitGstAmount: serialDetail.UnitGstAmount,
                    //     InGstId: serialDetail.InGstId,
                    //     InGstPercentage: serialDetail.InGstPercentage,
                    //     InGstAmount: serialDetail.InGstAmount,
                    //     UnitInGstAmount: serialDetail.UnitInGstAmount,
                    //     CGstId: serialDetail.CGstId,
                    //     CGstPercentage: serialDetail.CGstPercentage,
                    //     CGstAmount: serialDetail.CGstAmount,
                    //     UnitCGstAmount: serialDetail.UnitCGstAmount,
                    //     SGstId: serialDetail.SGstId,
                    //     SGstPercentage: serialDetail.SGstPercentage,
                    //     SGstAmount: serialDetail.SGstAmount,
                    //     UnitSGstAmount: serialDetail.UnitSGstAmount,
                    //     BaseUomId: serialDetail.BaseUomId,
                    //     PurchaseUomId: serialDetail.PurchaseUomId,
                    //     SaleUomId: serialDetail.SaleUomId,
                    //     ConversionQuantity: serialDetail.ConversionQuantity,
                    //     IsExpiry: serialDetail.IsExpiry,
                    //     IsSuspended: serialDetail.IsSuspended,
                    //     ManufacturerId: serialDetail.ManufacturerId,
                    //     VendorMasterId: serialDetail.VendorMasterId,
                    //     GrnDetailId: serialDetail.GrnDetailId,
                    //     GrnId: serialDetail.GrnId,
                    //     StockEntryDetailId: serialDetail.StockEntryDetailId,
                    //     StockEntryId: serialDetail.StockEntryId,
                    //     StockTransferId: serialDetail.StockTransferId,
                    //     StockTransferDetailId: serialDetail.Id,
                    //     FacilityId: serialDetail.FacilityId,
                    //     OrgId: serialDetail.OrgId,
                    //     Status: 1
                    // };
                    // await this.Save(serialitem as any);
                }

            } else if (TransactionType === 22) {
                let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                if (serialDetail.IsMultiUse) {
                    if (Number(serialDetail.NoOfTransactions) === Number(serialDetail.ConsumedTransactions)) {
                        existingserialitem.Quantity = existingserialitem.Quantity + 1;
                        existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                        existingserialitem.ConsumedTransactions =
                            Number(existingserialitem.ConsumedTransactions) - (serialDetail.ConsumedTransactions);
                        existingserialitem.PendingTransactions =
                            Number(existingserialitem.PendingTransactions) + (serialDetail.PendingTransactions);
                    } else if (Number(serialDetail.NoOfTransactions) > Number(serialDetail.ConsumedTransactions)) {
                        existingserialitem.Quantity = existingserialitem.Quantity;
                        existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                        existingserialitem.ConsumedTransactions =
                            Number(existingserialitem.ConsumedTransactions) - (serialDetail.ConsumedTransactions);
                        existingserialitem.PendingTransactions =
                            Number(existingserialitem.PendingTransactions) + (serialDetail.PendingTransactions);
                    } else if (Number(serialDetail.NoOfTransactions) < Number(serialDetail.ConsumedTransactions)) {
                        existingserialitem.Quantity = existingserialitem.Quantity + 1;
                        existingserialitem.TotalTransactions = serialDetail.TotalTransactions;
                        existingserialitem.ConsumedTransactions =
                            Number(existingserialitem.ConsumedTransactions) - (serialDetail.ConsumedTransactions);
                        existingserialitem.PendingTransactions =
                            Number(existingserialitem.PendingTransactions) + (serialDetail.PendingTransactions);
                    }
                } else {
                    existingserialitem.Quantity = existingserialitem.Quantity + serialDetail.ReturnQuantity;
                }
                console.log('**********serialexistingstockitem***********', existingserialitem);
                await this.Update(existingserialitem);

            } else if (TransactionType === 23) {
                serialitem = {
                    StockItemId: stockitem.Id,
                    StoreMasterId: stockitem.StoreMasterId,
                    BarCodeId: serialDetail.BarCodeId,
                    ItemMasterId: serialDetail.ItemMasterId,
                    ItemCode: serialDetail.ItemCode,
                    ItemName: serialDetail.ItemName,
                    BatchId: serialDetail.BatchId,
                    BarcodeNo: serialDetail.BarcodeNo,
                    ExpiryDate: serialDetail.ExpiryDate,
                    // Quantity: serialDetail.TransferedQuantity,
                    Quantity: serialDetail.AcceptedQuantity,
                    UomPrice: serialDetail.UomPrice,
                    PurchasePrice: serialDetail.PurchasePrice,
                    DiscountModeId: serialDetail.DiscountModeId,
                    Discount: serialDetail.Discount,
                    UomDiscountAmount: serialDetail.UomDiscountAmount,
                    DiscountAmount: serialDetail.DiscountAmount,
                    UomPriceAfterDiscount: serialDetail.UomPriceAfterDiscount,
                    PurchasePriceAfterDiscount: serialDetail.PurchasePriceAfterDiscount,
                    Ucp: serialDetail.Ucp,
                    Mrp: serialDetail.Mrp,
                    GstId: serialDetail.GstId,
                    GstPercentage: serialDetail.GstPercentage,
                    GstAmount: serialDetail.GstAmount,
                    UnitGstAmount: serialDetail.UnitGstAmount,
                    InGstId: serialDetail.InGstId,
                    InGstPercentage: serialDetail.InGstPercentage,
                    InGstAmount: serialDetail.InGstAmount,
                    UnitInGstAmount: serialDetail.UnitInGstAmount,
                    CGstId: serialDetail.CGstId,
                    CGstPercentage: serialDetail.CGstPercentage,
                    CGstAmount: serialDetail.CGstAmount,
                    UnitCGstAmount: serialDetail.UnitCGstAmount,
                    SGstId: serialDetail.SGstId,
                    SGstPercentage: serialDetail.SGstPercentage,
                    SGstAmount: serialDetail.SGstAmount,
                    UnitSGstAmount: serialDetail.UnitSGstAmount,
                    BaseUomId: serialDetail.BaseUomId,
                    PurchaseUomId: serialDetail.PurchaseUomId,
                    SaleUomId: serialDetail.SaleUomId,
                    ConversionQuantity: serialDetail.ConversionQuantity,
                    IsExpiry: serialDetail.IsExpiry,
                    IsSuspended: serialDetail.IsSuspended,
                    ManufacturerId: serialDetail.ManufacturerId,
                    VendorMasterId: serialDetail.VendorMasterId,
                    GrnDetailId: serialDetail.GrnDetailId,
                    GrnId: serialDetail.GrnId,
                    StockEntryDetailId: serialDetail.StockEntryDetailId,
                    StockEntryId: serialDetail.StockEntryId,
                    StockTransferId: serialDetail.StockTransferId,
                    StockTransferDetailId: serialDetail.Id,
                    FacilityId: serialDetail.FacilityId,
                    OrgId: serialDetail.OrgId,
                    Status: 1
                };
                await this.Save(serialitem as any);
            } else if (TransactionType === 24) {
                let existingserialitem = await this.GetStockSerialItemById({ Id: serialDetail.StockSerialItemId });
                if (existingserialitem.Quantity >= Number(serialDetail.Quantity)) {
                    existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.Quantity);
                    existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                } else {
                    existingserialitem.Quantity = existingserialitem.Quantity - Number(serialDetail.Quantity);
                    if (existingserialitem.Quantity < 0) {
                        throw { message: 'Batch Quantity not available.. Please check' };
                    }
                    existingserialitem.BarcodeNo = existingserialitem.BarcodeNo;
                    existingserialitem.Rev = serialDetail.StockSerialItemRev;
                }
                await this.Update(existingserialitem);
            }
        } catch (ex) {
            console.log(ex);
            throw { message: 'Some Network Issue.. Please try again' };
        }
        return true;
    }

    public async ManageSerialBatches(StockSerialDetails: StockSerialItemAttributes[], GivenQty: number): Promise<boolean> {
        StockSerialDetails = StockSerialDetails || [];
        let promises: Array<any> = [];
        do {
            StockSerialDetails.forEach(detail => {
                if (GivenQty > 0) {
                    if (detail.Quantity >= GivenQty) {
                        detail.Quantity = detail.Quantity - GivenQty;
                        promises.push(this.Update(detail));
                        GivenQty = 0;
                    } else if (detail.Quantity < GivenQty) {
                        detail.Quantity = 0;
                        GivenQty = GivenQty - detail.Quantity;
                        promises.push(this.Update(detail));
                    }
                }
            });
        } while (GivenQty <= 0);
        await Promise.all(promises);

        return true;
    }

    public async ManageGrnStockSerial(request: any, stockserialitem: StockSerialItemAttributes, detail: any): Promise<boolean> {
        let saveResult: any;
        saveResult = await this.Save(stockserialitem);
        stockserialitem.Id = saveResult.dataValues.Id;
        return true;
    }

    public async ManagePrnStockSerial(request: any, stockserialitem: StockSerialItemAttributes, detail: any): Promise<boolean> {
        if (request.Header.PrnTypeId === 2) {
            let existingstockserialitem = await this.GetStockSerialItemById({ Id: detail.StockSerialItemId });
            existingstockserialitem.Quantity = existingstockserialitem.Quantity - stockserialitem.Quantity;
            await this.Update(existingstockserialitem);
        } else {
            let existingstockserialitem = await this.GetStockSerialItemById({ Id: detail.StockSerialItemId });
            existingstockserialitem.Quantity = existingstockserialitem.Quantity - detail.PrnQuantity;
            await this.Update(existingstockserialitem);
        }

        let smBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        await smBO.ManagePrnStockMovement(request, stockserialitem as any, detail);

        return true;
    }

    public async ManageAdjustedStockSerial(StockAdjustmentId: number, request: any,
        stockserialitem: StockSerialItemAttributes, detail: any): Promise<boolean> {
        let existingstockserialitem = await this.GetStockSerialItemById({ Id: detail.StockSerialItemId });
        existingstockserialitem.Quantity = stockserialitem.Quantity;
        existingstockserialitem.Rev = stockserialitem.Rev;
        await this.Update(existingstockserialitem);

        //let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
        //await stockitemBO.ManageAdjustedStockItem(StockAdjustmentId, request, detail);

        return true;
    }
    public async PrintMedicineExpiryReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let ProductName = apiReq.Data.ProductName;
        let StockSerialItemData = data.Data[0];
        let StockSerial: any = [];
        StockSerialItem.forEach((Detail: any) => {
            let ItemData = Detail;
            ItemData.Value = parseFloat(Detail.Quantity) * parseFloat(Detail.PurchasePrice);
            StockSerial.push(ItemData);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            ProductName: ProductName
        };
        let pdfOption: any = null;
        let key = 'medicineexpiryreport';
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
    public async PrintMedicineExpiredReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let ProductName = apiReq.Data.ProductName;
        let StockSerialItemData = data.Data[0];
        let StockSerial: any = [];
        StockSerialItem.forEach((Detail: any) => {
            let ItemData = Detail;
            ItemData.Value = parseFloat(Detail.Quantity) * parseFloat(Detail.PurchasePrice);
            StockSerial.push(ItemData);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            StoreName: StoreName,
            ProductName: ProductName,
            FromDate: FromDate,
            ToDate: ToDate
        };
        let pdfOption: any = null;
        let key = 'medicineexpiredreport';
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
    public async PrintStockSummaryByProductGst(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let SaleGst: any = [];
        let NetSaleGst: any = [];
        let SalesReq = req;
        SaleGst = await this.GetStockSummaryByProductGst(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(SalesReq.Data.FacilityId, SalesReq.Data.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (SaleGst) {
            let overallsalegst = [];
            let zerosalegst = [];
            let fivesalegst = [];
            let twelvesalegst = [];
            let eighteensalegst = [];
            let twentyeightsalegst = [];
            for (let gstid in SaleGst) {
                if (parseInt(gstid) === -1) {
                    overallsalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 1) {
                    zerosalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 7) {
                    twelvesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 8) {
                    eighteensalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 11) {
                    fivesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 12) {
                    twentyeightsalegst = SaleGst[gstid];
                }

            }

            for (let idx in zerosalegst) {
                let zero_salegst = zerosalegst[idx];
                let Key = '';
                let ZeroNetAmountBeforeGST = 0;
                let ZerGSTAmount = 0;
                Key = zero_salegst.ProductName;
                ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                ZerGSTAmount = zero_salegst.GSTAmount;

                NetSaleGst.push({
                    'Key': Key,
                    'ZeroNetAmountBeforeGST': ZeroNetAmountBeforeGST,
                    'ZerGSTAmount': ZerGSTAmount,
                    'twelveNetAmountBeforeGST': 0.00,
                    'twelveGSTAmount': 0.00,
                    'eighteenNetAmountBeforeGST': 0.00,
                    'eighteenGSTAmount': 0.00,
                    'fiveNetAmountBeforeGST': 0.00,
                    'fiveGSTAmount': 0.00,
                    'twentyeightNetAmountBeforeGST': 0.00,
                    'twentyeightGSTAmount': 0.00,
                    'NetAmountBeforeGST': 0.00,
                    'NetAmount': 0.00,
                    'GSTAmount': 0.00,
                });
            }
            for (let idx in twelvesalegst) {
                let twelve_salegst = twelvesalegst[idx];
                let Key = '';
                let twelveNetAmountBeforeGST = 0;
                let twelveGSTAmount = 0;
                Key = twelve_salegst.ProductName;
                twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                twelveGSTAmount = twelve_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        if (item.twelveNetAmountBeforeGST > 0) {
                            item.twelveNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                        } else {
                            item.twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                        }
                        if (item.twelveGSTAmount > 0) {
                            item.twelveGSTAmount += twelve_salegst.GSTAmount;
                        } else {
                            item.twelveGSTAmount = twelve_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': twelveNetAmountBeforeGST,
                        'twelveGSTAmount': twelveGSTAmount,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,

                    });
            }
            for (let idx in eighteensalegst) {
                let eighteen_salegst = eighteensalegst[idx];
                let Key = '';
                let eighteenNetAmountBeforeGST = 0;
                let eighteenGSTAmount = 0;
                Key = eighteen_salegst.ProductName;
                eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                eighteenGSTAmount = eighteen_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        if (item.eighteenNetAmountBeforeGST > 0) {
                            item.eighteenNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                        } else {
                            item.eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                        }
                        if (item.eighteenGSTAmount > 0) {
                            item.eighteenGSTAmount += eighteen_salegst.GSTAmount;
                        } else {
                            item.eighteenGSTAmount = eighteen_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': eighteenNetAmountBeforeGST,
                        'eighteenGSTAmount': eighteenGSTAmount,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,

                    });
            }
            for (let idx in fivesalegst) {
                let five_salegst = fivesalegst[idx];
                let Key = '';
                let fiveNetAmountBeforeGST = 0;
                let fiveGSTAmount = 0;
                Key = five_salegst.ProductName;
                fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                fiveGSTAmount = five_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        if (item.fiveNetAmountBeforeGST > 0) {
                            item.fiveNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                        } else {
                            item.fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                        }
                        if (item.fiveGSTAmount > 0) {
                            item.fiveGSTAmount += five_salegst.GSTAmount;
                        } else {
                            item.fiveGSTAmount = five_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': fiveNetAmountBeforeGST,
                        'fiveGSTAmount': fiveGSTAmount,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,

                    });
            }
            for (let idx in twentyeightsalegst) {
                let twentyeight_salegst = twentyeightsalegst[idx];
                let Key = '';
                let twentyeightNetAmountBeforeGST = 0;
                let twentyeightGSTAmount = 0;
                Key = twentyeight_salegst.ProductName;
                twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        if (item.twentyeightNetAmountBeforeGST > 0) {
                            item.twentyeightNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                        } else {
                            item.twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                        }
                        if (item.twentyeightGSTAmount > 0) {
                            item.twentyeightGSTAmount += twentyeight_salegst.GSTAmount;
                        } else {
                            item.twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': twentyeightNetAmountBeforeGST,
                        'twentyeightGSTAmount': twentyeightGSTAmount,
                        'NetAmountBeforeGST': 0.00,
                        'NetAmount': 0.00,
                        'GSTAmount': 0.00,

                    });
            }
            for (let idx in overallsalegst) {
                let overall_salegst = overallsalegst[idx];
                let Key = '';
                let NetAmountBeforeGST = 0;
                let NetAmount = 0;
                let GSTAmount = 0;
                Key = overall_salegst.ProductName;
                NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                NetAmount = overall_salegst.NetAmount;
                GSTAmount = overall_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        if (item.NetAmountBeforeGST > 0) {
                            item.NetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                        } else {
                            item.NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                        }
                        if (item.NetAmount > 0) {
                            item.NetAmount += overall_salegst.NetAmount;
                        } else {
                            item.NetAmount = overall_salegst.NetAmount;
                        }
                        if (item.GSTAmount > 0) {
                            item.GSTAmount += overall_salegst.GSTAmount;
                        } else {
                            item.GSTAmount = overall_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': 0.00,
                        'ZerGSTAmount': 0.00,
                        'twelveNetAmountBeforeGST': 0.00,
                        'twelveGSTAmount': 0.00,
                        'eighteenNetAmountBeforeGST': 0.00,
                        'eighteenGSTAmount': 0.00,
                        'fiveNetAmountBeforeGST': 0.00,
                        'fiveGSTAmount': 0.00,
                        'twentyeightNetAmountBeforeGST': 0.00,
                        'twentyeightGSTAmount': 0.00,
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                    });
            }
        }

        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotZeroNetAmountBeforeGST = 0;
        let TotZerGSTAmount = 0;
        let TotfiveNetAmountBeforeGST = 0;
        let TotfiveGSTAmount = 0;
        let TottwelveNetAmountBeforeGST = 0;
        let TottwelveGSTAmount = 0;
        let ToteighteenNetAmountBeforeGST = 0;
        let ToteighteenGSTAmount = 0;
        let TottwentyeightNetAmountBeforeGST = 0;
        let TottwentyeightGSTAmount = 0;
        for (let jdx in NetSaleGst) {
            let netcollection = NetSaleGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST + (netcollection.ZeroNetAmountBeforeGST || 0);
            TotZerGSTAmount = TotZerGSTAmount + (netcollection.ZerGSTAmount || 0);
            TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST + (netcollection.fiveNetAmountBeforeGST || 0);
            TotfiveGSTAmount = TotfiveGSTAmount + (netcollection.fiveGSTAmount || 0);
            TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST + (netcollection.twelveNetAmountBeforeGST || 0);
            TottwelveGSTAmount = TottwelveGSTAmount + (netcollection.twelveGSTAmount || 0);
            ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST + (netcollection.eighteenNetAmountBeforeGST || 0);
            ToteighteenGSTAmount = ToteighteenGSTAmount + (netcollection.eighteenGSTAmount || 0);
            TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST + (netcollection.twentyeightNetAmountBeforeGST || 0);
            TottwentyeightGSTAmount = TottwentyeightGSTAmount + (netcollection.twentyeightGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST;
        TotZerGSTAmount = TotZerGSTAmount;
        TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST;
        TotfiveGSTAmount = TotfiveGSTAmount;
        TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST;
        TottwelveGSTAmount = TottwelveGSTAmount;
        ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST;
        ToteighteenGSTAmount = ToteighteenGSTAmount;
        TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST;
        TottwentyeightGSTAmount = TottwentyeightGSTAmount;


        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotZeroNetAmountBeforeGST: TotZeroNetAmountBeforeGST,
            TotZerGSTAmount: TotZerGSTAmount,
            TotfiveNetAmountBeforeGST: TotfiveNetAmountBeforeGST,
            TotfiveGSTAmount: TotfiveGSTAmount,
            TottwelveNetAmountBeforeGST: TottwelveNetAmountBeforeGST,
            TottwelveGSTAmount: TottwelveGSTAmount,
            ToteighteenNetAmountBeforeGST: ToteighteenNetAmountBeforeGST,
            ToteighteenGSTAmount: ToteighteenGSTAmount,
            TottwentyeightNetAmountBeforeGST: TottwentyeightNetAmountBeforeGST,
            TottwentyeightGSTAmount: TottwentyeightGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'stocksummaryproductgstreport';
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
    public async PrintPharmacyStockReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductName = apiReq.Data.ProductName;
        let StockSerialItemData = data.Data[0];
        let StockSerial: any = [];
        StockSerialItem.forEach((Detail: any) => {
            let ItemData = Detail;
            ItemData.Value = parseFloat(Detail.Quantity) * parseFloat(Detail.PurchasePrice);
            StockSerial.push(ItemData);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StoreName: StoreName,
            ProductName: ProductName
        };
        let pdfOption: any = null;
        let key = 'pharmacystockreport';
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
    public async PrintStockStatusReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let ItemName = apiReq.Data.ItemName;
        let StockSerialItemData = data.Data[0];
        let item: any = [];
        let StockStatus: any = [];
        let TotalFooterQty: number = 0;
        let TotalNetUcp: number = 0;
        let TotalFooterUcp: number = 0;
        let TotalNetMrp: number = 0;
        let TotalFooterMrp: number = 0;

        let GroupedBatchData = _.groupBy(data.Data, 'ItemMasterId');
        for (let itmdx in GroupedBatchData) {
            let itemgrouped = GroupedBatchData[itmdx];
            let stockdata = {
                ItemName: '',
                ItemCode: '',
                GenericName: '',
                ManufacturerName: '',
                Qty: 0,
                Ucp: 0,
                NetUcp: 0,
                NetMrp: 0,
                Mrp: 0,
                TotalQty: 0,
                TotalQtyinfloat: 0,
                TotalUcp: 0,
                TotalMrp: 0,
                itemlength: itemgrouped.length
            };
            let stocklength = 0;
            let batchGrpData = _.groupBy(itemgrouped, 'BatchId');
            for (let gpdx in batchGrpData) {
                stocklength++;
                item = batchGrpData[gpdx];
                for (let idx in item) {
                    let batchData = item[idx];
                    stockdata.Qty += Number(batchData.Quantity);
                    stockdata.Ucp += parseFloat(batchData.Ucp);
                    stockdata.NetUcp += (batchData.Quantity) * parseFloat(batchData.Ucp);
                    stockdata.Mrp += parseFloat(batchData.Mrp);
                    stockdata.NetMrp += (batchData.Quantity) * parseFloat(batchData.Mrp);
                    stockdata.ItemName = batchData.ItemName;
                    stockdata.ItemCode = batchData.ItemCode;
                    if (batchData.ItemMaster) {
                        stockdata.GenericName = batchData.ItemMaster.GenericName;
                        stockdata.ManufacturerName = batchData.ItemMaster.ManufacturerName;
                    }
                }
            }
            stockdata.TotalQtyinfloat = Number(stockdata.Qty);
            stockdata.TotalUcp = (stockdata.Ucp) / stocklength;
            stockdata.TotalMrp = (stockdata.Mrp) / stocklength;
            stockdata.TotalQty = (stockdata.TotalQtyinfloat);

            TotalFooterQty = TotalFooterQty + (stockdata.TotalQty);
            TotalFooterUcp = TotalFooterUcp + (stockdata.TotalUcp);
            TotalFooterMrp = TotalFooterMrp + (stockdata.TotalMrp);
            TotalNetUcp = TotalNetUcp + (stockdata.NetUcp);
            TotalNetMrp = TotalNetMrp + (stockdata.NetMrp);
            StockStatus.push(stockdata);
        }

        // StockStatus.forEach((Detail: any) => {
        //     let ItemData = Detail;
        //     TotalFooterQty += (ItemData.TotalQty);
        //     TotalFooterUcp += (ItemData.TotalUcp);
        //     TotalFooterMrp += (ItemData.TotalMrp);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            StoreName: StoreName,
            ProductType: ProductType,
            ItemName: ItemName,
            StockStatus: StockStatus,
            TotalFooterQty: TotalFooterQty,
            TotalFooterUcp: TotalFooterUcp,
            TotalFooterMrp: TotalFooterMrp,
            TotalNetUcp: TotalNetUcp,
            TotalNetMrp: TotalNetMrp
        };
        let pdfOption: any = null;
        let key = 'stockstatusreport';
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
    public async PrintStockStatusGeneralReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let ItemName = apiReq.Data.ItemName;
        let StockSerialItemData = data.Data[0];
        let item: any = [];
        let StockStatus: any = [];
        let TotalFooterQty: number = 0;
        let TotalFooterUcp: number = 0;
        let TotalFooterMrp: number = 0;
        let TotalNetUcp: number = 0;

        let GroupedBatchData = _.groupBy(data.Data, 'ItemMasterId');
        for (let itmdx in GroupedBatchData) {
            let itemgrouped = GroupedBatchData[itmdx];
            let stockdata = {
                ItemName: '',
                ItemCode: '',
                GenericName: '',
                ManufacturerName: '',
                Qty: 0,
                Ucp: 0,
                NetUcp: 0,
                Mrp: 0,
                TotalQty: 0,
                TotalQtyinfloat: 0,
                TotalUcp: 0,
                TotalMrp: 0,
                itemlength: itemgrouped.length
            };
            let stocklength = 0;
            let batchGrpData = _.groupBy(itemgrouped, 'BatchId');
            for (let gpdx in batchGrpData) {
                stocklength++;
                item = batchGrpData[gpdx];
                for (let idx in item) {
                    let batchData = item[idx];
                    stockdata.Qty += Number(batchData.Quantity);
                    stockdata.Ucp += parseFloat(batchData.Ucp);
                    stockdata.NetUcp += parseFloat(batchData.Quantity) * parseFloat(batchData.Ucp);
                    stockdata.Mrp += parseFloat(batchData.Mrp);
                    stockdata.ItemName = batchData.ItemName;
                    stockdata.ItemCode = batchData.ItemCode;
                    if (batchData.ItemMaster) {
                        stockdata.GenericName = batchData.ItemMaster.GenericName;
                        stockdata.ManufacturerName = batchData.ItemMaster.ManufacturerName;
                    }
                }
            }
            stockdata.TotalQtyinfloat = Number(stockdata.Qty);
            stockdata.TotalUcp = (stockdata.Ucp) / stocklength;
            stockdata.TotalMrp = (stockdata.Mrp) / stocklength;
            stockdata.TotalQty = (stockdata.TotalQtyinfloat);

            TotalFooterQty = TotalFooterQty + (stockdata.TotalQty);
            TotalFooterUcp = TotalFooterUcp + (stockdata.TotalUcp);
            TotalNetUcp = TotalNetUcp + (stockdata.NetUcp);
            TotalFooterMrp = TotalFooterMrp + (stockdata.TotalMrp);
            StockStatus.push(stockdata);
        }

        // StockStatus.forEach((Detail: any) => {
        //     let ItemData = Detail;
        //     TotalFooterQty += (ItemData.TotalQty);
        //     TotalFooterUcp += (ItemData.TotalUcp);
        //     TotalFooterMrp += (ItemData.TotalMrp);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StoreName: StoreName,
            ProductType: ProductType,
            ItemName: ItemName,
            StockStatus: StockStatus,
            TotalFooterQty: TotalFooterQty,
            TotalFooterUcp: TotalFooterUcp,
            TotalFooterMrp: TotalFooterMrp,
            TotalNetUcp: TotalNetUcp
        };
        let pdfOption: any = null;
        let key = 'stockstatusgeneralreport';
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
    public async PrintStockNonMovementReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockNonMovement = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let StockNonMovementData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockNonMovementData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockNonMovementData.FacilityId, StockNonMovementData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockNonMovement: StockNonMovement,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            ItemName: ItemName
        };
        let pdfOption: any = null;
        let key = 'stocknonmovementreport';
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
    public async PrintStockStatusBatchReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let ItemName = apiReq.Data.ItemName;
        let StockSerialItemData = data.Data[0];
        // let TotalUCP: any;
        // let TotalMRP: number = 0;
        let TotalQty: number = 0;
        let FooterUCP: number = 0;
        let FooterMRP: number = 0;
        let FootertotUCP: number = 0;
        let FootertotMRP: number = 0;
        let StockSerial: any = [];
        let StockData: any = [];
        let item: any = {};
        for (let idx in StockSerialItem) {
            item = StockSerialItem[idx];
            item.TotalUCP = parseFloat(item.Quantity) * parseFloat(item.Ucp);
            item.TotalMRP = parseFloat(item.Quantity) * parseFloat(item.Mrp);

            TotalQty = TotalQty + item.Quantity;
            FooterUCP = FooterUCP + item.Ucp;
            FooterMRP = FooterMRP + item.Mrp;
            FootertotUCP = FootertotUCP + item.TotalUCP;
            FootertotMRP = FootertotMRP + item.TotalMRP;

            StockData.push(item);
        }

        // let custom_sort = function (a: any, b: any) {
        //     return a.ItemName - b.ItemName;
        // };

        let custom_sort = function (a: any, b: any) {
            if (a.ItemName < b.ItemName)
                return -1;
            if (a.ItemName > b.ItemName)
                return 1;
            return 0;
        };

        StockData.sort(custom_sort);
        StockSerial = StockData;

        // let StockSerial: any = [];
        // StockSerialItem.forEach((Detail: any) => {
        //     let ItemData = Detail;
        //     ItemData.Ucp = isNaN(parseFloat(ItemData.Ucp)) ? (0) : parseFloat(ItemData.Ucp);
        //     ItemData.Mrp = isNaN(parseFloat(ItemData.Mrp)) ? (0) : parseFloat(ItemData.Mrp);
        //     ItemData.TotalQty += ItemData.TotalQty + Quantity;
        //     StockSerial.push(ItemData);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            StockSerial: StockSerial,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            StoreName: StoreName,
            ProductType: ProductType,
            ItemName: ItemName,
            TotalQty: TotalQty,
            FooterUCP: FooterUCP,
            FooterMRP: FooterMRP,
            FootertotUCP: FootertotUCP,
            FootertotMRP: FootertotMRP
        };
        let pdfOption: any = null;
        let key = 'stockstatusbatchreport';
        pdfOption = {
            format: 'A4',
            orientation: 'lanscape',
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
    public async PrintGeneralStockStatusBatchReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let ItemName = apiReq.Data.ItemName;
        let StockSerialItemData = data.Data[0];
        // let TotalUCP: any;
        // let TotalMRP: number = 0;
        let TotalQty: number = 0;
        let FooterUCP: number = 0;
        let FooterMRP: number = 0;
        let FootertotUCP: number = 0;
        let FootertotMRP: number = 0;
        let StockSerial: any = [];
        let StockData: any = [];
        let item: any = {};
        for (let idx in StockSerialItem) {
            item = StockSerialItem[idx];
            item.TotalUCP = parseFloat(item.Quantity) * parseFloat(item.Ucp);
            item.TotalMRP = parseFloat(item.Quantity) * parseFloat(item.Mrp);

            TotalQty = TotalQty + item.Quantity;
            FooterUCP = FooterUCP + item.Ucp;
            FooterMRP = FooterMRP + item.Mrp;
            FootertotUCP = FootertotUCP + item.TotalUCP;
            FootertotMRP = FootertotMRP + item.TotalMRP;

            StockData.push(item);
        }

        // let custom_sort = function (a: any, b: any) {
        //     return a.ItemName - b.ItemName;
        // };

        let custom_sort = function (a: any, b: any) {
            if (a.ItemName < b.ItemName)
                return -1;
            if (a.ItemName > b.ItemName)
                return 1;
            return 0;
        };

        StockData.sort(custom_sort);
        StockSerial = StockData;

        // let StockSerial: any = [];
        // StockSerialItem.forEach((Detail: any) => {
        //     let ItemData = Detail;
        //     ItemData.Ucp = isNaN(parseFloat(ItemData.Ucp)) ? (0) : parseFloat(ItemData.Ucp);
        //     ItemData.Mrp = isNaN(parseFloat(ItemData.Mrp)) ? (0) : parseFloat(ItemData.Mrp);
        //     ItemData.TotalQty += ItemData.TotalQty + Quantity;
        //     StockSerial.push(ItemData);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            StockSerial: StockSerial,
            Preferences: printPreferencesData,
            StoreName: StoreName,
            ProductType: ProductType,
            ItemName: ItemName,
            TotalQty: TotalQty,
            FooterUCP: FooterUCP,
            FooterMRP: FooterMRP,
            FootertotUCP: FootertotUCP,
            FootertotMRP: FootertotMRP
        };
        let pdfOption: any = null;
        let key = 'stockstatusbatchgeneralreport';
        pdfOption = {
            format: 'A4',
            orientation: 'lanscape',
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

    public async PrintStockStatusProductSummaryReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        let data = await this.GetStockSerialItems(apiReq);
        let StockSerialItem = data.Data;
        let StoreName = apiReq.Data.StoreName;
        let ProductType = apiReq.Data.ProductType;
        let ItemName = apiReq.Data.ItemName;
        let StockSerialItemData = data.Data[0];
        let item: any = [];
        let StockStatussummary: any = [];
        let TotalFooterUcp: number = 0;
        let TotalFooterMrp: number = 0;
        let TotalFooterProfit: number = 0;

        let GroupedBatchData = _.groupBy(data.Data, 'ItemMaster.ProductTypeId');
        for (let prdtdx in GroupedBatchData) {
            let productgrouped = GroupedBatchData[prdtdx];
            let proddata = {
                TotalUcp: 0,
                TotalMrp: 0,
                Profit: 0,
                ProductTypeName: ''
            };
            for (let idx in productgrouped) {
                item = productgrouped[idx];
                proddata.TotalUcp += parseFloat(item.Quantity) * parseFloat(item.Ucp);
                proddata.TotalMrp += parseFloat(item.Quantity) * parseFloat(item.Mrp);
                proddata.Profit = (proddata.TotalUcp) - (proddata.TotalMrp);
                proddata.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
            }
            StockStatussummary.push(proddata);
        }

        StockStatussummary.forEach((Detail: any) => {
            let ItemData = Detail;
            TotalFooterUcp += parseFloat(ItemData.TotalUcp);
            TotalFooterMrp += parseFloat(ItemData.TotalMrp);
            TotalFooterProfit += parseFloat(ItemData.Profit);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockSerialItemData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockSerialItemData.FacilityId, StockSerialItemData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockSerialItem: StockSerialItem,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            StoreName: StoreName,
            ProductType: ProductType,
            ItemName: ItemName,
            StockStatussummary: StockStatussummary,
            TotalFooterUcp: TotalFooterUcp,
            TotalFooterMrp: TotalFooterMrp,
            TotalFooterProfit: TotalFooterProfit,
        };
        let pdfOption: any = null;
        let key = 'stockstatusproductsummaryreport';
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
        const baseDate = req.CreatedAt ? new Date(req.CreatedAt) : new Date();

        // Define ±30 seconds window
        const fromDate = new Date(baseDate.getTime() - 30 * 1000);
        const toDate = new Date(baseDate.getTime() + 30 * 1000);

        // Format timestamps to ensure consistent comparison
        const frmDate = moment(fromDate).format('YYYY-MM-DD HH:mm:ss');
        const toDateFormatted = moment(toDate).format('YYYY-MM-DD HH:mm:ss');
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                // { Key: StockTransferFilters.StockRequestId, Value: req.StockRequestId },
                { Key: StockSerialItemFilters.GrnId, Value: req.GrnId },
                { Key: StockSerialItemFilters.GrnDetailId, Value: req.GrnDetailId },
                { Key: StockSerialItemFilters.Quantity, Value: req.Quantity },
                { Key: StockSerialItemFilters.ItemMasterId, Value: req.ItemMasterId },
                { Key: StockSerialItemFilters.StoreMasterId, Value: req.StoreMasterId },
                { Key: StockSerialItemFilters.VendorMasterId, Value: req.VendorMasterId },
                { Key: StockSerialItemFilters.From, Value: frmDate },
                { Key: StockSerialItemFilters.To, Value: toDateFormatted },
                // { Key: StockTransferFilters.GrnId, Value: req.GrnId },
                // { Key: StockTransferFilters.TotalNetAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetStockSerialItems(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    public GetModel(): SStatic.Model<StockSerialItemInstance, StockSerialItemAttributes> {
        return this.Models.StockSerialItem;
    }
}
