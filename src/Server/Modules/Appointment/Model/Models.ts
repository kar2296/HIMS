import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        AppointmentCategory: SequelizeStatic.Model<i.AppointmentCategoryInstance, i.AppointmentCategoryAttributes>;
        AppointmentSession: SequelizeStatic.Model<i.AppointmentSessionInstance, i.AppointmentSessionAttributes>;
        AppointmentMultiSession: SequelizeStatic.Model<i.AppointmentMultiSessionInstance, i.AppointmentMultiSessionAttributes>;
        Appointment: SequelizeStatic.Model<i.AppointmentInstance, i.AppointmentAttributes>;
        PatientTracker: SequelizeStatic.Model<i.PatientTrackerInstance, i.PatientTrackerAttributes>;
        DoctorDisplay: SequelizeStatic.Model<i.DoctorDisplayInstance, i.DoctorDisplayAttributes>;
        GeneralDisplay: SequelizeStatic.Model<i.GeneralDisplayInstance, i.GeneralDisplayAttributes>;
        TokenDisplay: SequelizeStatic.Model<i.TokenDisplayInstance, i.TokenDisplayAttributes>;
        AppointmentDisplay: SequelizeStatic.Model<i.AppointmentDisplayInstance, i.AppointmentDisplayAttributes>;
        AppointmentRequest: SequelizeStatic.Model<i.AppointmentRequestInstance, i.AppointmentRequestAttributes>;
    }
}
