import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SystemMasterInstance, i.SystemMasterAttributes> {
    let SystemMaster = sequelize.define<i.SystemMasterInstance, i.SystemMasterAttributes>('SystemMaster', {
        Id: { type: DataTypes.BIGINT, field: 'SystemMasterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        SystemName: { type: DataTypes.STRING, field: 'SystemName' },
        SystemTypeId: { type: DataTypes.BIGINT, field: 'SystemTypeId' },
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
            tableName: 'systemmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (SystemMaster as any).associate = function(models: Models) {
                    SystemMaster.belongsTo(models.Facility);
                    SystemMaster.belongsTo(models.ReferenceValue, { as: 'SystemType', targetKey: 'ReferenceValueCodeId' });
                    SystemMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return SystemMaster;
}
