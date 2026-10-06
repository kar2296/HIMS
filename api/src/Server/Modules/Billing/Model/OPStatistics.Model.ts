import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OPStatisticsInstance, i.OPStatisticsAttributes> {
    let OPStatistics = sequelize.define<i.OPStatisticsInstance, i.OPStatisticsAttributes>('OPStatistics', {
        Id: { type: DataTypes.BIGINT, field: 'OPStatusticId', primaryKey: true, autoIncrement: true },
        VisitDate: { type: DataTypes.DATE, field: 'VisitDate' },
        EncounteType: { type: DataTypes.STRING, field: 'EncounteType' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        PatientCount: { type: DataTypes.INTEGER, field: 'PatientCount' },
        MonthToDay: { type: DataTypes.DECIMAL, field: 'MonthToDay' },
        CurrentYearCount: { type: DataTypes.DECIMAL, field: 'CurrentYearCount' },
        TotalCurrentYearCount: { type: DataTypes.DECIMAL, field: 'TotalCurrentYearCount' },
        CurrentYearPercentage: { type: DataTypes.DECIMAL, field: 'CurrentYearPercentage' },
        PreviousYearCount: { type: DataTypes.DECIMAL, field: 'PreviousYearCount' },
        TotalPreviousYearCount: { type: DataTypes.DECIMAL, field: 'TotalPreviousYearCount' },
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
            tableName: 'mis_opstatistics',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return OPStatistics;
}
