import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TermInstance, i.TermAttributes> {
    let Term = sequelize.define<i.TermInstance, i.TermAttributes>('Term', {
        Id: { type: DataTypes.BIGINT, field: 'TermId', primaryKey: true, autoIncrement: true },
        ConceptId: { type: DataTypes.BIGINT, field: 'ConceptId' },
        TermName: { type: DataTypes.STRING, field: 'TermName' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
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
            tableName: 'hims_templateparamterms',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                },
                order: [
                    ['DisplayOrder', 'ASC']
                ]
            }
        });



    return Term;
}
