import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { VendorMasterService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import { unlinkSync } from 'fs';

let router: Router = express.Router();

router.post('/AddVendorMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VendorMasterService, req);
        service.AddVendorMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddVendorMasterExcel', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.AddVendorMasterExcel(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorMaster',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(VendorMasterService, req);
        service.UpdateVendorMaster(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAttachment', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetAttachment(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetMaxId', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetMaxId(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorMasterById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorMasterById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorMasters', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorMasters(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorMaster', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.DeleteVendorMaster(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddVendorErpMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.AddVendorErpMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorErpMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.UpdateVendorErpMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorErpMapById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorErpMapById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorErpMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorErpMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorErpMap', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.DeleteVendorErpMap(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/AddVendorContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.AddVendorContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateVendorContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.UpdateVendorContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorContactById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorContactById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorContacts', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorContacts(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteVendorContact', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.DeleteVendorContact(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/MapFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.MapFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocumentFile', (req: Request, res: Response, next: NextFunction): any => {
    res.download(req.body.Data.ImagePath);
});
router.post('/GetFacilities', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetFacilities(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetVendorFacilityMaps', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.GetVendorFacilityMaps(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintSupplierMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.PrintSupplierMasterReport(req.body)
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
router.post('/PrintManufacturerMasterReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(VendorMasterService, req);
    service.PrintManufacturerMasterReport(req.body)
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
