import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferenceValueGroupInstance, i.ReferenceValueGroupAttributes> {
    let ReferenceValueGroup = sequelize.define<i.ReferenceValueGroupInstance, i.ReferenceValueGroupAttributes>('ReferenceValueGroup', {
        Id: { type: DataTypes.BIGINT, field: 'ReferenceValueGroupId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ScreenId: { type: DataTypes.BIGINT, field: 'ScreenId' },
        GroupCode: { type: DataTypes.STRING, field: 'GroupCode' },
        GroupName: { type: DataTypes.STRING, field: 'GroupName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsSystem: { type: DataTypes.BOOLEAN, field: 'IsSystem' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsSortByDescription: { type: DataTypes.BOOLEAN, field: 'IsSortByDescription' },
        IsActive: { type :DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId : { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'referencevaluegroups',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ReferenceValueGroup as any).associate = function(models: Models) {
                    ReferenceValueGroup.belongsTo(models.Facility);
                    ReferenceValueGroup.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ReferenceValueGroup;
}
