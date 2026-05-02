import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceRateCategoryInstance, i.ServiceRateCategoryAttributes> {
    let ServiceRateCategory = sequelize.define<i.ServiceRateCategoryInstance, i.ServiceRateCategoryAttributes>('ServiceRateCategory', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ServiceRateCategory: { type: DataTypes.STRING, field: 'ServiceRateCategory' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        PrimaryCategoryId: { type: DataTypes.BIGINT, field: 'PrimaryCategoryId' },
        Percentage: { type: DataTypes.STRING, field: 'Percentage' },
        IsBasic: { type: DataTypes.BOOLEAN, field: 'IsBasic' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        TariffTypeId: { type: DataTypes.INTEGER, field: 'TariffTypeId' },
        OrderMasterStatusId: { type: DataTypes.BOOLEAN, field: 'OrderMasterStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'serviceratecategories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ServiceRateCategory as any).associate = function (models: Models) {
        ServiceRateCategory.belongsTo(models.Facility);
        ServiceRateCategory.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        ServiceRateCategory.belongsTo(models.ReferenceValue, { as: 'PrimaryCategory', targetKey: 'ReferenceValueCodeId' });
        ServiceRateCategory.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        // ServiceRateCategory.belongsTo(models.ReferenceValue, {
        //     as: 'GuarantorType',
        //     foreignKey: 'TariffTypeId', targetKey: 'ReferenceValueCodeId'
        // });
    };
    return ServiceRateCategory;
}
