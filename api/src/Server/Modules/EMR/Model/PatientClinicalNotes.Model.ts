import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientClinicalNotesInstance, i.PatientClinicalNotesAttributes> {
    let PatientClinicalNotes = sequelize.define<i.PatientClinicalNotesInstance, i.PatientClinicalNotesAttributes>('PatientClinicalNotes', {
        Id: { type: DataTypes.BIGINT, field: 'PatientClinicalNoteId', primaryKey: true, autoIncrement: true },
        PatientClinicalNotesTypeId: { type: DataTypes.BIGINT, field: 'PatientClinicalNotesTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        IllnessTypeId: { type: DataTypes.BIGINT, field: 'IllnessTypeId' },
        ChiefComplaints: { type: DataTypes.STRING, field: 'ChiefComplaints' },
        DurationCount: { type: DataTypes.BIGINT, field: 'DurationCount' },
        IllnessDurationTypeId: { type: DataTypes.BIGINT, field: 'IllnessDurationTypeId' },
        Examinations: { type: DataTypes.STRING, field: 'Examinations' },
        TreatmentComments: { type: DataTypes.STRING, field: 'TreatmentComments' },
        Location: { type: DataTypes.STRING, field: 'Location' },
        Quality: { type: DataTypes.STRING, field: 'Quality' },
        Severity: { type: DataTypes.STRING, field: 'Severity' },
        Duration: { type: DataTypes.STRING, field: 'Duration' },
        Timing: { type: DataTypes.STRING, field: 'Timing' },
        Context: { type: DataTypes.STRING, field: 'Context' },
        ModifyingFactors: { type: DataTypes.STRING, field: 'ModifyingFactors' },
        AdditionalNotes: { type: DataTypes.STRING, field: 'AdditionalNotes' },
        OtherComplaints: { type: DataTypes.STRING, field: 'OtherComplaints' },
        SignedAt: { type: DataTypes.DATE, field: 'SignedAt' },
        SignedBy: { type: DataTypes.INTEGER, field: 'SignedBy' },
        SignedContent: { type: DataTypes.TEXT, field: 'SignedContent' },
        NoteStatus: { type: DataTypes.INTEGER, field: 'NoteStatus' },
        AmendmentOf: { type: DataTypes.BIGINT, field: 'AmendmentOf' },
        AmendmentReason: { type: DataTypes.STRING, field: 'AmendmentReason' },
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
            tableName: 'hims_patientclinicalnotes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientClinicalNotes as any).associate = function (models: Models) {
        PatientClinicalNotes.belongsTo(models.Encounter);
        PatientClinicalNotes.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientClinicalNotes.belongsTo(models.User, { as: 'SignedUser', foreignKey: 'SignedBy' });
        PatientClinicalNotes.belongsTo(PatientClinicalNotes, { as: 'OriginalNote', foreignKey: 'AmendmentOf' });
        PatientClinicalNotes.belongsTo(models.ReferenceValue, { as: 'IllnessType', targetKey: 'ReferenceValueCodeId' });
        PatientClinicalNotes.belongsTo(models.ReferenceValue, { as: 'IllnessDurationType', targetKey: 'ReferenceValueCodeId' });
        PatientClinicalNotes.belongsTo(models.ReferenceValue, { as: 'PatientClinicalNotesType', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientClinicalNotes;
}
