import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RoleFacilityMapInstance, i.RoleFacilityMapAttributes> {
    let RoleFacilityMap = sequelize.define<i.RoleFacilityMapInstance, i.RoleFacilityMapAttributes>('RoleFacilityMap', {
        RoleId: { type: DataTypes.BIGINT, field: 'RoleId', primaryKey: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'rolefacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (RoleFacilityMap as any).equalComparer = function (current: i.RoleFacilityMapAttributes,
        other: i.RoleFacilityMapAttributes): boolean {
        return (current &&
            other &&
            current.RoleId === other.RoleId &&
            current.FacilityId === other.FacilityId);
    };

    return RoleFacilityMap;
}
