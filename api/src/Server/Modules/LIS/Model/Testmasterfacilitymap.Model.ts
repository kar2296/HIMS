import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestmasterfacilitymapInstance, i.TestmasterfacilitymapAttributes> {
    let Testmasterfacilitymap =
        sequelize.define<i.TestmasterfacilitymapInstance, i.TestmasterfacilitymapAttributes>('Testmasterfacilitymap', {
            TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId', primaryKey: true },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId', primaryKey: true },
            CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'testmasterfacilitymap',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true
            });

    (Testmasterfacilitymap as any).equalComparer = function
            (current: i.TestmasterfacilitymapAttributes,
        other: i.TestmasterfacilitymapAttributes) {
        return (current &&
            other &&
            current.TestmasterId === other.TestmasterId &&
            current.FacilityId === other.FacilityId);
    };

    return Testmasterfacilitymap;
}
