import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorFacilityMapInstance, i.VendorFacilityMapAttributes> {
    let VendorFacilityMap = sequelize.define<i.VendorFacilityMapInstance, i.VendorFacilityMapAttributes>('VendorFacilityMap', {
        Id: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId', primaryKey: true, autoIncrement: true },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorCode: { type: DataTypes.STRING, field: 'VendorCode' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        VendorDescription: { type: DataTypes.STRING, field: 'VendorDescription' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        VendorTypeId: { type: DataTypes.BIGINT, field: 'VendorTypeId' },
        SupplyTypeId: { type: DataTypes.BIGINT, field: 'SupplyTypeId' },
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
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        AddressLine3: { type: DataTypes.STRING, field: 'AddressLine3' },
        VendorUrl: { type: DataTypes.STRING, field: 'VendorUrl' },
        LeadTime: { type: DataTypes.INTEGER, field: 'LeadTime' },
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
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'vendorfacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VendorFacilityMap as any).associate = function (models: Models) {
        //VendorFacilityMap.belongsTo(models.ReferenceValue, { as: 'VendorType', targetKey: 'ReferenceValueCodeId' });
        //VendorFacilityMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        //VendorFacilityMap.belongsTo(models.ReferenceValue, { as: 'DistributionType', targetKey: 'ReferenceValueCodeId' });
        //VendorFacilityMap.belongsTo(models.ReferenceValue, { as: 'BusinessDomain', targetKey: 'ReferenceValueCodeId' });
        //VendorFacilityMap.belongsTo(models.ReferenceValue, { as: 'PaymentTerms', targetKey: 'ReferenceValueCodeId' });
        VendorFacilityMap.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        //VendorFacilityMap.hasMany(models.VendorContact);
    };
    return VendorFacilityMap;
}
