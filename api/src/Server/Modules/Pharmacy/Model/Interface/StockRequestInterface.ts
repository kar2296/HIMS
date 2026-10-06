import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockRequestAttributes extends IAttributes {
    Id: number;
    StockTransferId: number;
    RequestNumber: string;
    TransferNumber: string;
    StockRequestTypeId: number;
    RequestSubTypeId: number;
    StockPriorityId: number;
    ItemCategoryId: number;
    RequestStatusId: number;
    StoreMasterId: number;
    StoreName: string;
    ToStoreMasterId: number;
    ToStoreName: string;
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
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    CancelledBy: number;
    CancelledDate: Date;
    CancelledComments: string;
    TransferedBy: string;
    TransferedDate: Date;
    TransfererComments: string;
    Comments: string;
	 RemarkId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockRequestInstance extends Instance<StockRequestAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StockRequestAttributes;
}
