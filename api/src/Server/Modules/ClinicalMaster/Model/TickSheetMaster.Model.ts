import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TickSheetMasterInstance, i.TickSheetMasterAttributes> {
    let TickSheetMaster = sequelize.define<i.TickSheetMasterInstance, i.TickSheetMasterAttributes>('TickSheetMaster', {
        Id: { type: DataTypes.BIGINT, field: 'TickSheetMasterId', primaryKey: true, autoIncrement: true },
        TickSheetTypeId: { type: DataTypes.BIGINT, field: 'TickSheetTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AccessibleTypeId: { type: DataTypes.BIGINT, field: 'AccessibleTypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        TickSheetName: { type: DataTypes.STRING, field: 'TickSheetName' },
        TickSheetMasterTypeId: { type: DataTypes.BIGINT, field: 'TickSheetMasterTypeId' },
        TickSheetMasterTypeName: { type: DataTypes.STRING, field: 'TickSheetMasterTypeName' },
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
            tableName: 'hims_orderfavorites',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (TickSheetMaster as any).associate = function (models: Models) {
        TickSheetMaster.belongsTo(models.Facility);
        TickSheetMaster.belongsTo(models.Department, { as: 'ParentDepartment', foreignKey: 'DepartmentId' });
        TickSheetMaster.belongsTo(models.ReferenceValue, { as: 'TickSheetType', targetKey: 'ReferenceValueCodeId' });
        TickSheetMaster.belongsTo(models.ReferenceValue, { as: 'TickSheetMasterType', targetKey: 'ReferenceValueCodeId' });
        TickSheetMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        TickSheetMaster.belongsTo(models.ReferenceValue, {
            as: 'AccessibleType', targetKey: 'ReferenceValueCodeId', foreignKey: 'AccessibleTypeId'
        });
        TickSheetMaster.hasMany(models.TickSheetMasterDetail);
    };
    return TickSheetMaster;
}
