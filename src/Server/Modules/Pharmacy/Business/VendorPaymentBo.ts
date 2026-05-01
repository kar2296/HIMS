import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VendorPaymentInstance, VendorPaymentAttributes } from '../Model/Interface/Index';
import { VendorPaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as inventorybo from '../Business/Index';
import * as Userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';
import * as invbo from '../../Pharmacy/Business/Index';

// import * as doctorBo from '../Business/Index';


export class VendorPaymentBo extends BaseBo<VendorPaymentInstance, VendorPaymentAttributes> {
    // public async AddVendorPayment(req: BaseRequest): Promise<number> {
    //     if (req.Data.Header.VendorPaymentStatusId === 2) {
    //         req.Data.Header.VendorPaymentIdentifier = await Sequence.Next(SequenceKeys.VendorPaymentId);
    //     }
    //     let result = await this.Save(req.Data.Header);
    //     let PaymentDetailbo = BoFactory.GetBo(inventorybo.VendorPaymentDetailsBo, this.Request);
    //     await PaymentDetailbo.ManageVendorPaymentDetails(result.dataValues.Id, req.Data.Details);
    //     return result.dataValues.Id;
    // }
    public async AddVendorPayment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        if (result) {
            let paymentid = result.dataValues.Id;
            let VendorPaymentIdentifier: any = null;
            if (req.Data.Header.VendorPaymentStatusId === 2) {
                VendorPaymentIdentifier = this.getSequenceIdentifier(SequenceKeys.VendorPaymentId);
            }
            if (VendorPaymentIdentifier) {
                this.deferSequenceKey(paymentid, 'VendorPaymentIdentifier', VendorPaymentIdentifier);
            }
            if (req.Data.Header.VendorMasterId > 0) {
                let vendorbo = BoFactory.GetBo(invbo.VendorMasterBo, this.Request);
                // let GrnBo = BoFactory.GetBo(invbo.GrnBo, this.Request);
                // let GrnInfo = await GrnBo.GetGrnById({ Id: req.Data.Header.VendorMasterId });
                let VendorInfo = await vendorbo.GetVendorMasterById({ Id: req.Data.Header.VendorMasterId });
                let TdsAmt: number = 0;
                let writeoff: number = 0;
                if (!VendorInfo.PaidAmount || VendorInfo.PaidAmount === 0) {
                    TdsAmt = (VendorInfo.TDSAmount) + (req.Data.Header.TotalTDSAmount);
                    writeoff = (VendorInfo.WriteOff) + (req.Data.Header.WriteOff);
                } else if (VendorInfo.PaidAmount > 0) {
                    TdsAmt = (VendorInfo.TDSAmount);
                    writeoff = (VendorInfo.WriteOff);
                }
                let paymentRequest: any = {
                    Data: {
                        Id: VendorInfo.Id,
                        BillAmount: VendorInfo.BillAmount,
                        PaidAmount: (VendorInfo.PaidAmount) + (req.Data.Header.TotalPaidAmount),
                        TDSAmount: TdsAmt,
                        WriteOff: writeoff,
                        NetAmount: (VendorInfo.BillAmount) - (VendorInfo.PaidAmount + VendorInfo.TDSAmount + VendorInfo.WriteOff),
                        OutStandingAmount: (VendorInfo.BillAmount) - (VendorInfo.NetAmount),

                    }
                };
                await vendorbo.UpdateVendorMasters(paymentRequest);
            }
            let PaymentDetailbo = BoFactory.GetBo(inventorybo.VendorPaymentDetailsBo, this.Request);
            await PaymentDetailbo.ManageVendorPaymentDetails(result.dataValues.Id, req.Data.Details);

        }
        return result.dataValues.Id;
    }
    public async UpdateVendorPayment(req: BaseRequest): Promise<boolean> {
        // if (req.Data.Header.VendorPaymentStatusId === 2)
        //     req.Data.Header.VendorPaymentIdentifier = await Sequence.Next(SequenceKeys.VendorPaymentId);
        let result = await this.Update(req.Data.Header);
        if (result) {
            let paymentid = req.Data.Header.Id;
            let VendorPaymentIdentifier: any = null;
            if (req.Data.Header.VendorPaymentStatusId === 2) {
                VendorPaymentIdentifier = this.getSequenceIdentifier(SequenceKeys.VendorPaymentId);
            }
            if (VendorPaymentIdentifier) {
                this.deferSequenceKey(paymentid, 'VendorPaymentId', VendorPaymentIdentifier);
            }
            return paymentid;
        }
        let PaymentDetailbo = BoFactory.GetBo(inventorybo.VendorPaymentDetailsBo, this.Request);
        await PaymentDetailbo.ManageVendorPaymentDetails(req.Data.Header.Id, req.Data.Details);
        return result;
    }

    public async GetVendorPaymentById(req: BaseRequest): Promise<VendorPaymentAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetVendorPayments(apiReq?: ApiRequest<VendorPaymentFilters>): Promise<ApiResponse<VendorPaymentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('VendorPaymentStatus'));
        include.push(this.GetReference('PaymentType'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.VendorPaymentDetails, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorPaymentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorPaymentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VendorPaymentFilters.VendorPaymentDate:
                        where['VendorPaymentDate'] = { '$between': param.Value };
                        break;
                    case VendorPaymentFilters.FromDate:
                        where['VendorPaymentDate'] = where['VendorPaymentDate'] || {};
                        (where['VendorPaymentDate'] as any)['$gte'] = param.Value;
                        break;
                    case VendorPaymentFilters.ToDate:
                        where['VendorPaymentDate'] = where['VendorPaymentDate'] || {};
                        (where['VendorPaymentDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case VendorPaymentFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case VendorPaymentFilters.VendorPaymentStatusId:
                        where['VendorPaymentStatusId'] = param.Value;
                        break;
                    case VendorPaymentFilters.VendorPaymentIdentifier:
                        where['VendorPaymentIdentifier'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case VendorPaymentFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['VendorPaymentDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetSupplierVoucher(req: BaseRequest): Promise<any> {
        let PrnResult: any = [];
        // PrnResult['DisplayOrder'] = 3;
        if (req.Data.VendorMasterId > 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['VendorPaymentDate', 'VendorPaymentIdentifier',
                    'TotalNetAmount', 'TotalPaidAmount', 'VendorMasterId'],
                where: {
                    VendorPaymentDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    VendorPaymentStatusId: { '$in': [2] },
                    VendorMasterId: { '$eq': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let GrnNumber: string = '';
                let VoucherAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.VendorPaymentDate;
                    GrnNumber = bills.VendorPaymentIdentifier;
                    VoucherAmount = bills.TotalPaidAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'GrnNumber': GrnNumber,
                        'VoucherAmount': VoucherAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    PrnResult.push(info);
                }

            }
        } else if (req.Data.VendorMasterId === 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['VendorPaymentDate', 'VendorPaymentIdentifier',
                    'TotalNetAmount', 'TotalPaidAmount', 'VendorMasterId'],
                where: {
                    VendorPaymentDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    VendorPaymentStatusId: { '$in': [2] },
                    VendorMasterId: { '$gt': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let GrnNumber: string = '';
                let VoucherAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.VendorPaymentDate;
                    GrnNumber = bills.VendorPaymentIdentifier;
                    VoucherAmount = bills.TotalPaidAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'GrnNumber': GrnNumber,
                        'VoucherAmount': VoucherAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    PrnResult.push(info);
                }

            }
        }
        return PrnResult;
    }
    public async GetSupplierPendingSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let returnBO = BoFactory.GetBo(invbo.PurchaseReturnBo, this.Request);
        result.push({ Key: 1, Value: await this.SupplierPending(req) });
        result.push({ Key: 2, Value: await returnBO.SupplierReturn(req) });
        return result;
    }
    public async SupplierPending(req: BaseRequest): Promise<any> {
        let VendorGroup: { [id: number]: any[] } = {};
        let VendorGroupJoin: any = {
            model: this.Models.VendorMaster, as: 'VendorMaster',
            attributes: ['VendorName'],
            required: true,
        };
        let InvoiceAmtInstance: any = await this.FindAll({
            attributes: ['TotalInvoiceAmount', 'TotalTDSAmount', 'TotalOutstandingAmount',
                'WriteOff', 'TotalPaidAmount', 'TotalNetAmount', 'VendorName', 'VendorMasterId'],
            where: {
                VendorPaymentDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                VendorPaymentStatusId: { '$in': [2, 3, 4] },
                VendorMasterId: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                TotalOutstandingAmount: { '$gt': 0 },
            },
            include: [VendorGroupJoin]
        });
        if (InvoiceAmtInstance) {
            let groupbills = _.groupBy(InvoiceAmtInstance, 'VendorMasterId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let TotalInvoiceAmount: number = 0;
                let VendorMasterId: number = 0;
                let WriteOff: number = 0;
                let TotalTDSAmount: number = 0;
                let TotalNetAmount: number = 0;
                let TotalOutstandingAmount: number = 0;
                let TotalPaidAmount: number = 0;
                let VendorName: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WriteOff += bills.WriteOff;
                    TotalTDSAmount += bills.TotalTDSAmount;
                    TotalNetAmount += bills.TotalNetAmount;
                    TotalPaidAmount += bills.TotalPaidAmount;
                    TotalOutstandingAmount += bills.TotalOutstandingAmount;
                    TotalInvoiceAmount += bills.TotalInvoiceAmount;
                    VendorMasterId = bills.VendorMasterId;
                    VendorName = bills.VendorName;
                    VendorGroup[VendorMasterId] = VendorGroup[VendorMasterId] || [];
                }
                let info = {
                    'WriteOff': WriteOff,
                    'TotalTDSAmount': TotalTDSAmount,
                    'TotalNetAmount': TotalNetAmount,
                    'TotalOutstandingAmount': TotalOutstandingAmount,
                    'TotalPaidAmount': TotalPaidAmount,
                    'TotalInvoiceAmount': TotalInvoiceAmount,
                    'VendorMasterId': VendorMasterId,
                    'VendorName': VendorName
                };
                VendorGroup[VendorMasterId].push(info);
            }
        }
        return VendorGroup;
    }


    public async DeleteVendorPayment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintVendorPayment(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: VendorPaymentFilters.Id, Value: req.Id }]
        };
        let data = await this.GetVendorPayments(apiReq);
        let VendorPayment: any = data.Data[0];
        // let detailReq = {
        //     Id: 0,
        //     PageContext: { PageSize: -1, PageNumber: 1 },
        //     Params: [{ Key: VendorPaymentDetailsFilters.VendorPaymentId, Value: VendorPayment.Id }]
        // };
        // let PaymentDetailsBo = BoFactory.GetBo(doctorBo.VendorPaymentDetailsBo, this.Request);
        // let VendorPaymentDetailsData = await PaymentDetailsBo.GetVendorPaymentDetails(detailReq);
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VendorPayment.FacilityId);
        let info = {
            VendorPayment: VendorPayment,
            Preferences: printPreferencesData,
            // VendorPaymentDetails: VendorPaymentDetailsData,
        };
        return await Report.Generate('vendorpayment', { header: {}, body: info });
    }
    public async PrintVendorPaymentReport(apiReq?: ApiRequest<VendorPaymentFilters>): Promise<any> {
        let data = await this.GetVendorPayments(apiReq);
        let VendorPayment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let VendorName = apiReq.Data.VendorName;
        let PaymentType = apiReq.Data.PaymentType;
        let VendorPaymentData = data.Data[0];
        let TotalNetAmt: number = 0;
        let TotalRecAmt: number = 0;
        let TotalTdsAmt: number = 0;
        let TotalWriteoffAmt: number = 0;
        let TotalBalanceAmt: number = 0;
        for (let idx in VendorPayment) {
            let item = VendorPayment[idx];
            TotalNetAmt += item.TotalNetAmount;
            TotalRecAmt += item.TotalPaidAmount;
            TotalTdsAmt += item.TotalTDSAmount;
            TotalWriteoffAmt += item.WriteOff;
            TotalBalanceAmt += item.TotalOutstandingAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        // let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VendorPaymentData.FacilityId);
        // let printStoreData =
        //     await storePreferenceBO.GetStorePreferenceWithLogo(VendorPaymentData.FacilityId, VendorPaymentData.StoreMasterId);
        // if (printStoreData && printStoreData.printheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.printheader;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            VendorPayment: VendorPayment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            VendorName: VendorName,
            PaymentType: PaymentType,
            TotalNetAmt: TotalNetAmt,
            TotalRecAmt: TotalRecAmt,
            TotalTdsAmt: TotalTdsAmt,
            TotalWriteoffAmt: TotalWriteoffAmt,
            TotalBalanceAmt: TotalBalanceAmt

        };
        let pdfOption: any = null;
        let key = 'vendorpaymentreport';
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
    public async PrintSupplierPendingSummaryReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let Collection: any = [];
        let NetSupplierCollection: any = [];
        let SalesReq = req;
        Collection = await this.GetSupplierPendingSummary(SalesReq);
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(SalesReq.Data.FacilityId);
        if (Collection) {
            let suppliercollection = [];
            let supplierreturncollection = [];
            if (Collection.length > 0) {
                suppliercollection = Collection[0].Value;
            }
            if (Collection.length > 1) {
                supplierreturncollection = Collection[1].Value;
            }
            for (let idx in suppliercollection) {
                let suppliercoll = suppliercollection[idx];
                let Key = '';
                let InvoiceAmt = 0;
                let TDSAmt = 0;
                let Outstanding = 0;
                let Writeoff = 0;
                let PaidAmt = 0;
                let NetAmt = 0;
                for (let ix in suppliercoll) {
                    let VendorName = '';
                    if (suppliercoll[ix].VendorName) {
                        VendorName = suppliercoll[ix].VendorName;
                    }

                    if (suppliercoll[ix].TotalInvoiceAmount) {
                        InvoiceAmt = suppliercoll[ix].TotalInvoiceAmount;
                    }
                    if (suppliercoll[ix].TotalTDSAmount) {
                        TDSAmt = suppliercoll[ix].TotalTDSAmount;
                    }
                    if (suppliercoll[ix].TotalOutstandingAmount) {
                        Outstanding = suppliercoll[ix].TotalOutstandingAmount;
                    }
                    if (suppliercoll[ix].TotalNetAmount) {
                        NetAmt = suppliercoll[ix].TotalNetAmount;
                    }
                    if (suppliercoll[ix].WriteOff) {
                        Writeoff = suppliercoll[ix].WriteOff;
                    }
                    if (suppliercoll[ix].TotalPaidAmount) {
                        PaidAmt = suppliercoll[ix].TotalPaidAmount;
                    }
                    Key = VendorName;
                    InvoiceAmt = InvoiceAmt;
                    TDSAmt = TDSAmt;
                    Outstanding = Outstanding;
                    NetAmt = NetAmt;
                    Writeoff = Writeoff;
                    PaidAmt = PaidAmt;
                }
                NetSupplierCollection.push({
                    'Key': Key,
                    'Value': {
                        'InvoiceAmt': InvoiceAmt,
                        'TDSAmt': TDSAmt,
                        'Outstanding': Outstanding,
                        'NetAmt': NetAmt,
                        'Writeoff': Writeoff,
                        'PaidAmt': PaidAmt,
                        'ReturnAmt': 0.00,
                    }
                });
            }
            for (let idx in supplierreturncollection) {
                let supplierret = supplierreturncollection[idx];
                let Key = '';
                let ReturnAmt = 0;
                for (let ix in supplierret) {
                    let VendorName = '';
                    if (supplierret[ix].VendorName) {
                        VendorName = supplierret[ix].VendorName;
                    }

                    if (supplierret[ix].TotalReturnAmount) {
                        ReturnAmt = supplierret[ix].TotalReturnAmount;
                    }
                    Key = VendorName;
                    ReturnAmt = ReturnAmt;
                }
                let valappended = 0;
                NetSupplierCollection.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.Value.ReturnAmt = ReturnAmt;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetSupplierCollection.push({
                        'Key': Key,
                        'Value': {
                            'InvoiceAmt': 0.00,
                            'TDSAmt': 0.00,
                            'Outstanding': 0.00,
                            'NetAmt': 0.00,
                            'Writeoff': 0.00,
                            'PaidAmt': 0.00,
                            'ReturnAmt': ReturnAmt,
                        }
                    });
            }
        }

        let info = {
            NetSupplierCollection: NetSupplierCollection,
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,

        };
        let pdfOption: any = null;
        let key = 'pendingpaymentsummarybysupplier';
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
    public GetModel(): SStatic.Model<VendorPaymentInstance, VendorPaymentAttributes> {
        return this.Models.VendorPayment;
    }
}
