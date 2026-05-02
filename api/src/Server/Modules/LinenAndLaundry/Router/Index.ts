import { Router, GetRouter } from '../../../Core/Index';
import LinenItemMaster from './LinenItemMasterRoute';
import LinenStockItems from './LinenStockItemsRoute';
import LinenStockTransfer from './LinenStockTransferRoute';
import LinenStockTransferDetail from './LinenStockTransferDetailRoute';
import LinenStockEntry from './LinenStockEntryRoute';
import LinenStockEntryDetail from './LinenStockEntryDetailRoute';
import LinenDashboard from './LinenDashboardRoute';


let router: Router = GetRouter();
router.use('/LinenItemMaster', LinenItemMaster);
router.use('/LinenStockItems', LinenStockItems);
router.use('/LinenStockTransfer', LinenStockTransfer);
router.use('/LinenStockTransferDetail', LinenStockTransferDetail);
router.use('/LinenStockEntry', LinenStockEntry);
router.use('/LinenStockEntryDetail', LinenStockEntryDetail);
router.use('/LinenDashboard', LinenDashboard);
export default router;
