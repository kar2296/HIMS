import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { UserBillingCountersInstance, UserBillingCountersAttributes } from '../Model/Interface/Index';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { UserBillingCountersFilters, UserBillingCounterDenominationsFilters, PatientPaymentDetailsFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class UserBillingCountersBo extends BaseBo<UserBillingCountersInstance, UserBillingCountersAttributes> {
    public async AddUserBillingCounters(req: BaseRequest): Promise<number> {
        if (req.Data.Header.BillingCounterStatusId === 1 && req.Data.Header.DocumentNumber === null) {
            req.Data.Header.DocumentNumber = await Sequence.Next(SequenceKeys.UserBillingCounterNo);
            req.Data.Header.DocumentDate = new Date();
            req.Data.Header.OpeningDate = new Date();
        }

        let result = await this.Save(req.Data.Header);
        if (result) {
            let denominationsBO = BoFactory.GetBo(bo.UserBillingCounterDenominationsBo, this.Request);
            let cancellationsBO = BoFactory.GetBo(bo.UserBillingCounterCancellationsBo, this.Request);
            let UserBillingCounterId = result.dataValues.Id;
            await denominationsBO.ManageUserBillingCounterDenominations(UserBillingCounterId, req.Data.Denominations);
            if (req.Data.Header.BillingCounterStatusId === 3) {
                await cancellationsBO.ManageUserBillingCounterCancellations(UserBillingCounterId, req.Data.Cancellations);
            }
            return UserBillingCounterId;
        }

        return 0;
    }

    public async UpdateUserBillingCounters(req: BaseRequest): Promise<boolean> {
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
            let denominationsBO = BoFactory.GetBo(bo.UserBillingCounterDenominationsBo, this.Request);
            let cancellationsBO = BoFactory.GetBo(bo.UserBillingCounterCancellationsBo, this.Request);
            let UserBillingCounterId = req.Data.Header.Id;
            await denominationsBO.ManageUserBillingCounterDenominations(UserBillingCounterId, req.Data.Denominations);
            if (req.Data.Header.BillingCounterStatusId === 3) {
                await cancellationsBO.ManageUserBillingCounterCancellations(UserBillingCounterId, req.Data.Cancellations);
            }
            return UserBillingCounterId;
        }

        return result;
    }

    public async GetUserBillingCountersById(req: BaseRequest): Promise<UserBillingCountersAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUserBillingCounters(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
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
        include.push({ model: this.Models.UserBillingCounterDenominations, required: false });
        include.push({ model: this.Models.UserBillingCounterCancellations, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UserBillingCountersFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UserBillingCountersFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DocumentNumber:
                        where['DocumentNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case UserBillingCountersFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetUserBillingCounterWithoutDenominations(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
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
        // include.push({ model: this.Models.UserBillingCounterDenominations, required: true });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UserBillingCountersFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UserBillingCountersFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DocumentNumber:
                        where['DocumentNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case UserBillingCountersFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.StartDate:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.EndDate:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$lte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.FromOpen:
                        where['OpeningDate'] = where['OpeningDate'] || {};
                        (where['OpeningDate'] as any)['$lte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.ToOpen:
                        where['OpeningDate'] = where['OpeningDate'] || {};
                        (where['OpeningDate'] as any)['$lte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.FromClosed:
                        where['ClosingDate'] = where['ClosingDate'] || {};
                        (where['ClosingDate'] as any)['$lte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.ToClosed:
                        where['ClosingDate'] = where['ClosingDate'] || {};
                        (where['ClosingDate'] as any)['$lte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.From:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.To:
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

    public async GetBillingCounters(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'SubmittedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UserBillingCountersFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UserBillingCountersFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.BillingCounterId:
                        where['BillingCounterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DocumentNumber:
                        (where as any)['$or'] = [{ 'DocumentNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        //where['DocumentNumber'] = param.Value;
                        break;
                    case UserBillingCountersFilters.DocumentDate:
                        where['DocumentDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.OpeningDate:
                        where['OpeningDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.ClosingDate:
                        where['ClosingDate'] = { '$between': param.Value || '' };
                        break;
                    case UserBillingCountersFilters.BillingCounterStatusId:
                        where['BillingCounterStatusId'] = param.Value;
                        break;
                    case UserBillingCountersFilters.From:
                        where['DocumentDate'] = where['DocumentDate'] || {};
                        (where['DocumentDate'] as any)['$gte'] = param.Value;
                        break;
                    case UserBillingCountersFilters.To:
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

    public async PrintUpdateUserBillingCounters(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserBillingCountersFilters.Id, Value: req.Id }]
        };
        let data = await this.GetUserBillingCounters(apiReq);
        let UserBillingCounters = data.Data[0];
        let CashInHand: number = 0;
        CashInHand = UserBillingCounters.OpeningBalance + UserBillingCounters.ClosingCash;
        let UserBillingCounterDenominationsBo = BoFactory.GetBo(bo.UserBillingCounterDenominationsBo, this.Request);
        let UserBillingCountersReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: UserBillingCounterDenominationsFilters.UserBillingCounterId, Value: req.Id }]
        };
        let UserBillingCounterDenominationsData = await
            UserBillingCounterDenominationsBo.GetUserBillingCounterDenominations(UserBillingCountersReq);
        let UserBillingCounterDenominations = UserBillingCounterDenominationsData.Data;
        let OverAllDenominationTotal: number = 0;
        UserBillingCounterDenominationsData.Data.forEach((Detail: any) => {
            OverAllDenominationTotal += Detail.DenominationTotal;
        });
        let ShortageAmount: number = 0;
        ShortageAmount = (UserBillingCounters.OpeningBalance + UserBillingCounters.ClosingCash) - OverAllDenominationTotal;
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
            { Key: PatientPaymentDetailsFilters.CreatedBy, Value: req.Data.userid },
            { Key: PatientPaymentDetailsFilters.From, Value: req.Data.From },
            { Key: PatientPaymentDetailsFilters.To, Value: req.Data.To }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let TotalNetUpi: number = 0;
        PatientPaymentDetailsData.Data.forEach((Detail: any) => {
            if (Detail.PaymentTypeId === 11 && Detail.ReceiptStatusId === 1) {
                TotalNetUpi += Detail.AmountPaid;
            }
        });

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData = await facilityPreferenceBO.GetFacilityPreferenceWithLogo(UserBillingCounters.FacilityId);

        let info = {
            UserBillingCounters: UserBillingCounters,
            UserBillingCounterDenominations: UserBillingCounterDenominations,
            OverAllDenominationTotal: OverAllDenominationTotal,
            CashInHand: CashInHand,
            ShortageAmount: ShortageAmount,
            Preferences: printPreferencesData,
            TotalNetUpi: TotalNetUpi
        };
        let key = 'cashsubmission';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<UserBillingCountersInstance, UserBillingCountersAttributes> {
        return this.Models.UserBillingCounters;
    }
}
