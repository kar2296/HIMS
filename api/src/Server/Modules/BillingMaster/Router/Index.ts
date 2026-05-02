import {Router, GetRouter } from '../../../Core/Index';
import ProcedureServices from './ProcedureServicesRoute';
import ServiceGroupRateMapping from './ServiceGroupRateMappingRouter';
import PatientEstimation from './PatientEstimationRouter';
import PatientEstimationDetails from './PatientEstimationDetailsRouter';

let router: Router = GetRouter();
router.use('/ProcedureServices', ProcedureServices);
router.use('/ServiceGroupRateMapping', ServiceGroupRateMapping);
router.use('/PatientEstimation', PatientEstimation);
router.use('/PatientEstimationDetails', PatientEstimationDetails);

export default router;
