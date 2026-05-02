import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        DoctorInvoice: SequelizeStatic.Model<i.DoctorInvoiceInstance, i.DoctorInvoiceAttributes>;
        DoctorInvoiceDetails: SequelizeStatic.Model<i.DoctorInvoiceDetailsInstance, i.DoctorInvoiceDetailsAttributes>;
        DoctorPayment: SequelizeStatic.Model<i.DoctorPaymentInstance, i.DoctorPaymentAttributes>;
        DoctorPaymentDetails: SequelizeStatic.Model<i.DoctorPaymentDetailsInstance, i.DoctorPaymentDetailsAttributes>;
        }
}
