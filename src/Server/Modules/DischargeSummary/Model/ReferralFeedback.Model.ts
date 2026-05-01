import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferralFeedbackInstance, i.ReferralFeedbackAttributes> {
    let ReferralFeedback = sequelize.define<i.ReferralFeedbackInstance, i.ReferralFeedbackAttributes>('ReferralFeedback', {
        Id: { type: DataTypes.BIGINT, field: 'ReferralFeedbackId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        NoteTemplateId: { type: DataTypes.BIGINT, field: 'NoteTemplateId' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralDate: { type: DataTypes.DATE, field: 'ReferralDate' },
        SourceId: { type: DataTypes.BIGINT, field: 'SourceId' },
        DataTemplate: { type: DataTypes.STRING, field: 'DataTemplate' },
        VisitNo: { type: DataTypes.STRING, field: 'VisitNo' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        Address: { type: DataTypes.STRING, field: 'Address' },
        ReferralDoctor: { type: DataTypes.STRING, field: 'ReferralDoctor' },
        ReferralStatusId: { type: DataTypes.INTEGER, field: 'ReferralStatusId' },
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
            tableName: 'referralfeedback',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ReferralFeedback as any).associate = function (models: Models) {
        ReferralFeedback.belongsTo(models.Patient);
        ReferralFeedback.belongsTo(models.ReferenceValue,
            { as: 'CertificateStatus', foreignKey: 'ReferralStatusId', targetKey: 'ReferenceValueCodeId' });
        ReferralFeedback.belongsTo(models.ReferenceValue, {
            as: 'NoteType',
            foreignKey: 'TemplateTypeId', targetKey: 'ReferenceValueCodeId'
        });
        ReferralFeedback.belongsTo(models.ReferenceValue, {
            as: 'ReferralType',
            foreignKey: 'SourceId', targetKey: 'ReferenceValueCodeId'
        });
        ReferralFeedback.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ReferralFeedback.belongsTo(models.User, { as: 'UpdatedByUser', foreignKey: 'UpdatedBy' });
    };
    return ReferralFeedback;
}
