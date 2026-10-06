import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GrnDetailInstance, GrnDetailAttributes } from '../Model/Interface/Index';
import { GrnDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as inventoryBo from './Index';


export class GrnDetailBo extends BaseBo<GrnDetailInstance, GrnDetailAttributes> {
    public async AddGrnDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGrnDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageGrnDetails(GrnId: number, request: any, details: GrnDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.GrnId = GrnId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Status === 1 && detail.Id === 0) {
                    if (await this.IsAlreadyExist(detail) <= -1) throw { message: 'Grn Detail Already Exist' };
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    /*
                    if (request.Header.GrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManageGrnStockItem(GrnId, request, detail);
                    }
                    */
                } else if (detail.Status === 1 && detail.Id > 0) {
                    await this.Update(detail);
                    /*
                    if (request.Header.GrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManageGrnStockItem(GrnId, request, detail);
                    }
                    */
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetGrnDetailById(req: BaseRequest): Promise<GrnDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGrnDetails(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let GrWhere: WhereOptions<any> = {};
        let GrDtWhere: WhereOptions<any> = {};
        let isReqGrnSearch: boolean = false;
        let itemWhere: WhereOptions<any> = {};
        let isReqitemSearch: boolean = false;
        let include: Array<IncludeOptions> = [];

        include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.ItemVendorMap, as: 'VendorItem', required: false });
        // include.push({ model: this.Models.Grn, as: 'Grn', required: false });
        include.push({ model: this.Models.PurchaseOrderDetail, as: 'PurchaseOrderDetail', required: false });
        include.push({ model: this.Models.PurchaseOrder, as: 'PurchaseOrder', required: false });
        // include.push({ model: this.Models.StockSerialItem, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GrnDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GrnDetailFilters.GrnIds:
                        where['GrnId'] = { '$in': param.Value };
                        break;
                    case GrnDetailFilters.GrnId:
                        where['GrnId'] = param.Value;
                        break;
                    case GrnDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case GrnDetailFilters.FacilityId:
                        GrWhere['FacilityId'] = param.Value;
                        break;
                    case GrnDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case GrnDetailFilters.GrnDate:
                        GrWhere['GrnDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnDetailFilters.From:
                        GrWhere['GrnDate'] = GrWhere['GrnDate'] || {};
                        (GrWhere['GrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnDetailFilters.To:
                        GrWhere['GrnDate'] = GrWhere['GrnDate'] || {};
                        (GrWhere['GrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case GrnDetailFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case GrnDetailFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case GrnDetailFilters.StoreMasterId:
                        GrWhere['StoreMasterId'] = param.Value;
                        GrDtWhere['StoreMasterId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.VendorMasterId:
                        GrWhere['VendorMasterId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.GrnStatusId:
                        GrWhere['GrnStatusId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.ProductTypeId:
                        itemWhere['ProductTypeId'] = param.Value;
                        isReqitemSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster, required: isReqitemSearch,
            where: itemWhere,
            include: [
                { model: this.Models.ProductType, as: 'ProductType', required: false }
            ]
        });
        include.push({ model: this.Models.StockSerialItem, required: false,
            where: GrDtWhere,
         });
        include.push({
            model: this.Models.Grn, as: 'Grn',
            required: isReqGrnSearch,
            where: GrWhere,
            // include: [
            //     {
            //         model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TranferedUser', required: false,
            //         include: [this.GetReference('Title')]
            //     }
            // ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetConsignmentGrnDetails(apiReq?: ApiRequest<GrnDetailFilters>):
        Promise<ApiResponse<GrnDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let GrWhere: WhereOptions<any> = {};
        let isReqGrnSearch: boolean = false;
        let itemWhere: WhereOptions<any> = {};
        let isReqitemSearch: boolean = false;
        let include: Array<IncludeOptions> = [];

        include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.ItemVendorMap, as: 'VendorItem', required: false });
        // include.push({ model: this.Models.Grn, as: 'Grn', required: false });
        include.push({ model: this.Models.PurchaseOrderDetail, as: 'PurchaseOrderDetail', required: false });
        include.push({ model: this.Models.StockSerialItem, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GrnDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GrnDetailFilters.GrnIds:
                        where['GrnId'] = { '$in': param.Value };
                        break;
                    case GrnDetailFilters.GrnId:
                        where['GrnId'] = param.Value;
                        break;
                    case GrnDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case GrnDetailFilters.FacilityId:
                        GrWhere['FacilityId'] = param.Value;
                        break;
                    case GrnDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case GrnDetailFilters.GrnDate:
                        GrWhere['GrnDate'] = { '$between': param.Value || '' };
                        break;
                    case GrnDetailFilters.From:
                        GrWhere['GrnDate'] = GrWhere['GrnDate'] || {};
                        (GrWhere['GrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case GrnDetailFilters.To:
                        GrWhere['GrnDate'] = GrWhere['GrnDate'] || {};
                        (GrWhere['GrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case GrnDetailFilters.StoreMasterId:
                        GrWhere['StoreMasterId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.VendorMasterId:
                        GrWhere['VendorMasterId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.GrnStatusId:
                        GrWhere['GrnStatusId'] = param.Value;
                        isReqGrnSearch = true;
                        break;
                    case GrnDetailFilters.ProductTypeId:
                        itemWhere['ProductTypeId'] = param.Value;
                        isReqitemSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ItemMaster, required: isReqitemSearch,
            where: itemWhere,
            include: [
                { model: this.Models.ProductType, as: 'ProductType', required: false }
            ]
        });
        include.push({
            model: this.Models.Grn, as: 'Grn',
            required: isReqGrnSearch,
            where: GrWhere,
            // include: [
            //     {
            //         model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TranferedUser', required: false,
            //         include: [this.GetReference('Title')]
            //     }
            // ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteGrnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
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
            Params: [{ Key: GrnDetailFilters.ItemMasterId, Value: req.ItemMasterId },
            { Key: GrnDetailFilters.VendorMasterId, Value: req.VendorMasterId },
            { Key: GrnDetailFilters.CreatedFrom, Value: frmDate },
            { Key: GrnDetailFilters.CreatedTo, Value: todate },
            { Key: GrnDetailFilters.GrnId, Value: req.GrnId },
                // { Key: GrnDetailFilters.TotalGrossAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetGrnDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public GetModel(): SStatic.Model<GrnDetailInstance, GrnDetailAttributes> {
        return this.Models.GrnDetail;
    }
    public async GetConsolidatePurchaseGst(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(inventoryBo.PurchaseReturnDetailBo, this.Request);
        result.push({ Key: 1, Value: await this.PurchaseSaleGSTDetails(req) });
        result.push({ Key: 2, Value: await returnBO.PurchaseReturnGSTDetails(req) });
        return result;
    }
    public async PurchaseSaleGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster, as: 'GstMaster',
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },
                    GstPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },



                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },
                    GstPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },


                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // GSTId: { '$eq': 1 },
                    GstPercentage: { '$eq': '0.000000' }


                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // GSTId: { '$eq': 1 },
                    GstPercentage: { '$eq': '0.000000' }

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // GSTId: { '$eq': 8 },
                    GstPercentage: { '$eq': '18.000000' },


                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        // GrnDate = moment(bills.Grn.GrnDate).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // GSTId: { '$eq': 8 },
                    GstPercentage: { '$eq': '18.000000' },


                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        // GrnDate = moment(bills.Grn.GrnDate).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        // GrnDate = moment(bills.Grn.GrnDate).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'Grn.GrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.Grn.GrnDate;
                        // GrnDate = moment(bills.Grn.GrnDate).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GrnDate': GrnDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        return GSTGroup;
    }
    public async GetConsolidateInputGstSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(inventoryBo.PurchaseReturnDetailBo, this.Request);
        result.push({ Key: 1, Value: await this.ConsolidateGrnGSTDetails(req) });
        result.push({ Key: 2, Value: await returnBO.ConsolidateReturnGSTDetails(req) });
        return result;
    }
    public async ConsolidateGrnGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        // let GSTGroup: { [id: number]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster, as: 'GstMaster',
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'GrnQuantityAfterConversion', 'NetAmount',
                    'UnitGstAmount', 'GstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstId', 'StoreMasterId'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.Grn,
                    attributes: ['Id', 'GrnDate'],
                    where: {
                        GrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        GrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GstId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmount += bills.NetAmount;
                        GrnQuantity += bills.GrnQuantityAfterConversion;
                        GSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        CGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitCGstAmount);
                        SGSTAmount += (bills.GrnQuantityAfterConversion * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - (bills.GrnQuantityAfterConversion * bills.UnitGstAmount);
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GrnQuantity': GrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        return GSTGroup;
    }
    public async PrintGRNReportByItem(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        let data = await this.GetGrnDetails(apiReq);
        let Grndetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let GrndetailData = data.Data[0];
        let TotalNetAmount: number = 0;
        for (let idx in Grndetail) {
            let item = Grndetail[idx];
            TotalNetAmount = TotalNetAmount + (item.NetAmount);

        }
        let grnBO = BoFactory.GetBo(inventoryBo.GrnBo, this.Request);
        let GrnData = await grnBO.GetGrnById({ Id: GrndetailData.GrnId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(inventoryBo.StorePreferenceBo, this.Request);
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
            Grndetail: Grndetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            ItemName: ItemName,
            TotalNetAmount: TotalNetAmount
        };
        let pdfOption: any = null;
        let key = 'grnreportbyitem';
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
    public async PrintDailyPurchaseSummary(apiReq?: ApiRequest<GrnDetailFilters>): Promise<any> {
        let data = await this.GetGrnDetails(apiReq);
        let Grndetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let ItemName = apiReq.Data.ItemName;
        let StoreName = apiReq.Data.StoreName;
        let GrndetailData = data.Data[0];
        let TotalNetAmount: number = 0;
        let TotalGrossAmt: number = 0;
        let item: any = [];
        let dailypurchase: any = [];
        let GroupedBatchData = _.groupBy(data.Data, 'ItemMasterId');

        for (let jdx in GroupedBatchData) {
            let itemgrouped = GroupedBatchData[jdx];
            let itemData = {
                ItemName: '',
                ManufactureName: '',
                GrnQuantity: 0,
                FreeQty: 0,
                GrnQuantityAfterConversion: 0,
                PurchasePrice: 0,
                GrossAmount: 0,
                NetAmount: 0
            };
            for (let imdx in itemgrouped) {
                item = itemgrouped[imdx];
                itemData.ItemName = item.ItemName;
                itemData.ManufactureName = item.ItemMaster.ManufacturerName;
                itemData.GrnQuantity += item.GrnQuantity;
                itemData.FreeQty += item.FreeQty;
                itemData.GrnQuantityAfterConversion += item.GrnQuantityAfterConversion;
                itemData.PurchasePrice += item.PurchasePrice;
                itemData.GrossAmount += item.GrossAmount;
                itemData.NetAmount += item.NetAmount;
            }
            TotalGrossAmt = TotalGrossAmt + (itemData.GrossAmount);
            TotalNetAmount = TotalNetAmount + (itemData.NetAmount);
            dailypurchase.push(itemData);
        }
        let grnBO = BoFactory.GetBo(inventoryBo.GrnBo, this.Request);
        let GrnData = await grnBO.GetGrnById({ Id: GrndetailData.GrnId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GrnData.FacilityId);
        let info = {
            Grndetail: Grndetail,
            dailypurchase: dailypurchase,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            ItemName: ItemName,
            StoreName: StoreName,
            TotalNetAmount: TotalNetAmount,
            TotalGrossAmt: TotalGrossAmt
        };
        let pdfOption: any = null;
        let key = 'dailypurchasesummary';
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
    public async PrintPurchaseSaleGSTReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let SaleGst: any = [];
        let NetSaleGst: any = [];
        let SalesReq = req;
        SaleGst = await this.PurchaseSaleGSTDetails(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(inventoryBo.StorePreferenceBo, this.Request);
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
                if (parseInt(gstid) === 0) {
                    zerosalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 12) {
                    twelvesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 18) {
                    eighteensalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 5) {
                    fivesalegst = SaleGst[gstid];
                }
                if (parseInt(gstid) === 28) {
                    twentyeightsalegst = SaleGst[gstid];
                }

            }

            for (let idx in zerosalegst) {
                let zero_salegst = zerosalegst[idx];
                let Key = '';
                let ZeroNetAmountBeforeGST = 0;
                let ZerGSTAmount = 0;
                let year = new Date(zero_salegst.GrnDate).getFullYear();
                let month = new Date(zero_salegst.GrnDate).getMonth();
                let date = new Date(zero_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = zero_salegst.GrnDate;
                ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                ZerGSTAmount = zero_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = zero_salegst.GrnDate;
                        if (item.ZeroNetAmountBeforeGST > 0) {
                            item.ZeroNetAmountBeforeGST += zero_salegst.NetAmountBeforeGST;
                        } else {
                            item.ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                        }
                        if (item.ZerGSTAmount > 0) {
                            item.ZerGSTAmount += zero_salegst.GSTAmount;
                        } else {
                            item.ZerGSTAmount = zero_salegst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
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
                        'GDate': GDate
                    });
            }
            for (let idx in twelvesalegst) {
                let twelve_salegst = twelvesalegst[idx];
                let Key = '';
                let twelveNetAmountBeforeGST = 0;
                let twelveGSTAmount = 0;
                let year = new Date(twelve_salegst.GrnDate).getFullYear();
                let month = new Date(twelve_salegst.GrnDate).getMonth();
                let date = new Date(twelve_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = twelve_salegst.GrnDate;
                twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                twelveGSTAmount = twelve_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = twelve_salegst.GrnDate;
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
                        'GDate': GDate
                    });
            }
            for (let idx in eighteensalegst) {
                let eighteen_salegst = eighteensalegst[idx];
                let Key = '';
                let eighteenNetAmountBeforeGST = 0;
                let eighteenGSTAmount = 0;
                let year = new Date(eighteen_salegst.GrnDate).getFullYear();
                let month = new Date(eighteen_salegst.GrnDate).getMonth();
                let date = new Date(eighteen_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = eighteen_salegst.GrnDate;
                eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                eighteenGSTAmount = eighteen_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = eighteen_salegst.GrnDate;
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
                        'GDate': GDate
                    });
            }
            for (let idx in fivesalegst) {
                let five_salegst = fivesalegst[idx];
                let Key = '';
                let fiveNetAmountBeforeGST = 0;
                let fiveGSTAmount = 0;
                let year = new Date(five_salegst.GrnDate).getFullYear();
                let month = new Date(five_salegst.GrnDate).getMonth();
                let date = new Date(five_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = five_salegst.GrnDate;
                fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                fiveGSTAmount = five_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = five_salegst.GrnDate;
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
                        'GDate': GDate

                    });
            }
            for (let idx in twentyeightsalegst) {
                let twentyeight_salegst = twentyeightsalegst[idx];
                let Key = '';
                let twentyeightNetAmountBeforeGST = 0;
                let twentyeightGSTAmount = 0;
                let year = new Date(twentyeight_salegst.GrnDate).getFullYear();
                let month = new Date(twentyeight_salegst.GrnDate).getMonth();
                let date = new Date(twentyeight_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = twentyeight_salegst.GrnDate;
                twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = twentyeight_salegst.GrnDate;
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
                        'GDate': GDate

                    });
            }
            for (let idx in overallsalegst) {
                let overall_salegst = overallsalegst[idx];
                let Key = '';
                let NetAmountBeforeGST = 0;
                let NetAmount = 0;
                let GSTAmount = 0;
                let year = new Date(overall_salegst.GrnDate).getFullYear();
                let month = new Date(overall_salegst.GrnDate).getMonth();
                let date = new Date(overall_salegst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = overall_salegst.GrnDate;
                NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                NetAmount = overall_salegst.NetAmount;
                GSTAmount = overall_salegst.GSTAmount;
                let valappended = 0;
                NetSaleGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = overall_salegst.GrnDate;
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
                        'GDate': GDate
                    });
            }
        }
        let Sort_Date = function (a: any, b: any) {
            return new Date(a.GDate).getTime() - new Date(b.GDate).getTime();
        };
        NetSaleGst.sort(Sort_Date);


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
            StoreMaster: StoreMaster,
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
        let key = 'purchasesalesgstreport';
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
    public async PrintConsolidatePurchaseGSTReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let Gstcollection: any = [];
        let NetSaleGst: any = [];
        let OverallGst: any = [];

        let SalesReq = req;
        Gstcollection = await this.GetConsolidatePurchaseGst(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(inventoryBo.StorePreferenceBo, this.Request);
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
        if (Gstcollection) {
            let SaleGst = [];
            let SalereturnGst = [];
            if (Gstcollection.length > 0) {
                SaleGst = Gstcollection[0].Value;
            }
            if (Gstcollection.length > 1) {
                SalereturnGst = Gstcollection[1].Value;
            }
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
                    if (parseInt(gstid) === 0) {
                        zerosalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 12) {
                        twelvesalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 18) {
                        eighteensalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 5) {
                        fivesalegst = SaleGst[gstid];
                    }
                    if (parseInt(gstid) === 28) {
                        twentyeightsalegst = SaleGst[gstid];
                    }

                }

                for (let idx in zerosalegst) {
                    let zero_salegst = zerosalegst[idx];
                    let Key = '';
                    let ZeroSaleNetAmountBeforeGST = 0;
                    let ZeroSaleGSTAmount = 0;
                    let year = new Date(zero_salegst.GrnDate).getFullYear();
                    let month = new Date(zero_salegst.GrnDate).getMonth();
                    let date = new Date(zero_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = zero_salegst.GrnDate;
                    ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                    ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = zero_salegst.GrnDate;
                            if (item.ZeroSaleNetAmountBeforeGST > 0) {
                                item.ZeroSaleNetAmountBeforeGST += zero_salegst.NetAmountBeforeGST;
                            } else {
                                item.ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                            }
                            if (item.ZeroSaleGSTAmount > 0) {
                                item.ZeroSaleGSTAmount += zero_salegst.GSTAmount;
                            } else {
                                item.ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'ZeroSaleNetAmountBeforeGST': ZeroSaleNetAmountBeforeGST,
                            'ZeroSaleGSTAmount': ZeroSaleGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in twelvesalegst) {
                    let twelve_salegst = twelvesalegst[idx];
                    let Key = '';
                    let twelveSaleNetAmountBeforeGST = 0;
                    let twelveSaleGSTAmount = 0;
                    let year = new Date(twelve_salegst.GrnDate).getFullYear();
                    let month = new Date(twelve_salegst.GrnDate).getMonth();
                    let date = new Date(twelve_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = twelve_salegst.GrnDate;
                    twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                    twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = twelve_salegst.GrnDate;
                            if (item.twelveSaleNetAmountBeforeGST > 0) {
                                item.twelveSaleNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                            } else {
                                item.twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                            }
                            if (item.twelveSaleGSTAmount > 0) {
                                item.twelveSaleGSTAmount += twelve_salegst.GSTAmount;
                            } else {
                                item.twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twelveSaleNetAmountBeforeGST': twelveSaleNetAmountBeforeGST,
                            'twelveSaleGSTAmount': twelveSaleGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in eighteensalegst) {
                    let eighteen_salegst = eighteensalegst[idx];
                    let Key = '';
                    let eighteenSaleNetAmountBeforeGST = 0;
                    let eighteenSaleGSTAmount = 0;
                    let year = new Date(eighteen_salegst.GrnDate).getFullYear();
                    let month = new Date(eighteen_salegst.GrnDate).getMonth();
                    let date = new Date(eighteen_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = eighteen_salegst.GrnDate;
                    eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                    eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = eighteen_salegst.GrnDate;
                            if (item.eighteenSaleNetAmountBeforeGST > 0) {
                                item.eighteenSaleNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                            } else {
                                item.eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                            }
                            if (item.eighteenSaleGSTAmount > 0) {
                                item.eighteenSaleGSTAmount += eighteen_salegst.GSTAmount;
                            } else {
                                item.eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'eighteenSaleNetAmountBeforeGST': eighteenSaleNetAmountBeforeGST,
                            'eighteenSaleGSTAmount': eighteenSaleGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in fivesalegst) {
                    let five_salegst = fivesalegst[idx];
                    let Key = '';
                    let fiveSaleNetAmountBeforeGST = 0;
                    let fiveSaleGSTAmount = 0;
                    let year = new Date(five_salegst.GrnDate).getFullYear();
                    let month = new Date(five_salegst.GrnDate).getMonth();
                    let date = new Date(five_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = five_salegst.GrnDate;
                    fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                    fiveSaleGSTAmount = five_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = five_salegst.GrnDate;
                            if (item.fiveSaleNetAmountBeforeGST > 0) {
                                item.fiveSaleNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                            } else {
                                item.fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                            }
                            if (item.fiveSaleGSTAmount > 0) {
                                item.fiveSaleGSTAmount += five_salegst.GSTAmount;
                            } else {
                                item.fiveSaleGSTAmount = five_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'fiveSaleNetAmountBeforeGST': fiveSaleNetAmountBeforeGST,
                            'fiveSaleGSTAmount': fiveSaleGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in twentyeightsalegst) {
                    let twentyeight_salegst = twentyeightsalegst[idx];
                    let Key = '';
                    let twentyeightSaleNetAmountBeforeGST = 0;
                    let twentyeightSaleGSTAmount = 0;
                    let year = new Date(twentyeight_salegst.GrnDate).getFullYear();
                    let month = new Date(twentyeight_salegst.GrnDate).getMonth();
                    let date = new Date(twentyeight_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = twentyeight_salegst.GrnDate;
                    twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                    twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = twentyeight_salegst.GrnDate;
                            if (item.twentyeightSaleNetAmountBeforeGST > 0) {
                                item.twentyeightSaleNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightSaleGSTAmount > 0) {
                                item.twentyeightSaleGSTAmount += twentyeight_salegst.GSTAmount;
                            } else {
                                item.twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twentyeightSaleNetAmountBeforeGST': twentyeightSaleNetAmountBeforeGST,
                            'twentyeightSaleGSTAmount': twentyeightSaleGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in overallsalegst) {
                    let overall_salegst = overallsalegst[idx];
                    let Key = '';
                    let SaleNetAmountBeforeGST = 0;
                    let SaleNetAmount = 0;
                    let SaleGSTAmount = 0;
                    let year = new Date(overall_salegst.GrnDate).getFullYear();
                    let month = new Date(overall_salegst.GrnDate).getMonth();
                    let date = new Date(overall_salegst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = overall_salegst.GrnDate;
                    SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                    SaleNetAmount = overall_salegst.NetAmount;
                    SaleGSTAmount = overall_salegst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = overall_salegst.GrnDate;
                            if (item.SaleNetAmountBeforeGST > 0) {
                                item.SaleNetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                            } else {
                                item.SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                            }
                            if (item.SaleNetAmount > 0) {
                                item.SaleNetAmount += overall_salegst.NetAmount;
                            } else {
                                item.SaleNetAmount = overall_salegst.NetAmount;
                            }
                            if (item.SaleGSTAmount > 0) {
                                item.SaleGSTAmount += overall_salegst.GSTAmount;
                            } else {
                                item.SaleGSTAmount = overall_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                            'SaleNetAmount': SaleNetAmount,
                            'SaleGSTAmount': SaleGSTAmount,
                            'GDate': GDate
                        });
                }
            }
            if (SalereturnGst) {
                let overallsalereturngst = [];
                let zerosalereturngst = [];
                let fivesalereturngst = [];
                let twelvesalereturngst = [];
                let eighteensalereturngst = [];
                let twentyeightsalereturngst = [];
                for (let gstid in SalereturnGst) {
                    if (parseInt(gstid) === -1) {
                        overallsalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 0) {
                        zerosalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 12) {
                        twelvesalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 18) {
                        eighteensalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 5) {
                        fivesalereturngst = SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) === 28) {
                        twentyeightsalereturngst = SalereturnGst[gstid];
                    }

                }

                for (let idx in zerosalereturngst) {
                    let zero_salereturngst = zerosalereturngst[idx];
                    let Key = '';
                    let ZeroRetNetAmountBeforeGST = 0;
                    let ZeroRetGSTAmount = 0;
                    let year = new Date(zero_salereturngst.GrnDate).getFullYear();
                    let month = new Date(zero_salereturngst.GrnDate).getMonth();
                    let date = new Date(zero_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = zero_salereturngst.GrnDate;
                    ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                    ZeroRetGSTAmount = zero_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = zero_salereturngst.GrnDate;
                            if (item.ZeroRetNetAmountBeforeGST > 0) {
                                item.ZeroRetNetAmountBeforeGST += zero_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.ZeroRetGSTAmount > 0) {
                                item.ZeroRetGSTAmount += zero_salereturngst.GSTAmount;
                            } else {
                                item.ZeroRetGSTAmount = zero_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'ZeroRetNetAmountBeforeGST': ZeroRetNetAmountBeforeGST,
                            'ZeroRetGSTAmount': ZeroRetGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in twelvesalereturngst) {
                    let twelve_salereturngst = twelvesalereturngst[idx];
                    let Key = '';
                    let twelveRetNetAmountBeforeGST = 0;
                    let twelveRetGSTAmount = 0;
                    let year = new Date(twelve_salereturngst.GrnDate).getFullYear();
                    let month = new Date(twelve_salereturngst.GrnDate).getMonth();
                    let date = new Date(twelve_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = twelve_salereturngst.GrnDate;
                    twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                    twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = twelve_salereturngst.GrnDate;
                            if (item.twelveRetNetAmountBeforeGST > 0) {
                                item.twelveRetNetAmountBeforeGST += twelve_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twelveRetGSTAmount > 0) {
                                item.twelveRetGSTAmount += twelve_salereturngst.GSTAmount;
                            } else {
                                item.twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twelveRetNetAmountBeforeGST': twelveRetNetAmountBeforeGST,
                            'twelveRetGSTAmount': twelveRetGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in eighteensalereturngst) {
                    let eighteen_salereturngst = eighteensalereturngst[idx];
                    let Key = '';
                    let eighteenRetNetAmountBeforeGST = 0;
                    let eighteenRetGSTAmount = 0;
                    let year = new Date(eighteen_salereturngst.GrnDate).getFullYear();
                    let month = new Date(eighteen_salereturngst.GrnDate).getMonth();
                    let date = new Date(eighteen_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = eighteen_salereturngst.GrnDate;
                    eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                    eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = eighteen_salereturngst.GrnDate;
                            if (item.eighteenRetNetAmountBeforeGST > 0) {
                                item.eighteenRetNetAmountBeforeGST += eighteen_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.eighteenRetGSTAmount > 0) {
                                item.eighteenRetGSTAmount += eighteen_salereturngst.GSTAmount;
                            } else {
                                item.eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'eighteenRetNetAmountBeforeGST': eighteenRetNetAmountBeforeGST,
                            'eighteenRetGSTAmount': eighteenRetGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in fivesalereturngst) {
                    let five_salereturngst = fivesalereturngst[idx];
                    let Key = '';
                    let fiveRetNetAmountBeforeGST = 0;
                    let fiveRetGSTAmount = 0;
                    let year = new Date(five_salereturngst.GrnDate).getFullYear();
                    let month = new Date(five_salereturngst.GrnDate).getMonth();
                    let date = new Date(five_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = five_salereturngst.GrnDate;
                    fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                    fiveRetGSTAmount = five_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = five_salereturngst.GrnDate;
                            if (item.fiveRetNetAmountBeforeGST > 0) {
                                item.fiveRetNetAmountBeforeGST += five_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.fiveRetGSTAmount > 0) {
                                item.fiveRetGSTAmount += five_salereturngst.GSTAmount;
                            } else {
                                item.fiveRetGSTAmount = five_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'fiveRetNetAmountBeforeGST': fiveRetNetAmountBeforeGST,
                            'fiveRetGSTAmount': fiveRetGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in twentyeightsalereturngst) {
                    let twentyeight_salereturngst = twentyeightsalereturngst[idx];
                    let Key = '';
                    let twentyeightRetNetAmountBeforeGST = 0;
                    let twentyeightRetGSTAmount = 0;
                    let year = new Date(twentyeight_salereturngst.GrnDate).getFullYear();
                    let month = new Date(twentyeight_salereturngst.GrnDate).getMonth();
                    let date = new Date(twentyeight_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = twentyeight_salereturngst.GrnDate;
                    twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                    twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = twentyeight_salereturngst.GrnDate;
                            if (item.twentyeightRetNetAmountBeforeGST > 0) {
                                item.twentyeightRetNetAmountBeforeGST += twentyeight_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightRetGSTAmount > 0) {
                                item.twentyeightRetGSTAmount += twentyeight_salereturngst.GSTAmount;
                            } else {
                                item.twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'twentyeightRetNetAmountBeforeGST': twentyeightRetNetAmountBeforeGST,
                            'twentyeightRetGSTAmount': twentyeightRetGSTAmount,
                            'GDate': GDate
                        });
                }
                for (let idx in overallsalereturngst) {
                    let overall_salereturngst = overallsalereturngst[idx];
                    let Key = '';
                    let RetNetAmountBeforeGST = 0;
                    let RetNetAmount = 0;
                    let RetGSTAmount = 0;
                    let year = new Date(overall_salereturngst.GrnDate).getFullYear();
                    let month = new Date(overall_salereturngst.GrnDate).getMonth();
                    let date = new Date(overall_salereturngst.GrnDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    let GDate = overall_salereturngst.GrnDate;
                    RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                    RetNetAmount = overall_salereturngst.NetAmount;
                    RetGSTAmount = overall_salereturngst.GSTAmount;
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            item.GDate = overall_salereturngst.GrnDate;
                            if (item.RetNetAmountBeforeGST > 0) {
                                item.RetNetAmountBeforeGST += overall_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.RetNetAmount > 0) {
                                item.RetNetAmount += overall_salereturngst.NetAmount;
                            } else {
                                item.RetNetAmount = overall_salereturngst.NetAmount;
                            }
                            if (item.RetGSTAmount > 0) {
                                item.RetGSTAmount += overall_salereturngst.GSTAmount;
                            } else {
                                item.RetGSTAmount = overall_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                            'RetNetAmount': RetNetAmount,
                            'RetGSTAmount': RetGSTAmount,
                            'GDate': GDate
                        });
                }
            }
            let Sort_Date = function (a: any, b: any) {
                return new Date(a.GDate).getTime() - new Date(b.GDate).getTime();
            };
            NetSaleGst.sort(Sort_Date);

            for (let idx in NetSaleGst) {
                let allgst = NetSaleGst[idx];
                let consolidategst = {
                    Key: allgst.Key,
                    NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                    NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                    GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                    ZeroNetAmountBeforeGST: (allgst.ZeroSaleNetAmountBeforeGST || 0) - (allgst.ZeroRetNetAmountBeforeGST || 0),
                    ZeroGSTAmount: (allgst.ZeroSaleGSTAmount || 0) - (allgst.ZeroRetGSTAmount || 0),
                    fiveNetAmountBeforeGST: (allgst.fiveSaleNetAmountBeforeGST || 0) - (allgst.fiveRetNetAmountBeforeGST || 0),
                    fiveGSTAmount: (allgst.fiveSaleGSTAmount || 0) - (allgst.fiveRetGSTAmount || 0),
                    twelveNetAmountBeforeGST: (allgst.twelveSaleNetAmountBeforeGST || 0) - (allgst.twelveRetNetAmountBeforeGST || 0),
                    twelveGSTAmount: (allgst.twelveSaleGSTAmount || 0) - (allgst.twelveRetGSTAmount || 0),
                    eighteenNetAmountBeforeGST: (allgst.eighteenSaleNetAmountBeforeGST || 0) - (allgst.eighteenRetNetAmountBeforeGST || 0),
                    eighteenGSTAmount: (allgst.eighteenSaleGSTAmount || 0) - (allgst.eighteenRetGSTAmount || 0),
                    twentyeightNetAmountBeforeGST: (allgst.twentyeightSaleNetAmountBeforeGST || 0) -
                        (allgst.twentyeightRetNetAmountBeforeGST || 0),
                    twentyeightGSTAmount: (allgst.twentyeightSaleGSTAmount || 0) - (allgst.twentyeightRetGSTAmount || 0),
                };
                OverallGst.push(consolidategst);
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
        for (let jdx in OverallGst) {
            let netcollection = OverallGst[jdx];
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
            StoreMaster: StoreMaster,
            OverallGst: OverallGst,
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
        let key = 'consolidatepurchasegstreport';
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
    public async PrintConsolidateInputGSTSummary(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let Gstcollection: any = [];
        let NetSaleGst: any = [];
        let OverallGst: any = [];

        let SalesReq = req;
        Gstcollection = await this.GetConsolidateInputGstSummary(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(inventoryBo.StorePreferenceBo, this.Request);
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
        if (Gstcollection) {
            let SaleGst = [];
            let SalereturnGst = [];
            if (Gstcollection.length > 0) {
                SaleGst = Gstcollection[0].Value;
            }
            if (Gstcollection.length > 1) {
                SalereturnGst = Gstcollection[1].Value;
            }
            if (SaleGst) {
                for (let idx in SaleGst) {
                    let gstgrpdata = SaleGst[idx];
                    let Key = '';
                    let SaleNetAmountBeforeGST = 0;
                    let SaleNetAmount = 0;
                    let SaleGSTAmount = 0;
                    let SaleCGSTAmount = 0;
                    let SaleSGSTAmount = 0;
                    let gstdata: any = {};
                    for (let ix in gstgrpdata) {
                        gstdata = gstgrpdata[ix];
                        Key = gstdata.GSTPercentage;
                        SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                        SaleNetAmount = gstdata.NetAmount;
                        SaleGSTAmount = gstdata.GSTAmount;
                        SaleCGSTAmount = gstdata.CGSTAmount;
                        SaleSGSTAmount = gstdata.SGSTAmount;
                    }
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            if (item.SaleNetAmountBeforeGST > 0) {
                                item.SaleNetAmountBeforeGST += gstdata.NetAmountBeforeGST;
                            } else {
                                item.SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                            }
                            if (item.SaleNetAmount > 0) {
                                item.SaleNetAmount += gstdata.NetAmount;
                            } else {
                                item.SaleNetAmount = gstdata.NetAmount;
                            }
                            if (item.SaleGSTAmount > 0) {
                                item.SaleGSTAmount += gstdata.GSTAmount;
                            } else {
                                item.SaleGSTAmount = gstdata.GSTAmount;
                            }
                            if (item.SaleCGSTAmount > 0) {
                                item.SaleCGSTAmount += gstdata.CGSTAmount;
                            } else {
                                item.SaleCGSTAmount = gstdata.CGSTAmount;
                            }
                            if (item.SaleSGSTAmount > 0) {
                                item.SaleSGSTAmount += gstdata.SGSTAmount;
                            } else {
                                item.SaleSGSTAmount = gstdata.SGSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                            'SaleNetAmount': SaleNetAmount,
                            'SaleGSTAmount': SaleGSTAmount,
                            'SaleCGSTAmount': SaleCGSTAmount,
                            'SaleSGSTAmount': SaleSGSTAmount,
                        });
                }
            }
            if (SalereturnGst) {
                for (let idx in SalereturnGst) {
                    let retgstgrpdata = SalereturnGst[idx];
                    let Key = '';
                    let RetNetAmountBeforeGST = 0;
                    let RetNetAmount = 0;
                    let RetGSTAmount = 0;
                    let RetCGSTAmount = 0;
                    let RetSGSTAmount = 0;
                    let retgstdata: any = {};
                    for (let ix in retgstgrpdata) {
                        retgstdata = retgstgrpdata[ix];
                        Key = retgstdata.GSTPercentage;
                        RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                        RetNetAmount = retgstdata.NetAmount;
                        RetGSTAmount = retgstdata.GSTAmount;
                        RetCGSTAmount = retgstdata.CGSTAmount;
                        RetSGSTAmount = retgstdata.SGSTAmount;
                    }
                    let valappended = 0;
                    NetSaleGst.forEach(function (item: any) {
                        if (Key === item.Key) {
                            if (item.RetNetAmountBeforeGST > 0) {
                                item.RetNetAmountBeforeGST += retgstdata.NetAmountBeforeGST;
                            } else {
                                item.RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                            }
                            if (item.RetNetAmount > 0) {
                                item.RetNetAmount += retgstdata.NetAmount;
                            } else {
                                item.RetNetAmount = retgstdata.NetAmount;
                            }
                            if (item.RetGSTAmount > 0) {
                                item.RetGSTAmount += retgstdata.GSTAmount;
                            } else {
                                item.RetGSTAmount = retgstdata.GSTAmount;
                            }
                            if (item.RetCGSTAmount > 0) {
                                item.RetCGSTAmount += retgstdata.CGSTAmount;
                            } else {
                                item.RetCGSTAmount = retgstdata.CGSTAmount;
                            }
                            if (item.RetSGSTAmount > 0) {
                                item.RetSGSTAmount += retgstdata.SGSTAmount;
                            } else {
                                item.RetSGSTAmount = retgstdata.SGSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended === 0)
                        NetSaleGst.push({
                            'Key': Key,
                            'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                            'RetNetAmount': RetNetAmount,
                            'RetGSTAmount': RetGSTAmount,
                            'RetCGSTAmount': RetCGSTAmount,
                            'RetSGSTAmount': RetSGSTAmount,
                        });
                }
            }

            for (let idx in NetSaleGst) {
                let allgst = NetSaleGst[idx];
                let consolidategst = {
                    Key: allgst.Key,
                    NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                    NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                    GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                    CGSTAmount: (allgst.SaleCGSTAmount || 0) - (allgst.RetCGSTAmount || 0),
                    SGSTAmount: (allgst.SaleSGSTAmount || 0) - (allgst.RetSGSTAmount || 0),
                };
                OverallGst.push(consolidategst);
            }

        }

        let TotNetAmountBeforeGST = 0;
        let TotNetAmount = 0;
        let TotGSTAmount = 0;
        let TotCGSTAmount = 0;
        let TotSGSTAmount = 0;
        for (let jdx in OverallGst) {
            let netcollection = OverallGst[jdx];
            TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
            TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
            TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
            TotCGSTAmount = TotCGSTAmount + (netcollection.CGSTAmount || 0);
            TotSGSTAmount = TotSGSTAmount + (netcollection.SGSTAmount || 0);
        }
        TotNetAmountBeforeGST = TotNetAmountBeforeGST;
        TotNetAmount = TotNetAmount;
        TotGSTAmount = TotGSTAmount;
        TotCGSTAmount = TotCGSTAmount;
        TotSGSTAmount = TotSGSTAmount;


        let info = {
            NetSaleGst: NetSaleGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            OverallGst: OverallGst,
            Preferences: printPreferencesData,
            TotNetAmountBeforeGST: TotNetAmountBeforeGST,
            TotNetAmount: TotNetAmount,
            TotGSTAmount: TotGSTAmount,
            TotCGSTAmount: TotCGSTAmount,
            TotSGSTAmount: TotSGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'consolidateinputgstsummary';
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

}
