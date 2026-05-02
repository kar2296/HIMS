import { Router, GetRouter } from '../../../Core/Index';
import DoctorInvoice from './DoctorInvoiceRoute';
import DoctorInvoiceDetails from './DoctorInvoiceDetailsRoute';
import DoctorPayment from './DoctorPaymentRoute';
import DoctorPaymentDetails from './DoctorPaymentDetailsRoute';

let router: Router = GetRouter();
router.use('/DoctorInvoice', DoctorInvoice);
router.use('/DoctorInvoiceDetails', DoctorInvoiceDetails);
router.use('/DoctorPayment', DoctorPayment);
router.use('/DoctorPaymentDetails', DoctorPaymentDetails);
export default router;
