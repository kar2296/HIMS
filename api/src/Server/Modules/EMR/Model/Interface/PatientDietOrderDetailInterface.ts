import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDietOrderDetailAttributes extends IAttributes {
    Id: number;
    PatientDietOrderId: number;
    PatientId: number;
    RequestDate: Date;
    DietItemId: number;
    DietItemCode: string;
    DietName: string;
    Description: string;
    DietCategoryId: number;
    DietFrequencyId: number;
    DietItemTypeId: number;
    IsAttender: boolean;
    IsDirectBill: boolean;
    DoctorId: number;
    DoctorName: string;
    OrderStatusId: number;
    OrderPriorityId: number;
    PatientBillDetailId: number;
    PatientBillId: number;
    PatientBillStatusId: number;
    Price: string;
    Discount: number;
    NetAmount: number;
    Quantity: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDietOrderDetailInstance extends Instance<PatientDietOrderDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDietOrderDetailAttributes;
}
