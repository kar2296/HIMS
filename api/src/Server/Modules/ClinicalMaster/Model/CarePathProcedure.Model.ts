import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathProcedureInstance, i.CarePathProcedureAttributes> {
    let CarePathProcedure = sequelize.define<i.CarePathProcedureInstance, i.CarePathProcedureAttributes>('CarePathProcedure', {
        Id: { type: DataTypes.BIGINT, field: 'CarePathProcedureId', primaryKey: true, autoIncrement: true },
        CarePathId: { type: DataTypes.BIGINT, field: 'CarePathId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        ProcedureCodeSchemeId: { type: DataTypes.BIGINT, field: 'ProcedureCodeSchemeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        IsManditory: { type: DataTypes.BOOLEAN, field: 'IsManditory' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        Instruction: { type: DataTypes.STRING, field: 'Instruction' },
        FrequencyId: { type: DataTypes.INTEGER, field: 'FrequencyId' },
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
            tableName: 'carepathprocedure',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePathProcedure as any).associate = function(models: Models) {
                    CarePathProcedure.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePathProcedure.belongsTo(models.ReferenceValue, { as: 'ProcedureCodeScheme', targetKey: 'ReferenceValueCodeId' });
                    CarePathProcedure.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
                };
 return CarePathProcedure;
}
