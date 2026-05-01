import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientBillSummaryInstance, i.PatientBillSummaryAttributes> {
    let PatientBillSummary = sequelize.define<i.PatientBillSummaryInstance, i.PatientBillSummaryAttributes>(
        'PatientBillSummary', {
        Id: { type: DataTypes.BIGINT, field: 'PatientBillSummaryId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.INTEGER, field: 'EncounterId' },
        ServiceGroupId: { type: DataTypes.INTEGER, field: 'ServiceGroupId' },
        ServiceCategoryId: { type: DataTypes.INTEGER, field: 'ServiceCategoryId' },
        ServiceSubCategoryId: { type: DataTypes.INTEGER, field: 'ServiceSubCategoryId' },
        ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
        ActualNetAmount: { type: DataTypes.DECIMAL, field: 'ActualNetAmount' },
        ActualPatAmount: { type: DataTypes.DECIMAL, field: 'ActualPatAmount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        TaxAmount: { type: DataTypes.DECIMAL, field: 'TaxAmount' },
        FreeActualAmount: { type: DataTypes.DECIMAL, field: 'FreeActualAmount' },
        IsFreePatient: { type: DataTypes.BOOLEAN, field: 'IsFreePatient' },
        IsPharmacySale: { type: DataTypes.BOOLEAN, field: 'IsPharmacySale' },
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
            tableName: 'patientbillsummary',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientBillSummary as any).associate = function (models: Models) {
        PatientBillSummary.hasMany(models.PatientBillSplitDetails, { foreignKey: 'PatientBillSummaryId' });
        PatientBillSummary.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
    };
    return PatientBillSummary;
}
