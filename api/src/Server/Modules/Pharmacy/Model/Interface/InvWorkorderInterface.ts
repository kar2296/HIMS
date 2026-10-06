import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface InvWorkorderAttributes extends IAttributes {
    Id: number;
    InvWorkorderNo: string;
    InvWorkorderDate: Date;
    InvWorkorderTypeId: number;
    InvWorkorderStatusId: number;
    StoreMasterId: number;
    StoreName: string;
    ParticularId: number;
    DepartmentId: number;
    DepartmentName: string;
    VendorMasterId: number;
    VendorName: string;
    RaisedBy: number;
    RaisedDate: Date;
    RaisedComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    FacilityId: number;
    OrganisationId: number;
    TotalAmount: number;
    TransportCharges: number;
    TransportChargesGstId: number;
    TransportChargesGstPercentage: number;
    TransportChargesGstAmount: number;
    TotalGrossAmount: number;
    TotalDiscountAmount: number;
    TotalGstAmount: number;
    TotalInGstAmount: number;
    TotalCGstAmount: number;
    TotalSGstAmount: number;
    OtherCharges: number;
    RoundOff: number;
    TotalNetAmount: number;
    LeviesandTaxes: string;
    DeliverySchedule: string;
    TermsofDispatch: string;
    TermsofPayment: string;
    PaymentTermsId: number;
    OtherChargesGstId: number;
    OtherChargesGstPercentage: number;
    OtherChargesGstAmount: number;
    Remarks: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface InvWorkorderInstance extends Instance<InvWorkorderAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: InvWorkorderAttributes;
}
