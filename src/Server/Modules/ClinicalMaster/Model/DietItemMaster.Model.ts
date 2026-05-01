import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DietItemMasterInstance, i.DietItemMasterAttributes> {
    let DietItemMaster = sequelize.define<i.DietItemMasterInstance, i.DietItemMasterAttributes>('DietItemMaster', {
        Id: { type: DataTypes.BIGINT, field: 'DietItemId', primaryKey: true, autoIncrement: true },
        DietItemCode: { type: DataTypes.STRING, field: 'DietItemCode' },
        DietName: { type: DataTypes.STRING, field: 'DietName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        DietItemTypeId: { type: DataTypes.BIGINT, field: 'DietItemTypeId' },
        DietCategoryId: { type: DataTypes.BIGINT, field: 'DietCategoryId' },
        DietFrequencyId: { type: DataTypes.BIGINT, field: 'DietFrequencyId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'dietitemmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DietItemMaster as any).associate = function (models: Models) {
        DietItemMaster.belongsTo(models.ReferenceValue, { as: 'DietFrequency', targetKey: 'ReferenceValueCodeId' });
        DietItemMaster.belongsTo(models.ReferenceValue, { as: 'DietCategory', targetKey: 'ReferenceValueCodeId' });
        DietItemMaster.belongsTo(models.ReferenceValue, { as: 'DietItemType', targetKey: 'ReferenceValueCodeId' });
        DietItemMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        DietItemMaster.belongsTo(models.ServiceItem, { foreignKey: 'DietItemId', targetKey: 'MasterItemId' });
    };
    return DietItemMaster;
}
