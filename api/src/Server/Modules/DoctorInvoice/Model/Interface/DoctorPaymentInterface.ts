import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorPaymentAttributes extends IAttributes {
    Id: number;
    DoctorPaymentIdentifier: number;
    DoctorId: number;
    PaymentDateTime: Date;
    DcotorInvoiceAmount: number;
    RoomRent: number;
    EquipmentUsage: number;
    BasicSalary: number;
    Incentive: number;
    DcotorPaymentAmount: number;
    FacilityId: number;
    ApprovedBy: number;
    PaymentTypeId: number;
    DoctorPaymentAmount: number;
    BankId: number;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: number;
    DDDate: Date;
    WireTransferId: string;
    WireTransferDate: Date;
    PaymentStatusId: number;
    TDSId: number;
    TDSAmount: number;
    TDSPercentage: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface DoctorPaymentInstance extends Instance<DoctorPaymentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorPaymentAttributes;
}
