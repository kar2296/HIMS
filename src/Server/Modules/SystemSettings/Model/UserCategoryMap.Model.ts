import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserCategoryMapInstance, i.UserCategoryMapAttributes> {
    let UserCategoryMap = sequelize.define<i.UserCategoryMapInstance, i.UserCategoryMapAttributes>('UserCategoryMap', {
        Id: { type: DataTypes.BIGINT, field: 'Id', primaryKey: true, autoIncrement: true },
        Rev: { type: DataTypes.INTEGER, field: 'Rev', defaultValue: 0 },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' }, // Changed from FacilityId to CategoryId
        Status: { type: DataTypes.INTEGER, field: 'Status', defaultValue: 1 }, // Added Status field
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'usercategorymap', // Changed table name
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (UserCategoryMap as any).associate = function (models: any) {
        UserCategoryMap.belongsTo(models.User, { as: 'User', foreignKey: 'UserId' });
        UserCategoryMap.belongsTo(models.VirtualCategory, { as: 'Category', foreignKey: 'CategoryId' }); // Changed association
    };
    return UserCategoryMap;
}

