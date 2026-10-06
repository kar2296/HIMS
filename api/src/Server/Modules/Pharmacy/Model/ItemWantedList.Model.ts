import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemWantedListInstance, i.ItemWantedListAttributes> {
    let ItemWantedList = sequelize.define<i.ItemWantedListInstance, i.ItemWantedListAttributes>('ItemWantedList', {
        Id: { type: DataTypes.BIGINT, field: 'ItemWantedListId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        RequestedBy: { type: DataTypes.BIGINT, field: 'RequestedBy' },
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
            tableName: 'hims_itemwantedlist',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ItemWantedList as any).associate = function (models: Models) {
        ItemWantedList.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        ItemWantedList.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
    };
    return ItemWantedList;
}
