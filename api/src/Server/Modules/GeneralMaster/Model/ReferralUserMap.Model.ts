import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferralUserMapInstance, i.ReferralUserMapAttributes> {
    let ReferralUserMap = sequelize.define<i.ReferralUserMapInstance, i.ReferralUserMapAttributes>('ReferralUserMap', {
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId', primaryKey: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'referralusermap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (ReferralUserMap as any).equalComparer = function (current: i.ReferralUserMapAttributes,
        other: i.ReferralUserMapAttributes): boolean {
        /*
        equalComparer: (current: i.ReferralUserMapAttributes,
            other: i.ReferralUserMapAttributes): boolean => {
            return current &&
                other &&
                current.ReferralId === other.ReferralId &&
                current.UserId === other.UserId;
        }
         */
        return (current &&
            other &&
            current.ReferralId === other.ReferralId &&
            current.UserId === other.UserId);
    };

    return ReferralUserMap;
}
