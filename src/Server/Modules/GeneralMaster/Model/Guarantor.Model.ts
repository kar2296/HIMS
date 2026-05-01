import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorInstance, i.GuarantorAttributes> {
    let Guarantor = sequelize.define<i.GuarantorInstance, i.GuarantorAttributes>('Guarantor', {
        Id: { type: DataTypes.BIGINT, field: 'GuarantorId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        CreditLimit: { type: DataTypes.BIGINT, field: 'CreditLimit' },
        AvailableLimit: { type: DataTypes.BIGINT, field: 'AvailableLimit' },
        ContractDate: { type: DataTypes.DATE, field: 'ContractDate' },
        ContractExpiryDate: { type: DataTypes.DATE, field: 'ContractExpiryDate' },
        TPAId: { type: DataTypes.BIGINT, field: 'TPAId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        GuarantorClientTypeId: { type: DataTypes.BIGINT, field: 'GuarantorClientTypeId' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        Phone: { type: DataTypes.STRING, field: 'Phone' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        BusinessDevelopmentManager: { type: DataTypes.STRING, field: 'BusinessDevelopmentManager' },
        CreditAccountNo: { type: DataTypes.STRING, field: 'CreditAccountNo' },
        DebitAccountNo: { type: DataTypes.STRING, field: 'DebitAccountNo' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        ReconsultDays: { type: DataTypes.STRING, field: 'ReconsultDays' },
        IsDiscount: { type: DataTypes.BOOLEAN, field: 'IsDiscount' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CoPayPercent: { type: DataTypes.STRING, field: 'CoPayPercent' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsIPBedTariff: { type: DataTypes.BOOLEAN, field: 'IsIPBedTariff' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'guarantors',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Guarantor as any).associate = function (models: Models) {
        Guarantor.belongsTo(models.ReferenceValue, { as: 'TPA', targetKey: 'ReferenceValueCodeId' });
        Guarantor.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        Guarantor.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Guarantor.belongsTo(models.ServiceRateCategory, { foreignKey: 'ServiceRateCategoryId' });
        Guarantor.belongsTo(models.PincodeMaster, { foreignKey: 'PinCodeId' });
        Guarantor.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        Guarantor.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        Guarantor.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        Guarantor.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
        Guarantor.hasMany(models.GuarantorCardType, { foreignKey: 'GuarantorId' });
        Guarantor.hasMany(models.GuarantorAgreement, { foreignKey: 'GuarantorId' });
        Guarantor.hasMany(models.GuarantorCustomer, { foreignKey: 'GuarantorId' });
    };
    return Guarantor;
}
