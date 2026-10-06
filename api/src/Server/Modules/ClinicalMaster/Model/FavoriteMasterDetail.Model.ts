import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FavoriteMasterDetailInstance, i.FavoriteMasterDetailAttributes> {
    let FavoriteMasterDetail = sequelize.define<i.FavoriteMasterDetailInstance, i.FavoriteMasterDetailAttributes>('FavoriteMasterDetail', {
        Id: { type: DataTypes.BIGINT, field: 'FavoriteMasterDetailId', primaryKey: true, autoIncrement: true },
        FavoriteMasterId: { type: DataTypes.BIGINT, field: 'FavoriteMasterId' },
        FavoriteTypeId: { type: DataTypes.BIGINT, field: 'FavoriteTypeId' },
        ItemId: { type: DataTypes.BIGINT, field: 'ItemId' },
        DisplayName: { type: DataTypes.STRING, field: 'DisplayName' },
        GroupName: { type: DataTypes.STRING, field: 'GroupName' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_favoritemasterdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return FavoriteMasterDetail;
}
