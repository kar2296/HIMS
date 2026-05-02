import {Router, GetRouter } from '../../../Core/Index';
import PatientCertificate from './PatientCertificateRoute';
import ReferralFeedback from './ReferralFeedbackRoute';

let router: Router = GetRouter();
router.use('/PatientCertificate', PatientCertificate);
router.use('/ReferralFeedback', ReferralFeedback);
export default router;
