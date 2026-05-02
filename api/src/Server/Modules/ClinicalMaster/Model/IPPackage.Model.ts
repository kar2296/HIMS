import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.IPPackageInstance, i.IPPackageAttributes> {
    let IPPackage = sequelize.define<i.IPPackageInstance, i.IPPackageAttributes>('IPPackage', {
        Id: { type: DataTypes.BIGINT, field: 'IPPackageId', primaryKey: true, autoIncrement: true },
        IPPackageCode: { type: DataTypes.STRING, field: 'IPPackageCode' },
        IPPackageShortCode: { type: DataTypes.STRING, field: 'IPPackageShortCode' },
        IPPackageName: { type: DataTypes.STRING, field: 'IPPackageName' },
        IPPackageDescription: { type: DataTypes.STRING, field: 'IPPackageDescription' },
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
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
        PackageAmount: { type: DataTypes.DECIMAL, field: 'PackageAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountTypeId: { type: DataTypes.BIGINT, field: 'DiscountTypeId' },
        DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        CreditAccount: { type: DataTypes.STRING, field: 'CreditAccount' },
        DebitAccount: { type: DataTypes.STRING, field: 'DebitAccount' },
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
        ICUDays: { type: DataTypes.INTEGER, field: 'ICUDays' },
        CreditAmount: { type: DataTypes.DECIMAL, field: 'CreditAmount' },
        DebitAmount: { type: DataTypes.DECIMAL, field: 'DebitAmount' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'ippackages',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (IPPackage as any).associate = function (models: any) {
        IPPackage.hasMany(models.IPPackageDetail);
        IPPackage.hasMany(models.IPPackageTariffDetail);
        IPPackage.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        IPPackage.belongsTo(models.Department);
        IPPackage.belongsTo(models.ServiceRateCategory, { foreignKey: 'ServiceRateCategoryId' });
        IPPackage.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return IPPackage as SequelizeStatic.Model<i.IPPackageInstance, i.IPPackageAttributes>;
}
