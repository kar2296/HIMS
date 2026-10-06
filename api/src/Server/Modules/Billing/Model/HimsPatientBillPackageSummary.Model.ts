import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientBillPackageSummaryInstance, i.PatientBillPackageSummaryAttributes> {
    let PatientBillPackageSummary = sequelize.define<i.PatientBillPackageSummaryInstance, i.PatientBillPackageSummaryAttributes>(
        'PatientBillPackageSummary', {
        Id: { type: DataTypes.BIGINT, field: 'PatientBillPackageSummaryId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.INTEGER, field: 'EncounterId' },
        IPPackageId: { type: DataTypes.INTEGER, field: 'IPPackageId' },
        EncounterIPPackageId: { type: DataTypes.INTEGER, field: 'EncounterIPPackageId' },
        PackageName: { type: DataTypes.STRING, field: 'PackageName' },
        ServiceGroupId: { type: DataTypes.INTEGER, field: 'ServiceGroupId' },
        ServiceCategoryId: { type: DataTypes.INTEGER, field: 'ServiceCategoryId' },
        ServiceSubCategoryId: { type: DataTypes.INTEGER, field: 'ServiceSubCategoryId' },
        ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
        ActualPatAmount: { type: DataTypes.DECIMAL, field: 'ActualPatAmount' },
        PackageAmount: { type: DataTypes.INTEGER, field: 'PackageAmount' },
        InclusionAmount: { type: DataTypes.INTEGER, field: 'InclusionAmount' },
        ExclusionAmount: { type: DataTypes.INTEGER, field: 'ExclusionAmount' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
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
            tableName: 'patientbillpackagesummary',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientBillPackageSummary as any).associate = function (models: Models) {
        PatientBillPackageSummary.belongsTo(models.EncounterIPPackage, {
            foreignKey: 'EncounterIPPackageId',
        });
        PatientBillPackageSummary.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
        PatientBillPackageSummary.belongsTo(models.IPPackage, { foreignKey: 'IPPackageId' });
    };
    return PatientBillPackageSummary;
}
