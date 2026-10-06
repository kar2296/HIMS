import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.NoteTemplateInstance, i.NoteTemplateAttributes> {
    let NoteTemplate = sequelize.define<i.NoteTemplateInstance, i.NoteTemplateAttributes>('NoteTemplate', {
        Id: { type: DataTypes.BIGINT, field: 'NoteTemplateId', primaryKey: true, autoIncrement: true },
        NoteTypeId: { type: DataTypes.BIGINT, field: 'NoteTypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        TemplateName: { type: DataTypes.STRING, field: 'TemplateName' },
        DataTemplate: { type: DataTypes.STRING, field: 'DataTemplate' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'notetemplate',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (NoteTemplate as any).associate = function(models: Models) {
                    NoteTemplate.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    NoteTemplate.belongsTo(models.ReferenceValue, { as: 'NoteType', targetKey: 'ReferenceValueCodeId' });
                    NoteTemplate.belongsTo(models.Department);
                };
 return NoteTemplate;
}
