import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.QMSInstance, i.QMSAttributes> {
    let QMS = sequelize.define<i.QMSInstance, i.QMSAttributes>('QMS', {
        Id: { type: DataTypes.BIGINT, field: 'QMSId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        QMSReasonId: { type: DataTypes.BIGINT, field: 'QMSReasonId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        MRN: { type: DataTypes.STRING, field: 'MRN' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        MiddleName: { type: DataTypes.STRING, field: 'MiddleName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        LandLine: { type: DataTypes.STRING, field: 'LandLine' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        RegisteredDate: { type: DataTypes.DATE, field: 'RegisteredDate' },
        TokenNo: { type: DataTypes.INTEGER, field: 'TokenNo' },
        GuardianName: { type: DataTypes.STRING, field: 'GuardianName' },
        ReligionId: { type: DataTypes.BIGINT, field: 'ReligionId' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        IsPatientCreated: { type: DataTypes.BOOLEAN, field: 'IsPatientCreated' },
        QMSStatusId: { type: DataTypes.INTEGER, field: 'QMSStatusId' },
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
            tableName: 'qms',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (QMS as any).associate = function(models: Models) {
                    QMS.belongsTo(models.Facility);
                    QMS.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
                    QMS.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
                    QMS.belongsTo(models.ReferenceValue, { as: 'QMSReason', targetKey: 'ReferenceValueCodeId' });
                    QMS.belongsTo(models.ReferenceValue, { as: 'QMSStatus', targetKey: 'ReferenceValueCodeId' });
                    QMS.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return QMS;
}
