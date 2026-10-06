import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorMasterInstance, i.VendorMasterAttributes> {
    let VendorMaster = sequelize.define<i.VendorMasterInstance, i.VendorMasterAttributes>('VendorMaster', {
        Id: { type: DataTypes.BIGINT, field: 'VendorMasterId', primaryKey: true, autoIncrement: true },
        VendorCode: { type: DataTypes.STRING, field: 'VendorCode' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        VendorDescription: { type: DataTypes.STRING, field: 'VendorDescription' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        VendorTypeId: { type: DataTypes.BIGINT, field: 'VendorTypeId' },
        SupplyTypeId: { type: DataTypes.BIGINT, field: 'SupplyTypeId' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        MobileNumber: { type: DataTypes.STRING, field: 'MobileNumber' },
        PhoneNumber: { type: DataTypes.STRING, field: 'PhoneNumber' },
        AdditionalPhoneNumber: { type: DataTypes.STRING, field: 'AdditionalPhoneNumber' },
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
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsAssetVendor: { type: DataTypes.BOOLEAN, field: 'IsAssetVendor' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsTDS: { type: DataTypes.BOOLEAN, field: 'IsTDS' },
        TDSId: { type: DataTypes.INTEGER, field: 'TDSId' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
        TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
        WriteOff: { type: DataTypes.DECIMAL, field: 'WriteOff' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        OutStandingAmount: { type: DataTypes.DECIMAL, field: 'OutStandingAmount' },
        ReturnedAmount: { type: DataTypes.DECIMAL, field: 'ReturnedAmount' },
        PANNo: { type: DataTypes.INTEGER, field: 'PANNo' },
        GSTNo: { type: DataTypes.INTEGER, field: 'GSTNo' },
        TANNo: { type: DataTypes.INTEGER, field: 'TANNo' },
        MSME: { type: DataTypes.INTEGER, field: 'MSME' },
        SupplierCategoryId: { type: DataTypes.BIGINT, field: 'SupplierCategoryId' },
        BankName: { type: DataTypes.STRING, field: 'BankName' },
        AccountNo: { type: DataTypes.STRING, field: 'AccountNo' },
        BankBranch: { type: DataTypes.STRING, field: 'BankBranch' },
        IFSCCode: { type: DataTypes.STRING, field: 'IFSCCode' },
        ImagePath: { type: DataTypes.STRING, field: 'ImagePath' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'vendormaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VendorMaster as any).associate = function (models: Models) {
        VendorMaster.belongsTo(models.ReferenceValue, { as: 'VendorType', targetKey: 'ReferenceValueCodeId' });
        VendorMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        VendorMaster.belongsTo(models.ReferenceValue, { as: 'DistributionType', targetKey: 'ReferenceValueCodeId' });
        VendorMaster.belongsTo(models.ReferenceValue, { as: 'BusinessDomain', targetKey: 'ReferenceValueCodeId' });
        VendorMaster.belongsTo(models.ReferenceValue, { as: 'PaymentTerms', targetKey: 'ReferenceValueCodeId' });
        VendorMaster.belongsTo(models.VendorContact, { foreignKey: 'VendorMasterId' });
        VendorMaster.belongsTo(models.GstMaster, { foreignKey: 'TDSId' });
        VendorMaster.hasMany(models.VendorContact);
    };
    return VendorMaster;
}
