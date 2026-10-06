import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorCustomerInstance, i.GuarantorCustomerAttributes> {
    let GuarantorCustomer = sequelize.define<i.GuarantorCustomerInstance, i.GuarantorCustomerAttributes>('GuarantorCustomer', {
        Id: { type: DataTypes.BIGINT, field: 'GuarantorCustomerId', primaryKey: true, autoIncrement: true },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        CustomerTypeId: { type: DataTypes.BIGINT, field: 'CustomerTypeId' },
        CustomerCode: { type: DataTypes.STRING, field: 'CustomerCode' },
        CustomerName: { type: DataTypes.STRING, field: 'CustomerName' },
        PolicyNo: { type: DataTypes.STRING, field: 'PolicyNo' },
        PolicyName: { type: DataTypes.STRING, field: 'PolicyName' },
        CreditLimit: { type: DataTypes.DECIMAL, field: 'CreditLimit' },
        ApprovalLimit: { type: DataTypes.DECIMAL, field: 'ApprovalLimit' },
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
            tableName: 'guarantorcustomers',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (GuarantorCustomer as any).associate = function (models: Models) {
        GuarantorCustomer.belongsTo(models.ReferenceValue, { as: 'CustomerType', targetKey: 'ReferenceValueCodeId' });
        GuarantorCustomer.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return GuarantorCustomer;
}
