import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.MRDFileAttachmentInstance, i.MRDFileAttachmentAttributes> {
    let MRDFileAttachments = sequelize.define<i.MRDFileAttachmentInstance, i.MRDFileAttachmentAttributes>('MRDFileAttachments', {
        Id: { type: DataTypes.BIGINT, field: 'MRDFileAttachmentId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        MRN: { type: DataTypes.STRING, field: 'MRN' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        CapturedDate: { type: DataTypes.DATE, field: 'CapturedDate' },
        MRDFileTypeId: { type: DataTypes.BIGINT, field: 'MRDFileTypeId' },
        MRDFileStatusId: { type: DataTypes.BIGINT, field: 'MRDFileStatusId' },
        AttachmentName: { type: DataTypes.STRING, field: 'AttachmentName' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'mrdfileattachments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

(MRDFileAttachments as any).associate = function (models: Models) {
    MRDFileAttachments.belongsTo(models.Patient);
    MRDFileAttachments.belongsTo(models.Encounter);
    MRDFileAttachments.belongsTo(models.ReferenceValue, {
        as: 'MRDFileType',
        targetKey: 'ReferenceValueCodeId',
        foreignKey: 'MRDFileTypeId'
    });
    MRDFileAttachments.belongsTo(models.ReferenceValue, {
        as: 'EncounterType',
        targetKey: 'ReferenceValueCodeId',
        foreignKey: 'EncounterTypeId'
    });
    MRDFileAttachments.belongsTo(models.ReferenceValue, {
        as: 'MRDFileStatus',
        targetKey: 'ReferenceValueCodeId',
        foreignKey: 'MRDFileStatusId'
    });
};
    return MRDFileAttachments as SequelizeStatic.Model<i.MRDFileAttachmentInstance,
        i.MRDFileAttachmentAttributes>;
}
