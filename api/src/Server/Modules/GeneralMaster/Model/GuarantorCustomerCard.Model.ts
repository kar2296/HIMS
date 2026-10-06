import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorCustomerCardInstance, i.GuarantorCustomerCardAttributes> {
    let GuarantorCustomerCard = sequelize.define<i.GuarantorCustomerCardInstance,
        i.GuarantorCustomerCardAttributes>('GuarantorCustomerCard', {
            Id: { type: DataTypes.BIGINT, field: 'GuarantorCustomerCardId', primaryKey: true, autoIncrement: true },
            GuarantorCustomerId: { type: DataTypes.BIGINT, field: 'GuarantorCustomerId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorCardTypeId: { type: DataTypes.BIGINT, field: 'GuarantorCardTypeId' },
            CardMasterTypeId: { type: DataTypes.BIGINT, field: 'CardMasterTypeId' },
            CardMasterId: { type: DataTypes.BIGINT, field: 'CardMasterId' },
            CardCode: { type: DataTypes.STRING, field: 'CardCode' },
            CardName: { type: DataTypes.STRING, field: 'CardName' },
            CardDescription: { type: DataTypes.STRING, field: 'CardDescription' },
            PolicyNo: { type: DataTypes.STRING, field: 'PolicyNo' },
            PolicyName: { type: DataTypes.STRING, field: 'PolicyName' },
            CreditLimit: { type: DataTypes.DECIMAL, field: 'CreditLimit' },
            ApprovalLimit: { type: DataTypes.DECIMAL, field: 'ApprovalLimit' },
            DeductableLimit: { type: DataTypes.DECIMAL, field: 'DeductableLimit' },
            DeductableLoadId: { type: DataTypes.BIGINT, field: 'DeductableLoadId' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
            ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
                tableName: 'guarantorcustomercards',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (GuarantorCustomerCard as any).associate = function (models: Models) {
        GuarantorCustomerCard.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        GuarantorCustomerCard.belongsTo(models.GuarantorCardType, { foreignKey: 'GuarantorCardTypeId' });
        GuarantorCustomerCard.belongsTo(models.GuarantorCustomer, { foreignKey: 'GuarantorCustomerId' });
        GuarantorCustomerCard.hasMany(models.GuarantorCustomerCardDeductable);
        GuarantorCustomerCard.belongsTo(models.ReferenceValue, { as: 'CardMasterType', targetKey: 'ReferenceValueCodeId' });
        GuarantorCustomerCard.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return GuarantorCustomerCard;
}
