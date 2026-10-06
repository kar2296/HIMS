import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemPackageMapInstance, i.ServiceItemPackageMapAttributes> {
    let ServiceItemPackageMap = sequelize.define<i.ServiceItemPackageMapInstance,
        i.ServiceItemPackageMapAttributes>('ServiceItemPackageMap', {
            Id: { type: DataTypes.BIGINT, field: 'ServiceItemPackageMapId', primaryKey: true, autoIncrement: true },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
            Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            ServiceItemDiscountTypeId: { type: DataTypes.BIGINT, field: 'ServiceItemDiscountTypeId' },
            DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
            IsDoctorShare: { type: DataTypes.BOOLEAN, field: 'IsDoctorShare' },
            DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
            SharePercentage: { type: DataTypes.DECIMAL, field: 'SharePercentage' },
            Formula: { type: DataTypes.STRING, field: 'Formula' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'serviceitempackagemap',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (ServiceItemPackageMap as any).associate = function (models: Models) {
        ServiceItemPackageMap.belongsTo(models.Testmaster, { foreignKey: 'ServiceId' });
        ServiceItemPackageMap.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
        ServiceItemPackageMap.belongsTo(models.ReferenceValue,
            { as: 'ServiceItemDiscountType', targetKey: 'ReferenceValueCodeId' });
    };
    return ServiceItemPackageMap;
}
