import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ImpressionMasterInstance, i.ImpressionMasterAttributes> {
    let ImpressionMaster = sequelize.define<i.ImpressionMasterInstance,
        i.ImpressionMasterAttributes>('ImpressionMaster', {
            Id: { type: DataTypes.BIGINT, field: 'ImpressionId', primaryKey: true, autoIncrement: true },
            Code: { type: DataTypes.STRING, field: 'Code' },
            Name: { type: DataTypes.STRING, field: 'Name' },
            ImpressionTypeId: { type: DataTypes.BIGINT, field: 'ImpressionTypeId' },
            ImpressionId: { type: DataTypes.BIGINT, field: 'ImpressionId' },
            ImpressionType: { type: DataTypes.STRING, field: 'ImpressionType' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'impressionmaster',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (ImpressionMaster as any).associate = function (models: Models) {
        ImpressionMaster.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        ImpressionMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ImpressionMaster.belongsTo(models.ReferenceValue, {
            as: 'ImpressionTypeRef',
            foreignKey: 'ImpressionTypeId',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return ImpressionMaster;
}
