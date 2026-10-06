import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BankStatementCancellationsInstance, i.BankStatementCancellationsAttributes> {
    let BankStatementCancellations = sequelize.define<i.BankStatementCancellationsInstance,
        i.BankStatementCancellationsAttributes>('BankStatementCancellations', {
            Id: { type: DataTypes.BIGINT, field: 'BankStatementCancellationId', primaryKey: true, autoIncrement: true },
            BankStatementId: { type: DataTypes.BIGINT, field: 'BankStatementId' },
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
                tableName: 'bankstatementcancellations',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (BankStatementCancellations as any).associate = function (models: Models) {
        BankStatementCancellations.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        BankStatementCancellations.belongsTo(models.PatientPaymentDetails, { foreignKey: 'PatientReceiptId' });
    };
    return BankStatementCancellations;
}
