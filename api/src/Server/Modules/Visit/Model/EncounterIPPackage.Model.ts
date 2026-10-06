import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (
    sequelize: Sequelize,
    DataTypes: DataTypes
): SequelizeStatic.Model<i.EncounterIPPackageInstance, i.EncounterIPPackageAttributes, i.EncounterIPPackageAttributes> {

    const EncounterIPPackage = sequelize.define<i.EncounterIPPackageInstance, i.EncounterIPPackageAttributes>('EncounterIPPackage', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterIPPackageId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        IPPackageId: { type: DataTypes.BIGINT, field: 'IPPackageId' },
        IPPackageCode: { type: DataTypes.STRING, field: 'IPPackageCode' },
        IPPackageShortCode: { type: DataTypes.STRING, field: 'IPPackageShortCode' },
        IPPackageName: { type: DataTypes.STRING, field: 'IPPackageName' },
        IPPackageDescription: { type: DataTypes.STRING, field: 'IPPackageDescription' },
        PackageAssignedDate: { type: DataTypes.DATE, field: 'PackageAssignedDate' },
        IPPackageDays: { type: DataTypes.INTEGER, field: 'IPPackageDays' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        IsRateEditable: { type: DataTypes.BOOLEAN, field: 'IsRateEditable' },
        ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
        PackageAmount: { type: DataTypes.DECIMAL, field: 'PackageAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountTypeId: { type: DataTypes.BIGINT, field: 'DiscountTypeId' },
        DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        CreditAmount: { type: DataTypes.STRING, field: 'CreditAmount' },
        DebitAmount: { type: DataTypes.STRING, field: 'DebitAmount' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsUnlimitedServices: { type: DataTypes.BOOLEAN, field: 'IsUnlimitedServices' },
    }, {
        indexes: [],
        timestamps: true,
        tableName: 'encounterippackages',
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        freezeTableName: true,
        defaultScope: {
            where: {
                Status: 1
            }
        }
    });

    (EncounterIPPackage as any).associate = function (models: Models) {
        EncounterIPPackage.hasMany(models.EncounterIPPackageDetail, { foreignKey: 'EncounterIPPackageId' });
        EncounterIPPackage.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        EncounterIPPackage.belongsTo(models.Department);
        EncounterIPPackage.belongsTo(models.ServiceRateCategory, { foreignKey: 'ServiceRateCategoryId' });
        EncounterIPPackage.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        EncounterIPPackage.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        EncounterIPPackage.belongsTo(models.User, { as: 'Updateduser', foreignKey: 'UpdatedBy' });
    };

    return EncounterIPPackage;
}
