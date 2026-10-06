import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RevenueInstance, i.RevenueAttributes> {
    let Revenue = sequelize.define<i.RevenueInstance, i.RevenueAttributes>('Revenue', {
        Id: { type: DataTypes.BIGINT, field: 'RevenueId', primaryKey: true, autoIncrement: true },
        RevenueDate: { type: DataTypes.DATE, field: 'RevenueDate' },
        MISSubgroupId: { type: DataTypes.INTEGER, field: 'MISSubgroupId' },
        MisSubGroup: { type: DataTypes.STRING, field: 'MisSubGroup' },
        BillType: { type: DataTypes.STRING, field: 'BillType' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        ActualAmount: { type: DataTypes.DECIMAL, field: 'ActualAmount' },
        MonthToDay: { type: DataTypes.DECIMAL, field: 'MonthToDay' },
        CurrentYearRevenue: { type: DataTypes.DECIMAL, field: 'CurrentYearRevenue' },
        TotalCurrentYearRevenue: { type: DataTypes.DECIMAL, field: 'TotalCurrentYearRevenue' },
        PreviousYearRevenue: { type: DataTypes.DECIMAL, field: 'PreviousYearRevenue' },
        PreviousYearPercentage: { type: DataTypes.DECIMAL, field: 'PreviousYearPercentage' },
        GrowthInYear: { type: DataTypes.DECIMAL, field: 'GrowthInYear' },
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
            tableName: 'mis_revenue',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return Revenue;
}
