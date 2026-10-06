import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserBillingCounterCancellationsInstance, i.UserBillingCounterCancellationsAttributes> {
    let UserBillingCounterCancellations = sequelize.define<i.UserBillingCounterCancellationsInstance,
        i.UserBillingCounterCancellationsAttributes>('UserBillingCounterCancellations', {
            Id: { type: DataTypes.BIGINT, field: 'UserBillingCounterCancellationId', primaryKey: true, autoIncrement: true },
            UserBillingCounterId: { type: DataTypes.BIGINT, field: 'UserBillingCounterId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
            ReceiptNumber: { type: DataTypes.STRING, field: 'ReceiptNumber' },
            CancelledAmount: { type: DataTypes.DECIMAL, field: 'CancelledAmount' },
            CancelledReason: { type: DataTypes.STRING, field: 'CancelledReason' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'userbillingcountercancellations',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (UserBillingCounterCancellations as any).associate = function (models: Models) {
        UserBillingCounterCancellations.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        UserBillingCounterCancellations.belongsTo(models.PatientPaymentDetails, { foreignKey: 'PatientReceiptId' });
    };
    return UserBillingCounterCancellations;
}
