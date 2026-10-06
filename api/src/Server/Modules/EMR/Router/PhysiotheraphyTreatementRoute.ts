import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { PhysiotheraphyTreatementService} from '../Service/Index';
import { AppConfig } from '../../../../config/index';

let router: Router = express.Router();

router.post('/AddPhysiotheraphyTreatement',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(PhysiotheraphyTreatementService, req);
        service.AddPhysiotheraphyTreatement(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdatePhysiotheraphyTreatement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PhysiotheraphyTreatementService, req);
    service.UpdatePhysiotheraphyTreatement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetDocumentFile', (req: Request, res: Response, next: NextFunction): any => {
    //const service = ServiceFactory.CreateService(PatientAttachmentService, req);
    res.download(req.body.Data.FilePath);
/*
    service.GetAttachmentFile(req.body, res)
        .then((response) => { res.send(response); })
        .catch(next);
        */
});
router.post('/GetPhysiotheraphyTreatementById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PhysiotheraphyTreatementService, req);
    service.GetPhysiotheraphyTreatementById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetPhysiotheraphyTreatements', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PhysiotheraphyTreatementService, req);
    service.GetPhysiotheraphyTreatements(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeletePhysiotheraphyTreatement', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(PhysiotheraphyTreatementService, req);
    service.DeletePhysiotheraphyTreatement(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
