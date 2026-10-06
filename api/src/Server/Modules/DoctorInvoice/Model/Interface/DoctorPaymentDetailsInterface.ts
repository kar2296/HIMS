import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorPaymentDetailsAttributes extends IAttributes {
    Id: number;
    DoctorPaymentId: number;
    DoctorInvoiceId: number;
    PaymentDateTime: Date;
    InvoiceAmount: number;
    PaymentAmount: number;
    PaymentStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface DoctorPaymentDetailsInstance extends Instance<DoctorPaymentDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorPaymentDetailsAttributes;
}
