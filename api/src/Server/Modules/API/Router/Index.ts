import { Router, GetRouter } from '../../../Core/Index';
import Options from '../../../Modules/General/Router/Index';
import Billing from '../../../Modules/Billing/Router/Index';
import Asset from '../../../Modules/AssetManagement/Router/Index';
import LIS from '../../../Modules/LIS/Router/Index';

let router: Router = GetRouter();
router.use('/Lookup', Options);
router.use('/APIBill', Billing);
router.use('/APIAsset', Asset);
router.use('/APILIS', LIS);
export default router;
