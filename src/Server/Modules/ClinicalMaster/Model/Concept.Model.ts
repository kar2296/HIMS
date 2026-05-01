import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ConceptInstance, i.ConceptAttributes> {
    let Concept = sequelize.define<i.ConceptInstance, i.ConceptAttributes>('Concept', {
        Id: { type: DataTypes.BIGINT, field: 'ConceptId', primaryKey: true, autoIncrement: true },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        ConceptName: { type: DataTypes.STRING, field: 'ConceptName' },
        ConceptIdentifier: { type: DataTypes.STRING, field: 'ConceptIdentifier' },
        ValueTypeId: { type: DataTypes.BIGINT, field: 'ValueTypeId' },
        IsMultiple: { type: DataTypes.BOOLEAN, field: 'IsMultiple' },
        IsMandatory: { type: DataTypes.BOOLEAN, field: 'IsMandatory' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        Attributes: { type: DataTypes.STRING, field: 'Attributes' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'hims_templateparametervalues',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                // where: {
                //     Status: 1
                // },
                order: [
                    ['DisplayOrder', 'ASC']
                ]
            }
        });

    (Concept as any).associate = function (models: Models) {
        Concept.belongsTo(models.ReferenceValue, { as: 'ValueType', targetKey: 'ReferenceValueCodeId' });
        Concept.hasMany(models.Term);
    };

    return Concept;
}
