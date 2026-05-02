import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DepartmentLocationInstance, i.DepartmentLocationAttributes> {
    let DepartmentLocation = sequelize.define<i.DepartmentLocationInstance, i.DepartmentLocationAttributes>('DepartmentLocation', {
        Id: { type: DataTypes.BIGINT, field: 'DepartmentLocationId', primaryKey: true, autoIncrement: true },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ItemCategoryId: { type: DataTypes.BIGINT, field: 'ItemCategoryId' },
        SubItemCategoryId: { type: DataTypes.BIGINT, field: 'SubItemCategoryId' },
        OrderToDepartmentId: { type: DataTypes.BIGINT, field: 'OrderToDepartmentId' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
        WorkingFromTime: { type: DataTypes.TIME, field: 'WorkingFromTime' },
        WorkingToTime: { type: DataTypes.TIME, field: 'WorkingToTime' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        IsAllDaysSelected: { type: DataTypes.BOOLEAN, field: 'IsAllDaysSelected' },
        IsMonDaySelected: { type: DataTypes.BOOLEAN, field: 'IsMonDaySelected' },
        IsTueDaySelected: { type: DataTypes.BOOLEAN, field: 'IsTueDaySelected' },
        IsWedDaySelected: { type: DataTypes.BOOLEAN, field: 'IsWedDaySelected' },
        IsThuDaySelected: { type: DataTypes.BOOLEAN, field: 'IsThuDaySelected' },
        IsFriDaySelected: { type: DataTypes.BOOLEAN, field: 'IsFriDaySelected' },
        IsSatDaySelected: { type: DataTypes.BOOLEAN, field: 'IsSatDaySelected' },
        IsSunDaySelected: { type: DataTypes.BOOLEAN, field: 'IsSunDaySelected' },
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
            tableName: 'departmentlocations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return DepartmentLocation;
}
