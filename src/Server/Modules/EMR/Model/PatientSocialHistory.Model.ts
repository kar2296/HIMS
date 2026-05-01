import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientSocialHistoryInstance, i.PatientSocialHistoryAttributes> {
    let PatientSocialHistory = sequelize.define<i.PatientSocialHistoryInstance, i.PatientSocialHistoryAttributes>('PatientSocialHistory', {
        Id: { type: DataTypes.BIGINT, field: 'PatientSocialHistoryId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        SocialTypeId: { type: DataTypes.BIGINT, field: 'SocialTypeId' },
        SocialFrequencyId: { type: DataTypes.BIGINT, field: 'SocialFrequencyId' },
        SeverityId: { type: DataTypes.STRING, field: 'SeverityId' },
        ReviewDate: { type: DataTypes.DATE, field: 'ReviewDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        SocialHistoryStatusId: { type: DataTypes.BIGINT, field: 'SocialHistoryStatusId' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
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
            tableName: 'patientsocialhistory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientSocialHistory as any).associate = function(models: Models) {
                    PatientSocialHistory.belongsTo(models.ReferenceValue, { as: 'SocialType', targetKey: 'ReferenceValueCodeId' });
                    PatientSocialHistory.belongsTo(models.ReferenceValue, { as: 'SocialFrequency', targetKey: 'ReferenceValueCodeId' });
                    PatientSocialHistory.belongsTo(models.ReferenceValue, { as: 'Severity', targetKey: 'ReferenceValueCodeId' });
                    PatientSocialHistory.belongsTo(models.ReferenceValue,
                     { as: 'SocialHistoryStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientSocialHistory;
}
