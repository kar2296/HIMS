import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualBillDetailAttributes extends IAttributes {
    Id: number;
    VirtualBillId: number;
    BillDateTime: Date;
    ServiceId: number;
    ServiceCode: string;
    ServiceName: string;
    ServiceTypeId: number;
    ServiceGroupId: number;
    ServiceCategoryId: number;
    EncounterId: number;
    VirtualBillStatusId: number;
    Quantity: number;
    ReturnedQuantity: number;
    Rate: number;
    GrossAmount: number;
    DiscountPercentage: number;
    UnitDiscountAmount: number;
    DiscountAmount: number;
    UnitProportionateDiscount: number;
    ProportionateDiscount: number;
    DoctorDiscountAmount: number;
    NetAmount: number;
    ReceivedAmount: number;
    ReturnedAmount: number;
    DoctorId: number;
    DoctorName: string;
    VirtualOrderId: number;
    VirtualOrderDetailId: number;
    VirtualOrderStatusId: number;
    VirtualOrderDateTime: Date;
    DiscountModeId: number;
    DiscountAuthorizedBy: number;
    DoctorShare: number;
    DoctorShareActual: number;
    DoctorShareDisc: number;
    CancelReason: string;
    CancelledBy: number;
    IsInvoicedDoctorShare: number;
    DepartmentId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualBillDetailInstance extends Instance<VirtualBillDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualBillDetailAttributes;
}
