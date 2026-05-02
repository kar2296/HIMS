import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';

declare global {
    interface Models {
        OtRequest: SequelizeStatic.Model<i.OtRequestInstance, i.OtRequestAttributes>;
        SurgeryEntry: SequelizeStatic.Model<i.SurgeryEntryInstance, i.SurgeryEntryAttributes>;
        OtPatientEquipments: SequelizeStatic.Model<i.OtPatientEquipmentsInstance, i.OtPatientEquipmentsAttributes>;
        OtNotes: SequelizeStatic.Model<i.OtNotesInstance, i.OtNotesAttributes>;
        OtDocument: SequelizeStatic.Model<i.OtDocumentInstance, i.OtDocumentAttributes>;
        OtSchedule: SequelizeStatic.Model<i.OtScheduleInstance, i.OtScheduleAttributes>;
        SurgeryRoomMaster: SequelizeStatic.Model<i.SurgeryRoomMasterInstance, i.SurgeryRoomMasterAttributes>;
        OtScheduleDetails: SequelizeStatic.Model<i.OtScheduleDetailsInstance, i.OtScheduleDetailsAttributes>;
        SurgeryEntryDetails: SequelizeStatic.Model<i.SurgeryEntryDetailsInstance, i.SurgeryEntryDetailsAttributes>;
    }
}
