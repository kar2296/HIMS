import {Router, GetRouter } from '../../../Core/Index';
import Options from './OptionsRoute';
import Upload from './FileRoute';
import SequenceMasters from './SequenceMastersRoute';
import EntityPrintHistory from './EntityPrintHistoryRoute';
import Swostha from './SwosthaRoute';

let router: Router = GetRouter();
router.use('/Options', Options);
router.use('/File', Upload);
router.use('/SequenceMasters', SequenceMasters);
router.use('/EntityPrintHistory', EntityPrintHistory);
router.use('/Swostha', Swostha);
export default router;
