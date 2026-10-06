import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDeathInstance, i.PatientDeathAttributes> {
    let PatientDeath = sequelize.define<i.PatientDeathInstance, i.PatientDeathAttributes>('PatientDeath', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDeathId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DeathTypeId: { type: DataTypes.BIGINT, field: 'DeathTypeId' },
        DeathPlaceId: { type: DataTypes.BIGINT, field: 'DeathPlaceId' },
        DeathStatusId: { type: DataTypes.BIGINT, field: 'DeathStatusId' },
        IsDeathConfirmed: { type: DataTypes.BOOLEAN, field: 'IsDeathConfirmed' },
        DeathRequestedBy: { type: DataTypes.BIGINT, field: 'DeathRequestedBy' },
        DeathRequestedDate: { type: DataTypes.DATE, field: 'DeathRequestedDate' },
        DeathDate: { type: DataTypes.DATE, field: 'DeathDate' },
        DeathApprovedDate: { type: DataTypes.DATE, field: 'DeathApprovedDate' },
        DeathApprovedBy: { type: DataTypes.BIGINT, field: 'DeathApprovedBy' },
        DeathComments: { type: DataTypes.STRING, field: 'DeathComments' },
        DeathReversedDate: { type: DataTypes.DATE, field: 'DeathReversedDate' },
        DeathReversedBy: { type: DataTypes.BIGINT, field: 'DeathReversedBy' },
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
            tableName: 'patientdeath',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientDeath as any).associate = function (models: Models) {
        PatientDeath.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientDeath.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDeath.belongsTo(models.User, {  as: 'Doctor', foreignKey: 'DoctorId' });
        PatientDeath.belongsTo(models.User, {  as: 'DeathRequestedUser', foreignKey: 'DeathRequestedBy' });
        PatientDeath.belongsTo(models.User, {  as: 'DeathApprovedUser', foreignKey: 'DeathApprovedBy' });
        PatientDeath.belongsTo(models.User, {  as: 'DeathReversedUser', foreignKey: 'DeathReversedBy' });
        PatientDeath.belongsTo(models.ReferenceValue,
            { as: 'DeathStatus', foreignKey: 'DeathStatusId', targetKey: 'ReferenceValueCodeId' });
    };

    return PatientDeath;
}
