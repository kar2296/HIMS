import { Router, GetRouter } from '../../../Core/Index';
import OtRequest from './OtRequestRoute';
import SurgeryEntry from './SurgeryEntryRoute';
import OtPatientEquipments from './OtPatientEquipmentsRoute';
import OtNotes from './OtNotesRoute';
import OtDocument from './OtDocumentRoute';
import OtSchedule from './OtScheduleRoute';
import OtDashboard from './OtDashboardRoute';
import SurgeryRoomMaster from './SurgeryRoomMasterRoute';
import OtScheduleDetails from './OtScheduleDetailsRoute';
import SurgeryEntryDetails from './SurgeryEntryDetailsRoute';


let router: Router = GetRouter();
router.use('/OtRequest', OtRequest);
router.use('/SurgeryEntry', SurgeryEntry);
router.use('/OtPatientEquipments', OtPatientEquipments);
router.use('/OtNotes', OtNotes);
router.use('/OtDocument', OtDocument);
router.use('/OtSchedule', OtSchedule);
router.use('/OtDashboard', OtDashboard);
router.use('/SurgeryRoomMaster', SurgeryRoomMaster);
router.use('/OtScheduleDetails', OtScheduleDetails);
router.use('/SurgeryEntryDetails', SurgeryEntryDetails);
export default router;
