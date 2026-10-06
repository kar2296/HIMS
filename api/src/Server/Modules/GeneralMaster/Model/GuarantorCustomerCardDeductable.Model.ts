import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorCustomerCardDeductableInstance, i.GuarantorCustomerCardDeductableAttributes> {
    let GuarantorCustomerCardDeductable = sequelize.define<i.GuarantorCustomerCardDeductableInstance,
        i.GuarantorCustomerCardDeductableAttributes>(
            'GuarantorCustomerCardDeductable', {
                Id: { type: DataTypes.BIGINT, field: 'GuarantorCustomerCardDeductableId', primaryKey: true, autoIncrement: true },
                GuarantorCustomerCardId: { type: DataTypes.BIGINT, field: 'GuarantorCustomerCardId' },
                GuarantorCustomerId: { type: DataTypes.BIGINT, field: 'GuarantorCustomerId' },
                GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
                ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
                ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
                ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
                DeductableLimit: { type: DataTypes.DECIMAL, field: 'DeductableLimit' },
                DeductableLoadId: { type: DataTypes.BIGINT, field: 'DeductableLoadId' },
                DeductablePercentage: { type: DataTypes.DECIMAL, field: 'DeductablePercentage' },
                DeductableAmount: { type: DataTypes.DECIMAL, field: 'DeductableAmount' },
                ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
                tableName: 'guarantorcustomercarddeductables',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (GuarantorCustomerCardDeductable as any).associate = function (models: Models) {
        GuarantorCustomerCardDeductable.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        GuarantorCustomerCardDeductable.belongsTo(models.ReferenceValue, { as: 'DeductableLoad', targetKey: 'ReferenceValueCodeId' });
    };


    return GuarantorCustomerCardDeductable;
}
