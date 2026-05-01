import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockMovementInstance, StockMovementAttributes } from '../Model/Interface/Index';
import { GrnDetailAttributes, PurchaseReturnDetailAttributes, StockSerialItemAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockMovementFilters } from '../Common/Filters.e';
import * as _ from 'lodash';
import { join } from 'path';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import moment = require('moment');

export class StockMovementBo extends BaseBo<StockMovementInstance, StockMovementAttributes> {

    public async AddStockMovement(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
        let StockMovementId = result.dataValues.Id;
        await detailBO.ManageStockSerialMovements(StockMovementId, req.Data.Details);
        return StockMovementId;
    }

    public async UpdateStockMovement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
        let StockMovementId = req.Data.Header.Id;
        await detailBO.ManageStockSerialMovements(StockMovementId, req.Data.Details);
        return result;
    }

    public async GetStockMovementById(req: BaseRequest): Promise<StockMovementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockDailyMovements(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.CurrentMovements(req) });
        result.push({ Key: 2, Value: await this.PrevMovements(req) });
        return result;
    }

    public async CurrentMovements(req: BaseRequest): Promise<any> {
        let ItemGroup: { [id: number]: any[] } = {};
        let ProductGroupJoin: any = {
            model: this.Models.ProductType,
            attributes: ['ProductTypeName'],
            required: true,
        };
        let ItemGroupJoin: any = {
            model: this.Models.ItemMaster, required: true,
            include: [ProductGroupJoin]
        };
        if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId > 0) {
            let CurrentmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    TransactionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                },
                include: [ItemGroupJoin]
            });
            if (CurrentmoveInstance) {
                let groupbills = _.groupBy(CurrentmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        // Quantity += bills.Quantity;
                        Openingqty = openqty.TotalAFQty;
                        InQty += bills.InQty;
                        OutQty += bills.OutQty;
                        closingQty = bills.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId > 0) {
            let CurrentmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    TransactionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                },
                include: [ItemGroupJoin]
            });
            if (CurrentmoveInstance) {
                let groupbills = _.groupBy(CurrentmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        // Quantity += bills.Quantity;
                        Openingqty = openqty.TotalAFQty;
                        InQty += bills.InQty;
                        OutQty += bills.OutQty;
                        closingQty = bills.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId === 0) {
            let CurrentmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    TransactionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                },
                include: [ItemGroupJoin]
            });
            if (CurrentmoveInstance) {
                let groupbills = _.groupBy(CurrentmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        // Quantity += bills.Quantity;
                        Openingqty = openqty.TotalAFQty;
                        InQty += bills.InQty;
                        OutQty += bills.OutQty;
                        closingQty = bills.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId === 0) {
            let CurrentmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    TransactionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                },
                include: [ItemGroupJoin]
            });
            if (CurrentmoveInstance) {
                let groupbills = _.groupBy(CurrentmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        // Quantity += bills.Quantity;
                        Openingqty = openqty.TotalAFQty;
                        InQty += bills.InQty;
                        OutQty += bills.OutQty;
                        closingQty = bills.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        }
        return ItemGroup;
    }

    public async PrevMovements(req: BaseRequest): Promise<any> {
        let ItemGroup: { [id: number]: any[] } = {};
        let ProductGroupJoin: any = {
            model: this.Models.ProductType,
            attributes: ['ProductTypeName'],
            required: true,
        };
        let ItemGroupJoin: any = {
            model: this.Models.ItemMaster, required: true,
            include: [ProductGroupJoin]
        };
        if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId > 0) {
            let PreviousmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    TransactionDate: { '$lt': req.Data.FromDate },

                },
                include: [ItemGroupJoin]
            });
            if (PreviousmoveInstance) {
                let groupbills = _.groupBy(PreviousmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let Openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        Openingqty = Openqty.TotalAFQty;
                        // InQty = bills.InQty;
                        // OutQty = bills.OutQty;
                        closingQty = Openqty.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId > 0) {
            let PreviousmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    TransactionDate: { '$lt': req.Data.FromDate },

                },
                include: [ItemGroupJoin]
            });
            if (PreviousmoveInstance) {
                let groupbills = _.groupBy(PreviousmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let Openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        Openingqty = Openqty.TotalAFQty;
                        // InQty = bills.InQty;
                        // OutQty = bills.OutQty;
                        closingQty = Openqty.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId > 0) {
            let PreviousmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    TransactionDate: { '$lt': req.Data.FromDate },

                },
                include: [ItemGroupJoin]
            });
            if (PreviousmoveInstance) {
                let groupbills = _.groupBy(PreviousmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let Openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        Openingqty = Openqty.TotalAFQty;
                        // InQty = bills.InQty;
                        // OutQty = bills.OutQty;
                        closingQty = Openqty.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId === 0) {
            let PreviousmoveInstance: any = await this.FindAll({
                attributes: ['Id', 'StockItemId', 'ItemMasterId', 'TransactionNumber', 'TransactionDate', 'TotalBFQty',
                    'InQty', 'OutQty', 'TotalAFQty', 'StoreMasterId', 'FacilityId', 'Ucp', 'Mrp'],
                where: {
                    FacilityId: { '$eq': req.Data.FacilityId },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    TransactionDate: { '$lt': req.Data.FromDate },

                },
                include: [ItemGroupJoin]
            });
            if (PreviousmoveInstance) {
                let groupbills = _.groupBy(PreviousmoveInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ldx = groupedBills.length - 1;
                    let Openqty = groupedBills[ldx];
                    let ProductName: any = '';
                    let ItemName: any = '';
                    let ItemId: number = 0;
                    let Openingqty: number = 0;
                    let OutQty: number = 0;
                    let InQty: number = 0;
                    let closingQty: number = 0;
                    let Ucp: number = 0;
                    let Mrp: number = 0;
                    let Movlength: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        Movlength = groupedBills.length;
                        let itemmaster = bills.ItemMaster;
                        ProductName = itemmaster.ProductType.ProductTypeName;
                        ItemName = itemmaster.ItemName;
                        Openingqty = Openqty.TotalAFQty;
                        // InQty = bills.InQty;
                        // OutQty = bills.OutQty;
                        closingQty = Openqty.TotalAFQty;
                        Ucp += bills.Ucp;
                        Mrp += bills.Mrp;
                        ItemId = bills.ItemMasterId;
                        ItemGroup[ItemId] = ItemGroup[ItemId] || [];
                    }
                    let info = {
                        'ProductName': ProductName,
                        'ItemName': ItemName,
                        'Openingqty': Openingqty,
                        'InQty': InQty,
                        'OutQty': OutQty,
                        'closingQty': closingQty,
                        'Ucp': Ucp,
                        'Mrp': Mrp,
                        'movlength': Movlength
                    };
                    ItemGroup[ItemId].push(info);
                }
            }
        }
        return ItemGroup;
    }

    public async GetStockMovements(apiReq?: ApiRequest<StockMovementFilters>): Promise<ApiResponse<StockMovementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let ItemWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('TransactionType'));
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStoreMaster', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockMovementFilters.Id:
                        where['StockMovementId'] = param.Value;
                        break;
                    case StockMovementFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockMovementFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockMovementFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockMovementFilters.TransactionDate:
                        where['TransactionDate'] = { '$between': param.Value };
                        break;
                    case StockMovementFilters.From:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockMovementFilters.To:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockMovementFilters.FromCreated:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case StockMovementFilters.ToCreated:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case StockMovementFilters.TransactionTypeId:
                        where['TransactionTypeId'] = param.Value;
                        break;
                    case StockMovementFilters.ProductTypeId:
                        ItemWhere['ProductTypeId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case StockMovementFilters.TransactionId:
                        where['TransactionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        order.push(['StockMovementId', 'DESC']);

        include.push({
            model: this.Models.ItemMaster,
            attributes: ['ItemName', 'ProductTypeId', 'ProductRegNo',
                'SubCategoryId'], required: isReqItemSearch, where: ItemWhere,
            include: [
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.PatientBills,
            attributes: ['Id', 'PatientMrn', 'PatientName', 'PatientId'],
            required: false,
            where: { 'IsPharmacyBill': true },
        });
        include.push({
            model: this.Models.PatientReturns,
            attributes: ['Id', 'PatientMRN', 'PatientName', 'PatientId'],
            required: false,
        });
        include.push({
            model: this.Models.PatientDispense,
            attributes: ['Id', 'PatientId'],
            include: [{
                model: this.Models.Patient, attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN'],
                required: false,
                include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
            }],
            required: false,
        });
        include.push({
            model: this.Models.PatientDispenseReturn,
            attributes: ['Id', 'PatientId'],
            include: [{
                model: this.Models.Patient, attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN'],
                required: false,
                include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
            }],
            required: false,
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStockMovement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StockMovementInstance, StockMovementAttributes> {
        return this.Models.StockMovement;
    }

    public async GetClosingStockByFilter(req: BaseRequest): Promise<any> {
        let stockmovement = null;
        let filterInfo = req.Data;
        let stockmovementInstance = await this.Find({
            where: {
                StoreMasterId: filterInfo.StoreMasterId,
                ItemMasterId: filterInfo.ItemMasterId
            },
            order: [['StockMovementId', 'DESC']],
            limit: 1
        });
        if (stockmovementInstance) {
            stockmovement = this.GetAttribute(stockmovementInstance);
        }
        return stockmovement;
    }

    public async ManageStockMovements(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let StDetails: any = [];
        if (request.Details.length > 0) {
            for (let sdx in request.Details) {
                let stitem = request.Details[sdx];
                if (stitem.Status === 1) {
                    StDetails.push(stitem);
                }
            }
        }
        let details: Array<any> = StDetails;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManageStockMovement(TransactionType, TransactionId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManageStockMovements1(TransactionType: number, TransactionId: number, request: any): Promise<any> {
        let StDetails: any = [];
        if (request.Details.length > 0) {
            for (let sdx in request.Details) {
                let stitem = request.Details[sdx];
                if (stitem.Status === 1) {
                    StDetails.push(stitem);
                }
            }
        }
        let details: Array<any> = StDetails;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });
        for (var gi = 0; gi < groupedItems.length; gi++) {
            await this.ManageStockMovement1(TransactionType, TransactionId, request, groupedItems[gi]);
        }

        return _.filter(groupedItems, (item: any) => { return item.error !== null; });
    }

    public async ManageStockMovement1(TransactionType: number, TransactionId: number,
        request: any, itemInfo: any): Promise<void> {
        let details = itemInfo.batches;
        let TransNo = null;
        let TransRef = null;
        let TransDate = null;
        let InComingQty = 0;
        let OutGoingQty = 0;
        let FromStoreId = 0;
        let ToStoreId = 0;
        let StoreId = 0;
        let FacilityId = 0;
        let Ucp = null;
        let Mrp = null;
        try {
            if (TransactionType === 1) {
                TransNo = request.Header.StockEntryNumber;
                TransRef = request.Header.StoreName;
                TransDate = request.Header.StockEntryDate;
                InComingQty = _.sumBy(details, (detail: any) => Number(detail.TotalConversionQuantity));
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 3) {
                let Qty: number = 0;
                if (details[0].IsReusable) {
                    Qty = details[0].MinQtyConv;
                } else {
                    Qty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
                }
                TransNo = request.Header.GrnNumber;
                TransRef = request.Header.VendorName;
                TransDate = request.Header.GrnDate;
                InComingQty = Qty;
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    // Ucp = detail.UnitCostPrice;

                    if (detail.NetAmount && detail.NetAmount > 0) {
                        if (detail.TotalQuantityAfterConversion > 0) {
                            Ucp = (detail.NetAmount) / (detail.TotalQuantityAfterConversion);
                        } else {
                            Ucp = (detail.UnitCostPrice || 0);
                        }
                    } else {
                        Ucp = (detail.UnitCostPrice || 0);
                    }
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 5) {
                var PrnQty = 0;
                if (request.Header.PrnTypeId === 2) {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
                } else {
                    PrnQty = _.sumBy(details, (detail: any) => Number(detail.PrnQuantity));
                }

                TransNo = request.Header.PrnNumber;
                TransRef = request.Header.VendorName;
                TransDate = request.Header.PrnDate;
                OutGoingQty = PrnQty;
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 9) {
                TransNo = request.Header.TransferNumber;
                TransRef = request.Header.ToStoreName;
                TransDate = request.Header.TransferDate;
                OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity));
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.ToStoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 13) {
                TransNo = request.Header.StockConsumptionNumber;
                TransRef = request.Header.StoreName;
                TransDate = request.Header.ConsumptionDate;
                OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.QtyConsumed));
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 15) {
                var AdjInQty = 0;
                var AdjOutQty = 0;
                if (request.Header.AdjustmentTypeId === 1) {
                    AdjInQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
                }
                if (request.Header.AdjustmentTypeId === 2) {
                    AdjOutQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
                }
                TransNo = request.Header.StockAdjustmentNumber;
                TransRef = request.Header.StoreName;
                TransDate = request.Header.AdjustedDate;
                InComingQty = AdjInQty;
                OutGoingQty = AdjOutQty;
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.ToStoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 19) {
                TransNo = request.Header.DispenseNumber;
                TransRef = request.Header.PatientName;
                TransDate = request.Header.DispenseDateTime;
                OutGoingQty = _.sumBy(details, (detail: any) => detail.DispensedQuantity);
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 20) {
                TransNo = request.Header.DispenseReturnNumber;
                TransRef = request.Header.PatientName;
                TransDate = request.Header.DispenseReturnDateTime;
                InComingQty = _.sumBy(details, (detail: any) => detail.AcceptedQuantity);
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 21) {
                let OutQty = 0;
                for (let idx in details) {
                    let detail = details[idx];
                    if (detail.IsMultiUse) {
                        if (!detail.PendingTransactions) {
                            // OutQty = 1;
                            OutQty = _.sumBy(details, (detail: any) => Number(detail.ConsumedTransactions));
                        } else if (Number(detail.ConsumedPerTransactions) === Number(detail.ItemPossibleTransactions)) {
                            OutQty = 1;
                        } else if (Number(detail.ConsumedPerTransactions) > Number(detail.ItemPossibleTransactions)) {
                            if (Number(detail.ConsumedTransactions) === Number(detail.ItemPossibleTransactions)) {
                                OutQty = 1;
                            } else if (Number(detail.ConsumedTransactions) > Number(detail.ItemPossibleTransactions)) {
                                let ConsumeTrans =
                                    Number(detail.ConsumedTransactions) % Number(detail.ItemPossibleTransactions);
                                let CTrans = Math.trunc(ConsumeTrans);
                                let ConsumedTrans =
                                    Number(detail.ConsumedPerTransactions) / Number(detail.ItemPossibleTransactions);
                                let OutTrans = Math.trunc(ConsumedTrans);
                                if (CTrans === 0 || 1) {
                                    OutQty = OutTrans;
                                } else {
                                    OutQty = 0;
                                }
                            } else if (Number(detail.ConsumedTransactions) < Number(detail.ItemPossibleTransactions)) {
                                OutQty = 0;
                            }
                        } else if (Number(detail.ConsumedPerTransactions) < Number(detail.ItemPossibleTransactions)) {
                            OutQty = 0;
                        }
                        // else {
                        //     OutQty = 0;
                        // }
                    } else {
                        OutQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
                    }
                }

                if (request.Header.BillNumber) {
                    TransNo = request.Header.BillNumber;
                } else {
                    TransNo = '';
                }

                TransRef = request.Header.PatientName;
                TransDate = request.Header.BillDateTime;
                OutGoingQty = OutQty;
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.ToStoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = (detail.UnitCostPrice) ? detail.UnitCostPrice : 0;
                    Mrp = (detail.MrPrice) ? detail.MrPrice : 0;
                }
            } else if (TransactionType === 22) {
                let InQty = 0;
                for (let idx in details) {
                    let detail = details[idx];
                    if (detail.IsMultiUse) {
                        if (Number(detail.NoOfTransactions) === Number(detail.ConsumedTransactions)) {
                            // InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                            InQty = 1;
                        } else if (Number(detail.NoOfTransactions) > Number(detail.ConsumedTransactions)) {
                            InQty = 0;
                        } else if (Number(detail.NoOfTransactions) < Number(detail.ConsumedTransactions)) {
                            InQty = 1;
                            // InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                        }
                    } else {
                        InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                    }
                }
                if (request.Header.ReturnNumber) {
                    TransNo = request.Header.ReturnNumber;
                } else {
                    TransNo = '';
                }

                // TransNo = request.Header.ReturnNumber;
                TransRef = request.Header.PatientName;
                TransDate = request.Header.ReturnDateTime;
                InComingQty = InQty;
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.ToStoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 23) {
                TransNo = request.Header.AcceptanceNumber;
                TransRef = request.Header.StoreName;
                TransDate = request.Header.AcceptedDate;
                InComingQty = _.sumBy(details, (detail: any) => Number(detail.AcceptedQuantity));
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.ToStoreMasterId;
                StoreId = request.Header.ToStoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            } else if (TransactionType === 24) {
                TransNo = request.Header.BillNumber;
                TransDate = request.Header.BillDateTime;
                OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
                FromStoreId = request.Header.StoreMasterId;
                ToStoreId = request.Header.StoreMasterId;
                StoreId = request.Header.StoreMasterId;
                FacilityId = request.Header.FacilityId;
                for (let mdx in details) {
                    let detail = details[mdx];
                    Ucp = detail.UnitCostPrice;
                    Mrp = detail.MrPrice;
                }
            }

            let movement = {
                StockItemId: details[0].StockItemId,
                ItemMasterId: details[0].ItemMasterId,
                TransactionTypeId: TransactionType,
                TransactionId: TransactionId,
                // TransactionDetailId: itemInfo.Id,
                TransactionNumber: TransNo,
                TransactionReference: TransRef,
                TransactionDate: TransDate,
                TotalBFQty: 0,
                InQty: InComingQty,
                OutQty: OutGoingQty,
                IsMultiUse: details[0].IsMultiUse,
                TotalTransactions: details[0].TotalTransactions,
                ConsumedTransactions: details[0].ConsumedTransactions,
                PendingTransactions: details[0].PendingTransactions,
                ItemPossibleTransactions: details[0].ItemPossibleTransactions,
                TotalAFQty: 0,
                FromStoreMasterId: FromStoreId,
                ToStoreMasterId: ToStoreId,
                StoreMasterId: StoreId,
                FacilityId: FacilityId,
                OrgId: 0,
                Ucp: (Ucp) ? Ucp : 0,
                Mrp: (Mrp) ? Mrp : 0,
            };
            await this.ManageMovement(movement as any, details);
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            // itemInfo.error = { name: details[0].ItemName };
            // itemInfo.error = { name: 'Undefined' };
            throw { message: 'Some Network Issue.. Please Try Again' };
        }
        //await this.ManageMovement(movement as any, details);
    }

    public async ManageStockMovement(TransactionType: number, TransactionId: number,
        request: any, details: Array<any>): Promise<void> {
        let TransNo = null;
        let TransRef = null;
        let TransDate = null;
        let InComingQty = 0;
        let OutGoingQty = 0;
        let FromStoreId = 0;
        let ToStoreId = 0;
        let StoreId = 0;
        let FacilityId = 0;
        let Ucp = null;
        let Mrp = null;
        if (TransactionType === 1) {
            TransNo = request.Header.StockEntryNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.StockEntryDate;
            InComingQty = _.sumBy(details, (detail: any) => Number(detail.TotalConversionQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 3) {
            TransNo = request.Header.GrnNumber;
            TransRef = request.Header.VendorName;
            TransDate = request.Header.GrnDate;
            InComingQty = _.sumBy(details, (detail: any) => detail.TotalQuantityAfterConversion);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 5) {
            var PrnQty = 0;
            if (request.Header.PrnTypeId === 2) {
                PrnQty = _.sumBy(details, (detail: any) => Number(detail.TotalQuantityAfterConversion));
            } else {
                PrnQty = _.sumBy(details, (detail: any) => Number(detail.PrnQuantity));
            }

            TransNo = request.Header.PrnNumber;
            TransRef = request.Header.VendorName;
            TransDate = request.Header.PrnDate;
            OutGoingQty = PrnQty;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 9) {
            TransNo = request.Header.TransferNumber;
            TransRef = request.Header.ToStoreName;
            TransDate = request.Header.TransferDate;
            OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.TransferedQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 13) {
            TransNo = request.Header.StockConsumptionNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.ConsumptionDate;
            OutGoingQty = _.sumBy(details, (detail: any) => detail.QtyConsumed);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 15) {
            var AdjInQty = 0;
            var AdjOutQty = 0;
            if (request.Header.AdjustmentTypeId === 1) {
                AdjInQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
            }
            if (request.Header.AdjustmentTypeId === 2) {
                AdjOutQty = _.sumBy(details, (detail: any) => Number(detail.QtyAdjusted));
            }
            TransNo = request.Header.StockAdjustmentNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.AdjustedDate;
            InComingQty = AdjInQty;
            OutGoingQty = AdjOutQty;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 19) {
            TransNo = request.Header.DispenseNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.DispenseDateTime;
            OutGoingQty = _.sumBy(details, (detail: any) => detail.DispensedQuantity);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 20) {
            TransNo = request.Header.DispenseReturnNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.DispenseReturnDateTime;
            InComingQty = _.sumBy(details, (detail: any) => detail.AcceptedQuantity);
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 21) {
            let OutQty = 0;
            for (let idx in details) {
                let detail = details[idx];
                if (detail.IsMultiUse) {
                    if (!detail.PendingTransactions) {
                        // OutQty = 1;
                        OutQty = _.sumBy(details, (detail: any) => Number(detail.ConsumedTransactions));
                    } else if (Number(detail.ConsumedPerTransactions) === Number(detail.ItemPossibleTransactions)) {
                        OutQty = 1;
                    } else if (Number(detail.ConsumedPerTransactions) > Number(detail.ItemPossibleTransactions)) {
                        if (Number(detail.ConsumedTransactions) === Number(detail.ItemPossibleTransactions)) {
                            OutQty = 1;
                        } else if (Number(detail.ConsumedTransactions) > Number(detail.ItemPossibleTransactions)) {
                            let ConsumeTrans =
                                Number(detail.ConsumedTransactions) % Number(detail.ItemPossibleTransactions);
                            let CTrans = Math.trunc(ConsumeTrans);
                            let ConsumedTrans =
                                Number(detail.ConsumedPerTransactions) / Number(detail.ItemPossibleTransactions);
                            let OutTrans = Math.trunc(ConsumedTrans);
                            if (CTrans === 0 || 1) {
                                OutQty = OutTrans;
                            } else {
                                OutQty = 0;
                            }
                        } else if (Number(detail.ConsumedTransactions) < Number(detail.ItemPossibleTransactions)) {
                            OutQty = 0;
                        }
                    } else if (Number(detail.ConsumedPerTransactions) < Number(detail.ItemPossibleTransactions)) {
                        OutQty = 0;
                    }
                    // else {
                    //     OutQty = 0;
                    // }
                } else {
                    OutQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
                }
            }
            TransNo = request.Header.BillNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.BillDateTime;
            OutGoingQty = OutQty;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = (detail.UnitCostPrice) ? detail.UnitCostPrice : 0;
                Mrp = (detail.MrPrice) ? detail.MrPrice : 0;
            }
        } else if (TransactionType === 22) {
            let InQty = 0;
            for (let idx in details) {
                let detail = details[idx];
                if (detail.IsMultiUse) {
                    if (Number(detail.NoOfTransactions) === Number(detail.ConsumedTransactions)) {
                        // InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                        InQty = 1;
                    } else if (Number(detail.NoOfTransactions) > Number(detail.ConsumedTransactions)) {
                        InQty = 0;
                    } else if (Number(detail.NoOfTransactions) < Number(detail.ConsumedTransactions)) {
                        InQty = 1;
                        // InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                    }
                } else {
                    InQty = _.sumBy(details, (detail: any) => detail.ReturnQuantity);
                }
            }
            TransNo = request.Header.ReturnNumber;
            TransRef = request.Header.PatientName;
            TransDate = request.Header.ReturnDateTime;
            InComingQty = InQty;
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 23) {
            TransNo = request.Header.AcceptanceNumber;
            TransRef = request.Header.StoreName;
            TransDate = request.Header.AcceptedDate;
            InComingQty = _.sumBy(details, (detail: any) => Number(detail.AcceptedQuantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.ToStoreMasterId;
            StoreId = request.Header.ToStoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        } else if (TransactionType === 24) {
            TransNo = request.Header.BillNumber;
            TransDate = request.Header.BillDateTime;
            OutGoingQty = _.sumBy(details, (detail: any) => Number(detail.Quantity));
            FromStoreId = request.Header.StoreMasterId;
            ToStoreId = request.Header.StoreMasterId;
            StoreId = request.Header.StoreMasterId;
            FacilityId = request.Header.FacilityId;
            for (let mdx in details) {
                let detail = details[mdx];
                Ucp = detail.UnitCostPrice;
                Mrp = detail.MrPrice;
            }
        }

        try {
            let movement = {
                StockItemId: details[0].StockItemId,
                ItemMasterId: details[0].ItemMasterId,
                TransactionTypeId: TransactionType,
                TransactionId: TransactionId,
                TransactionNumber: TransNo,
                TransactionReference: TransRef,
                TransactionDate: TransDate,
                TotalBFQty: 0,
                InQty: InComingQty,
                OutQty: OutGoingQty,
                IsMultiUse: details[0].IsMultiUse,
                TotalTransactions: details[0].TotalTransactions,
                ConsumedTransactions: details[0].ConsumedTransactions,
                PendingTransactions: details[0].PendingTransactions,
                ItemPossibleTransactions: details[0].ItemPossibleTransactions,
                TotalAFQty: 0,
                FromStoreMasterId: FromStoreId,
                ToStoreMasterId: ToStoreId,
                StoreMasterId: StoreId,
                FacilityId: FacilityId,
                OrgId: 0,
                Ucp: (Ucp) ? Ucp : 0,
                Mrp: (Mrp) ? Mrp : 0,
            };

            await this.ManageMovement(movement as any, details);
        } catch (ex) {
            throw { message: 'Some Network Issue.. Please Try Again' };
        }

    }

    public async ManageMovement(movement: StockMovementAttributes, details: Array<any>): Promise<any> {
        movement.Id = movement.Id || 0;
        try {
            if (movement.Status === 2 && movement.Id !== 0) {
                await this.MarkAsDelete(movement.Id);
            } else if (movement.Id === 0) {
                let ItemPrevClosingStock = await this.GetClosingStockByFilter({
                    Id: 0,
                    Data: {
                        StoreMasterId: movement.StoreMasterId,
                        ItemMasterId: movement.ItemMasterId
                    }
                });

                if (ItemPrevClosingStock !== null) {
                    if (movement.TransactionTypeId === 1) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + Number(movement.InQty);
                    } else if (movement.TransactionTypeId === 3) {
                        let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                            Id: 0,
                            Data: {
                                StoreMasterId: movement.StoreMasterId,
                                ItemMasterId: movement.ItemMasterId
                            }
                        });
                        if (ExistingStockItem !== null) {
                            movement.StockItemId = ExistingStockItem.Id;
                        }
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + Number(movement.InQty);
                    } else if (movement.TransactionTypeId === 5) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                    } else if (movement.TransactionTypeId === 9) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) - Number(movement.OutQty);
                    } else if (movement.TransactionTypeId === 13) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) - Number(movement.OutQty);
                    } else if (movement.TransactionTypeId === 15) {
                        if (ItemPrevClosingStock !== null) {
                            let clearmovement: any = {};
                            let AfterAdjQty: number = 0;
                            if (details[0].AdjustmentTypeId === 1) {
                                AfterAdjQty = ItemPrevClosingStock.TotalAFQty + Number(movement.InQty);
                            }
                            if (details[0].AdjustmentTypeId === 2) {
                                AfterAdjQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                            }
                            // if (ItemPrevClosingStock.TotalAFQty > 0) {
                            clearmovement = {
                                StockItemId: ItemPrevClosingStock.StockItemId,
                                ItemMasterId: movement.ItemMasterId,
                                TransactionTypeId: movement.TransactionTypeId,
                                TransactionId: movement.TransactionId,
                                TransactionNumber: movement.TransactionNumber,
                                TransactionReference: movement.TransactionReference,
                                TransactionDate: movement.TransactionDate,
                                TotalBFQty: ItemPrevClosingStock.TotalAFQty,
                                InQty: movement.InQty,
                                OutQty: movement.OutQty,
                                TotalAFQty: AfterAdjQty,
                                FromStoreMasterId: movement.FromStoreMasterId,
                                ToStoreMasterId: movement.ToStoreMasterId,
                                StoreMasterId: movement.StoreMasterId,
                                FacilityId: movement.FacilityId,
                                OrgId: 0
                            };
                            // }
                            // else {
                            //     clearmovement = {
                            //         StockItemId: ItemPrevClosingStock.StockItemId,
                            //         ItemMasterId: movement.ItemMasterId,
                            //         TransactionTypeId: movement.TransactionTypeId,
                            //         TransactionId: movement.TransactionId,
                            //         TransactionNumber: movement.TransactionNumber,
                            //         TransactionReference: movement.TransactionReference,
                            //         TransactionDate: movement.TransactionDate,
                            //         TotalBFQty: 0,
                            //         InQty: ItemPrevClosingStock.TotalAFQty,
                            //         OutQty: 0,
                            //         TotalAFQty: 0,
                            //         IsMultiUse: movement.IsMultiUse,
                            //         TotalTransactions: movement.TotalTransactions,
                            //         ConsumedTransactions: movement.ConsumedTransactions,
                            //         PendingTransactions: movement.PendingTransactions,
                            //         FromStoreMasterId: movement.FromStoreMasterId,
                            //         ToStoreMasterId: movement.ToStoreMasterId,
                            //         StoreMasterId: movement.StoreMasterId,
                            //         FacilityId: 0,
                            //         OrgId: 0
                            //     };
                            //     //movement.StockItemId = ItemPrevClosingStock.StockItemId;
                            //     //movement.InQty = ItemPrevClosingStock.TotalAFQty;
                            //     //movement.TotalAFQty = 0;
                            // }
                            // await this.Save(clearmovement);
                            if (await this.IsAlreadyExist(clearmovement) <= -1) return -1;
                            let result = await this.Save(clearmovement);
                            clearmovement.Id = result.dataValues.Id;
                            let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
                            await ssmBO.ManageSerialMovements(clearmovement, details);
                        } else {
                            let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                            let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                                Id: 0,
                                Data: {
                                    StoreMasterId: movement.StoreMasterId,
                                    ItemMasterId: movement.ItemMasterId
                                }
                            });
                            if (ExistingStockItem !== null) {
                                movement.StockItemId = ExistingStockItem.Id;
                                // movement.TotalBFQty = ExistingStockItem.Quantity;
                                movement.InQty = ExistingStockItem.Quantity;
                                movement.TotalAFQty = ExistingStockItem.Quantity;
                            } else {
                                movement.InQty = 0;
                                movement.TotalAFQty = 0;
                            }
                        }
                    } else if (movement.TransactionTypeId === 19) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) - Number(movement.OutQty);
                    } else if (movement.TransactionTypeId === 20) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) + Number(movement.InQty);
                    } else if (movement.TransactionTypeId === 21) {
                        for (let idx in details) {
                            let detail = details[idx];
                            if (movement.IsMultiUse === true) {
                                if (!movement.PendingTransactions) {
                                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                    movement.TotalAFQty = 0;
                                } else if (Number(detail.ConsumedPerTransactions) === Number(detail.ItemPossibleTransactions)) {
                                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - 1;
                                } else if (Number(detail.ConsumedPerTransactions) > Number(detail.ItemPossibleTransactions)) {
                                    movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                    // if (Number(ItemPrevClosingStock.TotalBFQty) > 0) {
                                    let RedQty = Number(detail.ConsumedPerTransactions) / Number(detail.ItemPossibleTransactions);
                                    let Qty = Math.trunc(RedQty);
                                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Qty;
                                } else if (Number(detail.ConsumedPerTransactions) < Number(detail.ItemPossibleTransactions)) {
                                    if (Number(detail.ConsumedTransactions) === Number(detail.ItemPossibleTransactions)) {
                                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                        movement.TotalAFQty = (ItemPrevClosingStock.TotalBFQty) - 1;
                                    } else if (Number(detail.ConsumedTransactions) > Number(detail.ItemPossibleTransactions)) {
                                        let ConsumeTrans =
                                            Number(detail.ConsumedTransactions) % Number(detail.ItemPossibleTransactions);
                                        let CTrans = Math.trunc(ConsumeTrans);
                                        if (CTrans === 0 || 1) {
                                            movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                            movement.TotalAFQty = (ItemPrevClosingStock.TotalAFQty) - 1;
                                        } else {
                                            movement.TotalBFQty = (ItemPrevClosingStock.TotalAFQty);
                                            movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty;
                                        }
                                    } else if (Number(detail.ConsumedTransactions) < Number(detail.ItemPossibleTransactions)) {
                                        movement.TotalBFQty = (ItemPrevClosingStock.TotalAFQty);
                                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty;
                                    }
                                } else {
                                    movement.ConsumedTransactions = movement.ConsumedTransactions;
                                    movement.TotalTransactions = movement.TotalTransactions;
                                    movement.PendingTransactions = movement.PendingTransactions;
                                    movement.TotalBFQty = ItemPrevClosingStock.TotalBFQty;
                                    movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty;
                                }
                            } else {
                                movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                                movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                            }
                        }

                    } else if (movement.TransactionTypeId === 22) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + movement.InQty;
                    } else if (movement.TransactionTypeId === 23) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = Number(ItemPrevClosingStock.TotalAFQty) + Number(movement.InQty);
                        let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                            Id: 0,
                            Data: {
                                StoreMasterId: movement.StoreMasterId,
                                ItemMasterId: movement.ItemMasterId
                            }
                        });
                        if (ExistingStockItem !== null) {
                            movement.StockItemId = ExistingStockItem.Id;
                        }
                    } else if (movement.TransactionTypeId === 24) {
                        movement.TotalBFQty = ItemPrevClosingStock.TotalAFQty;
                        movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - Number(movement.OutQty);
                    }

                    if (!movement.StockItemId || movement.StockItemId === 0) {
                        let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                            Id: 0,
                            Data: {
                                StoreMasterId: movement.StoreMasterId,
                                ItemMasterId: movement.ItemMasterId
                            }
                        });
                        if (ExistingStockItem !== null) {
                            movement.StockItemId = ExistingStockItem.Id;
                        }
                    }
                    if (movement.TransactionTypeId !== 15) {
                        movement.Id = 0;
                        if (await this.IsAlreadyExist(movement) <= -1) return -1;
                        let result = await this.Save(movement);
                        movement.Id = result.dataValues.Id;
                        let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);

                        await ssmBO.ManageSerialMovements(movement, details);

                    }
                    // } catch (ex) {
                    //     throw { message: 'Some Network Issue.. Please Try Again' };
                    // }
                    // else if (movement.TransactionTypeId === 15) {
                    //     let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
                    //     await ssmBO.ManageSerialMovements(movement, details);
                    // }
                } else {
                    // try {
                    let SIBo = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    let ExistingStockItem = await SIBo.GetStockItemIdByFilter({
                        Id: 0,
                        Data: {
                            StoreMasterId: movement.StoreMasterId,
                            ItemMasterId: movement.ItemMasterId
                        }
                    });
                    if (ExistingStockItem !== null) {
                        movement.StockItemId = ExistingStockItem.Id;
                    }
                    movement.TotalBFQty = 0;
                    movement.TotalAFQty = movement.InQty;
                    movement.Id = 0;
                    if (await this.IsAlreadyExist(movement) <= -1) return -1;
                    let result = await this.Save(movement);
                    movement.Id = result.dataValues.Id;
                    let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);

                    await ssmBO.ManageSerialMovements(movement, details);
                    // } catch (ex) {
                    //     throw { message: 'Some Network Issue.. Please Try Again' };
                    // }

                    // if (movement.TransactionTypeId === 15) {
                    //     let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
                    //     await ssmBO.ManageSerialMovementsAfterAdjustment(movement, details);
                    // }
                    // if (movement.TransactionTypeId === 3) {
                    //     let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
                    //     await ssmBO.ManageSerialMovements(movement, details);
                    //     /*
                    //     let siBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                    //     await siBO.ManageItemStock(movement);
                    //     */
                    // } else {
                    //     let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
                    //     await ssmBO.ManageSerialMovements(movement, details);
                    // }
                }
            }
        } catch (ex) {
            throw { message: 'Some Network Issue.. Please Try Again' };
        }
        return true;
    }

    public async ManageGrnStockMovement(request: any,
        stockserialitem: StockSerialItemAttributes, detail: GrnDetailAttributes): Promise<any> {
        let movement = {
            ItemMasterId: stockserialitem.ItemMasterId,
            StockItemId: stockserialitem.StockItemId,
            TransactionTypeId: 3,
            TransactionId: stockserialitem.GrnId,
            TransactionDetailId: stockserialitem.GrnDetailId,
            TransactionNumber: request.Header.GrnNumber,
            TransactionDate: request.Header.InvoiceDate,
            TotalBFQty: 0,
            InQty: stockserialitem.Quantity,
            OutQty: 0,
            TotalAFQty: 0,
            FromStoreMasterId: stockserialitem.StoreMasterId,
            ToStoreMasterId: stockserialitem.StoreMasterId,
            StoreMasterId: stockserialitem.StoreMasterId,
            FacilityId: stockserialitem.FacilityId,
            OrgId: 0
        };

        await this.ManageGrnMovement(request, stockserialitem, movement as any, detail);
    }

    public async ManageGrnMovement(request: any, stockserialitem: any,
        movement: StockMovementAttributes, detail: any): Promise<boolean> {
        let ItemPrevClosingStock = await this.GetClosingStockByFilter({
            Id: 0,
            Data: {
                StoreMasterId: movement.StoreMasterId,
                ItemMasterId: movement.ItemMasterId
            }
        });

        if (ItemPrevClosingStock !== null) {
            movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty + movement.InQty;
        } else {
            movement.TotalAFQty = movement.InQty;
        }

        let result = await this.Save(movement);
        movement.Id = result.dataValues.Id;
        let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
        await ssmBO.ManageGrnSerialMovement(request, stockserialitem, movement, detail);

        return true;
    }

    public async ManagePrnStockMovement(request: any,
        stockserialitem: StockSerialItemAttributes, detail: PurchaseReturnDetailAttributes): Promise<any> {
        let OutQuantity = 0;
        if (request.Header.PrnTypeId === 2) {
            OutQuantity = stockserialitem.Quantity;
        } else {
            OutQuantity = detail.PrnQuantity;
        }
        let movement = {
            StockItemId: detail.StockItemId,
            ItemMasterId: detail.ItemMasterId,
            TransactionTypeId: 5,
            TransactionId: stockserialitem.GrnId,
            TransactionDetailId: stockserialitem.GrnDetailId,
            TransactionNumber: request.Header.PrnNumber,
            TransactionDate: request.Header.PrnDate,
            TotalBFQty: 0,
            InQty: 0,
            OutQty: OutQuantity,
            TotalAFQty: 0,
            FromStoreMasterId: request.Header.StoreMasterId,
            ToStoreMasterId: request.Header.StoreMasterId,
            StoreMasterId: request.Header.StoreMasterId,
            FacilityId: request.Header.FacilityId,
            OrgId: 0
        };

        await this.ManagePrnMovement(request, stockserialitem, movement as any, detail);
    }

    public async ManagePrnMovement(request: any, stockserialitem: any,
        movement: StockMovementAttributes, detail: any): Promise<boolean> {
        let ItemPrevClosingStock = await this.GetClosingStockByFilter({
            Id: 0,
            Data: {
                StoreMasterId: movement.StoreMasterId,
                ItemMasterId: movement.ItemMasterId
            }
        });

        if (ItemPrevClosingStock !== null) {
            movement.TotalAFQty = ItemPrevClosingStock.TotalAFQty - movement.OutQty;
        } else {
            movement.TotalAFQty = movement.OutQty;
        }

        let result = await this.Save(movement);
        movement.Id = result.dataValues.Id;
        let ssmBO = BoFactory.GetBo(bo.StockSerialMovementBo, this.Request);
        await ssmBO.ManagePrnSerialMovement(request, stockserialitem, movement, detail);

        return true;
    }
    public async PrintStockMovementReport(apiReq?: ApiRequest<StockMovementFilters>): Promise<any> {
        let data = await this.GetStockMovements(apiReq);
        let StockMovement = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let TransactionType = apiReq.Data.TransactionType;
        let StockMovementData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockMovementData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockMovementData.FacilityId, StockMovementData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockMovement: StockMovement,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            ItemName: ItemName,
            TransactionType: TransactionType
        };
        let pdfOption: any = null;
        let key = 'stockmovementreport';
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
    public async PrintDailyStockMovement(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let StoreMaster = req.Data.StoreMaster;
        let ItemName = req.Data.ItemName;
        let ProductType = req.Data.ProductType;
        let DailyStockMoves: any = [];
        let StockMov: any = {};
        let NetStockMoves: any = [];
        let StoreMasterId = req.Data.StoreMasterId;

        let DailyStock = req;
        StockMov = await this.GetStockDailyMovements(DailyStock);
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DailyStock.Data.FacilityId);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(DailyStock.Data.FacilityId, StoreMasterId);
        if (StockMov) {
            let crntStkMov = [];
            let prevStkMov = [];
            if (StockMov.length > 0) {
                crntStkMov = StockMov[0].Value;
            }
            if (StockMov.length > 1) {
                prevStkMov = StockMov[1].Value;
            }
            if (crntStkMov) {
                for (let idx in crntStkMov) {
                    let ItemName = '';
                    let ProductName = '';
                    let OpenQty = 0;
                    let Inqty = 0;
                    let OutQty = 0;
                    let ClosingQty = 0;
                    let Ucp = '';
                    let Mrp = '';
                    let crntmove = crntStkMov[idx];
                    for (let sdx in crntmove) {
                        let moveditems = crntmove[sdx];
                        ItemName = moveditems.ItemName;
                        ProductName = moveditems.ProductName;
                        OpenQty = moveditems.Openingqty;
                        Inqty = moveditems.InQty;
                        OutQty = moveditems.OutQty;
                        ClosingQty = moveditems.closingQty;
                        Ucp = moveditems.Ucp;
                        Mrp = moveditems.Mrp;
                        let crntlength = moveditems.movlength;
                        let valappended = 0;
                        DailyStockMoves.forEach(function (item: any) {
                            if (ItemName === item.ItemName) {
                                item.ItemName = moveditems.ItemName;
                                item.ProductName = moveditems.ProductName;
                                // item.OpenQty = moveditems.Openingqty;
                                item.Inqty = moveditems.InQty;
                                item.OutQty = moveditems.OutQty;
                                item.ClosingQty = moveditems.closingQty;
                                item.Ucp += moveditems.Ucp;
                                item.Mrp += moveditems.Mrp || 0;
                                item.crntlength = moveditems.crntlength || 0;
                                valappended = 1;
                            }
                        });
                        if (valappended === 0)
                            DailyStockMoves.push({
                                'ItemName': ItemName,
                                'ProductName': ProductName,
                                // 'OpenQty': OpenQty,
                                'Inqty': Inqty,
                                'OutQty': OutQty,
                                'ClosingQty': ClosingQty,
                                'Ucp': Ucp,
                                'Mrp': Mrp,
                                'crntlength': crntlength
                            });
                    }
                }
            }
            let OpenQty = 0;
            if (prevStkMov) {
                for (let idx in prevStkMov) {
                    let ItemName = '';
                    let ProductName = '';
                    let Inqty = 0;
                    let OutQty = 0;
                    let ClosingQty = 0;
                    let Ucp = '';
                    let Mrp = '';
                    let prevmove = prevStkMov[idx];
                    for (let sdx in prevmove) {
                        let prevmoveditems = prevmove[sdx];
                        if (!crntStkMov) {
                            if (prevmoveditems.closingQty > 0) {
                                ItemName = prevmoveditems.ItemName;
                                ProductName = prevmoveditems.ProductName;
                                OpenQty = prevmoveditems.Openingqty;
                                Inqty = prevmoveditems.Inqty;
                                OutQty = prevmoveditems.OutQty;
                                ClosingQty = prevmoveditems.closingQty;
                                Ucp = prevmoveditems.Ucp;
                                Mrp = prevmoveditems.Mrp;
                                let prevlength = prevmoveditems.movlength;
                                let valappended = 0;
                                DailyStockMoves.forEach(function (item: any) {
                                    if (ItemName === item.ItemName) {
                                        item.ItemName = prevmoveditems.ItemName;
                                        item.ProductName = prevmoveditems.ProductName;
                                        item.OpenQty = prevmoveditems.Openingqty;
                                        // item.Inqty = prevmoveditems.Inqty;
                                        // item.OutQty = prevmoveditems.OutQty;
                                        // item.ClosingQty = prevmoveditems.closingQty;
                                        item.Ucp += prevmoveditems.Ucp;
                                        item.Mrp += prevmoveditems.Mrp || 0;
                                        item.prevlength = prevmoveditems.movlength || 0;
                                        valappended = 1;
                                    }
                                });
                                if (valappended === 0)
                                    DailyStockMoves.push({
                                        'ItemName': ItemName,
                                        'ProductName': ProductName,
                                        'OpenQty': OpenQty,
                                        'Inqty': Inqty,
                                        'OutQty': OutQty,
                                        'ClosingQty': ClosingQty,
                                        'Ucp': Ucp,
                                        'Mrp': Mrp,
                                        'prevlength': prevlength

                                    });
                            }
                        } else {
                            ItemName = prevmoveditems.ItemName;
                            ProductName = prevmoveditems.ProductName;
                            OpenQty = prevmoveditems.Openingqty;
                            Inqty = prevmoveditems.Inqty;
                            OutQty = prevmoveditems.OutQty;
                            ClosingQty = prevmoveditems.closingQty;
                            Ucp = prevmoveditems.Ucp;
                            Mrp = prevmoveditems.Mrp;
                            let prevlength = prevmoveditems.movlength;
                            let valappended = 0;
                            DailyStockMoves.forEach(function (item: any) {
                                if (ItemName === item.ItemName) {
                                    item.ItemName = prevmoveditems.ItemName;
                                    item.ProductName = prevmoveditems.ProductName;
                                    item.OpenQty = prevmoveditems.Openingqty;
                                    // item.Inqty = prevmoveditems.Inqty;
                                    // item.OutQty = prevmoveditems.OutQty;
                                    // item.ClosingQty = prevmoveditems.closingQty;
                                    item.Ucp += prevmoveditems.Ucp;
                                    item.Mrp += prevmoveditems.Mrp || 0;
                                    item.prevlength = prevmoveditems.movlength || 0;
                                    valappended = 1;
                                }
                            });
                            if (valappended === 0)
                                DailyStockMoves.push({
                                    'ItemName': ItemName,
                                    'ProductName': ProductName,
                                    'OpenQty': OpenQty,
                                    'Inqty': Inqty,
                                    'OutQty': OutQty,
                                    'ClosingQty': ClosingQty,
                                    'Ucp': Ucp,
                                    'Mrp': Mrp,
                                    'prevlength': prevlength

                                });
                        }
                    }
                }
            } else {
                DailyStockMoves.forEach(function (item: any) {
                    item.OpenQty = OpenQty;
                    item.prevlength = 0;
                });
            }
        }
        for (var ldx in DailyStockMoves) {
            var allstkmoves = DailyStockMoves[ldx];
            allstkmoves.alllength = (allstkmoves.crntlength || 0) + (allstkmoves.prevlength || 0);
            allstkmoves.AvgUcp = (allstkmoves.Ucp / allstkmoves.alllength) || 0;
            allstkmoves.AvgMrp = (allstkmoves.Mrp / allstkmoves.alllength) || 0;
            allstkmoves.TotalUcp = (allstkmoves.AvgUcp) * (allstkmoves.ClosingQty);
            allstkmoves.TotalMrp = (allstkmoves.AvgMrp) * (allstkmoves.ClosingQty);
            NetStockMoves.push(allstkmoves);
        }

        let NetUcp = 0;
        let NetMrp = 0;
        let NetTotalUcp = 0;
        let NetTotalMrp = 0;
        var netucp = 0;
        var netmrp = 0;
        var nettotucp = 0;
        var nettotmrp = 0;
        for (var mdx in NetStockMoves) {
            var dailymove = NetStockMoves[mdx];
            netucp = netucp + dailymove.AvgUcp;
            netmrp = netmrp + dailymove.AvgMrp;
            nettotucp = nettotucp + dailymove.TotalUcp;
            nettotmrp = nettotmrp + dailymove.TotalMrp;
        }
        NetUcp = netucp;
        NetMrp = netmrp;
        NetTotalUcp = nettotucp;
        NetTotalMrp = nettotmrp;

        let info = {
            NetStockMoves: NetStockMoves,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreMaster: StoreMaster,
            ItemName: ItemName,
            ProductType: ProductType,
            NetUcp: NetUcp,
            NetMrp: NetMrp,
            NetTotalUcp: NetTotalUcp,
            NetTotalMrp: NetTotalMrp
        };
        let pdfOption: any = null;
        let key = 'dailystockmovementreport';
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

    // public async IsAlreadyExist(req: any): Promise<number> {
    //     let movementDate = new Date();
    //     // let FromDate = billDate.setMinutes(billDate.getMinutes() - 2);
    //     // let ToDate = billDate.setMinutes(billDate.getMinutes() + 2);
    //     let FromDate = movementDate.setSeconds(movementDate.getSeconds() - 30);
    //     let ToDate = movementDate.setSeconds(movementDate.getSeconds() + 30);
    //     let frmDate = moment(FromDate);
    //     let todate = moment(ToDate);
    //     let apiReq = {
    //         Id: 0,
    //         PageContext: { PageSize: -1, PageNumber: 1 },
    //         Params: [
    //             { Key: StockMovementFilters.TransactionTypeId, Value: req.TransactionTypeId },
    //             { Key: StockMovementFilters.TransactionId, Value: req.TransactionId },
    //             { Key: StockMovementFilters.ItemMasterId, Value: req.ItemMasterId },
    //             { Key: StockMovementFilters.StoreMasterId, Value: req.StoreMasterId },
    //             { Key: StockMovementFilters.From, Value: frmDate },
    //             { Key: StockMovementFilters.To, Value: todate }]
    //     };

    //     let data = await this.GetStockMovements(apiReq);
    //     if (data.Data && data.Data.length > 0) {
    //         return (data.Data.length * -1);
    //     }
    //     return 1;
    // }

    public async IsAlreadyExist(req: any): Promise<number> {
        // Prefer CreatedAt for duplicate check; fallback to current time
        const baseDate = req.CreatedAt ? new Date(req.CreatedAt) : new Date();

        // Define ±30 seconds window
        const fromDate = new Date(baseDate.getTime() - 30 * 1000);
        const toDate = new Date(baseDate.getTime() + 30 * 1000);

        // Format timestamps to ensure consistent comparison
        const frmDate = moment(fromDate).format('YYYY-MM-DD HH:mm:ss');
        const toDateFormatted = moment(toDate).format('YYYY-MM-DD HH:mm:ss');

        const apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: StockMovementFilters.TransactionTypeId, Value: req.TransactionTypeId },
                { Key: StockMovementFilters.TransactionId, Value: req.TransactionId },
                { Key: StockMovementFilters.ItemMasterId, Value: req.ItemMasterId },
                { Key: StockMovementFilters.StoreMasterId, Value: req.StoreMasterId },
                { Key: StockMovementFilters.FromCreated, Value: frmDate },
                { Key: StockMovementFilters.ToCreated, Value: toDateFormatted }
            ]
        };

        const data = await this.GetStockMovements(apiReq);

        // Optional: Log results to confirm
        console.log('Duplicate check from:', frmDate, 'to:', toDateFormatted);
        // console.log('Found:', data?.Data?.length, 'entries');

        // Return negative count if duplicates found
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

}
