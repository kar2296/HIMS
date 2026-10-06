import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemFacilityMapInstance, i.ServiceItemFacilityMapAttributes> {
    let ServiceItemFacilityMap = sequelize.define<i.ServiceItemFacilityMapInstance,
        i.ServiceItemFacilityMapAttributes>('ServiceItemFacilityMap', {
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId', primaryKey: true },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'serviceitemfacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

    (ServiceItemFacilityMap as any).equalComparer = function
     (current: i.ServiceItemFacilityMapAttributes,
        other: i.ServiceItemFacilityMapAttributes): boolean {
        /*
        equalComparer: (current: i.ServiceItemFacilityMapAttributes,
                            other: i.ServiceItemFacilityMapAttributes): boolean => {
                            return current &&
                                other &&
                                current.ServiceItemId === other.ServiceItemId &&
                                current.FacilityId === other.FacilityId;
                        }*/
        return (current &&
            other &&
            current.ServiceItemId === other.ServiceItemId &&
            current.FacilityId === other.FacilityId);

    };

    (ServiceItemFacilityMap as any).associate = function (models: Models) {
        ServiceItemFacilityMap.belongsTo(models.ServiceItem);
        ServiceItemFacilityMap.belongsTo(models.Facility);
    };

    return ServiceItemFacilityMap;
}
