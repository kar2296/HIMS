import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientImmunizationScheduleInstance, i.PatientImmunizationScheduleAttributes> {
    let PatientImmunizationSchedule = sequelize.define<i.PatientImmunizationScheduleInstance,
        i.PatientImmunizationScheduleAttributes>('PatientImmunizationSchedule', {
            Id: { type: DataTypes.BIGINT, field: 'PatientImmunizationScheduleId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            ScheduleId: { type: DataTypes.BIGINT, field: 'ScheduleId' },
            ImmunizationId: { type: DataTypes.BIGINT, field: 'ImmunizationId' },
            ImmunizationName: { type: DataTypes.STRING, field: 'ImmunizationName' },
            ScheduleFlagId: { type: DataTypes.BIGINT, field: 'ScheduleFlagId' },
            RouteId: { type: DataTypes.BIGINT, field: 'RouteId' },
            DosageId: { type: DataTypes.BIGINT, field: 'DosageId' },
            Duration: { type: DataTypes.INTEGER, field: 'Duration' },
            PeriodId: { type: DataTypes.BIGINT, field: 'PeriodId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            ImmunizationDate: { type: DataTypes.DATE, field: 'ImmunizationDate' },
            AdministeredDate: { type: DataTypes.DATE, field: 'AdministeredDate' },
            ImmunizationScheduleId: { type: DataTypes.BIGINT, field: 'ImmunizationScheduleId' },
            ImmunizationScheduleStatusId: { type: DataTypes.BIGINT, field: 'ImmunizationScheduleStatusId' },
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
            tableName: 'patientimmunizationschedules',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return PatientImmunizationSchedule;
}
