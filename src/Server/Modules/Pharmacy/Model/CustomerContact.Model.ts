import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CustomerContactInstance, i.CustomerContactAttributes> {
    let CustomerContact = sequelize.define<i.CustomerContactInstance, i.CustomerContactAttributes>('CustomerContact', {
        Id: { type: DataTypes.BIGINT, field: 'CustomerContactId', primaryKey: true, autoIncrement: true },
        CustomerMasterId: { type: DataTypes.BIGINT, field: 'CustomerMasterId' },
        CustomerCode: { type: DataTypes.STRING, field: 'CustomerCode' },
        CustomerName: { type: DataTypes.STRING, field: 'CustomerName' },
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
            tableName: 'customercontacts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CustomerContact as any).associate = function(models: Models) {
                    CustomerContact.belongsTo(models.ReferenceValue, { as: 'ContactType', targetKey: 'ReferenceValueCodeId' });
                    CustomerContact.belongsTo(models.PincodeMaster, { foreignKey: 'PinCodeId' });
                    CustomerContact.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
                    CustomerContact.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
                    CustomerContact.belongsTo(models.DistrictMaster, { foreignKey: 'DistrictId' });
                    CustomerContact.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
                };
 return CustomerContact;
}
