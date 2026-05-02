import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InsurancePaymentInstance, i.InsurancePaymentAttributes> {
    let InsurancePayment = sequelize.define<i.InsurancePaymentInstance, i.InsurancePaymentAttributes>('InsurancePayment', {
        Id: { type: DataTypes.BIGINT, field: 'InsurancePaymentId', primaryKey: true, autoIncrement: true },
        PaymentIdentifier: { type: DataTypes.STRING, field: 'PaymentIdentifier' },
        PaymentDate: { type: DataTypes.DATE, field: 'PaymentDate' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.INTEGER, field: 'GuarantorTypeId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        ToBeClaimAmount: { type: DataTypes.DECIMAL, field: 'ToBeClaimAmount' },
        ReceivedAmount: { type: DataTypes.DECIMAL, field: 'ReceivedAmount' },
        TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
        Disallowed: { type: DataTypes.DECIMAL, field: 'Disallowed' },
        InsurancePaymentStatusId: { type: DataTypes.INTEGER, field: 'InsurancePaymentStatusId' },
        PaymentTypeId: { type: DataTypes.INTEGER, field: 'PaymentTypeId' },
        BankId: { type: DataTypes.INTEGER, field: 'BankId' },
        CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
        CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
        CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
        CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
        TerminalNoId: { type: DataTypes.STRING, field: 'TerminalNoId' },
        ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
        ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
        CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
        DDNumber: { type: DataTypes.INTEGER, field: 'DDNumber' },
        DDDate: { type: DataTypes.DATE, field: 'DDDate' },
        WireTransferId: { type: DataTypes.STRING, field: 'WireTransferId' },
        WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        ReferenceNumber: { type: DataTypes.STRING, field: 'ReferenceNumber' },
        AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_insurancepayment',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (InsurancePayment as any).associate = function (models: Models) {
        InsurancePayment.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        InsurancePayment.hasMany(models.Guarantor, { foreignKey: 'GuarantorId' });
        InsurancePayment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        InsurancePayment.belongsTo(models.ReferenceValue, { as: 'InsurancePaymentStatus', targetKey: 'ReferenceValueCodeId' });
        InsurancePayment.hasMany(models.InsurancePaymentDetails, { foreignKey: 'InsurancePaymentId' });
        InsurancePayment.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        InsurancePayment.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'UpdatedBy' });
        InsurancePayment.belongsTo(models.ReferenceValue, { as: 'PaymentType', targetKey: 'ReferenceValueCodeId' });
        InsurancePayment.belongsTo(models.ReferenceValue, { as: 'Bank', targetKey: 'ReferenceValueCodeId' });
    };
    return InsurancePayment;
}
