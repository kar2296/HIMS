import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ImmunizationScheduleInstance, i.ImmunizationScheduleAttributes> {
    let ImmunizationSchedule = sequelize.define<i.ImmunizationScheduleInstance, i.ImmunizationScheduleAttributes>('ImmunizationSchedule', {
        Id: { type: DataTypes.BIGINT, field: 'ImmunizationScheduleId', primaryKey: true, autoIncrement: true },
        ScheduleId: { type: DataTypes.BIGINT, field: 'ScheduleId' },
        ImmunizationId: { type: DataTypes.BIGINT, field: 'ImmunizationId' },
        ImmunizationName: { type: DataTypes.STRING, field: 'ImmunizationName' },
        ScheduleFlagId: { type: DataTypes.BIGINT, field: 'ScheduleFlagId' },
        RouteId: { type: DataTypes.BIGINT, field: 'RouteId' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        DosageId: { type: DataTypes.BIGINT, field: 'DosageId' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        PeriodId: { type: DataTypes.BIGINT, field: 'PeriodId' },
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
            tableName: 'immunizationschedule',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ImmunizationSchedule as any).associate = function(models: Models) {
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, {
                        as: 'ScheduleName',
                        targetKey: 'ReferenceValueCodeId', foreignKey: 'ScheduleId'
                    });
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, { as: 'Dosage', targetKey: 'ReferenceValueCodeId' });
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, { as: 'Route', targetKey: 'ReferenceValueCodeId' });
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, { as: 'ScheduleFlag', targetKey: 'ReferenceValueCodeId' });
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, { as: 'Period', targetKey: 'ReferenceValueCodeId' });
                    ImmunizationSchedule.belongsTo(models.Immunization);
                    ImmunizationSchedule.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ImmunizationSchedule;
}
