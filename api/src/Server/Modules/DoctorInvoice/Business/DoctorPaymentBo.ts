import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorPaymentInstance, DoctorPaymentAttributes } from '../Model/Interface/Index';
import { DoctorPaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as doctorBo from '../../DoctorInvoice/Business/Index';
import { join } from 'path';
import * as Userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';

export class DoctorPaymentBo extends BaseBo<DoctorPaymentInstance,
    DoctorPaymentAttributes> {
    public async AddDoctorPayment(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let generateDrPayout = 0;
        if (req.Data.PaymentStatusId === 2 || req.Data.PaymentStatusId === 3) {
            req.Data.DoctorPaymentIdentifier = null;
            // await Sequence.Next(SequenceKeys.DoctorPayment);
            generateDrPayout = 1;
        }
        let PaymentBo = BoFactory.GetBo(doctorBo.DoctorPaymentDetailsBo, this.Request);
        let result = await this.Save(req.Data);
        let drpayoutId = result.dataValues.Id;
        if (generateDrPayout === 1) {
            this.deferSequenceKey(drpayoutId, 'DoctorPaymentIdentifier',
                this.getSequenceIdentifier(SequenceKeys.DoctorPayment));
        }
        await PaymentBo.ManageDoctorPaymentDetails(result.dataValues.Id, req.Data.DoctorPaymentAmount, req.Data.Details);
        let doctorinvoicebo = BoFactory.GetBo(doctorBo.DoctorInvoiceBo, this.Request);
        let invoicedata: any = {
            Data: {
                Id: req.Data.DoctorInvoiceId,
                DoctorInvoiceStatusId: 3
            }
        };
        await doctorinvoicebo.Update(invoicedata.Data);
        return drpayoutId;

    }

    public async UpdateDoctorPayment(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let generateDrPayout = 0;
        if (req.Data.PaymentStatusId === 2 || req.Data.PaymentStatusId === 3) {
            req.Data.DoctorPaymentIdentifier = null; //await Sequence.Next(SequenceKeys.DoctorPayment);
            generateDrPayout = 1;
        }
        let result = await this.Update(req.Data);
        if (generateDrPayout === 1) {
            this.deferSequenceKey(req.Data.Id, 'DoctorPaymentIdentifier',
                this.getSequenceIdentifier(SequenceKeys.DoctorPayment));
        }
        let PaymentBo = BoFactory.GetBo(doctorBo.DoctorPaymentDetailsBo, this.Request);
        await PaymentBo.ManageDoctorPaymentDetails(req.Data.Id, req.Data.DoctorPaymentAmount, req.Data.Details);
        return result;
    }

    public async GetDoctorPaymentById(req: BaseRequest): Promise<DoctorPaymentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDoctorPayments(apiReq?: ApiRequest<DoctorPaymentFilters>):
        Promise<ApiResponse<DoctorPaymentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PaymentType'));
        include.push({
            model: this.Models.Facility, attributes: ['FacilityName'], required: false,
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'DepartmentId'], required: false,
            include: [
                { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName', 'DepartmentId'], required: false },
                this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Approved', attributes: ['FirstName', 'LastName'], required: false,
            include: [
                this.GetReference('Title')]
        });
        include.push({
            model: this.Models.DoctorPaymentDetails,
            required: false,
            include: [{
                model: this.Models.DoctorInvoice,
                required: false,
                attributes: ['Id', 'DoctorInvoiceIdentifier', 'InvoiceDateTime', 'IsFullyPaid', 'InvoiceAmount', 'DueAmount']
            }]
        });
        include.push(this.GetReference('DoctorPaymentStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorPaymentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorPaymentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorPaymentFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case DoctorPaymentFilters.PaymentIdentifier:
                        (where as any)['$or'] = [{ 'DoctorPaymentIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case DoctorPaymentFilters.GeneratedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case DoctorPaymentFilters.PaymentDate:
                        where['PaymentDateTime'] = { '$between': param.Value || '' };
                        break;
                    case DoctorPaymentFilters.PaymentStatusId:
                        where['PaymentStatusId'] = param.Value;
                        break;
                    case DoctorPaymentFilters.From:
                        where['PaymentDateTime'] = where['PaymentDateTime'] || {};
                        (where['PaymentDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case DoctorPaymentFilters.To:
                        where['PaymentDateTime'] = where['PaymentDateTime'] || {};
                        (where['PaymentDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case DoctorPaymentFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    case DoctorPaymentFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case DoctorPaymentFilters.UpdatedBy:
                        where['UpdatedBy'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDoctorPayment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetFacilityCollectionDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'Total Doctor Share', Value: await this.TotalDoctorShare(req) });
        return result;
    }
    public async TotalDoctorShare(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 12;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorPaymentAmount'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['DoctorPaymentAmount'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorPaymentAmount'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['DoctorPaymentAmount'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorPaymentAmount'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['DoctorPaymentAmount'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorPaymentAmount'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['DoctorPaymentAmount'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorPaymentAmount'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['DoctorPaymentAmount'];
        }

        return OPBillResult;
    }
    public async DoctorShareDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 11;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorShare'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['DoctorShare'] = bill['DoctorShare'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorShare'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['DoctorShare'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorShare'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['DoctorShare'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorShare'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['DoctorShare'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('DoctorPaymentAmount')), 'DoctorShare'],
            ],
            where: {
                PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['DoctorShare'];
        }

        return OPBillResult;
    }
    public async PrintDoctorPayment(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: DoctorPaymentFilters.Id, Value: req.Data.Id }]
        };
        let FacilityId = req.Data.FacilityId;
        let data = await this.GetDoctorPayments(apiReq);
        let DoctorPayments: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            DoctorPayment: DoctorPayments,
            Preferences: printPreferencesData
        };
        return await Report.Generate('doctorpayment', { header: {}, body: info });
    }
    public async DoctorpaymentBills(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['DoctorPaymentAmount', 'CreatedBy'],
                where: {
                    PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    PaymentStatusId: 3,
                    CreatedBy: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'CreatedBy');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorPaymentAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DoctorPaymentAmount += bills.DoctorPaymentAmount;
                        UserId = bills.CreatedBy;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashVocAmt': DoctorPaymentAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['DoctorPaymentAmount', 'CreatedBy'],
                where: {
                    PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    PaymentStatusId: 3,
                    CreatedBy: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'CreatedBy');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorPaymentAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DoctorPaymentAmount += bills.DoctorPaymentAmount;
                        UserId = bills.CreatedBy;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashVocAmt': DoctorPaymentAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['DoctorPaymentAmount', 'CreatedBy'],
                where: {
                    PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    PaymentStatusId: 3,
                    CreatedBy: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1] },
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'CreatedBy');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorPaymentAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DoctorPaymentAmount += bills.DoctorPaymentAmount;
                        UserId = bills.CreatedBy;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherVocAmt': DoctorPaymentAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['DoctorPaymentAmount', 'CreatedBy'],
                where: {
                    PaymentDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: [1, 2, 3, 5],
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    PaymentStatusId: 3,
                    CreatedBy: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1] },
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'CreatedBy');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DoctorPaymentAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        DoctorPaymentAmount += bills.DoctorPaymentAmount;
                        UserId = bills.CreatedBy;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherVocAmt': DoctorPaymentAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async PrintDoctorPaymentReport(apiReq?: ApiRequest<DoctorPaymentFilters>): Promise<any> {
        let data = await this.GetDoctorPayments(apiReq);
        let DoctorPayment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let DoctorPaymentData = data.Data[0];
        let TotalVoucherAmount: number = 0;
        let TotalTDSAmount: number = 0;
        let TotalPaidAmount: number = 0;
        for (let idx in DoctorPayment) {
            let item = DoctorPayment[idx];
            TotalVoucherAmount += item.DcotorInvoiceAmount;
            TotalTDSAmount += item.TDSAmount;
            TotalPaidAmount += item.DcotorPaymentAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorPaymentData.FacilityId);
        let info = {
            DoctorPayment: DoctorPayment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            TotalVoucherAmount: TotalVoucherAmount,
            TotalTDSAmount: TotalTDSAmount,
            TotalPaidAmount: TotalPaidAmount

        };
        let pdfOption: any = null;
        let key = 'doctorpaymentreport';
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


    public GetModel(): SStatic.Model<DoctorPaymentInstance, DoctorPaymentAttributes> {
        return this.Models.DoctorPayment;
    }
}
