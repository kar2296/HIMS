import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { GuarantorService} from '../Service/Index';
import { unlinkSync } from 'fs';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.AddGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.UpdateGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantorById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.GetGuarantorById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetGuarantors', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.GetGuarantors(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.DeleteGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetSelfGuarantor', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.GetSelfGuarantor(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/PrintInsuranceListReport', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(GuarantorService, req);
    service.PrintInsuranceListReport(req.body)
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
router.post('/AddGuarantorMasterExcel',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(GuarantorService, req);
        service.AddGuarantorMasterExcel(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
});

export default router;
