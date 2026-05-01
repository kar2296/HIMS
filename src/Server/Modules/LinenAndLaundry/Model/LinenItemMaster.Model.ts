import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenItemMasterInstance, i.LinenItemMasterAttributes> {
    let LinenItemMaster = sequelize.define<i.LinenItemMasterInstance, i.LinenItemMasterAttributes>('LinenItemMaster', {
        Id: { type: DataTypes.BIGINT, field: 'LinenItemMasterId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        LinenTypeId: { type: DataTypes.BIGINT, field: 'LinenTypeId' },
        LinenCategoryId: { type: DataTypes.BIGINT, field: 'LinenCategoryId' },
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
            tableName: 'linenitemmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (LinenItemMaster as any).associate = function(models: Models) {
                LinenItemMaster.belongsTo(models.Facility);
                LinenItemMaster.hasOne(models.LinenStockItems, { foreignKey: 'LinenItemMasterId' });
                LinenItemMaster.belongsTo(models.ReferenceValue, { as: 'LinenType', targetKey: 'ReferenceValueCodeId' });
                LinenItemMaster.belongsTo(models.ReferenceValue, { as: 'LinenCategory', targetKey: 'ReferenceValueCodeId' });
                LinenItemMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };

 return LinenItemMaster;
}
