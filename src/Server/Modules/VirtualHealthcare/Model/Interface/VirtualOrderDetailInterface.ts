import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualOrderDetailAttributes extends IAttributes {
    Id: number;
    VirtualOrderId: number;
    PatientId: number;
    RequestDate: Date;
    ServiceId: number;
    ServiceCode: string;
    ServiceName: string;
    Quantity: number;
    ServiceCategoryId: number;
    ServiceCategoryName: string;
    GrossAmount: number;
    NetAmount: number;
    DiscountModeId: number;
    Discount: number;
    DoctorId: number;
    DoctorName: string;
    VirtualOrderDetailStatusId: number;
    VirtualBillDetailId: number;
    VirtualBillId: number;
    VirtualBillStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualOrderDetailInstance extends Instance<VirtualOrderDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualOrderDetailAttributes;
}
