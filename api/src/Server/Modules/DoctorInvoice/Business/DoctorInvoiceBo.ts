import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DoctorInvoiceInstance, DoctorInvoiceAttributes } from '../Model/Interface/Index';
import { DoctorInvoiceFilters, DoctorInvoiceDetailsFilters, DoctorPaymentDetailsFilters, DoctorPaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as doctorBo from '../Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
// import * as moment from 'moment';

export class DoctorInvoiceBo extends BaseBo<DoctorInvoiceInstance, DoctorInvoiceAttributes> {
    public async AddDoctorInvoice(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let generateDrInvoice = 0;
        if (req.Data.DoctorInvoiceStatusId === 2) {
            req.Data.DoctorInvoiceIdentifier = null;
            generateDrInvoice = 1;
        }
        let result = await this.Save(req.Data);
        let DrInvoiceId = result.dataValues.Id;
        if (generateDrInvoice === 1) {
            this.deferSequenceKey(DrInvoiceId, 'DoctorInvoiceIdentifier',
                this.getSequenceIdentifier(SequenceKeys.DoctorInvoice));
        }
        let InvoiceDetailsBo = BoFactory.GetBo(doctorBo.DoctorInvoiceDetailsBo, this.Request);
        await InvoiceDetailsBo.ManageInvoiceDetails(result.dataValues.Id, req.Data.Details);
        return DrInvoiceId;
    }

    public async UpdateDoctorInvoice(req: BaseRequest): Promise<boolean> {
        // this.HandleActiveState(req.Data);
        let generateDrInvoice = 0;
        if (req.Data.DoctorInvoiceStatusId === 2) {
            generateDrInvoice = 1;
            req.Data.DoctorInvoiceIdentifier = null; // await Sequence.Next(SequenceKeys.DoctorInvoice);
        }
        let result = await this.Update(req.Data);
        if (generateDrInvoice === 1) {
            this.deferSequenceKey(req.Data.Id, 'DoctorInvoiceIdentifier',
                this.getSequenceIdentifier(SequenceKeys.DoctorInvoice));
        }
        let InvoiceDetailsBo = BoFactory.GetBo(doctorBo.DoctorInvoiceDetailsBo, this.Request);
        await InvoiceDetailsBo.ManageInvoiceDetails(req.Data.Id, req.Data.Details);
        return result;
    }

    public async GetDoctorInvoiceById(req: BaseRequest): Promise<DoctorInvoiceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDoctorInvoices(apiReq?: ApiRequest<DoctorInvoiceFilters>):
        Promise<ApiResponse<DoctorInvoiceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Facility, attributes: ['FacilityName'], required: false,
        });
        include.push({
            model: this.Models.DoctorPaymentDetails, attributes: ['PaymentStatusId'], required: false,
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
            model: this.Models.DoctorInvoiceDetails,
            required: false,
            include: [{
                model: this.Models.PatientBillDetails,
                include: [{
                    model: this.Models.PatientBills,
                    attributes: ['BillNumber', 'PatientName', 'DoctorName', 'PatientOrderId',
                        'BillTypeId', 'BillDateTime', 'DepartmentId', 'BillDiscount'],
                    required: false,
                    include: [{
                        model: this.Models.Department, as: 'Department',
                        attributes: ['DepartmentName', 'DepartmentId'],
                        required: false
                    },
                    {
                        model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                            'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                            'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                        required: false,
                        include: [this.GetReference('Title'), this.GetReference('Gender')],
                    }]
                }]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.Encounter,
                attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
                required: false
            }
            ]
        });
        include.push(this.GetReference('DoctorInvoiceStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorInvoiceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.InvoiceIdentifier:
                        (where as any)['$or'] = [{ 'DoctorInvoiceIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case DoctorInvoiceFilters.GeneratedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.InvoiceDate:
                        where['InvoiceDateTime'] = { '$between': param.Value || '' };
                        break;
                    case DoctorInvoiceFilters.InvoiceStatusId:
                        where['DoctorInvoiceStatusId'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.IsFullyPaid:
                        where['IsFullyPaid'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.From:
                        where['InvoiceDateTime'] = where['InvoiceDateTime'] || {};
                        (where['InvoiceDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.To:
                        where['InvoiceDateTime'] = where['InvoiceDateTime'] || {};
                        (where['InvoiceDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case DoctorInvoiceFilters.TDSAmount:
                        where['TDSAmount'] = { '$gt': '0' };
                        break;
                    case DoctorInvoiceFilters.TDSId:
                        where['TDSId'] = { '$gt': param.Value };
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        order.push(['InvoiceDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async getExcuteStoredProcedure(req: BaseRequest): Promise<any> {
        let FirstDay = new Date(req.Data.From);
        let LastDay = new Date(req.Data.To);
        let replacements: any = {
            FirstDay: FirstDay,
            LastDay: LastDay
        };
        console.log(replacements);
        let spName =
            'Att_process_upgraded(:FirstDay,LastDay)';
        await this.ExecuteStoredProcedure(spName, {
            replacements: replacements,
        });
    }
    public async DeleteDoctorInvoice(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintDoctorInvoice(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: DoctorInvoiceFilters.Id, Value: req.Id }]
        };
        let data = await this.GetDoctorInvoices(apiReq);
        let DoctorInvoices: any = data.Data[0];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: DoctorInvoiceDetailsFilters.DoctorInvoiceId, Value: DoctorInvoices.Id }]
        };
        let InvoiceDetailsBo = BoFactory.GetBo(doctorBo.DoctorInvoiceDetailsBo, this.Request);
        let DoctorInvoiceDetailsData = await InvoiceDetailsBo.GetDoctorInvoiceDetails(detailReq);
        let DoctorInvoiceDetails: any = [];
        let HosShare = 0;
        let TobePaidAmount = 0;
        let TotalAmount = 0;
        let DiscountAmount = 0;
        let DoctorShare = 0;
        DoctorInvoiceDetailsData.Data.forEach((Detail: any) => {
            let DocInvoiceDetail = Detail;
            DocInvoiceDetail.HosShare = (Detail.PatientBillDetail.GrossAmount) - (Detail.PatientBillDetail.DoctorShare);
            DocInvoiceDetail.TobePaidAmount = (Detail.PatientBillDetail.DoctorShare) - (Detail.PatientBillDetail.DiscountAmount);
            TotalAmount = (TotalAmount) + (Detail.PatientBillDetail.GrossAmount);
            DiscountAmount = (DiscountAmount) + (Detail.PatientBillDetail.DiscountAmount);
            DoctorShare = (DoctorShare) + (Detail.PatientBillDetail.DoctorShare);
            HosShare = (HosShare) + (DocInvoiceDetail.HosShare);
            DoctorInvoiceDetails.push(DocInvoiceDetail);
        });
        let custom_sort = function (a: any, b: any) {
            return (a.PatientBillDetail.PatientBill.BillDateTime) - (b.PatientBillDetail.PatientBill.BillDateTime);
        };
        DoctorInvoiceDetails.sort(custom_sort);

        let DoctorPaymentData: any = {};
        if (DoctorInvoices.DoctorInvoiceStatusId === 3) {
            let PaydetailReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: DoctorPaymentDetailsFilters.DoctorInvoiceId, Value: DoctorInvoices.Id }]
            };
            let payDetailsBo = BoFactory.GetBo(doctorBo.DoctorPaymentDetailsBo, this.Request);
            let DoctorPayDetailsData = await payDetailsBo.GetDoctorPaymentDetails(PaydetailReq);
            let DoctorPayDetails = DoctorPayDetailsData.Data[0];
            let PaymentReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: DoctorPaymentFilters.Id, Value: DoctorPayDetails.DoctorPaymentId }]
            };
            let PaymentBO = BoFactory.GetBo(doctorBo.DoctorPaymentBo, this.Request);
            let DoctorPayData = await PaymentBO.GetDoctorPayments(PaymentReq);
            DoctorPaymentData = DoctorPayData.Data[0];
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorInvoices.FacilityId);
        let info = {
            DoctorInvoices: DoctorInvoices,
            Preferences: printPreferencesData,
            HosShare: HosShare,
            TobePaidAmount: TobePaidAmount,
            DoctorInvoiceDetails: DoctorInvoiceDetails,
            TotalAmount: TotalAmount,
            DiscountAmount: DiscountAmount,
            DoctorShare: DoctorShare,
            DoctorPaymentData: DoctorPaymentData
        };

        let key = 'doctorinvoice';
        if (DoctorInvoices.DoctorInvoiceStatusId === 3) {
            key = 'doctorinvoicewithvoucher';
        }
        return await Report.Generate(key, { header: {}, body: info });

        // return await Report.Generate('doctorinvoice', { header: {}, body: info });
    }
    public async PrintDoctorInvoiceTds(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        let data = await this.GetDoctorInvoices(apiReq);
        let DoctorTdsList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let DoctorTds = data.Data[0];
        let TotalTdsAmount: number = 0;
        for (let idx in DoctorTdsList) {
            let item = DoctorTdsList[idx];
            TotalTdsAmount += item.TDSAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorTds.FacilityId);
        let info = {
            DoctorTdsList: DoctorTdsList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            TotalTdsAmount: TotalTdsAmount
        };
        let pdfOption: any = null;
        let key = 'doctorinvoicetdsreport';
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
    public async PrintDoctorInvoiceReport(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        let data = await this.GetDoctorInvoices(apiReq);
        let DoctorInvoice = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let DoctorInvoiceData = data.Data[0];
        let TotalInvoiceAmount: number = 0;
        let TotalTDSAmount: number = 0;
        let TotalPaidAmount: number = 0;
        let TotalDueAmount: number = 0;
        for (let idx in DoctorInvoice) {
            let item = DoctorInvoice[idx];
            TotalInvoiceAmount += item.InvoiceAmount;
            TotalTDSAmount += item.TDSAmount;
            TotalPaidAmount += item.AmountPaid;
            TotalDueAmount += item.DueAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorInvoiceData.FacilityId);
        let info = {
            DoctorInvoice: DoctorInvoice,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            TotalInvoiceAmount: TotalInvoiceAmount,
            TotalTDSAmount: TotalTDSAmount,
            TotalPaidAmount: TotalPaidAmount,
            TotalDueAmount: TotalDueAmount

        };
        let pdfOption: any = null;
        let key = 'doctorinvoicereport';
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
    public async PrintOutstandingPaymentReport(apiReq?: ApiRequest<DoctorInvoiceFilters>): Promise<any> {
        let data = await this.GetDoctorInvoices(apiReq);
        let DoctorInvoice = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let DoctorInvoiceData = data.Data[0];
        let TotalInvoiceAmount: number = 0;
        let TotalTDSAmount: number = 0;
        let TotalPaidAmount: number = 0;
        let TotalDueAmount: number = 0;
        for (let idx in DoctorInvoice) {
            let item = DoctorInvoice[idx];
            TotalInvoiceAmount += item.InvoiceAmount;
            TotalTDSAmount += item.TDSAmount;
            TotalPaidAmount += item.AmountPaid;
            TotalDueAmount += item.DueAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorInvoiceData.FacilityId);
        let info = {
            DoctorInvoice: DoctorInvoice,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            TotalInvoiceAmount: TotalInvoiceAmount,
            TotalTDSAmount: TotalTDSAmount,
            TotalPaidAmount: TotalPaidAmount,
            TotalDueAmount: TotalDueAmount

        };
        let pdfOption: any = null;
        let key = 'outstandingpaymentreport';
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

    public GetModel(): SStatic.Model<DoctorInvoiceInstance, DoctorInvoiceAttributes> {
        return this.Models.DoctorInvoice;
    }
}
