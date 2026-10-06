import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientKinInstance, i.PatientKinAttributes> {
    let PatientKin = sequelize.define<i.PatientKinInstance, i.PatientKinAttributes>('PatientKin', {
        Id: { type: DataTypes.BIGINT, field: 'PatientKinId', primaryKey: true, autoIncrement: true },
        RelationshipId: { type: DataTypes.BIGINT, field: 'RelationshipId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        LandLine: { type: DataTypes.STRING, field: 'LandLine' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        BloodGroupId: { type: DataTypes.BIGINT, field: 'BloodGroupId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        SameAddress: { type: DataTypes.BOOLEAN, field: 'SameAddress' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
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
            tableName: 'patientkins',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientKin as any).associate = function(models: Models) {
                    PatientKin.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
                    PatientKin.belongsTo(models.ReferenceValue, { as: 'Relationship', targetKey: 'ReferenceValueCodeId' });
                    PatientKin.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
                    PatientKin.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
                    PatientKin.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
                };
 return PatientKin;
}
