import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualMedicineOrderInstance, VirtualMedicineOrderAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../VirtualHealthcare/Business/Index';
import { VirtualMedicineOrderFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { readFileSync } from 'fs';
import * as _ from 'lodash';
import { join } from 'path';

export class VirtualMedicineOrderBo extends BaseBo<VirtualMedicineOrderInstance, VirtualMedicineOrderAttributes> {
    public async AddVirtualMedicineOrder(req: BaseRequest): Promise<number> {
        let generateTransaction = 0;
        if (!req.Data.Header.MedicineOrderNo && Number(req.Data.Header.MedicineOrderStatusId) === 1) {
            req.Data.Header.MedicineOrderNo = null;
            generateTransaction = 1;
        }
        let file = this.Request.file;
        if (file) {
            req.Data.Header.PrescriptionAttachment = file.path;
        }
        let result = await this.Save(req.Data.Header);
        let vOrderid = result.dataValues.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vOrderid, 'MedicineOrderNo',
                this.getSequenceIdentifier(SequenceKeys.MedicineOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.VirtualMedicineOrderDetailBo, this.Request);
        await detailBO.ManageVirtualMedicineOrderDetail(vOrderid, req.Data.Details);
        return vOrderid;
    }

    public async UpdateVirtualMedicineOrder(req: BaseRequest): Promise<boolean> {
        let generateTransaction = 0;
        if (!req.Data.Header.MedicineOrderNo) {
            req.Data.MedicineOrderNo = null;
            generateTransaction = 1;
        }
        let file = this.Request.file;
        if (file) {
            req.Data.Header.PrescriptionAttachment = file.path;
        }
        let result = await this.Update(req.Data.Header);
        let vOrderid = req.Data.Header.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vOrderid, 'MedicineOrderNo',
                this.getSequenceIdentifier(SequenceKeys.MedicineOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.VirtualMedicineOrderDetailBo, this.Request);
        await detailBO.ManageVirtualMedicineOrderDetail(vOrderid, req.Data.Details);
        return result;
    }

    public async UpdateVirtualMedicineOrderDelivery(req: BaseRequest): Promise<boolean> {

        let file = this.Request.file;
        if (file) {
            req.Data.Header.InvoiceAttachment = file.path;
        }
        let result = await this.Update(req.Data.Header);
        return result;
    }

    // public async GetInvoiceAttachmentFile(req: BaseRequest): Promise<any> {
    //     if (req.Data && req.Data.InvoiceAttachment) {
    //         let fs = require('fs');
    //         if (fs.existsSync(req.Data.InvoiceAttachment)) {
    //             let fileBuff = await readFileSync(req.Data.InvoiceAttachment);
    //             let logoBase64 = new Buffer(fileBuff).toString('base64');
    //             return { Id: req.Data.Id, InvoiceAttachment: logoBase64 };
    //         }
    //     }
    //     return null;
    // }

    // public async GetInvoiceAttachmentFile(req: BaseRequest, res: any): Promise<any> {
    //     let result = await res.download(req.Data.Header.InvoiceAttachment);
    //     return result;
    // }

    public async GetAttachmentFile(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PrescriptionAttachment);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, PrescriptionAttachment: logoBase64 };
    }

    // public async GetAttachmentFile(req: BaseRequest, res: any): Promise<any> {
    //     let fs = require('fs');
    //     if (fs.existsSync(req.Data.PrescriptionAttachment)) {
    //         let fileBuff = await readFileSync(req.Data.PrescriptionAttachment);
    //         let logoBase64 = new Buffer(fileBuff).toString('base64');
    //         return { Id: req.Data.Id, PrescriptionAttachment: logoBase64 };
    //     }
    //     return result;
    // }

    public async GetVirtualMedicineOrderById(req: BaseRequest): Promise<VirtualMedicineOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('MedicineOrderStatus'));
        include.push({ model: this.Models.Facility, as: 'PharmacyFacility', required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetVirtualMedicineOrders(apiReq?: ApiRequest<VirtualMedicineOrderFilters>):
        Promise<ApiResponse<VirtualMedicineOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('MedicineOrderStatus'));
        include.push(this.GetReference('PaymentMode'));
        include.push({ model: this.Models.Facility, as: 'PharmacyFacility', required: false });
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age',
                'MRNTypeId', 'TitleId', 'GenderId', 'AddressLine1', 'Area', 'City', 'State', 'Country'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.VirtualMedicineOrderDetail, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualMedicineOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.VirtualMedicineOrderStatusId:
                        where['MedicineOrderStatusId'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.MedicineOrderNo:
                        where['MedicineOrderNo'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.MedicineOrderDate:
                        where['MedicineOrderDate'] = { '$between': param.Value };
                        break;
                    case VirtualMedicineOrderFilters.From:
                        where['MedicineOrderDate'] = where['MedicineOrderDate'] || {};
                        (where['MedicineOrderDate'] as any)['$gte'] = param.Value;
                        break;
                    case VirtualMedicineOrderFilters.To:
                        where['MedicineOrderDate'] = where['MedicineOrderDate'] || {};
                        (where['MedicineOrderDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetDrugSummary(req: BaseRequest): Promise<any> {
        let DrugGroup: { [id: number]: any[] } = {};
        let DrugGroupJoin: any = {
            model: this.Models.Facility, as: 'Facility',
            attributes: ['FacilityName'],
            required: true,
            where: { 'FacilityTypeId': 3 }
        };
        if (req.Data.FacilityId > 0) {
            let DrugInstance: any = await this.FindAll({
                attributes: ['MedicineOrderDate', 'FacilityId',
                    'OrderAmount', 'DeliveryAmount', 'TotalNetAmount'],
                where: {
                    MedicineOrderDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: { '$eq': req.Data.FacilityId },
                    MedicineOrderStatusId: { '$ne': 4 }
                },
                include: [DrugGroupJoin]
            });
            if (DrugInstance) {
                let groupbills = _.groupBy(DrugInstance, 'FacilityId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DrugCount: number = 0;
                    let FacilityId: number = 0;
                    let FacilityName: string = '';
                    let OrderAmount: number = 0;
                    DrugCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        FacilityId = bills.FacilityId;
                        FacilityName = bills.Facility.FacilityName;
                        OrderAmount = bills.OrderAmount;
                        // GuarantorType = bills.GuarantorType.Description;
                        DrugGroup[FacilityId] = DrugGroup[FacilityId] || [];
                    }
                    let info = {
                        'FacilityId': FacilityId,
                        'FacilityName': FacilityName,
                        'DrugCount': DrugCount,
                        'OrderAmount': OrderAmount,
                    };
                    DrugGroup[FacilityId].push(info);
                }
            }
        } else if (req.Data.FacilityId === 0) {
            let DrugInstance: any = await this.FindAll({
                attributes: ['MedicineOrderDate', 'FacilityId',
                    'OrderAmount', 'DeliveryAmount', 'TotalNetAmount'],
                where: {
                    MedicineOrderDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    FacilityId: { '$gt': req.Data.FacilityId },
                    MedicineOrderStatusId: { '$ne': 4 }

                },
                include: [DrugGroupJoin]
            });
            if (DrugInstance) {
                let groupbills = _.groupBy(DrugInstance, 'FacilityId');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let DrugCount: number = 0;
                    let FacilityId: number = 0;
                    let FacilityName: string = '';
                    let OrderAmount: number = 0;
                    DrugCount = groupedBills.length;
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        FacilityId = bills.FacilityId;
                        FacilityName = bills.Facility.FacilityName;
                        OrderAmount = bills.OrderAmount;
                        // GuarantorType = bills.GuarantorType.Description;
                        DrugGroup[FacilityId] = DrugGroup[FacilityId] || [];
                    }
                    let info = {
                        'FacilityId': FacilityId,
                        'FacilityName': FacilityName,
                        'DrugCount': DrugCount,
                        'OrderAmount': OrderAmount,
                    };
                    DrugGroup[FacilityId].push(info);
                }
            }
        }
        return DrugGroup;
    }
    public async GetDrugDashboardOptions(req: BaseRequest): Promise<any> {
        let TodayOrderCount: number = 0;
        let TodayPendingOrderCount: number = 0;
        let TodayHomeVisitOrderCount: number = 0;
        let TodayCompleteOrderCount: number = 0;

        TodayOrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'MedicineOrderDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'SubCategoryId': 1,
                'FacilityId': req.Data.FacilityId,
            }
        });
        TodayHomeVisitOrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'MedicineOrderDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'SubCategoryId': 2,
                'FacilityId': req.Data.FacilityId,
            }
        });
        TodayPendingOrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'MedicineOrderStatusId': 1,
                'MedicineOrderDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        TodayCompleteOrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'MedicineOrderStatusId': { '$in': [2, 3] },
                'MedicineOrderDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });

        return {
            'TodayOrderCount': TodayOrderCount,
            'TodayPendingOrderCount': TodayPendingOrderCount,
            'TodayHomeVisitOrderCount': TodayHomeVisitOrderCount,
            'TodayCompleteOrderCount': TodayCompleteOrderCount,
        };

    }

    public async DeleteVirtualMedicineOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualMedicineOrderInstance, VirtualMedicineOrderAttributes> {
        return this.Models.VirtualMedicineOrder;
    }
    public async PrintDrugSummaryReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        // let FacilityId = req.Data.FacilityId;
        let DrugSummary: any = [];
        let NetDrugSummary: any = [];
        let drugsummary = req;
        DrugSummary = await this.GetDrugSummary(drugsummary);
        // let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        if (DrugSummary) {
            for (var idx in DrugSummary) {
                var vaccSummary = DrugSummary[idx];
                var Key = '';
                var DrugName = '';
                var DrugCount = 0;
                var DrugAmt = 0;
                // var DueCollectAmt = 0;
                for (var ix in vaccSummary) {
                    if (vaccSummary[ix].FacilityName) {
                        DrugName = vaccSummary[ix].FacilityName;
                    }
                    if (vaccSummary[ix].DrugCount) {
                        DrugCount = vaccSummary[ix].DrugCount;
                    }
                    if (vaccSummary[ix].OrderTotal) {
                        DrugAmt = vaccSummary[ix].OrderAmount;
                    }
                    Key = DrugName;
                    DrugCount = DrugCount;
                    DrugAmt = DrugAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                NetDrugSummary.push({
                    'Key': Key,
                    'DrugCount': DrugCount,
                    'DrugAmt': DrugAmt,
                });

            }

        }
        let TotDrugCount = 0;
        let TotDrugAmt = 0;
        var totDrugCount = 0;
        var totDrugAmt = 0;
        for (let ivx in NetDrugSummary) {
            let netsummary = NetDrugSummary[ivx];
            if (netsummary.DrugCount) {
                totDrugCount += netsummary.DrugCount;
            }
            if (netsummary.DrugAmt) {
                totDrugAmt += netsummary.DrugAmt;
            }
        }
        TotDrugCount = totDrugCount;
        TotDrugAmt = totDrugAmt;
        let info = {
            NetDrugSummary: NetDrugSummary,
            // Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            TotDrugCount: TotDrugCount,
            TotDrugAmt: TotDrugAmt,
        };
        let pdfOption: any = null;
        let key = 'drugsummaryreport';
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
}
