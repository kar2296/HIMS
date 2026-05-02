import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ItemMasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddItemMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ItemMasterService, req);
        service.AddItemMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddItemMasterExcel',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ItemMasterService, req);
        service.AddItemMasterExcel(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateItemMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ItemMasterService, req);
        service.UpdateItemMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetMaxItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/getExcuteStoredProcedure', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.getExcuteStoredProcedure(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemMasterlist', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemMasterlist(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemMastersdashboard', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemMastersdashboard(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForOpeningStock', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForOpeningStock(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForPurchaseOrder', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForPurchaseOrder(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForGRN', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForGRN(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinItemsForGRN', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetMinItemsForGRN(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForStockRequest', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForStockRequest(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForStockTransfer', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForStockTransfer(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForStockConsumption', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForStockConsumption(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemsForStockAdjustment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemsForStockAdjustment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMasterItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetMasterItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemMasterForBillModifications', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemMasterForBillModifications(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGenericItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetGenericItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinGenericItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetMinGenericItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemLogo', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemLogo(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/GetItemFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.ImagePath);
    /*
        service.GetAttachmentFile(req.body, res)
            .then((response) => { res.send(response); })
            .catch(next);
            */
});
router.post('/DeleteItemMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.DeleteItemMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapStores', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.MapStores(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapItemStores', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.MapItemStores(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStores', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetStores(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapFacilityStores', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.MapFacilityStores(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilityStores', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetFacilityStores(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemStoreMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemStoreMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreItemsForOpeningStockEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetStoreItemsForOpeningStockEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetStoreItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreItemMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetStoreItemMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStoreReorderItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetStoreReorderItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInventoryStoreItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetInventoryStoreItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInventoryItemsforGRN', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetInventoryItemsforGRN(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetInventoryAdjustItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetInventoryAdjustItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyStoreItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetPharmacyStoreItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyStoreItemsForNonZero', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetPharmacyStoreItemsForNonZero(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetAllPharmacyStoreItemsForNonZero', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetAllPharmacyStoreItemsForNonZero(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyStoreItemForVendorReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetPharmacyStoreItemForVendorReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPharmacyStoreItemsForDirectReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetPharmacyStoreItemsForDirectReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddItemVendorMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.AddItemVendorMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemVendorMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.UpdateItemVendorMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemVendorMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemVendorMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemVendorMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemVendorMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorItemsToReturn', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetVendorItemsToReturn(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemVendorMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.DeleteItemVendorMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddItemCustomerMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.AddItemCustomerMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateItemCustomerMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.UpdateItemCustomerMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemCustomerMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemCustomerMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemCustomerMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemCustomerMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteItemCustomerMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.DeleteItemCustomerMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetItemFacilityMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.GetItemFacilityMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintItemMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.PrintItemMasterReport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});
router.post('/PrintItemPricereport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ItemMasterService, req);
    service.PrintItemPricereport(req.body)
        .then((response) => {
            res.download(response.filename, (err) => {
                if (response) {
                    unlinkSync(response.filename);
                }
                if (err) {
                    return next(err);
                }
            });
        })
        .catch(next);
});

export default router;
