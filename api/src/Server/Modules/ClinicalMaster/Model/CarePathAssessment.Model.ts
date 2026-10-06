import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathAssessmentInstance, i.CarePathAssessmentAttributes> {
    let CarePathAssessment = sequelize.define<i.CarePathAssessmentInstance, i.CarePathAssessmentAttributes>('CarePathAssessment', {
        Id: { type: DataTypes.BIGINT, field: 'CarePathAssessmentId', primaryKey: true, autoIncrement: true },
        CarePathId: { type: DataTypes.BIGINT, field: 'CarePathId' },
        AssessmentId: { type: DataTypes.BIGINT, field: 'AssessmentId' },
        AssessmentTypeId: { type: DataTypes.BIGINT, field: 'AssessmentTypeId' },
        IsManditory: { type: DataTypes.BOOLEAN, field: 'IsManditory' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'carepathassessment',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePathAssessment as any).associate = function(models: Models) {
                    CarePathAssessment.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePathAssessment.belongsTo(models.ReferenceValue, { as: 'AssessmentType', targetKey: 'ReferenceValueCodeId' });
                    CarePathAssessment.belongsTo(models.Assessment, { foreignKey: 'AssessmentId' });
                };
 return CarePathAssessment;
}
