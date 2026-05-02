import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureTemplateInstance, i.ProcedureTemplateAttributes> {
    let ProcedureTemplate = sequelize.define<i.ProcedureTemplateInstance, i.ProcedureTemplateAttributes>('ProcedureTemplate', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureTemplateId', primaryKey: true, autoIncrement: true },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        ProcedureTemplateTypeId: { type: DataTypes.BIGINT, field: 'ProcedureTemplateTypeId' },
        ProcedureTemplateGroupId: { type: DataTypes.BIGINT, field: 'ProcedureTemplateGroupId' },
        ProcedureTemplateCategoryId: { type: DataTypes.BIGINT, field: 'ProcedureTemplateCategoryId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
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
            tableName: 'proceduretemplates',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ProcedureTemplate as any).associate = function(models: Models) {
                    ProcedureTemplate.belongsTo(models.ReferenceValue, { as: 'ProcedureTemplateType',
                            targetKey: 'ReferenceValueCodeId' });
                    ProcedureTemplate.belongsTo(models.ReferenceValue, { as: 'ProcedureTemplateGroup',
                            targetKey: 'ReferenceValueCodeId' });
                    ProcedureTemplate.belongsTo(models.ReferenceValue, { as: 'ProcedureTemplateCategory',
                            targetKey: 'ReferenceValueCodeId' });
                };
 return ProcedureTemplate;
}
