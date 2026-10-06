
import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FamilyConditionInstance, i.FamilyConditionAttributes> {
    let FamilyCondition = sequelize.define<i.FamilyConditionInstance, i.FamilyConditionAttributes>('FamilyCondition', {
        Id: { type: DataTypes.BIGINT, field: 'FamilyConditiond', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ConditionTypeId: { type: DataTypes.BIGINT, field: 'ConditionTypeId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        RelationshipId: { type: DataTypes.BIGINT, field: 'RelationshipId' },
        ConditionDate: { type: DataTypes.DATE, field: 'ConditionDate' },
        ConditionStatusId: { type: DataTypes.BIGINT, field: 'ConditionStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'familyconditions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FamilyCondition as any).associate = function(models: Models) {
                    FamilyCondition.belongsTo(models.ReferenceValue, { as: 'ConditionType', targetKey: 'ReferenceValueCodeId' });
                    FamilyCondition.belongsTo(models.ReferenceValue, { as: 'ConditionStatus', targetKey: 'ReferenceValueCodeId' });
                    FamilyCondition.belongsTo(models.ReferenceValue, { as: 'Relationship', targetKey: 'ReferenceValueCodeId' });
                };
 return FamilyCondition;
}
