import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CustomerBillsAttributes extends IAttributes {
    Id: number;
    BillNumber: string;
    BillDateTime: Date;
    BillTypeId: number;
    BillPriorityId: number;
    BillAmount: number;
    GrossAmount: number;
    DiscountTypeId: number;
    DiscountModeId: number;
    DiscountValue: number;
    DiscountAmount: number;
    DiscountApprovedBy: number;
    LineTotalDiscount: number;
    NetAmountBeforeGst: number;
    GstAmount: number;
    CGstAmount: number;
    SGstAmount: number;
    RoundOffValue: number;
    NetAmount: number;
    CustomerBillStatusId: number;
    BilledCounter: number;
    BillGeneratedBy: number;
    BillApprovedBy: number;
    OrganizationId: number;
    FacilityId: number;
    FacilityName: string;
    DepartmentId: number;
    DepartmentName: string;
    StoreMasterId: number;
    StoreName: string;
    CustomerMasterId: number;
    CustomerName: string;
    CustomerTypeId: number;
    GSTNumber: string;
    Mobile: string;
    CancelReasonId: number;
    CancelAmount: number;
    CancelledBy: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CustomerBillsInstance extends Instance<CustomerBillsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CustomerBillsAttributes;
}
