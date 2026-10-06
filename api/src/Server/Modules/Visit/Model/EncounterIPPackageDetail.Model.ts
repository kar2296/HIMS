import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterIPPackageDetailInstance, i.EncounterIPPackageDetailAttributes> {
    let EncounterIPPackageDetail = sequelize.define<i.EncounterIPPackageDetailInstance,
        i.EncounterIPPackageDetailAttributes>('EncounterIPPackageDetail', {
            Id: { type: DataTypes.BIGINT, field: 'EncounterIPPackageDetailId', primaryKey: true, autoIncrement: true },
            EncounterIPPackageId: { type: DataTypes.BIGINT, field: 'EncounterIPPackageId' },
            IPPackageDetailId: { type: DataTypes.BIGINT, field: 'IPPackageDetailId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
            ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
            ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
            ActualPatAmount: { type: DataTypes.DECIMAL, field: 'ActualPatAmount' },
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
                tableName: 'encounterippackagedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (EncounterIPPackageDetail as any).associate = function (models: Models) {
        EncounterIPPackageDetail.hasMany(models.EncounterIPPackageServiceInclusion, { foreignKey: 'EncounterIPPackageDetailId' });
        EncounterIPPackageDetail.hasMany(models.EncounterIPPackageServiceExclusion, { foreignKey: 'EncounterIPPackageDetailId' });
    };
    return EncounterIPPackageDetail;
}
