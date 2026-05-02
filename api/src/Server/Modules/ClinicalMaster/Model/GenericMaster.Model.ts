import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GenericMasterInstance, i.GenericMasterAttributes> {
    let GenericMaster = sequelize.define<i.GenericMasterInstance, i.GenericMasterAttributes>('GenericMaster', {
        Id: { type: DataTypes.BIGINT, field: 'GenericId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        AllergenTypeId: { type: DataTypes.BIGINT, field: 'AllergenTypeId' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        IsPrescribed: { type: DataTypes.BOOLEAN, field: 'IsPrescribed' },
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
            tableName: 'genericmasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (GenericMaster as any).associate = function(models: Models) {
                    GenericMaster.belongsTo(models.ReferenceValue, { as: 'AllergenType', targetKey: 'ReferenceValueCodeId' });
                    GenericMaster.belongsTo(models.ReferenceValue, { as: 'ScheduleType', targetKey: 'ReferenceValueCodeId' });
                    GenericMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return GenericMaster;
}
