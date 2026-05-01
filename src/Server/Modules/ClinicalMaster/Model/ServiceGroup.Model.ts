import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceGroupInstance, i.ServiceGroupAttributes> {
    let ServiceGroup = sequelize.define<i.ServiceGroupInstance, i.ServiceGroupAttributes>('ServiceGroup', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceGroupId', primaryKey: true, autoIncrement: true },
        ServiceGroupCode: { type: DataTypes.STRING, field: 'ServiceGroupCode' },
        ServiceGroupName: { type: DataTypes.STRING, field: 'ServiceGroupName' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        SourceTypeId: { type: DataTypes.BIGINT, field: 'SourceTypeId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
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
            tableName: 'servicegroups',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return ServiceGroup;
}
