import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OpticalGrnAttributes extends IAttributes {
    OpticalGrnId: number;
    FacilityId: number;
    OpticalGrnNumber: string;
    OpticalGrnDate: Date;
    OpticalGrnTypeId: number;
    OpticalGrnStatusId: number;
    OpticalPurchaseOrderId: number;
    OpticalPONumber: string;
    OpticalPODate: Date;
    OpticalPurchaseReturnId: number;
    OpticalPRNumber: string;
    OpticalPRDate: Date;
    VendorFacilityMapId: number;
    VendorMasterId: number;
    VendorName: string;
    StoreMasterId: number;
    StoreName: string;
    InvoiceNumber: string;
    InvoiceDate: Date;
    DcNumber: string;
    DcDate: Date;
    TotalGrossAmount: number;
    GrnDiscount: number;
    TotalDiscountAmount: number;
    TotalGstAmount: number;
    // TotalIGstAmount: number;
    TotalInGstAmount: number;
    TotalCGstAmount: number;
    TotalSGstAmount: number;
    ShippingCharges: number;
    OtherCharges: number;
    RoundOff: number;
    TotalNetAmount: number;
    TotalInvoiceAmount: number;
    Comments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    IsOpenGRN: boolean;
    IsCredit: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalGrnInstance extends Instance<OpticalGrnAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalGrnAttributes;
}
