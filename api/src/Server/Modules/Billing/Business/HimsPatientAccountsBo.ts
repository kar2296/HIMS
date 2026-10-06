import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAccountsInstance, PatientAccountsAttributes } from '../Model/Interface/Index';
import { PatientAccountsFilters } from '../Common/Filters.e';

export class PatientAccountsBo extends BaseBo<PatientAccountsInstance, PatientAccountsAttributes>  {
    public async AddPatientAccounts(req: BaseRequest): Promise<number> {
        return 0;
    }

    public async UpdatePatientAccounts(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async GetPatientAccountsById(req: BaseRequest): Promise<PatientAccountsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClosingBalanceByPatientId(req: BaseRequest): Promise<any> {
        let patientaccounts = null;
        let filterInfo = req.Data;
        let patientaccountsInstance = await this.Find({
            where: {
                PatientId: filterInfo.PatientId
            },
            order: [['PatientAccountId', 'DESC']]
        });
        if (patientaccountsInstance) {
            patientaccounts = this.GetAttribute(patientaccountsInstance);
        }
        return patientaccounts;
    }

    public async ManagePatientAccounts(TransactionType: number, patientaccount: PatientAccountsAttributes): Promise<boolean> {
        if (patientaccount.Id === 0) {
            if (TransactionType === 1) {
                let ItemPrevClosingBalance = await this.GetClosingBalanceByPatientId({
                    Id: 0,
                    Data: { PatientId: patientaccount.PatientId }
                });
                if (ItemPrevClosingBalance !== null) {
                    patientaccount.ClosingBalance = Number(ItemPrevClosingBalance.ClosingBalance) + Number(patientaccount.CreditAmount);
                } else {
                    patientaccount.ClosingBalance = Number(patientaccount.CreditAmount);
                }
            } else if (TransactionType === 2) {
                let ItemPrevClosingBalance = await this.GetClosingBalanceByPatientId({
                    Id: 0,
                    Data: { PatientId: patientaccount.PatientId }
                });
                if (ItemPrevClosingBalance !== null) {
                    if (patientaccount.IsAdvanceAdjusted) {
                        patientaccount.ClosingBalance =
                            Number(ItemPrevClosingBalance.ClosingBalance) - Number(patientaccount.AdjustedAmount);
                    } else {
                        patientaccount.ClosingBalance = Number(ItemPrevClosingBalance.ClosingBalance);
                    }
                } else {
                    patientaccount.ClosingBalance = Number(patientaccount.BillAmount);
                }
            }

            await this.Save(patientaccount);
        }

        return true;
    }

    public async GetPatientAccounts(apiReq?: ApiRequest<PatientAccountsFilters>):
        Promise<ApiResponse<PatientAccountsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, required: false });
        include.push({ model: this.Models.Facility, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAccountsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAccountsFilters.FromDate:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientAccountsFilters.ToDate:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientAccountsFilters.TransactionDate:
                        where['TransactionDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientAccountsFilters.TransactionNumber:
                        where['TransactionNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientAccountsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAccountsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientAccountsFilters.PatientReceiptId:
                        where['PatientReceiptId'] = param.Value;
                        break;
                    case PatientAccountsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientAccountsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['PatientAccountId', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientAccounts(req: BaseRequest): Promise<Boolean> {
        return true;
    }

    public async AmountInWord(amt: number): Promise<string> {
        let amount: number = amt;
        let lang = 'enIndian';
        let writtenNumber = require('written-number');
        let stramt = amount.toFixed(2);
        let ActualAmts = stramt.split('.');
        if (ActualAmts.length > 0) {
            let damt1: number = +ActualAmts[0];
            var writtenNumber1 = writtenNumber(damt1, { lang: lang });
        }
        if (ActualAmts.length > 1) {
            var damt2 = +ActualAmts[1];
            var writtenNumber2 = writtenNumber(damt2, { lang: lang });
        }
        return writtenNumber1 + ' and ' + writtenNumber2 + ' Paise';
    }

    public GetModel(): SStatic.Model<PatientAccountsInstance, PatientAccountsAttributes> {
        return this.Models.PatientAccounts;
    }
}
