import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtNotesInstance, i.OtNotesAttributes> {
    let OtNotes = sequelize.define<i.OtNotesInstance, i.OtNotesAttributes>('OtNotes', {
        Id: { type: DataTypes.BIGINT, field: 'OtNotesId', primaryKey: true, autoIncrement: true },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        OtNoteTypeId: { type: DataTypes.BIGINT, field: 'OtNoteTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DataTemplate: { type: DataTypes.INTEGER, field: 'DataTemplate' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'otnotes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OtNotes as any).associate = function(models: Models) {
                    OtNotes.belongsTo(models.Patient);
                    OtNotes.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return OtNotes;
}
