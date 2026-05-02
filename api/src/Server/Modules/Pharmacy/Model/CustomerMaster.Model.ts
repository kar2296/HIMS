import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CustomerMasterInstance, i.CustomerMasterAttributes> {
    let CustomerMaster = sequelize.define<i.CustomerMasterInstance, i.CustomerMasterAttributes>('CustomerMaster', {
        Id: { type: DataTypes.BIGINT, field: 'CustomerMasterId', primaryKey: true, autoIncrement: true },
        CustomerCode: { type: DataTypes.STRING, field: 'CustomerCode' },
        CustomerName: { type: DataTypes.STRING, field: 'CustomerName' },
        CustomerDescription: { type: DataTypes.STRING, field: 'CustomerDescription' },
        CustomerTypeId: { type: DataTypes.BIGINT, field: 'CustomerTypeId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        MobileNumber: { type: DataTypes.STRING, field: 'MobileNumber' },
        PhoneNumber: { type: DataTypes.STRING, field: 'PhoneNumber' },
        FaxNumber: { type: DataTypes.STRING, field: 'FaxNumber' },
        EmailAddress: { type: DataTypes.STRING, field: 'EmailAddress' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        BusinessDomainId: { type: DataTypes.BIGINT, field: 'BusinessDomainId' },
        DistributionTypeId: { type: DataTypes.BIGINT, field: 'DistributionTypeId' },
        PaymentTermsId: { type: DataTypes.BIGINT, field: 'PaymentTermsId' },
        LicenceCode: { type: DataTypes.STRING, field: 'LicenceCode' },
        GSTNumber: { type: DataTypes.STRING, field: 'GSTNumber' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        AddressLine3: { type: DataTypes.STRING, field: 'AddressLine3' },
        CustomerUrl: { type: DataTypes.STRING, field: 'CustomerUrl' },
        ProfitPercentage: { type: DataTypes.DECIMAL, field: 'ProfitPercentage' },
        CurrencyCodeId: { type: DataTypes.STRING, field: 'CurrencyCodeId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'customermaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (CustomerMaster as any).associate = function (models: Models) {
        CustomerMaster.belongsTo(models.ReferenceValue, { as: 'CustomerType', targetKey: 'ReferenceValueCodeId' });
        CustomerMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        CustomerMaster.belongsTo(models.ReferenceValue, { as: 'DistributionType', targetKey: 'ReferenceValueCodeId' });
        CustomerMaster.belongsTo(models.ReferenceValue, { as: 'BusinessDomain', targetKey: 'ReferenceValueCodeId' });
        CustomerMaster.belongsTo(models.ReferenceValue, { as: 'PaymentTerms', targetKey: 'ReferenceValueCodeId' });
        CustomerMaster.belongsTo(models.CustomerContact, { foreignKey: 'CustomerMasterId' });
        CustomerMaster.hasMany(models.CustomerContact);
    };
    return CustomerMaster;
}
