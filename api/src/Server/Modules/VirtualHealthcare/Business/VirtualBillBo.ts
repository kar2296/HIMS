import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualBillInstance, VirtualBillAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../VirtualHealthcare/Business/Index';
import { VirtualBillFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class VirtualBillBo extends BaseBo<VirtualBillInstance, VirtualBillAttributes> {
    public async AddVirtualBill(req: BaseRequest): Promise<number> {
        let generateTransaction = 0;
        let BillData: any = {
            Id: 0,
            OrganizationId: this.Session.OrganizationId,
            FacilityId: this.Session.FacilityId,
            DepartmentId: req.Data.Header.OrderToId,
            VirtualCategoryId: req.Data.Header.VirtualCategoryId,
            VirtualSubCategoryId: req.Data.Header.VirtualSubCategoryId,
            CategoryTypeId: req.Data.Header.CategoryTypeId,
            BillNumber: '',
            BillDateTime: new Date(),
            VirtualBillTypeId: 7,
            PatientId: req.Data.Header.PatientId,
            PatientMrn: req.Data.Header.PatientMRN,
            PatientName: req.Data.Header.PatientName,
            Mobile: req.Data.Header.PatientMobile,
            EncounterId: req.Data.Header.EncounterId,
            EncounterTypeId: req.Data.Header.EncounterTypeId,
            BillAmount: req.Data.Header.GrossAmount,
            NetAmount: req.Data.Header.TotalNetAmount,
            BillDiscount: req.Data.Header.DiscountAmount,
            BillDiscountModeId: req.Data.Header.DiscountAmount,
            IsPaidFully: false,
            OutStandingAmount: req.Data.Header.TotalNetAmount,
            BillGeneratedBy: this.Session.UserId,
            DoctorId: req.Data.Header.DoctorId,
            DoctorName: req.Data.Header.DoctorName,
            VirtualBillStatusId: 1,
            VirtualOrderId: req.Data.Header.Id,
            PaymentModeId: req.Data.Header.PaymentModeId
        };
        if (!BillData.BillNumber && BillData.VirtualBillStatusId === 2) {
            BillData.BillNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Save(BillData);
        let vBillId = result.dataValues.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vBillId, 'BillNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualBillId));
        }
        let detailBO = BoFactory.GetBo(bo.VirtualBillDetailBo, this.Request);
        let BillDetail: any = [];
        for (let idx in req.Data.Details) {
            let orderdetail = req.Data.Details[idx];
            let billdetailData: any = {
                Id: 0,
                VirtualBillId: vBillId,
                BillDateTime: new Date(),
                ServiceId: orderdetail.ServiceId,
                ServiceCode: orderdetail.ServiceCode,
                ServiceName: orderdetail.ServiceName,
                EncounterId: orderdetail.EncounterId,
                Quantity: orderdetail.Quantity,
                Rate: orderdetail.GrossAmount,
                GrossAmount: orderdetail.GrossAmount,
                DiscountAmount: orderdetail.Discount,
                NetAmount: orderdetail.NetAmount,
                DoctorId: orderdetail.DoctorId,
                DoctorName: orderdetail.DoctorName,
                VirtualOrderId: orderdetail.VirtualOrderId,
                VirtualOrderDetailId: orderdetail.Id,
                VirtualOrderStatusId: orderdetail.VirtualOrderDetailStatusId,
                VirtualOrderDateTime: orderdetail.RequestDate,
                DiscountModeId: orderdetail.DiscountModeId,
                IsInvoicedDoctorShare: false,
                VirtualBillStatusId: 1,
            };
            BillDetail.push(billdetailData);
        }
        await detailBO.ManageVirtualBillDetail(vBillId, BillDetail);
        return vBillId;
    }

    public async UpdateVirtualBill(req: BaseRequest): Promise<boolean> {
        let generateTransaction = 0;
        if (!req.Data.Header.BillNumber && req.Data.Header.VirtualBillStatusId === 2) {
            req.Data.BillNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Update(req.Data.Header);
        let vBillId = req.Data.Header.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vBillId, 'BillNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualBillId));
        }
        let detailBO = BoFactory.GetBo(bo.VirtualBillDetailBo, this.Request);
        await detailBO.ManageVirtualBillDetail(vBillId, req.Data.Details);
        let orderBO = BoFactory.GetBo(bo.VirtualOrderBo, this.Request);
        await orderBO.UpdateVirtualOrderFromBill(req);
        let paymentBO = BoFactory.GetBo(bo.VirtualPaymentBo, this.Request);
        await paymentBO.AddVirtualPayment(req);
        return result;
    }

    public async UpdateVirtualBillOrder(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: VirtualBillFilters.VirtualOrderId, Value: req.Data.Header.Id }]
        };
        let data = await this.GetVirtualBills(apiReq);
        let OrderData = data.Data[0];
        let OrderbillData: any = {
            Data: {
                Id: OrderData.Id,
                DoctorId: req.Data.Header.DoctorId,
                DoctorName: req.Data.Header.DoctorName,
                DepartmentId: req.Data.Header.OrderToId,
            }
        };
        let result = await this.Update(OrderbillData.Data);
        return result;
    }

    public async GetVirtualBillById(req: BaseRequest): Promise<VirtualBillAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);

    }

    public async GetVirtualBills(apiReq?: ApiRequest<VirtualBillFilters>):
        Promise<ApiResponse<VirtualBillAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.VirtualCategory, required: false });
        include.push({ model: this.Models.VirtualSubCategory, required: false });
        include.push(this.GetReference('ConsultancyType'));
        include.push(this.GetReference('VirtualBillStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualBillFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualBillFilters.VirtualBillStatusId:
                        where['VirtualBillStatusId'] = param.Value;
                        break;
                    case VirtualBillFilters.VirtualOrderId:
                        where['VirtualOrderId'] = param.Value;
                        break;
                    case VirtualBillFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case VirtualBillFilters.BillDateTime:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case VirtualBillFilters.From:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case VirtualBillFilters.To:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case VirtualBillFilters.IsPaidFully:
                        where['IsPaidFully'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualBill(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualBillInstance, VirtualBillAttributes> {
        return this.Models.VirtualBill;
    }
}
