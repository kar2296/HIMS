import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { BankStatementsInstance, BankStatementsAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import {
    BankStatementsFilters, BankStatementDenominationsFilters,
    BankStatementDetailsFilters
} from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class BankStatementsBo extends BaseBo<BankStatementsInstance, BankStatementsAttributes> {
    public async AddBankStatements(req: BaseRequest): Promise<number> {
        let NrIdentifier: any = null;
        if (req.Data.Header.DocumentNumber === null) {
            req.Data.Header.DocumentDate = new Date();
            req.Data.Header.SubmitedDate = new Date();
            NrIdentifier = this.getSequenceIdentifier(SequenceKeys.BankStatementNumberId);
        }

        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailsBO = BoFactory.GetBo(bo.BankStatementDetailsBo, this.Request);
            let denominationsBO = BoFactory.GetBo(bo.BankStatementDenominationsBo, this.Request);
            let cancellationsBO = BoFactory.GetBo(bo.BankStatementCancellationsBo, this.Request);
            let BankStatementId = result.dataValues.Id;
            if (NrIdentifier) {
                try {
                    this.deferSequenceKey(BankStatementId, 'DocumentNumber', NrIdentifier);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }

            await detailsBO.ManageBankStatementDetails(BankStatementId, req.Data.Details);
            await denominationsBO.ManageBankStatementDenominations(BankStatementId, req.Data.Denominations);
            if (req.Data.Header.BillingCounterStatusId === 3) {
                await cancellationsBO.ManageBankStatementCancellations(BankStatementId, req.Data.Cancellations);
            }
            return BankStatementId;
        }

        return 0;
    }

    public async DatesAlreadyExist(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.OpeningDate && req.Data.Header.ClosingDate) {
            let bankSatementsInstance = await this.Find({
                where: {
                    BillingCounterStatusId: 3,
                    OpeningDate: {
                        '$between':
                            [req.Data.Header.OpeningDate, req.Data.Header.ClosingDate]
                    },
                    ClosingDate: {
                        '$between':
                            [req.Data.Header.OpeningDate, req.Data.Header.ClosingDate]
                    },

                },
                order: [['Id', 'DESC']],
            });
            if (bankSatementsInstance) {
                let BNKStmt: any = this.GetAttribute(bankSatementsInstance);
                if (BNKStmt && BNKStmt.Id) {
                    return true;
                }
            }
        }
        return false;
    }

    public async UpdateBankStatements(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.BillingCounterStatusId === 2) {
            req.Data.Header.ClosingDate = new Date();
        } else if (req.Data.Header.BillingCounterStatusId === 3) {
            req.Data.Header.SubmitedDate = new Date();
        } else if (req.Data.Header.BillingCounterStatusId === 4) {
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.BillingCounterStatusId === 5) {
            req.Data.Header.AuthorizedDate = new Date();
        }

        let result = await this.Update(req.Data.Header);
        if (result) {
            let denominationsBO = BoFactory.GetBo(bo.BankStatementDenominationsBo, this.Request);
            let cancellationsBO = BoFactory.GetBo(bo.BankStatementCancellationsBo, this.Request);
            let BankStatementId = req.Data.Header.Id;
            await denominationsBO.ManageBankStatementDenominations(BankStatementId, req.Data.Denominations);
            if (req.Data.Header.BillingCounterStatusId === 3) {
                await cancellationsBO.ManageBankStatementCancellations(BankStatementId, req.Data.Cancellations);
            }
            return BankStatementId;
        }

        return result;
    }

    public async GetBankStatementsById(req: BaseRequest): Promise<BankStatementsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBankStatements(apiReq?: ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BillingCounter'));
        include.push(this.GetReference('BillingCounterStatus'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Users', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.BankStatementDetails, required: false });
        include.push({ model: this.Models.BankStatementDenominations, required: false });
        include.push({ model: this.Models.BankStatementCancellations, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BankStatementsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BankStatementsFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case BankStatementsFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case BankStatementsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case BankStatementsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case BankStatementsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case BankStatementsFilters.DocumentNumber:
                        where['DocumentNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case BankStatementsFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetBankStatementWithoutDenominations(apiReq?: ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BillingCounter'));
        include.push(this.GetReference('BillingCounterStatus'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({ model: this.Models.BankStatementDenominations, required: true });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BankStatementsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BankStatementsFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case BankStatementsFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case BankStatementsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case BankStatementsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case BankStatementsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case BankStatementsFilters.DocumentNumber:
                        where['DocumentNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case BankStatementsFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    case BankStatementsFilters.StartDate:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case BankStatementsFilters.EndDate:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.FromOpen:
                        where['OpeningDate'] = where['OpeningDate'] || {};
                        (where['OpeningDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.ToOpen:
                        where['OpeningDate'] = where['OpeningDate'] || {};
                        (where['OpeningDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.FromClosed:
                        where['ClosingDate'] = where['ClosingDate'] || {};
                        (where['ClosingDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.ToClosed:
                        where['ClosingDate'] = where['ClosingDate'] || {};
                        (where['ClosingDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.From:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case BankStatementsFilters.To:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$lte'] = param.Value;
                        break;
                    case BankStatementsFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetBillingCounters(apiReq?: ApiRequest<BankStatementsFilters>):
        Promise<ApiResponse<BankStatementsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BillingCounter'));
        include.push(this.GetReference('BillingCounterStatus'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BankStatementsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BankStatementsFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case BankStatementsFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case BankStatementsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case BankStatementsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case BankStatementsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case BankStatementsFilters.DocumentNumber:
                        (where as any)['$or'] = [{ 'DocumentNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        //where['DocumentNumber'] = param.Value;
                        break;
                    case BankStatementsFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case BankStatementsFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    case BankStatementsFilters.From:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case BankStatementsFilters.To:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async AmountInWord(amt: number): Promise<string> {
        let amount: number = amt;
        let lang = 'enIndian';
        let writtenNumber = require('written-number');
        let stramt = amount.toFixed(2);
        let ActualAmts = stramt.split('.');
        let writtenNumber1 = '';
        let writtenNumber2 = '';
        if (ActualAmts.length > 0) {
            let damt1: number = +ActualAmts[0];
            writtenNumber1 = writtenNumber(damt1, { lang: lang });
        }
        if (ActualAmts.length > 1) {
            let damt2 = +ActualAmts[1];
            writtenNumber2 = writtenNumber(damt2, { lang: lang });
        }
        return writtenNumber1 + ' and ' + writtenNumber2 + ' Paise';
    }

    public async PrintUpdateBankStatements(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: BankStatementsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetBankStatements(apiReq);
        let BankStatements = data.Data[0];
        let bankStatementDenominationsBo = BoFactory.GetBo(bo.BankStatementDenominationsBo, this.Request);
        let bankStatementDetailsBo = BoFactory.GetBo(bo.BankStatementDetailsBo, this.Request);

        let BankStatementsDetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: BankStatementDetailsFilters.BankStatementId, Value: req.Id }]
        };
        let BankStatementDetailsData = await
            bankStatementDetailsBo.GetBankStatementDetails(BankStatementsDetailReq);
        let BankStatementsDenmReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: BankStatementDenominationsFilters.BankStatementId, Value: req.Id }]
        };
        let OverAllNetCash: number = 0;
        let OverAllCash: number = 0;
        let OverAllCard: number = 0;
        let OverAllOthers: number = 0;
        let OverAllLHRC: number = 0;
        let OverAllVoucher: number = 0;
        BankStatementDetailsData.Data.forEach((Detail: any) => {
            OverAllNetCash += Detail.NetCash;
            OverAllCash += Detail.Cash;
            OverAllCard += Detail.Card;
            OverAllOthers += Detail.Others;
            OverAllLHRC += Detail.LHRC;
            OverAllVoucher += Detail.Voucher;
        });

        let BankStatementDenominationsData = await
            bankStatementDenominationsBo.GetBankStatementDenominations(BankStatementsDenmReq);
        let BankStatementDenominations = BankStatementDenominationsData.Data;
        let OverAllDenominationTotal: number = 0;
        BankStatementDenominationsData.Data.forEach((Detail: any) => {
            OverAllDenominationTotal += Detail.DenominationTotal;
        });


        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData = await facilityPreferenceBO.GetFacilityPreferenceWithLogo(BankStatements.FacilityId);

        let info = {
            BankStatements: BankStatements,
            BankStatementDetails: BankStatementDetailsData.Data,
            BankStatementDenominations: BankStatementDenominations,
            OverAllDenominationTotal: OverAllDenominationTotal,
            OverAllNetCash: OverAllNetCash,
            OverAllCash: OverAllCash,
            OverAllCard: OverAllCard,
            OverAllOthers: OverAllOthers,
            OverAllLHRC: OverAllLHRC,
            OverAllVoucher: OverAllVoucher,
            Balance: (OverAllDenominationTotal - (OverAllNetCash + BankStatements.FetalAmount)),
            Preferences: printPreferencesData
        };

        let pdfOption: any = null;
        {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        }
        return await Report.Generate('bankstatement', { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<BankStatementsInstance, BankStatementsAttributes> {
        return this.Models.BankStatements;
    }
}
