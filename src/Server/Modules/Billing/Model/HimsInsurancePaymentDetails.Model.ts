import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InsurancePaymentDetailsInstance, i.InsurancePaymentDetailsAttributes> {
    let InsurancePaymentDetails = sequelize.define<i.InsurancePaymentDetailsInstance,
        i.InsurancePaymentDetailsAttributes>('InsurancePaymentDetails', {
            Id: { type: DataTypes.BIGINT, field: 'InsurancePaymentDetailId', primaryKey: true, autoIncrement: true },
            InsurancePaymentId: { type: DataTypes.BIGINT, field: 'InsurancePaymentId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            BillIdentifier: { type: DataTypes.STRING, field: 'BillIdentifier' },
            VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
            ToBeClaimAmount: { type: DataTypes.DECIMAL, field: 'ToBeClaimAmount' },
            ReceivedAmount: { type: DataTypes.DECIMAL, field: 'ReceivedAmount' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            Disallowed: { type: DataTypes.DECIMAL, field: 'Disallowed' },
            AgreementDiscountAmt: { type: DataTypes.DECIMAL, field: 'AgreementDiscountAmt' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Remarks: { type: DataTypes.STRING, field: 'Remarks' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'hims_insurancepaymentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (InsurancePaymentDetails as any).associate = function (models: Models) {
        InsurancePaymentDetails.belongsTo(models.InsurancePayment);
        InsurancePaymentDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        InsurancePaymentDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        InsurancePaymentDetails.belongsTo(models.Patient, { foreignKey: 'PatientId' });
    };
    return InsurancePaymentDetails;
}
