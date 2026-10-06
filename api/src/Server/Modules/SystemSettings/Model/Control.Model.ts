import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ControlInstance, i.ControlAttributes> {
    let Control = sequelize.define<i.ControlInstance, i.ControlAttributes>('Control', {
        Id: { type: DataTypes.BIGINT, field: 'ControlId', primaryKey: true, autoIncrement: true },
        ParentControlId: { type: DataTypes.BIGINT, field: 'ParentControlId' },
        ModuleId: { type: DataTypes.BIGINT, field: 'ModuleId' },
        ModuleCode: { type: DataTypes.STRING, field: 'ModuleCode' },
        Context: { type: DataTypes.STRING, field: 'Context' },
        ControlCode: { type: DataTypes.STRING, field: 'ControlCode' },
        ParentControlCode: { type: DataTypes.STRING, field: 'ParentControlCode' },
        ControlType: { type: DataTypes.STRING, field: 'ControlType' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ControlPosition: { type: DataTypes.STRING, field: 'ControlPosition' },
        Display: { type: DataTypes.STRING, field: 'Display' },
        SRef: { type: DataTypes.STRING, field: 'SRef' },
        IconRef: { type: DataTypes.STRING, field: 'IconRef' },
        TranslateRef: { type: DataTypes.STRING, field: 'TranslateRef' },
        Params: { type: DataTypes.STRING, field: 'Params' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
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
            tableName: 'controls',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Control as any).associate = function(models: Models) {
                    Control.belongsToMany(models.Role, { through: models.RoleControlMap });
                    Control.belongsToMany(models.Context, { through: models.ContextControlMap });
                    Control.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Control.belongsTo(models.Control, { as: 'ParentControl', foreignKey: 'ParentControlId' });
                };
 return Control;
}
