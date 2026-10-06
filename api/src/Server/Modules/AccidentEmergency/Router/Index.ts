import {Router, GetRouter } from '../../../Core/Index';
import AERegistration from './HimsAERegistrationRoute';
import AETriage from './HimsAETriageRoute';

let router: Router = GetRouter();
router.use('/AERegistration', AERegistration);
router.use('/AETriage', AETriage);
export default router;
