import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StoreUserMapInstance, i.StoreUserMapAttributes> {
    let StoreUserMap = sequelize.define<i.StoreUserMapInstance, i.StoreUserMapAttributes>('StoreUserMap', {
        Id: { type: DataTypes.BIGINT, field: 'StoreUserMapId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreCode: { type: DataTypes.STRING, field: 'StoreCode' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        StoreTypeId: { type: DataTypes.BIGINT, field: 'StoreTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'storeusermap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StoreUserMap as any).associate = function (models: Models) {
        StoreUserMap.belongsTo(models.User);
        StoreUserMap.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        StoreUserMap.belongsTo(models.Facility);
        StoreUserMap.belongsTo(models.User, { as: 'UserName', foreignKey: 'CreatedBy' });
        StoreUserMap.belongsTo(models.ReferenceValue, { as: 'UserType', targetKey: 'ReferenceValueCodeId' });
        StoreUserMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return StoreUserMap;
}
