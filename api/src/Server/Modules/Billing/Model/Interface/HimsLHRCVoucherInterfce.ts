import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LHRCVoucherAttributes extends IAttributes {
    Id: number;
    LHRCVoucherNo: string;
    VoucherDate: Date;
    VoucherTypeId: number;
    FacilityId: number;
    PaymentTypeId: number;
    TerminalNoId: number;
    BankId: number;
    CardTypeId: number;
    CardNumber: string;
    CardExpiryDate: Date;
    CardHolderName: string;
    AuthorizeNumber: number;
    AuthorizedCode: string;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: string;
    DDDate: Date;
    WireTransferId: number;
    WireTransferDate: Date;
    PatientId: number;
    AmbulanceName: string;
    DriverName: string;
    VehicleName: string;
    PayTo: string;
    VoucherAmount: number;
    Mobile: string;
    Remarks: string;
    VoucherStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface LHRCVoucherInstance extends Instance<LHRCVoucherAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LHRCVoucherAttributes;
}
