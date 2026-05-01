import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CssdGroupItemInstance, i.CssdGroupItemAttributes> {
    let CssdGroupItem = sequelize.define<i.CssdGroupItemInstance, i.CssdGroupItemAttributes>('CssdGroupItem', {
        Id: { type: DataTypes.BIGINT, field: 'CssdGroupItemId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.STRING, field: 'ItemMasterId' },
        CssdItemsetupId: { type: DataTypes.STRING, field: 'CssdItemsetupId' },
        GroupItemId: { type: DataTypes.STRING, field: 'GroupItemId' },
        WashingTypeId: { type: DataTypes.STRING, field: 'WashingTypeId' },
        PackingTypeId: { type: DataTypes.STRING, field: 'PackingTypeId' },
        Quantity: { type: DataTypes.BIGINT, field: 'Quantity' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        //Status: { type: DataTypes.INTEGER, field: 'Status' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'cssdgroupitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CssdGroupItem as any).associate = function(models: Models) {
                    // CarePath.belongsTo(models.Speciality);
                    // CarePath.belongsTo(models.Department);
                    // CarePath.belongsTo(models.Diagnosis);
                    CssdGroupItem.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return CssdGroupItem;
}
