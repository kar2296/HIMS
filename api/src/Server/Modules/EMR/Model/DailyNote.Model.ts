import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DailyNoteInstance, i.DailyNoteAttributes> {
    let DailyNote = sequelize.define<i.DailyNoteInstance, i.DailyNoteAttributes>('DailyNote', {
        Id: { type: DataTypes.BIGINT, field: 'DailyNoteId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        NoteTypeId: { type: DataTypes.BIGINT, field: 'NoteTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        LinkedPatientId: { type: DataTypes.BIGINT, field: 'LinkedPatientId' },
        CapturedBy: { type: DataTypes.BIGINT, field: 'CapturedBy' },
        CapturedOn: { type: DataTypes.DATE, field: 'CapturedOn' },
        DailyNote: { type: DataTypes.STRING, field: 'DailyNote' },
        SpecialNote: { type: DataTypes.STRING, field: 'SpecialNote' },
        NoteStatusId: { type: DataTypes.BIGINT, field: 'NoteStatusId' },
        DailyNoteStatusId: { type: DataTypes.BIGINT, field: 'DailyNoteStatusId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
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
            tableName: 'hims_dailynotes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DailyNote as any).associate = function (models: Models) {
        DailyNote.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        DailyNote.belongsTo(models.User, {
            as: 'CapturedUser',
            foreignKey: 'CapturedBy'
        });
        DailyNote.belongsTo(models.ReferenceValue, {
            as: 'NoteStatus',
            targetKey: 'ReferenceValueCodeId'
        });
        DailyNote.belongsTo(models.ReferenceValue, {
            as: 'Note',
            foreignKey: 'NoteTypeId',
            targetKey: 'ReferenceValueCodeId'
        });
        DailyNote.belongsTo(models.ReferenceValue, {
            as: 'DailyNoteStatus',
            foreignKey: 'DailyNoteStatusId',
            targetKey: 'ReferenceValueCodeId'
        });
        DailyNote.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        DailyNote.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
    };
    return DailyNote;
}
