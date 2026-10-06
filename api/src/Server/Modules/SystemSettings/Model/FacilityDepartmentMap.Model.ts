import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FacilityDepartmentMapInstance, i.FacilityDepartmentMapAttributes> {
    let FacilityDepartmentMap = sequelize.
        define<i.FacilityDepartmentMapInstance, i.FacilityDepartmentMapAttributes>('FacilityDepartmentMap', {
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId', primaryKey: true },
            CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'facilitydepartmentmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (FacilityDepartmentMap as any).equalComparer = function (current: i.FacilityDepartmentMapAttributes,
        other: i.FacilityDepartmentMapAttributes): boolean {
        /* equalComparer: (current: i.FacilityDepartmentMapAttributes,
             other: i.FacilityDepartmentMapAttributes): boolean => {
             return current &&
                 other &&
                 current.FacilityId === other.FacilityId &&
                 current.DepartmentId === other.DepartmentId;
         } */
        return (current &&
            other && current.FacilityId === other.FacilityId &&
            current.DepartmentId === other.DepartmentId);
    };

    return FacilityDepartmentMap;
}
