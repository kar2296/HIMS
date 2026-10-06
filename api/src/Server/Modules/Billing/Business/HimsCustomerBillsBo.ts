import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as inventoryBO from '../../Pharmacy/Business/Index';
import * as generalBO from '../../General/Business/Index';
import { CustomerBillsInstance, CustomerBillsAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { CustomerBillsFilters, CustomerBillDetailsFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as _ from 'lodash';

export class CustomerBillsBo extends BaseBo<CustomerBillsInstance, CustomerBillsAttributes>  {
    public async AddCustomerBills(req: BaseRequest): Promise<number> {
        if (!req.Data.Header.BillNumber && req.Data.Header.CustomerBillStatusId === 3) {
            /* req.Data.Header.BillNumber = await Sequence.Next(SequenceKeys.CustomerBillNumberId); */
            req.Data.Header.BillDateTime = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.CustomerBillDetailsBo, this.Request);
            let CustomerBillId = result.dataValues.Id;
            await detailBO.ManageCustomerBillDetails(CustomerBillId, req.Data.Details);

            if (req.Data.Header.CustomerBillStatusId === 3) {
                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                let stockResult = await stockitemBO.ManageStockItems(21, CustomerBillId, req.Data);
                if (stockResult && stockResult.length > 0) {
                    let errorMessages: any = [];
                    _.forEach(stockResult, (item: any) => { errorMessages.push(item.error.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(21, CustomerBillId, req.Data);
            }

            let billIdentifier: any = null;
            if (!req.Data.Header.BillNumber && req.Data.Header.CustomerBillStatusId === 3) {
                billIdentifier = this.getSequenceIdentifier(SequenceKeys.CustomerBillNumberId);
            }

            if (billIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, customerBillId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = customerBillId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, CustomerBillId);
                };

                this.deferSequenceKey(CustomerBillId, 'BillNumber', billIdentifier, [afterO().UpdateMovementInfo]);

            }

            return CustomerBillId;
        }

        return 0;
    }

    public async UpdateCustomerBills(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.Id > 0 && !req.Data.Header.BillNumber && req.Data.Header.CustomerBillStatusId === 3) {
            /* req.Data.Header.BillNumber = await Sequence.Next(SequenceKeys.CustomerBillNumberId); */
            req.Data.Header.BillDateTime = new Date();
        }
        let result = await this.Update(req.Data.Header);
        let CustomerBillId = req.Data.Header.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(bo.CustomerBillDetailsBo, this.Request);
            await detailBO.ManageCustomerBillDetails(CustomerBillId, req.Data.Details);

            if (req.Data.Header.CustomerBillStatusId === 3) {
                let stockitemBO = BoFactory.GetBo(inventoryBO.StockItemBo, this.Request);
                let stockResult = await stockitemBO.ManageStockItems(21, CustomerBillId, req.Data);
                if (stockResult && stockResult.length > 0) {
                    let errorMessages: any = [];
                    _.forEach(stockResult, (item: any) => { errorMessages.push(item.error.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(21, CustomerBillId, req.Data);
            }

            let billIdentifier: any = null;
            if (!req.Data.Header.BillNumber && req.Data.Header.CustomerBillStatusId === 3) {
                billIdentifier = this.getSequenceIdentifier(SequenceKeys.CustomerBillNumberId);
            }

            if (billIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, customerBillId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = customerBillId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, CustomerBillId);
                };

                this.deferSequenceKey(CustomerBillId, 'BillNumber', billIdentifier, [afterO().UpdateMovementInfo]);

            }

            return CustomerBillId;
        }
        return result;
    }

    public async GetCustomerBillsById(req: BaseRequest): Promise<CustomerBillsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCustomerBills(apiReq?: ApiRequest<CustomerBillsFilters>):
        Promise<ApiResponse<CustomerBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let detailswhere: WhereOptions<any> = {};
        let isCustomerDetailsRequired: any = false;
        let storemasterId: -1;
        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('CustomerBillStatus'));
        include.push({
            model: this.Models.CustomerMaster, attributes: ['PaymentTermsId', 'CustomerCode', 'CustomerName',
            'AddressLine1','AddressLine2','CustomerCode', 'MobileNumber', 'PhoneNumber',
                'EmailAddress', 'GSTNumber'], required: false,
            include: [
                this.GetReference('PaymentTerms'),
                {
                    model: this.Models.CustomerContact, attributes: ['AddressLine1', 'AddressLine2', 'PinCodeId', 'CityId',
                        'StateId', 'DistrictId', 'CountryId', 'Area'], required: false,
                    include: [
                        { model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false, },
                        { model: this.Models.CityMaster, attributes: ['CityName'], required: false, },
                        { model: this.Models.StateMaster, attributes: ['StateName'], required: false, },
                        { model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false, },
                        { model: this.Models.CountryMaster, attributes: ['CountryName'], required: false, }]
                }
            ]
        });
        include.push({
            model: this.Models.User, as: 'GeneratedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CancelledUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CustomerBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CustomerBillsFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case CustomerBillsFilters.BillNumber:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case CustomerBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case CustomerBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case CustomerBillsFilters.BillStatus:
                        where['CustomerBillStatusId'] = param.Value;
                        break;
                    case CustomerBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case CustomerBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case CustomerBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case CustomerBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case CustomerBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case CustomerBillsFilters.CustomerMasterId:
                        where['CustomerMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.CustomerBillDetails,
            required: isCustomerDetailsRequired,
            where: detailswhere,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        { model: this.Models.DrugMaster, required: false },
                        {
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
                        }
                    ]
                }]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async PrintCustomerBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: CustomerBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetCustomerBills(apiReq);

        let CustomerContact: any = {};
        data.Data.forEach((Detail: any) => {
            if (Detail.CustomerMaster) {
                if (Detail.CustomerMaster.CustomerContacts) {
                    CustomerContact = Detail.CustomerMaster.CustomerContacts[0];
                }
            }
            Detail.CustomerMaster.CustomerContacts = CustomerContact;
        });

        let CustomerBills = data.Data[0];
        let CustomerBillDetailsBo = BoFactory.GetBo(bo.CustomerBillDetailsBo, this.Request);
        let customerdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: CustomerBillDetailsFilters.CustomerBillId, Value: CustomerBills.Id }]
        };
        let CustomerDetailsData = await CustomerBillDetailsBo.GetCustomerBillDetails(customerdetailReq);
        let CustomerDetails: any = [];
        let TotalGst: number = 0;
        CustomerDetailsData.Data.sort(function (a, b) {
            return a.Id - b.Id;
        });
        CustomerDetailsData.Data.forEach((Detail: any) => {
            let CustomerBillDetail = Detail;
            CustomerBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalGst += Detail.GstPercentage;
            CustomerDetails.push(CustomerBillDetail);
        });

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CustomerBills.FacilityId);
        let info = {
            CustomerBills: CustomerBills,
            CustomerDetails: CustomerDetails,
            NetAmount: (CustomerBills.BillAmount - CustomerBills.DiscountAmount) + CustomerBills.RoundOffValue,
            TotalGst: TotalGst,
            WithoutTax: CustomerBills.BillAmount,
            Preferences: printPreferencesData
        };

        let key = 'customerbill';
        let Watermark = 'DUPLICATE';
        let PrintTypeId: number;
        if (info.CustomerBills.CustomerBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (req.Data.isprint) {
            key = 'customersmall';
            PrintTypeId = 1;
        }
        let pdfOption: any = null;

        let pdfOptionJSON: any = null;
        //let pdfOptionJSON = await Report.GetPdfOption(key);

        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
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
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
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

    public GetModel(): SStatic.Model<CustomerBillsInstance, CustomerBillsAttributes> {
        return this.Models.CustomerBills;
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(inventoryBO.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }
}
