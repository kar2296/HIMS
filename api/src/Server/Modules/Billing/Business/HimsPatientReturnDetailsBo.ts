import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientReturnDetailsFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientReturnDetailsInstance, PatientReturnDetailsAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../../Modules/Base/Business/Index';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as invBo from '../../Pharmacy/Business/Index';
import * as encbo from '../../Visit/Business/Index';

export class PatientReturnDetailsBo extends BaseBo<PatientReturnDetailsInstance, PatientReturnDetailsAttributes>  {
    public async AddPatientReturnDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientReturnDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientReturnDetails(PatientReturnId: number, details: PatientReturnDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientReturnId = PatientReturnId;
                detail.ReturnDateTime = new Date();
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPatientReturnDetailsById(req: BaseRequest): Promise<PatientReturnDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientReturnDetails(apiReq?: ApiRequest<PatientReturnDetailsFilters>):
        Promise<ApiResponse<PatientReturnDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false,
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemName', 'ProductRegNo'], required: false,
            include: [
                this.GetReference('ScheduleType')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientReturnDetailsFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.PatientReturnId:
                    where['PatientReturnId'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.PatientReturnStatus:
                    where['PatientReturnStatusId'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case PatientReturnDetailsFilters.FromDate:
                    where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                    (where['ReturnDateTime'] as any)['$gte'] = param.Value || null;
                    break;
                case PatientReturnDetailsFilters.ToDate:
                    where['ReturnDateTime'] = where['ReturnDateTime'] || {};
                    (where['ReturnDateTime'] as any)['$lte'] = param.Value || null;
                    break;
                case PatientReturnDetailsFilters.ServiceName:
                    where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                    break;
                case PatientReturnDetailsFilters.PatientBillId:
                    where['PatientBillId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        order.push(['ReturnDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientReturnDetails(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientReturnDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientReturnDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
            { Key: PatientReturnDetailsFilters.PatientReturnStatus, Value: 3 }]
        };
        let data = await this.GetPatientReturnDetails(apiReq);
        let PatientReturnDetails = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let ServiceName: string = req.Data.ServiceName;
        let GrossAmount: number = 0;
        let DiscountAmount: number = 0;
        let NetAmount: number = 0;
        for (let idx in PatientReturnDetails) {
            let item = PatientReturnDetails[idx];
            GrossAmount += item.GrossAmount;
            DiscountAmount += item.DiscountAmount;
            NetAmount += item.GrossAmount - item.DiscountAmount;
        }
        let info = {
            PatientBillDetails: PatientReturnDetails,
            Encounter: Encounter,
            ServiceName: ServiceName,
            GrossAmount: GrossAmount,
            DiscountAmount: DiscountAmount,
            NetAmount: NetAmount
        };
        return await Report.Generate('breakup', { header: {}, body: info });
    }

    public async ReturnSummary(req: BaseRequest): Promise<any> {
        let ItemGroup: { [id: number]: any[] } = {};
        let ItemGroupJoin: any = {
            model: this.Models.ItemMaster,
            attributes: ['ItemCode', 'ItemName'],
            required: true,
        };
        if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId > 0) {
            let returnitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'ReturnQuantity', 'Rate',
                    'GrossAmount', 'DiscountAmount', 'NetAmount', 'UnitDiscountAmount'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PatientReturnStatusId: { '$in': [2, 3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (returnitemInstance) {
                let groupbills = _.groupBy(returnitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let ReturnQuantity: number = 0;
                    let ReturnMrp: number = 0;
                    let ReturnAmount: number = 0;
                    let ReturnDiscount: number = 0;
                    let TotalReturns: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        ReturnQuantity += bills.ReturnQuantity;
                        ReturnMrp += bills.Rate;
                        ReturnAmount += bills.GrossAmount;
                        ReturnDiscount += bills.UnitDiscountAmount;
                        TotalReturns += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'ReturnQuantity': ReturnQuantity,
                        'ReturnMrp': ReturnMrp,
                        'ReturnAmount': ReturnAmount,
                        'ReturnDiscount': ReturnDiscount,
                        'TotalReturns': TotalReturns,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId > 0) {
            let returnitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'ReturnQuantity', 'Rate',
                    'GrossAmount', 'DiscountAmount', 'NetAmount', 'UnitDiscountAmount'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PatientReturnStatusId: { '$in': [2, 3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (returnitemInstance) {
                let groupbills = _.groupBy(returnitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let ReturnQuantity: number = 0;
                    let ReturnMrp: number = 0;
                    let ReturnAmount: number = 0;
                    let ReturnDiscount: number = 0;
                    let TotalReturns: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        ReturnQuantity += bills.ReturnQuantity;
                        ReturnMrp += bills.Rate;
                        ReturnAmount += bills.GrossAmount;
                        ReturnDiscount += bills.UnitDiscountAmount;
                        TotalReturns += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'ReturnQuantity': ReturnQuantity,
                        'ReturnMrp': ReturnMrp,
                        'ReturnAmount': ReturnAmount,
                        'ReturnDiscount': ReturnDiscount,
                        'TotalReturns': TotalReturns,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId > 0 && req.Data.StoreMasterId === 0) {
            let returnitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'ReturnQuantity', 'Rate',
                    'GrossAmount', 'DiscountAmount', 'NetAmount', 'UnitDiscountAmount'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ItemMasterId: { '$eq': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PatientReturnStatusId: { '$in': [2, 3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (returnitemInstance) {
                let groupbills = _.groupBy(returnitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let ReturnQuantity: number = 0;
                    let ReturnMrp: number = 0;
                    let ReturnAmount: number = 0;
                    let ReturnDiscount: number = 0;
                    let TotalReturns: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        ReturnQuantity += bills.ReturnQuantity;
                        ReturnMrp += bills.Rate;
                        ReturnAmount += bills.GrossAmount;
                        ReturnDiscount += bills.UnitDiscountAmount;
                        TotalReturns += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'ReturnQuantity': ReturnQuantity,
                        'ReturnMrp': ReturnMrp,
                        'ReturnAmount': ReturnAmount,
                        'ReturnDiscount': ReturnDiscount,
                        'TotalReturns': TotalReturns,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        } else if (req.Data.ItemMasterId === 0 && req.Data.StoreMasterId === 0) {
            let returnitemInstance: any = await this.FindAll({
                attributes: ['ItemMasterId', 'StoreMasterId', 'ItemCode', 'ItemName', 'ReturnQuantity', 'Rate',
                    'GrossAmount', 'DiscountAmount', 'NetAmount', 'UnitDiscountAmount'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    ItemMasterId: { '$gt': req.Data.ItemMasterId },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId }
                },
                include: [ItemGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PatientReturnStatusId: { '$in': [2, 3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
            });
            if (returnitemInstance) {
                let groupbills = _.groupBy(returnitemInstance, 'ItemMasterId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ItemMasterId: number = 0;
                    let ItemName: string = '';
                    let ItemCode: string = '';
                    let ReturnQuantity: number = 0;
                    let ReturnMrp: number = 0;
                    let ReturnAmount: number = 0;
                    let ReturnDiscount: number = 0;
                    let TotalReturns: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ItemMasterId = bills.ItemMasterId;
                        ItemName = bills.ItemName;
                        ItemCode = bills.ItemCode;
                        ReturnQuantity += bills.ReturnQuantity;
                        ReturnMrp += bills.Rate;
                        ReturnAmount += bills.GrossAmount;
                        ReturnDiscount += bills.UnitDiscountAmount;
                        TotalReturns += bills.NetAmount;
                        ItemGroup[ItemMasterId] = ItemGroup[ItemMasterId] || [];
                    }
                    let info = {
                        'ItemMasterId': ItemMasterId,
                        'ItemName': ItemName,
                        'ItemCode': ItemCode,
                        'ReturnQuantity': ReturnQuantity,
                        'ReturnMrp': ReturnMrp,
                        'ReturnAmount': ReturnAmount,
                        'ReturnDiscount': ReturnDiscount,
                        'TotalReturns': TotalReturns,
                    };
                    ItemGroup[ItemMasterId].push(info);
                }
            }
        }
        return ItemGroup;
    }

    public async SaleReturnGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster,
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },
                    GSTPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },


                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = -1;
                        GSTPercentage = -1;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let overalltaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$in': ['0.000000', '5.000000', '12.000000', '18.000000', '28.000000'] },
                    // GSTId: { '$in': [1, 7, 8, 11, 12] },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (overalltaxamountInstance) {
                let groupbills = _.groupBy(overalltaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = -1;
                        GSTPercentage = -1;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '0.000000' }
                    // GSTId: { '$eq': 1 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '5.000000' }
                    // GSTId: { '$eq': 11 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '12.000000' }
                    // GSTId: { '$eq': 7 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '28.000000' }
                    // GSTId: { '$eq': 12 },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'ReturnDateTime');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    // let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let GSTId: number = 0;
                    let GSTPercentage: any;
                    let StoreMasterId: number = 0;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        StoreMasterId = bills.StoreMasterId;
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        BillDate = bills.ReturnDateTime;
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        return GSTGroup;
    }
    public async ConsolidatedSaleReturnGSTDetails(req: BaseRequest): Promise<any> {
        let GSTGroup: { [GSTPercentage: string]: any[] } = {};
        // let GSTGroup: { [id: number]: any[] } = {};
        let GSTGroupJoin: any = {
            model: this.Models.GstMaster,
            attributes: ['GstName', 'GstPercentage'],
            required: true,
        };
        if (req.Data.StoreMasterId > 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    GSTPercentage: { '$eq': '0.000000' },
                    // GSTId: { '$eq': 1 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let zerotaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    GSTPercentage: { '$eq': '0.000000' },
                    // GSTId: { '$eq': 1 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (zerotaxamountInstance) {
                let groupbills = _.groupBy(zerotaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '5.000000' },
                    // GSTId: { '$eq': 11 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let fivetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '5.000000' },
                    // GSTId: { '$eq': 11 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (fivetaxamountInstance) {
                let groupbills = _.groupBy(fivetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let twelvetaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '12.000000' },
                    // GSTId: { '$eq': 7 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (twelvetaxamountInstance) {
                let groupbills = _.groupBy(twelvetaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '12.000000' },
                    // GSTId: { '$eq': 12 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        if (req.Data.StoreMasterId > 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let eighteentaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '18.000000' },
                    // GSTId: { '$eq': 8 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (eighteentaxamountInstance) {
                let groupbills = _.groupBy(eighteentaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }
        if (req.Data.StoreMasterId > 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '28.000000' },
                    // GSTId: { '$eq': 12 },
                    StoreMasterId: { '$eq': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        } else if (req.Data.StoreMasterId === 0) {
            let tweentyeighttaxamountInstance: any = await this.FindAll({
                attributes: ['NetAmountBeforeGST', 'ReturnDateTime', 'GSTPercentage', 'NetAmount',
                    'CGstAmount', 'SGstAmount', 'GSTAmount', 'GSTId', 'StoreMasterId'],
                where: {
                    ReturnDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // BillTypeId: { '$eq': [4] },
                    // IsPharmacySale: 1,
                    // PatientBillStatusId: 3,
                    GSTPercentage: { '$eq': '28.000000' },
                    // GSTId: { '$eq': 12 },
                    StoreMasterId: { '$gt': req.Data.StoreMasterId },

                },
                include: [GSTGroupJoin, {
                    model: this.Models.PatientReturns,
                    attributes: ['Id'],
                    where: {
                        PharmacyReturnTypeId: { '$in': [1, 4] },
                        PatientReturnStatusId: { '$in': [3] },
                        FacilityId: req.Data.FacilityId,
                    },
                    required: true
                }],
                // include: [GSTGroupJoin]
            });
            if (tweentyeighttaxamountInstance) {
                let groupbills = _.groupBy(tweentyeighttaxamountInstance, 'GSTId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let dateformat = 'DD/MM/YYYY';
                    let BillDate: any = '';
                    let NetAmountBeforeGST: number = 0;
                    let NetAmount: number = 0;
                    let GSTAmount: number = 0;
                    let CGSTAmount: number = 0;
                    let SGSTAmount: number = 0;
                    let GSTId: number = 0;
                    let StoreMasterId: number = 0;
                    let GSTPercentage: any;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        NetAmountBeforeGST += ((bills.NetAmount) - ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100)
                            * bills.GSTPercentage));
                        NetAmount += bills.NetAmount;
                        GSTAmount += ((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage);
                        CGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        SGSTAmount += (((((bills.NetAmount / (100 + bills.GSTPercentage)) * 100) / 100) * bills.GSTPercentage) / 2);
                        GSTId = bills.GSTId;
                        GSTPercentage = bills.GSTPercentage;
                        StoreMasterId = bills.StoreMasterId;
                        BillDate = moment(bills.ReturnDateTime).format(dateformat);
                        GSTGroup[GSTPercentage] = GSTGroup[GSTPercentage] || [];
                    }
                    let info = {
                        'NetAmountBeforeGST': NetAmountBeforeGST,
                        'NetAmount': NetAmount,
                        'GSTAmount': GSTAmount,
                        'CGSTAmount': CGSTAmount,
                        'SGSTAmount': SGSTAmount,
                        'GSTId': GSTId,
                        'BillDate': BillDate,
                        'GSTPercentage': GSTPercentage,
                        'StoreMasterId': StoreMasterId
                    };
                    GSTGroup[GSTPercentage].push(info);
                }
            }
        }

        return GSTGroup;
    }
    public async PrintSaleReturnGST(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let StoreMaster = req.Data.StoreMaster;
        let SaleretGst: any = [];
        let NetSaleretGst: any = [];
        let SalesReq = req;
        SaleretGst = await this.SaleReturnGSTDetails(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invBo.StorePreferenceBo, this.Request);
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
                if (parseInt(gstid) === 0) {
                    zerosaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 12) {
                    twelvesaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 18) {
                    eighteensaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 5) {
                    fivesaleretgst = SaleretGst[gstid];
                }
                if (parseInt(gstid) === 28) {
                    twentyeightsaleretgst = SaleretGst[gstid];
                }

            }

            for (let idx in zerosaleretgst) {
                let zero_saleretgst = zerosaleretgst[idx];
                let Key = '';
                let ZeroRetNetAmountBeforeGST = 0;
                let ZerRetGSTAmount = 0;
                let BDate = zero_saleretgst.BillDate;
                let year = new Date(zero_saleretgst.BillDate).getFullYear();
                let month = new Date(zero_saleretgst.BillDate).getMonth();
                let date = new Date(zero_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                ZeroRetNetAmountBeforeGST = zero_saleretgst.NetAmountBeforeGST;
                ZerRetGSTAmount = zero_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = zero_saleretgst.BillDate;
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
                        'BDate': BDate
                    });
            }
            for (let idx in twelvesaleretgst) {
                let twelve_saleretgst = twelvesaleretgst[idx];
                let Key = '';
                let twelveRetNetAmountBeforeGST = 0;
                let twelveRetGSTAmount = 0;
                let year = new Date(twelve_saleretgst.BillDate).getFullYear();
                let month = new Date(twelve_saleretgst.BillDate).getMonth();
                let date = new Date(twelve_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = twelve_saleretgst.BillDate;
                twelveRetNetAmountBeforeGST = twelve_saleretgst.NetAmountBeforeGST;
                twelveRetGSTAmount = twelve_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = twelve_saleretgst.BillDate;
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
                        'BDate': BDate

                    });
            }
            for (let idx in eighteensaleretgst) {
                let eighteen_saleretgst = eighteensaleretgst[idx];
                let Key = '';
                let eighteenRetNetAmountBeforeGST = 0;
                let eighteenRetGSTAmount = 0;
                let year = new Date(eighteen_saleretgst.BillDate).getFullYear();
                let month = new Date(eighteen_saleretgst.BillDate).getMonth();
                let date = new Date(eighteen_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = eighteen_saleretgst.BillDate;
                eighteenRetNetAmountBeforeGST = eighteen_saleretgst.NetAmountBeforeGST;
                eighteenRetGSTAmount = eighteen_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = eighteen_saleretgst.BillDate;
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
                        'BDate': BDate

                    });
            }
            for (let idx in fivesaleretgst) {
                let five_saleretgst = fivesaleretgst[idx];
                let Key = '';
                let fiveRetNetAmountBeforeGST = 0;
                let fiveRetGSTAmount = 0;
                let year = new Date(five_saleretgst.BillDate).getFullYear();
                let month = new Date(five_saleretgst.BillDate).getMonth();
                let date = new Date(five_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = five_saleretgst.BillDate;
                fiveRetNetAmountBeforeGST = five_saleretgst.NetAmountBeforeGST;
                fiveRetGSTAmount = five_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = five_saleretgst.BillDate;
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
                        'BDate': BDate

                    });
            }
            for (let idx in twentyeightsaleretgst) {
                let twentyeight_saleretgst = twentyeightsaleretgst[idx];
                let Key = '';
                let twentyeightRetNetAmountBeforeGST = 0;
                let twentyeightRetGSTAmount = 0;
                let year = new Date(twentyeight_saleretgst.BillDate).getFullYear();
                let month = new Date(twentyeight_saleretgst.BillDate).getMonth();
                let date = new Date(twentyeight_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = twentyeight_saleretgst.BillDate;
                twentyeightRetNetAmountBeforeGST = twentyeight_saleretgst.NetAmountBeforeGST;
                twentyeightRetGSTAmount = twentyeight_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = twentyeight_saleretgst.BillDate;
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
                        'BDate': BDate

                    });
            }
            for (let idx in overallsaleretgst) {
                let overall_saleretgst = overallsaleretgst[idx];
                let Key = '';
                let RetNetAmountBeforeGST = 0;
                let RetNetAmount = 0;
                let RetGSTAmount = 0;
                let year = new Date(overall_saleretgst.BillDate).getFullYear();
                let month = new Date(overall_saleretgst.BillDate).getMonth();
                let date = new Date(overall_saleretgst.BillDate).getDate();
                Key = (month + 1) + '/' + date + '/' + year;
                let BDate = overall_saleretgst.BillDate;
                RetNetAmountBeforeGST = overall_saleretgst.NetAmountBeforeGST;
                RetNetAmount = overall_saleretgst.NetAmount;
                RetGSTAmount = overall_saleretgst.GSTAmount;
                let valappended = 0;
                NetSaleretGst.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.BDate = overall_saleretgst.BillDate;
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
                        'BDate': BDate
                    });
            }
        }
        let Sort_Date = function (a: any, b: any) {
            return new Date(a.BDate).getTime() - new Date(b.BDate).getTime();
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
            Preferences: printPreferencesData,
            StoreMaster: StoreMaster,
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
        let key = 'returngstreport';
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

    public GetModel(): SStatic.Model<PatientReturnDetailsInstance, PatientReturnDetailsAttributes> {
        return this.Models.PatientReturnDetails;
    }
}
