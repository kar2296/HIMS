import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DefaultNotesInstance, i.DefaultNotesAttributes> {
    let DefaultNotes = sequelize.define<i.DefaultNotesInstance, i.DefaultNotesAttributes>('DefaultNotes', {
        Id: { type: DataTypes.BIGINT, field: 'DefaultNoteId', primaryKey: true, autoIncrement: true },
        DefaultNoteTypeId: { type: DataTypes.BIGINT, field: 'DefaultNoteTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        DataTemplate: { type: DataTypes.TEXT, field: 'DataTemplate' },
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
            tableName: 'defaultnotes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DefaultNotes as any).associate = function (models: Models) {
        DefaultNotes.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        DefaultNotes.belongsTo(models.ReferenceValue, { as: 'DefaultNoteType', targetKey: 'ReferenceValueCodeId' });
    };
    return DefaultNotes;
}
