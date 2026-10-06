import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FavoriteMasterInstance, i.FavoriteMasterAttributes> {
    let FavoriteMaster = sequelize.define<i.FavoriteMasterInstance, i.FavoriteMasterAttributes>('FavoriteMaster', {
       Id: { type: DataTypes.BIGINT, field: 'FavoriteMasterId', primaryKey: true, autoIncrement: true  },
       Name: { type: DataTypes.STRING, field: 'Name' },
       FavoriteTypeId: { type: DataTypes.BIGINT, field: 'FavoriteTypeId' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
       UserId: { type: DataTypes.BIGINT, field: 'UserId' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
       AccessibleTypeId: { type: DataTypes.INTEGER, field: 'AccessibleTypeId' },
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
            tableName: 'hims_favoritemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FavoriteMaster as any).associate = function(models: Models) {
                    FavoriteMaster.belongsTo(models.Facility);
                    FavoriteMaster.belongsTo(models.Department);
                    FavoriteMaster.belongsTo(models.User);
                    FavoriteMaster.hasMany(models.FavoriteMasterDetail);
                    FavoriteMaster.belongsTo(models.ReferenceValue, { as: 'FavoriteType', targetKey: 'ReferenceValueCodeId' });
                    FavoriteMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    FavoriteMaster.belongsTo(models.ReferenceValue, { as: 'AccessibleType', targetKey: 'ReferenceValueCodeId' });
                };
 return FavoriteMaster;
}
