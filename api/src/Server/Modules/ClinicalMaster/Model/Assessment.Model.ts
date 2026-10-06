import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssessmentInstance, i.AssessmentAttributes> {
    let Assessment = sequelize.define<i.AssessmentInstance, i.AssessmentAttributes>('Assessment', {
        Id: { type: DataTypes.BIGINT, field: 'AssessmentId', primaryKey: true, autoIncrement: true },
        AssessmentTypeId: { type: DataTypes.BIGINT, field: 'AssessmentTypeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        AssessmentName: { type: DataTypes.STRING, field: 'AssessmentName' },
        SpecialInstruction: { type: DataTypes.STRING, field: 'SpecialInstruction' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'assessments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Assessment as any).associate = function(models: Models) {
                    Assessment.belongsTo(models.SectionMaster, { foreignKey: 'SectionId' });
                    Assessment.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                    Assessment.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Assessment.belongsTo(models.ReferenceValue, { as: 'AssessmentType', targetKey: 'ReferenceValueCodeId' });
                };
 return Assessment;
}
