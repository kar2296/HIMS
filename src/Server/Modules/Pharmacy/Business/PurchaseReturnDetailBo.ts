import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseReturnDetailInstance, PurchaseReturnDetailAttributes } from '../Model/Interface/Index';
import { PurchaseReturnDetailFilters } from '../Common/Filters.e';
// import * as moment from 'moment';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
import * as inventoryBo from './Index';
// import * as bo from '../../Pharmacy/Business/Index';

export class PurchaseReturnDetailBo extends BaseBo<PurchaseReturnDetailInstance, PurchaseReturnDetailAttributes>  {
    public async AddPurchaseReturnDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePurchaseReturnDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    /*
    public async ManagePurchaseReturnDetails(PurchaseReturnId: number, details: PurchaseReturnDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PurchaseReturnId = PurchaseReturnId;
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
    */
    public async ManagePurchaseReturnDetails(PurchaseReturnId: number, request: any,
        details: PurchaseReturnDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PurchaseReturnId = PurchaseReturnId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    //await this.Save(detail);
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    /*
                    if (request.Header.PrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManagePrnStockItem(PurchaseReturnId, request, detail);
                    }
                    */
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    /*
                    if (request.Header.PrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManagePrnStockItem(PurchaseReturnId, request, detail);
                    }
                    */
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPurchaseReturnDetailById(req: BaseRequest): Promise<PurchaseReturnDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPurchaseReturnDetails(apiReq?: ApiRequest<PurchaseReturnDetailFilters>):
        Promise<ApiResponse<PurchaseReturnDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ItemMaster, attributes: ['ItemCode', 'ItemName'], required: false });
        //include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        //include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.Grn, required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.ItemVendorMap, as: 'VendorItem', required: false });
        include.push({ model: this.Models.PurchaseReturn, as: 'PurchaseReturn', required: false });
        include.push({ model: this.Models.StockItem, required: false });
        include.push({ model: this.Models.StockSerialItem, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseReturnDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PurchaseReturnDetailFilters.PurchaseReturnId:
                        where['PurchaseReturnId'] = param.Value;
                        break;
                    case PurchaseReturnDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PurchaseReturnDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePurchaseReturnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PurchaseReturnGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        // let GSTGroup: { [id: number]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster, as: 'GstMaster',
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = -1;
                        GSTPercentage = -1;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {

                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {

                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'GstAmount', 'GstId', 'PrnTypeId', 'GrnQuantity',
                    'ConversionQuantity', 'GrossAmount'],
                where: {
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'PurchaseReturn.PrnDate');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let GrnDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * (bills.UnitGstAmount));
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * (bills.UnitGstAmount));
                        GSTId = bills.GstId;
                        GSTPercentage = bills.GstPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        GrnDate = bills.PurchaseReturn.PrnDate;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'PrnQuantity': CalPrnQuantity,
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
    public async ConsolidateReturnGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        // let GSTGroup: { [id: number]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster, as: 'GstMaster',
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {
                    GstPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {
                    GstPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    },
                    required: true
                }],
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    },
                    required: true
                }],
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '18.000000' }
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {
                    GstPercentage: { '$eq': '18.000000' }
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
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
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {

                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$eq': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
                        'GSTId': GSTId,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGst', 'GstPercentage', 'PrnQuantity', 'FreeQty',
                    'NetAmount', 'UnitGstAmount', 'UnitCGstAmount', 'UnitSGstAmount', 'GstAmount', 'GstId', 'PrnTypeId',
                    'GrnQuantity', 'ConversionQuantity'],
                where: {
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    GstPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PurchaseReturn,
                    attributes: ['Id', 'PrnDate', 'StoreMasterId'],
                    where: {
                        PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                        PrnStatusId: { '$in': [2, 3, 4] },
                        FacilityId: req.Data.FacilityId,
                        StoreMasterId: { '$gt': req.Data.StoreMasterId },
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
                    let CalPrnQuantity: number = 0;
                    let GSTPercentage: string = '';
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        let RetQty: number = 0;
                        if (bills.PrnTypeId === 1) {
                            RetQty = bills.PrnQuantity;
                        } else if (bills.PrnTypeId === 2) {
                            RetQty = (bills.GrnQuantity) * (bills.ConversionQuantity);
                        }
                        NetAmount += bills.NetAmount;
                        CalPrnQuantity += RetQty;
                        GSTAmount += ((RetQty) * bills.UnitGstAmount);
                        CGSTAmount += ((RetQty) * bills.UnitCGstAmount);
                        SGSTAmount += ((RetQty) * bills.UnitSGstAmount);
                        NetAmountBeforeGST += bills.NetAmount - ((RetQty) * bills.UnitGstAmount);
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
                        'PrnQuantity': CalPrnQuantity,
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
    public async PrintPurchaseReturnGSTReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let SaleretGst: any = [];
        let NetSaleretGst: any = [];
        let SalesReq = req;
        SaleretGst = await this.PurchaseReturnGSTDetails(SalesReq);
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
        if (SaleretGst) {
            let overallsaleretgst = [];
            let zerosaleretgst = [];
            let fivesaleretgst = [];
            let twelvesaleretgst = [];
            let eighteensaleretgst = [];
            let twentyeightsaleretgst = [];
            for (let gstid in SaleretGst) {
                if (parseInt(gstid) === -1) {
                    overallsaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 1) {
                    zerosaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 7) {
                    twelvesaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 8) {
                    eighteensaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 11) {
                    fivesaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 12) {
                    twentyeightsaleretgst = SaleretGst[gstid];
                }

            }

            for (let idx in zerosaleretgst) {
                let zero_saleretgst = zerosaleretgst[idx];
                let Key = '';
                let ZeroRetNetAmountBeforeGST = 0;
                let ZerRetGSTAmount = 0;
                let year = new Date(zero_saleretgst.GrnDate).getFullYear();
                let month = new Date(zero_saleretgst.GrnDate).getMonth();
                let date = new Date(zero_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = zero_saleretgst.GrnDate;
                ZeroRetNetAmountBeforeGST = zero_saleretgst.NetAmountBeforeGST;
                ZerRetGSTAmount = zero_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = zero_saleretgst.GrnDate;
                        if (item.ZeroRetNetAmountBeforeGST > 0) {
                            item.ZeroRetNetAmountBeforeGST += zero_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.ZeroRetNetAmountBeforeGST = zero_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.ZerRetGSTAmount > 0) {
                            item.ZerRetGSTAmount += zero_saleretgst.GSTAmount;
                        } else {
                            item.ZerRetGSTAmount = zero_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': ZeroRetNetAmountBeforeGST,
                        'ZerRetGSTAmount': ZerRetGSTAmount,
                        'twelveRetNetAmountBeforeGST': 0.00,
                        'twelveRetGSTAmount': 0.00,
                        'eighteenRetNetAmountBeforeGST': 0.00,
                        'eighteenRetGSTAmount': 0.00,
                        'fiveRetNetAmountBeforeGST': 0.00,
                        'fiveRetGSTAmount': 0.00,
                        'twentyeightRetNetAmountBeforeGST': 0.00,
                        'twentyeightRetGSTAmount': 0.00,
                        'RetNetAmountBeforeGST': 0.00,
                        'RetNetAmount': 0.00,
                        'RetGSTAmount': 0.00,
                        'GDate': GDate
                    });
            }
            for (let idx in twelvesaleretgst) {
                let twelve_saleretgst = twelvesaleretgst[idx];
                let Key = '';
                let twelveRetNetAmountBeforeGST = 0;
                let twelveRetGSTAmount = 0;
                let year = new Date(twelve_saleretgst.GrnDate).getFullYear();
                let month = new Date(twelve_saleretgst.GrnDate).getMonth();
                let date = new Date(twelve_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = twelve_saleretgst.GrnDate;
                twelveRetNetAmountBeforeGST = twelve_saleretgst.NetAmountBeforeGST;
                twelveRetGSTAmount = twelve_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = twelve_saleretgst.GrnDate;
                        if (item.twelveRetNetAmountBeforeGST > 0) {
                            item.twelveRetNetAmountBeforeGST += twelve_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.twelveRetNetAmountBeforeGST = twelve_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.twelveRetGSTAmount > 0) {
                            item.twelveRetGSTAmount += twelve_saleretgst.GSTAmount;
                        } else {
                            item.twelveRetGSTAmount = twelve_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': 0.00,
                        'ZerRetGSTAmount': 0.00,
                        'twelveRetNetAmountBeforeGST': twelveRetNetAmountBeforeGST,
                        'twelveRetGSTAmount': twelveRetGSTAmount,
                        'eighteenRetNetAmountBeforeGST': 0.00,
                        'eighteenRetGSTAmount': 0.00,
                        'fiveRetNetAmountBeforeGST': 0.00,
                        'fiveRetGSTAmount': 0.00,
                        'twentyeightRetNetAmountBeforeGST': 0.00,
                        'twentyeightRetGSTAmount': 0.00,
                        'RetNetAmountBeforeGST': 0.00,
                        'RetNetAmount': 0.00,
                        'RetGSTAmount': 0.00,
                        'GDate': GDate

                    });
            }
            for (let idx in eighteensaleretgst) {
                let eighteen_saleretgst = eighteensaleretgst[idx];
                let Key = '';
                let eighteenRetNetAmountBeforeGST = 0;
                let eighteenRetGSTAmount = 0;
                let year = new Date(eighteen_saleretgst.GrnDate).getFullYear();
                let month = new Date(eighteen_saleretgst.GrnDate).getMonth();
                let date = new Date(eighteen_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = eighteen_saleretgst.GrnDate;
                eighteenRetNetAmountBeforeGST = eighteen_saleretgst.NetAmountBeforeGST;
                eighteenRetGSTAmount = eighteen_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = eighteen_saleretgst.GrnDate;
                        if (item.eighteenRetNetAmountBeforeGST > 0) {
                            item.eighteenRetNetAmountBeforeGST += eighteen_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.eighteenRetNetAmountBeforeGST = eighteen_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.eighteenRetGSTAmount > 0) {
                            item.eighteenRetGSTAmount += eighteen_saleretgst.GSTAmount;
                        } else {
                            item.eighteenRetGSTAmount = eighteen_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': 0.00,
                        'ZerRetGSTAmount': 0.00,
                        'twelveRetNetAmountBeforeGST': 0.00,
                        'twelveRetGSTAmount': 0.00,
                        'eighteenRetNetAmountBeforeGST': eighteenRetNetAmountBeforeGST,
                        'eighteenRetGSTAmount': eighteenRetGSTAmount,
                        'fiveRetNetAmountBeforeGST': 0.00,
                        'fiveRetGSTAmount': 0.00,
                        'twentyeightRetNetAmountBeforeGST': 0.00,
                        'twentyeightRetGSTAmount': 0.00,
                        'RetNetAmountBeforeGST': 0.00,
                        'RetNetAmount': 0.00,
                        'RetGSTAmount': 0.00,
                        'GDate': GDate

                    });
            }
            for (let idx in fivesaleretgst) {
                let five_saleretgst = fivesaleretgst[idx];
                let Key = '';
                let fiveRetNetAmountBeforeGST = 0;
                let fiveRetGSTAmount = 0;
                let year = new Date(five_saleretgst.GrnDate).getFullYear();
                let month = new Date(five_saleretgst.GrnDate).getMonth();
                let date = new Date(five_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = five_saleretgst.GrnDate;
                fiveRetNetAmountBeforeGST = five_saleretgst.NetAmountBeforeGST;
                fiveRetGSTAmount = five_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = five_saleretgst.GrnDate;
                        if (item.fiveRetNetAmountBeforeGST > 0) {
                            item.fiveRetNetAmountBeforeGST += five_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.fiveRetNetAmountBeforeGST = five_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.fiveRetGSTAmount > 0) {
                            item.fiveRetGSTAmount += five_saleretgst.GSTAmount;
                        } else {
                            item.fiveRetGSTAmount = five_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': 0.00,
                        'ZerRetGSTAmount': 0.00,
                        'twelveRetNetAmountBeforeGST': 0.00,
                        'twelveRetGSTAmount': 0.00,
                        'eighteenRetNetAmountBeforeGST': 0.00,
                        'eighteenRetGSTAmount': 0.00,
                        'fiveRetNetAmountBeforeGST': fiveRetNetAmountBeforeGST,
                        'fiveRetGSTAmount': fiveRetGSTAmount,
                        'twentyeightRetNetAmountBeforeGST': 0.00,
                        'twentyeightRetGSTAmount': 0.00,
                        'RetNetAmountBeforeGST': 0.00,
                        'RetNetAmount': 0.00,
                        'RetGSTAmount': 0.00,
                        'GDate': GDate

                    });
            }
            for (let idx in twentyeightsaleretgst) {
                let twentyeight_saleretgst = twentyeightsaleretgst[idx];
                let Key = '';
                let twentyeightRetNetAmountBeforeGST = 0;
                let twentyeightRetGSTAmount = 0;
                let year = new Date(twentyeight_saleretgst.GrnDate).getFullYear();
                let month = new Date(twentyeight_saleretgst.GrnDate).getMonth();
                let date = new Date(twentyeight_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = twentyeight_saleretgst.GrnDate;
                twentyeightRetNetAmountBeforeGST = twentyeight_saleretgst.NetAmountBeforeGST;
                twentyeightRetGSTAmount = twentyeight_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = twentyeight_saleretgst.GrnDate;
                        if (item.twentyeightRetNetAmountBeforeGST > 0) {
                            item.twentyeightRetNetAmountBeforeGST += twentyeight_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.twentyeightRetNetAmountBeforeGST = twentyeight_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.twentyeightRetGSTAmount > 0) {
                            item.twentyeightRetGSTAmount += twentyeight_saleretgst.GSTAmount;
                        } else {
                            item.twentyeightRetGSTAmount = twentyeight_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': 0.00,
                        'ZerRetGSTAmount': 0.00,
                        'twelveRetNetAmountBeforeGST': 0.00,
                        'twelveRetGSTAmount': 0.00,
                        'eighteenRetNetAmountBeforeGST': 0.00,
                        'eighteenRetGSTAmount': 0.00,
                        'fiveRetNetAmountBeforeGST': 0.00,
                        'fiveRetGSTAmount': 0.00,
                        'twentyeightRetNetAmountBeforeGST': twentyeightRetNetAmountBeforeGST,
                        'twentyeightRetGSTAmount': twentyeightRetGSTAmount,
                        'RetNetAmountBeforeGST': 0.00,
                        'RetNetAmount': 0.00,
                        'RetGSTAmount': 0.00,
                        'GDate': GDate

                    });
            }
            for (let idx in overallsaleretgst) {
                let overall_saleretgst = overallsaleretgst[idx];
                let Key = '';
                let RetNetAmountBeforeGST = 0;
                let RetNetAmount = 0;
                let RetGSTAmount = 0;
                let year = new Date(overall_saleretgst.GrnDate).getFullYear();
                let month = new Date(overall_saleretgst.GrnDate).getMonth();
                let date = new Date(overall_saleretgst.GrnDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let GDate = overall_saleretgst.GrnDate;
                RetNetAmountBeforeGST = overall_saleretgst.NetAmountBeforeGST;
                RetNetAmount = overall_saleretgst.NetAmount;
                RetGSTAmount = overall_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.GDate = overall_saleretgst.GrnDate;
                        if (item.RetNetAmountBeforeGST > 0) {
                            item.RetNetAmountBeforeGST += overall_saleretgst.NetAmountBeforeGST;
                        } else {
                            item.RetNetAmountBeforeGST = overall_saleretgst.NetAmountBeforeGST;
                        }
                        if (item.RetNetAmount > 0) {
                            item.RetNetAmount += overall_saleretgst.NetAmount;
                        } else {
                            item.RetNetAmount = overall_saleretgst.NetAmount;
                        }
                        if (item.RetGSTAmount > 0) {
                            item.RetGSTAmount += overall_saleretgst.GSTAmount;
                        } else {
                            item.RetGSTAmount = overall_saleretgst.GSTAmount;
                        }
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSaleretGst.push({
                        'Key': Key,
                        'ZeroRetNetAmountBeforeGST': 0.00,
                        'ZerRetGSTAmount': 0.00,
                        'twelveRetNetAmountBeforeGST': 0.00,
                        'twelveRetGSTAmount': 0.00,
                        'eighteenRetNetAmountBeforeGST': 0.00,
                        'eighteenRetGSTAmount': 0.00,
                        'fiveRetNetAmountBeforeGST': 0.00,
                        'fiveRetGSTAmount': 0.00,
                        'twentyeightRetNetAmountBeforeGST': 0.00,
                        'twentyeightRetGSTAmount': 0.00,
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
        NetSaleretGst.sort(Sort_Date);

        let TotRetNetAmountBeforeGST = 0;
        let TotRetNetAmount = 0;
        let TotRetGSTAmount = 0;
        let TotZeroRetNetAmountBeforeGST = 0;
        let TotZerRetGSTAmount = 0;
        let TotfiveRetNetAmountBeforeGST = 0;
        let TotfiveRetGSTAmount = 0;
        let TottwelveRetNetAmountBeforeGST = 0;
        let TottwelveRetGSTAmount = 0;
        let ToteighteenRetNetAmountBeforeGST = 0;
        let ToteighteenRetGSTAmount = 0;
        let TottwentyeightRetNetAmountBeforeGST = 0;
        let TottwentyeightRetGSTAmount = 0;
        for (let jdx in NetSaleretGst) {
            let netcollection = NetSaleretGst[jdx];
            TotRetNetAmountBeforeGST = TotRetNetAmountBeforeGST + (netcollection.RetNetAmountBeforeGST || 0);
            TotRetNetAmount = TotRetNetAmount + (netcollection.RetNetAmount || 0);
            TotRetGSTAmount = TotRetGSTAmount + (netcollection.RetGSTAmount || 0);
            TotZeroRetNetAmountBeforeGST = TotZeroRetNetAmountBeforeGST + (netcollection.ZeroRetNetAmountBeforeGST || 0);
            TotZerRetGSTAmount = TotZerRetGSTAmount + (netcollection.ZerRetGSTAmount || 0);
            TotfiveRetNetAmountBeforeGST = TotfiveRetNetAmountBeforeGST + (netcollection.fiveRetNetAmountBeforeGST || 0);
            TotfiveRetGSTAmount = TotfiveRetGSTAmount + (netcollection.fiveRetGSTAmount || 0);
            TottwelveRetNetAmountBeforeGST = TottwelveRetNetAmountBeforeGST + (netcollection.twelveRetNetAmountBeforeGST || 0);
            TottwelveRetGSTAmount = TottwelveRetGSTAmount + (netcollection.twelveRetGSTAmount || 0);
            ToteighteenRetNetAmountBeforeGST = ToteighteenRetNetAmountBeforeGST + (netcollection.eighteenRetNetAmountBeforeGST || 0);
            ToteighteenRetGSTAmount = ToteighteenRetGSTAmount + (netcollection.eighteenRetGSTAmount || 0);
            TottwentyeightRetNetAmountBeforeGST = TottwentyeightRetNetAmountBeforeGST +
                (netcollection.twentyeightRetNetAmountBeforeGST || 0);
            TottwentyeightRetGSTAmount = TottwentyeightRetGSTAmount + (netcollection.twentyeightRetGSTAmount || 0);
        }
        TotRetNetAmountBeforeGST = TotRetNetAmountBeforeGST;
        TotRetNetAmount = TotRetNetAmount;
        TotRetGSTAmount = TotRetGSTAmount;
        TotZeroRetNetAmountBeforeGST = TotZeroRetNetAmountBeforeGST;
        TotZerRetGSTAmount = TotZerRetGSTAmount;
        TotfiveRetNetAmountBeforeGST = TotfiveRetNetAmountBeforeGST;
        TotfiveRetGSTAmount = TotfiveRetGSTAmount;
        TottwelveRetNetAmountBeforeGST = TottwelveRetNetAmountBeforeGST;
        TottwelveRetGSTAmount = TottwelveRetGSTAmount;
        ToteighteenRetNetAmountBeforeGST = ToteighteenRetNetAmountBeforeGST;
        ToteighteenRetGSTAmount = ToteighteenRetGSTAmount;
        TottwentyeightRetNetAmountBeforeGST = TottwentyeightRetNetAmountBeforeGST;
        TottwentyeightRetGSTAmount = TottwentyeightRetGSTAmount;



        let info = {
            NetSaleretGst: NetSaleretGst,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            Preferences: printPreferencesData,
            TotRetNetAmountBeforeGST: TotRetNetAmountBeforeGST,
            TotRetNetAmount: TotRetNetAmount,
            TotRetGSTAmount: TotRetGSTAmount,
            TotZeroRetNetAmountBeforeGST: TotZeroRetNetAmountBeforeGST,
            TotZerRetGSTAmount: TotZerRetGSTAmount,
            TotfiveRetNetAmountBeforeGST: TotfiveRetNetAmountBeforeGST,
            TotfiveRetGSTAmount: TotfiveRetGSTAmount,
            TottwelveRetNetAmountBeforeGST: TottwelveRetNetAmountBeforeGST,
            TottwelveRetGSTAmount: TottwelveRetGSTAmount,
            ToteighteenRetNetAmountBeforeGST: ToteighteenRetNetAmountBeforeGST,
            ToteighteenRetGSTAmount: ToteighteenRetGSTAmount,
            TottwentyeightRetNetAmountBeforeGST: TottwentyeightRetNetAmountBeforeGST,
            TottwentyeightRetGSTAmount: TottwentyeightRetGSTAmount,

        };
        let pdfOption: any = null;
        let key = 'purchasereturngstreport';
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

    public GetModel(): SStatic.Model<PurchaseReturnDetailInstance, PurchaseReturnDetailAttributes> {
        return this.Models.PurchaseReturnDetail;
    }

}
