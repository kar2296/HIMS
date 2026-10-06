import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppointmentSessionInstance, i.AppointmentSessionAttributes> {
    let AppointmentSession = sequelize.define<i.AppointmentSessionInstance, i.AppointmentSessionAttributes>('AppointmentSession', {
        Id: { type: DataTypes.BIGINT, field: 'AppointmentSessionId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AppointmentSessionTypeId: { type: DataTypes.BIGINT, field: 'AppointmentSessionTypeId' },
        SessionTypeId: { type: DataTypes.BIGINT, field: 'SessionTypeId' },
        ClinicId: { type: DataTypes.BIGINT, field: 'ClinicId' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        ResourceId: { type: DataTypes.BIGINT, field: 'ResourceId' },
        IsOrderMandatory: { type: DataTypes.BOOLEAN, field: 'IsOrderMandatory' },
        IsAllowForceBooking: { type: DataTypes.BOOLEAN, field: 'IsAllowForceBooking' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        IsMonday: { type: DataTypes.BOOLEAN, field: 'IsMonday' },
        IsTuesday: { type: DataTypes.BOOLEAN, field: 'IsTuesday' },
        IsWednesday: { type: DataTypes.BOOLEAN, field: 'IsWednesday' },
        IsThursday: { type: DataTypes.BOOLEAN, field: 'IsThursday' },
        IsFriday: { type: DataTypes.BOOLEAN, field: 'IsFriday' },
        IsSaturday: { type: DataTypes.BOOLEAN, field: 'IsSaturday' },
        IsSunday: { type: DataTypes.BOOLEAN, field: 'IsSunday' },
        IsAll: { type: DataTypes.BOOLEAN, field: 'IsAll' },
        AppointmentSlotTypeId: { type: DataTypes.BIGINT, field: 'AppointmentSlotTypeId' },
        SlotDuration: { type: DataTypes.STRING, field: 'SlotDuration' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        BreakFrom: { type: DataTypes.TIME, field: 'BreakFrom' },
        BreakTo: { type: DataTypes.TIME, field: 'BreakTo' },
        MaxSlotPerDay: { type: DataTypes.INTEGER, field: 'MaxSlotPerDay' },
        NoofScheduleAppt: { type: DataTypes.INTEGER, field: 'NoofScheduleAppt' },
        NoofWalkInPatient: { type: DataTypes.INTEGER, field: 'NoofWalkInPatient' },
        HolidayFrom: { type: DataTypes.DATE, field: 'HolidayFrom' },
        HolidayTo: { type: DataTypes.DATE, field: 'HolidayTo' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'appointmentsessions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AppointmentSession as any).associate = function(models: Models) {
                    AppointmentSession.belongsTo(models.Facility);
                    AppointmentSession.belongsTo(models.ReferenceValue,
                            { as: 'AppointmentSessionType', targetKey: 'ReferenceValueCodeId' });
        AppointmentSession.belongsTo(models.ReferenceValue,
            { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    AppointmentSession.belongsTo(models.User, { foreignKey: 'DoctorId' });
                    AppointmentSession.belongsTo(models.ResourceMaster, { foreignKey: 'ResourceId' });
                    AppointmentSession.belongsTo(models.Speciality, { foreignKey: 'SpecialityId' });
   };
 return AppointmentSession;
}
