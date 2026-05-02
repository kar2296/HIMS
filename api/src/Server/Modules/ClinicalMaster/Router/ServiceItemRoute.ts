import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ServiceItemService } from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddServiceItem',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ServiceItemService, req);
        service.AddServiceItem(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateServiceItem',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ServiceItemService, req);
        service.UpdateServiceItem(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetServiceItemById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetServiceItemById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemImage', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetServiceItemImage(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetServiceItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetServiceItemsforSO', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetServiceItemsforSO(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GettraiffServiceItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GettraiffServiceItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMinServiceItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetMinServiceItems(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteServiceItem', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.DeleteServiceItem(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintServiceItems', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.PrintServiceItems(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintServiceItemsOp', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.PrintServiceItemsOp(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintServiceItemsIP', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.PrintServiceItemsIP(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/PrintServiceItemRateDetails', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ServiceItemService, req);
    service.PrintServiceItemRateDetails(req.body)
        .then((response) => {
            if (!req.transaction.finished) {
                req.transaction.commit();
            }
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
router.post('/AddServiceMasterExcel',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ServiceItemService, req);
        service.AddServiceMasterExcel(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});
export default router;
