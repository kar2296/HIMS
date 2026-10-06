import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardUserMapInstance, i.WardUserMapAttributes> {
    let WardUserMap = sequelize.define<i.WardUserMapInstance, i.WardUserMapAttributes>('WardUserMap', {
        Id: { type: DataTypes.BIGINT, field: 'WardUserMapId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        WardName: { type: DataTypes.STRING, field: 'WardName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
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
            tableName: 'wardusermap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (WardUserMap as any).associate = function(models: Models) {
                    WardUserMap.belongsTo(models.User);
                    WardUserMap.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
                    WardUserMap.belongsTo(models.Facility);
                    WardUserMap.belongsTo(models.ReferenceValue, { as: 'UserType', targetKey: 'ReferenceValueCodeId' });
                   // WardUserMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return WardUserMap;
}
