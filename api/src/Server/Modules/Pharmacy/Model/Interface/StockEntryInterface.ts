import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockEntryAttributes extends IAttributes {
    Id: number;
    StockEntryNumber: string;
    StockEntryDate: Date;
    StockEntryTypeId: number;
    StockEntryStatusId: number;
    VendorMasterId: number;
    VendorName: string;
    StoreMasterId: number;
    StoreName: string;
    TotalGrossAmount: number;
    TotalGstAmount: number;
    TotalInGstAmount: number;
    TotalCGstAmount: number;
    TotalSGstAmount: number;
    TotalNetAmount: number;
    EnteredBy: number;
    EnteredDate: Date;
    EntryComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    CancelledBy: number;
    CancelledDate: Date;
    CancelledComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    FacilityId: number;
    OrganisationId: number;
    CancelReasonId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockEntryInstance extends Instance<StockEntryAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StockEntryAttributes;
}
