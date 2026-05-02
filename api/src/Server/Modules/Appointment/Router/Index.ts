import { Router, GetRouter } from '../../../Core/Index';
import AppointmentCategory from './HimsAppointmentCategoryRoute';
import AppointmentSession from './HimsAppointmentSessionRoute';
import AppointmentMultiSession from './HimsAppointmentMultiSessionRoute';
import Appointment from './HimsAppointmentRoute';
import PatientTracker from './HimsPatientTrackerRoute';
import DoctorDisplay from './HimsDoctorDisplayRoute';
import GeneralDisplay from './HimsGeneralDisplayRoute';
import TokenDisplay from './HimsTokenDisplayRoute';
import AppointmentDisplay from './HimsAppointmentDisplayRoute';
import AppointmentRequest from './HimsAppointmentRequestRoute';

let router: Router = GetRouter();
router.use('/AppointmentCategory', AppointmentCategory);
router.use('/AppointmentSession', AppointmentSession);
router.use('/AppointmentMultiSession', AppointmentMultiSession);
router.use('/Appointment', Appointment);
router.use('/PatientTracker', PatientTracker);
router.use('/DoctorDisplay', DoctorDisplay);
router.use('/GeneralDisplay', GeneralDisplay);
router.use('/TokenDisplay', TokenDisplay);
router.use('/AppointmentDisplay', AppointmentDisplay);
router.use('/AppointmentRequest', AppointmentRequest);
export default router;





