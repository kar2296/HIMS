import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ResourceMasterInstance, i.ResourceMasterAttributes> {
    let ResourceMaster = sequelize.define<i.ResourceMasterInstance, i.ResourceMasterAttributes>('ResourceMaster', {
        Id: { type: DataTypes.BIGINT, field: 'ResourceId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ResourceTypeId: { type: DataTypes.BIGINT, field: 'ResourceTypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ResourceCode: { type: DataTypes.STRING, field: 'ResourceCode' },
        ResourceName: { type: DataTypes.STRING, field: 'ResourceName' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'resourcemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ResourceMaster as any).associate = function(models: Models) {
                    ResourceMaster.belongsTo(models.Facility);
                    ResourceMaster.belongsTo(models.Department);
                    ResourceMaster.belongsTo(models.ReferenceValue, { as: 'ResourceType', targetKey: 'ReferenceValueCodeId' });
                    ResourceMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ResourceMaster;
}
