import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPPackageTariffDetailInstance, i.IPPackageTariffDetailAttributes> {
    let IPPackageTariffDetail = sequelize.define<i.IPPackageTariffDetailInstance,
        i.IPPackageTariffDetailAttributes>('IPPackageTariffDetail', {
            Id: { type: DataTypes.BIGINT, field: 'IPPackageTariffDetailId', primaryKey: true, autoIncrement: true },
            IPPackageId: { type: DataTypes.BIGINT, field: 'IPPackageId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            TariffTypeId: { type: DataTypes.BIGINT, field: 'TariffTypeId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
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
                tableName: 'ippackagetariffdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (IPPackageTariffDetail as any).associate = function (models: Models) {
        IPPackageTariffDetail.hasMany(models.IPPackageDetail);
    };
    return IPPackageTariffDetail;
}
