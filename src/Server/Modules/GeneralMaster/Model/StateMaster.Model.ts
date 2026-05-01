import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StateMasterInstance, i.StateMasterAttributes> {
    let StateMaster = sequelize.define<i.StateMasterInstance, i.StateMasterAttributes>('StateMaster', {
        Id: { type: DataTypes.BIGINT, field: 'StateId', primaryKey: true, autoIncrement: true },
        StateName: { type: DataTypes.STRING, field: 'StateName' },
        StateCode: { type: DataTypes.STRING, field: 'StateCode' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
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
            tableName: 'statemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (StateMaster as any).associate = function(models: Models) {
                    StateMaster.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
                    StateMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return StateMaster;
}
