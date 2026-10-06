import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BillingSettingAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OPBillCancelDays: number;
    IPBillCancelDays: number;
    ReceiptCancelDays: number;
    RefundCancelDays: number;
    CreditNoteCancelDays: number;
    DebitNoteCancelDays: number;
    PharmacyReturnDays: number;
    MaximumCashRefund: number;
    BillRefundDuration: number;
    BillingRoundOff: number;
    InventoryRoundOff: number;
    PharmacyRoundOff: number;
    NightShiftStartTime: string;
    NightShiftEndTime: string;
    OPAdditionalPercent: number;
    IPAdditionalPercent: number;
    ServiceTaxPercent: number;
    GSTPercent: number;
    EducationPercent: number;
    DoOPReceipt: boolean;
    DoIPReceipt: boolean;
    DoCancelBillCreditNote: boolean;
    AllowCreditNoteRefund: boolean;
    IsDiscountAuthorizationNeeded: boolean;
    IsPrivateCreditCONeeded: boolean;
    IsServiceTaxApplicable: boolean;
    IsOPBillFlowRequired: boolean;
    IsIPBillFlowRequired: boolean;
    IsOrderCoveredWarningRequired: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BillingSettingInstance extends Instance<BillingSettingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BillingSettingAttributes;
}
