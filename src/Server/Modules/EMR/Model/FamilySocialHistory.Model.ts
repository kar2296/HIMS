import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FamilySocialHistoryInstance, i.FamilySocialHistoryAttributes> {
    let FamilySocialHistory = sequelize.define<i.FamilySocialHistoryInstance, i.FamilySocialHistoryAttributes>('FamilySocialHistory', {
        Id: { type: DataTypes.BIGINT, field: 'FamilySocialHistoryId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        RelationshipId: { type: DataTypes.BIGINT, field: 'RelationshipId' },
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
            tableName: 'familysocialhistory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FamilySocialHistory as any).associate = function(models: Models) {
                    FamilySocialHistory.belongsTo(models.ReferenceValue, { as: 'SocialType', targetKey: 'ReferenceValueCodeId' });
                    FamilySocialHistory.belongsTo(models.ReferenceValue, { as: 'SocialFrequency', targetKey: 'ReferenceValueCodeId' });
                    FamilySocialHistory.belongsTo(models.ReferenceValue, { as: 'Relationship', targetKey: 'ReferenceValueCodeId' });
                    FamilySocialHistory.belongsTo(models.ReferenceValue, { as: 'Severity', targetKey: 'ReferenceValueCodeId' });
                    FamilySocialHistory.belongsTo(models.ReferenceValue, { as: 'SocialHistoryStatus', targetKey: 'ReferenceValueCodeId'});
                };
 return FamilySocialHistory;
}
