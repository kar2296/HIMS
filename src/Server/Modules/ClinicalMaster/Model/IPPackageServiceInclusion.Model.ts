import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPPackageServiceInclusionInstance, i.IPPackageServiceInclusionAttributes> {
    let IPPackageServiceInclusion = sequelize.define<i.IPPackageServiceInclusionInstance,
        i.IPPackageServiceInclusionAttributes>('IPPackageServiceInclusion', {
            Id: { type: DataTypes.BIGINT, field: 'IPPackageServiceInclusionId', primaryKey: true, autoIncrement: true },
            IPPackageDetailId: { type: DataTypes.BIGINT, field: 'IPPackageDetailId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceItemName: { type: DataTypes.STRING, field: 'ServiceItemName' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
            TotalAmount: { type: DataTypes.DECIMAL, field: 'TotalAmount' },
            ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
                tableName: 'ippackageserviceinclusions',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    return IPPackageServiceInclusion;
}
