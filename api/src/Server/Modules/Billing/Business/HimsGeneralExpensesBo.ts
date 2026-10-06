import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GeneralExpensesInstance, GeneralExpensesAttributes } from '../Model/Interface/Index';
import { GeneralExpensesFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as _ from 'lodash';

export class GeneralExpensesBo extends BaseBo<GeneralExpensesInstance, GeneralExpensesAttributes> implements IOptionProvider {
    public async AddGeneralExpenses(req: BaseRequest): Promise<number> {
        //let generatevoucherNumber = 0;
        if (!req.Data.VoucherNo && req.Data.ExpenseStatusId === 2) {
            req.Data.VoucherNo = null;
            //generatevoucherNumber = 1;
        }
        let result = await this.Save(req.Data);
        let voucherId = result.dataValues.Id;
        //if (generatevoucherNumber === 1) {
        this.deferSequenceKey(voucherId, 'VoucherNo',
            this.getSequenceIdentifier(SequenceKeys.GeneralExpenseId));
        //}
        return result.dataValues.Id;
    }

    public async UpdateGeneralExpenses(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGeneralExpensesById(req: BaseRequest): Promise<GeneralExpensesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGeneralExpensess(apiReq?: ApiRequest<GeneralExpensesFilters>): Promise<ApiResponse<GeneralExpensesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('GeneralExpenseStatus'));
        include.push(this.GetReference('GeneralExpenseType'));
        include.push(this.GetReference('PaymentType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GeneralExpensesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GeneralExpensesFilters.VoucherNo:
                        where['VoucherNo'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case GeneralExpensesFilters.ExpenseDate:
                        where['ExpenseDate'] = param.Value;
                        break;
                    case GeneralExpensesFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case GeneralExpensesFilters.ExpenseStatusId:
                        where['ExpenseStatusId'] = param.Value;
                        break;
                    case GeneralExpensesFilters.From:
                        where['ExpenseDate'] = where['ExpenseDate'] || {};
                        (where['ExpenseDate'] as any)['$gte'] = param.Value;
                        break;
                    case GeneralExpensesFilters.To:
                        where['ExpenseDate'] = where['ExpenseDate'] || {};
                        // (where['ExpenseDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        (where['ExpenseDate'] as any)['$lte'] = param.Value;
                        break;
                    case GeneralExpensesFilters.ToDate:
                        where['ExpenseDate'] = where['ExpenseDate'] || {};
                        (where['ExpenseDate'] as any)['$lte'] = param.Value;
                        break;
                    case GeneralExpensesFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case GeneralExpensesFilters.ExpenseTypeId:
                        where['ExpenseTypeId'] = param.Value;
                        break;
                    case GeneralExpensesFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGeneralExpenses(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintGeneralExpenses(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: GeneralExpensesFilters.Id, Value: req.Id }]
        };
        let data = await this.GetGeneralExpensess(apiReq);
        let GeneralExpenses: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GeneralExpenses.FacilityId);
        let info = {
            GeneralExpenses: GeneralExpenses,
            Preferences: printPreferencesData

        };
        //let key = 'generalexpense';

        let pdfOption: any = null;
        {
            //let pdfOptionJSON = await Report.GetPdfOption(key);
            //console.log('pdfOptionJSON='+pdfOptionJSON);
            // if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            console.log('pdfOption=====' + pdfOption);
            //pdfOption = JSON.parse(pdfOptionJSON);
            //  pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // }
        }
        return await Report.Generate('generalexpense', { header: {}, body: info }, pdfOption);
    }
    public async ExpenseBills(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RequestedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['ExpenseAmount', 'UserId'],
                where: {
                    ExpenseDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ExpenseStatusId: 2,
                    UserId: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'UserId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ExpenseAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ExpenseAmount += bills.ExpenseAmount;
                        UserId = bills.UserId;
                        User = bills.RequestedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashExpAmt': ExpenseAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['ExpenseAmount', 'UserId'],
                where: {
                    ExpenseDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ExpenseStatusId: 2,
                    UserId: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'UserId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ExpenseAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ExpenseAmount += bills.ExpenseAmount;
                        UserId = bills.UserId;
                        User = bills.RequestedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashExpAmt': ExpenseAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['ExpenseAmount', 'UserId'],
                where: {
                    ExpenseDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ExpenseStatusId: 2,
                    UserId: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1] },
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'UserId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ExpenseAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ExpenseAmount += bills.ExpenseAmount;
                        UserId = bills.UserId;
                        User = bills.RequestedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherExpAmt': ExpenseAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['ExpenseAmount', 'UserId'],
                where: {
                    ExpenseDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ExpenseStatusId: 2,
                    UserId: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1] },
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'UserId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let ExpenseAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        ExpenseAmount += bills.ExpenseAmount;
                        UserId = bills.UserId;
                        User = bills.RequestedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherExpAmt': ExpenseAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async PrintGeneralExpenseList(apiReq?: ApiRequest<GeneralExpensesFilters>): Promise<any> {
        let data = await this.GetGeneralExpensess(apiReq);
        let GEList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let UserName = apiReq.Data.UserName;
        let ExpenseType = apiReq.Data.ExpenseType;
        let UserId = apiReq.Data.UserId;
        let GEListData = data.Data[0];
        let TotalExpenseAmount: number = 0;
        for (let idx in GEList) {
            let item = GEList[idx];
            TotalExpenseAmount += item.ExpenseAmount;

        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GEListData.FacilityId);
        let info = {
            GEList: GEList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            UserName: UserName,
            UserId: UserId,
            ExpenseType: ExpenseType,
            TotalExpenseAmount: TotalExpenseAmount
        };
        let pdfOption: any = null;
        let key = 'generalexpenselist';
        pdfOption = {
            format: 'A5',
            orientation: 'landscape',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.1in',
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

    public GetModel(): SStatic.Model<GeneralExpensesInstance, GeneralExpensesAttributes> {
        return this.Models.GeneralExpenses;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GeneralExpensesFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DistrictName', 'Text'], 'DistrictName'];
        let val = await this.GetGeneralExpensess(apiReq);
        return { [key]: val.Data };
    }
}
