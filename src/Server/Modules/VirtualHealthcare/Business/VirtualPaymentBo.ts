import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualPaymentInstance, VirtualPaymentAttributes } from '../Model/Interface/Index';
import { VirtualPaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class VirtualPaymentBo extends BaseBo<VirtualPaymentInstance, VirtualPaymentAttributes> {
    public async AddVirtualPayment(req: BaseRequest): Promise<number> {
        let generateTransaction = 0;
        let payData: any = {
            Id: 0,
            PaymentDateTime: new Date(),
            PaymentNumber: '',
            FacilityId: this.Session.FacilityId,
            OrganizationId: this.Session.OrganizationId,
            PatientId: req.Data.Header.PatientId,
            PatientName: req.Data.Header.PatientName,
            BillAmount: req.Data.Header.NetAmount,
            AmountPaid: 0.00,
            DueAmount: req.Data.Header.NetAmount,
            DepartmentId: req.Data.Header.DepartmentId,
            PaymentModeId: req.Data.Header.PaymentModeId,
            PaymentDoneById: this.Session.UserId,
            DoctorId: req.Data.Header.DoctorId,
            VirtualCategoryId: req.Data.Header.VirtualCategoryId,
            VirtualSubCategoryId: req.Data.Header.VirtualSubCategoryId,
            CategoryTypeId: req.Data.Header.CategoryTypeId,
            VirtualOrderId: req.Data.Header.VirtualOrderId,
            VirtualBillId: req.Data.Header.Id,
            VirtualBillTypeId: req.Data.Header.VirtualBillTypeId,
            PaymentStatusId:1,
        };
        if (!payData.PaymentNumber && payData.PaymentStatusId === 2) {
            payData.PaymentNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Save(payData);
        let vBillId = result.dataValues.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vBillId, 'PaymentNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualPaymentId));
        }
        return vBillId;
    }

    public async UpdateVirtualPayment(req: BaseRequest): Promise<boolean> {
        let generateTransaction = 0;
        if (!req.Data.PaymentNumber && req.Data.VirtualPaymentStatusId === 2) {
            req.Data.PaymentNumber = null;
            generateTransaction = 1;
        }
        let result = await this.Update(req.Data);
        let vBillId = req.Data.Id;
        if (generateTransaction === 1) {
            this.deferSequenceKey(vBillId, 'PaymentNumber',
                this.getSequenceIdentifier(SequenceKeys.VirtualPaymentId));
        }
        return result;
    }

    public async GetVirtualPaymentById(req: BaseRequest): Promise<VirtualPaymentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);

    }

    public async GetVirtualPayments(apiReq?: ApiRequest<VirtualPaymentFilters>):
        Promise<ApiResponse<VirtualPaymentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.VirtualCategory, required: false });
        include.push({ model: this.Models.VirtualSubCategory, required: false });
        include.push(this.GetReference('ConsultancyType'));
        include.push(this.GetReference('PaymentStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualPaymentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualPaymentFilters.PaymentStatusId:
                        where['PaymentStatusId'] = param.Value;
                        break;
                    case VirtualPaymentFilters.VirtualOrderId:
                        where['VirtualOrderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualPayment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualPaymentInstance, VirtualPaymentAttributes> {
        return this.Models.VirtualPayment;
    }
}
