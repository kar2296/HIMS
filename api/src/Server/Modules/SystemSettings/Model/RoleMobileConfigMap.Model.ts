import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RoleMobileConfigMapInstance, i.RoleMobileConfigMapAttributes> {
    let RoleMobileConfigMap = sequelize.define<i.RoleMobileConfigMapInstance, i.RoleMobileConfigMapAttributes>('RoleMobileConfigMap', {
        RoleId: { type: DataTypes.BIGINT, field: 'RoleId', primaryKey: true },
        MobileConfigId: { type: DataTypes.BIGINT, field: 'MobileConfigId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'rolemobileconfigmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (RoleMobileConfigMap as any).equalComparer = function (current: i.RoleMobileConfigMapAttributes,
        other: i.RoleMobileConfigMapAttributes): boolean {
        return (current &&
            other &&
            current.RoleId === other.RoleId &&
            current.MobileConfigId === other.MobileConfigId);
    };

    return RoleMobileConfigMap;
}
