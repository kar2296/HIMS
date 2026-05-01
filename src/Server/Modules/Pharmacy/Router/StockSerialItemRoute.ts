import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { StockSerialItemService } from '../Service/Index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddStockSerialItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.AddStockSerialItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockSerialItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.UpdateStockSerialItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateBarcodeStockItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.UpdateBarcodeStockItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateStockSerialItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.UpdateStockSerialItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockSerialItemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetStockSerialItemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockSerialItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetStockSerialItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetValueStockSerialItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetValueStockSerialItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
// router.post('/GetStockSerialItemsWithMovements', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(StockSerialItemService, req);
//     service.GetStockSerialItemsWithMovements(req.body)
//         .then((response) => { res.send(response); })
//         .catch(next);
// });
router.post('/GetStockSummaryByProductGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetStockSummaryByProductGst(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetStockSerialItemsforNonMovements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetStockSerialItemsforNonMovements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetExpiredSerialItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.GetExpiredSerialItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteStockSerialItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.DeleteStockSerialItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintMedicineExpiryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintMedicineExpiryReport(req.body)
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
router.post('/PrintMedicineExpiredReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintMedicineExpiredReport(req.body)
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
router.post('/PrintStockSummaryByProductGst', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockSummaryByProductGst(req.body)
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
router.post('/PrintPharmacyStockReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintPharmacyStockReport(req.body)
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
router.post('/PrintStockStatusReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockStatusReport(req.body)
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
router.post('/PrintStockStatusGeneralReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockStatusGeneralReport(req.body)
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
router.post('/PrintGeneralStockStatusBatchReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockStatusBatchReport(req.body)
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
router.post('/PrintGeneralStockStatusBatchReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintGeneralStockStatusBatchReport(req.body)
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
router.post('/PrintStockStatusProductSummaryReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockStatusProductSummaryReport(req.body)
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
router.post('/PrintStockNonMovementReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(StockSerialItemService, req);
    service.PrintStockNonMovementReport(req.body)
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
// router.post('/PrintDailyStockMovement', (req: Request, res: Response, next: NextFunction): any => {
//     const service = ServiceFactory.CreateService(StockSerialItemService, req);
//     service.PrintDailyStockMovement(req.body)
//         .then((response) => {
//             res.download(response.filename, (err) => {
//                 if (response) {
//                     unlinkSync(response.filename);
//                 }
//                 if (err) {
//                     return next(err);
//                 }
//             });
//         })
//         .catch(next);
// });
export default router;
