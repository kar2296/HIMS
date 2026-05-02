import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterMLCOfficerInstance, i.EncounterMLCOfficerAttributes> {
    let EncounterMLCOfficer = sequelize.define<i.EncounterMLCOfficerInstance, i.EncounterMLCOfficerAttributes>('EncounterMLCOfficer', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterMLCOfficerId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterMLCId: { type: DataTypes.BIGINT, field: 'EncounterMLCId' },
        OfficerName: { type: DataTypes.STRING, field: 'OfficerName' },
        Designation: { type: DataTypes.STRING, field: 'Designation' },
        ContactNo: { type: DataTypes.STRING, field: 'ContactNo' },
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
            tableName: 'encountermlcofficer',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return EncounterMLCOfficer;
}
