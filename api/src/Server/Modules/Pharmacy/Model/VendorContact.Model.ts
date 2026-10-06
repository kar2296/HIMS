import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorContactInstance, i.VendorContactAttributes> {
    let VendorContact = sequelize.define<i.VendorContactInstance, i.VendorContactAttributes>('VendorContact', {
        Id: { type: DataTypes.BIGINT, field: 'VendorContactId', primaryKey: true, autoIncrement: true },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorCode: { type: DataTypes.STRING, field: 'VendorCode' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        ContactTypeId: { type: DataTypes.BIGINT, field: 'ContactTypeId' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        MobileNo: { type: DataTypes.STRING, field: 'MobileNo' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        EMail: { type: DataTypes.STRING, field: 'EMail' },
        IsPrimary: { type: DataTypes.BOOLEAN, field: 'IsPrimary' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
        ContactStatusId: { type: DataTypes.BIGINT, field: 'ContactStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'vendorcontacts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VendorContact as any).associate = function (models: Models) {
        VendorContact.belongsTo(models.ReferenceValue, { as: 'ContactType', targetKey: 'ReferenceValueCodeId' });
        VendorContact.belongsTo(models.PincodeMaster, { foreignKey: 'PinCodeId' });
        VendorContact.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
        VendorContact.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
        VendorContact.belongsTo(models.DistrictMaster, { foreignKey: 'DistrictId' });
        VendorContact.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
    };
    return VendorContact;
}
