import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockTransferAttributes extends IAttributes {
    Id: number;
    StockRequestId: number;
    TransferNumber: string;
    RequestNumber: string;
    AcceptanceNumber: string;
    TransferDate: Date;
    TransferTypeId: number;
    TransferSubTypeId: number;
    TransferStatusId: number;
    AcceptanceStatusId: number;
    VendorMasterId: number;
    StoreMasterId: number;
    StoreName: string;
    ToStoreMasterId: number;
    ToStoreName: string;
    ItemCategoryId: number;
    FacilityId: number;
    ToFacilityId: number;
    OrganisationId: number;
    TotalGrossAmount: number;
    TotalDiscountAmount: number;
    TotalGstAmount: number;
    TotalInGstAmount: number;
    TotalCGstAmount: number;
    TotalSGstAmount: number;
    OtherCharges: number;
    RoundOff: number;
    TotalNetAmount: number;
    CancelReasonId: number;
    RequestedBy: number;
    RequestedDate: Date;
    RequesterComments: string;
    TransferedBy: number;
    TransferedDate: Date;
    TransfererComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    CancelledBy: number;
    CancelledDate: Date;
    CancelledComments: string;
    AcceptedBy: number;
    AcceptedDate: Date;
    AccepterComments: string;
    GrnId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockTransferInstance extends Instance<StockTransferAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StockTransferAttributes;
}
