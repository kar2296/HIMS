import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ModifiedPatientBillCategorysInstance, i.ModifiedPatientBillCategorysAttributes> {
    let ModifiedPatientBillCategorys = sequelize.define<i.ModifiedPatientBillCategorysInstance, i.ModifiedPatientBillCategorysAttributes>(
        'ModifiedPatientBillCategorys', {
            Id: { type: DataTypes.BIGINT, field: 'ModifiedPatientBillCategoryId', primaryKey: true, autoIncrement: true },
            ModifiedPatientBillId: { type: DataTypes.BIGINT, field: 'ModifiedPatientBillId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterIPPackageDetailId: { type: DataTypes.BIGINT, field: 'EncounterIPPackageDetailId' },
            ServiceGroupId: { type: DataTypes.BIGINT, field: 'ServiceGroupId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceSubCategoryId: { type: DataTypes.BIGINT, field: 'ServiceSubCategoryId' },
            CategoryGrossAmount: { type: DataTypes.DECIMAL, field: 'CategoryGrossAmount' },
            CategoryDiscountAmount: { type: DataTypes.DECIMAL, field: 'CategoryDiscountAmount' },
            CategoryGstAmount: { type: DataTypes.DECIMAL, field: 'CategoryGstAmount' },
            CategoryNetAmount: { type: DataTypes.DECIMAL, field: 'CategoryNetAmount' },
            GuarantorGrossAmount: { type: DataTypes.DECIMAL, field: 'GuarantorGrossAmount' },
            SupplementaryGrossAmount: { type: DataTypes.DECIMAL, field: 'SupplementaryGrossAmount' },
            GuarantorDiscountAmount: { type: DataTypes.DECIMAL, field: 'GuarantorDiscountAmount' },
            SupplementaryDiscountAmount: { type: DataTypes.DECIMAL, field: 'SupplementaryDiscountAmount' },
            GuarantorGstAmount: { type: DataTypes.DECIMAL, field: 'GuarantorGstAmount' },
            SupplementaryGstAmount: { type: DataTypes.DECIMAL, field: 'SupplementaryGstAmount' },
            GuarantorNetAmount: { type: DataTypes.DECIMAL, field: 'GuarantorNetAmount' },
            SupplementaryNetAmount: { type: DataTypes.DECIMAL, field: 'SupplementaryNetAmount' },
            ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
            PackageAmount: { type: DataTypes.DECIMAL, field: 'PackageAmount' },
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
            tableName: 'modifiedpatientbillcategorys',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ModifiedPatientBillCategorys as any).associate = function (models: Models) {
        ModifiedPatientBillCategorys.hasMany(models.ModifiedPatientBillCategoryDetails, { foreignKey: 'ModifiedPatientBillCategoryId' });
        ModifiedPatientBillCategorys.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
    };
    return ModifiedPatientBillCategorys;
}
