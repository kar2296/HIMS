import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureAliasInstance, i.ProcedureAliasAttributes> {
    let ProcedureAlias = sequelize.define<i.ProcedureAliasInstance, i.ProcedureAliasAttributes>('ProcedureAlias', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureAliasId', primaryKey: true, autoIncrement: true },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        AliasName: { type: DataTypes.STRING, field: 'AliasName' },
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
            tableName: 'procedurealias',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return ProcedureAlias;
}
