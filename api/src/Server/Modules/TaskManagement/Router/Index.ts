import {Router, GetRouter } from '../../../Core/Index';
import TaskManagement from './TaskManagementRoute';
import IncidentManagement from './IncidentManagementRoute';


let router: Router = GetRouter();
router.use('/TaskManagement', TaskManagement);
router.use('/IncidentManagement', IncidentManagement);
export default router;
