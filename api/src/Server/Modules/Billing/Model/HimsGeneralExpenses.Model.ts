import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GeneralExpensesInstance, i.GeneralExpensesAttributes> {
    let GeneralExpenses = sequelize.define<i.GeneralExpensesInstance, i.GeneralExpensesAttributes>('GeneralExpenses', {
        Id: { type: DataTypes.BIGINT, field: 'GeneralExpenseId', primaryKey: true, autoIncrement: true },
        Name: { type: DataTypes.STRING, field: 'Name' },
        ExpenseTypeId: { type: DataTypes.BIGINT, field: 'ExpenseTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        VoucherNo: { type: DataTypes.STRING, field: 'VoucherNo' },
        ExpenseDate: { type: DataTypes.DATE, field: 'ExpenseDate' },
        VehicleName: { type: DataTypes.STRING, field: 'VehicleName' },
        DriverName: { type: DataTypes.STRING, field: 'DriverName' },
        VehicleNo: { type: DataTypes.STRING, field: 'VehicleNo' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        ExpenseAmount: { type: DataTypes.DECIMAL, field: 'ExpenseAmount' },
        PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
        TerminalNoId: { type: DataTypes.BIGINT, field: 'TerminalNoId' },
        BankId: { type: DataTypes.BIGINT, field: 'BankId' },
        CardTypeId: { type: DataTypes.BIGINT, field: 'CardTypeId' },
        CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
        CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
        CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
        AuthorizeNumber: { type: DataTypes.BIGINT, field: 'AuthorizeNumber' },
        AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
        ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
        ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
        CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
        DDNumber: { type: DataTypes.STRING, field: 'DDNumber' },
        DDDate: { type: DataTypes.DATE, field: 'DDDate' },
        WireTransferId: { type: DataTypes.BIGINT, field: 'WireTransferId' },
        WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        ExpenseStatusId: { type: DataTypes.BIGINT, field: 'ExpenseStatusId' },
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
            tableName: 'generalexpenses',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (GeneralExpenses as any).associate = function (models: Models) {
        GeneralExpenses.belongsTo(models.ReferenceValue,
            { as: 'GeneralExpenseType', targetKey: 'ReferenceValueCodeId', foreignKey: 'ExpenseTypeId' });
        GeneralExpenses.belongsTo(models.ReferenceValue,
            { as: 'GeneralExpenseStatus', targetKey: 'ReferenceValueCodeId', foreignKey: 'ExpenseStatusId' });
        GeneralExpenses.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'UserId' });
        GeneralExpenses.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        GeneralExpenses.belongsTo(models.ReferenceValue,
            { as: 'PaymentType', targetKey: 'ReferenceValueCodeId', foreignKey: 'PaymentTypeId' });
    };
    return GeneralExpenses;
}
