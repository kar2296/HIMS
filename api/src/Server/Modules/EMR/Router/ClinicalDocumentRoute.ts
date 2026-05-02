import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction, FileUploader } from '../../../Core/Index';
import { ClinicalDocumentService } from '../Service/Index';
import { AppConfig } from '../../../../config/index';
import * as fs from 'fs';
//import { readFileSync, writeFileSync } from 'fs';
//import { readFileSync, existsSync } from 'fs';

let router: Router = express.Router();

router.post('/AddClinicalDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        console.log(req.query.MRN);
        // req.on('data', (data) => {
        //     //console.log(data);
        //     console.log(data.toString());
        //   });

        let uploadPath = AppConfig.UploadFilePath + '/' + req.query.MRN;
        try {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
        } catch (err) {
            console.error(err);
        }
        FileUploader.UploadSingle(req, res, next, { basePath: uploadPath, storage: 'disk' });
        //FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
        service.AddClinicalDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/AddMultipleDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        console.log(req.query.MRN);
        // req.on('data', (data) => {
        //     //console.log(data);
        //     console.log(data.toString());
        //   });

        let uploadPath = AppConfig.UploadFilePath + '/' + req.query.MRN;
        try {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
        } catch (err) {
            console.error(err);
        }
        FileUploader.UploadMultiple(req, res, next, { basePath: uploadPath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
        service.AddMultipleDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/UpdateClinicalDocument',
    (req: Request, res: Response, next: NextFunction): any => {
        FileUploader.UploadSingle(req, res, next, { basePath: AppConfig.UploadFilePath, storage: 'disk' });
    },
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
        service.UpdateClinicalDocument(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetAttachmentFile', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
    service.GetAttachmentFile(req.body)
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
router.post('/GetClinicalDocumentById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
    service.GetClinicalDocumentById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetClinicalDocuments', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
    service.GetClinicalDocuments(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteClinicalDocument', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(ClinicalDocumentService, req);
    service.DeleteClinicalDocument(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
