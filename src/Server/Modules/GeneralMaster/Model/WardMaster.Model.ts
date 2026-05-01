import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardMasterInstance, i.WardMasterAttributes> {
    let WardMaster = sequelize.define<i.WardMasterInstance, i.WardMasterAttributes>('WardMaster', {
        Id: { type: DataTypes.BIGINT, field: 'WardId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        WardTypeId: { type: DataTypes.BIGINT, field: 'WardTypeId' },
        IsTempWard: { type: DataTypes.BOOLEAN, field: 'IsTempWard' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        WardName: { type: DataTypes.STRING, field: 'WardName' },
        WardMasterTypeId: { type: DataTypes.INTEGER, field: 'WardMasterTypeId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        BlockId: { type: DataTypes.BIGINT, field: 'BlockId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
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
            tableName: 'wardmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (WardMaster as any).associate = function (models: Models) {
        WardMaster.belongsTo(models.Facility);
        WardMaster.belongsTo(models.ServiceRateCategory);
        WardMaster.belongsTo(models.LocationMaster, { foreignKey: 'LocationId' });
        WardMaster.belongsTo(models.ReferenceValue, { as: 'Block', targetKey: 'ReferenceValueCodeId' });
        WardMaster.belongsTo(models.ReferenceValue, { as: 'WardType', targetKey: 'ReferenceValueCodeId' });
        WardMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return WardMaster;
}
