import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceItemPackageMapAttributes extends IAttributes {
    Id: number;
    ServiceItemId: number;
    ServiceId: number;
    ServiceName: string;
    Quantity: number;
    Amount: number;
    Discount: number;
    NetAmount: number;
    ServiceItemDiscountTypeId: number;
    DisplayOrder: number;
    IsDoctorShare: boolean;
    DoctorShare: number;
    SharePercentage: number;
    Formula: string;
    DoctorId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceItemPackageMapInstance extends Instance<ServiceItemPackageMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceItemPackageMapAttributes;
}
