import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceGroupRateMappingInstance, i.ServiceGroupRateMappingAttributes> {
    let ServiceGroupRateMapping = sequelize.define<i.ServiceGroupRateMappingInstance, i.ServiceGroupRateMappingAttributes>
    ('ServiceGroupRateMapping', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceGroupId', primaryKey: true, autoIncrement: true },
        ServiceGroup: { type: DataTypes.STRING, field: 'ServiceGroup' },
        BedTypeId: { type: DataTypes.BIGINT, field: 'BedTypeId' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'servicegroupratemapping',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
        (ServiceGroupRateMapping as any).associate = function (models: Models) {
            ServiceGroupRateMapping.belongsTo(models.ReferenceValue, {
                as: 'BedType',
                foreignKey: 'BedTypeId', targetKey: 'ReferenceValueCodeId'
            });
            ServiceGroupRateMapping.belongsTo(models.ReferenceValue, {
                as: 'ActiveStatus',
                foreignKey: 'ActiveStatusId', targetKey: 'ReferenceValueCodeId'
            });
        };
    return ServiceGroupRateMapping;
}
