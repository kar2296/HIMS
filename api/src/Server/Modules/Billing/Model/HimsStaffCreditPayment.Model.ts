import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StaffCreditPaymentInstance, i.StaffCreditPaymentAttributes> {
    let StaffCreditPayment = sequelize.define<i.StaffCreditPaymentInstance,
        i.StaffCreditPaymentAttributes>('StaffCreditPayment', {
            Id: { type: DataTypes.BIGINT, field: 'StaffCreditPaymentId', primaryKey: true, autoIncrement: true },
            StaffCreditPaymentIdentifier: { type: DataTypes.STRING, field: 'StaffCreditPaymentIdentifier' },
            StaffCreditPaymentDate: { type: DataTypes.DATE, field: 'StaffCreditPaymentDate' },
            StaffCreditPaymentStatusId: { type: DataTypes.BIGINT, field: 'StaffCreditPaymentStatusId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            StaffId: { type: DataTypes.BIGINT, field: 'StaffId' },
            StaffName: { type: DataTypes.STRING, field: 'StaffName' },
            Address: { type: DataTypes.STRING, field: 'Address' },
            ContactNo: { type: DataTypes.INTEGER, field: 'ContactNo' },
            StaffCreditPaymentTypeId: { type: DataTypes.DECIMAL, field: 'StaffCreditPaymentTypeId' },
            ReceiptAmount: { type: DataTypes.DECIMAL, field: 'ReceiptAmount' },
            TotalOutstandingAmount: { type: DataTypes.DECIMAL, field: 'TotalOutstandingAmount' },
            BankId: { type: DataTypes.INTEGER, field: 'BankId' },
            CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
            CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
            CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
            ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
            ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
            CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
            DDNumber: { type: DataTypes.STRING, field: 'DDNumber' },
            DDDate: { type: DataTypes.DATE, field: 'DDDate' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'staffcreditpayment',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (StaffCreditPayment as any).associate = function (models: Models) {
       StaffCreditPayment.belongsTo(models.ReferenceValue,
            { as: 'PaymentType', foreignKey: 'StaffCreditPaymentTypeId', targetKey: 'ReferenceValueCodeId' });
        StaffCreditPayment.belongsTo(models.ReferenceValue,
            { as: 'StaffCreditPaymentStatus', foreignKey: 'StaffCreditPaymentStatusId', targetKey: 'ReferenceValueCodeId' });
        StaffCreditPayment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        StaffCreditPayment.hasMany(models.StaffCreditPaymentDetails);
    };
    return StaffCreditPayment;
}
