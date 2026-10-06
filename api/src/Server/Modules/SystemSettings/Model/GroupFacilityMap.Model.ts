import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GroupFacilityMapInstance, i.GroupFacilityMapAttributes> {
    let GroupFacilityMap = sequelize.define<i.GroupFacilityMapInstance, i.GroupFacilityMapAttributes>('GroupFacilityMap', {
        GroupId: { type: DataTypes.BIGINT, field: 'GroupId', primaryKey: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'groupfacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (GroupFacilityMap as any).equalComparer = function
     (current: i.GroupFacilityMapAttributes,
        other: i.GroupFacilityMapAttributes): boolean {
        return (current &&
            other &&
            current.GroupId === other.GroupId &&
            current.FacilityId === other.FacilityId);
    };

    return GroupFacilityMap;
}
