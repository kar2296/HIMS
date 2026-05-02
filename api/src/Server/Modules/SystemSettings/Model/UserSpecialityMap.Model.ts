import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserSpecialityMapInstance, i.UserSpecialityMapAttributes> {
    let UserSpecialityMap = sequelize.define<i.UserSpecialityMapInstance, i.UserSpecialityMapAttributes>('UserSpecialityMap', {
        UserId: { type: DataTypes.BIGINT, field: 'UserId', primaryKey: true },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'userspecialitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (UserSpecialityMap as any).equalComparer = function (current: i.UserSpecialityMapAttributes,
        other: i.UserSpecialityMapAttributes): boolean {
        /*
        equalComparer: (current: i.UserSpecialityMapAttributes,
                other: i.UserSpecialityMapAttributes): boolean => {
                return current &&
                    other &&
                    current.UserId === other.UserId &&
                    current.SpecialityId === other.SpecialityId;
            }
            */
        return (current &&
            other &&
            current.UserId === other.UserId &&
            current.SpecialityId === other.SpecialityId);
    };

    return UserSpecialityMap;
}
