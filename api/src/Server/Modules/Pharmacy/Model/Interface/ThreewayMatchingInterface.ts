import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ThreewayMatchingAttributes extends IAttributes {
    Id: number;
    InvoiceNumber: string;
    InvoiceDate: Date;
    DcNumber: string;
    DcDate: Date;
    InvoiceTypeId: number;
    ThreewayStatusId: number;
    VendorId: number;
    CancelReasonId: number;
    VendorName: string;
    StoreId: number;
    StoreName: string;
    CheckedBy: number;
    CheckedDate: Date;
    ApprovedBy: number;
    ApprovedDate: Date;
    PONetAmount: number;
    GRNNetAmount: number;
    DifferentAmount: number;
    InvoiceAmount: number;
    TotalGstAmount: number;
    RoundOff: number;
    TotalNetAmount: number;
    FacilityId: number;
    OrganisationId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ThreewayMatchingInstance extends Instance<ThreewayMatchingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ThreewayMatchingAttributes;
}
