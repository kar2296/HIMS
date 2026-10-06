import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientFeedbackInstance, i.PatientFeedbackAttributes> {
    let PatientFeedback = sequelize.define<i.PatientFeedbackInstance, i.PatientFeedbackAttributes>('PatientFeedback', {
        Id: { type: DataTypes.BIGINT, field: 'PatientFeedbackId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        FeedbackTypeId: { type: DataTypes.BIGINT, field: 'FeedbackTypeId' },
        FeedbackOn: { type: DataTypes.DATE, field: 'FeedbackOn' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        ReviewedBy: { type: DataTypes.INTEGER, field: 'ReviewedBy' },
        ReviewedOn: { type: DataTypes.DATE, field: 'ReviewedOn' },
        PatientSignature: { type: DataTypes.STRING, field: 'PatientSignature' },
        SignPath: { type: DataTypes.STRING, field: 'SignPath' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        PatientFeedbackStatusId: { type: DataTypes.BIGINT, field: 'PatientFeedBackStatusId' },
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
            tableName: 'patientfeedback',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientFeedback as any).associate = function(models: Models) {
                    PatientFeedback.belongsTo(models.User, { foreignKey: 'CreatedBy' });
                    PatientFeedback.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
                    PatientFeedback.belongsTo(models.Patient, { foreignKey: 'PatientId' });
                    PatientFeedback.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
                    PatientFeedback.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
                    PatientFeedback.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
                    PatientFeedback.belongsTo(models.ReferenceValue, { as: 'FeedbackType', targetKey: 'ReferenceValueCodeId' });
                    PatientFeedback.belongsTo(models.ReferenceValue, { as: 'PatientFeedbackStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientFeedback.hasMany(models.PatientFeedbackDetails);
            };
 return PatientFeedback;
}
