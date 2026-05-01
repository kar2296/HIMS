import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        ModifiedPatientBills: SequelizeStatic.Model<i.ModifiedPatientBillsInstance, i.ModifiedPatientBillsAttributes>;
        ModifiedPatientBillCategorys: SequelizeStatic.Model<i.ModifiedPatientBillCategorysInstance,
        i.ModifiedPatientBillCategorysAttributes>;
        ModifiedPatientBillCategoryDetails: SequelizeStatic.Model<i.ModifiedPatientBillCategoryDetailsInstance,
        i.ModifiedPatientBillCategoryDetailsAttributes>;
        ModifiedPatientPaymentDetails: SequelizeStatic.Model<i.ModifiedPatientPaymentDetailsInstance,
        i.ModifiedPatientPaymentDetailsAttributes>;
    }
}
