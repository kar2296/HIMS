import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPPackageDetailInstance, i.IPPackageDetailAttributes> {
    let IPPackageDetail = sequelize.define<i.IPPackageDetailInstance,
        i.IPPackageDetailAttributes>('IPPackageDetail', {
            Id: { type: DataTypes.BIGINT, field: 'IPPackageDetailId', primaryKey: true, autoIncrement: true },
            IPPackageId: { type: DataTypes.BIGINT, field: 'IPPackageId' },
            IPPackageTariffDetailId: { type: DataTypes.BIGINT, field: 'IPPackageTariffDetailId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
            ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
            ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
            PackageAmount: { type: DataTypes.DECIMAL, field: 'PackageAmount' },
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
                tableName: 'ippackagedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (IPPackageDetail as any).associate = function (models: Models) {
        IPPackageDetail.hasMany(models.IPPackageServiceInclusion, { foreignKey: 'IPPackageDetailId' });
        IPPackageDetail.hasMany(models.IPPackageServiceExclusion, { foreignKey: 'IPPackageDetailId' });
    };
    return IPPackageDetail;
}
