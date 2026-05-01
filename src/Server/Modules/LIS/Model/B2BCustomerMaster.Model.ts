import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.B2BCustomerMasterInstance, i.B2BCustomerMasterAttributes> {
    let B2BCustomerMaster = sequelize.define<i.B2BCustomerMasterInstance, i.B2BCustomerMasterAttributes>('B2BCustomerMaster', {
        Id: { type: DataTypes.BIGINT, field: 'B2BCustomerMasterId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        B2BCustomerName: { type: DataTypes.STRING, field: 'B2BCustomerName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        AddressLine3: { type: DataTypes.STRING, field: 'AddressLine3' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        MobileNumber: { type: DataTypes.STRING, field: 'MobileNumber' },
        PhoneNumber: { type: DataTypes.STRING, field: 'PhoneNumber' },
        FaxNumber: { type: DataTypes.STRING, field: 'FaxNumber' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        EmailAddress: { type: DataTypes.STRING, field: 'EmailAddress' },
        LicenceCode: { type: DataTypes.STRING, field: 'LicenceCode' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'b2bcustomermaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (B2BCustomerMaster as any).associate = function(models: Models) {
                    B2BCustomerMaster.belongsTo(models.Department, { as: 'Department', foreignKey: 'B2BCustomerMasterId' });
                    B2BCustomerMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    B2BCustomerMaster.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                    //B2BCustomerMaster.belongsToMany(models.PriceMapping);
                    B2BCustomerMaster.belongsTo(models.ReferenceValue,
                        { as: 'TESTMASTERTYP', foreignKey: 'TESTMASTERTYPId', targetKey: 'ReferenceValueCodeId' });
                };
 return B2BCustomerMaster;
}
